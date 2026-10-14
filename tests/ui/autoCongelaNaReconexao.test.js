/**
 * O "ATAQUE AUTO" QUE CONGELA (bug #17 de 13/10/2026). Relatos do Discord, 13/10/2026:
 * - NT_, 14:05: "ta rolando bug no auto battle quando o char morre e volta pra cidade com ele ativo, o estado dele
 *   congela e nao ativa nem desativa";
 * - BuGaDo, 14:22: "Se minimizar tambem buga o auto."
 *
 * O CAMINHO (medido no fio do servidor e na tela: relatorio `wt-bugs-13-10/relatorios/O-impl-r1.md`): o jogador
 * deixa o jogo caçando e sai (minimiza, ou o celular congela a aba). A conexao morre la fora; o personagem morre, volta
 * sozinho a Prontera (15 s) e a cidade desliga o Bot (`mapa-sem-bot`) - tudo mandado para a conexao MORTA. Quando ele
 * volta, a tela mostra o que viu por ultimo (o Bot ligado no campo) e o cliente so descobre a queda segundos depois
 * (a vigia de silencio). Duas falhas, a mesma familia (a conexao nova nao valia como conexao nova para o Bot):
 *
 * 1. o toque no "Ataque auto" antes de o cliente perceber a queda sai para o socket morto e NUNCA tera resposta (o
 *    servidor responde na conexao que recebeu o pedido). A reconexao nao soltava o ON/OFF em voo: o botao ficava
 *    "..." e `alternarLigado` recusava TODO toque (o menu do Bot e o "Ataque auto" sao o mesmo estado). Ate o F5;
 * 2. a reconexao nao zerava a linha de base do `statusRevision`: o aviso (`novaConexaoDoServidor`, 12/10/2026) morava
 *    no `MapRenderer.onLoad` de `onMapChange(.., true)`, e o MAPMOVE que o servidor manda logo atras do ACCEPT_ENTER2
 *    trocava esse `onLoad` antes de a carga terminar. O executor novo do servidor recomeca a revisao do zero, entao
 *    tudo o que a conexao nova dizia contava como velho: o botao seguia o estado da conexao morta (ligado na cidade,
 *    apagado com o Bot cacando) e o toque mandava o verbo certo para o servidor mas a tela nao mudava.
 *
 * A prova monta as pecas reais (`estadoDoBot.js`, `BotMenu` + `CombatCornerIdle`) e responde no formato do
 * `ZC_RAGIDLE_BOT` de `servidor/bot/protocolo-do-bot.ts` (rag-idle-master), com as revisoes que a sonda mediu. A
 * costura do aviso no motor (`onConnectionAccepted`) e cobrada em `estadoDoBotForaDeOrdem.test.js`.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { criarEstadoDoBot } from 'UI/Components/BotMenu/estadoDoBot.js';

vi.mock('Network/NetworkManager.js', () => ({
	default: { sendPacket: vi.fn(), hookPacket: vi.fn() }
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { render: vi.fn(), stop: vi.fn(), width: 1280, height: 720 } }));
vi.mock('UI/UIManager.js', () => ({ default: { showErrorBox: vi.fn(), addComponent: c => c } }));
vi.mock('DB/DBManager.js', () => ({ default: { getItemInfo: () => ({ identifiedDisplayName: 'Unknown Item' }) } }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({
	default: { addText: vi.fn(), TYPE: { ERROR: 1 << 6 }, FILTER: { PUBLIC_LOG: 1 } }
}));

const CONFIG = { v: 1, cacar: true, especiesVetadas: [], modoDeAtaque: 'skills-e-basico', raioDePercepcao: 15, skills: { geral: [], porSkill: {}, porMonstro: {} } };

function pacote(extra = {}) {
	return {
		v: 1,
		tipo: 'status',
		requestId: null,
		personagemId: 7,
		mapa: 'prt_fild08',
		ok: true,
		erro: null,
		problemas: [],
		revisao: 0,
		config: CONFIG,
		ligado: false,
		situacao: 'desligado',
		status: { codigo: 'controle-manual', alvo: null },
		statusRevision: 0,
		agora: 0,
		capacidades: { contrato: 1, versaoDaConfig: 1, limites: { raioMinimo: 3, raioMaximo: 30 }, secoes: ['cacada', 'ataque'] },
		monstros: [],
		...extra
	};
}

/** O que o servidor mandou ANTES de a conexao morrer: o Bot ligado e lutando (sonda S2, revisoes 1 a 3). */
const LIGADO_LUTANDO = { ligado: true, situacao: 'ativo', statusRevision: 3, status: { codigo: 'atacando', alvo: null } };

/**
 * O armazem gravado antes de 09/10 e o que o servidor grava no lugar quando o Salvar nao manda o bloco. Medido contra
 * a validacao do servidor (relatorio O-impl-r2): `validarArmazem(undefined)` = ARMAZEM_PADRAO
 * (`servidor/bot/config-do-bot.ts:245-254` e `:650`, rag-idle-master).
 */
const ARMAZEM_ANTIGO = { ligado: false, cidade: 'prontera', pesoAcimaDe: 80, depositar: [909], reservas: [], repor: [], tetoDeGasto: 0, voltar: true };
const ARMAZEM_PADRAO = { ligado: false, cidade: null, pesoAcimaDe: 0, depositar: [], reservas: [], repor: [], tetoDeGasto: 0, voltar: true };

