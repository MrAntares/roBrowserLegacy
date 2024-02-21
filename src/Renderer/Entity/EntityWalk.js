/**
 * Renderer/EntityWalk.js
 *
 * Manage entity walking action
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define( function( require )
{
	'use strict';

	/**
	 *  Load dependencies
	 */
	var PathFinding = require('Utils/PathFinding');
	var Renderer    = require('Renderer/Renderer');
	var Altitude    = require('Renderer/Map/Altitude');


	/**
	 * Direction look up table
	 */
	var DIRECTION = [
		[1,2,3],
		[0,0,4],
		[7,6,5]
	];


	/**
	 * Walk save structure
	 */
	function WalkStructure()
	{
		this.speed =  150;
		this.tick  =  0;
		this.prevTick = 0;
		this.path  =  new Int16Array(PathFinding.MAX_WALKPATH * 2);
		this.pos   =  new Float32Array(3);
		this.onEnd = null;
		this.index =  0;
		this.total =  0;
	}

	function calculateOverShot(from_x, from_y, to_x, to_y) {
		var overshot = 5;
		var over_x = to_x, over_y = to_y;
		if (from_x > to_x && from_y > to_y) { //Quadrant 3
			over_x = to_x - overshot;
			over_y = to_y - overshot;
		} else if (from_x < to_x && from_y > to_y) { //Quadrant 4
			over_x = to_x + overshot;
			over_y = to_y - overshot;
		} else if (from_x < to_x && from_y < to_y) { //Quadrant 1
			over_x = to_x + overshot;
			over_y = to_y + overshot;
		} else if (from_x > to_x && from_y < to_y) { //Quadrant 2
			over_x = to_x - overshot;
			over_y = to_y + overshot;
		} else if (from_y < to_y) { // pure positve y position
			over_x = to_x;
			over_y = to_y + overshot;
		} else if (to_y < from_y) { // pure negative y position
			over_x = to_x;
			over_y = to_y - overshot;
		} else if (from_x < to_x) { // pure positve y position
			over_x = to_x + overshot;
			over_y = to_y;
		} else if (from_x > to_x) { // pure negative x position
			over_x = to_x - overshot;
			over_y = to_y;
		}
		return [over_x, over_y];
	}

	/**
	 * Want to move non walkable cell
	 *
	 * @param {number} from_x
	 * @param {number} from_y
	 * @param {number} to_x
	 * @param {number} to_y
	 * @param {number} range optional
	 * @param {bool} isOverShoot use for falcon
	 */
	function walkToNonWalkableGround( from_x, from_y, to_x, to_y, range, isOverShoot = false, isGliding = false )
	{
		this.resetRoute();
		var path  = this.walk.path;

		if (isOverShoot) { //falcon overshoot
			var OverShootPosition = calculateOverShot(from_x, from_y, to_x, to_y);
			to_x = OverShootPosition[0];
			to_y = OverShootPosition[1];
		}

		var total = 0;
		var result = PathFinding.searchLongIgnoreCellType( from_x | 0, from_y | 0, to_x | 0, to_y | 0, range || 0, path, true);

		if(result.success)
			total = result.pathLength + 1

		this.walk.index =     1 * 2; // skip first index
		this.walk.total = total * 2;
		if (total > 0) {
			// Same position
			if (total === 2 &&
				path[this.walk.index+0] === from_x &&
				path[this.walk.index+1] === from_y) {
				return;
			}

			this.walk.pos.set(this.position);
			this.walk.tick =  this.walk.prevTick = Renderer.tick;
			this.headDir   = 0;

			if (this.objecttype === this.constructor.TYPE_FALCON) {
				var action = isGliding ? this.ACTION.WALK : this.ACTION.IDLE;
				this.setAction({
					action: action,
					frame:  0,
					repeat: true,
					play:   true
				});
			}
		}
	}


	/**
	 * Want to move to a cell
	 *
	 * @param {number} from_x
	 * @param {number} from_y
	 * @param {number} to_x
	 * @param {number} to_y
	 * @param {number} range optional
	 */
	function walkTo( from_x, from_y, to_x, to_y, range )
	{
		this.resetRoute();
		var path  = this.walk.path;
		
		var total = PathFinding.search( from_x | 0, from_y | 0, to_x | 0, to_y | 0, range || 0, path);

		this.walk.index =     1 * 2; // skip first index
		this.walk.total = total * 2;

		if (total) {
			// Same position
			if (total === 2 &&
				path[this.walk.index+0] === from_x &&
				path[this.walk.index+1] === from_y) {
				return;
			}

			this.walk.pos.set(this.position);
			this.walk.tick =  this.walk.prevTick = Renderer.tick;
			this.headDir   = 0;

			this.setAction({
				action: this.ACTION.WALK,
				frame:  0,
				repeat: true,
				play:   true
			});
		}
	}

	/**
	 * Process walking
	 */
	function walkProcess()
	{
		var pos  = this.position;
		var walk = this.walk;
		var path = walk.path;
		var index = walk.index;
		var total = walk.total;

		var x, y, speed;
		var TICK = Renderer.tick;
		var delay = 0;
		var cellHeight;
		var falconGliding = 5;

		if(this.objecttype == this.constructor.TYPE_FALCON && total == 0) 
			return;

		if (this.action === this.ACTION.WALK || this.objecttype === this.constructor.TYPE_FALCON) {

			if (index < total) {
				
				// Calculate new position, base on time and walk speed.
				while (index < total) {
					x = path[index+0] - (walk.pos[0]);
					y = path[index+1] - (walk.pos[1]);

					// Seems like walking on diagonal is slower ?
					speed = ( x && y ) ? walk.speed / 0.7 : walk.speed;

					// New position :)
					if (TICK - walk.tick <= speed) {
						break;
					}

					walk.tick += speed;
					walk.prevTick = TICK; // Store tick

					walk.pos[0] = path[index+0];
					walk.pos[1] = path[index+1];
					index += 2;
				}

				// Calculate and store new position
				// TODO: check the min() part.

				delay      = Math.min(speed, TICK-walk.tick);
				walk.index = index;

				// Should not happened, avoid division by 0
				if (!delay) {
					delay = 150;
				}

				cellHeight = this.objecttype == this.constructor.TYPE_FALCON ? Altitude.getCellHeight( pos[0], pos[1] ) + falconGliding : Altitude.getCellHeight( pos[0], pos[1] );
				pos[0] = walk.pos[0] + x / (speed / delay);
				pos[1] = walk.pos[1] + y / (speed / delay);
				pos[2] = cellHeight;

				// Update player direction while walking
				if (index < total) {
					this.direction = DIRECTION[(x>0?1:x<0?-1:0)+1][(y>0?1:y<0?-1:0)+1];
					return;
				}
			}

			// Stop walking
			if(this.objecttype !== this.constructor.TYPE_FALCON) {
				this.setAction({
					action: this.ACTION.IDLE,
					frame:  0,
					play:   true,
					repeat: true
				});
			}

			this.onWalkEnd();

			// Temporary callback
			if (walk.onEnd) {
				walk.onEnd();
				walk.onEnd = null;
			}
			cellHeight = this.objecttype == this.constructor.TYPE_FALCON ? Altitude.getCellHeight( pos[0], pos[1] ) + 5 : Altitude.getCellHeight( pos[0], pos[1] );
			pos[0] = Math.round(pos[0]);
			pos[1] = Math.round(pos[1]);
			pos[2] = cellHeight;
			this.resetRoute();
		} 
		else {
			if (index < total) { // Walking got interrupted by getting attacked or other means
				this.walk.tick += TICK - this.walk.prevTick; // Offset walking by the time elapsed.
				this.walk.prevTick = TICK; // Store tick
			}
			return;
		}
	}

	function resetRoute() {
		this.tick  =  0;
		this.prevTick = 0;
		this.path  =  new Int16Array(PathFinding.MAX_WALKPATH * 2);
		this.onEnd = null;
		this.index =  0;
		this.total =  0;
	}

	/**
	 * Initialize and export methods
	 */
	return function Init()
	{
		this.onWalkEnd   = function onWalkEnd() {};
		this.walk        = new WalkStructure();
		this.walkTo      = walkTo;
		this.walkProcess = walkProcess;
		this.walkToNonWalkableGround = walkToNonWalkableGround;
		this.resetRoute = resetRoute;
	};
});