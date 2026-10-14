/**
 * A faixa de aviso MONTADA (bug #1 de 13/10/2026, rodada 2): o `Announce.set` de
 * verdade, no jsdom, usando a regra de `posicaoDaFaixa.js`.
 *
 * A rodada 1 vigiava esta costura lendo o TEXTO do `Announce.js`
 * (`toContain('larguraDaFaixaNaVertical(')`), e o critico mostrou que 5 de 6
 * mutantes da costura sobreviviam: quebrar na tela inteira, banner sem teto,
 * acompanhamento que vaza, sem conversor, sem parar antes de reposicionar. Aqui o
 * componente desenha de verdade e o teste olha o que sai: o tamanho do canvas, as
 * linhas escritas nele, a posicao publicada no host e o que acontece depois que a
 * faixa sai.
 *
 * As pecas da HUD sao elementos de verdade no documento (hosts com o id do
 * componente e, onde a caixa mora no shadow, o filho la dentro), com a caixa
 * MEDIDA pelo critico em 390x844. O jsdom nao tem layout, entao a caixa de cada
 * uma e a do canvas da faixa sao dadas pelo teste. O canvas do jsdom nao desenha:
 * o contexto falso mede o texto (meia fonte por letra) e anota cada `fillText`.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

/** O contexto 2d falso: mede pela fonte corrente e anota as linhas escritas. */
const escritas = [];
const contexto = new Proxy(
	{ font: '12px Arial' },
	{
		get: (alvo, chave) => {
			if (chave === 'measureText') {
				return texto => ({ width: texto.length * parseInt(alvo.font, 10) * 0.5 });
			}
			if (chave === 'fillText') {
				return (texto, x, y) => escritas.push({ texto, x, y, font: alvo.font });
			}
			// o `EntityDisplay` le pixels no import
			if (chave === 'getImageData' || chave === 'createImageData') {
				return () => ({ data: new Uint8ClampedArray(4) });
			}
			if (chave in alvo) return alvo[chave];
			return () => {};
		},
		set: (alvo, chave, valor) => {
			alvo[chave] = valor;
			return true;
		}
	}
);
HTMLCanvasElement.prototype.getContext = function getContext() {
	return contexto;
};

const medir = (texto, fonte) => texto.length * fonte * 0.5;

let Announce, Renderer, Events, escala;

/** O que o CSS le (`html.ri-vertical #Announce`) e o passo da remedida: escritos aqui, e nao
 * importados da regra, para o teste rodar (e reprovar pelo motivo certo) contra o componente da base. */
const VARIAVEL = '--vr-aviso-topo';
const PASSO = 250;

/** Oraculo proprio: a faixa (com 4px de vao em volta) cobre alguma das pecas? */
function cobre(faixa, pecas) {
	return pecas.filter(
		p => faixa.x - 4 < p.x + p.w && faixa.x + faixa.w + 4 > p.x && faixa.y - 4 < p.y + p.h && faixa.y + faixa.h + 4 > p.y
	);
}
let agora = 0;

/** Anda o relogio do jogo (o mesmo que conta a vida da faixa). */
function andar(ms) {
	agora += ms;
	Events.process(agora);
}

const ZERO = { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0, x: 0, y: 0 };
function comCaixa(el, c) {
	el.getBoundingClientRect = () =>
		el.hidden ? ZERO : { left: c.x, top: c.y, width: c.w, height: c.h, right: c.x + c.w, bottom: c.y + c.h, x: c.x, y: c.y };
	return el;
}

/** Um host de componente no documento, com a caixa no proprio host ou num filho do shadow. */
function peca(id, caixas, dentro) {
	const host = document.createElement('div');
	host.id = id;
	document.body.appendChild(host);
	if (!dentro) {
		return [comCaixa(host, caixas[0])];
	}
	const sombra = host.attachShadow({ mode: 'open' });
	return caixas.map(c => {
		const el = document.createElement('div');
		if (dentro.startsWith('#')) el.id = dentro.slice(1);
		else el.className = dentro.slice(1);
		sombra.appendChild(el);
		return comCaixa(el, c);
	});
}

/** As pecas medidas pelo critico em 390x844. */
const CARTAO = { x: 8, y: 84, w: 236, h: 202 };
const PLACAR = { x: 8, y: 260, w: 248, h: 114 };
const BUFFS = [286, 340, 394].map(y => ({ x: 284, y, w: 38, h: 51 }));
const GRUPO = { x: 8, y: 436, w: 132, h: 84 };
const CHAT = { x: 8, y: 735, w: 42, h: 42 };
const ATALHOS = { x: 8, y: 778, w: 374, h: 62 };
const CABECALHO = { x: 8, y: 6, w: 325, h: 70 };
/** Rodada 3: o cartao "Voce morreu" (`.dw-card`) medido pelo critico em 390x844. */
const MORTE = { x: 0, y: 342, w: 390, h: 176 };
/** As caixas de nascenca das pecas que a tela baixa muda (restauradas depois de cada caso). */
const ORIGINAIS = [GRUPO, CHAT, ATALHOS].map(c => [c, { ...c }]);

