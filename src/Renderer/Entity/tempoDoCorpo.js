/**
 * QUANTO TEMPO O CORPO DE UM MONSTRO MORTO FICA NA TELA (bug #9 de 13/10/2026).
 *
 * Relato: "depois de morrer, o corpo permanece no chao por bastante tempo;
 * confunde quais alvos ainda estao vivos e atrapalha a caca". Medido:
 * o servidor manda o `ZC_NOTIFY_VANISH` tipo 1 (morte) 250 ms depois do golpe
 * fatal, em todo tipo de abate, e o mob ja saiu da populacao; quem segurava o
 * corpo era o roBrowser, com `remove_delay = 5000` no `VT.DEAD` (Entity.js,
 * igual desde o commit inicial): a animacao de morte e um fade LINEAR de 5 s
 * (`EntityRender.js`, alfa = 1 - t/delay). Com o Bot matando no ritmo do Modo
 * Classico, a tela ficava cheia de corpos meio transparentes.
 *
 * O servidor nao manda tempo de corpo; e decisao do cliente, e so VISUAL: o
 * morto ja nao e clicavel nem alvo (`EntityManager.js`, `action !== DIE`), e
 * recompensa e renascimento sao do servidor. O fade fica em 1,5 s para
 * monstro (a animacao de morte ainda aparece, e o corpo some logo). Os outros
 * tipos seguem o caminho de antes: jogador e wug nao somem (o jogador morto fica
 * no chao), e o resto (homunculo, mercenario, NPC) mantem os 5 s do roBrowser.
 */

/** O fade do corpo do MONSTRO morto, em ms. Escolha visual do relato #9 (antes: 5000 do roBrowser). */
export const FADE_DO_CORPO_DO_MONSTRO_MS = 1500;

/** O fade de antes, do roBrowser, para os outros tipos que morrem e somem. */
export const FADE_DO_CORPO_DO_ROBROWSER_MS = 5000;

/**
 * O `remove_delay` do corpo que morreu, ou `null` quando ele nao some (jogador,
 * wug). O falcao nem chega aqui (nao toca a morte).
 *
 * @param {{ ehJogador: boolean, ehWug: boolean, ehMonstro: boolean }} quem
 * @returns {number | null}
 */
export function fadeDoCorpo({ ehJogador, ehWug, ehMonstro }) {
	if (ehJogador || ehWug) {
		return null;
	}
	return ehMonstro ? FADE_DO_CORPO_DO_MONSTRO_MS : FADE_DO_CORPO_DO_ROBROWSER_MS;
}
