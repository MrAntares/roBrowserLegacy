/**
 * A HUD NAO REDESENHA A TOA (auditoria de desempenho, 11/09/2026).
 *
 * A HUD Idle e dirigida por PESQUISA: nove componentes com
 * `POLL_INTERVAL_MS = 250` e dois com `VIDA_AO_VIVO_MS = 400`. Quatro voltas
 * por segundo, durante a cacada inteira. Isso por si so nao e defeito — o
 * defeito e o que cada volta FAZ quando nada mudou.
 *
 * Onde isso doi esta medido, e nao suposto: `npm run sonda:fps` mediu **17fps**
 * no celular com o processador em 1/4, com os tempos de quadro em multiplos
 * exatos de vsync — **o gargalo e CPU da thread principal, e nao GPU**.
 * Trabalho de HUD desperdicado sai exatamente dai.
 *
 * Levantar as janelas de verdade puxa WebGL e uma sessao logada, entao a
 * costura se confere no FONTE, como a `analiseDeCacaEnxuta` ao lado. Quem olha
 * a tela de verdade e a `sonda:fps` e as provas de HUD.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const componentes = join(process.cwd(), 'src/UI/Components');
const basicInfo = readFileSync(join(componentes, 'BasicInfoIdle/BasicInfoIdle.js'), 'utf8');
const huntAnalyzer = readFileSync(join(componentes, 'HuntAnalyzer/HuntAnalyzer.js'), 'utf8');
const mochila = readFileSync(join(componentes, 'MochilaIdle/MochilaIdle.js'), 'utf8');

/**
 * O corpo de UMA funcao, do cabecalho ate a chave que a fecha na coluna 0.
 *
 * DUAS cicatrizes moram neste regex, e as duas sao de teste que media a coisa
 * errada:
 *
 * 1. `indexOf("\n}\n")` nao casa em arquivo com final de linha CRLF. Foi assim
 *    que um teste deste projeto passou a medir o arquivo INTEIRO (189.386
 *    caracteres) achando que media uma funcao — e o proprio CONTROLE do caso
 *    reprovava, o que mascarou dias de "falha conhecida".
 * 2. **`};` tambem fecha funcao**, e este caso foi pego na primeira corrida:
 *    `HuntAnalyzer.toggle = function toggle() {...};` e uma EXPRESSAO atribuida
 *    a uma propriedade, entao ela termina com ponto-e-virgula. Com `\}` puro o
 *    auxiliar nao achava o fim e o teste reprovava por culpa dele mesmo, e nao
 *    do codigo. O `;?` cobre as duas formas.
 */
function corpoDaFuncao(fonte, assinatura) {
	const daqui = fonte.slice(fonte.indexOf(assinatura));
	const fim = daqui.search(/\r?\n\};?\r?\n/);
	expect(fim, `"${assinatura}" nao fecha em nenhuma chave de coluna 0`).toBeGreaterThan(0);
	return daqui.slice(0, fim);
}

