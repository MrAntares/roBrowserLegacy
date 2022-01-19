define(["exports", "Renderer/Effects/Tiles", "Renderer/Effects/FlatColorTile"], function (exports, _Tiles, _FlatColorTile) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AppleEffects = undefined;
  exports.BragiEffects = undefined;
  exports.SinEffects = undefined;
  exports.EvillandEffects = undefined;

  var _FlatColorTile2 = _interopRequireDefault(_FlatColorTile);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

 const DissonanceEffects = exports.DissonanceEffects = [(0, _FlatColorTile2.default)('dissonance', {
    r: 0xff/255,
    g: 0xff/255,
    b: 0xff/255,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/lens_w.bmp')];

 const LullabyEffects = exports.LullabyEffects = [(0, _FlatColorTile2.default)('lullaby', {
    r: 0xed/255,
    g: 0x9e/255,
    b: 0xff/255,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/zz.bmp')];
  
 const MrKimEffects = exports.MrKimEffects = [(0, _FlatColorTile2.default)('mrkim', {
    r: 0xfc/255,
    g: 0xc7/255,
    b: 0xc7/255,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/pocket.bmp')];
  
 const EtChaosEffects = exports.EtChaosEffects = [(0, _FlatColorTile2.default)('etchaos', {
    r: 0x80/255,
    g: 0xff/255,
    b: 0xc2/255,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/lens_g.bmp')];
    
 const DrumEffects = exports.DrumEffects = [(0, _FlatColorTile2.default)('drum', {
    r: 0xed/255,
    g: 0x65/255,
    b: 0xfc/255,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/melody_b.bmp')];

 const NibelungEffects = exports.NibelungEffects = [(0, _FlatColorTile2.default)('nibelung', {
    r: 0x1c/255,
    g: 0xec/255,
    b: 0xff/255,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/twirl.bmp')];

 const LokiEffects = exports.LokiEffects = [(0, _FlatColorTile2.default)('loki', {
    r: 0xdc/255,
    g: 0x65/255,
    b: 0xfc/255,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/safeline.bmp')];

 //needs to be red yellow blue random
 const AbyssEffects = exports.AbyssEffects = [(0, _FlatColorTile2.default)('abyss', {
    r: 0xff/255,
    g: 0xff/255,
    b: 0xff/255,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/stoneorb.bmp')];

 const SiegfiedEffects = exports.SiegfiedEffects = [(0, _FlatColorTile2.default)('siegfried', {
    r: 0x48/255,
    g: 0x3b/255,
    b: 0xff/255,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/lens_b.bmp')];

 const WhistleEffects = exports.WhistleEffects = [(0, _FlatColorTile2.default)('whislte', {
    r: 0xff/255,
    g: 0xc0/255,
    b: 0xcb/255,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/melody_b.bmp')];

  const SinEffects = exports.SinEffects = [(0, _FlatColorTile2.default)('sinsun', {
    r: 0xff/255,
    g: 0.8,
    b: 0.85,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/lens_r.bmp')];
 
  exports.BragiEffects = function BragiEffects(){
	  return [(0, _FlatColorTile2.default)('bragi', {
		r: 0.9,
		g: 0.9,
		b: 1,
		a: 0.05
	  }), (0, _Tiles.HoveringTexture)('data/texture/effect/spell_0'+( Math.floor(Math.random()*7) + 1 )+'.bmp', 0.5)];
  };

  const AppleEffects = exports.AppleEffects = [(0, _FlatColorTile2.default)('apple', {
    r: 0xff/255,
    g: 0xff/255,
    b: 0x00/255,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/idun_apple.bmp')];

  const UglyEffects = exports.UglyEffects = [(0, _FlatColorTile2.default)('ugly', {
    r: 0xff/255,
    g: 0xff/255,
    b: 0xff/255,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/lens_w.bmp')];

  const HummingEffects = exports.HummingEffects = [(0, _FlatColorTile2.default)('humming', {
    r: 0xe6/255,
    g: 0xd1/255,
    b: 0xd1/255,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/melody_a.bmp')];

  const ForgetEffects = exports.ForgetEffects = [(0, _FlatColorTile2.default)('humming', {
    r: 0x1c/255,
    g: 0xff/255,
    b: 0x73/255,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/lens_g.bmp')];

  const FortuneEffects = exports.FortuneEffects = [(0, _FlatColorTile2.default)('fortune', {
    r: 0xfc/255,
    g: 0x6f/255,
    b: 0x65/255,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/heart_1.bmp')];

  const ServiceEffects = exports.ServiceEffects = [(0, _FlatColorTile2.default)('service', {
    r: 0xff/255,
    g: 0x80/255,
    b: 0xb7/255,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/safeline.bmp')];

  const GospelEffects = exports.GospelEffects = [(0, _FlatColorTile2.default)('gospel', {
    r: 0xff/255,
    g: 0xff/255,
    b: 0xff/255,
    a: 0.05
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/cross_old.bmp')];

  const FogEffects = exports.FogEffects = [(0, _FlatColorTile2.default)('fog', {
    r: 0xaa/255,
    g: 0xaa/255,
    b: 0xaa/255,
    a: 0.6
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/lens_w.bmp')];

  const GravityEffects = exports.GravityEffects = [(0, _FlatColorTile2.default)('gravity', {
    r: 0xff/255,
    g: 0xff/255,
    b: 0xff/255,
    a: 0.2
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/lens_w.bmp')];

  const EvillandEffects = exports.EvillandEffects = [(0, _FlatColorTile2.default)('gray', {
    r: 0xa0/255,
    g: 0xa0/255,
    b: 0xa0/255,
    a: 0.2
  }), (0, _Tiles.HoveringTexture)('data/texture/effect/curse.bmp')];
  
 
});
