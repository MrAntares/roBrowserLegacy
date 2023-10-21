/**
 * UI/Components/EffectViewer/EffectViewer.js
 *
 * Model Viewer (rsm file)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function(require)
{
	'use strict';


	/**
	 * Load dependencies
	 */
	var glMatrix           = require('Utils/gl-matrix');
	var Client             = require('Core/Client');
	var Renderer           = require('Renderer/Renderer');
	var SpriteRenderer     = require('Renderer/SpriteRenderer');
	var EffectManager      = require('Renderer/EffectManager');
	var EffectTable        = require('DB/Effects/EffectTable');
	var EC                 = require('DB/Effects/EffectConst');
	var EntityManager      = require('Renderer/EntityManager');
	var Entity             = require('Renderer/Entity/Entity');
	var Session            = require('Engine/SessionStorage');
	var Camera             = require('Renderer/Camera');

	var UIManager          = require('UI/UIManager');
	var UIComponent        = require('UI/UIComponent');
	var htmlText           = require('text!./EffectViewer.html');
	var cssText            = require('text!./EffectViewer.css');

	var mat4               = glMatrix.mat4;

	/**
	 * @var {object} fog structure
	 */
	var _fog   = {
		use:    false,
		exist:  true,
		far:    30,
		near:   180,
		factor: 1.0,
		color:  new Float32Array([1,1,1])
	};


	/**
	 * @var {object} model View mat
	 */
	var _modelView = mat4.create();

	var _selectedEffect = null;

	/**
	 * Create GRFViewer component
	 */
	var Viewer = new UIComponent( 'EffectViewer', htmlText, cssText );


	/**
	 * Initialize Component
	 */
	Viewer.init = function Init()
	{
		// Initialize WebGL
		Renderer.init({
			alpha:              false,
			depth:              true,
			stencil:            false,
			antialias:          true,
			premultipliedAlpha: false,
		});

		Renderer.show();
		EffectManager.init(Renderer.getContext());
		SpriteRenderer.init(Renderer.getContext());
		Client.init([]);

		// We need an entity in order to apply effect
		Session.Entity = new Entity({PosDir: [0, 0, 0], position: [0, 0, 0], GID: 0});
		EntityManager.add(Session.Entity)

		// Initialize the dropdown
		initDropDown( this.ui.find('select').get(0), this.ui.find('button').get(0) );
	};


	/**
	 * Initialise Drop Down list
	 *
	 * @param {HTMLElement} drop down
	 */
	function initDropDown( select, button )
	{
		var hash      = decodeURIComponent(location.hash);
		if (hash) {
			hash = hash.substring(1);
			_selectedEffect = hash;
		}
		
		function getKeyByValue(object, value) {
			if(isNaN(value)){
				return undefined;
			} else {
				return Object.keys(object).find(key => object[key] === Number(value));
			}
		}
		
		for(const effectId of Object.keys(EffectTable)) {
			var ef_name = getKeyByValue(EC, effectId);
			select.add( new Option( ef_name!==undefined ? effectId+' ('+ef_name+')' : effectId , effectId, null, _selectedEffect === effectId), null );
		}
		select.onchange = function() {
			_selectedEffect = this.value;
			saveEffectId(_selectedEffect)
			loadEffect(this.value);
		};

		button.onclick = function() {
			loadEffect(_selectedEffect);
		};

		loadEffect( 0 );

		Viewer.ui.find('.head').show();
		select.focus();
	}

	function saveEffectId(effectId) {
		location.hash = effectId;
	}

	/**
	 * Start loading an effect
	 *
	 * @param {string} filename
	 */
	function loadEffect( effectId )
	{
		stop();
		Session.Entity.renderEntity();
		EffectManager.spam({effectId: effectId, ownerAID: Session.Entity.GID, otherAID: Session.Entity.GID, position: Session.Entity.position});
		Renderer.render(render);
	}


	/**
	 * Stop to render
	 */
	function stop()
	{
		var gl = Renderer.getContext();

		Renderer.stop();
		EffectManager.free(gl);
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	}


	/**
	 * Rendering scene
	 *
	 * @param {number} tick
	 * @param {object} webgl context
	 */
	function render( tick, gl )
	{
		// Updating camera position
		mat4.identity( _modelView );
		mat4.translate( _modelView, _modelView, [ 0, -3, -50] );
		// Invert y axis
		mat4.rotateX(_modelView, _modelView, Math.PI);
		mat4.rotateX( _modelView, _modelView, (50/180) * Math.PI );


		// Clear screen, update camera
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

		EffectManager.render( gl, _modelView, Camera.projection, _fog, tick, false);
		EffectManager.render( gl, _modelView, Camera.projection, _fog, tick, true);
	}


	/**
	 * Exports methods
	 */
	Viewer.loadEffect = loadEffect;
	Viewer.stop       = stop;


	/**
	 * Stored component and return it
	 */
	return UIManager.addComponent(Viewer);
});
