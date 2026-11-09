/**
 * @module DB/Effects/Table/Jobs/Swordman/RuneKnight
 *
 * The Swordman line's RuneKnight effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	ef_dragonbreath_water: [
		{
			type: 'SPR',
			file: 'rk_dragonbreath_water',
			wav: 'dragon_breath',
			attachedEntity: true
		}
	],

	// Wind Cutter (RK_WINDCUTTER), from the client's own effect folders.
	ef_rk_windcutter: [
		{
			type: 'STR',
			file: 'new_windcutter/new_windcutter/new_windcutter',
			texturePath: 'new_windcutter/new_windcutter/'
		}
	]
};
