/**
 * UI/DragManager.js
 *
 * Custom drag source manager for game UI payload dragging.
 * Uses pointer/mouse/touch events instead of browser-native HTML drag/drop.
 *
 * @author MrUnzO
 */

import DropManager from 'UI/DropManager.js';

const DEFAULT_THRESHOLD = 4;
const DEFAULT_TOUCH_DELAY_CANCEL_THRESHOLD = 10;
const DEFAULT_Z_INDEX = 2500;
const TEXT_TYPES = ['Text', 'text', 'text/plain'];

const _registrations = new Map();
let _nextId = 1;
let _session = null;
let _suppressingClick = false;

function getSourceEvent(event) {
	return event && event.originalEvent ? event.originalEvent : event;
}

function getEventPoint(event) {
	const source = getSourceEvent(event);
	const touch =
		source &&
		((source.touches && source.touches[0]) ||
			(source.changedTouches && source.changedTouches[source.changedTouches.length - 1]));

	if (touch) {
		return {
			clientX: touch.clientX,
			clientY: touch.clientY,
			pageX: touch.pageX,
			pageY: touch.pageY
		};
	}

	return {
		clientX: source && source.clientX !== undefined ? source.clientX : 0,
		clientY: source && source.clientY !== undefined ? source.clientY : 0,
		pageX: source && source.pageX !== undefined ? source.pageX : 0,
		pageY: source && source.pageY !== undefined ? source.pageY : 0
	};
}

function isPrimaryStart(event) {
	const source = getSourceEvent(event);

	if (!source) {
		return false;
	}

	if (source.type === 'touchstart') {
		return !source.touches || source.touches.length === 1;
	}

	if (source.type === 'pointerdown') {
		return (source.isPrimary === undefined || source.isPrimary) && source.button === 0;
	}

	return source.button === 0 || source.which === 1;
}

function isTouchStartEvent(event) {
	const source = getSourceEvent(event);
	if (!source) {
		return false;
	}

	return source.type === 'touchstart' || (source.type === 'pointerdown' && source.pointerType === 'touch');
}

function isEndEvent(event) {
	const source = getSourceEvent(event);
	if (!source) {
		return false;
	}
	return (
		source.type === 'mouseup' ||
		source.type === 'pointerup' ||
		source.type === 'pointercancel' ||
		source.type === 'touchend' ||
		source.type === 'touchcancel' ||
		source.button === 0 ||
		source.which === 1
	);
}

function unwrapElement(value) {
	if (!value) {
		return null;
	}

	const isElement = typeof Node !== 'undefined' && value.nodeType === Node.ELEMENT_NODE;
	const isShadowRoot = typeof ShadowRoot !== 'undefined' && value instanceof ShadowRoot;
	if (isElement || isShadowRoot) {
		return value;
	}

	return value[0] || null;
}

function containsNode(root, node) {
	if (!root || !node) {
		return false;
	}

	if (root === node) {
		return true;
	}

	if (typeof root.contains === 'function' && root.contains(node)) {
		return true;
	}

	const nodeRoot = node.getRootNode ? node.getRootNode() : null;
	return root === nodeRoot;
}

function isDisconnected(node) {
	return node && node.isConnected === false;
}

function isStalePendingSession(session) {
	if (!session || session.active) {
		return false;
	}

	return (
		!session.root ||
		!session.source ||
		isDisconnected(session.root) ||
		isDisconnected(session.source) ||
		!containsNode(session.root, session.source)
	);
}

function cancelStalePendingSession(event, reason) {
	if (!isStalePendingSession(_session)) {
		return false;
	}

	cleanupSession('cancel', event, reason);
	return true;
}

function isDuplicatePendingStart(session, event, registration) {
	if (!session || session.active || session.registration !== registration) {
		return false;
	}

	const startSource = getSourceEvent(session.startEvent);
	const source = getSourceEvent(event);
	const startType = startSource && startSource.type;
	const type = source && source.type;

	return (
		(startType === 'pointerdown' && type === 'mousedown') ||
		(startType === 'touchstart' && (type === 'mousedown' || type === 'pointerdown'))
	);
}

