/**
 * UI/Components/Error/Error.js
 *
 * Error screen
 * Don't use components class, if there is an error on this module will never be used...
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import _htmlText from './Error.html?raw';
import _cssText from './Error.css?raw';
import jQuery from 'Vendors/jquery.js';

import _htmlText from './Error.html?raw';
import _cssText from './Error.css?raw';
import jQuery from 'Vendors/jquery.js';

/**
 * Error Namespace
 */
let Error = {};

/**
 * Initialize Metaling
 */
Error.init = function init() {
	this.ui = jQuery(_htmlText);

	// Add view to html
	let style = jQuery('style:first');
	if (!style.length) {
		style = jQuery('<style type="text/css"></style>').appendTo('head');
	}
	style.append('\n' + _cssText);
	jQuery('body').html(this.ui);

	this.ui.css('backgroundImage', 'url(' + new URL('./error.png', import.meta.url).href + ')');
};

/**
 * Add trace info to UI
 *
 * @param {Error} error
 */
Error.addTrace = function addTrace(error) {
	console.error(error);
	let url = new URL('../../../', import.meta.url).href;
	error = error.stack || error;

	url = url.replace(/\/([^\/]+)$/g, '/');
	error = error.replace(/\n/g, '<br/>');
	error = error.replace(new RegExp(url, 'g'), '');
	error = error.replace(/\?[^\:]+/g, '');

	if (!this.ui) {
		this.init();
	}

	this.ui.find('.trace').append(error + '<br />');
};

/**
 * Stored component and return it
 */
export default Error;
