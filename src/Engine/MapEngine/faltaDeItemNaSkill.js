/**
 * USESKILL_FAIL_NEED_ITEM (rAthena clif.hpp:479, causa 71): a skill precisa de
 * um item que o jogador nao tem. O servidor manda o item em `itemId` e a
 * quantidade em `NUM` (`clif_skill_fail(sd, skill_id, USESKILL_FAIL_NEED_ITEM,
 * require.amount[i], require.itemid[i])`, skill.cpp:9572).
 *
 * O cliente oficial mostra "[%s] required '%d' amount." - e usa o nome NAO
 * identificado, o que o proprio rAthena marca como defeito do cliente
 * (clif.hpp:478). Aqui vai o nome identificado.
 *
 * O `onSkillResult` do roBrowser nao tinha esta causa: o `NUM` nao zero caia
 * no generico de skill e o jogador nao sabia que faltava o catalisador (a
 * Garrafa de Acido do Alquimista, a Gema Azul do Sacerdote, etc.).
 */

export const CAUSA_FALTA_DE_ITEM = 71;

/**
 * @param {number} causa - `pkt.cause`
 * @return {boolean}
 */
export function ehFaltaDeItem(causa) {
	return causa === CAUSA_FALTA_DE_ITEM;
}

/**
 * @param {string} nomeDoItem - nome ja resolvido (identificado)
 * @param {number} quantidade - `pkt.NUM`
 * @return {string}
 */
export function textoDeFaltaDeItem(nomeDoItem, quantidade) {
	const nome = nomeDoItem && nomeDoItem.length > 0 ? nomeDoItem : 'item';
	const n = quantidade > 0 ? quantidade : 1;
	return `É necessário [${nome}] x${n} para usar esta habilidade.`;
}