describe('estadoDoBot: a conexao nova solta o que estava em voo na conexao que caiu', () => {
	function sessaoComOBotLigado() {
		const enviados = [];
		const e = criarEstadoDoBot({ enviar: c => enviados.push(c) });
		e.receber(pacote({ tipo: 'resposta', requestId: e.pedirEstado() }), 7);
		e.receber(pacote({ tipo: 'resposta', requestId: e.ligar(), ...LIGADO_LUTANDO }), 7);
		expect(e.estado().ligado).toBe(true);
		expect(e.estado().pendenteLigarDesligar).toBe(null);
		return { e, enviados };
	}

	it('o OFF que saiu para o socket morto deixa de prender o ON/OFF na conexao nova', () => {
		const { e } = sessaoComOBotLigado();
		e.desligar(); // o toque no "Ataque auto" com a conexao ja morta: nunca tera resposta
		expect(e.estado().pendenteLigarDesligar).toBe('desligar');
		e.novaConexao();
		expect(e.estado().pendenteLigarDesligar, 'o OFF da conexao morta continuou em voo').toBe(null);
		expect(e.pedidosEmVoo(), 'pedido da conexao morta segue esperando resposta').toBe(0);
	});

	it('o Salvar, o perfil e o "Salvar e Iniciar" da conexao morta tambem se soltam (mesma causa)', () => {
		const { e } = sessaoComOBotLigado();
		e.editar(c => ({ ...c, raioDePercepcao: 21 }));
		e.receber(pacote({ tipo: 'resposta', requestId: e.desligar(), ligado: false, statusRevision: 4 }), 7);
		e.aplicarELigar(); // com rascunho: aplica e so liga depois da confirmacao
		e.perfilSalvar('caca');
		expect(e.estado().pendenteAplicar).toBe(true);
		expect(e.estado().ligarAposAplicar).toBe(true);
		expect(e.estado().pendentePerfil).toBe(true);
		e.novaConexao();
		expect(e.estado().pendenteAplicar, 'o Salvar ficou "Salvando..." para sempre').toBe(false);
		expect(e.estado().ligarAposAplicar, 'o Salvar e Iniciar morto ainda ligaria depois').toBe(false);
		expect(e.estado().pendentePerfil, 'o seletor de perfil ficou travado').toBe(false);
		// O rascunho e do mesmo personagem: fica (o Salvar pode ser repetido).
		expect(e.estado().editConfig.raioDePercepcao).toBe(21);
		expect(e.estado().dirty).toBe(true);
	});

	it('a resposta atrasada de um pedido da conexao morta, se chegar, nao conta', () => {
		const { e } = sessaoComOBotLigado();
		const velho = e.desligar();
		e.novaConexao();
		const novo = e.pedirEstado();
		expect(novo).not.toBe(velho);
		expect(e.receber(pacote({ tipo: 'resposta', requestId: velho, ligado: false, statusRevision: 9 }), 7)).toBe(false);
		expect(e.estado().ligado).toBe(true);
		e.receber(pacote({ tipo: 'resposta', requestId: novo, mapa: 'prontera', ligado: false, statusRevision: 6 }), 7);
		expect(e.estado().ligado).toBe(false);
		expect(e.estado().mapa).toBe('prontera');
	});

	it('CONTROLE: na MESMA conexao (troca de mapa, morte, volta a cidade) o ON/OFF em voo segue valendo e a resposta conta', () => {
		const { e } = sessaoComOBotLigado();
		const id = e.desligar();
		// Nada de conexao nova: o servidor responde na mesma (sonda S1: a resposta sai em ordem, na cidade inclusive).
		expect(e.estado().pendenteLigarDesligar).toBe('desligar');
		e.receber(pacote({ tipo: 'resposta', requestId: id, mapa: 'prontera', ligado: false, statusRevision: 7 }), 7);
		expect(e.estado().pendenteLigarDesligar).toBe(null);
		expect(e.estado().ligado).toBe(false);
	});
});

/*
 * O SALVAR CUJA RESPOSTA MORREU COM A CONEXAO (bug #17 de 13/10/2026, ressalva 3 do critico da rodada 1): o Salvar
 * saiu, o servidor APLICOU (revisao 0 -> 1) e a resposta foi para o socket morto. A conexao nova solta o Salvar
 * (`novaConexao`) e o `pedir` traz a revisao 1 com a config IGUAL ao rascunho. Sem adotar essa config como base, a
 * janela dizia "A configuracao mudou no servidor enquanto voce editava" e o Salvar seguinte ia com a `baseRevision`
 * 0: o servidor responde `conflito-de-revisao` (servidor-mapa.ts, `pedido.baseRevision !== atual`) - um conflito
 * FALSO, porque a "outra versao" e a do proprio jogador.
 */
