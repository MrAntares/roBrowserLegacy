/**
 * @module DB/Effects/Table/ById/Effects0600-0699
 *
 * Effects 600 to 699 of the effect table, in ID order (see EffectConst.js).
 * DB/Effects/EffectTable.js joins the parts; its header lists the parameters a row takes.
 */

import Camera from 'Renderer/Camera.js';
import SongEffects from 'Renderer/Effects/Songs.js';
import CloudWeatherEffect from 'Renderer/Effects/CloudWeatherEffect.js';
import SpiritSphere from 'Renderer/Effects/SpiritSphere.js';

const EvillandEffects = SongEffects.EvillandEffects;

export default {
	//599: [{}],	//EF_SHRINK	   Cast Time Sound and Flashing Animation on Player

	600: [
		{
			//EF_THROWITEM6	   Throw Venom Knife
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 200,
			fadeIn: true,
			fadeOut: true,
			file: '\xc0\xaf\xc0\xfa\xc0\xce\xc5\xcd\xc6\xe4\xc0\xcc\xbd\xba/item/\xba\xa3\xb3\xd1\xb3\xaa\xc0\xcc\xc7\xc1.bmp',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			rotate: true,
			nbOfRotation: 1,
			size: 30,
			zOffset: 1,
			zIndex: 1
		}
	],

	//601: [{}],	//EF_SIGHT2	   Sight Blaster
	//602: [{}],	//EF_QUAKEBODY4	   Close Confine (Grab Effect)

	603: [
		{
			//EF_FIREHIT2	Spinning fire ball (like 50, but smaller)
			type: 'STR',
			file: 'firehit%d',
			rand: [1, 3],
			attachedEntity: true
		}
	],

	604: [
		{
			//EF_NPC_STOP2	Close Confine (Ground Effect)
			type: 'SPR',
			file: 'cconfine',
			attachedEntity: true,
			wav: 'effect/ef_hit6',
			stopAtEnd: true
		}
	],

	//605: [{}],	//EF_NPC_STOP2_DEL	   (Nothing)

	606: [
		{
			//EF_FVOICE	   Pang Voice (Visual Effect)
			type: 'SPR',
			file: 'fvoice',
			wav: 'amon_ra_die01'
		}
	],

	607: [
		{
			//EF_WINK	   Wink of Charm (Visual Effect)
			type: 'SPR',
			file: 'wink'
		}
	],

	608: [
		{
			//EF_COOKING_OK	Cooking Success
			type: 'STR',
			file: 'cook_suc',
			wav: '_heal_effect',
			attachedEntity: true
		}
	],

	609: [
		{
			//EF_COOKING_FAIL	Cooking Failed
			type: 'STR',
			file: 'cook_fail',
			wav: 'caramel_die',
			attachedEntity: true
		}
	],

	//610: [{ file: 'effect/success.bmp' }],	//EF_TEMP_OK	   Success
	//611: [{ file: 'effect/failed.bmp' }],	//EF_TEMP_FAIL	   Failed

	612: [
		{
			//EF_HAPGYEOK	Korean Words and /no1 Emoticon
			type: 'SPR',
			file: '\xc7\xd5\xb0\xdd\x5f',
			attachedEntity: true
		},
		{
			type: 'STR',
			file: 'itempokjuk',
			wav: 'effect/itempokjuk',
			attachedEntity: true
		}
	],

	613: [
		{
			//EF_THROWITEM7	   Throw Shuriken
			wav: 'effect/\xb4\xd1\xc0\xda\x5f\xb4\xf8\xc1\xf6\xb1\xe2'
		},
		{
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 200,
			fadeIn: true,
			fadeOut: true,
			file: '\xc0\xaf\xc0\xfa\xc0\xce\xc5\xcd\xc6\xe4\xc0\xcc\xbd\xba/item/\xbc\xf6\xb8\xae\xb0\xcb.bmp',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			rotate: true,
			nbOfRotation: 1,
			size: 30,
			zOffset: 1,
			zIndex: 1
		}
	],

	614: [
		{
			//EF_THROWITEM8	   Throw Kunai
			wav: 'effect/\xb4\xd1\xc0\xda\x5f\xb4\xf8\xc1\xf6\xb1\xe2'
		},
		{
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 200,
			fadeIn: true,
			fadeOut: true,
			file: '\xc0\xaf\xc0\xfa\xc0\xce\xc5\xcd\xc6\xe4\xc0\xcc\xbd\xba/item/\xc4\xed\xb3\xaa\xc0\xcc\x5f\xb5\xb6.bmp',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			rotate: true,
			nbOfRotation: 1,
			size: 30,
			zOffset: 1,
			zIndex: 1
		}
	],

	615: [
		{
			//EF_THROWITEM9	   Throw Fumma Shuriken
			wav: 'effect/\xb4\xd1\xc0\xda\x5f\xb4\xf8\xc1\xf6\xb1\xe2'
		},
		{
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 200,
			fadeIn: true,
			fadeOut: true,
			file: '\xc0\xaf\xc0\xfa\xc0\xce\xc5\xcd\xc6\xe4\xc0\xcc\xbd\xba/item/\xc7\xb3\xb8\xb6\x5f\xb3\xfa\xbf\xec.bmp',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			rotate: true,
			nbOfRotation: 1,
			size: 30,
			zOffset: 1,
			zIndex: 1
		}
	],

	616: [
		{
			//EF_THROWITEM10	   Throw Money
			wav: 'effect/\xb4\xd1\xc0\xda\x5f\xb4\xf8\xc1\xf6\xb1\xe2'
		},
		{
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 200,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/coin_a.bmp',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			rotate: true,
			nbOfRotation: 1,
			size: 20,
			zOffset: 1,
			zIndex: 1
		}
	],

	//617: [{}],	//EF_BUNSINJYUTSU	   Illusionary Shadow

	618: [
		{
			//EF_KOUENKA	   Crimson Fire Bolossom
			type: 'STR',
			file: 'firehit',
			wav: 'effect/ef_firearrow%d',
			rand: [1, 3],
			attachedEntity: true
		}
	],

	619: [
		{
			//EF_HYOUSENSOU	   Lightning Spear Of Ice
			type: 'STR',
			file: 'freeze',
			wav: 'effect/ef_icearrow%d',
			rand: [1, 3],
			attachedEntity: true
		}
	],

	//620: [{}],	//EF_BOTTOM_SUITON	   Water Escape Technique

	621: [
		{
			//EF_STIN4	   Wind Blade
			wav: 'effect/\xc7\xb3\xc0\xce'
		}
	],

	622: [
		{
			//EF_THUNDERSTORM2	   Lightning Crash
			type: 'STR',
			file: 'setsudan',
			wav: 'effect/ef_thunderstorm',
			attachedEntity: true
		}
	],

	//623: [{}],	//EF_CHEMICAL4	   Piercing Shot
	//624: [{}],	//EF_STIN5	   Kamaitachi
	//625: [{}],	//EF_MADNESS_BLUE	   Madness Canceller
	//626: [{}],	//EF_MADNESS_RED	   Adjustment

	627: [
		{
			//EF_RG_COIN3	   Disarm (Sound Effect)
			wav: 'effect/\xb5\xf0\xbd\xba\xbe\xcf'
		}
	],

	628: [
		{
			//dust	//EF_BASH3D5	   Dust
			wav: 'effect/bash3d5', // incorrect wav name
			attachedEntity: true
		},
		{
			type: 'CYLINDER',
			textureName: 'alpha_center',
			alphaMax: 0.6,
			duration: 175,
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

	629: [
		{
			//EF_CHOOKGI3	   (Nothing) - Used for spirit spheres (gunslinger classes)
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const spiritNum = Params.Init.spiritNum || 0;
				const Spheres = new SpiritSphere(Params.Init.ownerEntity, spiritNum, true);
				this.add(Spheres, Params);
			}
		}
	],

	630: [
		{
			//EF_KIRIKAGE	Shadow Slash
			type: 'SPR',
			file: '\xb1\xd7\xb8\xb2\xc0\xda\xba\xa3\xb1\xe2',
			wav: 'effect/\xb1\xd7\xb8\xb2\xc0\xda\xba\xa3\xb1\xe2',
			attachedEntity: true
		}
	],

	631: [
		{
			//reverse tatami map unit	//EF_TATAMI	Reverse Tatami Map Unit
			type: 'SPR',
			file: '\xb4\xd9\xb4\xd9\xb9\xcc\x20\xb5\xda\xc1\xfd\xb1\xe2',
			wav: 'effect/\xb4\xd9\xb4\xd9\xb9\xcc\xb5\xda\xc1\xfd\xb1\xe2',
			attachedEntity: true
		}
	],

	632: [
		{
			//EF_KASUMIKIRI	Mist Slash
			type: 'SPR',
			file: '\xbe\xc8\xb0\xb3\xba\xa3\xb1\xe2',
			wav: 'effect/\xbe\xc8\xb0\xb3\xba\xa3\xb1\xe2',
			attachedEntity: true
		}
	],

	633: [
		{
			//EF_ISSEN	Final Strike
			type: 'SPR',
			file: '\xc0\xcf\xbc\xb6',
			wav: 'effect/\xc0\xcf\xbc\xb6',
			attachedEntity: true
		}
	],

	634: [
		{
			//EF_KAEN	Crimson Fire Formation
			type: 'SPR',
			file: '\xc8\xad\xbf\xb0\xc1\xf8',
			repeat: true,
			attachedEntity: true
		},
		{
			wav: 'effect/\xc8\xad\xbf\xb0\xc1\xf8'
		}
	],

	635: [
		{
			//EF_BAKU	Dragon Fire Formation
			type: 'STR',
			file: 'fire dragon',
			wav: 'effect/\xc6\xf8\xbf\xb0\xb7\xe6',
			attachedEntity: false
		}
	],

	636: [
		{
			//EF_HYOUSYOURAKU	Falling Ice Pillar
			type: 'STR',
			file: 'icy',
			wav: 'effect/\xba\xf9\xc1\xa4\xb6\xf4',
			attachedEntity: false
		}
	],

	637: [
		{
			//EF_DESPERADO	Desperado
			type: 'SPR',
			file: '\xb5\xa5\xbd\xba\xc6\xe4\xb6\xf3\xb5\xb5',
			wav: 'effect/\xb5\xa5\xbd\xba\xc6\xe4\xb6\xf3\xb5\xb5',
			attachedEntity: true
		}
	],

	638: [
		{
			//EF_LIGHTNING_S	Ground Drift Grenade
			type: 'SPR',
			file: '\xb6\xf3\xc0\xcc\xc6\xae\xb4\xd7\xbd\xba\xc7\xc7\xbe\xee',
			attachedEntity: false
		}
	],

	639: [
		{
			//EF_BLIND_S	Ground Drift Grenade
			type: 'SPR',
			file: '\xba\xed\xb6\xf3\xc0\xce\xb5\xe5\xbd\xba\xc7\xc7\xbe\xee',
			attachedEntity: false
		}
	],

	640: [
		{
			//EF_POISON_S	Ground Drift Grenade
			type: 'SPR',
			file: '\xc6\xf7\xc0\xcc\xc1\xf0\xbd\xba\xc7\xc7\xbe\xee',
			attachedEntity: false
		}
	],

	641: [
		{
			//EF_FREEZING_S	Ground Drift Grenade
			type: 'SPR',
			file: '\xc7\xc1\xb8\xae\xc2\xa1\xbd\xba\xc7\xc7\xbe\xee',
			attachedEntity: false
		}
	],

	642: [
		{
			//EF_FLARE_S	Ground Drift Grenade
			type: 'SPR',
			file: '\xc7\xc3\xb7\xb9\xbe\xee\xbd\xba\xc7\xc7\xbe\xee',
			attachedEntity: false
		}
	],

	643: [
		{
			//EF_RAPIDSHOWER	Rapid Shower
			type: 'SPR',
			file: '\xb7\xa1\xc7\xc7\xb5\xe5\xbb\xfe\xbf\xf6',
			wav: 'effect/\xb7\xa1\xc7\xc7\xb5\xe5\xbb\xfe\xbf\xf6',
			attachedEntity: true
		}
	],

	644: [
		{
			//EF_MAGICALBULLET	Magic Bullet
			type: 'SPR',
			file: '\xb8\xc5\xc1\xf6\xc4\xc3\xba\xd2\xb8\xb4',
			wav: 'effect/\xb8\xc5\xc1\xf6\xc4\xc3\xba\xed\xb8\xb4',
			attachedEntity: true
		}
	],

	645: [
		{
			//EF_SPREADATTACK	Spread Attack
			type: 'SPR',
			file: '\xbd\xba\xc7\xc1\xb7\xb9\xb5\xe5',
			attachedEntity: true,
			direction: true
		}
	],

	646: [
		{
			//EF_TRACKCASTING	Tracking (Shown While Casting)
			type: 'STR',
			file: '\xc6\xae\xb7\xa2\xc5\xb7',
			attachedEntity: true
		}
	],

	647: [
		{
			//EF_TRACKING	Tracking
			type: 'SPR',
			file: '\xc6\xae\xb7\xa1\xc5\xb7',
			attachedEntity: true
		}
	],

	648: [
		{
			//EF_TRIPLEACTION	Triple Action
			type: 'SPR',
			file: '\xc6\xae\xb8\xae\xc7\xc3\xbe\xd7\xbc\xc7',
			wav: 'effect/\xc6\xae\xb8\xae\xc7\xc3\xbe\xd7\xbc\xc7',
			attachedEntity: true
		}
	],

	649: [
		{
			//EF_BULLSEYE	Bull's Eye
			type: 'STR',
			file: '\xba\xd2\xbd\xba\xbe\xc6\xc0\xcc', //oO1o3AAI
			attachedEntity: true
		}
	],

	//650: [{}],	//EF_MAP_MAGICZONE	   Ice Cave Level 4 Circle
	//651: [{}],	//EF_MAP_MAGICZONE2	   Ice Cave Level 4 Big Circle
	//652: [{}],	//EF_DAMAGE1	   Like Regeneration Number but Red with a Sound
	//653: [{}],	//EF_DAMAGE1_2	   Like Regeneration Number but Red
	//654: [{}],	//EF_DAMAGE1_3	   Like Regeneration Number but Purple
	//655: [{}],	//EF_UNDEADBODY	   Mobs Skill (Change Undead Element)
	//656: [{}],	//EF_UNDEADBODY_DEL	   Last animation before Change Undead Element finish
	//657: [{}],	//EF_GREEN_NUMBER	   (Nothing)
	//658: [{}],	//EF_BLUE_NUMBER	   (Nothing)
	//659: [{}],	//EF_RED_NUMBER	   (Nothing)
	//660: [{}],	//EF_PURPLE_NUMBER	   (Nothing)
	//661: [{}],	//EF_BLACK_NUMBER	   (Nothing)
	//662: [{}],	//EF_WHITE_NUMBER	   (Nothing)
	//663: [{}],	//EF_YELLOW_NUMBER	   (Nothing)
	//664: [{}],	//EF_PINK_NUMBER	   (Nothing)
	//665: [{}],	//EF_BUBBLE_DROP	   Little Blue Ball Falling From the Sky

	666: [
		{
			//Earthquake	//EF_NPC_EARTHQUAKE	Earthquake
			type: 'SPR',
			file: '\xbe\xee\xbd\xba\xc4\xf9\xc0\xcc\xc5\xa9',
			wav: 'effect/earth_quake',
			attachedEntity: true
		},
		{
			type: 'FUNC',
			attachedEntity: true,
			duplicate: 3,
			timeBetweenDupli: 35,
			func: function (Params) {
				const start = Params.Inst.startTick;
				Camera.setQuake(start);
			}
		}
	],

	//667: [{}],	//EF_DA_SPACE	   (Nothing)

	668: [
		{
			//EF_DRAGONFEAR	Dragonfear
			type: 'STR',
			file: 'dragon_h',
			wav: 'effect/dragonfear',
			attachedEntity: true
		},
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const start = Params.Inst.startTick;
				Camera.setQuake(start);
			}
		}
	],

	669: [
		{
			//wide bleeding	//EF_BLEEDING	Wide Bleeding
			type: 'STR',
			file: 'wideb',
			wav: 'effect/wideb',
			attachedEntity: true
		}
	],

	670: [
		{
			//EF_WIDECONFUSE	Dragon fear (Visual Effect)
			type: 'STR',
			file: 'dfear',
			wav: 'effect/dragonfear',
			attachedEntity: true
		}
	],

	671: [
		{
			//EF_BOTTOM_RUNNER	   The Japan Earth Symbol (like 'Seven Wind Lv1', but on the ground)
			file: 'effect/hanmoon1.tga'
		}
	],

	672: [
		{
			//EF_BOTTOM_TRANSFER	   The Japan Wind Symbol (like 'Seven Wind Lv2', but on the ground)
			file: 'effect/hanmoon2.tga'
		}
	],

	//673: [{}],	//EF_CRYSTAL_BLUE	   Map turns Blue (like Soul Link)

	674: [
		{
			// evil land
			type: 'FUNC',
			attachedEntity: false,
			//file: 'status-curse',
			func: function (Params) {
				const self = this;
				EvillandEffects.forEach(function (effect) {
					self.add(new effect(Params.Inst.position, Params.Inst.startTick), Params);
				});
			}
		}
	],

	675: [
		{
			//EF_GUARD3	   Like Parrying/Kyrie Eleison barrier but Yellow with small Cross in every barrier piece
			wav: 'effect/kyrie_guard',
			attachedEntity: true
		}
	],

	677: [
		{
			//EF_CRITICALWOUND	Critical Wounds/Bleeding Attack
			type: 'STR',
			file: 'cwound',
			attachedEntity: true
		}
	],

	//678: [{}],	//EF_GREEN99_3	   White 99 Aura Bubbles
	//679: [{}],	//EF_GREEN99_5	   Green Aura (Middle)
	//680: [{}],	//EF_GREEN99_6	   Green Aura (Bottom)
	//681: [{}],	//EF_MAPSPHERE	   Dimensional Gorge Map Effect

	682: [
		{
			//EF_POK_LOVE	   I Love You Banner
			type: 'SPR',
			file: '\xc6\xf8\xc1\xd7\x5f\xb7\xaf\xba\xea',
			attachedEntity: true
		},
		{
			type: 'STR',
			file: 'itempokjuk',
			wav: 'effect/itempokjuk',
			attachedEntity: true
		}
	],
	683: [
		{
			//EF_POK_WHITE	   Happy White Day Banner
			type: 'SPR',
			file: '\xc6\xf8\xc1\xd7\x5f\xc8\x5f\xc0\xcc\xc6\xae\xb5\xa5\xc0\xcc',
			attachedEntity: true
		},
		{
			type: 'STR',
			file: 'itempokjuk',
			wav: 'effect/itempokjuk',
			attachedEntity: true
		}
	],
	684: [
		{
			//EF_POK_VALEN	   Happy Valentine Day Banner
			type: 'SPR',
			file: '\xc6\xf8\xc1\xd7\x5f\xb9\xdf\xb7\xbb\xc5\xb8\xc0\xce',
			attachedEntity: true
		},
		{
			type: 'STR',
			file: 'itempokjuk',
			wav: 'effect/itempokjuk',
			attachedEntity: true
		}
	],
	685: [
		{
			//EF_POK_BIRTH	   Happy Birthday Banner
			type: 'SPR',
			file: '\xc6\xf8\xc1\xd7\x5f\xbb\xfd\xc0\xcf',
			attachedEntity: true
		},
		{
			type: 'STR',
			file: 'itempokjuk',
			wav: 'effect/itempokjuk',
			attachedEntity: true
		}
	],
	686: [
		{
			//EF_POK_CHRISTMAS	   Merry Christmas Banner
			type: 'SPR',
			file: '\xc6\xf8\xc1\xd7\x5f\xc5\xa9\xb8\xae\xbd\xba\xb8\xb6\xbd\xba',
			attachedEntity: true
		},
		{
			type: 'STR',
			file: 'itempokjuk',
			wav: 'effect/itempokjuk',
			attachedEntity: true
		}
	],
	//687: [{}],	//EF_MAP_MAGICZONE3	   Cast Circle-Like effect 1
	//688: [{}],	//EF_MAP_MAGICZONE4	   Cast Circle-Like effect 2
	//689: [{}],	//EF_DUST	   Endless Tower Map Effect
	//690: [{}],	//EF_TORCH_RED	   Burning Flame (Red)
	//691: [{}],	//EF_TORCH_GREEN	   Burning Flame (Green)
	//692: [{}],	//EF_MAP_GHOST	   Unknown Aura Bubbles (Small ghosts)
	//693: [{}],	//EF_GLOW1	   Translucent yellow circle
	//694: [{}],	//EF_GLOW2	   Translucent green circle
	//695: [{}],	//EF_GLOW4	   Rotating green light
	//696: [{}],	//EF_TORCH_PURPLE	   The same of 690 and 691 but Blue/Purple

	697: [
		{
			//EF_CLOUD7	   (Night Clouds [Dark Blue])
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				CloudWeatherEffect.startOrRestart(Params);
			}
		}
	],

	698: [
		{
			//EF_CLOUD8	   (Sunset Clouds [Orange])
			type: 'FUNC',
			attachedEntity: false,
			func: function (Params) {
				CloudWeatherEffect.startOrRestart(Params);
			}
		}
	],

	699: [
		{
			//EF_FLOWERLEAF	Fall of powder from the sky and raise of some leaf
			type: 'STR',
			file: 'flower_leaf',
			attachedEntity: true
		}
	]
};
