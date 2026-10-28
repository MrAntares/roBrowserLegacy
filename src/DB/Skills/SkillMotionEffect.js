/**
 * DB/Skills/SkillMotionEffect.js
 *
 * The caster's "motion effect": the official client (kRO 2025-07-16) launches
 * one effect on the caster as each skill damage packet arrives. Every skill
 * has one: 16 (EF_BASH) unless a fixed table says otherwise (12 EF_BEGINSPELL
 * for most magic, -1 for none). It is not the skill's own caster effect
 * (SkillEffect damageEffectIdOnCaster); a skill can have both.
 *
 * The client plays it only when:
 *  - the packet's damage type is 4, 5, 6, 8, 9, 13 or 14;
 *  - it is not a splash packet (5 or 14) that hit an actor, unless the skill
 *    treats splash packets as normal ones (SPLASH_AS_NORMAL);
 *  - the skill is not in NO_MOTION_EFFECT_RANGES;
 *  - the packet's level is not -2.
 *
 * Skills whose value comes from data roBrowser does not read (skilleffectinfo
 * rows, registered skill objects) are left out (UNKNOWN_RANGES).
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

/** Effect played when the table does not list the skill. */
export const DEFAULT_MOTION_EFFECT = 16;

/** Damage types (ZC_NOTIFY_SKILL action field) that play the motion effect. */
export const MOTION_DAMAGE_TYPES = [4, 5, 6, 8, 9, 13, 14];

/** Splash damage types: they stop before the motion effect once the target is found. */
export const SPLASH_DAMAGE_TYPES = [5, 14];

/** Skills whose splash packets go on as normal ones. */
export const SPLASH_AS_NORMAL = [
	11, 47, 273, 413, 732, 2258, 2284, 2307, 2317, 2328, 2329, 2332, 2337, 2476, 2519, 2576, 3006, 3007, 5026, 5046,
	5230, 5235, 5243, 5244, 5245, 5248, 5252, 5283, 5284, 5316
];

/** Skills whose splash packets stop even when the target is not found: skill id -> damage types. */
export const SPLASH_STOP_WITHOUT_TARGET = { 739: [5, 14], 2450: [5, 14], 2477: [5], 5030: [5] };

/** Skill id ranges, inclusive, that never launch the motion effect (bolts and a few others). */
export const NO_MOTION_EFFECT_RANGES = [
	[11, 21],
	[27, 27],
	[29, 30],
	[32, 33],
	[77, 77],
	[86, 86],
	[340, 340],
	[690, 690],
	[731, 731],
	[2008, 2008],
	[2533, 2534],
	[2536, 2536],
	[5004, 5004]
];

/** Skill id ranges, inclusive, whose motion effect roBrowser does not know. */
export const UNKNOWN_RANGES = [
	[275, 275],
	[292, 293],
	[722, 722],
	[751, 751],
	[754, 755],
	[786, 791],
	[793, 793],
	[1014, 1014],
	[1172, 1175],
	[1178, 1178],
	[1192, 1193],
	[1202, 1204],
	[1217, 1217],
	[1220, 1222],
	[1226, 1226],
	[1252, 1252],
	[1256, 1257],
	[1259, 1260],
	[1262, 1263],
	[1345, 1346],
	[1354, 1354],
	[1360, 1368],
	[1377, 1377],
	[1383, 1393],
	[1395, 1395],
	[1420, 1424],
	[1453, 1456],
	[1559, 1559],
	[1665, 1665],
	[2552, 2552],
	[2554, 2558],
	[2560, 2562],
	[2564, 2564],
	[2566, 2570],
	[2574, 2574],
	[2576, 2577],
	[2579, 2579],
	[2582, 2582],
	[2586, 2586],
	[2588, 2588],
	[2590, 2590],
	[2592, 2592],
	[2594, 2594],
	[2600, 2600],
	[2602, 2603],
	[2606, 2607],
	[2609, 2610],
	[3004, 3009],
	[3011, 3011],
	[3013, 3027],
	[3029, 3029],
	[3031, 3034],
	[5002, 5002],
	[5050, 5051],
	[5053, 5053],
	[5202, 5206],
	[5208, 5209],
	[5211, 5213],
	[5255, 5257],
	[5260, 5267],
	[5285, 5286],
	[5291, 5293],
	[5328, 5328],
	[5330, 5330],
	[5334, 5334],
	[5351, 5356],
	[5358, 5360],
	[5362, 5362],
	[5364, 5364],
	[5403, 5507],
	[6001, 6006],
	[6502, 6522]
];