describe('estadoDoBot: o Salvar que o servidor aplicou com a resposta perdida na queda', () => {
	/** Sessao com a config confirmada, o rascunho editado e o Salvar que sai para o socket que ja morreu. */
	function salvarPerdido(configDoServidor = CONFIG) {
		const enviados = [];
		const e = criarEstadoDoBot({ enviar: c => enviados.push(c) });
		e.receber(pacote({ tipo: 'resposta', requestId: e.pedirEstado(), config: configDoServidor, statusRevision: 3 }), 7);
		e.editar(c => ({ ...c, raioDePercepcao: 21 }));
		e.aplicar();
		expect(enviados.at(-1)).toMatchObject({ verbo: 'aplicar', baseRevision: 0 });
		e.novaConexao();
		return { e, enviados };
	}

	it('a config que volta IGUAL ao rascunho vira a base: sem aviso de mudanca e sem conflito falso no proximo Salvar', () => {
		const { e, enviados } = salvarPerdido();
		e.receber(pacote({ tipo: 'resposta', requestId: e.pedirEstado(), revisao: 1, config: { ...CONFIG, raioDePercepcao: 21 }, statusRevision: 1 }), 7);
		expect(e.estado().mudouNoServidor, 'a janela acusa "mudou no servidor" com a config do proprio jogador').toBe(false);
		expect(e.estado().baseRevision, 'o rascunho segue apoiado na revisao que o Salvar perdido ja superou').toBe(1);
		expect(e.estado().dirty).toBe(false);
		expect(e.estado().editConfig.raioDePercepcao).toBe(21);
		// O jogador edita de novo e salva: vai com a revisao que o servidor tem (1), nao com a 0 (conflito falso).
		e.editar(c => ({ ...c, raioDePercepcao: 25 }));
		e.aplicar();
		expect(enviados.at(-1)).toMatchObject({ verbo: 'aplicar', baseRevision: 1, config: { raioDePercepcao: 25 } });
	});

	it('o armazem gravado antes de 09/10 nao conta: o Salvar nao manda o bloco e o servidor grava o padrao no lugar', () => {
		const { e, enviados } = salvarPerdido({ ...CONFIG, armazem: ARMAZEM_ANTIGO });
		expect(enviados.at(-1).config).not.toHaveProperty('armazem');
		e.receber(pacote({ tipo: 'resposta', requestId: e.pedirEstado(), revisao: 1, config: { ...CONFIG, raioDePercepcao: 21, armazem: ARMAZEM_PADRAO }, statusRevision: 1 }), 7);
		expect(e.estado().mudouNoServidor, 'o armazem que o jogador nao edita (e o Salvar nao manda) acusou mudanca').toBe(false);
		expect(e.estado().baseRevision).toBe(1);
		expect(e.estado().dirty).toBe(false);
		expect(e.estado().editConfig.armazem).toEqual(ARMAZEM_PADRAO);
	});

	it('CONTROLE: o Salvar perdido que NAO chegou ao servidor deixa o rascunho sujo, sem aviso, e o Salvar de novo vale', () => {
		const { e, enviados } = salvarPerdido();
		e.receber(pacote({ tipo: 'resposta', requestId: e.pedirEstado(), revisao: 0, config: CONFIG, statusRevision: 1 }), 7);
		expect(e.estado().dirty).toBe(true);
		expect(e.estado().mudouNoServidor).toBe(false);
		expect(e.estado().editConfig.raioDePercepcao).toBe(21);
		e.aplicar();
		expect(enviados.at(-1)).toMatchObject({ verbo: 'aplicar', baseRevision: 0, config: { raioDePercepcao: 21 } });
	});

	it('CONTROLE: a config nova DIFERENTE do rascunho continua avisando e nao apaga a edicao (o aviso de verdade)', () => {
		const { e, enviados } = salvarPerdido();
		// O Salvar nao chegou, e outra janela mudou OUTRA coisa no servidor (revisao 1).
		e.receber(pacote({ tipo: 'resposta', requestId: e.pedirEstado(), revisao: 1, config: { ...CONFIG, cacar: false }, statusRevision: 1 }), 7);
		expect(e.estado().mudouNoServidor).toBe(true);
		expect(e.estado().dirty).toBe(true);
		expect(e.estado().editConfig.raioDePercepcao).toBe(21);
		expect(e.estado().editConfig.cacar).toBe(true);
		expect(e.estado().baseRevision).toBe(0);
		// O Salvar segue com a base antiga: o servidor responde conflito e o jogador escolhe recarregar.
		e.aplicar();
		expect(enviados.at(-1)).toMatchObject({ verbo: 'aplicar', baseRevision: 0 });
	});

	/*
	 * SO O ARMAZEM SAI DA COMPARACAO (reprovacoes do critico das rodadas 2, 3 e 4): o terceiro caso de adocao de
	 * `aceitarConfigDoServidor` compara o rascunho com a config do servidor SEM o armazem, porque o Salvar nao manda o
	 * bloco e o servidor grava o padrao no lugar. Se a exclusao alargar, o rascunho que difere do servidor SO no que saiu
	 * da comparacao seria adotado em silencio: a edicao do jogador some e a config de outro aparelho entra sem aviso. O
	 * alargamento pode ser outro campo de topo, uma chave DENTRO de um campo (o rodizio geral de skills, o tipo de
	 * postura, os buffs, o `ativa` da entrada de suporte), todo interruptor `ligado`/`ligada`, a ORDEM das listas (o
	 * rodizio geral e o de cada monstro, a prioridade de pocao de HP e de SP e a de suporte) ou o que fica abaixo de certa
	 * profundidade. Tambem pode ser uma comparacao PARCIAL (o idioma do `isMatch` e do `toMatchObject`: o rascunho que
	 * "cabe" no servidor, ou o servidor que "cabe" no rascunho), que apaga o desvetar e o vetar, o tirar e o por skill, o
	 * "voltar para a Geral" e o ligar e desligar do suporte. A cena e a C4 do critico: o Salvar de A foi APLICADO (revisao
	 * 1) com a resposta perdida na queda, e depois outro aparelho gravou a revisao 2. Os casos saem de um PASSEIO pela
	 * config completa (menos o armazem): cada FOLHA trocada sozinha, cada LISTA invertida sozinha e, em cada lista e em
	 * cada objeto (a raiz tambem), um item ou uma chave A MAIS e um A MENOS (PRESENCA e TAMANHO). A rodada 4 passeava a
	 * config do teste, que nao tinha a folha `ativa` nem as duas ordens que a config REAL tem, e nunca tirava nem punha:
	 * cinco desses atalhos passavam (relatorio O-critico-r4). A rodada 5 nunca trocava `null` por lista: a comparacao que
	 * iguala o `null` (a skill em todos os monstros) a lista vazia (em nenhum) passava, e o escopo trocado pelo jogador
	 * sumia (relatorio O-critico-r5). Por isso cada folha `null` tambem vira `[]` e cada lista anulavel vira `null`.
	 */
	describe('so o armazem sai da comparacao: o rascunho que difere em qualquer folha, ordem, presenca, nulo ou vazio segue avisando', () => {
		/**
		 * Todos os campos de topo que o `pedir` devolve, povoados: os de `CONFIG_DO_BOT_PADRAO`
		 * (`servidor/bot/config-do-bot.ts:288-302`, rag-idle-master) e o `curaComoAtaque` que o `lerConfigDoBot` acrescenta
		 * (`servidor/mapa/servidor-mapa.ts:45176-45186`). O armazem e o gravado antes de 09/10. Cada recipiente tem uma
		 * forma que o servidor grava (`FORMAS_DO_SERVIDOR`), toda variante aparece e toda lista tem 2 ou mais itens. Cada
		 * folha, cada lista e cada recipiente daqui vira caso: campo novo na config entra sozinho no passeio.
		 */
		const CONFIG_COMPLETA = {
			v: 1,
			cacar: true,
			especiesVetadas: [1002, 1113],
			modoDeAtaque: 'skills-e-basico',
			raioDePercepcao: 15,
			skills: {
				geral: [{ skillId: 5, nivel: 10 }, { skillId: 7, nivel: 'aprendido' }],
				// O ESCOPO nas duas formas que o servidor grava no MESMO campo (config-do-bot.ts:77, :792-804): a 5 so nos
				// monstros da lista ("Monstros selecionados", editorPorSkill.js:163) e a 7 em todos (`null`, "Todos os alvos
				// de combate", editorPorSkill.js:160). O `[]` e o oposto do `null`: em nenhum monstro (:1040).
				porSkill: { 5: { ativa: true, especies: [1002, 1113] }, 7: { ativa: true, especies: null } },
				// O 1002 com lista propria (a ordem e a prioridade do rodizio daquele monstro, `moverSkill` com escopo de
				// especie, edicaoDeSkills.js:54) e o 1113 que herda a Geral.
				porMonstro: { 1002: { herdar: false, lista: [{ skillId: 7, nivel: 10 }, { skillId: 5, nivel: 'aprendido' }] }, 1113: { herdar: true } }
			},
			sobrevivencia: {
				pocoesHp: { itens: [501, 502], abaixoDe: 50, auto: true },
				// A ordem e a preferencia de pocao (`moverPocao(config, 'sp', ...)`, edicaoDeManutencao.js:113).
				pocoesSp: { itens: [505, 506], abaixoDe: 50, auto: true },
				descanso: { sentarHpAbaixoDe: 0, sentarSpAbaixoDe: 0, levantarEm: 100 }
			},
			suporte: {
				lista: [
					// A Bencao DESLIGADA sem sair da lista (`definirAtivaDoSuporte`, edicaoDeManutencao.js:291-298).
					{ skillId: 34, nivel: 10, destino: 'grupo', gatilho: 'manter', limiar: 0, ativa: false },
					{ skillId: 28, nivel: 10, destino: 'eu', gatilho: 'hp', limiar: 60 }
				]
			},
			coleta: { ligada: true, raio: 20, ignorar: [909, 910] },
			flechas: {
				ligada: true,
				modo: 'automatico',
				fixa: null,
				permitidas: [1750, 1751],
				porMonstro: { 1002: { modo: 'fixa', fixa: 1750 }, 1113: { modo: 'automatico' } }
			},
			postura: { tipo: 'melee-dps', fallbackMelee: false },
			armazem: ARMAZEM_ANTIGO,
			consumiveis: {
				buffs: { ligado: true, itens: [645, 656] },
				asa: { ligada: true, semAlvoPorSegundos: 10, cercadoPor: 0, hpAbaixoDe: 0, reserva: 0 }
			},
			curaComoAtaque: false
		};

		/**
		 * AS FORMAS QUE O SERVIDOR GRAVA (rag-idle-master, `servidor/bot/config-do-bot.ts` em 6bfa4bf6: o retorno de
		 * `validarConfigDoBot` e dos validadores de cada bloco). A chave e o caminho do recipiente com `*` no lugar do
		 * indice da lista e da chave do mapa (especie ou skill); o valor e `LISTA`, `MAPA` ou as chaves que o servidor
		 * escreve no objeto, na ordem em que escreve. Mais de uma forma = o servidor grava variantes, e cada uma tem de
		 * aparecer na config de teste. O armazem fica de fora, como na comparacao.
		 */
		const LISTA = 'lista';
		const MAPA = 'mapa';
		const FORMAS_DO_SERVIDOR = {
			// :836-851 e o `curaComoAtaque` que o `lerConfigDoBot` acrescenta (servidor-mapa.ts:45185)
			'': [['v', 'cacar', 'especiesVetadas', 'modoDeAtaque', 'raioDePercepcao', 'skills', 'sobrevivencia', 'suporte', 'coleta', 'flechas', 'postura', 'armazem', 'consumiveis', 'curaComoAtaque']],
			especiesVetadas: LISTA,
			skills: [['geral', 'porSkill', 'porMonstro']], // :842
			'skills.geral': LISTA,
			'skills.geral.*': [['skillId', 'nivel']], // :364
			'skills.porSkill': MAPA,
			'skills.porSkill.*': [['ativa', 'especies']], // :804 (`especies` null = toda especie, :792)
			'skills.porSkill.*.especies': LISTA,
			'skills.porMonstro': MAPA,
			'skills.porMonstro.*': [['herdar'], ['herdar', 'lista']], // :819-820: herda a Geral, ou lista propria
			'skills.porMonstro.*.lista': LISTA,
			'skills.porMonstro.*.lista.*': [['skillId', 'nivel']], // :364
			sobrevivencia: [['pocoesHp', 'pocoesSp', 'descanso']], // :436-440
			'sobrevivencia.pocoesHp': [['itens', 'abaixoDe', 'auto']], // :412
			'sobrevivencia.pocoesHp.itens': LISTA,
			'sobrevivencia.pocoesSp': [['itens', 'abaixoDe', 'auto']], // :412
			'sobrevivencia.pocoesSp.itens': LISTA,
			'sobrevivencia.descanso': [['sentarHpAbaixoDe', 'sentarSpAbaixoDe', 'levantarEm']], // :439
			suporte: [['lista']], // :515
			'suporte.lista': LISTA,
			// :506-513: ligada (sem `ativa`) ou desligada sem sair da lista (`ativa: false`, o unico valor gravado, :512)
			'suporte.lista.*': [
				['skillId', 'nivel', 'destino', 'gatilho', 'limiar'],
				['skillId', 'nivel', 'destino', 'gatilho', 'limiar', 'ativa']
			],
			coleta: [['ligada', 'raio', 'ignorar']], // :540
			'coleta.ignorar': LISTA,
			flechas: [['ligada', 'modo', 'fixa', 'permitidas', 'porMonstro']], // :587-593
			'flechas.permitidas': LISTA,
			'flechas.porMonstro': MAPA,
			'flechas.porMonstro.*': [['modo'], ['modo', 'fixa']], // :582-583
			postura: [['tipo', 'fallbackMelee']], // :731
			consumiveis: [['buffs', 'asa']], // :646
			'consumiveis.buffs': [['ligado', 'itens']], // :646
			'consumiveis.buffs.itens': LISTA,
			'consumiveis.asa': [['ligada', 'semAlvoPorSegundos', 'cercadoPor', 'hpAbaixoDe', 'reserva']] // :642
		};

		/**
		 * AS FOLHAS QUE O SERVIDOR GRAVA COMO `null` (mesmo arquivo), pelo caminho com `*`: o escopo da skill (`:77`; o
		 * validador comeca de `null` em `:792` e grava em `:804`; `null` = toda especie e `[]` = nenhuma, `:1040`) e a
		 * flecha fixa da regra geral (`:152`, `:590`). Cada uma aparece como `null` na config de teste, e nenhum outro
		 * `null`. As que tambem sao LISTA em `FORMAS_DO_SERVIDOR` sao as listas que o servidor aceita como `null`
		 * (`:793-794`: nulo ou lista de 0 a 120 especies).
		 */
		const NULOS_DO_SERVIDOR = ['skills.porSkill.*.especies', 'flechas.fixa'];
		const LISTAS_ANULAVEIS = NULOS_DO_SERVIDOR.filter(padrao => FORMAS_DO_SERVIDOR[padrao] === LISTA);

		/** A chave de `FORMAS_DO_SERVIDOR` de um caminho: `*` no lugar do indice da lista e da chave do mapa. */
		function padraoDe(caminho) {
			const padrao = [];
			for (const passo of caminho) {
				const pai = FORMAS_DO_SERVIDOR[padrao.join('.')];
				padrao.push(pai === LISTA || pai === MAPA ? '*' : passo);
			}
			return padrao.join('.');
		}

		/** Fora da comparacao: o armazem e tudo abaixo dele. */
		const doArmazem = caminho => caminho === 'armazem' || caminho.startsWith('armazem.');

		/** A ultima chave do recipiente (o ultimo indice, na lista), fora do armazem: a que o caso "a menos" tira. */
		const ultimaChave = (no, caminho) => Object.keys(no).filter(chave => !doArmazem([...caminho, chave].join('.'))).at(-1);

		/** A chave que o caso "a mais" poe num objeto. */
		const CHAVE_NOVA = 'chaveNova';

		/**
		 * O GERADOR DOS CASOS: passeia a config (menos o armazem) e devolve `[rotulo, caminho, tipo]`. Um caso por folha
		 * (`tipo` 'folha'), um por lista de 2 ou mais itens (`tipo` 'ordem') e dois por recipiente, a raiz tambem: um item
		 * ou uma chave a mais (`tipo` 'mais') e o ultimo item ou a ultima chave a menos (`tipo` 'menos'). E o NULO E O
		 * VAZIO (rodada 6): cada folha `null` vira a lista vazia (`tipo` 'vazio': o "Todos os alvos de combate" que vira
		 * "Monstros selecionados" sem nenhum), e cada lista que o servidor aceita como `null` vira `null` (`tipo` 'nulo': a
		 * volta para "Todos"). O caminho usa as chaves como texto (o indice da lista tambem), como o `JSON.stringify` as ve.
		 */
		function gerarCasos(config) {
			const casos = [];
			const passear = (no, caminho) => {
				const onde = caminho.join('.');
				if (doArmazem(onde)) return;
				if (no !== null && typeof no === 'object') {
					const rotulo = onde || '(raiz)';
					const lista = Array.isArray(no);
					if (lista && no.length >= 2) casos.push([`${rotulo} (ordem)`, caminho, 'ordem']);
					casos.push([`${rotulo} (${lista ? 'um item' : 'uma chave'} a mais)`, caminho, 'mais']);
					const ultima = ultimaChave(no, caminho);
					if (ultima !== undefined) casos.push([`${rotulo} (sem ${lista ? 'o ultimo item' : `a chave ${ultima}`})`, caminho, 'menos']);
					if (lista && LISTAS_ANULAVEIS.includes(padraoDe(caminho))) casos.push([`${rotulo} (a lista vira null)`, caminho, 'nulo']);
					for (const chave of Object.keys(no)) passear(no[chave], [...caminho, chave]);
					return;
				}
				casos.push([onde, caminho, 'folha']);
				if (no === null) casos.push([`${onde} (null vira [])`, caminho, 'vazio']);
			};
			passear(config, []);
			return casos;
		}
		const CASOS = gerarCasos(CONFIG_COMPLETA);

		/**
		 * O ORACULO DA COBERTURA, por OUTRO caminho que nao o passeio: o que o `JSON.stringify` serializa, que e
		 * exatamente o que a comparacao de `estadoDoBot.js` (`iguais`) enxerga. Devolve as folhas (caminho -> valor
		 * serializado) e as listas e objetos (caminho -> `{lista, tamanho, chaves}`).
		 */
		function oQueAComparacaoVe(config) {
			const caminhoDe = new Map();
			const folhas = new Map();
			const recipientes = new Map();
			JSON.stringify(config, function (chave, valor) {
				// A raiz chega com um embrulho que o `JSON.stringify` cria; o resto chega com o pai ja visto.
				const caminho = caminhoDe.has(this) ? [...caminhoDe.get(this), chave] : [];
				if (valor !== null && typeof valor === 'object') {
					caminhoDe.set(valor, caminho);
					recipientes.set(caminho.join('.'), { lista: Array.isArray(valor), tamanho: Object.keys(valor).length, chaves: Object.keys(valor) });
				} else if (valor !== undefined) {
					folhas.set(caminho.join('.'), JSON.stringify(valor));
				}
				return valor;
			});
			return { folhas, recipientes };
		}

		/** Os caminhos das folhas em que duas configs diferem, fora do armazem. */
		function folhasDiferentes(a, b) {
			const fa = oQueAComparacaoVe(a).folhas;
			const fb = oQueAComparacaoVe(b).folhas;
			return [...new Set([...fa.keys(), ...fb.keys()])].filter(c => !doArmazem(c) && fa.get(c) !== fb.get(c)).sort();
		}

		/** O valor que OUTRO aparelho grava na folha: booleano invertido, numero + 1, texto diferente, `null` vira numero. */
		function outroValor(valor) {
			if (typeof valor === 'boolean') return !valor;
			if (typeof valor === 'number') return valor + 1;
			if (typeof valor === 'string') return `${valor}-outro`;
			if (valor === null) return 1;
			throw new Error(`folha de tipo que o caso nao sabe trocar: ${typeof valor}`);
		}

		const valorEm = (config, caminho) => caminho.reduce((no, passo) => no[passo], config);

		/**
		 * O que OUTRO aparelho grava no caso: uma copia da config com a folha trocada, a lista invertida, ou um item (uma
		 * chave) a mais ou a menos no recipiente, o `null` que vira `[]` ou a lista que vira `null`. O item a mais e copia do
		 * ultimo: a comparacao e do cliente, entao o valor nao precisa passar na validacao do servidor.
		 */
		function comMudanca(config, caminho, tipo) {
			const copia = JSON.parse(JSON.stringify(config));
			if (tipo === 'folha' || tipo === 'vazio' || tipo === 'nulo') {
				const novo = tipo === 'vazio' ? [] : tipo === 'nulo' ? null : outroValor(valorEm(copia, caminho));
				valorEm(copia, caminho.slice(0, -1))[caminho.at(-1)] = novo;
				return copia;
			}
			const no = valorEm(copia, caminho);
			if (tipo === 'ordem') no.reverse();
			else if (Array.isArray(no) && tipo === 'mais') no.push(JSON.parse(JSON.stringify(no.at(-1) ?? 1)));
			else if (Array.isArray(no) && tipo === 'menos') no.pop();
			else if (tipo === 'mais') no[CHAVE_NOVA] = 1;
			else if (tipo === 'menos') delete no[ultimaChave(no, caminho)];
			else throw new Error(`tipo de caso desconhecido: ${tipo}`);
			return copia;
		}

		it('o passeio cobre toda folha, toda ordem, a presenca de todo recipiente e o nulo e o vazio, numa config com toda forma que o servidor grava', () => {
			const { folhas, recipientes } = oQueAComparacaoVe(CONFIG_COMPLETA);
			const dosCasos = tipo => CASOS.filter(caso => caso[2] === tipo).map(([, caminho]) => caminho.join('.'));
			const fora = [...recipientes].filter(([c]) => !doArmazem(c));
			expect(dosCasos('folha'), 'o passeio pulou folha que a comparacao enxerga').toEqual([...folhas.keys()].filter(c => !doArmazem(c)));
			expect(dosCasos('ordem'), 'lista sem o caso de ordem').toEqual(fora.filter(([, r]) => r.lista).map(([c]) => c));
			// PRESENCA E TAMANHO: todo recipiente, a raiz tambem, tem o caso de um a mais e o de um a menos.
			expect(dosCasos('mais'), 'recipiente sem o caso de um item ou uma chave a mais').toEqual(fora.map(([c]) => c));
			expect(dosCasos('menos'), 'recipiente sem o caso de um item ou uma chave a menos').toEqual(fora.map(([c]) => c));
			// Lista de 1 item nao tem caso de ordem, e recipiente vazio nao tem folha: nenhum dos dois na config de teste.
			const curtos = fora.filter(([, r]) => r.tamanho < (r.lista ? 2 : 1)).map(([c]) => c);
			expect(curtos, 'lista com menos de 2 itens ou objeto vazio na config de teste').toEqual([]);
			// TODA FORMA QUE O SERVIDOR GRAVA esta na config de teste, e nenhuma que ele nao grava: cada recipiente casa com
			// uma forma de `FORMAS_DO_SERVIDOR`, e cada forma (cada variante) aparece.
			const formaDe = ([c, r]) => {
				const padrao = padraoDe(c === '' ? [] : c.split('.'));
				const doServidor = FORMAS_DO_SERVIDOR[padrao];
				if (r.lista) return doServidor === LISTA ? padrao : `${padrao} [lista que o servidor nao grava]`;
				return doServidor === MAPA ? padrao : `${padrao} {${r.chaves.join(', ')}}`;
			};
			const esperadas = Object.entries(FORMAS_DO_SERVIDOR).flatMap(([padrao, forma]) =>
				forma === LISTA || forma === MAPA ? [padrao] : forma.map(chaves => `${padrao} {${chaves.join(', ')}}`)
			);
			expect([...new Set(fora.map(formaDe))].sort(), 'a config de teste difere das formas que o servidor grava').toEqual(esperadas.sort());
			// O `ativa` da entrada de suporte: o servidor so grava o `false` (config-do-bot.ts:512).
			expect(CONFIG_COMPLETA.suporte.lista.filter(e => 'ativa' in e).map(e => e.ativa)).toEqual([false]);
			// O NULO E O VAZIO (rodada 6): o `null` aparece em toda folha que o servidor grava como `null`, e so nelas; o
			// escopo de skill aparece nas DUAS formas (`null` e lista), que o servidor grava no mesmo campo com sentidos
			// opostos (config-do-bot.ts:1040); toda folha `null` tem o caso de virar `[]` e toda lista anulavel o de virar
			// `null`.
			const nulas = [...folhas].filter(([c, valor]) => !doArmazem(c) && valor === 'null').map(([c]) => c);
			expect([...new Set(nulas.map(c => padraoDe(c.split('.'))))].sort(), 'null fora das folhas que o servidor grava como null, ou folha anulavel sem o null').toEqual([...NULOS_DO_SERVIDOR].sort());
			const escopos = Object.values(CONFIG_COMPLETA.skills.porSkill).map(regra => (regra.especies === null ? 'null' : Array.isArray(regra.especies) ? 'lista' : typeof regra.especies));
			expect([...new Set(escopos)].sort(), 'o escopo de skill tem de aparecer como null (todos) e como lista').toEqual(['lista', 'null']);
			expect(dosCasos('vazio'), 'folha null sem o caso de virar lista vazia').toEqual(nulas);
			const anulaveis = fora.filter(([c, r]) => r.lista && LISTAS_ANULAVEIS.includes(padraoDe(c.split('.')))).map(([c]) => c);
			expect(dosCasos('nulo'), 'lista que o servidor aceita como null sem o caso de virar null').toEqual(anulaveis);
			// Todo campo de topo aparece em algum caso; o armazem e o unico que fica de fora.
			const topos = new Set(CASOS.map(([, caminho]) => caminho[0]));
			expect(Object.keys(CONFIG_COMPLETA).filter(k => !topos.has(k))).toEqual(['armazem']);
			// A config de teste nao encolhe: a rodada 6 fechou a familia com 66 folhas, 10 listas, 38 recipientes, 2 folhas
			// `null` e 1 lista anulavel.
			expect(dosCasos('folha').length, 'a config de teste perdeu folhas').toBeGreaterThanOrEqual(66);
			expect(dosCasos('ordem').length, 'a config de teste perdeu listas').toBeGreaterThanOrEqual(10);
			expect(dosCasos('mais').length, 'a config de teste perdeu recipientes').toBeGreaterThanOrEqual(38);
			expect(dosCasos('vazio').length, 'a config de teste perdeu folhas null').toBeGreaterThanOrEqual(2);
			expect(dosCasos('nulo').length, 'a config de teste perdeu listas anulaveis').toBeGreaterThanOrEqual(1);
		});

		it.each(CASOS)('%s: o rascunho que difere da config nova SO ali (e no armazem) segue com o aviso, intacto e na base velha', (rotulo, caminho, tipo) => {
			const { e, enviados } = salvarPerdido(CONFIG_COMPLETA);
			const rascunho = JSON.parse(JSON.stringify(e.estado().editConfig));
			expect(rascunho, 'o rascunho e a config completa com o raio do Salvar perdido').toEqual({ ...CONFIG_COMPLETA, raioDePercepcao: 21 });
			expect(rascunho.armazem).toEqual(ARMAZEM_ANTIGO);
			// Revisao 2: o rascunho de A (aplicado na revisao 1) com a mudanca do caso feita por outro aparelho, e o armazem
			// que o servidor gravou no lugar do antigo.
			const doServidor = { ...comMudanca(rascunho, caminho, tipo), armazem: ARMAZEM_PADRAO };
			// O caso bem formado: fora do armazem, so aquela folha muda, ou so o que esta dentro daquele recipiente.
			const diferentes = folhasDiferentes(rascunho, doServidor);
			const onde = caminho.join('.');
			if (tipo === 'folha' || tipo === 'vazio') {
				expect(diferentes, 'o caso tem de separar o rascunho do servidor numa folha so').toEqual([onde]);
			} else if (tipo === 'nulo') {
				// A lista sai inteira e a folha `null` entra no lugar dela: nada muda fora dali.
				expect(diferentes, 'o caso nao poe o null no lugar da lista').toContain(onde);
				expect(diferentes.filter(c => c !== onde && !c.startsWith(`${onde}.`)), 'o caso mudou algo fora da lista').toEqual([]);
			} else {
				const dentro = caminho.length > 0 ? `${caminho.join('.')}.` : '';
				expect(diferentes.length, 'o caso nao separa nada').toBeGreaterThan(0);
				expect(diferentes.filter(c => !c.startsWith(dentro)), 'o caso mudou algo fora do recipiente').toEqual([]);
			}
			if (tipo === 'mais' || tipo === 'menos') {
				const tamanho = config => oQueAComparacaoVe(config).recipientes.get(caminho.join('.')).tamanho;
				expect(tamanho(doServidor) - tamanho(rascunho), 'o caso tem de mudar o tamanho do recipiente em um').toBe(tipo === 'mais' ? 1 : -1);
			}
			if (tipo === 'vazio' || tipo === 'nulo') {
				// O `null` contra a lista no MESMO campo (o escopo: todos contra os da lista ou nenhum, config-do-bot.ts:1040).
				const antes = valorEm(rascunho, caminho);
				expect(tipo === 'vazio' ? antes === null : Array.isArray(antes), 'o caso parte do null (vazio) ou da lista (nulo)').toBe(true);
				expect(valorEm(doServidor, caminho), 'o outro aparelho grava a lista vazia (vazio) ou o null (nulo)').toEqual(tipo === 'vazio' ? [] : null);
			}
			const topoDoCaso = caminho.length > 0 ? caminho[0] : tipo === 'mais' ? CHAVE_NOVA : ultimaChave(rascunho, caminho);
			const topos = [...new Set([...Object.keys(rascunho), ...Object.keys(doServidor)])].filter(k => JSON.stringify(doServidor[k]) !== JSON.stringify(rascunho[k]));
			expect(topos.sort(), 'o caso tem de separar o rascunho do servidor num campo de topo so, mais o armazem').toEqual([topoDoCaso, 'armazem'].sort());
			e.receber(pacote({ tipo: 'resposta', requestId: e.pedirEstado(), revisao: 2, config: doServidor, statusRevision: 1 }), 7);
			expect(e.estado().mudouNoServidor, `o rascunho que difere do servidor em "${rotulo}" foi adotado sem aviso`).toBe(true);
			expect(e.estado().dirty).toBe(true);
			expect(e.estado().editConfig, `a edicao do jogador sumiu: "${rotulo}" do outro aparelho entrou no rascunho`).toEqual(rascunho);
			expect(e.estado().editConfig.armazem, 'o armazem do rascunho virou o do servidor').toEqual(ARMAZEM_ANTIGO);
			expect(e.estado().baseRevision, 'a base andou: o Salvar seguinte gravaria por cima do outro aparelho').toBe(0);
			expect(e.estado().serverConfig).toEqual(doServidor);
			// O Salvar seguinte vai com a base velha: o servidor responde o conflito de revisao VERDADEIRO.
			e.aplicar();
			expect(enviados.at(-1)).toMatchObject({ verbo: 'aplicar', baseRevision: 0 });
		});
	});
});

