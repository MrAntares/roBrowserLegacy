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
	var Cursor             = require('UI/CursorManager');
	var BattleMode         = require('Controls/BattleMode');
	var History            = require('./History');
	var UIManager          = require('UI/UIManager');
	var UIComponent        = require('UI/UIComponent');
	var ContextMenu        = require('UI/Components/ContextMenu/ContextMenu');
	var htmlText           = require('text!./ChatBox.html');
	var cssText            = require('text!./ChatBox.css');
	var Commands     = require('Controls/ProcessCommand');
	var ChatBoxSettings  = require('UI/Components/ChatBoxSettings/ChatBoxSettings');
	var HTMLEntity        = require('Utils/HTMLEntity');
	var getModule          = require;


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
	 * Buffer para acumular mensagens antes de adicionar ao DOM.
	 * @private
	 * @type {ChatMessage[]}
	 */
	var _messageBuffer = [];

	/**
	 * Flag que indica se um requestAnimationFrame foi agendado para processar o buffer.
	 * @private
	 * @type {boolean}
	 */
	var _rafScheduled = false;

	/**
	 * @var {Preferences} structure
	 */
	var _preferences = Preferences.get('ChatBox', {
		x:      0,
		y:      Infinity,
		height: 2,
		fontScale: 1.0,
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
		ChatBox.applyFontScale();

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
		// Keep chat log area click-through for walking; only block over interactive UI parts.
		// Note: tabs are created dynamically; their hover-block is handled via delegated events below.
		this.__mouseStopBlock = this.ui.find('.input, .chat-function, .battlemode, .event_add_cursor');

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

		this.ui.find('.input-chatbox').blur(function(){
			Events.setTimeout(function(){
				var active = document.activeElement;
				var movedInsideChatbox = active && jQuery(active).closest('#chatbox').length;
				var isTextInput = active && active.tagName && active.tagName.match(/input|select|textarea/i);
				if (!movedInsideChatbox && !isTextInput) {
					this.ui.find('.input-chatbox').focus();
				}
			}.bind(this), 1000);
		}.bind(this));

		// Move caret to end of text
		this.ui.find('.input-chatbox').on('click focus', function() {  
			var element = this;  
			var range = document.createRange();  
			var selection = window.getSelection();  

			range.selectNodeContents(element);  
			range.collapse(false); 
			selection.addRange(range);  
		});

		this.ui.find('.input-chatbox')[0].maxLength = MAX_LENGTH;

		this.ui.find('.input-chatbox').on('input', function(event) {  
			var currentText = extractChatMessage(jQuery(this));  
			if (currentText.length >= MAX_LENGTH) { // cap message to maximun lenght
				event.preventDefault();  
				return false;  
			}  
		});  

		this.ui.find('.input-chatbox').on('keydown', function(event) {  
			var currentText = extractChatMessage(jQuery(this));  
      			// Allowed Keys (backspace, delete, arrows, etc)  
			if (event.which >= 37 && event.which <= 40) return true; // arrows 
			if (event.which === 8 || event.which === 46) return true; // backspace, delete  
			if (event.which === 13) return true; // enter  
			if (event.ctrlKey || event.altKey) return true;  
      
			// Block texting after reach max_lenght
			if (currentText.length >= MAX_LENGTH) {  
				event.preventDefault();  
				return false;  
			}  
		});

		this.ui.find('.input-chatbox').on('paste', function(event) {
			// Contenteditable ignores maxLength; enforce plain-text paste + length limit.
			event.preventDefault();

			var clipboard = (event.originalEvent || event).clipboardData;
			var pastedText = clipboard ? clipboard.getData('text/plain') : '';
			if (!pastedText) {
				return false;
			}

			pastedText = pastedText.replace(/\u00A0/g, ' ');

			var currentText = extractChatMessage(this.ui.find('.input-chatbox'));
			var remaining = MAX_LENGTH - currentText.length;
			if (remaining <= 0) {
				return false;
			}

			var toInsert = pastedText.substr(0, remaining);

			// Insert at caret if possible; fallback to append.
			if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
				document.execCommand('insertText', false, toInsert);
			} else {
				var node = document.createTextNode(toInsert);
				this.ui.find('.input-chatbox')[0].appendChild(node);
			}

			return false;
		}.bind(this));

		this.ui.find('.input .username').blur(function(){
			Events.setTimeout(function(){
				var active = document.activeElement;
				var movedInsideChatbox = active && jQuery(active).closest('#chatbox').length;
				var isTextInput = active && active.tagName && active.tagName.match(/input|select|textarea/i);
				var isChatMessage = active === this.ui.find('.input-chatbox')[0];
				if (!movedInsideChatbox && !isTextInput && !isChatMessage) {
					this.ui.find('.input .username').focus();
				}
			}.bind(this), 1000);
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
			event.stopPropagation();
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
		// Tabs should behave like "UI" (no entity hover / map cursor changes), but opttab remains click-through.
		(function initTabHoverBlock(){
			var _tabIntersect, _tabEnter = 0;

			ChatBox.ui.on('mouseenter', 'table.header tr td.tab, table.header tr td.tab *', function(){
				if (_tabEnter === 0) {
					_tabIntersect = Mouse.intersect;
					_tabEnter++;
					if (_tabIntersect) {
						Mouse.intersect = false;
						Cursor.setType(Cursor.ACTION.DEFAULT);
						getModule('Renderer/EntityManager').setOverEntity(null);
					}
				}
			});

			ChatBox.ui.on('mouseleave', 'table.header tr td.tab, table.header tr td.tab *', function(){
				if (_tabEnter > 0) {
					_tabEnter--;
					if (_tabEnter === 0 && _tabIntersect) {
						Mouse.intersect = true;
						getModule('Renderer/EntityManager').setOverEntity(null);
					}
				}
			});

			// Prevent walking when clicking tabs (MapControl listens on window mousedown).
			ChatBox.ui.on('mousedown', 'table.header tr td.tab, table.header tr td.tab *', function(event){
				event.stopPropagation();
			});
		})();

		// Prevent map right-click (camera rotate) when using chat right-click features.
		this.ui.on('mousedown', '.body, .contentwrapper, .content', function(event){
			if (event.which !== 3) {
				return true;
			}

			// Let other UI elements handle their own context menus, but never rotate the camera.
			if (jQuery(event.target).closest('.event_add_cursor, .chat-function, td.tab').length) {
				event.preventDefault();
				event.stopPropagation();
				return false;
			}

			event.preventDefault();
			event.stopPropagation();
			return false;
		});

		// Chat font scale context menu (right click).
		this.ui.on('contextmenu', '.body, .contentwrapper, .content', function(event){
			// Ignore right click on interactive elements (links, item links, scrollbars, etc.)
			if (jQuery(event.target).closest('a, .item-link, .event_add_cursor, .chat-function, td.tab').length) {
				return true;
			}

			event.preventDefault();
			event.stopPropagation();

			Mouse.screen.x = event.pageX;
			Mouse.screen.y = event.pageY;

			ContextMenu.remove();
			ContextMenu.append();
			ContextMenu.addElement('Chat font x1.0', setChatFontScale(1.0));
			ContextMenu.addElement('Chat font x1.2', setChatFontScale(1.2));
			ContextMenu.addElement('Chat font x1.4', setChatFontScale(1.4));

			return false;
		});

		// Clicking interactive elements in chat should not trigger map movement.
		this.ui.on('mousedown', '.content a, .content .item-link', function(event){
			event.stopPropagation();
		});

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
		this.ui.find('.input-chatbox').html('');
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
		this.ui.find('.input-chatbox').focus();

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
		var messageBox = this.ui.find('.input-chatbox');
		var text       = messageBox.html();

		var messageBoxUser = this.ui.find('.input .username');
		var text2       = messageBoxUser.val();

		// Hacky, need to wait the browser to add text in the input
		// If there is no change, send the shortcut.
		Events.setTimeout(function(){
			// Nothing rendered, can process the shortcut
			if ((messageBox.html() === text) && (messageBoxUser.val() === text2)) {
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
	ChatBox.onKeyDown = function OnKeyDown( event )
	{
		var messageBox = this.ui.find('.input-chatbox');
		var nickBox    = this.ui.find('.input .username');
		this.ui.find('.header tr td div.on input').on('keyup', function(){
			ChatBoxSettings.updateTab(ChatBox.activeTab, this.value);
		});

		var activeElement = document.activeElement;
		var isChatInputFocused = (activeElement === messageBox[0] || activeElement === nickBox[0]);
		var isOtherTextInputFocused = activeElement &&
			!isChatInputFocused &&
			((activeElement.tagName && activeElement.tagName.match(/input|select|textarea/i)) ||
				activeElement.isContentEditable);

		if (isOtherTextInputFocused) {
			return true;
		}

		switch (event.which) {

			//  Battle mode system (Includes F1-F24, 0-9, A-Z, ALT, SHIFT, CTRL)
			default:
				if (isChatInputFocused) {
					// Allow battle-mode F-keys and Escape to work while typing.
					if (event.which >= KEYS.F1 && event.which <= KEYS.F24) {
						// F11/F12 are global functions (toggle UI / screenshot); let them bubble
						// but block browser defaults (fullscreen/devtools).
						if (event.which === KEYS.F11 || event.which === KEYS.F12) {
							event.preventDefault();
							return true;
						}

						if (ChatBox.processBattleMode(event.which)) {
							event.preventDefault();
							event.stopImmediatePropagation();
							return false;
						}
						// Even if unbound, block browser F-key defaults.
						event.preventDefault();
						event.stopImmediatePropagation();
						return false;
					}

					// AltGr (Ctrl+Alt on some layouts) should be treated as text input.
					if (event.getModifierState && event.getModifierState('AltGraph')) {
						event.stopImmediatePropagation();
						return true;
					}

					// Allow CTRL-combinations (shortcuts) to work while chat is open,
					// but preserve common text-editing combos inside the input.
					if (event.ctrlKey || KEYS.CTRL) {
						var isEditingCombo =
							event.which === KEYS.C ||
							event.which === KEYS.V ||
							event.which === KEYS.X ||
							event.which === KEYS.A ||
							event.which === KEYS.Z ||
							event.which === KEYS.Y;

						if (!isEditingCombo) {
							if (ChatBox.processBattleMode(event.which)) {
								event.preventDefault();
								event.stopImmediatePropagation();
								return false;
							}

							// Block browser/system CTRL defaults (refresh, close tab, etc.),
							// but let the game/UI receive the shortcut.
							event.preventDefault();
							return true;
						}

						// Editing combos: keep within the input and don't bubble to game.
						event.stopImmediatePropagation();
						return true;
					}

					// Allow ALT-combinations to work while chat is open, but keep basic
					// caret/navigation keys local to the input.
					if (event.altKey || KEYS.ALT) {
						var isAltEditingCombo =
							event.which === KEYS.LEFT ||
							event.which === KEYS.RIGHT ||
							event.which === KEYS.UP ||
							event.which === KEYS.DOWN ||
							event.which === KEYS.BACKSPACE ||
							event.which === KEYS.DELETE ||
							event.which === KEYS.HOME ||
							event.which === KEYS.END;

						if (!isAltEditingCombo) {
							if (ChatBox.processBattleMode(event.which)) {
								event.preventDefault();
								event.stopImmediatePropagation();
								return false;
							}

							// Block browser ALT defaults (menus/navigation) but let the
							// game/UI receive the shortcut.
							event.preventDefault();
							return true;
						}

						// Navigation combos: keep within the input.
						event.stopImmediatePropagation();
						return true;
					}

					if (event.which === KEYS.ESCAPE || event.key === "Escape") {
						// Let UIManager/game handle Escape.
						return true;
					}

					// Let the browser handle text input, but don't bubble to game controls.
					event.stopImmediatePropagation();
					return true;
				}

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

			// Switch from user name, to message input
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

			// Get back message from history
			case KEYS.UP:
				if (!jQuery('#NpcMenu').length) {
					if (document.activeElement === messageBox[0]) {
						if (shouldLetChatInputHandleVerticalArrows(messageBox[0], 'up')) {
							event.stopImmediatePropagation();
							return true;
						}
						messageBox.html(_historyMessage.previous()).select();
						break;
					}

					if (document.activeElement === nickBox[0]) {
						nickBox.val(_historyNickName.previous()).select();
						break;
					}
				}
				return true;

			// Message from history
			case KEYS.DOWN:
				if (!jQuery('#NpcMenu').length) {
					if (document.activeElement === messageBox[0]) {
						if (shouldLetChatInputHandleVerticalArrows(messageBox[0], 'down')) {
							event.stopImmediatePropagation();
							return true;
						}
						messageBox.html(_historyMessage.next()).select();
						break;
					}

					if (document.activeElement === nickBox[0]) {
						nickBox.val(_historyNickName.next()).select();
						break;
					}
				}
				return true;

			// Update chat height
			case KEYS.F10:
				this.updateHeight(false);
				// scroll down when resize
				this.ui.find('.content')[this.activeTab].scrollTop = this.ui.find('.content')[this.activeTab].scrollHeight;
				break;

			// Send message
			case KEYS.ENTER:
				if (document.activeElement.className === 'message input-chatbox' &&
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
		var messageBox = this.ui.find('.input-chatbox');

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
		var $text = input.find('.input-chatbox');

		var user = $user.val();
		var text = extractChatMessage($text);
		var trimmedText = text.replace(/\u00A0/g, ' ').trim();
		var isChatOn = false;

		// Battle mode
		if (!trimmedText.length) {
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
		if (user.length && trimmedText[0] !== '/') {
			this.PrivateMessageStorage.nick = user;
			this.PrivateMessageStorage.msg  = trimmedText;
			_historyNickName.push(user);
			_historyNickName.previous();
		}

		// Save in history
		_historyMessage.push(trimmedText);

		$text.html('');

		// Command
		if (trimmedText[0] === '/') {
			Commands.processCommand.call(this, trimmedText.substr(1) );
			return;
		}

		this.onRequestTalk( user, trimmedText, ChatBox.sendTo );
	};

	/**
	 * Extract plain chat text from the contenteditable input while preserving item links.
	 * Replaces `.item-link` spans with their `data-item` payload and strips any remaining markup.
	 */
	function extractChatMessage($input)
	{
		var clone = $input.clone();

		clone.find('span.item-link').each(function() {
			var itemData = jQuery(this).attr('data-item') || jQuery(this).data('item') || '';
			jQuery(this).replaceWith(document.createTextNode(itemData));
		});

		var result = clone.text();
		result = result.replace(/\u00A0/g, ' ');
		return result;
	}


	/**
	 * Add text to chatbox
	 *
	 * @param {string} text
	 * @param {number} colorType
	 * @param {number} filterType
	 * @param {string} color
	 * @param {boolean} override - default false, html or text ?
	 */
	ChatBox.addText = function addText(text, colorType, filterType, color, override)
	{
		// parse as many <ITEMLINK> or <ITEML> as possible and replace with clickable item link, but first decode the link to get the item id
		text = text.replace(/<ITEMLINK>.*?<\/ITEMLINK>|<ITEML>.*?<\/ITEML>|<ITEM>.*?<\/ITEM>/gi, function(match) {
			let item = DB.parseItemLink(match);
			let span = '<span data-item="' + match + '" class="item-link" style="color:#FFFF63;">&lt;' + item.name + '&gt;</span>';
			override = true;
			return span;
		});

		// Backward compatibility for older calls without filter
		if(isNaN(filterType)){
			filterType = ChatBox.FILTER.PUBLIC_LOG;
		}

		// Add to the buffer instead of processing immediately
		_messageBuffer.push({
			text: text,
			colorType: colorType,
			filterType: filterType,
			color: color,
			override: override
		});

		// Schedule buffer flush using requestAnimationFrame
		if (!_rafScheduled) {
			_rafScheduled = true;
			requestAnimationFrame(function() {
				_rafScheduled = false;
				flushMessageBuffer();
			});
		}
	};

	/**
	 * Process all messages in the buffer at once
	 */
	function flushMessageBuffer() {
		if (_messageBuffer.length === 0) {
			return;
		}

		// Process all messages in the buffer
		var messages = _messageBuffer.slice();
		_messageBuffer = [];

		// Group messages by tab to minimize DOM operations
		var messagesByTab = {};

		messages.forEach(function(msg) {
			ChatBox.tabs.forEach(function(tab, TabNum) {
				var chatTabOption = ChatBoxSettings.tabOption[TabNum];

				if (!chatTabOption.includes(msg.filterType)) {
					return;
				}

				if (!messagesByTab[TabNum]) {
					messagesByTab[TabNum] = [];
				}

				messagesByTab[TabNum].push(msg);
			});
		});

		// Add messages of each tab at once
		Object.keys(messagesByTab).forEach(function(TabNum) {
			var content = ChatBox.ui.find('.content[data-content="'+ TabNum +'"]');
			var fragment = document.createDocumentFragment();

			// Get scroll state before adding messages
			var wasAtBottom = shouldScrollDownBeforeAdd(content[0], content.height());

			messagesByTab[TabNum].forEach(function(msg) {
				var color = msg.color || getColorForType(msg.colorType);
				var div = jQuery('<div/>').css('color', color)[!msg.override ? 'text' : 'html'](msg.text)[0];
				fragment.appendChild(div);
			});

			// Add all at once (1 reflow instead of N)
			content[0].appendChild(fragment);

			// Clean up old messages
			while (content[0].childElementCount > MAX_MSG) {
				var element = content[0].firstElementChild;
				var matches = element.innerHTML.match(/(blob:[^"]+)/g);
				if (matches) {
					for (var i = 0; i < matches.length; i++) {
						window.URL.revokeObjectURL(matches[i]);
					}
				}
				element.remove();
			}

			// Update the scroll only if it was at the bottom
			if (wasAtBottom) {
				content[0].scrollTop = content[0].scrollHeight;
			}
		});
	}

	/**
	 * Determine color based on message type
	 * @param {number} colorType
	 * @return {string} color hex
	 *
	 *
	 */
	function getColorForType(colorType) {
		if ((colorType & ChatBox.TYPE.PUBLIC) && (colorType & ChatBox.TYPE.SELF)) {
			return '#00FF00';
		}
		else if (colorType & ChatBox.TYPE.PARTY) {
			return (colorType & ChatBox.TYPE.SELF) ? 'rgb(200, 200, 100)' : 'rgb(230,215,200)';
		}
		else if (colorType & ChatBox.TYPE.GUILD) {
			return 'rgb(180, 255, 180)';
		}
		else if (colorType & ChatBox.TYPE.PRIVATE) {
			return '#FFFF00';
		}
		else if (colorType & ChatBox.TYPE.ERROR) {
			return '#FF0000';
		}
		else if (colorType & ChatBox.TYPE.INFO) {
			return '#FFFF63';
		}
		else if (colorType & ChatBox.TYPE.BLUE) {
			return '#00FFFF';
		}
		else if (colorType & ChatBox.TYPE.ADMIN) {
			return '#FFFF00';
		}
		else if (colorType & ChatBox.TYPE.MAIL) {
			return '#F4D293';
		}
		return 'white';
	}

	/**
	 * Validates if the scroll was at the bottom before adding new messages
	 * @param {HTMLElement} container
	 * @param {number} height
	 * @return {boolean}
	 */
	function shouldScrollDownBeforeAdd(container, height) {
		const tolerance = 5;
		const atBottom = container.scrollTop + height >= container.scrollHeight - tolerance;

		// If there is no scrollbar or is at the end, return true
		if (height >= container.scrollHeight || atBottom) {
			return true;
		}

		return false;
	}


	/**
	 * Change chatbox's height
	 */
	ChatBox.updateHeight = function changeHeight( AlwaysVisible )
	{
		var HeightList = [ 0, 0, MAGIC_NUMBER, MAGIC_NUMBER*2, MAGIC_NUMBER*3, MAGIC_NUMBER*4, MAGIC_NUMBER*5 ];
		var content    = this.ui.find('.contentwrapper');
		var bottomBefore = getChatBottomAnchorPx(this.ui, this.__lastBottomY);

		_heightIndex = (_heightIndex + 1) % HeightList.length;

		// Don't remove UI (button cycles to "input only" instead of hidden)
		if (_heightIndex === 0 && AlwaysVisible) {
			_heightIndex = 1;
		}

		content.height( HeightList[ _heightIndex ] );

		switch (_heightIndex) {
			case 0:
				this.__lastBottomY = bottomBefore;
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

		// Keep the input/battlemode bar at the same screen position.
		if (_heightIndex !== 0 && isFinite(bottomBefore)) {
			var bottomAfter = getChatBottomAnchorPx(this.ui, bottomBefore);
			if (isFinite(bottomAfter)) {
				var top = parseInt(this.ui.css('top'), 10);
				top = isFinite(top) ? top : 0;
				this.ui.css('top', top + (bottomBefore - bottomAfter));
				this.__lastBottomY = bottomBefore;
			}
		}

		var active = this.ui.find('.content[data-content="'+ this.activeTab +'"]')[0];
		if (active) {
			active.scrollTop = active.scrollHeight;
		}
	};

	function getChatBottomAnchorPx($ui, fallback)
	{
		var bar = $ui.find('.input:visible');
		if (bar.length) {
			var rect = bar[0].getBoundingClientRect();
			return rect.bottom;
		}

		bar = $ui.find('.battlemode:visible');
		if (bar.length) {
			var rect2 = bar[0].getBoundingClientRect();
			return rect2.bottom;
		}

		if (isFinite(fallback)) {
			return fallback;
		}

		return NaN;
	}

	function shouldLetChatInputHandleVerticalArrows(inputEl, direction)
	{
		if (!inputEl || !window.getSelection) {
			return false;
		}

		var sel = window.getSelection();
		if (!sel || sel.rangeCount < 1) {
			return false;
		}

		var range = sel.getRangeAt(0);
		if (!range) {
			return false;
		}

		var anchorNode = sel.anchorNode || range.startContainer;
		if (!anchorNode) {
			return false;
		}

		// Only consider caret inside the chat input.
		if (anchorNode !== inputEl && !(inputEl.contains && inputEl.contains(anchorNode))) {
			return false;
		}

		// If user has a selection, let the browser handle navigation.
		if (!sel.isCollapsed) {
			return true;
		}

		// Only do this when there is more than one visual line.
		var text = extractChatMessage(jQuery(inputEl));
		var hasNewline = text.indexOf('\n') > -1;
		var hasOverflow = (inputEl.scrollHeight > inputEl.clientHeight + 1);
		if (!hasNewline && !hasOverflow) {
			return false;
		}

		var caretRect;
		try {
			caretRect = range.getClientRects && range.getClientRects().length ? range.getClientRects()[0] : range.getBoundingClientRect();
		} catch(e) {
			return true;
		}

		if (!caretRect) {
			return true;
		}

		var inputRect = inputEl.getBoundingClientRect ? inputEl.getBoundingClientRect() : null;
		if (!inputRect) {
			return true;
		}

		// If caret is not on the first/last visible line, allow normal arrow behavior.
		if (direction === 'up') {
			return caretRect.top > (inputRect.top + 2);
		}

		if (direction === 'down') {
			return caretRect.bottom < (inputRect.bottom - 2);
		}

		return false;
	}


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
		var lineHeight;

		if (event.originalEvent.wheelDelta) {
			delta = event.originalEvent.wheelDelta / 120 ;
			if (window.opera) {
				delta = -delta;
			}
		}
		else if (event.originalEvent.detail) {
			delta = -event.originalEvent.detail;
		}

		lineHeight = getScrollLineHeightPx(this);
		this.scrollTop = Math.floor(this.scrollTop / lineHeight) * lineHeight - (delta * lineHeight);
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
			var $input = ChatBox.ui.find('.input-chatbox');

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

	function setChatFontScale(scale)
	{
		return function setChatFontScaleClosure()
		{
			_preferences.fontScale = clampChatFontScale(scale);
			_preferences.save();
			ChatBox.applyFontScale();
		};
	}

	function clampChatFontScale(scale)
	{
		var allowed = [1.0, 1.2, 1.4];
		var i, best = allowed[0], bestDist = Infinity;

		scale = parseFloat(scale);
		if (!isFinite(scale) || scale <= 0) {
			return 1.0;
		}

		for (i = 0; i < allowed.length; ++i) {
			var dist = Math.abs(allowed[i] - scale);
			if (dist < bestDist) {
				bestDist = dist;
				best = allowed[i];
			}
		}

		return best;
	}

	function getScrollLineHeightPx(element)
	{
		var style, lh;

		try {
			style = window.getComputedStyle(element);
			lh = parseFloat(style.lineHeight);
			if (isFinite(lh) && lh > 0) {
				return Math.round(lh);
			}
		} catch(e) {}

		return 14;
	}

	ChatBox.applyFontScale = function applyFontScale()
	{
		var scale = clampChatFontScale(_preferences.fontScale || 1.0);
		var baseFont = 12;
		var baseLineHeight = 14;
		var baseInputLineHeight = 18;

		var fontSize = Math.max(10, Math.round(baseFont * scale));
		var lineHeight = Math.max(12, Math.round(baseLineHeight * scale));
		var inputLineHeight = Math.max(14, Math.round(baseInputLineHeight * scale));

		_preferences.fontScale = scale;

		// Chat log
		this.ui.find('.content').css({
			fontSize: fontSize + 'px',
			lineHeight: lineHeight + 'px'
		});

		// Chat input (match "whisp box" inputs)
		this.ui.find('.input input, .input .message').css({
			fontFamily: 'Arial',
			fontSize: fontSize + 'px'
		});
		this.ui.find('.input .message').css({
			lineHeight: inputLineHeight + 'px'
		});
	};

	function makeResizableDiv() {
		var resizer = ChatBox.ui.find('.event_add_cursor')[0];
		if (!resizer) {
			return;
		}

		var originalHeight = 0;
		var originalAnchorY = 0;
		var originalMouseY = 0;

		var fixHeight = function fixHeight(height) {
			return Math.floor(height / MAGIC_NUMBER) * MAGIC_NUMBER;
		};

		var resize = function resize(e) {
			var height = fixHeight(originalHeight - (e.pageY - originalMouseY));
			// Clamp to supported height steps (keep in sync with updateHeight()).
			height = Math.max(MAGIC_NUMBER, Math.min(MAGIC_NUMBER * 5, height));

			ChatBox.ui.css('top', originalAnchorY - height);
			ChatBox.ui.find('.contentwrapper').height(height);
			_heightIndex = Math.max(2, Math.min(6, (height / MAGIC_NUMBER) + 1));

			var active = ChatBox.ui.find('.content[data-content="'+ ChatBox.activeTab +'"]')[0];
			if (active) {
				active.scrollTop = active.scrollHeight;
			}
		};

		var stopResize = function stopResize() {
			window.removeEventListener('mousemove', resize);
			window.removeEventListener('mouseup', stopResize);
		};

		resizer.addEventListener('mousedown', function(e) {
			e.preventDefault();
			originalHeight = ChatBox.ui.find('.contentwrapper').height();
			originalAnchorY = parseInt(ChatBox.ui.css('top'), 10) + originalHeight;
			originalMouseY = e.pageY;

			window.addEventListener('mousemove', resize);
			window.addEventListener('mouseup', stopResize);
		});
	}

	
	
	// CLICKABLE ITEM → OPEN ITEMINFO
	jQuery(document).on('click', '.item-link', function (event) {

		// If the link is inside the chat input, keep focus there and do nothing.
		if (jQuery(this).closest('#chatbox .input-chatbox').length) {
			event.stopImmediatePropagation();
			return false;
		}

		let item = DB.parseItemLink(jQuery(this).data('item'));
		if (!item) return;	// item not found

		let ItemInfo = getModule('UI/Components/ItemInfo/ItemInfo');

		ItemInfo.append();
		ItemInfo.setItem(item);
	});
	
	ChatBox.insertText = function(text) {
		// Find chat input
		var input = this.ui.find('.input-chatbox');

		// Append text
		input.append(document.createTextNode(text));

		// Focus input
		input.focus();
	};

	/**
	 * Create componentand export it
	 */
	return UIManager.addComponent(ChatBox);
});
