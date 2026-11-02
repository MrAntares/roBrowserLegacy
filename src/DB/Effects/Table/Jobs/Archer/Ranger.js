/**
 * @module DB/Effects/Table/Jobs/Archer/Ranger
 *
 * The Archer line's Ranger effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	ef_wugbite: [
		{
			wav: 'wug_bite',
			attachedEntity: true
		}
	],

	ef_wugstrike: [
		{
			wav: 'wug_strike',
			attachedEntity: true
		}
	],

	ef_wugrider: [
		{
			wav: 'wolf_stand',
			attachedEntity: true
		}
	],

	// Fear Breeze (RA_FEARBREEZE), from the client's own effect folders.
	ef_ra_fearbreeze: [
		{
			type: 'STR',
			file: 'new_fearbreeze/new_fearbreeze',
			texturePath: 'new_fearbreeze/'
		}
	],

	// Unlimited (RA_UNLIMIT), from the client's own effect folders.
	ef_ra_unlimit: [
		{
			type: 'STR',
			file: 'new_unlimit/new_unlimit/new_unlimit',
			texturePath: 'new_unlimit/new_unlimit/',
			wav: 'ra_unlimit'
		},
		{
			type: 'STR',
			file: 'new_unlimit/new_unlimit_bottom/new_unlimit_bottom',
			texturePath: 'new_unlimit/new_unlimit_bottom/',
			renderBeforeEntities: true
		}
	]
};
