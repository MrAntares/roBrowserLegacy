/**
 * UI/Components/ShortCut/relogioDeRecarga.js
 *
 * As CONTAS do relogio de recarga da barra de atalhos, sem DOM, para terem
 * teste de unidade. Item 3.10 do pedido do dono (09/10/2026): *"as skills da
 * barra mostram o cooldown como um relogio em volta do icone (sombra que vai
 * revelando o icone em sentido horario, numero no centro)"*. As contas sao as
 * do relogio dos orbes do DockIdle (D-916, 02/09/2026), que saiu com o idle
 * antigo no commit df1636c9 e volta aqui, agora para a barra que ficou.
 *
 * O servidor manda `ZC_SKILL_POSTDELAY` (0x043d) com a duracao do `Cooldown`
 * quando a skill sai, seja do clique, seja do Bot (a mesma porta); a barra
 * guarda `{ ate, duracao }` por skill e, a cada passo do relogio, pergunta
 * aqui QUANTO falta e COMO mostrar:
 *
 *  - `fracao` e a parte que AINDA FALTA (1 no instante do disparo, 0 quando
 *    acaba). O CSS a usa num `conic-gradient`: a sombra escura cobre a fatia
 *    que falta e o icone vai sendo revelado em sentido horario a partir do
 *    topo.
 *  - `rotulo` e o numero no centro: decimos abaixo de 10 s ("2.4"), segundos
 *    inteiros dali para cima ("12s"); cabe no icone de 32px.
 *
 * `duracao` zero ou negativa nao divide por zero: a fracao vira 0 (nada a
 * desenhar).
 */

/**
 * @typedef {{ ate: number, duracao: number }} Recarga
 * @typedef {{ restante: number, fracao: number, rotulo: string }} EstadoDaRecarga
 */

/**
 * Quanto falta desta recarga em `agora`.
 *
 * @param {Recarga} recarga
 * @param {number} agora timestamp (ms), o mesmo relogio de `ate`
 * @returns {EstadoDaRecarga}
 */
export function estadoDaRecarga(recarga, agora) {
	const restante = Math.max(0, recarga.ate - agora);
	const fracao = recarga.duracao > 0 ? Math.min(1, restante / recarga.duracao) : 0;
	return { restante, fracao, rotulo: rotuloDeRecarga(restante) };
}

/**
 * O numero do centro do icone.
 *
 * @param {number} restanteMs
 * @returns {string} '' quando nao ha o que mostrar
 */
export function rotuloDeRecarga(restanteMs) {
	if (!(restanteMs > 0)) {
		return '';
	}
	if (restanteMs >= 10000) {
		return Math.ceil(restanteMs / 1000) + 's';
	}
	return (restanteMs / 1000).toFixed(1);
}

/**
 * O passo do relogio, em ms. Curto o bastante para a fatia andar lisa num
 * icone de 32px e folgado o bastante para nao disputar o quadro com o render
 * do mapa (o relogio antigo da barra redesenhava a CADA quadro, um
 * `requestAnimationFrame` por slot). O relogio so existe enquanto ha recarga
 * viva (ver `relogioDaBarra.js`).
 */
export const PASSO_DO_RELOGIO_MS = 80;
