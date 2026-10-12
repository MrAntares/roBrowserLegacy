/**
 * A janela de LOCALIZADOR DE GRUPOS -- redesenho no vocabulário visual do
 * Atlas de Caça (irmã de src/UI/Components/HuntMap/HuntMap.js: mesma moldura
 * ".ri-window.ri-anima", cards com filete de encaixe via custom property,
 * medidor de faixa com losango marcando o nível do jogador, dossiê lateral
 * com hero + rodapé fixo de ação).
 *
 * ---------------------------------------------------------------------------
 * A REGRA QUE GOVERNA ESTE ARQUIVO: A UI SÓ REFLETE
 * ---------------------------------------------------------------------------
 *
 * Nenhuma linha aqui decide se o jogador PODE entrar num grupo, privar um
 * grupo ou usar uma senha. Quem decide é o servidor: `ZC_RAGIDLE_LFG_LISTA`
 * já traz, por grupo, um `podeEntrar` calculado para ESTE jogador, e
 * `ZC_RAGIDLE_LFG_RESULTADO` traz o `motivo` literal de qualquer recusa (uma
 * senha errada incluída). O botão desenha o booleano e imprime a frase.
 *
 * A ÚNICA classificação feita aqui (`estadoDoGrupo`, abaixo) é decorativa: ela
 * escolhe qual dos cinco filetes/rótulos («meu grupo», «compatível», «fora da
 * faixa», «cheio», «líder offline») pinta o card, a partir de campos que o
 * servidor já mandou prontos (`podeEntrar`, `vagas`, `liderOnline`, e `meu`) --
 * nunca refaz a conta de faixa de nível. "Meu grupo" (`meu.grupoId ===
 * g.grupoId`) é conferido ANTES de tudo o mais: o servidor manda
 * `podeEntrar:false` pro PRÓPRIO grupo do jogador (entrar não se aplica a
 * quem já está dentro), e sem essa checagem primeiro o dossiê do seu próprio
 * grupo caía no catch-all e mostrava "Fora da faixa" (achado pela sonda,
 * 03/09/2026) -- um rótulo de recusa para o grupo que o jogador NÃO está
 * tentando entrar. Quando nenhum dos quatro motivos específicos bate, o
 * rótulo cai em "fora da faixa" por exclusão; o texto literal do servidor
 * (`motivo`, quando a ação é tentada) continua sendo mostrado ao lado, então
 * um rótulo genérico nunca esconde a razão real. Sinalizado no relatório
 * final para revisão do sênior.
 *
 * ---------------------------------------------------------------------------
 * O RODAPÉ DO DOSSIÊ É ESTÁTICO -- E É POR ISSO QUE O PUSH NÃO DESTRÓI INPUT
 * ---------------------------------------------------------------------------
 *
 * `ZC_RAGIDLE_LFG_LISTA` pode chegar A QUALQUER MOMENTO com a janela aberta
 * (push em tempo real, não só em resposta a um pedido nosso) -- e pode chegar
 * enquanto o jogador está com o campo de senha aberto, digitando. Se o
 * rodapé fosse reconstruído por `innerHTML` a cada desenho (o padrão que o
 * resto desta janela usa para a lista de cards e para o corpo do dossiê),
 * cada push apagaria a senha na metade da digitação.
 *
 * Por isso `.lfg-panel-footer` (ver LFGIdle.html) nasce com TODOS os botões e
 * TODOS os mini-formulários possíveis já no HTML, escondidos por `[hidden]`.
 * `renderFooter()` só liga/desliga `hidden`, troca `textContent`/`disabled` e
 * nunca toca em `.value` de um `<input>` -- os nós do DOM (e o que o jogador
 * digitou neles) sobrevivem a quantos pushes chegarem. A ÚNICA vez que um
 * campo de senha é limpo é quando o próprio jogador troca de grupo
 * selecionado ou cancela o formulário (`selecionarGrupo`/`.lfg-*-cancelar`) --
 * nunca por causa de um desenho.
 *
 * ---------------------------------------------------------------------------
 * CONTRATO DE FIO (codificado contra o que o servidor vai falar)
 * ---------------------------------------------------------------------------
 *
 * Enviar (CZ_RAGIDLE_LFG_ACAO 0x0fea, JSON, via `mandar()`):
 *   {acao:'listar'} · {acao:'criar', nome?, privado, senha?} ·
 *   {acao:'entrar', grupoId, senha?} · {acao:'sair'} · {acao:'dissolver'} ·
 *   {acao:'privacidade', privado, senha?} · {acao:'teleportar'} ·
 *   {acao:'fechar'} (ao fechar a janela -- desinscreve do push).
 *
 * `nome` em 'criar' é OMITIDO quando o campo fica vazio -- o servidor decide
 * o padrão (o nome do personagem), não a janela. `maxlength="23"` no campo é
 * só ajuda de digitação (23 bytes latin1 é o teto do protocolo); quem apara e
 * saneia de verdade é o servidor, e o `nome` que volta em cada grupo (abaixo)
 * é sempre o já saneado por ele.
 *
 * Receber ZC_RAGIDLE_LFG_LISTA 0x0fe9 (JSON):
 *   { meu: null | {grupoId, souLider}, grupos: [{grupoId, nome, liderNome,
 *     liderClasse, liderNivel, nivelRecomendado, faixa:{minimo,maximo}, mapa,
 *     mapaRotulo, membros:[{nome, classe, nivel, ehLider}], vagas, limite,
 *     temSenha, privado, liderOnline, podeEntrar, motivo?}] }
 *
 * Receber ZC_RAGIDLE_LFG_RESULTADO 0x0fe8: {ok, acao, motivo?}.
 *
 * Nenhum dos dois pacotes (opcode nem framing) muda com este redesenho -- os
 * dois já trafegam JSON livre (ver Network/PacketStructure.js, "0x0fe8"/
 * "0x0fe9"/"0x0fea"), então o contrato novo cabe sem tocar em Network/.
 */

import Renderer from 'Renderer/Renderer.js';
import Preferences from 'Core/Preferences.js';
import Client from 'Core/Client.js';
import DB from 'DB/DBManager.js';
import Session from 'Engine/SessionStorage.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import RiIcones from 'UI/ri-icones.js';
import htmlText from './LFGIdle.html?raw';
import cssText from './LFGIdle.css?raw';
import { fecharEEsquecer } from '../limpezaDeJanelaIdle.js';
import { abaLembrada, lembrarAba } from '../memoriaDeAba.js';

/*
 * Manter em sincronia com o ":host"/".lfg-window" do CSS -- mesmo papel do
 * WINDOW_WIDTH/HEIGHT de HuntMap.js. O WINDOW_HEIGHT continua 600 mesmo na
 * variante de tela baixa (560, só no CSS): a caixa real fica MENOR que o que
 * o JS supõe, então "top" calculado para 600 sobra folga embaixo -- nunca
 * estoura por cima (mesmo raciocínio do comentário de HuntMap.js em cima de
 * WINDOW_HEIGHT).
 */
