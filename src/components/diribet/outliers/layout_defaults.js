/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var Lib = require('../../../lib');
var layoutAttributes = require('./layout_attributes');

module.exports = function supplyLayoutDefaults(layoutIn, layoutOut) {
    function coerce(attr) {
        return Lib.coerce(layoutIn, layoutOut, layoutAttributes, attr);
    }
    
    coerce('scaleIgnoresOutliers');
    coerce('outliersHoverText');
};
