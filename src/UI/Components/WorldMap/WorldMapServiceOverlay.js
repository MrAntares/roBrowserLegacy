const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';
const BASE_WIDTH = 1280;
const BASE_HEIGHT = 1024;

// Active rAthena npc/kafras/functions_kafras.txt destination lists.
// These are intentionally per-origin: a Type 6 TownInfo entry can be a
// storage-only Kafra and must not turn into an all-to-all teleport network.
export const KAFRA_TELEPORT_ROUTES = Object.freeze({
	prontera: Object.freeze(['izlude', 'geffen', 'payon', 'morocc', 'gef_fild10', 'alberta']),
	alberta: Object.freeze(['payon', 'morocc', 'prontera']),
	aldebaran: Object.freeze(['geffen', 'yuno', 'izlude', 'mjolnir_02']),
	comodo: Object.freeze(['morocc', 'cmd_fild07', 'umbala']),
	cmd_fild07: Object.freeze(['comodo', 'morocc']),
	geffen: Object.freeze(['prontera', 'aldebaran', 'gef_fild10', 'mjolnir_02']),
	izlude: Object.freeze(['geffen', 'payon', 'morocc', 'aldebaran']),
	morocc: Object.freeze(['prontera', 'payon', 'alberta', 'comodo', 'cmd_fild07']),
	umbala: Object.freeze(['comodo']),
	payon: Object.freeze(['prontera', 'alberta', 'morocc']),
	yuno: Object.freeze(['aldebaran'])
});

// Active rAthena npc/airports/airships.txt loops.
export const AIRSHIP_ROUTES = Object.freeze([
	Object.freeze({
		id: 'domestic',
		stops: Object.freeze(['yuno', 'einbroch', 'lighthalzen', 'einbroch', 'yuno', 'hugel', 'yuno'])
	}),
	Object.freeze({ id: 'international', stops: Object.freeze(['izlude', 'yuno', 'rachel', 'izlude']) })
]);

function normalizeMapId(value) {
	return String(value || '')
		.replace(/\.gat$/i, '')
		.toLowerCase();
}

export function getKafraEntries(townInfo) {
	const entries = Array.isArray(townInfo) ? townInfo : townInfo ? [townInfo] : [];
	return entries.filter(entry => {
		if (!entry || typeof entry !== 'object') return false;
		return Number(entry.Type) === 6 || /kafra/i.test(String(entry.Name || entry.name || ''));
	});
}

export function getKafraDestinationIds(mapId) {
	return [...(KAFRA_TELEPORT_ROUTES[normalizeMapId(mapId)] || [])];
}

export function getAirshipRoutes(mapId) {
	const normalizedMapId = normalizeMapId(mapId);
	return AIRSHIP_ROUTES.filter(route => route.stops.includes(normalizedMapId));
}

function getCenter(section) {
	return {
		x: Number(section.left) + Number(section.width) / 2,
		y: Number(section.top) + Number(section.height) / 2
	};
}

function createSvg(name, className) {
	const node = document.createElementNS(SVG_NS, name);
	if (className) node.setAttribute('class', className);
	return node;
}

function getSectionNode(mapView, mapId) {
	return (
		Array.from(mapView.querySelectorAll('.section')).find(
			node => normalizeMapId(node.id) === normalizeMapId(mapId)
		) || null
	);
}

function clearHighlightClasses(mapView) {
	mapView
		.querySelectorAll('.service-origin-highlight,.service-destination-highlight')
		.forEach(node => node.classList.remove('service-origin-highlight', 'service-destination-highlight'));
}

export function clearWorldMapServiceOverlay(mapView) {
	if (!mapView) return;
	mapView.querySelectorAll('.worldmap-service-overlay').forEach(node => {
		node._cancelServiceRouteAnimations?.();
		node.querySelectorAll('.service-kafra-character').forEach(canvas => canvas._stopKafraSprite?.());
		node.remove();
	});
	clearHighlightClasses(mapView);
}

function isCurrentOverlay(mapView, overlay) {
	return overlay.isConnected && overlay.parentNode === mapView;
}

