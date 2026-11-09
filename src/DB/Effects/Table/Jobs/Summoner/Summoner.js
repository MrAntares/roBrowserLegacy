/**
 * @module DB/Effects/Table/Jobs/Summoner/Summoner
 *
 * The Summoner line's Summoner effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Bite (SU_BITE), from the client's own effect folders.
	ef_su_bite: [
		{
			type: 'STR',
			file: 'su_bite/su_bite',
			texturePath: 'su_bite/'
		}
	],

	// Scratch (SU_SCRATCH), from the client's own effect folders.
	ef_su_scratch: [
		{
			type: 'STR',
			file: 'su_scratch/su_scratch',
			texturePath: 'su_scratch/',
			wav: 'effect/su_scratch'
		}
	],

	// Silvervine Stem Spear (SU_SV_STEMSPEAR), from the client's own effect folders.
	ef_su_sv_stemspear: [
		{
			type: 'STR',
			file: 'su_sv_stemspear/su_sv_stemspear',
			texturePath: 'su_sv_stemspear/'
		}
	],

	// Scar of Tarou (SU_SCAROFTAROU), from the client's own effect folders.
	ef_su_scaroftarou: [
		{
			type: 'STR',
			file: 'su_scaroftarou/su_scaroftarou',
			texturePath: 'su_scaroftarou/',
			wav: 'effect/su_scaroftarou'
		}
	],

	// Picky Peck (SU_PICKYPECK), from the client's own effect folders.
	ef_su_pickypeck: [
		{
			type: 'STR',
			file: 'su_pickypeck/su_pickypeck',
			texturePath: 'su_pickypeck/',
			wav: 'effect/su_pickypeck'
		}
	],

	// Arclouse Dash (SU_ARCLOUSEDASH), from the client's own effect folders.
	ef_su_arclousedash: [
		{
			type: 'STR',
			file: 'su_arclousedash/su_arclousedash',
			texturePath: 'su_arclousedash/'
		}
	],

	// Tuna Belly (SU_TUNABELLY), from the client's own effect folders.
	ef_su_tunabelly: [
		{
			type: 'STR',
			file: 'su_tunabelly/su_scratch',
			texturePath: 'su_tunabelly/',
			wav: 'effect/su_tunabelly'
		},
		{
			type: 'STR',
			file: 'su_tunabelly/su_tunabelly',
			texturePath: 'su_tunabelly/'
		}
	],

	// Bunch of Shrimp (SU_BUNCHOFSHRIMP), from the client's own effect folders.
	ef_su_bunchofshrimp: [
		{
			type: 'STR',
			file: 'su_bunchofshrimp/su_bunchofshrimp',
			texturePath: 'su_bunchofshrimp/'
		}
	],

	// Fresh Shrimp (SU_FRESHSHRIMP), from the client's own effect folders.
	ef_su_freshshrimp: [
		{
			type: 'STR',
			file: 'su_freshshrimp/su_freshshrimp',
			texturePath: 'su_freshshrimp/'
		}
	],

	// Power of Flock (SU_POWEROFFLOCK), from the client's own effect folders.
	ef_su_powerofflock: [
		{
			type: 'STR',
			file: 'su_powerofflock/su_powerofflock',
			texturePath: 'su_powerofflock/',
			wav: 'effect/su_powerofflock'
		}
	],

	// Spirit of Savage (SU_SVG_SPIRIT), from the client's own effect folders.
	ef_su_svg_spirit: [
		{
			type: 'STR',
			file: 'su_svg_spirit/su_svg_spirit',
			texturePath: 'su_svg_spirit/',
			wav: 'effect/su_svg_spirit'
		}
	],

	// Hiss (SU_HISS), from the client's own effect folders.
	ef_su_hiss: [
		{
			type: 'STR',
			file: 'su_hiss/su_hiss',
			texturePath: 'su_hiss/',
			wav: 'effect/su_hiss'
		}
	],

	// Nyang Grass (SU_NYANGGRASS), from the client's own effect folders.
	ef_su_nyanggrass: [
		{
			type: 'STR',
			file: 'su_nyanggrass/su_nyanggrass',
			texturePath: 'su_nyanggrass/',
			wav: 'effect/su_nyanggrass'
		}
	],

	// Grooming (SU_GROOMING), from the client's own effect folders.
	ef_su_grooming: [
		{
			type: 'STR',
			file: 'su_grooming/su_grooming',
			texturePath: 'su_grooming/',
			wav: 'effect/su_grooming'
		}
	],

	// Chattering (SU_CHATTERING), from the client's own effect folders.
	ef_su_chattering: [
		{
			type: 'STR',
			file: 'su_chattering/su_chattering',
			texturePath: 'su_chattering/',
			wav: 'effect/su_chattering'
		}
	]
};
