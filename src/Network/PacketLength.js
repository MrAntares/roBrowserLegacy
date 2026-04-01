/**
 * Network/PacketLength.js
 *
 * Network Packet Length
 * Manage packets length
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Alison Serafim
 * @author Vincent Thibault
 */

/**
 * @class PacketLength
 * @description Manages packet length definitions loaded from year-specific modules.
 */
class PacketLength {
	static #packetModules = import.meta.glob('./Packets/*_len_main.js', { eager: true });
	static #lengths = [];

	/**
	 * Initialize packet lengths for a specific version.
	 * @param {number|string} packetver - packet version date (e.g., 20130807)
	 */
	static init(packetver) {
		const ver = parseInt(packetver, 10);

		// Find the matching year for the packet version
		const years = [
			2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008,
			2007, 2006, 2005, 2004, 2003
		];

		let selectedYear = 2003;
		for (const year of years) {
			if (ver >= year * 10000) {
				selectedYear = year;
				break;
			}
		}

		const modulePath = `./Packets/packets${selectedYear}_len_main.js`;
		const module = this.#packetModules[modulePath];
		const lengths = module?.default || module;

		if (lengths && typeof lengths.init === 'function') {
			this.#lengths = lengths.init(ver);
			console.log(`%c[Network] Packet Length initialized for ${ver}`, 'color:#007000');
		} else {
			console.error(`[Network] Failed to load packet lengths for year ${selectedYear} (path: ${modulePath})`);
		}
	}

	/**
	 * Get the length of a specific packet by ID.
	 * @param {number} id - packet ID
	 * @returns {number|false} - length or false if not found
	 */
	static getPacketLength(id) {
		return this.#lengths[id] || false;
	}
}

export default PacketLength;
