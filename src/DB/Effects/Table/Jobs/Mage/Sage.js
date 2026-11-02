/**
 * @module DB/Effects/Table/Jobs/Mage/Sage
 *
 * The Mage line's Sage effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Suicide (SA_INSTANTDEATH), from the client's own effect folders.
	ef_sa_instantdeath: [
		{
			type: 'STR',
			file: 'suicide',
			texturePath: ''
		}
	]
};
