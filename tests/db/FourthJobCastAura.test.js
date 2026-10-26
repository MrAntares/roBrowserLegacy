import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// 4th-job casts (skills 5401-5507 and 6001-6006), as the official client plays
// them: no element cast aura, only what each skill's own cast slot plays.
//
// Read as text: the tables import the renderer, which does not load without a canvas.
const read = file => readFileSync(join(process.cwd(), 'src', file), 'utf8').replace(/\r\n/g, '\n');
const skillEffect = read('DB/Skills/SkillEffect.js');
const effectTable = read('DB/Effects/EffectTable.js');
const skillConst = read('DB/Skills/SkillConst.js');

const { hasElementCastAura } = await import('DB/Skills/CastAuraRule.js');

const SK = Object.fromEntries([...skillConst.matchAll(/^\t([A-Z0-9_]+): (\d+),?$/gm)].map(m => [m[1], +m[2]]));

// What each skill's cast slot (vf8) plays in the 2026-02-11 client: classic
// effect ids launched on the caster for the cast time, and EZ2 rows.
// Skills not listed play nothing while casting.
const CLIENT = {
	NW_THE_VIGILANTE_AT_NIGHT: [2367],
	NW_ONLY_ONE_BULLET: [2367],
	NW_SPIRAL_SHOOTING: [2367],
	NW_MAGAZINE_FOR_ONE: [2367],
	NW_WILD_FIRE: [2367],
	NW_BASIC_GRENADE: [830],
	NW_HASTY_FIRE_IN_THE_HOLE: [830],
	NW_GRENADES_DROPPING: [830],
	NW_AUTO_FIRING_LAUNCHER: [830],
	NW_HIDDEN_CARD: [840],
	NW_MISSION_BOMBARD: [840],
	NW_WILD_SHOT: ['wild_shot_cast'],
	NW_MIDNIGHT_FALLEN: ['midnight_fallen_cast_bottom'],
	SOA_TALISMAN_OF_PROTECTION: [830],
	SOA_TALISMAN_OF_WARRIOR: [830],
	SOA_TALISMAN_OF_MAGICIAN: [830],
	SOA_SOUL_GATHERING: [454],
	SOA_TOTEM_OF_TUTELARY: [911],
	SOA_TALISMAN_OF_FIVE_ELEMENTS: [830],
	SOA_TALISMAN_OF_SOUL_STEALING: [441],
	SOA_EXORCISM_OF_MALICIOUS_SOUL: [2367],
	SOA_TALISMAN_OF_BLUE_DRAGON: [845],
	SOA_TALISMAN_OF_WHITE_TIGER: [843],
	SOA_TALISMAN_OF_RED_PHOENIX: [840],
	SOA_TALISMAN_OF_BLACK_TORTOISE: [2368],
	SOA_TALISMAN_OF_FOUR_BEARING_GOD: [2369],
	SOA_CIRCLE_OF_DIRECTIONS_AND_ELEMENTALS: [1565],
	SOA_SOUL_OF_HEAVEN_AND_EARTH: [1556],
	SH_HOWLING_OF_CHUL_HO: [840],
	SH_HOGOGONG_STRIKE: [840],
	SH_KI_SUL_WATER_SPRAYING: [58],
	SH_MARINE_FESTIVAL_OF_KI_SUL: [845],
	SH_SANDY_FESTIVAL_OF_KI_SUL: [842],
	SH_KI_SUL_RAMPAGE: [831],
	SH_COLORS_OF_HYUN_ROK: [58],
	SH_HYUN_ROKS_BREEZE: [841],
	SH_HYUN_ROK_CANNON: [841],
	SH_TEMPORARY_COMMUNION: [2367],
	SH_BLESSING_OF_MYSTICAL_CREATURES: [2367],
	SH_CHUL_HO_BATTERING: ['chul_ho_battering_cast'],
	SH_HYUN_ROK_SPIRIT_POWER: ['hyun_rok_spirit_power_cast', 'hyun_rok_spirit_power_cast_bottom'],
	HN_DOUBLEBOWLINGBASH: [12],
	HN_SHIELD_CHAIN_RUSH: [58],
	HN_SPIRAL_PIERCE_MAX: [502],
	HN_METEOR_STORM_BUSTER: [55],
	HN_JUPITEL_THUNDER_STORM: [57],
	HN_JACK_FROST_NOVA: [1449, 1446],
	HN_HELLS_DRIVE: [1709],
	HN_GROUND_GRAVITATION: [9, 12],
	HN_NAPALM_VULCAN_STRIKE: [58],
	HN_BREAKINGLIMIT: [2369],
	HN_RULEBREAK: [2369],
	SKE_MIDNIGHT_KICK: [58],
	SKE_DAWN_BREAK: [58],
	SKE_TWINKLING_GALAXY: [441],
	SKE_STAR_BURST: [441],
	SKE_STAR_CANNON: [441],
	SKE_ALL_IN_THE_SKY: [845],
	SKE_ENCHANTING_SKY: [831],
	SKE_SKY_MOON: ['sky_moon_cast', 'sky_moon_cast_bottom'],
	SS_AKUMUKESU: [934],
	SS_SHINKIROU: [2373, 1774],
	SS_KAGENOMAI: [454],
	SS_KAGEGISSEN: [454],
	SS_FUUMASHOUAKU: [986, 454],
	SS_FUUMAKOUCHIKU: [986, 454],
	SS_KUNAIWAIKYOKU: [986, 454],
	SS_KUNAIKUSSETSU: [986, 454],
	SS_SEKIENHOU: [55],
	SS_REIKETSUHOU: [54],
	SS_RAIDENPOU: ['new_raidenpou_cast'],
	SS_KINRYUUHOU: [58],
	SS_ANTENPOU: [59],
	SS_KAGEAKUMU: [812],
	SS_HITOUAKUMU: [812],
	SS_ANKOKURYUUAKUMU: [812],
	DK_DRAGONIC_BREATH: [12],
	MT_SPARK_BLASTER: [1938],
	MT_TRIPLE_LASER: [1938],
	BO_MAYHEMIC_THORNS: [2228, 2229]
};

