/**
 * @module DB/Effects/Table/Jobs/Thief/ShadowChaser
 *
 * The Thief line's ShadowChaser effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Fatal Menace (SC_FATALMENACE), from the client's own effect folders.
	ef_sc_fatalmenace: [
		{
			type: 'STR',
			file: 'new_fatal_menace/new_fatal_menace/new_fatal_menace',
			texturePath: 'new_fatal_menace/new_fatal_menace/'
		},
		{
			type: 'STR',
			file: 'new_fatal_menace/new_fatal_menace_bottom/new_fatal_menace_bottom',
			texturePath: 'new_fatal_menace/new_fatal_menace_bottom/',
			renderBeforeEntities: true
		}
	],

	// Fatal Menace (SC_FATALMENACE), from the client's own effect folders.
	ef_sc_fatalmenace_cast: [
		{
			type: 'STR',
			file: 'new_fatal_menace/new_fatal_menace_cast/new_fatal_menace_cast',
			texturePath: 'new_fatal_menace/new_fatal_menace_cast/'
		},
		{
			type: 'STR',
			file: 'new_fatal_menace/new_fatal_menace_cast_bottom/new_fatal_menace_cast_bottom',
			texturePath: 'new_fatal_menace/new_fatal_menace_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Reproduce (SC_REPRODUCE), from the client's own effect folders.
	ef_sc_reproduce: [
		{
			type: 'STR',
			file: 'new_reproduce/new_reproduce/new_reproduce',
			texturePath: 'new_reproduce/new_reproduce/',
			wav: 'effect/reproduce'
		},
		{
			type: 'STR',
			file: 'new_reproduce/new_reproduce_bottom/new_reproduce_bottom',
			texturePath: 'new_reproduce/new_reproduce_bottom/',
			renderBeforeEntities: true
		}
	],

	// Auto Shadow Spell (SC_AUTOSHADOWSPELL), from the client's own effect folders.
	ef_sc_autoshadowspell: [
		{
			type: 'STR',
			file: 'new_autoshadowspell/new_autoshadowspell/new_autoshadowspell',
			texturePath: 'new_autoshadowspell/new_autoshadowspell/'
		},
		{
			type: 'STR',
			file: 'new_autoshadowspell/new_autoshadowspell_bottom/new_autoshadowspell_bottom',
			texturePath: 'new_autoshadowspell/new_autoshadowspell_bottom/',
			renderBeforeEntities: true
		}
	]
};
