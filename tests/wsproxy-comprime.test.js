/**
 * A PONTE COMPRIME O FIO SO QUANDO MANDAM (D-2374, porte de e762c75c).
 *
 * O commit de 03/10/2026 ligava o `permessage-deflate` por padrao, e ele se
 * perdeu na integracao de 08/10. Volta DESLIGADO: `RAG_WS_DEFLATE=1` liga, `0`
 * ou ausente desliga, qualquer outro valor derruba a subida (o porque mora em
 * `wsproxyCompressao.js`).
 *
 * Sobe a ponte DE VERDADE, com um alvo TCP que manda um fio repetitivo (como o
 * do jogo: o mesmo pacote de passo de monstro mil vezes), e mede no SOCKET do
 * cliente quantos bytes atravessaram — nao o tamanho da mensagem montada, que
 * e o mesmo com e sem compressao.
 *
 *   SEM a variavel (o padrao): nada negociado, o fio passa inteiro (>= 32000 B).
 *   COM `RAG_WS_DEFLATE=1`: a extensao negociada e menos da METADE no socket.
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import net from 'node:net';
import path from 'node:path';
import WebSocket from 'ws';
import { afterEach, describe, expect, it } from 'vitest';
import { compressaoDoAmbiente, OPCOES_DE_COMPRESSAO } from '../wsproxyCompressao.js';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/*
 * Portas isoladas: nao as do e762c75c (15983/15982), para nao colidir com quem
 * ainda tenha aquele teste numa arvore velha; nem as de `wsproxy-nao-morre`
 * (15996/15997), `wsproxy-declara-ip` (15992/15993) e `wsproxy-faixa-de-alvos`
 * (15979 e a faixa dela).
 */
const PORTA = 15973;
const PORTA_DO_ALVO = 15972;

/** Um "passo de monstro" (0x0086, 16 bytes) repetido: o caso dominante do fio do jogo. */
const PASSO = Buffer.from([0x86, 0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee]);
const FIO = Buffer.concat(
	Array.from({ length: 2000 }, (_, i) => {
		const p = Buffer.from(PASSO);
		p.writeUInt16LE(i, 2); // o id muda, como muda no jogo
		return p;
	})
);

let ponte = null;
let alvo = null;

afterEach(async () => {
	ponte?.kill();
	ponte = null;
	await new Promise(r => (alvo ? alvo.close(() => r()) : r()));
	alvo = null;
});

function subirOAlvo() {
	return new Promise((resolve, reject) => {
		const servidor = net.createServer(socket => {
			socket.on('error', () => {});
			// Em pedacos PEQUENOS e ESPACADOS, como o servidor do jogo escreve: cada
			// um vira UMA mensagem. A economia vem do contexto mantido ENTRE
			// mensagens pequenas, e nao de comprimir um bloco grande.
			let k = 0;
			const mandar = () => {
				if (k >= FIO.length || socket.destroyed) return;
				socket.write(FIO.subarray(k, k + 64));
				k += 64;
				setTimeout(mandar, 1);
			};
			mandar();
		});
		servidor.on('error', reject);
		servidor.listen(PORTA_DO_ALVO, '127.0.0.1', () => resolve(servidor));
	});
}

/** O ambiente da ponte SEM `RAG_WS_DEFLATE` herdado de quem roda o teste. */
function ambiente(extras) {
	const env = { ...process.env, WSPROXY_ALVOS: `127.0.0.1:${PORTA_DO_ALVO}`, ...extras };
	if (!('RAG_WS_DEFLATE' in extras)) delete env.RAG_WS_DEFLATE;
	return env;
}

async function subirAPonte(extras = {}) {
	ponte = spawn(process.execPath, ['wsproxy.js', '-p', String(PORTA)], {
		cwd: RAIZ,
		env: ambiente(extras),
		stdio: ['ignore', 'pipe', 'pipe']
	});
	let saida = '';
	ponte.stdout.on('data', d => (saida += String(d)));
	ponte.stderr.on('data', d => (saida += String(d)));
	const ate = Date.now() + 10_000;
	while (!saida.includes('Listening on')) {
		if (Date.now() > ate) throw new Error(`a ponte nao subiu: ${saida}`);
		await new Promise(r => setTimeout(r, 25));
	}
	return () => saida;
}