function loadImageAsset({ image, path, mapView, overlay, loadAsset, setSource }) {
	if (!path) return;
	const applySource = source => {
		if (!source || !isCurrentOverlay(mapView, overlay)) return;
		setSource(image, source);
	};
	if (typeof loadAsset === 'function') {
		loadAsset(path, applySource);
	} else {
		applySource(path);
	}
}

function setSvgImageSource(image, source) {
	image.setAttribute('href', source);
	image.setAttributeNS(XLINK_NS, 'href', source);
}

function addKafraMarker({ layer, section, renderKafraSprite }) {
	const marker = document.createElement('div');
	marker.className = 'service-kafra-marker is-origin';
	marker.dataset.mapId = section.id;
	marker.setAttribute('aria-hidden', 'true');
	const center = getCenter(section);
	marker.style.left = `${(center.x / BASE_WIDTH) * 100}%`;
	marker.style.top = `${(center.y / BASE_HEIGHT) * 100}%`;

	const character = document.createElement('canvas');
	character.className = 'service-kafra-character detail-sprite-canvas';
	character.dataset.authenticNpcSprite = '4_f_kafra1';
	marker.appendChild(character);
	layer.appendChild(marker);

	if (typeof renderKafraSprite === 'function') {
		character._stopKafraSprite = renderKafraSprite(character);
	}
}

function addDestinationName(layer, section) {
	const label = document.createElement('div');
	label.className = 'service-destination-name';
	label.dataset.destinationMapId = section.id;
	label.textContent = section.name || section.id;
	const center = getCenter(section);
	label.style.left = `${(center.x / BASE_WIDTH) * 100}%`;
	label.style.top = `${((Number(section.top) + Number(section.height) + 4) / BASE_HEIGHT) * 100}%`;
	layer.appendChild(label);
}

export function applyServiceRouteProgress(route, traveller, motionPath, progress) {
	const clampedProgress = Math.max(0, Math.min(1, Number(progress) || 0));
	route.style.strokeDashoffset = String(1 - clampedProgress);

	const routeLength = motionPath.getTotalLength();
	if (!Number.isFinite(routeLength) || routeLength <= 0) return;
	const distance = routeLength * clampedProgress;
	const tangentSample = Math.max(routeLength * 0.001, 0.01);
	const point = motionPath.getPointAtLength(distance);
	const before = motionPath.getPointAtLength(Math.max(0, distance - tangentSample));
	const after = motionPath.getPointAtLength(Math.min(routeLength, distance + tangentSample));
	const dx = after.x - before.x;
	const dy = after.y - before.y;
	const tangentLength = Math.hypot(dx, dy);
	if (!tangentLength) return;
	const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
	traveller.setAttribute(
		'transform',
		`translate(${point.x + (dx / tangentLength) * 8} ${point.y + (dy / tangentLength) * 8}) rotate(${angle})`
	);
}

function startServiceRouteAnimation(overlay, route, traveller, motionPath, index) {
	const requestFrame = globalThis.requestAnimationFrame;
	if (typeof requestFrame !== 'function') return;

	const frames = overlay._serviceRouteAnimationFrames || new Set();
	overlay._serviceRouteAnimationFrames = frames;
	if (!overlay._cancelServiceRouteAnimations) {
		overlay._cancelServiceRouteAnimations = () => {
			const cancelFrame = globalThis.cancelAnimationFrame;
			if (typeof cancelFrame === 'function') {
				frames.forEach(frameId => cancelFrame(frameId));
			}
			frames.clear();
		};
	}

	const delay = index * 80;
	const duration = 900;
	let startedAt = null;
	let frameId = null;
	const tick = timestamp => {
		frames.delete(frameId);
		if (!overlay.isConnected) return;
		if (startedAt === null) startedAt = timestamp;
		const progress = Math.max(0, Math.min(1, (timestamp - startedAt - delay) / duration));
		applyServiceRouteProgress(route, traveller, motionPath, progress);
		if (progress < 1) {
			frameId = requestFrame(tick);
			frames.add(frameId);
		}
	};

	frameId = requestFrame(tick);
	frames.add(frameId);
}

