import SKID from 'DB/Skills/SkillConst.js';
import SkillUnit, { SkillUnitEnd } from 'DB/Skills/SkillUnit.js';
import StatusEffectTable from 'DB/Status/StatusEffectTable.js';

/**
 * Mapping of effect name suffixes to SkillEffect field names.
 * Default is 'effectId'.
 */
const SUFFIX_TO_FIELD = {
	hit: 'hitEffectId',
	hitsub: 'hitEffectId',
	target: 'hitEffectId',
	cast: 'effectId',
	cast_bottom: 'effectId',
	single: 'effectId',
	bottom: 'effectId',
	begin: 'effectId',
	start: 'effectId',
	end: 'effectId',
	loop: 'effectId',
	buff: 'effectId',
	aura: 'effectId',
	main: 'effectId',
	sync: 'effectId'
};

/**
 * Hardcoded mapping for specific effect names that override suffix logic.
 */
const HARDCODED_FIELD_MAPPING = {
	broken_limit_buff: 'effectId',
	abyss_flame_target: 'hitEffectId'
};

/**
 * The last two parts of an STR path, lower case: its file and own folder.
 * A skill's top and floor layers can share a file name in different folders
 * (hasty_fire_in_the_hole/..._7x7 and hasty_fire_in_the_hole_bottom/..._7x7),
 * so the folder stays part of it.
 *
 * @param {string} file STR path without extension
 * @return {string}
 */
function strFileKey(file) {
	return (file || '').toLowerCase().split('/').slice(-2).join('/');
}

/**
 * Words that name one variant of an effect: a stage (_00, _1), a size
 * (_5x5), an element (_earth) or a direction (_leftdown). A stage number on
 * the end of a word (hit2) is taken off too.
 */
const EZ2_VARIANT_WORD =
	/^(\d+|\d+x\d+|earth|fire|water|wind|ice|saint|holy|dark|darkness|poison|ghost|undead|neutral|reset|leftdown|rightdown|leftup|rightup)$/;

/**
 * strFileKey with the variant words taken out, so the variants of one
 * effect (four_charm_earth, four_charm_fire, four_charm_ice) share a key.
 *
 * @param {string} file STR path without extension
 * @return {string}
 */
function strVariantKey(file) {
	return strFileKey(file)
		.split('/')
		.map(part =>
			part
				.split('_')
				.filter(word => !EZ2_VARIANT_WORD.test(word))
				.map(word => word.replace(/([a-z])\d+$/, '$1'))
				.join('_')
		)
		.join('/');
}

/**
 * Whether a skill's effects already draw this STR file.
 * Ignores the leading folders: older hand-written rows load the same STR
 * from its pre-4th-job folder (roseblossom/roseblossom_cast/... instead of
 * troubadour_trouvere/tr_roseblossom/roseblossom_cast/...), and the skill
 * would draw both.
 *
 * @param {object} skillEntry SkillEffect row, or undefined
 * @param {object} EffectTable
 * @param {string} file STR path without extension
 * @param {function} [keyOf] what counts as the same file, strFileKey by default
 * @return {boolean}
 */
function skillPlaysFile(skillEntry, EffectTable, file, keyOf = strFileKey) {
	if (!skillEntry || !file) {
		return false;
	}
	const wanted = keyOf(file);
	for (const field in skillEntry) {
		const value = skillEntry[field];
		// A field can hold one name, a list of names, or a map of variants
		const names = [value]
			.flat(Infinity)
			.flatMap(name => (name && typeof name === 'object' ? Object.values(name) : [name]))
			.flat(Infinity);
		for (const name of names) {
			// Rows are named by string or by numeric effect id; only STR rows play a file
			const effects = typeof name === 'string' || typeof name === 'number' ? EffectTable[name] : null;
			if (
				Array.isArray(effects) &&
				effects.some(effect => effect && effect.type === 'STR' && keyOf(effect.file) === wanted)
			) {
				return true;
			}
		}
	}
	return false;
}

/**
 * Whether a status in StatusEffectTable draws this STR file.
 *
 * @param {object} EffectTable
 * @param {string} file STR path without extension
 * @return {boolean}
 */
