/**
 * @module DB/Effects/Table/Jobs/Gunslinger/NightWatch
 *
 * The Gunslinger line's NightWatch effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Intensive Aim (NW_INTENSIVE_AIM), from the client's own effect folders.
	ef_nw_intensive_aim: [
		{
			type: 'STR',
			file: 'night_watch/nw_intensive_aim/intensive_aim_full/intensiveaim_full',
			texturePath: 'night_watch/nw_intensive_aim/intensive_aim_full/',
			min: 'night_watch/nw_intensive_aim/intensive_aim_full/min_intensiveaim_full',
			wav: 'effect/night_watch/nw_intensive_aim'
		}
	],

	// Grenade Fragment (NW_GRENADE_FRAGMENT), from the client's own effect folders.
	ef_nw_grenade_fragment: [
		{
			type: 'STR',
			file: 'night_watch/nw_grenade_fragment/grenade_fragment_fire/grenade_fragment_fire',
			texturePath: 'night_watch/nw_grenade_fragment/grenade_fragment_fire/',
			min: 'night_watch/nw_grenade_fragment/grenade_fragment_fire/min_grenade_fragment_fire'
		}
	],

	// The Vigilante at Night (NW_THE_VIGILANTE_AT_NIGHT), from the client's own effect folders.
	ef_nw_the_vigilante_at_night: [
		{
			type: 'STR',
			file: 'night_watch/nw_the_vigilante_at_night/the_vigilante_at_night_bottom/the_vigilante_at_night_bottom',
			texturePath: 'night_watch/nw_the_vigilante_at_night/the_vigilante_at_night_bottom/',
			min: 'night_watch/nw_the_vigilante_at_night/the_vigilante_at_night_bottom/min_the_vigilante_at_night_bottom',
			renderBeforeEntities: true
		}
	],

	// Only One Bullet (NW_ONLY_ONE_BULLET), from the client's own effect folders.
	ef_nw_only_one_bullet: [
		{
			type: 'STR',
			file: 'night_watch/nw_only_one_bullet/only_one_bullet/only_one_bullet',
			texturePath: 'night_watch/nw_only_one_bullet/only_one_bullet/',
			min: 'night_watch/nw_only_one_bullet/only_one_bullet/min_only_one_bullet',
			wav: 'effect/night_watch/nw_only_one_bullet'
		}
	],

	// Only One Bullet (NW_ONLY_ONE_BULLET), from the client's own effect folders.
	ef_nw_only_one_bullet_hit: [
		{
			type: 'STR',
			file: 'night_watch/nw_only_one_bullet/only_one_bullet_hit/only_one_bullet_hit',
			texturePath: 'night_watch/nw_only_one_bullet/only_one_bullet_hit/',
			min: 'night_watch/nw_only_one_bullet/only_one_bullet_hit/min_only_one_bullet_hit'
		}
	],

	// Spiral Shooting (NW_SPIRAL_SHOOTING), from the client's own effect folders.
	ef_nw_spiral_shooting: [
		{
			type: 'STR',
			file: 'night_watch/nw_spiral_shooting/spiral_shooting',
			texturePath: 'night_watch/nw_spiral_shooting/',
			min: 'night_watch/nw_spiral_shooting/min_spiral_shooting',
			wav: 'effect/night_watch/nw_spiral_shooting'
		}
	],

	// Magazine for One (NW_MAGAZINE_FOR_ONE), from the client's own effect folders.
	ef_nw_magazine_for_one: [
		{
			type: 'STR',
			file: 'night_watch/nw_magazine_for_one/magazine_for_one',
			texturePath: 'night_watch/nw_magazine_for_one/',
			min: 'night_watch/nw_magazine_for_one/min_magazine_for_one',
			wav: 'effect/night_watch/nw_magazine_for_one'
		}
	],

	// Wild Fire (NW_WILD_FIRE), from the client's own effect folders.
	ef_nw_wild_fire: [
		{
			type: 'STR',
			file: 'night_watch/nw_wild_fire/wild_fire/wild_fire',
			texturePath: 'night_watch/nw_wild_fire/wild_fire/',
			min: 'night_watch/nw_wild_fire/wild_fire/min_wild_fire',
			wav: 'effect/night_watch/nw_wild_fire'
		},
		{
			type: 'STR',
			file: 'night_watch/nw_wild_fire/wild_fire_bottom/wild_fire_bottom',
			texturePath: 'night_watch/nw_wild_fire/wild_fire_bottom/',
			min: 'night_watch/nw_wild_fire/wild_fire_bottom/min_wild_fire_bottom',
			renderBeforeEntities: true
		}
	],

	// Basic Grenade (NW_BASIC_GRENADE), from the client's own effect folders.
	ef_nw_basic_grenade: [
		{
			type: 'STR',
			file: 'night_watch/nw_basic_grenade/basic_grenade/basic_grenade',
			texturePath: 'night_watch/nw_basic_grenade/basic_grenade/',
			min: 'night_watch/nw_basic_grenade/basic_grenade/min_basic_grenade',
			wav: 'effect/night_watch/nw_basic_grenade'
		},
		{
			type: 'STR',
			file: 'night_watch/nw_basic_grenade/basic_grenade_bottom/basic_grenade_bottom',
			texturePath: 'night_watch/nw_basic_grenade/basic_grenade_bottom/',
			min: 'night_watch/nw_basic_grenade/basic_grenade_bottom/min_basic_grenade_bottom',
			renderBeforeEntities: true
		}
	],

	// Grenades Dropping (NW_GRENADES_DROPPING), from the client's own effect folders.
	ef_nw_grenades_dropping: [
		{
			type: 'STR',
			file: 'night_watch/nw_grenades_dropping/grenades_dropping/grenades_dropping',
			texturePath: 'night_watch/nw_grenades_dropping/grenades_dropping/',
			min: 'night_watch/nw_grenades_dropping/grenades_dropping/min_grenades_dropping'
		},
		{
			type: 'STR',
			file: 'night_watch/nw_grenades_dropping/grenades_dropping_bottom/grenades_dropping_bottom',
			texturePath: 'night_watch/nw_grenades_dropping/grenades_dropping_bottom/',
			min: 'night_watch/nw_grenades_dropping/grenades_dropping_bottom/min_grenades_dropping_bottom',
			renderBeforeEntities: true
		}
	],

	// Auto Firing Launcher (NW_AUTO_FIRING_LAUNCHER), from the client's own effect folders.
	ef_nw_auto_firing_launcher: [
		{
			type: 'STR',
			file: 'night_watch/nw_auto_firing_launcher/auto_firing_launcher/auto_firing_launcher',
			texturePath: 'night_watch/nw_auto_firing_launcher/auto_firing_launcher/',
			min: 'night_watch/nw_auto_firing_launcher/auto_firing_launcher/min_auto_firing_launcher',
			wav: 'effect/night_watch/nw_auto_firing_launcher'
		},
		{
			type: 'STR',
			file: 'night_watch/nw_auto_firing_launcher/auto_firing_launcher_bottom/auto_firing_launcher_bottom',
			texturePath: 'night_watch/nw_auto_firing_launcher/auto_firing_launcher_bottom/',
			min: 'night_watch/nw_auto_firing_launcher/auto_firing_launcher_bottom/min_auto_firing_launcher_bottom',
			renderBeforeEntities: true
		}
	],

	// Hidden Card (NW_HIDDEN_CARD), from the client's own effect folders.
	ef_nw_hidden_card: [
		{
			type: 'STR',
			file: 'night_watch/nw_hidden_card/hidden_card/hiddencard',
			texturePath: 'night_watch/nw_hidden_card/hidden_card/',
			min: 'night_watch/nw_hidden_card/hidden_card/min_hiddencard',
			wav: 'effect/night_watch/nw_hidden_card'
		}
	],

	// Mission Bombard (NW_MISSION_BOMBARD), from the client's own effect folders.
	ef_nw_mission_bombard_hit: [
		{
			type: 'STR',
			file: 'night_watch/nw_mission_bombard/mission_bombard/mission_bombard_hit',
			texturePath: 'night_watch/nw_mission_bombard/mission_bombard/',
			min: 'night_watch/nw_mission_bombard/mission_bombard/min_mission_bombard_hit'
		}
	],

	// Mission Bombard's unit (official effect 2354): while the unit stands,
	// every 15 ticks (250 ms) three blasts land at random points of a 9x9
	// square around it, each drawn at a random size from 0.5 to 1.
	ef_nw_mission_bombard_field: [
		{
			type: 'AREA_SPAWN',
			spawnEffectId: 'ef_nw_mission_bombard_drop',
			interval: 250,
			count: 3,
			areaByLevel: [9],
			area: 9,
			scaleRange: [0.5, 1]
		}
	],

	// One blast of Mission Bombard's unit (no sound)
	ef_nw_mission_bombard_drop: [
		{
			type: 'STR',
			file: 'night_watch/nw_mission_bombard/mission_bombard/mission_bombard_hit',
			texturePath: 'night_watch/nw_mission_bombard/mission_bombard/',
			min: 'night_watch/nw_mission_bombard/mission_bombard/min_mission_bombard_hit'
		}
	],

	// Wild Shot (NW_WILD_SHOT), from the client's own effect folders.
	ef_nw_wild_shot: [
		{
			type: 'STR',
			file: 'night_watch/nw_wild_shot/wild_shot/wild_shot',
			texturePath: 'night_watch/nw_wild_shot/wild_shot/',
			min: 'night_watch/nw_wild_shot/wild_shot/min_wild_shot'
		}
	],

	// Wild Shot (NW_WILD_SHOT), from the client's own effect folders.
	ef_nw_wild_shot_cast: [
		{
			type: 'STR',
			castLoop: true,
			attachedEntity: true,
			file: 'night_watch/nw_wild_shot/wild_shot_cast/wild_shot_cast',
			texturePath: 'night_watch/nw_wild_shot/wild_shot_cast/',
			min: 'night_watch/nw_wild_shot/wild_shot_cast/min_wild_shot_cast',
			wav: 'effect/ef_beginspell',
			renderBeforeEntities: true,
			yOffset: 11
		}
	],

	// Wild Shot (NW_WILD_SHOT), from the client's own effect folders.
	ef_nw_wild_shot_hit: [
		{
			type: 'STR',
			file: 'night_watch/nw_wild_shot/wild_shot_hit/wild_shot_hit',
			texturePath: 'night_watch/nw_wild_shot/wild_shot_hit/',
			min: 'night_watch/nw_wild_shot/wild_shot_hit/min_wild_shot_hit'
		}
	],

	// Midnight Fallen (NW_MIDNIGHT_FALLEN), from the client's own effect folders.
	ef_nw_midnight_fallen: [
		{
			type: 'STR',
			file: 'night_watch/nw_midnight_fallen/midnight_fallen_bottom/midnight_fallen_bottom',
			texturePath: 'night_watch/nw_midnight_fallen/midnight_fallen_bottom/',
			min: 'night_watch/nw_midnight_fallen/midnight_fallen_bottom/min_midnight_fallen_bottom',
			renderBeforeEntities: true,
			wav: 'effect/night_watch/nw_midnight_fallen'
		}
	],

	// Midnight Fallen (NW_MIDNIGHT_FALLEN), from the client's own effect folders.
	ef_nw_midnight_fallen_cast: [
		{
			type: 'STR',
			castLoop: true,
			attachedEntity: true,
			file: 'night_watch/nw_midnight_fallen/midnight_fallen_cast_bottom/midnight_fallen_cast_bottom',
			texturePath: 'night_watch/nw_midnight_fallen/midnight_fallen_cast_bottom/',
			min: 'night_watch/nw_midnight_fallen/midnight_fallen_cast_bottom/min_midnight_fallen_cast_bottom',
			wav: 'effect/ef_beginspell',
			renderBeforeEntities: true,
			xOffset: 1,
			yOffset: 11
		}
	]
};
