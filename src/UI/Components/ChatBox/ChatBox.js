/**
 * UI/Components/ChatBox/ChatBox.js
 *
 * ChatBox windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function(require)
{
	'use strict';


	/**
	 * Dependencies
	 */
	var DB                 = require('DB/DBManager');
	var jQuery             = require('Utils/jquery');
	var Renderer           = require('Renderer/Renderer');
	var Client             = require('Core/Client');
	var Events             = require('Core/Events');
	var Preferences        = require('Core/Preferences');
	var KEYS               = require('Controls/KeyEventHandler');
	var Mouse         	   = require('Controls/MouseEventHandler');
	var BattleMode         = require('Controls/BattleMode');
	var History            = require('./History');
	var UIManager          = require('UI/UIManager');
	var UIComponent        = require('UI/UIComponent');
	var ContextMenu        = require('UI/Components/ContextMenu/ContextMenu');
	var htmlText           = require('text!./ChatBox.html');
	var cssText            = require('text!./ChatBox.css');
	var Commands     = require('Controls/ProcessCommand');
	var ChatBoxSettings  = require('UI/Components/ChatBoxSettings/ChatBoxSettings');


	/**
	 * @var {number} max message in the chatbox
	 */
	var MAX_MSG = 400;
	var MAX_LENGTH = 100;
	var MAGIC_NUMBER = 3*14;


	/**
	 * @var {History} message cached in history
	 */
	var _historyMessage = new History();


	/**
	 * @var {History} nickname cached in history
	 */
	var _historyNickName = new History(true);



	/**
	 * @var {number} Chatbox position's index
	 */
	var _heightIndex = 2;


	/**
	 * @var {Preferences} structure
	 */
	var _preferences = Preferences.get('ChatBox', {
		x:      0,
		y:      Infinity,
		height: 2,
		magnet_top: false,
		magnet_bottom: true,
		magnet_left: true,
		magnet_right: false,
		tabs: [],
		tabOption: [],
		activeTab: 0

	}, 1.0);


	/**
	 * Create Basic Info component
	 */
	var ChatBox = new UIComponent( 'ChatBox', htmlText, cssText );


	/**
	 * Constants
	 */
	ChatBox.TYPE = {
		SELF:     1 << 0,
		PUBLIC:   1 << 1,
		PRIVATE:  1 << 2,
		PARTY:    1 << 3,
		GUILD:    1 << 4,
		ANNOUNCE: 1 << 5,
		ERROR:    1 << 6,
		INFO:     1 << 7,
		BLUE:     1 << 8, // TODO: find a better name
		ADMIN:    1 << 9,
		MAIL:     1 << 10,
	};

	ChatBox.FILTER = {
		PUBLIC_LOG:		0,
		PUBLIC_CHAT:	1,
		WHISPER:		2,
		PARTY:			3,
		GUILD:			4,
		ITEM:			5,
		EQUIP:			6,
		STATUS:			7,
		PARTY_ITEM:		8,
		PARTY_STATUS:	9,
		SKILL_FAIL:		10,
		PARTY_SETUP:	11,
		EQUIP_DAMAGE:	12,
		WOE:			13,
		PARTY_SEARCH:	14,
		BATTLE:			15,
		PARTY_BATTLE:	16,
		EXP:			17,
		PARTY_EXP:		18,
		QUEST:			19,
		BATTLEFIELD:	20,
		CLAN:			21,
		//CALL:			22, // Display Call messages
	};

	/**
	 * @var {number} target message ?
	 */
	ChatBox.sendTo = ChatBox.TYPE.PUBLIC;


	/**
	 * Storage to cache the private messages
	 * Ugly system used by official client, can lead to errors
	 */
	ChatBox.PrivateMessageStorage = {
		nick: '',
		msg:  ''
	};

	ChatBox.lastTabID = -1;
	ChatBox.tabCount = 0;
	ChatBox.activeTab = 0;

	ChatBox.tabs = [];

	/**
	 * Initialize UI
	 */
	ChatBox.init = function init()
	{
		_heightIndex = _preferences.height - 1;
		ChatBox.updateHeight();

		this.ui.mouseover(function(){
			Mouse.intersect = false;
		})
		.mouseout(function() {
			Mouse.intersect = true;
		});

		this.ui.css({
			top:  Math.min( Math.max( 0, _preferences.y - this.ui.height()), Renderer.height - this.ui.height()),
			left: Math.min( Math.max( 0, _preferences.x), Renderer.width  - this.ui.width())
		});

		this.magnet.TOP = _preferences.magnet_top;
		this.magnet.BOTTOM = _preferences.magnet_bottom;
		this.magnet.LEFT = _preferences.magnet_left;
		this.magnet.RIGHT = _preferences.magnet_right;

		this.draggable( this.ui.find('.input') );
		this.draggable( this.ui.find('.battlemode') );

		// Sorry for this un-documented code (see UIComponent for more informations)
		this.__mouseStopBlock = this.ui.find('.input');

		// Setting chatbox scrollbar
		Client.loadFiles([DB.INTERFACE_PATH + 'basic_interface/dialscr_down.bmp', DB.INTERFACE_PATH + 'basic_interface/dialscr_up.bmp'], function( down, up ){
			jQuery('style:first').append([
				'#chatbox .content::-webkit-scrollbar { width: 10px; height: 10px;}',
				'#chatbox .content::-webkit-scrollbar-button:vertical:start:increment,',
				'#chatbox .content::-webkit-scrollbar-button:vertical:end:decrement { display: none;}',
				'#chatbox .content::-webkit-scrollbar-corner:vertical { display:none;}',
				'#chatbox .content::-webkit-scrollbar-resizer:vertical { display:none;}',
				'#chatbox .content::-webkit-scrollbar-button:start:decrement,',
				'#chatbox .content::-webkit-scrollbar-button:end:increment { display: block; border:none;}',
				'#chatbox .content::-webkit-scrollbar-button:vertical:increment { background: url('+ down +') no-repeat; height:10px;}',
				'#chatbox .content::-webkit-scrollbar-button:vertical:decrement { background: url('+ up +') no-repeat; height:10px;}',
				'#chatbox .content::-webkit-scrollbar-track-piece:vertical { background:black; border:none;}',
				'#chatbox .content::-webkit-scrollbar-thumb:vertical { background:grey; -webkit-border-image:none; border-color:transparent;border-width: 0px 0; }'
			].join('\n'));
		});

		// Input selection
		this.ui.find('.input input').mousedown(function( event ){
			this.select();
			event.stopImmediatePropagation();
			return false;
		});

		this.ui.find('.input .message').blur(function(){
			Events.setTimeout(function(){
				if (!document.activeElement.tagName.match(/input|select|textarea/i)) {
					this.ui.find('.input .message').focus();
				}
			}.bind(this), 1);
		}.bind(this));

		this.ui.find('.input .message')[0].maxLength = MAX_LENGTH;

		this.ui.find('.input .username').blur(function(){
			Events.setTimeout(function(){
				if (!document.activeElement.tagName.match(/input|select|textarea/i)) {
					this.ui.find('.input .username').focus();
				}
			}.bind(this), 1);
		}.bind(this));

		// Validate information dragged into text field
		this.ui.find('input[type=text]')
			.on('drop', onDropText)
			.on('dragover', stopPropagation)

		// Button change name
		this.ui.find('.header input').dblclick(function(){
			this.type = 'text';
			this.select();
		}).blur(function(){
			this.type = 'button';
		});

		// Private message selection
		this.ui.find('.input .list').click(function(){
			var names = _historyNickName.list;
			var i, count = names.length;
			var pos = jQuery(this).offset();
			var ui = ContextMenu.ui.find('.menu');

			if (!count) {
				ChatBox.addText( DB.getMessage(192), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
				return;
			}

			ContextMenu.remove();
			ContextMenu.append();

			for (i = 0; i < count; ++i) {
				ContextMenu.addElement(names[i], onPrivateMessageUserSelection(names[i]));
			}

			ContextMenu.addElement('', onPrivateMessageUserSelection(''));
			ui.css({
				top:  pos.top - ui.height() - 5,
				left: pos.left - ui.width() - 5
			});
		}).mousedown(function(event){
			event.stopImmediatePropagation();
			return false;
		});

		this.ui.find('.draggable').mousedown(function(event){
			event.stopImmediatePropagation();
			return false;
		});

		// Send message to...
		this.ui.find('.input .filter').click(function(){
			var pos = jQuery(this).offset();
			var ui = ContextMenu.ui.find('.menu');

			ContextMenu.remove();
			ContextMenu.append();

			ContextMenu.addElement(DB.getMessage(85),  onChangeTargetMessage(ChatBox.TYPE.PUBLIC));
			ContextMenu.addElement(DB.getMessage(86),  onChangeTargetMessage(ChatBox.TYPE.PARTY));
			ContextMenu.addElement(DB.getMessage(437), onChangeTargetMessage(ChatBox.TYPE.GUILD));

			ui.css({
				top:  pos.top - ui.height() - 5,
				left: pos.left - ui.width() + 25
			});
		}).mousedown(function(event){
			event.stopImmediatePropagation();
			return false;
		});

		// Change size
		this.ui.find('.input .size').click(function( event ){
			ChatBox.updateHeight(true);
			event.stopImmediatePropagation();
			return false;
		});

		// Scroll feature should block at each line
		this.ui.find('.content').on('mousewheel DOMMouseScroll', onScroll);

		this.ui.find('.battlemode .bmtoggle').click(function ( event ){
			ChatBox.ui.find('.input').toggle();
			ChatBox.ui.find('.battlemode').toggle();
		});

		this.ui.find('.chat-function .battleopt2').click(function( event ){
			if(ChatBox.tabCount <= 5){
				ChatBox.addNewTab();
				ChatBox.onAppend();
			}
		});

		this.ui.on('click', 'table.header tr td.tab', function( event ){
			event.stopImmediatePropagation();
			var currentElem = event.currentTarget;
			if(ChatBox.activeTab !== currentElem.dataset.tab - 1){
				ChatBox.switchTab(currentElem.dataset.tab);
			}
		});

		this.ui.find('.chat-function .wndminib').click(function(){
			if(ChatBox.tabCount > 1){
				ChatBox.removeTab();
			}
		});

		this.ui.find('.chat-function .chatmode').click(function(){
			ChatBox.toggleChat();
		});

		this.ui.find('.chat-function .battleopt').click(function(){
			ChatBox.toggleChatBattleOption();
		});

		// Init settings window as well
		ChatBoxSettings.append();


		if(_preferences.tabs.length > 0 && _preferences.tabs.length == _preferences.tabOption.length){
			// Load saved tabs
			for(var i = 0; i < _preferences.tabs.length; i++){
				if(_preferences.tabs[i] && _preferences.tabOption[i]){
					ChatBox.addNewTab(_preferences.tabs[i].name, _preferences.tabOption[i]);
				}
			}

			// Switch to last active tab
			if(ChatBox.tabs[_preferences.activeTab]){
				this.switchTab(_preferences.activeTab);
			}
		} else {
			// Default tabs
			var firstTab = ChatBox.addNewTab(DB.getMessage(1291), [
				ChatBox.FILTER.PUBLIC_LOG,
				ChatBox.FILTER.PUBLIC_CHAT,
				ChatBox.FILTER.WHISPER,
				ChatBox.FILTER.PARTY,
				ChatBox.FILTER.GUILD,
				ChatBox.FILTER.ITEM,
				ChatBox.FILTER.EQUIP,
				ChatBox.FILTER.STATUS,
				ChatBox.FILTER.PARTY_ITEM,
				ChatBox.FILTER.PARTY_STATUS,
				ChatBox.FILTER.SKILL_FAIL,
				ChatBox.FILTER.PARTY_SETUP,
				ChatBox.FILTER.EQUIP_DAMAGE,
				ChatBox.FILTER.WOE,
				ChatBox.FILTER.PARTY_SEARCH,
				ChatBox.FILTER.QUEST,
				ChatBox.FILTER.BATTLEFIELD,
				ChatBox.FILTER.CLAN
			]); // Public Log

			ChatBox.addNewTab(DB.getMessage(1292)); // Battle Log

			// switch to first
			ChatBox.switchTab(firstTab);
		}

		// dialog box size
		makeResizableDiv()
		
		Commands.add('savechat', 'Saves current chat tab to txt file.', function(){ ChatBox.saveCurrentTabChat(); return; }, ['sc'], false );
	};


	/**
	 * Clean up the box
	 */
	ChatBox.clean = function Clean()
	{
		var matches, i, count;

		matches = this.ui.find('.content').html().match(/(blob:[^"]+)/g);

		if (matches) {
			for (i = 0, count = matches.length; i < count; ++i) {
				window.URL.revokeObjectURL(matches[i]);
			}
		}

		this.ui.find('.content').empty();
		this.ui.find('.input .message').val('');
		this.ui.find('.input .username').val('');

		_historyMessage.clear();
		_historyNickName.clear();
	};

	ChatBox.toggleChatBattleOption = function toggleChatBattleOption(){
		var tabName = this.ui.find('.header tr td div.on input').val();
		ChatBoxSettings.toggle();
		ChatBoxSettings.updateTab(this.activeTab, tabName);
	}

	ChatBox.removeTab = function removeTab() {
		this.ui.find('table.header tr td.tab[data-tab="'+ this.activeTab +'"]').remove();
		this.ui.find('.body .content[data-content="'+ this.activeTab +'"]').remove();

		var tabName= '';
		var _elem = this.ui.find('table.header tr td.tab');
 		_elem = this.ui.find('table.header tr td.tab')[_elem.length - 1];

		// Use delete instead of splice to avoid ID messup and make our life eastier.
		delete ChatBoxSettings.tabOption[this.activeTab];
		delete this.tabs[this.activeTab];
		this.tabCount--;

		ChatBox.switchTab(_elem.dataset.tab);

		tabName = this.ui.find('.header tr td div.on input').val();
		ChatBoxSettings.updateTab(this.activeTab, tabName);
	}

	ChatBox.addNewTab = function addNewTab(name, settings){

		// Default settings
		if(!name){
			name = 'New Tab';
		}
		if(!settings){
			settings = [
				ChatBox.FILTER.PUBLIC_LOG,
				ChatBox.FILTER.PUBLIC_CHAT,
				ChatBox.FILTER.WHISPER,
				ChatBox.FILTER.PARTY,
				ChatBox.FILTER.GUILD,
				ChatBox.FILTER.ITEM,
				ChatBox.FILTER.EQUIP,
				ChatBox.FILTER.STATUS,
				ChatBox.FILTER.PARTY_ITEM,
				ChatBox.FILTER.PARTY_STATUS,
				ChatBox.FILTER.SKILL_FAIL,
				ChatBox.FILTER.PARTY_SETUP,
				ChatBox.FILTER.EQUIP_DAMAGE,
				ChatBox.FILTER.WOE,
				ChatBox.FILTER.PARTY_SEARCH,
				ChatBox.FILTER.BATTLE,
				ChatBox.FILTER.PARTY_BATTLE,
				ChatBox.FILTER.EXP,
				ChatBox.FILTER.PARTY_EXP,
				ChatBox.FILTER.QUEST,
				ChatBox.FILTER.BATTLEFIELD,
				ChatBox.FILTER.CLAN
			];
		}

		var tabName = name;
		var tabID = ++this.lastTabID;

		var tab = {};
		tab.id = tabID;
		tab.name = tabName;

		// Store prev height
		//var height = this.ui.find('.contentwrapper').height();

		// Remove current active state
		this.ui.find('table.header tr td.tab div')
			.removeClass('on');
		this.ui.find('.body .content')
			.removeClass('active');

		// Add new elements as active
		this.ui.find('table.header tr .opttab').before(`
			<td class="tab" data-tab="${tabID}">
				<div class="on">
					<input type="text" value="${tabName}"/>
				</div>
			</td>
		`);

		this.ui.find('table.header tr td.tab[data-tab="'+tabID+'"] div input').on('change', function(){
			ChatBox.tabs[tabID].name = this.value;
		});

		this.ui.find('.body .contentwrapper').append(
			`<div class="content active" data-content="${tabID}"></div>`
		);

		ChatBoxSettings.tabOption[tabID] = settings;

		this.tabs[tabID] = tab;
		this.activeTab = tabID;

		this.tabCount++;

		ChatBoxSettings.updateTab(this.activeTab, tabName);

		return tabID;
	}

	ChatBox.switchTab = function switchTab(tabID){
		var tabName = '';

		this.ui.find('table.header tr td.tab div')
			.removeClass('on');
		this.ui.find('.body .content')
			.removeClass('active');

		this.activeTab = tabID;

		this.ui.find('table.header tr td.tab[data-tab="'+ this.activeTab +'"] div')
			.addClass('on');
		this.ui.find('.body .content[data-content="'+ this.activeTab +'"]')
			.addClass('active');

		tabName = this.ui.find('.header tr td div.on input').val();

		this.ui.find('.content')[tabID].scrollTop = this.ui.find('.content')[tabID].scrollHeight;

		ChatBoxSettings.updateTab(this.activeTab, tabName);
	}

	/**
	 * Once append to HTML
	 */
	ChatBox.onAppend = function OnAppend()
	{
		// Focus the input
		this.ui.find('.input .message').focus();

		var content = this.ui.find('.content.active');
		content[0].scrollTop = content[0].scrollHeight;
	};


	/**
	 * Stop custom scroll
	 */
	ChatBox.onRemove = function OnRemove()
	{
		this.ui.find('.content.active').off('scroll');

		_preferences.y      = parseInt(this.ui.css('top'), 10) + this.ui.height();
		_preferences.x      = parseInt(this.ui.css('left'), 10);
		_preferences.height = _heightIndex;
		_preferences.magnet_top = this.magnet.TOP;
		_preferences.magnet_bottom = this.magnet.BOTTOM;
		_preferences.magnet_left = this.magnet.LEFT;
		_preferences.magnet_right = this.magnet.RIGHT;

		_preferences.tabs = this.tabs;
		_preferences.tabOption = ChatBoxSettings.tabOption;
		_preferences.activeTab = this.activeTab;

		_preferences.save();

		this.lastTabID = -1;
		this.activeTab = 0;
	};


	/**
	 * BattleMode processing
	 *
	 * @param {number} key id to check
	 * @return {boolean} found a shortcut ?
	 */
	ChatBox.processBattleMode = function processBattleMode( keyId )
	{
		// Direct process
		if (this.ui.find('.battlemode').is(':visible') ||
			KEYS.ALT || KEYS.SHIFT || KEYS.CTRL ||
			(keyId >= KEYS.F1 && keyId <= KEYS.F24)) {
			return BattleMode.process(keyId);
		}
/*
		var messageBox = this.ui.find('.input .message');
		var text       = messageBox.val();

		var messageBoxUser = this.ui.find('.input .username');
		var text2       = messageBoxUser.val();

		// Hacky, need to wait the browser to add text in the input
		// If there is no change, send the shortcut.
		Events.setTimeout(function(){
			// Nothing rendered, can process the shortcut
			if ((messageBox.val() === text) && (messageBoxUser.val() === text2)) {
				BattleMode.process(keyId);
			}
		}.bind(this), 4);*/

		return false;
	};


	/**
	 * Key Event Handler
	 *
	 * @param {object} event - KeyEventHandler
	 * @return {boolean}
	 */
	//  Handles key press events inside the chatbox
	ChatBox.onKeyDown = function OnKeyDown(event) 
	{
		var messageBox = this.ui.find('.input .message');
		var nickBox = this.ui.find('.input .username');
		
		this.ui.find('.header tr td div.on input').on('keyup', function(){
			ChatBoxSettings.updateTab(ChatBox.activeTab, this.value);
		});

		switch (event.which) {

			//  Battle mode system (Includes F1-F24, 0-9, A-Z, ALT, SHIFT, CTRL)
			default:
				if ((event.target.tagName && !event.target.tagName.match(/input|select|textarea/i)) 
					|| (event.which >= KEYS.F1 && event.which <= KEYS.F24) 
					|| (event.which >= KEYS[1] && event.which <= KEYS[9])   //  Numbers 0-9 - MicromeX
					|| (event.which >= KEYS.A && event.which <= KEYS.Z)   //  Letters A-Z - MicromeX
					|| KEYS.ALT || KEYS.SHIFT || KEYS.CTRL) {
					
					if (ChatBox.processBattleMode(event.which)) {
						event.stopImmediatePropagation();
						return false;
					}
				}
				return true;

			// 🔹 Switch input field (TAB key)
			case KEYS.TAB:
				if (document.activeElement === messageBox[0]) {
					nickBox.select().focus();
					break;
				}
				if (document.activeElement === nickBox[0]) {
					messageBox.select().focus();
					break;
				}
				return true;

			// 🔹 Retrieve last chat message (UP arrow key)
			case KEYS.UP:
				if (!jQuery('#NpcMenu').length) {
					if (document.activeElement === messageBox[0]) {
						messageBox.val(_historyMessage.previous()).select();
						break;
					}
					if (document.activeElement === nickBox[0]) {
						nickBox.val(_historyNickName.previous()).select();
						break;
					}
				}
				return true;

			// 🔹 Retrieve next chat message (DOWN arrow key)
			case KEYS.DOWN:
				if (!jQuery('#NpcMenu').length) {
					if (document.activeElement === messageBox[0]) {
						messageBox.val(_historyMessage.next()).select();
						break;
					}
					if (document.activeElement === nickBox[0]) {
						nickBox.val(_historyNickName.next()).select();
						break;
					}
				}
				return true;

			// 🔹 Resize chatbox (F10 key)
			case KEYS.F10:
				this.updateHeight(false);
				this.ui.find('.content')[this.activeTab].scrollTop = this.ui.find('.content')[this.activeTab].scrollHeight;
				break;

			// 🔹 Send message (ENTER key)
			case KEYS.ENTER:
				if (document.activeElement.tagName === 'INPUT' &&
					document.activeElement !== messageBox[0]) {
					return true;
				}

				if (jQuery('#NpcMenu, #NpcBox').length) {
					return true;
				}

				messageBox.focus();
				this.submit();
				break;
		}

		event.stopImmediatePropagation();
		return false;
	};

	ChatBox.toggleChat = function toggleChat(){
		var messageBox = this.ui.find('.input .message');

		if (document.activeElement.tagName === 'INPUT' &&
		    document.activeElement !== messageBox[0]) {
			return true;
		}

		if (jQuery('#NpcMenu, #NpcBox').length) {
			return true;
		}

		messageBox.focus();
		this.submit();
	}


	/**
	 * Process ChatBox message
	 */
	ChatBox.submit = function Submit()
	{
		var input = this.ui.find('.input');
		var $user = input.find('.username');
		var $text = input.find('.message');

		var user = $user.val();
		var text = $text.val();
		var isChatOn = false;

		// Battle mode
		if (!text.length) {
			input.toggle();
			this.ui.find('.battlemode').toggle();
			if (input.is(':visible')) {
				isChatOn = true;
				$text.focus();
			}
			var chatmode = isChatOn ? 'on' : 'off';
			Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/chatmode_'+chatmode+'.bmp', function( data ){
				ChatBox.ui.find('.chat-function .chatmode').css('backgroundImage', 'url('+ data +')');
			});

			return;
		}

		// Private message
		if (user.length && text[0] !== '/') {
			this.PrivateMessageStorage.nick = user;
			this.PrivateMessageStorage.msg  = text;
			_historyNickName.push(user);
			_historyNickName.previous();
		}

		// Save in history
		_historyMessage.push(text);

		$text.val('');

		// Command
		if (text[0] === '/') {
			Commands.processCommand.call(this, text.substr(1) );
			return;
		}

		this.onRequestTalk( user, text, ChatBox.sendTo );
	};


	/**
	 * Add text to chatbox
	 *
	 * @param {string} text
	 * @param {number} colorType
	 * @param {string} color
	 * @param {boolean} default false, html or text ?
	 * @param {number} filterType
	 */
	ChatBox.addText = function addText( text, colorType, filterType, color, override )
	{
		// Backward compatibility for older calls without filter
		if(isNaN(filterType)){
			filterType = ChatBox.FILTER.PUBLIC_LOG;
		}

		this.tabs.forEach((tab, TabNum) => {
			var content = this.ui.find('.content[data-content="'+ TabNum +'"]');
			var chatTabOption = ChatBoxSettings.tabOption[TabNum];

			if(!chatTabOption.includes(filterType)){
				return;
			}

			if (!color) {
				if ((colorType & ChatBox.TYPE.PUBLIC) && (colorType & ChatBox.TYPE.SELF)) {
					color = '#00FF00';
				}
				else if (colorType & ChatBox.TYPE.PARTY) {
					color = ( colorType & ChatBox.TYPE.SELF ) ? 'rgb(200, 200, 100)' : 'rgb(230,215,200)';
				}
				else if (colorType & ChatBox.TYPE.GUILD) {
					color = 'rgb(180, 255, 180)';
				}
				else if (colorType & ChatBox.TYPE.PRIVATE) {
					color = '#FFFF00';
				}
				else if (colorType & ChatBox.TYPE.ERROR) {
					color = '#FF0000';
				}
				else if (colorType & ChatBox.TYPE.INFO) {
					color = '#FFFF63';
				}
				else if (colorType & ChatBox.TYPE.BLUE) {
					color = '#00FFFF';
				}
				else if (colorType & ChatBox.TYPE.ADMIN) {
					color = '#FFFF00';
				}
				else if (colorType & ChatBox.TYPE.MAIL) {
					color = '#F4D293';
				}
				else {
					color = 'white';
				}
			}

			content.append(
				jQuery('<div/>').
					css('color', color)
					[ !override ? 'text' : 'html' ](text)
			);


			// If there is too many line, remove the older one
			if (content[0].childElementCount > MAX_MSG) {
				var element, matches;
				var i, count;

				//Check if theres any blob url object to be released from buffer (Check Controls/ScreenShot.js)
				element = content[0].firstElementChild;

				matches = element.innerHTML.match(/(blob:[^"]+)/g);

				if (matches) {
					for (i = 0, count = matches.length; i < count; ++i) {
						window.URL.revokeObjectURL(matches[i]);
					}
				}

				element.remove();
			}


			// Function to determine whether to scroll down or not
			function shouldScrollDown(container, messageHeight, height) {
				// Tolerance could be a few pixels to account for nearly at the bottom situations
				const tolerance = 5;

				// The user is considered at the bottom if the current scrollTop, plus the height of the container,
				// plus any potential new message height, is within the tolerance of the total scrollable height.
				const atBottom = container.scrollTop + height + messageHeight >= container.scrollHeight - tolerance;

				// If there is no scrollbar (content does not overflow), or the user is at the bottom, return true.
				if (height >= container.scrollHeight || atBottom) {
					return true;
				}

				// In other cases, return false as we do not want to auto-scroll down
				return false;
			}

			const lastMessageHeight = this.ui.find('.content[data-content="'+ TabNum +'"] > div:last-child')[0].scrollHeight;

			if (shouldScrollDown(content[0], lastMessageHeight, content.height())) {
				content[0].scrollTop = content[0].scrollHeight;
			}
		});
	};


	/**
	 * Change chatbox's height
	 */
	ChatBox.updateHeight = function changeHeight( AlwaysVisible )
	{
		var HeightList = [ 0, 0, MAGIC_NUMBER, MAGIC_NUMBER*2, MAGIC_NUMBER*3, MAGIC_NUMBER*4, MAGIC_NUMBER*5 ];
		_heightIndex   = (_heightIndex + 1) % HeightList.length;

		var content   = this.ui.find('.contentwrapper');
		var height     = HeightList[ _heightIndex ];
		var top        = parseInt( this.ui.css('top'), 10);

		this.ui.css('top', top - (height - content.height()) );
		content.height(height);

		// Don't remove UI
		if (_heightIndex === 0 && AlwaysVisible) {
			_heightIndex++;
		}

		switch (_heightIndex) {
			case 0:
				this.ui.hide();
				break;

			case 1:
				this.ui.show();
				this.ui.find('.header, .body').hide();
				this.ui.find('.input').addClass('fix');
				break;

			default:
				this.ui.find('.input').removeClass('fix');
				this.ui.find('.header, .body').show();
				break;
		}

		content[this.activeTab].scrollTop = content[this.activeTab].scrollHeight;
	};


	/**
	 * Save user name to nick name history
	 *
	 * @param {string} nick name
	 */
	ChatBox.saveNickName = function saveNickName( pseudo )
	{
		_historyNickName.push(pseudo);
	};
	
	/**
	 * Save chat from current tab into a file.
	 */
	ChatBox.saveCurrentTabChat = function saveCurrentTabChat(){
		
		var timezone, date, data, url;
		
		// Create a date
		var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    	var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
		localISOTime = localISOTime.replace('T', ' ');
		timezone = (new Date().getTimezoneOffset() / 60);
		date     = localISOTime + ' (GMT ' + (timezone > 0 ? '-' : '+') + Math.abs(timezone).toString() + ')'; //GMT
		
		data = '<html><head><title>Chat History</title><style> body { background-color: DarkSlateGray; } </style></head><body>'
		data += this.ui.find('.content[data-content="'+ ChatBox.activeTab +'"]')[0].outerHTML;
		data += '</body></html>';
		
		// We create a local file
		url = window.URL.createObjectURL(new Blob([data], {type: 'text/plain'}));
		
		ChatBox.addText('Chat History ['+ ChatBox.tabs[ChatBox.activeTab].name +'] ' + date + ' can be saved by <a style="color:#F88" download="ChatHistory ['+ ChatBox.tabs[ChatBox.activeTab].name +'] (' + date.replace('/', '-') + ').html" href="'+ url +'" target="_blank">clicking here</a>.', ChatBox.TYPE.PUBLIC, ChatBox.FILTER.PUBLIC_LOG, null, true);
	};


	/**
	 * Update scroll by block (14px)
	 */
	function onScroll( event )
	{
		var delta;

		if (event.originalEvent.wheelDelta) {
			delta = event.originalEvent.wheelDelta / 120 ;
			if (window.opera) {
				delta = -delta;
			}
		}
		else if (event.originalEvent.detail) {
			delta = -event.originalEvent.detail;
		}

		this.scrollTop = Math.floor(this.scrollTop/14) * 14 - (delta * 14);
		return false;
	}

	/**
	 * Validate the type of information being dropped into the text field
	 */
	 function onDropText( event )
	 {
		 event.stopImmediatePropagation();
		 var data;
		 try {
			data = JSON.parse(event.originalEvent.dataTransfer.getData('Text'));
		 }
		 catch(e) {
			 return false;
		 }

		 // Valid if the message type
		 if (data.type == 'item') {
			 return false;
		 }

		 jQuery(event.currentTarget).val(data);
		 return true;
	 }

	/**
	 * Stop event propagation
	 */
	 function stopPropagation( event )
	 {
		 event.stopImmediatePropagation();
		 return false;
	 }



	/**
	 * Change private message nick name
	 *
	 * @param {string} nick name
	 * @return {function} callback closure
	 */
	function onPrivateMessageUserSelection(name)
	{
		return function onPrivateMessageUserSelectionClosure()
		{
			ChatBox.ui.find('.input .username').val(name);
		};
	}


	/**
	 * Change target of global chat (party, guild)
	 *
	 * @param {number} type constant
	 */
	function onChangeTargetMessage(type)
	{
		return function onChangeTargetMessageClosure()
		{
			var $input = ChatBox.ui.find('.input .message');

			$input.removeClass('guild party');

			if (type & ChatBox.TYPE.PARTY) {
				$input.addClass('party');
			}
			else if (type & ChatBox.TYPE.GUILD) {
				$input.addClass('guild');
			}

			ChatBox.sendTo = type;
		};
	}

	function makeResizableDiv() {
		const resizers = document.querySelectorAll('.draggable')
		let original_height = 0;
		let original_y = 0;
		let original_mouse_y = 0;
		for (let i = 0;i < resizers.length; i++) {
			const currentResizer = resizers[i];

			currentResizer.addEventListener('mousedown', function(e) {
				e.preventDefault();
				original_height = ChatBox.ui.find('.contentwrapper').height();
				original_y = parseInt( ChatBox.ui.css('top'), 10) + original_height;
				original_mouse_y = e.pageY;
				window.addEventListener('mousemove', resize);
				window.addEventListener('mouseup', stopResize);
			})

			function resize(e) {
				if (currentResizer.classList.contains('draggable')) {
					const height = fixHeight(original_height - (e.pageY - original_mouse_y));
					if (height > MAGIC_NUMBER) {
						ChatBox.ui.css('top', original_y - height);
						ChatBox.ui.find('.contentwrapper').height(height);
					}
				}
				// scroll down when resize
				ChatBox.ui.find('.content')[ChatBox.activeTab].scrollTop = ChatBox.ui.find('.content')[ChatBox.activeTab].scrollHeight;
			}

			function fixHeight(height){
				return  Math.floor(height/MAGIC_NUMBER)*MAGIC_NUMBER;
			}

			function stopResize() {
				window.removeEventListener('mousemove', resize);
			}
		}
	  }


	/**
	 * Create componentand export it
	 */
	return UIManager.addComponent(ChatBox);
});
