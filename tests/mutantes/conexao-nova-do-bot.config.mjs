// Mutacao somente na memoria do Vitest: nunca altera o cliente servido pelo Vite.
//
// A CONEXAO NOVA DO BOT (bug #17 de 13/10/2026, "o auto congela e nao ativa nem desativa"): cada mutante e um jeito
// de a reconexao voltar a nao valer como conexao nova para o menu do Bot e o botao "Ataque auto" - a linha de base do
// `statusRevision` que nao zera, o pedido em voo da conexao morta que nao sai do mapa de correlacao, ou um dos
// "pendentes" (ON/OFF, Salvar, Salvar e Iniciar, perfil) que segue preso. Alvo: `estadoDoBot.novaConexao`.
// Rodada 2 (ressalva 3 do critico): o Salvar que o servidor APLICOU com a resposta perdida na queda - a config que
// volta igual ao rascunho vira a base (`aceitarConfigDoServidor`), sem o aviso "mudou no servidor" e sem o conflito
// de revisao falso no Salvar seguinte; rascunho diferente segue avisando.
// Rodada 3 (reprovacao do critico da rodada 2): a exclusao da comparacao e SO o armazem - a que alarga para outro
// campo de topo (skills, sobrevivencia, cura como ataque) adota em silencio o rascunho que difere do servidor so
// naquele campo; e a adocao apaga o aviso que ja estava aceso (o servidor convergiu para o rascunho).
// Rodada 4 (reprovacao do critico da rodada 3): o mesmo alargamento abaixo do topo - uma chave DENTRO de um campo (o
// rodizio geral de skills), todo interruptor `ligado`/`ligada`, a ORDEM das listas e o que fica abaixo do 5o nivel - e
// a adocao pela revisao seguinte a base ("so pode ser o meu Salvar"). Os testes passeiam toda folha e toda lista.
//
//   RAG_MUTANTE_CONEXAO=<nome> npx vitest run --config tests/mutantes/conexao-nova-do-bot.config.mjs
//
// Todos de uma vez (bash), contando o mutante que NAO casa como invalido:
//   for m in semZerarRevisao semSoltarEmVoo semSoltarOnOff semSoltarAplicar semSoltarLigarAposAplicar semSoltarPerfil \
//            semAdotarRascunhoIgual comparaComArmazem adotaRascunhoDiferente \
//            tiraTambemSkills tiraTambemSobrevivencia tiraTambemCuraComoAtaque adotaSemApagarOAviso \
//            tiraTambemRodizioGeral ignoraLigadoEmQualquerNivel ordemNaoConta comparaSoAte5Niveis adotaPelaRevisaoSeguinte; do
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
	],
	// rodada 3 (mutantes do critico da rodada 2): a comparacao "sem armazem" tira TAMBEM as skills - o rascunho que
	// difere do servidor so nelas e adotado sem aviso (a skill que o jogador pos some)
	tiraTambemSkills: [
		'return Object.assign({}, config, { armazem: undefined });',
		'return Object.assign({}, config, { armazem: undefined, skills: undefined });'
	],
	// rodada 3: idem, a sobrevivencia (o limiar da pocao do jogador vira o do outro aparelho sem aviso)
	tiraTambemSobrevivencia: [
		'return Object.assign({}, config, { armazem: undefined });',
		'return Object.assign({}, config, { armazem: undefined, sobrevivencia: undefined });'
	],
	// rodada 3: idem, o interruptor "Cura como ataque"
	tiraTambemCuraComoAtaque: [
		'return Object.assign({}, config, { armazem: undefined });',
		'return Object.assign({}, config, { armazem: undefined, curaComoAtaque: undefined });'
	],
	// rodada 3: adota o rascunho igual sem apagar o aviso aceso antes (estado limpo com o aviso e o Recarregar presos)
	adotaSemApagarOAviso: [
		'\t\t\ts.baseRevision = revisao;\n\t\t\ts.mudouNoServidor = false;\n',
		'\t\t\ts.baseRevision = revisao;\n'
	],
	// rodada 4 (mutantes do critico da rodada 3): a comparacao tira uma chave DENTRO de um campo de topo, o rodizio
	// geral de skills - o nivel ou a skill que o jogador pos no rodizio vira o do outro aparelho sem aviso
	tiraTambemRodizioGeral: [
		'return Object.assign({}, config, { armazem: undefined });',
		'return Object.assign({}, config, { armazem: undefined, skills: Object.assign({}, config.skills, { geral: undefined }) });'
	],
	// rodada 4: generaliza o "o servidor forca ligado = false no armazem" e ignora todo interruptor ligado/ligada (o
	// jogador desliga a coleta, outro aparelho religa, e o rascunho some)
	ignoraLigadoEmQualquerNivel: [
		'return Object.assign({}, config, { armazem: undefined });',
		"return JSON.parse(JSON.stringify(Object.assign({}, config, { armazem: undefined }), (k, v) => (k === 'ligado' || k === 'ligada' ? undefined : v)));"
	],
	// rodada 4: a comparacao deixa de ver a ORDEM das listas (rodizio de skills, prioridade de pocao e de suporte): um
	// "conserto" da normalizacao do servidor que adota em silencio a ordem de outro aparelho
	ordemNaoConta: [
		'return Object.assign({}, config, { armazem: undefined });',
		'return JSON.parse(JSON.stringify(Object.assign({}, config, { armazem: undefined }), (k, v) => (Array.isArray(v) ? v.slice().sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : JSON.stringify(a) > JSON.stringify(b) ? 1 : 0)) : v)));'
	],
	// rodada 4: a comparacao so enxerga ate o 5o nivel (o nivel da skill na lista por monstro fica no 6o)
	comparaSoAte5Niveis: [
		'return Object.assign({}, config, { armazem: undefined });',
		"return (function corta(o, d) { if (o === null || typeof o !== 'object') return o; if (d === 0) return Array.isArray(o) ? 'A' : 'O'; const r = Array.isArray(o) ? [] : {}; for (const k of Object.keys(o)) r[k] = corta(o[k], d - 1); return r; })(Object.assign({}, config, { armazem: undefined }), 5);"
	],
	// rodada 4: adota tambem quando a revisao e a seguinte a base ("so pode ser o meu Salvar"): a revisao seguinte
	// pode ser de outro aparelho, e o rascunho some
	adotaPelaRevisaoSeguinte: [
		'if (!s.dirty || s.editConfig === null || iguais(semArmazem(s.editConfig), semArmazem(config))) {',
		'if (!s.dirty || s.editConfig === null || revisao === s.baseRevision + 1 || iguais(semArmazem(s.editConfig), semArmazem(config))) {'
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
