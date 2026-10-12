/**
 * A COR DE QUEM ESTA ENCOBERTO — Hide, Cloak e Chasewalk (D-1354).
 *
 * O servidor passou a mandar o bit do Cloaking (`OPTION_CLOAK`, 0x4) no
 * `effectState`, e o setter `updateEffectState` (`EntityState.js`) ja sabia o
 * que fazer com ele: apagar a entidade. So que apagava QUALQUER entidade,
 * inclusive o proprio personagem — o Assassino que se encobria sumia da propria
 * tela, e o jogador perdia de vista quem ele controla.
 *
 * A regra, na ordem em que o fork ja a tinha:
 * - com a INTRAVISAO (a carta Maya Purple, `Session.Entity.intravision`), a
 *   silhueta preta e opaca — o que o fork ja fazia, para todo encoberto;
 * - o PROPRIO personagem fica meio transparente, e nao some;
 * - os OUTROS somem (alfa 0), como a fonte pede.
 *
 * O `updateEffectState` volta a cor a 1 no comeco de toda chamada, entao nada
 * daqui sobrevive ao fim do Cloaking.
 */

/**
 * O alfa do PROPRIO personagem encoberto. **Nao e numero da fonte**: o cliente
 * oficial desenha o proprio encoberto de um jeito que daqui nao da para medir,
 * e o valor e a escolha registrada na D-1354 — o bastante para o jogador se ver,
 * pouco o bastante para ele saber que esta encoberto. O proprio fork ja desenha
 * a Camuflagem a 0,1 (`EntityState.js`), e "fraco, e nao sumido" e o precedente.
 */
export const ALFA_DO_PROPRIO_ENCOBERTO = 0.5;

/**
 * @param {{ ehOProprio: boolean, intravisao: boolean }} quem
 * @returns {{ r: number, g: number, b: number, a: number }} os multiplicadores do `_effectStateColor`
 */
export function corDoEncoberto({ ehOProprio, intravisao }) {
	if (intravisao) return { r: 0, g: 0, b: 0, a: 1 };
	if (ehOProprio) return { r: 1, g: 1, b: 1, a: ALFA_DO_PROPRIO_ENCOBERTO };
	return { r: 1, g: 1, b: 1, a: 0 };
}
