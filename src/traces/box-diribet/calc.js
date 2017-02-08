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
        cd = [],
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

    // size autorange based on min and max values of boxes
    // position happens afterward when we know all the pos
    var boxes = trace[valLetter],
    	minMaxValues = [],
    	i;
    
    for (i = 0; i < boxes.length; ++i) {
    	var box = boxes[i];
    	minMaxValues[i * 2] = Math.min(
    								box.lw, 
    								box.min,
    								isNaN(box.lsl) ? Infinity : box.lsl, 
    								isNaN(box.lnb) ? Infinity : box.lnb);
    	minMaxValues[i * 2 + 1] = Math.max(
    									box.uw, 
    									box.max, 
        								isNaN(box.usl) ? -Infinity : box.usl, 
        								isNaN(box.unb) ? -Infinity : box.unb);
    }
    
    Axes.expand(valAxis, minMaxValues, {padded: true});

    // In vertical (horizontal) box plots:
    // if no x (y) data, use x0 (y0), or name
    // so if you want one box
    // per trace, set x0 (y0) to the x (y) value or category for this trace
    // (or set x (y) to a constant array matching y (x))
    function getPos(gd, trace, posLetter, posAxis, val) {
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
            else pos0 = gd.numboxes;
            pos0 = posAxis.d2c(pos0, 0, trace[posLetter + 'calendar']);
            pos = val.map(function() { return pos0; });
        }
        return pos;
    }

    pos = getPos(gd, trace, posLetter, posAxis, val);

    // get distinct positions and min difference
    var dv = Lib.distinctVals(pos);
    posDistinct = dv.vals;
    dPos = dv.minDiff / 2;

    // copy the data so the changes to cd doesn't affect the trace data
    cd = extendDeep([], trace[valLetter]);

    function calculateWidths(data) {
    	if (!data.length) return [];
    	
    	var i,    	
    		counts = data.map(function(d) { return d.count; }),
    		maxCount = Math.max.apply(null, counts);
    	
    	return counts.map(function(count) { return Math.sqrt(count / maxCount); });
    }
    
    var widths = calculateWidths(cd);
    
    // set positions and widths to stats
	for(var i = 0; i < pos.length; ++i) {
		cd[i].pos = pos[i];
		cd[i].boxwidth = widths[i];
	}

	// transform probability density
	cd.forEach(function(e) {
		if (e.probabilityDensity) {
			var densityX = e.probabilityDensity.x,
			densityY = e.probabilityDensity.y,
			densityLength = Math.min(densityX.length, densityY.length),
			i;
			
			var transformedDensity = new Array(densityLength);
			for (i = 0; i < densityLength; i++) {
				transformedDensity[i] = {x: densityX[i], y: densityY[i]};
			}
			e.probabilityDensity = transformedDensity;
		}
	});
	
    // add numboxes and dPos to cd
    cd[0].t = {boxnum: gd.numboxes, dPos: dPos};
    gd.numboxes++;
    return cd;
};
