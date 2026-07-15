// applications/shared/config-loader.js
//
// Shared configuration helpers used by the demo build targets so the
// "load an optional gitignored Config.local.js and deep-merge it" logic lives
// in one place instead of being copy-pasted into every entry point.
//
// Exposes `window.ROConfigLoader` with:
//   - deepMerge(target, source)
//   - loadLocalConfig(src, done): injects an optional Config.local.js (which
//       may set `window.ROConfigLocal`) and always calls `done()`, whether the
//       file exists or not.
//   - buildConfig(base, extra): deep-merges base <- window.ROConfigLocal <- extra.
(function (root) {
	function deepMerge(target, source) {
		for (var key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
					target[key] = deepMerge(target[key] || {}, source[key]);
				} else {
					target[key] = source[key];
				}
			}
		}
		return target;
	}

	function loadLocalConfig(src, done) {
		var script = document.createElement('script');
		script.src = src || 'Config.local.js';
		script.onload = function () {
			done();
		};
		script.onerror = function () {
			console.log(script.src + ' not found, using demo defaults');
			done();
		};
		document.head.appendChild(script);
	}

	function buildConfig(base, extra) {
		var config = deepMerge({}, base || {});
		if (root.ROConfigLocal) {
			config = deepMerge(config, root.ROConfigLocal);
		}
		if (extra) {
			config = deepMerge(config, extra);
		}
		return config;
	}

	root.ROConfigLoader = {
		deepMerge: deepMerge,
		loadLocalConfig: loadLocalConfig,
		buildConfig: buildConfig
	};
})(typeof window !== 'undefined' ? window : this);
