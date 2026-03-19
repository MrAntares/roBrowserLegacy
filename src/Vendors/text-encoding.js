define(function (require) {
	'use strict';
	var iconv = require('./iconv-lite');

	/**
	 * Exports
	 */
	var TextEncoding = {

		setCharset: function setCharset(charset) {
			var supported = ['windows-1252', 'windows-949', 'windows-1251', 'windows-932'];
			if (supported.indexOf(charset) === -1 && !this.warned) {
				console.warn('%c[Warning] You are using a ' + charset + ' charset. \nIf you have some charset ' +
					'problem set ROConfig.servers[<index>].disableKorean to true or use a proper charset !',
					'font-weight:bold; color:red; font-size:14px');
				this.warned = true;
			}
			this.userCharset = charset;
		},

		encode: function encode(data, charset) {
			return iconv.encode(data, charset || this.userCharset);
		},

		decode: function decode(data, charset) {
			return iconv.decode(data, charset || this.userCharset);
		},

		decodeString: function decodeString(str) {
			if (!str) {
				return '';
			}

			var i, count;
			var data;

			count = str.length;
			data = new Uint8Array(count);

			for (i = 0; i < count; ++i) {
				data[i] = str.charCodeAt(i);
			}

			return iconv.decode(data, this.userCharset);
		},

		detectEncodingByLangtype: detectEncodingByLangtype
	};

	function detectEncodingByLangtype(langType, disableKorean) {
		var result;
		/// Special thanks to curiosity, siriuswhite and ai4rei. See:
		/// - http://hercules.ws/wiki/Clientinfo.xml
		/// - http://forum.robrowser.com/index.php?topic=32231
		/// - http://siriuswhite.de/rodoc/codepage.html
		switch (langType) {
			case 0x00: // SERVICETYPE_KOREA
				result = 'windows-949';
				break;

			case 0x01: // SERVICETYPE_AMERICA
				result = 'windows-1252';
				break;

			case 0x02: // SERVICETYPE_JAPAN
				result = 'shift-jis';
				break;

			case 0x03: // SERVICETYPE_CHINA
				result = 'gbk';
				break;

			case 0x04: // SERVICETYPE_TAIWAN
				result = 'big5';
				break;

			case 0x05: // SERVICETYPE_THAI
				result = 'windows-874';
				break;

			case 0x06: // SERVICETYPE_INDONESIA
			case 0x07: // SERVICETYPE_PHILIPPINE
			case 0x08: // SERVICETYPE_MALAYSIA
			case 0x09: // SERVICETYPE_SINGAPORE
			case 0x0a: // SERVICETYPE_GERMANY
			case 0x0b: // SERVICETYPE_INDIA
			case 0x0c: // SERVICETYPE_BRAZIL
			case 0x0d: // SERVICETYPE_AUSTRALIA
				result = 'windows-1252';
				break;
			case 0x0e: // SERVICETYPE_RUSSIA
				result = 'windows-1251';
				break;

			case 0x0f: // SERVICETYPE_VIETNAM
				result = 'windows-1258';
				break;

				// Not supported by the encoder/decoder, default to windows-1252
				//case 0x11: // SERVICETYPE_CHILE
				//	result = 'windows-1145';
				//	break;

			case 0x12: // SERVICETYPE_FRANCE
				result = 'windows-1252';
				break;

			case 0x13: // SERVICETYPE_UAE
				result = 'windows-1256';
				break;

				/////////////////////////////////////////////////////
				// CUSTOM TYPES                                    //
				// Only use them if you know what you are doing ;) //
				/////////////////////////////////////////////////////
			case 0xa0: // 160 - Central European
				result = 'windows-1250';
				break;

			case 0xa1: // 161 - Greek
				result = 'windows-1253';
				break;

			case 0xa2: // 162 - Tukish
				result = 'windows-1254';
				break;

			case 0xa3: // 163 - Hebrew
				result = 'windows-1255';
				break;

			case 0xa4: // 164 - Estonian, Latvian, Lithuaninan
				result = 'windows-1257';
				break;

				/////////////////////////////////////////////////////
				// Custom unicode types                            //
				// Only use them if you know what you are doing ;) //
				/////////////////////////////////////////////////////
			case 0xf0: // 240 - UTF-8
				result = 'utf-8';
				break;
			case 0xf1: // 241 - UTF-16LE
				result = 'utf-16le';
				break;
			case 0xf2: // 242 - UTF-16BE
				result = 'utf-16be';
				break;

			default: // Latin1
				result = 'windows-1252';
				break;
		}

		if (disableKorean) {
			result = 'windows-1252';
		}

		this.setCharset(result);

		return result;
	}

	TextEncoding.setCharset('windows-1252');

	return TextEncoding;
});
