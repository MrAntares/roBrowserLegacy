/**
 * O ALCANCE NO FIM DA CAMINHADA (lote 5, resto do C23, 30/09/2026).
 *
 * A skill fora do alcance fica guardada em `Session.moveAction` e sai no
 * `onWalkEnd` (MapEngine.js). O ponto de parada e o do `PathFinding` do
 * cliente, mas o boneco para onde o SERVIDOR o deixou - e a auditoria de tela
 * mediu o WZ_METEOR (Range 9) saindo a dx 8, dy 6 (circular 10): o servidor
 * descartou calado (`battle_check_range`, rAthena unit.cpp:2362 e :2695), fiel.
 *
 * Aqui o cliente re-confere no fim da caminhada, com a regua da fonte
 * (`check_distance_client`, path.cpp:485-521: `floor(sqrt(dx*dx + dy*dy) -
 * 0.1) <= alcance`, a mesma de alcanceDaSkillNoChao.js):
 * - dentro: solta o pacote;
 * - fora: anda mais UMA vez ate o alcance (`REPETICOES_DA_CAMINHADA`);
 * - fora de novo: nao solta (o servidor calaria do mesmo jeito).
 */
import { noAlcanceDoCliente } from './alcanceDaSkillNoChao.js';

/** Quantas caminhadas extras a skill guardada pode pedir antes de desistir. */
export const REPETICOES_DA_CAMINHADA = 1;

/**
 * @param {{ pos: ArrayLike<number>, alvo: {x: number, y: number} | null, alcance: number, repeticoes: number }} p
 *   `alvo` `null` = o alvo sumiu da tela; quem decide e o servidor, como antes.
 * @returns {'soltar' | 'andar' | 'desistir'}
 */
export function decidirNoFimDaCaminhada(p) {
	if (p.alvo === null) {
		return 'soltar';
	}
	const dx = p.alvo.x - Math.round(p.pos[0]);
	const dy = p.alvo.y - Math.round(p.pos[1]);
	if (noAlcanceDoCliente(dx, dy, p.alcance)) {
		return 'soltar';
	}
	return p.repeticoes < REPETICOES_DA_CAMINHADA ? 'andar' : 'desistir';
}