const WINDOW_WIDTH = 880;
const WINDOW_HEIGHT = 600;

const LFGIdle = new GUIComponent('LFGIdle', cssText);

/** A posição e a ABA em que o jogador estava atravessam a sessão (mesmo
 * arranjo de MissoesIdle/HuntMap). Versão continua 1.0: somar chave nova aos
 * padrões não exige subir versão -- ver o cabeçalho de memoriaDeAba.js. Nunca
 * salva senha aqui: senha não é preferência de janela. */
const _preferences = Preferences.get(
	'LFGIdle',
	{
		x: null,
		y: null,
		aba: null
	},
	1.0
);

LFGIdle.render = () => htmlText;

/** Janela fechada não engole clique de cena. */
LFGIdle.mouseMode = GUIComponent.MouseMode.CROSS;

/** Os anúncios do último `ZC_RAGIDLE_LFG_LISTA`. */
LFGIdle.grupos = [];

/**
 * O MEU grupo, como o servidor decidiu: `{ grupoId, souLider } | null`. Nunca
 * é deduzido aqui comparando `grupoId` contra a lista -- mesma regra do
 * cabeçalho: quem decide é o servidor, a UI só reflete.
 */
LFGIdle.meu = null;

/** O grupo cujo dossiê está aberto na coluna da direita (grupoId, ou null
 * quando nenhum). Sobrevive a um push -- só muda quando o próprio jogador
 * clica noutro card, ou quando o grupo selecionado desaparece da lista (ver
 * `sincronizarSelecao`). */
LFGIdle.selecionado = null;

/** grupoId do grupo cujo rodapé está mostrando o mini-formulário "entrar com
 * senha", ou null. */
LFGIdle.entrarSenhaPara = null;

/** true enquanto o LÍDER do grupo selecionado está preenchendo a senha para
 * privar o próprio grupo. */
LFGIdle.privacidadeEdicao = false;

/** true durante o segundo passo de "Dissolver grupo" (o mesmo padrão de dois
 * passos sem `window.confirm` que esta janela já usava). */
LFGIdle.confirmarDissolver = false;

/**
 * true enquanto o JOGADOR deixou a janela aberta por vontade própria (ligado
 * em `abrir()`, desligado em `fechar()` e na troca de personagem). É estado
 * de MÓDULO, não do DOM -- sobrevive a qualquer coisa que aconteça com
 * `.lfg-window`/`is-open` por baixo dos panos numa troca de mapa (achado pela
 * sonda no jogo real, 03/09/2026: `.is-open` some numa corrida, o host inteiro
 * some noutra -- duas corridas do MESMO ciclo de mapmove, sintoma variando).
 * `onAppend()` usa esta flag, e NÃO a classe `is-open` do DOM (que é
 * exatamente o que não é confiável), para decidir se deve reabrir a janela e
 * resincronizar -- ver o comentário grande em `onAppend`.
 */
LFGIdle.estavaAberta = false;

/** As abas que existem, na ordem do HTML -- valida o que veio do
 * `localStorage` (ver memoriaDeAba.js). */
const ABAS = ['grupos', 'criar'];
const ABA_PADRAO = 'grupos';

/** Aba ativa: 'grupos' | 'criar'. Nasce no padrão e vira a LEMBRADA no init(). */
LFGIdle.abaAtiva = ABA_PADRAO;

/** Ações cujo sucesso tira o jogador da cidade/mapa atual -- fecham a janela
 * (e desinscrevem do push), o mesmo tratamento que 'criar'/'entrar'/'voltar'
 * já tinham na versão anterior desta janela. 'criar' NÃO entra aqui: o mapa
 * do grupo é o mapa onde o líder já está, então criar não teleporta ninguém. */
const ACOES_QUE_FECHAM = new Set(['entrar', 'teleportar']);

/** Rótulo curto do card/badge, por estado de encaixe (ver `estadoDoGrupo`). */
const ROTULO_BADGE = {
	'meu-grupo': 'Meu grupo',
	compativel: 'Compatível',
	'fora-da-faixa': 'Fora da faixa',
	cheio: 'Cheio',
	offline: 'Líder offline',
	'ja-tem-grupo': 'Já tem grupo',
	indisponivel: 'Indisponível'
};

/** O código de recusa do servidor (`recusa`) traduzido para o estado visual.
 * `senha` NÃO aparece aqui de propósito: a vitrine deixou de trancar por senha
 * (o grupo privado desce com `podeEntrar:true` e o cadeado), então uma recusa
 * por senha só existe DEPOIS do clique, e ela vira mensagem ao lado do botão --
 * nunca estado do card. */
/** O texto do BOTÃO do rodapé por estado. Só os estados que impedem a entrada
 * entram aqui; o resto cai no "Entrar no grupo" de quem chama. */
const ROTULO_BOTAO = {
	cheio: 'Grupo cheio',
	offline: 'Líder offline',
	'fora-da-faixa': 'Nível incompatível',
	'ja-tem-grupo': 'Você já está em um grupo',
	indisponivel: 'Grupo indisponível'
};

const RECUSA_PARA_ESTADO = {
	'fora-da-faixa': 'fora-da-faixa',
	cheio: 'cheio',
	'lider-offline': 'offline',
	'ja-tem-grupo': 'ja-tem-grupo',
	sumiu: 'indisponivel',
	privacidade: 'indisponivel'
};

function raiz() {
	return LFGIdle._shadow || LFGIdle._host;
}

/** O mesmo `escapeHtml` das outras janelas RagIdle: nome de personagem e
 * rótulo de mapa entram por `innerHTML`, e nome de personagem é texto que
 * OUTRO jogador escolheu. */
function escapeHtml(valor) {
	return String(valor === null || valor === undefined ? '' : valor)
		.split('&')
		.join('&amp;')
		.split('<')
		.join('&lt;')
		.split('>')
		.join('&gt;')
		.split('"')
		.join('&quot;');
}

function mandar(corpo) {
	const pkt = new PACKET.CZ.RAGIDLE_LFG_ACAO();
	pkt.json = JSON.stringify(corpo);
	Network.sendPacket(pkt);
}

/**
 * A classificação DECORATIVA de um grupo em um dos cinco estados do design
 * (ver o cabeçalho do arquivo). A ordem importa, e "meu grupo" vem PRIMEIRO
 * de propósito: o servidor manda `podeEntrar:false` para o grupo em que o
 * próprio jogador já está (entrar não se aplica a quem já é membro) -- sem
 * conferir `meu` antes, esse grupo caía no mesmo catch-all de quem não pode
 * entrar por nível, e o dossiê do PRÓPRIO grupo mostrava "Fora da faixa"
 * (achado pela sonda, 03/09/2026). Depois disso, líder offline e grupo cheio
 * são fatos objetivos (campos que o servidor já manda prontos) e vêm antes de
 * olhar `podeEntrar` -- só quando nenhum dos três bate é que a recusa
 * (`!podeEntrar`) vira o rótulo "fora da faixa", o motivo mais comum dela.
 */
