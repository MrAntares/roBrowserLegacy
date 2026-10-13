/**
 * Engine/gatilhoDaEconomia.js
 *
 * O GATILHO DA ECONOMIA DE ENERGIA / MODO DESCANSO (D-1389/D-1394, 14/09/2026;
 * de volta em 13/10/2026, bug #10, para o Bot novo). Quando a aba vai para o
 * fundo o cliente avisa o servidor (`entrar`); o servidor deixa o personagem no
 * mundo e, com o Bot ligado, o Bot V5 segue cacando mesmo que a conexao caia.
 *
 * Este modulo e a parte PURA da decisao (visibilidade -> aviso -> tela preta),
 * com o relogio e o envio entrando por parametro. Morava dentro de
 * `MapEngine.js`, que nao carrega em jsdom, e por isso o atraso de 14 s so era
 * cobrado por casamento de texto; agora o comportamento e provado com relogio
 * falso.
 *
 * O ATRASO existe para distinguir "so foi pro fundo" (alt-tab, troca de app) de
 * "fechou de vez" NO DESKTOP: se a aba fechar, o JavaScript morre antes do
 * atraso disparar e o aviso nunca sai. Pedido do dono (14/09/2026): "essa
 * economia de energia automatica e feita somente caso a pessoa de alt tab ou
 * troque de aplicativo. Se ele FECHAR a aba ou o aplicativo, deve encerrar."
 *
 * O CELULAR ARMA NA HORA (decisao do dono, 13/10/2026, bug #10): o iPhone (e o
 * Android depois de um tempo) CONGELA a pagina e o socket antes dos 14 s; se o
 * `entrar` so saisse apos o atraso, nada armaria e a queda removeria o
 * personagem (o bug #10 persistiria nesse aparelho). No DEDO o `entrar` sai no
 * instante em que a aba some (e no `pagehide`); o atraso de 14 s passa a valer
 * so para a TELA PRETA. Voltar antes disso manda `sair` sem efeito visivel.
 *
 * As fases da economia deste lado:
 *   livre       nada pedido
 *   cedo        celular: `entrar` ja foi, a tela preta espera o atraso (a
 *               resposta `ativa:true` fica guardada)
 *   liberada    a tela preta pode abrir (desktop: o aviso saiu depois do atraso;
 *               celular: o atraso passou)
 *   desarmando  celular voltou antes do atraso e mandou `sair`: respostas
 *               `ativa:true` atrasadas sao ignoradas
 *
 * This file is part of the ragidle fork of ROBrowser.
 */

/**
 * 14 s desde 23/09/2026 (era 3 s; ordem do dono no open beta: "Aumente esse
 * tempo para 14 segundos"): um alt-tab curto nao tira o jogador da tela do jogo.
 */
export const MS_DE_ATRASO_ANTES_DE_ENTRAR_NA_ECONOMIA = 14000;

/**
 * @param {{
 *   oculta: function(): boolean,
 *   automaticaLigada: function(): boolean,
 *   pedirEntrar: function(): void,
 *   pedirSair?: function(): void,
 *   armarNaHora?: function(): boolean,
 *   abrirTela?: function(number): void,
 *   agendar?: function(function(): void, number): any,
 *   desagendar?: function(any): void,
 *   atrasoMs?: number
 * }} deps
 */
