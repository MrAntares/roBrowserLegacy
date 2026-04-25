/*
 * Ability Rules (Final)
 *
 * 어빌 탭 전용
 * Ability tab only
 *
 * 포함 / Includes:
 * ATK / MATK / DEF / MDEF
 * HP / SP / MAXHP / MAXSP / MHP / MSP
 * HIT / FLEE / CRI / ASPD / 완전회피
 * 공격 후 딜레이 / 변동 캐스팅 / 고정 캐스팅 / 글로벌 쿨타임
 *
 * 주의 / Notes:
 * - P.ATK는 StatRules에서 처리
 * - S.MATK는 StatRules에서 처리
 * - ATK는 P.ATK 안의 ATK를 잡지 않음
 * - MATK는 S.MATK 안의 MATK를 잡지 않음
 */

import Condition from '../EquipAbilityCondition.js';
import { addStat } from '../EquipAbilityParser.js';

const BASIC_ABILITY_MAP = {
	ATK: { key: 'atk', label: 'ATK' },
	MATK: { key: 'matk', label: 'MATK' },
	DEF: { key: 'def', label: 'DEF' },
	MDEF: { key: 'mdef', label: 'MDEF' },
	HIT: { key: 'hit', label: 'HIT' },
	FLEE: { key: 'flee', label: 'FLEE' },
	CRI: { key: 'cri', label: 'CRI' }
};

const HP_SP_MAP = {
	HP: { key: 'hp', label: 'HP' },
	SP: { key: 'sp', label: 'SP' },
	MAXHP: { key: 'mhp', label: 'MAXHP' },
	MAXSP: { key: 'msp', label: 'MAXSP' },
	MHP: { key: 'mhp', label: 'MHP' },
	MSP: { key: 'msp', label: 'MSP' }
};

/*
 * 기본 어빌 패턴
 * Basic ability pattern
 *
 * (^|[^A-Za-z.]) 를 사용해서 P.ATK / S.MATK 내부 매칭 방지
 * Uses (^|[^A-Za-z.]) to avoid matching inside P.ATK / S.MATK
 */
const BASIC_ABILITY_PATTERN =
	/(^|[^A-Za-z.])((?:ATK)|(?:MATK)|(?:DEF)|(?:MDEF)|(?:HIT)|(?:FLEE)|(?:CRI))\s*([+\-]?\s*\d+(?:\.\d+)?)\s*(%)?\s*(증가|감소)?/gi;

const HP_SP_PATTERN =
	/(^|[^A-Za-z.])((?:MAXHP)|(?:MAXSP)|(?:MHP)|(?:MSP)|(?:HP)|(?:SP))\s*([+\-]?\s*\d+(?:\.\d+)?)\s*(%)?\s*(증가|감소)?/gi;

