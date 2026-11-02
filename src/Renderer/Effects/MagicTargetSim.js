/**
 * Renderer/Effects/MagicTargetSim.js
 *
 * Size and motion of the official client's ground cast circle (magic_target.tga),
 * the rotating square drawn on the target cell while a ground skill is cast.
 * No WebGL here, so it can be tested on its own.
 *
 * As the 2025 kRO client draws it:
 *
 *  - The square is N x N cells, N = area + 2, where "area" is a number the
 *    client keeps per skill. The skill level plays no part, so every caster's
 *    circle has the same size: yours, other players' and monsters'.
 *  - A skill the client does not list has area 0: a 2 x 2 square centred on
 *    the target cell's lower-left corner. Area -2 (N = 0) draws nothing.
 *  - The texture turns inside the fixed square by 0.5 / N radians a tick, so a
 *    bigger circle turns slower.
 *  - Its alpha is 128 + int(40 sin(angle)) out of 255, pulsing with the spin.
 *
 * Units are the client's: cells, ticks (60 a second), radians.
 */

import SkillId from 'DB/Skills/SkillConst.js';
import { PRIM_TICK_MS } from './EffectPrimSim.js';

export { PRIM_TICK_MS as TARGET_TICK_MS };

/**
 * Area by skill. Skills not listed have area 0.
 */
export const CAST_AREA = {};

const AREAS = {
	3: [
		'MG_NAPALMBEAT',
		'AL_PNEUMA',
		'AC_SHOWER',
		'PR_BENEDICTIO',
		'WZ_FIREPILLAR',
		'WZ_WATERBALL',
		'WZ_FROSTNOVA',
		'BS_HAMMERFALL',
		'HT_BLITZBEAT',
		'HT_DETECTING',
		'AS_GRIMTOOTH',
		'AS_VENOMDUST',
		'SN_FALCONASSAULT',
		'HW_GANBANTEIN',
		'NC_ARMSCANNON',
		'NW_BASIC_GRENADE',
		'NW_GRENADES_DROPPING'
	],
	5: [
		'MG_FIREBALL',
		'MG_THUNDERSTORM',
		'PR_SANCTUARY',
		'WZ_HEAVENDRIVE',
		'WZ_QUAGMIRE',
		'HW_GRAVITATION',
		'NPC_GROUNDDRIVE',
		'RK_WINDCUTTER',
		'GC_POISONSMOKE',
		'AB_EPICLESIS',
		'NW_WILD_FIRE',
		'NW_HASTY_FIRE_IN_THE_HOLE'
	],
	7: [
		'PR_MAGNUS',
		'CR_SLIMPITCHER',
		'NPC_MAGMA_ERUPTION',
		'NPC_CLOUD_KILL',
		'RA_DETONATOR',
		'SO_CLOUD_KILL',
		'SO_WARMER',
		'SO_VACUUM_EXTREME',
		'SO_VARETYR_SPEAR',
		'NC_MAGMA_ERUPTION',
		'LG_KINGS_GRACE',
		'SU_CN_METEOR',
		'SU_CN_METEOR2',
		'AG_TORNADO_STORM',
		'AG_FLORAL_FLARE_ROAD',
		'AG_ASTRAL_STRIKE',
		'CD_PNEUMATICUS_PROCELLA',
		'SOA_TOTEM_OF_TUTELARY',
		'HN_METEOR_STORM_BUSTER',
		'NW_MIDNIGHT_FALLEN'
	],
	9: [
		'WZ_METEOR',
		'WZ_STORMGUST',
		'NPC_STORMGUST2',
		'NPC_DRAGONBREATH',
		'NPC_RAINOFMETEOR',
		'RK_DRAGONBREATH',
		'NC_COLDSLOWER',
		'SO_EARTHGRAVE',
		'RK_DRAGONBREATH_WATER',
		'AG_VIOLENT_QUAKE',
		'AG_ALL_BLOOM',
		'IG_CROSS_RAIN',
		'ABC_ABYSS_STRIKE',
		'EM_DIAMOND_STORM',
		'EM_LIGHTNING_LAND',
		'EM_VENOM_SWAMP',
		'EM_CONFLAGRATION',
		'EM_TERRA_DRIVE',
		'NW_MISSION_BOMBARD',
		'SOA_TALISMAN_OF_BLACK_TORTOISE',
		'SH_HYUN_ROKS_BREEZE'
	],
	11: ['WZ_VERMILION', 'AG_MYSTERY_ILLUSION'],
	18: ['NPC_COMET', 'WL_COMET'],
	19: ['CD_COMPETENTIA'],
	'-2': ['NPC_PSYCHIC_WAVE', 'SO_DIAMONDDUST', 'SO_PSYCHIC_WAVE', 'HN_JACK_FROST_NOVA']
};

for (const [area, names] of Object.entries(AREAS)) {
	for (const name of names) {
		if (name in SkillId) {
			CAST_AREA[SkillId[name]] = Number(area);
		}
	}
}

/**
 * Cells across the square for a skill; 0 means no circle.
 *
 * @param {number} skillId
 * @return {number}
 */
export function castSize(skillId) {
	const area = skillId in CAST_AREA ? CAST_AREA[skillId] : 0;
	return Math.max(0, area + 2);
}

/**
 * Texture angle on tick `t` (0 on the first) of a square `size` cells across.
 *
 * @param {number} t
 * @param {number} size
 * @return {number} radians
 */
export function spinAngle(t, size) {
	return (0.5 / size) * t;
}

/**
 * Alpha (0-255) at texture angle `angle`.
 *
 * @param {number} angle radians
 * @return {number}
 */
export function targetAlpha(angle) {
	return 128 + Math.trunc(40 * Math.sin(angle));
}
