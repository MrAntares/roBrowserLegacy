/**
 * @module DB/Effects/Table/ById/Effects1100-1199
 *
 * Effects 1100 to 1199 of the effect table, in ID order (see EffectConst.js).
 * DB/Effects/EffectTable.js joins the parts; its header lists the parameters a row takes.
 */

export default {
	1130: [
		{
			//EF_BAKURETSU_HADOU - Hat effect example (SPR)
			type: 'SPR',
			file: 'bakuretsu_hadou/bakuretsu_hadou',
			texturePath: 'bakuretsu_hadou/',
			attachedEntity: true,
			repeat: true,
			head: true,
			yOffset: -50
		}
	],

	1111: [
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function EffectBodyColor(Params) {
				const entity = Params.Init.ownerEntity;
				entity._flashColor[0] = 1.0;
				entity._flashColor[1] = 0.0;
				entity._flashColor[2] = 0.0;
				entity._flashColor[3] = 0.0;
				entity.recalculateBlendingColor();

				entity.animations.add(function (tick) {
					entity._flashColor[3] = 0.0 + tick / 100;
					entity.recalculateBlendingColor();
					if (tick > 300) {
						entity._flashColor[0] = 1.0;
						entity._flashColor[1] = 1.0;
						entity._flashColor[2] = 1.0;
						entity._flashColor[3] = 1.0;
						entity.recalculateBlendingColor();
						return true;
					}
				});
			}
		}
	],

	1186: [
		{
			type: 'STR',
			file: 'new_dropitem/dropitem_pink/dropitem_pink/dropitem_pink',
			texturePath: 'new_dropitem/dropitem_pink/dropitem_pink/',
			renderBeforeEntities: true
		},
		{
			type: 'STR',
			file: 'new_dropitem/dropitem_pink/dropitem_pink_bottom/dropitem_pink_bottom',
			texturePath: 'new_dropitem/dropitem_pink/dropitem_pink_bottom/',
			renderBeforeEntities: true
		},
		{
			wav: 'effect/drop_pink'
		}
	],
	1189: [
		{
			type: 'STR',
			file: 'new_dropitem/dropitem_yellow/dropitem_yellow/dropitem_yellow',
			texturePath: 'new_dropitem/dropitem_yellow/dropitem_yellow/'
		},
		{
			type: 'STR',
			file: 'new_dropitem/dropitem_yellow/dropitem_yellow_bottom/dropitem_yellow_bottom',
			texturePath: 'new_dropitem/dropitem_yellow/dropitem_yellow_bottom/'
		},
		{
			wav: 'effect/drop_yellow'
		}
	],
	1190: [
		{
			type: 'STR',
			file: 'new_dropitem/dropitem_purple/dropitem_purple/dropitem_purple',
			texturePath: 'new_dropitem/dropitem_purple/dropitem_purple/'
		},
		{
			type: 'STR',
			file: 'new_dropitem/dropitem_purple/dropitem_purple_bottom/dropitem_purple_bottom',
			texturePath: 'new_dropitem/dropitem_purple/dropitem_purple_bottom/'
		},
		{
			wav: 'effect/drop_purple'
		}
	]
};
