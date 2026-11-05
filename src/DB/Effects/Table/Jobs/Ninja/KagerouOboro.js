/**
 * @module DB/Effects/Table/Jobs/Ninja/KagerouOboro
 *
 * The Ninja line's KagerouOboro effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Cross Slash (KO_JYUMONJIKIRI), from the client's own effect folders.
	ef_ko_jyumonjikiri: [
		{
			type: 'STR',
			file: 'jyumonjikiri',
			texturePath: ''
		}
	],

	// Soul Cutter (KO_SETSUDAN), from the client's own effect folders.
	ef_ko_setsudan: [
		{
			type: 'STR',
			file: 'setsudan',
			texturePath: ''
		}
	]
};
