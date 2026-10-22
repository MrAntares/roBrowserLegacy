import { expect, it, vi } from 'vitest';

vi.mock('UI/GUIComponent.js', () => ({ default: class {} }));
vi.mock('UI/UIManager.js', () => ({ default: { addComponent: c => c } }));
vi.mock('Renderer/Renderer.js', () => ({ default: {} }));
vi.mock('Engine/SessionStorage.js', () => ({ default: {} }));
vi.mock('Controls/MouseEventHandler.js', () => ({ default: { screen: { x: 0, y: 0 } } }));
vi.mock('Controls/KeyEventHandler.js', () => ({ default: {} }));
vi.mock('DB/DBManager.js', () => ({ default: {} }));

const { _formatROText } = await import('UI/Components/SkillDescription/SkillDescription.js');
const { default: JobId } = await import('DB/Jobs/JobConst.js');

const text = (desc, jobId) => {
	const div = document.createElement('div');
	div.innerHTML = _formatROText(desc, jobId).replace(/<br\/>/g, '|');
	return div.textContent;
};

const earthSpike = [
	'Earth Spike',
	'Max Level: 5',
	'9^CC3399Requirement: Stone Curse 1^000000',
	'4190^CC3399Requirement: Stone Curse 1^000000',
	'16^CC3399Requirement: Seismic Weapon 1^000000',
	'Skill Form: ^3F0099Active^000000',
	''
].join('\n');

it("shows only the character's own job line, without the job id", () => {
	expect(text(earthSpike, JobId.SAGE)).toBe(
		'Earth Spike|Max Level: 5|Requirement: Seismic Weapon 1|Skill Form: Active|'
	);
	expect(text(earthSpike, JobId.WIZARD)).toBe('Earth Spike|Max Level: 5|Requirement: Stone Curse 1|Skill Form: Active|');
});

it('follows the job lineage up to the nearest job with a line', () => {
	// Professor has no line of its own, so the Sage line applies
	expect(text(earthSpike, JobId.SAGE_H)).toBe(
		'Earth Spike|Max Level: 5|Requirement: Seismic Weapon 1|Skill Form: Active|'
	);
	// Expanded Super Novice has its own line, ahead of Super Novice's
	expect(text('a\n23^CC3399x^000000\n4190^CC3399y^000000', JobId.SUPERNOVICE2)).toBe('a|y');
	// A Sage's Safety Wall comes from the Mage line
	expect(text('a\n2^CC3399x^000000\n8^CC3399y^000000', JobId.SAGE)).toBe('a|x');
});

it('leaves out every job line when no job applies', () => {
	expect(text(earthSpike, JobId.SWORDMAN)).toBe('Earth Spike|Max Level: 5|Skill Form: Active|');
	expect(text(earthSpike, null)).toBe('Earth Spike|Max Level: 5|Skill Form: Active|');
});

it('leaves other numbers alone', () => {
	expect(text('Max Level: 10\n1002^CC3399x^000000\n[Lv 1]: ^777777MATK 110%^000000', JobId.SAGE)).toBe(
		'Max Level: 10|1002x|[Lv 1]: MATK 110%'
	);
});
