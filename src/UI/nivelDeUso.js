/**
 * UI/nivelDeUso.js
 *
 * O NIVEL DE USO ESCOLHIDO (D-1906, 01/10/2026) — as regras sem DOM que a
 * Configuracao idle, a janela de Habilidades e a barra de atalhos dividem.
 *
 * O pedido do dono, literal: *"preciso que seja possivel alterar o nivel da
 * habilidade ativa que sera usada, seja na barra (manual) ou no automatico
 * (configuracao/cerebro idle). O motivo e simples: tem players que preferem
 * utilizar habilidades num nivel abaixo porque consome menos SP e ainda assim
 * mata o mob inimigo. E que seja facil do player identificar/fazer isso, tanto
 * no mobile como no desktop."*
 *
 * ─── AS DUAS ESCOLHAS, E POR QUE SO DUAS ────────────────────────────────
 *
 * - **"max"** = o nivel ACOMPANHA o aprendido. E o que toda entrada sempre foi
 *   (D-635: a Fire Bolt posta no nivel 1 sobe junto quando ela sobe), e e o
 *   que a entrada continua sendo quando o jogador nao mexe no seletor.
 * - **"fixo"** = o jogador escolheu um nivel ABAIXO do maximo. Ele fica onde
 *   foi posto quando a habilidade sobe — e o motivo inteiro do pedido.
 *
 * Voltar ao maximo pelo seletor DESFAZ o fixo: "maximo" e "acompanhar" sao a
 * mesma escolha. No contrato do servidor a diferenca e a marca `nivelFixo`
 * (rotacao e buffs) e a PRESENCA de `nivelDeUso` no ajuste da cura — ver
 * `servidor/idle/nivel-da-rotacao.ts` (D-1905), cuja regra a funcao
 * `nivelEfetivoDaEntrada` daqui espelha para a janela desenhar o que o
 * servidor vai conjurar.
 *
 * ─── O SELETOR DESENHADO AQUI ───────────────────────────────────────────
 *
 * `[−] Nv 7/10 · 22 SP [+]` e um selo "fixo" ou "max" ao lado. O HTML e
 * gerado aqui para as tres telas terem a MESMA forma (um segundo desenho
 * envelheceria em paralelo), e o estilo `.ri-nivel*` mora no `Common.css`,
 * que o `GUIComponent` replica em todo Shadow DOM.
 *
 * Este modulo nao importa nada: a `pilhaDeJanelas` o importa para o ESC e o
 * voltar do Android fecharem o seletor da barra antes de qualquer janela.
 */

import NOME_PT_POR_CONSTANTE from 'DB/Skills/SkillNamePtBr.js';
import { emIngles } from 'Core/Idioma.js';

/* ═══════════════════════════════════════════════════════════════════════
   A REGRA (o espelho do servidor)
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * O nivel que esta entrada conjura com a habilidade em `aprendido` — a MESMA
 * conta de `nivelDeUsoDaEntrada` no servidor: com a marca, o escolhido (nunca
 * acima do aprendido); sem ela, o aprendido.
 *
 * @param {{nivelDeUso:number, nivelFixo?:boolean}} entrada
 * @param {number} aprendido
 * @returns {number}
 */
export function nivelEfetivoDaEntrada(entrada, aprendido) {
	if (!(aprendido >= 1)) {
		return entrada.nivelDeUso;
	}
	if (entrada.nivelFixo === true) {
		return Math.min(entrada.nivelDeUso, aprendido);
	}
	return aprendido;
}

/** O nivel pedido, preso em 1..aprendido. */
function noIntervalo(nivel, aprendido) {
	return Math.max(1, Math.min(Math.floor(nivel), aprendido));
}

/**
 * A entrada da ROTACAO (ou dos BUFFS) com o nivel novo.
 *
 * Abaixo do maximo: `nivelFixo: true` e SEM a marca `automatica` — mexer no
 * nivel de uma habilidade que a automacao instalou e um gesto do jogador
 * sobre ela, e a entrada passa a ser dele (o servidor tambem a protege:
 * `entradaDoJogador`, `rotacao-por-dano.ts`). No maximo: a marca sai e o nivel
 * volta a acompanhar.
 *
 * Os outros campos (alvo, condicoes) atravessam intactos.
 *
 * @returns {object} uma entrada NOVA; a de entrada nunca e mexida
 */
