/**
 * A ABA EM QUE O JOGADOR ESTAVA (D-797, 31/08/2026).
 *
 * "Configuração do Idle -> Usuário fechou em Alvos, volta para Alvos ao
 * reabri-la." O pedido parece pequeno e não é: cada janela nossa guardava a aba
 * numa variável de módulo, e variável de módulo morre no F5 e é zerada na troca
 * de personagem — as duas coisas que mais acontecem neste jogo.
 *
 * São quatro perguntas aqui, e a terceira é a que importa daqui a um mês:
 *
 * 1. `abaLembrada`/`lembrarAba` fazem o que dizem (inclusive recusar uma aba
 *    que não existe mais);
 * 2. a volta é REAL — grava, "recarrega a página", e a aba está lá, com a
 *    posição da janela intacta;
 * 3. O PORTÃO: toda janela RAGIDLE com abas passa por `memoriaDeAba.js`. É o que
 *    impede a janela OITO de nascer esquecida, que é exatamente como as sete
 *    nasceram;
 * 4. a Mochila não volta mais a `_abaAtiva = null` na troca de personagem — o
 *    buraco que abria a grade VAZIA.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Preferences from 'Core/Preferences.js';
import { abaLembrada, lembrarAba } from 'UI/Components/memoriaDeAba.js';

const NL = String.fromCharCode(10);
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const COMPONENTES = path.join(RAIZ, 'src', 'UI', 'Components');

/**
 * Tira comentário do fonte ANTES de medir — a mesma razão registrada em
 * `estadoEntrePersonagensEMapas.test.js`: sem isto, todo caso que lê o fonte
 * mede a PROSA, e a prosa aqui cita todos os nomes que os casos procuram.
 */
function semComentarios(fonte) {
	let saida = '';
	let i = 0;
	while (i < fonte.length) {
		const dois = fonte.slice(i, i + 2);
		if (dois === '/*') {
			const fim = fonte.indexOf('*/', i + 2);
			i = fim === -1 ? fonte.length : fim + 2;
			continue;
		}
		if (dois === '//') {
			const fim = fonte.indexOf(NL, i);
			i = fim === -1 ? fonte.length : fim;
			continue;
		}
		saida += fonte[i];
		i++;
	}
	return saida;
}

/** Todo `.js` de `src/UI/Components`, com o caminho relativo para a mensagem. */
function todosOsFontes(dir = COMPONENTES, prefixo = '') {
	const saida = [];
	for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
		const rel = prefixo ? prefixo + '/' + entrada.name : entrada.name;
		if (entrada.isDirectory()) {
			saida.push(...todosOsFontes(path.join(dir, entrada.name), rel));
		} else if (entrada.name.endsWith('.js')) {
			saida.push({ rel, codigo: semComentarios(fs.readFileSync(path.join(dir, entrada.name), 'utf8')) });
		}
	}
	return saida;
}

describe('abaLembrada', () => {
	it('devolve o padrão quando nunca houve escolha', () => {
		expect(abaLembrada({ aba: null }, 'geral', ['geral', 'alvos'])).toBe('geral');
		expect(abaLembrada({}, 'geral', ['geral', 'alvos'])).toBe('geral');
		expect(abaLembrada(null, 'geral', ['geral', 'alvos'])).toBe('geral');
	});

	it('devolve a aba guardada', () => {
		expect(abaLembrada({ aba: 'alvos' }, 'geral', ['geral', 'alvos'])).toBe('alvos');
	});

	it('recusa uma aba que não existe mais e cai no padrão', () => {
		// O caso real: uma aba sai do HTML entre duas versões e o `localStorage`
		// do jogador continua com o nome dela. Sem esta recusa a janela abriria
		// com nenhuma aba acesa e o corpo vazio.
		expect(abaLembrada({ aba: 'fantasia' }, 'geral', ['geral', 'alvos'])).toBe('geral');
	});

	it('sem lista de válidas, aceita qualquer texto — é o Mapa de Caça', () => {
		// As abas de lá são as REGIÕES que o servidor manda; quem confere é o
		// próprio catálogo, quando ele chega.
		expect(abaLembrada({ aba: 'Prontera' }, 'Todas')).toBe('Prontera');
	});

	it('ignora lixo que não seja texto', () => {
		expect(abaLembrada({ aba: 3 }, 'geral', ['geral'])).toBe('geral');
		expect(abaLembrada({ aba: '' }, 'geral', ['geral'])).toBe('geral');
	});
});

describe('lembrarAba', () => {
	it('grava e chama save()', () => {
		let salvou = 0;
		const prefs = { aba: null, save: () => salvou++ };
		lembrarAba(prefs, 'alvos');
		expect(prefs.aba).toBe('alvos');
		expect(salvou).toBe(1);
	});

	it('guarda número como texto — a Mochila usa os TAB.* da Inventory', () => {
		const prefs = { aba: null, save: () => {} };
		lembrarAba(prefs, 2);
		expect(prefs.aba).toBe('2');
	});

	it('não grava de novo a aba que já estava aberta', () => {
		let salvou = 0;
		const prefs = { aba: 'alvos', save: () => salvou++ };
		lembrarAba(prefs, 'alvos');
		expect(salvou).toBe(0);
	});

	it('não grava nada sem aba', () => {
		let salvou = 0;
		const prefs = { aba: null, save: () => salvou++ };
		lembrarAba(prefs, null);
		lembrarAba(prefs, '');
		expect(salvou).toBe(0);
		expect(prefs.aba).toBe(null);
	});
});

