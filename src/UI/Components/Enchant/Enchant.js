/**
 * UI/Components/Enchant/Enchant.js
 *
 * Enchant UI Window
 */

import jQuery from 'Utils/jquery.js';
import DB from 'DB/DBManager.js';
import Client from 'Core/Client.js';
import EffectDB from 'DB/Effects/EffectTable.js';
import EffectConst from 'DB/Effects/EffectConst.js';
import Camera from 'Renderer/Camera.js';
import Renderer from 'Renderer/Renderer.js';
import StrEffect from 'Renderer/Effects/StrEffect.js';
import WebGL from 'Utils/WebGL.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import PACKETVER from 'Network/PacketVerManager.js';
import Session from 'Engine/SessionStorage.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import ItemInfo from 'UI/Components/ItemInfo/ItemInfo.js';
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';
import Inventory from 'UI/Components/Inventory/Inventory.js';
import KEYS from 'Controls/KeyEventHandler.js';
import htmlText from './Enchant.html?raw';
import cssText from './Enchant.css?raw';

const Enchant = new UIComponent('Enchant', htmlText, cssText);

const EnchantState = {
	groupId: 0,
	group: null,
	item: null,
	itemIndex: 0,
	action: 'random',
	selectedSlot: null,
	selectedPerfect: null,
	selectedUpgradeSlot: null,
	pending: null,
	pendingLock: false
};

const EnchantAssets = {
	subpage: {
		normal: null,
		upgrade: null,
		reset: null
	},
	menuTabs: {
		random: null,
		perfect: null,
		upgrade: null,
		reset: null
	},
	actionButton: {
		normal: null,
		hover: null,
		down: null,
		disabled: null
	}
};

const DEFAULT_INTRO_DURATION_MS = 2000;

const EnchantEffectState = {
	introEndAt: 0,
	resultTimer: null,
	overlayTimer: null,
	overlayActive: false,
	overlayNode: null,
	canvasStyles: null,
	activeEffects: [],
	renderCallback: null,
	renderActive: false,
	overlayProgram: null,
	overlayBuffer: null,
	fallbackPosition: [0, 0, 0]
};

const EnchantEffectDurations = {};

const EnchantEffectGroups = {
	enchant: {
		intro: EffectConst.EF_UI_ENCHANT_INTRO_YELLOW,
		success: EffectConst.EF_UI_ENCHANT_SUCCESS,
		fail: EffectConst.EF_UI_ENCHANT_FAIL
	},
	upgrade: {
		intro: EffectConst.EF_UI_ENCHANT_INTRO_BLUE,
		success: EffectConst.EF_UI_ENCHANT_UP_SUCCESS,
		fail: EffectConst.EF_UI_ENCHANT_UP_FAIL
	},
	reset: {
		intro: EffectConst.EF_UI_ENCHANT_INTRO_GREEN,
		success: EffectConst.EF_UI_ENCHANT_RESET_SUCCESS,
		fail: EffectConst.EF_UI_ENCHANT_RESET_FAIL
	}
};

const ENCHANT_OVERLAY_ALPHA = 0.5;
const ENCHANT_OVERLAY_COLOR = new Float32Array([0, 0, 0, ENCHANT_OVERLAY_ALPHA]);

const EnchantEffectFog = {
	use: false,
	exist: true,
	far: 30,
	near: 180,
	factor: 1.0,
	color: new Float32Array([1, 1, 1])
};

function clearState() {
	EnchantState.groupId = 0;
	EnchantState.group = null;
	EnchantState.item = null;
	EnchantState.itemIndex = 0;
	EnchantState.action = 'random';
	EnchantState.selectedSlot = null;
	EnchantState.selectedPerfect = null;
	EnchantState.selectedUpgradeSlot = null;
	EnchantState.pending = null;
	EnchantState.pendingLock = false;
}

