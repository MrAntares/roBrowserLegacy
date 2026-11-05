/**
 * @module DB/Effects/Table/ById/Effects0199-0299
 *
 * Effects 199 to 299 of the effect table, in ID order (see EffectConst.js).
 * DB/Effects/EffectTable.js joins the parts; its header lists the parameters a row takes.
 */

import Camera from 'Renderer/Camera.js';
import SwirlingAura from 'Renderer/Effects/SwirlingAura.js';
import GroundAura from 'Renderer/Effects/GroundAura.js';
import Level99Bubble from 'Renderer/Effects/Level99Bubble.js';
import SongEffects from 'Renderer/Effects/Songs.js';
import DB from 'DB/DBManager.js';
import Session from 'Engine/SessionStorage.js';
import CloudWeatherEffect from 'Renderer/Effects/CloudWeatherEffect.js';
import LPEffect from 'Renderer/Effects/LPEffect.js';
import PokJukWeatherEffect from 'Renderer/Effects/PokJukWeatherEffect.js';
import PropertyGround from 'Renderer/Effects/PropertyGround.js';
import SpiritSphere from 'Renderer/Effects/SpiritSphere.js';
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';

const ServiceEffects = SongEffects.ServiceEffects;
const getBragiSpellNote = SongEffects.getBragiSpellNote;
const DissonanceEffects = SongEffects.DissonanceEffects;
const LullabyEffects = SongEffects.LullabyEffects;
const MrKimEffects = SongEffects.MrKimEffects;
const EtChaosEffects = SongEffects.EtChaosEffects;
const DrumEffects = SongEffects.DrumEffects;
const NibelungEffects = SongEffects.NibelungEffects;
const LokiEffects = SongEffects.LokiEffects;
const AbyssEffects = SongEffects.AbyssEffects;
const SiegfiedEffects = SongEffects.SiegfiedEffects;
const WhistleEffects = SongEffects.WhistleEffects;
const SinEffects = SongEffects.SinEffects;
const AppleEffects = SongEffects.AppleEffects;
const UglyEffects = SongEffects.UglyEffects;
const HummingEffects = SongEffects.HummingEffects;
const ForgetEffects = SongEffects.ForgetEffects;
const FortuneEffects = SongEffects.FortuneEffects;

