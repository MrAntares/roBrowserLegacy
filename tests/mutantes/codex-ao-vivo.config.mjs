// Mutacao somente na memoria do Vitest: nunca altera o cliente servido pelo Vite.
// Uso: RAG_MUTANTE_CODEX_AO_VIVO=<nome> npx vitest run --config tests/mutantes/codex-ao-vivo.config.mjs
// Cada mutante tem de REPROVAR tests/ui/codexAoVivo.test.js (D-1986).
// As LIGACOES em CodexIdle.js sao lidas do DISCO pelo teste; foram medidas com a
// mutacao no disco e restauro por copia (05/10/2026), ver o relatorio da D-1986.
import base from '../../vite.config.js';

const ALVO = 'src/UI/Components/CodexIdle/codexAoVivo.js';
const mutantes = {
	// o parcial com a versao do inteiro
	'versao-do-inteiro': ['export const VERSAO_DO_PARCIAL_DO_CODEX = 3;', 'export const VERSAO_DO_PARCIAL_DO_CODEX = 2;'],
	// a abertura sem `aberta` (o servidor nunca liga o ao vivo)
	'abre-sem-aberta': ["return { acao: 'pedir', aberta: true };", "return { acao: 'pedir' };"],
	// fechar nao desliga
	'fechar-errado': ["return { acao: 'fechar' };", "return { acao: 'pedir' };"],
	// a troca por id nao troca nada
	'nao-troca': ['porId.has(item.id) ? porId.get(item.id) : item', 'item'],
	// os desafios do parcial sao ignorados
	'sem-desafios': ['\t\tnovo.desafios = parcial.desafios;\n', ''],
	// os capitulos do parcial sao ignorados
	'sem-capitulos': ['capitulos: trocarPorId(estado.jornada.capitulos, jp.capitulos)', 'capitulos: estado.jornada.capitulos'],
	// a missao cria capitulo meio carregado no indice
	'cria-capitulo': ['if (cap && Object.prototype.hasOwnProperty.call(indice, cap)) {', 'if (cap) {'],
	// as missoes da Jornada nunca sao trocadas
	'sem-missoes-da-jornada': ['\t\tif (caps.length > 0) {', '\t\tif (false) {'],
	// o indice de antes e mutado no lugar
	'muta-o-indice': ['\t\t\tnovoIndice = { ...indice };', '\t\t\tnovoIndice = indice;'],
	// o forcar e ignorado (o relato volta: o capitulo guardado nunca e repedido)
	'ignora-forcar': ['\tif (forcar) {\n\t\treturn true;\n\t}\n', ''],
	// a varredura repede tudo
	'varredura-repede': ["return !Object.prototype.hasOwnProperty.call(missoesPorCapitulo || {}, id);", 'return true;'],
	// a pagina seguinte apaga a anterior (o defeito achado na tela)
	'pagina-apaga': ['if (!(Number(parte) > 1) || !Array.isArray(atual)) {', 'if (true) {'],
	// a repetida nao troca
	'repetida-fica': ['atual.map(m => (m && porId.has(m.id) ? porId.get(m.id) : m))', 'atual.slice()'],
	// a nova nao entra
	'nova-fica-fora': ['if (!ja.has(m && m.id)) {', 'if (false) {'],
	// sem retrato, o parcial vira o estado
	'parcial-vira-estado': ['\tif (!estado || !ehParcialDoCodex(parcial)) {', '\tif (!ehParcialDoCodex(parcial)) {']
};
const mutante = mutantes[process.env.RAG_MUTANTE_CODEX_AO_VIVO];
if (!mutante) throw new Error('Escolha RAG_MUTANTE_CODEX_AO_VIVO: ' + Object.keys(mutantes).join(', ') + '.');

export default {
	...base,
	plugins: [
		{
			name: 'codex-ao-vivo-somente-em-memoria',
			enforce: 'pre',
			transform(codigo, id) {
				if (!id.replaceAll('\\', '/').endsWith(ALVO)) return null;
				const normal = codigo.replace(/\r\n/g, '\n');
				if (normal.split(mutante[0]).length !== 2) throw new Error('Mutante nao casa exatamente uma vez.');
				return normal.replace(mutante[0], mutante[1]);
			}
		}
	],
	test: { ...base.test, include: ['tests/ui/codexAoVivo.test.js'] }
};

export const NOMES = Object.keys(mutantes);
