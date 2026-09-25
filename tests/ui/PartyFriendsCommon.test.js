import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
	class MockGUIComponent {
		constructor() {
			this._host = document.createElement('div');
			this._host.innerHTML = '<div class="content"><div class="friend"></div></div>';
			this.ui = { show: vi.fn(), hide: vi.fn(), is: vi.fn(() => true) };
		}

		getRoot() {
			return this._host;
		}

		draggable() {}

		focus() {}

		parseHTML() {}
	}

	MockGUIComponent.MouseMode = Object.freeze({ CROSS: 0, STOP: 1, FREEZE: 2 });

	return {
		MockGUIComponent,
		chat: vi.fn(),
		messages: {},
		loadFile: vi.fn()
	};
});

vi.mock('UI/GUIComponent.js', () => ({ default: mocks.MockGUIComponent }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({
	default: {
		addText: (...args) => mocks.chat(...args),
		TYPE: { BLUE: 2 },
		FILTER: { PUBLIC_LOG: 8 }
	}
}));
vi.mock('DB/DBManager.js', () => ({
	default: {
		getMessage: (id, defaultText) =>
			id in mocks.messages ? mocks.messages[id] : defaultText !== undefined ? defaultText : 'NO MSG ' + id,
		INTERFACE_PATH: 'data/texture/'
	}
}));
vi.mock('Core/Client.js', () => ({ default: { loadFile: (...args) => mocks.loadFile(...args) } }));
vi.mock('UI/UIManager.js', () => ({
	default: {
		showPromptBox: vi.fn(),
		showMessageBox: vi.fn(),
		addComponent: component => component,
		getComponent: vi.fn()
	}
}));
vi.mock('Network/NetworkManager.js', () => ({ default: { sendPacket: vi.fn(), hookPacket: vi.fn() } }));

// PartyFriends.js calls this very factory at module scope, and several of the
// module's own imports reach it - so without this the factory runs before its
// GUIComponent binding is initialised and the import dies on a TDZ error.
vi.mock('UI/Components/PartyFriends/PartyFriends.js', () => ({ default: {} }));

// The rest of the component's import graph, which reaches the renderer and the
// whole UI registry. None of it is under test here.
vi.mock('DB/Monsters/MonsterTable.js', () => ({ default: {} }));
vi.mock('Controls/KeyEventHandler.js', () => ({ default: {} }));
vi.mock('Controls/MouseEventHandler.js', () => ({ default: {} }));
vi.mock('Renderer/Camera.js', () => ({ default: {} }));
vi.mock('Renderer/Renderer.js', () => ({ default: { render: vi.fn(), stop: vi.fn() } }));
vi.mock('Renderer/SpriteRenderer.js', () => ({ default: {} }));
vi.mock('Renderer/Entity/Entity.js', () => ({ default: class {} }));
vi.mock('UI/Elements/Elements.js', () => ({}));
vi.mock('UI/Components/ContextMenu/ContextMenu.js', () => ({ default: { remove: vi.fn(), append: vi.fn() } }));
vi.mock('UI/Components/InputBox/InputBox.js', () => ({ default: { append: vi.fn(), remove: vi.fn() } }));
vi.mock('UI/Components/MiniMap/MiniMap.js', () => ({ default: { addPartyMemberMarker: vi.fn() } }));
vi.mock('UI/Components/Mail/Mail.js', () => ({ default: {} }));
vi.mock('UI/Components/Rodex/Rodex.js', () => ({ default: {} }));
vi.mock('UI/Components/WhisperBox/WhisperBox.js', () => ({ default: {} }));
vi.mock('UI/Components/SkillTargetSelection/SkillTargetSelection.js', () => ({ default: {} }));
vi.mock('./PartyHelper/PartyHelper.js', () => ({ default: {} }));
vi.mock('./PartyMemberExternal/PartyMemberExternal.js', () => ({ default: {} }));

const { createPartyFriends } = await import('UI/Components/PartyFriends/PartyFriendsCommon.js');
const UIPreferences = (await import('Preferences/UI.js')).default;

let Component;

/** The friend list with one entry, reachable by index. */
function withFriend(name = 'ClaudeTestB') {
	Component.setFriends([{ Name: name, GID: 150001, AID: 2000001, State: 0 }]);
}

beforeEach(() => {
	mocks.chat.mockClear();
	mocks.loadFile.mockClear();
	mocks.messages = {};
	UIPreferences.li = true;

	Component = createPartyFriends({
		name: 'Friends',
		htmlText: '<div class="content"><div class="friend"></div></div>',
		cssText: ''
	});
	withFriend();
});

// State is the server's flag and reads backwards: a truthy State is a friend
// going offline.
describe('a friend logging in or out', () => {
	it('announces a friend coming online', () => {
		Component.updateFriendState(0, 0);

		expect(mocks.chat).toHaveBeenCalledTimes(1);
		expect(mocks.chat.mock.calls[0][0]).toBe('ClaudeTestB has logged in.');
	});

	it('announces a friend going offline', () => {
		Component.updateFriendState(0, 1);

		expect(mocks.chat).toHaveBeenCalledTimes(1);
		expect(mocks.chat.mock.calls[0][0]).toBe('ClaudeTestB has logged out.');
	});

	it('has text to fall back on when the message table has neither id', () => {
		Component.updateFriendState(0, 0);
		Component.updateFriendState(0, 1);

		for (const call of mocks.chat.mock.calls) {
			expect(call[0]).not.toContain('NO MSG');
		}
	});

	it('takes the wording from the message table when it has one', () => {
		mocks.messages[1041] = '%s est connecte.';

		Component.updateFriendState(0, 0);

		expect(mocks.chat.mock.calls[0][0]).toBe('ClaudeTestB est connecte.');
	});
});

describe('the /li toggle', () => {
	it('silences the login line', () => {
		UIPreferences.li = false;

		Component.updateFriendState(0, 0);

		expect(mocks.chat).not.toHaveBeenCalled();
	});

	it('silences the logout line', () => {
		UIPreferences.li = false;

		Component.updateFriendState(0, 1);

		expect(mocks.chat).not.toHaveBeenCalled();
	});

	// Only the chat line is the player's to silence - the list itself has to
	// keep following the server either way.
	it('still paints the online marker with the announcements off', () => {
		UIPreferences.li = false;

		Component.updateFriendState(0, 0);

		expect(mocks.loadFile).toHaveBeenCalled();
		expect(mocks.loadFile.mock.calls[0][0]).toContain('grp_online.bmp');
	});

	// The logout arm returns before the marker load; the login arm must not.
	it('does not paint the online marker when a friend goes offline', () => {
		Component.updateFriendState(0, 1);

		expect(mocks.loadFile).not.toHaveBeenCalled();
	});
});
