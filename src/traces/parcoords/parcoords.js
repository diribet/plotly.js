/**
* Copyright 2012-2019, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var d3 = require('d3');
var rgba = require('color-rgba');

var Lib = require('../../lib');
var Drawing = require('../../components/drawing');
var Colorscale = require('../../components/colorscale');

var gup = require('../../lib/gup');
var keyFun = gup.keyFun;
var repeat = gup.repeat;
var unwrap = gup.unwrap;

var c = require('./constants');
var brush = require('./axisbrush');
var lineLayerMaker = require('./lines');

function visible(dimension) { return !('visible' in dimension) || dimension.visible; }

function dimensionExtent(dimension) {
    var lo = dimension.range ? dimension.range[0] : Lib.aggNums(Math.min, null, dimension.values, dimension._length);
    var hi = dimension.range ? dimension.range[1] : Lib.aggNums(Math.max, null, dimension.values, dimension._length);

    if(isNaN(lo) || !isFinite(lo)) {
        lo = 0;
    }

    if(isNaN(hi) || !isFinite(hi)) {
        hi = 0;
    }

    // avoid a degenerate (zero-width) domain
    if(lo === hi) {
        if(lo === 0) {
            // no use to multiplying zero, so add/subtract in this case
            lo -= 1;
            hi += 1;
        } else {
            // this keeps the range in the order of magnitude of the data
            lo *= 0.9;
            hi *= 1.1;
        }
    }

    return [lo, hi];
}

function toText(formatter, texts) {
    if(texts) {
        return function(v, i) {
            var text = texts[i];
            if(text === null || text === undefined) return formatter(v);
            return text;
        };
    }
    return formatter;
}

function domainScale(height, padding, dimension, tickvals, ticktext) {
    var extent = dimensionExtent(dimension);
    if(tickvals) {
        return d3.scale.ordinal()
            .domain(tickvals.map(toText(d3.format(dimension.tickformat), ticktext)))
            .range(tickvals
                .map(function(d) {
                    var unitVal = (d - extent[0]) / (extent[1] - extent[0]);
                    return (height - padding + unitVal * (2 * padding - height));
                })
            );
    }
    return d3.scale.linear()
        .domain(extent)
        .range([height - padding, padding]);
}

function unitToPaddedPx(height, padding) { return d3.scale.linear().range([padding, height - padding]); }

function domainToPaddedUnitScale(dimension, padFraction) {
    return d3.scale.linear()
        .domain(dimensionExtent(dimension))
        .range([padFraction, 1 - padFraction]);
}

function ordinalScale(dimension) {
    if(!dimension.tickvals) return;

    var extent = dimensionExtent(dimension);
    return d3.scale.ordinal()
        .domain(dimension.tickvals)
        .range(dimension.tickvals.map(function(d) {
            return (d - extent[0]) / (extent[1] - extent[0]);
        }));
}

function unitToColorScale(cscale) {
    var colorStops = cscale.map(function(d) { return d[0]; });
    var colorTuples = cscale.map(function(d) {
        var RGBA = rgba(d[1]);
        return d3.rgb('rgb(' + RGBA[0] + ',' + RGBA[1] + ',' + RGBA[2] + ')');
    });
    var prop = function(n) { return function(o) { return o[n]; }; };

    // We can't use d3 color interpolation as we may have non-uniform color palette raster
    // (various color stop distances).
    var polylinearUnitScales = 'rgb'.split('').map(function(key) {
        return d3.scale.linear()
            .clamp(true)
            .domain(colorStops)
            .range(colorTuples.map(prop(key)));
    });

    return function(d) {
        return polylinearUnitScales.map(function(s) {
            return s(d);
        });
    };
}

function someFiltersActive(view) {
    return view.dimensions.some(function(p) {
        return p.brush.filterSpecified;
    });
}

function model(layout, d, i) {
    var cd0 = unwrap(d);
    var trace = cd0.trace;
    var lineColor = cd0.lineColor;
    var line = trace.line;
    var cOpts = Colorscale.extractOpts(line);
    var cscale = cOpts.reversescale ? Colorscale.flipScale(cd0.cscale) : cd0.cscale;
    var domain = trace.domain;
    var dimensions = trace.dimensions;
    var width = layout.width;
    var labelFont = trace.labelfont;
    var tickFont = trace.tickfont;
    var rangeFont = trace.rangefont;

    var lines = Lib.extendDeepNoArrays({}, line, {
        color: lineColor.map(d3.scale.linear().domain(dimensionExtent({
            values: lineColor,
            range: [cOpts.min, cOpts.max],
            _length: trace._length
        }))),
        blockLineCount: c.blockLineCount,
        canvasOverdrag: c.overdrag * c.canvasPixelRatio
    });

    var groupWidth = Math.floor(width * (domain.x[1] - domain.x[0]));
    var groupHeight = Math.floor(layout.height * (domain.y[1] - domain.y[0]));

    var pad = layout.margin || {l: 80, r: 80, t: 100, b: 80};
    var rowContentWidth = groupWidth;
    var rowHeight = groupHeight;

    return {
        key: i,
        colCount: dimensions.filter(visible).length,
        dimensions: dimensions,
        tickDistance: c.tickDistance,
        unitToColor: unitToColorScale(cscale),
        lines: lines,
        labelFont: labelFont,
        tickFont: tickFont,
        rangeFont: rangeFont,
        layoutWidth: width,
        layoutHeight: layout.height,
        domain: domain,
        translateX: domain.x[0] * width,
        translateY: layout.height - domain.y[1] * layout.height,
        pad: pad,
        canvasWidth: rowContentWidth * c.canvasPixelRatio + 2 * lines.canvasOverdrag,
        canvasHeight: rowHeight * c.canvasPixelRatio,
        width: rowContentWidth,
        height: rowHeight,
        canvasPixelRatio: c.canvasPixelRatio
    };
}

function viewModel(state, callbacks, model) {
    var width = model.width;
    var height = model.height;
    var dimensions = model.dimensions;
    var canvasPixelRatio = model.canvasPixelRatio;

    var xScale = function(d) {return width * d / Math.max(1, model.colCount - 1);};

    var unitPad = c.verticalPadding / height;
    var _unitToPaddedPx = unitToPaddedPx(height, c.verticalPadding);

    var viewModel = {
        key: model.key,
        xScale: xScale,
        model: model,
        inBrushDrag: false // consider factoring it out and putting it in a centralized global-ish gesture state object
    };

    var uniqueKeys = {};

    viewModel.dimensions = dimensions.filter(visible).map(function(dimension, i) {
        var domainToPaddedUnit = domainToPaddedUnitScale(dimension, unitPad);
        var foundKey = uniqueKeys[dimension.label];
        uniqueKeys[dimension.label] = (foundKey || 0) + 1;
        var key = dimension.label + (foundKey ? '__' + foundKey : '');
        var specifiedConstraint = dimension.constraintrange;
        var filterRangeSpecified = specifiedConstraint && specifiedConstraint.length;
        if(filterRangeSpecified && !Array.isArray(specifiedConstraint[0])) {
            specifiedConstraint = [specifiedConstraint];
        }
        var filterRange = filterRangeSpecified ?
            specifiedConstraint.map(function(d) { return d.map(domainToPaddedUnit); }) :
            [[0, 1]];
        var brushMove = function() {
            var p = viewModel;
            p.focusLayer && p.focusLayer.render(p.panels, true);
            var filtersActive = someFiltersActive(p);
            if(!state.contextShown() && filtersActive) {
                p.contextLayer && p.contextLayer.render(p.panels, true);
                state.contextShown(true);
            } else if(state.contextShown() && !filtersActive) {
                p.contextLayer && p.contextLayer.render(p.panels, true, true);
                state.contextShown(false);
            }
        };

        var truncatedValues = dimension.values;
        if(truncatedValues.length > dimension._length) {
            truncatedValues = truncatedValues.slice(0, dimension._length);
        }

        var tickvals = dimension.tickvals;
        var ticktext;
        function makeTickItem(v, i) { return {val: v, text: ticktext[i]}; }
        function sortTickItem(a, b) { return a.val - b.val; }
        if(Array.isArray(tickvals) && tickvals.length) {
            ticktext = dimension.ticktext;

            // ensure ticktext and tickvals have same length
            if(!Array.isArray(ticktext) || !ticktext.length) {
                ticktext = tickvals.map(d3.format(dimension.tickformat));
            } else if(ticktext.length > tickvals.length) {
                ticktext = ticktext.slice(0, tickvals.length);
            } else if(tickvals.length > ticktext.length) {
                tickvals = tickvals.slice(0, ticktext.length);
            }

            // check if we need to sort tickvals/ticktext
            for(var j = 1; j < tickvals.length; j++) {
                if(tickvals[j] < tickvals[j - 1]) {
                    var tickItems = tickvals.map(makeTickItem).sort(sortTickItem);
                    for(var k = 0; k < tickvals.length; k++) {
                        tickvals[k] = tickItems[k].val;
                        ticktext[k] = tickItems[k].text;
                    }
                    break;
                }
            }
        } else tickvals = undefined;

        var transformedDimensions = {
            key: key,
            label: dimension.label,
            tickFormat: dimension.tickformat,
            tickvals: tickvals,
            ticktext: ticktext,
            ordinal: !!tickvals,
            multiselect: dimension.multiselect,
            xIndex: i,
            crossfilterDimensionIndex: i,
            visibleIndex: dimension._index,
            height: height,
            values: truncatedValues,
            paddedUnitValues: truncatedValues.map(domainToPaddedUnit),
            unitTickvals: tickvals && tickvals.map(domainToPaddedUnit),
            xScale: xScale,
            x: xScale(i),
            canvasX: xScale(i) * canvasPixelRatio,
            unitToPaddedPx: _unitToPaddedPx,
            domainScale: domainScale(height, c.verticalPadding, dimension, tickvals, ticktext),
            ordinalScale: ordinalScale(dimension),
            parent: viewModel,
            model: model,
            brush: brush.makeBrush(
                state,
                filterRangeSpecified,
                filterRange,
                function() {
                    state.linePickActive(false);
                },
                brushMove,
                function(f) {
                    var p = viewModel;
                    p.focusLayer.render(p.panels, true);
                    p.pickLayer && p.pickLayer.render(p.panels, true);
                    state.linePickActive(true);
                    if(callbacks && callbacks.filterChanged) {
                        var invScale = domainToPaddedUnit.invert;

                        // update gd.data as if a Plotly.restyle were fired
                        var newRanges = f.map(function(r) {
                            return r.map(invScale).sort(Lib.sorterAsc);
                        }).sort(function(a, b) { return a[0] - b[0]; });
                        callbacks.filterChanged(p.key, dimension._index, newRanges);
                    }
                }
            )
        };
        model.dimensions[i]._input.hover ? transformedDimensions.hover = true : null;

        var probabilityDensity = model.dimensions[i]._input.probabilityDensity;
        probabilityDensity ? transformedDimensions.probabilityDensity = probabilityDensity : null;

        return transformedDimensions
    });

    return viewModel;
}

function styleExtentTexts(selection) {
    selection
        .classed(c.cn.axisExtentText, true)
        .attr('text-anchor', 'middle')
        .style('cursor', 'default')
        .style('user-select', 'none');
}

function parcoordsInteractionState() {
    var linePickActive = true;
    var contextShown = false;
    return {
        linePickActive: function(val) {return arguments.length ? linePickActive = !!val : linePickActive;},
        contextShown: function(val) {return arguments.length ? contextShown = !!val : contextShown;}
    };
}

module.exports = function(gd, root, svg, parcoordsLineLayers, styledData, layout, callbacks) {
    var state = parcoordsInteractionState();

    var vm = styledData
        .filter(function(d) { return unwrap(d).trace.visible; })
        .map(model.bind(0, layout))
        .map(viewModel.bind(0, state, callbacks));

    parcoordsLineLayers.each(function(d, i) {
        return Lib.extendFlat(d, vm[i]);
    });

    var parcoordsLineLayer = parcoordsLineLayers.selectAll('.gl-canvas')
        .each(function(d) {
            // FIXME: figure out how to handle multiple instances
            d.viewModel = vm[0];
            d.model = d.viewModel ? d.viewModel.model : null;
        });

    var lastHovered = null;

    var pickLayer = parcoordsLineLayer.filter(function(d) {return d.pick;});

    // emit hover / unhover event
    pickLayer
        .style('pointer-events', 'auto')
        .on('mousemove', function(d) {
            if(state.linePickActive() && d.lineLayer && callbacks && callbacks.hover) {
                var event = d3.event;
                var cw = this.width;
                var ch = this.height;
                var pointer = d3.mouse(this);
                var x = pointer[0];
                var y = pointer[1];

                if(x < 0 || y < 0 || x >= cw || y >= ch) {
                    return;
                }
                var pixel = d.lineLayer.readPixel(x, ch - 1 - y);
                var found = pixel[3] !== 0;
                // inverse of the calcPickColor in `lines.js`; detailed comment there
                var curveNumber = found ? pixel[2] + 256 * (pixel[1] + 256 * pixel[0]) : null;
                var eventData = {
                    x: x,
                    y: y,
                    clientX: event.clientX,
                    clientY: event.clientY,
                    dataIndex: d.model.key,
                    curveNumber: curveNumber
                };
                if(curveNumber !== lastHovered) { // don't unnecessarily repeat the same hit (or miss)
                    if(found) {
                        callbacks.hover(eventData);
                    } else if(callbacks.unhover) {
                        callbacks.unhover(eventData);
                    }
                    lastHovered = curveNumber;
                }
            }
        });

    // emit plotly_curveClick event
    pickLayer
        .style('pointer-events', 'auto')
        .on('click', function(d) {
            if(state.linePickActive() && d.lineLayer && callbacks && callbacks.hover) {
                var cw = this.width;
                var ch = this.height;
                var pointer = d3.mouse(this);
                var x = pointer[0];
                var y = pointer[1];

                if(x < 0 || y < 0 || x >= cw || y >= ch) {
                    return;
                }
                // Check not only single pixel, but n*n pixels around clicked pixels
                // Pixels is array of 4*n*n numbers, here 4*5*5=60, it has to be split into array of 25 arrays
                var pixels = d.lineLayer.readPixels(x-2, ch - 3 - y, 5, 5);
                var arrayOfPixels = new Array(25);
                for (var i = 0; i < arrayOfPixels.length; i++){
                    var red = pixels[i*4],
                        green = pixels[i*4 + 1],
                        color = pixels[i*4 + 2],
                        alpha = pixels[i*4 + 3];
                    arrayOfPixels[i] = [red, green, color, alpha];
                }
                var suitablePixels = arrayOfPixels.filter(function(d){return d[3] === 255});
                var pixel = suitablePixels.length > 0 ? suitablePixels[0] : d.lineLayer.readPixel(x, ch - 1 - y);

                var found = pixel[3] !== 0;
                // inverse of the calcPickColor in `lines.js`; detailed comment there
                var curveNumber = found ? pixel[2] + 256 * (pixel[1] + 256 * pixel[0]) : null;

                var eventData = {
                    dataIndex: d.model.key,
                    curveNumber: curveNumber
                };
                if(found) {
                    callbacks.plotly_curveClick(eventData);
                }
            }
        });

    parcoordsLineLayer
        .style('opacity', function(d) {return d.pick ? 0.01 : 1;});

    svg.style('background', 'rgba(255, 255, 255, 0)');
    var parcoordsControlOverlay = svg.selectAll('.' + c.cn.parcoords)
        .data(vm, keyFun);

    parcoordsControlOverlay.exit().remove();

    parcoordsControlOverlay.enter()
        .append('g')
        .classed(c.cn.parcoords, true)
        .style('shape-rendering', 'crispEdges')
        .style('pointer-events', 'none');

    parcoordsControlOverlay.attr('transform', function(d) {
        return 'translate(' + d.model.translateX + ',' + d.model.translateY + ')';
    });

    var parcoordsControlView = parcoordsControlOverlay.selectAll('.' + c.cn.parcoordsControlView)
        .data(repeat, keyFun);

    parcoordsControlView.enter()
        .append('g')
        .classed(c.cn.parcoordsControlView, true);

    parcoordsControlView.attr('transform', function(d) {
        return 'translate(' + d.model.pad.l + ',' + d.model.pad.t + ')';
    });

    var yAxis = parcoordsControlView.selectAll('.' + c.cn.yAxis)
        .data(function(vm) { return vm.dimensions; }, keyFun);

    function updatePanelLayout(yAxis, vm) {
        var panels = vm.panels || (vm.panels = []);
        var dimData = yAxis.data();
        var panelCount = dimData.length - 1;
        for(var p = 0; p < panelCount; p++) {
            var panel = panels[p] || (panels[p] = {});
            var dim1 = dimData[p];
            var dim2 = dimData[p + 1];
            panel.dim1 = dim1;
            panel.dim2 = dim2;
            panel.canvasX = dim1.canvasX;
            panel.panelSizeX = dim2.canvasX - dim1.canvasX;
            panel.panelSizeY = vm.model.canvasHeight;
            panel.y = 0;
            panel.canvasY = 0;
        }
    }

    yAxis.enter()
        .append('g')
        .classed(c.cn.yAxis, true)
        .style('pointer-events', 'none')
        .on('click', function(eventData) {
            callbacks.plotly_axisClick(eventData);
        });
        // FIXME: porad jsou tam mezery mezi g elementy,
        //  ale pokud bychom tam vlozili velky pruhledny element k emitovani eventu,
        //  sirka bude zavisla na nadpisu

    // draw probability density
    var hoverEnterCallback = function() {
        parcoordsSetHoverIndex.call(this, true);
    };
    var hoverLeaveCallback = function() {
        parcoordsSetHoverIndex.call(this, null);
    };

    var parcoordsSetHoverIndex = function (setIndex){
        var hoveredAxisIndex = this.__data__.xIndex; // xIndex reflects hidden axes, visibleIndex does not
        // reset hover properties for all axes, save it only for currently hovered axis
        gd.data[0].dimensions = gd.data[0].dimensions.map(function(item){item.hover = null; return item});
        gd.data[0].dimensions[hoveredAxisIndex].hover = setIndex;
        Plotly.redraw(gd);
    };

    d3.selectAll('.density').remove();
    if (layout.showProbabilityDensity && layout.showProbabilityDensity !== 'never') {
        var showDensityOnHover = layout.showProbabilityDensity === 'hover';

        var densityGroupJoin = yAxis.selectAll('g.density')
            .data(function (d) {
                if (showDensityOnHover && !d.hover) {
                    return [];
                } else {
                    return [d];
                }
            });

        var densityGroup = densityGroupJoin.enter()
            .append('g')
            .classed('density', true);

        // Can't use linePoints like in boxPlot, as in parcoords, there is no plotinfo for axes, which defines c2p, properties and other
        var createDensityPoints = function (d, sideFlip) {
            var outerArray = new Array(d.probabilityDensity.density.length),
                scaleMax = Math.max.apply(null, d.probabilityDensity.scale),
                densityMax = Math.max.apply(null, d.probabilityDensity.density),
                scaleFactor = d.height / scaleMax,
                densityFactor = d.model.canvasWidth / d.model.colCount / densityMax * 0.3;
            for (var i = 0; i < outerArray.length; i++) {
                var densityPoint = new Array(2);
                densityPoint[0] = d.probabilityDensity.density[i] * densityFactor * sideFlip;
                densityPoint[1] = d.probabilityDensity.scale[i] * scaleFactor;
                outerArray[i] = densityPoint;
            }
            return outerArray;
        };

        var drawDensity = function(leftSide) {
            var sideClass = leftSide ? "left" : "right";

            densityGroup
                .selectAll('path.' + sideClass)
                .data(function(d) {
                    return [createDensityPoints(d, leftSide ? -1 : 1)]
                })
                .enter().append('path')
                .classed('js-line ' + sideClass, true)
                .style('vector-effect', 'non-scaling-stroke')
                .call(Drawing.lineGroupStyle, 2, 'blue', '')
                .each(function(d) {
                    var smoothing = 1,
                        path = Drawing.smoothopen(d, smoothing);
                    d3.select(this)
                        .attr('d', path);
                        // .call(Drawing.lineGroupStyle);

                    // check with parent node if axis is reversed
                    var index = this.parentNode.__data__.crossfilterDimensionIndex,
                        range = this.parentNode.__data__.model.dimensions[index].range,
                        isAxisReversed = (range && range[0] > range[1]);
                    if (isAxisReversed) {
                        var rotateString = 'rotate(180 0 ' +  this.parentNode.__data__.height / 2 + ')';
                        d3.select(this)
                            .attr('transform', rotateString);
                    }
                });
        };

        drawDensity(true);
        drawDensity(false);

        densityGroupJoin.exit()
            .remove();

        if (showDensityOnHover === true) {
            d3.selectAll('.' + c.cn.yAxis)
                .on('mouseover', null)
                .on('mouseout', null);
            yAxis.on('mouseover', function() {
                // if axis is not dragged at the moment
                !this.__data__.prohibitDrawingDensity ? hoverEnterCallback.call(this) : null;
            });
            yAxis.on('mouseout', function () {
                // if axis is not dragged at the moment
                !this.__data__.prohibitDrawingDensity ? hoverLeaveCallback.call(this) : null;
            });
        }
    }

    parcoordsControlView.each(function(vm) {
        updatePanelLayout(yAxis, vm);
    });

    parcoordsLineLayer
        .each(function(d) {
            if(d.viewModel) {
                if(!d.lineLayer || callbacks) { // recreate in case of having callbacks e.g. restyle. Should we test for callback to be a restyle?
                    d.lineLayer = lineLayerMaker(this, d);
                } else d.lineLayer.update(d);

                if(d.key || d.key === 0) d.viewModel[d.key] = d.lineLayer;

                var setChanged = (!d.context || // don't update background
                                  callbacks);   // unless there is a callback on the context layer. Should we test the callback?

                d.lineLayer.render(d.viewModel.panels, setChanged);
            }
        });

    yAxis.attr('transform', function(d) {
        return 'translate(' + d.xScale(d.xIndex) + ', 0)';
    });

    // drag column for reordering columns
    yAxis.call(d3.behavior.drag()
        .origin(function(d) { return d; })
        .on('drag', function(d) {
            // add dragged property to axis
            d3.selectAll('.' + c.cn.yAxis).each(function() {
                d3.select(this).node().__data__.prohibitDrawingDensity = true;
            });
            d3.selectAll('.density').remove();

            var p = d.parent;
            state.linePickActive(false);
            d.x = Math.max(-c.overdrag, Math.min(d.model.width + c.overdrag, d3.event.x));
            d.canvasX = d.x * d.model.canvasPixelRatio;
            yAxis
                .sort(function(a, b) { return a.x - b.x; })
                .each(function(dd, i) {
                    dd.xIndex = i;
                    dd.x = d === dd ? dd.x : dd.xScale(dd.xIndex);
                    dd.canvasX = dd.x * dd.model.canvasPixelRatio;
                });

            updatePanelLayout(yAxis, p);

            yAxis.filter(function(dd) { return Math.abs(d.xIndex - dd.xIndex) !== 0; })
                .attr('transform', function(d) { return 'translate(' + d.xScale(d.xIndex) + ', 0)'; });
            d3.select(this).attr('transform', 'translate(' + d.x + ', 0)');
            yAxis.each(function(dd, i, ii) { if(ii === d.parent.key) p.dimensions[i] = dd; });
            p.contextLayer && p.contextLayer.render(p.panels, false, !someFiltersActive(p));
            p.focusLayer.render && p.focusLayer.render(p.panels);
        })
        .on('dragend', function(d) {
            var p = d.parent;
            d.x = d.xScale(d.xIndex);
            d.canvasX = d.x * d.model.canvasPixelRatio;
            updatePanelLayout(yAxis, p);
            d3.select(this)
                .attr('transform', function(d) { return 'translate(' + d.x + ', 0)'; });
            p.contextLayer && p.contextLayer.render(p.panels, false, !someFiltersActive(p));
            p.focusLayer && p.focusLayer.render(p.panels);
            p.pickLayer && p.pickLayer.render(p.panels, true);
            state.linePickActive(true);

            if(callbacks && callbacks.axesMoved) {
                callbacks.axesMoved(p.key, p.dimensions.map(function(dd) {return dd.crossfilterDimensionIndex;}));
            }

            // remove dragged property when dragging ends
            d3.selectAll('.' + c.cn.yAxis).each(function(datum, index) {
                // d3.select(this).node().__data__.prohibitDrawingDensity = null;
                gd.data[0].dimensions[index].hover = null;
            });
            Plotly.redraw(gd);
        })
    );

    yAxis.exit()
        .remove();

    var axisOverlays = yAxis.selectAll('.' + c.cn.axisOverlays)
        .data(repeat, keyFun);

    axisOverlays.enter()
        .append('g')
        .classed(c.cn.axisOverlays, true);

    axisOverlays.selectAll('.' + c.cn.axis).remove();

    var axis = axisOverlays.selectAll('.' + c.cn.axis)
        .data(repeat, keyFun);

    axis.enter()
        .append('g')
        .classed(c.cn.axis, true);

    axis
        .each(function(d) {
            var wantedTickCount = d.model.height / d.model.tickDistance;
            var scale = d.domainScale;
            var sdom = scale.domain();
            d3.select(this)
                .call(d3.svg.axis()
                    .orient('left')
                    .tickSize(4)
                    .outerTickSize(2)
                    .ticks(wantedTickCount, d.tickFormat) // works for continuous scales only...
                    .tickValues(d.ordinal ? // and this works for ordinal scales
                        sdom :
                        null)
                    .tickFormat(d.ordinal ? function(d) { return d; } : null)
                    .scale(scale));
            Drawing.font(axis.selectAll('text'), d.model.tickFont);
        });

    axis.selectAll('.domain, .tick>line')
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-opacity', 0.25)
        .attr('stroke-width', '1px');

    axis.selectAll('text')
        .style('text-shadow', '1px 1px 1px #fff, -1px -1px 1px #fff, 1px -1px 1px #fff, -1px 1px 1px #fff')
        .style('cursor', 'default')
        .style('user-select', 'none');

    var axisHeading = axisOverlays.selectAll('.' + c.cn.axisHeading)
        .data(repeat, keyFun);

    axisHeading.enter()
        .append('g')
        .classed(c.cn.axisHeading, true);

    var axisTitle = axisHeading.selectAll('.' + c.cn.axisTitle)
        .data(repeat, keyFun);

    axisTitle.enter()
        .append('text')
        .classed(c.cn.axisTitle, true)
        .attr('text-anchor', 'middle')
        .style('cursor', 'ew-resize')
        .style('user-select', 'none')
        .style('pointer-events', 'auto');

    axisTitle
        .attr('transform', 'translate(0,' + -c.axisTitleOffset + ')')
        .text(function(d) { return d.label; })
        .each(function(d) { Drawing.font(d3.select(this), d.model.labelFont); });

    var axisExtent = axisOverlays.selectAll('.' + c.cn.axisExtent)
        .data(repeat, keyFun);

    axisExtent.enter()
        .append('g')
        .classed(c.cn.axisExtent, true);

    var axisExtentTop = axisExtent.selectAll('.' + c.cn.axisExtentTop)
        .data(repeat, keyFun);

    axisExtentTop.enter()
        .append('g')
        .classed(c.cn.axisExtentTop, true);

    axisExtentTop
        .attr('transform', 'translate(' + 0 + ',' + -c.axisExtentOffset + ')');

    var axisExtentTopText = axisExtentTop.selectAll('.' + c.cn.axisExtentTopText)
        .data(repeat, keyFun);

    function extremeText(d, isTop) {
        if(d.ordinal) return '';
        var domain = d.domainScale.domain();
        return d3.format(d.tickFormat)(domain[isTop ? domain.length - 1 : 0]);
    }

    axisExtentTopText.enter()
        .append('text')
        .classed(c.cn.axisExtentTopText, true)
        .call(styleExtentTexts);

    axisExtentTopText
        .text(function(d) { return extremeText(d, true); })
        .each(function(d) { Drawing.font(d3.select(this), d.model.rangeFont); });

    var axisExtentBottom = axisExtent.selectAll('.' + c.cn.axisExtentBottom)
        .data(repeat, keyFun);

    axisExtentBottom.enter()
        .append('g')
        .classed(c.cn.axisExtentBottom, true);

    axisExtentBottom
        .attr('transform', function(d) {
            return 'translate(' + 0 + ',' + (d.model.height + c.axisExtentOffset) + ')';
        });

    var axisExtentBottomText = axisExtentBottom.selectAll('.' + c.cn.axisExtentBottomText)
        .data(repeat, keyFun);

    axisExtentBottomText.enter()
        .append('text')
        .classed(c.cn.axisExtentBottomText, true)
        .attr('dy', '0.75em')
        .call(styleExtentTexts);

    axisExtentBottomText
        .text(function(d) { return extremeText(d); })
        .each(function(d) { Drawing.font(d3.select(this), d.model.rangeFont); });

    brush.ensureAxisBrush(axisOverlays);
};