function cancelPendingSession(event, reason) {
	if (!_session || _session.active) {
		return false;
	}

	cleanupSession('cancel', event, reason);
	return true;
}

function findSource(root, selector, target) {
	if (!target || target.nodeType !== Node.ELEMENT_NODE) {
		return null;
	}

	if (!selector) {
		return containsNode(root, target) ? root : null;
	}

	const source = target.closest(selector);
	return source && containsNode(root, source) ? source : null;
}

function normalizeAppendTo(appendTo) {
	const target = unwrapElement(appendTo);
	return target || document.body;
}

function copyComputedStyle(source, clone) {
	if (!source || !clone || source.nodeType !== Node.ELEMENT_NODE || clone.nodeType !== Node.ELEMENT_NODE) {
		return;
	}

	const style = window.getComputedStyle(source);
	for (let i = 0; i < style.length; i++) {
		const property = style[i];
		clone.style.setProperty(property, style.getPropertyValue(property), style.getPropertyPriority(property));
	}

	const sourceChildren = source.children || [];
	const cloneChildren = clone.children || [];
	for (let i = 0; i < sourceChildren.length && i < cloneChildren.length; i++) {
		copyComputedStyle(sourceChildren[i], cloneChildren[i]);
	}
}

function createDefaultHelper(source) {
	const helper = source.cloneNode(true);
	copyComputedStyle(source, helper);
	return helper;
}

function getHelperOffset(source, helper, cursorAt, startPoint) {
	const sourceRect = source.getBoundingClientRect();
	const helperRect = helper.getBoundingClientRect();
	const width = helperRect.width || sourceRect.width;
	const height = helperRect.height || sourceRect.height;

	if (cursorAt) {
		let offsetX = cursorAt.left !== undefined ? cursorAt.left : startPoint.clientX - sourceRect.left;
		let offsetY = cursorAt.top !== undefined ? cursorAt.top : startPoint.clientY - sourceRect.top;

		if (cursorAt.right !== undefined) {
			offsetX = width - cursorAt.right;
		}
		if (cursorAt.bottom !== undefined) {
			offsetY = height - cursorAt.bottom;
		}

		return { x: offsetX, y: offsetY };
	}

	return {
		x: startPoint.clientX - sourceRect.left,
		y: startPoint.clientY - sourceRect.top
	};
}

function positionHelper(helper, point, offset) {
	helper.style.left = point.clientX - offset.x + 'px';
	helper.style.top = point.clientY - offset.y + 'px';
}

function getElementFromPoint(point) {
	return document.elementFromPoint ? document.elementFromPoint(point.clientX, point.clientY) : null;
}

function createDomDragEvent(type, event, data, target) {
	const legacyEvent = DragManager.createLegacyEvent(type, event, data, target);
	const domEvent = new Event(type, {
		bubbles: true,
		cancelable: true
	});

	Object.defineProperties(domEvent, {
		dataTransfer: { configurable: true, value: legacyEvent.originalEvent.dataTransfer },
		clientX: { configurable: true, value: legacyEvent.clientX },
		clientY: { configurable: true, value: legacyEvent.clientY },
		pageX: { configurable: true, value: legacyEvent.pageX },
		pageY: { configurable: true, value: legacyEvent.pageY },
		button: { configurable: true, value: legacyEvent.button },
		which: { configurable: true, value: legacyEvent.which }
	});

	return domEvent;
}

function dispatchLegacyDomDrop(target, event, data) {
	if (!target || typeof target.dispatchEvent !== 'function') {
		return;
	}

	target.dispatchEvent(createDomDragEvent('drop', event, data, target));
}

function callCallback(callback, source, event, data, extra) {
	if (typeof callback !== 'function') {
		return undefined;
	}
	return callback(source, event, data, extra);
}

