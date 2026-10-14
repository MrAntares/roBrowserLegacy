/**
 * scripts/mutantes-redesenho-sem-mudanca.mjs - a BATERIA DE MUTACAO da D-2385
 * (o cliente que redesenhava sem precisar, 14/10/2026).
 *
 *   node scripts/mutantes-redesenho-sem-mudanca.mjs [filtro-regex]
 *   node scripts/mutantes-redesenho-sem-mudanca.mjs --conferir   (so confere que cada trecho casa 1 vez)
 *
 * O mesmo motor de `mutantes-parcial-das-skills.mjs`: cada mutante troca UM
 * trecho NO DISCO, roda os testes do alvo e devolve o arquivo no `finally`
 * (por copia do conteudo lido, nunca por git). No disco, e nao em memoria,
 * porque parte dos portoes le o FONTE (`hudVidaSemReescritaIgual.test.js`, a
 * costura da GrupoIdle, da PartyHud e da SkillList). Todo mutante tem de
 * MORRER; trecho que nao casa exatamente 1 vez NAO conta como morto.
 *
 * O `node_modules` vem do fork principal quando a worktree nao tem o seu.
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

const BOT = 'src/UI/Components/BotMenu/BotMenu.js';
const CARRO = 'src/UI/Components/ChangeCart/ChangeCart.js';
const BARRA = 'src/UI/Components/PartyFriends/barraDoMembro.js';
const GRUPO = 'src/UI/Components/PartyFriends/PartyFriendsCommon.js';
const DESTACADO = 'src/UI/Components/PartyFriends/PartyMemberExternal/PartyMemberExternal.js';
const BASIC = 'src/UI/Components/BasicInfoIdle/BasicInfoIdle.js';
const HUD = 'src/UI/Components/PartyHud/PartyHud.js';
const GIDLE = 'src/UI/Components/GrupoIdle/GrupoIdle.js';
const SKILL = 'src/UI/Components/SkillList/SkillListCommon.js';
const CANTO = 'src/UI/Components/CombatCornerIdle/CombatCornerIdle.js';

const TESTES_DO_ALVO = {
	[BOT]: ['tests/ui/botMenuSoORedesenhoQueMudou.test.js', 'tests/ui/consumiveisEAvancado.test.js'],
	[CARRO]: ['tests/ui/changeCartNivelIgual.test.js'],
	[BARRA]: ['tests/ui/barraDoMembroSemRedesenho.test.js'],
	[GRUPO]: ['tests/ui/barraDoMembroSemRedesenho.test.js'],
	[DESTACADO]: ['tests/ui/barraDoMembroSemRedesenho.test.js'],
	[BASIC]: ['tests/ui/hudVidaSemReescritaIgual.test.js'],
	[HUD]: ['tests/ui/hudVidaSemReescritaIgual.test.js'],
	[GIDLE]: ['tests/ui/hudVidaSemReescritaIgual.test.js'],
	[SKILL]: ['tests/ui/hudVidaSemReescritaIgual.test.js'],
	[CANTO]: ['tests/ui/hudVidaSemReescritaIgual.test.js']
};

/** Tira UMA entrada da lista de um bloco do menu do Bot. */
const semEntrada = (nome, de, para) => [nome, BOT, de, para];

