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
                {arrayOk: false, dflt: 0})
        }
    },
    avgmarker: {
        symbol: extendFlat({}, scatterMarkerAttrs.symbol,
            {arrayOk: false, dflt: 'diamond'}),
        opacity: extendFlat({}, scatterMarkerAttrs.opacity,
            {arrayOk: false, dflt: 1}),
        size: extendFlat({}, scatterMarkerAttrs.size,
            {arrayOk: false, dflt: 10}),
        color: extendFlat({}, scatterMarkerAttrs.color,
            {arrayOk: false, dflt: '#568ed5'}),
        line: {
            color: extendFlat({}, scatterMarkerLineAttrs.color,
                {arrayOk: false, dflt: colorAttrs.defaultLine}),
            width: extendFlat({}, scatterMarkerLineAttrs.width,
                {arrayOk: false, dflt: 0})
        }
    },
    invalidmarker: {
        symbol: extendFlat({}, scatterMarkerAttrs.symbol,
            {arrayOk: false, dflt: 'diamond'}),
        opacity: extendFlat({}, scatterMarkerAttrs.opacity,
            {arrayOk: false, dflt: 1}),
        size: extendFlat({}, scatterMarkerAttrs.size,
            {arrayOk: false, dflt: 20}),
        color: extendFlat({}, scatterMarkerAttrs.color,
            {arrayOk: false, dflt: '#ff8888'}),
        line: {
            color: extendFlat({}, scatterMarkerLineAttrs.color,
                {arrayOk: false, dflt: colorAttrs.defaultLine}),
            width: extendFlat({}, scatterMarkerLineAttrs.width,
                {arrayOk: false, dflt: 0})
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
    specificationLimitLine: {
        color: {
            valType: 'color',
            role: 'style',
            description: 'Sets the color of the specification limit line.'
        },
        width: {
            valType: 'number',
            role: 'style',
            min: 0,
            dflt: 2,
            description: 'Sets the width (in px) of the specification limit line.'
        }
    },
    naturalBoundaryLine: {
        color: {
            valType: 'color',
            role: 'style',
            description: 'Sets the color of the natural boundary line.'
        },
        width: {
            valType: 'number',
            role: 'style',
            min: 0,
            dflt: 2,
            description: 'Sets the width (in px) of the natural boundary line.'
        }
    },
    probabilityDensityLine: {
        color: {
            valType: 'color',
            role: 'style',
            description: 'Sets the color of the probability density line.'
        },
        width: {
            valType: 'number',
            role: 'style',
            min: 0,
            dflt: 2,
            description: 'Sets the width (in px) of the probability density line.'
        }
    },
    fillcolor: scatterAttrs.fillcolor,
    normalize: {
        valType: 'boolean',
        dflt: true,
        description: 'Whether boxes should be normalized so all boxes and boundaries are plotted on [-1, 1] scale.'
    }
};