function addArrow(svg, overlay, from, to, index) {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const length = Math.sqrt(dx * dx + dy * dy);
	if (!length) return;
	const ux = dx / length;
	const uy = dy / length;
	const insetScale = Math.min(1, Math.max(0, length - 12) / (34 + 42));
	const start = { x: from.x + ux * 34 * insetScale, y: from.y + uy * 34 * insetScale };
	const end = { x: to.x - ux * 42 * insetScale, y: to.y - uy * 42 * insetScale };
	const pathData = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
	const routeLength = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
	const motionPath = {
		getTotalLength: () => routeLength,
		getPointAtLength: distance => ({
			x: start.x + ux * Math.max(0, Math.min(routeLength, distance)),
			y: start.y + uy * Math.max(0, Math.min(routeLength, distance))
		})
	};
	const progressSource = `kafra-route-${index}`;
	const progressGroup = createSvg('g', 'service-route-progress');
	progressGroup.dataset.routeScale = '1.7';

	const route = createSvg('path', 'service-route-arrow');
	route.setAttribute('d', pathData);
	route.setAttribute('pathLength', '1');
	route.dataset.progressSource = progressSource;
	progressGroup.appendChild(route);

	const traveller = createSvg('path', 'service-route-traveller');
	traveller.setAttribute('d', 'M -13.6 -8.5 L 3.4 0 L -13.6 8.5 Z');
	traveller.dataset.progressSource = progressSource;
	progressGroup.appendChild(traveller);
	svg.appendChild(progressGroup);

	applyServiceRouteProgress(route, traveller, motionPath, 0);
	startServiceRouteAnimation(overlay, route, traveller, motionPath, index);
}

function renderKafraOverlay({ overlay, mapView, origin, destinations, renderKafraSprite }) {
	const svg = createSvg('svg', 'service-route-svg service-kafra-route-svg');
	svg.setAttribute('viewBox', `0 0 ${BASE_WIDTH} ${BASE_HEIGHT}`);
	svg.setAttribute('preserveAspectRatio', 'none');
	const originCenter = getCenter(origin);
	destinations.forEach((destination, index) => addArrow(svg, overlay, originCenter, getCenter(destination), index));
	overlay.appendChild(svg);

	const markerLayer = document.createElement('div');
	markerLayer.className = 'service-marker-layer';
	overlay.appendChild(markerLayer);
	addKafraMarker({ layer: markerLayer, section: origin, renderKafraSprite });

	destinations.forEach(destination => {
		addDestinationName(markerLayer, destination);
		getSectionNode(mapView, destination.id)?.classList.add('service-destination-highlight');
	});
}

