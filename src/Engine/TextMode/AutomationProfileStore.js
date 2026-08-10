import Session from 'Engine/SessionStorage.js';

const PROFILE_VERSION = 1;
const STORAGE_PREFIX = 'roBrowser.textMode.profile.';
const RULE_KINDS = new Set(['offense', 'support', 'escape', 'recovery']);
const TARGETS = new Set(['self', 'current-target', 'self-cell', 'target-cell']);

const clamp = (value, minimum, maximum, fallback) => {
	value = Number(value);
	return Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback;
};

export function getAutomationScope(session = Session) {
	const server = String(session.ServerName || 'unknown-server')
		.trim()
		.toLowerCase();
	const character = session.GID || session.Character?.GID || session.Character?.CharID || session.Character?.name;
	return `${encodeURIComponent(server)}.${encodeURIComponent(String(character || 'unknown-character'))}`;
}

export function createDefaultProfile() {
	return {
		version: PROFILE_VERSION,
		rules: [],
		safety: { lowHpPercent: 20, maxRecoveryAttempts: 2, recoveryTimeoutMs: 3000 },
		loot: { enabled: false, radius: 2 }
	};
}

function normalizeRule(rule, index) {
	const kind = RULE_KINDS.has(rule?.kind) ? rule.kind : 'offense';
	const isRecovery = kind === 'recovery';
	return {
		id: String(rule?.id || `rule-${Date.now()}-${index}`),
		enabled: rule?.enabled !== false,
		kind,
		skillId: isRecovery ? null : Math.trunc(clamp(rule?.skillId, 1, 65535, 0)) || null,
		itemId: isRecovery ? Math.trunc(clamp(rule?.itemId, 1, 0xffffffff, 0)) || null : null,
		level: Math.trunc(clamp(rule?.level, 1, 100, 1)),
		target: TARGETS.has(rule?.target) ? rule.target : isRecovery ? 'self' : 'current-target',
		hpBelow: rule?.hpBelow === null || rule?.hpBelow === '' ? null : clamp(rule?.hpBelow, 1, 100, 100),
		spAbove: clamp(rule?.spAbove, 0, 100, 0),
		nearbyCount: Math.trunc(clamp(rule?.nearbyCount, 0, 100, kind === 'escape' ? 3 : 0)),
		radius: Math.trunc(clamp(rule?.radius, 1, 30, 8)),
		intervalMs: Math.trunc(clamp(rule?.intervalMs, 500, 3600000, 1000))
	};
}

export function normalizeProfile(profile) {
	const defaults = createDefaultProfile();
	return {
		version: PROFILE_VERSION,
		rules: Array.isArray(profile?.rules) ? profile.rules.map(normalizeRule).slice(0, 50) : [],
		safety: {
			lowHpPercent: clamp(profile?.safety?.lowHpPercent, 1, 99, defaults.safety.lowHpPercent),
			maxRecoveryAttempts: Math.trunc(
				clamp(profile?.safety?.maxRecoveryAttempts, 1, 10, defaults.safety.maxRecoveryAttempts)
			),
			recoveryTimeoutMs: Math.trunc(
				clamp(profile?.safety?.recoveryTimeoutMs, 500, 30000, defaults.safety.recoveryTimeoutMs)
			)
		},
		loot: {
			enabled: profile?.loot?.enabled === true,
			radius: Math.trunc(clamp(profile?.loot?.radius, 1, 15, defaults.loot.radius))
		}
	};
}

export class AutomationProfileStore {
	constructor({ storage = globalThis.localStorage, session = Session } = {}) {
		this.storage = storage;
		this.session = session;
	}

	getKey() {
		return STORAGE_PREFIX + getAutomationScope(this.session);
	}

	get() {
		if (!this.storage) return createDefaultProfile();
		try {
			return normalizeProfile(JSON.parse(this.storage.getItem(this.getKey()) || 'null'));
		} catch (_error) {
			return createDefaultProfile();
		}
	}

	set(profile) {
		const normalized = normalizeProfile(profile);
		this.storage?.setItem(this.getKey(), JSON.stringify(normalized));
		return normalized;
	}
}

export default new AutomationProfileStore();
