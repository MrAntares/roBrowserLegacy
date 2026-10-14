/**
 * A BARRA DE VIDA DO MEMBRO DO GRUPO NAO SE REPINTA IGUAL (D-2385, 14/10/2026).
 *
 * `PartyFriends.updateMemberLife` roda a cada `ZC_PAR_CHANGE` de HP e de HP
 * maximo do PROPRIO jogador e a cada `ZC_NOTIFY_HP_TO_GROUPM`; a ficha e
 * reenviada a cada tique sujo (D-2374) e o HP e o HP maximo chegam em dois
 * pacotes. Cada chamada fazia `canvas.width = 75` (zera o bitmap) e pintava de
 * novo, mais texto e visibilidade.
 *
 *  1. O ORACULO do modulo (`barraDoMembro.js`): 800 passos sorteados (HP, HP
 *     maximo, contexto perdido e devolvido, canvas redimensionado, pintura de
 *     fora) num canvas pelo caminho novo e noutro pelo de antes; o bitmap
 *     (modelado pelas chamadas do contexto) e o MESMO depois de cada passo.
 *  2. A COSTURA, na janela de grupo real (V1, a do PACKETVER 20211103) e no
 *     membro destacado: 20 pacotes com a mesma vida pintam 1 vez (antes, 20) e
 *     nao reescrevem texto nem visibilidade; a vida nova pinta.
 */
import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { contarEscritasDeEstilo } from './contarEscritasDeEstilo.js';

/*
 * O jsdom nao tem canvas 2D: cada canvas ganha um contexto que GUARDA o bitmap como a lista do que foi pintado
 * desde a ultima limpeza (redimensionar e `clearRect` do canvas inteiro limpam), e conta as pinturas.
 */
const pinturas = { n: 0 };
const bitmapDe = new WeakMap();
function contextoDe(canvas) {
	const base = {
		fillStyle: '',
		clearRect(x, y, w, h) {
			if (x === 0 && y === 0 && w >= canvas.width && h >= canvas.height) bitmapDe.set(canvas, []);
			else (bitmapDe.get(canvas) || bitmapDe.set(canvas, []).get(canvas)).push(['clear', x, y, w, h]);
		},
		fillRect(x, y, w, h) {
			pinturas.n++;
			(bitmapDe.get(canvas) || bitmapDe.set(canvas, []).get(canvas)).push([this.fillStyle, x, y, w, h]);
		},
		measureText: () => ({ width: 0 }),
		getImageData: () => ({ data: new Uint8ClampedArray(4) }),
		createImageData: () => ({ data: new Uint8ClampedArray(4) })
	};
	// O resto do cliente (o texto das entidades, importado junto da janela) pinta no canvas ao carregar.
	return new Proxy(base, { get: (alvo, nome) => (nome in alvo ? alvo[nome] : () => {}) });
}
const contextos = new WeakMap();
HTMLCanvasElement.prototype.getContext = function () {
	if (!contextos.has(this)) contextos.set(this, contextoDe(this));
	return contextos.get(this);
};
// Redimensionar (mesmo para o mesmo tamanho) zera o bitmap, como no navegador.
for (const lado of ['width', 'height']) {
	const d = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, lado);
	Object.defineProperty(HTMLCanvasElement.prototype, lado, {
		...d,
		set(v) {
			bitmapDe.set(this, []);
			d.set.call(this, v);
		}
	});
}
const bitmap = c => JSON.stringify([c.width, c.height, bitmapDe.get(c) || []]);

vi.mock('Network/NetworkManager.js', () => ({ default: { sendPacket: vi.fn(), hookPacket: vi.fn() } }));
vi.mock('Renderer/Renderer.js', () => ({ default: { render: vi.fn(), stop: vi.fn(), width: 1280, height: 720 } }));
vi.mock('UI/UIManager.js', () => ({ default: { showErrorBox: vi.fn(), addComponent: c => c, getComponent: () => ({}) } }));
vi.mock('Core/Client.js', () => ({ default: { loadFile: vi.fn(), loadFiles: vi.fn() } }));
vi.mock('DB/DBManager.js', () => ({ default: { getMapName: m => m, INTERFACE_PATH: '', getMessage: () => '' } }));
vi.mock('UI/Components/MiniMap/MiniMap.js', () => ({ default: { getMemberColor: () => 'white' } }));
const { default: Session } = await import('Engine/SessionStorage.js');
const { default: Party } = await import('UI/Components/PartyFriends/PartyFriendsV1/PartyFriendsV1.js');
const { default: Externo } = await import('UI/Components/PartyFriends/PartyMemberExternal/PartyMemberExternal.js');
const { desenharBarraDoMembro, esquecerBarraDoMembro, pintarBarraDoMembro } = await import('UI/Components/PartyFriends/barraDoMembro.js');

