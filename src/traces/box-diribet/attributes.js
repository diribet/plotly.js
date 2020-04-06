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
var dash = require('../../components/drawing/attributes').dash;

var scatterMarkerAttrs = scatterAttrs.marker,
    scatterMarkerLineAttrs = scatterMarkerAttrs.line;

module.exports = {
    y: {
        valType: 'data_array',
        editType: 'calc+clearAxisTypes',
        description: [
            'Sets the y sample data or coordinates.',
            'See trace overview for more info about data format.'
        ].join(' ')
    },
    x: {
        valType: 'data_array',
        editType: 'calc+clearAxisTypes',
        description: [
            'Sets the x sample data or coordinates.',
            'See trace overview for more info about data format.'
        ].join(' ')
    },
    x0: {
        valType: 'any',
        role: 'info',
        editType: 'calc+clearAxisTypes',
        description: [
            'Sets the x coordinate of the box.',
            'See overview for more info.'
        ].join(' ')
    },
    y0: {
        valType: 'any',
        role: 'info',
        editType: 'calc+clearAxisTypes',
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
        editType: 'calc',
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
        editType: 'calc+clearAxisTypes',
        description: [
            'Sets the orientation of the box(es).',
            'If *v* (*h*), the distribution is visualized along',
            'the vertical (horizontal).'
        ].join(' ')
    },
    marker: {
        symbol: extendFlat({}, scatterMarkerAttrs.symbol,
            {arrayOk: false, dflt: 'x', editType: 'plot'}),
        opacity: extendFlat({}, scatterMarkerAttrs.opacity,
            {arrayOk: false, dflt: 1, editType: 'style'}),
        size: extendFlat({}, scatterMarkerAttrs.size,
            {arrayOk: false, dflt: 5, editType: 'calc'}),
        color: extendFlat({}, scatterMarkerAttrs.color,
            {arrayOk: false, dflt: '#ff0000', editType: 'style'}),
        line: {
            color: extendFlat({}, scatterMarkerLineAttrs.color,
                {arrayOk: false, dflt: colorAttrs.defaultLine, editType: 'style'}),
            width: extendFlat({}, scatterMarkerLineAttrs.width,
                {arrayOk: false, dflt: 0, editType: 'style'})
        },
        editType: 'plot'
    },
    avgmarker: {
        symbol: extendFlat({}, scatterMarkerAttrs.symbol,
            {arrayOk: false, dflt: 'diamond', editType: 'plot'}),
        opacity: extendFlat({}, scatterMarkerAttrs.opacity,
            {arrayOk: false, dflt: 1, editType: 'style'}),
        size: extendFlat({}, scatterMarkerAttrs.size,
            {arrayOk: false, dflt: 10, editType: 'calc'}),
        color: extendFlat({}, scatterMarkerAttrs.color,
            {arrayOk: false, dflt: '#568ed5', editType: 'style'}),
        line: {
            color: extendFlat({}, scatterMarkerLineAttrs.color,
                {arrayOk: false, dflt: colorAttrs.defaultLine, editType: 'style'}),
            width: extendFlat({}, scatterMarkerLineAttrs.width,
                {arrayOk: false, dflt: 0, editType: 'style'})
        },
        editType: 'plot'
    },
    invalidmarker: {
        symbol: extendFlat({}, scatterMarkerAttrs.symbol,
            {arrayOk: false, dflt: 'diamond', editType: 'plot'}),
        opacity: extendFlat({}, scatterMarkerAttrs.opacity,
            {arrayOk: false, dflt: 1, editType: 'style'}),
        size: extendFlat({}, scatterMarkerAttrs.size,
            {arrayOk: false, dflt: 20, editType: 'calc'}),
        color: extendFlat({}, scatterMarkerAttrs.color,
            {arrayOk: false, dflt: '#ff8888', editType: 'style'}),
        line: {
            color: extendFlat({}, scatterMarkerLineAttrs.color,
                {arrayOk: false, dflt: colorAttrs.defaultLine, editType: 'style'}),
            width: extendFlat({}, scatterMarkerLineAttrs.width,
                {arrayOk: false, dflt: 0, editType: 'style'})
        },
        editType: 'plot'
    },
    line: {
        color: {
            valType: 'color',
            role: 'style',
            editType: 'style',
            description: 'Sets the color of line bounding the box(es).'
        },
        width: {
            valType: 'number',
            role: 'style',
            editType: 'style',
            min: 0,
            dflt: 2,
            description: 'Sets the width (in px) of line bounding the box(es).'
        },
        editType: 'plot'
    },
    specificationLimitLine: {
        color: {
            valType: 'color',
            role: 'style',
            editType: 'style',
            description: 'Sets the color of the specification limit line.'
        },
        dash: extendFlat({}, dash),
        width: {
            valType: 'number',
            role: 'style',
            editType: 'style',
            min: 0,
            dflt: 2,
            description: 'Sets the width (in px) of the specification limit line.'
        },
        editType: 'plot'
    },
    naturalBoundaryLine: {
        color: {
            valType: 'color',
            role: 'style',
            editType: 'style',
            description: 'Sets the color of the natural boundary line.'
        },
        dash: extendFlat({}, dash),
        width: {
            valType: 'number',
            role: 'style',
            editType: 'style',
            min: 0,
            dflt: 2,
            description: 'Sets the width (in px) of the natural boundary line.'
        },
        editType: 'plot'
    },
    probabilityDensityLine: {
        color: {
            valType: 'color',
            role: 'style',
            editType: 'style',
            description: 'Sets the color of the probability density line.'
        },
        dash: extendFlat({}, dash),
        width: {
            valType: 'number',
            role: 'style',
            editType: 'style',
            min: 0,
            dflt: 2,
            description: 'Sets the width (in px) of the probability density line.'
        },
        editType: 'plot'
    },
    fillcolor: scatterAttrs.fillcolor,
    normalize: {
        valType: 'boolean',
        dflt: true,
        editType: 'calc',
        description: 'Whether boxes should be normalized so all boxes and boundaries are plotted on [-1, 1] scale.'
    },
    normalizationFailedText: {
        valType: 'string',
        editType: 'style',
        dflt: 'Box normalization failed because of missing specification limits.',
        description: 'Text that is displayed on hover over non-normalized box.'
    },
    hoverindex: {
        valType: 'number',
        editType: 'calc',
        description: 'Index of currently hovered box.'
    },
    opacity: {
        valType: 'number',
        dflt: 1,
        editType: 'style',
        description: 'Opacity of a box.'
    }
};
