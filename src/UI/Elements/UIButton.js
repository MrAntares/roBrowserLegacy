/**
 * UI/Elements/UIButton.js
 *
 * <ui-button bg="btn_ok.bmp" hover="btn_ok_a.bmp" down="btn_ok_b.bmp">OK</ui-button>
 *
 * Replaces: <button data-background="btn_ok.bmp" data-hover="btn_ok_a.bmp" data-down="btn_ok_b.bmp">
 *
 * @author AoShinHo
 */

import DB from 'DB/DBManager.js';
import Client from 'Core/Client.js';
import Targa from 'Loaders/Targa.js';

class UIButton extends HTMLElement {
	connectedCallback() {
		if (this._initialized) return;
		this._initialized = true;
		const bg = this.getAttribute('bg');
		const hover = this.getAttribute('hover');
		const down = this.getAttribute('down');

		let bgUri = null,
			hoverUri = null,
			downUri = null;
		const state = { hover: false, down: false };

		const update = () => {
			if (state.down && downUri) {
				this.style.backgroundImage = `url(${downUri})`;
			} else if (state.hover && hoverUri) {
				this.style.backgroundImage = `url(${hoverUri})`;
			} else if (bgUri) {
				this.style.backgroundImage = `url(${bgUri})`;
			} else {
				this.style.backgroundImage = '';
			}
		};

		const loadBmp = (path, cb) => {
			if (!path) return;
			Client.loadFile(DB.INTERFACE_PATH + path, dataURI => {
				if (dataURI instanceof ArrayBuffer) {
					try {
						const tga = new Targa();
						tga.load(new Uint8Array(dataURI));
						cb(tga.getDataURL());
					} catch (e) {
						console.error(e.message);
					}
				} else {
					cb(dataURI);
				}
			});
		};

		loadBmp(bg, uri => {
			bgUri = uri;
			update();
		});
		loadBmp(hover, uri => {
			hoverUri = uri;
		});
		loadBmp(down, uri => {
			downUri = uri;
		});

		this.addEventListener('mouseover', () => {
			state.hover = true;
			update();
		});
		this.addEventListener('mouseout', () => {
			state.hover = false;
			state.down = false;
			update();
		});
		this.addEventListener('mousedown', () => {
			state.down = true;
			update();
		});
		this.addEventListener('mouseup', () => {
			state.down = false;
			update();
		});
	}
}

customElements.define('ui-button', UIButton);
export default UIButton;
