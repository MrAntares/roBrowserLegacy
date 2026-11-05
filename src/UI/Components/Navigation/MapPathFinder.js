/**
 * UI/Components/Navigation/MapPathFinder.js
 *
 * Map-to-map pathfinding functionality
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import DB from 'DB/DBManager.js';

// Dependencies
/**
 * MapPathFinder namespace
 */
const MapPathFinder = {};

/**
 * Official navigation link types.
 * 200 is the normal walking/map-portal graph. 201-205 are service/transport
 * links used by the official navigation data for things like airship, boat,
 * Kafra/town-guide style transport, and similar NPC services.
 */
const WALK_LINK_TYPES = [200];
const SERVICE_LINK_TYPES = [201, 202, 203, 204, 205];
const ALL_SERVICE_ROUTE_TYPES = WALK_LINK_TYPES.concat(SERVICE_LINK_TYPES);

function normalizeMapName(mapName) {
	return String(mapName || '').replace(/\.gat$/, '');
}

function normalizeWarpTypes(warpTypes) {
	if (!warpTypes) {
		return WALK_LINK_TYPES.slice();
	}

	if (Array.isArray(warpTypes)) {
		return warpTypes.map(Number).filter(type => Number.isFinite(type));
	}

	if (typeof warpTypes === 'object') {
		if (warpTypes.allowServices || warpTypes.services || warpTypes.includeServices) {
			return ALL_SERVICE_ROUTE_TYPES.slice();
		}
		if (Array.isArray(warpTypes.types)) {
			return normalizeWarpTypes(warpTypes.types);
		}
	}

	return WALK_LINK_TYPES.slice();
}

function isServiceLinkType(warpType) {
	return SERVICE_LINK_TYPES.indexOf(Number(warpType)) !== -1;
}

function ensureGraphNode(graph, mapName) {
	if (!mapName) {
		return;
	}
	if (!graph[mapName]) {
		graph[mapName] = {};
	}
}

function isBetterConnection(current, distance, hopCount, service) {
	if (!current) {
		return true;
	}

	if (hopCount < current.hopCount) {
		return true;
	}

	if (hopCount > current.hopCount) {
		return false;
	}

	// If both paths look equal, prefer walking portals over service links so
	// checking Services does not randomly swap a normal route to a paid/transport
	// route unless it is actually shorter.
	if (!!current.service !== !!service) {
		return current.service && !service;
	}

	return distance < current.distance;
}

