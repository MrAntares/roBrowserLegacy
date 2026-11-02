/**
 * @module DB/Effects/Table/Jobs/Taekwon/SoulAscetic
 *
 * The Taekwon line's SoulAscetic effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Talisman Of Protection (SOA_TALISMAN_OF_PROTECTION), from the client's own effect folders.
	ef_soa_talisman_of_protection: [
		{
			type: 'STR',
			file: 'soul_ascetic/soa_talisman_of_protection/talisman_of_protection',
			texturePath: 'soul_ascetic/soa_talisman_of_protection/',
			min: 'soul_ascetic/soa_talisman_of_protection/min_talisman_of_protection',
			wav: 'effect/soul_ascetic/soa_talisman_of_protection'
		}
	],

	// Talisman Of Warrior (SOA_TALISMAN_OF_WARRIOR), from the client's own effect folders.
	ef_soa_talisman_of_warrior: [
		{
			type: 'STR',
			file: 'soul_ascetic/soa_talisman_of_warrior/talisman_of_warrior',
			texturePath: 'soul_ascetic/soa_talisman_of_warrior/',
			min: 'soul_ascetic/soa_talisman_of_warrior/min_talisman_of_warrior',
			wav: 'effect/soul_ascetic/soa_talisman_of_warrior'
		}
	],

	// Talisman Of Magician (SOA_TALISMAN_OF_MAGICIAN), from the client's own effect folders.
	ef_soa_talisman_of_magician: [
		{
			type: 'STR',
			file: 'soul_ascetic/soa_talisman_of_magician/talisman_of_magician/talisman_of_magician',
			texturePath: 'soul_ascetic/soa_talisman_of_magician/talisman_of_magician/',
			min: 'soul_ascetic/soa_talisman_of_magician/talisman_of_magician/min_talisman_of_magician'
		},
		{
			type: 'STR',
			file: 'soul_ascetic/soa_talisman_of_magician/talisman_of_magician_bottom/talisman_of_magician_bottom',
			texturePath: 'soul_ascetic/soa_talisman_of_magician/talisman_of_magician_bottom/',
			min: 'soul_ascetic/soa_talisman_of_magician/talisman_of_magician_bottom/min_talisman_of_magician_bottom',
			renderBeforeEntities: true
		}
	],

	// Soul Gathering (SOA_SOUL_GATHERING), from the client's own effect folders.
	ef_soa_soul_gathering: [
		{
			type: 'STR',
			file: 'soul_ascetic/soa_soul_gathering/soul_gathering',
			texturePath: 'soul_ascetic/soa_soul_gathering/',
			min: 'soul_ascetic/soa_soul_gathering/min_soul_gathering',
			wav: 'effect/soul_ascetic/soa_soul_gathering'
		}
	],
	// Drawn once where the unit appears when the client has no ez2streffect.bson
	// (SkillUnitFallback in SkillUnit.js)
	ef_soa_totem_of_tutelary: [
		{
			type: 'STR',
			file: 'soul_ascetic/soa_totem_of_tutelary/totem_of_tutelary/totem_of_tutelary_end',
			texturePath: 'soul_ascetic/soa_totem_of_tutelary/totem_of_tutelary/',
			min: 'soul_ascetic/soa_totem_of_tutelary/totem_of_tutelary/min_totem_of_tutelary_end'
		}
	],

	// Talisman Of Five Elements (SOA_TALISMAN_OF_FIVE_ELEMENTS), from the client's own effect folders.
	ef_soa_talisman_of_five_elements: [
		{
			type: 'STR',
			file: 'soul_ascetic/soa_talisman_of_five_elements/talisman_of_the_five_elements',
			texturePath: 'soul_ascetic/soa_talisman_of_five_elements/',
			min: 'soul_ascetic/soa_talisman_of_five_elements/min_talisman_of_the_five_elements'
		}
	],

	// Talisman Of Soul Stealing (SOA_TALISMAN_OF_SOUL_STEALING), from the client's own effect folders.
	ef_soa_talisman_of_soul_stealing: [
		{
			type: 'STR',
			file: 'soul_ascetic/soa_talisman_of_soul_stealing/talisman_of_soul_stealing',
			texturePath: 'soul_ascetic/soa_talisman_of_soul_stealing/',
			min: 'soul_ascetic/soa_talisman_of_soul_stealing/min_talisman_of_soul_stealing',
			wav: 'effect/soul_ascetic/soa_talisman_of_soul_stealing'
		}
	],

	// Exorcism Of Malicious Soul (SOA_EXORCISM_OF_MALICIOUS_SOUL), from the client's own effect folders.
	ef_soa_exorcism_of_malicious_soul: [
		{
			type: 'STR',
			file: 'soul_ascetic/soa_exorcism_of_malicious_soul/exorcism_of_malicuous_soul',
			texturePath: 'soul_ascetic/soa_exorcism_of_malicious_soul/',
			min: 'soul_ascetic/soa_exorcism_of_malicious_soul/min_exorcism_of_malicuous_soul'
		}
	],

	// Talisman Of Blue Dragon (SOA_TALISMAN_OF_BLUE_DRAGON), from the client's own effect folders.
	ef_soa_talisman_of_blue_dragon: [
		{
			type: 'STR',
			file: 'soul_ascetic/soa_talisman_of_blue_dragon/talisman_of_blue_dragon',
			texturePath: 'soul_ascetic/soa_talisman_of_blue_dragon/',
			min: 'soul_ascetic/soa_talisman_of_blue_dragon/min_talisman_of_blue_dragon',
			wav: 'effect/soul_ascetic/soa_talisman_of_blue_dragon'
		}
	],

	// Talisman Of White Tiger (SOA_TALISMAN_OF_WHITE_TIGER), from the client's own effect folders.
	ef_soa_talisman_of_white_tiger: [
		{
			type: 'STR',
			file: 'soul_ascetic/soa_talisman_of_white_tiger/talisman_of_white_tiger',
			texturePath: 'soul_ascetic/soa_talisman_of_white_tiger/',
			min: 'soul_ascetic/soa_talisman_of_white_tiger/min_talisman_of_white_tiger',
			wav: 'effect/soul_ascetic/soa_talisman_of_white_tiger'
		}
	],

	// Talisman Of Red Phoenix (SOA_TALISMAN_OF_RED_PHOENIX), from the client's own effect folders.
	ef_soa_talisman_of_red_phoenix: [
		{
			type: 'STR',
			file: 'soul_ascetic/soa_talisman_of_red_phoenix/talisman_of_red_phoenix/talisman_of_red_phoenix',
			texturePath: 'soul_ascetic/soa_talisman_of_red_phoenix/talisman_of_red_phoenix/',
			min: 'soul_ascetic/soa_talisman_of_red_phoenix/talisman_of_red_phoenix/min_talisman_of_red_phoenix',
			wav: 'effect/soul_ascetic/soa_talisman_of_red_phoenix'
		},
		{
			type: 'STR',
			file: 'soul_ascetic/soa_talisman_of_red_phoenix/talisman_of_red_phoenix_bottom/talisman_of_red_phoenix_bottom',
			texturePath: 'soul_ascetic/soa_talisman_of_red_phoenix/talisman_of_red_phoenix_bottom/',
			min: 'soul_ascetic/soa_talisman_of_red_phoenix/talisman_of_red_phoenix_bottom/min_talisman_of_red_phoenix_bottom',
			renderBeforeEntities: true
		}
	],

	// Talisman Of Black Tortoise (SOA_TALISMAN_OF_BLACK_TORTOISE), from the client's own effect folders.
	ef_soa_talisman_of_black_tortoise: [
		{
			type: 'STR',
			file: 'soul_ascetic/soa_talisman_of_black_tortoise/talisman_of_black_tortoise/talisman_of_black_tortoise',
			texturePath: 'soul_ascetic/soa_talisman_of_black_tortoise/talisman_of_black_tortoise/',
			min: 'soul_ascetic/soa_talisman_of_black_tortoise/talisman_of_black_tortoise/min_talisman_of_black_tortoise',
			wav: 'effect/soul_ascetic/soa_talisman_of_black_tortoise'
		},
		{
			type: 'STR',
			file: 'soul_ascetic/soa_talisman_of_black_tortoise/talisman_of_black_tortoise_bottom/talisman_of_black_tortoise_bottom',
			texturePath: 'soul_ascetic/soa_talisman_of_black_tortoise/talisman_of_black_tortoise_bottom/',
			min: 'soul_ascetic/soa_talisman_of_black_tortoise/talisman_of_black_tortoise_bottom/min_talisman_of_black_tortoise_bottom',
			renderBeforeEntities: true
		}
	],

	// Talisman Of Four Bearing God (SOA_TALISMAN_OF_FOUR_BEARING_GOD), from the client's own effect folders.
	ef_soa_talisman_of_four_bearing_god: [
		{
			type: 'STR',
			file: 'soul_ascetic/soa_talisman_of_four_bearing_god/talisman_of_four_bearing_god',
			texturePath: 'soul_ascetic/soa_talisman_of_four_bearing_god/',
			min: 'soul_ascetic/soa_talisman_of_four_bearing_god/min_talisman_of_four_bearing_god',
			wav: 'effect/soul_ascetic/soa_talisman_of_four_bearing_god'
		}
	],

	// Circle Of Directions And Elementals (SOA_CIRCLE_OF_DIRECTIONS_AND_ELEMENTALS), from the client's own effect folders.
	ef_soa_circle_of_directions_and_elementals: [
		{
			type: 'STR',
			file: 'soul_ascetic/soa_circle_of_directions_and_elementals/circle_directions_elements/circle_directions_elements',
			texturePath: 'soul_ascetic/soa_circle_of_directions_and_elementals/circle_directions_elements/',
			min: 'soul_ascetic/soa_circle_of_directions_and_elementals/circle_directions_elements/min_circle_directions_elements'
		}
	],

	// Soul Of Heaven And Earth (SOA_SOUL_OF_HEAVEN_AND_EARTH), from the client's own effect folders.
	ef_soa_soul_of_heaven_and_earth: [
		{
			type: 'STR',
			file: 'soul_ascetic/soa_soul_of_heaven_and_earth/soul_of_heaven_and_earth/soul_of_heaven_and_earth',
			texturePath: 'soul_ascetic/soa_soul_of_heaven_and_earth/soul_of_heaven_and_earth/',
			min: 'soul_ascetic/soa_soul_of_heaven_and_earth/soul_of_heaven_and_earth/min_soul_of_heaven_and_earth',
			wav: 'effect/soul_ascetic/soa_soul_of_heaven_and_earth'
		}
	]
};
