/**
 * UI/Components/HuntAnalyzer/registroDaCaca.js
 *
 * O REGISTRO das cacadas. Estado puro: sem DOM, sem rede, sem timer --
 * so contas sobre eventos que os handlers do motor JA recebem. Por isso ele
 * roda no Node dos testes sem navegador nenhum.
 *
 * ── O CICLO AUTOMATICO (D-943, 06/09/2026 — pedido do dono) ──────────────
 * A cacada deixou de ser "do primeiro evento ate o Zerar" e virou uma SESSAO
 * com ciclo de vida proprio, no modelo do Hunt Analyzer do Midgard:
 *
 *   - ENTRAR num mapa de caca INICIA a contagem sozinho (mesmo sem abate);
 *   - MORRER ou VOLTAR para a cidade TRAVA a sessao (o relogio para no
 *     instante da trava, e evento que chegue depois e ignorado);
 *   - ENTRAR de novo num mapa de caca ARQUIVA a sessao travada no historico
 *     (as 2 ultimas cacadas, mais recente primeiro) e comeca uma nova.
 *
 * Quem dirige as transicoes e `atualizarSituacao()`, chamada pelo tique de
 * 250 ms da janela (HuntAnalyzer.js roda o tique desde o append, com a janela
 * aberta OU fechada — nada se perde com ela escondida). A situacao vem de
 * duas fontes que ja existem:
 *
 *   - mapa de caca?  IdleConfig.contexto.ehCidade (servidor, a cada troca de
 *     mapa via sondarMapa). Contexto ausente ou OBSOLETO = situacao
 *     desconhecida, e situacao desconhecida NAO transiciona nada: nem trava
 *     uma cacada viva, nem inicia uma nova. E a mesma direcao de erro de
 *     `ehDropDeCaca` — na duvida, o estado fica como esta.
 *   - morto?  Session.Entity.life (hp<=0 com hp_max>0 ja visto), o MESMO
 *     criterio da DeathWindow.
 *
 * Sessao iniciada por EVENTO continua existindo como reserva: se um abate
 * chega antes de o contexto do mapa responder, a sessao nasce nele (relogio
 * a partir do evento) e ADOTA o mapa quando o contexto chegar. Descartar o
 * evento por burocracia de contexto seria sumir com drop de verdade.
 *
 * ── DE ONDE VEM CADA DADO, E O QUE ELE GARANTE ───────────────────────────
 *   - ABATE: `onAbateProprio` (Engine/MapEngine/Entity.js), o
 *     ZC_RAGIDLE_ABATE (0x0faf) que o servidor manda SO ao matador (D-2322).
 *     A identidade e o nome que o servidor deu ao mob na entrada, e na falta
 *     dele `DB.getMonsterName(mobId)`, o nome do proprio cliente -- nao ha
 *     tabela escrita aqui.
 *   - EXP: `onNotifyExp` (0x07f6), que o servidor de mapa manda A CADA ABATE
 *     em servidor/mapa/servidor-mapa.ts:1569-1573. `varID === 1` e base,
 *     `varID === 2` e classe; `expType === 0` e o abate (1 e missao, e NAO
 *     entra: nao e caca).
 *   - ITEM: `onItemPickup` (Engine/MapEngine/Item.js), o item que caiu e foi
 *     apanhado. Desde D-943 ele traz tambem o ITID, para a janela desenhar o
 *     icone do item (mesmo caminho de icone da Mochila).
 *
 * ── POR QUE UM MODULO SEPARADO, E NAO UM HOOK ────────────────────────────
 * `Network.hookPacket()` guarda UM callback por pacote
 * (Network/NetworkManager.js:210 -- `Packets.list[packet.id].callback = cb`).
 * Fisgar ZC_NOTIFY_EXP ou ZC_NOTIFY_VANISH aqui SUBSTITUIRIA em silencio os
 * handlers de Engine/MapEngine/Entity.js e apagaria o feed do canal Farm, sem
 * erro nenhum na tela. Entao o caminho e o contrario: quem ja recebe o pacote
 * chama este modulo. Uma linha em cada handler, nada sobrescrito.
 *
 * ── AS TRES COISAS QUE ELE SE RECUSA A DIZER ─────────────────────────────
 *   1. **Taxa de drop POR MONSTRO.** O pacote do item que cai nao diz de qual
 *      mob ele veio. Casar o drop com a ultima morte por proximidade de tempo
 *      seria um palpite com cara de medida -- e no spot do dono morrem ate 4
 *      bichos juntos. Entao a taxa e GLOBAL (itens por 100 abates) e diz isso
 *      no rotulo.
 *   2. **Zeny da cacada.** O servidor manda o mesmo ZC_PAR_CHANGE para o zeny
 *      do mob_db e para uma venda em loja (Engine/MapEngine/Main.js:423-427
 *      registra a ambiguidade). Sem separar, "zeny/hora da caca" seria falso.
 *      Fora, ate existir pacote que distinga.
 *   3. **Ritmo antes de haver tempo medido.** Ver `MS_MINIMOS_PARA_RITMO`.
 *
 * ── A CONTAGEM DE ABATES E A DO PROPRIO PERSONAGEM (D-2322, 13/10/2026) ──
 * Ate aqui o abate vinha do `VT.DEAD`, que conta todo mob que morre A VISTA, e
 * nao "todo mob que EU matei". A ressalva escrita aqui desde D-943 ("as duas
 * coisas coincidem porque a caca e solo") deixou de valer com os mapas
 * compartilhados, e o dono viu: *"Analise contando monstros que nao estou
 * cacando"*. O ZC_NOTIFY_EXP tambem nao servia: alem de nao carregar
 * identidade, ele chega pela partilha de EXP do grupo e pelo dano de quem nao
 * deu o golpe final. O servidor passou a dizer de quem foi o abate
 * (ZC_RAGIDLE_ABATE, so ao matador). A EXP continua sendo a que chegou ao
 * personagem, inclusive a da partilha do grupo: e EXP que ele ganhou.
 */

