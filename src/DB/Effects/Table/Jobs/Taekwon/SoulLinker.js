/**
 * @module DB/Effects/Table/Jobs/Taekwon/SoulLinker
 *
 * The Taekwon line's SoulLinker effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Spirit of the Assasin (SL_ASSASIN), from the client's own effect folders.
	ef_sl_assasin: [
		{
			type: 'STR',
			file: 'assasin_poisonreact',
			texturePath: ''
		},
		{
			type: 'STR',
			file: 'assasin_poisonreact_1st',
			texturePath: ''
		}
	],

	// Spirit of the Hunter (SL_HUNTER), from the client's own effect folders.
	ef_sl_hunter: [
		{
			type: 'STR',
			file: 'hunter_loud',
			texturePath: ''
		},
		{
			type: 'STR',
			file: 'hunter_poison',
			texturePath: ''
		},
		{
			type: 'STR',
			file: 'hunter_shockwave_blue',
			texturePath: ''
		}
	],

	// Estun (SL_STUN), from the client's own effect folders.
	ef_sl_stun: [
		{
			type: 'STR',
			file: 'stun',
			texturePath: '',
			wav: 'effect/_stun'
		}
	]
};
