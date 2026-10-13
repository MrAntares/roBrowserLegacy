// Mutacao somente na memoria do Vitest: nunca altera o cliente servido pelo Vite.
//
// A FAIXA DE AVISO NO CELULAR EM PE (bug #1 de 13/10/2026). Cada mutante e um jeito de a faixa
// voltar a cair sobre a HUD: coluna mais larga que o cartao, faixa por baixo do trilho, topo sem
// a fileira do aviso de item, topo que nao acompanha o cartao, variavel que nao e escrita ou nao
// e solta, marca da vertical errada.
//
//   RAG_MUTANTE_FAIXA=<nome> npx vitest run --config tests/mutantes/faixa-de-aviso.config.mjs
//
// Um mutante MORTO faz a corrida reprovar.
import base from '../../vite.config.js';

const ALVO = 'src/UI/Components/Announce/posicaoDaFaixa.js';

export const mutantes = {
	// a coluna deixa de ser o TETO de 236 e vira o piso
	colunaMax: [ALVO, 'Math.min(LARGURA_DO_CARTAO, larguraDaTela - LARGURA_DO_TRILHO - 32)', 'Math.max(LARGURA_DO_CARTAO, larguraDaTela - LARGURA_DO_TRILHO - 32)'],
	// a coluna esquece o trilho da direita
	colunaSemTrilho: [ALVO, 'larguraDaTela - LARGURA_DO_TRILHO - 32', 'larguraDaTela - 32'],
	// o piso de 100px some da coluna
	colunaSemPiso: [ALVO, 'return Math.max(PISO, Math.min(LARGURA_DO_CARTAO,', 'return Math.max(0, Math.min(LARGURA_DO_CARTAO,'],
	// o vao livre perde o ar das margens
	livreSemAr: [ALVO, 'larguraDaTela - MARGEM - LARGURA_DO_TRILHO - MARGEM - MARGEM', 'larguraDaTela - MARGEM - LARGURA_DO_TRILHO'],
	// o piso de 100px some do vao livre
	livreSemPiso: [ALVO, 'return Math.max(PISO, larguraDaTela - MARGEM', 'return Math.max(0, larguraDaTela - MARGEM'],
	// o banner que pede largura passa por baixo do trilho
	pedidaSemTeto: [ALVO, 'return Math.min(larguraPedida, larguraLivre(larguraDaTela));', 'return larguraPedida;'],
	// a largura pedida vale sempre (a coluna nunca)
	semColuna: [ALVO, 'if (!larguraPedida) {', 'if (false) {'],
	// a coluna vale sempre (o pedido nunca)
	soColuna: [ALVO, 'if (!larguraPedida) {', 'if (true) {'],
	// o topo esquece a fileira do aviso de item
	topoSemFileira: [ALVO, 'fimDoCartao + VAO_DO_CARTAO + FILEIRA_DO_AVISO_DE_ITEM', 'fimDoCartao + VAO_DO_CARTAO'],
	// o topo cola no cartao
	topoSemVao: [ALVO, 'fimDoCartao + VAO_DO_CARTAO + FILEIRA_DO_AVISO_DE_ITEM', 'fimDoCartao + FILEIRA_DO_AVISO_DE_ITEM'],
	// o topo fracionario vira pixel quebrado
	topoSemArredondar: [ALVO, 'return Math.round(fimDoCartao + VAO_DO_CARTAO + FILEIRA_DO_AVISO_DE_ITEM);', 'return fimDoCartao + VAO_DO_CARTAO + FILEIRA_DO_AVISO_DE_ITEM;'],
	// medida invalida vira topo (NaN ou 48)
	topoSemGuarda: [ALVO, 'if (!Number.isFinite(fimDoCartao)) {', 'if (false) {'],
	// a marca da vertical e outra
	verticalMarcaErrada: [ALVO, 'classList.contains(MARCA_VERTICAL)', "classList.contains('ri-horizontal')"],
	// documento ausente estoura
	verticalSemDoc: [ALVO, 'return !!doc && !!doc.documentElement && ', 'return '],
	// cartao escondido (altura zero) conta como medida
	publicarSemAltura: [ALVO, 'caixa && caixa.height > 0 ?', 'caixa ?'],
	// a medida nao passa pelo conversor do zoom
	publicarSemConverter: [ALVO, 'converter(caixa.bottom)', 'caixa.bottom'],
	// sem cartao a variavel velha fica valendo
	publicarNaoSolta: [ALVO, 'if (topo === null) {', 'if (false) {'],
	// a variavel nunca e escrita
	publicarNaoEscreve: [ALVO, 'if (topo === null) {', 'if (true) {'],
	// o observador roda mesmo sem cartao ou sem ResizeObserver
	semGuardaDoObservador: [ALVO, "if (!cartao || typeof Observador !== 'function') {", 'if (false) {'],
	// o observador nao reposiciona
	observadorMudo: [ALVO, 'new Observador(() => publicarTopo(host, doc, converter))', 'new Observador(() => {})'],
	// o observador nao observa nada
	naoObserva: [ALVO, 'observador.observe(cartao);', ''],
	// o desligador nao desliga
	naoDesliga: [ALVO, 'return () => observador.disconnect();', 'return () => {};'],
	// soltar nao solta
	soltarNaoSolta: [ALVO, 'host.style.removeProperty(VARIAVEL_DO_TOPO);\n}', '}'],
	// a variavel muda de nome (o CSS le outra)
	variavelRenomeada: [ALVO, "export const VARIAVEL_DO_TOPO = '--vr-aviso-topo';", "export const VARIAVEL_DO_TOPO = '--vr-aviso';"],
	// o seletor do cartao nao casa mais
	seletorDoCartao: [ALVO, 'div[id^="MissoesTrackerIdle"]', 'div[id^="MissoesTracker"]'],
	// as constantes da geometria
	fileiraDe40: [ALVO, 'FILEIRA_DO_AVISO_DE_ITEM = 44', 'FILEIRA_DO_AVISO_DE_ITEM = 40'],
	vaoDe0: [ALVO, 'VAO_DO_CARTAO = 4', 'VAO_DO_CARTAO = 0'],
	cartaoDe240: [ALVO, 'LARGURA_DO_CARTAO = 236', 'LARGURA_DO_CARTAO = 240'],
	trilhoDe50: [ALVO, 'LARGURA_DO_TRILHO = 60', 'LARGURA_DO_TRILHO = 50'],
	margemDe4: [ALVO, 'MARGEM = 8', 'MARGEM = 4']
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
	test: { ...base.test, include: ['tests/ui/faixaDeAvisoNoCelular.test.js'] }
};
