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
	add: function(){
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
		
		document.head.appendChild(loadingStyle);
		document.body.appendChild(loading);
	},
	remove: function(){
		document.getElementById('loading-element').remove();
		document.getElementById('loading-style').remove();
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

	require(['UI/Components/Error/Error'], function( Errors ){
		Errors.addTrace(err);
	});
};

require( {
	urlArgs: ROConfig.version,
	baseUrl: './src/',
	paths: {
		text:   'Vendors/text.require',
		jquery: 'Vendors/jquery-1.9.1'
	}
},
	['Engine/GameEngine', 'Core/Context', 'Plugins/PluginManager'],
	function(GameEngine,        Context,           Plugins) {
		'use strict';

		Plugins.init();
		GameEngine.init();

		if (!Context.Is.APP) {
			window.onbeforeunload = function() {
				return 'Are you sure to exit roBrowser ?';
			};
		}
	}
);
