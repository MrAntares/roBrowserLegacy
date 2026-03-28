/**
 * Controls/MapControl.js
 *
 * Control for keys and input
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
'use strict';

import jQuery from 'Utils/jquery';
import DB from 'DB/DBManager';
import UIManager from 'UI/UIManager';
import Cursor from 'UI/CursorManager';
import Entity from 'Renderer/Entity/Entity';
import InputBox from 'UI/Components/InputBox/InputBox';
import ChatBox from 'UI/Components/ChatBox/ChatBox';
import Equipment from 'UI/Components/Equipment/Equipment';
import Inventory from 'UI/Components/Inventory/Inventory';
import SkillTargetSelection from 'UI/Components/SkillTargetSelection/SkillTargetSelection';
import Mouse from 'Controls/MouseEventHandler';
import Mobile from 'Core/Mobile';
import Renderer from 'Renderer/Renderer';
import Camera from 'Renderer/Camera';
import EntityManager from 'Renderer/EntityManager';
import Session from 'Engine/SessionStorage';
import Preferences from 'Preferences/Controls';
import KEYS from 'Controls/KeyEventHandler';
import AIDriver from 'Core/AIDriver';
import Altitude from 'Renderer/Map/Altitude';
import PACKETVER from 'Network/PacketVerManager';
import PACKET from 'Network/PacketStructure';
import Network from 'Network/NetworkManager';
import Events from 'Core/Events';
import CaptchaSelector from 'UI/Components/Captcha/CaptchaSelector';
import 'Controls/ScreenShot';

	/**
	 * @var {int16[2]} screen position
	 */
	let _rightClickPosition = new Int16Array(2);

	/**
	 * @namespace MapControl
	 */
	let MapControl = {};

	/**
	 * Callback used when requesting to move somewhere
	 */
	MapControl.onRequestWalk = function () {};

	/**
	 * Callback used when request to stop move
	 */
	MapControl.onRequestStopWalk = function () {};

	/**
	 * Callback used when dropping an item to the map
	 */
	MapControl.onRequestDropItem = function () {};

	/**
	 * Initializing the controller
	 */
	MapControl.init = function init() {
		Mobile.init();
		Mobile.onTouchStart = onMouseDown.bind(this);
		Mobile.onTouchEnd = onMouseUp.bind(this);

		// Attach events
		jQuery(Renderer.canvas)
			.on('mousewheel DOMMouseScroll', onMouseWheel)
			.on('dragover', onDragOver)
			.on('drop', onDrop.bind(this));

		jQuery(window).on('mousedown.map', onMouseDown.bind(this)).on('mouseup.map', onMouseUp.bind(this));
	};

	/**
	 * What to do when clicking on the map ?
	 */
	function onMouseDown(event) {
		let action = (event && event.which) || 1;

		if (!Mouse.intersect) {
			return;
		}

		let entityFocus = EntityManager.getFocusEntity();
		let entityOver = EntityManager.getOverEntity();

		switch (action) {
			// Left click
			case 1:
				if (!KEYS.SHIFT && KEYS.ALT && !KEYS.CTRL) {
					if (
						entityOver &&
						entityOver != Session.Entity &&
						entityOver.objecttype != Entity.TYPE_EFFECT &&
						entityOver.objecttype != Entity.TYPE_TRAP
					) {
						AIDriver.setmsg(Session.mercId, '3,' + entityOver.GID);
					} else {
						AIDriver.setmsg(Session.mercId, '1,' + Mouse.world.x + ',' + Mouse.world.y);
					}
				} else {
					Session.moveAction = null;
					Session.autoFollow = false;

					let stop = false;
					if (entityOver != Session.Entity) {
						if (entityFocus && entityFocus != entityOver) {
							if (!(Session.TouchTargeting && !entityOver)) {
								entityFocus.onFocusEnd();
								EntityManager.setFocusEntity(null);
							}
						}

						// Entity picking ?
						if (entityOver) {
							stop = stop || entityOver.onMouseDown();
							stop = stop || entityOver.onFocus();
							EntityManager.setFocusEntity(entityOver);

							// Know if propagate to map mousedown
							if (stop) {
								return;
							}
						}
					}

					// Start walking
					if (this.onRequestWalk) {
						this.onRequestWalk();
					}
				}
				break;

			// Right Click
			case 3:
				_rightClickPosition[0] = Mouse.screen.x;
				_rightClickPosition[1] = Mouse.screen.y;

				if (Session.captchaGetIdOnFloorClick) {
					CaptchaSelector.requestPlayersIds(Mouse.world.x, Mouse.world.y);
				}

				if (!KEYS.SHIFT && KEYS.ALT && !KEYS.CTRL) {
					Camera.rotate(false);

					if (
						entityOver &&
						entityOver != Session.Entity &&
						entityOver.objecttype != Entity.TYPE_EFFECT &&
						entityOver.objecttype != Entity.TYPE_TRAP
					) {
						AIDriver.setmsg(Session.homunId, '3,' + entityOver.GID);
					} else {
						AIDriver.setmsg(Session.homunId, '1,' + Mouse.world.x + ',' + Mouse.world.y);
					}
				} else {
					if (
						entityOver &&
						entityOver != Session.Entity &&
						entityOver.objecttype != Entity.TYPE_EFFECT &&
						entityOver.objecttype != Entity.TYPE_TRAP
					) {
						if (KEYS.SHIFT) {
							// Shift + Right click on an entity
							Session.autoFollowTarget = entityOver;
							Session.autoFollow = true;
							onAutoFollow();
						}

						// Right click on a NPC/Mob/Unit
						entityOver.onMouseDown();
						entityOver.onFocus();
						EntityManager.setFocusEntity(entityOver);
					}

					Cursor.setType(Cursor.ACTION.ROTATE);
					Camera.rotate(true);
				}
				break;
		}
	}

	/**
	 * What to do when stop clicking on the map ?
	 */
	function onMouseUp(event) {
		let entity, ET;
		let action = (event && event.which) || 1;

		// Not rendering yet
		if (!Mouse.intersect) {
			return;
		}

		switch (action) {
			// Left click
			case 1:
				// Remove entity picking ?
				entity = EntityManager.getFocusEntity();

				if (entity) {
					ET = entity.constructor;
					entity.onMouseUp();

					// Entity lock is only on MOB type (except when Touch Targeting is active)
					if (
						Preferences.noctrl === false ||
						(![ET.TYPE_MOB, ET.TYPE_NPC_ABR, ET.TYPE_NPC_BIONIC].includes(entity.objecttype) &&
							!Session.TouchTargeting)
					) {
						EntityManager.setFocusEntity(null);
						entity.onFocusEnd();
					}
				}

				// stop walking
				if (this.onRequestStopWalk) {
					this.onRequestStopWalk();
				}
				break;

			// Right Click
			case 3:
				Cursor.setType(Cursor.ACTION.DEFAULT);
				Camera.rotate(false);

				// Seems like it's how the official client handle the contextmenu
				// Just check for the same position on mousedown and mouseup
				if (
					_rightClickPosition[0] === Mouse.screen.x &&
					_rightClickPosition[1] === Mouse.screen.y &&
					!KEYS.SHIFT
				) {
					entity = EntityManager.getOverEntity();

					if (entity && entity !== Session.Entity) {
						entity.onContextMenu();
					}
				}
				break;
		}
	}

	/**
	 * Zoom feature
	 */
	function onMouseWheel(event) {
		if (Mouse.state === Mouse.MOUSE_STATE.USESKILL) {
			if (event.originalEvent.wheelDelta > 0) {
				SkillTargetSelection.setSkillLevelDelta(1);
			} else {
				SkillTargetSelection.setSkillLevelDelta(-1);
			}
			return;
		}
		// Zooming on the scene
		// Cross browser delta
		let delta;
		if (event.originalEvent.wheelDelta) {
			delta = event.originalEvent.wheelDelta / 120;
			if (window.opera) {
				delta = -delta;
			}
		} else if (event.originalEvent.detail) {
			delta = -event.originalEvent.detail;
		}

		Camera.setZoom(delta);
	}

	/**
	 * Allow dropping data
	 */
	function onDragOver(event) {
		event.stopImmediatePropagation();
		return false;
	}

	/**
	 * Drop items to the map
	 */
	function onDrop(event) {
		let item, data;

		try {
			data = JSON.parse(event.originalEvent.dataTransfer.getData('Text'));
		} catch (e) {
			console.error(e);
		}

		// Stop default behavior
		event.stopImmediatePropagation();
		if (!data) {
			return false;
		}

		// Hacky way to trigger mouseleave (mouseleave isn't
		// triggered when dragging an object).
		// ondragleave event is not relyable to do it (not working as intended)
		if (data.from) {
			UIManager.getComponent(data.from).ui.trigger('mouseleave');
		}

		// Just support items ?
		if (data.type !== 'item' || data.from !== 'Inventory') {
			return false;
		}

		// Can't drop an item on map if Equipment window is open
		if (Equipment.getUI().ui.is(':visible')) {
			ChatBox.addText(DB.getMessage(189), ChatBox.TYPE.ERROR, ChatBox.FILTER.ITEM);
			return false;
		}

		// Item Drop Lock
		let InventoryVersion = UIManager.getComponent('Inventory').name;
		if (InventoryVersion !== 'InventoryV0' && Inventory.getUI().itemlock === true) {
			return false;
		}

		item = data.data;

		// Have to specify how much
		if (item.count > 1) {
			InputBox.append();
			InputBox.setType('item', false, item.count, item.ITID);
			InputBox.onSubmitRequest = function onSubmitRequest(count) {
				InputBox.remove();
				MapControl.onRequestDropItem(item.index, parseInt(count, 10));
			};
		}

		// Only one, don't have to specify
		else {
			MapControl.onRequestDropItem(item.index, 1);
		}

		return false;
	}

	/**
	 * Auto follow logic
	 */
	function onAutoFollow() {
		if (Session.autoFollow) {
			let player = Session.Entity;
			let target = Session.autoFollowTarget;

			let dx = Math.abs(player.position[0] - target.position[0]);
			let dy = Math.abs(player.position[1] - target.position[1]);

			// Use square based range check instead of Pythagorean because of diagonals
			if (dx > 1 || dy > 1) {
				let dest = [0, 0];

				// If there is valid cell send move packet
				if (checkFreeCell(Math.round(target.position[0]), Math.round(target.position[1]), 1, dest)) {
					let pkt;
					if (PACKETVER.value >= 20180307) {
						pkt = new PACKET.CZ.REQUEST_MOVE2();
					} else {
						pkt = new PACKET.CZ.REQUEST_MOVE();
					}
					pkt.dest = dest;
					Network.sendPacket(pkt);
				}
			}

			Events.setTimeout(onAutoFollow, 500);
		}
	}

	/**
	 * Search free cells around a position
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} range
	 * @param {array} out
	 */
	function checkFreeCell(x, y, range, out) {
		let _x, _y, r;
		let d_x = Session.Entity.position[0] < x ? -1 : 1;
		let d_y = Session.Entity.position[1] < y ? -1 : 1;

		// Search possible positions
		for (r = 0; r <= range; ++r) {
			for (_x = -r; _x <= r; ++_x) {
				for (_y = -r; _y <= r; ++_y) {
					if (isFreeCell(x + _x * d_x, y + _y * d_y)) {
						out[0] = x + _x * d_x;
						out[1] = y + _y * d_y;
						return true;
					}
				}
			}
		}

		return false;
	}

	/**
	 * Does a cell is free (walkable, and no entity on)
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {returns} is free
	 */
	function isFreeCell(x, y) {
		if (!(Altitude.getCellType(x, y) & Altitude.TYPE.WALKABLE)) {
			return false;
		}

		let free = true;

		EntityManager.forEach(function (entity) {
			if (
				entity.objecttype != entity.constructor.TYPE_EFFECT &&
				entity.objecttype != entity.constructor.TYPE_UNIT &&
				entity.objecttype != entity.constructor.TYPE_TRAP &&
				Math.round(entity.position[0]) === x &&
				Math.round(entity.position[1]) === y
			) {
				free = false;
				return false;
			}

			return true;
		});

		return free;
	}

	/**
	 * Export
	 */
	export default MapControl;