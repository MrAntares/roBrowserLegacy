// Mutacao somente na memoria do Vitest: nunca altera o cliente servido pelo Vite.
//
// A CONEXAO NOVA DO BOT (bug #17 de 13/10/2026, "o auto congela e nao ativa nem desativa"): cada mutante e um jeito
// de a reconexao voltar a nao valer como conexao nova para o menu do Bot e o botao "Ataque auto" - a linha de base do
// `statusRevision` que nao zera, o pedido em voo da conexao morta que nao sai do mapa de correlacao, ou um dos
// "pendentes" (ON/OFF, Salvar, Salvar e Iniciar, perfil) que segue preso. Alvo: `estadoDoBot.novaConexao`.
// Rodada 2 (ressalva 3 do critico): o Salvar que o servidor APLICOU com a resposta perdida na queda - a config que
// volta igual ao rascunho vira a base (`aceitarConfigDoServidor`), sem o aviso "mudou no servidor" e sem o conflito
// de revisao falso no Salvar seguinte; rascunho diferente segue avisando.
//
//   RAG_MUTANTE_CONEXAO=<nome> npx vitest run --config tests/mutantes/conexao-nova-do-bot.config.mjs
//
// Todos de uma vez (bash), contando o mutante que NAO casa como invalido:
//   for m in semZerarRevisao semSoltarEmVoo semSoltarOnOff semSoltarAplicar semSoltarLigarAposAplicar semSoltarPerfil \
//            semAdotarRascunhoIgual comparaComArmazem adotaRascunhoDiferente; do
//     RAG_MUTANTE_CONEXAO=$m npx vitest run --config tests/mutantes/conexao-nova-do-bot.config.mjs > m.log 2>&1;
//     if grep -q "nao casa" m.log; then echo "$m INVALIDO"; elif grep -q "Tests .*failed" m.log; then echo "$m morto"; else echo "$m SOBREVIVEU"; fi; done
//
// A CHAMADA em `Engine/MapEngine.js` (o aviso no aceite, `onConnectionAccepted`) nao se mede aqui: o teste a le do
// DISCO (`estadoDoBotForaDeOrdem.test.js`). Foi medida com a mutacao no disco e restauro por copia (relatorio O-impl-r1).
import base from '../../vite.config.js';

const ALVO = 'src/UI/Components/BotMenu/estadoDoBot.js';

const mutantes = {
	// a conexao nova nao zera a linha de base (o executor novo do servidor recomeca do zero e tudo conta como velho)
	semZerarRevisao: ['\t\tnovaConexao() {\n\t\t\ts.statusRevision = -1;\n', '\t\tnovaConexao() {\n'],
	// o pedido da conexao morta segue no mapa de correlacao (a resposta velha ainda contaria)
	semSoltarEmVoo: ['\t\t\ts.statusRevision = -1;\n\t\t\temVoo.clear();\n', '\t\t\ts.statusRevision = -1;\n'],
	// o ON/OFF da conexao morta segue em voo: o botao "..." recusa todo toque (o relato)
	semSoltarOnOff: ['\t\t\temVoo.clear();\n\t\t\ts.pendenteLigarDesligar = null;\n', '\t\t\temVoo.clear();\n'],
	// o Salvar da conexao morta fica "Salvando..." para sempre
	semSoltarAplicar: ['\t\t\ts.pendenteLigarDesligar = null;\n\t\t\ts.pendenteAplicar = false;\n', '\t\t\ts.pendenteLigarDesligar = null;\n'],
	// o "Salvar e Iniciar" da conexao morta ainda ligaria o Bot depois
	semSoltarLigarAposAplicar: ['\t\t\ts.ligarAposAplicar = false;\n\t\t\ts.pendentePerfil = false;\n\t\t},', '\t\t\ts.pendentePerfil = false;\n\t\t},'],
	// o seletor de perfil fica travado
	semSoltarPerfil: ['\t\t\ts.ligarAposAplicar = false;\n\t\t\ts.pendentePerfil = false;\n\t\t},', '\t\t\ts.ligarAposAplicar = false;\n\t\t},'],
	// rodada 2: a config do servidor igual ao rascunho nao vira a base (o aviso "mudou no servidor" e o conflito falso)
	semAdotarRascunhoIgual: [
		'if (!s.dirty || s.editConfig === null || iguais(semArmazem(s.editConfig), semArmazem(config))) {',
		'if (!s.dirty || s.editConfig === null) {'
	],
	// rodada 2: o armazem (que o Salvar nao manda e o servidor troca pelo padrao) entra na comparacao
	comparaComArmazem: [
		'return Object.assign({}, config, { armazem: undefined });',
		'return Object.assign({}, config);'
	],
	// rodada 2: o rascunho DIFERENTE do servidor tambem vira a base (a edicao do jogador some sem aviso)
	adotaRascunhoDiferente: [
		'if (!s.dirty || s.editConfig === null || iguais(semArmazem(s.editConfig), semArmazem(config))) {',
		'if (!s.dirty || s.editConfig === null || true) {'
	]
};
const mutante = mutantes[process.env.RAG_MUTANTE_CONEXAO];
if (!mutante) throw new Error(`Escolha RAG_MUTANTE_CONEXAO: ${Object.keys(mutantes).join(', ')}.`);

export default {
	...base,
	plugins: [
		{
			name: 'conexao-nova-do-bot-somente-em-memoria',
			enforce: 'pre',
			transform(codigo, id) {
				if (!id.replaceAll('\\', '/').endsWith(ALVO)) return null;
				const normalizado = codigo.replaceAll('\r\n', '\n');
				if (normalizado.split(mutante[0]).length !== 2) throw new Error('Mutante nao casa exatamente uma vez.');
				return normalizado.replace(mutante[0], mutante[1]);
			}
		}
	],
	test: {
		...base.test,
		include: ['tests/ui/autoCongelaNaReconexao.test.js', 'tests/ui/estadoDoBotForaDeOrdem.test.js', 'tests/ui/botaoAtaqueAuto.test.js', 'tests/ui/estadoDoBot.test.js']
	}
};

export const NOMES = Object.keys(mutantes);