const MUTANTES = [
	// --- o menu do Bot: fechada so suja ---
	['B1 fechada desenha', BOT, 'if (!_redesenharSempre && !janelaAberta()) {', 'if (false) {'],
	['B2 fechada nao suja', BOT, '\t\t_janelaSuja = true;\n\t\tsincronizarAtualizacaoDoAvancado(_estado.secoes());', '\t\tsincronizarAtualizacaoDoAvancado(_estado.secoes());'],
	['B3 fechada nao para o relogio do Avancado', BOT, '\t\t_janelaSuja = true;\n\t\tsincronizarAtualizacaoDoAvancado(_estado.secoes());', '\t\t_janelaSuja = true;'],
	['B4 abrir nao desenha tudo', BOT, '\t\t_entradasDoBloco.clear();\n', ''],
	['B5 nunca reaproveita', BOT, 'function mesmasEntradas(antes, agora) {\n', 'function mesmasEntradas(antes, agora) {\n\treturn false;\n'],
	['B6 compara so o tamanho', BOT, 'if (!Object.is(antes[i], agora[i])) {', 'if (false) {'],
	['B7 o seletor aberto nao forca a Coleta', BOT, '!!(seletor && !seletor.hidden)', 'false'],
	['B8 as entradas de antes do desenho', BOT, '\tdesenharOBloco();\n\t_entradasDoBloco.set(nome, entradas());', '\tconst lidas = entradas();\n\tdesenharOBloco();\n\t_entradasDoBloco.set(nome, lidas);'],
	['B9 o caminho de antes ligado sempre', BOT, 'let _redesenharSempre = false;', 'let _redesenharSempre = true;'],
	// --- cada entrada de cada bloco (o oraculo tem de ver a falta de cada uma) ---
	semEntrada('B10 topo sem o ligado', '() => [s.ligado, pendenteOnOff, fraseDoTopo, textoDoMapa, naCidade]', '() => [pendenteOnOff, fraseDoTopo, textoDoMapa, naCidade]'),
	semEntrada('B11 topo sem o pendente', '() => [s.ligado, pendenteOnOff, fraseDoTopo, textoDoMapa, naCidade]', '() => [s.ligado, fraseDoTopo, textoDoMapa, naCidade]'),
	semEntrada('B12 topo sem a frase', '() => [s.ligado, pendenteOnOff, fraseDoTopo, textoDoMapa, naCidade]', '() => [s.ligado, pendenteOnOff, textoDoMapa, naCidade]'),
	semEntrada('B13 topo pelo objeto do status (e nao pela frase)', '() => [s.ligado, pendenteOnOff, fraseDoTopo, textoDoMapa, naCidade]', '() => [s.ligado, pendenteOnOff, s.status, textoDoMapa, naCidade]'),
	semEntrada('B14 topo sem o mapa', '() => [s.ligado, pendenteOnOff, fraseDoTopo, textoDoMapa, naCidade]', '() => [s.ligado, pendenteOnOff, fraseDoTopo, naCidade]'),
	semEntrada('B15 topo sem a cidade', '() => [s.ligado, pendenteOnOff, fraseDoTopo, textoDoMapa, naCidade]', '() => [s.ligado, pendenteOnOff, fraseDoTopo, textoDoMapa]'),
	semEntrada('B16 perfil sem o pendente', "bloco('perfil', () => [s.perfis, s.perfilAtivo, s.pendentePerfil]", "bloco('perfil', () => [s.perfis, s.perfilAtivo]"),
	semEntrada('B17 perfil sem os perfis', "bloco('perfil', () => [s.perfis, s.perfilAtivo, s.pendentePerfil]", "bloco('perfil', () => [s.perfilAtivo, s.pendentePerfil]"),
	semEntrada('B18 flecha atual sem as municoes', "bloco('flecha-atual', () => [s.municoes]", "bloco('flecha-atual', () => []"),
	semEntrada('B19 perfil ativo sem a postura', '() => [s.perfilAtivo, posturaConfirmada],', '() => [s.perfilAtivo],'),
	semEntrada('B20 abas sem a aba escolhida', "bloco('abas', () => [secoes, _preferences.aba]", "bloco('abas', () => [secoes]"),
	semEntrada('B21 abas sem as secoes', "bloco('abas', () => [secoes, _preferences.aba]", "bloco('abas', () => [_preferences.aba]"),
	semEntrada('B22 cacada sem o rascunho', "'cacada',\n\t\t\t() => [c, s.capacidades],", "'cacada',\n\t\t\t() => [s.capacidades],"),
	semEntrada('B23 cacada sem as capacidades', "'cacada',\n\t\t\t() => [c, s.capacidades],", "'cacada',\n\t\t\t() => [c],"),
	semEntrada('B24 monstros sem os monstros', "bloco('monstros', () => [c, s.monstros]", "bloco('monstros', () => [c]"),
	semEntrada('B25 monstros sem o rascunho', "bloco('monstros', () => [c, s.monstros]", "bloco('monstros', () => [s.monstros]"),
	semEntrada('B26 postura sem o grupo', "bloco('postura', () => [c, s.grupo]", "bloco('postura', () => [c]"),
	semEntrada('B27 ataque sem as skills', '() => [c, s.skills, s.monstros, s.capacidades, _escopoDasSkills,', '() => [c, s.monstros, s.capacidades, _escopoDasSkills,'),
	semEntrada('B28 ataque sem os monstros', '() => [c, s.skills, s.monstros, s.capacidades, _escopoDasSkills,', '() => [c, s.skills, s.capacidades, _escopoDasSkills,'),
	semEntrada('B29 ataque sem a especie', '() => [c, s.skills, s.monstros, s.capacidades, _escopoDasSkills,', '() => [c, s.skills, s.monstros, s.capacidades,'),
	semEntrada('B30 ataque sem a cidade', ' _escopoDasSkills, !!(s.contexto && s.contexto.ehCidade)]', ' _escopoDasSkills]'),
	semEntrada('B31 ataque sem o rascunho', '() => [c, s.skills, s.monstros, s.capacidades, _escopoDasSkills,', '() => [s.skills, s.monstros, s.capacidades, _escopoDasSkills,'),
	semEntrada('B32 sobrevivencia sem as pocoes', "bloco('sobrevivencia', () => [c, s.pocoes, s.capacidades]", "bloco('sobrevivencia', () => [c, s.capacidades]"),
	semEntrada('B33 suporte sem as skills', "bloco('suporte', () => [c, s.skills, s.capacidades]", "bloco('suporte', () => [c, s.capacidades]"),
	semEntrada('B34 coleta sem o rascunho', "'coleta',\n\t\t\t() => [c, s.capacidades],", "'coleta',\n\t\t\t() => [s.capacidades],"),
	semEntrada('B35 consumiveis sem os consumiveis', "bloco('consumiveis', () => [c, s.consumiveis, s.capacidades]", "bloco('consumiveis', () => [c, s.capacidades]"),
	semEntrada('B36 avancado sem o texto', '() => [s.diagnostico, textoDoAvancado]', '() => [s.diagnostico]'),
	semEntrada('B37 avancado sem o diagnostico', '() => [s.diagnostico, textoDoAvancado]', '() => [textoDoAvancado]'),
	semEntrada('B37b avancado pelo status de fora com o diagnostico', 'const doStatus = s.diagnostico ? s.diagnostico.status : s.status;', 'const doStatus = s.status;'),
	semEntrada('B38 perfis sem os perfis', "bloco('perfis', () => [s.perfis, s.perfilAtivo, s.pendentePerfil]", "bloco('perfis', () => [s.perfilAtivo, s.pendentePerfil]"),
	semEntrada('B39 perfis sem o pendente', "bloco('perfis', () => [s.perfis, s.perfilAtivo, s.pendentePerfil]", "bloco('perfis', () => [s.perfis, s.perfilAtivo]"),
	semEntrada('B40 flechas sem as municoes', "bloco('flechas', () => [c, s.municoes, s.municao, s.monstros, s.capacidades, secoes]", "bloco('flechas', () => [c, s.municao, s.monstros, s.capacidades, secoes]"),
	semEntrada('B41 flechas sem a municao', "bloco('flechas', () => [c, s.municoes, s.municao, s.monstros, s.capacidades, secoes]", "bloco('flechas', () => [c, s.municoes, s.monstros, s.capacidades, secoes]"),
	semEntrada('B42 recado sem o erro', "() => [s.erro, s.mudouNoServidor],", '() => [s.mudouNoServidor],'),
	semEntrada('B43 recado sem o mudou no servidor', "() => [s.erro, s.mudouNoServidor],", '() => [s.erro],'),
	semEntrada('B44 problemas sem os problemas', "() => [s.problemas],", '() => [],'),
	semEntrada('B45 rodape sem o dirty', '() => [s.conflito, s.mudouNoServidor, s.dirty, s.pendenteAplicar,', '() => [s.conflito, s.mudouNoServidor, s.pendenteAplicar,'),
	semEntrada('B46 rodape sem o pendente do Salvar', '() => [s.conflito, s.mudouNoServidor, s.dirty, s.pendenteAplicar,', '() => [s.conflito, s.mudouNoServidor, s.dirty,'),
	// B47 (o rodape sem o `conflito`) saiu: e EQUIVALENTE. O conflito so muda na resposta do Salvar (que sempre
	// solta o `pendenteAplicar`) e no descartar/recarregar (que sempre solta o `dirty`), e os dois estao nas entradas.
	semEntrada('B48 rodape sem o ligado', ' s.pendenteAplicar, s.ligado, s.pendenteLigarDesligar, s.carregado]', ' s.pendenteAplicar, s.pendenteLigarDesligar, s.carregado]'),
	// --- a lista de carrinhos ---
	['C1 onLevelUp sem guarda', CARRO, '\tif (blvl === _nivelDaLista) {\n\t\treturn;\n\t}\n\tupdateList(blvl);', '\tupdateList(blvl);'],
	['C2 init nao esquece o nivel', CARRO, '\t_nivelDaLista = null;\n\n\t// Pre-load carts', '\n\t// Pre-load carts'],
	['C3 a lista nao anota o nivel', CARRO, "\t_nivelDaLista = blvl;\n}", '}'],
	['C4 anota sem carrinho', CARRO, '\tif (Session.Entity.hasCart == false) {\n\t\treturn;\n\t}\n\n\tconst root = ChangeCart.getRoot();', '\tif (Session.Entity.hasCart == false) {\n\t\t_nivelDaLista = blvl;\n\t\treturn;\n\t}\n\n\tconst root = ChangeCart.getRoot();'],
	// --- a barra do membro do grupo ---
	['P1 barra sem guarda', BARRA, 'if (antes && antes.hp === hp && antes.maxhp === maxhp && canvas.width === LARGURA && canvas.height === ALTURA) {', 'if (false) {'],
	['P2 barra sem o hp', BARRA, 'antes.hp === hp && ', ''],
	['P3 barra sem o maximo', BARRA, 'antes.maxhp === maxhp && ', ''],
	['P4 barra sem a largura', BARRA, ' && canvas.width === LARGURA', ''],
	['P5 barra sem a altura', BARRA, ' && canvas.height === ALTURA', ''],
	['P6 contexto perdido nao esquece', BARRA, "\tcanvas.addEventListener('contextlost', esquecer);\n", ''],
	['P7 contexto devolvido nao esquece', BARRA, "\tcanvas.addEventListener('contextrestored', esquecer);\n", ''],
	['P8 a barra nao anota', BARRA, '\t_desenho.set(canvas, { hp, maxhp });\n', ''],
	['P9 esquecer nao esquece', BARRA, '\t_desenho.delete(canvas);\n}', '}'],
	['P10 o destacado limpa sem avisar', DESTACADO, '\t\t\tesquecerBarraDoMembro(canvas);\n', ''],
	['P11 o texto do grupo cru', GRUPO, 'if (hpEl) escreverTexto(hpEl, `${hp}/${maxhp}`);', 'if (hpEl) hpEl.textContent = `${hp}/${maxhp}`;'],
	['P12 a visibilidade do grupo crua', GRUPO, "if (hpEl) escreverEstilo(hpEl, 'visibility', barVisibility);", 'if (hpEl) hpEl.style.visibility = barVisibility;'],
	['P14 o destacado: a visibilidade crua', DESTACADO, "if (hpBarContainer) escreverEstilo(hpBarContainer, 'visibility', 'visible');", "if (hpBarContainer) hpBarContainer.style.visibility = 'visible';"],
	['P13 o texto do destacado cru', DESTACADO, 'if (hpText) escreverTexto(hpText, `${hp}/${maxhp}`);', 'if (hpText) hpText.textContent = `${hp}/${maxhp}`;'],
	// --- a HUD que pesquisa a vida ---
	['H1 a barra: o texto cru', BASIC, 'escreverNoTexto(text, `${val} / ${max}`);', 'text.textContent = `${val} / ${max}`;'],
	['H2 a barra: a porcentagem crua', BASIC, 'escreverNoTexto(pct, formatPercent(val, max));', 'pct.textContent = formatPercent(val, max);'],
	['H3 a inicial crua', BASIC, "escreverNoTexto(initialEl, name ? name.trim().charAt(0).toUpperCase() : '?');", "initialEl.textContent = name ? name.trim().charAt(0).toUpperCase() : '?';"],
	['H4 o ping cru', BASIC, "escreverNoTexto(el, ms === null ? '— ms' : `${ms} ms`);", "el.textContent = ms === null ? '— ms' : `${ms} ms`;"],
	['H5 o texto sempre escreve', BASIC, '\tif (el.textContent !== novo) {', '\tif (true) {'],
	['H6 a largura sempre escreve', BASIC, '\tif (el.style.width !== largura) {', '\tif (true) {'],
	['H7 a HUD do grupo: o numero cru', HUD, 'escreverTexto(numero, barra.texto);', 'numero.textContent = barra.texto;'],
	['H8 a HUD do grupo: a largura sem a forma lida', HUD, "escreverEstilo(fill, 'width', largura + '%', Number(largura) + '%');", "escreverEstilo(fill, 'width', largura + '%');"],
	['H9 a janela de grupo: o numero cru', GIDLE, 'escreverTexto(numero, barra.texto);', 'numero.textContent = barra.texto;'],
	['H10 a janela de grupo: o titulo cru', GIDLE, "escreverTitulo(estado, barra.vivo ? 'No mundo' : 'Caido');", "estado.title = barra.vivo ? 'No mundo' : 'Caido';"],
	['H11 os pontos de habilidade crus', SKILL, "escreverTexto(root.querySelector('.skpoints_count'), amount);", "root.querySelector('.skpoints_count').textContent = amount;"],
	['H12 o botao: o atributo sempre', CANTO, '\tif (el.getAttribute(nome) !== valor) {', '\tif (true) {'],
	['H13 o botao: o titulo cru', CANTO, '\tescreverTitulo(button, dica);', '\tbutton.title = dica;']
];

const resultados = [];
const CONFERIR = process.argv[2] === '--conferir';
const SO = process.argv[2] && !CONFERIR ? new RegExp(process.argv[2]) : null;
for (let [nome, arquivo, de, para] of MUTANTES) {
	if (SO && !SO.test(nome)) {
		continue;
	}
	const caminho = `${RAIZ}/${arquivo}`;
	const original = readFileSync(caminho, 'utf8');
	/* Os arquivos do cliente estao em CRLF na arvore de trabalho (os novos podem estar em LF). */
	if (original.includes('\r\n')) {
		de = de.replace(/\n/g, '\r\n');
		para = para.replace(/\n/g, '\r\n');
	}
	const vezes = original.split(de).length - 1;
	if (vezes !== 1) {
		resultados.push([nome, `TRECHO ACHADO ${vezes}x - mutante nao aplicado`]);
		continue;
	}
	if (CONFERIR) {
		resultados.push([nome, 'morto (so conferido: casa 1 vez)']);
		continue;
	}
	try {
		writeFileSync(caminho, original.replace(de, () => para));
		const r = spawnSync(process.execPath, [VITEST, 'run', ...TESTES_DO_ALVO[arquivo]], { cwd: RAIZ, encoding: 'utf8' });
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
