/**
 * UI/Components/PartyFriends/barraDoMembro.js
 *
 * A BARRA DE VIDA DO MEMBRO DO GRUPO SEM REDESENHO IGUAL (D-2385, 14/10/2026).
 *
 * `updateMemberLife` roda a cada `ZC_PAR_CHANGE` de HP e de HP maximo do PROPRIO
 * jogador (Main.js) e a cada `ZC_NOTIFY_HP_TO_GROUPM` dos outros (Group.js). O
 * servidor reenvia a ficha inteira a cada ficha suja do tique (D-2374), quase
 * sempre com os mesmos numeros, e o HP e o HP maximo chegam em DOIS pacotes da
 * mesma ficha. Cada chamada fazia `canvas.width = 75`, que zera o bitmap e a
 * memoria do contexto, e pintava tudo de novo, mais o texto e a visibilidade:
 * a mesma barra, refeita do zero, para ficar igual.
 *
 * O CANVAS: o desenho e uma funcao so de (hp, maxhp). Fica guardado o par do
 * ultimo desenho de CADA canvas (o no novo de `renderPartyMember`, que troca o
 * `outerHTML`, e outro canvas e desenha). Pula so quando o par e o mesmo E o
 * canvas segue com 75x5 (redimensionar para outro tamanho apaga o bitmap) E o
 * contexto nao foi perdido nem devolvido desde entao (um canvas 2D pode perder
 * o contexto; o devolvido volta EM BRANCO: os dois eventos derrubam a memoria,
 * como em `EntityLife`, D-2374).
 *
 * O CONTRATO que faz isto exato: o tamanho e o bitmap destes canvas so este
 * modulo escreve. Quem pinta por fora (o `clearRect` do membro destacado sem
 * vida) chama `esquecerBarraDoMembro`; quem um dia redimensionar para 75x5 de
 * novo por fora tambem tera de chamar (o tamanho igual nao e detectavel).
 *
 * O TEXTO e a VISIBILIDADE vao por `escreverSeMudou.js`: comparam com o que JA
 * ESTA no DOM, entao nao dependem de memoria nenhuma.
 */

const LARGURA = 75;
const ALTURA = 5;

/** canvas -> { hp, maxhp } do ultimo desenho. */
const _desenho = new WeakMap();
/** Os canvas que ja tem os ouvintes da perda de contexto. */
const _vigiados = new WeakSet();

function vigiar(canvas) {
	if (_vigiados.has(canvas) || typeof canvas.addEventListener !== 'function') {
		return;
	}
	_vigiados.add(canvas);
	const esquecer = () => _desenho.delete(canvas);
	canvas.addEventListener('contextlost', esquecer);
	canvas.addEventListener('contextrestored', esquecer);
}

/** O desenho de antes, sem guarda (o oraculo do teste compara contra ele). */
export function pintarBarraDoMembro(canvas, hp, maxhp) {
	const lifeRatio = hp / maxhp;
	const ctx = canvas.getContext('2d');
	const width = Math.floor(lifeRatio * LARGURA);
	canvas.width = LARGURA;
	canvas.height = ALTURA;
	ctx.clearRect(0, 0, LARGURA, ALTURA);
	ctx.fillStyle = lifeRatio <= 0.25 ? '#ef1010' : '#32cd32';
	ctx.fillRect(0, 0, width, ALTURA);
}

/**
 * Pinta a barra (hp > 0 de `maxhp > 0`, quem chama ja conferiu) se ela nao estiver pintada com este par.
 * @returns {boolean} true quando pintou
 */
export function desenharBarraDoMembro(canvas, hp, maxhp) {
	const antes = _desenho.get(canvas);
	if (antes && antes.hp === hp && antes.maxhp === maxhp && canvas.width === LARGURA && canvas.height === ALTURA) {
		return false;
	}
	pintarBarraDoMembro(canvas, hp, maxhp);
	vigiar(canvas);
	_desenho.set(canvas, { hp, maxhp });
	return true;
}

/** Alguem pintou no canvas por fora daqui: a proxima barra desenha. */
export function esquecerBarraDoMembro(canvas) {
	_desenho.delete(canvas);
}
