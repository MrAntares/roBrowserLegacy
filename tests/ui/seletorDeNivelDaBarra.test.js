/**
 * O SELETOR DE NIVEL DE UM SLOT JA POSTO NA BARRA (D-1908).
 *
 * Desktop: botao direito no slot. Celular: tocar e segurar. Cada "−"/"+"
 * regrava o slot pelo caminho de sempre. O balao e montado aqui em jsdom com
 * a MESMA fabrica que a barra usa (`criarSeletorDeNivelDaBarra`), e as costuras
 * com a barra (`ShortCut.js`), a janela de Habilidades e a Configuracao sao
 * cobradas no fim, pelo fonte — o componente da barra depende do DOM do
 * roBrowser e nao monta em Node.
 *
 * O que NAO esta provado aqui, e e dito: a pintura (o balao no lugar certo,
 * acima do slot, com o zoom da HUD) e o `elementFromPoint` do dedo de 44px.
 * Isso pede a tela de verdade.
 */
import fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	criarSeletorDeNivelDaBarra,
	DESLIZE_QUE_CANCELA,
	MS_PARA_SEGURAR
} from '../../src/UI/Components/ShortCut/seletorDeNivelDaBarra.js';
import { fecharSeletorDeNivel, lembrarSpPorNivel, _zerarNivelDeUso } from 'UI/nivelDeUso.js';

const FIRE_BOLT = 19;

function montarBarra({ nivelDoSlot = 10, aprendido = 10 } = {}) {
	document.body.innerHTML = '';
	const barra = document.createElement('div');
	barra.id = 'ShortCut';
	barra.innerHTML =
		'<div class="container" data-index="0"><div class="icon"><div class="img"></div></div></div>' +
		'<div class="container" data-index="1"><div class="icon"><div class="img"></div></div></div>';
	document.body.appendChild(barra);
	const fora = document.createElement('div');
	fora.className = 'fora';
	document.body.appendChild(fora);

	const lista = [
		{ isSkill: true, ID: FIRE_BOLT, count: nivelDoSlot },
		{ isSkill: false, ID: 501, count: 3 }
	];
	const regravados = [];
	const descricoes = [];
	const seletor = criarSeletorDeNivelDaBarra({
		conteiner: () => barra,
		slot: i => lista[i],
		aprendido: () => aprendido,
		nome: () => 'Fire Bolt',
		nomeNoBanco: () => 'MG_FIREBOLT',
		regravar: (i, ID, nivel) => {
			regravados.push({ i, ID, nivel });
			lista[i] = { ...lista[i], count: nivel };
		},
		descricao: ID => descricoes.push(ID),
		ancora: i => barra.querySelector(`.container[data-index="${i}"]`)
	});
	seletor.ligarSegurar(barra);
	return { barra, fora, lista, regravados, descricoes, seletor };
}

/** Um evento de ponteiro com o tipo pedido (o jsdom nao garante PointerEvent). */
function ponteiro(tipo, alvo, { pointerType = 'touch', x = 10, y = 10 } = {}) {
	const ev = new MouseEvent(tipo, { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y });
	Object.defineProperty(ev, 'pointerType', { value: pointerType });
	alvo.dispatchEvent(ev);
	return ev;
}

const balao = barra => barra.querySelector('.shortcut-nivel');
const clicar = el => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

beforeEach(() => {
	_zerarNivelDeUso();
});
afterEach(() => {
	fecharSeletorDeNivel();
	vi.useRealTimers();
});

