/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

module.exports = {
    scaleIgnoresOutliers: {
        valType: 'boolean',
        dflt: true,
        role: 'style',
        editType: 'calc',
        description: 'Whether the scale of the axis should contain outliers or not.'
    },
    outliersHoverText: {
        valType: 'string',
        role: 'style',
        editType: 'plot',
        description: 'Text that is displayed on hover over outliers marker.'
    }
};
