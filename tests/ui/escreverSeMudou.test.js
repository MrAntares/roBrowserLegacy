import { describe, expect, it } from 'vitest';
import { escreverEstilo, escreverTexto, escreverTitulo, urlComoOLido } from 'UI/escreverSeMudou.js';
import { contarEscritasDeEstilo } from './contarEscritasDeEstilo.js';

const escritasDeEstilo = contarEscritasDeEstilo(['width', 'opacity', 'display', 'color']);

/*
 * ESCREVER NO DOM SO O QUE MUDOU (D-2374, `UI/escreverSeMudou.js`).
 *
 * Duas coisas a provar:
 *  1. EXATIDAO: depois de qualquer sequencia de escritas, o elemento fica
 *     IGUAL (HTML, estilo, titulo) ao de quem escreveu sempre, sem pular nada.
 *     O oraculo e o caminho antigo (`el.textContent = v`, `el.style.x = v`).
 *  2. ECONOMIA, CONTADA: a escrita repetida nao gera mutacao nenhuma no DOM
 *     (o que um `MutationObserver` ve). Antes (a3ebe0fe): cada `textContent`
 *     igual = 1 registro de mutacao (o no de texto trocado). Depois: 0.
 */

/** Esvazia a fila de registros de um observador e devolve quantos havia. */
function registros(observador) {
	return observador.takeRecords().length;
}

function vigiar(el) {
	const o = new MutationObserver(() => {});
	o.observe(el, { childList: true, subtree: true, characterData: true, attributes: true });
	return o;
}

describe('escreverTexto', () => {
	it('o mesmo texto de novo: zero mutacoes (antes: uma por escrita)', () => {
		const el = document.createElement('span');
		escreverTexto(el, 42);
		const o = vigiar(el);
		for (let i = 0; i < 5; ++i) {
			escreverTexto(el, 42);
		}
		expect(registros(o)).toBe(0);
		// CONTROLE: o caminho antigo, no mesmo elemento, gera mutacao a cada escrita.
		for (let i = 0; i < 5; ++i) {
			el.textContent = 42;
		}
		expect(registros(o)).toBe(5);
	});

	it('texto diferente escreve', () => {
		const el = document.createElement('span');
		escreverTexto(el, 'a');
		expect(escreverTexto(el, 'b')).toBe(true);
		expect(el.textContent).toBe('b');
	});

	it('numero e o texto dele sao o mesmo valor (42 e "42")', () => {
		const el = document.createElement('span');
		escreverTexto(el, 42);
		expect(escreverTexto(el, '42')).toBe(false);
	});

	it('elemento com filhos ELEMENTO de mesmo texto concatenado e reescrito (vira um texto so, como antes)', () => {
		const el = document.createElement('span');
		el.innerHTML = '<b>4</b>2';
		expect(escreverTexto(el, '42')).toBe(true);
		expect(el.innerHTML).toBe('42');
	});

	it('dois nos de texto que somam o valor tambem sao reescritos', () => {
		const el = document.createElement('span');
		el.appendChild(document.createTextNode('4'));
		el.appendChild(document.createTextNode('2'));
		expect(escreverTexto(el, '42')).toBe(true);
		expect(el.childNodes.length).toBe(1);
	});

	it('texto vazio: sem filhos pula; com filho escreve', () => {
		const vazio = document.createElement('span');
		expect(escreverTexto(vazio, '')).toBe(false);
		expect(escreverTexto(vazio, null)).toBe(false);
		expect(escreverTexto(vazio, undefined)).toBe(false);
		const cheio = document.createElement('span');
		cheio.textContent = 'x';
		expect(escreverTexto(cheio, '')).toBe(true);
		expect(cheio.textContent).toBe('');
	});

	it('o primeiro filho e o texto certo mas ha OUTRO depois: reescrito (vira um texto so)', () => {
		const el = document.createElement('span');
		el.appendChild(document.createTextNode('42'));
		el.appendChild(document.createElement('i'));
		expect(escreverTexto(el, '42')).toBe(true);
		expect(el.innerHTML).toBe('42');
	});

	it('um no que nao e texto (comentario) com o mesmo conteudo e reescrito', () => {
		const el = document.createElement('span');
		el.appendChild(document.createComment('42'));
		expect(escreverTexto(el, '42')).toBe(true);
		expect(el.innerHTML).toBe('42');
	});

	it('sem elemento nao faz nada', () => {
		expect(escreverTexto(null, 1)).toBe(false);
	});
});

