/**
 * @module DB/Effects/Table/Jobs/Swordman/LordKnight
 *
 * The Swordman line's LordKnight effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	spear_hit_sound: [
		{
			wav: '_hit_spear',
			attachedEntity: true
		}
	]
};
