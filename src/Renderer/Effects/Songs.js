define(["exports", "Renderer/Effects/Tiles", "Renderer/Effects/FlatColorTile"], function (exports, _Tiles, _FlatColorTile) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AppleEffects = undefined;

  var _FlatColorTile2 = _interopRequireDefault(_FlatColorTile);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  const AppleEffects = exports.AppleEffects = [(0, _FlatColorTile2.default)('yellow', {
    r: 1.0,
    g: 1.0,
    b: 0,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/idun_apple.bmp')];
});