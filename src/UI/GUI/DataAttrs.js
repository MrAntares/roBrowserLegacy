import Targa from 'Loaders/Targa.js';
import whenDrawn from 'UI/WhenDrawn.js';
import { ensureDeps, getClient, getDB } from 'UI/GUI/GUIDeps.js';

export function processDataAttrs(node, { text = true, images = true, deferredFrom } = {}) {
	if (!getClient() || !getDB()) {
		ensureDeps().then(() => processDataAttrs(node, { text, images, deferredFrom }));
		return;
	}
	const background = node.dataset.background;
	const hover = node.dataset.hover;
	const down = node.dataset.down;
	const active = node.dataset.active;
	const msgId = node.dataset.text;
	const preload = node.dataset.preload;
	const DB = getDB();
	const Client = getClient();
	let bgUri = null;
	let hoverUri = null;
	let downUri = null;
	let activeUri = null;

	const state = { hover: false, down: false, active: false };

	const updateBg = () => {
		if (state.down && downUri) {
			node.style.backgroundImage = `url(${downUri})`;
		} else if (state.active && activeUri) {
			node.style.backgroundImage = `url(${activeUri})`;
		} else if (state.hover && hoverUri) {
			node.style.backgroundImage = `url(${hoverUri})`;
		} else if (bgUri) {
			node.style.backgroundImage = `url(${bgUri})`;
		} else {
			node.style.backgroundImage = '';
		}
	};
	// Localized text
	if (text && msgId && DB.getMessage(msgId, '')) {
		node.textContent = DB.getMessage(msgId, '');
	}

	if (!images) return;
	// Default background
	if (background) {
		Client.loadFile(`${DB.INTERFACE_PATH}${background}`, dataURI => {
			bgUri = dataURI;
			if (dataURI instanceof ArrayBuffer) {
				try {
					const tga = new Targa();
					tga.load(new Uint8Array(dataURI));
					bgUri = tga.getDataURL();
				} catch (e) {
					console.error(e.message);
				}
			}
			// Fetched late, the window may have set its own background
			// meanwhile (a mini layout, a selected tab): that one stays.
			if (deferredFrom !== undefined && node.style.backgroundImage !== deferredFrom) return;
			updateBg();
		});
	}

	// Active background
	if (active) {
		Client.loadFile(`${DB.INTERFACE_PATH}${active}`, dataURI => {
			activeUri = dataURI;
			if (node.classList.contains('active')) {
				state.active = true;
				updateBg();
			}
		});

		const observer = new MutationObserver(mutations => {
			for (const m of mutations) {
				if (m.attributeName === 'class') {
					const isActive = node.classList.contains('active');
					if (state.active !== isActive) {
						state.active = isActive;
						updateBg();
					}
				}
			}
		});

		observer.observe(node, { attributes: true, attributeFilter: ['class'] });

		node.addEventListener('x_remove', () => observer.disconnect(), { once: true });
		if (!node._roActiveObserver) {
			node._roActiveObserver = observer;
		}
	}

	// Hover background
	if (hover) {
		Client.loadFile(`${DB.INTERFACE_PATH}${hover}`, dataURI => {
			hoverUri = dataURI;
		});
		node.addEventListener('mouseover', () => {
			state.hover = true;
			updateBg();
		});
		node.addEventListener('mouseout', () => {
			state.hover = false;
			updateBg();
		});
	}

	// Down background
	if (down) {
		Client.loadFile(`${DB.INTERFACE_PATH}${down}`, dataURI => {
			downUri = dataURI;
		});
		node.addEventListener('mousedown', () => {
			state.down = true;
			updateBg();
		});
		node.addEventListener('mouseup', () => {
			state.down = false;
			updateBg();
		});
		if (!hover) {
			node.addEventListener('mouseout', () => {
				state.down = false;
				state.hover = false;
				updateBg();
			});
		}
	}

	// Preload images
	if (preload) {
		const files = preload.split(';').map(f => `${DB.INTERFACE_PATH}${f.trim()}`);
		Client.loadFiles(files);
	}
}

export function processAllDataAttrs(component, deferImages = false) {
	const root = component._shadow || component._host;
	if (!root) return;

	const selector = '[data-background],[data-hover],[data-down],[data-active],[data-text],[data-preload]';
	const nodes = root.querySelectorAll(selector);
	for (const node of nodes) {
		if (!deferImages) {
			processDataAttrs(node);
			continue;
		}
		processDataAttrs(node, { images: false });
		const { background, hover, down, active, preload } = node.dataset;
		if (background || hover || down || active || preload) {
			const deferredFrom = node.style.backgroundImage;
			whenDrawn(node, () => processDataAttrs(node, { text: false, deferredFrom }));
		}
	}
}

/**
 * Compatibility shim for UIComponent.parseHTML.
 * When called via .call(element) or .each(parseHTML),
 * `this` is the DOM element.
 */
export function parseHTML() {
	processDataAttrs(this);
}
