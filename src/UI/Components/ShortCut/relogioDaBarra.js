/**
 * UI/Components/ShortCut/relogioDaBarra.js
 *
 * O RELOGIO DE RECARGA NA BARRA DE ATALHOS (item 3.10 do pedido do dono,
 * 09/10/2026). O `ZC_SKILL_POSTDELAY` (0x043d) chega por
 * `Skill.js:onSetSkillDelay` -> `ShortCut.setSkillDelay` e acende, no icone de
 * CADA slot que tem a skill, uma sombra que revela o icone em sentido horario
 * e o numero do que falta no centro. Vale para a skill usada a mao e para a
 * pedida pelo Bot: o servidor manda o mesmo 0x043d pelas duas.
 *
 * Por que guardar POR SKILL, e nao por slot (como o relogio antigo da barra):
 *  - a mesma skill em dois slots mostra nos dois;
 *  - a skill fora da barra guarda a recarga e acende quando e posta nela;
 *  - o slot redesenhado (`addElement` troca o `.icon` inteiro, por exemplo no
 *    `onUpdateSkill`) recebe o relogio de volta no passo seguinte, em vez de
 *    perder a contagem.
 *
 * Um SO intervalo de `PASSO_DO_RELOGIO_MS` redesenha os relogios enquanto ha
 * recarga viva e se desarma no passo em que nenhuma sobra: sem recarga, nada
 * roda. O relogio antigo usava um `requestAnimationFrame` por slot (60 vezes
 * por segundo por skill, disputando o quadro com o render do mapa).
 *
 * Este modulo e uma FABRICA sem dependencia da barra: quem a monta passa como
 * ler os slots e o relogio. E isso que deixa o comportamento inteiro ser
 * provado em jsdom (`tests/ui/relogioDaBarra.test.js`).
 */

import { PASSO_DO_RELOGIO_MS, estadoDaRecarga } from './relogioDeRecarga.js';

/** A classe do relogio dentro do `.icon` (o numero e `${CLASSE_DO_RELOGIO}-num`). */
export const CLASSE_DO_RELOGIO = 'sc-recarga';

/**
 * @typedef {{ skillId: number|null, icone: Element|null }} SlotDoRelogio
 *
 * @param {object} d
 * @param {() => Iterable<SlotDoRelogio>} d.slots os slots da barra agora: a skill
 *   (null para item ou vazio) e o `.icon` desenhado (null enquanto nao carregou)
 * @param {() => number} [d.agora] o relogio, em ms (padrao `Date.now`)
 * @param {(fn: Function, ms: number) => unknown} [d.armar] padrao `setInterval`
 * @param {(id: unknown) => void} [d.desarmar] padrao `clearInterval`
 */
export function criarRelogioDaBarra(d) {
	const agora = d.agora || (() => Date.now());
	const armar = d.armar || ((fn, ms) => setInterval(fn, ms));
	const desarmar = d.desarmar || (id => clearInterval(id));

	/** skillId -> { ate, duracao } */
	const recargas = new Map();
	/** O atraso de TODAS as skills (status POSTDELAY), ou null. */
	let global = null;
	let intervalo = null;

	/** A recarga que vale para a skill em `t`: a que acaba mais tarde. */
	function recargaDaSkill(skillId, t) {
		const propria = recargas.get(skillId);
		const viva = propria && propria.ate > t ? propria : null;
		if (global && global.ate > t && (!viva || global.ate > viva.ate)) {
			return global;
		}
		return viva;
	}

	function montar(doc) {
		const el = doc.createElement('span');
		el.className = CLASSE_DO_RELOGIO;
		el.setAttribute('aria-hidden', 'true');
		const num = doc.createElement('span');
		num.className = `${CLASSE_DO_RELOGIO}-num`;
		el.appendChild(num);
		return el;
	}

	/**
	 * Redesenha os relogios em `t`; devolve quantas recargas seguem vivas
	 * (contando as de skill fora da barra, que acendem se ela for posta la).
	 */
	function desenhar(t = agora()) {
		for (const [id, r] of recargas) {
			if (r.ate <= t) {
				recargas.delete(id);
			}
		}
		if (global && global.ate <= t) {
			global = null;
		}
		for (const slot of d.slots()) {
			const icone = slot && slot.icone;
			if (!icone) {
				continue;
			}
			const recarga =
				slot.skillId !== null && slot.skillId !== undefined ? recargaDaSkill(slot.skillId, t) : null;
			let el = icone.querySelector(`.${CLASSE_DO_RELOGIO}`);
			if (!recarga) {
				if (el) {
					el.remove();
				}
				continue;
			}
			const estado = estadoDaRecarga(recarga, t);
			if (!el) {
				el = montar(icone.ownerDocument);
				icone.appendChild(el);
			}
			const fracao = estado.fracao.toFixed(3);
			if (el.style.getPropertyValue('--cd-fracao') !== fracao) {
				el.style.setProperty('--cd-fracao', fracao);
			}
			const num = el.firstChild;
			if (num.textContent !== estado.rotulo) {
				num.textContent = estado.rotulo;
			}
		}
		return recargas.size + (global ? 1 : 0);
	}

	function parar() {
		if (intervalo !== null) {
			desarmar(intervalo);
			intervalo = null;
		}
	}

	/** Liga o intervalo se ha recarga viva e ele nao esta rodando. */
	function garantir() {
		if (intervalo !== null || (recargas.size === 0 && !global)) {
			return;
		}
		intervalo = armar(() => {
			if (desenhar() === 0) {
				parar();
			}
		}, PASSO_DO_RELOGIO_MS);
	}

	/** Uma recarga nova so vale se acaba depois da viva (a mais curta nao encurta). */
	function valeMais(atual, ate) {
		return !atual || atual.ate < ate;
	}

	return {
		/**
		 * O 0x043d de uma skill.
		 * @param {number} skillId
		 * @param {number} delayMs
		 */
		recarga(skillId, delayMs) {
			if (!(delayMs > 0)) {
				return;
			}
			const t = agora();
			if (!valeMais(recargas.get(skillId), t + delayMs)) {
				return;
			}
			recargas.set(skillId, { ate: t + delayMs, duracao: delayMs });
			desenhar(t);
			garantir();
		},

		/**
		 * O atraso de todas as skills (status POSTDELAY, `Entity.js`).
		 * @param {number} delayMs
		 */
		recargaGlobal(delayMs) {
			if (!(delayMs > 0)) {
				return;
			}
			const t = agora();
			if (!valeMais(global, t + delayMs)) {
				return;
			}
			global = { ate: t + delayMs, duracao: delayMs };
			desenhar(t);
			garantir();
		},

		desenhar,

		/** Trocar de personagem / tirar a barra: esquece tudo e desarma. */
		limpar() {
			recargas.clear();
			global = null;
			parar();
			for (const slot of d.slots()) {
				const el = slot && slot.icone && slot.icone.querySelector(`.${CLASSE_DO_RELOGIO}`);
				if (el) {
					el.remove();
				}
			}
		},

		/** As skills com recarga guardada agora (exposto para a prova de tela). */
		vivas() {
			return [...recargas.keys()];
		}
	};
}
