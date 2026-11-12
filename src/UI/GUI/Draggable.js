import Mouse from 'Controls/MouseEventHandler.js';
import UIPreferences from 'Preferences/UI.js';
import { getRenderer } from 'UI/GUI/GUIDeps.js';

/**
 * Snap cache shared across all draggable instances (same as UIComponent)
 */
let _snapCache = [];

export function attachDraggable(component, handle) {
	const host = component._host;
	const SNAP_DISTANCE = 10;

	if (!host) return component;

	component._isDraggable = true;

	// Resolve handle element
	let handleEl;
	if (!handle) {
		handleEl = host;
	} else if (typeof handle === 'string') {
		handleEl = component._shadow.querySelector(handle) || component._container.querySelector(handle);
	} else if (handle instanceof HTMLElement) {
		handleEl = handle;
	} else {
		// jQuery object from legacy code — extract native element
		handleEl = handle[0] || handle;
	}

	if (!handleEl) return component;

	const onStart = event => {
		if (event.type === 'touchstart') {
			Mouse.screen.x = event.touches[0].pageX;
			Mouse.screen.y = event.touches[0].pageY;
		} else if (event.which !== 1) {
			return;
		}

		const x = host.offsetLeft - Mouse.screen.x;
		const y = host.offsetTop - Mouse.screen.y;
		const width = host.offsetWidth;
		const height = host.offsetHeight;

		// Build snap cache from other active components
		_snapCache = [];
		if (UIPreferences.windowmagnet && component.manager) {
			const hostParent = host.offsetParent;
			const components = component.manager.components;
			for (const name in components) {
				const other = components[name];
				if (
					!other ||
					other === component ||
					!other.__active ||
					!other.needFocus ||
					!other.ui ||
					!other.ui.is(':visible')
				)
					continue;

				const el = other._host || (other.ui && other.ui[0]);
				if (!el) continue;

				if (hostParent && el.offsetParent && el.offsetParent !== hostParent) {
					continue;
				}

				_snapCache.push({
					left: el.offsetLeft,
					top: el.offsetTop,
					right: el.offsetLeft + el.offsetWidth,
					bottom: el.offsetTop + el.offsetHeight
				});
			}
		}

		host.style.transition = '';
		// Force reflow to apply immediately
		host.offsetHeight; // eslint-disable-line no-unused-expressions

		let drag;
		let currentOpacity = 1.0;
		let lastMx = Mouse.screen.x;
		let lastMy = Mouse.screen.y;

		// Stop drag on mouseup / touchend
		const onEnd = ev => {
			if (ev.type === 'touchend' || ev.which === 1 || ev.isTrigger) {
				cancelAnimationFrame(drag);
				window.removeEventListener('mouseup', onEnd);
				window.removeEventListener('touchend', onEnd);
				_snapCache = [];

				if (component.gridSnap) {
					const gw = component.gridSnap.width;
					const gh = component.gridSnap.height;
					const padX = component.gridSnap.padX || 0;
					const padY = component.gridSnap.padY || 0;

					const curRect = host.getBoundingClientRect();
					const maxXI = Math.floor(((getRenderer()?.width ?? window.innerWidth) - width - padX) / gw);
					const maxYI = Math.floor(((getRenderer()?.height ?? window.innerHeight) - height - padY) / gh);

					let gxi = Math.round((curRect.left - padX) / gw);
					let gyi = Math.round((curRect.top - padY) / gh);
					gxi = Math.max(0, Math.min(gxi, maxXI));
					gyi = Math.max(0, Math.min(gyi, maxYI));

					const snappedX = gxi * gw + padX;
					const snappedY = gyi * gh + padY;

					host.style.transition = `left ${component.snapDuration || 150}ms, top ${component.snapDuration || 150}ms, opacity 150ms`;
					host.style.left = `${snappedX}px`;
					host.style.top = `${snappedY}px`;
					host.style.opacity = '1';

					const onTransEnd = () => {
						host.style.transition = '';
						host.removeEventListener('transitionend', onTransEnd);
						if (component.onDragEnd) component.onDragEnd();
					};
					host.addEventListener('transitionend', onTransEnd);
				} else {
					host.style.transition = 'opacity 150ms';
					host.style.opacity = '1';
					const onTransEnd = () => {
						host.style.transition = '';
						host.removeEventListener('transitionend', onTransEnd);
						if (component.onDragEnd) component.onDragEnd();
					};
					host.addEventListener('transitionend', onTransEnd);
				}
			}
		};

		window.addEventListener('mouseup', onEnd);
		window.addEventListener('touchend', onEnd);

		// Drag loop
		const dragging = () => {
			const mx = Mouse.screen.x;
			const my = Mouse.screen.y;

			// Skip frame if mouse hasn't moved
			if (mx === lastMx && my === lastMy) {
				drag = requestAnimationFrame(dragging);
				return;
			}
			lastMx = mx;
			lastMy = my;

			let x_ = mx + x;
			let y_ = my + y;
			currentOpacity = Math.max(currentOpacity - 0.02, 0.7);

			// Reset magnet
			if (component.magnet) {
				component.magnet.TOP = component.magnet.BOTTOM = component.magnet.LEFT = component.magnet.RIGHT = false;
			}

			// Border magnet
			if (Math.abs(x_) < SNAP_DISTANCE) {
				x_ = 0;
				if (component.magnet) component.magnet.LEFT = true;
			}
			if (Math.abs(y_) < SNAP_DISTANCE) {
				y_ = 0;
				if (component.magnet) component.magnet.TOP = true;
			}
			if (Math.abs(x_ + width - Mouse.screen.width) < SNAP_DISTANCE) {
				x_ = Mouse.screen.width - width;
				if (component.magnet) component.magnet.RIGHT = true;
			}
			if (Math.abs(y_ + height - Mouse.screen.height) < SNAP_DISTANCE) {
				y_ = Mouse.screen.height - height;
				if (component.magnet) component.magnet.BOTTOM = true;
			}

			// Window magnet (snap to other components)
			if (UIPreferences.windowmagnet && component.manager) {
				const lockX = component.magnet && (component.magnet.LEFT || component.magnet.RIGHT);
				const lockY = component.magnet && (component.magnet.TOP || component.magnet.BOTTOM);
				let snapX = null,
					snapY = null;
				let snapXD = SNAP_DISTANCE + 1,
					snapYD = SNAP_DISTANCE + 1;

				const checkX = val => {
					const d = Math.abs(val - x_);
					if (d < snapXD) {
						snapXD = d;
						snapX = val;
					}
				};
				const checkY = val => {
					const d = Math.abs(val - y_);
					if (d < snapYD) {
						snapYD = d;
						snapY = val;
					}
				};
				const isNear = (sA, eA, sB, eB) => !(eA + SNAP_DISTANCE < sB || eB + SNAP_DISTANCE < sA);

				for (let i = 0; i < _snapCache.length; i++) {
					const box = _snapCache[i];
					if (!lockX && isNear(y_, y_ + height, box.top, box.bottom)) {
						checkX(box.left);
						checkX(box.right);
						checkX(box.left - width);
						checkX(box.right - width);
					}
					if (!lockY && isNear(x_, x_ + width, box.left, box.right)) {
						checkY(box.top);
						checkY(box.bottom);
						checkY(box.top - height);
						checkY(box.bottom - height);
					}
				}

				if (!lockX && snapX !== null) x_ = snapX;
				if (!lockY && snapY !== null) y_ = snapY;
			}

			host.style.left = `${x_}px`;
			host.style.top = `${y_}px`;
			host.style.opacity = currentOpacity;
			drag = requestAnimationFrame(dragging);
		};
		drag = requestAnimationFrame(dragging);
	};
	handleEl.addEventListener('mousedown', onStart);
	handleEl.addEventListener('touchstart', onStart);
	return component;
}