describe('a volta depois do F5', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('a aba escolhida sobrevive a um Preferences.get novo', () => {
		const antes = Preferences.get('JanelaDeProva', { x: null, y: null, aba: null }, 1.0);
		lembrarAba(antes, 'alvos');

		// "Recarregar a página" é exatamente isto: o módulo some e alguém chama
		// `Preferences.get` de novo, com os mesmos padrões.
		const depois = Preferences.get('JanelaDeProva', { x: null, y: null, aba: null }, 1.0);
		expect(abaLembrada(depois, 'geral', ['geral', 'alvos'])).toBe('alvos');
	});

	it('somar a chave `aba` NÃO apaga a posição que o jogador já tinha salvo', () => {
		/*
		 * Este é o caso que proíbe subir a `version` do `Preferences.get`. Aqui
		 * o `localStorage` está no formato ANTIGO — só x/y, sem `aba` — que é o
		 * que está gravado na máquina de quem já jogava.
		 */
		localStorage.setItem('JanelaDeProva', JSON.stringify({ x: 120, y: 340, _version: 1.0 }));

		const prefs = Preferences.get('JanelaDeProva', { x: null, y: null, aba: null }, 1.0);

		expect(prefs.x).toBe(120);
		expect(prefs.y).toBe(340);
		expect(abaLembrada(prefs, 'geral', ['geral', 'alvos'])).toBe('geral');
	});
});

describe('PORTÃO: toda janela RAGIDLE com abas lembra a aba', () => {
	/**
	 * Quem é "janela RAGIDLE": a que importa `limpezaDeJanelaIdle.js`. É a
	 * marca que já separa as nossas das nativas do roBrowser (Inventory,
	 * Storage e GraphicsOption também têm `data-tab`, e não são nossas).
	 *
	 * Quem "tem abas": a que lê um dos atributos com que as nossas abas dizem quem
	 * são. `aba` e `grau` estão na lista por antecipação declarada: a janela de
	 * Habilidades está sendo reescrita em árvore de carreira enquanto isto é
	 * escrito, e o trilho novo dela (`.is-grausrail`) já está no HTML em disco.
	 */
	const MARCAS_DE_ABA = ['dataset.tab', 'dataset.cat', 'dataset.region', 'dataset.aba', 'dataset.grau'];
	const comAbas = todosOsFontes().filter(
		f => f.codigo.includes('limpezaDeJanelaIdle.js') && MARCAS_DE_ABA.some(marca => f.codigo.includes(marca))
	);

	it('acha as doze janelas de hoje (controle: o filtro não está vazio)', () => {
		/*
		 * Sem esta conferência, um filtro que parasse de casar deixaria o portão
		 * VERDE por não medir nada — a forma mais comum de portão morto.
		 *
		 * Ela fica vermelha por DOIS motivos, e os dois pedem uma olhada, não um
		 * conserto na lista:
		 *  - uma janela GANHOU abas (some `lembrarAba` nela, e some aqui);
		 *  - uma janela PERDEU as abas (tire-a daqui, e tire o código morto que
		 *    ficou apontando para o markup que saiu).
		 *
		 * A oitava é a Análise de Caça (D-943): Atual + as duas últimas.
		 *
		 * A NONA é a janela de Grupo (D-960, 07/09/2026): Grupo · Postos ·
		 * Rateio · Ajustes. Ela nasceu com quatro abas de propósito — a
		 * referência que o dono mandou abre três janelas POR CIMA da
		 * principal, e a decisão desta entrega foi resolver tudo dentro de uma
		 * moldura só, alternando por [hidden].
		 *
		 * O Códex ganhou abas no mesmo dia (08/09/2026) em DUAS branches
		 * diferentes: a divisão da aba única em "Missões" (o bestiário) e
		 * "Status" (os sete eixos) numa, e a aba "Missões do Códex" com a
		 * Jornada de Midgard na outra. O merge de 16/09/2026 juntou as duas
		 * — a janela tem hoje três abas, mas conta UMA vez só nesta lista.
		 *
		 * A DÉCIMA SEGUNDA é a Temporada (Season 1, 21/09/2026): Destaques ·
		 * Caixas · Passe Semanal · VIP. O PasseIdle (Recompensas) CONTINUA na
		 * lista mesmo sem botão no menu: o módulo vive como dono do pacote
		 * 0x0fe5, ainda tem as duas abas no HTML e ainda lembra a aba - tirá-lo
		 * daqui exigiria tirar o markup, que a prova que abre a janela por
		 * comando ainda usa.
		 */
		expect(comAbas.map(f => f.rel).sort(), 'a lista de janelas com abas mudou — ver o comentário acima').toEqual([
			'CodexIdle/CodexIdle.js',
			'GrupoIdle/GrupoIdle.js',
			'HuntAnalyzer/HuntAnalyzer.js',
			'HuntMap/HuntMap.js',
			'IdleSkills/IdleSkills.js',
			'LFGIdle/LFGIdle.js',
			'MissoesIdle/MissoesIdle.js',
			'MochilaIdle/MochilaIdle.js',
			'PasseIdle/PasseIdle.js',
			'TemporadaIdle/TemporadaIdle.js',
			'VotoIdle/VotoIdle.js',
		]);
	});

	it.each(comAbas.map(f => f.rel))('%s importa memoriaDeAba.js', rel => {
		const fonte = comAbas.find(f => f.rel === rel);
		expect(fonte.codigo).toContain("from '../memoriaDeAba.js'");
	});

	it.each(comAbas.map(f => f.rel))('%s restaura a aba com abaLembrada()', rel => {
		const fonte = comAbas.find(f => f.rel === rel);
		expect(fonte.codigo).toContain('abaLembrada(');
	});

	it.each(comAbas.map(f => f.rel))('%s grava a aba com lembrarAba()', rel => {
		const fonte = comAbas.find(f => f.rel === rel);
		expect(fonte.codigo).toContain('lembrarAba(');
	});

	it.each(comAbas.map(f => f.rel))('%s declara a chave `aba` nos padrões do Preferences', rel => {
		// Sem a chave nos padrões, `Preferences` nunca copia o valor gravado de
		// volta — a janela gravaria e nunca leria.
		const fonte = comAbas.find(f => f.rel === rel);
		expect(fonte.codigo).toMatch(/aba:\s*null/);
	});
});

