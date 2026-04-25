/*
 * Special Rules (Final Safe)
 *
 * 특수 / 예외 처리
 * Special / fallback handling
 *
 * 포함:
 * - 경험치 / 드랍률
 * - HP/SP 흡수
 *
 * Includes:
 * - EXP / drop rate
 * - HP/SP drain
 */

import Condition from '../EquipAbilityCondition.js';
import { addStat } from '../EquipAbilityParser.js';

function extractValue(line) {
	const percent = line.match(/([+\-]?\d+(?:\.\d+)?)\s*%/);
	if (percent) return Number(percent[1]);

	const number = line.match(/([+\-]?\d+(?:\.\d+)?)/);
	return number ? Number(number[1]) : null;
}

const SpecialRules = [

	{
		pattern: /경험치/i,

		apply(ctx, m, cond) {
			const num = extractValue(m.input);
			if (num === null) return false;

			const value = Condition.apply(ctx, cond, num);
			if (!value) return false;

			addStat(ctx, 'exp_bonus', '경험치 획득 증가', value, '%', 'special');
			return true;
		}
	},

	{
		pattern: /드랍|드롭|획득률/i,

		apply(ctx, m, cond) {
			const num = extractValue(m.input);
			if (num === null) return false;

			const value = Condition.apply(ctx, cond, num);
			if (!value) return false;

			addStat(ctx, 'drop_bonus', '아이템 획득률 증가', value, '%', 'special');
			return true;
		}
	},

	{
		pattern: /(HP|SP).*흡수|흡수.*(HP|SP)/i,

		apply(ctx, m, cond) {
			const line = m.input;
			const num = extractValue(line);
			if (num === null) return false;

			const value = Condition.apply(ctx, cond, num);
			if (!value) return false;

			const isHP = /HP/i.test(line);

			addStat(
				ctx,
				isHP ? 'hp_drain' : 'sp_drain',
				isHP ? 'HP 흡수' : 'SP 흡수',
				value,
				'%',
				'special'
			);

			return true;
		}
	}

];

export default SpecialRules;