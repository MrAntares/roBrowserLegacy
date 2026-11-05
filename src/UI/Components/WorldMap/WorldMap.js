/**
 * UI/Components/WorldMap/WorldMap.js
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author IssID
 */

import DB from 'DB/DBManager.js';
import Client from 'Core/Client.js';
import Configs from 'Core/Configs.js';
import Preferences from 'Core/Preferences.js';
import KEYS from 'Controls/KeyEventHandler.js';
import Renderer from 'Renderer/Renderer.js';
import MapRenderer from 'Renderer/MapRenderer.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import Session from 'Engine/SessionStorage.js';
import MAPS from 'DB/Map/WorldMap.js';
import { isEpisodeInRange } from 'DB/Map/NavigationEra.js';
import htmlText from './WorldMap.html?raw';
import cssText from './WorldMap.css?raw';
import Navigation from 'UI/Components/Navigation/Navigation.js';
import {
	renderWorldMapMonsterPanel,
	createWorldMapRecommendedLevelBadge,
	createWorldMapMonsterLevelRange
} from './WorldMapMonsterTooltip.js';
import { renderWorldMapServiceOverlay, clearWorldMapServiceOverlay } from './WorldMapServiceOverlay.js';

/**
 * Create Component
 */
const WorldMap = new GUIComponent('WorldMap', cssText);
WorldMap.responsiveMode = 'fixed';

WorldMap.render = () => htmlText;

/**
 * @type {Preferences} window preferences
 */
const _preferences = Preferences.get(
	'WorldMap',
	{
		x: 0,
		y: 0,
		width: window.innerWidth,
		height: window.innerHeight,
		show: false
	},
	1.0
);

// Party member store
let _partyMembersByMap = {};

let _hoveredSection = null;

let _activeWorldMapData = null;
let _navigationRoute = null;
const _worldRouteIconURI = {};

// Sizing params
const C_TITLEBARHEIGHT = 17;
const C_BASEWIDTH = 1280;
const C_BASEHEIGHT = 1024;
const C_ASPECTX = 5;
const C_ASPECTY = 4;

/**
 * Initialize UI
 */
WorldMap.init = function init() {
	const root = this.getRoot();

	const bases = root.querySelectorAll('.titlebar .base');
	bases.forEach(el => el.addEventListener('mousedown', stopPropagation));

	const selectEl = root.querySelector('.titlebar select');
	if (selectEl) selectEl.addEventListener('change', onSelect);

	const toggleBtn = root.querySelector('.titlebar .togglemaps');
	if (toggleBtn) toggleBtn.addEventListener('click', onToggleMaps);

	const showLvlBtn = root.querySelector('.titlebar .showlvl');
	if (showLvlBtn) showLvlBtn.addEventListener('click', onShowLVL);

	const closeBtn = root.querySelector('.titlebar .close');
	if (closeBtn) closeBtn.addEventListener('click', onClose);

	const content = root.querySelector('.map .content');
	if (content) {
		content.addEventListener('click', onWorldMapSectionClick);
		content.addEventListener('mouseover', onWorldMapMouseOver);
		content.addEventListener('mouseout', onWorldMapMouseOut);
	}

	WorldMap.showLVLMode = false;
	document.addEventListener('roBrowserNavigationRouteChanged', onNavigationRouteChanged);
};

/**
 * Create WorldMap list of maps (select Element)
 */
function setMapList() {
	const root = WorldMap.getRoot();
	const selectEl = root.querySelector('#WorldMaps');
	if (!selectEl) return;
	let list = '';
	for (const map of MAPS) {
		if (isEpisodeInRange(map, WorldMap.settings.episode)) {
			list += `<option value="${map.id}">${map.name}</option>`;
		}
	}
	selectEl.innerHTML = list;
}

function onSelect() {
	const root = WorldMap.getRoot();
	selectMap(root.querySelector('.titlebar select').value);
}

/**
 * Select world map
 *
 * @param {string} name eg. `"worldmap_localizing1"`
 */
function selectMap(name = null) {
	clearWorldMapServiceState();

	// If no name provided, use the first available map
	if (!name || name === null || name === '') {
		if (MAPS.length > 0 && MAPS[0].id !== null && MAPS[0].id !== '') {
			name = MAPS[0].id;
		} else {
			name = 'worldmap.jpg';
		}
	}
	// load map image asset and render it
	Client.loadFile(DB.INTERFACE_PATH + name, data => {
		// find map data by name and render it
		for (const map of MAPS) {
			if (map.id === name) {
				createWorldMapView(map, data);
				resizeMap();
				break;
			}
		}
	});
}

/**
 * Resize world map
 */
function resizeMap() {
	const root = WorldMap.getRoot();
	clearWorldMapServiceState();
	const mapContainer = root.querySelector('.map-view');
	if (!mapContainer) return;

	const currentwidth = (typeof Renderer !== 'undefined' && Renderer.width) || window.innerWidth;
	const currentheight =
		((typeof Renderer !== 'undefined' && Renderer.height) || window.innerHeight) - C_TITLEBARHEIGHT;

	// Keep the official 5:4 world-map aspect.  Do not stretch the background to
	// widescreen, otherwise all official route/search tiles look distorted and
	// positions no longer match kRO's World View UI.
	const xmult = currentwidth / C_BASEWIDTH;
	const ymult = currentheight / C_BASEHEIGHT;

	let mult = xmult;
	if (currentwidth / C_ASPECTX > currentheight / C_ASPECTY) {
		mult = ymult;
	}

	mapContainer.style.width = C_BASEWIDTH * mult + 'px';
	mapContainer.style.height = C_BASEHEIGHT * mult + 'px';
}

