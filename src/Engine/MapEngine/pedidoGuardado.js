/**
 * O PEDIDO DE SKILL GUARDADO (C47 / C-1, auditoria de tela, 30/09/2026).
 *
 * O jogador pede uma skill e ela fica guardada em dois lugares ate sair: o
 * `_pedidoNoGolpe` (a janela do golpe, C32: um `setTimeout`) e o
 * `Session.moveAction` (a caminhada ate o alcance, C19/C23). Nada os soltava
 * quando o jogador desistia: o clique no chao zerava so o `moveAction`, e a
 * troca de mapa e a morte nenhum dos dois. A skill velha saia depois, com o
 * x,y do mapa de antes ou arrastando o boneco de volta de onde ele fugiu.
 *
 * O cliente oficial nao guarda pedido nenhum (anda e usa pelo que o servidor
 * mandou), entao descartar ao desistir e a forma fiel.
 */
import { criarPedidosPorAtor } from './pedidoAdiadoPeloGolpe.js';

/**
 * C32 (29/09/2026): o pedido dentro da janela do golpe espera, em vez de sumir.
 * Lote 8 (C-4): um pedido POR ATOR, para o homunculo nao cancelar o do jogador.
 */
export const pedidoNoGolpe = criarPedidosPorAtor({
	agendar: (fn, ms) => setTimeout(fn, ms),
	cancelar: id => clearTimeout(id)
});

/**
 * Descarta tudo o que esta guardado para soltar uma skill depois.
 *
 * @param {{ moveAction: object|null, moveActionAlcance: object|null, moveActionEspera: object|null }} sessao
 * @param {{ cancelar: (ator?: unknown) => void }} [adiado] - o pedido da janela do golpe (teste injeta)
 * @param {unknown} [ator] - lote 8 (C-4): so o pedido deste ator cai (o `entity.GID` do jogador, no
 *   clique de andar); sem ele cai o de todos (troca de mapa, morte)
 */
export function descartarPedidoGuardado(sessao, adiado = pedidoNoGolpe, ator = undefined) {
	adiado.cancelar(ator);
	sessao.moveAction = null;
	sessao.moveActionAlcance = null;
	sessao.moveActionEspera = null;
}

/*
 * O JOGADOR PEDIU PARA ANDAR (lote 7, achados #6 e #29 da revisao adversarial).
 *
 * O C-1 so foi ligado ao clique esquerdo do mapa, a troca de mapa e a morte.
 * Os outros gestos que mandam CZ_REQUEST_MOVE por vontade do jogador (o
 * joystick do celular, o gamepad, ligar o seguir, o pegar item do celular)
 * nao descartavam nada - e o ZC_NOTIFY_PLAYERMOVE deles CONFIRMAVA o pedido
 * velho, porque `confirmarPeloServidor` (confirmacaoDaCaminhada.js) so
 * compara o pacote da espera com o `moveAction`, sem saber a que andar o
 * pacote responde. No fim da caminhada de fuga a skill velha saia, ou o C23
 * puxava o boneco de volta ao alvo. O cliente oficial substitui a
 * aproximacao pendente pelo comando novo de andar (nao guarda pedido nenhum),
 * entao todo gesto de andar passa por `jogadorPediuParaAndar`.
 */

/**
 * Entre dois andares do MESMO gesto continuo (o stick segurado manda um a cada
 * 100 ms: JoystickPollingLoop.POLL_RATE_ACTIVE e o setInterval do MobileUI) a
 * pausa e menor que isto; passou disso, o jogador soltou e empurrou de novo.
 */
export const FOLGA_DO_GESTO_DE_ANDAR_MS = 300;

/**
 * O estado de um gesto de andar continuo (joystick, stick do gamepad).
 *
 * @returns {{ ultimoEm: number|null, encerrar: () => void }}
 */
export function criarGestoDeAndar() {
	return {
		ultimoEm: null,
		/** O jogador soltou o joystick: o proximo toque e gesto novo. */
		encerrar() {
			this.ultimoEm = null;
		}
	};
}

/**
 * O jogador mandou o personagem andar por conta propria: o pedido de skill
 * guardado cai (a skill nao sai no fim dessa caminhada nem puxa o boneco de
 * volta ao alvo). Lote 8 (C-4): cai o do PERSONAGEM; o pedido que o homunculo
 * ou o mercenario guardaram na janela do golpe deles e ordem deles e sai.
 *
 * Num gesto CONTINUO (`gesto`, de `criarGestoDeAndar`) so o inicio descarta:
 * a skill pedida depois, com o stick ainda segurado, e o pedido mais novo do
 * jogador e nao pode morrer no tique seguinte. O laco do seguir automatico
 * (500 ms) tambem nao chama isto a cada tique - so quem o LIGA.
 *
 * @param {{ moveAction: object|null, moveActionAlcance: object|null, moveActionEspera: object|null }} sessao
 * @param {{ gesto?: { ultimoEm: number|null }, agora?: number, adiado?: { cancelar: (ator?: unknown) => void } }} [opcoes]
 * @returns {boolean} `true` quando descartou (inicio de gesto ou andar avulso)
 */
export function jogadorPediuParaAndar(sessao, { gesto = null, agora = Date.now(), adiado = pedidoNoGolpe } = {}) {
	if (gesto) {
		const continua = gesto.ultimoEm !== null && agora - gesto.ultimoEm <= FOLGA_DO_GESTO_DE_ANDAR_MS;
		gesto.ultimoEm = agora;
		if (continua) {
			return false;
		}
	}
	descartarPedidoGuardado(sessao, adiado, sessao.Entity ? sessao.Entity.GID : undefined);
	return true;
}
