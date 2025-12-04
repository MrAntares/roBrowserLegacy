/**
 * Utils/HTMLEntity.js
 *
 * This is a plugin for ROBrowser to decode HTML entities.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Alisonrag
 */

define(function () {
	"use strict";

	function decodeHTMLEntities(str) {
		// this prevents any overhead from creating the object each time
		let element = document.createElement("div");
		if (str && typeof str === "string") {
			// strip script tags
			str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, "");
			element.innerHTML = str;
			str = element.textContent;
			element.textContent = "";
		}

		return str;
	}

	/**
	 * Export
	 */
	return {
		decodeHTMLEntities: decodeHTMLEntities,
	};
});
