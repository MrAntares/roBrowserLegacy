/**
 * UI/DropManager.js
 *
 * Native drag/drop router for Shadow DOM-aware UI components.
 */

const DATA_TRANSFER_TYPES = ['Text', 'text/plain'];

const _zones = new Map();
let _nextId = 1;
let _nextOrder = 1;
let _installed = false;
let _hoveredZone = null;

function getSourceEvent(event) {
	return event && event.originalEvent ? event.originalEvent : event;
}

function getEventClientX(event) {
	const source = getSourceEvent(event);
	return source ? source.clientX : 0;
}

function getEventClientY(event) {
	const source = getSourceEvent(event);
	return source ? source.clientY : 0;
}

function isShadowRoot(root) {
	return typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot;
}

function getComposedParent(element) {
	if (!element) {
		return null;
	}

	if (element.parentElement) {
		return element.parentElement;
	}

	const root = element.getRootNode ? element.getRootNode() : null;
	if (isShadowRoot(root)) {
		return root.host;
	}

	return null;
}

function isElementVisible(element) {
	let current = element;

	while (current && current.nodeType === Node.ELEMENT_NODE) {
		const style = window.getComputedStyle(current);
		if (style.display === 'none' || style.visibility === 'hidden') {
			return false;
		}
		current = getComposedParent(current);
	}

	return true;
}

function getRectArea(rect) {
	return Math.max(rect.width, 0) * Math.max(rect.height, 0);
}

function isPointInsideRect(clientX, clientY, rect) {
	if (rect.width <= 0 || rect.height <= 0) {
		return false;
	}

	const right = rect.left + rect.width;
	const bottom = rect.top + rect.height;
	return clientX >= rect.left && clientX <= right && clientY >= rect.top && clientY <= bottom;
}

function parseDataPayload(value) {
	if (!value) {
		return null;
	}

	try {
		return JSON.parse(value);
	} catch (_e) {
		return value;
	}
}

function readElementZIndex(element) {
	let current = element;

	while (current && current.nodeType === Node.ELEMENT_NODE) {
		const style = window.getComputedStyle(current);
		const zIndex = parseInt(style.zIndex, 10);
		if (!Number.isNaN(zIndex)) {
			return zIndex;
		}
		current = getComposedParent(current);
	}

	return 0;
}

function getDefaultZIndex(zone) {
	if (zone.component && zone.component._host) {
		return readElementZIndex(zone.component._host);
	}

	const root = zone.element.getRootNode ? zone.element.getRootNode() : null;
	if (isShadowRoot(root)) {
		return readElementZIndex(root.host);
	}

	return readElementZIndex(zone.element);
}

function getZoneZIndex(zone) {
	if (typeof zone.getZIndex === 'function') {
		const value = Number(zone.getZIndex(zone));
		if (!Number.isNaN(value)) {
			return value;
		}
	}

	return getDefaultZIndex(zone);
}

function acceptsZone(zone, data, event) {
	if (typeof zone.accept === 'function') {
		return Boolean(zone.accept(data, event, zone));
	}

	return data !== null && data !== undefined;
}

function getEligibleZone(zone, clientX, clientY, data, event) {
	const element = zone.element;
	if (!element || !element.isConnected || !isElementVisible(element)) {
		return null;
	}

	const rect = element.getBoundingClientRect();
	if (!isPointInsideRect(clientX, clientY, rect)) {
		return null;
	}

	if (!acceptsZone(zone, data, event)) {
		return null;
	}

	return {
		zone,
		zIndex: getZoneZIndex(zone),
		area: getRectArea(rect),
		order: zone.order
	};
}

function setHoveredZone(zone, event, data) {
	if (_hoveredZone === zone) {
		return;
	}

	if (_hoveredZone && typeof _hoveredZone.leave === 'function') {
		_hoveredZone.leave(event, data, _hoveredZone);
	}

	_hoveredZone = zone;

	if (_hoveredZone && typeof _hoveredZone.enter === 'function') {
		_hoveredZone.enter(event, data, _hoveredZone);
	}
}

function stopMatchedEvent(event, zone) {
	if (!event) {
		return;
	}

	if (typeof event.preventDefault === 'function') {
		event.preventDefault();
	}

	if (zone.stopPropagation && typeof event.stopPropagation === 'function') {
		event.stopPropagation();
	}
}

function onDragOver(event) {
	const data = DropManager.getDragData(event);
	DropManager.overAt(getEventClientX(event), getEventClientY(event), event, data);
}

function onDrop(event) {
	const data = DropManager.getDragData(event);
	const zone = DropManager.getTargetAt(getEventClientX(event), getEventClientY(event), data, event);

	setHoveredZone(null, event, data);

	if (!zone) {
		return;
	}

	stopMatchedEvent(event, zone);
	zone.drop(event, data, zone);
}

function onDragEnd(event) {
	setHoveredZone(null, event, DropManager.getDragData(event));
}

