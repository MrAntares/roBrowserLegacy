/**
 * @module DB/Effects/Table/Common/Named
 *
 * The effect table's named rows that belong to no single class: monster attacks, projectiles,
 * traps, shared looks. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

import Camera from 'Renderer/Camera.js';
import CastCircle from 'Renderer/Effects/CastCircle.js';
import { arrowShowerEffects } from 'DB/Effects/ArrowShowerEffects.js';
import { arrowFlightBetween } from 'Renderer/Effects/ArrowFlight.js';
import WarlockSphere from 'Renderer/Effects/WarlockSphere.js';

export default {
	soulink_target_effect: [
		{
			// todo
			wav: 'effect/\x74\x5f\xbf\xb5\xc8\xa5', //t_żµČĄ
			attachedEntity: true
		}
	],

	ef_coldbolt: [
		{
			//coldbolt falling objects
			type: '3D',
			alphaMax: 1,
			angle: 112.5,
			duration: 500,
			file: 'effect/icearrow.tga',
			posxEnd: 0,
			posxStartRandMiddle: 5,
			posxStartRand: 1,
			posyEnd: 0,
			posyStartRandMiddle: 2,
			posyStartRand: 1,
			poszEnd: 0,
			poszStart: 20,
			size: 50,
			zIndex: 1,
			wav: 'effect/ef_icearrow%d',
			rand: [1, 3],
			attachedEntity: true
		},
		{
			type: 'CYLINDER',
			alphaMax: 0.7,
			animation: 4,
			attachedEntity: false,
			bottomSize: 3,
			duration: 1000,
			delayLate: 500,
			fade: true,
			height: 0.1,
			rotate: true,
			textureName: 'ring_blue',
			topSize: 5
		}
	],

	ef_firebolt: [
		{
			//firebolt falling objects
			type: '3D',
			alphaMax: 1,
			blendMode: 2,
			angle: 112.5,
			duration: 500,
			fileList: [
				'effect/\xba\xd2\xc8\xad\xbb\xec1.tga',
				'effect/\xba\xd2\xc8\xad\xbb\xec2.tga',
				'effect/\xba\xd2\xc8\xad\xbb\xec3.tga',
				'effect/\xba\xd2\xc8\xad\xbb\xec4.tga',
				'effect/\xba\xd2\xc8\xad\xbb\xec5.tga',
				'effect/\xba\xd2\xc8\xad\xbb\xec6.tga'
				//,'effect/\xba\xd2\xc8\xad\xbb\xec7.tga' //Not used officially
				//,'effect/\xba\xd2\xc8\xad\xbb\xec8.tga'
			],
			frameDelay: 30,
			posxEnd: 0,
			posxStartRandMiddle: 5,
			posxStartRand: 1,
			posyEnd: 0,
			posyStartRandMiddle: 2,
			posyStartRand: 1,
			poszEnd: 0,
			poszStart: 20,
			sizeX: 100,
			sizeY: 50,
			zIndex: 1,
			wav: 'effect/ef_firearrow%d',
			rand: [1, 3],
			attachedEntity: true
		}
	],

	white_pulse: [
		{
			//type: 'FUNC',
			attachedEntity: true
		}
	],

	yellow_pulse: [
		{
			//type: 'FUNC',
			attachedEntity: true
		}
	],

	black_pulse: [
		{
			//type: 'FUNC',
			attachedEntity: true
		}
	],

	enemy_hit_normal1: [
		{
			wav: '_enemy_hit_normal1',
			attachedEntity: true
		}
	],

	ef_hit2_sound: [
		{
			wav: 'effect/ef_hit2',
			attachedEntity: true
		}
	],

	ef_firebreath: [
		{
			wav: 'effect/ef_firewall',
			attachedEntity: true
		}
	],

	ef_arrow_projectile: [
		{
			// effect to show the arrow projectile (normal attack or skill with arrow projectile)
			// Official flight: 8 frames of 24 ms, shorter under 8 cells (ArrowFlight.js)
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: Params => arrowFlightBetween(Params.Inst.otherPosition, Params.Inst.position),
			fadeIn: true,
			fadeOut: true,
			absoluteSpriteName: 'data/sprite/npc/skel_archer_arrow',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			size: 100,
			zOffset: 1,
			zIndex: 1
		}
	],

	// Arrow Shower (AC_SHOWER): the client's arrows to the cells around a point, ArrowShowerEffects.js.
	...arrowShowerEffects(),

	ef_shield_projectile: [
		{
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 140,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/shield_boomerang.bmp',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			rotate: true,
			nbOfRotation: 1,
			size: 50,
			zOffset: 1,
			zIndex: 1
		}
	],

	ef_tomahawk_projectile: [
		{
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 140,
			fadeIn: true,
			fadeOut: true,
			file: 'effect/\xc5\xe4\xb8\xb6.bmp',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			rotate: true,
			nbOfRotation: 1,
			size: 50,
			zOffset: 1,
			zIndex: 1
		}
	],

	ef_parasite_projectile: [
		{
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 140,
			fadeIn: true,
			fadeOut: true,
			spriteName: '../npc/parasite_bullet',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			size: 100,
			zOffset: 1,
			zIndex: 1
		}
	],

	ef_stone_shooter_projectile: [
		{
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 140,
			fadeIn: true,
			fadeOut: true,
			spriteName: '../npc/stone_shooter_bullet',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			size: 100,
			zOffset: 1,
			zIndex: 1
		}
	],

	ef_wootan_shooter_projectile: [
		{
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 140,
			fadeIn: true,
			fadeOut: true,
			spriteName: '../npc/wootan_shooter_bullet',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			size: 100,
			zOffset: 1,
			zIndex: 1
		}
	],

	ef_peach_tree_projectile: [
		{
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 140,
			fadeIn: true,
			fadeOut: true,
			spriteName: '../npc/peach_tree_bullet',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			size: 100,
			zOffset: 1,
			zIndex: 1
		}
	],

	ef_hermit_projectile: [
		{
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 140,
			fadeIn: true,
			fadeOut: true,
			spriteName: '../npc/ginseng_bullet',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			size: 100,
			zOffset: 1,
			zIndex: 1
		}
	],

	ef_canon_projectile: [
		{
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 140,
			fadeIn: true,
			fadeOut: true,
			spriteName: '../npc/canon_bullet',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			size: 100,
			zOffset: 1,
			zIndex: 1
		}
	],

	ef_canon1_projectile: [
		{
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 140,
			fadeIn: true,
			fadeOut: true,
			spriteName: '../npc/canon_bullet_1',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			size: 100,
			zOffset: 1,
			zIndex: 1
		}
	],

	ef_canon2_projectile: [
		{
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 140,
			fadeIn: true,
			fadeOut: true,
			spriteName: '../npc/canon_bullet_2',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			size: 100,
			zOffset: 1,
			zIndex: 1
		}
	],

	ef_canon3_projectile: [
		{
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 140,
			fadeIn: true,
			fadeOut: true,
			spriteName: '../npc/canon_bullet_3',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			size: 100,
			zOffset: 1,
			zIndex: 1
		}
	],

	ef_tanee_projectile: [
		{
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 140,
			fadeIn: true,
			fadeOut: true,
			spriteName: '../npc/lady_tanee_bullet',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			size: 100,
			zOffset: 1,
			zIndex: 1
		}
	],

	ef_ragged_projectile: [
		{
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 140,
			fadeIn: true,
			fadeOut: true,
			spriteName: '../npc/ragged_zombie_bullet',
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			size: 100,
			zOffset: 1,
			zIndex: 1
		}
	],

	ef_mandragora_attack: [
		{
			type: 'SPR',
			file: '../npc/mandragora_atk',
			attachedEntity: false
		}
	],

	ef_hydra_attack: [
		{
			type: 'SPR',
			file: '../npc/hydra_atk',
			attachedEntity: false
		}
	],

	ef_odium_attack: [
		{
			type: 'SPR',
			file: '../npc/tha_odium_ef',
			attachedEntity: false
		}
	],

	ef_drosera_attack: [
		{
			type: 'SPR',
			file: '../npc/drosera_bullet',
			attachedEntity: false
		}
	],

	ef_mavka_attack: [
		{
			type: 'SPR',
			file: '../npc/mavka_bullet',
			attachedEntity: false
		}
	],

	ef_entweihen_attack: [
		{
			type: 'SPR',
			file: '../npc/entweihen_bullet',
			attachedEntity: false
		}
	],

	ef_c_marker2: [
		{
			type: '2D',
			file: 'effect/RL_C_MAKER/ome.bmp',
			blendMode: 2,
			alphaMax: 0.8,
			duration: 500,
			posz: 5,
			sizeStart: 50,
			sizeEnd: 100,
			attachedEntity: true
		},
		{
			type: '2D',
			file: 'effect/RL_C_MAKER/ome.bmp',
			blendMode: 2,
			alphaMax: 0.8,
			delayOffset: 500,
			duration: 500,
			posz: 5,
			sizeStart: 100,
			sizeEnd: 50,
			attachedEntity: true
		}
	],

	temporary_warlock_sphere: [
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const entity = Params.Init.ownerEntity;
				const spheres = [];
				if (entity.Summon1) {
					spheres.push(entity.Summon1);
				}
				if (entity.Summon2) {
					spheres.push(entity.Summon2);
				}
				if (entity.Summon3) {
					spheres.push(entity.Summon3);
				}
				if (entity.Summon4) {
					spheres.push(entity.Summon4);
				}
				if (entity.Summon5) {
					spheres.push(entity.Summon5);
				}

				const wl_spheres = new WarlockSphere(entity, spheres);

				this.add(wl_spheres, Params);
			}
		}
	],

	quake: [
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const start = Params.Inst.startTick;
				Camera.setQuake(start);
			}
		}
	],

	quake_magnum: [
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const start = Params.Inst.startTick;
				const duration = 50;
				Camera.setQuake(start, duration);
			}
		}
	],

	ef_oldtrap_default: [
		{
			type: 'SPR',
			file: '\xb1\xe2\xba\xbb\xc6\xae\xb7\xa6',
			attachedEntity: true
		}
	],

	ef_oldtrap_yellow: [
		{
			type: 'SPR',
			file: '\xb4\xe3\xc8\xb2\xbb\xf6\xc6\xae\xb7\xa6',
			attachedEntity: true
		}
	],

	ef_oldtrap_blue: [
		{
			type: 'SPR',
			file: '\xbe\xcf\xc3\xbb\xbb\xf6\xc6\xae\xb7\xa6',
			attachedEntity: true
		}
	],

	ef_oldtrap_red: [
		{
			type: 'SPR',
			file: '\xc0\xda\xc8\xab\xbb\xf6\xc6\xae\xb7\xa6',
			attachedEntity: true
		}
	],

	ef_oldtrap_green: [
		{
			type: 'SPR',
			file: '\xc3\xbb\xb7\xcf\xbb\xf6\xc6\xae\xb7\xa6',
			attachedEntity: true
		}
	],

	ef_trap_01: [
		{
			type: 'RSM',
			file: '\xbf\xdc\xba\xce\xbc\xd2\xc7\xb0\x5c\xc6\xae\xb7\xa601',
			attachedEntity: true
		}
	],

	ef_trap_02: [
		{
			type: 'RSM',
			file: '\xbf\xdc\xba\xce\xbc\xd2\xc7\xb0\x5c\xc6\xae\xb7\xa602',
			attachedEntity: true
		}
	],

	ef_trap_03: [
		{
			type: 'RSM',
			file: '\xbf\xdc\xba\xce\xbc\xd2\xc7\xb0\x5c\xc6\xae\xb7\xa603',
			attachedEntity: true
		}
	],

	ef_trap_03_2: [
		{
			type: 'RSM',
			file: '\xbf\xdc\xba\xce\xbc\xd2\xc7\xb0\x5c\xc6\xae\xb7\xa603_2',
			attachedEntity: true
		}
	],

	ef_trap_03_3: [
		{
			type: 'RSM',
			file: '\xbf\xdc\xba\xce\xbc\xd2\xc7\xb0\x5c\xc6\xae\xb7\xa603_3',
			attachedEntity: true
		}
	],

	ef_trap_03_4: [
		{
			type: 'RSM',
			file: '\xbf\xdc\xba\xce\xbc\xd2\xc7\xb0\x5c\xc6\xae\xb7\xa603_4',
			attachedEntity: true
		}
	],

	ef_trap_03_5: [
		{
			type: 'RSM',
			file: '\xbf\xdc\xba\xce\xbc\xd2\xc7\xb0\x5c\xc6\xae\xb7\xa603_5',
			attachedEntity: true
		}
	],

	ef_trap_03_6: [
		{
			type: 'RSM',
			file: '\xbf\xdc\xba\xce\xbc\xd2\xc7\xb0\x5c\xc6\xae\xb7\xa603_6',
			attachedEntity: true
		}
	],

	ef_trap_04: [
		{
			type: 'RSM',
			file: '\xbf\xdc\xba\xce\xbc\xd2\xc7\xb0\x5c\xc6\xae\xb7\xa604',
			attachedEntity: true
		}
	],

	ef_trap_05: [
		{
			type: 'RSM',
			file: '\xbf\xdc\xba\xce\xbc\xd2\xc7\xb0\x5c\xc6\xae\xb7\xa605',
			attachedEntity: true
		}
	],

	ef_trap_3_thorn: [
		{
			type: 'RSM',
			file: 'event/3\xc2\xf7\xc6\xae\xb7\xa6_\xb0\xa1\xbd\xc301',
			attachedEntity: true
		}
	],

	ef_trap_3_cobalt: [
		{
			type: 'RSM',
			file: 'event/3\xc2\xf7\xc6\xae\xb7\xa6_\xba\xaf\xbc\xf601',
			attachedEntity: true
		}
	],

	ef_trap_3_maze: [
		{
			type: 'RSM',
			file: 'event/3\xc2\xf7\xc6\xae\xb7\xa6_\xba\xaf\xc1\xf601',
			attachedEntity: true
		}
	],

	ef_trap_3_verdure: [
		{
			type: 'RSM',
			file: 'event/3\xc2\xf7\xc6\xae\xb7\xa6_\xba\xaf\xc7\xb301',
			attachedEntity: true
		}
	],

	ef_trap_3_magenta: [
		{
			type: 'RSM',
			file: 'event/3\xc2\xf7\xc6\xae\xb7\xa6_\xba\xaf\xc8\xad01',
			attachedEntity: true
		}
	],

	ef_trap_3_ice: [
		{
			type: 'RSM',
			file: 'event/3\xc2\xf7\xc6\xae\xb7\xa6_\xbc\xf601',
			attachedEntity: true
		}
	],

	ef_trap_3_cluster: [
		{
			type: 'RSM',
			file: 'event/3\xc2\xf7\xc6\xae\xb7\xa6_\xc1\xf601',
			attachedEntity: true
		}
	],

	ef_trap_3_shock: [
		{
			type: 'RSM',
			file: 'event/3\xc2\xf7\xc6\xae\xb7\xa6_\xc7\xb301',
			attachedEntity: true
		}
	],

	ef_trap_3_fire: [
		{
			type: 'RSM',
			file: 'event/3\xc2\xf7\xc6\xae\xb7\xa6_\xc8\xad01',
			attachedEntity: true
		}
	],

	ef_: [
		{
			wav: 'effect/',
			attachedEntity: true
		}
	],

	ef_cast_circle_red: [
		{
			// Effect 55: tinted circle, ring_yellow.tga, mode 1 (reddish, additive)
			type: 'FUNC',
			attachedEntity: true,
			castLoop: true,
			wav: 'effect/ef_beginspell',
			func: function (Params) {
				this.add(
					new CastCircle(
						Params.Init.ownerEntity.position,
						Params.Inst.startTick,
						Params.Init.duration,
						'ring_yellow.tga',
						1
					),
					Params
				);
			}
		}
	]
};
