import Client from 'Core/Client.js';
import TextEncoding from 'Utils/CodepageManager.js';
import XmlParse from 'Vendors/xmlparse.js';
import { BSON } from 'bson';

export function createTableLoaders(getUserCharpage) {
	const resolveUserCharpage = typeof getUserCharpage === 'function' ? getUserCharpage : () => getUserCharpage;
	function loadTable(filename, separator, size, callback, onEnd, useCharPage = false) {
		Client.loadFile(
			filename,
			function (buffer) {
				console.log('Loading file "' + filename + '"...');

				let data = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
				data = TextEncoding.decode(data, useCharPage ? resolveUserCharpage() : null);

				// Remove commented lines
				const content = ('\n' + data).replace(/\n(\/\/[^\n]+)/g, '');
				const elements = content.split(separator);
				const count = elements.length;
				const args = new Array(size + 1);

				for (let i = 0; i < count; i++) {
					if (i % size === 0) {
						if (i) {
							callback.apply(null, args);
						}
						args[i % size] = i;
					}

					args[(i % size) + 1] = elements[i].replace(/^\s+|\s+$/g, ''); // trim
				}

				onEnd();
			},
			onEnd
		);
	}

	/**
	 * Load CSV table with Base64-encoded columns
	 * Can pick which columns to use for key/value
	 * @param {string} filename - path to CSV
	 * @param {object} targetTable - object to populate
	 * @param {number} keyIndex - 0-based index of column to use as key
	 * @param {number} valueIndex - 0-based index of column to use as value
	 * @param {function} onEnd - callback when done
	 */
	function loadCSV(filename, targetTable, keyIndex, valueIndex, onEnd, isCurrent = () => true) {
		Client.loadFile(
			filename,
			function (data) {
				if (!isCurrent()) return;
				console.log('Loading file "' + filename + '"...');

				const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
				let text = '';
				let isBase64 = true;

				// Convert buffer to a raw "binary string".
				// This prevents atob() from throwing "outside latin1 range" errors.
				for (let i = 0, count = bytes.length; i < count; i++) {
					text += String.fromCharCode(bytes[i]);
				}

				// Check if the file is Base64 encoded
				if (!text.trimEnd().endsWith('=')) {
					text = TextEncoding.decode(bytes, 'utf-8');
					isBase64 = false;
				}

				// Split lines
				const lines = text.split(/\r?\n/);
				let index = 0;
				for (let i = 0; i < lines.length; i++) {
					const line = lines[i].trim();
					if (!line || line.startsWith('//')) {
						continue;
					}

					const parts = isBase64 ? line.split(',') : line.split('\t');
					if (parts.length <= Math.max(keyIndex, valueIndex)) {
						continue;
					}

					try {
						// Decode columns from Base64
						const value = isBase64 ? base64DecodeUtf8(parts[valueIndex].trim()) : parts[valueIndex].trim();
						targetTable[index] = value;
						index++;
					} catch (e) {
						console.error('Base64 decode failed on line', i + 1, ':', line, e);
					}
				}
				if (typeof onEnd === 'function') {
					onEnd();
				}
			},
			onEnd
		);
	}

	/**
	 * Decode a Base64 string as UTF-8
	 * @param {string} str - Base64 encoded string
	 * @returns {string} decoded UTF-8 string
	 */
	function base64DecodeUtf8(str) {
		try {
			const bytes = Uint8Array.from(atob(str), c => c.charCodeAt(0));
			return TextEncoding.decode(bytes, 'utf-8');
		} catch (e) {
			console.warn('Base64 UTF-8 decode failed:', str, e);
			return str;
		}
	}

	function loadXMLFile(filename, callback, onEnd) {
		Client.loadFile(
			filename,
			async function (file) {
				console.log('Loading file "' + filename + '"...');
				let xml = file instanceof ArrayBuffer ? new Uint8Array(file) : file;
				xml = TextEncoding.decode(xml, resolveUserCharpage());
				xml = xml.replace(/^.*<\?xml/, '<?xml');
				const parser = new DOMParser();
				const parsedXML = parser.parseFromString(xml, 'application/xml');
				const json = XmlParse.xml2json(parsedXML);
				callback.call(null, json);
				onEnd();
			},
			onEnd
		);
	}

	/**
	 * Load BSON to JS object / table
	 *
	 * @param {string} filename  File to load
	 * @param {object|array} targetTable
	 * @param {function} onEnd    Called when finished (success or error)
	 *
	 */
	function loadBSONFile(filename, targetTable, onEnd, isCurrent = () => true) {
		Client.loadFile(
			filename,
			function (arrayBuffer) {
				if (!isCurrent()) return;
				try {
					console.log('Loading file "' + filename + '"...');

					const bytes = new Uint8Array(arrayBuffer);
					let offset = 0;

					const docs = [];

					while (offset < bytes.length) {
						const size =
							bytes[offset] |
							(bytes[offset + 1] << 8) |
							(bytes[offset + 2] << 16) |
							(bytes[offset + 3] << 24);

						const slice = bytes.slice(offset, offset + size);
						docs.push(BSON.deserialize(slice));

						offset += size;
					}

					// ---- AS-IS TABLE HANDLING ----

					let data;
					if (docs.length === 1) {
						data = docs[0]; // single root document
					} else {
						data = docs; // true multi-doc BSON
					}

					// Clear target table
					for (const k in targetTable) {
						delete targetTable[k];
					}

					// If root has exactly ONE key, unwrap it
					if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 1) {
						const rootKey = Object.keys(data)[0];
						data = data[rootKey];
					}

					// Copy AS-IS
					Object.assign(targetTable, data);
				} catch (e) {
					console.error('BSON parse error:', e);
				} finally {
					if (onEnd) {
						onEnd();
					}
				}
			},
			onEnd
		);
	}

	return { loadTable, loadCSV, loadXMLFile, loadBSONFile };
}
