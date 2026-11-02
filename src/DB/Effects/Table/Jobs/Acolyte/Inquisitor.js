/**
 * @module DB/Effects/Table/Jobs/Acolyte/Inquisitor
 *
 * The Acolyte line's Inquisitor effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Powerful Faith (IQ_POWERFUL_FAITH), from the client's own effect folders.
	ef_iq_powerful_faith: [
		{
			type: 'STR',
			file: 'powerfulfaith/powerfulfaith/powerfulfaith',
			texturePath: 'powerfulfaith/powerfulfaith/',
			min: 'powerfulfaith/powerfulfaith/min_powerfulfaith'
		}
	],

	// Firm Faith (IQ_FIRM_FAITH), from the client's own effect folders.
	ef_iq_firm_faith: [
		{
			type: 'STR',
			file: 'firmfaith/firmfaith/firmfaith',
			texturePath: 'firmfaith/firmfaith/',
			min: 'firmfaith/firmfaith/min_firmfaith'
		}
	],

	// Oleum Sanctum (IQ_OLEUM_SANCTUM), from the client's own effect folders.
	ef_iq_oleum_sanctum: [
		{
			type: 'STR',
			file: '4ig_oleumsanctum/oleumsanctum/oleumsanctum',
			texturePath: '4ig_oleumsanctum/oleumsanctum/',
			min: '4ig_oleumsanctum/oleumsanctum/min_oleumsanctum',
			wav: 'effect/iq_oleum_sanctum'
		},
		{
			type: 'STR',
			file: '4ig_oleumsanctum/oleumsanctum_bottom/oleumsanctum_bottom',
			texturePath: '4ig_oleumsanctum/oleumsanctum_bottom/',
			min: '4ig_oleumsanctum/oleumsanctum_bottom/min_oleumsanctum_bottom',
			renderBeforeEntities: true
		}
	],

	// Oleum Sanctum (IQ_OLEUM_SANCTUM), from the client's own effect folders.
	ef_iq_oleum_sanctum_hit: [
		{
			type: 'STR',
			file: '4ig_oleumsanctum/oleumsanctum_hit/oleumsanctum_hit',
			texturePath: '4ig_oleumsanctum/oleumsanctum_hit/',
			min: '4ig_oleumsanctum/oleumsanctum_hit/min_oleumsanctum_hit'
		}
	],

	// Sincere Faith (IQ_SINCERE_FAITH), from the client's own effect folders.
	ef_iq_sincere_faith: [
		{
			type: 'STR',
			file: 'sincerefaith/sincerefaith/sincerefaith',
			texturePath: 'sincerefaith/sincerefaith/',
			min: 'sincerefaith/sincerefaith/min_sincerefaith'
		},
		{
			type: 'STR',
			file: 'sincerefaith/sincerefaith_bottom/sincerefaith_bottom',
			texturePath: 'sincerefaith/sincerefaith_bottom/',
			min: 'sincerefaith/sincerefaith_bottom/min_sincerefaith_bottom',
			renderBeforeEntities: true
		}
	],

	// Massive Flame Blaster (IQ_MASSIVE_F_BLASTER), from the client's own effect folders.
	ef_iq_massive_f_blaster: [
		{
			type: 'STR',
			file: '4iq_massivefblaster/massivefblaster/massivefblaster',
			texturePath: '4iq_massivefblaster/massivefblaster/',
			min: '4iq_massivefblaster/massivefblaster/min_massivefblaster',
			wav: 'effect/iq_massive_f_blaster'
		}
	],

	// Massive Flame Blaster (IQ_MASSIVE_F_BLASTER), from the client's own effect folders.
	ef_iq_massive_f_blaster_hit: [
		{
			type: 'STR',
			file: '4iq_massivefblaster/massivefblaster_hit/massivefblaster_hit',
			texturePath: '4iq_massivefblaster/massivefblaster_hit/',
			min: '4iq_massivefblaster/massivefblaster_hit/min_massivefblaster_hit'
		},
		{
			type: 'STR',
			file: '4iq_massivefblaster/massivefblaster_hit_bottom/massivefblaster_hit_bottom',
			texturePath: '4iq_massivefblaster/massivefblaster_hit_bottom/',
			min: '4iq_massivefblaster/massivefblaster_hit_bottom/min_massivefblaster_hit_bottom',
			renderBeforeEntities: true
		}
	],

	// Explosion Blaster (IQ_EXPOSION_BLASTER), from the client's own effect folders.
	ef_iq_exposion_blaster: [
		{
			type: 'STR',
			file: '4ig_explosionblaster/explosionblaster/explosionblaster',
			texturePath: '4ig_explosionblaster/explosionblaster/',
			min: '4ig_explosionblaster/explosionblaster/min_explosionblaster',
			wav: 'effect/iq_exposion_blaster'
		},
		{
			type: 'STR',
			file: '4ig_explosionblaster/explosionblaster_bottom/explosionblaster_bottom',
			texturePath: '4ig_explosionblaster/explosionblaster_bottom/',
			min: '4ig_explosionblaster/explosionblaster_bottom/min_explosionblaster_bottom',
			renderBeforeEntities: true
		}
	],

	// Explosion Blaster (IQ_EXPOSION_BLASTER), from the client's own effect folders.
	ef_iq_exposion_blaster_hit: [
		{
			type: 'STR',
			file: '4ig_explosionblaster/explosionblaster_hit/explosionblaster_hit',
			texturePath: '4ig_explosionblaster/explosionblaster_hit/',
			min: '4ig_explosionblaster/explosionblaster_hit/min_explosionblaster_hit'
		}
	],

	// First Brand (IQ_FIRST_BRAND), from the client's own effect folders.
	ef_iq_first_brand: [
		{
			type: 'STR',
			file: '4ig_firstbrand/firstbrand/firstbrand',
			texturePath: '4ig_firstbrand/firstbrand/',
			min: '4ig_firstbrand/firstbrand/min_firstbrand',
			wav: 'effect/iq_first_brand'
		}
	],

	// First Brand (IQ_FIRST_BRAND), from the client's own effect folders.
	ef_iq_first_brand_hit: [
		{
			type: 'STR',
			file: '4ig_firstbrand/firstbrand_hit/firstbrand_hit',
			texturePath: '4ig_firstbrand/firstbrand_hit/',
			min: '4ig_firstbrand/firstbrand_hit/min_firstbrand_hit'
		}
	],

	// First Faith Power (IQ_FIRST_FAITH_POWER), from the client's own effect folders.
	ef_iq_first_faith_power: [
		{
			type: 'STR',
			file: '4ig_firstfaithpower/firstfaithpower/firstfaithpower',
			texturePath: '4ig_firstfaithpower/firstfaithpower/',
			min: '4ig_firstfaithpower/firstfaithpower/min_firstfaithpower',
			wav: 'effect/iq_first_faith_power'
		}
	],

	// First Faith Power (IQ_FIRST_FAITH_POWER), from the client's own effect folders.
	ef_iq_first_faith_power_cast: [
		{
			type: 'STR',
			file: '4ig_firstfaithpower/firstfaithpower_cast/firstfaithpower_cast',
			texturePath: '4ig_firstfaithpower/firstfaithpower_cast/',
			min: '4ig_firstfaithpower/firstfaithpower_cast/min_firstfaithpower_cast'
		}
	],

	// Judge (IQ_JUDGE), from the client's own effect folders.
	ef_iq_judge: [
		{
			type: 'STR',
			file: '4ig_judge/judge/judge',
			texturePath: '4ig_judge/judge/',
			min: '4ig_judge/judge/min_judge',
			wav: 'effect/iq_judge'
		}
	],

	// Judge (IQ_JUDGE), from the client's own effect folders.
	ef_iq_judge_cast: [
		{
			type: 'STR',
			file: '4ig_judge/judge_cast/judge_cast',
			texturePath: '4ig_judge/judge_cast/',
			min: '4ig_judge/judge_cast/min_judge_cast'
		}
	],

	// Second Flame (IQ_SECOND_FLAME), from the client's own effect folders.
	ef_iq_second_flame: [
		{
			type: 'STR',
			file: '4iq_secondflame/secondflame/secondflame',
			texturePath: '4iq_secondflame/secondflame/',
			min: '4iq_secondflame/secondflame/min_secondflame',
			wav: 'effect/iq_second_flame'
		},
		{
			type: 'STR',
			file: '4iq_secondflame/secondflame_bottom/secondflame_bottom',
			texturePath: '4iq_secondflame/secondflame_bottom/',
			min: '4iq_secondflame/secondflame_bottom/min_secondflame_bottom',
			renderBeforeEntities: true
		}
	],

	// Second Faith (IQ_SECOND_FAITH), from the client's own effect folders.
	ef_iq_second_faith: [
		{
			wav: 'effect/iq_second_faith',
			attachedEntity: true
		}
	],

	// Second Judgement (IQ_SECOND_JUDGEMENT), from the client's own effect folders.
	ef_iq_second_judgement: [
		{
			type: 'STR',
			file: '4iq_secondjudgement/secondjudgement/secondjudgement',
			texturePath: '4iq_secondjudgement/secondjudgement/',
			min: '4iq_secondjudgement/secondjudgement/min_secondjudgement',
			wav: 'effect/iq_second_judgement'
		}
	],

	// Third Punish (IQ_THIRD_PUNISH), from the client's own effect folders.
	ef_iq_third_punish: [
		{
			type: 'STR',
			file: '4iq_thirdpunish/thirdpunish/thirdpunish',
			texturePath: '4iq_thirdpunish/thirdpunish/',
			min: '4iq_thirdpunish/thirdpunish/min_thirdpunish',
			wav: 'effect/iq_third_punish'
		},
		{
			type: 'STR',
			file: '4iq_thirdpunish/thirdpunish_bottom/thirdpunish_bottom',
			texturePath: '4iq_thirdpunish/thirdpunish_bottom/',
			min: '4iq_thirdpunish/thirdpunish_bottom/min_thirdpunish_bottom',
			renderBeforeEntities: true
		}
	],

	// Third Flame Bomb (IQ_THIRD_FLAME_BOMB), from the client's own effect folders.
	ef_iq_third_flame_bomb: [
		{
			type: 'STR',
			file: '4iq_thirdflamebomb/thirdflamebomb/thirdflamebomb',
			texturePath: '4iq_thirdflamebomb/thirdflamebomb/',
			min: '4iq_thirdflamebomb/thirdflamebomb/min_thirdflamebomb',
			wav: 'effect/iq_third_flame_bomb'
		},
		{
			type: 'STR',
			file: '4iq_thirdflamebomb/thirdflamebomb_bottom/thirdflamebomb_bottom',
			texturePath: '4iq_thirdflamebomb/thirdflamebomb_bottom/',
			min: '4iq_thirdflamebomb/thirdflamebomb_bottom/min_thirdflamebomb_bottom',
			renderBeforeEntities: true
		}
	],

	// Third Consecration (IQ_THIRD_CONSECRATION), from the client's own effect folders.
	ef_iq_third_consecration: [
		{
			type: 'STR',
			file: '4iq_thirdconsecration/thirdconsecration/thirdconsecration',
			texturePath: '4iq_thirdconsecration/thirdconsecration/',
			min: '4iq_thirdconsecration/thirdconsecration/min_thirdconsecration',
			wav: 'effect/iq_third_consecration'
		},
		{
			type: 'STR',
			file: '4iq_thirdconsecration/thirdconsecration_bottom/thirdconsecration_bottom',
			texturePath: '4iq_thirdconsecration/thirdconsecration_bottom/',
			min: '4iq_thirdconsecration/thirdconsecration_bottom/min_thirdconsecration_bottom',
			renderBeforeEntities: true
		}
	],

	// Third Exorcism Flame (IQ_THIRD_EXOR_FLAME), from the client's own effect folders.
	ef_iq_third_exor_flame: [
		{
			type: 'STR',
			file: '4ig_thirdexorflame/thirdexorflame/thirdexorflame',
			texturePath: '4ig_thirdexorflame/thirdexorflame/',
			min: '4ig_thirdexorflame/thirdexorflame/min_thirdexorflame',
			wav: 'effect/iq_third_exor_flame'
		}
	],

	// Third Exorcism Flame (IQ_THIRD_EXOR_FLAME), from the client's own effect folders.
	ef_iq_third_exor_flame_cast: [
		{
			type: 'STR',
			file: '4ig_thirdexorflame/thirdexorflame_cast/thirdexorflame_cast',
			texturePath: '4ig_thirdexorflame/thirdexorflame_cast/',
			min: '4ig_thirdexorflame/thirdexorflame_cast/min_thirdexorflame_cast'
		}
	],

	// Blazing Flame Blast (IQ_BLAZING_FLAME_BLAST), from the client's own effect folders.
	ef_iq_blazing_flame_blast: [
		{
			type: 'STR',
			file: 'inquisitor/iq_blazing_flame_blast/blazing_flame_blast/blazing_flame_blast',
			texturePath: 'inquisitor/iq_blazing_flame_blast/blazing_flame_blast/',
			min: 'inquisitor/iq_blazing_flame_blast/blazing_flame_blast/min_blazing_flame_blast',
			wav: 'effect/iq_blazing_flame_blast'
		}
	],

	// Blazing Flame Blast (IQ_BLAZING_FLAME_BLAST), from the client's own effect folders.
	ef_iq_blazing_flame_blast_cast: [
		{
			type: 'STR',
			file: 'inquisitor/iq_blazing_flame_blast/blazing_flame_blast_cast/blazing_flame_blast_cast',
			texturePath: 'inquisitor/iq_blazing_flame_blast/blazing_flame_blast_cast/',
			min: 'inquisitor/iq_blazing_flame_blast/blazing_flame_blast_cast/min_blazing_flame_blast_cast'
		},
		{
			type: 'STR',
			file: 'inquisitor/iq_blazing_flame_blast/blazing_flame_blast_cast_bottom/blazing_flame_blast_cast_bottom',
			texturePath: 'inquisitor/iq_blazing_flame_blast/blazing_flame_blast_cast_bottom/',
			min: 'inquisitor/iq_blazing_flame_blast/blazing_flame_blast_cast_bottom/min_blazing_flame_blast_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Blazing Flame Blast (IQ_BLAZING_FLAME_BLAST), from the client's own effect folders.
	ef_iq_blazing_flame_blast_hit: [
		{
			type: 'STR',
			file: 'inquisitor/iq_blazing_flame_blast/blazing_flame_blast_hit/blazing_flame_blast_hit',
			texturePath: 'inquisitor/iq_blazing_flame_blast/blazing_flame_blast_hit/',
			min: 'inquisitor/iq_blazing_flame_blast/blazing_flame_blast_hit/min_blazing_flame_blast_hit'
		}
	]
};
