/**
 * @module DB/Effects/Table/Jobs/Novice/HyperNovice
 *
 * The Novice line's HyperNovice effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

import CastCircle from 'Renderer/Effects/CastCircle.js';

export default {
	// Double Bowling Bash (HN_DOUBLEBOWLINGBASH), from the client's own effect folders.
	ef_hn_doublebowlingbash: [
		{
			type: 'STR',
			file: 'hyper_novice/hn_doublebowlingbash/double_bowlingbash',
			texturePath: 'hyper_novice/hn_doublebowlingbash/',
			wav: 'effect/hyper_novice/hn_double_bowlingbash'
		}
	],

	// Mega Sonic Blow (HN_MEGA_SONIC_BLOW), from the client's own effect folders.
	ef_hn_mega_sonic_blow: [
		{
			type: 'STR',
			file: 'hyper_novice/hn_mega_sonic_blow/mega_sonic_blow',
			texturePath: 'hyper_novice/hn_mega_sonic_blow/',
			wav: 'effect/hyper_novice/hn_mega_sonic_blow'
		}
	],

	// Shield Chain Rush (HN_SHIELD_CHAIN_RUSH), from the client's own effect folders.
	ef_hn_shield_chain_rush: [
		{
			type: 'STR',
			file: 'hyper_novice/hn_shield_chain_rush/shield_chain_rush',
			texturePath: 'hyper_novice/hn_shield_chain_rush/',
			wav: 'effect/hyper_novice/hn_shield_chain_rush'
		}
	],

	// Spiral Pierce Max (HN_SPIRAL_PIERCE_MAX), from the client's own effect folders.
	ef_hn_spiral_pierce_max: [
		{
			type: 'STR',
			file: 'hyper_novice/hn_spiral_pierce_max/spiral_pierce_max',
			texturePath: 'hyper_novice/hn_spiral_pierce_max/',
			wav: 'effect/hyper_novice/hn_spiral_pierce_max'
		}
	],

	// Meteor Storm Buster (HN_METEOR_STORM_BUSTER), from the client's own effect folders.
	ef_hn_meteor_storm_buster: [
		{
			type: 'STR',
			file: 'hyper_novice/hn_meteor_storm_buster/meteor_storm_buster',
			texturePath: 'hyper_novice/hn_meteor_storm_buster/',
			wav: 'effect/hyper_novice/hn_meteor_storm_buster'
		},
		{
			type: 'STR',
			file: 'hyper_novice/hn_meteor_storm_buster/meteor_storm_buster_bottom',
			texturePath: 'hyper_novice/hn_meteor_storm_buster/',
			renderBeforeEntities: true
		}
	],

	// Jupitel Thunderstorm (HN_JUPITEL_THUNDER_STORM), from the client's own effect folders.
	ef_hn_jupitel_thunder_storm: [
		{
			type: 'STR',
			file: 'hyper_novice/hn_jupitel_thunder_storm/jupitel_thunder_storm_ball/jupitel_thunder_storm_ball',
			texturePath: 'hyper_novice/hn_jupitel_thunder_storm/jupitel_thunder_storm_ball/'
		}
	],
	// Drawn once where the unit appears when the client has no ez2streffect.bson
	// (SkillUnitFallback in SkillUnit.js)
	ef_hn_jack_frost_nova: [
		{
			type: 'STR',
			file: 'hyper_novice/hn_jack_frost_nova/jack_frost_nova_end/jack_frost_nova_end',
			texturePath: 'hyper_novice/hn_jack_frost_nova/jack_frost_nova_end/',
			wav: 'effect/hyper_novice/hn_jack_frost_nova'
		}
	],

	// Hell's Drive (HN_HELLS_DRIVE), from the client's own effect folders.
	ef_hn_hells_drive: [
		{
			type: 'STR',
			file: 'hyper_novice/hn_hells_drive/hells_drive_bottom',
			texturePath: 'hyper_novice/hn_hells_drive/',
			renderBeforeEntities: true
		}
	],
	// Drawn once where the unit appears when the client has no ez2streffect.bson
	// (SkillUnitFallback in SkillUnit.js)
	ef_hn_ground_gravitation: [
		{
			type: 'STR',
			file: 'hyper_novice/hn_ground_gravitation/ground_gravitation_loop',
			texturePath: 'hyper_novice/hn_ground_gravitation/',
			wav: 'effect/hyper_novice/hn_ground_gravitation'
		}
	],

	// Napalm Vulcan Strike (HN_NAPALM_VULCAN_STRIKE), from the client's own effect folders.
	ef_hn_napalm_vulcan_strike: [
		{
			type: 'STR',
			file: 'hyper_novice/hn_napalm_vulcan_strike/napalm_vulcan_strike',
			texturePath: 'hyper_novice/hn_napalm_vulcan_strike/',
			wav: 'effect/hyper_novice/hn_napalm_vulcan_strike'
		}
	],

	// Breaking Limit (HN_BREAKINGLIMIT), from the client's own effect folders.
	ef_hn_breakinglimit: [
		{
			type: 'STR',
			file: 'hyper_novice/hn_breakinglimit/breakinglimit/breakinglimit',
			texturePath: 'hyper_novice/hn_breakinglimit/breakinglimit/',
			wav: 'effect/hyper_novice/hn_breakinglimit'
		}
	],

	// Rule Break (HN_RULEBREAK), from the client's own effect folders.
	ef_hn_rulebreak: [
		{
			type: 'STR',
			file: 'hyper_novice/hn_rulebreak/rulebreak/rulebreak',
			texturePath: 'hyper_novice/hn_rulebreak/rulebreak/',
			wav: 'effect/hyper_novice/hn_rulebreak'
		}
	],

	// Overcoming Crisis (HN_OVERCOMING_CRISIS), from the client's own effect folders.
	ef_hn_overcoming_crisis: [
		{
			type: 'STR',
			file: 'hyper_novice/hn_overcoming_crisis/overcoming_crisis/overcoming_crisis',
			texturePath: 'hyper_novice/hn_overcoming_crisis/overcoming_crisis/',
			min: 'hyper_novice/hn_overcoming_crisis/overcoming_crisis/min_overcoming_crisis',
			wav: 'effect/hyper_novice/hn_overcoming_crisis'
		},
		{
			type: 'STR',
			file: 'hyper_novice/hn_overcoming_crisis/overcoming_crisis_bottom/overcoming_crisis_bottom',
			texturePath: 'hyper_novice/hn_overcoming_crisis/overcoming_crisis_bottom/',
			min: 'hyper_novice/hn_overcoming_crisis/overcoming_crisis_bottom/min_overcoming_crisis_bottom',
			renderBeforeEntities: true
		}
	],

	ef_cast_circle_yellow: [
		{
			// Effect 57: tinted circle, ring_yellow.tga, mode 0 (white, normal blending)
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
						0
					),
					Params
				);
			}
		}
	]
};
