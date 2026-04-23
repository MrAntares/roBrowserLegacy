import GameEngine from 'Engine/GameEngine.js';
import Plugins from 'Plugins/PluginManager.js';

export const roInitSpinner = {
	add: function () {
		// The preloader already exists in index.html.
		// Just save the reference so it can be removed later.
		roInitSpinner.divElem = document.getElementById('ro-preloader');
	},
	remove: function () {
		const el = roInitSpinner.divElem;
		if (!el) return;
		// Fade out, depois remove
		el.classList.add('fade-out');
		const cleanup = () => {
			el.remove();
			roInitSpinner.divElem = null;
		};
		el.addEventListener('transitionend', cleanup);
		// Fallback in case transitionend does not trigger.
		setTimeout(cleanup, 400);
	}
};

window.roInitSpinner = roInitSpinner;

export function init() {
	// Save the reference to the preloader that is already in the HTML
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
