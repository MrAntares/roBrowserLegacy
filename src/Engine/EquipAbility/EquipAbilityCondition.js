/*
 * EquipAbility Condition Engine
 *
 * 조건 처리 엔진
 * Condition processing engine
 *
 * 핵심:
 * - 함께 장착 조건 실제 체크
 * - 제련도의 합 조건 실제 체크
 * - 모르는 조건은 true 처리하지 않음
 *
 * Core:
 * - Check equip-with conditions
 * - Check total refine conditions
 * - Unknown conditions are not treated as true
 */

const Condition = {};

/*
 * 조건 추출
 * Extract condition
 */
Condition.extract = function extract(line) {
	const cond = makeCondition('none');

	let m;

	// =====================================================
	// 1. 제련당 / Refine per step
	// 예: 3제련당, 2제련 당, 무기 3제련 당
	// Example: every 3 refine
	// =====================================================
	m = line.match(/(?:무기\s*)?(\d+)\s*제련\s*(?:당|마다|시\s*마다)/);
	if (m) {
		const step = Number(m[1]);

		return makeCondition('refine_each', {
			check: (ctx) => (ctx.refine || 0) >= step,
			multiplier: (ctx) => Math.floor((ctx.refine || 0) / step)
		});
	}

	m = line.match(/제련도\s*(\d+)\s*당/);
	if (m) {
		const step = Number(m[1]);

		return makeCondition('refine_each', {
			check: (ctx) => (ctx.refine || 0) >= step,
			multiplier: (ctx) => Math.floor((ctx.refine || 0) / step)
		});
	}

	// =====================================================
	// 2. 제련도의 합 / Total refine condition
	// 예: 제련도의 합이 18제련 이상인 경우
	// Example: total refine is 18 or higher
	// =====================================================
    m = line.match(/제련도(?:의)?\s*합(?:이)?\s*(\d+)\s*제련?\s*(이상|미만|초과|이하)?/);
    if (m) {
    	const need = Number(m[1]);
	    const type = m[2] || '이상';

	    return makeCondition('total_refine', {
		    check: (ctx) => {
			    const base = ctx.activeEquipCondition || null;
		    	const target = base && base.target ? base.target : '';

			    return compareNumber(getSetRefineTotal(ctx, target), need, type);
    		}
	    });
    }
	// =====================================================
	// 3. 제련 미만 / Refine below
	// Must be checked before refine at least
	// =====================================================
	m = line.match(/(\d+)\s*제련\s*미만|(\d+)\s*미만\s*제련/);
	if (m) {
		const need = Number(m[1] || m[2]);

		return makeCondition('refine_below', {
			check: (ctx) => (ctx.refine || 0) < need
		});
	}

	// =====================================================
	// 4. 제련 초과 / Refine over
	// =====================================================
	m = line.match(/(\d+)\s*제련\s*초과|(\d+)\s*초과\s*제련/);
	if (m) {
		const need = Number(m[1] || m[2]);

		return makeCondition('refine_over', {
			check: (ctx) => (ctx.refine || 0) > need
		});
	}

	// =====================================================
	// 5. 제련 이상 / Refine at least
	// =====================================================
	m = line.match(/(\d+)\s*(?:이상\s*)?제련\s*(?:시|이상|일\s*경우)?|(\d+)\s*이상\s*제련/);
	if (m) {
		const need = Number(m[1] || m[2]);

		return makeCondition('refine_at_least', {
			check: (ctx) => (ctx.refine || 0) >= need
		});
	}

	// =====================================================
	// 6. 등급 조건 / Grade condition
	// =====================================================
	m = line.match(/\[?([DCBA])등급\]?\s*(이상|미만|초과|이하)?/);
	if (m) {
		const grade = m[1];
		const type = m[2] || '이상';
		const gradeNum = gradeToNumber(grade);

		return makeCondition('grade', {
			check: (ctx) => compareNumber(ctx.grade || 0, gradeNum, type)
		});
	}

	// =====================================================
	// 7. BaseLv / 캐릭터 레벨 조건
	// Base level / character level condition
	// =====================================================
	m = line.match(/(?:BaseLv|베이스\s*레벨|캐릭터\s*레벨)\s*(\d+)\s*(이상|미만|초과|이하)/);
	if (m) {
		const level = Number(m[1]);
		const type = m[2];

		return makeCondition('level', {
			check: (ctx) => compareNumber(ctx.baseLevel || 0, level, type)
		});
	}

	// =====================================================
	// 8. 순수 스탯 조건 / Pure stat condition
	// 예: 순수 LUK 90 이상인 경우
	// Example: pure LUK 90 or higher
	// =====================================================
	m = line.match(/순수\s*(STR|AGI|VIT|INT|DEX|LUK)\s*(\d+)\s*(이상|미만|초과|이하)/i);
	if (m) {
		const stat = m[1].toLowerCase();
		const need = Number(m[2]);
		const type = m[3];

		return makeCondition('pure_stat', {
			check: (ctx) => compareNumber(getCharacterStat(stat), need, type)
		});
	}

	// =====================================================
	// 9. BaseLv n당 / Base level per step
	// =====================================================
	m = line.match(/(?:BaseLv|베이스\s*레벨)\s*(\d+)\s*(?:당|마다)/);
	if (m) {
		const step = Number(m[1]);

		return makeCondition('level_each', {
			check: (ctx) => (ctx.baseLevel || 0) >= step,
			multiplier: (ctx) => Math.floor((ctx.baseLevel || 0) / step)
		});
	}
	// =====================================================
	// 무기/방어구 레벨 조건
	// Weapon / armor level condition
	// 예: 5레벨 무기인 경우, 2레벨 방어구인 경우
	// Example: if it is a level 5 weapon / level 2 armor
	// =====================================================
	m = line.match(/(\d+)\s*레벨\s*(무기|방어구)(?:인\s*)?(?:경우|시|일\s*때)/);
	if (m) {
		const need = Number(m[1]);
		const targetType = m[2];

		return makeCondition('equip_level', {
			check: (ctx) => checkEquipLevel(ctx, targetType, need)
		});
	}

	// =====================================================
	// 제련도 합의 n배만큼
	// Total refine multiplied value
	// 예: 제련도 합의 2배만큼 샤프 슈팅 데미지 % 증가
	// Example: increase by total refine x 2
	// =====================================================
	m = line.match(/제련도\s*합(?:의)?\s*(\d+)\s*배만큼/);
	if (m) {
		const mult = Number(m[1]);

		return makeCondition('total_refine_multiplier', {
			multiplier: (ctx) => getSetRefineTotal(ctx, getActiveSetTarget(ctx)) * mult,
			check: (ctx) => getSetRefineTotal(ctx, getActiveSetTarget(ctx)) > 0
		});
	}

	// =====================================================
	// 세트 대상 아이템 등급 조건
	// Set target item grade condition
	// 예: 타임 디멘션즈 룬 크라운(윈드호크)의 등급이 각 A등급 이상일 경우
	// Example: if both current item and target item are A grade or higher
	// =====================================================
	m = line.match(/(.+?)의\s*등급이\s*각\s*([DCBA])등급\s*(이상|미만|초과|이하)?(?:일\s*)?(?:경우|시)?/);
	if (m) {
		const targetName = normalizeItemName(m[1]);
		const grade = gradeToNumber(m[2]);
		const type = m[3] || '이상';

		return makeCondition('set_target_grade', {
			target: targetName,
			check: (ctx) => checkSetTargetGrade(ctx, targetName, grade, type)
		});
	}

	// =====================================================
	// 대괄호 없는 스킬 레벨당
	// Skill level per step without brackets
	// 예: 크로스 리퍼 슬래셔 1레벨 당 원거리 물리 데미지 2% 증가
	// Example: Cross Ripper Slasher per 1 level
	// =====================================================
	m = line.match(/^(.+?)\s*(\d+)\s*레벨\s*(?:당|마다)/);
	if (m && !/BaseLv|베이스\s*레벨|캐릭터\s*레벨|무기|방어구/.test(m[1])) {
		const skill = normalizeItemName(m[1]);
		const step = Number(m[2]);

		return makeCondition('skill_each', {
			target: skill,
			check: (ctx) => {
				const lv = getSkillLevel(ctx, skill);
				return lv >= step;
			},
			multiplier: (ctx) => {
				const lv = getSkillLevel(ctx, skill);
				return Math.floor(lv / step);
			}
		});
	}
	// =====================================================
	// 10. 스킬 레벨당 / Per skill level
	// =====================================================
	m = line.match(/\[([^\]]+)\]\s*(\d+)레벨당/);
	if (m) {
		const skill = normalizeItemName(m[1]);
		const step = Number(m[2]);

		return makeCondition('skill_each', {
			check: (ctx) => {
				const lv = getSkillLevel(ctx, skill);
				return lv >= step;
			},
			multiplier: (ctx) => {
				const lv = getSkillLevel(ctx, skill);
				return Math.floor(lv / step);
			}
		});
	}

	// =====================================================
	// 11. 스킬 레벨 조건 / Skill level condition
	// =====================================================
	m = line.match(/\[([^\]]+)\]\s*(\d+)레벨.*(?:일\s*시|일\s*때|경우)/);
	if (m) {
		const skill = normalizeItemName(m[1]);
		const need = Number(m[2]);

		return makeCondition('skill_at_least', {
			check: (ctx) => getSkillLevel(ctx, skill) >= need
		});
	}

	// =====================================================
	// 12. 함께 장착 / 함께 착용 조건
	// Equip with / set condition
	// 예: 갬블러의 씰[1]과 착용 시
	// Example: when equipped with Gambler Seal [1]
	// =====================================================
	m = line.match(/(.+?)(?:와|과)\s*(?:함께\s*)?(?:장착|착용)\s*(?:시|일\s*시|일\s*때|경우)/);
	if (m) {
		const itemName = normalizeItemName(m[1]);

		return makeCondition('equip_with', {
			target: itemName,
			check: (ctx) => hasEquippedItem(ctx, itemName)
		});
	}

	// =====================================================
	// 13. 세트 효과 / Set effect
	// 정확한 세트 조건을 모르면 적용하지 않음
	// If set condition cannot be verified, do not apply
	// =====================================================
	if (/세트\s*효과|세트\s*시|세트시/.test(line)) {
		return makeCondition('unknown_set', {
			check: () => false
		});
	}

	// =====================================================
	// 14. 일반 조건문 / Generic unknown condition
	// 모르는 조건은 true 처리하지 않음
	// Unknown conditions are not treated as true
	// =====================================================
	if (/(일\s*시|일\s*때|경우)/.test(line)) {
		return makeCondition('unknown_condition', {
			check: () => false
		});
	}

	return cond;
};