function installListeners() {
	if (_installed || typeof document === 'undefined') {
		return;
	}

	document.addEventListener('dragover', onDragOver, true);
	document.addEventListener('drop', onDrop, true);
	document.addEventListener('dragend', onDragEnd, true);

	if (typeof window !== 'undefined') {
		window.addEventListener('blur', onDragEnd);
	}

	_installed = true;
}

function removeListenersIfIdle() {
	if (!_installed || _zones.size > 0 || typeof document === 'undefined') {
		return;
	}

	document.removeEventListener('dragover', onDragOver, true);
	document.removeEventListener('drop', onDrop, true);
	document.removeEventListener('dragend', onDragEnd, true);

	if (typeof window !== 'undefined') {
		window.removeEventListener('blur', onDragEnd);
	}

	_installed = false;
	setHoveredZone(null, null, null);
}

function unregisterZone(zone) {
	if (!zone || !_zones.has(zone.id)) {
		return false;
	}

	if (_hoveredZone === zone) {
		_hoveredZone = null;
	}

	_zones.delete(zone.id);
	removeListenersIfIdle();
	return true;
}

class DropManager {
	static register(element, options = {}) {
		if (!element || element.nodeType !== Node.ELEMENT_NODE) {
			throw new TypeError('DropManager.register() requires a DOM element.');
		}

		if (typeof options.drop !== 'function') {
			throw new TypeError('DropManager.register() requires a drop callback.');
		}

		const zone = {
			id: _nextId++,
			order: _nextOrder++,
			element,
			component: options.component || null,
			accept: options.accept,
			drop: options.drop,
			enter: options.enter,
			leave: options.leave,
			over: options.over,
			getZIndex: options.getZIndex,
			stopPropagation: options.stopPropagation !== false
		};

		_zones.set(zone.id, zone);
		installListeners();

		let active = true;
		const unregister = () => {
			if (!active) {
				return false;
			}
			active = false;
			return unregisterZone(zone);
		};

		unregister.__dropManagerZoneId = zone.id;
		return unregister;
	}

	static unregister(elementOrToken) {
		if (!elementOrToken) {
			return false;
		}

		if (typeof elementOrToken === 'function' && elementOrToken.__dropManagerZoneId) {
			return elementOrToken();
		}

		if (typeof elementOrToken === 'number') {
			return unregisterZone(_zones.get(elementOrToken));
		}

		if (elementOrToken.id && _zones.has(elementOrToken.id)) {
			return unregisterZone(elementOrToken);
		}

		let removed = false;
		for (const zone of Array.from(_zones.values())) {
			if (zone.element === elementOrToken) {
				removed = unregisterZone(zone) || removed;
			}
		}

		return removed;
	}

	static unregisterComponent(component) {
		let removed = false;

		for (const zone of Array.from(_zones.values())) {
			if (zone.component === component) {
				removed = unregisterZone(zone) || removed;
			}
		}

		return removed;
	}

	static getTargetAt(clientX, clientY, data, event) {
		const dragData = data === undefined ? this.getDragData(event) : data;
		const candidates = [];

		for (const zone of _zones.values()) {
			const candidate = getEligibleZone(zone, clientX, clientY, dragData, event);
			if (candidate) {
				candidates.push(candidate);
			}
		}

		candidates.sort((a, b) => {
			if (a.zIndex !== b.zIndex) {
				return b.zIndex - a.zIndex;
			}
			if (a.area !== b.area) {
				return a.area - b.area;
			}
			return b.order - a.order;
		});

		return candidates.length ? candidates[0].zone : null;
	}

	static dropAt(clientX, clientY, event, data) {
		const dragData = data === undefined ? this.getDragData(event) : data;
		const zone = this.getTargetAt(clientX, clientY, dragData, event);

		setHoveredZone(null, event, dragData);

		if (!zone) {
			return null;
		}

		stopMatchedEvent(event, zone);
		zone.drop(event, dragData, zone);
		return zone;
	}

	static overAt(clientX, clientY, event, data) {
		const dragData = data === undefined ? this.getDragData(event) : data;
		const zone = this.getTargetAt(clientX, clientY, dragData, event);

		setHoveredZone(zone, event, dragData);

		if (!zone) {
			return null;
		}

		if (typeof event?.preventDefault === 'function') {
			event.preventDefault();
		}

		if (typeof zone.over === 'function') {
			zone.over(event, dragData, zone);
		}

		return zone;
	}

	static clearHover(event, data) {
		const dragData = data === undefined ? this.getDragData(event) : data;
		setHoveredZone(null, event, dragData);
	}

	static getDragData(event) {
		if (typeof window !== 'undefined' && window._OBJ_DRAG_ !== undefined) {
			return window._OBJ_DRAG_;
		}

		const source = getSourceEvent(event);
		const dataTransfer = source && source.dataTransfer;
		if (!dataTransfer || typeof dataTransfer.getData !== 'function') {
			return null;
		}

		for (const type of DATA_TRANSFER_TYPES) {
			const value = dataTransfer.getData(type);
			const data = parseDataPayload(value);
			if (data !== null) {
				return data;
			}
		}

		return null;
	}
}

export default DropManager;