export function entradaComNivel(entrada, nivel, aprendido) {
	const n = noIntervalo(nivel, aprendido);
	const nova = { ...entrada, nivelDeUso: n };
	if (n >= aprendido) {
		delete nova.nivelFixo;
		return nova;
	}
	nova.nivelFixo = true;
	delete nova.automatica;
	return nova;
}

/**
 * O nivel em que esta CURA sai: o escolhido (presente no ajuste), preso ao
 * aprendido; sem escolha, o aprendido — o `nivelDaCura` do servidor.
 */
export function nivelDaCura(ajuste, aprendido) {
	const escolhido = ajuste && ajuste.nivelDeUso;
	return typeof escolhido === 'number' ? Math.min(escolhido, aprendido) : aprendido;
}

/**
 * O ajuste da cura com o nivel novo: abaixo do maximo grava `nivelDeUso`; no
 * maximo o campo SAI (acompanha). O interruptor e o alvo atravessam.
 */
export function ajusteDaCuraComNivel(ajuste, nivel, aprendido) {
	const n = noIntervalo(nivel, aprendido);
	const novo = { ...(ajuste || {}) };
	if (n >= aprendido) {
		delete novo.nivelDeUso;
	} else {
		novo.nivelDeUso = n;
	}
	return novo;
}

/**
 * O SP de um nivel, pela lista que o servidor mandou (`[0]` = nivel 1), ou
 * `null` quando ela nao tem esse nivel — e a tela entao NAO mostra SP, em vez
 * de mostrar um numero que nao saiu do servidor (regra 1).
 *
 * @param {number[]|undefined} custos
 * @param {number} nivel
 * @returns {number|null}
 */
export function spDoNivel(custos, nivel) {
	if (!Array.isArray(custos)) {
		return null;
	}
	const sp = custos[nivel - 1];
	return typeof sp === 'number' ? sp : null;
}

/* ═══════════════════════════════════════════════════════════════════════
   O DESENHO
   ═══════════════════════════════════════════════════════════════════════ */