/*
 * 조건 제거
 * Strip condition text from line
 */
Condition.strip = function strip(line) {
	return String(line || '')
		// Refine each
		.replace(/^\s*(?:무기\s*)?\d+\s*제련\s*(?:당|마다|시\s*마다)\s*[:,]?\s*/g, '')
		.replace(/^\s*제련도\s*\d+\s*당\s*[:,]?\s*/g, '')

		// Total refine
		.replace(/^\s*제련도(?:의)?\s*합(?:이)?\s*\d+\s*제련?\s*(?:이상|미만|초과|이하)?(?:인\s*)?(?:경우|시)?\s*[:,]?\s*/g, '')

		// Refine below / over / at least
		.replace(/^\s*\d+\s*제련\s*(?:미만|초과|이상|시|일\s*경우)\s*[:,]?\s*/g, '')
		.replace(/^\s*\d+\s*(?:미만|초과|이상)\s*제련\s*(?:시)?\s*[:,]?\s*/g, '')

		// Grade
		.replace(/^\s*\[?[DCBA]등급\]?\s*(?:이상|미만|초과|이하|일\s*경우|인\s*경우)?\s*[:,]?\s*/g, '')

		// Level
		.replace(/^\s*(?:BaseLv|베이스\s*레벨|캐릭터\s*레벨)\s*\d+\s*(?:이상|미만|초과|이하)\s*[:,]?\s*/g, '')
		.replace(/^\s*(?:BaseLv|베이스\s*레벨)\s*\d+\s*(?:당|마다)\s*[:,]?\s*/g, '')

		// Pure stat
		.replace(/^\s*순수\s*(?:STR|AGI|VIT|INT|DEX|LUK)\s*\d+\s*(?:이상|미만|초과|이하)(?:인\s*)?(?:경우|시)?\s*[:,]?\s*/ig, '')
		// Weapon / armor level
		.replace(/^\s*\d+\s*레벨\s*(?:무기|방어구)(?:인\s*)?(?:경우|시|일\s*때)\s*[:,]?\s*/g, '')

		// Total refine multiplier
		.replace(/^\s*제련도\s*합(?:의)?\s*\d+\s*배만큼\s*/g, '')

		// Set target grade
		.replace(/^\s*.+?의\s*등급이\s*각\s*[DCBA]등급\s*(?:이상|미만|초과|이하)?(?:일\s*)?(?:경우|시)?\s*[:,]?\s*/g, '')

		// Skill level without brackets
		.replace(/^\s*.+?\s*\d+\s*레벨\s*(?:당|마다)\s*/g, '')

		// Skill level
		.replace(/^\s*\[[^\]]+\]\s*\d+레벨당\s*/g, '')
		.replace(/^\s*\[[^\]]+\]\s*\d+레벨.*(?:일\s*시|일\s*때|경우)\s*[:,]?\s*/g, '')

		// Equip with
		.replace(/^\s*.+?(?:와|과)\s*(?:함께\s*)?(?:장착|착용)\s*(?:시|일\s*시|일\s*때|경우)\s*[:,]?\s*/g, '')

		.trim();
};

