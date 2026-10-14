/**
 * UI/Components/BotMenu/estadoDoBot.js
 *
 * O ESTADO DO MENU DO BOT NOVO (07/10/2026, pacote "Novo Bot V5"), sem DOM e
 * sem motor: o que o servidor confirmou, o rascunho do jogador, os pedidos em
 * voo e o status operacional. A janela (`BotMenu.js`) so desenha isto.
 *
 * Contrato (servidor/bot/protocolo-do-bot.ts no rag-idle-master):
 * - `serverConfig` + `revisao`: o ultimo estado ACEITO pelo servidor;
 * - `editConfig` + `baseRevision` + `dirty`: o rascunho;
 * - `requestId` correlaciona: resposta de pedido que nao esta em voo (atrasada,
 *   de outra janela) e IGNORADA; de outro personagem tambem;
 * - `statusRevision`: status mais velho que o atual nao substitui o novo;
 * - ON/OFF e imediato e separado do Aplicar: OFF funciona com rascunho sujo e
 *   ON usa a config confirmada; a tela so afirma ligado/desligado depois da
 *   resposta;
 * - Aplicar rejeitado nao apaga o rascunho; conflito de revisao avisa e
 *   oferece recarregar.
 *
 * This file is part of the ragidle fork of ROBrowser.
 */

function clonar(v) {
	return v === null || v === undefined ? v : JSON.parse(JSON.stringify(v));
}

