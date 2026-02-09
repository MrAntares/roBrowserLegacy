/**
 * UI/Components/CharSelect/CharSelect.js
 *
 * Chararacter Selection windows
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require) {
	'use strict';

	/**
	 * Dependencies
	 */
	var DB = require('DB/DBManager');
	var MonsterTable = require('DB/Monsters/MonsterTable');
	var Preferences = require('Core/Preferences');
	var KEYS = require('Controls/KeyEventHandler');
	var Renderer = require('Renderer/Renderer');
	var Entity = require('Renderer/Entity/Entity');
	var SpriteRenderer = require('Renderer/SpriteRenderer');
	var StatusConst = require('DB/Status/StatusState');
	var Camera = require('Renderer/Camera');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var PACKETVER = require('Network/PacketVerManager');
	var htmlText = require('text!./CharSelectV2.html');
	var cssText = require('text!./CharSelectV2.css');

	/**
	 * Create Chararacter Selection namespace
	 */
	var CharSelectV2 = new UIComponent('CharSelectV2', htmlText, cssText);

	/**
	 * @var {Preferences} save where the cursor position is
	 */
	var _preferences = Preferences.get(
		'CharSelectV2',
		{
			index: 0
		},
		1.0
	);

	/**
	 * @var {number} max slots
	 */
	var _maxSlots = 3 * 9;

	/**
	 * var {Array} list of characters
	 */
	var _list = [];

	/**
	 * @var {Array} list of characters (index by slot)
	 */
	var _slots = [];

	/**
	 * @var {Array} list of entities (index by slot)
	 */
	var _entitySlots = [];

	/**
	 * @var {number} selector index
	 */
	var _index = 0;

	/**
	 * @var {Array} canvas context
	 */
	var _ctx = [];

	/**
	 * var {number} sex
	 */
	var _sex = 0;

	/**
	 * var {boolean} disable input
	 */
	var _disable_UI = false;

	/**
	 * Initialize UI
	 */
	CharSelectV2.init = function Init() {
		var ui = this.ui;

		ui.css({
			top: (Renderer.height - 358) / 2,
			left: (Renderer.width - 576) / 2
		});

		// Bind buttons
		ui.find('.ok').click(connect);
		ui.find('.cancel').click(cancel);
		ui.find('.make').click(create);
		ui.find('.delete').click(reserve);
		ui.find('.canceldelete').click(removedelete);
		ui.find('.finaldelete').click(suppress);

		ui.find('.arrow.left').mousedown(genericArrowDown(-1));
		ui.find('.arrow.right').mousedown(genericArrowDown(+1));

		// Bind canvas
		ui.find('.slot1').mousedown(genericCanvasDown(0));
		ui.find('.slot2').mousedown(genericCanvasDown(1));
		ui.find('.slot3').mousedown(genericCanvasDown(2));

		ui.find('canvas')
			.dblclick(function () {
				if (_slots[_index]) {
					connect();
				} else {
					create();
				}
			})
			.each(function () {
				_ctx.push(this.getContext('2d'));
			});

		this.draggable();
	};

	/**
	 * Once append to body
	 */
	CharSelectV2.onAppend = function onAppend() {
		_index = _preferences.index;

		this.ui.find('.slotinfo .number').text(_list.length + ' / ' + _maxSlots);
		this.ui.find('.pageinfo .count').text(_maxSlots / 3);

		// Update values
		moveCursorTo(_index);

		// Start rendering
		Renderer.render(render);
	};

	/**
	 * Stop rendering
	 */
	CharSelectV2.onRemove = function onRemove() {
		_preferences.index = _index;
		_preferences.save();
		this.ui.find('.timedelete').hide().text('');
		Renderer.stop();
	};

	/**
	 * Bind Key events
	 *
	 * @param {object} event
	 */
	CharSelectV2.onKeyDown = function onKeyDown(event) {
		if (!this.ui.is(':visible')) return true;
		switch (event.which) {
			case KEYS.ESCAPE:
				cancel();
				break;

			case KEYS.LEFT:
				moveCursorTo(_index - 1);
				break;

			case KEYS.RIGHT:
				moveCursorTo(_index + 1);
				break;

			case KEYS.SUPR:
				if (_slots[_index]) {
					suppress();
				}
				break;

			case KEYS.ENTER:
				if (_slots[_index]) {
					connect();
				} else {
					create();
				}
				break;

			default:
				return true;
		}

		event.stopImmediatePropagation();
		return false;
	};

	/**
	 * Add players to window
	 *
	 * @param {object} pkt - packet structure
	 */
	CharSelectV2.setInfo = function setInfo(pkt) {
		_maxSlots = Math.floor(pkt.TotalSlotNum + pkt.PremiumStartSlot || 9); // default 9 ?
		_sex = pkt.sex;
		_slots.length = 0;
		_entitySlots.length = 0;
		_list.length = 0;

		if (pkt.charInfo) {
			var i,
				count = pkt.charInfo.length;
			for (i = 0; i < count; ++i) {
				CharSelectV2.addCharacter(pkt.charInfo[i]);

				// Guess the max slot
				// required if the client is < 20100413 and have more than 9 slots
				_maxSlots = Math.max(_maxSlots, Math.floor(pkt.charInfo[i].CharNum / 3 + 1) * 3);
			}
		}

		this.ui.find('.slotinfo .number').text(_list.length + ' / ' + _maxSlots);
		this.ui.find('.pageinfo .count').text(_maxSlots / 3);

		moveCursorTo(_index);
	};

	/**
	 * Answer from server to delete a character
	 *
	 * @param {number} error id
	 */
	CharSelectV2.deleteAnswer = function DeleteAnswer(error) {
		this.on('keydown');

		if (PACKETVER.value >= 20100803) {
			switch (error) {
				// Do nothing, just re-set the keydown
				case -1:
				case -2:
					return;

				// Success (clean up character)
				case 1:
					delete _slots[_index];
					delete _entitySlots[_index];

					var i = 0;
					var count = _list.length;

					while (i < count) {
						if (_list[i].CharNum === _index) {
							_list.splice(i, 1);
							--count;
						} else {
							i++;
						}
					}

					// Refresh UI
					moveCursorTo(_index);
					this.ui.find('.slotinfo .number').text(_list.length + ' / ' + _maxSlots);
					return;

				default: // Others error ?
				case 0:
				case 2: // 2: Due to system settings can not be deleted.
				case 6: // 6: Name does not match.
					UIManager.showMessageBox(DB.getMessage(1821), 'ok');
					return;
				case 3: // 3: A database error occurred.
					UIManager.showMessageBox(DB.getMessage(1817), 'ok');
					return;
				case 4: // 4: Deleting not yet possible time.
					UIManager.showMessageBox(DB.getMessage(1820), 'ok');
					return;
				case 5: // 5: Date of birth do not match.
					UIManager.showMessageBox(DB.getMessage(1822), 'ok');
					return;
				case 7: // 7: Character Deletion has failed because you have entered an incorrect e-mail address.
					UIManager.showMessageBox(DB.getMessage(301), 'ok');
					return;
			}
		} else {
			switch (error) {
				// Do nothing, just re-set the keydown
				case -2:
					return;

				// Success (clean up character)
				case -1:
					delete _slots[_index];
					delete _entitySlots[_index];

					var i = 0;
					var count = _list.length;

					while (i < count) {
						if (_list[i].CharNum === _index) {
							_list.splice(i, 1);
							--count;
						} else {
							i++;
						}
					}

					// Refresh UI
					moveCursorTo(_index);
					this.ui.find('.slotinfo .number').text(_list.length + ' / ' + _maxSlots);
					return;

				default: // Others error ?
				case 0: // Incorrect adress email
					UIManager.showMessageBox(DB.getMessage(301), 'ok');
					break;
			}
		}
	};

	/**
	 * Adding a Character to the list
	 *
	 * @param {object} character data
	 */
	CharSelectV2.addCharacter = function addCharacter(character) {
		if (!('sex' in character) || character.sex === 99) {
			character.sex = _sex;
		}

		//Adjust from remaining time to fixed datetime
		if (character.DeleteDate) {
			var now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
			var timer =
				(PACKETVER.value > 20130000 && PACKETVER.value <= 20141022) || PACKETVER.value >= 20150513
					? character.DeleteDate + now
					: character.DeleteDate;
			character.DeleteDate = timer;
		}

		_list.push(character);
		_slots[character.CharNum] = character;

		_entitySlots[character.CharNum] = new Entity();
		_entitySlots[character.CharNum].set(character);
		_entitySlots[character.CharNum].effectState =
			_entitySlots[character.CharNum]._effectState & ~StatusConst.EffectState.INVISIBLE;

		if (PACKETVER.value >= 20100803) {
			if (_slots[character.CharNum].DeleteDate && Math.floor(_index / 3) == Math.floor(character.CharNum / 3)) {
				const slotNum = ((character.CharNum + _maxSlots) % _maxSlots) + 1;
				const countdown = this.ui.find('.timedelete.slot' + slotNum); // Adjusted selector
				const entity = _entitySlots[character.CharNum];
				if (countdown) {
					countdown.attr('data-datetime', _slots[character.CharNum].DeleteDate);
					countdown.text(formatDatetime(_slots[character.CharNum].DeleteDate));
					countdown.show();
				}
				entity.setAction({
					action: entity.ACTION.SIT,
					frame: 0,
					play: true,
					repeat: true
				});
			}
		}
	};

	/**
	 * Disable or Enable the UI.
	 *
	 * @param {boolean}
	 */
	CharSelectV2.setUIEnabled = function setUIEnabled(value) {
		_disable_UI = !value;
	};

	/**
	 * Callback to use
	 */
	CharSelectV2.onExitRequest = function onExitRequest() {};
	CharSelectV2.onDeleteReqDelay = function onDeleteReqDelay() {};
	CharSelectV2.onCancelDeleteRequest = function onCancelDeleteRequest() {};
	CharSelectV2.onDeleteRequest = function onDeleteRequest() {};
	CharSelectV2.onCreateRequest = function onCreateRequest() {};
	CharSelectV2.onConnectRequest = function onConnectRequest() {};

	/**
	 * Generic method to handle mousedown on arrow
	 *
	 * @param {number} value to move
	 */
	function genericArrowDown(value) {
		return function (event) {
			moveCursorTo((_index + _maxSlots + value) % _maxSlots);
			event.stopImmediatePropagation();
			return false;
		};
	}

	/**
	 * Generic method to handle mousedown on arrow
	 *
	 * @param {number} value to move
	 */
	function genericCanvasDown(value) {
		return function (event) {
			moveCursorTo(Math.floor(_index / 3) * 3 + value);
			event.stopImmediatePropagation();
			return false;
		};
	}

	/**
	 * Press "cancel" or ESCAPE key
	 */
	function cancel() {
		if (_disable_UI === false) {
			UIManager.showPromptBox(
				DB.getMessage(17),
				'ok',
				'cancel',
				function () {
					CharSelectV2.onExitRequest();
				},
				null
			);
		}
	}

	/**
	 * Jumping to Character creation window
	 */
	function create() {
		if (_disable_UI === false) {
			CharSelectV2.onCreateRequest(_index);
		}
	}

	/**
	 * Select Player, connect
	 */
	function connect() {
		if (_disable_UI === false) {
			if (_slots[_index]) {
				_preferences.index = _index;
				_preferences.save();
				CharSelectV2.onConnectRequest(_slots[_index]);
			}
		}
	}

	/**
	 * Format delay date time
	 */
	function formatDatetime(epoch) {
		const datetime = new Date(0);
		datetime.setSeconds(epoch);

		const year = datetime.getFullYear();
		const month = datetime.getMonth() + 1;
		const day = datetime.getDate();
		const hours = datetime.getHours();
		const minutes = datetime.getMinutes();
		const seconds = datetime.getSeconds();

		// Use the msgstringtable
		let formattedDatetime = DB.getMessage(2097)
			.replace('%d', `${month}`)
			.replace('%d', `${day}`)
			.replace('%d', `${hours}`)
			.replace('%d', `${minutes}`)
			.replace('%d', `${seconds}`);

		return formattedDatetime;
	}

	/**
	 * Result of Request in Deleting the Character
	 *
	 * @param {object} pkt - packet structure
	 */
	CharSelectV2.reqdeleteAnswer = function ReqDelAnswer(pkt) {
		this.on('keydown');
		var now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
		var result = typeof pkt.Result === 'undefined' ? -1 : pkt.Result;
		var info = _slots[_index];

		switch (result) {
			case 0: // 0: An unknown error has occurred.
				return;

			case 1: // 1: none/success
				//Adjust from remaining time to fixed datetime
				var timer =
					(PACKETVER.value > 20130000 && PACKETVER.value <= 20141022) || PACKETVER.value >= 20150513
						? pkt.DeleteReservedDate + now
						: pkt.DeleteReservedDate;
				info.DeleteDate = timer;
				requestdelete(_index, timer);
				break;

			case 3: // 3: A database error occurred.
				return;

			case 4: // 4: To delete a character you must withdraw from the guild.
				UIManager.showMessageBox(DB.getMessage(1818), 'ok');
				break;
			case 5: // 5: To delete a character you must withdraw from the party.
				UIManager.showMessageBox(DB.getMessage(1819), 'ok');
				break;

			default:
				return;
		}
	};

	/**
	 * When successfully requested for character deletion
	 * Update UI and add timer
	 */
	function requestdelete(index, timer) {
		const entity = _entitySlots[index];
		let action;
		// Add the timer
		const countdown = CharSelectV2.ui.find('.timedelete.slot' + ((index % 3) + 1));
		if (countdown) {
			countdown.attr('data-datetime', timer);
			countdown.text(formatDatetime(timer));
			countdown.show();
			if (Math.floor(Date.now() / 1000) > timer) {
				countdown.removeClass('waitdelete').addClass('candelete');
				action = entity.ACTION.DIE;
			} else {
				countdown.removeClass('candelete').addClass('waitdelete');
				action = entity.ACTION.SIT;
			}
		}

		// Set action
		entity.action = action;

		// Adjust the buttons
		CharSelectV2.ui.find('.delete').hide();
		CharSelectV2.ui.find('.canceldelete').show();
		if (Math.floor(Date.now() / 1000) > timer) {
			CharSelectV2.ui.find('.finaldelete').show();
		} else {
			CharSelectV2.ui.find('.finaldelete').hide();
		}
	}

	/**
	 * Cancel reservation of character for deletion
	 * Update UI and remove timer
	 */
	function removedelete() {
		if (_slots[_index]) {
			// Delete here as well? Though server should tell us this
			_slots[_index].DeleteDate = 0;

			// Make it stand
			_entitySlots[_index].action = _entitySlots[_index].ACTION.READYFIGHT;
			render();

			// Remove the timer
			const countdown = CharSelectV2.ui.find('.timedelete.slot' + ((_index % 3) + 1)); // Adjusted selector
			countdown.attr('data-datetime', 0);
			countdown.text(formatDatetime(''));
			countdown.hide();

			// Adjust the buttons
			CharSelectV2.ui.find('.canceldelete').hide();
			CharSelectV2.ui.find('.finaldelete').hide();
			CharSelectV2.ui.find('.delete').show();

			// Send request to the server
			CharSelectV2.onCancelDeleteRequest(_slots[_index].GID);
		}
	}

	/**
	 * Request to delete a character
	 */
	function reserve() {
		if (_disable_UI === false) {
			if (_slots[_index]) {
				CharSelectV2.off('keydown');
				CharSelectV2.onDeleteReqDelay(_slots[_index].GID);
			}
		}
	}

	/**
	 * Delete a character
	 */
	function suppress() {
		if (_disable_UI === false) {
			if (_slots[_index]) {
				CharSelectV2.off('keydown');
				CharSelectV2.onDeleteRequest(_slots[_index].GID);
			}
		}
	}

	/**
	 * Move cursor, update window value
	 *
	 * @param {number} index
	 */
	function moveCursorTo(index) {
		var ui = CharSelectV2.ui;
		var $charinfo = ui.find('.charinfo');

		// Set the last entity to idle
		var entity = _entitySlots[_index];
		var info = _slots[_index];
		var action;
		if (entity) {
			if (PACKETVER.value >= 20100803 && info.DeleteDate) {
				action = entity.ACTION.SIT;
			} else {
				action = entity.ACTION.IDLE;
			}

			entity.setAction({
				action: action,
				frame: 0,
				play: true,
				repeat: true
			});
		}

		// Move
		_index = (index + _maxSlots) % _maxSlots;
		ui.find('.box_select')
			.removeClass('slot1 slot2 slot3')
			.addClass('slot' + ((_index % 3) + 1));

		// Set page
		ui.find('.pageinfo .current').text(Math.floor(_index / 3) + 1);

		// Update page deltimes
		for (let i = 0; i < 3; i++) {
			let tmpIndex = _index - (_index % 3) + i;
			info = _slots[tmpIndex];
			entity = _entitySlots[tmpIndex];
			const countdown = CharSelectV2.ui.find('.timedelete.slot' + ((tmpIndex % 3) + 1));

			if (info && entity) {
				if (info.DeleteDate && PACKETVER.value >= 20100803) {
					countdown.attr('data-datetime', info.DeleteDate);
					countdown.text(formatDatetime(info.DeleteDate));
					countdown.show();
					if (Math.floor(Date.now() / 1000) > info.DeleteDate) {
						countdown.removeClass('waitdelete').addClass('candelete');
					} else {
						countdown.removeClass('candelete').addClass('waitdelete');
					}
					entity.action = entity.ACTION.SIT;
				} else {
					countdown.attr('data-datetime', 0);
					countdown.text(formatDatetime(''));
					countdown.hide();
					entity.action = entity.ACTION.IDLE;
				}
			} else {
				countdown.attr('data-datetime', 0);
				countdown.text(formatDatetime(''));
				countdown.hide();
			}
		}

		// Not found, just clean up.
		entity = _entitySlots[_index];
		if (!entity) {
			$charinfo.find('div').empty();
			ui.find('.make').show();
			ui.find('.delete').hide();
			ui.find('.canceldelete').hide();
			ui.find('.finaldelete').hide();
			ui.find('.ok').hide();
			return;
		}

		info = _slots[_index];
		// Bind new value
		if (info.DeleteDate && PACKETVER.value >= 20100803) {
			ui.find('.delete').hide();
			ui.find('.canceldelete').show();
			if (Math.floor(Date.now() / 1000) > info.DeleteDate) {
				ui.find('.finaldelete').show();
				action = entity.ACTION.DIE;
			} else {
				ui.find('.finaldelete').hide();
				action = entity.ACTION.SIT;
			}
			ui.find('.make').hide();
			ui.find('.ok').show();
		} else {
			if (PACKETVER.value >= 20100803) {
				ui.find('.delete').show();
				ui.find('.canceldelete').hide();
				ui.find('.finaldelete').hide();
			} else {
				ui.find('.delete').hide();
				ui.find('.canceldelete').hide();
				ui.find('.finaldelete').show();
			}
			ui.find('.make').hide();
			ui.find('.ok').show();
			action = entity.ACTION.READYFIGHT;
		}

		// Animate the character
		entity.setAction({
			action: action,
			frame: 0,
			play: true,
			repeat: true
		});

		$charinfo.find('.name').text(info.name);
		$charinfo.find('.job').text(MonsterTable[info.job] || '');
		$charinfo.find('.lvl').text(info.level);
		$charinfo.find('.exp').text(info.exp);
		$charinfo.find('.hp').text(info.hp);
		$charinfo.find('.sp').text(info.sp);

		//TODO: Check win_select.bmp size to insert it if needed ?
		$charinfo.find('.map').text(DB.getMapName(info.lastMap, '') || '');
		$charinfo.find('.str').text(info.Str);
		$charinfo.find('.agi').text(info.Agi);
		$charinfo.find('.vit').text(info.Vit);
		$charinfo.find('.int').text(info.Int);
		$charinfo.find('.dex').text(info.Dex);
		$charinfo.find('.luk').text(info.Luk);
	}

	/**
	 * Render sprites to canvas
	 */
	function render() {
		var i, count, idx;

		Camera.direction = 4;
		idx = Math.floor(_index / 3) * 3;
		count = _ctx.length;

		for (i = 0; i < count; ++i) {
			_ctx[i].clearRect(0, 0, _ctx[i].canvas.width, _ctx[i].canvas.height);

			if (_entitySlots[idx + i]) {
				SpriteRenderer.bind2DContext(_ctx[i], 63, 130);
				_entitySlots[idx + i].renderEntity();
			}
		}
	}

	/**
	 * Create componentand export it
	 */
	return UIManager.addComponent(CharSelectV2);
});
