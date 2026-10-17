import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	session: { Entity: null },
	graphics: { performanceMode: true, viewArea: 10 },
	spriteRenderer: { bind3DContext: vi.fn(), unbind: vi.fn() }
}));

vi.mock('Engine/SessionStorage.js', () => ({ default: mocks.session }));
vi.mock('Renderer/Entity/Entity.js', () => ({ default: {} }));
vi.mock('Renderer/SpriteRenderer.js', () => ({ default: mocks.spriteRenderer }));
vi.mock('Controls/MouseEventHandler.js', () => ({ default: {} }));
vi.mock('Controls/KeyEventHandler.js', () => ({ default: {} }));
vi.mock('Utils/PathFinding.js', () => ({ default: {} }));
vi.mock('Preferences/Graphics.js', () => ({ default: mocks.graphics }));
vi.mock('Renderer/Map/Altitude.js', () => ({ default: {} }));
vi.mock('Renderer/Map/Water.js', () => ({ default: {} }));
vi.mock('Renderer/GR2/GR2ModelRenderer.js', () => ({ default: { detach: vi.fn() } }));
vi.mock('Core/Client.js', () => ({ default: {} }));
vi.mock('DB/DBManager.js', () => ({ default: {} }));
vi.mock('UI/Components/EntityRoom/EntityRoom.js', () => ({
	default: { clone: () => ({ ui: [{ style: {} }], append: vi.fn() }) }
}));

import EntityManager from 'Renderer/EntityManager.js';
import entityRoom from 'Renderer/Entity/EntityRoom.js';

const OVERLAYS = ['life', 'emblem', 'display', 'dialog', 'cast', 'room'];

/** Overlay element whose style.display writes are counted */
function fakeElement() {
	let display = '';
	const element = { writes: 0, style: {} };
	Object.defineProperty(element.style, 'display', {
		get: () => display,
		set: value => {
			display = value;
			element.writes++;
		}
	});
	return element;
}

let _gid = 1;

function fakeEntity(x, y) {
	const entity = {
		GID: _gid++,
		depth: 0,
		culled: false,
		objecttype: 0,
		position: [x, y, 0],
		render: vi.fn(),
		clean: vi.fn(),
		elements: {},
		life: { canvas: fakeElement() },
		emblem: { canvas: fakeElement() },
		display: { canvas: fakeElement() },
		dialog: { canvas: fakeElement() },
		cast: { canvas: fakeElement() },
		room: { node: { ui: [fakeElement()] } }
	};
	entity.constructor = { TYPE_EFFECT: -5 };
	entity.elements.life = entity.life.canvas;
	entity.elements.emblem = entity.emblem.canvas;
	entity.elements.display = entity.display.canvas;
	entity.elements.dialog = entity.dialog.canvas;
	entity.elements.cast = entity.cast.canvas;
	entity.elements.room = entity.room.node.ui[0];
	return entity;
}

function renderFrame() {
	EntityManager.cull();
	EntityManager.render({}, null, null, null, false);
}

function displays(entity) {
	return OVERLAYS.map(name => entity.elements[name].style.display);
}

function writes(entity) {
	return OVERLAYS.reduce((sum, name) => sum + entity.elements[name].writes, 0);
}

describe('EntityManager culling hides entity overlays', () => {
	let player;
	let mob;

	beforeEach(() => {
		mocks.graphics.performanceMode = true;
		player = fakeEntity(50, 50);
		mob = fakeEntity(52, 50);
		mocks.session.Entity = player;
		EntityManager.add(player);
		EntityManager.add(mob);
	});

	afterEach(() => {
		EntityManager.free();
	});

	it('hides the overlays of a culled entity', () => {
		renderFrame();
		expect(mob.render).toHaveBeenCalledTimes(1);

		mob.position[0] = 80;
		renderFrame();

		expect(mob.render).toHaveBeenCalledTimes(1);
		expect(displays(mob)).toEqual(['none', 'none', 'none', 'none', 'none', 'none']);
	});

	it('shows the overlays again once the entity is drawn', () => {
		mob.position[0] = 80;
		renderFrame();

		mob.position[0] = 52;
		renderFrame();

		expect(mob.render).toHaveBeenCalledTimes(1);
		expect(displays(mob)).toEqual(['', '', '', '', '', '']);
	});

	it('shows them again when performance mode is turned off', () => {
		mob.position[0] = 80;
		renderFrame();

		mocks.graphics.performanceMode = false;
		renderFrame();

		expect(displays(mob)).toEqual(['', '', '', '', '', '']);
	});

	it('does not touch the DOM while the state does not change', () => {
		renderFrame();
		renderFrame();
		expect(writes(mob)).toBe(0);
		expect(writes(player)).toBe(0);

		mob.position[0] = 80;
		renderFrame();
		const afterHide = writes(mob);
		expect(afterHide).toBe(OVERLAYS.length);

		renderFrame();
		renderFrame();
		expect(writes(mob)).toBe(afterHide);
	});

	it('skips the room when the entity has none', () => {
		mob.room.node = null;
		mob.position[0] = 80;

		expect(() => renderFrame()).not.toThrow();
		expect(mob.life.canvas.style.display).toBe('none');
	});

	it('keeps the decision taken before the passes for the whole frame', () => {
		mob.position[0] = 80;
		EntityManager.cull();
		expect(mob.culled).toBe(true);
		expect(displays(mob)).toEqual(['none', 'none', 'none', 'none', 'none', 'none']);

		mob.position[0] = 52;
		EntityManager.render({}, null, null, null, false);
		expect(mob.render).not.toHaveBeenCalled();
	});

	it('hides a room created while the entity is culled', () => {
		entityRoom.call(mob);
		mob.position[0] = 80;
		renderFrame();

		mob.room.create('shop', 1, 0, true);
		renderFrame();
		expect(mob.room.node.ui[0].style.display).toBe('none');

		mob.position[0] = 52;
		renderFrame();
		expect(mob.room.node.ui[0].style.display).toBe('');
	});
});
