/**
 * @module DB/Effects/Table/Jobs/Swordman/DragonKnight
 *
 * The Swordman line's DragonKnight effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Servant Weapon (DK_SERVANTWEAPON), from the client's own effect folders.
	ef_dk_servantweapon: [
		{
			type: 'STR',
			file: 'dragon_knight/dk_servantweapon/servantweapon/servantweapon',
			texturePath: 'dragon_knight/dk_servantweapon/servantweapon/',
			min: 'dragon_knight/dk_servantweapon/servantweapon/min_servantweapon',
			fallback: ['new_servantweapon/new_servantweapon/new_servantweapon'],
			wav: 'effect/dk_servantweapon'
		}
	],

	// Servant Weapon (DK_SERVANTWEAPON), from the client's own effect folders.
	ef_dk_servantweapon_cast: [
		{
			type: 'STR',
			file: 'dragon_knight/dk_servantweapon/servantweapon_cast/servantweapon_cast',
			texturePath: 'dragon_knight/dk_servantweapon/servantweapon_cast/',
			min: 'dragon_knight/dk_servantweapon/servantweapon_cast/min_servantweapon_cast',
			fallback: ['new_servantweapon/new_servantweapon_cast/new_servantweapon_cast']
		}
	],

	// Servant Weapon (DK_SERVANTWEAPON), from the client's own effect folders.
	ef_dk_servantweapon_hit: [
		{
			type: 'STR',
			file: 'dragon_knight/dk_servantweapon/servantweapon_hit/servantweapon_hit',
			texturePath: 'dragon_knight/dk_servantweapon/servantweapon_hit/',
			min: 'dragon_knight/dk_servantweapon/servantweapon_hit/min_servantweapon_hit',
			fallback: ['new_servantweapon/new_servantweapon_hit/new_servantweapon_hit']
		},
		{
			type: 'STR',
			file: 'dragon_knight/dk_servantweapon/servantweapon_hit_bottom/servantweapon_hit_bottom',
			texturePath: 'dragon_knight/dk_servantweapon/servantweapon_hit_bottom/',
			min: 'dragon_knight/dk_servantweapon/servantweapon_hit_bottom/min_servantweapon_hit_bottom',
			fallback: ['new_servantweapon/new_servantweapon_hit_bottom/new_servantweapon_hit_bottom'],
			renderBeforeEntities: true
		}
	],

	// Servant Weapon Attack (DK_SERVANTWEAPON_ATK), from the client's own effect folders.
	ef_dk_servantweapon_atk: [
		{
			type: 'STR',
			file: 'new_servantweapon/new_servantweapon_hit/new_servantweapon_hit',
			texturePath: 'new_servantweapon/new_servantweapon_hit/',
			min: 'new_servantweapon/new_servantweapon_hit/min_new_servantweapon_hit'
		},
		{
			type: 'STR',
			file: 'new_servantweapon/new_servantweapon_hit_bottom/new_servantweapon_hit_bottom',
			texturePath: 'new_servantweapon/new_servantweapon_hit_bottom/',
			min: 'new_servantweapon/new_servantweapon_hit_bottom/min_new_servantweapon_hit_bottom',
			renderBeforeEntities: true
		}
	],

	// Servant Weapon Sign (DK_SERVANT_W_SIGN), from the client's own effect folders.
	ef_dk_servant_w_sign: [
		{
			// The sign itself loops with the Servant Sign status (StatusEffectTable.js)
			wav: 'effect/dk_servant_w_sign',
			attachedEntity: true
		}
	],

	// Servant Weapon Phantom (DK_SERVANT_W_PHANTOM), from the client's own effect folders.
	ef_dk_servant_w_phantom: [
		{
			type: 'STR',
			file: 'dragon_knight/dk_servant_w_phantom/servant_phantom_sub/servant_phantom_sub',
			texturePath: 'dragon_knight/dk_servant_w_phantom/servant_phantom_sub/',
			min: 'dragon_knight/dk_servant_w_phantom/servant_phantom_sub/min_servant_phantom_sub',
			fallback: ['servant_phantom/servant_phantom_sub/servant_phantom_sub'],
			wav: 'effect/dk_servant_w_phantom'
		},
		{
			type: 'STR',
			file: 'dragon_knight/dk_servant_w_phantom/servant_phantom_sub_bottom/servant_phantom_sub_bottom',
			texturePath: 'dragon_knight/dk_servant_w_phantom/servant_phantom_sub_bottom/',
			min: 'dragon_knight/dk_servant_w_phantom/servant_phantom_sub_bottom/min_servant_phantom_sub_bottom',
			fallback: ['servant_phantom/servant_phantom_sub_bottom/servant_phantom_sub_bottom'],
			renderBeforeEntities: true
		}
	],

	// Servant Weapon Demolition (DK_SERVANT_W_DEMOL), from the client's own effect folders.
	ef_dk_servant_w_demol_hit: [
		{
			type: 'STR',
			file: 'dragon_knight/dk_servant_w_demol/servant_demolition_hit/servant_demolition_hit',
			texturePath: 'dragon_knight/dk_servant_w_demol/servant_demolition_hit/',
			min: 'dragon_knight/dk_servant_w_demol/servant_demolition_hit/min_servant_demolition_hit',
			fallback: ['servant_demolition/servant_demolition_hit/servant_demolition_hit'],
			wav: 'effect/dk_servant_w_demol'
		}
	],

	// Charging Pierce (DK_CHARGINGPIERCE), from the client's own effect folders.
	ef_dk_chargingpierce_cast: [
		{
			type: 'STR',
			file: 'dragon_knight/dk_chargingpierce/chargingpierce_cast/chargingpierce_cast',
			texturePath: 'dragon_knight/dk_chargingpierce/chargingpierce_cast/',
			fallback: ['new_chargingpierce/new_chargingpierce_cast/new_chargingpierce_cast'],
			wav: 'effect/dk_chargingpierce1'
		},
		{
			type: 'STR',
			file: 'dragon_knight/dk_chargingpierce/chargingpierce_cast_bottom/chargingpierce_cast_bottom',
			texturePath: 'dragon_knight/dk_chargingpierce/chargingpierce_cast_bottom/',
			fallback: ['new_chargingpierce/new_chargingpierce_cast_bottom/new_chargingpierce_cast_bottom'],
			renderBeforeEntities: true
		}
	],

	// Charging Pierce (DK_CHARGINGPIERCE), from the client's own effect folders.
	ef_dk_chargingpierce_hit: [
		{
			type: 'STR',
			file: 'dragon_knight/dk_chargingpierce/chargingpierce_hit/chargingpierce_hit',
			texturePath: 'dragon_knight/dk_chargingpierce/chargingpierce_hit/',
			fallback: ['new_chargingpierce/new_chargingpierce_hit/new_chargingpierce_hit'],
			wav: 'effect/dk_chargingpierce2'
		}
	],

	// Hack And Slasher (DK_HACKANDSLASHER), from the client's own effect folders.
	ef_dk_hackandslasher: [
		{
			type: 'STR',
			file: 'dragon_knight/dk_hackandslasher/hackandslash/hackandslash',
			texturePath: 'dragon_knight/dk_hackandslasher/hackandslash/',
			min: 'dragon_knight/dk_hackandslasher/hackandslash/min_hackandslash',
			fallback: ['hackandslash/hackandslash/hackandslash'],
			wav: 'effect/dk_hackandslasher'
		},
		{
			type: 'STR',
			file: 'dragon_knight/dk_hackandslasher/hackandslash_bottom/hackandslash_bottom',
			texturePath: 'dragon_knight/dk_hackandslasher/hackandslash_bottom/',
			min: 'dragon_knight/dk_hackandslasher/hackandslash_bottom/min_hackandslash_bottom',
			fallback: ['hackandslash/hackandslash_bottom/hackandslash_bottom'],
			renderBeforeEntities: true
		}
	],

	// Hack And Slasher (DK_HACKANDSLASHER), from the client's own effect folders.
	ef_dk_hackandslasher_hit: [
		{
			type: 'STR',
			file: 'dragon_knight/dk_hackandslasher/hackandslash_hit/hackandslash_hit',
			texturePath: 'dragon_knight/dk_hackandslasher/hackandslash_hit/',
			min: 'dragon_knight/dk_hackandslasher/hackandslash_hit/min_hackandslash_hit',
			fallback: ['hackandslash/hackandslash_hit/hackandslash_hit']
		}
	],

	// Hack And Slasher Attack (DK_HACKANDSLASHER_ATK), from the client's own effect folders.
	ef_dk_hackandslasher_atk: [
		{
			type: 'STR',
			file: 'hackandslash/hackandslash_hit/hackandslash_hit',
			texturePath: 'hackandslash/hackandslash_hit/',
			min: 'hackandslash/hackandslash_hit/min_hackandslash_hit'
		}
	],

	// Dragonic Aura (DK_DRAGONIC_AURA), from the client's own effect folders.
	ef_dk_dragonic_aura: [
		{
			wav: 'effect/dk_dragonic_aura1',
			attachedEntity: true
		}
	],

	// Madness Crusher (DK_MADNESS_CRUSHER), from the client's own effect folders.
	ef_dk_madness_crusher: [
		{
			type: 'STR',
			file: 'dragon_knight/dk_madness_crusher/madness_crusher/madness_crusher',
			texturePath: 'dragon_knight/dk_madness_crusher/madness_crusher/',
			min: 'dragon_knight/dk_madness_crusher/madness_crusher/min_madness_crusher',
			fallback: ['madness_crusher/madness_crusher/madness_crusher'],
			wav: 'effect/dk_madness_crusher'
		},
		{
			type: 'STR',
			file: 'dragon_knight/dk_madness_crusher/madness_crusher_bottom/madness_crusher_bottom',
			texturePath: 'dragon_knight/dk_madness_crusher/madness_crusher_bottom/',
			min: 'dragon_knight/dk_madness_crusher/madness_crusher_bottom/min_madness_crusher_bottom',
			fallback: ['madness_crusher/madness_crusher_bottom/madness_crusher_bottom'],
			renderBeforeEntities: true
		}
	],

	// Vigor (DK_VIGOR), from the client's own effect folders.
	ef_dk_vigor: [
		{
			// The buff itself loops with the Vigor status (StatusEffectTable.js)
			wav: 'effect/dk_vigor',
			attachedEntity: true
		}
	],

	// Vigor (DK_VIGOR), from the client's own effect folders.
	ef_dk_vigor_cast: [
		{
			type: 'STR',
			file: 'dragon_knight/dk_vigor/vigor_cast/vigor_cast',
			texturePath: 'dragon_knight/dk_vigor/vigor_cast/',
			min: 'dragon_knight/dk_vigor/vigor_cast/min_vigor_cast',
			fallback: ['vigor/vigor_cast/vigor_cast']
		}
	],

	// Storm Slash (DK_STORMSLASH), from the client's own effect folders.
	ef_dk_stormslash_hit: [
		{
			type: 'STR',
			file: 'dragon_knight/dk_stormslash/stormslash/stormslash_%d',
			min: 'dragon_knight/dk_stormslash/stormslash/min_stormslash_%d',
			rand: [1, 5],
			texturePath: 'dragon_knight/dk_stormslash/stormslash/',
			fallback: ['stormslash/stormslash/stormslash_%d'],
			wav: 'effect/dk_stormslash1'
		}
	],

	// Dragonic Breath (DK_DRAGONIC_BREATH), from the client's own effect folders.
	ef_dk_dragonic_breath: [
		{
			type: 'STR',
			file: 'dragon_knight/dragonic_breath/dragonic_breath/dragonic_breath',
			texturePath: 'dragon_knight/dragonic_breath/dragonic_breath/',
			min: 'dragon_knight/dragonic_breath/dragonic_breath/min_dragonic_breath',
			wav: 'effect/dk_dragonic_breath'
		},
		{
			type: 'STR',
			file: 'dragon_knight/dragonic_breath/dragonic_breath_bottom/dragonic_breath_bottom',
			texturePath: 'dragon_knight/dragonic_breath/dragonic_breath_bottom/',
			min: 'dragon_knight/dragonic_breath/dragonic_breath_bottom/min_dragonic_breath_bottom',
			renderBeforeEntities: true
		}
	],

	// Dragonic Breath (DK_DRAGONIC_BREATH), from the client's own effect folders.
	ef_dk_dragonic_breath_hit: [
		{
			type: 'STR',
			file: 'dragon_knight/dragonic_breath/dragonic_breath_hit/dragonic_breath_hit',
			texturePath: 'dragon_knight/dragonic_breath/dragonic_breath_hit/',
			min: 'dragon_knight/dragonic_breath/dragonic_breath_hit/min_dragonic_breath_hit'
		}
	],

	// Dragonic Pierce (DK_DRAGONIC_PIERCE), from the client's own effect folders.
	ef_dk_dragonic_pierce: [
		{
			type: 'STR',
			file: 'dragon_knight/dk_dragonic_pierce/dragonic_pierce_bottom/dragonic_pierce_bottom',
			texturePath: 'dragon_knight/dk_dragonic_pierce/dragonic_pierce_bottom/',
			min: 'dragon_knight/dk_dragonic_pierce/dragonic_pierce_bottom/min_dragonic_pierce_bottom',
			renderBeforeEntities: true,
			wav: 'effect/dk_dragonic_pierce'
		}
	],

	// Dragonic Pierce (DK_DRAGONIC_PIERCE), from the client's own effect folders.
	ef_dk_dragonic_pierce_cast: [
		{
			type: 'STR',
			file: 'dragon_knight/dk_dragonic_pierce/dragonic_pierce_cast/dragonic_pierce_cast',
			texturePath: 'dragon_knight/dk_dragonic_pierce/dragonic_pierce_cast/',
			min: 'dragon_knight/dk_dragonic_pierce/dragonic_pierce_cast/min_dragonic_pierce_cast'
		}
	],

	// Dragonic Pierce (DK_DRAGONIC_PIERCE), from the client's own effect folders.
	ef_dk_dragonic_pierce_hit: [
		{
			type: 'STR',
			file: 'dragon_knight/dk_dragonic_pierce/dragonic_pierce_hit/dragonic_pierce_hit',
			texturePath: 'dragon_knight/dk_dragonic_pierce/dragonic_pierce_hit/',
			min: 'dragon_knight/dk_dragonic_pierce/dragonic_pierce_hit/min_dragonic_pierce_hit'
		},
		{
			type: 'STR',
			file: 'dragon_knight/dk_dragonic_pierce/dragonic_pierce_hit_bottom/dragonic_pierce_hit_bottom',
			texturePath: 'dragon_knight/dk_dragonic_pierce/dragonic_pierce_hit_bottom/',
			min: 'dragon_knight/dk_dragonic_pierce/dragonic_pierce_hit_bottom/min_dragonic_pierce_hit_bottom',
			renderBeforeEntities: true
		}
	]
};
