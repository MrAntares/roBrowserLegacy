import GameEngine from 'Engine/GameEngine.js';
import Plugins from 'Plugins/PluginManager.js';

export const roInitSpinner = {
	add: function () {
		// Loading spinner ring
		const loading = document.createElement('div');
		loading.id = 'loading-element';
		loading.className = 'lds-dual-ring';

		const loadingStyle = document.createElement('style');
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
		roInitSpinner.styleElem = document.head.appendChild(loadingStyle);
		roInitSpinner.divElem = document.body.appendChild(loading);
	},
	remove: function () {
		roInitSpinner.styleElem?.remove();
		roInitSpinner.divElem?.remove();
	}
};

window.roInitSpinner = roInitSpinner;

export function init() {
	// Add spinner before starting the engine
	roInitSpinner.add();

	Plugins.init();
	GameEngine.init();

	window.onbeforeunload = function () {
		return 'Are you sure to exit roBrowser ?';
	};
}

export default {
	init: init,
	roInitSpinner: roInitSpinner
};

init();
