/**
 * UI/Components/ItemPreview/ItemPreview.js
 *
 * Item preview window (costume/hat)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */
define(function(require)
{
	'use strict';


	/**
	 * Dependencies
	 */
	var DB                 = require('DB/DBManager');
	var EquipLocation      = require('DB/Items/EquipmentLocation');
	var Renderer           = require('Renderer/Renderer');
	var SpriteRenderer     = require('Renderer/SpriteRenderer');
	var Camera             = require('Renderer/Camera');
	var Session            = require('Engine/SessionStorage');
	var UIManager          = require('UI/UIManager');
	var UIComponent        = require('UI/UIComponent');
	var htmlText           = require('text!./ItemPreview.html');
	var cssText            = require('text!./ItemPreview.css');
	var getModule          = require;


	/**
	 * Create Component
	 */
	var ItemPreview = new UIComponent('ItemPreview', htmlText, cssText);

	/**
	 * @var {CanvasRenderingContext2D}
	 */
	var _ctx;

	/**
	 * @var {number} direction
	 */
	var _direction = 0;

	/**
	 * @var {number} preview location bitmask
	 */
	var _previewLocation = 0;

	/**
	 * @var {number} preview sprite id
	 */
	var _previewSpriteId = 0;

	/**
	 * @var {boolean} render state
	 */
	var _rendering = false;

	/**
	 * @var {number} ItemPreview unique id
	 */
	ItemPreview.uid = -1;

	var _remove = false;

	/**
	 * Initialize UI
	 */
	ItemPreview.init = function init()
	{
		this.ui.css({ top: 200, left: 520 });
		_ctx = this.ui.find('canvas')[0].getContext('2d');

		this.ui.find('.close').click(function(){
			ItemPreview.remove();
		});

		this.ui.find('.rot_left').click(function(event){
			event.stopImmediatePropagation();
			rotatePreview(1);
		});

		this.ui.find('.rot_right').click(function(event){
			event.stopImmediatePropagation();
			rotatePreview(-1);
		});

		this.ui.find('.reset').click(function(event){
			event.stopImmediatePropagation();
			resetPreview();
		});

		this.draggable(this.ui.find('.titlebar'));
	};


	/**
	 * Once append
	 */
	ItemPreview.onAppend = function onAppend()
	{
		var ItemInfo = getModule('UI/Components/ItemInfo/ItemInfo');

		if (ItemInfo.ui) {
			var itemInfoPosition = ItemInfo.ui.offset();
			var itemInfoWidth = ItemInfo.ui.outerWidth();
			var left = itemInfoPosition.left + itemInfoWidth + 10;
			var top = itemInfoPosition.top;

			if (left + this.ui.outerWidth() > Renderer.width) {
				left = Math.max(0, itemInfoPosition.left - this.ui.outerWidth() - 10);
			}

			if (top + this.ui.outerHeight() > Renderer.height) {
				top = Math.max(0, Renderer.height - this.ui.outerHeight());
			}

			this.ui.css({
				top: top || 200,
				left: left || 200
			});
		}

		if (!_rendering) {
			Renderer.render(renderPreview);
			_rendering = true;
		}
	};


	/**
	 * Once removed from html
	 */
	ItemPreview.onRemove = function onRemove()
	{
		this.uid = -1;
		_previewLocation = 0;
		_previewSpriteId = 0;
		_direction = 0;

		if (_rendering) {
			Renderer.stop(renderPreview);
			_rendering = false;
		}
	};


	/**
	 * Bind component
	 *
	 * @param {object} item
	 */
	ItemPreview.setItem = function setItem(item)
	{
		var it = DB.getItemInfo(item.ITID);

		this.item = item;
		_previewLocation = getItemLocation(item);
		_previewSpriteId = getPreviewSpriteId(item, it);
		_direction = 0;
	};


	/**
	 * Rotate preview direction
	 *
	 * @param {number} delta
	 */
	function rotatePreview(delta)
	{
		_direction = (_direction + delta + 8) % 8;
	}


	/**
	 * Reset preview direction
	 */
	function resetPreview()
	{
		_remove = !_remove;
		_direction = 0;
	}


	/**
	 * Get preview item location
	 *
	 * @param {object} item
	 * @returns {number}
	 */
	function getItemLocation(item)
	{
		if (!item) {
			return 0;
		}

		if ('location' in item) {
			return item.location;
		}

		if ('WearState' in item) {
			return item.WearState;
		}

		if ('WearLocation' in item) {
			return item.WearLocation;
		}

		return 0;
	}


	/**
	 * Get preview sprite id
	 *
	 * @param {object} item
	 * @param {object} it
	 * @returns {number}
	 */
	function getPreviewSpriteId(item, it)
	{
		if (item && item.wItemSpriteNumber) {
			return item.wItemSpriteNumber;
		}

		if (it && it.ClassNum) {
			return it.ClassNum;
		}

		return 0;
	}


	/**
	 * Rendering character
	 */
	var renderPreview = function renderPreviewClosure()
	{
		var _cleanColor = new Float32Array([1.0, 1.0, 1.0, 1.0]);
		var _savedColor = new Float32Array(4);
		var _animation  = {
			tick:  0,
			frame: 0,
			repeat:true,
			play:  true,
			next:  false,
			delay: 0,
			save:  false
		};

		return function renderPreview()
		{
			if (!_ctx) {
				return;
			}

			_ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);

			if (!_previewSpriteId || !_previewLocation || !Session.Entity) {
				return;
			}

			var Entity = getModule('Renderer/Entity/Entity');
			var previewCharacter = new Entity();
			previewCharacter.set({
				GID: Session.Entity.GID + '_PREVIEW',
				objecttype: previewCharacter.constructor.TYPE_PC,
				job: Session.Entity.job,
				sex: Session.Entity.sex,
				name: '',
				hideShadow: true,
				head:   Session.Entity.head,
				headpalette: Session.Entity.headpalette,
				bodypalette: Session.Entity.bodypalette,
				accessory: Session.Entity.accessory,
				accessory2: Session.Entity.accessory2,
				accessory3: Session.Entity.accessory3,
				robe: Session.Entity.robe,
			});

			if(!_remove)
				applyPreviewItem(previewCharacter);

			_savedColor.set(previewCharacter.effectColor);
			previewCharacter.effectColor.set(_cleanColor);

			// Set action
			Camera.direction = 0;
			previewCharacter.direction = _direction;
			previewCharacter.headDir   = 0;
			previewCharacter.action    = previewCharacter.ACTION.IDLE;
			previewCharacter.animation = _animation;

			SpriteRenderer.bind2DContext(
				_ctx,
				Math.floor(_ctx.canvas.width / 2),
				_ctx.canvas.height
			);
			previewCharacter.renderEntity(_ctx);
			previewCharacter.effectColor.set(_savedColor);
		};
	}();

	/**
	 * Apply preview item to entity
	 *
	 * @param {object} entity
	 */
	function applyPreviewItem(entity)
	{
		if (_previewLocation & EquipLocation.HEAD_BOTTOM) {
			entity.accessory = _previewSpriteId;
		}
		if (_previewLocation & EquipLocation.HEAD_MID) {
			entity.accessory3 = _previewSpriteId;
		}
		if (_previewLocation & EquipLocation.HEAD_TOP) {
			entity.accessory2 = _previewSpriteId;
		}

		if (_previewLocation & EquipLocation.COSTUME_HEAD_BOTTOM) {
			entity.accessory = _previewSpriteId;
		}
		if (_previewLocation & EquipLocation.COSTUME_HEAD_MID) {
			entity.accessory3 = _previewSpriteId;
		}
		if (_previewLocation & EquipLocation.COSTUME_HEAD_TOP) {
			entity.accessory2 = _previewSpriteId;
		}

		if (_previewLocation & EquipLocation.COSTUME_ROBE) {
			entity.robe = _previewSpriteId;
		}
	}


	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(ItemPreview);
});