/**
 * When worldmap container is clicked
 * @param {*} e
 */
function onWorldMapSectionClick(e) {
	const section = e.target.closest('.section');
	if (!section) return;

	const displayName = section.getAttribute('data-displayname') || '';
	const mapId = section.id;

	Navigation.show();
	const input = Navigation.getRoot().querySelector('.search-input');
	if (input) input.value = displayName || mapId;

	// Do not rely on NPC/MOB text search here. The large world map gives us
	// the actual map id, so navigate to that map directly. This also fixes
	// custom display names that do not exist in the navigation NPC/MOB tables.
	if (Navigation.navigateToMap) {
		Navigation.navigateToMap(mapId, displayName || mapId);
	} else {
		Navigation.onSearch(true);
	}

	Navigation.focus();
}

function normalizeWorldMapName(mapName) {
	return String(mapName || '').replace(/\.gat$/i, '').toLowerCase();
}

function onNavigationRouteChanged(event) {
	const detail = event.detail || {};
	_navigationRoute = detail.active ? detail : null;
	renderNavigationRouteOverlay();
}

function getWorldMapSectionById(worldMapData, mapId) {
	mapId = normalizeWorldMapName(mapId);
	if (!worldMapData || !worldMapData.maps || !mapId) {
		return null;
	}

	for (let i = 0; i < worldMapData.maps.length; i++) {
		const section = worldMapData.maps[i];
		if (section && normalizeWorldMapName(section.id) === mapId) {
			return section;
		}
	}

	return null;
}

function getSectionCenter(section) {
	return {
		x: section.left + section.width / 2,
		y: section.top + section.height / 2
	};
}

function createRouteSvgElement(name) {
	return document.createElementNS('http://www.w3.org/2000/svg', name);
}

function setRouteOverlayBaseRect(element, section) {
	element.style.left = (section.left / C_BASEWIDTH) * 100 + '%';
	element.style.top = (section.top / C_BASEHEIGHT) * 100 + '%';
	element.style.width = (section.width / C_BASEWIDTH) * 100 + '%';
	element.style.height = (section.height / C_BASEHEIGHT) * 100 + '%';
}

function getRouteCellCenterPercent(section) {
	return {
		x: ((section.left + section.width / 2) / C_BASEWIDTH) * 100,
		y: ((section.top + section.height / 2) / C_BASEHEIGHT) * 100
	};
}

function setRouteTileRectByCenter(element, center, size) {
	size = size || 64;
	element.style.left = ((center.x - size / 2) / C_BASEWIDTH) * 100 + '%';
	element.style.top = ((center.y - size / 2) / C_BASEHEIGHT) * 100 + '%';
	element.style.width = (size / C_BASEWIDTH) * 100 + '%';
	element.style.height = (size / C_BASEHEIGHT) * 100 + '%';
}

function getRouteTargetType() {
	return String((_navigationRoute && _navigationRoute.targetType) || '').toUpperCase();
}

function getRouteCellClassName(index, total, item) {
	// The route cell itself should always be the official selected-grid tile.
	// Do not use the search-result MOB/NPC BMP as every route cell; that makes
	// the world map repeat pink monster/NPC icons along the path.
	let className = 'navigation-route-cell';
	if (index === 0) {
		className += ' route-start';
	}
	if (index === total - 1) {
		className += ' route-end';
	}
	if (item && item.section && Number(item.section.type) === 1) {
		className += ' route-dungeon';
	}
	return className;
}

function createRouteRunLineLayer(visibleRoute) {
	const layer = document.createElement('div');
	layer.className = 'navigation-route-runline-layer';

	for (let i = 1; i < visibleRoute.length; i++) {
		const from = visibleRoute[i - 1].center;
		const to = visibleRoute[i].center;
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const length = Math.sqrt(dx * dx + dy * dy);
		if (!length) {
			continue;
		}

		const segment = document.createElement('div');
		segment.className = 'navigation-route-runline-segment';
		segment.style.left = (from.x / C_BASEWIDTH) * 100 + '%';
		segment.style.top = (from.y / C_BASEHEIGHT) * 100 + '%';
		segment.style.width = (length / C_BASEWIDTH) * 100 + '%';
		segment.style.transform = 'rotate(' + (Math.atan2(dy, dx) * 180 / Math.PI) + 'deg) translateY(-50%)';
		layer.appendChild(segment);
	}

	return layer;
}