function clearTouchDelayTimer(session) {
	if (session && session.touchDelayTimer) {
		clearTimeout(session.touchDelayTimer);
		session.touchDelayTimer = null;
	}
}

function startTouchDelayTimer(session) {
	if (!session.touchDelay) {
		return;
	}

	session.touchDelayTimer = setTimeout(() => {
		if (_session !== session || session.active) {
			return;
		}

		clearTouchDelayTimer(session);
		session.touchDelayElapsed = true;

		if (isStalePendingSession(session)) {
			cleanupSession('cancel', session.lastEvent || session.startEvent, 'stale-source');
			return;
		}

		activateSession(session, session.lastEvent || session.startEvent);
	}, session.touchDelay);
}

function addMoveEndListeners(session) {
	const move = onMove;
	const end = onEnd;
	const cancel = onCancel;

	if (session.pointerId !== null && session.pointerId !== undefined) {
		window.addEventListener('pointermove', move, true);
		window.addEventListener('pointerup', end, true);
		window.addEventListener('pointercancel', cancel, true);
	}

	window.addEventListener('mousemove', move, true);
	window.addEventListener('mouseup', end, true);
	window.addEventListener('touchmove', move, { capture: true, passive: false });
	window.addEventListener('touchend', end, true);
	window.addEventListener('touchcancel', cancel, true);
	window.addEventListener('blur', cancel, true);
}

function removeMoveEndListeners(session) {
	if (!session) {
		return;
	}

	window.removeEventListener('pointermove', onMove, true);
	window.removeEventListener('pointerup', onEnd, true);
	window.removeEventListener('pointercancel', onCancel, true);
	window.removeEventListener('mousemove', onMove, true);
	window.removeEventListener('mouseup', onEnd, true);
	window.removeEventListener('touchmove', onMove, true);
	window.removeEventListener('touchend', onEnd, true);
	window.removeEventListener('touchcancel', onCancel, true);
	window.removeEventListener('blur', onCancel, true);
}

function suppressNextClick(event) {
	if (!_suppressingClick) {
		return;
	}

	_suppressingClick = false;
	event.preventDefault();
	event.stopPropagation();
	if (typeof event.stopImmediatePropagation === 'function') {
		event.stopImmediatePropagation();
	}
	window.removeEventListener('click', suppressNextClick, true);
}

function requestClickSuppression() {
	_suppressingClick = true;
	window.addEventListener('click', suppressNextClick, true);
	setTimeout(() => {
		_suppressingClick = false;
		window.removeEventListener('click', suppressNextClick, true);
	}, 0);
}

function makeHelper(session, data) {
	const helperOption = session.options.helper;
	const helper = unwrapElement(
		typeof helperOption === 'function' ? helperOption(session.source, data) : createDefaultHelper(session.source)
	);

	if (!helper) {
		return null;
	}

	const appendTo = normalizeAppendTo(session.options.appendTo);
	helper.setAttribute('aria-hidden', 'true');
	helper.style.position = 'fixed';
	helper.style.zIndex = String(session.options.zIndex || DEFAULT_Z_INDEX);
	helper.style.pointerEvents = 'none';
	helper.style.margin = '0';
	helper.style.left = '-9999px';
	helper.style.top = '-9999px';
	appendTo.appendChild(helper);

	return helper;
}