describe('abrir e mudar o nivel do slot', () => {
	it('abre o balao do slot de habilidade com o nivel, o SP lembrado e o selo', () => {
		lembrarSpPorNivel('MG_FIREBOLT', [12, 14, 16, 18, 20, 22, 24, 26, 28, 30]);
		const b = montarBarra({ nivelDoSlot: 7 });
		expect(b.seletor.abrir(0)).toBe(true);
		const el = balao(b.barra);
		expect(el.classList.contains('show')).toBe(true);
		expect(el.querySelector('.shortcut-nivel-titulo').textContent).toBe('Fire Bolt');
		expect(el.querySelector('.ri-nivel-valor').textContent).toBe('Nv 7/10 · 24 SP');
		expect(el.querySelector('.ri-nivel-selo').textContent).toBe('fixo');
	});

	it('item na barra nao tem nivel: o balao nao abre', () => {
		const b = montarBarra();
		expect(b.seletor.abrir(1)).toBe(false);
		expect(balao(b.barra)).toBeNull();
	});

	it('"−" regrava o slot um nivel abaixo, e o balao acompanha', () => {
		const b = montarBarra({ nivelDoSlot: 10 });
		b.seletor.abrir(0);
		clicar(balao(b.barra).querySelector('[data-nivel-passo="-1"]'));
		expect(b.regravados).toEqual([{ i: 0, ID: FIRE_BOLT, nivel: 9 }]);
		expect(balao(b.barra).querySelector('.ri-nivel-valor').textContent).toBe('Nv 9/10');
		expect(balao(b.barra).querySelector('.ri-nivel-selo').textContent).toBe('fixo');
	});

	it('"+" volta ao maximo — e no maximo o "+" esta apagado e nao regrava', () => {
		const b = montarBarra({ nivelDoSlot: 9 });
		b.seletor.abrir(0);
		clicar(balao(b.barra).querySelector('[data-nivel-passo="1"]'));
		expect(b.regravados).toEqual([{ i: 0, ID: FIRE_BOLT, nivel: 10 }]);
		const mais = balao(b.barra).querySelector('[data-nivel-passo="1"]');
		expect(mais.disabled).toBe(true);
		expect(balao(b.barra).querySelector('.ri-nivel-selo').textContent).toBe('máx');
		clicar(mais);
		expect(b.regravados).toHaveLength(1);
	});

	it('"Descrição" abre a descricao (o que o botao direito fazia) e fecha o balao', () => {
		const b = montarBarra();
		b.seletor.abrir(0);
		clicar(balao(b.barra).querySelector('[data-acao="descricao"]'));
		expect(b.descricoes).toEqual([FIRE_BOLT]);
		expect(balao(b.barra).classList.contains('show')).toBe(false);
		expect(b.seletor.aberto()).toBeNull();
	});

	it('o mousedown no balao nao chega a barra (que e o punho de arrastar)', () => {
		const b = montarBarra();
		const arrastou = vi.fn();
		b.barra.addEventListener('mousedown', arrastou);
		b.seletor.abrir(0);
		balao(b.barra).querySelector('[data-nivel-passo="-1"]').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
		expect(arrastou).not.toHaveBeenCalled();
	});
});

describe('fechar', () => {
	it('"Fechar" fecha', () => {
		const b = montarBarra();
		b.seletor.abrir(0);
		clicar(balao(b.barra).querySelector('[data-acao="fechar"]'));
		expect(balao(b.barra).classList.contains('show')).toBe(false);
	});

	it('tocar FORA fecha; tocar DENTRO nao', () => {
		const b = montarBarra();
		b.seletor.abrir(0);
		ponteiro('pointerdown', balao(b.barra).querySelector('.ri-nivel-valor'));
		expect(balao(b.barra).classList.contains('show')).toBe(true);
		ponteiro('pointerdown', b.fora);
		expect(balao(b.barra).classList.contains('show')).toBe(false);
	});

	it('o ESC (fecharSeletorDeNivel, que a pilha pergunta primeiro) fecha', () => {
		const b = montarBarra();
		b.seletor.abrir(0);
		expect(fecharSeletorDeNivel()).toBe(true);
		expect(balao(b.barra).classList.contains('show')).toBe(false);
		// Fechado, o ESC seguinte nao e consumido por ele.
		expect(fecharSeletorDeNivel()).toBe(false);
	});
});