function applyWorldRouteIconVariables(overlay) {
	if (!overlay || !overlay.style) {
		return;
	}

	if (_worldRouteIconURI.cell) {
		overlay.style.setProperty('--world-route-cell-icon', 'url(' + _worldRouteIconURI.cell + ')');
		overlay.classList.add('has-cell-icon');
	}
	if (_worldRouteIconURI.selectedCell) {
		overlay.style.setProperty('--world-route-selected-cell-icon', 'url(' + _worldRouteIconURI.selectedCell + ')');
		overlay.classList.add('has-selected-cell-icon');
	}
	if (_worldRouteIconURI.mapCell) {
		overlay.style.setProperty('--world-route-map-cell-icon', 'url(' + _worldRouteIconURI.mapCell + ')');
		overlay.classList.add('has-map-cell-icon');
	}
	if (_worldRouteIconURI.mobNpcCell) {
		overlay.style.setProperty('--world-route-mobnpc-cell-icon', 'url(' + _worldRouteIconURI.mobNpcCell + ')');
		overlay.classList.add('has-mobnpc-cell-icon');
	}
	if (_worldRouteIconURI.dungeonCell) {
		overlay.style.setProperty('--world-route-dungeon-cell-icon', 'url(' + _worldRouteIconURI.dungeonCell + ')');
		overlay.classList.add('has-dungeon-cell-icon');
	}
	if (_worldRouteIconURI.runLine) {
		overlay.style.setProperty('--world-route-runline-icon', 'url(' + _worldRouteIconURI.runLine + ')');
		overlay.classList.add('has-runline-icon');
	}
	if (_worldRouteIconURI.start) {
		overlay.style.setProperty('--world-route-start-icon', 'url(' + _worldRouteIconURI.start + ')');
		overlay.classList.add('has-start-icon');
	}
	if (_worldRouteIconURI.end) {
		overlay.style.setProperty('--world-route-end-icon', 'url(' + _worldRouteIconURI.end + ')');
		overlay.classList.add('has-end-icon');
	}
	if (_worldRouteIconURI.npcSearch) {
		overlay.style.setProperty('--world-route-npc-search-icon', 'url(' + _worldRouteIconURI.npcSearch + ')');
		overlay.classList.add('has-npc-search-icon');
	}
	for (let i = 1; i <= 5; i++) {
		const key = 'mob' + i;
		if (_worldRouteIconURI[key]) {
			overlay.style.setProperty('--world-monster-density-' + i + '-icon', 'url(' + _worldRouteIconURI[key] + ')');
			overlay.classList.add('has-monster-density-icons');
		}
	}
}

function makeMagentaTransparent(dataURI, callback) {
	if (!dataURI || dataURI instanceof ArrayBuffer) {
		callback(dataURI);
		return;
	}

	const img = new Image();
	img.onload = () => {
		try {
			const width = img.naturalWidth || img.width;
			const height = img.naturalHeight || img.height;
			if (!width || !height) {
				callback(dataURI);
				return;
			}

			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0);

			const imageData = ctx.getImageData(0, 0, width, height);
			const pixels = imageData.data;
			for (let i = 0; i < pixels.length; i += 4) {
				// kRO interface BMPs use pure magenta as transparent color.
				if (pixels[i] >= 245 && pixels[i + 1] <= 10 && pixels[i + 2] >= 245) {
					pixels[i + 3] = 0;
				}
			}
			ctx.putImageData(imageData, 0, 0);
			callback(canvas.toDataURL('image/png'));
		} catch (_e) {
			callback(dataURI);
		}
	};
	img.onerror = () => callback(dataURI);
	img.decoding = 'async';
	img.src = dataURI;
}

function requestWorldRouteIcon(key, relativePath, overlay, makeTransparent) {
	if (_worldRouteIconURI[key]) {
		applyWorldRouteIconVariables(overlay);
		return;
	}

	Client.loadFile(
		DB.INTERFACE_PATH + relativePath,
		dataURI => {
			if (!dataURI || dataURI instanceof ArrayBuffer) {
				return;
			}

			const finish = convertedURI => {
				_worldRouteIconURI[key] = convertedURI || dataURI;
				applyWorldRouteIconVariables(overlay);
			};

			if (makeTransparent !== false) {
				makeMagentaTransparent(dataURI, finish);
			} else {
				finish(dataURI);
			}
		},
		() => {}
	);
}

function requestWorldRouteIcons(overlay) {
	// Official world-view assets live in data/texture/.../worldview_interface/.
	// wv_select.bmp is the selected route tile. wv_face1.bmp is the
	// current/check/sword marker, and only the destination uses wv_end.bmp.
	requestWorldRouteIcon('cell', 'worldview_interface/wv_dunselect.bmp', overlay);
	requestWorldRouteIcon('selectedCell', 'worldview_interface/wv_select.bmp', overlay);
	requestWorldRouteIcon('start', 'worldview_interface/wv_face1.bmp', overlay);
	requestWorldRouteIcon('end', 'worldview_interface/wv_end.bmp', overlay);
	requestWorldRouteIcon('npcSearch', 'worldview_interface/wv_sreachnpc.bmp', overlay);
}

function requestWorldMonsterDensityIcons(overlay) {
	// These are the official World View monster-search density icons.  The number
	// corresponds to the spawn amount bucket: 1 very-low ... 5 very-high.
	for (let i = 1; i <= 5; i++) {
		requestWorldRouteIcon('mob' + i, 'worldview_interface/wv_sreachmob' + i + '.bmp', overlay);
	}
}

function getMonsterDensityIndex(amount, rateLabel) {
	const label = String(rateLabel || '').toLowerCase();
	amount = Number(amount) || 0;

	if (label.indexOf('very high') !== -1 || amount >= 60) {
		return 5;
	}
	if (label === 'high' || amount >= 25) {
		return 4;
	}
	if (label === 'average' || amount >= 10) {
		return 3;
	}
	if (label === 'low' || amount >= 3) {
		return 2;
	}
	return 1;
}