function activateSession(session, event) {
	const data = session.options.data(session.source, event);
	if (data === null || data === undefined || data === false) {
		cleanupSession('cancel', event, 'data');
		return false;
	}

	const helper = makeHelper(session, data);
	if (!helper) {
		cleanupSession('cancel', event, 'helper');
		return false;
	}

	const point = getEventPoint(event);
	session.active = true;
	session.data = data;
	session.helper = helper;
	session.offset = getHelperOffset(session.source, helper, session.options.cursorAt, session.startPoint);

	if (typeof window !== 'undefined') {
		window._OBJ_DRAG_ = data;
	}

	if (session.options.sourceClass) {
		session.source.classList.add(session.options.sourceClass);
	}
	if (session.options.hideSource) {
		session.previousVisibility = session.source.style.visibility;
		session.source.style.visibility = 'hidden';
	}

	positionHelper(helper, point, session.offset);
	callCallback(session.options.start, session.source, event, data);
	DropManager.overAt(
		point.clientX,
		point.clientY,
		DragManager.createLegacyEvent('dragover', event, data, getElementFromPoint(point)),
		data
	);
	return true;
}

function cleanupSession(kind, event, reasonOrResult) {
	const session = _session;
	if (!session) {
		return null;
	}

	_session = null;
	clearTouchDelayTimer(session);
	removeMoveEndListeners(session);

	let result = null;
	if (session.active) {
		DropManager.clearHover(DragManager.createLegacyEvent('dragend', event, session.data), session.data);

		if (session.helper && session.helper.parentNode) {
			session.helper.parentNode.removeChild(session.helper);
		}
		if (session.options.sourceClass) {
			session.source.classList.remove(session.options.sourceClass);
		}
		if (session.options.hideSource) {
			session.source.style.visibility = session.previousVisibility || '';
		}

		if (typeof window !== 'undefined' && window._OBJ_DRAG_ === session.data) {
			delete window._OBJ_DRAG_;
		}

		if (kind === 'end') {
			result = reasonOrResult;
			callCallback(session.options.end, session.source, event, session.data, result);
			requestClickSuppression();
		} else {
			callCallback(session.options.cancel, session.source, event, session.data, reasonOrResult);
		}
	}

	return result;
}

function onMove(event) {
	if (cancelStalePendingSession(event, 'stale-source')) {
		return;
	}

	const session = _session;
	if (!session) {
		return;
	}

	const source = getSourceEvent(event);
	if (
		session.pointerId !== null &&
		session.pointerId !== undefined &&
		source.pointerId !== undefined &&
		source.pointerId !== session.pointerId
	) {
		return;
	}

	const point = getEventPoint(event);
	const dx = point.clientX - session.startPoint.clientX;
	const dy = point.clientY - session.startPoint.clientY;
	session.lastEvent = event;

	if (!session.active) {
		const distance = Math.sqrt(dx * dx + dy * dy);
		if (session.touchDelay && !session.touchDelayElapsed) {
			if (distance >= session.touchDelayCancelThreshold) {
				cleanupSession('cancel', event, 'touch-move');
			}
			return;
		}
		if (distance < session.threshold) {
			return;
		}
		if (!activateSession(session, event)) {
			return;
		}
	}

	if (typeof event.preventDefault === 'function') {
		event.preventDefault();
	}

	positionHelper(session.helper, point, session.offset);
	const legacyEvent = DragManager.createLegacyEvent('dragover', event, session.data, getElementFromPoint(point));
	DropManager.overAt(point.clientX, point.clientY, legacyEvent, session.data);
	callCallback(session.options.move, session.source, event, session.data);
}

function onEnd(event) {
	if (cancelStalePendingSession(event, 'stale-source')) {
		return;
	}

	const session = _session;
	if (!session || !isEndEvent(event)) {
		return;
	}

	let result = null;
	if (session.active) {
		const point = getEventPoint(event);
		const target = getElementFromPoint(point);
		const legacyEvent = DragManager.createLegacyEvent('drop', event, session.data, target);
		result = DropManager.dropAt(point.clientX, point.clientY, legacyEvent, session.data);
		if (!result) {
			dispatchLegacyDomDrop(target, event, session.data);
		}
	}

	cleanupSession('end', event, result);
}

function onCancel(event) {
	if (event && event.type === 'blur' && event.target !== window && event.target !== document) {
		return;
	}
	cleanupSession('cancel', event, 'cancel');
}

