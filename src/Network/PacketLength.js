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

define(function (require) {
	'use strict';

	let packets_len = new Array();

	/**
	 * Get a Packet Length
	 *
	 * @param {number} packetver - packet version (clientdate)
	 */
	function init(packetver) {
		var Lengths;
		packetver = parseInt(packetver);
		if (packetver >= 20250000) {
			Lengths = require('./Packets/packets2025_len_main');
		} else if (packetver >= 20240000) {
			Lengths = require('./Packets/packets2024_len_main');
		} else if (packetver >= 20230000) {
			Lengths = require('./Packets/packets2023_len_main');
		} else if (packetver >= 20220000) {
			Lengths = require('./Packets/packets2022_len_main');
		} else if (packetver >= 20210000) {
			Lengths = require('./Packets/packets2021_len_main');
		} else if (packetver >= 20200000) {
			Lengths = require('./Packets/packets2020_len_main');
		} else if (packetver >= 20190000) {
			Lengths = require('./Packets/packets2019_len_main');
		} else if (packetver >= 20180000) {
			Lengths = require('./Packets/packets2018_len_main');
		} else if (packetver >= 20170000) {
			Lengths = require('./Packets/packets2017_len_main');
		} else if (packetver >= 20160000) {
			Lengths = require('./Packets/packets2016_len_main');
		} else if (packetver >= 20150000) {
			Lengths = require('./Packets/packets2015_len_main');
		} else if (packetver >= 20140000) {
			Lengths = require('./Packets/packets2014_len_main');
		} else if (packetver >= 20130000) {
			Lengths = require('./Packets/packets2013_len_main');
		} else if (packetver >= 20120000) {
			Lengths = require('./Packets/packets2012_len_main');
		} else if (packetver >= 20110000) {
			Lengths = require('./Packets/packets2011_len_main');
		} else if (packetver >= 20100000) {
			Lengths = require('./Packets/packets2010_len_main');
		} else if (packetver >= 20090000) {
			Lengths = require('./Packets/packets2009_len_main');
		} else if (packetver >= 20080000) {
			Lengths = require('./Packets/packets2008_len_main');
		} else if (packetver >= 20070000) {
			Lengths = require('./Packets/packets2007_len_main');
		} else if (packetver >= 20060000) {
			Lengths = require('./Packets/packets2006_len_main');
		} else if (packetver >= 20050000) {
			Lengths = require('./Packets/packets2005_len_main');
		} else if (packetver >= 20040000) {
			Lengths = require('./Packets/packets2004_len_main');
		} else if (packetver >= 20030000) {
			Lengths = require('./Packets/packets2003_len_main');
		} else {
			Lengths = require('./Packets/packets2003_len_main'); // Defaulting to 2003 if packetver is older or something weird.
		}
		packets_len = Lengths.init(packetver);
		console.log('%c[Network] Packet Length initialized ', 'color:#007000', packetver);
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
	return {
		init: init,
		getPacketLength: getPacketLength
	};
});