function createMonsterDensityMarkerLayer(worldMapData) {
	const markerLayer = document.createElement('div');
	markerLayer.className = 'navigation-monster-density-layer';

	if (getRouteTargetType() !== 'MOB' || !_navigationRoute || !_navigationRoute.targetSpawns) {
		return markerLayer;
	}

	const bestByMap = {};
	for (let i = 0; i < _navigationRoute.targetSpawns.length; i++) {
		const spawn = _navigationRoute.targetSpawns[i];
		const mapId = normalizeWorldMapName(spawn && spawn.mapName);
		if (!mapId) {
			continue;
		}

		const amount = Number(spawn.amount) || 0;
		if (!bestByMap[mapId] || amount > bestByMap[mapId].amount) {
			bestByMap[mapId] = {
				mapName: mapId,
				amount: amount,
				rateLabel: spawn.rateLabel || ''
			};
		}
	}

	const mapIds = Object.keys(bestByMap);
	for (let i = 0; i < mapIds.length; i++) {
		const spawn = bestByMap[mapIds[i]];
		const section = getWorldMapSectionById(worldMapData, spawn.mapName);
		if (!section) {
			continue;
		}

		const marker = document.createElement('div');
		const density = getMonsterDensityIndex(spawn.amount, spawn.rateLabel);
		marker.className = 'navigation-monster-density-marker density-' + density;
		marker.title = (spawn.rateLabel || '') + (spawn.amount ? ' [' + spawn.amount + ']' : '');
		setRouteTileRectByCenter(marker, getSectionCenter(section), 64);
		markerLayer.appendChild(marker);
	}

	return markerLayer;
}

function createNpcSearchMarkerLayer(worldMapData) {
	const markerLayer = document.createElement('div');
	markerLayer.className = 'navigation-npc-search-layer';

	if (getRouteTargetType() !== 'NPC' || !_navigationRoute || !Array.isArray(_navigationRoute.targetEntries) || !_navigationRoute.targetEntries.length) {
		return markerLayer;
	}

	const seen = {};
	for (let i = 0; i < _navigationRoute.targetEntries.length; i++) {
		const entry = _navigationRoute.targetEntries[i];
		const mapId = normalizeWorldMapName(entry && entry.mapName);
		if (!mapId || seen[mapId]) {
			continue;
		}
		seen[mapId] = true;
		const section = getWorldMapSectionById(worldMapData, mapId);
		if (!section) {
			continue;
		}
		const marker = document.createElement('div');
		marker.className = 'navigation-npc-search-marker';
		marker.title = _navigationRoute.targetName || mapId;
		setRouteTileRectByCenter(marker, getSectionCenter(section), 64);
		markerLayer.appendChild(marker);
	}

	return markerLayer;
}

function createRouteMarkerLayer(visibleRoute) {
	const markerLayer = document.createElement('div');
	markerLayer.className = 'navigation-route-marker-layer';

	if (!visibleRoute.length) {
		return markerLayer;
	}

	const startItem = visibleRoute[0];
	const endItem = visibleRoute[visibleRoute.length - 1];

	// Official World View puts the current/check/sword marker on the current
	// route tile, not on every tile and not on the destination.
	if (startItem && startItem.section) {
		const startMarker = document.createElement('div');
		startMarker.className = 'navigation-route-start-marker';
		setRouteTileRectByCenter(startMarker, startItem.center, 64);

		const startIcon = document.createElement('span');
		startIcon.className = 'navigation-route-start-icon';
		startMarker.appendChild(startIcon);
		markerLayer.appendChild(startMarker);
	}

	if (endItem && endItem.section) {
		const endMarker = document.createElement('div');
		endMarker.className = 'navigation-route-end-marker';
		setRouteTileRectByCenter(endMarker, endItem.center, 64);

		// wv_end.bmp already contains the End text/icon, so do not add an HTML
		// "End" label. Place the icon in the upper-left of the destination tile.
		const endIcon = document.createElement('span');
		endIcon.className = 'navigation-route-end-icon';
		endMarker.appendChild(endIcon);

		const endCheck = document.createElement('span');
		endCheck.className = 'navigation-route-end-check';
		endMarker.appendChild(endCheck);

		markerLayer.appendChild(endMarker);
	}

	return markerLayer;
}

/**
 * Draw the official-style route overlay on the large world map.
 */