let placar, grupo, morte;

const SMOKIE = 'Nao deu para encaixar a carta: esta carta ainda nao tem efeito no jogo e nao pode ser encaixada.';
const CONQUISTA = 'Conquista alcancada: Primeiros Passos na Cidade de Prontera';
const BANNER = { width: '100%', height: 50, fontSize: 20, life: 10000 };

beforeAll(async () => {
	Renderer = (await import('Renderer/Renderer.js')).default;
	Events = (await import('Core/Events.js')).default;
	escala = await import('UI/escalaDaHud.js');
	Announce = (await import('UI/Components/Announce/Announce.js')).default;

	peca('BasicInfoIdle', [CABECALHO]);
	peca('MissoesTrackerIdle', [CARTAO]);
	[placar] = peca('PlacarMvpIdle', [PLACAR], '.pm-placar');
	[grupo] = peca('PartyHud', [GRUPO], '.ph-hud');
	peca('StatusIcons', BUFFS, '.state');
	peca('ChatBox', [CHAT], '#chatbox');
	peca('ShortCut', [ATALHOS]);
	// a janela de morte fica no documento o jogo inteiro (`MapEngine` a pendura ao entrar no
	// mapa) e o host dela cobre a TELA INTEIRA; o cartao so tem caixa com a janela aberta
	[morte] = peca('DeathWindow', [MORTE], '.dw-card');
	comCaixa(document.getElementById('DeathWindow'), { x: 0, y: 0, w: 390, h: 844 });
}, 60_000);

/** A caixa desenhada da faixa: o canvas, na margem da coluna (o `left` do CSS). */
function caixaDaFaixa() {
	return { x: 8, y: 0, w: Announce.canvas.width, h: Announce.canvas.height };
}

function anunciar(texto, opcoes) {
	escritas.length = 0;
	Announce.append();
	comCaixa(Announce._host, { get x() { return 8; }, y: 0, get w() { return Announce.canvas.width; }, get h() { return Announce.canvas.height; } });
	Announce.set(texto, '#FFD27A', opcoes);
}

const topoPublicado = () => Announce._host.style.getPropertyValue(VARIAVEL);
/** Rodada 3: a classe que adensa o fundo da faixa por cima de uma peca (escrita aqui, como a variavel). */
const sobrePeca = () => Announce._host.classList.contains('vr-aviso-sobre-peca');

function emPe() {
	document.documentElement.classList.add('ri-vertical');
	Renderer.width = 390;
	Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
	Object.defineProperty(window, 'innerHeight', { value: 844, configurable: true });
}

beforeEach(() => {
	placar.hidden = true;
	grupo.hidden = true;
	morte.hidden = true;
	emPe();
});

afterEach(() => {
	Announce.remove();
	document.documentElement.classList.remove('ri-vertical');
	for (const [caixa, original] of ORIGINAIS) Object.assign(caixa, original);
	window.matchMedia = matchMediaOriginal;
});

