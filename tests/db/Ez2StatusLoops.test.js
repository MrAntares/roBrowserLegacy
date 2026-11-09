import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import SC from 'DB/Status/StatusConst.js';
import SU from 'DB/Skills/SkillUnitConst.js';
import StatusEffectTable from 'DB/Status/StatusEffectTable.js';
import SkillUnit, { SkillUnitEnd } from 'DB/Skills/SkillUnit.js';
import { effectTableSource } from '../helpers/effectTableSource.js';

// The kRO EZ2 rows that loop forever (IsInfinite), played as the official client
// plays them: a status keeps its loop on the actor while it is on, a ground unit
// keeps its loop on the unit until the unit goes. The names are rows of
// ez2streffect.bson, merged into the effect table by DBManager.
//
// The tables are read as text where they import the renderer.
const read = file => readFileSync(join(process.cwd(), 'src', file), 'utf8').replace(/\r\n/g, '\n');

describe('statuses that loop an EZ2 effect', () => {
	const rows = {
		[SC.UNLIMIT]: { loop: ['unlimit_loop_bottom', 'unlimit_loop'] },
		[SC.SERVANT_SIGN]: { loop: ['servant_sign_bottom', 'servant_sign'] },
		[SC.VIGOR]: { loop: ['vigor_buff'] },
		[SC.DANCING_KNIFE]: {
			start: ['dancing_knife_skill_bottom_begin', 'dancing_knife_skill_begin'],
			loop: ['dancing_knife_skill_bottom_loop', 'dancing_knife_skill_loop']
		},
		[SC.GUARD_STANCE]: { loop: ['new_guard_stance_loop_bottom'] },
		[SC.ATTACK_STANCE]: { loop: ['new_attack_stance_loop_bottom'] },
		[SC.GUARDIAN_S]: { start: ['new_guardianshield_buff_start'], loop: ['new_guardianshield_buff_loop'] },
		[SC.HOLY_S]: { loop: ['new_holy_shield_loop', 'new_holy_shield_loop_bottom'] },
		[SC.ULTIMATE_S]: { loop: ['ultimate_sacrifice_buff'] },
		[SC.SPEAR_SCAR]: { loop: ['new_grand_judgement_buff'] },
		[SC.CALAMITYGALE]: { loop: ['calumitygale_loop'] },
		[SC.MYSTIC_SYMPHONY]: { loop: ['mysticsymphony_note'] },
		[SC.HIDDEN_CARD]: { loop: ['hiddencard_thunder'] },
		[SC.T_FIVETH_GOD]: { loop: ['circle_directions_elements_loop'] },
		[SC.HEAVEN_AND_EARTH]: { loop: ['soul_of_heaven_and_earth_buff'] },
		[SC.HOGOGONG]: { loop: ['howling_of_chul_ho_scared'] },
		[SC.TEMPORARY_COMMUNION]: { loop: ['temporary_communion_buff_bottom', 'temporary_communion_buff'] },
		[SC.BREAKINGLIMIT]: { loop: ['breakinglimit_buff'] },
		[SC.RULEBREAK]: { loop: ['rulebreak_buff'] },
		[SC.NIGHTMARE]: { loop: ['efst_nightmare'] }
	};

	it('uses the official status ids', () => {
		expect([SC.GUARD_STANCE, SC.ATTACK_STANCE, SC.GUARDIAN_S, SC.HOLY_S, SC.ULTIMATE_S, SC.SPEAR_SCAR]).toEqual([
			1202, 1203, 1204, 1220, 1221, 1222
		]);
	});

	it.each(Object.keys(rows))('status %s starts and loops its rows', id => {
		expect({ ...StatusEffectTable[id] }).toEqual(rows[id]);
	});

	it('no longer draws the buff once from the skill as well', () => {
		const effectTable = effectTableSource().replace(/\r\n/g, '\n');
		for (const file of [
			'breakinglimit_buff/breakinglimit_buff',
			'rulebreak_buff/rulebreak_buff',
			'temporary_communion_buff/temporary_communion_buff',
			'temporary_communion_buff_bottom/temporary_communion_buff_bottom',
			'soul_of_heaven_and_earth_buff/soul_of_heaven_and_earth_buff',
			'vigor_buff/vigor_buff',
			'servant_sign/servant_sign',
			'new_cross_rain_bottom/new_cross_rain_bottom'
		]) {
			expect(effectTable, file).not.toContain(`/${file}'`);
		}
	});
});

