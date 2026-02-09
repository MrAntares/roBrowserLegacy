/**
 * UI/Components/WorldMap/WorldMap.js
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author IssID
 */
define(function (require) {
	'use strict';

	const DB = require('DB/DBManager');
	const Client = require('Core/Client');
	const Configs = require('Core/Configs');
	const Preferences = require('Core/Preferences');
	const KEYS = require('Controls/KeyEventHandler');
	const Renderer = require('Renderer/Renderer');
	const MapRenderer = require('Renderer/MapRenderer');
	const UIManager = require('UI/UIManager');
	const UIComponent = require('UI/UIComponent');
	const Session = require('Engine/SessionStorage');
	const MAPS = require('DB/Map/WorldMap');
	const htmlText = require('text!./WorldMap.html');
	const cssText = require('text!./WorldMap.css');

	/**
	 * Create Component
	 */
	const WorldMap = new UIComponent('WorldMap', htmlText, cssText);

	/**
	 * @type {Preferences} window preferences
	 */
	const _preferences = Preferences.get(
		'WorldMap',
		{
			x: 0,
			y: 0,
			width: Renderer.width,
			height: Renderer.height,
			show: false
		},
		1.0
	);

	// Party member store
	let _partyMembersByMap = {};

	// Sizing params
	const C_TITLEBARHEIGHT = 17;
	const C_BASEWIDTH = 1280;
	const C_BASEHEIGHT = 1024;
	const C_ASPECTX = 5;
	const C_ASPECTY = 4;
	const C_DIALOG_BASEWIDTH = 512;
	const C_DIALOG_BASEHEIGHT = 512;
	const C_DIALOG_ASPECTX = 1;
	const C_DIALOG_ASPECTY = 1;
	const C_DIALOGPADDING = 20;

	/**
	 * Initialize UI
	 */
	WorldMap.init = function init() {
		this.ui.find('.titlebar .base').mousedown(stopPropagation);
		this.ui.find('.titlebar select').change(onSelect);
		this.ui.find('.titlebar .togglemaps').click(onToggleMaps);
		this.ui.find('.titlebar .showlvl').click(onShowLVL);
		this.ui.find('.titlebar .close').click(onClose);

		// worldmap dialog
		this.ui.find('.map .content').on('click', onWorldMapClick);
		this.ui.find('#dialog-map-view-backdrop').on('click', onWorldMapDialogClick);
		WorldMap.showLVLMode = false;
	};

	/**
	 * Create WorldMap list of maps (select Element)
	 */
	function setMapList() {
		WorldMap.ui.find('#WorldMaps').html(function () {
			let list = '';
			for (const map of MAPS) {
				// list += '<option value="' + mapList[wmap].img + '">' + mapList[wmap].name + '</option>'
				// Episode check
				if (WorldMap.settings.episode >= map.ep_from && WorldMap.settings.episode < map.ep_to) {
					list += `<option value="${map.id}">${map.name}</option>`;
				}
			}
			return list;
		});
	}

	function onSelect() {
		selectMap(WorldMap.ui.find('.titlebar select').val());
	}

	/**
	 * Select world map
	 *
	 * @param {string} name eg. `"worldmap_localizing1"`
	 */
	function selectMap(name = null) {
		// If no name provided, use the first available map
		if (!name) {
			if (MAPS.length > 0) name = MAPS[0].id;
			else name = 'worldmap.jpg';
		}
		// load map image asset and render it
		Client.loadFile(DB.INTERFACE_PATH + name, data => {
			// find map data by name and render it
			for (const map of MAPS) {
				if (map.id === name) {
					createWorldMapView(map, data);
					resizeMap();
					break;
				}
			}
		});
	}

	/**
	 * Resize world map
	 */
	function resizeMap() {
		const mapContainer = WorldMap.ui.find('.map-view');

		const currentwidth = Renderer.width;
		const currentheight = Renderer.height - C_TITLEBARHEIGHT;

		const xmult = currentwidth / C_BASEWIDTH;
		const ymult = currentheight / C_BASEHEIGHT;

		let mult = xmult;
		if (currentwidth / C_ASPECTX > currentheight / C_ASPECTY) {
			mult = ymult;
		}

		mapContainer.width(C_BASEWIDTH * mult);
		mapContainer.height(C_BASEHEIGHT * mult);

		const dialogImg = WorldMap.ui.find('#img-map-view');
		let d_width = C_DIALOG_BASEWIDTH;
		let d_height = C_DIALOG_BASEHEIGHT;
		if (
			currentwidth < C_DIALOG_BASEWIDTH + C_DIALOGPADDING ||
			currentheight < C_DIALOG_BASEHEIGHT + C_DIALOGPADDING
		) {
			const d_xmult = (currentwidth - C_DIALOGPADDING) / C_DIALOG_BASEWIDTH;
			const d_ymult = (currentheight - C_DIALOGPADDING) / C_DIALOG_BASEHEIGHT;

			let mult = d_xmult;
			if (currentwidth / C_DIALOG_ASPECTX > currentheight / C_DIALOG_ASPECTY) {
				mult = d_ymult;
			}

			d_width = C_DIALOG_BASEWIDTH * mult;
			d_height = C_DIALOG_BASEHEIGHT * mult;
		}
		dialogImg.width(d_width);
		dialogImg.height(d_height);
	}

	/**
	 * When worldmap container is clicked
	 * @param {*} e
	 */
	function onWorldMapClick(e) {
		// event delegation from .section
		const section = e.target.closest('.section');
		if (!section) return;

		const overlay = WorldMap.ui.find('#dialog-map-view-backdrop')[0];
		if (overlay == null) return;
		const dialog = WorldMap.ui.find('#dialog-map-view')[0];
		if (dialog == null) return;
		WorldMap.ui.find('#dialog-map-view .mapname').text(section.getAttribute('data-name'));
		WorldMap.ui.find('#dialog-map-view .mapid').text(section.id);

		overlay.classList.add('show');

		const img = dialog.querySelector('#img-map-view');
		img.style.backgroundImage = '';

		// loader (now text)
		const loader = img.querySelector('#loader');
		loader.innerText = `Loading ${section.id}...`;

		// load the image
		Client.loadFile(`${DB.INTERFACE_PATH}map/${section.id}.bmp`, data => {
			// img.src = data;

			loader.innerText = '';
			img.style.backgroundImage = `url(${data})`;
			img.style.backgroundSize = 'cover';
			img.decoding = 'async';
			// try to adjust purple color transparency
			img.onload = () => {
				adjustImageTransparency(img);
				img.onload = null; // only run once
			};
		});

		// display party member list on map
		let memberList = '';
		if (Array.isArray(_partyMembersByMap[section.id])) {
			_partyMembersByMap[section.id].forEach(member => {
				memberList += member.Name + '<br/>';
			});
		}
		WorldMap.ui.find('#dialog-map-view .memberlist').text(memberList);
	}

	/**
	 * When the user clicks outside of the dialog, close it
	 *
	 * @param {*} e
	 * @returns
	 */
	function onWorldMapDialogClick(e) {
		const dialog = WorldMap.ui.find('#dialog-map-view')[0];
		if (dialog == null) {
			return;
		}

		const dialogDimensions = dialog.getBoundingClientRect();
		if (
			e.clientX < dialogDimensions.left ||
			e.clientX > dialogDimensions.right ||
			e.clientY < dialogDimensions.top ||
			e.clientY > dialogDimensions.bottom
		) {
			closeMapDialog();
			return;
		}
		// close button
		if (e.target.id === 'dialog-close') {
			closeMapDialog();
			return;
		}
	}

	function closeMapDialog() {
		// Remove image (causes fps drop)
		WorldMap.ui.find('#img-map-view').attr('src', '');
		const dialog = WorldMap.ui.find('#dialog-map-view-backdrop')[0];
		if (dialog) {
			dialog.classList.remove('show');
		}
	}

	/**
	 * Create the .worldmap container and loop through all the maps
	 * and render them to the container.
	 *
	 * @param {WorldMap} map world map data
	 * @param {string} imgData world map image data as a base64
	 */
	function createWorldMapView(map, imgData) {
		const container = WorldMap.ui.find('.map .content');
		const worldmap = document.createElement('div');
		const currentMap = MapRenderer.currentMap.replace(/\.gat$/i, '');

		worldmap.className = 'worldmap' + (WorldMap.showLVLMode ? ' show-levels' : '');

		// set loaded worldmap background image
		// worldmap.css('backgroundImage', `url(${imgData})`);
		const mapView = document.createElement('div');
		mapView.id = map.id;
		mapView.className = 'map-view';
		mapView.style.backgroundImage = `url(${imgData})`;
		mapView.setAttribute('data-name', map.name);
		worldmap.appendChild(mapView);

		const dgMapPositions = {};
		for (const section of map.maps) {
			if (section.type !== undefined && section.type === 1) {
				dgMapPositions[section.index] = {
					W: section.width,
					H: section.height,
					x: section.left + section.width / 2,
					y: section.top + section.height / 2
				};
			}
		}
		const renderedDungeonPos = new Set();

		// output <div id="worldmap_localizing1" class="map-view" data-name="Eastern Kingdoms"></div>
		for (const section of map.maps) {
			//Episode & custom add/remove check
			if (
				((WorldMap.settings.episode >= section.ep_from && WorldMap.settings.episode < section.ep_to) ||
					WorldMap.settings.add.includes(section.id)) &&
				!WorldMap.settings.remove.includes(section.id)
			) {
				const el = document.createElement('div');
				const el_mapid = document.createElement('div');
				const el_mapname = document.createElement('div');

				el.id = section.id;

				var sectionType = section.type !== undefined ? section.type : 0;

				// connected dungeons logic
				if (sectionType === 0 && dgMapPositions[section.index]) {
					const parentPos = dgMapPositions[section.index];

					const childW = section.width;
					const childH = section.height;
					const childPos = {
						x: section.left + childW / 2,
						y: section.top + childH / 2
					};

					const parentW = parentPos.W;
					const parentH = parentPos.H;

					const deltaX = childPos.x - parentPos.x;
					const deltaY = childPos.y - parentPos.y;
					const fullLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
					const angleRad = Math.atan2(deltaY, deltaX);

					const getRadius = (w, h, rad) => {
						const absCos = Math.abs(Math.cos(rad));
						const absSin = Math.abs(Math.sin(rad));
						return w * absSin <= h * absCos ? w / (2 * absCos) : h / (2 * absSin);
					};

					const startOffset = getRadius(parentW, parentH, angleRad);
					const endOffset = getRadius(childW, childH, angleRad);

					if (fullLength > startOffset + endOffset) {
						const newLength = fullLength - startOffset - endOffset;

						const startX = parentPos.x + Math.cos(angleRad) * startOffset;
						const startY = parentPos.y + Math.sin(angleRad) * startOffset;

						const line = document.createElement('div');
						line.className = 'connector-line';

						line.style.left = `${(startX / C_BASEWIDTH) * 100}%`;
						line.style.top = `${(startY / C_BASEHEIGHT) * 100}%`;
						line.style.width = `${(newLength / C_BASEWIDTH) * 100}%`;

						const angleDeg = (angleRad * 180) / Math.PI;
						line.style.transform = `rotate(${angleDeg}deg)`;
						line.style.transformOrigin = '0% 50%';

						mapView.appendChild(line);
					}
					sectionType = 1;
				}
				// -----------------------

				let className = 'section';
				if (currentMap == section.id) className += ' currentmap';

				if (sectionType === 1) {
					const posKey = section.left + '_' + section.top;

					if (renderedDungeonPos.has(posKey)) {
						className += ' is-dungeon-stacked';
					} else {
						className += ' is-dungeon';
						renderedDungeonPos.add(posKey);
					}
				}

				el.className = className;

				el.style.top = `${(section.top / C_BASEHEIGHT) * 100}%`;
				el.style.left = `${(section.left / C_BASEWIDTH) * 100}%`;
				el.style.width = `${(section.width / C_BASEWIDTH) * 100}%`;
				el.style.height = `${(section.height / C_BASEHEIGHT) * 100}%`;
				el.setAttribute('data-name', section.name);
				el.title = section.name;

				el_mapname.className = 'mapname';
				el_mapname.innerHTML = section.name;

				el_mapid.className = 'mapid';
				el_mapid.innerHTML = section.id;

				el.appendChild(el_mapname);
				el.appendChild(el_mapid);

				if (section.moblevel !== undefined && section.moblevel.length > 0) {
					const el_level = document.createElement('div');
					el_level.className = 'level-range-text';
					el_level.innerText = section.moblevel;
					el.appendChild(el_level);
				}

				mapView.appendChild(el);
			}
		}
		// airplanes, currently only in the worldmap
		// do secondary assets loading to load the airplane image
		// and then create element and append it to the DOM
		if (map.id === 'worldmap') {
			loadAirplane(mapView);
		}
		worldmap.appendChild(mapView);
		container.html(worldmap);
	}

	/**
	 * Load airplane image and append it to the DOM (.map-view element)
	 *
	 * @param {HTMLElement} mapView target where to append to
	 */
	function loadAirplane(mapView) {
		Client.loadFile(DB.INTERFACE_PATH + 'worldview_interface/wv_airplen32.bmp', data => {
			const airplane = document.createElement('img');
			airplane.id = 'midgard-airplane';
			airplane.className = 'airplane';
			airplane.decoding = 'async';
			airplane.src = data;
			// update it's position and angle
			setAirplanePosition(airplane);
			mapView.appendChild(airplane);
		});
	}

	/**
	 * Refresh airplane position
	 *
	 * @param {HTMLElement} airplane optional. if not provided, will use .worldmap #midgard-airplane
	 *
	 * @todo use server time and set position and angle
	 */
	function setAirplanePosition(airplane) {
		const el = airplane || document.querySelector('.worldmap #midgard-airplane');
		el.style.top = '35%';
		el.style.left = '35%';
		el.style.transform = `rotate(75deg)`;
	}

	/**
     * helper function to convert purple (255,0,255) color to transparent from image.
     *
     * Note: will not work on local files, needs to be hosted on
     * server for CORS (See: 'getImageData' on 'CanvasRenderingContext2D':
     * The canvas has been tainted by cross-origin data)
     *
     * @param {HTMLImageElement} img source image element
     *
     * @example
     const img = document.querySelector('img');
         img.src = `textures/map/${e.target.id}.bmp`;
         img.onload = () => adjustImageTransparency(img);
     */
	function adjustImageTransparency(img) {
		const canvas = document.createElement('canvas');
		canvas.width = img.width || img.clientWidth;
		canvas.height = img.height || img.clientHeight;

		const ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0);

		const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

		// iterate over all pixels
		// in the image data and turn purple pixels transparent
		let i = 0,
			n = imgData.data.length,
			red,
			green,
			blue,
			isPurple = false;

		for (; i < n; i += 4) {
			red = imgData.data[i];
			green = imgData.data[i + 1];
			blue = imgData.data[i + 2];

			// with exact color
			isPurple = red === 255 && blue === 255 && green === 0;
			// with some tolerance
			// let isPurple = (red >= 150 && blue >= 150) && green < 150;

			if (isPurple) {
				imgData.data[i + 3] = 0; // Set alpha channel to 0 for transparency
			}
		}
		ctx.putImageData(imgData, 0, 0);

		// replace the existing source image with the new one
		img.decoding = 'async';
		img.src = canvas.toDataURL();
	}

	/**
	 * Apply preferences once append to body
	 */
	WorldMap.onAppend = function onAppend() {
		// Apply preferences
		if (!_preferences.show) {
			this.ui.hide();
		}

		// settings
		this.settings = { episode: 98, add: [], remove: [] };
		const conf = Configs.get('worldMapSettings', { episode: 98, add: [], remove: [] });

		// Prevent stupidity
		if ('episode' in conf) {
			this.settings.episode = conf.episode;
		}

		if ('add' in conf && Array.isArray(conf.add)) {
			this.settings.add = conf.add;
		}

		if ('remove' in conf && Array.isArray(conf.remove)) {
			this.settings.remove = conf.remove;
		}

		console.log('%c[WoldMap] Episode: ', 'color:#007000', this.settings.episode);
		if (this.settings.add.length > 0) {
			console.log('%c[WoldMap] Add Maps: ', 'color:#007000', this.settings.add);
		}
		if (this.settings.remove.length > 0) {
			console.log('%c[WoldMap] Remove Maps: ', 'color:#007000', this.settings.remove);
		}

		// set maps
		setMapList();

		// resize map container & add sections
		selectMap();

		this.ui.css({
			top: 0,
			left: 0
		});
	};

	WorldMap.onRemove = function onRemove() {
		// Save preferences
		_preferences.show = this.ui.is(':visible');
		_preferences.y = 0;
		_preferences.x = 0;
		_preferences.width = 0;
		_preferences.height = 0;
		_preferences.save();
	};

	/**
	 * Show/Hide UI
	 */
	WorldMap.toggle = function toggle() {
		this.ui.toggle();

		if (this.ui.is(':visible')) {
			this.focus();
		} else {
			closeMapDialog();
		}
	};

	WorldMap.onKeyDown = function onKeyDown(event) {
		// Event.which is deprecated
		if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this.ui.is(':visible')) {
			this.toggle();
		}
	};

	/**
	 * Process shortcut
	 *
	 * @param {object} key
	 */
	WorldMap.onShortCut = function onShortCut(key) {
		switch (key.cmd) {
			case 'TOGGLE':
				this.toggle();
				break;
		}
	};

	/**
	 * Resize UI
	 */
	WorldMap.onResize = function () {
		resizeMap();
	};

	/**
	 * Update party members on map
	 *
	 * @param {object} pkt
	 */
	WorldMap.updatePartyMembers = function updatePartyMembers(pkt) {
		_partyMembersByMap = {};
		pkt.groupInfo.forEach(member => {
			if (member.AID !== Session.AID && member.state === 0) {
				const mapId = member.mapName.replace(/\.gat$/i, '');
				if (!_partyMembersByMap[mapId]) {
					_partyMembersByMap[mapId] = [];
				}
				_partyMembersByMap[mapId].push({ AID: member.AID, Name: member.characterName });
			}
		});

		WorldMap.ui.find('.worldmap .section').removeClass('membersonmap');
		for (const mapId of Object.keys(_partyMembersByMap)) {
			WorldMap.ui.find('.worldmap .section#' + mapId).addClass('membersonmap');
		}
	};

	/**
	 * Toggle all maps
	 */
	function onToggleMaps() {
		if (WorldMap.showAllMaps) {
			WorldMap.ui.find('.worldmap .section').removeClass('allmapvisible');
			WorldMap.showAllMaps = false;
		} else {
			WorldMap.ui.find('.worldmap .section').addClass('allmapvisible');
			WorldMap.showAllMaps = true;
		}
	}

	/**
	 * Show Monster level range
	 */
	function onShowLVL() {
		WorldMap.showLVLMode = !WorldMap.showLVLMode;

		Client.loadFile(DB.INTERFACE_PATH + 'checkbox_' + (WorldMap.showLVLMode ? '1' : '0') + '.bmp', function (data) {
			WorldMap.ui.find('.showlvl').css('backgroundImage', 'url(' + data + ')');
		});

		if (!WorldMap.showLVLMode) WorldMap.ui.find('.worldmap').removeClass('show-lvls');
		else WorldMap.ui.find('.worldmap').addClass('show-lvls');
	}

	/**
	 * Stop event propagation
	 * @param {object} event
	 */
	function stopPropagation(event) {
		event.stopImmediatePropagation();
		return false;
	}

	/**
	 * Closing window
	 */
	function onClose() {
		WorldMap.ui.hide();
	}

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(WorldMap);
});
