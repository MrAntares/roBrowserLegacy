/**
 * UI/Components/MiniMap.js
 *
 * MiniMap UI
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
'use strict';

import DB from 'DB/DBManager';
import Client from 'Core/Client';
import Preferences from 'Core/Preferences';
import Session from 'Engine/SessionStorage';
import Renderer from 'Renderer/Renderer';
import Altitude from 'Renderer/Map/Altitude';
import KEYS from 'Controls/KeyEventHandler';
import UIManager from 'UI/UIManager';
import UIComponent from 'UI/UIComponent';
import htmlText from './MiniMap.html?raw';
import cssText from './MiniMap.css?raw';

/**
	 * Create MiniMap component
	 */
	let MiniMap = new UIComponent('MiniMap', htmlText, cssText);

	/**
	 * Mouse cant cross this UI
	 */
	MiniMap.mouseMode = UIComponent.MouseMode.STOP;

	/**
	 * @var {boolean} do not focus this UI
	 */
	MiniMap.needFocus = false;

	/**
	 * @var {Preferences}
	 */
	let _preferences = Preferences.get(
		'MiniMap',
		{
			zoom: 0,
			opacity: 2
		},
		1.0
	);

	/**
	 * @var {Object} member colors cache
	 */
	let _memberColors = {};

	/**
	 * @var {Array} party members marker
	 */
	let _party = [];

	/**
	 * @var {Array} guild members marker
	 */
	let _guild = [];

	/**
	 * @var {Array} others markers
	 */
	let _markers = [];

	/**
	 * @var {Array} others towninfo
	 */
	let _towninfo = [];

	/**
	 * Async image create helper
	 */
	function createAsyncImage() {
		const img = new Image();
		img.decoding = 'async';
		return img;
	}

	/**
	 * @var {Image} arrow image
	 */
	let _arrow = createAsyncImage();

	/**
	 * @var {Image} map information images
	 */
	let _toolDealer = createAsyncImage();
	let _weaponDealer = createAsyncImage();
	let _armorDealer = createAsyncImage();
	let _blacksmith = createAsyncImage();
	let _guide = createAsyncImage();
	let _inn = createAsyncImage();
	let _kafra = createAsyncImage();

	/**
	 * @var {Image} minimap image
	 */
	let _map = createAsyncImage();

	/**
	 * @var {CanvasRenderingContext2D} canvas context
	 */
	let _ctx;

	/**
	 * @var {List} Zoom values
	 */
	let _zoomFactor = [1, 10, 6, 3, 2];

	/**
	 * Initialize minimap
	 */
	MiniMap.init = function init() {
		function genericUpdateZoom(value) {
			return function (event) {
				MiniMap.updateZoom(value);
				event.stopImmediatePropagation();
				return false;
			};
		}

		_ctx = this.ui.find('canvas')[0].getContext('2d');
		this.opacity = 2;

		Client.loadFile(DB.INTERFACE_PATH + 'map/map_arrow.bmp', function (dataURI) {
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
	};

	/**
	 * Once append to HTML
	 */
	MiniMap.onAppend = function onAppend() {
		// Set preferences
		this.updateZoom(_preferences.zoom);
		this.toggleOpacity(_preferences.opacity + 1);

		Renderer.render(render);
	};

	/**
	 * Set map
	 *
	 * @param {string} mapname
	 */
	MiniMap.setMap = function setMap(mapname) {
		_map.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

		_towninfo = DB.getTownInfo(mapname.replace(/\..*/, ''));

		let path = DB.INTERFACE_PATH.replace('data/texture/', '') + 'map/' + mapname.replace(/\..*/, '.bmp');
		path = path.replace(/\//g, '\\'); // normalize path separator
		path = DB.mapalias[path] || path;

		Client.loadFile('data/texture/' + path, function (dataURI) {
			_map.src = dataURI;
		});
	};

	/**
	 * KeyDown Handler
	 *
	 * @param {object} event
	 * @return {boolean}
	 */
	MiniMap.onKeyDown = function onKeyDown(event) {
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
	MiniMap.onRemove = function onRemove() {
		// Clean up memory
		_party.length = 0;
		_guild.length = 0;
		_markers.length = 0;
	};

	/**
	 * Add a party mark to minimap
	 *
	 * @param {number} key account id
	 * @param {number} x position
	 * @param {number} y position
	 */
	MiniMap.addPartyMemberMark = function addPartyMemberMark(key, x, y) {
		let i,
			count = _party.length;

		for (i = 0; i < count; ++i) {
			if (_party[i].key === key) {
				_party[i].x = x;
				_party[i].y = y;
				_party[i].color = this.getMemberColor(key);
				return;
			}
		}

		_party.push({
			key: key,
			x: x,
			y: y,
			color: this.getMemberColor(key)
		});
	};

	/**
	 * Get or generate a random color for a party member
	 */
	MiniMap.getMemberColor = function getMemberColor(key) {
		if (_memberColors[key]) {
			return _memberColors[key];
		}
		let r = Math.random;
		let color = 'rgb(' + [(r() * 255) | 0, (r() * 255) | 0, (r() * 255) | 0] + ')';
		_memberColors[key] = color;
		return color;
	};

	/**
	 * Remove a party mark from minimap
	 *
	 * @param {number} key account id
	 */
	MiniMap.removePartyMemberMark = function removePartyMemberMark(key) {
		let i,
			count = _party.length;

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
	MiniMap.addGuildMemberMark = function addGuildMemberMark(key, x, y) {
		let i,
			count = _guild.length;

		for (i = 0; i < count; ++i) {
			if (_guild[i].key === key) {
				_guild[i].x = x;
				_guild[i].y = y;
				return;
			}
		}

		_guild.push({
			key: key,
			x: x,
			y: y
		});
	};

	/**
	 * Remove a guild mark from minimap
	 *
	 * @param {number} key account id
	 */
	MiniMap.removeGuildMemberMark = function removeGuildMemberMark(key) {
		let i,
			count = _guild.length;

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
	MiniMap.addNpcMark = function addNPCMark(key, x, y, lcolor, time) {
		let i,
			count = _markers.length;
		let color = [(lcolor & 0x00ff0000) >> 16, (lcolor & 0x0000ff00) >> 8, lcolor & 0x000000ff];

		for (i = 0; i < count; ++i) {
			if (_markers[i].key === key) {
				_markers[i].x = x;
				_markers[i].y = y;
				_markers[i].color = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
				_markers[i].tick = Renderer.tick + time;
				return;
			}
		}

		_markers.push({
			key: key,
			x: x,
			y: y,
			color: 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')',
			tick: Renderer.tick + time
		});
	};

	/**
	 * Remove a NPC mark from minimap
	 *
	 * @param {number} key id
	 */
	MiniMap.removeNpcMark = function removeNPCMark(key) {
		let i,
			count = _markers.length;

		for (i = 0; i < count; ++i) {
			if (_markers[i].key === key) {
				_markers.splice(i, 1);
				break;
			}
		}
	};

	/**
	 * Change zoom
	 *
	 * @param {number} value increment
	 */
	MiniMap.updateZoom = function updateZoom(value) {
		_preferences.zoom = Math.max(0, Math.min(_zoomFactor.length - 1, _preferences.zoom + value));
		_preferences.save();
	};

	/**
	 * Change window opacity
	 */
	MiniMap.toggleOpacity = function toggleOpacity(opacity) {
		this.opacity = ((arguments.length ? opacity : this.opacity) + 2) % 3;
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
	let render = (function renderClosure() {
		let ZOOM_SIZE = 20;
		let max, start_x, start_y, zoom, f;
		let pos;

		function projectX(x) {
			if (zoom === 1) {
				return (start_x + x * f) | 0;
			}
			return (64 + ((x - pos[0]) * f * 256) / (zoom * ZOOM_SIZE)) | 0;
		}

		function projectY(y) {
			if (zoom === 1) {
				return (start_y + 128 - y * f) | 0;
			}
			return (64 - ((y - pos[1]) * f * 256) / (zoom * ZOOM_SIZE)) | 0;
		}

		return function render(tick) {
			let width, height, i, count;
			let dot;

			width = Altitude.width;
			height = Altitude.height;

			// closure
			zoom = _zoomFactor[_preferences.zoom];
			pos = Session.Entity.position;
			max = Math.max(width, height);
			f = (1 / max) * 128;
			start_x = ((max - width) / 2) * f;
			start_y = ((height - max) / 2) * f;

			// Rendering map
			_ctx.clearRect(0, 0, 128, 128);

			if (_map.complete && _map.width) {
				if (zoom === 1) {
					_ctx.drawImage(_map, 0, 0, 128, 128);
				} else {
					_ctx.drawImage(
						_map,
						((start_x + pos[0] * f) * 4 - ZOOM_SIZE * zoom) | 0,
						((start_y + 128 - pos[1] * f) * 4 - ZOOM_SIZE * zoom) | 0,
						ZOOM_SIZE * zoom * 2,
						ZOOM_SIZE * zoom * 2,
						0,
						0,
						128,
						128
					);
				}
			}

			// Render town info icons
			if (_towninfo) {
				count = _towninfo.length;
				for (i = 0; i < count; ++i) {
					dot = _towninfo[i];

					let img;
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
						_ctx.translate(projectX(dot.X) + img.width / 2, projectY(dot.Y) + img.height / 2);
						_ctx.drawImage(img, -img.width, -img.height);
						_ctx.restore();
					}
				}
			}

			// Render attached player arrow
			if (_arrow.complete && _arrow.width) {
				_ctx.save();
				_ctx.translate(projectX(pos[0]), projectY(pos[1]));
				_ctx.rotate(((Session.Entity.direction + 4) * 45 * Math.PI) / 180);
				_ctx.drawImage(_arrow, -_arrow.width * 0.5, -_arrow.height * 0.5);
				_ctx.restore();
			}

			// Render NPC mark
			if (tick % 1000 > 500) {
				// blink effect

				count = _markers.length;

				for (i = 0; i < count; ++i) {
					dot = _markers[i];

					// Auto remove feature
					if (dot.tick < Renderer.tick) {
						_markers.splice(i, 1);
						i--;
						count--;
						continue;
					}

					// Render mark
					_ctx.fillStyle = dot.color;
					_ctx.fillRect(projectX(dot.x) - 1, projectY(dot.y) - 4, 2, 8);
					_ctx.fillRect(projectX(dot.x) - 4, projectY(dot.y) - 1, 8, 2);
				}
			}

			// Render party members
			count = _party.length;
			for (i = 0; i < count; ++i) {
				dot = _party[i];
				_ctx.fillStyle = 'white';
				_ctx.fillRect(projectX(dot.x) - 3, projectY(dot.y) - 3, 6, 6);

				dot.color = MiniMap.getMemberColor(dot.key);

				_ctx.fillStyle = dot.color;
				_ctx.fillRect(projectX(dot.x) - 2, projectY(dot.y) - 2, 4, 4);
			}

			// Render guild members
			count = _guild.length;

			if (count) {
				_ctx.fillStyle = 'rgb(245,175,200)';
				_ctx.strokeStyle = 'white';
				_ctx.lineWidth = 2;
				for (i = 0; i < count; ++i) {
					dot = _guild[i];
					_ctx.beginPath();
					_ctx.moveTo(projectX(dot.x) + 0, projectY(dot.y) - 4);
					_ctx.lineTo(projectX(dot.x) + 4, projectY(dot.y) + 4);
					_ctx.lineTo(projectX(dot.x) - 4, projectY(dot.y) + 4);
					_ctx.lineTo(projectX(dot.x) + 0, projectY(dot.y) - 4);
				}
				_ctx.stroke();
				_ctx.fill();
			}
		};
	})();

	/**
	 * Create component and return it
	 */
export default UIManager.addComponent(MiniMap);