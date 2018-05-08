/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var isNumeric = require('fast-isnumeric');

var Lib = require('../../lib');
var Axes = require('../../plots/cartesian/axes');
var extendDeep = require('../../lib/extend').extendDeep;


// outlier definition based on http://www.physics.csbsju.edu/stats/box2.html
module.exports = function calc(gd, trace) {
    var xa = Axes.getFromId(gd, trace.xaxis || 'x'),
        ya = Axes.getFromId(gd, trace.yaxis || 'y'),
        orientation = trace.orientation,
        fullLayout = gd._fullLayout,
        cd = [], box,
        valAxis, valLetter, val, valBinned,
        posAxis, posLetter, pos, posDistinct, dPos;

    // Set value (val) and position (pos) keys via orientation
    if(orientation === 'h') {
        valAxis = xa;
        valLetter = 'x';
        posAxis = ya;
        posLetter = 'y';
    } else {
        valAxis = ya;
        valLetter = 'y';
        posAxis = xa;
        posLetter = 'x';
    }

    // In vertical (horizontal) box plots:
    // if no x (y) data, use x0 (y0), or name
    // so if you want one box
    // per trace, set x0 (y0) to the x (y) value or category for this trace
    // (or set x (y) to a constant array matching y (x))
    function getPos(trace, posLetter, posAxis, val, num) {
        var pos0;
        if(posLetter in trace) pos = posAxis.makeCalcdata(trace, posLetter);
        else {
            if(posLetter + '0' in trace) pos0 = trace[posLetter + '0'];
            else if('name' in trace && (
                        posAxis.type === 'category' ||
                        (isNumeric(trace.name) &&
                            ['linear', 'log'].indexOf(posAxis.type) !== -1) ||
                        (Lib.isDateTime(trace.name) &&
                         posAxis.type === 'date')
                    )) {
                pos0 = trace.name;
            }
            else pos0 = num;
            pos0 = posAxis.d2c(pos0, 0, trace[posLetter + 'calendar']);
            pos = val.map(function() { return pos0; });
        }
        return pos;
    }

    pos = getPos(trace, posLetter, posAxis, val, fullLayout._numBoxes);

    // get distinct positions and min difference
    var dv = Lib.distinctVals(pos);
    posDistinct = dv.vals;
    dPos = dv.minDiff / 2;

    // copy the data so the changes to cd doesn't affect the trace data
    cd = extendDeep([], trace[valLetter]);

    // calculate outlier counts
    var hasOutliers = false;
    for (i = 0; i < cd.length; i++) {
    	box = cd[i];

		box.showOutliersText = fullLayout.showOutliersText;
		box.scaleIgnoresOutliers = fullLayout.scaleIgnoresOutliers;

    	box.loc = 0; // lower outliers count
    	box.uoc = 0; // upper outliers count
    	if (box.points != null) {
    		if (box.lw != null) {
    			box.loc = box.points.filter(function(e) { return e < box.lw; }).length;
    		}
    		if (box.uw != null) {
    			box.uoc = box.points.filter(function(e) { return e > box.uw; }).length;
    		}
    	}

    	if (box.loc > 0 || box.uoc > 0) {
    		hasOutliers = true;
    	}
    }

    // normalization
    if (trace.normalize) {
    	cd = cd.map(normalizeBox);
    }

    // size autorange based on min and max values of boxes
    var minMaxValues = [],
    	i;

    for (i = 0; i < cd.length; ++i) {
    	box = cd[i];
    	minMaxValues[i * 2] = Math.min(
    								box.lw,
    								fullLayout.scaleIgnoresOutliers ? Infinity : box.min,
    								isNaN(box.lsl) ? Infinity : box.lsl,
    								isNaN(box.lnb) ? Infinity : box.lnb);
    	minMaxValues[i * 2 + 1] = Math.max(
    									box.uw,
    									fullLayout.scaleIgnoresOutliers ? -Infinity : box.max,
        								isNaN(box.usl) ? -Infinity : box.usl,
        								isNaN(box.unb) ? -Infinity : box.unb);
    }

    var paddingOptions = { padded: true };
    if (fullLayout.scaleIgnoresOutliers && hasOutliers) {
    	// additional padding for outliers out of scale markers
    	paddingOptions.ppad = 16;
    }
    Axes.expand(valAxis, minMaxValues, paddingOptions);


    function calculateWidths(data) {
    	if (!data.length) return [];

    	var i,
    		counts = data.map(function(d) { return d.count == null ? 0 : d.count; }),
    		maxCount = Math.max.apply(null, counts);

    	return counts.map(function(count) { return Math.sqrt(count / maxCount); });
    }

    var widths = calculateWidths(cd);

    // set positions and widths to stats
	for(var i = 0; i < pos.length; ++i) {
		cd[i].pos = pos[i];
		cd[i].boxwidth = widths[i];

		if (trace.hoverindex != null) {
			if (i == trace.hoverindex) {
				cd[i].hover = true;
			}
		}
	}

	// transform probability density
	cd.forEach(function(e) {
		if (e.probabilityDensity) {
			var density = e.probabilityDensity.density,
				scale = e.probabilityDensity.scale,
				densityLength = Math.min(density.length, scale.length),
				i;

			var transformedDensity = new Array(densityLength);
			for (i = 0; i < densityLength; i++) {
				transformedDensity[i] = {};
				transformedDensity[i][posLetter] = density[i];
				transformedDensity[i][valLetter] = scale[i];
			}
			e.probabilityDensity = transformedDensity;
		}
	});

    // add numboxes and dPos to cd
    cd[0].t = {
    	boxnum: fullLayout._numBoxes,
		dPos: dPos,
		posLetter: posLetter,
		valLetter: valLetter
    };
	fullLayout._numBoxes++;
    return cd;
};

function normalizeBox(box) {
	var lsl = box.lsl == null ? box.lnb : box.lsl,
		usl = box.usl == null ? box.unb : box.usl;

	if (lsl == null || usl == null) {
		return {
			normalizationFailed: true,
			_origBox: box
		};
	}

	var target = (lsl + usl) / 2,
		origBox = extendDeep({}, box);

	box._origBox = origBox;

	function normalize(v) {
		if (v == null) return null;

		if (Array.isArray(v)) {
			return v.map(normalize);
		}

		if (v >= target) {
			return (v - target) / (usl - target);
		} else {
			return (v - target) / (target - lsl);
		}
	}

	box.med = normalize(box.med);
	box.avg = normalize(box.avg);
	box.q1 = normalize(box.q1);
	box.q3 = normalize(box.q3);
	box.lw = normalize(box.lw);
	box.uw = normalize(box.uw);
	box.min = normalize(box.min);
	box.max = normalize(box.max);
	box.lsl = normalize(box.lsl);
	box.usl = normalize(box.usl);
	box.lnb = normalize(box.lnb);
	box.unb = normalize(box.unb);
	box.points = normalize(box.points);
	if (box.probabilityDensity != null) {
		box.probabilityDensity.scale = normalize(box.probabilityDensity.scale);
	}
	return box;
}