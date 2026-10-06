/**
 * scripts/mutantes-parcial-das-skills.mjs - a BATERIA DE MUTACAO do parcial
 * da janela de habilidades (a banda das janelas, 06/10/2026).
 *
 *   node scripts/mutantes-parcial-das-skills.mjs [filtro-regex]
 *
 * O mesmo motor de `mutantes-parcial-da-temporada.mjs`: cada mutante troca UM
 * trecho, roda os testes e devolve o arquivo no finally. Todo mutante tem de
 * MORRER; trecho que nao casa exatamente 1 vez NAO conta como morto.
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
const TESTES = ['tests/ui/parcialDasSkills.test.js', 'tests/ui/janelaDeSkillsPorParcial.test.js'];

const P = 'src/UI/Components/IdleSkills/parcialDasSkills.js';
const J = 'src/UI/Components/IdleSkills/IdleSkills.js';

const MUTANTES = [
	['PS1 o parcial reconhecido pela verdade', P, 'return !!envio && envio.parcial === true;', 'return !!envio && !!envio.parcial;'],
	['PS2 o pedido sem a chave base', P, 'return { ...corpo, base: estado && typeof estado.rev ===', 'return { ...corpo, x: estado && typeof estado.rev ==='],
	['PS3 a base sem conferir que e numero', P, "base: estado && typeof estado.rev === 'number' ? estado.rev : null", 'base: estado && estado.rev != null ? estado.rev : null'],
	['PS4 o servidor numera sem rev', P, "return !!estado && typeof estado.rev === 'number';\n}\n\n/**\n * O estado que", 'return !!estado;\n}\n\n/**\n * O estado que'],
	['PS5 o estado guardado leva o aplicado', P, '\tdelete estado.aplicado;\n', ''],
	['PS6 o estado guardado leva os problemas', P, '\tdelete estado.problemas;\n', ''],
	['PS7 o estado guardado e o mesmo objeto', P, '\tconst estado = copia(inteiro);', '\tconst estado = inteiro;'],
	['PS8 o parcial cai sobre a revisao errada', P, '!estado || estado.rev !== parcial.de ||', '!estado ||'],
	['PS9 o parcial cai sem estado', P, '!ehParcialDasSkills(parcial) || !estado ||', '!ehParcialDasSkills(parcial) ||'],
	['PS10 a troca podre e desenhada', P, '\tif (!montado) {\n\t\treturn null;\n\t}\n\treturn { ...montado, rev: parcial.rev };', '\treturn { ...montado, rev: parcial.rev };'],
	['PS11 a rev nao avanca', P, 'return { ...montado, rev: parcial.rev };', 'return { ...montado, rev: parcial.de };'],
	['PS12 o anuncio ganha aplicado', P, "\tif (Object.prototype.hasOwnProperty.call(envio, 'aplicado')) {\n\t\tdados.aplicado = envio.aplicado;\n\t}", '\tdados.aplicado = envio.aplicado;'],
	['PS13 os problemas do envio se perdem', P, 'dados.problemas = Array.isArray(envio.problemas) ? envio.problemas : [];', 'dados.problemas = [];'],
	['PS14 o desenho mexe no estado guardado', P, '\tconst dados = copia(estado);', '\tconst dados = estado;'],
	['PS15 declara sem servidor que numera', P, "if (!inteiro || typeof inteiro.rev !== 'number') {", 'if (!inteiro) {'],
	['PS16 nunca redeclara (a conexao nova fica sem parcial)', P, 'return revDeclarada === null || inteiro.rev <= revDeclarada;', 'return revDeclarada === null;'],
	['PS17 declara a cada inteiro', P, 'return revDeclarada === null || inteiro.rev <= revDeclarada;', 'return true;'],
	['PS18 abrir vai sempre pelo 0x0ff9', J, "\tif (servidorNumera(IdleSkills._estadoDoServidor)) {\n\t\tenviarComBase(new PACKET.CZ.RAGIDLE_APRENDER(), { acao: 'pedir' });\n\t\treturn;\n\t}\n", ''],
	['PS19 o lote vai sem base', J, 'enviarComBase(new PACKET.CZ.RAGIDLE_APRENDER(), { lote: lote });', 'Network.sendPacket(Object.assign(new PACKET.CZ.RAGIDLE_APRENDER(), { json: JSON.stringify({ lote: lote }) }));'],
	['PS20 a rotacao vai sem base', J, 'enviarComBase(new PACKET.CZ.RAGIDLE_PRIORIZAR(), { skillId: skillId, ligar: ligar });', 'Network.sendPacket(Object.assign(new PACKET.CZ.RAGIDLE_PRIORIZAR(), { json: JSON.stringify({ skillId: skillId, ligar: ligar }) }));'],
	['PS21 o parcial que chega antes do inteiro pedido e aplicado', J, '\t\tif (IdleSkills._inteiroPedido) {\n\t\t\treturn;\n\t\t}\n\t\tconst montado', '\t\tconst montado'],
	['PS23 o parcial que nao cai e desenhado', J, '\t\t\tsoltarOAplicar();\n\t\t\tpedirInteiro();\n\t\t\treturn;\n', '\t\t\tsoltarOAplicar();\n\t\t\tpedirInteiro();\n'],
	['PS24 o Aplicar perdido guarda o rascunho', J, '\t\t\tif (IdleSkills._esperandoAplicar && data.aplicado === true) {\n\t\t\t\tIdleSkills.rascunho = {};\n\t\t\t}\n', ''],
	['PS25 o parcial nao vira estado guardado', J, '\t\tIdleSkills._estadoDoServidor = montado;\n', ''],
	['PS26 o parcial nao vira o que a janela desenha', J, '\t\tdata = dadosDoEnvio(montado, data);\n', ''],
	['PS27 o inteiro nao solta a espera', J, '\t\tIdleSkills._inteiroPedido = false;\n\t\tIdleSkills._estadoDoServidor = estadoDoInteiro(data);', '\t\tIdleSkills._estadoDoServidor = estadoDoInteiro(data);'],
	['PS28 o inteiro nao declara', J, "\t\tif (precisaDeclarar(IdleSkills._estadoDoServidor, IdleSkills._revDeclarada)) {\n\t\t\tenviarComBase(new PACKET.CZ.RAGIDLE_APRENDER(), { acao: 'pedir' });\n\t\t}\n", ''],
	['PS29 a base mandada nao e lembrada', J, '\t\tIdleSkills._revDeclarada = comARevisao.base;\n', ''],
	['PS30 a troca de personagem lembra a revisao', J, '\tIdleSkills._estadoDoServidor = null;\n\tIdleSkills._revDeclarada = null;\n\tIdleSkills._inteiroPedido = false;\n', '']
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
