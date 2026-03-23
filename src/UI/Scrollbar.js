/**
 * UI/Scrollbar.js
 *
 * Manage custom scrollbar
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(['Utils/jquery', 'Utils/Texture', 'DB/DBManager', 'Core/Client'], function (jQuery, Texture, DB, Client) {
	'use strict';

	/**
	 * ScrollBar Namespace
	 */
	var ScrollBar = {};

	/**
	 * @var {boolean} does the scrollbar completely loaded ?
	 */
	ScrollBar.complete = false;
	ScrollBar.skins = {};

	/**
	 * Initialize scrollbar
	 */
	ScrollBar.init = function Init() {
		// Already loaded
		if (ScrollBar.complete) {
			return;
		}

		// List of skins to load
		var skinsToLoad = [
			{
				name: 'default',
				files: [
					DB.INTERFACE_PATH + 'scroll0down.bmp',
					DB.INTERFACE_PATH + 'scroll0mid.bmp',
					DB.INTERFACE_PATH + 'scroll0up.bmp',
					DB.INTERFACE_PATH + 'scroll0bar_down.bmp',
					DB.INTERFACE_PATH + 'scroll0bar_mid.bmp',
					DB.INTERFACE_PATH + 'scroll0bar_up.bmp'
				]
			},
			{
				name: 'chatbox',
				files: [
					DB.INTERFACE_PATH + 'basic_interface/dialscr_down.bmp',
					null,
					DB.INTERFACE_PATH + 'basic_interface/dialscr_up.bmp',
					null,
					null,
					null
				],
				colors: {
					track: '#000000',
					thumb: '#9a9a9a'
				},
				width: 10,
				btnHeight: 10,
				btnWidth: 10,
				trackWidth: 9
			}
		];

		var loadedCount = 0;

		skinsToLoad.forEach(function (skinInfo) {
			var files = skinInfo.files.filter(function (f) {
				return f !== null;
			});

			Client.loadFiles(files, function () {
				var args = arguments;
				var down = args[0];
				var mid = skinInfo.name === 'default' ? args[1] : null;
				var up = skinInfo.name === 'default' ? args[2] : args[1];

				var baseDown = skinInfo.name === 'default' ? args[3] : null;
				var baseMid = skinInfo.name === 'default' ? args[4] : null;
				var baseUp = skinInfo.name === 'default' ? args[5] : null;

				var finalizeSkin = function (thumbUrl) {
					ScrollBar.skins[skinInfo.name] = {
						down: down,
						up: up,
						mid: mid,
						thumb: thumbUrl,
						colors: skinInfo.colors || {},
						width: skinInfo.width,
						btnHeight: skinInfo.btnHeight,
						btnWidth: skinInfo.btnWidth,
						trackWidth: skinInfo.trackWidth
					};

					loadedCount++;
					if (loadedCount === skinsToLoad.length) {
						setupStyles();
						ScrollBar.complete = true;
					}
				};

				if (baseUp) {
					// Use a small helper to avoid deep nesting of Texture.load calls
					var loadedTextures = { down: null, mid: null, up: null };
					var checkAllLoaded = function () {
						if (loadedTextures.down && loadedTextures.mid && loadedTextures.up) {
							var base = document.createElement('canvas');
							var ctx = base.getContext('2d');
							var imgUp = loadedTextures.up;
							var imgMid = loadedTextures.mid;
							var imgDown = loadedTextures.down;

							base.width = imgUp.width;
							base.height = imgUp.height + imgMid.height + imgDown.height;

							ctx.drawImage(imgUp, 0, 0);
							ctx.drawImage(imgMid, 0, imgUp.height);
							ctx.drawImage(imgDown, 0, imgUp.height + imgMid.height);

							finalizeSkin(base.toDataURL());
						}
					};

					Texture.load(baseDown, function () {
						loadedTextures.down = this;
						checkAllLoaded();
					});
					Texture.load(baseMid, function () {
						loadedTextures.mid = this;
						checkAllLoaded();
					});
					Texture.load(baseUp, function () {
						loadedTextures.up = this;
						checkAllLoaded();
					});
				} else {
					finalizeSkin(null);
				}
			});
		});

		function setupStyles() {
			jQuery('style:first').append(
				[
					'.ro-custom-scrollbar { position: absolute; right: 0; top: 0; width: 13px; z-index: 100; display: flex; flex-direction: column; }',
					'.ro-custom-scrollbar .btn-up { height: 12px; background-repeat: no-repeat; cursor: pointer; }',
					'.ro-custom-scrollbar .btn-down { height: 13px; background-repeat: no-repeat; cursor: pointer; }',
					'.ro-custom-scrollbar .track { flex: 1; background-repeat: repeat-y; position: relative; cursor: pointer; }',
					'.ro-custom-scrollbar .thumb { position: absolute; top: 0; left: 0; width: 100%; min-height: 10px; cursor: pointer; border-color: transparent; border-style: solid; border-width: 4px 0; box-sizing: border-box; }'
				].join('\n')
			);
		}
	};

	/**
	 * Apply custom scrollbar to an element
	 * @param {HTMLElement} element
	 */
	ScrollBar.applyDOMScrollbar = function (element) {
		if (element._roScrollbarApplied) {
			var $wrapper = jQuery(element).children('.ro-custom-scrollbar');
			if ($wrapper.length === 0) {
				element._roScrollbarApplied = false;
			} else {
				var currentSkinName = element.dataset.scrollbarSkin || 'default';
				if (element._roScrollbarSkin !== currentSkinName) {
					// Skin changed, need to re-apply visuals
					element._roScrollbarApplied = false;
					$wrapper.remove();
				} else {
					if (element._roScrollbarRestart) {
						element._roScrollbarRestart();
					}
					return;
				}
			}
		}

		if (!ScrollBar.complete) {
			setTimeout(function () {
				ScrollBar.applyDOMScrollbar(element);
			}, 100);
			return;
		}

		element._roScrollbarApplied = true;
		var $element = jQuery(element);
		var skinName = element.dataset.scrollbarSkin || 'default';
		var skin = ScrollBar.skins[skinName] || ScrollBar.skins['default'];

		element._roScrollbarSkin = skinName;

		if ($element.css('position') === 'static') {
			$element.css('position', 'relative');
		}

		// Ensure native scrollbar is removed and layout is preserved
		if (element._roOriginalPaddingRight === undefined) {
			element._roOriginalPaddingRight = parseInt($element.css('padding-right')) || 0;
		}

		$element.css({
			'overflow-y': 'hidden',
			'box-sizing': 'border-box'
		});

		// Build scrollbar DOM wrapper
		var $scrollbar = jQuery('<div class="ro-custom-scrollbar skin-' + skinName + '"></div>');
		var $upBtn = jQuery('<div class="btn-up"></div>');
		var $track = jQuery('<div class="track"></div>');
		var $thumb = jQuery('<div class="thumb"></div>');
		var $downBtn = jQuery('<div class="btn-down"></div>');

		var width = skin.width || 13;
		$scrollbar.css('width', width + 'px');

		if (skin.btnHeight || skin.btnWidth) {
			var bHeight = skin.btnHeight || (skin.name === 'default' ? 12 : 13);
			var bWidth = skin.btnWidth || width;
			$upBtn.css({ height: bHeight + 'px', width: bWidth + 'px', margin: '0 auto' });
			$downBtn.css({ height: bHeight + 'px', width: bWidth + 'px', margin: '0 auto' });
		}

		$track.append($thumb);
		$scrollbar.append($upBtn).append($track).append($downBtn);
		$element.append($scrollbar);

		// Prevent clicks and interactions from passing through to the game world
		$scrollbar.on(
			'mousedown mouseup click dblclick contextmenu pointerdown pointerup pointermove wheel',
			function (e) {
				e.stopPropagation();
			}
		);

		// Apply background styles from skin
		$upBtn.css({ 'background-image': 'url(' + skin.up + ')', 'background-color': 'transparent' });
		$downBtn.css({ 'background-image': 'url(' + skin.down + ')', 'background-color': 'transparent' });

		if (skin.mid) {
			$track.css({ 'background-image': 'url(' + skin.mid + ')', 'background-color': 'transparent' });
		} else {
			$track.css({
				'background-image': 'none',
				'background-color': skin.colors.track || 'transparent',
				border: 'none',
				width: (skin.trackWidth || width) + 'px',
				margin: '0 auto'
			});
		}

		if (skin.thumb) {
			$thumb.css({
				'-webkit-border-image': 'url(' + skin.thumb + ') 4 0 4 0 fill',
				'border-image': 'url(' + skin.thumb + ') 4 0 4 0 fill',
				'background-color': 'transparent'
			});
		} else {
			var tWidth = skin.trackWidth || width;
			$thumb.css({
				'background-color': skin.colors.thumb || 'grey',
				'-webkit-border-image': 'none',
				'border-image': 'none',
				width: tWidth + 'px'
			});
		}

		var isDragging = false;
		var startY = 0;
		var startThumbY = 0;

		/**
		 * Update thumb position relative to scroll position
		 */
		var updateThumb = function () {
			var h = $element[0].clientHeight;
			var sh = $element[0].scrollHeight;

			if (sh <= h) {
				$scrollbar.hide();
				$element.css('padding-right', element._roOriginalPaddingRight + 'px');
				return;
			}

			$scrollbar.show();
			$element.css('padding-right', element._roOriginalPaddingRight + (skin.width || 13) + 'px');

			var st = $element[0].scrollTop;

			// Sync wrapper size and position
			$scrollbar.css({
				top: st + 'px',
				height: h + 'px',
				right: '0px'
			});

			var trackHeight = $track.height();
			if (trackHeight <= 0) {
				return;
			}

			var ratio = h / sh;
			var thumbHeight = Math.max(10, Math.floor(trackHeight * ratio));
			$thumb.css('height', thumbHeight + 'px');

			var maxScrollTop = sh - h;
			var maxThumbTop = trackHeight - thumbHeight;
			var thumbTop = (st / maxScrollTop) * maxThumbTop;

			$thumb.css('top', thumbTop + 'px');
		};

		var poller = null;

		element._roScrollbarRestart = function () {
			updateThumb();
			if (poller) {
				clearInterval(poller);
			}
			poller = setInterval(function () {
				if (!$element.closest('body').length) {
					clearInterval(poller);
					poller = null;
					return;
				}
				updateThumb();
			}, 300);
		};

		// Start tracking content height
		element._roScrollbarRestart();

		$element.on('wheel', function (e) {
			var h = $element[0].clientHeight;
			var sh = $element[0].scrollHeight;
			if (sh <= h) {
				return;
			}

			var delta = e.originalEvent.deltaY;
			$element[0].scrollTop += delta;
			updateThumb();
			e.preventDefault();
			e.stopPropagation();
		});

		$upBtn.mousedown(function () {
			$element[0].scrollTop -= 20;
			updateThumb();
		});

		$downBtn.mousedown(function () {
			$element[0].scrollTop += 20;
			updateThumb();
		});

		$thumb.on('pointerdown', function (e) {
			isDragging = true;
			startY = e.originalEvent.clientY;
			startThumbY = parseInt($thumb.css('top'), 10) || 0;
			e.preventDefault();

			if (e.originalEvent.pointerId !== undefined) {
				try {
					$thumb[0].setPointerCapture(e.originalEvent.pointerId);
				} catch (ex) {
					// Ignore DOM exceptions on capture
				}
			}
		});

		$thumb.on('pointermove', function (e) {
			if (!isDragging) {
				return;
			}

			var h = $element[0].clientHeight;
			var sh = $element[0].scrollHeight;
			var trackHeight = $track.height();
			var thumbHeight = $thumb.height();

			var maxScrollTop = sh - h;
			var maxThumbTop = trackHeight - thumbHeight;

			var deltaY = e.originalEvent.clientY - startY;
			var newThumbTop = Math.max(0, Math.min(startThumbY + deltaY, maxThumbTop));

			var percentage = newThumbTop / maxThumbTop;
			$element[0].scrollTop = percentage * maxScrollTop;
			updateThumb();
		});

		$thumb.on('pointerup pointercancel', function (e) {
			isDragging = false;
			if (e.originalEvent.pointerId !== undefined) {
				try {
					$thumb[0].releasePointerCapture(e.originalEvent.pointerId);
				} catch (ex) {
					// Ignore DOM exceptions
				}
			}
		});

		$track.mousedown(function (e) {
			if (e.target === $thumb[0]) {
				return;
			}
			var clickY = e.offsetY;
			var thumbTop = parseInt($thumb.css('top'), 10) || 0;
			if (clickY < thumbTop) {
				$element[0].scrollTop -= $element[0].clientHeight;
			} else {
				$element[0].scrollTop += $element[0].clientHeight;
			}
			updateThumb();
		});

		setTimeout(updateThumb, 0);
	};

	/**
	 * Export
	 */
	return ScrollBar;
});