describe('PORTÃO: as janelas NATIVAS que também aprenderam', () => {
	/**
	 * Estas três são do roBrowser e não passam pelo filtro acima (não importam
	 * `limpezaDeJanelaIdle.js`, porque não guardam estado de personagem). São
	 * as únicas nativas ABRÍVEIS no jogo que ainda esqueciam a aba: a Guilda
	 * (menu), e as Configurações de Vídeo e de Atalho (ESC).
	 *
	 * As outras nativas com aba já lembravam sozinhas antes deste trabalho — a
	 * Inventory e a Storage guardam `_preferences.tab`, a ChatBox guarda
	 * `canalAtivo` e a PartyFriends guarda `friend`. Nenhuma foi tocada.
	 */
	const NATIVAS = ['Guild/Guild.js', 'GraphicsOption/GraphicsOption.js', 'ShortCutOption/ShortCutOption.js'];

	it.each(NATIVAS)('%s lembra a aba', rel => {
		const codigo = semComentarios(fs.readFileSync(path.join(COMPONENTES, rel), 'utf8'));
		expect(codigo, 'não importa a peça compartilhada').toContain("from '../memoriaDeAba.js'");
		expect(codigo, 'não restaura a aba').toContain('abaLembrada(');
		expect(codigo, 'não grava a aba').toContain('lembrarAba(');
		expect(codigo, 'não declara a chave `aba` nos padrões do Preferences').toContain('aba: null');
	});

	it('a Guilda não abre sem aba nenhuma quando a permissão ainda não chegou', () => {
		/*
		 * A única janela cuja aba pode ser PROIBIDA. `onChangeTab` recusa uma
		 * aba fora de `_guildAccess`, e a máscara só chega depois do `show()`.
		 * Um `click()` recusado não acende aba nenhuma — então o recuo para a
		 * Geral tem de estar escrito, e o pedido tem de sobreviver até a
		 * máscara chegar.
		 */
		const codigo = semComentarios(fs.readFileSync(path.join(COMPONENTES, 'Guild', 'Guild.js'), 'utf8'));
		const restaurar = codigo.slice(codigo.indexOf('function abrirAbaLembrada'));

		expect(restaurar, 'sumiu o recuo para a Geral').toContain(".tabs .info");
		expect(restaurar, 'a permissão deixou de ser conferida antes do clique').toContain('_guildAccess &');
		const setAccess = codigo.slice(codigo.indexOf('Guild.setAccess = function'));
		expect(setAccess.slice(0, 300), 'setAccess não tenta de novo quando a máscara chega').toContain(
			'abrirAbaLembrada('
		);
	});
});

describe('a Mochila não volta mais para aba nenhuma', () => {
	it('limparEstadoDoPersonagem não zera _abaAtiva', () => {
		/*
		 * O defeito: `_abaAtiva = null` na troca de personagem, e `init()` — o
		 * único lugar que repunha o valor — roda uma vez só por carregamento de
		 * página. Depois da troca, `syncGrade()` filtrava por
		 * `getItemTab(item) === null` e a mochila abria VAZIA.
		 */
		const fonte = semComentarios(fs.readFileSync(path.join(COMPONENTES, 'MochilaIdle', 'MochilaIdle.js'), 'utf8'));
		const limpar = fonte.slice(fonte.indexOf('MochilaIdle.limparEstadoDoPersonagem'));

		expect(limpar).not.toContain('_abaAtiva = null');
		expect(limpar).toContain('_abaAtiva = abaDePartida()');
	});
});
