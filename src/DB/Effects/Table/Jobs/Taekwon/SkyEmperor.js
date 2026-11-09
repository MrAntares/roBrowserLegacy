/**
 * @module DB/Effects/Table/Jobs/Taekwon/SkyEmperor
 *
 * The Taekwon line's SkyEmperor effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Rising Sun (SKE_RISING_SUN), from the client's own effect folders.
	ef_ske_rising_sun: [
		{
			type: 'STR',
			file: 'sky_emperor/ske_rising_sun/ske_rising_sun',
			texturePath: 'sky_emperor/ske_rising_sun/'
		}
	],

	// Noon Blast (SKE_NOON_BLAST), from the client's own effect folders.
	ef_ske_noon_blast: [
		{
			type: 'STR',
			file: 'sky_emperor/ske_noon_blast/ske_noon_blast',
			texturePath: 'sky_emperor/ske_noon_blast/',
			min: 'sky_emperor/ske_noon_blast/min_ske_noon_blast',
			wav: 'effect/sky_emperor/ske_noon_blast'
		}
	],

	// Sunset Blast (SKE_SUNSET_BLAST), from the client's own effect folders.
	ef_ske_sunset_blast: [
		{
			type: 'STR',
			file: 'sky_emperor/ske_sunset_blast/sunset_blast',
			texturePath: 'sky_emperor/ske_sunset_blast/',
			min: 'sky_emperor/ske_sunset_blast/min_sunset_blast',
			wav: 'effect/sky_emperor/ske_sunset_blast'
		}
	],

	// Midnight Kick (SKE_MIDNIGHT_KICK), from the client's own effect folders.
	ef_ske_midnight_kick: [
		{
			type: 'STR',
			file: 'sky_emperor/ske_midnight_kick/ske_midnight_kick',
			texturePath: 'sky_emperor/ske_midnight_kick/',
			min: 'sky_emperor/ske_midnight_kick/min_ske_midnight_kick',
			wav: 'effect/sky_emperor/ske_midnight_kick'
		}
	],

	// Dawn Break (SKE_DAWN_BREAK), from the client's own effect folders.
	ef_ske_dawn_break: [
		{
			type: 'STR',
			file: 'sky_emperor/ske_dawn_break/ske_dawn_break',
			texturePath: 'sky_emperor/ske_dawn_break/',
			min: 'sky_emperor/ske_dawn_break/min_ske_dawn_break',
			wav: 'effect/sky_emperor/ske_dawn_break'
		}
	],

	// Twinkling Galaxy (SKE_TWINKLING_GALAXY), from the client's own effect folders.
	ef_ske_twinkling_galaxy: [
		{
			type: 'STR',
			file: 'sky_emperor/ske_twinkling_galaxy/twinkling_galaxy_bottom/ske_twinkling_galaxy_bottom',
			texturePath: 'sky_emperor/ske_twinkling_galaxy/twinkling_galaxy_bottom/',
			min: 'sky_emperor/ske_twinkling_galaxy/twinkling_galaxy_bottom/min_ske_twinkling_galaxy_bottom',
			renderBeforeEntities: true
		}
	],

	// Star Burst (SKE_STAR_BURST), from the client's own effect folders.
	ef_ske_star_burst: [
		{
			wav: 'effect/sky_emperor/ske_star_burst',
			attachedEntity: true
		}
	],

	// Star Cannon (SKE_STAR_CANNON), from the client's own effect folders.
	ef_ske_star_cannon: [
		{
			type: 'STR',
			file: 'sky_emperor/ske_star_cannon/star_cannon/ske_star_cannon',
			texturePath: 'sky_emperor/ske_star_cannon/star_cannon/',
			min: 'sky_emperor/ske_star_cannon/star_cannon/min_ske_star_cannon',
			wav: 'effect/sky_emperor/ske_star_cannon'
		},
		{
			type: 'STR',
			file: 'sky_emperor/ske_star_cannon/star_cannon_bottom/ske_star_cannon_bottom',
			texturePath: 'sky_emperor/ske_star_cannon/star_cannon_bottom/',
			min: 'sky_emperor/ske_star_cannon/star_cannon_bottom/min_ske_star_cannon_bottom',
			renderBeforeEntities: true
		}
	],

	// All in the Sky (SKE_ALL_IN_THE_SKY), from the client's own effect folders.
	ef_ske_all_in_the_sky: [
		{
			type: 'STR',
			file: 'sky_emperor/ske_all_in_the_sky/ske_all_in_the_sky',
			texturePath: 'sky_emperor/ske_all_in_the_sky/',
			min: 'sky_emperor/ske_all_in_the_sky/min_ske_all_in_the_sky',
			wav: 'effect/sky_emperor/ske_all_in_the_sky'
		}
	],

	// Enchanting Sky (SKE_ENCHANTING_SKY), from the client's own effect folders.
	ef_ske_enchanting_sky: [
		{
			wav: 'effect/sky_emperor/ske_enchanting_sky',
			attachedEntity: true
		}
	],

	// Sky Sun (SKE_SKY_SUN), from the client's own effect folders.
	ef_ske_sky_sun: [
		{
			type: 'STR',
			file: 'sky_emperor/ske_sky_sun/sky_sun/sky_sun',
			texturePath: 'sky_emperor/ske_sky_sun/sky_sun/',
			min: 'sky_emperor/ske_sky_sun/sky_sun/min_sky_sun',
			wav: 'effect/sky_emperor/ske_sky_sun'
		}
	],

	// Sky Sun (SKE_SKY_SUN), from the client's own effect folders.
	ef_ske_sky_sun_hit: [
		{
			type: 'STR',
			file: 'sky_emperor/ske_sky_sun/sky_sun_hit/sky_sun_hit',
			texturePath: 'sky_emperor/ske_sky_sun/sky_sun_hit/',
			min: 'sky_emperor/ske_sky_sun/sky_sun_hit/min_sky_sun_hit'
		}
	],

	// Sky Moon (SKE_SKY_MOON), from the client's own effect folders.
	ef_ske_sky_moon: [
		{
			type: 'STR',
			file: 'sky_emperor/ske_sky_moon/sky_moon/sky_moon',
			texturePath: 'sky_emperor/ske_sky_moon/sky_moon/',
			min: 'sky_emperor/ske_sky_moon/sky_moon/min_sky_moon',
			wav: 'effect/sky_emperor/ske_sky_moon'
		},
		{
			type: 'STR',
			file: 'sky_emperor/ske_sky_moon/sky_moon_bottom/sky_moon_bottom',
			texturePath: 'sky_emperor/ske_sky_moon/sky_moon_bottom/',
			min: 'sky_emperor/ske_sky_moon/sky_moon_bottom/min_sky_moon_bottom',
			renderBeforeEntities: true
		}
	],

	// Sky Moon (SKE_SKY_MOON), from the client's own effect folders.
	ef_ske_sky_moon_cast: [
		{
			type: 'STR',
			file: 'sky_emperor/ske_sky_moon/sky_moon_cast/sky_moon_cast',
			texturePath: 'sky_emperor/ske_sky_moon/sky_moon_cast/',
			min: 'sky_emperor/ske_sky_moon/sky_moon_cast/min_sky_moon_cast',
			wav: 'effect/ef_beginspell',
			castLoop: true,
			yOffset: 10,
			attachedEntity: true
		},
		{
			type: 'STR',
			file: 'sky_emperor/ske_sky_moon/sky_moon_cast_bottom/sky_moon_cast_bottom',
			texturePath: 'sky_emperor/ske_sky_moon/sky_moon_cast_bottom/',
			min: 'sky_emperor/ske_sky_moon/sky_moon_cast_bottom/min_sky_moon_cast_bottom',
			castLoop: true,
			yOffset: 10,
			renderBeforeEntities: true,
			attachedEntity: true
		}
	],

	// Sky Moon (SKE_SKY_MOON), from the client's own effect folders.
	ef_ske_sky_moon_hit: [
		{
			type: 'STR',
			file: 'sky_emperor/ske_sky_moon/sky_moon_hit/sky_moon_hit',
			texturePath: 'sky_emperor/ske_sky_moon/sky_moon_hit/',
			min: 'sky_emperor/ske_sky_moon/sky_moon_hit/min_sky_moon_hit'
		}
	],

	// Star Light Kick (SKE_STAR_LIGHT_KICK), from the client's own effect folders.
	ef_ske_star_light_kick: [
		{
			type: 'STR',
			file: 'sky_emperor/ske_star_light_kick/star_light_kick/star_light_kick',
			texturePath: 'sky_emperor/ske_star_light_kick/star_light_kick/',
			min: 'sky_emperor/ske_star_light_kick/star_light_kick/min_star_light_kick',
			wav: 'effect/sky_emperor/ske_star_light_kick'
		},
		{
			type: 'STR',
			file: 'sky_emperor/ske_star_light_kick/star_light_kick_bottom/star_light_kick_bottom',
			texturePath: 'sky_emperor/ske_star_light_kick/star_light_kick_bottom/',
			min: 'sky_emperor/ske_star_light_kick/star_light_kick_bottom/min_star_light_kick_bottom',
			renderBeforeEntities: true
		}
	],

	// Star Light Kick (SKE_STAR_LIGHT_KICK), from the client's own effect folders.
	ef_ske_star_light_kick_hit: [
		{
			type: 'STR',
			file: 'sky_emperor/ske_star_light_kick/star_light_kick_hit/star_light_kick_hit',
			texturePath: 'sky_emperor/ske_star_light_kick/star_light_kick_hit/',
			min: 'sky_emperor/ske_star_light_kick/star_light_kick_hit/min_star_light_kick_hit'
		}
	]
};
