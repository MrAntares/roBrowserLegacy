/**
 * Engine/gatilhoDaEconomia.js
 *
 * O GATILHO DA ECONOMIA DE ENERGIA / MODO DESCANSO (D-1389/D-1394, 14/09/2026;
 * de volta em 13/10/2026, bug #10, para o Bot novo). Quando a aba vai para o
 * fundo, o cliente espera um atraso de confirmacao e so entao avisa o servidor
 * (`entrar`); o servidor decide se o personagem fica no mundo (so com o Bot
 * ligado) e segue cacando pelo Bot V5 mesmo que a conexao caia.
 *
 * Este modulo e a parte PURA da decisao (visibilidade -> atraso -> pedido), com
 * o relogio e o envio entrando por parametro. Morava dentro de `MapEngine.js`,
 * que nao carrega em jsdom, e por isso o atraso de 14 s so era cobrado por
 * casamento de texto; agora o comportamento e provado com relogio falso.
 *
 * O ATRASO existe para distinguir "so foi pro fundo" (alt-tab, troca de app,
 * minimizar) de "fechou de vez": se a aba fechar, o JavaScript da pagina MORRE
 * antes do atraso disparar e o aviso nunca sai (nao ha `beforeunload`, que nem
 * garante chegar a tempo). Pedido do dono (14/09/2026): "essa economia de energia
 * automatica e feita somente caso a pessoa de alt tab ou troque de aplicativo.
 * Se ele FECHAR a aba ou o aplicativo, deve encerrar."
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
 *   agendar?: function(function(): void, number): any,
 *   desagendar?: function(any): void,
 *   atrasoMs?: number
 * }} deps
 * @returns {{aoMudarVisibilidade: function(): void, cancelar: function(): void, agendado: function(): boolean}}
 */
export function criarGatilhoDaEconomia(deps) {
	const agendar = deps.agendar || ((fn, ms) => setTimeout(fn, ms));
	const desagendar = deps.desagendar || (t => clearTimeout(t));
	const atrasoMs = deps.atrasoMs === undefined ? MS_DE_ATRASO_ANTES_DE_ENTRAR_NA_ECONOMIA : deps.atrasoMs;
	let atraso = null;

	/** Cancela o atraso pendente, se houver: nunca chegou a avisar, entao nao ha `entrar` pra desfazer. */
	function cancelar() {
		if (atraso !== null) {
			desagendar(atraso);
			atraso = null;
		}
	}

	/**
	 * `visibilitychange`: so a ida pro FUNDO agenda o aviso. Voltar a aba NAO manda `sair` (D-1392: quem sai e o
	 * botao "Voltar a jogar"); so cancela um atraso que ainda nao disparou.
	 */
	function aoMudarVisibilidade() {
		// A economia AUTOMATICA desligada nas Configuracoes de Video (23/09/2026): nada a pedir, e um atraso ja
		// agendado cai.
		if (!deps.automaticaLigada()) {
			cancelar();
			return;
		}
		if (deps.oculta()) {
			if (atraso !== null) return; // ja agendado: nao empilha um segundo
			atraso = agendar(() => {
				atraso = null;
				// Confere de novo: pode ter voltado no instante exato do disparo, ou o jogador pode ter desligado
				// a economia automatica nesse meio tempo.
				if (!deps.oculta()) return;
				if (!deps.automaticaLigada()) return;
				deps.pedirEntrar();
			}, atrasoMs);
		} else {
			cancelar();
		}
	}

	return { aoMudarVisibilidade, cancelar, agendado: () => atraso !== null };
}
