/**
 * NENHUMA RECUSA DE SKILL SAI MUDA (C3B da auditoria de tela, 29/09/2026).
 *
 * O `onSkillResult` do roBrowser so tinha texto para as causas 1-10, 13 e 83
 * de `ZC_ACK_TOUSESKILL`. O servidor tambem manda a 0 (`USESKILL_FAIL_LEVEL`,
 * a causa padrao de `clif_skill_fail`, clif.hpp:407 e :984), a 57
 * (`USESKILL_FAIL_CART`, clif.hpp:464) e a 74 (`USESKILL_FAIL_SPIRITS`,
 * clif.hpp:482, com a quantidade no NUM), e essas caiam no `if (error)` com
 * zero: chat vazio. Os duetos do Bardo sem parceiro, o Benedictio sem os dois
 * Acolitos e o Hiding do Grimtooth recusavam assim.
 *
 * Aqui o texto em portugues das causas que o msgstringtable desta instalacao
 * nao cobre pelo `switch` antigo, e um texto geral para qualquer outra: o
 * jogador sempre le por que a skill nao saiu.
 */

export const CAUSA_NIVEL = 0;
export const CAUSA_ALVO = 11;
export const CAUSA_CARRINHO = 57;
export const CAUSA_ESFERAS = 74;

export const TEXTO_GERAL = 'Não foi possível usar a habilidade.';

/**
 * O texto proprio desta causa, ou `null` se o `switch` antigo (msgstringtable)
 * ja a cobre.
 *
 * @param {number} causa - `pkt.cause`
 * @param {number} num - `pkt.NUM`
 * @return {string|null}
 */
export function textoDaCausaSemMensagem(causa, num) {
	switch (causa) {
		case CAUSA_NIVEL:
			// Com NUM (o nivel de Habilidades Basicas, AL_WARP, TF_STEAL...) quem
			// responde e o ramo do NUM no `onSkillResult`, com a mensagem propria.
			return num ? null : TEXTO_GERAL;
		case CAUSA_ALVO:
			return 'Não é possível usar esta habilidade neste alvo.';
		case CAUSA_CARRINHO:
			return 'É preciso ter um carrinho para usar esta habilidade.';
		case CAUSA_ESFERAS:
			return num > 0
				? `São necessárias ${num} esferas espirituais para usar esta habilidade.`
				: 'Faltam esferas espirituais para usar esta habilidade.';
		default:
			return null;
	}
}
