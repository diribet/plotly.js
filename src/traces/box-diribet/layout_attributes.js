/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';


module.exports = {
    boxmode: {
        valType: 'enumerated',
        values: ['group', 'overlay'],
        dflt: 'overlay',
        role: 'info',
        description: [
            'Determines how boxes at the same location coordinate',
            'are displayed on the graph.',
            'If *group*, the boxes are plotted next to one another',
            'centered around the shared location.',
            'If *overlay*, the boxes are plotted over one another,',
            'you might need to set *opacity* to see them multiple boxes.'
        ].join(' ')
    },
    boxgap: {
        valType: 'number',
        min: 0,
        max: 1,
        dflt: 0.3,
        role: 'style',
        description: [
            'Sets the gap (in plot fraction) between boxes of',
            'adjacent location coordinates.'
        ].join(' ')
    },
    boxgroupgap: {
        valType: 'number',
        min: 0,
        max: 1,
        dflt: 0.3,
        role: 'style',
        description: [
            'Sets the gap (in plot fraction) between boxes of',
            'the same location coordinate.'
        ].join(' ')
    },
    showProbabilityDensity: {
        valType: 'enumerated',
        values: ['always', 'hover', 'never'],
        dflt: 'hover',
        role: 'style',
        description: 'Whether probability density line is always shown (true), shown on hover (\'hover\') or never shown (false).'
    },
    probabilityDensityMargin: {
        valType: 'number',
        min: 0,
        max: 1,
        dflt: 0.1,
        role: 'style',
        description: 'Margin between probability density line and box boundary.'
    },
    scaleIgnoresOutliers: {
        valType: 'boolean',
        dflt: true,
        role: 'style',
        description: 'Whether the scale of the axis should contain outliers or not.'
    },
    showOutliersText: {
        valType: 'string',
        dflt: 'Show outliers.',
        description: 'Text that is displayed on hover over outliers marker.'
    }    
};
