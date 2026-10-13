/**
 * A faixa de aviso (UI Announce) no celular em pe (bug #1 de 13/10/2026).
 * Ver src/UI/Components/Announce/posicaoDaFaixa.js.
 *
 * O relato: a faixa caia SOBRE a barra do topo da HUD vertical e o botao do menu
 * cobria o fim da 1a linha. A geometria de verdade (a faixa medida contra as
 * pecas da HUD, com o jogo rodando) e da sonda `scripts/diag-faixa-de-aviso-na-tela.ts`
 * no repositorio do servidor; este arquivo e o portao barato que roda em toda suite.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
	FILEIRA_DO_AVISO_DE_ITEM,
	LARGURA_DO_CARTAO,
	LARGURA_DO_TRILHO,
	MARGEM,
	VAO_DO_CARTAO,
	VARIAVEL_DO_TOPO,
	ehHudVertical,
	larguraDaColuna,
	larguraDaFaixaNaVertical,
	larguraLivre,
	posicionarNaVertical,
	publicarTopo,
	soltarDaVertical,
	topoDaFaixaNaVertical
} from 'UI/Components/Announce/posicaoDaFaixa.js';

/** As larguras de celular em pe da matriz da casa (Common.css: ate 599px). */
const TELAS = [320, 360, 375, 390, 393, 412, 430, 599];

describe('a largura da faixa na HUD vertical', () => {
	it('a coluna e a do cartao de missoes (236) e encolhe so quando a tela e menor', () => {
		expect(larguraDaColuna(390)).toBe(LARGURA_DO_CARTAO);
		expect(larguraDaColuna(393)).toBe(236);
		expect(larguraDaColuna(320)).toBe(228);
	});
	it('nunca fica abaixo do piso de 100px, nem em tela absurda', () => {
		expect(larguraDaColuna(100)).toBe(100);
		expect(larguraLivre(100)).toBe(100);
	});
	it('o vao livre vai da margem esquerda ate o trilho, com ar dos dois lados', () => {
		expect(larguraLivre(390)).toBe(390 - MARGEM - LARGURA_DO_TRILHO - MARGEM - MARGEM);
		expect(larguraLivre(390)).toBe(306);
	});
	it('sem largura pedida (o aviso comum) vale a coluna', () => {
		expect(larguraDaFaixaNaVertical(390, null)).toBe(236);
		expect(larguraDaFaixaNaVertical(390, 0)).toBe(236);
	});
	it('com largura pedida (o banner de conquista) vale o pedido, limitado ao vao livre', () => {
		expect(larguraDaFaixaNaVertical(390, 390)).toBe(306);
		expect(larguraDaFaixaNaVertical(390, 2000)).toBe(306);
		expect(larguraDaFaixaNaVertical(390, 200)).toBe(200);
	});
	it('INVARIANTE: a faixa nunca encosta no trilho da direita, em nenhuma tela de celular', () => {
		for (const w of TELAS) {
			for (const pedida of [null, 100, w, 2000]) {
				const largura = larguraDaFaixaNaVertical(w, pedida);
				// borda direita da faixa (a faixa nasce na margem) antes do trilho + a margem dele
				expect(MARGEM + largura, `tela ${w}, pedida ${pedida}`).toBeLessThanOrEqual(w - LARGURA_DO_TRILHO - MARGEM);
			}
		}
	});
});

describe('o topo da faixa na HUD vertical', () => {
	it('fica abaixo do cartao de missoes, deixando a fileira do aviso de item livre', () => {
		expect(topoDaFaixaNaVertical(238)).toBe(238 + VAO_DO_CARTAO + FILEIRA_DO_AVISO_DE_ITEM);
		expect(topoDaFaixaNaVertical(238)).toBe(286);
	});
	it('a fileira reservada e a de 44px que o aviso de item e os buffs ja usam', () => {
		expect(FILEIRA_DO_AVISO_DE_ITEM).toBe(44);
		expect(topoDaFaixaNaVertical(100) - 100).toBeGreaterThanOrEqual(FILEIRA_DO_AVISO_DE_ITEM + VAO_DO_CARTAO);
	});
	it('arredonda para pixel inteiro (a medida do navegador e fracionaria)', () => {
		expect(topoDaFaixaNaVertical(238.4)).toBe(286);
		expect(topoDaFaixaNaVertical(238.6)).toBe(287);
	});
	it('sem cartao medido nao ha topo (o CSS usa o calc de nascenca)', () => {
		expect(topoDaFaixaNaVertical(null)).toBeNull();
		expect(topoDaFaixaNaVertical(undefined)).toBeNull();
		expect(topoDaFaixaNaVertical(Number.NaN)).toBeNull();
		expect(topoDaFaixaNaVertical('238')).toBeNull();
	});
	it('um cartao que acaba em zero e medida valida, nao ausencia', () => {
		expect(topoDaFaixaNaVertical(0)).toBe(VAO_DO_CARTAO + FILEIRA_DO_AVISO_DE_ITEM);
	});
});

