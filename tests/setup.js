vi.hoisted(() => {
	if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.getItem !== 'function') {
		const store = Object.create(null);
		globalThis.localStorage = {
			getItem: (key) => (key in store ? store[key] : null),
			setItem: (key, val) => {
				store[key] = String(val);
			},
			removeItem: (key) => {
				delete store[key];
			},
			clear: () => {
				for (const k in store) delete store[k];
			}
		};
	}
});