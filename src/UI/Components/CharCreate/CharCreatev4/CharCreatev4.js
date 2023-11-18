/**
 * UI/Components/CharCreatev4/CharCreatev4.js
 *
 * Chararacter Creation windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function(require)
{
	'use strict';


	/**
	 * Dependencies
	 */
	var DB           	   = require('DB/DBManager');
	var Renderer           = require('Renderer/Renderer');
	var KEYS               = require('Controls/KeyEventHandler');
	var Entity             = require('Renderer/Entity/Entity');
	var SpriteRenderer     = require('Renderer/SpriteRenderer');
	var UIManager          = require('UI/UIManager');
	var UIComponent        = require('UI/UIComponent');
	var htmlText           = require('text!./CharCreatev4.html');
	var cssText            = require('text!./CharCreatev4.css');
	var Client             = require('Core/Client');


	/**
	 * Create Chararacter Selection namespace
	 */
	var CharCreatev4 = new UIComponent( 'CharCreatev4', htmlText, cssText );


	/**
	 * @var {boolean} account sex
	 */
	var _accountSex = 0;


	/**
	 * @var for hairstylelist
	 */
	var _race = 'human';
	var _gender = 'male';
	var _prevhead = 1;
	var _curhead = 1;
	var _prevcolor = 0;
	var _curcolor = 0;


	/**
	 * @var {object} chargen info
	 */
	var _chargen = {
		entity: new Entity(),
		ctx:    null,
		render: false,
		tick:   0
	};

	/**
	 * @var {object} doram info
	 */
	var _doram = {
		entity: new Entity(),
		ctx:    null,
		render: false,
		tick:   0
	};

	/**
	 * @var {object} model info
	 */
	var _model = {
		entity: new Entity(),
		ctx:    null,
		render: false,
		tick:   0
	};

	/**
	 * Initialize UI
	 */
	CharCreatev4.init = function init()
	{

		_chargen.ctx = this.ui.find('#human')[0].getContext('2d');
		_doram.ctx = this.ui.find('#doram')[0].getContext('2d');
		_model.ctx = this.ui.find('#style_model')[0].getContext('2d');

		// Setup GUI
		this.ui.css({
			top: (Renderer.height-342)/2,
			left: (Renderer.width-576)/2
		});

		this.draggable();

		// Default stylist
		_race = 'human';
		_gender = 'male';
		_prevhead = 1;
		_curhead = 1;
		_prevcolor = 0;
		_curcolor = 0;

		// Update cursor
		const radioInputs = document.querySelectorAll('input[type="radio"]');
		const labels = document.querySelectorAll('label');

		radioInputs.forEach(input => {
		    input.classList.add('event_add_cursor');
		});

		labels.forEach(label => {
		    label.classList.add('event_add_cursor');
		});

		// Bind Events
		this.ui.find('.gender .male_button').mousedown(updateCharacterGeneric('gender', 1));
		this.ui.find('.gender .female_button').mousedown(updateCharacterGeneric('gender', 0));
		this.ui.find('#style .rot_left').mousedown(updateCharacterGeneric('direction', 0));
		this.ui.find('#style .rot_right').mousedown(updateCharacterGeneric('direction', 1));
		this.ui.find('.race').click(updateRace);
		this.ui.on('click', '.hstyle_button', updateHStyle);
		this.ui.on('click', '.hcolor_button', updateHColor);

		this.ui.find('#char_name').mousedown(function(event){
			this.focus();
			event.stopImmediatePropagation();
		});

		this.ui.find('.cancel').click(cancel);
		this.ui.find('.return').click(cancel);
		this.ui.find('.make').click(create);

		/* Msgstring Texts */
		var title = this.ui.find('.title');
		title.text( DB.getMessage( 3356 - 1) );

		var human_title = this.ui.find('.human_title');
		human_title.text( DB.getMessage( 3017 - 1) );

		var human_desc = this.ui.find('.human_desc');
		human_desc.text( DB.getMessage( 3021 - 1) );

		var doram_title = this.ui.find('.doram_title');
		doram_title.text( DB.getMessage( 3019 - 1) );

		var doram_desc = this.ui.find('.doram_desc');
		doram_desc.text( DB.getMessage( 3022 - 1) );

		var hair_style = this.ui.find('.hair_style_title');
		hair_style.text( DB.getMessage( 3347 - 1) );

		var hair_color = this.ui.find('.hair_color_title');
		hair_color.text( DB.getMessage( 3348 - 1) );

		var return_msg = this.ui.find('.return');
		return_msg.text( DB.getMessage( 3352 - 1) );

		var create_msg = this.ui.find('.make');
		create_msg.text( DB.getMessage( 3346 - 1) );
	};

	/**
	 * Setter for AccountSex
	 *
	 * @param {number} sex
	 */
	CharCreatev4.setAccountSex = function setAccountSex( sex )
	{
		_accountSex = sex;
	};

	/**
	 * Once add to HTML, start rendering
	 */
	CharCreatev4.onAppend = function onAppend()
	{
		_chargen.render = true;
		_chargen.entity.set({
			sex:_accountSex,
			job:    0,
			head:   1,
			action: 0,
			direction: 5
		});

		_doram.render = true;
		_doram.entity.set({
			sex:_accountSex,
			job:	4218,
			head:	1,
			action:	0,
			direction: 5
		});

		_model.render = true;
		_model.entity.set({
			sex:	1,
			job:    0,
			head:   1,
			headpalette: 0,
			action: 0,
			direction: 4
		});

		this.ui.find('#char_name').val('').focus();

		// Set default race and gender
		_race = 'human';
		_gender = 'male';
		updateRace();
		cleanup();
		Renderer.render(render);
		
	};

	/**
	 * Remove component from HTML
	 * Stop rendering
	 */
	CharCreatev4.onRemove = function onRemove()
	{
		Renderer.stop(render);
	};

	/**
	 * Key Handler
	 *
	 * @param {object} event
	 * @return {boolean}
	 */
	CharCreatev4.onKeyDown = function onKeyDown( event )
	{
		if (event.which === KEYS.ESCAPE) {
			event.stopImmediatePropagation();
			cancel();
			return false;
		}

		return true;
	};

	/**
	 * Update model hairstyle
	 */
	function updateHStyle (event) {
		var type = 'head';
		var value = parseInt(CharCreatev4.ui.find(event.currentTarget).attr('for'));

		_prevhead = _model.entity.head;
		Client.loadFile( DB.INTERFACE_PATH + "make_character_ver2/bt_hairstyle_normal.bmp", function(dataURI) {
			CharCreatev4.ui.find('.style'+_prevhead).css('backgroundImage', 'url(' + dataURI + ')');
		});
		
		_curhead = value;

		updateCharacter( type, value );
	}

	/**
	 * Update model haircolor
	 */
	function updateHColor (event) {
		var type = 'headpalette';
		var value = parseInt(CharCreatev4.ui.find(event.currentTarget).attr('for'));

		_prevcolor = _model.entity.headpalette;

		Client.loadFile( DB.INTERFACE_PATH + "make_character_ver2/color0"+(parseInt(_prevcolor) + 1)+"_off.bmp", function(dataURI) {
			CharCreatev4.ui.find('.cstyle0'+_prevcolor).css('backgroundImage', 'url(' + dataURI + ')');
		});
		
		_curcolor = value;

		updateCharacter( type, value );
	}

	/**
	 * Update model race
	 */
	function updateRace (){
		var select = CharCreatev4.ui.find('.race').filter(':checked');
		var type = 'race';
		var value = 0;

		if (select[0].id === "human_race") {
			Client.loadFile( DB.INTERFACE_PATH + "make_character_ver2/img_human_on.bmp", function(dataURI) {
                CharCreatev4.ui.find('.human_label').css('backgroundImage', 'url(' + dataURI + ')');
            });
			Client.loadFile( DB.INTERFACE_PATH + "make_character_ver2/img_doram_off.bmp", function(dataURI) {
                CharCreatev4.ui.find('.doram_label').css('backgroundImage', 'url(' + dataURI + ')');
            });
			value = 0;
		}
		
		if (select[0].id === "doram_race") {
			Client.loadFile( DB.INTERFACE_PATH + "make_character_ver2/img_human_off.bmp", function(dataURI) {
                CharCreatev4.ui.find('.human_label').css('backgroundImage', 'url(' + dataURI + ')');
            });
			Client.loadFile( DB.INTERFACE_PATH + "make_character_ver2/img_doram_on.bmp", function(dataURI) {
                CharCreatev4.ui.find('.doram_label').css('backgroundImage', 'url(' + dataURI + ')');
            });
			value = 4218;
		}

		// In between changes of race, it needs to clear everything
		for (var i = 1; i <= 24; i++) {
			Client.loadFile( DB.INTERFACE_PATH + "make_character_ver2/bt_hairstyle_normal.bmp", function(dataURI) {
				CharCreatev4.ui.find('.style'+i).css('backgroundImage', 'url(' + dataURI + ')');
			});
		}

		// Reset Head
		_prevhead = 1;
		_curhead = 1;

		updateHstyleList( type, value);
		updateCharacter( type, value );
	};

	/**
	 * Generic function to get a direct proxy to updateCharacter
	 *
	 * @param {string} type
	 * @param {number} value
	 */
	function updateCharacterGeneric( type, value )
	{
	
		return function( event) {
			if (type === 'gender') {
				updateHstyleList(type, value);
			}
			updateCharacter( type, value );
			//event.stopImmediatePropagation();
			//return false;
		};
	}

	function updateHstyleList (type, value)
	{
		switch (type) {
			case 'gender':
				if (value === 1) {
					_gender = 'male';
				}
				else {
					_gender = 'female';
				}
				break;
			case 'race':
				if (value === 0) {
					_race = 'human';
				} else {
					_race = 'doram';
				}
				break;
		}

		Client.loadFile( DB.INTERFACE_PATH + "make_character_ver2/bt_male_off.bmp", function(dataURI) {
	    	CharCreatev4.ui.find('#male_container').css('backgroundImage', 'url(' + dataURI + ')');
		});
		Client.loadFile( DB.INTERFACE_PATH + "make_character_ver2/bt_female_off.bmp", function(dataURI) {
	    	CharCreatev4.ui.find('#female_container').css('backgroundImage', 'url(' + dataURI + ')');
		});

		Client.loadFile( DB.INTERFACE_PATH + "make_character_ver2/bt_"+_gender+"_on.bmp", function(dataURI) {
	    	CharCreatev4.ui.find('#'+_gender+'_container').css('backgroundImage', 'url(' + dataURI + ')');
		});

		// Hide everything first still
		CharCreatev4.ui.find('.hair-style').css('display', "none");

		// Show the correct one
		CharCreatev4.ui.find('#'+_race+'_'+_gender+'').css('display', "block");
		
	};

	/**
	 * Send back informations to send the packet
	 */
	function create()
	{
		var ui = CharCreatev4.ui;

		CharCreatev4.onCharCreationRequest(
			ui.find('#char_name').val(),
			1,
			1,
			1,
			1,
			1,
			1,
			_model.entity.head,
			_model.entity.headpalette,
			_model.entity.job,
			_model.entity.sex
		);
	}

	function cleanup()
	{
		// Reset Default
		_race = 'human';
		_gender = 'male';
		_prevhead = 1;
		_curhead = 1;
		_prevcolor = 0;
		_curcolor = 0;
		CharCreatev4.ui.find('#human_race').prop('checked', true);
		CharCreatev4.ui.find('#male').prop('checked', true);
		CharCreatev4.ui.find('.hstyle').prop('checked', false);
		CharCreatev4.ui.find('#1_human_male').prop('checked', true);
		CharCreatev4.ui.find('#0_color').prop('checked', true);

		for (var i = 0; i <= 8; i++) {
			Client.loadFile( DB.INTERFACE_PATH + "make_character_ver2/color0"+ (i+1) +"_off.bmp", function(dataURI) {
				CharCreatev4.ui.find('.cstyle0'+i).css('backgroundImage', 'url(' + dataURI + ')');
			});
		}
		
		updateCharacter('default',0);
	}

	/**
	 * Exit the window
	 */
	function cancel()
	{
		cleanup();
		CharCreatev4.onExitRequest();
	}


	/**
	 * Update character hairstyle and haircolor
	 *
	 * @param {string} type (head or headpalette)
	 * @param {number} increment (-1 or +1)
	 */
	function updateCharacter( type, increment )
	{
		switch (type) {
			case 'gender':
				_model.entity.sex = increment;
				break;

			case 'race':
				_model.entity.job = increment;
				_model.entity.head = 1;	// Need to reset head as well
				break;

			case 'direction':
				if (increment === 0) {
					var dir = _model.entity.direction + 1;
					_model.entity.direction = dir;
				} else {
					var dir = _model.entity.direction - 1;
					_model.entity.direction = dir;
				}
				break;

			case 'head':
				_prevhead = _model.entity.head;
				_model.entity.head = increment;
				break;

			case 'headpalette':
				_model.entity.headpalette = increment;
				break;

			case 'default':
				_model.entity.sex =	1;
				_model.entity.job = 0;
				_model.entity.head = 1;
				_model.entity.headpalette = 0;
				break;

		}
	}

	/**
	 * Rendering the Character
	 */
	function render( tick )
	{

		if (_race === 'human') {
			if (_chargen.tick + 500 < tick) {
				_chargen.entity.set({
					action: 1,
					direction: 5
				});
				_chargen.tick = tick;
			}
		}

		// Rendering
		SpriteRenderer.bind2DContext(_chargen.ctx, 32, 115);
		_chargen.ctx.clearRect(0, 0, _chargen.ctx.canvas.width, _chargen.ctx.canvas.height );
		_chargen.entity.renderEntity();

		if (_race === 'doram') {
			if (_doram.tick + 500 < tick) {
				_doram.entity.set({
					action: 1,
					direction: 5
				});
				_doram.tick = tick;
			}
		}

		// Rendering
		SpriteRenderer.bind2DContext(_doram.ctx, 32, 115);
		_doram.ctx.clearRect(0, 0, _doram.ctx.canvas.width, _doram.ctx.canvas.height );
		_doram.entity.renderEntity();

		// Render the model
		SpriteRenderer.bind2DContext(_model.ctx, 32, 115);
		_model.ctx.clearRect(0, 0, _model.ctx.canvas.width, _model.ctx.canvas.height );
		_model.entity.renderEntity();
	
		// Need this to persist, rendering resets them?

		CharCreatev4.ui.find('#char_name').focus();

		Client.loadFile( DB.INTERFACE_PATH + "make_character_ver2/img_"+_race+"_on.bmp", function(dataURI) {
			CharCreatev4.ui.find('.'+_race+'_label').css('backgroundImage', 'url(' + dataURI + ')');
		});

		Client.loadFile( DB.INTERFACE_PATH + "make_character_ver2/bt_"+_gender+"_on.bmp", function(dataURI) {
	    	CharCreatev4.ui.find('#'+_gender+'_container').css('backgroundImage', 'url(' + dataURI + ')');
		});

		Client.loadFile( DB.INTERFACE_PATH + "make_character_ver2/color0"+(parseInt(_curcolor) + 1)+"_on.bmp", function(dataURI) {
	    	CharCreatev4.ui.find('.cstyle0'+_curcolor).css('backgroundImage', 'url(' + dataURI + ')');
		});

		Client.loadFile( DB.INTERFACE_PATH + "make_character_ver2/bt_hairstyle_normal.bmp", function(dataURI) {
			CharCreatev4.ui.find('.style'+_prevhead).css('backgroundImage', 'url(' + dataURI + ')');
		});
		Client.loadFile( DB.INTERFACE_PATH + "make_character_ver2/bt_hairstyle_select.bmp", function(dataURI) {
			CharCreatev4.ui.find('.style'+_curhead).css('backgroundImage', 'url(' + dataURI + ')');
		});
	}


	/**
	 * Callback to define
	 */
	CharCreatev4.onExitRequest = function OnExitRequest(){};


	/**
	 * Abstract callback to define
	 */
	CharCreatev4.onCharCreationRequest = function OnCharCreationRequest(){};

	/**
	 * Create componentand export it
	 */
	return UIManager.addComponent(CharCreatev4);
});