/*
 * 조건 적용
 * Apply condition
 */
Condition.apply = function apply(ctx, condition, baseValue) {
	if (!condition || condition.type === 'none') {
		return baseValue;
	}

	if (!condition.check(ctx)) return 0;

	const multiplier = condition.multiplier(ctx) || 1;
	return baseValue * multiplier;
};

/*
 * 조건 객체 생성
 * Create condition object
 */
function makeCondition(type, opt) {
	opt = opt || {};

	return {
		type,
		target: opt.target || '',
		check: opt.check || (() => true),
		multiplier: opt.multiplier || (() => 1)
	};
}

/*
 * 숫자 비교
 * Numeric comparison
 */
function compareNumber(current, need, type) {
	current = Number(current || 0);
	need = Number(need || 0);

	if (type === '미만') return current < need;
	if (type === '초과') return current > need;
	if (type === '이하') return current <= need;

	return current >= need;
}

/*
 * 총 제련도
 * Total refine level
 */
function getSetRefineTotal(ctx, targetName) {
	let total = Number(ctx.currentItem?.RefiningLevel || ctx.currentItem?.Refine || 0);

	targetName = normalizeItemName(targetName);

	if (!targetName) {
		return total;
	}

	(ctx.equipList || []).forEach(item => {
		if (!item || item === ctx.currentItem || !item.ITID) return;

		const info = ctx.DB.getItemInfo(item.ITID);
		if (!info) return;

		const names = [
			info.identifiedDisplayName,
			info.identifiedName,
			info.Name,
			info.name
		].map(normalizeItemName);

		if (names.some(name => name === targetName || name.includes(targetName) || targetName.includes(name))) {
			total += Number(item.RefiningLevel || item.Refine || 0);
		}
	});

	return total;
}

