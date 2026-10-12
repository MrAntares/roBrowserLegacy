/**
 * UI/Components/IdleSkills/IdleSkills.js
 *
 * "Habilidades de {classe}" — janela RAGIDLE. Desde 31/08/2026 (D-799, pedido
 * do dono) ela é uma **ÁRVORE DE HABILIDADES**, e não mais uma lista de cards.
 *
 * ===========================================================================
 * O QUE MUDOU, E POR QUÊ
 * ===========================================================================
 *
 * A referência é a print do **Ragnarok LATAM** que o dono mandou: trilho de
 * abas na vertical à esquerda (1ª, 2ª, 3ª, Variadas), grade de ícones com
 * `◀ n/m ▶` embaixo de cada um, o interruptor "Descrições" no alto, e
 * "Pontos de habilidade" + "Aplicar"/"Resetar" no rodapé. O pedido foi explícito
 * em manter **o nosso UI Premium** — então nada do chrome do cliente oficial
 * entrou: tudo aqui é token do design system (`UI/Common.css`, bloco RAGIDLE).
 *
 * Três coisas que a lista antiga não fazia e a árvore faz:
 *
 * 1. **O DESENHO MOSTRA A DEPENDÊNCIA.** Coluna = profundidade na árvore de
 *    pré-requisitos, e um fio ligado do pai ao filho. Era a informação que a
 *    lista escondia: o jogador via "não pode aprender" e não via de onde vem.
 * 2. **AS ABAS SÃO DEGRAUS DA CARREIRA**, e não categorias inventadas. Elas
 *    vêm do servidor (`payload.graus`, ver `grau-da-habilidade.ts`): um
 *    Aprendiz tem uma aba, um Cavaleiro tem três. As antigas
 *    ("Ativas"/"Passivas"/"Suporte") tinham uma aba que era honestamente vazia.
 * 3. **RASCUNHO com "Aplicar".** As setas mexem num rascunho LOCAL; o servidor
 *    só é chamado no "Aplicar", que manda o lote inteiro num pacote só e o
 *    aplica de forma atômica (ver o bloco do lote em `servidor-mapa.ts`). Antes
 *    era um pacote por nível — e cada um deles devolve o payload inteiro da
 *    janela.
 *
 * A geometria da árvore e o juiz do rascunho moram em `arvoreDeSkills.js`, que
 * é puro e tem prova própria (`tests/ui/arvoreDeSkills.test.js`). Aqui fica o
 * que só a pilha ao vivo julga: DOM, pacote e preferência.
 *
 * ===========================================================================
 * PROTOCOLO (extensão nossa, não é rAthena/roBrowser de fábrica)
 * ===========================================================================
 *
 *   CZ_RAGIDLE_PEDIR_SKILLS  0x0ff9  (cliente -> servidor, fixo, só o opcode)
 *   ZC_RAGIDLE_SKILLS        0x0ffa  (servidor -> cliente, variável, JSON;
 *                                     responde a TODOS os três de baixo)
 *   CZ_RAGIDLE_APRENDER      0x0ffb  (cliente -> servidor, variável, JSON —
 *                                     `{ skillId }` para um nível, ou
 *                                     `{ lote: [{skillId, niveis}] }` para o
 *                                     "Aplicar")
 *
 * Declarados em `Network/PacketStructure.js` (busque "RAGIDLE:") e registrados
 * para o enquadramento de recepção em `Network/PacketRegister.js` e
 * `Network/Packets/packets2021_len_main.js`.
 *
 * **O contrato do JSON é `servidor/mapa/contrato-de-skills.ts`**, e ele está na
 * versão **2** desde D-799 (a v1 não trazia `preRequisitos`, `grau`,
 * `aceitaPeloMotor` nem os níveis do personagem). O `if` de versão logo abaixo
 * RECUSA a v1 de propósito: um servidor velho responderia sem pré-requisito
 * nenhum, e a janela desenharia uma árvore sem nenhuma ligação — plausível e
 * errada, que é o pior resultado possível. `contrato-de-skills.test.ts` cobra
 * que todo campo lido aqui exista lá.
 *
 * @author RagIdle
 */

import Renderer from 'Renderer/Renderer.js';
import { habilidadesNoIdioma } from './habilidadesNoIdioma.js';
import { traduzir } from 'Core/Traducao.js';
import Preferences from 'Core/Preferences.js';
import SkillInfo from 'DB/Skills/SkillInfo.js';
import { montarMapaNomeParaId } from 'DB/Skills/apelidosDoServidor.js'; // N4 da auditoria de tela
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import buildResumo from './resumoDaDescricao.js';
import RiIcones from 'UI/ri-icones.js';
import { ehCelularEmPe } from 'UI/hudVertical.js'; // D-942: o detalhe vira folha no celular em pe
import MissoesIdle from 'UI/Components/MissoesIdle/MissoesIdle.js'; // 09/09/2026: a etiqueta de quest leva a missao
import htmlText from './IdleSkills.html?raw';
import cssText from './IdleSkills.css?raw';
import { fecharEEsquecer } from '../limpezaDeJanelaIdle.js';
import { abaLembrada, lembrarAba } from '../memoriaDeAba.js';
import { pegar, pendente, assinar } from 'UI/toqueParaAtalho.js';
import { lembrarNomesDasHabilidades, lembrarSpPorNivel, lerPassoDoSeletor } from 'UI/nivelDeUso.js';
import { escolhasComPasso, htmlDoNivelParaABarra, nivelParaABarra, spPorNivelDaMecanica } from './nivelParaABarra.js';
import {
	NO_L,
	avaliarDescer,
	avaliarSubir,
	montarPlano,
	nivelEfetivo,
	ordemDoLote,
	pontosNoRascunho
} from './arvoreDeSkills.js';
import { linhaDaMissaoNoRequisito } from './requisitoDeMissao.js';

/**
 * A versão do contrato que esta janela sabe ler.
 *
 * Espelha `VERSAO_DO_CONTRATO_DE_SKILLS` em
 * `servidor/mapa/contrato-de-skills.ts` — e o teste de contrato daquele repo
 * cobra que os dois números sejam o mesmo, porque ele é a única coisa que
 * separa "árvore certa" de "árvore plausível e errada".
 */
const VERSAO_DO_CONTRATO = 5;

// N4 da auditoria de tela: o servidor manda o nome do rAthena (BA_FROSTJOKER) e o
// `SkillInfo.Name` do cliente e BA_FROSTJOKE; sem o apelido a skill nao ia a barra.
const NUMERIC_SKILL_ID_BY_NAME = montarMapaNomeParaId(SkillInfo);

/**
 * Mantenha em sincronia com o ":host" / ".is-window" do IdleSkills.css e com
 * `--w-idleskills`/`--h-idleskills` no Common.css — os três dizem a mesma
 * medida, e é ela que `#draggable()` usa para prender a janela na tela.
 *
 * Cresceu de 640x560 para 980x640 com a árvore (940x620 na primeira rodada;
 * a segunda encorpou o nó e as quatro colunas do Cavaleiro pediam o resto):
 * a lista antiga cabia numa coluna de 190px, e o plano de uma 2ª classe não.
 */
const WINDOW_WIDTH = 980;
const WINDOW_HEIGHT = 640;

/**
 * Quanto tempo uma recusa do servidor fica em vermelho no rodapé antes de sumir.
 */
const PROBLEMAS_TIMEOUT_MS = 6000;

/**
 * Create Component
 */
const IdleSkills = new GUIComponent('IdleSkills', cssText);

/**
 * Os glifos do chrome (chevrons da plaqueta, check dos requisitos, o icone do
 * botao flutuante) entram pelo marcador "<!--RI_ICONE:chave-->" do .html e
 * pelas chaves de ri-icones.js — UM arquivo para todo glifo, por regra.
 */
IdleSkills.render = () => htmlText.replace(/<!--RI_ICONE:(\w+)-->/g, (_, chave) => RiIcones[chave] || '');

/**
 * O ícone flutuante não pode bloquear clique/hover na cena — mesma escolha do
 * HuntMap, do IdleConfig e do AdminPanel.
 */
IdleSkills.mouseMode = GUIComponent.MouseMode.CROSS;

/**
 * @var {object|null} o último payload completo confirmado pelo servidor.
 *      Sempre substituído por inteiro (o contrato garante que toda resposta é o
 *      estado corrente completo).
 */
IdleSkills.serverData = null;

/** @var {string|null} a habilidade selecionada (dirige o painel de detalhe). */
IdleSkills.selectedSkillId = null;

/**
 * @var {Record<string, number>} O RASCUNHO: quantos níveis o jogador somou à
 *      mão e ainda não aplicou, por skillId. Só o "Aplicar" o transforma em
 *      pacote; "Resetar" o joga fora. Ele NÃO atravessa a resposta do servidor
 *      quando o lote é aceito, e SOBREVIVE quando ele é recusado — nesse caso
 *      nada mudou do outro lado, e jogar fora o plano do jogador por causa de
 *      uma recusa seria punir duas vezes.
 */
IdleSkills.rascunho = {};

/**
 * @var {Record<string, number>} O NIVEL DE USO que a proxima colocacao na
 *      barra leva, por skillId (D-1908). Ausente = o maximo, que acompanha a
 *      habilidade quando ela sobe. E escolha de TELA: o servidor guarda o
 *      nivel no slot, e nao aqui. Ver `nivelParaABarra.js`.
 */
IdleSkills.nivelParaBarra = {};

/**
 * @var {boolean} há um "Aplicar" no ar esperando resposta?
 *
 * Existe porque o `aplicado: true` do contrato NÃO diz qual gesto foi aplicado:
 * pôr uma habilidade na rotação de ataque volta com o mesmo `true`. Sem esta
 * marca, mexer na rotação com um rascunho aberto apagaria o rascunho.
 */
IdleSkills._esperandoAplicar = false;

/**
 * @var {number|null} o prazo de seguranca do "Aplicar" no ar (H09).
 *
 * Com um lote no ar o botao fica apagado e um segundo clique nao sai; se a
 * resposta se perder, este prazo devolve o botao — sem ele, uma queda no meio
 * deixaria o "Aplicar" preso ate o jogador mexer no rascunho. O mesmo teto de
 * 10 s da trava da `TemporadaIdle`.
 */
let _prazoDoAplicar = null;
const MS_ATE_SOLTAR_O_APLICAR = 10000;

/** @var {number} o degrau (grau) da aba acesa. */
IdleSkills.grauAtivo = 0;

/** @var {boolean} o painel de detalhe está aberto? (interruptor "Descrições") */
IdleSkills.mostrarDescricoes = true;

/** @var {string[]} recusas transitórias do servidor, para a mensagem vermelha. */
IdleSkills.problemas = [];

/** @var {number|null} handle do setTimeout que limpa `problemas`. */
IdleSkills._problemasTimer = null;

/**
 * @var {Preferences} posição da janela (x/y `null` até o jogador mover), o
 *      degrau em que ele estava (`aba`) e o interruptor de descrições.
 *
 * A versão continua 1.0 de propósito: subir apagaria a POSIÇÃO já ajustada só
 * para ganhar campos que já funcionam sem isso (ver `memoriaDeAba.js`).
 */
const _preferences = Preferences.get(
	'IdleSkills',
	{
		x: null,
		y: null,
		aba: null,
		descricoes: true
	},
	1.0
);

/** Helper: query inside shadow root */
function _root() {
	return IdleSkills._shadow || IdleSkills._host;
}

