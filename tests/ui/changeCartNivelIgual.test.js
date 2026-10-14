/**
 * A LISTA DE CARRINHOS NAO SE REFAZ COM O MESMO NIVEL (D-2385, 14/10/2026).
 *
 * O `CLEVEL` de toda ficha reenviada (D-2374) chama `ChangeCart.onLevelUp` com
 * o nivel IGUAL, e `updateList` reescrevia o `display` dos nove carrinhos. A
 * janela real montada no jsdom:
 *  1. o ORACULO: 400 passos sorteados (nivel, ter carrinho ou nao, o `init`
 *     que esconde todos, o gesto da habilidade) contra o modelo do que a lista
 *     tem de mostrar (os carrinhos do ULTIMO nivel aplicado com carrinho);
 *  2. a CONTAGEM: 20 reenvios do mesmo nivel escrevem 0 `display` (antes, 12
 *     cada um no nivel 70, contados pelo setter, `contarEscritasDeEstilo.js`).
 */
import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { contarEscritasDeEstilo } from './contarEscritasDeEstilo.js';

vi.mock('Network/NetworkManager.js', () => ({ default: { sendPacket: vi.fn(), hookPacket: vi.fn() } }));
vi.mock('Renderer/Renderer.js', () => ({ default: { render: vi.fn(), stop: vi.fn(), width: 1280, height: 720 } }));
vi.mock('Renderer/Entity/Entity.js', () => ({ default: class Entity {} }));
vi.mock('Renderer/SpriteRenderer.js', () => ({ default: {} }));
vi.mock('Controls/KeyEventHandler.js', () => ({ default: { ESCAPE: 27 } }));
vi.mock('UI/UIManager.js', () => ({ default: { showErrorBox: vi.fn(), addComponent: c => c } }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({ default: { addText: vi.fn(), TYPE: {}, FILTER: {} } }));
vi.mock('UI/Components/ChatRoom/ChatRoom.js', () => ({ default: { isOpen: false, message: vi.fn() } }));
vi.mock('Core/Client.js', () => ({ default: { loadFiles: vi.fn(), loadFile: vi.fn() } }));
vi.mock('DB/DBManager.js', () => ({ default: { getCartPath: i => 'cart' + i } }));

const html = readFileSync(join(__dirname, '..', '..', 'src', 'UI', 'Components', 'ChangeCart', 'ChangeCart.html'), 'utf8');

/** Os carrinhos que o nivel abre, como `updateList` os escreve. */
function visiveisNoNivel(n) {
	const v = new Set([1]);
	[
		[40, 2],
		[65, 3],
		[80, 4],
		[90, 5],
		[100, 6],
		[111, 7],
		[121, 8],
		[131, 9]
	].forEach(([acima, id]) => n > acima && v.add(id));
	return v;
}

async function montar() {
	vi.resetModules();
	const { default: Session } = await import('Engine/SessionStorage.js');
	const { default: ChangeCart } = await import('UI/Components/ChangeCart/ChangeCart.js');
	ChangeCart._host = document.createElement('div');
	ChangeCart._host.innerHTML = html;
	ChangeCart._shadow = null;
	ChangeCart.draggable = () => {};
	ChangeCart.ui = { show: vi.fn() };
	Session.Entity = { hasCart: true, clevel: 1, dialog: { set: vi.fn() } };
	ChangeCart.init();
	const mostrados = () =>
		[...ChangeCart._host.querySelectorAll('.cart')]
			.filter(c => c.style.display !== 'none')
			.map(c => Number(c.getAttribute('data-id')))
			.sort((a, b) => a - b);
	return { ChangeCart, Session, mostrados };
}

describe('ChangeCart.onLevelUp', () => {
	it('o oraculo: a lista e sempre a do ultimo nivel aplicado com carrinho', async () => {
		const { ChangeCart, Session, mostrados } = await montar();
		let semente = 7;
		const sorteio = n => {
			semente = (semente * 1103515245 + 12345) % 2147483648;
			return semente % n;
		};
		// O modelo: `init` esconde todos; o nivel so e aplicado com carrinho.
		let esperado = new Set();
		let nivel = 1;
		let conferidos = 0;
		for (let passo = 0; passo < 400; passo++) {
			const r = sorteio(100);
			if (r < 55) {
				// O reenvio da ficha: quase sempre o mesmo nivel.
				nivel = sorteio(4) === 0 ? 1 + sorteio(150) : nivel;
				ChangeCart.onLevelUp(nivel);
				if (Session.Entity.hasCart) esperado = visiveisNoNivel(nivel);
			} else if (r < 75) {
				Session.Entity.hasCart = !Session.Entity.hasCart;
			} else if (r < 85) {
				ChangeCart.init();
				esperado = new Set();
			} else {
				Session.Entity.clevel = nivel;
				ChangeCart.onChangeCartSkill();
				if (Session.Entity.hasCart) esperado = visiveisNoNivel(nivel);
			}
			expect(mostrados(), 'passo ' + passo).toEqual([...esperado].sort((a, b) => a - b));
			conferidos++;
		}
		expect(conferidos).toBe(400);
	});

	it('a contagem: 20 reenvios do mesmo nivel escrevem 0 display; o nivel novo escreve', async () => {
		const { ChangeCart, mostrados } = await montar();
		const escritas = contarEscritasDeEstilo(['display']);
		ChangeCart.onLevelUp(70);
		const primeira = escritas.n;
		expect(primeira).toBeGreaterThan(0);
		for (let i = 0; i < 20; i++) ChangeCart.onLevelUp(70);
		expect(escritas.n - primeira, 'o mesmo nivel reescreveu a lista').toBe(0);
		expect(mostrados()).toEqual([1, 2, 3]);
		ChangeCart.onLevelUp(85);
		expect(escritas.n).toBeGreaterThan(primeira);
		expect(mostrados()).toEqual([1, 2, 3, 4]);
		console.log(`[D-2385] ChangeCart: 21 CLEVEL iguais, escritas de display ${primeira * 21} -> ${primeira}`);
	});

	it('sem carrinho nada e escrito, e o nivel igual depois de ganhar o carrinho continua certo', async () => {
		const { ChangeCart, Session, mostrados } = await montar();
		ChangeCart.onLevelUp(50);
		Session.Entity.hasCart = false;
		ChangeCart.onLevelUp(120);
		expect(mostrados()).toEqual([1, 2]);
		Session.Entity.hasCart = true;
		ChangeCart.onLevelUp(120);
		expect(mostrados()).toEqual([1, 2, 3, 4, 5, 6, 7]);
		ChangeCart.init();
		ChangeCart.onLevelUp(120);
		expect(mostrados(), 'o init escondeu tudo: o mesmo nivel tem de mostrar de novo').toEqual([1, 2, 3, 4, 5, 6, 7]);
	});
});
