/**
 * O CODEX AO VIVO (D-1986, relato dos jogadores de 05/10/2026).
 *
 * *"Nao contabiliza no codex (mesmo matando, o numero fica igual), so atualiza
 * e contabiliza quando desloga e loga novamente."*
 *
 * O modulo `codexAoVivo.js` e puro e e testado de verdade; as LIGACOES em
 * `CodexIdle.js` (janela com Shadow DOM, Network e UIManager) sao cobradas
 * pelo fonte sem comentario, como em `codexPorEspecieEResgate.test.js`.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
	VERSAO_DO_PARCIAL_DO_CODEX,
	aplicarParcialDoCodex,
	ehParcialDoCodex,
	juntarPaginaDoCapitulo,
	pedidoDeAbertura,
	pedidoDeFechamento,
	precisaPedirCapitulo
} from 'UI/Components/CodexIdle/codexAoVivo.js';
import { retratoDoCodexAceito } from 'UI/Components/CodexIdle/eixosDoCodex.js';

function semComentarios(texto) {
	return texto.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
}
const CODEX = semComentarios(readFileSync('src/UI/Components/CodexIdle/CodexIdle.js', 'utf8').replace(/\r\n/g, '\n'));

/** Um retrato inteiro pequeno, no formato do fio. */
function retrato() {
	return {
		v: 2,
		pontos: { disponiveis: 3 },
		desafios: { diario: { abates: 10 }, semanal: { abates: 10 } },
		missoes: [
			{ id: 'codex-poring', abates: 3, alvo: 100 },
			{ id: 'codex-lobo', abates: 0, alvo: 50 }
		],
		jornada: {
			capitulos: [
				{ id: 'cap-01', concluidas: 0, total: 3 },
				{ id: 'cap-02', concluidas: 0, total: 2 }
			],
			missoes: []
		}
	};
}

describe('o parcial e outra versao, e o cliente antigo o descarta', () => {
	it('v3 e parcial; v2 e o retrato inteiro', () => {
		expect(VERSAO_DO_PARCIAL_DO_CODEX).toBe(3);
		expect(ehParcialDoCodex({ v: 3 })).toBe(true);
		expect(ehParcialDoCodex({ v: 2 })).toBe(false);
		expect(ehParcialDoCodex(null)).toBe(false);
		// A guarda do retrato inteiro RECUSA o parcial: e o que protege quem nao
		// sabe aplica-lo.
		expect(retratoDoCodexAceito({ v: 3 })).toBe(false);
	});

	it('os dois pedidos: abrir pede ao vivo, fechar desliga', () => {
		expect(pedidoDeAbertura()).toEqual({ acao: 'pedir', aberta: true });
		expect(pedidoDeFechamento()).toEqual({ acao: 'fechar' });
	});
});

describe('aplicar o parcial', () => {
	it('troca so a entrada que veio, e os desafios; o resto fica', () => {
		const antes = retrato();
		const r = aplicarParcialDoCodex(
			antes,
			{ v: 3, missoes: [{ id: 'codex-poring', abates: 7, alvo: 100 }], desafios: { diario: { abates: 14 }, semanal: { abates: 14 } } },
			{}
		);
		expect(r.estado.missoes).toEqual([
			{ id: 'codex-poring', abates: 7, alvo: 100 },
			{ id: 'codex-lobo', abates: 0, alvo: 50 }
		]);
		expect(r.estado.desafios.diario.abates).toBe(14);
		expect(r.estado.pontos).toBe(antes.pontos);
		// O retrato de antes nao foi tocado.
		expect(antes.missoes[0].abates).toBe(3);
		expect(antes.desafios.diario.abates).toBe(10);
	});

	it('sem desafios no parcial, os desafios ficam', () => {
		const antes = retrato();
		const r = aplicarParcialDoCodex(antes, { v: 3, missoes: [] }, {});
		expect(r.estado.desafios).toBe(antes.desafios);
	});

	it('a Jornada: o capitulo troca, e a missao so no capitulo que a janela ja tem', () => {
		const antes = retrato();
		const indice = { 'cap-01': [{ id: 'j-a', capitulo: 'cap-01', abates: 1 }, { id: 'j-b', capitulo: 'cap-01', abates: 0 }] };
		const r = aplicarParcialDoCodex(
			antes,
			{
				v: 3,
				missoes: [],
				jornada: {
					capitulos: [{ id: 'cap-01', concluidas: 1, total: 3 }],
					missoes: [
						{ id: 'j-a', capitulo: 'cap-01', abates: 4 },
						{ id: 'j-z', capitulo: 'cap-02', abates: 9 }
					]
				}
			},
			indice
		);
		expect(r.estado.jornada.capitulos[0]).toEqual({ id: 'cap-01', concluidas: 1, total: 3 });
		expect(r.estado.jornada.capitulos[1]).toBe(antes.jornada.capitulos[1]);
		expect(r.missoesPorCapitulo['cap-01']).toEqual([
			{ id: 'j-a', capitulo: 'cap-01', abates: 4 },
			{ id: 'j-b', capitulo: 'cap-01', abates: 0 }
		]);
		// O capitulo que a janela NAO tem nao nasce meio carregado no indice.
		expect(Object.prototype.hasOwnProperty.call(r.missoesPorCapitulo, 'cap-02')).toBe(false);
		// O indice de antes nao foi tocado.
		expect(indice['cap-01'][0].abates).toBe(1);
	});

	it('sem retrato ainda, ou com um corpo que nao e parcial, nada muda', () => {
		const indice = {};
		expect(aplicarParcialDoCodex(null, { v: 3, missoes: [] }, indice)).toEqual({ estado: null, missoesPorCapitulo: indice });
		const antes = retrato();
		expect(aplicarParcialDoCodex(antes, { v: 2, missoes: [] }, indice).estado).toBe(antes);
	});
});

