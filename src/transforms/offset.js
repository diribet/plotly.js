'use strict';

var Lib = require('../lib');

exports.moduleType = 'transform';

exports.name = 'offset';

exports.attributes = {
    enabled: {
        valType: 'boolean',
        dflt: true,
        role: 'info',
        editType: 'calc',
        description: [
            'Determines whether this sort transform is enabled or disabled.'
        ].join(' ')
    },
    x: {
        valType: 'number',
        role: 'info',
        editType: 'calc',
        description: 'Sets the X offset.'
    },
    y: {
        valType: 'number',
        role: 'info',
        editType: 'calc',
        description: 'Sets the Y offset.'
    },
    editType: 'calc'
};

exports.supplyDefaults = function(transformIn) {
    var transformOut = {};

    function coerce(attr, dflt) {
        return Lib.coerce(transformIn, transformOut, exports.attributes, attr, dflt);
    }

    coerce('enabled');
    coerce('x');
    coerce('y');

    return transformOut;
};

exports.calcTransform = function(gd, trace, opts) {
    if(!opts.enabled) return;

    var xOffset = opts.x;
    var yOffset = opts.y;

    if (xOffset) {
        trace.x = trace.x.map(function(value) { return value + xOffset; });
    }

    if (yOffset) {
        trace.y = trace.y.map(function(value) { return value + yOffset; });
    }
};
