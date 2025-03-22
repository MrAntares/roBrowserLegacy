/**
 * UI/Components/Navigation/Navigation.js
 *
 * Navigation window for NAVI links
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require) {
	"use strict";

	/**
	 * Dependencies
	 */
	var jQuery = require("Utils/jquery");
	var KEYS = require("Controls/KeyEventHandler");
	var Renderer = require("Renderer/Renderer");
	var UIManager = require("UI/UIManager");
	var UIComponent = require("UI/UIComponent");
	var Altitude = require("Renderer/Map/Altitude");
	var Session = require("Engine/SessionStorage");
	var Client = require("Core/Client");
	var DB = require("DB/DBManager");
	var htmlText = require("text!./Navigation.html");
	var cssText = require("text!./Navigation.css");
	var MapPathFinder = require("./MapPathFinder");
	var getModule = require;

	/**
	 * Create Navigation component
	 */
	var Navigation = new UIComponent("Navigation", htmlText, cssText);

	/**
	 * @var {Image} minimap image
	 */
	var _map = new Image();

	/**
	 * @var {Image} arrow image for player position
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
	 * @var {CanvasRenderingContext2D} canvas context
	 */
	var _ctx = null;

	/**
	 * @var {Array} town information
	 */
	var _towninfo = [];

	/**
	 * @var {Array} markers on the map
	 */
	var _markers = [];

	/**
	 * @var {Array} path points
	 */
	var _path = [];

	/**
	 * @var {number} Last time the path was recalculated
	 */
	var _lastPathUpdate = 0;

	/**
	 * @var {number} Minimum time between path recalculations (in ms)
	 */
	var _pathUpdateThrottle = 500; // Update at most every 500ms

	/**
	 * @var {boolean} Lock for path update
	 */
	var _pathUpdateLock = false;

	/**
	 * @var {Worker} pathfinding worker
	 */
	var _pathFindingWorker = null;

	/**
	 * @var {Object} map data
	 * @property {number} width - Map width
	 * @property {number} height - Map height
	 * @property {Array} cells - Map cells
	 * @property {Array} cellTypes - Map cell types
	 * @property {number} walkableType - Walkable type
	 * @property {string} map - Map name
	 */
	var _mapData = null;

	/**
	 * @var {Object} target data
	 * @property {number} x - X coordinate
	 * @property {number} y - Y coordinate
	 * @property {string} map - Map name
	 * @property {string} displayName - Display name
	 */
	var _targetData = null;

	/**
	 * @var {Object} target data
	 * @property {number} x - X coordinate
	 * @property {number} y - Y coordinate
	 * @property {string} map - Map name
	 * @property {string} displayName - Display name
	 */
	var _finalTargetData = null;

	/**
	 * Local utility functions
	 */

	/**
	 * Normalize a map name (remove .gat extension)
	 *
	 * @param {string} mapName - Map name to normalize
	 * @returns {string} Normalized map name
	 */
	function normalizeMapName(mapName) {
		// Remove .gat extension and convert to lowercase
		mapName = mapName.replace(/\.gat$/, "").toLowerCase();

		// Handle map variations with _a, _b, _c, _d suffixes
		mapName = mapName.replace(/^(.+)_[a-d]$/, "$1");

		return mapName;
	}

	/**
	 * Format coordinates with consistent styling
	 *
	 * @param {number} x - X coordinate
	 * @param {number} y - Y coordinate
	 * @param {Object} options - Options for formatting
	 * @param {boolean} options.floor - Whether to floor the coordinates (default: true)
	 * @returns {string} Formatted coordinates
	 */
	function formatCoordinates(x, y, options) {
		options = options || {};
		var shouldFloor = options.floor !== false;

		if (shouldFloor) {
			return Math.floor(x) + "," + Math.floor(y);
		}
		return x + "," + y;
	}

	/**
	 * Format target coordinates text with consistent styling
	 *
	 * @param {number} x - X coordinate
	 * @param {number} y - Y coordinate
	 * @param {Object} options - Options for formatting
	 * @param {string} options.targetMap - Target map name for cross-map paths
	 * @param {number} options.warpCount - Number of warps for multi-hop paths
	 * @param {boolean} options.noPathFound - Whether no path was found
	 * @returns {string} Formatted text
	 */
	function formatTargetCoordinates(x, y, options) {
		options = options || {};

		var text = Math.floor(x) + "," + Math.floor(y);

		if (options.noPathFound) {
			text += " (no path found)";
		} else if (options.targetMap && options.targetMap !== getCurrentMap()) {
			text += " (" + options.targetMap + ")";
		}

		return text;
	}

	/**
	 * Format location title with consistent styling
	 *
	 * @param {string} currentMap - Current map name
	 * @param {string} targetMap - Target map name (optional)
	 * @param {string} displayName - Display name to use instead of map name
	 * @returns {string} Formatted title
	 */
	function formatLocationTitle(currentMap, targetMap, displayName) {
		var text;

		if (!displayName && targetMap && currentMap !== targetMap) {
			text = "[" + currentMap + " → " + targetMap;

			text += "]";
		} else {
			text = "[" + (displayName || currentMap) + "]";
		}

		return text;
	}

	/**
	 * Convert map coordinates to screen coordinates
	 *
	 * @param {number} x - Map X coordinate
	 * @param {number} y - Map Y coordinate
	 * @param {number} width - Canvas width
	 * @param {number} height - Canvas height
	 * @returns {Object} Screen coordinates {x, y}
	 */
	function mapToScreen(x, y, width, height) {
		// Calculate scaling to fit the map image to the view
		var scaleX = width / _mapData.width;
		var scaleY = height / _mapData.height;
		var scale = Math.min(scaleX, scaleY);

		// Calculate the scaled map dimensions
		var mapWidth = _mapData.width * scale;
		var mapHeight = _mapData.height * scale;

		// Calculate offsets to center the map
		var offsetX = (width - mapWidth) / 2;
		var offsetY = (height - mapHeight) / 2;

		// For the Y coordinate, we need to invert it because the game's coordinate system
		// has Y increasing as you go south, but on the screen Y increases as you go down
		var screenX = (x / _mapData.width) * mapWidth + offsetX;
		var screenY = ((_mapData.height - y) / _mapData.height) * mapHeight + offsetY;

		return { x: screenX, y: screenY };
	}

	/**
	 * Get the current map name
	 *
	 * @returns {string} Current map name
	 */
	function getCurrentMap() {
		var MapRenderer = getModule("Renderer/MapRenderer");
		if (MapRenderer && MapRenderer.currentMap) {
			return normalizeMapName(MapRenderer.currentMap);
		}
	}

	/**
	 * Get the current player position
	 *
	 * @returns {Object} Current player position {x, y}
	 */
	function getPlayerPosition() {
		var currentX = Math.ceil(Session.Entity.position[0]);
		var currentY = Math.ceil(Session.Entity.position[1]);

		return { x: currentX, y: currentY };
	}

	/**
	 * Terminate the pathfinding worker
	 */
	function terminatePathFindingWorker() {
		// Terminate worker
		if (_pathFindingWorker) {
			_pathFindingWorker.terminate();
			_pathFindingWorker = null;
		}
	}

	/**
	 * Initialize the pathfinding worker
	 */
	function initializePathFindingWorker() {
		if (!_pathFindingWorker) {
			_pathFindingWorker = new Worker(require.toUrl("./PathFindingWorker.js"));
			_pathFindingWorker.id = (new Date()).getTime().toString();
			_pathFindingWorker.onmessage = function (e) {
				var data = e.data;
				switch (data.type) {
					case "pathResult":
						_pathUpdateLock = false;
						if (_finalTargetData && data.path && data.workerId === _pathFindingWorker.id) {
							var mapName = getCurrentMap();
							_path = data.path;
							if (_path.length > 0) {
								this.updateTargetText();
								this.setTargetCoordinatesBlinking(false);
								this.setLocationTitle(mapName, _finalTargetData.map, _finalTargetData.displayName);
							} else {
								this.updateTargetText(true);
								this.setTargetCoordinatesBlinking(false);
								this.setLocationTitle(mapName, null);
							}
						}
						break;
				}
			}.bind(Navigation);
		}
	}

	function resetPathFindingWorker() {
		terminatePathFindingWorker();
		initializePathFindingWorker();
	}

	/**
	 * Convert screen coordinates to map coordinates
	 *
	 * @param {number} screenX - X coordinate on screen
	 * @param {number} screenY - Y coordinate on screen
	 * @returns {Object} Map coordinates {x, y}
	 */
	Navigation.screenToMapCoordinates = function screenToMapCoordinates(screenX, screenY) {
		var width = 280;
		var height = 230;

		// Calculate scaling to fit the map image to the view
		var scaleX = width / _mapData.width;
		var scaleY = height / _mapData.height;
		var scale = Math.min(scaleX, scaleY);

		// Calculate the scaled map dimensions
		var scaledMapWidth = _mapData.width * scale;
		var scaledMapHeight = _mapData.height * scale;

		// Calculate offsets from the centered map
		var offsetX = (width - scaledMapWidth) / 2;
		var offsetY = (height - scaledMapHeight) / 2;

		// Convert screen coordinates back to map coordinates
		var mapX = ((screenX - offsetX) / scaledMapWidth) * _mapData.width;
		// Invert Y coordinate to match the game's coordinate system
		var mapY = _mapData.height - ((screenY - offsetY) / scaledMapHeight) * _mapData.height;

		// Clamp to map boundaries
		mapX = Math.max(0, Math.min(_mapData.width, mapX));
		mapY = Math.max(0, Math.min(_mapData.height, mapY));

		return { x: Math.floor(mapX), y: Math.floor(mapY) };
	};

	/**
	 * Initialize component
	 */
	Navigation.init = function init() {
		// Initialize _mapData.walkableType from Altitude.TYPE.WALKABLE
		_mapData = {
			walkableType: Altitude.TYPE.WALKABLE,
		};

		this.ui.css({
			top: Math.max(0, Math.min(Renderer.height - this.ui.height(), 200)),
			left: Math.max(0, Math.min(Renderer.width - this.ui.width(), 200)),
		});

		// Get canvas context
		var canvas = document.createElement("canvas");
		canvas.width = 280;
		canvas.height = 230;
		_ctx = canvas.getContext("2d");
		this.ui.find(".map-display").append(canvas);

		// Load arrow image
		Client.loadFile(DB.INTERFACE_PATH + "map/map_arrow.bmp", function (dataURI) {
			_arrow.src = dataURI;
		});

		// Load town info icons
		Client.loadFile(DB.INTERFACE_PATH + "information/store.bmp", function (dataURI) {
			_toolDealer.src = dataURI;
		});
		Client.loadFile(DB.INTERFACE_PATH + "information/weaponshop.bmp", function (dataURI) {
			_weaponDealer.src = dataURI;
		});
		Client.loadFile(DB.INTERFACE_PATH + "information/armorshops.bmp", function (dataURI) {
			_armorDealer.src = dataURI;
		});
		Client.loadFile(DB.INTERFACE_PATH + "information/smithy.bmp", function (dataURI) {
			_blacksmith.src = dataURI;
		});
		Client.loadFile(DB.INTERFACE_PATH + "information/guide.bmp", function (dataURI) {
			_guide.src = dataURI;
		});
		Client.loadFile(DB.INTERFACE_PATH + "information/inn.bmp", function (dataURI) {
			_inn.src = dataURI;
		});
		Client.loadFile(DB.INTERFACE_PATH + "information/kafra.bmp", function (dataURI) {
			_kafra.src = dataURI;
		});

		// Bind events
		this.ui.find(".close").click(this.hide.bind(this));
		this.ui.find(".search-button").click(this.onSearch.bind(this));
		this.ui.find(".search-input").keypress(
			function (e) {
				if (e.which === KEYS.ENTER) {
					this.onSearch();
				}
			}.bind(this),
		);

		// Focus handling for search input
		this.ui.find(".search-input").focus(
			function () {
				// If there are search results, show them when focusing the input
				var resultsContainer = this.ui.find(".search-results");
				if (resultsContainer.length > 0 && resultsContainer.children().length > 0) {
					resultsContainer.show();
				}
			}.bind(this),
		);

		// Hide search results when clicking outside
		jQuery(document).click(
			function (e) {
				if (!jQuery(e.target).closest(".search-results, .search-input, .search-button, .search-type").length) {
					this.ui.find(".search-results").hide();
				}
			}.bind(this),
		);

		// Map click event for navigation
		this.ui.find(".map-display").click(this.onMapClick.bind(this));

		// Mouse move event for displaying coordinates
		this.ui.find(".map-display").mousemove(this.onMapMouseMove.bind(this));

		// Mouse leave event to reset coordinates display
		this.ui.find(".map-display").mouseleave(this.onMapMouseLeave.bind(this));

		this.draggable(this.ui.find(".titlebar"));

		// Hide the UI initially
		this.ui.hide();
	};

	/**
	 * Once append to the DOM
	 */
	Navigation.onAppend = function onAppend() {
		// Clear path for clean render
		this.clearPath();

		// Seems like "EscapeWindow" is execute first, push it before.
		var events = jQuery._data(window, "events").keydown;
		events.unshift(events.pop());

		// Start rendering
		Renderer.render(this.render.bind(this));

		// Initialize pathfinding worker
		initializePathFindingWorker();

		// Load the current map after initializing the worker
		var mapName = getCurrentMap();
		this.loadMap(mapName);

		if (_finalTargetData) {
			var currentPos = getPlayerPosition();
			this.navigateTo({
				startMap: mapName,
				startX: currentPos.x,
				startY: currentPos.y,
				endMap: _finalTargetData.map,
				endX: _finalTargetData.x,
				endY: _finalTargetData.y,
				displayName: _finalTargetData.displayName,
			});
		}
	};

	/**
	 * Once removed from DOM
	 */
	Navigation.onRemove = function onRemove() {
		this.clearPath();
		terminatePathFindingWorker();
	};

	/**
	 * Handle search button click
	 */
	Navigation.onSearch = function onSearch() {
		var query = this.ui.find(".search-input").val().trim();
		var type = this.ui.find(".search-type").val();

		if (query.length < 2) {
			return;
		}

		// Search for NPCs and MOBs
		var results = DB.searchNavigation(query, type);

		// Display search results
		this.displaySearchResults(results);
	};

	/**
	 * Display search results
	 *
	 * @param {Array} results - Array of search results
	 */
	Navigation.displaySearchResults = function displaySearchResults(results) {
		// Clear any existing results
		var resultsContainer = this.ui.find(".search-results");
		if (resultsContainer.length === 0) {
			// Create results container if it doesn't exist
			resultsContainer = jQuery('<div class="search-results"></div>');
			this.ui.find(".content").append(resultsContainer);
		} else {
			resultsContainer.empty();
		}

		// If no results, show a message
		if (results.length === 0) {
			resultsContainer.append('<div class="no-results">No results found</div>');
			resultsContainer.show();
			return;
		}

		// Create results list
		var resultsList = jQuery('<ul class="results-list"></ul>');
		resultsContainer.append(resultsList);

		// Add each result to the list
		for (var i = 0; i < results.length; i++) {
			var result = results[i];
			var resultItem = jQuery('<li class="result-item"></li>');

			// Add type icon (NPC or MOB)
			var typeIcon = result.type === "NPC" ? "npc_icon" : "mob_icon";
			resultItem.append('<span class="result-type ' + typeIcon + '">' + result.type + "</span>");

			// Add result name
			resultItem.append('<span class="result-name">' + result.name + "</span>");

			// Add map name
			resultItem.append('<span class="result-map">' + result.mapName + "</span>");

			// Store result data for navigation
			resultItem.data("result", result);

			// Add click handler using a closure to capture the current result
			(function (self, currentResult) {
				resultItem.on("click", function () {
					self.navigateToSearchResult(currentResult);
				});
			})(this, result);

			resultsList.append(resultItem);
		}

		// Show the results container
		resultsContainer.show();
	};

	/**
	 * Navigate to a search result
	 *
	 * @param {Object} result - The search result to navigate to
	 */
	Navigation.navigateToSearchResult = function navigateToSearchResult(result) {
		// Validate result
		if (!result || !result.mapName) {
			return;
		}

		// Store the target result for later reference
		this.targetResult = result;

		// Get current map and position
		var currentMap = getCurrentMap();
		var currentPos = getPlayerPosition();

		// Use our unified navigation function
		this.navigateTo({
			startMap: currentMap,
			startX: currentPos.x,
			startY: currentPos.y,
			endMap: result.mapName,
			endX: result.x,
			endY: result.y,
			displayName: result.name,
		});

		// Hide the search results
		this.ui.find(".search-results").hide();
	};

	/**
	 * Find the closest walkable cell to the given coordinates
	 *
	 * @param {number} x - X coordinate
	 * @param {number} y - Y coordinate
	 * @param {number} maxRadius - Maximum search radius (default: 10)
	 * @returns {Object|null} The closest walkable cell coordinates or null if none found
	 */
	Navigation.findClosestWalkableCell = function findClosestWalkableCell(x, y, maxRadius) {
		// If the cell is already walkable, return it
		if (x >= 0 && x < _mapData.width && y >= 0 && y < _mapData.height) {
			var index = x + y * _mapData.width;
			var cellType = _mapData.cellTypes[index];

			if (cellType & _mapData.walkableType) {
				return { x: x, y: y };
			}
		}

		maxRadius = maxRadius || 10;
		var radius = 1;
		var bestDistance = Infinity;
		var bestCell = null;

		// Search in increasing radius until we find a walkable cell or reach maxRadius
		while (radius <= maxRadius) {
			// Check cells in a square around the target
			for (var offsetY = -radius; offsetY <= radius; offsetY++) {
				for (var offsetX = -radius; offsetX <= radius; offsetX++) {
					// Only check cells on the perimeter of the square
					if (Math.abs(offsetX) !== radius && Math.abs(offsetY) !== radius) {
						continue;
					}

					var cx = x + offsetX;
					var cy = y + offsetY;

					// Check if cell is within map bounds
					if (cx >= 0 && cx < _mapData.width && cy >= 0 && cy < _mapData.height) {
						var index = cx + cy * _mapData.width;
						var cellType = _mapData.cellTypes[index];

						// Check if cell is walkable
						if (cellType & _mapData.walkableType) {
							// Calculate distance to original point
							var distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
							if (distance < bestDistance) {
								bestDistance = distance;
								bestCell = { x: cx, y: cy };
							}
						}
					}
				}
			}

			// If we found a walkable cell, return it
			if (bestCell) {
				return bestCell;
			}

			radius++;
		}

		// If no walkable cell found, return null instead of the original coordinates
		return null;
	};

	/**
	 * Handle map click event
	 *
	 * @param {Object} event - Mouse event
	 */
	Navigation.onMapClick = function onMapClick(event) {
		var mapDisplay = this.ui.find(".map-display");
		var offset = mapDisplay.offset();
		var x = Math.floor(event.pageX - offset.left);
		var y = Math.floor(event.pageY - offset.top);

		// Convert screen coordinates to map coordinates
		var mapCoords = this.screenToMapCoordinates(x, y);

		// Get current map and position
		var currentMap = getCurrentMap();
		var currentPos = getPlayerPosition();

		// Use the unified navigation function with the current map as both start and end map
		this.navigateTo({
			startMap: currentMap,
			startX: currentPos.x,
			startY: currentPos.y,
			endMap: currentMap,
			endX: mapCoords.x,
			endY: mapCoords.y,
			displayName: "Map Click",
		});
	};

	/**
	 * Load a map for display
	 *
	 * @param {string} mapName - The name of the map to load
	 * @param {string} displayName - Optional display name for the map
	 */
	Navigation.loadMap = function loadMap(mapName, displayName) {
		// Ensure we have the map name without extension for loading
		var mapBaseName = mapName.replace(/\..*/, "");

		// Load town info
		_towninfo = DB.getTownInfo(mapBaseName) || [];

		// Get the correct map path using DB.mapalias
		var bmpPath = DB.INTERFACE_PATH.replace("data/texture/", "") + "map/" + mapBaseName + ".bmp";
		bmpPath = bmpPath.replace(/\//g, "\\"); // normalize path separator
		bmpPath = DB.mapalias[bmpPath] || bmpPath;

		// Load the map image using the correct bmpPath
		Client.loadFile("data/texture/" + bmpPath, function (dataURI) {
			if (dataURI) {
				_map.src = dataURI;
			} else {
				// If map not found, use a placeholder image
				_map.src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
			}
		});

		// Get the correct map path using DB.mapalias
		var gatPath = mapBaseName + ".gat";
		gatPath = gatPath.replace(/\//g, "\\"); // normalize path separator
		gatPath = DB.mapalias[gatPath] || gatPath;

		// Load the GAT file for pathfinding
		Client.loadFile(
			"data/" + gatPath,
			function (gatData) {
				if (gatData) {
					// If we have GAT data, use it directly for pathfinding
					if (gatData.cells && gatData.width && gatData.height) {
						// Update _mapData with the new map information
						_mapData.width = gatData.width;
						_mapData.height = gatData.height;
						_mapData.cells = gatData.cells;

						// Create cell types array for the worker and store in _mapData
						var cellCount = gatData.width * gatData.height;
						var cellTypes = new Uint8Array(cellCount);

						// Extract cell types directly from GAT data
						// Each cell in gatData has 5 values, with the type at index 4
						for (var i = 0; i < cellCount; i++) {
							var cellIndex = i * 5 + 4; // Get the type value (5th value in each cell)
							cellTypes[i] = gatData.cells[cellIndex];
						}

						// Store cell types in _mapData
						_mapData.cellTypes = cellTypes;
						_mapData.map = mapBaseName;
					}
				}
			}.bind(this),
		);

		this.setMapNameText(mapName);
	};

	/**
	 * Clear the end marker
	 */
	Navigation.clear = function clear() {
		// Clear the path
		this.clearPath();
		_finalTargetData = null;
		_targetData = null;

		// Hide the target coordinates display
		this.ui.find(".target-info").hide();
	};

	Navigation.clearPath = function clearPath() {
		_path = [];
		_lastPathUpdate = 0;
		_pathUpdateLock = false;
	};

	/**
	 * Add a marker to the map
	 *
	 * @param {number} x - X coordinate
	 * @param {number} y - Y coordinate
	 * @param {string} color - Color of the marker
	 * @param {string} label - Optional label for the marker
	 */
	Navigation.addMarker = function addMarker(x, y, color, label) {
		_markers.push({
			x: x,
			y: y,
			color: color || "rgb(255,0,0)",
			label: label || "",
		});
	};

	/**
	 * Render the map and markers
	 */
	Navigation.render = function render(tick) {
		if (!this.ui.is(":visible")) {
			return;
		}

		var width = 280;
		var height = 230;
		var ctx = _ctx;

		// Check if player position has changed
		var currentMap = getCurrentMap();
		var currentPos = getPlayerPosition();
		if (_finalTargetData && tick - _lastPathUpdate > _pathUpdateThrottle && !_pathUpdateLock) {
			// Recalculate path if we have an end position, but throttle updates
			this.navigateTo({
				startMap: currentMap,
				startX: currentPos.x,
				startY: currentPos.y,
				endMap: _finalTargetData.map,
				endX: _finalTargetData.x,
				endY: _finalTargetData.y,
				displayName: _finalTargetData.displayName
			});
			_lastPathUpdate = tick;
		}

		// Clear canvas
		ctx.clearRect(0, 0, width, height);

		// Draw map background
		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, width, height);

		// Draw the map image if loaded
		if (_map.complete && _map.width) {
			// Calculate scaling to fit the map image to the view
			var scaleX = width / _mapData.width;
			var scaleY = height / _mapData.height;
			var scale = Math.min(scaleX, scaleY);

			// Draw the map with proper scaling and position
			ctx.save();
			ctx.translate(width / 2, height / 2);
			ctx.scale(scale, scale);
			ctx.translate(-_mapData.width / 2, -_mapData.height / 2);
			ctx.drawImage(_map, 0, 0, _mapData.width, _mapData.height);
			ctx.restore();
		}

		var mapToScreenBound = (x, y) => {
			return mapToScreen(x, y, width, height);
		};

		// Draw town info icons
		if (_towninfo && _towninfo.length) {
			for (var i = 0; i < _towninfo.length; i++) {
				var info = _towninfo[i];
				var pos = mapToScreenBound(info.X, info.Y);

				var img;
				switch (info.Type) {
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
					default:
						continue;
				}

				if (img.complete && img.width) {
					ctx.drawImage(img, pos.x - img.width / 2, pos.y - img.height / 2);
				}
			}
		}

		// Draw the path
		if (_path && _path.length > 0) {
			ctx.lineWidth = 2;

			// Draw each path segment
			let currentSegment = [];
			for (let i = 0; i < _path.length; i++) {
				const point = _path[i];
				const pos = mapToScreenBound(point.x, point.y);

				// Start a new segment
				if (currentSegment.length === 0) {
					currentSegment.push(pos);
					continue;
				}

				// If this is a warp point or the last point, draw the current segment
				if (point.isWarp || i === _path.length - 1) {
					currentSegment.push(pos);

					// Draw the path segment
					ctx.strokeStyle = "cyan";
					ctx.beginPath();
					ctx.moveTo(currentSegment[0].x, currentSegment[0].y);
					for (let j = 1; j < currentSegment.length; j++) {
						ctx.lineTo(currentSegment[j].x, currentSegment[j].y);
					}
					ctx.stroke();

					// Draw warp marker if this is a warp point
					if (point.isWarp) {
						// Draw warp entry point
						ctx.beginPath();
						ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
						ctx.fillStyle = "yellow";
						ctx.fill();

						// If there's a next point, it's the warp exit
						if (i + 1 < _path.length) {
							const exitPos = mapToScreenBound(_path[i + 1].x, _path[i + 1].y);

							// Draw warp exit point
							ctx.beginPath();
							ctx.arc(exitPos.x, exitPos.y, 3, 0, Math.PI * 2);
							ctx.fillStyle = "yellow";
							ctx.fill();

							// Start new segment from the exit point
							currentSegment = [exitPos];
							i++; // Skip the exit point in the next iteration
						} else {
							// Start new segment from this point
							currentSegment = [pos];
						}
					} else {
						// For non-warp points (like the end of the path)
						currentSegment = [pos];
					}
				} else {
					// Add point to current segment
					currentSegment.push(pos);
				}
			}
		}

		// Draw end marker (target position)
		if (_targetData) {
			var lastPoint = mapToScreenBound(_targetData.x, _targetData.y);
			ctx.fillStyle = "red";
			ctx.beginPath();
			ctx.arc(lastPoint.x, lastPoint.y, 3, 0, Math.PI * 2);
			ctx.fill();
		}

		// Draw start marker (player position)
		var startPos = mapToScreenBound(currentPos.x, currentPos.y);
		// Draw player arrow if loaded
		if (_arrow.complete && _arrow.width) {
			ctx.save();
			ctx.translate(startPos.x, startPos.y);

			// Rotate arrow based on player direction if available
			ctx.rotate(((Session.Entity.direction + 4) * 45 * Math.PI) / 180);
			ctx.drawImage(_arrow, -_arrow.width / 2, -_arrow.height / 2);
			ctx.restore();
		}

		// Draw custom markers
		for (var i = 0; i < _markers.length; i++) {
			var marker = _markers[i];
			var pos = mapToScreenBound(marker.x, marker.y);

			ctx.fillStyle = marker.color;
			ctx.beginPath();
			ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
			ctx.fill();

			if (marker.label) {
				ctx.fillStyle = "#fff";
				ctx.font = "10px Arial";
				ctx.fillText(marker.label, pos.x + 5, pos.y + 3);
			}
		}
	};

	/**
	 * Update the target coordinates text
	 *
	 * @param {boolean} noPathFound - Whether to show "no path found" message
	 */
	Navigation.updateTargetText = function updateTargetText(noPathFound) {
		this.ui.find(".target-info").show();

		// Use the existing setTargetCoordinatesText function with the noPathFound option
		// This will properly format the text using formatTargetCoordinates
		if (_finalTargetData) {
			this.setTargetCoordinatesText(_finalTargetData.x, _finalTargetData.y, {
				noPathFound: noPathFound,
				targetMap: _finalTargetData.map,
			});
		}
	};

	/**
	 * Set target coordinates text with proper formatting
	 *
	 * @param {number} x - X coordinate
	 * @param {number} y - Y coordinate
	 * @param {Object} options - Options for formatting
	 */
	Navigation.setTargetCoordinatesText = function setTargetCoordinatesText(x, y, options) {
		if (!this.ui) return;

		var text = formatTargetCoordinates(x, y, options);
		this.ui.find(".target-coordinates").text(text);
		this.ui.find(".target-coordinates").show();
		this.ui.find(".target-info").show();
	};

	Navigation.setTargetCoordinatesBlinking = function setTargetCoordinatesBlinking(blinking) {
		if (!this.ui) return;

		var targetCoordinates = this.ui.find(".target-coordinates");

		if (blinking) {
			// Start blinking effect if not already blinking
			if (!targetCoordinates.data("blinking")) {
				targetCoordinates.data("blinking", true);

				// Store original color
				var originalColor = targetCoordinates.css("color") || "#ffffff";
				targetCoordinates.data("originalColor", originalColor);

				// Set up interval for fading effect
				var fadeStep = 0;
				var fadeDirection = -1; // Start by fading out
				var fadeInterval = setInterval(function() {
					fadeStep += fadeDirection * 0.1;

					// Change direction when reaching limits
					if (fadeStep <= 0.3) {
						fadeDirection = 1; // Start fading in
					} else if (fadeStep >= 1) {
						fadeDirection = -1; // Start fading out
					}

					// Apply opacity
					targetCoordinates.css("opacity", fadeStep);
				}, 50); // Update every 50ms for smooth animation

				// Store interval ID for later cleanup
				targetCoordinates.data("fadeInterval", fadeInterval);
			}
		} else {
			// Stop fading effect
			if (targetCoordinates.data("blinking")) {
				clearInterval(targetCoordinates.data("fadeInterval"));
				targetCoordinates.css("opacity", 1); // Restore full opacity
				targetCoordinates.css("color", targetCoordinates.data("originalColor"));
				targetCoordinates.data("blinking", false);
			}
		}
	}

	/**
	 * Set location title with proper formatting
	 *
	 * @param {string} currentMap - Current map name
	 * @param {string} targetMap - Target map name (optional)
	 * @param {Object} options - Options for formatting
	 */
	Navigation.setLocationTitle = function setLocationTitle(currentMap, targetMap, displayName) {
		if (!this.ui) return;

		var title = formatLocationTitle(currentMap, targetMap, displayName);
		this.ui.find(".location-title").text(title);
	};

	/**
	 * Set coordinates text with proper formatting
	 *
	 * @param {number} x - X coordinate
	 * @param {number} y - Y coordinate
	 * @param {Object} options - Options for formatting
	 */
	Navigation.setCoordinatesText = function setCoordinatesText(x, y, options) {
		if (!this.ui) return;

		var text = formatCoordinates(x, y, options);
		this.ui.find(".coordinates").text(text);
	};

	/**
	 * Set map name text with proper formatting
	 *
	 * @param {string} mapName - Map name
	 * @param {Object} options - Options for formatting
	 */
	Navigation.setMapNameText = function setMapNameText(mapName) {
		if (!this.ui) return;

		this.ui.find(".map-name").text(normalizeMapName(mapName));
	};

	/**
	 * Set mouse coordinates text with proper formatting
	 *
	 * @param {number} x - X coordinate
	 * @param {number} y - Y coordinate
	 * @param {Object} options - Options for formatting
	 */
	Navigation.setMouseCoordinatesText = function setMouseCoordinatesText(x, y, options) {
		if (!this.ui) return;

		var text = formatCoordinates(x, y, options);
		this.ui.find(".mouse-coordinates").text(text);
	};

	/**
	 * Find a path between two points using a simplified A* algorithm in a web worker
	 *
	 * @param {number} startX - Start X coordinate
	 * @param {number} startY - Start Y coordinate
	 * @param {number} endX - End X coordinate
	 * @param {number} endY - End Y coordinate
	 * @returns {Array} Array of path points
	 */
	Navigation.findPath = function findPath(startX, startY, endX, endY) {
		// Send path request to worker
		if (_pathFindingWorker && !_pathUpdateLock) {
			_pathUpdateLock = true;

			// Get warp information for the current map
			var naviLinkTable = DB.getNaviLinkTable();
			var currentMap = getCurrentMap();
			var warps = [];

			// Process NaviLinkTable to find same-map warps
			if (naviLinkTable && naviLinkTable.length) {
				for (var i = 0; i < naviLinkTable.length; i++) {
					var warp = naviLinkTable[i];
					if (!warp || warp.length < 11) continue;

					var srcMap = warp[0].replace(/\.gat$/, "").toLowerCase();
					var destMap = warp[8].replace(/\.gat$/, "").toLowerCase();

					// Only include warps that start and end in the current map
					if (srcMap === currentMap && destMap === currentMap) {
						warps.push({
							id: warp[1],
							type: warp[2],
							srcX: warp[6],
							srcY: warp[7],
							destX: warp[9],
							destY: warp[10]
						});
					}
				}
			}

			// Add warps to mapData
			_mapData.warps = warps;

			_pathFindingWorker.postMessage({
				type: "findPath",
				startX: startX,
				startY: startY,
				endX: endX,
				endY: endY,
				mapData: _mapData,
				workerId: _pathFindingWorker.id,
				existingPath: _path
			});
		}
	};

	/**
	 * Toggle the navigation window (show/hide)
	 */
	Navigation.toggle = function toggle() {
		if (this.ui.is(":visible")) {
			this.hide();
		} else {
			this.show();
		}
	};

	/**
	 * Show the navigation window
	 */
	Navigation.show = function show() {
		// Initialize variables
		this.clearPath();
		initializePathFindingWorker();

		// Hide coordinate displays initially
		this.ui.find(".mouse-info").hide();
		this.ui.find(".target-info").hide();

		// Get current map name and player position
		var mapName = getCurrentMap();
		var currentPos = getPlayerPosition();

		// Use navigateTo to recalculate the path
		if (_finalTargetData) {
			this.navigateTo({
				startMap: mapName,
				startX: currentPos.x,
				startY: currentPos.y,
				endMap: _finalTargetData.map,
				endX: _finalTargetData.x,
				endY: _finalTargetData.y,
				displayName: _finalTargetData.displayName,
			});
		}

		// Update map name display
		this.setMapNameText(mapName);

		// Set the location title if not already set
		if (!this.ui.find(".location-title").text()) {
			this.setLocationTitle(mapName, null);
		}

		this.ui.show();
	};

	/**
	 * Hide the navigation window
	 */
	Navigation.hide = function hide() {
		// Don't clear any data, just hide the UI
		this.ui.hide();
		terminatePathFindingWorker();
	};

	/**
	 * Handle mouse movement over the map to display coordinates
	 *
	 * @param {MouseEvent} event - The mouse event
	 */
	Navigation.onMapMouseMove = function onMapMouseMove(event) {
		var mapDisplay = this.ui.find(".map-display");
		var offset = mapDisplay.offset();
		var x = Math.floor(event.pageX - offset.left);
		var y = Math.floor(event.pageY - offset.top);

		// Convert screen coordinates to map coordinates
		var mapCoords = this.screenToMapCoordinates(x, y);
		var mapX = Math.floor(mapCoords.x);
		var mapY = Math.floor(mapCoords.y);

		// Update the mouse coordinates display
		this.ui.find(".mouse-info").show();
		this.setMouseCoordinatesText(mapX, mapY);
	};

	/**
	 * Handle mouse leaving the map area
	 */
	Navigation.onMapMouseLeave = function onMapMouseLeave() {
		// Hide the mouse coordinates display
		this.ui.find(".mouse-info").hide();
	};

	/**
	 * Set the content of the navigation window based on NAVI info
	 *
	 * @param {string} naviInfo - The NAVI info string (mapname,x,y,0,000,flag)
	 * @param {string} displayName - Optional display name for the location
	 */
	Navigation.setNaviInfo = function setNaviInfo(naviInfo, displayName) {
		// Parse the NAVI info
		var parts = naviInfo.split(",");
		if (parts.length < 3) {
			return;
		}

		var mapName = parts[0];
		var x = parseInt(parts[1], 10);
		var y = parseInt(parts[2], 10);

		// Clear the search input
		this.ui.find(".search-input").val("");

		// Get current map and position
		var currentMap = getCurrentMap();
		var currentPos = getPlayerPosition();

		// Use the unified navigation function
		this.navigateTo({
			startMap: currentMap,
			startX: currentPos.x,
			startY: currentPos.y,
			endMap: mapName,
			endX: x,
			endY: y,
			displayName: displayName,
		});
	};

	/**
	 * Wait for map data to be loaded
	 *
	 * @param {Function} callback - Callback function to call when map data is loaded
	 */
	Navigation.waitForMapData = function waitForMapData(callback) {
		if (!_mapData || _mapData.map !== getCurrentMap()) {
			setTimeout(function () {
				Navigation.waitForMapData(callback);
			}, 100);
		} else {
			callback.bind(this)();
		}
	}

	/**
	 * Unified navigation function that handles both same-map and cross-map navigation
	 *
	 * @param {Object} options - Navigation options
	 * @param {string} options.startMap - Starting map name
	 * @param {number} options.startX - Starting X coordinate
	 * @param {number} options.startY - Starting Y coordinate
	 * @param {string} options.endMap - Destination map name
	 * @param {number} options.endX - Destination X coordinate
	 * @param {number} options.endY - Destination Y coordinate
	 * @param {string} options.displayName - Optional display name for the destination
	 */
	Navigation.navigateTo = function navigateTo(options) {
		// Normalize map names
		var startMap = normalizeMapName(options.startMap);
		var endMap = normalizeMapName(options.endMap);
		var displayName = options.displayName;

		if (_finalTargetData && (_finalTargetData.map !== endMap || _finalTargetData.x !== options.endX || _finalTargetData.y !== options.endY)) {
			this.clearPath();
			resetPathFindingWorker();
			this.setTargetCoordinatesText(options.endX, options.endY, {
				targetMap: endMap,
			});
			this.setTargetCoordinatesBlinking(true);
		}

		// Store the target information
		_finalTargetData = {
			map: endMap,
			x: options.endX,
			y: options.endY,
			displayName: displayName,
		};

		// Get warp types based on Services checkbox
		var warpTypes = [200, 201]; // Default warp types (free)
		if (this.ui.find('.services-toggle').is(':checked')) {
			warpTypes = [200, 201, 202, 203, 204, 205]; // Include service warps (includes paid warps)
		}

		// Cross-map navigation - find path to next warp
		var path = MapPathFinder.findPathBetweenMaps(startMap, options.startX, options.startY, endMap, options.endX, options.endY, warpTypes);

		if (path && path.length > 0) {
			// Get the first segment (path to next warp)
			var target = path[0];

			this.waitForMapData(function () {
				var walkableCell = this.findClosestWalkableCell(target.x, target.y);

				// Find path
				if (walkableCell) {
					_targetData = {
						x: walkableCell.x,
						y: walkableCell.y,
						map: target.map,
						displayName: displayName,
					};
					this.findPath(options.startX, options.startY, _targetData.x, _targetData.y);
				} else {
					this.clear();
				}
			});
		}
	};

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(Navigation);
});
