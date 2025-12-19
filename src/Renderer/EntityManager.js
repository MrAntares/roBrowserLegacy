/**
 * @module Renderer/EntityManager
 *
 * Manage Entity
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require) {
	'use strict';


	// Load dependencies
	var Session        = require('Engine/SessionStorage');
	var Entity         = require('./Entity/Entity');
	var SpriteRenderer = require('./SpriteRenderer');
	var Mouse          = require('Controls/MouseEventHandler');
	var KEYS           = require('Controls/KeyEventHandler');
	var PathFinding    = require('Utils/PathFinding');
	var GraphicsSettings = require('Preferences/Graphics');
	var Altitude       = require('Renderer/Map/Altitude');
	var glMatrix       = require('Utils/gl-matrix');

	var vec3 = glMatrix.vec3;
	var _list = [];


	/**
	 * Spatial Grid for optimization
	 */
	var SpatialGrid = {
		cellSize: GraphicsSettings.culling ? GraphicsSettings.viewArea : 20,
		cells: {},
		
		/**
		 * Clear the grid
		 */
		clear: function() {
			this.cells = {};
		},

		/**
		 * Add entity to the grid
		 */
		add: function(entity) {
			// Simple spatial hashing
			var cx = Math.floor(entity.position[0] / this.cellSize);
			var cy = Math.floor(entity.position[1] / this.cellSize);
			var key = cx + "_" + cy;

			if (!this.cells[key]) {
				this.cells[key] = [];
			}
			this.cells[key].push(entity);
		},

		/**
		 * Get entities visible to the camera
		 * @param {object} gl - WebGL Context
		 * @return {Array} list of visible entities
		 */
		getVisibleEntities: function(gl) {
			var visibleEntities = [];
			
			// Get Camera info (Approximation for culling)
			// We assume the camera is looking at a target (Player)
			// A simple distance check or frustum check is needed.
			// Since we don't have full frustum planes readily available without calculation,
			// we use a generous radius around the camera target/center.
			
			var center = [0, 0, 0];
			var rangeX = GraphicsSettings.culling ? this.cellSize : 20;  // Horizontal visibility range (cells)
			var rangeY = GraphicsSettings.culling ? this.cellSize : 20;  // Vertical visibility range (cells)

			// Heuristic: Use Session Entity or Camera Target as center
			if (Session.Entity && Session.Entity.position) {
				center = Session.Entity.position;
			} else {
				// Fallback if no entity
				return _list; 
			}

			var startCx = Math.floor((center[0] - rangeX) / this.cellSize);
			var endCx   = Math.floor((center[0] + rangeX) / this.cellSize);
			var startCy = Math.floor((center[1] - rangeY) / this.cellSize);
			var endCy   = Math.floor((center[1] + rangeY) / this.cellSize);

			for (var y = startCy; y <= endCy; ++y) {
				for (var x = startCx; x <= endCx; ++x) {
					var key = x + "_" + y;
					if (this.cells[key]) {
						var cellEntities = this.cells[key];
						for(var i = 0; i < cellEntities.length; i++) {
							visibleEntities.push(cellEntities[i]);
						}
					}
				}
			}

			return visibleEntities;
		},

		/**
		 * Get entities near a specific point (for intersection)
		 */
		getNearbyEntities: function(x, y, range) {
			var nearEntities = [];
			var cellRange = Math.ceil(range / this.cellSize);
			
			var cx = Math.floor(x / this.cellSize);
			var cy = Math.floor(y / this.cellSize);

			for (var i = cy - cellRange; i <= cy + cellRange; i++) {
				for (var j = cx - cellRange; j <= cx + cellRange; j++) {
					var key = j + "_" + i;
					if (this.cells[key]) {
						nearEntities.push.apply(nearEntities, this.cells[key]);
					}
				}
			}
			return nearEntities;
		}
	};

	/**
	 * Find an Entity and return its index
	 *
	 * @param {number} gid
	 * @returns {number} position
	 */
	function getEntityIndex(gid) {
		if (gid < 0) {
			return -1;
		}

		var i, count = _list.length;

		for (i = 0; i < count; ++i) {
			if (_list[i].GID === gid) {
				return i;
			}
		}

		return -1;
	}


	/**
	 * Fetch all entities using a callback
	 *
	 * @param {function} callback
	 */
	function forEach(callback) {
		var i, count = _list.length;

		for (i = 0; i < count; ++i) {
			if (callback(_list[i]) === false) {
				return;
			}
		}
	}


	/**
	 * Find an Entity and return it
	 *
	 * @param {number} gid
	 * @returns {object} Entity
	 */
	function getEntity(gid) {
		// Reason for this check:
		// - Most packets your received is for the main character, so
		//   this check speed up the process.
		// - When you load a map, the main character is not in the list yet
		//   so we skip a lot of vital informations
		if (Session.Entity.GID === gid) {
			return Session.Entity;
		}

		var index = getEntityIndex(gid);
		if (index < 0) {
			return null;
		}

		return _list[index];
	}


	/**
	 * Add or replace entity
	 *
	 * @param {object} entity
	 * @return {object}
	 */
	function addEntity(entity) {
		var index = getEntityIndex(entity.GID);
		if (index < 0) {
			index = _list.push(entity) - 1;
		} else {
			_list[index].set(entity);
		}

		return _list[index];
	}


	/**
	 * Clean up entities from list
	 */
	function free() {
		var i, count = _list.length;

		for (i = 0; i < count; ++i) {
			_list[i].clean();
		}

		_list.length = 0;
		SpatialGrid.clear();
	}


	/**
	 * Remove an entity
	 * @param {number} gid
	 */
	function removeEntity(gid) {
		var index = getEntityIndex(gid);

		if (index > -1) {
			_list[index].clean();
			_list.splice(index, 1);
		}
	}


	/**
	 * @var {Entity} mouse over
	 */
	var _over = null;


	/**
	 * Return the entity the mouse is over
	 */
	function getOverEntity() {
		return _over;
	}


	/**
	 * Set over entity
	 */
	var _saveShift = false;

	function setOverEntity(target) {
		var current = _over;

		if (target === current && _saveShift === KEYS.SHIFT) {
			return;
		}

		_saveShift = KEYS.SHIFT;

		if (current) {
			current.onMouseOut();
		}

		if (target) {
			_over = target;
			target.onMouseOver();
		} else {
			_over = null;
		}
	}


	/**
	 * @var {Entity} target
	 */
	var _focus = null;


	/**
	 * Return the entity selected by the user
	 */
	function getFocusEntity() {
		return _focus;
	}


	/**
	 * Set over entity
	 * @param {Entity} entity
	 */
	function setFocusEntity(entity) {
		_focus = entity;
	}


	/**
	 * Sort entities by z-Index
	 *
	 * @param {Entity} a
	 * @param {Entity} b
	 */
	function sort(a, b) {
		var aDepth = a.depth + (a.GID % 100) / 1000;
		var bDepth = b.depth + (b.GID % 100) / 1000;

		return bDepth - aDepth;
	}

	var _supportPriority = false;

	/**
	 * Set reverse priority for entity sorting (for supportive skills)
	 * @param {boolean} v
	 */
	function setSupportPicking(v) {
		_supportPriority = v;
	}

	/**
	 * Sort entities by z-index and priorities
	 *
	 * @param {Entity} a
	 * @param {Entity} b
	 */
	function sortByPriority(a, b) {
		var aDepth = a.depth + ((!isNaN(a.GID)) ? a.GID % 100 : 0) / 1000;
		var bDepth = b.depth + ((!isNaN(b.GID)) ? b.GID % 100 : 0) / 1000;

		if (_supportPriority) {
			aDepth -= Entity.PickingPriority.Support[a.objecttype] * 100;
			bDepth -= Entity.PickingPriority.Support[b.objecttype] * 100;
		} else {
			aDepth -= Entity.PickingPriority.Normal[a.objecttype] * 100;
			bDepth -= Entity.PickingPriority.Normal[b.objecttype] * 100;
		}

		return aDepth - bDepth;
	}


	/**
	 * Render all entities (picking or not)
	 *
	 * @param {object} gl webgl context
	 * @param {mat4} modelView
	 * @param {mat4} projection
	 * @param {object} fog structure
	 * @param {object} renderEffects effect entities? true/false
	 *
	 * Infos: RO Game doesn't seems to render ambiant and diffuse on Sprites
	 */
	function render(gl, modelView, projection, fog, renderEffects) {
		var i, count;
		var tick = Date.now();

		// Stop rendering if no units to render (should never happened...)
		if (!_list.length) {
			return;
		}
		SpatialGrid.cellSize = GraphicsSettings.culling ? GraphicsSettings.viewArea : 20;
		// Note: Rebuilding grid every frame is O(N), but usually N is < 1000.
		// This allows us to sort only visible entities O(K log K) where K << N.
		SpatialGrid.clear();
		for(i = 0, count = _list.length; i < count; ++i) {
			SpatialGrid.add(_list[i]);
		}

		// Get only visible entities
		var visibleList = SpatialGrid.getVisibleEntities(gl);
		
		visibleList.sort(sort);

		// Use program
		SpriteRenderer.bind3DContext(gl, modelView, projection, fog);

		// Rendering
		for (i = 0, count = visibleList.length; i < count; ++i) {
			var entity = visibleList[i];

			if ((entity.objecttype != entity.constructor.TYPE_EFFECT && !renderEffects) || (entity.objecttype == entity.constructor.TYPE_EFFECT && renderEffects)) {
				// Remove from list
				if (entity.remove_tick && entity.remove_tick + entity.remove_delay < tick) {

					// Remove focus
					var entityFocus = getFocusEntity();
					if (entityFocus && entityFocus.GID === entity.GID) {
						entityFocus.onFocusEnd();
						setFocusEntity(null);
					}

					entity.clean();
					
					// We need to find and remove from the main list, not the visible list
					var idx = _list.indexOf(entity);
					if (idx > -1) {
						_list.splice(idx, 1);
					}
					
					continue;
				}

				entity.render(modelView, projection);
			}
		}

		// Clean program
		SpriteRenderer.unbind(gl);
	}

	/**
	 * Intersect Entities
	 */
	function intersect() {
		var i, count;
		var entity;

		// Stop rendering if no units to render (should never happened...)
		if (!_list.length) {
			return;
		}
		var candidates = [];
		var center = Session.Entity.position; // [x, y, z]
		var range = GraphicsSettings.culling ? GraphicsSettings.viewArea : 20;
		
		if (!center) return null;

		for (i = 0, count = _list.length; i < count; ++i) {
			entity = _list[i];
			if (Math.abs(entity.position[0] - center[0]) < range && Math.abs(entity.position[1] - center[1]) < range) {
				candidates.push(entity);
			}
		}

		candidates.sort(sortByPriority);

		var x = Mouse.screen.x;
		var y = Mouse.screen.y;

		for (i = 0, count = candidates.length; i < count; ++i) {
			entity = candidates[i];

			// No picking on dead entites
			if ((entity.action !== entity.ACTION.DIE || entity.objecttype === Entity.TYPE_PC) && entity.remove_tick === 0) {
				if (x > entity.boundingRect.x1 &&
					x < entity.boundingRect.x2 &&
					y > entity.boundingRect.y1 &&
					y < entity.boundingRect.y2) {
					return entity;
				}
			}
		}

		return null;
	}

	/**
	 * Returns the closest entity to the source entity
	 *
	 * @param {entity} source entity
	 * @param {type} entity type to look for
	 */
	function getClosestEntity(sourceEntity, type) {
		var closestEntity = false;
		var distance      = Infinity;

		// Optimization: Use simple distance check first before expensive pathfinding
		_list.forEach((entity) => {
			if (entity.GID !== sourceEntity.GID && entity.objecttype === type && entity.action !== entity.ACTION.DIE && entity.remove_tick === 0) {
				
				// Quick distance check (Manhattan or Euclidean)
				var distSq = Math.pow(entity.position[0] - sourceEntity.position[0], 2) + Math.pow(entity.position[1] - sourceEntity.position[1], 2);
				let view_range = GraphicsSettings.culling ? GraphicsSettings.viewArea : 20;
				if (distSq > view_range) return; // Ignore entities > viewrange cells away

				var dst = Infinity;
				if (closestEntity) {
					// Only pathfind if potentially closer than current best
					if (distSq < distance * distance) {
						dst = getPathDistance(sourceEntity, entity);
						if (dst && dst < distance) {
							closestEntity = entity;
							distance      = dst;
						}
					}
				} else {
					dst = getPathDistance(sourceEntity, entity);
					if (dst) {
						closestEntity = entity;
						distance      = dst;
					}
				}
			}
		});

		return closestEntity;
	}

	/**
	 * Returns the distance between two entities based on direct walkpath
	 *
	 * @param {entity} from entity
	 * @param {entity} to entity
	 */
	function getPathDistance(fromEntity, toEntity) {
		var out   = [];
		var count = PathFinding.search(
			fromEntity.position[0] | 0, fromEntity.position[1] | 0,
			toEntity.position[0] | 0, toEntity.position[1] | 0,
			1,
			out,
			Altitude.TYPE.WALKABLE
		);
		return count;
	}

	var EntityManager = {
		free: free,
		add: addEntity,
		remove: removeEntity,
		get: getEntity,
		forEach: forEach,

		getOverEntity: getOverEntity,
		setOverEntity: setOverEntity,
		getFocusEntity: getFocusEntity,
		setFocusEntity: setFocusEntity,

		getClosestEntity: getClosestEntity,

		render: render,
		intersect: intersect,
		setSupportPicking: setSupportPicking,
	};


	/**
	 * Get access to manager from Entity object
	 */
	Entity.Manager = EntityManager;


	/**
	 * Export
	 */
	return EntityManager;
});
