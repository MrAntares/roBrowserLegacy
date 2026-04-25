/*
 * Race Rules (Final)
 *
 * 종족 탭 전용
 * Race tab only
 *
 * 포함:
 * - 종족 대상 물리 데미지
 * - 종족 대상 마법 데미지
 * - 종족에게 받는 데미지 감소
 * - 종족 물리 방어 무시
 * - 종족 마법 방어 무시
 *
 * Includes:
 * - Physical damage to race
 * - Magical damage to race
 * - Damage reduction from race
 * - Ignore physical DEF by race
 * - Ignore magical MDEF by race
 */

import Condition from '../EquipAbilityCondition.js';
import { addStat } from '../EquipAbilityParser.js';

const RACE_KO = {
	RC_Formless: '무형',
	RC_Undead: '불사형',
	RC_Brute: '동물형',
	RC_Plant: '식물형',
	RC_Insect: '곤충형',
	RC_Fish: '어패형',
	RC_Demon: '악마형',
	RC_DemiHuman: '인간형',
	RC_Player_Human: '플레이어 인간형',
	RC_Player_Doram: '플레이어 도람형',
	RC_Angel: '천사형',
	RC_Dragon: '용족',
	RC_All: '모든 종족'
};

const RACE_MAP = [
	{ key: 'RC_Formless', patterns: ['무형'] },
	{ key: 'RC_Undead', patterns: ['불사형'] },
	{ key: 'RC_Brute', patterns: ['동물형'] },
	{ key: 'RC_Plant', patterns: ['식물형'] },
	{ key: 'RC_Insect', patterns: ['곤충형'] },
	{ key: 'RC_Fish', patterns: ['어패형', '어류형'] },
	{ key: 'RC_Demon', patterns: ['악마형'] },
	{ key: 'RC_DemiHuman', patterns: ['인간형'] },
	{ key: 'RC_Player_Human', patterns: ['플레이어 인간형'] },
	{ key: 'RC_Player_Doram', patterns: ['플레이어 도람형'] },
	{ key: 'RC_Angel', patterns: ['천사형'] },
	{ key: 'RC_Dragon', patterns: ['용족', '용형'] },
	{ key: 'RC_All', patterns: ['모든 종족'] }
];

const RaceRules = [
	{
		pattern: /(무형|불사형|동물형|식물형|곤충형|어패형|어류형|악마형|인간형|천사형|용족|용형|모든 종족|종족)/i,

		apply(ctx, m, cond) {
			const line = m.input;

			if (line.includes('속성') || line.includes('스킬')) return false;

			const races = extractRaces(line);
			if (!races.length) return false;

			const value = extractValue(line);
			if (value === null) return false;

			const modes = detectModes(line);
			if (!modes.length) return false;

			let appliedAny = false;

			races.forEach(rc => {
				modes.forEach(mode => {
					let finalValue = value;

					if (mode.mode === 'res') {
						finalValue = -Math.abs(finalValue);
					}

					finalValue = Condition.apply(ctx, cond, finalValue);
					if (!finalValue) return;

					addStat(
						ctx,
						'race_' + rc + getSuffix(mode),
						buildLabel(rc, mode),
						finalValue,
						'%',
						'race'
					);

					appliedAny = true;
				});
			});

			return appliedAny;
		}
	}
];

function extractRaces(line) {
	const result = [];

	RACE_MAP.forEach(entry => {
		entry.patterns.forEach(pattern => {
			if (line.includes(pattern)) {
				result.push(entry.key);
			}
		});
	});

	return unique(result);
}

function extractValue(line) {
	const m = line.match(/([+\-]?\d+(?:\.\d+)?)\s*%?/);
	return m ? Number(m[1]) : null;
}

function detectModes(line) {
	const modes = [];

	// 마법 방어 무시
	// Ignore magical defense
	if (/마법\s*방어(?:력)?\s*\d*%?\s*무시|마법\s*방어(?:력)?\s*무시/.test(line)) {
		modes.push({ type: 'magic', mode: 'ignore_mdef' });
		return modes;
	}

	// 물리 방어 무시 / 방어 무시
	// Ignore physical defense
	if (/물리\s*방어(?:력)?\s*\d*%?\s*무시|방어(?:력)?\s*\d*%?\s*무시|방어(?:력)?\s*무시/.test(line)) {
		modes.push({ type: 'phys', mode: 'ignore_def' });
		return modes;
	}

	// 받는 데미지 감소
	// Damage reduction from race
	if (/받는|감소/.test(line) && !/주는/.test(line)) {
		modes.push({ type: 'phys', mode: 'res' });
		return modes;
	}

	// 물리, 마법 동시
	// Physical and magical damage
	if (/물리\s*,\s*마법|물리\s*\/\s*마법|물리\s*및\s*마법/.test(line)) {
		modes.push({ type: 'phys', mode: 'damage' });
		modes.push({ type: 'magic', mode: 'damage' });
		return modes;
	}

	if (/마법/.test(line)) {
		modes.push({ type: 'magic', mode: 'damage' });
		return modes;
	}

	modes.push({ type: 'phys', mode: 'damage' });
	return modes;
}

function getSuffix(mode) {
	if (mode.mode === 'ignore_def') return '_ignore_def';
	if (mode.mode === 'ignore_mdef') return '_ignore_mdef';
	if (mode.mode === 'res') return '_res';
	if (mode.type === 'magic') return '_magic_damage';
	return '_phys_damage';
}

function buildLabel(rc, mode) {
	const name = RACE_KO[rc] || rc;

	if (mode.mode === 'ignore_def') {
		return name + ' 몬스터의 물리 방어력 무시';
	}

	if (mode.mode === 'ignore_mdef') {
		return name + ' 몬스터의 마법 방어력 무시';
	}

	if (mode.mode === 'res') {
		return name + ' 몬스터에게 받는 데미지 감소';
	}

	if (mode.type === 'magic') {
		return name + ' 몬스터에게 주는 마법 데미지 증가';
	}

	return name + ' 몬스터에게 주는 물리 데미지 증가';
}

function unique(arr) {
	const seen = {};
	const out = [];

	arr.forEach(v => {
		if (!v || seen[v]) return;
		seen[v] = true;
		out.push(v);
	});

	return out;
}

export default RaceRules;