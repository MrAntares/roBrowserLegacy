/**
 * Engine/MapEngine/falaDoPetNaFicha.js
 *
 * QUANDO O PET FALA POR CAUSA DA FICHA (D-2374, 13/10/2026).
 *
 * O roBrowser de origem faz o pet "falar" (`CZ_PET_ACT`) em tres casos do
 * `onParameterChange` (`Main.js`): HP em perigo, morte e nivel de base. Ele
 * foi escrito para o rAthena, que so manda `ZC_PAR_CHANGE` de nivel quando o
 * nivel MUDA. O nosso servidor reenvia a ficha inteira (`enviarAtributos`,
 * `servidor/mapa/servidor-mapa.ts`) a cada ficha suja do tique — buff que
 * entra ou sai, equipamento, item — e cada reenvio trazia o nivel IGUAL. O
 * cliente lia isso como "subiu de nivel" e mandava o `CZ_PET_ACT`, que o
 * servidor DIFUNDE ao mapa: o pet comemorava um nivel que nao veio, para todo
 * mundo, a cada reenvio. Defeito visivel e trafego de graca.
 *
 * O HP em perigo ja tinha guarda (10 s entre falas). A MORTE nao tinha: morto,
 * todo reenvio da ficha (HP 0 de novo) repetia o "morri". Ela entra aqui pelo
 * mesmo motivo do nivel.
 *
 * As duas perguntas sao puras (sem Session, sem rede) para o teste e a bateria
 * de mutacao medirem a decisao sem levantar o mapa.
 */

/**
 * O pet comemora o nivel so quando ele SUBIU.
 *
 * `anterior` e o nivel que a entidade tinha antes deste pacote. Sem anterior
 * conhecido (nao e numero) nao ha "subiu": e o retrato da entrada, e nao um
 * ganho — o mesmo criterio de `progressoDaCaca` (`Main.js`).
 *
 * @param {number|undefined|null} anterior
 * @param {number} novo
 * @returns {boolean}
 */
export function petComemoraONivel(anterior, novo) {
	return typeof anterior === 'number' && novo > anterior;
}

/**
 * O pet lamenta a morte so na PASSAGEM para morto (HP <= 1).
 *
 * `hpAnterior` negativo e o "sem informacao" da `EntityLife` (-1 antes do
 * primeiro pacote): entrar no jogo ja morto ainda conta como passagem, como
 * contava antes. Ja estar com HP 0 ou 1 e receber 0 ou 1 de novo e o reenvio
 * da ficha, e nao uma morte nova.
 *
 * @param {number} hpAnterior
 * @param {number} hpNovo
 * @returns {boolean}
 */
export function petLamentaAMorte(hpAnterior, hpNovo) {
	if (hpNovo > 1) {
		return false;
	}
	const jaEstavaMorto = hpAnterior >= 0 && hpAnterior <= 1;
	return !jaEstavaMorto;
}
