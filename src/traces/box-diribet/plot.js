/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var d3 = require('d3');

var Lib = require('../../lib');
var Drawing = require('../../components/drawing');
var linePoints = require('../scatter/line_points');

module.exports = function plot(gd, plotinfo, cdbox) {
    var fullLayout = gd._fullLayout,
        xa = plotinfo.xaxis,
        ya = plotinfo.yaxis,
        posAxis, valAxis;

    var boxtraces = plotinfo.plot.select('.boxlayer')
        .selectAll('g.trace.boxes')
            .data(cdbox)
            .enter().append('g')
            .classed('trace boxes', true);

    boxtraces.each(function(d) {
        var t = d[0].t,
            trace = d[0].trace,
            group = (fullLayout.boxmode === 'group' && gd.numboxes > 1),
            // box half width
            bdPos = t.dPos * (1 - fullLayout.boxgap) * (1 - fullLayout.boxgroupgap) / (group ? gd.numboxes : 1),
            // box center offset
            bPos = group ? 2 * t.dPos * (-0.5 + (t.boxnum + 0.5) / gd.numboxes) * (1 - fullLayout.boxgap) : 0,
            // whisker width
            wdPos = bdPos * trace.whiskerwidth;
        if(trace.visible !== true || t.emptybox) {
            d3.select(this).remove();
            return;
        }

        // set axis via orientation
        if(trace.orientation === 'h') {
            posAxis = ya;
            valAxis = xa;
        } else {
            posAxis = xa;
            valAxis = ya;
        }

        // save the box size and box position for use by hover
        t.bPos = bPos;
        t.bdPos = bdPos;

        function validBoxes(data) {
        	if (trace.normalize) {
        		return data.filter(function(d) { return !d.normalizationFailed; });
        	} else {
        		return data;
        	}
        }
        
        function invalidBoxes(data) {
        	if (trace.normalize) {
        		return data.filter(function(d) { return d.normalizationFailed; });
        	} else {
        		return [];
        	}
        }

        // box groups
        var boxGroups =
        	d3.select(this).selectAll('g.box')
	            .data(validBoxes)
	            .enter().append('g')
	            .classed('box', true);
        
	            
        // boxes and whiskers
        boxGroups.append('path')
            .classed('box', true)
            .each(function(d) {
                var posc = posAxis.c2p(d.pos + bPos, true),
                	boxHalfWidth = bdPos * d.boxwidth,
                    pos0 = posAxis.c2p(d.pos + bPos - boxHalfWidth, true),
                    pos1 = posAxis.c2p(d.pos + bPos + boxHalfWidth, true),
                    posw0 = posAxis.c2p(d.pos + bPos - wdPos, true),
                    posw1 = posAxis.c2p(d.pos + bPos + wdPos, true),
                    q1 = valAxis.c2p(d.q1, true),
                    q3 = valAxis.c2p(d.q3, true),
                    // make sure median isn't identical to either of the
                    // quartiles, so we can see it
                    med = Lib.constrain(valAxis.c2p(d.med, true),
                        Math.min(q1, q3) + 1, Math.max(q1, q3) - 1),
                    lw = valAxis.c2p(d.lw, true),
                    uw = valAxis.c2p(d.uw, true);
                if(trace.orientation === 'h') {
                    d3.select(this).attr('d',
                        'M' + med + ',' + pos0 + 'V' + pos1 + // median line
                        'M' + q1 + ',' + pos0 + 'V' + pos1 + 'H' + q3 + 'V' + pos0 + 'Z' + // box
                        'M' + q1 + ',' + posc + 'H' + lw + 'M' + q3 + ',' + posc + 'H' + uw + // whiskers
                        ((trace.whiskerwidth === 0) ? '' : // whisker caps
                            'M' + lw + ',' + posw0 + 'V' + posw1 + 'M' + uw + ',' + posw0 + 'V' + posw1));
                } else {
                    d3.select(this).attr('d',
                        'M' + pos0 + ',' + med + 'H' + pos1 + // median line
                        'M' + pos0 + ',' + q1 + 'H' + pos1 + 'V' + q3 + 'H' + pos0 + 'Z' + // box
                        'M' + posc + ',' + q1 + 'V' + lw + 'M' + posc + ',' + q3 + 'V' + uw + // whiskers
                        ((trace.whiskerwidth === 0) ? '' : // whisker caps
                            'M' + posw0 + ',' + lw + 'H' + posw1 + 'M' + posw0 + ',' + uw + 'H' + posw1));
                }
            });

        // specification limits and natural boundaries
        function plotLimits(cssClass, lslAttr, uslAttr) {
        	boxGroups.selectAll('path.' + cssClass)
	        	.data(function(d) { 
		        	var hasLsl = d[lslAttr] != null, 
		        		hasUsl = d[uslAttr] != null; 
		        	
		        	if (hasLsl || hasUsl) {
		        		return [d];
		        	} else {
		        		return [];
		        	}
		        })
		        .enter().append('path')
		        .classed(cssClass, true)
		        .style('fill', 'none')
		        .each(function(d) {
		            var pos0 = posAxis.c2p(d.pos - t.dPos, true),
		                pos1 = posAxis.c2p(d.pos + t.dPos, true),
		                hasLsl = d[lslAttr] != null, 
		                hasUsl = d[uslAttr] != null, 
		                lsl = hasLsl ? valAxis.c2p(d[lslAttr], true) : null,
		                usl = hasUsl ? valAxis.c2p(d[uslAttr], true) : null;
		                
	            	if(trace.orientation === 'h') {
	            		d3.select(this).attr('d',
	            				((hasLsl) ? 'M' + lsl + ',' + pos0 + 'V' + pos1 : '') + 
	            				((hasUsl) ? 'M' + usl + ',' + pos0 + 'V' + pos1 : ''));
	            	}
	            	else {
	            		d3.select(this).attr('d',
	            				((hasLsl) ? 'M' + pos0 + ',' + lsl + 'H' + pos1 : '') + 
        						((hasUsl) ? 'M' + pos0 + ',' + usl + 'H' + pos1 : ''));
	            	}
		        });
        };
        
        plotLimits.call(this, "specificationlimit", "lsl", "usl");
        plotLimits.call(this, "naturalboundary", "lnb", "unb");
        
        // draw points, if desired
        boxGroups.selectAll('g.points')
            .data(function(d) {
        		if (d.points && d.points.length > 0) {
        			return [d];
        		} else {
        			return [];
        		}
            })
            .enter().append('g')
            .classed('points', true)
          .selectAll('path')
            .data(function(d) {
                return d.points.map(function(v, i) {
                    if(trace.orientation === 'h') {
                        return {
                            y: d.pos + bPos,
                            x: v
                        };
                    } else {
                        return {
                            x: d.pos + bPos,
                            y: v
                        };
                    }
                });
            })
            .enter().append('path')
            .call(Drawing.translatePoints, xa, ya);
        
        // draw probability density
        if (fullLayout.showProbabilityDensity != 'never') {
        	var showDensityOnHover = fullLayout.showProbabilityDensity === 'hover',
        		transition = d3.transition().duration(500);
        	
	        var densityGroupJoin = boxGroups.selectAll('g.density')
	        								.data(function(d) {
								        		if (showDensityOnHover && !d.hover) {
								        			return [];
								        		} else {
								        			return [d];
								        		}
								            });
	        
	        var densityGroup = densityGroupJoin.enter()
								            	.append('g')
						            			.classed('density', true);
	        densityGroup.style('opacity', 0).transition(transition).style('opacity', 1);
	        
	        densityGroupJoin.exit()
			            	.remove();
	        
	        gd.removeListener('plotly_hover', showDensity);
	        gd.removeListener('plotly_unhover', hideDensity);
        	if (showDensityOnHover) {
        		gd.on('plotly_hover', showDensity);
        		gd.on('plotly_unhover', hideDensity);
        	}
        	
	        var densitySegments = function(d, side) {
	        	if (!d.probabilityDensity) return [];
	        	
	        	var boxOffset = d.pos + bPos,
	        		densityPoints = d.probabilityDensity.map(function(v, i) {
		                if(trace.orientation === 'h') {
		            		return { 
		            			x: v.x, 
		            			y: v.y * side + boxOffset
		            		};
		        		} else {
		            		return { 
		            			x: v.x * side + boxOffset, 
		            			y: v.y
		            		};
		        		}
		        	}),
		        	segments = linePoints(densityPoints, {
		                xaxis: xa,
		                yaxis: ya,
		                connectGaps: false,
		                linear: false,
		                simplify: false
		            });
	
	        	// set line style to data
	        	segments.forEach(function(segment) { segment[0].trace = { line: d.probabilityDensity.line } });
	        	
	        	return segments.filter(function(s) {
	                return s.length > 1;
	            });
	        };
	        
	        var drawDensity = function(leftSide) {
	        	var sideClass = leftSide ? "left" : "right";
	        	
	        	densityGroup
		        	.selectAll('path.' + sideClass)
		            .data(function(d) {
		            	return densitySegments(d, leftSide ? -1 : 1);
		            })
		            .enter().append('path')
		            .classed('js-line ' + sideClass, true)
			        .style('vector-effect', 'non-scaling-stroke')
			        .call(Drawing.lineGroupStyle)
			        .each(function(d) {
			        	var smoothing = 1,
			        		path = Drawing.smoothopen(d, smoothing);
			        	
		        		d3.select(this)
		        			.attr('d', path)
		        			.call(Drawing.lineGroupStyle);
			        });
	        };
	        drawDensity(true);
	        drawDensity(false);
        }
        
        // draw mean
        boxGroups.append('path')
            .classed('mean', true)
            .style('fill', 'none')
            .each(function(d) {
                var posc = posAxis.c2p(d.pos + bPos, true),
                	avg = valAxis.c2p(d.avg, true);
                
                if(trace.orientation === 'h') {
                	d3.select(this).attr('transform', 'translate(' + avg + ',' + posc + ')');
                } else {
                	d3.select(this).attr('transform', 'translate(' + posc + ',' + avg + ')');
                }
            });
        
        // draw invalid (not normalizable boxes)
        d3.select(this).selectAll('g.invalid-box')
            .data(invalidBoxes)
            .enter().append('g')
            .classed('invalid-box', true)
          .selectAll('path')
            .data(function(d) {
                if(trace.orientation === 'h') {
	                return [{
	                	x: 0,
	                    y: d.pos + bPos
	                }];
                } else {
	                return [{
	                    x: d.pos + bPos,
	                    y: 0
	                }];
                }
            })
            .enter().append('path')
            .call(Drawing.translatePoints, xa, ya);
    });
};

function showDensity(event) {
	setHoverIndex(event, true);
}

function hideDensity(event) {
	setHoverIndex(event, false);
}

function setHoverIndex(event, setIndex) {
	var point = event.points[0],
		traceNumber = point.curveNumber,
		pointNumber = point.pointNumber,
		gd = point.xaxis._gd;
	
	gd.data[traceNumber].hoverindex = setIndex ? pointNumber : null;
	Plotly.redraw(gd);
}