describe('celular em pe: a faixa na coluna, fora das pecas da HUD', () => {
	it('a escala da HUD e 1 nesta casca (o conversor nao mexe no numero)', () => {
		expect(escala.emUnidadesDaHud(100)).toBe(100);
	});
	it('o aviso longo QUEBRA na coluna (236): nenhuma linha passa por baixo de buff ou trilho', () => {
		anunciar(SMOKIE);
		expect(Announce.canvas.width).toBeLessThanOrEqual(236);
		expect(escritas.length).toBeGreaterThanOrEqual(3);
		for (const linha of escritas) expect(medir(linha.texto, 12)).toBeLessThanOrEqual(236 - 20);
		expect(escritas.map(l => l.texto).join(' ')).toBe(SMOKIE);
	});
	it('debaixo do cartao, deixando a fileira do aviso de item livre (sem placar nem grupo)', () => {
		anunciar(SMOKIE);
		expect(topoPublicado()).toBe('334px');
	});
	it('DEFEITO 1: com o placar do MVP na tela, a faixa fica debaixo dele (e nao sobre as linhas 2 e 3)', () => {
		placar.hidden = false;
		anunciar(SMOKIE);
		expect(topoPublicado()).toBe(`${PLACAR.y + PLACAR.h + 4}px`);
		const faixa = { ...caixaDaFaixa(), y: parseInt(topoPublicado(), 10) };
		expect(cobre(faixa, [PLACAR, ...BUFFS])).toEqual([]);
	});
	it('com placar E faixa de grupo, nao cobre nenhum dos dois', () => {
		placar.hidden = false;
		grupo.hidden = false;
		anunciar(SMOKIE);
		const faixa = { ...caixaDaFaixa(), y: parseInt(topoPublicado(), 10) };
		expect(cobre(faixa, [PLACAR, GRUPO, ...BUFFS])).toEqual([]);
		expect(faixa.y).toBe(GRUPO.y + GRUPO.h + 4);
	});
	it('DEFEITO 2: o banner de conquista fica na coluna, termina antes dos buffs e mostra o titulo INTEIRO', () => {
		anunciar(CONQUISTA, BANNER);
		expect(Announce.canvas.width).toBe(236);
		expect(8 + Announce.canvas.width + 4).toBeLessThanOrEqual(BUFFS[0].x);
		// o titulo quebra em mais linhas e a altura acompanha: nenhuma linha sai do canvas
		expect(escritas.length).toBeGreaterThanOrEqual(3);
		expect(Announce.canvas.height).toBe(10 + 25 * escritas.length);
		for (const linha of escritas) {
			expect(medir(linha.texto, 20)).toBeLessThanOrEqual(236 - 20);
			expect(linha.y - 10).toBeGreaterThanOrEqual(0);
			expect(linha.y + 10).toBeLessThanOrEqual(Announce.canvas.height);
		}
		expect(escritas.map(l => l.texto).join(' ')).toBe(CONQUISTA);
		const faixa = { ...caixaDaFaixa(), y: parseInt(topoPublicado(), 10) };
		expect(cobre(faixa, BUFFS)).toEqual([]);
	});
	it('o placar que chega DEPOIS da faixa a empurra para baixo na medida seguinte (250 ms)', () => {
		anunciar(SMOKIE);
		expect(topoPublicado()).toBe('334px');
		placar.hidden = false;
		andar(PASSO);
		expect(topoPublicado()).toBe('378px');
	});
	it('a faixa que sai para de medir: nada mais e escrito no host', () => {
		anunciar(SMOKIE);
		Announce.remove();
		placar.hidden = false;
		andar(PASSO);
		andar(PASSO);
		expect(topoPublicado()).toBe('334px');
	});
	it('dois avisos seguidos nao deixam o acompanhamento do primeiro vivo', () => {
		anunciar('Evento de EXP 2x ativo.');
		anunciar(SMOKIE);
		Announce.remove();
		placar.hidden = false;
		andar(PASSO);
		andar(PASSO);
		expect(topoPublicado()).toBe('334px');
	});
	it('o topo publicado passa pelo conversor da HUD (o zoom obriga)', () => {
		Object.defineProperty(window, 'innerWidth', { value: 512, configurable: true });
		expect(escala.emUnidadesDaHud(100)).toBe(200);
		placar.hidden = false;
		anunciar(SMOKIE);
		expect(topoPublicado()).toBe(`${378 * 2}px`);
	});
	it('o aparelho que gira: o aviso seguinte fora da vertical solta a variavel', () => {
		anunciar(SMOKIE);
		expect(topoPublicado()).toBe('334px');
		document.documentElement.classList.remove('ri-vertical');
		Renderer.width = 844;
		anunciar(SMOKIE);
		expect(topoPublicado()).toBe('');
	});
});

const matchMediaOriginal = window.matchMedia;

/**
 * A tela baixa medida pelo critico (390x664, o iPhone no Safari com a barra de baixo). O
 * aparelho e de DEDO (`pointer: coarse`), como no jogo: a escala da HUD fica 1 (`escalaDaHud.js`
 * so encolhe a HUD pelo tamanho da janela no mouse) e o topo publicado e o pixel medido.
 */
function telaBaixa() {
	window.matchMedia = q => ({ matches: q === '(pointer: coarse)', media: q, addEventListener() {}, removeEventListener() {} });
	Object.defineProperty(window, 'innerHeight', { value: 664, configurable: true });
	Object.assign(CHAT, { y: 552, w: 44, h: 44 });
	Object.assign(ATALHOS, { y: 597, h: 63 });
	Object.assign(GRUPO, { w: 172, h: 90 });
}