/** Skill id ranges, inclusive, whose motion effect is none (-1 in the client's table). */
export const NONE_RANGES = [
	[28, 29],
	[34, 34],
	[47, 47],
	[51, 51],
	[55, 56],
	[58, 64],
	[93, 114],
	[126, 141],
	[149, 149],
	[151, 153],
	[156, 192],
	[196, 196],
	[209, 209],
	[212, 212],
	[214, 214],
	[219, 219],
	[229, 232],
	[234, 237],
	[243, 244],
	[247, 247],
	[249, 253],
	[257, 258],
	[263, 264],
	[266, 268],
	[271, 273],
	[304, 304],
	[306, 313],
	[316, 317],
	[319, 322],
	[324, 325],
	[327, 330],
	[334, 335],
	[337, 338],
	[344, 346],
	[349, 350],
	[356, 356],
	[364, 365],
	[367, 368],
	[370, 375],
	[379, 384],
	[387, 387],
	[389, 389],
	[394, 399],
	[402, 403],
	[406, 406],
	[408, 408],
	[411, 421],
	[425, 434],
	[444, 465],
	[467, 472],
	[478, 480],
	[484, 490],
	[493, 495],
	[500, 506],
	[508, 508],
	[512, 521],
	[523, 532],
	[534, 544],
	[572, 575],
	[654, 654],
	[661, 661],
	[663, 663],
	[666, 668],
	[674, 676],
	[678, 678],
	[689, 690],
	[712, 712],
	[720, 721],
	[724, 724],
	[728, 728],
	[731, 732],
	[735, 742],
	[744, 745],
	[757, 760],
	[762, 762],
	[780, 780],
	[783, 783],
	[1001, 1001],
	[1004, 1005],
	[1011, 1011],
	[1013, 1013],
	[1016, 1016],
	[2001, 2002],
	[2004, 2006],
	[2008, 2009],
	[2012, 2015],
	[2017, 2023],
	[2030, 2031],
	[2033, 2033],
	[2036, 2038],
	[2040, 2040],
	[2051, 2051],
	[2055, 2056],
	[2202, 2204],
	[2211, 2212],
	[2214, 2215],
	[2217, 2221],
	[2230, 2231],
	[2233, 2233],
	[2236, 2237],
	[2240, 2244],
	[2246, 2246],
	[2256, 2256],
	[2258, 2261],
	[2271, 2272],
	[2280, 2280],
	[2284, 2304],
	[2307, 2330],
	[2332, 2333],
	[2335, 2338],
	[2340, 2348],
	[2350, 2352],
	[2381, 2383],
	[2413, 2420],
	[2422, 2422],
	[2426, 2426],
	[2429, 2429],
	[2443, 2444],
	[2446, 2460],
	[2476, 2486],
	[2490, 2490],
	[2492, 2493],
	[2516, 2516],
	[2518, 2519],
	[2576, 2576],
	[2580, 2581],
	[2584, 2584],
	[2592, 2593],
	[2596, 2599],
	[2602, 2602],
	[2604, 2604],
	[3006, 3008],
	[5004, 5004],
	[5021, 5021],
	[5023, 5023],
	[5030, 5030],
	[5036, 5036],
	[5043, 5043],
	[5063, 5065],
	[5078, 5078],
	[5205, 5205],
	[5210, 5210],
	[5214, 5214],
	[5219, 5220],
	[5223, 5224],
	[5226, 5226],
	[5230, 5231],
	[5233, 5237],
	[5243, 5245],
	[5248, 5253],
	[5265, 5265],
	[5273, 5274],
	[5277, 5277],
	[5283, 5284],
	[5287, 5287],
	[5289, 5290],
	[5294, 5296],
	[5314, 5316],
	[5320, 5320],
	[5322, 5322],
	[5326, 5326],
	[5329, 5330],
	[5336, 5336],
	[5338, 5348],
	[5356, 5357],
	[5369, 5369],
	[5373, 5373],
	[5380, 5380],
	[5382, 5382],
	[5389, 5393],
	[5401, 5507],
	[6001, 6006],
	[8009, 8009],
	[8012, 8012],
	[8204, 8204],
	[8219, 8220],
	[8401, 8401],
	[8425, 8426],
	[8428, 8428],
	[8430, 8431],
	[8433, 8435],
	[8442, 8457],
	[8601, 8605]
];

