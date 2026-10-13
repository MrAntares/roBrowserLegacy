/**
 * UI/Components/Announce/posicaoDaFaixa.js
 *
 * ONDE A FAIXA DE AVISO FICA NO CELULAR EM PE (bug #1 de 13/10/2026).
 *
 * O relato veio da recusa de encaixar a carta Smokie: a faixa amarela do
 * `Announce` caia SOBRE a barra do topo da HUD vertical (nome, Base Lv, barras)
 * e o botao do menu cobria o fim da primeira linha — o texto lia-se
 * "...tem efe[...] jogo e nao pode ser encaixada". A causa e o `top: 40px` de
 * `Announce.css`: ele e a altura do desktop (a faixa de sempre, no alto da tela)
 * e nunca foi reescrito para a HUD vertical, onde a barra do personagem mora de
 * 6 a 76px e o botao do menu fica na ponta direita dela (`UI/Common.css`,
 * D-939).
 *
 * O que decide a posicao mora aqui, e nao dentro do `Announce.js`, para ter
 * teste e bateria de mutacao: o numero errado nao quebra nada visivelmente (a
 * faixa so volta a cobrir um pedaco da HUD), e e exatamente o tipo de erro que
 * uma "simplificacao" desfaz calada.
 *
 * O ARRANJO (so na HUD vertical; no desktop nada disto vale):
 *
 *   - **coluna do canto, debaixo do cartao de missoes**, e nao um banner de ponta
 *     a ponta. A faixa fica na MESMA coluna e largura do cartao (236px, ou o que
 *     couber sem tocar o trilho da direita), como o placar do MVP. Assim ela
 *     nunca encosta no cabecalho, no botao do menu, no trilho de botoes redondos
 *     (Mochila, Auto, Skills, RO Shop), no cartao de missoes nem na barra de
 *     atalhos, e as palavras quebram em mais linhas em vez de passar por baixo
 *     de um botao.
 *   - **uma fileira de aviso de item (44px) fica livre acima dela.** O aviso de
 *     "Voce pegou X" (`ItemObtain`) nasce no mesmo lugar, logo abaixo do cartao,
 *     e dura 3 s; a faixa dura 10 s. Sem a reserva as duas se escreveriam uma
 *     por cima da outra. E o mesmo 44px que `#StatusIcons` ja reserva na
 *     vertical (Common.css, "uma fileira de aviso").
 *   - o `top` e MEDIDO (a borda de baixo do cartao, que cresce com o numero de
 *     missoes), como o `ItemObtain` ja faz; sem cartao na tela vale o `calc` de
 *     nascenca que mora no CSS.
 *
 * A seguranca de borda (entalhe) nao entra aqui: o `top` medido ja vem do cartao,
 * que nasce abaixo de `--vr-topo` (= entalhe + 6px), e o `left` e o
 * `--safe-esq + --vr-margem` do CSS.
 */

/** A margem das bordas na HUD vertical (`--vr-margem`, Common.css). */
export const MARGEM = 8;

/** A largura do trilho de botoes redondos da direita (`--vr-trilho-largura`, Common.css). */
export const LARGURA_DO_TRILHO = 60;

/** A largura do cartao de missoes (`min(236px, ...)`, Common.css): a coluna do canto. */
export const LARGURA_DO_CARTAO = 236;

/** O respiro entre o cartao e o que mora debaixo dele (o mesmo vao do `ItemObtain`). */
export const VAO_DO_CARTAO = 4;

/** Uma fileira de aviso de item: o 44px que `#StatusIcons` ja reserva na vertical. */
export const FILEIRA_DO_AVISO_DE_ITEM = 44;

/** Nenhuma largura menor que isto: abaixo disso nao cabe palavra, so letra. */
const PISO = 100;

/**
 * A largura da coluna do canto: a do cartao de missoes (o mesmo `min` do CSS, que
 * deixa 32px para o trilho e as margens).
 *
 * @param {number} larguraDaTela
 * @returns {number}
 */
export function larguraDaColuna(larguraDaTela) {
	return Math.max(PISO, Math.min(LARGURA_DO_CARTAO, larguraDaTela - LARGURA_DO_TRILHO - 32));
}

/**
 * A largura livre entre a margem esquerda e o trilho da direita: o teto de um
 * banner que PEDE largura (o de conquista, `width: '100%'`). 8px de ar do trilho.
 *
 * @param {number} larguraDaTela
 * @returns {number}
 */
export function larguraLivre(larguraDaTela) {
	return Math.max(PISO, larguraDaTela - MARGEM - LARGURA_DO_TRILHO - MARGEM - MARGEM);
}

/**
 * A largura MAXIMA da faixa na HUD vertical.
 *
 * Sem largura pedida (o aviso comum), vale a coluna do canto e o canvas encolhe
 * ao texto. Com largura pedida (o banner de conquista), vale o pedido limitado ao
 * vao livre: ele nao pode passar por baixo do trilho.
 *
 * @param {number} larguraDaTela
 * @param {number|null} larguraPedida px, ou `null` se o chamador nao pediu
 * @returns {number}
 */
