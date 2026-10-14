/**
 * UI/anexarAoCorpoSeSolto.js
 *
 * O BOTAO DE "SUBIU DE NIVEL" SO ENTRA NO BODY QUANDO ESTA FORA DELE
 * (D-2374, 13/10/2026).
 *
 * O roBrowser de origem pendura o botao de level up (`lvlup_base` da janela de
 * Equipamento, `lvlup_job` da de Habilidades) no `document.body` a cada
 * `ZC_PAR_CHANGE` de nivel. No rAthena esse pacote so vem quando o nivel muda;
 * o nosso servidor reenvia a ficha inteira a cada ficha suja do tique, e cada
 * reenvio arrancava o botao do body e o colocava de novo no fim — uma mutacao
 * do DOM (e um recalculo de estilo, e o `MutationObserver` do `Background.js`
 * acordando no carregamento) para deixar a tela exatamente como estava.
 *
 * Se o botao JA esta no body, nao ha o que fazer. Se esta fora (o jogador
 * clicou nele, que o remove; a janela foi retirada na troca de mapa), entra de
 * novo — como antes. A unica diferenca e a posicao entre os irmaos do body: o
 * botao nao e mais empurrado para o ultimo lugar a cada reenvio.
 *
 * @param {HTMLElement|null|undefined} elemento
 * @returns {boolean} true quando anexou
 */
export function anexarAoCorpoSeSolto(elemento) {
	if (!elemento || elemento.parentNode === document.body) {
		return false;
	}
	document.body.appendChild(elemento);
	return true;
}
