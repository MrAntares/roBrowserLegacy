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
 * The caption and the field label are the only thing that differs between the
 * two modes, which is also all the client varies: class 0xd5 and class 0xd7 are
 * one UICreateGuildWnd built with a mode flag, and its draw picks the pair off
 * that flag - fcn.005f2150 reads this+0xa0 and takes 0x81c / 0x81d for create,
 * 0x828 / 0x829 for disband.
 */
const MODE_STRINGS = {
	create: { title: [2076, 'Create Guild'], label: [2077, 'Guild Name'] },
	disband: { title: [2088, 'Disband the Guild'], label: [2089, 'Enter Guild Name'] }
};

/**
 * Helper: query inside shadow root
 */
function _root() {
	return GuildCompanion._shadow || GuildCompanion._host;
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
			// The client answers an empty field with msgstring 0x820 rather than
			// doing nothing (fcn.005f5da0).
			UIManager.showMessageBox(DB.getMessage(2080, 'You must enter the name of your guild.'), 'ok', () => {
				input.focus();
			});
			return;
		}

		if (_mode === 'disband') {
			// Load-bearing, not a convenience: rAthena's guild_break returns 0
			// with no packet at all when the name does not match (guild.cpp),
			// so without this the dialog would wait for an answer that never
			// comes.
			// 401 is the id the client itself shows when the server refuses a
			// disband for a bad key: ver12's 0x15e handler maps reason 0/1/2 to
			// msgstring 0x190/0x191/0x192 (fcn.005a4cc0.asm). This check exists
			// only because rAthena returns 0 with no packet instead of sending
			// that reason 1, so it stands in for it and quotes the same string.
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
