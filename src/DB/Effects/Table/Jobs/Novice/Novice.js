/**
 * @module DB/Effects/Table/Jobs/Novice/Novice
 *
 * The Novice line's Novice effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Help Angel (NV_HELPANGEL), from the client's own effect folders.
	// The client plays effect\priest_sanctuary.wav, then effects 1367 and 1368 (the floor ring).
	ef_nv_helpangel: [
		{
			type: 'STR',
			file: 'help_angel/help_angel/help_angel',
			texturePath: 'help_angel/help_angel/',
			wav: 'effect/priest_sanctuary'
		},
		{
			type: 'STR',
			file: 'help_angel/help_angel_bottom/help_angel_bottom',
			texturePath: 'help_angel/help_angel_bottom/',
			renderBeforeEntities: true
		}
	]
};
