/**
 * DB/Skills/CastAuraRule.js
 *
 * Which skills the official client gives an element cast aura. Its cast-aura
 * picker answers "none" for every skill id in 5401-5507 (4th jobs: Night Watch
 * to Spirit Handler) and 6001-6006 (DK_DRAGONIC_BREATH to BO_MAYHEMIC_THORNS)
 * that has no skilleffectinfo row, and data.grf has no row for any of them.
 * Whatever such a skill shows while casting comes from its own cast slot, which
 * roBrowser keeps in SkillEffect (castAuraEffectId, beginCastEffectId).
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

/** Skill id ranges, inclusive, with no element cast aura. */
export const NO_ELEMENT_AURA_RANGES = [
	[5401, 5507],
	[6001, 6006]
];

/**
 * Does the client play the element cast aura for this skill?
 *
 * @param {number} skillId
 * @return {boolean}
 */
export function hasElementCastAura(skillId) {
	return !NO_ELEMENT_AURA_RANGES.some(([first, last]) => skillId >= first && skillId <= last);
}
