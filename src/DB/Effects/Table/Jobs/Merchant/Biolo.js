/**
 * @module DB/Effects/Table/Jobs/Merchant/Biolo
 *
 * The Merchant line's Biolo effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Actified Zone Water Attack (BO_ACIDIFIED_ZONE_WATER_ATK), from the client's own effect folders.
	ef_bo_acidified_zone_water_atk: [
		{
			type: 'STR',
			file: 'acidified_zone_water/acidified_zone_water_hit/acidified_zone_water_hit',
			texturePath: 'acidified_zone_water/acidified_zone_water_hit/',
			min: 'acidified_zone_water/acidified_zone_water_hit/min_acidified_zone_water_hit'
		}
	],

	// Actified Zone Ground Attack (BO_ACIDIFIED_ZONE_GROUND_ATK), from the client's own effect folders.
	ef_bo_acidified_zone_ground_atk: [
		{
			type: 'STR',
			file: 'acidified_zone_ground/acidified_zone_ground_hit/acidified_zone_ground_hit',
			texturePath: 'acidified_zone_ground/acidified_zone_ground_hit/',
			min: 'acidified_zone_ground/acidified_zone_ground_hit/min_acidified_zone_ground_hit'
		}
	],

	// Actified Zone Wind Attack (BO_ACIDIFIED_ZONE_WIND_ATK), from the client's own effect folders.
	ef_bo_acidified_zone_wind_atk: [
		{
			type: 'STR',
			file: 'acidified_zone_wind/acidified_zone_wind_hit/acidified_zone_wind_hit',
			texturePath: 'acidified_zone_wind/acidified_zone_wind_hit/',
			min: 'acidified_zone_wind/acidified_zone_wind_hit/min_acidified_zone_wind_hit'
		}
	],

	// Actified Zone Fire Attack (BO_ACIDIFIED_ZONE_FIRE_ATK), from the client's own effect folders.
	ef_bo_acidified_zone_fire_atk: [
		{
			type: 'STR',
			file: 'acidified_zone_fire/acidified_zone_fire_hit/acidified_zone_fire_hit',
			texturePath: 'acidified_zone_fire/acidified_zone_fire_hit/',
			min: 'acidified_zone_fire/acidified_zone_fire_hit/min_acidified_zone_fire_hit'
		}
	],

	// Advance Protection (BO_ADVANCE_PROTECTION), from the client's own effect folders.
	ef_bo_advance_protection: [
		{
			wav: 'effect/bo_advance_protection',
			attachedEntity: true
		}
	],

	// Acidified Zone Water (BO_ACIDIFIED_ZONE_WATER), from the client's own effect folders.
	ef_bo_acidified_zone_water_cast: [
		{
			type: 'STR',
			file: 'acidified_zone_water/acidified_zone_water_cast/acidified_zone_water_cast',
			texturePath: 'acidified_zone_water/acidified_zone_water_cast/',
			min: 'acidified_zone_water/acidified_zone_water_cast/min_acidified_zone_water_cast',
			wav: 'effect/bo_acidified_zone_water'
		},
		{
			type: 'STR',
			file: 'acidified_zone_water/acidified_zone_water_cast_bottom/acidified_zone_water_cast_bottom',
			texturePath: 'acidified_zone_water/acidified_zone_water_cast_bottom/',
			min: 'acidified_zone_water/acidified_zone_water_cast_bottom/min_acidified_zone_water_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Acidified Zone Water (BO_ACIDIFIED_ZONE_WATER), from the client's own effect folders.
	ef_bo_acidified_zone_water_hit: [
		{
			type: 'STR',
			file: 'acidified_zone_water/acidified_zone_water_hit/acidified_zone_water_hit',
			texturePath: 'acidified_zone_water/acidified_zone_water_hit/',
			min: 'acidified_zone_water/acidified_zone_water_hit/min_acidified_zone_water_hit'
		}
	],

	// Acidified Zone Ground (BO_ACIDIFIED_ZONE_GROUND), from the client's own effect folders.
	ef_bo_acidified_zone_ground_cast: [
		{
			type: 'STR',
			file: 'acidified_zone_ground/acidified_zone_ground_cast/acidified_zone_ground_cast',
			texturePath: 'acidified_zone_ground/acidified_zone_ground_cast/',
			min: 'acidified_zone_ground/acidified_zone_ground_cast/min_acidified_zone_ground_cast',
			wav: 'effect/bo_acidified_zone_ground'
		},
		{
			type: 'STR',
			file: 'acidified_zone_ground/acidified_zone_ground_cast_bottom/acidified_zone_ground_cast_bottom',
			texturePath: 'acidified_zone_ground/acidified_zone_ground_cast_bottom/',
			min: 'acidified_zone_ground/acidified_zone_ground_cast_bottom/min_acidified_zone_ground_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Acidified Zone Ground (BO_ACIDIFIED_ZONE_GROUND), from the client's own effect folders.
	ef_bo_acidified_zone_ground_hit: [
		{
			type: 'STR',
			file: 'acidified_zone_ground/acidified_zone_ground_hit/acidified_zone_ground_hit',
			texturePath: 'acidified_zone_ground/acidified_zone_ground_hit/',
			min: 'acidified_zone_ground/acidified_zone_ground_hit/min_acidified_zone_ground_hit'
		}
	],

	// Acidified Zone Wind (BO_ACIDIFIED_ZONE_WIND), from the client's own effect folders.
	ef_bo_acidified_zone_wind_cast: [
		{
			type: 'STR',
			file: 'acidified_zone_wind/acidified_zone_wind_cast/acidified_zone_wind_cast',
			texturePath: 'acidified_zone_wind/acidified_zone_wind_cast/',
			min: 'acidified_zone_wind/acidified_zone_wind_cast/min_acidified_zone_wind_cast',
			wav: 'effect/bo_acidified_zone_wind'
		},
		{
			type: 'STR',
			file: 'acidified_zone_wind/acidified_zone_wind_cast_bottom/acidified_zone_wind_cast_bottom',
			texturePath: 'acidified_zone_wind/acidified_zone_wind_cast_bottom/',
			min: 'acidified_zone_wind/acidified_zone_wind_cast_bottom/min_acidified_zone_wind_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Acidified Zone Wind (BO_ACIDIFIED_ZONE_WIND), from the client's own effect folders.
	ef_bo_acidified_zone_wind_hit: [
		{
			type: 'STR',
			file: 'acidified_zone_wind/acidified_zone_wind_hit/acidified_zone_wind_hit',
			texturePath: 'acidified_zone_wind/acidified_zone_wind_hit/',
			min: 'acidified_zone_wind/acidified_zone_wind_hit/min_acidified_zone_wind_hit'
		}
	],

	// Acidified Zone Fire (BO_ACIDIFIED_ZONE_FIRE), from the client's own effect folders.
	ef_bo_acidified_zone_fire_cast: [
		{
			type: 'STR',
			file: 'acidified_zone_fire/acidified_zone_fire_cast/acidified_zone_fire_cast',
			texturePath: 'acidified_zone_fire/acidified_zone_fire_cast/',
			min: 'acidified_zone_fire/acidified_zone_fire_cast/min_acidified_zone_fire_cast',
			wav: 'effect/bo_acidified_zone_fire'
		},
		{
			type: 'STR',
			file: 'acidified_zone_fire/acidified_zone_fire_cast_bottom/acidified_zone_fire_cast_bottom',
			texturePath: 'acidified_zone_fire/acidified_zone_fire_cast_bottom/',
			min: 'acidified_zone_fire/acidified_zone_fire_cast_bottom/min_acidified_zone_fire_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Acidified Zone Fire (BO_ACIDIFIED_ZONE_FIRE), from the client's own effect folders.
	ef_bo_acidified_zone_fire_hit: [
		{
			type: 'STR',
			file: 'acidified_zone_fire/acidified_zone_fire_hit/acidified_zone_fire_hit',
			texturePath: 'acidified_zone_fire/acidified_zone_fire_hit/',
			min: 'acidified_zone_fire/acidified_zone_fire_hit/min_acidified_zone_fire_hit'
		}
	],

	// Wooden Warrior (BO_WOODENWARRIOR), from the client's own effect folders.
	ef_bo_woodenwarrior_cast: [
		{
			type: 'STR',
			file: 'wooden_warrior/wooden_warrior_cast/wooden_warrior_cast',
			texturePath: 'wooden_warrior/wooden_warrior_cast/',
			min: 'wooden_warrior/wooden_warrior_cast/min_wooden_warrior_cast'
		},
		{
			type: 'STR',
			file: 'wooden_warrior/wooden_warrior_cast_bottom/wooden_warrior_cast_bottom',
			texturePath: 'wooden_warrior/wooden_warrior_cast_bottom/',
			min: 'wooden_warrior/wooden_warrior_cast_bottom/min_wooden_warrior_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Wooden Warrior (BO_WOODENWARRIOR), from the client's own effect folders.
	ef_bo_woodenwarrior_hit: [
		{
			type: 'STR',
			file: 'wooden_warrior/throwrock/throwrock_hit/throwrock_hit',
			texturePath: 'wooden_warrior/throwrock/throwrock_hit/',
			min: 'wooden_warrior/throwrock/throwrock_hit/min_throwrock_hit'
		},
		{
			type: 'STR',
			file: 'wooden_warrior/wooden_attack/wooden_attack/wooden_attack',
			texturePath: 'wooden_warrior/wooden_attack/wooden_attack/',
			min: 'wooden_warrior/wooden_attack/wooden_attack/min_wooden_attack'
		},
		{
			type: 'STR',
			file: 'wooden_warrior/wooden_attack/wooden_attack_hit/wooden_attack_hit',
			texturePath: 'wooden_warrior/wooden_attack/wooden_attack_hit/',
			min: 'wooden_warrior/wooden_attack/wooden_attack_hit/min_wooden_attack_hit'
		}
	],

	// Wooden Fairy (BO_WOODEN_FAIRY), from the client's own effect folders.
	ef_bo_wooden_fairy_cast: [
		{
			type: 'STR',
			file: 'wooden_fairy/wooden_cast/wooden_cast',
			texturePath: 'wooden_fairy/wooden_cast/',
			min: 'wooden_fairy/wooden_cast/min_wooden_cast'
		},
		{
			type: 'STR',
			file: 'wooden_fairy/wooden_cast_bottom/wooden_cast_bottom',
			texturePath: 'wooden_fairy/wooden_cast_bottom/',
			min: 'wooden_fairy/wooden_cast_bottom/min_wooden_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Research Report (BO_RESEARCHREPORT), from the client's own effect folders.
	ef_bo_researchreport: [
		{
			type: 'STR',
			file: 'research_report/researchreport/researchreport',
			texturePath: 'research_report/researchreport/',
			min: 'research_report/researchreport/min_researchreport',
			wav: 'effect/bo_researchreport'
		}
	],

	// Research Report (BO_RESEARCHREPORT), from the client's own effect folders.
	ef_bo_researchreport_cast: [
		{
			type: 'STR',
			file: 'research_report/researchreport_cast/researchreport_cast',
			texturePath: 'research_report/researchreport_cast/',
			min: 'research_report/researchreport_cast/min_researchreport_cast'
		},
		{
			type: 'STR',
			file: 'research_report/researchreport_cast_bottom/researchreport_cast_bottom',
			texturePath: 'research_report/researchreport_cast_bottom/',
			min: 'research_report/researchreport_cast_bottom/min_researchreport_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Hell Tree (BO_HELLTREE), from the client's own effect folders.
	ef_bo_helltree_cast: [
		{
			type: 'STR',
			file: 'helltree/helltree_cast/helltree_cast',
			texturePath: 'helltree/helltree_cast/',
			min: 'helltree/helltree_cast/min_helltree_cast'
		},
		{
			type: 'STR',
			file: 'helltree/helltree_cast_bottom/helltree_cast_bottom',
			texturePath: 'helltree/helltree_cast_bottom/',
			min: 'helltree/helltree_cast_bottom/min_helltree_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Wooden Attack (BO_WOODEN_ATTACK), from the client's own effect folders.
	ef_bo_wooden_attack_hit: [
		{
			type: 'STR',
			file: 'wooden_warrior/wooden_attack/wooden_attack/wooden_attack',
			texturePath: 'wooden_warrior/wooden_attack/wooden_attack/',
			min: 'wooden_warrior/wooden_attack/wooden_attack/min_wooden_attack',
			wav: 'effect/bo_wooden_attack'
		},
		{
			type: 'STR',
			file: 'wooden_warrior/wooden_attack/wooden_attack_hit/wooden_attack_hit',
			texturePath: 'wooden_warrior/wooden_attack/wooden_attack_hit/',
			min: 'wooden_warrior/wooden_attack/wooden_attack_hit/min_wooden_attack_hit'
		}
	],

	// Explosive Powder (BO_EXPLOSIVE_POWDER), from the client's own effect folders.
	ef_bo_explosive_powder: [
		{
			type: 'STR',
			file: 'biolo/explosive_powder/explosive_powder/explosive_powder',
			texturePath: 'biolo/explosive_powder/explosive_powder/',
			min: 'biolo/explosive_powder/explosive_powder/min_explosive_powder',
			wav: 'effect/bo_explosive_powder'
		}
	],

	// Mayhemic Thorns (BO_MAYHEMIC_THORNS), from the client's own effect folders.
	ef_bo_mayhemic_thorns: [
		{
			type: 'STR',
			file: 'biolo/mayhemic_thorns/mayhemic_thorns/mayhemic_thorns',
			texturePath: 'biolo/mayhemic_thorns/mayhemic_thorns/',
			min: 'biolo/mayhemic_thorns/mayhemic_thorns/min_mayhemic_thorns',
			wav: 'effect/bo_mayhemic_thorns'
		},
		{
			type: 'STR',
			file: 'biolo/mayhemic_thorns/mayhemic_thorns_bottom/mayhemic_thorns_bottom',
			texturePath: 'biolo/mayhemic_thorns/mayhemic_thorns_bottom/',
			min: 'biolo/mayhemic_thorns/mayhemic_thorns_bottom/min_mayhemic_thorns_bottom',
			renderBeforeEntities: true
		}
	],

	// Mystery Powder (BO_MYSTERY_POWDER), from the client's own effect folders.
	ef_bo_mystery_powder: [
		{
			type: 'STR',
			file: 'biolo/bo_mystery_powder/mistery_powder/mistery_powder',
			texturePath: 'biolo/bo_mystery_powder/mistery_powder/',
			min: 'biolo/bo_mystery_powder/mistery_powder/min_mistery_powder',
			wav: 'effect/bo_mystery_powder'
		}
	],

	// Mystery Powder (BO_MYSTERY_POWDER), from the client's own effect folders.
	ef_bo_mystery_powder_hit: [
		{
			type: 'STR',
			file: 'biolo/bo_mystery_powder/mistery_powder_hit/mistery_powder_hit',
			texturePath: 'biolo/bo_mystery_powder/mistery_powder_hit/',
			min: 'biolo/bo_mystery_powder/mistery_powder_hit/min_mistery_powder_hit'
		}
	],

	// Dust Explosion (BO_DUST_EXPLOSION), from the client's own effect folders.
	ef_bo_dust_explosion: [
		{
			type: 'STR',
			file: 'biolo/bo_dust_explosion/dust_explosion/dust_explosion',
			texturePath: 'biolo/bo_dust_explosion/dust_explosion/',
			min: 'biolo/bo_dust_explosion/dust_explosion/min_dust_explosion'
		}
	],

	// Dust Explosion (BO_DUST_EXPLOSION), from the client's own effect folders.
	ef_bo_dust_explosion_hit: [
		{
			type: 'STR',
			file: 'biolo/bo_dust_explosion/dust_explosion_hit/dust_explosion_hit',
			texturePath: 'biolo/bo_dust_explosion/dust_explosion_hit/',
			min: 'biolo/bo_dust_explosion/dust_explosion_hit/min_dust_explosion_hit'
		},
		{
			type: 'STR',
			file: 'biolo/bo_dust_explosion/dust_explosion_hit_bottom/dust_explosion_hit_bottom',
			texturePath: 'biolo/bo_dust_explosion/dust_explosion_hit_bottom/',
			min: 'biolo/bo_dust_explosion/dust_explosion_hit_bottom/min_dust_explosion_hit_bottom',
			renderBeforeEntities: true
		}
	]
};
