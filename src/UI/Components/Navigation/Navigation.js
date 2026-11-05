/**
 * UI/Components/Navigation/Navigation.js
 *
 * Navigation window for NAVI links
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import KEYS from 'Controls/KeyEventHandler.js';
import Renderer from 'Renderer/Renderer.js';
import EffectManager from 'Renderer/EffectManager.js';
import NavigationFootstep from 'Renderer/Effects/NavigationFootstep.js';
import MapRenderer from 'Renderer/MapRenderer.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import 'UI/Elements/Elements.js';
import Altitude from 'Renderer/Map/Altitude.js';
import Session from 'Engine/SessionStorage.js';
import Client from 'Core/Client.js';
import FileManager from 'Core/FileManager.js';
import DB from 'DB/DBManager.js';
import Entity from 'Renderer/Entity/Entity.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import htmlText from './Navigation.html?raw';
import cssText from './Navigation.css?raw';
import MapPathFinder from './MapPathFinder.js';
import PrivateAirship from 'UI/Components/PrivateAirship/PrivateAirship.js';
import PACKETVER from 'Network/PacketVerManager.js';

/**
 * First client date with the Private Airship request (CZ_PRIVATE_AIRSHIP_REQUEST)
 */
const PRIVATE_AIRSHIP_PACKETVER = 20180321;

/**
 * Create Navigation component
 */
const Navigation = new GUIComponent('Navigation', cssText);

Navigation.render = () => htmlText;

/**
 * Async image create helper
 */
function createAsyncImage() {
	const img = new Image();
	img.decoding = 'async';
	return img;
}


const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

const NAV_WINDOW_WIDTH = 300;
const NAV_WINDOW_HEIGHT = 320;
const NAV_RESULT_WIDTH = NAV_WINDOW_WIDTH;
const NAV_RESULT_HEIGHT = NAV_WINDOW_HEIGHT;
const NAV_MINIMIZED_WIDTH = 158;
const NAV_MINIMIZED_HEIGHT = 54;

const DETAIL_SPRITE_CANVAS_SIZE = 96;
const DETAIL_SPRITE_MAX_WIDTH = 90;
const DETAIL_SPRITE_MAX_HEIGHT = 90;

const NAVIGATION_INTERFACE3 = 'navigation_interface3/';
const NAVIGATION_INTERFACE_LEGACY = 'navigation_interface/';

const OFFICIAL_NAV_ICON_CANDIDATES = {
	SEARCH: [
		NAVIGATION_INTERFACE3 + 'btn_searchbar_normal.bmp',
		NAVIGATION_INTERFACE3 + 'btn_searchbar_over.bmp',
		NAVIGATION_INTERFACE3 + 'btn_searchbar_press.bmp',
		NAVIGATION_INTERFACE3 + 'bg_search.bmp',
		NAVIGATION_INTERFACE_LEGACY + 'navisearch_a.bmp',
		NAVIGATION_INTERFACE_LEGACY + 'navi_search_a.bmp',
		NAVIGATION_INTERFACE_LEGACY + 'navi_search.bmp',
		NAVIGATION_INTERFACE_LEGACY + 'search.bmp'
	],
	SHARE: [
		NAVIGATION_INTERFACE3 + 'btn_share_normal.bmp',
		NAVIGATION_INTERFACE3 + 'btn_share_over.bmp',
		NAVIGATION_INTERFACE_LEGACY + 'navi_share.bmp',
		NAVIGATION_INTERFACE_LEGACY + 'navi_share_a.bmp',
		NAVIGATION_INTERFACE_LEGACY + 'navishare_a.bmp',
		NAVIGATION_INTERFACE_LEGACY + 'share.bmp'
	],
	FIND: [
		NAVIGATION_INTERFACE3 + 'btn_find_normal.bmp',
		NAVIGATION_INTERFACE3 + 'btn_find_over.bmp',
		NAVIGATION_INTERFACE3 + 'btn_getdirections_normal.bmp',
		NAVIGATION_INTERFACE_LEGACY + 'navi_find.bmp',
		NAVIGATION_INTERFACE_LEGACY + 'navi_find_a.bmp',
		NAVIGATION_INTERFACE_LEGACY + 'navifind_a.bmp',
		NAVIGATION_INTERFACE_LEGACY + 'find.bmp'
	],
	MOVE: [
		NAVIGATION_INTERFACE3 + 'btn_move_normal.bmp',
		NAVIGATION_INTERFACE3 + 'btn_move_over.bmp',
		NAVIGATION_INTERFACE_LEGACY + 'navi_move.bmp',
		NAVIGATION_INTERFACE_LEGACY + 'navi_move_a.bmp',
		NAVIGATION_INTERFACE_LEGACY + 'navimove_a.bmp',
		NAVIGATION_INTERFACE_LEGACY + 'move.bmp'
	]
};

const _interfaceIconSearchCache = {};
const _interfaceBackgroundCache = {};
const _spritePreviewCache = {};
const _monsterPreviewRuntimeCache = {};
let _previewShadowBuffersLoaded = false;
let _previewShadowBuffersLoading = false;
let _previewShadowSprBuffer = null;
let _previewShadowActBuffer = null;
const _previewShadowCallbacks = [];

function normalizeGrfPath(path) {
	return String(path || '').replace(/\\/g, '/').replace(/^\/+/, '');
}

function uniqueList(list) {
	const seen = {};
	const out = [];
	for (let i = 0; i < list.length; i++) {
		const item = normalizeGrfPath(list[i]);
		if (!item || seen[item]) {
			continue;
		}
		seen[item] = true;
		out.push(item);
	}
	return out;
}

