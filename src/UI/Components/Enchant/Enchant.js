/**
 * UI/Components/Enchant/Enchant.js
 *
 * Enchant UI Window
 */
define(function (require)
{
	'use strict';

	var jQuery = require('Utils/jquery');
	var DB = require('DB/DBManager');
	var Client = require('Core/Client');
	var EffectDB = require('DB/Effects/EffectTable');
	var EffectConst = require('DB/Effects/EffectConst');
	var Camera = require('Renderer/Camera');
	var Renderer = require('Renderer/Renderer');
	var StrEffect = require('Renderer/Effects/StrEffect');
	var WebGL = require('Utils/WebGL');
	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var PACKETVER = require('Network/PacketVerManager');
	var Session = require('Engine/SessionStorage');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var ItemInfo = require('UI/Components/ItemInfo/ItemInfo');
	var ChatBox = require('UI/Components/ChatBox/ChatBox');
	var Inventory = require('UI/Components/Inventory/Inventory');
	var KEYS = require('Controls/KeyEventHandler');
	var htmlText = require('text!./Enchant.html');
	var cssText = require('text!./Enchant.css');

	var Enchant = new UIComponent('Enchant', htmlText, cssText);

	var EnchantState = {
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

	var EnchantAssets = {
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

	var DEFAULT_INTRO_DURATION_MS = 2000;

	var EnchantEffectState = {
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

	var EnchantEffectDurations = {};

	var EnchantEffectGroups = {
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

	var ENCHANT_OVERLAY_ALPHA = 0.5;
	var ENCHANT_OVERLAY_COLOR = new Float32Array([0, 0, 0, ENCHANT_OVERLAY_ALPHA]);

	var EnchantEffectFog = {
		use: false,
		exist: true,
		far: 30,
		near: 180,
		factor: 1.0,
		color: new Float32Array([1, 1, 1])
	};

	function clearState()
	{
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

	function formatZeny(zeny)
	{
		return String(zeny || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}

	function getSlotKey(slotNum)
	{
		return 'card' + (slotNum + 1);
	}

	function getSlotValue(item, slotNum)
	{
		if (!item || !item.slot)
		{
			return 0;
		}
		return item.slot[getSlotKey(slotNum)] || 0;
	}

	function setSlotValue(item, slotNum, value)
	{
		if (!item)
		{
			return;
		}
		if (!item.slot)
		{
			item.slot = {};
		}
		item.slot[getSlotKey(slotNum)] = value;
	}

	function getBaseSlotCount(item)
	{
		var it = DB.getItemInfo(item.ITID);
		var slotCount = it && it.slotCount ? parseInt(it.slotCount, 10) : 0;
		return isNaN(slotCount) ? 0 : slotCount;
	}

	function getItemGrade(item)
	{
		return item.enchantgrade || item.grade || 0;
	}

	function hasRandomOptions(item)
	{
		if (!item || !item.Options)
		{
			return false;
		}
		for (var i = 1; i < item.Options.length; i++)
		{
			if (item.Options[i] && item.Options[i].index > 0)
			{
				return true;
			}
		}
		return false;
	}

	function isTargetItem(item, group)
	{
		if (!item || !group || !group.targetItems)
		{
			return false;
		}
		var baseName = DB.getBasefromItemID(item.ITID);
		for (var i = 0; i < group.targetItems.length; i++)
		{
			var target = group.targetItems[i];
			if (target.id && target.id === item.ITID)
			{
				return true;
			}
			if (!target.id && baseName && target.base === baseName)
			{
				return true;
			}
		}
		return false;
	}

	function getNextEnchantSlot(item, group)
	{
		var slotOrder = group && group.slotOrder && group.slotOrder.length ? group.slotOrder : [0, 1, 2, 3];
		var baseSlots = getBaseSlotCount(item);
		for (var i = 0; i < slotOrder.length; i++)
		{
			var slotNum = slotOrder[i];
			if (slotNum < baseSlots)
			{
				continue;
			}
			if (!getSlotValue(item, slotNum))
			{
				return slotNum;
			}
		}
		return null;
	}

	function getUpgradeCandidates(item, group)
	{
		var candidates = [];
		if (!item || !group)
		{
			return candidates;
		}
		var slotOrder = group.slotOrder && group.slotOrder.length ? group.slotOrder : [0, 1, 2, 3];
		var baseSlots = getBaseSlotCount(item);
		for (var i = 0; i < slotOrder.length; i++)
		{
			var slotNum = slotOrder[i];
			if (slotNum < baseSlots)
			{
				continue;
			}
			var slotData = group.slots[slotNum];
			if (!slotData || !slotData.upgrade)
			{
				continue;
			}
			var currentId = getSlotValue(item, slotNum);
			if (!currentId)
			{
				continue;
			}
			var baseName = DB.getBasefromItemID(currentId);
			var entry = baseName ? slotData.upgrade[baseName] : null;
			if (!entry)
			{
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

	function setStatus(message, isError)
	{
		var status = Enchant.ui.find('.status');
		status.text(message || '');
		status.toggleClass('error', !!isError);
	}

	function setCaution(message)
	{
		Enchant.ui.find('.caution').text(message || '');
	}

	function showHoverOverlay(text, identified, target)
	{
		if (!Enchant.ui || !text)
		{
			return;
		}
		var overlay = Enchant.ui.find('.overlay');
		var uiOffset = Enchant.ui.offset();
		var targetOffset = target.offset();
		overlay.text(text);
		overlay.css({
			top: targetOffset.top - uiOffset.top,
			left: targetOffset.left - uiOffset.left + 35
		});
		overlay.toggleClass('grey', !identified);
		overlay.show();
	}

	function hideHoverOverlay()
	{
		if (!Enchant.ui)
		{
			return;
		}
		Enchant.ui.find('.overlay').hide();
	}

	function showItemInfo(item)
	{
		if (!item)
		{
			return false;
		}
		if (ItemInfo.uid === item.ITID)
		{
			ItemInfo.remove();
			return false;
		}
		ItemInfo.append();
		ItemInfo.uid = item.ITID;
		ItemInfo.setItem(item);
		return false;
	}

	function updateSubpageSkin()
	{
		if (!Enchant.ui)
		{
			return;
		}
		var target = Enchant.ui.find('.subpage');
		var skin = EnchantAssets.subpage.normal;
		if (EnchantState.action === 'upgrade' && EnchantAssets.subpage.upgrade)
		{
			skin = EnchantAssets.subpage.upgrade;
		}
		else if (EnchantState.action === 'reset' && EnchantAssets.subpage.reset)
		{
			skin = EnchantAssets.subpage.reset;
		}
		if (skin)
		{
			target.css('backgroundImage', 'url(' + skin + ')');
		}
	}

	function updateMenuSkin()
	{
		if (!Enchant.ui)
		{
			return;
		}
		var target = Enchant.ui.find('.action_tabs');
		var skin = EnchantAssets.menuTabs[EnchantState.action] || EnchantAssets.menuTabs.random;
		if (skin)
		{
			target.css('backgroundImage', 'url(' + skin + ')');
		}
	}

	function updateActionButtonSkin(button, enabled)
	{
		if (!button || !button.length)
		{
			return;
		}
		if (!EnchantAssets.actionButton.normal)
		{
			return;
		}
		if (!enabled && EnchantAssets.actionButton.disabled)
		{
			button.css('backgroundImage', 'url(' + EnchantAssets.actionButton.disabled + ')');
			return;
		}
		button.css('backgroundImage', 'url(' + EnchantAssets.actionButton.normal + ')');
	}

	function bindActionButtonSkin()
	{
		var button = Enchant.ui.find('.action_btn');
		button.off('.enchant_skin');
		button.on('mouseover.enchant_skin', function ()
		{
			if (!EnchantAssets.actionButton.hover || button.hasClass('disabled'))
			{
				return;
			}
			button.css('backgroundImage', 'url(' + EnchantAssets.actionButton.hover + ')');
		});
		button.on('mouseout.enchant_skin', function ()
		{
			if (button.hasClass('disabled'))
			{
				return;
			}
			button.css('backgroundImage', 'url(' + EnchantAssets.actionButton.normal + ')');
		});
		button.on('mousedown.enchant_skin', function ()
		{
			if (!EnchantAssets.actionButton.down || button.hasClass('disabled'))
			{
				return;
			}
			button.css('backgroundImage', 'url(' + EnchantAssets.actionButton.down + ')');
		});
		button.on('mouseup.enchant_skin', function ()
		{
			if (button.hasClass('disabled'))
			{
				return;
			}
			var skin = EnchantAssets.actionButton.hover || EnchantAssets.actionButton.normal;
			button.css('backgroundImage', 'url(' + skin + ')');
		});
	}

	function applyScrollSkin(up, down, bg, thumb)
	{
		if (!Enchant.ui || !Enchant.ui.length)
		{
			return;
		}
		var root = Enchant.ui[0];
		root.style.setProperty('--enchant-scroll-up', 'url(' + up + ')');
		root.style.setProperty('--enchant-scroll-down', 'url(' + down + ')');
		root.style.setProperty('--enchant-scroll-track', 'url(' + bg + ')');
		root.style.setProperty('--enchant-scroll-thumb', 'url(' + thumb + ')');
	}

	function ensureEffectOverlay()
	{
		if (EnchantEffectState.overlayNode)
		{
			return EnchantEffectState.overlayNode;
		}
		EnchantEffectState.overlayNode = jQuery('<div id="EnchantEffectOverlay"></div>').appendTo('body');
		return EnchantEffectState.overlayNode;
	}

	function getEffectAnchorPosition()
	{
		if (Camera && Camera.target && Camera.target.position)
		{
			return Camera.target.position;
		}
		if (Session.Entity && Session.Entity.position)
		{
			return Session.Entity.position;
		}
		return EnchantEffectState.fallbackPosition;
	}

	function ensureEffectRenderCallback()
	{
		if (EnchantEffectState.renderCallback)
		{
			return;
		}
		EnchantEffectState.renderCallback = function (tick, gl)
		{
			if (!EnchantEffectState.overlayActive && !EnchantEffectState.activeEffects.length)
			{
				return;
			}
			if (!gl)
			{
				return;
			}
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

			if (EnchantEffectState.overlayActive)
			{
				renderEffectOverlay(gl);
			}
			if (EnchantEffectState.activeEffects.length)
			{
				renderEnchantEffects(tick, gl);
			}
			else
			{
				stopEffectRenderIfIdle();
			}
		};
	}

	function ensureEffectRenderActive()
	{
		ensureEffectRenderCallback();
		if (EnchantEffectState.renderActive)
		{
			return;
		}
		Renderer.render(EnchantEffectState.renderCallback);
		EnchantEffectState.renderActive = true;
	}

	function stopEffectRenderIfIdle()
	{
		if (!EnchantEffectState.renderActive)
		{
			return;
		}
		if (EnchantEffectState.overlayActive || EnchantEffectState.activeEffects.length)
		{
			return;
		}
		Renderer.stop(EnchantEffectState.renderCallback);
		EnchantEffectState.renderActive = false;
	}

	function ensureOverlayProgram(gl)
	{
		if (EnchantEffectState.overlayProgram && EnchantEffectState.overlayBuffer)
		{
			return;
		}
		var vertexShader =
			'\
#version 300 es\n\
#pragma vscode_glsllint_stage : vert\n\
precision highp float;\n\
in vec2 aPosition;\n\
void main() {\n\
	gl_Position = vec4(aPosition, 0.0, 1.0);\n\
}\n';
		var fragmentShader =
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

	function renderEffectOverlay(gl)
	{
		ensureOverlayProgram(gl);
		var program = EnchantEffectState.overlayProgram;
		if (!program)
		{
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

	function renderEnchantEffects(tick, gl)
	{
		if (!EnchantEffectState.activeEffects.length)
		{
			return;
		}
		if (!StrEffect.ready)
		{
			StrEffect.init(gl);
		}
		gl.disable(gl.DEPTH_TEST);
		StrEffect.beforeRender(gl, Camera.modelView, Camera.projection, EnchantEffectFog, tick);
		var anchor = getEffectAnchorPosition();
		var remaining = [];
		EnchantEffectState.activeEffects.forEach(function (effect)
		{
			if (!effect)
			{
				return;
			}
			if (!effect.ready)
			{
				effect.init(gl);
			}
			effect.position = anchor;
			effect.render(gl, tick);
			if (!effect.needCleanUp)
			{
				remaining.push(effect);
			}
		});
		EnchantEffectState.activeEffects = remaining;
		StrEffect.afterRender(gl);
		gl.enable(gl.DEPTH_TEST);
		stopEffectRenderIfIdle();
	}

	function spawnEnchantEffect(effectId)
	{
		if (!effectId)
		{
			return;
		}
		var effectList = EffectDB[effectId];
		if (!effectList || !effectList.length)
		{
			return;
		}
		var anchor = getEffectAnchorPosition();
		var startTick = Renderer && Renderer.tick ? Renderer.tick : Date.now();
		effectList.forEach(function (effect)
		{
			if (!effect || effect.type !== 'STR' || !effect.file)
			{
				return;
			}
			var filename = 'data/texture/effect/' + effect.file + '.str';
			var texturePath = effect.texturePath || '';
			var strEffect = new StrEffect(filename, anchor, startTick, texturePath);
			EnchantEffectState.activeEffects.push(strEffect);
		});
		ensureEffectRenderActive();
	}

	function showEffectOverlay()
	{
		var overlay = ensureEffectOverlay();
		if (EnchantEffectState.overlayActive)
		{
			overlay.show();
			return;
		}
		overlay.show();
		EnchantEffectState.overlayActive = true;
		jQuery('body').addClass('enchant-effect-active');
		ensureEffectRenderActive();
	}

	function hideEffectOverlay()
	{
		if (EnchantEffectState.overlayTimer)
		{
			clearTimeout(EnchantEffectState.overlayTimer);
			EnchantEffectState.overlayTimer = null;
		}
		if (!EnchantEffectState.overlayActive)
		{
			return;
		}
		if (Renderer && Renderer.canvas && EnchantEffectState.canvasStyles)
		{
			Renderer.canvas.style.zIndex = EnchantEffectState.canvasStyles.zIndex;
			Renderer.canvas.style.opacity = EnchantEffectState.canvasStyles.opacity;
			Renderer.canvas.style.pointerEvents = EnchantEffectState.canvasStyles.pointerEvents;
		}
		if (EnchantEffectState.overlayNode)
		{
			EnchantEffectState.overlayNode.hide();
		}
		EnchantEffectState.overlayActive = false;
		jQuery('body').removeClass('enchant-effect-active');
		stopEffectRenderIfIdle();
	}

	function scheduleEffectOverlayHide(delay)
	{
		if (EnchantEffectState.overlayTimer)
		{
			clearTimeout(EnchantEffectState.overlayTimer);
		}
		var timeout = Math.max(Number(delay) || 0, 0);
		EnchantEffectState.overlayTimer = setTimeout(function ()
		{
			hideEffectOverlay();
		}, timeout);
	}

	function getEffectGroup(action)
	{
		if (action === 'upgrade')
		{
			return 'upgrade';
		}
		if (action === 'reset')
		{
			return 'reset';
		}
		return 'enchant';
	}

	function cacheEffectDuration(effectId)
	{
		if (Object.prototype.hasOwnProperty.call(EnchantEffectDurations, effectId))
		{
			return;
		}
		var effectList = EffectDB[effectId];
		if (!effectList || !effectList.length)
		{
			EnchantEffectDurations[effectId] = DEFAULT_INTRO_DURATION_MS;
			return;
		}
		var effect = effectList[0];
		if (!effect || effect.type !== 'STR' || !effect.file)
		{
			EnchantEffectDurations[effectId] = DEFAULT_INTRO_DURATION_MS;
			return;
		}
		var filename = 'data/texture/effect/' + effect.file + '.str';
		var texturePath = effect.texturePath || '';
		Client.loadFile(
			filename,
			function (strFile)
			{
				var duration = DEFAULT_INTRO_DURATION_MS;
				if (strFile && strFile.fps)
				{
					duration = Math.ceil((strFile.maxKey / strFile.fps) * 1000);
				}
				EnchantEffectDurations[effectId] = duration;
			},
			null,
			{ texturePath: texturePath }
		);
	}

	function preloadEnchantEffectDurations()
	{
		Object.keys(EnchantEffectGroups).forEach(function (key)
		{
			var group = EnchantEffectGroups[key];
			cacheEffectDuration(group.intro);
			cacheEffectDuration(group.success);
			cacheEffectDuration(group.fail);
		});
	}

	function getEffectDuration(effectId)
	{
		return EnchantEffectDurations[effectId] || DEFAULT_INTRO_DURATION_MS;
	}

	function playEffect(effectId)
	{
		if (!effectId)
		{
			return;
		}
		spawnEnchantEffect(effectId);
	}

	function playIntroEffect(action)
	{
		var group = getEffectGroup(action);
		var effects = EnchantEffectGroups[group];
		if (!effects || !effects.intro)
		{
			return;
		}
		if (EnchantEffectState.resultTimer)
		{
			clearTimeout(EnchantEffectState.resultTimer);
			EnchantEffectState.resultTimer = null;
		}
		showEffectOverlay();
		cacheEffectDuration(effects.intro);
		playEffect(effects.intro);
		EnchantEffectState.introEndAt = Date.now() + getEffectDuration(effects.intro);
		scheduleEffectOverlayHide(getEffectDuration(effects.intro) + DEFAULT_INTRO_DURATION_MS);
	}

	function playResultEffect(action, success)
	{
		var group = getEffectGroup(action);
		var effects = EnchantEffectGroups[group];
		if (!effects)
		{
			return;
		}
		var effectId = success ? effects.success : effects.fail;
		if (!effectId)
		{
			return;
		}
		cacheEffectDuration(effectId);
		var delay = Math.max(EnchantEffectState.introEndAt - Date.now(), 0);
		if (EnchantEffectState.resultTimer)
		{
			clearTimeout(EnchantEffectState.resultTimer);
		}
		if (delay > 0)
		{
			EnchantEffectState.resultTimer = setTimeout(function ()
			{
				playEffect(effectId);
			}, delay);
		}
		else
		{
			playEffect(effectId);
			EnchantEffectState.resultTimer = null;
		}
		scheduleEffectOverlayHide(delay + getEffectDuration(effectId));
		EnchantEffectState.introEndAt = 0;
	}

	function loadItemIcon(target, itemId, isIdentified)
	{
		var it = DB.getItemInfo(itemId);
		if (!it)
		{
			return;
		}
		var name = isIdentified !== false ? it.identifiedResourceName : it.unidentifiedResourceName;
		if (!name)
		{
			return;
		}
		Client.loadFile(DB.INTERFACE_PATH + 'item/' + name + '.bmp', function (data)
		{
			target.css('backgroundImage', 'url(' + data + ')');
		});
	}

	function loadItemCollection(target, itemId, isIdentified)
	{
		var it = DB.getItemInfo(itemId);
		if (!it)
		{
			return;
		}
		var name = isIdentified !== false ? it.identifiedResourceName : it.unidentifiedResourceName;
		if (!name)
		{
			return;
		}
		Client.loadFile(
			DB.INTERFACE_PATH + 'collection/' + name + '.bmp',
			function (data)
			{
				target.css('backgroundImage', 'url(' + data + ')');
			},
			function ()
			{
				loadItemIcon(target, itemId, isIdentified);
			}
		);
	}

	function loadGradeIcon(target, grade)
	{
		if (!target || !target.length)
		{
			return;
		}
		if (!grade || grade <= 0)
		{
			target.css('backgroundImage', '');
			return;
		}
		Client.loadFile(DB.INTERFACE_PATH + 'grade_enchant/grade_icon' + grade + '.bmp', function (data)
		{
			target.css('backgroundImage', 'url(' + data + ')');
		});
	}

	function getItemDisplayName(itemId, fallback)
	{
		var info = DB.getItemInfo(itemId);
		if (info && info.identifiedDisplayName)
		{
			return info.identifiedDisplayName;
		}
		return fallback || 'Unknown';
	}

	function resolveMaterialId(material)
	{
		if (material && material.id)
		{
			return material.id;
		}
		if (material && material.base)
		{
			return DB.getItemIdfromBase(material.base) || 0;
		}
		return 0;
	}

	function hasEnoughZeny(zeny)
	{
		var cost = Number(zeny) || 0;
		if (cost <= 0)
		{
			return true;
		}
		return Session.zeny >= cost;
	}

	function hasEnoughMaterials(materials)
	{
		if (!materials || !materials.length)
		{
			return true;
		}
		var inventoryUI = Inventory.getUI && Inventory.getUI();
		if (!inventoryUI || !inventoryUI.getItemById)
		{
			return false;
		}
		for (var i = 0; i < materials.length; i++)
		{
			var mat = materials[i];
			var required = Number(mat.count) || 0;
			if (required <= 0)
			{
				continue;
			}
			var matId = resolveMaterialId(mat);
			if (!matId)
			{
				return false;
			}
			var inventoryItem = inventoryUI.getItemById(matId);
			var current = inventoryItem ? inventoryItem.count : 0;
			if (current < required)
			{
				return false;
			}
		}
		return true;
	}

	function canAffordCost(zeny, materials)
	{
		return hasEnoughZeny(zeny) && hasEnoughMaterials(materials);
	}

	function renderMaterials(materials)
	{
		var list = Enchant.ui.find('.material_list');
		list.empty();
		if (!materials || !materials.length)
		{
			return;
		}
		var inventoryUI = Inventory.getUI && Inventory.getUI();
		materials.forEach(function (mat)
		{
			var entry = jQuery('<div class="material"></div>');
			var icon = jQuery('<div class="icon"></div>');
			var name = jQuery('<div class="name"></div>');
			var count = jQuery('<div class="count"></div>');
			var matId = resolveMaterialId(mat);
			var label = matId ? getItemDisplayName(matId, mat.base) : mat.base || 'Unknown';
			var current = 0;
			var required = Number(mat.count) || 0;
			if (matId && inventoryUI && inventoryUI.getItemById)
			{
				var inventoryItem = inventoryUI.getItemById(matId);
				current = inventoryItem ? inventoryItem.count : 0;
			}
			name.text(label);
			if (mat.count != null)
			{
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
			if (matId)
			{
				icon.attr('data-itid', matId);
				loadItemIcon(icon, matId, true);
			}
		});
	}

	function renderEnchantList(entries, selectedKey)
	{
		var list = Enchant.ui.find('.enchant_list');
		list.empty();
		if (!entries || !entries.length)
		{
			return;
		}
		entries.forEach(function (entry)
		{
			var row = jQuery('<div class="enchant_entry"></div>');
			var icon = jQuery('<div class="entry_icon"></div>');
			var text = jQuery('<div class="entry_text"></div>');
			var name = jQuery('<div class="entry_name"></div>');
			var itid = entry.id || (entry.base ? DB.getItemIdfromBase(entry.base) : 0);
			name.text(entry.label || '');
			text.append(name);
			if (entry.subLabel)
			{
				var sub = jQuery('<div class="entry_sub"></div>');
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
			if (itid)
			{
				loadItemIcon(icon, itid, true);
			}
		});
	}

	function renderItemList()
	{
		var list = Enchant.ui.find('.item_list');
		list.empty();

		if (!EnchantState.group)
		{
			list.append('<div class="item_list_empty">Enchant data missing.</div>');
			return;
		}

		var inventoryUI = Inventory.getUI && Inventory.getUI();
		var items = inventoryUI && inventoryUI.list ? inventoryUI.list : [];
		var selectedIndex = EnchantState.item ? EnchantState.item.index : 0;
		var selectedValid = false;
		var candidates = [];

		items.forEach(function (item)
		{
			var result = validateItem(item);
			if (!result.ok)
			{
				return;
			}
			candidates.push(item);
			if (selectedIndex && item.index === selectedIndex)
			{
				selectedValid = true;
			}
		});

		if (selectedIndex && !selectedValid)
		{
			EnchantState.item = null;
			EnchantState.itemIndex = 0;
			EnchantState.selectedPerfect = null;
			EnchantState.selectedSlot = null;
			EnchantState.selectedUpgradeSlot = null;
			selectedIndex = 0;
		}

		if (!candidates.length)
		{
			list.append('<div class="item_list_empty">No enchantable items.</div>');
			return;
		}

		candidates.forEach(function (item)
		{
			var entry = jQuery('<button class="item_entry"></button>');
			var slot = jQuery('<div class="item_slot"></div>');
			var info = jQuery('<div class="item_info"></div>');
			var name = jQuery('<div class="item_name"></div>');
			var grade = jQuery('<div class="item_grade"></div>');
			var itemName = DB.getItemName(item, {
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

	function renderItemPreview()
	{
		var preview = Enchant.ui.find('.preview_item');
		preview.css('backgroundImage', '');
		if (!EnchantState.item)
		{
			return;
		}
		loadItemCollection(preview, EnchantState.item.ITID, EnchantState.item.IsIdentified);
	}

	function renderSlots()
	{
		var list = Enchant.ui.find('.slot_list');
		var empty = list.find('.slot_empty');
		if (!empty.length)
		{
			empty = jQuery('<div class="slot_empty">Select an item</div>');
			list.append(empty);
		}
		var hasItem = !!(EnchantState.item && EnchantState.group);
		empty.toggle(!hasItem);

		var baseSlots = hasItem ? getBaseSlotCount(EnchantState.item) : 0;
		list.find('.slot_entry').each(function ()
		{
			var entry = jQuery(this);
			var slotNum = parseInt(entry.attr('data-slot'), 10);
			var icon = entry.find('.slot_icon');
			var slotItem = hasItem ? getSlotValue(EnchantState.item, slotNum) : 0;
			entry.toggleClass('locked', hasItem && slotNum < baseSlots);
			entry.toggleClass('active', hasItem && slotNum === EnchantState.selectedSlot);
			entry.toggleClass('empty', !slotItem);
			entry.attr('data-itid', slotItem || 0);
			icon.css('backgroundImage', '');
			if (slotItem)
			{
				loadItemIcon(icon, slotItem, true);
			}
		});
	}

	function updateTabs(availability)
	{
		Enchant.ui.find('.action_tabs .tab').each(function ()
		{
			var action = this.dataset.action;
			jQuery(this).toggleClass('active', EnchantState.action === action);
			jQuery(this).toggleClass('disabled', availability && availability[action] === false);
		});
		updateSubpageSkin();
		updateMenuSkin();
	}

	function updateActionSections()
	{
		Enchant.ui.find('.action_section').removeClass('active');
		Enchant.ui.find('.' + EnchantState.action + '_section').addClass('active');
	}

	function updateActionButton(enabled)
	{
		var button = Enchant.ui.find('.action_btn');
		var label = EnchantState.action === 'reset' ? 'Reset' : 'Enchant';
		button.text('');
		button.attr('title', label);
		button.toggleClass('disabled', !enabled);
		updateActionButtonSkin(button, enabled);
	}

	function renderCosts(rate, zeny, materials)
	{
		var zenyText = zeny != null ? formatZeny(zeny) : '';
		Enchant.ui.find('.zeny_cost').text(zenyText);
		renderMaterials(materials);
	}

	function refreshActionContent()
	{
		var group = EnchantState.group;
		var item = EnchantState.item;
		var actionReady = false;
		var availability = {
			random: false,
			perfect: false,
			upgrade: false,
			reset: false
		};
		var listEntries = [];
		var selectedKey = null;

		Enchant.ui.find('.upgrade_result').text('');

		if (group && item)
		{
			var slotNum = getNextEnchantSlot(item, group);
			var slotData = slotNum !== null ? group.slots[slotNum] : null;
			var baseSlots = getBaseSlotCount(item);

			if (slotData && slotData.random && Object.keys(slotData.random).length)
			{
				availability.random = true;
			}
			if (slotData && slotData.perfect && Object.keys(slotData.perfect).length)
			{
				availability.perfect = true;
			}

			var upgradeCandidates = getUpgradeCandidates(item, group);
			if (upgradeCandidates.length)
			{
				availability.upgrade = true;
			}

			var hasEnchant = false;
			var slotOrder = group.slotOrder && group.slotOrder.length ? group.slotOrder : [0, 1, 2, 3];
			slotOrder.forEach(function (orderSlot)
			{
				if (orderSlot >= baseSlots && getSlotValue(item, orderSlot))
				{
					hasEnchant = true;
				}
			});
			if (group.reset && group.reset.enabled && hasEnchant)
			{
				availability.reset = true;
			}

			if (!availability[EnchantState.action])
			{
				var nextAction = Object.keys(availability).find(function (key)
				{
					return availability[key];
				});
				EnchantState.action = nextAction || EnchantState.action;
			}

			updateTabs(availability);
			updateActionSections();

			if (EnchantState.action === 'random')
			{
				EnchantState.selectedSlot = slotNum;
				if (slotData)
				{
					var grade = getItemGrade(item);
					var bonus = slotData.gradeBonus ? slotData.gradeBonus[grade] || 0 : 0;
					var baseRate = slotData.successRate || 0;
					var totalRate = Math.min(baseRate + bonus, 100000);
					var require = slotData.require || { zeny: 0, materials: [] };
					renderCosts(totalRate, require.zeny, require.materials);
					actionReady = availability.random && canAffordCost(require.zeny, require.materials);
					if (slotData.random)
					{
						var randomList = slotData.random[grade] || slotData.random[0] || [];
						listEntries = randomList.map(function (entry)
						{
							var label = entry.id ? getItemDisplayName(entry.id, entry.base) : entry.base;
							return {
								key: entry.id || entry.base || label,
								id: entry.id,
								base: entry.base,
								label: label,
								disabled: true
							};
						});
					}
				}
				else
				{
					renderCosts(null, 0, []);
				}
			}

			if (EnchantState.action === 'perfect')
			{
				EnchantState.selectedSlot = slotNum;
				var select = Enchant.ui.find('.perfect_select');
				select.empty();
				var perfectEntries = [];
				if (slotData && slotData.perfect)
				{
					var perfectList = Object.keys(slotData.perfect);
					perfectList.forEach(function (key)
					{
						var entry = slotData.perfect[key];
						var label = entry.id ? getItemDisplayName(entry.id, entry.base) : entry.base;
						select.append('<option value="' + key + '">' + label + '</option>');
						perfectEntries.push({
							key: key,
							id: entry.id,
							base: entry.base,
							label: label
						});
					});
					if (perfectList.length)
					{
						if (EnchantState.selectedPerfect && slotData.perfect[EnchantState.selectedPerfect])
						{
							select.val(EnchantState.selectedPerfect);
							var selected = slotData.perfect[EnchantState.selectedPerfect];
							renderCosts(100000, selected.zeny, selected.materials);
							actionReady = availability.perfect && canAffordCost(selected.zeny, selected.materials);
							selectedKey = EnchantState.selectedPerfect;
						}
						else
						{
							EnchantState.selectedPerfect = null;
							select.prop('selectedIndex', -1);
							renderCosts(null, 0, []);
						}
					}
					else
					{
						renderCosts(null, 0, []);
					}
				}
				else
				{
					renderCosts(null, 0, []);
				}
				listEntries = perfectEntries;
			}

			if (EnchantState.action === 'upgrade')
			{
				var upgradeSelect = Enchant.ui.find('.upgrade_select');
				upgradeSelect.empty();
				var upgradeEntries = [];
				if (upgradeCandidates.length)
				{
					upgradeCandidates.forEach(function (candidate)
					{
						var currentName = getItemDisplayName(candidate.currentId, candidate.baseName);
						var resultId = candidate.entry.result
							? candidate.entry.result.id || DB.getItemIdfromBase(candidate.entry.result.base)
							: 0;
						var resultName = resultId
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
						!upgradeCandidates.find(function (candidate)
						{
							return candidate.slotNum === EnchantState.selectedUpgradeSlot;
						})
					)
					{
						EnchantState.selectedUpgradeSlot = upgradeCandidates[0].slotNum;
					}
					upgradeSelect.val(EnchantState.selectedUpgradeSlot);
					var selectedEntry = upgradeCandidates.find(function (candidate)
					{
						return candidate.slotNum === EnchantState.selectedUpgradeSlot;
					});
					if (selectedEntry)
					{
						EnchantState.selectedSlot = selectedEntry.slotNum;
						Enchant.ui
							.find('.upgrade_result')
							.text('Result: ' + (selectedEntry.entry.result ? selectedEntry.entry.result.base : ''));
						renderCosts(100000, selectedEntry.entry.zeny, selectedEntry.entry.materials);
						actionReady =
							availability.upgrade &&
							canAffordCost(selectedEntry.entry.zeny, selectedEntry.entry.materials);
						selectedKey = String(EnchantState.selectedUpgradeSlot);
					}
				}
				else
				{
					renderCosts(null, 0, []);
				}
				listEntries = upgradeEntries;
			}

			if (EnchantState.action === 'reset')
			{
				EnchantState.selectedSlot = null;
				if (availability.reset)
				{
					renderCosts(group.reset.rate, group.reset.zeny, group.reset.materials);
					actionReady = canAffordCost(group.reset.zeny, group.reset.materials);
				}
				else
				{
					renderCosts(null, 0, []);
				}
			}
		}
		else
		{
			updateTabs(availability);
			updateActionSections();
			renderCosts(null, 0, []);
		}

		renderEnchantList(listEntries, selectedKey);
		updateActionButton(actionReady);
	}

	function refreshUI()
	{
		renderItemList();
		renderItemPreview();
		refreshActionContent();
		renderSlots();
		setCaution(EnchantState.group ? EnchantState.group.caution : '');
	}

	function validateItem(item)
	{
		if (!EnchantState.group)
		{
			return { ok: false, message: 'Enchant data missing for this group.' };
		}
		if (!item)
		{
			return { ok: false, message: 'Invalid item.' };
		}
		if (item.WearState)
		{
			return { ok: false, message: 'Item must be in inventory.' };
		}
		if ((item.equipSwitch && item.equipSwitch > 0) || (item.EquipSwitch && item.EquipSwitch > 0))
		{
			return { ok: false, message: 'Item cannot be in equipment switch.' };
		}
		if (item.attribute && item.attribute !== 0)
		{
			return { ok: false, message: 'Item attribute must be normal.' };
		}
		if (!isTargetItem(item, EnchantState.group))
		{
			return { ok: false, message: 'Item is not valid for this enchant group.' };
		}
		var refine = item.RefiningLevel || item.refiningLevel || 0;
		if (refine < EnchantState.group.condition.minRefine)
		{
			return { ok: false, message: 'Refine level too low.' };
		}
		var grade = getItemGrade(item);
		if (grade < EnchantState.group.condition.minGrade)
		{
			return { ok: false, message: 'Enchant grade too low.' };
		}
		if (!EnchantState.group.allowRandomOption && hasRandomOptions(item))
		{
			return { ok: false, message: 'Random options not allowed.' };
		}
		return { ok: true };
	}

	function getInventoryItemByIndex(index)
	{
		var inventoryUI = Inventory.getUI && Inventory.getUI();
		return inventoryUI && inventoryUI.getItemByIndex ? inventoryUI.getItemByIndex(index) : null;
	}

	function resolveItemContext(target)
	{
		var node = jQuery(target);
		var slotEntry = node.closest('.slot_entry');
		if (slotEntry.length)
		{
			if (!EnchantState.item)
			{
				return null;
			}
			var slotNum = parseInt(slotEntry.attr('data-slot'), 10);
			if (isNaN(slotNum))
			{
				return null;
			}
			var slotItemId = getSlotValue(EnchantState.item, slotNum);
			if (!slotItemId)
			{
				return null;
			}
			return {
				item: { ITID: slotItemId, IsIdentified: 1 },
				label: '',
				identified: true,
				anchor: slotEntry
			};
		}

		var itemEntry = node.closest('.item_entry');
		if (itemEntry.length)
		{
			var index = parseInt(itemEntry.attr('data-index'), 10);
			var invItem = !isNaN(index) ? getInventoryItemByIndex(index) : null;
			if (!invItem)
			{
				var itemId = parseInt(node.attr('data-itid'), 10);
				if (!isNaN(itemId) && itemId)
				{
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

		var materialIcon = node.closest('.material .icon');
		if (materialIcon.length)
		{
			var matId = parseInt(materialIcon.attr('data-itid'), 10);
			var matItem = !isNaN(matId) && matId ? { ITID: matId, IsIdentified: 1 } : null;
			return {
				item: matItem,
				label: materialIcon.attr('data-name') || '',
				identified: true,
				anchor: materialIcon
			};
		}

		var enchantEntry = node.closest('.enchant_entry');
		if (enchantEntry.length)
		{
			var enchantId = parseInt(enchantEntry.attr('data-itid'), 10);
			var enchantItem = !isNaN(enchantId) && enchantId ? { ITID: enchantId, IsIdentified: 1 } : null;
			return {
				item: enchantItem,
				label: enchantEntry.attr('data-name') || '',
				identified: true,
				anchor: node
			};
		}

		return null;
	}

	function onIconOver(event)
	{
		var context = resolveItemContext(event.currentTarget);
		if (!context)
		{
			return;
		}
		var label = context.label;
		if (context.item)
		{
			label = DB.getItemName(context.item, { showItemOptions: false });
		}
		if (!label)
		{
			return;
		}
		showHoverOverlay(label, context.identified, context.anchor || jQuery(event.currentTarget));
	}

	function onIconOut()
	{
		hideHoverOverlay();
	}

	function onIconInfo(event)
	{
		event.preventDefault();
		event.stopImmediatePropagation();
		var context = resolveItemContext(event.currentTarget);
		if (context && context.item)
		{
			showItemInfo(context.item);
		}
		return false;
	}

	function onActionSelect(event)
	{
		var action = event.currentTarget.dataset.action;
		if (jQuery(event.currentTarget).hasClass('disabled'))
		{
			return;
		}
		EnchantState.action = action;
		refreshUI();
	}

	function onPerfectChange()
	{
		EnchantState.selectedPerfect = this.value;
		refreshUI();
	}

	function onUpgradeChange()
	{
		EnchantState.selectedUpgradeSlot = parseInt(this.value, 10);
		refreshUI();
	}

	function onEnchantListSelect(event)
	{
		var entry = jQuery(event.currentTarget);
		if (entry.hasClass('disabled'))
		{
			return;
		}
		var key = entry.attr('data-key');
		if (EnchantState.action === 'perfect')
		{
			EnchantState.selectedPerfect = key;
			refreshUI();
			return;
		}
		if (EnchantState.action === 'upgrade')
		{
			var slotNum = parseInt(key, 10);
			if (!isNaN(slotNum))
			{
				EnchantState.selectedUpgradeSlot = slotNum;
				refreshUI();
			}
		}
	}

	function onItemSelect(event)
	{
		var entry = jQuery(event.currentTarget);
		var index = parseInt(entry.attr('data-index'), 10);
		if (isNaN(index))
		{
			return;
		}
		var inventoryUI = Inventory.getUI && Inventory.getUI();
		var item = inventoryUI && inventoryUI.getItemByIndex ? inventoryUI.getItemByIndex(index) : null;
		if (!item)
		{
			return;
		}
		Enchant.onRequestItemEnchant(item);
	}

	function onRequestAction()
	{
		if (Enchant.ui.find('.action_btn').hasClass('disabled'))
		{
			return;
		}
		if (!EnchantState.group || !EnchantState.item)
		{
			setStatus('Select an item first.', true);
			return;
		}
		var pkt;
		var slotNum = EnchantState.selectedSlot;
		var itemIndex = EnchantState.itemIndex;

		if (EnchantState.action === 'random')
		{
			if (slotNum === null)
			{
				setStatus('No available enchant slot.', true);
				return;
			}
			pkt = new PACKET.CZ.REQUEST_RANDOM_ENCHANT();
			pkt.enchant_group = EnchantState.groupId;
			pkt.index = itemIndex;
		}
		else if (EnchantState.action === 'perfect')
		{
			if (slotNum === null || !EnchantState.selectedPerfect)
			{
				setStatus('Select a perfect enchant.', true);
				return;
			}
			var slotData = EnchantState.group.slots[slotNum];
			var perfectEntry = slotData ? slotData.perfect[EnchantState.selectedPerfect] : null;
			var perfectId = perfectEntry ? perfectEntry.id || DB.getItemIdfromBase(perfectEntry.base) : 0;
			if (!perfectEntry || !perfectId)
			{
				setStatus('Invalid perfect enchant selection.', true);
				return;
			}
			pkt = new PACKET.CZ.REQUEST_PERFECT_ENCHANT();
			pkt.enchant_group = EnchantState.groupId;
			pkt.index = itemIndex;
			pkt.ITID = perfectId;
		}
		else if (EnchantState.action === 'upgrade')
		{
			if (slotNum === null)
			{
				setStatus('Select an upgrade slot.', true);
				return;
			}
			pkt = new PACKET.CZ.REQUEST_UPGRADE_ENCHANT();
			pkt.enchant_group = EnchantState.groupId;
			pkt.index = itemIndex;
			pkt.slot = slotNum;
		}
		else if (EnchantState.action === 'reset')
		{
			pkt = new PACKET.CZ.REQUEST_RESET_ENCHANT();
			pkt.enchant_group = EnchantState.groupId;
			pkt.index = itemIndex;
		}

		if (!pkt)
		{
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

	function applyEnchantResult(item, action, slotNum, itid)
	{
		if (!item)
		{
			return;
		}
		if (action === 'reset')
		{
			var baseSlots = getBaseSlotCount(item);
			var slotOrder =
				EnchantState.group && EnchantState.group.slotOrder && EnchantState.group.slotOrder.length
					? EnchantState.group.slotOrder
					: [0, 1, 2, 3];
			slotOrder.forEach(function (orderSlot)
			{
				if (orderSlot >= baseSlots)
				{
					setSlotValue(item, orderSlot, 0);
				}
			});
			return;
		}
		if (slotNum !== null && itid)
		{
			setSlotValue(item, slotNum, itid);
		}
	}

	function onEnchantResult(pkt)
	{
		if (!EnchantState.pending)
		{
			return;
		}
		var message = DB.getMessage(pkt.msgId) || 'Enchant result: ' + pkt.msgId;
		var isSuccess = pkt.msgId === 3857;
		ChatBox.addText(message, ChatBox.TYPE.BLUE, ChatBox.FILTER.PUBLIC_LOG);
		playResultEffect(EnchantState.pending.action, isSuccess);
		if (isSuccess)
		{
			applyEnchantResult(
				EnchantState.pending.item,
				EnchantState.pending.action,
				EnchantState.pending.slot,
				pkt.ITID
			);
			if (ItemInfo.ui && ItemInfo.ui.is(':visible') && ItemInfo.uid === EnchantState.pending.item.ITID)
			{
				ItemInfo.setItem(EnchantState.pending.item);
			}
		}
		Enchant.remove();
	}

	function onRequestClose()
	{
		if (EnchantState.pendingLock)
		{
			setStatus('Request in progress...', false);
			return;
		}
		if (PACKETVER.value >= 20211103)
		{
			var pkt = new PACKET.CZ.CLOSE_UI_ENCHANT();
			Network.sendPacket(pkt);
		}
		Enchant.remove();
	}

	Enchant.onKeyDown = function onKeyDown(event)
	{
		if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && Enchant.ui.is(':visible'))
		{
			onRequestClose();
		}
	};

	Enchant.init = function init()
	{
		this.ui.css({ top: 200, left: 360 });
		this.draggable(this.ui.find('.titlebar'));
		preloadEnchantEffectDurations();

		Client.loadFiles(
			[
				DB.INTERFACE_PATH + 'enchantui/bg_subpage.bmp',
				DB.INTERFACE_PATH + 'enchantui/bg_subpageb.bmp',
				DB.INTERFACE_PATH + 'enchantui/bg_subpagey.bmp'
			],
			function (normal, upgrade, reset)
			{
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
			function (menu0, menu1, menu2, menu3)
			{
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
			function (normal, hover, down, disabled)
			{
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

	Enchant.onAppend = function onAppend()
	{
		setStatus('', false);
		refreshUI();
	};

	Enchant.onRemove = function onRemove()
	{
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

	Enchant.onOpenEnchantUI = function onOpenEnchantUI(groupId)
	{
		clearState();
		EnchantState.groupId = Number(groupId);
		EnchantState.group = DB.getEnchantGroup(EnchantState.groupId);
		if (!EnchantState.group)
		{
			UIManager.showErrorBox('Enchant data missing for group ' + groupId + '.');
		}
		Enchant.append();
		Enchant.ui.show();
		Enchant.ui.focus();
		refreshUI();
	};

	Enchant.onRequestItemEnchant = function onRequestItemEnchant(item)
	{
		var result = validateItem(item);
		if (!result.ok)
		{
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

	Enchant.isEnchantOpen = function isEnchantOpen()
	{
		return Enchant.ui && Enchant.ui.is(':visible');
	};

	Network.hookPacket(PACKET.ZC.RESPONSE_ENCHANT, onEnchantResult);

	return UIManager.addComponent(Enchant);
});
