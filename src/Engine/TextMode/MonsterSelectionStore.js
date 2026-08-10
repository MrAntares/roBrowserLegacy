import Session from 'Engine/SessionStorage.js';
import { getAutomationScope } from './AutomationProfileStore.js';

const LEGACY_STORAGE_PREFIX = 'roBrowser.textMode.monsters.';
const STORAGE_PREFIX = 'roBrowser.textMode.monsters.v2.';

export function normalizeMapName(mapName) {
	return String(mapName || '')
		.replace(/\.gat$/i, '')
		.toLowerCase();
}

export class MonsterSelectionStore {
	constructor(storage = globalThis.localStorage) {
		this.storage = storage;
	}

	get(mapName) {
		if (!this.storage) return new Set();
		try {
			const suffix = `${getAutomationScope(Session)}.${normalizeMapName(mapName)}`;
			const scoped = this.storage.getItem(STORAGE_PREFIX + suffix);
			const legacy = this.storage.getItem(LEGACY_STORAGE_PREFIX + normalizeMapName(mapName));
			const value = JSON.parse(scoped || legacy || '[]');
			if (!scoped && legacy) this.storage.setItem(STORAGE_PREFIX + suffix, JSON.stringify(value));
			return new Set(value.map(Number).filter(Number.isFinite));
		} catch (_error) {
			return new Set();
		}
	}

	set(mapName, ids) {
		const selection = [...new Set([...ids].map(Number).filter(Number.isFinite))];
		this.storage?.setItem(
			`${STORAGE_PREFIX}${getAutomationScope(Session)}.${normalizeMapName(mapName)}`,
			JSON.stringify(selection)
		);
		return new Set(selection);
	}

	toggle(mapName, id, enabled) {
		const selection = this.get(mapName);
		if (enabled) selection.add(Number(id));
		else selection.delete(Number(id));
		return this.set(mapName, selection);
	}

	clear(mapName) {
		this.storage?.removeItem(`${STORAGE_PREFIX}${getAutomationScope(Session)}.${normalizeMapName(mapName)}`);
		return new Set();
	}
}

export default new MonsterSelectionStore();