export function criarGatilhoDaEconomia(deps) {
	const agendar = deps.agendar || ((fn, ms) => setTimeout(fn, ms));
	const desagendar = deps.desagendar || (t => clearTimeout(t));
	const atrasoMs = deps.atrasoMs === undefined ? MS_DE_ATRASO_ANTES_DE_ENTRAR_NA_ECONOMIA : deps.atrasoMs;
	const naHora = () => (deps.armarNaHora ? deps.armarNaHora() === true : false);
	let atraso = null;
	let fase = 'livre';
	let pendente = null;

	function limparTimer() {
		if (atraso !== null) {
			desagendar(atraso);
			atraso = null;
		}
	}

	/** Cancela o atraso pendente e zera a fase (a reentrada, o fim da sessao, o botao "Voltar a jogar"). */
	function cancelar() {
		limparTimer();
		fase = 'livre';
		pendente = null;
	}

	function entrarCedo() {
		if (fase === 'cedo') {
			return;
		}
		deps.pedirEntrar();
		fase = 'cedo';
		pendente = null;
	}

	/** O celular voltou antes do atraso: o `sair` desfaz o que o `entrar` cedo armou, sem tela nenhuma. */
	function desarmarCedo() {
		if (deps.pedirSair) {
			deps.pedirSair();
		}
		fase = 'desarmando';
		pendente = null;
	}

	/** O atraso de 14 s: confere de novo e, no celular, abre a tela guardada; no desktop manda o `entrar`. */
	function agendarAtraso() {
		atraso = agendar(() => {
			atraso = null;
			// Confere de novo: pode ter voltado no instante exato do disparo, ou o jogador pode ter desligado
			// a economia automatica nesse meio tempo.
			if (!deps.oculta()) {
				return;
			}
			if (!deps.automaticaLigada()) {
				return;
			}
			if (fase === 'cedo') {
				fase = 'liberada';
				if (pendente !== null && deps.abrirTela) {
					deps.abrirTela(pendente);
				}
				pendente = null;
			} else {
				deps.pedirEntrar();
				fase = 'liberada';
			}
		}, atrasoMs);
	}

	/**
	 * `visibilitychange`: a ida pro FUNDO agenda o aviso (desktop) ou o manda ja (celular). Voltar a aba NAO fecha a
	 * tela que ja abriu (D-1392: quem sai e o botao "Voltar a jogar"); so desfaz o que ainda nao apareceu.
	 */
	function aoMudarVisibilidade() {
		// A economia AUTOMATICA desligada nas Configuracoes de Video (23/09/2026): nada a pedir; o que ja foi cai.
		if (!deps.automaticaLigada()) {
			limparTimer();
			if (fase === 'cedo') {
				desarmarCedo();
			}
			return;
		}
		if (deps.oculta()) {
			if (atraso !== null) {
				return; // ja agendado: nao empilha um segundo
			}
			// D-1392: com a tela preta ja liberada so o botao "Voltar a jogar" fecha. Esconder de novo nao recomeca o
			// aviso cedo (voltar em menos de 14 s mandaria `sair` e fecharia a tela sem o botao).
			if (fase === 'liberada') {
				return;
			}
			if (naHora()) {
				entrarCedo();
			}
			agendarAtraso();
		} else {
			limparTimer();
			if (fase === 'cedo') {
				desarmarCedo();
			}
		}
	}

	/** `pagehide`: o ultimo instante em que o JS ainda roda no celular. So no dedo, e so uma vez. */
	function aoEsconderPagina() {
		if (!deps.automaticaLigada() || !naHora()) {
			return;
		}
		if (fase === 'livre') {
			entrarCedo();
			// A tela preta segue a mesma regra do esconder: so depois do atraso (e so se a aba estiver oculta nessa hora).
			if (atraso === null) {
				agendarAtraso();
			}
		}
	}

	/** O servidor respondeu `ativa:true`: a tela pode abrir agora? (`false` = guardada ou ignorada) */
	function aoResponderAtiva(restanteMs) {
		if (fase === 'cedo') {
			pendente = restanteMs;
			return false;
		}
		return fase !== 'desarmando';
	}

	/** O servidor respondeu `ativa:false` (o ack do `sair`, uma recusa, o teto). */
	function aoResponderInativa() {
		if (fase !== 'cedo') {
			fase = 'livre';
			pendente = null;
		}
	}

	return {
		aoMudarVisibilidade,
		aoEsconderPagina,
		aoResponderAtiva,
		aoResponderInativa,
		cancelar,
		agendado: () => atraso !== null,
		fase: () => fase
	};
}
