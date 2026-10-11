import { describe, it, expect } from 'vitest';

import SkillTreeView from 'DB/Skills/SkillTreeView.js';
import { BuiltInSkillTreeView, resetSkillTree, keepBuiltInSkills } from 'DB/Skills/SkillTreeMerge.js';

// Synthetic layouts: job 1 places skills 100-102, job 2 places skill 200.
const builtIn = {
	1: { list: 4, beforeJob: null, 100: 0, 101: 1, 102: 5 },
	2: { list: 4, beforeJob: 1, 200: 3 }
};

// What AddSkillTreeView and AddSkillToJob leave for a client file.
function loadFile(tree, file) {
	const jobs = new Set();
	for (const [jobId, skills] of Object.entries(file)) {
		jobs.add(jobId);
		tree[jobId] = { list: 4, beforeJob: null, ...skills };
	}
	return jobs;
}

describe('keepBuiltInSkills', () => {
	it('puts back a skill the file leaves out, at its built-in slot', () => {
		const tree = {};
		resetSkillTree(tree, builtIn);
		const jobs = loadFile(tree, { 1: { 100: 0, 101: 1 } });
		keepBuiltInSkills(tree, jobs, builtIn);
		expect(tree[1][102]).toBe(5);
	});

	it('uses the next free slot when the file has taken the built-in one', () => {
		const tree = {};
		resetSkillTree(tree, builtIn);
		const jobs = loadFile(tree, { 1: { 100: 0, 101: 1, 900: 5 } });
		keepBuiltInSkills(tree, jobs, builtIn);
		expect(tree[1][900]).toBe(5);
		expect(tree[1][102]).toBe(6);
	});

	it('never moves a position the file set', () => {
		const tree = {};
		resetSkillTree(tree, builtIn);
		const jobs = loadFile(tree, { 1: { 100: 7, 101: 0, 102: 1 } });
		keepBuiltInSkills(tree, jobs, builtIn);
		expect(tree[1]).toMatchObject({ 100: 7, 101: 0, 102: 1 });
	});

	it('leaves jobs the file did not define alone', () => {
		const tree = {};
		resetSkillTree(tree, builtIn);
		const jobs = loadFile(tree, { 1: { 100: 0 } });
		keepBuiltInSkills(tree, jobs, builtIn);
		expect(tree[2]).toEqual(builtIn[2]);
	});

	it('a second client starts from the built-in layout, not the first client', () => {
		const tree = {};
		resetSkillTree(tree, builtIn);
		keepBuiltInSkills(tree, loadFile(tree, { 1: { 100: 0, 7000: 2 }, 3: { 300: 0 } }), builtIn);
		expect(tree[1][7000]).toBe(2);

		resetSkillTree(tree, builtIn);
		keepBuiltInSkills(tree, loadFile(tree, { 1: { 100: 0 } }), builtIn);
		expect(tree[1]).not.toHaveProperty('7000');
		expect(tree).not.toHaveProperty('3');
		expect(tree[1]).toMatchObject({ 100: 0, 101: 1, 102: 5 });
	});
});

describe('BuiltInSkillTreeView', () => {
	it('is a frozen copy that changes to SkillTreeView do not reach', () => {
		const jobId = Object.keys(SkillTreeView)[0];
		const saved = SkillTreeView[jobId];
		try {
			SkillTreeView[jobId] = { list: 1, beforeJob: null, 7000: 0 };
			expect(BuiltInSkillTreeView[jobId]).toEqual(saved);
			expect(Object.isFrozen(BuiltInSkillTreeView[jobId])).toBe(true);
		} finally {
			SkillTreeView[jobId] = saved;
		}
	});
});
