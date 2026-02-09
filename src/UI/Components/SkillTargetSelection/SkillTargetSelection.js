/**
 * UI/Components/SkillTargetSelection/SkillTargetSelection.js
 *
 * Target selection screen when using skill
 *
 * This file is part of ROBrowser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require)
{
	'use strict';

	/**
	 * Dependencies
	 */
	var DB = require('DB/DBManager');
	var SkillInfo = require('DB/Skills/SkillInfo');
	var KEYS = require('Controls/KeyEventHandler');
	var Mouse = require('Controls/MouseEventHandler');
	var jQuery = require('Utils/jquery');
	var Renderer = require('Renderer/Renderer');
	var Entity = require('Renderer/Entity/Entity');
	var EntityManager = require('Renderer/EntityManager');
	var Session = require('Engine/SessionStorage');
	var Controls = require('Preferences/Controls');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var Cursor = require('UI/CursorManager');
	var getModule = require;

	/**
	 * Create Announce component
	 */
	var SkillTargetSelection = new UIComponent('SkillTargetSelection');

	/**
	 * Mouse can cross this UI
	 */
	SkillTargetSelection.mouseMode = UIComponent.MouseMode.CROSS;

	/**
	 * @var {constant}
	 */
	SkillTargetSelection.TYPE = {
		ENEMY: 1,
		PLACE: 2,
		SELF: 4,
		FRIEND: 16,
		TRAP: 32,
		TARGET: 1 | 2 | 16 | 32,
		PET: 64,
		HOMUN: 128
	};

	/**
	 * @var {number} target type (see constants)
	 */
	var _flag = 0;

	/**
	 * @var {Skill} skill structure
	 */
	var _skill;

	/**
	 * @var {CanvasElement} container for skill name
	 */
	var _skillName;

	/**
	 * @var {CanvasElement} container for desciption
	 */
	var _description;

	/**
	 * @var {CanvasElement} container for skill level
	 */
	var _skill_level;

	/**
	 * Initialize component
	 */
	SkillTargetSelection.init = function init()
	{
		_skillName = document.createElement('canvas');
		_description = document.createElement('canvas');
		_skill_level = document.createElement('canvas');

		_skillName.style.position = 'absolute';
		_skillName.style.top = '45px';
		_skillName.style.zIndex = 100;
		_skillName.style.borderRadius = '3px';
		_skillName.style.border = '1px solid #555';

		_description.style.position = 'absolute';
		_description.style.bottom = '60px';
		_description.style.zIndex = 100;
		_description.style.borderRadius = '3px';
		_description.style.border = '1px solid #555';

		_skill_level.style.position = 'absolute';
		_skill_level.style.left = 0;
		_skill_level.style.top = 0;
		_skill_level.style.zIndex = 100;

		jQuery(window).mousemove(function (event)
		{
			_skill_level.style.left = event.pageX + 20 + 'px';
			_skill_level.style.top = event.pageY - 18 + 'px';
		});

		render(DB.getMessage(234), _description);

		this.ui = jQuery('<div id ="SkillTargetSelection"/>'); // just to not break things
		this.ui.append();
	};

	/**
	 * Append to body
	 */
	SkillTargetSelection.onAppend = function onAppend()
	{
		var events;

		if (!_skillName.parentNode)
		{
			document.body.appendChild(_skillName);
		}

		if (!_description.parentNode)
		{
			document.body.appendChild(_description);
		}

		if (!_skill_level.parentNode)
		{
			document.body.appendChild(_skill_level);
		}

		// Execute onKeyDown BEFORE the one executed by Escape window
		events = jQuery._data(window, 'events').keydown;
		events.unshift(events.pop());

		// Execute before *request move* / *request attack*
		jQuery(window).one('mousedown.targetselection', intersectEntities);
		events = jQuery._data(window, 'events').mousedown;
		events.unshift(events.pop());
	};

	/**
	 * Possible to exit using ESCAPE
	 */
	SkillTargetSelection.onKeyDown = function onKeyDown(event)
	{
		if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this.ui.is(':visible'))
		{
			this.remove();
			event.stopImmediatePropagation();
			return false;
		}

		return true;
	};

	/**
	 * Remove from body
	 */
	SkillTargetSelection.onRemove = function onRemove()
	{
		jQuery(window).off('mousedown.targetselection');

		Cursor.blockMagnetism = false;
		Cursor.freeze = false;
		Cursor.setType(Cursor.ACTION.DEFAULT);

		EntityManager.setSupportPicking(false);

		if (_skillName.parentNode)
		{
			document.body.removeChild(_skillName);
		}

		if (_description.parentNode)
		{
			document.body.removeChild(_description);
		}

		if (_skill_level.parentNode)
		{
			document.body.removeChild(_skill_level);
		}

		Mouse.state = Mouse.MOUSE_STATE.NORMAL;
	};

	/**
	 * Set informations for the target
	 *
	 * @param {object} skill
	 * @param {number} skill type
	 * @param {string} description name (optional)
	 */
	SkillTargetSelection.set = function set(skill, target, description)
	{
		_flag = target;
		_skill = skill;

		if (!_flag)
		{
			return;
		}

		if (Session.TouchTargeting)
		{
			var entityFocus = EntityManager.getFocusEntity();
			if (entityFocus)
			{
				if (_flag & SkillTargetSelection.TYPE.PLACE)
				{
					SkillTargetSelection.onUseSkillToPos(
						_skill.SKID,
						_skill.useLevel ? _skill.useLevel : _skill.level,
						entityFocus.position[0],
						entityFocus.position[1]
					);
				}
				else
				{
					SkillTargetSelection.onUseSkillToId(
						_skill.SKID,
						_skill.useLevel ? _skill.useLevel : _skill.level,
						entityFocus.GID
					);
				}
				SkillTargetSelection.remove();
				return;
			}
		}

		if (_flag & SkillTargetSelection.TYPE.PLACE)
		{
			Cursor.blockMagnetism = true;
		}

		Mouse.state = Mouse.MOUSE_STATE.USESKILL;

		EntityManager.setSupportPicking((_flag & SkillTargetSelection.TYPE.FRIEND) > 0);

		// Render skillName
		var sk = SkillInfo[skill.SKID];
		render(description || sk.SkillName, _skillName);
		renderLevel(_skill.useLevel ? _skill.useLevel : _skill.level, _skill_level);

		Cursor.setType(Cursor.ACTION.TARGET);
		Cursor.freeze = true;
	};

	SkillTargetSelection.setSkillLevelDelta = function setSkillLevelDelta(delta)
	{
		var sk = SkillInfo[_skill.SKID];
		if (!sk.bSeperateLv)
		{
			return;
		}
		if (!_skill.useLevel)
		{
			_skill.useLevel = _skill.level;
		}
		_skill.useLevel += delta;
		if (_skill.useLevel < 1)
		{
			_skill.useLevel = 1;
		}
		if (_skill.useLevel > _skill.level)
		{
			_skill.useLevel = _skill.level;
		}

		renderLevel(_skill.useLevel, _skill_level);
	};

	/**
	 * Render text into the canvas
	 *
	 * @param {string} text to render
	 * @param {CanvasElement} canvas node
	 */
	function render(text, canvas)
	{
		var fontSize = 12;
		var ctx = canvas.getContext('2d');

		ctx.font = fontSize + 'px Arial';
		canvas.width = ctx.measureText(text).width + 7 * 2;
		canvas.height = 23;

		ctx.font = fontSize + 'px Arial';
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'rgba(0,0,0,0.5)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = 'black';
		ctx.fillText(text, 8, 17);

		ctx.fillStyle = '#00FF00';
		ctx.fillText(text, 7, 16);

		canvas.style.left = ((Renderer.width - canvas.width) >> 1) + 'px';
	}

	/**
	 * Render text into the canvas
	 *
	 * @param {string} text to render
	 * @param {CanvasElement} canvas node
	 */
	function renderLevel(text, canvas)
	{
		var fontSize = 24;
		var ctx = canvas.getContext('2d');

		canvas.width = 35;
		canvas.height = 35;

		ctx.font = fontSize + 'px Arial';
		ctx.strokeStyle = '#333333';
		ctx.lineWidth = 3;
		ctx.strokeText(text, 0, 30);
		ctx.fillStyle = 'white';
		ctx.fillText(text, 0, 30);
	}

	/**
	 * Intersect entity when clicking
	 */
	function intersectEntities(event)
	{
		SkillTargetSelection.remove();

		if (!Mouse.intersect)
		{
			return false;
		}

		// Only left click
		if (event.which !== 1)
		{
			return true;
		}

		event.stopImmediatePropagation();

		// Zone skill
		if (_flag & SkillTargetSelection.TYPE.PLACE)
		{
			SkillTargetSelection.onUseSkillToPos(
				_skill.SKID,
				_skill.useLevel ? _skill.useLevel : _skill.level,
				Mouse.world.x,
				Mouse.world.y
			);
			return false;
		}

		// Get entity
		var entity = EntityManager.getOverEntity();

		if (!entity)
		{
			return false;
		}

		// Trap check
		if (entity.objecttype === Entity.TYPE_TRAP && !(_flag & SkillTargetSelection.TYPE.TRAP))
		{
			return false;
		}

		intersectEntity(entity);
		return false;
	}

	/**
	 * Intersect with an entity
	 *
	 * @param {object} entity
	 */
	function intersectEntity(entity)
	{
		var target = 0;

		// Get target type
		switch (entity.objecttype)
		{
			case Entity.TYPE_MOB:
			case Entity.TYPE_UNIT:
				target = SkillTargetSelection.TYPE.ENEMY | SkillTargetSelection.TYPE.PET;
				break;

			case Entity.TYPE_TRAP:
				target = SkillTargetSelection.TYPE.TRAP;
				break;

			case Entity.TYPE_HOM:
			case Entity.TYPE_MERC:
				target = SkillTargetSelection.TYPE.HOMUN;
				break;

			case Entity.TYPE_PC:
			case Entity.TYPE_ELEM:
				target = SkillTargetSelection.TYPE.FRIEND;
				break;

			// Can't use skill on this type
			// (warp, npc, items, effects...)
			default:
				return;
		}

		// This skill can't be casted on this type
		if (!(target & _flag) && !KEYS.SHIFT && !Controls.noshift && !SkillTargetSelection.checkMapState(entity))
		{
			return;
		}

		// Pet capture
		if (_flag === SkillTargetSelection.TYPE.PET)
		{
			SkillTargetSelection.onPetSelected(entity.GID);
			return;
		}

		// Can't cast evil skill on your self
		if (_flag & SkillTargetSelection.TYPE.ENEMY && entity === Session.Entity)
		{
			return;
		}

		// Cast skill
		SkillTargetSelection.onUseSkillToId(_skill.SKID, _skill.useLevel ? _skill.useLevel : _skill.level, entity.GID);
		return;
	}

	/**
	 * Intersect with an entity ID
	 * (used in party UI)
	 */
	SkillTargetSelection.intersectEntityId = function intersectEntityId(id)
	{
		var entity = EntityManager.get(id);
		if (entity)
		{
			intersectEntity(entity);
		}
	};

	/**
	 * Check if can use Skill on target based on MapState
	 */
	SkillTargetSelection.checkMapState = function checkMapState(entity)
	{
		if (Session.mapState.isPVP)
		{
			if (
				Session.hasParty &&
				getModule('UI/Components/PartyFriends/PartyFriends').isGroupMember(entity.display.name)
			)
			{
				return false;
			}
			return true;
		}
		else if (Session.mapState.isGVG)
		{
			if (
				(Session.Entity.GUID > 0 && entity.GUID !== Session.Entity.GUID) ||
				(entity.GUID == 0 && entity !== Session.Entity)
			)
			{
				// 0 = no guild, can be attacked by anyone
				return true;
			}
		}
		return false;
	};

	/**
	 * Functions to define
	 */
	SkillTargetSelection.onUseSkillToId = function onUseSkillToId(/*id, level, GID*/) {};
	SkillTargetSelection.onUseSkillToPos = function onUseSkillToId(/*id, level, x, y*/) {};

	/**
	 * Create component and return it
	 */
	return UIManager.addComponent(SkillTargetSelection);
});
