// Mutacao somente na memoria do Vitest: nunca altera o cliente servido pelo Vite.
//
// A FAIXA DE AVISO NO CELULAR EM PE (bug #1 de 13/10/2026, rodadas 1, 2 e 3). Cada mutante e um jeito
// de a faixa voltar a cair sobre a HUD: coluna mais larga que o cartao, banner sem teto passando por
// baixo dos buffs, altura fixa cortando o titulo, topo que nao olha o placar do MVP ou a faixa de
// grupo, lugar fora da tela, acompanhamento que nao remede ou que vaza depois que a faixa sai, e a
// costura do `Announce.js` (a rodada 1 a vigiava lendo texto, e 5 de 6 mutantes sobreviviam). A rodada 3
// soma a janela de morte (o cartao "Voce morreu" e peca, com a prioridade mais alta), o ultimo recurso
// SOBRE o cartao de missoes (nunca nas pecas da luta) e o rotulo do botao de caca.
//
//   RAG_MUTANTE_FAIXA=<nome> npx vitest run --config tests/mutantes/faixa-de-aviso.config.mjs
//
// Um mutante MORTO faz a corrida reprovar. Os dois arquivos de teste rodam em todo mutante:
// `faixaDeAvisoNoCelular.test.js` (a regra pura e a costura com o CSS) e
// `faixaDeAvisoNoComponente.test.js` (o `Announce.set` montado no jsdom).
import base from '../../vite.config.js';

const ALVO = 'src/UI/Components/Announce/posicaoDaFaixa.js';
const COMPONENTE = 'src/UI/Components/Announce/Announce.js';

