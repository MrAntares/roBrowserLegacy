/*
 * Skill Rules (Final Safe)
 *
 * 스킬 탭 전용
 * Skill tab only
 *
 * 포함:
 * - 스킬명 데미지 n% 증가
 * - 스킬명의 데미지 n% 증가
 * - [스킬명] 데미지 n% 증가
 * - 스킬 쿨타임 감소
 * - 스킬 캐스팅 감소
 *
 * Includes:
 * - Skill damage increase
 * - Skill cooldown reduction
 * - Skill casting reduction
 */

import Condition from '../EquipAbilityCondition.js';
import { addStat } from '../EquipAbilityParser.js';

function getSkillInfoSource(ctx) {
	if (ctx?.DB?.getSkillInfoList) {
		return ctx.DB.getSkillInfoList();
	}
	return {};
}

let skillNameMap = null;
let skillNamesSorted = null;

function buildSkillCache(ctx) {
	if (skillNameMap) return;

	const SkillInfoDB = getSkillInfoSource(ctx);

	skillNameMap = {};
	skillNamesSorted = [];

	for (const id in SkillInfoDB) {
		const name = SkillInfoDB[id]?.SkillName;
		if (!name) continue;

		skillNameMap[name] = id;
		skillNamesSorted.push(name);
	}

	skillNamesSorted.sort((a, b) => b.length - a.length);
}

function findSkill(line, ctx) {
	buildSkillCache(ctx);

	const bracket = line.match(/\[([^\]]+)\]/);
	if (bracket) {
		const name = bracket[1].trim();

		if (skillNameMap[name]) {
			return {
				id: skillNameMap[name],
				name
			};
		}
	}

	for (const name of skillNamesSorted) {
		if (line.includes(name)) {
			return {
				id: skillNameMap[name],
				name
			};
		}
	}

	return null;
}

function extractValue(line) {
	const percent = line.match(/([+\-]?\d+(?:\.\d+)?)\s*%/);
	if (percent) return Number(percent[1]);

	const number = line.match(/([+\-]?\d+(?:\.\d+)?)\s*(?:증가|감소|초)/);
	if (number) return Number(number[1]);

	return null;
}

const SkillRules = [

	{
		pattern: /(데미지|Damage)/i,

		apply(ctx, m, cond) {
			const line = m.input;

			const skill = findSkill(line, ctx);
			if (!skill) return false;

			let value = extractValue(line);
			if (value === null) return false;

			if (/감소/i.test(line)) {
				value = -Math.abs(value);
			}

			value = Condition.apply(ctx, cond, value);
			if (!value) return false;

			addStat(
				ctx,
				'skill_' + skill.id + '_damage',
				skill.name + ' 데미지',
				value,
				'%',
				'skill'
			);

			return true;
		}
	},

	{
		pattern: /(쿨타임|cooldown)/i,

		apply(ctx, m, cond) {
			const line = m.input;

			const skill = findSkill(line, ctx);
			if (!skill) return false;

			let value = extractValue(line);
			if (value === null) return false;

			value = -Math.abs(value);

			value = Condition.apply(ctx, cond, value);
			if (!value) return false;

			addStat(
				ctx,
				'skill_' + skill.id + '_cooldown',
				skill.name + ' 쿨타임',
				value,
				'초',
				'skill'
			);

			return true;
		}
	},

	{
		pattern: /(캐스팅|casting)/i,

		apply(ctx, m, cond) {
			const line = m.input;

			const skill = findSkill(line, ctx);
			if (!skill) return false;

			let value = extractValue(line);
			if (value === null) return false;

			if (/감소/i.test(line)) {
				value = -Math.abs(value);
			}

			value = Condition.apply(ctx, cond, value);
			if (!value) return false;

			const unit = /초/.test(line) ? '초' : '%';

			addStat(
				ctx,
				'skill_' + skill.id + '_cast',
				skill.name + ' 캐스팅',
				value,
				unit,
				'skill'
			);

			return true;
		}
	}

];

export default SkillRules;