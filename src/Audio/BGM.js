/**
 * Audio/BGM.js
 *
 * BGM Manager
 *
 * Class to Manage BGM (RO background music)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define(['Core/Client', 'Preferences/Audio'], function (Client, Preferences) {
	'use strict';

	/**
	 * BGM NameSpace
	 */
	var BGM = {};

	BGM.filename = null;
	BGM.volume = Preferences.BGM.volume;
	BGM.extension = 'mp3';
	BGM.isInit = false;
	BGM.audio = document.createElement('audio');

	/**
	 * Initialize player
	 * Fixed a known bug
	 */
	BGM.init = function init() {
		if (BGM.isInit) {
			return;
		}

		BGM.isInit = true;

		// Buggy looping for HTM5 Audio...
		if (typeof BGM.audio.loop === 'boolean') {
			BGM.audio.loop = true;
			return;
		}

		// Work around
		BGM.audio.addEventListener(
			'ended',
			function () {
				BGM.audio.currentTime = 0;
				BGM.audio.play();
			},
			false
		);
	};

	/**
	 * Test audio extension from a list to see what format the browser can read
	 *
	 * @param {Array} extensions list
	 */
	BGM.setAvailableExtensions = function setAvailableExtensions(extensions) {
		var i, count;
		var audio = this.audio;

		if (!extensions || !extensions.length) {
			extensions = ['mp3'];
		}

		// Find supported audio file from list
		for (i = 0, count = extensions.length; i < count; ++i) {
			if (audio.canPlayType('audio/' + extensions[i]).replace(/no/i, '')) {
				this.extension = extensions[i];
				BGM.init();
				return;
			}
		}
	};

	/**
	 * Play the audio file specify
	 *
	 * @param {string} filename
	 */
	BGM.play = function play(filename) {
		// Nothing to play
		if (!filename) {
			return;
		}

		// Remove the "BGM/" part
		if (filename.match(/bgm/i)) {
			filename = filename.match(/\w+\.mp3/i).toString();
		}

		// If it's the same file, check if it's already playing
		if (this.filename === filename) {
			if (!this.audio.paused) {
				return;
			}
		} else {
			this.filename = filename;
		}

		// load the file.
		if (Preferences.BGM.play) {
			Client.loadFile('BGM/' + filename, function (url) {
				BGM.load(url);
			});
		}
	};

	/**
	 * Load the audio file
	 *
	 * @param {string} url (HTTP / DATA URI or BLOB)
	 */
	BGM.load = function load(url) {
		if (!Preferences.BGM.play) {
			return;
		}

		// Add support for other extensions, only supported with
		// remote audio files.
		if (!url.match(/^(blob|data):/)) {
			url = url.replace(/mp3$/i, BGM.extension);
		}

		BGM.audio.src = url;
		BGM.audio.volume = this.volume;
		BGM.audio.play().catch(error => {
			console.error('Failed to play "BGM/' + this.filename + '": ' + error.message);
		});
	};

	/**
	 * Stop the BGM
	 */
	BGM.stop = function stop() {
		BGM.audio.pause();
	};

	/**
	 * Change the volume of the BGM
	 *
	 * @param {number} volume
	 */
	BGM.setVolume = function setVolume(volume) {
		BGM.volume = volume;
		Preferences.BGM.volume = volume;
		Preferences.save();

		BGM.audio.volume = volume;
	};

	/**
	 * Export
	 */
	return BGM;
});
