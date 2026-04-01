/**
 * Loaders/GameFile.js
 *
 * Loaders for Gravity .grf file (Game RO File)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import GameFileDecrypt from './GameFileDecrypt.js';
import BinaryReader, { SEEK_SET } from 'Utils/BinaryReader.js';
import Struct from 'Utils/Struct.js';
import Inflate from 'Utils/Inflate.js';
import TextEncoding from 'Utils/CodepageManager.js';

/**
 * Extensions that should skip full encryption (only header encryption)
 */
const SKIP_EXTENSIONS = /\.(gnd|gat|act|str)$/i;

/**
 * @class GRF
 * @description Loader for Gravity .grf files (Game Resource File)
 */
class GRF {
	static VERSION_200 = 0x200;
	static VERSION_300 = 0x300;
	static SIG_MAGIC = 'Master of Magic';
	static SIG_EH3 = 'Event Horizon';

	static FILELIST_TYPE_FILE = 0x01;
	static FILELIST_TYPE_ENCRYPT_MIXED = 0x02;
	static FILELIST_TYPE_ENCRYPT_HEADER = 0x04;

	static struct_header = new Struct(
		'unsigned char signature[15]',
		'unsigned char key[15]',
		'unsigned long file_table_offset',
		'unsigned long skip',
		'unsigned long filecount',
		'unsigned long version'
	);

	static struct_table = new Struct('unsigned long pack_size', 'unsigned long real_size');

	static struct_entry = new Struct(
		'unsigned long pack_size',
		'unsigned long length_aligned',
		'unsigned long real_size',
		'unsigned char type',
		'unsigned long offset'
	);

	/**
	 * @constructor
	 * @param {File} [data]
	 */
	constructor(data) {
		this.file = null;
		this.reader = null;
		this.header = null;
		this.table = null;
		this.entries = [];
		this.index = {};

		if (data) {
			this.load(data);
		}
	}

	/**
	 * Loading GRF
	 * @param {File} file
	 */
	load(file) {
		const fs = self.requireNode && self.requireNode('fs');
		this.file = file;
		this.reader = new FileReaderSync();

		const reader = this.reader;
		// Helper for slicing/reading
		file.slice = file.slice || file.webkitSlice || file.mozSlice;
		reader.load = (start, len) => {
			if (fs && file.fd) {
				const buf = new Buffer(len);
				fs.readSync(file.fd, buf, 0, len, start);
				return new Uint8Array(buf).buffer;
			}
			return reader.readAsArrayBuffer(file.slice(start, start + len));
		};

		if (file.size < GRF.struct_header.size) {
			throw new Error('GRF::load() - Not enough bytes to be a valid GRF');
		}

		// Read the header
		let buffer = reader.load(0, GRF.struct_header.size);
		let fp = new BinaryReader(buffer);
		const header = fp.readStruct(GRF.struct_header);

		header.signature = String.fromCharCode(...header.signature);
		const nullPos = header.signature.indexOf('\0');
		if (nullPos !== -1) {
			header.signature = header.signature.substr(0, nullPos);
		}

		if (header.signature !== GRF.SIG_MAGIC && header.signature !== GRF.SIG_EH3) {
			throw new Error(`GRF::load() - Incorrect header "${header.signature}"`);
		}

		if (header.version !== GRF.VERSION_200 && header.version !== GRF.VERSION_300) {
			throw new Error(`GRF::load() - Incorrect version "0x${header.version.toString(16)}"`);
		}

		if (header.version === GRF.VERSION_300) {
			fp.seek(30, SEEK_SET);
			header.file_table_offset = fp.readUInt64();
			header.filecount = fp.readUInt();
			header.realfilecount = header.filecount;
		} else {
			header.filecount -= header.skip + 7;
			header.realfilecount = header.filecount;
		}

		if (header.file_table_offset + GRF.struct_header.size > file.size || header.file_table_offset < 0) {
			throw new Error(`GRF::load() - Can't jump to table list (${header.file_table_offset})`);
		}

		let table_offset = header.file_table_offset + GRF.struct_header.size;
		if (header.version === GRF.VERSION_300) {
			table_offset += 4;
		}

		buffer = reader.load(table_offset, GRF.struct_table.size);
		fp = new BinaryReader(buffer);
		const table = fp.readStruct(GRF.struct_table);

		buffer = reader.load(table_offset + GRF.struct_table.size, table.pack_size);
		const data = new Uint8Array(buffer);
		const out = new Uint8Array(table.real_size);

		new Inflate(data).getBytes(out);
		this.index = {};
		this.entries = this._loadEntries(out, header.realfilecount, header.version);

		table.data = '';
		this.entries.forEach(entry => {
			table.data += `${entry.filename}\0`;
			entry.filename = entry.filename.toLowerCase();
			this.index[entry.filename] = entry;
		});

		this.header = header;
		this.table = table;
	}

