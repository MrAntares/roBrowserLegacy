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
	 * SO O ARMAZEM SAI DA COMPARACAO (reprovacoes do critico das rodadas 2 e 3): o terceiro caso de adocao de
	 * `aceitarConfigDoServidor` compara o rascunho com a config do servidor SEM o armazem, porque o Salvar nao manda o
	 * bloco e o servidor grava o padrao no lugar. Se a exclusao alargar, o rascunho que difere do servidor SO no que saiu
	 * da comparacao seria adotado em silencio: a edicao do jogador some e a config de outro aparelho entra sem aviso. O
	 * alargamento pode ser outro campo de topo, uma chave DENTRO de um campo (o rodizio geral de skills, o tipo de
	 * postura, os buffs), todo interruptor `ligado`/`ligada`, a ORDEM das listas (o rodizio, a prioridade de pocao e de
	 * suporte) ou o que fica abaixo de certa profundidade. A rodada 3 tinha um caminho por campo de topo e 12 desses
	 * alargamentos passavam. A cena e a C4 do critico: o Salvar de A foi APLICADO (revisao 1) com a resposta perdida na
	 * queda, e depois outro aparelho gravou a revisao 2. Os casos saem de um PASSEIO pela config completa (menos o
	 * armazem): cada FOLHA trocada sozinha e cada LISTA de 2 ou mais itens invertida sozinha.
	 */
	describe('so o armazem sai da comparacao: o rascunho que difere em qualquer folha ou ordem segue avisando', () => {
		/**
		 * Todos os campos de topo que o `pedir` devolve, povoados: os de `CONFIG_DO_BOT_PADRAO`
		 * (`servidor/bot/config-do-bot.ts:288-302`, rag-idle-master) e o `curaComoAtaque` que o `lerConfigDoBot` acrescenta
		 * (`servidor/mapa/servidor-mapa.ts:45176-45186`). O armazem e o gravado antes de 09/10. Cada folha e cada lista
		 * de 2 ou mais itens daqui vira um caso: campo novo na config entra sozinho no passeio.
		 */
		const CONFIG_COMPLETA = {
			v: 1,
			cacar: true,
			especiesVetadas: [1002, 1113],
			modoDeAtaque: 'skills-e-basico',
			raioDePercepcao: 15,
			skills: {
				geral: [{ skillId: 5, nivel: 10 }, { skillId: 7, nivel: 'aprendido' }],
				porSkill: { 5: { ativa: true, especies: [1002] } },
				porMonstro: { 1002: { herdar: false, lista: [{ skillId: 7, nivel: 10 }] } }
			},
			sobrevivencia: {
				pocoesHp: { itens: [501, 502], abaixoDe: 50, auto: true },
				pocoesSp: { itens: [505], abaixoDe: 50, auto: true },
				descanso: { sentarHpAbaixoDe: 0, sentarSpAbaixoDe: 0, levantarEm: 100 }
			},
			suporte: {
				lista: [
					{ skillId: 34, nivel: 10, destino: 'grupo', gatilho: 'manter', limiar: 0 },
					{ skillId: 28, nivel: 10, destino: 'eu', gatilho: 'hp', limiar: 60 }
				]
			},
			coleta: { ligada: true, raio: 20, ignorar: [909, 910] },
			flechas: { ligada: true, modo: 'automatico', fixa: null, permitidas: [1750, 1751], porMonstro: { 1002: { modo: 'fixa', fixa: 1750 } } },
			postura: { tipo: 'melee-dps', fallbackMelee: false },
			armazem: ARMAZEM_ANTIGO,
			consumiveis: {
				buffs: { ligado: true, itens: [645, 656] },
				asa: { ligada: true, semAlvoPorSegundos: 10, cercadoPor: 0, hpAbaixoDe: 0, reserva: 0 }
			},
			curaComoAtaque: false
		};

		/** Fora da comparacao: o armazem e tudo abaixo dele. */
		const doArmazem = caminho => caminho === 'armazem' || caminho.startsWith('armazem.');

		/**
		 * O GERADOR DOS CASOS: passeia a config (menos o armazem) e devolve `[rotulo, caminho, tipo]`, um caso por folha
		 * (`tipo` 'folha') e um por lista de 2 ou mais itens (`tipo` 'ordem'). O caminho usa as chaves como texto (o
		 * indice da lista tambem), como o `JSON.stringify` as ve.
		 */
		function gerarCasos(config) {
			const casos = [];
			const passear = (no, caminho) => {
				if (doArmazem(caminho.join('.'))) return;
				if (no !== null && typeof no === 'object') {
					if (Array.isArray(no) && no.length >= 2) casos.push([`${caminho.join('.')} (ordem)`, caminho, 'ordem']);
					for (const chave of Object.keys(no)) passear(no[chave], [...caminho, chave]);
					return;
				}
				casos.push([caminho.join('.'), caminho, 'folha']);
			};
			passear(config, []);
			return casos;
		}
		const CASOS = gerarCasos(CONFIG_COMPLETA);

		/**
		 * O ORACULO DA COBERTURA, por OUTRO caminho que nao o passeio: o que o `JSON.stringify` serializa, que e
		 * exatamente o que a comparacao de `estadoDoBot.js` (`iguais`) enxerga. Devolve as folhas (caminho -> valor
		 * serializado) e as listas e objetos (caminho -> `{lista, tamanho}`).
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
					recipientes.set(caminho.join('.'), { lista: Array.isArray(valor), tamanho: Object.keys(valor).length });
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

		/** Uma copia da config com `valor` no fim do `caminho`. */
		function comValor(config, caminho, valor) {
			const copia = JSON.parse(JSON.stringify(config));
			valorEm(copia, caminho.slice(0, -1))[caminho.at(-1)] = valor;
			return copia;
		}

		it('o passeio cobre TODA folha e TODA lista de 2 ou mais itens da config, e todo campo de topo menos o armazem', () => {
			const { folhas, recipientes } = oQueAComparacaoVe(CONFIG_COMPLETA);
			const dosCasos = tipo => CASOS.filter(caso => caso[2] === tipo).map(([, caminho]) => caminho.join('.'));
			expect(dosCasos('folha'), 'o passeio pulou folha que a comparacao enxerga').toEqual([...folhas.keys()].filter(c => !doArmazem(c)));
			const listas = [...recipientes].filter(([c, r]) => !doArmazem(c) && r.lista && r.tamanho >= 2).map(([c]) => c);
			expect(dosCasos('ordem'), 'o passeio pulou lista que a comparacao enxerga').toEqual(listas);
			// Lista ou objeto VAZIO nao tem folha nem ordem: nenhum caso o exercitaria. Campo novo entra povoado.
			const vazios = [...recipientes].filter(([c, r]) => !doArmazem(c) && r.tamanho === 0).map(([c]) => c);
			expect(vazios, 'recipiente vazio na config de teste: nenhum caso o cobre').toEqual([]);
			// Todo campo de topo aparece em algum caso; o armazem e o unico que fica de fora.
			const topos = new Set(CASOS.map(([, caminho]) => caminho[0]));
			expect(Object.keys(CONFIG_COMPLETA).filter(k => !topos.has(k))).toEqual(['armazem']);
			// A config de teste nao encolhe: o oraculo do critico da rodada 3 fechou a familia com 57 folhas e 7 listas.
			expect(dosCasos('folha').length, 'a config de teste perdeu folhas').toBeGreaterThanOrEqual(57);
			expect(dosCasos('ordem').length, 'a config de teste perdeu listas').toBeGreaterThanOrEqual(7);
		});

		it.each(CASOS)('%s: o rascunho que difere da config nova SO ali (e no armazem) segue com o aviso, intacto e na base velha', (rotulo, caminho, tipo) => {
			const { e, enviados } = salvarPerdido(CONFIG_COMPLETA);
			const rascunho = JSON.parse(JSON.stringify(e.estado().editConfig));
			expect(rascunho, 'o rascunho e a config completa com o raio do Salvar perdido').toEqual({ ...CONFIG_COMPLETA, raioDePercepcao: 21 });
			expect(rascunho.armazem).toEqual(ARMAZEM_ANTIGO);
			// Revisao 2: o rascunho de A (aplicado na revisao 1) com a folha trocada ou a lista invertida por outro
			// aparelho, e o armazem que o servidor gravou no lugar do antigo.
			const atual = valorEm(rascunho, caminho);
			const novo = tipo === 'ordem' ? atual.slice().reverse() : outroValor(atual);
			const doServidor = { ...comValor(rascunho, caminho, novo), armazem: ARMAZEM_PADRAO };
			// O caso bem formado: fora do armazem, so aquela folha muda (ou so as folhas daquela lista, invertida).
			const diferentes = folhasDiferentes(rascunho, doServidor);
			if (tipo === 'folha') {
				expect(diferentes, 'o caso tem de separar o rascunho do servidor numa folha so').toEqual([caminho.join('.')]);
			} else {
				expect(diferentes.length, 'a lista invertida e igual a original: o caso nao separa nada').toBeGreaterThan(0);
				expect(diferentes.filter(c => !c.startsWith(`${caminho.join('.')}.`)), 'o caso mudou algo fora da lista').toEqual([]);
			}
			const topos = Object.keys(doServidor).filter(k => JSON.stringify(doServidor[k]) !== JSON.stringify(rascunho[k]));
			expect(topos.sort(), 'o caso tem de separar o rascunho do servidor num campo de topo so, mais o armazem').toEqual([caminho[0], 'armazem'].sort());
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
