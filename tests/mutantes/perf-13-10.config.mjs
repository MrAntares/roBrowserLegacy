// Mutacao somente na memoria do Vitest: nunca altera arquivo nenhum.
//
// A LEVA DE DESEMPENHO DO CLIENTE (D-2374, 13/10/2026). Cada mutante desfaz um
// pedaco da leva — a guarda do pet, o botao que so entra solto, a escrita que
// so escreve o que mudou, o memo da barra de vida, o interruptor da compressao
// — e alguma das baterias abaixo tem de reprovar.
//
//   RAG_MUTANTE_PERF=<nome>[,<nome>...] npx vitest run --config tests/mutantes/perf-13-10.config.mjs
//
// Um mutante MORTO faz a corrida reprovar. Varios nomes separados por virgula
// aplicam juntos (e assim que sai o "ANTES" de `fichaRepetidaNasJanelas`).
//
// O `wsproxy.js` NAO entra aqui: a ponte do teste e um processo filho que le o
// arquivo do DISCO, e a mutacao em memoria nao chega a ele. O mesmo vale para
// `equipCru`/`skillCru` abaixo: o teste deles le o FONTE por `readFileSync`,
// entao em memoria eles SOBREVIVEM de proposito — rode-os por copia no disco,
// como os da ponte (ver `docs/perf-13-10/cliente.md`).
import base from '../../vite.config.js';

const MAIN = 'src/Engine/MapEngine/Main.js';
const PET = 'src/Engine/MapEngine/falaDoPetNaFicha.js';
const BOTAO = 'src/UI/anexarAoCorpoSeSolto.js';
const EQUIP = 'src/UI/Components/Equipment/EquipmentCommon.js';
const SKILL = 'src/UI/Components/SkillList/SkillListCommon.js';
const ESCRITA = 'src/UI/escreverSeMudou.js';
const BASIC = 'src/UI/Components/BasicInfo/BasicInfoCommon.js';
const STATS = 'src/UI/Components/WinStats/WinStatsCommon.js';
const VIDA = 'src/Renderer/Entity/EntityLife.js';
const DEFLATE = 'wsproxyCompressao.js';

