/**
 * UI/Components/BotMenu/edicaoDeConsumiveis.js
 *
 * A EDICAO DOS CONSUMIVEIS DO BOT (decisao D3-C1, 08/10/2026), sem DOM: funcoes puras sobre o bloco
 * `consumiveis` da config v1 (`servidor/bot/config-do-bot.ts`): as pocoes de velocidade mantidas e a Asa de
 * Mosca automatica com seus gatilhos opcionais (0 desliga o gatilho). Nenhuma muta a config recebida. O
 * cliente impede o obvio (faixas, repeticao, teto); o servidor valida de novo e devolve `problemas` por campo.
 *
 * This file is part of the ragidle fork of ROBrowser.
 */

/** O padrao do servidor (desligado). `semAlvoPorSegundos` 10 e o padrao dos gatilhos da asa. */
export const CONSUMIVEIS_PADRAO = Object.freeze({
	buffs: Object.freeze({ ligado: false, itens: Object.freeze([]) }),
	asa: Object.freeze({ ligada: false, semAlvoPorSegundos: 10, cercadoPor: 0, hpAbaixoDe: 0, reserva: 0 })
});

/** O valor que um gatilho ganha ao ser LIGADO pela caixa (o jogador ajusta depois). */
export const GATILHO_AO_LIGAR = Object.freeze({ semAlvoPorSegundos: 10, cercadoPor: 3, hpAbaixoDe: 30 });

/** As faixas de fabrica, usadas quando o servidor nao as anunciou. */
export const FAIXAS_PADRAO = Object.freeze({
	buffsDeItem: 32,
	asaSemAlvoMinimo: 3,
	asaSemAlvoMaximo: 20,
	asaCercadoMinimo: 2,
	asaCercadoMaximo: 10,
	asaHpMinimo: 5,
	asaHpMaximo: 80,
	asaReservaMaxima: 99
});

function inteiroNaFaixa(valor, min, max) {
	const n = Math.round(Number(valor));
	if (!Number.isFinite(n)) {
		return min;
	}
	return Math.min(max, Math.max(min, n));
}

/** O bloco `consumiveis` da config; ausente (servidor velho) ou incompleto = o padrao, campo a campo. */
export function lerConsumiveis(config) {
	const c = (config && config.consumiveis) || {};
	const b = c.buffs || {};
	const a = c.asa || {};
	const num = (v, padrao) => (Number.isInteger(v) ? v : padrao);
	return {
		buffs: {
			ligado: typeof b.ligado === 'boolean' ? b.ligado : CONSUMIVEIS_PADRAO.buffs.ligado,
			itens: Array.isArray(b.itens) ? b.itens.filter(Number.isInteger) : []
		},
		asa: {
			ligada: typeof a.ligada === 'boolean' ? a.ligada : CONSUMIVEIS_PADRAO.asa.ligada,
			semAlvoPorSegundos: num(a.semAlvoPorSegundos, CONSUMIVEIS_PADRAO.asa.semAlvoPorSegundos),
			cercadoPor: num(a.cercadoPor, CONSUMIVEIS_PADRAO.asa.cercadoPor),
			hpAbaixoDe: num(a.hpAbaixoDe, CONSUMIVEIS_PADRAO.asa.hpAbaixoDe),
			reserva: num(a.reserva, CONSUMIVEIS_PADRAO.asa.reserva)
		}
	};
}

function comConsumiveis(config, fn) {
	return { ...config, consumiveis: fn(lerConsumiveis(config)) };
}

export function ligarBuffs(config, ligado) {
	return comConsumiveis(config, k => ({ ...k, buffs: { ...k.buffs, ligado: !!ligado } }));
}

/** Escolhe ou tira uma pocao da lista (a ordem da lista e a da prioridade). O teto vem das capacidades. */
export function alternarBuff(config, itemId, teto = FAIXAS_PADRAO.buffsDeItem) {
	const k = lerConsumiveis(config);
	if (k.buffs.itens.includes(itemId)) {
		return comConsumiveis(config, x => {
			const itens = x.buffs.itens.filter(i => i !== itemId);
			// Sem pocao nenhuma o interruptor nao fica ligado (o servidor recusa "ligado" sem pocao).
			return { ...x, buffs: { ligado: itens.length > 0 ? x.buffs.ligado : false, itens } };
		});
	}
	if (k.buffs.itens.length >= teto) {
		return config;
	}
	return comConsumiveis(config, x => ({ ...x, buffs: { ...x.buffs, itens: [...x.buffs.itens, itemId] } }));
}

export function ligarAsa(config, ligada) {
	return comConsumiveis(config, k => {
		const asa = { ...k.asa, ligada: !!ligada };
		// A asa ligada precisa de um gatilho: sem nenhum, o de ociosidade volta ao padrao (a recusa do servidor vira dica).
		if (asa.ligada && asa.semAlvoPorSegundos === 0 && asa.cercadoPor === 0 && asa.hpAbaixoDe === 0) {
			asa.semAlvoPorSegundos = GATILHO_AO_LIGAR.semAlvoPorSegundos;
		}
		return { ...k, asa };
	});
}

const CAMPOS_DOS_GATILHOS = Object.freeze({
	semAlvoPorSegundos: ['asaSemAlvoMinimo', 'asaSemAlvoMaximo'],
	cercadoPor: ['asaCercadoMinimo', 'asaCercadoMaximo'],
	hpAbaixoDe: ['asaHpMinimo', 'asaHpMaximo']
});

/** Liga (com o valor padrao) ou desliga (0) um gatilho da asa. */
export function alternarGatilho(config, campo) {
	if (!CAMPOS_DOS_GATILHOS[campo]) {
		return config;
	}
	return comConsumiveis(config, k => ({ ...k, asa: { ...k.asa, [campo]: k.asa[campo] > 0 ? 0 : GATILHO_AO_LIGAR[campo] } }));
}

/** Define o valor de um gatilho ligado, dentro da faixa do servidor (0 desliga). */
export function definirGatilho(config, campo, valor, faixas = FAIXAS_PADRAO) {
	const nomes = CAMPOS_DOS_GATILHOS[campo];
	if (!nomes) {
		return config;
	}
	const n = Math.round(Number(valor));
	const novo = !Number.isFinite(n) || n <= 0 ? 0 : inteiroNaFaixa(n, faixas[nomes[0]], faixas[nomes[1]]);
	return comConsumiveis(config, k => ({ ...k, asa: { ...k.asa, [campo]: novo } }));
}

export function definirReserva(config, valor, faixas = FAIXAS_PADRAO) {
	return comConsumiveis(config, k => ({ ...k, asa: { ...k.asa, reserva: inteiroNaFaixa(valor, 0, faixas.asaReservaMaxima) } }));
}

/** O que a aba mostra de cada pocao: o motivo curto de nao servir (o servidor manda `nivel` ou `classe`). */
export const MOTIVO_DA_POCAO = Object.freeze({
	nivel: 'seu nível ainda não permite',
	classe: 'sua classe não usa'
});

/** As faixas que o servidor anunciou, completando com as de fabrica. */
export function faixasDasCapacidades(limites) {
	const l = limites || {};
	const saida = { ...FAIXAS_PADRAO };
	for (const k of Object.keys(FAIXAS_PADRAO)) {
		if (Number.isInteger(l[k])) {
			saida[k] = l[k];
		}
	}
	return saida;
}
