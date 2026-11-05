/**
 * @module DB/Effects/Table/Jobs/Mage/ElementalMaster
 *
 * The Mage line's ElementalMaster effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Spell Enchanting (EM_SPELL_ENCHANTING), from the client's own effect folders.
	ef_em_spell_enchanting: [
		{
			type: 'STR',
			file: 'spell_enchanting/spell_enchanting/spell_enchanting',
			texturePath: 'spell_enchanting/spell_enchanting/',
			wav: 'effect/em_spell_enchanting'
		}
	],

	// Activity Burn (EM_ACTIVITY_BURN), from the client's own effect folders.
	ef_em_activity_burn: [
		{
			type: 'STR',
			file: 'activity_burn/activity_burn/activity_burn',
			texturePath: 'activity_burn/activity_burn/',
			min: 'activity_burn/activity_burn/min_activity_burn',
			wav: 'effect/em_activity_burn'
		}
	],

	// Activity Burn (EM_ACTIVITY_BURN), from the client's own effect folders.
	ef_em_activity_burn_cast: [
		{
			type: 'STR',
			file: 'activity_burn/activity_burn_cast/activity_burn_cast',
			texturePath: 'activity_burn/activity_burn_cast/',
			min: 'activity_burn/activity_burn_cast/min_activity_burn_cast'
		},
		{
			type: 'STR',
			file: 'activity_burn/activity_burn_cast_bottom/activity_burn_cast_bottom',
			texturePath: 'activity_burn/activity_burn_cast_bottom/',
			min: 'activity_burn/activity_burn_cast_bottom/min_activity_burn_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Increasing Activity (EM_INCREASING_ACTIVITY), from the client's own effect folders.
	ef_em_increasing_activity: [
		{
			type: 'STR',
			file: 'increasing_activity/increasing_activity/increasing_activity',
			texturePath: 'increasing_activity/increasing_activity/',
			min: 'increasing_activity/increasing_activity/min_increasing_activity',
			wav: 'effect/em_increasing_activity'
		}
	],

	// Increasing Activity (EM_INCREASING_ACTIVITY), from the client's own effect folders.
	ef_em_increasing_activity_cast: [
		{
			type: 'STR',
			file: 'increasing_activity/increasing_activity_cast/increasing_activity_cast',
			texturePath: 'increasing_activity/increasing_activity_cast/',
			min: 'increasing_activity/increasing_activity_cast/min_increasing_activity_cast'
		},
		{
			type: 'STR',
			file: 'increasing_activity/increasing_activity_cast_bottom/increasing_activity_cast_bottom',
			texturePath: 'increasing_activity/increasing_activity_cast_bottom/',
			min: 'increasing_activity/increasing_activity_cast_bottom/min_increasing_activity_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Diamond Storm (EM_DIAMOND_STORM), from the client's own effect folders.
	ef_em_diamond_storm: [
		{
			type: 'STR',
			file: 'diamond_storm/diamond_storm/diamond_storm',
			texturePath: 'diamond_storm/diamond_storm/',
			min: 'diamond_storm/diamond_storm/min_diamond_storm',
			wav: 'effect/em_diamond_storm'
		},
		{
			type: 'STR',
			file: 'diamond_storm/diamond_storm_bottom/diamond_storm_bottom',
			texturePath: 'diamond_storm/diamond_storm_bottom/',
			min: 'diamond_storm/diamond_storm_bottom/min_diamond_storm_bottom',
			renderBeforeEntities: true
		}
	],

	// Diamond Storm (EM_DIAMOND_STORM), from the client's own effect folders.
	ef_em_diamond_storm_cast: [
		{
			type: 'STR',
			file: 'diamond_storm/diamond_storm_cast/diamond_storm_cast',
			texturePath: 'diamond_storm/diamond_storm_cast/',
			min: 'diamond_storm/diamond_storm_cast/min_diamond_storm_cast'
		},
		{
			type: 'STR',
			file: 'diamond_storm/diamond_storm_cast_bottom/diamond_storm_cast_bottom',
			texturePath: 'diamond_storm/diamond_storm_cast_bottom/',
			min: 'diamond_storm/diamond_storm_cast_bottom/min_diamond_storm_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Diamond Storm (EM_DIAMOND_STORM), from the client's own effect folders.
	ef_em_diamond_storm_hit: [
		{
			type: 'STR',
			file: 'diamond_storm/diamond_storm_hit/diamond_storm_hit',
			texturePath: 'diamond_storm/diamond_storm_hit/',
			min: 'diamond_storm/diamond_storm_hit/min_diamond_storm_hit'
		}
	],

	// Lightning Land (EM_LIGHTNING_LAND), from the client's own effect folders.
	ef_em_lightning_land: [
		{
			type: 'STR',
			file: 'lightning_land/lightning_land/lightning_land',
			texturePath: 'lightning_land/lightning_land/',
			min: 'lightning_land/lightning_land/min_lightning_land',
			wav: 'effect/em_lightning_land'
		},
		{
			type: 'STR',
			file: 'lightning_land/lightning_land_bottom/lightning_land_bottom',
			texturePath: 'lightning_land/lightning_land_bottom/',
			min: 'lightning_land/lightning_land_bottom/min_lightning_land_bottom',
			renderBeforeEntities: true
		}
	],

	// Lightning Land (EM_LIGHTNING_LAND), from the client's own effect folders.
	ef_em_lightning_land_cast: [
		{
			type: 'STR',
			file: 'lightning_land/lightning_land_cast/lightning_land_cast',
			texturePath: 'lightning_land/lightning_land_cast/',
			min: 'lightning_land/lightning_land_cast/min_lightning_land_cast'
		},
		{
			type: 'STR',
			file: 'lightning_land/lightning_land_cast_bottom/lightning_land_cast_bottom',
			texturePath: 'lightning_land/lightning_land_cast_bottom/',
			min: 'lightning_land/lightning_land_cast_bottom/min_lightning_land_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Lightning Land (EM_LIGHTNING_LAND), from the client's own effect folders.
	ef_em_lightning_land_hit: [
		{
			type: 'STR',
			file: 'lightning_land/lightning_land_hit/lightning_land_hit',
			texturePath: 'lightning_land/lightning_land_hit/',
			min: 'lightning_land/lightning_land_hit/min_lightning_land_hit'
		}
	],

	// Venom Swamp (EM_VENOM_SWAMP), from the client's own effect folders.
	ef_em_venom_swamp: [
		{
			type: 'STR',
			file: 'venom_swamp/venom_swamp_bottom/venom_swamp_bottom',
			texturePath: 'venom_swamp/venom_swamp_bottom/',
			min: 'venom_swamp/venom_swamp_bottom/min_venom_swamp_bottom',
			renderBeforeEntities: true,
			wav: 'effect/em_venom_swamp'
		}
	],

	// Venom Swamp (EM_VENOM_SWAMP), from the client's own effect folders.
	ef_em_venom_swamp_cast: [
		{
			type: 'STR',
			file: 'venom_swamp/venom_swamp_cast/venom_swamp_cast',
			texturePath: 'venom_swamp/venom_swamp_cast/',
			min: 'venom_swamp/venom_swamp_cast/min_venom_swamp_cast'
		},
		{
			type: 'STR',
			file: 'venom_swamp/venom_swamp_cast_bottom/venom_swamp_cast_bottom',
			texturePath: 'venom_swamp/venom_swamp_cast_bottom/',
			min: 'venom_swamp/venom_swamp_cast_bottom/min_venom_swamp_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Venom Swamp (EM_VENOM_SWAMP), from the client's own effect folders.
	ef_em_venom_swamp_hit: [
		{
			type: 'STR',
			file: 'venom_swamp/venom_swamp_hit/venom_swamp_hit',
			texturePath: 'venom_swamp/venom_swamp_hit/',
			min: 'venom_swamp/venom_swamp_hit/min_venom_swamp_hit'
		}
	],

	// Conflagration (EM_CONFLAGRATION), from the client's own effect folders.
	ef_em_conflagration: [
		{
			type: 'STR',
			file: 'conflagration/conflagration',
			texturePath: 'conflagration/',
			wav: 'effect/em_conflagration'
		},
		{
			type: 'STR',
			file: 'conflagration/conflagration_bottom/conflagration_bottom',
			texturePath: 'conflagration/conflagration_bottom/',
			min: 'conflagration/conflagration_bottom/min_conflagration_bottom',
			renderBeforeEntities: true
		}
	],

	// Conflagration (EM_CONFLAGRATION), from the client's own effect folders.
	ef_em_conflagration_cast: [
		{
			type: 'STR',
			file: 'conflagration/conflagration_cast/conflagration_cast',
			texturePath: 'conflagration/conflagration_cast/',
			min: 'conflagration/conflagration_cast/min_conflagration_cast'
		},
		{
			type: 'STR',
			file: 'conflagration/conflagration_cast_bottom/conflagration_cast_bottom',
			texturePath: 'conflagration/conflagration_cast_bottom/',
			min: 'conflagration/conflagration_cast_bottom/min_conflagration_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Conflagration (EM_CONFLAGRATION), from the client's own effect folders.
	ef_em_conflagration_hit: [
		{
			type: 'STR',
			file: 'conflagration/conflagration_hit/conflagration_hit',
			texturePath: 'conflagration/conflagration_hit/',
			min: 'conflagration/conflagration_hit/min_conflagration_hit'
		}
	],

	// Terra Drive (EM_TERRA_DRIVE), from the client's own effect folders.
	ef_em_terra_drive: [
		{
			type: 'STR',
			file: 'terradrive/terradrive/terradrive',
			texturePath: 'terradrive/terradrive/',
			min: 'terradrive/terradrive/min_terradrive',
			wav: 'effect/em_terra_drive'
		},
		{
			type: 'STR',
			file: 'terradrive/terradrive_bottom/terradrive_bottom',
			texturePath: 'terradrive/terradrive_bottom/',
			min: 'terradrive/terradrive_bottom/min_terradrive_bottom',
			renderBeforeEntities: true
		}
	],

	// Terra Drive (EM_TERRA_DRIVE), from the client's own effect folders.
	ef_em_terra_drive_cast: [
		{
			type: 'STR',
			file: 'terradrive/terradrive_cast/terradrive_cast',
			texturePath: 'terradrive/terradrive_cast/',
			min: 'terradrive/terradrive_cast/min_terradrive_cast'
		},
		{
			type: 'STR',
			file: 'terradrive/terradrive_cast_bottom/terradrive_cast_bottom',
			texturePath: 'terradrive/terradrive_cast_bottom/',
			min: 'terradrive/terradrive_cast_bottom/min_terradrive_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Terra Drive (EM_TERRA_DRIVE), from the client's own effect folders.
	ef_em_terra_drive_hit: [
		{
			type: 'STR',
			file: 'terradrive/terradrive_hit/terradrive_hit',
			texturePath: 'terradrive/terradrive_hit/',
			min: 'terradrive/terradrive_hit/min_terradrive_hit'
		}
	],

	// Summon Elemental Ardor (EM_SUMMON_ELEMENTAL_ARDOR), from the client's own effect folders.
	ef_em_summon_elemental_ardor: [
		{
			type: 'STR',
			file: 'ardor/ardor/ardor',
			texturePath: 'ardor/ardor/',
			min: 'ardor/ardor/min_ardor'
		},
		{
			type: 'STR',
			file: 'ardor/ardor_bottom/ardor_bottom',
			texturePath: 'ardor/ardor_bottom/',
			min: 'ardor/ardor_bottom/min_ardor_bottom',
			renderBeforeEntities: true
		}
	],

	// Summon Elemental Ardor (EM_SUMMON_ELEMENTAL_ARDOR), from the client's own effect folders.
	ef_em_summon_elemental_ardor_cast: [
		{
			type: 'STR',
			file: 'ardor/ardor_cast/ardor_cast',
			texturePath: 'ardor/ardor_cast/',
			min: 'ardor/ardor_cast/min_ardor_cast'
		},
		{
			type: 'STR',
			file: 'ardor/ardor_cast_bottom/ardor_cast_bottom',
			texturePath: 'ardor/ardor_cast_bottom/',
			min: 'ardor/ardor_cast_bottom/min_ardor_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Summon Elemental Ardor (EM_SUMMON_ELEMENTAL_ARDOR), from the client's own effect folders.
	ef_em_summon_elemental_ardor_hit: [
		{
			type: 'STR',
			file: 'ardor/ardor_hit/ardor_hit',
			texturePath: 'ardor/ardor_hit/',
			min: 'ardor/ardor_hit/min_ardor_hit'
		}
	],

	// Summon Elemental Diluvio (EM_SUMMON_ELEMENTAL_DILUVIO), from the client's own effect folders.
	ef_em_summon_elemental_diluvio_cast: [
		{
			type: 'STR',
			file: 'diluvio/diluvio_cast/diluvio_cast',
			texturePath: 'diluvio/diluvio_cast/',
			min: 'diluvio/diluvio_cast/min_diluvio_cast'
		},
		{
			type: 'STR',
			file: 'diluvio/diluvio_cast_bottom/diluvio_cast_bottom',
			texturePath: 'diluvio/diluvio_cast_bottom/',
			min: 'diluvio/diluvio_cast_bottom/min_diluvio_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Summon Elemental Diluvio (EM_SUMMON_ELEMENTAL_DILUVIO), from the client's own effect folders.
	ef_em_summon_elemental_diluvio_hit: [
		{
			type: 'STR',
			file: 'diluvio/diluvio_hit/diluvio_hit',
			texturePath: 'diluvio/diluvio_hit/',
			min: 'diluvio/diluvio_hit/min_diluvio_hit'
		}
	],

	// Summon Elemental Procella (EM_SUMMON_ELEMENTAL_PROCELLA), from the client's own effect folders.
	ef_em_summon_elemental_procella: [
		{
			type: 'STR',
			file: 'procella/procella/procella',
			texturePath: 'procella/procella/',
			min: 'procella/procella/min_procella'
		},
		{
			type: 'STR',
			file: 'procella/procella_bottom/procella_bottom',
			texturePath: 'procella/procella_bottom/',
			min: 'procella/procella_bottom/min_procella_bottom',
			renderBeforeEntities: true
		}
	],

	// Summon Elemental Procella (EM_SUMMON_ELEMENTAL_PROCELLA), from the client's own effect folders.
	ef_em_summon_elemental_procella_cast: [
		{
			type: 'STR',
			file: 'procella/procella_cast/procella_cast',
			texturePath: 'procella/procella_cast/',
			min: 'procella/procella_cast/min_procella_cast'
		},
		{
			type: 'STR',
			file: 'procella/procella_cast_bottom/procella_cast_bottom',
			texturePath: 'procella/procella_cast_bottom/',
			min: 'procella/procella_cast_bottom/min_procella_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Summon Elemental Procella (EM_SUMMON_ELEMENTAL_PROCELLA), from the client's own effect folders.
	ef_em_summon_elemental_procella_hit: [
		{
			type: 'STR',
			file: 'procella/procella_hit/procella_hit',
			texturePath: 'procella/procella_hit/',
			min: 'procella/procella_hit/min_procella_hit'
		}
	],

	// Summon Elemental Terremotus (EM_SUMMON_ELEMENTAL_TERREMOTUS), from the client's own effect folders.
	ef_em_summon_elemental_terremotus: [
		{
			type: 'STR',
			file: 'terremotus/terremotus/terremotus',
			texturePath: 'terremotus/terremotus/',
			min: 'terremotus/terremotus/min_terremotus'
		}
	],

	// Summon Elemental Terremotus (EM_SUMMON_ELEMENTAL_TERREMOTUS), from the client's own effect folders.
	ef_em_summon_elemental_terremotus_cast: [
		{
			type: 'STR',
			file: 'terremotus/terremotus_cast/terremotus_cast',
			texturePath: 'terremotus/terremotus_cast/',
			min: 'terremotus/terremotus_cast/min_terremotus_cast'
		},
		{
			type: 'STR',
			file: 'terremotus/terremotus_cast_bottom/terremotus_cast_bottom',
			texturePath: 'terremotus/terremotus_cast_bottom/',
			min: 'terremotus/terremotus_cast_bottom/min_terremotus_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Summon Elemental Terremotus (EM_SUMMON_ELEMENTAL_TERREMOTUS), from the client's own effect folders.
	ef_em_summon_elemental_terremotus_hit: [
		{
			type: 'STR',
			file: 'terremotus/terremotus_hit/terremotus_hit',
			texturePath: 'terremotus/terremotus_hit/',
			min: 'terremotus/terremotus_hit/min_terremotus_hit'
		}
	],

	// Summon Elemental Serpens (EM_SUMMON_ELEMENTAL_SERPENS), from the client's own effect folders.
	ef_em_summon_elemental_serpens: [
		{
			type: 'STR',
			file: 'serpens/serpens_bottom/serpens_bottom',
			texturePath: 'serpens/serpens_bottom/',
			min: 'serpens/serpens_bottom/min_serpens_bottom',
			renderBeforeEntities: true
		}
	],

	// Summon Elemental Serpens (EM_SUMMON_ELEMENTAL_SERPENS), from the client's own effect folders.
	ef_em_summon_elemental_serpens_cast: [
		{
			type: 'STR',
			file: 'serpens/serpens_cast/serpens_cast',
			texturePath: 'serpens/serpens_cast/',
			min: 'serpens/serpens_cast/min_serpens_cast'
		},
		{
			type: 'STR',
			file: 'serpens/serpens_cast_bottom/serpens_cast_bottom',
			texturePath: 'serpens/serpens_cast_bottom/',
			min: 'serpens/serpens_cast_bottom/min_serpens_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Summon Elemental Serpens (EM_SUMMON_ELEMENTAL_SERPENS), from the client's own effect folders.
	ef_em_summon_elemental_serpens_hit: [
		{
			type: 'STR',
			file: 'serpens/serpens_hit/serpens_hit',
			texturePath: 'serpens/serpens_hit/',
			min: 'serpens/serpens_hit/min_serpens_hit'
		}
	],

	// Elemental Buster (EM_ELEMENTAL_BUSTER), from the client's own effect folders.
	ef_em_elemental_buster_cast: [
		{
			type: 'STR',
			file: 'elemental_buster/elemental_buster_cast/elemental_buster_cast',
			texturePath: 'elemental_buster/elemental_buster_cast/',
			min: 'elemental_buster/elemental_buster_cast/min_elemental_buster_cast'
		}
	],

	// Elemental Buster Fire (EM_ELEMENTAL_BUSTER_FIRE), from the client's own effect folders.
	ef_em_elemental_buster_fire: [
		{
			type: 'STR',
			file: 'elemental_buster/elemental_buster/elemental_buster_fire/elemental_buster_fire',
			texturePath: 'elemental_buster/elemental_buster/elemental_buster_fire/',
			min: 'elemental_buster/elemental_buster/elemental_buster_fire/min_elemental_buster_fire'
		},
		{
			type: 'STR',
			file: 'elemental_buster/elemental_buster/elemental_buster_fire_bottom/elemental_buster_fire_bottom',
			texturePath: 'elemental_buster/elemental_buster/elemental_buster_fire_bottom/',
			min: 'elemental_buster/elemental_buster/elemental_buster_fire_bottom/min_elemental_buster_fire_bottom',
			renderBeforeEntities: true
		}
	],

	// Elemental Buster Fire (EM_ELEMENTAL_BUSTER_FIRE), from the client's own effect folders.
	ef_em_elemental_buster_fire_hit: [
		{
			type: 'STR',
			file: 'elemental_buster/elemental_buster_hit/elemental_buster_fire_hit/elemental_buster_fire_hit',
			texturePath: 'elemental_buster/elemental_buster_hit/elemental_buster_fire_hit/',
			min: 'elemental_buster/elemental_buster_hit/elemental_buster_fire_hit/min_elemental_buster_fire_hit'
		}
	],

	// Elemental Buster Water (EM_ELEMENTAL_BUSTER_WATER), from the client's own effect folders.
	ef_em_elemental_buster_water: [
		{
			type: 'STR',
			file: 'elemental_buster/elemental_buster/elemental_buster_water/elemental_buster_water',
			texturePath: 'elemental_buster/elemental_buster/elemental_buster_water/',
			min: 'elemental_buster/elemental_buster/elemental_buster_water/min_elemental_buster_water'
		},
		{
			type: 'STR',
			file: 'elemental_buster/elemental_buster/elemental_buster_water_bottom/elemental_buster_water_bottom',
			texturePath: 'elemental_buster/elemental_buster/elemental_buster_water_bottom/',
			min: 'elemental_buster/elemental_buster/elemental_buster_water_bottom/min_elemental_buster_water_bottom',
			renderBeforeEntities: true
		}
	],

	// Elemental Buster Water (EM_ELEMENTAL_BUSTER_WATER), from the client's own effect folders.
	ef_em_elemental_buster_water_hit: [
		{
			type: 'STR',
			file: 'elemental_buster/elemental_buster_hit/elemental_buster_water_hit/elemental_buster_water_hit',
			texturePath: 'elemental_buster/elemental_buster_hit/elemental_buster_water_hit/',
			min: 'elemental_buster/elemental_buster_hit/elemental_buster_water_hit/min_elemental_buster_water_hit'
		}
	],

	// Elemental Buster Wind (EM_ELEMENTAL_BUSTER_WIND), from the client's own effect folders.
	ef_em_elemental_buster_wind: [
		{
			type: 'STR',
			file: 'elemental_buster/elemental_buster/elemental_buster_wind/elemental_buster_wind',
			texturePath: 'elemental_buster/elemental_buster/elemental_buster_wind/',
			min: 'elemental_buster/elemental_buster/elemental_buster_wind/min_elemental_buster_wind'
		},
		{
			type: 'STR',
			file: 'elemental_buster/elemental_buster/elemental_buster_wind_bottom/elemental_buster_wind_bottom',
			texturePath: 'elemental_buster/elemental_buster/elemental_buster_wind_bottom/',
			min: 'elemental_buster/elemental_buster/elemental_buster_wind_bottom/min_elemental_buster_wind_bottom',
			renderBeforeEntities: true
		}
	],

	// Elemental Buster Wind (EM_ELEMENTAL_BUSTER_WIND), from the client's own effect folders.
	ef_em_elemental_buster_wind_hit: [
		{
			type: 'STR',
			file: 'elemental_buster/elemental_buster_hit/elemental_buster_wind_hit/elemental_buster_wind_hit',
			texturePath: 'elemental_buster/elemental_buster_hit/elemental_buster_wind_hit/',
			min: 'elemental_buster/elemental_buster_hit/elemental_buster_wind_hit/min_elemental_buster_wind_hit'
		}
	],

	// Elemental Buster Ground (EM_ELEMENTAL_BUSTER_GROUND), from the client's own effect folders.
	ef_em_elemental_buster_ground: [
		{
			type: 'STR',
			file: 'elemental_buster/elemental_buster/elemental_buster_land/elemental_buster_land',
			texturePath: 'elemental_buster/elemental_buster/elemental_buster_land/',
			min: 'elemental_buster/elemental_buster/elemental_buster_land/min_elemental_buster_land'
		},
		{
			type: 'STR',
			file: 'elemental_buster/elemental_buster/elemental_buster_land_bottom/elemental_buster_land_bottom',
			texturePath: 'elemental_buster/elemental_buster/elemental_buster_land_bottom/',
			min: 'elemental_buster/elemental_buster/elemental_buster_land_bottom/min_elemental_buster_land_bottom',
			renderBeforeEntities: true
		}
	],

	// Elemental Buster Ground (EM_ELEMENTAL_BUSTER_GROUND), from the client's own effect folders.
	ef_em_elemental_buster_ground_hit: [
		{
			type: 'STR',
			file: 'elemental_buster/elemental_buster_hit/elemental_buster_land_hit/elemental_buster_land_hit',
			texturePath: 'elemental_buster/elemental_buster_hit/elemental_buster_land_hit/',
			min: 'elemental_buster/elemental_buster_hit/elemental_buster_land_hit/min_elemental_buster_land_hit'
		}
	],

	// Elemental Buster Poison (EM_ELEMENTAL_BUSTER_POISON), from the client's own effect folders.
	ef_em_elemental_buster_poison: [
		{
			type: 'STR',
			file: 'elemental_buster/elemental_buster/elemental_buster_poison/elemental_buster_poison',
			texturePath: 'elemental_buster/elemental_buster/elemental_buster_poison/',
			min: 'elemental_buster/elemental_buster/elemental_buster_poison/min_elemental_buster_poison'
		},
		{
			type: 'STR',
			file: 'elemental_buster/elemental_buster/elemental_buster_poison_bottom/elemental_buster_poison_bottom',
			texturePath: 'elemental_buster/elemental_buster/elemental_buster_poison_bottom/',
			min: 'elemental_buster/elemental_buster/elemental_buster_poison_bottom/min_elemental_buster_poison_bottom',
			renderBeforeEntities: true
		}
	],

	// Elemental Buster Poison (EM_ELEMENTAL_BUSTER_POISON), from the client's own effect folders.
	ef_em_elemental_buster_poison_hit: [
		{
			type: 'STR',
			file: 'elemental_buster/elemental_buster_hit/elemental_buster_poison_hit/elemental_buster_poison_hit',
			texturePath: 'elemental_buster/elemental_buster_hit/elemental_buster_poison_hit/',
			min: 'elemental_buster/elemental_buster_hit/elemental_buster_poison_hit/min_elemental_buster_poison_hit'
		}
	],

	// Psychic Stream (EM_PSYCHIC_STREAM), from the client's own effect folders.
	ef_em_psychic_stream: [
		{
			type: 'STR',
			file: 'elemental_master/em_psychic_stream/psychic_stream/psychic_stream',
			texturePath: 'elemental_master/em_psychic_stream/psychic_stream/',
			min: 'elemental_master/em_psychic_stream/psychic_stream/min_psychic_stream',
			wav: 'effect/em_psychic_stream'
		},
		{
			type: 'STR',
			file: 'elemental_master/em_psychic_stream/psychic_stream_bottom/psychic_stream_bottom',
			texturePath: 'elemental_master/em_psychic_stream/psychic_stream_bottom/',
			min: 'elemental_master/em_psychic_stream/psychic_stream_bottom/min_psychic_stream_bottom',
			renderBeforeEntities: true
		}
	],

	// Psychic Stream (EM_PSYCHIC_STREAM), from the client's own effect folders.
	ef_em_psychic_stream_cast: [
		{
			type: 'STR',
			file: 'elemental_master/em_psychic_stream/psychic_stream_cast/psychic_stream_cast',
			texturePath: 'elemental_master/em_psychic_stream/psychic_stream_cast/',
			min: 'elemental_master/em_psychic_stream/psychic_stream_cast/min_psychic_stream_cast'
		}
	],

	// Psychic Stream (EM_PSYCHIC_STREAM), from the client's own effect folders.
	ef_em_psychic_stream_hit: [
		{
			type: 'STR',
			file: 'elemental_master/em_psychic_stream/psychic_stream_hit/psychic_stream_hit',
			texturePath: 'elemental_master/em_psychic_stream/psychic_stream_hit/',
			min: 'elemental_master/em_psychic_stream/psychic_stream_hit/min_psychic_stream_hit'
		}
	],

	// Flame Technic (EM_EL_FLAMETECHNIC), from the client's own effect folders.
	ef_em_el_flametechnic: [
		{
			type: 'STR',
			file: 'ardor/ardor_flametechnic/ardor_flametechnic',
			texturePath: 'ardor/ardor_flametechnic/',
			min: 'ardor/ardor_flametechnic/min_ardor_flametechnic'
		}
	],

	// Flame Armor (EM_EL_FLAMEARMOR), from the client's own effect folders.
	ef_em_el_flamearmor: [
		{
			type: 'STR',
			file: 'ardor/ardor_flamearmor/ardor_flamearmor',
			texturePath: 'ardor/ardor_flamearmor/',
			min: 'ardor/ardor_flamearmor/min_ardor_flamearmor'
		}
	],

	// Cold Force (EM_EL_COLD_FORCE), from the client's own effect folders.
	ef_em_el_cold_force: [
		{
			type: 'STR',
			file: 'diluvio/diluvio_cold_force/diluvio_cold_force',
			texturePath: 'diluvio/diluvio_cold_force/',
			min: 'diluvio/diluvio_cold_force/min_diluvio_cold_force'
		}
	],

	// Grace Breeze (EM_EL_GRACE_BREEZE), from the client's own effect folders.
	ef_em_el_grace_breeze: [
		{
			type: 'STR',
			file: 'procella/procella_grace_breeze/procella_grace_breeze',
			texturePath: 'procella/procella_grace_breeze/',
			min: 'procella/procella_grace_breeze/min_procella_grace_breeze'
		}
	],

	// Earth Care (EM_EL_EARTH_CARE), from the client's own effect folders.
	ef_em_el_earth_care: [
		{
			type: 'STR',
			file: 'terremotus/terremotus_earth_care/terremotus_earth_care',
			texturePath: 'terremotus/terremotus_earth_care/',
			min: 'terremotus/terremotus_earth_care/min_terremotus_earth_care'
		}
	],

	// Deep Poisoning (EM_EL_DEEP_POISONING), from the client's own effect folders.
	ef_em_el_deep_poisoning: [
		{
			type: 'STR',
			file: 'serpens/serpens_deep_poisoning/serpens_deep_poisoning',
			texturePath: 'serpens/serpens_deep_poisoning/',
			min: 'serpens/serpens_deep_poisoning/min_serpens_deep_poisoning'
		}
	],

	// Deadly Poison (EM_EL_DEADLY_POISON), from the client's own effect folders.
	ef_em_el_deadly_poison: [
		{
			type: 'STR',
			file: 'deadlypoison/deadlypoison',
			texturePath: 'deadlypoison/'
		}
	]
};
