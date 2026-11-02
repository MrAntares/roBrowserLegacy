/**
 * @module DB/Effects/Table/Jobs/Archer/Hunter
 *
 * The Archer line's Hunter effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Earlier classes: art from the client data for skills that had none.
	// Land Mine (HT_LANDMINE), from the client's own effect folders.
	ef_ht_landmine: [
		{
			type: 'STR',
			file: 'landmine',
			texturePath: ''
		}
	]
};