describe('quando repedir um capitulo', () => {
	it('abrir (forcar) repede o que ja esta guardado; a varredura so pede o que falta', () => {
		const guardado = { 'cap-01': [] };
		expect(precisaPedirCapitulo('cap-01', guardado, true)).toBe(true);
		expect(precisaPedirCapitulo('cap-01', guardado, false)).toBe(false);
		expect(precisaPedirCapitulo('cap-02', guardado, false)).toBe(true);
		expect(precisaPedirCapitulo('', guardado, true)).toBe(false);
		expect(precisaPedirCapitulo(null, guardado, true)).toBe(false);
	});
});

describe('as paginas de um capitulo pesado se somam', () => {
	const a = { id: 'a', abates: 1 };
	const b = { id: 'b', abates: 2 };
	const c = { id: 'c', abates: 3 };
	it('a primeira pagina (ou sem parte) recomeca a lista', () => {
		expect(juntarPaginaDoCapitulo([a, b], [c], 1)).toEqual([c]);
		expect(juntarPaginaDoCapitulo([a, b], [c], undefined)).toEqual([c]);
	});
	it('a segunda soma a primeira, e a repetida troca de lugar', () => {
		expect(juntarPaginaDoCapitulo([a, b], [c], 2)).toEqual([a, b, c]);
		const b2 = { id: 'b', abates: 9 };
		expect(juntarPaginaDoCapitulo([a, b], [b2, c], 2)).toEqual([a, b2, c]);
	});
	it('a segunda pagina sem a primeira guardada vira a lista', () => {
		expect(juntarPaginaDoCapitulo(undefined, [c], 2)).toEqual([c]);
	});
	it('a lista de antes nao e mutada', () => {
		const antes = [a];
		juntarPaginaDoCapitulo(antes, [c], 2);
		expect(antes).toEqual([a]);
	});
	it('CodexIdle junta as paginas pela parte do corpo', () => {
		expect(CODEX).toContain('juntarPaginaDoCapitulo(CodexIdle.missoesPorCapitulo[id], porCapitulo[id], dados.parte)');
	});
});

describe('as ligacoes em CodexIdle.js', () => {
	it('controle positivo: o aparelho le o arquivo', () => {
		expect(CODEX).toContain('function onCodexRecebido');
	});

	it('abrir esvazia o cache de capitulos e pede AO VIVO', () => {
		const i = CODEX.indexOf("win.classList.add('is-open');");
		expect(i).toBeGreaterThan(-1);
		const bloco = CODEX.slice(i, i + 400);
		expect(bloco).toContain('CodexIdle.missoesPorCapitulo = {};');
		expect(bloco).toContain('enviarAcao(pedidoDeAbertura());');
		expect(CODEX).not.toContain("enviarAcao({ acao: 'pedir' });");
	});

	it('fechar avisa o servidor, so se estava aberta', () => {
		const i = CODEX.indexOf('function closeWindow()');
		const bloco = CODEX.slice(i, i + 400);
		expect(bloco).toMatch(/if \(win\.classList\.contains\('is-open'\)\) \{\s*enviarAcao\(pedidoDeFechamento\(\)\);/);
	});

	it('abrir o capitulo e voltar a aba repedem (forcar); a varredura nao', () => {
		expect(CODEX).toContain('pedirCapitulo(CodexIdle.capituloAberto, true);');
		const abrir = CODEX.slice(CODEX.indexOf('function abrirCapitulo('), CODEX.indexOf('function abrirCapitulo(') + 300);
		expect(abrir).toContain('pedirCapitulo(id, true);');
		expect(CODEX).toContain('pedirCapitulo(_filaDaVarredura[0]);');
		expect(CODEX).toContain('precisaPedirCapitulo(id, CodexIdle.missoesPorCapitulo, forcar)');
	});

	it('o parcial nao redesenha debaixo do dedo: com o corpo apertado, o desenho espera o soltar', () => {
		const i = CODEX.indexOf('if (ehParcialDoCodex(dados))');
		const bloco = CODEX.slice(i, i + 500);
		expect(bloco).toMatch(/if \(_apertadoNoCorpo\) \{\s*_desenhoAdiado = true;\s*\} else \{\s*render\(\);/);
		expect(CODEX).toMatch(/corpo\.addEventListener\('pointerdown', \(\) => \{\s*_apertadoNoCorpo = true;/);
		expect(CODEX).toContain("window.addEventListener('pointerup', soltar, true);");
		expect(CODEX).toMatch(/if \(_desenhoAdiado\) \{\s*_desenhoAdiado = false;\s*setTimeout\(render, 0\);/);
	});

	it('o parcial e aplicado ANTES da guarda de versao do inteiro', () => {
		const i = CODEX.indexOf('function onCodexRecebido');
		const bloco = CODEX.slice(i, i + 900);
		const parcial = bloco.indexOf('if (ehParcialDoCodex(dados))');
		const guarda = bloco.indexOf('if (!retratoDoCodexAceito(dados))');
		expect(parcial).toBeGreaterThan(-1);
		expect(guarda).toBeGreaterThan(parcial);
		expect(bloco).toContain('aplicarParcialDoCodex(CodexIdle.estado, dados, CodexIdle.missoesPorCapitulo)');
		expect(bloco).toContain('CodexIdle.missoesPorCapitulo = r.missoesPorCapitulo;');
	});
});