/**
 * Escapa texto vindo do servidor antes de entrar em `innerHTML`. Espelha o
 * helper privado do IdleConfig (que não o exporta).
 */
function escapeHtml(value) {
	return String(value == null ? '' : value).replace(/[&<>"']/g, ch => {
		switch (ch) {
			case '&':
				return '&amp;';
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '"':
				return '&quot;';
			default:
				return '&#39;';
		}
	});
}

/**
 * Duas letras de reserva a partir do skillId ("NV_BASIC" -> "NB"), para quando
 * o PNG do ícone não existe.
 */
function skillInitials(skillId) {
	const parts = String(skillId || '').split('_');
	if (parts.length >= 2 && parts[0] && parts[1]) {
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}
	return String(skillId || '')
		.slice(0, 2)
		.toUpperCase();
}

/** "N habilidade(s) disponível(is)" em PT-BR de verdade. */
function pluralizeDisponiveis(n) {
	return n === 1 ? '1 habilidade para subir' : n + ' habilidades para subir';
}

/**
 * O rótulo curto da aba de um degrau — "Var" para o Aprendiz, "1ª"/"2ª"/"3ª"
 * para os degraus de classe. É o rótulo da referência LATAM; o nome da classe
 * por extenso fica embaixo dele e no `title`.
 */
function rotuloDoGrau(grau) {
	if (grau <= 0) {
		return 'Var';
	}
	return grau + 'ª';
}

/** TODAS as habilidades do payload, por skillId. Refeito a cada resposta. */
function indicePorId() {
	const porId = new Map();
	const data = IdleSkills.serverData;
	if (data) {
		data.skills.forEach(s => porId.set(s.skillId, s));
	}
	return porId;
}

/** O contexto que `avaliarSubir`/`avaliarDescer` pedem. */
function contextoDoRascunho() {
	const data = IdleSkills.serverData;
	return {
		porId: indicePorId(),
		rascunho: IdleSkills.rascunho,
		pontos: data ? data.pontos : 0,
		nivelBase: data ? data.nivelBase : 0,
		nivelDeJob: data ? data.nivelDeJob : 0,
		// D-1366: a árvore aberta e o trilho, para o rascunho refazer a trava.
		trava: data ? data.trava : null,
		graus: data ? data.graus : []
	};
}

/**
 * Os degraus do trilho: os que o servidor mandou, mais um "Outras" de
 * emergência se alguma habilidade vier com grau que não está na lista.
 *
 * O "Outras" existe porque o modo de falha alternativo é MUDO: uma habilidade
 * sem aba não cai em lugar nenhum e some da janela — o jogador vê uma árvore
 * com um buraco e nada acusa. O servidor manda `grau: -1` quando não soube
 * dizer (ver `contrato-de-skills.ts`), e é exatamente esse caso que cai aqui.
 */
function degrausDoTrilho() {
	const data = IdleSkills.serverData;
	if (!data) {
		return [];
	}
	const trilho = data.graus.map(g => ({
		grau: g.grau,
		rotulo: rotuloDoGrau(g.grau),
		nome: g.nomePt
	}));
	const conhecidos = new Set(trilho.map(g => g.grau));
	const orfas = data.skills.filter(s => !conhecidos.has(s.grau));
	if (orfas.length) {
		trilho.push({ grau: orfas[0].grau, rotulo: '?', nome: 'Outras' });
	}
	return trilho;
}

/** As habilidades do degrau aceso, na ordem da árvore. */
function skillsDoGrau() {
	const data = IdleSkills.serverData;
	if (!data) {
		return [];
	}
	return data.skills.filter(s => s.grau === IdleSkills.grauAtivo);
}

/**
 * Setup de uma vez só (roda dentro do `GUIComponent#prepare()`).
 */
IdleSkills.init = function init() {
	const root = _root();

	/*
	 * A aba lembrada vem como TEXTO (é assim que `memoriaDeAba.js` guarda tudo),
	 * e aqui ela é um número. Sem lista de abas válidas: quantos degraus existem
	 * depende da CARREIRA do personagem, e ela só se sabe quando o payload chega
	 * — o `renderRail` conserta uma aba que não existe mais.
	 */
	IdleSkills.grauAtivo = parseInt(abaLembrada(_preferences, '0'), 10) || 0;
	IdleSkills.mostrarDescricoes = _preferences.descricoes !== false;

	root.querySelector('.is-button').addEventListener('click', onClickButton);
	root.querySelector('.is-close').addEventListener('click', onClickClose);
	root.querySelector('.is-btn-aplicar').addEventListener('click', onClickAplicar);
	root.querySelector('.is-btn-resetar').addEventListener('click', onClickResetar);
	/* D-942: o "Voltar para a arvore" da folha de detalhe do celular. Guarda
	   pelo mesmo motivo dos vizinhos: este init roda dentro de
	   MapEngine.init e excecao aqui derruba o mundo. */
	const voltarDetalhe = root.querySelector('.is-voltar-detalhe');
	if (voltarDetalhe) {
		voltarDetalhe.addEventListener('click', e => {
			e.stopImmediatePropagation();
			fecharDetalheMovel();
		});
	}

	const check = root.querySelector('.is-desc-check');
	check.checked = IdleSkills.mostrarDescricoes;
	check.addEventListener('change', onToggleDescricoes);

	// `#draggable()` move o ":host" por left/top usando a barra de título como
	// pega — mesma chamada das outras janelas RAGIDLE.
	this.draggable(root.querySelector('.is-titlebar'));

	this._host.style.top = Math.max(0, (Renderer.height - WINDOW_HEIGHT) / 2) + 'px';
	this._host.style.left = Math.max(0, (Renderer.width - WINDOW_WIDTH) / 2) + 'px';

	/*
	 * D-938: o botão "Pôr na barra" reage a quem ESVAZIA a mão em outro canto
	 * do cliente (a barra de atalhos com `entregar()`, o ESC com
	 * `aoEscapar()`). `init()` roda uma vez só (comentário da função, acima),
	 * então esta assinatura não precisa de `desassinar()` — o mesmo raciocínio
	 * do `Network.hookPacket` no fim do arquivo, que também nunca desliga.
	 */
	assinar(atualizarBotaoAtalho);

	sincronizarDescricoes();
	renderAll();
};

/** Restaura a posição salva depois de anexado ao DOM. */
IdleSkills.onAppend = function onAppend() {
	if (_preferences.x != null && _preferences.y != null) {
		this._host.style.top = Math.min(Math.max(0, _preferences.y), Renderer.height - WINDOW_HEIGHT) + 'px';
		this._host.style.left = Math.min(Math.max(0, _preferences.x), Renderer.width - WINDOW_WIDTH) + 'px';
	}
};

IdleSkills.onRemove = function onRemove() {
	savePosition();
	clearProblemasTimeout();
};

function savePosition() {
	_preferences.x = parseInt(IdleSkills._host.style.left, 10) || 0;
	_preferences.y = parseInt(IdleSkills._host.style.top, 10) || 0;
	_preferences.save();
}

/** Mostra/esconde a janela (o botão flutuante fica visível dos dois jeitos). */
IdleSkills.toggle = function toggle() {
	const root = _root();
	const win = root.querySelector('.is-window');
	if (win.classList.contains('is-open')) {
		closeWindow();
	} else {
		win.classList.add('is-open');
		IdleSkills.focus();
		requestSkills();
	}
};

function closeWindow() {
	const root = _root();
	root.querySelector('.is-window').classList.remove('is-open');
	savePosition();
}

function onClickButton(e) {
	e.stopImmediatePropagation();
	IdleSkills.toggle();
}

function onClickClose(e) {
	/* D-942: fechar a janela tambem recolhe a folha — reabrir mostra a
	   arvore, nunca um detalhe orfao da sessao anterior. */
	fecharDetalheMovel();
	e.stopImmediatePropagation();
	closeWindow();
}

function clearProblemasTimeout() {
	if (IdleSkills._problemasTimer != null) {
		clearTimeout(IdleSkills._problemasTimer);
		IdleSkills._problemasTimer = null;
	}
}

/**
 * Pede ao servidor o estado corrente. Mandado quando a janela abre.
 * CZ_RAGIDLE_PEDIR_SKILLS — 0x0ff9, 2 bytes fixos (só o opcode).
 */
function requestSkills() {
	setStatus(IdleSkills.serverData ? 'Atualizando…' : 'Carregando…');
	Network.sendPacket(new PACKET.CZ.RAGIDLE_PEDIR_SKILLS());
}

/**
 * Manda o rascunho inteiro num pacote só — o "Aplicar" (D-799).
 *
 * O lote vai em ordem de dependência (`ordemDoLote`), porque o servidor aplica
 * na ordem que receber e não reordena: reordenar seria ele adivinhando a
 * intenção. Do outro lado ele simula o lote antes de gravar e recusa TUDO se
 * qualquer passo falhar, então uma ordem errada daqui vira recusa, e nunca
 * meia build comprada.
 */
function sendAplicar() {
	/*
	 * UM LOTE NO AR POR VEZ (H09, auditoria 2 de 22/09/2026). O lote leva
	 * `niveis` como DELTA do rascunho, e o servidor o aplica por cima do nivel
	 * ATUAL, sem chave de idempotencia; o rascunho so zera quando a resposta
	 * chega. Dois toques dentro do RTT mandavam o mesmo lote duas vezes, e com
	 * pontos livres para o dobro a habilidade subia o dobro. O botao apagado nao
	 * basta sozinho — o toque e o clique sintetizado do celular chegam os dois —,
	 * entao quem decide e a marca, e o botao so a mostra.
	 */
	if (IdleSkills._esperandoAplicar) {
		return;
	}
	const lote = ordemDoLote(indicePorId(), IdleSkills.rascunho);
	if (!lote.length) {
		return;
	}
	setStatus('Aplicando…');
	IdleSkills._esperandoAplicar = true;
	_prazoDoAplicar = setTimeout(() => {
		_prazoDoAplicar = null;
		IdleSkills._esperandoAplicar = false;
		setStatus('Sem resposta do servidor.');
		renderFooter();
	}, MS_ATE_SOLTAR_O_APLICAR);
	renderFooter();

	const pkt = new PACKET.CZ.RAGIDLE_APRENDER();
	pkt.json = JSON.stringify({ lote: lote });
	Network.sendPacket(pkt);
}

/** A resposta chegou (ou o personagem trocou): o "Aplicar" pode sair de novo. */
function soltarOAplicar() {
	IdleSkills._esperandoAplicar = false;
	if (_prazoDoAplicar !== null) {
		clearTimeout(_prazoDoAplicar);
		_prazoDoAplicar = null;
	}
}

/**
 * ESQUECER: regride um nível, ou desaprende inteiro (07/09/2026).
 *
 * O verbo vai no MESMO pacote do aprender — `CZ_RAGIDLE_APRENDER` é só o nome
 * histórico do canal da árvore, e o servidor despacha por `acao`. Um opcode
 * por botão é o caminho mais curto para a faixa RAGIDLE encher de novo.
 *
 * **Não há rascunho aqui, e a assimetria é deliberada.** Subir tem rascunho
 * porque o jogador distribui vinte pontos e aplica uma vez; descer é um gesto
 * por vez, com confirmação — e um lote de esquecimentos tornaria a conferência
 * de pré-requisito dependente da ORDEM em que eles chegam.
 *
 * @param {string} skillId
 * @param {number|'tudo'} niveis
 */
