/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var scatterAttrs = require('../scatter/attributes');
var colorAttrs = require('../../components/color/attributes');
var extendFlat = require('../../lib/extend').extendFlat;

var scatterMarkerAttrs = scatterAttrs.marker,
    scatterMarkerLineAttrs = scatterMarkerAttrs.line;


module.exports = {
    y: {
        valType: 'data_array',
        description: [
            'Sets the y sample data or coordinates.',
            'See trace overview for more info about data format.'
        ].join(' ')
    },
    x: {
        valType: 'data_array',
        description: [
            'Sets the x sample data or coordinates.',
            'See trace overview for more info about data format.'
        ].join(' ')
    },
    x0: {
        valType: 'any',
        role: 'info',
        description: [
            'Sets the x coordinate of the box.',
            'See overview for more info.'
        ].join(' ')
    },
    y0: {
        valType: 'any',
        role: 'info',
        description: [
            'Sets the y coordinate of the box.',
            'See overview for more info.'
        ].join(' ')
    },
    xcalendar: scatterAttrs.xcalendar,
    ycalendar: scatterAttrs.ycalendar,
    whiskerwidth: {
        valType: 'number',
        min: 0,
        max: 1,
        dflt: 0.5,
        role: 'style',
        description: [
            'Sets the width of the whiskers relative to',
            'the box\' width.',
            'For example, with 1, the whiskers are as wide as the box(es).'
        ].join(' ')
    },
    boxmean: {
        valType: 'enumerated',
        values: [true, 'sd', false],
        dflt: false,
        role: 'style',
        description: [
            'If *true*, the mean of the box(es)\' underlying distribution is',
            'drawn as a dashed line inside the box(es).',
            'If *sd* the standard deviation is also drawn.'
        ].join(' ')
    },
    orientation: {
        valType: 'enumerated',
        values: ['v', 'h'],
        role: 'style',
        description: [
            'Sets the orientation of the box(es).',
            'If *v* (*h*), the distribution is visualized along',
            'the vertical (horizontal).'
        ].join(' ')
    },
    marker: {
        outliercolor: {
            valType: 'color',
            dflt: 'rgba(0, 0, 0, 0)',
            role: 'style',
            description: 'Sets the color of the outlier sample points.'
        },
        symbol: extendFlat({}, scatterMarkerAttrs.symbol,
            {arrayOk: false}),
        opacity: extendFlat({}, scatterMarkerAttrs.opacity,
            {arrayOk: false, dflt: 1}),
        size: extendFlat({}, scatterMarkerAttrs.size,
            {arrayOk: false}),
        color: extendFlat({}, scatterMarkerAttrs.color,
            {arrayOk: false}),
        line: {
            color: extendFlat({}, scatterMarkerLineAttrs.color,
                {arrayOk: false, dflt: colorAttrs.defaultLine}),
            width: extendFlat({}, scatterMarkerLineAttrs.width,
                {arrayOk: false, dflt: 0}),
            outliercolor: {
                valType: 'color',
                role: 'style',
                description: [
                    'Sets the border line color of the outlier sample points.',
                    'Defaults to marker.color'
                ].join(' ')
            },
            outlierwidth: {
                valType: 'number',
                min: 0,
                dflt: 1,
                role: 'style',
                description: [
                    'Sets the border line width (in px) of the outlier sample points.'
                ].join(' ')
            }
        }
    },
    line: {
        color: {
            valType: 'color',
            role: 'style',
            description: 'Sets the color of line bounding the box(es).'
        },
        width: {
            valType: 'number',
            role: 'style',
            min: 0,
            dflt: 2,
            description: 'Sets the width (in px) of line bounding the box(es).'
        }
    },
    fillcolor: scatterAttrs.fillcolor
};