describe('barraDoMembro.js: o oraculo contra a pintura de antes', () => {
	it('800 passos: o bitmap do caminho novo e o do de antes sao iguais depois de cada um', async () => {
		const novo = document.createElement('canvas');
		const antes = document.createElement('canvas');
		let semente = 3;
		const sorteio = n => {
			semente = (semente * 1103515245 + 12345) % 2147483648;
			return semente % n;
		};
		let hp = 500;
		let max = 1000;
		let pintouNovo = 0;
		for (let passo = 0; passo < 800; passo++) {
			const r = sorteio(100);
			if (r < 70) {
				if (sorteio(3) === 0) hp = sorteio(1200);
				if (sorteio(10) === 0) max = 1 + sorteio(1500);
				if (desenharBarraDoMembro(novo, hp, max)) pintouNovo++;
				pintarBarraDoMembro(antes, hp, max);
			} else if (r < 78) {
				// O contexto devolvido volta EM BRANCO (nos dois canvas, como no navegador).
				bitmapDe.set(novo, []);
				bitmapDe.set(antes, []);
				novo.dispatchEvent(new Event(sorteio(2) ? 'contextrestored' : 'contextlost'));
			} else if (r < 86) {
				// Redimensionar para OUTRO tamanho. Voltar a 75x5 por fora nao e caso: o tamanho, so este modulo
				// o escreve (o cabecalho dele diz o contrato).
				if (novo.width === 75) {
					novo.width = 76;
					antes.width = 76;
				}
			} else if (r < 92) {
				// Alguem pinta por fora e avisa.
				novo.getContext('2d').clearRect(0, 0, 75, 5);
				antes.getContext('2d').clearRect(0, 0, 75, 5);
				esquecerBarraDoMembro(novo);
			} else {
				if (novo.height === 5) {
					novo.height = 6;
					antes.height = 6;
				}
			}
			// Depois de cada pintura pedida os dois mostram a mesma barra.
			if (r < 70) expect(bitmap(novo), 'passo ' + passo).toBe(bitmap(antes));
		}
		// E o caminho novo pintou bem menos que um por passo (os pacotes repetidos nao pintam).
		expect(pintouNovo).toBeGreaterThan(50);
		expect(pintouNovo).toBeLessThan(500);
	});
});

describe('barraDoMembro.js: a perda de contexto, um evento de cada vez', () => {
	for (const evento of ['contextlost', 'contextrestored']) {
		it(`so o ${evento}: a mesma vida pinta de novo`, () => {
			const canvas = document.createElement('canvas');
			expect(desenharBarraDoMembro(canvas, 300, 1000)).toBe(true);
			expect(desenharBarraDoMembro(canvas, 300, 1000)).toBe(false);
			bitmapDe.set(canvas, []);
			canvas.dispatchEvent(new Event(evento));
			expect(desenharBarraDoMembro(canvas, 300, 1000)).toBe(true);
			expect(bitmap(canvas)).toBe(JSON.stringify([75, 5, [['#32cd32', 0, 0, 22, 5]]]));
		});
	}
});

