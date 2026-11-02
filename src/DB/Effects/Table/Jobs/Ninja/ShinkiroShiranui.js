/**
 * @module DB/Effects/Table/Jobs/Ninja/ShinkiroShiranui
 *
 * The Ninja line's ShinkiroShiranui effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

import CastCircle from 'Renderer/Effects/CastCircle.js';

export default {
	// Melt Away (SS_TOKEDASU), from the client's own effect folders.
	ef_ss_tokedasu: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_tokedasu/tokedasu/tokedasu',
			texturePath: 'shinkiro_shiranui/ss_tokedasu/tokedasu/',
			min: 'shinkiro_shiranui/ss_tokedasu/tokedasu/min_tokedasu',
			wav: 'effect/shinkiro_shiranui/ss_tokedasu'
		}
	],

	// Infiltrate (SS_SHIMIRU), from the client's own effect folders.
	ef_ss_shimiru: [
		{
			wav: 'effect/shinkiro_shiranui/ss_shimiru',
			attachedEntity: true
		}
	],

	// Nightmare Erasion (SS_AKUMUKESU), from the client's own effect folders.
	ef_ss_akumukesu: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_akumukesu/akumukesu',
			texturePath: 'shinkiro_shiranui/ss_akumukesu/',
			min: 'shinkiro_shiranui/ss_akumukesu/min_akumukesu',
			wav: 'effect/shinkiro_shiranui/ss_akumukesu'
		}
	],

	// Shadow Hunting (SS_KAGEGARI), from the client's own effect folders.
	ef_ss_kagegari: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_kagegari/kagegari',
			texturePath: 'shinkiro_shiranui/ss_kagegari/',
			min: 'shinkiro_shiranui/ss_kagegari/min_kagegari',
			wav: 'effect/shinkiro_shiranui/ss_kagegari'
		}
	],

	// Shadow Dance (SS_KAGENOMAI), from the client's own effect folders.
	ef_ss_kagenomai: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_kagenomai/kagenomai',
			texturePath: 'shinkiro_shiranui/ss_kagenomai/',
			min: 'shinkiro_shiranui/ss_kagenomai/min_kagenomai'
		}
	],

	// Shadow Flash (SS_KAGEGISSEN), from the client's own effect folders.
	ef_ss_kagegissen: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_kagegissen/kagegissen',
			texturePath: 'shinkiro_shiranui/ss_kagegissen/',
			min: 'shinkiro_shiranui/ss_kagegissen/min_kagegissen',
			wav: 'effect/shinkiro_shiranui/ss_kagegissen'
		},
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_kagegissen/new_kagegissen/new_kagegissen',
			texturePath: 'shinkiro_shiranui/ss_kagegissen/new_kagegissen/'
		},
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_kagegissen/new_kagegissen_bottom/new_kagegissen_bottom',
			texturePath: 'shinkiro_shiranui/ss_kagegissen/new_kagegissen_bottom/',
			renderBeforeEntities: true
		}
	],

	// Shadow Flash (SS_KAGEGISSEN), from the client's own effect folders.
	ef_ss_kagegissen_hit: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_kagegissen/new_kagegissen_hit/new_kagegissen_hit',
			texturePath: 'shinkiro_shiranui/ss_kagegissen/new_kagegissen_hit/'
		}
	],

	// Huuma Shuriken - Grasp (SS_FUUMASHOUAKU), from the client's own effect folders.
	ef_ss_fuumashouaku: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_fuumashouaku/fuumashouaku/fuumashouaku',
			texturePath: 'shinkiro_shiranui/ss_fuumashouaku/fuumashouaku/',
			min: 'shinkiro_shiranui/ss_fuumashouaku/fuumashouaku/min_fuumashouaku',
			wav: 'effect/shinkiro_shiranui/ss_fuumashouaku'
		}
	],

	// Huuma Shuriken - Construct (SS_FUUMAKOUCHIKU), from the client's own effect folders.
	ef_ss_fuumakouchiku: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_fuumakouchiku/fuumakouchiku/fuumakouchiku',
			texturePath: 'shinkiro_shiranui/ss_fuumakouchiku/fuumakouchiku/',
			min: 'shinkiro_shiranui/ss_fuumakouchiku/fuumakouchiku/min_fuumakouchiku',
			wav: 'effect/shinkiro_shiranui/ss_fuumakouchiku'
		},
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_fuumakouchiku/new_fuumakouchiku/new_fuumakouchiku',
			texturePath: 'shinkiro_shiranui/ss_fuumakouchiku/new_fuumakouchiku/',
			min: 'shinkiro_shiranui/ss_fuumakouchiku/new_fuumakouchiku/min_new_fuumakouchiku'
		}
	],

	// Kunai - Distortion (SS_KUNAIWAIKYOKU), from the client's own effect folders.
	ef_ss_kunaiwaikyoku: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_kunaiwaikyoku/kunaiwaikyoku',
			texturePath: 'shinkiro_shiranui/ss_kunaiwaikyoku/',
			min: 'shinkiro_shiranui/ss_kunaiwaikyoku/min_kunaiwaikyoku',
			wav: 'effect/shinkiro_shiranui/ss_kunaiwaikyoku'
		}
	],

	// Kunai - Rotation (SS_KUNAIKAITEN), from the client's own effect folders.
	ef_ss_kunaikaiten: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_kunaikaiten/kunaikaiten_bottom/kunaikaiten_bottom',
			texturePath: 'shinkiro_shiranui/ss_kunaikaiten/kunaikaiten_bottom/',
			min: 'shinkiro_shiranui/ss_kunaikaiten/kunaikaiten_bottom/min_kunaikaiten_bottom',
			renderBeforeEntities: true
		}
	],

	// Kunai - Refraction (SS_KUNAIKUSSETSU), from the client's own effect folders.
	ef_ss_kunaikussetsu: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_kunaikussetsu/kunaikussetsu/kunaikussetsu',
			texturePath: 'shinkiro_shiranui/ss_kunaikussetsu/kunaikussetsu/',
			min: 'shinkiro_shiranui/ss_kunaikussetsu/kunaikussetsu/min_kunaikussetsu',
			wav: 'effect/shinkiro_shiranui/ss_kunaikussetsu'
		},
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_kunaikussetsu/kunaikussetsu_bottom/kunaikussetsu_bottom',
			texturePath: 'shinkiro_shiranui/ss_kunaikussetsu/kunaikussetsu_bottom/',
			renderBeforeEntities: true
		}
	],

	// Red Flame Cannon (SS_SEKIENHOU), from the client's own effect folders.
	ef_ss_sekienhou: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_sekienhou/sekienhou',
			texturePath: 'shinkiro_shiranui/ss_sekienhou/',
			min: 'shinkiro_shiranui/ss_sekienhou/min_sekienhou',
			wav: 'effect/shinkiro_shiranui/ss_sekienhou'
		}
	],

	// Cold Blooded Cannon (SS_REIKETSUHOU), from the client's own effect folders.
	ef_ss_reiketsuhou: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_reiketsuhou/reiketsuhou/reiketsuhou',
			texturePath: 'shinkiro_shiranui/ss_reiketsuhou/reiketsuhou/',
			min: 'shinkiro_shiranui/ss_reiketsuhou/reiketsuhou/min_reiketsuhou',
			wav: 'effect/shinkiro_shiranui/ss_reiketsuhou'
		},
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_reiketsuhou/reiketsuhou_bottom/reiketsuhou_bottom',
			texturePath: 'shinkiro_shiranui/ss_reiketsuhou/reiketsuhou_bottom/',
			min: 'shinkiro_shiranui/ss_reiketsuhou/reiketsuhou_bottom/min_reiketsuhou_bottom',
			renderBeforeEntities: true
		}
	],

	// Thundering Cannon (SS_RAIDENPOU), from the client's own effect folders.
	ef_ss_raidenpou: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_raidenpou/new_raidenpou/new_raidenpou',
			texturePath: 'shinkiro_shiranui/ss_raidenpou/new_raidenpou/',
			min: 'shinkiro_shiranui/ss_raidenpou/new_raidenpou/min_new_raidenpou',
			wav: 'effect/shinkiro_shiranui/ss_raidenpou'
		},
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_raidenpou/raidenpou',
			texturePath: 'shinkiro_shiranui/ss_raidenpou/',
			min: 'shinkiro_shiranui/ss_raidenpou/min_raidenpou'
		},
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_raidenpou/new_raidenpou_bottom/new_raidenpou_bottom',
			texturePath: 'shinkiro_shiranui/ss_raidenpou/new_raidenpou_bottom/',
			renderBeforeEntities: true
		}
	],

	// Thundering Cannon (SS_RAIDENPOU), from the client's own effect folders.
	ef_ss_raidenpou_cast: [
		{
			type: 'STR',
			castLoop: true,
			attachedEntity: true,
			file: 'shinkiro_shiranui/ss_raidenpou/new_raidenpou_cast/new_raidenpou_cast',
			texturePath: 'shinkiro_shiranui/ss_raidenpou/new_raidenpou_cast/',
			min: 'shinkiro_shiranui/ss_raidenpou/new_raidenpou_cast/min_new_raidenpou_cast',
			wav: 'effect/ef_beginspell',
			yOffset: 8
		}
	],

	// Thundering Cannon (SS_RAIDENPOU), from the client's own effect folders.
	ef_ss_raidenpou_hit: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_raidenpou/new_raidenpou_hit/new_raidenpou_hit',
			texturePath: 'shinkiro_shiranui/ss_raidenpou/new_raidenpou_hit/',
			min: 'shinkiro_shiranui/ss_raidenpou/new_raidenpou_hit/min_new_raidenpou_hit'
		}
	],

	// Golden Dragon Cannon (SS_KINRYUUHOU), from the client's own effect folders.
	ef_ss_kinryuuhou: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_kinryuuhou/kinryuuhou/kinryuuhou',
			texturePath: 'shinkiro_shiranui/ss_kinryuuhou/kinryuuhou/',
			min: 'shinkiro_shiranui/ss_kinryuuhou/kinryuuhou/min_kinryuuhou',
			wav: 'effect/shinkiro_shiranui/ss_kinryuuhou'
		}
	],

	// Golden Dragon Cannon (SS_KINRYUUHOU), from the client's own effect folders.
	ef_ss_kinryuuhou_hit: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_kinryuuhou/kinryuuhou_hit/kinryuuhou_hit',
			texturePath: 'shinkiro_shiranui/ss_kinryuuhou/kinryuuhou_hit/',
			min: 'shinkiro_shiranui/ss_kinryuuhou/kinryuuhou_hit/min_kinryuuhou_hit'
		}
	],

	// Darkening Cannon (SS_ANTENPOU), from the client's own effect folders.
	ef_ss_antenpou: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_antenpou/antenpou',
			texturePath: 'shinkiro_shiranui/ss_antenpou/',
			min: 'shinkiro_shiranui/ss_antenpou/min_antenpou',
			wav: 'effect/shinkiro_shiranui/ss_antenpou'
		}
	],

	// Shadow - Nightmare (SS_KAGEAKUMU), from the client's own effect folders.
	ef_ss_kageakumu: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_kageakumu/kageakumu',
			texturePath: 'shinkiro_shiranui/ss_kageakumu/',
			min: 'shinkiro_shiranui/ss_kageakumu/min_kageakumu'
		}
	],

	// Kunai - Nightmare (SS_HITOUAKUMU), from the client's own effect folders.
	ef_ss_hitouakumu: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_hitouakumu/hitouakumu/hitouakumu',
			texturePath: 'shinkiro_shiranui/ss_hitouakumu/hitouakumu/',
			min: 'shinkiro_shiranui/ss_hitouakumu/hitouakumu/min_hitouakumu',
			wav: 'effect/shinkiro_shiranui/ss_hitouakumu'
		}
	],

	// Dark Dragon - Nightmare (SS_ANKOKURYUUAKUMU), from the client's own effect folders.
	ef_ss_ankokuryuuakumu: [
		{
			wav: 'effect/shinkiro_shiranui/ss_ankokuryuuakumu',
			attachedEntity: true
		}
	],

	// Four Colors Charm (SS_FOUR_CHARM), from the client's own effect folders.
	ef_ss_four_charm: [
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_four_charm/four_charm_ice/four_charm_ice',
			texturePath: 'shinkiro_shiranui/ss_four_charm/four_charm_ice/',
			min: 'shinkiro_shiranui/ss_four_charm/four_charm_ice/min_four_charm_ice',
			wav: 'effect/shinkiro_shiranui/ss_four_charm'
		},
		{
			type: 'STR',
			file: 'shinkiro_shiranui/ss_four_charm/four_charm_ice_bottom/four_charm_ice_bottom',
			texturePath: 'shinkiro_shiranui/ss_four_charm/four_charm_ice_bottom/',
			min: 'shinkiro_shiranui/ss_four_charm/four_charm_ice_bottom/min_four_charm_ice_bottom',
			renderBeforeEntities: true
		}
	],

	ef_cast_circle_violet: [
		{
			// Effect 59: untinted circle, magic_violet.tga
			type: 'FUNC',
			attachedEntity: true,
			castLoop: true,
			wav: 'effect/ef_beginspell',
			func: function (Params) {
				this.add(
					new CastCircle(
						Params.Init.ownerEntity.position,
						Params.Inst.startTick,
						Params.Init.duration,
						'magic_violet.tga'
					),
					Params
				);
			}
		}
	],

	ef_cast_circle_blue: [
		{
			// Effect 54: tinted circle, ring_blue.tga, mode 2 (bluish, normal blending)
			type: 'FUNC',
			attachedEntity: true,
			castLoop: true,
			wav: 'effect/ef_beginspell',
			func: function (Params) {
				this.add(
					new CastCircle(
						Params.Init.ownerEntity.position,
						Params.Inst.startTick,
						Params.Init.duration,
						'ring_blue.tga',
						2
					),
					Params
				);
			}
		}
	]
};