function renderNavigationRouteOverlay(mapView, worldMapData) {
	const root = WorldMap.getRoot();
	mapView = mapView || root.querySelector('.worldmap .map-view');
	worldMapData = worldMapData || _activeWorldMapData;

	if (!_navigationRoute && typeof window !== 'undefined' && window.__RO_BROWSER_NAVIGATION_ROUTE__) {
		const savedRoute = window.__RO_BROWSER_NAVIGATION_ROUTE__;
		_navigationRoute = savedRoute.active ? savedRoute : null;
	}

	if (!mapView) {
		return;
	}

	const oldOverlay = mapView.querySelector('.navigation-route-overlay');
	if (oldOverlay) {
		oldOverlay.remove();
	}

	const hasMonsterMarkers = !!(
		_navigationRoute &&
		getRouteTargetType() === 'MOB' &&
		Array.isArray(_navigationRoute.targetSpawns) &&
		_navigationRoute.targetSpawns.length
	);
	const hasNpcMarkers = !!(
		_navigationRoute &&
		getRouteTargetType() === 'NPC' &&
		Array.isArray(_navigationRoute.targetEntries) &&
		_navigationRoute.targetEntries.length
	);
	const hasRouteMaps = !!(_navigationRoute && Array.isArray(_navigationRoute.routeMaps) && _navigationRoute.routeMaps.length);

	if (!_navigationRoute || !worldMapData || (!hasRouteMaps && !hasMonsterMarkers && !hasNpcMarkers)) {
		return;
	}

	const visibleRoute = [];
	const seen = {};
	for (let i = 0; i < _navigationRoute.routeMaps.length; i++) {
		const mapId = normalizeWorldMapName(_navigationRoute.routeMaps[i]);
		if (seen[mapId]) {
			continue;
		}
		seen[mapId] = true;

		const section = getWorldMapSectionById(worldMapData, mapId);
		if (!section) {
			continue;
		}

		visibleRoute.push({
			mapId: mapId,
			section: section,
			center: getSectionCenter(section)
		});
	}

	if (!visibleRoute.length && !hasMonsterMarkers && !hasNpcMarkers) {
		return;
	}

	const overlay = document.createElement('div');
	overlay.className = 'navigation-route-overlay official-route-style';
	applyWorldRouteIconVariables(overlay);
	requestWorldRouteIcons(overlay);
	requestWorldMonsterDensityIcons(overlay);

	const cellLayer = document.createElement('div');
	cellLayer.className = 'navigation-route-cell-layer';
	overlay.appendChild(cellLayer);

	// Official client marks each world-map grid cell in the route.  Do not draw
	// the previous custom circular nodes; use translucent route tiles instead.
	for (let i = 0; i < visibleRoute.length; i++) {
		const item = visibleRoute[i];
		const cell = document.createElement('div');
		cell.className = getRouteCellClassName(i, visibleRoute.length, item);
		setRouteTileRectByCenter(cell, item.center, 64);
		cellLayer.appendChild(cell);
	}

	if (visibleRoute.length >= 2) {
		const svg = createRouteSvgElement('svg');
		svg.setAttribute('viewBox', `0 0 ${C_BASEWIDTH} ${C_BASEHEIGHT}`);
		svg.setAttribute('preserveAspectRatio', 'none');
		svg.classList.add('navigation-route-svg');

		const points = visibleRoute.map(item => `${item.center.x},${item.center.y}`).join(' ');

		const pathShadow = createRouteSvgElement('polyline');
		pathShadow.setAttribute('points', points);
		pathShadow.classList.add('navigation-route-line-shadow');
		svg.appendChild(pathShadow);

		const pathLine = createRouteSvgElement('polyline');
		pathLine.setAttribute('points', points);
		pathLine.classList.add('navigation-route-line');
		svg.appendChild(pathLine);

		overlay.appendChild(svg);
	}

	overlay.appendChild(createMonsterDensityMarkerLayer(worldMapData));
	overlay.appendChild(createNpcSearchMarkerLayer(worldMapData));
	if (visibleRoute.length) {
		overlay.appendChild(createRouteMarkerLayer(visibleRoute));
	}
	mapView.appendChild(overlay);
}

/**
 * When worldmap container is mouse over
 * @param {*} e
 */
function onWorldMapMouseOver(e) {
	const section = e.target.closest('.section');
	if (!section || section === _hoveredSection) return;
	_hoveredSection = section;
	showTooltip(section);
	const mapView = section.closest('.map-view');
	if (mapView) {
		renderWorldMapServiceOverlay({
			mapView,
			hoveredMapId: section.id,
			sections: _activeWorldMapData?.maps || [],
			getTownInfo: mapId => DB.getTownInfo(mapId),
			isVisible: mapSection =>
				(isEpisodeInRange(mapSection, WorldMap.settings.episode) || WorldMap.settings.add.includes(mapSection.id)) &&
				!WorldMap.settings.remove.includes(mapSection.id),
			renderKafraSprite: canvas => Navigation.renderNpcSprite(canvas, 117),
			airplaneSrc: `${DB.INTERFACE_PATH}worldview_interface/wv_airplen32.bmp`,
			loadAsset: (path, onLoad) => Client.loadFile(path, onLoad)
		});
	}
}

/**
 * When worldmap container is mouse out
 * @param {*} e
 */
function onWorldMapMouseOut(e) {
	if (!_hoveredSection) return;
	if (_hoveredSection.contains(e.relatedTarget)) return;
	clearWorldMapServiceState();
	hideTooltip();
}

/**
 * Show tooltip
 * @param {*} section
 */
function showTooltip(section) {
	const root = WorldMap.getRoot();
	const tooltip = root.querySelector('#map-tooltip');
	if (!tooltip) return;

	const displayName = section.getAttribute('data-displayname') || '';
	tooltip.querySelector('.tooltip-mapname').textContent = displayName;
	tooltip.querySelector('.tooltip-mapid').textContent = section.id;

	const tooltipImg = tooltip.querySelector('.tooltip-img');
	tooltipImg.style.backgroundImage = '';

	// Use the same map-to-monster lookup as Navigation. The panel is tied to
	// the existing Show Monsters checkbox and leaves the original hover card
	// unchanged while that mode is disabled.
	const monsters = WorldMap.showLVLMode ? DB.getNavigationMapMonsters(section.id) : [];
	renderWorldMapMonsterPanel(tooltip, monsters, WorldMap.showLVLMode);

	// position tooltip
	const rect = section.getBoundingClientRect();
	tooltip.style.display = 'flex';
	tooltip.style.left = rect.right + 10 + 'px';
	tooltip.style.top = rect.top + 'px';

	// adjust if tooltip is out of screen
	const tooltipRect = tooltip.getBoundingClientRect();
	if (tooltipRect.right > window.innerWidth) {
		tooltip.style.left = rect.left - tooltipRect.width - 10 + 'px';
	}
	if (tooltipRect.bottom > window.innerHeight) {
		tooltip.style.top = Math.max(5, window.innerHeight - tooltipRect.height - 10) + 'px';
	}
	if (tooltip.getBoundingClientRect().left < 0) {
		tooltip.style.left = '5px';
	}

	// load map image asset and render it
	Client.loadFile(`${DB.INTERFACE_PATH}map/${section.id}.bmp`, data => {
		if (_hoveredSection === section) {
			tooltipImg.style.backgroundImage = `url(${data})`;
		}
	});
}