function estadoDoGrupo(g) {
	if (LFGIdle.meu && LFGIdle.meu.grupoId === g.grupoId) {
		return 'meu-grupo';
	}
	if (g.liderOnline === false) {
		return 'offline';
	}
	if (typeof g.vagas === 'number' && g.vagas <= 0) {
		return 'cheio';
	}
	if (!g.podeEntrar) {
		/*
		 * O SERVIDOR DIZ O MOTIVO EM CÓDIGO (`recusa`, 03/09/2026) -- e antes
		 * disto tudo o que não fosse cheio/offline virava "fora da faixa" no
		 * catch-all abaixo. O dono viu o pior caso no jogo: nível 67 diante de
		 * um grupo de faixa 58-88, com a badge dizendo "Fora da faixa" e o
		 * botão "Nível incompatível" -- a recusa de verdade era outra.
		 *
		 * O `||` final mantém a janela funcionando contra um servidor um
		 * deploy atrás, que ainda não manda o campo.
		 */
		return RECUSA_PARA_ESTADO[g.recusa] || 'fora-da-faixa';
	}
	return 'compativel';
}

/**
 * O medidor de faixa: trilho + faixa do grupo sempre no meio (25%..75%) +
 * marcador (o losango) no SEU nível. MESMA fórmula de
 * `HuntMap/atlasDeCaca.js#medidorDeEncaixe` -- duplicada aqui de propósito e
 * não importada de lá: são ~10 linhas de geometria pura, e importar um
 * módulo de dentro de `HuntMap/` acoplaria esta janela a outra fora do seu
 * escopo. Se um dia as duas mexerem juntas, isto vira candidato a módulo
 * compartilhado.
 */
function medidorDeFaixa(nivel, faixa) {
	const min = faixa.minimo || 0;
	const max = faixa.maximo || 0;
	const largura = Math.max(max - min, 4);
	const inicio = min - largura / 2;
	const fim = max + largura / 2;
	const bruto = ((nivel - inicio) / (fim - inicio)) * 100;
	const marcador = Math.round(Math.min(100, Math.max(0, bruto)) * 10) / 10;
	const dentro = nivel >= min && nivel <= max;
	return { marcador, dentro };
}

/** O nível do PRÓPRIO jogador, lido do espelho local que o cliente já
 * mantém (Session.Entity.clevel -- o mesmo campo que BasicInfo/MapEngine.js
 * usa para a HUD) -- não um campo do contrato do LFG. É só o valor que
 * posiciona o losango no medidor; a decisão de permitir entrar continua
 * sendo `podeEntrar`, vinda do servidor. */
function nivelDoJogador() {
	return Session && Session.Entity && typeof Session.Entity.clevel === 'number' ? Session.Entity.clevel : 0;
}

/**
 * Ícone de classe (líder ou membro) e coroa do líder: a MESMA técnica de
 * `PartyFriends/PartyFriendsCommon.js` (~L800-817) -- bmp do cliente,
 * carregado por `Client.loadFile` e aplicado como `background-image`, porque
 * não é um asset com caminho público (como o minimapa), é recurso do GRF.
 * Roda depois de qualquer `innerHTML` que tenha criado `[data-classe-icone]`
 * ou `[data-crown]` novos.
 */
function carregarIconesDeClasse(escopo) {
	escopo.querySelectorAll('[data-classe-icone]').forEach(function (el) {
		const jobId = el.dataset.classeIcone;
		if (!jobId) {
			return;
		}
		Client.loadFile(DB.INTERFACE_PATH + 'renewalparty/icon_jobs_' + jobId + '.bmp', function (url) {
			el.style.backgroundImage = 'url(' + url + ')';
		});
	});
	escopo.querySelectorAll('[data-crown]').forEach(function (el) {
		Client.loadFile(DB.INTERFACE_PATH + 'renewalparty/ico_partycrown.bmp', function (url) {
			el.style.backgroundImage = 'url(' + url + ')';
		});
	});
}

/** A miniatura de mapa com reserva neutra -- mesma receita de
 * `HuntMap.js#renderThumb` (o glifo Lucide "mapa vazio" só aparece quando o
 * `onerror` da <img> a esconde). */
function thumbDoMapa(mapa) {
	return (
		'<span class="lfg-thumb-vazio">' +
		RiIcones.mapaVazio +
		'</span>' +
		'<img src="/ragidle/minimapas/' +
		escapeHtml(mapa) +
		'.webp" alt="" onerror="this.style.display=\'none\'" />'
	);
}

function obterGrupoSelecionado() {
	if (LFGIdle.selecionado == null) {
		return null;
	}
	for (let i = 0; i < LFGIdle.grupos.length; i++) {
		if (LFGIdle.grupos[i].grupoId === LFGIdle.selecionado) {
			return LFGIdle.grupos[i];
		}
	}
	return null;
}

/** O motivo do servidor, LITERAL, perto do botão que causou a recusa: a aba
 * Criar tem o seu próprio slot (`.lfg-criar-motivo`), e as ações de dentro
 * do dossiê (entrar/sair/dissolver/privacidade/teleportar) compartilham
 * `.lfg-panel-motivo` no rodapé -- só uma dessas ações fica visível de cada
 * vez, então um slot só basta. */
function mostrarMotivoNoPainel(texto) {
	const el = raiz().querySelector('.lfg-panel-motivo');
	el.textContent = texto || '';
	el.hidden = !texto;
}

function mostrarMotivoNoCriar(texto) {
	const el = raiz().querySelector('.lfg-criar-motivo');
	el.textContent = texto || '';
	el.hidden = !texto;
}

/** Roteia o `{ok, acao, motivo}` de ZC_RAGIDLE_LFG_RESULTADO pro slot certo:
 * 'criar' tem o dela própria (a aba Criar não faz parte do dossiê), as
 * demais ações caem no rodapé do dossiê. */
function mostrarMotivoDaAcao(acao, texto) {
	if (acao === 'criar') {
		mostrarMotivoNoCriar(texto);
	} else {
		mostrarMotivoNoPainel(texto);
	}
}

function limparMotivoDoPainel() {
	mostrarMotivoNoPainel('');
}

function sincronizarAbas() {
	const r = raiz();
	r.querySelectorAll('.lfg-tab').forEach(function (x) {
		x.classList.toggle('is-active', x.dataset.tab === LFGIdle.abaAtiva);
	});
	r.querySelector('.lfg-view-grupos').hidden = LFGIdle.abaAtiva !== 'grupos';
	r.querySelector('.lfg-view-criar').hidden = LFGIdle.abaAtiva !== 'criar';
}

