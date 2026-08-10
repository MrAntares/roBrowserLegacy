import { describe, expect, it } from 'vitest';
import {
	AutomationProfileStore,
	createDefaultProfile,
	getAutomationScope,
	normalizeProfile
} from 'Engine/TextMode/AutomationProfileStore.js';

function memoryStorage() {
	const values = new Map();
	return {
		getItem: key => values.get(key) ?? null,
		setItem: (key, value) => values.set(key, value)
	};
}

describe('AutomationProfileStore', () => {
	it('isolates profiles by server and character', () => {
		const storage = memoryStorage();
		const first = new AutomationProfileStore({ storage, session: { ServerName: 'Eden', GID: 10 } });
		const second = new AutomationProfileStore({ storage, session: { ServerName: 'Eden', GID: 20 } });
		const profile = createDefaultProfile();
		profile.loot.enabled = true;
		first.set(profile);
		expect(first.get().loot.enabled).toBe(true);
		expect(second.get().loot.enabled).toBe(false);
		expect(getAutomationScope({ ServerName: 'Eden', GID: 10 })).not.toBe(
			getAutomationScope({ ServerName: 'Eden', GID: 20 })
		);
	});

	it('validates rules and clamps unsafe values', () => {
		const profile = normalizeProfile({
			rules: [{ kind: 'escape', skillId: 12, target: 'target-cell', intervalMs: 1, radius: 999 }],
			safety: { lowHpPercent: 0, maxRecoveryAttempts: 99, recoveryTimeoutMs: 1 },
			loot: { enabled: true, radius: 999 }
		});
		expect(profile.rules[0]).toMatchObject({ kind: 'escape', skillId: 12, intervalMs: 500, radius: 30 });
		expect(profile.safety).toEqual({ lowHpPercent: 1, maxRecoveryAttempts: 10, recoveryTimeoutMs: 500 });
		expect(profile.loot).toEqual({ enabled: true, radius: 15 });
	});
});
