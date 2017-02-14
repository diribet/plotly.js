/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var Lib = require('../../lib');
var Registry = require('../../registry');
var Color = require('../../components/color');

var attributes = require('./attributes');

module.exports = function supplyDefaults(traceIn, traceOut, defaultColor, layout) {
    function coerce(attr, dflt) {
        return Lib.coerce(traceIn, traceOut, attributes, attr, dflt);
    }

    var y = coerce('y'),
	    x = coerce('x'),
	    defaultOrientation;
	
    function isBoxStats(data) {
    	return data && data.length && typeof data[0] == "object";
    }
    
	if(isBoxStats(y)) {
	    defaultOrientation = 'v';
	    if(!x) coerce('x0');
	} else if(isBoxStats(x)) {
	    defaultOrientation = 'h';
	    if(!y) coerce('y0');
	} else {
	    traceOut.visible = false;
	    return;
	}
    
    var handleCalendarDefaults = Registry.getComponentMethod('calendars', 'handleTraceDefaults');
    handleCalendarDefaults(traceIn, traceOut, ['x', 'y'], layout);

    coerce('orientation', defaultOrientation);
    coerce('normalize');

    coerce('line.color', (traceIn.marker || {}).color || defaultColor);
    coerce('line.width', 2);
    coerce('fillcolor', Color.addOpacity(traceOut.line.color, 0.5));

    coerce('whiskerwidth');

    coerce('specificationLimitLine.color');
    coerce('specificationLimitLine.width');
    coerce('naturalBoundaryLine.color');
    coerce('naturalBoundaryLine.width');
    coerce('probabilityDensityLine.color');
    coerce('probabilityDensityLine.width');
    
    coerce('marker.symbol');
    coerce('marker.opacity');
    coerce('marker.size');
    coerce('marker.color', traceOut.line.color);
    coerce('marker.line.color');
    coerce('marker.line.width');

    coerce('avgmarker.symbol');
    coerce('avgmarker.opacity');
    coerce('avgmarker.size');
    coerce('avgmarker.color');
    coerce('avgmarker.line.color');
    coerce('avgmarker.line.width');
    
    coerce('invalidmarker.symbol');
    coerce('invalidmarker.opacity');
    coerce('invalidmarker.size');
    coerce('invalidmarker.color');
    coerce('invalidmarker.line.color');
    coerce('invalidmarker.line.width');

};