describe('escreverEstilo e escreverTitulo', () => {
	it('o mesmo estilo de novo: zero atribuicoes (antes: uma por escrita)', () => {
		const el = document.createElement('div');
		escreverEstilo(el, 'width', '50px');
		escreverEstilo(el, 'opacity', 1);
		const antes = escritasDeEstilo.n;
		const o = vigiar(el);
		expect(escreverEstilo(el, 'width', '50px')).toBe(false);
		expect(escreverEstilo(el, 'opacity', 1)).toBe(false);
		expect(escritasDeEstilo.n - antes).toBe(0);
		expect(registros(o)).toBe(0);
	});

	it('estilo diferente escreve', () => {
		const el = document.createElement('div');
		escreverEstilo(el, 'width', '50px');
		expect(escreverEstilo(el, 'width', '60px')).toBe(true);
		expect(el.style.width).toBe('60px');
	});

	it('a forma normalizada que o navegador devolve tambem conta como igual', () => {
		const el = document.createElement('div');
		// Simula o que o Chrome faz: escreve `url(x)` e le `url("x")`.
		Object.defineProperty(el, 'style', { value: { backgroundImage: 'url("blob:abc")' } });
		expect(escreverEstilo(el, 'backgroundImage', 'url(blob:abc)', urlComoOLido('blob:abc'))).toBe(false);
		expect(escreverEstilo(el, 'backgroundImage', 'url(blob:xyz)', urlComoOLido('blob:xyz'))).toBe(true);
		expect(el.style.backgroundImage).toBe('url(blob:xyz)');
	});

	it('urlComoOLido recusa endereco que o navegador escaparia', () => {
		expect(urlComoOLido('blob:abc')).toBe('url("blob:abc")');
		expect(urlComoOLido('a"b')).toBeUndefined();
		expect(urlComoOLido('a\\b')).toBeUndefined();
		expect(urlComoOLido('a\nb')).toBeUndefined();
		expect(urlComoOLido('a\rb')).toBeUndefined();
	});

	it('o mesmo titulo de novo: zero mutacoes; outro titulo escreve', () => {
		const el = document.createElement('div');
		escreverTitulo(el, '12.5%');
		const o = vigiar(el);
		escreverTitulo(el, '12.5%');
		expect(registros(o)).toBe(0);
		expect(escreverTitulo(el, '13.0%')).toBe(true);
		expect(el.title).toBe('13.0%');
	});

	it('sem elemento nao faz nada', () => {
		expect(escreverEstilo(null, 'width', '1px')).toBe(false);
		expect(escreverTitulo(undefined, 'x')).toBe(false);
	});
});

describe('ORACULO: qualquer sequencia termina igual ao caminho antigo', () => {
	/*
	 * Gerador semeado (sem Math.random: a falha tem de se repetir). Cada passo
	 * escolhe uma escrita de um conjunto pequeno de valores — pequeno de
	 * proposito, para repetir muito, que e o caso que o ajudante pula.
	 */
	function semeado(semente) {
		let s = semente >>> 0;
		return () => {
			s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
			return s / 4294967296;
		};
	}

	it('1000 passos, tres elementos, texto/estilo/titulo', () => {
		const sorte = semeado(2374);
		const VALORES = [0, 1, 42, '42', '', null, '12.5%', 'abc'];
		const ESTILOS = [
			['width', '50px'],
			['width', '60px'],
			['opacity', 1],
			['opacity', 0],
			['display', ''],
			['display', 'none'],
			['color', 'red'],
			['color', '']
		];
		const novos = [0, 1, 2].map(() => document.createElement('div'));
		const antigos = [0, 1, 2].map(() => document.createElement('div'));
		for (let passo = 0; passo < 1000; ++passo) {
			const i = Math.floor(sorte() * 3);
			const tipo = sorte();
			if (tipo < 0.5) {
				const v = VALORES[Math.floor(sorte() * VALORES.length)];
				escreverTexto(novos[i], v);
				antigos[i].textContent = v;
			} else if (tipo < 0.85) {
				const [prop, v] = ESTILOS[Math.floor(sorte() * ESTILOS.length)];
				escreverEstilo(novos[i], prop, v);
				antigos[i].style[prop] = v;
			} else {
				const v = VALORES[Math.floor(sorte() * VALORES.length)];
				escreverTitulo(novos[i], v);
				antigos[i].title = v;
			}
			expect(novos[i].outerHTML).toBe(antigos[i].outerHTML);
		}
	});
});