describe('tocar e segurar (o celular)', () => {
	it(`segurar ${MS_PARA_SEGURAR} ms no slot de habilidade abre o seletor`, () => {
		vi.useFakeTimers();
		const b = montarBarra();
		ponteiro('pointerdown', b.barra.querySelector('[data-index="0"] .img'));
		vi.advanceTimersByTime(MS_PARA_SEGURAR - 1);
		expect(b.seletor.aberto()).toBeNull();
		vi.advanceTimersByTime(1);
		expect(b.seletor.aberto()).toBe(0);
	});

	it('soltar antes nao abre (o toque simples continua sem fazer nada)', () => {
		vi.useFakeTimers();
		const b = montarBarra();
		const img = b.barra.querySelector('[data-index="0"] .img');
		ponteiro('pointerdown', img);
		vi.advanceTimersByTime(200);
		ponteiro('pointerup', img);
		vi.advanceTimersByTime(MS_PARA_SEGURAR);
		expect(b.seletor.aberto()).toBeNull();
	});

	it(`deslizar mais de ${DESLIZE_QUE_CANCELA}px cancela (e rolar, nao segurar)`, () => {
		vi.useFakeTimers();
		const b = montarBarra();
		const img = b.barra.querySelector('[data-index="0"] .img');
		ponteiro('pointerdown', img, { x: 10, y: 10 });
		ponteiro('pointermove', img, { x: 10, y: 10 + DESLIZE_QUE_CANCELA + 1 });
		vi.advanceTimersByTime(MS_PARA_SEGURAR);
		expect(b.seletor.aberto()).toBeNull();
	});

	it('o MOUSE segurando nao abre: no desktop o gesto e o botao direito', () => {
		vi.useFakeTimers();
		const b = montarBarra();
		ponteiro('pointerdown', b.barra.querySelector('[data-index="0"] .img'), { pointerType: 'mouse' });
		vi.advanceTimersByTime(MS_PARA_SEGURAR * 2);
		expect(b.seletor.aberto()).toBeNull();
	});
});

/*
 * AS COSTURAS, pelo fonte. A peca pura pronta sem consumidor e a cicatriz mais
 * repetida deste projeto; estes portoes cobram que cada tela a CHAMA.
 */
describe('as costuras com as tres telas', () => {
	const shortcut = fs.readFileSync('src/UI/Components/ShortCut/ShortCut.js', 'utf8');
	const idleSkills = fs.readFileSync('src/UI/Components/IdleSkills/IdleSkills.js', 'utf8');
	const pilha = fs.readFileSync('src/UI/pilhaDeJanelas.js', 'utf8');
	const common = fs.readFileSync('src/UI/Common.css', 'utf8');

	it('a barra: o botao direito numa habilidade abre o seletor, e o segurar esta ligado', () => {
		const info = shortcut.slice(shortcut.indexOf('function onElementInfo('), shortcut.indexOf('function mostrarDescricaoDaHabilidade('));
		expect(info).toContain('_seletorDeNivel.abrir(index)');
		expect(shortcut).toContain('_seletorDeNivel.ligarSegurar(container);');
		// Regravar e o caminho de sempre do slot.
		expect(shortcut).toMatch(/regravar: \(indice, ID, nivel\) => \{\s*ShortCut\.addElement\(indice, true, ID, nivel\);\s*ShortCut\.onChange\(indice, true, ID, nivel\);/);
	});

	it('a barra: a dica da habilidade diz o nivel, e o balao fecha quando a barra sai', () => {
		expect(shortcut).toContain('isSkill ? dicaDaHabilidade(hotkey, ID, count)');
		expect(shortcut).toContain('fecharSeletorDeNivel();');
	});

	it('a janela de Habilidades: o payload da barra leva o nivel escolhido', () => {
		expect(idleSkills).toContain('selectedLevel: nivelParaABarra(IdleSkills.nivelParaBarra, skill)');
		expect(idleSkills).toContain('IdleSkills.nivelParaBarra = {};');
	});

	it('a pilha pergunta pelo seletor DEPOIS do "algo na mao" e ANTES das janelas', () => {
		const escapar = pilha.slice(pilha.indexOf('export function aoEscapar('));
		const mao = escapar.indexOf('desarmarAtalhoPendente()');
		const seletor = escapar.indexOf('fecharSeletorDeNivel()');
		const janelas = escapar.indexOf('temAberta()');
		expect(mao).toBeGreaterThan(-1);
		expect(seletor).toBeGreaterThan(mao);
		expect(janelas).toBeGreaterThan(seletor);
	});

	it('o botao do seletor vira 44x44 no dedo (o piso tatil da casa)', () => {
		const coarse = common.slice(common.indexOf('.ri-nivel-selo {'));
		expect(coarse).toMatch(/@media \(pointer: coarse\) \{\s*\.ri-nivel-btn \{\s*width: var\(--hit-touch, 44px\);\s*height: var\(--hit-touch, 44px\);/);
	});
});
