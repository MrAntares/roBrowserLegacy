/**
 * applications/tools/tests/FileTester.js
 *
 * File Tester Helper
 * Presents the roBrowser Intro screen, lets the user pick GRF/files,
 * then iterates every matching file through a caller-supplied callback
 * so loaders can be smoke-tested in bulk.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import Client from 'Core/Client.js';
import Configs from 'Core/Configs.js';
import Thread from 'Core/Thread.js';
import Memory from 'Core/MemoryManager.js';
import Events from 'Core/Events.js';
import Intro from 'UI/Components/Intro/Intro.js';

// Always run in development mode for easier debugging
Configs.set('development', true);
Configs.set('saveFiles', false);

/**
 * File Tester
 *
 * @param {string}   ext      – file extension to search for (e.g. 'spr')
 * @param {Function} callback – called with the raw ArrayBuffer for each file
 */
class FileTester {
	constructor(ext, callback) {
		this.ext = ext;
		this.callback = callback;
	}

	/** Boot the thread, show the Intro UI, and wait for files */
	start() {
		Thread.hook('THREAD_READY', () => {
			Intro.onFilesSubmit = files => {
				Client.onFilesLoaded = () => {
					const pattern = new RegExp(`data\\\\[^\\0]+\\.${this.ext}`, 'gi');
					Client.search(pattern, list => this._run(list));
				};
				Client.init(files);
			};

			Intro.append();
			Events.process(Date.now() + 100);
		});

		Thread.init();
	}

	/**
	 * Iterate every matched file path, call the loader callback, report
	 * progress and errors live in the DOM.
	 *
	 * @param {string[]} list
	 */
	_run(list) {
		const { ext, callback } = this;
		const count = list.length;

		Intro.remove();

		document.body.innerHTML = `
			<h1>${ext.toUpperCase()} Tester</h1>
			<p>Loading each <code>.${ext}</code> file to detect parse errors…</p>
			<div><strong>Progress:</strong> <span id="log"></span></div>
			<br>
			<div id="error"><h2>Errors:</h2></div>
		`;
		document.body.style.cssText = 'background:#fff; overflow:auto; user-select:text;';

		const logEl   = document.getElementById('log');
		const errorEl = document.getElementById('error');
		let errors = 0;
		let index  = 0;
		const start  = Date.now();

		// Process up to 5 files concurrently
		const concurrency = Math.min(5, count);
		for (let i = 0; i < concurrency; i++) {
			this._loadNext(list, index++, { logEl, errorEl, count, start, callback, errors: () => errors, incErrors: () => errors++, getIndex: () => index, incIndex: () => index++ });
		}
	}

	_loadNext(list, i, ctx) {
		const { logEl, errorEl, count, start, callback } = ctx;

		Client.getFile(list[i], data => {
			const elapsed = Date.now() - start;
			const currentIndex = ctx.getIndex();
			const eta = Math.floor(((elapsed / currentIndex) * count - elapsed) * 0.001 + 1);
			logEl.textContent = `[${currentIndex + 1}/${count}] (ETA: ${eta}s) ${list[i]}`;

			try {
				callback(data);
			} catch (e) {
				errorEl.innerHTML += `
					<div style="margin-left:30px">
						<h3>${list[i]}</h3>
						<p>${e.message}</p>
						<pre>${e.stack}</pre>
					</div>`;
				ctx.incErrors();
			}

			// Free memory as we go
			Memory.remove(null, list[i]);
			ctx.incIndex();

			const next = ctx.getIndex();
			if (next < count) {
				this._loadNext(list, next, ctx);
			}

			// Done when all concurrent slots have finished
			if (next >= count + Math.min(5, count) - 1) {
				const secs = Math.floor((Date.now() - start) / 1000);
				const msg  = `${count} .${this.ext} files loaded — ${ctx.errors()} error(s) in ${secs}s`;
				logEl.textContent = msg;
				alert(msg);
			}
		});
	}
}

export default FileTester;