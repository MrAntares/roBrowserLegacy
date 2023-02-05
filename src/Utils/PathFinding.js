/**
 * Utils/PathFinding.js
 *
 * Path Finding Algorithm (A*)
 *
 * Trying to find the shortest path between two positions.
 * This file is based on eAthena/rAthena code, optimized for JS : http://svn.code.sf.net/p/rathena/svn/trunk/src/map/path.c
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define(function()
{
	'use strict';


	// World object
	var GAT = {
		width:     0,
		height:    0,
		cells:  null,
		type:   null
	};


	const MAX_HEAP     = 150;
	const MAX_WALKPATH = 33;


	// Memory
	var _heap        = new Uint32Array(MAX_HEAP);
	var _heap_clean  = new Uint32Array(MAX_HEAP);

	var short_clean  = new Uint16Array(MAX_WALKPATH*MAX_WALKPATH);
	var char_clean   = new Uint8Array(MAX_WALKPATH*MAX_WALKPATH);
	var dc           = new Uint8Array(4);

	// struct tmp_path {
		/* short   */ var _x      = new Uint16Array(MAX_WALKPATH*MAX_WALKPATH);
		/* short   */ var _y      = new Uint16Array(MAX_WALKPATH*MAX_WALKPATH);
		/* short   */ var _dist   = new Uint16Array(MAX_WALKPATH*MAX_WALKPATH);
		/* short   */ var _cost   = new Uint16Array(MAX_WALKPATH*MAX_WALKPATH);
		/* short   */ var _before = new Uint16Array(MAX_WALKPATH*MAX_WALKPATH);
		/* boolean */ var _flag   = new Uint8Array(MAX_WALKPATH*MAX_WALKPATH);
	// };



	// Should be convert to inline code by the browser (V8)
	function calc_index(x, y)
	{
		return ( x + y * MAX_WALKPATH ) % (MAX_WALKPATH * MAX_WALKPATH);
	}

	function calc_cost(i, x1, y1)
	{
		return ( Math.abs(x1-_x[i]) + Math.abs(y1-_y[i]) ) * 10 + _dist[i];
	}


	/**
	 * Heap push (helper function)
	 *
	 * @param {Uint32Array} heap
	 * @param {number} index
	 */
	function push_heap_path(heap, index)
	{
		var i, h = heap[0]++;

		for (i = (h-1)>>1; h > 0 && _cost[index] < _cost[heap[i+1]]; i = (h-1)>>1) {
			heap[h+1] = heap[i+1];
			h = i;
		}

		heap[h+1] = index;
	}


	/**
	 * Heap update (helper function)
	 * Move toward the root because cost has decreased.
	 *
	 * @param {Uint32Array} heap
	 * @param {number} index
	 */
	function update_heap_path( heap, index )
	{
		var i, h, cost;

		h=0;
		for (h = 0; h < heap[0] && heap[h+1] !== index; ++h);


		if (h === heap[0]) {
			throw new Error('PathFinding::update_heap_path() - Error updating head path');
		}

		cost = _cost[index];

		for (i = (h-1)>>1; h > 0 && cost < _cost[heap[i+1]]; i = (h-1)>>1) {
			heap[h+1] = heap[i+1];
			h = i;
		}

		heap[h+1] = index;
	}


	/**
	 * Heap pop (helper function)
	 *
	 * @param {Uint32Array} heap
	 * @return {number}
	 */
	function pop_heap_path( heap )
	{
		var i, h, k, ret, last, cost;

		if (heap[0] <= 0)
			return -1;

		ret  = +heap[1];
		last = +heap[heap[0]--];
		cost = _cost[last];

		for (h = 0, k = 2; k < heap[0]; k = k*2+2) {
			if (_cost[heap[k+1]] > _cost[heap[k]]) {
				k--;
			}
			heap[h+1] = +heap[k+1];
			h = k;
		}

		if (k === heap[0]) {
			heap[h+1] = +heap[k];
			h = k-1;
		}

		for (i = (h-1)>>1; h > 0 && _cost[heap[i+1]] > cost; i = (h-1)>>1) {
			heap[h+1] = heap[i+1];
			h = i;
		}

		heap[h+1] = last;

		return ret;
	}


	/**
	 * calculate cost for the specified position
	 *
	 * @param {Uint32Array} heap
	 * @param {number} x
	 * @param {number} y
	 * @param {number} dist
	 * @param {number} before
	 * @param {number} cost
	 */
	function add_path( heap, x, y, dist, before, cost )
	{
		var i = calc_index(x,y);

		if (_x[i] === x && _y[i] === y) {

			if (_dist[i] > dist) {
				_dist[i]   = dist;
				_before[i] = before;
				_cost[i]   = cost;

				if (_flag[i]) {
					push_heap_path(heap, i);
				}
				else {
					update_heap_path(heap, i);
				}

				_flag[i]   = 0;
			}

			return 0;
		}

		if (_x[i] || _y[i]) {
			return 1;
		}

		_x[i]      = x;
		_y[i]      = y;
		_dist[i]   = dist;
		_before[i] = before;
		_cost[i]   = cost;
		_flag[i]   = 0;

		push_heap_path(heap, i);
		return 0;
	}


	/**
	 * Copy Gat cell types info to local.
	 *
	 * @param {object} gat - Altitude info
	 */
	function setGat( gat )
	{
		GAT.width  = gat.width;
		GAT.height = gat.height;
		GAT.cells  = gat.cells;
		GAT.type   = gat.types;
	}


	/**
	 * Check the direct path between two points and find if there is a cell that is in range
	 *
	 * @param {number} x0
	 * @param {number} y0
	 * @param {number} x1
	 * @param {number} y1
	 * @param {Array} out
	 * @param {number} range
	 */
	function searchLong( x0, y0, x1, y1, range, out )
	{
		var i, dx, dy, x, y, rx, ry;
		var result = {
			success: false,
			inRange: false,
			targetCell: [x0, y0],
			pathLength: 0
		};
		
		rx = x1-x0;
		ry = y1-y0;
		
		dx   = rx ? ((rx<0) ? -1 : 1) : 0;
		dy   = ry ? ((ry<0) ? -1 : 1) : 0;
		x    = x0;
		y    = y0;
		
		out[0] = x0;
		out[1] = y0;
		
		if (Math.sqrt(rx*rx + ry*ry) <= range){
			// Already in range
			result.success = true;
			result.inRange = true;
			// Don't return yet must check for walls
		}
		
		i = 1;
		while (i <= MAX_WALKPATH) {
			x      += dx;
			y      += dy;
			
			if(GAT.cells[x + (y * GAT.width)] === GAT.type.NONE){
				// No direct path
				result.success = false;
				break;
			}
			
			if(!result.success){
				// Only save path when not found a valid target cell already
				out[i*2 + 0] = x;
				out[i*2 + 1] = y;
				result.pathLength = i;
			}
			
			rx = x1-x;
			ry = y1-y;
			
			if (Math.sqrt(rx*rx + ry*ry) <= range && !result.success){
				// There is a path to a cell that is in range
				result.success = true;	
				result.inRange = false;
				result.targetCell = [x, y];
				// Must continue checking if there is a wall
			}

			if (x === x1) dx = 0;
			if (y === y1) dy = 0;

			if (dx === 0 && dy === 0) {
				break;
			}
			
			i++;
		}
		return result;
		
	}


	/**
	 * Find the path between two points.
	 *
	 * @param {vec2} from
	 * @param {vec2} to
	 * @param {number} range
	 * @param {Array} out
	 */
	function search( x0, y0, x1, y1, range, out )
	{
		var heap;
		var x, y, i, j, currentNode, sizeX, sizeY;
		var error, dirFlag, pathLen, dist, cost, finalLen, skip;

		// Import world
		var width  = GAT.width;
		var height = GAT.height;
		var types  = GAT.cells;
		var TYPE   = GAT.type;

		// Direct search
		var result = searchLong( x0, y0, x1, y1, range, out );
		if (result.success) {
			return (result.pathLength + 1);
		}

		// Clean variables (avoid garbage collection problem)
		_heap.set(_heap_clean);
		_x.set(short_clean);
		_y.set(short_clean);
		_dist.set(short_clean);
		_cost.set(short_clean);
		_before.set(short_clean);
		_flag.set(char_clean);

		heap     = _heap;
		out[0]   = x0;
		out[1]   = y0;

		i        = calc_index(x0, y0);
		_x[i]    = x0;
		_y[i]    = y0;
		_cost[i] = calc_cost(i, x1, y1);

		heap[0]  = 0;
		push_heap_path(heap, i);


		sizeX = width  - 1;
		sizeY = height - 1;

		while (true) {

			// Clean up variables
			error     = 0;
			dirFlag   = 0;

			dc[0] = 0;
			dc[1] = 0;
			dc[2] = 0;
			dc[3] = 0;

			currentNode    = pop_heap_path(heap);

			// No path found.
			if (currentNode < 0) {
				return 0;
			}

			x     = _x[currentNode];
			y     = _y[currentNode];
			dist  = _dist[currentNode] + 10;
			cost  = _cost[currentNode];

			// Finished
			if (x === x1 && y === y1) {
				break;
			}

			if (y < sizeY && types[ (x+0) + (y+1) * width ] & TYPE.WALKABLE) {
				dc[0] = (y >= y1 ? 20 : 0);
				dirFlag    |= 1;
				error    += add_path( heap, x+0, y+1, dist, currentNode, cost + dc[0] );
			}

			if (x > 0 && types[ (x-1) + (y+0) * width ] & TYPE.WALKABLE) {
				dc[1] = (x <= x1 ? 20 : 0);
				dirFlag    |= 2;
				error    += add_path( heap, x-1, y+0, dist, currentNode, cost + dc[1] );
			}

			if (y > 0 && types[ (x+0) + (y-1) * width ] & TYPE.WALKABLE) {
				dc[2] = (y <= y1 ? 20 : 0);
				dirFlag    |= 4;
				error    += add_path( heap, x+0, y-1, dist, currentNode, cost + dc[2] );
			}

			if (x < sizeX && types[ (x+1) + (y+0) * width ] & TYPE.WALKABLE) {
				dc[3] = (x >= x1 ? 20 : 0);
				dirFlag    |= 8;
				error    += add_path( heap, x+1, y+0, dist, currentNode, cost + dc[3] );
			}

			// Diagonals
			if ((dirFlag & (2+1)) === 2+1 && types[ (x-1) + (y+1) * width ] & TYPE.WALKABLE) {
				error += add_path( heap, x-1, y+1, dist+4, currentNode, cost + dc[1] + dc[0] - 6 );
			}

			if ((dirFlag & (2+4)) === 2+4 && types[ (x-1) + (y-1) * width ] & TYPE.WALKABLE) {
				error += add_path( heap, x-1, y-1, dist+4, currentNode ,cost + dc[1] + dc[2] - 6 );
			}

			if ((dirFlag & (8+4)) === 8+4 && types[ (x+1) + (y-1) * width ] & TYPE.WALKABLE) {
				error += add_path( heap, x+1, y-1, dist+4, currentNode, cost + dc[3] + dc[2] - 6 );
			}

			if ((dirFlag & (8+1)) === 8+1 && types[ (x+1) + (y+1) * width ] & TYPE.WALKABLE) {
				error += add_path( heap, x+1, y+1, dist+4, currentNode, cost + dc[3] + dc[0] - 6 );
			}

			_flag[currentNode] = 1;

			// Too much... ending.
			if (error || heap[0] >= MAX_HEAP - 5) {
				return 0;
			}
		}


		// Reorganize Path
		for (pathLen = 0, i = currentNode; pathLen < 100 && i !== calc_index(x0, y0); i=_before[i], pathLen++);
		
		finalLen = 0;
		skip = range > 0;
		for (i = currentNode, j = pathLen-1; j >=0; i = _before[i], j--) {
			
			if(skip){
				// Check direct path when previous cell was skipped
				var cellResult = searchLong( _x[i], _y[i], x1, y1, range, [] );
				if (!(cellResult.success && cellResult.inRange)){
					skip = false
				}
			}
			
			if(skip && j<pathLen-1){
				// In direct range, remove prev cell from path, not needed
				out[(j+2)*2+0] = 0;
				out[(j+2)*2+1] = 0;
				finalLen--;
			}
			
			// Add current cell to path
			out[(j+1)*2+0] = _x[i];
			out[(j+1)*2+1] = _y[i];
			finalLen++;
		}
		
		return finalLen+1;
	}

	function updateGat(x, y, type){
		GAT.cells[x + y * GAT.width] = type;
	}


	// Exports
	return {
		search:     search,
		searchLong: searchLong,
		setGat:     setGat,
		updateGat:  updateGat,
		MAX_HEAP:	MAX_HEAP,
		MAX_WALKPATH: MAX_WALKPATH
	};
});