function sendEsquecer(skillId, niveis) {
	setStatus(niveis === 'tudo' ? 'Desaprendendo…' : 'Regredindo…');
	const pkt = new PACKET.CZ.RAGIDLE_APRENDER();
	pkt.json = JSON.stringify({ acao: 'esquecer', skillId: skillId, niveis: niveis });
	Network.sendPacket(pkt);
}

function setStatus(text) {
	const root = _root();
	const el = root.querySelector('.is-status');
	if (el) {
		el.textContent = text || '';
	}
}

/** Mostra `problemas` em vermelho no rodapé por PROBLEMAS_TIMEOUT_MS. */
function showProblemas(list) {
	clearProblemasTimeout();
	IdleSkills.problemas = list;
	renderFooter();
	IdleSkills._problemasTimer = setTimeout(() => {
		IdleSkills._problemasTimer = null;
		IdleSkills.problemas = [];
		renderFooter();
	}, PROBLEMAS_TIMEOUT_MS);
}

/**
 * ZC_RAGIDLE_SKILLS — 0x0ffa, variável, JSON UTF-8.
 *
 * Este opcode responde aos TRÊS pedidos. O contrato os distingue por
 * `aplicado`: presente (true) só na resposta a uma ação, ausente no anúncio
 * comum. Mas ele NÃO diz QUAL ação — por isso o rascunho só é jogado fora
 * quando `_esperandoAplicar` marca que o gesto no ar era o "Aplicar".
 */
function onSkillsReceived(pkt) {
	let data;
	try {
		data = JSON.parse(pkt.json);
	} catch (e) {
		console.error('[IdleSkills] Falha ao interpretar os dados de habilidades recebidos:', e, pkt.json);
		setStatus('Dados incompatíveis.');
		soltarOAplicar();
		return;
	}

	if (
		!data ||
		data.v !== VERSAO_DO_CONTRATO ||
		!data.classe ||
		!Array.isArray(data.skills) ||
		!Array.isArray(data.graus) ||
		typeof data.pontos !== 'number' ||
		typeof data.nivelBase !== 'number' ||
		typeof data.nivelDeJob !== 'number' ||
		!data.trava ||
		!Array.isArray(data.trava.pontosPorGrau)
	) {
		/*
		 * RECUSA ALTA, e não desenho parcial. Um servidor na v1 responde JSON
		 * válido sem `preRequisitos` — a árvore sairia sem nenhuma ligação e o
		 * rascunho aprovaria o que o "Aplicar" recusa. Ver o cabeçalho.
		 */
		console.error(
			'[IdleSkills] Contrato incompatível: esperava v=' +
				VERSAO_DO_CONTRATO +
				', veio v=' +
				(data && data.v) +
				'.',
			data
		);
		setStatus('Dados incompatíveis — servidor e cliente em versões diferentes.');
		soltarOAplicar();
		return;
	}

	// O jogo em ingles (D-1929): nome e caixa de descricao traduzidos na CHEGADA,
	// inteiros, antes de a janela partir a caixa em pedacos.
	habilidadesNoIdioma(data.skills);

	const isApplyResponse = Object.prototype.hasOwnProperty.call(data, 'aplicado');
	const problemas = Array.isArray(data.problemas) ? data.problemas : [];

	// O contrato garante que este payload É o estado corrente completo, responda
	// ele a um "pedir" ou a uma ação. Adotado por inteiro, sempre.
	IdleSkills.serverData = data;
	// D-1908: o SP de cada nivel fica lembrado para a dica da barra de atalhos.
	data.skills.forEach(s => lembrarSpPorNivel(s.skillId, spPorNivelDaMecanica(s)));
	// E o nome que esta janela mostra, para a barra dizer o mesmo (`nomeNaBarra`).
	lembrarNomesDasHabilidades(data.skills);

	/*
	 * O RASCUNHO só morre quando foi ELE que virou pacote e o pacote passou.
	 * Recusa preserva: nada mudou do outro lado, e o jogador ainda quer o plano
	 * dele para corrigir um passo.
	 */
	if (IdleSkills._esperandoAplicar && isApplyResponse && data.aplicado === true) {
		IdleSkills.rascunho = {};
	}
	soltarOAplicar();

	// Mantém a seleção se ela ainda existe; senão cai na primeira do DEGRAU
	// ABERTO — `data.skills[0]` é a primeira da árvore inteira, e ela costuma
	// ser de outra aba (ver `trazerSelecaoParaODegrau`).
	if (!IdleSkills.selectedSkillId || !data.skills.some(s => s.skillId === IdleSkills.selectedSkillId)) {
		IdleSkills.selectedSkillId = null;
	}
	if (IdleSkills.selectedSkillId === null && data.skills.length) {
		IdleSkills.selectedSkillId = data.skills[0].skillId;
	}

	setStatus('');

	if (problemas.length) {
		showProblemas(problemas);
	} else {
		clearProblemasTimeout();
		IdleSkills.problemas = [];
	}

	renderAll();
}

/** Redesenha a janela inteira a partir de serverData/rascunho/seleção. */
function renderAll() {
	renderTitle();
	// `renderRail` pode TROCAR o degrau ativo (a aba lembrada some quando o
	// personagem é de outra carreira), então a seleção só pode ser ajustada
	// depois dele — e antes da árvore e do detalhe, que a leem.
	renderRail();
	trazerSelecaoParaODegrau();
	renderArvore();
	renderDetail();
	renderFooter();
}

/** Título: "Habilidades de {classe.nomePt}". */
function renderTitle() {
	const root = _root();
	const el = root.querySelector('.is-title');
	if (!el) {
		return;
	}
	const data = IdleSkills.serverData;
	el.textContent = data && data.classe ? 'Habilidades de ' + (data.classe.nomePt || data.classe.nome) : 'Habilidades';

	/*
	 * O CONTEXTO (D-902): retrato + classe + os dois niveis na barra, e o mesmo
	 * retrato como MARCA D'AGUA da prancheta. O retrato e a arte real de
	 * /ragidle/classes/<id>.png (76 classes publicadas); se faltar, o <img>
	 * some calado e a marca fica vazia — a barra continua dizendo a classe.
	 */
	const chip = root.querySelector('.is-classe');
	const prancheta = root.querySelector('.is-arvore');
	if (!data || !data.classe) {
		if (chip) {
			chip.innerHTML = '';
		}
		if (prancheta) {
			prancheta.style.removeProperty('--is-marca');
		}
		return;
	}
	const nome = data.classe.nomePt || data.classe.nome;
	const retrato = '/ragidle/classes/' + encodeURIComponent(data.classe.id) + '.png';
	if (chip) {
		chip.innerHTML =
			'<span class="is-classe-icone"><img src="' +
			retrato +
			'" alt="" onerror="this.style.display=\'none\'" /></span>' +
			'<span class="is-classe-texto">' +
			'<span class="is-classe-nome">' +
			escapeHtml(nome) +
			'</span>' +
			'<span class="is-classe-nv">Base Nv. ' +
			escapeHtml(data.nivelBase) +
			' · Classe Nv. ' +
			escapeHtml(data.nivelDeJob) +
			'</span></span>';
	}
	if (prancheta) {
		// Inline: url() em custom property resolve contra o documento, e o
		// caminho e absoluto — o CSS da prancheta le var(--is-marca).
		prancheta.style.setProperty('--is-marca', 'url("' + retrato + '")');
	}
}

/* ------------------------------------------------------------------------ */
/* O trilho de degraus                                                       */
/* ------------------------------------------------------------------------ */

function renderRail() {
	const root = _root();
	const rail = root.querySelector('.is-grausrail');
	const trilho = degrausDoTrilho();

	if (!trilho.length) {
		rail.innerHTML = '';
		return;
	}

	/*
	 * A ABA LEMBRADA PODE NÃO EXISTIR MAIS, e o caso é comum: o jogador vivia na
	 * aba "2ª" com o Cavaleiro e entrou com um Aprendiz recém-criado. Sem este
	 * conserto o trilho abriria sem nenhuma aba acesa e a árvore vazia — o mesmo
	 * defeito que `abaLembrada` mata nas outras janelas, só que aqui a lista de
	 * abas válidas só existe depois do payload.
	 */
	if (!trilho.some(g => g.grau === IdleSkills.grauAtivo)) {
		IdleSkills.grauAtivo = trilho[trilho.length - 1].grau;
	}

	const data = IdleSkills.serverData;
	rail.innerHTML = trilho
		.map(degrau => {
			const quantas = data.skills.filter(s => s.grau === degrau.grau).length;
			const ativa = degrau.grau === IdleSkills.grauAtivo;
			return (
				'<button type="button" class="is-grau-tab' +
				(ativa ? ' is-active' : '') +
				'" data-tab="' +
				escapeHtml(degrau.grau) +
				'" title="' +
				escapeHtml(degrau.nome + ' — ' + quantas + ' habilidades') +
				'">' +
				'<span class="is-grau-rotulo">' +
				escapeHtml(degrau.rotulo) +
				'</span>' +
				'<span class="is-grau-nome">' +
				escapeHtml(degrau.nome) +
				'</span>' +
				'</button>'
			);
		})
		.join('');

	rail.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', onClickGrau));
}

function onClickGrau(e) {
	/* D-942: trocar de degrau e um gesto de ARVORE — se a folha de detalhe
	   estiver aberta no celular, ela sai da frente. */
	fecharDetalheMovel();
	e.stopImmediatePropagation();
	IdleSkills.grauAtivo = parseInt(e.currentTarget.dataset.tab, 10) || 0;
	lembrarAba(_preferences, IdleSkills.grauAtivo);
	trazerSelecaoParaODegrau();
	renderRail();
	renderArvore();
	renderDetail();
}

/**
 * O PAINEL TEM DE DESCREVER O QUE ESTÁ NA TELA.
 *
 * Visto no primeiro print da árvore: com a aba "1ª classe" aberta, o painel da
 * direita continuava descrevendo o Contra-Ataque, que é uma habilidade da 2ª e
 * não está desenhada em lugar nenhum daquela aba. Não há erro — a seleção é
 * legítima, só que invisível —, e o jogador lê uma descrição que não casa com
 * nenhum ícone à frente dele.
 *
 * Só mexe quando a seleção saiu de vista: quem clicou num nó continua com ele.
 */
function trazerSelecaoParaODegrau() {
	const doGrau = skillsDoGrau();
	if (!doGrau.length) {
		return;
	}
	if (!doGrau.some(s => s.skillId === IdleSkills.selectedSkillId)) {
		IdleSkills.selectedSkillId = doGrau[0].skillId;
	}
}

/* ------------------------------------------------------------------------ */
/* A árvore                                                                  */
/* ------------------------------------------------------------------------ */

/**
 * Os fios, em SVG, POR BAIXO dos nós.
 *
 * Cotovelo em três segmentos (sai à direita do pai, desce/sobe no meio do vão,
 * entra à esquerda do filho) em vez de reta: com reta, dois fios que saem do
 * mesmo pai para linhas diferentes viram um leque, e num degrau com quatro
 * filhos ninguém distingue qual chega onde.
 *
 * Verde = requisito cumprido (contando o rascunho); cinza tracejado = ainda não.
 */
