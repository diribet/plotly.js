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
    require('./box-diribet')
]);

// supported locales
Plotly.register([
    require('./locales/cs'),
    require('./locales/sk'),
    require('./locales/de'),
    require('./locales/pl'),
    require('./locales/hu'),
    require('./locales/zh'),
    require('./locales/ru'),
    require('./locales/da')
]);

module.exports = Plotly;
