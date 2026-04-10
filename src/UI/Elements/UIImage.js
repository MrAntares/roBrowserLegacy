/**
 * UI/Elements/UIImage.js
 *
 * <ui-image src="basic_interface/titlebar_mid.bmp"></ui-image>
 *
 * Replaces: <div data-background="basic_interface/titlebar_mid.bmp">
 *
 * @author AoShinHo
 */

import DB from 'DB/DBManager.js';
import Client from 'Core/Client.js';
import Targa from 'Loaders/Targa.js';

class UIImage extends HTMLElement {
	connectedCallback() {
		if (this._initialized) return;
		this._initialized = true;
		this.style.display = 'none';
		this._loadSrc(this.getAttribute('src'));
	}

	static get observedAttributes() {
		return ['src'];
	}

	attributeChangedCallback(name, oldVal, newVal) {
		if (name === 'src') this._loadSrc(newVal);
	}

	_loadSrc(path) {
		if (!path) return;
		const target = this.parentElement;
		if (!target) return;

		Client.loadFile(DB.INTERFACE_PATH + path, dataURI => {
			if (dataURI instanceof ArrayBuffer) {
				try {
					const tga = new Targa();
					tga.load(new Uint8Array(dataURI));
					target.style.backgroundImage = `url(${tga.getDataURL()})`;
				} catch (e) {
					console.error(e.message);
				}
			} else {
				target.style.backgroundImage = `url(${dataURI})`;
			}
		});
	}
}

customElements.define('ui-image', UIImage);
export default UIImage;
