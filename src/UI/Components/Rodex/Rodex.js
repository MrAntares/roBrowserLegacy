/**
 * UI/Components/Rodex/Rodex.js
 *
 * Rodex Box
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
	var jQuery = require('Utils/jquery');
	var Preferences = require('Core/Preferences');
	var Renderer = require('Renderer/Renderer');
	var ChatBox = require('UI/Components/ChatBox/ChatBox');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	
	var htmlText = require('text!./Rodex.html');
	var cssText = require('text!./Rodex.css');


	/**
	 * Create Component
	 */
	var Rodex = new UIComponent('Rodex', htmlText, cssText);

	/**
	 * Store Rodex items
	 */
	Rodex.list = [];
	/**
   * Determine data page size
   */
	Rodex.pageSize = 6;
	/**
	 * know which page is current
	 */
	Rodex.page = 0;

	/**
	 * know which tab is current
	 */
	Rodex.openType = -1;

	/**
	 * know which tab is current
	 */
	Rodex.currentTab = 0;

	Rodex.attachmentType = {
		0: '', // none
		2: 'basic_interface/rodexsystem/renewal/icon_zeny.bmp', // zeny
		4: 'basic_interface/rodexsystem/renewal/icon_item.bmp', // item
		6: 'basic_interface/rodexsystem/renewal/icon_zeny_n_item.bmp', // zeny + item
		12: 'basic_interface/rodexsystem/renewal/icon_zeny_n_item.bmp', // gift??
	}


	/**
	 * @var {Preferences} structure
	 */
	var _preferences = Preferences.get('Rodex', {
		x: 350,
		y: 350,
		show: false,
	}, 2.0);

	/**
	 * Apply preferences once append to body
	 */
	Rodex.onAppend = function OnAppend() {
		// Apply preferences
		this.ui.css({
			top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
		});

		this.draggable(this.ui.find('.titlebar'));

		this.ui.find('.close').on('click', onClickClose);
		this.ui.find('.refresh').on('click', onClickRefresh);
		this.ui.find('.write').on('click', onClickWriteMail);
		this.ui.find('.delete-all').on('click', onClickDeleteAll);
		this.ui.find('.retrieve-all').on('click', onClickRetrieveAll);
		this.ui.find('.previous-page').on('click', onClickPreviousPage);
		this.ui.find('.next-page').on('click', onClickNexPage);
	};

	/**
	* Remove Rodex from window (and so clean up items)
	*/
	Rodex.onRemove = function OnRemove() {
		this.list.length = 0;
		// Save preferences
		_preferences.show = this.ui.is(':visible');
		_preferences.y = parseInt(this.ui.css('top'), 10);
		_preferences.x = parseInt(this.ui.css('left'), 10);
		_preferences.save();
	};


	/**
	* Extend Rodex window size
	*
	* @param {object} read
	*/
	Rodex.initData = function initData(pkt) {
		Rodex.list = pkt.MailList;
		Rodex.isEnd = pkt.isEnd;
		Rodex.openType = (typeof pkt.openType !== 'undefined') ? pkt.openType : -1;
		Rodex.createRodexList();
		Rodex.ui.show();
		Rodex.ui.focus();
	};

	Rodex.createRodexList = function createRodexList() {
		var content = Rodex.ui.find('.mail-list');
		content.html('');
		if (Rodex.list.length == 0) return;
		let start = (Rodex.list.length > Rodex.pageSize) ? Rodex.page * Rodex.pageSize : 0;

		for (let i = start; i < Rodex.pageSize && i < Rodex.list.length; i++) {
			let mail = Rodex.list[i];
			let mailID = mail.MailID;
			let title = mail.title.length > 18 ? mail.title.substring(0, 18) + "..." : mail.title;
			let sender = mail.SenderName.length > 18 ? mail.SenderName.substring(0, 18) + "..." : mail.SenderName;
			let mail_image = (mail.Isread) ? 'icon_status_mail_read' : 'icon_status_mail_received';
			let mail_content = Rodex.attachmentType[mail.type];
			let remaining_days = parseInt(mail.expireDateTime / 60 / 60 / 24);
			let openType = (typeof mail.openType !== 'undefined') ? mail.openType : 0;
			let mail_html =
				`
			<li class="mail-item">
				<div class="mail-checkbox" data-background="basic_interface/rodexsystem/renewal/checkbox_off.bmp">
				</div>
				<div class="mail-image" data-background="basic_interface/rodexsystem/renewal/` + mail_image + `.bmp">
				</div>
				<div class="mail-text">
					<div class="title" ><div id="mail_` + mailID + `" openType="` + openType + `" class="text event_add_cursor"><span data-text="2702"></span>` + title + `</div></div>
					<div class="sender"><div id="sender_` + mailID + `" sender="` + sender + `"class="text event_add_cursor"><span data-text="2701"></span>` + sender + `</div></div>
				</div>
				<div class="mail-content" data-background="`+ mail_content + `"></div>
				<div class="expire-days">` + remaining_days + ` days</div>
			</li>
			`;
			content.append(mail_html);
			Rodex.ui.find("#mail_" + mailID).on('click', onClickReadMail);
			Rodex.ui.find("#sender_" + mailID).on('click', onClickReplyMail);
		}
		content.each(this.parseHTML).find('*').each(this.parseHTML);
	}

	Rodex.getMailByID = function getMailByID(mailID) {
		return Rodex.list.find(mail => mail.MailID == mailID);
	}

	Rodex.getAll = function getAll() {
		for(let i = 0; i < Rodex.list.length; i++) {
			let mail = Rodex.list[i];
			if(mail.type > 0 && (mail.type == 4 || mail.type == 6)) {
				Rodex.requestItemsFromRodex(mail.openType, mail.MailID);
			}
			if(mail.type > 0 && (mail.type == 2 || mail.type == 6)) {
				Rodex.requestZenyFromRodex(mail.openType, mail.MailID);
			}
		}
	}

	Rodex.deleteAll = function deleteAll() {
		for(let i = 0; i < Rodex.list.length; i++) {
			let mail = Rodex.list[i];
			if(mail.type == 0) { // delete only empty mails
				Rodex.requestDeleteRodex(mail.openType, mail.MailID);
			} else {
				ChatBox.addText(DB.getMessage(2612), ChatBox.TYPE.INFO_MAIL, ChatBox.FILTER.PUBLIC_LOG);
			}
		}
	}

	Rodex.updateDeletedMailContent = function updateDeletedMailContent(openType, MailID) {
		Rodex.ui.find("#mail_" + MailID).html(DB.getMessage(2907));
		Rodex.ui.find("#mail_" + MailID).addClass('deleted')
		Rodex.ui.find("#sender_" + MailID).html('');
	}

	/**
	 * Show/Hide UI
	 */
	Rodex.toggle = function toggle() {
		if (this.ui.is(':visible')) {
			Rodex.closeRodexBox();
			Rodex.ui.hide();
		} else {
			Rodex.openRodexBox();
			Rodex.append();
			Rodex.ui.show();
			Rodex.ui.focus();
		}
	};

	function createRodexList() {
		if (Rodex.list.mailList.length === 0) {
			Rodex.ui.find('.prev_next').hide();
		} else {
			Rodex.ui.find('#infor_page').text((Rodex.page + 1) + "/" + Math.ceil(Rodex.list.mailList.length / Rodex.pageSize));
		}

		adjustButtons();
	}



	function adjustButtons() {
		if (Rodex.list.length == 0) return;
		let mailLength = Rodex.list.mailList.length;

		if (!(Rodex.page > mailLength / Rodex.pageSize - 1)) {
			addEventNextAndPrevAdd('next');
		} else {
			addEventNextAndPrevRemove('next');
		}
		if (!(Rodex.page == 0)) {
			addEventNextAndPrevAdd('prev');
		} else {
			addEventNextAndPrevRemove('prev');
		}

		Rodex.ui.find('.next span').prop('disabled', mailLength <= Rodex.pageSize || Rodex.page > mailLength / Rodex.pageSize - 1);
		Rodex.ui.find('.prev span').prop('disabled', mailLength <= Rodex.pageSize || Rodex.page == 0);
	}

	function addEventNextAndPrevAdd(eventName) {
		var overlay = Rodex.ui.find('.prev_next .overlay_' + eventName + '');
		var text = Rodex.ui.find('.prev_next .' + eventName + ' span');
		text.addClass('event_add_cursor');
		overlay.text(text.text());

		Rodex.ui.find('.' + eventName + ' .event_add_cursor').mouseover(function () {
			if (text.hasClass('event_add_cursor')) {
				overlay.show();
			}
		}).mouseout(function () {
			overlay.hide();
		});
	}

	function addEventNextAndPrevRemove(eventName) {
		// Get back data
		var overlay = Rodex.ui.find('.prev_next .overlay_' + eventName + '');
		var text = Rodex.ui.find('.prev_next .' + eventName + ' span');
		// Display box
		overlay.hide();
		text.removeClass('event_add_cursor');
	}

	function updatePageRodexItems() {
		Rodex.ui.find('.next').click(function (e) {
			e.stopImmediatePropagation();
			if (Rodex.page < Rodex.list.mailList.length / Rodex.pageSize - 1) {
				Rodex.page++;
				createRodexList();
				adjustButtons();
			}
		});
		Rodex.ui.find('.prev').click(function (e) {
			e.stopImmediatePropagation();
			if (Rodex.page > 0) {
				Rodex.page--;
				createRodexList();
				adjustButtons();
			}
		});
		createRodexList();
	}

	function onClickClose(e) {
		e.stopImmediatePropagation();
		Rodex.closeRodexBox();
		Rodex.ui.hide();
	}

	function onClickRefresh(e) {
		e.stopImmediatePropagation();
		Rodex.requestRefreshRodexPage();
	}

	function onClickWriteMail(e) {
		e.stopImmediatePropagation();
		Rodex.requestOpenWriteRodex();
	}

	function onClickDeleteAll(e) {
		//0x9f5
		e.stopImmediatePropagation();
		UIManager.showPromptBox(DB.getMessage(3590), 'ok', 'cancel', function () {
			Rodex.deleteAll();
		});
	}

	function onClickRetrieveAll(e) {
		//0x9f3 and 09f1
		e.stopImmediatePropagation();
		UIManager.showPromptBox(DB.getMessage(3594), 'ok', 'cancel', function () {
			Rodex.getAll();
		});
	}

	function onClickPreviousPage(e) {
		e.stopImmediatePropagation();
		//Rodex.requestOpenWriteRodex();
	}

	function onClickNexPage(e) {
		e.stopImmediatePropagation();
		//Rodex.requestOpenWriteRodex();
	}

	function onClickReadMail(e) {
		e.stopImmediatePropagation();
		let element = jQuery(e.currentTarget);
		let mid = element.attr('id');
		let openType = element.attr('openType');
		let id = mid.replace("mail_", "");
		Rodex.requestReadRodex(openType, id);
	}

	function onClickReplyMail(e) {
		e.stopImmediatePropagation();
		let element = jQuery(e.currentTarget);
		let sender = element.attr('sender');
		Rodex.requestOpenWriteRodex(sender);
	}

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(Rodex);
});

