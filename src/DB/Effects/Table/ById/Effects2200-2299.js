/**
 * @module DB/Effects/Table/ById/Effects2200-2299
 *
 * Effects 2200 to 2299 of the effect table, in ID order (see EffectConst.js).
 * DB/Effects/EffectTable.js joins the parts; its header lists the parameters a row takes.
 */

export default {
	// Mayhemic Thorns cast: the client plays acidified_zone_ground_cast.str (2228) and its
	// floor layer (2229) for the cast time
	2228: [
		{
			type: 'STR',
			file: 'acidified_zone_ground/acidified_zone_ground_cast/acidified_zone_ground_cast',
			texturePath: 'acidified_zone_ground/acidified_zone_ground_cast/',
			min: 'acidified_zone_ground/acidified_zone_ground_cast/min_acidified_zone_ground_cast',
			wav: 'effect/ef_beginspell',
			castLoop: true,
			attachedEntity: true
		}
	],

	2229: [
		{
			type: 'STR',
			file: 'acidified_zone_ground/acidified_zone_ground_cast_bottom/acidified_zone_ground_cast_bottom',
			texturePath: 'acidified_zone_ground/acidified_zone_ground_cast_bottom/',
			min: 'acidified_zone_ground/acidified_zone_ground_cast_bottom/min_acidified_zone_ground_cast_bottom',
			renderBeforeEntities: true,
			castLoop: true,
			attachedEntity: true
		}
	]
};
