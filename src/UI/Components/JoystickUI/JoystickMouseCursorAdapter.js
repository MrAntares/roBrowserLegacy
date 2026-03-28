/**
 * UI/Components/JoystickUI/JoystickMouseCursorAdapter.js
 *
 * Adapts joystick input to emulate mouse behavior.
 * Handles cursor movement, coordinate projection from 3D world to 2D screen,
 * UI element navigation, and clicking events.
 *
 * @author AoShinHo
 */
'use strict';

import Renderer from 'Renderer/Renderer';
import Mouse from 'Controls/MouseEventHandler';
import glMatrix from 'Vendors/gl-matrix';
import Camera from 'Renderer/Camera';
import ControlsSettings from 'Preferences/Controls';
import jQuery from 'Utils/jquery';
import Interaction from './JoystickInteractionService';

function move(dx, dy) {
		Mouse.screen.x = Math.max(0, Math.min(Renderer.width, Mouse.screen.x + dx * ControlsSettings.joySense));
		Mouse.screen.y = Math.max(0, Math.min(Renderer.height, Mouse.screen.y + dy * ControlsSettings.joySense));

		let cursor = document.querySelector('.cursor');
		if (cursor) {
			cursor.style.left = Mouse.screen.x + 'px';
			cursor.style.top = Mouse.screen.y + 'px';
		}
	}

	function moveMouseToEntity(entity) {
		if (!entity || !entity.position) {
			return;
		}

		let mat4 = glMatrix.mat4;
		let vec4 = glMatrix.vec4;

		let _matrix = mat4.create();
		let _vector = vec4.create();
		let _pos = vec4.create();

		// Transform entity position to screen coordinates
		_vector[0] = entity.position[0] + 0.5;
		_vector[1] = -entity.position[2];
		_vector[2] = entity.position[1] + 0.5;
		_vector[3] = 1.0;

		// Apply camera transformation
		mat4.translate(_matrix, Camera.modelView, _vector);

		// Set up billboard matrix (like in EntityRender)
		_matrix[0] = 1.0;
		_matrix[1] = 0.0;
		_matrix[2] = 0.0;
		_matrix[4] = 0.0;
		_matrix[5] = 1.0;
		_matrix[6] = 0.0;
		_matrix[8] = 0.0;
		_matrix[9] = 0.0;
		_matrix[10] = 1.0;

		// Project to screen
		mat4.multiply(_matrix, Camera.projection, _matrix);

		// Cast position for projection
		_pos[0] = 0.0;
		_pos[1] = 0.0;
		_pos[2] = 0.0;
		_pos[3] = 1.0;

		// Project point to scene
		vec4.transformMat4(_pos, _pos, _matrix);

		// Calculate screen position
		let z = _pos[3] === 0.0 ? 1.0 : 1.0 / _pos[3];
		let screenX = Renderer.width / 2 + Math.round((Renderer.width / 2) * (_pos[0] * z));
		let screenY = Renderer.height / 2 - Math.round((Renderer.height / 2) * (_pos[1] * z));

		screenY = screenY - 13;

		// Update mouse position
		Mouse.screen.x = screenX;
		Mouse.screen.y = screenY;

		// Update cursor visual position
		let _selector = document.querySelector('.cursor');
		if (_selector) {
			_selector.style.left = screenX + 'px';
			_selector.style.top = screenY + 'px';
		}
	}

	function leftClick(click = false) {
		let el = document.elementFromPoint(Mouse.screen.x, Mouse.screen.y);
		if (!el) {
			handleWorldLeftClick();
			return;
		}

		if (ControlsSettings.joyDisableVirtualMouse) return;

		let eventOptions = {
			bubbles: true,
			cancelable: true,
			view: window,
			clientX: Mouse.screen.x,
			clientY: Mouse.screen.y,
			which: 1
		};
		el.dispatchEvent(new MouseEvent('mousedown', eventOptions));
		setTimeout(function () {
			el.dispatchEvent(new MouseEvent('mouseup', eventOptions));
			if (click) {
				el.dispatchEvent(new MouseEvent('click', eventOptions));
			}
		}, 50);
	}

	function rightClick(holding = false) {
		let el = document.elementFromPoint(Mouse.screen.x, Mouse.screen.y);
		let isCanvas = el && el.tagName.toLowerCase() === 'canvas';
		if (!el || isCanvas) {
			handleWorldRightClick();
			return;
		}
		if (holding) {
			let draggableElement = el.closest('.item, .skill');
			if (draggableElement) {
				if (Interaction.openSelectionWindow(draggableElement)) {
					return;
				}
			}
		}

		if (ControlsSettings.joyDisableVirtualMouse) return;

		el.dispatchEvent(
			new MouseEvent('mousedown', {
				which: 3
			})
		);
		setTimeout(function () {
			el.dispatchEvent(
				new MouseEvent('mouseup', {
					which: 3
				})
			);
		}, 100);
	}

	function handleWorldLeftClick() {
		if (!Mouse.intersect) {
			Mouse.intersect = true;
		}
		jQuery(Renderer.canvas).trigger({
			type: 'mousedown',
			which: 1
		});

		setTimeout(function () {
			jQuery(Renderer.canvas).trigger({
				type: 'mouseup',
				which: 1
			});
		}, 100);
	}

	function handleWorldRightClick() {
		if (!Mouse.intersect) {
			Mouse.intersect = true;
		}
		jQuery(Renderer.canvas).trigger({
			type: 'mousedown',
			which: 3
		});

		setTimeout(function () {
			jQuery(Renderer.canvas).trigger({
				type: 'mouseup',
				which: 3
			});
		}, 100);
	}

	function changeCameraAngle(angle) {
		Camera.angleFinal[1] += angle;
		Camera.updateState();
		Camera.save();
	}

	function changeCameraZoom(zoom) {
		Camera.setZoom(zoom);
	}

	function esc() {
		jQuery(document).trigger({
			type: 'keydown',
			which: 27
		}); // Esc
	}

	function enter() {
		jQuery(document).trigger({
			type: 'keydown',
			which: 13
		}); // Enter
	}

	function contextMenu() {
		let el = document.elementFromPoint(Mouse.screen.x, Mouse.screen.y);
		let draggableElement = el.closest('.item, .skill');

		if (el && draggableElement) {
			let contextMenuEvent = new MouseEvent('contextmenu', {
				bubbles: true,
				cancelable: true,
				view: window,
				clientX: Mouse.screen.x,
				clientY: Mouse.screen.y,
				which: 3
			});

			el.dispatchEvent(contextMenuEvent);
			return true;
		}
		return false;
	}

	function navigateDraggableItems(direction) {
		let el = document.elementFromPoint(Mouse.screen.x, Mouse.screen.y);

		let container = el.closest('.item, .skill');

		if (!container) {
			// Fall back to regular arrow key navigation
			let keyCode;
			switch (direction) {
				case 'up':
					keyCode = 38;
					break;
				case 'down':
					keyCode = 40;
					break;
				case 'left':
					keyCode = 37;
					break;
				case 'right':
					keyCode = 39;
					break;
			}
			jQuery(document).trigger({
				type: 'keydown',
				which: keyCode
			});
			return;
		}

		let $container = jQuery(container);
		let allDraggables = $container.find('.item, .skill').not('.tabs button, .tab-btn');

		if (allDraggables.length === 0) {
			allDraggables = jQuery('.item:visible, .skill:visible').not('.tabs button, .tab-btn');
		}

		// Check if we're in a skill container by looking for skill-specific structure
		let isSkillContainer =
			(container.id && container.id.indexOf('positionSkills') === 0) ||
			container.querySelector(
				'#positionSkills1, #positionSkills2, #positionSkills3, #positionSkills4, #positionSkills5'
			) ||
			container.closest('.skillCol') !== null;

		let draggableElement = container.closest('.item, .skill');

		let currentIndex = allDraggables.index(draggableElement);
		let newIndex = currentIndex;

		// Use fixed grid width based on container type
		let GRID_WIDTH;
		if (isSkillContainer) {
			// Skills always use fixed 7-column grid
			GRID_WIDTH = 7;
		} else {
			// Items: calculate based on container width and icon size
			let containerWidth = $container.width() || 200;
			let iconElement = jQuery(draggableElement).find('.icon');
			let iconWidth = iconElement.width() || 24; // .icon has fixed 24px width
			let iconMargin = 4; // margin from CSS: margin: 4px 4px 4px 4px
			let totalIconWidth = iconWidth + iconMargin * 2;
			GRID_WIDTH = Math.max(6, Math.min(8, Math.floor(containerWidth / totalIconWidth)));
		}

		switch (direction) {
			case 'up':
				newIndex = currentIndex - GRID_WIDTH;
				break;
			case 'down':
				newIndex = currentIndex + GRID_WIDTH;
				break;
			case 'left':
				newIndex = currentIndex - 1;
				break;
			case 'right':
				newIndex = currentIndex + 1;
				break;
		}

		// Bounds checking
		newIndex = Math.max(0, Math.min(allDraggables.length - 1, newIndex));

		if (newIndex !== currentIndex && newIndex < allDraggables.length) {
			let targetElement = allDraggables.eq(newIndex);
			let targetOffset = targetElement.offset();

			if (targetOffset) {
				let targetCenterX = targetOffset.left + targetElement.outerWidth() / 2;
				let targetCenterY = targetOffset.top + targetElement.outerHeight() / 2;

				// Move mouse to target element
				Mouse.screen.x = targetCenterX;
				Mouse.screen.y = targetCenterY;

				let _selector = document.querySelector('.cursor');
				if (_selector) {
					_selector.style.left = targetCenterX + 'px';
					_selector.style.top = targetCenterY + 'px';
				}
			}
		}
	}

	function quickCastClick() {
		setTimeout(function () {
			jQuery(Renderer.canvas).trigger({
				type: 'mousedown',
				which: 1
			});
			setTimeout(function () {
				jQuery(Renderer.canvas).trigger({
					type: 'mouseup',
					which: 1
				});
			}, 100);
		}, 100);
	}
export default {
		quickCastClick: quickCastClick,
		moveMouseToEntity: moveMouseToEntity,
		navigateDraggableItems: navigateDraggableItems,
		contextMenu: contextMenu,
		esc: esc,
		enter: enter,
		changeCameraZoom: changeCameraZoom,
		changeCameraAngle: changeCameraAngle,
		move: move,
		leftClick: leftClick,
		rightClick: rightClick
	};