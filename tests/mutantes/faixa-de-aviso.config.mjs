// Mutacao somente na memoria do Vitest: nunca altera o cliente servido pelo Vite.
//
// A FAIXA DE AVISO NO CELULAR EM PE (bug #1 de 13/10/2026, rodadas 1 e 2). Cada mutante e um jeito
// de a faixa voltar a cair sobre a HUD: coluna mais larga que o cartao, banner sem teto passando por
// baixo dos buffs, altura fixa cortando o titulo, topo que nao olha o placar do MVP ou a faixa de
// grupo, lugar fora da tela, acompanhamento que nao remede ou que vaza depois que a faixa sai, e a
// costura do `Announce.js` (a rodada 1 a vigiava lendo texto, e 5 de 6 mutantes sobreviviam).
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
	listaSemCartao: [ALVO, "\t{ nome: 'cartao-de-missoes', host: 'MissoesTrackerIdle' },\n", ''],

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
	empateVaiParaBaixo: [ALVO, 'if (area < menorArea) {', 'if (area <= menorArea) {'],
	semLugarSemInicio: [ALVO, 'let melhor = inicio;', 'let melhor = null;'],

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
	soltarNaoSolta: [ALVO, 'host.style.removeProperty(VARIAVEL_DO_TOPO);\n}', '}'],

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