// How roBrowser plays each client effect: as the cast aura (castAuraEffectId,
// for the cast time) or, for the client's STR / EZ2 rows, from the cast start
// (beginCastEffectId, looping until the cast ends). Client effects not listed
// here are not ported yet; their skills show nothing for them.
const AURA = {
	9: 9,
	12: 12,
	54: 'ef_cast_circle_blue',
	55: 'ef_cast_circle_red',
	57: 'ef_cast_circle_yellow',
	58: 58,
	59: 'ef_cast_circle_violet',
	441: 441,
	454: 454,
	502: 502,
	812: 812,
	830: 830,
	831: 831,
	840: 840,
	841: 841,
	842: 842,
	843: 843,
	845: 845,
	911: 911,
	934: 934,
	986: 986,
	1449: 1449,
	1556: 1556,
	1565: 1565,
	1709: 1709,
	1938: 1938,
	2367: 2367,
	2368: 2368,
	2369: 2369,
	2373: 2373
};
const BEGIN = {
	1446: 1446,
	1774: 1774,
	2228: 2228,
	2229: 2229,
	wild_shot_cast: 'ef_nw_wild_shot_cast',
	midnight_fallen_cast_bottom: 'ef_nw_midnight_fallen_cast',
	chul_ho_battering_cast: 'ef_sh_chul_ho_battering_cast',
	hyun_rok_spirit_power_cast: 'ef_sh_hyun_rok_spirit_power_cast',
	hyun_rok_spirit_power_cast_bottom: 'ef_sh_hyun_rok_spirit_power_cast',
	new_raidenpou_cast: 'ef_ss_raidenpou_cast',
	sky_moon_cast: 'ef_ske_sky_moon_cast',
	sky_moon_cast_bottom: 'ef_ske_sky_moon_cast'
};

function row(name) {
	const m = skillEffect.match(new RegExp(`^SkillEffect\\[(?:SK\\.${name}|${SK[name]} /\\* ${name} \\*/)\\] = \\{[\\s\\S]*?\\};`, 'm'));
	return m ? m[0] : '';
}

