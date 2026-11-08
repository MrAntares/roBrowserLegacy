import SkillInfo from './SkillInfo.js';
import SKID from './SkillConst.js';

export let SkillDescription = {};

export function setSkillDescription(value) {
	SkillDescription = value;
}

export function setLegacySkillDescription(id, value) {
	SkillDescription[id] = value;
}

export function parseLegacySkillDescription(_index, key, value) {
	setLegacySkillDescription(SKID[key], value.replace('\r\n', '\n'));
}

export function getSkillName(id) {
	return (SkillInfo[id] && SkillInfo[id].SkillName) || '';
}

export function getSkillDescription(id) {
	return SkillDescription[id] || '...';
}

export function mergeSkillIds(json) {
	if (!json || typeof json !== 'object') return;
	for (const k in json) {
		if (Object.prototype.hasOwnProperty.call(json, k)) {
			const value = json[k];
			if (typeof value === 'number' && value > 0) SKID[k] = value;
		}
	}
}