function formatZeny(zeny) {
	return String(zeny || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getSlotKey(slotNum) {
	return 'card' + (slotNum + 1);
}

function getSlotValue(item, slotNum) {
	if (!item || !item.slot) {
		return 0;
	}
	return item.slot[getSlotKey(slotNum)] || 0;
}

function setSlotValue(item, slotNum, value) {
	if (!item) {
		return;
	}
	if (!item.slot) {
		item.slot = {};
	}
	item.slot[getSlotKey(slotNum)] = value;
}

function getBaseSlotCount(item) {
	const it = DB.getItemInfo(item.ITID);
	const slotCount = it && it.slotCount ? parseInt(it.slotCount, 10) : 0;
	return isNaN(slotCount) ? 0 : slotCount;
}

function getItemGrade(item) {
	return item.enchantgrade || item.grade || 0;
}

function hasRandomOptions(item) {
	if (!item || !item.Options) {
		return false;
	}
	for (let i = 1; i < item.Options.length; i++) {
		if (item.Options[i] && item.Options[i].index > 0) {
			return true;
		}
	}
	return false;
}

function isTargetItem(item, group) {
	if (!item || !group || !group.targetItems) {
		return false;
	}
	const baseName = DB.getBasefromItemID(item.ITID);
	for (let i = 0; i < group.targetItems.length; i++) {
		const target = group.targetItems[i];
		if (target.id && target.id === item.ITID) {
			return true;
		}
		if (!target.id && baseName && target.base === baseName) {
			return true;
		}
	}
	return false;
}

function getNextEnchantSlot(item, group) {
	const slotOrder = group && group.slotOrder && group.slotOrder.length ? group.slotOrder : [0, 1, 2, 3];
	const baseSlots = getBaseSlotCount(item);
	for (let i = 0; i < slotOrder.length; i++) {
		const slotNum = slotOrder[i];
		if (slotNum < baseSlots) {
			continue;
		}
		if (!getSlotValue(item, slotNum)) {
			return slotNum;
		}
	}
	return null;
}

function getUpgradeCandidates(item, group) {
	const candidates = [];
	const slotOrder = group.slotOrder && group.slotOrder.length ? group.slotOrder : [0, 1, 2, 3];
	const baseSlots = getBaseSlotCount(item);
	for (let i = 0; i < slotOrder.length; i++) {
		const slotNum = slotOrder[i];
		if (slotNum < baseSlots) {
			continue;
		}
		const slotData = group.slots[slotNum];
		if (!slotData || !slotData.upgrade) {
			continue;
		}
		const currentId = getSlotValue(item, slotNum);
		if (!currentId) {
			continue;
		}
		const baseName = DB.getBasefromItemID(currentId);
		const entry = baseName ? slotData.upgrade[baseName] : null;
		if (!entry) {
			continue;
		}
		candidates.push({
			slotNum: slotNum,
			baseName: baseName,
			entry: entry,
			currentId: currentId
		});
	}
	return candidates;
}

function setStatus(message, isError) {
	const status = Enchant.ui.find('.status');
	status.text(message || '');
	status.toggleClass('error', !!isError);
}

function setCaution(message) {
	Enchant.ui.find('.caution').text(message || '');
}

function showHoverOverlay(text, identified, target) {
	if (!Enchant.ui || !text) {
		return;
	}
	const overlay = Enchant.ui.find('.overlay');
	const uiOffset = Enchant.ui.offset();
	const targetOffset = target.offset();
	overlay.text(text);
	overlay.css({
		top: targetOffset.top - uiOffset.top,
		left: targetOffset.left - uiOffset.left + 35
	});
	overlay.toggleClass('grey', !identified);
	overlay.show();
}

function hideHoverOverlay() {
	if (!Enchant.ui) {
		return;
	}
	Enchant.ui.find('.overlay').hide();
}

function showItemInfo(item) {
	if (!item) {
		return false;
	}
	if (ItemInfo.uid === item.ITID) {
		ItemInfo.remove();
		return false;
	}
	ItemInfo.append();
	ItemInfo.uid = item.ITID;
	ItemInfo.setItem(item);
	return false;
}

function updateSubpageSkin() {
	if (!Enchant.ui) {
		return;
	}
	const target = Enchant.ui.find('.subpage');
	let skin = EnchantAssets.subpage.normal;
	if (EnchantState.action === 'upgrade' && EnchantAssets.subpage.upgrade) {
		skin = EnchantAssets.subpage.upgrade;
	} else if (EnchantState.action === 'reset' && EnchantAssets.subpage.reset) {
		skin = EnchantAssets.subpage.reset;
	}
	if (skin) {
		target.css('backgroundImage', 'url(' + skin + ')');
	}
}

function updateMenuSkin() {
	if (!Enchant.ui) {
		return;
	}
	const target = Enchant.ui.find('.action_tabs');
	const skin = EnchantAssets.menuTabs[EnchantState.action] || EnchantAssets.menuTabs.random;
	if (skin) {
		target.css('backgroundImage', 'url(' + skin + ')');
	}
}

function updateActionButtonSkin(button, enabled) {
	if (!button || !button.length) {
		return;
	}
	if (!EnchantAssets.actionButton.normal) {
		return;
	}
	if (!enabled && EnchantAssets.actionButton.disabled) {
		button.css('backgroundImage', 'url(' + EnchantAssets.actionButton.disabled + ')');
		return;
	}
	button.css('backgroundImage', 'url(' + EnchantAssets.actionButton.normal + ')');
}

function bindActionButtonSkin() {
	const button = Enchant.ui.find('.action_btn');
	button.off('.enchant_skin');
	button.on('mouseover.enchant_skin', function () {
		if (!EnchantAssets.actionButton.hover || button.hasClass('disabled')) {
			return;
		}
		button.css('backgroundImage', 'url(' + EnchantAssets.actionButton.hover + ')');
	});
	button.on('mouseout.enchant_skin', function () {
		if (button.hasClass('disabled')) {
			return;
		}
		button.css('backgroundImage', 'url(' + EnchantAssets.actionButton.normal + ')');
	});
	button.on('mousedown.enchant_skin', function () {
		if (!EnchantAssets.actionButton.down || button.hasClass('disabled')) {
			return;
		}
		button.css('backgroundImage', 'url(' + EnchantAssets.actionButton.down + ')');
	});
	button.on('mouseup.enchant_skin', function () {
		if (button.hasClass('disabled')) {
			return;
		}
		const skin = EnchantAssets.actionButton.hover || EnchantAssets.actionButton.normal;
		button.css('backgroundImage', 'url(' + skin + ')');
	});
}

function applyScrollSkin(up, down, bg, thumb) {
	if (!Enchant.ui || !Enchant.ui.length) {
		return;
	}
	const root = Enchant.ui[0];
	root.style.setProperty('--enchant-scroll-up', 'url(' + up + ')');
	root.style.setProperty('--enchant-scroll-down', 'url(' + down + ')');
	root.style.setProperty('--enchant-scroll-track', 'url(' + bg + ')');
	root.style.setProperty('--enchant-scroll-thumb', 'url(' + thumb + ')');
}

function ensureEffectOverlay() {
	if (EnchantEffectState.overlayNode) {
		return EnchantEffectState.overlayNode;
	}
	EnchantEffectState.overlayNode = jQuery('<div id="EnchantEffectOverlay"></div>').appendTo('body');
	return EnchantEffectState.overlayNode;
}

function getEffectAnchorPosition() {
	if (Camera && Camera.target && Camera.target.position) {
		return Camera.target.position;
	}
	if (Session.Entity && Session.Entity.position) {
		return Session.Entity.position;
	}
	return EnchantEffectState.fallbackPosition;
}

function ensureEffectRenderCallback() {
	if (EnchantEffectState.renderCallback) {
		return;
	}
	EnchantEffectState.renderCallback = function (tick, gl) {
		if (!EnchantEffectState.overlayActive && !EnchantEffectState.activeEffects.length) {
			return;
		}
		if (!gl) {
			return;
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		if (EnchantEffectState.overlayActive) {
			renderEffectOverlay(gl);
		}
		if (EnchantEffectState.activeEffects.length) {
			renderEnchantEffects(tick, gl);
		} else {
			stopEffectRenderIfIdle();
		}
	};
}

function ensureEffectRenderActive() {
	ensureEffectRenderCallback();
	if (EnchantEffectState.renderActive) {
		return;
	}
	Renderer.render(EnchantEffectState.renderCallback);
	EnchantEffectState.renderActive = true;
}

function stopEffectRenderIfIdle() {
	if (!EnchantEffectState.renderActive) {
		return;
	}
	if (EnchantEffectState.overlayActive || EnchantEffectState.activeEffects.length) {
		return;
	}
	Renderer.stop(EnchantEffectState.renderCallback);
	EnchantEffectState.renderActive = false;
}

function ensureOverlayProgram(gl) {
	if (EnchantEffectState.overlayProgram && EnchantEffectState.overlayBuffer) {
		return;
	}
	const vertexShader =
		'\
#version 300 es\n\
#pragma vscode_glsllint_stage : vert\n\
precision highp float;\n\
in vec2 aPosition;\n\
void main() {\n\
	gl_Position = vec4(aPosition, 0.0, 1.0);\n\
}\n';
	const fragmentShader =
		'\
#version 300 es\n\
#pragma vscode_glsllint_stage : frag\n\
precision highp float;\n\
uniform vec4 uColor;\n\
out vec4 fragColor;\n\
void main() {\n\
	fragColor = uColor;\n\
}\n';
	EnchantEffectState.overlayProgram = WebGL.createShaderProgram(gl, vertexShader, fragmentShader);
	EnchantEffectState.overlayBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, EnchantEffectState.overlayBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
}

function renderEffectOverlay(gl) {
	ensureOverlayProgram(gl);
	const program = EnchantEffectState.overlayProgram;
	if (!program) {
		return;
	}
	gl.useProgram(program);
	gl.bindBuffer(gl.ARRAY_BUFFER, EnchantEffectState.overlayBuffer);
	gl.enableVertexAttribArray(program.attribute.aPosition);
	gl.vertexAttribPointer(program.attribute.aPosition, 2, gl.FLOAT, false, 0, 0);
	gl.uniform4fv(program.uniform.uColor, ENCHANT_OVERLAY_COLOR);
	gl.disable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function renderEnchantEffects(tick, gl) {
	if (!EnchantEffectState.activeEffects.length) {
		return;
	}
	if (!StrEffect.ready) {
		StrEffect.init(gl);
	}
	gl.disable(gl.DEPTH_TEST);
	StrEffect.beforeRender(gl, Camera.modelView, Camera.projection, EnchantEffectFog, tick);
	const anchor = getEffectAnchorPosition();
	const remaining = [];
	EnchantEffectState.activeEffects.forEach(function (effect) {
		if (!effect) {
			return;
		}
		if (!effect.ready) {
			effect.init(gl);
		}
		effect.position = anchor;
		effect.render(gl, tick);
		if (!effect.needCleanUp) {
			remaining.push(effect);
		}
	});
	EnchantEffectState.activeEffects = remaining;
	StrEffect.afterRender(gl);
	gl.enable(gl.DEPTH_TEST);
	stopEffectRenderIfIdle();
}

function spawnEnchantEffect(effectId) {
	if (!effectId) {
		return;
	}
	const effectList = EffectDB[effectId];
	if (!effectList || !effectList.length) {
		return;
	}
	const anchor = getEffectAnchorPosition();
	const startTick = Renderer && Renderer.tick ? Renderer.tick : Date.now();
	effectList.forEach(function (effect) {
		if (!effect || effect.type !== 'STR' || !effect.file) {
			return;
		}
		const filename = 'data/texture/effect/' + effect.file + '.str';
		const texturePath = effect.texturePath || '';
		const strEffect = new StrEffect(filename, anchor, startTick, texturePath);
		EnchantEffectState.activeEffects.push(strEffect);
	});
	ensureEffectRenderActive();
}

function showEffectOverlay() {
	const overlay = ensureEffectOverlay();
	if (EnchantEffectState.overlayActive) {
		overlay.show();
		return;
	}
	overlay.show();
	EnchantEffectState.overlayActive = true;
	jQuery('body').addClass('enchant-effect-active');
	ensureEffectRenderActive();
}

function hideEffectOverlay() {
	if (EnchantEffectState.overlayTimer) {
		clearTimeout(EnchantEffectState.overlayTimer);
		EnchantEffectState.overlayTimer = null;
	}
	if (!EnchantEffectState.overlayActive) {
		return;
	}
	if (Renderer && Renderer.canvas && EnchantEffectState.canvasStyles) {
		Renderer.canvas.style.zIndex = EnchantEffectState.canvasStyles.zIndex;
		Renderer.canvas.style.opacity = EnchantEffectState.canvasStyles.opacity;
		Renderer.canvas.style.pointerEvents = EnchantEffectState.canvasStyles.pointerEvents;
	}
	if (EnchantEffectState.overlayNode) {
		EnchantEffectState.overlayNode.hide();
	}
	EnchantEffectState.overlayActive = false;
	jQuery('body').removeClass('enchant-effect-active');
	stopEffectRenderIfIdle();
}

function scheduleEffectOverlayHide(delay) {
	if (EnchantEffectState.overlayTimer) {
		clearTimeout(EnchantEffectState.overlayTimer);
	}
	const timeout = Math.max(Number(delay) || 0, 0);
	EnchantEffectState.overlayTimer = setTimeout(function () {
		hideEffectOverlay();
	}, timeout);
}

function getEffectGroup(action) {
	if (action === 'upgrade') {
		return 'upgrade';
	}
	if (action === 'reset') {
		return 'reset';
	}
	return 'enchant';
}

function cacheEffectDuration(effectId) {
	if (Object.prototype.hasOwnProperty.call(EnchantEffectDurations, effectId)) {
		return;
	}
	const effectList = EffectDB[effectId];
	if (!effectList || !effectList.length) {
		EnchantEffectDurations[effectId] = DEFAULT_INTRO_DURATION_MS;
		return;
	}
	const effect = effectList[0];
	if (!effect || effect.type !== 'STR' || !effect.file) {
		EnchantEffectDurations[effectId] = DEFAULT_INTRO_DURATION_MS;
		return;
	}
	const filename = 'data/texture/effect/' + effect.file + '.str';
	const texturePath = effect.texturePath || '';
	Client.loadFile(
		filename,
		function (strFile) {
			let duration = DEFAULT_INTRO_DURATION_MS;
			if (strFile && strFile.fps) {
				duration = Math.ceil((strFile.maxKey / strFile.fps) * 1000);
			}
			EnchantEffectDurations[effectId] = duration;
		},
		null,
		{ texturePath: texturePath }
	);
}

function preloadEnchantEffectDurations() {
	Object.keys(EnchantEffectGroups).forEach(function (key) {
		const group = EnchantEffectGroups[key];
		cacheEffectDuration(group.intro);
		cacheEffectDuration(group.success);
		cacheEffectDuration(group.fail);
	});
}

function getEffectDuration(effectId) {
	return EnchantEffectDurations[effectId] || DEFAULT_INTRO_DURATION_MS;
}

function playEffect(effectId) {
	if (!effectId) {
		return;
	}
	spawnEnchantEffect(effectId);
}

function playIntroEffect(action) {
	const group = getEffectGroup(action);
	const effects = EnchantEffectGroups[group];
	if (!effects || !effects.intro) {
		return;
	}
	if (EnchantEffectState.resultTimer) {
		clearTimeout(EnchantEffectState.resultTimer);
		EnchantEffectState.resultTimer = null;
	}
	showEffectOverlay();
	cacheEffectDuration(effects.intro);
	playEffect(effects.intro);
	EnchantEffectState.introEndAt = Date.now() + getEffectDuration(effects.intro);
	scheduleEffectOverlayHide(getEffectDuration(effects.intro) + DEFAULT_INTRO_DURATION_MS);
}

function playResultEffect(action, success) {
	const group = getEffectGroup(action);
	const effects = EnchantEffectGroups[group];
	if (!effects) {
		return;
	}
	const effectId = success ? effects.success : effects.fail;
	if (!effectId) {
		return;
	}
	cacheEffectDuration(effectId);
	const delay = Math.max(EnchantEffectState.introEndAt - Date.now(), 0);
	if (EnchantEffectState.resultTimer) {
		clearTimeout(EnchantEffectState.resultTimer);
	}
	if (delay > 0) {
		EnchantEffectState.resultTimer = setTimeout(function () {
			playEffect(effectId);
		}, delay);
	} else {
		playEffect(effectId);
		EnchantEffectState.resultTimer = null;
	}
	scheduleEffectOverlayHide(delay + getEffectDuration(effectId));
	EnchantEffectState.introEndAt = 0;
}

function loadItemIcon(target, itemId, isIdentified) {
	const it = DB.getItemInfo(itemId);
	if (!it) {
		return;
	}
	const name = isIdentified !== false ? it.identifiedResourceName : it.unidentifiedResourceName;
	if (!name) {
		return;
	}
	Client.loadFile(DB.INTERFACE_PATH + 'item/' + name + '.bmp', function (data) {
		target.css('backgroundImage', 'url(' + data + ')');
	});
}

function loadItemCollection(target, itemId, isIdentified) {
	const it = DB.getItemInfo(itemId);
	if (!it) {
		return;
	}
	const name = isIdentified !== false ? it.identifiedResourceName : it.unidentifiedResourceName;
	if (!name) {
		return;
	}
	Client.loadFile(
		DB.INTERFACE_PATH + 'collection/' + name + '.bmp',
		function (data) {
			target.css('backgroundImage', 'url(' + data + ')');
		},
		function () {
			loadItemIcon(target, itemId, isIdentified);
		}
	);
}

function loadGradeIcon(target, grade) {
	if (!target || !target.length) {
		return;
	}
	if (!grade || grade <= 0) {
		target.css('backgroundImage', '');
		return;
	}
	Client.loadFile(DB.INTERFACE_PATH + 'grade_enchant/grade_icon' + grade + '.bmp', function (data) {
		target.css('backgroundImage', 'url(' + data + ')');
	});
}

function getItemDisplayName(itemId, fallback) {
	const info = DB.getItemInfo(itemId);
	if (info && info.identifiedDisplayName) {
		return info.identifiedDisplayName;
	}
	return fallback || 'Unknown';
}

function resolveMaterialId(material) {
	if (material && material.id) {
		return material.id;
	}
	if (material && material.base) {
		return DB.getItemIdfromBase(material.base) || 0;
	}
	return 0;
}

function hasEnoughZeny(zeny) {
	const cost = Number(zeny) || 0;
	if (cost <= 0) {
		return true;
	}
	return Session.zeny >= cost;
}

function hasEnoughMaterials(materials) {
	if (!materials || !materials.length) {
		return true;
	}
	const inventoryUI = Inventory.getUI && Inventory.getUI();
	if (!inventoryUI || !inventoryUI.getItemById) {
		return false;
	}
	for (let i = 0; i < materials.length; i++) {
		const mat = materials[i];
		const required = Number(mat.count) || 0;
		if (required <= 0) {
			continue;
		}
		const matId = resolveMaterialId(mat);
		if (!matId) {
			return false;
		}
		const inventoryItem = inventoryUI.getItemById(matId);
		const current = inventoryItem ? inventoryItem.count : 0;
		if (current < required) {
			return false;
		}
	}
	return true;
}

function canAffordCost(zeny, materials) {
	return hasEnoughZeny(zeny) && hasEnoughMaterials(materials);
}

function renderMaterials(materials) {
	const list = Enchant.ui.find('.material_list');
	list.empty();
	if (!materials || !materials.length) {
		return;
	}
	const inventoryUI = Inventory.getUI && Inventory.getUI();
	materials.forEach(function (mat) {
		const entry = jQuery('<div class="material"></div>');
		const icon = jQuery('<div class="icon"></div>');
		const name = jQuery('<div class="name"></div>');
		const count = jQuery('<div class="count"></div>');
		const matId = resolveMaterialId(mat);
		const label = matId ? getItemDisplayName(matId, mat.base) : mat.base || 'Unknown';
		let current = 0;
		const required = Number(mat.count) || 0;
		if (matId && inventoryUI && inventoryUI.getItemById) {
			const inventoryItem = inventoryUI.getItemById(matId);
			current = inventoryItem ? inventoryItem.count : 0;
		}
		name.text(label);
		if (mat.count != null) {
			count.text(matId ? current + '/' + required : 'x' + required);
		}
		entry.attr(
			'data-background',
			matId && current >= required ? 'enchantui/bg_enc_on.bmp' : 'enchantui/bg_enc_off.bmp'
		);
		entry.append(icon).append(name).append(count);
		list.append(entry);
		Enchant.parseHTML.call(entry[0]);
		icon.attr('data-name', label);
		if (matId) {
			icon.attr('data-itid', matId);
			loadItemIcon(icon, matId, true);
		}
	});
}

function renderEnchantList(entries, selectedKey) {
	const list = Enchant.ui.find('.enchant_list');
	list.empty();
	if (!entries || !entries.length) {
		return;
	}
	entries.forEach(function (entry) {
		const row = jQuery('<div class="enchant_entry"></div>');
		const icon = jQuery('<div class="entry_icon"></div>');
		const text = jQuery('<div class="entry_text"></div>');
		const name = jQuery('<div class="entry_name"></div>');
		const itid = entry.id || (entry.base ? DB.getItemIdfromBase(entry.base) : 0);
		name.text(entry.label || '');
		text.append(name);
		if (entry.subLabel) {
			const sub = jQuery('<div class="entry_sub"></div>');
			sub.text(entry.subLabel);
			text.append(sub);
		}
		row.attr('data-key', entry.key);
		row.attr('data-itid', itid || 0);
		row.attr('data-name', entry.label || '');
		row.attr('data-background', 'enchantui/btn_enc_item.bmp');
		row.attr('data-hover', 'enchantui/btn_enc_item_over.bmp');
		row.attr('data-down', 'enchantui/btn_enc_item_press.bmp');
		row.attr('data-active', 'enchantui/btn_enc_item_press.bmp');
		row.toggleClass('disabled', !!entry.disabled);
		row.toggleClass('active', selectedKey != null && String(entry.key) === String(selectedKey));
		row.append(icon).append(text);
		list.append(row);
		Enchant.parseHTML.call(row[0]);
		if (itid) {
			loadItemIcon(icon, itid, true);
		}
	});
}

function renderItemList() {
	const list = Enchant.ui.find('.item_list');
	list.empty();

	if (!EnchantState.group) {
		list.append('<div class="item_list_empty">Enchant data missing.</div>');
		return;
	}

	const inventoryUI = Inventory.getUI && Inventory.getUI();
	const items = inventoryUI && inventoryUI.list ? inventoryUI.list : [];
	let selectedIndex = EnchantState.item ? EnchantState.item.index : 0;
	let selectedValid = false;
	const candidates = [];

	items.forEach(function (item) {
		const result = validateItem(item);
		if (!result.ok) {
			return;
		}
		candidates.push(item);
		if (selectedIndex && item.index === selectedIndex) {
			selectedValid = true;
		}
	});

	if (selectedIndex && !selectedValid) {
		EnchantState.item = null;
		EnchantState.itemIndex = 0;
		EnchantState.selectedPerfect = null;
		EnchantState.selectedSlot = null;
		EnchantState.selectedUpgradeSlot = null;
		selectedIndex = 0;
	}

	if (!candidates.length) {
		list.append('<div class="item_list_empty">No enchantable items.</div>');
		return;
	}

	candidates.forEach(function (item) {
		const entry = jQuery('<button class="item_entry"></button>');
		const slot = jQuery('<div class="item_slot"></div>');
		const info = jQuery('<div class="item_info"></div>');
		const name = jQuery('<div class="item_name"></div>');
		const grade = jQuery('<div class="item_grade"></div>');
		const itemName = DB.getItemName(item, {
			showItemRefine: true,
			showItemGrade: false,
			showItemOptions: false
		});

		name.text(itemName);
		info.append(name).append(grade);

		entry.attr('data-index', item.index);
		entry.attr('data-name', itemName);
		entry.attr('data-background', 'enchantui/bg_enc_gear.bmp');
		entry.attr('data-hover', 'enchantui/bg_enc_gear_over.bmp');
		entry.attr('data-down', 'enchantui/bg_enc_gear_press.bmp');
		entry.attr('data-active', 'enchantui/bg_enc_gear_press.bmp');
		entry.toggleClass('active', selectedIndex && item.index === selectedIndex);
		entry.append(slot).append(info);
		list.append(entry);
		Enchant.parseHTML.call(entry[0]);
		slot.attr('data-itid', item.ITID);
		slot.attr('data-name', itemName);
		loadItemIcon(slot, item.ITID, item.IsIdentified);
		loadGradeIcon(grade, getItemGrade(item));
	});
}

function renderItemPreview() {
	const preview = Enchant.ui.find('.preview_item');
	preview.css('backgroundImage', '');
	if (!EnchantState.item) {
		return;
	}
	loadItemCollection(preview, EnchantState.item.ITID, EnchantState.item.IsIdentified);
}

function renderSlots() {
	const list = Enchant.ui.find('.slot_list');
	let empty = list.find('.slot_empty');
	if (!empty.length) {
		empty = jQuery('<div class="slot_empty">Select an item</div>');
		list.append(empty);
	}
	const hasItem = !!(EnchantState.item && EnchantState.group);
	empty.toggle(!hasItem);

	const baseSlots = hasItem ? getBaseSlotCount(EnchantState.item) : 0;
	list.find('.slot_entry').each(function () {
		const entry = jQuery(this);
		const slotNum = parseInt(entry.attr('data-slot'), 10);
		const icon = entry.find('.slot_icon');
		const slotItem = hasItem ? getSlotValue(EnchantState.item, slotNum) : 0;
		entry.toggleClass('locked', hasItem && slotNum < baseSlots);
		entry.toggleClass('active', hasItem && slotNum === EnchantState.selectedSlot);
		entry.toggleClass('empty', !slotItem);
		entry.attr('data-itid', slotItem || 0);
		icon.css('backgroundImage', '');
		if (slotItem) {
			loadItemIcon(icon, slotItem, true);
		}
	});
}

function updateTabs(availability) {
	Enchant.ui.find('.action_tabs .tab').each(function () {
		const action = this.dataset.action;
		jQuery(this).toggleClass('active', EnchantState.action === action);
		jQuery(this).toggleClass('disabled', availability && availability[action] === false);
	});
	updateSubpageSkin();
	updateMenuSkin();
}

function updateActionSections() {
	Enchant.ui.find('.action_section').removeClass('active');
	Enchant.ui.find('.' + EnchantState.action + '_section').addClass('active');
}

function updateActionButton(enabled) {
	const button = Enchant.ui.find('.action_btn');
	const label = EnchantState.action === 'reset' ? 'Reset' : 'Enchant';
	button.text('');
	button.attr('title', label);
	button.toggleClass('disabled', !enabled);
	updateActionButtonSkin(button, enabled);
}

function renderCosts(rate, zeny, materials) {
	const zenyText = zeny != null ? formatZeny(zeny) : '';
	Enchant.ui.find('.zeny_cost').text(zenyText);
	renderMaterials(materials);
}

function refreshActionContent() {
	const group = EnchantState.group;
	const item = EnchantState.item;
	let actionReady = false;
	const availability = {
		random: false,
		perfect: false,
		upgrade: false,
		reset: false
	};
	let listEntries = [];
	let selectedKey = null;

	Enchant.ui.find('.upgrade_result').text('');

	if (group && item) {
		const slotNum = getNextEnchantSlot(item, group);
		const slotData = slotNum !== null ? group.slots[slotNum] : null;
		const baseSlots = getBaseSlotCount(item);

		if (slotData && slotData.random && Object.keys(slotData.random).length) {
			availability.random = true;
		}
		if (slotData && slotData.perfect && Object.keys(slotData.perfect).length) {
			availability.perfect = true;
		}

		const upgradeCandidates = getUpgradeCandidates(item, group);
		if (upgradeCandidates.length) {
			availability.upgrade = true;
		}

		let hasEnchant = false;
		const slotOrder = group.slotOrder && group.slotOrder.length ? group.slotOrder : [0, 1, 2, 3];
		slotOrder.forEach(function (orderSlot) {
			if (orderSlot >= baseSlots && getSlotValue(item, orderSlot)) {
				hasEnchant = true;
			}
		});
		if (group.reset && group.reset.enabled && hasEnchant) {
			availability.reset = true;
		}

		if (!availability[EnchantState.action]) {
			const nextAction = Object.keys(availability).find(function (key) {
				return availability[key];
			});
			EnchantState.action = nextAction || EnchantState.action;
		}

		updateTabs(availability);
		updateActionSections();

		if (EnchantState.action === 'random') {
			EnchantState.selectedSlot = slotNum;
			if (slotData) {
				const grade = getItemGrade(item);
				const bonus = slotData.gradeBonus ? slotData.gradeBonus[grade] || 0 : 0;
				const baseRate = slotData.successRate || 0;
				const totalRate = Math.min(baseRate + bonus, 100000);
				const require = slotData.require || { zeny: 0, materials: [] };
				renderCosts(totalRate, require.zeny, require.materials);
				actionReady = availability.random && canAffordCost(require.zeny, require.materials);
				if (slotData.random) {
					const randomList = slotData.random[grade] || slotData.random[0] || [];
					listEntries = randomList.map(function (entry) {
						const label = entry.id ? getItemDisplayName(entry.id, entry.base) : entry.base;
						return {
							key: entry.id || entry.base || label,
							id: entry.id,
							base: entry.base,
							label: label,
							disabled: true
						};
					});
				}
			} else {
				renderCosts(null, 0, []);
			}
		}

		if (EnchantState.action === 'perfect') {
			EnchantState.selectedSlot = slotNum;
			const select = Enchant.ui.find('.perfect_select');
			select.empty();
			const perfectEntries = [];
			if (slotData && slotData.perfect) {
				const perfectList = Object.keys(slotData.perfect);
				perfectList.forEach(function (key) {
					const entry = slotData.perfect[key];
					const label = entry.id ? getItemDisplayName(entry.id, entry.base) : entry.base;
					select.append('<option value="' + key + '">' + label + '</option>');
					perfectEntries.push({
						key: key,
						id: entry.id,
						base: entry.base,
						label: label
					});
				});
				if (perfectList.length) {
					if (EnchantState.selectedPerfect && slotData.perfect[EnchantState.selectedPerfect]) {
						select.val(EnchantState.selectedPerfect);
						const selected = slotData.perfect[EnchantState.selectedPerfect];
						renderCosts(100000, selected.zeny, selected.materials);
						actionReady = availability.perfect && canAffordCost(selected.zeny, selected.materials);
						selectedKey = EnchantState.selectedPerfect;
					} else {
						EnchantState.selectedPerfect = null;
						select.prop('selectedIndex', -1);
						renderCosts(null, 0, []);
					}
				} else {
					renderCosts(null, 0, []);
				}
			} else {
				renderCosts(null, 0, []);
			}
			listEntries = perfectEntries;
		}

		if (EnchantState.action === 'upgrade') {
			const upgradeSelect = Enchant.ui.find('.upgrade_select');
			upgradeSelect.empty();
			const upgradeEntries = [];
			if (upgradeCandidates.length) {
				upgradeCandidates.forEach(function (candidate) {
					const currentName = getItemDisplayName(candidate.currentId, candidate.baseName);
					const resultId = candidate.entry.result
						? candidate.entry.result.id || DB.getItemIdfromBase(candidate.entry.result.base)
						: 0;
					const resultName = resultId
						? getItemDisplayName(resultId, candidate.entry.result.base)
						: candidate.entry.result
							? candidate.entry.result.base
							: '';
					upgradeSelect.append(
						'<option value="' +
							candidate.slotNum +
							'">Slot ' +
							(candidate.slotNum + 1) +
							': ' +
							currentName +
							' -> ' +
							resultName +
							'</option>'
					);
					upgradeEntries.push({
						key: String(candidate.slotNum),
						id: resultId || 0,
						base: candidate.entry.result ? candidate.entry.result.base : null,
						label: resultName || currentName
					});
				});
				if (
					!EnchantState.selectedUpgradeSlot ||
					!upgradeCandidates.find(function (candidate) {
						return candidate.slotNum === EnchantState.selectedUpgradeSlot;
					})
				) {
					EnchantState.selectedUpgradeSlot = upgradeCandidates[0].slotNum;
				}
				upgradeSelect.val(EnchantState.selectedUpgradeSlot);
				const selectedEntry = upgradeCandidates.find(function (candidate) {
					return candidate.slotNum === EnchantState.selectedUpgradeSlot;
				});
				if (selectedEntry) {
					EnchantState.selectedSlot = selectedEntry.slotNum;
					Enchant.ui
						.find('.upgrade_result')
						.text('Result: ' + (selectedEntry.entry.result ? selectedEntry.entry.result.base : ''));
					renderCosts(100000, selectedEntry.entry.zeny, selectedEntry.entry.materials);
					actionReady =
						availability.upgrade && canAffordCost(selectedEntry.entry.zeny, selectedEntry.entry.materials);
					selectedKey = String(EnchantState.selectedUpgradeSlot);
				}
			} else {
				renderCosts(null, 0, []);
			}
			listEntries = upgradeEntries;
		}

		if (EnchantState.action === 'reset') {
			EnchantState.selectedSlot = null;
			if (availability.reset) {
				renderCosts(group.reset.rate, group.reset.zeny, group.reset.materials);
				actionReady = canAffordCost(group.reset.zeny, group.reset.materials);
			} else {
				renderCosts(null, 0, []);
			}
		}
	} else {
		updateTabs(availability);
		updateActionSections();
		renderCosts(null, 0, []);
	}

	renderEnchantList(listEntries, selectedKey);
	updateActionButton(actionReady);
}

function refreshUI() {
	renderItemList();
	renderItemPreview();
	refreshActionContent();
	renderSlots();
	setCaution(EnchantState.group ? EnchantState.group.caution : '');
}

function validateItem(item) {
	if (!EnchantState.group) {
		return { ok: false, message: 'Enchant data missing for this group.' };
	}
	if (!item) {
		return { ok: false, message: 'Invalid item.' };
	}
	if (item.WearState) {
		return { ok: false, message: 'Item must be in inventory.' };
	}
	if ((item.equipSwitch && item.equipSwitch > 0) || (item.EquipSwitch && item.EquipSwitch > 0)) {
		return { ok: false, message: 'Item cannot be in equipment switch.' };
	}
	if (item.attribute && item.attribute !== 0) {
		return { ok: false, message: 'Item attribute must be normal.' };
	}
	if (!isTargetItem(item, EnchantState.group)) {
		return { ok: false, message: 'Item is not valid for this enchant group.' };
	}
	const refine = item.RefiningLevel || item.refiningLevel || 0;
	if (refine < EnchantState.group.condition.minRefine) {
		return { ok: false, message: 'Refine level too low.' };
	}
	const grade = getItemGrade(item);
	if (grade < EnchantState.group.condition.minGrade) {
		return { ok: false, message: 'Enchant grade too low.' };
	}
	if (!EnchantState.group.allowRandomOption && hasRandomOptions(item)) {
		return { ok: false, message: 'Random options not allowed.' };
	}
	return { ok: true };
}

function getInventoryItemByIndex(index) {
	const inventoryUI = Inventory.getUI && Inventory.getUI();
	return inventoryUI && inventoryUI.getItemByIndex ? inventoryUI.getItemByIndex(index) : null;
}

function resolveItemContext(target) {
	const node = jQuery(target);
	const slotEntry = node.closest('.slot_entry');
	if (slotEntry.length) {
		if (!EnchantState.item) {
			return null;
		}
		const slotNum = parseInt(slotEntry.attr('data-slot'), 10);
		if (isNaN(slotNum)) {
			return null;
		}
		const slotItemId = getSlotValue(EnchantState.item, slotNum);
		if (!slotItemId) {
			return null;
		}
		return {
			item: { ITID: slotItemId, IsIdentified: 1 },
			label: '',
			identified: true,
			anchor: slotEntry
		};
	}

	const itemEntry = node.closest('.item_entry');
	if (itemEntry.length) {
		const index = parseInt(itemEntry.attr('data-index'), 10);
		let invItem = !isNaN(index) ? getInventoryItemByIndex(index) : null;
		if (!invItem) {
			const itemId = parseInt(node.attr('data-itid'), 10);
			if (!isNaN(itemId) && itemId) {
				invItem = { ITID: itemId, IsIdentified: 1 };
			}
		}
		return {
			item: invItem,
			label: node.attr('data-name') || itemEntry.attr('data-name') || '',
			identified: invItem ? !!invItem.IsIdentified : true,
			anchor: node
		};
	}

	const materialIcon = node.closest('.material .icon');
	if (materialIcon.length) {
		const matId = parseInt(materialIcon.attr('data-itid'), 10);
		const matItem = !isNaN(matId) && matId ? { ITID: matId, IsIdentified: 1 } : null;
		return {
			item: matItem,
			label: materialIcon.attr('data-name') || '',
			identified: true,
			anchor: materialIcon
		};
	}

	const enchantEntry = node.closest('.enchant_entry');
	if (enchantEntry.length) {
		const enchantId = parseInt(enchantEntry.attr('data-itid'), 10);
		const enchantItem = !isNaN(enchantId) && enchantId ? { ITID: enchantId, IsIdentified: 1 } : null;
		return {
			item: enchantItem,
			label: enchantEntry.attr('data-name') || '',
			identified: true,
			anchor: node
		};
	}

	return null;
}

function onIconOver(event) {
	const context = resolveItemContext(event.currentTarget);
	if (!context) {
		return;
	}
	let label = context.label;
	if (context.item) {
		label = DB.getItemName(context.item, { showItemOptions: false });
	}
	if (!label) {
		return;
	}
	showHoverOverlay(label, context.identified, context.anchor || jQuery(event.currentTarget));
}

function onIconOut() {
	hideHoverOverlay();
}

function onIconInfo(event) {
	event.preventDefault();
	event.stopImmediatePropagation();
	const context = resolveItemContext(event.currentTarget);
	if (context && context.item) {
		showItemInfo(context.item);
	}
	return false;
}

function onActionSelect(event) {
	const action = event.currentTarget.dataset.action;
	if (jQuery(event.currentTarget).hasClass('disabled')) {
		return;
	}
	EnchantState.action = action;
	refreshUI();
}

function onPerfectChange() {
	EnchantState.selectedPerfect = this.value;
	refreshUI();
}

function onUpgradeChange() {
	EnchantState.selectedUpgradeSlot = parseInt(this.value, 10);
	refreshUI();
}

function onEnchantListSelect(event) {
	const entry = jQuery(event.currentTarget);
	if (entry.hasClass('disabled')) {
		return;
	}
	const key = entry.attr('data-key');
	if (EnchantState.action === 'perfect') {
		EnchantState.selectedPerfect = key;
		refreshUI();
		return;
	}
	if (EnchantState.action === 'upgrade') {
		const slotNum = parseInt(key, 10);
		if (!isNaN(slotNum)) {
			EnchantState.selectedUpgradeSlot = slotNum;
			refreshUI();
		}
	}
}

function onItemSelect(event) {
	const entry = jQuery(event.currentTarget);
	const index = parseInt(entry.attr('data-index'), 10);
	if (isNaN(index)) {
		return;
	}
	const inventoryUI = Inventory.getUI && Inventory.getUI();
	const item = inventoryUI && inventoryUI.getItemByIndex ? inventoryUI.getItemByIndex(index) : null;
	if (!item) {
		return;
	}
	Enchant.onRequestItemEnchant(item);
}

function onRequestAction() {
	if (Enchant.ui.find('.action_btn').hasClass('disabled')) {
		return;
	}
	if (!EnchantState.group || !EnchantState.item) {
		setStatus('Select an item first.', true);
		return;
	}
	let pkt;
	const slotNum = EnchantState.selectedSlot;
	const itemIndex = EnchantState.itemIndex;

	if (EnchantState.action === 'random') {
		if (slotNum === null) {
			setStatus('No available enchant slot.', true);
			return;
		}
		pkt = new PACKET.CZ.REQUEST_RANDOM_ENCHANT();
		pkt.enchant_group = EnchantState.groupId;
		pkt.index = itemIndex;
	} else if (EnchantState.action === 'perfect') {
		if (slotNum === null || !EnchantState.selectedPerfect) {
			setStatus('Select a perfect enchant.', true);
			return;
		}
		const slotData = EnchantState.group.slots[slotNum];
		const perfectEntry = slotData ? slotData.perfect[EnchantState.selectedPerfect] : null;
		const perfectId = perfectEntry ? perfectEntry.id || DB.getItemIdfromBase(perfectEntry.base) : 0;
		if (!perfectEntry || !perfectId) {
			setStatus('Invalid perfect enchant selection.', true);
			return;
		}
		pkt = new PACKET.CZ.REQUEST_PERFECT_ENCHANT();
		pkt.enchant_group = EnchantState.groupId;
		pkt.index = itemIndex;
		pkt.ITID = perfectId;
	} else if (EnchantState.action === 'upgrade') {
		if (slotNum === null) {
			setStatus('Select an upgrade slot.', true);
			return;
		}
		pkt = new PACKET.CZ.REQUEST_UPGRADE_ENCHANT();
		pkt.enchant_group = EnchantState.groupId;
		pkt.index = itemIndex;
		pkt.slot = slotNum;
	} else if (EnchantState.action === 'reset') {
		pkt = new PACKET.CZ.REQUEST_RESET_ENCHANT();
		pkt.enchant_group = EnchantState.groupId;
		pkt.index = itemIndex;
	}

	if (!pkt) {
		return;
	}

	playIntroEffect(EnchantState.action);

	EnchantState.pending = {
		action: EnchantState.action,
		slot: slotNum,
		itemIndex: itemIndex,
		item: EnchantState.item
	};

	EnchantState.pendingLock = true;
	Enchant.ui.find('.close, .close_btn').prop('disabled', true);
	Network.sendPacket(pkt);
	setStatus('Request sent...', false);
}

function applyEnchantResult(item, action, slotNum, itid) {
	if (!item) {
		return;
	}
	if (action === 'reset') {
		const baseSlots = getBaseSlotCount(item);
		const slotOrder =
			EnchantState.group && EnchantState.group.slotOrder && EnchantState.group.slotOrder.length
				? EnchantState.group.slotOrder
				: [0, 1, 2, 3];
		slotOrder.forEach(function (orderSlot) {
			if (orderSlot >= baseSlots) {
				setSlotValue(item, orderSlot, 0);
			}
		});
		return;
	}
	if (slotNum !== null && itid) {
		setSlotValue(item, slotNum, itid);
	}
}

function onEnchantResult(pkt) {
	if (!EnchantState.pending) {
		return;
	}
	const message = DB.getMessage(pkt.msgId) || 'Enchant result: ' + pkt.msgId;
	const isSuccess = pkt.msgId === 3857;
	ChatBox.addText(message, ChatBox.TYPE.BLUE, ChatBox.FILTER.PUBLIC_LOG);
	playResultEffect(EnchantState.pending.action, isSuccess);
	if (isSuccess) {
		applyEnchantResult(EnchantState.pending.item, EnchantState.pending.action, EnchantState.pending.slot, pkt.ITID);
		if (ItemInfo.ui && ItemInfo.ui.is(':visible') && ItemInfo.uid === EnchantState.pending.item.ITID) {
			ItemInfo.setItem(EnchantState.pending.item);
		}
	}
	Enchant.remove();
}

function onRequestClose() {
	if (EnchantState.pendingLock) {
		setStatus('Request in progress...', false);
		return;
	}
	if (PACKETVER.value >= 20211103) {
		const pkt = new PACKET.CZ.CLOSE_UI_ENCHANT();
		Network.sendPacket(pkt);
	}
	Enchant.remove();
}

Enchant.onKeyDown = function onKeyDown(event) {
	if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && Enchant.ui.is(':visible')) {
		onRequestClose();
	}
};

Enchant.init = function init() {
	this.ui.css({ top: 200, left: 360 });
	this.draggable(this.ui.find('.titlebar'));
	preloadEnchantEffectDurations();

	Client.loadFiles(
		[
			DB.INTERFACE_PATH + 'enchantui/bg_subpage.bmp',
			DB.INTERFACE_PATH + 'enchantui/bg_subpageb.bmp',
			DB.INTERFACE_PATH + 'enchantui/bg_subpagey.bmp'
		],
		function (normal, upgrade, reset) {
			EnchantAssets.subpage.normal = normal;
			EnchantAssets.subpage.upgrade = upgrade;
			EnchantAssets.subpage.reset = reset;
			updateSubpageSkin();
		}
	);

	Client.loadFiles(
		[
			DB.INTERFACE_PATH + 'enchantui/bg_enc_menu0.bmp',
			DB.INTERFACE_PATH + 'enchantui/bg_enc_menu1.bmp',
			DB.INTERFACE_PATH + 'enchantui/bg_enc_menu2.bmp',
			DB.INTERFACE_PATH + 'enchantui/bg_enc_menu3.bmp'
		],
		function (menu0, menu1, menu2, menu3) {
			EnchantAssets.menuTabs.random = menu0;
			EnchantAssets.menuTabs.perfect = menu1;
			EnchantAssets.menuTabs.upgrade = menu2;
			EnchantAssets.menuTabs.reset = menu3;
			updateMenuSkin();
		}
	);

	Client.loadFiles(
		[
			DB.INTERFACE_PATH + 'enchantui/btn_enc.bmp',
			DB.INTERFACE_PATH + 'enchantui/btn_enc_over.bmp',
			DB.INTERFACE_PATH + 'enchantui/btn_enc_press.bmp',
			DB.INTERFACE_PATH + 'enchantui/btn_enc_dis.bmp'
		],
		function (normal, hover, down, disabled) {
			EnchantAssets.actionButton.normal = normal;
			EnchantAssets.actionButton.hover = hover;
			EnchantAssets.actionButton.down = down;
			EnchantAssets.actionButton.disabled = disabled;
			bindActionButtonSkin();
			updateActionButtonSkin(
				Enchant.ui.find('.action_btn'),
				!Enchant.ui.find('.action_btn').hasClass('disabled')
			);
		}
	);

	Client.loadFiles(
		[
			DB.INTERFACE_PATH + 'enchantui/scroll_arrow_up.bmp',
			DB.INTERFACE_PATH + 'enchantui/scroll_arrow_dowm.bmp',
			DB.INTERFACE_PATH + 'enchantui/scroll_bg.bmp',
			DB.INTERFACE_PATH + 'enchantui/scroll_btn.bmp'
		],
		applyScrollSkin
	);

	this.ui.find('.close, .close_btn').click(onRequestClose);
	this.ui.find('.item_list').on('click', '.item_entry', onItemSelect);
	this.ui
		.find('.item_list')
		.on('mouseover', '.item_slot', onIconOver)
		.on('mouseout', '.item_slot', onIconOut)
		.on('contextmenu', '.item_slot', onIconInfo);
	this.ui.find('.action_tabs').on('click', '.tab', onActionSelect);
	this.ui.find('.perfect_select').change(onPerfectChange);
	this.ui.find('.upgrade_select').change(onUpgradeChange);
	this.ui
		.find('.material_list')
		.on('mouseover', '.icon', onIconOver)
		.on('mouseout', '.icon', onIconOut)
		.on('contextmenu', '.icon', onIconInfo);
	this.ui
		.find('.slot_list')
		.on('mouseover', '.slot_icon', onIconOver)
		.on('mouseout', '.slot_icon', onIconOut)
		.on('contextmenu', '.slot_icon', onIconInfo);
	this.ui
		.find('.enchant_list')
		.on('click', '.enchant_entry', onEnchantListSelect)
		.on('mouseover', '.entry_icon', onIconOver)
		.on('mouseout', '.entry_icon', onIconOut)
		.on('contextmenu', '.entry_icon', onIconInfo);
	this.ui.find('.action_btn').click(onRequestAction);
};

Enchant.onAppend = function onAppend() {
	setStatus('', false);
	refreshUI();
};

Enchant.onRemove = function onRemove() {
	clearState();
	Enchant.ui.find('.close, .close_btn').prop('disabled', false);
	this.ui.find('.slot_entry').removeClass('locked active').attr('title', '');
	this.ui.find('.slot_icon').css('backgroundImage', '');
	this.ui.find('.material_list').empty();
	this.ui.find('.enchant_list').empty();
	this.ui.find('.perfect_select').empty();
	this.ui.find('.upgrade_select').empty();
	this.ui.find('.upgrade_result').text('');
	this.ui.find('.zeny_cost').text('');
	this.ui.find('.item_list').empty();
	this.ui.find('.preview_item').css('backgroundImage', '');
	hideHoverOverlay();
	setStatus('', false);
};

Enchant.onOpenEnchantUI = function onOpenEnchantUI(groupId) {
	clearState();
	EnchantState.groupId = Number(groupId);
	EnchantState.group = DB.getEnchantGroup(EnchantState.groupId);
	if (!EnchantState.group) {
		UIManager.showErrorBox('Enchant data missing for group ' + groupId + '.');
	}
	Enchant.append();
	Enchant.ui.show();
	Enchant.ui.focus();
	refreshUI();
};

Enchant.onRequestItemEnchant = function onRequestItemEnchant(item) {
	const result = validateItem(item);
	if (!result.ok) {
		setStatus(result.message, true);
		return;
	}
	EnchantState.item = item;
	EnchantState.itemIndex = item.index;
	EnchantState.selectedPerfect = null;
	EnchantState.selectedUpgradeSlot = null;
	EnchantState.selectedSlot = null;
	setStatus('', false);
	refreshUI();
};

Enchant.isEnchantOpen = function isEnchantOpen() {
	return Enchant.ui && Enchant.ui.is(':visible');
};

Network.hookPacket(PACKET.ZC.RESPONSE_ENCHANT, onEnchantResult);
export default UIManager.addComponent(Enchant);
