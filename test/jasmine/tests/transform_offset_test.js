var Plots = require('@src/plots/plots');
var Lib = require('@src/lib');

var supplyAllDefaults = require('../assets/supply_defaults');

describe('Test offset transform defaults:', function() {
    function _supply(trace, layout) {
        layout = layout || {};
        Lib.extendDeep(layout, {
            _subplots: {cartesian: ['xy'], xaxis: ['x'], yaxis: ['y']},
            _modules: [],
            _basePlotModules: []
        });
        return Plots.supplyTraceDefaults(trace, {type: trace.type || 'scatter'}, 0, layout);
    }

    it('should coerce all attributes', function() {
        var out = _supply({
            x: [1, 2, 3],
            y: [0, 2, 1],
            transforms: [{
                type: 'offset'
            }]
        });

        expect(out.transforms[0].type).toEqual('offset');
        expect(out.transforms[0].enabled).toBe(true);
    });
});

describe('Test offset transform calc:', function() {
    var base = {
        x: [1, 2, 3],
        y: [1, 2, 3],
        transforms: [{ type: 'offset' }]
    };

    function extend(update) {
        return Lib.extendDeep({}, base, update);
    }

    function calcDatatoTrace(calcTrace) {
        return calcTrace[0].trace;
    }

    function _transform(data, layout) {
        var gd = {
            data: data,
            layout: layout || {}
        };

        supplyAllDefaults(gd);
        Plots.doCalcdata(gd);

        return gd.calcdata.map(calcDatatoTrace);
    }

    it('should add X offset to all points', function() {
        var out = _transform([extend({
            transforms: [{
                x: 1
            }]
        })]);

        expect(out[0].x).toEqual([2, 3, 4]);
        expect(out[0].y).toEqual([1, 2, 3]);
    });

    it('should add negative X offset to all points', function() {
        var out = _transform([extend({
            transforms: [{
                x: -0.5
            }]
        })]);

        expect(out[0].x).toEqual([0.5, 1.5, 2.5]);
        expect(out[0].y).toEqual([1, 2, 3]);
    });

    it('should add Y offset to all points', function() {
        var out = _transform([extend({
            transforms: [{
                y: 1
            }]
        })]);

        expect(out[0].x).toEqual([1, 2, 3]);
        expect(out[0].y).toEqual([2, 3, 4]);
    });

    it('should add negative X offset to all points', function() {
        var out = _transform([extend({
            transforms: [{
                y: -0.5
            }]
        })]);

        expect(out[0].x).toEqual([1, 2, 3]);
        expect(out[0].y).toEqual([0.5, 1.5, 2.5]);
    });

});
