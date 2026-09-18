function resetState(state) {
	state.active = false;
	state.dragging = false;
	state.moved = false;
	state.item = null;
	state.payload = null;
	state.startX = 0;
	state.startY = 0;
	state.startClientX = 0;
	state.startClientY = 0;
	state.timer = null;
	state.ghost = null;
}

export function deepElementFromPoint(x, y) {
	let el = document.elementFromPoint(x, y);

	while (el?.shadowRoot) {
		const inner = el.shadowRoot.elementFromPoint(x, y);
		if (!inner || inner === el) {
			break;
		}
		el = inner;
	}

	return el;
}

export function attachTouchDrag(
	container,
	{ itemSelector, getPayload, createGhost = null, holdDelay = 300, moveThreshold = 10 }
) {
	const state = {
		active: false,
		dragging: false,
		moved: false,
		item: null,
		payload: null,
		startX: 0,
		startY: 0,
		startClientX: 0,
		startClientY: 0,
		timer: null,
		ghost: null
	};

	const removeGhost = () => {
		if (state.ghost) {
			state.ghost.remove();
			state.ghost = null;
		}
	};

	const cancel = () => {
		if (state.timer !== null) {
			clearTimeout(state.timer);
		}
		removeGhost();
		delete window._OBJ_DRAG_;
		resetState(state);
	};

	const startDrag = () => {
		if (!state.active || !state.item || !state.payload) {
			return;
		}

		state.timer = null;
		state.dragging = true;
		state.ghost = createGhost ? createGhost(state.item) : state.item.cloneNode(true);
		state.ghost.style.position = 'fixed';
		state.ghost.style.zIndex = '10000';
		state.ghost.style.opacity = '0.8';
		state.ghost.style.pointerEvents = 'none';
		state.ghost.style.left = `${state.startClientX - 12}px`;
		state.ghost.style.top = `${state.startClientY - 12}px`;
		document.body.appendChild(state.ghost);
		window._OBJ_DRAG_ = state.payload;
	};

	const onTouchStart = event => {
		if (event.touches.length !== 1) {
			return;
		}

		const item = event.target.closest(itemSelector);
		if (!item || !container.contains(item)) {
			return;
		}

		const payload = getPayload(item);
		if (payload === null || payload === undefined) {
			return;
		}

		const touch = event.touches[0];
		state.active = true;
		state.dragging = false;
		state.moved = false;
		state.item = item;
		state.payload = payload;
		state.startX = touch.pageX;
		state.startY = touch.pageY;
		state.startClientX = touch.clientX;
		state.startClientY = touch.clientY;
		state.timer = setTimeout(startDrag, holdDelay);
	};

	const onTouchMove = event => {
		if (!state.active || !event.touches.length) {
			return;
		}

		const touch = event.touches[0];
		const dx = touch.pageX - state.startX;
		const dy = touch.pageY - state.startY;
		if (Math.sqrt(dx * dx + dy * dy) > moveThreshold) {
			state.moved = true;
		}

		if (state.dragging) {
			event.preventDefault();
			state.ghost.style.left = `${touch.clientX - 12}px`;
			state.ghost.style.top = `${touch.clientY - 12}px`;
		} else if (state.moved && state.timer !== null) {
			clearTimeout(state.timer);
			resetState(state);
		}
	};

	const onTouchEnd = event => {
		if (!state.active) {
			return;
		}

		if (state.timer !== null) {
			clearTimeout(state.timer);
		}

		if (state.dragging) {
			removeGhost();
			const touch = event.changedTouches[0];
			const target = deepElementFromPoint(touch.clientX, touch.clientY);

			if (target) {
				const dropEvent = new Event('drop', { bubbles: true, composed: true });
				dropEvent.dataTransfer = {
					getData: type => (type === 'Text' ? JSON.stringify(state.payload) : '')
				};
				target.dispatchEvent(dropEvent);
			}

			delete window._OBJ_DRAG_;
		}

		resetState(state);
	};

	const onTouchCancel = () => {
		if (state.active) {
			cancel();
		}
	};

	const onDragStart = event => {
		if (state.active) {
			event.preventDefault();
			event.stopImmediatePropagation();
		}
	};

	const onContextMenu = event => {
		if (!state.active) {
			return;
		}

		if (state.dragging && state.moved) {
			event.preventDefault();
			event.stopImmediatePropagation();
			return;
		}

		cancel();
	};

	container.addEventListener('touchstart', onTouchStart);
	container.addEventListener('touchmove', onTouchMove, { passive: false });
	container.addEventListener('touchend', onTouchEnd);
	container.addEventListener('touchcancel', onTouchCancel);
	container.addEventListener('dragstart', onDragStart, true);
	container.addEventListener('contextmenu', onContextMenu, true);

	return () => {
		container.removeEventListener('touchstart', onTouchStart);
		container.removeEventListener('touchmove', onTouchMove);
		container.removeEventListener('touchend', onTouchEnd);
		container.removeEventListener('touchcancel', onTouchCancel);
		container.removeEventListener('dragstart', onDragStart, true);
		container.removeEventListener('contextmenu', onContextMenu, true);
		cancel();
	};
}