function renderFios(plano, contexto) {
	if (!plano.fios.length) {
		return '';
	}

	/*
	 * ======================================================================
	 * OS TRIÂNGULOS PRETOS (31/08/2026, print do dono) — leia antes de
	 * "melhorar" este desenho de volta.
	 * ======================================================================
	 *
	 * A 2ª rodada de design desenhava o cotovelo com cantos em curva (`Q`) e a
	 * ponta da seta com `<marker orient="auto">`. Na máquina do dono, a árvore
	 * do Mago aparecia coberta por TRIÂNGULOS PRETOS gigantes — os fios mais
	 * longos viravam polígonos preenchidos.
	 *
	 * Nas fotos daqui o defeito NUNCA apareceu, e o motivo é a regra 8 com
	 * outra roupa: o Playwright headless desenha no SwiftShader (software), e o
	 * dono joga na GPU DE VERDADE. Traço TRACEJADO sobre segmento CURVO e
	 * marker rotacionado são justamente as duas construções de SVG com
	 * histórico de tesselar errado em driver de GPU — o dash de curva vira
	 * triângulo degenerado preenchido com a cor padrão, que é PRETO.
	 *
	 * O conserto é não depender delas:
	 * - o cotovelo voltou a ser RETO (`M H V H`); o arredondado que o design
	 *   pedia vem de `stroke-linejoin: round`, que dobra a junta sem criar
	 *   segmento curvo;
	 * - a ponta é um `<path>` triângulo desenhado AQUI, no lugar exato — todo
	 *   fio termina entrando na horizontal, então nem rotação precisa;
	 * - o traço para 5px antes do nó, para a ponta cobrir o fim da linha.
	 */
	const RECUO_DA_PONTA = 5;

	function caminhoDoFio(fio) {
		const fim = fio.x2 - RECUO_DA_PONTA;
		if (fio.y1 === fio.y2) {
			return 'M ' + fio.x1 + ' ' + fio.y1 + ' H ' + fim;
		}
		return 'M ' + fio.x1 + ' ' + fio.y1 + ' H ' + fio.xm + ' V ' + fio.y2 + ' H ' + fim;
	}

	/** A ponta: triângulo apontando para a direita, encostado no nó. */
	function pontaDoFio(fio, cumprido) {
		const x = fio.x2;
		const y = fio.y2;
		return (
			'<path d="M ' +
			(x - 7) +
			' ' +
			(y - 4.5) +
			' L ' +
			x +
			' ' +
			y +
			' L ' +
			(x - 7) +
			' ' +
			(y + 4.5) +
			' Z" class="is-ponta ' +
			(cumprido ? 'is-ponta--ok' : 'is-ponta--travado') +
			'" />'
		);
	}

	/**
	 * A PLAQUETA DO FIO (D-902): "Nv. N", o nivel exigido, no meio do caminho.
	 * Num fio com cotovelo ela senta no trecho VERTICAL (o vao entre colunas e
	 * dela); num fio reto, no meio do trecho. Era a unica informacao da arvore
	 * que so existia no painel de detalhe.
	 */
	function seloDoFio(fio, cumprido) {
		const reto = fio.y1 === fio.y2;
		const lx = reto ? (fio.x1 + fio.x2 - RECUO_DA_PONTA) / 2 : fio.xm;
		const ly = reto ? fio.y1 : (fio.y1 + fio.y2) / 2;
		const sufixo = cumprido ? ' is-fio-selo--ok' : '';
		return (
			'<rect class="is-fio-selo' +
			sufixo +
			'" x="' +
			(lx - 14) +
			'" y="' +
			(ly - 7) +
			'" width="28" height="14" rx="7" />' +
			'<text class="is-fio-selo-texto' +
			(cumprido ? ' is-fio-selo-texto--ok' : '') +
			'" x="' +
			lx +
			'" y="' +
			ly +
			'">Nv. ' +
			fio.nivel +
			'</text>'
		);
	}

	const caminhos = plano.fios
		.map(fio => {
			const cumprido =
				(contexto.porId.has(fio.de) ? nivelEfetivo(contexto.porId.get(fio.de), contexto.rascunho) : 0) >=
				fio.nivel;
			const d = caminhoDoFio(fio);
			/*
			 * DUAS passadas por fio: um HALO claro por baixo e o traço por cima.
			 * O fundo da árvore é grade pontilhada, e um traço de 2px
			 * atravessando os pontos serrilha visualmente — o halo é o papel em
			 * volta do fio, o mesmo truque de todo mapa de metrô.
			 */
			return (
				'<path d="' +
				d +
				'" class="is-fio-halo" />' +
				'<path d="' +
				d +
				'" class="is-fio' +
				(cumprido ? ' is-fio--ok' : ' is-fio--travado') +
				'" />' +
				pontaDoFio(fio, cumprido) +
				seloDoFio(fio, cumprido)
			);
		})
		.join('');

	return (
		'<svg class="is-fios" width="' +
		plano.largura +
		'" height="' +
		plano.altura +
		'" viewBox="0 0 ' +
		plano.largura +
		' ' +
		plano.altura +
		'">' +
		caminhos +
		'</svg>'
	);
}

/**
 * Um nó: ícone (com o ladrilho `.ri-tile` do design system), nome, e a linha de
 * controle `◀ n/m ▶` da referência LATAM.
 *
 * O nível aparece como `5+2/10` quando há rascunho, com o `+2` em dourado — o
 * jogador precisa distinguir num relance o que já é dele do que ele ainda vai
 * pagar, e um `7/10` chapado esconderia isso.
 */
function renderNo(no, contexto) {
	const skill = no.skill;
	const selecionada = skill.skillId === IdleSkills.selectedSkillId;
	const extra = contexto.rascunho[skill.skillId] || 0;
	const efetivo = skill.aprendido + extra;
	const subir = avaliarSubir(skill, contexto);

	// Três estados visuais, e eles não são o mesmo: TRANCADA (falta requisito),
	// DISPONÍVEL (dá para subir agora) e DOMINADA (no teto).
	const noTeto = efetivo >= skill.nivelMaximo;
	const trancada = efetivo === 0 && !subir.ok;

	let classes = 'is-no';
	if (selecionada) {
		classes += ' is-no--selecionada';
	}
	if (trancada) {
		classes += ' is-no--trancada';
	}
	if (noTeto) {
		classes += ' is-no--dominada';
	} else if (subir.ok) {
		classes += ' is-no--pronta';
	}
	if (extra > 0) {
		classes += ' is-no--rascunho';
	}

	const selo = [];
	if (no.forasteiros.length) {
		const texto = no.forasteiros.map(f => f.nome + ' Nv. ' + f.nivel).join(', ');
		selo.push(
			'<span class="is-no-selo is-no-selo--fora" title="Exige de outro degrau: ' +
				escapeHtml(texto) +
				'">↖</span>'
		);
	}

	return (
		'<div class="' +
		classes +
		'" style="left:' +
		no.x +
		'px; top:' +
		no.y +
		'px; width:' +
		NO_L +
		'px">' +
		'<button type="button" class="is-no-icone ri-tile" data-skill-sel="' +
		escapeHtml(skill.skillId) +
		'" draggable="' +
		(skill.aprendido > 0 ? 'true' : 'false') +
		'" title="' +
		/*
		 * A RECUSA TEM DE DIZER O MOTIVO.
		 *
		 * Só habilidade aprendida vira atalho, e o `draggable="false"` acima
		 * faz o navegador engolir o arraste SEM UM PIO. Medido na árvore do
		 * Bardo do dono: 10 dos 18 nós daquela aba estão em 0/x, ou seja, mais
		 * da metade da tela recusa em silêncio — e "peguei e não aconteceu
		 * nada" é indistinguível de "a barra quebrou". A dica é o único canal
		 * que este nó já tem; ela passa a dizer as duas metades da regra.
		 */
		escapeHtml(
			skill.nome +
				(skill.aprendido > 0
					? ' ' + traduzir('— arraste para a barra de atalhos')
					: ' ' + traduzir('— aprenda a habilidade para poder pô-la na barra de atalhos'))
		) +
		'">' +
		'<img src="/ragidle/skills/' +
		encodeURIComponent(skill.skillId) +
		'.png" alt="" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';" />' +
		'<span class="is-no-fallback">' +
		escapeHtml(skillInitials(skill.skillId)) +
		'</span>' +
		barraDoNo(skill, extra) +
		selo.join('') +
		'</button>' +
		'<span class="is-no-nome" title="' +
		escapeHtml(skill.nome) +
		'">' +
		escapeHtml(skill.nome) +
		'</span>' +
		/*
		 * RAGIDLE (D-1154, lapidada por D-1189) — habilidade de QUEST nao custa
		 * ponto, mas so Primeiros Socorros entra SOZINHA: as outras sao
		 * ENTREGUES pelas missoes da campanha ("unica skill que ira ficar de
		 * graca e a primeiro socorros, as outras irao ficar tudo nas missoes" —
		 * o dono, 07/09/2026). A lista de graca mora no servidor
		 * (HABILIDADES_DE_QUEST_DE_GRACA, servidor/habilidades-de-quest.ts);
		 * este espelho dela existe so para a etiqueta nao PROMETER de graca o
		 * que na verdade pede missao.
		 */
		(skill.deQuest
			/*
			 * `skillId`, e nao `name` (07/09/2026, no merge).
			 *
			 * D-1189 leu o campo `name` da skill, que NAO existe no payload
			 * do 0x0ffa — o servidor manda `skillId` (o identificador
			 * `NV_FIRSTAID`) e `nome` (o nome legivel, em portugues). Todo o
			 * resto deste arquivo ja usa `skill.skillId`.
			 *
			 * O efeito era silencioso e total: `undefined === 'NV_FIRSTAID'` e
			 * sempre falso, entao o Primeiros Socorros caia no ramo do `else` e
			 * a etiqueta dele dizia "é aprendida numa missão" — exatamente o
			 * contrario do que D-1189 quis dizer, e a unica peca que a decisao
			 * existia para distinguir.
			 *
			 * Quem pegou foi o portao `contrato-de-skills.test.ts`, que cruza os
			 * campos LIDOS pelo fork com os DECLARADOS pelo servidor.
			 */
			? (skill.skillId === 'NV_FIRSTAID'
				? '<span class="is-no-quest" title="Habilidade de quest: entra sozinha quando os requisitos são cumpridos, sem gastar ponto">quest · grátis</span>'
				: etiquetaDaMissao(skill))
			: '') +
		plaqueta(skill, contexto) +
		'</div>'
	);
}

/**
 * A ETIQUETA `quest · missão` — E ELA VIROU UM CAMINHO (09/09/2026).
 *
 * Pedido do dono: *"quero que tenha algum tooltip ou alguma coisa que o player
 * clique e descubra/vá até a missão para desbloquear essa respectiva
 * habilidade"*.
 *
 * Até aqui a etiqueta dizia que EXISTE uma missão e não dizia qual. O jogador
 * ficava com uma habilidade visível, um aviso de que há um caminho, e nenhuma
 * forma de achar o caminho — e as três órfãs do mesmo dia (`AL_HOLYLIGHT`,
 * `AC_CHARGEARROW`, `HT_PHANTASMIC`) eram o caso extremo disso: nem missão
 * havia.
 *
 * O `<span>` continua quando `missaoQueEnsina` é nulo, e esse ramo NÃO é
 * defensivo à toa: é o que um cliente novo vê contra um servidor velho, antes
 * de a versão do contrato (4) derrubar a janela. Prometer um clique que não
 * abre nada seria pior do que não ter o clique — o jogador concluiria que a
 * missão sumiu.
 */