export default {
	//198: [{}],	//EF_TELEKHIT	   (Nothing)

	199: [
		{
			//EF_PONG	Small Popping Bubble Map Effect
			type: 'STR',
			file: 'pong%d',
			rand: [1, 3],
			attachedEntity: false
		}
	],

	200: [
		// EF_LEVEL99 - Normal level 99 Aura (Rising Cone / Swirling Band)
		// Math model from original game:
		// - Ring radius ≈ 3.9, tilt 55°, vertical amplitude 15, 315° sweep
		// - height_k(t) = H·sin(90+9(k−10))·sin(ωt), ω=1°/frame
		// - Spin adds (ec+3)°/frame
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				this.add(
					new SwirlingAura(Params.Init.ownerEntity.position, 'ring_blue.tga', Params.Inst.startTick),
					Params
				);
			}
		}
	],

	201: [
		// EF_LEVEL99_2 - Normal level 99 Aura (Bottom / Ground Ring)
		// Uses GroundAura which renders flat quads on the ground plane
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				this.add(
					new GroundAura(
						Params.Init.ownerEntity.position,
						100, // size (same as original Aura.js)
						15.0, // distance (same as original Aura.js)
						'pikapika2.bmp',
						Params.Inst.startTick
					),
					Params
				);
			}
		}
	],

	202: [
		// EF_LEVEL99_3 - Level 99 aura bubble sparkle (camera-facing diamonds)
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				// Default to blue variant (flag1 = 1) unless overridden
				let flag1 = 1;

				// Allow effect table or caller to override tint variant
				if (typeof Params.effect.flag1 !== 'undefined') {
					flag1 = Params.effect.flag1;
				} else if (Params.Inst && typeof Params.Inst.flag1 !== 'undefined') {
					flag1 = Params.Inst.flag1;
				}

				this.add(
					new Level99Bubble(Params.Init.ownerEntity.position, 'whitelight.tga', Params.Inst.startTick, flag1),
					Params
				);
			}
		}
	],

	203: [
		{
			//EF_GUMGANG	   Fury (Visual Effect)
			//super1..5.bmp
			type: '3D',
			fadeOut: true,
			duration: 2000,
			delayLate: 0,
			file: 'effect/super1.bmp',
			attachedEntity: true
		},
		{
			type: '3D',
			fadeOut: true,
			duration: 2000,
			delayLate: 400,
			file: 'effect/super2.bmp',
			attachedEntity: true
		},
		{
			type: '3D',
			fadeOut: true,
			duration: 2000,
			delayLate: 800,
			file: 'effect/super3.bmp',
			attachedEntity: true
		},
		{
			type: '3D',
			fadeOut: true,
			duration: 2000,
			delayLate: 1200,
			file: 'effect/super4.bmp',
			attachedEntity: true
		},
		{
			type: '3D',
			fadeOut: true,
			duration: 2000,
			delayLate: 1600,
			file: 'effect/super5.bmp',
			attachedEntity: true
		}
	],

	204: [
		{
			//EF_POTION1	Red Herb/Potion
			type: 'STR',
			file: '\xbb\xa1\xb0\xa3\xc6\xf7\xbc\xc7',
			attachedEntity: true
		}
	],

	205: [
		{
			//EF_POTION2	Orange Potion
			type: 'STR',
			file: '\xc1\xd6\xc8\xab\xc6\xf7\xbc\xc7',
			attachedEntity: true
		}
	],

	206: [
		{
			//EF_POTION3	Yellow Herb/Potion
			type: 'STR',
			file: '\xb3\xeb\xb6\xf5\xc6\xf7\xbc\xc7',
			attachedEntity: true
		}
	],

	207: [
		{
			//EF_POTION4	White Herb/Potion
			type: 'STR',
			file: '\xc7\xcf\xbe\xe1\xc6\xf7\xbc\xc7',
			attachedEntity: true
		}
	],

	208: [
		{
			//EF_POTION5	Blue Herb/Potion
			type: 'STR',
			file: '\xc6\xc4\xb6\xf5\xc6\xf7\xbc\xc7',
			wav: 'effect/\xc8\xed\xb1\xe2',
			attachedEntity: true
		}
	],

	209: [
		{
			//EF_POTION6	Green Herb/Potion
			type: 'STR',
			file: '\xc3\xca\xb7\xcf\xc6\xf7\xbc\xc7',
			attachedEntity: true
		}
	],

	210: [
		{
			//EF_POTION7	Yellow Circle Healing Effect
			type: 'STR',
			file: 'fruit',
			wav: '_heal_effect',
			attachedEntity: true
		}
	],

	211: [
		{
			//EF_POTION8	Blue Circle Healing Effect
			type: 'STR',
			file: 'fruit_',
			wav: 'effect/\xc8\xed\xb1\xe2',
			attachedEntity: true
		}
	],

	212: [
		{
			//EF_DARKBREATH	Dark Breath
			type: 'SPR',
			file: 'darkbreath',
			head: true,
			attachedEntity: true
		}
	],

	213: [
		{
			//EF_DEFFENDER	Defender
			type: 'STR',
			file: 'deffender',
			attachedEntity: true
		}
	],

	214: [
		{
			//EF_KEEPING	Keeping
			type: 'STR',
			file: 'keeping',
			attachedEntity: true
		}
	],

	215: [
		{
			//EF_SUMMONSLAVE
			type: 'SPR',
			file: 'smoke',
			attachedEntity: true
		}
	],

	216: [
		{
			//EF_BLOODDRAIN (Dracula / Beast Strafe)
			type: '3D',
			duration: 600,
			duplicate: 5,
			timeBetweenDupli: 0,
			absoluteSpriteName: 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/particle1',
			playSprite: true,

			toSrc: true,
			rotateToTarget: true,

			// Blood Red
			red: 1.0,
			green: 0.4,
			blue: 0.4,

			sizeStart: 150.0,
			sizeEnd: 180.0,

			zOffsetStart: 5,
			arc: 3.0,
			retreat: 3.0,
			drainPattern: true
		}
	],

	217: [
		{
			//EF_ENERGYDRAIN (Wizard Soul Drain)
			type: '3D',
			duration: 600,
			duplicate: 5,
			timeBetweenDupli: 0,
			absoluteSpriteName: 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/particle1',
			playSprite: true,

			toSrc: true,
			rotateToTarget: true,

			// Dark Blue
			red: 0.4,
			green: 0.4,
			blue: 1.0,

			sizeStart: 150.0,
			sizeEnd: 180.0,

			zOffsetStart: 5,
			arc: 3.0,
			retreat: 3.0,
			drainPattern: true
		},
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function EffectBodyColor(Params) {
				const entity = Params.Init.ownerEntity;
				entity.animations.add(function (tick) {
					// Wait for drain particles from Part 1 (Soul Drain travel)
					if (tick < 500) {
						return false;
					}

					const time = tick - 500;

					// Part 2: Blue tint progression (200ms duration from official source)
					if (time < 200) {
						// Formula from official source: m_master->SetArgb(-1, 255-(m_stateCnt+50), 255-(m_stateCnt+50), 255)
						const val = (255 - (time + 50)) / 255;
						entity._flashColor[0] = val;
						entity._flashColor[1] = val;
						entity._flashColor[2] = 1.0;
						entity._flashColor[3] = 1.0;
						entity.recalculateBlendingColor();
						return false;
					}

					// Part 3: Smooth fade back to normal (200ms) for premium feel
					if (time < 400) {
						const progress = (time - 200) / 200;
						const startVal = 5 / 255; // 255 - (200 + 50)
						const val = startVal + (1.0 - startVal) * progress;
						entity._flashColor[0] = val;
						entity._flashColor[1] = val;
						entity._flashColor[2] = 1.0;
						entity._flashColor[3] = 1.0;
						entity.recalculateBlendingColor();
						return false;
					}

					// Final reset
					entity._flashColor[0] = 1.0;
					entity._flashColor[1] = 1.0;
					entity._flashColor[2] = 1.0;
					entity._flashColor[3] = 1.0;
					entity.recalculateBlendingColor();
					return true;
				});
			}
		},
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function EffectBodyColor(Params) {
				// make target blue
				const entity = Params.Init.otherEntity;
				if (!entity) return true;
				entity.animations.add(function (tick) {
					const time = tick;

					// Part 1: Blue tint progression (200ms duration from official source)
					if (time < 200) {
						// Formula from official source: m_master->SetArgb(-1, 255-(m_stateCnt+50), 255-(m_stateCnt+50), 255)
						const val = (255 - (time + 50)) / 255;
						entity._flashColor[0] = val;
						entity._flashColor[1] = val;
						entity._flashColor[2] = 1.0;
						entity._flashColor[3] = 1.0;
						entity.recalculateBlendingColor();
						return false;
					}

					// Part 2: Smooth fade back to normal (200ms) for premium feel
					if (time < 400) {
						const progress = (time - 200) / 200;
						const startVal = 5 / 255; // 255 - (200 + 50)
						const val = startVal + (1.0 - startVal) * progress;
						entity._flashColor[0] = val;
						entity._flashColor[1] = val;
						entity._flashColor[2] = 1.0;
						entity._flashColor[3] = 1.0;
						entity.recalculateBlendingColor();
						return false;
					}

					// Final reset
					entity._flashColor[0] = 1.0;
					entity._flashColor[1] = 1.0;
					entity._flashColor[2] = 1.0;
					entity._flashColor[3] = 1.0;
					entity.recalculateBlendingColor();
					return true;
				});
			}
		}
	],

	218: [
		{
			//EF_POTION_CON	Concentration Potion
			type: 'STR',
			file: '\xc1\xfd\xc1\xdf',
			wav: 'effect/ac_concentration',
			attachedEntity: true
		}
	],

	219: [
		{
			//EF_POTION_	Awakening Potion
			type: 'STR',
			file: '\xb0\xa2\xbc\xba',
			wav: 'effect/ac_concentration',
			attachedEntity: true
		}
	],

	220: [
		{
			//EF_POTION_BERSERK	Berserk Potion
			type: 'STR',
			file: '\xb9\xf6\xbc\xad\xc5\xa9',
			wav: 'effect/ac_concentration',
			attachedEntity: true
		},
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const start = Params.Inst.startTick + 200;
				const duration = 200;
				Camera.setQuake(start, duration);
			}
		}
	],

	//221: [{}],	//EF_POTIONPILLAR	   Intense light beam

	222: [
		{
			//EF_DEFENDER	   Defender (Crusader)
			type: 'CYLINDER',
			alphaMax: 0.6,
			animation: 1,
			blendMode: 8,
			bottomSize: 1.5,
			topSize: 1.5,
			duration: 3000,
			fade: true,
			height: 10,
			rotate: true,
			textureName: 'ring_black',
			attachedEntity: true
		}
	],

	//223: [{}],	//EF_GANBANTEIN	   Holy Cast Aura
	//224: [{}],	//EF_WIND	   Wind (Map effect)
	//225: [{}],	//EF_VOLCANO	   Volcano casting effect

	226: [
		{
			//EF_GRANDCROSS	   Grand Cross Effect
			type: 'CYLINDER', // Center
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500
		},
		{
			type: 'CYLINDER', // West
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posX: -1
		},
		{
			type: 'CYLINDER',
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posX: -2
		},
		{
			type: 'CYLINDER',
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posX: -3
		},
		{
			type: 'CYLINDER',
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posX: -4
		},
		{
			type: 'CYLINDER', // East
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posX: 1
		},
		{
			type: 'CYLINDER',
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posX: 2
		},
		{
			type: 'CYLINDER',
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posX: 3
		},
		{
			type: 'CYLINDER',
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posX: 4
		},
		{
			type: 'CYLINDER', // North
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posY: 1
		},
		{
			type: 'CYLINDER',
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posY: 2
		},
		{
			type: 'CYLINDER',
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posY: 3
		},
		{
			type: 'CYLINDER',
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posY: 4
		},
		{
			type: 'CYLINDER', // South
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posY: -1
		},
		{
			type: 'CYLINDER',
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posY: -2
		},
		{
			type: 'CYLINDER',
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posY: -3
		},
		{
			type: 'CYLINDER',
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posY: -4
		},
		{
			type: 'CYLINDER', // NE
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posX: 1,
			posY: 1
		},
		{
			type: 'CYLINDER', // SE
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posX: 1,
			posY: -1
		},
		{
			type: 'CYLINDER', // SW
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posX: -1,
			posY: -1
		},
		{
			type: 'CYLINDER', // NW
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			topSize: 0.7,
			bottomSize: 0.7,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 45,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posX: -1,
			posY: 1
		},
		{
			type: 'CYLINDER', // NE arc
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 20,
			circleSides: 5,
			topSize: 3,
			bottomSize: 3,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: -180,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posX: 3.5,
			posY: 3.5
		},
		{
			type: 'CYLINDER', // SE arc
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 20,
			circleSides: 5,
			topSize: 3,
			bottomSize: 3,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 90,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posX: 3.5,
			posY: -3.5
		},
		{
			type: 'CYLINDER', // SW arc
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 20,
			circleSides: 5,
			topSize: 3,
			bottomSize: 3,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: 0,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posX: -3.5,
			posY: -3.5
		},
		{
			type: 'CYLINDER', // NW arc
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: false,
			blendMode: 2,
			totalCircleSides: 20,
			circleSides: 5,
			topSize: 3,
			bottomSize: 3,
			duration: 1000,
			fade: true,
			height: 5,
			rotate: false,
			angleY: -90,
			textureName: 'ring_red',
			duplicate: 3,
			timeBetweenDupli: 500,
			posX: -3.5,
			posY: 3.5
		},
		{
			wav: 'effect/cru_grand cross'
		}
	],

	227: [
		{
			//Intimidate / Snatch	//EF_INTIMIDATE	Snatch
			wav: 'effect/rog_intimidate',
			attachedEntity: true
		}
	],

	228: [
		{
			//EF_CHOOKGI	   (Nothing) - Used for spirit spheres (other classes)
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const spiritNum = Params.Init.spiritNum || 0;
				const Spheres = new SpiritSphere(Params.Init.ownerEntity, spiritNum, false);
				this.add(Spheres, Params);
			}
		}
	],

	229: [
		{
			//EF_CLOUD        Fog
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				CloudWeatherEffect.startOrRestart(Params);
			}
		}
	],

	230: [
		{
			//EF_CLOUD2       Normal Cloud (Under Map Gat)
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				CloudWeatherEffect.startOrRestart(Params);
			}
		}
	],

	//231: [{}],	//EF_MAPPILLAR	   Map Light Pillar Animation 1

	232: [
		{
			//EF_LINELINK	   Sacrifice (Visual Effect)
			type: '3D',
			alphaMax: 0.5,
			angle: 180,
			attachedEntity: true,
			blendMode: 2,
			red: 0.1,
			green: 0.1,
			blue: 0.9,
			duration: 100,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/alpha_center.tga',
			fromSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			sizeX: 5,
			sizeY: 50,
			zOffset: 1,
			zIndex: 1
		}
	],

	233: [
		{
			//EF_CLOUD3	   Einbroch Industrial Clouds
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				CloudWeatherEffect.startOrRestart(Params);
			}
		}
	],

	234: [
		{
			//EF_SPELLBREAKER	Spell Breaker
			type: 'STR',
			file: 'spell',
			wav: 'effect/sage_spell breake',
			attachedEntity: true
		}
	],

	235: [
		{
			//EF_DISPELL	Dispell
			type: 'STR',
			file: '\xb5\xf0\xbd\xba\xc6\xe7',
			attachedEntity: true
		}
	],

	//236: [{}],	//EF_DELUGE	   Deluge Cast Aura
	//237: [{}],	//EF_VIOLENTGALE	   Violent Gale Cast Aura
	//238: [{}],	//EF_LANDPROTECTOR	   Magnetic Earth Cast Aura
	239: [
		{
			//EF_BOTTOM_VO	   Volcano (Visual Effect)
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				this.add(
					new PropertyGround(Params.Inst.position, 3.0, 1.0, 2, 'ring_red', Params.Inst.startTick),
					Params
				);
			}
		}
	],
	240: [
		{
			//EF_BOTTOM_DE	   Deluge (Visual Effect)
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				this.add(
					new PropertyGround(Params.Inst.position, 3.0, 1.0, 2, 'ring_blue', Params.Inst.startTick),
					Params
				);
			}
		}
	],
	241: [
		{
			//EF_BOTTOM_VI	   Violent Gale (Visual Effect)
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				this.add(
					new PropertyGround(Params.Inst.position, 3.0, 1.0, 2, 'ring_yellow', Params.Inst.startTick),
					Params
				);
			}
		}
	],

	242: [
		{
			//EF_BOTTOM_LA	Magnetic Earth (Visual Effect)
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				this.add(new LPEffect(Params.Inst.position, Params.Inst.startTick), Params);
			}
		}
	],

	//243: [{}],	//EF_FASTMOVE	   (Invalid)

	244: [
		{
			//EF_MAGICROD	Magic Rod
			type: 'STR',
			file: '\xb8\xc5\xc1\xf7\xb7\xce\xb5\xe5',
			wav: 'effect/sage_magic rod',
			attachedEntity: true
		}
	],

	245: [
		{
			//EF_HOLYCROSS	Holy Cross
			type: 'STR',
			file: 'holy_cross',
			wav: 'effect/cru_holy cross',
			attachedEntity: true
		}
	],

	246: [
		{
			//EF_SHIELDCHARGE	Shield Charge
			type: 'STR',
			file: 'shield_charge',
			attachedEntity: true
		}
	],

	//247: [{}],	//EF_MAPPILLAR2	   Map Light Pillar Animation 2

	248: [
		{
			//EF_PROVIDENCE	Resistant Souls
			type: 'STR',
			file: 'providence',
			attachedEntity: true
		}
	],

	249: [
		{
			//EF_SHIELDBOOMERANG	Shield Boomerang
			wav: 'effect/cru_shield boomerang'
		}
	],

	250: [
		{
			//EF_SPEARQUICKEN	   Spear Quicken
			type: 'STR',
			file: 'twohand',
			wav: 'effect/knight_twohandquicken',
			head: true,
			attachedEntity: true
		}
	],

	251: [
		{
			//EF_DEVOTION	Devotion
			type: 'STR',
			file: 'devotion',
			attachedEntity: true
		}
	],

	252: [
		{
			//EF_REFLECTSHIELD	   Reflect Shield
			type: 'CYLINDER',
			alphaMax: 0.6,
			animation: 1,
			blendMode: 8,
			bottomSize: 1.5,
			topSize: 1.5,
			duration: 3000,
			fade: true,
			height: 10,
			rotate: true,
			textureName: 'ring_yellow',
			attachedEntity: true
		}
	],

	253: [
		{
			//EF_ABSORBSPIRITS	   Absorb Spirit Spheres
			alphaMax: 0.3,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			red: 0.3,
			green: 0.3,
			blue: 1,
			bottomSize: 1.1,
			duration: 1500,
			fade: true,
			height: 15,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 1.1,
			type: 'CYLINDER',
			wav: 'effect/\xc8\xed\xb1\xe2'
		},
		{
			alphaMax: 0.3,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			red: 0.3,
			green: 0.3,
			blue: 1,
			bottomSize: 1,
			duration: 1500,
			fade: true,
			height: 13,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 1,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.3,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			red: 0.3,
			green: 0.3,
			blue: 1,
			bottomSize: 1.1,
			duration: 1500,
			fade: true,
			height: 2,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 3,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.8,
			attachedEntity: true,
			blendMode: 2,
			red: 0.3,
			green: 0.3,
			blue: 1,
			duration: 1500,
			duplicate: 4,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/pok3.tga',
			posxRand: 1.2,
			posyRand: 1.2,
			poszEndRand: 1,
			poszEndRandMiddle: 8,
			poszStart: 0,
			size: 9,
			sizeRand: 2,
			sparkling: true,
			sparkNumber: 2,
			timeBetweenDupli: 10,
			type: '3D',
			zIndex: 1
		},
		{
			alphaMax: 0.8,
			attachedEntity: true,
			blendMode: 2,
			red: 0.3,
			green: 0.3,
			blue: 1,
			duration: 1300,
			delayOffset: 400,
			duplicate: 20,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/pok3.tga',
			posxRand: 1.5,
			posyRand: 1.5,
			poszEndRand: 3,
			poszEndRandMiddle: 6,
			poszStart: 0,
			size: 9,
			sizeRand: 2,
			sparkling: true,
			sparkNumber: 2,
			timeBetweenDupli: 10,
			type: '3D',
			zIndex: 1
		},
		{
			alphaMax: 0.8,
			attachedEntity: true,
			blendMode: 2,
			red: 0.3,
			green: 0.3,
			blue: 1,
			duration: 1100,
			delayLate: 200,
			duplicate: 10,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/pok3.tga',
			posxRand: 1,
			posyRand: 1,
			poszEnd: 6,
			poszStartRand: 1,
			poszStartRandMiddle: 0,
			size: 9,
			sizeRand: 2,
			timeBetweenDupli: 50,
			type: '3D',
			zIndex: 1
		}
	],

	254: [
		{
			//EF_STEELBODY	   Mental Strength (Visual Effect)
			wav: 'effect/mon_\xb1\xdd\xb0\xad\xba\xd2\xb1\xab'
		}
	],

	255: [
		{
			//EF_FLAMELAUNCHER	Elemental Endow (Fire)
			type: 'STR',
			file: 'enc_fire',
			wav: '_enemy_hit_wind1',
			attachedEntity: true
		}
	],

	256: [
		{
			//EF_FROSTWEAPON	Elemental Endow (Water)
			type: 'STR',
			file: 'enc_ice',
			wav: '_enemy_hit_wind1',
			attachedEntity: true
		}
	],

	257: [
		{
			//endow wind on target	//EF_LIGHTNINGLOADER	Elemental Endow (Wind)
			type: 'STR',
			file: 'enc_wind',
			wav: 'effect/_enemy_hit_wind1',
			attachedEntity: true
		}
	],

	258: [
		{
			//EF_SEISMICWEAPON	Elemental Endow (Earth)
			type: 'STR',
			file: 'enc_earth',
			wav: '_enemy_hit_wind1',
			attachedEntity: true
		}
	],

	//259: [{}],	//EF_MAPPILLAR3	   Map Light Pillar Animation 3
	//260: [{}],	//EF_MAPPILLAR4	   Map Light Pillar Animation 4

	261: [
		{
			//fury / critical explosion TODO: combo sounds, super novice fury	//EF_GUMGANG2	Fury Cast Animation
			type: 'CYLINDER',
			alphaMax: 0.5,
			blendMode: 8,
			animation: 4,
			duplicate: 4,
			timeBetweenDupli: 100,
			bottomSize: 2,
			duration: 1500,
			fade: true,
			height: 2,
			rotate: true,
			textureName: 'ring_yellow',
			topSize: 5,
			attachedEntity: true
		},
		{
			wav: 'effect/mon_\xc6\xf8\xb1\xe2',
			attachedEntity: true
		}
	],

	262: [
		{
			//EF_TEIHIT1	   Raging Quadruple Blow
			wav: 'effect/\x6d\x6f\x6e\x5f\xc6\xf8\xb1\xe2',
			type: '3D',
			duplicate: 12,
			timeBetweenDupli: 0,
			file: 'effect/alpha_center.tga',
			delayStart: 250,
			duration: 550,
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
			overlay: true,
			rotateToTarget: true,
			rotateWithCamera: true
		}
	],

	263: [
		{
			//EF_GUMGANG3	   Raging Quadruple Blow 2
			type: 'CYLINDER',
			alphaMax: 0.3,
			blendMode: 8,
			animation: 4,
			duplicate: 4,
			timeBetweenDupli: 100,
			bottomSize: 3,
			duration: 1000,
			fade: true,
			height: 2,
			rotate: true,
			textureName: 'ring_yellow',
			topSize: 6,
			attachedEntity: true
		}
	],

	//264: [{}],	//EF_TEIHIT2	   (Nothing)

	265: [
		{
			//EF_TANJI	   Throw Spirit Sphere
			type: '3D',
			file: 'effect/blue_ivy.bmp',
			alphaMax: 1,
			blendMode: 2,
			duration: 150,
			toSrc: true,
			rotateWithCamera: true,
			rotateToTarget: true,
			angle: 90,
			zOffset: 1,
			size: 50,
			wav: 'effect/mon_\xc5\xba\xc1\xf6\xbd\xc5\xc5\xeb',
			attachedEntity: true
		}
	],

	266: [
		{
			//EF_TEIHIT1X	   Asura Strike (Hit)
			wav: 'effect/\x6d\x6f\x6e\x5f\xbe\xc6\xbc\xf6\xb6\xf3\x20\xc6\xd0\xc8\xb2\xb1\xc7',
			type: '3D',
			duplicate: 24,
			timeBetweenDupli: 0,
			file: 'effect/lens1.tga',
			delayStart: 100,
			duration: 550,
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
			overlay: true,
			rotateToTarget: true,
			rotateWithCamera: true
		}
	],

	267: [
		{
			//EF_CHIMTO	   Occult Impaction
			wav: 'effect/mon_\xc4\xa7\xc5\xf5\xb0\xe6'
		}
	],

	268: [
		{
			//EF_STEALCOIN	Steal Coin
			type: 'STR',
			file: 'steal_coin',
			attachedEntity: true
		}
	],

	269: [
		{
			//EF_STRIPWEAPON	Divest Weapon
			type: 'STR',
			file: 'strip_weapon',
			wav: 'effect/\x74\x5f\xba\xae\xc6\xa8\xb1\xe8',
			attachedEntity: true
		}
	],

	270: [
		{
			//EF_STRIPSHIELD	Divest Shield
			type: 'STR',
			file: 'strip_shield',
			wav: 'effect/\x74\x5f\xba\xae\xc6\xa8\xb1\xe8',
			attachedEntity: true
		}
	],

	271: [
		{
			//EF_STRIPARMOR	Divest Armor
			type: 'STR',
			file: 'strip_armor',
			wav: 'effect/\x74\x5f\xba\xae\xc6\xa8\xb1\xe8',
			attachedEntity: true
		}
	],

	272: [
		{
			//EF_STRIPHELM	Divest Helm
			type: 'STR',
			file: 'strip_helm',
			wav: 'effect/\x74\x5f\xba\xae\xc6\xa8\xb1\xe8',
			attachedEntity: true
		}
	],

	273: [
		{
			//EF_CHAINCOMBO	Raging Quadruple Blow 4
			type: 'STR',
			file: '\xbf\xac\xc8\xaf',
			wav: 'effect/mon_\xbf\xac\xc8\xaf',
			attachedEntity: true
		}
	],

	274: [
		{
			//EF_RG_COIN	   Steal Coin Animation
			type: '2D',
			overlay: true,
			file: 'effect/coin_a.bmp',
			blendMode: 2,
			alphaMax: 0.8,
			duplicate: 30,
			timeBetweenDupli: 50,
			duration: 1500,
			fadeOut: true,
			posxEndRand: 10,
			posyEndRand: 10,
			posz: 2,
			size: 20,
			rotateToTarget: true,
			attachedEntity: true
		},
		{
			wav: 'effect/rog_steal coin'
		}
	],

	275: [
		{
			//backstab on target hit	//EF_BACKSTAP	Back Stab Animation
			wav: 'effect/rog_back stap',
			attachedEntity: true
		}
	],

	276: [
		{
			//Sightless Mind	//EF_TEIHIT3	Sightless Mind (RG_RAID)
			type: '3D',
			duplicate: 20,
			timeBetweenDupli: 0,
			file: 'effect/lens1.tga',
			delayStart: 100,
			duration: 550,
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
	],

	'277_ground': [
		{
			// Dissonance //\xb1\xe2\xb7\xf9.tga
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				DissonanceEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	278: [
		{
			//EF_BOTTOM_LULLABY	Lullaby Map Unit
			wav: 'effect/\xc0\xda\xc0\xe5\xb0\xa1', //ŔÚŔĺ°ˇ
			attachedEntity: true
		}
	],

	'278_ground': [
		{
			// Lullaby
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				LullabyEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	279: [
		{
			//EF_BOTTOM_RICHMANKIM	Mr Kim a Rich Man Map Unit
			wav: 'effect/\xb1\xe8\xbc\xad\xb9\xe6\xb5\xb7', //±čĽ­ąćµ·
			attachedEntity: true
		}
	],

	'279_ground': [
		{
			// Mr Kim
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				MrKimEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	280: [
		{
			//EF_BOTTOM_ETERNALCHAOS	Eternal Chaos Map Unit
			wav: 'effect/\xbf\xb5\xbf\xf8\xc0\xc7\x20\xc8\xa5\xb5\xb7', //żµżřŔÇ ČĄµ·
			attachedEntity: true
		}
	],

	'280_ground': [
		{
			// Chaos
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				EtChaosEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	281: [
		{
			//EF_BOTTOM_DRUMBATTLEFIELD	A Drum on the Battlefield Map Unit
			wav: 'effect/\xc0\xfc\xc0\xe5\xc0\xc7', //ŔüŔĺŔÇ
			attachedEntity: true
		}
	],

	'281_ground': [
		{
			// Drum on battlefield
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				DrumEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	282: [
		{
			//EF_BOTTOM_RINGNIBELUNGEN	The Ring Of Nibelungen Map Unit
			wav: 'effect/\xb4\xcf\xba\xa7\xb7\xee\xb0\xd5\xc0\xc7\x20\xb9\xdd\xc1\xf6', //´Ďş§·î°ŐŔÇ ąÝÁö
			attachedEntity: true
		}
	],

	'282_ground': [
		{
			// Ring nibelun
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				NibelungEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	283: [
		{
			//EF_BOTTOM_ROKISWEIL	Loki's Veil Map Unit
			wav: 'effect/\xb7\xce\xc5\xb0', //·ÎĹ°
			attachedEntity: true
		}
	],

	'283_ground': [
		{
			// Loki Veil
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				LokiEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	284: [
		{
			//EF_BOTTOM_INTOABYSS	Into the Abyss Map Unit
			wav: 'effect/\xbd\xc9\xbf\xac\xbc\xd3\xc0\xb8\xb7\xce', //˝Éż¬ĽÓŔ¸·Î
			attachedEntity: true
		}
	],

	'284_ground': [
		{
			// Into abyss
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				AbyssEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	285: [
		{
			//EF_BOTTOM_SIEGFRIED	Invunerable Siegfriend Map Unit
			wav: 'effect/\xba\xd2\xbb\xe7\xbd\xc5', //şŇ»ç˝Ĺ
			attachedEntity: true
		}
	],

	'285_ground': [
		{
			// Invulnerable Sieg
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				SiegfiedEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	286: [
		{
			//EF_BOTTOM_WHISTLE	A Wistle Map Unit
			wav: 'effect/\xb4\xde\xba\xfb\xbc\xbc\xb7\xb9\xb3\xaa\xb5\xa5', //´ŢşűĽĽ·ąłŞµĄ
			attachedEntity: true
		}
	],

	'286_ground': [
		{
			// A whistle
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				WhistleEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	287: [
		{
			//EF_BOTTOM_ASSASSINCROSS	Assassin Cross of Sunset Map Unit
			wav: 'effect/\xbc\xae\xbe\xe7\xc0\xc7\x20\xbe\xee\xbd\xd8\xbd\xc5', //Ľ®ľçŔÇ ľî˝Ř˝Ĺ
			attachedEntity: true
		}
	],

	'287_ground': [
		{
			// Assassin cross
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				SinEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	288: [
		{
			//EF_BOTTOM_POEMBRAGI	A Poem of Bragi Map Unit
			wav: 'effect/\xba\xea\xb6\xf3\xb1\xe2\xc0\xc7\x20\xbd\xc3', //şę¶ó±âŔÇ ˝Ă
			attachedEntity: true
		}
	],

	'288_ground': [
		{
			// Bragi
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				const bragiNoteEffect = getBragiSpellNote();
				self.add(new bragiNoteEffect(Params.Inst.position, Params.Inst.startTick, 2), Params);
			}
		}
	],

	289: [
		{
			//EF_BOTTOM_APPLEIDUN	The Apple Of Idun Map Unit
			wav: 'effect/\xc0\xcc\xb5\xd0\xc0\xc7\x20\xbb\xe7\xb0\xfa',
			//ISO-8859-1:	ÀÌµÐÀÇ »ç°ú
			//Windows 1250: ŔĚµĐŔÇ »ç°ú
			//EUC-KR:		 이둔의 사과
			//Hex:			 \xc0\xcc\xb5\xd0\xc0\xc7\x20\xbb\xe7\xb0\xfa
			//reference for finding encoding
			attachedEntity: true
		}
	],

	'289_ground': [
		{
			// Apple
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				AppleEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	'290_ground': [
		{
			// Ugly
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				UglyEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	291: [
		{
			//EF_BOTTOM_HUMMING	Humming Map Unit
			wav: 'effect/\xc8\xef\xbe\xf3\xb0\xc5\xb8\xb2', //Čďľó°Ĺ¸˛
			attachedEntity: true
		}
	],

	'291_ground': [
		{
			// Humming
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				HummingEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	292: [
		{
			//EF_BOTTOM_DONTFORGETME	Please don't Forget Me Map Unit
			wav: 'effect/\xb3\xaa\xb8\xa6\xc0\xd8\xc1\xf6\xb8\xbb\xbe\xc6\xbf\xe4', //łŞ¸¦ŔŘÁö¸»ľĆżä
			attachedEntity: true
		}
	],

	'292_ground': [
		{
			// Dont forget
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				ForgetEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	293: [
		{
			//EF_BOTTOM_FORTUNEKISS	Fortune's Kiss Map Unit
			wav: 'effect/\xc7\xe0\xbf\xee\xc0\xc7', //ÇŕżîŔÇ
			attachedEntity: true
		}
	],

	'293_ground': [
		{
			// Fortune kiss /ladyluck
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				FortuneEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	294: [
		{
			//EF_BOTTOM_SERVICEFORYOU	Service For You Map Unit
			wav: 'effect/\xb4\xe7\xbd\xc5\xc0\xbb\x20\xc0\xa7\xc7\xd1\x20\xbc\xad\xba\xf1\xbd\xba', //´ç˝ĹŔ» Ŕ§ÇŃ Ľ­şń˝ş
			attachedEntity: true
		}
	],

	'294_ground': [
		{
			// Service
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				ServiceEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	295: [
		{
			//EF_TALK_FROSTJOKE	   Frost Joke
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				if (Params.Init.ownerAID == Session.Entity.GID) {
					const msg = DB.getRandomJoke();
					if (msg) {
						ChatBox.onRequestTalk('', msg, ChatBox.TYPE.PUBLIC);
					}
				}
			}
		}
	],

	296: [
		{
			//EF_TALK_SCREAM	   Scream
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				if (Params.Init.ownerAID == Session.Entity.GID) {
					const msg = DB.getRandomScream();
					if (msg) {
						ChatBox.onRequestTalk('', msg, ChatBox.TYPE.PUBLIC);
					}
				}
			}
		}
	],

	297: [
		{
			//EF_POKJUK	   Fire Works (Visual Effect)
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				PokJukWeatherEffect.startOrRestart(Params);
			}
		}
	],

	298: [
		{
			//EF_THROWITEM	   Acid Terror Animnation
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 300,
			fadeIn: true,
			fadeOut: true,
			file: '\xc0\xaf\xc0\xfa\xc0\xce\xc5\xcd\xc6\xe4\xc0\xcc\xbd\xba/item/\xbf\xb0\xbb\xea\xba\xb4.bmp',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			rotate: true,
			nbOfRotation: 0.5,
			size: 30,
			zOffset: 1,
			zIndex: 1
		}
	]
};
