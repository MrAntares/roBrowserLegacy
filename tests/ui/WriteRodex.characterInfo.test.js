import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const mocks = vi.hoisted(() => {
	class MockGUIComponent {
		constructor(name) {
			this.name = name;
			this._host = document.createElement('div');
		}

		focus() {}
	}

	return { MockGUIComponent };
});

vi.mock('DB/DBManager.js', () => ({ default: { INTERFACE_PATH: '', getMessage: id => `MSG ${id}` } }));
vi.mock('DB/Monsters/MonsterTable.js', () => ({ default: { 7: 'Knight' } }));
vi.mock('Engine/SessionStorage.js', () => ({ default: { zeny: 1000 } }));
vi.mock('Core/Preferences.js', () => ({ default: { get: (_name, defaults) => ({ ...defaults, save: vi.fn() }) } }));
vi.mock('Core/Client.js', () => ({ default: { loadFile: vi.fn() } }));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1200, height: 800 } }));
vi.mock('UI/GUIComponent.js', () => ({ default: mocks.MockGUIComponent }));
vi.mock('UI/UIManager.js', () => ({ default: { addComponent: c => c } }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({ default: { addText: vi.fn(), TYPE: {}, FILTER: {} } }));
vi.mock('UI/Components/ItemInfo/ItemInfo.js', () => ({ default: {} }));
vi.mock('UI/Components/InputBox/InputBox.js', () => ({ default: {} }));
vi.mock('UI/Components/Rodex/Rodex.js', () => ({ default: {} }));
vi.mock('UI/Components/Inventory/Inventory.js', () => ({ default: {} }));

const WriteRodex = (await import('UI/Components/Rodex/WriteRodex.js')).default;

// `?raw` CSS imports are empty under vitest; the balloon's `display: none` lives in the stylesheet.
const cssText = readFileSync(join(process.cwd(), 'src/UI/Components/Rodex/WriteRodex.css'), 'utf8');

function mountWriteRodex() {
	const host = document.createElement('div');
	host.innerHTML = `<style>${cssText}</style>${WriteRodex.render()}`;
	document.body.appendChild(host);
	WriteRodex._host = host;
	WriteRodex.initData({ receiveName: '' });
	return host;
}

describe('WriteRodex receiver validation', () => {
	let host;

	beforeEach(() => {
		document.body.innerHTML = '';
		host = mountWriteRodex();
	});

	it('shows the receiver level, job and id once the server confirms the name', () => {
		WriteRodex.characterInfo({ level: 42, Job: 7, CharID: 150001 });

		const baloon = host.querySelector('.baloon');
		expect(getComputedStyle(baloon).display).not.toBe('none');
		expect(baloon.innerHTML).toBe('Lv42<br>Knight<br>150001');
	});

	it('hides the balloon again when the window is reopened', () => {
		WriteRodex.characterInfo({ level: 42, Job: 7, CharID: 150001 });

		WriteRodex.initData({ receiveName: '' });

		expect(getComputedStyle(host.querySelector('.baloon')).display).toBe('none');
		expect(WriteRodex.receiver).toBeNull();
	});
});
