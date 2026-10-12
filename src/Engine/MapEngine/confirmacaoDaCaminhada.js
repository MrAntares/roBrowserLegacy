/**
 * A CAMINHADA CONFIRMADA PELO SERVIDOR (C47, auditoria de tela, 30/09/2026).
 *
 * A skill fora do alcance fica em `Session.moveAction` e sai no `onWalkEnd`
 * (MapEngine.js). Mas o `onWalkEnd` roda no fim de QUALQUER caminhada do
 * boneco (`EntityWalk.js`, `finishWalk`), e o boneco so anda com o
 * `ZC_NOTIFY_PLAYERMOVE` (Main.js, `onPlayerMove`). Dois buracos:
 *
 * - o boneco ja andava (um clique antes, a caca) quando a skill foi pedida: a
 *   caminhada VELHA termina antes de o servidor responder o CZ_REQUEST_MOVE
 *   novo, e a skill sai do lugar errado;
 * - o servidor recusa o andar calado (`unit_walktoxy`, rAthena
 *   unit.cpp:855-869: sem caminho, acima de `max_walk_path`, acima de 14 sem a
 *   reta livre; o oficial tambem nao responde nada): a skill fica armada e sai
 *   no fim da PROXIMA caminhada, qualquer que seja, de qualquer lugar.
 *
 * O cliente oficial so solta a acao guardada depois de andar o que o servidor
 * mandou andar. Aqui a skill guardada espera o `ZC_NOTIFY_PLAYERMOVE` que veio
 * DEPOIS do pedido; o fim de uma caminhada antes dele nao e o do pedido. Sem
 * resposta em `ESPERA_DA_CONFIRMACAO_MS`, o pedido e descartado e o jogador e
 * avisado, como a C19 (tetoDaCaminhadaDaSkill.js).
 */

/**
 * Quanto a skill guardada espera o servidor confirmar a caminhada. Cobre a
 * ida e volta e a troca de rumo no fim do passo em curso (`change_walk_target`,
 * unit.cpp:894-899), que so responde quando o passo termina.
 */
export const ESPERA_DA_CONFIRMACAO_MS = 2000;

/** O aviso quando o servidor nao aceitou a caminhada. */
export const TEXTO_CAMINHADA_RECUSADA = 'Não foi possível andar até o alvo. Chegue mais perto para usar a habilidade.';

/** O aviso quando o boneco parou fora do alcance e nem a segunda caminhada resolveu (C-2). */
export const TEXTO_FORA_DO_ALCANCE = 'O alvo continua fora do alcance. Chegue mais perto para usar a habilidade.';

/**
 * Arma a espera do pedido `pacote` (o que esta em `sessao.moveAction`) logo
 * depois de mandar o CZ_REQUEST_MOVE dele.
 *
 * @param {{ moveAction: object|null, moveActionEspera: object|null }} sessao
 * @param {object} pacote
 * @returns {{ pacote: object, confirmada: boolean }} a espera armada
 */
export function armarEspera(sessao, pacote) {
	const espera = { pacote, confirmada: false };
	sessao.moveActionEspera = espera;
	return espera;
}

/**
 * O `ZC_NOTIFY_PLAYERMOVE` chegou: a caminhada que ele comeca e a do pedido.
 *
 * @param {{ moveAction: object|null, moveActionEspera: object|null }} sessao
 */
export function confirmarPeloServidor(sessao) {
	const espera = sessao.moveActionEspera;
	if (espera && espera.pacote === sessao.moveAction) {
		espera.confirmada = true;
	}
}

/**
 * O fim de caminhada que acabou de acontecer pode soltar `sessao.moveAction`?
 * So nao pode quando o pedido guardado ainda espera a confirmacao: a
 * caminhada que terminou e mais velha que ele.
 *
 * @param {{ moveAction: object|null, moveActionEspera: object|null }} sessao
 * @returns {boolean}
 */
export function fimDaCaminhadaEhDoPedido(sessao) {
	const espera = sessao.moveActionEspera;
	return !(espera && espera.pacote === sessao.moveAction && !espera.confirmada);
}

/**
 * O prazo da `espera` venceu: se o pedido dela ainda esta guardado e o
 * servidor nao confirmou, ele e descartado.
 *
 * @param {{ moveAction: object|null, moveActionAlcance: object|null, moveActionEspera: object|null }} sessao
 * @param {{ pacote: object, confirmada: boolean }} espera
 * @returns {boolean} `true` quando descartou (e o jogador deve ser avisado)
 */
export function vencerEspera(sessao, espera) {
	if (sessao.moveActionEspera !== espera || espera.confirmada || sessao.moveAction !== espera.pacote) {
		return false;
	}
	sessao.moveAction = null;
	sessao.moveActionAlcance = null;
	sessao.moveActionEspera = null;
	return true;
}
