/**
* Copyright 2012-2019, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var Lib = require('../../lib');
var attributes = require('./attributes');
var handleDomainDefaults = require('../../plots/domain').defaults;
var handleText = require('../bar/defaults').handleText;

function handleLabelsAndValues(labels, values) {
    var hasLabels = Array.isArray(labels);
    var hasValues = Lib.isArrayOrTypedArray(values);
    var len = Math.min(
        hasLabels ? labels.length : Infinity,
        hasValues ? values.length : Infinity
    );

    if(!isFinite(len)) len = 0;

    if(len && hasValues) {
        var sum = 0;
        for(var i = 0; i < len; i++) {
            var v = +values[i];
            if(v < 0) {
                sum = 0;
                break;
            }
            sum += v;
        }
        if(!sum) len = 0;
    }

    return {
        hasLabels: hasLabels,
        hasValues: hasValues,
        len: len
    };
}

function supplyDefaults(traceIn, traceOut, defaultColor, layout) {
    function coerce(attr, dflt) {
        return Lib.coerce(traceIn, traceOut, attributes, attr, dflt);
    }

    var labels = coerce('labels');
    var values = coerce('values');

    var res = handleLabelsAndValues(labels, values);
    var len = res.len;
    traceOut._hasLabels = res.hasLabels;
    traceOut._hasValues = res.hasValues;

    if(!traceOut._hasLabels &&
        traceOut._hasValues
    ) {
        coerce('label0');
        coerce('dlabel');
    }

    if(!len) {
        traceOut.visible = false;
        return;
    }
    traceOut._length = len;

    var lineWidth = coerce('marker.line.width');
    if(lineWidth) coerce('marker.line.color');

    coerce('marker.colors');

    coerce('scalegroup');
    // TODO: hole needs to be coerced to the same value within a scaleegroup

    var textData = coerce('text');
    var textTemplate = coerce('texttemplate');
    var textInfo;
    if(!textTemplate) textInfo = coerce('textinfo', Array.isArray(textData) ? 'text+percent' : 'percent');

    coerce('hovertext');
    coerce('hovertemplate');

    if(textTemplate || (textInfo && textInfo !== 'none')) {
        var textposition = coerce('textposition');
        handleText(traceIn, traceOut, layout, coerce, textposition, {
            moduleHasSelected: false,
            moduleHasUnselected: false,
            moduleHasConstrain: false,
            moduleHasCliponaxis: false,
            moduleHasTextangle: false,
            moduleHasInsideanchor: false
        });

        var hasBoth = Array.isArray(textposition) || textposition === 'auto';
        var hasOutside = hasBoth || textposition === 'outside';
        if(hasOutside) {
            coerce('automargin');
        }
    }

    handleDomainDefaults(traceOut, layout, coerce);

    var hole = coerce('hole');
    var title = coerce('title.text');
    if(title) {
        var titlePosition = coerce('title.position', hole ? 'middle center' : 'top center');
        if(!hole && titlePosition === 'middle center') traceOut.title.position = 'top center';
        Lib.coerceFont(coerce, 'title.font', layout.font);
    }

    coerce('sort');
    coerce('direction');
    coerce('rotation');
    coerce('pull');
}

module.exports = {
    handleLabelsAndValues: handleLabelsAndValues,
    supplyDefaults: supplyDefaults
};
