/**
 * UI/contextoDoMapa.js
 *
 * O CONTEXTO DO MAPA E O ESTADO DO BOT, sem janela (07/10/2026, pacote
 * "Novo Bot V5"). Ate aqui quem guardava isto era a janela "Idle"
 * (`IdleConfig.contexto` / `serverConfig.cacaAutomatica`), e quatro
 * consumidores que NAO sao do Idle liam dela: o drop da Analise de Caca
 * (`Engine/MapEngine/Item.js`), a Analise (`HuntAnalyzer`), o botao "Cacar"
 * (`HuntButtonIdle`) e a tela acesa no farm (`telaAcesaNoFarm.js`). Com a
 * janela antiga retirada, o dado vem do `ZC_RAGIDLE_BOT` (campo `contexto`),
 * que o `BotMenu` recebe e entrega aqui.
 *
 * OBSOLETO: a troca de mapa marca o contexto como velho ate a resposta do mapa
 * novo chegar, e quem le recebe `null` - "nao sei" -, nunca o mapa anterior
 * (a mesma regra que `IdleConfig.contextoObsoleto` guardava).
 *
 * Sem DOM e sem import de componente: testavel no jsdom.
 *
 * This file is part of the ragidle fork of ROBrowser.
 */

let _contexto = null;
let _obsoleto = true;
let _botLigado = false;

/** O contexto do mapa ATUAL, ou `null` se ainda nao chegou (ou e do mapa anterior). */
export function contextoDoMapa() {
	return _obsoleto ? null : _contexto;
}

/** O Bot deste personagem esta ligado, pelo ultimo estado CONFIRMADO do servidor. */
export function botLigado() {
	return _botLigado;
}

/** A resposta/status do servidor chegou: contexto e estado confirmados. */
export function receberDoServidor(contexto, ligado) {
	if (contexto && typeof contexto === 'object') {
		_contexto = contexto;
		_obsoleto = false;
	}
	_botLigado = !!ligado;
}

/** Troca de mapa: o que se sabe e do mapa anterior ate o servidor responder. */
export function marcarObsoleto() {
	_obsoleto = true;
}

/** Troca de personagem: nada do anterior sobrevive. */
export function esquecer() {
	_contexto = null;
	_obsoleto = true;
	_botLigado = false;
}
