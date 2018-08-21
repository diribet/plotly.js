/**
 * Copyright 2012-2016, Plotly, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var Registry = require('../../registry');
var Axes = require('../../plots/cartesian/axes');
var Lib = require('../../lib');


function crossTraceCalc(gd, plotinfo) {
	var fullLayout = gd._fullLayout,
		calcdata = gd.calcdata,
		xa = plotinfo.xaxis,
		ya = plotinfo.yaxis,
		orientations = ['v', 'h'];
	var posAxis, i, j, k;

	for(i = 0; i < orientations.length; ++i) {
		var orientation = orientations[i],
			boxlist = [],
			boxpointlist = [],
			cd,
			t,
			trace;

		// set axis via orientation
		if(orientation === 'h') posAxis = ya;
		else posAxis = xa;

		// make list of box traces
		for(j = 0; j < calcdata.length; ++j) {
			cd = calcdata[j];
			t = cd[0].t;
			trace = cd[0].trace;

			if(trace.visible === true && Registry.traceIs(trace, 'box-violin') &&
				!t.emptybox &&
				trace.orientation === orientation &&
				trace.xaxis === xa._id &&
				trace.yaxis === ya._id) {
				boxlist.push(j);
			}
		}

		// make list of box points (boxes)
		for(j = 0; j < boxlist.length; j++) {
			cd = calcdata[boxlist[j]];
			for(k = 0; k < cd.length; k++) boxpointlist.push(cd[k].pos);
		}
		if(!boxpointlist.length) continue;

		// box plots - update dPos based on multiple traces
		// and then use for posAxis autorange

		var boxdv = Lib.distinctVals(boxpointlist),
			dPos = boxdv.minDiff / 2;

		// if there's no duplication of x points,
		// disable 'group' mode by setting numboxes=1
		if(boxpointlist.length === boxdv.vals.length) fullLayout._numBoxes = 1;

		// check for forced minimum dtick
		Axes.minDtick(posAxis, boxdv.minDiff, boxdv.vals[0], true);

		// autoscale the x axis
		var extremes = Axes.findExtremes(posAxis, boxdv.vals, {
			vpadminus: dPos,
			vpadplus: dPos
		});

		for(i = 0; i < boxlist.length; i++) {
			cd = calcdata[boxlist[i]];
			// set the width of all boxes
			cd[0].t.dPos = dPos;
			// link extremes to all boxes
			cd[0].trace._extremes[posAxis._id] = extremes;
		}

	}
};

module.exports = {
	crossTraceCalc: crossTraceCalc
};