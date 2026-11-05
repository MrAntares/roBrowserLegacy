/**
 * @module DB/Effects/Table/Jobs/Acolyte/ArchBishop
 *
 * The Acolyte line's ArchBishop effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	ef_ancilla: [
		{
			wav: 'effect/ab_ancilla',
			attachedEntity: true
		}
	],

	ef_duplelight: [
		{
			wav: 'effect/ab_duplelight',
			attachedEntity: true
		}
	],

	// Secrament (AB_SECRAMENT), from the client's own effect folders.
	ef_ab_secrament: [
		{
			type: 'STR',
			file: 'new_secrament/new_secrament/new_secrament',
			texturePath: 'new_secrament/new_secrament/'
		}
	]
};
