import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
	class MockGUIComponent {
		constructor() {
			this._host = document.createElement('div');
		}

		getRoot() {
			return this._host;
		}

		draggable() {}

		focus() {}
	}
	MockGUIComponent.MouseMode = { CROSS: 0, STOP: 1, FREEZE: 2 };

	return {
		MockGUIComponent,
		messages: {},
		messageBox: vi.fn(),
		session: { guildName: '' }
	};
});

vi.mock('DB/DBManager.js', () => ({
	default: {
		getMessage: (id, defaultText) =>
			id in mocks.messages ? mocks.messages[id] : defaultText !== undefined ? defaultText : `NO MSG ${id}`
	}
}));
vi.mock('Controls/KeyEventHandler.js', () => ({ default: { ENTER: 13, ESCAPE: 27 } }));
vi.mock('Engine/SessionStorage.js', () => ({ default: mocks.session }));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1200, height: 800 } }));
vi.mock('UI/GUIComponent.js', () => ({ default: mocks.MockGUIComponent }));
vi.mock('UI/UIManager.js', () => ({
	default: {
		addComponent(component) {
			const root = component.getRoot();
			document.body.appendChild(root);
			root.innerHTML = component.render();
			component.init();
			return component;
		},
		showMessageBox: mocks.messageBox
	}
}));
vi.mock('UI/Elements/Elements.js', () => ({}));

const GuildCompanion = (await import('UI/Components/GuildCompanion/GuildCompanion.js')).default;

function root() {
	return GuildCompanion.getRoot();
}

function input() {
	return root().querySelector('.guildname');
}