function onNativeDragStart(event, registration) {
	const source = findSource(registration.root, registration.options.selector, event.target);
	if (!source) {
		return;
	}

	event.preventDefault();
	event.stopPropagation();
	if (typeof event.stopImmediatePropagation === 'function') {
		event.stopImmediatePropagation();
	}
}

function onStart(event, registration) {
	if (!isPrimaryStart(event)) {
		return;
	}

	if (_session) {
		if (cancelStalePendingSession(event, 'stale-source')) {
			// Continue with this new start event.
		} else if (isDuplicatePendingStart(_session, event, registration)) {
			return;
		} else if (!cancelPendingSession(event, 'abandoned-start')) {
			return;
		}
	}

	const source = findSource(registration.root, registration.options.selector, event.target);
	if (!source) {
		return;
	}

	const point = getEventPoint(event);
	const sourceEvent = getSourceEvent(event);
	const touchDelay = isTouchStartEvent(event) ? Number(registration.options.touchDelay) || 0 : 0;

	_session = {
		registration,
		options: registration.options,
		root: registration.root,
		source,
		startEvent: event,
		lastEvent: event,
		startPoint: point,
		pointerId: sourceEvent && sourceEvent.type === 'pointerdown' ? sourceEvent.pointerId : null,
		threshold:
			registration.options.threshold === undefined
				? DEFAULT_THRESHOLD
				: Number(registration.options.threshold) || 0,
		touchDelay,
		touchDelayElapsed: !touchDelay,
		touchDelayCancelThreshold:
			registration.options.touchDelayCancelThreshold === undefined
				? DEFAULT_TOUCH_DELAY_CANCEL_THRESHOLD
				: Number(registration.options.touchDelayCancelThreshold) || 0,
		touchDelayTimer: null,
		active: false,
		data: null,
		helper: null,
		offset: null,
		previousVisibility: ''
	};

	addMoveEndListeners(_session);
	startTouchDelayTimer(_session);
}

class DragManager {
	static register(root, options = {}) {
		const element = unwrapElement(root);
		const isElement = typeof Node !== 'undefined' && element && element.nodeType === Node.ELEMENT_NODE;
		const isShadowRoot = typeof ShadowRoot !== 'undefined' && element instanceof ShadowRoot;
		if (!element || (!isElement && !isShadowRoot)) {
			throw new TypeError('DragManager.register() requires a DOM element or ShadowRoot.');
		}

		if (typeof options.data !== 'function') {
			throw new TypeError('DragManager.register() requires a data callback.');
		}

		const registration = {
			id: _nextId++,
			root: element,
			component: options.component || null,
			options: {
				...options,
				threshold: options.threshold === undefined ? DEFAULT_THRESHOLD : options.threshold,
				zIndex: options.zIndex || DEFAULT_Z_INDEX
			}
		};

		registration.onPointerDown = event => onStart(event, registration);
		registration.onMouseDown = event => onStart(event, registration);
		registration.onTouchStart = event => onStart(event, registration);
		registration.onDragStart = event => onNativeDragStart(event, registration);

		element.addEventListener('pointerdown', registration.onPointerDown, true);
		element.addEventListener('mousedown', registration.onMouseDown, true);
		element.addEventListener('touchstart', registration.onTouchStart, { capture: true, passive: true });
		element.addEventListener('dragstart', registration.onDragStart, true);

		_registrations.set(registration.id, registration);

		let active = true;
		const unregister = () => {
			if (!active) {
				return false;
			}
			active = false;
			return DragManager.unregister(registration.id);
		};

		unregister.__dragManagerId = registration.id;
		return unregister;
	}

