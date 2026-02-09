/**
 * Utils/Base62.js
 *
 * This is a plugin for ROBrowser to convert from and to Base62 format.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Alisonrag
 */

define(function ()
{
	'use strict';

	var base62_alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

	// encode
	function encode(number)
	{
		var result = '';
		while (number > 0)
		{
			result = base62_alphabet[number % 62] + result;
			number = Math.floor(number / 62);
		}
		return result;
	}

	// decode
	function decode(string)
	{
		var result = 0;
		for (var i = 0; i < string.length; i++)
		{
			result = result * 62 + base62_alphabet.indexOf(string[i]);
		}
		return result;
	}

	/**
	 * Export
	 */
	return {
		encode: encode,
		decode: decode,
		base62_alphabet: base62_alphabet
	};
});