describe('ground units that loop an EZ2 effect', () => {
	it('play their start rows, then their loop rows', () => {
		expect(SkillUnit[SU.UNT_JACK_FROST_NOVA]).toEqual([
			'jack_frost_nova_start_bottom',
			'jack_frost_nova_start',
			'jack_frost_nova_loop_bottom',
			'jack_frost_nova_loop'
		]);
		expect(SkillUnit[SU.UNT_GROUND_GRAVITATION]).toEqual([
			'ground_gravitation_bottom_start',
			'ground_gravitation_start',
			'ground_gravitation_bottom_loop',
			'ground_gravitation_loop'
		]);
		expect(SkillUnit[SU.UNT_TOTEM_OF_TUTELARY]).toEqual([
			'totem_of_tutelary_bottom_start',
			'totem_of_tutelary_start',
			'totem_of_tutelary_bottom_loop',
			'totem_of_tutelary_loop'
		]);
		expect(SkillUnit[SU.UNT_HYUN_ROKS_BREEZE]).toEqual(['hyun_roks_breeze_bottom', 'hyun_roks_breeze']);
		expect(SkillUnit[SU.UNT_MISSION_BOMBARD]).toEqual([
			'mission_bombard',
			'mission_bombard_fire',
			'mission_bombard_fire_bottom',
			'ef_nw_mission_bombard_field'
		]);
		expect(SkillUnit[SU.UNT_CROSS_RAIN]).toEqual(['new_cross_rain_bottom', 'ef_ig_cross_rain_field']);
	});

	it('play their end rows where they stood', () => {
		expect(SkillUnitEnd[SU.UNT_JACK_FROST_NOVA]).toEqual(['jack_frost_nova_end']);
		expect(SkillUnitEnd[SU.UNT_TOTEM_OF_TUTELARY]).toEqual(['totem_of_tutelary_bottom_end', 'totem_of_tutelary_end']);
	});

	it('leave the skill cast to the unit', () => {
		const skillEffect = read('DB/Skills/SkillEffect.js');
		const row = skill => (skillEffect.match(new RegExp(`^SkillEffect\\[SK\\.${skill}\\] = \\{[^}]*\\};`, 'm')) || [''])[0];
		for (const skill of ['HN_JACK_FROST_NOVA', 'HN_GROUND_GRAVITATION', 'SOA_TOTEM_OF_TUTELARY', 'SH_HYUN_ROKS_BREEZE']) {
			// At most a cast aura: the skill's own effect comes from its unit
			expect(row(skill), skill).not.toMatch(/\b(effectId|successEffectId|groundEffectId):/);
		}
		expect(row('NW_MISSION_BOMBARD')).toMatch(/^SkillEffect\[SK\.NW_MISSION_BOMBARD\] = \{ hitEffectId: 'ef_nw_mission_bombard_hit'[ ,]/);
		expect(skillEffect).toContain("SkillEffect[SK.IG_CROSS_RAIN] = { effectIdOnCaster: 'ef_ig_cross_rain_cast' };");
	});

	function loadEffectManager() {
		const source = read('Renderer/EffectManager.js')
			.replace(/^import .*;$/gm, '')
			.replace('export default EffectManager;', 'this.EffectManager = EffectManager;');
		const entities = {};
		const context = vm.createContext({
			console,
			Math,
			Number,
			Float32Array,
			Preferences: { effect: true },
			EffectDB: { a_start: [{}], a_loop: [{}], a_end: [{}], old_a: [{}] },
			SU,
			SkillUnit: { 300: ['a_start', 'a_loop', 'not_loaded'], 301: ['not_loaded'] },
			SkillUnitEnd: { 300: ['a_end'] },
			SkillUnitFallback: { 300: ['old_a'], 301: ['old_a'] },
			Entity: class {
				static TYPE_EFFECT = 1;
			},
			EntityManager: { add: e => (entities[e.GID] = e), get: id => entities[id] },
			Altitude: { getCellHeight: () => 2 },
			Renderer: { tick: 0 }
		});
		vm.runInContext(source, context);
		const spammed = [];
		context.EffectManager.spam = params => spammed.push(params);
		context.EffectManager.remove = () => {};
		return { EffectManager: context.EffectManager, spammed };
	}

	it('spams every loaded effect of a unit, and its end rows when it goes', () => {
		const { EffectManager, spammed } = loadEffectManager();
		EffectManager.spamSkillZone(300, 10, 20, 77, 5, 3);
		expect(spammed.map(p => [p.effectId, p.ownerAID, p.persistent, p.skillLevel])).toEqual([
			['a_start', 77, true, 3],
			['a_loop', 77, true, 3]
		]);

		spammed.length = 0;
		EffectManager.spamSkillZoneEnd(77);
		expect(spammed.map(p => [p.effectId, p.ownerAID, [...p.position]])).toEqual([['a_end', undefined, [10, 20, 2]]]);
	});

	it('plays the older effect once when the client has no EZ2 rows for the unit', () => {
		const { EffectManager, spammed } = loadEffectManager();
		EffectManager.spamSkillZone(301, 10, 20, 78, 5, 3);
		expect(spammed.map(p => [p.effectId, p.ownerAID, p.persistent])).toEqual([['old_a', 78, false]]);
	});

	it('keeps an older effect for every unit that lost one', () => {
		const units = read('DB/Skills/SkillUnit.js');
		const table = effectTableSource().replace(/\r\n/g, '\n');
		for (const [unit, effectId] of [
			['UNT_JACK_FROST_NOVA', 'ef_hn_jack_frost_nova'],
			['UNT_GROUND_GRAVITATION', 'ef_hn_ground_gravitation'],
			['UNT_TOTEM_OF_TUTELARY', 'ef_soa_totem_of_tutelary'],
			['UNT_HYUN_ROKS_BREEZE', 'ef_sh_hyun_roks_breeze']
		]) {
			expect(units).toContain(`SkillUnitFallback[SU.${unit}] = ['${effectId}'];`);
			expect(table).toContain(`\n\t${effectId}: [`);
		}
	});

	it('plays the end rows before the unit is removed', () => {
		const entity = read('Engine/MapEngine/Entity.js');
		expect(entity).toMatch(
			/function onSkillDisapear\(pkt\) \{\n\tEffectManager\.spamSkillZoneEnd\(pkt\.AID\);\n\tEffectManager\.remove\(null, pkt\.AID\);/
		);
	});
});
