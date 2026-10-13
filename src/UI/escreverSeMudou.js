/**
 * UI/escreverSeMudou.js
 *
 * ESCREVER NO DOM SO O QUE MUDOU (D-2374, 13/10/2026).
 *
 * O servidor reenvia a ficha inteira (uns vinte `ZC_PAR_CHANGE` mais os
 * `ZC_COUPLESTATUS`) a cada ficha suja do tique — buff que entra ou sai,
 * equipamento, item —, quase sempre com os MESMOS numeros. As janelas
 * nativas (`BasicInfo`, `WinStats`) escreviam cada um de novo: `textContent`
 * com o mesmo texto troca o no de texto por outro igual, e isso e uma mutacao
 * de verdade — invalida estilo e layout, e acorda os `MutationObserver` que
 * vigiam a raiz (o do auto-preenchimento do `GUIComponent` e o da traducao).
 *
 * Estes ajudantes comparam com o que JA ESTA no DOM, e nao com um memo do
 * ultimo valor pedido: se alguem reescreveu o elemento por outro caminho (a
 * traducao, uma janela redesenhada), a comparacao ve e escreve, como antes.
 * Quando pulam, o DOM fica exatamente como a escrita o deixaria.
 */

/**
 * `el.textContent = valor`, so se o texto do elemento for outro.
 *
 * "Igual" e estrito: UM unico filho, de texto, com o mesmo conteudo (ou nenhum
 * filho, para o texto vazio). Um elemento com filhos ELEMENTO cujo texto
 * concatenado coincide NAO e igual — a escrita os trocaria por um texto so.
 *
 * @param {Element|null|undefined} el
 * @param {*} valor o que iria para `textContent` (null/undefined viram '')
 * @returns {boolean} true quando escreveu
 */
export function escreverTexto(el, valor) {
	if (!el) {
		return false;
	}
	const texto = valor === null || valor === undefined ? '' : String(valor);
	const filho = el.firstChild;
	if (texto === '') {
		if (filho === null) {
			return false;
		}
	} else if (filho !== null && filho === el.lastChild && filho.nodeType === 3 && filho.data === texto) {
		return false;
	}
	el.textContent = valor;
	return true;
}

/**
 * `el.style[propriedade] = valor`, so se o valor serializado for outro.
 *
 * O navegador normaliza o que le de volta (`url(x)` vira `url("x")`, por
 * exemplo). Quando a normalizacao difere do texto pedido a comparacao falha e
 * a escrita acontece, como antes: o ajudante nunca pula uma escrita que
 * mudaria algo, so as que provadamente nao mudam. `comoOLido` e a forma
 * normalizada que o chamador SABE que o navegador devolve para este valor
 * (`urlComoOLido`): igual a ela tambem e "mesmo valor".
 *
 * @param {HTMLElement|null|undefined} el
 * @param {string} propriedade
 * @param {*} valor
 * @param {string} [comoOLido]
 * @returns {boolean} true quando escreveu
 */
export function escreverEstilo(el, propriedade, valor, comoOLido) {
	if (!el) {
		return false;
	}
	const atual = el.style[propriedade];
	if (atual === String(valor) || (comoOLido !== undefined && atual === comoOLido)) {
		return false;
	}
	el.style[propriedade] = valor;
	return true;
}

/**
 * Como o navegador LE DE VOLTA `url(<endereco>)`: entre aspas duplas
 * (CSSOM, "serialize a URL"). Endereco com aspa ou barra invertida seria
 * escapado na leitura; para esses devolve `undefined` e a escrita sempre
 * acontece — nunca afirma igualdade que nao pode garantir.
 *
 * @param {string} endereco
 * @returns {string|undefined}
 */
export function urlComoOLido(endereco) {
	const texto = String(endereco);
	if (texto.includes('"') || texto.includes('\\') || texto.includes('\n') || texto.includes('\r')) {
		return undefined;
	}
	return `url("${texto}")`;
}

/**
 * `el.title = valor`, so se o titulo for outro.
 *
 * @param {HTMLElement|null|undefined} el
 * @param {*} valor
 * @returns {boolean} true quando escreveu
 */
export function escreverTitulo(el, valor) {
	if (!el) {
		return false;
	}
	if (el.title === String(valor)) {
		return false;
	}
	el.title = valor;
	return true;
}
