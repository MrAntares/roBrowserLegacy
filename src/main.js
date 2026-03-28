/**
 * main.js
 * Entry point for roBrowserLegacy (ES6 version)
 * Centralized loader for all applications.
 */
import Online from 'App/Online.js';

const APP = {
	ONLINE: 1,
	MAPVIEWER: 2,
	GRFVIEWER: 3,
	MODELVIEWER: 4,
	STRVIEWER: 5,
	GRANNYMODELVIEWER: 6,
	EFFECTVIEWER: 7
};

/**
 * Launch the appropriate application based on config
 */
function launch(config) {
	const appId = parseInt(config.application, 10) || APP.ONLINE;

	switch (appId) {
		case APP.ONLINE:
			break;

		case APP.MAPVIEWER:
			import('App/MapViewer.js').then(mod => mod.default());
			break;

		case APP.GRFVIEWER:
			import('App/GrfViewer.js').then(mod => mod.default());
			break;

		case APP.MODELVIEWER:
			import('App/ModelViewer.js').then(mod => mod.default());
			break;

		case APP.STRVIEWER:
			import('App/StrViewer.js').then(mod => mod.default());
			break;

		case APP.GRANNYMODELVIEWER:
			import('App/GrannyModelViewer.js').then(mod => mod.default());
			break;

		case APP.EFFECTVIEWER:
			import('App/EffectViewer.js').then(mod => mod.default());
			break;

		default:
			console.error('Unknown application ID:', appId);
			break;
	}
}

// Global initialization
console.log('roBrowser ES6 Entry Point Initialized');

// If ROConfig is already in window (direct access)
if (window.ROConfig) {
	launch(window.ROConfig);
} else {
	// Wait for configuration via postMessage (API mode)
	const onMessage = event => {
		// Only accept messages from the parent window or opener (the page that loaded us)
		if (event.source !== window.parent && event.source !== window.opener) {
			return;
		}
		if (event.data && (event.data.application || event.data.servers)) {
			window.ROConfig = event.data;
			launch(window.ROConfig);
			window.removeEventListener('message', onMessage);
		}
	};
	window.addEventListener('message', onMessage, false);

	// Fallback/Spinner
	Online.roInitSpinner.add();
}
