/**
 * Renderer/EntitySignboard/EntitySignboard.js
 *
 * Signboard above entity's head
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */
define(function( require )
{
	'use strict';


	// Load dependencies
	var glMatrix   = require('Utils/gl-matrix');
	var Renderer   = require('Renderer/Renderer');
	var Client     = require('Core/Client');
	var DB         = require('DB/DBManager');
	var EntitySignboard = require('UI/Components/EntitySignboard/EntitySignboard');

    var vec4 = glMatrix.vec4;
    var _pos = new Float32Array(4);
    var _size = new Float32Array(2);

    var posY = 0;
    var posZ = 0;

    /**
     * Signboard class
     */
    function Signboard(owner) {
        this.owner = owner;
        this.type = Signboard.Type.ICON_ONLY;
        this.background = null;
        this.icon = null;
        this.description = '';
        this.display = false;
        this.posY = 0;
        this.posX = 0;
    }

    /**
     * Constants
     */
    Signboard.Type = {
        ICON_ONLY: 1,
        FULL_SIGNBOARD: 3
    };

    /**
     * Load Signboard with background, icon, and description
     *
     * @param {Object} signboardData - Data for the signboard
     */
    Signboard.prototype.load = function(signboardData) {
        var self = this;

		function init() {

            self.type = signboardData.type;
            signboardData.icon_location = signboardData.icon_location.replace('\xc0\xaf\xc0\xfa\xc0\xce\xc5\xcd\xc6\xe4\xc0\xcc\xbd\xba' + '\\', '');

            if (self.type === Signboard.Type.ICON_ONLY) {
                self.posY = 15;
                self.posX = 120;
                console.log("Signboard icon!");
                Client.loadFile( DB.INTERFACE_PATH + signboardData.icon_location, function(url){
                    self.display = true;

                    if (self.node) {
                        self.node.setIconOnly( url );
                    }
                });
            } else if (self.type === Signboard.Type.FULL_SIGNBOARD) {
                self.posY = 70;
                self.posX = 140;
                console.log("Signboard Fullboard!");
                Client.loadFile( DB.INTERFACE_PATH + signboardData.icon_location, function(url){
                    self.display = true;
    
                    if (self.node) {
                        self.node.setTitle( signboardData.description, url );
                    }
                });
            }
        }

        // Already exist
		if (this.node) {
			init();
			this.node.append();
			return;
		}

		this.node      = EntitySignboard.clone('EntitySignboard', true);
		this.node.init = init;
		this.node.append();
    };


    /**
     * Render Signboard
     *
     * @param {mat4} matrix
     */
    Signboard.prototype.render = function(matrix) {
        var ui = this.node.ui[0];
        var z;

        // Cast position
		_pos[0] =  0.0;
		_pos[1] =  this.posX / 35;
		_pos[2] =  0.0;
		_pos[3] =  1.0;

        // Set the viewport
        _size[0] = Renderer.width / 2;
        _size[1] = Renderer.height / 2;

        // Project point to scene
        vec4.transformMat4(_pos, _pos, matrix);

        // Calculate position
        z = _pos[3] === 0.0 ? 1.0 : (1.0 / _pos[3]);
        _pos[0] = _size[0] + Math.round(_size[0] * (_pos[0] * z));
        _pos[1] = _size[1] - Math.round(_size[1] * (_pos[1] * z));

        ui.style.top  = (_pos[1] | 0 ) + 'px';
		ui.style.left = ((_pos[0] - this.posY) | 0) + 'px';
    };

    /**
     * Remove Signboard
     */
    Signboard.prototype.remove = function() {
        this.display = false;
		if (this.node) {
			this.node.remove();
		}
    };

    /**
     * Clean Signboard
     */
    Signboard.prototype.clean = function() {
        this.remove();
        this.background = null;
        this.icon = null;
        this.description = '';
    };

    /**
     * Export
     */
    return function Init() {
        this.signboard = new Signboard(this);
    };
});