/**
 * Hide tooltip
 */
function hideTooltip() {
	const root = WorldMap.getRoot();
	const tooltip = root.querySelector('#map-tooltip');
	if (tooltip) {
		tooltip.style.display = 'none';
	}
}

/**
 * Remove all hover-only service visuals and reset delegated hover state.
 * Shared by rerender, resize, hide, close and removal lifecycle paths.
 */
function clearWorldMapServiceState() {
	const root = WorldMap.getRoot();
	const mapView = root?.querySelector?.('.map-view');
	_hoveredSection = null;
	clearWorldMapServiceOverlay(mapView);
}

/**
 * Create the .worldmap container and loop through all the maps
 * and render them to the container.
 *
 * @param {WorldMap} map world map data
 * @param {string} imgData world map image data as a base64
 */
function createWorldMapView(map, imgData) {
	clearWorldMapServiceState();
	_activeWorldMapData = map;
	const root = WorldMap.getRoot();
	const container = root.querySelector('.map .content');
	const worldmap = document.createElement('div');
	const currentMap = MapRenderer.currentMap.replace(/\.gat$/i, '');

	worldmap.className = 'worldmap' + (WorldMap.showLVLMode ? ' show-lvls' : '');

	// set loaded worldmap background image
	const mapView = document.createElement('div');
	mapView.id = map.id;
	mapView.className = 'map-view';
	mapView.style.backgroundImage = `url(${imgData})`;
	mapView.setAttribute('data-name', map.name);
	worldmap.appendChild(mapView);

	const dgMapPositions = {};
	for (const section of map.maps) {
		if (section.type !== undefined && section.type === 1) {
			dgMapPositions[section.index] = {
				W: section.width,
				H: section.height,
				x: section.left + section.width / 2,
				y: section.top + section.height / 2
			};
		}
	}
	const renderedDungeonPos = new Set();

	for (const section of map.maps) {
		//Episode & custom add/remove check
		if (
			(isEpisodeInRange(section, WorldMap.settings.episode) || WorldMap.settings.add.includes(section.id)) &&
			!WorldMap.settings.remove.includes(section.id)
		) {
			const el = document.createElement('div');
			const el_mapid = document.createElement('div');
			const el_mapname = document.createElement('div');

			el.id = section.id;

			let sectionType = section.type !== undefined ? section.type : 0;

			// connected dungeons logic
			if (sectionType === 0 && dgMapPositions[section.index]) {
				const parentPos = dgMapPositions[section.index];

				const childW = section.width;
				const childH = section.height;
				const childPos = {
					x: section.left + childW / 2,
					y: section.top + childH / 2
				};

				const parentW = parentPos.W;
				const parentH = parentPos.H;

				const deltaX = childPos.x - parentPos.x;
				const deltaY = childPos.y - parentPos.y;
				const fullLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
				const angleRad = Math.atan2(deltaY, deltaX);

				const getRadius = (w, h, rad) => {
					const absCos = Math.abs(Math.cos(rad));
					const absSin = Math.abs(Math.sin(rad));
					return w * absSin <= h * absCos ? w / (2 * absCos) : h / (2 * absSin);
				};

				const startOffset = getRadius(parentW, parentH, angleRad);
				const endOffset = getRadius(childW, childH, angleRad);

				if (fullLength > startOffset + endOffset) {
					const newLength = fullLength - startOffset - endOffset;

					const startX = parentPos.x + Math.cos(angleRad) * startOffset;
					const startY = parentPos.y + Math.sin(angleRad) * startOffset;

					const line = document.createElement('div');
					line.className = 'connector-line';

					line.style.left = `${(startX / C_BASEWIDTH) * 100}%`;
					line.style.top = `${(startY / C_BASEHEIGHT) * 100}%`;
					line.style.width = `${(newLength / C_BASEWIDTH) * 100}%`;

					const angleDeg = (angleRad * 180) / Math.PI;
					line.style.transform = `rotate(${angleDeg}deg)`;
					line.style.transformOrigin = '0% 50%';

					mapView.appendChild(line);
				}
				sectionType = 1;
			}
			// -----------------------

			let className = 'section';
			if (currentMap == section.id) {
				className += ' currentmap';
			}
			// party members reported while the map was not built
			if (_partyMembersByMap[section.id]) {
				className += ' membersonmap';
			}

			if (sectionType === 1) {
				const posKey = section.left + '_' + section.top;

				if (renderedDungeonPos.has(posKey)) {
					className += ' is-dungeon-stacked';
				} else {
					className += ' is-dungeon';
					renderedDungeonPos.add(posKey);
				}
			}

			el.className = className;

			el.style.top = `${(section.top / C_BASEHEIGHT) * 100}%`;
			el.style.left = `${(section.left / C_BASEWIDTH) * 100}%`;
			el.style.width = `${(section.width / C_BASEWIDTH) * 100}%`;
			el.style.height = `${(section.height / C_BASEHEIGHT) * 100}%`;

			el_mapname.className = 'mapname';
			el_mapname.innerHTML = section.name; // this is monster names

			const el_displayname = document.createElement('div');
			el_displayname.className = 'displayname';
			if (sectionType === 1) {
				// dugeons name got direct from worldmap lua files
				const name = section.name.replace(' 1', '').trim(); // small hack to remove 1 from dungeon names
				el_displayname.innerHTML = name;
				el.setAttribute('data-displayname', name);
			} else {
				// other maps name got from rsw files and search on mapinfo.lub theyr real names
				const mapInfo = DB.getMapInfo(section.id + '.rsw');
				const mapName = mapInfo ? mapInfo.displayName : '';
				el_displayname.innerHTML = mapName;
				el.setAttribute('data-displayname', mapName);
			}

			el_mapid.className = 'mapid'; // rsw name
			el_mapid.innerHTML = section.id;

			const monsterLevelRange = createWorldMapMonsterLevelRange(DB.getNavigationMapMonsters(section.id));
			if (monsterLevelRange) {
				el_displayname.appendChild(monsterLevelRange);
			}
			el.appendChild(el_displayname);
			el.appendChild(el_mapname);
			el.appendChild(el_mapid);

			const recommendedLevelBadge = createWorldMapRecommendedLevelBadge(section);
			if (recommendedLevelBadge) el.appendChild(recommendedLevelBadge);

			mapView.appendChild(el);
		}
	}
	worldmap.appendChild(mapView);
	renderNavigationRouteOverlay(mapView, map);
	container.innerHTML = '';
	container.appendChild(worldmap);
}

