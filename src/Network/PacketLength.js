/**
 * Network/PacketLength.js
 *
 * Network Packet Length
 * Manage packets length
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Alison Serafim
 */

// Eagerly import all packet length definitions as ES modules
const packetModules = import.meta.glob('./Packets/*_len_main.js', { eager: true });

let packets_len = new Array();

/**
 * Get a Packet Length
 *
 * @param {number} packetver - packet version (clientdate)
 */
function init(packetver) {
	packetver = parseInt(packetver);

	// Find the matching year for the packet version
	const years = [
		2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008,
		2007, 2006, 2005, 2004, 2003
	];

	let selectedYear = 2003;
	for (const year of years) {
		if (packetver >= year * 10000) {
			selectedYear = year;
			break;
		}
	}

	const modulePath = `./Packets/packets${selectedYear}_len_main.js`;
	const Lengths = packetModules[modulePath]?.default || packetModules[modulePath];

	if (Lengths && typeof Lengths.init === 'function') {
		packets_len = Lengths.init(packetver);
		console.log('%c[Network] Packet Length initialized ', 'color:#007000', packetver);
	} else {
		console.error(`[Network] Failed to load packet lengths for year ${selectedYear} (path: ${modulePath})`);
	}
}

/**
 * Get a Packet Length
 *
 * @param {number} id - packet ID
 */
function getPacketLength(id) {
	return packets_len[id] || false;
}

/**
 * Export
 */
export default {
	init: init,
	getPacketLength: getPacketLength
};
