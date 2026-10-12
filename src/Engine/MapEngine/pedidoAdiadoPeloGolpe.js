/**
 * O PEDIDO DE SKILL DENTRO DA JANELA DO GOLPE (C32 da auditoria de tela, 29/09/2026).
 *
 * O roBrowser recusa no cliente o pedido que chega antes de `entity.amotionTick`
 * ("Client side minimum delay") e sai com `return` mudo. O `amotionTick` e
 * armado por todo golpe e toda skill de dano do proprio personagem, inclusive
 * as que a rotacao idle dispara sozinha (Entity.js), por ~1 s. O clique do
 * jogador nessa janela sumia sem pacote e sem mensagem: foi o SM_BASH do
 * Cavaleiro na auditoria. O cliente oficial nao tem essa guarda, e o rAthena,
 * quando recusa por delay, avisa (clif.cpp:12935-12937).
 *
 * Aqui o pedido ESPERA a janela vencer e sai. Um pedido por vez: o clique novo
 * substitui o que esperava, como o clique do jogador substitui o anterior.
 * Lote 8 (C-4): o "por vez" vale POR ATOR (jogador, homunculo, mercenario), ver
 * `criarPedidosPorAtor` no fim deste arquivo.
 */

/** Margem depois do fim da janela, em ms (um quadro). */
export const MARGEM_MS = 16;

/**
 * @param {{ agendar: (fn: () => void, ms: number) => unknown, cancelar: (id: unknown) => void }} relogio
 */
export function criarPedidoAdiado(relogio) {
	let pendente = null;
	return {
		/**
		 * Se `agora` ainda esta dentro da janela que termina em `fimDaJanela`,
		 * guarda `repetir` para rodar quando ela vencer e devolve true (o
		 * chamador para aqui). Fora da janela devolve false e nada guarda.
		 */
		adiarSeNaJanela(fimDaJanela, agora, repetir) {
			if (!(fimDaJanela > agora)) {
				return false;
			}
			if (pendente !== null) {
				relogio.cancelar(pendente);
			}
			pendente = relogio.agendar(() => {
				pendente = null;
				repetir();
			}, fimDaJanela - agora + MARGEM_MS);
			return true;
		},
		/**
		 * C47 (C-1): descarta o pedido que espera, se ha. O clique de andar, a
		 * troca de mapa e a morte chamam: o pedido velho nao pode sair depois
		 * deles (arrastava o boneco de volta, ou saia no mapa novo com o x,y do
		 * velho).
		 */
		cancelar() {
			if (pendente !== null) {
				relogio.cancelar(pendente);
				pendente = null;
			}
		},
		/** Ha pedido esperando? (para teste e diagnostico) */
		temPendente() {
			return pendente !== null;
		}
	};
}

/*
 * LOTE 8, C-4 (auditoria de tela, 02/10/2026): UM pedido guardado POR ATOR.
 *
 * O `_pedidoNoGolpe` era um slot unico para o jogador, o homunculo e o
 * mercenario (`onUseSkill` serve os tres, e o `onUseSkillToPos` o jogador e o
 * homunculo). O clique do homunculo dentro da janela do jogador (ou o
 * contrario) cancelava o pedido que esperava, calado: sem pacote e sem
 * mensagem, o sintoma que o C32 dizia consertar. A janela e de cada unidade
 * (cada `entity.amotionTick` e armado pelo golpe DELA), e na fonte o delay
 * tambem e: o `canact_tick` mora no `unit_data` de cada unidade (rAthena
 * clif.cpp:12937 jogador, :12776 e :12801 homunculo, :12833 e :12852
 * mercenario; unit.cpp:1972 e :1986), entao o delay de uma nao barra a outra.
 *
 * No MESMO ator o clique novo continua substituindo o velho: e o comando mais
 * novo do jogador, como o andar novo substitui a aproximacao pendente no
 * cliente oficial (que nao guarda pedido de skill nenhum), e o C32 fixou.
 */

/**
 * @param {{ agendar: (fn: () => void, ms: number) => unknown, cancelar: (id: unknown) => void }} relogio
 */
export function criarPedidosPorAtor(relogio) {
	/** ator (o `entity.GID`) -> o pedido adiado dele. Entra ao adiar, sai ao sair ou ao cancelar. */
	const porAtor = new Map();
	return {
		/**
		 * Como `criarPedidoAdiado().adiarSeNaJanela`, no slot de `ator`: fora da
		 * janela devolve false e nada guarda (e nao mexe no pedido de ninguem).
		 */
		adiarSeNaJanela(ator, fimDaJanela, agora, repetir) {
			const slot = porAtor.get(ator) || criarPedidoAdiado(relogio);
			const adiou = slot.adiarSeNaJanela(fimDaJanela, agora, () => {
				// O ator sai do mapa ANTES de repetir: se o pedido cair de novo na
				// janela (um golpe armado no meio), o adiar de dentro cria o slot novo.
				if (porAtor.get(ator) === slot) {
					porAtor.delete(ator);
				}
				repetir();
			});
			if (adiou) {
				porAtor.set(ator, slot);
			}
			return adiou;
		},
		/**
		 * Descarta o pedido de `ator` (o clique de andar do jogador poupa o do
		 * homunculo) ou, sem ator, o de TODOS (troca de mapa, morte: o x,y de
		 * qualquer pedido e do mapa de antes).
		 */
		cancelar(ator) {
			if (ator === undefined) {
				for (const slot of porAtor.values()) {
					slot.cancelar();
				}
				porAtor.clear();
				return;
			}
			const slot = porAtor.get(ator);
			if (slot) {
				slot.cancelar();
				porAtor.delete(ator);
			}
		},
		/** Ha pedido esperando (de `ator`, ou de qualquer um sem ele)? (para teste e diagnostico) */
		temPendente(ator) {
			return ator === undefined ? porAtor.size > 0 : porAtor.has(ator);
		},
		/** Quantos atores tem pedido guardado agora? (para teste e diagnostico) */
		quantos() {
			return porAtor.size;
		}
	};
}
