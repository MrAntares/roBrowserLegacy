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
	ScrollBar.images = {};

	/**
	 * Initialize scrollbar
	 */
	ScrollBar.init = function Init() {
		// Already loaded
		if (ScrollBar.complete) {
			return;
		}

		//Custom scrollbar
		Client.loadFiles(
			[
				DB.INTERFACE_PATH + 'scroll0down.bmp',
				DB.INTERFACE_PATH + 'scroll0mid.bmp',
				DB.INTERFACE_PATH + 'scroll0up.bmp',
				DB.INTERFACE_PATH + 'scroll0bar_down.bmp',
				DB.INTERFACE_PATH + 'scroll0bar_mid.bmp',
				DB.INTERFACE_PATH + 'scroll0bar_up.bmp'
			],
			function (down, mid, up, base_down, base_mid, base_up) {
				Texture.load(base_down, function () {
					var base_down = this;
					Texture.load(base_mid, function () {
						var base_mid = this;
						Texture.load(base_up, function () {
							var base_up = this;
							var base = document.createElement('canvas');
							var ctx = base.getContext('2d');
							base.width = base_up.width;
							base.height = base_up.height + base_mid.height + base_down.height;

							ctx.drawImage(base_up, 0, 0);
							ctx.drawImage(base_mid, 0, base_up.height);
							ctx.drawImage(base_down, 0, base_up.height + base_mid.height);

							jQuery('style:first').append(
								[
									'.ro-custom-scrollbar { position: absolute; right: 0; top: 0; width: 13px; z-index: 100; display: flex; flex-direction: column; }',
									'.ro-custom-scrollbar .btn-up { height: 12px; background-repeat: no-repeat; cursor: pointer; }',
									'.ro-custom-scrollbar .btn-down { height: 13px; background-repeat: no-repeat; cursor: pointer; }',
									'.ro-custom-scrollbar .track { flex: 1; background-repeat: repeat-y; position: relative; cursor: pointer; }',
									'.ro-custom-scrollbar .thumb { position: absolute; top: 0; left: 0; width: 100%; min-height: 10px; cursor: pointer; border-color: transparent; border-style: solid; border-width: 4px 0; box-sizing: border-box; }'
								].join('\n')
							);

							ScrollBar.images = {
								down: down,
								up: up,
								mid: mid,
								thumb: base.toDataURL()
							};

							ScrollBar.complete = true;
						});
					});
				});
			}
		);
	};

	ScrollBar.applyDOMScrollbar = function (element) {
		if (element._roScrollbarApplied) {
			if (jQuery(element).children('.ro-custom-scrollbar').length === 0) {
				// Rebuild missing scrollbar wrapper
				element._roScrollbarApplied = false;
			} else {
				if (element._roScrollbarRestart) {
					element._roScrollbarRestart();
				}
				return;
			}
		}
        
		if (!ScrollBar.complete) {
			setTimeout(function() {
				ScrollBar.applyDOMScrollbar(element);
			}, 100);
			return;
		}

		element._roScrollbarApplied = true;
		var $element = jQuery(element);
		
		if ($element.css('position') === 'static') {
			$element.css('position', 'relative');
		}

		// Ensure native scrollbar is removed and layout is preserved
		if (element._roOriginalPaddingRight === undefined) {
			element._roOriginalPaddingRight = parseInt($element.css('padding-right')) || 0;
		}

		$element.css({
			'overflow-y': 'hidden',
			'box-sizing': 'border-box',
			'padding-right': (element._roOriginalPaddingRight + 13) + 'px'
		});

		// Build scrollbar DOM wrapper
		var $wrapper = jQuery('<div class="ro-custom-scrollbar"></div>');
		var $upBtn   = jQuery('<div class="btn-up"></div>');
		var $track   = jQuery('<div class="track"></div>');
		var $thumb   = jQuery('<div class="thumb"></div>');
		var $downBtn = jQuery('<div class="btn-down"></div>');

		$track.append($thumb);
		$wrapper.append($upBtn).append($track).append($downBtn);
		$element.append($wrapper);

		// Apply background styles
		$upBtn.css({'background-image': 'url(' + ScrollBar.images.up + ')', 'background-color': 'transparent'});
		$downBtn.css({'background-image': 'url(' + ScrollBar.images.down + ')', 'background-color': 'transparent'});
		$track.css({'background-image': 'url(' + ScrollBar.images.mid + ')', 'background-color': 'transparent'});
		$thumb.css({
			'-webkit-border-image': 'url(' + ScrollBar.images.thumb + ') 4 0 4 0 fill',
			'border-image': 'url(' + ScrollBar.images.thumb + ') 4 0 4 0 fill'
		});

		var isDragging = false;
		var startY = 0;
		var startThumbY = 0;

		function updateThumb() {
			var h = $element[0].clientHeight;
			var sh = $element[0].scrollHeight;
			
			if (sh <= h) {
				$wrapper.hide();
				return;
			}
			$wrapper.show();

			var st = $element[0].scrollTop;

			// Sync wrapper size and position
			$wrapper.css({
				'top': st + 'px',
				'height': h + 'px'
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
		}

		var poller = null;

		element._roScrollbarRestart = function() {
			updateThumb();
			if (poller) {
				clearInterval(poller);
			}
			poller = setInterval(function() {
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

		$element.on('wheel', function(e) {
			var h = $element[0].clientHeight;
			var sh = $element[0].scrollHeight;
			if (sh <= h) {
				return;
			}
			
			var delta = e.originalEvent.deltaY;
			$element[0].scrollTop += delta;
			updateThumb();
			e.preventDefault();
		});

		$upBtn.mousedown(function() {
			$element[0].scrollTop -= 20;
			updateThumb();
		});

		$downBtn.mousedown(function() {
			$element[0].scrollTop += 20;
			updateThumb();
		});

		$thumb.on('pointerdown', function(e) {
			isDragging = true;
			startY = e.originalEvent.clientY;
			startThumbY = parseInt($thumb.css('top')) || 0;
			e.preventDefault();
			
			if (e.originalEvent.pointerId !== undefined) {
				try { 
					$thumb[0].setPointerCapture(e.originalEvent.pointerId); 
				} catch(ex) {
					// Ignore DOM exceptions on capture
				}
			}
		});

		$thumb.on('pointermove', function(e) {
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

		$thumb.on('pointerup pointercancel', function(e) {
			isDragging = false;
			if (e.originalEvent.pointerId !== undefined) {
				try {
					$thumb[0].releasePointerCapture(e.originalEvent.pointerId);
				} catch(ex) {
					// Ignore DOM exceptions
				}
			}
		});

		$track.mousedown(function(e) {
			if (e.target === $thumb[0]) {
				return;
			}
			var clickY = e.offsetY;
			var thumbTop = parseInt($thumb.css('top')) || 0;
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
