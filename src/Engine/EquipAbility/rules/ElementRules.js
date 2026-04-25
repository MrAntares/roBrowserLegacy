/*
 * Element Rules (Final Safe)
 *
 * 속성 탭 전용
 * Element tab only
 *
 * 포함:
 * - 속성 몬스터에게 주는 물리 데미지 증가
 * - 속성 몬스터에게 주는 마법 데미지 증가
 * - 속성 몬스터에게 받는 데미지 감소
 * - 속성 내성 / 저항 증가
 * - 속성 몬스터의 방어 / 방어력 무시
 * - 속성 몬스터의 마법 방어 / 마법 방어력 무시
 *
 * Includes:
 * - Physical damage to elemental monsters
 * - Magical damage to elemental monsters
 * - Damage reduction from elemental monsters
 * - Elemental resistance
 * - Ignore physical DEF of elemental monsters
 * - Ignore magical MDEF of elemental monsters
 */

import Condition from '../EquipAbilityCondition.js';
import { addStat } from '../EquipAbilityParser.js';

const ELEMENT_KO = {
	Ele_Neutral: '무속성',
	Ele_Water: '수속성',
	Ele_Earth: '지속성',
	Ele_Fire: '화속성',
	Ele_Wind: '풍속성',
	Ele_Poison: '독속성',
	Ele_Holy: '성속성',
	Ele_Dark: '암속성',
	Ele_Ghost: '염속성',
	Ele_Undead: '불사속성',
	Ele_All: '모든 속성'
};

const FULL_ELEMENT_MAP = [
	{ key: 'Ele_Neutral', patterns: ['무속성'] },
	{ key: 'Ele_Water', patterns: ['수속성'] },
	{ key: 'Ele_Earth', patterns: ['지속성', '지 속성'] },
	{ key: 'Ele_Fire', patterns: ['화속성', '화 속성'] },
	{ key: 'Ele_Wind', patterns: ['풍속성', '풍 속성'] },
	{ key: 'Ele_Poison', patterns: ['독속성', '독 속성'] },
	{ key: 'Ele_Holy', patterns: ['성속성', '성 속성'] },
	{ key: 'Ele_Dark', patterns: ['암속성', '암 속성'] },
	{ key: 'Ele_Ghost', patterns: ['염속성', '염 속성'] },
	{ key: 'Ele_Undead', patterns: ['불사속성', '불사 속성'] },
	{ key: 'Ele_All', patterns: ['모든 속성'] }
];

const SHORT_ELEMENT_MAP = {
	무: 'Ele_Neutral',
	수: 'Ele_Water',
	지: 'Ele_Earth',
	화: 'Ele_Fire',
	풍: 'Ele_Wind',
	독: 'Ele_Poison',
	성: 'Ele_Holy',
	암: 'Ele_Dark',
	염: 'Ele_Ghost',
	불사: 'Ele_Undead'
};

const ElementRules = [
	{
		pattern: /속성|elemental/i,

		apply(ctx, m, cond) {
			const line = m.input;

			// 종족/스킬 문장은 다른 룰에서 처리
			// Race/skill lines are handled by other rules
			if (line.includes('종족') || line.includes('스킬')) return false;

			const elements = extractElements(line);
			if (!elements.length) return false;

			const value = extractValue(line);
			if (value === null) return false;

			const modes = detectModes(line);
			if (!modes.length) return false;

			let applied = false;

			elements.forEach(el => {
				modes.forEach(mode => {
					let finalValue = value;

					if (mode.mode === 'res') {
						finalValue = -Math.abs(finalValue);
					}

					finalValue = Condition.apply(ctx, cond, finalValue);
					if (!finalValue) return;

					addStat(
						ctx,
						'element_' + el + getSuffix(mode),
						buildLabel(el, mode),
						finalValue,
						'%',
						'element'
					);

					applied = true;
				});
			});

			return applied;
		}
	}
];

/*
 * 속성 추출
 * Extract elements
 */
function extractElements(line) {
	const result = [];

	// 완성형 속성명 우선 매칭
	// Match full element names first
	FULL_ELEMENT_MAP.forEach(entry => {
		entry.patterns.forEach(pattern => {
			if (line.includes(pattern)) {
				result.push(entry.key);
			}
		});
	});

	if (result.length) {
		return unique(result);
	}

	// 한 글자 속성은 "화, 지 속성" 같은 명시형에서만 허용
	// Single-character elements are allowed only in explicit grouped forms
	const grouped = line.match(/([무수지화풍독성암염불사,\s]+)\s*속성/);
	if (grouped) {
		grouped[1].split(',').forEach(part => {
			const key = part.trim();
			if (SHORT_ELEMENT_MAP[key]) {
				result.push(SHORT_ELEMENT_MAP[key]);
			}
		});
	}

	return unique(result);
}

/*
 * 값 추출
 * Extract numeric value
 */
function extractValue(line) {
	const percent = line.match(/([+\-]?\d+(?:\.\d+)?)\s*%/);
	if (percent) return Number(percent[1]);

	const number = line.match(/([+\-]?\d+(?:\.\d+)?)\s*(?:증가|감소|무시)/);
	if (number) return Number(number[1]);

	return null;
}

/*
 * 효과 모드 감지
 * Detect effect mode
 */
function detectModes(line) {
	const modes = [];

	// 마법 방어 / 마법 방어력 무시
	// Ignore magical defense / magical defense rate
	if (/마법\s*방어(?:력)?/.test(line) && /무시/.test(line)) {
		modes.push({ type: 'magic', mode: 'ignore_mdef' });
		return modes;
	}

	// 방어 / 방어력 무시
	// Ignore physical defense / physical defense rate
	if (/방어(?:력)?/.test(line) && /무시/.test(line)) {
		modes.push({ type: 'phys', mode: 'ignore_def' });
		return modes;
	}

	// 받는 데미지 감소 / 내성 / 저항
	// Damage reduction / resistance
	if (
		(/받는|내성|저항/.test(line) || /데미지.*감소/.test(line)) &&
		!/주는/.test(line)
	) {
		modes.push({ type: 'phys', mode: 'res' });
		return modes;
	}

	// 물리, 마법 동시
	// Both physical and magical damage
	if (
		/물리\s*,\s*마법/.test(line) ||
		/물리\s*\/\s*마법/.test(line) ||
		/물리\s*및\s*마법/.test(line)
	) {
		modes.push({ type: 'phys', mode: 'damage' });
		modes.push({ type: 'magic', mode: 'damage' });
		return modes;
	}

	// 마법 데미지
	// Magical damage
	if (/마법/.test(line)) {
		modes.push({ type: 'magic', mode: 'damage' });
		return modes;
	}

	// 기본은 물리 데미지
	// Default is physical damage
	modes.push({ type: 'phys', mode: 'damage' });
	return modes;
}

/*
 * key suffix 생성
 * Build key suffix
 */
function getSuffix(mode) {
	if (mode.mode === 'ignore_def') return '_ignore_def';
	if (mode.mode === 'ignore_mdef') return '_ignore_mdef';
	if (mode.mode === 'res') return '_res';
	if (mode.type === 'magic') return '_magic_damage';

	return '_phys_damage';
}

/*
 * 표시 라벨 생성
 * Build display label
 */
function buildLabel(el, mode) {
	const name = ELEMENT_KO[el] || el;

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

/*
 * 중복 제거
 * Remove duplicates
 */
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

export default ElementRules;