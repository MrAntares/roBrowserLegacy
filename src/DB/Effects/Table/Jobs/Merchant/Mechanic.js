/**
 * @module DB/Effects/Table/Jobs/Merchant/Mechanic
 *
 * The Merchant line's Mechanic effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Vulcan Arm (NC_VULCANARM), from the client's own effect folders.
	ef_nc_vulcanarm: [
		{
			type: 'STR',
			file: 'new_vulcanarm/new_vulcanarm/new_vulcanarm',
			texturePath: 'new_vulcanarm/new_vulcanarm/'
		},
		{
			type: 'STR',
			file: 'new_vulcanarm/new_vulcanarm_bottom/new_vulcanarm_bottom',
			texturePath: 'new_vulcanarm/new_vulcanarm_bottom/',
			renderBeforeEntities: true
		}
	],

	// Arm Cannon (NC_ARMSCANNON), from the client's own effect folders.
	ef_nc_armscannon_cast: [
		{
			type: 'STR',
			file: 'new_armscannon/new_armscannon_cast/new_armscannon_cast',
			texturePath: 'new_armscannon/new_armscannon_cast/'
		},
		{
			type: 'STR',
			file: 'new_armscannon/new_armscannon_cast_bottom/new_armscannon_cast_bottom',
			texturePath: 'new_armscannon/new_armscannon_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Repair (NC_REPAIR), from the client's own effect folders.
	ef_nc_repair: [
		{
			type: 'STR',
			file: 'repair weapon',
			texturePath: ''
		},
		{
			type: 'STR',
			file: 'repairweapon',
			texturePath: ''
		}
	],

	// Axe Boomerang (NC_AXEBOOMERANG), from the client's own effect folders.
	ef_nc_axeboomerang: [
		{
			type: 'STR',
			file: 'new_axeboomerang/new_axeboomerang/new_axeboomerang',
			texturePath: 'new_axeboomerang/new_axeboomerang/'
		}
	],

	// Axe Boomerang (NC_AXEBOOMERANG), from the client's own effect folders.
	ef_nc_axeboomerang_cast: [
		{
			type: 'STR',
			file: 'new_axeboomerang/new_axeboomerang_cast/new_axeboomerang_cast',
			texturePath: 'new_axeboomerang/new_axeboomerang_cast/'
		},
		{
			type: 'STR',
			file: 'new_axeboomerang/new_axeboomerang_cast_bottom/new_axeboomerang_cast_bottom',
			texturePath: 'new_axeboomerang/new_axeboomerang_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Axe Boomerang (NC_AXEBOOMERANG), from the client's own effect folders.
	ef_nc_axeboomerang_hit: [
		{
			type: 'STR',
			file: 'new_axeboomerang/new_axeboomerang_hit/new_axeboomerang_hit',
			texturePath: 'new_axeboomerang/new_axeboomerang_hit/'
		}
	],

	// Axe Tornado (NC_AXETORNADO), from the client's own effect folders.
	ef_nc_axetornado: [
		{
			type: 'STR',
			file: 'new_axetornado/new_axetornado/new_axetornado',
			texturePath: 'new_axetornado/new_axetornado/'
		},
		{
			type: 'STR',
			file: 'new_axetornado/new_axetornado_bottom/new_axetornado_bottom',
			texturePath: 'new_axetornado/new_axetornado_bottom/',
			renderBeforeEntities: true
		}
	]
};
