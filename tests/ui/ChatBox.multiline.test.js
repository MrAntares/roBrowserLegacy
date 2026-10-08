/**
 * tests/ui/ChatBox.multiline.test.js
 *
 * A multi-line message (/help, server notices) is one entry whose text holds
 * newlines; the chat keeps them as line breaks.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// `?raw` CSS imports are empty under vitest; the rule lives in the stylesheet.
const cssText = readFileSync(join(process.cwd(), 'src/UI/Components/ChatBox/ChatBox.css'), 'utf8');

describe('ChatBox multi-line messages', () => {
	it('keeps the newlines of a message as line breaks', () => {
		const host = document.createElement('div');
		host.innerHTML = `<style>${cssText}</style><div id="chatbox"><div class="content active"></div></div>`;
		document.body.appendChild(host);

		const content = host.querySelector('.content');
		expect(getComputedStyle(content).whiteSpace).toBe('pre-line');
	});
});
