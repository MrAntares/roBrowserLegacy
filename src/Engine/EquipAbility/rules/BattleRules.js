/*
 * Battle Rules (Final Safe)
 *
 * 전투 탭 전용
 * Battle tab only
 *
 * 포함:
 * - 근접 / 원거리 / 전체 물리 데미지
 * - 전체 마법 데미지
 * - 크리티컬 데미지
 * - 크기 데미지 / 크기 받는 데미지 감소
 * - 보스 / 일반 등급 대상 데미지
 * - 방어 / 마법 방어 무시
 *
 * Includes:
 * - Melee / ranged / global physical damage
 * - Global magical damage
 * - Critical damage
 * - Size damage / size damage reduction
 * - Boss / normal class damage
 * - Ignore physical DEF / magical MDEF
 */

import Condition from '../EquipAbilityCondition.js';
import { addStat } from '../EquipAbilityParser.js';

const SIZE_KO = {
	small: '소형',
	medium: '중형',
	large: '대형',
	all: '모든 크기'
};

const SIZE_MAP = [
	{ key: 'small', patterns: ['소형'] },
	{ key: 'medium', patterns: ['중형'] },
	{ key: 'large', patterns: ['대형'] },
	{ key: 'all', patterns: ['모든 크기', '모든 크기의'] }
];

const CLASS_KO = {
	boss: '보스 등급',
	normal: '일반 등급'
};

const CLASS_MAP = [
	{ key: 'boss', patterns: ['보스 등급', '보스형', '보스'] },
	{ key: 'normal', patterns: ['일반 등급', '일반형', '일반'] }
];

const BattleRules = [

	/*
	 * 근접 물리 데미지
	 * Melee physical damage
	 */
	{
		pattern: /근접\s*물리\s*데미지/i,

		apply(ctx, m, cond) {
			const line = m.input;
			const value = getSignedValue(line, cond, ctx);
			if (!value) return false;

			addStat(ctx, 'meleeDamage', '근접 물리 데미지', value, '%', 'battle');
			return true;
		}
	},

	/*
	 * 원거리 물리 데미지
	 * Ranged physical damage
	 */
	{
		pattern: /원거리\s*물리\s*데미지/i,

		apply(ctx, m, cond) {
			const line = m.input;
			const value = getSignedValue(line, cond, ctx);
			if (!value) return false;

			addStat(ctx, 'rangeDamage', '원거리 물리 데미지', value, '%', 'battle');
			return true;
		}
	},

	/*
	 * 크리티컬 데미지
	 * Critical damage
	 */
	{
		pattern: /(크리티컬\s*데미지|크리\s*데미지)/i,

		apply(ctx, m, cond) {
			const line = m.input;
			const value = getSignedValue(line, cond, ctx);
			if (!value) return false;

			addStat(ctx, 'critDamage', '크리티컬 데미지', value, '%', 'battle');
			return true;
		}
	},

	/*
	 * 보스 / 일반 등급 관련 효과
	 * Boss / normal class effects
	 */
	{
		pattern: /(보스\s*등급|일반\s*등급|보스형|일반형)/i,

		apply(ctx, m, cond) {
			const line = m.input;

			if (/속성|종족|스킬|소형|중형|대형|모든\s*크기/.test(line)) {
				return false;
			}

			const classes = extractClasses(line);
			if (!classes.length) return false;

			const value = extractValue(line);
			if (value === null) return false;

			const modes = detectClassModes(line);
			if (!modes.length) return false;

			let applied = false;

			classes.forEach(cls => {
				modes.forEach(mode => {
					let finalValue = value;

					if (mode.mode === 'res') {
						finalValue = -Math.abs(finalValue);
					}

					finalValue = Condition.apply(ctx, cond, finalValue);
					if (!finalValue) return;

					addStat(
						ctx,
						'class_' + cls + getClassSuffix(mode),
						buildClassLabel(cls, mode),
						finalValue,
						'%',
						'battle'
					);

					applied = true;
				});
			});

			return applied;
		}
	},

	/*
	 * 크기 관련 효과
	 * Size-related effects
	 */
	{
		pattern: /(소형|중형|대형|모든\s*크기)/i,

		apply(ctx, m, cond) {
			const line = m.input;

			if (line.includes('속성') || line.includes('종족') || line.includes('스킬')) {
				return false;
			}

			const sizes = extractSizes(line);
			if (!sizes.length) return false;

			const value = extractValue(line);
			if (value === null) return false;

			const modes = detectSizeModes(line);
			if (!modes.length) return false;

			let applied = false;

			sizes.forEach(size => {
				modes.forEach(mode => {
					let finalValue = value;

					if (mode.mode === 'res') {
						finalValue = -Math.abs(finalValue);
					}

					finalValue = Condition.apply(ctx, cond, finalValue);
					if (!finalValue) return;

					addStat(
						ctx,
						'size_' + size + getSizeSuffix(mode),
						buildSizeLabel(size, mode),
						finalValue,
						'%',
						'battle'
					);

					applied = true;
				});
			});

			return applied;
		}
	},

	/*
	 * 물리 데미지 전체
	 * Global physical damage
	 */
	{
		pattern: /물리\s*데미지/i,

		apply(ctx, m, cond) {
			const line = m.input;

			if (/근접|원거리|소형|중형|대형|모든\s*크기|보스\s*등급|일반\s*등급|보스형|일반형|속성|종족|스킬/.test(line)) {
				return false;
			}

			const value = getSignedValue(line, cond, ctx);
			if (!value) return false;

			addStat(ctx, 'physicalDamage', '물리 데미지', value, '%', 'battle');
			return true;
		}
	},

	/*
	 * 마법 데미지 전체
	 * Global magical damage
	 */
	{
		pattern: /마법\s*데미지/i,

		apply(ctx, m, cond) {
			const line = m.input;

			if (/속성|종족|스킬|소형|중형|대형|모든\s*크기|보스\s*등급|일반\s*등급|보스형|일반형/.test(line)) {
				return false;
			}

			const value = getSignedValue(line, cond, ctx);
			if (!value) return false;

			addStat(ctx, 'magicDamage', '마법 데미지', value, '%', 'battle');
			return true;
		}
	},

	/*
	 * 마법 방어 / 마법 방어력 무시
	 * Ignore magical defense
	 */
	{
		pattern: /마법\s*방어(?:력)?.*(무시|관통)/i,

		apply(ctx, m, cond) {
			const line = m.input;

			if (/속성|종족|소형|중형|대형|모든\s*크기|보스\s*등급|일반\s*등급|보스형|일반형/.test(line)) {
				return false;
			}

			const value = getPositiveValue(line, cond, ctx);
			if (!value) return false;

			addStat(ctx, 'ignoreMdef', '마법 방어력 무시', value, '%', 'battle');
			return true;
		}
	},

	/*
	 * 방어 / 방어력 무시
	 * Ignore physical defense
	 */
	{
		pattern: /방어(?:력)?.*(무시|관통)/i,

		apply(ctx, m, cond) {
			const line = m.input;

			if (/마법\s*방어/.test(line)) return false;

			if (/속성|종족|소형|중형|대형|모든\s*크기|보스\s*등급|일반\s*등급|보스형|일반형/.test(line)) {
				return false;
			}

			const value = getPositiveValue(line, cond, ctx);
			if (!value) return false;

			addStat(ctx, 'ignoreDef', '방어력 무시', value, '%', 'battle');
			return true;
		}
	}
];