function etiquetaDaMissao(skill) {
	const m = skill.missaoQueEnsina;
	/*
	 * JÁ APRENDIDA volta ao texto simples, e isso é o pedido lido ao pé da
	 * letra: *"para desbloquear essa respectiva habilidade"*. Quem já a tem não
	 * tem nada a desbloquear, e o link viraria um convite para reabrir uma
	 * missão concluída — ruído no lugar exato onde a etiqueta existe para
	 * informar.
	 */
	if (!m || !m.id || skill.aprendido >= 1) {
		return '<span class="is-no-quest" title="Habilidade de quest: é aprendida numa missão, sem gastar ponto">quest · missão</span>';
	}
	return (
		'<button type="button" class="is-no-quest is-no-quest--link"' +
		' data-missao-de="' + escapeHtml(m.id) + '"' +
		' data-missao-aba="' + escapeHtml(m.tipo || 'opcional') + '"' +
		' title="Aprendida na missão &quot;' + escapeHtml(m.titulo) + '&quot;. Toque para abri-la.">' +
		'quest · ' + escapeHtml(m.titulo) + ' ›' +
		'</button>'
	);
}

/**
 * O clique da etiqueta: abre a janela de Missões JÁ NA MISSÃO.
 *
 * `stopPropagation` porque a etiqueta mora DENTRO do nó da árvore, e o nó tem
 * o próprio clique (`onClickNo`, que abre o detalhe da habilidade). Sem isto o
 * toque faria as duas coisas, e a janela de Missões nasceria atrás do detalhe.
 */
function onClickMissaoDaQuest(e) {
	e.preventDefault();
	e.stopPropagation();
	MissoesIdle.abrirEmMissao(e.currentTarget.dataset.missaoDe, e.currentTarget.dataset.missaoAba);
}

/**
 * A BARRA DE PROGRESSO dentro do ladrilho (D-902): um segmento por nivel ate
 * 10 (ouro = aprendido, tracejado = rascunho); acima disso, barra continua
 * por percentual — 10 segmentos cabem nos 50px do ladrilho, 20 nao.
 */
function barraDoNo(skill, extra) {
	const max = skill.nivelMaximo || 0;
	if (!max) {
		return '';
	}
	if (max <= 10) {
		let segs = '';
		for (let i = 1; i <= max; i++) {
			const classe =
				i <= skill.aprendido ? ' is-no-seg--feito' : i <= skill.aprendido + extra ? ' is-no-seg--rascunho' : '';
			segs += '<span class="is-no-seg' + classe + '"></span>';
		}
		return '<span class="is-no-barra">' + segs + '</span>';
	}
	const feito = Math.round((skill.aprendido / max) * 100);
	const rascunho = Math.round((extra / max) * 100);
	return (
		'<span class="is-no-barra">' +
		'<span class="is-no-seg is-no-seg--feito" style="flex:0 0 ' +
		feito +
		'%"></span>' +
		'<span class="is-no-seg is-no-seg--rascunho" style="flex:0 0 ' +
		rascunho +
		'%"></span>' +
		'<span class="is-no-seg"></span>' +
		'</span>'
	);
}

/**
 * A PLAQUETA — o `◀ n/m ▶` da referência LATAM, como uma cápsula segmentada.
 *
 * É o elemento-assinatura da print, e a primeira rodada o desenhou como três
 * pedaços soltos (dois botões e um texto flutuando). Aqui ele vira UM controle:
 * cápsula branca com divisórias hairline, seta esquerda tira do rascunho, seta
 * direita soma — e a seta que PODE ser usada carrega a tinta azul de "ativa"
 * (--badge-ativa-*), que é como a referência acende as dela.
 *
 * Ela é compartilhada pelo NÓ e pelo cabeçalho do DETALHE (mesmos data-*, o
 * mesmo juiz): quem prefere mexer olhando a mecânica por nível não precisa
 * voltar para a árvore.
 */
function plaqueta(skill, contexto, modificador) {
	const extra = contexto.rascunho[skill.skillId] || 0;
	const subir = avaliarSubir(skill, contexto);
	const descer = avaliarDescer(skill, contexto);
	const efetivo = skill.aprendido + extra;

	const nivelHtml = extra
		? escapeHtml(skill.aprendido) + '<em>+' + escapeHtml(extra) + '</em>/' + escapeHtml(skill.nivelMaximo)
		: escapeHtml(efetivo) + '/' + escapeHtml(skill.nivelMaximo);

	/*
	 * RAGIDLE (D-1155) — a habilidade de QUEST nao tem setas: o servidor a
	 * concede sozinho no maximo quando a arvore permite (D-1154), e uma seta
	 * "+" que nunca faz nada e o defeito que o jogador reporta como "nao
	 * consigo aprender". A plaqueta vira so o nivel, com a etiqueta ao lado.
	 */
	if (skill.deQuest) {
		return (
			'<span class="is-plaqueta is-plaqueta--quest' +
			(modificador ? ' ' + modificador : '') +
			'" title="Habilidade de quest: entra sozinha, sem gastar ponto">' +
			'<span class="is-no-nivel">' +
			nivelHtml +
			'</span>' +
			'</span>'
		);
	}

	return (
		'<span class="is-plaqueta' +
		(modificador ? ' ' + modificador : '') +
		(extra > 0 ? ' is-plaqueta--rascunho' : '') +
		'">' +
		'<button type="button" class="is-seta is-seta--menos" data-skill-menos="' +
		escapeHtml(skill.skillId) +
		'"' +
		(descer.ok ? '' : ' disabled') +
		' title="' +
		escapeHtml(descer.ok ? 'Tirar um ponto do rascunho' : descer.motivo) +
		'">' +
		RiIcones.chevronEsq +
		'</button>' +
		'<span class="is-no-nivel">' +
		nivelHtml +
		'</span>' +
		/*
		 * A SETA BLOQUEADA CONTINUA CLICÁVEL (D-1225, 08/09/2026).
		 *
		 * Ela era `disabled` com o motivo só no `title=`, e `title` não existe
		 * no toque: no celular — que é como o alfa joga — o jogador tocava numa
		 * seta que não fazia nada e não dizia nada. Foi assim que "Contra-Ataque
		 * não permite aumentar o nível" chegou como relato em vez de como
		 * pergunta respondida na própria janela.
		 *
		 * `aria-disabled` + a classe apagam a seta do mesmo jeito para quem vê e
		 * para o leitor de tela; o clique cai em `onClickMais`, que já sabia
		 * mostrar o motivo em `showProblemas` e nunca era alcançado. O `title`
		 * fica para o mouse.
		 */
		'<button type="button" class="is-seta is-seta--mais' +
		(subir.ok ? '' : ' is-seta--travada') +
		'" data-skill-mais="' +
		escapeHtml(skill.skillId) +
		'"' +
		(subir.ok ? '' : ' aria-disabled="true"') +
		' title="' +
		escapeHtml(subir.ok ? 'Somar um ponto' : subir.motivo) +
		'">' +
		RiIcones.chevronDir +
		'</button>' +
		'</span>'
	);
}

function renderArvore() {
	const root = _root();
	const tela = root.querySelector('.is-tela');
	const data = IdleSkills.serverData;

	if (!data || !data.skills.length) {
		tela.style.width = '';
		tela.style.height = '';
		tela.innerHTML = '<div class="is-empty">Nenhuma habilidade nesta classe.</div>';
		return;
	}

	const doGrau = skillsDoGrau();
	if (!doGrau.length) {
		tela.style.width = '';
		tela.style.height = '';
		tela.innerHTML = '<div class="is-empty">Nenhuma habilidade neste degrau.</div>';
		return;
	}

	const contexto = contextoDoRascunho();
	const plano = montarPlano(doGrau, contexto.porId);

	tela.style.width = plano.largura + 'px';
	tela.style.height = plano.altura + 'px';
	tela.innerHTML = renderFios(plano, contexto) + plano.nos.map(no => renderNo(no, contexto)).join('');

	tela.querySelectorAll('[data-skill-sel]').forEach(b => {
		b.addEventListener('click', onClickNo);
		b.addEventListener('dragstart', onSkillDragStart);
		b.addEventListener('dragend', onSkillDragEnd);
	});
	tela.querySelectorAll('[data-skill-mais]').forEach(b => b.addEventListener('click', onClickMais));
	tela.querySelectorAll('[data-skill-menos]').forEach(b => b.addEventListener('click', onClickMenos));
	// 09/09/2026: a etiqueta de quest leva a missao. Religada AQUI com as outras
	// porque `tela.innerHTML` acabou de trocar os nos — um listener preso ao no
	// antigo morre junto com ele, calado.
	tela.querySelectorAll('[data-missao-de]').forEach(b => b.addEventListener('click', onClickMissaoDaQuest));
}

/**
 * A MESMA condição que decide se dá para arrastar decide se dá para "pegar"
 * pelo toque (D-938): aprendida (`aprendido >= 1`) e com id numérico batido em
 * `SkillInfo` — sem os dois o servidor não teria o que pôr numa barra.
 *
 * @returns {number|null} o id numérico, ou `null` se a habilidade não serve.
 */
function idNumericoParaAtalho(skill) {
	if (!skill || skill.aprendido < 1) {
		return null;
	}
	const numericId = NUMERIC_SKILL_ID_BY_NAME.get(skill.skillId);
	return Number.isInteger(numericId) ? numericId : null;
}

/**
 * O payload de "pegar" — o MESMO formato que `onSkillDragStart` escreve em
 * `window._OBJ_DRAG_`. Usado pelo arrasto (mouse) e pelo botão "Pôr na barra"
 * (toque, `onClickPorNaBarra`), para as duas portas nunca divergirem (ver
 * `UI/toqueParaAtalho.js`, "um segundo formato aqui envelheceria em paralelo").
 */
function payloadDaHabilidade(skill, numericId) {
	return {
		type: 'skill',
		from: 'IdleSkills',
		data: {
			SKID: numericId,
			level: skill.aprendido,
			// D-1908: o nivel de USO escolhido no detalhe ("Nivel de uso"), ou o
			// aprendido sem escolha. `aplicarNoSlot` (ShortCut.js) le
			// `selectedLevel` antes de `level`.
			selectedLevel: nivelParaABarra(IdleSkills.nivelParaBarra, skill)
		}
	};
}

/** Está esta habilidade (pelo id numérico) na mão agora? */
function naMaoEstaHabilidade(numericId) {
	const p = pendente();
	return !!(p && p.type === 'skill' && p.data && p.data.SKID === numericId);
}

function onSkillDragStart(e) {
	const skillId = e.currentTarget.dataset.skillSel;
	const skill = IdleSkills.serverData && IdleSkills.serverData.skills.find(item => item.skillId === skillId);
	const numericId = idNumericoParaAtalho(skill);

	if (numericId === null) {
		e.preventDefault();
		return;
	}

	const payload = payloadDaHabilidade(skill, numericId);
	const serialized = JSON.stringify(payload);

	window._OBJ_DRAG_ = payload;
	e.dataTransfer.effectAllowed = 'copy';
	e.dataTransfer.setData('Text', serialized);

	const dragImage = e.currentTarget.querySelector('img');
	if (dragImage && dragImage.complete && dragImage.naturalWidth) {
		e.dataTransfer.setDragImage(dragImage, 24, 24);
	}

	e.currentTarget.classList.add('is-dragging');
}

function onSkillDragEnd(e) {
	delete window._OBJ_DRAG_;
	e.currentTarget.classList.remove('is-dragging');
}