function statusPlaysFile(EffectTable, file) {
	return Object.values(StatusEffectTable).some(row => skillPlaysFile(row, EffectTable, file));
}

/**
 * Whether a skill unit in SkillUnit.js draws this STR file (its start, loop or end rows).
 *
 * @param {object} EffectTable
 * @param {string} file STR path without extension
 * @return {boolean}
 */
function unitPlaysFile(EffectTable, file) {
	return [SkillUnit, SkillUnitEnd].some(table => skillPlaysFile(table, EffectTable, file));
}

/**
 * Merge Ez2STREffect from BSON into EffectTable and SkillEffect
 */
export default function mergeEz2Effects(EffectTable, SkillEffect, Ez2streffect) {
	let count = 0;
	let skillCount = 0;
	const skillBaseToId = {};
	const effectNameToId = {};
	const effectMetadata = {};

	// Pre-calculate SKID lookup maps for O(1) matching
	const skidFuzzy = {};
	for (const key in SKID) {
		const upperKey = key.toUpperCase();
		const val = SKID[key];
		skidFuzzy[upperKey] = val;

		let lastUnderscore = -1;
		while ((lastUnderscore = upperKey.indexOf('_', lastUnderscore + 1)) !== -1) {
			const suffix = upperKey.substring(lastUnderscore + 1);
			if (suffix && !skidFuzzy[suffix]) {
				skidFuzzy[suffix] = val;
			}
		}
	}

	// Optimized helper to find skill by name
	function findFuzzySkillId(name) {
		return skidFuzzy[name.toUpperCase()] || null;
	}

	// Phase 1: Pre-Analysis and Anchoring
	for (const effectName in Ez2streffect) {
		const entry = Ez2streffect[effectName];
		let baseName = effectName;
		let isSuffixed = false;

		let targetField = entry.IsToGround || entry.IsFloor ? 'groundEffectId' : 'effectId';

		for (const suffix in SUFFIX_TO_FIELD) {
			if (effectName.endsWith('_' + suffix)) {
				baseName = effectName.slice(0, -(suffix.length + 1));
				isSuffixed = true;
				targetField = SUFFIX_TO_FIELD[suffix];
				break;
			}
		}

		if (HARDCODED_FIELD_MAPPING[effectName]) {
			targetField = HARDCODED_FIELD_MAPPING[effectName];
		}

		const filePath = entry.FilePath || '';
		const soundPath = entry.SoundPath || '';
		const pathParts = filePath ? filePath.split('\\') : [];
		const lastSlashSound = soundPath.lastIndexOf('\\');
		const soundFile = lastSlashSound !== -1 ? soundPath.substring(lastSlashSound + 1) : soundPath;
		const soundBase = soundFile.replace(/\.wav$/i, '');

		effectMetadata[effectName] = {
			baseName: baseName,
			isSuffixed: isSuffixed,
			pathParts: pathParts,
			soundBase: soundBase,
			field: targetField
		};

		// Pass 1: Exact Name Match for Base
		const skillId1 = findFuzzySkillId(baseName);
		if (skillId1) {
			effectNameToId[effectName] = skillId1;
			continue;
		}

		// Pass 2: Base Anchoring from Path (Non-suffixed only)
		if (!isSuffixed) {
			for (let i = 0, len = pathParts.length; i < len; i++) {
				const segment = pathParts[i];
				if (segment) {
					const skillId2 = skillBaseToId[segment] || findFuzzySkillId(segment);
					if (skillId2) {
						skillBaseToId[segment] = skillId2;
						effectNameToId[effectName] = skillId2;
						break;
					}
				}
			}
		}
	}

	// A skill's siblings: the skills named like it plus a suffix (KR_THUNDERING_CALL_S
	// for KR_THUNDERING_CALL). The bson files a sibling's variant under the base
	// skill's folder (thundering_call_y_3x3 sits in KR_THUNDERING_CALL), so it
	// would land on the base skill too.
	// Built once: skill id -> the ids of its siblings. Their rows are read when
	// asked, so a row an earlier EZ2 record gave a sibling counts too.
	const siblingIds = {};
	const skidNames = Object.keys(SKID).sort();
	for (let i = 0; i < skidNames.length; i++) {
		const prefix = skidNames[i] + '_';
		// Sorted, so every name starting with prefix follows this one
		for (let j = i + 1; j < skidNames.length && skidNames[j].startsWith(skidNames[i]); j++) {
			const other = SKID[skidNames[j]];
			if (skidNames[j].startsWith(prefix) && other !== SKID[skidNames[i]]) {
				(siblingIds[SKID[skidNames[i]]] || (siblingIds[SKID[skidNames[i]]] = [])).push(other);
			}
		}
	}
	function siblingPlaysFile(skillId, file) {
		const siblings = siblingIds[skillId];
		return !!siblings && siblings.some(id => skillPlaysFile(SkillEffect[id], EffectTable, file));
	}

	// Phase 2: Inheritance and Assignments
	for (const effectName in Ez2streffect) {
		const entry = Ez2streffect[effectName];
		const meta = effectMetadata[effectName];
		let skillId = effectNameToId[effectName];

		// Pass 3: Path Fallback for unmapped
		if (!skillId) {
			for (let i = 0; i < meta.pathParts.length; i++) {
				const segment = meta.pathParts[i] || '';
				if (segment) {
					skillId = skillBaseToId[segment] || findFuzzySkillId(segment);
					if (skillId) {
						break;
					}
				}
			}
		}

		// Pass 4: Sound Fallback
		if (!skillId && meta.soundBase) {
			skillId = findFuzzySkillId(meta.soundBase);
		}

		if (skillId) {
			effectNameToId[effectName] = skillId;
		}

		// Pass 5: Suffix Inheritance
		// Run this after all anchoring passes to ensure variants inherit from anchored bases
		if (!skillId && meta.isSuffixed && effectNameToId[meta.baseName]) {
			skillId = effectNameToId[meta.baseName];
			effectNameToId[effectName] = skillId;
		}

		// Pass 5: EffectTable Assignment
		const lastSlash = (entry.FilePath || '').lastIndexOf('\\');
		const texturePath = lastSlash !== -1 ? entry.FilePath.substring(0, lastSlash + 1) : '';

		EffectTable[effectName] = [
			{
				type: 'STR',
				file: (entry.FilePath || '').replace(/\\/g, '/').replace(/\.str$/i, ''),
				texturePath: texturePath,
				// Floor effects (the *_bottom rings) go under the characters
				renderBeforeEntities: !!entry.IsFloor,
				xOffset: entry.PosX || 0,
				yOffset: entry.PosY || 0,
				wav: entry.SoundPath ? entry.SoundPath.replace(/\\/g, '/').replace(/\.wav$/i, '') : null,
				delayLate: entry.StartDelayTime || 0,
				repeat: !!entry.IsInfinite,
				attachedEntity: true
			}
		];
		count++;

		// Pass 6: SkillEffect Mapping with differentiated fields
		// Not added when:
		// - the skill already plays this file from a hand-written entry, which
		//   would draw it twice;
		// - it is endless (IsInfinite): that is a status's or a unit's loop, and
		//   played from a skill's cast nothing would ever stop it;
		// - the skill already has another variant of it: the official client
		//   picks one by stage, element or direction, and all at once is a pile;
		// - a sibling skill already draws it;
		// - a status (StatusEffectTable.js) or a skill unit (SkillUnit.js) draws it.
		const file = EffectTable[effectName][0].file;
		if (
			skillId &&
			!entry.IsInfinite &&
			!skillPlaysFile(SkillEffect[skillId], EffectTable, file, strVariantKey) &&
			!siblingPlaysFile(skillId, file) &&
			!statusPlaysFile(EffectTable, file) &&
			!unitPlaysFile(EffectTable, file)
		) {
			const skillEntry = SkillEffect[skillId] || (SkillEffect[skillId] = {});
			const field = meta.field;

			if (skillEntry[field]) {
				if (!Array.isArray(skillEntry[field])) {
					skillEntry[field] = [skillEntry[field]];
				}
				if (skillEntry[field].indexOf(effectName) === -1) {
					skillEntry[field].push(effectName);
				}
			} else {
				skillEntry[field] = effectName;
			}
			skillCount++;
		}
	}

	console.log(`[DBManager] Loaded ${count} effects and mapped ${skillCount} skills.`);
}