function renderAirshipRoute({ overlay, mapView, route, routeSections, hoveredMapId, airplaneSrc, loadAsset }) {
	const svg = createSvg('svg', 'service-route-svg service-airship-svg');
	svg.dataset.airshipRoute = route.id;
	svg.setAttribute('viewBox', `0 0 ${BASE_WIDTH} ${BASE_HEIGHT}`);
	svg.setAttribute('preserveAspectRatio', 'none');
	const routePath = routeSections
		.map((section, index) => {
			const point = getCenter(section);
			return `${index ? 'L' : 'M'} ${point.x} ${point.y}`;
		})
		.join(' ');

	const shadow = createSvg('path', 'service-airship-line-shadow');
	shadow.setAttribute('d', routePath);
	svg.appendChild(shadow);
	const line = createSvg('path', 'service-airship-line');
	const motionPathId = `worldmap-airship-motion-path-${route.id}`;
	line.id = motionPathId;
	line.setAttribute('d', routePath);
	svg.appendChild(line);

	const plane = createSvg('g', 'service-airplane');
	plane.dataset.facingForward = 'true';
	const smoke = createSvg('g', 'service-airplane-smoke');
	smoke.setAttribute('transform', 'scale(2)');
	for (let i = 0; i < 3; i++) {
		const puff = createSvg('circle', 'service-airplane-smoke-puff');
		puff.setAttribute('cx', String(-22 - i * 7));
		puff.setAttribute('cy', String((i - 1) * 2));
		puff.setAttribute('r', String(3.5 - i * 0.5));
		puff.style.setProperty('--smoke-delay', `${i * -0.22}s`);
		smoke.appendChild(puff);
	}
	plane.appendChild(smoke);
	const sprite = createSvg('image', 'service-airplane-sprite');
	sprite.setAttribute('width', '42');
	sprite.setAttribute('height', '42');
	sprite.setAttribute('x', '-21');
	sprite.setAttribute('y', '-21');
	// wv_airplen32.bmp is authored nose-up. Offset it by 90 degrees so
	// animateMotion's zero-degree (+X) heading puts the nose forward.
	sprite.setAttribute('transform', 'rotate(90)');
	plane.appendChild(sprite);

	const motion = createSvg('animateMotion');
	motion.setAttribute('dur', route.id === 'domestic' ? '8s' : '6s');
	motion.setAttribute('repeatCount', 'indefinite');
	motion.setAttribute('rotate', 'auto');
	const motionPath = createSvg('mpath');
	motionPath.setAttribute('href', `#${motionPathId}`);
	motionPath.setAttributeNS(XLINK_NS, 'href', `#${motionPathId}`);
	motion.appendChild(motionPath);
	plane.appendChild(motion);
	svg.appendChild(plane);
	overlay.appendChild(svg);

	loadImageAsset({ image: sprite, path: airplaneSrc, mapView, overlay, loadAsset, setSource: setSvgImageSource });

	const highlighted = new Set();
	routeSections.forEach(section => {
		const mapId = normalizeMapId(section.id);
		if (mapId === hoveredMapId || highlighted.has(mapId)) return;
		highlighted.add(mapId);
		getSectionNode(mapView, section.id)?.classList.add('service-destination-highlight');
	});
}

function resolveAirshipRouteSections(route, sectionsById) {
	const routeSections = route.stops.map(mapId => sectionsById.get(mapId));
	return routeSections.every(Boolean) ? routeSections : [];
}

export function renderWorldMapServiceOverlay({
	mapView,
	hoveredMapId,
	sections,
	getTownInfo,
	isVisible = () => true,
	airplaneSrc = '',
	renderKafraSprite,
	loadAsset
}) {
	if (!mapView || typeof getTownInfo !== 'function') return null;
	clearWorldMapServiceOverlay(mapView);
	const normalizedHoveredId = normalizeMapId(hoveredMapId);
	const visibleSections = (sections || []).filter(section => section && isVisible(section));
	const sectionsById = new Map(visibleSections.map(section => [normalizeMapId(section.id), section]));
	const origin = sectionsById.get(normalizedHoveredId);
	if (!origin) return null;

	const kafraDestinationIds = getKafraDestinationIds(normalizedHoveredId);
	const destinations = kafraDestinationIds.map(mapId => sectionsById.get(mapId)).filter(Boolean);
	const airshipRoutes = getAirshipRoutes(normalizedHoveredId)
		.map(route => ({ route, sections: resolveAirshipRouteSections(route, sectionsById) }))
		.filter(item => item.sections.length > 1);
	if (!destinations.length && !airshipRoutes.length) return null;

	const originNode = getSectionNode(mapView, origin.id);
	originNode?.classList.add('service-origin-highlight');
	const overlay = document.createElement('div');
	overlay.className = 'worldmap-service-overlay';
	overlay.setAttribute('aria-hidden', 'true');
	mapView.appendChild(overlay);

	const modes = [];
	if (destinations.length) {
		modes.push('kafra');
		renderKafraOverlay({ overlay, mapView, origin, destinations, renderKafraSprite });
	}
	if (airshipRoutes.length) {
		modes.push('airship');
		airshipRoutes.forEach(item => {
			renderAirshipRoute({
				overlay,
				mapView,
				route: item.route,
				routeSections: item.sections,
				hoveredMapId: normalizedHoveredId,
				airplaneSrc,
				loadAsset
			});
		});
	}
	overlay.dataset.mode = modes.join(' ');

	return overlay;
}
