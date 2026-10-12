/**
 * O RASTREADOR DO CODEX (D-1839, 29/09/2026).
 *
 * Pedido do dono: *"Colocar pra poder marcar o codex e aparecer um contador na
 * tela, ao invés de ter que ficar abrindo o codex pra ver a quantidade que
 * matou"*.
 *
 * Duas metades, como em `codexPorEspecieEResgate.test.js`:
 *
 *  - os módulos PUROS (`rastreadorDoCodex.js` e `marcacaoDoCodex.js`) são
 *    testados de verdade, desenhando o HTML num `<ul>` do jsdom;
 *  - as LIGAÇÕES nas janelas (quem anota, quem desenha, quem manda o verbo)
 *    são portões de fonte, porque subir `CodexIdle.js` num vitest sobe meia
 *    interface. Quem mede o NÚMERO é o servidor
 *    (`servidor/codex-marcadas.test.ts` e o fio em
 *    `servidor/mapa/log-de-progresso-no-fio.test.ts`).
 *
 * @vitest-environment jsdom
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
	anotarRastreadorDoCodex,
	ehCorpoParcialDoRastreador,
	limparRastreadorDoCodex,
	numeroDoRastreador,
	rastreadorDoCodexAtual,
	rastreadorDoCodexHtml
} from '../../src/UI/Components/rastreadorDoCodex.js';
import {
	entradaOcultavel,
	entradasVisiveis,
	estrelaDoCodexHtml,
	faixaDeMarcacaoHtml,
	marcadasDoRetrato,
	pedidoDaEstrela
} from '../../src/UI/Components/CodexIdle/marcacaoDoCodex.js';

const semComentarios = src => src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
const CODEX = semComentarios(readFileSync('src/UI/Components/CodexIdle/CodexIdle.js', 'utf8'));
const TRACKER = semComentarios(readFileSync('src/UI/Components/MissoesTrackerIdle/MissoesTrackerIdle.js', 'utf8'));
const TRACKER_HTML = readFileSync('src/UI/Components/MissoesTrackerIdle/MissoesTrackerIdle.html', 'utf8');
const TRACKER_CSS = readFileSync('src/UI/Components/MissoesTrackerIdle/MissoesTrackerIdle.css', 'utf8').replace(/\r\n/g, '\n');
const MISSOES = semComentarios(readFileSync('src/UI/Components/MissoesIdle/MissoesIdle.js', 'utf8'));
const COMMON = readFileSync('src/UI/Common.css', 'utf8').replace(/\r\n/g, '\n');

const LINHAS = [
	{
		id: 'codex-lobo',
		titulo: 'Lobo',
		abates: 120,
		alvo: 1500,
		cumprida: false,
		aResgatar: false,
		especies: [{ mobId: 1013, monstro: 'Lobo', abates: 120, alvo: 1500 }]
	},
	{
		id: 'codex-barulhentos',
		titulo: 'Bichos <Barulhentos>',
		abates: 1000,
		alvo: 1000,
		cumprida: true,
		aResgatar: true,
		especies: [
			{ mobId: 1055, monstro: 'Muka', abates: 333, alvo: 333 },
			{ mobId: 1019, monstro: 'PecoPeco', abates: 667, alvo: 667 }
		]
	}
];

function desenhar(linhas) {
	const ul = document.createElement('ul');
	ul.innerHTML = rastreadorDoCodexHtml(linhas);
	return ul;
}

describe('o estado do rastreador (um fato só, como a bolinha do Codex)', () => {
	it('anota a lista do servidor, e lixo vira vazio', () => {
		anotarRastreadorDoCodex(LINHAS);
		expect(rastreadorDoCodexAtual()).toHaveLength(2);
		anotarRastreadorDoCodex(undefined);
		expect(rastreadorDoCodexAtual()).toEqual([]);
		anotarRastreadorDoCodex([null, { sem: 'id' }, LINHAS[0]]);
		expect(rastreadorDoCodexAtual().map(l => l.id)).toEqual(['codex-lobo']);
	});

	it('trocar de personagem esquece', () => {
		anotarRastreadorDoCodex(LINHAS);
		limparRastreadorDoCodex();
		expect(rastreadorDoCodexAtual()).toEqual([]);
	});
});

describe('o desenho do rastreador', () => {
	it('uma linha por entrada, com o contador e o ponto de milhar', () => {
		const ul = desenhar(LINHAS);
		const itens = ul.querySelectorAll('.mt-cx-item');
		expect(itens).toHaveLength(2);
		expect(itens[0].querySelector('.mt-cx-nome').textContent).toBe('Lobo');
		expect(itens[0].querySelector('.mt-cx-conta').textContent).toBe('120/1.500');
		expect(itens[0].dataset.acao).toBe('codex-abrir');
		expect(itens[0].dataset.entrada).toBe('codex-lobo');
		expect(numeroDoRastreador(35000)).toBe('35.000');
	});

	it('a barra acompanha a fração, com teto de 100%', () => {
		const ul = desenhar([{ ...LINHAS[0], abates: 750, alvo: 1500 }, { ...LINHAS[0], id: 'x', abates: 9, alvo: 3 }]);
		const fills = ul.querySelectorAll('.mt-cx-fill');
		expect(fills[0].style.width).toBe('50%');
		expect(fills[1].style.width).toBe('100%');
	});

	it('a cumprida com prêmio pendente diz "Resgatar!" no lugar do número', () => {
		const ul = desenhar(LINHAS);
		const segunda = ul.querySelectorAll('.mt-cx-item')[1];
		expect(segunda.classList.contains('is-resgatar')).toBe(true);
		expect(segunda.querySelector('.mt-cx-conta').textContent).toBe('Resgatar!');
		// CONTROLE: a que não está a resgatar mostra o número.
		expect(ul.querySelectorAll('.mt-cx-item')[0].classList.contains('is-resgatar')).toBe(false);
	});

	it('o detalhe por espécie vai no title, e o texto do servidor é escapado', () => {
		const ul = desenhar(LINHAS);
		const segunda = ul.querySelectorAll('.mt-cx-item')[1];
		expect(segunda.title).toBe('Muka 333/333 · PecoPeco 667/667');
		expect(segunda.querySelector('.mt-cx-nome').textContent).toBe('Bichos <Barulhentos>');
		expect(ul.innerHTML).not.toContain('<Barulhentos>');
	});

	it('nada marcado: a dica de como marcar', () => {
		const ul = desenhar([]);
		expect(ul.querySelectorAll('.mt-cx-item')).toHaveLength(0);
		expect(ul.textContent).toContain('Marque até 5');
	});
});

describe('a estrela e a faixa da janela do Codex', () => {
	it('a estrela diz o estado para quem vê e para quem lê a tela', () => {
		const div = document.createElement('div');
		div.innerHTML = estrelaDoCodexHtml('codex-lobo', true) + estrelaDoCodexHtml('codex-poring', false);
		const [cheia, vazia] = div.querySelectorAll('.cx-marcar');
		expect(cheia.dataset.marcar).toBe('codex-lobo');
		expect(cheia.getAttribute('aria-pressed')).toBe('true');
		expect(cheia.classList.contains('is-marcada')).toBe(true);
		expect(cheia.textContent).toBe('★');
		expect(vazia.getAttribute('aria-pressed')).toBe('false');
		expect(vazia.textContent).toBe('☆');
		expect(cheia.tagName).toBe('BUTTON');
	});

	it('a faixa conta as marcadas e mostra a recusa só quando o retrato a traz', () => {
		const div = document.createElement('div');
		div.innerHTML = faixaDeMarcacaoHtml({ marcadas: ['a', 'b'], maximoDeMarcadas: 5 });
		expect(div.querySelector('.cx-marcacao-conta').textContent).toContain('2 de 5');
		expect(div.querySelector('.cx-marcacao-aviso')).toBeNull();
		div.innerHTML = faixaDeMarcacaoHtml({
			marcadas: ['a', 'b', 'c', 'd', 'e'],
			maximoDeMarcadas: 5,
			avisoDeMarcacao: 'Você já acompanha 5 entradas do Codex. Desmarque uma para marcar outra.'
		});
		expect(div.querySelector('.cx-marcacao-aviso').textContent).toContain('Desmarque uma');
	});

	it('retrato de servidor antigo (sem o campo) = nada marcado', () => {
		expect(marcadasDoRetrato({})).toEqual([]);
		expect(marcadasDoRetrato(null)).toEqual([]);
	});
});

describe('as ligações nas janelas (portões de fonte)', () => {
	it('MissoesIdle anota o rastreador do pacote de missões e o esquece na troca de personagem', () => {
		expect(MISSOES).toContain('anotarRastreadorDoCodex(dados.codexRastreado)');
		expect(MISSOES).toContain('limparRastreadorDoCodex()');
	});

	it('a janela do Codex manda o verbo `marcar`, e a estrela vem ANTES dos outros ganchos de clique', () => {
		// O verbo `marcar` sai por `pedidoDaEstrela` desde D-1853 (com o estado desejado).
		expect(CODEX).toContain('enviarAcao(pedidoDaEstrela(id,');
		const estrela = CODEX.indexOf("closest('.cx-marcar')");
		expect(estrela).toBeGreaterThan(0);
		expect(estrela).toBeLessThan(CODEX.indexOf('cliqueDeMissoesGerais(e, alvo'));
		expect(CODEX).toContain('estrelaDoCodexHtml(m.id, marcadas.has(m.id))');
		expect(CODEX).toContain('faixaDeMarcacaoHtml(estado)');
	});

	it('o cartão desenha o rastreador e a linha abre o Codex na entrada', () => {
		expect(TRACKER).toContain('rastreadorDoCodexHtml(codex)');
		expect(TRACKER).toContain("acao === 'codex-abrir'");
		expect(TRACKER).toContain('CodexIdle.abrirNaEntrada(btn.dataset.entrada');
		expect(CODEX).toContain('CodexIdle.abrirNaEntrada = function');
		// A assinatura do redesenho inclui o rastreador: sem isto o contador
		// andaria no módulo e a tela ficaria parada.
		expect(TRACKER).toMatch(/const assinatura = JSON\.stringify\(\[execucao, [^\n]*codex\]\)/);
	});

	it('no celular em pé a aba "Codex" troca o corpo do cartão (o cartão não cresce)', () => {
		expect(TRACKER_HTML).toContain('data-aba="codex"');
		expect(TRACKER_CSS).toMatch(/\.ri-vertical \.mt-painel\[data-aba='codex'\] \.mt-lista \{\s*display: none;/);
		expect(TRACKER_CSS).toMatch(/\.ri-vertical \.mt-painel\[data-aba='missoes'\] \.mt-codex \{\s*display: none;/);
		// O teto do corpo de D-1483 continua lá.
		expect(TRACKER_CSS).toContain('max-height: 22dvh;');
	});

	it('os dois alvos novos têm o piso tátil no bloco coarse do Common.css', () => {
		const coarse = COMMON.slice(COMMON.indexOf('@media (pointer: coarse)'));
		expect(coarse).toMatch(/\.mt-cx-item,\s*\.cx-marcar \{\s*box-sizing: border-box;\s*min-height: var\(--hit-touch, 44px\);/);
		expect(coarse).toMatch(/\.cx-marcar \{\s*min-width: var\(--hit-touch, 44px\);/);
	});
});

describe('o corpo PARCIAL do rastreador (D-1853): o contador anda sem a lista de missões', () => {
	it('reconhece só `{v: 2, parcial: "codexRastreado"}`; o corpo inteiro (v 1) e lixo não', () => {
		expect(ehCorpoParcialDoRastreador({ v: 2, parcial: 'codexRastreado', codexRastreado: [] })).toBe(true);
		expect(ehCorpoParcialDoRastreador({ v: 1, missoes: [], codexRastreado: [] })).toBe(false);
		expect(ehCorpoParcialDoRastreador({ v: 2 })).toBe(false);
		expect(ehCorpoParcialDoRastreador(null)).toBe(false);
	});

	it('a janela trata o parcial ANTES do `v !== 1` e sai sem trocar a lista nem desenhar', () => {
		const inicio = MISSOES.indexOf('function onMissoesRecebidas');
		expect(inicio).toBeGreaterThan(0);
		const corpo = MISSOES.slice(inicio, MISSOES.indexOf('Network.hookPacket', inicio));
		const parcial = corpo.indexOf('if (ehCorpoParcialDoRastreador(dados))');
		expect(parcial).toBeGreaterThan(0);
		expect(parcial).toBeLessThan(corpo.indexOf('dados.v !== 1'));
		// O ramo do parcial: anota e retorna, sem `MissoesIdle.missoes =` nem `render()`.
		const ramo = corpo.slice(parcial, corpo.indexOf('}', parcial) + 1);
		expect(ramo).toContain('anotarRastreadorDoCodex(dados.codexRastreado)');
		expect(ramo).toContain('return');
		expect(ramo).not.toContain('render(');
		expect(ramo).not.toContain('MissoesIdle.missoes');
	});
});

describe('"Ocultar concluídas" não esconde a entrada com prêmio a resgatar (D-1853)', () => {
	const aberta = { id: 'aberta', cumprida: false, aResgatar: false };
	const aResgatar = { id: 'premio', cumprida: true, aResgatar: true };
	const paga = { id: 'paga', cumprida: true, aResgatar: false };

	it('esconde só a encerrada; a do "Resgatar!" fica', () => {
		expect(entradasVisiveis([aberta, aResgatar, paga], true, null).map(m => m.id)).toEqual(['aberta', 'premio']);
		// CONTROLE: com o interruptor desligado, nada some.
		expect(entradasVisiveis([aberta, aResgatar, paga], false, null)).toHaveLength(3);
	});

	it('a entrada pedida pelo rastreador nunca some, nem encerrada', () => {
		expect(entradaOcultavel(paga, 'paga')).toBe(false);
		expect(entradaOcultavel(paga, 'outra')).toBe(true);
		expect(entradasVisiveis([paga], true, 'paga').map(m => m.id)).toEqual(['paga']);
	});

	it('a janela usa o recorte do módulo (e não o filtro antigo por `cumprida`)', () => {
		expect(CODEX).toContain('entradasVisiveis(todas, ocultar, _entradaRealcada)');
		expect(CODEX).not.toContain('todas.filter(m => !m.cumprida)');
	});
});

describe('a estrela pede o estado que vai assumir (D-1853)', () => {
	it('apagada pede `marcada: true`; acesa pede `marcada: false`', () => {
		expect(pedidoDaEstrela('codex-x', false)).toEqual({ acao: 'marcar', id: 'codex-x', marcada: true });
		expect(pedidoDaEstrela('codex-x', true)).toEqual({ acao: 'marcar', id: 'codex-x', marcada: false });
	});

	it('o clique lê o `aria-pressed` da própria estrela, que o retrato desenha', () => {
		expect(CODEX).toContain("enviarAcao(pedidoDaEstrela(id, estrela.getAttribute('aria-pressed') === 'true'))");
		expect(CODEX).not.toContain("enviarAcao({ acao: 'marcar', id: id })");
		const ul = document.createElement('div');
		ul.innerHTML = estrelaDoCodexHtml('codex-x', true);
		expect(ul.querySelector('.cx-marcar').getAttribute('aria-pressed')).toBe('true');
	});
});