/**
 * Garante que `LFGIdle.selecionado` continua apontando pro mesmo grupo depois
 * de uma lista nova chegar (o requisito de "preservar a seleção do dossiê"
 * num push). Só escolhe de novo quando o grupo selecionado SUMIU da lista
 * (dissolvido, por exemplo) -- e aí sim os fluxos em andamento (senha de
 * entrada, edição de privacidade, confirmação de dissolver) deixam de fazer
 * sentido e são descartados junto.
 */
function sincronizarSelecao() {
	const aindaExiste =
		LFGIdle.selecionado != null &&
		LFGIdle.grupos.some(function (g) {
			return g.grupoId === LFGIdle.selecionado;
		});
	if (aindaExiste) {
		return;
	}
	if (LFGIdle.meu) {
		LFGIdle.selecionado = LFGIdle.meu.grupoId;
	} else if (LFGIdle.grupos.length) {
		LFGIdle.selecionado = LFGIdle.grupos[0].grupoId;
	} else {
		LFGIdle.selecionado = null;
	}
	LFGIdle.entrarSenhaPara = null;
	LFGIdle.privacidadeEdicao = false;
	LFGIdle.confirmarDissolver = false;
	limparMotivoDoPainel();
}

/** Clique NUM card: troca a seleção do dossiê. Diferente de
 * `sincronizarSelecao` (que só corrige uma seleção que ficou órfã), isto é
 * navegação do jogador -- sempre descarta qualquer mini-formulário aberto do
 * grupo anterior. */
function selecionarGrupo(idTexto) {
	const encontrado = LFGIdle.grupos.find(function (g) {
		return String(g.grupoId) === String(idTexto);
	});
	if (!encontrado) {
		return;
	}
	LFGIdle.selecionado = encontrado.grupoId;
	LFGIdle.entrarSenhaPara = null;
	LFGIdle.privacidadeEdicao = false;
	LFGIdle.confirmarDissolver = false;
	limparMotivoDoPainel();
	renderList();
	renderPanel();
}

/** Um card FECHADO: ícone de classe do líder, nome, cadeado se privado, mapa
 * atual (com miniatura), nomes dos membros numa linha discreta, contador e
 * nível recomendado -- o essencial, nada do dossiê. */
function cardDeGrupo(g) {
	const estado = estadoDoGrupo(g);
	const selecionado = g.grupoId === LFGIdle.selecionado;
	const nomesMembros = (g.membros || [])
		.map(function (m) {
			return m.nome;
		})
		.join(', ');
	const cadeado = g.privado
		? '<span class="lfg-card-cadeado" title="Grupo privado">' + RiIcones.cadeado + '</span>'
		: '';
	const membrosHtml = nomesMembros
		? '<div class="lfg-card-membros" title="' +
			escapeHtml(nomesMembros) +
			'">' +
			escapeHtml(nomesMembros) +
			'</div>'
		: '';
	// O nome do grupo (o criador escolhe) é discreto de propósito: o card
	// fechado continua liderando com o nome do LÍDER (pedido explícito), o
	// nome do grupo só aparece se veio do servidor.
	const nomeHtml = g.nome
		? '<div class="lfg-card-nome" title="' + escapeHtml(g.nome) + '">' + escapeHtml(g.nome) + '</div>'
		: '';

	return (
		'<div class="lfg-card fit-' +
		estado +
		(selecionado ? ' is-selected' : '') +
		'" data-grupo="' +
		escapeHtml(g.grupoId) +
		'" role="button" tabindex="0" aria-pressed="' +
		(selecionado ? 'true' : 'false') +
		'">' +
		'<div class="lfg-card-thumb">' +
		thumbDoMapa(g.mapa) +
		'</div>' +
		'<div class="lfg-card-body">' +
		'<div class="lfg-card-top">' +
		'<span class="lfg-card-classe" data-classe-icone="' +
		escapeHtml(g.liderClasse) +
		'"></span>' +
		'<span class="lfg-card-lider">' +
		escapeHtml(g.liderNome) +
		'</span>' +
		cadeado +
		'<span class="lfg-badge">' +
		escapeHtml(ROTULO_BADGE[estado]) +
		'</span>' +
		'</div>' +
		nomeHtml +
		'<div class="lfg-card-mapa">' +
		escapeHtml(g.mapaRotulo || g.mapa) +
		'</div>' +
		membrosHtml +
		'<div class="lfg-card-foot">' +
		'<span class="lfg-card-vagas">' +
		escapeHtml((g.membros || []).length) +
		'/' +
		escapeHtml(g.limite) +
		'</span>' +
		'<span>Lv. ' +
		escapeHtml(g.nivelRecomendado) +
		'</span>' +
		'</div>' +
		'</div>' +
		'</div>'
	);
}

function linhaDeMembro(m) {
	const coroa = m.ehLider
		? '<span class="lfg-membro-tag ri-badge ri-badge--ouro" data-crown>' +
			'<span class="lfg-membro-coroa" aria-hidden="true"></span>Líder</span>'
		: '';
	return (
		'<div class="lfg-membro' +
		(m.ehLider ? ' is-lider' : '') +
		'">' +
		'<span class="lfg-membro-classe" data-classe-icone="' +
		escapeHtml(m.classe) +
		'"></span>' +
		'<span class="lfg-membro-nome">' +
		escapeHtml(m.nome) +
		'</span>' +
		'<span class="lfg-membro-nivel">Lv. ' +
		escapeHtml(m.nivel) +
		'</span>' +
		coroa +
		'</div>'
	);
}

function renderList() {
	const r = raiz();
	const cabecalho = r.querySelector('.lfg-list-head');
	cabecalho.textContent = !LFGIdle.grupos.length
		? ''
		: LFGIdle.grupos.length === 1
			? '1 grupo aberto'
			: LFGIdle.grupos.length + ' grupos abertos';

	const lista = r.querySelector('.lfg-list');
	if (!LFGIdle.grupos.length) {
		lista.innerHTML = '<div class="lfg-empty">Nenhum grupo aberto. Crie o seu na aba "Criar grupo".</div>';
		return;
	}

	lista.innerHTML = LFGIdle.grupos.map(cardDeGrupo).join('');
	lista.querySelectorAll('.lfg-card').forEach(function (card) {
		card.addEventListener('click', function () {
			selecionarGrupo(card.dataset.grupo);
		});
	});
	carregarIconesDeClasse(lista);
}

/** O corpo ROLÁVEL do dossiê -- hero, medidor de faixa e lista de membros.
 * Reconstruído por `innerHTML` a cada desenho (nada aqui é input do
 * jogador); o rodapé, que TEM inputs, é uma peça separada e estática (ver
 * `renderFooter`). */
