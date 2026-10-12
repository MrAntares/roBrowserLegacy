/**
 * OS DESTINOS PERMITIDOS DA PONTE, COM FAIXA (C4 do multiprocesso, 07/10/2026).
 *
 * A tranca de D-540 e uma lista exata de `host:porta`, e ela continua: destino
 * fora dela e recusado antes de qualquer socket. O que muda e que uma entrada
 * pode ser uma FAIXA de portas, `127.0.0.1:5121-5124` — os map-servers de um
 * servidor dividido em processos (`docs/PLANO-MULTIPROCESSO.md`, C4.5). Sem
 * faixa, nada muda.
 *
 * A faixa tem teto (`MAIOR_FAIXA`): `127.0.0.1:1-65535` faria da ponte o
 * proxy aberto que D-540 fechou, so que escrito de um jeito que parece
 * fechado. FAIXA torta (porta fora de 1..65535, invertida ou larga demais)
 * RECUSA ALTO na subida — uma lista que se le de um jeito e vale de outro e
 * pior que uma ponte que nao sobe.
 *
 * A entrada EXATA fica como sempre foi, de proposito: o texto cru, comparado
 * com `host:porta` do pedido. Validar o que ja esta no `WSPROXY_ALVOS` da VPS
 * poderia derrubar a ponte num deploy por uma entrada que hoje so nunca casa;
 * a sintaxe nova (a faixa) nasce validada porque ninguem a usa ainda.
 *
 * Puro: a ponte (`wsproxy.js`) le daqui; o teste tambem.
 */

/** A maior faixa aceita: folga para os map-servers de um servidor, nunca uma varredura. */
export const MAIOR_FAIXA = 32;

function porta(texto, entrada) {
	if (!/^\d+$/.test(texto)) throw new Error(`WSPROXY_ALVOS: porta "${texto}" invalida em "${entrada}"`);
	const n = Number(texto);
	if (n < 1 || n > 65535) throw new Error(`WSPROXY_ALVOS: porta ${texto} fora de 1..65535 em "${entrada}"`);
	return n;
}

/**
 * Le a lista (`host:porta` ou `host:de-ate`, separadas por virgula).
 * @param {string} texto
 * @returns {{ exatos: Set<string>, faixas: { host: string, de: number, ate: number }[] }}
 */
export function lerAlvos(texto) {
	const exatos = new Set();
	const faixas = [];
	for (const bruta of texto.split(',')) {
		const entrada = bruta.trim();
		if (entrada === '') continue;
		const i = entrada.lastIndexOf(':');
		const host = i < 0 ? entrada : entrada.slice(0, i);
		const portas = i < 0 ? '' : entrada.slice(i + 1);
		const traco = portas.indexOf('-');
		if (traco < 0) {
			exatos.add(entrada);
			continue;
		}
		const de = porta(portas.slice(0, traco), entrada);
		const ate = porta(portas.slice(traco + 1), entrada);
		if (ate < de) throw new Error(`WSPROXY_ALVOS: faixa invertida em "${entrada}"`);
		if (ate - de + 1 > MAIOR_FAIXA) {
			throw new Error(`WSPROXY_ALVOS: faixa de ${ate - de + 1} portas em "${entrada}" (o teto e ${MAIOR_FAIXA})`);
		}
		faixas.push({ host, de, ate });
	}
	return { exatos, faixas };
}

/**
 * Este destino esta na lista?
 * @param {{ exatos: Set<string>, faixas: { host: string, de: number, ate: number }[] }} alvos
 * @param {string} host
 * @param {number} portaPedida
 */
export function alvoPermitido(alvos, host, portaPedida) {
	if (alvos.exatos.has(`${host}:${portaPedida}`)) return true;
	return alvos.faixas.some((f) => f.host === host && portaPedida >= f.de && portaPedida <= f.ate);
}

/** A lista para o log da subida, como foi lida. */
export function descreverAlvos(alvos) {
	return [...alvos.exatos, ...alvos.faixas.map((f) => `${f.host}:${f.de}-${f.ate}`)];
}
