/**
 * @module DB/Effects/Table/ById/Effects0700-0799
 *
 * Effects 700 to 799 of the effect table, in ID order (see EffectConst.js).
 * DB/Effects/EffectTable.js joins the parts; its header lists the parameters a row takes.
 */

import Camera from 'Renderer/Camera.js';
import Events from 'Core/Events.js';

export default {
	//700: [{}],	//EF_MAPSPHERE2	   Big Colored Green Sphere.
	//701: [{}],	//EF_GLOW11	   Huge Blue Sphere
	//702: [{}],	//EF_GLOW12	   Little Colored Violet Sphere
	//703: [{}],	//EF_CIRCLELIGHT	   Light Infiltration with fall of pownder

	704: [
		{
			//EF_ITEM315	Client Error (mobile_ef02.str)
			type: 'STR',
			file: 'mobile_ef02',
			attachedEntity: true
		}
	],

	705: [
		{
			//EF_ITEM316	Client Error (mobile_ef01.str)
			type: 'STR',
			file: 'mobile_ef01',
			attachedEntity: true
		}
	],

	706: [
		{
			//EF_ITEM317	Client Error (mobile_ef03.str)
			type: 'STR',
			file: 'mobile_ef03',
			attachedEntity: true
		}
	],

	//707: [{}],	//EF_ITEM318	   Client Crash :P

	708: [
		{
			//EF_STORM_MIN	Storm Gust (same as 89)
			type: 'STR',
			file: 'storm_min',
			wav: 'effect/wizard_stormgust',
			attachedEntity: true
		}
	],

	709: [
		{
			//EF_POK_JAP	A Firework that split in 4 mini fireworks
			type: 'STR',
			file: 'pokjuk_jap',
			attachedEntity: false
		}
	],

	//710: [{}],	//EF_MAP_GREENLIGHT	   A Sphere like Effect 701 but Green, and a bit more larger
	//711: [{}],	//EF_MAP_MAGICWALL	   A big violet wall
	//712: [{}],	//EF_MAP_GREENLIGHT2	   A Little Flame Sphere
	//713: [{}],	//EF_YELLOWFLY1	   A lot of Very Small and Yellow Sphere
	//714: [{}],	//EF_YELLOWFLY2	   (Nothing)
	715: [
		// EF_BOTTOM_BLUE - Little blue Basilica
		{
			type: 'CYLINDER',
			textureName: 'alpha_down',
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 1.5,
			topSize: 1.5,
			height: 2.0,
			alphaMax: 40 / 255,
			blendMode: 2,
			rotateWithCamera: true,
			red: 0.2,
			green: 0.6,
			blue: 1.0,
			duration: 20000,
			attachedEntity: true
		},
		{
			type: 'CYLINDER',
			textureName: 'alpha_down',
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 1.58,
			topSize: 1.58,
			height: 2.1,
			alphaMax: 32 / 255,
			blendMode: 2,
			rotateWithCamera: true,
			angleY: 10,
			red: 0.2,
			green: 0.6,
			blue: 1.0,
			duration: 20000,
			attachedEntity: true
		},
		{
			type: 'CYLINDER',
			textureName: 'alpha_down',
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 1.65,
			topSize: 1.65,
			height: 2.0,
			alphaMax: 15 / 255,
			blendMode: 2,
			rotateWithCamera: true,
			angleY: 26.6,
			red: 0.1,
			green: 0.4,
			blue: 1.0,
			duration: 20000,
			attachedEntity: true
		},
		{
			type: 'CYLINDER',
			textureName: 'alpha_down',
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 1.65,
			topSize: 1.65,
			height: 2.0,
			alphaMax: 15 / 255,
			blendMode: 2,
			rotateWithCamera: true,
			angleY: 79.8,
			red: 0.1,
			green: 0.4,
			blue: 1.0,
			duration: 20000,
			attachedEntity: true
		}
	],

	716: [
		// EF_BOTTOM_BLUE2 - Little blue Basilica
		{
			type: 'CYLINDER',
			textureName: 'alpha_down',
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 1.5,
			topSize: 1.5,
			height: 2.0,
			alphaMax: 40 / 255,
			blendMode: 2,
			rotateWithCamera: true,
			red: 0.2,
			green: 0.6,
			blue: 1.0,
			duration: 20000,
			attachedEntity: true
		},
		{
			type: 'CYLINDER',
			textureName: 'alpha_down',
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 1.58,
			topSize: 1.58,
			height: 2.1,
			alphaMax: 32 / 255,
			blendMode: 2,
			rotateWithCamera: true,
			angleY: 10,
			red: 0.2,
			green: 0.6,
			blue: 1.0,
			duration: 20000,
			attachedEntity: true
		},
		{
			type: 'CYLINDER',
			textureName: 'alpha_down',
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 1.65,
			topSize: 1.65,
			height: 2.0,
			alphaMax: 15 / 255,
			blendMode: 2,
			rotateWithCamera: true,
			angleY: 26.6,
			red: 0.1,
			green: 0.4,
			blue: 1.0,
			duration: 20000,
			attachedEntity: true
		},
		{
			type: 'CYLINDER',
			textureName: 'alpha_down',
			totalCircleSides: 4,
			circleSides: 4,
			bottomSize: 1.65,
			topSize: 1.65,
			height: 2.0,
			alphaMax: 15 / 255,
			blendMode: 2,
			rotateWithCamera: true,
			angleY: 79.8,
			red: 0.1,
			green: 0.4,
			blue: 1.0,
			duration: 20000,
			attachedEntity: true
		}
	],

	717: [
		{
			//EF_WEWISH	Christmas Carol (copy of Angelus)
			type: 'STR',
			file: 'angelus',
			wav: 'effect/wewish',
			min: 'jong_mini',
			attachedEntity: true
		}
	],

	718: [
		{
			//EF_FIREPILLARON2	   Judex (Visual Effect)
			wav: 'effect/ab_judex'
		},
		{
			type: 'CYLINDER',
			attachedEntity: false,
			topSize: 0.5,
			bottomSize: 0.4,
			textureName: 'ring_white',
			height: 3.5,
			duration: 1000,
			rotate: true
		},
		{
			type: 'CYLINDER',
			attachedEntity: false,
			topSize: 0.75,
			bottomSize: 0.45,
			textureName: 'ring_white',
			height: 2.5,
			duration: 1000,
			rotate: true
		},
		{
			type: 'CYLINDER',
			attachedEntity: false,
			topSize: 1,
			bottomSize: 0.5,
			textureName: 'ring_white',
			height: 1.5,
			duration: 1000,
			rotate: true
		}
	],

	719: [
		{
			//EF_FORESTLIGHT5	   Renovatio (light beam)
			wav: 'effect/ab_renovation'
		}
	],
	//720: [{}],	//EF_SOULBREAKER3	   Yellow version of Soul Breaker

	721: [
		{
			//EF_ADO_STR	Adoramus (lightning bolt)
			type: 'STR',
			file: 'ado',
			wav: 'effect/ab_adoramus',
			attachedEntity: true
		}
	],

	722: [
		{
			//EF_IGN_STR	Ignition Break (big explosion)
			type: 'STR',
			file: '\xc0\xcc\xb1\xd7\xb4\xcf\xbc\xc7\xba\xea\xb7\xb9\xc0\xcc\xc5\xa9',
			wav: 'effect/wl_jackfrost',
			attachedEntity: true
		}
	],

	//723: [{}],	//EF_CHIMTO2	   Hundred Spear (sound effect)
	//724: [{}],	//EF_WINDCUTTER	   Green version of Detecting
	//725: [{}],	//EF_DETECT2	   Oratorio (like Detecting)
	726: [
		{
			//EF_FROSTMYSTY	   Frost Misty (blue vapor and bubbles)
			wav: 'effect/t_\xbf\xa1\xb3\xca\xc1\xf6\xb9\xe6\xc3\xe2'
		}
	],

	727: [
		{
			//EF_CRIMSON_STR	Crimson Rock
			type: 'STR',
			file: 'crimson_r',
			wav: 'effect/crimson_r',
			attachedEntity: true
		}
	],

	728: [
		{
			//EF_HELL_STR	Small fire (part of Hell Inferno)
			type: 'STR',
			file: 'hell_in',
			attachedEntity: true
		}
	],

	729: [
		{
			//EF_SPR_MASH	   Marsh of Abyss (like Close Confine)
			type: 'SPR',
			file: 'mashofa'
		}
	],
	//730: [{}],	//EF_SPR_SOULE	   Small, cartoony explosion (part of Soul Expansion)

	731: [
		{
			//EF_DHOWL_STR	Dragon Howling (blinking, expanding circle)
			type: 'STR',
			file: 'dragon_h',
			wav: 'dragon_h',
			attachedEntity: true
		}
	],

	732: [
		{
			//EF_EARTHWALL	   Spike from the ground
			type: 'QuadHorn',
			textureFile: 'effect/stone.bmp',
			attachedEntity: false,
			duration: 1000,
			height: [0.75, 1.2],
			offsetX: [0.2, 0.2],
			offsetY: [0.2, 0.2],
			offsetZ: -0.1,
			bottomSize: [0.4, 0.9],
			blendMode: 1,
			rotateY: [1, 360],
			rotateZ: [-8.0, 8.0],
			color: [1.0, 1.0, 1.0, 1.0],
			animation: 3,
			animationSpeed: 250,
			animationOut: true,
			wav: 'effect/wizard_earthspike'
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

	//733: [{}],	//EF_SOULBREAKER4	   Fluffy Ball flying by

	734: [
		{
			//EF_CHAINL_STR	Chain Lightning
			type: 'STR',
			file: 'chainlight',
			wav: 'effect/chainlight',
			attachedEntity: true
		}
	],

	//735: [{}],	//EF_CHOOKGI_FIRE	   (Nothing) - Used for elemental spheres (warlock)
	//736: [{}],	//EF_CHOOKGI_WIND	   (Nothing) - Used for elemental spheres (warlock)
	//737: [{}],	//EF_CHOOKGI_WATER	   (Nothing) - Used for elemental spheres (warlock)
	//738: [{}],	//EF_CHOOKGI_GROUND	   (Nothing) - Used for elemental spheres (warlock)
	//739: [{}],	//EF_MAGENTA_TRAP	   Old Magenta Trap
	//740: [{}],	//EF_COBALT_TRAP	   Old Cobald Trap
	//741: [{}],	//EF_MAIZE_TRAP	   Old Maize Trap
	//742: [{}],	//EF_VERDURE_TRAP	   Old Verdure Trap
	//743: [{}],	//EF_NORMAL_TRAP	   White Ranger Trap
	//744: [{}],	//EF_CLOAKING2	   Camouflage

	745: [
		{
			//EF_AIMED_STR	Aimed Bolt (crosshairs)
			type: 'STR',
			file: 'aimed',
			attachedEntity: true
		}
	],

	746: [
		{
			//EF_ARROWSTORM_STR	Arrow Storm
			type: 'STR',
			file: 'arrowstorm',
			attachedEntity: true
		}
	],

	747: [
		{
			//EF_LAULAMUS_STR	Falling white feathers
			type: 'STR',
			file: 'laulamus',
			attachedEntity: true
		}
	],

	748: [
		{
			//EF_LAUAGNUS_STR	Falling blue feathers
			type: 'STR',
			file: 'lauagnus',
			attachedEntity: true
		}
	],

	749: [
		{
			//EF_MILSHIELD_STR	Millennium Shield
			type: 'STR',
			file: 'mil_shield',
			attachedEntity: true
		}
	],

	750: [
		{
			//EF_CONCENTRATION2	Detonator (blue sparkles)
			type: 'STR',
			file: 'concentration',
			attachedEntity: true
		}
	],

	//751: [{}],	//EF_FIREBALL2	   Releasing summoned warlock spheres
	//752: [{}],	//EF_BUNSINJYUTSU2	   Like Energy Coat, but not as dark
	//753: [{}],	//EF_CLEARTIME	   Clearance

	754: [
		{
			//EF_GLASSWALL3	   Green warp portal (root of Epiclesis)
			alphaMax: 0.4,
			animation: 4,
			attachedEntity: true,
			blendMode: 2,
			red: 0.6,
			green: 1.0,
			blue: 0.6,
			bottomSize: 2.4,
			duration: 500,
			duplicate: 150,
			fadeOut: true,
			height: 0.1,
			posZ: 0.1,
			rotate: true,
			textureName: 'magic_green',
			timeBetweenDupli: 200,
			topSize: 3.9,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.4,
			animation: 0,
			attachedEntity: true,
			blendMode: 2,
			red: 0.6,
			green: 1.0,
			blue: 0.6,
			bottomSize: 0.6,
			duration: 30000,
			fade: true,
			height: 7,
			rotate: true,
			textureName: 'magic_green',
			topSize: 0.6,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.4,
			animation: 0,
			attachedEntity: true,
			blendMode: 2,
			red: 0.6,
			green: 1.0,
			blue: 0.6,
			bottomSize: 0.8,
			duration: 30000,
			fade: true,
			height: 6,
			rotate: true,
			textureName: 'magic_green',
			topSize: 0.8,
			type: 'CYLINDER'
		},
		{
			alphaMax: 0.5,
			animation: 0,
			attachedEntity: true,
			blendMode: 2,
			red: 0.6,
			green: 1.0,
			blue: 0.6,
			bottomSize: 1,
			duration: 30000,
			fade: true,
			height: 1,
			posZ: 2,
			rotate: true,
			totalCircleSides: 20,
			circleSides: 10,
			repeatTextureX: 2,
			textureName: 'alpha1',
			topSize: 1,
			type: 'CYLINDER'
		}
	],

	//755: [{}],	//EF_ORATIO	   Oratio (spinning blue symbol)

	756: [
		{
			//EF_POTION_BERSERK2	Enchant Blade (like Berserk Potion)
			type: 'STR',
			file: '\xb9\xf6\xbc\xad\xc5\xa9',
			attachedEntity: true
		}
	],

	//757: [{}],	//EF_CIRCLEPOWER	   Third Class Aura (Middle)
	758: [
		{
			//EF_ROLLING1	   Rolling Cutter - Spin Count 1
			alphaMax: 1,
			blendMode: 1,
			red: 1.0,
			green: 1.0,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 200,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd1.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.7,
			green: 0.7,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 220,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd1.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.5,
			green: 0.5,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 240,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd1.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.3,
			green: 0.3,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 260,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd1.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.1,
			green: 0.1,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 280,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd1.tga'
		}
	],

	759: [
		{
			//EF_ROLLING2	   Rolling Cutter - Spin Count 2
			alphaMax: 1,
			blendMode: 1,
			red: 1.0,
			green: 1.0,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 200,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd2.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.7,
			green: 0.7,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 220,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd2.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.5,
			green: 0.5,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 240,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd2.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.3,
			green: 0.3,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 260,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd2.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.1,
			green: 0.1,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 280,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd2.tga'
		}
	],

	760: [
		{
			//EF_ROLLING3	   Rolling Cutter - Spin Count 3
			alphaMax: 1,
			blendMode: 1,
			red: 1.0,
			green: 1.0,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 200,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd3.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.7,
			green: 0.7,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 220,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd3.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.5,
			green: 0.5,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 240,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd3.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.3,
			green: 0.3,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 260,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd3.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.1,
			green: 0.1,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 280,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd3.tga'
		}
	],

	761: [
		{
			//EF_ROLLING4	   Rolling Cutter - Spin Count 4
			alphaMax: 1,
			blendMode: 1,
			red: 1.0,
			green: 1.0,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 200,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd4.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.7,
			green: 0.7,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 220,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd4.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.5,
			green: 0.5,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 240,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd4.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.3,
			green: 0.3,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 260,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd4.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.1,
			green: 0.1,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 280,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd4.tga'
		}
	],

	762: [
		{
			//EF_ROLLING5	   Rolling Cutter - Spin Count 5
			alphaMax: 1,
			blendMode: 1,
			red: 1.0,
			green: 1.0,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 200,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd5.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.7,
			green: 0.7,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 220,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd5.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.5,
			green: 0.5,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 240,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd5.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.3,
			green: 0.3,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 260,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd5.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.1,
			green: 0.1,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 280,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd5.tga'
		}
	],

	763: [
		{
			//EF_ROLLING6	   Rolling Cutter - Spin Count 6
			alphaMax: 1,
			blendMode: 1,
			red: 1.0,
			green: 1.0,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 200,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd6.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.7,
			green: 0.7,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 220,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd6.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.5,
			green: 0.5,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 240,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd6.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.3,
			green: 0.3,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 260,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd6.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.1,
			green: 0.1,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 280,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd6.tga'
		}
	],

	764: [
		{
			//EF_ROLLING7	   Rolling Cutter - Spin Count 7
			alphaMax: 1,
			blendMode: 1,
			red: 1.0,
			green: 1.0,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 200,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd7.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.7,
			green: 0.7,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 220,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd7.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.5,
			green: 0.5,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 240,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd7.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.3,
			green: 0.3,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 260,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd7.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.1,
			green: 0.1,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 280,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd7.tga'
		}
	],

	765: [
		{
			//EF_ROLLING8	   Rolling Cutter - Spin Count 8
			alphaMax: 1,
			blendMode: 1,
			red: 1.0,
			green: 1.0,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 200,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd8.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.7,
			green: 0.7,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 220,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd8.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.5,
			green: 0.5,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 240,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd8.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.3,
			green: 0.3,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 260,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd8.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.1,
			green: 0.1,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 280,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd8.tga'
		}
	],

	766: [
		{
			//EF_ROLLING9	   Rolling Cutter - Spin Count 9
			alphaMax: 1,
			blendMode: 1,
			red: 1.0,
			green: 1.0,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 200,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd9.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.7,
			green: 0.7,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 220,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd9.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.5,
			green: 0.5,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 240,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd9.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.3,
			green: 0.3,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 260,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd9.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.1,
			green: 0.1,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 280,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd9.tga'
		}
	],

	767: [
		{
			//EF_ROLLING10	   Rolling Cutter - Spin Count 10
			alphaMax: 1,
			blendMode: 1,
			red: 1.0,
			green: 1.0,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 200,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd10.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.7,
			green: 0.7,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 220,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd10.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.5,
			green: 0.5,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 240,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd10.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.3,
			green: 0.3,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 260,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd10.tga'
		},
		{
			alphaMax: 0.2,
			blendMode: 2,
			red: 0.1,
			green: 0.1,
			blue: 1.0,
			attachedEntity: true,
			duration: 1000,
			fadeIn: true,
			fadeOut: true,
			posz: 4,
			sizeEnd: 20,
			sizeSmooth: true,
			sizeStart: 280,
			type: '3D',
			zIndex: 10,
			file: 'effect/\xc8\xb8\xc0\xfc\xc4\xab\xbf\xee\xc5\xcd10.tga'
		}
	],

	//768: [{}],	//EF_PURPLEBODY	   Blinking
	//769: [{}],	//EF_STIN6	   Cross Ripper Slasher (flying knives)
	//770: [{}],	//EF_RG_COIN4	   Strip sound
	//771: [{}],	//EF_POISONWAV	   Poison sound
	//772: [{}],	//EF_POISONSMOKE	   Poison particles
	//773: [{}],	//EF_GUMGANG4	   Expanding purple aura (part of Phantom Menace)
	//774: [{}],	//EF_SHIELDBOOMERANG4	   Axe Boomerang

	775: [
		{
			//EF_CASTSPIN2	   Spinning character sprite
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const entity = Params.Init.ownerEntity;
				const duration = 500;
				const count = 8;
				const delay = duration / count;

				for (let i = 0; i < count; i++) {
					const delta = 1;

					Events.setTimeout(function () {
						entity.direction = Math.floor(entity.direction + delta) % 8;
					}, delay * i);
				}
			}
		}
	],

	//776: [{}],	//EF_VULCANWAV	   Like Desperado sound effect
	//777: [{}],	//EF_AGIUP2	   Faded light from the ground [S]
	//778: [{}],	//EF_DETECT3	   Expanding white aura (like Clearance)
	//779: [{}],	//EF_AGIUP3	   Faded light from the ground [S]
	//780: [{}],	//EF_DETECT4	   Expanding red aura (from Infrared Scan)
	//781: [{}],	//EF_ELECTRIC3	   Magnetic Field (purple chains)
	//782: [{}],	//EF_GUARD4	   All-around shield [S]
	//783: [{}],	//EF_BOTTOM_BARRIER	   Yellow shaft of light
	//784: [{}],	//EF_BOTTOM_STEALTH	   White shaft of light
	//785: [{}],	//EF_REPAIRTIME	   Upward flying wrenches
	//786: [{}],	//EF_NC_ANAL	   Symbol with bleeping sound [S]
	//787: [{}],	//EF_FIRETHROW	   Flare Launcher (line of fire)
	//788: [{}],	//EF_VENOMIMPRESS	   Venom Impress (green skull)
	//789: [{}],	//EF_FROSTMISTY	   Freezing Status Effect (two ancillas)
	//790: [{}],	//EF_BURNING	   Burning Status Effect (flame symbol)
	//791: [{}],	//EF_COLDTHROW	   Two ice shots
	//792: [{}],	//EF_MAKEHALLU	   Upward streaming white particles
	//793: [{}],	//EF_HALLUTIME	   Same, but more brief
	//794: [{}],	//EF_INFRAREDSCAN	   Infrared Scan (red lasers)

	795: [
		{
			//EF_CRASHAXE	Power Swing (axe crash)
			type: 'STR',
			file: 'powerswing',
			attachedEntity: true
		}
	],

	//796: [{}],	//EF_GTHUNDER	   Spinning blue triangles
	//797: [{}],	//EF_STONERING	   Stapo
	//798: [{}],	//EF_INTIMIDATE2	   Red triangles (like Intimidate)
	799: [
		{
			//EF_STASIS	   Stasis (expanding blue mist) [S]
			wav: 'effect/wl_stasis'
		}
	]
};
