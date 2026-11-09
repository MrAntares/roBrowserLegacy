/**
 * @module DB/Effects/Table/Jobs/Mage/HighWizard
 *
 * The Mage line's HighWizard effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	ef_magicpower: [
		{
			wav: 'effect/\xb8\xb6\xb9\xfd\xb7\xc2\x20\xc1\xf5\xc6\xf8',
			attachedEntity: true
		}
	]
};
