/**
 * @module DB/Effects/Table/Jobs/Mage/ArchMage
 *
 * The Mage line's ArchMage effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Deadly Projection (AG_DEADLY_PROJECTION), from the client's own effect folders.
	ef_ag_deadly_projection_cast: [
		{
			type: 'STR',
			file: 'deadly_projection/deadly_projection_cast/deadly_projection_cast',
			texturePath: 'deadly_projection/deadly_projection_cast/',
			min: 'deadly_projection/deadly_projection_cast/min_deadly_projection_cast',
			wav: 'effect/ag_deadly_projection'
		},
		{
			type: 'STR',
			file: 'deadly_projection/deadly_projection_cast_bottom/deadly_projection_cast_bottom',
			texturePath: 'deadly_projection/deadly_projection_cast_bottom/',
			min: 'deadly_projection/deadly_projection_cast_bottom/min_deadly_projection_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Deadly Projection (AG_DEADLY_PROJECTION), from the client's own effect folders.
	ef_ag_deadly_projection_hit: [
		{
			type: 'STR',
			file: 'deadly_projection/deadly_projection_hit/deadly_projection_hit',
			texturePath: 'deadly_projection/deadly_projection_hit/',
			min: 'deadly_projection/deadly_projection_hit/min_deadly_projection_hit'
		}
	],

	// Destructive Hurricane (AG_DESTRUCTIVE_HURRICANE), from the client's own effect folders.
	ef_ag_destructive_hurricane: [
		{
			type: 'STR',
			file: 'destructive_hurricane/destructive_hurricane/destructive_hurricane',
			texturePath: 'destructive_hurricane/destructive_hurricane/',
			min: 'destructive_hurricane/destructive_hurricane/min_destructive_hurricane',
			wav: 'effect/ag_destructive_hurricane'
		},
		{
			type: 'STR',
			file: 'destructive_hurricane/destructive_hurricane_bottom/destructive_hurricane_bottom',
			texturePath: 'destructive_hurricane/destructive_hurricane_bottom/',
			min: 'destructive_hurricane/destructive_hurricane_bottom/min_destructive_hurricane_bottom',
			renderBeforeEntities: true
		}
	],

	// Destructive Hurricane (AG_DESTRUCTIVE_HURRICANE), from the client's own effect folders.
	ef_ag_destructive_hurricane_cast: [
		{
			type: 'STR',
			file: 'destructive_hurricane/destructive_hurricane_cast/destructive_hurricane_cast',
			texturePath: 'destructive_hurricane/destructive_hurricane_cast/',
			min: 'destructive_hurricane/destructive_hurricane_cast/min_destructive_hurricane_cast'
		},
		{
			type: 'STR',
			file: 'destructive_hurricane/destructive_hurricane_cast_bottom/destructive_hurricane_cast_bottom',
			texturePath: 'destructive_hurricane/destructive_hurricane_cast_bottom/',
			min: 'destructive_hurricane/destructive_hurricane_cast_bottom/min_destructive_hurricane_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Destructive Hurricane (AG_DESTRUCTIVE_HURRICANE), from the client's own effect folders.
	ef_ag_destructive_hurricane_hit: [
		{
			type: 'STR',
			file: 'destructive_hurricane/destructive_hurricane_hit/destructive_hurricane_hit',
			texturePath: 'destructive_hurricane/destructive_hurricane_hit/',
			min: 'destructive_hurricane/destructive_hurricane_hit/min_destructive_hurricane_hit'
		}
	],

	// Rain Of Crystal (AG_RAIN_OF_CRYSTAL), from the client's own effect folders.
	ef_ag_rain_of_crystal_cast: [
		{
			type: 'STR',
			file: 'rain_of_crystal/rain_of_crystal_casting/rain_of_crystal_casting',
			texturePath: 'rain_of_crystal/rain_of_crystal_casting/',
			min: 'rain_of_crystal/rain_of_crystal_casting/min_rain_of_crystal_casting',
			wav: 'effect/ag_rain_of_crystal'
		},
		{
			type: 'STR',
			file: 'rain_of_crystal/rain_of_crystal_casting_bottom/rain_of_crystal_casting_bottom',
			texturePath: 'rain_of_crystal/rain_of_crystal_casting_bottom/',
			min: 'rain_of_crystal/rain_of_crystal_casting_bottom/min_rain_of_crystal_casting_bottom',
			renderBeforeEntities: true
		}
	],

	// Rain Of Crystal (AG_RAIN_OF_CRYSTAL), from the client's own effect folders.
	ef_ag_rain_of_crystal_hit: [
		{
			type: 'STR',
			file: 'rain_of_crystal/rain_of_crystal_attack/rain_of_crystal_attack',
			texturePath: 'rain_of_crystal/rain_of_crystal_attack/',
			min: 'rain_of_crystal/rain_of_crystal_attack/min_rain_of_crystal_attack'
		},
		{
			type: 'STR',
			file: 'rain_of_crystal/rain_of_crystal_attack_bottom/rain_of_crystal_attack_bottom',
			texturePath: 'rain_of_crystal/rain_of_crystal_attack_bottom/',
			min: 'rain_of_crystal/rain_of_crystal_attack_bottom/min_rain_of_crystal_attack_bottom',
			renderBeforeEntities: true
		}
	],

	// Mystery Illusion (AG_MYSTERY_ILLUSION), from the client's own effect folders.
	ef_ag_mystery_illusion: [
		{
			type: 'STR',
			file: 'mystery_illusion/mystery_illusion/mystery_illusion',
			texturePath: 'mystery_illusion/mystery_illusion/',
			wav: 'effect/ag_mystery_illusion'
		},
		{
			type: 'STR',
			file: 'mystery_illusion/mystery_illusion_bottom/mystery_illusion_bottom',
			texturePath: 'mystery_illusion/mystery_illusion_bottom/',
			min: 'mystery_illusion/mystery_illusion_bottom/min_mystery_illusion_bottom',
			renderBeforeEntities: true
		}
	],

	// Mystery Illusion (AG_MYSTERY_ILLUSION), from the client's own effect folders.
	ef_ag_mystery_illusion_cast: [
		{
			type: 'STR',
			file: 'mystery_illusion/mystery_illusion_cast/mystery_illusion_cast',
			texturePath: 'mystery_illusion/mystery_illusion_cast/',
			min: 'mystery_illusion/mystery_illusion_cast/min_mystery_illusion_cast'
		},
		{
			type: 'STR',
			file: 'mystery_illusion/mystery_illusion_cast_bottom/mystery_illusion_cast_bottom',
			texturePath: 'mystery_illusion/mystery_illusion_cast_bottom/',
			min: 'mystery_illusion/mystery_illusion_cast_bottom/min_mystery_illusion_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Mystery Illusion (AG_MYSTERY_ILLUSION), from the client's own effect folders.
	ef_ag_mystery_illusion_hit: [
		{
			type: 'STR',
			file: 'mystery_illusion/mystery_illusion_hit/mystery_illusion_hit',
			texturePath: 'mystery_illusion/mystery_illusion_hit/',
			min: 'mystery_illusion/mystery_illusion_hit/min_mystery_illusion_hit'
		}
	],

	// Violent Quake (AG_VIOLENT_QUAKE), from the client's own effect folders.
	ef_ag_violent_quake: [
		{
			type: 'STR',
			file: 'violentquake/violentquake/violentquake_01',
			texturePath: 'violentquake/violentquake/',
			wav: 'effect/ag_violent_quake'
		},
		{
			type: 'STR',
			file: 'violentquake/violentquake_bottom/violentquake_bottom',
			texturePath: 'violentquake/violentquake_bottom/',
			min: 'violentquake/violentquake_bottom/min_violentquake_bottom',
			renderBeforeEntities: true
		}
	],

	// Violent Quake (AG_VIOLENT_QUAKE), from the client's own effect folders.
	ef_ag_violent_quake_cast: [
		{
			type: 'STR',
			file: 'violentquake/violentquake_cast/violentquake_cast',
			texturePath: 'violentquake/violentquake_cast/',
			min: 'violentquake/violentquake_cast/min_violentquake_cast'
		},
		{
			type: 'STR',
			file: 'violentquake/violentquake_cast_bottom/violentquake_cast_bottom',
			texturePath: 'violentquake/violentquake_cast_bottom/',
			min: 'violentquake/violentquake_cast_bottom/min_violentquake_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Violent Quake (AG_VIOLENT_QUAKE), from the client's own effect folders.
	ef_ag_violent_quake_hit: [
		{
			type: 'STR',
			file: 'violentquake/violentquake_hit/violentquake_hit',
			texturePath: 'violentquake/violentquake_hit/',
			min: 'violentquake/violentquake_hit/min_violentquake_hit'
		}
	],

	// Violent Quake Attack (AG_VIOLENT_QUAKE_ATK), from the client's own effect folders.
	ef_ag_violent_quake_atk: [
		{
			type: 'STR',
			file: 'violentquake/violentquake_hit/violentquake_hit',
			texturePath: 'violentquake/violentquake_hit/',
			min: 'violentquake/violentquake_hit/min_violentquake_hit'
		}
	],

	// Soul Vulcan Strike (AG_SOUL_VC_STRIKE), from the client's own effect folders.
	ef_ag_soul_vc_strike_cast: [
		{
			type: 'STR',
			file: 'soul_vc_strike/soul_vc_strike_cast/soul_vc_strike_cast',
			texturePath: 'soul_vc_strike/soul_vc_strike_cast/',
			min: 'soul_vc_strike/soul_vc_strike_cast/min_soul_vc_strike_cast'
		},
		{
			type: 'STR',
			file: 'soul_vc_strike/soul_vc_strike_cast_bottom/soul_vc_strike_cast_bottom',
			texturePath: 'soul_vc_strike/soul_vc_strike_cast_bottom/',
			min: 'soul_vc_strike/soul_vc_strike_cast_bottom/min_soul_vc_strike_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Soul Vulcan Strike (AG_SOUL_VC_STRIKE), from the client's own effect folders.
	ef_ag_soul_vc_strike_hit: [
		{
			type: 'STR',
			file: 'soul_vc_strike/soul_vc_strike_hit/soul_vc_strike_hit',
			texturePath: 'soul_vc_strike/soul_vc_strike_hit/',
			min: 'soul_vc_strike/soul_vc_strike_hit/min_soul_vc_strike_hit'
		}
	],

	// Strantum Tremor (AG_STRANTUM_TREMOR), from the client's own effect folders.
	ef_ag_strantum_tremor: [
		{
			type: 'STR',
			file: 'new_strantumtremor/new_strantumtremor/new_strantumtremor',
			texturePath: 'new_strantumtremor/new_strantumtremor/'
		},
		{
			type: 'STR',
			file: 'new_strantumtremor/new_strantumtremor_bottom/new_strantumtremor_bottom',
			texturePath: 'new_strantumtremor/new_strantumtremor_bottom/',
			renderBeforeEntities: true
		}
	],

	// Strantum Tremor (AG_STRANTUM_TREMOR), from the client's own effect folders.
	ef_ag_strantum_tremor_cast: [
		{
			type: 'STR',
			file: 'new_strantumtremor/new_strantumtremor_cast/new_strantumtremor_cast',
			texturePath: 'new_strantumtremor/new_strantumtremor_cast/'
		},
		{
			type: 'STR',
			file: 'new_strantumtremor/new_strantumtremor_cast_bottom/new_strantumtremor_cast_bottom',
			texturePath: 'new_strantumtremor/new_strantumtremor_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Strantum Tremor (AG_STRANTUM_TREMOR), from the client's own effect folders.
	ef_ag_strantum_tremor_hit: [
		{
			type: 'STR',
			file: 'new_strantumtremor/new_strantumtremor_hit/new_strantumtremor_hit',
			texturePath: 'new_strantumtremor/new_strantumtremor_hit/'
		}
	],

	// All Bloom (AG_ALL_BLOOM), from the client's own effect folders.
	ef_ag_all_bloom: [
		{
			type: 'STR',
			file: 'allbloom/allbloom/allbloom',
			texturePath: 'allbloom/allbloom/',
			min: 'allbloom/allbloom/min_allbloom',
			wav: 'effect/ag_all_bloom'
		},
		{
			type: 'STR',
			file: 'allbloom/allbloom_bottom/allbloom_bottom',
			texturePath: 'allbloom/allbloom_bottom/',
			min: 'allbloom/allbloom_bottom/min_allbloom_bottom',
			renderBeforeEntities: true
		}
	],

	// All Bloom (AG_ALL_BLOOM), from the client's own effect folders.
	ef_ag_all_bloom_cast: [
		{
			type: 'STR',
			file: 'allbloom/allbloom_cast/allbloom_cast',
			texturePath: 'allbloom/allbloom_cast/',
			min: 'allbloom/allbloom_cast/min_allbloom_cast'
		},
		{
			type: 'STR',
			file: 'allbloom/allbloom_cast_bottom/allbloom_cast_bottom',
			texturePath: 'allbloom/allbloom_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// All Bloom (AG_ALL_BLOOM), from the client's own effect folders.
	ef_ag_all_bloom_hit: [
		{
			type: 'STR',
			file: 'allbloom/allbloom_hit/allbloom_hit',
			texturePath: 'allbloom/allbloom_hit/',
			min: 'allbloom/allbloom_hit/min_allbloom_hit'
		}
	],

	// All Bloom Attack (AG_ALL_BLOOM_ATK), from the client's own effect folders.
	ef_ag_all_bloom_atk: [
		{
			type: 'STR',
			file: 'allbloom/allbloom_hit/allbloom_hit',
			texturePath: 'allbloom/allbloom_hit/',
			min: 'allbloom/allbloom_hit/min_allbloom_hit'
		}
	],

	// All Bloom Attack 2 (AG_ALL_BLOOM_ATK2), from the client's own effect folders.
	ef_ag_all_bloom_atk2: [
		{
			type: 'STR',
			file: 'allbloom/allbloom_hit/allbloom_hit',
			texturePath: 'allbloom/allbloom_hit/',
			min: 'allbloom/allbloom_hit/min_allbloom_hit'
		}
	],

	// Crystal Impact (AG_CRYSTAL_IMPACT), from the client's own effect folders.
	ef_ag_crystal_impact: [
		{
			type: 'STR',
			file: 'crystal_impact/crystal_impact/crystal_impact',
			texturePath: 'crystal_impact/crystal_impact/',
			min: 'crystal_impact/crystal_impact/min_crystal_impact',
			wav: 'effect/ag_crystal_impact'
		},
		{
			type: 'STR',
			file: 'crystal_impact/crystal_impact_buff/crystal_impact_buff',
			texturePath: 'crystal_impact/crystal_impact_buff/',
			min: 'crystal_impact/crystal_impact_buff/min_crystal_impact_buff'
		},
		{
			type: 'STR',
			file: 'crystal_impact/crystal_impact_bottom/crystal_impact_bottom',
			texturePath: 'crystal_impact/crystal_impact_bottom/',
			min: 'crystal_impact/crystal_impact_bottom/min_crystal_impact_bottom',
			renderBeforeEntities: true
		}
	],

	// Crystal Impact (AG_CRYSTAL_IMPACT), from the client's own effect folders.
	ef_ag_crystal_impact_cast: [
		{
			type: 'STR',
			file: 'crystal_impact/crystal_impact_cast/crystal_impact_cast',
			texturePath: 'crystal_impact/crystal_impact_cast/',
			min: 'crystal_impact/crystal_impact_cast/min_crystal_impact_cast'
		},
		{
			type: 'STR',
			file: 'crystal_impact/crystal_impact_cast_bottom/crystal_impact_cast_bottom',
			texturePath: 'crystal_impact/crystal_impact_cast_bottom/',
			min: 'crystal_impact/crystal_impact_cast_bottom/min_crystal_impact_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Crystal Impact (AG_CRYSTAL_IMPACT), from the client's own effect folders.
	ef_ag_crystal_impact_hit: [
		{
			type: 'STR',
			file: 'crystal_impact/crystal_impact_hit/crystal_impact_hit',
			texturePath: 'crystal_impact/crystal_impact_hit/',
			min: 'crystal_impact/crystal_impact_hit/min_crystal_impact_hit'
		}
	],

	// Crystal Impact Attack (AG_CRYSTAL_IMPACT_ATK), from the client's own effect folders.
	ef_ag_crystal_impact_atk: [
		{
			type: 'STR',
			file: 'crystal_impact/crystal_impact_hit/crystal_impact_hit',
			texturePath: 'crystal_impact/crystal_impact_hit/',
			min: 'crystal_impact/crystal_impact_hit/min_crystal_impact_hit'
		}
	],

	// Tornado Storm (AG_TORNADO_STORM), from the client's own effect folders.
	ef_ag_tornado_storm: [
		{
			type: 'STR',
			file: 'new_tornadostorm/new_tornadostorm/new_tornadostorm',
			texturePath: 'new_tornadostorm/new_tornadostorm/',
			wav: 'effect/ag_tornado_storm'
		},
		{
			type: 'STR',
			file: 'new_tornadostorm/new_tornadostorm_bottom/new_tornadostorm_bottom',
			texturePath: 'new_tornadostorm/new_tornadostorm_bottom/',
			renderBeforeEntities: true
		}
	],

	// Tornado Storm (AG_TORNADO_STORM), from the client's own effect folders.
	ef_ag_tornado_storm_cast: [
		{
			type: 'STR',
			file: 'new_tornadostorm/new_tornadostorm_cast/new_tornadostorm_cast',
			texturePath: 'new_tornadostorm/new_tornadostorm_cast/'
		},
		{
			type: 'STR',
			file: 'new_tornadostorm/new_tornadostorm_cast_bottom/new_tornadostorm_cast_bottom',
			texturePath: 'new_tornadostorm/new_tornadostorm_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Tornado Storm (AG_TORNADO_STORM), from the client's own effect folders.
	ef_ag_tornado_storm_hit: [
		{
			type: 'STR',
			file: 'new_tornadostorm/new_tornadostorm_hit/new_tornadostorm_hit',
			texturePath: 'new_tornadostorm/new_tornadostorm_hit/'
		}
	],

	// Astral Strike (AG_ASTRAL_STRIKE), from the client's own effect folders.
	ef_ag_astral_strike: [
		{
			type: 'STR',
			file: 'astralstrike/astralstrike/astralstrike',
			texturePath: 'astralstrike/astralstrike/',
			min: 'astralstrike/astralstrike/min_astralstrike'
		},
		{
			type: 'STR',
			file: 'astralstrike/astralstrike_bottom/astralstrike_bottom',
			texturePath: 'astralstrike/astralstrike_bottom/',
			min: 'astralstrike/astralstrike_bottom/min_astralstrike_bottom',
			renderBeforeEntities: true
		}
	],

	// Astral Strike (AG_ASTRAL_STRIKE), from the client's own effect folders.
	ef_ag_astral_strike_cast: [
		{
			type: 'STR',
			file: 'astralstrike/astralstrike_cast/astralstrike_cast',
			texturePath: 'astralstrike/astralstrike_cast/',
			min: 'astralstrike/astralstrike_cast/min_astralstrike_cast'
		},
		{
			type: 'STR',
			file: 'astralstrike/astralstrike_cast_bottom/astralstrike_cast_bottom',
			texturePath: 'astralstrike/astralstrike_cast_bottom/',
			min: 'astralstrike/astralstrike_cast_bottom/min_astralstrike_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Climax (AG_CLIMAX), from the client's own effect folders.
	ef_ag_climax: [
		{
			type: 'STR',
			file: 'climax/climax/climax',
			texturePath: 'climax/climax/',
			min: 'climax/climax/min_climax',
			wav: 'effect/ag_climax'
		},
		{
			type: 'STR',
			file: 'climax/climax_bottom/climax_bottom_%d',
			rand: [1, 5],
			texturePath: 'climax/climax_bottom/',
			renderBeforeEntities: true
		}
	],

	// Climax (AG_CLIMAX), from the client's own effect folders.
	ef_ag_climax_cast: [
		{
			type: 'STR',
			file: 'climax/climax_cast/climax_cast',
			texturePath: 'climax/climax_cast/',
			min: 'climax/climax_cast/min_climax_cast'
		}
	],

	// Rock Down (AG_ROCK_DOWN), from the client's own effect folders.
	ef_ag_rock_down: [
		{
			type: 'STR',
			file: 'rockdown/rockdown/rockdown',
			texturePath: 'rockdown/rockdown/',
			min: 'rockdown/rockdown/min_rockdown',
			wav: 'effect/ag_rock_down'
		},
		{
			type: 'STR',
			file: 'rockdown/rockdown_bottom/rockdown_bottom',
			texturePath: 'rockdown/rockdown_bottom/',
			min: 'rockdown/rockdown_bottom/min_rockdown_bottom',
			renderBeforeEntities: true
		}
	],

	// Rock Down (AG_ROCK_DOWN), from the client's own effect folders.
	ef_ag_rock_down_cast: [
		{
			type: 'STR',
			file: 'rockdown/rockdown_cast/rockdown_cast',
			texturePath: 'rockdown/rockdown_cast/',
			min: 'rockdown/rockdown_cast/min_rockdown_cast'
		},
		{
			type: 'STR',
			file: 'rockdown/rockdown_cast_bottom/rockdown_cast_bottom',
			texturePath: 'rockdown/rockdown_cast_bottom/',
			min: 'rockdown/rockdown_cast_bottom/min_rockdown_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Rock Down (AG_ROCK_DOWN), from the client's own effect folders.
	ef_ag_rock_down_hit: [
		{
			type: 'STR',
			file: 'rockdown/rockdown_hit/rockdown_hit',
			texturePath: 'rockdown/rockdown_hit/',
			min: 'rockdown/rockdown_hit/min_rockdown_hit'
		}
	],

	// Storm Cannon (AG_STORM_CANNON), from the client's own effect folders.
	ef_ag_storm_cannon: [
		{
			type: 'STR',
			file: 'stormcannon/stormcannon/stormcannon',
			texturePath: 'stormcannon/stormcannon/',
			min: 'stormcannon/stormcannon/min_stormcannon',
			wav: 'effect/ag_storm_cannon'
		},
		{
			type: 'STR',
			file: 'stormcannon/stormcannon_bottom/stormcannon_bottom',
			texturePath: 'stormcannon/stormcannon_bottom/',
			min: 'stormcannon/stormcannon_bottom/min_stormcannon_bottom',
			renderBeforeEntities: true
		}
	],

	// Storm Cannon (AG_STORM_CANNON), from the client's own effect folders.
	ef_ag_storm_cannon_cast: [
		{
			type: 'STR',
			file: 'stormcannon/stormcannon_cast_bottom/stormcannon_cast_bottom',
			texturePath: 'stormcannon/stormcannon_cast_bottom/',
			min: 'stormcannon/stormcannon_cast_bottom/min_stormcannon_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Crimson Arrow (AG_CRIMSON_ARROW), from the client's own effect folders.
	ef_ag_crimson_arrow: [
		{
			type: 'STR',
			file: 'crimsonarrow/crimsonarrow/crimsonarrow',
			texturePath: 'crimsonarrow/crimsonarrow/',
			min: 'crimsonarrow/crimsonarrow/min_crimsonarrow'
		}
	],

	// Crimson Arrow (AG_CRIMSON_ARROW), from the client's own effect folders.
	ef_ag_crimson_arrow_cast: [
		{
			type: 'STR',
			file: 'crimsonarrow/crimsonarrow_cast/crimsonarrow_cast',
			texturePath: 'crimsonarrow/crimsonarrow_cast/',
			min: 'crimsonarrow/crimsonarrow_cast/min_crimsonarrow_cast'
		},
		{
			type: 'STR',
			file: 'crimsonarrow/crimsonarrow_cast_bottom/crimsonarrow_cast_bottom',
			texturePath: 'crimsonarrow/crimsonarrow_cast_bottom/',
			min: 'crimsonarrow/crimsonarrow_cast_bottom/min_crimsonarrow_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Crimson Arrow (AG_CRIMSON_ARROW), from the client's own effect folders.
	ef_ag_crimson_arrow_hit: [
		{
			type: 'STR',
			file: 'crimsonarrow/crimsonarrow_hit/crimsonarrow_hit',
			texturePath: 'crimsonarrow/crimsonarrow_hit/',
			min: 'crimsonarrow/crimsonarrow_hit/min_crimsonarrow_hit'
		}
	],

	// Crimson Arrow Attack (AG_CRIMSON_ARROW_ATK), from the client's own effect folders.
	ef_ag_crimson_arrow_atk: [
		{
			type: 'STR',
			file: 'crimsonarrow/crimsonarrow_hit/crimsonarrow_hit',
			texturePath: 'crimsonarrow/crimsonarrow_hit/',
			min: 'crimsonarrow/crimsonarrow_hit/min_crimsonarrow_hit'
		}
	],

	// Frozen Slash (AG_FROZEN_SLASH), from the client's own effect folders.
	ef_ag_frozen_slash: [
		{
			type: 'STR',
			file: 'frozen_slash/frozen_slash/frozen_slash',
			texturePath: 'frozen_slash/frozen_slash/',
			min: 'frozen_slash/frozen_slash/min_frozen_slash',
			wav: 'effect/ag_frozen_slash'
		}
	],

	// Frozen Slash (AG_FROZEN_SLASH), from the client's own effect folders.
	ef_ag_frozen_slash_cast: [
		{
			type: 'STR',
			file: 'frozen_slash/frozen_slash_casting/frozen_slash_cast',
			texturePath: 'frozen_slash/frozen_slash_casting/',
			min: 'frozen_slash/frozen_slash_casting/min_frozen_slash_cast'
		},
		{
			type: 'STR',
			file: 'frozen_slash/frozen_slash_casting_bottom/frozen_slash_cast_bottom',
			texturePath: 'frozen_slash/frozen_slash_casting_bottom/',
			min: 'frozen_slash/frozen_slash_casting_bottom/min_frozen_slash_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Frozen Slash (AG_FROZEN_SLASH), from the client's own effect folders.
	ef_ag_frozen_slash_hit: [
		{
			type: 'STR',
			file: 'frozen_slash/frozen_slash_hit/frozen_slash_hit',
			texturePath: 'frozen_slash/frozen_slash_hit/',
			min: 'frozen_slash/frozen_slash_hit/min_frozen_slash_hit'
		}
	],

	// Destructive Hurricane Climax (AG_DESTRUCTIVE_HURRICANE_CLIMAX), from the client's own effect folders.
	ef_ag_destructive_hurricane_climax: [
		{
			type: 'STR',
			file: 'destructive_hurricane/destructive_hurricane_climax/destructive_hurricane_climax',
			texturePath: 'destructive_hurricane/destructive_hurricane_climax/',
			min: 'destructive_hurricane/destructive_hurricane_climax/min_destructive_hurricane_climax'
		}
	],

	// Energy Conversion (AG_ENERGY_CONVERSION), from the client's own effect folders.
	ef_ag_energy_conversion: [
		{
			type: 'STR',
			file: 'archmage/ag_energy_conversion/energy_conversion/energy_conversion',
			texturePath: 'archmage/ag_energy_conversion/energy_conversion/',
			min: 'archmage/ag_energy_conversion/energy_conversion/min_energy_conversion',
			wav: 'effect/ag_energy_conversion'
		}
	],

	// Energy Conversion (AG_ENERGY_CONVERSION), from the client's own effect folders.
	ef_ag_energy_conversion_cast: [
		{
			type: 'STR',
			file: 'archmage/ag_energy_conversion/energy_conversion_cast/energy_conversion_cast',
			texturePath: 'archmage/ag_energy_conversion/energy_conversion_cast/',
			min: 'archmage/ag_energy_conversion/energy_conversion_cast/min_energy_conversion_cast'
		},
		{
			type: 'STR',
			file: 'archmage/ag_energy_conversion/energy_conversion_cast_bottom/energy_conversion_cast_bottom',
			texturePath: 'archmage/ag_energy_conversion/energy_conversion_cast_bottom/',
			min: 'archmage/ag_energy_conversion/energy_conversion_cast_bottom/min_energy_conversion_cast_bottom',
			renderBeforeEntities: true
		}
	]
};