/** O texto seguro para entrar em HTML (o nome da habilidade vem do servidor). */
export function escapar(texto) {
	return String(texto)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/**
 * O nivel de um SLOT da barra depois de um "−"/"+": parte do que ele conjura
 * hoje (o slot acima do aprendido conjura no aprendido, `clif.cpp:12976`) e
 * fica em 1..aprendido. Com o aprendido desconhecido (0), o slot nao muda.
 */
export function nivelDoSlotComPasso(nivelDoSlot, aprendido, passo) {
	if (!(aprendido >= 1)) {
		return nivelDoSlot;
	}
	const atual = Math.min(nivelDoSlot, aprendido);
	return Math.max(1, Math.min(atual + passo, aprendido));
}

/** "Nv 7/10 · 22 SP" (sem o SP quando ele nao e conhecido). */
export function textoDoNivel(nivel, aprendido, sp) {
	return `Nv ${nivel}/${aprendido}` + (sp === null || sp === undefined ? '' : ` · ${sp} SP`);
}

/** O que os dois selos dizem, para quem pousar o cursor ou o dedo. */
export const AJUDA_DO_FIXO = 'Nível escolhido por você: não sobe sozinho quando a habilidade sobe. Suba até o máximo para voltar a acompanhar.';
export const AJUDA_DO_MAXIMO = 'No nível máximo: sobe junto quando a habilidade sobe.';

/**
 * O SELETOR `[−] Nv 7/10 · 22 SP [+]` + o selo, como HTML.
 *
 * - `chave` vai em `data-nivel-chave` e diz a QUEM o seletor pertence
 *   (`rotacao.0`, `rotacaoDeBuffs.2`, `cura.AL_HEAL`, `barra.5`); os botoes
 *   carregam `data-nivel-passo` (-1 / +1). Quem desenha liga um ouvinte so.
 * - O "−" apaga no nivel 1. O "+" apaga no maximo, MENOS quando a entrada esta
 *   fixa: ai ele e o caminho de volta a acompanhar (o fixo pode estar no
 *   aprendido depois de a habilidade ter sido desaprendida ate ele).
 *
 * @param {object} d
 * @param {string} d.chave
 * @param {number} d.nivel      o nivel que sai hoje
 * @param {number} d.aprendido
 * @param {boolean} d.fixo
 * @param {number|null} d.sp     o SP do nivel, ou null
 * @param {string} d.nome        o nome da habilidade, para o rotulo acessivel
 * @param {string} [d.classe]    classe extra no conteiner
 * @returns {string}
 */
export function htmlDoSeletorDeNivel({ chave, nivel, aprendido, fixo, sp, nome, classe }) {
	const nomeSeguro = escapar(nome);
	const podeDescer = nivel > 1;
	const podeSubir = nivel < aprendido || fixo;
	const selo = fixo
		? `<span class="ri-badge ri-badge--ouro ri-nivel-selo" title="${escapar(AJUDA_DO_FIXO)}">fixo</span>`
		: `<span class="ri-badge ri-badge--azul ri-nivel-selo" title="${escapar(AJUDA_DO_MAXIMO)}">máx</span>`;
	return (
		`<span class="ri-nivel${fixo ? ' is-fixo' : ''}${classe ? ' ' + escapar(classe) : ''}" data-nivel-chave="${escapar(chave)}">` +
		`<button type="button" class="ri-nivel-btn" data-nivel-passo="-1"${podeDescer ? '' : ' disabled'} aria-label="Baixar o nível de ${nomeSeguro}" title="Baixar o nível (gasta menos SP)">−</button>` +
		`<span class="ri-nivel-valor" aria-live="polite">${escapar(textoDoNivel(nivel, aprendido, sp))}</span>` +
		`<button type="button" class="ri-nivel-btn" data-nivel-passo="1"${podeSubir ? '' : ' disabled'} aria-label="Subir o nível de ${nomeSeguro}" title="Subir o nível">+</button>` +
		selo +
		'</span>'
	);
}

/**
 * Le o clique num botao do seletor: a chave do dono e o passo, ou `null` se o
 * clique nao foi num botao de seletor habilitado.
 *
 * @param {Element|null} alvo o `event.target`
 * @returns {{chave:string, passo:number}|null}
 */
export function lerPassoDoSeletor(alvo) {
	const botao = alvo && alvo.closest ? alvo.closest('[data-nivel-passo]') : null;
	if (!botao || botao.disabled) {
		return null;
	}
	const dono = botao.closest('[data-nivel-chave]');
	if (!dono) {
		return null;
	}
	const passo = Number(botao.getAttribute('data-nivel-passo'));
	return Number.isFinite(passo) && passo !== 0 ? { chave: dono.getAttribute('data-nivel-chave'), passo } : null;
}

/* ═══════════════════════════════════════════════════════════════════════
   A BARRA DE ATALHOS
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * A dica do slot: `[ F3 ] Fire Bolt · Nv 7 · 22 SP`. O colchete com espacos e
 * o formato que a barra ja usava (`ShortCut.js`); o nivel e o SP sao o que a
 * D-1906 somou, para o jogador ver no passar do mouse em que nivel o atalho
 * conjura sem abrir janela nenhuma.
 */
export function dicaDoAtalho({ hotkey, nome, nivel, sp }) {
	const base = hotkey ? `[ ${hotkey} ] ${nome}` : nome;
	if (!(nivel >= 1)) {
		return base;
	}
	return `${base} · Nv ${nivel}` + (sp === null || sp === undefined ? '' : ` · ${sp} SP`);
}

/*
 * O SP POR NIVEL QUE A TELA JA VIU, por habilidade (o nome do skill_db, o
 * mesmo `Name` do `SkillInfo`). A barra nao tem pacote proprio que traga o
 * custo de cada nivel; quem tem e a janela de Habilidades (`mecanica`) e a
 * Configuracao idle (`custoSpPorNivel`). Elas registram aqui quando recebem,
 * e a barra le. O custo e da HABILIDADE, e nao do personagem — entao nao ha o
 * que esquecer na troca de personagem. Sem registro, a dica sai sem SP.
 */
const _spPorNivel = new Map();

/** Guarda a lista de SP por nivel (`[0]` = nivel 1) de uma habilidade. */
export function lembrarSpPorNivel(nomeDaSkill, custos) {
	if (typeof nomeDaSkill === 'string' && Array.isArray(custos) && custos.length) {
		_spPorNivel.set(nomeDaSkill, custos.slice());
	}
}

/** O SP de um nivel ja visto pela tela, ou `null`. */
export function spLembrado(nomeDaSkill, nivel) {
	return spDoNivel(_spPorNivel.get(nomeDaSkill), nivel);
}

/*
 * O NOME QUE AS JANELAS JA MOSTRAM, por habilidade (01/10/2026). O balao e a
 * dica do slot liam o `SkillName` do `SkillInfo` (a tabela do cliente, "Fire
 * Bolt"), e a janela de Habilidades e a Configuracao idle mostram o `nome` que
 * o servidor manda ("Lancas de Fogo", o `skillinfoz1` do GRF). A barra nao tem
 * pacote com o nome; as duas janelas o registram aqui, como o SP acima. A
 * Configuracao idle e sondada a cada entrada no mapa (`IdleConfig.sondarMapa`),
 * entao o nome chega sem o jogador abrir janela nenhuma — e a barra, avisada,
 * refaz as dicas.
 */
const _nomePorSkill = new Map();
const _aoLembrarNomes = new Set();

/**
 * Guarda o nome de exibicao de cada `{ skillId, nome }` da lista e avisa quem
 * escuta UMA vez, se algum mudou. O servidor sem traducao manda o proprio id
 * como `nome` (`nomes.get(...) ?? skillId`): esse nao e lembrado, para nao
 * trocar "Fire Bolt" por "MG_FIREBOLT".
 */
export function lembrarNomesDasHabilidades(lista) {
	let mudou = false;
	for (const s of lista || []) {
		if (!s || typeof s.skillId !== 'string' || typeof s.nome !== 'string') {
			continue;
		}
		if (s.nome === '' || s.nome === s.skillId || _nomePorSkill.get(s.skillId) === s.nome) {
			continue;
		}
		_nomePorSkill.set(s.skillId, s.nome);
		mudou = true;
	}
	if (mudou) {
		_aoLembrarNomes.forEach(fn => fn());
	}
}

/** O nome que as janelas mostram para a habilidade, ou `null`. */
export function nomeLembrado(nomeDaSkill) {
	return _nomePorSkill.get(nomeDaSkill) ?? null;
}

/** Escuta os nomes novos. Devolve a funcao que para de escutar. */
export function aoLembrarNomes(fn) {
	_aoLembrarNomes.add(fn);
	return () => _aoLembrarNomes.delete(fn);
}

/**
 * O nome que a BARRA desenha para a habilidade `ID`: o das janelas quando ja
 * chegou; senao o da tabela do cliente; sem tabela, o proprio id.
 */
export function nomeNaBarra(info, ID) {
	if (!info) {
		return String(ID);
	}
	// O nome lembrado e indexado pelo id do SERVIDOR (BA_FROSTJOKER) e `info.Name` e o do CLIENTE (BA_FROSTJOKE): sem acerto,
	// a tabela em portugues do cliente vem antes do `SkillName` ingles (nao mostra "Unbarring Octave").
	return nomeLembrado(info.Name) || (!emIngles() && NOME_PT_POR_CONSTANTE[info.Name]) || info.SkillName;
}

/* ═══════════════════════════════════════════════════════════════════════
   O FECHAMENTO DO SELETOR DA BARRA (o ESC e o voltar do Android)
   ═══════════════════════════════════════════════════════════════════════ */

/*
 * O seletor da barra e um balao, e nao uma janela da pilha: registra-lo la
 * marcaria o host da BARRA com `.ri-janela` e a transformaria em painel de
 * tela cheia no celular (D-932) — o mesmo motivo do cartaz de boas-vindas.
 * Mas o ESC e o voltar do Android precisam fecha-lo PRIMEIRO, e o voltar com
 * nada aberto pergunta se o jogador quer sair do jogo. Entao quem o abre
 * registra aqui como fecha-lo, e a pilha pergunta antes de olhar as janelas
 * (o mesmo arranjo do "algo na mao" de `toqueParaAtalho.js`).
 */
let _fecharSeletor = null;

/** Quem abriu o seletor diz como fecha-lo (null = ele fechou). */
export function registrarFechamentoDoSeletor(fechar) {
	_fecharSeletor = typeof fechar === 'function' ? fechar : null;
}

/**
 * Fecha o seletor da barra se ele estiver aberto. Devolve se fechou — e a
 * pergunta que a pilha faz no ESC.
 */
export function fecharSeletorDeNivel() {
	if (!_fecharSeletor) {
		return false;
	}
	const fechar = _fecharSeletor;
	_fecharSeletor = null;
	fechar();
	return true;
}

/** So para os testes: volta ao estado de modulo recem-carregado. */
export function _zerarNivelDeUso() {
	_spPorNivel.clear();
	_fecharSeletor = null;
}
