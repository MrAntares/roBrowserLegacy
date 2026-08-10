/**
 * main.js
 * Entry point for roBrowserLegacy (ES6 version)
 * Centralized loader for all applications.
 */
// eslint-disable-next-line
import Online from 'App/Online.js';
import { roInitSpinner } from 'App/PreLoader.js';
import Configs from 'Core/Configs.js';

const APP = {
	ONLINE: 1,
	MAPVIEWER: 2,
	GRFVIEWER: 3,
	MODELVIEWER: 4,
	STRVIEWER: 5,
	GRANNYMODELVIEWER: 6,
	EFFECTVIEWER: 7
};

const APP_NAMES = Object.freeze({
	online: APP.ONLINE,
	mapviewer: APP.MAPVIEWER,
	grfviewer: APP.GRFVIEWER,
	modelviewer: APP.MODELVIEWER,
	strviewer: APP.STRVIEWER,
	grannymodelviewer: APP.GRANNYMODELVIEWER,
	effectviewer: APP.EFFECTVIEWER
});

export function normalizeApplication(value) {
	if (typeof value === 'string') {
		const name = value.replace(/\.js$/i, '').toLowerCase();
		if (APP_NAMES[name]) return APP_NAMES[name];
	}
	const id = Number.parseInt(value, 10);
	return Object.values(APP).includes(id) ? id : APP.ONLINE;
}

/**
 * Launch the appropriate application based on config
 */
async function launch(config) {
	const appId = normalizeApplication(config.application);

	switch (appId) {
		case APP.ONLINE:
			break;

		case APP.MAPVIEWER:
			await import('App/MapViewer.js');
			break;

		case APP.GRFVIEWER:
			await import('App/GrfViewer.js');
			break;

		case APP.MODELVIEWER:
			await import('App/ModelViewer.js');
			break;

		case APP.STRVIEWER:
			await import('App/StrViewer.js');
			break;

		case APP.GRANNYMODELVIEWER:
			await import('App/GrannyModelViewer.js');
			break;

		case APP.EFFECTVIEWER:
			await import('App/EffectViewer.js');
			break;

		default:
			console.error('Unknown application ID:', appId);
			break;
	}

	window.dispatchEvent(new Event('robrowser-ready'));
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
		if (event.data && typeof event.data === 'object') {
			window.ROConfig = event.data;
			// Configs is populated by an IIFE at import time, which runs before this
			// config arrives via postMessage; apply the received config so options such
			// as 'api' are available (frame/popup API mode).
			Object.keys(window.ROConfig).forEach(key => Configs.set(key, window.ROConfig[key]));
			launch(window.ROConfig);
			window.removeEventListener('message', onMessage);
		}
	};
	window.addEventListener('message', onMessage, false);

	// Fallback/Spinner
	roInitSpinner.add();
}
