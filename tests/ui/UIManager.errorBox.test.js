import { describe, expect, it, vi } from 'vitest';

vi.mock('UI/GUIComponent.js', () => ({ default: class {} }));
vi.mock('UI/UIVersionManager.js', () => ({ default: { getUIAlias: () => null } }));

const { default: UIManager } = await import('UI/UIManager.js');

describe('UIManager.showErrorBox', () => {
	it('drops a skill waiting for its target, since the game ends with the box', () => {
		const skillTarget = { remove: vi.fn() };
		const box = { append: vi.fn(), _host: { style: { zIndex: '120' } } };
		UIManager.components.SkillTargetSelection = skillTarget;
		UIManager.components.WinPopup = { clone: () => box };

		UIManager.showErrorBox('Disconnected from Server.');

		expect(skillTarget.remove).toHaveBeenCalledOnce();
		expect(skillTarget.remove.mock.invocationCallOrder[0]).toBeLessThan(box.append.mock.invocationCallOrder[0]);
	});

	// The box rises to the top of the open windows, so its height depends on how
	// many are open: an overlay at a fixed 99 either covered it or let the
	// windows stacked above 99 take clicks.
	it('lays its overlay right under the box', () => {
		const box = { append: vi.fn(), _host: { style: { zIndex: '120' } } };
		UIManager.components.WinPopup = { clone: () => box };

		UIManager.showErrorBox('Disconnected from Server.');

		const overlays = document.querySelectorAll('.win_popup_overlay');
		expect(overlays[overlays.length - 1].style.zIndex).toBe('119');
	});
});
