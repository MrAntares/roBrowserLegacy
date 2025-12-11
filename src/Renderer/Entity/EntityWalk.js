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
	var Session     = require('Engine/SessionStorage');

	/**
	 * Direction look up table
	 */
	var DIRECTION = [
		[1,2,3],
		[0,0,4],
		[7,6,5]
	];

	// Facing behavior (official-like):
	// - First segment: continuous heading toward next tile center.
	// - Later segments: snap to 8-way direction per segment offset.

	/**
	 * Estimate total walk duration for a path, in ms.
	 * `total` is the number of coordinate entries in `path` (walk.total).
	 */
	function estimatePathDuration(path, total, baseSpeed) {
		if (!total || total < 4 || !baseSpeed) {
			return baseSpeed || 0;
		}

		var duration = 0;
		for (var i = 0; i < total - 2; i += 2) {
			var dx = path[i + 2] - path[i];
			var dy = path[i + 3] - path[i + 1];
			duration += (dx && dy) ? baseSpeed * Math.SQRT2 : baseSpeed;
		}

		return duration;
	}

	/**
	 * Convert a server moveStartTime to a client tick so we can fast-forward
	 * the walk based on latency.
	 */
		function computeWalkStartTick(nowTick, moveStartTime, pathDuration, maxClamp) {
			if (!moveStartTime || !Session || !Session.serverTick) {
				return nowTick;
			}

		var elapsed = Session.serverTick - moveStartTime;
		if (!isFinite(elapsed) || elapsed <= 0) {
			return nowTick;
		}

			if (pathDuration && pathDuration > 0) {
				// If the delta is wildly larger than the path duration, serverTick is probably not aligned.
				if (elapsed > pathDuration * 4) {
					return nowTick;
				}
				elapsed = Math.min(elapsed, (typeof maxClamp === 'number' ? maxClamp : pathDuration));
			} else {
				elapsed = Math.min(elapsed, (typeof maxClamp === 'number' ? maxClamp : 1000));
			}

		return nowTick - elapsed;
	}

	/**
	 * Walk save structure
	 */
	function WalkStructure()
	{
		this.speed =  150;
		this.tick  =  0;
		this.prevTick = 0;
		this.dist  =  0;
		this.path  =  new Int16Array(PathFinding.MAX_WALKPATH * 2);
		this.pos   =  new Float32Array(3);
		this.lastPos = new Float32Array(3);
		this.onEnd = null;
		this.index =  0;
		this.total =  0;
	}

	/**
	 * Convert dx/dy offset to a floating-point direction in [0..8).
	 * 0 = south, 2 = west, 4 = north, 6 = east (matching DIRECTION table).
	 */
	function offsetToFloatDir(dx, dy) {
		if (dx === 0 && dy === 0) {
			return 0;
		}
		// atan2: 0=+X (east), PI/2=+Y (north), PI=-X (west), -PI/2=-Y (south)
		// We need: 6=east, 4=north, 2=west, 0=south (RO direction indexing).
		// Formula: dir = ((-angle)/(PI/4) + 6) mod 8
		var angle = Math.atan2(dy, dx);
		var dir = ((-angle) / (Math.PI / 4) + 6) % 8;
		if (dir < 0) dir += 8;
		return dir;
	}

	/**
	 * Quantize floating-point direction to integer [0..7].
	 */
	function quantizeDir(floatDir) {
		return Math.round(floatDir) % 8;
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
	 * @param {bool} isAttacking falcon = set walk / wug = set attack
	 */
	function walkToNonWalkableGround( from_x, from_y, to_x, to_y, range, isOverShoot = false, isAttacking = false, moveStartTime )
	{
			var hadRoute = this.walk && this.walk.total > 0;

		this.resetRoute(hadRoute);

		this.isAttacking = isAttacking;

		// calculate overshoot (only falcon)
		if (this.objecttype === this.constructor.TYPE_FALCON && isOverShoot) {
			var OverShootPosition = calculateOverShot(from_x, from_y, to_x, to_y);
			to_x = OverShootPosition[0];
			to_y = OverShootPosition[1];
		}

		// Same position
		if(from_x === to_x && from_y === to_y) {
			return;
		}

		var path  = this.walk.path;
		var total = 0;
		var result = PathFinding.searchLongIgnoreCellType( from_x | 0, from_y | 0, to_x | 0, to_y | 0, range || 0, path, true);

		if(result.success)
			total = result.pathLength + 1

			this.walk.index =     1 * 2; // skip first index
			this.walk.total = total * 2;
			if (total > 0) {
				this.walk.pos.set(this.position);
				var nowTick = Renderer.tick;
				var pathDuration = estimatePathDuration(this.walk.path, this.walk.total, this.walk.speed);
				var isPlayerLike = (
					this.objecttype === this.constructor.TYPE_PC ||
					this.objecttype === this.constructor.TYPE_DISGUISED ||
					this.objecttype === this.constructor.TYPE_PET ||
					this.objecttype === this.constructor.TYPE_HOM ||
					this.objecttype === this.constructor.TYPE_MERC
				);
				// For non-player entities we only fast-forward up to one step worth of time.
				// Their client-side path can diverge from the server due to dynamic obstacles,
				// and over-fast-forwarding makes STOPMOVE snaps more visible.
				var maxFastForward = isPlayerLike ? pathDuration : Math.min(pathDuration, this.walk.speed);
				var startTick = computeWalkStartTick(nowTick, moveStartTime, pathDuration, maxFastForward);
				this.walk.tick = this.walk.prevTick = startTick;

				// Keep distance accumulation if we were already walking to avoid animation restarts.
				if (!hadRoute) {
					this.walk.dist = 0;
				}
				this.walk.lastPos.set(this.position);

				// Initialize facing for the first segment (continuous heading handled in walkProcess).
				if (this.walk.total >= 2) {
					var firstX0 = this.walk.path[2];
					var firstY0 = this.walk.path[3];
					var initDir0 = offsetToFloatDir(firstX0 - this.position[0], firstY0 - this.position[1]);
					this.direction = quantizeDir(initDir0);
				}

				var action = this.ACTION.WALK;
				if (this.objecttype === this.constructor.TYPE_FALCON && !isAttacking) { // falcon: action.walk = gliding
					action = this.ACTION.IDLE;
				}
				if (this.objecttype === this.constructor.TYPE_WUG && isAttacking) {
					action = this.ACTION.ATTACK;
				}

				if (this.action !== action) {
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
	function walkTo( from_x, from_y, to_x, to_y, range, moveStartTime )
	{
		// Same position
		if(from_x === to_x && from_y === to_y) {
			return;
		}

		var hadRoute = this.walk && this.walk.total > 0;
		var wasWalkingAction = this.action === this.ACTION.WALK;

		this.resetRoute(hadRoute);

		var path  = this.walk.path;
		var total = PathFinding.search( from_x | 0, from_y | 0, to_x | 0, to_y | 0, range || 0, path);

			this.walk.index =     1 * 2; // skip first index
			this.walk.total = total * 2;

			if (total) {
				this.walk.pos.set(this.position);
				var nowTick = Renderer.tick;
				var pathDuration = estimatePathDuration(this.walk.path, this.walk.total, this.walk.speed);
				var isPlayerLike = (
					this.objecttype === this.constructor.TYPE_PC ||
					this.objecttype === this.constructor.TYPE_DISGUISED ||
					this.objecttype === this.constructor.TYPE_PET ||
					this.objecttype === this.constructor.TYPE_HOM ||
					this.objecttype === this.constructor.TYPE_MERC
				);
				var maxFastForward = isPlayerLike ? pathDuration : Math.min(pathDuration, this.walk.speed);
				var startTick = computeWalkStartTick(nowTick, moveStartTime, pathDuration, maxFastForward);
				this.walk.tick = this.walk.prevTick = startTick;

				if (!hadRoute) {
					this.walk.dist = 0;
				}
				this.walk.lastPos.set(this.position);

				// Initialize facing for the first segment (continuous heading handled in walkProcess).
				if (this.walk.total >= 2) {
					var firstX1 = this.walk.path[2];
					var firstY1 = this.walk.path[3];
					var initDir1 = offsetToFloatDir(firstX1 - this.position[0], firstY1 - this.position[1]);
					this.direction = quantizeDir(initDir1);
				}
				this.headDir = 0;

			// Only set action if not already walking
			if (!wasWalkingAction) {
				this.setAction({
					action: this.ACTION.WALK,
					frame:  0,
					repeat: true,
					play:   true
				});
			}
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

		var TICK = Renderer.tick;
		var falconGliding = 5;

		if(total == 0)
			return;

		if (total > 0 &&
			this.action !== this.ACTION.WALK &&
			this.objecttype !== this.constructor.TYPE_FALCON &&
			this.objecttype !== this.constructor.TYPE_WUG) {

			var actionName = 'UNKNOWN';
			for (var key in this.ACTION) {
				if (this.ACTION[key] === this.action) {
					actionName = key;
					break;
				}
			}

			console.warn('🚨 CHARACTER STUCK IN WALKING ANIMATION - SHARE DETAILS AT ROBROWSER GITHUB:', {
				GID: this.GID,
				nome: this.display ? this.display.name : 'N/A',
				action: this.action,
				actionName: actionName,
				walkTotal: total,
				walkIndex: index,
				position: [Math.round(pos[0]), Math.round(pos[1])],
				objecttype: this.objecttype,
				timestamp: new Date().toISOString()
			});

			console.trace('Stack trace of debug:');
		}

		if (this.action === this.ACTION.WALK || this.objecttype === this.constructor.TYPE_FALCON || this.objecttype === this.constructor.TYPE_WUG) {

			var getSegmentDuration = function getSegmentDuration(dx, dy, baseSpeed) {
				var duration = (dx && dy) ? baseSpeed * Math.SQRT2 : baseSpeed;
				if (!duration || duration < 1) {
					duration = 1;
				}
				return duration;
			};

			var finishWalk = function finishWalk() {
				var cellHeight = this.objecttype == this.constructor.TYPE_FALCON ? Altitude.getCellHeight( path[total-2], path[total-1] ) + 5 : Altitude.getCellHeight( path[total-2], path[total-1] );

				pos[0] = path[total-2];
				pos[1] = path[total-1];
				pos[2] = cellHeight;
				walk.lastPos.set(pos);

				if(this.objecttype == this.constructor.TYPE_WUG && this.isAttacking) {
					this.setAction({
						action: this.ACTION.ATTACK,
						frame:  0,
						repeat: false,
						play:   true,
						next: {
							delay:  Renderer.tick + 432,
							action: this.ACTION.IDLE,
							frame:  0,
							repeat: false,
							play:   true,
							next:  false
						}
					});
				} else {
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

				this.resetRoute();
				this.isAttacking = false;
			}.bind(this);

			if (index >= total) {
				finishWalk();
				return;
			}

			var startX = walk.pos[0];
			var startY = walk.pos[1];
			var nextX  = path[index+0];
			var nextY  = path[index+1];
			var dx     = nextX - startX;
			var dy     = nextY - startY;
			var speed  = getSegmentDuration(dx, dy, walk.speed);
			var segmentStart = walk.tick || TICK;
			var segmentEnd   = segmentStart + speed;
			var traveledDist = 0;

			// If we were paused by another action, keep segment timing in sync.
			if (walk.prevTick && walk.prevTick !== TICK && walk.prevTick > segmentStart && this.action !== this.ACTION.WALK) {
				segmentStart += TICK - walk.prevTick;
				segmentEnd   = segmentStart + speed;
			}

			// Advance across any fully elapsed segments, accumulating distance.
			while (index < total - 2 && TICK >= segmentEnd) {
				traveledDist += Math.sqrt(
					(nextX - walk.lastPos[0]) * (nextX - walk.lastPos[0]) +
					(nextY - walk.lastPos[1]) * (nextY - walk.lastPos[1])
				);

				walk.pos[0] = startX = nextX;
				walk.pos[1] = startY = nextY;
				walk.lastPos[0] = nextX;
				walk.lastPos[1] = nextY;
				index += 2;

				nextX  = path[index+0];
				nextY  = path[index+1];
				dx     = nextX - startX;
				dy     = nextY - startY;
				speed  = getSegmentDuration(dx, dy, walk.speed);
				segmentStart = segmentEnd;
				segmentEnd   = segmentStart + speed;
			}

			// Interpolate current segment
			var duration = Math.max(segmentEnd - segmentStart, 1);
			var t = Math.min(Math.max((TICK - segmentStart) / duration, 0), 1);
			var newX = startX + dx * t;
			var newY = startY + dy * t;

			traveledDist += Math.sqrt(
				(newX - walk.lastPos[0]) * (newX - walk.lastPos[0]) +
				(newY - walk.lastPos[1]) * (newY - walk.lastPos[1])
			);
			walk.lastPos[0] = newX;
			walk.lastPos[1] = newY;

			var cellHeight = this.objecttype == this.constructor.TYPE_FALCON ? Altitude.getCellHeight( newX, newY ) + falconGliding : Altitude.getCellHeight( newX, newY );
			pos[0] = newX;
			pos[1] = newY;
			pos[2] = cellHeight;

			// Facing update:
			// First segment uses continuous heading from current interpolated position to next tile.
			// Later segments snap to discrete 8-way direction based on the segment offset.
			if (index < total) {
				if (index === 2) {
					var remDx = nextX - newX;
					var remDy = nextY - newY;

					// If we're effectively at the next tile (fast-forwarded/last frame),
					// fall back to the segment's discrete direction instead of defaulting south.
					if (Math.abs(remDx) < 0.001 && Math.abs(remDy) < 0.001) {
						var prevTileX0 = path[index - 2];
						var prevTileY0 = path[index - 1];
						var segDx0 = nextX - prevTileX0;
						var segDy0 = nextY - prevTileY0;
						var dirRow0 = DIRECTION[segDx0 + 1];
						if (dirRow0 && typeof dirRow0[segDy0 + 1] !== 'undefined') {
							this.direction = dirRow0[segDy0 + 1];
						}
					} else {
						var contDir = offsetToFloatDir(remDx, remDy);
						this.direction = quantizeDir(contDir);
					}
				} else {
					var segDx = Math.round(nextX - startX);
					var segDy = Math.round(nextY - startY);
					var dirRow = DIRECTION[segDx + 1];
					if (dirRow && typeof dirRow[segDy + 1] !== 'undefined') {
						this.direction = dirRow[segDy + 1];
					}
				}
			}

			walk.dist += traveledDist;
			walk.index = index;
			walk.tick  = segmentStart;
			walk.prevTick = TICK;

			var reachedEnd = (index >= total - 2 && t >= 0.999 && TICK >= segmentEnd);

			if (!reachedEnd) {
				return;
			}

			// Stop walking
			finishWalk();
		}
		else {
			if (index < total) { // Walking got interrupted by getting attacked or other means
				this.walk.tick += TICK - this.walk.prevTick; // Offset walking by the time elapsed.
				this.walk.prevTick = TICK; // Store tick
			}
			return;
		}
	}

	function entitiesWalkProcess() {
		var player_entity;

		if(this.walk.lastWalkTick + 200 > Renderer.tick) {
			return;
		}

		if(this.falcon) {
			player_entity = this.falcon;
		} else if(this.wug) {
			player_entity = this.wug;
		}

		if(player_entity) {
			if(player_entity.isAttacking)
				return;

			let range = player_entity.objecttype == player_entity.constructor.TYPE_FALCON ? 1 : 4;
			let distance = Math.floor(this.distance(this,player_entity));

			if(player_entity.objecttype == player_entity.constructor.TYPE_FALCON) {
				if(distance > 5)
					player_entity.walk.speed = this.walk.speed - 10;
				else
					player_entity.walk.speed = this.walk.speed + 5;
			} else {
				player_entity.walk.speed = this.walk.speed - 10;
			}

			if(distance >= range && (player_entity.walk.total == 0 || player_entity.walk.total - player_entity.walk.index <= 2)) { // 2 = last steps
				if(this.walk.total)
					player_entity.walkToNonWalkableGround( player_entity.position[0], player_entity.position[1], this.walk.path[this.walk.total-2], this.walk.path[this.walk.total-1], range-1, false, false); // wug always stay 3 cells away from owner
				else
					player_entity.walkToNonWalkableGround( player_entity.position[0], player_entity.position[1], Math.round(this.position[0]), Math.round(this.position[1]), range-1, false, false); // wug always stay 3 cells away from owner
			}
		}
		this.walk.lastWalkTick = Renderer.tick;
	}

	function resetRoute(keepDistance) {
		this.walk.tick  =  0;
		this.walk.prevTick = 0;
		if (!keepDistance) {
			this.walk.dist = 0;
		}
		this.walk.path  =  new Int16Array(PathFinding.MAX_WALKPATH * 2);
		this.walk.lastPos[0] = 0;
		this.walk.lastPos[1] = 0;
		this.walk.lastPos[2] = 0;
		if (this.walk.onEnd) {
			this.walk.onEnd();
		}
		this.walk.onEnd = null;
		this.walk.index =  0;
		this.walk.total =  0;
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

	function distance(entity1, entity2) {
		const x1 = entity1.position[0];
		const y1 = entity1.position[1];
		const x2 = entity2.position[0];
		const y2 = entity2.position[1];
		return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
	}

	/**
	 * Initialize and export methods
	 */
	return function Init()
	{
		this.onWalkEnd   = function onWalkEnd() {};
		this.walk        = new WalkStructure();
		this.walkTo      = walkTo;
		this.walkToNonWalkableGround = walkToNonWalkableGround;
		this.walkProcess = walkProcess;
		this.entitiesWalkProcess = entitiesWalkProcess;
		this.resetRoute = resetRoute;
		this.distance = distance;
	};
});
