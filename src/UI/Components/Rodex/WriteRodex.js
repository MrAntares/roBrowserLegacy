/**
 * UI/Components/Rodex/WriteRodex.js
 *
 * Chararacter WriteRodex
 *
 * @author Alisonrag
 *
 */
define(function (require) {
	'use strict';


	/**
	 * Dependencies
	 */
	var DB = require('DB/DBManager');
	var Session = require('Engine/SessionStorage');
	var MonsterTable = require('DB/Monsters/MonsterTable');
	var jQuery = require('Utils/jquery');
	var Preferences = require('Core/Preferences');
	var Renderer = require('Renderer/Renderer');
	var ItemInfo = require('UI/Components/ItemInfo/ItemInfo');
	var Client = require('Core/Client');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var htmlText = require('text!./WriteRodex.html');
	var cssText = require('text!./WriteRodex.css');
	var getModule = require;

	/**
	 * Create Component
	 */
	var WriteRodex = new UIComponent('WriteRodex', htmlText, cssText);


	/**
	 * @var {Preferences} structure
	 */
	var _preferences = Preferences.get('WriteRodex', {
		show: false,
	}, 1.0);

	/**
	 * Initialize Component
	 */
	WriteRodex.onAppend = function onAppend() {
		// Bind buttons
		WriteRodex.ui.find('.right .close').on('click', onClickClose);

		WriteRodex.ui.css({
			top: Math.min(Math.max(0, parseInt(getModule('UI/Components/Rodex/Rodex').ui.css('top'), 10)) - 20, Renderer.height - WriteRodex.ui.height()),
			left: Math.min(Math.max(0, parseInt(getModule('UI/Components/Rodex/Rodex').ui.css('left'), 10)) + 330, Renderer.width - WriteRodex.ui.width())
		});

		WriteRodex.draggable(WriteRodex.ui.find('.titlebar'));
	};


	WriteRodex.initData = function initData(pkt) {
		WriteRodex.ui.find('.name').prop("type", "text");
		WriteRodex.ui.find('.name').val(pkt.receiveName);
		WriteRodex.ui.find('.validate-name').show();
		WriteRodex.ui.find('.baloon').hide();
		WriteRodex.ui.find('.title-text').val(DB.getMessage(3575));
		WriteRodex.ui.find('.character-zeny').html(prettifyZeny(Session.zeny) + ' Zeny');
		WriteRodex.ui.find('.validate-name').on('click', onClickValidateName);
		WriteRodex.ui.show();
		WriteRodex.ui.focus();

	}

	WriteRodex.characterInfo = function characterInfo(pkt) {
		console.log(pkt);
		let text = 'Lv' + pkt.level + '<br>' + MonsterTable[pkt.Job] + '<br>' + pkt.CharID;
		WriteRodex.ui.find('.validate-name').hide();
		WriteRodex.ui.find('.baloon').html(text).show();
		WriteRodex.ui.find('.name').prop("type", "none");
	}

	function onClickClose(e) {
		e.stopImmediatePropagation();
		WriteRodex.ui.find('.name').val('');
		WriteRodex.ui.find('.title-text').val('');
		WriteRodex.ui.find('.content-text').val('');
		WriteRodex.ui.find('.value').val('');
		WriteRodex.requestCancelWriteRodex();
		WriteRodex.ui.hide();
	}

	WriteRodex.setAttachment = function setAttachment(pkt) {
		console.log(pkt);
	}

	WriteRodex.removeAttachment = function removeAttachment(pkt) {
		console.log(pkt);
	}

	WriteRodex.close = function close() {
		WriteRodex.ui.hide();
	}

	function prettifyZeny(value) {
		var num = String(value);
		var i = 0, len = num.length;
		var out = '';

		while (i < len) {
			out = num[len - i - 1] + out;
			if ((i + 1) % 3 === 0 && i + 1 !== len) {
				out = ',' + out;
			}
			++i;
		}

		return out;
	}

	function onClickValidateName() {
		let name = WriteRodex.ui.find('.name').val();
		WriteRodex.validateName(name.replace(/^(\$|\%)/, '').replace(/\t/g, ''));
	}

	/**
	* Callbacks
	*/

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(WriteRodex);
});
