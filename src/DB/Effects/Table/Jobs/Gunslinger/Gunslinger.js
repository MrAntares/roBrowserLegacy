/**
 * @module DB/Effects/Table/Jobs/Gunslinger/Gunslinger
 *
 * The Gunslinger line's Gunslinger effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	gunslinger_coin: [
		{
			// coin caster
			wav: 'effect/\xc7\xc3\xb8\xb3', //ÇĂ¸ł
			attachedEntity: true
		}
	],

	// Increasing Accuracy (GS_INCREASING), from the client's own effect folders.
	ef_gs_increasing: [
		{
			type: 'STR',
			file: 'increasing_activity/increasing_activity/increasing_activity',
			texturePath: 'increasing_activity/increasing_activity/',
			min: 'increasing_activity/increasing_activity/min_increasing_activity'
		}
	],

	// Increasing Accuracy (GS_INCREASING), from the client's own effect folders.
	ef_gs_increasing_cast: [
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
	]
};
