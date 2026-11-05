/**
 * @module DB/Effects/Table/Jobs/Mage/Mage
 *
 * The Mage line's Mage effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	stonecurse_sound: [
		{
			// The sound the official client plays with Stone Curse's effect 23 (not part of 23 itself)
			wav: '_stonecurse',
			attachedEntity: true
		}
	]
};