/**
 * Abaixo disto, a janela medida e curta demais para virar "por hora": um
 * abate aos 300 ms projetaria 12.000 abates/hora, um numero que a tela
 * mostraria com toda a seriedade. Enquanto nao ha janela medida o ritmo sai
 * como `null`, e quem desenha escreve "--".
 *
 * E a armadilha que este projeto mais repete em outra forma: criterio que
 * passa (ou numero que aparece) com amostra vazia.
 */
export const MS_MINIMOS_PARA_RITMO = 10_000;

/** Quantas cacadas ENCERRADAS o historico guarda (as 2 abas "anteriores"). */
export const HISTORICO_MAX = 2;

const MS_POR_HORA = 3_600_000;

/** Dono do registro. Trocar de personagem sem recarregar zera tudo. */
let _dono = null;

/**
 * A cacada corrente: viva (`fim === null`) ou travada (`fim` cravado no
 * instante da trava). `null` quando nao ha cacada nenhuma (ex.: logou na
 * cidade e ainda nao viajou).
 */
let _sessao = null;

/**
 * As cacadas ENCERRADAS, mais recente primeiro, ja em formato de retrato
 * (o mesmo shape que `ler()` devolve) -- congelar o retrato no arquivamento
 * evita guardar Maps vivos que alguem pudesse mutar depois.
 */
let _historico = [];

function novaSessao(agora, mapa, rotuloDoMapa) {
	return {
		inicio: agora,
		fim: null,
		/* 'morte' | 'cidade' | 'mapa' (pulou direto para outro mapa de caca). */
		motivoDoFim: null,
		mapa: mapa || null,
		rotuloDoMapa: rotuloDoMapa || null,
		ultimo: null,
		/* nome -> { abates, mobId } — o mobId e o primeiro visto para o nome
		   (mesma especie = mesmo id) e e o que deixa a janela desenhar o
		   avatar do monstro, como o Mapa de Caca ja faz. */
		abatesPorMonstro: new Map(),
		abatesTotal: 0,
		expBase: 0,
		expClasse: 0,
		/* nome -> { quantidade, itid } — o itid e o primeiro visto para o
		   nome (o mesmo item chega sempre com o mesmo id; guardar um basta
		   para a janela pedir o icone). */
		itens: new Map()
	};
}

/**
 * Troca de personagem zera TUDO: sessao e historico sao por personagem.
 *
 * GID INVALIDO (`null`/`undefined`/`-1`) NUNCA CONTA COMO TROCA (D-1385,
 * 13/09/2026) — `-1` e o valor TRANSITORIO que `Entity.clean()` poe no GID
 * durante a limpeza de entidades de toda troca de mapa (`Engine/MapEngine.js`,
 * comentario ao lado de `Session.Entity.set({..., GID: Session.AID})`), antes
 * do valor certo ser restaurado. Nao ha janela de corrida hoje para o tique de
 * 250ms ler esse `-1` (a limpeza e a restauracao sao sincronas), mas tratar
 * qualquer GID invalido como "personagem novo" e uma fragilidade real —
 * confundir isso com troca de personagem apagaria sessao e historico de
 * verdade, e nao so pausaria a contagem.
 */