const AbilityRules = [

	/*
	 * ATK / MATK / DEF / MDEF / HIT / FLEE / CRI
	 */
	{
		pattern: BASIC_ABILITY_PATTERN,

		apply(ctx, m, cond) {
			const text = m.input;
			let matched = false;

			BASIC_ABILITY_PATTERN.lastIndex = 0;

			text.replace(BASIC_ABILITY_PATTERN, function (_, prefix, rawStat, rawValue, percent, word) {
				const stat = String(rawStat || '').toUpperCase();
				const info = BASIC_ABILITY_MAP[stat];

				if (!info) return '';

				let value = Number(String(rawValue).replace(/\s+/g, ''));

				if (word === '감소') {
					value = -Math.abs(value);
				}

				value = Condition.apply(ctx, cond, value);
				if (!value) return '';

				addStat(
					ctx,
					info.key,
					info.label,
					value,
					percent ? '%' : '',
					'ability'
				);

				matched = true;
				return '';
			});

			return matched;
		}
	},

	/*
	 * HP / SP / MAXHP / MAXSP / MHP / MSP
	 */
	{
		pattern: HP_SP_PATTERN,

		apply(ctx, m, cond) {
			const text = m.input;
			let matched = false;

			HP_SP_PATTERN.lastIndex = 0;

			text.replace(HP_SP_PATTERN, function (_, prefix, rawStat, rawValue, percent, word) {
				const stat = String(rawStat || '').toUpperCase();
				const info = HP_SP_MAP[stat];

				if (!info) return '';

				let value = Number(String(rawValue).replace(/\s+/g, ''));

				if (word === '감소') {
					value = -Math.abs(value);
				}

				value = Condition.apply(ctx, cond, value);
				if (!value) return '';

				addStat(
					ctx,
					info.key,
					info.label,
					value,
					percent ? '%' : '',
					'ability'
				);

				matched = true;
				return '';
			});

			return matched;
		}
	},

	/*
	 * 완전회피
	 * Perfect dodge
	 */
	{
		pattern: /(완전회피|Perfect\s*Dodge)\s*([+\-]?\s*\d+(?:\.\d+)?)\s*(증가|감소)?/i,

		apply(ctx, m, cond) {
			let value = Number(String(m[2]).replace(/\s+/g, ''));

			if (m[3] === '감소') {
				value = -Math.abs(value);
			}

			value = Condition.apply(ctx, cond, value);
			if (!value) return false;

			addStat(ctx, 'perfectDodge', '완전회피', value, '', 'ability');
			return true;
		}
	},

	/*
	 * 공격속도 / ASPD
	 * Attack speed / ASPD
	 */
	{
		pattern: /(공격\s*속도|공격속도|ASPD)\s*(?:증가)?\s*\(?\s*(?:ASPD)?\s*([+\-]?\s*\d+(?:\.\d+)?)?\s*(%)?/i,

		apply(ctx, m, cond) {
			// "공격 속도 증가"처럼 숫자가 없는 표현은 표시하지 않음
			// Do not display text without a numeric value
			if (!m[2]) return false;

			let value = Number(String(m[2]).replace(/\s+/g, ''));

			value = Condition.apply(ctx, cond, value);
			if (!value) return false;

			addStat(ctx, 'aspd', 'ASPD', value, m[3] ? '%' : '', 'ability');
			return true;
		}
	},

	/*
	 * 공격 후 딜레이 감소
	 * After attack delay reduction
	 */
	{
		pattern: /공격\s*후\s*딜레이\s*([+\-]?\s*\d+(?:\.\d+)?)\s*%?\s*감소/i,

		apply(ctx, m, cond) {
			let value = -Math.abs(Number(String(m[1]).replace(/\s+/g, '')));

			value = Condition.apply(ctx, cond, value);
			if (!value) return false;

			addStat(ctx, 'afterDelay', '공격 후 딜레이', value, '%', 'ability');
			return true;
		}
	},

	/*
	 * 후딜레이 감소
	 * After delay reduction
	 */
	{
		pattern: /후딜레이\s*([+\-]?\s*\d+(?:\.\d+)?)\s*%?\s*감소/i,

		apply(ctx, m, cond) {
			let value = -Math.abs(Number(String(m[1]).replace(/\s+/g, '')));

			value = Condition.apply(ctx, cond, value);
			if (!value) return false;

			addStat(ctx, 'afterDelay', '후딜레이', value, '%', 'ability');
			return true;
		}
	},

	/*
	 * 변동 캐스팅 감소
	 * Variable casting reduction
	 */
	{
		pattern: /변동\s*캐스팅\s*([+\-]?\s*\d+(?:\.\d+)?)\s*%?\s*감소/i,

		apply(ctx, m, cond) {
			let value = -Math.abs(Number(String(m[1]).replace(/\s+/g, '')));

			value = Condition.apply(ctx, cond, value);
			if (!value) return false;

			addStat(ctx, 'varCast', '변동 캐스팅', value, '%', 'ability');
			return true;
		}
	},

	/*
	 * 고정 캐스팅 감소
	 * Fixed casting reduction
	 */
	{
		pattern: /고정\s*캐스팅\s*([+\-]?\s*\d+(?:\.\d+)?)\s*(초|%)?\s*감소/i,

		apply(ctx, m, cond) {
			let value = -Math.abs(Number(String(m[1]).replace(/\s+/g, '')));
			const unit = m[2] === '초' ? '초' : '%';

			value = Condition.apply(ctx, cond, value);
			if (!value) return false;

			addStat(ctx, 'fixCast', '고정 캐스팅', value, unit, 'ability');
			return true;
		}
	},

	/*
	 * 글로벌 쿨타임 감소
	 * Global cooldown reduction
	 */
	{
		pattern: /(글로벌\s*쿨타임|GCD)\s*([+\-]?\s*\d+(?:\.\d+)?)\s*%?\s*감소/i,

		apply(ctx, m, cond) {
			let value = -Math.abs(Number(String(m[2]).replace(/\s+/g, '')));

			value = Condition.apply(ctx, cond, value);
			if (!value) return false;

			addStat(ctx, 'gcd', '글로벌 쿨타임', value, '%', 'ability');
			return true;
		}
	}

];

export default AbilityRules;