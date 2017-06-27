/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var BoxDiribet = {};

BoxDiribet.attributes = require('./attributes');
BoxDiribet.layoutAttributes = require('./layout_attributes');
BoxDiribet.supplyDefaults = require('./defaults');
BoxDiribet.supplyLayoutDefaults = require('./layout_defaults');
BoxDiribet.calc = require('./calc');
BoxDiribet.setPositions = require('./set_positions');
BoxDiribet.plot = require('./plot');
BoxDiribet.style = require('./style');
BoxDiribet.hoverPoints = require('./hover');
BoxDiribet.eventData = require('./event_data');

BoxDiribet.moduleType = 'trace';
BoxDiribet.name = 'box-diribet';
BoxDiribet.basePlotModule = require('../../plots/cartesian');
BoxDiribet.categories = ['cartesian', 'symbols', 'oriented', 'box', 'showLegend'];
BoxDiribet.meta = {
    description: [
        'In vertical (horizontal) box plots,',
        'statistics are computed using `y` (`x`) values.',
        'By supplying an `x` (`y`) array, one box per distinct x (y) value',
        'is drawn',
        'If no `x` (`y`) {array} is provided, a single box is drawn.',
        'That box position is then positioned with',
        'with `name` or with `x0` (`y0`) if provided.',
        'Each box spans from quartile 1 (Q1) to quartile 3 (Q3).',
        'The second quartile (Q2) is marked by a line inside the box.',
        'By default, the whiskers correspond to the box\' edges',
        '+/- 1.5 times the interquartile range (IQR = Q3-Q1),',
        'see *boxpoints* for other options.'
    ].join(' ')
};

module.exports = BoxDiribet;