function garantirDono(gid) {
	if (gid === null || gid === undefined || gid === -1) {
		return;
	}
	if (_dono !== gid) {
		zerar();
		_dono = gid;
	}
}

/**
 * Um evento de caca aconteceu. Devolve a sessao que deve receber o evento,
 * ou `null` se o evento deve ser IGNORADO (sessao travada: a cacada acabou,
 * e um mob morrendo a vista do cadaver nao pertence a ela).
 *
 * Sem sessao nenhuma, o evento ABRE uma (relogio a partir dele): e a reserva
 * para o contexto do mapa que ainda nao chegou -- descartar seria sumir com
 * drop de verdade, na direcao de erro que ninguem ve.
 */
function marcar(gid, agora) {
	garantirDono(gid);
	if (_sessao && _sessao.fim !== null) {
		return null;
	}
	if (!_sessao) {
		_sessao = novaSessao(agora, null, null);
	}
	_sessao.ultimo = agora;
	return _sessao;
}

function congelar(motivo, agora) {
	if (_sessao && _sessao.fim === null) {
		_sessao.fim = agora;
		_sessao.motivoDoFim = motivo;
	}
}

/**
 * Sessao travada vira historico -- mas so se tiver ALGUM evento. Entrar no
 * mapa, olhar a paisagem e voltar nao e uma cacada: um retrato todo zerado
 * expulsaria uma cacada de verdade das 2 vagas.
 */
function arquivarSeTeveEventos(agora) {
	if (!_sessao) {
		return;
	}
	const teveEvento =
		_sessao.abatesTotal > 0 || _sessao.expBase > 0 || _sessao.expClasse > 0 || _sessao.itens.size > 0;
	if (teveEvento) {
		const retrato = lerSessao(_sessao, agora);
		retrato.fase = 'encerrada';
		_historico.unshift(retrato);
		if (_historico.length > HISTORICO_MAX) {
			_historico.length = HISTORICO_MAX;
		}
	}
	_sessao = null;
}

/**
 * O CORACAO DO CICLO. Chamada pelo tique da janela (250 ms) com a leitura
 * atual do mundo; decide iniciar/travar/arquivar. Pura: toda entrada vem
 * por parametro, e chama-la de novo com a mesma situacao nao faz nada.
 *
 * @param {*} gid dono do registro (Session.Entity.GID)
 * @param {{emMapaDeCaca?: boolean|null, morto?: boolean, mapa?: string|null, rotuloDoMapa?: string|null}} situacao
 *   `emMapaDeCaca === null` significa DESCONHECIDO (contexto ausente ou
 *   obsoleto na troca de mapa) e nao transiciona nada -- ver o cabecalho.
 * @param {number} agora
 */
export function atualizarSituacao(gid, situacao, agora = Date.now()) {
	garantirDono(gid);
	const s = situacao || {};
	const emCaca = s.emMapaDeCaca === true;
	const naCidade = s.emMapaDeCaca === false;
	const morto = s.morto === true;

	if (_sessao && _sessao.fim === null) {
		/* Cacada viva. A morte trava ANTES de qualquer leitura de mapa:
		   morrer dentro do mapa de caca e o caso comum. */
		if (morto) {
			congelar('morte', agora);
			return;
		}
		if (naCidade) {
			congelar('cidade', agora);
			return;
		}
		if (emCaca) {
			if (s.mapa && _sessao.mapa && s.mapa !== _sessao.mapa) {
				/* Pulou direto de um mapa de caca para outro: cada mapa e uma
				   cacada — e o que torna o rotulo da aba ("onde foi") honesto. */
				congelar('mapa', agora);
				arquivarSeTeveEventos(agora);
				_sessao = novaSessao(agora, s.mapa, s.rotuloDoMapa);
			} else if (s.mapa && !_sessao.mapa) {
				/* A sessao nasceu por evento antes de o contexto responder:
				   adota o mapa em vez de reiniciar — e a mesma cacada. */
				_sessao.mapa = s.mapa;
				_sessao.rotuloDoMapa = s.rotuloDoMapa || null;
			}
		}
		return;
	}

	/* Sem cacada, ou travada: entrar num mapa de caca (vivo) recomeca. */
	if (emCaca && !morto) {
		arquivarSeTeveEventos(agora);
		_sessao = novaSessao(agora, s.mapa || null, s.rotuloDoMapa || null);
	}
}