export const mutantes = {
	// ---- a largura ----
	// a coluna deixa de ser o TETO de 236 e vira o piso
	colunaMax: [ALVO, 'Math.min(LARGURA_DO_CARTAO, larguraDaTela - LARGURA_DO_TRILHO - 32)', 'Math.max(LARGURA_DO_CARTAO, larguraDaTela - LARGURA_DO_TRILHO - 32)'],
	// a coluna esquece o trilho da direita
	colunaSemTrilho: [ALVO, 'larguraDaTela - LARGURA_DO_TRILHO - 32', 'larguraDaTela - 32'],
	// o piso de 100px some da coluna
	colunaSemPiso: [ALVO, 'return Math.max(PISO, Math.min(LARGURA_DO_CARTAO,', 'return Math.max(0, Math.min(LARGURA_DO_CARTAO,'],
	// o desktop passa a quebrar na coluna
	desktopNaColuna: [ALVO, 'return { largura: larguraPedida, quebra: larguraDaTela };', 'return { largura: larguraPedida, quebra: larguraDaColuna(larguraDaTela) };'],
	// o desktop vira vertical
	desktopViraVertical: [ALVO, 'if (!naVertical) {\n\t\treturn { largura', 'if (false) {\n\t\treturn { largura'],
	// o banner de conquista volta a pedir a tela inteira (o defeito 2 da rodada 1)
	bannerSemTeto: [ALVO, 'largura: larguraPedida ? Math.min(larguraPedida, coluna) : null', 'largura: larguraPedida ? larguraPedida : null'],
	// o banner perde a largura pedida
	bannerSemPedido: [ALVO, 'largura: larguraPedida ? Math.min(larguraPedida, coluna) : null', 'largura: null'],
	// a quebra de linha da vertical volta a ser a tela inteira
	quebraNaTela: [ALVO, 'quebra: coluna }', 'quebra: larguraDaTela }'],

	// ---- a altura ----
	// a altura pedida volta a mandar na vertical (o titulo sai do canvas)
	alturaFixaNaVertical: [ALVO, 'return Math.max(alturaPedida || 0, doTexto);', 'return alturaPedida || doTexto;'],
	// a altura pedida deixa de ser piso
	alturaSemPiso: [ALVO, 'return Math.max(alturaPedida || 0, doTexto);', 'return doTexto;'],
	// o desktop passa a crescer com as linhas
	alturaDoDesktopMuda: [ALVO, 'return alturaPedida || doTexto;', 'return Math.max(alturaPedida || 0, doTexto);'],
	// a altura do texto perde o respiro
	alturaSemRespiro: [ALVO, 'const doTexto = 10 + (tamanhoDaFonte + 5) * linhas;', 'const doTexto = (tamanhoDaFonte + 5) * linhas;'],

	// ---- a marca da vertical ----
	verticalMarcaErrada: [ALVO, 'classList.contains(MARCA_VERTICAL)', "classList.contains('ri-horizontal')"],
	verticalSemDoc: [ALVO, 'return !!doc && !!doc.documentElement && ', 'return '],

	// ---- a caixa visivel ----
	caixaSemAltura: [ALVO, 'if (!(b.width > 0 && b.height > 0)) {', 'if (!(b.width > 0)) {'],
	caixaSemLargura: [ALVO, 'if (!(b.width > 0 && b.height > 0)) {', 'if (!(b.height > 0)) {'],
	caixaVeEscondido: [ALVO, "estilo.visibility === 'hidden' || ", ''],
	caixaVeTransparente: [ALVO, " || estilo.opacity === '0'", ''],
	caixaSemGuardaDoEstilo: [ALVO, 'vista && vista.getComputedStyle ? vista.getComputedStyle(el) : null', 'vista.getComputedStyle(el)'],
	caixaTrocaXY: [ALVO, '{ x: b.left, y: b.top, w: b.width, h: b.height }', '{ x: b.top, y: b.left, w: b.width, h: b.height }'],

	// ---- as pecas medidas ----
	pecaSemShadow: [ALVO, '(host.shadowRoot || host).querySelectorAll(peca.dentro)', 'host.querySelectorAll(peca.dentro)'],
	pecaSoHost: [ALVO, 'peca.dentro ? (host.shadowRoot || host).querySelectorAll(peca.dentro) : [host]', '[host]'],
	listaSemPlacar: [ALVO, "\t{ nome: 'placar-mvp', host: 'PlacarMvpIdle', dentro: '.pm-placar' },\n", ''],
	listaSemGrupo: [ALVO, "\t{ nome: 'faixa-de-grupo', host: 'PartyHud', dentro: '.ph-hud' },\n", ''],
	listaSemBuffs: [ALVO, "\t{ nome: 'buff', host: 'StatusIcons', dentro: '.state' },\n", ''],
	listaSemChat: [ALVO, "\t{ nome: 'chat', host: 'ChatBox', dentro: '#chatbox' },\n", ''],
	listaChatPeloHost: [ALVO, "host: 'ChatBox', dentro: '#chatbox' }", "host: 'ChatBox' }"],
	listaSemCartao: [ALVO, "\t{ nome: 'cartao-de-missoes', host: 'MissoesTrackerIdle', prioridade: CEDE },\n", ''],

	// ---- o comeco da coluna ----
	inicioSemFileira: [ALVO, 'Math.max(...bases) + VAO + FILEIRA_DO_AVISO_DE_ITEM', 'Math.max(...bases) + VAO'],
	inicioSoCartao: [ALVO, "const TOPO_DA_COLUNA = ['cabecalho', 'cartao-de-missoes'];", "const TOPO_DA_COLUNA = ['cartao-de-missoes'];"],
	inicioSemGuarda: [ALVO, 'if (bases.length === 0) {', 'if (false) {'],

	// ---- a area coberta ----
	areaSemVaoX: [ALVO, 'Math.min(faixa.x + faixa.w + VAO, p.x + p.w) - Math.max(faixa.x - VAO, p.x)', 'Math.min(faixa.x + faixa.w, p.x + p.w) - Math.max(faixa.x, p.x)'],
	areaSemVaoY: [ALVO, 'Math.min(faixa.y + faixa.h + VAO, p.y + p.h) - Math.max(faixa.y - VAO, p.y)', 'Math.min(faixa.y + faixa.h, p.y + p.h) - Math.max(faixa.y, p.y)'],
	areaOuEmVezDeE: [ALVO, 'if (largura > 0 && altura > 0) {', 'if (largura > 0 || altura > 0) {'],
	areaSoUltima: [ALVO, 'total += largura * altura;', 'total = largura * altura;'],

	// ---- o lugar livre ----
	candidatoSemVao: [ALVO, 'const logoAbaixo = p.y + p.h + VAO;', 'const logoAbaixo = p.y + p.h;'],
	candidatoAcimaDoInicio: [ALVO, 'if (logoAbaixo > inicio) {', 'if (true) {'],
	semOrdenar: [ALVO, 'candidatos.sort((a, b) => a - b);', ''],
	semPeDaTela: [ALVO, 'if (topo + altura > fim) {', 'if (false) {'],
	empateVaiParaBaixo: [ALVO, 'if (menor === null || custaMenos(custo, menor)) {', 'if (menor === null || !custaMenos(menor, custo)) {'],
	semLugarSemInicio: [ALVO, 'let melhor = inicio;', 'let melhor = null;'],

	// ---- rodada 3, D1: a janela de morte ----
	// o cartao da morte sai da lista (a faixa volta para tras dele)
	listaSemMorte: [ALVO, "\t{ nome: 'janela-de-morte', host: 'DeathWindow', dentro: '.dw-card', prioridade: DECISAO }\n", ''],
	// a morte medida pelo HOST (que cobre a tela inteira o jogo todo)
	morteMedidaPeloHost: [ALVO, "host: 'DeathWindow', dentro: '.dw-card', prioridade: DECISAO }", "host: 'DeathWindow', prioridade: DECISAO }"],
	// o cartao da morte vira peca comum da HUD
	morteSemPrioridade: [ALVO, "dentro: '.dw-card', prioridade: DECISAO }", "dentro: '.dw-card' }"],
	// a prioridade da decisao deixa de valer
	prioridadeSemDecisao: [ALVO, 'peca.prioridade === CEDE || peca.prioridade === DECISAO ? peca.prioridade : HUD', 'peca.prioridade === CEDE ? peca.prioridade : HUD'],

	// ---- rodada 3, D2: o ultimo recurso sobre o cartao de missoes ----
	// o cartao de missoes vira peca comum (o ultimo recurso volta a ser "o que menos cobre")
	cartaoSemPrioridade: [ALVO, "host: 'MissoesTrackerIdle', prioridade: CEDE }", "host: 'MissoesTrackerIdle' }"],
	// a prioridade do cartao deixa de valer
	prioridadeSemCede: [ALVO, 'peca.prioridade === CEDE || peca.prioridade === DECISAO ? peca.prioridade : HUD', 'peca.prioridade === DECISAO ? peca.prioridade : HUD'],
	// qualquer numero vale como prioridade
	prioridadeQualquer: [ALVO, 'peca.prioridade === CEDE || peca.prioridade === DECISAO ? peca.prioridade : HUD', 'peca.prioridade === undefined ? HUD : peca.prioridade'],
	// a medida perde a prioridade da tabela
	medirSemPrioridade: [ALVO, '\t\t\t\t\tpeca.prioridade === undefined\n\t\t\t\t\t\t? { nome: peca.nome, ...caixa }\n\t\t\t\t\t\t: { nome: peca.nome, prioridade: peca.prioridade, ...caixa }', '\t\t\t\t\t{ nome: peca.nome, ...caixa }'],
	// sem o candidato rente ao topo do cartao (nao ha ultimo recurso fora da coluna)
	semCandidatoSobreOCartao: [ALVO, '\t\tif (prioridadeDe(p) === CEDE) {\n\t\t\tcandidatos.push(p.y);\n\t\t}\n', ''],
	// o topo de TODA peca vira candidato
	candidatoNoTopoDeToda: [ALVO, 'if (prioridadeDe(p) === CEDE) {', 'if (true) {'],
	// o custo compara a SOMA das areas, e nao a ordem das prioridades
	custoPelaSoma: [ALVO, '\tfor (let i = 0; i < a.length; i++) {\n\t\tif (a[i] !== b[i]) {\n\t\t\treturn a[i] < b[i];\n\t\t}\n\t}\n\treturn false;', '\treturn a[0] + a[1] + a[2] < b[0] + b[1] + b[2];'],
	// a ordem das prioridades se inverte (o cartao de missoes pesa mais que a luta)
	custoOrdemInvertida: [ALVO, 'custo[DECISAO - prioridadeDe(p)]', 'custo[prioridadeDe(p)]'],
	// so a ultima peca de cada prioridade conta
	custoSemAcumular: [ALVO, 'custo[DECISAO - prioridadeDe(p)] += areaCoberta(faixa, [p]);', 'custo[DECISAO - prioridadeDe(p)] = areaCoberta(faixa, [p]);'],
	// a comparacao se inverte
	custaMaisVence: [ALVO, 'return a[i] < b[i];', 'return a[i] > b[i];'],
	// empate inteiro conta como "custa menos"
	custaMenosNoEmpate: [ALVO, '\t\t}\n\t}\n\treturn false;\n}', '\t\t}\n\t}\n\treturn true;\n}'],
	// o primeiro candidato nunca e aceito sozinho
	menorNuncaNulo: [ALVO, 'let menor = null;', 'let menor = [0, 0, 0];'],

	// ---- rodada 3, D3: o rotulo do botao de caca ----
	// o rotulo sai da lista (em 320 a faixa volta a cobrir o "Retor")
	listaSemRotulo: [ALVO, "\t{ nome: 'rotulo-de-caca', host: 'HuntButtonIdle', dentro: '.hb-rotulo' },\n", ''],
	// o seletor do rotulo nao casa mais com o HTML do botao
	rotuloSeletorErrado: [ALVO, "host: 'HuntButtonIdle', dentro: '.hb-rotulo' }", "host: 'HuntButtonIdle', dentro: '.hb-rotulo-x' }"],

	// ---- publicar ----
	publicarSemConverter: [ALVO, 'Math.round(converter(lugar))', 'Math.round(lugar)'],
	publicarSemArredondar: [ALVO, 'Math.round(converter(lugar))', 'converter(lugar)'],
	publicarSemPeDaTela: [ALVO, 'vista && vista.innerHeight > 0 ? vista.innerHeight : Infinity', 'Infinity'],
	publicarSemFaixa: [ALVO, 'if (!faixa || inicio === null) {', 'if (inicio === null) {'],
	publicarSemInicio: [ALVO, 'if (!faixa || inicio === null) {', 'if (!faixa) {'],
	publicarNaoEscreve: [ALVO, 'host.style.setProperty(VARIAVEL_DO_TOPO, `${topo}px`);', ''],
	variavelRenomeada: [ALVO, "export const VARIAVEL_DO_TOPO = '--vr-aviso-topo';", "export const VARIAVEL_DO_TOPO = '--vr-aviso';"],

	// ---- acompanhar ----
	acompanharSemPrimeira: [ALVO, 'publicarTopo(host, doc, converter);\n\tlet pendente', 'let pendente'],
	acompanharSemRemedir: [ALVO, 'publicarTopo(host, doc, converter);\n\t\tpendente', 'pendente'],
	acompanharUmaVez: [ALVO, 'pendente = relogio.setTimeout(remedir, PASSO_DO_ACOMPANHAMENTO_MS);', ''],
	acompanharNaoDesliga: [ALVO, 'return () => relogio.clearTimeout(pendente);', 'return () => {};'],
	passoDe1s: [ALVO, 'PASSO_DO_ACOMPANHAMENTO_MS = 250', 'PASSO_DO_ACOMPANHAMENTO_MS = 1000'],
	soltarNaoSolta: [ALVO, '\thost.style.removeProperty(VARIAVEL_DO_TOPO);\n\thost.classList.remove(CLASSE_SOBRE_PECA);\n}', '\thost.classList.remove(CLASSE_SOBRE_PECA);\n}'],

	// ---- rodada 3: o fundo mais denso quando a faixa fica SOBRE uma peca ----
	// o aparelho que gira fica com o fundo denso
	soltarNaoTiraClasse: [ALVO, '\thost.style.removeProperty(VARIAVEL_DO_TOPO);\n\thost.classList.remove(CLASSE_SOBRE_PECA);\n}', '\thost.style.removeProperty(VARIAVEL_DO_TOPO);\n}'],
	// a faixa que deixa de ser medida fica com o fundo denso
	publicarSaiSemTirarClasse: [ALVO, '\t\thost.classList.remove(CLASSE_SOBRE_PECA);\n\t\treturn null;', '\t\treturn null;'],
	// o fundo nunca adensa (as letras do cartao voltam a aparecer sob as do aviso)
	fundoNunca: [ALVO, 'host.classList.toggle(CLASSE_SOBRE_PECA, sobrePeca);', 'host.classList.toggle(CLASSE_SOBRE_PECA, false);'],
	// o fundo adensa sempre, ate no lugar livre
	fundoSempre: [ALVO, 'host.classList.toggle(CLASSE_SOBRE_PECA, sobrePeca);', 'host.classList.toggle(CLASSE_SOBRE_PECA, true);'],
	// o fundo so olha a prioridade mais alta
	fundoSoNaMorte: [ALVO, 'custo.some(area => area > 0)', 'custo[0] > 0'],
	// o custo do fundo medido no lugar VELHO da faixa, e nao no escolhido
	fundoNoLugarVelho: [ALVO, '{ x: faixa.x, y: lugar, w: faixa.w, h: faixa.h }', '{ x: faixa.x, y: faixa.y, w: faixa.w, h: faixa.h }'],
	// a classe muda de nome e o CSS nao a acha
	classeRenomeada: [ALVO, "CLASSE_SOBRE_PECA = 'vr-aviso-sobre-peca'", "CLASSE_SOBRE_PECA = 'vr-aviso'"],

	// ---- as constantes da geometria (amarradas ao CSS) ----
	fileiraDe40: [ALVO, 'FILEIRA_DO_AVISO_DE_ITEM = 44', 'FILEIRA_DO_AVISO_DE_ITEM = 40'],
	vaoDe0: [ALVO, 'export const VAO = 4;', 'export const VAO = 0;'],
	cartaoDe240: [ALVO, 'LARGURA_DO_CARTAO = 236', 'LARGURA_DO_CARTAO = 240'],
	trilhoDe50: [ALVO, 'LARGURA_DO_TRILHO = 60', 'LARGURA_DO_TRILHO = 50'],
	margemDe4: [ALVO, 'MARGEM = 8', 'MARGEM = 4'],

	// ---- a costura no Announce.js (os sobreviventes da rodada 1 e os vizinhos) ----
	// a quebra de linha volta a ser a tela inteira (sobrevivia na rodada 1)
	componenteQuebraNaTela: [COMPONENTE, 'Math.min(500, medidas.quebra - 20)', 'Math.min(500, Renderer.width - 20)'],
	// o banner volta a ter a largura pedida (sobrevivia na rodada 1)
	componenteBannerSemTeto: [COMPONENTE, 'targetWidth = medidas.largura;', ''],
	// a altura volta a ser a pedida
	componenteAlturaFixa: [COMPONENTE, 'this.canvas.height = alturaDaFaixa(naVertical, opts.height, lines.length, fontSize);', 'this.canvas.height = opts.height || 10 + (fontSize + 5) * lines.length;'],
	componenteNuncaVertical: [COMPONENTE, 'const naVertical = ehHudVertical(document);', 'const naVertical = false;'],
	componenteSempreVertical: [COMPONENTE, 'const naVertical = ehHudVertical(document);', 'const naVertical = true;'],
	// o acompanhamento nao e guardado: vaza depois que a faixa sai (sobrevivia na rodada 1)
	componenteVazaAcompanhamento: [COMPONENTE, '_pararDeAcompanhar = acompanharNaVertical(', 'acompanharNaVertical('],
	// sem parar o acompanhamento anterior antes de reposicionar (sobrevivia na rodada 1)
	componenteSemPararAntes: [COMPONENTE, '\tpararDeAcompanhar();\n\tif (naVertical) {', '\tif (naVertical) {'],
	// a faixa que sai continua sendo medida
	componenteSemPararAoSair: [COMPONENTE, '\t}\n\tpararDeAcompanhar();\n};', '\t}\n};'],
	// o topo sai em pixel de viewport (sobrevivia na rodada 1)
	componenteSemConversor: [COMPONENTE, 'acompanharNaVertical(this._host, document, emUnidadesDaHud, Events)', 'acompanharNaVertical(this._host, document, px => px, Events)'],
	// um relogio que nunca anda: a faixa nao se remede
	componenteSemRelogio: [COMPONENTE, 'emUnidadesDaHud, Events)', 'emUnidadesDaHud, { setTimeout: () => 0, clearTimeout() {} })'],
	// o aparelho que gira fica com o topo da vertical
	componenteSemSoltar: [COMPONENTE, 'soltarDaVertical(this._host);', '']
};

const nome = process.env.RAG_MUTANTE_FAIXA;
const mutante = mutantes[nome];
if (nome && !mutante) throw new Error(`Escolha RAG_MUTANTE_FAIXA: ${Object.keys(mutantes).join(', ')}.`);

export default {
	...base,
	plugins: [
		...(mutante
			? [
					{
						name: 'faixa-de-aviso-somente-em-memoria',
						enforce: 'pre',
						transform(codigo, id) {
							if (!id.replaceAll(String.fromCharCode(92), '/').endsWith(mutante[0])) return null;
							const normalizado = codigo.replaceAll('\r\n', '\n');
							if (normalizado.split(mutante[1]).length !== 2) throw new Error(`Mutante ${nome} nao casa exatamente uma vez.`);
							return normalizado.replace(mutante[1], mutante[2]);
						}
					}
				]
			: [])
	],
	test: {
		...base.test,
		include: ['tests/ui/faixaDeAvisoNoCelular.test.js', 'tests/ui/faixaDeAvisoNoComponente.test.js']
	}
};