/** Motion effects other than the default: effect id -> skill id ranges, inclusive. */
export const MOTION_EFFECT_RANGES = {
	12: [
		[9, 27],
		[30, 33],
		[35, 35],
		[54, 54],
		[65, 92],
		[340, 342],
		[400, 400],
		[483, 483],
		[669, 669],
		[694, 694],
		[723, 723],
		[769, 770],
		[1006, 1006],
		[2278, 2279],
		[2533, 2534],
		[2536, 2537],
		[8222, 8222]
	],
	43: [[45, 45]],
	49: [[719, 719]],
	56: [[8410, 8410]],
	58: [[2275, 2275]],
	144: [[57, 57]],
	441: [
		[2034, 2034],
		[2257, 2257],
		[2262, 2265],
		[2267, 2269],
		[2273, 2274],
		[2445, 2445],
		[8404, 8404],
		[8406, 8406]
	],
	454: [[347, 347]],
	548: [
		[2270, 2270],
		[2520, 2520]
	],
	768: [
		[2027, 2027],
		[2029, 2029]
	],
	771: [[2032, 2032]],
	911: [
		[2494, 2497],
		[8407, 8407],
		[8409, 8409]
	]
};

const inRanges = (ranges, id) => ranges.some(([first, last]) => id >= first && id <= last);

/**
 * The skill's motion effect, or null when it has none (or roBrowser does not know it).
 *
 * @param {number} skillId
 * @return {?number}
 */
export function getMotionEffect(skillId) {
	if (!(skillId > 0) || inRanges(UNKNOWN_RANGES, skillId) || inRanges(NONE_RANGES, skillId)) {
		return null;
	}
	for (const [effectId, ranges] of Object.entries(MOTION_EFFECT_RANGES)) {
		if (inRanges(ranges, skillId)) {
			return Number(effectId);
		}
	}
	return DEFAULT_MOTION_EFFECT;
}

/**
 * The motion effect this damage packet launches on the caster, or null.
 *
 * @param {number} skillId
 * @param {number} damageType the packet's action field
 * @param {number} level the packet's level field
 * @param {boolean} targetFound is the packet's target a known actor
 * @return {?number}
 */
export function motionEffectForPacket(skillId, damageType, level, targetFound) {
	if (!MOTION_DAMAGE_TYPES.includes(damageType)) {
		return null;
	}
	if (SPLASH_DAMAGE_TYPES.includes(damageType)) {
		if (targetFound && !SPLASH_AS_NORMAL.includes(skillId)) {
			return null;
		}
		const stops = SPLASH_STOP_WITHOUT_TARGET[skillId];
		if (!targetFound && stops && stops.includes(damageType)) {
			return null;
		}
	}
	if (level === -2 || inRanges(NO_MOTION_EFFECT_RANGES, skillId)) {
		return null;
	}
	return getMotionEffect(skillId);
}
