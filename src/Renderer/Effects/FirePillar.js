/**
 * Renderer/Effects/FirePillar.js
 *
 * Generate fire pillar effect
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * 
 */

define(['Renderer/Effects/Cylinder'],
function(      Cylinder	) {
	
    function FirePillarEffect(pos, tick, AID) {
        this.cylinders = [
            new Cylinder(pos, 1.0, 0.5, 7, 'magic_red', tick),
            new Cylinder(pos, 1.5, 0.7, 5, 'magic_red', tick),
            new Cylinder(pos, 2.0, 1.0, 3, 'magic_red', tick)
        ];
    }
    Object.defineProperty(FirePillarEffect, "renderBeforeEntities", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    FirePillarEffect.init = function (gl) {
        Cylinder.init(gl);
        this.ready = true;
    };
    FirePillarEffect.free = function (gl) {
        this.ready = false;
        Cylinder.free(gl);
    };
    FirePillarEffect.beforeRender = function () {
        Cylinder.beforeRender.apply(Cylinder, arguments);
    };
    FirePillarEffect.afterRender = function () {
        Cylinder.afterRender.apply(Cylinder, arguments);
    };
    FirePillarEffect.prototype.init = function (gl) {
        for (var _i = 0, _a = this.cylinders; _i < _a.length; _i++) {
            var cylinder = _a[_i];
            cylinder.init(gl);
        }
        this.ready = true;
    };
    FirePillarEffect.prototype.free = function (gl) {
        this.ready = false;
        for (var _i = 0, _a = this.cylinders; _i < _a.length; _i++) {
            var cylinder = _a[_i];
            cylinder.free(gl);
        }
    };
    FirePillarEffect.prototype.render = function () {
        for (var _i = 0, _a = this.cylinders; _i < _a.length; _i++) {
            var cylinder = _a[_i];
            cylinder.render.apply(cylinder, arguments);
        }
    };
    return FirePillarEffect;
});