function onClickNo(e) {
	e.stopImmediatePropagation();
	IdleSkills.selectedSkillId = e.currentTarget.dataset.skillSel;
	renderArvore();
	renderDetail();
	/* D-942: no celular em pe o painel lateral nao cabe (292px numa tela de
	   ~390) — tocar no NO abre o detalhe como FOLHA por cima da arvore. So o
	   toque no no: a seta de rascunho (onClickMais) tambem seleciona, e
	   abrir uma folha a cada ponto distribuido seria a janela atrapalhando o
	   proprio gesto. */
	abrirDetalheMovel();
}

/** D-942 — a folha de detalhe do celular em pe. */
function abrirDetalheMovel() {
	if (!ehCelularEmPe()) {
		return;
	}
	const janela = _root().querySelector('.is-window');
	if (janela) {
		janela.classList.add('is-detalhe-movel-aberto');
	}
}

function fecharDetalheMovel() {
	const janela = _root().querySelector('.is-window');
	if (janela) {
		janela.classList.remove('is-detalhe-movel-aberto');
	}
}

/**
 * A seta ▶ — o gesto do rascunho.
 *
 * Ela também SELECIONA a habilidade, e isso não é conveniência: o painel de
 * detalhe é onde o jogador confere o que o ponto comprou (a mecânica do nível
 * novo), e ter de clicar duas vezes no mesmo nó para ver isso seria a janela
 * escondendo a consequência do próprio clique.
 */
function onClickMais(e) {
	e.stopImmediatePropagation();
	const skillId = e.currentTarget.dataset.skillMais;
	const contexto = contextoDoRascunho();
	const skill = contexto.porId.get(skillId);
	if (!skill) {
		return;
	}
	const veredito = avaliarSubir(skill, contexto);
	if (!veredito.ok) {
		showProblemas([skill.nome + ': ' + veredito.motivo]);
		return;
	}
	IdleSkills.rascunho[skillId] = (IdleSkills.rascunho[skillId] || 0) + 1;
	IdleSkills.selectedSkillId = skillId;
	renderArvore();
	renderDetail();
	renderFooter();
}

function onClickMenos(e) {
	e.stopImmediatePropagation();
	const skillId = e.currentTarget.dataset.skillMenos;
	const contexto = contextoDoRascunho();
	const skill = contexto.porId.get(skillId);
	if (!skill) {
		return;
	}
	const veredito = avaliarDescer(skill, contexto);
	if (!veredito.ok) {
		showProblemas([skill.nome + ': ' + veredito.motivo]);
		return;
	}
	const restante = (IdleSkills.rascunho[skillId] || 0) - 1;
	if (restante > 0) {
		IdleSkills.rascunho[skillId] = restante;
	} else {
		delete IdleSkills.rascunho[skillId];
	}
	IdleSkills.selectedSkillId = skillId;
	renderArvore();
	renderDetail();
	renderFooter();
}

function onClickAplicar(e) {
	e.stopImmediatePropagation();
	sendAplicar();
}

function onClickResetar(e) {
	e.stopImmediatePropagation();
	/*
	 * "Resetar" joga fora o RASCUNHO — não desaprende nada. O Ragnarok não
	 * devolve ponto de habilidade, e um botão que parecesse fazer isso seria a
	 * janela prometendo o que o servidor recusa. O `title` do botão diz isso.
	 */
	IdleSkills.rascunho = {};
	renderArvore();
	renderDetail();
	renderFooter();
}

function onToggleDescricoes(e) {
	IdleSkills.mostrarDescricoes = !!e.currentTarget.checked;
	_preferences.descricoes = IdleSkills.mostrarDescricoes;
	_preferences.save();
	sincronizarDescricoes();
}

/** Recolhe/mostra o painel de detalhe (o interruptor "Descrições"). */
function sincronizarDescricoes() {
	const root = _root();
	const janela = root.querySelector('.is-content');
	if (janela) {
		janela.classList.toggle('is-sem-detalhe', !IdleSkills.mostrarDescricoes);
	}
}

/* ------------------------------------------------------------------------ */
/* O painel de detalhe                                                       */
/* ------------------------------------------------------------------------ */

/**
 * Monta a linha "SP x · alcance y · conjuração z s · recarga w s · dano +k%"
 * de um nível, omitindo o que for zero/ausente.
 */
function buildMecanicaLine(m) {
	const parts = [];
	if (m.sp) {
		parts.push('SP ' + m.sp);
	}
	if (m.alcance) {
		parts.push('alcance ' + m.alcance);
	}
	if (m.conjuracaoMs) {
		parts.push('conjuração ' + m.conjuracaoMs / 1000 + 's');
	}
	if (m.recargaMs) {
		parts.push('recarga ' + m.recargaMs / 1000 + 's');
	}
	if (m.razaoAdicional) {
		parts.push('dano +' + m.razaoAdicional + '%');
	}
	return parts.join(' · ');
}

/**
 * As linhas de "Mecânica por nível": uma por nível, de 1 a `nivelMaximo`. O
 * texto sai das linhas "[Nv X]: …" da descrição do cliente quando existem;
 * senão, da linha numérica montada de `mecanica`; senão, travessão.
 *
 * `null` quando descrição E mecânica estão vazias — aí o chamador escreve "Sem
 * dados nesta build" em vez de `nivelMaximo` linhas de travessão.
 */
function buildMecanicaRows(skill) {
	const descricao = skill.descricao || [];
	const mecanica = skill.mecanica || [];

	if (!descricao.length && !mecanica.length) {
		return null;
	}

	const textByLevel = {};
	descricao.forEach(line => {
		// "[Nv 3]:" em portugues, "[Lv 3]:" na caixa inglesa (D-1929).
		const achado = /^\[(?:Nv|Lv)\s*(\d+)\]:\s*(.*)$/i.exec(String(line || '').trim());
		if (achado) {
			const lvl = Number(achado[1]);
			textByLevel[lvl] = textByLevel[lvl] ? textByLevel[lvl] + ' ' + achado[2] : achado[2];
		}
	});

	const mecByLevel = {};
	mecanica.forEach(m => {
		if (m && typeof m.nivel === 'number') {
			mecByLevel[m.nivel] = m;
		}
	});

	const rows = [];
	const max = skill.nivelMaximo || 0;
	for (let lvl = 1; lvl <= max; lvl++) {
		let texto = textByLevel[lvl];
		if (!texto) {
			const m = mecByLevel[lvl];
			texto = m ? buildMecanicaLine(m) : '';
		}
		rows.push({ nivel: lvl, texto: texto || '—' });
	}
	return rows;
}

/**
 * O selo de efeito de combate — TRÊS estados, e não dois (D-407).
 *
 * São dois eixos independentes, e ambos precisam ser ditos:
 * - `portada: false` → o motor não sabe executar. Nada acontece.
 * - `semEfeitoDeCombate: true` → o motor executa, mas o efeito é fora de
 *   combate (Teleporte, capacidade de carga, pré-requisito de árvore).
 *
 * Sem nenhum dos dois, o silêncio é o selo: a habilidade funciona.
 */
function seloDeEfeito(skill) {
	/*
	 * O SELO DE "NÃO DÁ PARA APRENDER" vem ANTES (D-1225, 08/09/2026).
	 *
	 * O relato do alfa foi *"Contra-Ataque não permite aumentar o nível"* com o
	 * selo "sem efeito em combate ainda" na tela — e o selo estava certo sem
	 * responder a pergunta. `portada: false` diz que o motor não executa;
	 * `aceitaPeloMotor: false` é a TRANCA, e é ela que apaga a seta.
	 *
	 * Os dois eixos quase sempre coincidem, mas quem lê a janela precisa da
	 * consequência, e não da causa: "sem efeito" convida a comprar assim mesmo,
	 * e a seta então não obedece. O selo novo diz o que acontece.
	 */
	if (!skill.aceitaPeloMotor) {
		return '<span class="is-badge ri-badge ri-badge--cinza" title="A tranca do motor: enquanto o motor de combate não executar esta habilidade, o ponto não pode ser gasto nela — ele sairia da sua conta sem mudar nada na luta.">não dá para aprender ainda</span>';
	}
	if (!skill.portada) {
		return '<span class="is-badge ri-badge ri-badge--cinza" title="O motor de combate ainda não executa esta habilidade — aprendê-la não muda nada na luta.">sem efeito em combate ainda</span>';
	}
	if (skill.semEfeitoDeCombate) {
		return '<span class="is-badge ri-badge ri-badge--cinza" title="O motor executa esta habilidade, mas o efeito dela é fora do combate (deslocamento, capacidade de carga, pré-requisito da árvore).">efeito fora de combate</span>';
	}
	return '';
}

/**
 * A lista de requisitos com veredito por linha (✓/✗).
 *
 * Ela é o que a lista antiga não tinha: `podeAprender: false` dizia QUE não
 * podia, e a árvore mostra DE ONDE vem — mas só para o requisito que é
 * habilidade. Nível base e nível de classe não têm nó no desenho, e sem esta
 * lista continuariam invisíveis.
 */
function renderRequisitos(skill, contexto) {
	const linhas = [];

	// A MISSAO QUE ENSINA (10/09/2026) — ver `requisitoDeMissao.js`. A caixa
	// dizia "Sem pre-requisito" para a Luz Divina, que so se aprende pela missao.
	const daMissao = linhaDaMissaoNoRequisito(skill, nivelEfetivo(skill, contexto.rascunho));
	if (daMissao) {
		linhas.push(daMissao);
	}

	if (skill.nivelBaseMinimo > 0) {
		linhas.push({
			ok: contexto.nivelBase >= skill.nivelBaseMinimo,
			texto: 'Nível base ' + skill.nivelBaseMinimo
		});
	}
	if (skill.nivelClasseMinimo > 0) {
		linhas.push({
			ok: contexto.nivelDeJob >= skill.nivelClasseMinimo,
			texto: 'Nível de classe ' + skill.nivelClasseMinimo
		});
	}
	skill.preRequisitos.forEach(requisito => {
		const alvo = contexto.porId.get(requisito.skillId);
		const tem = alvo ? nivelEfetivo(alvo, contexto.rascunho) : 0;
		/*
		 * O REQUISITO DISPENSADO (D-1225) — e ele precisa DIZER que foi
		 * dispensado, em vez de só sair da lista.
		 *
		 * Some-lo daria uma lista que discorda do `skill_tree.yml` sem
		 * explicação; deixá-lo com "X" era o defeito do alfa. A terceira via é
		 * a honesta: linha cumprida, com o motivo ao lado.
		 */
		if (requisito.perdoado) {
			linhas.push({
				ok: true,
				texto:
					(alvo ? alvo.nome : requisito.skillId) +
					' Nv. ' +
					requisito.nivel +
					' - dispensado (o motor ainda não executa esta habilidade)'
			});
			return;
		}
		linhas.push({
			ok: tem >= requisito.nivel,
			texto: (alvo ? alvo.nome : requisito.skillId) + ' Nv. ' + requisito.nivel + ' (você: ' + tem + ')'
		});
	});

	if (!linhas.length) {
		return '<div class="is-req-livre">Sem pré-requisito — dá para começar por ela.</div>';
	}

	return linhas
		.map(
			linha =>
				'<div class="is-req' +
				(linha.ok ? ' is-req--ok' : '') +
				'"><span class="is-req-marca">' +
				(linha.ok ? RiIcones.confere : RiIcones.fechar) +
				'</span>' +
				escapeHtml(linha.texto) +
				'</div>'
		)
		.join('');
}