	static unregister(token) {
		if (!token) {
			return false;
		}

		if (typeof token === 'function' && token.__dragManagerId) {
			return token();
		}

		const registration =
			typeof token === 'number' ? _registrations.get(token) : token.id ? _registrations.get(token.id) : null;

		if (!registration) {
			return false;
		}

		if (_session && _session.registration === registration) {
			this.cancel('unregister');
		}

		registration.root.removeEventListener('pointerdown', registration.onPointerDown, true);
		registration.root.removeEventListener('mousedown', registration.onMouseDown, true);
		registration.root.removeEventListener('touchstart', registration.onTouchStart, true);
		registration.root.removeEventListener('dragstart', registration.onDragStart, true);
		_registrations.delete(registration.id);
		return true;
	}

	static unregisterComponent(component) {
		let removed = false;

		for (const registration of Array.from(_registrations.values())) {
			if (registration.component === component) {
				removed = this.unregister(registration.id) || removed;
			}
		}

		return removed;
	}

	static start(event, options) {
		if (!options || typeof options.data !== 'function') {
			throw new TypeError('DragManager.start() requires a data callback.');
		}

		const sourceEvent = getSourceEvent(event);
		const source = unwrapElement(options && options.source) || (sourceEvent && sourceEvent.target);
		const root = unwrapElement(options && options.root) || source;
		if (!root || !source) {
			return null;
		}

		const registration = {
			id: 0,
			root,
			component: options?.component || null,
			options: {
				...options,
				selector: null,
				threshold: options?.threshold === undefined ? DEFAULT_THRESHOLD : options.threshold,
				zIndex: options?.zIndex || DEFAULT_Z_INDEX
			}
		};
		onStart(event, registration);
		return _session;
	}

	static cancel(reason = 'cancel') {
		cleanupSession('cancel', null, reason);
	}

	static isDragging() {
		return Boolean(_session && _session.active);
	}

	static getData() {
		return _session && _session.active ? _session.data : null;
	}

	static createLegacyEvent(type, event, data, target) {
		if (event && event.__dragManagerLegacyEvent) {
			return event;
		}

		const source = getSourceEvent(event) || {};
		const point = getEventPoint(event);
		const json = (() => {
			try {
				return JSON.stringify(data);
			} catch (_e) {
				return '';
			}
		})();
		const dataTransfer = {
			dropEffect: 'move',
			effectAllowed: 'move',
			getData(requestedType) {
				return TEXT_TYPES.includes(requestedType) ? json : '';
			},
			setData() {},
			setDragImage() {}
		};

		const originalEvent = Object.create(source || null);
		Object.defineProperties(originalEvent, {
			type: { configurable: true, value: type },
			target: { configurable: true, value: target || source.target || null },
			currentTarget: { configurable: true, value: target || source.currentTarget || null },
			clientX: { configurable: true, value: point.clientX },
			clientY: { configurable: true, value: point.clientY },
			pageX: { configurable: true, value: point.pageX },
			pageY: { configurable: true, value: point.pageY },
			dataTransfer: { configurable: true, value: dataTransfer }
		});

		const legacyEvent = {
			__dragManagerLegacyEvent: true,
			type,
			target: target || source.target || null,
			currentTarget: target || source.currentTarget || null,
			which: source.which || (source.button !== undefined ? source.button + 1 : 1),
			button: source.button || 0,
			clientX: point.clientX,
			clientY: point.clientY,
			pageX: point.pageX,
			pageY: point.pageY,
			originalEvent,
			defaultPrevented: false,
			propagationStopped: false,
			immediatePropagationStopped: false,
			preventDefault() {
				this.defaultPrevented = true;
				if (typeof source.preventDefault === 'function') {
					source.preventDefault();
				}
			},
			stopPropagation() {
				this.propagationStopped = true;
				if (typeof source.stopPropagation === 'function') {
					source.stopPropagation();
				}
			},
			stopImmediatePropagation() {
				this.immediatePropagationStopped = true;
				if (typeof source.stopImmediatePropagation === 'function') {
					source.stopImmediatePropagation();
				} else if (typeof source.stopPropagation === 'function') {
					source.stopPropagation();
				}
			}
		};

		return legacyEvent;
	}
}

export default DragManager;