/**
 * Este item entrando no inventario conta como DROP DA CACA?
 *
 * `ZC_ITEM_PICKUP_ACK` nao e "o item que caiu": e a resposta a qualquer item
 * entrando no inventario. No nosso servidor ele sai de cinco lugares, e so um
 * e caca -- os outros quatro sao correio, loja, carrinho e armazem (a lista
 * com `arquivo:linha` esta em Engine/MapEngine/Item.js, em onItemPickAnswer).
 * O pacote nao carrega a origem, entao o discriminador e do JOGO: as quatro
 * rotas que nao sao drop acontecem na cidade, e na cidade nao ha caca (D-246).
 *
 * A CONDICAO E "SEI QUE E CIDADE", NAO "NAO SEI SE E CACA". `contexto` chega
 * por resposta do servidor e pode faltar ou atrasar; com a condicao invertida
 * esse instante descartaria drop de verdade, em silencio. Contar a mais
 * aparece na tela; descartar nao aparece em lugar nenhum.
 *
 * @param {{ehCidade?: boolean}|null|undefined} contexto IdleConfig.contexto
 */
export function ehDropDeCaca(contexto) {
	return !(contexto && contexto.ehCidade === true);
}

/** Zera TUDO: sessao, historico e dono. E o reset da troca de personagem. */
export function zerar() {
	_dono = null;
	_sessao = null;
	_historico = [];
}

/**
 * O botao "Zerar" da janela: descarta a cacada CORRENTE, sem tocar no
 * historico. Viva, ela recomeca AGORA no mesmo mapa (o cronometro volta a
 * zero e segue andando — e o Zerar do Midgard); travada, ela e descartada
 * sem virar historico (zerar e jogar fora, nao arquivar).
 */
export function zerarCacadaAtual(agora = Date.now()) {
	if (!_sessao) {
		return;
	}
	if (_sessao.fim === null) {
		_sessao = novaSessao(agora, _sessao.mapa, _sessao.rotuloDoMapa);
	} else {
		_sessao = null;
	}
}

/**
 * Um mob morreu a vista. `nome` ja vem resolvido por quem chama (o motor tem
 * `DB.getMonsterName`); nome vazio cai num balde explicito em vez de sumir.
 * `mobId` (entity.job) alimenta o avatar do ranking; `null` quando falta.
 */
export function registrarAbate(gid, nome, mobId = null, agora = Date.now()) {
	const sessao = marcar(gid, agora);
	if (!sessao) {
		return;
	}
	const chave = nome || 'Nao identificado';
	const atual = sessao.abatesPorMonstro.get(chave);
	if (atual) {
		atual.abates += 1;
		if (atual.mobId === null && mobId !== null) {
			atual.mobId = mobId;
		}
	} else {
		sessao.abatesPorMonstro.set(chave, { abates: 1, mobId: mobId === undefined ? null : mobId });
	}
	sessao.abatesTotal += 1;
}

/**
 * Experiencia de um abate. `tipo` e 'base' ou 'classe'.
 *
 * Valor nao-positivo NAO marca o relogio: um pacote de 0 nao e caca, e deixar
 * ele iniciar a janela de medida faria o ritmo nascer diluido.
 */
export function registrarExp(gid, tipo, valor, agora = Date.now()) {
	const ganho = Number(valor) || 0;
	if (ganho <= 0) {
		return;
	}
	const sessao = marcar(gid, agora);
	if (!sessao) {
		return;
	}
	if (tipo === 'base') {
		sessao.expBase += ganho;
	} else if (tipo === 'classe') {
		sessao.expClasse += ganho;
	}
}

/**
 * Um item que caiu e foi apanhado. `itid` e o id do item (pkt.ITID), que a
 * janela usa para desenhar o icone; `null` quando quem chama nao o tem.
 */
export function registrarItem(gid, nome, quantidade, itid = null, agora = Date.now()) {
	const qtd = Number(quantidade) || 0;
	if (qtd <= 0 || !nome) {
		return;
	}
	const sessao = marcar(gid, agora);
	if (!sessao) {
		return;
	}
	const atual = sessao.itens.get(nome);
	if (atual) {
		atual.quantidade += qtd;
		if (atual.itid === null && itid !== null) {
			atual.itid = itid;
		}
	} else {
		sessao.itens.set(nome, { quantidade: qtd, itid: itid === undefined ? null : itid });
	}
}

/** `total` por hora, ou `null` enquanto a janela medida for curta demais. */
function porHora(total, decorridoMs) {
	if (decorridoMs < MS_MINIMOS_PARA_RITMO) {
		return null;
	}
	return (total * MS_POR_HORA) / decorridoMs;
}

