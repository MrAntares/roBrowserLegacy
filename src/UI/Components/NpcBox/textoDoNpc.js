/**
 * UI/Components/NpcBox/textoDoNpc.js
 *
 * A FALA DO NPC EM HTML, COM TUDO ESCAPADO MENOS AS TAGS DO RO (12/10/2026,
 * auditoria anti-exploit).
 *
 * A caixa de dialogo poe a fala em `innerHTML` para desenhar o link de item
 * (`<ITEM>`/`<ITEMLINK>`), o de navegacao (`<NAVI>`) e a cor (`^RRGGBB`). Ate
 * aqui so o CONTEUDO dessas tags era escapado (D-1308): o texto fora delas ia
 * cru, e qualquer trecho da fala que viesse de um jogador (um nome, um texto
 * digitado num `input` de NPC) virava HTML executavel. Agora a fala e cortada
 * nas tags do RO; o que fica entre elas e escapado, e cada tag vira o seu
 * `span` com o conteudo escapado. A cor vem por ultimo: `^RRGGBB` nao tem
 * caractere que o escape toque.
 *
 * Nenhuma fala do servidor depende de HTML cru (conferido em 12/10/2026: as
 * falas de `servidor/fala-do-npc.ts` e dos scripts de `rathena-custom/npc` nao
 * tem tag HTML), e o RO original tambem nao o interpreta.
 *
 * Puro de proposito: roda sem navegador e e testavel sozinho.
 */

// Relativo, e nao pelo alias do vite: o portao do servidor carrega este modulo
// pelo Node (`servidor/mapa/texto-do-npc-no-cliente.test.ts`).
import { escaparHtml } from '../../../Utils/escaparHtml.js';

/**
 * As duas tags do RO que a caixa desenha, numa alternancia so: o ITEM nos
 * grupos 1 a 3, o NAVI nos grupos 4 e 5. As formas sao as de antes (D-1308).
 */
const TAGS_DO_RO = /<(ITEMLINK|ITEM)>([\s\S]*?)<INFO>([\s\S]*?)<\/INFO><\/\1>|<NAVI>([^<]+)<INFO>([^<]+)<\/INFO><\/NAVI>/g;

function linkDeItem(itemName, itemId) {
	// D-1308: `itemId` cai em ATRIBUTO e `itemName` em texto; escapa os dois.
	return `<span class="item-link" data-item-id="${escaparHtml(itemId)}">${escaparHtml(itemName)}</span>`;
}

function linkDeNavegacao(displayName, naviInfo) {
	// D-1308: os dois caem em ATRIBUTO e em texto; uma aspa quebrava o atributo.
	return `<span class="navi-link" data-navi-info="${escaparHtml(naviInfo)}" data-navi-name="${escaparHtml(displayName)}">${escaparHtml(displayName)}</span>`;
}

/**
 * Process color codes in text (^RRGGBB)
 */
function corDoRo(html) {
	return html
		.replace(/\^([0-9A-Fa-f]{6})/g, (match, color) => {
			return `<span style="color:#${color}">`;
		})
		.replace(/\^000000/g, '</span>');
}

/**
 * @param {*} text - a fala como o servidor a mandou
 * @returns {string} HTML seguro para `innerHTML`
 */
export function textoDoNpcEmHtml(text) {
	if (!text) {
		return '';
	}
	const fala = String(text);
	let html = '';
	let ultimo = 0;
	for (const m of fala.matchAll(TAGS_DO_RO)) {
		html += escaparHtml(fala.slice(ultimo, m.index));
		html += m[1] !== undefined ? linkDeItem(m[2], m[3]) : linkDeNavegacao(m[4], m[5]);
		ultimo = m.index + m[0].length;
	}
	html += escaparHtml(fala.slice(ultimo));
	return corDoRo(html);
}
