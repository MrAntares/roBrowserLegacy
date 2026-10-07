import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	animations: []
}));

vi.mock('DB/DBManager.js', () => ({ default: { INTERFACE_PATH: '' } }));
vi.mock('Core/Client.js', () => ({ default: { loadFile: vi.fn() } }));
vi.mock('Core/Configs.js', () => ({ default: { get: vi.fn() } }));
vi.mock('Network/PacketVerManager.js', () => ({ default: { value: 20120410 } }));
vi.mock('Utils/HtmlHelper.js', () => ({
	animateElement: vi.fn((element, props, duration, callback) => {
		mocks.animations.push({ element, props, callback });
		return { stop: vi.fn() };
	})
}));

import Background from 'UI/Background.js';

function finishAnimation() {
	mocks.animations.shift().callback();
}

describe('Background.remove', () => {
	beforeEach(() => {
		mocks.animations.length = 0;
		document.body.innerHTML = '';
	});

	it('fades through black before the callback when no background is displayed', () => {
		const callback = vi.fn();

		Background.remove(callback);

		expect(mocks.animations).toHaveLength(1);
		expect(mocks.animations[0].props).toEqual({ opacity: 1.0 });
		expect(mocks.animations[0].element.parentNode).toBe(document.body);
		expect(callback).not.toHaveBeenCalled();

		finishAnimation();

		expect(callback).toHaveBeenCalledOnce();
		expect(mocks.animations[0].props).toEqual({ opacity: 0.01 });

		const overlay = mocks.animations[0].element;
		finishAnimation();

		expect(overlay.parentNode).toBeNull();
	});
});
