/**
 * KeyToMove Plugin
 *
 * Enables the player to control the character movement with the arrow keys.
 *
 * This file is a plugin for ROBrowser, (http://www.robrowser.com/).
 *
 * Based on Vincent Thibault's gist: https://gist.github.com/vthibault/9d5c08c111db2eabfc37
 */
define(function( require )
{
	// Dependencies
	var jQuery    = require('Utils/jquery');
	var glMatrix  = require('Vendors/gl-matrix');
	var Session   = require('Engine/SessionStorage');
	var Network   = require('Network/NetworkManager');
	var PACKET    = require('Network/PacketStructure');
	var Camera    = require('Renderer/Camera');
	var KEYS	  = require('Controls/KeyEventHandler');
	var vec2      = glMatrix.vec2;
	var mat2      = glMatrix.mat2;

	// Object to initialize
	var direction = vec2.create();
	var rotate    = mat2.create();
	
	//Configure keys here
	var MOVE = {
		RIGHT: 	KEYS.RIGHT,
		LEFT: 	KEYS.LEFT,
		UP: 	KEYS.UP,
		DOWN: 	KEYS.DOWN
	};
	

	//---- Now the job ----
	function processKeyEvent( event ) {
		if (event.which === MOVE.RIGHT || event.which === MOVE.LEFT || event.which === MOVE.UP || event.which === MOVE.DOWN) {
			
			// Skip if typing
			if (document.activeElement.tagName === 'INPUT') {
				return true;
			}
			
			// Skip if dialog is active //TODO: Expand with more to skip when active
			if (jQuery('#NpcMenu, #NpcBox').length) {
				return true;
			}
			
			if(Session.Entity){
				event.stopImmediatePropagation();
				// Get direction from keyboard
				direction[0] = (event.which === MOVE.RIGHT ? +1 :
								event.which === MOVE.LEFT  ? -1 :
								0);

				direction[1] = (event.which === MOVE.UP    ? +1 :
								event.which === MOVE.DOWN  ? -1 :
								0);

				// Initialize matrix, based on Camera direction
				mat2.identity(rotate);
				mat2.rotate(rotate, rotate, -Camera.direction * 45 / 180 * Math.PI);

				// Apply matrix to vector
				vec2.transformMat2( direction, direction, rotate);

				//Create move packed and add direction to current position then send packet
				var pkt     = new PACKET.CZ.REQUEST_MOVE();
				pkt.dest[0] = Math.round(Session.Entity.position[0] + direction[0]);
				pkt.dest[1] = Math.round(Session.Entity.position[1] + direction[1]);
				Network.sendPacket(pkt);
				
				return false;
			}
			
			// Skip
			return true;
		}
		
		// Skip
		return true;
	}

	return function Init(){
		jQuery(window).on('keydown.map', function( event ){
				processKeyEvent(event);
		});
		
		//Return true to signal successful initialization
		return true;
	}
});