/** Um host falso: so o `style` que a faixa escreve. */
function hostFalso() {
	const props = new Map();
	return {
		props,
		style: {
			setProperty: (nome, valor) => props.set(nome, valor),
			removeProperty: nome => props.delete(nome)
		}
	};
}

/** Um documento falso: a marca no <html>, o cartao de missoes medido, e o ResizeObserver da janela. */
function docFalso({ vertical = true, cartao = { bottom: 238, height: 154 }, observador = true } = {}) {
	const observados = [];
	const cartoes = cartao
		? {
				getBoundingClientRect: () => ({ bottom: cartao.bottom, height: cartao.height }),
				muda(novo) {
					Object.assign(cartao, novo);
				}
			}
		: null;
	class Observador {
		constructor(chamada) {
			this.chamada = chamada;
			this.desligado = false;
			observados.push(this);
		}
		observe(alvo) {
			this.alvo = alvo;
		}
		disconnect() {
			this.desligado = true;
		}
	}
	return {
		observados,
		cartoes,
		documentElement: { classList: { contains: marca => vertical && marca === 'ri-vertical' } },
		querySelector: seletor => (seletor === 'div[id^="MissoesTrackerIdle"]' ? cartoes : null),
		defaultView: observador ? { ResizeObserver: Observador } : {}
	};
}

describe('a HUD vertical vale?', () => {
	it('le a marca ri-vertical do <html>, a mesma que o CSS usa', () => {
		expect(ehHudVertical(docFalso({ vertical: true }))).toBe(true);
		expect(ehHudVertical(docFalso({ vertical: false }))).toBe(false);
	});
	it('sem documento nao vale (casca de teste)', () => {
		expect(ehHudVertical(null)).toBe(false);
		expect(ehHudVertical({})).toBe(false);
	});
});

describe('publicar o topo da faixa medindo o cartao', () => {
	it('escreve o topo debaixo do cartao na variavel que o CSS le', () => {
		const host = hostFalso();
		const topo = publicarTopo(host, docFalso());
		expect(topo).toBe(286);
		expect(host.props.get(VARIAVEL_DO_TOPO)).toBe('286px');
		expect(VARIAVEL_DO_TOPO).toBe('--vr-aviso-topo');
	});
	it('mede o cartao REAL: uma missao a mais empurra a faixa para baixo', () => {
		const host = hostFalso();
		publicarTopo(host, docFalso({ cartao: { bottom: 300, height: 216 } }));
		expect(host.props.get(VARIAVEL_DO_TOPO)).toBe('348px');
	});
	it('passa a medida pelo conversor da HUD (o zoom obriga) antes de escrever', () => {
		const host = hostFalso();
		publicarTopo(host, docFalso({ cartao: { bottom: 200, height: 100 } }), px => px / 2);
		expect(host.props.get(VARIAVEL_DO_TOPO)).toBe('148px');
	});
	it('sem cartao na tela a variavel SAI, e o CSS cai no calc de nascenca', () => {
		const host = hostFalso();
		host.props.set(VARIAVEL_DO_TOPO, '999px');
		expect(publicarTopo(host, docFalso({ cartao: null }))).toBeNull();
		expect(host.props.has(VARIAVEL_DO_TOPO)).toBe(false);
	});
	it('cartao com altura zero (escondido) conta como ausente', () => {
		const host = hostFalso();
		host.props.set(VARIAVEL_DO_TOPO, '999px');
		expect(publicarTopo(host, docFalso({ cartao: { bottom: 238, height: 0 } }))).toBeNull();
		expect(host.props.has(VARIAVEL_DO_TOPO)).toBe(false);
	});
	it('soltar tira a variavel (o aparelho que gira volta ao top do desktop)', () => {
		const host = hostFalso();
		host.props.set(VARIAVEL_DO_TOPO, '286px');
		soltarDaVertical(host);
		expect(host.props.has(VARIAVEL_DO_TOPO)).toBe(false);
	});
});

