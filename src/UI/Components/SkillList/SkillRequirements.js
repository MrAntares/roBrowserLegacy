import { BuiltInTreeGroup } from 'DB/Skills/SkillTreeMerge.js';

function getOwnedSkill(ownedSkills, skillId) {
	return ownedSkills?.get?.(skillId) ?? ownedSkills?.[skillId] ?? null;
}

function getOwnedLevel(ownedSkills, skillId) {
	return getOwnedSkill(ownedSkills, skillId)?.level ?? 0;
}

function getJobLineage(jobId, skillTreeView) {
	const lineage = [];
	const visited = new Set();
	let currentJobId = jobId;

	while (currentJobId != null && !visited.has(currentJobId)) {
		visited.add(currentJobId);
		lineage.push(currentJobId);

		const tree = skillTreeView[currentJobId];
		if (!tree || tree.beforeJob == null) {
			break;
		}
		currentJobId = tree.beforeJob;
	}

	return lineage;
}

/**
 * Find which of candidateJobIds applies to the character's job: the first one
 * met walking up the job's lineage (the job, then the job before it, and so
 * on). An alias matches its canonical job's entry: aliased jobs share one
 * tree object in SkillTreeView, and, once a reset or a client file has given
 * each its own copy, the same group in treeGroup. Returns the matching
 * candidate as given, or undefined.
 */
export function findLineageJob(candidateJobIds, jobId, skillTreeView, treeGroup = BuiltInTreeGroup) {
	const candidates = Array.from(candidateJobIds, String);

	for (const lineageJobId of getJobLineage(jobId, skillTreeView)) {
		if (candidates.includes(String(lineageJobId))) {
			return String(lineageJobId);
		}

		const lineageTree = skillTreeView[lineageJobId];
		const lineageGroup = treeGroup[lineageJobId];
		const canonicalJobId = candidates.find(
			candidateJobId =>
				(lineageTree && skillTreeView[candidateJobId] === lineageTree) ||
				(lineageGroup !== undefined && treeGroup[candidateJobId] === lineageGroup)
		);
		if (canonicalJobId !== undefined) {
			return canonicalJobId;
		}
	}

	return undefined;
}

/**
 * Resolve the requirements that apply to a skill for the active character job.
 * Job-specific entries override the generic list, including explicit empty
 * overrides.
 */
export function resolveSkillRequirements(skill, jobId, skillTreeView) {
	if (!skill) {
		return [];
	}

	const jobRequirements = skill.NeedSkillList;
	if (jobRequirements) {
		const lineageJobId = findLineageJob(Object.keys(jobRequirements), jobId, skillTreeView);
		if (lineageJobId !== undefined) {
			return jobRequirements[lineageJobId];
		}
	}

	return skill._NeedSkillList ?? [];
}

function clonePlan(plan) {
	return new Map(Array.from(plan, ([skillId, choice]) => [skillId, { ...choice }]));
}

function calculatePlanCost(plan, ownedSkills) {
	let cost = 0;
	for (const [skillId, choice] of plan) {
		if (!choice.isQuest) {
			cost += Math.max(0, choice.count - getOwnedLevel(ownedSkills, skillId));
		}
	}
	return cost;
}

function getPlannedLevel(plan, ownedSkills, skillId) {
	return Math.max(plan.get(skillId)?.count ?? 0, getOwnedLevel(ownedSkills, skillId));
}

/**
 * Build a complete candidate plan for one more level of skillId. The input
 * plan is never mutated. A null result means the complete prerequisite chain
 * is invalid or cannot be afforded.
 */
export function stageSkillPlan({ plan, skillId, ownedSkills, skillInfo, skillTreeView, jobId, availablePoints }) {
	const candidate = clonePlan(plan);
	const visiting = new Set();

	const stage = (currentSkillId, requiredLevel = null) => {
		const info = skillInfo[currentSkillId];
		if (!info || visiting.has(currentSkillId)) {
			return false;
		}

		const ownedLevel = getOwnedLevel(ownedSkills, currentSkillId);
		const isUnownedQuest = info.Type === 'Quest' && ownedLevel <= 0;
		if (isUnownedQuest) {
			return requiredLevel == null;
		}

		const currentLevel = Math.max(candidate.get(currentSkillId)?.count ?? 0, ownedLevel);
		const targetLevel =
			requiredLevel == null ? Math.min(currentLevel + 1, info.MaxLv) : Math.max(currentLevel, requiredLevel);
		if (targetLevel > info.MaxLv) {
			return false;
		}

		candidate.set(currentSkillId, {
			count: targetLevel,
			isQuest: false
		});

		visiting.add(currentSkillId);
		for (const [requiredSkillId, level] of resolveSkillRequirements(info, jobId, skillTreeView)) {
			if (!stage(requiredSkillId, level)) {
				visiting.delete(currentSkillId);
				return false;
			}
		}
		visiting.delete(currentSkillId);
		return true;
	};

	if (!stage(skillId)) {
		return null;
	}

	const cost = calculatePlanCost(candidate, ownedSkills);
	if (cost > availablePoints) {
		return null;
	}

	return { plan: candidate, cost };
}

function validateSkillPlan({ plan, ownedSkills, skillInfo, skillTreeView, jobId, availablePoints }) {
	if (calculatePlanCost(plan, ownedSkills) > availablePoints) {
		return false;
	}

	for (const [skillId, choice] of plan) {
		const info = skillInfo[skillId];
		const ownedLevel = getOwnedLevel(ownedSkills, skillId);
		if (!info || choice.count < ownedLevel || choice.count > info.MaxLv) {
			return false;
		}

		for (const [requiredSkillId, requiredLevel] of resolveSkillRequirements(info, jobId, skillTreeView)) {
			if (getPlannedLevel(plan, ownedSkills, requiredSkillId) < requiredLevel) {
				return false;
			}
		}
	}

	return true;
}

/**
 * Return one skill id per upgrade packet, ordered so every prerequisite is
 * upgraded before its dependants. A null result means the staged plan is no
 * longer valid against the authoritative skill state.
 */
export function createSkillUpgradeOrder(options) {
	if (!validateSkillPlan(options)) {
		return null;
	}

	const { plan, ownedSkills, skillInfo, skillTreeView, jobId } = options;
	const order = [];
	const visited = new Set();
	const visiting = new Set();

	const visit = skillId => {
		if (visited.has(skillId)) {
			return true;
		}
		if (visiting.has(skillId)) {
			return false;
		}

		const info = skillInfo[skillId];
		if (!info) {
			return false;
		}

		visiting.add(skillId);
		for (const [requiredSkillId] of resolveSkillRequirements(info, jobId, skillTreeView)) {
			if (plan.has(requiredSkillId) && !visit(requiredSkillId)) {
				return false;
			}
		}
		visiting.delete(skillId);
		visited.add(skillId);

		const count = plan.get(skillId)?.count ?? getOwnedLevel(ownedSkills, skillId);
		const upgrades = Math.max(0, count - getOwnedLevel(ownedSkills, skillId));
		for (let i = 0; i < upgrades; i++) {
			order.push(skillId);
		}
		return true;
	};

	for (const skillId of plan.keys()) {
		if (!visit(skillId)) {
			return null;
		}
	}

	return order;
}
