import { describe, expect, it, vi } from 'vitest';

const order = vi.hoisted(() => {
	// Renderer binds requestAnimationFrame at import
	vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'Date'] });
	return [];
});

vi.mock('Utils/WebGL.js', () => ({ default: {} }));
vi.mock('Core/Configs.js', () => ({ default: { get() {} } }));
vi.mock('Preferences/Graphics.js', () => ({ default: { fpslimit: 0 } }));
vi.mock('Core/Events.js', () => ({ default: { process() {} } }));
vi.mock('UI/Background.js', () => ({ default: {} }));
vi.mock('UI/CursorManager.js', () => ({
	default: {
		render: () => order.push('cursor'),
		setSceneDriven: value => order.push('sceneDriven:' + value)
	}
}));
vi.mock('Controls/MouseEventHandler.js', () => ({ default: { screen: { x: 0, y: 0 } } }));
vi.mock('Renderer/Camera.js', () => ({ default: {} }));
vi.mock('Engine/SessionStorage.js', () => ({ default: { Playing: true, serverTick: 0 } }));
vi.mock('Renderer/Effects/PostProcess.js', () => ({ default: {} }));
vi.mock('Core/MemoryManager.js', () => ({ default: {} }));

import Renderer from 'Renderer/Renderer.js';

describe('Renderer', () => {
	it('draws the cursor after the frame that updates the hovered entity, and hands it back on stop', () => {
		Renderer.render(() => order.push('map'));
		vi.advanceTimersToNextFrame();
		Renderer.stop();

		expect(order).toEqual(['sceneDriven:true', 'map', 'cursor', 'sceneDriven:false']);
	});
});