describe('posicionar e acompanhar o cartao', () => {
	it('posiciona na hora E observa o cartao', () => {
		const host = hostFalso();
		const doc = docFalso();
		posicionarNaVertical(host, doc);
		expect(host.props.get(VARIAVEL_DO_TOPO)).toBe('286px');
		expect(doc.observados).toHaveLength(1);
		expect(doc.observados[0].alvo).toBe(doc.cartoes);
	});
	it('o cartao cresce DEPOIS (as missoes chegam): a faixa desce junto', () => {
		const host = hostFalso();
		const doc = docFalso({ cartao: { bottom: 90, height: 20 } });
		posicionarNaVertical(host, doc);
		expect(host.props.get(VARIAVEL_DO_TOPO)).toBe('138px');
		doc.cartoes.muda({ bottom: 238, height: 154 });
		doc.observados[0].chamada();
		expect(host.props.get(VARIAVEL_DO_TOPO)).toBe('286px');
	});
	it('o desligador solta o observador', () => {
		const doc = docFalso();
		const parar = posicionarNaVertical(hostFalso(), doc);
		expect(doc.observados[0].desligado).toBe(false);
		parar();
		expect(doc.observados[0].desligado).toBe(true);
	});
	it('sem ResizeObserver ou sem cartao posiciona uma vez e devolve um desligador inofensivo', () => {
		const semObservador = docFalso({ observador: false });
		const host = hostFalso();
		const parar = posicionarNaVertical(host, semObservador);
		expect(host.props.get(VARIAVEL_DO_TOPO)).toBe('286px');
		expect(() => parar()).not.toThrow();
		const semCartao = docFalso({ cartao: null });
		expect(() => posicionarNaVertical(hostFalso(), semCartao)()).not.toThrow();
		expect(semCartao.observados).toHaveLength(0);
	});
});

const RAIZ = join(process.cwd(), 'src', 'UI');
const COMUM = readFileSync(join(RAIZ, 'Common.css'), 'utf8');
const CSS_DA_FAIXA = readFileSync(join(RAIZ, 'Components', 'Announce', 'Announce.css'), 'utf8');
const COMPONENTE = readFileSync(join(RAIZ, 'Components', 'Announce', 'Announce.js'), 'utf8');

/** O corpo da regra `html.ri-vertical #Announce { ... }` do Common.css. */
function regraDaVertical() {
	const inicio = COMUM.indexOf('html.ri-vertical #Announce');
	expect(inicio, 'a regra da faixa na HUD vertical sumiu do Common.css').toBeGreaterThan(-1);
	const abre = COMUM.indexOf('{', inicio);
	const fecha = COMUM.indexOf('}', abre);
	return COMUM.slice(abre + 1, fecha).replace(/\s+/g, ' ');
}

describe('a costura: CSS, componente e a regra de posicao', () => {
	it('o CSS da vertical posiciona por VARIAVEL com o calc de nascenca de reserva, e com !important', () => {
		const corpo = regraDaVertical();
		expect(corpo, 'o top deixou de ler a variavel que o componente publica').toMatch(
			/top:\s*var\(\s*--vr-aviso-topo\s*,\s*calc\(.*\)\s*\)\s*!important/
		);
		expect(corpo, 'o left deixou de respeitar a margem e a borda segura').toMatch(
			/left:\s*calc\(\s*var\(--safe-esq, 0px\) \+ var\(--vr-margem\)\s*\)\s*!important/
		);
	});
	it('o calc de nascenca deixa a fileira do aviso de item livre debaixo do topo da HUD', () => {
		expect(regraDaVertical()).toContain('var(--vr-abaixo-do-topo) + 48px');
		expect(VAO_DO_CARTAO + FILEIRA_DO_AVISO_DE_ITEM).toBe(48);
	});
	it('o desktop continua com o top de sempre: o Announce.css nao mudou', () => {
		expect(CSS_DA_FAIXA).toMatch(/:host\s*\{\s*top:\s*40px;/);
	});
	it('o componente usa as funcoes da regra de posicao (e a guarda da vertical)', () => {
		expect(COMPONENTE, 'a posicao voltou a morar no componente').toContain("from './posicaoDaFaixa.js'");
		expect(COMPONENTE).toContain('ehHudVertical(document)');
		expect(COMPONENTE, 'o componente nao mede mais o cartao').toContain('posicionarNaVertical(');
		expect(COMPONENTE, 'o aparelho que gira ficaria com a faixa da vertical').toContain('soltarDaVertical(');
		expect(COMPONENTE, 'a quebra de linha nao respeita a coluna da vertical').toContain('larguraDaFaixaNaVertical(');
	});
	it('o componente para de acompanhar o cartao ao sair', () => {
		expect(COMPONENTE).toMatch(/onRemove[\s\S]{0,400}pararDeAcompanhar\(\)/);
	});
});