function renderPanelScroll() {
	const scroll = raiz().querySelector('.lfg-panel-scroll');
	const g = obterGrupoSelecionado();

	if (!g) {
		scroll.innerHTML =
			'<div class="lfg-panel-empty">' +
			(LFGIdle.meu ? 'Carregando os detalhes do seu grupo...' : 'Selecione um grupo para ver os detalhes.') +
			'</div>';
		return;
	}

	const estado = estadoDoGrupo(g);
	const faixa = g.faixa || {};
	const nivel = nivelDoJogador();
	const medidor = medidorDeFaixa(nivel, faixa);
	const veredito = estado === 'compativel' ? (medidor.dentro ? 'Na faixa' : 'Compatível') : ROTULO_BADGE[estado];
	const cadeadoNoBadge = g.privado ? RiIcones.cadeado : '';
	// "nome" é o campo novo (o criador escolhe); o fallback cobre um servidor
	// um deploy atrás, que ainda não manda esse campo -- nunca undefined/vazio
	// na tela.
	const nomeDoGrupo = g.nome || 'Grupo de ' + g.liderNome;
	const membrosHtml =
		(g.membros || []).map(linhaDeMembro).join('') || '<div class="lfg-panel-empty">Sem membros.</div>';

	scroll.innerHTML =
		'<div class="lfg-hero fit-' +
		estado +
		'">' +
		thumbDoMapa(g.mapa) +
		'<div class="lfg-hero-cap">' +
		'<div class="lfg-hero-text">' +
		'<div class="lfg-hero-mapa">' +
		escapeHtml(g.mapaRotulo || g.mapa) +
		'</div>' +
		'<h3 class="lfg-hero-title">' +
		escapeHtml(nomeDoGrupo) +
		'</h3>' +
		'</div>' +
		'<span class="lfg-badge">' +
		cadeadoNoBadge +
		escapeHtml(g.privado ? 'Privado' : 'Público') +
		'</span>' +
		'</div>' +
		'</div>' +
		'<div class="lfg-fit fit-' +
		estado +
		'">' +
		'<div class="lfg-fit-you">' +
		'<span class="lfg-fit-you-label">Você</span>' +
		'<span class="lfg-fit-you-nivel">' +
		escapeHtml(nivel) +
		'</span>' +
		'</div>' +
		'<div class="lfg-fit-body">' +
		'<div class="lfg-meter"><span class="lfg-meter-track"><span class="lfg-meter-fill"></span>' +
		'<span class="lfg-meter-you" style="left:' +
		medidor.marcador +
		'%" title="Seu nível: ' +
		escapeHtml(nivel) +
		'"></span></span></div>' +
		'<div class="lfg-fit-row">' +
		'<span class="lfg-fit-verdict">' +
		escapeHtml(veredito) +
		'</span>' +
		'<span class="lfg-fit-range">Nv. recomendado <b>' +
		escapeHtml(g.nivelRecomendado) +
		'</b> · Nv. ' +
		escapeHtml(faixa.minimo) +
		'–' +
		escapeHtml(faixa.maximo) +
		'</span>' +
		'</div>' +
		'</div>' +
		'</div>' +
		'<div class="lfg-section">' +
		'<span class="lfg-section-title">Membros</span>' +
		'<span class="lfg-section-n">' +
		escapeHtml((g.membros || []).length) +
		'/' +
		escapeHtml(g.limite) +
		'</span>' +
		'</div>' +
		'<div class="lfg-membros">' +
		membrosHtml +
		'</div>';

	carregarIconesDeClasse(scroll);
}

/**
 * O RODAPÉ do dossiê -- só liga/desliga `hidden`, troca `textContent` e
 * `disabled`. NUNCA reescreve `innerHTML` desta peça, e nunca toca em
 * `.value` de um campo de senha: é isso que deixa o rodapé sobreviver a um
 * push chegando no meio da digitação (ver o cabeçalho do arquivo).
 */
function renderFooter() {
	const r = raiz();
	const footer = r.querySelector('.lfg-panel-footer');
	const acaoEntrar = footer.querySelector('.lfg-acao-entrar');
	const formEntrar = footer.querySelector('.lfg-form-senha-entrar');
	const acaoMembro = footer.querySelector('.lfg-acao-membro');
	const acaoLider = footer.querySelector('.lfg-acao-lider');
	const formPrivar = footer.querySelector('.lfg-form-senha-privar');
	const confirmaDissolver = footer.querySelector('.lfg-dissolver-confirma');

	acaoEntrar.hidden = true;
	formEntrar.hidden = true;
	acaoMembro.hidden = true;
	acaoLider.hidden = true;
	formPrivar.hidden = true;
	confirmaDissolver.hidden = true;

	const g = obterGrupoSelecionado();
	if (!g) {
		return;
	}

	const souLider = !!(LFGIdle.meu && LFGIdle.meu.grupoId === g.grupoId && LFGIdle.meu.souLider);
	const souMembro = !!(LFGIdle.meu && LFGIdle.meu.grupoId === g.grupoId && !LFGIdle.meu.souLider);

	if (souLider) {
		acaoLider.hidden = false;
		footer.querySelectorAll('.lfg-priv-btn').forEach(function (botao) {
			const ehBotaoPrivado = botao.dataset.privado === '1';
			const ativo = ehBotaoPrivado === !!g.privado;
			botao.classList.toggle('is-selected', ativo);
			botao.setAttribute('aria-selected', ativo ? 'true' : 'false');
		});
		formPrivar.hidden = !LFGIdle.privacidadeEdicao;
		confirmaDissolver.hidden = !LFGIdle.confirmarDissolver;
		return;
	}

	if (souMembro) {
		acaoMembro.hidden = false;
		return;
	}

	if (LFGIdle.entrarSenhaPara === g.grupoId) {
		formEntrar.hidden = false;
		return;
	}

	acaoEntrar.hidden = false;
	const estado = estadoDoGrupo(g);
	const botaoEntrar = footer.querySelector('.lfg-acao-entrar .lfg-entrar');
	botaoEntrar.disabled = estado !== 'compativel';
	/*
	 * O RÓTULO SEGUE O ESTADO, e o estado segue o CÓDIGO que o servidor mandou
	 * (`recusa`) -- ver `RECUSA_PARA_ESTADO`. A versão anterior tratava
	 * "fora-da-faixa" como o fim da linha do ternário, então qualquer recusa
	 * que não fosse cheio/offline saía como "Nível incompatível", inclusive
	 * quando o nível estava certo. Um rótulo que mente sobre a tranca manda o
	 * jogador consertar a coisa errada.
	 */
	botaoEntrar.textContent = ROTULO_BOTAO[estado] || 'Entrar no grupo';
}

function renderPanel() {
	renderPanelScroll();
	renderFooter();
}

function desenharTudo() {
	renderList();
	renderPanel();
}

function resetarFormularioCriar() {
	const r = raiz();
	r.querySelector('.lfg-nome-input').value = '';
	r.querySelector('input[name="lfg-criar-privado"][value="0"]').checked = true;
	r.querySelector('.lfg-criar-campo-senha').hidden = true;
	r.querySelector('.lfg-criar-senha-input').value = '';
	mostrarMotivoDaAcao('criar', '');
}

