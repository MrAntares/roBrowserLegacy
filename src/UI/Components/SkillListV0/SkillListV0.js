/**
 * UI/Components/SkillList/SkillList.js
 *
 * Chararacter Skill Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
+ */
define(function(require)
{
	'use strict';


	/**
	 * Dependencies
	 */
	var DB                   = require('DB/DBManager');
	var SkillInfo            = require('DB/Skills/SkillInfo');
	var SkillTreeView        = require('DB/Skills/SkillTreeView');
	var Session              = require('Engine/SessionStorage');
	var jQuery               = require('Utils/jquery');
	var Client               = require('Core/Client');
	var Preferences          = require('Core/Preferences');
	var Renderer             = require('Renderer/Renderer');
	var Mouse                = require('Controls/MouseEventHandler');
	var UIManager            = require('UI/UIManager');
	var UIComponent          = require('UI/UIComponent');
	var SkillTargetSelection = require('UI/Components/SkillTargetSelection/SkillTargetSelection');
	var SkillDescription     = require('UI/Components/SkillDescription/SkillDescription');
	var htmlText             = require('text!./SkillListV0.html');
	var cssText              = require('text!./SkillListV0.css');



	/**
	 * Create Component
	 */
	var SkillList = new UIComponent( 'SkillListV0', htmlText, cssText );


	/**
	 * @var {Preferences} window preferences
	 */
	var _preferences = Preferences.get('SkillList', {
		x:        100,
		y:        200,
		width:    8,
		height:   8,
		show:     false,
		mini:     true,
		skillInfo: false,
	}, 1.0);


	/**
	 * @var {Array} Skill List
	 * { SKID, type, level, spcost, attackRange, skillName, upgradable }
	 */
	var _list = [];


	/**
	 * @var {jQuery} level up button reference
	 */
	var _btnIncSkill;


	/**
	 * @var {number} skill points
	 */
	var _points = 0;

	var totalCounter = 0;

	/**
	 * @var {jQuery} button that appeared when level up
	 */
	var _btnLevelUp;

	var lArrow, rArrow;

	var skillPosition = [];

	var skillDependencyTree = [];

	var rememberChoice = [];

	var hasSkills = [];

	/**
	 * Initialize UI
	 */
	SkillList.init = function init()
	{
		this.ui.find('.titlebar .base').mousedown(stopPropagation);
		this.ui.find('.footer .extend').mousedown(onResize);
		this.ui.find('.titlebar .close').click(onClose);
		this.ui.find('.titlebar .mini').click(onMini);
		this.ui.find('.view_skill_info').change(onToggleSkillInfo);
		this.ui.find('.reset').click(onResetChoice);
		this.ui.find('.apply').click(onApplyChoice);

		// Get level up button
		_btnIncSkill = this.ui.find('.btn.levelup').detach().click(onRequestSkillUp);

		// Get button to open skill when level up
		_btnLevelUp = jQuery('#lvlup_job').detach();
		_btnLevelUp.click(function(){
			_btnLevelUp.detach();
			SkillList.ui.show();
			SkillList.ui.parent().append(SkillList.ui);
		}).mousedown(stopPropagation);

		// Bind skills
		this.ui
			.on('dblclick',    '.skill .icon, .skill .name', onRequestUseSkill)
			.on('contextmenu', '.skill .icon, .skill .name', onRequestSkillInfo)
			.on('mousedown',   '.selectable', onSkillFocus)
			.on('mouseover',   '.skillCol .skill .icon, .skill .name', onRequestSkillInfo)
			.on('mouseout',    '.skillCol .skill .icon, .skill .name', onSkillDescriptionRemove)
			.on('mouseover',   '.skillCol .skill .icon, .skill .name', onNecessarySkills)
			.on('mouseout',    '.skillCol .skill .icon, .skill .name', onNecessarySkillsRemove)
			.on('click',       '.skillCol .skill .icon, .skill .name', onRememberChoice)
			.on('dragstart',   '.skill',      onSkillDragStart)
			.on('dragend',     '.skill',      onSkillDragEnd);

		this.draggable(this.ui.find('.titlebar'));

		Client.loadFile( DB.INTERFACE_PATH + 'basic_interface/arw_right.bmp', function(data){
			rArrow = 'url('+data+')';
		});
		Client.loadFile( DB.INTERFACE_PATH + 'basic_interface/arw_left.bmp', function(data){
			lArrow = 'url('+data+')';
		});
	};


	/**
	 * Apply preferences once append to body
	 */
	SkillList.onAppend = function onAppend()
	{
		// Apply preferences
		if (!_preferences.show) {
			this.ui.hide();
		}

		resize(_preferences.width, _preferences.height);
		this.ui.css({
			top:  Math.min( Math.max( 0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min( Math.max( 0, _preferences.x), Renderer.width  - this.ui.width())
		});

		this.ui.find('.view_skill_info').attr('checked', _preferences.skillInfo);
	};


	/**
	 * Remove Skill window from DROM
	 */
	SkillList.onRemove = function onRemove()
	{
		_btnLevelUp.detach();

		// Save preferences
		_preferences.show   =  this.ui.is(':visible');
		_preferences.y      =  parseInt(this.ui.css('top'), 10);
		_preferences.x      =  parseInt(this.ui.css('left'), 10);
		_preferences.width  =  Math.floor( this.ui.find('.content').width()  / 32 );
		_preferences.height =  Math.floor( this.ui.find('.content').height() / 32 );
		_preferences.save();
	};


	/**
	 * Show/Hide UI
	 */
	SkillList.toggle = function toggle()
	{
		this.ui.toggle();

		if (this.ui.is(':visible')) {
			this.focus();
			_btnLevelUp.detach();
		}
	};


	/**
	 * Process shortcut
	 *
	 * @param {object} key
	 */
	SkillList.onShortCut = function onShortCut( key )
	{
		switch (key.cmd) {
			case 'TOGGLE':
				this.toggle();
				break;
		}
		onResetChoice();
	};


	/**
	 * Add skills to the list
	 */
	SkillList.setSkills = function setSkills( skills )
	{
		SkillList.ui.find('.upgradable').removeClass('upgradable');

		skillPosition = getSkillPosition(Session.Character.job);
		createSkillDependencyTree();

		var i, count;

		for (i = 0, count = _list.length; i < count; ++i) {
			this.onUpdateSkill( _list[i].SKID, 0);
		}

		_list.length = 0;
		this.ui.find('.content table').empty();
		this.ui.find('.skillCol').empty();

		for (i = 0, count = skills.length; i < count; ++i) {
			this.addSkill( skills[i] );
			hasSkills[skills[i].SKID] = skills[i];
		}

		skillPosition.forEach(function (items, list) {
			SkillList.prepareSkillTree(items, list)
		});

		onResetChoice();
	};


	function createSkillDependencyTree() {
		skillPosition.forEach(function (items, list) {
			// listItems array
			Object.entries(items).forEach(entry => {
				const [skid, pos] = entry;

				// skip list and beforeJob
				if (!jQuery.isNumeric(skid)) {
					return;
				}

				var sk = SkillInfo[skid];

				skillDependencyTree[skid] = {
					'dependency': [],
					'position': pos,
					'list': list,
					'MaxLv': sk.MaxLv
				};

				if (sk?.['_NeedSkillList'] !== undefined) {
					sk['_NeedSkillList'].forEach(function (item) {
						skillDependencyTree[skid]['dependency'][item[0]] = item[1];
					})
				}
			});
		});
	}


	function specifyRequirements(skillId, count = null)
	{
		var showAll = true; // todo debug show all dependency

		var skdt = skillDependencyTree[skillId];

		if (skdt?.dependency || count != null) {
			var element = '<div class="counterSkill">' + count + '</div>';
			skillPosition.forEach(function (items, list) {
				if (items[skillId] !== undefined) {
					var skillbox = SkillList.ui.find('#positionSkills' + list + ' .s' + items[skillId]);
					if (skillbox.children().hasClass('disabled') || showAll) {
						skillbox.addClass('needleSkill');
						if (count !== null) skillbox.append(element);
					}
				}
			});
		}

		if (skdt?.dependency) {
			skdt.dependency.forEach(function (item, key) {
				specifyRequirements(key, item);
			});
		}
	}


	/**
	 * get and show remember choice skills
	 */
	function onRememberChoice()
	{
		var main = jQuery(this).parent();

		if (!main.hasClass('skill')) {
			main = main.parent();
		}
		var skillId = parseInt(main.data('index'), 10);

		rememberChoice = setRememberChoice(skillId);

		// show choice
		rememberChoice.forEach(function (item, skId) {
			if (!rememberChoice[skId]['isQuest'] && totalCounter < _points) {
				var sk = skillDependencyTree[skId];
				var skillbox = SkillList.ui.find('#positionSkills' + sk.list + ' .s' + sk.position);
				if (skillbox.find('.current').text() != sk.MaxLv ) {
					totalCounter += rememberChoice[skId]['count'];
					skillbox.children().removeClass('disabled');
					skillbox.find('.level').show();
					skillbox.find('.current').empty().append(rememberChoice[skId]['count'])
					skillbox.find('.max').empty().append(rememberChoice[skId]['count'])
				}
			}
		});

		SkillList.ui.find('.skpoints_count').text(_points - totalCounter +'/'+_points);
	}


	/**
	 * Remember Choice skills
	 * @param skillId
	 * @param count
	 * @param isQuest
	 * @returns {*[]}
	 */
	function setRememberChoice(skillId, count = null, isQuest = false)
	{
		var sk = SkillInfo[skillId];

		if (!isQuest && sk['Type'] === 'Quest') {
			var skill = getSkillById(skillId);
			isQuest = (!skill?.level || skill?.level <= 0);
		}

		rememberChoice[skillId] = rememberChoice[skillId] ?? {
			'count': hasSkills?.[skillId]?.level ?? 0,
			'list': null,
			'isQuest': isQuest,
		}

		if (!isQuest) {
			if (count) {
				if (count > rememberChoice[skillId]['count']) {
					rememberChoice[skillId]['count'] = count;
				}
			} else {
				if (sk['MaxLv'] > rememberChoice[skillId]['count']) {
					rememberChoice[skillId]['count']++;
				}
			}
		}

		if (sk['_NeedSkillList'] !== undefined) {
			sk['_NeedSkillList'].forEach(function (item) {
				rememberChoice[skillId][item[0]] = setRememberChoice(item[0], item[1], isQuest)[item[0]]
			});

			Object.entries(rememberChoice[skillId]).forEach(entry => {
				const [key, value] = entry;
				if (jQuery.isNumeric(key) && value.isQuest) {
					rememberChoice[skillId]['isQuest'] = value.isQuest;
				}
			});
		}

		return rememberChoice;
	}


	/**
	 * @param JobId
	 * @returns {*[]}
	 */
	function getSkillPosition(JobId) {
		var positions = [];
		positions[SkillTreeView[JobId]['list']] = SkillTreeView[JobId];

		if (SkillTreeView[JobId]['beforeJob'] !== null) {
			var beforeJob = SkillTreeView[JobId]['beforeJob'];
			getSkillPosition(beforeJob).forEach(function (items, list) {
				positions[list] = positions[list] ? Object.assign(positions[list], items) : items;
			})
		}

		return positions;
	}

	/**
	 * Insert skill to list
	 *
	 * @param {object} skill
	 */
	SkillList.addSkill = function addSkill( skill )
	{
		// Custom skill ?
		if (!(skill.SKID in SkillInfo)) {
			return;
		}

		// Already in list, update it instead of duplicating it
		if (this.ui.find('.skill.id' + skill.SKID).length) {
			this.updateSkill( skill );
			return;
		}

		this.addSkillBig(skill);
		this.addSkillMini(skill);
	}


	/**
	 * Create disabled skills preview
	 * @param items
	 * @param list
	 */
	SkillList.prepareSkillTree = function prepareSkillTree(items, list)
	{
		Object.entries(items).forEach(entry => {
			const [key, value] = entry;
			var sk        = SkillInfo[ key ];
			var className = 'disabled';
			if (sk !== undefined) {
				var element   = jQuery(
					'<div class="skill id' + key + ' ' + className + '" data-index="'+ key +'" draggable="true">' +
					'<div class="name">' +
					jQuery.escape(sk.SkillName).substr(0, 7)  +'...<br/>' +
					'</div>' +
					'<div class="icon"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" width="24" height="24" /></div>' +
					'<div class=selectable>' +
					'<span class="level" style="display: none">' +
					(
						sk.bSeperateLv ? '<button class="currentDown"></button><span class="current">'+ 0 + '</span> / <span class="max">' + 0 + '</span><button class="currentUp"></button>'
							: '<span class="current">'+ 0 +'</span>'
					) +
					'</span>' +
					'</div>' +
					'</div>'
				);

				if (rArrow) element.find('.level .currentUp').css('background-image', rArrow);
				if (lArrow) element.find('.level .currentDown').css('background-image', lArrow);

				element.find('.level .currentUp').click( function(){ skillLevelSelectUp(0); } );
				element.find('.level .currentDown').click( function(){ skillLevelSelectDown(0); } );

				if (value !== undefined) {
					var box = SkillList.ui.find('#positionSkills' + list + ' .s'+value);
					// show added cells
					if (key < 41) box.parent().show();
					// show preview skill
					if (box.is(':empty')) {
						box.append(element);
					}
				}

				Client.loadFile( DB.INTERFACE_PATH + 'item/' + sk.Name + '.bmp', function(data){
					element.find('.icon img').attr('src', data);
				});
			}
		});
	}


	SkillList.addSkillBig = function addSkillBig( skill )
	{
		var sk        = SkillInfo[ skill.SKID ];
		var levelup   = _btnIncSkill.clone(true);
		var className = !skill.level ? 'disabled' : skill.type ? 'active' : 'passive';
		var element   = jQuery(
			'<div class="skill id' + skill.SKID + ' ' + className + '" data-index="'+ skill.SKID +'" draggable="true">' +
			'<div class="name">' +
			jQuery.escape(sk.SkillName).substr(0, 7)  +'...<br/>' +
			'</div>' +
			'<div class="icon"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" width="24" height="24" /></div>' +
			'<div class="levelupcontainer"></div>' +
			'<div class=selectable>' +
			'<span class="level">' +
			(
				sk.bSeperateLv ? '<button class="currentDown"></button><span class="current">'+ skill.level + '</span> / <span class="max">' + skill.level + '</span><button class="currentUp"></button>'
					: '<span class="current">'+ skill.level +'</span>'
			) +
			'</span>' +
			'</div>' +
			'</div>'
		);

		if (rArrow) element.find('.level .currentUp').css('background-image', rArrow);
		if (lArrow) element.find('.level .currentDown').css('background-image', lArrow);

		element.find('.level .currentUp').click( function(){ skillLevelSelectUp(skill); } );
		element.find('.level .currentDown').click( function(){ skillLevelSelectDown(skill); } );

		skillPosition.forEach(function (items, list) {
			if (items[skill.SKID] !== undefined) {
				var box = SkillList.ui.find('#positionSkills' + list + ' .s'+items[skill.SKID]);
				if (!box.is(':empty')) {
					box.empty();
				}
				box.append(element);

				if (skill.upgradable) {
					box.addClass('upgradable')
				}
			}
		});

		Client.loadFile( DB.INTERFACE_PATH + 'item/' + sk.Name + '.bmp', function(data){
			element.find('.icon img').attr('src', data);
		});
	}


	SkillList.addSkillMini = function addSkillMini( skill )
	{
		var sk        = SkillInfo[ skill.SKID ];
		var levelup   = _btnIncSkill.clone(true);
		var className = !skill.level ? 'disabled' : skill.type ? 'active' : 'passive';
		var element   = jQuery(
			'<tr class="skill id' + skill.SKID + ' ' + className + '" data-index="'+ skill.SKID +'" draggable="true">' +
			'<td class="icon"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" width="24" height="24" /></td>' +
			'<td class="levelupcontainer"></td>' +
			'<td class=selectable>' +
			'<div class="name">' +
			jQuery.escape(sk.SkillName)  +'<br/>' +
			'<span class="level">' +
			(
				sk.bSeperateLv ? '<button class="currentDown"></button>Lv : <span class="current">'+ skill.level + '</span> / <span class="max">' + skill.level + '</span><button class="currentUp"></button>'
					: 'Lv : <span class="current">'+ skill.level +'</span>'
			) +
			'</span>' +
			'</div>' +
			'</td>' +
			'<td class="selectable type">' +
			'<div class="consume">' +
			(
				skill.type ? 'Sp : <span class="spcost">' + skill.spcost + '</span>' : 'Passive'
			) +
			'</div>' +
			'</td>' +
			'</tr>'
		);

		if (!skill.upgradable || !_points) {
			levelup.hide();
		}

		element.find('.levelupcontainer').append( levelup );

		if (rArrow) element.find('.level .currentUp').css('background-image', rArrow);
		if (lArrow) element.find('.level .currentDown').css('background-image', lArrow);

		element.find('.level .currentUp').click( function(){ skillLevelSelectUp(skill);  } );
		element.find('.level .currentDown').click( function(){ skillLevelSelectDown(skill); } );
		SkillList.ui.find('.content table').append(element);
		this.parseHTML.call(levelup);

		Client.loadFile( DB.INTERFACE_PATH + 'item/' + sk.Name + '.bmp', function(data){
			element.find('.icon img').attr('src', data);
		});

		_list.push(skill);
		this.onUpdateSkill( skill.SKID, skill.level);
	};


	/**
	 * Remove skill from list
	 */
	SkillList.removeSkill = function removeSkill()
	{
		// Not implemented by gravity ? server have to send the whole list again ?
	};


	/**
	 * Update skill
	 *
	 * @param {object} skill : { SKID, level, spcost, attackRange, upgradable }
	 */
	SkillList.updateSkill = function updateSkill( skill )
	{
		var target = getSkillById(skill.SKID);
		var element;

		if (!target) {
			return;
		}

		// Update Memory
		target.level       = skill.level;
		target.spcost      = skill.spcost;
		target.attackRange = skill.attackRange;
		target.upgradable  = skill.upgradable;
		if (Number.isInteger(skill.type)) {
			target.type    = skill.type;
		}

		// Update UI
		element = this.ui.find('.skill.id' + skill.SKID);
		element.find('.level .current, .level .max').text(skill.level);
		if(skill.selectedLevel){
			element.find('.level .current').text(skill.selectedLevel);
		}
		element.find('.spcost').text(skill.spcost);

		element.removeClass('active passive disabled');
		element.addClass(!skill.level ? 'disabled' : skill.type ? 'active' : 'passive');

		if (skill.upgradable && _points) {
			element.find('.levelup').show();
		}
		else {
			element.find('.levelup').hide();
		}

		this.onUpdateSkill( skill.SKID, skill.level);
	};


	/**
	 * Use a skill index
	 *
	 * @param {number} skill id
	 */
	SkillList.useSkillID = function useSkillID( id, level )
	{
		var skill = getSkillById(id);

		if (!skill || !skill.level || !skill.type) {
			return;
		}

		SkillList.useSkill( skill, level ? level : skill.selectedLevel );
	};


	/**
	 * Use a skill
	 *
	 * @param {object} skill
	 */
	SkillList.useSkill = function useSkill( skill, level )
	{
		// Self
		if (skill.type & SkillTargetSelection.TYPE.SELF) {
			this.onUseSkill( skill.SKID, level ? level : skill.level);
		}

		skill.useLevel = level;

		// no elseif intended (see flying kick).
		if (skill.type & SkillTargetSelection.TYPE.TARGET) {
			SkillTargetSelection.append();
			SkillTargetSelection.set(skill, skill.type);
		}
	};


	/**
	 * Set skill points amount
	 *
	 * @param {number} skill points count
	 */
	SkillList.setPoints = function SetPoints( amount )
	{
		var i, count;
		this.ui.find('.skpoints_count').text(amount);

		// Do not need to update the UI
		if ((!_points) === (!amount)) {
			_points = amount;
			return;
		}

		_points = amount;
		count   = _list.length;

		for (i = 0; i < count; ++i) {
			if (_list[i].upgradable && amount) {
				this.ui.find('.skill.id' + _list[i].SKID + ' .levelup').show();
			}
			else {
				this.ui.find('.skill.id' + _list[i].SKID + ' .levelup').hide();
			}
		}
	};


	/**
	 * Add the button when leveling up
	 */
	SkillList.onLevelUp = function onLevelUp()
	{
		_btnLevelUp.appendTo('body');
	};


	/**
	 * Stop event propagation
	 */
	function stopPropagation( event )
	{
		event.stopImmediatePropagation();
		return false;
	}


	/**
	 * Find a skill by it's id
	 *
	 * @param {number} skill id
	 * @returns {Skill}
	 */
	function getSkillById( id )
	{
		var i, count = _list.length;

		for (i = 0; i < count; ++i) {
			if (_list[i].SKID === id) {
				return _list[i];
			}
		}

		return null;
	}


	/**
	 * Extend SkillList window size
	 */
	function onResize()
	{
		var ui      = SkillList.ui;
		var top     = ui.position().top;
		var left    = ui.position().left;
		var lastWidth  = 0;
		var lastHeight = 0;
		var _Interval;

		function resizing()
		{
			var extraX = -6;
			var extraY = 32;

			var w = Math.floor( (Mouse.screen.x - left - extraX) / 32 );
			var h = Math.floor( (Mouse.screen.y - top  - extraY) / 32 );

			// Maximum and minimum window size
			w = Math.min( Math.max(w, 8), 8);
			h = Math.min( Math.max(h, 4), 10);

			if (w === lastWidth && h === lastHeight) {
				return;
			}

			resize( w, h );
			lastWidth  = w;
			lastHeight = h;
		}

		// Start resizing
		_Interval = setInterval(resizing, 30);

		// Stop resizing on left click
		jQuery(window).on('mouseup.resize', function(event){
			if (event.which === 1) {
				clearInterval(_Interval);
				jQuery(window).off('mouseup.resize');
			}
		});
	}


	/**
	 * Extend SkillList window size
	 *
	 * @param {number} width
	 * @param {number} height
	 */
	function resize( width, height )
	{
		if (_preferences.mini) {
			width  = Math.min( Math.max(width,  8), 8);
			height = Math.min( Math.max(height, 4), 10);
			SkillList.ui.find('.extend').show();
			SkillList.ui.find('.content').show();
			SkillList.ui.find('.contentbig').hide();
			SkillList.ui.find('.footer .btn').hide();
			SkillList.ui.find('.content').css({
				width:  width  * 32,
				height: height * 32
			});
		} else {
			width  = 17;
			height = 12;
			SkillList.ui.find('.extend').hide();
			SkillList.ui.find('.content').hide();
			SkillList.ui.find('.contentbig').show();
			SkillList.ui.find('.footer .btn').show();
			SkillList.ui.find('.contentbig').css({
				width:  width  * 32,
				height: height * 32
			});
		}
	}


	/**
	 * Closing window
	 */
	function onClose()
	{
		SkillList.ui.hide();
	}


	/**
	 * Resize and save
	 */
	function onMini()
	{
		_preferences.mini = !_preferences.mini;
		_preferences.save();
		resize(_preferences.width, _preferences.height);
	}


	/**
	 * Request to upgrade a skill
	 */
	function onRequestSkillUp()
	{
		var index = this.parentNode.parentNode.getAttribute('data-index');
		SkillList.onIncreaseSkill(
			parseInt(index, 10)
		);
	}


	/**
	 * Request to use a skill
	 */
	function onRequestUseSkill()
	{
		var main  = jQuery(this).parent();

		if (!main.hasClass('skill')) {
			main = main.parent();
		}

		SkillList.useSkillID(parseInt(main.data('index'), 10));
	}


	function onApplyChoice()
	{
		var applyArr = [];
		rememberChoice.forEach(function (item, skillId) {
			applyArr[skillId] = 0;
			var level = hasSkills?.[skillId]?.level ?? 0;

			if(item.count > level) {
				applyArr[skillId] = item.count - level
			}
		});

		applyArr.forEach(function (c, k) {
			for (var i = 0; i < c; i++) {
				SkillList.onIncreaseSkill(
					parseInt(k, 10)
				);
			}
		})

		totalCounter = 0;
		SkillList.ui.find('.skpoints_count').text(_points - totalCounter);
		rememberChoice = [];
	}


	/**
	 * Reset choice
	 */
	function onResetChoice()
	{
		rememberChoice.forEach(function (count, skillId) {
			var skillbox = SkillList.ui.find('.skillCol.s' + skillDependencyTree[skillId].position);
			if (!hasSkills?.[skillId]?.level) {
				skillbox.children().addClass('disabled');
			}
			skillbox.find('.selectable').show();
			skillbox.find('.current').empty().append(hasSkills?.[skillId]?.level ?? 0)
			skillbox.find('.max').empty().append(hasSkills?.[skillId]?.level ?? 0)

		});
		totalCounter = 0;
		SkillList.ui.find('.skpoints_count').text(_points);
		rememberChoice = [];
	}


	/**
	 * Show backlight
	 */
	function onNecessarySkills()
	{
		var main = jQuery(this).parent();

		if (!main.hasClass('skill')) {
			main = main.parent();
		}
		var skillId = parseInt(main.data('index'), 10);
		specifyRequirements(skillId);
	}


	/**
	 * Hide backlight
	 */
	function onNecessarySkillsRemove()
	{
		SkillList.ui.find('.needleSkill').removeClass('needleSkill');
		SkillList.ui.find('.counterSkill').remove();
	}


	/**
	 * Request to get skill info (right click on a skill)
	 */
	function onRequestSkillInfo()
	{
		var main = jQuery(this).parent();

		if (!main.hasClass('skill')) {
			main = main.parent();
		}

		var id = parseInt(main.data('index'), 10);
		var skill = getSkillById(id);

		var skillID = skill?.SKID ?? id;

		// Don't add the same UI twice, remove it
		if (SkillDescription.uid === skillID) {
			SkillDescription.remove();
			return;
		}

		// Add ui to window
		if (_preferences.mini || _preferences.skillInfo) {
			SkillDescription.append();
			SkillDescription.setSkill(skillID);
		}
	}


	/**
	 * Hide description
	 */
	function onSkillDescriptionRemove()
	{
		SkillDescription.remove();
	}


	/**
	 * Checkbox show/hide description
	 */
	function onToggleSkillInfo()
	{
		_preferences.skillInfo = !!this.checked;
		_preferences.save();
	}


	/**
	 * Focus a skill in the list (background color changed)
	 */
	function onSkillFocus()
	{
		var main = jQuery(this).parent();

		if (!main.hasClass('skill')) {
			main = main.parent();
		}

		SkillList.ui.find('.skill').removeClass('selected');
		main.addClass('selected');
	}


	/**
	 * Start to drag a skill (to put it on the hotkey UI ?)
	 */
	function onSkillDragStart( event )
	{
		var index = parseInt(this.getAttribute('data-index'), 10);
		var skill = getSkillById(index);

		// Can't drag a passive skill (or disabled)
		if (!skill || !skill.level || !skill.type) {
			return stopPropagation(event);
		}

		var img   = new Image();
		img.src   = jQuery(this).find('.icon img').attr('src');
		event.originalEvent.dataTransfer.setDragImage( img, 12, 12 );
		event.originalEvent.dataTransfer.setData('Text',
			JSON.stringify( window._OBJ_DRAG_ = {
				type: 'skill',
				from: 'SkillList',
				data:  skill
			})
		);
	}


	/**
	 * Stop the drag drop action, clean up
	 */
	function onSkillDragEnd()
	{
		delete window._OBJ_DRAG_;
	}


	function skillLevelSelectUp( skill )
	{
		var level = skill.selectedLevel ? skill.selectedLevel : skill.level;
		if (level < skill.level){
			skill.selectedLevel = level + 1;
			var element = SkillList.ui.find('.skill.id' + skill.SKID);
			element.find('.level .current').text(skill.selectedLevel);
		}
	}


	function skillLevelSelectDown( skill )
	{
		var level = skill.selectedLevel ? skill.selectedLevel : skill.level;
		if (level > 1){
			skill.selectedLevel = level - 1;
			var element = SkillList.ui.find('.skill.id' + skill.SKID);
			element.find('.level .current').text(skill.selectedLevel);
		}
	}


	/**
	 * Abstract function to define
	 */
	SkillList.onUseSkill      = function onUseItem(){};
	SkillList.onIncreaseSkill = function onIncreaseSkill() {};
	SkillList.onUpdateSkill   = function onUpdateSkill(){};
	SkillList.getSkillById    = getSkillById;


	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(SkillList);
});
