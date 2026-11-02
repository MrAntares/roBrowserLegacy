/**
 * @module DB/Effects/Table/Jobs/Taekwon/StarEmperor
 *
 * The Taekwon line's StarEmperor effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Full Moon Kick (SJ_FULLMOONKICK), from the client's own effect folders.
	ef_sj_fullmoonkick: [
		{
			type: 'STR',
			file: 'fullmoon_kick/fullmoon_kick',
			texturePath: 'fullmoon_kick/'
		}
	],

	// New Moon Kick (SJ_NEWMOONKICK), from the client's own effect folders.
	ef_sj_newmoonkick: [
		{
			type: 'STR',
			file: 'newmoon_kick/newmoon_kick',
			texturePath: 'newmoon_kick/'
		}
	],

	// Flash Kick (SJ_FLASHKICK), from the client's own effect folders.
	ef_sj_flashkick: [
		{
			type: 'STR',
			file: 'flash_kick/flash_kick',
			texturePath: 'flash_kick/'
		}
	],

	// Falling Star (SJ_FALLINGSTAR), from the client's own effect folders.
	ef_sj_fallingstar: [
		{
			type: 'STR',
			file: 'falling_star/falling_star',
			texturePath: 'falling_star/'
		}
	],

	// Document of Sun Moon and Star (SJ_DOCUMENT), from the client's own effect folders.
	ef_sj_document: [
		{
			type: 'STR',
			file: 'sj_document/sj_document',
			texturePath: 'sj_document/'
		}
	],

	// Solar Burst (SJ_SOLARBURST), from the client's own effect folders.
	ef_sj_solarburst: [
		{
			type: 'STR',
			file: 'solar_burst/solar_burst',
			texturePath: 'solar_burst/'
		}
	],

	// Prominence Kick (SJ_PROMINENCEKICK), from the client's own effect folders.
	ef_sj_prominencekick: [
		{
			type: 'STR',
			file: 'prominence_kick/prominence_kick',
			texturePath: 'prominence_kick/'
		}
	]
};
