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
	semAtraso: [ALVO, '\t\t}, atrasoMs);', '\t\t}, 0);'],
	// um segundo evento com a aba oculta empilha outro atraso
	empilha: [ALVO, '\t\t\tif (atraso !== null) {\n\t\t\t\treturn; // ja agendado: nao empilha um segundo\n\t\t\t}\n', ''],
	// voltar a aba antes do atraso nao cancela
	voltarNaoCancela: [ALVO, '\t\t} else {\n\t\t\tlimparTimer();\n\t\t\tif (fase === \'cedo\') {\n\t\t\t\tdesarmarCedo();\n\t\t\t}\n\t\t}', '\t\t} else {\n\t\t\tif (fase === \'cedo\') {\n\t\t\t\tdesarmarCedo();\n\t\t\t}\n\t\t}'],
	// a opcao desligada nao cancela o atraso ja agendado
	desligadaNaoCancela: [ALVO, '\t\tif (!deps.automaticaLigada()) {\n\t\t\tlimparTimer();\n', '\t\tif (!deps.automaticaLigada()) {\n'],
	// o disparo nao reconfere a visibilidade
	semReconferirAba: [ALVO, '\t\t\tif (!deps.oculta()) {\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tif (!deps.automaticaLigada()) {', '\t\t\tif (!deps.automaticaLigada()) {'],
	// o disparo nao reconfere a opcao
	semReconferirOpcao: [ALVO, '\t\t\tif (!deps.automaticaLigada()) {\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tif (fase === \'cedo\') {', '\t\t\tif (fase === \'cedo\') {'],
	// `cancelar` esquece de desagendar
	cancelarNaoDesagenda: [ALVO, '\t\t\tdesagendar(atraso);\n', ''],
	// `cancelar` esquece de zerar o estado (o gatilho nunca mais agenda)
	cancelarNaoZera: [ALVO, '\t\t\tdesagendar(atraso);\n\t\t\tatraso = null;', '\t\t\tdesagendar(atraso);'],
	// a opcao desligada ainda agenda
	// o celular volta a esperar os 14 s para armar (o iPhone congela antes)
	celularEspera: [ALVO, '\t\t\tif (naHora()) {\n\t\t\t\tentrarCedo();\n\t\t\t}\n', ''],
	// a tela preta do celular abre na hora, sem esperar os 14 s
	telaSemEspera: [ALVO, "\t\tif (fase === 'cedo') {\n\t\t\tpendente = restanteMs;\n\t\t\treturn false;\n\t\t}", "\t\tif (fase === 'cedo') {\n\t\t\treturn true;\n\t\t}"],
	// voltar antes dos 14 s nao desfaz o aviso cedo
	voltarNaoDesarmaCedo: [ALVO, '\t\t} else {\n\t\t\tlimparTimer();\n\t\t\tif (fase === \'cedo\') {\n\t\t\t\tdesarmarCedo();\n\t\t\t}\n\t\t}\n\t}', '\t\t} else {\n\t\t\tlimparTimer();\n\t\t}\n\t}'],
	// o pagehide nao arma
	semPagehide: [ALVO, "\t\tif (fase === 'livre') {\n\t\t\tentrarCedo();\n", "\t\tif (fase === 'livre') {\n"],
	// o ack tardio do sair apaga o entrar novo
	ackApagaOEntradaNova: [ALVO, "\t\tif (fase !== 'cedo') {\n\t\t\tfase = 'livre';\n\t\t\tpendente = null;\n\t\t}\n\t}\n\n\treturn", "\t\tfase = 'livre';\n\t\tpendente = null;\n\t}\n\n\treturn"],
	// a resposta tardia do entrar reabre a tela depois do sair
	ignoraDesarmando: [ALVO, "return fase !== 'desarmando';", 'return true;'],
	// A1: esconder de novo com a tela liberada volta a armar cedo (e o `sair` fecha a tela sem o botao)
	telaLiberadaRearma: [ALVO, '\t\t\tif (fase === \'liberada\') {\n\t\t\t\treturn;\n\t\t\t}\n', ''],
	// A2: o pagehide sozinho nao agenda a tela
	pagehideSemAgenda: [ALVO, '\t\t\tif (atraso === null) {\n\t\t\t\tagendarAtraso();\n\t\t\t}\n', ''],
	ignoraAOpcao: [ALVO, '\t\tif (!deps.automaticaLigada()) {\n\t\t\tlimparTimer();\n\t\t\tif (fase === \'cedo\') {\n\t\t\t\tdesarmarCedo();\n\t\t\t}\n\t\t\treturn;\n\t\t}\n', '']
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
