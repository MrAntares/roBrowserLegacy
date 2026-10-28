/**
 * tests/ui/PrivateAirship.test.js
 *
 * The Private Airship payment window: the checks before the request, the
 * request each item button sends, and what each server answer shows.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sent = [];
const prompts = [];
const hooks = {};
const items = { 6909: 'Nyangvine Fruit', 25464: 'World Tour Ticket', 12345: 'Test Ticket' };
const unknown = { identifiedDisplayName: 'Unknown Item' };

vi.mock('UI/CursorManager.js', () => ({ default: { ACTION: { DEFAULT: 0 }, setType: vi.fn(), getActualType: vi.fn() } }));
vi.mock('DB/DBManager.js', () => ({
	default: {
		INTERFACE_PATH: 'data/texture/ui/',
		getMessage: (_id, fallback) => fallback,
		getItemInfo: id => (items[id] ? { identifiedDisplayName: items[id] } : unknown)
	}
}));
vi.mock('Core/Client.js', () => ({
	default: {
		loadFile(path, callback) {
			callback?.(`loaded:${path}`);
		},
		loadFiles(_paths, callback) {
			callback?.('', '');
		}
	}
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1200, height: 800 } }));
vi.mock('Renderer/MapRenderer.js', () => ({ default: { currentMap: 'prontera.gat' } }));
vi.mock('Renderer/EntityManager.js', () => ({ default: { setOverEntity: vi.fn() } }));
vi.mock('Engine/SessionStorage.js', () => ({ default: { Entity: { ACTION: { DIE: 8 }, action: 0 } } }));
vi.mock('UI/Scrollbar.js', () => ({ default: {} }));
vi.mock('Network/NetworkManager.js', () => ({
	default: {
		sendPacket: pkt => sent.push(pkt),
		hookPacket: (packet, callback) => {
			hooks[packet.name || 'response'] = callback;
		}
	}
}));
vi.mock('UI/UIManager.js', () => ({
	default: {
		addComponent: component => component,
		showPromptBox: (text, _yes, _no, onYes) => prompts.push({ text, onYes })
	}
}));

const Session = (await import('Engine/SessionStorage.js')).default;
const MapRenderer = (await import('Renderer/MapRenderer.js')).default;
const Table = (await import('DB/Map/PrivateAirship.js')).default;
const PrivateAirship = (await import('UI/Components/PrivateAirship/PrivateAirship.js')).default;

const root = () => PrivateAirship.getRoot();
const buttons = () => [...root().querySelectorAll('.item')];
const notice = () => (root().querySelector('.notice').classList.contains('visible') ? root().querySelector('.notice-text').textContent : '');

beforeEach(() => {
	sent.length = 0;
	prompts.length = 0;
	Table.reset();
	MapRenderer.currentMap = 'prontera.gat';
	Session.Entity.action = 0;
	// Answer any request a test left open
	PrivateAirship.onResponse({ result: 1 });
	vi.useRealTimers();
});

afterEach(() => {
	if (PrivateAirship.__active) {
		PrivateAirship.remove();
	}
});

describe('the Private Airship payment window', () => {
	it('lists one button per payment item, in the file order', () => {
		PrivateAirship.open({ targetMap: 'geffen' });

		expect(buttons().map(b => b.textContent)).toEqual(['Use Nyangvine Fruit', 'Use World Tour Ticket']);
		expect(buttons().map(b => b.style.top)).toEqual(['26px', '52px']);
		expect(notice()).toBe('');
	});

	it('skips an item the client does not know', () => {
		Table.addNeedItem(25464);
		Table.addNeedItem(99999);
		PrivateAirship.open({ targetMap: 'geffen' });

		expect(buttons().map(b => b.textContent)).toEqual(['Use World Tour Ticket']);
	});

	it('sends the World Tour Ticket at once, with the map name as the official client sends it', () => {
		PrivateAirship.open({ targetMap: 'geffen' });
		buttons()[1].click();

		expect(sent).toHaveLength(1);
		expect(sent[0].mapName).toBe('geffen.gat');
		expect(sent[0].ItemID).toBe(25464);

		// One request at a time
		buttons()[1].click();
		expect(sent).toHaveLength(1);
	});

	it('asks before spending a Nyangvine Fruit', () => {
		PrivateAirship.open({ targetMap: 'geffen' });
		buttons()[0].click();

		expect(sent).toHaveLength(0);
		expect(prompts).toHaveLength(1);
		expect(prompts[0].text).toBe('Used Nyangvine Fruits cannot be refunded.');

		prompts[0].onYes();
		expect(sent.map(p => p.ItemID)).toEqual([6909]);
	});

	it('says an NPC target lands at a random spot', () => {
		PrivateAirship.open({ targetMap: 'geffen', toNpc: true });

		expect(notice()).toBe('You will land at a random spot on the map.');
		expect(buttons().every(b => !b.classList.contains('disabled'))).toBe(true);
	});

	it.each([
		['a start map not in the file', () => Table.addStartableMap('izlude'), "This map isn't available for teleport."],
		['a target map not in the file', () => Table.addEndableMap('payon'), "You can't teleport in this map"],
		['the current map', () => (MapRenderer.currentMap = 'geffen.gat'), 'Can not move to the same map.'],
		['a dead character', () => (Session.Entity.action = 8), "It is impossible to move when your character KO'ed"]
	])('refuses %s before sending', (_case, setup, text) => {
		setup();
		PrivateAirship.open({ targetMap: 'geffen' });

		expect(notice()).toBe(text);
		expect(buttons().every(b => b.classList.contains('disabled'))).toBe(true);
	});

	it('closes on success and shows the reason otherwise', () => {
		PrivateAirship.open({ targetMap: 'geffen' });
		buttons()[1].click();
		PrivateAirship.onResponse({ result: 2 });
		expect(notice()).toBe('Insufficient item.');

		for (const [result, text] of [
			[1, 'Please try again in a moment.'],
			[3, "You can't teleport in this map"],
			[4, "This map isn't available for teleport."],
			[5, 'You can not use items.']
		]) {
			PrivateAirship.onResponse({ result });
			expect(notice()).toBe(text);
		}

		// The answer frees the window for another try
		buttons()[1].click();
		expect(sent).toHaveLength(2);

		PrivateAirship.onResponse({ result: 0 });
		expect(PrivateAirship.__active).toBe(false);
	});

	it('does not send a second request when closed and reopened before the answer', () => {
		PrivateAirship.open({ targetMap: 'geffen' });
		buttons()[1].click();
		PrivateAirship.remove();

		PrivateAirship.open({ targetMap: 'geffen' });
		buttons()[1].click();
		expect(sent).toHaveLength(1);

		PrivateAirship.onResponse({ result: 1 });
		buttons()[1].click();
		expect(sent).toHaveLength(2);
	});

	it('lets a request with no answer go after a while', () => {
		vi.useFakeTimers();
		PrivateAirship.open({ targetMap: 'geffen' });
		buttons()[1].click();

		vi.advanceTimersByTime(9000);
		buttons()[1].click();
		expect(sent).toHaveLength(1);

		vi.advanceTimersByTime(1000);
		buttons()[1].click();
		expect(sent).toHaveLength(2);
	});

	it('grows the window and moves the notice down for a third payment item', () => {
		Table.addNeedItem(6909);
		Table.addNeedItem(25464);
		Table.addNeedItem(12345);
		PrivateAirship.open({ targetMap: 'geffen' });

		expect(buttons().map(b => b.style.top)).toEqual(['26px', '52px', '78px']);
		expect(PrivateAirship._host.style.height).toBe('136px');
		expect(PrivateAirship._host.style.getPropertyValue('--extra-rows-height')).toBe('26px');
	});

	it('closes on Escape and stops the key there', () => {
		PrivateAirship.open({ targetMap: 'geffen' });
		const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
		window.dispatchEvent(event);

		expect(PrivateAirship.__active).toBe(false);
		expect(event.defaultPrevented).toBe(true);
	});
});