function list(name, key) {
	const m = row(name).match(new RegExp(`\\b${key}: (\\[[^\\]]*\\]|'\\w+'|\\d+)`));
	if (!m) {
		return [];
	}
	return [JSON.parse(m[1].replace(/'/g, '"'))].flat();
}

function entry(id) {
	const start = effectTable.indexOf(`\n\t${id}: [`);
	expect(start, `${id} is defined`).toBeGreaterThan(-1);
	return effectTable.slice(start, effectTable.indexOf('\n\t],', start)).replace(/\s+/g, ' ');
}

const unique = values => [...new Set(values)];

describe('4th-job cast aura rule', () => {
	it('gives no element aura to skills 5401-5507 and 6001-6006', () => {
		expect(SK.NW_P_F_I).toBe(5401);
		expect(SK.SH_HYUN_ROK_SPIRIT_POWER).toBe(5507);
		expect(SK.DK_DRAGONIC_BREATH).toBe(6001);
		expect(SK.BO_MAYHEMIC_THORNS).toBe(6006);
		for (const id of [5401, 5465, 5507, 6001, 6006]) {
			expect(hasElementCastAura(id), id).toBe(false);
		}
		for (const id of [5400, 5508, 6000, 6007, SK.WZ_FIREPILLAR]) {
			expect(hasElementCastAura(id), id).toBe(true);
		}
	});
});

describe('4th-job cast slots', () => {
	const names = Object.keys(SK).filter(n => (SK[n] >= 5401 && SK[n] <= 5507) || (SK[n] >= 6001 && SK[n] <= 6006));

	it('covers every skill in the two ranges', () => {
		for (const name of Object.keys(CLIENT)) {
			expect(names, name).toContain(name);
		}
	});

	it('plays what the client\'s cast slot plays, as the cast aura or from the cast start', () => {
		for (const name of names) {
			const client = CLIENT[name] || [];
			const aura = client.filter(e => e in AURA).map(e => AURA[e]);
			const begin = unique(client.filter(e => e in BEGIN).map(e => BEGIN[e]));
			expect(list(name, 'castAuraEffectId'), `${name} castAuraEffectId`).toEqual(aura);
			expect(list(name, 'beginCastEffectId'), `${name} beginCastEffectId`).toEqual(begin);
		}
	});

	it('no longer plays the cast rows when the skill is used', () => {
		for (const name of Object.keys(CLIENT)) {
			for (const value of list(name, 'beginCastEffectId')) {
				expect(row(name), name).not.toMatch(new RegExp(`effectIdOnCaster: '${value}'`));
			}
		}
	});

	it('keeps Star Emperor\'s cast auras: 58, 441, 845, 831 and the Sky Moon cast rows', () => {
		expect(list('SKE_MIDNIGHT_KICK', 'castAuraEffectId')).toEqual([58]);
		expect(list('SKE_DAWN_BREAK', 'castAuraEffectId')).toEqual([58]);
		for (const name of ['SKE_TWINKLING_GALAXY', 'SKE_STAR_BURST', 'SKE_STAR_CANNON']) {
			expect(list(name, 'castAuraEffectId'), name).toEqual([441]);
		}
		expect(list('SKE_ALL_IN_THE_SKY', 'castAuraEffectId')).toEqual([845]);
		expect(list('SKE_ENCHANTING_SKY', 'castAuraEffectId')).toEqual([831]);
		for (const name of ['SKE_RISING_SUN', 'SKE_NOON_BLAST', 'SKE_SUNSET_BLAST', 'SKE_RISING_MOON', 'SKE_SKY_SUN', 'SKE_STAR_LIGHT_KICK']) {
			expect(list(name, 'castAuraEffectId'), name).toEqual([]);
		}
	});
});

describe('4th-job cast effects', () => {
	it('draws cones 840-843 like 845, in their colours', () => {
		for (const [id, variant] of [
			[840, 3],
			[841, 4],
			[842, 5],
			[843, 6]
		]) {
			const e = entry(id);
			expect(e).toContain("type: 'FUNC'");
			expect(e).toContain('new CastCone(Params.Init.ownerEntity.position, Params.Inst.startTick, Params.Init.duration, {');
			expect(e).toContain(`variant: ${variant}`);
		}
		expect(read('Engine/MapEngine/Entity.js')).toContain('831, 840, 841, 842, 843, 845]');
	});

	it('draws circles 55, 59 and 1449 with the client\'s texture and mode', () => {
		for (const [id, args] of [
			['ef_cast_circle_red', "'ring_yellow.tga', 1 )"],
			['ef_cast_circle_violet', "'magic_violet.tga' )"],
			[1449, "'new_jackfrost/ring_ice.tga', 2 )"]
		]) {
			const e = entry(id);
			expect(e).toContain('castLoop: true');
			expect(e).toContain(
				`new CastCircle( Params.Init.ownerEntity.position, Params.Inst.startTick, Params.Init.duration, ${args}`
			);
		}
	});

	it('plays the client\'s STR files by id for the cast time', () => {
		for (const [id, file] of [
			[1446, 'new_jackfrost/new_jackfrost_cast/new_jackfrost_cast'],
			[1774, 'mystery_illusion/mystery_illusion_cast_bottom/mystery_illusion_cast_bottom'],
			[2228, 'acidified_zone_ground/acidified_zone_ground_cast/acidified_zone_ground_cast'],
			[2229, 'acidified_zone_ground/acidified_zone_ground_cast_bottom/acidified_zone_ground_cast_bottom']
		]) {
			const e = entry(id);
			expect(e).toContain(`file: '${file}'`);
			expect(e).toContain('castLoop: true');
		}
		for (const name of ['ef_nw_wild_shot_cast', 'ef_nw_midnight_fallen_cast', 'ef_ss_raidenpou_cast', 'ef_sh_chul_ho_battering_cast', 'ef_sh_hyun_rok_spirit_power_cast']) {
			expect(entry(name), name).toContain('castLoop: true');
		}
	});

	it('plays the begin-spell sound where the client\'s STR-by-id case does', () => {
		// The client's per-id setup plays ef_beginspell.wav for 1774 and 2228 only.
		for (const id of [1774, 2228]) {
			expect(entry(id), String(id)).toContain("wav: 'effect/ef_beginspell'");
		}
		for (const id of [1446, 2229]) {
			expect(entry(id), String(id)).not.toContain('wav:');
		}
	});

	it('plays each effect of a cast aura list', () => {
		const entity = read('Engine/MapEngine/Entity.js');
		expect(entity).toContain('[castSkill.castAuraEffectId].flat().forEach(effectId => {');
		expect(entity).toContain('EffectManager.spam({ ...EF_Init_Par, effectId });');
	});
});
