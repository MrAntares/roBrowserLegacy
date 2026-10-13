// Mutacao somente na memoria do Vitest: nunca altera o cliente servido pelo Vite.
//
// A RECUSA DO ENCAIXE DE CARTA NA FAIXA (bug #1 de 13/10/2026). Cada mutante e
// um jeito de a recusa voltar a ficar muda: nao reconhecer a fala do encaixe,
// nao reconhecer a da lista vazia, acender o aviso com qualquer fala do sistema
// ou deixar o remetente ("Sistema : ") dentro do texto da faixa.
//
//   RAG_MUTANTE_ENCARTE=<nome> npx vitest run --config tests/mutantes/recusa-do-encarte.config.mjs
//
// Um mutante MORTO faz a corrida reprovar.
import base from '../../vite.config.js';

const ALVO = 'src/UI/Components/MochilaIdle/recusaDoEncarte.js';

export const mutantes = {
	// a recusa do encaixe deixa de ser reconhecida
	semRecusaDoEncaixe: [ALVO, '\tif (recusa) {', '\tif (false) {'],
	// a lista vazia deixa de ser reconhecida
	semListaVazia: [ALVO, '\tif (semPeca) {', '\tif (false) {'],
	// qualquer fala do sistema acende o aviso
	qualquerFala: [ALVO, '\treturn null;\n}', '\treturn limpa;\n}'],
	// o remetente vaza para a faixa
	comRemetente: [ALVO, "\t\treturn 'Nao deu para encaixar a carta: ' + recusa[1].trim();", '\t\treturn limpa;'],
	// o motivo da recusa some da faixa
	semMotivo: [ALVO, "\t\treturn 'Nao deu para encaixar a carta: ' + recusa[1].trim();", "\t\treturn 'Nao deu para encaixar a carta.';"]
};

const nome = process.env.RAG_MUTANTE_ENCARTE;
const mutante = mutantes[nome];
if (nome && !mutante) throw new Error(`Escolha RAG_MUTANTE_ENCARTE: ${Object.keys(mutantes).join(', ')}.`);

export default {
	...base,
	plugins: [
		...(mutante
			? [
					{
						name: 'encarte-somente-em-memoria',
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
	test: { ...base.test, include: ['tests/ui/recusaDoEncarte.test.js'] }
};
