/**
 * UI/Components/BotMenu/edicaoDeFlechas.js
 *
 * A EDICAO DAS FLECHAS DO BOT (Fase 7, 07/10/2026), sem DOM: funcoes puras
 * sobre o bloco `flechas` da config v1 (`servidor/bot/config-do-bot.ts`). A
 * janela so desenha e chama estas funcoes dentro de `estado.editar(...)`.
 * Nenhuma muta a config recebida.
 *
 * O cliente nao decide qual flecha o Bot veste nem se a conta e VIP: so edita a
 * preferencia. A escolha e a do servidor, que confere o VIP a cada decisao.
 *
 * This file is part of the ragidle fork of ROBrowser.
 */

/*
 * O PADRAO do servidor (ajustes do dono, 09/10/2026): a troca automatica nasce LIGADA, no modo automatico, com
 * todas as flechas permitidas. A troca continua beneficio VIP (o servidor confere a cada decisao).
 */
export const FLECHAS_PADRAO = Object.freeze({
	ligada: true,
	modo: 'automatico',
	fixa: null,
	permitidas: Object.freeze([]),
	porMonstro: Object.freeze({})
});

export function lerFlechas(config) {
	const f = (config && config.flechas) || {};
	return {
		ligada: typeof f.ligada === 'boolean' ? f.ligada : FLECHAS_PADRAO.ligada,
		modo: f.modo === 'fixa' ? 'fixa' : 'automatico',
		fixa: Number.isInteger(f.fixa) ? f.fixa : null,
		permitidas: Array.isArray(f.permitidas) ? f.permitidas : FLECHAS_PADRAO.permitidas,
		porMonstro: f.porMonstro && typeof f.porMonstro === 'object' ? f.porMonstro : FLECHAS_PADRAO.porMonstro
	};
}

function comFlechas(config, fn) {
	return { ...config, flechas: fn(lerFlechas(config)) };
}

export function ligarFlechas(config, ligada) {
	return comFlechas(config, f => ({ ...f, ligada: !!ligada }));
}

/** Automatico (fixa nula) ou fixa com uma municao; fixa sem item nao muda nada. */
export function definirModoDeFlecha(config, modo, fixa) {
	if (modo === 'automatico') {
		return comFlechas(config, f => ({ ...f, modo: 'automatico', fixa: null }));
	}
	if (modo === 'fixa' && Number.isInteger(fixa)) {
		return comFlechas(config, f => ({ ...f, modo: 'fixa', fixa }));
	}
	return config;
}

/** Liga/desliga uma municao na lista de permitidas (vazia = todas ate o teto do automatico). */
export function alternarPermitida(config, itemId, teto) {
	const f = lerFlechas(config);
	if (!Number.isInteger(itemId)) {
		return config;
	}
	if (f.permitidas.includes(itemId)) {
		return comFlechas(config, x => ({ ...x, permitidas: x.permitidas.filter(i => i !== itemId) }));
	}
	if (typeof teto === 'number' && f.permitidas.length >= teto) {
		return config;
	}
	return comFlechas(config, x => ({ ...x, permitidas: [...x.permitidas, itemId] }));
}

/**
 * A regra da especie: `null` = herdar a global; `{modo:'automatico'}`; ou
 * `{modo:'fixa', fixa}`. Respeita o teto de monstros com regra.
 */
export function definirRegraDoMonstro(config, especie, regra, teto) {
	const f = lerFlechas(config);
	const chave = String(especie);
	if (!Number.isInteger(especie)) {
		return config;
	}
	if (regra === null) {
		if (!(chave in f.porMonstro)) {
			return config;
		}
		const resto = { ...f.porMonstro };
		delete resto[chave];
		return comFlechas(config, x => ({ ...x, porMonstro: resto }));
	}
	let nova;
	if (regra && regra.modo === 'automatico') {
		nova = { modo: 'automatico' };
	} else if (regra && regra.modo === 'fixa' && Number.isInteger(regra.fixa)) {
		nova = { modo: 'fixa', fixa: regra.fixa };
	} else {
		return config;
	}
	if (!(chave in f.porMonstro) && typeof teto === 'number' && Object.keys(f.porMonstro).length >= teto) {
		return config;
	}
	return comFlechas(config, x => ({ ...x, porMonstro: { ...x.porMonstro, [chave]: nova } }));
}
