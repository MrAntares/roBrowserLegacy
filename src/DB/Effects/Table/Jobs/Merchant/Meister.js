/**
 * @module DB/Effects/Table/Jobs/Merchant/Meister
 *
 * The Merchant line's Meister effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Axe Stomp (MT_AXE_STOMP), from the client's own effect folders.
	ef_mt_axe_stomp: [
		{
			type: 'STR',
			file: 'new_axe_stomp/new_axe_stomp/new_axe_stomp',
			texturePath: 'new_axe_stomp/new_axe_stomp/',
			min: 'new_axe_stomp/new_axe_stomp/min_new_axe_stomp',
			wav: 'effect/mt_axe_stomp'
		},
		{
			type: 'STR',
			file: 'new_axe_stomp/new_axe_stomp_bottom/new_axe_stomp_bottom',
			texturePath: 'new_axe_stomp/new_axe_stomp_bottom/',
			min: 'new_axe_stomp/new_axe_stomp_bottom/min_new_axe_stomp_bottom',
			renderBeforeEntities: true
		}
	],

	// Axe Stomp (MT_AXE_STOMP), from the client's own effect folders.
	ef_mt_axe_stomp_hit: [
		{
			type: 'STR',
			file: 'new_axe_stomp/new_axe_stomp_hit/new_axe_stomp_hit',
			texturePath: 'new_axe_stomp/new_axe_stomp_hit/',
			min: 'new_axe_stomp/new_axe_stomp_hit/min_new_axe_stomp_hit'
		}
	],

	// Rush Quake (MT_RUSH_QUAKE), from the client's own effect folders.
	ef_mt_rush_quake: [
		{
			type: 'STR',
			file: 'new_rush_quake/new_rush_quake/new_rush_quake',
			texturePath: 'new_rush_quake/new_rush_quake/',
			min: 'new_rush_quake/new_rush_quake/min_new_rush_quake',
			wav: 'effect/mt_rush_quake'
		}
	],

	// Rush Quake (MT_RUSH_QUAKE), from the client's own effect folders.
	ef_mt_rush_quake_hit: [
		{
			type: 'STR',
			file: 'new_rush_quake/new_rush_quake_hit/new_rush_quake_hit',
			texturePath: 'new_rush_quake/new_rush_quake_hit/',
			min: 'new_rush_quake/new_rush_quake_hit/min_new_rush_quake_hit'
		}
	],

	// Attack Machine (MT_A_MACHINE), from the client's own effect folders.
	ef_mt_a_machine: [
		{
			type: 'STR',
			file: 'new_a_machine/new_a_machine/new_a_machine',
			texturePath: 'new_a_machine/new_a_machine/',
			wav: 'effect/mt_a_machine'
		}
	],

	// Attack Machine (MT_A_MACHINE), from the client's own effect folders.
	ef_mt_a_machine_cast: [
		{
			type: 'STR',
			file: 'new_a_machine/new_a_machine_cast/new_a_machine_cast',
			texturePath: 'new_a_machine/new_a_machine_cast/'
		},
		{
			type: 'STR',
			file: 'new_a_machine/new_a_machine_cast_bottom/new_a_machine_cast_bottom',
			texturePath: 'new_a_machine/new_a_machine_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Attack Machine (MT_A_MACHINE), from the client's own effect folders.
	ef_mt_a_machine_hit: [
		{
			type: 'STR',
			file: 'new_a_machine/new_a_machine_attack/new_a_machine_attack',
			texturePath: 'new_a_machine/new_a_machine_attack/'
		},
		{
			type: 'STR',
			file: 'new_a_machine/new_a_machine_hit/new_a_machine_hit',
			texturePath: 'new_a_machine/new_a_machine_hit/'
		}
	],

	// Defense Machine (MT_D_MACHINE), from the client's own effect folders.
	ef_mt_d_machine: [
		{
			type: 'STR',
			file: 'new_d_machine/new_d_machine/new_d_machine',
			texturePath: 'new_d_machine/new_d_machine/',
			min: 'new_d_machine/new_d_machine/min_new_d_machine',
			wav: 'effect/mt_d_machine'
		}
	],

	// Defense Machine (MT_D_MACHINE), from the client's own effect folders.
	ef_mt_d_machine_cast: [
		{
			type: 'STR',
			file: 'new_d_machine/new_d_machine_cast/new_d_machine_cast',
			texturePath: 'new_d_machine/new_d_machine_cast/',
			min: 'new_d_machine/new_d_machine_cast/min_new_d_machine_cast'
		},
		{
			type: 'STR',
			file: 'new_d_machine/new_d_machine_cast_bottom/new_d_machine_cast_bottom',
			texturePath: 'new_d_machine/new_d_machine_cast_bottom/',
			min: 'new_d_machine/new_d_machine_cast_bottom/min_new_d_machine_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// ABR Battle Warior (MT_SUMMON_ABR_BATTLE_WARIOR), from the client's own effect folders.
	ef_mt_summon_abr_battle_warior: [
		{
			wav: 'effect/mt_summon_abr_battle_warior',
			attachedEntity: true
		}
	],

	// ABR Dual Cannon (MT_SUMMON_ABR_DUAL_CANNON), from the client's own effect folders.
	ef_mt_summon_abr_dual_cannon: [
		{
			wav: 'effect/mt_summon_abr_dual_cannon',
			attachedEntity: true
		}
	],

	// ABR Infinity (MT_SUMMON_ABR_INFINITY), from the client's own effect folders.
	ef_mt_summon_abr_infinity: [
		{
			type: 'STR',
			file: 'new_abr_infinity/new_abr_infinity/new_abr_infinity',
			texturePath: 'new_abr_infinity/new_abr_infinity/',
			min: 'new_abr_infinity/new_abr_infinity/min_new_abr_infinity',
			wav: 'effect/mt_summon_abr_infinity'
		},
		{
			type: 'STR',
			file: 'new_abr_infinity/new_abr_infinity_bottom/new_abr_infinity_bottom',
			texturePath: 'new_abr_infinity/new_abr_infinity_bottom/',
			min: 'new_abr_infinity/new_abr_infinity_bottom/min_new_abr_infinity_bottom',
			renderBeforeEntities: true
		}
	],

	// ABR Infinity (MT_SUMMON_ABR_INFINITY), from the client's own effect folders.
	ef_mt_summon_abr_infinity_cast: [
		{
			type: 'STR',
			file: 'new_abr_infinity/new_abr_infinity_cast/new_abr_infinity_cast',
			texturePath: 'new_abr_infinity/new_abr_infinity_cast/',
			min: 'new_abr_infinity/new_abr_infinity_cast/min_new_abr_infinity_cast'
		}
	],

	// ABR Infinity (MT_SUMMON_ABR_INFINITY), from the client's own effect folders.
	ef_mt_summon_abr_infinity_hit: [
		{
			type: 'STR',
			file: 'new_abr_infinity/new_abr_infinity_hit/new_abr_infinity_hit',
			texturePath: 'new_abr_infinity/new_abr_infinity_hit/',
			min: 'new_abr_infinity/new_abr_infinity_hit/min_new_abr_infinity_hit'
		}
	],

	// Spark Blaster (MT_SPARK_BLASTER), from the client's own effect folders.
	ef_mt_spark_blaster: [
		{
			type: 'STR',
			file: 'meister/spark_blaster/spark_blaster/spark_blaster',
			texturePath: 'meister/spark_blaster/spark_blaster/',
			min: 'meister/spark_blaster/spark_blaster/min_spark_blaster',
			wav: 'effect/mt_spark_blaster'
		},
		{
			type: 'STR',
			file: 'meister/spark_blaster/spark_blaster_bottom/spark_blaster_bottom',
			texturePath: 'meister/spark_blaster/spark_blaster_bottom/',
			min: 'meister/spark_blaster/spark_blaster_bottom/min_spark_blaster_bottom',
			renderBeforeEntities: true
		}
	],

	// Triple Laser (MT_TRIPLE_LASER), from the client's own effect folders.
	ef_mt_triple_laser: [
		{
			type: 'STR',
			file: 'meister/triple_laser/triple_laser/triple_laser',
			texturePath: 'meister/triple_laser/triple_laser/',
			min: 'meister/triple_laser/triple_laser/min_triple_laser',
			wav: 'effect/mt_triple_laser'
		}
	],

	// Mighty Smash (MT_MIGHTY_SMASH), from the client's own effect folders.
	ef_mt_mighty_smash: [
		{
			type: 'STR',
			file: 'meister/mighty_smash/mighty_smash/mighty_smash',
			texturePath: 'meister/mighty_smash/mighty_smash/',
			min: 'meister/mighty_smash/mighty_smash/min_mighty_smash',
			wav: 'effect/mt_mighty_smash'
		}
	],

	// Rush Strike (MT_RUSH_STRIKE), from the client's own effect folders.
	ef_mt_rush_strike: [
		{
			type: 'STR',
			file: 'meister/mt_rush_strike/rush_strike/rush_strike',
			texturePath: 'meister/mt_rush_strike/rush_strike/',
			min: 'meister/mt_rush_strike/rush_strike/min_rush_strike',
			wav: 'effect/mt_rush_strike'
		},
		{
			type: 'STR',
			file: 'meister/mt_rush_strike/rush_strike_bottom/rush_strike_bottom',
			texturePath: 'meister/mt_rush_strike/rush_strike_bottom/',
			min: 'meister/mt_rush_strike/rush_strike_bottom/min_rush_strike_bottom',
			renderBeforeEntities: true
		}
	],

	// Powerful Swing (MT_POWERFUL_SWING), from the client's own effect folders.
	ef_mt_powerful_swing: [
		{
			type: 'STR',
			file: 'meister/mt_powerful_swing/powerful_swing/powerful_swing',
			texturePath: 'meister/mt_powerful_swing/powerful_swing/',
			min: 'meister/mt_powerful_swing/powerful_swing/min_powerful_swing',
			wav: 'effect/mt_powerful_swing'
		},
		{
			type: 'STR',
			file: 'meister/mt_powerful_swing/powerful_swing_bottom/powerful_swing_bottom',
			texturePath: 'meister/mt_powerful_swing/powerful_swing_bottom/',
			renderBeforeEntities: true
		}
	],

	// Powerful Swing (MT_POWERFUL_SWING), from the client's own effect folders.
	ef_mt_powerful_swing_hit: [
		{
			type: 'STR',
			file: 'meister/mt_powerful_swing/powerful_swing_hit/powerful_swing_hit',
			texturePath: 'meister/mt_powerful_swing/powerful_swing_hit/',
			min: 'meister/mt_powerful_swing/powerful_swing_hit/min_powerful_swing_hit'
		}
	],

	// Energy Cannonade (MT_ENERGY_CANNONADE), from the client's own effect folders.
	ef_mt_energy_cannonade: [
		{
			type: 'STR',
			file: 'meister/mt_energy_cannonade/energy_cannonade/energy_cannonade',
			texturePath: 'meister/mt_energy_cannonade/energy_cannonade/',
			min: 'meister/mt_energy_cannonade/energy_cannonade/min_energy_cannonade',
			wav: 'effect/mt_energy_cannonade'
		}
	],

	// Energy Cannonade (MT_ENERGY_CANNONADE), from the client's own effect folders.
	ef_mt_energy_cannonade_cast: [
		{
			type: 'STR',
			file: 'meister/mt_energy_cannonade/energy_cannonade_cast/energy_cannonade_cast',
			texturePath: 'meister/mt_energy_cannonade/energy_cannonade_cast/',
			min: 'meister/mt_energy_cannonade/energy_cannonade_cast/min_energy_cannonade_cast'
		},
		{
			type: 'STR',
			file: 'meister/mt_energy_cannonade/energy_cannonade_cast_bottom/energy_cannonade_cast_bottom',
			texturePath: 'meister/mt_energy_cannonade/energy_cannonade_cast_bottom/',
			min: 'meister/mt_energy_cannonade/energy_cannonade_cast_bottom/min_energy_cannonade_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Energy Cannonade (MT_ENERGY_CANNONADE), from the client's own effect folders.
	ef_mt_energy_cannonade_hit: [
		{
			type: 'STR',
			file: 'meister/mt_energy_cannonade/energy_cannonade_hit/energy_cannonade_hit',
			texturePath: 'meister/mt_energy_cannonade/energy_cannonade_hit/',
			min: 'meister/mt_energy_cannonade/energy_cannonade_hit/min_energy_cannonade_hit'
		}
	]
};
