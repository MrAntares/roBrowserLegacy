/**
 * @module DB/Effects/Table/Jobs/Swordman/RoyalGuard
 *
 * The Swordman line's RoyalGuard effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

import Events from 'Core/Events.js';

export default {
	ef_banishingpoint: [
		{
			wav: 'effect/lg_banishingpoint',
			attachedEntity: true
		}
	],

	ef_cannonspear: [
		{
			wav: 'effect/lg_cannonspear',
			attachedEntity: true
		}
	],

	ef_earthdrive: [
		{
			wav: 'effect/lg_earthdrive',
			attachedEntity: true
		}
	],

	ef_exceedbreak: [
		{
			wav: 'effect/lg_exceedbreak',
			attachedEntity: true
		}
	],

	ef_hesperuslit: [
		{
			wav: 'effect/lg_hesperuslit',
			attachedEntity: true
		}
	],

	ef_kings_grace: [
		{
			wav: 'effect/lg_kings_grace',
			attachedEntity: true
		}
	],

	ef_moonslasher: [
		{
			wav: 'effect/lg_moonslasher',
			attachedEntity: true
		},
		{
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

	ef_overbrand: [
		{
			wav: 'effect/lg_overbrand',
			attachedEntity: true
		}
	],

	ef_piety: [
		{
			wav: 'effect/lg_piety',
			attachedEntity: true
		}
	],

	ef_pinpointattack: [
		{
			wav: 'effect/lg_pinpointattack',
			attachedEntity: true
		}
	],

	ef_rageburst: [
		{
			wav: 'effect/lg_rageburst',
			attachedEntity: true
		}
	],

	ef_rayofgenesis: [
		{
			wav: 'effect/lg_rayofgenesis',
			attachedEntity: true
		}
	],

	ef_reflectdamage: [
		{
			wav: 'effect/lg_reflectdamage',
			attachedEntity: true
		}
	],

	ef_shieldspell: [
		{
			wav: 'effect/lg_shieldspell',
			attachedEntity: true
		}
	],

	ef_trample: [
		{
			wav: 'effect/lg_trample',
			attachedEntity: true
		}
	],

	// Cannon Spear (LG_CANNONSPEAR), from the client's own effect folders.
	ef_lg_cannonspear: [
		{
			type: 'STR',
			file: 'new_cannon_spear/new_cannon_spear_bottom/new_cannon_spear_bottom',
			texturePath: 'new_cannon_spear/new_cannon_spear_bottom/',
			renderBeforeEntities: true,
			wav: 'effect/lg_cannonspear'
		}
	],

	// Banishing Point (LG_BANISHINGPOINT), from the client's own effect folders.
	ef_lg_banishingpoint_cast: [
		{
			type: 'STR',
			file: 'new_banishingpoint/new_banishingpoint_cast/new_banishingpoint_cast',
			texturePath: 'new_banishingpoint/new_banishingpoint_cast/',
			wav: 'effect/lg_banishingpoint'
		},
		{
			type: 'STR',
			file: 'new_banishingpoint/new_banishingpoint_cast_bottom/new_banishingpoint_cast_bottom',
			texturePath: 'new_banishingpoint/new_banishingpoint_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Over Brand (LG_OVERBRAND), from the client's own effect folders.
	ef_lg_overbrand_cast: [
		{
			type: 'STR',
			file: 'new_overbrand/new_overbrand_cast/new_overbrand_cast',
			texturePath: 'new_overbrand/new_overbrand_cast/',
			wav: 'effect/lg_overbrand'
		},
		{
			type: 'STR',
			file: 'new_overbrand/new_overbrand_cast_bottom/new_overbrand_cast_bottom',
			texturePath: 'new_overbrand/new_overbrand_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Over Brand (LG_OVERBRAND), from the client's own effect folders.
	ef_lg_overbrand_hit: [
		{
			type: 'STR',
			file: 'new_overbrand/new_overbrand_hit/new_overbrand_hit',
			texturePath: 'new_overbrand/new_overbrand_hit/'
		}
	],

	// Ray of Genesis (LG_RAYOFGENESIS), from the client's own effect folders.
	ef_lg_rayofgenesis: [
		{
			type: 'STR',
			file: 'new_rayofgenesis/new_rayofgenesis/new_rayofgenesis',
			texturePath: 'new_rayofgenesis/new_rayofgenesis/',
			wav: 'effect/lg_rayofgenesis'
		}
	],

	// Ray of Genesis (LG_RAYOFGENESIS), from the client's own effect folders.
	ef_lg_rayofgenesis_cast: [
		{
			type: 'STR',
			file: 'new_rayofgenesis/new_rayofgenesis_cast/new_rayofgenesis_cast',
			texturePath: 'new_rayofgenesis/new_rayofgenesis_cast/'
		},
		{
			type: 'STR',
			file: 'new_rayofgenesis/new_rayofgenesis_cast_bottom/new_rayofgenesis_cast_bottom',
			texturePath: 'new_rayofgenesis/new_rayofgenesis_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Ray of Genesis (LG_RAYOFGENESIS), from the client's own effect folders.
	ef_lg_rayofgenesis_hit: [
		{
			type: 'STR',
			file: 'new_rayofgenesis/new_rayofgenesis_hit/new_rayofgenesis_hit',
			texturePath: 'new_rayofgenesis/new_rayofgenesis_hit/'
		}
	],

	// Earth Drive (LG_EARTHDRIVE), from the client's own effect folders.
	ef_lg_earthdrive: [
		{
			type: 'STR',
			file: 'new_earthdrive/new_earthdrive/new_earthdrive',
			texturePath: 'new_earthdrive/new_earthdrive/',
			wav: 'effect/lg_earthdrive'
		},
		{
			type: 'STR',
			file: 'new_earthdrive/new_earthdrive_bottom/new_earthdrive_bottom',
			texturePath: 'new_earthdrive/new_earthdrive_bottom/',
			renderBeforeEntities: true
		}
	],

	// Overbrand Brandish (LG_OVERBRAND_BRANDISH), from the client's own effect folders.
	ef_lg_overbrand_brandish_cast: [
		{
			type: 'STR',
			file: 'new_overbrand/new_overbrand_cast/new_overbrand_cast',
			texturePath: 'new_overbrand/new_overbrand_cast/'
		},
		{
			type: 'STR',
			file: 'new_overbrand/new_overbrand_cast_bottom/new_overbrand_cast_bottom',
			texturePath: 'new_overbrand/new_overbrand_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Overbrand Brandish (LG_OVERBRAND_BRANDISH), from the client's own effect folders.
	ef_lg_overbrand_brandish_hit: [
		{
			type: 'STR',
			file: 'new_overbrand/new_overbrand_hit/new_overbrand_hit',
			texturePath: 'new_overbrand/new_overbrand_hit/'
		}
	],

	// Overbrand Plus Attack (LG_OVERBRAND_PLUSATK), from the client's own effect folders.
	ef_lg_overbrand_plusatk_cast: [
		{
			type: 'STR',
			file: 'new_overbrand/new_overbrand_cast/new_overbrand_cast',
			texturePath: 'new_overbrand/new_overbrand_cast/'
		},
		{
			type: 'STR',
			file: 'new_overbrand/new_overbrand_cast_bottom/new_overbrand_cast_bottom',
			texturePath: 'new_overbrand/new_overbrand_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Overbrand Plus Attack (LG_OVERBRAND_PLUSATK), from the client's own effect folders.
	ef_lg_overbrand_plusatk_hit: [
		{
			type: 'STR',
			file: 'new_overbrand/new_overbrand_hit/new_overbrand_hit',
			texturePath: 'new_overbrand/new_overbrand_hit/'
		}
	]
};
