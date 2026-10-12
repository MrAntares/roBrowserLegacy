/**
 * O ALCANCE DA SKILL DE CHAO (C23, auditoria de tela, 29/09/2026).
 *
 * O cliente anda ate a celula caber no alcance e so entao manda o
 * `CZ_USE_SKILL_TOGROUND3` (`onUseSkillToPos`, `Session.moveAction`). A fonte
 * confere a celula com `battle_check_range` (rAthena unit.cpp:2695-2696), que
 * para jogador usa a regua CIRCULAR do cliente: `check_distance_client`
 * (path.cpp:485-490) sobre `distance_client` (path.cpp:510-521),
 * `floor(sqrt(dx*dx + dy*dy) - 0.1) <= alcance`, com alcance negativo valendo 0.
 *
 * A busca do `PathFinding` para quando `sqrt(dx*dx + dy*dy) <= raio`. Este
 * modulo acha o raio que da EXATAMENTE as mesmas celulas que a regua da fonte,
 * para o cliente parar onde o servidor aceita, nem uma celula antes nem depois.
 */

/**
 * A regua sobre o quadrado da distancia (`dx*dx + dy*dy`). O `if (temp_dist <
 * 0) temp_dist = 0` da fonte (path.cpp:516) nao entra: so a propria celula da
 * negativo, e `floor(-0.1) = -1` ja cabe em qualquer alcance >= 0.
 */
function cabeNaRegua(quadrado, alcance) {
	return Math.floor(Math.sqrt(quadrado) - 0.1) <= (alcance < 0 ? 0 : alcance);
}

/** `check_distance_client` (path.cpp:485-490 + 510-521). */
export function noAlcanceDoCliente(dx, dy, alcance) {
	return cabeNaRegua(dx * dx + dy * dy, alcance);
}

/**
 * O raio da busca: a raiz do MAIOR quadrado de distancia inteiro que a regua
 * da fonte ainda aceita. Toda celula tem `dx*dx + dy*dy` inteiro, entao
 * `sqrt(dx*dx + dy*dy) <= raio` casa celula a celula com `noAlcanceDoCliente`.
 */
export function raioDaBuscaDoChao(alcance) {
	let n = 0;
	while (cabeNaRegua(n + 1, alcance)) {
		n++;
	}
	return Math.sqrt(n);
}