/**
 * Quanto falta para o proximo nivel, no ritmo medido.
 *
 * Devolve `null` -- e nao Infinity, nem um numero grande -- em todos os casos
 * em que a conta nao tem resposta: sem ritmo ainda, ritmo zero, ou o cliente
 * ainda nao sabe o teto (`restante` nao-positivo). Quem desenha escreve "--".
 */
export function estimarMsAteONivel(restante, expPorHora) {
	if (expPorHora === null || expPorHora <= 0) {
		return null;
	}
	const falta = Number(restante) || 0;
	if (falta <= 0) {
		return null;
	}
	return (falta / expPorHora) * MS_POR_HORA;
}

/**
 * O retrato de UMA sessao. Tudo derivado na hora, para nao haver um segundo
 * contador que possa divergir do primeiro. Numa sessao TRAVADA o "agora" e o
 * instante da trava: o relogio parou la, e os ritmos descrevem a janela que
 * de fato foi medida.
 */
function lerSessao(sessao, agora) {
	const fimEfetivo = sessao.fim === null ? agora : sessao.fim;
	const decorridoMs = Math.max(0, fimEfetivo - sessao.inicio);

	const ranking = [...sessao.abatesPorMonstro.entries()]
		.map(([nome, m]) => ({ nome, abates: m.abates, mobId: m.mobId }))
		.sort((a, b) => b.abates - a.abates || a.nome.localeCompare(b.nome, 'pt-BR'));

	const itens = [...sessao.itens.entries()]
		.map(([nome, i]) => ({ nome, quantidade: i.quantidade, itid: i.itid }))
		.sort((a, b) => b.quantidade - a.quantidade || a.nome.localeCompare(b.nome, 'pt-BR'));

	const itensTotal = itens.reduce((soma, i) => soma + i.quantidade, 0);

	return {
		fase: sessao.fim === null ? 'ativa' : 'travada',
		motivoDoFim: sessao.motivoDoFim,
		mapa: sessao.mapa,
		rotuloDoMapa: sessao.rotuloDoMapa,
		iniciadaEm: sessao.inicio,
		encerradaEm: sessao.fim,
		decorridoMs,
		ociosoMs: sessao.ultimo === null ? decorridoMs : Math.max(0, fimEfetivo - sessao.ultimo),
		abatesTotal: sessao.abatesTotal,
		abatesPorHora: porHora(sessao.abatesTotal, decorridoMs),
		expBase: sessao.expBase,
		expClasse: sessao.expClasse,
		expBasePorHora: porHora(sessao.expBase, decorridoMs),
		expClassePorHora: porHora(sessao.expClasse, decorridoMs),
		ranking,
		itens,
		itensTotal,
		itensPorHora: porHora(itensTotal, decorridoMs),
		/*
		 * Por 100 abates, e nao por abate: com taxa de carta em 0,01% o numero
		 * por abate seria invisivel e a tela mostraria "0,0" o tempo todo.
		 * `null` sem abate nenhum -- dividir por zero nao vira "0%".
		 */
		itensPor100Abates: sessao.abatesTotal === 0 ? null : (itensTotal * 100) / sessao.abatesTotal
	};
}

/** O retrato da cacada CORRENTE (viva ou travada), ou o vazio. */
export function ler(gid, agora = Date.now()) {
	if (_dono !== gid || !_sessao) {
		return vazio();
	}
	return lerSessao(_sessao, agora);
}

/**
 * As cacadas encerradas deste personagem, mais recente primeiro (no maximo
 * HISTORICO_MAX). Retratos ja congelados -- ver `_historico`.
 */
export function lerHistorico(gid) {
	if (_dono !== gid) {
		return [];
	}
	return _historico.slice();
}

function vazio() {
	return {
		fase: 'ociosa',
		motivoDoFim: null,
		mapa: null,
		rotuloDoMapa: null,
		iniciadaEm: null,
		encerradaEm: null,
		decorridoMs: 0,
		ociosoMs: 0,
		abatesTotal: 0,
		abatesPorHora: null,
		expBase: 0,
		expClasse: 0,
		expBasePorHora: null,
		expClassePorHora: null,
		ranking: [],
		itens: [],
		itensTotal: 0,
		itensPorHora: null,
		itensPor100Abates: null
	};
}

export default {
	MS_MINIMOS_PARA_RITMO,
	HISTORICO_MAX,
	ehDropDeCaca,
	zerar,
	zerarCacadaAtual,
	atualizarSituacao,
	registrarAbate,
	registrarExp,
	registrarItem,
	estimarMsAteONivel,
	ler,
	lerHistorico
};
