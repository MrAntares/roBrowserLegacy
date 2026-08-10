import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('ROBrowser application loader', () => {
	it('normalizes missing, numeric and string values without producing undefined', () => {
		const script = document.createElement('script');
		script.src = 'https://example.test/ro/api.js';
		document.head.append(script);
		window.eval(fs.readFileSync('applications/api/api.js', 'utf8'));
		expect(window.ROBrowser.normalizeApplication()).toBe(window.ROBrowser.APP.ONLINE);
		expect(window.ROBrowser.normalizeApplication(1)).toBe(window.ROBrowser.APP.ONLINE);
		expect(window.ROBrowser.normalizeApplication('ONLINE')).toBe(window.ROBrowser.APP.ONLINE);
		expect(window.ROBrowser.normalizeApplication('Online.js')).toBe(window.ROBrowser.APP.ONLINE);
		expect(window.ROBrowser.normalizeApplication('not-real')).toBe(window.ROBrowser.APP.ONLINE);
		expect(fs.readFileSync('applications/tools/builder-web.mjs', 'utf8')).not.toContain(
			"event.data.application + '.js'"
		);
	});
});
