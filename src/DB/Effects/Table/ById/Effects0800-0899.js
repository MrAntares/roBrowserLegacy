/**
 * @module DB/Effects/Table/ById/Effects0800-0899
 *
 * Effects 800 to 899 of the effect table, in ID order (see EffectConst.js).
 * DB/Effects/EffectTable.js joins the parts; its header lists the parameters a row takes.
 */

import SpiritSphere from 'Renderer/Effects/SpiritSphere.js';
import { startCasterStrobe } from 'Renderer/Effects/CasterStrobe.js';
import CastCone from 'Renderer/Effects/CastCone.js';

export default {
	//800: [{}],	//EF_REDLINE	   Hell Inferno (red lights)
	//801: [{}],	//EF_FROSTDIVER3	   Jack Frost unit (ice spikes)

	802: [
		//EF_BOTTOM_BASILICA2	   White Imprison
		// F1=0, GI[0] - Alpha 65, Height 12.5
		{
			type: 'CYLINDER',
			textureName: 'alpha_down',
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 2.2,
			topSize: 2.2,
			height: 3.0,
			alphaMax: 65 / 255,
			blendMode: 2,
			rotateWithCamera: true,
			duration: 20000,
			attachedEntity: true
		},
		{
			// F1=0, GI[1] - Alpha 65, Height 12.9
			type: 'CYLINDER',
			textureName: 'alpha_down',
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 2.25,
			topSize: 2.25,
			height: 3.1,
			alphaMax: 65 / 255,
			blendMode: 2,
			rotateWithCamera: true,
			angleY: 10,
			duration: 20000,
			attachedEntity: true
		},
		{
			// F1=0, GI[2] - Alpha 15, Distance 0
			type: 'CYLINDER',
			textureName: 'alpha_down',
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 2.3,
			topSize: 2.3,
			height: 3.0,
			alphaMax: 15 / 255,
			blendMode: 2,
			rotateWithCamera: true,
			duration: 20000,
			attachedEntity: true
		},
		{
			// F1=0, GI[3] - Alpha 15, Distance 53.2
			type: 'CYLINDER',
			textureName: 'alpha_down',
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 2.3,
			topSize: 2.3,
			height: 3.0,
			alphaMax: 15 / 255,
			blendMode: 2,
			rotateWithCamera: true,
			angleY: 53.2,
			duration: 20000,
			attachedEntity: true
		},
		{
			wav: 'effect/wl_whiteimprison'
		}
	],

	803: [
		{
			//EF_RECOGNIZED	   Recognized Spell
			wav: 'effect/wl_recognizedspell'
		}
	],

	804: [
		{
			//EF_TETRA	   Tetra Vortex [S]
			wav: 'effect/wl_tetravortex'
		}
	],

	805: [
		{
			//EF_TETRACASTING	   Tetra Vortex cast animation (blinking colors)
			type: 'FUNC',
			attachedEntity: true,
			func: function EffectBodyColor(Params) {
				const entity = Params.Init.ownerEntity;
				entity.animations.add(function (tick) {
					if (!entity.cast.display) {
						//we don't know cast time here so.. let's hack
						entity._flashColor[0] = 1.0;
						entity._flashColor[1] = 1.0;
						entity._flashColor[2] = 1.0;
						entity._flashColor[3] = 1.0;
						entity.recalculateBlendingColor();
						return true;
					}
					entity._flashColor[0] = Math.random();
					entity._flashColor[1] = Math.random();
					entity._flashColor[2] = Math.random();
					entity._flashColor[3] = 0.5 + Math.random() / 2;
					entity.recalculateBlendingColor();
				});
			}
		}
	],

	//806: [{}],	//EF_FIREBALL3	   Flying by as fast as a rocket
	//807: [{}],	//EF_INTIMIDATE3	   Kidnapping sound
	//808: [{}],	//EF_RECOGNIZED2	   Like Recognized Spell, but one symbol
	//809: [{}],	//EF_CLOAKING3	   Shadowy filter [S]
	//810: [{}],	//EF_INTIMIDATE4	   Damp thud sound [S]

	811: [
		{
			//EF_STRETCH	   Body Painting
			wav: 'effect/bodypaint'
		}
	],

	812: [
		{
			//EF_BLACKBODY	   Black expanding aura
			// Kunai - Nightmare's cast start (official client, 60 ticks a second): a level
			// square of near-black fashasha.tga streaks one cell up, spreading fast for
			// 10 ticks and then slowly, fading out from tick 30 to its end on tick 57.
			type: 'PRIM',
			prim: 'quad',
			texture: 'fashasha',
			attachedEntity: false,
			duration: (57 * 1000) / 60,
			frames: 57,
			color: [10, 10, 10],
			height: 5,
			sizeSpeed: 1.5,
			sizeAccel: 1.5 / 14,
			sizeChangeFrame: 10,
			sizeChangeSpeed: 0.1,
			sizeChangeAccel: 0.1 / 30,
			alpha: 254,
			fadeOutFrame: 30
		},
		{
			// The caster strobes black and white on ticks 6 to 60, then recovers (CasterStrobe.js).
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				startCasterStrobe(Params.Init.ownerEntity);
			}
		}
	],

	813: [
		{
			//EF_ENERVATION	Masquerade - Enervation
			type: 'STR',
			file: 'enervation',
			attachedEntity: true
		}
	],

	814: [
		{
			//EF_ENERVATION2	Masquerade - Groomy
			type: 'STR',
			file: 'groomy',
			attachedEntity: true
		}
	],

	815: [
		{
			//EF_ENERVATION3	Masquerade - Ignorance
			type: 'STR',
			file: 'ignorance',
			attachedEntity: true
		}
	],

	816: [
		{
			//EF_ENERVATION4	Masquerade - Laziness
			type: 'STR',
			file: 'laziness',
			wav: 'effect/laziness',
			attachedEntity: true
		}
	],

	817: [
		{
			//EF_ENERVATION5	Masquerade - Unlucky
			type: 'STR',
			file: 'unlucky',
			attachedEntity: true
		}
	],

	818: [
		{
			//EF_ENERVATION6	Masquerade - Weakness
			type: 'STR',
			file: 'weakness',
			attachedEntity: true
		}
	],

	//819: [{}],	//EF_LINELINK4	   (Nothing)
	//820: [{}],	//EF_RG_COIN5	   Strip Accessory
	//821: [{}],	//EF_WATERFALL_ANI	   Waterfall

	822: [
		{
			wav: 'effect/dimension'
		}
	], //EF_BOTTOM_MANHOLE	   Dimension Door (spinning blue aura)

	823: [
		{
			//EF_MANHOLE	   in-the-manhole effect
			wav: 'effect/manhole'
		}
	],

	//824: [{}],	//EF_MAKEFEINT	   Some filter
	825: [
		{
			wav: 'effect/dimension'
		}
	], //EF_FORESTLIGHT6	   Dimension Door (aura + blue light)
	//826: [{}],	//EF_DARKCASTING2	   Expanding black casting anim:

	827: [
		{
			//EF_BOTTOM_ANI	   Chaos Panic (spinning brown aura)
			wav: 'effect/chaospanic'
		}
	],

	828: [
		{
			//EF_BOTTOM_MAELSTROM	   Maelstrom (spinning pink aura)
			wav: 'effect/maelstrom'
		}
	],

	829: [
		{
			//EF_BOTTOM_BLOODYLUST	   Bloody Lust (spinning red aura)
			wav: 'effect/bloodylust'
		}
	],

	830: [
		{
			//EF_BEGINSPELL_N1	   Blue aura (Arch Bishop cast animation)
			// The official client's two pulsing bubble crowns, light blue and white (CastConeSim.js).
			type: 'FUNC',
			attachedEntity: true,
			wav: 'effect/ef_beginspell',
			func: function (Params) {
				this.add(
					new CastCone(Params.Init.ownerEntity.position, Params.Inst.startTick, Params.Init.duration, {
						pulse: true
					}),
					Params
				);
			}
		}
	],

	831: [
		{
			//EF_BEGINSPELL_N2	   Blue cone cast aura (Enchanting Sky)
			// The official client's bubble cone in blue, over two blue squares on the ground (CastConeSim.js).
			type: 'FUNC',
			attachedEntity: true,
			wav: 'effect/ef_beginspell',
			func: function (Params) {
				this.add(
					new CastCone(Params.Init.ownerEntity.position, Params.Inst.startTick, Params.Init.duration, {
						variant: 0,
						ground: true
					}),
					Params
				);
			}
		}
	],

	832: [
		{
			//EF_HEAL_N	   Sonic Wave
			wav: 'effect/\xb1\xe2\xb0\xf8\xc6\xf7'
		}
	],

	833: [
		{
			//EF_CHOOKGI_N	   (Nothing) - Used for spheres (royal guard?)
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const spiritNum = Params.Init.spiritNum || 0;
				const Spheres = new SpiritSphere(Params.Init.ownerEntity, spiritNum, false);
				this.add(Spheres, Params);
			}
		}
	],

	//834: [{}],	//EF_JOBLVUP50_2	   Light shooting away circlish
	//835: [{}],	//EF_CHEMICAL2DASH2	   Fastness yellow-reddish
	//836: [{}],	//EF_CHEMICAL2DASH3	   Fastness yellow-pinkish
	//837: [{}],	//EF_ROLLINGCAST	   Casting [S]
	//838: [{}],	//EF_WATER_BELOW	   Watery aura
	//839: [{}],	//EF_WATER_FADE	   [Client Error]

	840: [
		{
			//EF_BEGINSPELL_N3	   Red cone cast aura
			// The official client's bubble cone in red, with no squares on the ground (CastConeSim.js).
			type: 'FUNC',
			attachedEntity: true,
			wav: 'effect/ef_beginspell',
			func: function (Params) {
				this.add(
					new CastCone(Params.Init.ownerEntity.position, Params.Inst.startTick, Params.Init.duration, {
						variant: 3
					}),
					Params
				);
			}
		}
	],

	841: [
		{
			//EF_BEGINSPELL_N4	   Green cone cast aura
			// The official client's bubble cone in green, with no squares on the ground (CastConeSim.js).
			type: 'FUNC',
			attachedEntity: true,
			wav: 'effect/ef_beginspell',
			func: function (Params) {
				this.add(
					new CastCone(Params.Init.ownerEntity.position, Params.Inst.startTick, Params.Init.duration, {
						variant: 4
					}),
					Params
				);
			}
		}
	],

	842: [
		{
			//EF_BEGINSPELL_N5	   Yellow cone cast aura
			// The official client's bubble cone in yellow, with no squares on the ground (CastConeSim.js).
			type: 'FUNC',
			attachedEntity: true,
			wav: 'effect/ef_beginspell',
			func: function (Params) {
				this.add(
					new CastCone(Params.Init.ownerEntity.position, Params.Inst.startTick, Params.Init.duration, {
						variant: 5
					}),
					Params
				);
			}
		}
	],

	843: [
		{
			//EF_BEGINSPELL_N6	   White cone cast aura
			// The official client's bubble cone in white, with no squares on the ground (CastConeSim.js).
			type: 'FUNC',
			attachedEntity: true,
			wav: 'effect/ef_beginspell',
			func: function (Params) {
				this.add(
					new CastCone(Params.Init.ownerEntity.position, Params.Inst.startTick, Params.Init.duration, {
						variant: 6
					}),
					Params
				);
			}
		}
	],

	//844: [{}],	//EF_BEGINSPELL_N7	   Purple cone

	845: [
		{
			//EF_BEGINSPELL_N8	   Turquoise cone cast aura (All in the Sky)
			// The official client's bubble cone in turquoise, with no squares on the ground (CastConeSim.js).
			type: 'FUNC',
			attachedEntity: true,
			wav: 'effect/ef_beginspell',
			func: function (Params) {
				this.add(
					new CastCone(Params.Init.ownerEntity.position, Params.Inst.startTick, Params.Init.duration, {
						variant: 8
					}),
					Params
				);
			}
		}
	],

	//846: [{}],	//EF_WATER_SMOKE	   (Nothing)

	847: [
		{
			//EF_DANCE1	   Gloomy Day (white/red light rays)
			wav: 'effect/\xbc\xf6\xc1\xdd\xc0\xba\xc7\xcf\xb7\xe7\xc0\xc7\xbf\xec\xbf\xef'
		}
	],

	//848: [{}],	//EF_DANCE2	   Gloomy Day (white/blue light rays)
	//849: [{}],	//EF_LINKPARTICLE	   (Nothing)
	//850: [{}],	//EF_SOULLIGHT2	   (Nothing)
	//851: [{}],	//EF_SPR_PARTICLE	   Green mushy-foggy stuff (dull)
	//852: [{}],	//EF_SPR_PARTICLE2	   Green mushy-foggy stuff (bright)
	//853: [{}],	//EF_SPR_PLANT	   Bright green flower area
	//854: [{}],	//EF_CHEMICAL_V	   Blue beam of light with notes
	//855: [{}],	//EF_SHOOTPARTICLE	   (Nothing)

	856: [
		{
			//EF_BOT_REVERB	   Reverberation (red eighth notes)
			type: '3D',
			file: 'effect/melody_b.bmp',
			red: 1,
			green: 0.6,
			blue: 0.6,
			alphaMax: 0.6,
			attachedEntity: true,
			duration: 100,
			size: 50,
			posz: 0.5,
			repeat: true
		},
		{
			wav: 'effect/reverberation'
		}
	],

	857: [
		{
			//EF_RAIN_PARTICLE	   Severe Rainstorm (falling red and blue beams)
			wav: 'effect/rainstorm'
		}
	],

	858: [
		{
			//EF_CHEMICAL_V2	   Deep Sleep Lullaby (two red beams and music notes)
			wav: 'effect/\xbe\xc8\xbd\xc4\xc0\xc7\xc0\xda\xc0\xe5\xb0\xa1'
		}
	],

	//859: [{}],	//EF_SECRA	   Holograph of text (blue)

	860: [
		{
			//EF_BOT_REVERB2	   Distorted note (blue)
			type: '3D',
			file: 'effect/melody_a.bmp',
			red: 0.6,
			green: 0.6,
			blue: 1,
			alphaMax: 0.6,
			attachedEntity: true,
			duration: 100,
			size: 50,
			posz: 0.5,
			repeat: true
		},
		{
			wav: 'effect/\xb3\xaa\xb6\xf4\xc0\xc7\xb3\xeb\xb7\xa1'
		}
	],

	861: [
		{
			//EF_CIRCLEPOWER2	   Green aura (from Circle of Life's Melody)
			wav: 'effect/\xbc\xf8\xc8\xaf\xc7\xcf\xb4\xc2\xc0\xda\xbf\xac\xc0\xc7\xbc\xd2\xb8\xae'
		}
	],

	862: [
		{
			//EF_SECRA2	   Randomize Spell (holograph of text)
			attachedEntity: true,
			wav: 'effect/ab_ancilla'
		},
		{
			alphaMax: 0.3,
			blendMode: 2,
			red: 1.0,
			green: 0.55,
			blue: 0.55,
			attachedEntity: true,
			duration: 1500,
			fadeIn: true,
			fadeOut: true,
			posz: 7,
			sizeEnd: 100,
			sizeSmooth: true,
			sizeStart: 850,
			zIndex: 10,
			type: '3D',
			file: 'effect/priest_spell.bmp'
		},
		{
			alphaMax: 0.3,
			blendMode: 2,
			red: 1.0,
			green: 0.6,
			blue: 0.6,
			attachedEntity: true,
			duration: 1500,
			fadeIn: true,
			fadeOut: true,
			posz: 7,
			sizeEnd: 100,
			sizeSmooth: true,
			sizeStart: 800,
			zIndex: 10,
			type: '3D',
			file: 'effect/priest_spell.bmp'
		},
		{
			alphaMax: 0.3,
			blendMode: 2,
			red: 1.0,
			green: 0.65,
			blue: 0.65,
			attachedEntity: true,
			duration: 1500,
			fadeIn: true,
			fadeOut: true,
			posz: 7,
			sizeEnd: 100,
			sizeSmooth: true,
			sizeStart: 750,
			zIndex: 10,
			type: '3D',
			file: 'effect/priest_spell.bmp'
		},
		{
			alphaMax: 0.3,
			blendMode: 2,
			red: 1.0,
			green: 0.7,
			blue: 0.7,
			attachedEntity: true,
			duration: 1500,
			fadeIn: true,
			fadeOut: true,
			posz: 7,
			sizeEnd: 100,
			sizeSmooth: true,
			sizeStart: 700,
			zIndex: 10,
			type: '3D',
			file: 'effect/priest_spell.bmp'
		},
		{
			alphaMax: 0.3,
			blendMode: 2,
			red: 1.0,
			green: 0.75,
			blue: 0.75,
			attachedEntity: true,
			duration: 1500,
			fadeIn: true,
			fadeOut: true,
			posz: 7,
			sizeEnd: 100,
			sizeSmooth: true,
			sizeStart: 650,
			zIndex: 10,
			type: '3D',
			file: 'effect/priest_spell.bmp'
		},
		{
			alphaMax: 0.3,
			blendMode: 2,
			red: 1.0,
			green: 0.8,
			blue: 0.8,
			attachedEntity: true,
			duration: 1500,
			fadeIn: true,
			fadeOut: true,
			posz: 7,
			sizeEnd: 100,
			sizeSmooth: true,
			sizeStart: 600,
			zIndex: 10,
			type: '3D',
			file: 'effect/priest_spell.bmp'
		},
		{
			alphaMax: 0.3,
			blendMode: 2,
			red: 1.0,
			green: 0.85,
			blue: 0.85,
			attachedEntity: true,
			duration: 1500,
			fadeIn: true,
			fadeOut: true,
			posz: 7,
			sizeEnd: 100,
			sizeSmooth: true,
			sizeStart: 550,
			zIndex: 10,
			type: '3D',
			file: 'effect/priest_spell.bmp'
		},
		{
			alphaMax: 0.3,
			blendMode: 2,
			red: 1.0,
			green: 0.9,
			blue: 0.9,
			attachedEntity: true,
			duration: 1500,
			fadeIn: true,
			fadeOut: true,
			posz: 7,
			sizeEnd: 100,
			sizeSmooth: true,
			sizeStart: 500,
			zIndex: 10,
			type: '3D',
			file: 'effect/priest_spell.bmp'
		},
		{
			alphaMax: 0.3,
			blendMode: 2,
			red: 1.0,
			green: 0.95,
			blue: 0.95,
			attachedEntity: true,
			duration: 1500,
			fadeIn: true,
			fadeOut: true,
			posz: 7,
			sizeEnd: 100,
			sizeSmooth: true,
			sizeStart: 450,
			zIndex: 10,
			type: '3D',
			file: 'effect/priest_spell.bmp'
		},
		{
			alphaMax: 0.3,
			blendMode: 2,
			red: 1.0,
			green: 1.0,
			blue: 1.0,
			attachedEntity: true,
			duration: 1500,
			fadeIn: true,
			fadeOut: true,
			posz: 7,
			sizeEnd: 100,
			sizeSmooth: true,
			sizeStart: 400,
			zIndex: 10,
			type: '3D',
			file: 'effect/priest_spell.bmp'
		}
	],

	//863: [{}],	//EF_CHEMICAL_V3	   Dominion Impulse (two spears of light)
	//864: [{}],	//EF_ENERVATION7	   Gloomy Day (colorful lines)
	//865: [{}],	//EF_CIRCLEPOWER3	   Blue aura (from Song of Mana)

	866: [
		{
			//EF_SPR_PLANT2	   Dance with a Warg (Wargs)
			wav: 'effect/\xbf\xf6\xb1\xd7\xbf\xcd\xc7\xd4\xb2\xb2\xc3\xe3\xc0\xbb'
		}
	],

	//867: [{}],	//EF_CIRCLEPOWER4	   Yellow aura (from Dance with a Warg)

	868: [
		{
			//EF_SPR_PLANT3	   Song of Mana (Violies)
			wav: 'effect/\xb8\xb6\xb3\xaa\xc0\xc7\xb3\xeb\xb7\xa1'
		}
	],

	//869: [{}],	//EF_RG_COIN6	   Strip sound [S]

	870: [
		{
			//EF_SPR_PLANT4	   Ghostly Succubuses of fire
			wav: 'effect/\xbb\xf5\xc5\xcd\xb5\xa5\xc0\xcc\xb3\xaa\xc0\xcc\xc6\xae\xc7\xc7\xb9\xf6'
		}
	],

	//871: [{}],	//EF_CIRCLEPOWER5	   Red aura (from Lerad's Dew)

	872: [
		{
			//EF_SPR_PLANT5	   Lerad's Dew (Minerals)
			wav: 'effect/\xb7\xb9\xb6\xf3\xb5\xe5\xc0\xc7\xc0\xcc\xbd\xbd'
		}
	],

	//873: [{}],	//EF_CIRCLEPOWER6	   Stargate-wormhole stuff (bright purple)

	874: [
		{
			//EF_SPR_PLANT6	   Melody of Sink (Ktullanuxes)
			wav: 'effect/\xb8\xe1\xb7\xce\xb5\xf0\xbf\xc0\xba\xea\xbd\xcc\xc5\xa9' //'effect/\xb3\xaa\xb6\xf4\xc0\xc7\xb3\xeb\xb7\xa1'
		}
	],

	//875: [{}],	//EF_CIRCLEPOWER7	   Stargate-wormhole stuff (bright turquoise)

	876: [
		{
			//EF_SPR_PLANT7	   Warcry of Beyond (Garms)
			wav: 'effect/\xba\xf1\xbf\xe6\xb5\xe5\xbf\xc0\xba\xea\xbf\xf6\xc5\xa9\xb6\xf3\xc0\xcc'
		}
	],

	//877: [{}],	//EF_CIRCLEPOWER8	   Stargate-wormhole stuff (white)

	878: [
		{
			//EF_SPR_PLANT8	   Unlimited Humming Voice (Miyabi Ningyos)
			wav: 'effect/\xbe\xf0\xb8\xae\xb9\xcc\xc6\xbc\xb5\xe5\xc7\xe3\xb9\xd6\xba\xb8\xc0\xcc\xbd\xba'
		}
	],

	879: [
		{
			//EF_HEARTASURA	   Siren's Voice (heart-like)
			wav: 'effect/\xbc\xbc\xc0\xcc\xb7\xbb\xc0\xc7\xb8\xf1\xbc\xd2\xb8\xae'
		}
	],

	//880: [{}],	//EF_BEGINSPELL_150	   Bluish castish cone
	//881: [{}],	//EF_LEVEL99_150	   Blue aura
	//882: [{}],	//EF_PRIMECHARGE	   Whirl of fireflies (red)

	883: [
		{
			//EF_GLASSWALL4	   Epiclesis (transparent green tree)
			type: '3D',
			alphaMax: 0.6,
			attachedEntity: true,
			blendMode: 2,
			duration: 30000,
			red: 0.0001,
			green: 1.0,
			blue: 0.0001,
			size: 400,
			posz: 7,
			zIndex: 1,
			wav: 'effect/ef_readyportal',
			file: 'effect/ef_epitree.tga'
		},
		{
			type: '3D',
			alphaMax: 0.6,
			attachedEntity: true,
			blendMode: 2,
			duration: 990,
			duplicate: 15,
			timeBetweenDupli: 2000,
			red: 0.0001,
			green: 1.0,
			blue: 0.0001,
			sizeStart: 380,
			sizeEnd: 420,
			posz: 7,
			zIndex: 1,
			file: 'effect/ef_epitree.tga'
		},
		{
			type: '3D',
			alphaMax: 0.6,
			attachedEntity: true,
			blendMode: 2,
			duration: 990,
			duplicate: 15,
			timeBetweenDupli: 2000,
			delayOffset: 1000,
			red: 0.0001,
			green: 1.0,
			blue: 0.0001,
			sizeStart: 420,
			sizeEnd: 380,
			posz: 7,
			zIndex: 1,
			file: 'effect/ef_epitree.tga'
		}
	],

	//884: [{}],	//EF_GRADIUS_LASER	   Green beam
	885: [
		{
			//bash3d6	//EF_BASH3D6	   Blue light beams (can be unnoficial)
			wav: 'effect/bash3d', // incorrect wav name
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const entity = Params.Init.ownerEntity;
				entity.animations.add(function (tick) {
					// Halo (Double Body) - Blue variant
					entity._enableHalo = tick >= 150 && tick <= 450;

					if (tick >= 150 && tick <= 450) {
						// Blue tint
						entity._flashColor[0] = 0.5;
						entity._flashColor[1] = 0.5;
						entity._flashColor[2] = 1.0;
						entity._flashColor[3] = 1.0;
						entity.recalculateBlendingColor();
					} else {
						entity._flashColor[0] = 1.0;
						entity._flashColor[1] = 1.0;
						entity._flashColor[2] = 1.0;
						entity._flashColor[3] = 1.0;
						entity.recalculateBlendingColor();
					}
					return tick > 500;
				});
			}
		},
		{
			type: 'CYLINDER',
			textureName: 'alpha_center',
			alphaMax: 0.6,
			duration: 175,
			delayStart: 200,
			duplicate: 5,
			timeBetweenDupli: 0,
			totalCircleSides: 30,
			circleSides: 1,
			fade: true,
			angleX: -90,
			angleZRandom: 360,
			fixedPerspective: true,
			posZ: 1.5,
			height: 0,
			bottomSize: 0.01,
			topSize: 4.5,
			animation: 2,
			zIndex: 1.1,
			red: 0.3,
			green: 0.5,
			blue: 1.0,
			attachedEntity: true
		},
		{
			type: 'CYLINDER',
			textureName: 'alpha_center',
			alphaMax: 0.6,
			duration: 175,
			duplicate: 5,
			delayStart: 200,
			timeBetweenDupli: 0,
			totalCircleSides: 30,
			circleSides: 1,
			fade: true,
			angleX: -90,
			angleZRandom: 360,
			fixedPerspective: true,
			posZ: 1.5,
			height: 0,
			bottomSize: 0.01,
			topSize: 7.2,
			animation: 2,
			zIndex: 1.2,
			red: 0.3,
			green: 0.5,
			blue: 1.0,
			attachedEntity: true
		}
	],
	//886: [{}],	//EF_GUMGANG5	   Blue castish cone
	//887: [{}],	//EF_HITLINE8	   Wavy sparks

	888: [
		{
			//EF_ELECTRIC4	   Earth Shaker (same as 432)
			wav: 'effect/sr_earthshaker'
		}
	],

	889: [
		//EF_TEIHIT1T	   Fast light beams (blue)
		{
			wav: 'effect/\x6d\x6f\x6e\x5f\xbe\xc6\xbc\xf6\xb6\xf3\x20\xc6\xd0\xc8\xb2\xb1\xc7',
			type: '3D',
			duplicate: 24,
			timeBetweenDupli: 0,
			file: 'effect/lens1.tga',
			delayStart: 100,
			duration: 250,
			alphaMax: 0.8,
			fadeIn: true,
			fadeOut: true,
			posxStart: 0,
			posyStart: 0,
			posxEndRand: 40,
			posyEndRand: 40,
			sizeStartX: 10,
			sizeStartY: 150,
			sizeEndX: 10,
			sizeEndY: 150,
			blendMode: 2,
			attachedEntity: true,
			red: 0.1,
			green: 0.1,
			blue: 1.0,
			overlay: true,
			rotateToTarget: true,
			rotateWithCamera: true
		}
	]
};