const pasta = join(__dirname, '..', '..', 'src', 'UI', 'Components');
const htmlDoMenu = readFileSync(join(pasta, 'BotMenu', 'BotMenu.html'), 'utf8');
const htmlDoBotao = readFileSync(join(pasta, 'CombatCornerIdle', 'CombatCornerIdle.html'), 'utf8');

async function montar() {
	vi.resetModules();
	localStorage.clear();
	const { default: Network } = await import('Network/NetworkManager.js');
	const { default: ChatBox } = await import('UI/Components/ChatBox/ChatBox.js');
	const { default: Session } = await import('Engine/SessionStorage.js');
	const { default: BotMenu } = await import('UI/Components/BotMenu/BotMenu.js');
	const { default: CombatCornerIdle } = await import('UI/Components/CombatCornerIdle/CombatCornerIdle.js');
	Network.sendPacket.mockClear();
	ChatBox.addText.mockClear();
	Session.GID = 7;
	BotMenu._host = document.createElement('div');
	BotMenu._host.innerHTML = htmlDoMenu;
	BotMenu._shadow = null;
	BotMenu.draggable = () => {};
	BotMenu.init();
	// D-2385: a janela FECHADA nao desenha (so guarda e suja); estes casos olham a janela aberta.
	BotMenu._host.querySelector('.bm-window').classList.add('is-open');
	const chamada = Network.hookPacket.mock.calls.filter(c => c[1] && c[1].name === 'onBotRecebido').at(-1);
	const receber = d => chamada[1]({ json: JSON.stringify(d) });
	CombatCornerIdle._host = document.createElement('div');
	CombatCornerIdle._host.innerHTML = htmlDoBotao;
	CombatCornerIdle._shadow = null;
	CombatCornerIdle.init();
	CombatCornerIdle.onAppend();
	const botao = CombatCornerIdle._host.querySelector('.cc-btn--auto');
	const enviados = () => Network.sendPacket.mock.calls.length;
	const ultimoPedido = () => JSON.parse(Network.sendPacket.mock.calls.at(-1)[0].json);
	/**
	 * A RECONEXAO como o MapEngine a faz: `onConnectionAccepted` avisa a conexao nova e chama `onMapChange(.., true)`;
	 * a troca de mapa tira a HUD (`MapRenderer.setMap` -> `UIManager.removeComponents`); o que o servidor manda durante
	 * a carga chega (`durante`); no fim da carga o `MapRenderer.onLoad` anexa o menu do Bot (que pede o estado) e o
	 * botao (que le o estado do menu).
	 */
	const reconectar = (durante = () => {}) => {
		BotMenu.novaConexaoDoServidor();
		CombatCornerIdle.onRemove();
		BotMenu.onRemove();
		durante();
		BotMenu.onAppend();
		CombatCornerIdle.onAppend();
	};
	return { BotMenu, ChatBox, botao, receber, enviados, ultimoPedido, reconectar };
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('o botao "Ataque auto" depois da conexao que caiu (os dois relatos)', () => {
	it('MINIMIZAR: o toque que saiu com a conexao morta nao trava o botao; depois da reconexao ele liga e desliga', async () => {
		const { botao, receber, enviados, ultimoPedido, reconectar } = await montar();
		receber(pacote(LIGADO_LUTANDO));
		expect(botao.classList.contains('is-on')).toBe(true);
		// Volta da aba minimizada: a tela mostra o Bot ligado; o socket morreu la fora e o toque se perde.
		botao.click();
		expect(ultimoPedido().verbo).toBe('desligar');
		expect(botao.classList.contains('is-pendente')).toBe(true);
		// A vigia de silencio derruba o socket e a reconexao entra; a economia segurou o Bot ligado no campo.
		reconectar();
		const pedir = ultimoPedido();
		expect(pedir.verbo).toBe('pedir');
		receber(pacote({ tipo: 'resposta', requestId: pedir.requestId, statusRevision: 9, ...{ ligado: true, situacao: 'ativo', status: { codigo: 'atacando', alvo: null } } }));
		expect(botao.classList.contains('is-pendente'), 'o botao ficou "..." para sempre (o defeito)').toBe(false);
		expect(botao.getAttribute('aria-busy')).toBe('false');
		expect(botao.classList.contains('is-on')).toBe(true);
		// E responde: o toque agora sai, e a resposta da conexao nova apaga o botao.
		const antes = enviados();
		botao.click();
		expect(enviados(), 'o toque nao saiu: o botao nao desativa').toBe(antes + 1);
		expect(ultimoPedido().verbo).toBe('desligar');
		receber(pacote({ tipo: 'resposta', requestId: ultimoPedido().requestId, statusRevision: 10, ligado: false }));
		expect(botao.classList.contains('is-on')).toBe(false);
		expect(botao.classList.contains('is-pendente')).toBe(false);
	});

	it('MORTE E VOLTA A CIDADE com o Bot ligado: na reconexao o botao mostra o que o servidor confirma e responde', async () => {
		const { botao, ChatBox, receber, enviados, ultimoPedido, reconectar } = await montar();
		receber(pacote(LIGADO_LUTANDO));
		// Fora da tela, o personagem morreu, voltou sozinho a Prontera e a cidade desligou o Bot: tudo para a
		// conexao morta. O jogador volta, ve o Bot ligado e toca o botao (perdido).
		botao.click();
		expect(ultimoPedido().verbo).toBe('desligar');
		reconectar();
		const pedir = ultimoPedido();
		// A conexao nova (sonda S2): Prontera, Bot desligado, revisao 6 do executor que seguiu vivo.
		receber(pacote({ tipo: 'resposta', requestId: pedir.requestId, mapa: 'prontera', statusRevision: 6, ligado: false }));
		expect(botao.classList.contains('is-on'), 'na cidade sem Bot o servidor desligou').toBe(false);
		expect(botao.classList.contains('is-pendente'), 'o estado congelou na volta a cidade (o defeito)').toBe(false);
		// O toque sai, e a recusa da cidade vai para o chat: o botao nao trava.
		const antes = enviados();
		botao.click();
		expect(enviados(), 'o toque nao saiu: o botao nao ativa').toBe(antes + 1);
		expect(ultimoPedido().verbo).toBe('ligar');
		receber(pacote({ tipo: 'resposta', requestId: ultimoPedido().requestId, mapa: 'prontera', statusRevision: 6, ok: false, erro: 'mapa-sem-bot', ligado: false }));
		expect(botao.classList.contains('is-pendente')).toBe(false);
		expect(botao.classList.contains('is-on')).toBe(false);
		expect(ChatBox.addText).toHaveBeenCalledTimes(1);
		expect(ChatBox.addText.mock.calls[0][0]).toMatch(/mapa de caça/);
		// De volta ao campo (mesma conexao), o toque liga.
		botao.click();
		expect(ultimoPedido().verbo).toBe('ligar');
		receber(pacote({ tipo: 'resposta', requestId: ultimoPedido().requestId, statusRevision: 8, ligado: true, situacao: 'ativo' }));
		expect(botao.classList.contains('is-on')).toBe(true);
	});

	it('SO A QUEDA (nenhum toque perdido): avisada no aceite, a conexao nova vale como nova e o status da entrada conta', async () => {
		const { botao, receber, ultimoPedido, reconectar } = await montar();
		// Uma sessao longa: o Bot cacou (revisao 22) e o jogador o desligou pelo botao (revisao 23), como a fase C da tela.
		receber(pacote({ ...LIGADO_LUTANDO, statusRevision: 22 }));
		botao.click();
		receber(pacote({ tipo: 'resposta', requestId: ultimoPedido().requestId, statusRevision: 23, ligado: false }));
		expect(botao.classList.contains('is-on')).toBe(false);
		// Queda e reconexao no campo: o executor NOVO liga o Bot na entrada (D-2320) e publica a revisao 1 durante a carga.
		reconectar(() => receber(pacote({ ligado: true, situacao: 'ativo', statusRevision: 1, status: { codigo: 'procurando-alvo', alvo: null } })));
		expect(botao.classList.contains('is-on'), 'o status da conexao nova contou como velho: o botao segue apagado com o Bot cacando').toBe(true);
		const pedir = ultimoPedido();
		expect(pedir.verbo).toBe('pedir');
		receber(pacote({ tipo: 'resposta', requestId: pedir.requestId, statusRevision: 2, ligado: true, situacao: 'ativo' }));
		botao.click();
		expect(ultimoPedido().verbo).toBe('desligar');
		receber(pacote({ tipo: 'resposta', requestId: ultimoPedido().requestId, statusRevision: 3, ligado: false }));
		expect(botao.classList.contains('is-on'), 'o toque desligou no servidor e a tela nao mudou').toBe(false);
	});

	it('O SALVAR APLICADO COM A RESPOSTA PERDIDA: a janela do Bot nao acusa mudanca e o Salvar seguinte sai com a revisao nova', async () => {
		const { BotMenu, receber, ultimoPedido, reconectar } = await montar();
		const q = seletor => BotMenu._host.querySelector(seletor);
		receber(pacote());
		// O jogador muda o raio e salva; o socket ja morreu, o servidor aplica e a resposta se perde.
		const raio = q('.bm-raio');
		raio.value = '21';
		raio.dispatchEvent(new Event('input'));
		q('.bm-aplicar').click();
		expect(ultimoPedido()).toMatchObject({ verbo: 'aplicar', baseRevision: 0, config: { raioDePercepcao: 21 } });
		expect(q('.bm-aplicar-texto').textContent).toBe('Salvando...');
		reconectar();
		const pedir = ultimoPedido();
		expect(pedir.verbo).toBe('pedir');
		receber(pacote({ tipo: 'resposta', requestId: pedir.requestId, revisao: 1, config: { ...CONFIG, raioDePercepcao: 21 }, statusRevision: 1 }));
		expect(q('.bm-recado').textContent, 'a janela acusa "mudou no servidor" com a config que o proprio jogador salvou').toBe('');
		expect(q('.bm-recarregar').hidden).toBe(true);
		expect(q('.bm-aplicar').disabled, 'o Salvar ja esta no servidor: nao ha rascunho').toBe(true);
		expect(q('.bm-aplicar-texto').textContent).toBe('Salvar');
		// O jogador edita de novo e salva: o pedido vai com a revisao 1 (com a 0, o servidor responde conflito).
		raio.value = '25';
		raio.dispatchEvent(new Event('input'));
		q('.bm-aplicar').click();
		expect(ultimoPedido(), 'o Salvar seguinte levaria um conflito de revisao falso').toMatchObject({ verbo: 'aplicar', baseRevision: 1, config: { raioDePercepcao: 25 } });
	});

	it('O AVISO DE VERDADE APAGA quando o servidor converge para o rascunho: a base anda e o Salvar seguinte vale', async () => {
		// A cena C13 do critico da rodada 2: a adocao do rascunho igual tambem apaga um aviso que ja estava aceso.
		const { BotMenu, receber, ultimoPedido } = await montar();
		const q = seletor => BotMenu._host.querySelector(seletor);
		receber(pacote({ config: { ...CONFIG, armazem: ARMAZEM_ANTIGO } }));
		const raio = q('.bm-raio');
		raio.value = '21';
		raio.dispatchEvent(new Event('input'));
		// Outro aparelho desliga a caca (revisao 1): o aviso de verdade acende e a edicao fica.
		receber(pacote({ revisao: 1, config: { ...CONFIG, cacar: false, armazem: ARMAZEM_PADRAO }, statusRevision: 1 }));
		expect(q('.bm-recado').textContent).toMatch(/mudou no servidor/);
		expect(q('.bm-recarregar').hidden).toBe(false);
		expect(q('.bm-aplicar').disabled).toBe(false);
		// O outro aparelho grava exatamente o rascunho desta janela (revisao 2): nao ha mais o que avisar.
		receber(pacote({ revisao: 2, config: { ...CONFIG, raioDePercepcao: 21, armazem: ARMAZEM_PADRAO }, statusRevision: 2 }));
		expect(q('.bm-recado').textContent, 'o aviso ficou preso com o rascunho igual ao servidor').toBe('');
		expect(q('.bm-recarregar').hidden, 'o Recarregar ficou preso com o rascunho igual ao servidor').toBe(true);
		expect(q('.bm-aplicar').disabled, 'a config do servidor e o rascunho: nao ha o que salvar').toBe(true);
		// O jogador edita de novo e salva: o pedido vai com a revisao 2 (com a 0, o servidor responde conflito).
		raio.value = '25';
		raio.dispatchEvent(new Event('input'));
		q('.bm-aplicar').click();
		expect(ultimoPedido()).toMatchObject({ verbo: 'aplicar', baseRevision: 2, config: { raioDePercepcao: 25 } });
	});

	it('CONTROLE: sem conexao nova (troca de mapa na mesma conexao) o botao espera a resposta do proprio pedido', async () => {
		const { botao, receber, enviados, ultimoPedido } = await montar();
		receber(pacote(LIGADO_LUTANDO));
		botao.click();
		const id = ultimoPedido().requestId;
		const antes = enviados();
		botao.click(); // segundo toque com o pedido em voo: nao manda outro
		expect(enviados()).toBe(antes);
		receber(pacote({ tipo: 'resposta', requestId: id, statusRevision: 4, ligado: false }));
		expect(botao.classList.contains('is-pendente')).toBe(false);
		expect(botao.classList.contains('is-on')).toBe(false);
	});
});
