/*
 * EquipAbility Parser Engine
 *
 * 장비 능력치 파서 메인 엔진
 * Main parser engine for equipment ability UI
 *
 * 핵심 구조:
 * - 설명문을 문장 단위(.)로 분리
 * - 문장을 구문 단위(,)로 분리
 * - 조건문은 condition stack에 저장
 * - 효과문은 현재 condition stack을 적용해서 Rules로 전달
 *
 * Core structure:
 * - Split descriptions by sentence period
 * - Split each sentence by comma clauses
 * - Store condition clauses in a condition stack
 * - Apply current condition stack to effect clauses
 */

import Session from 'Engine/SessionStorage.js';

import Condition from './EquipAbilityCondition.js';
import Classifier from './EquipAbilityClassifier.js';
import Util from './EquipAbilityUtil.js';
import RULES from './rules/index.js';

const EquipAbilityParser = {};

// true로 바꾸면 콘솔 디버그 출력
// Set true to enable console debug logs
const DEBUG = true;

/*
 * 메인 파서 진입
 * Main parser entry
 */
EquipAbilityParser.parse = function parse(equipList, DB) {
	const ctx = createContext(equipList || [], DB);

	ctx.equippedItems = collectEquippedItemNames(ctx);

	if (DEBUG) {
		console.group('[EquipAbilityParser] START');
		console.log('equipList:', ctx.equipList);
		console.log('equippedItems:', ctx.equippedItems);
	}

	ctx.equipList.forEach(item => {
		if (!item || !item.ITID) return;

		ctx.refine = item.RefiningLevel || item.Refine || 0;
		ctx.grade = item.enchantgrade || item.Grade || 0;
		ctx.currentItem = item;

		const rawDescriptions = collectItemDescriptions(item, ctx);

		if (DEBUG) {
			const info = ctx.DB.getItemInfo(item.ITID);
			console.group('[EA ITEM] ' + item.ITID + ' / ' + (info?.identifiedDisplayName || 'Unknown'));
			console.log('refine:', ctx.refine, 'grade:', ctx.grade);
			console.log('rawDescriptions:', rawDescriptions);
		}

		rawDescriptions.forEach(desc => {
			parseDescription(desc, ctx);
		});

		if (DEBUG) {
			console.groupEnd();
		}
	});

	Classifier.classify(ctx);

	if (DEBUG) {
		console.log('[EquipAbilityParser] result:', ctx.result);
		console.groupEnd();
	}

	return ctx.result;
};

/*
 * 컨텍스트 생성
 * Create context
 */
function createContext(equipList, DB) {
	return {
		equipList,
		DB,

		refine: 0,
		grade: 0,
		baseLevel: getBaseLevel(),
		skillLevels: getSkillLevels(),
		equippedItems: [],

		currentItem: null,
		currentLine: '',
		_lineAddedStat: false,
		_debugAdds: [],

		// 직전 함께 장착 조건
		// Last equip-with condition
		activeEquipCondition: null,

		result: {
			total: {},
			categories: {
				total: [],
				stat: [],
				ability: [],
				battle: [],
				element: [],
				race: [],
				skill: [],
				special: []
			},
			errors: []
		}
	};
}

/*
 * 디스크립트 하나 파싱
 * Parse one description block
 */
function parseDescription(rawDesc, ctx) {
	const cleaned = cleanDescription(rawDesc);
	if (!cleaned) return;

	const sentences = splitSentences(cleaned);

	if (DEBUG) {
		console.group('[EA DESC]');
		console.log(cleaned);
		console.log('sentences:', sentences);
	}

	sentences.forEach(sentence => {
		parseSentence(sentence, ctx);
	});

	if (DEBUG) {
		console.groupEnd();
	}
}

/*
 * 문장 하나 파싱
 * Parse one sentence
 *
 * . 단위 문장이 끝나면 조건 stack은 초기화
 * Condition stack resets at the end of a sentence
 */
