import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const sourceRoot = process.env.EFFECT_SOURCE_ROOT || join(process.cwd(), 'src');

// mergeEz2Effects over `records`, with `SkillEffect` as the hand-written rows.
function merge(records, EffectTable, SkillEffect, moreSkills = {}) {
	const db = readFileSync(join(sourceRoot, 'DB/DBManager.js'), 'utf8');
	const start = db.indexOf('function loadBSONFile(');
	const end = db.indexOf('function loadAttendanceFile(');
	assert.ok(start >= 0 && end > start, 'BSON merge source boundaries');
	const context = vm.createContext({
		console: { log() {} },
		Ez2streffect: records,
		SKID: { DR_CUTTING_WIND: 6542, KR_THUNDERING_CALL: 6600, KR_THUNDERING_CALL_S: 6601, ...moreSkills }
	});
	vm.runInContext(db.slice(start, end), context);
	context.mergeEz2Effects(EffectTable, SkillEffect);
	return SkillEffect;
}

describe('kRO effect table merged into skills', () => {
	const records = {
		cutting_wind: { FilePath: 'DRUID\\DR_CUTTING_WIND\\cutting_wind\\cutting_wind.str' },
		cutting_wind_hit: { FilePath: 'DRUID\\DR_CUTTING_WIND\\cutting_wind_hit\\cutting_wind_hit.str' }
	};

	it('does not add a file the skill already plays', () => {
		const EffectTable = {
			ef_cutting_wind: [{ type: 'STR', file: 'druid/dr_cutting_wind/cutting_wind/cutting_wind' }],
			ef_cutting_wind_hit: [{ type: 'STR', file: 'druid/dr_cutting_wind/cutting_wind_hit/cutting_wind_hit' }]
		};
		const skills = merge(records, EffectTable, {
			6542: { effectIdOnCaster: 'ef_cutting_wind', hitEffectId: 'ef_cutting_wind_hit' }
		});
		assert.deepEqual({ ...skills[6542] }, { effectIdOnCaster: 'ef_cutting_wind', hitEffectId: 'ef_cutting_wind_hit' });
	});

	it('does not add a file the skill plays from a numeric effect id', () => {
		const EffectTable = {
			1234: [{ type: 'STR', file: 'druid/dr_cutting_wind/cutting_wind/cutting_wind' }]
		};
		const skills = merge(records, EffectTable, { 6542: { effectId: 1234 } });
		assert.equal(skills[6542].effectId, 1234);
	});

	it('only counts STR rows as playing a file', () => {
		const EffectTable = {
			ef_cutting_wind_spr: [{ type: 'SPR', file: 'druid/dr_cutting_wind/cutting_wind/cutting_wind' }]
		};
		const skills = merge(records, EffectTable, { 6542: { effectIdOnCaster: 'ef_cutting_wind_spr' } });
		assert.equal(skills[6542].effectId, 'cutting_wind');
	});

	it('still maps the files of a skill with no row of its own', () => {
		const skills = merge(records, {}, {});
		assert.equal(skills[6542].effectId, 'cutting_wind');
		assert.equal(skills[6542].hitEffectId, 'cutting_wind_hit');
	});

	it('draws floor effects under the characters and the rest over them', () => {
		const EffectTable = {};
		merge(
			{
				cutting_wind: { FilePath: 'DRUID\\DR_CUTTING_WIND\\cutting_wind\\cutting_wind.str', PosY: 10 },
				cutting_wind_bottom: {
					FilePath: 'DRUID\\DR_CUTTING_WIND\\cutting_wind_bottom\\cutting_wind_bottom.str',
					IsFloor: true,
					PosX: -5,
					PosY: 12
				}
			},
			EffectTable,
			{}
		);
		assert.equal(EffectTable.cutting_wind[0].renderBeforeEntities, false);
		assert.equal(EffectTable.cutting_wind_bottom[0].renderBeforeEntities, true);
		assert.equal(EffectTable.cutting_wind[0].yOffset, 10);
		assert.equal(EffectTable.cutting_wind_bottom[0].xOffset, -5);
		assert.equal(EffectTable.cutting_wind_bottom[0].yOffset, 12);
	});

	it('does not add a file the skill plays from an older folder', () => {
		const EffectTable = {
			ef_cutting_wind: [{ type: 'STR', file: 'cutting_wind/cutting_wind/cutting_wind' }]
		};
		const skills = merge(records, EffectTable, { 6542: { effectIdOnCaster: 'ef_cutting_wind' } });
		assert.equal(skills[6542].effectId, undefined);
		assert.equal(skills[6542].hitEffectId, 'cutting_wind_hit');
	});

	it('keeps a floor layer that shares its file name with the top layer', () => {
		const skills = merge(
			{
				cutting_wind_1: { FilePath: 'DRUID\\DR_CUTTING_WIND\\cutting_wind\\cutting_wind_7x7.str' },
				cutting_wind_bottom_1: {
					FilePath: 'DRUID\\DR_CUTTING_WIND\\cutting_wind_bottom\\cutting_wind_7x7.str',
					IsFloor: true
				}
			},
			{},
			{}
		);
		assert.equal(skills[6542].effectId, 'cutting_wind_1');
		assert.equal(skills[6542].groundEffectId, 'cutting_wind_bottom_1');
	});

	it('adds one variant of an effect, and none when the skill plays one', () => {
		const charms = {
			cutting_wind_earth: { FilePath: 'DRUID\\DR_CUTTING_WIND\\cutting_wind_earth\\cutting_wind_earth.str' },
			cutting_wind_fire: { FilePath: 'DRUID\\DR_CUTTING_WIND\\cutting_wind_fire\\cutting_wind_fire.str' },
			cutting_wind_1: { FilePath: 'DRUID\\DR_CUTTING_WIND\\cutting_wind_1.str' },
			cutting_wind_2: { FilePath: 'DRUID\\DR_CUTTING_WIND\\cutting_wind_2.str' },
			cutting_wind_hit1: { FilePath: 'DRUID\\DR_CUTTING_WIND\\cutting_wind_hit1.str' },
			cutting_wind_hit2: { FilePath: 'DRUID\\DR_CUTTING_WIND\\cutting_wind_hit2.str' }
		};
		const skills = merge(charms, {}, {});
		assert.deepEqual([...skills[6542].effectId], ['cutting_wind_earth', 'cutting_wind_1', 'cutting_wind_hit1']);

		const EffectTable = {
			ef_cutting_wind: [{ type: 'STR', file: 'druid/dr_cutting_wind/cutting_wind_ice/cutting_wind_ice' }]
		};
		const handled = merge(charms, EffectTable, { 6542: { effectId: 'ef_cutting_wind' } });
		assert.equal(handled[6542].effectId.includes('cutting_wind_earth'), false);
		assert.equal(handled[6542].effectId.includes('cutting_wind_fire'), false);
	});

	it('does not attach endless loops to a skill', () => {
		const EffectTable = {};
		const skills = merge(
			{
				cutting_wind_start: { FilePath: 'DRUID\\DR_CUTTING_WIND\\cutting_wind_start.str' },
				cutting_wind_loop: { FilePath: 'DRUID\\DR_CUTTING_WIND\\cutting_wind_loop.str', IsInfinite: true }
			},
			EffectTable,
			{}
		);
		assert.equal(skills[6542].effectId, 'cutting_wind_start');
		// Still in the effect table, for a status or a hand-written row to use
		assert.equal(EffectTable.cutting_wind_loop[0].repeat, true);
	});

	it('does not add a file a sibling skill already draws', () => {
		// The bson files the _S skill's variant under the base skill's folder
		const call = {
			thundering_call_y_3x3: { FilePath: 'KR_THUNDERING_CALL\\thundering_call_y_3x3.str' },
			thundering_call_hit: { FilePath: 'KR_THUNDERING_CALL\\thundering_call_hit.str' }
		};
		const EffectTable = {
			ef_thundering_call_s: [{ type: 'STR', file: 'kr_thundering_call/thundering_call_y_3x3' }]
		};
		const skills = merge(call, EffectTable, { 6601: { effectId: 'ef_thundering_call_s' } });
		assert.equal(skills[6600].effectId, undefined);
		assert.equal(skills[6600].hitEffectId, 'thundering_call_hit');
		assert.deepEqual({ ...skills[6601] }, { effectId: 'ef_thundering_call_s' });
	});

	it('counts a row an earlier record gave the sibling', () => {
		// Both records play one file: the first lands on the _S skill, the second on the base
		const call = {
			thundering_call_s: { FilePath: 'KR_THUNDERING_CALL\\thundering_call_y.str' },
			thundering_call_y2: { FilePath: 'KR_THUNDERING_CALL\\thundering_call_y.str' }
		};
		const skills = merge(call, {}, {});
		assert.equal(skills[6601].effectId, 'thundering_call_s');
		assert.equal(skills[6600], undefined);
	});

	it('does not treat a longer skill name as a sibling', () => {
		// KR_THUNDERING_CALLX is not KR_THUNDERING_CALL plus a suffix
		const call = { thundering_call_hit: { FilePath: 'KR_THUNDERING_CALL\\thundering_call_hit.str' } };
		const EffectTable = { ef_x: [{ type: 'STR', file: 'kr_thundering_call/thundering_call_hit' }] };
		const db = { 6602: { effectId: 'ef_x' } };
		const skills = merge(call, EffectTable, db, { KR_THUNDERING_CALLX: 6602 });
		assert.equal(skills[6600].hitEffectId, 'thundering_call_hit');
	});
});
