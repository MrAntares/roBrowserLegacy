/**
 * O TETO DA CAMINHADA PARA A SKILL (C19 da auditoria de tela, 29/09/2026).
 *
 * Skill no alvo (ou no chao) fora do alcance: o cliente guarda o pacote da
 * skill em `Session.moveAction`, manda o CZ_REQUEST_MOVE e so solta a skill no
 * `onWalkEnd`. O `PathFinding.search` do roBrowser acha caminho de ate 32
 * celulas (`MAX_WALKPATH`), mas o servidor anda como o rAthena
 * (`unit_walktoxy`, unit.cpp:855-869) e RECUSA calado:
 *
 * - caminho acima de `max_walk_path` (conf/battle/client.conf:42, 17);
 * - acima de 14 passos, sem a reta livre ate o destino (`OFFICIAL_WALKPATH`,
 *   `path_search_long` com `CELL_CHKNOPASS`, path.cpp:132).
 *
 * A recusa do andar e fiel a fonte, e o servidor nao manda nada. O que
 * pendurava era o CLIENTE prometer a skill num caminho que o servidor nunca
 * aceita: o boneco ficava parado e a skill nunca saia, sem uma palavra. Aqui o
 * cliente confere o mesmo teto antes de armar a skill; quando nao cabe, nao
 * manda nada e avisa o jogador no chat.
 *
 * Os numeros e a reta sao os de `servidor/mapa/caminhada-do-rathena.ts` e
 * `servidor/mapa/linha-de-visao.ts` (repo do servidor). NAO mexe na regua de
 * alcance (a C23, euclidiana aqui e circular na fonte): so no teto do andar.
 */

/** `battle_config.max_walk_path` (conf/battle/client.conf:42). */
export const MAX_WALK_PATH = 17;

/** Os passos aceitos SEM a reta livre (unit.cpp:866, `OFFICIAL_WALKPATH`). */
export const PASSOS_SEM_RETA_LIVRE = 14;

/** O aviso no chat quando o alvo esta alem do teto. */
export const TEXTO_LONGE_DEMAIS = 'O alvo está longe demais para andar até ele. Chegue mais perto para usar a habilidade.';

/**
 * `path_search_long` (path.cpp:132): a reta de `de` ate `para` sem celula em
 * que nao se pisa no meio (a origem e o destino nao contam). Mesmo passo a
 * passo de `linhaDeVisaoLivre` no servidor.
 *
 * @param {{x: number, y: number}} de
 * @param {{x: number, y: number}} para
 * @param {(x: number, y: number) => boolean} ehParede
 * @returns {boolean}
 */
export function linhaDeVisaoLivre(de, para, ehParede) {
	let x0 = de.x;
	let y0 = de.y;
	let x1 = para.x;
	let y1 = para.y;
	let dx = x1 - x0;
	if (dx < 0) {
		[x0, x1] = [x1, x0];
		[y0, y1] = [y1, y0];
		dx = -dx;
	}
	const dy = y1 - y0;
	let wx = 0;
	let wy = 0;
	const peso = dx > Math.abs(dy) ? dx : Math.abs(dy);
	while (x0 !== x1 || y0 !== y1) {
		wx += dx;
		wy += dy;
		if (wx >= peso) {
			wx -= peso;
			x0++;
		}
		if (wy >= peso) {
			wy -= peso;
			y0++;
		} else if (wy < 0) {
			wy += peso;
			y0--;
		}
		if ((x0 !== x1 || y0 !== y1) && ehParede(x0, y0)) {
			return false;
		}
	}
	return true;
}

/**
 * O caminho que o `PathFinding.search` achou cabe no que o servidor aceita?
 *
 * `count` e o que o `search` devolve: as celulas do caminho CONTANDO a
 * origem, entao os passos sao `count - 1` (o `path_len` da fonte).
 *
 * @param {number} count
 * @param {{x: number, y: number}} origem
 * @param {{x: number, y: number}} destino - a ultima celula do caminho
 * @param {(x: number, y: number) => boolean} naoAndavel - o `CELL_CHKNOPASS`
 * @returns {boolean}
 */
export function caminhoCabeNoTetoDoServidor(count, origem, destino, naoAndavel) {
	const passos = count - 1;
	if (passos > MAX_WALK_PATH) {
		return false;
	}
	if (passos > PASSOS_SEM_RETA_LIVRE && !linhaDeVisaoLivre(origem, destino, naoAndavel)) {
		return false;
	}
	return true;
}

/**
 * O ATAQUE tambem (lote 5, 30/09/2026): o clique no monstro longe guarda o
 * CZ_REQUEST_ACT em `Session.moveAction` com o mesmo caminho de ate 32 celulas
 * do `PathFinding.search` (EntityControl.onFocus, MobileUI.attackTargeted e o
 * JoystickCharacterControl.attack). O servidor anda como o rAthena e recusa
 * calado o caminho acima do teto (`unit_walktoxy`, unit.cpp:855-869): o boneco
 * ficava parado com o ataque prometido. O rAthena tambem nao diz nada ao
 * cliente oficial nesse caso (o CZ_REQUEST_MOVE recusado nao tem resposta), e
 * a decisao da C19 vale igual aqui: nao armar e avisar.
 */
export const TEXTO_LONGE_DEMAIS_PARA_ATACAR = 'O alvo está longe demais para andar até ele. Chegue mais perto para atacar.';

/**
 * A COLETA tambem (lote 5, segunda rodada): o clique no item longe guarda o
 * CZ_ITEM_PICKUP em `Session.moveAction` e manda o CZ_REQUEST_MOVE para a
 * celula clicada (EntityControl.onMouseDown). O mesmo teto do servidor vale
 * (unit.cpp:855-869), e o oficial tambem fica calado quando o andar e
 * recusado: nao armar e avisar, como no ataque.
 */
export const TEXTO_LONGE_DEMAIS_PARA_PEGAR = 'O item está longe demais para andar até ele. Chegue mais perto para pegá-lo.';

/**
 * O caminho que o `PathFinding.search` devolveu (`out`, `count`) a partir de
 * `pos` cabe no teto do servidor? A ultima celula de `out` e o destino.
 *
 * @param {Array|Float32Array} pos - a posicao de quem anda
 * @param {Array} out - o caminho do PathFinding.search
 * @param {number} count - o que o PathFinding.search devolveu
 * @param {(x: number, y: number) => boolean} naoAndavel - o `CELL_CHKNOPASS`
 * @returns {boolean}
 */
export function caminhoDoPathFindingCabe(pos, out, count, naoAndavel) {
	const origem = { x: pos[0] | 0, y: pos[1] | 0 };
	const destino = { x: out[(count - 1) * 2 + 0], y: out[(count - 1) * 2 + 1] };
	return caminhoCabeNoTetoDoServidor(count, origem, destino, naoAndavel);
}
