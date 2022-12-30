/**
 * Controls/MapControl.js
 *
 * Control for keys and input
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function( require )
{
	'use strict';


	// Load dependencies
	var jQuery        = require('Utils/jquery');
	var DB            = require('DB/DBManager');
	var UIManager     = require('UI/UIManager');
	var Cursor        = require('UI/CursorManager');
	var InputBox      = require('UI/Components/InputBox/InputBox');
	var ChatBox       = require('UI/Components/ChatBox/ChatBox');
	var Equipment     = require('UI/Components/Equipment/Equipment');
	var Inventory     = require('UI/Components/Inventory/Inventory');
	var ShortCut      = require('UI/Components/ShortCut/ShortCut');
	var SkillTargetSelection      = require('UI/Components/SkillTargetSelection/SkillTargetSelection');
	var Mouse         = require('Controls/MouseEventHandler');
	var Mobile        = require('Core/Mobile');
	var Renderer      = require('Renderer/Renderer');
	var Camera        = require('Renderer/Camera');
	var EntityManager = require('Renderer/EntityManager');
	var Session       = require('Engine/SessionStorage');
	var Preferences   = require('Preferences/Controls');
	var KEYS          = require('Controls/KeyEventHandler');
	var AIDriver      = require('Core/AIDriver');

	require('Controls/ScreenShot');


	/**
	 * @var {int16[2]} screen position
	 */
	var _rightClickPosition = new Int16Array(2);


	/**
	 * @namespace MapControl
	 */
	var MapControl = {};


	/**
	 * Callback used when requesting to move somewhere
	 */
	MapControl.onRequestWalk = function(){};


	/**
	 * Callback used when request to stop move
	 */
	MapControl.onRequestStopWalk = function(){};


	/**
	 * Callback used when dropping an item to the map
	 */
	MapControl.onRequestDropItem = function(){};


	/**
	 * Initializing the controller
	 */
	MapControl.init = function init()
	{
		Mobile.init();
		Mobile.onTouchStart = onMouseDown.bind(this);
		Mobile.onTouchEnd   = onMouseUp.bind(this);

		jQuery( Renderer.canvas ).topDroppable({drop: onDrop.bind(this)}).droppable({tolerance: "pointer"});

		// Attach events
		jQuery( Renderer.canvas )
			.on('mousewheel DOMMouseScroll', onMouseWheel)
			.on('dragover',                  onDragOver );
			// .on('drop',                      onDrop.bind(this));

		jQuery(window)
			.on('mousedown.map',   onMouseDown.bind(this))
			.on('mouseup.map',     onMouseUp.bind(this));
	};


	/**
	 * What to do when clicking on the map ?
	 */
	function onMouseDown( event )
	{
		var action = event && event.which || 1;

		

		if (!Mouse.intersect) {
			return;
		}

		var entityFocus = EntityManager.getFocusEntity();
		var entityOver  = EntityManager.getOverEntity();

		switch (action) {

			// Left click
			case 1:
				Session.moveAction = null;
				var stop        = false;
				if(entityOver != Session.Entity){
					if (entityFocus && entityFocus != entityOver) {
						if(!(Session.TouchTargeting && !entityOver)) {
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
				break;

			// Right Click
			case 3:
				_rightClickPosition[0] = Mouse.screen.x;
				_rightClickPosition[1] = Mouse.screen.y;

				if (!KEYS.SHIFT && KEYS.ALT && !KEYS.CTRL) {
					Cursor.setType( Cursor.ACTION.ROTATE );
					Camera.rotate( false );

					AIDriver.setmsg(Session.homunId, '1,'+ Mouse.world.x + ',' + Mouse.world.y);

					if (entityOver) {
						AIDriver.setmsg(Session.homunId, '3,'+ entityOver.GID);
					}
				} else {
					Cursor.setType( Cursor.ACTION.ROTATE );
					Camera.rotate( true );
				}
				break;
		}
	}


	/**
	 * What to do when stop clicking on the map ?
	 */
	function onMouseUp( event )
	{
		var entity;
		var action = event && event.which || 1;

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
					entity.onMouseUp();

					// Entity lock is only on MOB type (except when Touch Targeting is active)
					if (Preferences.noctrl === false || (entity.objecttype !== entity.constructor.TYPE_MOB && !Session.TouchTargeting )) {
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
				Cursor.setType( Cursor.ACTION.DEFAULT );
				Camera.rotate( false );

				// Seems like it's how the official client handle the contextmenu
				// Just check for the same position on mousedown and mouseup
				if (_rightClickPosition[0] === Mouse.screen.x && _rightClickPosition[1] === Mouse.screen.y) {
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
	function onMouseWheel( event )
	{
		if(Mouse.state === Mouse.MOUSE_STATE.USESKILL){
			if(event.originalEvent.wheelDelta > 0){
				SkillTargetSelection.setSkillLevelDelta(1);
			}else{
				SkillTargetSelection.setSkillLevelDelta(-1);
			}
			return;
		}
		// Zooming on the scene
		// Cross browser delta
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

		Camera.setZoom(delta);
	}



	/**
	 * Allow dropping data
	 */
	function onDragOver(event)
	{
		event.stopImmediatePropagation();
		return false;
	}



	/**
	 * Drop items to the map
	 */
	function onDrop( event )
	{
		var item, data;

		try {
			data = window._OBJ_DRAG_;
		}
		catch(e) {}

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
		if ((data.from !== 'Inventory' && data.type === 'item') || (data.from !== 'ShortCut' && data.type == 'skill')) {
			return false;
		}

		// Can't drop an item on map if Equipment window is open
		if (Equipment.ui.is(':visible') &&  data.type === 'item') {
			ChatBox.addText(
				DB.getMessage(189),
				ChatBox.TYPE.ERROR
			);
			return false;
		}

		//check if inventory is close player can'it drop item.
		if (!Inventory.ui.is(':visible') &&  data.type === 'item') {
			ChatBox.addText(
				DB.getMessage(690),
				ChatBox.TYPE.ERROR
			);
			return false;
		}

		//Check mouse screen position, if mouse is out of the screen item should not be dropped
		if(Mouse.screen.x > window.innerWidth || Mouse.screen.x < 0 || Mouse.screen.y > window.innerHeight || Mouse.screen.y < 0){
			return false;
		}

		item = data.data;

		switch(data.type) {
			case 'item':
				// Have to specify how much
				if (item.count > 1) {
					InputBox.append();
					InputBox.setType('number', false, item.count);
					InputBox.onSubmitRequest = function onSubmitRequest( count ) {
						InputBox.remove();
						MapControl.onRequestDropItem(
							item.index,
							parseInt(count, 10 )
						);
					};
				}

				// Only one, don't have to specify
				else {
					MapControl.onRequestDropItem( item.index, 1 );
				}
				break;

			case 'skill':
				ShortCut.dropOnGround(data.index, data.row);
				break;

		}

		return false;
	}



	/**
	 *  Exports
	 */
	return MapControl;
});
