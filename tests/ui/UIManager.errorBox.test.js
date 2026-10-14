import { describe, expect, it, vi } from 'vitest';

vi.mock('UI/GUIComponent.js', () => ({ default: class {} }));
vi.mock('UI/UIVersionManager.js', () => ({ default: { getUIAlias: () => null } }));

const { default: UIManager } = await import('UI/UIManager.js');

describe('UIManager.showErrorBox', () => {
	it('drops a skill waiting for its target, since the game ends with the box', () => {
		const skillTarget = { remove: vi.fn() };
		const box = { append: vi.fn() };
		UIManager.components.SkillTargetSelection = skillTarget;
		UIManager.components.WinPopup = { clone: () => box };

		UIManager.showErrorBox('Disconnected from Server.');

		expect(skillTarget.remove).toHaveBeenCalledOnce();
		expect(skillTarget.remove.mock.invocationCallOrder[0]).toBeLessThan(box.append.mock.invocationCallOrder[0]);
	});
});
