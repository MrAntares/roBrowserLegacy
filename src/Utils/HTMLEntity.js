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
			element.innerHTML = str;
			
			// Remove script tags and other dangerous elements
		    element.querySelectorAll("script, iframe, object, embed").forEach(n => n.remove());

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
