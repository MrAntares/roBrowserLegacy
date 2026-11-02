/**
 * @module DB/Effects/Table/Jobs/Merchant/Genetic
 *
 * The Merchant line's Genetic effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	ef_thorntrap: [
		{
			wav: 'effect/\xb0\xa1\xbd\xc3\xb3\xaa\xb9\xab\xb5\xa3',
			attachedEntity: true
		}
	],

	// Cart Tornado (GN_CART_TORNADO), from the client's own effect folders.
	ef_gn_cart_tornado: [
		{
			type: 'STR',
			file: 'new_cart_tornado/new_cart_tornado/new_cart_tornado',
			texturePath: 'new_cart_tornado/new_cart_tornado/'
		},
		{
			type: 'STR',
			file: 'new_cart_tornado/new_cart_tornado_bottom/new_cart_tornado_bottom',
			texturePath: 'new_cart_tornado/new_cart_tornado_bottom/',
			renderBeforeEntities: true
		}
	],

	// Cart Cannon (GN_CARTCANNON), from the client's own effect folders.
	ef_gn_cartcannon: [
		{
			type: 'STR',
			file: 'new_cart_cannon/new_cart_cannon/new_cart_cannon',
			texturePath: 'new_cart_cannon/new_cart_cannon/'
		}
	],

	// Cart Cannon (GN_CARTCANNON), from the client's own effect folders.
	ef_gn_cartcannon_cast: [
		{
			type: 'STR',
			file: 'new_cart_cannon/new_cart_cannon_cast/new_cart_cannon_cast',
			texturePath: 'new_cart_cannon/new_cart_cannon_cast/'
		},
		{
			type: 'STR',
			file: 'new_cart_cannon/new_cart_cannon_cast_bottom/new_cart_cannon_cast_bottom',
			texturePath: 'new_cart_cannon/new_cart_cannon_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Cart Boost (GN_CARTBOOST), from the client's own effect folders.
	ef_gn_cartboost: [
		{
			type: 'STR',
			file: 'new_cartboost/new_cartboost/new_cartboost',
			texturePath: 'new_cartboost/new_cartboost/'
		},
		{
			type: 'STR',
			file: 'new_cartboost/new_cartboost_bottom/new_cartboost_bottom',
			texturePath: 'new_cartboost/new_cartboost_bottom/',
			renderBeforeEntities: true
		}
	],

	// Wall of Thorns (GN_WALLOFTHORN), from the client's own effect folders.
	ef_gn_wallofthorn_cast: [
		{
			type: 'STR',
			file: 'new_wallofthorn/new_wallofthorn_cast/new_wallofthorn_cast',
			texturePath: 'new_wallofthorn/new_wallofthorn_cast/'
		},
		{
			type: 'STR',
			file: 'new_wallofthorn/new_wallofthorn_cast_bottom/new_wallofthorn_cast_bottom',
			texturePath: 'new_wallofthorn/new_wallofthorn_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Howling of Mandragora (GN_MANDRAGORA), from the client's own effect folders.
	ef_gn_mandragora: [
		{
			type: 'STR',
			file: 'new_mandragora/new_mandragora/new_mandragora',
			texturePath: 'new_mandragora/new_mandragora/'
		},
		{
			type: 'STR',
			file: 'new_mandragora/new_mandragora_bottom/new_mandragora_bottom',
			texturePath: 'new_mandragora/new_mandragora_bottom/',
			renderBeforeEntities: true
		}
	],

	// Howling of Mandragora (GN_MANDRAGORA), from the client's own effect folders.
	ef_gn_mandragora_cast: [
		{
			type: 'STR',
			file: 'new_mandragora/new_mandragora_cast/new_mandragora_cast',
			texturePath: 'new_mandragora/new_mandragora_cast/'
		}
	],

	// Change Material (GN_CHANGEMATERIAL), from the client's own effect folders.
	ef_gn_changematerial: [
		{
			type: 'STR',
			file: 'changematerial_fa',
			texturePath: ''
		},
		{
			type: 'STR',
			file: 'changematerial_su',
			texturePath: ''
		}
	]
};
