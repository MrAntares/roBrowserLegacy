/**
 * UI/Components/Navigation/MapPathFinder.js
 *
 * Map-to-map pathfinding functionality
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

define(function (require) {
	'use strict';

	// Dependencies
	var DB = require('DB/DBManager');

	/**
	 * MapPathFinder namespace
	 */
	var MapPathFinder = {};

	/**
	 * Find a path between maps using Dijkstra's algorithm
	 *
	 * @param {string} startMap - Starting map name
	 * @param {number} startX - Starting X coordinate
	 * @param {number} startY - Starting Y coordinate
	 * @param {string} endMap - Destination map name
	 * @param {number} endX - Destination X coordinate
	 * @param {number} endY - Destination Y coordinate
	 * @param {Array} warpTypes - Types of warps to consider [default: [200]]
	 * @returns {Array|null} Array of warps with map, coordinates and warpId, or null if no path found
	 */
	MapPathFinder.findPathBetweenMaps = function findPathBetweenMaps(
		startMap,
		startX,
		startY,
		endMap,
		endX,
		endY,
		warpTypes
	) {
		// Validate inputs
		if (
			!startMap ||
			!endMap ||
			startX === undefined ||
			startY === undefined ||
			endX === undefined ||
			endY === undefined
		) {
			return null;
		}

		// Set default warp types if not provided
		warpTypes = warpTypes || [200];

		// Normalize map names (strip .gat extension)
		startMap = startMap.replace(/\.gat$/, '');
		endMap = endMap.replace(/\.gat$/, '');

		// If same map, no need for complex path
		if (startMap === endMap) {
			return [
				{
					map: startMap,
					x: endX,
					y: endY,
					warpId: null
				}
			];
		}

		// Get navigation data
		var naviLinkTable = DB.getNaviLinkTable();
		var naviLinkDistanceTable = DB.getNaviLinkDistanceTable();

		// Check if we have navigation data
		if (!naviLinkTable || !naviLinkTable.length) {
			return null;
		}

		// Build a graph of map connections
		var graph = {};
		var warpDetails = {};

		// Process NaviLinkTable to build the graph
		for (var i = 0; i < naviLinkTable.length; i++) {
			var warp = naviLinkTable[i];
			if (!warp || warp.length < 11) continue;

			var srcMap = warp[0];
			var warpId = warp[1];
			var warpType = warp[2];
			var destMap = warp[8];

			// Skip invalid warps or warps of types not in warpTypes
			if (!srcMap || !destMap || warpTypes.indexOf(warpType) === -1) continue;

			// Initialize graph nodes if they don't exist
			if (!graph[srcMap]) graph[srcMap] = {};

			// Store the warp in the graph with a default distance and hop count
			if (!graph[srcMap][destMap]) {
				graph[srcMap][destMap] = {
					distance: 1, // Default small distance for direct connections
					warpId: warpId,
					hopCount: 1 // Direct connection is 1 hop
				};
			}

			// Store warp details for later use
			var warpKey = srcMap + '_' + warpId;
			warpDetails[warpKey] = {
				id: warpId,
				type: warpType,
				spriteId: warp[3],
				name: warp[4],
				srcMap: srcMap,
				srcX: warp[6],
				srcY: warp[7],
				destMap: destMap,
				destX: warp[9],
				destY: warp[10]
			};
		}

		// Process NaviLinkDistanceTable to enhance the graph with additional connections
		if (naviLinkDistanceTable && naviLinkDistanceTable.length) {
			for (var i = 0; i < naviLinkDistanceTable.length; i++) {
				if (typeof naviLinkDistanceTable[i] === 'string') {
					var mapName = naviLinkDistanceTable[i];
					if (i + 2 < naviLinkDistanceTable.length) {
						//var numLinks = naviLinkDistanceTable[i + 1]; // UNUSED
						var linksData = naviLinkDistanceTable[i + 2];

						if (Array.isArray(linksData)) {
							// Process each link
							for (var j = 0; j < linksData.length; j++) {
								if (!Array.isArray(linksData[j]) || linksData[j].length < 2) continue;

								var linkId = linksData[j][0];
								var warpKey = mapName + '_' + linkId;
								var warpInfo = warpDetails[warpKey];

								if (!warpInfo) continue;

								// Skip warps of types not in warpTypes
								if (warpTypes.indexOf(warpInfo.type) === -1) continue;

								// Process destinations from this link
								for (var k = 1; k < linksData[j].length; k++) {
									var destData = linksData[j][k];
									if (Array.isArray(destData) && destData.length >= 3) {
										var destMapName = destData[0];
										var hopCount = destData[1];
										var pathCost = destData[2];

										// Skip empty destinations
										if (!destMapName) continue;

										// Add this connection to the graph if it's not already there or if it's a better path
										if (!graph[mapName]) graph[mapName] = {};

										// Only update if this path has fewer hops or same hops but better cost
										if (
											!graph[mapName][destMapName] ||
											hopCount < graph[mapName][destMapName].hopCount ||
											(hopCount === graph[mapName][destMapName].hopCount &&
												pathCost < graph[mapName][destMapName].distance)
										) {
											graph[mapName][destMapName] = {
												distance: pathCost,
												warpId: linkId,
												hopCount: hopCount
											};
										}
									}
								}
							}
						}
					}
					// Skip to the next map entry
					i += 2;
				}
			}
		}

		// Add distance from start position to warps in the start map
		if (graph[startMap]) {
			for (var destMap in graph[startMap]) {
				var warpId = graph[startMap][destMap].warpId;
				var warpKey = startMap + '_' + warpId;
				var warpInfo = warpDetails[warpKey];

				if (warpInfo) {
					// Calculate distance from start position to this warp
					var distanceToWarp = Math.sqrt(
						Math.pow(warpInfo.srcX - startX, 2) + Math.pow(warpInfo.srcY - startY, 2)
					);

					// Add this distance to the edge weight, but don't change the hop count
					graph[startMap][destMap].distance += distanceToWarp;
				}
			}
		}

		// Dijkstra's algorithm to find the shortest path
		var distances = {};
		var hopCounts = {}; // Track hop counts separately
		var previous = {};
		var unvisited = new Set();

		// Initialize distances and hop counts
		for (var map in graph) {
			distances[map] = Infinity;
			hopCounts[map] = Infinity;
			previous[map] = null;
			unvisited.add(map);
		}

		// Set distance and hop count to start map as 0
		distances[startMap] = 0;
		hopCounts[startMap] = 0;

		// If start map is not in the graph, add it
		if (!unvisited.has(startMap)) {
			unvisited.add(startMap);
		}

		// Main Dijkstra loop
		while (unvisited.size > 0) {
			// Find the unvisited node with the smallest hop count, then smallest distance
			var current = null;
			var smallestHopCount = Infinity;
			var smallestDistance = Infinity;

			for (var map of unvisited) {
				if (
					hopCounts[map] < smallestHopCount ||
					(hopCounts[map] === smallestHopCount && distances[map] < smallestDistance)
				) {
					smallestHopCount = hopCounts[map];
					smallestDistance = distances[map];
					current = map;
				}
			}

			// If we've reached the destination or there's no path
			if (current === endMap || current === null || hopCounts[current] === Infinity) {
				break;
			}

			// Remove current from unvisited
			unvisited.delete(current);

			// Check all neighbors of current
			if (graph[current]) {
				for (var neighbor in graph[current]) {
					// Skip if neighbor is not in our graph
					if (!hopCounts.hasOwnProperty(neighbor)) continue;

					var newHopCount = hopCounts[current] + (graph[current][neighbor].hopCount || 1);
					var newDistance = distances[current] + graph[current][neighbor].distance;

					// If we found a path with fewer hops, or same hops but shorter distance
					if (
						newHopCount < hopCounts[neighbor] ||
						(newHopCount === hopCounts[neighbor] && newDistance < distances[neighbor])
					) {
						hopCounts[neighbor] = newHopCount;
						distances[neighbor] = newDistance;
						previous[neighbor] = {
							map: current,
							warpId: graph[current][neighbor].warpId
						};
					}
				}
			}
		}

		// If we couldn't reach the destination
		if (!previous[endMap]) {
			return null;
		}

		// Reconstruct the path
		var path = [];
		var current = endMap;

		// Add the final destination
		path.unshift({
			map: endMap,
			x: endX,
			y: endY,
			warpId: null
		});

		// Build the path in reverse
		while (current !== startMap) {
			var prevInfo = previous[current];
			if (!prevInfo) break;

			var prevMap = prevInfo.map;
			var warpId = prevInfo.warpId;
			var warpKey = prevMap + '_' + warpId;
			var warpInfo = warpDetails[warpKey];

			if (!warpInfo) break;

			// Add the warp to the path (in reverse order)
			path.unshift({
				map: prevMap,
				x: warpInfo.srcX,
				y: warpInfo.srcY,
				warpId: warpId
			});

			current = prevMap;
		}

		return path;
	};

	return MapPathFinder;
});