	/**
	 * Load entries from decompressed table buffer
	 * @private
	 * @param {Uint8Array} out
	 * @param {number} count
	 * @param {number} version
	 * @returns {object[]} entries
	 */
	_loadEntries(out, count, version) {
		let pos = 0;
		const entries = new Array(count);

		for (let i = 0; i < count; ++i) {
			const start = pos;
			while (out[pos]) {
				pos++;
			}
			const end = pos;
			pos++;

			const entry = {
				filename: TextEncoding.decode(out.subarray(start, end), 'utf-8'),
				pack_size: out[pos++] | (out[pos++] << 8) | (out[pos++] << 16) | (out[pos++] << 24),
				length_aligned: out[pos++] | (out[pos++] << 8) | (out[pos++] << 16) | (out[pos++] << 24),
				real_size: out[pos++] | (out[pos++] << 8) | (out[pos++] << 16) | (out[pos++] << 24),
				type: out[pos++]
			};

			if (version === GRF.VERSION_300) {
				entry.offset = (out[pos++] | (out[pos++] << 8) | (out[pos++] << 16) | (out[pos++] << 24)) >>> 0;
				entry.offset += (out[pos++] | (out[pos++] << 8) | (out[pos++] << 16) | (out[pos++] << 24)) * 0x100000000;
			} else {
				entry.offset = (out[pos++] | (out[pos++] << 8) | (out[pos++] << 16) | (out[pos++] << 24)) >>> 0;
			}
			entries[i] = entry;
		}

		return entries;
	}

	/**
	 * Decode entry to return its content
	 * @param {ArrayBuffer} buffer
	 * @param {object} entry
	 * @param {function} callback
	 */
	decodeEntry(buffer, entry, callback) {
		const data = new Uint8Array(buffer);
		const isEncrypted = entry.type !== GRF.FILELIST_TYPE_FILE;
		let handled = false;

		if (entry.type & GRF.FILELIST_TYPE_ENCRYPT_MIXED) {
			if (SKIP_EXTENSIONS.test(entry.filename)) {
				GameFileDecrypt.decodeHeader(data, entry.length_aligned);
			} else {
				GameFileDecrypt.decodeFull(data, entry.length_aligned, entry.pack_size);
			}
			handled = true;
		} else if (entry.type & GRF.FILELIST_TYPE_ENCRYPT_HEADER) {
			GameFileDecrypt.decodeHeader(data, entry.length_aligned);
			handled = true;
		}

		if (isEncrypted && !handled) {
			console.warn(`Unsupported encryption flag (${entry.type}) for file ${entry.filename}`);
			return;
		}

		try {
			const out = new Uint8Array(entry.real_size);
			new Inflate(data).getBytes(out);
			callback(out.buffer);
		} catch (e) {
			console.error(`Failed to decode entry ${entry.filename}`, e);
		}
	}

	/**
	 * Search a file in the GRF
	 * @param {string} filename
	 * @returns {object|null} entry
	 */
	search(filename) {
		return this.index[filename.toLowerCase()] || null;
	}

	/**
	 * Get a file content from GRF
	 * @param {string} filename
	 * @param {function} callback
	 * @returns {boolean} true if found
	 */
	getFile(filename, callback) {
		const fs = self.requireNode && self.requireNode('fs');
		const entry = this.search(filename);

		if (entry) {
			if (!(entry.type & GRF.FILELIST_TYPE_FILE)) {
				return false;
			}

			if (fs && this.file.fd) {
				const buffer = new Buffer(entry.length_aligned);
				fs.readSync(this.file.fd, buffer, 0, entry.length_aligned, entry.offset + GRF.struct_header.size);
				this.decodeEntry(new Uint8Array(buffer).buffer, entry, callback);
				return true;
			}

			const blob = this.file.slice(
				entry.offset + GRF.struct_header.size,
				entry.offset + GRF.struct_header.size + entry.length_aligned
			);

			if (self.FileReader) {
				const reader = new FileReader();
				reader.onload = () => this.decodeEntry(reader.result, entry, callback);
				reader.readAsArrayBuffer(blob);
			} else {
				const reader = new FileReaderSync();
				this.decodeEntry(reader.readAsArrayBuffer(blob), entry, callback);
			}

			return true;
		}

		return false;
	}
}

export default GRF;