/** Conecta, junta o fio inteiro e devolve o que chegou e quanto passou no socket. */
function receberOFio() {
	return new Promise((resolve, reject) => {
		const ws = new WebSocket(`ws://127.0.0.1:${String(PORTA)}/127.0.0.1:${String(PORTA_DO_ALVO)}`);
		ws.binaryType = 'nodebuffer';
		const partes = [];
		let total = 0;
		const prazo = setTimeout(() => reject(new Error(`so chegaram ${String(total)} de ${String(FIO.length)} bytes`)), 15_000);
		ws.on('error', reject);
		ws.on('message', dado => {
			partes.push(dado);
			total += dado.length;
			if (total >= FIO.length) {
				clearTimeout(prazo);
				const noSocket = ws._socket.bytesRead;
				const extensao = ws.extensions;
				ws.close();
				resolve({ recebido: Buffer.concat(partes), noSocket, extensao });
			}
		});
	});
}

describe('o interruptor (puro)', () => {
	it('ausente, vazio ou 0 desliga', () => {
		expect(compressaoDoAmbiente(undefined)).toBe(false);
		expect(compressaoDoAmbiente('')).toBe(false);
		expect(compressaoDoAmbiente('0')).toBe(false);
	});

	it('1 liga, com deflate nivel 1 (o do numero medido)', () => {
		expect(compressaoDoAmbiente('1')).toBe(OPCOES_DE_COMPRESSAO);
		expect(OPCOES_DE_COMPRESSAO.zlibDeflateOptions.level).toBe(1);
	});

	it('qualquer outro valor FALHA ALTO, dizendo qual', () => {
		for (const v of ['sim', 'true', '2', ' 1', 'on']) {
			expect(() => compressaoDoAmbiente(v)).toThrow(`RAG_WS_DEFLATE="${v}"`);
		}
	});
});

describe('a ponte de verdade', () => {
	it('PADRAO (sem a variavel): nada negociado e o fio passa inteiro, como na producao de hoje', async () => {
		alvo = await subirOAlvo();
		const saida = await subirAPonte();
		expect(saida()).toContain('compressao desligada');
		const r = await receberOFio();
		expect(r.extensao).toBe('');
		expect(r.recebido.equals(FIO)).toBe(true);
		expect(r.noSocket).toBeGreaterThanOrEqual(FIO.length);
	});

	it('RAG_WS_DEFLATE=1: negocia, entrega os bytes INTACTOS e passa menos da metade pelo socket', async () => {
		alvo = await subirOAlvo();
		const saida = await subirAPonte({ RAG_WS_DEFLATE: '1' });
		expect(saida()).toContain('compressao ligada');
		const r = await receberOFio();
		expect(r.extensao).toContain('permessage-deflate');
		expect(r.recebido.equals(FIO), 'os bytes do jogo chegam iguais').toBe(true);
		expect(r.noSocket, `passaram ${String(r.noSocket)} de ${String(FIO.length)}`).toBeLessThan(FIO.length / 2);
	});

	it('RAG_WS_DEFLATE=sim: a ponte NAO sobe, e diz por que', async () => {
		const filho = spawn(process.execPath, ['wsproxy.js', '-p', String(PORTA)], {
			cwd: RAIZ,
			env: ambiente({ RAG_WS_DEFLATE: 'sim' }),
			stdio: ['ignore', 'pipe', 'pipe']
		});
		let saida = '';
		filho.stdout.on('data', d => (saida += String(d)));
		filho.stderr.on('data', d => (saida += String(d)));
		const codigo = await new Promise(r => filho.on('exit', c => r(c)));
		expect(codigo).not.toBe(0);
		expect(saida).toContain('RAG_WS_DEFLATE="sim"');
		expect(saida).not.toContain('Listening on');
	});
});
