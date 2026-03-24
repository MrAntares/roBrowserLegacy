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
	var Session = require('Engine/SessionStorage');
	var Entity = require('./Entity/Entity');
	var SpriteRenderer = require('./SpriteRenderer');
	var Mouse = require('Controls/MouseEventHandler');
	var KEYS = require('Controls/KeyEventHandler');
	var PathFinding = require('Utils/PathFinding');
	var GraphicsSettings = require('Preferences/Graphics');
	var Altitude = require('Renderer/Map/Altitude');
	var glMatrix = require('Utils/gl-matrix');

	var vec3 = glMatrix.vec3;
	var _list = [];

	// O(1) GID lookup map
	var _gidMap = new Map();

	// Sort optimization flags
	var _renderSortDirty = true;
	var _renderFrameCounter = 0;
	var _pickSortDirty = true;
	var _pickList = [];
	var _lastSupportPriority = false;

	/**
	 * Find an Entity and return it directly via Map lookup (O(1))
	 *
	 * @param {number} gid
	 * @returns {object|null} Entity
	 */
	function getEntityByGID(gid) {
		if (gid < 0) {
			return null;
		}
		return _gidMap.get(gid) || null;
	}

	/**
	 * Find an Entity and return its index in _list (for splice operations)
	 *
	 * @param {number} gid
	 * @returns {number} position
	 */
	function getEntityIndex(gid) {
		if (gid < 0) {
			return -1;
		}

		var entity = _gidMap.get(gid);
		if (!entity) {
			return -1;
		}

		return _list.indexOf(entity);
	}

	/**
	 * Find an Entity and return its index
	 *
	 * @param {number} aid
	 * @returns {number} position
	 */
	function getEntityIndexBy(getter, value) {
		if (value < 0) {
			return -1;
		}

		var i,
			count = _list.length;
		for (i = 0; i < count; ++i) {
			if (getter(_list[i]) === value) {
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
		var i,
			count = _list.length;

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

		return getEntityByGID(gid);
	}

	/**
	 * Pending transformations that arrived before entity spawned
	 * { GID: { monster_transform: value, active_monster_transform: value, job_transform: value } }
	 */
	var pendingTransformations = {};

	/**
	 * Helper to safely store a pending transformation before entity spawns
	 *
	 * @param {number} aid - Actor ID
	 * @param {string} key - transformation property name
	 * @param {*} value - transformation value (monster ID, JobId, or null to clear)
	 */
	function storePendingTransform(aid, key, value) {
		if (!pendingTransformations[aid]) {
			pendingTransformations[aid] = {};
		}
		pendingTransformations[aid][key] = value;
	}

	/**
	 * Find an Entity via AID and return it
	 * Note: Currently Character ID (CID) is stored as AID in Entity
	 * Note2: Need to review all AID implementation in both packet and entity
	 * @param {number} aid
	 * @returns {object} Entity
	 */
	function getEntityByCID(aid) {
		if (Session.Entity.AID === aid) {
			return Session.Entity;
		}

		var index = getEntityIndexBy(e => e.AID, aid);
		return index < 0 ? null : _list[index];
	}

	/**
	 * Add or replace entity
	 *
	 * @param {object} entity
	 * @return {object}
	 */
	function addEntity(entity) {
		var existing = getEntityByGID(entity.GID);
		if (!existing) {
			_list.push(entity);
			_gidMap.set(entity.GID, entity);
			_renderSortDirty = true;
			_pickSortDirty = true;
			return entity;
		} else {
			existing.set(entity);
			return existing;
		}
	}

	/**
	 * Clean up entities from list
	 */
	function free() {
		var i,
			count = _list.length;

		for (i = 0; i < count; ++i) {
			_list[i].clean();
		}

		_list.length = 0;
		_gidMap.clear();
		_pickList.length = 0;
		_renderSortDirty = true;
		_pickSortDirty = true;
	}

	/**
	 * Remove an entity
	 * @param {number} gid
	 */
	function removeEntity(gid) {
		var entity = _gidMap.get(gid);

		if (entity) {
			entity.clean();
			_gidMap.delete(gid);
			var index = _list.indexOf(entity);
			if (index > -1) {
				_list.splice(index, 1);
			}
			_renderSortDirty = true;
			_pickSortDirty = true;
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
		if (_supportPriority !== v) {
			_supportPriority = v;
			_pickSortDirty = true;
		}
	}

	/**
	 * Sort entities by z-index and priorities
	 *
	 * @param {Entity} a
	 * @param {Entity} b
	 */
	function sortByPriority(a, b) {
		var aDepth = a.depth + (!isNaN(a.GID) ? a.GID % 100 : 0) / 1000;
		var bDepth = b.depth + (!isNaN(b.GID) ? b.GID % 100 : 0) / 1000;

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

		// Sort only when dirty or every 3 frames to stay responsive to depth changes
		_renderFrameCounter++;
		if (_renderSortDirty || _renderFrameCounter >= 3) {
			_list.sort(sort);
			_renderSortDirty = false;
			_renderFrameCounter = 0;
			_pickSortDirty = true;
		}

		// Use program
		SpriteRenderer.bind3DContext(gl, modelView, projection, fog);

		// Pre-compute culling values outside the loop
		var doCulling = GraphicsSettings.performanceMode;
		var playerX, playerY, viewAreaSq;
		if (doCulling && Session.Entity && Session.Entity.position) {
			playerX = Session.Entity.position[0];
			playerY = Session.Entity.position[1];
			viewAreaSq = GraphicsSettings.viewArea * GraphicsSettings.viewArea;
		}

		// Rendering
		for (i = 0, count = _list.length; i < count; ++i) {
			if (
				(_list[i].objecttype != _list[i].constructor.TYPE_EFFECT && !renderEffects) ||
				(_list[i].objecttype == _list[i].constructor.TYPE_EFFECT && renderEffects)
			) {
				// Remove from list
				if (_list[i].remove_tick && _list[i].remove_tick + _list[i].remove_delay < tick) {
					// Remove focus
					var entityFocus = getFocusEntity();
					if (entityFocus && entityFocus.GID === _list[i].GID) {
						entityFocus.onFocusEnd();
						setFocusEntity(null);
					}

					_gidMap.delete(_list[i].GID);
					_list[i].clean();
					_list.splice(i, 1);
					i--;
					count--;
					_pickSortDirty = true;
					continue;
				}
				if (doCulling) {
					var dx = _list[i].position[0] - playerX;
					var dy = _list[i].position[1] - playerY;
					if (dx * dx + dy * dy > viewAreaSq) {
						continue;
					}
				}
				_list[i].render(modelView, projection);
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

		// Only re-sort pick list when entities or priority changed
		if (_pickSortDirty || _lastSupportPriority !== _supportPriority) {
			_pickList = _list.slice();
			_pickList.sort(sortByPriority);
			_pickSortDirty = false;
			_lastSupportPriority = _supportPriority;
		}

		var x = Mouse.screen.x;
		var y = Mouse.screen.y;

		for (i = 0, count = _pickList.length; i < count; ++i) {
			entity = _pickList[i];

			// No picking on dead entites
			if (
				(entity.action !== entity.ACTION.DIE || entity.objecttype === Entity.TYPE_PC) &&
				entity.remove_tick === 0
			) {
				if (
					x > entity.boundingRect.x1 &&
					x < entity.boundingRect.x2 &&
					y > entity.boundingRect.y1 &&
					y < entity.boundingRect.y2
				) {
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
		var distance = Infinity;

		var srcX = sourceEntity.position[0];
		var srcY = sourceEntity.position[1];
		var view_range = GraphicsSettings.performanceMode ? GraphicsSettings.viewArea : 20;
		var viewRangeSq = view_range * view_range;

		_list.forEach(entity => {
			if (
				entity.GID !== sourceEntity.GID &&
				entity.objecttype === type &&
				entity.action !== entity.ACTION.DIE &&
				entity.remove_tick === 0
			) {
				var dx = entity.position[0] - srcX;
				var dy = entity.position[1] - srcY;
				var distSq = dx * dx + dy * dy;
				if (distSq > viewRangeSq) {
					return;
				}

				var dst = Infinity;
				if (closestEntity) {
					// Only pathfind if potentially closer than current best
					if (distSq < distance * distance) {
						dst = getPathDistance(sourceEntity, entity);
						if (dst && dst < distance) {
							closestEntity = entity;
							distance = dst;
						}
					}
				} else {
					dst = getPathDistance(sourceEntity, entity);
					if (dst) {
						closestEntity = entity;
						distance = dst;
					}
				}
			}
		});

		return closestEntity;
	}

	/**
	 * Returns the lowest HP entity to the source entity
	 *
	 * @param {entity} source entity
	 * @param {type} entity type to look for
	 */
	function getLowestHpEntity(sourceEntity, type) {
		var lowestHpEntity = null;
		var lowestHp = Infinity;

		var srcX = sourceEntity.position[0];
		var srcY = sourceEntity.position[1];
		var view_range = GraphicsSettings.performanceMode ? GraphicsSettings.viewArea : 20;
		var viewRangeSq = view_range * view_range;

		_list.forEach(entity => {
			if (
				entity.GID !== sourceEntity.GID &&
				entity.objecttype === type &&
				entity.life &&
				entity.life.hp > 0 &&
				entity.action !== entity.ACTION.DIE &&
				entity.remove_tick === 0
			) {
				var dx = entity.position[0] - srcX;
				var dy = entity.position[1] - srcY;
				var distSq = dx * dx + dy * dy;
				if (distSq > viewRangeSq) {
					return;
				}

				if (entity.life.hp < lowestHp) {
					lowestHp = entity.life.hp;
					lowestHpEntity = entity;
				}
			}
		});

		return lowestHpEntity;
	}

	/**
	 * Returns the distance between two entities based on direct walkpath
	 *
	 * @param {entity} from entity
	 * @param {entity} to entity
	 */
	function getPathDistance(fromEntity, toEntity) {
		var out = [];
		var count = PathFinding.search(
			fromEntity.position[0] | 0,
			fromEntity.position[1] | 0,
			toEntity.position[0] | 0,
			toEntity.position[1] | 0,
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
		getByCID: getEntityByCID,
		forEach: forEach,

		getOverEntity: getOverEntity,
		setOverEntity: setOverEntity,
		getFocusEntity: getFocusEntity,
		setFocusEntity: setFocusEntity,

		getClosestEntity: getClosestEntity,
		getLowestHpEntity: getLowestHpEntity,

		render: render,
		intersect: intersect,
		setSupportPicking: setSupportPicking,

		pendingTransformations: pendingTransformations,
		storePendingTransform: storePendingTransform
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
