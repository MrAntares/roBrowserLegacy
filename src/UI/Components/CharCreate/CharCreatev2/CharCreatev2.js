/**
 * UI/Components/CharCreatev2v2/CharCreatev2v2.js
 *
 * Chararacter Creation windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require)
{
	'use strict';

	/**
	 * Dependencies
	 */
	var Renderer = require('Renderer/Renderer');
	var KEYS = require('Controls/KeyEventHandler');
	var Entity = require('Renderer/Entity/Entity');
	var SpriteRenderer = require('Renderer/SpriteRenderer');
	var Camera = require('Renderer/Camera');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var htmlText = require('text!./CharCreatev2.html');
	var cssText = require('text!./CharCreatev2.css');

	/**
	 * Create Chararacter Selection namespace
	 */
	var CharCreatev2 = new UIComponent('CharCreatev2', htmlText, cssText);

	/**
	 * @var {boolean} account sex
	 */
	var _accountSex = 0;

	/**
	 * @var {object} chargen info
	 */
	var _chargen = {
		entity: new Entity(),
		ctx: null,
		render: false,
		tick: 0
	};

	/**
	 * Initialize UI
	 */
	CharCreatev2.init = function init()
	{
		_chargen.ctx = this.ui.find('.content canvas')[0].getContext('2d');

		// Setup GUI
		this.ui.css({
			top: (Renderer.height - 286) / 2,
			left: (Renderer.width - 150) / 2
		});

		this.draggable();

		// Bind Events
		this.ui.find('.content .styleleft').mousedown(updateCharacterGeneric('head', -1));
		this.ui.find('.content .styleright').mousedown(updateCharacterGeneric('head', +1));
		this.ui.find('.content .colorleft').mousedown(updateCharacterGeneric('headpalette', -1));
		this.ui.find('.content .colorright').mousedown(updateCharacterGeneric('headpalette', +1));

		this.ui.find('input').mousedown(function (event)
		{
			this.focus();
			event.stopImmediatePropagation();
		});

		this.ui.find('.cancel').click(cancel);
		this.ui.find('.make').click(create);
	};

	/**
	 * Setter for AccountSex
	 *
	 * @param {number} sex
	 */
	CharCreatev2.setAccountSex = function setAccountSex(sex)
	{
		_accountSex = sex;
	};

	/**
	 * Once add to HTML, start rendering
	 */
	CharCreatev2.onAppend = function onAppend()
	{
		_chargen.render = true;
		_chargen.entity.set({
			sex: _accountSex,
			job: 0,
			head: 2,
			action: 0
		});

		this.ui.find('input').val('').focus();

		Renderer.render(render);
	};

	/**
	 * Remove component from HTML
	 * Stop rendering
	 */
	CharCreatev2.onRemove = function onRemove()
	{
		Renderer.stop(render);
	};

	/**
	 * Key Handler
	 *
	 * @param {object} event
	 * @return {boolean}
	 */
	CharCreatev2.onKeyDown = function onKeyDown(event)
	{
		if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this.ui.is(':visible'))
		{
			event.stopImmediatePropagation();
			cancel();
			return false;
		}

		return true;
	};

	/**
	 * Generic function to get a direct proxy to updateCharacter
	 *
	 * @param {string} type
	 * @param {number} value
	 */
	function updateCharacterGeneric(type, value)
	{
		return function (event)
		{
			updateCharacter(type, value);
			event.stopImmediatePropagation();
			return false;
		};
	}

	/**
	 * Send back informations to send the packet
	 */
	function create()
	{
		var ui = CharCreatev2.ui;

		CharCreatev2.onCharCreationRequest(
			ui.find('input').val(),
			1,
			1,
			1,
			1,
			1,
			1,
			_chargen.entity.head,
			_chargen.entity.headpalette
		);
	}

	/**
	 * Exit the window
	 */
	function cancel()
	{
		CharCreatev2.onExitRequest();
	}

	/**
	 * Update character hairstyle and haircolor
	 *
	 * @param {string} type (head or headpalette)
	 * @param {number} increment (-1 or +1)
	 */
	function updateCharacter(type, increment)
	{
		switch (type)
		{
			case 'head':
				var head = _chargen.entity.head + increment;

				if (head < 2)
				{
					head = 26;
				}

				if (head > 26)
				{
					head = 2;
				}

				_chargen.entity.head = head;
				break;

			case 'headpalette':
				_chargen.entity.headpalette += increment;
				_chargen.entity.headpalette %= 10;
				break;
		}

		render();
	}

	/**
	 * Rendering the Character
	 */
	function render(tick)
	{
		// Update direction each 500ms
		if (_chargen.tick + 500 < tick)
		{
			Camera.direction++;
			Camera.direction %= 8;
			_chargen.tick = tick;
		}

		// Rendering
		SpriteRenderer.bind2DContext(_chargen.ctx, 32, 115);
		_chargen.ctx.clearRect(0, 0, _chargen.ctx.canvas.width, _chargen.ctx.canvas.height);
		_chargen.entity.renderEntity();
	}

	/**
	 * Callback to define
	 */
	CharCreatev2.onExitRequest = function OnExitRequest() {};

	/**
	 * Abstract callback to define
	 */
	CharCreatev2.onCharCreationRequest = function OnCharCreationRequest() {};

	/**
	 * Create componentand export it
	 */
	return UIManager.addComponent(CharCreatev2);
});