describe('a costura: a janela de grupo real e o membro destacado', () => {
	async function montarJanela(aid) {
		const html = readFileSync(join(__dirname, '..', '..', 'src', 'UI', 'Components', 'PartyFriends', 'PartyFriendsV1', 'PartyFriendsV1.html'), 'utf8');
		Party._host = document.createElement('div');
		Party._host.innerHTML = html;
		Party._shadow = null;
		Session.AID = aid;
		Party.addPartyMember({ AID: aid, GID: aid - 1850000, characterName: 'Eu' + aid, mapName: 'prt_fild08', role: 0, state: 0, class_: 1, baseLevel: 50 });
		const no = () => Party._host.querySelector(`.content .party .node[data-aid="${aid}"]`);
		return { no };
	}

	it('20 pacotes com a mesma vida pintam a barra 1 vez e nao reescrevem o texto', async () => {
		const { no } = await montarJanela(2000001);
		expect(no(), 'a linha do membro nao nasceu').toBeTruthy();
		const obs = new MutationObserver(() => {});
		obs.observe(Party._host, { subtree: true, childList: true, characterData: true, attributes: true });
		const antes = pinturas.n;
		for (let i = 0; i < 20; i++) Party.updateMemberLife(2000001, null, 700, 1000);
		expect(pinturas.n - antes, 'a mesma vida repintou a barra').toBe(1);
		const mutacoes = obs.takeRecords().length;
		// A primeira acende a barra e escreve o texto; as outras nao mexem em nada (nem na visibilidade, que o
		// jsdom nao registra quando igual: contada no setter).
		const visibilidade = contarEscritasDeEstilo(['visibility']);
		for (let i = 0; i < 20; i++) Party.updateMemberLife(2000001, null, 700, 1000);
		expect(obs.takeRecords().length, 'a mesma vida mexeu no DOM').toBe(0);
		expect(visibilidade.n, 'a mesma vida reescreveu a visibilidade').toBe(0);
		expect(mutacoes).toBeGreaterThan(0);
		expect(no().querySelector('.hp').textContent).toBe('700/1000');
		const canvas = no().querySelector('canvas');
		expect(bitmap(canvas)).toBe(JSON.stringify([75, 5, [['#32cd32', 0, 0, 52, 5]]]));
		// A vida nova pinta, e a abaixo de 25% fica vermelha.
		Party.updateMemberLife(2000001, null, 200, 1000);
		expect(pinturas.n - antes).toBe(2);
		expect(bitmap(canvas)).toBe(JSON.stringify([75, 5, [['#ef1010', 0, 0, 15, 5]]]));
		expect(no().querySelector('.hp').textContent).toBe('200/1000');
		console.log('[D-2385] PartyFriends: 41 pacotes, 2 vidas distintas: pinturas 41 -> 2');
	});

	it('a linha refeita (renderPartyMember troca o no) pinta de novo com a mesma vida', async () => {
		const { no } = await montarJanela(2000002);
		Party.updateMemberLife(2000002, null, 700, 1000);
		const antes = pinturas.n;
		// O membro mudou de mapa: `renderPartyMember` troca o no inteiro (`outerHTML`).
		Party.addPartyMember({ AID: 2000002, characterName: 'Eu2000002', mapName: 'prt_fild09', role: 0, state: 0, class_: 1, baseLevel: 50 });
		// O no novo nasce com o canvas em branco e a vida guardada na linha: ele mesmo a pinta.
		const canvas = no().querySelector('canvas');
		expect(bitmap(canvas)).toBe(JSON.stringify([75, 5, [['#32cd32', 0, 0, 52, 5]]]));
		Party.updateMemberLife(2000002, null, 700, 1000);
		expect(bitmap(no().querySelector('canvas'))).toBe(JSON.stringify([75, 5, [['#32cd32', 0, 0, 52, 5]]]));
		expect(pinturas.n - antes).toBe(1);
	});

	it('o membro destacado: a mesma vida nao repinta; sem vida limpa, e a volta pinta', async () => {
		const raiz = document.createElement('div');
		raiz.innerHTML = '<div class="hp-bar-container" style="visibility:hidden"><canvas width="75" height="5"></canvas></div><span class="hp-text"></span>';
		const membro = Object.create(Externo);
		membro._host = raiz;
		membro._shadow = null;
		membro.getRoot = () => raiz;
		const canvas = raiz.querySelector('canvas');
		const antes = pinturas.n;
		membro.updateMemberLife(900, 1000);
		const registros = new MutationObserver(() => {});
		registros.observe(raiz, { subtree: true, childList: true, characterData: true, attributes: true });
		const visibilidade = contarEscritasDeEstilo(['visibility']);
		for (let i = 0; i < 9; i++) membro.updateMemberLife(900, 1000);
		expect(registros.takeRecords().length, 'a mesma vida mexeu no DOM do destacado').toBe(0);
		expect(visibilidade.n, 'a mesma vida reescreveu a visibilidade do destacado').toBe(0);
		expect(pinturas.n - antes).toBe(1);
		expect(raiz.querySelector('.hp-text').textContent).toBe('900/1000');
		expect(raiz.querySelector('.hp-bar-container').style.visibility).toBe('visible');
		membro.updateMemberLife(undefined, undefined);
		expect(bitmap(canvas)).toBe(JSON.stringify([75, 5, []]));
		expect(raiz.querySelector('.hp-text').textContent).toBe('');
		// A mesma vida de antes, depois da limpeza de fora: tem de pintar.
		membro.updateMemberLife(900, 1000);
		expect(bitmap(canvas)).toBe(JSON.stringify([75, 5, [['#32cd32', 0, 0, 67, 5]]]));
		expect(pinturas.n - antes).toBe(2);
	});
});