/*
 * =========================================================
 * HELPER FUNCTIONS
 * =========================================================
 * 공통 헬퍼 함수 모음
 * Shared helper utilities
 *
 * 역할:
 * - 장착 아이템 확인
 * - 스킬 레벨 조회
 * - 캐릭터 스탯 조회
 * - 이름 정규화
 * - 등급 변환
 * - 세트 아이템 탐색 / 조건 검사
 *
 * Role:
 * - Check equipped items
 * - Get skill levels
 * - Get character stats
 * - Normalize names
 * - Convert grades
 * - Handle set item logic
 * =========================================================
 */


/*
 * 장착 아이템 확인
 * Check equipped item by name
 *
 * targetName과 일치하거나 포함되는 장착 아이템이 있는지 확인
 * Checks if an equipped item matches or includes the target name
 */
function hasEquippedItem(ctx, targetName) {
	targetName = normalizeItemName(targetName);
	if (!targetName) return false;

	const names = ctx.equippedItems || [];

	return names.some(name => {
		name = normalizeItemName(name);
		return name === targetName || name.includes(targetName) || targetName.includes(name);
	});
}


/*
 * 스킬 레벨 가져오기
 * Get skill level
 *
 * 스킬명 기준으로 현재 캐릭터의 스킬 레벨 반환
 * Returns current skill level of the character
 */
function getSkillLevel(ctx, skillName) {
	skillName = normalizeItemName(skillName);

	if (!ctx.skillLevels) return 0;

	return ctx.skillLevels[skillName] ||
		ctx.skillLevels['[' + skillName + ']'] ||
		0;
}


