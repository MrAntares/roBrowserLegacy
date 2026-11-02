/**
 * @module DB/Effects/Table/Jobs/Swordman/ImperialGuard
 *
 * The Swordman line's ImperialGuard effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Guard Stance (IG_GUARD_STANCE), from the client's own effect folders.
	ef_ig_guard_stance: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_guard_stance/new_guard_stance/new_guard_stance/new_guard_stance',
			texturePath: 'imperial_guard/ig_guard_stance/new_guard_stance/new_guard_stance/',
			fallback: ['guard_stance/guard_stance/guard_stance'],
			wav: 'effect/ig_guard_stance'
		}
	],

	// Guard Stance (IG_GUARD_STANCE), from the client's own effect folders.
	ef_ig_guard_stance_cast: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_guard_stance/new_guard_stance/new_guard_stance_cast/new_guard_stance_cast',
			texturePath: 'imperial_guard/ig_guard_stance/new_guard_stance/new_guard_stance_cast/',
			min: 'imperial_guard/ig_guard_stance/new_guard_stance/new_guard_stance_cast/min_new_guard_stance_cast',
			fallback: ['guard_stance/guard_stance_cast/guard_stance_cast']
		},
		{
			type: 'STR',
			file: 'imperial_guard/ig_guard_stance/new_guard_stance/new_guard_stance_cast_bottom/new_guard_stance_cast_bottom',
			texturePath: 'imperial_guard/ig_guard_stance/new_guard_stance/new_guard_stance_cast_bottom/',
			min: 'imperial_guard/ig_guard_stance/new_guard_stance/new_guard_stance_cast_bottom/min_new_guard_stance_cast_bottom',
			fallback: ['guard_stance/guard_stance_cast_bottom/guard_stance_cast_bottom'],
			renderBeforeEntities: true
		}
	],

	// Guardian Shield (IG_GUARDIAN_SHIELD), from the client's own effect folders.
	ef_ig_guardian_shield: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_guardian_shield/new_guardianshield/guardianshield/guardianshield',
			texturePath: 'imperial_guard/ig_guardian_shield/new_guardianshield/guardianshield/',
			min: 'imperial_guard/ig_guardian_shield/new_guardianshield/guardianshield/min_guardianshield',
			fallback: ['guardianshield/guardianshield/guardianshield'],
			wav: 'effect/ig_guardian_shield'
		},
		{
			type: 'STR',
			file: 'imperial_guard/ig_guardian_shield/new_guardianshield/guardianshield_bottom/guardianshield_bottom',
			texturePath: 'imperial_guard/ig_guardian_shield/new_guardianshield/guardianshield_bottom/',
			min: 'imperial_guard/ig_guardian_shield/new_guardianshield/guardianshield_bottom/min_guardianshield_bottom',
			fallback: ['guardianshield/guardianshield_bottom/guardianshield_bottom'],
			renderBeforeEntities: true
		}
	],

	// Rebound Shield (IG_REBOUND_SHIELD), from the client's own effect folders.
	ef_ig_rebound_shield: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_rebound_shield/new_rebound_shield/new_rebound_shield/new_rebound_shield',
			texturePath: 'imperial_guard/ig_rebound_shield/new_rebound_shield/new_rebound_shield/',
			min: 'imperial_guard/ig_rebound_shield/new_rebound_shield/new_rebound_shield/min_new_rebound_shield',
			fallback: ['rebound_shield/rebound_shield/rebound_shield'],
			wav: 'effect/ig_rebound_shield'
		},
		{
			type: 'STR',
			file: 'imperial_guard/ig_rebound_shield/new_rebound_shield/new_rebound_shield_bottom/new_rebound_shield_bottom',
			texturePath: 'imperial_guard/ig_rebound_shield/new_rebound_shield/new_rebound_shield_bottom/',
			min: 'imperial_guard/ig_rebound_shield/new_rebound_shield/new_rebound_shield_bottom/min_new_rebound_shield_bottom',
			fallback: ['rebound_shield/rebound_shield_bottom/rebound_shield_bottom'],
			renderBeforeEntities: true
		}
	],

	// Rebound Shield (IG_REBOUND_SHIELD), from the client's own effect folders.
	ef_ig_rebound_shield_cast: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_rebound_shield/new_rebound_shield/rebound_shield_cast/rebound_shield_cast',
			texturePath: 'imperial_guard/ig_rebound_shield/new_rebound_shield/rebound_shield_cast/',
			min: 'imperial_guard/ig_rebound_shield/new_rebound_shield/rebound_shield_cast/min_rebound_shield_cast',
			fallback: ['rebound_shield/rebound_shield_cast/rebound_shield_cast']
		},
		{
			type: 'STR',
			file: 'imperial_guard/ig_rebound_shield/new_rebound_shield/rebound_shield_cast_bottom/rebound_shield_cast_bottom',
			texturePath: 'imperial_guard/ig_rebound_shield/new_rebound_shield/rebound_shield_cast_bottom/',
			min: 'imperial_guard/ig_rebound_shield/new_rebound_shield/rebound_shield_cast_bottom/min_rebound_shield_cast_bottom',
			fallback: ['rebound_shield/rebound_shield_cast_bottom/rebound_shield_cast_bottom'],
			renderBeforeEntities: true
		}
	],

	// Attack Stance (IG_ATTACK_STANCE), from the client's own effect folders.
	ef_ig_attack_stance: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_attack_stance/new_attack_stance/new_attack_stance/new_attack_stance',
			texturePath: 'imperial_guard/ig_attack_stance/new_attack_stance/new_attack_stance/',
			fallback: ['attack_stance/attack_stance/attack_stance']
		}
	],

	// Attack Stance (IG_ATTACK_STANCE), from the client's own effect folders.
	ef_ig_attack_stance_cast: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_attack_stance/new_attack_stance/new_attack_stance_cast/new_attack_stance_cast',
			texturePath: 'imperial_guard/ig_attack_stance/new_attack_stance/new_attack_stance_cast/',
			min: 'imperial_guard/ig_attack_stance/new_attack_stance/new_attack_stance_cast/min_new_attack_stance_cast',
			fallback: ['attack_stance/attack_stance_cast/attack_stance_cast']
		},
		{
			type: 'STR',
			file: 'imperial_guard/ig_attack_stance/new_attack_stance/new_attack_stance_cast_bottom/new_attack_stance_cast_bottom',
			texturePath: 'imperial_guard/ig_attack_stance/new_attack_stance/new_attack_stance_cast_bottom/',
			min: 'imperial_guard/ig_attack_stance/new_attack_stance/new_attack_stance_cast_bottom/min_new_attack_stance_cast_bottom',
			fallback: ['attack_stance/attack_stance_cast_bottom/attack_stance_cast_bottom'],
			renderBeforeEntities: true
		}
	],

	// Ultimate Sacrifice (IG_ULTIMATE_SACRIFICE), from the client's own effect folders.
	ef_ig_ultimate_sacrifice: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_ultimate_sacrifice/ultimatesacrifice/ultimatesacrifice',
			texturePath: 'imperial_guard/ig_ultimate_sacrifice/ultimatesacrifice/',
			min: 'imperial_guard/ig_ultimate_sacrifice/ultimatesacrifice/min_ultimatesacrifice',
			fallback: ['ultimate_sacrifice/ultimatesacrifice/ultimatesacrifice'],
			wav: 'effect/ig_ultimate_sacrifice'
		},
		{
			type: 'STR',
			file: 'imperial_guard/ig_ultimate_sacrifice/ultimatesacrifice_bottom/ultimatesacrifice_bottom',
			texturePath: 'imperial_guard/ig_ultimate_sacrifice/ultimatesacrifice_bottom/',
			min: 'imperial_guard/ig_ultimate_sacrifice/ultimatesacrifice_bottom/min_ultimatesacrifice_bottom',
			fallback: ['ultimate_sacrifice/ultimatesacrifice_bottom/ultimatesacrifice_bottom'],
			renderBeforeEntities: true
		}
	],

	// Holy Shield (IG_HOLY_SHIELD), from the client's own effect folders.
	ef_ig_holy_shield: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_holy_shield/new_holy_shield/new_holy_shield/new_holy_shield',
			texturePath: 'imperial_guard/ig_holy_shield/new_holy_shield/new_holy_shield/',
			min: 'imperial_guard/ig_holy_shield/new_holy_shield/new_holy_shield/min_new_holy_shield',
			fallback: ['holy_shield/holy_shield/holy_shield']
		},
		{
			type: 'STR',
			file: 'imperial_guard/ig_holy_shield/new_holy_shield/new_holy_shield_bottom/new_holy_shield_bottom',
			texturePath: 'imperial_guard/ig_holy_shield/new_holy_shield/new_holy_shield_bottom/',
			min: 'imperial_guard/ig_holy_shield/new_holy_shield/new_holy_shield_bottom/min_new_holy_shield_bottom',
			renderBeforeEntities: true
		}
	],

	// Holy Shield (IG_HOLY_SHIELD), from the client's own effect folders.
	ef_ig_holy_shield_cast: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_holy_shield/new_holy_shield/new_holy_shield_cast/new_holy_shield_cast',
			texturePath: 'imperial_guard/ig_holy_shield/new_holy_shield/new_holy_shield_cast/',
			min: 'imperial_guard/ig_holy_shield/new_holy_shield/new_holy_shield_cast/min_new_holy_shield_cast',
			fallback: ['holy_shield/holy_shield_cast/holy_shield_cast']
		},
		{
			type: 'STR',
			file: 'imperial_guard/ig_holy_shield/new_holy_shield/new_holy_shield_cast_bottom/new_holy_shield_cast_bottom',
			texturePath: 'imperial_guard/ig_holy_shield/new_holy_shield/new_holy_shield_cast_bottom/',
			min: 'imperial_guard/ig_holy_shield/new_holy_shield/new_holy_shield_cast_bottom/min_new_holy_shield_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Grand Judgement (IG_GRAND_JUDGEMENT), from the client's own effect folders.
	ef_ig_grand_judgement: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_grand_judgement/new_grand_judgement/new_grand_judgement/new_grand_judgement',
			texturePath: 'imperial_guard/ig_grand_judgement/new_grand_judgement/new_grand_judgement/',
			min: 'imperial_guard/ig_grand_judgement/new_grand_judgement/new_grand_judgement/min_new_grand_judgement',
			fallback: ['grand_judgement/grand_judgement/grand_judgement'],
			wav: 'effect/ig_grand_judgement'
		},
		{
			type: 'STR',
			file: 'imperial_guard/ig_grand_judgement/new_grand_judgement/new_grand_judgement_bottom/new_grand_judgement_bottom',
			texturePath: 'imperial_guard/ig_grand_judgement/new_grand_judgement/new_grand_judgement_bottom/',
			min: 'imperial_guard/ig_grand_judgement/new_grand_judgement/new_grand_judgement_bottom/min_new_grand_judgement_bottom',
			fallback: ['grand_judgement/grand_judgement_bottom/grand_judgement_bottom'],
			renderBeforeEntities: true
		}
	],

	// Grand Judgement (IG_GRAND_JUDGEMENT), from the client's own effect folders.
	ef_ig_grand_judgement_cast: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_grand_judgement/new_grand_judgement/grand_judgement_cast/grand_judgement_cast',
			texturePath: 'imperial_guard/ig_grand_judgement/new_grand_judgement/grand_judgement_cast/',
			min: 'imperial_guard/ig_grand_judgement/new_grand_judgement/grand_judgement_cast/min_grand_judgement_cast',
			fallback: ['grand_judgement/grand_judgement_cast/grand_judgement_cast']
		},
		{
			type: 'STR',
			file: 'imperial_guard/ig_grand_judgement/new_grand_judgement/grand_judgement_cast_bottom/grand_judgement_cast_bottom',
			texturePath: 'imperial_guard/ig_grand_judgement/new_grand_judgement/grand_judgement_cast_bottom/',
			min: 'imperial_guard/ig_grand_judgement/new_grand_judgement/grand_judgement_cast_bottom/min_grand_judgement_cast_bottom',
			fallback: ['grand_judgement/grand_judgement_cast_bottom/grand_judgement_cast_bottom'],
			renderBeforeEntities: true
		}
	],

	// Judgement Cross (IG_JUDGEMENT_CROSS), from the client's own effect folders.
	ef_ig_judgement_cross: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_judgement_cross/new_judgement_cross/new_judgement_cross/new_judgement_cross',
			texturePath: 'imperial_guard/ig_judgement_cross/new_judgement_cross/new_judgement_cross/',
			min: 'imperial_guard/ig_judgement_cross/new_judgement_cross/new_judgement_cross/min_new_judgement_cross',
			fallback: ['judgement_cross/judgement_cross/judgement_cross'],
			wav: 'effect/ig_judgement_cross'
		},
		{
			type: 'STR',
			file: 'imperial_guard/ig_judgement_cross/new_judgement_cross/new_judgement_cross_bottom/new_judgement_cross_bottom',
			texturePath: 'imperial_guard/ig_judgement_cross/new_judgement_cross/new_judgement_cross_bottom/',
			min: 'imperial_guard/ig_judgement_cross/new_judgement_cross/new_judgement_cross_bottom/min_new_judgement_cross_bottom',
			fallback: ['judgement_cross/judgement_cross_bottom/judgement_cross_bottom'],
			renderBeforeEntities: true
		}
	],

	// Judgement Cross (IG_JUDGEMENT_CROSS), from the client's own effect folders.
	ef_ig_judgement_cross_cast: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_judgement_cross/new_judgement_cross/new_judgement_cross_cast/new_judgement_cross_cast',
			texturePath: 'imperial_guard/ig_judgement_cross/new_judgement_cross/new_judgement_cross_cast/',
			min: 'imperial_guard/ig_judgement_cross/new_judgement_cross/new_judgement_cross_cast/min_new_judgement_cross_cast',
			fallback: ['judgement_cross/judgement_cross_cast/judgement_cross_cast']
		},
		{
			type: 'STR',
			file: 'imperial_guard/ig_judgement_cross/new_judgement_cross/new_judgement_cross_cast_bottom/new_judgement_cross_cast_bottom',
			texturePath: 'imperial_guard/ig_judgement_cross/new_judgement_cross/new_judgement_cross_cast_bottom/',
			min: 'imperial_guard/ig_judgement_cross/new_judgement_cross/new_judgement_cross_cast_bottom/min_new_judgement_cross_cast_bottom',
			fallback: ['judgement_cross/judgement_cross_cast_bottom/judgement_cross_cast_bottom'],
			renderBeforeEntities: true
		}
	],

	// Judgement Cross (IG_JUDGEMENT_CROSS), from the client's own effect folders.
	ef_ig_judgement_cross_hit: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_judgement_cross/new_judgement_cross/new_judgement_cross_hit/new_judgement_cross_hit',
			texturePath: 'imperial_guard/ig_judgement_cross/new_judgement_cross/new_judgement_cross_hit/',
			min: 'imperial_guard/ig_judgement_cross/new_judgement_cross/new_judgement_cross_hit/min_new_judgement_cross_hit'
		}
	],

	// Shield Shooting (IG_SHIELD_SHOOTING), from the client's own effect folders.
	ef_ig_shield_shooting: [
		{
			type: 'STR',
			file: 'shield_shooting/shield_shooting/shield_shooting',
			texturePath: 'shield_shooting/shield_shooting/',
			min: 'shield_shooting/shield_shooting/min_shield_shooting',
			wav: 'effect/ig_shield_shooting'
		}
	],

	// Shield Shooting (IG_SHIELD_SHOOTING), from the client's own effect folders.
	ef_ig_shield_shooting_cast: [
		{
			type: 'STR',
			file: 'shield_shooting/shield_shooting_cast/shield_shooting_cast',
			texturePath: 'shield_shooting/shield_shooting_cast/',
			min: 'shield_shooting/shield_shooting_cast/min_shield_shooting_cast'
		}
	],

	// Shield Shooting (IG_SHIELD_SHOOTING), from the client's own effect folders.
	ef_ig_shield_shooting_hit: [
		{
			type: 'STR',
			file: 'shield_shooting/shield_shooting_hit/shield_shooting_hit',
			texturePath: 'shield_shooting/shield_shooting_hit/',
			min: 'shield_shooting/shield_shooting_hit/min_shield_shooting_hit'
		}
	],

	// Overslash (IG_OVERSLASH), from the client's own effect folders.
	ef_ig_overslash: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_overslash/new_overslash/new_overslash/new_overslash',
			texturePath: 'imperial_guard/ig_overslash/new_overslash/new_overslash/',
			fallback: ['overslash/overslash/overslash'],
			wav: 'effect/ig_overslash'
		},
		{
			type: 'STR',
			file: 'imperial_guard/ig_overslash/new_overslash/new_overslash_bottom/new_overslash_bottom',
			texturePath: 'imperial_guard/ig_overslash/new_overslash/new_overslash_bottom/',
			min: 'imperial_guard/ig_overslash/new_overslash/new_overslash_bottom/min_new_overslash_bottom',
			fallback: ['overslash/overslash_bottom/overslash_bottom'],
			renderBeforeEntities: true
		}
	],

	// Overslash (IG_OVERSLASH), from the client's own effect folders.
	ef_ig_overslash_cast: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_overslash/new_overslash/overslash_cast/overslash_cast',
			texturePath: 'imperial_guard/ig_overslash/new_overslash/overslash_cast/',
			min: 'imperial_guard/ig_overslash/new_overslash/overslash_cast/min_overslash_cast',
			fallback: ['overslash/overslash_cast/overslash_cast']
		}
	],

	// Overslash (IG_OVERSLASH), from the client's own effect folders.
	ef_ig_overslash_hit: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_overslash/new_overslash/new_overslash_hit/new_overslash_hit',
			texturePath: 'imperial_guard/ig_overslash/new_overslash/new_overslash_hit/',
			min: 'imperial_guard/ig_overslash/new_overslash/new_overslash_hit/min_new_overslash_hit',
			fallback: ['overslash/overslash_hit/overslash_hit']
		}
	],

	// Cross Rain's unit (official effect 2462): every 9 - level / 3 ticks a
	// spear of rain lands at a random point of a square around the unit, 3 cells
	// wide at levels 1-3, 5 at 4-6, 7 at 7-9, 9 at 10.
	ef_ig_cross_rain_field: [
		{
			type: 'AREA_SPAWN',
			spawnEffectId: 'ef_ig_cross_rain_drop',
			interval: 150,
			intervalByLevel: [150, 150, 400 / 3, 400 / 3, 400 / 3, 350 / 3, 350 / 3, 350 / 3, 100, 100],
			areaByLevel: [3, 3, 3, 5, 5, 5, 7, 7, 7, 9]
		}
	],

	// One drop of Cross Rain's unit (no sound)
	ef_ig_cross_rain_drop: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_cross_rain/new_crossrain/new_cross_rain/new_cross_rain',
			texturePath: 'imperial_guard/ig_cross_rain/new_crossrain/new_cross_rain/',
			min: 'imperial_guard/ig_cross_rain/new_crossrain/new_cross_rain/min_new_cross_rain',
			fallback: ['crossrain/cross_rain/cross_rain']
		}
	],

	// Cross Rain (IG_CROSS_RAIN), from the client's own effect folders.
	ef_ig_cross_rain_cast: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_cross_rain/new_crossrain/new_cross_rain_cast/new_cross_rain_cast',
			texturePath: 'imperial_guard/ig_cross_rain/new_crossrain/new_cross_rain_cast/',
			min: 'imperial_guard/ig_cross_rain/new_crossrain/new_cross_rain_cast/min_new_cross_rain_cast',
			fallback: ['crossrain/cross_rain_cast/cross_rain_cast']
		},
		{
			type: 'STR',
			file: 'imperial_guard/ig_cross_rain/new_crossrain/new_cross_rain_cast_bottom/new_cross_rain_cast_bottom',
			texturePath: 'imperial_guard/ig_cross_rain/new_crossrain/new_cross_rain_cast_bottom/',
			min: 'imperial_guard/ig_cross_rain/new_crossrain/new_cross_rain_cast_bottom/min_new_cross_rain_cast_bottom',
			fallback: ['crossrain/cross_rain_cast_bottom/cross_rain_cast_bottom'],
			renderBeforeEntities: true
		}
	],

	// Radiant Spear (IG_RADIANT_SPEAR), from the client's own effect folders.
	ef_ig_radiant_spear_cast: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_radiant_spear/radiant_spear_cast/radiant_spear_cast',
			texturePath: 'imperial_guard/ig_radiant_spear/radiant_spear_cast/',
			min: 'imperial_guard/ig_radiant_spear/radiant_spear_cast/min_radiant_spear_cast'
		}
	],

	// Imperial Cross (IG_IMPERIAL_CROSS), from the client's own effect folders.
	ef_ig_imperial_cross: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_imperial_cross/imperial_cross/imperial_cross',
			texturePath: 'imperial_guard/ig_imperial_cross/imperial_cross/',
			min: 'imperial_guard/ig_imperial_cross/imperial_cross/min_imperial_cross',
			wav: 'effect/ig_imperial_cross'
		}
	],

	// Imperial Pressure (IG_IMPERIAL_PRESSURE), from the client's own effect folders.
	ef_ig_imperial_pressure: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_imperial_pressure/imperal_pressure/imperal_pressure',
			texturePath: 'imperial_guard/ig_imperial_pressure/imperal_pressure/',
			min: 'imperial_guard/ig_imperial_pressure/imperal_pressure/min_imperal_pressure',
			wav: 'effect/ig_imperial_pressure'
		},
		{
			type: 'STR',
			file: 'imperial_guard/ig_imperial_pressure/imperal_pressure_bottom/imperal_pressure_bottom',
			texturePath: 'imperial_guard/ig_imperial_pressure/imperal_pressure_bottom/',
			min: 'imperial_guard/ig_imperial_pressure/imperal_pressure_bottom/min_imperal_pressure_bottom',
			renderBeforeEntities: true
		}
	],

	// Imperial Pressure (IG_IMPERIAL_PRESSURE), from the client's own effect folders.
	ef_ig_imperial_pressure_cast: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_imperial_pressure/imperal_pressure_cast/imperal_pressure_cast',
			texturePath: 'imperial_guard/ig_imperial_pressure/imperal_pressure_cast/',
			min: 'imperial_guard/ig_imperial_pressure/imperal_pressure_cast/min_imperal_pressure_cast'
		}
	],

	// Imperial Pressure (IG_IMPERIAL_PRESSURE), from the client's own effect folders.
	ef_ig_imperial_pressure_hit: [
		{
			type: 'STR',
			file: 'imperial_guard/ig_imperial_pressure/new_rayofgenesis_hit/new_rayofgenesis_hit',
			texturePath: 'imperial_guard/ig_imperial_pressure/new_rayofgenesis_hit/',
			min: 'imperial_guard/ig_imperial_pressure/new_rayofgenesis_hit/min_new_rayofgenesis_hit',
			fallback: ['new_rayofgenesis/new_rayofgenesis_hit/new_rayofgenesis_hit']
		}
	]
};
