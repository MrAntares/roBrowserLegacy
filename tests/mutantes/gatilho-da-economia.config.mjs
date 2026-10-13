// Mutacao somente na memoria do Vitest: nunca altera o cliente servido pelo Vite.
//
// O GATILHO DA ECONOMIA DE ENERGIA / MODO DESCANSO (bug #10 de 13/10/2026): cada mutante e um jeito de o aviso
// `entrar` mentir: sair sem esperar o atraso de 14 s, empilhar atrasos, nao cancelar quando a aba volta, ignorar a
// opcao desligada, nao reconferir no disparo, ou `cancelar` que nao cancela. Alvo: `Engine/gatilhoDaEconomia.js`,
// alcancado pelo jsdom com relogio falso (`tests/ui/atrasoDaEconomia.test.js`).
//
//   RAG_MUTANTE_GATILHO=<nome> npx vitest run --config tests/mutantes/gatilho-da-economia.config.mjs
//
// Um mutante MORTO faz a corrida reprovar.
import base from '../../vite.config.js';

const ALVO = 'src/Engine/gatilhoDaEconomia.js';

const mutantes = {
	// o atraso deixa de ser 14 s (volta aos 3 s de D-1394)
	atraso3s: [ALVO, 'export const MS_DE_ATRASO_ANTES_DE_ENTRAR_NA_ECONOMIA = 14000;', 'export const MS_DE_ATRASO_ANTES_DE_ENTRAR_NA_ECONOMIA = 3000;'],
	// a aba escondida avisa na hora (sem atraso de confirmacao: fechar a aba tambem armaria)
	semAtraso: [ALVO, '\t\t\t}, atrasoMs);', '\t\t\t}, 0);'],
	// um segundo evento com a aba oculta empilha outro atraso
	empilha: [ALVO, '\t\t\tif (atraso !== null) return; // ja agendado: nao empilha um segundo\n', ''],
	// voltar a aba antes do atraso nao cancela
	voltarNaoCancela: [ALVO, '\t\t} else {\n\t\t\tcancelar();\n\t\t}\n\t}\n\n\treturn', '\t\t}\n\t}\n\n\treturn'],
	// a opcao desligada nao cancela o atraso ja agendado
	desligadaNaoCancela: [ALVO, '\t\tif (!deps.automaticaLigada()) {\n\t\t\tcancelar();\n\t\t\treturn;\n\t\t}', '\t\tif (!deps.automaticaLigada()) {\n\t\t\treturn;\n\t\t}'],
	// o disparo nao reconfere a visibilidade
	semReconferirAba: [ALVO, '\t\t\t\tif (!deps.oculta()) return;\n', ''],
	// o disparo nao reconfere a opcao
	semReconferirOpcao: [ALVO, '\t\t\t\tif (!deps.automaticaLigada()) return;\n\t\t\t\tdeps.pedirEntrar();', '\t\t\t\tdeps.pedirEntrar();'],
	// `cancelar` esquece de desagendar
	cancelarNaoDesagenda: [ALVO, '\t\t\tdesagendar(atraso);\n', ''],
	// `cancelar` esquece de zerar o estado (o gatilho nunca mais agenda)
	cancelarNaoZera: [ALVO, '\t\t\tdesagendar(atraso);\n\t\t\tatraso = null;', '\t\t\tdesagendar(atraso);'],
	// a opcao desligada ainda agenda
	ignoraAOpcao: [ALVO, '\t\tif (!deps.automaticaLigada()) {\n\t\t\tcancelar();\n\t\t\treturn;\n\t\t}\n\t\tif (deps.oculta()) {', '\t\tif (deps.oculta()) {']
};
const mutante = mutantes[process.env.RAG_MUTANTE_GATILHO];
if (!mutante) throw new Error(`Escolha RAG_MUTANTE_GATILHO: ${Object.keys(mutantes).join(', ')}.`);

export default {
	...base,
	plugins: [
		{
			name: 'gatilho-da-economia-somente-em-memoria',
			enforce: 'pre',
			transform(codigo, id) {
				if (!id.replaceAll('\\', '/').endsWith(mutante[0])) return null;
				const normalizado = codigo.replaceAll('\r\n', '\n');
				if (normalizado.split(mutante[1]).length !== 2) throw new Error('Mutante nao casa exatamente uma vez.');
				return normalizado.replace(mutante[1], mutante[2]);
			}
		}
	],
	test: { ...base.test, include: ['tests/ui/atrasoDaEconomia.test.js'] }
};