/**
 * Load airplane image and append it to the DOM (.map-view element)
 *
 * @param {HTMLElement} mapView target where to append to
 */
function loadAirplane(mapView) {
	Client.loadFile(DB.INTERFACE_PATH + 'worldview_interface/wv_airplen32.bmp', data => {
		const airplane = document.createElement('img');
		airplane.id = 'midgard-airplane';
		airplane.className = 'airplane';
		airplane.decoding = 'async';
		airplane.src = data;
		// update it's position and angle
		setAirplanePosition(airplane);
		mapView.appendChild(airplane);
	});
}

/**
 * Refresh airplane position
 *
 * @param {HTMLElement} airplane optional. if not provided, will use .worldmap #midgard-airplane
 *
 * @todo use server time and set position and angle
 */
function setAirplanePosition(airplane) {
	const root = WorldMap.getRoot();
	const el = airplane || root.querySelector('.worldmap #midgard-airplane');
	if (!el) return;
	el.style.top = '35%';
	el.style.left = '35%';
	el.style.transform = 'rotate(75deg)';
}

/**
     * helper function to convert purple (255,0,255) color to transparent from image.
     *
     * Note: will not work on local files, needs to be hosted on
     * server for CORS (See: 'getImageData' on 'CanvasRenderingContext2D':
     * The canvas has been tainted by cross-origin data)
     *
     * @param {HTMLImageElement} img source image element
     *
     * @example
     const img = document.querySelector('img');
         img.src = `textures/map/${e.target.id}.bmp`;
         img.onload = () => adjustImageTransparency(img);
     */
function _adjustImageTransparency(img) {
	const canvas = document.createElement('canvas');
	canvas.width = img.width || img.clientWidth;
	canvas.height = img.height || img.clientHeight;

	const ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);

	const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	// iterate over all pixels
	// in the image data and turn purple pixels transparent
	const n = imgData.data.length;
	let red,
		green,
		blue,
		isPurple = false;

	for (let i = 0; i < n; i += 4) {
		red = imgData.data[i];
		green = imgData.data[i + 1];
		blue = imgData.data[i + 2];

		// with exact color
		isPurple = red === 255 && blue === 255 && green === 0;
		// with some tolerance
		// let isPurple = (red >= 150 && blue >= 150) && green < 150;

		if (isPurple) {
			imgData.data[i + 3] = 0; // Set alpha channel to 0 for transparency
		}
	}
	ctx.putImageData(imgData, 0, 0);

	// replace the existing source image with the new one
	img.decoding = 'async';
	img.src = canvas.toDataURL();
}

/**
 * Apply preferences once append to body
 */
WorldMap.onAppend = function onAppend() {
	// Apply preferences
	if (!_preferences.show) {
		this._host.style.display = 'none';
	}

	// settings
	this.settings = { episode: 98, add: [], remove: [] };
	const conf = Configs.get('worldMapSettings', { episode: 98, add: [], remove: [] });

	// Prevent stupidity
	if ('episode' in conf) {
		this.settings.episode = conf.episode;
	}

	if ('add' in conf && Array.isArray(conf.add)) {
		this.settings.add = conf.add;
	}

	if ('remove' in conf && Array.isArray(conf.remove)) {
		this.settings.remove = conf.remove;
	}

	console.log('%c[WoldMap] Episode: ', 'color:#007000', this.settings.episode);
	if (this.settings.add.length > 0) {
		console.log('%c[WoldMap] Add Maps: ', 'color:#007000', this.settings.add);
	}
	if (this.settings.remove.length > 0) {
		console.log('%c[WoldMap] Remove Maps: ', 'color:#007000', this.settings.remove);
	}

	// set maps
	setMapList();

	// resize map container & add sections
	selectMap();

	this._host.style.top = '0px';
	this._host.style.left = '0px';
};

