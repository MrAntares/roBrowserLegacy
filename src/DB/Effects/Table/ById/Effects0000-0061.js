/**
 * @module DB/Effects/Table/ById/Effects0000-0061
 *
 * Effects 0 to 61 of the effect table, in ID order (see EffectConst.js).
 * DB/Effects/EffectTable.js joins the parts; its header lists the parameters a row takes.
 */

import LockOnTarget from 'Renderer/Effects/LockOnTarget.js';
import { endureEffect } from 'DB/Effects/EndureEffect.js';
import BoltRain from 'Renderer/Effects/BoltRain.js';
import IceSpikes from 'Renderer/Effects/IceSpikes.js';
import {
	planPath as planIcePath,
	planShards as planIceShards,
	PATH as ICE_PATH,
	SHARDS as ICE_SHARDS
} from 'Renderer/Effects/IceSpikesSim.js';
import { soulStrikeEffect } from 'DB/Effects/SoulStrikeEffect.js';

export default {
	0: [
		{
			//EF_HIT1	Regular hit
			type: '3D',
			duplicate: 4,
			timeBetweenDupli: 0,
			file: 'effect/pok3.tga',
			duration: 300,
			alphaMax: 0.8,
			alphaMin: 0.3,
			fadeIn: true,
			fadeOut: true,
			poszStart: 1,
			posxStart: 0,
			posyStart: 0,
			posxEndRand: 2,
			posyEndRand: 2,
			poszEndRand: 2,
			zIndex: 1,
			size: 10,
			red: 1,
			green: 1,
			blue: 1,
			sizeRand: 20,
			sizeSmooth: true,
			attachedEntity: false,
			sparkling: true
		}
	],

	1: [
		{
			alphaMax: 12,
			angleRand: [0, 35],
			attachedEntity: false,
			duration: 250,
			durationRand: [200, 350],
			fadeOut: true,
			fade: true,
			file: 'effect/lens1.tga',
			sizeEndX: 1,
			sizeRandEndY: [250, 300],
			sizeRandStartX: [25, 40],
			sizeRandStartY: [10, 10],
			circlePattern: true,
			circleOuterSizeRand: [5, 6],
			circleInnerSize: 2.2,
			type: '2D',
			overlay: true,
			zIndex: 1,
			wav: 'effect/ef_hit2'
		},
		{
			alphaMax: 12,
			angleRand: [50, 85],
			attachedEntity: false,
			duration: 250,
			durationRand: [200, 350],
			fadeOut: true,
			fade: true,
			file: 'effect/lens2.tga',
			sizeEndX: 1,
			sizeRandEndY: [250, 300],
			sizeRandStartX: [25, 40],
			sizeRandStartY: [10, 10],
			circlePattern: true,
			circleOuterSizeRand: [5, 6],
			circleInnerSize: 2.2,
			type: '2D',
			overlay: true,
			zIndex: 1
		},
		{
			alphaMax: 12,
			angleRand: [100, 135],
			attachedEntity: false,
			duration: 250,
			durationRand: [200, 350],
			fadeOut: true,
			fade: true,
			file: 'effect/lens1.tga',
			sizeEndX: 1,
			sizeRandEndY: [250, 300],
			sizeRandStartX: [25, 40],
			sizeRandStartY: [10, 10],
			circlePattern: true,
			circleOuterSizeRand: [5, 6],
			circleInnerSize: 2.2,
			type: '2D',
			overlay: true,
			zIndex: 1
		},
		{
			alphaMax: 12,
			angleRand: [150, 185],
			attachedEntity: false,
			duration: 250,
			durationRand: [200, 350],
			fadeOut: true,
			fade: true,
			file: 'effect/lens2.tga',
			sizeEndX: 1,
			sizeRandEndY: [250, 300],
			sizeRandStartX: [25, 40],
			sizeRandStartY: [10, 10],
			circlePattern: true,
			circleOuterSizeRand: [5, 6],
			circleInnerSize: 2.2,
			type: '2D',
			overlay: true,
			zIndex: 1
		},
		{
			alphaMax: 12,
			angleRand: [200, 235],
			attachedEntity: false,
			duration: 250,
			durationRand: [200, 350],
			fadeOut: true,
			fade: true,
			file: 'effect/lens1.tga',
			sizeEndX: 1,
			sizeRandEndY: [250, 300],
			sizeRandStartX: [25, 40],
			sizeRandStartY: [10, 10],
			circlePattern: true,
			circleOuterSizeRand: [5, 6],
			circleInnerSize: 2.2,
			type: '2D',
			overlay: true,
			zIndex: 1
		},
		{
			alphaMax: 12,
			angleRand: [255, 290],
			attachedEntity: false,
			duration: 250,
			durationRand: [200, 350],
			fadeOut: true,
			fade: true,
			file: 'effect/lens2.tga',
			sizeEndX: 1,
			sizeRandEndY: [250, 300],
			sizeRandStartX: [25, 40],
			sizeRandStartY: [10, 10],
			circlePattern: true,
			circleOuterSizeRand: [5, 6],
			circleInnerSize: 2.2,
			type: '2D',
			overlay: true,
			zIndex: 1
		},
		{
			alphaMax: 12,
			angleRand: [300, 335],
			attachedEntity: false,
			duration: 250,
			durationRand: [200, 350],
			fadeOut: true,
			fade: true,
			file: 'effect/lens1.tga',
			sizeEndX: 1,
			sizeRandEndY: [250, 300],
			sizeRandStartX: [25, 40],
			sizeRandStartY: [10, 10],
			circlePattern: true,
			circleOuterSizeRand: [5, 6],
			circleInnerSize: 2.2,
			type: '2D',
			overlay: true,
			zIndex: 1
		},
		{
			alphaMax: 12,
			angleRand: [340, 360],
			attachedEntity: false,
			duration: 250,
			durationRand: [200, 350],
			fadeOut: true,
			fade: true,
			file: 'effect/lens2.tga',
			sizeEndX: 1,
			sizeRandEndY: [250, 300],
			sizeRandStartX: [25, 40],
			sizeRandStartY: [10, 10],
			circlePattern: true,
			circleOuterSizeRand: [5, 6],
			circleInnerSize: 2.2,
			type: '2D',
			overlay: true,
			zIndex: 1
		}
	],

	2: [
		{
			//EF_HIT3	Melee Skill Hit
			type: 'CYLINDER',
			textureName: 'lens2',
			angleX: -90,
			posZ: 1,
			rotateWithCamera: true,
			bottomSize: 0.37,
			topSize: 1,
			height: 4,
			animation: 1,
			fade: true,
			duration: 150,
			alphaMax: 0.8,
			wav: 'effect/ef_hit3',
			attachedEntity: true
		},
		{
			type: 'CYLINDER',
			textureName: 'lens2',
			angleX: -90,
			posZ: 1,
			rotateWithCamera: true,
			bottomSize: 0.37,
			topSize: 0.37,
			height: 4,
			animation: 1,
			fade: true,
			duration: 150,
			alphaMax: 0.8,
			wav: 'effect/ef_hit3',
			attachedEntity: true
		}
	],

	3: [
		{
			//EF_HIT4	Melee Skill Hit
			type: 'CYLINDER',
			textureName: 'lens2',
			angleX: -90,
			posZ: 1,
			rotateWithCamera: true,
			bottomSize: 0.15,
			topSize: 1,
			height: 4,
			animation: 1,
			fade: true,
			duration: 150,
			alphaMax: 0.8,
			wav: 'effect/ef_hit4',
			attachedEntity: true
		}
	],

	4: [
		{
			//EF_HIT5	Melee Skill Hit
			alphaMax: 1,
			angle: 90,
			attachedEntity: false,
			duration: 400,
			fadeOut: true,
			file: 'effect/lens2.tga',
			posz: 1,
			rotate: true,
			sizeEndY: 200,
			sizeStartY: 10,
			sizeX: 15,
			toAngle: 0,
			type: '3D',
			wav: 'effect/ef_hit5'
		},
		{
			alphaMax: 1,
			angle: 180,
			attachedEntity: false,
			duration: 400,
			fadeOut: true,
			file: 'effect/lens2.tga',
			posz: 1,
			rotate: true,
			sizeEndY: 200,
			sizeStartY: 10,
			sizeX: 15,
			toAngle: 90,
			type: '3D',
			wav: 'effect/ef_hit5'
		}
	],

	5: [
		{
			//EF_HIT6	Melee Skill Hit
			alphaMax: 1,
			angle: 90,
			attachedEntity: false,
			duration: 400,
			fadeOut: true,
			file: 'effect/lens2.tga',
			posz: 1,
			rotate: true,
			sizeEndY: 150,
			sizeStartY: 10,
			sizeX: 10,
			toAngle: 0,
			type: '2D',
			overlay: true,
			wav: 'effect/ef_hit6'
		},
		{
			alphaMax: 1,
			angle: 180,
			attachedEntity: false,
			duration: 400,
			fadeOut: true,
			file: 'effect/lens2.tga',
			posz: 1,
			rotate: true,
			sizeEndY: 150,
			sizeStartY: 10,
			sizeX: 10,
			toAngle: 90,
			type: '2D',
			overlay: true,
			wav: 'effect/ef_hit6'
		}
	],

	6: [
		{
			//portal - entering the new map	//EF_ENTRY	Being Warped
			//type: 'FUNC',
			//file: 'effect/ring_blue',
			alphaMax: 0.62,
			animation: 1,
			attachedEntity: false,
			blendMode: 8,
			bottomSize: 0.9,
			duration: 500,
			fade: true,
			height: 7.5,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 0.9,
			type: 'CYLINDER',
			wav: 'effect/ef_portal'
		},
		{
			alphaMax: 0.62,
			animation: 1,
			attachedEntity: true,
			blendMode: 8,
			bottomSize: 0.85,
			duration: 500,
			fade: true,
			height: 8,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 0.85,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.8,
			animation: 1,
			attachedEntity: true,
			blendMode: 8,
			bottomSize: 0.9,
			duration: 500,
			fade: true,
			height: 1,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 1.5,
			type: 'CYLINDER'
		}
	],

	7: [
		{
			//EF_EXIT	Item Heal effect
			alphaMax: 0.2,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			bottomSize: 0.95,
			duration: 2000,
			fade: true,
			height: 10,
			textureName: 'alpha_down',
			topSize: 0.95,
			type: 'CYLINDER',
			wav: '_heal_effect'
		},
		{
			alphaMax: 0.8,
			attachedEntity: true,
			blendMode: 2,
			duration: 1000,
			delayOffset: 400,
			duplicate: 6,
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
			timeBetweenDupli: 80,
			type: '3D',
			zIndex: 1
		},
		{
			alphaMax: 0.8,
			attachedEntity: true,
			blendMode: 2,
			duration: 900,
			delayLate: 200,
			duplicate: 3,
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
			sparkling: true,
			sparkNumber: 2,
			timeBetweenDupli: 200,
			type: '3D',
			zIndex: 1
		}
	],

	8: [
		{
			//EF_WARP	Yellow Ripple Effect
			alphaMax: 0.8,
			animation: 4,
			attachedEntity: true,
			bottomSize: 10,
			duration: 1000,
			duplicate: 4,
			fade: true,
			height: 0,
			posZ: 0.1,
			textureName: 'ring_yellow',
			timeBetweenDupli: 300,
			topSize: 13,
			type: 'CYLINDER'
		}
	],

	9: [
		{
			//EF_ENHANCE	Different Type of Heal
			alphaMax: 0.2,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			bottomSize: 0.95,
			duration: 2000,
			fade: true,
			height: 10,
			textureName: 'alpha_down',
			topSize: 0.95,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.8,
			attachedEntity: true,
			duration: 1000,
			delayLate: 500,
			duplicate: 7,
			fadeOut: true,
			file: 'effect/ac_center2.tga',
			posxRand: 1.5,
			posyRand: 1,
			poszEndRand: 1,
			poszEndRandMiddle: 6,
			poszStartRand: 1,
			poszStartRandMiddle: 1,
			sizeRandY: 15,
			sizeRandYMiddle: 45,
			sizeX: 2.5,
			type: '3D',
			zIndex: 0
		},
		{
			alphaMax: 0.8,
			attachedEntity: true,
			duration: 1000,
			delayOffset: 400,
			duplicate: 3,
			fadeOut: true,
			file: 'effect/ac_center2.tga',
			posxRand: 1.5,
			posyRand: 1,
			poszEndRand: 1,
			poszEndRandMiddle: 6,
			poszStartRand: 1,
			poszStartRandMiddle: 1,
			sizeRandY: 15,
			sizeRandYMiddle: 45,
			sizeX: 2.5,
			type: '3D',
			zIndex: 0
		}
	],

	10: [
		{
			//EF_COIN	Mammonite
			type: 'STR',
			file: 'maemor',
			min: 'memor_min',
			wav: 'effect/ef_coin2',
			attachedEntity: true
		}
	],

	11: [
		// EF_ENDURE, Endure: the client's shrinking endure.tga and alpha_down streaks (EndureEffect.js)
		...endureEffect
	],

	12: [
		{
			//EF_BEGINSPELL	Yellow cast aura
			type: 'CYLINDER',
			alphaMax: 0.8,
			blendMode: 2,
			animation: 2,
			attachedEntity: true,
			bottomSize: 1,
			//duration: 1000,
			fade: true,
			height: 4,
			rotate: false,
			textureName: 'ring_yellow',
			topSize: 5,
			wav: 'effect/ef_beginspell'
		}
	],

	13: [
		{
			//EF_GLASSWALL	Blue Box
			type: 'STR',
			file: 'effect/safetywall',
			wav: 'effect/ef_glasswall',
			attachedEntity: false
		}
	],

	14: [
		{
			//EF_HEALSP	Blue restoring effect
			alphaMax: 0.2,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			bottomSize: 0.95,
			duration: 2000,
			fade: true,
			height: 10,
			rotate: true,
			red: 0.1,
			green: 0.5,
			blue: 1,
			textureName: 'ring_blue',
			topSize: 0.95,
			type: 'CYLINDER',
			wav: '_heal_effect'
		},
		{
			alphaMax: 0.8,
			attachedEntity: true,
			blendMode: 2,
			duration: 1000,
			delayOffset: 400,
			duplicate: 6,
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
			red: 0.1,
			green: 0.5,
			blue: 1,
			timeBetweenDupli: 80,
			type: '3D',
			zIndex: 1
		},
		{
			alphaMax: 0.8,
			attachedEntity: true,
			blendMode: 2,
			duration: 900,
			delayLate: 200,
			duplicate: 3,
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
			sparkling: true,
			sparkNumber: 2,
			red: 0.1,
			green: 0.5,
			blue: 1,
			timeBetweenDupli: 200,
			type: '3D',
			zIndex: 1
		}
	],

	15: soulStrikeEffect,

	16: [
		{
			//hide and monster body relocation sound	//EF_BASH	Hide
			type: 'CYLINDER',
			textureName: 'alpha_down',
			alphaMax: 0.6,
			duration: 1000,
			rotate: true,
			fade: true,
			angleX: -90,
			fixedPerspective: true,
			posZ: 1.5,
			height: 0,
			bottomSize: 0.1,
			topSize: 2,
			animation: 2,
			zIndex: 1,
			wav: 'effect/ef_bash',
			attachedEntity: true
		},
		{
			type: 'CYLINDER',
			textureName: 'alpha_center',
			alphaMax: 0.6,
			duration: 1000,
			duplicate: 10,
			timeBetweenDupli: 0,
			totalCircleSides: 30,
			circleSides: 1,
			rotate: true,
			fade: true,
			angleX: -90,
			angleZRandom: 360,
			fixedPerspective: true,
			posZ: 1.5,
			height: 0,
			bottomSize: 0.01,
			topSize: 2.5,
			animation: 2,
			zIndex: 1.1,
			attachedEntity: true
		},
		{
			type: 'CYLINDER',
			textureName: 'alpha_center',
			alphaMax: 0.6,
			duration: 1000,
			duplicate: 8,
			timeBetweenDupli: 0,
			totalCircleSides: 30,
			circleSides: 1,
			rotate: true,
			fade: true,
			angleX: -90,
			angleZRandom: 360,
			fixedPerspective: true,
			posZ: 1.5,
			height: 0,
			bottomSize: 0.01,
			topSize: 4,
			animation: 2,
			zIndex: 1.2,
			attachedEntity: true
		}
	],

	17: [
		{
			//EF_MAGNUMBREAK	Magnum Break
			// Official client parts: two flat yellow rings and a fire sphere, 30 ticks at 60 a second.
			type: 'PRIM',
			prim: 'ring',
			texture: 'ring_yellow',
			attachedEntity: false,
			duration: 500,
			frames: 30,
			radiusSpeed: 1.75,
			radiusAccel: -(1.75 / 30) * 0.5,
			width: 12,
			alpha: 0,
			alphaSpeed: 254 / 15,
			fadeOutFrame: 15,
			wav: 'effect/ef_magnumbreak'
		},
		{
			type: 'PRIM',
			prim: 'sphere',
			texture: '\xb4\xeb\xc6\xf8\xb9\xdf', //´ëÆø¹ß
			attachedEntity: false,
			duration: 500,
			frames: 30,
			radiusSpeed: 1.15,
			radiusAccel: -(1.15 / 30) * 0.5,
			spin: 3,
			alpha: 0,
			alphaSpeed: 254 / 15,
			fadeOutFrame: 15
		},
		{
			type: 'PRIM',
			prim: 'ring',
			texture: 'ring_yellow',
			attachedEntity: false,
			duration: 500,
			frames: 30,
			radiusSpeed: 1.75,
			radiusAccel: -(1.75 / 30) * 0.5,
			width: 12,
			alpha: 0,
			alphaSpeed: 254 / 15,
			fadeOutFrame: 15
		}
	],

	18: [
		{
			//EF_STEAL	Steal
			alphaMax: 1,
			attachedEntity: false,
			red: 1,
			green: 1,
			blue: 0.85,
			duration: 500,
			duplicate: 7,
			timeBetweenDupli: 0,
			fadeOut: true,
			file: 'effect/pok1.tga',
			posxEndRand: 3.5,
			posyEndRand: 3.5,
			poszEndRand: 1,
			poszEndRandMiddle: 3,
			sizeEnd: 10,
			sizeStart: 200,
			type: '3D',
			zIndex: 10
		},
		{
			wav: 'effect/ef_steal'
		}
	],

	// 19: [{}],	//EF_HIDING	Invalid Effect ID Popup in client

	20: [
		{
			//EF_PATTACK	Envenom/Poison
			alphaMax: 1,
			attachedEntity: true,
			blue: 1,
			duration: 1000,
			duplicate: 10,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/pok1.tga',
			green: 0.7,
			posxRand: 1,
			posyRand: 1,
			poszEnd: 5,
			poszStart: 0,
			red: 1,
			size: 100,
			sizeRand: 20,
			type: '3D',
			zIndex: 1
		},
		{
			attachedEntity: true,
			wav: 'effect/ef_detoxication' //wav: 'effect/assasin_enchantpoison',
		}
	],

	21: [
		{
			//EF_DETOXICATION	Detoxify
			alphaMax: 1,
			attachedEntity: true,
			blue: 1,
			duration: 1000,
			duplicate: 10,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/pok1.tga',
			green: 1,
			posxRand: 1,
			posyRand: 1,
			poszEnd: 5,
			poszStart: 0,
			red: 0.7,
			size: 100,
			sizeRand: 20,
			type: '3D',
			zIndex: 1
		},
		{
			attachedEntity: true,
			wav: 'effect/ef_detoxication' //wav: 'effect/assasin_enchantpoison',
		}
	],

	22: [
		{
			//EF_SIGHT	Sight
			type: '3D',
			shadowTexture: true,
			alphaMax: 0.5,
			attachedEntity: true,
			blendMode: 8,
			duration: 12200,
			duplicate: 10,
			timeBetweenDupli: 0,
			nbOfRotation: 10,
			posx: -2,
			posz: 4,
			playSprite: true,
			rotateLate: 0.9,
			rotateLateDelta: -0.1,
			rotatePosX: 3,
			rotatePosY: 3,
			rotationClockwise: true,
			size: 30,
			sizeDelta: 10
		},
		{
			type: '3D',
			spriteName: 'sight',
			alphaMax: 123 / 255,
			alphaMaxDelta: 3 / 255,
			attachedEntity: true,
			blendMode: 8,
			duration: 12200,
			duplicate: 10,
			timeBetweenDupli: 0,
			nbOfRotation: 10,
			posx: -2,
			posz: 4,
			playSprite: true,
			rotateLate: 0.9,
			rotateLateDelta: -0.1,
			rotatePosX: 3,
			rotatePosY: 3,
			rotationClockwise: true,
			size: 60,
			sizeDelta: 20
		},
		{
			wav: 'effect/ef_sight'
		}
	],

	23: [
		{
			//EF_STONECURSE	Stone Curse
			type: 'STR',
			file: 'stonecurse',
			attachedEntity: true
		}
	],

	24: [
		{
			//EF_FIREBALL	Fire Ball, played on the caster: the official client throws four fireball sprites at the
			//target on ticks 20, 24, 28 and 32, each flying 20 ticks from 15 units up, each with its own sound.
			//The first is plain, the next three tinted (246, 199, 76) and fainter (alpha 180, 130, 80).
			type: '3D',
			spriteName: 'fireball',
			playSprite: true,
			attachedEntity: false,
			fromSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			zOffset: 3,
			delayStart: 333,
			duration: 333,
			alphaMax: 1,
			size: 130,
			zIndex: 1
		},
		{
			type: '3D',
			spriteName: 'fireball',
			playSprite: true,
			attachedEntity: false,
			fromSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			zOffset: 3,
			delayStart: 400,
			duration: 333,
			alphaMax: 180 / 255,
			red: 246 / 255,
			green: 199 / 255,
			blue: 76 / 255,
			size: 130,
			zIndex: 1
		},
		{
			type: '3D',
			spriteName: 'fireball',
			playSprite: true,
			attachedEntity: false,
			fromSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			zOffset: 3,
			delayStart: 467,
			duration: 333,
			alphaMax: 130 / 255,
			red: 246 / 255,
			green: 199 / 255,
			blue: 76 / 255,
			size: 130,
			zIndex: 1
		},
		{
			type: '3D',
			spriteName: 'fireball',
			playSprite: true,
			attachedEntity: false,
			fromSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			zOffset: 3,
			delayStart: 533,
			duration: 333,
			alphaMax: 80 / 255,
			red: 246 / 255,
			green: 199 / 255,
			blue: 76 / 255,
			size: 130,
			zIndex: 1
		},
		{
			wav: 'effect/ef_fireball',
			delayWav: 333
		},
		{
			wav: 'effect/ef_fireball',
			delayWav: 400
		},
		{
			wav: 'effect/ef_fireball',
			delayWav: 467
		},
		{
			wav: 'effect/ef_fireball',
			delayWav: 533
		}
	],

	25: [
		{
			//EF_FIREWALL	Fire Wall
			type: 'STR',
			file: 'firewall%d',
			rand: [1, 2],
			attachedEntity: false
		},
		{
			wav: 'effect/ef_firewall'
		}
	],

	26: [
		{
			//EF_ICEARROW	Cold Bolt, on the target: one ice bolt per hit, 10 ticks apart from tick 12,
			//each opening a ring_blue ring as it lands (BoltRainSim.js)
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				this.add(
					new BoltRain(Params.Init.ownerEntity.position, Params.Inst.startTick, Params.Init.hitCount, 'cold'),
					Params
				);
			}
		},
		{
			// One sound per cast, on tick 12
			wav: 'effect/ef_icearrow%d',
			rand: [1, 3],
			delayWav: 200,
			attachedEntity: true
		}
	],

	27: [
		{
			//EF_FROSTDIVER	Frost Diver, on the caster: one thin ice spike a tick along the line to the
			//target, pushing out of the ground (IceSpikesSim.js)
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const caster = Params.Init.ownerEntity;
				const target = Params.Init.otherEntity;
				if (!target) {
					return;
				}
				const at = [caster.position[0], caster.position[1], caster.position[2]];
				const spikes = planIcePath((target.position[0] - at[0]) * 5, (target.position[1] - at[1]) * 5);
				this.add(new IceSpikes(at, Params.Inst.startTick, spikes, ICE_PATH.life), Params);
			}
		}
	],

	28: [
		{
			//EF_FROSTDIVER2	Frost Diver hit, on the target: 8 wide ice spikes bursting from the feet
			//(IceSpikesSim.js)
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				this.add(
					new IceSpikes(
						Params.Init.ownerEntity.position,
						Params.Inst.startTick,
						planIceShards(),
						ICE_SHARDS.life
					),
					Params
				);
			}
		},
		{
			wav: 'effect/ef_frostdiver2',
			attachedEntity: true
		}
	],

	29: [
		{
			//EF_LIGHTBOLT	Lightning Bolt (the official client plays Lightning.str only; the wind hit is 52)
			attachedEntity: true,
			duplicate: 1,
			file: 'lightning',
			type: 'STR'
		}
	],

	30: [
		{
			//EF_THUNDERSTORM	Thunder Storm
			type: 'STR',
			file: 'thunderstorm',
			wav: 'effect/magician_thunderstorm',
			attachedEntity: false
		}
	],

	31: [
		{
			//EF_FIREARROW	Fire Bolt, on the target: one fire bolt per hit, 10 ticks apart from tick 12,
			//each opening a ring_yellow ring as it lands, and a spark every 4 ticks from the newest
			//bolt (BoltRainSim.js)
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const target = Params.Init.ownerEntity;
				const spark = (s, startTick) => {
					// A particle4 sprite flying from the bolt back up its line, shrinking away
					const at = [target.position[0], target.position[1], target.position[2]];
					this.spamEffect({
						effect: {
							type: '3D',
							spriteName: 'particle4',
							playSprite: true,
							attachedEntity: false,
							duration: (s.life * 1000) / 60,
							posxStart: s.start.x / 5,
							posyStart: s.start.y / 5,
							poszStart: s.start.up / 5,
							posxEnd: s.end.x / 5,
							posyEnd: s.end.y / 5,
							poszEnd: s.end.up / 5,
							sizeStart: s.scale * 100,
							sizeEnd: 1,
							alphaMax: 1,
							fadeOut: true,
							zIndex: 1
						},
						Inst: { effectID: 31, duplicateID: 0, startTick },
						Init: Object.assign({}, Params.Init, { position: at })
					});
				};
				this.add(
					new BoltRain(
						target.position,
						Params.Inst.startTick,
						Params.Init.hitCount,
						'fire',
						Math.random,
						spark
					),
					Params
				);
			}
		},
		{
			// One sound per cast, on tick 12
			wav: 'effect/ef_firearrow%d',
			rand: [1, 3],
			delayWav: 200,
			attachedEntity: true
		}
	],

	32: [
		{
			//EF_NAPALMBEAT	Small clustered explosions
			//type: 'FUNC',
			//file: 'effect/Ao1ß1', // Uses up to Ao1ß8 , so eight files for an animated explosion
			wav: 'effect/ef_napalmbeat',
			attachedEntity: true
		}
	],

	33: [
		{
			//EF_RUWACH	//ruwach
			type: '3D',
			shadowTexture: true,
			alphaMax: 0.5,
			attachedEntity: true,
			blendMode: 8,
			duration: 12200,
			duplicate: 8,
			timeBetweenDupli: 0,
			nbOfRotation: 8,
			posx: -2,
			rotateLate: 0.7,
			rotateLateDelta: -0.1,
			rotatePosX: 3,
			rotatePosY: 3,
			rotationClockwise: true,
			size: 0.4,
			sizeDelta: 0.15
		},
		{
			type: '3D',
			spriteName: 'particle2',
			alphaMax: 0.07,
			alphaMaxDelta: 0.07,
			attachedEntity: true,
			blendMode: 2,
			red: 0,
			green: 1,
			blue: 1,
			duration: 12200,
			duplicate: 10,
			timeBetweenDupli: 0,
			nbOfRotation: 8,
			posx: -2,
			posz: 2,
			rotateLate: 0.7,
			rotateLateDelta: -0.1,
			rotatePosX: 3,
			rotatePosY: 3,
			rotationClockwise: true,
			size: 80,
			sizeDelta: 30
		},
		{
			wav: 'effect/ef_ruwach'
		}
	],

	34: [
		{
			//EF_TELEPORTATION	Old Map Exit Animation (unused)
			type: 'CYLINDER',
			alphaMax: 0.5,
			animation: 5,
			attachedEntity: true,
			blendMode: 8,
			bottomSize: 0.8,
			duration: 1000,
			fade: true,
			red: 1,
			green: 1,
			blue: 1,
			height: 35,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 0.7,
			wav: 'effect/ef_teleportation'
		}
	],

	35: [
		{
			//warp portal casting before unit appear	//EF_READYPORTAL	Old Warp Portal (unused)
			alphaMax: 0.6,
			animation: 0,
			attachedEntity: true,
			blue: 1,
			bottomSize: 0.6,
			duration: 25000,
			fade: true,
			green: 0.7,
			height: 15,
			red: 0.7,
			rotate: true,
			textureName: 'alpha_down',
			topSize: 0.6,
			type: 'CYLINDER',
			wav: 'effect/ef_readyportal'
		}
	],

	//36: [{}],	//EF_PORTAL	//warp portal unit

	37: [
		{
			//EF_INCAGILITY	AGI Up
			alphaMax: 1,
			attachedEntity: true,
			duration: 1000,
			delayLate: 500,
			duplicate: 7,
			fadeOut: true,
			file: 'effect/ac_center2.tga',
			posxRand: 1.5,
			posyRand: 1,
			poszEndRand: 1,
			poszEndRandMiddle: 6,
			poszStartRand: 1,
			poszStartRandMiddle: 1,
			sizeRandY: 15,
			sizeRandYMiddle: 45,
			sizeX: 2.5,
			type: '3D',
			zIndex: 0
		},
		{
			alphaMax: 0.75,
			attachedEntity: true,
			duration: 1000,
			delayOffset: 400,
			duplicate: 3,
			fadeOut: true,
			file: 'effect/ac_center2.tga',
			posxRand: 1.5,
			posyRand: 1,
			poszEndRand: 1,
			poszEndRandMiddle: 6,
			poszStartRand: 1,
			poszStartRandMiddle: 1,
			sizeRandY: 15,
			sizeRandYMiddle: 45,
			sizeX: 2.5,
			type: '3D',
			zIndex: 0
		},
		{
			alphaMax: 1,
			attachedEntity: true,
			duration: 1000,
			duplicate: 10,
			fadeOut: true,
			file: 'effect/ac_center2.tga',
			posxRand: 1.5,
			posyRand: 1,
			poszEndRand: 1,
			poszEndRandMiddle: 6,
			poszStartRand: 1,
			poszStartRandMiddle: 1,
			sizeRandY: 15,
			sizeRandYMiddle: 45,
			sizeX: 2.5,
			type: '3D',
			zIndex: 0
		},
		{
			alphaMax: 1,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/agi_up.bmp',
			poszEnd: 3,
			poszStart: 0.4,
			sizeEnd: 100,
			sizeSmooth: true,
			sizeStart: 100,
			sizeY: 45,
			type: '3D',
			wav: 'effect/ef_incagility',
			overlay: true,
			zIndex: 10
		}
	],

	38: [
		{
			//EF_DECAGILITY	AGI Down
			alphaMax: 1,
			attachedEntity: true,
			duration: 1000,
			duplicate: 20,
			fadeOut: true,
			file: 'effect/ac_center2.tga',
			posxRand: 1.5,
			posyRand: 1,
			poszEndRand: 1,
			poszEndRandMiddle: 1,
			poszStartRand: 1,
			poszStartRandMiddle: 6,
			sizeRandY: 15,
			sizeRandYMiddle: 45,
			sizeX: 2.5,
			type: '3D',
			zIndex: 0
		},
		{
			alphaMax: 1,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/slow.bmp',
			poszEnd: 0.4,
			poszStart: 2.8,
			sizeEnd: 100,
			sizeSmooth: true,
			sizeStart: 100,
			sizeY: 45,
			type: '3D',
			wav: 'effect/ef_decagility',
			zIndex: 10
		}
	],

	39: [
		{
			//EF_AQUA	Aqua Benedicta
			type: 'SPR',
			file: '\xbc\xba\xbc\xf6\xb6\xdf\xb1\xe2',
			wav: 'effect/ef_aqua',
			head: true,
			attachedEntity: true
		}
	],

	40: [
		{
			//EF_SIGNUM	Signum Crucis
			type: 'STR',
			file: 'cross',
			wav: 'effect/ef_signum',
			attachedEntity: true
		}
	],

	41: [
		{
			//EF_ANGELUS	Angelus
			type: 'STR',
			file: 'angelus',
			wav: 'effect/ef_angelus',
			min: 'jong_mini',
			head: true,
			attachedEntity: true
		}
	],

	42: [
		{
			//EF_BLESSING	Blessing
			type: 'SPR',
			attachedEntity: true,
			delayFrame: 30,
			file: '\xc3\xe0\xba\xb9',
			frame: 0,
			repeat: true,
			duration: 1500,
			stackable: true,
			head: true,
			yOffset: -120
		},
		{
			alphaMax: 1,
			attachedEntity: true,
			duration: 1200,
			delayOffset: 300,
			duplicate: 6,
			fadeIn: true,
			fadeOut: true,
			posxRand: 1.2,
			posyRand: 1,
			poszEndRand: 0.5,
			poszEndRandMiddle: 1,
			poszStartRand: 2,
			poszStartRandMiddle: 5.5,
			size: 50,
			sparkling: true,
			sparkNumber: 2,
			spriteName: 'particle6',
			timeBetweenDupli: 0,
			type: '3D',
			zIndex: 1
		},
		{
			alphaMax: 1,
			attachedEntity: true,
			duration: 1200,
			delayOffset: 400,
			duplicate: 6,
			fadeIn: true,
			fadeOut: true,
			posxRand: 1.4,
			posyRand: 1.1,
			poszEndRand: 0.5,
			poszEndRandMiddle: 1,
			poszStartRand: 2,
			poszStartRandMiddle: 5.5,
			size: 50,
			spriteName: 'particle6',
			timeBetweenDupli: 0,
			type: '3D',
			zIndex: 1
		},
		{
			alphaMax: 0.3,
			attachedEntity: false,
			blendMode: 2,
			blue: 1,
			duration: 2500,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/pok2.tga',
			green: 0.75,
			posx: 0,
			posy: 0,
			posz: 0,
			red: 0.1,
			size: 140,
			type: '3D',
			wav: 'effect/ef_blessing',
			zIndex: 10
		}
	],

	43: [
		{
			//EF_INCAGIDEX	Dex + Agi Up
			alphaMax: 1,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/dex_agi_up.bmp',
			poszEnd: 3,
			poszStart: 0.4,
			sizeEnd: 100,
			sizeSmooth: true,
			sizeStart: 100,
			sizeY: 45,
			type: '3D',
			wav: 'effect/ef_incagidex',
			zIndex: 10
		}
	],

	44: [
		{
			//EF_SMOKE	Little fog Smoke (prontera chimneys)
			/*type: 'SPR',
			file: '\xb1\xbc\xb6\xd2\xbf\xac\xb1\xe2',
			attachedEntity: false*/

			type: '3D',
			spriteName: '\xb1\xbc\xb6\xd2\xbf\xac\xb1\xe2',

			duplicate: 10,
			timeBetweenDupli: 1000,

			duration: 10000,
			alphaMax: 0.8,
			fadeOut: true,
			fadeIn: false,

			poszStart: 0,
			poszEnd: 20,
			poszSmooth: false,

			posxStartRand: 0,
			posxEndRand: 3,
			posxSmooth: true,

			sizeStart: 70,
			sizeEnd: 300,
			sizeSmooth: true,

			angle: -90,
			toAngle: 0,
			rotate: true,
			rotateWithCamera: true,
			repeat: true,
			delayFrame: 100,

			param0_Func: function (e, v) {
				e.posxEnd = 0.5 + v * 0.01;
				e.size = e.size * (1 + Math.sin(v * 0.5) * 0.5);
			},

			param1_Func: function (e, v) {
				if (v < 5) {
					e.alpha = 1.0;
				}
				e.alpha = e.alpha * (0.9 + Math.random() * 0.1);
			}
		}
	],

	45: [
		{
			// This one is almost invisible, but there are some small white thingies flying around	//EF_FIREFLY	Faint Little Ball Things.
			type: 'FUNC',
			//file: 'sprite/AIANA®/particle1',
			attachedEntity: true
		}
	],

	47: [
		{
			//EF_TORCH	Torch
			type: '3D', // C++: PP_3DPARTICLE
			absoluteSpriteName: 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/torch_01', // PT_USEORGARGB
			attachedEntity: true, // C++: m_pos = m_master->m_pos
			playSprite: true,
			duration: 600, // 6 frames 100delay each
			posz: 0.8, // C++: m_deltaPos2.y = -10
			posx: 0.1, // finetune
			size: 100, // C++: m_size (m_param[0]) 1.0f
			angle: 270,
			rotateToTarget: true,
			repeat: true
		}
	],

	49: [
		{
			//EF_FIREHIT	Firebolt/Wall Hits
			type: 'STR',
			file: 'firehit%d',
			wav: 'effect/ef_firehit',
			rand: [1, 3],
			attachedEntity: true
		}
	],

	50: [
		{
			//EF_FIRESPLASHHIT	Spinning Fire Thing
			type: '2D',
			overlay: true,
			duration: 500,
			file: 'effect/firering.tga',
			sizeStart: 10,
			sizeEnd: 300,
			angle: 0,
			toAngle: -360,
			rotate: true,
			fadeOut: true,
			posz: 1,
			attachedEntity: true
		}
	],

	51: [
		{
			// water hit	//EF_COLDHIT	Ice Elemental Hit
			wav: '_hit_fist%d',
			rand: [3, 4],
			attachedEntity: true
		} /*, {
			type: '2D',
			alphaMax: 1,
			angle: 0,
			angleDelta: 40,
			attachedEntity: false,
			duration: 140,
			duplicates: 9,
			fadeOut: true,
			file: 'effect/ice.tga',
			offsetxEnd: 3,
			offsetxStart: 0.5,
			size: 100,
			timeBetweenDupli: 0
		}*/
	],

	52: [
		{
			//EF_WINDHIT	Wind Elemental Hit
			type: 'STR',
			file: 'windhit%d',
			wav: '_hit_fist%d',
			rand: [1, 3],
			attachedEntity: true
		}
	],

	53: [
		{
			//EF_POISONHIT	Puff of Purpulish Smoke?
			type: 'SPR',
			file: 'poisonhit',
			wav: 'effect/ef_poisonattack',
			attachedEntity: false
		}
	],

	54: [
		{
			//EF_BEGINSPELL2	Cast Initiation Aura (Water Element)
			alphaMax: 0.2,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 1,
			//duration: 900,
			fade: true,
			green: 0.5,
			height: 30,
			red: 0.5,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 1,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.2,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 1,
			//duration: 900,
			fade: true,
			green: 0.5,
			height: 1,
			red: 0.5,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 1.3,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.6,
			animation: 2,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 1,
			//duration: 900,
			fade: true,
			green: 0.5,
			height: 3,
			red: 0.5,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 4,
			type: 'CYLINDER',
			wav: 'effect/ef_beginspell'
		}
	],

	55: [
		{
			//EF_BEGINSPELL3	Cast Initiation Aura (Fire Element)
			alphaMax: 0.3,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.4,
			bottomSize: 1,
			//duration: 900,
			fade: true,
			green: 0.4,
			height: 30,
			red: 1,
			rotate: true,
			textureName: 'ring_red',
			topSize: 1,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.7,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.4,
			bottomSize: 1,
			//duration: 900,
			fade: true,
			green: 0.4,
			height: 2,
			red: 1,
			rotate: true,
			textureName: 'ring_red',
			topSize: 1.3,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.7,
			animation: 2,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.4,
			bottomSize: 1,
			//duration: 900,
			fade: true,
			green: 0.4,
			height: 3,
			red: 1,
			rotate: true,
			textureName: 'ring_red',
			topSize: 4,
			type: 'CYLINDER',
			wav: 'effect/ef_beginspell'
		}
	],

	56: [
		{
			//EF_BEGINSPELL4	Cast Initiation Aura (Wind Element)
			alphaMax: 0.3,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.6,
			bottomSize: 1,
			//duration: 900,
			fade: true,
			green: 1,
			height: 30,
			red: 0.6,
			rotate: true,
			textureName: 'ring_white',
			topSize: 1,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.6,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.6,
			bottomSize: 1,
			//duration: 900,
			fade: true,
			green: 1,
			height: 2,
			red: 0.6,
			rotate: true,
			textureName: 'ring_white',
			topSize: 1.3,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.6,
			animation: 2,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.6,
			bottomSize: 1,
			//duration: 900,
			fade: true,
			green: 1,
			height: 3,
			red: 0.6,
			rotate: true,
			textureName: 'ring_white',
			topSize: 4,
			type: 'CYLINDER',
			wav: 'effect/ef_beginspell'
		}
	],

	57: [
		{
			//EF_BEGINSPELL5	Cast Initiation Aura (Earth Element)
			alphaMax: 0.5,
			animation: 1,
			attachedEntity: true,
			blendMode: 0,
			blue: 1,
			bottomSize: 1,
			//duration: 900,
			fade: true,
			green: 1,
			height: 30,
			red: 1,
			rotate: true,
			textureName: 'ring_yellow',
			topSize: 1,
			type: 'CYLINDER'
		},
		{
			alphaMax: 1,
			animation: 1,
			attachedEntity: true,
			blendMode: 0,
			blue: 1,
			bottomSize: 1.1,
			//duration: 900,
			fade: true,
			green: 1,
			height: 3,
			red: 1,
			rotate: true,
			textureName: 'ring_yellow',
			topSize: 1.2,
			type: 'CYLINDER'
		},
		{
			alphaMax: 1,
			animation: 2,
			attachedEntity: true,
			blendMode: 0,
			blue: 1,
			bottomSize: 1,
			//duration: 900,
			fade: true,
			green: 1,
			height: 3,
			red: 1,
			rotate: true,
			textureName: 'ring_yellow',
			topSize: 4,
			type: 'CYLINDER',
			wav: 'effect/ef_beginspell'
		}
	],

	58: [
		{
			//EF_BEGINSPELL6	Cast Initiation Aura (Holy Element)
			alphaMax: 0.8,
			animation: 2,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 1,
			//duration: 900,
			fade: true,
			green: 1,
			height: 4,
			red: 1,
			rotate: true,
			textureName: 'ring_white',
			topSize: 5,
			type: 'CYLINDER',
			wav: 'effect/ef_beginspell'
		}
	],

	59: [
		{
			//EF_BEGINSPELL7	Cast Initiation Aura (Poison Element)
			alphaMax: 0.3,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.8,
			bottomSize: 1,
			//duration: 900,
			fade: true,
			green: 0.8,
			height: 30,
			red: 0.8,
			rotate: true,
			textureName: 'ring_purple',
			topSize: 1,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.7,
			animation: 1,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.8,
			bottomSize: 1,
			//duration: 900,
			fade: true,
			green: 0.8,
			height: 3,
			red: 0.8,
			rotate: true,
			textureName: 'ring_purple',
			topSize: 1.3,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.7,
			animation: 2,
			attachedEntity: true,
			blendMode: 2,
			blue: 0.8,
			bottomSize: 1,
			//duration: 900,
			fade: true,
			green: 0.8,
			height: 3,
			red: 0.8,
			rotate: true,
			textureName: 'ring_purple',
			topSize: 4,
			type: 'CYLINDER',
			wav: 'effect/ef_beginspell'
		}
	],

	60: [
		{
			//EF_LOCKON	Cast target circle
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				this.add(new LockOnTarget(Params.Init.ownerEntity, Params.Inst.startTick, Params.Inst.endTick), Params);
			}
		}
	],

	61: [
		{
			//EF_WARPZONE	Old Warp Portal (NPC Warp, unused)
			alphaMax: 0.3,
			animation: 3,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 2,
			duration: 2800,
			fade: true,
			green: 0.5,
			height: 1.1,
			red: 0.5,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 3.3,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.3,
			animation: 3,
			attachedEntity: true,
			blendMode: 2,
			blue: 1,
			bottomSize: 1.9,
			duration: 2800,
			fade: true,
			green: 0.5,
			height: 1.1,
			red: 0.5,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 3.2,
			type: 'CYLINDER'
		},
		{
			alphaMax: 1,
			attachedEntity: true,
			blue: 1,
			duration: 1000,
			duplicate: 3,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/pok1.tga',
			green: 1,
			posxStartRand: 3,
			posxStartRandMiddle: 0,
			posyStartRand: 3,
			posyStartRandMiddle: 0,
			poszEndRand: 2,
			poszEndRandMiddle: 2,
			poszStart: 0,
			red: 1,
			size: 100,
			sizeRand: 17,
			type: '3D',
			zIndex: 1
		}
	]
};
