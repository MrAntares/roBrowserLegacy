/**
 * scripts/mutantes-parcial-da-temporada.mjs - a BATERIA DE MUTACAO do parcial
 * da Temporada (a banda das janelas, 06/10/2026).
 *
 *   node scripts/mutantes-parcial-da-temporada.mjs [filtro-regex]
 *
 * O mesmo motor de `mutantes-abrir-todos-da-temporada.mjs`: cada mutante troca
 * UM trecho, roda os testes e devolve o arquivo no finally. Todo mutante tem
 * de MORRER; trecho que nao casa exatamente 1 vez NAO conta como morto.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VITEST = [
	resolve(RAIZ, 'node_modules/vitest/vitest.mjs'),
	resolve(RAIZ, '../../../node_modules/vitest/vitest.mjs')
].find(p => existsSync(p));
const TESTES = ['tests/ui/parcialDaTemporada.test.js'];

const P = 'src/UI/Components/TemporadaIdle/parcialDaTemporada.js';
const J = 'src/UI/Components/TemporadaIdle/TemporadaIdle.js';

const MUTANTES = [
	['PD1 o parcial com a versao do inteiro', P, 'export const VERSAO_DO_PARCIAL_DA_TEMPORADA = 4;', 'export const VERSAO_DO_PARCIAL_DA_TEMPORADA = 3;'],
	['PD2 o pedido sem base', P, '\t\treturn { ...corpo, base: estado.rev };', '\t\treturn { ...corpo };'],
	['PD3 a base sem conferir que e numero', P, "if (estado && typeof estado.rev === 'number') {", 'if (estado) {'],
	['PD4 o pedido muda o corpo de quem chamou', P, '\treturn { ...corpo };\n}', '\treturn corpo;\n}'],
	['PD5 o parcial cai sobre a revisao errada', P, '!estado || estado.rev !== parcial.de ||', '!estado ||'],
	['PD6 o parcial cai sem estado', P, '!ehParcialDaTemporada(parcial) || !estado ||', '!ehParcialDaTemporada(parcial) ||'],
	['PD7 o estado de antes e mexido', P, '\tconst raiz = { r: copia(estado) };', '\tconst raiz = { r: estado };'],
	['PD8 a troca atravessa folha', P, "\t\t\tif (!no || typeof no !== 'object') {\n\t\t\t\treturn null;\n\t\t\t}\n", ''],
	['PD9 o prototipo passa no caminho', P, "\t\t\tif (passo === '__proto__' || passo === 'constructor' || passo === 'prototype') {\n\t\t\t\treturn null;\n\t\t\t}\n", ''],
	/* Sem mutante: a guarda do prototipo na FOLHA saiu - o laco ja confere todo passo, inclusive o ultimo. */
	['PD11 a rev nao avanca', P, 'return { ...raiz.r, rev: parcial.rev,', 'return { ...raiz.r, rev: parcial.de,'],
	['PD12 o resultado velho fica', P, 'resultado: parcial.resultado == null ? null : parcial.resultado };', 'resultado: parcial.resultado == null ? raiz.r.resultado : parcial.resultado };'],
	['PD13 a acao vai sem base', J, 'pkt.json = JSON.stringify(comBase(corpo, TemporadaIdle.estado));', 'pkt.json = JSON.stringify(corpo);'],
	['PD14 o pedido vai sem base', J, "pkt.json = JSON.stringify(comBase({ acao: 'pedir' }, TemporadaIdle.estado));", "pkt.json = JSON.stringify({ acao: 'pedir' });"],
	['PD15 o parcial que nao cai e desenhado', J, '\t\tif (!montado) {\n\t\t\tpedirEstadoInteiro();\n\t\t\treturn;\n\t\t}\n', ''],
	['PD16 o parcial nao vira estado', J, '\t\tdados = montado;\n', '']
];

const resultados = [];
const SO = process.argv[2] ? new RegExp(process.argv[2]) : null;
for (let [nome, arquivo, de, para] of MUTANTES) {
	if (SO && !SO.test(nome)) {
		continue;
	}
	const caminho = `${RAIZ}/${arquivo}`;
	const original = readFileSync(caminho, 'utf8');
	/* Os arquivos do cliente estao em CRLF na arvore de trabalho. */
	if (original.includes('\r\n')) {
		de = de.replace(/\n/g, '\r\n');
		para = para.replace(/\n/g, '\r\n');
	}
	const vezes = original.split(de).length - 1;
	if (vezes !== 1) {
		resultados.push([nome, `TRECHO ACHADO ${vezes}x - mutante nao aplicado`]);
		continue;
	}
	try {
		writeFileSync(caminho, original.replace(de, () => para));
		const r = spawnSync(process.execPath, [VITEST, 'run', ...TESTES], { cwd: RAIZ, encoding: 'utf8' });
		const saida = (r.stdout || '') + (r.stderr || '');
		const linha = (saida.match(/Tests\s+[^\n]*/) || ['?'])[0].trim();
		resultados.push([nome, r.status === 0 ? `SOBREVIVEU (${linha})` : `morto (${linha})`]);
	} finally {
		writeFileSync(caminho, original);
	}
}
for (const [n, r] of resultados) {
	console.log(`${r.startsWith('morto') ? 'ok ' : '!! '} ${n}: ${r}`);
}
const vivos = resultados.filter(([, r]) => !r.startsWith('morto')).length;
console.log(`\n${resultados.length - vivos}/${resultados.length} mutantes mortos`);
process.exitCode = vivos ? 1 : 0;
