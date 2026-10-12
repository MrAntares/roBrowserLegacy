/**
 * O PAINEL DE COMANDO (D-1563/D-1564) — a resposta longa de comando em janela.
 *
 * Duas metades, e elas se medem de jeitos diferentes:
 *
 * 1. as DECISÕES puras (a ordem da tabela, o relógio que conta sozinho) rodam
 *    de verdade aqui, importadas do módulo;
 * 2. a COSTURA (o pacote fisgado, o registro na pilha, a alça do arrasto, o
 *    cartão do celular) é lida no fonte — levantar a janela puxa WebGL e uma
 *    sessão logada, e quem a olha de verdade é a prova do servidor.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { faltaAgora, formatarFalta, ordenarLinhas } from '../../src/UI/Components/PainelComandoIdle/tabelaDoPainel.js';

const base = join(process.cwd(), 'src/UI/Components/PainelComandoIdle');
const html = readFileSync(join(base, 'PainelComandoIdle.html'), 'utf8');
const js = readFileSync(join(base, 'PainelComandoIdle.js'), 'utf8');
const puro = readFileSync(join(base, 'tabelaDoPainel.js'), 'utf8');
const css = readFileSync(join(base, 'PainelComandoIdle.css'), 'utf8');
const arrasto = readFileSync(join(process.cwd(), 'src/UI/arrastarPorPonteiro.js'), 'utf8');
const mapEngine = readFileSync(join(process.cwd(), 'src/Engine/MapEngine.js'), 'utf8');

const PAINEL = {
	v: 1,
	comando: 'mvptimeall',
	titulo: 'MVPs do servidor',
	colunas: [
		{ chave: 'estado', rotulo: '', tipo: 'selo' },
		{ chave: 'nome', rotulo: 'MVP', tipo: 'texto' },
		{ chave: 'falta', rotulo: 'Volta em', tipo: 'relogio' }
	],
	linhas: [
		{ valores: { estado: 'morto', nome: 'Osiris', falta: 600000 } },
		{ valores: { estado: 'morto', nome: 'Doppelganger', falta: null }, enfase: 'apagado' },
		{ valores: { estado: 'morto', nome: 'Golden Thief Bug', falta: 60000 } },
		{ valores: { estado: 'vivo', nome: 'Eddga', falta: null }, enfase: 'destaque' }
	],
	ordemInicial: { chave: 'falta', direcao: 'asc' }
};

describe('o relogio da janela conta sozinho', () => {
	it('desconta o tempo que passou DESDE A CHEGADA, e nao o relogio absoluto', () => {
		// O servidor mandou "faltam 10 min"; 90 s depois a tela diz 8m 30s sem
		// pacote nenhum. Se o instante viajasse, o relogio do navegador do
		// jogador entraria na conta — e ele nao e o do servidor.
		expect(faltaAgora(600000, 1000, 1000 + 90000)).toBe(510000);
		expect(formatarFalta(510000)).toBe('8m 30s');
	});

	it('o vencido para em zero, e o ausente continua ausente', () => {
		expect(faltaAgora(60000, 0, 500000)).toBe(0);
		expect(faltaAgora(null, 0, 500000)).toBeNull();
		expect(faltaAgora(undefined, 0, 500000)).toBeNull();
	});

	it('o formato e o MESMO do chat — horas so quando existem', () => {
		expect(formatarFalta(0)).toBe('0m 00s');
		expect(formatarFalta(3600000 + 2 * 60000 + 3000)).toBe('1h 02m 03s');
	});
});

describe('a ordem da tabela', () => {
	it('sem escolha do jogador, a ordem e a que o SERVIDOR mandou', () => {
		expect(ordenarLinhas(PAINEL, null).map((l) => l.valores.nome)).toEqual([
			'Osiris',
			'Doppelganger',
			'Golden Thief Bug',
			'Eddga'
		]);
	});

	it('o relogio ordena como NUMERO, e nao como texto', () => {
		// Como texto, "600000" viria antes de "60000" — e a lista mentiria
		// sobre quem nasce primeiro, que e a pergunta do comando.
		const ordenada = ordenarLinhas(PAINEL, { chave: 'falta', direcao: 'asc' });
		expect(ordenada.map((l) => l.valores.nome).slice(0, 2)).toEqual(['Golden Thief Bug', 'Osiris']);
	});

	it('quem NAO tem relogio fica no fim — nas duas direcoes', () => {
		const asc = ordenarLinhas(PAINEL, { chave: 'falta', direcao: 'asc' });
		const desc = ordenarLinhas(PAINEL, { chave: 'falta', direcao: 'desc' });
		expect(asc.slice(-2).map((l) => l.valores.falta)).toEqual([null, null]);
		expect(desc.slice(-2).map((l) => l.valores.falta)).toEqual([null, null]);
		// E o desc REALMENTE inverteu os que tem relogio.
		expect(desc[0].valores.nome).toBe('Osiris');
	});

	it('texto ordena em pt-BR, e coluna desconhecida nao embaralha nada', () => {
		const porNome = ordenarLinhas(PAINEL, { chave: 'nome', direcao: 'asc' });
		expect(porNome[0].valores.nome).toBe('Doppelganger');
		expect(ordenarLinhas(PAINEL, { chave: 'inexistente', direcao: 'asc' })).toEqual(PAINEL.linhas);
	});

	it('ordenar NAO muda a lista que chegou', () => {
		const antes = PAINEL.linhas.map((l) => l.valores.nome);
		ordenarLinhas(PAINEL, { chave: 'nome', direcao: 'desc' });
		expect(PAINEL.linhas.map((l) => l.valores.nome)).toEqual(antes);
	});
});

describe('a costura da janela', () => {
	it('fisga o 0x0fbc e abre SOZINHA — quem digitou o comando quer o resultado', () => {
		expect(js).toContain('Network.hookPacket(PACKET.ZC.RAGIDLE_PAINEL, onPainelRecebido);');
		// `__active`, o campo que o GUIComponent escreve. Esta ancora pedia
		// `__appended` ate 22/09/2026 — um campo que ninguem escrevia, e com
		// ele a guarda nunca valia (F11).
		// O .gitattributes entrega o fonte em CRLF (eol=crlf): a ancora compara com LF.
		expect(js.replace(/\r\n/g, '\n')).toContain("if (!PainelComandoIdle.__active) {\n\t\tPainelComandoIdle.append();");
		expect(mapEngine).toContain('PainelComandoIdle.prepare();');
	});

	it('entra na pilha de janelas — ESC e o VOLTAR do Android fecham', () => {
		expect(mapEngine).toContain("['painel-de-comando', PainelComandoIdle, '.pc-window'],");
		expect(js).toContain('PainelComandoIdle.onKeyDown = function onKeyDown(event) {');
		expect(js).toContain('event.which === 27');
	});

	it('e sai da tela na troca de personagem', () => {
		expect(js).toContain('PainelComandoIdle.limparEstadoDoPersonagem = function');
		expect(mapEngine).toMatch(/RankingIdle,\r?\n\t\tBotMenu,\r?\n\t\tPainelComandoIdle,/);
	});

	it('o arrasto e por PONTEIRO — o `draggable()` nao anda no dedo', () => {
		expect(js).toContain('arrastarPorPonteiro({');
		expect(js).not.toContain('this.draggable(');
		expect(arrasto).toContain("alca.addEventListener('pointerdown'");
		expect(arrasto).toContain('alca.setPointerCapture(event.pointerId);');
		// `touch-action: none` na alca: sem ele o navegador do celular ROLA a
		// pagina em vez de arrastar a janela.
		expect(arrasto).toContain("alca.style.touchAction = 'none';");
	});

	it('a posicao guardada e PRENDIDA na tela de hoje antes de valer', () => {
		expect(js).toContain('prenderNaTela(this._host);');
		expect(arrasto).toContain('export function prenderNaTela(painel)');
	});

	it('o minimizar existe, tem lugar proprio e NAO vira arrasto', () => {
		expect(html).toContain('class="pc-minimizar ri-close"');
		expect(html).toMatch(/aria-label="Recolher para o modo enxuto"/);
		// O `.ri-close` do design system ancora todo mundo no mesmo pixel: sem
		// o `right` proprio, o "x" fica por cima do "-" (a cicatriz do
		// HuntAnalyzer).
		expect(css).toMatch(/\.pc-minimizar\s*\{[^}]*right:\s*52px/);
		expect(js).toContain('event.stopPropagation();');
		expect(js).toContain('PainelComandoIdle.alternarCompacto();');
	});

	it('o recolhido e LEMBRADO, e a classe vai no host tambem', () => {
		expect(js).toContain("_preferences.compacto = !_preferences.compacto;");
		expect(js).toContain('_preferences.save();');
		expect(js).toContain("PainelComandoIdle._host.classList.toggle('is-compact'");
		expect(css).toContain('.pc-window.is-compact .pc-body');
	});

	it('o relogio anda sem refazer a tabela — a rolagem do jogador sobrevive', () => {
		expect(js).toContain('function tiquearRelogios()');
		expect(js).toContain('setInterval(tiquearRelogios, PASSO_DO_RELOGIO_MS)');
		// E o intervalo MORRE ao fechar: temporizador esquecido e vazamento.
		expect(js).toContain('clearInterval(_tique);');
	});

	it('a janela ABRE de verdade — `is-open`, e nao so `append()` (D-1567)', () => {
		/*
		 * Ela foi a producao INVISIVEL: o padrao do fork e `.ri-anima` com
		 * `opacity: 0` ate a classe `is-open` entrar, e a marcacao
		 * `ri-window ri-anima` que eu copiei traz o estado FECHADO junto. A
		 * janela existia, tinha 27 linhas e nao pintava.
		 */
		expect(js).toContain('function abrir()');
		expect(js).toContain("janela.classList.add('is-open');");
		expect(js).toContain("janela.classList.remove('is-open');");
		expect(css).toContain('#PainelComandoIdle .pc-window.is-open {');
		// E o `receber` ABRE: `append()` sozinho nao pinta nada.
		expect(js).toMatch(/render\(\);\s*abrir\(\);/);
	});

	it('o botao dentro da alca CLICA — o arrasto nao engole o gesto (D-1567)', () => {
		/*
		 * `preventDefault()` no `pointerdown` cancela os eventos de mouse de
		 * compatibilidade, e o `click` e um deles: o "−" do placar do MVP
		 * simplesmente nao fazia nada. A guarda mora no helper, entao vale para
		 * toda janela que use a alca.
		 */
		expect(arrasto).toContain("alvo.closest('button')");
		const i = arrasto.indexOf("alvo.closest('button')");
		expect(arrasto.indexOf('event.preventDefault();')).toBeGreaterThan(i);
	});

	it('a coluna AVATAR desenha o bicho, e some sozinha se faltar arte', () => {
		expect(js).toContain("if (coluna.tipo === 'avatar')");
		expect(js).toContain("/ragidle/mobs/");
		expect(js).toContain("onerror=\"this.style.display='none'\"");
		expect(css).toMatch(/\.pc-avatar \{[^}]*image-rendering:\s*pixelated/);
	});

	it('o design usa os TOKENS do jogo, e nao cor escrita a mao', () => {
		// A primeira versao era um painel escuro com texto verde em toda linha
		// ("parecendo amador", nas palavras do dono). O sistema do jogo e claro.
		expect(css).toContain('var(--window-fill)');
		expect(css).toContain('var(--titlebar-fill)');
		expect(css).toContain('var(--border-gold)');
		expect(css).not.toContain('rgba(24, 26, 34');
	});

	it('o resumo vira PASTILHAS, e nao uma frase espremida', () => {
		expect(js).toContain("class=\"pc-pastilha");
		expect(css).toContain('#PainelComandoIdle .pc-pastilha {');
		expect(css).toContain('.pc-pastilha.is-vivo');
	});

	it('o conteudo do servidor e ESCAPADO — nome de mapa vem de dado', () => {
		expect(js).toContain('function escapeHtml(value)');
		expect(js).toContain('escapeHtml(c.rotulo)');
	});
});

