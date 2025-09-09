/**
 * UI/Components/MiniMap.js
 *
 * MiniMap UI
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
	var DB                 = require('DB/DBManager');
	var Client             = require('Core/Client');
	var Preferences        = require('Core/Preferences');
	var Session            = require('Engine/SessionStorage');
	var Renderer           = require('Renderer/Renderer');
	var Altitude           = require('Renderer/Map/Altitude');
	var KEYS               = require('Controls/KeyEventHandler');
	var UIManager          = require('UI/UIManager');
	var UIComponent        = require('UI/UIComponent');
	var WorldMap           = require('UI/Components/WorldMap/WorldMap');
	var htmlText           = require('text!./MiniMapV2.html');
	var cssText            = require('text!./MiniMapV2.css');


	/**
	 * Create MiniMap component
	 */
	var MiniMapV2 = new UIComponent( 'MiniMapV2', htmlText, cssText );


	/**
	 * Mouse cant cross this UI
	 */
	MiniMapV2.mouseMode = UIComponent.MouseMode.STOP;


	/**
	 * @var {boolean} do not focus this UI
	 */
	MiniMapV2.needFocus = false;


	/**
	 * @var {Preferences}
	 */
	var _preferences = Preferences.get('MiniMapV2', {
		zoom:    0,
		opacity: 2,
		townInfoShow: true
	}, 1.0);


	/**
	 * @var {Array} party members marker
	 */
	var _party = [];


	/**
	 * @var {Array} guild members marker
	 */
	var _guild = [];


	/**
	 * @var {Array} others markers
	 */
	var _markers = [];


	/**
	 * @var {Array} others towninfo
	 */
	var _towninfo = [];


    /**
	 * @var {Image} arrow image
	 */
	var _arrow = new Image();


	/**
	 * @var {Image} map information images
	 */
	var _toolDealer = new Image();
	var _weaponDealer = new Image();
	var _armorDealer = new Image();
	var _blacksmith = new Image();
	var _guide = new Image();
	var _inn = new Image();
	var _kafra = new Image();

	/**
	 * @var {Image} minimap image
	 */
	var _map = new Image();


	/**
	 * @var {CanvasRenderingContext2D} canvas context
	 */
	var _ctx;


	 /**
	  * @var {List} Zoom values
	  */
	var _zoomFactor = [1, 10, 6, 3, 2];


	/**
	 * Initialize minimap
	 */
	MiniMapV2.init = function init()
	{
		function genericUpdateZoom( value ) {
			return function(event) {
				MiniMapV2.updateZoom( value );
				event.stopImmediatePropagation();
				return false;
			};
		}

		_ctx          = this.ui.find('canvas')[0].getContext('2d');
		this.opacity  = 2;

		Client.loadFile( DB.INTERFACE_PATH + 'map/map_arrow.bmp', function(dataURI){
			_arrow.src = dataURI;
		});

		Client.loadFile(DB.INTERFACE_PATH + 'information/store.bmp', function (dataURI) {
			_toolDealer.src = dataURI;
		});
		Client.loadFile(DB.INTERFACE_PATH + 'information/weaponshop.bmp', function (dataURI) {
			_weaponDealer.src = dataURI;
		});
		Client.loadFile(DB.INTERFACE_PATH + 'information/armorshops.bmp', function (dataURI) {
			_armorDealer.src = dataURI;
		});
		Client.loadFile(DB.INTERFACE_PATH + 'information/smithy.bmp', function (dataURI) {
			_blacksmith.src = dataURI;
		});
		Client.loadFile(DB.INTERFACE_PATH + 'information/guide.bmp', function (dataURI) {
			_guide.src = dataURI;
		});
		Client.loadFile(DB.INTERFACE_PATH + 'information/inn.bmp', function (dataURI) {
			_inn.src = dataURI;
		});
		Client.loadFile(DB.INTERFACE_PATH + 'information/kafra.bmp', function (dataURI) {
			_kafra.src = dataURI;
		});


		// Bind DOM elements
		this.ui.find('.plus').mousedown(genericUpdateZoom(+1));
		this.ui.find('.minus').mousedown(genericUpdateZoom(-1));

		// Bind DOM elements
		this.ui.find('.info_container button').mousedown(function(){
			switch (this.className) {
				case 'object':
					_preferences.townInfoShow = !_preferences.townInfoShow;
					_preferences.save();
					break;

				case 'mini':
					break;

				case 'viewon':
					WorldMap.toggle();
					break;

				default:

			}
		});
	};


	/**
	 * Once append to HTML
	 */
	MiniMapV2.onAppend = function onAppend()
	{
		// Set preferences
		this.updateZoom( _preferences.zoom );
		this.toggleOpacity( _preferences.opacity + 1 );

		Renderer.render(render);
	};


	/**
	 * Set map
	 *
	 * @param {string} mapname
	 */
	MiniMapV2.setMap = function setMap( mapname )
	{
		_map.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

        _towninfo = DB.getTownInfo(mapname.replace(/\..*/, ''));

		var path = DB.INTERFACE_PATH.replace('data/texture/', '') + 'map/' + mapname.replace(/\..*/,'.bmp');
		path     = path.replace(/\//g, '\\'); // normalize path separator
		path     = DB.mapalias[path] || path;

		Client.loadFile( 'data/texture/' + path, function(dataURI){
			_map.src = dataURI;
		});
	};


	/**
	 * KeyDown Handler
	 *
	 * @param {object} event
	 * @return {boolean}
	 */
	MiniMapV2.onKeyDown = function onKeyDown( event )
	{
		// Will not work on Chrome :(
		if (event.which === KEYS.TAB && KEYS.CTRL) {
			this.toggleOpacity();
			event.stopImmediatePropagation();
			return false;
		}

		return true;
	};


	/**
	 * Once removed from HTML
	 */
	MiniMapV2.onRemove = function onRemove()
	{
		// Clean up memory
		_party.length   = 0;
		_guild.length   = 0;
		_markers.length = 0;
	};


	/**
	 * Add a party mark to minimap
	 *
	 * @param {number} key account id
	 * @param {number} x position
	 * @param {number} y position
	 */
	MiniMapV2.addPartyMemberMark = function addPartyMember( key, x, y)
	{
		var i, count = _party.length;
		var r = Math.random;

		for (i = 0; i < count; ++i) {
			if (_party[i].key === key) {
				_party[i].x = x;
				_party[i].y = y;
				return;
			}
		}

		_party.push({
			key: key,
			x:   x,
			y:   y,
			color: 'rgb('+  [ r()*255 | 0, r()*255 | 0, r()*255 | 0] +')'
		});
	};


	/**
	 * Remove a party mark from minimap
	 *
	 * @param {number} key account id
	 */
	MiniMapV2.removePartyMemberMark = function removePartyMemberMark( key )
	{
		var i, count = _party.length;

		for (i = 0; i < count; ++i) {
			if (_party[i].key === key) {
				_party.splice(i, 1);
				break;
			}
		}
	};


	/**
	 * Add a guild mark to minimap
	 *
	 * @param {number} key account id
	 * @param {number} x position
	 * @param {number} y position
	 */
	MiniMapV2.addGuildMemberMark = function addGuildMemberMark( key, x, y )
	{
		var i, count = _guild.length;

		for (i = 0; i < count; ++i) {
			if (_guild[i].key === key) {
				_guild[i].x = x;
				_guild[i].y = y;
				return;
			}
		}

		_guild.push({
			key: key,
			x:   x,
			y:   y
		});
	};


	/**
	 * Remove a guild mark from minimap
	 *
	 * @param {number} key account id
	 */
	MiniMapV2.removeGuildMemberMark = function removeGuildMemberMark( key )
	{
		var i, count = _guild.length;

		for (i = 0; i < count; ++i) {
			if (_guild[i].key === key) {
				_guild.splice(i, 1);
				break;
			}
		}
	};


	/**
	 * Add a npc mark to minimap
	 *
	 * @param {number} key id
	 * @param {number} x position
	 * @param {number} y position
	 * @param {Array} color
	 */
	MiniMapV2.addNpcMark = function addNPCMark( key, x, y, lcolor, time )
	{
		var i, count = _markers.length;
		var color = [
			( lcolor & 0x00ff0000 ) >> 16,
			( lcolor & 0x0000ff00 ) >> 8,
			( lcolor & 0x000000ff )
		];

		for (i = 0; i < count; ++i) {
			if (_markers[i].key === key) {
				_markers[i].x     = x;
				_markers[i].y     = y;
				_markers[i].color = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
				_markers[i].tick  = Renderer.tick + time;
				return;
			}
		}

		_markers.push({
			key:    key,
			x:      x,
			y:      y,
			color: 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')',
			tick:  Renderer.tick + time
		});
	};


	/**
	 * Remove a NPC mark from minimap
	 *
	 * @param {number} key id
	 */
	MiniMapV2.removeNpcMark = function removeNPCMark( key )
	{
		var i, count = _markers.length;

		for (i = 0; i < count; ++i) {
			if (_markers[i].key === key) {
				_markers.splice(i, 1);
				break;
			}
		}
	};

	/**
	 * Update Coords Values
	 *
	 * @param {number} x increment
	 * @param {number} y increment
	 */
	MiniMapV2.updateCoordinates = function updateCoordinates( x, y )
	{
		MiniMapV2.ui.find('.coordinates .coord.x').html(Math.floor(x));
		MiniMapV2.ui.find('.coordinates .coord.y').html(Math.floor(y));
	};


	/**
	 * Change zoom
	 *
	 * @param {number} value increment
	 */
	MiniMapV2.updateZoom = function updateZoom( value )
	{
		_preferences.zoom = Math.max(0, Math.min(_zoomFactor.length-1, _preferences.zoom + value));
		_preferences.save();
	};


	/**
	 * Change window opacity
	 */
	MiniMapV2.toggleOpacity = function toggleOpacity( opacity )
	{
		this.opacity = ( ( arguments.length ? opacity : this.opacity ) + 2 ) % 3;
		_preferences.opacity = this.opacity;
		_preferences.save();

		switch (this.opacity) {
			case 0:
				this.ui.hide();
				break;

			case 1:
				_ctx.globalAlpha = 0.5;
				this.ui.show();
				break;

			case 2:
				_ctx.globalAlpha = 1.0;
				this.ui.show();
				break;
		}
	};


	/**
	 * Render GUI
	 */
	var render = (function renderClosure()
	{
		var ZOOM_SIZE = 20;
		var max, start_x, start_y, zoom, f;
		var pos;

		function projectX(x) {
			if (zoom === 1) {
				return (start_x + x * f) | 0;
			}
			return (64 + (x-pos[0]) * f * 256 / (zoom*ZOOM_SIZE)) | 0;
		}

		function projectY(y) {
			if (zoom === 1) {
				return (start_y + 128 - y * f) | 0;
			}
			return (64 - (y-pos[1]) * f * 256 / (zoom*ZOOM_SIZE)) | 0;
		}

		return function render( tick )
		{
			var width, height, i, count;
			var dot;

			width   = Altitude.width;
			height  = Altitude.height;

			// closure
			zoom    = _zoomFactor[_preferences.zoom];
			pos     = Session.Entity.position;
			max     = Math.max(width, height);
			f       = 1 / max  * 128;
			start_x = (max-width)  / 2 * f;
			start_y = (height-max) / 2 * f;

			// update coords
			MiniMapV2.updateCoordinates(pos[0], pos[1]);

			// Rendering map
			_ctx.clearRect( 0, 0, 128, 128 );

			if (_map.complete && _map.width) {
				if (zoom === 1) {
					_ctx.drawImage( _map, 0, 0, 128, 128 );
				}
				else {
					_ctx.drawImage(
						_map,
						((start_x +       pos[0] * f) * 4 - ZOOM_SIZE * zoom) | 0,
						((start_y + 128 - pos[1] * f) * 4 - ZOOM_SIZE * zoom) | 0,
						ZOOM_SIZE * zoom * 2,
						ZOOM_SIZE * zoom * 2,
						0, 0,
						128, 128
					);
				}
			}

			// Render town info icons
	        if (_towninfo && _preferences.townInfoShow) {
	            count = _towninfo.length;
	            for (i = 0; i < count; ++i) {
	                dot = _towninfo[i];

	                var img;
	                switch (dot.Type) {
	                    case 0:
	                        img = _toolDealer;
	                        break;
	                    case 1:
	                        img = _weaponDealer;
	                        break;
	                    case 2:
	                        img = _armorDealer;
	                        break;
	                    case 3:
	                        img = _blacksmith;
	                        break;
	                    case 4:
	                        img = _guide;
	                        break;
	                    case 5:
	                        img = _inn;
	                        break;
	                    case 6:
	                        img = _kafra;
	                        break;
	                }

	                if (img.complete && img.width) {
	                    _ctx.save();
	                    _ctx.translate(projectX(dot.X) + (img.width / 2), projectY(dot.Y) + (img.height / 2));
	                    _ctx.drawImage(img, -img.width, -img.height);
	                    _ctx.restore();
	                }
	            }
	        }

			// Render attached player arrow
			if (_arrow.complete && _arrow.width) {
				_ctx.save();
				_ctx.translate( projectX(pos[0]), projectY(pos[1]) );
				_ctx.rotate( ( Session.Entity.direction + 4 ) * 45 * Math.PI / 180 );

				_ctx.shadowColor = 'rgba(0, 0, 0, 1)';
				_ctx.shadowBlur = 5;
				_ctx.shadowOffsetX = 0;
				_ctx.shadowOffsetY = 0;

				_ctx.drawImage( _arrow, -_arrow.width * 0.5, -_arrow.height * 0.5 );

				_ctx.shadowColor = 'rgba(0, 0, 0, 0)';
				_ctx.shadowBlur = 0;
				_ctx.shadowOffsetX = 0;
				_ctx.shadowOffsetY = 0;

				_ctx.restore();
			}

			// Render NPC mark
			if (tick % 1000 > 500) { // blink effect

				count = _markers.length;

				for (i = 0; i < count; ++i) {
					dot = _markers[i];

					// Auto remove feature
					if (dot.tick < Renderer.tick) {
						_markers.splice( i, 1 );
						i--;
						count--;
						continue;
					}

					// Render mark
					_ctx.fillStyle = dot.color;
					_ctx.fillRect( projectX(dot.x) - 1, projectY(dot.y) - 4, 2, 8 );
					_ctx.fillRect( projectX(dot.x) - 4, projectY(dot.y) - 1, 8, 2 );
				}
			}

			// Render party members
			count = _party.length;
			for (i = 0; i < count; ++i) {
				dot           = _party[i];
				_ctx.fillStyle = 'white';
				_ctx.fillRect( projectX(dot.x) - 3, projectY(dot.y) - 3, 6, 6 );
				_ctx.fillStyle = dot.color;
				_ctx.fillRect( projectX(dot.x) - 2, projectY(dot.y) - 2, 4, 4 );
			}

			// Render guild members
			count = _guild.length;

			if (count) {
				_ctx.fillStyle   = 'rgb(245,175,200)';
				_ctx.strokeStyle = 'white';
				_ctx.lineWidth   = 2;
				for (i = 0; i < count; ++i) {
					dot = _guild[i];
					_ctx.beginPath();
					_ctx.moveTo( projectX(dot.x) + 0, projectY(dot.y) - 4 );
					_ctx.lineTo( projectX(dot.x) + 4, projectY(dot.y) + 4 );
					_ctx.lineTo( projectX(dot.x) - 4, projectY(dot.y) + 4 );
					_ctx.lineTo( projectX(dot.x) + 0, projectY(dot.y) - 4 );
				}
				_ctx.stroke();
				_ctx.fill();
			}

		};
	})();


	/**
	 * Create component and return it
	 */
	return UIManager.addComponent(MiniMapV2);
});