function iguais(a, b) {
	return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * A config sem o armazem, para comparar o que o Salvar MANDA: `aplicar` tira o bloco (a secao saiu do menu em
 * 09/10/2026) e o servidor grava o padrao no lugar (`validarArmazem` de `servidor/bot/config-do-bot.ts`). O
 * `JSON.stringify` omite a chave com `undefined` e mantem a ordem das outras.
 */
function semArmazem(config) {
	return Object.assign({}, config, { armazem: undefined });
}

/**
 * @param {{ enviar: (corpo: object) => void }} deps
 */
export function criarEstadoDoBot({ enviar }) {
	let proximoRequest = 1;
	/** @type {Map<number, string>} requestId -> verbo */
	const emVoo = new Map();
	let s = estadoVazio();

	function estadoVazio() {
		return {
			personagemId: null,
			mapa: null,
			/** O contexto do mapa (`{mapa, rotuloDoMapa, ehCidade}`); null = servidor sem o campo. */
			contexto: null,
			carregado: false,
			serverConfig: null,
			revisao: 0,
			editConfig: null,
			baseRevision: 0,
			dirty: false,
			ligado: false,
			situacao: 'desligado',
			status: { codigo: 'controle-manual', alvo: null },
			statusRevision: -1,
			capacidades: null,
			monstros: [],
			/** As skills aprendidas com `aceita` (Fase 6); null = servidor sem skills no Bot. */
			skills: null,
			/** As pocoes de cura que o personagem tem (Fase 6); null = servidor sem a lista. */
			pocoes: null,
			/** As municoes da mochila (Fase 7); null = servidor sem flechas no Bot. */
			municoes: null,
			/** A situacao da escolha de flecha (Fase 7): `{vip, manual, tetoAutomatico}`. */
			municao: null,
			/** O posto de grupo em vigor (Fase 8): `{emGrupo, posto, postoNome}`. */
			grupo: null,
			/** D3: as pocoes de velocidade (`buffs`) e a Asa de Mosca (`asa`) que o jogador pode escolher; null = servidor sem a aba. */
			consumiveis: null,
			/** D4: o diagnostico do ultimo `pedir` (`{status, sessao}`); null = nunca pediu ou servidor sem a aba. */
			diagnostico: null,
			/** Fase 9: os perfis (`{nome, classe, postura}`), o de origem da config e as cidades com Kafra. */
			perfis: [],
			perfilAtivo: null,
			cidades: [],
			pendentePerfil: false,
			pendenteLigarDesligar: null,
			pendenteAplicar: false,
			/** "Salvar e Iniciar": o ON espera a confirmacao do Aplicar (aplicar recusado nao liga). */
			ligarAposAplicar: false,
			erro: null,
			problemas: [],
			conflito: false,
			mudouNoServidor: false
		};
	}

	function pedir(verbo, extra) {
		const requestId = proximoRequest++;
		emVoo.set(requestId, verbo);
		enviar(Object.assign({ v: 1, requestId, verbo }, extra || {}));
		return requestId;
	}

	function recalcularDirty() {
		s.dirty = s.editConfig !== null && s.serverConfig !== null && !iguais(s.editConfig, s.serverConfig);
	}

	function aceitarConfigDoServidor(config, revisao) {
		const mudou = revisao !== s.revisao || !iguais(config, s.serverConfig);
		s.serverConfig = clonar(config);
		s.revisao = revisao;
		/*
		 * O RASCUNHO QUE O SERVIDOR JA TEM (bug #17 de 13/10/2026, ressalva 3 do critico): o Salvar cuja resposta
		 * morreu com a conexao (a reconexao o solta, `novaConexao`) foi APLICADO, e o `pedir` da conexao nova traz a
		 * revisao nova com a config igual ao rascunho. Sem adotar, a janela dizia "A configuracao mudou no servidor
		 * enquanto voce editava" e o Salvar seguinte ia com a `baseRevision` velha: conflito de revisao FALSO, porque
		 * a "outra versao" e a do proprio jogador. Igual ao rascunho nao ha o que avisar: vira a base. Rascunho
		 * DIFERENTE segue no aviso abaixo. (A comparacao so roda com rascunho sujo: o status chega a todo instante.)
		 */
		if (!s.dirty || s.editConfig === null || iguais(semArmazem(s.editConfig), semArmazem(config))) {
			s.editConfig = clonar(config);
			s.baseRevision = revisao;
			s.mudouNoServidor = false;
		} else if (mudou && revisao !== s.baseRevision) {
			// Nao destroi o rascunho: avisa que o servidor tem outra versao.
			s.mudouNoServidor = true;
		}
		recalcularDirty();
	}

	const api = {
		estado() {
			return s;
		},
		/** Troca de personagem / sessao: nada do anterior sobrevive (pedidos em voo morrem). */
		reiniciar() {
			emVoo.clear();
			s = estadoVazio();
		},
		/**
		 * CONEXAO NOVA COM O MESMO PERSONAGEM (12/10/2026): a reconexao e a volta do "Dormir".
		 * O servidor recria o executor do Bot quando a conexao muda, e o `statusRevision`
		 * dele RECOMECA do zero. Sem zerar a linha de base aqui, a resposta do primeiro
		 * `pedir` (revisao 1) contava como observacao VELHA diante da revisao da sessao
		 * anterior: o cliente seguia mostrando o Bot ligado com ele desligado no servidor,
		 * e o ON/OFF so mandava `desligar` ate o F5. O rascunho e a config ficam: e o mesmo
		 * personagem.
		 *
		 * E OS PEDIDOS EM VOO MORREM COM A CONEXAO (bug #17 de 13/10/2026, "o auto congela e nao
		 * ativa nem desativa"): o servidor responde na conexao que recebeu o pedido, entao o
		 * ON/OFF (ou o Salvar, o perfil) que saiu para o socket que ja tinha morrido - o jogador
		 * volta da aba minimizada e toca o botao antes de o cliente perceber a queda - nunca tera
		 * resposta. Ficava `pendenteLigarDesligar` para sempre: o botao "..." e o `alternarLigado`
		 * recusando todo toque. A conexao nova os solta; o `pedir` que o BotMenu manda em seguida
		 * traz o que o servidor confirma.
		 */
		novaConexao() {
			s.statusRevision = -1;
			emVoo.clear();
			s.pendenteLigarDesligar = null;
			s.pendenteAplicar = false;
			s.ligarAposAplicar = false;
			s.pendentePerfil = false;
		},
		pedirEstado() {
			return pedir('pedir');
		},
		ligar() {
			s.pendenteLigarDesligar = 'ligar';
			s.erro = null;
			return pedir('ligar');
		},
		desligar() {
			s.pendenteLigarDesligar = 'desligar';
			s.erro = null;
			return pedir('desligar');
		},
		/** "Retomar automatico" (Fase 7): comando imediato, fora do Aplicar; a flecha da mao deixa de valer. */
		retomarMunicao() {
			s.erro = null;
			return pedir('retomar-municao');
		},
		/** Fase 9, perfis: verbos IMEDIATOS (fora do Aplicar). Aplicar usa a revisao confirmada. */
		perfilSalvar(nome) {
			s.pendentePerfil = true;
			s.erro = null;
			return pedir('perfil-salvar', { nome });
		},
		perfilAplicar(nome) {
			s.pendentePerfil = true;
			s.erro = null;
			s.problemas = [];
			return pedir('perfil-aplicar', { nome, baseRevision: s.revisao });
		},
		perfilRenomear(nome, novoNome) {
			s.pendentePerfil = true;
			s.erro = null;
			return pedir('perfil-renomear', { nome, novoNome });
		},
		perfilExcluir(nome) {
			s.pendentePerfil = true;
			s.erro = null;
			return pedir('perfil-excluir', { nome });
		},
		/** O jogador mexeu no rascunho. `fn` recebe uma COPIA e devolve a nova. */
		editar(fn) {
			if (s.editConfig === null) {
				return;
			}
			s.editConfig = fn(clonar(s.editConfig));
			s.problemas = [];
			s.erro = null;
			recalcularDirty();
		},
		aplicar() {
			if (!s.dirty || s.pendenteAplicar || s.editConfig === null) {
				return null;
			}
			s.pendenteAplicar = true;
			s.conflito = false;
			s.problemas = [];
			s.erro = null;
			// O Armazem saiu do menu (ajustes do dono, 09/10/2026): ele nao vai no Salvar, e o servidor grava o padrao no
			// lugar (`validarArmazem(undefined)` = ARMAZEM_PADRAO em servidor/bot/config-do-bot.ts:650; o armazem sai sempre
			// desligado, :705-711). Por isso a config que volta se compara com o rascunho sem ele (`semArmazem`).
			const config = clonar(s.editConfig);
			delete config.armazem;
			return pedir('aplicar', { baseRevision: s.baseRevision, config });
		},
		/**
		 * "Salvar e Iniciar": com rascunho, aplica e SO liga quando o servidor aceitar; sem rascunho,
		 * liga direto (ON usa a config confirmada). Aplicar recusado nao liga e mantem o rascunho.
		 */
		aplicarELigar() {
			if (s.pendenteAplicar || s.pendenteLigarDesligar !== null || s.editConfig === null) {
				return null;
			}
			if (!s.dirty) {
				return s.ligado ? null : api.ligar();
			}
			s.ligarAposAplicar = true;
			return api.aplicar();
		},
		descartar() {
			s.editConfig = clonar(s.serverConfig);
			s.baseRevision = s.revisao;
			s.problemas = [];
			s.conflito = false;
			s.mudouNoServidor = false;
			s.erro = null;
			recalcularDirty();
		},
		/** Conflito: recarregar troca o rascunho pela versao do servidor (escolha explicita). */
		recarregar() {
			api.descartar();
			return pedir('pedir');
		},
		/**
		 * A resposta ou o status do servidor. Devolve `true` se mudou algo.
		 * @param {object} d o JSON v1 do `ZC_RAGIDLE_BOT`
		 * @param {number|null} personagemAtual o personagem desta sessao
		 */
		receber(d, personagemAtual) {
			if (!d || d.v !== 1) {
				return false;
			}
			if (personagemAtual !== null && personagemAtual !== undefined && d.personagemId !== personagemAtual) {
				return false;
			}
			let verbo = null;
			if (d.tipo === 'resposta') {
				if (d.requestId === null || d.requestId === undefined) {
					// Resposta sem correlacao (pedido malformado): so o erro.
					s.erro = d.erro || null;
					return true;
				}
				verbo = emVoo.get(d.requestId) || null;
				if (verbo === null) {
					return false; // atrasada ou de outro pedido: nao substitui estado novo
				}
				emVoo.delete(d.requestId);
			} else if (d.tipo === 'status') {
				if (typeof d.statusRevision === 'number' && d.statusRevision < s.statusRevision) {
					return false;
				}
			} else {
				return false;
			}
			s.personagemId = d.personagemId;
			s.mapa = d.mapa;
			if (d.contexto && typeof d.contexto === 'object') {
				s.contexto = d.contexto;
			}
			s.carregado = true;
			s.capacidades = d.capacidades || s.capacidades;
			if (Array.isArray(d.monstros)) {
				s.monstros = d.monstros;
			}
			if (Array.isArray(d.skills)) {
				s.skills = d.skills;
			}
			if (Array.isArray(d.pocoes)) {
				s.pocoes = d.pocoes;
			}
			if (Array.isArray(d.municoes)) {
				s.municoes = d.municoes;
			}
			if (d.municao && typeof d.municao === 'object') {
				s.municao = d.municao;
			}
			if (d.consumiveis && typeof d.consumiveis === 'object') {
				s.consumiveis = d.consumiveis;
			}
			// O diagnostico so vem na RESPOSTA ao `pedir` (o status nao o leva): guarda o ultimo recebido.
			if (d.diagnostico && typeof d.diagnostico === 'object') {
				s.diagnostico = d.diagnostico;
			}
			if (d.grupo && typeof d.grupo === 'object') {
				s.grupo = d.grupo;
			}
			if (Array.isArray(d.perfis)) {
				s.perfis = d.perfis;
			}
			if (d.perfilAtivo !== undefined) {
				s.perfilAtivo = d.perfilAtivo;
			}
			if (Array.isArray(d.cidades)) {
				s.cidades = d.cidades;
			}
			if (verbo !== null && verbo.indexOf('perfil-') === 0) {
				s.pendentePerfil = false;
				if (!d.ok) {
					s.erro = d.erro || 'falha';
					s.problemas = Array.isArray(d.problemas) ? d.problemas : [];
				}
			}
			const statusRevisionAntes = s.statusRevision;
			if (typeof d.statusRevision === 'number' && d.statusRevision >= s.statusRevision) {
				s.statusRevision = d.statusRevision;
				s.status = d.status || s.status;
			}
			// ligado/situacao: so a resposta do proprio ON/OFF ou o status confirmam. Uma resposta
			// atrasada com observacao mais velha (statusRevision menor) nao desfaz a mais nova.
			const observacaoVelha = typeof d.statusRevision === 'number' && d.statusRevision < statusRevisionAntes;
			if (!observacaoVelha) {
				s.ligado = !!d.ligado;
				s.situacao = d.situacao || s.situacao;
			}
			if (verbo === 'ligar' || verbo === 'desligar') {
				s.pendenteLigarDesligar = null;
				if (!d.ok) {
					s.erro = d.erro || 'falha';
				}
			}
			let ligarAgora = false;
			if (verbo === 'aplicar') {
				s.pendenteAplicar = false;
				ligarAgora = s.ligarAposAplicar && !!d.ok && !d.ligado;
				s.ligarAposAplicar = false;
				if (d.ok) {
					s.dirty = false;
					s.editConfig = null; // a de servidor entra limpa logo abaixo
					s.conflito = false;
					s.mudouNoServidor = false;
				} else {
					s.erro = d.erro || 'falha';
					s.conflito = d.erro === 'conflito-de-revisao';
					s.problemas = Array.isArray(d.problemas) ? d.problemas : [];
				}
			}
			// Revisao MAIS VELHA que a confirmada (resposta atrasada ainda em voo) nao substitui a nova.
			if (d.config && typeof d.revisao === 'number' && d.revisao >= s.revisao) {
				aceitarConfigDoServidor(d.config, d.revisao);
			}
			if (ligarAgora) {
				api.ligar();
			}
			return true;
		},
		/** As secoes com backend real (o menu nao mostra aba sem contrato). */
		secoes() {
			return (s.capacidades && Array.isArray(s.capacidades.secoes) && s.capacidades.secoes) || [];
		},
		/** Ha algum pedido de verbo em voo (para testes e para o "Enviando..."). */
		pedidosEmVoo() {
			return emVoo.size;
		}
	};
	return api;
}

/** As frases do status operacional (o servidor manda o CODIGO; o idioma traduz a frase). */
export const FRASE_DO_STATUS = Object.freeze({
	'controle-manual': 'Controle manual',
	'suspenso-manual': 'Suspenso pelo controle manual',
	'procurando-alvo': 'Procurando alvo',
	patrulhando: 'Patrulhando o mapa',
	'indo-ate-alvo': 'Indo até {alvo}',
	atacando: 'Atacando {alvo}',
	'sem-alvo-valido': 'Sem alvo válido',
	'sem-acao-viavel': 'Sem ação possível',
	'caca-desligada': 'Caça desligada',
	sentado: 'Descansando',
	morto: 'Personagem caído',
	'alvo-inalcancavel': 'Alvo fora de alcance, procurando outro',
	'falha-operacional': 'Falha operacional',
	'recuperando-hp': 'Recuperando HP',
	'recuperando-sp': 'Recuperando SP',
	curando: 'Curando',
	'mantendo-buffs': 'Mantendo buffs',
	descansando: 'Descansando',
	coletando: 'Coletando itens',
	'preparando-municao': 'Trocando de flecha',
	'sem-municao-compativel': 'Sem flecha que fira o alvo',
	'flecha-fixa-indisponivel': 'Flecha escolhida acabou',
	'alvo-imune': 'Alvo imune ao seu ataque',
	'sem-sp-para-habilidade': 'Sem SP para a habilidade',
	'habilidade-em-recarga': 'Habilidade em recarga',
	'habilidade-vetada-na-area': 'Habilidade vetada na área',
	'seguindo-lider': 'Seguindo o líder',
	apoiando: 'Apoiando o grupo',
	'indo-ao-armazem': 'Indo ao armazém',
	'guardando-itens': 'Guardando itens no armazém',
	comprando: 'Comprando na loja',
	'voltando-a-caca': 'Voltando à caça',
	'armazem-indisponivel': 'Armazém indisponível{detalhe}',
	'mantendo-pocao-de-velocidade': 'Bebendo poção de velocidade',
	'usando-asa-de-mosca': 'Usando Asa de Mosca',
	'mapa-sem-bot': 'Cidade sem Bot'
});

/**
 * A EXPLICACAO de cada status em frase de jogador (aba Avancado, D4-A3): por que o Bot esta fazendo ou nao
 * fazendo algo. Nunca id, nome interno ou arquitetura. `{alvo}` entra como na frase curta.
 */
export const EXPLICACAO_DO_STATUS = Object.freeze({
	'controle-manual': 'O Bot está desligado: você controla o personagem. Ligue o Auto Caça para ele voltar a agir.',
	'suspenso-manual': 'Você mexeu no personagem, então o Bot esperou. Ele retoma sozinho quando você parar.',
	'procurando-alvo': 'O Bot está olhando em volta e ainda não escolheu um monstro.',
	patrulhando: 'Nenhum monstro à vista: o Bot anda pelo mapa procurando o próximo alvo.',
	'indo-ate-alvo': 'O Bot escolheu {alvo} e está andando até ele.',
	atacando: 'O Bot está lutando contra {alvo}.',
	'sem-alvo-valido':
		'Nenhum monstro ao alcance serve agora: estão ignorados por você, fora do raio de busca, em luta com outro jogador ou escolhidos por outro Bot. Aumente o raio, revise os monstros ignorados ou mude de mapa.',
	'sem-acao-viavel':
		'Há monstros, mas o Bot não tem um ataque possível agora: falta SP ou flecha, ou você deixou "Só habilidades" sem nenhuma habilidade que sirva.',
	'caca-desligada': 'A caça está desligada na configuração: o Bot só mantém o que você pediu (poções, buffs, consumíveis).',
	sentado: 'O personagem está sentado, descansando.',
	morto: 'O personagem caiu. O Bot espera ele voltar.',
	'alvo-inalcancavel': 'O monstro escolhido não tem caminho até ele. O Bot tenta outro.',
	'falha-operacional': 'O Bot teve um problema e tenta de novo no próximo ciclo. Se repetir, desligue e ligue o Auto Caça.',
	'recuperando-hp': 'A vida ficou abaixo do limite que você escolheu, então o Bot bebeu uma poção.',
	'recuperando-sp': 'O SP ficou abaixo do limite que você escolheu, então o Bot bebeu uma poção.',
	curando: 'Alguém ficou abaixo do limite de cura que você escolheu e o Bot usou uma habilidade de cura.',
	'mantendo-buffs': 'Um buff acabou e o Bot o renovou.',
	descansando: 'O personagem sentou para recuperar HP ou SP, como você pediu.',
	coletando: 'O Bot está indo pegar um item do chão.',
	'preparando-municao': 'O Bot está trocando para a flecha que fere mais este monstro.',
	'sem-municao-compativel': 'Nenhuma flecha da mochila fere este monstro. O Bot procura outro alvo.',
	'flecha-fixa-indisponivel': 'A flecha que você escolheu como fixa acabou. O Bot não troca por outra sozinho.',
	'alvo-imune': 'Este monstro é imune ao ataque que você tem agora. O Bot procura outro alvo.',
	'sem-sp-para-habilidade':
		'O SP acabou e você escolheu "Só habilidades": o Bot não ataca no básico. O SP volta devagar sozinho (também em luta) ou mais rápido com uma poção de SP automática, e o Bot conjura de novo assim que der.',
	'habilidade-em-recarga': 'A habilidade ainda está em recarga. O Bot conjura de novo assim que ela ficar pronta.',
	'habilidade-vetada-na-area':
		'Há um monstro que você mandou ignorar na área da habilidade, então o Bot espera ele sair da área ou escolhe outro alvo.',
	'seguindo-lider': 'O Bot está seguindo o líder do grupo, como o seu posto pede.',
	apoiando: 'O Bot está apoiando o grupo (buffs e curas) sem atacar, como a sua postura pede.',
	'indo-ao-armazem': 'A mochila pesou ou o estoque baixou, então o Bot está indo à cidade que você escolheu.',
	'guardando-itens': 'O Bot está guardando no armazém os itens que você autorizou.',
	comprando: 'O Bot está comprando na loja o que você pediu para repor.',
	'voltando-a-caca': 'O Bot terminou na cidade e está voltando ao mapa de caça.',
	'armazem-indisponivel': 'O Bot não conseguiu fazer a ida ao armazém{detalhe}. Ele tenta de novo depois de um tempo.',
	'mantendo-pocao-de-velocidade': 'A poção de velocidade acabou de valer e o Bot bebeu a próxima da lista.',
	'usando-asa-de-mosca': 'Um dos gatilhos da Asa de Mosca disparou e o Bot a usou para mudar de lugar.',
	'mapa-sem-bot': 'Esta cidade não aceita o Bot, então ele foi desligado. Vá para um mapa de caça e ligue o Auto Caça de novo.'
});

/**
 * O status que o DETALHE refina (D-2326, pedido do dono de 13/10/2026): o servidor manda o MESMO codigo de sempre
 * (`sem-acao-viavel`, que o cliente antigo le como "Sem acao possivel") com o motivo no `detalhe`. Aqui a frase e a
 * explicacao do motivo; detalhe desconhecido cai na frase do codigo.
 */
const FRASE_POR_DETALHE = Object.freeze({
	'sem-acao-viavel:nenhuma-skill-pega-no-alvo': 'Nenhuma habilidade pega neste alvo'
});
const EXPLICACAO_POR_DETALHE = Object.freeze({
	'sem-acao-viavel:nenhuma-skill-pega-no-alvo':
		'Nenhuma habilidade da lista funciona contra este alvo agora (a Explosão Tóxica só pega com o alvo em 3/4 do HP ou menos) e, em "Só habilidades", o Bot não usa o ataque básico. Ele espera parado: troque o modo de ataque ou ponha outra habilidade na lista.'
});
function porDetalhe(tabela, status) {
	return status.detalhe ? tabela[status.codigo + ':' + status.detalhe] : undefined;
}

/** A explicacao do status, com o alvo e o detalhe no lugar. */
export function explicacaoDoStatus(status) {
	if (!status) {
		return EXPLICACAO_DO_STATUS['controle-manual'];
	}
	const refinada = porDetalhe(EXPLICACAO_POR_DETALHE, status);
	if (refinada) {
		return refinada;
	}
	const modelo = EXPLICACAO_DO_STATUS[status.codigo] || EXPLICACAO_DO_STATUS['falha-operacional'];
	const nome = status.alvo && status.alvo.nome ? status.alvo.nome : 'o alvo';
	const detalhe = status.detalhe && DETALHE_DO_ARMAZEM[status.detalhe] ? ': ' + DETALHE_DO_ARMAZEM[status.detalhe] : '';
	return modelo.replace('{alvo}', nome).replace('{detalhe}', detalhe);
}

/** O motivo curto de `armazem-indisponivel` (o servidor manda o codigo). */
const DETALHE_DO_ARMAZEM = Object.freeze({
	'sem-kafra': 'sem Kafra na cidade',
	'sem-loja': 'a loja não vende o que falta',
	'viagem-recusada': 'a viagem foi recusada',
	'sem-zeny': 'zeny insuficiente',
	'sem-progresso': 'nada mudou, nova tentativa em alguns minutos',
	'sem-caminho': 'sem caminho até o NPC'
});

export function fraseDoStatus(status) {
	if (!status) {
		return FRASE_DO_STATUS['controle-manual'];
	}
	const refinada = porDetalhe(FRASE_POR_DETALHE, status);
	if (refinada) {
		return refinada;
	}
	const modelo = FRASE_DO_STATUS[status.codigo] || FRASE_DO_STATUS['falha-operacional'];
	const nome = status.alvo && status.alvo.nome ? status.alvo.nome : 'o alvo';
	const detalhe = status.detalhe && DETALHE_DO_ARMAZEM[status.detalhe] ? ': ' + DETALHE_DO_ARMAZEM[status.detalhe] : '';
	return modelo.replace('{alvo}', nome).replace('{detalhe}', detalhe);
}

/** As frases de erro do pedido. */
export function fraseDoErro(erro) {
	switch (erro) {
		case 'conflito-de-revisao':
			return 'A configuração mudou em outro lugar. Recarregue para ver a versão atual; sua edição só é perdida se você recarregar.';
		case 'config-invalida':
			return 'Alguns campos não foram aceitos. Nada foi alterado.';
		case 'mapa-sem-bot':
			return 'Prontera não aceita o Bot. Vá para um mapa de caça para ligar o Auto Caça.';
		case 'pedido-invalido':
			return 'O servidor não entendeu o pedido. Nada foi alterado.';
		case 'config-grande':
			return 'A configuração ficou grande demais para enviar. Reduza as regras por monstro. Nada foi alterado.';
		case 'nome-invalido':
			return 'Nome de perfil inválido: use de 1 a 24 caracteres.';
		case 'nome-repetido':
			return 'Já existe um perfil com esse nome.';
		case 'perfil-inexistente':
			return 'Esse perfil não existe mais.';
		case 'limite-de-perfis':
			return 'Limite de perfis atingido. Exclua um para salvar outro.';
		case 'perfil-invalido':
			return 'Esse perfil não vale para o personagem agora. Nada foi alterado.';
		case null:
		case undefined:
			return '';
		default:
			return 'Não foi possível concluir. Tente de novo.';
	}
}