export function larguraDaFaixaNaVertical(larguraDaTela, larguraPedida) {
	if (!larguraPedida) {
		return larguraDaColuna(larguraDaTela);
	}
	return Math.min(larguraPedida, larguraLivre(larguraDaTela));
}

/**
 * O `top` da faixa na HUD vertical, a partir da borda de baixo do cartao de
 * missoes (em unidades da HUD), ou `null` se nao ha cartao medido: o CSS usa o
 * `calc` de nascenca.
 *
 * @param {number|null|undefined} fimDoCartao
 * @returns {number|null}
 */
export function topoDaFaixaNaVertical(fimDoCartao) {
	if (!Number.isFinite(fimDoCartao)) {
		return null;
	}
	return Math.round(fimDoCartao + VAO_DO_CARTAO + FILEIRA_DO_AVISO_DE_ITEM);
}

/** A marca que `UI/hudVertical.js` poe no `<html>` quando o celular esta em pe. */
const MARCA_VERTICAL = 'ri-vertical';

/** O host do cartao de missoes: o que a faixa mede para saber onde comeca. */
const CARTAO_DE_MISSOES = 'div[id^="MissoesTrackerIdle"]';

/** A variavel que `UI/Common.css` le em `html.ri-vertical #Announce { top }`. */
export const VARIAVEL_DO_TOPO = '--vr-aviso-topo';

/**
 * A HUD vertical (celular em pe) esta valendo agora?
 *
 * Le a MARCA, e nao o `matchMedia`: e a marca que o CSS usa para decidir o
 * arranjo, entao JS e CSS nunca discordam (ela respeita a bandeira de rollout da
 * HUD adaptavel, que `@media` nao conhece).
 *
 * @param {Document} doc
 * @returns {boolean}
 */
export function ehHudVertical(doc) {
	return !!doc && !!doc.documentElement && doc.documentElement.classList.contains(MARCA_VERTICAL);
}

/**
 * Mede o cartao de missoes e publica o `top` da faixa no host dela.
 *
 * `converter` leva o pixel de viewport medido para a unidade da HUD (a
 * convencao de `UI/escalaDaHud.js: emUnidadesDaHud`: toda geometria medida que
 * vira `style` passa por la). Sem cartao desenhado (jogador sem missao, ou a
 * HUD ainda montando) a variavel SAI, e o CSS usa o `calc` de nascenca.
 *
 * @param {HTMLElement} host o host do componente Announce
 * @param {Document} doc
 * @param {(px: number) => number} [converter]
 * @returns {number|null} o `top` publicado, ou `null` se saiu
 */
export function publicarTopo(host, doc, converter = px => px) {
	const cartao = doc.querySelector(CARTAO_DE_MISSOES);
	const caixa = cartao ? cartao.getBoundingClientRect() : null;
	const topo = caixa && caixa.height > 0 ? topoDaFaixaNaVertical(converter(caixa.bottom)) : null;
	if (topo === null) {
		host.style.removeProperty(VARIAVEL_DO_TOPO);
	} else {
		host.style.setProperty(VARIAVEL_DO_TOPO, `${topo}px`);
	}
	return topo;
}

/**
 * Posiciona a faixa na HUD vertical e a MANTEM no lugar enquanto o cartao de
 * missoes mudar de altura.
 *
 * O acompanhamento existe por causa da ENTRADA no mapa: o aviso do evento de EXP
 * sobe no mesmo tique em que o cartao e anexado, antes de as missoes chegarem, e
 * o cartao cresce depois. Medido uma vez so, a faixa nasceria em cima dele.
 *
 * @param {HTMLElement} host
 * @param {Document} doc
 * @param {(px: number) => number} [converter]
 * @returns {() => void} desliga o acompanhamento (chamar ao tirar a faixa)
 */
export function posicionarNaVertical(host, doc, converter) {
	publicarTopo(host, doc, converter);
	const cartao = doc.querySelector(CARTAO_DE_MISSOES);
	const Observador = doc.defaultView && doc.defaultView.ResizeObserver;
	if (!cartao || typeof Observador !== 'function') {
		return () => {};
	}
	const observador = new Observador(() => publicarTopo(host, doc, converter));
	observador.observe(cartao);
	return () => observador.disconnect();
}

/**
 * Tira a variavel do host: a faixa volta ao `top` do `Announce.css` (desktop e
 * celular deitado). Chamada quando a HUD vertical NAO vale — cobre o aparelho que
 * gira com uma faixa ja posicionada.
 *
 * @param {HTMLElement} host
 */
export function soltarDaVertical(host) {
	host.style.removeProperty(VARIAVEL_DO_TOPO);
}

export default {
	larguraDaColuna,
	larguraLivre,
	larguraDaFaixaNaVertical,
	topoDaFaixaNaVertical,
	ehHudVertical,
	publicarTopo,
	posicionarNaVertical,
	soltarDaVertical
};
