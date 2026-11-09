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

	// The box and its overlay sat at a fixed 100 and 99: with about fifty
	// windows open, the windows stacked above 99 came over both and took clicks.
	it('stays over every window, its overlay right under it', () => {
		const box = { append: vi.fn(), _host: { style: { zIndex: '100' } } };
		UIManager.components.WinPopup = { clone: () => box };

		UIManager.showErrorBox('Disconnected from Server.');

		const overlays = document.querySelectorAll('.win_popup_overlay');
		const overlayZ = parseInt(overlays[overlays.length - 1].style.zIndex, 10);
		expect(box.needFocus).toBe(false);
		expect(overlayZ).toBeGreaterThan(200);
		expect(parseInt(box._host.style.zIndex, 10)).toBe(overlayZ + 1);
	});
});
