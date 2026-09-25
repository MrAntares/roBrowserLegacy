/**
 * Audio/SoundManager.js
 *
 * Sound Manager
 *
 * Manage sounds effects
 * Sounds are decoded once into Web Audio buffers and played through cheap
 * AudioBufferSourceNodes. The previous <audio>-element pool made Safari stutter
 * during fights (one media element per hit sound).
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import Client from 'Core/Client.js';
import Preferences from 'Preferences/Audio.js';
import Memory from 'Core/MemoryManager.js';
import glMatrix from 'Utils/gl-matrix.js';
import Session from 'Engine/SessionStorage.js';

const C_MAX_SOUND_INSTANCES = 10; // max simultaneous instances of the same sound
const C_SAME_SOUND_DELAY = 100; //ms

/**
 * Sound memory: currently playing instances per filename
 * { [filename]: { instances: [{ source, gain, vol }], lastTick } }
 */
const _sounds = {};

/**
 * Decoded sounds: { [filename]: Promise<AudioBuffer|null> }
 */
const _buffers = {};

let _playGen = 0;

/**
 * Shared audio context, created lazily
 */
let _context = null;

function getContext() {
	if (!_context) {
		const AudioContextClass = window.AudioContext || window.webkitAudioContext;
		if (!AudioContextClass) {
			return null;
		}
		_context = new AudioContextClass();

		// Browsers (Safari especially) start the context suspended until a user gesture
		const resume = () => {
			if (_context.state !== 'running') {
				_context.resume().catch(() => {});
			}
		};
		['pointerdown', 'keydown', 'touchend'].forEach(type => {
			window.addEventListener(type, resume, { capture: true, passive: true });
		});
	}
	return _context;
}

/**
 * Load and decode a sound (once per filename)
 *
 * @param {string} filename
 * @returns {Promise<AudioBuffer|null>}
 */
function getBuffer(filename) {
	if (!(filename in _buffers)) {
		const context = getContext();
		_buffers[filename] = new Promise(resolve => {
			Client.loadFile(
				`data/wav/${filename}`,
				url => {
					fetch(url)
						.then(response => response.arrayBuffer())
						.then(data => new Promise((ok, fail) => context.decodeAudioData(data, ok, fail)))
						.then(resolve)
						.catch(err => {
							console.warn('Failed to load sound:', filename, err);
							resolve(null);
						});
				},
				() => resolve(null)
			);
		});
	}
	return _buffers[filename];
}

/**
 * @Constructor
 */
class SoundManager {
	/**
	 * @var {float} sound volume
	 *
	 */
	static volume = Preferences.Sound.volume;

	/**
	 * Play a wav sound
	 *
	 * @param {string} filename
	 * @param {optional|number} vol (volume)
	 */
	static play(filename, vol) {
		// Some callers pass a position instead of a volume
		if (typeof vol !== 'number' || !isFinite(vol) || vol <= 0) {
			vol = 1;
		}
		const volume = vol * this.volume;
		if (volume <= 0 || !Preferences.Sound.play) {
			return;
		}

		const context = getContext();
		if (!context) {
			return;
		}

		const myGen = _playGen;
		getBuffer(filename).then(buffer => {
			if (!buffer || myGen !== _playGen || context.state !== 'running') {
				return;
			}

			if (!(filename in _sounds)) {
				_sounds[filename] = { instances: [], lastTick: 0 };
			}
			const entry = _sounds[filename];
			if (entry.lastTick > Date.now() - C_SAME_SOUND_DELAY || entry.instances.length >= C_MAX_SOUND_INSTANCES) {
				return;
			}

			const source = context.createBufferSource();
			const gain = context.createGain();
			source.buffer = buffer;
			gain.gain.value = Math.min(volume, 1.0);
			source.connect(gain);
			gain.connect(context.destination);

			const instance = { source, gain, vol };
			source.onended = () => {
				gain.disconnect();
				const current = _sounds[filename];
				if (current) {
					const pos = current.instances.indexOf(instance);
					if (pos !== -1) {
						current.instances.splice(pos, 1);
					}
				}
			};

			entry.instances.push(instance);
			entry.lastTick = Date.now();
			source.start();
		});
	}

	/**
	 * Play a wav sound with calculated position for volume
	 *
	 * @param {string} filename
	 * @param {optional|number} vol (volume)
	 */
	static playPosition(filename, srcPosition) {
		const dist = Math.floor(glMatrix.vec2.dist(srcPosition, Session.Entity.position));
		const vol = Math.max(1 - Math.abs(((dist - 1) * (1 - 0.01)) / (25 - 1) + 0.01), 0.1);
		SoundManager.play(filename, vol);
	}

	/**
	 * Stop a specify sound, or all sounds.
	 *
	 * @param {optional|string} filename to stop
	 */
	static stop(filename) {
		if (filename) {
			if (filename in _sounds) {
				stopInstances(_sounds[filename].instances);
				delete _sounds[filename];
			}
			return;
		}
		_playGen++;
		Object.keys(_sounds).forEach(key => {
			stopInstances(_sounds[key].instances);
			delete _sounds[key];
		});
		// Free decoded sounds and their loaded files
		Object.keys(_buffers).forEach(key => {
			delete _buffers[key];
		});
		const list = Memory.search(/\.wav$/);
		list.forEach(key => {
			Memory.remove(key);
		});
	}

	/**
	 * Change volume of all sounds
	 *
	 * @param {number} volume
	 */
	static setVolume(volume) {
		this.volume = Math.min(volume, 1.0);

		Preferences.Sound.volume = this.volume;
		Preferences.save();

		Object.keys(_sounds).forEach(key => {
			_sounds[key].instances.forEach(instance => {
				instance.gain.gain.value = Math.min(instance.vol * this.volume, 1.0);
			});
		});
	}
}

/**
 * Stop and disconnect playing instances
 *
 * @param {Array} instances
 */
function stopInstances(instances) {
	while (instances.length > 0) {
		const instance = instances.shift();
		instance.source.onended = null;
		try {
			instance.source.stop();
		} catch {
			// already stopped
		}
		instance.gain.disconnect();
	}
}

/**
 * Export
 */
export default SoundManager;