function parseSentence(sentence, ctx) {
	sentence = cleanEffectLine(sentence);
	if (!sentence || isMetaLine(sentence)) return;

	const clauses = splitClauses(sentence);

	let conditionStack = [];
	let pendingTargetPrefix = '';

	if (DEBUG) {
		console.group('[EA SENTENCE]');
		console.log(sentence);
		console.log('clauses:', clauses);
	}

	clauses.forEach(clause => {
		clause = cleanEffectLine(clause);
		if (!clause || isMetaLine(clause)) return;

		const condition = Condition.extract(clause);
		const hasCondition = condition && condition.type && condition.type !== 'none';

		if (hasCondition) {
			conditionStack.push(condition);

			if (condition.type === 'equip_with') {
				ctx.activeEquipCondition = condition;
			}

			const effectText = cleanEffectLine(Condition.strip(clause));

			if (DEBUG) {
				console.log('[EA CONDITION]', condition.type, condition.target || '', 'clause:', clause, 'effect:', effectText);
			}

			if (effectText && !isMetaLine(effectText) && effectText !== clause) {
				parseEffectClause(effectText, ctx, makeCombinedCondition(conditionStack));
			}

			return;
		}

		// 대상만 있는 구문 보존
		// Keep target-only clause for the next effect clause
		if (isTargetOnlyClause(clause)) {
			pendingTargetPrefix = pendingTargetPrefix
				? pendingTargetPrefix + ', ' + clause
				: clause;

			if (DEBUG) {
				console.log('[EA TARGET HOLD]', pendingTargetPrefix);
			}

			return;
		}

		let effectClause = clause;

		if (pendingTargetPrefix) {
			effectClause = pendingTargetPrefix + ', ' + clause;
			pendingTargetPrefix = '';

			if (DEBUG) {
				console.log('[EA TARGET MERGE]', effectClause);
			}
		}

		parseEffectClause(effectClause, ctx, makeCombinedCondition(conditionStack));
	});

	if (DEBUG) {
		console.groupEnd();
	}
}

/*
 * 효과 구문 파싱
 * Parse effect clause
 */
function parseEffectClause(effectText, ctx, condition) {
	const line = Util.normalize(effectText);
	if (!line || isMetaLine(line)) return;

	ctx.currentLine = line;
	ctx._lineAddedStat = false;
	ctx._debugAdds = [];

	let matched = false;

	for (let i = 0; i < RULES.length; i++) {
		const rule = RULES[i];

		if (rule.pattern.global) {
			rule.pattern.lastIndex = 0;
		}

		const m = line.match(rule.pattern);
		if (!m) continue;

		if (!m.input) {
			m.input = line;
		}

		ctx._lineAddedStat = false;

		const applied = rule.apply(ctx, m, condition);

		if (applied !== false && ctx._lineAddedStat) {
			matched = true;
		}
	}

	if (DEBUG) {
		if (ctx._debugAdds.length) {
			ctx._debugAdds.forEach(add => {
				console.log(
					'[EA SEND]',
					'"' + line + '"',
					'=>',
					add.label,
					formatDebugValue(add.value, add.unit),
					'category=' + add.category,
					'condition=' + (condition?.type || 'none')
				);
			});
		} else {
			console.log('[EA SEND FAIL]', '"' + line + '"', 'condition=' + (condition?.type || 'none'));
		}
	}

	if (!matched) {
		handleError(ctx, line);
	}
}

/*
 * 조건 여러 개 합치기
 * Combine multiple conditions
 */
function makeCombinedCondition(stack) {
	if (!stack || !stack.length) {
		return {
			type: 'none',
			check: () => true,
			multiplier: () => 1
		};
	}

	return {
		type: stack.map(c => c.type).join('+'),
		target: stack.map(c => c.target).filter(Boolean).join('+'),

		check(ctx) {
			return stack.every(c => !c.check || c.check(ctx));
		},

		multiplier(ctx) {
			return stack.reduce((total, c) => {
				if (!c.multiplier) return total;
				return total * (c.multiplier(ctx) || 1);
			}, 1);
		}
	};
}

/*
 * 아이템/카드/랜덤 옵션 설명 수집
 * Collect item/card/random-option descriptions
 */
function collectItemDescriptions(item, ctx) {
	const lines = [];

	const info = ctx.DB.getItemInfo(item.ITID);
	pushDescription(lines, info?.identifiedDescriptionName);

	getCardIds(item).forEach(id => {
		if (!id || id <= 0 || id === 255) return;

		const card = ctx.DB.getItemInfo(id);
		pushDescription(lines, card?.identifiedDescriptionName);
	});

	getRandomOptions(item).forEach(opt => {
		const index = opt.index ?? opt.option ?? opt.id ?? opt.Index;
		const value = opt.value ?? opt.val ?? opt.Value ?? 0;

		if (!index) return;

		let text = ctx.DB.getOptionName(index);

		if (!text) {
			lines.push('[UNKNOWN OPTION ' + index + '] ' + value);
			return;
		}

		text = String(text)
			.replace(/%d/g, value)
			.replace(/%%/g, '%');

		lines.push(text);
	});

	return lines;
}

