/*
 * Stat Rules (Final)
 *
 * 스탯 탭 전용 룰
 * Stat tab only
 *
 * 포함:
 * Includes:
 *
 * STR / AGI / VIT / INT / DEX / LUK
 * POW / STA / WIS / SPL / CON / CRT
 * P.ATK / S.MATK / RES / MRES / C.Rate
 *
 * 주의:
 * - ATK는 여기서 처리하지 않음
 * - MATK는 여기서 처리하지 않음
 * - P.ATK / S.MATK만 여기서 처리
 *
 * Notes:
 * - ATK is not handled here
 * - MATK is not handled here
 * - Only P.ATK / S.MATK are handled here
 */

import Condition from '../EquipAbilityCondition.js';
import { addStat } from '../EquipAbilityParser.js';

const STAT_MAP = {
	STR: { key: 'str', label: 'STR' },
	AGI: { key: 'agi', label: 'AGI' },
	VIT: { key: 'vit', label: 'VIT' },
	INT: { key: 'int', label: 'INT' },
	DEX: { key: 'dex', label: 'DEX' },
	LUK: { key: 'luk', label: 'LUK' },

	POW: { key: 'pow', label: 'POW' },
	STA: { key: 'sta', label: 'STA' },
	WIS: { key: 'wis', label: 'WIS' },
	SPL: { key: 'spl', label: 'SPL' },
	CON: { key: 'con', label: 'CON' },
	CRT: { key: 'crt', label: 'CRT' },

	'P.ATK': { key: 'patk', label: 'P.ATK' },
	'S.MATK': { key: 'smatk', label: 'S.MATK' },
	MRES: { key: 'mres', label: 'MRES' },
	RES: { key: 'res', label: 'RES' },
	'C.RATE': { key: 'crate', label: 'C.Rate' },
	CRATE: { key: 'crate', label: 'C.Rate' }
};

/*
 * 스탯 단일 구문 매칭
 * Match a single stat clause
 *
 * 예:
 * STR + 5
 * P.ATK + 3
 * C.Rate + 2
 *
 * Examples:
 * STR + 5
 * P.ATK + 3
 * C.Rate + 2
 */
const STAT_PATTERN = /(^|[^A-Za-z.])((?:P\.ATK)|(?:S\.MATK)|(?:C\.RATE)|(?:C\.Rate)|(?:MRES)|(?:RES)|(?:STR)|(?:AGI)|(?:VIT)|(?:INT)|(?:DEX)|(?:LUK)|(?:POW)|(?:STA)|(?:WIS)|(?:SPL)|(?:CON)|(?:CRT))\s*([+\-]?\s*\d+(?:\.\d+)?)\s*(%)?\s*(증가|감소)?/gi;

const StatRules = [

	{
		pattern: STAT_PATTERN,

		apply(ctx, m, cond) {
			const text = m.input;
			let matched = false;

			STAT_PATTERN.lastIndex = 0;

			text.replace(STAT_PATTERN, function (_, prefix, rawStat, rawValue, percent, word) {
				const statKey = normalizeStatKey(rawStat);
				const info = STAT_MAP[statKey];

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
					'stat'
				);

				matched = true;
				return '';
			});

			return matched;
		}
	},

	/*
	 * 모든 기본 스테이터스
	 * All basic stats
	 */
	{
		pattern: /모든\s*기본\s*스테이터스\s*([+\-]?\s*\d+(?:\.\d+)?)\s*(증가|감소)?/i,

		apply(ctx, m, cond) {
			let value = Number(String(m[1]).replace(/\s+/g, ''));

			if (m[2] === '감소') {
				value = -Math.abs(value);
			}

			value = Condition.apply(ctx, cond, value);
			if (!value) return false;

			[
				{ key: 'str', label: 'STR' },
				{ key: 'agi', label: 'AGI' },
				{ key: 'vit', label: 'VIT' },
				{ key: 'int', label: 'INT' },
				{ key: 'dex', label: 'DEX' },
				{ key: 'luk', label: 'LUK' }
			].forEach(stat => {
				addStat(ctx, stat.key, stat.label, value, '', 'stat');
			});

			return true;
		}
	},

	/*
	 * 모든 특성 스테이터스
	 * All trait stats
	 */
	{
		pattern: /모든\s*특성\s*스테이터스\s*([+\-]?\s*\d+(?:\.\d+)?)\s*(증가|감소)?/i,

		apply(ctx, m, cond) {
			let value = Number(String(m[1]).replace(/\s+/g, ''));

			if (m[2] === '감소') {
				value = -Math.abs(value);
			}

			value = Condition.apply(ctx, cond, value);
			if (!value) return false;

			[
				{ key: 'pow', label: 'POW' },
				{ key: 'sta', label: 'STA' },
				{ key: 'wis', label: 'WIS' },
				{ key: 'spl', label: 'SPL' },
				{ key: 'con', label: 'CON' },
				{ key: 'crt', label: 'CRT' }
			].forEach(stat => {
				addStat(ctx, stat.key, stat.label, value, '', 'stat');
			});

			return true;
		}
	}
];

function normalizeStatKey(raw) {
	return String(raw || '')
		.replace(/\s+/g, '')
		.replace(/C\.Rate/i, 'C.RATE')
		.toUpperCase();
}

export default StatRules;