/**
 * UI/Components/Mail/Mail.js
 *
 * Chararacter Mail
 *
 * @author Francisco Wallison
 *
 */
 define(function(require)
 {
	 'use strict';


	 /**
	  * Dependencies
	  */
	 var DB                 = require('DB/DBManager');
	 var jQuery             = require('Utils/jquery');
	 var Preferences        = require('Core/Preferences');
	 var Client             = require('Core/Client');
	 var Session      		= require('Engine/SessionStorage');
	 var Renderer           = require('Renderer/Renderer');
	 var Mouse              = require('Controls/MouseEventHandler');
	 var KEYS               = require('Controls/KeyEventHandler');
	 var InputBox           = require('UI/Components/InputBox/InputBox');
	 var ItemInfo           = require('UI/Components/ItemInfo/ItemInfo');
	 var Inventory			= require('UI/Components/Inventory/Inventory');
	 var ChatBox            = require('UI/Components/ChatBox/ChatBox');
	 var UIManager          = require('UI/UIManager');
	 var UIComponent        = require('UI/UIComponent');
	 var htmlText           = require('text!./Mail.html');
	 var cssText            = require('text!./Mail.css');


	 /**
	  * Create Component
	  */
	 var Mail = new UIComponent( 'Mail', htmlText, cssText );

	 /**
	  * Store Mail items
	  */
	 Mail.list = [];
 	 /**
	  * Determine data page size
	  */
	 Mail.pageSize = 7;
	 /**
	  * know which page is current
	  */
	 Mail.page = 0;


	 /**
	  * @var {number} used to remember the window height
	  */
	 var _realSize = 0;


	 /**
	  * @var {Preferences} structure
	  */
	 var _preferences = Preferences.get('Mail', {
		 x:        0,
		 y:        172,
		 width:    7,
		 height:   4,
		 show:     false,
		 reduce:   false,
		 magnet_top: false,
		 magnet_bottom: false,
		 magnet_left: true,
		 magnet_right: false,
		 item_add_email: {}
	 }, 2.0);

	 /**
	  * Apply preferences once append to body
	  */
	 Mail.onAppend = function OnAppend()
	 {
		this.ui.find('.right .close').on('click',this.onClosePressed.bind(this)).removeClass( "hover" );
		this.ui.find('#inbox').on('click',offCreateMessagesOnWindowMailbox);  // remove all item reset layout
		this.ui.find('#write').on('click',openWindowCreateMessages);  // remove all item reset layouts
		this.ui.find('#create_mail_cancel').on('click',offCreateMessagesOnWindowMailbox); // remove all item reset layout
		this.ui.find('#create_mail_send').on('click',sendCreateMessagesMail); // send mail

		updatePageMailItems();

		this.ui
			.find('.container_item')
			// on drop item
			.on('drop', onDrop)
			.on('dragover', stopPropagation)
				// item
				.on('mouseover',   '.item', onItemOver)
				.on('mouseout',    '.item', onItemOut)
				.on('dragstart',   '.item', onItemDragStart)
				.on('dragend',     '.item', onItemDragEnd)
				.on('contextmenu', '.item', onItemInfo);


		// Validate information dragged into text field
		this.ui.find('input[type=text]')
				.on('drop', onDropText)
				.on('dragover', stopPropagation)

		this.ui.find('textarea')
				.on('drop', onDropText)
				.on('dragover', stopPropagation)

		this.ui.find('#zeny_amt').on('click',onAddZenyInput);
		this.ui.find('#zeny_ok').on('click',onValidZenyInput);

		onWindowMailbox();

		// Apply preferences
		this.ui.css({
			top:  Math.min( Math.max( 0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min( Math.max( 0, _preferences.x), Renderer.width  - this.ui.width())
		});

		this.draggable(this.ui.find('.titlebar'));
	 };


	/**
	 * Add item to inventory
	 *
	 * @param {object} Item
	 */
	Mail.addItemSub = function AddItemSub(Index)
	{
		let item = _preferences.item_add_email;
		if(item.index !== Index){
			return false;
		}
		// Equip item (if not arrow)
		if (item.WearState && item.type !== ItemType.AMMO && item.type !== ItemType.CARD) {
			//Equipment.equip(item);
			return false;
		}

		var it      = DB.getItemInfo( item.ITID );
		var content = this.ui.find('.container_item');
		this.ui.find(".item" ).remove();
		content.append(
			'<div class="item" data-index="'+ item.index +'" draggable="true">' +
				'<div class="icon"></div>' +
				'<div class="amount"><span class="count">' + (item.count || 1) + '</span></div>' +
			'</div>'
		);
		this.ui.find('.hide').show();
		Client.loadFile( DB.INTERFACE_PATH + 'item/' + ( item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName ) + '.bmp', function(data){
			content.find('.item[data-index="'+ item.index +'"] .icon').css('backgroundImage', 'url('+ data +')');
		});
		return true;
	};


	 /**
	  * Send from mail to inventory
	  * Remove item
	  */
	 Mail.removeItem = function removeItem()
	 {
		this.ui.find(".item" ).remove();
	 };


	 /**
	  * Send from mail to inventory
	  * Remove zenys
	  */
	 Mail.removeZeny = function removeZeny()
	 {
		this.ui.find(".input_zeny_amt" ).val('');
	 };

	 /**
	  * Remove Mail from window (and so clean up items)
	  */
	 Mail.onRemove = function OnRemove()
	 {
		 this.list.length = 0;
		 // Save preferences
		 _preferences.show   =  this.ui.is(':visible');
		 _preferences.reduce = !!_realSize;
		 _preferences.y      =  parseInt(this.ui.css('top'), 10);
		 _preferences.x      =  parseInt(this.ui.css('left'), 10);
		 _preferences.width  =  Math.floor( (this.ui.width()  - (23 + 16 + 16 - 30)) / 32 );
		 _preferences.height =  Math.floor( (this.ui.height() - (31 + 19 - 30     )) / 32 );
		 _preferences.magnet_top = this.magnet.TOP;
		 _preferences.magnet_bottom = this.magnet.BOTTOM;
		 _preferences.magnet_left = this.magnet.LEFT;
		 _preferences.magnet_right = this.magnet.RIGHT;
		 _preferences.save();
	 };

	 /**
	  * Extend Mail window size
	  *
	  * @param {number} width
	  * @param {number} height
	  */
	 Mail.resize = function Resize( width, height )
	 {
		 width  = Math.min( Math.max(width,  6), 9);
		 height = Math.min( Math.max(height, 2), 6);

		 this.ui.css({
			 width:  23 + 16 + 16 + width  * 32,
			 height: 31 + 19      + height * 32
		 });
	 };


	/**
	* Extend Mail window size
	*
	* @param {object} read
	*/
	Mail.mailList = function mailList( read )
	{
		Mail.list = read;
		updatePageMailItems();
	};

	/**
	* Mail receive
	*
	* @param {object} read
	*/
	Mail.mailReceiveUpdate = function mailReceiveUpdate( newMail )
	{
		if(Mail.list.mailList === undefined) return;
		Mail.list.MailNumber = Mail.MailNumber +1;
		let validIsOpen = 0;
		Mail.list.mailList = Mail.list.mailList.map((el) =>
		{
			let newElement = {};

			if(el.MailID == newMail.MailID){
				newElement = {
					DeleteTime: el.DeleteTime,
					FromName: el.FromName,
					HEADER: el.HEADER,
					MailID: el.MailID,
					isOpen: 1
				}
				validIsOpen = 1;
			}else {
				newElement = el;
			}

			return newElement;
		});
		if (!validIsOpen){
			Mail.list.mailList.push(newMail);
		}
		// List Email
		Mail.parseMailrefreshinbox();
	};

	/**
	 * Search in a list for an item by its index
	 *
	 * @param {number} index
	 * @returns {Item}
	 */
	Mail.getItemByIndex = function getItemByIndex( index )
	{
		var list = _preferences.item_add_email;

		if(list.index == index){
			return list;
		}

		return null;
	};

	/**
	 * Responder to a mail.
	 * @param {string} fromName
	 */
	Mail.replyNewMail = function replyNewMail( fromName )
	{
		onWindowCreateMessages();
		Mail.ui.find('.text_to').val(fromName.replace(/^(\$|\%)/, '').replace(/\t/g, ''));
	}

	/**
	 * Responder to a mail.
	 * @param {string} fromName
	 */
	Mail.replyNewMailFriends = async function replyNewMailFriends( fromName )
	{

		Mail.append();
		sleep(1).then(() => {

			// Do something after the sleep!
			onWindowCreateMessages();
			offWindowListMail();
			Mail.ui.find('.text_to').val(fromName.replace(/^(\$|\%)/, '').replace(/\t/g, ''));
			Mail.ui.find('#inbox').off('click');
			Mail.ui.find('#inbox')
				.prop('disabled', false)
			.on('click', function() {

			});
			Mail.ui.find('#create_mail_cancel').off('click');
			Mail.ui.find('#create_mail_cancel').on('click',this.onClosePressed.bind(this));
			//Mail.ui.find('.block_zeny_item').remove();
			//Mail.ui.find('.block_send_cancel').css('margin-top','19%');

		});

	}

	Mail.clearFieldsItemZeny = function clearFieldsItemZeny()
	{
		this.ui.find(".item" ).remove();
		this.ui.find(".input_zeny_amt" ).val('');
		this.ui.find('#create_mail_send').prop('disabled', false);
	}

	Mail.onKeyDown = function onKeyDown( event )
	{
		if ((event.which === KEYS.ESCAPE || event.key === "Escape") && this.ui.is(':visible')) {
			this.remove();
		}
	};

	/*
	* Update item pagination
	*/
	function updatePageMailItems()
	{
		Mail.ui.find('.next').click(function(e) {
			e.stopImmediatePropagation();
			if (Mail.page < Mail.list.mailList.length / Mail.pageSize - 1) {
				Mail.page++;
				createMailList();
				adjustButtons();
			}
		});
		Mail.ui.find('.prev').click(function(e) {
			e.stopImmediatePropagation();
			if (Mail.page > 0) {
				Mail.page--;
				createMailList();
				adjustButtons();
			}
		});
		createMailList();
	}

	 /**
	 * Create messages window size
	 */
	function onWindowMailbox()
	{
		// List Email
		Mail.parseMailrefreshinbox();

		// Off window create mail
		Mail.ui.find('#create_mail_send').prop('disabled', false);
		Mail.ui.find('.block_create_mail').hide();
		Mail.ui.find('.text_to').val("");
		Mail.ui.find('.input_title').val("");
		Mail.ui.find('.textarea_mail').val("");
		Mail.ui.find('.input_zeny_amt').val("");
		Mail.ui.find('.input_add_item').val("");

		// on window list mail
		Mail.ui.find('.prev_next').show();
		Mail.ui.find('.block_mail').show();
		Client.loadFile( DB.INTERFACE_PATH + 'basic_interface/maillist1_bg.bmp', function(url) {
			Mail.ui.find('.body').css('backgroundImage', 'url(' + url + ')');
		}.bind(this));
		Mail.ui.find('#title').text(DB.getMessage(1025));
	};


	function createMailList()
	{
		var content = Mail.ui.find('.list_item_mail');
		Mail.ui.find(".item_mail" ).remove();

		if(Mail.list.length == 0) return;

		for (var i = Mail.page * Mail.pageSize; i < Mail.list.mailList.length && i < (Mail.page + 1) *  Mail.pageSize; i++)
		{
			let from_name = Mail.list.mailList[i].FromName.length > 15 ?  Mail.list.mailList[i].FromName.substring(0,15)+"..." :  Mail.list.mailList[i].FromName;
			let header = Mail.list.mailList[i].HEADER.length > 23 ?  Mail.list.mailList[i].HEADER.substring(0,23)+"..." :  Mail.list.mailList[i].HEADER;
			let mailId = Mail.list.mailList[i].MailID;
			let isOpen = Mail.list.mailList[i].isOpen;
			content.append(
				`<div class="item_mail">
					<div class="envelop" style="flex: 1;">
						<div class="btn_envelop" id="envelop_`+mailId+`"></div>
					</div>
					<div class="to_title" style="flex: 3;">
						<div class="flex">
							<div  style="flex: 3;">
								<span id="from_name_`+mailId+`" class="event_add_cursor tooltip name_data" > `+ from_name +`
									<span class="tooltiptext to">`+ Mail.list.mailList[i].FromName+`</samp>
								</span>
							</div>
							<div   style="flex: 3;">
								<span class="name_data">`+ formateDeleteTime(Mail.list.mailList[i].DeleteTime) +` </samp>
							</div>

						</div>
						<div >
							<span id="from_header_`+mailId+`" data-id="`+mailId+`" class="event_add_cursor tooltip"> `+ header +`
								<span class="tooltiptext title">`+ Mail.list.mailList[i].HEADER+` </samp>
							</span>
						</div>
					</div>
				</div>`
			);
			if(!isOpen){
				Client.loadFile( DB.INTERFACE_PATH + 'basic_interface/envelop.bmp', function(data){

					content.find('#envelop_'+mailId).css('backgroundImage', 'url('+ data +')');
				});
			}
			Mail.ui.find("#from_name_"+mailId).on('click', () =>
				{
					Mail.replyNewMail(Mail.ui.find("#from_name_"+mailId +" .to").text());
				}
			);
			Mail.ui.find("#from_header_"+mailId).on('click', (event) =>
				{
					Mail.openMail(jQuery(event.currentTarget).data('id'));
				}
			);
		}
		if(Mail.list.mailList.length === 0){
			Mail.ui.find('.prev_next').hide();
		}else{
			Mail.ui.find('#infor_page').text((Mail.page + 1)+"/"+Math.ceil(Mail.list.mailList.length / Mail.pageSize));
		}

		adjustButtons();
	}


	function adjustButtons()
	{
		if(Mail.list.length == 0) return;
		let mailLength = Mail.list.mailList.length;

		if( !(Mail.page > mailLength /  Mail.pageSize - 1)){
			addEventNextAndPrevAdd('next');
		}else{
			addEventNextAndPrevRemove('next');
		}
		if(!(Mail.page == 0)){
			addEventNextAndPrevAdd('prev');
		}else{
			addEventNextAndPrevRemove('prev');
		}

		Mail.ui.find('.next span').prop('disabled', mailLength <=  Mail.pageSize || Mail.page > mailLength /  Mail.pageSize - 1);
    	Mail.ui.find('.prev span').prop('disabled', mailLength <=  Mail.pageSize || Mail.page == 0);
	}

	function addEventNextAndPrevAdd(eventName)
	{
		var overlay = Mail.ui.find('.prev_next .overlay_'+eventName+'');
		var text = Mail.ui.find('.prev_next .'+eventName+' span');
		text.addClass('event_add_cursor');
		overlay.text(text.text());

		Mail.ui.find('.'+eventName+' .event_add_cursor' ).mouseover(function() {
			if(text.hasClass('event_add_cursor')){
				overlay.show();
			}
		}).mouseout(function() {
			overlay.hide();
		});
	}

	function addEventNextAndPrevRemove(eventName)
	{
		// Get back data
		var overlay = Mail.ui.find('.prev_next .overlay_'+eventName+'');
		var text = Mail.ui.find('.prev_next .'+eventName+' span');
		// Display box
		overlay.hide();
		text.removeClass('event_add_cursor');
	}

	function offCreateMessagesOnWindowMailbox(event)
	{
		event.stopImmediatePropagation();
		onWindowMailbox();
		// Reset mail item and/or Zeny
		removeCreateAllItem();// CZ_MAIL_RESET_ITEM

	};

	function sendCreateMessagesMail(event)
	{
		event.stopImmediatePropagation();
		if(Mail.ui.find('#zeny_ok').is(':visible'))
		{
			ChatBox.addText( DB.getMessage(1110), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
			return;
		}

		let to = Mail.ui.find('.text_to').val();
		to = to.length > 50 ? to.substring(0,50) : to;
		let title = Mail.ui.find('.input_title').val();
		title = title.length > 50 ? title.substring(0,50) : title;
		let message = Mail.ui.find('.textarea_mail').val();
		message = message.length > 198 ? message.substring(0,198) : message;

		if(title === "")
		{
			ChatBox.addText( DB.getMessage(1106), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
			return;
		}

		let send_message = {
			ReceiveName: 	to,
			Header:			title,
			msg_len:		message.length,
			msg:			message,
		}
		Mail.ui.find('#create_mail_send').prop('disabled', true);
		Mail.parseMailSend(send_message);
	}

	function openWindowCreateMessages(event)
	{
		event.stopImmediatePropagation();
		onWindowCreateMessages()
	}

	 /**
	 * Open Create messages window size
	 */
	function onWindowCreateMessages()
	{
		// Reset mail item and/or Zeny
		removeCreateAllItem(); // CZ_MAIL_RESET_ITEM

		// Off window list mail
		offWindowListMail();

		Client.loadFile( DB.INTERFACE_PATH + 'basic_interface/maillist2_bg.bmp', function(url) {
			Mail.ui.find('.body').css('backgroundImage', 'url(' + url + ')');
		}.bind(this));
		Mail.ui.find('#title').text(DB.getMessage(1026));
	};


	function offWindowListMail()
	{
		// Off window list mail
		Mail.ui.find('.prev_next').hide();
		Mail.ui.find('.block_mail').hide();

		// Off window create mail
		Mail.ui.find('.block_create_mail').show();
		//Focus textArea
		Mail.ui.find('.textarea_mail').focus();
	}

	function onAddZenyInput(event)
	{
		event.stopImmediatePropagation();
		Mail.ui.find('#zeny_amt').hide();
		Mail.ui.find('#zeny_ok').show();
		Mail.ui.find('.input_zeny_amt').prop('disabled', false);
		Mail.ui.find('.input_zeny_amt').focus();
		Mail.ui.find('.input_zeny_amt').select();
		Mail.parseMailWinopen(2); // reset zeny
	}

	function onValidZenyInput(event)
	{
		event.stopImmediatePropagation();
		Mail.ui.find('#zeny_amt').show();
		Mail.ui.find('#zeny_ok').hide();
		let val_Zeny = Mail.ui.find('.input_zeny_amt').val().split(',').join('');
		val_Zeny     = Math.min( Math.max(0, val_Zeny), Session.zeny);
		val_Zeny 	 = isNaN(val_Zeny) ? 0 : val_Zeny;

		Mail.ui.find('.input_zeny_amt').val(prettifyZeny(val_Zeny));
		Mail.ui.find('.input_zeny_amt').prop('disabled', true);
		// add zeny to mail
		Mail.
			parseMailSetattach(
				0, //zeny
				val_Zeny
			);
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
	 * Drop an item in the equipment, equip it if possible
	 */
	function onDrop( event )
	{

		var item, data;
		event.stopImmediatePropagation();

		try {
			data = JSON.parse(event.originalEvent.dataTransfer.getData('Text'));
			item = data.data;
		}
		catch(e) {
			return false;
		}

		// Just allow item from storage
		if (data.type !== 'item' || (data.from == 'Storage' || data.from == 'Mail')) {
			return false;
		}

		// Have to specify how much
		if (item.count > 1) {
			InputBox.append();
			InputBox.setType('number', false, item.count);
			InputBox.onSubmitRequest = function OnSubmitRequest( count ) {
				InputBox.remove();
				Mail.parseMailWinopen(1); // remove item

				if(data.from == 'Inventory')
				{
					Inventory.getUI().removeItem(
						item.index,
						parseInt(count, 10 )
					);
				}

				Mail.parseMailSetattach(
					item.index,
					parseInt(count, 10 )
				);
				// add itens
				_preferences.item_add_email = item;
				_preferences.item_add_email.count = parseInt(count, 10 )
				_preferences.save();

			};
			return false;
		}


		if(data.from == 'Inventory'){
			Inventory.getUI().removeItem( item.index, 1 );
		}
		Mail.parseMailWinopen(1); // remove item

		Mail.parseMailSetattach( item.index, 1 );
		// add itens
		_preferences.item_add_email = item;
		_preferences.item_add_email.count = 1;
		_preferences.save();

		// this.addItemSub(item);
		return false;
	}

	/**
	 * Show item name when mouse is over
	 */
	function onItemOver()
	{
		var idx  = parseInt( this.getAttribute('data-index'), 10);
		var item = Mail.getItemByIndex(idx);

		if (!item) {
			return;
		}

		// Get back data
		var overlay = Mail.ui.find('.container_item .overlay');

		// Display box
		overlay.show();
		overlay.text(DB.getItemName(item) + ' ' + (item.count || 1) + ' ea');

		if (item.IsIdentified) {
			overlay.removeClass('grey');
		}
		else {
			overlay.addClass('grey');
		}
	}

	/**
	 * Hide the item name
	 */
	function onItemOut()
	{
		Mail.ui.find('.container_item .overlay').hide();
	}

	/**
	 * Start dragging an item
	 */
	function onItemDragStart( event )
	{
		var index = parseInt(this.getAttribute('data-index'), 10);
		var item  = Mail.getItemByIndex(index);

		if (!item) {
			return;
		}

		// Set image to the drag drop element
		var img   = new Image();
		var url   = this.firstChild.style.backgroundImage.match(/\(([^\)]+)/)[1];
		img.decoding = 'async';
		img.src   = url.replace(/^\"/, '').replace(/\"$/, '');

		event.originalEvent.dataTransfer.setDragImage( img, 12, 12 );
		event.originalEvent.dataTransfer.setData('Text',
			JSON.stringify( window._OBJ_DRAG_ = {
				type: 'item',
				from: 'Mail',
				data:  item
			})
		);

		onItemOut();
	}

	/**
	 * Stop dragging an item
	 *
	 */
	function onItemDragEnd()
	{
		delete window._OBJ_DRAG_;
	}

	/**
	 * Get item info (open description window)
	 */
	function onItemInfo( event )
	{
		event.stopImmediatePropagation();

		var index = parseInt(this.getAttribute('data-index'), 10);
		var item  = Mail.getItemByIndex(index);

		if (!item) {
			return false;
		}

		// Don't add the same UI twice, remove it
		if (ItemInfo.uid === item.ITID) {
			ItemInfo.remove();
			return false;
		}

		// Add ui to window
		ItemInfo.append();
		ItemInfo.uid = item.ITID;
		ItemInfo.setItem(item);

		return false;
	}

	/**
	 * Extend Mail window size
	 */
	function resizeHeight(height)
	{
		height = Math.min( Math.max(height, 8), 17);

		Mail.ui.find('.body').css('height', height * 32);
		Mail.ui.css('height', 31 + 19 + height * 32);
	}

	/**
	 * Prettify number (15000 -> 15,000)
	 *
	 * @param {number}
	 * @return {string}
	 */
	function prettifyZeny( value )
	{
		var num = String(value);
		var i = 0, len = num.length;
		var out = '';

		while (i < len) {
			out = num[len-i-1] + out;
			if ((i+1) % 3 === 0 && i+1 !== len) {
				out = ',' + out;
			}
			++i;
		}

		return out;
	}


	/**
	 * Converte DeleteTime
	 *
	 * @param {number}
	 * @return {string}
	 */
	function formateDeleteTime( value )
	{
		// convert unix timestamp to milliseconds
		var ts_ms = value * 1000;
		// initialize new Date object
		var date_ob = new Date(ts_ms);
		// year as 4 digits (YYYY)
		var year = date_ob.getFullYear();
		// month as 2 digits (MM)
		var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
		// date as 2 digits (DD)
		var date = ("0" + date_ob.getDate()).slice(-2);

		return month + " " + date + " " + (year+"").substring(2,4);
	}

	function removeCreateAllItem()
	{
		Mail.parseMailWinopen(0);
		// Layout reset zeny / item
		Mail.clearFieldsItemZeny();
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
		 return false;
	 }

	 /**
	  * Extend Mail window size
	  */
	 function onResize()
	 {
		var ui         = Mail.ui;
		var top        = ui.position().top;
		var lastHeight = 0;
		var _Interval;

		function resizing()
		{
			var extraY = 31 + 19 - 30;
			var h = Math.floor( (Mouse.screen.y - top  - extraY) / 32 );

			// Maximum and minimum window size
			h = Math.min( Math.max(h, 8), 17);

			if (h === lastHeight) {
				return;
			}

			resizeHeight(h);
			lastHeight = h;
		}

		// Start resizing
		_Interval = setInterval( resizing, 30);

		// Stop resizing on left click
		jQuery(window).on('mouseup.resize', function(event){
			if (event.which === 1) {
				clearInterval(_Interval);
				jQuery(window).off('mouseup.resize');
			}
		});
	 }


	// sleep time expects milliseconds
	function sleep (time) {
		return new Promise((resolve) => setTimeout(resolve, time));
	}

	 /**
	 * Callbacks
	 */
	Mail.onClosePressed  				= function onClosePressed(){};
	Mail.parseMailWinopen 				= function parseMailWinopen(/*type*/){};
	Mail.parseMailrefreshinbox 			= function parseMailrefreshinbox(){};
	Mail.parseMailSetattach 			= function parseMailSetattach(/*index, count*/){};
	Mail.reqRemoveItem   				= function reqRemoveItem(/*index, count*/){};
	Mail.parseMailSend  				= function parseMailSend(/*object*/){};
	Mail.openMail   					= function openMail(/*MailID*/){};
	Mail.replyMail   					= function replyMail(/*MailID*/){};


	 /**
	  * Create component and export it
	  */
	 return UIManager.addComponent(Mail);
 });