function pushDescription(lines, desc) {
	if (!desc) return;

	if (Array.isArray(desc)) {
		desc.forEach(line => {
			if (line !== undefined && line !== null) {
				lines.push(String(line));
			}
		});
		return;
	}

	lines.push(String(desc));
}

/*
 * 설명문 정리
 * Clean raw description text
 */
function cleanDescription(text) {
	text = String(text || '');

	// <NAVI> 이후는 아이템 안내/상점 안내라 능력치 파싱에서 제외
	// Everything after <NAVI> is guide/shop text, so remove it from ability parsing
	text = text.replace(/<NAVI>[\s\S]*$/i, '');

	return Util.normalize(text)
		.replace(/<INFO>.*?<\/INFO>/gi, '')
		.replace(/\^[0-9A-Fa-f]{6}/g, '')
		.replace(/_+/g, ' ')
		.replace(/\r/g, '\n')
		.replace(/[。]/g, '.')
		.replace(/\s+\n/g, '\n')
		.trim();
}

/*
 * 문장 분리
 * Split by sentence period/newline
 *
 * P.ATK / S.MATK / C.Rate 같은 점은 분리하지 않음
 * Does not split dots inside P.ATK / S.MATK / C.Rate
 */
function splitSentences(text) {
	const out = [];
	let current = '';

	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		const prev = text[i - 1] || '';
		const next = text[i + 1] || '';

		if (ch === '\n') {
			pushSentence(out, current);
			current = '';
			continue;
		}

		current += ch;

		if (ch === '.') {
			// 문장 끝은 ". " 또는 줄 끝만 인정
			// Sentence end is only ". " or end of text

			if (!next || next === ' ' || next === '\n' || next === '\r') {
				pushSentence(out, current);
				current = '';
			}

			continue;
		}
	}

	pushSentence(out, current);

	return out;
}

function pushSentence(out, text) {
	text = Util.normalize(String(text || '').replace(/\.$/, ''));
	if (text) out.push(text);
}

/*
 * 구문 분리
 * Split by comma clauses
 *
 * 보호:
 * - 물리, 마법 공격력
 * - 화,지 속성
 *
 * Protected:
 * - physical, magical attack
 * - comma-separated element group
 */
function splitClauses(sentence) {
	let text = sentence;

	const protections = [];
	text = protect(text, /물리\s*,\s*마법/g, protections);
	text = protect(text, /마법\s*,\s*물리/g, protections);
	text = protect(text, /[무수지화풍독성암염불사]\s*,\s*[무수지화풍독성암염불사](?:\s*,\s*[무수지화풍독성암염불사])*\s*속성/g, protections);

	return text
		.split(',')
		.map(v => restore(v, protections))
		.map(v => Util.normalize(v))
		.filter(Boolean);
}

function protect(text, regex, bucket) {
	return text.replace(regex, match => {
		const key = '__EA_PROTECT_' + bucket.length + '__';
		bucket.push(match);
		return key;
	});
}

function restore(text, bucket) {
	return text.replace(/__EA_PROTECT_(\d+)__/g, (_, idx) => bucket[Number(idx)] || '');
}

/*
 * 대상만 있는 구문인지 확인
 * Check whether clause only contains targets
 *
 * 예:
 * 중형 적
 * 대형 몬스터
 * 보스 등급 적
 *
 * Examples:
 * Medium enemy
 * Large monster
 * Boss grade enemy
 */
function isTargetOnlyClause(clause) {
	clause = Util.normalize(clause);

	if (!clause) return false;

	// 효과 숫자나 증가/감소/무시가 있으면 대상 전용이 아님
	// If it has value/effect words, it is not target-only
	if (/\d|증가|감소|무시|관통|흡수/.test(clause)) {
		return false;
	}

	// 크기 대상
	// Size target
	if (/^(소형|중형|대형)\s*(적|몬스터|대상)?$/.test(clause)) {
		return true;
	}

	// 등급 대상
	// Class target
	if (/^(보스|일반)\s*등급\s*(적|몬스터|대상)?$/.test(clause)) {
		return true;
	}

	return false;
}

/*
 * 효과 문장 안의 메타 꼬리 제거
 * Trim metadata tail from effect line
 */
function cleanEffectLine(line) {
	line = Util.normalize(line);

	return line
		.replace(/\s*계열\s*:.*$/g, '')
		.replace(/\s*위치\s*:.*$/g, '')
		.replace(/\s*무게\s*:.*$/g, '')
		.replace(/\s*요구\s*레벨\s*:.*$/g, '')
		.replace(/\s*방어구\s*레벨\s*:.*$/g, '')
		.replace(/\s*무기\s*레벨\s*:.*$/g, '')
		.replace(/\s*장착\s*:.*$/g, '')
		.trim();
}

