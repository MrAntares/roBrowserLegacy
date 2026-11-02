/**
 * DB/Map/PrivateAirship.js
 *
 * Private Airship tables, as the official client reads them from
 * System/PrivateAirplane_True.lub: the maps a flight may start from, the maps
 * it may land on, and the items that pay for it, in the order the payment
 * window lists them.
 *
 * Until the file is loaded the map checks pass and the server decides, and
 * the payment items are the ones the 2025 kRO file lists.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

/**
 * Items the kRO file lists, used when the file is missing.
 * 6909 Nyangvine Fruit, 25464 World Tour Ticket.
 */
const DEFAULT_NEED_ITEMS = [6909, 25464];

const _startable = new Set();
const _endable = new Set();
const _needItems = [];
let _loaded = false;

/**
 * Map name as the tables hold it: lower case, no extension.
 *
 * @param {string} mapName
 * @return {string}
 */
function normalize(mapName) {
	return String(mapName || '')
		.trim()
		.toLowerCase()
		.replace(/\.(gat|rsw|gnd)$/, '');
}

const PrivateAirship = {
	normalize,

	/**
	 * Forget everything loaded so far.
	 */
	reset() {
		_startable.clear();
		_endable.clear();
		_needItems.length = 0;
		_loaded = false;
	},

	/**
	 * @param {string} mapName - a map a flight may start from
	 */
	addStartableMap(mapName) {
		_startable.add(normalize(mapName));
		_loaded = true;
	},

	/**
	 * @param {string} mapName - a map a flight may land on
	 */
	addEndableMap(mapName) {
		_endable.add(normalize(mapName));
		_loaded = true;
	},

	/**
	 * @param {number} itemId - an item that pays for a flight
	 */
	addNeedItem(itemId) {
		itemId = Number(itemId);
		if (itemId > 0 && _needItems.indexOf(itemId) === -1) {
			_needItems.push(itemId);
		}
		_loaded = true;
	},

	/**
	 * @return {boolean} whether the client's table was read
	 */
	isLoaded() {
		return _loaded;
	},

	/**
	 * @param {string} mapName
	 * @return {boolean} whether a flight may start on this map
	 */
	isStartableMap(mapName) {
		return !_startable.size || _startable.has(normalize(mapName));
	},

	/**
	 * @param {string} mapName
	 * @return {boolean} whether a flight may land on this map
	 */
	isEndableMap(mapName) {
		return !_endable.size || _endable.has(normalize(mapName));
	},

	/**
	 * @return {Array<number>} the items that pay for a flight, in the file's order
	 */
	getNeedItems() {
		return _needItems.length ? _needItems.slice() : DEFAULT_NEED_ITEMS.slice();
	}
};

export default PrivateAirship;
