/**
 * A PONTE ACEITA UMA FAIXA DE PORTAS (C4 do multiprocesso, 07/10/2026).
 *
 * `WSPROXY_ALVOS` passa a aceitar `host:de-ate` ao lado de `host:porta`: os
 * map-servers de um servidor dividido em processos (5121-5124). Fora da lista
 * e da faixa, a recusa e a de sempre (D-540): nenhum socket e aberto.
 *
 * Duas camadas: a regra pura (`wsproxyAlvos.js`) e a ponte de verdade, num
 * processo, com tres alvos TCP falsos — dois dentro da faixa e um fora.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import net from 'node:net';
import path from 'node:path';
import WebSocket from 'ws';
import { afterEach, describe, expect, it } from 'vitest';
import { MAIOR_FAIXA, alvoPermitido, descreverAlvos, lerAlvos } from '../wsproxyAlvos.js';

describe('a lista de destinos com faixa', () => {
	it('a lista de hoje (so exatos) le e responde como sempre', () => {
		const alvos = lerAlvos('127.0.0.1:6900,127.0.0.1:6121,127.0.0.1:5121');
		expect(alvoPermitido(alvos, '127.0.0.1', 5121)).toBe(true);
		expect(alvoPermitido(alvos, '127.0.0.1', 5122)).toBe(false);
		expect(alvoPermitido(alvos, 'localhost', 5121)).toBe(false);
		expect(descreverAlvos(alvos)).toEqual(['127.0.0.1:6900', '127.0.0.1:6121', '127.0.0.1:5121']);
	});

	it('a faixa vale nas duas pontas e so nelas, e so para o host dela', () => {
		const alvos = lerAlvos('127.0.0.1:6900, 127.0.0.1:5121-5124');
		for (const p of [5121, 5122, 5123, 5124]) expect(alvoPermitido(alvos, '127.0.0.1', p)).toBe(true);
		expect(alvoPermitido(alvos, '127.0.0.1', 5120)).toBe(false);
		expect(alvoPermitido(alvos, '127.0.0.1', 5125)).toBe(false);
		expect(alvoPermitido(alvos, '10.0.0.1', 5122)).toBe(false);
		expect(descreverAlvos(alvos)).toEqual(['127.0.0.1:6900', '127.0.0.1:5121-5124']);
	});

	it('a faixa torta recusa alto: invertida, larga demais, porta fora de 1..65535', () => {
		expect(() => lerAlvos('127.0.0.1:5124-5121')).toThrow(/invertida/);
		expect(() => lerAlvos(`127.0.0.1:1000-${1000 + MAIOR_FAIXA}`)).toThrow(/teto/);
		expect(() => lerAlvos('127.0.0.1:1-65535')).toThrow(/teto/);
		expect(() => lerAlvos('127.0.0.1:0-3')).toThrow(/fora de/);
		expect(() => lerAlvos('127.0.0.1:65534-65536')).toThrow(/fora de/);
		expect(() => lerAlvos('127.0.0.1:a-3')).toThrow(/invalida/);
		// O teto exato passa.
		expect(lerAlvos(`127.0.0.1:1000-${1000 + MAIOR_FAIXA - 1}`).faixas).toHaveLength(1);
	});

	it('a entrada exata e o texto cru, como antes: a torta nao derruba a ponte, so nunca casa', () => {
		const alvos = lerAlvos('lixo,127.0.0.1:abc,127.0.0.1:5121');
		expect(alvoPermitido(alvos, '127.0.0.1', 5121)).toBe(true);
		expect(alvos.exatos.has('lixo')).toBe(true);
	});
});

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORTA_DA_PONTE = 15979;
const DENTRO = [15975, 15976];
const FORA = 15977;

let ponte = null;
const alvos = [];
const abertos = [];

afterEach(async () => {
	ponte?.kill();
	ponte = null;
	// `close` espera as conexoes aceitas acabarem: elas saem antes.
	for (const s of abertos.splice(0)) s.destroy();
	await Promise.all(alvos.splice(0).map((a) => new Promise((r) => a.close(() => r()))));
});

describe('a ponte de verdade com WSPROXY_ALVOS em faixa', () => {
	it('conecta nas portas da faixa e recusa a de fora sem abrir socket', async () => {
		const conexoes = new Map();
		for (const p of [...DENTRO, FORA]) {
			conexoes.set(p, 0);
			const s = net.createServer((socket) => {
				conexoes.set(p, conexoes.get(p) + 1);
				abertos.push(socket);
				socket.on('error', () => {});
			});
			await new Promise((r) => s.listen(p, '127.0.0.1', r));
			alvos.push(s);
		}
		ponte = spawn(process.execPath, ['wsproxy.js', '-p', String(PORTA_DA_PONTE)], {
			cwd: RAIZ,
			env: { ...process.env, WSPROXY_ALVOS: `127.0.0.1:${DENTRO[0]}-${DENTRO[1]}` },
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		let saida = '';
		ponte.stdout.on('data', (d) => (saida += String(d)));
		ponte.stderr.on('data', (d) => (saida += String(d)));
		const ate = Date.now() + 5_000;
		while (!saida.includes('Listening on')) {
			if (Date.now() > ate) throw new Error(`a ponte nao subiu: ${saida}`);
			await new Promise((r) => setTimeout(r, 50));
		}
		expect(saida).toContain(`127.0.0.1:${DENTRO[0]}-${DENTRO[1]}`);

		const abrir = (porta) =>
			new Promise((resolve) => {
				const ws = new WebSocket(`ws://127.0.0.1:${PORTA_DA_PONTE}/127.0.0.1:${porta}`);
				ws.on('open', () => ws.send(Buffer.from([0x64, 0x00])));
				ws.on('close', () => resolve());
				ws.on('error', () => resolve());
				setTimeout(() => {
					ws.close();
					resolve();
				}, 600);
			});
		for (const p of [...DENTRO, FORA]) await abrir(p);
		await new Promise((r) => setTimeout(r, 200));
		expect(conexoes.get(DENTRO[0])).toBe(1);
		expect(conexoes.get(DENTRO[1])).toBe(1);
		expect(conexoes.get(FORA)).toBe(0);
		expect(saida).toContain('destino fora da lista');
	}, 30_000);

	it('a faixa larga demais derruba a ponte na subida, com o motivo', async () => {
		ponte = spawn(process.execPath, ['wsproxy.js', '-p', String(PORTA_DA_PONTE)], {
			cwd: RAIZ,
			env: { ...process.env, WSPROXY_ALVOS: '127.0.0.1:1-65535' },
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		let saida = '';
		ponte.stdout.on('data', (d) => (saida += String(d)));
		ponte.stderr.on('data', (d) => (saida += String(d)));
		const codigo = await new Promise((r) => ponte.on('exit', (c) => r(c)));
		expect(codigo).not.toBe(0);
		expect(saida).toContain('o teto e');
		expect(saida).not.toContain('Listening on');
	}, 30_000);
});