/**
 * Find a path between maps using Dijkstra's algorithm
 *
 * @param {string} startMap - Starting map name
 * @param {number} startX - Starting X coordinate
 * @param {number} startY - Starting Y coordinate
 * @param {string} endMap - Destination map name
 * @param {number} endX - Destination X coordinate
 * @param {number} endY - Destination Y coordinate
 * @param {Array|Object} warpTypes - Allowed link types, or {allowServices:true}
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

	const includeMetadata = warpTypes !== undefined;
	warpTypes = normalizeWarpTypes(warpTypes);

	// Normalize map names (strip .gat extension)
	startMap = normalizeMapName(startMap);
	endMap = normalizeMapName(endMap);

	// If same map, no need for complex path
	if (startMap === endMap) {
		return [
			includeMetadata
				? {
						map: startMap,
						x: endX,
						y: endY,
						warpId: null,
						type: null,
						service: false,
						name: ''
					}
				: {
						map: startMap,
						x: endX,
						y: endY,
						warpId: null
					}
		];
	}

	// Get navigation data
	const naviLinkTable = DB.getNaviLinkTable();
	const naviLinkDistanceTable = DB.getNaviLinkDistanceTable();

	// Check if we have navigation data
	if (!naviLinkTable || !naviLinkTable.length) {
		return null;
	}

	// Build a graph of map connections
	const graph = {};
	const warpDetails = {};

	// Process NaviLinkTable to build the graph
	for (let i = 0; i < naviLinkTable.length; i++) {
		const warp = naviLinkTable[i];
		if (!warp || warp.length < 11) {
			continue;
		}

		const srcMap = normalizeMapName(warp[0]);
		const warpId = warp[1];
		const warpType = Number(warp[2]);
		const destMap = normalizeMapName(warp[8]);

		// Skip invalid warps or warps of types not in warpTypes
		if (!srcMap || !destMap || warpTypes.indexOf(warpType) === -1) {
			continue;
		}

		const service = isServiceLinkType(warpType);
		const baseDistance = service ? 0.75 : 1;

		// Initialize graph nodes if they don't exist. Destination-only maps must also
		// be added, otherwise Dijkstra can never finish on maps without outgoing links.
		ensureGraphNode(graph, srcMap);
		ensureGraphNode(graph, destMap);

		// Store warp details for later use
		const warpKey = srcMap + '_' + warpId;
		warpDetails[warpKey] = {
			id: warpId,
			type: warpType,
			service: service,
			spriteId: warp[3],
			name: warp[4] || '',
			srcMap: srcMap,
			srcX: Number(warp[6]) || 0,
			srcY: Number(warp[7]) || 0,
			destMap: destMap,
			destX: Number(warp[9]) || 0,
			destY: Number(warp[10]) || 0
		};

		// Store the warp in the graph with a default distance and hop count.
		if (isBetterConnection(graph[srcMap][destMap], baseDistance, 1, service)) {
			graph[srcMap][destMap] = {
				distance: baseDistance,
				warpId: warpId,
				type: warpType,
				service: service,
				hopCount: 1
			};
		}
	}

	// Process NaviLinkDistanceTable to enhance the graph with additional connections
	if (naviLinkDistanceTable && naviLinkDistanceTable.length) {
		for (let i = 0; i < naviLinkDistanceTable.length; i++) {
			if (typeof naviLinkDistanceTable[i] === 'string') {
				const mapName = normalizeMapName(naviLinkDistanceTable[i]);
				if (i + 2 < naviLinkDistanceTable.length) {
					//var numLinks = naviLinkDistanceTable[i + 1]; // UNUSED
					const linksData = naviLinkDistanceTable[i + 2];

					if (Array.isArray(linksData)) {
						// Process each link
						for (let j = 0; j < linksData.length; j++) {
							if (!Array.isArray(linksData[j]) || linksData[j].length < 2) {
								continue;
							}

							const linkId = linksData[j][0];
							const warpKey = mapName + '_' + linkId;
							const warpInfo = warpDetails[warpKey];

							if (!warpInfo) {
								continue;
							}

							// Skip warps of types not in warpTypes
							if (warpTypes.indexOf(warpInfo.type) === -1) {
								continue;
							}

							// Process destinations from this link
							for (let k = 1; k < linksData[j].length; k++) {
								const destData = linksData[j][k];
								if (Array.isArray(destData) && destData.length >= 3) {
									const destMapName = normalizeMapName(destData[0]);
									const hopCount = Number(destData[1]) || 1;
									const pathCost = Number(destData[2]) || 1;

									// Skip empty destinations
									if (!destMapName) {
										continue;
									}

									ensureGraphNode(graph, mapName);
									ensureGraphNode(graph, destMapName);

									if (
										isBetterConnection(
											graph[mapName][destMapName],
											pathCost,
											hopCount,
											warpInfo.service
										)
									) {
										graph[mapName][destMapName] = {
											distance: pathCost,
											warpId: linkId,
											type: warpInfo.type,
											service: warpInfo.service,
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
		for (const destMap in graph[startMap]) {
			const warpId = graph[startMap][destMap].warpId;
			const warpKey = startMap + '_' + warpId;
			const warpInfo = warpDetails[warpKey];

			if (warpInfo) {
				// Calculate distance from start position to this warp
				const distanceToWarp = Math.sqrt(
					Math.pow(warpInfo.srcX - startX, 2) + Math.pow(warpInfo.srcY - startY, 2)
				);

				// Add this distance to the edge weight, but don't change the hop count
				graph[startMap][destMap].distance += distanceToWarp;
			}
		}
	}

	// Dijkstra's algorithm to find the shortest path
	const distances = {};
	const hopCounts = {}; // Track hop counts separately
	const previous = {};
	const unvisited = new Set();

	// Initialize distances and hop counts. Graph now contains both source and
	// destination nodes, including destination-only service maps.
	for (const map in graph) {
		distances[map] = Infinity;
		hopCounts[map] = Infinity;
		previous[map] = null;
		unvisited.add(map);
	}

	// Set distance and hop count to start map as 0
	distances[startMap] = 0;
	hopCounts[startMap] = 0;

	// If start/end maps are not in the graph, add them so the algorithm can fail
	// cleanly instead of leaving missing properties.
	if (!unvisited.has(startMap)) {
		unvisited.add(startMap);
	}
	if (!unvisited.has(endMap)) {
		unvisited.add(endMap);
		distances[endMap] = Infinity;
		hopCounts[endMap] = Infinity;
		previous[endMap] = null;
	}

	// Main Dijkstra loop
	while (unvisited.size > 0) {
		// Find the unvisited node with the smallest hop count, then smallest distance
		let current = null;
		let smallestHopCount = Infinity;
		let smallestDistance = Infinity;

		for (const map of unvisited) {
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
			for (const neighbor in graph[current]) {
				// Skip if neighbor is not in our graph
				if (!hopCounts.hasOwnProperty(neighbor)) {
					continue;
				}

				const newHopCount = hopCounts[current] + (graph[current][neighbor].hopCount || 1);
				const newDistance = distances[current] + graph[current][neighbor].distance;

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
	const path = [];
	let current = endMap;

	// Add the final destination
	path.unshift(
		includeMetadata
			? {
					map: endMap,
					x: endX,
					y: endY,
					warpId: null,
					type: null,
					service: false,
					name: ''
				}
			: {
					map: endMap,
					x: endX,
					y: endY,
					warpId: null
				}
	);

	// Build the path in reverse
	while (current !== startMap) {
		const prevInfo = previous[current];
		if (!prevInfo) {
			break;
		}

		const prevMap = prevInfo.map;
		const warpId = prevInfo.warpId;
		const warpKey = prevMap + '_' + warpId;
		const warpInfo = warpDetails[warpKey];

		if (!warpInfo) {
			break;
		}

		// Add the warp/service point to the path (in reverse order)
		path.unshift(
			includeMetadata
				? {
						map: prevMap,
						x: warpInfo.srcX,
						y: warpInfo.srcY,
						warpId: warpId,
						type: warpInfo.type,
						service: warpInfo.service,
						name: warpInfo.name,
						destMap: warpInfo.destMap,
						destX: warpInfo.destX,
						destY: warpInfo.destY
					}
				: {
						map: prevMap,
						x: warpInfo.srcX,
						y: warpInfo.srcY,
						warpId: warpId
					}
		);

		current = prevMap;
	}

	return path;
};
export default MapPathFinder;