function escapeRegExp(value) {
	return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findNavigationInterfaceIcons(kind) {
	kind = String(kind || '').toUpperCase();
	if (_interfaceIconSearchCache[kind]) {
		return _interfaceIconSearchCache[kind].slice();
	}

	let keywords = [];
	switch (kind) {
		case 'MOB':
			keywords = ['mob', 'monster'];
			break;
		case 'NPC':
			keywords = ['npc'];
			break;
		case 'MAP':
			keywords = ['map', 'world'];
			break;
		case 'SHARE':
			keywords = ['share'];
			break;
		case 'FIND':
			keywords = ['find', 'search'];
			break;
		case 'MOVE':
			keywords = ['move'];
			break;
		case 'SEARCH':
		default:
			keywords = ['search'];
			break;
	}

	let matches = [];
	try {
		const keywordPattern = keywords.map(escapeRegExp).join('|');
		matches = FileManager.search(
			new RegExp('data[\\\\/]texture[\\\\/].*[\\\\/]navigation_interface\\d*[\\\\/].*(' + keywordPattern + ').*\\.(bmp|tga|png)$', 'i')
		) || [];
	} catch (_e) {
		matches = [];
	}

	const candidates = uniqueList(matches.concat(OFFICIAL_NAV_ICON_CANDIDATES[kind] || []));
	_interfaceIconSearchCache[kind] = candidates;
	return candidates.slice();
}

function resolveInterfacePath(path) {
	path = normalizeGrfPath(path);
	if (!path) {
		return '';
	}
	return /^data\//i.test(path) ? path : DB.INTERFACE_PATH + path;
}

function setBackgroundFromGrfCandidates(element, candidates, loadedClass) {
	if (!element) {
		return;
	}

	const paths = uniqueList(candidates || []);
	if (!paths.length) {
		return;
	}

	let index = 0;
	const tryNext = () => {
		if (index >= paths.length) {
			return;
		}

		const fullPath = resolveInterfacePath(paths[index++]);
		if (!fullPath) {
			tryNext();
			return;
		}

		if (_interfaceBackgroundCache[fullPath]) {
			element.style.backgroundImage = 'url(' + _interfaceBackgroundCache[fullPath] + ')';
			if (loadedClass) {
				element.classList.add(loadedClass);
			}
			return;
		}

		Client.loadFile(
			fullPath,
			dataURI => {
				if (!dataURI || dataURI instanceof ArrayBuffer) {
					tryNext();
					return;
				}

				_interfaceBackgroundCache[fullPath] = dataURI;
				element.style.backgroundImage = 'url(' + dataURI + ')';
				if (loadedClass) {
					element.classList.add(loadedClass);
				}
			},
			tryNext
		);
	};

	tryNext();
}

function getOfficialListIconName(result) {
	if (!result) {
		return '';
	}
	if (result.type === 'MOB') {
		return 'mob';
	}
	if (result.type === 'NPC') {
		return 'npc';
	}
	return 'map';
}

function applyOfficialBadgeBackground(badge, iconName) {
	if (!badge || !iconName) {
		return;
	}

	const uri = _navInterfaceIconURI[iconName];
	if (!uri) {
		badge.classList.remove('grf-loaded');
		badge.style.backgroundImage = '';
		return;
	}

	badge.classList.add('grf-loaded');
	badge.style.backgroundImage = 'url(' + uri + ')';
	badge.style.backgroundSize = 'contain';
}

function refreshOfficialBadgeIcons(root) {
	if (!root) {
		return;
	}

	const badges = root.querySelectorAll('.official-type-badge');
	for (let i = 0; i < badges.length; i++) {
		const badge = badges[i];
		const iconName = badge.getAttribute('data-official-icon');
		applyOfficialBadgeBackground(badge, iconName);
	}
}

function loadOfficialNavigationIcon(path, image, key, root) {
	Client.loadFile(path, dataURI => {
		if (!dataURI) {
			return;
		}
		image.src = dataURI;
		if (key) {
			_navInterfaceIconURI[key] = dataURI;
			refreshOfficialBadgeIcons(root || Navigation.getRoot());
			applyOfficialNavigationScrollSkin(root || Navigation.getRoot());
		}
	});
}

function applyOfficialNavigationScrollSkin(root) {
	if (!root) {
		return;
	}

	// getRoot() returns a ShadowRoot, and ShadowRoot has no .style.
	// Put the CSS variables on the inner .Navigation element instead.
	const target = root.querySelector ? root.querySelector('.Navigation') : root;
	if (!target || !target.style || !target.style.setProperty) {
		return;
	}

	const style = target.style;
	if (_navInterfaceIconURI.scrollUp) style.setProperty('--nav-scroll-up', 'url(' + _navInterfaceIconURI.scrollUp + ')');
	if (_navInterfaceIconURI.scrollDown) style.setProperty('--nav-scroll-down', 'url(' + _navInterfaceIconURI.scrollDown + ')');
	if (_navInterfaceIconURI.scrollMid) style.setProperty('--nav-scroll-mid', 'url(' + _navInterfaceIconURI.scrollMid + ')');
	if (_navInterfaceIconURI.barUp) style.setProperty('--nav-bar-up', 'url(' + _navInterfaceIconURI.barUp + ')');
	if (_navInterfaceIconURI.barDown) style.setProperty('--nav-bar-down', 'url(' + _navInterfaceIconURI.barDown + ')');
	if (_navInterfaceIconURI.barMid) style.setProperty('--nav-bar-mid', 'url(' + _navInterfaceIconURI.barMid + ')');
}

function applyOfficialNavigationIcons(root) {
	if (!root) {
		return;
	}

	loadOfficialNavigationIcon(DB.INTERFACE_PATH + 'navigation_interface3/icon_list_map.bmp', _navListMapIcon, 'map', root);
	loadOfficialNavigationIcon(DB.INTERFACE_PATH + 'navigation_interface3/icon_list_mob.bmp', _navListMobIcon, 'mob', root);
	loadOfficialNavigationIcon(DB.INTERFACE_PATH + 'navigation_interface3/icon_list_npc.bmp', _navListNpcIcon, 'npc', root);
	loadOfficialNavigationIcon(DB.INTERFACE_PATH + 'navigation_interface3/icon_list_riute.bmp', _navListRouteIcon, 'route', root);
	loadOfficialNavigationIcon(DB.INTERFACE_PATH + 'navigation_interface3/icon_list_start.bmp', _navListStartIcon, 'start', root);
	loadOfficialNavigationIcon(DB.INTERFACE_PATH + 'navigation_interface3/icon_list_target.bmp', _navListTargetIcon, 'target', root);
	loadOfficialNavigationIcon(DB.INTERFACE_PATH + 'navigation_interface3/ico_destination.bmp', _navIcoDestination, 'destination', root);
	loadOfficialNavigationIcon(DB.INTERFACE_PATH + 'navigation_interface3/ico_location.bmp', _navIcoLocation, 'location', root);
	loadOfficialNavigationIcon(DB.INTERFACE_PATH + 'navigation_interface3/navi_scroll_up.bmp', _navScrollUp, 'scrollUp', root);
	loadOfficialNavigationIcon(DB.INTERFACE_PATH + 'navigation_interface3/navi_scroll_mid.bmp', _navScrollMid, 'scrollMid', root);
	loadOfficialNavigationIcon(DB.INTERFACE_PATH + 'navigation_interface3/navi_scroll_down.bmp', _navScrollDown, 'scrollDown', root);
	loadOfficialNavigationIcon(DB.INTERFACE_PATH + 'navigation_interface3/navi_bar_up.bmp', _navBarUp, 'barUp', root);
	loadOfficialNavigationIcon(DB.INTERFACE_PATH + 'navigation_interface3/navi_bar_mid.bmp', _navBarMid, 'barMid', root);
	loadOfficialNavigationIcon(DB.INTERFACE_PATH + 'navigation_interface3/navi_bar_down.bmp', _navBarDown, 'barDown', root);
	applyOfficialNavigationScrollSkin(root);
}

function createOfficialTypeBadge(result) {
	const badge = document.createElement('span');
	const iconName = getOfficialListIconName(result);
	badge.className = 'official-type-badge ' + getResultTypeClass(result);
	badge.setAttribute('data-official-icon', iconName);

	const text = document.createElement('span');
	text.className = 'official-type-text';
	text.textContent = result && result.type === 'NPC' ? 'N' : 'M';
	badge.appendChild(text);

	applyOfficialBadgeBackground(badge, iconName);
	return badge;
}

function stopAnimatedSpritePreview(root) {
	if (!root) {
		return;
	}

	const state = root._navMonsterPreviewState;
	if (state && state.timer) {
		clearInterval(state.timer);
	}
	root._navMonsterPreviewState = null;
}

function clearSpritePreview(canvas) {
	if (!canvas) {
		return;
	}
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function setSpritePreviewFallback(root, message) {
	const wrap = root.querySelector('.detail-sprite-wrap');
	const fallback = root.querySelector('.detail-sprite-fallback');
	const canvas = root.querySelector('.detail-sprite-canvas');

	stopAnimatedSpritePreview(root);

	if (canvas) {
		clearSpritePreview(canvas);
	}
	if (fallback) {
		fallback.textContent = message || '';
	}
	if (wrap) {
		wrap.classList.add('no-sprite');
	}
}

function renderSpritePreviewCanvas(root, sourceCanvas) {
	const target = root.querySelector('.detail-sprite-canvas');
	const wrap = root.querySelector('.detail-sprite-wrap');
	if (!target || !sourceCanvas) {
		setSpritePreviewFallback(root, '');
		return;
	}

	target.width = DETAIL_SPRITE_CANVAS_SIZE;
	target.height = DETAIL_SPRITE_CANVAS_SIZE;
	const ctx = target.getContext('2d');
	ctx.clearRect(0, 0, target.width, target.height);
	ctx.imageSmoothingEnabled = false;

	const scale = Math.min(2.5, Math.max(0.75, Math.min(DETAIL_SPRITE_MAX_WIDTH / Math.max(1, sourceCanvas.width), DETAIL_SPRITE_MAX_HEIGHT / Math.max(1, sourceCanvas.height))));
	const width = Math.round(sourceCanvas.width * scale);
	const height = Math.round(sourceCanvas.height * scale);
	const x = Math.floor((target.width - width) / 2);
	const y = Math.floor((target.height - height) / 2);
	ctx.drawImage(sourceCanvas, x, y, width, height);

	if (wrap) {
		wrap.classList.remove('no-sprite');
	}
}

function getMonsterBasePreviewPath(result) {
	const id = Number(result && result.id);
	if (Number.isFinite(id) && id > 0) {
		try {
			const bodyPath = DB.getBodyPath(id, 0);
			if (bodyPath) {
				return bodyPath;
			}
		} catch (_e) {
			// Continue with Navi_Mob sprite fallback below.
		}
	}

	if (result && result.sprite) {
		const spriteName = String(result.sprite).toLowerCase();
		return 'data/sprite/monster/' + spriteName;
	}

	return '';
}

function getMonsterSpriteCandidatePaths(result) {
	const basePath = getMonsterBasePreviewPath(result);
	const paths = [];
	if (basePath) {
		paths.push(basePath);
	}

	if (result && result.sprite) {
		const spriteName = String(result.sprite).toLowerCase();
		paths.push('data/sprite/¸ó½ºÅÍ/' + spriteName);
		paths.push('data/sprite/monster/' + spriteName);
	}

	return uniqueList(paths);
}

function getNpcSpriteCandidatePaths(result) {
	const ids = [
		result && result.classId,
		result && result.npcClassId,
		result && result.jobId,
		result && result.id
	];
	const paths = [];

	for (let i = 0; i < ids.length; i++) {
		const id = Number(ids[i]);
		if (!Number.isFinite(id) || !id) {
			continue;
		}
		try {
			const bodyPath = DB.getBodyPath(id, 0);
			if (bodyPath) {
				paths.push(bodyPath);
			}
		} catch (_e) {
			// Try the next id.
		}
	}

	return uniqueList(paths);
}

function getActorSpriteCandidatePaths(result) {
	if (result && result.type === 'NPC') {
		return getNpcSpriteCandidatePaths(result);
	}
	return getMonsterSpriteCandidatePaths(result);
}

function getActorPreviewCacheKey(result) {
	if (!result) {
		return '';
	}
	if (result.type === 'NPC') {
		return 'NPC:' + (Number(result.classId || result.npcClassId || result.jobId || result.id) || result.name || '');
	}
	return 'MOB:' + (Number(result.id) || result.sprite || result.name || '');
}

function loadPreviewShadowBuffers(callback) {
	if (_previewShadowBuffersLoaded) {
		callback(_previewShadowSprBuffer, _previewShadowActBuffer);
		return;
	}

	_previewShadowCallbacks.push(callback);
	if (_previewShadowBuffersLoading) {
		return;
	}

	_previewShadowBuffersLoading = true;
	const finishShadowLoad = (sprData, actData) => {
		_previewShadowSprBuffer = sprData && sprData.frames ? sprData : null;
		_previewShadowActBuffer = actData && actData.actions ? actData : null;
		_previewShadowBuffersLoaded = true;
		_previewShadowBuffersLoading = false;

		const callbacks = _previewShadowCallbacks.splice(0);
		for (let i = 0; i < callbacks.length; i++) {
			callbacks[i](_previewShadowSprBuffer, _previewShadowActBuffer);
		}
	};

	Client.loadFile(
		'data/sprite/shadow.spr',
		sprData => {
			Client.loadFile(
				'data/sprite/shadow.act',
				actData => finishShadowLoad(sprData, actData),
				() => finishShadowLoad(null, null)
			);
		},
		() => finishShadowLoad(null, null)
	);
}

function buildMonsterPreviewRuntime(sprData, actData, shadowSprData, shadowActData) {
	if (!sprData || !sprData.frames || !actData || !actData.actions) {
		throw new Error('Invalid sprite or action data');
	}

	const entity = new Entity();
	entity.effectColor[0] = 1.0;
	entity.effectColor[1] = 1.0;
	entity.effectColor[2] = 1.0;
	entity.effectColor[3] = 1.0;

	let idleActionIndex = 0;
	for (let i = 0; i < Math.min(actData.actions.length, 8); i++) {
		const candidate = actData.actions[i];
		if (candidate && candidate.animations && candidate.animations.length) {
			idleActionIndex = i;
			break;
		}
	}

	const runtime = {
		sprite: sprData,
		action: actData,
		entity: entity,
		idleActionIndex: idleActionIndex,
		position: new Uint16Array([0, 0]),
		shadowSprite: null,
		shadowAction: null,
		shadowEntity: null
	};

	if (shadowSprData && shadowSprData.frames && shadowActData && shadowActData.actions) {
		runtime.shadowSprite = shadowSprData;
		runtime.shadowAction = shadowActData;
		runtime.shadowEntity = new Entity();
		runtime.shadowEntity.effectColor[0] = 1.0;
		runtime.shadowEntity.effectColor[1] = 1.0;
		runtime.shadowEntity.effectColor[2] = 1.0;
		runtime.shadowEntity.effectColor[3] = 1.0;
	}

	return runtime;
}

function getCanvasAlphaBounds(ctx, width, height) {
	const pixels = ctx.getImageData(0, 0, width, height).data;
	let minX = width;
	let minY = height;
	let maxX = -1;
	let maxY = -1;

	for (let y = 0; y < height; y++) {
		let row = y * width * 4;
		for (let x = 0; x < width; x++) {
			if (pixels[row + x * 4 + 3] > 4) {
				if (x < minX) minX = x;
				if (y < minY) minY = y;
				if (x > maxX) maxX = x;
				if (y > maxY) maxY = y;
			}
		}
	}

	if (maxX < minX || maxY < minY) {
		return null;
	}

	return {
		x: Math.max(0, minX - 2),
		y: Math.max(0, minY - 2),
		width: Math.min(width - Math.max(0, minX - 2), maxX - minX + 5),
		height: Math.min(height - Math.max(0, minY - 2), maxY - minY + 5)
	};
}


function getPreviewOffscreen(runtime) {
	if (!runtime.previewCanvas) {
		runtime.previewCanvas = document.createElement('canvas');
		runtime.previewCanvas.width = 220;
		runtime.previewCanvas.height = 220;
		runtime.previewCtx = runtime.previewCanvas.getContext('2d', { willReadFrequently: true });
	}

	return {
		canvas: runtime.previewCanvas,
		ctx: runtime.previewCtx
	};
}

function renderActorPreviewFrame(runtime, animation, offscreen, offCtx, originX, originY) {
	offCtx.setTransform(1, 0, 0, 1, 0, 0);
	offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
	offCtx.imageSmoothingEnabled = false;

	if (runtime.shadowSprite && runtime.shadowAction && runtime.shadowEntity) {
		const shadowAction = runtime.shadowAction.actions[0];
		const shadowAnimation = shadowAction && shadowAction.animations && shadowAction.animations[0];
		if (shadowAnimation && shadowAnimation.layers && shadowAnimation.layers.length) {
			SpriteRenderer.bind2DContext(offCtx, originX, originY);
			for (let i = 0; i < shadowAnimation.layers.length; i++) {
				runtime.shadowEntity.renderLayer(
					shadowAnimation.layers[i],
					runtime.shadowSprite,
					runtime.shadowSprite,
					1.0,
					runtime.position,
					'shadow',
					false
				);
			}
		}
	}

	SpriteRenderer.bind2DContext(offCtx, originX, originY);
	for (let i = 0; i < animation.layers.length; i++) {
		runtime.entity.renderLayer(animation.layers[i], runtime.sprite, runtime.sprite, 1.0, runtime.position, false);
	}
}

function mergePreviewBounds(a, b, canvasWidth, canvasHeight) {
	if (!b) {
		return a;
	}
	if (!a) {
		return {
			x: b.x,
			y: b.y,
			width: b.width,
			height: b.height
		};
	}

	const x1 = Math.max(0, Math.min(a.x, b.x));
	const y1 = Math.max(0, Math.min(a.y, b.y));
	const x2 = Math.min(canvasWidth, Math.max(a.x + a.width, b.x + b.width));
	const y2 = Math.min(canvasHeight, Math.max(a.y + a.height, b.y + b.height));

	return {
		x: x1,
		y: y1,
		width: Math.max(1, x2 - x1),
		height: Math.max(1, y2 - y1)
	};
}

function getStablePreviewBounds(runtime, idleAction, offscreen, offCtx, originX, originY) {
	if (runtime.stablePreviewBounds) {
		return runtime.stablePreviewBounds;
	}

	let unionBounds = null;
	for (let i = 0; i < idleAction.animations.length; i++) {
		const frameAnimation = idleAction.animations[i];
		if (!frameAnimation || !frameAnimation.layers || !frameAnimation.layers.length) {
			continue;
		}

		renderActorPreviewFrame(runtime, frameAnimation, offscreen, offCtx, originX, originY);
		unionBounds = mergePreviewBounds(
			unionBounds,
			getCanvasAlphaBounds(offCtx, offscreen.width, offscreen.height),
			offscreen.width,
			offscreen.height
		);
	}

	runtime.stablePreviewBounds = unionBounds;
	return unionBounds;
}

function drawAnimatedMonsterPreview(root, runtime, frameTime) {
	const target = root.querySelector('.detail-sprite-canvas');
	const wrap = root.querySelector('.detail-sprite-wrap');
	if (!target || !runtime || !runtime.action || !runtime.sprite) {
		setSpritePreviewFallback(root, '');
		return;
	}

	const idleAction = runtime.action.actions[runtime.idleActionIndex] || runtime.action.actions[0];
	if (!idleAction || !idleAction.animations || !idleAction.animations.length) {
		setSpritePreviewFallback(root, '');
		return;
	}

	const delay = Math.max(60, Number(idleAction.delay) || 150);
	const animIndex = Math.floor(frameTime / delay) % idleAction.animations.length;
	const animation = idleAction.animations[animIndex];
	if (!animation || !animation.layers || !animation.layers.length) {
		if (wrap) {
			wrap.classList.remove('no-sprite');
		}
		return;
	}

	const preview = getPreviewOffscreen(runtime);
	const offscreen = preview.canvas;
	const offCtx = preview.ctx;

	// Render into a large hidden canvas first. Some monsters/NPCs have wide ACT
	// offsets, so a 58px direct render cuts wings/heads. Use one stable union
	// bounds rectangle for the whole idle action; otherwise each frame is scaled
	// separately and the preview appears to grow/shrink while animating.
	const originX = 110;
	const originY = 160;
	const stableBounds = getStablePreviewBounds(runtime, idleAction, offscreen, offCtx, originX, originY);

	renderActorPreviewFrame(runtime, animation, offscreen, offCtx, originX, originY);

	const bounds = stableBounds || getCanvasAlphaBounds(offCtx, offscreen.width, offscreen.height);
	const ctx = target.getContext('2d');
	target.width = DETAIL_SPRITE_CANVAS_SIZE;
	target.height = DETAIL_SPRITE_CANVAS_SIZE;
	ctx.clearRect(0, 0, target.width, target.height);
	ctx.imageSmoothingEnabled = false;

	if (!bounds) {
		if (wrap) {
			wrap.classList.remove('no-sprite');
		}
		return;
	}

	const maxPreviewWidth = DETAIL_SPRITE_MAX_WIDTH;
	const maxPreviewHeight = DETAIL_SPRITE_MAX_HEIGHT;
	const scale = Math.min(maxPreviewWidth / bounds.width, maxPreviewHeight / bounds.height, 2.0);
	const drawWidth = Math.max(1, Math.round(bounds.width * scale));
	const drawHeight = Math.max(1, Math.round(bounds.height * scale));
	const drawX = Math.floor((target.width - drawWidth) / 2);
	let drawY = Math.floor((target.height - drawHeight) / 2);
	if (drawY < 0) {
		drawY = 0;
	}

	ctx.drawImage(
		offscreen,
		bounds.x,
		bounds.y,
		bounds.width,
		bounds.height,
		drawX,
		drawY,
		drawWidth,
		drawHeight
	);

	if (wrap) {
		wrap.classList.remove('no-sprite');
	}
}

function startAnimatedMonsterPreview(root, runtime) {
	if (!root || !runtime) {
		setSpritePreviewFallback(root, '');
		return;
	}

	stopAnimatedSpritePreview(root);
	const fallback = root.querySelector('.detail-sprite-fallback');
	if (fallback) {
		fallback.textContent = '';
	}

	const state = {
		runtime: runtime,
		startedAt: Date.now(),
		timer: null
	};
	root._navMonsterPreviewState = state;

	const renderNow = () => {
		if (!root._navMonsterPreviewState || root._navMonsterPreviewState !== state) {
			return;
		}
		drawAnimatedMonsterPreview(root, runtime, Date.now() - state.startedAt);
	};

	renderNow();
	state.timer = setInterval(renderNow, 100);
}

function loadMonsterSpritePreview(root, result) {
	const cacheKey = getActorPreviewCacheKey(result);
	if (!root || !cacheKey) {
		setSpritePreviewFallback(root, '');
		return;
	}

	if (_monsterPreviewRuntimeCache[cacheKey]) {
		startAnimatedMonsterPreview(root, _monsterPreviewRuntimeCache[cacheKey]);
		return;
	}

	setSpritePreviewFallback(root, '');

	const candidates = getActorSpriteCandidatePaths(result);
	let index = 0;

	const tryNextSprite = () => {
		if (index >= candidates.length) {
			setSpritePreviewFallback(root, '');
			return;
		}

		const basePath = candidates[index++];
		let sprPath = basePath;
		let actPath = basePath;
		if (!/\.spr$/i.test(sprPath) && !/\.act$/i.test(sprPath)) {
			sprPath += '.spr';
			actPath += '.act';
		} else {
			sprPath = sprPath.replace(/\.act$/i, '.spr');
			actPath = actPath.replace(/\.spr$/i, '.act');
		}

		Client.loadFile(
			sprPath,
			sprData => {
				if (!sprData || !sprData.frames) {
					tryNextSprite();
					return;
				}

				Client.loadFile(
					actPath,
					actData => {
						if (!actData || !actData.actions) {
							tryNextSprite();
							return;
						}

						loadPreviewShadowBuffers((shadowSprData, shadowActData) => {
							try {
								const runtime = buildMonsterPreviewRuntime(sprData, actData, shadowSprData, shadowActData);
								_monsterPreviewRuntimeCache[cacheKey] = runtime;
								startAnimatedMonsterPreview(root, runtime);
							} catch (_e) {
								tryNextSprite();
							}
						});
					},
					tryNextSprite
				);
			},
			tryNextSprite,
			{ to_rgba: true }
		);
	};

	tryNextSprite();
}

function updateDetailSpritePreview(root, result) {
	if (!root || !result) {
		setSpritePreviewFallback(root, '');
		return;
	}

	if (result.type === 'MOB' || result.type === 'NPC') {
		loadMonsterSpritePreview(root, result);
		return;
	}

	setSpritePreviewFallback(root, 'MAP');
}


function updateRoadIconSelectorUI(root) {
	if (!root) {
		return;
	}

	const choices = root.querySelectorAll('.roadicon-choice');
	for (let i = 0; i < choices.length; i++) {
		const index = Number(choices[i].getAttribute('data-roadicon-index')) || 1;
		choices[i].classList.toggle('selected', index === _selectedRoadIconIndex);
	}
}

function closeRoadIconSelector(root) {
	if (!root) {
		return;
	}
	const selector = root.querySelector('.roadicon-selector');
	if (selector) {
		selector.classList.remove('open');
	}
}

function updateSelectedRoadIconButton(root) {
	if (!root) {
		return;
	}
	const button = root.querySelector('.footer-roadicon-button');
	if (!button) {
		return;
	}
	const index = Math.max(1, Math.min(8, Number(_selectedRoadIconIndex) || 1));
	button.setAttribute('bg', 'navigation_interface3/btn_roadiocn_select' + index + '_normal.bmp');
	button.setAttribute('hover', 'navigation_interface3/btn_roadiocn_select' + index + '_over.bmp');
	button.setAttribute('down', 'navigation_interface3/btn_roadiocn_select' + index + '_press.bmp');
}

function setSelectedRoadIcon(index) {
	index = Math.max(1, Math.min(8, Number(index) || 1));
	_selectedRoadIconIndex = index;

	if (NavigationFootstep && typeof NavigationFootstep.setRoadIcon === 'function') {
		NavigationFootstep.setRoadIcon(index);
	}

	const root = Navigation.getRoot && Navigation.getRoot();
	updateRoadIconSelectorUI(root);
	updateSelectedRoadIconButton(root);

	// Rebuild floor markers so the currently active route switches to the new
	// selected official navi_grid texture right away.
	if (_path && _path.length > 1) {
		clearWorldFootsteps();
		resetFootstepProgress();
	}
}


/**
 * @var {Image} arrow image
 */
const _arrow = createAsyncImage();

/**
 * @var {Image} map information images
 */
const _toolDealer = createAsyncImage();
const _weaponDealer = createAsyncImage();
const _armorDealer = createAsyncImage();
const _blacksmith = createAsyncImage();
const _guide = createAsyncImage();
const _inn = createAsyncImage();
const _kafra = createAsyncImage();

/** Official navigation interface icons */
const _navListMapIcon = createAsyncImage();
const _navListMobIcon = createAsyncImage();
const _navListNpcIcon = createAsyncImage();
const _navListRouteIcon = createAsyncImage();
const _navListStartIcon = createAsyncImage();
const _navListTargetIcon = createAsyncImage();
const _navIcoDestination = createAsyncImage();
const _navIcoLocation = createAsyncImage();
const _navScrollUp = createAsyncImage();
const _navScrollMid = createAsyncImage();
const _navScrollDown = createAsyncImage();
const _navBarUp = createAsyncImage();
const _navBarMid = createAsyncImage();
const _navBarDown = createAsyncImage();

/**
 * @var {Object} navigation interface icon data-uris
 */
const _navInterfaceIconURI = {};

/**
 * @var {Image} minimap image
 */
const _map = createAsyncImage();

/**
 * @var {CanvasRenderingContext2D} canvas context
 */
let _ctx = null;

/**
 * @var {Array} town information
 */
let _towninfo = [];

/**
 * @var {Array} markers on the map
 */
const _markers = [];

/**
 * @var {Array} path points
 */
let _path = [];

/**
 * @var {number} Last time the path was recalculated
 */
let _lastPathUpdate = 0;

/**
 * @var {number} Minimum time between path recalculations (in ms)
 */
const _pathUpdateThrottle = 500;

/**
 * @var {boolean} Lock for path update
 */
let _pathUpdateLock = false;

/**
 * @var {Worker} pathfinding worker
 */
let _pathFindingWorker = null;

/**
 * @var {Object} map data
 */
let _mapData = null;

/**
 * @var {Object} target data
 */
let _targetData = null;

/**
 * @var {Object} final target data
 */
let _finalTargetData = null;

/**
 * @var {Array} latest official-style search results
 */
let _searchResults = [];

/**
 * @var {Object} selected official-style search result
 */
let _selectedSearchResult = null;

/**
 * @var {boolean} was target set by map click
 */
let _isMapClickTarget = false;

/**
 * @var {number} selected official road/footprint icon style (1-8)
 */
let _selectedRoadIconIndex = 1;

/**
 * @var {boolean} blinking state for target coordinates
 */
let _blinking = false;

/**
 * @var {number} fade interval ID for blinking
 */
let _fadeInterval = null;

/**
 * @var {string} original color for blinking restore
 */
let _originalColor = '';

/**
 * Document click handler reference for cleanup
 */
let _documentClickHandler = null;

/**
 * @var {boolean} true when the Navigation window is reduced to the small status panel.
 * Minimized is not the same as closed: route effects remain active while minimized.
 */
let _isMinimized = false;

/**
 * @var {string} map currently being loaded into the navigation canvas
 */
let _loadingMapName = null;

/**
 * @var {string} owner id used to remove all navigation floor footsteps at once
 */
const _navigationFootstepOwnerAID = 'navigation-footsteps';

/**
 * @var {number} local-only effect id for navigation floor footsteps
 */
const _navigationFootstepEffectID = 990001;

/**
 * @var {string} last generated floor-footstep signature
 */
let _navigationFootstepKey = '';

/**
 * @var {string} map currently represented by floor footsteps
 */
let _navigationFootstepMap = '';

/**
 * @var {Array} generated floor-footstep marker metadata for the active route
 */
let _navigationFootstepMarkers = [];

/**
 * @var {string} last route signature sent to the world map overlay
 */
let _lastPublishedNavigationRouteKey = '';

/**
 * @var {string} current same-map navigation segment that has already been calculated
 */
let _currentSegmentRequestKey = '';

/**
 * @var {string} same-map navigation segment currently waiting for pathfinding result
 */
let _pendingSegmentRequestKey = '';

/**
 * @var {number} visual progress cursor for the official floor-footstep route.
 * This does not mutate the calculated path; it only hides footsteps that the
 * player already passed.
 */
let _navigationFootstepProgressIndex = 0;

/**
 * @var {string} last player cell processed for floor-footstep progress only
 */
let _navigationFootstepPlayerCellKey = '';

/**
 * @var {number} maximum distance used to treat the player as being on the route
 */
const _navigationFootstepNearDistance = 2;

/**
 * @var {number} maximum fallback distance from the route before footstep progress pauses
 */
const _navigationFootstepSearchDistance = 8;

/**
 * @var {number} spacing between floor route arrows in path cells
 */
const _navigationFootstepSpacing = 4;

/**
 * @var {number} maximum amount of floor route arrows generated for one same-map route segment
 */
const _navigationFootstepMax = 128;

/**
 * @var {number} last time a route recalculation was requested because the
 * player walked backward/off-route on the same map.
 */
let _navigationBacktrackRecalculateTick = 0;

/**
 * @var {number} throttle for same-map backtrack/off-route recalculation.
 */
const _navigationBacktrackRecalculateThrottle = 1000;

/**
 * @var {number} how far behind the visual cursor the player must be before
 * navigation rebuilds from the current position. This keeps normal forward
 * footstep cleanup from recalculating, but fixes walking backward/away.
 */
const _navigationBacktrackIndexThreshold = 3;

/**
 * @var {number} distance from the route that should trigger a rebuild from
 * the current player position.
 */
const _navigationOffRouteRecalculateDistance = 8;

/**
 * Local utility functions
 */

/**
 * Normalize a map name (remove .gat extension)
 */
function normalizeMapName(mapName) {
	mapName = String(mapName || '').replace(/\.gat$/, '').toLowerCase();
	mapName = mapName.replace(/^(.+)_[a-d]$/, '$1');
	return mapName;
}

/**
 * Format coordinates with consistent styling
 */
function formatCoordinates(x, y, options) {
	options = options || {};
	const shouldFloor = options.floor !== false;

	if (shouldFloor) {
		return `${Math.floor(x)},${Math.floor(y)}`;
	}
	return `${x},${y}`;
}

/**
 * Format target coordinates text with consistent styling
 */
function formatTargetCoordinates(x, y, options) {
	options = options || {};

	let text = `${Math.floor(x)},${Math.floor(y)}`;

	if (options.noPathFound) {
		text += ' (no path found)';
	} else if (options.targetMap && options.targetMap !== getCurrentMap()) {
		text += ` (${options.targetMap})`;
	}

	return text;
}

/**
 * Format location title with consistent styling
 */
function formatLocationTitle(currentMap, targetMap, displayName) {
	let text;

	if (!displayName && targetMap && currentMap !== targetMap) {
		text = `[${currentMap} → ${targetMap}]`;
	} else {
		text = `[${displayName || currentMap}]`;
	}

	return text;
}

/**
 * Convert map coordinates to screen coordinates
 */
function mapToScreen(x, y, width, height) {
	const scaleX = width / _mapData.width;
	const scaleY = height / _mapData.height;
	const scale = Math.min(scaleX, scaleY);

	const mapWidth = _mapData.width * scale;
	const mapHeight = _mapData.height * scale;

	const offsetX = (width - mapWidth) / 2;
	const offsetY = (height - mapHeight) / 2;

	const screenX = (x / _mapData.width) * mapWidth + offsetX;
	const screenY = ((_mapData.height - y) / _mapData.height) * mapHeight + offsetY;

	return { x: screenX, y: screenY };
}

function getNavigationMapCanvasSize() {
	const root = Navigation.getRoot && Navigation.getRoot();
	const mapDisplay = root && root.querySelector ? root.querySelector('.map-display') : null;
	const rect = mapDisplay && mapDisplay.getBoundingClientRect ? mapDisplay.getBoundingClientRect() : null;
	const width = Math.max(1, Math.round((rect && rect.width) || 280));
	const height = Math.max(1, Math.round((rect && rect.height) || 230));

	return {
		width: width,
		height: height
	};
}

function resizeNavigationMapCanvas(ctx) {
	if (!ctx || !ctx.canvas) {
		return getNavigationMapCanvasSize();
	}

	const size = getNavigationMapCanvasSize();
	if (ctx.canvas.width !== size.width) {
		ctx.canvas.width = size.width;
	}
	if (ctx.canvas.height !== size.height) {
		ctx.canvas.height = size.height;
	}

	return size;
}

function drawNavigationMapLabel(ctx, text, x, y, options) {
	if (!ctx || !text) {
		return;
	}

	options = options || {};
	ctx.save();
	ctx.font = options.font || 'bold 11px Arial, sans-serif';
	ctx.textAlign = options.align || 'left';
	ctx.textBaseline = options.baseline || 'top';
	ctx.lineWidth = 3;
	ctx.strokeStyle = 'rgba(0,0,0,0.88)';
	ctx.fillStyle = options.color || '#ffffff';
	ctx.strokeText(text, x, y);
	ctx.fillText(text, x, y);
	ctx.restore();
}

function drawNavigationMapOverlays(ctx, width, height, currentMap, currentPos) {
	if (!ctx) {
		return;
	}

	const safeMap = normalizeMapName(currentMap || '');
	const safeX = Math.floor(Number(currentPos && currentPos.x) || 0);
	const safeY = Math.floor(Number(currentPos && currentPos.y) || 0);

	if (safeMap) {
		drawNavigationMapLabel(ctx, safeMap + ' ' + safeX + ' ' + safeY, 5, 5);
	}

	if (_finalTargetData && _finalTargetData.map) {
		drawNavigationMapLabel(ctx, '[Dest] ' + normalizeMapName(_finalTargetData.map), 5, height - 16);
	}
}

/**
 * Get the current map name
 */
function getCurrentMap() {
	if (MapRenderer && MapRenderer.currentMap) {
		return normalizeMapName(MapRenderer.currentMap);
	}
}

/**
 * Get the current player position
 */
function getPlayerPosition() {
	if (!Session.Entity || !Session.Entity.position) {
		return { x: 0, y: 0 };
	}
	const currentX = Math.ceil(Session.Entity.position[0]);
	const currentY = Math.ceil(Session.Entity.position[1]);

	return { x: currentX, y: currentY };
}

/**
 * Remove all navigation route footsteps from the 3D floor.
 */
function clearWorldFootsteps() {
	if (_navigationFootstepMarkers.length > 0) {
		EffectManager.remove(null, _navigationFootstepOwnerAID);
	}
	_navigationFootstepKey = '';
	_navigationFootstepMap = '';
	_navigationFootstepMarkers = [];
}

/**
 * Calculate the map-direction angle for a footstep marker.
 */
function getFootstepAngle(previousPoint, currentPoint, nextPoint) {
	const fromPoint = previousPoint || currentPoint;
	const toPoint = nextPoint || currentPoint;
	let dx = Number(toPoint.x) - Number(fromPoint.x);
	let dy = Number(toPoint.y) - Number(fromPoint.y);

	if (!dx && !dy && currentPoint && previousPoint) {
		dx = Number(currentPoint.x) - Number(previousPoint.x);
		dy = Number(currentPoint.y) - Number(previousPoint.y);
	}

	if (!dx && !dy) {
		return 0;
	}

	// The official navigation_interface3 road icons are authored facing the
	// opposite direction compared with the original procedural arrow. Rotate
	// the marker by 180 degrees so each footprint points toward the next
	// route cell / destination instead of back to the previous location.
	return Math.atan2(dy, dx) + Math.PI / 2;
}

/**
 * Build a stable signature for the current floor route.
 */
function getFootstepPathKey(mapName, path) {
	if (!mapName || !path || !path.length) {
		return '';
	}

	const first = path[0];
	const last = path[path.length - 1];
	const middle = path[Math.floor(path.length / 2)] || first;

	return [
		mapName,
		path.length,
		first.x,
		first.y,
		middle.x,
		middle.y,
		last.x,
		last.y
	].join(':');
}

/**
 * Get currently allowed navigation warp types. Services must stay opt-in so
 * normal routes keep using walking portals only.
 */
const WALK_NAV_LINK_TYPES = [200];
const SERVICE_NAV_LINK_TYPES = [201, 202, 203, 204, 205];

function getAllowedWarpTypes() {
	const root = Navigation.getRoot && Navigation.getRoot();
	const servicesToggle = root && root.querySelector('.services-toggle');

	if (servicesToggle && servicesToggle.checked) {
		// Services mode allows official transport links in navi_link_krpri.lub:
		// airship/boat/Kafra/town-guide style routes, depending on the client's data.
		return WALK_NAV_LINK_TYPES.concat(SERVICE_NAV_LINK_TYPES);
	}

	return WALK_NAV_LINK_TYPES.slice();
}

/**
 * Build a stable key for the current navigation segment. It intentionally does
 * not include the player's X/Y position, otherwise the route would recalculate
 * every time the player walks one cell. The segment is recalculated only when
 * the current map, final target, or Services mode changes.
 */
function getSegmentRequestKey(currentMap, finalTargetData) {
	if (!currentMap || !finalTargetData) {
		return '';
	}

	return [
		normalizeMapName(currentMap),
		normalizeMapName(finalTargetData.map),
		Math.floor(Number(finalTargetData.x) || 0),
		Math.floor(Number(finalTargetData.y) || 0),
		getAllowedWarpTypes().join('-')
	].join(':');
}

/**
 * Reset only the current calculated segment markers, not the final target.
 */
function resetFootstepProgress() {
	_navigationFootstepProgressIndex = 0;
	_navigationFootstepPlayerCellKey = '';
	_navigationFootstepKey = '';
}

function resetSegmentTracking() {
	_currentSegmentRequestKey = '';
	_pendingSegmentRequestKey = '';
	resetFootstepProgress();
}

function getCellDistance(x1, y1, x2, y2) {
	return Math.max(Math.abs(Number(x1) - Number(x2)), Math.abs(Number(y1) - Number(y2)));
}

function getNavigationTick() {
	return Renderer && Number.isFinite(Renderer.tick) ? Renderer.tick : Date.now();
}

function findNearestNavigationPathIndex(currentPos) {
	let bestIndex = -1;
	let bestDistance = Infinity;

	if (!currentPos || !_path || !_path.length) {
		return { index: bestIndex, distance: bestDistance };
	}

	for (let i = 0; i < _path.length; i++) {
		const point = _path[i];
		if (!point || point.isWarp) {
			continue;
		}

		const distance = getCellDistance(currentPos.x, currentPos.y, point.x, point.y);
		if (distance < bestDistance) {
			bestDistance = distance;
			bestIndex = i;
		}
	}

	return { index: bestIndex, distance: bestDistance };
}

function requestNavigationRecalculateFromPlayer(reason) {
	if (!_finalTargetData || _pathUpdateLock) {
		return false;
	}

	const currentMap = getCurrentMap();
	const currentPos = getPlayerPosition();
	if (!currentMap || !currentPos) {
		return false;
	}

	const now = getNavigationTick();
	if (_navigationBacktrackRecalculateTick && now - _navigationBacktrackRecalculateTick < _navigationBacktrackRecalculateThrottle) {
		return false;
	}

	_navigationBacktrackRecalculateTick = now;
	_currentSegmentRequestKey = '';
	_pendingSegmentRequestKey = '';
	resetFootstepProgress();

	Navigation.navigateTo({
		startMap: currentMap,
		startX: currentPos.x,
		startY: currentPos.y,
		endMap: _finalTargetData.airshipMap || _finalTargetData.map,
		endX: _finalTargetData.x,
		endY: _finalTargetData.y,
		displayName: _finalTargetData.displayName,
		isNpc: _finalTargetData.isNpc,
		force: true,
		resumeSegment: true,
		silentRecalculate: true,
		recalculateReason: reason || 'backtrack'
	});

	return true;
}

function buildMiniStatusLine(mapName, x, y, prefix) {
	mapName = normalizeMapName(mapName);
	prefix = prefix || '';

	if (!mapName) {
		return prefix ? `${prefix}No target` : '';
	}

	return `${prefix}${mapName} ${Math.floor(Number(x) || 0)} ${Math.floor(Number(y) || 0)}`;
}


function getResultTypeLabel(result) {
	if (!result || !result.type) {
		return '[?]';
	}

	if (result.type === 'MOB') {
		return '[M]';
	}
	if (result.type === 'NPC') {
		return '[N]';
	}
	if (result.type === 'MAP') {
		return '[MAP]';
	}
	return '[' + result.type + ']';
}

function getResultTypeClass(result) {
	if (!result || !result.type) {
		return 'map_icon';
	}

	if (result.type === 'MOB') {
		return 'mob_icon';
	}
	if (result.type === 'NPC') {
		return 'npc_icon';
	}
	return 'map_icon';
}

function getResultListAmount(result) {
	if (!result) {
		return '';
	}

	if (result.type === 'MAP') {
		const count = Array.isArray(result.monsters) ? result.monsters.length : 0;
		return count > 0 ? '[' + count + ']' : '';
	}

	if (result.type === 'NPC') {
		const count = Array.isArray(result.spawns) ? result.spawns.length : 0;
		return count > 0 ? '[' + count + ']' : '';
	}

	if (result.type !== 'MOB') {
		return '';
	}

	const spawn = (result.spawns && result.spawns[0]) || null;
	const amount = spawn ? Number(spawn.amount) : 0;
	return amount > 0 ? '[' + amount + ']' : '';
}

function getResultListLabel(result) {
	if (!result) {
		return '';
	}
	if (result.type === 'MAP') {
		return normalizeMapName(result.mapName || result.id || result.name || '');
	}
	return result.name || result.mapName || '';
}

function getNpcSpawnLabel(result, spawn) {
	const mapName = normalizeMapName((spawn && spawn.mapName) || result.mapName || '');
	return (result.name || 'NPC') + '(' + mapName + ')';
}

function createOfficialTypeBadgeForType(type) {
	return createOfficialTypeBadge({ type: type });
}

function getSelectedMapMonster(result) {
	if (!result || result.type !== 'MAP') {
		return null;
	}

	if (result._selectedMapMonster) {
		return result._selectedMapMonster;
	}

	return Array.isArray(result.monsters) && result.monsters.length ? result.monsters[0] : null;
}

function getReadableElementName(value) {
	const elements = [
		'Neutral',
		'Water',
		'Earth',
		'Fire',
		'Wind',
		'Poison',
		'Holy',
		'Dark',
		'Ghost',
		'Undead'
	];

	return elements[value] || 'Neutral';
}

function getReadableRaceName(value) {
	const races = [
		'Formless',
		'Undead',
		'Brute',
		'Plant',
		'Insect',
		'Fish',
		'Demon',
		'Demi-Human',
		'Angel',
		'Dragon',
		'Boss',
		'Non-Boss'
	];

	return races[value] || 'Unknown';
}

function getReadableSizeName(value) {
	const sizes = ['Small', 'Medium', 'Large'];
	return sizes[value] || 'Medium';
}

function getSpawnRateLabel(amount) {
	amount = Number(amount) || 0;

	if (amount >= 60) {
		return 'Very High';
	}
	if (amount >= 25) {
		return 'High';
	}
	if (amount >= 10) {
		return 'Average';
	}
	if (amount >= 3) {
		return 'Low';
	}
	return 'Very Low';
}

function getSelectedResultTarget(result) {
	if (!result) {
		return null;
	}

	const spawn = result._selectedSpawn || (result.spawns && result.spawns[0]);
	if (spawn) {
		return {
			mapName: normalizeMapName(spawn.mapName || result.mapName),
			x: Number(spawn.x),
			y: Number(spawn.y),
			displayName: result.name || spawn.displayName || spawn.mapName
		};
	}

	return {
		mapName: normalizeMapName(result.mapName),
		x: Number(result.x),
		y: Number(result.y),
		displayName: result.name || result.mapName
	};
}

function getNavigationMapPreviewPath(mapName) {
	const mapBaseName = normalizeMapName(mapName).replace(/\..*/, '');
	let bmpPath = DB.INTERFACE_PATH.replace('data/texture/', '') + 'map/' + mapBaseName + '.bmp';
	bmpPath = bmpPath.replace(/\//g, '\\');
	bmpPath = DB.mapalias[bmpPath] || bmpPath;
	return 'data/texture/' + bmpPath;
}

function loadResultMapPreview(img, mapName) {
	if (!img || !mapName) {
		return;
	}

	img.removeAttribute('src');
	Client.loadFile(getNavigationMapPreviewPath(mapName), dataURI => {
		if (dataURI) {
			img.src = dataURI;
		} else {
			img.src = TRANSPARENT_PIXEL;
		}
	});
}

function buildDetailText(result, target) {
	if (!result) {
		return '';
	}

	if (result.type === 'MOB') {
		const lines = [];
		if (result.level) {
			lines.push('Lv. ' + result.level);
		}
		if (result.elementName) {
			lines.push(result.elementName);
		}
		if (result.raceName) {
			lines.push(result.raceName);
		}
		if (result.sizeName) {
			lines.push(result.sizeName);
		}
		return lines.join('\n');
	}

	if (result.type === 'NPC') {
		return [
			normalizeMapName(target.mapName),
			Math.floor(Number(target.x) || 0) + ', ' + Math.floor(Number(target.y) || 0)
		].join('\n');
	}

	if (result.type === 'MAP') {
		return '';
	}

	return [
		DB.getNaviMapDisplayName(target.mapName) || target.mapName,
		normalizeMapName(target.mapName),
		Math.floor(Number(target.x) || 0) + ', ' + Math.floor(Number(target.y) || 0)
	].join('\n');
}

function syncServiceToggles(changedToggle) {
	const root = Navigation.getRoot && Navigation.getRoot();
	if (!root || !changedToggle) {
		return;
	}

	const checked = !!changedToggle.checked;
	const toggles = root.querySelectorAll('.services-toggle');
	for (let i = 0; i < toggles.length; i++) {
		if (toggles[i] !== changedToggle) {
			toggles[i].checked = checked;
		}
	}
}

function updateMinimizedStatus(currentMap, currentPos) {
	const root = Navigation.getRoot && Navigation.getRoot();
	if (!root) {
		return;
	}

	currentMap = normalizeMapName(currentMap || getCurrentMap());
	currentPos = currentPos || getPlayerPosition();

	const currentEl = root.querySelector('.mini-current');
	if (currentEl) {
		const text = buildMiniStatusLine(currentMap, currentPos.x, currentPos.y, '');
		currentEl.textContent = text;
		currentEl.title = text;
	}

	const targetEl = root.querySelector('.mini-target');
	if (targetEl) {
		const target = _finalTargetData || _targetData;
		const text = target && target.map
			? buildMiniStatusLine(target.map, target.x, target.y, '')
			: 'No target';
		targetEl.textContent = text;
		targetEl.title = text;
	}
}

function getNavigationHasResults(root) {
	root = root || (Navigation.getRoot && Navigation.getRoot());
	if (!root) {
		return false;
	}

	const inner = root.querySelector('.Navigation');
	return !!(inner && inner.classList.contains('has-results'));
}

function applyMinimizedState() {
	const root = Navigation.getRoot && Navigation.getRoot();
	if (!root) {
		return;
	}

	const inner = root.querySelector('.Navigation');
	if (!inner) {
		return;
	}

	inner.classList.toggle('minimized', !!_isMinimized);

	// Keep the Navigation component as one stable window shell. The search result
	// panel only switches the inner content; it must not resize into a different
	// looking window. Minimized mode is the only state that intentionally changes
	// the outer shell size.
	const width = _isMinimized ? NAV_MINIMIZED_WIDTH : NAV_WINDOW_WIDTH;
	const height = _isMinimized ? NAV_MINIMIZED_HEIGHT : NAV_WINDOW_HEIGHT;

	inner.style.width = width + 'px';
	inner.style.height = height + 'px';
	inner.style.maxWidth = width + 'px';
	inner.style.maxHeight = height + 'px';
	inner.style.overflow = _isMinimized ? 'hidden' : '';

	if (Navigation._host) {
		Navigation._host.style.width = width + 'px';
		Navigation._host.style.height = height + 'px';
		Navigation._host.style.maxWidth = width + 'px';
		Navigation._host.style.maxHeight = height + 'px';
		Navigation._host.style.overflow = _isMinimized ? 'hidden' : 'visible';
	}

	const minimizeToggle = root.querySelector('.minimize-toggle');
	if (minimizeToggle && minimizeToggle.checked !== !!_isMinimized) {
		minimizeToggle.checked = !!_isMinimized;
	}

	updateMinimizedStatus();
}

/**
 * Move the visual footstep cursor forward as the player walks.
 *
 * Important: this intentionally does not change _path and does not call the
 * pathfinder. Official navigation keeps the selected route, then only the
 * floor footsteps in front of the player advance/disappear visually.
 */
function updateFootstepProgressFromPlayer(currentMap, currentPos) {
	currentMap = normalizeMapName(currentMap);

	if (
		!currentMap ||
		!currentPos ||
		!_targetData ||
		normalizeMapName(_targetData.map) !== currentMap ||
		!_path ||
		_path.length < 2
	) {
		return { changed: false, recalculate: false };
	}

	const positionKey = [currentMap, Math.floor(currentPos.x), Math.floor(currentPos.y)].join(':');
	if (positionKey === _navigationFootstepPlayerCellKey) {
		return { changed: false, recalculate: false };
	}
	_navigationFootstepPlayerCellKey = positionKey;

	const nearest = findNearestNavigationPathIndex(currentPos);
	if (nearest.index < 0) {
		return { changed: false, recalculate: false };
	}

	const progressIndex = Math.floor(Number(_navigationFootstepProgressIndex) || 0);

	// If the player is already far away from the selected route, rebuild the
	// same-map segment from the new current position. This matches the official
	// feel better than only restoring the old disappeared footsteps.
	if (nearest.distance > _navigationOffRouteRecalculateDistance) {
		return { changed: false, recalculate: true, reason: 'off-route' };
	}

	// Forward progress should only hide passed footsteps. It must not recalculate
	// just because a footstep disappeared. But if the player walks backward far
	// enough behind the current visual cursor, rebuild from the current position.
	if (nearest.index + _navigationBacktrackIndexThreshold < progressIndex) {
		return { changed: false, recalculate: true, reason: 'backtrack' };
	}

	// Avoid large visual jumps if the player is only near, but not really on, the
	// selected route. In that case wait until the player is closer or far enough
	// to trigger the off-route recalculation above.
	if (nearest.distance > _navigationFootstepNearDistance && Math.abs(nearest.index - progressIndex) > _navigationFootstepSpacing) {
		return { changed: false, recalculate: false };
	}

	if (nearest.index > progressIndex) {
		_navigationFootstepProgressIndex = nearest.index;
		return { changed: true, recalculate: false };
	}

	return { changed: false, recalculate: false };
}

/**
 * Build the minimap route view without mutating the calculated path.
 * The cyan route appears to shorten from the player position, while the saved
 * path remains stable and is not recalculated every time the player walks.
 */
function getVisualNavigationPath(currentMap, currentPos) {
	currentMap = normalizeMapName(currentMap);

	if (
		!currentMap ||
		!currentPos ||
		!_targetData ||
		normalizeMapName(_targetData.map) !== currentMap ||
		!_path ||
		_path.length < 2
	) {
		return _path;
	}

	const startPoint = {
		x: Math.floor(currentPos.x),
		y: Math.floor(currentPos.y),
		isWarp: false,
		warpId: null
	};
	const progressIndex = Math.min(_path.length - 2, Math.max(0, _navigationFootstepProgressIndex || 0));

	return [startPoint].concat(_path.slice(progressIndex + 1));
}

/**
 * Tell the large world map which maps are part of the current navigation route.
 * This lets the world map draw the blue official-style route overlay without
 * importing WorldMap here and creating a circular dependency.
 */

function clearWorldMapMonsterSearchMarkers() {
	if (typeof window === 'undefined') {
		return;
	}

	const current = window.__RO_BROWSER_NAVIGATION_ROUTE__ || null;
	if (!current || !current.active) {
		return;
	}

	let detail;
	if (current.searchOnly) {
		detail = { active: false };
	} else if ((Array.isArray(current.targetSpawns) && current.targetSpawns.length) || (Array.isArray(current.targetEntries) && current.targetEntries.length)) {
		detail = Object.assign({}, current, {
			targetType: '',
			targetName: '',
			targetSpawns: [],
			targetEntries: []
		});
	} else {
		return;
	}

	_lastPublishedNavigationRouteKey = '';
	window.__RO_BROWSER_NAVIGATION_ROUTE__ = detail;
	document.dispatchEvent(
		new CustomEvent('roBrowserNavigationRouteChanged', {
			detail: detail
		})
	);
}

function publishWorldMapSearchResult(result, allResults) {
	if (!result) {
		clearWorldMapMonsterSearchMarkers();
		return;
	}

	if (result.type === 'MOB' && Array.isArray(result.spawns) && result.spawns.length) {
		const targetSpawns = result.spawns.map(spawn => ({
			mapName: normalizeMapName(spawn.mapName || result.mapName || ''),
			amount: Number(spawn.amount) || 0,
			rateLabel: spawn.rateLabel || getSpawnRateLabel(spawn.amount)
		}));

		const key = ['search-mob', result.id || result.name || '', targetSpawns.map(spawn => [spawn.mapName, spawn.amount, spawn.rateLabel].join(',')).join('>')].join(':');
		if (key === _lastPublishedNavigationRouteKey) {
			return;
		}
		_lastPublishedNavigationRouteKey = key;

		const detail = {
			active: true,
			searchOnly: true,
			startMap: '',
			endMap: '',
			displayName: result.name || '',
			targetType: 'MOB',
			targetName: result.name || '',
			targetSpawns: targetSpawns,
			targetEntries: [],
			routeMaps: [],
			points: []
		};

		if (typeof window !== 'undefined') {
			window.__RO_BROWSER_NAVIGATION_ROUTE__ = detail;
		}

		document.dispatchEvent(
			new CustomEvent('roBrowserNavigationRouteChanged', {
				detail: detail
			})
		);
		return;
	}

	if (result.type === 'NPC') {
		const npcEntries = Array.isArray(result.spawns) && result.spawns.length
			? result.spawns
			: ((Array.isArray(allResults) && allResults.length ? allResults : [result]).filter(candidate => candidate && candidate.type === 'NPC'));
		const seen = {};
		const targetEntries = [];

		for (let i = 0; i < npcEntries.length; i++) {
			const candidate = npcEntries[i];
			const mapName = normalizeMapName((candidate && candidate.mapName) || (candidate && candidate._selectedSpawn && candidate._selectedSpawn.mapName) || '');
			if (!mapName || seen[mapName]) {
				continue;
			}
			seen[mapName] = true;

			targetEntries.push({
				mapName: mapName,
				x: Math.floor(Number((candidate && candidate.x) || (candidate && candidate._selectedSpawn && candidate._selectedSpawn.x) || 0)),
				y: Math.floor(Number((candidate && candidate.y) || (candidate && candidate._selectedSpawn && candidate._selectedSpawn.y) || 0))
			});
		}

		if (!targetEntries.length) {
			clearWorldMapMonsterSearchMarkers();
			return;
		}

		const key = ['search-npc', result.id || result.name || '', targetEntries.map(entry => [entry.mapName, entry.x, entry.y].join(',')).join('>')].join(':');
		if (key === _lastPublishedNavigationRouteKey) {
			return;
		}
		_lastPublishedNavigationRouteKey = key;

		const detail = {
			active: true,
			searchOnly: true,
			startMap: '',
			endMap: '',
			displayName: result.name || '',
			targetType: 'NPC',
			targetName: result.name || '',
			targetSpawns: [],
			targetEntries: targetEntries,
			routeMaps: [],
			points: []
		};

		if (typeof window !== 'undefined') {
			window.__RO_BROWSER_NAVIGATION_ROUTE__ = detail;
		}

		document.dispatchEvent(
			new CustomEvent('roBrowserNavigationRouteChanged', {
				detail: detail
			})
		);
		return;
	}

	clearWorldMapMonsterSearchMarkers();
}

function publishNavigationRoute(active, routePath, startMap, endMap, displayName) {
	let points = [];
	let routeMaps = [];

	function addMap(mapName) {
		mapName = normalizeMapName(mapName);
		if (mapName && routeMaps.indexOf(mapName) === -1) {
			routeMaps.push(mapName);
		}
	}

	if (active) {
		addMap(startMap);
		points = (routePath || [])
			.filter(point => point && point.map)
			.map(point => {
				const mapName = normalizeMapName(point.map);
				addMap(mapName);
				return {
					map: mapName,
					x: Math.floor(Number(point.x) || 0),
					y: Math.floor(Number(point.y) || 0),
					warpId: point.warpId || null,
					type: point.type || null,
					service: !!point.service,
					name: point.name || ''
				};
			});
		addMap(endMap);
	}

	const pointsKey = points.map(point => [point.map, point.x, point.y, point.warpId || '', point.type || '', point.service ? 'svc' : 'walk'].join(',')).join('>');
	const key = active
		? ['active', normalizeMapName(startMap), normalizeMapName(endMap), routeMaps.join('>'), pointsKey].join(':')
		: 'inactive';

	if (key === _lastPublishedNavigationRouteKey) {
		return;
	}

	_lastPublishedNavigationRouteKey = key;

	const targetResult = Navigation.targetResult || null;
	const targetSpawns = targetResult && targetResult.type === 'MOB' && Array.isArray(targetResult.spawns)
		? targetResult.spawns.map(spawn => ({
			mapName: normalizeMapName(spawn.mapName || ''),
			amount: Number(spawn.amount) || 0,
			rateLabel: spawn.rateLabel || getSpawnRateLabel(spawn.amount)
		}))
		: [];
	const targetEntries = targetResult && targetResult.type === 'NPC'
		? [{
			mapName: normalizeMapName((targetResult._selectedSpawn && targetResult._selectedSpawn.mapName) || targetResult.mapName || endMap || ''),
			x: Math.floor(Number((targetResult._selectedSpawn && targetResult._selectedSpawn.x) || targetResult.x || 0)),
			y: Math.floor(Number((targetResult._selectedSpawn && targetResult._selectedSpawn.y) || targetResult.y || 0))
		}]
		: [];
	const detail = {
		active: !!active,
		startMap: normalizeMapName(startMap),
		endMap: normalizeMapName(endMap),
		displayName: displayName || '',
		targetType: targetResult && targetResult.type ? String(targetResult.type).toUpperCase() : '',
		targetName: targetResult && targetResult.name ? String(targetResult.name) : '',
		targetSpawns: targetSpawns,
		targetEntries: targetEntries,
		routeMaps: routeMaps,
		points: points
	};

	if (typeof window !== 'undefined') {
		window.__RO_BROWSER_NAVIGATION_ROUTE__ = detail;
	}

	document.dispatchEvent(
		new CustomEvent('roBrowserNavigationRouteChanged', {
			detail: detail
		})
	);
}

/**
 * Draw the classic roBrowserLegacy navigation route on the Navigation minimap.
 * This keeps the minimap route as a straight solid cyan line, with yellow dots
 * for warp points, matching the original client behavior.
 */
function drawMiniMapRoute(ctx, path, mapToScreenBound) {
	if (!path || path.length < 2) {
		return;
	}

	ctx.save();
	ctx.lineWidth = 2;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.setLineDash([5, 4]);
	ctx.strokeStyle = '#00e5ff';
	ctx.shadowBlur = 0;

	let currentSegment = [];
	for (let i = 0; i < path.length; i++) {
		const point = path[i];
		if (!point) {
			continue;
		}

		const pos = mapToScreenBound(point.x, point.y);

		if (currentSegment.length === 0) {
			currentSegment.push(pos);
			continue;
		}

		if (point.isWarp || i === path.length - 1) {
			currentSegment.push(pos);

			ctx.strokeStyle = '#00e5ff';
			ctx.beginPath();
			ctx.moveTo(currentSegment[0].x, currentSegment[0].y);
			for (let j = 1; j < currentSegment.length; j++) {
				ctx.lineTo(currentSegment[j].x, currentSegment[j].y);
			}
			ctx.stroke();

			if (point.isWarp) {
				ctx.beginPath();
				ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
				ctx.fillStyle = 'yellow';
				ctx.fill();

				if (i + 1 < path.length) {
					const exitPos = mapToScreenBound(path[i + 1].x, path[i + 1].y);

					ctx.beginPath();
					ctx.arc(exitPos.x, exitPos.y, 3, 0, Math.PI * 2);
					ctx.fillStyle = 'yellow';
					ctx.fill();

					currentSegment = [exitPos];
					i++;
				} else {
					currentSegment = [pos];
				}
			} else {
				currentSegment = [pos];
			}
		} else {
			currentSegment.push(pos);
		}
	}

	ctx.restore();
}

/**
 * Draw the classic red destination dot on the Navigation minimap.
 */
function drawNavigationTargetPin(ctx, pos) {
	if (!pos) {
		return;
	}

	ctx.save();
	const icon = _navIcoDestination.complete && _navIcoDestination.width ? _navIcoDestination : (_navListTargetIcon.complete && _navListTargetIcon.width ? _navListTargetIcon : null);
	if (icon) {
		ctx.drawImage(icon, Math.round(pos.x - icon.width / 2), Math.round(pos.y - icon.height / 2));
	} else {
		ctx.fillStyle = 'red';
		ctx.beginPath();
		ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.restore();
}

/**
 * Render yellow official-style route arrows on the actual game floor for the active route.
 */
function getFootstepEffectID(markerIndex) {
	return _navigationFootstepEffectID + markerIndex;
}

function addWorldFootstep(marker) {
	if (!marker || !marker.removed) {
		return;
	}

	const effect = new NavigationFootstep(marker.position, marker.angle, marker.markerIndex, marker.alpha);
	EffectManager.add(effect, {
		Init: {
			ownerAID: _navigationFootstepOwnerAID,
			position: marker.position,
			startTick: Renderer.tick,
			duration: -1,
			persistent: true
		},
		Inst: {
			effectID: marker.effectID,
			duplicateID: 0,
			position: marker.position,
			startTick: Renderer.tick,
			duration: -1,
			endTick: -1,
			persistent: true,
			renderBeforeEntities: true
		}
	});

	marker.removed = false;
}

function removeWorldFootstep(marker) {
	if (!marker || marker.removed) {
		return;
	}

	EffectManager.remove(null, _navigationFootstepOwnerAID, marker.effectID);
	marker.removed = true;
}

/**
 * Spawn the yellow floor footsteps once for the current same-map route segment.
 * Official navigation does not rebuild the floor footsteps every frame. The
 * route is generated once, then passed markers are removed as the player walks.
 */
function spawnWorldFootsteps(currentMap) {
	clearWorldFootsteps();

	if (!currentMap || !_path || _path.length < 2) {
		return;
	}

	let footstepIndex = 0;
	const startIndex = Math.max(_navigationFootstepSpacing, 1);

	for (let i = startIndex; i < _path.length && footstepIndex < _navigationFootstepMax; i += _navigationFootstepSpacing) {
		const point = _path[i];
		if (!point || point.isWarp) {
			continue;
		}

		const previousPoint = _path[Math.max(0, i - 1)];
		const nextPoint = _path[Math.min(_path.length - 1, i + 1)];
		const x = Math.floor(Number(point.x));
		const y = Math.floor(Number(point.y));

		if (!Number.isFinite(x) || !Number.isFinite(y)) {
			continue;
		}

		const z = Altitude && typeof Altitude.getCellHeight === 'function' ? Altitude.getCellHeight(x, y) : 0;
		const marker = {
			pathIndex: i,
			effectID: getFootstepEffectID(footstepIndex),
			markerIndex: footstepIndex,
			position: new Float32Array([x, y, z]),
			angle: getFootstepAngle(previousPoint, point, nextPoint),
			alpha: 0.95,
			x: x,
			y: y,
			removed: true
		};

		_navigationFootstepMarkers.push(marker);
		addWorldFootstep(marker);

		footstepIndex++;
	}

	_navigationFootstepKey = getFootstepPathKey(currentMap, _path);
	_navigationFootstepMap = currentMap;
}

/**
 * Remove only footsteps that the player has already reached/passed. This keeps
 * the official behavior: no constant respawn/rebuild of the whole footstep list.
 */
function updatePassedWorldFootsteps(currentPos) {
	if (!_navigationFootstepMarkers || !_navigationFootstepMarkers.length || !currentPos) {
		return;
	}

	let progressPathIndex = Math.floor(Number(_navigationFootstepProgressIndex) || 0);

	for (let i = 0; i < _navigationFootstepMarkers.length; i++) {
		const marker = _navigationFootstepMarkers[i];
		if (!marker) {
			continue;
		}

		const distance = getCellDistance(currentPos.x, currentPos.y, marker.x, marker.y);
		if (distance <= _navigationFootstepNearDistance) {
			progressPathIndex = Math.max(progressPathIndex, marker.pathIndex);
		}
	}

	if (progressPathIndex > _navigationFootstepProgressIndex) {
		_navigationFootstepProgressIndex = progressPathIndex;
	}

	for (let i = 0; i < _navigationFootstepMarkers.length; i++) {
		const marker = _navigationFootstepMarkers[i];
		if (!marker) {
			continue;
		}

		if (marker.pathIndex <= _navigationFootstepProgressIndex) {
			removeWorldFootstep(marker);
		}
	}
}

/**
 * Render/update yellow official-style route arrows on the actual game floor.
 */
function updateWorldFootsteps() {
	const currentMap = getCurrentMap();
	const currentPos = getPlayerPosition();

	if (!currentMap || !_path || _path.length < 2 || !_targetData || normalizeMapName(_targetData.map) !== currentMap) {
		clearWorldFootsteps();
		return;
	}

	const progressResult = updateFootstepProgressFromPlayer(currentMap, currentPos);
	if (progressResult && progressResult.recalculate) {
		if (requestNavigationRecalculateFromPlayer(progressResult.reason)) {
			return;
		}
	}

	const routeKey = getFootstepPathKey(currentMap, _path);
	if (routeKey && (routeKey !== _navigationFootstepKey || _navigationFootstepMap !== currentMap)) {
		spawnWorldFootsteps(currentMap);
		return;
	}

	updatePassedWorldFootsteps(currentPos);
}

/**
 * Terminate the pathfinding worker
 */
function terminatePathFindingWorker() {
	if (_pathFindingWorker) {
		_pathFindingWorker.terminate();
		_pathFindingWorker = null;
	}
}

/**
 * Initialize the pathfinding worker
 */
function initializePathFindingWorker() {
	if (!_pathFindingWorker) {
		_pathFindingWorker = new Worker(new URL('./PathFindingWorker.js', import.meta.url).href);
		_pathFindingWorker.id = new Date().getTime().toString();
		_pathFindingWorker.onmessage = function (e) {
			const data = e.data;
			switch (data.type) {
				case 'pathResult':
					_pathUpdateLock = false;
					if (_finalTargetData && data.path && data.workerId === _pathFindingWorker.id) {
						const mapName = getCurrentMap();
						_currentSegmentRequestKey = _pendingSegmentRequestKey;
						_pendingSegmentRequestKey = '';
						resetFootstepProgress();
						_path = data.path;
						if (_path.length > 0) {
							this.updateTargetText();
							this.setTargetCoordinatesBlinking(false);
							this.setLocationTitle(mapName, _finalTargetData.map, _finalTargetData.displayName);
							updateWorldFootsteps();
						} else {
							clearWorldFootsteps();
							this.updateTargetText(true);
							this.setTargetCoordinatesBlinking(false);
							this.setLocationTitle(mapName, null);
						}
					}
					break;
			}
		}.bind(Navigation);
	}
}

function resetPathFindingWorker() {
	terminatePathFindingWorker();
	initializePathFindingWorker();
}

/**
 * Convert screen coordinates to map coordinates
 */
Navigation.screenToMapCoordinates = function screenToMapCoordinates(screenX, screenY) {
	const size = getNavigationMapCanvasSize();
	const width = size.width;
	const height = size.height;

	if (!_mapData || !_mapData.width || !_mapData.height) {
		return { x: 0, y: 0 };
	}

	const scaleX = width / _mapData.width;
	const scaleY = height / _mapData.height;
	const scale = Math.min(scaleX, scaleY);

	const scaledMapWidth = _mapData.width * scale;
	const scaledMapHeight = _mapData.height * scale;

	const offsetX = (width - scaledMapWidth) / 2;
	const offsetY = (height - scaledMapHeight) / 2;

	let mapX = ((screenX - offsetX) / scaledMapWidth) * _mapData.width;
	let mapY = _mapData.height - ((screenY - offsetY) / scaledMapHeight) * _mapData.height;

	mapX = Math.max(0, Math.min(_mapData.width, mapX));
	mapY = Math.max(0, Math.min(_mapData.height, mapY));

	return { x: Math.floor(mapX), y: Math.floor(mapY) };
};

/**
 * Initialize component
 */
Navigation.init = function init() {
	const root = Navigation.getRoot();

	_mapData = {
		walkableType: Altitude.TYPE.WALKABLE
	};

	this._host.style.top = `${Math.max(0, Math.min(Renderer.height - NAV_WINDOW_HEIGHT, 200))}px`;
	this._host.style.left = `${Math.max(0, Math.min(Renderer.width - NAV_WINDOW_WIDTH, 200))}px`;
	this._host.style.width = NAV_WINDOW_WIDTH + 'px';
	this._host.style.height = NAV_WINDOW_HEIGHT + 'px';
	this._host.style.overflow = 'visible';

	// Get canvas context
	const canvas = document.createElement('canvas');
	canvas.width = 280;
	canvas.height = 230;
	_ctx = canvas.getContext('2d');
	const mapDisplay = root.querySelector('.map-display');
	if (mapDisplay) {
		mapDisplay.appendChild(canvas);
	}

	// Load arrow image
	Client.loadFile(`${DB.INTERFACE_PATH}map/map_arrow.bmp`, dataURI => {
		_arrow.src = dataURI;
	});

	// Load town info icons
	Client.loadFile(`${DB.INTERFACE_PATH}information/store.bmp`, dataURI => {
		_toolDealer.src = dataURI;
	});
	Client.loadFile(`${DB.INTERFACE_PATH}information/weaponshop.bmp`, dataURI => {
		_weaponDealer.src = dataURI;
	});
	Client.loadFile(`${DB.INTERFACE_PATH}information/armorshops.bmp`, dataURI => {
		_armorDealer.src = dataURI;
	});
	Client.loadFile(`${DB.INTERFACE_PATH}information/smithy.bmp`, dataURI => {
		_blacksmith.src = dataURI;
	});
	Client.loadFile(`${DB.INTERFACE_PATH}information/guide.bmp`, dataURI => {
		_guide.src = dataURI;
	});
	Client.loadFile(`${DB.INTERFACE_PATH}information/inn.bmp`, dataURI => {
		_inn.src = dataURI;
	});
	Client.loadFile(`${DB.INTERFACE_PATH}information/kafra.bmp`, dataURI => {
		_kafra.src = dataURI;
	});

	applyOfficialNavigationIcons(root);

	// Bind events
	const closeBtn = root.querySelector('.close');
	if (closeBtn) {
		closeBtn.addEventListener('mousedown', e => e.stopImmediatePropagation());
		closeBtn.addEventListener('click', e => {
			e.stopPropagation();
			this.hide();
		});
	}

	const restoreBtn = root.querySelector('.restore');
	if (restoreBtn) {
		restoreBtn.addEventListener('mousedown', e => e.stopImmediatePropagation());
		restoreBtn.addEventListener('click', e => {
			e.stopPropagation();
			this.setMinimized(false);
		});
	}

	const minimizeToggle = root.querySelector('.minimize-toggle');
	if (minimizeToggle) {
		minimizeToggle.addEventListener('mousedown', e => e.stopImmediatePropagation());
		minimizeToggle.addEventListener('click', e => e.stopPropagation());
		minimizeToggle.addEventListener('change', e => {
			e.stopPropagation();
			this.setMinimized(minimizeToggle.checked);
		});
	}

	root.querySelector('.search-button').addEventListener('click', e => {
		e.stopPropagation();
		this.onSearch(true);
	});
	const airshipMoveButton = root.querySelector('.airship-move');
	if (airshipMoveButton) {
		airshipMoveButton.addEventListener('click', () => this.onAirshipMove());
	}

	_searchResults = [];
	_selectedSearchResult = null;
	this.setResultsViewVisible(false);
	const resultList = root.querySelector('.result-view .results-list');
	if (resultList) {
		resultList.innerHTML = '';
	}
	const detailPanel = root.querySelector('.result-detail-panel');
	if (detailPanel) {
		detailPanel.classList.remove('has-selection', 'map-selection', 'npc-selection');
	}

	const searchInput = root.querySelector('.search-input');
	searchInput.addEventListener('keypress', e => {
		if (e.which === KEYS.ENTER || e.key === 'Enter') {
			e.stopPropagation();
			this.onSearch(true);
		}
	});

	// Show the search dropdown while typing, like the official navigation UI.
	let searchInputTimer = null;
	searchInput.addEventListener('input', () => {
		if (searchInputTimer) {
			clearTimeout(searchInputTimer);
		}
		searchInputTimer = setTimeout(() => this.onSearch(false), 120);
	});

	const searchType = root.querySelector('.search-type');
	searchType.addEventListener('change', () => this.onSearch(false));

	const serviceToggles = root.querySelectorAll('.services-toggle');
	for (let i = 0; i < serviceToggles.length; i++) {
		serviceToggles[i].addEventListener('change', e => {
			syncServiceToggles(e.currentTarget);
			resetSegmentTracking();
			if (_finalTargetData) {
				const currentMap = getCurrentMap();
				const currentPos = getPlayerPosition();
				this.navigateTo({
					startMap: currentMap,
					startX: currentPos.x,
					startY: currentPos.y,
					endMap: _finalTargetData.airshipMap || _finalTargetData.map,
					endX: _finalTargetData.x,
					endY: _finalTargetData.y,
					displayName: _finalTargetData.displayName,
					isNpc: _finalTargetData.isNpc,
					force: true
				});
			}
		});
	}


	const findButton = root.querySelector('.find-action');
	if (findButton) {
		findButton.addEventListener('click', e => {
			e.stopPropagation();
			// Official navigation closes the search-result list after Find and
			// returns to the route/minimap view. Keep double-click and Find
			// behavior consistent.
			this.moveSelectedSearchResult(true);
		});
	}

	const shareButton = root.querySelector('.share-action');
	if (shareButton) {
		shareButton.addEventListener('click', e => {
			e.stopPropagation();
			this.shareSelectedSearchResult();
		});
	}

	const roadIconButton = root.querySelector('.footer-roadicon-button');
	const roadIconSelector = root.querySelector('.roadicon-selector');

	if (roadIconButton && roadIconSelector) {
		roadIconButton.addEventListener('click', e => {
			e.stopPropagation();
			roadIconSelector.classList.toggle('open');
		});

		roadIconSelector.addEventListener('mousedown', e => e.stopPropagation());
		roadIconSelector.addEventListener('click', e => e.stopPropagation());

		const roadIconChoices = root.querySelectorAll('.roadicon-choice');
		for (let i = 0; i < roadIconChoices.length; i++) {
			roadIconChoices[i].addEventListener('click', e => {
				e.stopPropagation();
				setSelectedRoadIcon(roadIconChoices[i].getAttribute('data-roadicon-index'));
				closeRoadIconSelector(root);
			});
		}

		updateRoadIconSelectorUI(root);
		setSelectedRoadIcon(_selectedRoadIconIndex);
	}

	// Focus handling for search input
	searchInput.addEventListener('focus', () => {
		const query = searchInput.value.trim();
		if (query.length >= 2) {
			this.onSearch(false);
			return;
		}

		const resultsContainer = root.querySelector('.search-results');
		if (resultsContainer && resultsContainer.children.length > 0) {
			resultsContainer.style.display = 'block';
		}
	});

	// Hide search results when clicking outside the search controls.
	// Navigation is rendered inside Shadow DOM, so e.target is retargeted to
	// the host element at document level. Use composedPath() to correctly
	// detect clicks on the input/button/results inside the shadow root.
	_documentClickHandler = e => {
		const path = e.composedPath ? e.composedPath() : [];
		const clickedSearchArea = path.some(node => {
			return (
				node &&
				node.classList &&
				(node.classList.contains('search-results') ||
					node.classList.contains('result-item') ||
					node.classList.contains('search-input') ||
					node.classList.contains('search-button') ||
					node.classList.contains('search-type') ||
					node.classList.contains('footer-roadicon-button') ||
					node.classList.contains('roadicon-selector') ||
					node.classList.contains('roadicon-choice'))
			);
		});

		if (clickedSearchArea) {
			return;
		}

		const resultsContainer = root.querySelector('.search-results');
		if (resultsContainer) {
			resultsContainer.style.display = 'none';
		}
		closeRoadIconSelector(root);
	};
	document.addEventListener('click', _documentClickHandler);

	// Map click event for navigation
	root.querySelector('.map-display').addEventListener('click', e => this.onMapClick(e));

	// Mouse move event for displaying coordinates
	root.querySelector('.map-display').addEventListener('mousemove', e => this.onMapMouseMove(e));

	// Mouse leave event to reset coordinates display
	root.querySelector('.map-display').addEventListener('mouseleave', () => this.onMapMouseLeave());

	this.draggable('.titlebar');

	// Hide the UI initially
	this.ui.hide();
};

/**
 * Once append to the DOM
 */
Navigation.onAppend = function onAppend() {
	// Clear path for clean render
	this.clearPath();
	applyMinimizedState();

	// Start rendering
	Renderer.render(this.renderCanvas.bind(this));

	// Initialize pathfinding worker
	initializePathFindingWorker();

	// Load the current map after initializing the worker
	const mapName = getCurrentMap();
	this.loadMap(mapName);
	this.updateAirshipButton();

	if (_finalTargetData) {
		const currentPos = getPlayerPosition();
		this.navigateTo({
			startMap: mapName,
			startX: currentPos.x,
			startY: currentPos.y,
			endMap: _finalTargetData.airshipMap || _finalTargetData.map,
			endX: _finalTargetData.x,
			endY: _finalTargetData.y,
			displayName: _finalTargetData.displayName,
			isNpc: _finalTargetData.isNpc
		});
	}
};

/**
 * Once removed from DOM
 */
Navigation.onRemove = function onRemove() {
	// MapRenderer removes every UI component while loading a new map, then
	// appends them again after the map is ready. Do not reset _finalTargetData
	// here, otherwise a valid NPC/MOB/MAP route is lost exactly when the
	// player enters the next map. Logout/character-select paths call
	// resetNavigationState() explicitly from MapEngine before removing the UI.
	_path = [];
	_targetData = null;
	_lastPathUpdate = 0;
	_pathUpdateLock = false;
	_loadingMapName = null;
	resetSegmentTracking();
	clearWorldFootsteps();
	stopAnimatedSpritePreview(this.getRoot && this.getRoot());
	terminatePathFindingWorker();

	if (_documentClickHandler) {
		document.removeEventListener('click', _documentClickHandler);
		_documentClickHandler = null;
	}
};

/**
 * Show or hide the official-style result/detail panel.
 */
Navigation.setResultsViewVisible = function setResultsViewVisible(visible) {
	const root = Navigation.getRoot && Navigation.getRoot();
	if (!root) {
		return;
	}

	const inner = root.querySelector('.Navigation');
	if (inner) {
		inner.classList.toggle('has-results', !!visible);
	}

	applyMinimizedState();
};

/**
 * Handle search button click / typing search.
 */
Navigation.onSearch = function onSearch(forceOpen) {
	const root = Navigation.getRoot();
	const query = root.querySelector('.search-input').value.trim();
	const type = root.querySelector('.search-type').value;

	if (query.length < 2) {
		_searchResults = [];
		_selectedSearchResult = null;
		clearWorldMapMonsterSearchMarkers();
		this.displaySearchResults([]);
		this.setResultsViewVisible(false);
		return;
	}

	const results = DB.searchNavigation(query, type);
	this.displaySearchResults(results);
};

/**
 * Display search results in the official two-panel style.
 */
Navigation.displaySearchResults = function displaySearchResults(results) {
	const root = Navigation.getRoot();
	const list = root.querySelector('.result-view .results-list');
	const count = root.querySelector('.result-count');
	const detailPanel = root.querySelector('.result-detail-panel');

	_searchResults = results || [];
	_selectedSearchResult = _searchResults.length ? _searchResults[0] : null;

	this.setResultsViewVisible(true);

	if (count) {
		count.textContent = 'Search result[' + _searchResults.length + ']';
	}

	const selectedLink = root.querySelector('.selected-result-link');
	if (selectedLink) {
		selectedLink.textContent = _selectedSearchResult ? '[' + (_selectedSearchResult.name || _selectedSearchResult.mapName || '') + ']' : '';
	}

	if (!list) {
		return;
	}
	list.innerHTML = '';

	if (!_searchResults.length) {
		const empty = document.createElement('li');
		empty.className = 'no-results';
		empty.textContent = 'No results found';
		list.appendChild(empty);
		clearWorldMapMonsterSearchMarkers();
		if (detailPanel) {
			detailPanel.classList.remove('has-selection', 'map-selection', 'npc-selection');
		}
		return;
	}

	for (let i = 0; i < _searchResults.length; i++) {
		const result = _searchResults[i];
		const resultItem = document.createElement('li');
		resultItem.className = 'result-item' + (i === 0 ? ' selected' : '');

		resultItem.appendChild(createOfficialTypeBadge(result));

		const resultAmount = getResultListAmount(result);
		if (resultAmount) {
			const amountSpan = document.createElement('span');
			amountSpan.className = 'result-amount';
			amountSpan.textContent = resultAmount;
			resultItem.appendChild(amountSpan);
		}

		const nameSpan = document.createElement('span');
		nameSpan.className = 'result-name';
		nameSpan.textContent = getResultListLabel(result);
		resultItem.appendChild(nameSpan);

		resultItem._resultData = result;
		resultItem.addEventListener('click', () => {
			this.selectSearchResult(result, resultItem);
		});
		resultItem.addEventListener('dblclick', () => {
			this.selectSearchResult(result, resultItem);
			this.moveSelectedSearchResult(true);
		});

		list.appendChild(resultItem);
	}

	this.renderSelectedResultDetail();
};

/**
 * Select one result from the official-style search list.
 */
Navigation.selectSearchResult = function selectSearchResult(result, item) {
	const root = Navigation.getRoot();
	_selectedSearchResult = result || null;

	const listItems = root.querySelectorAll('.result-view .result-item');
	for (let i = 0; i < listItems.length; i++) {
		listItems[i].classList.toggle('selected', listItems[i] === item);
	}

	this.renderSelectedResultDetail();
};

/**
 * Render the selected result detail panel: monster/NPC/map info + map list.
 */
Navigation.renderSelectedResultDetail = function renderSelectedResultDetail() {
	const root = Navigation.getRoot();
	const detailPanel = root.querySelector('.result-detail-panel');
	if (!detailPanel) {
		return;
	}

	const result = _selectedSearchResult;
	if (!result) {
		detailPanel.classList.remove('has-selection', 'map-selection', 'npc-selection');
		return;
	}

	if (result.spawns && result.spawns.length && !result._selectedSpawn) {
		result._selectedSpawn = result.spawns[0];
	}

	const target = getSelectedResultTarget(result);
	if (!target || !target.mapName) {
		detailPanel.classList.remove('has-selection', 'map-selection', 'npc-selection');
		return;
	}

	detailPanel.classList.add('has-selection');
	detailPanel.classList.toggle('map-selection', result.type === 'MAP');
	detailPanel.classList.toggle('npc-selection', result.type === 'NPC');

	const selectedLink = root.querySelector('.selected-result-link');
	if (selectedLink) {
		selectedLink.textContent = '[' + (result.name || target.mapName) + ']';
	}

	publishWorldMapSearchResult(result, _searchResults);

	const badge = root.querySelector('.detail-type-badge');
	if (badge) {
		badge.className = 'detail-type-badge';
		badge.innerHTML = '';
		badge.appendChild(createOfficialTypeBadge(result));
	}

	const name = root.querySelector('.detail-name');
	if (name) {
		if (result.type === 'NPC') {
			name.textContent = getNpcSpawnLabel(result, result._selectedSpawn || { mapName: target.mapName });
		} else if (result.type === 'MAP') {
			name.textContent = DB.getNaviMapDisplayName(target.mapName) || result.name || target.mapName;
		} else {
			name.textContent = result.name || target.mapName;
		}
	}

	const detailText = root.querySelector('.detail-text');
	if (detailText) {
		detailText.textContent = buildDetailText(result, target);
	}

	updateDetailSpritePreview(root, result);

	const previewImg = root.querySelector('.detail-map-preview-img');
	if (previewImg) {
		loadResultMapPreview(previewImg, target.mapName);
	}

	const mapList = root.querySelector('.detail-map-list');
	if (!mapList) {
		return;
	}
	mapList.innerHTML = '';

	if (result.type === 'MAP') {
		const monsters = Array.isArray(result.monsters) ? result.monsters : [];
		if (monsters.length && !result._selectedMapMonster) {
			result._selectedMapMonster = monsters[0];
		}

		for (let i = 0; i < monsters.length; i++) {
			const monster = monsters[i];
			const row = document.createElement('div');
			row.className = 'spawn-row map-monster-row';
			if (result._selectedMapMonster === monster) {
				row.classList.add('selected');
			}

			row.appendChild(createOfficialTypeBadgeForType('MOB'));

			const label = document.createElement('span');
			label.className = 'spawn-map-name';
			label.textContent = monster.name || '';
			row.appendChild(label);

			if (monster.rateLabel) {
				const rate = document.createElement('span');
				rate.className = 'spawn-rate';
				rate.textContent = ' (' + monster.rateLabel + ')';
				row.appendChild(rate);
			}

			row.title = (monster.name || '') + ' - ' + normalizeMapName(result.mapName || '') + ' ' + (monster.rateLabel || '');
			row.addEventListener('click', () => {
				result._selectedMapMonster = monster;
				this.renderSelectedResultDetail();
			});
			row.addEventListener('dblclick', () => {
				result._selectedMapMonster = monster;
				this.moveSelectedSearchResult(true);
			});

			mapList.appendChild(row);
		}
		return;
	}

	const spawns = result.spawns && result.spawns.length
		? result.spawns
		: [
			{
				mapName: result.mapName,
				x: result.x,
				y: result.y,
				rateLabel: result.type === 'MAP' ? DB.getNaviMapDisplayName(result.mapName) : ''
			}
		];

	for (let i = 0; i < spawns.length; i++) {
		const spawn = spawns[i];
		const row = document.createElement('div');
		row.className = 'spawn-row';
		if ((result._selectedSpawn && result._selectedSpawn === spawn) || (!result._selectedSpawn && i === 0)) {
			row.classList.add('selected');
		}

		row.appendChild(createOfficialTypeBadge(result));

		const label = document.createElement('span');
		label.className = 'spawn-map-name';
		label.textContent = result.type === 'NPC'
			? getNpcSpawnLabel(result, spawn)
			: normalizeMapName(spawn.mapName || result.mapName);
		row.appendChild(label);

		if (spawn.rateLabel && result.type !== 'NPC') {
			const rate = document.createElement('span');
			rate.className = 'spawn-rate';
			rate.textContent = ' (' + spawn.rateLabel + ')';
			row.appendChild(rate);
		}

		row.title = (DB.getNaviMapDisplayName(spawn.mapName) || spawn.mapName) + ' ' + Math.floor(Number(spawn.x) || 0) + ',' + Math.floor(Number(spawn.y) || 0);
		row.addEventListener('click', () => {
			result._selectedSpawn = spawn;
			this.renderSelectedResultDetail();
		});
		row.addEventListener('dblclick', () => {
			result._selectedSpawn = spawn;
			this.moveSelectedSearchResult(true);
		});

		mapList.appendChild(row);
	}
};

/**
 * Start navigation to the currently selected search result.
 */
Navigation.moveSelectedSearchResult = function moveSelectedSearchResult(closeResults) {
	const result = _selectedSearchResult;
	if (!result) {
		return;
	}

	this.navigateToSearchResult(result, closeResults);
};

/**
 * Copy/share the selected result as a navigation coordinate text.
 */
Navigation.shareSelectedSearchResult = function shareSelectedSearchResult() {
	const result = _selectedSearchResult;
	const target = getSelectedResultTarget(result);
	if (!target) {
		return;
	}

	const text = '/navi ' + target.mapName + ' ' + Math.floor(Number(target.x) || 0) + ' ' + Math.floor(Number(target.y) || 0);
	if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard.writeText(text).catch(() => {});
	}
};

/**
 * Navigate to a search result.
 */
Navigation.navigateToSearchResult = function navigateToSearchResult(result, closeResults) {
	const target = getSelectedResultTarget(result);
	if (!result || !target || !target.mapName) {
		return;
	}

	this.targetResult = result;
	_isMapClickTarget = false;

	const currentMap = getCurrentMap();
	const currentPos = getPlayerPosition();

	const selectedMapMonster = getSelectedMapMonster(result);
	const displayName = result.type === 'MAP' && selectedMapMonster
		? (selectedMapMonster.name || target.displayName)
		: target.displayName;

	this.navigateTo({
		startMap: currentMap,
		startX: currentPos.x,
		startY: currentPos.y,
		endMap: target.mapName,
		endX: target.x,
		endY: target.y,
		displayName: displayName,
		isNpc: result.type === 'NPC',
		force: true
	});

	if (closeResults !== false) {
		this.setResultsViewVisible(false);
	}
};

/**
 * Navigate directly to a map destination.
 * This is used by the large World Map. A world-map section has a map id,
 * but it is not an NPC/MOB result, so it should not depend on text search.
 */
Navigation.navigateToMap = function navigateToMap(mapName, displayName) {
	mapName = normalizeMapName(mapName);
	if (!mapName) {
		return;
	}

	const point = DB.getNaviMapPoint(mapName) || { x: 0, y: 0 };
	const currentMap = getCurrentMap();
	const currentPos = getPlayerPosition();

	this.targetResult = {
		type: 'MAP',
		id: mapName,
		name: displayName || DB.getNaviMapDisplayName(mapName) || mapName,
		mapName: mapName,
		x: point.x,
		y: point.y
	};

	_isMapClickTarget = false;

	this.navigateTo({
		startMap: currentMap,
		startX: currentPos.x,
		startY: currentPos.y,
		endMap: mapName,
		endX: point.x,
		endY: point.y,
		displayName: this.targetResult.name,
		force: true,
	});

	this.setResultsViewVisible(false);
};

/**
 * Find the closest walkable cell to the given coordinates
 */
Navigation.findClosestWalkableCell = function findClosestWalkableCell(x, y, maxRadius) {
	if (x >= 0 && x < _mapData.width && y >= 0 && y < _mapData.height) {
		const index = x + y * _mapData.width;
		const cellType = _mapData.cellTypes[index];

		if (cellType & _mapData.walkableType) {
			return { x: x, y: y };
		}
	}

	maxRadius = maxRadius || 10;
	let radius = 1;
	let bestDistance = Infinity;
	let bestCell = null;

	while (radius <= maxRadius) {
		for (let offsetY = -radius; offsetY <= radius; offsetY++) {
			for (let offsetX = -radius; offsetX <= radius; offsetX++) {
				if (Math.abs(offsetX) !== radius && Math.abs(offsetY) !== radius) {
					continue;
				}

				const cx = x + offsetX;
				const cy = y + offsetY;

				if (cx >= 0 && cx < _mapData.width && cy >= 0 && cy < _mapData.height) {
					const index = cx + cy * _mapData.width;
					const cellType = _mapData.cellTypes[index];

					if (cellType & _mapData.walkableType) {
						const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
						if (distance < bestDistance) {
							bestDistance = distance;
							bestCell = { x: cx, y: cy };
						}
					}
				}
			}
		}

		if (bestCell) {
			return bestCell;
		}

		radius++;
	}

	return null;
};

/**
 * Handle map click event
 */
Navigation.onMapClick = function onMapClick(event) {
	const root = Navigation.getRoot();
	const mapDisplay = root.querySelector('.map-display');
	const rect = mapDisplay.getBoundingClientRect();
	const x = Math.floor(event.clientX - rect.left);
	const y = Math.floor(event.clientY - rect.top);

	const mapCoords = this.screenToMapCoordinates(x, y);

	const currentMap = getCurrentMap();
	const currentPos = getPlayerPosition();

	_isMapClickTarget = true;

	this.navigateTo({
		startMap: currentMap,
		startX: currentPos.x,
		startY: currentPos.y,
		endMap: currentMap,
		endX: mapCoords.x,
		endY: mapCoords.y,
		displayName: 'Map Click',
		airshipMap: MapRenderer.currentMap,
		force: true,
	});
};

/**
 * Load a map for display
 */
Navigation.loadMap = function loadMap(mapName, displayName) {
	mapName = normalizeMapName(mapName);
	if (!mapName) {
		return;
	}

	if (_loadingMapName === mapName && (!_mapData || _mapData.map !== mapName)) {
		return;
	}

	_loadingMapName = mapName;

	if (_isMapClickTarget && _mapData && _mapData.map && _mapData.map !== mapName) {
		this.clear();
		_isMapClickTarget = false;
	}

	const mapBaseName = mapName.replace(/\..*/, '');

	// Load town info
	_towninfo = DB.getTownInfo(mapBaseName) || [];

	// Get the correct map path using DB.mapalias
	let bmpPath = DB.INTERFACE_PATH.replace('data/texture/', '') + 'map/' + mapBaseName + '.bmp';
	bmpPath = bmpPath.replace(/\//g, '\\');
	bmpPath = DB.mapalias[bmpPath] || bmpPath;

	// Load the map image
	Client.loadFile('data/texture/' + bmpPath, dataURI => {
		if (dataURI) {
			_map.src = dataURI;
		} else {
			_map.src = TRANSPARENT_PIXEL;
		}
	});

	// Get the correct map path using DB.mapalias
	let gatPath = mapBaseName + '.gat';
	gatPath = gatPath.replace(/\//g, '\\');
	gatPath = DB.mapalias[gatPath] || gatPath;

	// Load the GAT file for pathfinding
	Client.loadFile('data/' + gatPath, gatData => {
		if (gatData && gatData.cells && gatData.width && gatData.height) {
			_mapData.width = gatData.width;
			_mapData.height = gatData.height;
			_mapData.cells = gatData.cells;

			const cellCount = gatData.width * gatData.height;
			const cellTypes = new Uint8Array(cellCount);

			for (let i = 0; i < cellCount; i++) {
				const cellIndex = i * 5 + 4;
				cellTypes[i] = gatData.cells[cellIndex];
			}

			_mapData.cellTypes = cellTypes;
			_mapData.map = mapBaseName;
		}

		if (_loadingMapName === mapBaseName) {
			_loadingMapName = null;
		}
	});

	this.setMapNameText(mapName);
};

/**
 * Fully reset navigation state and visuals.
 *
 * This must be used when leaving the map server (logout / character select),
 * otherwise the previous target, floor arrows, and world-map route overlay can
 * survive into the next screen because they live outside the normal minimap
 * canvas state.
 */
Navigation.resetNavigationState = function resetNavigationState(options) {
	options = options || {};

	_path = [];
	_markers.length = 0;
	_lastPathUpdate = 0;
	_pathUpdateLock = false;
	_targetData = null;
	_finalTargetData = null;
	_isMapClickTarget = false;
	_loadingMapName = null;
	resetSegmentTracking();
	this.targetResult = null;

	this.setTargetCoordinatesBlinking(false);
	clearWorldFootsteps();

	// Force a route-clear event even if the previous state was already tagged
	// as inactive locally. This removes stale blue overlays from an open WorldMap
	// and clears the cached global route used when WorldMap is opened later.
	_lastPublishedNavigationRouteKey = '';
	publishNavigationRoute(false);

	if (options.terminateWorker) {
		terminatePathFindingWorker();
	}

	if (options.resetMapData) {
		_mapData = {
			walkableType: Altitude.TYPE.WALKABLE
		};
		_map.src = TRANSPARENT_PIXEL;
	}

	const root = Navigation.getRoot && Navigation.getRoot();
	if (!root) {
		return;
	}

	const targetInfo = root.querySelector('.target-info');
	if (targetInfo) {
		targetInfo.style.display = 'none';
	}

	const mouseInfo = root.querySelector('.mouse-info');
	if (mouseInfo) {
		mouseInfo.style.display = 'none';
	}

	const targetCoords = root.querySelector('.target-coordinates');
	if (targetCoords) {
		targetCoords.textContent = '';
	}

	const mouseCoords = root.querySelector('.mouse-coordinates');
	if (mouseCoords) {
		mouseCoords.textContent = '';
	}

	const resultsContainer = root.querySelector('.search-results');
	if (resultsContainer) {
		resultsContainer.innerHTML = '';
		resultsContainer.style.display = 'none';
	}

	_searchResults = [];
	_selectedSearchResult = null;
	this.setResultsViewVisible(false);
	const resultList = root.querySelector('.result-view .results-list');
	if (resultList) {
		resultList.innerHTML = '';
	}
	const detailPanel = root.querySelector('.result-detail-panel');
	if (detailPanel) {
		detailPanel.classList.remove('has-selection', 'map-selection', 'npc-selection');
	}

	const searchInput = root.querySelector('.search-input');
	if (searchInput && options.keepSearch !== true) {
		searchInput.value = '';
	}

	if (options.clearTitles) {
		const locationTitle = root.querySelector('.location-title');
		if (locationTitle) {
			locationTitle.textContent = '';
		}

		const mapNameEl = root.querySelector('.map-name');
		if (mapNameEl) {
			mapNameEl.textContent = '';
		}
	} else {
		const currentMap = getCurrentMap();
		if (currentMap) {
			this.setLocationTitle(currentMap, null);
			this.setMapNameText(currentMap);
		}
	}
};

/**
 * Clear the current route target while keeping the window usable.
 */
Navigation.clear = function clear() {
	this.resetNavigationState();
	this.updateAirshipButton();
};

/**
 * Enable the Private Airship Move button while there is a target
 */
Navigation.updateAirshipButton = function updateAirshipButton() {
	const root = Navigation.getRoot && Navigation.getRoot();
	const bar = root && root.querySelector('.airship-bar');
	const button = root && root.querySelector('.airship-move');
	if (!bar || !button) {
		return;
	}
	const supported = PACKETVER.value >= PRIVATE_AIRSHIP_PACKETVER;
	bar.style.display = supported ? '' : 'none';
	button.disabled = !supported || !_finalTargetData;
};

/**
 * Move button: fly to the target's map with the Private Airship
 */
Navigation.onAirshipMove = function onAirshipMove() {
	if (!_finalTargetData || PACKETVER.value < PRIVATE_AIRSHIP_PACKETVER) {
		return;
	}

	PrivateAirship.open({
		targetMap: _finalTargetData.airshipMap || _finalTargetData.map,
		toNpc: !!_finalTargetData.isNpc
	});
};

Navigation.clearPath = function clearPath() {
	_path = [];
	_lastPathUpdate = 0;
	_pathUpdateLock = false;
	resetSegmentTracking();
	clearWorldFootsteps();
};

/**
 * Add a marker to the map
 */
Navigation.addMarker = function addMarker(x, y, color, label) {
	_markers.push({
		x: x,
		y: y,
		color: color || 'rgb(255,0,0)',
		label: label || ''
	});
};

/**
 * Render the map and markers
 */
Navigation.renderCanvas = function renderCanvas(tick) {
	const hostDisplay = this._host ? getComputedStyle(this._host).display : 'none';
	if (hostDisplay === 'none') {
		return;
	}

	const ctx = _ctx;

	if (!ctx) {
		return;
	}

	const canvasSize = resizeNavigationMapCanvas(ctx);
	const width = canvasSize.width;
	const height = canvasSize.height;

	// Check if player position has changed
	const currentMap = getCurrentMap();
	const currentPos = getPlayerPosition();
	updateMinimizedStatus(currentMap, currentPos);

	if (currentMap && (!_mapData || _mapData.map !== currentMap)) {
		this.loadMap(currentMap);
	}

	if (
		_finalTargetData &&
		currentMap === _finalTargetData.map &&
		Math.abs(currentPos.x - _finalTargetData.x) <= 1 &&
		Math.abs(currentPos.y - _finalTargetData.y) <= 1
	) {
		this.clear();
	}

	if (_path && _path.length > 1) {
		updateWorldFootsteps();
	}

	if (_finalTargetData && !_pathUpdateLock) {
		this.ensureNavigationSegment(currentMap, currentPos);
	}

	// Clear canvas
	ctx.clearRect(0, 0, width, height);

	// Draw map background
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, width, height);

	if (!_mapData || !_mapData.width || !_mapData.height) {
		return;
	}

	// Draw the map image if loaded
	if (_map.complete && _map.width) {
		const scaleX = width / _mapData.width;
		const scaleY = height / _mapData.height;
		const scale = Math.min(scaleX, scaleY);

		ctx.save();
		ctx.translate(width / 2, height / 2);
		ctx.scale(scale, scale);
		ctx.translate(-_mapData.width / 2, -_mapData.height / 2);
		ctx.drawImage(_map, 0, 0, _mapData.width, _mapData.height);
		ctx.restore();
	}

	const mapToScreenBound = (x, y) => {
		return mapToScreen(x, y, width, height);
	};

	// Draw town info icons
	if (_towninfo && _towninfo.length) {
		for (let i = 0; i < _towninfo.length; i++) {
			const info = _towninfo[i];
			const pos = mapToScreenBound(info.X, info.Y);

			let img;
			switch (info.Type) {
				case 0:
					img = _toolDealer;
					break;
				case 1:
					img = _weaponDealer;
					break;
				case 2:
					img = _armorDealer;
					break;
				case 3:
					img = _blacksmith;
					break;
				case 4:
					img = _guide;
					break;
				case 5:
					img = _inn;
					break;
				case 6:
					img = _kafra;
					break;
				default:
					continue;
			}

			if (img.complete && img.width) {
				ctx.drawImage(img, pos.x - img.width / 2, pos.y - img.height / 2);
			}
		}
	}

	// Draw the classic solid cyan route on the minimap. The visual path starts
	// from the current player cell, but the real calculated route remains stable.
	drawMiniMapRoute(ctx, getVisualNavigationPath(currentMap, currentPos), mapToScreenBound);

	// Draw classic red end marker (target position)
	if (_targetData) {
		const lastPoint = mapToScreenBound(_targetData.x, _targetData.y);
		drawNavigationTargetPin(ctx, lastPoint);
	}

	// Draw current-location marker using the official navigation icon.
	const startPos = mapToScreenBound(currentPos.x, currentPos.y);
	const startIcon = _navIcoLocation.complete && _navIcoLocation.width ? _navIcoLocation : (_navListStartIcon.complete && _navListStartIcon.width ? _navListStartIcon : (_arrow.complete && _arrow.width ? _arrow : null));
	if (startIcon) {
		ctx.save();
		if (startIcon === _arrow) {
			ctx.translate(startPos.x, startPos.y);
			ctx.rotate(((Session.Entity.direction + 4) * 45 * Math.PI) / 180);
			ctx.drawImage(startIcon, -startIcon.width / 2, -startIcon.height / 2);
		} else {
			ctx.drawImage(startIcon, Math.round(startPos.x - startIcon.width / 2), Math.round(startPos.y - startIcon.height / 2));
		}
		ctx.restore();
	}

	drawNavigationMapOverlays(ctx, width, height, currentMap, currentPos);

	// Draw custom markers
	for (let i = 0; i < _markers.length; i++) {
		const marker = _markers[i];
		const pos = mapToScreenBound(marker.x, marker.y);

		ctx.fillStyle = marker.color;
		ctx.beginPath();
		ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
		ctx.fill();

		if (marker.label) {
			ctx.fillStyle = '#fff';
			ctx.font = '10px Arial';
			ctx.fillText(marker.label, pos.x + 5, pos.y + 3);
		}
	}
};

/**
 * Update the target coordinates text
 */
Navigation.updateTargetText = function updateTargetText(noPathFound) {
	const root = Navigation.getRoot();
	const targetInfo = root.querySelector('.target-info');
	if (targetInfo) {
		targetInfo.style.display = 'flex';
	}

	if (_finalTargetData) {
		this.setTargetCoordinatesText(_finalTargetData.x, _finalTargetData.y, {
			noPathFound: noPathFound,
			targetMap: _finalTargetData.map
		});
	}
};

/**
 * Set target coordinates text with proper formatting
 */
Navigation.setTargetCoordinatesText = function setTargetCoordinatesText(x, y, options) {
	const root = Navigation.getRoot();
	if (!root) {
		return;
	}

	const text = formatTargetCoordinates(x, y, options);
	const targetCoords = root.querySelector('.target-coordinates');
	if (targetCoords) {
		targetCoords.textContent = text;
		targetCoords.style.display = '';
	}
	const targetInfo = root.querySelector('.target-info');
	if (targetInfo) {
		targetInfo.style.display = 'flex';
	}
};

Navigation.setTargetCoordinatesBlinking = function setTargetCoordinatesBlinking(blinking) {
	const root = Navigation.getRoot();
	if (!root) {
		return;
	}

	const targetCoordinates = root.querySelector('.target-coordinates');
	if (!targetCoordinates) {
		return;
	}

	if (blinking) {
		if (!_blinking) {
			_blinking = true;
			_originalColor = getComputedStyle(targetCoordinates).color || '#ffffff';

			let fadeStep = 0;
			let fadeDirection = -1;
			_fadeInterval = setInterval(() => {
				fadeStep += fadeDirection * 0.1;

				if (fadeStep <= 0.3) {
					fadeDirection = 1;
				} else if (fadeStep >= 1) {
					fadeDirection = -1;
				}

				targetCoordinates.style.opacity = fadeStep;
			}, 50);
		}
	} else {
		if (_blinking) {
			clearInterval(_fadeInterval);
			_fadeInterval = null;
			targetCoordinates.style.opacity = '1';
			targetCoordinates.style.color = _originalColor;
			_blinking = false;
		}
	}
};

/**
 * Set location title with proper formatting
 */
Navigation.setLocationTitle = function setLocationTitle(currentMap, targetMap, displayName) {
	const root = Navigation.getRoot();
	if (!root) {
		return;
	}

	const title = formatLocationTitle(currentMap, targetMap, displayName);
	const locationTitle = root.querySelector('.location-title');
	if (locationTitle) {
		locationTitle.textContent = title;
	}
};

/**
 * Set coordinates text with proper formatting
 */
Navigation.setCoordinatesText = function setCoordinatesText(x, y, options) {
	const root = Navigation.getRoot();
	if (!root) {
		return;
	}

	const text = formatCoordinates(x, y, options);
	const coords = root.querySelector('.coordinates');
	if (coords) {
		coords.textContent = text;
	}
};

/**
 * Set map name text with proper formatting
 */
Navigation.setMapNameText = function setMapNameText(mapName) {
	const root = Navigation.getRoot();
	if (!root) {
		return;
	}

	const mapNameEl = root.querySelector('.map-name');
	if (mapNameEl) {
		mapNameEl.textContent = normalizeMapName(mapName);
	}
};

/**
 * Set mouse coordinates text with proper formatting
 */
Navigation.setMouseCoordinatesText = function setMouseCoordinatesText(x, y, options) {
	const root = Navigation.getRoot();
	if (!root) {
		return;
	}

	const text = formatCoordinates(x, y, options);
	const mouseCoords = root.querySelector('.mouse-coordinates');
	if (mouseCoords) {
		mouseCoords.textContent = text;
	}
};

/**
 * Find a path between two points using a web worker
 */
Navigation.findPath = function findPath(startX, startY, endX, endY) {
	if (_pathFindingWorker && !_pathUpdateLock) {
		_pathUpdateLock = true;

		_pathFindingWorker.postMessage({
			type: 'findPath',
			startX: startX,
			startY: startY,
			endX: endX,
			endY: endY,
			mapData: _mapData,
			workerId: _pathFindingWorker.id,
			existingPath: null
		});
	}
};

/**
 * Toggle minimized mode. Minimize keeps the active route and floor footsteps.
 */
Navigation.toggleMinimize = function toggleMinimize() {
	this.setMinimized(!_isMinimized);
};

/**
 * Set minimized state without clearing navigation.
 */
Navigation.setMinimized = function setMinimized(minimized) {
	_isMinimized = !!minimized;
	applyMinimizedState();
};

/**
 * Toggle the navigation window (show/hide)
 */
Navigation.toggle = function toggle() {
	const hostDisplay = this._host ? getComputedStyle(this._host).display : 'none';
	if (hostDisplay !== 'none') {
		this.hide();
	} else {
		this.show();
	}
};

/**
 * Show the navigation window
 */
Navigation.show = function show() {
	const root = Navigation.getRoot();

	this.setMinimized(false);
	this.clearPath();
	initializePathFindingWorker();

	// Hide coordinate displays initially
	const mouseInfo = root.querySelector('.mouse-info');
	if (mouseInfo) {
		mouseInfo.style.display = 'none';
	}
	const targetInfo = root.querySelector('.target-info');
	if (targetInfo) {
		targetInfo.style.display = 'none';
	}

	const mapName = getCurrentMap();
	const currentPos = getPlayerPosition();

	if (mapName && (!_mapData || _mapData.map !== mapName)) {
		this.loadMap(mapName);
	}

	if (_finalTargetData) {
		this.navigateTo({
			startMap: mapName,
			startX: currentPos.x,
			startY: currentPos.y,
			endMap: _finalTargetData.airshipMap || _finalTargetData.map,
			endX: _finalTargetData.x,
			endY: _finalTargetData.y,
			displayName: _finalTargetData.displayName,
			isNpc: _finalTargetData.isNpc
		});
	}

	this.setMapNameText(mapName);

	const locationTitle = root.querySelector('.location-title');
	if (locationTitle && !locationTitle.textContent) {
		this.setLocationTitle(mapName, null);
	}

	this.ui.show();
};

/**
 * Hide the navigation window
 */
Navigation.hide = function hide() {
	// Closing the Navigation window should cancel the active guide, just like the
	// official client. Use the minimize button when the route should stay alive.
	this.setMinimized(false);
	stopAnimatedSpritePreview(this.getRoot && this.getRoot());
	this.resetNavigationState({ terminateWorker: true });
	this.ui.hide();
};

Navigation.onKeyDown = function onKeyDown(event) {
	const hostDisplay = this._host ? getComputedStyle(this._host).display : 'none';
	if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && hostDisplay !== 'none') {
		this.hide();
	}
};

/**
 * Handle mouse movement over the map to display coordinates
 */
Navigation.onMapMouseMove = function onMapMouseMove(event) {
	const root = Navigation.getRoot();
	const mapDisplay = root.querySelector('.map-display');
	const rect = mapDisplay.getBoundingClientRect();
	const x = Math.floor(event.clientX - rect.left);
	const y = Math.floor(event.clientY - rect.top);

	const mapCoords = this.screenToMapCoordinates(x, y);
	const mapX = Math.floor(mapCoords.x);
	const mapY = Math.floor(mapCoords.y);

	const mouseInfo = root.querySelector('.mouse-info');
	if (mouseInfo) {
		mouseInfo.style.display = 'flex';
	}
	this.setMouseCoordinatesText(mapX, mapY);
};

/**
 * Handle mouse leaving the map area
 */
Navigation.onMapMouseLeave = function onMapMouseLeave() {
	const root = Navigation.getRoot();
	const mouseInfo = root.querySelector('.mouse-info');
	if (mouseInfo) {
		mouseInfo.style.display = 'none';
	}
};

/**
 * Set the content of the navigation window based on NAVI info
 */
Navigation.setNaviInfo = function setNaviInfo(naviInfo, displayName) {
	const parts = naviInfo.split(',');
	if (parts.length < 3) {
		return;
	}

	const mapName = parts[0];
	const x = parseInt(parts[1], 10);
	const y = parseInt(parts[2], 10);

	// Clear the search input
	const root = Navigation.getRoot();
	const searchInput = root.querySelector('.search-input');
	if (searchInput) {
		searchInput.value = '';
	}
	_isMapClickTarget = false;

	const currentMap = getCurrentMap();
	const currentPos = getPlayerPosition();

	this.navigateTo({
		startMap: currentMap,
		startX: currentPos.x,
		startY: currentPos.y,
		endMap: mapName,
		endX: x,
		endY: y,
		displayName: displayName,
		force: true
	});
};

/**
 * Wait for map data to be loaded
 */
Navigation.waitForMapData = function waitForMapData(callback) {
	const currentMap = getCurrentMap();
	if (!_mapData || _mapData.map !== currentMap) {
		if (currentMap && _loadingMapName !== currentMap) {
			this.loadMap(currentMap);
		}

		setTimeout(() => {
			Navigation.waitForMapData(callback);
		}, 100);
	} else {
		callback.bind(this)();
	}
};

/**
 * Recalculate the current-map segment only when the active segment changes.
 * This is what lets navigation continue after a map change without constantly
 * rebuilding the path while the player is walking on the same map.
 */
Navigation.ensureNavigationSegment = function ensureNavigationSegment(currentMap, currentPos) {
	if (!_finalTargetData || !currentMap || !currentPos) {
		return;
	}

	const requestKey = getSegmentRequestKey(currentMap, _finalTargetData);
	if (!requestKey || requestKey === _currentSegmentRequestKey || requestKey === _pendingSegmentRequestKey) {
		return;
	}

	this.navigateTo({
		startMap: currentMap,
		startX: currentPos.x,
		startY: currentPos.y,
		endMap: _finalTargetData.airshipMap || _finalTargetData.map,
		endX: _finalTargetData.x,
		endY: _finalTargetData.y,
		displayName: _finalTargetData.displayName,
		isNpc: _finalTargetData.isNpc,
		force: true,
		resumeSegment: true
	});
};

/**
 * Unified navigation function that handles both same-map and cross-map navigation
 */
Navigation.navigateTo = function navigateTo(options) {
	const startMap = normalizeMapName(options.startMap);
	const endMap = normalizeMapName(options.endMap);
	const displayName = options.displayName;
	const endX = Math.floor(Number(options.endX) || 0);
	const endY = Math.floor(Number(options.endY) || 0);
	// The airship flies to the map's real name (izlude_a, not izlude). Path
	// refreshes pass the stored real name and NPC flag back in; a map click
	// passes the loaded map's own name.
	const airshipMap = String(options.airshipMap || options.endMap || '')
		.replace(/\.gat$/, '')
		.toLowerCase();
	const nextFinalTarget = {
		map: endMap,
		x: endX,
		y: endY,
		displayName: displayName,
		airshipMap: airshipMap,
		isNpc: !!options.isNpc
	};
	const finalTargetChanged =
		!_finalTargetData ||
		_finalTargetData.map !== nextFinalTarget.map ||
		_finalTargetData.airshipMap !== nextFinalTarget.airshipMap ||
		!!_finalTargetData.isNpc !== nextFinalTarget.isNpc ||
		Math.floor(Number(_finalTargetData.x) || 0) !== nextFinalTarget.x ||
		Math.floor(Number(_finalTargetData.y) || 0) !== nextFinalTarget.y;
	const requestKey = getSegmentRequestKey(startMap, nextFinalTarget);

	if (!options.force && !finalTargetChanged) {
		if (requestKey && (requestKey === _currentSegmentRequestKey || requestKey === _pendingSegmentRequestKey)) {
			return;
		}
	}

	if (finalTargetChanged || options.force) {
		this.clearPath();
		resetPathFindingWorker();
		this.setTargetCoordinatesText(endX, endY, {
			targetMap: endMap
		});

		if (options.silentRecalculate) {
			this.setTargetCoordinatesBlinking(false);
		} else {
			this.setTargetCoordinatesBlinking(true);
		}
	}

	// Navigation intentionally only displays route markers. Official Ragnarok
	// navigation does not auto-send walk packets when selecting NPC/MOB/map
	// results, so the player must still walk manually.

	_finalTargetData = nextFinalTarget;
	this.updateAirshipButton();
	updateMinimizedStatus(startMap, { x: options.startX, y: options.startY });

	// Get warp types based on Services checkbox.
	// Keep unchecked navigation to normal walking portals only. The official
	// client does not use service/teleport links unless Services is enabled.
	const warpTypes = getAllowedWarpTypes();

	const path = MapPathFinder.findPathBetweenMaps(
		startMap,
		options.startX,
		options.startY,
		endMap,
		endX,
		endY,
		warpTypes
	);

	if (path && path.length > 0) {
		_pendingSegmentRequestKey = requestKey;
		publishNavigationRoute(true, path, startMap, endMap, displayName);
		const target = path[0];

		this.waitForMapData(function () {
			const walkableCell = this.findClosestWalkableCell(target.x, target.y);

			if (walkableCell) {
				_targetData = {
					x: walkableCell.x,
					y: walkableCell.y,
					map: target.map,
					displayName: displayName
				};
				this.findPath(options.startX, options.startY, _targetData.x, _targetData.y);
			} else {
				this.clear();
			}
		});
	} else {
		_currentSegmentRequestKey = requestKey;
		_pendingSegmentRequestKey = '';
		publishNavigationRoute(false);
		clearWorldFootsteps();
		this.updateTargetText(true);
		this.setTargetCoordinatesBlinking(false);
	}
};

Navigation.renderNpcSprite = function renderNpcSprite(canvas, npcClassId = 117) {
	if (!canvas || !canvas.parentElement) return null;
	const root = canvas.parentElement;
	root._navMonsterPreviewCancelled = false;
	canvas.classList.add('detail-sprite-canvas');
	canvas.dataset.authenticNpcSprite = '4_f_kafra1';

	const cacheKey = 'NPC:' + npcClassId;
	if (_monsterPreviewRuntimeCache[cacheKey]) {
		startAnimatedMonsterPreview(root, _monsterPreviewRuntimeCache[cacheKey]);
		return () => {
			root._navMonsterPreviewCancelled = true;
			stopAnimatedSpritePreview(root);
		};
	}

	let basePath = '';
	try {
		basePath = DB.getBodyPath(npcClassId, 0) || '';
	} catch (_e) {
		return null;
	}
	if (!basePath) return null;

	const sprPath = basePath.replace(/\.act$/i, '') + (/\.spr$/i.test(basePath) ? '' : '.spr');
	const actPath = basePath.replace(/\.spr$/i, '') + (/\.act$/i.test(basePath) ? '' : '.act');
	Client.loadFile(
		sprPath,
		sprData => {
			if (root._navMonsterPreviewCancelled || !sprData || !sprData.frames) {
				clearSpritePreview(canvas);
				return;
			}
			Client.loadFile(
				actPath,
				actData => {
					if (root._navMonsterPreviewCancelled || !actData || !actData.actions) {
						clearSpritePreview(canvas);
						return;
					}
					loadPreviewShadowBuffers((shadowSprData, shadowActData) => {
						if (root._navMonsterPreviewCancelled) return;
						try {
							const runtime = buildMonsterPreviewRuntime(sprData, actData, shadowSprData, shadowActData);
							_monsterPreviewRuntimeCache[cacheKey] = runtime;
							startAnimatedMonsterPreview(root, runtime);
						} catch (_e) {
							clearSpritePreview(canvas);
						}
					});
				},
				() => clearSpritePreview(canvas)
			);
		},
		() => clearSpritePreview(canvas),
		{ to_rgba: true }
	);

	return () => {
		root._navMonsterPreviewCancelled = true;
		stopAnimatedSpritePreview(root);
	};
};

/**
 * Create component and export it
 */
export default UIManager.addComponent(Navigation);
