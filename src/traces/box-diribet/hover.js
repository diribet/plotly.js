/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var Axes = require('../../plots/cartesian/axes');
var Fx = require('../../plots/cartesian/graph_interact');
var Lib = require('../../lib');
var Color = require('../../components/color');

module.exports = function hoverPoints(pointData, xval, yval, hovermode) {
    // closest mode: handicap box plots a little relative to others
    var cd = pointData.cd,
        trace = cd[0].trace,
        t = cd[0].t,
        xa = pointData.xa,
        ya = pointData.ya,
        closeData = [],
        fullLayout = xa._gd._fullLayout,
        dx, dy, distfn, boxDelta,
        posLetter, posAxis,
        val, valLetter, valAxis;

    // adjust inbox w.r.t. to calculate box size
    boxDelta = (hovermode === 'closest') ? 2.5 * t.bdPos : t.bdPos;

    if(trace.orientation === 'h') {
        dx = function(di) {
            return Fx.inbox(di.min - xval, di.max - xval);
        };
        dy = function(di) {
            var pos = di.pos + t.bPos - yval;
            return Fx.inbox(pos - boxDelta, pos + boxDelta);
        };
        posLetter = 'y';
        posAxis = ya;
        valLetter = 'x';
        valAxis = xa;
        val = xval;
    } else {
        dx = function(di) {
            var pos = di.pos + t.bPos - xval;
            return Fx.inbox(pos - boxDelta, pos + boxDelta);
        };
        dy = function(di) {
            return Fx.inbox(di.min - yval, di.max - yval);
        };
        posLetter = 'x';
        posAxis = xa;
        valLetter = 'y';
        valAxis = ya;
        val = yval;
    }

    distfn = Fx.getDistanceFunction(hovermode, dx, dy);
    Fx.getClosest(cd, distfn, pointData);

    // skip the rest (for this trace) if we didn't find a close point
    if(pointData.index === false) return;

    // create the item(s) in closedata for this point

    // the closest data point
    var di = cd[pointData.index],
        lc = trace.line.color,
        mc = (trace.marker || {}).color;
    if(Color.opacity(lc) && trace.line.width) pointData.color = lc;
    else if(Color.opacity(mc) && trace.boxpoints) pointData.color = mc;
    else pointData.color = trace.fillcolor;

    Axes.tickText(posAxis, posAxis.c2l(di.pos), 'hover').text;
    pointData[posLetter + 'LabelVal'] = di.pos;

    if (di.normalizationFailed) {
    	// tooltip is placed in center of box
    	pointData[posLetter + '0'] = pointData[posLetter + '1'] = posAxis.c2p(di.pos + t.bPos, true);
    	
    	// show normalization failed tooltip
		pointData[valLetter + '0'] = pointData[valLetter + '1'] = valAxis.c2p(0, true);
		pointData.text = trace.normalizationFailedText;
		pointData.attr = 'normalizationFailed';
		closeData.push(pointData);
    	
    } else if (hoverOutliersMark(xval, yval, di, trace.orientation, fullLayout)) {
    	
    	// tooltip is placed in center of box
    	pointData[posLetter + '0'] = pointData[posLetter + '1'] = posAxis.c2p(di.pos + t.bPos, true);
    	
    	// show outliers tooltip
		pointData[valLetter + '0'] = pointData[valLetter + '1'] = valAxis.c2p(val, true);
		pointData.text = 'Show outliers';
		pointData.attr = 'outliersMark';
		pointData.outliersMark = true;
		pointData.color = 'rgba(255, 0, 0, 0.3)';
		closeData.push(pointData);
    	
    } else {
    	// box plots: each "point" gets many labels
    	var usedVals = {},
	    	attrs = ['med', 'lw', 'q1', 'q3', 'uw'],
	    	attr,
	    	label,
	    	pointData2,
	    	boxHalfWidth = t.bdPos * di.boxwidth;

    	if (!fullLayout.scaleIgnoresOutliers) {
    		attrs.push('min', 'max');
    	}
    	
    	// tooltip is placed on a box side
        pointData[posLetter + '0'] = posAxis.c2p(di.pos + t.bPos - boxHalfWidth, true);
        pointData[posLetter + '1'] = posAxis.c2p(di.pos + t.bPos + boxHalfWidth, true);

    	
    	for(var i = 0; i < attrs.length; i++) {
    		attr = attrs[i];
    		
    		if(!(attr in di) || (di[attr] in usedVals)) continue;
    		usedVals[di[attr]] = true;
    		
    		// copy out to a new object for each value to label
    		val = valAxis.c2p(di[attr], true);
    		pointData2 = Lib.extendFlat({}, pointData);
    		pointData2[valLetter + '0'] = pointData2[valLetter + '1'] = val;
    		
    		// if the box is normalized, use non-normalized value as a label
    		if (trace.normalize) {
    			label = di._origBox[attr];
    		} else {
    			label = di[attr];
    		}
    		pointData2[valLetter + 'LabelVal'] = label;
    		pointData2.attr = attr;
    		
    		pointData.name = ''; // only keep name on the first item (median)
    		closeData.push(pointData2);
    	}
    }
    
    return closeData;
};

function hoverOutliersMark(xval, yval, dataPoint, orientation, layout) {
	if (!layout.scaleIgnoresOutliers) { 
		return false;
	}
	
	var val = orientation === 'h' ? xval : yval;
	return val < dataPoint.lw || val > dataPoint.uw;
}