export const mutantes = {
	// --- o pet (Main.js e o modulo puro) ---
	nivelSemGuarda: [MAIN, '&& petComemoraONivel(nivelAnterior, amount)', ''],
	morteSemGuarda: [MAIN, 'petLamentaAMorte(hpAnterior, Session.Entity.life.hp)', 'Session.Entity.life.hp <= 1'],
	nivelIgualConta: [PET, 'novo > anterior', 'novo >= anterior'],
	nivelSemTipo: [PET, "typeof anterior === 'number' && ", ''],
	morteLimiar: [PET, 'if (hpNovo > 1) {', 'if (hpNovo >= 1) {'],
	mortoSoZero: [PET, 'hpAnterior >= 0 && hpAnterior <= 1', 'hpAnterior >= 0 && hpAnterior < 1'],
	mortoSemMenosUm: [PET, 'hpAnterior >= 0 && hpAnterior <= 1', 'hpAnterior > 0 && hpAnterior <= 1'],
	mortoSempreNovo: [PET, '\treturn !jaEstavaMorto;', '\treturn true;'],
	// --- o botao de level up ---
	botaoSempre: [BOTAO, ' || elemento.parentNode === document.body', ''],
	botaoNunca: [BOTAO, '\tdocument.body.appendChild(elemento);\n\treturn true;', '\treturn true;'],
	equipCru: [EQUIP, 'anexarAoCorpoSeSolto(_btnLevelUp);', 'document.body.appendChild(_btnLevelUp);'],
	skillCru: [SKILL, 'anexarAoCorpoSeSolto(_btnLevelUp);', 'document.body.appendChild(_btnLevelUp);'],
	// --- escrever so o que mudou ---
	textoSempre: [ESCRITA, '\tconst filho = el.firstChild;', '\tconst filho = undefined;'],
	textoVazioNulo: [ESCRITA, "valor === null || valor === undefined ? '' : String(valor)", 'String(valor)'],
	textoSemUltimo: [ESCRITA, 'filho !== null && filho === el.lastChild && ', 'filho !== null && '],
	textoSemTipo: [ESCRITA, ' && filho.nodeType === 3', ''],
	textoSemDado: [ESCRITA, ' && filho.data === texto', ''],
	textoVazioPula: [ESCRITA, '\t\tif (filho === null) {\n\t\t\treturn false;\n\t\t}', '\t\treturn false;'],
	estiloSempre: [ESCRITA, "if (atual === String(valor) || (comoOLido !== undefined && atual === comoOLido)) {", 'if (false) {'],
	estiloSemLido: [ESCRITA, ' || (comoOLido !== undefined && atual === comoOLido)', ''],
	estiloSoLido: [ESCRITA, 'atual === String(valor) || ', ''],
	tituloSempre: [ESCRITA, 'if (el.title === String(valor)) {', 'if (false) {'],
	urlComAspa: [ESCRITA, "texto.includes('\"') || ", ''],
	urlComBarra: [ESCRITA, "texto.includes('\\\\') || ", ''],
	urlComLinha: [ESCRITA, " || texto.includes('\\n')", ''],
	urlComRetorno: [ESCRITA, " || texto.includes('\\r')", ''],
	basicCru: [BASIC, "\t\t\t\troot.querySelectorAll(`.${type}_value`).forEach(el => {\n\t\t\t\t\tescreverTexto(el, val1);", "\t\t\t\troot.querySelectorAll(`.${type}_value`).forEach(el => {\n\t\t\t\t\tel.textContent = val1;"],
	basicBarraCru: [BASIC, "escreverEstilo(el, 'width', `${Math.floor(Math.min(perc, 100) * barScale)}px`);", "el.style.width = `${Math.floor(Math.min(perc, 100) * barScale)}px`;"],
	basicUrlCru: [BASIC, "escreverEstilo(el, 'backgroundImage', `url(${url})`, urlComoOLido(url));\n\t\t\t\tescreverEstilo(el, 'left'", "el.style.backgroundImage = `url(${url})`;\n\t\t\t\tescreverEstilo(el, 'left'"],
	basicPesoCru: [BASIC, "escreverTitulo(el, `${((val1 / val2) * 100).toFixed(1)}%`);\n\t\t\t\t});", "el.title = `${((val1 / val2) * 100).toFixed(1)}%`;\n\t\t\t\t});"],
	statsCru: [STATS, '\t\tescreverTexto(_root.querySelector(selector), value);', '\t\tconst el = _root.querySelector(selector);\n\t\tif (el) el.textContent = value;'],
	statsVisivelCru: [STATS, "escreverEstilo(el, 'opacity', visible ? 1 : 0);", 'el.style.opacity = visible ? 1 : 0;'],
	// --- a barra de vida ---
	vidaSempre: [VIDA, 'if (this.mesmoDesenho(tipo, hpVisivel, height)) {', 'if (false) {'],
	vidaNaoAnota: [VIDA, '\t\tthis.anotarDesenho(tipo, hpVisivel);\n', ''],
	vidaSemValido: [VIDA, '\t\t\tthis._desenhoValido &&\n', ''],
	vidaSemTipo: [VIDA, '\t\t\tthis._dTipo === tipo &&\n', ''],
	vidaSemHp: [VIDA, '\t\t\tthis._dHp === hpVisivel &&\n', ''],
	vidaSemHpMax: [VIDA, '\t\t\tthis._dHpMax === this.hp_max &&\n', ''],
	vidaSemSp: [VIDA, '\t\t\tthis._dSp === this.sp &&\n', ''],
	vidaSemSpMax: [VIDA, '\t\t\tthis._dSpMax === this.sp_max &&\n', ''],
	vidaSemAp: [VIDA, '\t\t\tthis._dAp === this.ap &&\n', ''],
	vidaSemApMax: [VIDA, '\t\t\tthis._dApMax === this.ap_max &&\n', ''],
	vidaSemFome: [VIDA, '\t\t\tthis._dFome === this.hunger &&\n', ''],
	vidaSemFomeMax: [VIDA, '\t\t\tthis._dFomeMax === this.hunger_max &&\n', ''],
	vidaSemLargura: [VIDA, '\t\t\tthis.canvas.width === 60 &&\n', ''],
	vidaSemAltura: [VIDA, ' &&\n\t\t\tthis.canvas.height === altura', ''],
	vidaContextoPerdido: [VIDA, "this.canvas.addEventListener('contextlost', () => {\n\t\t\tthis._desenhoValido = false;", "this.canvas.addEventListener('contextlost', () => {"],
	vidaContextoDevolvido: [VIDA, "this.canvas.addEventListener('contextrestored', () => {\n\t\t\tthis._desenhoValido = false;", "this.canvas.addEventListener('contextrestored', () => {"],
	// --- o interruptor da compressao (a parte pura) ---
	deflateZeroLiga: [DEFLATE, " || cru === '0'", ''],
	deflateUmDesliga: [DEFLATE, "if (cru === '1') {", 'if (false) {'],
	deflateLixoCala: [DEFLATE, '\tthrow new Error(`RAG_WS_DEFLATE=', '\treturn false;\n\tthrow new Error(`RAG_WS_DEFLATE='],
	deflateNivel: [DEFLATE, 'level: 1, memLevel: 8', 'level: 6, memLevel: 8']
};

const nomes = (process.env.RAG_MUTANTE_PERF ?? '').split(',').filter(Boolean);
for (const nome of nomes) {
	if (!mutantes[nome]) throw new Error(`Escolha RAG_MUTANTE_PERF entre: ${Object.keys(mutantes).join(', ')}.`);
}
const ativos = nomes.map(nome => [nome, ...mutantes[nome]]);

export default {
	...base,
	plugins: [
		...(base.plugins ?? []),
		...(ativos.length
			? [
					{
						name: 'perf-13-10-somente-em-memoria',
						enforce: 'pre',
						transform(codigo, id) {
							const caminho = id.replaceAll('\\', '/').split('?')[0];
							let saida = null;
							for (const [nome, alvo, de, para] of ativos) {
								if (!caminho.endsWith('/' + alvo)) continue;
								const normalizado = (saida ?? codigo).replaceAll('\r\n', '\n');
								if (normalizado.split(de).length !== 2) throw new Error(`Mutante ${nome} nao casa exatamente uma vez.`);
								saida = normalizado.replace(de, para);
							}
							return saida;
						}
					}
				]
			: [])
	],
	test: {
		...base.test,
		include: [
			'tests/ui/fichaRepetidaNoMain.test.js',
			'tests/ui/falaDoPetNaFicha.test.js',
			'tests/ui/anexarAoCorpoSeSolto.test.js',
			'tests/ui/escreverSeMudou.test.js',
			'tests/ui/fichaRepetidaNasJanelas.test.js',
			'tests/renderer/vidaSemRedesenho.test.js',
			'tests/wsproxy-comprime.test.js'
		],
		exclude: ['tests/ui/contarEscritasDeEstilo.js']
	}
};
