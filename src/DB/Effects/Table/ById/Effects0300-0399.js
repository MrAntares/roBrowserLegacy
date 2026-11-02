/**
 * @module DB/Effects/Table/ById/Effects0300-0399
 *
 * Effects 300 to 399 of the effect table, in ID order (see EffectConst.js).
 * DB/Effects/EffectTable.js joins the parts; its header lists the parameters a row takes.
 */

import SakuraWeatherEffect from 'Renderer/Effects/SakuraWeatherEffect.js';
import Camera from 'Renderer/Camera.js';
import SongEffects from 'Renderer/Effects/Songs.js';
import FlatColorTile from 'Renderer/Effects/FlatColorTile.js';
import Poison from 'Renderer/Effects/PoisonEffect.js';
import Blind from 'Renderer/Effects/Shaders/Blind.js';

const GospelEffects = SongEffects.GospelEffects;

export default {
	//299: [{}],	//EF_THROWITEM2	   (Nothing)

	300: [
		{
			//EF_CHEMICALPROTECTION	   Chemical Protection
			wav: 'apocalips_attack'
		}
	],

	//301: [{}],	//EF_POKJUK_SOUND	   Fire Works (Sound Effect) [this is needed?]

	302: [
		{
			//EF_DEMONSTRATION	Bomb
			type: 'SPR',
			file: '\xb5\xa5\xb8\xf3\xbd\xba\xc6\xae\xb7\xb9\xc0\xcc\xbc\xc7',
			attachedEntity: false
		}
	],

	303: [
		{
			//EF_CHEMICAL2
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const start = Params.Inst.startTick + 132;
				Camera.setQuake(start);
			}
		}
	],

	304: [
		{
			//teleportation animation	//EF_TELEPORTATION2	Teleportation Animation
			alphaMax: 0.5,
			animation: 5,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 0.3,
			duration: 1500,
			fade: true,
			green: 0.6,
			height: 35,
			red: 0.6,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 0.3,
			type: 'CYLINDER',
			wav: 'effect/ef_teleportation'
		},
		{
			alphaMax: 0.5,
			animation: 5,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 0.6,
			duration: 1500,
			fade: true,
			green: 0.6,
			height: 25,
			red: 0.6,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 0.8,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.5,
			animation: 5,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 0.8,
			duration: 1500,
			fade: true,
			green: 0.6,
			height: 13,
			red: 0.6,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 1,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.5,
			animation: 5,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 1,
			duration: 1500,
			fade: true,
			green: 0.6,
			height: 5,
			red: 0.6,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 1.3,
			type: 'CYLINDER'
		}
	],

	305: [
		{
			//potion success	//EF_PHARMACY_OK	Pharmacy Success
			type: 'STR',
			file: 'p_success',
			wav: 'effect/p_success',
			attachedEntity: true
		}
	],

	306: [
		{
			//potion failed	//EF_PHARMACY_FAIL	Pharmacy Failed
			type: 'STR',
			file: 'p_failed',
			wav: 'effect/p_failed',
			attachedEntity: true
		}
	],

	//307: [{}],	//EF_FORESTLIGHT	   Forest Light 1

	308: [
		{
			//EF_THROWITEM3	   Throw Stone
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 200,
			fadeIn: true,
			fadeOut: true,
			file: '\xc0\xaf\xc0\xfa\xc0\xce\xc5\xcd\xc6\xe4\xc0\xcc\xbd\xba/item/\xb5\xb9.bmp',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			rotate: true,
			nbOfRotation: 0.5,
			size: 20,
			zOffset: 1,
			zIndex: 1
		}
	],

	309: [
		{
			//EF_FIRSTAID	   First Aid: official effect 309
			// One additive pikapika2 billboard, 4 cells across, 2.4 cells up, tinted (150, 150, 250),
			// random roll; alpha 0 -> 80/255 over 20 ticks, held to tick 100, 0 at tick 180 (3 s).
			// Size pulses +-5 % (one pulse every 2 s); it stays where the caster stood at launch.
			type: '2D',
			alphaMax: 80 / 255,
			blendMode: 2,
			file: 'effect/pikapika2.bmp',
			red: 150 / 255,
			green: 150 / 255,
			blue: 250 / 255,
			angleRand: [0, 359],
			fadeInMs: 20 * (1000 / 60),
			fadeOutStartMs: 100 * (1000 / 60),
			duration: 180 * (1000 / 60),
			size: 140,
			sizePulse: { amount: 0.05, degPerTick: 3 },
			posz: 2.4,
			wav: '_heal_effect'
		}
	],

	//310: [{}],	//EF_SPRINKLESAND	   Sprinkle Sand

	311: [
		{
			//crazy uproar	//EF_LOUD	Crazy Uproar
			type: 'STR',
			file: 'loud',
			wav: 'effect/\xb0\xed\xbc\xba\xb9\xe6\xb0\xa1',
			attachedEntity: true
		}
	],

	312: [
		{
			//EF_HEAL	   Heal Effect
			alphaMax: 0.2,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.7,
			bottomSize: 0.95,
			duration: 1500,
			fade: true,
			green: 1,
			height: 8,
			red: 0.7,
			rotate: true,
			textureName: 'ring_white',
			topSize: 0.95,
			type: 'CYLINDER',
			wav: '_heal_effect'
		},
		{
			alphaMax: 0.2,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.7,
			bottomSize: 1,
			duration: 1500,
			fade: true,
			green: 1,
			height: 8,
			red: 0.7,
			rotate: true,
			textureName: 'ring_white',
			topSize: 1,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.6,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			duration: 1300,
			delayOffset: 400,
			duplicate: 15,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/pok3.tga',
			green: 1,
			posxRand: 1.5,
			posyRand: 1.5,
			poszEndRand: 2,
			poszEndRandMiddle: 6,
			poszStart: 0,
			red: 1,
			size: 9,
			sizeRand: 2,
			timeBetweenDupli: 10,
			type: '3D',
			zIndex: 1
		},
		{
			alphaMax: 0.6,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			duration: 1100,
			delayLate: 200,
			duplicate: 7,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/pok3.tga',
			green: 1,
			posxRand: 1,
			posyRand: 1,
			poszEnd: 5,
			poszStartRand: 1,
			poszStartRandMiddle: 0,
			red: 1,
			size: 9,
			sizeRand: 2,
			timeBetweenDupli: 50,
			type: '3D',
			zIndex: 1
		}
	],

	313: [
		{
			//EF_HEAL2	   Heal Effect 2
			alphaMax: 0.3,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.7,
			bottomSize: 1.1,
			duration: 1500,
			fade: true,
			green: 1,
			height: 15,
			red: 0.7,
			rotate: true,
			textureName: 'ring_white',
			topSize: 1.1,
			type: 'CYLINDER',
			wav: '_heal_effect'
		},
		{
			alphaMax: 0.3,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.7,
			bottomSize: 1,
			duration: 1500,
			fade: true,
			green: 1,
			height: 13,
			red: 0.7,
			rotate: true,
			textureName: 'ring_white',
			topSize: 1,
			type: 'CYLINDER',
			wav: '_heal_effect'
		},
		{
			alphaMax: 0.3,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.7,
			bottomSize: 1.1,
			duration: 1500,
			fade: true,
			green: 1,
			height: 2,
			red: 0.7,
			rotate: true,
			textureName: 'ring_white',
			topSize: 3,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.8,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			duration: 1500,
			duplicate: 4,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/pok3.tga',
			green: 1,
			posxRand: 1.2,
			posyRand: 1.2,
			poszEndRand: 1,
			poszEndRandMiddle: 8,
			poszStart: 0,
			red: 1,
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
			blue: 1,
			duration: 1300,
			delayOffset: 400,
			duplicate: 20,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/pok3.tga',
			green: 1,
			posxRand: 1.5,
			posyRand: 1.5,
			poszEndRand: 3,
			poszEndRandMiddle: 6,
			poszStart: 0,
			red: 1,
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
			blue: 1,
			duration: 1100,
			delayLate: 200,
			duplicate: 10,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/pok3.tga',
			green: 1,
			posxRand: 1,
			posyRand: 1,
			poszEnd: 6,
			poszStartRand: 1,
			poszStartRandMiddle: 0,
			red: 1,
			size: 9,
			sizeRand: 2,
			timeBetweenDupli: 50,
			type: '3D',
			zIndex: 1
		}
	],

	314: [
		{
			//EF_EXIT2	   Old Map Exit effect (Unused)
			alphaMax: 0.3,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 0.3,
			duration: 1500,
			fade: true,
			green: 0.5,
			height: 35,
			red: 0.5,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 0.3,
			type: 'CYLINDER',
			wav: 'effect/ef_teleportation'
		},
		{
			alphaMax: 0.3,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 0.4,
			duration: 1500,
			fade: true,
			green: 0.5,
			height: 23,
			red: 0.5,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 0.6,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.3,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 0.5,
			duration: 1500,
			fade: true,
			green: 0.5,
			height: 5,
			red: 0.5,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 0.7,
			type: 'CYLINDER'
		}
	],

	315: [
		{
			//EF_GLASSWALL2	Safety Wall
			attachedEntity: true,
			file: 'safetywall',
			repeat: false,
			type: 'STR',
			wav: 'effect/ef_glasswall'
		},
		{
			alphaMax: 0.4,
			animation: 0,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.5,
			bottomSize: 0.6,
			duration: 50000,
			fade: true,
			green: 0.1,
			height: 7,
			red: 0.5,
			rotate: true,
			textureName: 'alpha_down',
			topSize: 0.6,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.4,
			animation: 0,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.5,
			bottomSize: 0.65,
			duration: 50000,
			delayOffset: 50,
			fade: true,
			green: 0.1,
			height: 6,
			red: 0.5,
			rotate: true,
			textureName: 'alpha_down',
			topSize: 0.65,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.4,
			animation: 0,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.5,
			bottomSize: 0.7,
			duration: 50000,
			delayOffset: 100,
			fade: true,
			green: 0.1,
			height: 7,
			red: 0.5,
			rotate: true,
			textureName: 'alpha_down',
			topSize: 0.7,
			type: 'CYLINDER'
		}
	],

	316: [
		{
			//Warp Portal Animation 1	//EF_READYPORTAL2	Warp Portal Animation 1
			alphaMax: 0.4,
			animation: 4,
			attachedEntity: true,
			blendMode: 2,
			renderBeforeEntities: true,
			blue: 1,
			bottomSize: 2.4,
			duration: 500,
			fadeOut: true,
			green: 0.6,
			height: 0.1,
			posZ: 0.1,
			red: 0.6,
			rotate: true,
			textureName: 'ring_blue',
			repeat: true,
			repeatDelay: -300,
			topSize: 3.9,
			wav: 'effect/ef_readyportal',
			type: 'CYLINDER'
		}
	],

	317: [
		{
			//Warp Portal Animation 2	//EF_PORTAL2	Warp Portal Animation 2
			alphaMax: 0.4,
			animation: 4,
			attachedEntity: true,
			blendMode: 2,
			renderBeforeEntities: true,
			blue: 1,
			bottomSize: 2.4,
			duration: 500,
			fadeOut: true,
			green: 0.6,
			height: 0.1,
			posZ: 0.1,
			red: 0.6,
			rotate: true,
			textureName: 'ring_blue',
			repeat: true,
			repeatDelay: -300,
			topSize: 3.9,
			wav: 'effect/ef_readyportal',
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.3,
			animation: 0,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 0.6,
			duration: 25000,
			fade: true,
			green: 0.6,
			height: 15,
			red: 0.6,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 0.6,
			wav: 'effect/ef_portal',
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.3,
			animation: 0,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 0.8,
			duration: 25000,
			fade: true,
			green: 0.6,
			height: 13,
			red: 0.6,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 0.8,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.5,
			animation: 0,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 1,
			duration: 25000,
			fade: true,
			green: 0.6,
			height: 1,
			posZ: 2,
			red: 0.6,
			rotate: true,
			totalCircleSides: 20,
			circleSides: 10,
			repeatTextureX: 2,
			textureName: 'alpha1',
			topSize: 1,
			type: 'CYLINDER'
		}
	],

	soulink_caster_effect: [
		{
			// todo
			wav: 'effect/\x74\x5f\xba\xae\xc6\xa8\xb1\xe8',
			attachedEntity: false
		}
	],

	318: [
		{
			//EF_BOTTOM_MAG	Magnus Exorcisimus Map Unit
			alphaMax: 0.2,
			animation: 0,
			attachedEntity: true,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 0.7,
			duration: 50000,
			fade: false,
			height: 5,
			rotate: false,
			textureName: 'ring_red',
			topSize: 0.7,
			type: 'CYLINDER',
			angleY: 45
		},
		{
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 0.7,
			duration: 2000,
			fade: true,
			height: 5,
			rotate: false,
			textureName: 'ring_red',
			topSize: 0.7,
			type: 'CYLINDER',
			angleY: 45,
			repeat: true
		}
	],

	319: [
		{
			//EF_BOTTOM_SANC	Sanctuary Map Unit
			alphaMax: 0.3,
			animation: 0,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.5,
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 0.7,
			duration: 50000,
			fade: false,
			green: 0.9,
			height: 2,
			red: 0.5,
			rotate: false,
			textureName: 'magic_green',
			topSize: 0.7,
			type: 'CYLINDER',
			angleY: 45
		},
		{
			alphaMax: 0.1,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.5,
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 0.7,
			duration: 2000,
			fade: true,
			green: 0.9,
			height: 2,
			red: 0.5,
			rotate: false,
			textureName: 'magic_green',
			topSize: 0.7,
			type: 'CYLINDER',
			angleY: 45,
			repeat: true
		}
	],

	320: [
		{
			//EF_HEAL3	   Offensive Heal
			alphaMax: 0.2,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 0.95,
			duration: 1000,
			fade: true,
			green: 1,
			height: 10,
			red: 1,
			rotate: true,
			textureName: 'ring_white',
			topSize: 0.95,
			type: 'CYLINDER',
			wav: '_heal_effect'
		},
		{
			alphaMax: 0.2,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 1,
			duration: 1000,
			fade: true,
			green: 1,
			height: 9,
			red: 1,
			rotate: true,
			textureName: 'ring_white',
			topSize: 1,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.8,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			duration: 1000,
			delayOffset: 400,
			duplicate: 10,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/pok3.tga',
			green: 1,
			posxRand: 1.5,
			posyRand: 1.5,
			poszEndRand: 3,
			poszEndRandMiddle: 6,
			poszStart: 0,
			red: 1,
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
			blue: 1,
			duration: 900,
			delayLate: 200,
			duplicate: 5,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/pok3.tga',
			green: 1,
			posxRand: 1,
			posyRand: 1,
			poszEnd: 6,
			poszStartRand: 1,
			poszStartRandMiddle: 0,
			red: 1,
			size: 9,
			sizeRand: 2,
			sparkling: true,
			sparkNumber: 2,
			timeBetweenDupli: 50,
			type: '3D',
			zIndex: 1
		}
	],

	321: [
		{
			//EF_WARPZONE2	   Warp NPC
			alphaMax: 0.4,
			animation: 3,
			renderBeforeEntities: true,
			attachedEntity: true,
			blendMode: 2,
			bottomSize: 2,
			duration: 4000,
			duplicate: 4,
			timeBetweenDupli: 1000,
			fade: true,
			red: 0.5,
			green: 0.5,
			blue: 1,
			height: 1.1,
			repeat: true,
			rotate: false,
			textureName: 'ring_blue',
			topSize: 3.3,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.4,
			animation: 3,
			renderBeforeEntities: true,
			attachedEntity: true,
			blendMode: 2,
			bottomSize: 1.9,
			duration: 4000,
			duplicate: 4,
			timeBetweenDupli: 1000,
			fade: true,
			red: 0.5,
			green: 0.5,
			blue: 1,
			height: 1.1,
			repeat: true,
			rotate: false,
			textureName: 'ring_blue',
			topSize: 3.2,
			type: 'CYLINDER'
		},
		{
			alphaMax: 1.0,
			attachedEntity: true,
			blendMode: 2,
			renderBeforeEntities: true,
			duration: 1000,
			duplicate: 5,
			timeBetweenDupli: 300,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/pok1.tga',
			red: 0.9,
			green: 1,
			blue: 0.9,
			posxStartRand: 3,
			posxStartRandMiddle: 0,
			posyStartRand: 3,
			posyStartRandMiddle: 0,
			poszEndRand: 2,
			poszEndRandMiddle: 2,
			poszStart: 0,
			repeat: true,
			size: 50,
			type: '3D',
			zIndex: 1
		}
	],
	//322: [{}],	//EF_FORESTLIGHT2	   Forest Light 2
	//323: [{}],	//EF_FORESTLIGHT3	   Forest Light 3
	//324: [{}],	//EF_FORESTLIGHT4	   Forest Light 4
	325: [
		{
			//EF_HEAL4	   Heal Effect 4
			alphaMax: 0.3,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.7,
			bottomSize: 1.1,
			duration: 1500,
			fade: true,
			green: 1,
			height: 18,
			red: 0.7,
			rotate: true,
			textureName: 'ring_white',
			topSize: 1.1,
			type: 'CYLINDER',
			wav: '_heal_effect'
		},
		{
			alphaMax: 0.3,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.7,
			bottomSize: 1,
			duration: 1500,
			fade: true,
			green: 1,
			height: 15,
			red: 0.7,
			rotate: true,
			textureName: 'ring_white',
			topSize: 1,
			type: 'CYLINDER',
			wav: '_heal_effect'
		},
		{
			alphaMax: 0.3,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.7,
			bottomSize: 1.1,
			duration: 1500,
			fade: true,
			green: 1,
			height: 3,
			red: 0.7,
			rotate: true,
			textureName: 'ring_white',
			topSize: 3,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.8,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			duration: 1500,
			duplicate: 7,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/pok3.tga',
			green: 1,
			posxRand: 1.2,
			posyRand: 1.2,
			poszEndRand: 1,
			poszEndRandMiddle: 8,
			poszStart: 0,
			red: 1,
			size: 9,
			sizeRand: 2,
			sparkling: true,
			sparkNumber: 3,
			timeBetweenDupli: 10,
			type: '3D',
			zIndex: 1
		},
		{
			alphaMax: 0.8,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			duration: 1300,
			delayOffset: 400,
			duplicate: 25,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/pok3.tga',
			green: 1,
			posxRand: 1.5,
			posyRand: 1.5,
			poszEndRand: 3,
			poszEndRandMiddle: 6,
			poszStart: 0,
			red: 1,
			size: 10,
			sizeRand: 5,
			sparkling: true,
			sparkNumber: 3,
			timeBetweenDupli: 10,
			type: '3D',
			zIndex: 1
		},
		{
			alphaMax: 0.8,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			duration: 1100,
			delayLate: 200,
			duplicate: 15,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/pok3.tga',
			green: 1,
			posxRand: 1,
			posyRand: 1,
			poszEnd: 6,
			poszStartRand: 1,
			poszStartRandMiddle: 0,
			red: 1,
			size: 11,
			sizeRand: 2,
			timeBetweenDupli: 50,
			type: '3D',
			zIndex: 1
		}
	],
	//326: [{}],	//EF_FOOT	   Chase Walk Left Foot
	//327: [{}],	//EF_FOOT2	   Chse Walk Right Foot

	328: [
		{
			//EF_BEGINASURA	   Monk Asura Strike
			type: 'CYLINDER',
			textureName: 'ring_white',
			fade: true,
			animation: 2,
			attachedEntity: true,
			blendMode: 2,
			bottomSize: 1,
			topSize: 4.5,
			height: -4,
			duration: 800
		},
		{
			type: 'CYLINDER',
			textureName: 'ring_white',
			fade: true,
			animation: 2,
			attachedEntity: true,
			blendMode: 2,
			bottomSize: 1,
			topSize: 2.5,
			height: -4,
			duration: 800
		},
		// asura1 — phase 1: appear + shrink
		{
			type: '3D',
			file: 'effect/asura1.tga',
			alphaMax: 1,
			attachedEntity: true,
			duration: 1200,
			duplicate: 3,
			timeBetweenDupli: 150,
			alphaMaxDelta: -0.25,
			fadeIn: true,
			sizeStart: 250,
			sizeEnd: 120,
			sizeSmooth: true,
			posx: -6.0,
			posy: 0,
			posz: 4,
			overlay: true,
			red: 0.1,
			green: 0.1,
			blue: 0.1,
			delayStart: 0
		},
		// asura1 — phase 2: grow-back + fade out
		{
			type: '3D',
			file: 'effect/asura1.tga',
			alphaMax: 1,
			attachedEntity: true,
			duration: 400,
			fadeOut: true,
			sizeStart: 120,
			sizeEnd: 200,
			posx: -6.0,
			posy: 0,
			posz: 4,
			overlay: true,
			red: 0.1,
			green: 0.1,
			blue: 0.1,
			delayStart: 1200
		},
		// asura2 — phase 1
		{
			type: '3D',
			file: 'effect/asura2.tga',
			alphaMax: 1,
			attachedEntity: true,
			duration: 1200,
			duplicate: 3,
			timeBetweenDupli: 150,
			alphaMaxDelta: -0.25,
			fadeIn: true,
			sizeStart: 250,
			sizeEnd: 120,
			sizeSmooth: true,
			posx: -3.6,
			posy: 0,
			posz: 4,
			overlay: true,
			red: 0.1,
			green: 0.1,
			blue: 0.1,
			delayStart: 100
		},
		// asura2 — phase 2
		{
			type: '3D',
			file: 'effect/asura2.tga',
			alphaMax: 1,
			attachedEntity: true,
			duration: 400,
			fadeOut: true,
			sizeStart: 120,
			sizeEnd: 200,
			posx: -3.6,
			posy: 0,
			posz: 4,
			overlay: true,
			red: 0.1,
			green: 0.1,
			blue: 0.1,
			delayStart: 1300
		},
		// asura3 — phase 1
		{
			type: '3D',
			file: 'effect/asura3.tga',
			alphaMax: 1,
			attachedEntity: true,
			duration: 1200,
			duplicate: 3,
			timeBetweenDupli: 150,
			alphaMaxDelta: -0.25,
			fadeIn: true,
			sizeStart: 250,
			sizeEnd: 120,
			sizeSmooth: true,
			posx: -1.2,
			posy: 0,
			posz: 4,
			overlay: true,
			red: 0.1,
			green: 0.1,
			blue: 0.1,
			delayStart: 200
		},
		// asura3 — phase 2
		{
			type: '3D',
			file: 'effect/asura3.tga',
			alphaMax: 1,
			attachedEntity: true,
			duration: 400,
			fadeOut: true,
			sizeStart: 120,
			sizeEnd: 200,
			posx: -1.2,
			posy: 0,
			posz: 4,
			overlay: true,
			red: 0.1,
			green: 0.1,
			blue: 0.1,
			delayStart: 1400
		},
		// asura4 — phase 1
		{
			type: '3D',
			file: 'effect/asura4.tga',
			alphaMax: 1,
			attachedEntity: true,
			duration: 1200,
			duplicate: 3,
			timeBetweenDupli: 150,
			alphaMaxDelta: -0.25,
			fadeIn: true,
			sizeStart: 250,
			sizeEnd: 120,
			sizeSmooth: true,
			posx: 1.2,
			posy: 0,
			posz: 4,
			overlay: true,
			red: 0.1,
			green: 0.1,
			blue: 0.1,
			delayStart: 300
		},
		// asura4 — phase 2
		{
			type: '3D',
			file: 'effect/asura4.tga',
			alphaMax: 1,
			attachedEntity: true,
			duration: 400,
			fadeOut: true,
			sizeStart: 120,
			sizeEnd: 200,
			posx: 1.2,
			posy: 0,
			posz: 4,
			overlay: true,
			red: 0.1,
			green: 0.1,
			blue: 0.1,
			delayStart: 1500
		},
		// asura5 — phase 1
		{
			type: '3D',
			file: 'effect/asura5.tga',
			alphaMax: 1,
			attachedEntity: true,
			duration: 1200,
			duplicate: 3,
			timeBetweenDupli: 150,
			alphaMaxDelta: -0.25,
			fadeIn: true,
			sizeStart: 250,
			sizeEnd: 120,
			sizeSmooth: true,
			posx: 3.6,
			posy: 0,
			posz: 4,
			overlay: true,
			red: 0.1,
			green: 0.1,
			blue: 0.1,
			delayStart: 400
		},
		// asura5 — phase 2
		{
			type: '3D',
			file: 'effect/asura5.tga',
			alphaMax: 1,
			attachedEntity: true,
			duration: 400,
			fadeOut: true,
			sizeStart: 120,
			sizeEnd: 200,
			posx: 3.6,
			posy: 0,
			posz: 4,
			overlay: true,
			red: 0.1,
			green: 0.1,
			blue: 0.1,
			delayStart: 1600
		},
		// asura6 — phase 1
		{
			type: '3D',
			file: 'effect/asura6.tga',
			alphaMax: 1,
			attachedEntity: true,
			duration: 1200,
			duplicate: 3,
			timeBetweenDupli: 150,
			alphaMaxDelta: -0.25,
			fadeIn: true,
			sizeStart: 250,
			sizeEnd: 120,
			sizeSmooth: true,
			posx: 6.0,
			posy: 0,
			posz: 4,
			overlay: true,
			red: 0.1,
			green: 0.1,
			blue: 0.1,
			delayStart: 500
		},
		// asura6 — phase 2
		{
			type: '3D',
			file: 'effect/asura6.tga',
			alphaMax: 1,
			attachedEntity: true,
			duration: 400,
			fadeOut: true,
			sizeStart: 120,
			sizeEnd: 200,
			posx: 6.0,
			posy: 0,
			posz: 4,
			overlay: true,
			red: 0.1,
			green: 0.1,
			blue: 0.1,
			delayStart: 1700
		}
	],

	329: [
		{
			//EF_TRIPLEATTACK	   Triple Strike
			wav: 'effect/ef_hit2'
		},
		{
			wav: 'effect/ef_hit4',
			delayWav: 200
		},
		{
			wav: 'effect/ef_hit2',
			delayWav: 400
		}
	],

	//330: [{}],	//EF_HITLINE	   Combo Finish

	331: [
		{
			//EF_HPTIME	   Natural HP Regeneration
			type: '3D',
			duplicate: 12,
			file: 'effect/pok1.tga',
			delay: 500,
			timeBetweenDupli: 10,
			alphaMax: 0.8,
			fadeOut: true,
			fadeIn: true,
			zIndex: 1,
			size: 30,
			sizeRand: 20,
			red: 0.9,
			green: 1,
			blue: 0.9,
			blendMode: 2,
			poszStartRand: 1.5,
			poszStartRandMiddle: 2,
			poszEndRandMiddle: 5,
			poszEndRand: 1,
			sparkling: true,
			sparkNumberRand: [3, 6],
			posxRand: 0.6,
			posyRand: 0.6,
			attachedEntity: true
		},
		{
			wav: '_heal_effect'
		}
	],

	332: [
		{
			//EF_SPTIME	   Natural SP Regeneration
			type: '3D',
			duplicate: 12,
			file: 'effect/pok1.tga',
			delay: 500,
			timeBetweenDupli: 10,
			alphaMax: 0.8,
			fadeOut: true,
			fadeIn: true,
			zIndex: 1,
			size: 30,
			sizeRand: 20,
			red: 0.9,
			green: 0.9,
			blue: 1,
			blendMode: 2,
			poszStartRand: 1.5,
			poszStartRandMiddle: 2,
			poszEndRandMiddle: 5,
			poszEndRand: 1,
			sparkling: true,
			sparkNumberRand: [3, 6],
			posxRand: 0.6,
			posyRand: 0.6,
			attachedEntity: true
		},
		{
			wav: 'effect/\xc8\xed\xb1\xe2'
		}
	],

	333: [
		{
			//EF_MAPLE	   Autumn Leaves
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				SakuraWeatherEffect.startOrRestart(Params);
			}
		}
	],

	334: [
		{
			//EF_BLIND	   Blind
			type: 'FUNC',
			attachedEntity: false,
			wav: '_blind',
			func: function (Params) {
				Blind.setActive(true);
			}
			/*file: 'effect/fullb.tga',
			file: 'effect/white02.bmp',*/
		}
	],

	335: [
		{
			//EF_POISON	   Poison
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				Poison.setActive(true);
			}
		}
	],

	336: [
		{
			//kyrie eleison / parrying	(when target blocked dmg)	//EF_GUARD	Kyrie Eleison/Parrying Shield
			wav: 'effect/kyrie_guard',
			attachedEntity: true
		},
		{
			type: 'CYLINDER',
			textureName: 'guardk',
			blendMode: 2,
			duration: 600,
			fade: true,
			totalCircleSides: 8,
			circleSides: 5,
			repeatTextureX: 5,
			angleY: 112.5,
			bottomSize: 1.5,
			topSize: 1,
			height: 0.7,
			posZ: 2.14,
			alphaMax: 0.6,
			red: 0.91,
			green: 1.0,
			blue: 0.9,
			rotateWithSource: true,
			attachedEntity: true
		},
		{
			type: 'CYLINDER',
			textureName: 'guardk',
			blendMode: 2,
			duration: 600,
			fade: true,
			totalCircleSides: 8,
			circleSides: 5,
			repeatTextureX: 5,
			angleY: 112.5,
			bottomSize: 1.5,
			topSize: 1.5,
			height: 1.14,
			posZ: 1,
			alphaMax: 0.6,
			red: 0.91,
			green: 1.0,
			blue: 0.9,
			rotateWithSource: true,
			attachedEntity: true
		},
		{
			type: 'CYLINDER',
			textureName: 'guardk',
			blendMode: 2,
			duration: 600,
			fade: true,
			totalCircleSides: 8,
			circleSides: 5,
			repeatTextureX: 5,
			angleY: 112.5,
			bottomSize: 1,
			topSize: 1.5,
			height: 0.7,
			posZ: 0.3,
			alphaMax: 0.6,
			red: 0.91,
			green: 1.0,
			blue: 0.9,
			rotateWithSource: true,
			attachedEntity: true
		}
	],

	337: [
		{
			//EF_JOBLVUP50	Class Change
			type: 'STR',
			file: 'joblvup',
			attachedEntity: true
		}
	],

	//338: [{}],	//EF_ANGEL2	   Super Novice/Taekwon Level Up Angel

	'339_beforecast': [
		{
			//EF_MAGNUM2	   Spiral Pierce
			type: 'FUNC',
			attachedEntity: true,
			func: function EffectBodyColor(Params) {
				const entity = Params.Init.ownerEntity;
				entity._flashColor[0] = 1.0;
				entity._flashColor[1] = 1.0;
				entity._flashColor[2] = 1.0;
				entity._flashColor[3] = 1.0;
				entity.recalculateBlendingColor();

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
					entity._flashColor[1] = 0.0 + Math.sin(tick / (6 * Math.PI));
					entity._flashColor[2] = 0.0 + Math.sin(tick / (6 * Math.PI));
					entity.recalculateBlendingColor();
				});
			}
		}
	],

	339: [
		{
			//EF_MAGNUM2	   Spiral Pierce
			wav: 'permeter_attack'
		},
		{
			wav: 'effect/ef_magnumbreak',
			delayWav: 300
		}
	],

	//340: [{}],	//EF_CALLZONE	   (Nothing)
	//341: [{}],	//EF_PORTAL3	   Wedding Warp Portal
	//342: [{}],	//EF_COUPLECASTING	   Wedding Skill
	//343: [{}],	//EF_HEARTCASTING	   Another Merry Skill

	344: [
		{
			//EF_ENTRY2	   Character map entry effect
			alphaMax: 0.5,
			animation: 5,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 0.3,
			duration: 1500,
			fade: true,
			green: 0.6,
			height: 35,
			red: 0.6,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 0.3,
			type: 'CYLINDER',
			wav: 'effect/ef_portal'
		},
		{
			alphaMax: 0.5,
			animation: 5,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 0.6,
			duration: 1500,
			fade: true,
			green: 0.6,
			height: 25,
			red: 0.6,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 0.8,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.5,
			animation: 5,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 0.8,
			duration: 1500,
			fade: true,
			green: 0.6,
			height: 13,
			red: 0.6,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 1,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.5,
			animation: 5,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 1,
			duration: 1500,
			fade: true,
			green: 0.6,
			height: 5,
			red: 0.6,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 1.3,
			type: 'CYLINDER'
		}
	],

	//345: [{}],	//EF_SAINTWING	   Wings (Animated)
	//346: [{}],	//EF_SPHEREWIND	   Like Moonlight But Blue

	347: [
		{
			//EF_COLORPAPER	   Wedding Ceremony
			wav: 'effect/wedding'
		}
	],

	//348: [{}],	//EF_LIGHTSPHERE	   Like 1000 Blade trepassing
	349: [{ type: 'WATERFALL', variant: 'large', vertical: false }], // EF_WATERFALL
	350: [{ type: 'WATERFALL', variant: 'large', vertical: true }], // EF_WATERFALL_90
	351: [{ type: 'WATERFALL', variant: 'small', vertical: false }], // EF_WATERFALL_SMALL
	352: [{ type: 'WATERFALL', variant: 'small', vertical: true }], // EF_WATERFALL_SMALL_90
	353: [{ type: 'WATERFALL', variant: 'dark-large', vertical: false }], // EF_WATERFALL_T2
	354: [{ type: 'WATERFALL', variant: 'dark-large', vertical: true }], // EF_WATERFALL_T2_90
	355: [{ type: 'WATERFALL', variant: 'dark-small', vertical: false }], // EF_WATERFALL_SMALL_T2
	356: [{ type: 'WATERFALL', variant: 'dark-small', vertical: true }], // EF_WATERFALL_SMALL_T2
	//357: [{}],	//EF_MINI_TETRIS	   (Nothing)
	//358: [{}],	//EF_GHOST	   Niflheim Ghost
	//359: [{}],	//EF_BAT	   Niflheim Bat Slow
	//360: [{}],	//EF_BAT2	   Niflheim Bat Fast

	361: [
		{
			//EF_SOULBREAKER	   Soul Destroyer
			type: '3D',
			file: 'effect/purpleslash.tga',
			alphaMax: 0.4,
			duration: 500,
			fadeIn: true,
			fadeOut: true,
			zIndex: 10,
			toSrc: true,
			rotateWithCamera: true,
			rotateToTarget: true,
			angle: 90,
			posz: 2,
			sizeStart: 100,
			sizeEnd: 200,
			wav: 'effect/\xb1\xe2\xb0\xf8\xc6\xf7',
			attachedEntity: true
		}
	],

	362: [
		{
			//EF_LEVEL99_4	   Trancendant Level 99 Aura 1
			//effect\\whitelight.tga
			//Level99_3(1)
		}
	],

	363: [
		{
			//EF_VALLENTINE	Valentine Day Heart With Wings
			type: 'SPR',
			file: 'vallentine',
			wav: 'effect/vallentine',
			attachedEntity: true
		}
	],

	//364: [{}],	//EF_VALLENTINE2	   Valentine Day Heart

	365: [
		{
			//EF_PRESSURE	   Gloria Domini
			type: '3D',
			alphaMax: 0.6,
			attachedEntity: true,
			blendMode: 2,
			duration: 500,
			rotate: true,
			angle: 0,
			toAngle: -611,
			poszStart: 20,
			poszEnd: 5,
			size: 100,
			zIndex: 1,
			file: 'effect/cross_old.bmp',
			wav: 'effect/\xc7\xc1\xb7\xb9\xbc\xc5'
		},
		{
			type: '3D',
			alphaMax: 0.6,
			attachedEntity: true,
			blendMode: 2,
			duration: 500,
			delayOffset: 501,
			fadeOut: true,
			angle: -611,
			posz: 5,
			size: 100,
			zIndex: 1,
			file: 'effect/cross_old.bmp'
		},
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const start = Params.Inst.startTick + 500;
				Camera.setQuake(start);
			}
		}
	],

	366: [
		{
			//martyr's reckoning	//EF_BASH3D	   Martyr's Reckoning
			wav: 'effect/bash3d', // incorrect wav name
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const entity = Params.Init.ownerEntity;
				entity.animations.add(function (tick) {
					// Official: Halo (Double Body) is active between tick 20 and 40.
					entity._enableHalo = tick >= 150 && tick <= 450;

					if (tick >= 150 && tick <= 450) {
						// SetArgb(-1, 255, 200, 200) -> Light Red
						entity._flashColor[0] = 1.0;
						entity._flashColor[1] = 0.78;
						entity._flashColor[2] = 0.78;
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
			attachedEntity: true
		}
	],

	367: [
		{
			//aura blade	//EF_AURABLADE	Aura Blade
			wav: 'effect/\xbf\xc0\xb6\xf3\x20\xba\xed\xb7\xb9\xc0\xcc\xb5\xe5', //żŔ¶ó şí·ąŔĚµĺ
			attachedEntity: true
			//+ on cast small white-magic aura (double)
		}
	],

	368: [
		{
			//EF_REDBODY	Berserk
			wav: 'effect/\xb9\xf6\xbc\xad\xc5\xa9',
			attachedEntity: true
			//shake screen
		}
	],

	369: [
		{
			//EF_LKCONCENTRATION	Concentration
			type: 'STR',
			file: 'twohand',
			wav: 'effect/knight_twohandquicken',
			head: true,
			attachedEntity: true
		}
	],

	370: [
		{
			//EF_BOTTOM_GOSPEL	Gospel Map Unit
			wav: 'effect/\xb0\xa1\xbd\xba\xc6\xe7', //°ˇ˝şĆç
			attachedEntity: true
		}
	],

	'370_ground': [
		{
			// Gospel
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				const self = this;
				GospelEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	371: [
		{
			//EF_ANGEL	Level Up
			type: 'STR',
			file: 'angel',
			wav: 'levelup',
			attachedEntity: true
		}
	],

	372: [
		{
			//EF_DEVIL	Death
			type: 'STR',
			file: 'devil',
			attachedEntity: true
		}
	],

	373: [
		{
			//EF_DRAGONSMOKE	House Smoke
			type: 'SPR',
			file: 'poisonhit',
			attachedEntity: true
		}
	],

	374: [
		// EF_BOTTOM_BASILICA
		{
			// F1=1, GI[0] - Alpha 32, Height 14.0
			type: 'CYLINDER',
			textureName: 'alpha_down',
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 2.45,
			topSize: 2.45,
			height: 2.0,
			alphaMax: 32 / 255,
			blendMode: 2,
			rotateWithCamera: true,
			duration: 20000,
			attachedEntity: true
		},
		{
			// F1=1, GI[1] - Alpha 32, Height 14.4
			type: 'CYLINDER',
			textureName: 'alpha_down',
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 2.52,
			topSize: 2.52,
			height: 2.1,
			alphaMax: 32 / 255,
			blendMode: 2,
			rotateWithCamera: true,
			angleY: 10,
			duration: 20000,
			attachedEntity: true
		},
		{
			// F1=1, GI[2] - Alpha 15, Distance 26.6
			type: 'CYLINDER',
			textureName: 'alpha_down',
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 2.6,
			topSize: 2.6,
			height: 2.0,
			alphaMax: 15 / 255,
			blendMode: 2,
			rotateWithCamera: true,
			angleY: 26.6,
			duration: 20000,
			attachedEntity: true
		},
		{
			// F1=1, GI[3] - Alpha 15, Distance 79.8 (53.2+26.6)
			type: 'CYLINDER',
			textureName: 'alpha_down',
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 2.6,
			topSize: 2.6,
			height: 2.0,
			alphaMax: 15 / 255,
			blendMode: 2,
			rotateWithCamera: true,
			angleY: 79.8,
			duration: 20000,
			attachedEntity: true
		}
	],

	//375: [{}],	//EF_ASSUMPTIO	   Assumptio (Visual Effect)
	376: [
		{
			//EF_HITLINE2	   Palm Strike
			wav: 'effect/\xb8\xcd\xc8\xa3\xb0\xe6\xc6\xc4\xbb\xea'
		}
	],
	377: [
		{
			//martyr's reckoning 2	//EF_BASH3D2	   Martyr's Reckoning 2
			wav: 'effect/\x6d\x6f\x6e\x5f\xc6\xf8\xb1\xe2', //mon_¿¬È¯? can be incorrect wav name
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const entity = Params.Init.ownerEntity;
				entity.animations.add(function (tick) {
					// Official: Halo (Double Body) is active between tick 5 and 35.
					entity._enableHalo = tick >= 50 && tick <= 350;

					if (tick >= 50 && tick <= 350) {
						// SetArgb(-1, 255, 100, 100) -> Red
						entity._flashColor[0] = 1.0;
						entity._flashColor[1] = 0.39;
						entity._flashColor[2] = 0.39;
						entity._flashColor[3] = 1.0;
						entity.recalculateBlendingColor();
					} else {
						entity._flashColor[0] = 1.0;
						entity._flashColor[1] = 1.0;
						entity._flashColor[2] = 1.0;
						entity._flashColor[3] = 1.0;
						entity.recalculateBlendingColor();
					}
					return tick > 400;
				});
			}
		},
		{
			type: 'CYLINDER',
			textureName: 'alpha_center',
			alphaMax: 0.6,
			duration: 175,
			delayStart: 50,
			duplicate: 8,
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
			attachedEntity: true
		},
		{
			type: 'CYLINDER',
			textureName: 'alpha_center',
			alphaMax: 0.6,
			duration: 175,
			duplicate: 8,
			delayStart: 50,
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
			attachedEntity: true
		}
	],

	378: [
		{
			//EF_ENERGYDRAIN2          Energy Drain (1st Part)
			type: '3D',
			duration: 600,
			duplicate: 5,
			timeBetweenDupli: 0,
			absoluteSpriteName: 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/particle1',
			playSprite: true,

			fromSrc: true,
			toSrc: true,
			rotateToTarget: true,

			// Cyan (Based on C++ random(81) + 160 simplified here)
			red: 0.8,
			green: 0.8,
			blue: 1.0,

			sizeStart: 160.0,
			sizeEnd: 190.0,

			zOffsetStart: 5,
			arc: 3.0,
			retreat: 3.0,
			drainPattern: true
		}
	],
	379: [
		{
			//EF_TRANSBLUEBODY	   Energy Drain (2nd Part)
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

					// Enable halo (BL_DOUBLE_BODY actor)
					entity._enableHalo = true;

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
					entity._enableHalo = false;
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

	380: [
		{
			//EF_MAGICCRASHER	   Magic Crasher
			type: 'FUNC',
			attachedEntity: true,
			func: function EffectBodyColor(Params) {
				const entity = Params.Init.ownerEntity;
				entity.animations.add(function (tick) {
					if (tick < 1000) {
						if (tick > 500) {
							entity._flashColor[0] = Math.random();
							entity._flashColor[1] = Math.random();
							entity._flashColor[2] = Math.random();
							entity._flashColor[3] = 0.6;
							entity.recalculateBlendingColor();
						}
					} else {
						entity._flashColor[0] = 1;
						entity._flashColor[1] = 1;
						entity._flashColor[2] = 1;
						entity._flashColor[3] = 1;
						entity.recalculateBlendingColor();
						return true;
					}
				});
			},
			wav: 'effect/\xb8\xc5\xc1\xf7\x20\xc5\xa9\xb7\xa1\xbd\xac'
		},
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const start = Params.Inst.startTick + 300;
				Camera.setQuake(start);
			}
		}
	],

	//381: [{}],	//EF_LIGHTSPHERE2	   Blue Starburst (Unknown use)

	382: [
		{
			//EF_LIGHTBLADE	(Nothing)
			type: 'SPR',
			file: '\xc7\xd1\xba\xb9\xc3\xb5\xbb\xe7',
			head: true,
			attachedEntity: true
		}
	],

	383: [
		{
			//EF_ENERGYDRAIN3 (Health Conversion)
			type: '3D',
			duration: 600,
			duplicate: 5,
			timeBetweenDupli: 0,
			absoluteSpriteName: 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/particle1',
			playSprite: true,

			fromSrc: true,
			toSrc: true,
			rotateToTarget: true,

			// Green
			red: 0.7,
			green: 1.0,
			blue: 0.7,

			sizeStart: 140.0,
			sizeEnd: 170.0,

			zOffsetStart: 5,
			arc: 3.0,
			retreat: 3.0,
			drainPattern: true
		}
	],

	384: [
		{
			//EF_LINELINK2	   Soul Change (Sound Effect)
			wav: 'effect/\xbc\xd2\xbf\xef\x20\xc3\xbc\xc0\xce\xc1\xf6',
			attachedEntity: true
		}
	],

	//385: [{}],	//EF_LINKLIGHT	   Soul Change (Visual Effect)

	386: [
		{
			//EF_TRUESIGHT	   True Sight
			wav: 'effect/hunter_detecting',
			attachedEntity: true
		}
	],

	387: [
		{
			//EF_FALCONASSAULT	   Falcon Assault
			wav: 'effect/hunter_blitzbeat',
			attachedEntity: true
		},
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const start = Params.Inst.startTick + 300;
				Camera.setQuake(start);
			}
		}
	],

	388: [
		{
			//EF_TRIPLEATTACK2	   Focused Arrow Strike (Sound Effect)
			wav: 'effect/\xbb\xfe\xc7\xc1\xbd\xb4\xc6\xc3',
			attachedEntity: true
		}
	],

	389: [
		{
			//windwalk	//EF_PORTAL4	Wind Walk
			wav: 'effect/\xc0\xa9\xb5\xe5\xbf\xf6\xc5\xa9', //Ŕ©µĺżöĹ©
			attachedEntity: true
		}
	],

	390: [
		{
			//EF_MELTDOWN	Shattering Strike
			type: 'STR',
			file: 'melt',
			attachedEntity: true
		}
	],

	391: [
		{
			//EF_CARTBOOST	Cart Boost
			type: 'STR',
			file: 'cart',
			wav: 'effect/ef_incagility',
			attachedEntity: true
		}
	],

	392: [
		{
			//EF_REJECTSWORD	Reject Sword
			type: 'STR',
			file: 'sword',
			wav: 'effect/kyrie_guard',
			attachedEntity: true
		}
	],

	393: [
		{
			//EF_TRIPLEATTACK3	   Arrow Vulcan
			wav: 'effect/\xbe\xd6\xb7\xce\xbf\xec\x20\xb9\xdf\xc4\xad'
		}
	],

	394: [
		{
			// Moonlit water mill/sheltering bliss	//EF_SPHEREWIND2	Sheltering Bliss
			type: 'FUNC',
			wav: 'effect/\xb4\xde\xba\xfb\xbc\xbc\xb7\xb9\xb3\xaa\xb5\xa5',
			attachedEntity: false,
			func: function (Params) {
				const BlueTile = FlatColorTile('salmon', { r: 0xff / 255, g: 0x8a / 255, b: 0xbb / 255, a: 0.6 });
				this.add(new BlueTile(Params.Inst.position, Params.Inst.startTick), Params);
			}
		}
	],

	//395: [{}],	//EF_LINELINK3	   Marionette Control (Sound Effect)
	//396: [{}],	//EF_PINKBODY	   Marionette Control (Visual Effect)

	397: [
		{
			//EF_LEVEL99_5	   Trancended 99 Aura (Middle)
			//effect\\ring_blue.tga
			//Level99
		}
	],

	398: [
		{
			//EF_LEVEL99_6	   Trancended 99 Aura (Bottom)
			//effect\\pikapika2.bmp
			//Level99_2
		}
	],
	399: [
		{
			//headcrush caster	//EF_BASH3D3	Head Crush
			wav: 'effect/\xc7\xec\xb5\xe5\x20\xc5\xa9\xb7\xaf\xbd\xac', //Çìµå Å©·¯½¬
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const entity = Params.Init.ownerEntity;
				entity.animations.add(function (tick) {
					// Enable halo (BL_DOUBLE_BODY actor)
					entity._enableHalo = true;

					if (tick < 200) {
						const val = (255 - (tick + 50)) / 255;
						entity._flashColor[0] = 1.0;
						entity._flashColor[1] = 1.0;
						entity._flashColor[2] = val;
						entity._flashColor[3] = 1.0;
						entity.recalculateBlendingColor();
						return false;
					}

					if (tick < 500) {
						const progress = (tick - 200) / 300;
						const startVal = 5 / 255; // 255 - (200 + 50)
						const val = startVal + (1.0 - startVal) * progress;
						entity._flashColor[0] = 1.0;
						entity._flashColor[1] = 1.0;
						entity._flashColor[2] = val;
						entity._flashColor[3] = 1.0;
						entity.recalculateBlendingColor();
						return false;
					}

					// Final reset
					entity._enableHalo = false;
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
			type: 'CYLINDER',
			textureName: 'alpha_center',
			alphaMax: 0.6,
			duration: 175,
			delayStart: 500,
			duplicate: 6,
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
			attachedEntity: true
		},
		{
			type: 'CYLINDER',
			textureName: 'alpha_center',
			alphaMax: 0.6,
			duration: 175,
			duplicate: 6,
			delayStart: 500,
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
			attachedEntity: true
		}
	]
};