describe('o celular em pe (a regra do dono de 08/09/2026)', () => {
	it('a tabela vira CARTAO, e o cabecalho some', () => {
		expect(css).toContain(':host-context(html.ri-vertical) #PainelComandoIdle .pc-tabela thead { display: none; }');
		expect(css).toMatch(/:host-context\(html\.ri-vertical\)[^{]*\.pc-linhas tr \{/);
	});

	it('cada celula do cartao diz de QUE coluna ela e', () => {
		// Sem o cabecalho, "prt_sewb4" sozinho nao se explica.
		expect(js).toContain('data-rotulo="${escapeHtml(c.rotulo)}"');
		expect(css).toContain("content: attr(data-rotulo);");
	});

	it('a ordem no celular tem alvo TATIL de 44px', () => {
		expect(html).toContain('class="pc-ordem-vertical"');
		expect(css).toMatch(/\.pc-ordem-vertical button \{[^}]*min-height:\s*44px/);
		expect(css).toMatch(/\.pc-ordem-vertical button \{[^}]*min-width:\s*44px/);
	});

	it('o texto longo QUEBRA a linha; numero e relogio, nao', () => {
		// A ajuda do `@commands` tem 60 a 90 caracteres: com `nowrap` a tabela
		// viraria uma rolagem horizontal de 900px, e ler ajuda rolando de lado e
		// pior que ler no chat.
		expect(css).toMatch(/td\.pc-texto \{[^}]*white-space:\s*normal/);
		expect(css).toMatch(/\.pc-tabela td \{[^}]*white-space:\s*nowrap/);
	});

	it('a janela nao passa da largura da tela', () => {
		// `width: min(520px, 100vw - 16px)` — a janela cabe na tela do celular
		// sem `max-width` separado, que era como ela nascia.
		expect(css).toMatch(/width:\s*min\(520px,\s*100vw - 16px\)/);
	});
});
