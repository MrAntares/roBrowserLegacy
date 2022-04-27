/**
 * Renderer/Camera.js
 *
 * Camera class
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function( require )
{
	'use strict';

	/**
	 * Load dependencies
	 */
	var KEYS        = require('Controls/KeyEventHandler');
	var Mouse       = require('Controls/MouseEventHandler');
	var Events      = require('Core/Events');
	var Preferences = require('Preferences/Camera');
	var glMatrix    = require('Utils/gl-matrix');
	var mat4        = glMatrix.mat4;
	var mat3        = glMatrix.mat3;
	var vec2        = glMatrix.vec2;
	var vec3        = glMatrix.vec3;
	var _position   = vec3.create();
	
	/**
	 * @var {number} camera min-max constants
	 */
	const C_MIN_ZOOM = 1;
	const C_MAX_ZOOM = 5;
	
	const C_MIN_V_ANGLE_ISOMORPHIC = 190;
	const C_MAX_V_ANGLE_ISOMORPHIC = 270;
	
	const C_THIRDPERSON_TRESHOLD_ZOOM = 1;
	const C_MIN_V_ANGLE_3RDPERSON = 175;
	const C_MAX_V_ANGLE_3RDPERSON = 270;
	
	const C_MIN_V_ANGLE_1STPERSON = 90;
	const C_MAX_V_ANGLE_1STPERSON = 270;
	
	/**
	 * Camera Namespace
	 */
	var Camera = {};


	/**
	 * Projection matrix
	 * @var {mat4} projection
	 */
	Camera.projection = mat4.create();


	/**
	 * ModelView matrix
	 * @var {mat4} modelView
	 */
	Camera.modelView = mat4.create();


	/**
	 * ModelView matrix
	 * @var {mat4} modelView
	 */
	Camera.normalMat = mat3.create();


	/**
	 * @var {number} zoom
	 */
	Camera.zoom      = Preferences.zoom;

	/**
	 * @var {number} zoomFinal
	 */
	Camera.zoomFinal = Preferences.zoom;


	/**
	 * @var {vec2} angle rotation
	 */
	Camera.angle      = vec2.create();


	/**
	 * @var {vec2} angle final rotation
	 */
	Camera.angleFinal = vec2.create();


	/**
	 * @var {vec3}
	 */
	Camera.position = vec3.create();


	/**
	 * @var {Entity} Entity currently attached by the camera
	 */
	Camera.target = null;


	/**
	 * @var {number}
	 */
	Camera.lastTick = 0;

	/**
	 * @var {number} camera min-max variables
	 */
	Camera.MIN_ZOOM = C_MIN_ZOOM;
	Camera.MAX_ZOOM = C_MAX_ZOOM;
	Camera.MIN_V_ANGLE = C_MIN_V_ANGLE_ISOMORPHIC;
	Camera.MAX_V_ANGLE = C_MAX_V_ANGLE_ISOMORPHIC;

	/**
	 * @var {number} Camera direction
	 */
	Camera.direction    =    0;
	Camera.altitudeFrom =    0;
	Camera.altitudeTo   =  -65;
	Camera.altitudeRange = 15;
	Camera.rotationFrom = -360;
	Camera.rotationTo   =  360;
	Camera.range        =  230; //240;
	Camera.zoomStep     =  15;
	Camera.zoomStepMult =  1;
	
	Camera.enable3RDPerson = false;
	Camera.enable1STPerson = false;
	
	Camera.state = -1;
	
	Camera.states = {
		isomorphic: 0,
		third_person: 1,
		first_person: 2
	};

	/**
	 * @var {object} Camera action informations (right click)
	 */
	Camera.action = {
		active: false,
		tick:   0,
		x:      0,
		y:      0
	};


	/**
	 * Attach player
	 *
	 * @param {object} target - Entity player to attach
	 */
	Camera.setTarget = function SetTarget( target )
	{
		this.target = target;
	};


	/**
	 * Get camera latitude
	 *
	 * @return {number} latitude
	 */
	Camera.getLatitude = function GetLatitude()
	{
		return this.angle[0] - 180.0;
	};


	/**
	 * Initialize Camera
	 */
	Camera.init = function Init()
	{
		this.lastTick  = Date.now();

		this.angle[0]      = this.range % 360.0;//240.0;
		this.angle[1]      = this.rotationFrom % 360.0;
		this.angleFinal[0] = this.range % 360.0;
		this.angleFinal[1] = this.rotationFrom % 360.0;

		this.position[0] = -this.target.position[0];
		this.position[1] = -this.target.position[1];
		this.position[2] =  this.target.position[2];
		
		this.altitudeRange = this.altitudeTo - this.altitudeFrom;
		
		if(this.enable1STPerson){
			this.MIN_ZOOM = 0;
		} else if(this.enable3RDPerson){
			this.MIN_ZOOM = 0.2;
		} else {
			this.MIN_ZOOM = C_MIN_ZOOM;
		}
		
		//this.updateState();
	};


	/**
	 * Save the camera settings
	 */
	Camera.save = function SaveClosure()
	{
		var _pending = false;

		function save() {
			_pending         = false;
			Preferences.zoom = Camera.zoomFinal;
			Preferences.save();
		}

		return function saving() {
			// Save camera settings after 3 seconds
			if (!_pending) {
				Events.setTimeout( save, 3000);
				_pending = true;
			}
		};
	}();


	/**
	 * Rotate the camera
	 *
	 * @param {boolean} active - is mouse down ?
	 */
	Camera.rotate = function Rotate( active )
	{
		var action = this.action;
		var tick   = Date.now();

		if (!active) {
			action.active = false;
			return;
		}

		// Check for double click (reset angle and zoom)
		if (action.tick + 500 > tick &&
		    Math.abs(action.x-Mouse.screen.x) < 10 && // Check the mouse position to avoid bug while rotating
		    Math.abs(action.y-Mouse.screen.y) < 10) { // to fast the camera...

			if (KEYS.SHIFT) {
				this.angleFinal[0] = +this.range;
			}
			if (KEYS.CTRL) {
				this.zoomFinal = 0.0;
			}
			else {
				this.angleFinal[1] = 0;
			}
		}

		// Save position and tick (for double click)
		action.x       = Mouse.screen.x;
		action.y       = Mouse.screen.y;
		action.tick    = tick;
		action.active  = true;
	};


	/**
	 * Process action when right click is down
	 */
	Camera.processMouseAction = function ProcessMouseAction()
	{
		// Rotate Z
		if (KEYS.SHIFT) {
			this.angleFinal[0] += ( Mouse.screen.y - this.action.y ) / Mouse.screen.height * 300;
			this.angleFinal[0]  = Math.max( this.angleFinal[0], this.MIN_V_ANGLE );
			this.angleFinal[0]  = Math.min( this.angleFinal[0], this.MAX_V_ANGLE );
		}

		// Zoom
		else if (KEYS.CTRL) {
			this.zoomFinal -= ( Mouse.screen.y - this.action.y  ) / (this.zoomStep * 10);
			this.zoomFinal  = Math.min( this.zoomFinal, Math.abs(this.altitudeRange) * this.MAX_ZOOM );
			this.zoomFinal  = Math.max( this.zoomFinal, Math.abs(this.altitudeRange) * this.MIN_ZOOM );
		}

		// Rotate
		else {
			this.angleFinal[1] -= ( Mouse.screen.x - this.action.x ) / Mouse.screen.width * 720;

			if (this.angle[1] > 180 && this.angleFinal[1] > 180) {
				this.angle[1]      -= 360;
				this.angleFinal[1] -= 360;
			}

			else if (this.angle[1] < -180 && this.angleFinal[1]) {
				this.angle[1]      += 360;
				this.angleFinal[1] += 360;
			}

			this.angleFinal[1] = Math.max( this.angleFinal[1], this.rotationFrom );
			this.angleFinal[1] = Math.min( this.angleFinal[1], this.rotationTo );
			
			if(this.state == this.states.first_person || this.state == this.states.third_person){
				this.angleFinal[0] += ( Mouse.screen.y - this.action.y ) / Mouse.screen.height * 300;
				this.angleFinal[0]  = Math.max( this.angleFinal[0], this.MIN_V_ANGLE );
				this.angleFinal[0]  = Math.min( this.angleFinal[0], this.MAX_V_ANGLE );
			}
		}

		// Update last check
		this.action.x = +Mouse.screen.x ;
		this.action.y = +Mouse.screen.y ;
		this.updateState();
		this.save();
	};


	/**
	 * Process a MouseWheel, zoom.
	 *
	 * @param {number} delta (zoom)
	 */
	Camera.setZoom = function SetZoom( delta )
	{
		if(delta){
			this.zoomFinal += delta * this.zoomStep * this.zoomStepMult;
			this.zoomFinal  = Math.min( this.zoomFinal, Math.abs(this.altitudeRange) * this.MAX_ZOOM );
			this.zoomFinal  = Math.max( this.zoomFinal, Math.abs(this.altitudeRange) * this.MIN_ZOOM );
			this.updateState();
			this.save();
		}
	};
	
	Camera.updateState = function UpdateState(){
		if(this.enable1STPerson && this.zoomFinal == 0){
			if(this.state != this.states.first_person){
				var Renderer    = require('Renderer/Renderer');
				this.MIN_V_ANGLE = C_MIN_V_ANGLE_1STPERSON;
				this.MAX_V_ANGLE = C_MAX_V_ANGLE_1STPERSON;
				Renderer.vFov = 50;
				Renderer.resize();
				this.zoomStepMult = 0.3;
				this.state = this.states.first_person;
			}
		} else if (this.enable3RDPerson &&  this.zoomFinal < (Math.abs(this.altitudeRange) * C_THIRDPERSON_TRESHOLD_ZOOM)){
			if(this.state != this.states.third_person){
				var Renderer    = require('Renderer/Renderer');
				this.MIN_V_ANGLE = C_MIN_V_ANGLE_3RDPERSON;
				this.MAX_V_ANGLE = C_MAX_V_ANGLE_3RDPERSON;
				Renderer.vFov = 30;
				Renderer.resize();
				this.zoomStepMult = 0.3;
				this.state = this.states.third_person;
			}
		} else {
			if(this.state != this.states.isomorphic){
				var Renderer    = require('Renderer/Renderer');
				this.MIN_V_ANGLE = C_MIN_V_ANGLE_ISOMORPHIC;
				this.MAX_V_ANGLE = C_MAX_V_ANGLE_ISOMORPHIC;
				Renderer.vFov = 15;
				Renderer.resize();
				this.zoomStepMult = 1;
				this.state = this.states.isomorphic;
			}
		}
	}


	/**
	 * Update the camera
	 *
	 * @param {number} tick
	 */
	Camera.update = function Update( tick )
	{
		
		var lerp      = Math.min( (tick - this.lastTick) * 0.006, 1.0);
		this.lastTick = tick;

		// Update camera from mouse movement
		if (this.action.x !== -1 && this.action.y !== -1 && this.action.active) {
			this.processMouseAction();
		}
		
		// Move Camera
		if (Preferences.smooth && this.state != this.states.first_person) {
			this.position[0] += ( -this.target.position[0] - this.position[0] ) * lerp ;
			this.position[1] += ( -this.target.position[1] - this.position[1] ) * lerp ;
			this.position[2] += (  this.target.position[2] - this.position[2] ) * lerp ;
		}
		else {
			this.position[0] = -this.target.position[0];
			this.position[1] = -this.target.position[1];
			this.position[2] =  this.target.position[2];
		}
		
		// Zoom
		this.zoom        += ( this.zoomFinal - this.zoom ) * lerp * 2.0;
		
		var zOffset = 0;
		if(this.state == this.states.first_person){
			zOffset = 2;
		} else if (this.state == this.states.third_person && this.zoomFinal < (Math.abs(this.altitudeRange) * C_THIRDPERSON_TRESHOLD_ZOOM) ){
			zOffset = 1.5;
		}
		
		// Angle
		this.angle[0]    += ( this.angleFinal[0] - this.angle[0] ) * lerp * 2.0;
		this.angle[1]    += ( this.angleFinal[1] - this.angle[1] ) * lerp * 2.0;
		this.angle[0]    %=   360;
		this.angle[1]    %=   360;
		
		// Find Camera direction (for NPC direction)
		this.direction    = Math.floor( ( this.angle[1] + 22.5 ) / 45 ) % 8;

		// Calculate new modelView mat
		var matrix = this.modelView;
		mat4.identity( matrix );
		mat4.translateZ( matrix, (this.altitudeFrom - this.zoom) / 2);
		mat4.rotateX( matrix, matrix, this.angle[0] / 180 * Math.PI );
		mat4.rotateY( matrix, matrix, this.angle[1] / 180 * Math.PI );

		// Center of the cell and inversed Y-Z axis
		_position[0] = this.position[0] - 0.5;
		_position[1] = this.position[2] + zOffset;
		_position[2] = this.position[1] - 0.5;
		mat4.translate( matrix, matrix, _position );

		mat4.toInverseMat3(matrix, this.normalMat);
		mat3.transpose(this.normalMat, this.normalMat);
	};


	/**
	 * Export
	 */
	return Camera;
});
