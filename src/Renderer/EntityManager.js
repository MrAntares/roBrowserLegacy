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
	 * Find an Entity and return its index
	 *
	 * @param {number} aid
	 * @returns {number} position
	 */
	function getEntityIndexBy(getter, value) {
		if (value < 0) {
			return -1;
		}

		var i, count = _list.length;
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

		_list.sort(sort);

		// Use program
		SpriteRenderer.bind3DContext(gl, modelView, projection, fog);

		// Rendering
		for (i = 0, count = _list.length; i < count; ++i) {
			if ((_list[i].objecttype != _list[i].constructor.TYPE_EFFECT && !renderEffects) || (_list[i].objecttype == _list[i].constructor.TYPE_EFFECT && renderEffects)) {
				// Remove from list
				if (_list[i].remove_tick && _list[i].remove_tick + _list[i].remove_delay < tick) {

					// Remove focus
					var entityFocus = getFocusEntity();
					if (entityFocus && entityFocus.GID === _list[i].GID) {
						entityFocus.onFocusEnd();
						setFocusEntity(null);
					}

					_list[i].clean();
					_list.splice(i, 1);
					i--;
					count--;
					continue;
				}
				if(GraphicsSettings.culling){
					var distSq = Math.pow(_list[i].position[0] - Session.Entity.position[0], 2) + Math.pow(_list[i].position[1] - Session.Entity.position[1], 2);
					if (distSq > Math.pow(GraphicsSettings.viewArea,2)) continue; 
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
		_list.sort(sortByPriority);

		var x = Mouse.screen.x;
		var y = Mouse.screen.y;

		for (i = 0, count = _list.length; i < count; ++i) {
			entity = _list[i];

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

		_list.forEach((entity) => {
			if (entity.GID !== sourceEntity.GID && entity.objecttype === type && entity.action !== entity.ACTION.DIE && entity.remove_tick === 0) {
				
				// Quick distance check (Manhattan or Euclidean)
				var distSq = Math.pow(entity.position[0] - sourceEntity.position[0], 2) + Math.pow(entity.position[1] - sourceEntity.position[1], 2);
				let view_range = GraphicsSettings.culling ? GraphicsSettings.viewArea : 20;
				if (distSq > view_range * view_range) return;

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
	 * Returns the lowest HP entity to the source entity
	 *
	 * @param {entity} source entity
	 * @param {type} entity type to look for
	 */
	function getLowestHpEntity(sourceEntity, type) {
		var lowestHpEntity = null;
		var lowestHp = Infinity;

		_list.forEach((entity) => {
			if (entity.GID !== sourceEntity.GID && entity.objecttype === type &&
				entity.life &&
				entity.life.hp > 0 && entity.action !== entity.ACTION.DIE && entity.remove_tick === 0) {

				// Quick distance check (Manhattan or Euclidean)
				var distSq = Math.pow(entity.position[0] - sourceEntity.position[0], 2) + Math.pow(entity.position[1] - sourceEntity.position[1], 2);
				let view_range = GraphicsSettings.culling ? GraphicsSettings.viewArea : 20;
				if (distSq > view_range * view_range) return;

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
