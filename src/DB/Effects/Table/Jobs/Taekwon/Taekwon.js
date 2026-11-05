/**
 * @module DB/Effects/Table/Jobs/Taekwon/Taekwon
 *
 * The Taekwon line's Taekwon effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Counter Kick (TK_COUNTER), from the client's own effect folders.
	ef_tk_counter: [
		{
			type: 'STR',
			file: 'new_counter_slash/new_counter_slash/new_counter_slash',
			texturePath: 'new_counter_slash/new_counter_slash/'
		},
		{
			type: 'STR',
			file: 'new_counter_slash/new_counter_slash_bottom/new_counter_slash_bottom',
			texturePath: 'new_counter_slash/new_counter_slash_bottom/',
			renderBeforeEntities: true
		}
	]
};
