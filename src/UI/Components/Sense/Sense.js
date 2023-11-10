/**
 * UI/Components/Sense/Sense.js
 *
 * Sense window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 *
 */
define(function(require)
{
	'use strict';


	/**
	 * Dependencies
	 */
	var jQuery         = require('Utils/jquery');
	var DB             = require('DB/DBManager');
	var Renderer       = require('Renderer/Renderer');
	var Entity         = require('Renderer/Entity/Entity');
	var SpriteRenderer = require('Renderer/SpriteRenderer');
	var UIManager      = require('UI/UIManager');
	var UIComponent    = require('UI/UIComponent');
	var htmlText       = require('text!./Sense.html');
	var cssText        = require('text!./Sense.css');


	/**
	 * Create Component
	 */
	var Sense = new UIComponent( 'Sense', htmlText, cssText );
	
	var Elements = [];
	var Sizes = [];
	var Races = [];
	
	/**
	 * @var {object} model 
	 */
	var _model = {
		entity: new Entity(),
		ctx:    null,
		render: false,
		tick:   0
	};

	/**
	 * Initialize popup
	 */
	Sense.init = function init()
	{
		this.ui.css({
			top:  (Renderer.height-120) / 1.5 - 120,
			left: (Renderer.width -280) / 2.0,
			zIndex: 100
		});
		
		this.ui.find('.close')
			.mousedown(function(event){
				event.stopImmediatePropagation();
				return false;
			})
			.click(this.remove.bind(this));
		
		this.draggable(this.ui.find('.header'));
		
		_model.ctx = this.ui.find('#canvas_model')[0].getContext('2d');
		
		Elements = [
			DB.getMessage(414), // 0 = Neutral
			DB.getMessage(415), // 1 = Water
			DB.getMessage(416), // 2 = Earth
			DB.getMessage(417), // 3 = Fire
			DB.getMessage(418), // 4 = Wind
			DB.getMessage(419), // 5 = Poison
			DB.getMessage(420), // 6 = Holy
			DB.getMessage(421), // 7 = Shadow
			DB.getMessage(422), // 8 = Ghost
			DB.getMessage(423)  // 9 = Undead
		];
		
		Sizes = [
			DB.getMessage(443), // 0 = Small
			DB.getMessage(444), // 1 = Medium
			DB.getMessage(445), // 2 = Large
		];
		
		Races = [
			DB.getMessage(2285), // 0 = Formless
			DB.getMessage(2276), // 1 = Undead
			DB.getMessage(2277), // 2 = Brute
			DB.getMessage(2278), // 3 = Plant
			DB.getMessage(2279), // 4 = Insect
			DB.getMessage(2280), // 5 = Fish
			DB.getMessage(2281), // 6 = Demon
			DB.getMessage(2282), // 7 = Demi-human
			DB.getMessage(2283), // 8 = Angel
			DB.getMessage(2284)  // 9 = Dragon
		];
	};
	
	/**
	 * Set stats
	 *
	 * @param {string} title
	 */
	Sense.setWindow = function setWindow( pkt )
	{
		//TITLE
		this.ui.find('.header .title').text( DB.getMessage(406) );
		
		//SPRITE
		_model.entity.set({
			job:    pkt.job,
			action: 0,
			direction: 0
		});
		_model.render = true;
		
		//STATS
		this.ui.find('#label_name').text( DB.getMessage(407) );
		//this.ui.find('#value_name').text( pkt.job );
		
		//Yolo :D (remove to return to boring-ro)
		this.ui.find('#value_name').html( '<a href="https://ratemyserver.net/mob_db.php?small=1&mob_id=' + pkt.job + '" target="_blank">' +DB.getMonsterName(pkt.job)+' </a>' );
		
		this.ui.find('#label_size').text( DB.getMessage(410) );
		this.ui.find('#value_size').text( Sizes[pkt.size] );
		
		this.ui.find('#label_level').text( DB.getMessage(408) );
		this.ui.find('#value_level').text( pkt.level );
		
		this.ui.find('#label_type').text( DB.getMessage(411) );
		this.ui.find('#value_type').text( Races[pkt.raceType] );
		
		this.ui.find('#label_hp').text( DB.getMessage(409) );
		this.ui.find('#value_hp').text( pkt.hp );
		
		this.ui.find('#label_mdef').text( DB.getMessage(412) );
		this.ui.find('#value_mdef').text( pkt.mdefPower );
		
		this.ui.find('#label_def').text( DB.getMessage(270) );
		this.ui.find('#value_def').text( pkt.def );
		
		this.ui.find('#label_attr').text( DB.getMessage(413) );
		this.ui.find('#value_attr').text( Elements[pkt.property] );
		
		//PROPS
		var water = this.ui.find('#element_water');
		water.removeClass('element_good');
		water.removeClass('element_bad');
		if(pkt.propertyTable.water < 100) { 
			water.addClass('element_bad');
		} else if (pkt.propertyTable.water > 100) {
			water.addClass('element_good');
		}
		water.text( DB.getMessage(415) 	+': '+ pkt.propertyTable.water );
		
		var wind = this.ui.find('#element_wind');
		wind.removeClass('element_good');
		wind.removeClass('element_bad');
		if(pkt.propertyTable.wind < 100) { 
			wind.addClass('element_bad');
		} else if (pkt.propertyTable.wind > 100) {
			wind.addClass('element_good');
		}
		wind.text( DB.getMessage(418) 		+': '+ pkt.propertyTable.wind );
		
		var dark = this.ui.find('#element_shadow');
		dark.removeClass('element_good');
		dark.removeClass('element_bad');
		if(pkt.propertyTable.dark < 100) { 
			dark.addClass('element_bad');
		} else if (pkt.propertyTable.dark > 100) {
			dark.addClass('element_good');
		}
		dark.text( DB.getMessage(421) 	+': '+ pkt.propertyTable.dark );
		
		var earth = this.ui.find('#element_earth');
		earth.removeClass('element_good');
		earth.removeClass('element_bad');
		if(pkt.propertyTable.earth < 100) { 
			earth.addClass('element_bad');
		} else if (pkt.propertyTable.earth > 100) {
			earth.addClass('element_good');
		}
		earth.text( DB.getMessage(416) 	+': '+ pkt.propertyTable.earth );
		
		var poison = this.ui.find('#element_poison');
		poison.removeClass('element_good');
		poison.removeClass('element_bad');
		if(pkt.propertyTable.poison < 100) { 
			poison.addClass('element_bad');
		} else if (pkt.propertyTable.poison > 100) {
			poison.addClass('element_good');
		}
		poison.text( DB.getMessage(419) 	+': '+ pkt.propertyTable.poison );
		
		var mental = this.ui.find('#element_ghost');
		mental.removeClass('element_good');
		mental.removeClass('element_bad');
		if(pkt.propertyTable.mental < 100) { 
			mental.addClass('element_bad');
		} else if (pkt.propertyTable.mental > 100) {
			mental.addClass('element_good');
		}
		mental.text( DB.getMessage(422) 	+': '+ pkt.propertyTable.mental );
		
		var fire = this.ui.find('#element_fire');
		fire.removeClass('element_good');
		fire.removeClass('element_bad');
		if(pkt.propertyTable.fire < 100) { 
			fire.addClass('element_bad');
		} else if (pkt.propertyTable.fire > 100) {
			fire.addClass('element_good');
		}
		fire.text( DB.getMessage(417) 		+': '+ pkt.propertyTable.fire );
		
		var saint = this.ui.find('#element_holy');
		saint.removeClass('element_good');
		saint.removeClass('element_bad');
		if(pkt.propertyTable.saint < 100) { 
			saint.addClass('element_bad');
		} else if (pkt.propertyTable.saint > 100) {
			saint.addClass('element_good');
		}
		saint.text( DB.getMessage(420) 		+': '+ pkt.propertyTable.saint );
		
		var undead = this.ui.find('#element_undead');
		undead.removeClass('element_good');
		undead.removeClass('element_bad');
		if(pkt.propertyTable.undead < 100) { 
			undead.addClass('element_bad');
		} else if (pkt.propertyTable.undead > 100) {
			undead.addClass('element_good');
		}
		undead.text( DB.getMessage(423) 	+': '+ pkt.propertyTable.undead );
		
		this.ui.show();
		
		Renderer.render(render);
	};
	
	/**
	 * Remove component from HTML
	 * Stop rendering
	 */
	Sense.onRemove = function onRemove()
	{
		Renderer.stop(render);
	};
	
	/**
	 * Rendering the Character
	 */
	function render( tick )
	{
		// Render the model
		SpriteRenderer.bind2DContext(_model.ctx, Math.floor(_model.ctx.canvas.width/2), _model.ctx.canvas.height);
		_model.ctx.clearRect(0, 0, _model.ctx.canvas.width, _model.ctx.canvas.height );
		_model.entity.renderEntity();
	}

	/**
	 * Create component based on view file and export it
	 */
	return UIManager.addComponent(Sense);
});