function renderDetail() {
	const root = _root();
	const scrollEl = root.querySelector('.is-detail-scroll');
	const footerEl = root.querySelector('.is-detail-footer');
	const data = IdleSkills.serverData;

	if (!data) {
		scrollEl.innerHTML = '<div class="is-empty">Abra a janela de habilidades para carregar.</div>';
		footerEl.innerHTML = '';
		return;
	}

	const skill = data.skills.find(s => s.skillId === IdleSkills.selectedSkillId);
	if (!skill) {
		scrollEl.innerHTML = '<div class="is-empty">Selecione uma habilidade.</div>';
		footerEl.innerHTML = '';
		return;
	}

	const contexto = contextoDoRascunho();
	const extra = contexto.rascunho[skill.skillId] || 0;
	const efetivo = skill.aprendido + extra;
	const noTeto = efetivo >= skill.nivelMaximo;
	const categoriaLabel = skill.categoria === 'passiva' ? 'Passiva' : 'Ativa';
	const resumo = buildResumo(skill);
	const mecanicaRows = buildMecanicaRows(skill);
	/*
	 * D-1908: o NIVEL DE USO que vai para a barra. O bloco so existe quando a
	 * habilidade serve para a barra (a mesma condicao do arrasto e do "Por na
	 * barra") e tem mais de um nivel; com ele, a linha da mecanica daquele
	 * nivel ganha a marca `--uso`, para o jogador ler o que o nivel escolhido
	 * faz sem contar linhas.
	 */
	const serveParaABarra = idNumericoParaAtalho(skill) !== null;
	const nivelUsoHtml = htmlDoNivelParaABarra(skill, IdleSkills.nivelParaBarra, serveParaABarra);
	const nivelDeUso = nivelUsoHtml ? nivelParaABarra(IdleSkills.nivelParaBarra, skill) : null;
	/*
	 * Duas linhas acesas, e as duas dizem algo (D-902): a do nivel ATUAL
	 * (contando o rascunho) em ouro — "voce esta aqui" — e a PROXIMA
	 * contornada em acento — e o que o proximo ponto compra, e e por isso
	 * que o jogador abriu este painel.
	 */
	const mecanicaHtml = mecanicaRows
		? mecanicaRows
				.map(
					linha =>
						'<div class="is-mecanica-row' +
						(linha.nivel === efetivo ? ' is-mecanica-row--atual' : '') +
						(!noTeto && linha.nivel === efetivo + 1 ? ' is-mecanica-row--proxima' : '') +
						(nivelDeUso !== null && linha.nivel === nivelDeUso ? ' is-mecanica-row--uso' : '') +
						'">' +
						'<span class="is-mecanica-nivel">Nv. ' +
						linha.nivel +
						'</span>' +
						'<span class="is-mecanica-texto">' +
						escapeHtml(linha.texto) +
						'</span></div>'
				)
				.join('')
		: '<div class="is-mecanica-empty">Sem dados nesta build.</div>';

	let pipsHtml = '';
	for (let i = 1; i <= skill.nivelMaximo; i++) {
		const classe = i <= skill.aprendido ? ' is-pip-filled' : i <= efetivo ? ' is-pip-rascunho' : '';
		pipsHtml += '<span class="is-pip' + classe + '"></span>';
	}

	/*
	 * A ROTAÇÃO DE ATAQUE SAIU (07/10/2026, Novo Bot V5): o combate e o do Modo
	 * Classico, sem rotacao automatica, e o servidor recusa o
	 * `CZ_RAGIDLE_PRIORIZAR`. Nem selo nem botao de por/tirar.
	 */

	/*
	 * O botão de TOQUE (D-938). Só existe se a habilidade serve para a barra
	 * (mesma condição do arrasto), e SEMPRE vai para o HTML — quem decide se
	 * ele aparece na TELA é o CSS (`@media (pointer: coarse)` em
	 * `IdleSkills.css`), nunca um `matchMedia` lido aqui: a janela pode trocar
	 * de aparelho (DevTools, tablet com teclado) sem recarregar a página, e um
	 * JS que decide uma vez erraria nesse caso.
	 */
	const numericIdParaAtalho = idNumericoParaAtalho(skill);
	const naMao = numericIdParaAtalho !== null && naMaoEstaHabilidade(numericIdParaAtalho);
	const atalhoHtml =
		numericIdParaAtalho !== null
			? '<button type="button" class="is-btn-atalho ri-btn ri-btn--sec' +
				(naMao ? ' is-btn-atalho--armado' : '') +
				'" data-skill-atalho="' +
				escapeHtml(skill.skillId) +
				'" title="' +
				(naMao ? 'Toque num espaço da barra para confirmar' : 'Pega a habilidade para pôr na barra de atalhos') +
				'">' +
				(naMao ? 'Toque num espaço' : 'Pôr na barra') +
				'</button>'
			: '';

	const subir = avaliarSubir(skill, contexto);
	const acaoHtml = noTeto
		? '<div class="is-detail-max">Nível máximo alcançado</div>'
		: '<div class="is-detail-next">Próximo nível <strong>Nv. ' +
			(efetivo + 1) +
			'</strong> · custo ' +
			skill.custo +
			' ponto</div>' +
			(subir.ok ? '' : '<div class="is-detail-trava">' + escapeHtml(subir.motivo) + '</div>');
	// A MESMA plaqueta do nó, maior: quem está lendo a mecânica por nível mexe
	// no ponto dali, sem caçar o nó de volta na árvore.
	const plaquetaHtml = plaqueta(skill, contexto, 'is-plaqueta--detalhe');
	const nRequisitos =
		(skill.nivelBaseMinimo > 0 ? 1 : 0) +
		(skill.nivelClasseMinimo > 0 ? 1 : 0) +
		skill.preRequisitos.length +
		(linhaDaMissaoNoRequisito(skill, efetivo) ? 1 : 0);

	scrollEl.innerHTML =
		'<div class="is-hero">' +
		'<span class="is-detail-icon">' +
		'<img src="/ragidle/skills/' +
		encodeURIComponent(skill.skillId) +
		'.png" alt="" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';" />' +
		'<span class="is-detail-icon-fallback">' +
		escapeHtml(skillInitials(skill.skillId)) +
		'</span></span>' +
		'<div class="is-detail-header-text">' +
		'<h3 class="is-detail-name">' +
		escapeHtml(skill.nome) +
		'</h3>' +
		'<div class="is-detail-badges">' +
		'<span class="is-badge ri-badge ' +
		(skill.categoria === 'passiva' ? 'ri-badge--verde' : 'ri-badge--azul') +
		'">' +
		categoriaLabel +
		'</span>' +
		seloDeEfeito(skill) +
		'</div></div></div>' +
		'<div class="is-nivel-linha">' +
		'<span class="is-nivel-rotulo">Nível</span>' +
		plaquetaHtml +
		'<div class="is-pips">' +
		pipsHtml +
		'</div></div>' +
		(resumo ? '<div class="is-detail-resumo">' + escapeHtml(resumo) + '</div>' : '') +
		'<div class="is-detail-section"><h4>Pré-requisitos' +
		(nRequisitos ? '<small>' + nRequisitos + '</small>' : '') +
		'</h4>' +
		'<div class="is-req-box">' +
		renderRequisitos(skill, contexto) +
		'</div></div>' +
		'<div class="is-detail-section"><h4>Mecânica por nível<small>' +
		skill.nivelMaximo +
		' níveis</small></h4>' +
		'<div class="is-mecanica-box ri-scroll">' +
		mecanicaHtml +
		'</div></div>';

	footerEl.innerHTML =
		acaoHtml +
		nivelUsoHtml +
		'<div class="is-detail-acoes">' +
		atalhoHtml +
		esquecerHtml(skill) +
		'</div>' +
		confirmacaoDeEsquecerHtml(skill);

	const seletorDeUso = footerEl.querySelector('[data-nivel-chave]');
	if (seletorDeUso) {
		seletorDeUso.addEventListener('click', e => onPassoDoNivelDeUso(e, skill));
	}
	const btnAtalho = footerEl.querySelector('[data-skill-atalho]');
	if (btnAtalho) {
		btnAtalho.addEventListener('click', onClickPorNaBarra);
	}
	footerEl.querySelectorAll('[data-esquecer]').forEach(b => b.addEventListener('click', onClickEsquecer));
	const simEsquecer = footerEl.querySelector('[data-esquecer-sim]');
	if (simEsquecer) {
		simEsquecer.addEventListener('click', function (e) {
			e.stopImmediatePropagation();
			const alvo = e.currentTarget.dataset.esquecerSim;
			_confirmandoEsquecer = null;
			sendEsquecer(alvo, 'tudo');
			renderDetail();
		});
	}
	const naoEsquecer = footerEl.querySelector('[data-esquecer-nao]');
	if (naoEsquecer) {
		naoEsquecer.addEventListener('click', function (e) {
			e.stopImmediatePropagation();
			_confirmandoEsquecer = null;
			renderDetail();
		});
	}
	// A plaqueta do cabeçalho usa os MESMOS data-* e o mesmo juiz do nó.
	scrollEl.querySelectorAll('[data-skill-mais]').forEach(b => b.addEventListener('click', onClickMais));
	scrollEl.querySelectorAll('[data-skill-menos]').forEach(b => b.addEventListener('click', onClickMenos));

	// A linha da mecanica que importa fica a vista sem o jogador rolar.
	const alvo =
		scrollEl.querySelector('.is-mecanica-row--proxima') || scrollEl.querySelector('.is-mecanica-row--atual');
	if (alvo && alvo.scrollIntoView) {
		alvo.scrollIntoView({ block: 'nearest' });
	}
}

/* ------------------------------------------------------------------ */
/* ESQUECER (07/09/2026 — pedido do dono no alfa)                      */
/* ------------------------------------------------------------------ */

/** @var {string|null} a habilidade cuja confirmação de esquecer está aberta. */
let _confirmandoEsquecer = null;

/**
 * Os dois botões do caminho de volta: **▼ um nível** e **Desaprender**.
 *
 * Eles só existem para habilidade APRENDIDA e que o jogo não deu de graça — o
 * `deQuest` vem do servidor e é a mesma marca que a etiqueta "quest · grátis"
 * usa. Desaprender uma delas devolveria ponto que nunca foi gasto, e o servidor
 * recusa; mostrar o botão seria a janela prometendo o que ele nega.
 *
 * A janela NÃO reimplementa a regra de pré-requisito: quem decide é
 * `avaliarEsquecimento` (`game/progressao.ts`), e a recusa chega em
 * `problemas`. Aqui vale o mesmo argumento do aprendizado — *"seta acesa que
 * devolve recusa em vermelho: chato, nunca inseguro"*.
 */
/**
 * O PISO DE GRAÇA: até onde o jogo deu a habilidade sem cobrar ponto.
 *
 * Quem decide é o servidor (`pisosDeGraca`, que lê a árvore e o catálogo de
 * missões); aqui ele só é lido. **O `?? 0` não é defensivo à toa**: um cliente
 * novo pode falar com um servidor que ainda não manda o campo, e nesse caso o
 * certo é oferecer o botão e deixar o servidor recusar — o contrário esconderia
 * o caminho de volta de todas as habilidades.
 */
function pisoDeGracaDe(skill) {
	return typeof skill.pisoDeGraca === 'number' ? skill.pisoDeGraca : 0;
}

