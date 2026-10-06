/**
 * UI/Components/TemporadaIdle/parcialDaTemporada.js
 *
 * O PARCIAL DA TEMPORADA (a banda das janelas, 06/10/2026) - a metade do
 * cliente, pura.
 *
 * O `ZC_RAGIDLE_TEMPORADA` descia o estado INTEIRO (~20 KB) a cada verbo e a
 * cada pedido do menu do topo (a bolinha, a cada 5 min). O servidor
 * (`servidor/temporada/parcial-da-temporada.ts`, no repositorio do jogo) agora
 * numera cada envio (`rev`, por conexao) e, quando o pedido traz de volta a
 * revisao que a janela tem na mao (`base`), responde so as TROCAS
 * (`[caminho, valor]`) que levam esse estado ao de agora, num parcial `v: 4`.
 *
 * A janela continua sem calcular nada: cada troca chega pronta e so muda de
 * lugar. O cliente antigo nao manda `base`, recebe o inteiro `v: 3` de sempre
 * e ignoraria um `v: 4` pela guarda de versao.
 */

/** A versao do parcial no fio (o estado inteiro e `v: 3`). */
export const VERSAO_DO_PARCIAL_DA_TEMPORADA = 4;

export function ehParcialDaTemporada(dados) {
	return !!dados && dados.v === VERSAO_DO_PARCIAL_DA_TEMPORADA;
}

/**
 * O corpo do pedido com a revisao que a janela tem (`base`). Sem estado na
 * mao (o personagem acabou de entrar, ou a janela esqueceu), vai sem `base`, e
 * o servidor responde o inteiro.
 */
export function comBase(corpo, estado) {
	if (estado && typeof estado.rev === 'number') {
		return { ...corpo, base: estado.rev };
	}
	return { ...corpo };
}

function copia(valor) {
	return valor === undefined ? undefined : JSON.parse(JSON.stringify(valor));
}

/**
 * Aplica o parcial sobre o estado que a janela tem.
 *
 * Devolve o estado NOVO (o de antes fica intacto), com a `rev` nova e o
 * `resultado` do verbo; ou `null` quando o parcial nao cai sobre este estado
 * (sem estado, ou a revisao de partida `de` nao e a que a janela tem) - quem
 * chama pede o inteiro de novo.
 */
export function aplicarParcialDaTemporada(estado, parcial) {
	if (!ehParcialDaTemporada(parcial) || !estado || estado.rev !== parcial.de || !Array.isArray(parcial.trocas)) {
		return null;
	}
	const montado = aplicarTrocas(estado, parcial.trocas);
	if (!montado) {
		return null;
	}
	return { ...montado, rev: parcial.rev, resultado: parcial.resultado == null ? null : parcial.resultado };
}

/**
 * As TROCAS `[caminho, valor]` aplicadas numa COPIA do estado (o de antes fica
 * intacto). Devolve a copia, ou `null` quando uma troca nao cai sobre ele
 * (caminho que nao e lista, que atravessa folha ou o prototipo).
 *
 * E a metade generica do parcial, e por isso exportada: a janela de
 * habilidades (`IdleSkills/parcialDasSkills.js`) aplica o mesmo formato.
 */
export function aplicarTrocas(estado, trocas) {
	const raiz = { r: copia(estado) };
	for (const troca of trocas) {
		const caminho = Array.isArray(troca) ? troca[0] : null;
		if (!Array.isArray(caminho)) {
			return null;
		}
		let no = raiz;
		let chave = 'r';
		for (const passo of caminho) {
			// Todo passo e conferido aqui, inclusive o ultimo (a chave da folha).
			if (passo === '__proto__' || passo === 'constructor' || passo === 'prototype') {
				return null;
			}
			no = no[chave];
			if (!no || typeof no !== 'object') {
				return null;
			}
			chave = passo;
		}
		no[chave] = copia(troca[1]);
	}
	return raiz.r;
}