describe('BasicInfoIdle: escrever no DOM so quando o texto MUDA', () => {
	it('setText compara antes de escrever', () => {
		/*
		 * Ele e chamado DEZ vezes por volta de 250 ms, e escrevia `textContent`
		 * sempre — inclusive com o mesmo valor. Escrever o mesmo texto nao e de
		 * graca: invalida o layout daquele no e o quadro seguinte paga o reflow.
		 */
		// D-2385: a comparacao mudou de casa — `setText` acha o elemento e `escreverNoTexto` (que as barras e a
		// inicial tambem usam) compara.
		const corpo = corpoDaFuncao(basicInfo, 'function setText(');
		expect(corpo).toMatch(/escreverNoTexto\(el, text\)/);
		const escrita = corpoDaFuncao(basicInfo, 'function escreverNoTexto(');
		expect(escrita).toMatch(/if\s*\(\s*el\.textContent\s*!==/);
	});

	it('e o padrao ja existia no arquivo: o retrato so troca o src quando o job muda', () => {
		// Este caso NAO e sobre a mudanca nova. Ele prende o precedente que a
		// justifica — se alguem tirar a guarda do retrato, a razao escrita em
		// `setText` deixa de ter apoio no proprio arquivo.
		expect(basicInfo).toContain('dataset.jobId');
	});
});

describe('BasicInfoIdle: a porcentagem de EXP DENTRO da barra (11/09/2026)', () => {
	/*
	 * Pedido do dono: *"adicionar a porcentagem da EXP de Base/Classe na barra
	 * do personagem (pequeno, visivel, dentro da barra com a cor verde)"*.
	 *
	 * Ele mora NESTE arquivo de proposito, e nao num teste proprio: a feature
	 * escreve texto num painel que repesquisa o estado a cada 250 ms, entao ela
	 * e exatamente o tipo de coisa que desfaz o achado 5 por fora. O portao do
	 * anti-reflow e o portao da feature sao o mesmo assunto.
	 */
	const html = readFileSync(join(componentes, 'BasicInfoIdle/BasicInfoIdle.html'), 'utf8');
	const corpo = corpoDaFuncao(basicInfo, 'function updateExpBar(');
	const rodape = corpoDaFuncao(basicInfo, 'function sincronizarRodapeVertical(');

	it('as duas barras tem o span da porcentagem', () => {
		expect(html).toContain('bi-bexp-pct');
		expect(html).toContain('bi-jexp-pct');
	});

	it('a porcentagem vai por setText — nunca por textContent', () => {
		// `textContent` direto somaria DUAS invalidacoes de layout por volta de
		// 250 ms, uma por barra. `setText` compara antes de escrever.
		expect(corpo).toMatch(/setText\(\s*root,\s*pctSelector/);
		expect(corpo).not.toMatch(/textContent/);
	});

	it('o seletor do texto e OPCIONAL, e o rodape do celular NAO o recebe', () => {
		/*
		 * Sao TRES chamadores da mesma funcao. O terceiro e o rodape do celular
		 * em pe, que ja escreve o proprio texto com valor e maximo por extenso
		 * ("31.233 / 45.000 (69,4%)", o mockup de D-939). Sem o parametro
		 * opcional, ou a porcentagem duplicaria la, ou a chamada quebraria.
		 */
		expect(corpo).toMatch(/if\s*\(\s*pctSelector\s*\)/);
		expect(rodape).toContain('.bi-rodape-exp-fill');
		expect(rodape).not.toContain('-pct');
	});

	it('CONTROLE: o rodape continua escrevendo o texto DELE', () => {
		// Senao o caso acima passaria de graca no dia em que o rodape perdesse
		// o texto — e a ausencia de duplicata seria ausencia de tudo.
		expect(rodape).toContain('.bi-rodape-exp-texto');
	});
});

describe('HuntAnalyzer: o ciclo anda sempre, o DESENHO so com a janela aberta', () => {
	const corpo = corpoDaFuncao(huntAnalyzer, 'function tique()');

	it('o tique sai cedo quando a janela nao esta aberta', () => {
		expect(corpo).toMatch(/classList\.contains\('is-open'\)/);
		expect(corpo).toMatch(/return;/);
	});

	it('O CICLO FICA ACIMA DA GUARDA — e este e o caso que importa', () => {
		/*
		 * A guarda e uma otimizacao; a ORDEM e correcao. E o tique que percebe
		 * "entrou no mapa de caca", "morreu" e "voltou pra cidade", e faz o
		 * registro iniciar, travar e arquivar. Guardar o tique INTEIRO atras da
		 * janela deixaria a leitura da cacada parada enquanto ela estivesse
		 * fechada — que e o estado normal dela.
		 *
		 * Sem este caso, "guardar tudo" passaria no caso acima e quebraria o
		 * recurso em silencio.
		 */
		const ondeOCicloRoda = corpo.indexOf('atualizarSituacao(');
		const ondeAGuardaEsta = corpo.indexOf("classList.contains('is-open')");

		expect(ondeOCicloRoda, 'o ciclo sumiu do tique').toBeGreaterThan(-1);
		expect(ondeAGuardaEsta, 'a guarda sumiu do tique').toBeGreaterThan(-1);
		expect(ondeOCicloRoda).toBeLessThan(ondeAGuardaEsta);
	});

	it('reabrir a janela repinta na hora — o toggle chama o tique', () => {
		// Sem isto, a guarda deixaria a janela mostrando o retrato de quando
		// ela foi fechada ate a volta seguinte do relogio.
		const toggle = corpoDaFuncao(huntAnalyzer, 'HuntAnalyzer.toggle = function toggle()');
		expect(toggle).toMatch(/add\('is-open'\)[\s\S]*tique\(\)/);
	});
});

describe('MochilaIdle: o CONTROLE — ela ja fazia certo', () => {
	/*
	 * Este bloco nao conserta nada: ele prende comportamento que a auditoria
	 * encontrou JA CORRETO, e que eu quase reportei como defeito. O relatorio
	 * dizia que a Mochila "reconstroi a grade a cada loot"; o literal mostrou
	 * `pollTick` chamando `syncAll` apenas com a janela aberta, e
	 * `hideNativeHosts` comparando antes de escrever.
	 *
	 * Vale um caso porque a proxima refatoracao pode perder isso sem que nada
	 * acuse — e ai o defeito que eu reportei errado passaria a ser verdade.
	 */
	it('pollTick so sincroniza com a janela aberta', () => {
		const corpo = corpoDaFuncao(mochila, 'function pollTick()');
		expect(corpo).toMatch(/if\s*\(\s*isOpen\(\)\s*\)/);
	});

	it('hideNativeHosts compara antes de escrever o display', () => {
		const corpo = corpoDaFuncao(mochila, 'function hideNativeHosts()');
		expect(corpo).toMatch(/style\.display\s*!==\s*'none'/);
	});
});
