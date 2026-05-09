/**
 * api.js
 *
 * Robrowser application entry, starting instance.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
/* eslint-disable */
import ApiEnums from 'Api/ApiEnums.js';
(function ROAPI() {
	'use strict';

	/**
	 * @Constructor
	 */
	function ROBrowser(options) {
		if (typeof options === 'object') {
			Object.assign(this.config, options);
		}
	}

	/**
	 * @Enum Robrowser type
	 * Moved to src/Api/ApiEnums.js.
	 */
	ROBrowser.TYPE = Object.assign({}, ApiEnums.TYPE);

	/**
	 * @Enum Robrowser Applications
	 * Moved to src/Api/ApiEnums.js
	 */
	ROBrowser.APP = Object.assign({}, ApiEnums.APP);

	/**
	 * @type {Object} ROBrowser configuration object
	 * Default config moved to src/Api/ApiConfig.js.
	 *
	 * ROBrowser.config is for config *overrides* only.
	 *
	 * The default config is merged with ROBrowser's overrides
	 * by Core/Configs.js on init.
	 */
	ROBrowser.prototype.config = {};

	/**
	 * @type {string} roBrowser api window path
	 */
	ROBrowser.prototype.baseUrl = (function () {
		var script = document.getElementsByTagName('script');
		return script[script.length - 1].src
			.replace(/\/[^\/]+\.js.*/, '/api.js') // redirect compiled script
			.replace(/\/src\/.*/, '/api.js'); // fix error with cache (FF)
	})().replace('.js', '.html');

	/**
	 * Start ROBrowser Instance
	 */
	ROBrowser.prototype.start = function Start() {
		switch (this.config.type) {
			// Create Popup
			case ROBrowser.TYPE.POPUP:
				this.config.width = this.config.width || '800';
				this.config.height = this.config.height || '600';

				this._APP = window.open(
					this.baseUrl + '?' + (this.config.version === undefined ? '' : this.config.version),
					'_blank',
					[
						'directories=0',
						'fullscreen=0',
						'top=' + ((window.innerHeight || document.body.clientHeight) - this.config.height) / 2,
						'left=' + ((window.innerWidth || document.body.clientWidth) - this.config.width) / 2,
						'height=' + this.config.height,
						'width=' + this.config.width,
						'location=0',
						'menubar=0',
						'resizable=0',
						'scrollbars=0',
						'status=0',
						'toolbar=0'
					].join(',')
				);
				break;

			// Append ROBrowser to an element
			case ROBrowser.TYPE.FRAME:
				this.config.width = this.config.width || '100%';
				this.config.height = this.config.height || '100%';

				var frame = document.createElement('iframe');
				frame.src = this.baseUrl + '?' + Math.random() + location.hash; // fix bug on firefox
				frame.width = this.config.width;
				frame.height = this.config.height;
				frame.style.border = 'none';

				frame.setAttribute('allowfullscreen', 'true');
				frame.setAttribute('webkitallowfullscreen', 'true');
				frame.setAttribute('mozallowfullscreen', 'true');

				if (this.config.target) {
					while (this.config.target.firstChild) {
						this.config.target.removeChild(this.config.target.firstChild);
					}
					this.config.target.appendChild(frame);
				}

				// Remove parent page preloader — the iframe handles its own loading
				var parentPreloader = document.getElementById('ro-preloader');
				if (parentPreloader) parentPreloader.remove();

				this._APP = frame.contentWindow;
				break;

			// Append roBrowser inline locally
			case ROBrowser.TYPE.INLINE:
				this.config.width = this.config.width || '100%';
				this.config.height = this.config.height || '100%';

				if (this.config.target) {
					while (this.config.target.firstChild) {
						this.config.target.removeChild(this.config.target.firstChild);
					}
					var container = document.createElement('div');
					container.style.width =
						typeof this.config.width === 'number' ? this.config.width + 'px' : this.config.width;
					container.style.height =
						typeof this.config.height === 'number' ? this.config.height + 'px' : this.config.height;
					container.style.position = 'relative';
					this.config.target.appendChild(container);
					// redefine target to the inner container
					this.config.target = container;
				}

				window.ROConfig = this.config;

				var url = new URL(this.baseUrl);
				var path = url.pathname;
				var projectRoot = path.split('/applications/')[0] + '/';

				if (!document.querySelector('script[type="importmap"]')) {
					var sharedScript = document.createElement('script');
					sharedScript.src = projectRoot + 'applications/shared/importmap.js';
					sharedScript.dataset.projectRoot = projectRoot;
					sharedScript.onload = function () {
						if (!document.querySelector('script[data-api="robrowser-main"]')) {
							var s2 = document.createElement('script');
							s2.type = 'module';
							s2.dataset.api = 'robrowser-main';
							s2.textContent = "import '" + projectRoot + "src/main.js';";
							document.head.appendChild(s2);
						}
					};
					sharedScript.onerror = function () {
						console.error('Failed to load roBrowser import map from: ' + sharedScript.src);
					};
					document.head.appendChild(sharedScript);
				} else if (!document.querySelector('script[data-api="robrowser-main"]')) {
					var s2 = document.createElement('script');
					s2.type = 'module';
					s2.dataset.api = 'robrowser-main';
					s2.textContent = "import '" + projectRoot + "src/main.js';";
					document.head.appendChild(s2);
				}

				var self = this;
				window.addEventListener(
					'robrowser-ready',
					function onAppReady() {
						window.removeEventListener('robrowser-ready', onAppReady, false);
						if (self.onReady) {
							self.onReady();
						}
					},
					false
				);

				this._APP = window;
				break;
			default:
				console.error('type is not defined in your Config.local.js. This value cannot be set in the defaults. Please set it to an appropriate value for your environment. See also: src/Api/ApiEnums.js for a list of valid values.');
				throw new Error('Config invalid! Set type in Config.local.js!');
				break;
		}

		// Wait for robrowser to be ready
		var _this = this;
		function OnMessage(event) {
			if (_this.baseUrl.indexOf(event.origin) === 0) {
				clearInterval(_this._Interval);
				window.removeEventListener('message', OnMessage, false);

				if (_this.onReady) {
					_this.onReady();
				}
			}
		}

		// Start waiting for robrowser
		if (this.config.type !== ROBrowser.TYPE.INLINE) {
			this._Interval = setInterval(WaitForInitialization.bind(this), 100);
			window.addEventListener('message', OnMessage, false);
		}
	};

	/**
	 * Spam the window until there is an answer
	 * No onload event from external iframe/popup
	 */
	function WaitForInitialization() {
		this._APP.postMessage(JSON.parse(JSON.stringify(this.config)), '*');
	}

	/**
	 * Export
	 */
	window.ROBrowser = ROBrowser;
})();
