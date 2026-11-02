/**
 * tests/controls/MouseEventHandler.test.js
 *
 * The pointer position the game cursor is drawn at.
 */
import { describe, expect, it } from 'vitest';

const Mouse = (await import('Controls/MouseEventHandler.js')).default;

describe('the pointer position', () => {
	it('follows the mouse', () => {
		window.dispatchEvent(new MouseEvent('mousemove', { clientX: 40, clientY: 50 }));

		expect(Mouse.screen).toMatchObject({ x: 40, y: 50 });
	});

	// A native drag fires no mousemove: the game cursor stayed where the drag
	// began, and with the system cursor hidden nothing followed the pointer.
	it('follows a drag, even over a drop target that stops the event', () => {
		const target = document.createElement('div');
		target.addEventListener('dragover', event => event.stopImmediatePropagation());
		document.body.appendChild(target);

		target.dispatchEvent(new MouseEvent('dragover', { bubbles: true, clientX: 120, clientY: 130 }));

		expect(Mouse.screen).toMatchObject({ x: 120, y: 130 });
		target.remove();
	});
});
