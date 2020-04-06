/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var d3 = require('d3');

var Color = require('../../components/color');
var Drawing = require('../../components/drawing');

module.exports = function style(gd) {
    var s = d3.select(gd).selectAll('g.trace.boxes');

    s.style('opacity', function(d) { return d[0].trace.opacity; })
        .each(function(d) {
            var trace = d[0].trace,
                lineWidth = trace.line.width;

            d3.select(this).selectAll('path.box')
                .style('stroke-width', lineWidth + 'px')
                .call(Color.stroke, trace.line.color)
                .call(Color.fill, trace.fillcolor);

    		var avgTrace = {
            		type: 'scatter',
            		marker: trace.avgmarker
            	};
            d3.select(this).selectAll('path.mean')
            	.call(Drawing.pointStyle, avgTrace);

    		var invalidBoxTrace = {
            		type: 'scatter',
            		marker: trace.invalidmarker
            	};
            d3.select(this).selectAll('g.invalid-box path')
            	.call(Drawing.pointStyle, invalidBoxTrace);

			applyLineStyle(
				d3.select(this).selectAll('path.specificationlimit'),
				trace.specificationLimitLine);

			applyLineStyle(
				d3.select(this).selectAll('path.naturalboundary'),
				trace.naturalBoundaryLine);

			applyLineStyle(
				d3.select(this).selectAll('g.density path.js-line'),
				trace.probabilityDensityLine);

            d3.select(this).selectAll('g.points path')
                .call(Drawing.pointStyle, trace);

            d3.select(this).selectAll('g.outlierMark text')
	            .call(Color.stroke, "#555555");

            d3.select(this).selectAll('g.outlierMark rect')
                .style('stroke-width', '1px')
                .call(Color.fill, "rgba(255, 0, 0, 0.3)")
            	.call(Color.stroke, "#ff0000");
        });
};

function applyLineStyle(select, lineStyle) {
	var dashStyle = Drawing.dashStyle(lineStyle.dash, lineStyle.width);
	select
	    .style('stroke-width', lineStyle.width + 'px')
		.style('stroke-dasharray', dashStyle)
	    .call(Color.stroke, lineStyle.color);
}