/*
 * 메타/설명문 제거
 * Remove metadata/flavor lines
 */
function isMetaLine(line) {
	line = Util.normalize(line);
	if (!line) return true;

	if (/^(계열|위치|무게|요구\s*레벨|방어구\s*레벨|무기\s*레벨|장착)\s*:/.test(line)) return true;

	return !hasEffectKeyword(line);
}

/*
 * 능력치/조건 키워드 포함 여부
 * Whether the line contains effect/condition keywords
 */
function hasEffectKeyword(line) {
	return /(?:\bATK\b|\bMATK\b|\bDEF\b|\bMDEF\b|\bHIT\b|\bFLEE\b|\bCRI\b|\bASPD\b|\bMSP\b|\bMHP\b|\bMaxHP\b|\bMaxSP\b|\bHP\b|\bSP\b|STR|AGI|VIT|INT|DEX|LUK|POW|STA|WIS|SPL|CON|CRT|P\.ATK|S\.MATK|RES|MRES|C\.Rate|C\.RATE|데미지|공격력|방어|무시|캐스팅|쿨타임|후딜레이|공격\s*속도|공격속도|제련|등급|함께\s*(?:장착|착용)|(?:와|과)\s*(?:함께\s*)?(?:장착|착용)|착용\s*시|장착\s*시|속성|종족|형\s*몬스터|크기|순수\s*(?:STR|AGI|VIT|INT|DEX|LUK))/i.test(line);
}

/*
 * 장착 아이템 이름 수집
 * Collect equipped item names
 */
function collectEquippedItemNames(ctx) {
	const names = [];

	ctx.equipList.forEach(item => {
		if (!item || !item.ITID) return;

		const info = ctx.DB.getItemInfo(item.ITID);
		if (!info) return;

		if (info.identifiedDisplayName) names.push(stripSlotText(info.identifiedDisplayName));
		if (info.identifiedName) names.push(stripSlotText(info.identifiedName));
		if (info.Name) names.push(stripSlotText(info.Name));
		if (info.name) names.push(stripSlotText(info.name));
	});

	return Util.unique(names);
}

/*
 * 능력치 추가
 * Add stat value
 */
export function addStat(ctx, key, label, value, unit, category) {
	value = Number(value || 0);
	if (!value) return;

	ctx._lineAddedStat = true;

	if (!ctx.result.total[key]) {
		ctx.result.total[key] = {
			key,
			label,
			value: 0,
			unit: unit || '',
			category: category || 'special'
		};
	}

	ctx.result.total[key].value += value;

	if (DEBUG) {
		ctx._debugAdds.push({
			key,
			label,
			value,
			unit: unit || '',
			category: category || 'special'
		});
	}
}

/*
 * 에러 처리
 * Handle unmatched lines
 */
function handleError(ctx, line) {
	const category = Classifier.guess(line);
	const key = 'error_' + ctx.result.errors.length;

	const entry = {
		key,
		label: '[ERROR] ' + line,
		value: 1,
		unit: '',
		category,
		source: line,
		isError: true
	};

	ctx.result.errors.push(entry);

	// ERROR를 UI에도 띄우고 싶으면 아래 주석 해제
	// Uncomment this if you want errors visible in the UI
	// ctx.result.total[key] = entry;
}

function getCardIds(item) {
	const slot = item.slot || item.slots || {};

	if (Array.isArray(slot)) return slot;

	return [
		slot.card1,
		slot.card2,
		slot.card3,
		slot.card4
	];
}

function getRandomOptions(item) {
	return item.option || item.Options || item.options || [];
}

function getBaseLevel() {
	return Session.Character?.level ||
		Session.Character?.lv ||
		Session.Character?.baseLevel ||
		Session.Character?.BaseLevel ||
		0;
}

function getSkillLevels() {
	const out = {};
	const skills = Session.Character?.skills || Session.Character?.skillList || [];

	if (Array.isArray(skills)) {
		skills.forEach(skill => {
			if (!skill) return;

			const id = skill.SKID || skill.id || skill.skillId || skill.SkillID;
			const level = skill.level || skill.lv || skill.Lv || skill.Level || 0;
			const name = skill.name || skill.SkillName;

			if (id) out[id] = level;
			if (name) out[name] = level;
		});
	}

	return out;
}

function stripSlotText(name) {
	return String(name || '')
		.replace(/\[\d+\]$/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function formatDebugValue(value, unit) {
	const sign = Number(value) > 0 ? '+' : '';
	return sign + value + (unit || '');
}

export default EquipAbilityParser;