/** Delegação: os botões e mini-formulários do rodapé são ESTÁTICOS (nascem
 * uma vez no HTML), então um único listener, ligado uma vez em `init()`,
 * basta -- diferente da lista de cards, que é reconstruída a cada desenho e
 * por isso reata o listener a cada `renderList()`. */
function ligarBotoesDoRodape(r) {
	const footer = r.querySelector('.lfg-panel-footer');

	footer.addEventListener('click', function (evento) {
		// Mais específico primeiro: o botão de confirmar do mini-formulário de
		// senha também carrega a classe ".lfg-entrar" (mesmo rótulo "Entrar"
		// pedido no enunciado) -- checar ".lfg-senha-confirmar" antes evita que
		// o clique nele caia no ramo genérico de abrir o formulário de novo.
		if (evento.target.closest('.lfg-senha-confirmar')) {
			const g = obterGrupoSelecionado();
			if (!g) {
				return;
			}
			const campo = footer.querySelector('.lfg-form-senha-entrar .lfg-senha-input');
			mandar({ acao: 'entrar', grupoId: g.grupoId, senha: campo.value });
			return;
		}
		if (evento.target.closest('.lfg-senha-cancelar')) {
			LFGIdle.entrarSenhaPara = null;
			renderFooter();
			return;
		}
		if (evento.target.closest('.lfg-entrar')) {
			const g = obterGrupoSelecionado();
			if (!g) {
				return;
			}
			if (g.privado) {
				LFGIdle.entrarSenhaPara = g.grupoId;
				renderFooter();
				footer.querySelector('.lfg-form-senha-entrar .lfg-senha-input').focus();
			} else {
				mandar({ acao: 'entrar', grupoId: g.grupoId });
			}
			return;
		}

		if (evento.target.closest('.lfg-sair')) {
			mandar({ acao: 'sair' });
			return;
		}
		if (evento.target.closest('.lfg-teleportar')) {
			LFGIdle.teleportarParaOLider();
			return;
		}

		const botaoPriv = evento.target.closest('.lfg-priv-btn');
		if (botaoPriv) {
			const querPrivado = botaoPriv.dataset.privado === '1';
			if (!querPrivado) {
				LFGIdle.privacidadeEdicao = false;
				mandar({ acao: 'privacidade', privado: false });
			} else {
				LFGIdle.privacidadeEdicao = true;
				renderFooter();
				footer.querySelector('.lfg-form-senha-privar .lfg-senha-input').focus();
			}
			return;
		}
		if (evento.target.closest('.lfg-priv-cancelar')) {
			LFGIdle.privacidadeEdicao = false;
			renderFooter();
			return;
		}
		if (evento.target.closest('.lfg-priv-confirmar')) {
			const campo = footer.querySelector('.lfg-form-senha-privar .lfg-senha-input');
			if (!campo.value) {
				mostrarMotivoNoPainel('Defina uma senha para tornar o grupo privado.');
				return;
			}
			mandar({ acao: 'privacidade', privado: true, senha: campo.value });
			return;
		}

		if (evento.target.closest('.lfg-dissolver-cancelar')) {
			LFGIdle.confirmarDissolver = false;
			renderFooter();
			return;
		}
		if (evento.target.closest('.lfg-dissolver-sim')) {
			LFGIdle.confirmarDissolver = false;
			mandar({ acao: 'dissolver' });
			return;
		}
		if (evento.target.closest('.lfg-dissolver')) {
			LFGIdle.confirmarDissolver = true;
			renderFooter();
		}
	});
}

function ligarFormularioDeCriar(r) {
	const campoSenhaWrap = r.querySelector('.lfg-criar-campo-senha');
	const campoSenha = r.querySelector('.lfg-criar-senha-input');

	r.querySelectorAll('input[name="lfg-criar-privado"]').forEach(function (radio) {
		radio.addEventListener('change', function () {
			const marcado = r.querySelector('input[name="lfg-criar-privado"]:checked');
			const ehPrivado = !!marcado && marcado.value === '1';
			campoSenhaWrap.hidden = !ehPrivado;
			if (!ehPrivado) {
				campoSenha.value = '';
			}
		});
	});

	const campoNome = r.querySelector('.lfg-nome-input');

	r.querySelector('.lfg-criar').addEventListener('click', function () {
		const marcado = r.querySelector('input[name="lfg-criar-privado"]:checked');
		const privado = !!marcado && marcado.value === '1';
		if (privado && !campoSenha.value) {
			mostrarMotivoDaAcao('criar', 'Defina uma senha para o grupo privado.');
			return;
		}
		const corpo = { acao: 'criar', privado: privado };
		// Vazio é OMITIDO -- o servidor escolhe o padrão (nome do personagem),
		// não a janela. O `trim()` evita mandar só espaço como "nome escolhido".
		const nome = campoNome.value.trim();
		if (nome) {
			corpo.nome = nome;
		}
		if (privado) {
			corpo.senha = campoSenha.value;
		}
		mandar(corpo);
	});
}

LFGIdle.init = function init() {
	const r = raiz();

	r.querySelector('.lfg-close').addEventListener('click', function () {
		LFGIdle.fechar();
	});

	// A barra de titulo e a alca do arrasto -- e habilitar o arrasto e o que
	// liga o `_fixPositionOverflow` do GUIComponent, que grampeia a janela
	// dentro da viewport.
	this.draggable(r.querySelector('.lfg-titlebar'));

	r.querySelectorAll('.lfg-tab').forEach(function (aba) {
		aba.addEventListener('click', function () {
			LFGIdle.abaAtiva = aba.dataset.tab;
			lembrarAba(_preferences, LFGIdle.abaAtiva);
			sincronizarAbas();
		});
	});
	LFGIdle.abaAtiva = abaLembrada(_preferences, ABA_PADRAO, ABAS);
	sincronizarAbas();

	ligarBotoesDoRodape(r);
	ligarFormularioDeCriar(r);

	// Centralizar pela tela REAL, e nao pelo top/left do CSS.
	this._host.style.top = Math.max(0, (Renderer.height - WINDOW_HEIGHT) / 2) + 'px';
	this._host.style.left = Math.max(0, (Renderer.width - WINDOW_WIDTH) / 2) + 'px';

	desenharTudo();
};

