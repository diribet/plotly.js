/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var Plotly = require('./core');

Plotly.register([
    require('./box'),
    require('./box-diribet'),
    require('./heatmap'),
    require('./parcoords')
]);

// supported locales
Plotly.register([
    require('./locales/cs'),
    require('./locales/sk'),
    require('./locales/de'),
    require('./locales/pl'),
    require('./locales/hu'),
    require('./locales/zh-cn'),
    require('./locales/ru'),
    require('./locales/da'),
	require('./locales/fr'),
    require('./locales/it')
]);

// transforms
//
// Please note that all *transform* methods are executed before
// all *calcTransform* methods - which could possibly lead to
// unexpected results when applying multiple transforms of different types
// to a given trace.
//
// For more info, see:
// https://github.com/plotly/plotly.js/pull/978#pullrequestreview-2403353
//
Plotly.register([
    require('./offset')
]);

// diribet custom modules
Plotly.register([
    require('./diribet-outliers')
]);

module.exports = Plotly;
