import { describe, expect, it, vi } from 'vitest';

vi.mock('Renderer/Camera.js', () => ({ default: {} }));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 800, height: 600 } }));

const { screenAngle, screenSector, screenSide } = await import('Renderer/Effects/ScreenDirection.js');

// A camera straight above the map: map x goes right, map y goes up the screen.
// Column-major: clip x = world x, clip y = world z (map y).
const topDown = new Float32Array([1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
const angle = (to, w = 800, h = 600) => screenAngle([100, 100, 0], to, topDown, w, h);

describe('on-screen direction between two entities', () => {
	it('measures clockwise from right, y going down the screen', () => {
		expect(angle([110, 100, 0])).toBeCloseTo(0);
		expect(angle([100, 90, 0])).toBeCloseTo(90);
		expect(angle([90, 100, 0])).toBeCloseTo(180);
		expect(angle([100, 110, 0])).toBeCloseTo(270);
	});

	it('uses screen pixels, so a wide screen stretches the angle', () => {
		expect(angle([110, 110, 0], 600, 600)).toBeCloseTo(315);
		expect(angle([110, 110, 0], 1200, 600)).toBeCloseTo(360 - (Math.atan(0.5) * 180) / Math.PI);
	});

	it('is 0 when both stand on the same spot', () => {
		expect(angle([100, 100, 0])).toBe(0);
	});

	it('splits into 12 sectors of 30 degrees, sector 0 straight up', () => {
		const sectors = [270, 300, 330, 0, 30, 60, 90, 120, 150, 180, 210, 240].map(screenSector);
		expect(sectors).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
		expect(screenSector(254.9)).toBe(11);
		expect(screenSector(255)).toBe(0);
		expect(screenSector(359.9)).toBe(3);
		expect(screenSector(360)).toBe(3);
	});

	it('splits into two halves, 90 and 270 degrees counting as right', () => {
		expect([0, 45, 89.9, 90, 270, 270.1, 359.9].map(screenSide)).toEqual(Array(7).fill('right'));
		expect([90.1, 135, 180, 225, 269.9].map(screenSide)).toEqual(Array(5).fill('left'));
		expect(screenSide(angle([110, 95, 0]))).toBe('right');
		expect(screenSide(angle([90, 95, 0]))).toBe('left');
		expect(screenSide(angle([100, 100, 0]))).toBe('right');
	});
});