WorldMap.onRemove = function onRemove() {
	clearWorldMapServiceState();
	hideTooltip();

	// Save preferences
	_preferences.show = this._host.style.display !== 'none';
	_preferences.y = 0;
	_preferences.x = 0;
	_preferences.width = 0;
	_preferences.height = 0;
	_preferences.save();
};

/**
 * Show/Hide UI
 */
WorldMap.toggle = function toggle() {
	const isVisible = this._host.style.display !== 'none';
	if (isVisible) {
		clearWorldMapServiceState();
		this._host.style.display = 'none';
		hideTooltip();
	} else {
		this._host.style.display = '';
		selectMap();
		this.focus();
	}
};

WorldMap.captureKeyEvents = true;

WorldMap.onKeyDown = function onKeyDown(event) {
	if (this.isEditableFocused()) {
		if (event.which === KEYS.ESCAPE || event.key === 'Escape') {
			this.toggle();
			event.stopImmediatePropagation();
			return false;
		}
		event.stopImmediatePropagation();
		return true;
	}

	if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this._host.style.display !== 'none') {
		this.toggle();
	}
};

/**
 * Process shortcut
 *
 * @param {object} key
 */
WorldMap.onShortCut = function onShortCut(key) {
	switch (key.cmd) {
		case 'TOGGLE':
			this.toggle();
			break;
	}
};

/**
 * Resize UI
 */
WorldMap.onResize = function () {
	resizeMap();
};

/**
 * Update party members on map
 *
 * @param {object} pkt
 */
WorldMap.updatePartyMembers = function updatePartyMembers(pkt) {
	_partyMembersByMap = {};
	pkt.groupInfo.forEach(member => {
		if (member.AID !== Session.AID && member.state === 0) {
			const mapId = member.mapName.replace(/\.gat$/i, '');
			if (!_partyMembersByMap[mapId]) {
				_partyMembersByMap[mapId] = [];
			}
			_partyMembersByMap[mapId].push({ AID: member.AID, Name: member.characterName });
		}
	});

	showPartyMembers();
};

/**
 * Forget a member who left the party, or the whole party when it is us
 *
 * @param {number} AID
 */
WorldMap.removePartyMember = function removePartyMember(AID) {
	if (AID === Session.AID) {
		_partyMembersByMap = {};
	} else {
		for (const mapId of Object.keys(_partyMembersByMap)) {
			_partyMembersByMap[mapId] = _partyMembersByMap[mapId].filter(member => member.AID !== AID);
			if (!_partyMembersByMap[mapId].length) {
				delete _partyMembersByMap[mapId];
			}
		}
	}
	showPartyMembers();
};

/**
 * Mark the built sections that have party members on them
 */
function showPartyMembers() {
	const root = WorldMap.getRoot();
	root.querySelectorAll('.worldmap .section').forEach(el => el.classList.remove('membersonmap'));
	for (const mapId of Object.keys(_partyMembersByMap)) {
		const el = root.querySelector('.worldmap .section#' + CSS.escape(mapId));
		if (el) el.classList.add('membersonmap');
	}
};

/**
 * Toggle all maps
 */
function onToggleMaps() {
	const root = WorldMap.getRoot();
	if (WorldMap.showAllMaps) {
		root.querySelectorAll('.worldmap .section').forEach(el => el.classList.remove('allmapvisible'));
		WorldMap.showAllMaps = false;
	} else {
		root.querySelectorAll('.worldmap .section').forEach(el => el.classList.add('allmapvisible'));
		WorldMap.showAllMaps = true;
	}
}

/**
 * Show Monster level range
 */
function onShowLVL() {
	WorldMap.showLVLMode = !WorldMap.showLVLMode;
	const root = WorldMap.getRoot();

	Client.loadFile(DB.INTERFACE_PATH + 'checkbox_' + (WorldMap.showLVLMode ? '1' : '0') + '.bmp', function (data) {
		const btn = root.querySelector('.showlvl');
		if (btn) btn.style.backgroundImage = 'url(' + data + ')';
	});

	const worldmapEl = root.querySelector('.worldmap');
	if (worldmapEl) {
		if (!WorldMap.showLVLMode) {
			worldmapEl.classList.remove('show-lvls');
		} else {
			worldmapEl.classList.add('show-lvls');
		}
	}

	// Update an already-visible hover card immediately. Unchecking restores
	// the original minimap/name/map-code-only card without moving the pointer.
	if (_hoveredSection) {
		showTooltip(_hoveredSection);
	}
}

/**
 * Stop event propagation
 * @param {object} event
 */
function stopPropagation(event) {
	event.stopImmediatePropagation();
	return false;
}

/**
 * Closing window
 */
function onClose() {
	clearWorldMapServiceState();
	hideTooltip();
	WorldMap._host.style.display = 'none';
}

WorldMap.mouseMode = GUIComponent.MouseMode.STOP;

/**
 * Create component and export it
 */
export default UIManager.addComponent(WorldMap);
