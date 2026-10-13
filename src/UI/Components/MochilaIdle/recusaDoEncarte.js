/**
 * UI/Components/MochilaIdle/recusaDoEncarte.js
 *
 * A RECUSA DO ENCAIXE DE CARTA TEM DE APARECER (bug #1 de 13/10/2026: "abrir o
 * cinto, selecionar a carta e Equipar: a janela fecha e a carta nao equipa").
 *
 * O servidor sempre explicou a recusa, mas pela fala do sistema
 * (`ZC_RAGIDLE_LOG`), que cai na aba Logs do chat: no celular a Mochila e
 * painel de tela cheia e cobre o chat, e no desktop a aba ativa quase nunca e a
 * Logs. O resultado e o relato do jogador: a janela de escolha nem abre (ou
 * fecha) e nada diz por que. O caso comum e uma carta que o motor ainda nao
 * implementa (Smokie, Sapo Venenoso...): nenhuma peca a aceita.
 *
 * Aqui o tratador da fala do sistema reconhece as duas falas do encaixe e o
 * `Main.js` as repete na faixa de aviso (Announce), que e visivel nos dois
 * aparelhos. A fala continua indo ao chat: a faixa e um reforco, nao troca.
 */

/** "Sistema : Nao deu para encaixar a carta: <motivo>" (recusa do encaixe e da lista). */
const RECUSA_DO_ENCAIXE = /N[aã]o deu para encaixar a carta:\s*(.+)$/i;

/** "Sistema : Nenhuma peca da sua mochila aceita <carta>. Lembre: ..." (lista vazia). */
const SEM_PECA = /Nenhuma pe[cç]a da sua mochila aceita\s+.+$/i;

/**
 * Le a fala do sistema e devolve o texto para a faixa de aviso, ou `null` se a
 * fala nao for uma recusa de encaixe.
 *
 * @param {string} msg o corpo do pacote ("Sistema : Nao deu para encaixar a carta: ...")
 * @returns {string|null}
 */
export function avisoDaRecusaDoEncarte(msg) {
	if (typeof msg !== 'string') {
		return null;
	}
	const limpa = msg.replace(/\0+$/, '');
	const recusa = RECUSA_DO_ENCAIXE.exec(limpa);
	if (recusa) {
		return 'Nao deu para encaixar a carta: ' + recusa[1].trim();
	}
	const semPeca = SEM_PECA.exec(limpa);
	if (semPeca) {
		return semPeca[0].trim();
	}
	return null;
}
