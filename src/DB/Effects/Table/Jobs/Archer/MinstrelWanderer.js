/**
 * @module DB/Effects/Table/Jobs/Archer/MinstrelWanderer
 *
 * The Archer line's MinstrelWanderer effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	ef_rush_windmill: [
		{
			wav: 'effect/\xc7\xb3\xc2\xf7\xb8\xa6\xc7\xe2\xc7\xd8\xb5\xb9\xb0\xdd', //ÇłÂ÷¸¦ÇâÇŘµą°Ý
			attachedEntity: true
		},
		{
			alphaMax: 1,
			attachedEntity: true,
			duration: 1000,
			delayLate: 500,
			duplicate: 7,
			fadeOut: true,
			file: 'effect/ac_center2.tga',
			red: 0.5,
			green: 0.01,
			blue: 0.9,
			posxRand: 1.5,
			posyRand: 1,
			poszEndRand: 1,
			poszEndRandMiddle: 6,
			poszStartRand: 1,
			poszStartRandMiddle: 1,
			sizeRandY: 15,
			sizeRandYMiddle: 45,
			sizeX: 2.5,
			type: '3D',
			zIndex: 0
		},
		{
			alphaMax: 0.75,
			attachedEntity: true,
			duration: 1000,
			delayOffset: 400,
			duplicate: 3,
			fadeOut: true,
			file: 'effect/ac_center2.tga',
			posxRand: 1.5,
			posyRand: 1,
			poszEndRand: 1,
			poszEndRandMiddle: 6,
			poszStartRand: 1,
			poszStartRandMiddle: 1,
			sizeRandY: 15,
			sizeRandYMiddle: 45,
			sizeX: 2.5,
			type: '3D',
			zIndex: 0
		},
		{
			alphaMax: 1,
			attachedEntity: true,
			duration: 1000,
			duplicate: 10,
			fadeOut: true,
			file: 'effect/ac_center2.tga',
			posxRand: 1.5,
			posyRand: 1,
			poszEndRand: 1,
			poszEndRandMiddle: 6,
			poszStartRand: 1,
			poszStartRandMiddle: 1,
			sizeRandY: 15,
			sizeRandYMiddle: 45,
			sizeX: 2.5,
			type: '3D',
			zIndex: 0
		},
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function EffectBodyColor(Params) {
				const entity = Params.Init;

				entity.animations.add(function (tick) {
					if (tick < 500) {
						if (tick % 2 == 0) {
							entity._flashColor[0] = 1;
							entity._flashColor[1] = 1;
							entity._flashColor[2] = 1;
							entity._flashColor[3] = 0.4;
							entity.recalculateBlendingColor();
						} else {
							entity._flashColor[0] = 1;
							entity._flashColor[1] = 1;
							entity._flashColor[2] = 1;
							entity._flashColor[3] = 1;
							entity.recalculateBlendingColor();
						}
					} else {
						entity._flashColor[0] = 1;
						entity._flashColor[1] = 1;
						entity._flashColor[2] = 1;
						entity._flashColor[3] = 1;
						entity.recalculateBlendingColor();
						return true;
					}
				});
			}
		}
	],

	ef_swing_dance: [
		{
			wav: 'effect/\xbd\xba\xc0\xae\xb4\xed\xbd\xba',
			attachedEntity: true
		},
		{
			alphaMax: 1,
			attachedEntity: true,
			duration: 1000,
			delayLate: 500,
			duplicate: 7,
			fadeOut: true,
			file: 'effect/ac_center2.tga',
			red: 1,
			green: 0.1,
			blue: 0.5,
			posxRand: 1.5,
			posyRand: 1,
			poszEndRand: 1,
			poszEndRandMiddle: 6,
			poszStartRand: 1,
			poszStartRandMiddle: 1,
			sizeRandY: 15,
			sizeRandYMiddle: 45,
			sizeX: 2.5,
			type: '3D',
			zIndex: 0
		},
		{
			alphaMax: 0.75,
			attachedEntity: true,
			duration: 1000,
			delayOffset: 400,
			duplicate: 3,
			fadeOut: true,
			file: 'effect/ac_center2.tga',
			posxRand: 1.5,
			posyRand: 1,
			poszEndRand: 1,
			poszEndRandMiddle: 6,
			poszStartRand: 1,
			poszStartRandMiddle: 1,
			sizeRandY: 15,
			sizeRandYMiddle: 45,
			sizeX: 2.5,
			type: '3D',
			zIndex: 0
		},
		{
			alphaMax: 1,
			attachedEntity: true,
			duration: 1000,
			duplicate: 10,
			fadeOut: true,
			file: 'effect/ac_center2.tga',
			posxRand: 1.5,
			posyRand: 1,
			poszEndRand: 1,
			poszEndRandMiddle: 6,
			poszStartRand: 1,
			poszStartRandMiddle: 1,
			sizeRandY: 15,
			sizeRandYMiddle: 45,
			sizeX: 2.5,
			type: '3D',
			zIndex: 0
		},
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function EffectBodyColor(Params) {
				const entity = Params.Init.ownerEntity;

				entity.animations.add(function (tick) {
					if (tick < 500) {
						if (tick % 2 == 0) {
							entity._flashColor[0] = 1;
							entity._flashColor[1] = 0.1;
							entity._flashColor[2] = 0.5;
							entity._flashColor[3] = 0.4;
							entity.recalculateBlendingColor();
						} else {
							entity._flashColor[0] = 1;
							entity._flashColor[1] = 1;
							entity._flashColor[2] = 1;
							entity._flashColor[3] = 1;
							entity.recalculateBlendingColor();
						}
					} else {
						entity._flashColor[0] = 1;
						entity._flashColor[1] = 1;
						entity._flashColor[2] = 1;
						entity._flashColor[3] = 1;
						entity.recalculateBlendingColor();
						return true;
					}
				});
			}
		}
	],

	ef_metalicsound: [
		{
			wav: 'effect/metalic',
			attachedEntity: true
		}
	],

	ef_frigg_song: [
		{
			wav: 'effect/wm_frigg_song',
			attachedEntity: true
		}
	],

	ef_moonlit_serenade: [
		{
			wav: 'effect/\xb4\xde\xba\xfb\xbc\xbc\xb7\xb9\xb3\xaa\xb5\xa5',
			attachedEntity: true
		}
	],

	ef_sound_of_destruction: [
		{
			wav: 'effect/\xbb\xe7\xbf\xee\xb5\xe5\xbf\xc0\xba\xea\xb5\xf0\xbd\xba\xc6\xae\xb7\xb0\xbc\xc7',
			attachedEntity: true
		}
	],

	ef_great_echo: [
		{
			wav: 'effect/\xb1\xd7\xb7\xb9\xc0\xcc\xc6\xae\xbf\xa1\xc4\xda',
			attachedEntity: true
		}
	],

	ef_valley_of_death: [
		{
			wav: 'effect/\xbb\xe7\xb8\xc1\xc0\xc7\xb0\xf1\xc2\xa5\xb1\xe2\xbf\xa1\xbc\xad',
			attachedEntity: true
		}
	],

	ef_harmonize: [
		{
			wav: 'effect/\xc7\xcf\xb8\xf0\xb3\xaa\xc0\xcc\xc1\xee',
			attachedEntity: true
		}
	],

	ef_echo_song: [
		{
			wav: 'effect/\xb8\xde\xbe\xc6\xb8\xae\xc0\xc7\xb3\xeb\xb7\xa1',
			attachedEntity: true
		}
	],

	ef_symphony_of_lovers: [
		{
			wav: 'effect/\xbf\xac\xc0\xce\xb5\xe9\xc0\xbb\xc0\xa7\xc7\xd1\xbd\xc9\xc6\xf7\xb4\xcf',
			attachedEntity: true
		}
	],

	// Metallic Sound (WM_METALICSOUND), from the client's own effect folders.
	ef_wm_metalicsound: [
		{
			type: 'STR',
			file: 'new_metalicsound/new_metalicsound/new_metalicsound',
			texturePath: 'new_metalicsound/new_metalicsound/'
		},
		{
			type: 'STR',
			file: 'new_metalicsound/new_metalicsound_bottom/new_metalicsound_bottom',
			texturePath: 'new_metalicsound/new_metalicsound_bottom/',
			renderBeforeEntities: true
		}
	],

	// Metallic Sound (WM_METALICSOUND), from the client's own effect folders.
	ef_wm_metalicsound_hit: [
		{
			type: 'STR',
			file: 'new_metalicsound/new_metalicsound_hit/new_metalicsound_hit',
			texturePath: 'new_metalicsound/new_metalicsound_hit/'
		}
	],

	// Reverberation Magic (WM_REVERBERATION_MAGIC), from the client's own effect folders.
	ef_wm_reverberation_magic_hit: [
		{
			type: 'STR',
			file: 'new_reverberation/new_reverberation_hit/new_reverberation_hit',
			texturePath: 'new_reverberation/new_reverberation_hit/'
		}
	],

	// Severe Rainstorm (WM_SEVERE_RAINSTORM), from the client's own effect folders.
	ef_wm_severe_rainstorm: [
		{
			type: 'STR',
			file: 'new_severerainstorm/new_severerainstorm/new_severerainstorm',
			texturePath: 'new_severerainstorm/new_severerainstorm/'
		}
	],

	// Severe Rainstorm (WM_SEVERE_RAINSTORM), from the client's own effect folders.
	ef_wm_severe_rainstorm_cast: [
		{
			type: 'STR',
			file: 'new_severerainstorm/new_severerainstorm_cast/new_severerainstorm_cast',
			texturePath: 'new_severerainstorm/new_severerainstorm_cast/'
		}
	],

	// Sound of Destruction (WM_SOUND_OF_DESTRUCTION), from the client's own effect folders.
	ef_wm_sound_of_destruction_cast: [
		{
			type: 'STR',
			file: 'new_soundofdestruction/new_soundofdestruction_cast/new_soundofdestruction_cast',
			texturePath: 'new_soundofdestruction/new_soundofdestruction_cast/'
		},
		{
			type: 'STR',
			file: 'new_soundofdestruction/new_soundofdestruction_cast_bottom/new_soundofdestruction_cast_bottom',
			texturePath: 'new_soundofdestruction/new_soundofdestruction_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Unlimited Humming Voice (WM_UNLIMITED_HUMMING_VOICE), from the client's own effect folders.
	ef_wm_unlimited_humming_voice: [
		{
			type: 'STR',
			file: 'new_unlimit/new_unlimit/new_unlimit',
			texturePath: 'new_unlimit/new_unlimit/'
		},
		{
			type: 'STR',
			file: 'new_unlimit/new_unlimit_bottom/new_unlimit_bottom',
			texturePath: 'new_unlimit/new_unlimit_bottom/',
			renderBeforeEntities: true
		}
	],

	// Severe Rainstorm Melee (WM_SEVERE_RAINSTORM_MELEE), from the client's own effect folders.
	ef_wm_severe_rainstorm_melee: [
		{
			type: 'STR',
			file: 'new_severerainstorm/new_severerainstorm/new_severerainstorm',
			texturePath: 'new_severerainstorm/new_severerainstorm/'
		}
	],

	// Severe Rainstorm Melee (WM_SEVERE_RAINSTORM_MELEE), from the client's own effect folders.
	ef_wm_severe_rainstorm_melee_cast: [
		{
			type: 'STR',
			file: 'new_severerainstorm/new_severerainstorm_cast/new_severerainstorm_cast',
			texturePath: 'new_severerainstorm/new_severerainstorm_cast/'
		}
	]
};
