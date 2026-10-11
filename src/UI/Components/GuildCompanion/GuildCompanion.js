import Renderer from 'Renderer/Renderer.js';
import Session from 'Engine/SessionStorage.js';
import DB from 'DB/DBManager.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import KEYS from 'Controls/KeyEventHandler.js';
import 'UI/Elements/Elements.js';
import htmlText from './GuildCompanion.html?raw';
import cssText from './GuildCompanion.css?raw';

const GuildCompanion = new GUIComponent('GuildCompanion', cssText);
GuildCompanion.render = () => htmlText;
let _mode = 'create';
GuildCompanion.onRequestCreateGuild = function onRequestCreateGuild() {};
GuildCompanion.onRequestBreakGuild = function onRequestBreakGuild() {};

/**
 * The caption and the field label, all that differs between the two modes
 *
 * That is also all the client varies - one window, one mode flag.
 * @see docs/reference/guild/create-disband-dialogs.md
 */
const MODE_STRINGS = {
	create: { title: [2076, 'Create Guild'], label: [2077, 'Guild Name'] },
	disband: { title: [2088, 'Disband the Guild'], label: [2089, 'Enter Guild Name'] }
};

/**
 * Helper: query inside shadow root
 */
function _root() {
	return GuildCompanion.getRoot();
}

GuildCompanion.init = function init() {
	const root = _root();
	const nameWin = root.querySelector('.win.namebox');
	const input = root.querySelector('.guildname');

	// Both panes drag: open('disband') hides the companion one, and binding the
	// handle only there left the name window pinned wherever center() put it.
	this.draggable(root.querySelector('.companion .titlebar'));
	this.draggable(root.querySelector('.namebox .titlebar'));

	const closeAll = () => {
		GuildCompanion.remove();
	};

	root.querySelector('.btn_create').addEventListener('click', () => {
		nameWin.classList.add('visible');
		input.value = '';
		input.focus();
	});

	root.querySelector('.btn_close').addEventListener('click', closeAll);
	root.querySelector('.btn_x').addEventListener('click', closeAll);
	root.querySelector('.btn_x2').addEventListener('click', closeAll);

	const submit = () => {
		const name = input.value.trim();

		if (!name.length) {
			// The client raises this rather than doing nothing.
			UIManager.showMessageBox(DB.getMessage(2080, 'You must enter the name of your guild.'), 'ok', () => {
				input.focus();
			});
			return;
		}

		if (_mode === 'disband') {
			// Load-bearing: the server answers a wrong key with no packet at
			// all, so without this the dialog waits forever.
			// @see docs/reference/guild/create-disband-dialogs.md
			if (Session.guildName && name !== Session.guildName) {
				UIManager.showMessageBox(DB.getMessage(401, 'You have failed to disband the guild.'), 'ok', () => {
					input.value = '';
					input.focus();
				});
				return;
			}

			GuildCompanion.onRequestBreakGuild(name);
			return;
		}

		GuildCompanion.onRequestCreateGuild(name);
		closeAll();
	};

	const cancel = () => {
		if (_mode === 'disband') {
			closeAll();
			return;
		}

		nameWin.classList.remove('visible');
	};

	root.querySelector('.btn_ok').addEventListener('click', submit);
	root.querySelector('.btn_cancel').addEventListener('click', cancel);

	input.addEventListener('keydown', event => {
		if (event.which === KEYS.ENTER) {
			event.stopImmediatePropagation();
			submit();
		} else if (event.which === KEYS.ESCAPE) {
			event.stopImmediatePropagation();
			cancel();
		}
	});
};

function open(mode) {
	_mode = mode;

	if (!GuildCompanion.__active) {
		GuildCompanion.append();
	}

	const root = _root();
	const companion = root.querySelector('.win.companion');
	const nameWin = root.querySelector('.win.namebox');
	const input = root.querySelector('.guildname');
	const strings = MODE_STRINGS[mode] || MODE_STRINGS.create;

	root.querySelector('.name_title').textContent = DB.getMessage(strings.title[0], strings.title[1]);
	root.querySelector('.name_label').textContent = DB.getMessage(strings.label[0], strings.label[1]);
	input.value = '';

	if (mode === 'disband') {
		companion.classList.add('hidden');
		nameWin.classList.add('visible');
		input.focus();
	} else {
		companion.classList.remove('hidden');
		nameWin.classList.remove('visible');
	}

	center();
}

function center() {
	const host = GuildCompanion._host;

	if (!host) {
		return;
	}

	const rect = host.getBoundingClientRect();
	const w = Renderer.width || window.innerWidth;
	const h = Renderer.height || window.innerHeight;

	host.style.left = `${Math.max(0, Math.round((w - rect.width) / 2))}px`;
	host.style.top = `${Math.max(0, Math.round((h - rect.height) / 2))}px`;
}

GuildCompanion.openCreate = function openCreate() {
	open('create');
};

GuildCompanion.openDisband = function openDisband() {
	open('disband');
};

GuildCompanion.closeDisband = function closeDisband() {
	if (_mode === 'disband' && GuildCompanion.__active) {
		GuildCompanion.remove();
	}
};

GuildCompanion.toggleCreate = function toggleCreate() {
	if (GuildCompanion.__active) {
		GuildCompanion.remove();
		return;
	}

	GuildCompanion.openCreate();
};

GuildCompanion.mouseMode = GUIComponent.MouseMode.STOP;
GuildCompanion.needFocus = true;

export default UIManager.addComponent(GuildCompanion);