function click(selector) {
	root().querySelector(selector).dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

/** What the served rag211105 msgstringtable.txt holds for the ids this window quotes. */
const SERVED = {
	2076: 'Create Guild',
	2077: 'Guild Name',
	2080: 'You must enter the name of your guild.',
	2088: 'Disband the Guild',
	2089: 'Enter Guild Name',
	401: 'You have failed to disband the guild due to your incorrect SSN.'
};

describe('GuildCompanion', () => {
	beforeEach(() => {
		mocks.messages = { ...SERVED };
		mocks.messageBox.mockReset();
		mocks.session.guildName = 'ClaudeGuild';

		GuildCompanion._host = document.createElement('div');
		document.body.innerHTML = '';
		document.body.appendChild(GuildCompanion._host);
		GuildCompanion._host.innerHTML = GuildCompanion.render();
		GuildCompanion.init();

		GuildCompanion.__active = true;
		GuildCompanion.append = vi.fn(() => {
			GuildCompanion.__active = true;
		});
		GuildCompanion.remove = vi.fn(() => {
			GuildCompanion.__active = false;
		});
		GuildCompanion.onRequestCreateGuild = vi.fn();
		GuildCompanion.onRequestBreakGuild = vi.fn();
	});

	describe('the mode strings come from the table, not from the markup', () => {
		// Class 0xd5 and class 0xd7 are one UICreateGuildWnd built with a mode
		// flag, and fcn.005f2150 picks 0x81c / 0x81d against 0x828 / 0x829 off
		// that flag. Those four ids are 2076 / 2077 and 2088 / 2089.
		it('disband takes 2088 and 2089', () => {
			GuildCompanion.openDisband();

			expect(root().querySelector('.name_title').textContent).toBe('Disband the Guild');
			expect(root().querySelector('.name_label').textContent).toBe('Enter Guild Name');
		});

		it('create takes 2076 and 2077', () => {
			GuildCompanion.openCreate();

			expect(root().querySelector('.name_title').textContent).toBe('Create Guild');
			expect(root().querySelector('.name_label').textContent).toBe('Guild Name');
		});

		it('a server shipping its own wording wins over the defaults', () => {
			mocks.messages[2088] = 'Dissoudre la guilde';
			mocks.messages[2089] = 'Nom de la guilde';

			GuildCompanion.openDisband();

			expect(root().querySelector('.name_title').textContent).toBe('Dissoudre la guilde');
			expect(root().querySelector('.name_label').textContent).toBe('Nom de la guilde');
		});

		it('falls back to English when the table has neither id', () => {
			mocks.messages = {};

			GuildCompanion.openDisband();

			expect(root().querySelector('.name_title').textContent).toBe('Disband the Guild');
			expect(root().querySelector('.name_label').textContent).toBe('Enter Guild Name');
		});

		it('the markup carries no caption of its own', () => {
			// Rendered but never opened: whatever these say has to come from
			// open(), so there is one source for each string.
			GuildCompanion._host.innerHTML = GuildCompanion.render();

			expect(root().querySelector('.name_title').textContent).toBe('');
			expect(root().querySelector('.name_label').textContent).toBe('');
		});
	});

	describe('disband refuses before anything reaches the wire', () => {
		// rAthena's guild_break returns 0 with no packet when the name does not
		// match (guild.cpp), so a wrong name that got sent would hang the
		// dialog on an answer that never arrives.
		it('a wrong name is refused and nothing is sent', () => {
			GuildCompanion.openDisband();
			input().value = 'NotMyGuild';
			click('.btn_ok');

			expect(GuildCompanion.onRequestBreakGuild).not.toHaveBeenCalled();
			expect(mocks.messageBox).toHaveBeenCalledTimes(1);
			expect(mocks.messageBox.mock.calls[0][0]).toBe(SERVED[401]);
		});

		it('the refusal clears the field so the next try starts empty', () => {
			GuildCompanion.openDisband();
			input().value = 'NotMyGuild';
			click('.btn_ok');
			mocks.messageBox.mock.calls[0][2]();

			expect(input().value).toBe('');
		});

		it('a name differing only by case is refused', () => {
			GuildCompanion.openDisband();
			input().value = 'claudeguild';
			click('.btn_ok');

			expect(GuildCompanion.onRequestBreakGuild).not.toHaveBeenCalled();
		});

		it('an empty field raises msgstring 2080 rather than doing nothing', () => {
			// The client answers an empty edit with 0x820 (fcn.005f5da0); the
			// port used to silently refocus, which reads as a dead button.
			GuildCompanion.openDisband();
			input().value = '   ';
			click('.btn_ok');

			expect(GuildCompanion.onRequestBreakGuild).not.toHaveBeenCalled();
			expect(mocks.messageBox).toHaveBeenCalledTimes(1);
			expect(mocks.messageBox.mock.calls[0][0]).toBe(SERVED[2080]);
		});

		it('the matching name is sent, untrimmed of nothing else', () => {
			GuildCompanion.openDisband();
			input().value = '  ClaudeGuild  ';
			click('.btn_ok');

			expect(GuildCompanion.onRequestBreakGuild).toHaveBeenCalledWith('ClaudeGuild');
			expect(mocks.messageBox).not.toHaveBeenCalled();
		});

		it('the window stays open until the server answers', () => {
			// onGuildDestroy closes it, on success or on failure. Closing here
			// would leave a successful disband with no window to close and a
			// failed one with no message.
			GuildCompanion.openDisband();
			input().value = 'ClaudeGuild';
			click('.btn_ok');

			expect(GuildCompanion.remove).not.toHaveBeenCalled();
		});

		it('with no guild name known the check cannot fire', () => {
			mocks.session.guildName = '';
			GuildCompanion.openDisband();
			input().value = 'Anything';
			click('.btn_ok');

			expect(GuildCompanion.onRequestBreakGuild).toHaveBeenCalledWith('Anything');
		});

		it('Enter submits the same way the OK button does', () => {
			GuildCompanion.openDisband();
			input().value = 'ClaudeGuild';
			input().dispatchEvent(new KeyboardEvent('keydown', { which: 13, bubbles: true }));

			expect(GuildCompanion.onRequestBreakGuild).toHaveBeenCalledWith('ClaudeGuild');
		});
	});

	describe('cancel', () => {
		it('closes the whole thing in disband mode', () => {
			GuildCompanion.openDisband();
			click('.btn_cancel');

			expect(GuildCompanion.remove).toHaveBeenCalled();
		});

		it('only steps back to the first pane in create mode', () => {
			GuildCompanion.openCreate();
			click('.btn_create');
			expect(root().querySelector('.win.namebox').classList.contains('visible')).toBe(true);

			click('.btn_cancel');

			expect(GuildCompanion.remove).not.toHaveBeenCalled();
			expect(root().querySelector('.win.namebox').classList.contains('visible')).toBe(false);
		});
	});

	describe('create', () => {
		it('sends the name and closes', () => {
			GuildCompanion.openCreate();
			click('.btn_create');
			input().value = 'NewGuild';
			click('.btn_ok');

			expect(GuildCompanion.onRequestCreateGuild).toHaveBeenCalledWith('NewGuild');
			expect(GuildCompanion.remove).toHaveBeenCalled();
		});

		it('an empty name is refused here too', () => {
			GuildCompanion.openCreate();
			click('.btn_create');
			input().value = '';
			click('.btn_ok');

			expect(GuildCompanion.onRequestCreateGuild).not.toHaveBeenCalled();
			expect(mocks.messageBox.mock.calls[0][0]).toBe(SERVED[2080]);
		});

		it('the first pane is hidden in disband mode and shown in create mode', () => {
			GuildCompanion.openDisband();
			expect(root().querySelector('.win.companion').classList.contains('hidden')).toBe(true);
			expect(root().querySelector('.win.namebox').classList.contains('visible')).toBe(true);

			GuildCompanion.openCreate();
			expect(root().querySelector('.win.companion').classList.contains('hidden')).toBe(false);
			expect(root().querySelector('.win.namebox').classList.contains('visible')).toBe(false);
		});
	});

	describe('the controls are the client’s bitmaps', () => {
		// Every sibling window in this cluster blits the client's buttons; these
		// four were raw <button> elements with lowercase English labels.
		it.each([
			['.btn_ok', 'btn_ok.bmp'],
			['.btn_cancel', 'btn_cancel.bmp'],
			['.btn_create', 'guild_helper/create_guild.bmp'],
			['.btn_close', 'guild_helper/btn_ok.bmp']
		])('%s is a ui-button on %s', (selector, bitmap) => {
			const el = root().querySelector(selector);

			expect(el.tagName.toLowerCase()).toBe('ui-button');
			expect(el.getAttribute('bg')).toBe(bitmap);
			expect(el.getAttribute('hover')).toBe(bitmap.replace('.bmp', '_a.bmp'));
			expect(el.getAttribute('down')).toBe(bitmap.replace('.bmp', '_b.bmp'));
			expect(el.textContent).toBe('');
		});

		it('no raw button survives in the markup', () => {
			expect(root().querySelectorAll('button')).toHaveLength(0);
		});
	});
});
