/**
 * @module DB/Effects/Table/ById/Effects1000-1099
 *
 * Effects 1000 to 1099 of the effect table, in ID order (see EffectConst.js).
 * DB/Effects/EffectTable.js joins the parts; its header lists the parameters a row takes.
 */

export default {
	1015: [
		{
			//EF_RUN_MAKE_OK
			type: 'STR',
			file: 'rune_success',
			attachedEntity: true
		}
	],

	1016: [
		{
			//EF_RUN_MAKE_FAILURE
			type: 'STR',
			file: 'rune_fail',
			attachedEntity: true
		}
	],

	1017: [
		{
			//EF_MIRESULT_MAKE_OK
			type: 'STR',
			file: 'changematerial_su',
			attachedEntity: true
		}
	],

	1018: [
		{
			//EF_MIRESULT_MAKE_FAIL
			type: 'STR',
			file: 'changematerial_fa',
			attachedEntity: true
		}
	],

	1019: [
		{
			//EF_ALL_RAY_OF_PROTECTION
			type: 'STR',
			file: 'guardian',
			attachedEntity: true
		}
	],

	1020: [
		{
			//EF_VENOMFOG
			type: 'STR',
			file: 'bubble%d_1',
			rand: [1, 4],
			attachedEntity: true
		}
	],

	1021: [
		{
			//EF_DUSTSTORM
			type: 'STR',
			file: 'dust',
			attachedEntity: true
		}
	],

	1029: [
		{
			//EF_DANCE_BLADE_ATK
			type: 'STR',
			file: 'dancingblade',
			attachedEntity: true
		}
	],

	1031: [
		{
			//EF_INVINCIBLEOFF2
			type: 'STR',
			file: 'invincibleoff2',
			attachedEntity: true
		}
	],

	1033: [
		{
			//EF_DEATHSUMMON
			type: 'STR',
			file: 'devil',
			attachedEntity: true
		}
	],

	1040: [
		{
			//EF_GC_DARKCROW
			type: 'STR',
			file: 'gc_darkcrow',
			//wav: 'effect/gc_darkcrow',
			attachedEntity: true
		}
	],

	1042: [
		{
			//EF_ALL_FULL_THROTTLE
			type: 'STR',
			file: 'all_full_throttle',
			wav: 'effect/all_full_throttle',
			attachedEntity: true
		}
	],

	1043: [
		{
			//EF_SR_FLASHCOMBO
			type: 'STR',
			file: 'sr_flashcombo',
			wav: 'effect/sr_flashcombo',
			attachedEntity: true
		}
	],

	1044: [
		{
			//EF_RK_LUXANIMA
			type: 'STR',
			file: 'rk_luxanima',
			attachedEntity: true
		}
	],

	1046: [
		{
			//EF_SO_ELEMENTAL_SHIELD
			type: 'STR',
			file: 'so_elemental_shield',
			wav: 'effect/so_elemental_shield',
			attachedEntity: true
		}
	],

	1047: [
		{
			//EF_AB_OFFERTORIUM
			type: 'STR',
			file: 'ab_offertorium',
			wav: 'effect/ab_offertorium',
			attachedEntity: true
		}
	],

	1048: [
		{
			//EF_WL_TELEKINESIS_INTENSE
			type: 'STR',
			file: 'wl_telekinesis_intense',
			wav: 'effect/wl_telekinesis_intense',
			attachedEntity: true
		}
	],

	1049: [
		{
			//EF_GN_ILLUSIONDOPING
			type: 'STR',
			file: 'gn_illusiondoping',
			wav: 'effect/gn_illusiondoping',
			attachedEntity: true
		}
	],

	1050: [
		{
			//EF_NC_MAGMA_ERUPTION
			type: 'STR',
			file: 'nc_magma_eruption',
			wav: 'effect/nc_magma_eruption',
			attachedEntity: true
		}
	],

	1055: [
		{
			//EF_NPC_CHILL
			type: 'STR',
			file: 'chill',
			attachedEntity: true
		}
	],

	1057: [
		{
			//EF_AB_OFFERTORIUM_RING
			type: 'STR',
			file: 'ab_offertorium_ring',
			attachedEntity: true
		}
	],

	1062: [
		{
			//EF_HAMMER_OF_GOD
			type: 'STR',
			file: 'stormgust',
			wav: 'effect/RL_HAMMER_OF_GOD',
			attachedEntity: true
		}
	],

	1094: [
		{
			//EF_ACH_COMPLETE
			type: 'STR',
			file: 'ach_complete/ppring3',
			texturePath: 'ach_complete/',
			attachedEntity: true
		}
	]
};
