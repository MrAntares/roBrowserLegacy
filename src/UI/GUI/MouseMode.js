import Mouse from 'Controls/MouseEventHandler.js';
import Session from 'Engine/SessionStorage.js';
import { getCursor, getEntityManager } from 'UI/GUI/GUIDeps.js';

/**
 * Open windows that freeze the map. It thaws when the last one closes, not the
 * first: the NPC store asks for a quantity in a second one, and message boxes
 * are clones sharing one name.
 */
export const frozenBy = [];

/**
 * Mouse interaction modes
 */
export const MouseMode = Object.freeze({
	CROSS: 0, // Cross the UI and intersect with scene
	STOP: 1, // Block scene intersection when mouse is over the UI
	FREEZE: 2 // Block scene intersection while UI is alive
});

/**
 * A clickable a component has marked as refusing the click
 */
export const DENIED_SELECTOR = '.denied';

export function setupShadowCursorEvents(component) {
	const container = component._container;
	if (!container) return;

	const CLICKABLE_SELECTOR = [
		'a',
		'button',
		'ui-button',
		'input',
		'label',
		'select',
		'textarea',
		// Checkbox widgets built as a styled <div> rather than a control, so
		// they would otherwise be the only clickable thing the cursor ignores.
		// EquipmentV4's carry the class on a <button> and already matched.
		'.checkbox',
		'.item-link',
		'.draggable',
		'.ro-custom-scrollbar',
		'.ro-custom-scrollbar *'
	].join(',');

	let _hovering = false;
	let _savedType = getCursor()?.ACTION?.DEFAULT ?? 0;

	// A clickable a component has marked `denied` takes the game's own
	// refusal cursor instead of the click one. CSS cannot answer this: the
	// custom cursor forces `cursor: none` across the window, so `not-allowed`
	// only shows when it is switched off.
	const cursorFor = target =>
		(target.closest(DENIED_SELECTOR) ? getCursor()?.ACTION?.NOWALK : getCursor()?.ACTION?.CLICK) ?? 0;

	container.addEventListener('mouseover', e => {
		const target = e.target;
		if (target.closest && target.closest(CLICKABLE_SELECTOR)) {
			if (!_hovering) {
				_savedType = getCursor()?.getActualType() ?? 0;
				_hovering = true;
			}
			const wanted = cursorFor(target);
			if ((getCursor()?.getActualType() ?? 0) !== wanted) {
				getCursor()?.setType(wanted);
			}
		}
	});

	container.addEventListener('mouseout', e => {
		if (!_hovering) return;

		const related = e.relatedTarget;
		// Still over a clickable element inside this shadow? Do nothing.
		if (related && related.closest && related.closest(CLICKABLE_SELECTOR)) {
			return;
		}

		_hovering = false;
		getCursor()?.setType(_savedType);
	});

	// A window closed under the pointer never sees it leave its button.
	container.addEventListener('x_remove', () => {
		if (_hovering) {
			_hovering = false;
			getCursor()?.setType(_savedType);
		}
	});

	container.addEventListener('mousedown', e => {
		const target = e.target;
		if (target.closest && target.closest(CLICKABLE_SELECTOR)) {
			if (!_hovering) {
				_savedType = getCursor()?.getActualType() ?? 0;
				_hovering = true;
			}
			// No press animation on a refusal - there is nothing being pressed.
			if (target.closest(DENIED_SELECTOR)) {
				getCursor()?.setType(getCursor()?.ACTION?.NOWALK ?? 0);
			} else {
				getCursor()?.setType(getCursor()?.ACTION?.CLICK ?? 0, true, 1);
			}
		}
	});

	container.addEventListener('mouseup', e => {
		const target = e.target;
		if (target.closest && target.closest(CLICKABLE_SELECTOR)) {
			const wanted = cursorFor(target);
			if ((getCursor()?.getActualType() ?? 0) !== wanted) {
				getCursor()?.setType(wanted);
			}
			return;
		}
		if (_hovering) {
			_hovering = false;
			getCursor()?.setType(_savedType);
		}
	});
}

export function setupMouseMode(component) {
	const element = component.__mouseStopBlock || component._host;
	if (component.mouseMode === MouseMode.STOP) {
		let _intersect;
		let _enter = 0;

		element.addEventListener('mouseenter', () => {
			if (_enter === 0) {
				_intersect = Mouse.intersect;
				_enter++;
				if (_intersect) {
					Mouse.intersect = false;
					getCursor()?.setType(getCursor()?.ACTION?.DEFAULT ?? 0);
					getEntityManager()?.setOverEntity(null);
				}
			}
		});

		element.addEventListener('mouseleave', () => {
			if (_enter > 0) {
				_enter--;
				if (_enter === 0 && _intersect) {
					if (!Session.FreezeUI) {
						Mouse.intersect = true;
					}
					getEntityManager()?.setOverEntity(null);
				}
			}
		});

		// Firefox fix: mouseleave not fired on detach
		element.addEventListener('x_remove', () => {
			if (_enter > 0) {
				_enter = 0;
				if (_intersect) {
					Mouse.intersect = true;
					getEntityManager()?.setOverEntity(null);
				}
			}
		});

		// Focus on mousedown
		element.addEventListener('mousedown', () => {
			component.focus();

			// focus() only raises the zIndex. Without moving the real DOM
			// focus too, clicking a window leaves the tab sequence wherever
			// it was, so Tab walks the whole document instead of the window
			// just clicked. Skip it when the focus is already inside, and
			// let the browser's own default then land it on whatever
			// focusable control was actually clicked.
			const host = component._host;
			if (host && !host.contains(document.activeElement)) {
				host.tabIndex = -1;
				host.focus({ preventScroll: true });
			}
		});
	}

	if (component.mouseMode !== MouseMode.CROSS) {
		element.addEventListener('touchstart', e => e.stopImmediatePropagation());
	}
	// Shadow DOM cursor events (clickable hover detection)
	component._setupShadowCursorEvents();
}
