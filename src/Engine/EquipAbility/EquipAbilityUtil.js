/*
 * EquipAbility Util
 *
 * 공통 유틸 함수
 * Common utility functions
 *
 * 역할:
 * - 문자열 정리
 * - 숫자 추출
 * - 값/단위 파싱
 * - 스킬명 정리
 * - 배열 중복 제거
 *
 * Role:
 * - Normalize text
 * - Extract numbers
 * - Parse value/unit
 * - Clean skill names
 * - Remove duplicates from arrays
 */

const Util = {};

/* =========================================================
 * 문자열 정리
 * Text normalization
 * ========================================================= */

Util.normalize = function normalize(line) {
	if (!line) return '';

	return String(line)
		// RO 색상 코드 제거
		// Remove RO color codes
		.replace(/\^[0-9A-Fa-f]{6}/g, '')
		.replace(/\^000000/g, '')

		// 따옴표 제거
		// Remove quotes
		.replace(/[“”"]/g, '')

		// 특수 공백 정리
		// Normalize special spaces
		.replace(/\u00A0/g, ' ')

		// 불필요 공백 제거
		// Remove duplicate spaces
		.replace(/\s+/g, ' ')
		.trim();
};

/**
 * 불필요 단어 제거
 * Remove common filler words
 */
Util.normalizeKeyword = function normalizeKeyword(text) {
	if (!text) return '';

	return String(text)
		.replace(/몬스터/g, '')
		.replace(/적/g, '')
		.replace(/에게/g, '')
		.replace(/으로부터/g, '')
		.replace(/의/g, '')
		.replace(/종족/g, '')
		.replace(/형/g, '')
		.replace(/\s+/g, ' ')
		.trim();
};

/* =========================================================
 * 숫자 추출
 * Number extraction
 * ========================================================= */

/**
 * 첫 번째 숫자 추출
 * Extract first number
 */
Util.extractNumber = function extractNumber(text) {
	const m = String(text).match(/-?\d+(?:\.\d+)?/);
	return m ? Number(m[0]) : 0;
};

/**
 * 퍼센트 숫자 추출
 * Extract percent number
 */
Util.extractPercent = function extractPercent(text) {
	const m = String(text).match(/-?\d+(?:\.\d+)?(?=\s*%)/);
	return m ? Number(m[0]) : 0;
};

/**
 * 초 단위 숫자 추출
 * Extract seconds value
 */
Util.extractSeconds = function extractSeconds(text) {
	const m = String(text).match(/-?\d+(?:\.\d+)?(?=\s*초)/);
	return m ? Number(m[0]) : 0;
};

/**
 * 모든 숫자 추출
 * Extract all numbers
 */
Util.extractAllNumbers = function extractAllNumbers(text) {
	const matches = String(text).match(/-?\d+(?:\.\d+)?/g);
	return matches ? matches.map(Number) : [];
};

/* =========================================================
 * 값 파싱
 * Value parsing
 * ========================================================= */

/**
 * 값 + 단위 파싱
 * Parse value and unit
 */
Util.parseValue = function parseValue(text) {
	text = String(text || '');

	if (/%/.test(text)) {
		return {
			value: Util.extractPercent(text),
			unit: '%'
		};
	}

	if (/초/.test(text)) {
		return {
			value: Util.extractSeconds(text),
			unit: '초'
		};
	}

	return {
		value: Util.extractNumber(text),
		unit: ''
	};
};

/**
 * 증가/감소 부호 판별
 * Parse increase/decrease sign
 */
Util.parseSign = function parseSign(text) {
	if (/감소|하락|줄어/.test(text)) return -1;
	return 1;
};

/**
 * 부호 적용
 * Apply sign to value
 */
Util.applySign = function applySign(text, value) {
	const sign = Util.parseSign(text);
	return sign < 0 ? -Math.abs(value) : value;
};

/* =========================================================
 * 스킬 이름 처리
 * Skill name helpers
 * ========================================================= */

/**
 * 스킬명 정리
 * Clean skill name
 */
Util.cleanSkillName = function cleanSkillName(text) {
	return String(text || '')
		.replace(/\[/g, '')
		.replace(/\]/g, '')
		.replace(/^\s*,?\s*/g, '')
		.replace(/\s+/g, ' ')
		.trim();
};

/**
 * 스킬처럼 보이는지 판별
 * Check whether text looks like a skill name
 */
Util.isSkillLike = function isSkillLike(text) {
	if (!text) return false;

	if (/원거리|근접|물리|마법|크리티컬|속성|종족|크기|ATK|MATK|DEF|MDEF/i.test(text)) {
		return false;
	}

	return String(text).trim().length >= 2;
};

/* =========================================================
 * 배열 / 중복 처리
 * Array / duplicate helpers
 * ========================================================= */

/**
 * 중복 제거
 * Remove duplicate values
 */
Util.unique = function unique(arr) {
	const seen = {};
	const out = [];

	(arr || []).forEach(v => {
		const key = String(v);

		if (!key || seen[key]) return;

		seen[key] = true;
		out.push(v);
	});

	return out;
};

/* =========================================================
 * 기타
 * Misc
 * ========================================================= */

/**
 * HTML escape
 * Escape HTML
 */
Util.escapeHtml = function escapeHtml(str) {
	return String(str).replace(/[&<>"']/g, ch => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	}[ch]));
};

/**
 * 빈 문자열 체크
 * Check empty string
 */
Util.isEmpty = function isEmpty(text) {
	return !text || !String(text).trim();
};

export default Util;