/*
 * 숫자 추출
 * Extract numeric value
 */
function extractValue(line) {
	const percent = line.match(/([+\-]?\d+(?:\.\d+)?)\s*%/);
	if (percent) return Number(percent[1]);

	const number = line.match(/([+\-]?\d+(?:\.\d+)?)\s*(?:증가|감소|무시|관통)/);
	if (number) return Number(number[1]);

	return null;
}

/*
 * 증가/감소 포함 값 계산
 * Calculate signed value
 */
function getSignedValue(line, cond, ctx) {
	let value = extractValue(line);
	if (value === null) return 0;

	if (/감소/.test(line)) {
		value = -Math.abs(value);
	}

	value = Condition.apply(ctx, cond, value);
	return value || 0;
}

/*
 * 항상 양수 값 계산
 * Calculate positive value
 */
function getPositiveValue(line, cond, ctx) {
	let value = extractValue(line);
	if (value === null) return 0;

	value = Math.abs(value);
	value = Condition.apply(ctx, cond, value);

	return value || 0;
}

/*
 * 크기 추출
 * Extract sizes
 */
function extractSizes(line) {
	const result = [];

	SIZE_MAP.forEach(entry => {
		entry.patterns.forEach(pattern => {
			if (line.includes(pattern)) {
				result.push(entry.key);
			}
		});
	});

	return unique(result);
}

/*
 * 등급 추출
 * Extract monster classes
 */
function extractClasses(line) {
	const result = [];

	CLASS_MAP.forEach(entry => {
		entry.patterns.forEach(pattern => {
			if (line.includes(pattern)) {
				result.push(entry.key);
			}
		});
	});

	return unique(result);
}

/*
 * 크기 효과 모드 감지
 * Detect size effect mode
 */
function detectSizeModes(line) {
	return detectTargetModes(line);
}

/*
 * 등급 효과 모드 감지
 * Detect class effect mode
 */
function detectClassModes(line) {
	return detectTargetModes(line);
}

/*
 * 대상 효과 모드 공통 감지
 * Detect common target effect mode
 */
function detectTargetModes(line) {
	const modes = [];

	if (/마법\s*방어(?:력)?/.test(line) && /무시|관통/.test(line)) {
		modes.push({ type: 'magic', mode: 'ignore_mdef' });
		return modes;
	}

	if (/방어(?:력)?/.test(line) && /무시|관통/.test(line)) {
		modes.push({ type: 'phys', mode: 'ignore_def' });
		return modes;
	}

	if ((/받는|내성|저항/.test(line) || /데미지.*감소/.test(line)) && !/주는/.test(line)) {
		modes.push({ type: 'phys', mode: 'res' });
		return modes;
	}

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

/*
 * 크기 key suffix 생성
 * Build size key suffix
 */
function getSizeSuffix(mode) {
	return getTargetSuffix(mode);
}

/*
 * 등급 key suffix 생성
 * Build class key suffix
 */
function getClassSuffix(mode) {
	return getTargetSuffix(mode);
}

/*
 * 대상 key suffix 공통 생성
 * Build common target key suffix
 */
function getTargetSuffix(mode) {
	if (mode.mode === 'ignore_def') return '_ignore_def';
	if (mode.mode === 'ignore_mdef') return '_ignore_mdef';
	if (mode.mode === 'res') return '_res';
	if (mode.type === 'magic') return '_magic_damage';

	return '_phys_damage';
}

/*
 * 크기 라벨 생성
 * Build size display label
 */
function buildSizeLabel(size, mode) {
	const name = SIZE_KO[size] || size;
	return buildTargetLabel(name, mode);
}

/*
 * 등급 라벨 생성
 * Build class display label
 */
function buildClassLabel(cls, mode) {
	const name = CLASS_KO[cls] || cls;
	return buildTargetLabel(name, mode);
}

/*
 * 대상 라벨 공통 생성
 * Build common target display label
 */
function buildTargetLabel(name, mode) {
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

export default BattleRules;