/** Quantos níveis desta habilidade o jogador PAGOU — os únicos que voltam. */
function niveisPagosDe(skill) {
	return Math.max(0, skill.aprendido - pisoDeGracaDe(skill));
}

function esquecerHtml(skill) {
	/*
	 * A condição é "sobrou nível PAGO", e não "não é de quest" (07/09/2026).
	 *
	 * A primeira versão escondia o botão em toda `deQuest` — e são 38 delas,
	 * das quais o jogo só dá UMA de graça: desde R14 as outras 37 são compradas
	 * na janela como qualquer outra, e escondê-las tirava do jogador o direito
	 * de desfazer a própria compra. Os Primeiros Socorros continuam sem botão,
	 * agora pela regra (piso = teto) e não por uma exceção escrita aqui.
	 */
	if (!skill || skill.aprendido <= 0 || niveisPagosDe(skill) <= 0) {
		return '';
	}
	/*
	 * DESLIGADO em 27/09/2026 (ordem do dono): o desaprender virou reset de
	 * graça. Quem liga é o servidor (`desaprender` no payload, ver
	 * `servidor/desaprender-pela-janela.ts`), e AUSENTE é desligado - um
	 * servidor velho que ainda aceitasse o pedido só perderia o botão, que é o
	 * lado seguro. O caminho pago é o Ticket de Reset de Skills ou o Hipnotizador.
	 */
	if (!IdleSkills.serverData || IdleSkills.serverData.desaprender !== true) {
		return '';
	}
	return (
		'<button type="button" class="is-btn-esquecer ri-btn ri-btn--sec" data-esquecer="' +
		escapeHtml(skill.skillId) +
		'" data-niveis="1" title="Devolve 1 ponto e baixa um nível">▼ Um nível</button>' +
		'<button type="button" class="is-btn-desaprender ri-btn ri-btn--sec" data-esquecer="' +
		escapeHtml(skill.skillId) +
		'" data-niveis="tudo" title="Devolve todos os pontos desta habilidade">Desaprender</button>'
	);
}

/**
 * A confirmação, INLINE e no mesmo desenho do resto — a caixa de prompt nativa
 * é de outra pele e abriria por cima desta janela.
 *
 * Ela aparece só para o **Desaprender**: o ▼ tira um nível e o jogador o recompra
 * com um clique, então pedir confirmação a cada seta seria a janela atrapalhando.
 * Perder uma habilidade inteira não tem esse desfazer barato.
 */
function confirmacaoDeEsquecerHtml(skill) {
	if (!skill || _confirmandoEsquecer !== skill.skillId) {
		return '';
	}
	// Os pontos prometidos são os PAGOS, e não o nível: numa habilidade com piso
	// (a missão deu o nível 1) prometer `aprendido` seria prometer um ponto a
	// mais do que o servidor devolve — e a janela mentindo é pior que a janela
	// calada.
	const pagos = niveisPagosDe(skill);
	return (
		'<div class="is-confirma-esquecer">' +
		'<span class="is-confirma-esquecer-texto">Desaprender ' +
		escapeHtml(skill.nome) +
		' e recuperar ' +
		pagos +
		' ponto' +
		(pagos === 1 ? '' : 's') +
		'?</span>' +
		'<button type="button" class="ri-btn" data-esquecer-sim="' +
		escapeHtml(skill.skillId) +
		'">Desaprender</button>' +
		'<button type="button" class="ri-btn ri-btn--sec" data-esquecer-nao="1">Cancelar</button>' +
		'</div>'
	);
}

function onClickEsquecer(e) {
	e.stopImmediatePropagation();
	const skillId = e.currentTarget.dataset.esquecer;
	if (!skillId) {
		return;
	}
	if (e.currentTarget.dataset.niveis === 'tudo') {
		// Duas etapas: abre a confirmação e redesenha o dossiê com ela dentro.
		_confirmandoEsquecer = skillId;
		renderDetail();
		return;
	}
	sendEsquecer(skillId, 1);
}

/**
 * O botão de TOQUE (D-938, lado do "pegar"): monta o MESMO payload que
 * `onSkillDragStart` monta e chama `pegar()` de `UI/toqueParaAtalho.js`. Quem
 * "põe" na barra é a BARRA DE ATALHOS (`ShortCut.js`) — este módulo só entrega
 * o que ficou na mão, e nunca fala com o servidor por conta própria.
 *
 * Tocar de novo na MESMA habilidade não precisa de um `if` aqui: o próprio
 * `pegar()` compara a chave do que já está na mão e desarma sozinho.
 */
/**
 * O "−"/"+" do NIVEL DE USO (D-1908). Muda a escolha da tela e, se a MESMA
 * habilidade ja esta na mao (o "Por na barra" do toque esperando um slot),
 * a mao passa a levar o nivel novo — trocar o nivel depois de pegar e o gesto
 * natural de quem viu o SP so depois de tocar.
 */
function onPassoDoNivelDeUso(e, skill) {
	const passo = lerPassoDoSeletor(e.target);
	if (!passo) {
		return;
	}
	e.stopImmediatePropagation();
	IdleSkills.nivelParaBarra = escolhasComPasso(IdleSkills.nivelParaBarra, skill, passo.passo);
	const numericId = idNumericoParaAtalho(skill);
	const naMao = pendente();
	if (numericId !== null && naMao && naMao.from === 'IdleSkills' && naMaoEstaHabilidade(numericId)) {
		naMao.data.selectedLevel = nivelParaABarra(IdleSkills.nivelParaBarra, skill);
	}
	renderDetail();
}

function onClickPorNaBarra(e) {
	e.stopImmediatePropagation();
	const skillId = e.currentTarget.dataset.skillAtalho;
	const skill = IdleSkills.serverData && IdleSkills.serverData.skills.find(item => item.skillId === skillId);
	const numericId = idNumericoParaAtalho(skill);
	if (numericId === null) {
		return;
	}
	const payload = payloadDaHabilidade(skill, numericId);
	payload.rotulo = skill.nome;
	pegar(payload);
}

/**
 * Reage a QUALQUER mudança da mão — inclusive vinda de fora desta janela (um
 * item pego na mochila, a barra consumindo com `entregar()`, o ESC cancelando
 * via `aoEscapar()`). Não chama `renderDetail()` inteiro de propósito: a
 * habilidade selecionada pode não ter mudado, e refazer o innerHTML do
 * dossiê reiniciaria a rolagem da caixa de mecânica à toa por causa de um
 * gesto que aconteceu em outra janela.
 *
 * Não guarda nada em módulo: lê `pendente()` na hora e escreve só no botão que
 * já está no DOM — por isso não entra em `limparEstadoDoPersonagem`.
 */
function atualizarBotaoAtalho() {
	const root = _root();
	const btn = root && root.querySelector('[data-skill-atalho]');
	if (!btn) {
		return;
	}
	const numericId = NUMERIC_SKILL_ID_BY_NAME.get(btn.dataset.skillAtalho);
	const naMao = naMaoEstaHabilidade(numericId);
	btn.classList.toggle('is-btn-atalho--armado', naMao);
	btn.textContent = naMao ? 'Toque num espaço' : 'Pôr na barra';
	btn.title = naMao ? 'Toque num espaço da barra para confirmar' : 'Pega a habilidade para pôr na barra de atalhos';
}

/* ------------------------------------------------------------------------ */
/* O rodapé                                                                  */
/* ------------------------------------------------------------------------ */

function renderFooter() {
	const root = _root();
	const leftEl = root.querySelector('.is-footer-left');
	const pillEl = root.querySelector('.is-pontos-pill');
	const problemasEl = root.querySelector('.is-problemas');
	const btnAplicar = root.querySelector('.is-btn-aplicar');
	const btnResetar = root.querySelector('.is-btn-resetar');

	const data = IdleSkills.serverData;
	if (!data) {
		leftEl.textContent = '';
		pillEl.textContent = 'Pontos de habilidade: 0';
		btnAplicar.disabled = true;
		btnResetar.disabled = true;
	} else {
		const contexto = contextoDoRascunho();
		const gastos = pontosNoRascunho(IdleSkills.rascunho);
		const livres = data.pontos - gastos;

		// "Disponíveis" conta o RASCUNHO, e não o `podeAprender` do servidor: o
		// número tem de responder "e agora, o que eu ainda consigo subir?", e
		// depois de dois pontos no rascunho a resposta do servidor envelheceu.
		const disponiveis = data.skills.filter(s => avaliarSubir(s, contexto).ok).length;
		leftEl.textContent = pluralizeDisponiveis(disponiveis);

		pillEl.innerHTML =
			'Pontos de habilidade: ' + livres + (gastos ? ' <em>(−' + gastos + ' no rascunho)</em>' : '');

		// Com um lote no ar o botao apaga (H09): o rascunho ainda e o mesmo, e
		// aplica-lo de novo gastaria os pontos duas vezes.
		btnAplicar.disabled = gastos === 0 || IdleSkills._esperandoAplicar;
		btnResetar.disabled = gastos === 0;
		// Com rascunho aberto o Aplicar ACENDE (brilho de acento): é a única
		// ação da janela com consequência, e o olho tem de achá-la sem ler.
		btnAplicar.classList.toggle('is-armado', gastos > 0);
		btnAplicar.title = gastos ? 'Gastar ' + gastos + ' ponto(s) de habilidade' : 'Nada no rascunho';
		btnResetar.title = 'Descarta o rascunho — não desaprende nada (o Ragnarok não devolve ponto)';
	}

	problemasEl.textContent =
		IdleSkills.problemas && IdleSkills.problemas.length ? IdleSkills.problemas.join(' · ') : '';
}

Network.hookPacket(PACKET.ZC.RAGIDLE_SKILLS, onSkillsReceived);

/**
 * A TROCA DE PERSONAGEM ESQUECE a JANELA DE HABILIDADES.
 *
 * Voltar ao menu de personagem NÃO recarrega a página: `onRestartAnswer` chama
 * `cleanGameUI()` e `onRestart()`, sem `GameEngine.reload()` (o reload só
 * acontece no SAIR). Todo estado de MÓDULO atravessa a troca — e este arquivo
 * guarda a árvore inteira do personagem, mais um RASCUNHO de pontos que só faz
 * sentido para quem o montou.
 *
 * Chamada por `cleanGameUI()` em Engine/MapEngine.js, junto com os outros
 * componentes RAGIDLE. Quem somar estado de personagem aqui soma a linha
 * correspondente ABAIXO, e o portão `limpeza-da-troca-de-personagem.test.ts`
 * (no repo do servidor) reprova se esquecer.
 */
IdleSkills.limparEstadoDoPersonagem = function limparEstadoDoPersonagem() {
	IdleSkills.serverData = null;
	IdleSkills.selectedSkillId = null;
	IdleSkills.problemas = [];
	IdleSkills.rascunho = {};
	IdleSkills.nivelParaBarra = {};
	soltarOAplicar();
	/*
	 * ZERAR O DADO NÃO BASTA: `GUIComponent.remove()` só DESANEXA o host, então
	 * o shadow DOM (com `is-open` e o HTML do personagem anterior) atravessa a
	 * troca. Ver `UI/Components/limpezaDeJanelaIdle.js`.
	 */
	fecharEEsquecer(_root(), '.is-window', { corpo: '.is-tela', texto: 'Carregando…' });
};

/**
 * Create component and export it
 */
export default UIManager.addComponent(IdleSkills);
