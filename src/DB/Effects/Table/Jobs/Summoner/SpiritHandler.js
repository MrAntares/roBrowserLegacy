/**
 * @module DB/Effects/Table/Jobs/Summoner/SpiritHandler
 *
 * The Summoner line's SpiritHandler effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Chulho Sonic Claw (SH_CHUL_HO_SONIC_CLAW), from the client's own effect folders.
	ef_sh_chul_ho_sonic_claw: [
		{
			type: 'STR',
			file: 'spirit_handler/sh_chul_ho_sonic_claw/chul_ho_sonic_claw/chul_ho_sonic_claw',
			texturePath: 'spirit_handler/sh_chul_ho_sonic_claw/chul_ho_sonic_claw/',
			min: 'spirit_handler/sh_chul_ho_sonic_claw/chul_ho_sonic_claw/min_chul_ho_sonic_claw',
			wav: 'effect/spirit_handler/sh_chul_ho_sonic_claw'
		}
	],

	// Howling of Chulho (SH_HOWLING_OF_CHUL_HO), from the client's own effect folders.
	ef_sh_howling_of_chul_ho: [
		{
			type: 'STR',
			file: 'spirit_handler/sh_howling_of_chul_ho/howling_of_chul_ho/howling_of_chul_ho',
			texturePath: 'spirit_handler/sh_howling_of_chul_ho/howling_of_chul_ho/',
			min: 'spirit_handler/sh_howling_of_chul_ho/howling_of_chul_ho/min_howling_of_chul_ho',
			wav: 'effect/spirit_handler/sh_howling_of_chul_ho'
		}
	],

	// Hogogong Strike (SH_HOGOGONG_STRIKE), from the client's own effect folders.
	ef_sh_hogogong_strike: [
		{
			type: 'STR',
			file: 'spirit_handler/sh_hogogong_strike/hogogong_strike',
			texturePath: 'spirit_handler/sh_hogogong_strike/',
			min: 'spirit_handler/sh_hogogong_strike/min_hogogong_strike',
			wav: 'effect/spirit_handler/sh_hogogong_strike'
		}
	],

	// Kisul Water Spraying (SH_KI_SUL_WATER_SPRAYING), from the client's own effect folders.
	ef_sh_ki_sul_water_spraying: [
		{
			type: 'STR',
			file: 'spirit_handler/sh_ki_sul_water_spraying/ki_sul_water_spraying',
			texturePath: 'spirit_handler/sh_ki_sul_water_spraying/',
			min: 'spirit_handler/sh_ki_sul_water_spraying/min_ki_sul_water_spraying',
			wav: 'effect/spirit_handler/sh_ki_sul_water_spraying'
		}
	],

	// Marine Festival of Kisul (SH_MARINE_FESTIVAL_OF_KI_SUL), from the client's own effect folders.
	ef_sh_marine_festival_of_ki_sul: [
		{
			type: 'STR',
			file: 'spirit_handler/sh_marine_festival_of_ki_sul/marine_festival_of_ki_sul/marine_festival_of_ki_sul',
			texturePath: 'spirit_handler/sh_marine_festival_of_ki_sul/marine_festival_of_ki_sul/',
			min: 'spirit_handler/sh_marine_festival_of_ki_sul/marine_festival_of_ki_sul/min_marine_festival_of_ki_sul',
			wav: 'effect/spirit_handler/sh_marine_festival_of_ki_sul'
		},
		{
			type: 'STR',
			file: 'spirit_handler/sh_marine_festival_of_ki_sul/marine_festival_of_ki_sul_bottom/marine_festival_of_ki_sul_bottom',
			texturePath: 'spirit_handler/sh_marine_festival_of_ki_sul/marine_festival_of_ki_sul_bottom/',
			min: 'spirit_handler/sh_marine_festival_of_ki_sul/marine_festival_of_ki_sul_bottom/min_marine_festival_of_ki_sul_bottom',
			renderBeforeEntities: true
		}
	],

	// Sandy Festival of Kisul (SH_SANDY_FESTIVAL_OF_KI_SUL), from the client's own effect folders.
	ef_sh_sandy_festival_of_ki_sul: [
		{
			type: 'STR',
			file: 'spirit_handler/sh_sandy_festival_of_ki_sul/sandy_festival_of_ki_sul/sandy_festival_of_ki_sul',
			texturePath: 'spirit_handler/sh_sandy_festival_of_ki_sul/sandy_festival_of_ki_sul/',
			min: 'spirit_handler/sh_sandy_festival_of_ki_sul/sandy_festival_of_ki_sul/min_sandy_festival_of_ki_sul',
			wav: 'effect/spirit_handler/sh_sandy_festival_of_ki_sul'
		},
		{
			type: 'STR',
			file: 'spirit_handler/sh_sandy_festival_of_ki_sul/sandy_festival_of_ki_sul_bottom/sandy_festival_of_ki_sul_bottom',
			texturePath: 'spirit_handler/sh_sandy_festival_of_ki_sul/sandy_festival_of_ki_sul_bottom/',
			min: 'spirit_handler/sh_sandy_festival_of_ki_sul/sandy_festival_of_ki_sul_bottom/min_sandy_festival_of_ki_sul_bottom',
			renderBeforeEntities: true
		}
	],

	// Kisul Rampage (SH_KI_SUL_RAMPAGE), from the client's own effect folders.
	ef_sh_ki_sul_rampage: [
		{
			type: 'STR',
			file: 'spirit_handler/sh_ki_sul_rampage/ki_sul_rampage/ki_sul_rampage',
			texturePath: 'spirit_handler/sh_ki_sul_rampage/ki_sul_rampage/',
			min: 'spirit_handler/sh_ki_sul_rampage/ki_sul_rampage/min_ki_sul_rampage',
			wav: 'effect/spirit_handler/sh_ki_sul_rampage'
		},
		{
			type: 'STR',
			file: 'spirit_handler/sh_ki_sul_rampage/ki_sul_rampage_bottom/ki_sul_rampage_bottom',
			texturePath: 'spirit_handler/sh_ki_sul_rampage/ki_sul_rampage_bottom/',
			min: 'spirit_handler/sh_ki_sul_rampage/ki_sul_rampage_bottom/min_ki_sul_rampage_bottom',
			renderBeforeEntities: true
		}
	],

	// Colors of Hyunrok (SH_COLORS_OF_HYUN_ROK), from the client's own effect folders.
	ef_sh_colors_of_hyun_rok: [
		{
			type: 'STR',
			file: 'spirit_handler/sh_colors_of_hyun_rok/colors_of_hyun_rok_fire/colors_of_hyun_rok_fire',
			texturePath: 'spirit_handler/sh_colors_of_hyun_rok/colors_of_hyun_rok_fire/',
			min: 'spirit_handler/sh_colors_of_hyun_rok/colors_of_hyun_rok_fire/min_colors_of_hyun_rok_fire',
			wav: 'effect/spirit_handler/sh_colors_of_hyun_rok'
		}
	],
	// Drawn once where the unit appears when the client has no ez2streffect.bson
	// (SkillUnitFallback in SkillUnit.js)
	ef_sh_hyun_roks_breeze: [
		{
			type: 'STR',
			file: 'spirit_handler/sh_hyun_roks_breeze/hyun_roks_breeze/hyun_roks_breeze',
			texturePath: 'spirit_handler/sh_hyun_roks_breeze/hyun_roks_breeze/',
			min: 'spirit_handler/sh_hyun_roks_breeze/hyun_roks_breeze/min_hyun_roks_breeze',
			wav: 'effect/spirit_handler/sh_hyun_roks_breeze'
		},
		{
			type: 'STR',
			file: 'spirit_handler/sh_hyun_roks_breeze/hyun_roks_breeze_bottom/hyun_roks_breeze_bottom',
			texturePath: 'spirit_handler/sh_hyun_roks_breeze/hyun_roks_breeze_bottom/',
			min: 'spirit_handler/sh_hyun_roks_breeze/hyun_roks_breeze_bottom/min_hyun_roks_breeze_bottom',
			renderBeforeEntities: true
		}
	],

	// Hyunrok Cannon (SH_HYUN_ROK_CANNON), from the client's own effect folders.
	ef_sh_hyun_rok_cannon: [
		{
			type: 'STR',
			file: 'spirit_handler/skid_sh_hyun_rok_cannon/hyun_rok_cannon',
			texturePath: 'spirit_handler/skid_sh_hyun_rok_cannon/',
			min: 'spirit_handler/skid_sh_hyun_rok_cannon/min_hyun_rok_cannon',
			wav: 'effect/spirit_handler/sh_hyun_rok_cannon'
		}
	],

	// Temporary Communion (SH_TEMPORARY_COMMUNION), from the client's own effect folders.
	ef_sh_temporary_communion: [
		{
			type: 'STR',
			file: 'spirit_handler/sh_temporary_communion/temporary_communion/temporary_communion',
			texturePath: 'spirit_handler/sh_temporary_communion/temporary_communion/',
			min: 'spirit_handler/sh_temporary_communion/temporary_communion/min_temporary_communion',
			wav: 'effect/spirit_handler/sh_temporary_communion'
		}
	],

	// Blessing of Mystical Creatures (SH_BLESSING_OF_MYSTICAL_CREATURES), from the client's own effect folders.
	ef_sh_blessing_of_mystical_creatures: [
		{
			type: 'STR',
			file: 'spirit_handler/sh_blessing_of_mystical_creatures/blessing_of_mystical_creatures',
			texturePath: 'spirit_handler/sh_blessing_of_mystical_creatures/',
			min: 'spirit_handler/sh_blessing_of_mystical_creatures/min_blessing_of_mystical_creatures',
			wav: 'effect/spirit_handler/sh_blessing_of_mystical_creatures'
		}
	],

	// Chulho Battering (SH_CHUL_HO_BATTERING), from the client's own effect folders.
	ef_sh_chul_ho_battering: [
		{
			type: 'STR',
			file: 'spirit_handler/sh_chul_ho_battering/chul_ho_battering/chul_ho_battering',
			texturePath: 'spirit_handler/sh_chul_ho_battering/chul_ho_battering/',
			min: 'spirit_handler/sh_chul_ho_battering/chul_ho_battering/min_chul_ho_battering',
			wav: 'effect/spirit_handler/sh_chul_ho_battering'
		},
		{
			type: 'STR',
			file: 'spirit_handler/sh_chul_ho_battering/chul_ho_battering_bottom/chul_ho_battering_bottom',
			texturePath: 'spirit_handler/sh_chul_ho_battering/chul_ho_battering_bottom/',
			min: 'spirit_handler/sh_chul_ho_battering/chul_ho_battering_bottom/min_chul_ho_battering_bottom',
			renderBeforeEntities: true
		}
	],

	// Chulho Battering (SH_CHUL_HO_BATTERING), from the client's own effect folders.
	ef_sh_chul_ho_battering_cast: [
		{
			type: 'STR',
			castLoop: true,
			attachedEntity: true,
			file: 'spirit_handler/sh_chul_ho_battering/chul_ho_battering_cast/chul_ho_battering_cast',
			texturePath: 'spirit_handler/sh_chul_ho_battering/chul_ho_battering_cast/',
			min: 'spirit_handler/sh_chul_ho_battering/chul_ho_battering_cast/min_chul_ho_battering_cast',
			wav: 'effect/ef_beginspell',
			yOffset: 10
		}
	],

	// Chulho Battering (SH_CHUL_HO_BATTERING), from the client's own effect folders.
	ef_sh_chul_ho_battering_hit: [
		{
			type: 'STR',
			file: 'spirit_handler/sh_chul_ho_battering/chul_ho_battering_hit/chul_ho_battering_hit',
			texturePath: 'spirit_handler/sh_chul_ho_battering/chul_ho_battering_hit/',
			min: 'spirit_handler/sh_chul_ho_battering/chul_ho_battering_hit/min_chul_ho_battering_hit'
		}
	],

	// Hyunrok Spirit Power (SH_HYUN_ROK_SPIRIT_POWER), from the client's own effect folders.
	ef_sh_hyun_rok_spirit_power: [
		{
			type: 'STR',
			file: 'spirit_handler/sh_hyun_rok_spirit_power/hyun_rok_spirit_power/hyun_rok_spirit_power',
			texturePath: 'spirit_handler/sh_hyun_rok_spirit_power/hyun_rok_spirit_power/',
			min: 'spirit_handler/sh_hyun_rok_spirit_power/hyun_rok_spirit_power/min_hyun_rok_spirit_power',
			wav: 'effect/spirit_handler/sh_hyun_rok_spirit_power'
		},
		{
			type: 'STR',
			file: 'spirit_handler/sh_hyun_rok_spirit_power/hyun_rok_spirit_power_bottom/hyun_rok_spirit_power_bottom',
			texturePath: 'spirit_handler/sh_hyun_rok_spirit_power/hyun_rok_spirit_power_bottom/',
			min: 'spirit_handler/sh_hyun_rok_spirit_power/hyun_rok_spirit_power_bottom/min_hyun_rok_spirit_power_bottom',
			renderBeforeEntities: true
		}
	],

	// Hyunrok Spirit Power (SH_HYUN_ROK_SPIRIT_POWER), from the client's own effect folders.
	ef_sh_hyun_rok_spirit_power_cast: [
		{
			type: 'STR',
			castLoop: true,
			attachedEntity: true,
			file: 'spirit_handler/sh_hyun_rok_spirit_power/hyun_rok_spirit_power_cast/hyun_rok_spirit_power_cast',
			texturePath: 'spirit_handler/sh_hyun_rok_spirit_power/hyun_rok_spirit_power_cast/',
			min: 'spirit_handler/sh_hyun_rok_spirit_power/hyun_rok_spirit_power_cast/min_hyun_rok_spirit_power_cast',
			wav: 'effect/ef_beginspell',
			yOffset: 10
		},
		{
			type: 'STR',
			castLoop: true,
			attachedEntity: true,
			file: 'spirit_handler/sh_hyun_rok_spirit_power/hyun_rok_spirit_power_cast_bottom/hyun_rok_spirit_power_cast_bottom',
			texturePath: 'spirit_handler/sh_hyun_rok_spirit_power/hyun_rok_spirit_power_cast_bottom/',
			min: 'spirit_handler/sh_hyun_rok_spirit_power/hyun_rok_spirit_power_cast_bottom/min_hyun_rok_spirit_power_cast_bottom',
			renderBeforeEntities: true,
			yOffset: 10
		}
	],

	// Hyunrok Spirit Power (SH_HYUN_ROK_SPIRIT_POWER), from the client's own effect folders.
	ef_sh_hyun_rok_spirit_power_hit: [
		{
			type: 'STR',
			file: 'spirit_handler/sh_hyun_rok_spirit_power/hyun_rok_spirit_power_hit/hyun_rok_spirit_power_hit',
			texturePath: 'spirit_handler/sh_hyun_rok_spirit_power/hyun_rok_spirit_power_hit/',
			min: 'spirit_handler/sh_hyun_rok_spirit_power/hyun_rok_spirit_power_hit/min_hyun_rok_spirit_power_hit'
		}
	]
};