/**
 * `Engine/MapEngine.js` chama `LFGIdle.append()` (e portanto este hook)
 * dentro de `MapRenderer.onLoad`, ou seja, ao TERMINAR o carregamento de todo
 * mapa novo -- login e toda troca de mapa, com a janela aberta ou fechada,
 * sempre (`GUIComponent.append()` chama `onAppend()` incondicionalmente, não
 * só na primeira vez). É por isso que os consertos abaixo (achados pela sonda
 * no jogo real, 03/09/2026, em duas rodadas) moram aqui e não precisam de
 * nenhum gancho novo em MapEngine.js.
 *
 * SEGUNDA RODADA DA SONDA: o primeiro conserto (reenviar `{acao:'listar'}`
 * daqui, síncrono) resolveu os DADOS mas não a JANELA -- duas corridas
 * mostraram sintomas DIFERENTES do mesmo ciclo de mapmove: numa, `.lfg-window`
 * perdeu `is-open` (conteúdo por trás correto, janela fechada); noutra, o
 * HOST inteiro (`#LFGIdle`) sumiu do documento. Sintoma variando entre
 * corridas é o retrato de uma corrida de verdade, não um defeito determinístico
 * -- e o candidato mais concreto rastreado (`Network/NetworkManager.js:141-166`
 * → `SocketHelpers/WebSocket.js:66-70`) é o `mandar({acao:'listar'})` ter
 * rodado SÍNCRONO, dentro do mesmo `append()`/`onAppend()` que
 * `Engine/MapEngine.js` chama ANTES de `Network.sendPacket(new
 * PACKET.CZ.NOTIFY_ACTORINIT())` (MapEngine.js:1020, "// Map loaded" -- o
 * ÚLTIMO pacote da própria sequência de entrada no mapa). Isso é exatamente a
 * família de bug já documentada neste projeto ("pacote do próprio jogador
 * espera o ACTORINIT", D-376): mandar ANTES do ACTORINIT arrisca o servidor
 * tratar a inscrição no push contra uma sessão que ele ainda não considera
 * pronta neste mapa. (Conferido e NÃO é um `throw` de `Network.sendPacket` --
 * `Socket.prototype.send`, WebSocket.js:66-70, já é defensivo: sem
 * `this.connected` ele só descarta o pacote em silêncio, nunca lança. Mas
 * "não lança" não é o mesmo que "seguro para o servidor receber antes da
 * entrada confirmada", e adiar continua sendo mais barato que provar os dois
 * lados do fio.)
 *
 * O conserto tem DUAS partes, e a segunda é a rede de segurança para quando a
 * primeira não bastar (o mecanismo exato do host/`.is-open` sumindo não foi
 * fixado com certeza -- nenhum `remove()`/`GUIComponent.remove()` desta janela
 * foi encontrado em nenhum caminho de mapmove, só o `append()` incondicional
 * de sempre; ver o relatório para o que foi conferido e descartado):
 *
 *  1. O `{acao:'listar'}` agora é ADIADO (`setTimeout(..., 0)`) -- nunca roda
 *     dentro do `append()`/`onAppend()` síncrono, então nada que ele fizer
 *     pode interromper o resto da cadeia de `append()` dos ~25 componentes
 *     RAGIDLE (MapEngine.js:844-1014) nem o `NOTIFY_ACTORINIT` que vem depois
 *     dela -- e por rodar num tique adiante, na prática ele já sai DEPOIS do
 *     ACTORINIT ter sido mandado.
 *  2. `LFGIdle.estavaAberta` (flag de MÓDULO, sobrevive a qualquer coisa que
 *     aconteça com o DOM) é a fonte da verdade de "o jogador queria a janela
 *     aberta" -- não a classe `is-open`, que é exatamente o que não estava
 *     confiável. Se ela estiver de pé, `onAppend()` REABRE a janela na hora
 *     (`classList.add` é idempotente: não faz mal nenhum se `is-open` já
 *     estava lá) -- o jogador nunca precisa reabrir o menu à mão depois de
 *     uma viagem.
 */
LFGIdle.onAppend = function onAppend() {
	/*
	 * A JANELA SUMIA DEPOIS DE TROCAR DE MAPA (achado #1, primeira rodada).
	 *
	 * Causa: este clamp supunha `Renderer.width/height` sempre maior que o
	 * tamanho da própria janela. Se o renderer reportasse uma dimensão MENOR
	 * que 880x600 neste instante exato -- e é exatamente esse instante, no
	 * meio de `MapRenderer.onLoad`, trocando de cena, que é suspeito de medir
	 * dimensões ainda não assentadas -- `Renderer.height - WINDOW_HEIGHT`
	 * ficava NEGATIVO. O `Math.min` de fora então forçava o resultado a esse
	 * teto negativo (ex.: "-600px"), não importa o quão razoável fosse
	 * `_preferences.y`: a janela continuava no DOM, só empurrada pra fora da
	 * área visível -- e ficava lá até o PRÓXIMO `append()` (a próxima troca
	 * de mapa) recalcular.
	 *
	 * O piso agora nunca fica menor que o próprio tamanho da janela: mesmo
	 * que `Renderer.height/width` venha zerado ou pequeno demais neste
	 * instante, a conta não empurra a janela pra fora -- na pior hipótese ela
	 * encosta em (0,0), visível, e não em algum canto fora da tela.
	 */
	const alturaMinima = Math.max(WINDOW_HEIGHT, Renderer.height);
	const larguraMinima = Math.max(WINDOW_WIDTH, Renderer.width);
	if (_preferences.x != null && _preferences.y != null) {
		this._host.style.top = Math.min(Math.max(0, _preferences.y), alturaMinima - WINDOW_HEIGHT) + 'px';
		this._host.style.left = Math.min(Math.max(0, _preferences.x), larguraMinima - WINDOW_WIDTH) + 'px';
	}

	if (!LFGIdle.estavaAberta) {
		return;
	}

	// A JANELA FICAVA FECHADA/AUSENTE ou com o RODAPÉ PRESO depois de trocar
	// de mapa com ela aberta -- ver o comentário grande acima da função.
	raiz().querySelector('.lfg-window').classList.add('is-open');

	// Adiado de propósito -- ver o comentário grande acima da função (a razão
	// de não rodar `mandar()` aqui dentro, síncrono).
	setTimeout(function () {
		// O jogador pode ter fechado a janela DE VERDADE nesse meio-tempo (o
		// timer já estava armado quando ele clicou no X) -- só reenvia se
		// "aberta" continuar sendo o que ele quer.
		if (LFGIdle.estavaAberta) {
			mandar({ acao: 'listar' });
		}
	}, 0);
};

LFGIdle.onRemove = function onRemove() {
	_preferences.x = parseInt(LFGIdle._host.style.left, 10) || 0;
	_preferences.y = parseInt(LFGIdle._host.style.top, 10) || 0;
	_preferences.save();
};

LFGIdle.abrir = function abrir() {
	const win = raiz().querySelector('.lfg-window');
	win.classList.add('is-open');
	LFGIdle.estavaAberta = true;
	mostrarMotivoDaAcao('criar', '');
	limparMotivoDoPainel();
	mandar({ acao: 'listar' });
};

/** Fechar desinscreve do push (`{acao:'fechar'}`) -- só manda o pacote
 * quando a janela REALMENTE estava aberta, pra não gerar uma ação por
 * clique perdido/tecla repetida. Zera `estavaAberta`: é o sinal de que o
 * FECHAMENTO foi escolha do jogador, não um efeito colateral de mapmove --
 * `onAppend()` só reabre a janela sozinha enquanto essa flag continua de pé. */
