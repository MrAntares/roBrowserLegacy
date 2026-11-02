/**
 * @module DB/Effects/Table/Jobs/Mage/Warlock
 *
 * The Mage line's Warlock effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	ef_jackfrost: [
		{
			wav: 'effect/wl_jackfrost',
			attachedEntity: true
		},
		{
			//ice spikes traveling outward from the caster in all 8 directions
			type: 'TRAIL',
			attachedEntity: false,
			duration: 1000,
			speed: 24,
			interval: 34,
			startOffset: 1,
			angles: [0, 45, 90, 135, 180, 225, 270, 315],
			spread: [0.1, 0.4],
			spawn: [
				{
					type: 'QuadHorn',
					textureFile: 'effect/ice.tga',
					attachedEntity: false,
					duration: 670,
					height: [0.2, 1.8],
					offsetX: 0,
					offsetY: 0,
					offsetZ: 0,
					bottomSize: [0.06, 0.22],
					blendMode: 8,
					rotateX: [-15, 15],
					rotateY: [0, 360],
					color: [1.0, 1.0, 1.0, 1.0],
					animation: 4,
					animationSpeed: 330,
					riseDistance: 2.0,
					fadeOut: 170
				}
			]
		}
	],

	ef_siennaexecrate: [
		{
			wav: 'effect/wl_siennaexecrate',
			attachedEntity: true
		}
	],

	// Soul Expansion (WL_SOULEXPANSION), from the client's own effect folders.
	ef_wl_soulexpansion_cast: [
		{
			type: 'STR',
			file: 'new_soulexpansion/new_soulexpansion_cast/new_soulexpansion_cast',
			texturePath: 'new_soulexpansion/new_soulexpansion_cast/'
		},
		{
			type: 'STR',
			file: 'new_soulexpansion/new_soulexpansion_cast_bottom/new_soulexpansion_cast_bottom',
			texturePath: 'new_soulexpansion/new_soulexpansion_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Soul Expansion (WL_SOULEXPANSION), from the client's own effect folders.
	ef_wl_soulexpansion_hit: [
		{
			type: 'STR',
			file: 'new_soulexpansion/new_soulexpansion_hit/new_soulexpansion_hit',
			texturePath: 'new_soulexpansion/new_soulexpansion_hit/'
		},
		{
			type: 'STR',
			file: 'new_soulexpansion/new_soulexpansion_hit_bottom/new_soulexpansion_hit_bottom',
			texturePath: 'new_soulexpansion/new_soulexpansion_hit_bottom/',
			renderBeforeEntities: true
		}
	],

	// Hell Inferno (WL_HELLINFERNO), from the client's own effect folders.
	ef_wl_hellinferno: [
		{
			type: 'STR',
			file: 'new_hellinferno/new_hellinferno/new_hellinferno',
			texturePath: 'new_hellinferno/new_hellinferno/'
		},
		{
			type: 'STR',
			file: 'new_hellinferno/new_hellinferno_bottom/new_hellinferno_bottom',
			texturePath: 'new_hellinferno/new_hellinferno_bottom/',
			renderBeforeEntities: true
		}
	],

	// Hell Inferno (WL_HELLINFERNO), from the client's own effect folders.
	ef_wl_hellinferno_cast: [
		{
			type: 'STR',
			file: 'new_hellinferno/new_hellinferno_cast_bottom/new_hellinferno_cast_bottom',
			texturePath: 'new_hellinferno/new_hellinferno_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Comet (WL_COMET), from the client's own effect folders.
	ef_wl_comet: [
		{
			type: 'STR',
			file: 'new_comet/new_comet/new_comet',
			texturePath: 'new_comet/new_comet/'
		},
		{
			type: 'STR',
			file: 'new_comet/new_comet_bottom/new_comet_bottom',
			texturePath: 'new_comet/new_comet_bottom/',
			renderBeforeEntities: true
		}
	],

	// Comet (WL_COMET), from the client's own effect folders.
	ef_wl_comet_cast: [
		{
			type: 'STR',
			file: 'new_comet/new_comet_cast/new_comet_cast',
			texturePath: 'new_comet/new_comet_cast/'
		},
		{
			type: 'STR',
			file: 'new_comet/new_comet_cast_bottom/new_comet_cast_bottom',
			texturePath: 'new_comet/new_comet_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Chain Lightning (WL_CHAINLIGHTNING), from the client's own effect folders.
	ef_wl_chainlightning_cast: [
		{
			type: 'STR',
			file: 'new_chainlightning/new_chainlightning_cast/new_chainlightning_cast',
			texturePath: 'new_chainlightning/new_chainlightning_cast/'
		},
		{
			type: 'STR',
			file: 'new_chainlightning/new_chainlightning_cast_bottom/new_chainlightning_cast_bottom',
			texturePath: 'new_chainlightning/new_chainlightning_cast_bottom/',
			renderBeforeEntities: true
		}
	],

	// Tetra Vortex Fire (WL_TETRAVORTEX_FIRE), from the client's own effect folders.
	ef_wl_tetravortex_fire: [
		{
			type: 'STR',
			file: 'mineffect/new_tetravortex/new_tetravortex_fire/new_tetravortex_fire',
			texturePath: 'mineffect/new_tetravortex/new_tetravortex_fire/'
		}
	],

	// Tetra Vortex Water (WL_TETRAVORTEX_WATER), from the client's own effect folders.
	ef_wl_tetravortex_water: [
		{
			type: 'STR',
			file: 'mineffect/new_tetravortex/new_tetravortex_water/new_tetravortex_water',
			texturePath: 'mineffect/new_tetravortex/new_tetravortex_water/'
		}
	],

	// Tetra Vortex Wind (WL_TETRAVORTEX_WIND), from the client's own effect folders.
	ef_wl_tetravortex_wind: [
		{
			type: 'STR',
			file: 'mineffect/new_tetravortex/new_tetravortex_wind/new_tetravortex_wind',
			texturePath: 'mineffect/new_tetravortex/new_tetravortex_wind/'
		}
	],

	// Summon Attack Fire (WL_SUMMON_ATK_FIRE), from the client's own effect folders.
	ef_wl_summon_atk_fire: [
		{
			type: 'STR',
			file: 'fire',
			texturePath: ''
		}
	]
};
