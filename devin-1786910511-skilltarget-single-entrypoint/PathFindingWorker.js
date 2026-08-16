(function() {
	//#region src/UI/Components/Navigation/PathFindingWorker.js
	/**
	* UI/Components/Navigation/PathfindingWorker.js
	*
	* Web Worker for handling pathfinding calculations
	*
	* This file is part of ROBrowser, (http://www.robrowser.com/).
	*/
	var PriorityQueue = class {
		constructor() {
			this.values = [];
		}
		enqueue(val, priority) {
			this.values.push({
				val,
				priority
			});
			this.sort();
		}
		dequeue() {
			return this.values.shift();
		}
		sort() {
			this.values.sort((a, b) => a.priority - b.priority);
		}
	};
	function getKey(x, y) {
		return x + "," + y;
	}
	function heuristic(x1, y1, x2, y2) {
		const dx = Math.abs(x1 - x2);
		const dy = Math.abs(y1 - y2);
		return Math.max(dx, dy);
	}
	function getNeighbors(x, y, mapData, warps) {
		const neighbors = [];
		const directions = [
			[0, 1],
			[1, 0],
			[0, -1],
			[-1, 0]
		];
		for (let i = 0; i < directions.length; i++) {
			const newX = x + directions[i][0];
			const newY = y + directions[i][1];
			if (newX < 0 || newX >= mapData.width || newY < 0 || newY >= mapData.height) continue;
			if (mapData.cellTypes[newX + newY * mapData.width] & mapData.walkableType) neighbors.push({
				x: newX,
				y: newY,
				isWarp: false,
				cost: 1
			});
		}
		if (warps) {
			for (const warp of warps) if (heuristic(x, y, warp.srcX, warp.srcY) <= 1) neighbors.push({
				x: warp.destX,
				y: warp.destY,
				isWarp: true,
				warpId: warp.id,
				cost: 1
			});
		}
		return neighbors;
	}
	function findPath(startX, startY, endX, endY, mapData, existingPath) {
		startX = Math.floor(startX);
		startY = Math.floor(startY);
		endX = Math.floor(endX);
		endY = Math.floor(endY);
		if (startX === endX && startY === endY) return [];
		if (!(mapData.cellTypes[endX + endY * mapData.width] & mapData.walkableType)) return [];
		if (existingPath && existingPath.length > 0) {
			const existingStartX = existingPath[0].x;
			const existingStartY = existingPath[0].y;
			if (heuristic(startX, startY, existingStartX, existingStartY) <= 3) return existingPath;
		}
		const existingPathLookup = /* @__PURE__ */ new Map();
		if (existingPath && existingPath.length > 0) for (let i = 0; i < existingPath.length; i++) {
			const point = existingPath[i];
			existingPathLookup.set(getKey(point.x, point.y), i);
		}
		const openSet = new PriorityQueue();
		const closedSet = /* @__PURE__ */ new Set();
		const cameFrom = /* @__PURE__ */ new Map();
		const gScore = /* @__PURE__ */ new Map();
		const fScore = /* @__PURE__ */ new Map();
		const startKey = getKey(startX, startY);
		openSet.enqueue([startX, startY], 0);
		gScore.set(startKey, 0);
		fScore.set(startKey, heuristic(startX, startY, endX, endY));
		const warps = mapData.warps || [];
		const minRecalculationPoints = existingPath && existingPath.length > 0 ? Math.floor(existingPath.length * .25) : 0;
		while (openSet.values.length > 0) {
			const current = openSet.dequeue().val;
			const currentX = current[0];
			const currentY = current[1];
			const currentKey = getKey(currentX, currentY);
			if (currentX === endX && currentY === endY) {
				const path = [];
				let key = currentKey;
				while (cameFrom.has(key)) {
					const [x, y, isWarp, warpId] = cameFrom.get(key);
					path.unshift({
						x: parseInt(x),
						y: parseInt(y),
						isWarp,
						warpId
					});
					key = getKey(x, y);
				}
				path.unshift({
					x: startX,
					y: startY
				});
				return path;
			}
			if (existingPathLookup.has(currentKey) && existingPathLookup.get(currentKey) >= minRecalculationPoints) {
				const pathIndex = existingPathLookup.get(currentKey);
				const newPath = [];
				let key = currentKey;
				while (cameFrom.has(key)) {
					const [x, y, isWarp, warpId] = cameFrom.get(key);
					newPath.unshift({
						x: parseInt(x),
						y: parseInt(y),
						isWarp,
						warpId
					});
					key = getKey(x, y);
				}
				newPath.unshift({
					x: startX,
					y: startY
				});
				if (pathIndex < existingPath.length - 1) for (let i = pathIndex + 1; i < existingPath.length; i++) newPath.push(existingPath[i]);
				return newPath;
			}
			closedSet.add(currentKey);
			const neighbors = getNeighbors(currentX, currentY, mapData, warps);
			for (const neighbor of neighbors) {
				const neighborKey = getKey(neighbor.x, neighbor.y);
				if (closedSet.has(neighborKey)) continue;
				const tentativeGScore = gScore.get(currentKey) + neighbor.cost;
				if (!openSet.values.some((node) => getKey(node.val[0], node.val[1]) === neighborKey)) openSet.enqueue([neighbor.x, neighbor.y], tentativeGScore + heuristic(neighbor.x, neighbor.y, endX, endY));
				else if (tentativeGScore >= gScore.get(neighborKey)) continue;
				cameFrom.set(neighborKey, [
					currentX,
					currentY,
					neighbor.isWarp,
					neighbor.warpId
				]);
				gScore.set(neighborKey, tentativeGScore);
				fScore.set(neighborKey, tentativeGScore + heuristic(neighbor.x, neighbor.y, endX, endY));
			}
		}
		return [];
	}
	self.onmessage = function(e) {
		const data = e.data;
		switch (data.type) {
			case "findPath": {
				const path = findPath(data.startX, data.startY, data.endX, data.endY, data.mapData, data.existingPath);
				self.postMessage({
					type: "pathResult",
					path,
					workerId: data.workerId
				});
				break;
			}
		}
	};
	//#endregion
})();