LFGIdle.fechar = function fechar() {
	const win = raiz().querySelector('.lfg-window');
	LFGIdle.estavaAberta = false;
	if (win.classList.contains('is-open')) {
		win.classList.remove('is-open');
		mandar({ acao: 'fechar' });
	}
};

LFGIdle.toggle = function toggle() {
	const win = raiz().querySelector('.lfg-window');
	if (win.classList.contains('is-open')) {
		LFGIdle.fechar();
	} else {
		LFGIdle.abrir();
	}
};

/**
 * IR ATÉ O LÍDER — a ÚNICA implementação do teleporte de party (D-984).
 *
 * Ela era o corpo do `if` de `.lfg-teleportar` lá em cima e virou método
 * público porque a janela de Grupo passou a oferecer o mesmo botão. O pedido
 * do dono foi explícito quanto a isso: *reutilize a lógica existente, nada de
 * uma segunda implementação montando o pacote de novo*.
 *
 * E não é preciosismo: `{acao:'teleportar'}` é do `CZ_RAGIDLE_LFG_ACAO`, e o
 * servidor responde com um `RESULTADO` que esta janela já sabe ler — o
 * 'teleportar' está em `ACOES_QUE_FECHAM`, então o sucesso fecha o Localizador
 * (o jogador saiu do mapa; a lista que ele estava vendo é de outro lugar).
 * Uma segunda cópia noutro componente perderia essa metade em silêncio.
 *
 * Quando a chamada vem da janela de Grupo, esse `fechar()` cai num Localizador
 * que já está fechado e não faz nada — `fechar()` só manda `{acao:'fechar'}`
 * se a janela estava mesmo aberta.
 *
 * QUEM PODE: o servidor decide, como sempre. A janela de Grupo só oferece o
 * botão a quem tem líder e não é o líder, que é a mesma condição em que o
 * rodapé daqui mostra `.lfg-acao-membro`.
 */
LFGIdle.teleportarParaOLider = function teleportarParaOLider() {
	mandar({ acao: 'teleportar' });
};

/*
 * ATENÇÃO ao `hookPacket`: ele SOBRESCREVE o handler anterior daquele opcode.
 * Estes dois são nossos e de mais ninguém.
 */
Network.hookPacket(PACKET.ZC.RAGIDLE_LFG_LISTA, function (pkt) {
	let dados = null;
	try {
		dados = JSON.parse(pkt.json);
	} catch (_erro) {
		return;
	}
	LFGIdle.grupos = dados && Array.isArray(dados.grupos) ? dados.grupos : [];
	// "meu" vem pronto -- { grupoId, souLider } ou null. Guardado como o
	// servidor mandou, sem reconstrução: reconstruir seria uma segunda
	// leitura da mesma decisão.
	LFGIdle.meu = dados && dados.meu && typeof dados.meu === 'object' ? dados.meu : null;
	sincronizarSelecao();
	desenharTudo();
});

Network.hookPacket(PACKET.ZC.RAGIDLE_LFG_RESULTADO, function (pkt) {
	let dados = null;
	try {
		dados = JSON.parse(pkt.json);
	} catch (_erro) {
		return;
	}
	if (!dados) {
		return;
	}

	if (dados.ok === false) {
		// A recusa é a frase do SERVIDOR, mostrada como veio -- inclusive
		// "Senha incorreta.": a janela não valida senha, só exibe a resposta.
		mostrarMotivoDaAcao(dados.acao, dados.motivo || 'Não foi possível.');
		return;
	}

	mostrarMotivoDaAcao(dados.acao, '');

	if (dados.acao === 'entrar') {
		LFGIdle.entrarSenhaPara = null;
	}
	if (dados.acao === 'privacidade') {
		LFGIdle.privacidadeEdicao = false;
	}
	if (dados.acao === 'dissolver') {
		LFGIdle.confirmarDissolver = false;
	}
	if (dados.acao === 'criar') {
		resetarFormularioCriar();
		LFGIdle.abaAtiva = 'grupos';
		lembrarAba(_preferences, LFGIdle.abaAtiva);
		sincronizarAbas();
	}

	if (ACOES_QUE_FECHAM.has(dados.acao)) {
		LFGIdle.fechar();
		return;
	}

	// Desenha com o que já temos agora (fecha o mini-formulário na hora); o
	// próximo push de ZC_RAGIDLE_LFG_LISTA (o servidor manda um depois de
	// qualquer ação que mude o estado) reconcilia o resto.
	desenharTudo();
});

/**
 * A TROCA DE PERSONAGEM ESQUECE O MEU PEDIDO de grupo -- mesma razão de
 * `LFGIdle.js` desde a versão anterior: `cleanGameUI()`/`onRestart()` não
 * recarregam a página, então todo estado de MÓDULO atravessa a troca.
 */
LFGIdle.limparEstadoDoPersonagem = function limparEstadoDoPersonagem() {
	const r = raiz();
	const janela = r.querySelector('.lfg-window');
	if (janela.classList.contains('is-open')) {
		mandar({ acao: 'fechar' });
	}

	LFGIdle.grupos = [];
	LFGIdle.meu = null;
	LFGIdle.selecionado = null;
	LFGIdle.entrarSenhaPara = null;
	LFGIdle.privacidadeEdicao = false;
	LFGIdle.confirmarDissolver = false;
	// O personagem novo não herda "a janela estava aberta" do anterior --
	// sem isto, `onAppend()` (ver o comentário grande em cima dela) reabriria
	// sozinha a janela do PRÓXIMO personagem só porque o de antes a deixou
	// aberta.
	LFGIdle.estavaAberta = false;

	// Nenhuma senha digitada pelo personagem anterior pode sobreviver na tela
	// do próximo -- os nós de senha (type=text mascarado por CSS, ver
	// .ri-senha-mascarada) são ESTÁTICOS (rodapé) ou persistem entre
	// reaberturas (aba Criar), então limpar o dado sozinho não bastaria.
	r.querySelectorAll('.lfg-senha-input, .lfg-criar-senha-input').forEach(function (input) {
		input.value = '';
	});
	// O nome digitado na aba Criar é um rascunho do personagem anterior --
	// não faz sentido oferecê-lo pronto pro personagem novo.
	r.querySelector('.lfg-nome-input').value = '';
	r.querySelectorAll('.lfg-panel-motivo, .lfg-criar-motivo').forEach(function (el) {
		el.hidden = true;
		el.textContent = '';
	});

	/*
	 * ZERAR O DADO NAO BASTA: `GUIComponent.remove()` so DESANEXA o host,
	 * entao o shadow DOM (com `is-open` e o HTML do personagem anterior)
	 * atravessa a troca. Ver `UI/Components/limpezaDeJanelaIdle.js`.
	 */
	fecharEEsquecer(r, '.lfg-window');
};

export default UIManager.addComponent(LFGIdle);
