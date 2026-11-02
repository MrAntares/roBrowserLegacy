/**
 * @module DB/Effects/Table/Jobs/Acolyte/Sura
 *
 * The Acolyte line's Sura effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

import Events from 'Core/Events.js';

export default {
	ef_crescentelbow: [
		{
			wav: 'effect/sr_crescentelbow',
			attachedEntity: true
		}
	],

	ef_cursedcircle: [
		{
			wav: 'effect/sr_cursedcircle',
			attachedEntity: true
		}
	],

	ef_dragoncombo: [
		{
			wav: 'effect/sr_dragoncombo',
			attachedEntity: true
		}
	],

	ef_fallenempire: [
		{
			wav: 'effect/sr_fallenempire',
			attachedEntity: true
		}
	],

	ef_gateofhell: [
		{
			wav: 'effect/sr_gateofhell',
			attachedEntity: true
		}
	],

	ef_howlingoflion: [
		{
			wav: 'effect/sr_howlingoflion',
			attachedEntity: true
		}
	],

	ef_knucklearrow: [
		{
			wav: 'effect/sr_knucklearrow',
			attachedEntity: true
		}
	],

	ef_lightningwalk: [
		{
			wav: 'effect/sr_lightningwalk',
			attachedEntity: true
		}
	],

	ef_powervelocity: [
		{
			wav: 'effect/sr_powervelocity',
			attachedEntity: true
		}
	],

	ef_raisingdragon: [
		{
			wav: 'effect/sr_raisingdragon',
			attachedEntity: true
		}
	],

	ef_rampageblaster: [
		{
			wav: 'effect/sr_rampageblaster',
			attachedEntity: true
		}
	],

	ef_rideinlightning: [
		{
			wav: 'effect/sr_rideinlightning',
			attachedEntity: true
		}
	],

	ef_skynetblow: [
		{
			wav: 'effect/sr_skynetblow',
			attachedEntity: true
		}
	],

	ef_tigercannon: [
		{
			wav: 'effect/sr_tigercannon',
			attachedEntity: true
		}
	],

	ef_windmill: [
		{
			wav: 'effect/sr_windmill',
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

	// Fallen Empire (SR_FALLENEMPIRE), from the client's own effect folders.
	ef_sr_fallenempire: [
		{
			type: 'STR',
			file: 'new_fallenempire/new_fallenempire/new_fallenempire',
			texturePath: 'new_fallenempire/new_fallenempire/',
			wav: 'effect/sr_fallenempire'
		},
		{
			type: 'STR',
			file: 'new_fallenempire/new_fallenempire_bottom/new_fallenempire_bottom',
			texturePath: 'new_fallenempire/new_fallenempire_bottom/',
			renderBeforeEntities: true
		}
	],

	// Fallen Empire (SR_FALLENEMPIRE), from the client's own effect folders.
	ef_sr_fallenempire_hit: [
		{
			type: 'STR',
			file: 'new_fallenempire/new_fallenempire_hit/new_fallenempire_hit',
			texturePath: 'new_fallenempire/new_fallenempire_hit/'
		}
	],

	// Tiger Cannon (SR_TIGERCANNON), from the client's own effect folders.
	ef_sr_tigercannon: [
		{
			type: 'STR',
			file: 'new_tigercannon/new_tigercannon',
			texturePath: 'new_tigercannon/',
			wav: 'effect/sr_tigercannon'
		}
	],

	// Rampage Blaster (SR_RAMPAGEBLASTER), from the client's own effect folders.
	ef_sr_rampageblaster: [
		{
			type: 'STR',
			file: 'new_rampageblaster/new_rampageblaster/new_rampageblaster',
			texturePath: 'new_rampageblaster/new_rampageblaster/',
			wav: 'effect/sr_rampageblaster'
		},
		{
			type: 'STR',
			file: 'new_rampageblaster/new_rampageblaster_bottom/new_rampageblaster_bottom',
			texturePath: 'new_rampageblaster/new_rampageblaster_bottom/',
			renderBeforeEntities: true
		}
	],

	// Lightning Walk (SR_LIGHTNINGWALK), from the client's own effect folders.
	ef_sr_lightningwalk: [
		{
			type: 'STR',
			file: 'lightning',
			texturePath: '',
			wav: 'effect/sr_lightningwalk'
		}
	],

	// Gate of Hell (SR_GATEOFHELL), from the client's own effect folders.
	ef_sr_gateofhell_cast: [
		{
			type: 'STR',
			file: 'new_gateofhell/new_gateofhell_cast/new_gateofhell_cast',
			texturePath: 'new_gateofhell/new_gateofhell_cast/',
			wav: 'effect/sr_gateofhell'
		}
	],

	// Howling of Lion (SR_HOWLINGOFLION), from the client's own effect folders.
	ef_sr_howlingoflion: [
		{
			type: 'STR',
			file: 'new_howlingoflion/new_howlingoflion/new_howlingoflion',
			texturePath: 'new_howlingoflion/new_howlingoflion/',
			wav: 'effect/sr_howlingoflion'
		},
		{
			type: 'STR',
			file: 'new_howlingoflion/new_howlingoflion_bottom/new_howlingoflion_bottom',
			texturePath: 'new_howlingoflion/new_howlingoflion_bottom/',
			renderBeforeEntities: true
		}
	],

	// Howling of Lion (SR_HOWLINGOFLION), from the client's own effect folders.
	ef_sr_howlingoflion_cast: [
		{
			type: 'STR',
			file: 'new_howlingoflion/new_howlingoflion_cast/new_howlingoflion_cast',
			texturePath: 'new_howlingoflion/new_howlingoflion_cast/'
		},
		{
			type: 'STR',
			file: 'new_howlingoflion/new_howlingoflion_cast_bottom/new_howlingoflion_cast_bottom',
			texturePath: 'new_howlingoflion/new_howlingoflion_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Howling of Lion (SR_HOWLINGOFLION), from the client's own effect folders.
	ef_sr_howlingoflion_hit: [
		{
			type: 'STR',
			file: 'new_howlingoflion/new_howlingoflion_hit/new_howlingoflion_hit',
			texturePath: 'new_howlingoflion/new_howlingoflion_hit/'
		}
	]
};
