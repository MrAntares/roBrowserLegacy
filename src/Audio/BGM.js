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

import Client from 'Core/Client.js';
import Preferences from 'Preferences/Audio.js';

/**
 * BGM NameSpace
 */
class BGM {
	static filename = null;
	static volume = Preferences.BGM.volume;
	static extension = 'mp3';
	static isInit = false;
	static audio = document.createElement('audio');

	/**
	 * Initialize player
	 * Fixed a known bug
	 */
	static init() {
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
			() => {
				BGM.audio.currentTime = 0;
				BGM.audio.play();
			},
			false
		);
	}

	/**
	 * Test audio extension from a list to see what format the browser can read
	 *
	 * @param {Array} extensions list
	 */
	static setAvailableExtensions(extensions) {
		let i, count;
		const audio = BGM.audio;

		if (!extensions || !extensions.length) {
			extensions = ['mp3'];
		}

		// Find supported audio file from list
		for (i = 0, count = extensions.length; i < count; ++i) {
			if (audio.canPlayType(`audio/${extensions[i]}`).replace(/no/i, '')) {
				BGM.extension = extensions[i];
				BGM.init();
				return;
			}
		}
	}

	/**
	 * Play the audio file specify
	 *
	 * @param {string} filename
	 */
	static play(filename) {
		// Nothing to play
		if (!filename) {
			return;
		}

		// Remove the "BGM/" part
		if (filename.match(/bgm/i)) {
			filename = filename.match(/\w+\.mp3/i)?.toString();
			if (!filename) {
				return;
			}
		}

		// If it's the same file, check if it's already playing
		if (BGM.filename === filename) {
			if (!BGM.audio.paused) {
				return;
			}
		} else {
			BGM.filename = filename;
		}

		// load the file.
		if (Preferences.BGM.play) {
			Client.loadFile(`BGM/${filename}`, url => {
				BGM.load(url);
			});
		}
	}

	/**
	 * Load the audio file
	 *
	 * @param {string} url (HTTP / DATA URI or BLOB)
	 */
	static load(url) {
		if (!Preferences.BGM.play) {
			return;
		}

		// Add support for other extensions, only supported with
		// remote audio files.
		if (!url.match(/^(blob|data):/)) {
			url = url.replace(/mp3$/i, BGM.extension);
		}

		BGM.audio.src = url;
		BGM.audio.volume = BGM.volume;
		BGM.audio.play().catch(error => {
			console.error(`Failed to play "BGM/${BGM.filename}": ${error.message}`);
		});
	}

	/**
	 * Stop the BGM
	 */
	static stop() {
		BGM.audio.pause();
	}

	/**
	 * Change the volume of the BGM
	 *
	 * @param {number} volume
	 */
	static setVolume(volume) {
		BGM.volume = volume;
		Preferences.BGM.volume = volume;
		Preferences.save();

		BGM.audio.volume = volume;
	}
}
/**
 * Export
 */
export default BGM;
