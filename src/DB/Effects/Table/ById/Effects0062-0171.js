/**
 * @module DB/Effects/Table/ById/Effects0062-0171
 *
 * Effects 62 to 171 of the effect table, in ID order (see EffectConst.js).
 * DB/Effects/EffectTable.js joins the parts; its header lists the parameters a row takes.
 */

import RainWeatherEffect from 'Renderer/Effects/RainWeather.js';
import SnowWeatherEffect from 'Renderer/Effects/SnowWeather.js';
import SakuraWeatherEffect from 'Renderer/Effects/SakuraWeatherEffect.js';
import Camera from 'Renderer/Camera.js';
import QuadHorn from 'Renderer/Effects/QuadHorn.js';
import Altitude from 'Renderer/Map/Altitude.js';
import Renderer from 'Renderer/Renderer.js';

export default {
	62: [
		//EF_SIGHTRASHER	Sight Trasher
		// Direction 1: North
		{
			type: '3D',
			shadowTexture: true,
			alphaMax: 0.5,
			duplicate: 4,
			timeBetweenDupli: 100,
			sizeDelta: -60,
			duration: 800,
			attachedEntity: false,
			posxStart: 0,
			posyStart: 0,
			posxEnd: 0,
			posyEnd: -8,
			poszStart: 2,
			poszEnd: 2,
			sizeStart: 60,
			sizeEnd: 160,
			playSprite: true,
			fadeIn: true,
			fadeOut: true,
			blendMode: 8
		},
		{
			type: '3D',
			spriteName: 'sight',
			alphaMax: 123 / 255,
			alphaMaxDelta: 3 / 255,
			duplicate: 4,
			timeBetweenDupli: 100,
			sizeDelta: -60,
			duration: 800,
			attachedEntity: false,
			posxStart: 0,
			posyStart: 0,
			posxEnd: 0,
			posyEnd: -8,
			poszStart: 2,
			poszEnd: 2,
			sizeStart: 20,
			sizeEnd: 260,
			playSprite: true,
			fadeIn: true,
			fadeOut: true,
			blendMode: 8
		},
		// Direction 2: Northeast
		{
			type: '3D',
			shadowTexture: true,
			alphaMax: 0.5,
			duplicate: 4,
			timeBetweenDupli: 100,
			sizeDelta: -60,
			duration: 800,
			attachedEntity: false,
			posxStart: 0,
			posyStart: 0,
			posxEnd: 5.66,
			posyEnd: -5.66,
			poszStart: 2,
			poszEnd: 2,
			sizeStart: 60,
			sizeEnd: 160,
			playSprite: true,
			fadeIn: true,
			fadeOut: true,
			blendMode: 8
		},
		{
			type: '3D',
			spriteName: 'sight',
			alphaMax: 123 / 255,
			alphaMaxDelta: 3 / 255,
			duplicate: 4,
			timeBetweenDupli: 100,
			sizeDelta: -60,
			duration: 800,
			attachedEntity: false,
			posxStart: 0,
			posyStart: 0,
			posxEnd: 5.66,
			posyEnd: -5.66,
			poszStart: 2,
			poszEnd: 2,
			sizeStart: 20,
			sizeEnd: 260,
			playSprite: true,
			fadeIn: true,
			fadeOut: true,
			blendMode: 8
		},
		// Direction 3: East
		{
			type: '3D',
			shadowTexture: true,
			alphaMax: 0.5,
			duplicate: 4,
			timeBetweenDupli: 100,
			sizeDelta: -60,
			duration: 800,
			attachedEntity: false,
			posxStart: 0,
			posyStart: 0,
			posxEnd: 8,
			posyEnd: 0,
			poszStart: 2,
			poszEnd: 2,
			sizeStart: 60,
			sizeEnd: 160,
			playSprite: true,
			fadeIn: true,
			fadeOut: true,
			blendMode: 8
		},
		{
			type: '3D',
			spriteName: 'sight',
			alphaMax: 123 / 255,
			alphaMaxDelta: 3 / 255,
			duplicate: 4,
			timeBetweenDupli: 100,
			sizeDelta: -60,
			duration: 800,
			attachedEntity: false,
			posxStart: 0,
			posyStart: 0,
			posxEnd: 8,
			posyEnd: 0,
			poszStart: 2,
			poszEnd: 2,
			sizeStart: 20,
			sizeEnd: 260,
			playSprite: true,
			fadeIn: true,
			fadeOut: true,
			blendMode: 8
		},
		// Direction 4: Southeast
		{
			type: '3D',
			shadowTexture: true,
			alphaMax: 0.5,
			duplicate: 4,
			timeBetweenDupli: 100,
			sizeDelta: -60,
			duration: 800,
			attachedEntity: false,
			posxStart: 0,
			posyStart: 0,
			posxEnd: 5.66,
			posyEnd: 5.66,
			poszStart: 2,
			poszEnd: 2,
			sizeStart: 60,
			sizeEnd: 160,
			playSprite: true,
			fadeIn: true,
			fadeOut: true,
			blendMode: 8
		},
		{
			type: '3D',
			spriteName: 'sight',
			alphaMax: 123 / 255,
			alphaMaxDelta: 3 / 255,
			duplicate: 4,
			timeBetweenDupli: 100,
			sizeDelta: -60,
			duration: 800,
			attachedEntity: false,
			posxStart: 0,
			posyStart: 0,
			posxEnd: 5.66,
			posyEnd: 5.66,
			poszStart: 2,
			poszEnd: 2,
			sizeStart: 20,
			sizeEnd: 260,
			playSprite: true,
			fadeIn: true,
			fadeOut: true,
			blendMode: 8
		},
		// Direction 5: South
		{
			type: '3D',
			shadowTexture: true,
			alphaMax: 0.5,
			duplicate: 4,
			timeBetweenDupli: 100,
			sizeDelta: -60,
			duration: 800,
			attachedEntity: false,
			posxStart: 0,
			posyStart: 0,
			posxEnd: 0,
			posyEnd: 8,
			poszStart: 2,
			poszEnd: 2,
			sizeStart: 60,
			sizeEnd: 160,
			playSprite: true,
			fadeIn: true,
			fadeOut: true,
			blendMode: 8
		},
		{
			type: '3D',
			spriteName: 'sight',
			alphaMax: 123 / 255,
			alphaMaxDelta: 3 / 255,
			duplicate: 4,
			timeBetweenDupli: 100,
			sizeDelta: -60,
			duration: 800,
			attachedEntity: false,
			posxStart: 0,
			posyStart: 0,
			posxEnd: 0,
			posyEnd: 8,
			poszStart: 2,
			poszEnd: 2,
			sizeStart: 20,
			sizeEnd: 260,
			playSprite: true,
			fadeIn: true,
			fadeOut: true,
			blendMode: 8
		},
		// Direction 6: Southwest
		{
			type: '3D',
			shadowTexture: true,
			alphaMax: 0.5,
			duplicate: 4,
			timeBetweenDupli: 100,
			sizeDelta: -60,
			duration: 800,
			attachedEntity: false,
			posxStart: 0,
			posyStart: 0,
			posxEnd: -5.66,
			posyEnd: 5.66,
			poszStart: 2,
			poszEnd: 2,
			sizeStart: 60,
			sizeEnd: 160,
			playSprite: true,
			fadeIn: true,
			fadeOut: true,
			blendMode: 8
		},
		{
			type: '3D',
			spriteName: 'sight',
			alphaMax: 123 / 255,
			alphaMaxDelta: 3 / 255,
			duplicate: 4,
			timeBetweenDupli: 100,
			sizeDelta: -60,
			duration: 800,
			attachedEntity: false,
			posxStart: 0,
			posyStart: 0,
			posxEnd: -5.66,
			posyEnd: 5.66,
			poszStart: 2,
			poszEnd: 2,
			sizeStart: 20,
			sizeEnd: 260,
			playSprite: true,
			fadeIn: true,
			fadeOut: true,
			blendMode: 8
		},
		// Direction 7: West
		{
			type: '3D',
			shadowTexture: true,
			alphaMax: 0.5,
			duplicate: 4,
			timeBetweenDupli: 100,
			sizeDelta: -60,
			duration: 800,
			attachedEntity: false,
			posxStart: 0,
			posyStart: 0,
			posxEnd: -8,
			posyEnd: 0,
			poszStart: 2,
			poszEnd: 2,
			sizeStart: 60,
			sizeEnd: 160,
			playSprite: true,
			fadeIn: true,
			fadeOut: true,
			blendMode: 8
		},
		{
			type: '3D',
			spriteName: 'sight',
			alphaMax: 123 / 255,
			alphaMaxDelta: 3 / 255,
			duplicate: 4,
			timeBetweenDupli: 100,
			sizeDelta: -60,
			duration: 800,
			attachedEntity: false,
			posxStart: 0,
			posyStart: 0,
			posxEnd: -8,
			posyEnd: 0,
			poszStart: 2,
			poszEnd: 2,
			sizeStart: 20,
			sizeEnd: 260,
			playSprite: true,
			fadeIn: true,
			fadeOut: true,
			blendMode: 8
		},
		// Direction 8: Northwest
		{
			type: '3D',
			shadowTexture: true,
			alphaMax: 0.5,
			duplicate: 4,
			timeBetweenDupli: 100,
			sizeDelta: -60,
			duration: 800,
			attachedEntity: false,
			posxStart: 0,
			posyStart: 0,
			posxEnd: -5.66,
			posyEnd: -5.66,
			poszStart: 2,
			poszEnd: 2,
			sizeStart: 60,
			sizeEnd: 160,
			playSprite: true,
			fadeIn: true,
			fadeOut: true,
			blendMode: 8
		},
		{
			type: '3D',
			spriteName: 'sight',
			alphaMax: 123 / 255,
			alphaMaxDelta: 3 / 255,
			duplicate: 4,
			timeBetweenDupli: 100,
			sizeDelta: -60,
			duration: 800,
			attachedEntity: false,
			posxStart: 0,
			posyStart: 0,
			posxEnd: -5.66,
			posyEnd: -5.66,
			poszStart: 2,
			poszEnd: 2,
			sizeStart: 20,
			sizeEnd: 260,
			playSprite: true,
			fadeIn: true,
			fadeOut: true,
			blendMode: 8
		},
		{
			wav: 'effect/wizard_sightrasher'
		}
	],

	64: [
		{
			//EF_ARROWSHOT	Something Like Puruple/Yellow Light Bullet
			type: 'STR',
			file: 'arrowshot',
			attachedEntity: true
		}
	],

	65: [
		{
			//EF_INVENOM	Something Like Absorb of Power
			type: 'STR',
			file: 'invenom',
			wav: 'effect/thief_invenom',
			attachedEntity: true
		}
	],

	66: [
		{
			//EF_CURE	Cure
			type: 'STR',
			file: 'cure',
			wav: 'effect/acolyte_cure',
			min: 'cure_min',
			attachedEntity: true
		}
	],

	67: [
		{
			//EF_PROVOKE	Provoke
			// The official client plays the sound twice: on tick 5 (83 ms) and tick 30 (500 ms)
			type: 'STR',
			file: 'provoke',
			wav: 'effect/swordman_provoke',
			delayWav: 83,
			attachedEntity: true
		},
		{
			wav: 'effect/swordman_provoke',
			delayWav: 500
		}
	],

	68: [
		{
			//EF_MVP	MVP Banner
			type: 'STR',
			file: 'mvp',
			wav: 'effect/st_mvp',
			attachedEntity: true
		}
	],

	69: [
		{
			//EF_SKIDTRAP	Skid Trap
			type: 'STR',
			file: 'skidtrap',
			wav: 'effect/hunter_skidtrap', // or hallucinationwalk ?
			attachedEntity: false
		}
	],

	70: [
		{
			//EF_BRANDISHSPEAR	Brandish Spear
			attachedEntity: false,
			file: 'brandish',
			type: 'STR',
			wav: 'effect/knight_brandish_spear'
		}
	],

	74: [
		{
			//EF_ICEWALL	Ice Wall
			type: 'QuadHorn',
			textureFile: 'effect/ice.tga',
			attachedEntity: false,
			height: [2.8, 3.3],
			offsetX: [0.25, 0.75],
			offsetY: [0.25, 0.75],
			offsetZ: -0.1,
			bottomSize: [0.3, 0.5],
			blendMode: 8,
			rotateY: [1, 360],
			color: [1.0, 1.0, 1.0, 1.0],
			animation: 1,
			animationSpeed: 50
		},
		{
			type: 'QuadHorn',
			textureFile: 'effect/ice.tga',
			attachedEntity: false,
			height: [2.3, 2.8],
			offsetX: [0.25, 0.75],
			offsetY: [0.25, 0.75],
			offsetZ: -0.1,
			bottomSize: [0.3, 0.5],
			blendMode: 8,
			rotateY: [1, 360],
			color: [1.0, 1.0, 1.0, 1.0],
			animation: 1,
			animationSpeed: 50
		},
		{
			type: 'QuadHorn',
			textureFile: 'effect/ice.tga',
			attachedEntity: false,
			height: [2.5, 2.9],
			offsetX: [0.25, 0.75],
			offsetY: [0.25, 0.75],
			offsetZ: -0.1,
			bottomSize: [0.3, 0.5],
			blendMode: 8,
			rotateY: [1, 360],
			color: [1.0, 1.0, 1.0, 1.0],
			animation: 1,
			animationSpeed: 50
		},
		{
			wav: 'effect/wizard_icewall'
		}
	],

	75: [
		{
			//EF_GLORIA	Gloria
			type: 'STR',
			file: 'gloria',
			wav: 'effect/priest_gloria',
			min: 'gloria_min',
			attachedEntity: true
		}
	],

	76: [
		{
			//EF_MAGNIFICAT	Magnificat
			type: 'STR',
			file: 'magnificat',
			wav: 'effect/priest_magnificat',
			min: 'magnificat_min',
			attachedEntity: true
		}
	],

	77: [
		{
			//EF_RESURRECTION	Resurrection
			type: 'STR',
			file: 'resurrection',
			wav: 'effect/priest_resurrection',
			min: 'resurrection_min',
			attachedEntity: true
		}
	],

	78: [
		{
			//EF_RECOVERY	Status Recovery
			type: 'STR',
			file: 'recovery',
			wav: 'effect/priest_recovery',
			attachedEntity: true
		}
	],

	79: [
		{
			//EF_EARTHSPIKE	Earth Spike
			//Main Spike
			type: 'QuadHorn',
			textureFile: 'effect/stone.bmp',
			attachedEntity: false,
			duration: 5000,
			height: [0.95, 1.5],
			offsetX: [0.4, 0.6],
			offsetY: [0.4, 0.6],
			offsetZ: -0.1,
			bottomSize: [0.5, 0.6],
			blendMode: 1,
			rotateY: [1, 360],
			rotateZ: [-8.0, 8.0],
			color: [1.0, 1.0, 1.0, 1.0],
			animation: 3,
			animationSpeed: 120,
			animationOut: true
		},
		{
			type: 'QuadHorn',
			textureFile: 'effect/stone.bmp',
			attachedEntity: false,
			duration: 5000,
			height: [0.2, 0.4],
			offsetX: [0.0, 0.0],
			offsetY: [0.5, 0.5],
			offsetZ: -0.1,
			bottomSize: [0.1, 0.2],
			blendMode: 1,
			rotateY: [1, 360],
			rotateZ: [-15.0, 15.0],
			color: [1.0, 1.0, 1.0, 1.0],
			animation: 2,
			animationSpeed: 100,
			animationOut: true
		},
		{
			type: 'QuadHorn',
			textureFile: 'effect/stone.bmp',
			attachedEntity: false,
			duration: 5000,
			height: [0.2, 0.4],
			offsetX: [0.0, 0.5],
			offsetY: [0.5, 1.0],
			offsetZ: -0.1,
			bottomSize: [0.1, 0.2],
			blendMode: 1,
			rotateY: [1, 360],
			rotateZ: [-15.0, 15.0],
			color: [1.0, 1.0, 1.0, 1.0],
			animation: 2,
			animationSpeed: 100,
			animationOut: true
		},
		{
			type: 'QuadHorn',
			textureFile: 'effect/stone.bmp',
			attachedEntity: false,
			duration: 5000,
			height: [0.2, 0.4],
			offsetX: [1.0, 1.2],
			offsetY: [0.5, 0.8],
			offsetZ: -0.1,
			bottomSize: [0.1, 0.2],
			blendMode: 1,
			rotateY: [1, 360],
			rotateZ: [-15.0, 15.0],
			color: [1.0, 1.0, 1.0, 1.0],
			animation: 2,
			animationSpeed: 100,
			animationOut: true
		},
		{
			type: 'QuadHorn',
			textureFile: 'effect/stone.bmp',
			attachedEntity: false,
			duration: 5000,
			height: [0.2, 0.4],
			offsetX: [0.5, 0.7],
			offsetY: [0.0, -0.2],
			offsetZ: -0.1,
			bottomSize: [0.1, 0.2],
			blendMode: 1,
			rotateY: [1, 360],
			rotateZ: [-15.0, 15.0],
			color: [1.0, 1.0, 1.0, 1.0],
			animation: 2,
			animationSpeed: 100,
			animationOut: true
		},
		{
			wav: 'effect/wizard_earthspike',
			attachedEntity: false
		},
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const start = Params.Inst.startTick;
				const duration = 200;
				Camera.setQuake(start, duration);
			}
		}
	],

	80: [
		{
			//spear boomerang hit on target	//EF_SPEARBMR	Spear Boomerang
			//type: 'FUNC',
			wav: 'effect/ef_fireball',
			attachedEntity: true
		}
	],

	81: [
		{
			// default skill sound?	//EF_PIERCE	Skill hit
			wav: 'effect/ef_bash',
			attachedEntity: true
		}
	],

	82: [
		{
			//turn undead caster	//EF_TURNUNDEAD	Turn Undead
			//type: 'FUNC',
			wav: 'effect/ef_bash',
			attachedEntity: true
		}
	],

	83: [
		{
			//EF_SANCTUARY	Sanctuary
			type: 'STR',
			file: 'sanctuary',
			wav: 'effect/priest_sanctuary',
			attachedEntity: true
		}
	],

	84: [
		{
			//EF_IMPOSITIO	Impositio Manus
			type: 'STR',
			file: 'impositio',
			wav: 'effect/priest_impositio',
			attachedEntity: true
		}
	],

	85: [
		{
			//EF_LEXAETERNA	Lex Aeterna
			type: 'STR',
			file: 'lexaeterna',
			wav: 'effect/priest_lexaeterna',
			min: 'lexaeterna_min',
			attachedEntity: true
		}
	],

	86: [
		{
			//EF_ASPERSIO	Aspersio
			type: 'STR',
			file: 'aspersio',
			wav: 'effect/priest_aspersio',
			attachedEntity: true
		}
	],

	87: [
		{
			//EF_LEXDIVINA	Lex Divina
			type: 'STR',
			file: 'lexdivina',
			wav: 'effect/priest_lexdivina',
			attachedEntity: true
		}
	],

	88: [
		{
			//EF_SUFFRAGIUM	Suffragium
			type: 'STR',
			file: 'suffragium',
			wav: 'effect/priest_suffragium',
			min: 'suffragium_min',
			attachedEntity: true
		}
	],

	89: [
		{
			//EF_STORMGUST	Storm Gust
			type: 'STR',
			file: 'stormgust',
			wav: 'effect/wizard_stormgust',
			min: 'storm_min',
			attachedEntity: true
		}
	],

	90: [
		{
			//EF_LORD	Lord of Vermilion
			type: 'STR',
			file: 'lord',
			wav: 'effect/wizard_fire_ivy',
			attachedEntity: true
		}
	],

	91: [
		{
			//EF_BENEDICTIO	B. S. Sacramenti
			type: 'STR',
			file: 'benedictio',
			wav: 'effect/priest_benedictio',
			attachedEntity: true
		}
	],

	92: [
		{
			//EF_METEORSTORM	Meteor Storm
			type: 'STR',
			file: 'meteor%d',
			wav: 'effect/wizard_meteor',
			rand: [1, 4],
			attachedEntity: true
		},
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const start = Params.Inst.startTick + 600;
				Camera.setQuake(start);
			}
		}
	],

	93: [
		{
			//EF_YUFITEL	Jupitel Thunder (Ball)
			wav: 'effect/hunter_shockwavetrap',
			attachedEntity: false
		},
		{
			type: '3D',
			file: 'effect/thunder_center.bmp',
			duration: 200, // Aprox. 20 frames on C++
			size: 35, // widthSize 3.5f
			toSrc: true, // PT3DTEX_CHKTARGETPOS
			blendMode: 2, // RF_EMISSIVE (Aprox. Additive)
			overlay: true,
			alphaMax: 0.66 // 170/255 on C++
		},
		{
			type: '3D',
			fileList: [
				'effect/thunder_ball_a.bmp',
				'effect/thunder_ball_b.bmp',
				'effect/thunder_ball_c.bmp',
				'effect/thunder_ball_d.bmp',
				'effect/thunder_ball_e.bmp',
				'effect/thunder_ball_f.bmp'
			],
			frameDelay: 10, // m_animSpeed = 1 on C++
			duration: 200, // Aprox. 20 frames on C++
			size: 45, // widthSize 4.5f
			toSrc: true, // PT3DTEX_CHKTARGETPOS
			overlay: true,
			blendMode: 2 // RF_EMISSIVE (Aprox. Additive)
		}
	],

	94: [
		{
			//EF_YUFITELHIT	Jupitel Thunder (Hit)
			type: '3D',
			file: 'effect/thunder_pang.bmp',
			duration: 100, // Aprox. 10 frames on C++
			sizeStart: 0,
			sizeEnd: 25, // widthSpeed 2.5f (Growing up)
			blendMode: 2, // RF_EMISSIVE (Aprox. Additive)
			rotateToTarget: true,
			fadeOut: true,
			overlay: true,
			attachedEntity: true
		},
		{
			type: '3D',
			fileList: [
				'effect/thunder_plazma_blast_a.bmp',
				'effect/thunder_plazma_blast_b.bmp',
				'effect/thunder_ball_d.bmp',
				'effect/thunder_ball_e.bmp',
				'effect/thunder_ball_f.bmp'
			],
			frameDelay: 10,
			duration: 300, // duration 300 on C++ is equal to 3000ms on ROB but it's the total duration of all hits, ROB parse each
			size: 75, // widthSize 7.5f * 10
			blendMode: 2, // RF_EMISSIVE (Aprox. Additive)
			overlay: true,
			attachedEntity: true
		}
	],

	95: [
		{
			//EF_QUAGMIRE	Quagmire
			type: 'STR',
			file: 'quagmire',
			attachedEntity: false
		},
		{
			wav: 'effect/wizard_quagmire'
		}
	],

	96: [
		{
			//firepillar caster	//EF_FIREPILLAR	Fire Pillar
			type: 'STR',
			file: 'firepillar',
			wav: 'effect/wizard_fire_pillar_a',
			attachedEntity: false
		}
	],

	97: [
		{
			//firepillar target hit	//EF_FIREPILLARBOMB	Fire Pillar/Land Mine hit
			type: 'STR',
			file: 'firepillarbomb',
			wav: 'effect/wizard_fire_pillar_b',
			attachedEntity: false
		}
	],

	98: [
		{
			//EF_HASTEUP	Adrenaline Rush
			//type: 'FUNC',
			// This one is pretty messy... it somehow consists of two sprites, one is attached to the Entity, one isnt. additionally it consists of two sounds
			// For the sake of simplicity, I propose just using one sprite and one sound - the _a sound is just some 'intro' while _b is a real effect
			// black_adrenalinerush.wav what is this for?
			wav: 'effect/black_adrenalinerush_b', // The original client plays _a first and then continues with b
			attachedEntity: true
		}
	],

	'98_beforecast': [
		{
			wav: 'effect/black_adrenalinerush_a',
			attachedEntity: true
		}
	],

	99: [
		{
			//EF_FLASHER	Flasher Trap
			//type: 'FUNC',
			// Again two sprites... one attached one not. But here the 'main' sprite is ment to stay a little longer
			wav: 'effect/hunter_flasher',
			attachedEntity: false
		}
	],

	100: [
		{
			//EF_REMOVETRAP	Yellow ball fountain
			//type: 'FUNC',
			wav: 'effect/hunter_removetrap',
			attachedEntity: false
		}
	],

	101: [
		{
			//EF_REPAIRWEAPON	Weapon Repair
			type: 'STR',
			file: 'repairweapon',
			attachedEntity: true
		},
		{
			wav: 'effect/black_weapon_repair_a',
			delayWav: 480
		},
		{
			wav: 'effect/black_weapon_repair_a',
			delayWav: 1320
		}
	],

	102: [
		{
			//EF_CRASHEARTH	Hammerfall
			type: 'STR',
			file: 'crashearth',
			wav: 'effect/black_hammerfall',
			attachedEntity: false
		},
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const start = Params.Inst.startTick + 350;
				Camera.setQuake(start);
			}
		}
	],

	103: [
		{
			//EF_PERFECTION	Weapon Perfection
			type: 'STR',
			file: 'weaponperfection',
			wav: 'effect/black_weapon_perfection',
			min: 'weaponperfection_min',
			attachedEntity: true
		}
	],

	104: [
		{
			//EF_MAXPOWER	Maximize Power
			type: 'STR',
			file: 'maximizepower',
			min: 'maximize_min',
			attachedEntity: true
		}
	],

	105: [
		{
			//EF_BLASTMINE	empty
			wav: 'effect/hun_anklesnare'
		}
	],

	106: [
		{
			//EF_BLASTMINEBOMB	Blast Mine Trap
			type: 'STR',
			file: 'blastmine',
			wav: 'effect/hunter_blastmine', //hun_blastmine
			attachedEntity: false
		}
	],

	107: [
		{
			//EF_CLAYMORE	Claymore Trap
			type: 'STR',
			file: 'claymore',
			wav: 'effect/hunter_claymoretrap',
			attachedEntity: false
		}
	],

	108: [
		{
			//EF_FREEZING	Freezing Trap
			type: 'STR',
			file: 'freezing',
			wav: 'effect/hunter_freezingtrap',
			attachedEntity: false
		}
	],

	109: [
		{
			//EF_BUBBLE	Bailaban Blue bubble Map Effect
			type: 'STR',
			file: 'bubble%d',
			rand: [1, 4],
			attachedEntity: false
		}
	],

	110: [
		{
			//EF_GASPUSH	Trap Used by Giearth
			type: 'STR',
			file: 'gaspush',
			//wav:  'se_gas_pushhh', // the anthell map already has the sounds placed, no need to add it to the effect as well
			attachedEntity: false
		}
	],

	111: [
		{
			//EF_SPRINGTRAP	Spring Trap
			type: 'STR',
			file: 'spring',
			wav: 'effect/hunter_springtrap',
			attachedEntity: false
		}
	],

	112: [
		{
			//kyrie caster	//EF_KYRIE	Kyrie Eleison
			type: 'STR',
			file: 'kyrie',
			wav: 'effect/priest_kyrie_eleison_a', //on target its priest_kyrie_eleison_b
			min: 'kyrie_min',
			attachedEntity: true
		}
	],

	113: [
		{
			//EF_MAGNUS	Magnus Exorcismus
			type: 'STR',
			file: 'magnus',
			wav: 'effect/priest_magnus',
			attachedEntity: false
		}
	],

	115: [
		{
			//blitzbeat on target hit	//EF_BLITZBEAT	Blitz Beat
			wav: 'effect/hunter_blitzbeat',
			attachedEntity: true
		}
	],

	116: [
		{
			//EF_WATERBALL	   Fling Watersphere
			type: '3D',
			duration: 500,
			fileList: ['effect/water_out_a.bmp', 'effect/water_out_b.bmp', 'effect/water_out_c.bmp'],
			fadeOut: true,
			posxRand: 1.5,
			poszRand: 1.5,
			posyStart: 0,
			posyEnd: 3,
			posySmooth: true,
			size: 30.5,
			rotateWithCamera: true,
			blendMode: 2,
			attachedEntity: true,
			wav: 'effect/wizard_waterball_chulung'
		}
	],

	117: [
		{
			//EF_WATERBALL2	waterball moving to target
			type: '3D',
			duration: 500,
			duplicate: 20,
			timeBetweenDupli: 50,
			absoluteSpriteName: 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/waterball',
			playSprite: true,
			fromSrc: true,
			rotateToTarget: true,
			fadeOut: true,
			size: 50.0,
			zOffsetStart: 5,
			zOffsetEnd: 0,
			arc: 7.5,
			retreat: 5.0,
			wav: 'effect/wizard_waterball_chulung'
		}
	],

	119: [
		{
			//EF_DETECTING	Detect
			wav: 'effect/hunter_detecting',
			attachedEntity: true
		}
	],

	120: [
		{
			//EF_CLOAKING	   Cloaking
			wav: 'effect/assasin_cloaking'
		}
	],

	121: [
		{
			//EF_SONICBLOW	// sonic blow caste
			type: '3D',
			blendMode: 2,
			duration: 400,
			alphaMax: 1.0,
			fadeOut: true,
			sizeStart: 100,
			sizeEnd: 300,
			file: 'effect/ring2.bmp', // Original: 'effect/alpha_center.tga',
			wav: 'effect/ef_stonecurse',
			zIndex: 10,
			attachedEntity: true
		}
	],

	122: [
		{
			//EF_SONICBLOWHIT	   Multi hit effect
			//wav:  'effect/assasin_sonicblow' // old

			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const entity = Params.Init.ownerEntity;
				const delay = Params.Inst.startTick - Renderer.tick;

				entity.animations.add(function (tick) {
					if (tick >= delay) {
						entity.direction = (entity.direction + 2) % 8; // Spinning around
						return true;
					}
				});
			}
		}
	],

	123: [
		{
			//grimtooth caster	//EF_GRIMTOOTH	Grimtooth Cast
			wav: 'effect/ef_frostdiver',
			attachedEntity: true
		},
		{
			//EF_GRIMTOOTH	stone spikes traveling from caster past the target
			type: 'TRAIL',
			attachedEntity: false,
			duration: 2500,
			speed: 24,
			interval: 50,
			stopAtTarget: true,
			overshoot: 3,
			spawn: [
				{
					type: 'QuadHorn',
					textureFile: 'effect/stone.bmp',
					attachedEntity: false,
					duration: 670,
					height: [0.6, 1.0],
					offsetX: 0,
					offsetY: 0,
					offsetZ: 0,
					bottomSize: [0.05, 0.1],
					blendMode: 8,
					rotateX: [-15, 15],
					rotateY: [0, 360],
					color: [1.0, 1.0, 1.0, 1.0],
					animation: 4,
					animationSpeed: 330,
					riseDistance: 0.8,
					fadeOut: 170
				}
			]
		}
	],

	124: [
		{
			//EF_VENOMDUST	Venom Dust
			type: 'STR',
			file: 'venomdust',
			wav: 'effect/assasin_poisonreact', //effect/assasin_venomdust'
			attachedEntity: false
		}
	],

	126: [
		{
			//EF_POISONREACT	Poison React
			type: 'STR',
			file: 'poisonreact_1st',
			wav: 'effect/assasin_poisonreact',
			attachedEntity: true
		}
	],

	127: [
		{
			//EF_POISONREACT2	Small Posion React
			type: 'STR',
			file: 'poisonreact',
			wav: 'effect/assasin_poisonreact',
			attachedEntity: true
		}
	],

	128: [
		{
			//EF_OVERTHRUST	Over Thrust
			wav: 'effect/black_overthrust',
			attachedEntity: true
		}
	],

	129: [
		{
			//EF_SPLASHER	Venom Splasher Explosion
			type: 'STR',
			file: 'venomsplasher',
			wav: 'effect/assasin_venomsplasher',
			attachedEntity: true
		}
	],

	130: [
		{
			//EF_TWOHANDQUICKEN	Two-Hand Quicken
			type: 'STR',
			file: 'twohand',
			wav: 'effect/knight_twohandquicken',
			head: true,
			attachedEntity: true
		}
	],

	131: [
		{
			//autocounter activate hit	//EF_AUTOCOUNTER	Auto-Counter Hit
			type: 'STR',
			file: 'autocounter',
			wav: 'effect/knight_autocounter',
			attachedEntity: true
		}
	],

	132: [
		//EF_GRIMTOOTHATK	   Grimtooth Hit
		{
			type: 'QuadHorn',
			textureFile: 'effect/stone.bmp',
			attachedEntity: false,
			duration: 15000,
			height: 2.5,
			offsetX: 0.5,
			offsetY: 0.4,
			offsetZ: -0.2,
			bottomSize: 0.15,
			blendMode: 1,
			rotateX: -15,
			rotateY: 0,
			rotateZ: 0,
			color: [1.0, 1.0, 1.0, 1.0],
			animation: 3,
			animationSpeed: 120,
			animationOut: true
		},
		{
			type: 'QuadHorn',
			textureFile: 'effect/stone.bmp',
			attachedEntity: false,
			duration: 15000,
			height: 2.5,
			offsetY: 0.5,
			bottomSize: 0.15,
			blendMode: 1,
			rotateX: 5,
			rotateY: 45,
			rotateZ: -15,
			color: [1.0, 1.0, 1.0, 1.0],
			animation: 3,
			animationSpeed: 120,
			animationOut: true
		},
		{
			type: 'QuadHorn',
			textureFile: 'effect/stone.bmp',
			attachedEntity: false,
			duration: 15000,
			height: 2.5,
			offsetX: 0.5,
			offsetY: 0.5,
			offsetZ: 0,
			bottomSize: 0.15,
			blendMode: 1,
			rotateX: 5,
			rotateY: 45,
			rotateZ: 15,
			color: [1.0, 1.0, 1.0, 1.0],
			animation: 3,
			animationSpeed: 120,
			animationOut: true
		}
	],

	133: [
		{
			//EF_FREEZE	Ice Effect (Used by NPCs)
			type: 'STR',
			file: 'freeze',
			attachedEntity: true
		}
	],

	134: [
		{
			//EF_FREEZED	Ice Effect (Used by NPCs)
			type: 'STR',
			file: 'freezed',
			attachedEntity: true
		}
	],

	135: [
		{
			//EF_ICECRASH	Ice Effect (Used by NPCs)
			type: 'STR',
			file: 'icecrash',
			attachedEntity: true
		}
	],

	136: [
		{
			//EF_SLOWPOISON	Slow Poison
			type: 'STR',
			file: 'slowp',
			wav: 'effect/priest_slowpoison',
			attachedEntity: false
		}
	],

	138: [
		{
			//EF_FIREPILLARON	Fire pillar
			type: 'CYLINDER',
			attachedEntity: false,
			topSize: 2.0,
			bottomSize: 1.0,
			textureName: 'magic_red',
			height: 3,
			duration: 5000,
			delayOffset: 1000,
			rotate: true
		},
		{
			type: 'CYLINDER',
			attachedEntity: false,
			topSize: 1.5,
			bottomSize: 0.7,
			textureName: 'magic_red',
			height: 5,
			duration: 5000,
			delayOffset: 1000,
			rotate: true
		},
		{
			type: 'CYLINDER',
			attachedEntity: false,
			topSize: 1.0,
			bottomSize: 0.5,
			textureName: 'magic_red',
			height: 7,
			duration: 5000,
			delayOffset: 1000,
			rotate: true
		}
	],

	139: [
		{
			//EF_SANDMAN	Sandman Trap
			type: 'STR',
			file: 'sandman',
			wav: 'effect/hunter_sandman',
			attachedEntity: false
		}
	],

	140: [
		{
			//EF_REVIVE	Ressurection Aura
			wav: 'effect/priest_resurrection',
			attachedEntity: true
		}
	],

	141: [
		{
			//EF_PNEUMA	Pneuma
			type: 'STR',
			file: 'pneuma%d',
			rand: [1, 3],
			attachedEntity: false
		}
	],

	142: [
		{
			//EF_HEAVENDRIVE
			type: 'FUNC',
			func: function (Params) {
				for (let i = -2; i <= 2; i++) {
					for (let j = -2; j <= 2; j++) {
						const newParams = {
							effect: {
								type: 'QuadHorn',
								textureFile: 'effect/stone.bmp',
								attachedEntity: false,
								duration: 1000,
								height: [0.75, 1.2],
								offsetX: [0.2, 0.2],
								offsetY: [0.2, 0.2],
								offsetZ: -0.1,
								bottomSize: [0.4, 0.7],
								blendMode: 1,
								rotateY: [1, 360],
								rotateZ: [-8.0, 8.0],
								color: [1.0, 1.0, 1.0, 1.0],
								animation: 3,
								animationSpeed: 250,
								animationOut: true
							},
							Init: {},
							Inst: {}
						};
						const newPos = [Params.Init.position[0] + i, Params.Init.position[1] + j];
						Object.assign(newParams.Init, Params.Init);
						newParams.Init.position = [newPos[0], newPos[1], Altitude.getCellHeight(newPos[0], newPos[1])];
						newParams.Init.duration = newParams.effect.duration;
						Object.assign(newParams.Inst, Params.Inst);
						newParams.Inst.position = [newPos[0], newPos[1], Altitude.getCellHeight(newPos[0], newPos[1])];
						newParams.Inst.duration = newParams.effect.duration;
						newParams.Inst.endTick = newParams.Inst.startTick + newParams.effect.duration;
						this.add(new QuadHorn(newParams.effect, newParams.Inst, newParams.Init), newParams);
					}
				}
			}
		},
		{
			wav: 'effect/wizard_earthspike',
			attachedEntity: false
		},
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const start = Params.Inst.startTick;
				const duration = 200;
				Camera.setQuake(start, duration);
			}
		}
	],

	143: [
		{
			//EF_SONICBLOW2	Sonic Blow (Part 2/2) - sonicblow at target
			type: 'STR',
			file: 'sonicblow',
			attachedEntity: true
		}
	],

	144: [
		{
			//EF_BRANDISH2	Brandish Spear Pre-Hit Effect
			type: 'STR',
			file: 'brandish2',
			wav: 'effect/knight_brandish_spear',
			attachedEntity: true
		}
	],

	/*145: [{	//EF_SHOCKWAVE	Shockwave Trap
			type: 'STR',
			file: 'shockwave',
			wav:  'effect/hunter_shockwavetrap',
			attachedEntity: true
		}],*/

	145: [
		{
			type: 'SPR',
			file: 'shockwave',
			wav: 'effect/hunter_shockwavetrap',
			attachedEntity: true
		}
	],

	146: [
		{
			//EF_SHOCKWAVEHIT	Shockwave Trap Hit
			type: 'STR',
			file: 'shockwavehit',
			attachedEntity: true
		}
	],

	147: [
		{
			//EF_EARTHHIT	Pierce Hit
			type: 'STR',
			file: 'earthhit',
			attachedEntity: true
		}
	],

	148: [
		{
			//EF_PIERCESELF	Pierce Cast Animation
			type: 'STR',
			file: 'pierce',
			attachedEntity: true
			// attach animation at middle of body
		}
	],

	149: [
		{
			//EF_BOWLINGSELF	Bowling Bash
			type: 'STR',
			file: 'bowling',
			wav: '_enemy_hit_normal1', //'effect/knight_bowling_bash', fake
			head: true,
			attachedEntity: true
		}
	],

	150: [
		{
			//EF_SPEARSTABSELF	Pierce Cast Animation
			type: 'STR',
			file: 'spearstab',
			wav: '_enemy_hit_normal1',
			attachedEntity: true
			// attach animation at middle of body
		}
	],

	151: [
		{
			//spear boomerang caster	//EF_SPEARBMRSELF	Spear Boomerang Cast
			type: 'STR',
			file: 'spearboomerang',
			wav: 'effect/knight_spear_boomerang',
			head: true,
			attachedEntity: true
		}
	],

	152: [
		{
			//turn undead hit on targer	//EF_HOLYHIT	Turn Undead
			type: 'STR',
			file: 'holyhit',
			attachedEntity: true
		}
	],

	153: [
		{
			//EF_CONCENTRATION	Increase Concentration
			type: 'STR',
			file: 'concentration',
			wav: 'effect/ac_concentration',
			attachedEntity: true
		}
	],

	154: [
		{
			//EF_REFINEOK	Refine Success
			type: 'STR',
			file: 'bs_refinesuccess',
			wav: 'effect/bs_refinesuccess',
			attachedEntity: true
		}
	],

	155: [
		{
			//EF_REFINEFAIL	Refine Fail
			type: 'STR',
			file: 'bs_refinefailed',
			wav: 'effect/bs_refinefailed',
			attachedEntity: true
		}
	],

	//156: [{}],	//EF_JOBCHANGE	   jobchange.str not found error
	//157: [{}],	//EF_LVUP	   levelup.str not found error

	158: [
		{
			//EF_JOBLVUP	Job Level Up
			type: 'STR',
			file: 'joblvup',
			attachedEntity: true
		}
	],

	//159: [{}],	//EF_TOPRANK	   PvP circle
	//160: [{}],	//EF_PARTY	   PvP Party Circle
	161: [
		{
			//EF_RAIN	Rain weather
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				RainWeatherEffect.startOrRestart(Params);
			}
		}
	],
	162: [
		{
			//EF_SNOW	Snow weather
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				SnowWeatherEffect.startOrRestart(Params);
			}
		}
	],

	163: [
		{
			//EF_SAKURA	   White Sakura Leaves
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				SakuraWeatherEffect.startOrRestart(Params);
			}
		}
	],

	//164: [{}],	//EF_STATUS_STATE	   (Nothing)

	165: [
		{
			//Comodo Fireworks Ball	//EF_BANJJAKII	Comodo Fireworks Ball
			type: 'SPR',
			file: '\xc5\xa9\xb8\xae\xbd\xba\xb8\xb6\xbd\xba',
			duration: 1000,
			attachedEntity: true
		}
	],

	166: [
		{
			//EF_MAKEBLUR Energy Coat (Visual Effect)
			type: 'FUNC',
			func: function (Params) {
				const entity = Params.Init.ownerEntity;
				if (!entity) {
					return;
				}

				entity._enableTrail = true;
				entity._blurType = 1;

				setTimeout(() => {
					entity._enableTrail = false;
				}, Params.Init.duration || 2000);
			}
		}
	],
	//167: [{}],	//EF_TAMINGSUCCESS	   (Nothing)
	//168: [{}],	//EF_TAMINGFAILED	   (Nothing)

	169: [
		{
			//EF_ENERGYCOAT	Energy Coat Animation
			type: 'STR',
			file: 'energycoat',
			attachedEntity: true
		}
	],

	170: [
		{
			//EF_CARTREVOLUTION	Cart Revolution
			type: 'STR',
			file: 'cartrevolution',
			wav: 'effect/ef_magnumbreak',
			attachedEntity: true
		}
	],

	171: [
		{
			//EF_VENOMDUST2	   Venom Dust Map Unit
			type: '3D',
			spriteName: 'particle3',
			alphaMax: 1,
			attachedEntity: true,
			duration: 100,
			size: 80,
			poszStart: 0,
			poszEnd: 0.5,
			repeat: true
		}
	]
};
