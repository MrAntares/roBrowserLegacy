/**
 * A COMPRESSAO DO FIO DA PONTE (`permessage-deflate`) — D-2374, 13/10/2026.
 *
 * Porte de e762c75c (03/10/2026), que se perdeu na integracao de 08/10 (o
 * merge com a estrategia `ours`, 995acd56, levou o `wsproxy.js` sem ela).
 * Aquele commit mediu, com o trafego de verdade (`scripts/diag-custo-do-tique.ts
 * --medir-compressao`, 60 jogadores de 2o grau num mapa): 155 KB/s -> 60 KB/s,
 * 62% a menos, com deflate nivel 1 e o contexto mantido entre mensagens. Os
 * pacotes do RO sao pequenos e repetitivos (o passo de cada monstro, as
 * barras de HP), e e a repeticao ENTRE mensagens que comprime: por isso o
 * contexto fica (o padrao). Com o contexto mantido o `ws` comprime TODA
 * mensagem, inclusive as menores que o `threshold` — ele so vale com
 * `no_context_takeover` (`ws/lib/sender.js`, conferido na 8.21.3) —, entao nao
 * ha `threshold` a ajustar.
 *
 * O QUE MUDOU NO PORTE: ela entra DESLIGADA. Ligar e `RAG_WS_DEFLATE=1`.
 *
 * - Nao sabemos se o tunel da Cloudflare (`cloudflared` -> borda) repassa a
 *   extensao ao navegador. Se nao repassar, ligar nao economiza nada no fio do
 *   jogador e so gasta CPU aqui; se repassar pela metade, quem decide e o
 *   aperto de mao, e o jogo nao muda uma linha (o navegador descomprime).
 * - O custo cai NESTE processo (a ponte, outro nucleo, e nao a thread do
 *   servidor do jogo), mas e custo: zlib por mensagem e ~256 KiB de memoria por
 *   conexao (janela 15, memLevel 8) — ~125 MiB com 500 conexoes.
 * - A rede NAO e o gargalo de hoje (108 KB/s no total, diagnostico de
 *   13/10/2026). Ligar e decisao do dono, com o numero da borda na mao.
 *
 * Quem nao negocia a extensao (navegador antigo, proxy no meio) recebe o fio
 * CRU, como antes: a compressao e oferta, e nao exigencia.
 *
 * O interruptor segue o molde dos `RAG_PERF_*` do servidor: `1` liga, `0` ou
 * ausente desliga, e qualquer outro valor FALHA ALTO na subida — um `RAG_WS_DEFLATE=sim`
 * desligado em silencio seria o pior dos mundos (quem ligou acharia que ligou).
 */

/** Nivel 1 e o mais barato do zlib; o ganho medido (62%) foi com ele. */
export const OPCOES_DE_COMPRESSAO = Object.freeze({
	zlibDeflateOptions: Object.freeze({ level: 1, memLevel: 8 })
});

/**
 * O que vai em `perMessageDeflate` do `WebSocketServer`, a partir do valor CRU
 * de `RAG_WS_DEFLATE`.
 *
 * @param {string|undefined} cru
 * @returns {false|typeof OPCOES_DE_COMPRESSAO}
 */
export function compressaoDoAmbiente(cru) {
	if (cru === undefined || cru === '' || cru === '0') {
		return false;
	}
	if (cru === '1') {
		return OPCOES_DE_COMPRESSAO;
	}
	throw new Error(`RAG_WS_DEFLATE="${cru}" nao e 1 (liga) nem 0 (desliga): a ponte nao sobe com um interruptor ambiguo.`);
}
