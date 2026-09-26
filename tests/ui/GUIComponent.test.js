/**
 * tests/ui/GUIComponent.test.js
 *
 * The shadow-DOM base class the windows are built on. Every other test file
 * replaces it with a stub, so the two behaviours below are held by nothing
 * else in the suite.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	cursor: {
		ACTION: { DEFAULT: 0, CLICK: 2, NOWALK: 13 },
		getActualType: vi.fn(() => 0),
		setType: vi.fn()
	}
}));

// GUIComponent imports these lazily and does not await the result, so they are
// mocked rather than left to pull the renderer in behind them.
vi.mock('UI/CursorManager.js', () => ({ default: mocks.cursor }));
vi.mock('DB/DBManager.js', () => ({ default: { INTERFACE_PATH: '' } }));
vi.mock('Core/Client.js', () => ({
	default: {
		loadFile(_path, callback) {
			callback?.('');
		},
		loadFiles(_paths, callback) {
			callback?.('', '');
		}
	}
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1200, height: 800 } }));
vi.mock('Renderer/EntityManager.js', () => ({ default: { setOverEntity: vi.fn() } }));
vi.mock('UI/Scrollbar.js', () => ({ default: {} }));

const GUIComponent = (await import('UI/GUIComponent.js')).default;

let seq = 0;

/**
 * A component carrying the markup a case needs, appended the way UIManager
 * does it. The lazy dependency import is fired by prepare() and not awaited,
 * so the caller drains the microtask queue before expecting a cursor.
 *
 * @param {string} html - markup for the component body
 * @return {GUIComponent}
 */
function mount(html) {
	const component = new GUIComponent(`TestComponent${++seq}`, '');
	component.render = () => html;
	component.append();
	return component;
}

beforeEach(() => {
	document.body.innerHTML = '';
	mocks.cursor.setType.mockClear();
	mocks.cursor.getActualType.mockClear();
});

/**
 * focus() only reorders zIndex. Without moving the real DOM focus, clicking a
 * window left the tab sequence wherever it was and Tab walked the whole
 * document instead of the window just clicked.
 */
describe('clicking a window moves the keyboard into it', () => {
	it('takes the focus from whatever held it outside', () => {
		const outside = document.createElement('input');
		document.body.appendChild(outside);
		outside.focus();
		expect(document.activeElement).toBe(outside);

		const component = mount('<div class="body">content</div>');
		component._host.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

		expect(document.activeElement).toBe(component._host);
	});

	it('leaves a control inside the window holding it', () => {
		const component = mount('<input class="field">');
		const field = component._container.querySelector('.field');
		field.focus();

		component._host.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

		expect(component._shadow.activeElement).toBe(field);
	});
});

/**
 * Checkbox widgets are a styled <div> rather than a control, so they were the
 * only clickable thing the cursor ignored.
 */
describe('the cursor over a styled checkbox', () => {
	it('takes its click shape', async () => {
		const component = mount('<div class="checkbox"></div>');
		await new Promise(resolve => setTimeout(resolve, 0));

		component._container
			.querySelector('.checkbox')
			.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

		expect(mocks.cursor.setType).toHaveBeenCalledWith(mocks.cursor.ACTION.CLICK);
	});

	it('keeps its default shape over markup that is not clickable', async () => {
		const component = mount('<div class="plain"></div>');
		await new Promise(resolve => setTimeout(resolve, 0));

		component._container.querySelector('.plain').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

		expect(mocks.cursor.setType).not.toHaveBeenCalled();
	});
});

// CSS cannot answer this one: the custom cursor forces `cursor: none` over the
// whole window, so a `not-allowed` rule is invisible exactly when it is needed.
describe('the cursor over a clickable a component has marked refused', () => {
	it('takes the refusal shape rather than the click one', async () => {
		const component = mount('<button class="denied">Announcement</button>');
		await new Promise(resolve => setTimeout(resolve, 0));

		component._container.querySelector('.denied').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

		expect(mocks.cursor.setType).toHaveBeenCalledWith(mocks.cursor.ACTION.NOWALK);
		expect(mocks.cursor.setType).not.toHaveBeenCalledWith(mocks.cursor.ACTION.CLICK);
	});

	// Pressing it must not animate: there is nothing being pressed.
	it('does not play the press animation on the way down', async () => {
		const component = mount('<button class="denied">Announcement</button>');
		await new Promise(resolve => setTimeout(resolve, 0));

		component._container.querySelector('.denied').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

		expect(mocks.cursor.setType).toHaveBeenCalledWith(mocks.cursor.ACTION.NOWALK);
		expect(mocks.cursor.setType).not.toHaveBeenCalledWith(mocks.cursor.ACTION.CLICK, true, 1);
	});

	// Releasing over it must not hand the cursor back to the click shape, or the
	// refusal blinks away the moment the button comes up.
	it('keeps the refusal shape when the button comes back up', async () => {
		const component = mount('<button class="denied">Announcement</button>');
		await new Promise(resolve => setTimeout(resolve, 0));

		component._container.querySelector('.denied').dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

		expect(mocks.cursor.setType).toHaveBeenCalledWith(mocks.cursor.ACTION.NOWALK);
		expect(mocks.cursor.setType).not.toHaveBeenCalledWith(mocks.cursor.ACTION.CLICK);
	});

	it('leaves an ordinary clickable on the click shape', async () => {
		const component = mount('<button class="plain">Members</button>');
		await new Promise(resolve => setTimeout(resolve, 0));

		component._container.querySelector('.plain').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

		expect(mocks.cursor.setType).toHaveBeenCalledWith(mocks.cursor.ACTION.CLICK);
	});
});
