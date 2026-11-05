/**
 * @module DB/Effects/Table/Jobs/Thief/AbyssChaser
 *
 * The Thief line's AbyssChaser effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Abyss Dagger (ABC_ABYSS_DAGGER), from the client's own effect folders.
	ef_abc_abyss_dagger: [
		{
			type: 'STR',
			file: 'abyss_dagger/abyss_dagger/abyss_dagger',
			texturePath: 'abyss_dagger/abyss_dagger/',
			min: 'abyss_dagger/abyss_dagger/min_abyss_dagger',
			wav: 'effect/abc_abyss_dagger'
		}
	],

	// Abyss Dagger (ABC_ABYSS_DAGGER), from the client's own effect folders.
	ef_abc_abyss_dagger_hit: [
		{
			type: 'STR',
			file: 'abyss_dagger/abyss_dagger_hit/abyss_dagger_hit',
			texturePath: 'abyss_dagger/abyss_dagger_hit/',
			min: 'abyss_dagger/abyss_dagger_hit/min_abyss_dagger_hit'
		}
	],

	// Unlucky Rush (ABC_UNLUCKY_RUSH), from the client's own effect folders.
	ef_abc_unlucky_rush: [
		{
			type: 'STR',
			file: 'unlucky_rush/unlucky_rush/unlucky_rush',
			texturePath: 'unlucky_rush/unlucky_rush/',
			min: 'unlucky_rush/unlucky_rush/min_unlucky_rush',
			wav: 'effect/abc_unlucky_rush'
		}
	],

	// Unlucky Rush (ABC_UNLUCKY_RUSH), from the client's own effect folders.
	ef_abc_unlucky_rush_cast: [
		{
			type: 'STR',
			file: 'unlucky_rush/unlucky_rush_cast/unlucky_rush_cast',
			texturePath: 'unlucky_rush/unlucky_rush_cast/',
			min: 'unlucky_rush/unlucky_rush_cast/min_unlucky_rush_cast'
		}
	],

	// Unlucky Rush (ABC_UNLUCKY_RUSH), from the client's own effect folders.
	ef_abc_unlucky_rush_hit: [
		{
			type: 'STR',
			file: 'unlucky_rush/unlucky_rush_hit/unlucky_rush_hit',
			texturePath: 'unlucky_rush/unlucky_rush_hit/',
			min: 'unlucky_rush/unlucky_rush_hit/min_unlucky_rush_hit'
		}
	],

	// Chain Reaction Shot (ABC_CHAIN_REACTION_SHOT), from the client's own effect folders.
	ef_abc_chain_reaction_shot: [
		{
			type: 'STR',
			file: 'chain_reaction_shot/chain_reaction_shot/chain_reaction_shot',
			texturePath: 'chain_reaction_shot/chain_reaction_shot/',
			min: 'chain_reaction_shot/chain_reaction_shot/min_chain_reaction_shot',
			wav: 'effect/abc_chain_reaction_shot'
		}
	],

	// Chain Reaction Shot (ABC_CHAIN_REACTION_SHOT), from the client's own effect folders.
	ef_abc_chain_reaction_shot_cast: [
		{
			type: 'STR',
			file: 'chain_reaction_shot/chain_reaction_shot_cast/chain_reaction_shot_cast',
			texturePath: 'chain_reaction_shot/chain_reaction_shot_cast/',
			min: 'chain_reaction_shot/chain_reaction_shot_cast/min_chain_reaction_shot_cast'
		},
		{
			type: 'STR',
			file: 'chain_reaction_shot/chain_reaction_shot_cast_bottom/chain_reaction_shot_cast_bottom',
			texturePath: 'chain_reaction_shot/chain_reaction_shot_cast_bottom/',
			min: 'chain_reaction_shot/chain_reaction_shot_cast_bottom/min_chain_reaction_shot_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Chain Reaction Shot (ABC_CHAIN_REACTION_SHOT), from the client's own effect folders.
	ef_abc_chain_reaction_shot_hit: [
		{
			type: 'STR',
			file: 'chain_reaction_shot/chain_reaction_shot_hit/chain_reaction_shot_hit',
			texturePath: 'chain_reaction_shot/chain_reaction_shot_hit/',
			min: 'chain_reaction_shot/chain_reaction_shot_hit/min_chain_reaction_shot_hit'
		}
	],

	// From The Abyss (ABC_FROM_THE_ABYSS), from the client's own effect folders.
	ef_abc_from_the_abyss_hit: [
		{
			type: 'STR',
			file: 'from_the_abyss/from_the_abyss_attack/from_the_abyss_attack',
			texturePath: 'from_the_abyss/from_the_abyss_attack/',
			wav: 'effect/abc_from_the_abyss'
		}
	],

	// Abyss Slayer (ABC_ABYSS_SLAYER), from the client's own effect folders.
	ef_abc_abyss_slayer: [
		{
			type: 'STR',
			file: '4abc_abyss_slayer/abyss_slayer/abyss_slayer',
			texturePath: '4abc_abyss_slayer/abyss_slayer/',
			min: '4abc_abyss_slayer/abyss_slayer/min_abyss_slayer',
			wav: 'effect/abc_abyss_slayer'
		}
	],

	// Abyss Slayer (ABC_ABYSS_SLAYER), from the client's own effect folders.
	ef_abc_abyss_slayer_cast: [
		{
			type: 'STR',
			file: '4abc_abyss_slayer/abyss_slayer_cast/abyss_slayer_cast',
			texturePath: '4abc_abyss_slayer/abyss_slayer_cast/',
			min: '4abc_abyss_slayer/abyss_slayer_cast/min_abyss_slayer_cast'
		},
		{
			type: 'STR',
			file: '4abc_abyss_slayer/abyss_slayer_cast_bottom/abyss_slayer_cast_bottom',
			texturePath: '4abc_abyss_slayer/abyss_slayer_cast_bottom/',
			min: '4abc_abyss_slayer/abyss_slayer_cast_bottom/min_abyss_slayer_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Omega Abyss Strike (ABC_ABYSS_STRIKE), from the client's own effect folders.
	ef_abc_abyss_strike: [
		{
			type: 'STR',
			file: 'abyss_strike/abyss_strike/abyss_strike',
			texturePath: 'abyss_strike/abyss_strike/',
			min: 'abyss_strike/abyss_strike/min_abyss_strike',
			wav: 'effect/abc_abyss_strike'
		},
		{
			type: 'STR',
			file: 'abyss_strike/abyss_strike_bottom/abyss_strike_bottom',
			texturePath: 'abyss_strike/abyss_strike_bottom/',
			min: 'abyss_strike/abyss_strike_bottom/min_abyss_strike_bottom',
			renderBeforeEntities: true
		}
	],

	// Omega Abyss Strike (ABC_ABYSS_STRIKE), from the client's own effect folders.
	ef_abc_abyss_strike_cast: [
		{
			type: 'STR',
			file: 'abyss_strike/abyss_strike_cast/abyss_strike_cast',
			texturePath: 'abyss_strike/abyss_strike_cast/',
			min: 'abyss_strike/abyss_strike_cast/min_abyss_strike_cast'
		},
		{
			type: 'STR',
			file: 'abyss_strike/abyss_strike_cast_bottom/abyss_strike_cast_bottom',
			texturePath: 'abyss_strike/abyss_strike_cast_bottom/',
			min: 'abyss_strike/abyss_strike_cast_bottom/min_abyss_strike_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Omega Abyss Strike (ABC_ABYSS_STRIKE), from the client's own effect folders.
	ef_abc_abyss_strike_hit: [
		{
			type: 'STR',
			file: 'abyss_strike/abyss_strike_hit/abyss_strike_hit',
			texturePath: 'abyss_strike/abyss_strike_hit/',
			min: 'abyss_strike/abyss_strike_hit/min_abyss_strike_hit'
		}
	],

	// Deft Stab (ABC_DEFT_STAB), from the client's own effect folders.
	ef_abc_deft_stab: [
		{
			type: 'STR',
			file: 'deft_stab/deft_stab/deft_stab',
			texturePath: 'deft_stab/deft_stab/',
			min: 'deft_stab/deft_stab/min_deft_stab'
		}
	],

	// Abyss Square (ABC_ABYSS_SQUARE), from the client's own effect folders.
	ef_abc_abyss_square: [
		{
			type: 'STR',
			file: 'abyss_square/abyss_square/abyss_square',
			texturePath: 'abyss_square/abyss_square/',
			min: 'abyss_square/abyss_square/min_abyss_square',
			wav: 'effect/abc_abyss_square'
		},
		{
			type: 'STR',
			file: 'abyss_square/abyss_square_bottom/abyss_square_bottom',
			texturePath: 'abyss_square/abyss_square_bottom/',
			min: 'abyss_square/abyss_square_bottom/min_abyss_square_bottom',
			renderBeforeEntities: true
		}
	],

	// Abyss Square (ABC_ABYSS_SQUARE), from the client's own effect folders.
	ef_abc_abyss_square_hit: [
		{
			type: 'STR',
			file: 'abyss_square/abyss_square_hit/abyss_square_hit',
			texturePath: 'abyss_square/abyss_square_hit/'
		}
	],

	// Frenzy Shot (ABC_FRENZY_SHOT), from the client's own effect folders.
	ef_abc_frenzy_shot: [
		{
			type: 'STR',
			file: 'frenzy_shot/frenzy_shot/frenzy_shot',
			texturePath: 'frenzy_shot/frenzy_shot/',
			min: 'frenzy_shot/frenzy_shot/min_frenzy_shot',
			wav: 'effect/abc_frenzy_shot'
		}
	],

	// Frenzy Shot (ABC_FRENZY_SHOT), from the client's own effect folders.
	ef_abc_frenzy_shot_hit: [
		{
			type: 'STR',
			file: 'frenzy_shot/frenzy_shot_hit/frenzy_shot_hit',
			texturePath: 'frenzy_shot/frenzy_shot_hit/',
			min: 'frenzy_shot/frenzy_shot_hit/min_frenzy_shot_hit'
		}
	],

	// Chain Reaction Shot Attack (ABC_CHAIN_REACTION_SHOT_ATK), from the client's own effect folders.
	ef_abc_chain_reaction_shot_atk: [
		{
			type: 'STR',
			file: 'chain_reaction_shot/chain_reaction_shot_hit/chain_reaction_shot_hit',
			texturePath: 'chain_reaction_shot/chain_reaction_shot_hit/',
			min: 'chain_reaction_shot/chain_reaction_shot_hit/min_chain_reaction_shot_hit'
		}
	],

	// From The Abyss Attack (ABC_FROM_THE_ABYSS_ATK), from the client's own effect folders.
	ef_abc_from_the_abyss_atk: [
		{
			type: 'STR',
			file: 'from_the_abyss/from_the_abyss_attack/from_the_abyss_attack',
			texturePath: 'from_the_abyss/from_the_abyss_attack/'
		}
	],

	// Chasing Break (ABC_CHASING_BREAK), from the client's own effect folders.
	ef_abc_chasing_break: [
		{
			type: 'STR',
			file: 'abyss_chaser/abc_chasing_break/chasing_break/chasing_break',
			texturePath: 'abyss_chaser/abc_chasing_break/chasing_break/',
			min: 'abyss_chaser/abc_chasing_break/chasing_break/min_chasing_break',
			wav: 'effect/abc_chasing_break'
		}
	],

	// Chasing Shot (ABC_CHASING_SHOT), from the client's own effect folders.
	ef_abc_chasing_shot_cast: [
		{
			type: 'STR',
			file: 'abyss_chaser/abc_chasing_shot/chasing_shot_cast/chasing_shot_cast',
			texturePath: 'abyss_chaser/abc_chasing_shot/chasing_shot_cast/',
			min: 'abyss_chaser/abc_chasing_shot/chasing_shot_cast/min_chasing_shot_cast',
			wav: 'effect/abc_chasing_shot'
		},
		{
			type: 'STR',
			file: 'abyss_chaser/abc_chasing_shot/chasing_shot_cast_bottom/chasing_shot_cast_bottom',
			texturePath: 'abyss_chaser/abc_chasing_shot/chasing_shot_cast_bottom/',
			min: 'abyss_chaser/abc_chasing_shot/chasing_shot_cast_bottom/min_chasing_shot_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Chasing Shot (ABC_CHASING_SHOT), from the client's own effect folders.
	ef_abc_chasing_shot_hit: [
		{
			type: 'STR',
			file: 'abyss_chaser/abc_chasing_shot/chasing_shot_hit/chasing_shot_hit',
			texturePath: 'abyss_chaser/abc_chasing_shot/chasing_shot_hit/',
			min: 'abyss_chaser/abc_chasing_shot/chasing_shot_hit/min_chasing_shot_hit'
		}
	],

	// Abyss Flame (ABC_ABYSS_FLAME), from the client's own effect folders.
	ef_abc_abyss_flame: [
		{
			type: 'STR',
			file: 'abyss_chaser/abc_abyss_flame/abyss_flame/abyss_flame',
			texturePath: 'abyss_chaser/abc_abyss_flame/abyss_flame/',
			min: 'abyss_chaser/abc_abyss_flame/abyss_flame/min_abyss_flame',
			wav: 'effect/abc_abyss_flame'
		}
	],

	// Abyss Flame (ABC_ABYSS_FLAME), from the client's own effect folders.
	ef_abc_abyss_flame_cast: [
		{
			type: 'STR',
			file: 'abyss_chaser/abc_abyss_flame/abyss_flame_cast/abyss_flame_cast',
			texturePath: 'abyss_chaser/abc_abyss_flame/abyss_flame_cast/',
			min: 'abyss_chaser/abc_abyss_flame/abyss_flame_cast/min_abyss_flame_cast'
		},
		{
			type: 'STR',
			file: 'abyss_chaser/abc_abyss_flame/abyss_flame_cast_bottom/abyss_flame_cast_bottom',
			texturePath: 'abyss_chaser/abc_abyss_flame/abyss_flame_cast_bottom/',
			min: 'abyss_chaser/abc_abyss_flame/abyss_flame_cast_bottom/min_abyss_flame_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Abyss Flame (ABC_ABYSS_FLAME), from the client's own effect folders.
	ef_abc_abyss_flame_hit: [
		{
			type: 'STR',
			file: 'abyss_chaser/abc_abyss_flame/abyss_flame_hit/abyss_flame_hit',
			texturePath: 'abyss_chaser/abc_abyss_flame/abyss_flame_hit/',
			min: 'abyss_chaser/abc_abyss_flame/abyss_flame_hit/min_abyss_flame_hit'
		}
	]
};