describe('rodada 3: a janela de morte e a tela baixa (os bloqueantes do critico da rodada 2)', () => {
	it('D1: com a janela de morte na tela, a faixa NAO fica atras do cartao "Voce morreu"', () => {
		// na rodada 2: 8,334, atras do cartao (z 2.000.000) por toda a vida da faixa
		morte.hidden = false;
		anunciar(SMOKIE);
		const faixa = { ...caixaDaFaixa(), y: parseInt(topoPublicado(), 10) };
		expect(cobre(faixa, [MORTE])).toEqual([]);
		expect(faixa.y + faixa.h).toBeLessThanOrEqual(844);
		// logo abaixo do cartao, livre do resto (le-se atraves do veu, como na base)
		expect(faixa.y).toBe(MORTE.y + MORTE.h + 4);
		expect(cobre(faixa, [CARTAO, CHAT, ATALHOS, ...BUFFS])).toEqual([]);
		// num lugar livre o fundo e o de sempre (o veu da morte ja escurece)
		expect(sobrePeca()).toBe(false);
	});
	it('D1: o cartao da morte que sobe DEPOIS da faixa a tira de tras dele na medida seguinte', () => {
		anunciar(SMOKIE);
		expect(topoPublicado()).toBe('334px');
		morte.hidden = false;
		andar(PASSO);
		expect(topoPublicado()).toBe(`${MORTE.y + MORTE.h + 4}px`);
		morte.hidden = true;
		andar(PASSO);
		expect(topoPublicado()).toBe('334px');
	});
	it('D1: o host da morte (tela inteira) nao conta: com a janela fechada a faixa fica no lugar de sempre', () => {
		anunciar(SMOKIE);
		expect(topoPublicado()).toBe('334px');
	});
	it('D2: placar e grupo numa tela baixa (390x664): sobre o cartao de missoes, sem cobrir a luta', () => {
		// na rodada 2: 8,378, sobre o titulo "GRUPO" e a linha do jogador
		telaBaixa();
		placar.hidden = false;
		grupo.hidden = false;
		for (const [texto, opcoes] of [
			[SMOKIE, undefined],
			[CONQUISTA, BANNER]
		]) {
			anunciar(texto, opcoes);
			const faixa = { ...caixaDaFaixa(), y: parseInt(topoPublicado(), 10) };
			expect(cobre(faixa, [CABECALHO, PLACAR, GRUPO, ...BUFFS, CHAT, ATALHOS]), texto).toEqual([]);
			expect(faixa.y, texto).toBe(CARTAO.y);
			expect(faixa.y + faixa.h, texto).toBeLessThanOrEqual(664);
			// por cima do cartao o fundo adensa: as letras do cartao nao aparecem sob as do aviso
			expect(sobrePeca(), texto).toBe(true);
		}
	});
	it('D2: na mesma tela baixa, sem o placar, a faixa volta ao lugar livre da coluna (nao fica no cartao)', () => {
		telaBaixa();
		grupo.hidden = false;
		anunciar(SMOKIE);
		expect(topoPublicado()).toBe('334px');
		placar.hidden = false;
		andar(PASSO);
		expect(topoPublicado()).toBe(`${CARTAO.y}px`);
		expect(sobrePeca()).toBe(true);
		placar.hidden = true;
		andar(PASSO);
		expect(topoPublicado()).toBe('334px');
		expect(sobrePeca()).toBe(false);
	});
});

/** A quebra de linha de sempre (a do `Announce.js` da base), para o desktop. */
function quebrarComoSempre(texto, maxWidth, fonte) {
	const linhas = [];
	let atual = '';
	for (const palavra of texto.split(' ')) {
		const teste = `${atual}${palavra} `;
		if (medir(teste, fonte) > maxWidth) {
			linhas.push(atual.trim());
			atual = `${palavra} `;
		} else {
			atual = teste;
		}
	}
	if (atual.trim()) linhas.push(atual.trim());
	return linhas;
}

describe('desktop: a faixa de sempre, igual a base', () => {
	beforeEach(() => {
		document.documentElement.classList.remove('ri-vertical');
		Renderer.width = 1366;
	});
	it('o aviso longo quebra em 500px, centrado, sem variavel de topo', () => {
		placar.hidden = false;
		anunciar(SMOKIE);
		const linhas = quebrarComoSempre(SMOKIE, 500, 12);
		const largura = 20 + Math.max(...linhas.map(l => medir(l, 12)));
		expect(escritas.map(l => l.texto)).toEqual(linhas);
		expect(Announce.canvas.width).toBe(largura);
		expect(Announce.canvas.height).toBe(10 + 17 * linhas.length);
		expect(Announce._host.style.left).toBe(`${(1366 - largura) >> 1}px`);
		expect(topoPublicado()).toBe('');
		andar(PASSO);
		expect(topoPublicado()).toBe('');
	});
	it('o banner de conquista ocupa a tela inteira com a altura pedida', () => {
		anunciar(CONQUISTA, BANNER);
		expect(Announce.canvas.width).toBe(1366);
		expect(Announce.canvas.height).toBe(50);
		expect(Announce._host.style.left).toBe('0px');
		expect(escritas.map(l => l.texto)).toEqual([CONQUISTA]);
	});
});