/*
 * 캐릭터 순수 스탯 가져오기
 * Get character base stat
 *
 * Session.Character에서 STR/AGI 등 기본 스탯을 가져옴
 * Retrieves base stats from Session.Character
 */
function getCharacterStat(stat) {
	if (typeof window === 'undefined') return 0;

	const ch = window.Session?.Character;
	if (!ch) return 0;

	const map = {
		str: 'Str',
		agi: 'Agi',
		vit: 'Vit',
		int: 'Int',
		dex: 'Dex',
		luk: 'Luk'
	};

	return Number(ch[map[stat]] || ch[stat] || 0);
}


/*
 * 아이템/스킬 이름 정규화
 * Normalize item/skill names
 *
 * 색상코드 제거 + 공백 정리
 * 슬롯 표기 [1], [2]는 유지
 *
 * Removes color codes and trims spaces
 * Keeps slot text like [1], [2]
 */
function normalizeItemName(name) {
	return String(name || '')
		.replace(/\^[0-9A-Fa-f]{6}/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}


/*
 * 등급 문자 → 숫자 변환
 * Convert grade letter to number
 *
 * D=1, C=2, B=3, A=4
 */
function gradeToNumber(g) {
	return {
		D: 1,
		C: 2,
		B: 3,
		A: 4
	}[g] || 0;
}


/*
 * 활성 세트 대상 아이템 가져오기
 * Get active set target item name
 *
 * 현재 equip_with 조건으로 활성화된 대상 아이템 반환
 * Returns the active set item from equip condition
 */
function getActiveSetTarget(ctx) {
	const base = ctx.activeEquipCondition || null;
	return base && base.target ? base.target : '';
}


/*
 * 장비 레벨 조건 검사
 * Check weapon/armor level condition
 *
 * n레벨 무기/방어구 조건 처리
 * Handles "level N weapon/armor" conditions
 */
function checkEquipLevel(ctx, targetType, need) {
	const item = ctx.currentItem;
	if (!item || !item.ITID || !ctx.DB) return false;

	const info = ctx.DB.getItemInfo(item.ITID);
	if (!info) return false;

	const type = String(info.Type || info.type || '').toLowerCase();

	if (targetType === '무기') {
		if (type && type !== 'weapon') return false;

		const weaponLevel =
			Number(info.WeaponLevel || info.weaponLevel || item.WeaponLevel || item.weaponLevel || 0);

		return weaponLevel === need;
	}

	if (targetType === '방어구') {
		const armorLevel =
			Number(info.ArmorLevel || info.armorLevel || info.ArmorLv || info.armorLv || item.ArmorLevel || item.armorLevel || 0);

		return armorLevel === need;
	}

	return false;
}


/*
 * 세트 대상 아이템 등급 조건 검사
 * Check set target item grade condition
 *
 * 현재 아이템 + 대상 아이템 둘 다 등급 조건 만족해야 true
 * Both current item and target item must satisfy grade condition
 */
function checkSetTargetGrade(ctx, targetName, needGrade, compareType) {
	const currentGrade = Number(ctx.currentItem?.enchantgrade || ctx.currentItem?.Grade || 0);

	if (!compareNumber(currentGrade, needGrade, compareType)) {
		return false;
	}

	const targetItem = findEquippedItemByName(ctx, targetName || getActiveSetTarget(ctx));
	if (!targetItem) return false;

	const targetGrade = Number(targetItem.enchantgrade || targetItem.Grade || 0);

	return compareNumber(targetGrade, needGrade, compareType);
}


/*
 * 장착된 아이템 중 이름으로 찾기
 * Find equipped item by name
 *
 * 이름 비교(완전일치 / 포함)로 장착 아이템 검색
 * Finds an equipped item by matching name
 */
function findEquippedItemByName(ctx, targetName) {
	targetName = normalizeItemName(targetName);
	if (!targetName) return null;

	for (let i = 0; i < (ctx.equipList || []).length; i++) {
		const item = ctx.equipList[i];
		if (!item || !item.ITID || item === ctx.currentItem) continue;

		const info = ctx.DB.getItemInfo(item.ITID);
		if (!info) continue;

		const names = [
			info.identifiedDisplayName,
			info.identifiedName,
			info.Name,
			info.name
		].map(normalizeItemName);

		if (names.some(name => name === targetName || name.includes(targetName) || targetName.includes(name))) {
			return item;
		}
	}

	return null;
}

export default Condition;