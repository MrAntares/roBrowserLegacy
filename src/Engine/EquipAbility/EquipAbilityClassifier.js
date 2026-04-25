/*
 * EquipAbility Classifier
 *
 * 역할:
 * - 계산된 능력치를 탭으로 분류
 * - ERROR 라인도 적절한 탭으로 분류
 *
 * Role:
 * - Classifies calculated stats into UI tabs
 * - Sends ERROR lines to the most suitable tab
 *
 * Tabs:
 * total / stat / ability / battle / element / race / skill / special
 */

const Classifier = {};

Classifier.classify = function classify(ctx) {
	const result = ctx.result;

	result.categories.total = [];
	result.categories.stat = [];
	result.categories.ability = [];
	result.categories.battle = [];
	result.categories.element = [];
	result.categories.race = [];
	result.categories.skill = [];
	result.categories.special = [];

	Object.keys(result.total).forEach(key => {
		const stat = result.total[key];
		const category = classifyStat(stat);

		stat.category = category;

		result.categories[category].push(stat);
		result.categories.total.push(stat);
	});
};

function classifyStat(stat) {
	const key = stat.key || '';
	const label = stat.label || '';

	if (key.startsWith('skill') || isSkill(label)) return 'skill';
	if (key.startsWith('race_') || hasRaceKeyword(label)) return 'race';
	if (key.startsWith('element_') || hasElementKeyword(label)) return 'element';

	if (isStatKey(key)) return 'stat';
	if (isAbilityKey(key)) return 'ability';
	if (isBattleKey(key) || hasBattleKeyword(label)) return 'battle';

	return 'special';
}

Classifier.guess = function guess(line) {
	if (hasSkillKeyword(line)) return 'skill';
	if (hasRaceKeyword(line)) return 'race';
	if (hasElementKeyword(line)) return 'element';
	if (hasStatKeyword(line)) return 'stat';
	if (hasAbilityKeyword(line)) return 'ability';
	if (hasBattleKeyword(line)) return 'battle';

	return 'special';
};

function isStatKey(key) {
	return [
		'str', 'agi', 'vit', 'int', 'dex', 'luk',
		'pow', 'sta', 'wis', 'spl', 'con', 'crt',
		'patk', 'smatk', 'res', 'mres', 'crate'
	].includes(key);
}

function isAbilityKey(key) {
	return [
		'atk', 'matk', 'def', 'mdef',
		'hp', 'sp', 'mhp', 'msp',
		'hit', 'flee', 'cri', 'aspd',
		'perfectDodge',
		'afterDelay', 'varCast', 'fixCast', 'gcd'
	].includes(key);
}

function isBattleKey(key) {
	return /damage|ignoreDef|ignoreMdef|size_|melee|range|crit/i.test(key);
}

function isSkill(label) {
	return /\[.*\]|스킬/.test(label);
}

function hasRaceKeyword(text) {
	return /인간|악마|동물|불사|천사|곤충|어류|어패|식물|무형|용족|종족|형 몬스터|족 몬스터/.test(text);
}

function hasElementKeyword(text) {
	return /무속성|수속성|지속성|화속성|풍속성|독속성|성속성|암속성|염속성|불사속성|모든 속성/.test(text);
}

function hasSkillKeyword(text) {
	return /\[.+?\]|스킬/.test(text);
}

function hasStatKeyword(text) {
	return /STR|AGI|VIT|INT|DEX|LUK|POW|STA|WIS|SPL|CON|CRT|P\.ATK|S\.MATK|RES|MRES|C\.RATE|C\.Rate/i.test(text);
}

function hasAbilityKeyword(text) {
	return /(^|[^A-Z.])(ATK|MATK|DEF|MDEF|HP|SP|MHP|MSP|MAXHP|MAXSP|HIT|FLEE|CRI|ASPD)\b|완전회피|캐스팅|쿨타임|후딜레이|공격속도/i.test(text);
}

function hasBattleKeyword(text) {
	return /원거리|근접|크리티컬 데미지|크리 데미지|소형|중형|대형|모든 크기|방어 무시|방어력 무시|마법 방어 무시|마법 방어력 무시|관통|물리 데미지|마법 데미지/.test(text);
}

export default Classifier;