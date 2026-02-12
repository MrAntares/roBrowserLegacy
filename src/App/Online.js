/**
 * App/Online.js
 *
 * Start roBrowser
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

window.roInitSpinner = {
	add: function () {
		'use strict';

		// Loading spinner ring
		var loading = document.createElement('div');
		loading.id = 'loading-element';
		loading.className = 'lds-dual-ring';

		var loadingStyle = document.createElement('style');
		loadingStyle.id = 'loading-style';
		loadingStyle.textContent = `
			.lds-dual-ring { color: #1c4c5b }
			.lds-dual-ring,
			.lds-dual-ring:after { box-sizing: border-box; }
			.lds-dual-ring {
				position: absolute;
				display: inline-block;
				width: 80px;
				height: 80px;
				top: 50%;
				left: 50%;
				margin-top: -40px;
				margin-left: -40px;
			}
			.lds-dual-ring:after {
				content: " ";
				display: block;
				width: 64px;
				height: 64px;
				margin: 8px;
				border-radius: 50%;
				border: 6.4px solid currentColor;
				border-color: currentColor transparent currentColor transparent;
				animation: lds-dual-ring 1.2s linear infinite;
			}
			@keyframes lds-dual-ring {
				0% { transform: rotate(0deg); }
				100% { transform: rotate(360deg); }
			}
		`;

		// roBrowser will append all the css in the first style tag in the DOM,
		// so we add a style tag before our own to avoid removing every style altogether,
		// when we remove the spinner later.
		document.head.appendChild(document.createElement('style'));
		// We also need to store a direct reference, because iframe messes with document
		window.roInitSpinner.styleElem = document.head.appendChild(loadingStyle);
		window.roInitSpinner.divElem = document.body.appendChild(loading);
	},
	remove: function () {
		'use strict';

		window.roInitSpinner.styleElem?.remove();
		window.roInitSpinner.divElem?.remove();
	}
};

// Add spinner before starting the require chain to let the user know things are happening in the background
window.roInitSpinner.add();

// Errors Handler (hack)
require.onError = function (err) {
	'use strict';

	if (require.defined('UI/Components/Error/Error')) {
		require('UI/Components/Error/Error').addTrace(err);
		return;
	}

	require(['UI/Components/Error/Error'], function (Errors) {
		Errors.addTrace(err);
	});
};

require({
	urlArgs: window.ROConfig.version,
	baseUrl: '../../src/',
	paths: {
		text: 'Vendors/text.require',
		jquery: 'Vendors/jquery-1.9.1'
	}
}, ['Engine/GameEngine', 'Plugins/PluginManager'], function (GameEngine, Plugins) {
	'use strict';

	Plugins.init();
	GameEngine.init();

	window.onbeforeunload = function () {
		return 'Are you sure to exit roBrowser ?';
	};
});
