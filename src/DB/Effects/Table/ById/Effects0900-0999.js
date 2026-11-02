/**
 * @module DB/Effects/Table/ById/Effects0900-0999
 *
 * Effects 900 to 999 of the effect table, in ID order (see EffectConst.js).
 * DB/Effects/EffectTable.js joins the parts; its header lists the parameters a row takes.
 */

import CastRing from 'Renderer/Effects/CastRing.js';
import CastFunnel from 'Renderer/Effects/CastFunnel.js';
import CasterMarks from 'Renderer/Effects/CasterMarks.js';
import RotateLine from 'Renderer/Effects/RotateLine.js';

export default {
	//890: [{}],	//EF_SPINMOVE	   Rotation
	//891: [{}],	//EF_FIREBALL4	   Magic shots [S]
	//892: [{}],	//EF_TRIPLEATTACK4	   Fastness with hitting sound[S]
	//893: [{}],	//EF_CHEMICAL3S	   Blue-white light passing by
	//894: [{}],	//EF_GROUNDSHAKE	   (Nothing)
	//895: [{}],	//EF_DQ9_CHARGE	   Big wheel of flat light beams
	//896: [{}],	//EF_DQ9_CHARGE2	   Still sun shaped lightning aura
	//897: [{}],	//EF_DQ9_CHARGE3	   Animated sun shaped lightning aura
	//898: [{}],	//EF_DQ9_CHARGE4	   Animated, curvy sun shaped lightning aura
	//899: [{}],	//EF_BLUELINE	   White/red light shots from below
	//900: [{}],	//EF_SELFSCROLL	   Animated, slow curvy sun shaped lightning aura
	//901: [{}],	//EF_SPR_LIGHTPRINT	   Explosion
	//902: [{}],	//EF_PNG_TEST	   Floating bedtable texture
	//903: [{}],	//EF_BEGINSPELL_YB	   Castish flamey cone
	//904: [{}],	//EF_CHEMICAL2DASH4	   Yellow/pink lights passing by
	//905: [{}],	//EF_GROUNDSHAKE2	   Expanding circle

	906: [
		{
			//EF_PRESSURE2	   Shield Press (falling shield)
			type: '3D',
			alphaMax: 0.6,
			attachedEntity: true,
			blendMode: 2,
			duration: 500,
			rotate: true,
			angle: 0,
			toAngle: -611,
			poszStart: 20,
			poszEnd: 5,
			size: 100,
			zIndex: 1,
			file: 'effect/shield.bmp',
			wav: 'effect/\xc7\xc1\xb7\xb9\xbc\xc5'
		},
		{
			type: '3D',
			alphaMax: 0.6,
			attachedEntity: true,
			blendMode: 2,
			duration: 500,
			delayOffset: 501,
			fadeOut: true,
			angle: -611,
			posz: 5,
			size: 100,
			zIndex: 1,
			file: 'effect/shield.bmp',
			delayWav: 500,
			wav: 'effect/lg_shieldpress'
		}
	],

	//907: [{}],	//EF_RG_COIN7	   Chainy, metalish sound [S]

	908: [
		{
			//EF_PRIMECHARGE2	   Prestige (sphere of yellow particles)
			wav: 'effect/lg_prestige'
		}
	],

	909: [
		{
			//EF_PRIMECHARGE3	   Banding (sphere of red particles)
			wav: 'effect/lg_banding'
		}
	],

	910: [
		{
			//EF_PRIMECHARGE4	   Inspiration (sphere of blue particles)
			wav: 'effect/lg_inspiration'
		}
	],

	911: [
		{
			// EF_GREENCASTING (Totem of Tutelary cast): the cast-aura ring in ring_white.tga,
			// argument 15 (green (100, 255, 100), additive), twice (CastRingSim.js).
			type: 'FUNC',
			attachedEntity: true,
			castLoop: true,
			wav: 'effect/ef_beginspell',
			func: function (Params) {
				this.add(
					new CastRing(
						Params.Init.ownerEntity.position,
						Params.Inst.startTick,
						Params.Init.duration,
						'ring_white.tga',
						[15, 15]
					),
					Params
				);
			}
		}
	],

	//912: [{}],	//EF_WALLOFTHORN	   Wall of Thorns unit (green fog cloud)
	//913: [{}],	//EF_FIREBALL5	   Magic projectiles
	//914: [{}],	//EF_THROWITEM11	   (Nothing)
	//915: [{}],	//EF_SPR_PLANT9	   Crazy Weed
	//916: [{}],	//EF_DEMONICFIRE	   Demonic Fire
	//917: [{}],	//EF_DEMONICFIRE2	   More angry, demonic flames
	//918: [{}],	//EF_DEMONICFIRE3	   Fire Insignia (demonic flames)
	//919: [{}],	//EF_HELLSPLANT	   Hell's Plant (green snapping plant)

	920: [
		{
			//EF_FIREWALL2	Fire Walk unit
			type: 'STR',
			file: 'firewall_per',
			attachedEntity: true
		}
	],

	//921: [{}],	//EF_VACUUM	   Vacuum Extreme (whirlwind)
	922: [
		{
			//EF_SPR_PLANT10	   Psychic Wave
			wav: 'effect/s\xbb\xe7\xc0\xcc\xc5\xb1\xbf\xfe\xc0\xcc\xba\xea'
		}
	],
	//923: [{}],	//EF_SPR_LIGHTPRINT2	   Poison Buster
	//924: [{}],	//EF_POISONSMOKE2	   Poisoning animation
	//925: [{}],	//EF_MAKEHALLU2	   Some filter

	926: [
		{
			//EF_SHOCKWAVE2	Electric Walk unit
			type: 'STR',
			file: 'hunter_shockwave_blue',
			attachedEntity: true
		}
	],

	//927: [{}],	//EF_SPR_PLANT11	   Earth Grave (speary roots)
	928: [
		{
			//EF_COLDTHROW2	   Ice cloud projectiles
			wav: 'effect/wl_jackfrost'
		}
	],
	929: [
		{
			//EF_DEMONICFIRE4	   Warmer (field of flames)
			wav: 'effect/s\xbf\xf6\xb8\xd3'
		}
	],

	930: [
		{
			//EF_PRESSURE3	   Varetyr Spear (falling spear)
			type: '3D',
			alphaMax: 0.6,
			attachedEntity: true,
			blendMode: 2,
			duration: 500,
			rotate: true,
			angle: 0,
			toAngle: -611,
			poszStart: 20,
			poszEnd: 5,
			size: 100,
			zIndex: 1,
			file: 'effect/cross1.bmp',
			wav: 'effect/\xc7\xc1\xb7\xb9\xbc\xc5'
		},
		{
			type: '3D',
			alphaMax: 0.6,
			attachedEntity: true,
			blendMode: 2,
			duration: 500,
			delayOffset: 501,
			fadeOut: true,
			angle: -611,
			posz: 5,
			size: 100,
			zIndex: 1,
			file: 'effect/cross1.bmp'
		}
	],

	//931: [{}],	//EF_LINKPARTICLE2	   (Nothing)
	//932: [{}],	//EF_SOULLIGHT3	   Firefly
	//933: [{}],	//EF_CHAREFFECT	   [Client Crash]

	934: [
		{
			//EF_GUMGANG6	   White, castishly expanding cone
			// Nightmare Erasion cast (official client): four rings of ring_white.tga
			// opening out round the caster for 50 ticks (CastFunnelSim.js). The effect
			// lives 300 ticks whatever the cast time, and a cancelled cast keeps it.
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				this.add(
					new CastFunnel(Params.Init.ownerEntity.position, Params.Inst.startTick, 300, 'ring_white.tga'),
					Params
				);
			}
		},
		{
			// ...and the caster drawn adding light, with a glow copy, two ticks out of four on ticks 12 to 33.
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				this.add(new CasterMarks(Params.Init.ownerEntity, Params.Inst.startTick, 300, 934), Params);
			}
		}
	],

	//935: [{}],	//EF_FIREBALL6	   Green magic projectile
	//936: [{}],	//EF_GUMGANG7	   Red, castishly expanding cone
	//937: [{}],	//EF_GUMGANG8	   Yellow, castishly expanding cone
	//938: [{}],	//EF_GUMGANG9	   Dark-red, castishly expanding cone
	//939: [{}],	//EF_BOTTOM_DE2	   Blue, conish aura
	//940: [{}],	//EF_COLDSTATUS	   Snow flake
	//941: [{}],	//EF_SPR_LIGHTPRINT3	   Explosion of red, demonic fire
	//942: [{}],	//EF_WATERBALL3	   Expanding, white dome
	//943: [{}],	//EF_HEAL_N2	   Green, fluffy projectile
	//944: [{}],	//EF_RAIN_PARTICLE2	   Falling gems
	//945: [{}],	//EF_CLOUD9	   (Nothing)
	//946: [{}],	//EF_YELLOWFLY3	   Floating lights
	//947: [{}],	//EF_EL_GUST	   Blue lightning sphere
	//948: [{}],	//EF_EL_BLAST	   Two blue lightning spheres
	//949: [{}],	//EF_EL_AQUAPLAY	   Flat, spinning diamond
	//950: [{}],	//EF_EL_UPHEAVAL	   Circling, planetlike spheres
	//951: [{}],	//EF_EL_WILD_STORM	   Three lightning spheres
	//952: [{}],	//EF_EL_CHILLY_AIR	   Flat, spinning gem and two lightning spheres
	//953: [{}],	//EF_EL_CURSED_SOIL	   Spinning, planetlike spheres
	//954: [{}],	//EF_EL_COOLER	   Two lightblue glowing spheres
	//955: [{}],	//EF_EL_TROPIC	   Three spinning flame spheres
	//956: [{}],	//EF_EL_PYROTECHNIC	   Flame
	//957: [{}],	//EF_EL_PETROLOGY	   Spinning planetlike sphere
	//958: [{}],	//EF_EL_HEATER	   Two flames

	959: [
		{
			//EF_POISON_MIST	Purple flame
			type: 'STR',
			file: 'poison_mist',
			attachedEntity: true
		}
	],

	960: [
		{
			//EF_ERASER_CUTTER	Small yellow explosion
			type: 'STR',
			file: 'eraser_cutter',
			attachedEntity: true
		}
	],

	//961: [{}],	//EF_SILENT_BREEZE	   Cartoony whirlwind
	//962: [{}],	//EF_MAGMA_FLOW	   Rising fire
	//963: [{}],	//EF_GRAYBODY	   Dark filter (like Stone Curse)

	964: [
		{
			//EF_LAVA_SLIDE	Same as 920
			type: 'STR',
			file: 'lava_slide',
			attachedEntity: true
		}
	],

	965: [
		{
			//EF_SONIC_CLAW	Small white explosion
			type: 'STR',
			file: 'sonic_claw',
			attachedEntity: true
		}
	],

	966: [
		{
			//EF_TINDER_BREAKER	Bone crack
			type: 'STR',
			file: 'tinder',
			attachedEntity: true
		}
	],

	967: [
		{
			//EF_MIDNIGHT_FRENZY	Another little explosion
			type: 'STR',
			file: 'mid_frenzy',
			attachedEntity: true
		}
	],

	975: [
		{
			//EF_VOLCANIC_ASH
			type: 'STR',
			file: 'vash00',
			attachedEntity: true
		}
	],

	986: [
		{
			//EF_ROTATE_LINE_GRAY	   Gray ribbons spiralling around the caster (Huuma / Kunai cast)
			// The official client's CRotateLineEffect: four cloud11.tga ribbons for the cast time (RotateLineSim.js).
			type: 'FUNC',
			attachedEntity: true,
			castLoop: true,
			func: function (Params) {
				this.add(
					new RotateLine(Params.Init.ownerEntity.position, Params.Inst.startTick, Params.Init.duration, 986),
					Params
				);
			}
		}
	],

	987: [
		{
			//EF_2011RWC
			type: 'STR',
			file: 'rwc2011',
			attachedEntity: true
		}
	],

	988: [
		{
			//EF_2011RWC2
			type: 'STR',
			file: 'rwc2011_2',
			attachedEntity: true
		}
	]
};
