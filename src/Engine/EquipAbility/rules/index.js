/*
 * EquipAbility Rules Index
 *
 * 역할:
 * - 모든 Rule 파일을 하나로 통합
 * - Parser에서 한 번에 import 가능
 */

import StatRules from './StatRules.js';
import AbilityRules from './AbilityRules.js';
import BattleRules from './BattleRules.js';
import ElementRules from './ElementRules.js';
import RaceRules from './RaceRules.js';
import SkillRules from './SkillRules.js';
import SpecialRules from './SpecialRules.js';

const RULES = [
	...StatRules,
	...AbilityRules,
	...BattleRules,
	...ElementRules,
	...RaceRules,
	...SkillRules,
	...SpecialRules
];

export default RULES;