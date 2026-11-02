/**
 * @module DB/Effects/Table/Jobs/Mage/Sorcerer
 *
 * The Mage line's Sorcerer effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Earth Grave (SO_EARTHGRAVE), from the client's own effect folders.
	ef_so_earthgrave: [
		{
			type: 'STR',
			file: 'new_earthgrave/new_earthgrave/new_earthgrave',
			texturePath: 'new_earthgrave/new_earthgrave/'
		},
		{
			type: 'STR',
			file: 'new_earthgrave/new_earthgrave_bottom/new_earthgrave_bottom',
			texturePath: 'new_earthgrave/new_earthgrave_bottom/',
			renderBeforeEntities: true
		}
	],

	// Earth Grave (SO_EARTHGRAVE), from the client's own effect folders.
	ef_so_earthgrave_hit: [
		{
			type: 'STR',
			file: 'new_earthgrave/new_earthgrave_hit/new_earthgrave_hit',
			texturePath: 'new_earthgrave/new_earthgrave_hit/'
		}
	],

	// Diamond Dust (SO_DIAMONDDUST), from the client's own effect folders.
	ef_so_diamonddust: [
		{
			type: 'STR',
			file: 'new_diamonddust/new_diamonddust/new_diamonddust',
			texturePath: 'new_diamonddust/new_diamonddust/'
		},
		{
			type: 'STR',
			file: 'new_diamonddust/new_diamonddust_bottom/new_diamonddust_bottom',
			texturePath: 'new_diamonddust/new_diamonddust_bottom/',
			renderBeforeEntities: true
		}
	],

	// Diamond Dust (SO_DIAMONDDUST), from the client's own effect folders.
	ef_so_diamonddust_cast: [
		{
			type: 'STR',
			file: 'new_diamonddust/new_diamonddust_cast/new_diamonddust_cast',
			texturePath: 'new_diamonddust/new_diamonddust_cast/'
		}
	],

	// Poison Buster (SO_POISON_BUSTER), from the client's own effect folders.
	ef_so_poison_buster: [
		{
			type: 'STR',
			file: 'poison',
			texturePath: ''
		}
	],

	// Psychic Wave (SO_PSYCHIC_WAVE), from the client's own effect folders.
	ef_so_psychic_wave: [
		{
			type: 'STR',
			file: 'new_psychicwave/new_psychicwave/new_psychicwave',
			texturePath: 'new_psychicwave/new_psychicwave/'
		},
		{
			type: 'STR',
			file: 'new_psychicwave/new_psychicwave_bottom/new_psychicwave_bottom',
			texturePath: 'new_psychicwave/new_psychicwave_bottom/',
			renderBeforeEntities: true
		}
	],

	// Psychic Wave (SO_PSYCHIC_WAVE), from the client's own effect folders.
	ef_so_psychic_wave_cast: [
		{
			type: 'STR',
			file: 'new_psychicwave/new_psychicwave_cast/new_psychicwave_cast',
			texturePath: 'new_psychicwave/new_psychicwave_cast/'
		}
	],

	// Spirit Recovery (SO_EL_CURE), from the client's own effect folders.
	ef_so_el_cure: [
		{
			type: 'STR',
			file: 'cure',
			texturePath: ''
		}
	]
};
