/**
 * DB/Skills/SkillTreeMerge.js
 *
 * Merge a client's skilltreeview.lub with the built-in SkillTreeView.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import SkillTreeView from './SkillTreeView.js';

const isSkill = key => /^\d+$/.test(key);

/**
 * The built-in layout, copied when this module is first evaluated: before any
 * client's skilltreeview.lub has replaced an entry of SkillTreeView. Loading a
 * second client (a server switch) must start from this, not from what the
 * first client's file left behind.
 */
const BuiltInSkillTreeView = Object.freeze(
	Object.fromEntries(Object.entries(SkillTreeView).map(([jobId, entry]) => [jobId, Object.freeze({ ...entry })]))
);

/**
 * Jobs that share one tree in the built-in layout, such as a baby job and the
 * job it copies, each mapped to the first job of its group. Read from
 * SkillTreeView's shared objects before anything replaces an entry: a reset
 * and a client file both give every job its own copy, so after either the
 * shared object can no longer tell an alias from its job.
 */
const BuiltInTreeGroup = (() => {
	const first = new Map();
	const group = {};
	for (const [jobId, entry] of Object.entries(SkillTreeView)) {
		if (!first.has(entry)) {
			first.set(entry, jobId);
		}
		group[jobId] = first.get(entry);
	}
	return Object.freeze(group);
})();

/**
 * Put the tree back to the built-in layout, dropping every job and position a
 * previously loaded client file added.
 *
 * @param {object} tree - SkillTreeView, changed in place
 * @param {object} [builtIn] - the layout to restore
 */
function resetSkillTree(tree, builtIn = BuiltInSkillTreeView) {
	for (const jobId of Object.keys(tree)) {
		if (!(jobId in builtIn)) {
			delete tree[jobId];
		}
	}
	for (const [jobId, entry] of Object.entries(builtIn)) {
		tree[jobId] = { ...entry };
	}
}

/**
 * For each job a client file defined, put back the built-in position of any
 * skill the file leaves out, or the next free slot when the file has taken
 * that one. Positions the file set are never moved.
 *
 * @param {object} tree - SkillTreeView after the file was read, changed in place
 * @param {Iterable} jobIds - the jobs the file defined
 * @param {object} [builtIn] - the built-in layout
 */
function keepBuiltInSkills(tree, jobIds, builtIn = BuiltInSkillTreeView) {
	for (const jobId of jobIds) {
		const entry = tree[jobId];
		const base = builtIn[jobId];
		if (!entry || !base) {
			continue;
		}
		const taken = new Set(
			Object.keys(entry)
				.filter(isSkill)
				.map(key => entry[key])
		);
		let next = Math.max(-1, ...taken) + 1;
		for (const [skillId, pos] of Object.entries(base)) {
			if (!isSkill(skillId) || skillId in entry) {
				continue;
			}
			let slot = pos;
			if (taken.has(slot)) {
				while (taken.has(next)) {
					next++;
				}
				slot = next;
			}
			entry[skillId] = slot;
			taken.add(slot);
		}
	}
}

export { BuiltInSkillTreeView, BuiltInTreeGroup, resetSkillTree, keepBuiltInSkills };
