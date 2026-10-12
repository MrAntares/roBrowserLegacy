/**
 * UI/Components/HuntAnalyzer/HuntAnalyzer.js
 *
 * "Analise de Caca" (D-943) -- a leitura das cacadas, no desenho do Hunt
 * Analyzer do Midgard: cronometro grande, uma linha por metrica, monstros e
 * drops com icone, e TRES abas (a cacada corrente + as duas ultimas).
 *
 * ── O CICLO E AUTOMATICO, E QUEM DIRIGE E O TIQUE DAQUI ──────────────────
 * O registro (`registroDaCaca.js`) guarda o estado e decide as transicoes
 * (entrar no mapa de caca INICIA, morrer ou voltar a cidade TRAVA, entrar de
 * novo ARQUIVA e recomeca); este arquivo so LE o mundo e entrega a situacao
 * a cada tique de 250 ms, via `atualizarSituacao()`:
 *
 *   - mapa de caca?  contextoDoMapa().ehCidade (UI/contextoDoMapa.js) -- ausente ou OBSOLETO
 *     (troca de mapa sondada e ainda sem resposta) vira "desconhecido", que
 *     nao transiciona nada. Mesma guarda de HuntButtonIdle.syncLabel().
 *   - morto?  Session.Entity.life com hp<=0 e hp_max>0 -- o MESMO criterio
 *     da DeathWindow (hp_max>0 e o que separa "morto" de "dado ainda nao
 *     populado", que nasce -1/-1).
 *
 * O tique roda desde o append, com a janela aberta OU fechada -- por isso o
 * ciclo anda e o historico se forma mesmo com ela escondida.
 *
 * ── DE ONDE VEM O DADO ───────────────────────────────────────────────────
 * Esta janela nao fisga pacote nenhum. Quem acumula e
 * `registroDaCaca.js`, alimentado pelos handlers que JA recebem os pacotes:
 *   - abate  -> Engine/MapEngine/Entity.js, onEntityVanish (VT.DEAD, TYPE_MOB)
 *   - exp    -> Engine/MapEngine/Entity.js, onNotifyExp (0x07f6)
 *   - item   -> Engine/MapEngine/Item.js, onItemPickup (com o ITID, D-943)
 *
 * O motivo de ser assim e duro: `Network.hookPacket()` guarda UM callback por
 * pacote (Network/NetworkManager.js:210). Fisgar qualquer um dos tres aqui
 * substituiria em silencio o handler nativo e apagaria o feed do canal Farm
 * -- sem erro, sem aviso, so a funcionalidade sumindo.
 *
 * ── POR QUE POLLING ──────────────────────────────────────────────────────
 * Pelo mesmo motivo de toda janela RAGIDLE (Correio, Mochila, Status): tique
 * de 250 ms lendo estado. O registro e barato de ler -- ele deriva tudo na
 * hora, sem guardar um segundo contador que pudesse divergir.
 *
 * ── O QUE ELA SE RECUSA A MOSTRAR ────────────────────────────────────────
 *   - **Zeny.** O servidor manda o mesmo ZC_PAR_CHANGE para o zeny do mob_db
 *     e para uma venda em loja (a ambiguidade esta registrada em
 *     Engine/MapEngine/Main.js:423-427). "Zeny/hora da caca" seria falso, e a
 *     nota da janela diz isso ao jogador em vez de esconder. E por isso nao
 *     ha "Venda NPC/h" como no Midgard: o cliente nao tem preco de item, e
 *     numero estimado sem fonte violaria a regra 1 do projeto.
 *   - **Taxa de drop por monstro.** O pacote do item que cai nao diz de qual
 *     mob veio, e no spot do dono morrem ate 4 juntos (D-325). A taxa e
 *     global, por 100 abates, e o rotulo fala.
 *   - **Qualquer ritmo antes de haver janela medida.** Ver
 *     MS_MINIMOS_PARA_RITMO em registroDaCaca.js: ate la sai "--".
 *   - **Projecao de nivel nas abas de historico.** O ritmo de uma cacada
 *     antiga sobre o "quanto falta" de HOJE misturaria duas epocas; as duas
 *     linhas de projecao so existem na aba Atual.
 */

import { contextoDoMapa } from 'UI/contextoDoMapa.js'; // 07/10/2026: o contexto sem a janela Idle
import Renderer from 'Renderer/Renderer.js';
import { localeDoIdioma } from 'Core/Idioma.js';
import Preferences from 'Core/Preferences.js';
import Session from 'Engine/SessionStorage.js';
import DB from 'DB/DBManager.js';
import Client from 'Core/Client.js';
import GUIComponent from 'UI/GUIComponent.js';
import BasicInfo from 'UI/Components/BasicInfo/BasicInfo.js';
import { atualizarSituacao, estimarMsAteONivel, ler, lerHistorico, zerarCacadaAtual } from './registroDaCaca.js';
import htmlText from './HuntAnalyzer.html?raw';
import cssText from './HuntAnalyzer.css?raw';
import { fecharEEsquecer } from '../limpezaDeJanelaIdle.js';
import { abaLembrada, lembrarAba } from '../memoriaDeAba.js';

/*
 * Estes DOIS numeros repetem os de HuntAnalyzer.css (":host" e ".ha-window").
 * A duplicacao e conhecida e esta anotada nas duas pontas -- cicatriz D-341.
 * Quem mudar um muda o outro.
 */
const WINDOW_WIDTH = 360;
const WINDOW_HEIGHT = 540;

/** Mesma cadencia das outras janelas RAGIDLE. */
const POLL_INTERVAL_MS = 250;

/**
 * Abaixo disto o "parado ha X" nao aparece.
 *
 * Num idle o intervalo entre dois abates e de segundos, entao um aviso que
 * acendesse a cada respiro seria ruido piscando. Ele existe para o caso que
 * importa: a caca esta viva mas nada morre (spot vazio, personagem preso) e
 * o ritmo na tela ainda descreve um passado que nao volta.
 */
const OCIOSO_VISIVEL_MS = 15_000;


const HuntAnalyzer = new GUIComponent('HuntAnalyzer', cssText);

HuntAnalyzer.render = () => htmlText;

/* CROSS: mesmo modo das demais janelas RAGIDLE flutuantes. */
HuntAnalyzer.mouseMode = GUIComponent.MouseMode.CROSS;

const _preferences = Preferences.get(
	'HuntAnalyzer',
	{
		x: null,
		y: null,
		/* A aba escolhida sobrevive ao F5 (portao D-797, memoriaDeAba.js).
		   Uma aba de historico lembrada sem historico ainda (o F5 apaga as
		   cacadas arquivadas) cai pra Atual em sincronizarAbas — sem erro. */
		aba: null,
		/* O modo enxuto (08/09/2026) sobrevive ao F5, como o compacto do BasicInfoIdle. */
		compacto: false
	},
	1
);

/* ─── Modo enxuto (08/09/2026, ordem do dono) ─── */
function aplicarCompacto() {
	const root = _root();
	if (!root) {
		return;
	}
	const compacto = !!_preferences.compacto;
	// `_root()` e o ShadowRoot (sem classList): a classe vai no #HuntAnalyzer de
	// dentro e no HOST (a altura de 540px e do :host). Sem as guardas, um
	// `toggle` em undefined derrubava o init inteiro da HUD (tela preta, 08/09).
	const raiz = root.querySelector ? root.querySelector('#HuntAnalyzer') : null;
	if (raiz && raiz.classList) raiz.classList.toggle('is-compact', compacto);
	const host = HuntAnalyzer._host;
	if (host && host.classList) host.classList.toggle('is-compact', compacto);
	const botao = root.querySelector('.ha-minimize');
	if (botao) {
		botao.setAttribute('title', compacto ? 'Restaurar' : 'Recolher');
		botao.setAttribute('aria-label', compacto ? 'Restaurar a janela completa' : 'Recolher para o modo enxuto');
	}
}

HuntAnalyzer.alternarCompacto = function alternarCompacto() {
	_preferences.compacto = !_preferences.compacto;
	_preferences.save();
	aplicarCompacto();
};

let _pollTimer = null;
/** A aba na tela: 0 = atual, 1 = ultima, 2 = penultima. */
let _aba = 0;
/** Assinaturas das listas, para nao reconstruir DOM a cada tique. */
let _sigRanking = null;
let _sigDrops = null;

/*
 * A raiz e a SHADOW ROOT, com o host como reserva -- mesmo `_root()` de
 * CorreioIdle.js e StatusIdle.js, e o mesmo que GUIComponent.getRoot() faz.
 * Buscar por `.ui` devolve null aqui e todo querySelector abaixo falha.
 */
function _root() {
	return HuntAnalyzer._shadow || HuntAnalyzer._host;
}

/* ─── Formatacao ───────────────────────────────────────────────────────── */

const TRACO = '—';

/** Inteiro em pt-BR. `null` vira travessao -- nunca zero de consolo. */
function numero(valor) {
	if (valor === null || valor === undefined || !isFinite(valor)) {
		return TRACO;
	}
	return Math.round(valor).toLocaleString(localeDoIdioma());
}

/** O cronometro do Midgard: HH:MM:SS, sempre com as tres casas. */
function cronometro(ms) {
	const total = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
	const h = Math.floor(total / 3600);
	const min = Math.floor((total % 3600) / 60);
	const s = total % 60;
	const dois = n => String(n).padStart(2, '0');
	return `${dois(h)}:${dois(min)}:${dois(s)}`;
}

/**
 * Duracao legivel. Duas casas de grandeza no maximo ("1h 12min", "12min 5s"),
 * porque a terceira nao muda decisao nenhuma.
 */
function duracao(ms) {
	if (ms === null || ms === undefined || !isFinite(ms) || ms < 0) {
		return TRACO;
	}
	const total = Math.round(ms / 1000);
	const h = Math.floor(total / 3600);
	const min = Math.floor((total % 3600) / 60);
	const s = total % 60;

	if (h > 0) {
		return min > 0 ? `${h}h ${min}min` : `${h}h`;
	}
	if (min > 0) {
		return s > 0 ? `${min}min ${s}s` : `${min}min`;
	}
	return `${s}s`;
}

/**
 * "1.234 (0,3%)" -- o total com a fatia que ele representa do nivel, como o
 * Midgard mostra. Sem teto conhecido (BasicInfo ainda sem base_exp_next, ou
 * aba de historico) sai so o total: um % sem denominador seria inventado.
 */
function totalComPct(total, teto) {
	const base = numero(total);
	if (!teto || teto <= 0 || !total) {
		return base;
	}
	const pct = ((total * 100) / teto).toLocaleString(localeDoIdioma(), {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	});
	return `${base} (${pct}%)`;
}

/* ─── Leitura do mundo (as entradas do ciclo automatico) ───────────────── */

/**
 * Morto = hp<=0 com hp_max>0. O hp_max>0 e o que separa "morto" de "dado
 * ainda nao populado" (Entity.life nasce -1/-1) -- o mesmo criterio corrigido
 * da DeathWindow (ver o cabecalho de DeathWindow.js sobre o personagem que
 * loga ja morto).
 */
function estaMorto() {
	const life = Session.Entity && Session.Entity.life;
	return !!(life && life.hp_max > 0 && life.hp <= 0);
}

/**
 * A situacao que o registro consome. Contexto ausente ou OBSOLETO (mapa
 * trocado, resposta ainda no fio) vira `emMapaDeCaca: null` -- desconhecido
 * nao trava cacada viva nem inicia cacada nova. So o booleano estrito conta,
 * na mesma linha de `ehDropDeCaca`.
 */
function situacaoDoMundo() {
	const ctx = contextoDoMapa();
	let emMapaDeCaca = null;
	if (ctx) {
		emMapaDeCaca = ctx.ehCidade === true ? false : ctx.ehCidade === false ? true : null;
	}
	return {
		emMapaDeCaca,
		morto: estaMorto(),
		mapa: ctx ? ctx.mapa || null : null,
		rotuloDoMapa: ctx ? ctx.rotuloDoMapa || null : null
	};
}

/* ─── Desenho ──────────────────────────────────────────────────────────── */

function texto(root, seletor, valor) {
	const el = root.querySelector(seletor);
	if (el) {
		el.textContent = valor;
	}
}

/**
 * A projecao de nivel: QUANTO falta, e quanto tempo isso da no ritmo medido.
 *
 * Os dois numeros respondem coisas diferentes e por isso aparecem juntos
 * (pedido do dono, 25/08/2026): o tempo depende do ritmo e muda a cada onda,
 * a exp que falta e um fato do personagem e nao se mexe com a sorte do spot.
 */
function projecao(restante, porHoraDaExp) {
	const falta = Number(restante) || 0;
	if (falta <= 0) {
		return TRACO;
	}
	return `${numero(falta)} (${duracao(estimarMsAteONivel(falta, porHoraDaExp))})`;
}

/** A faixa de estado da cabine: ponto colorido + frase + linha do mapa. */
function desenharEstado(root, r, aoVivo) {
	const estadoEl = root.querySelector('.ha-estado');
	const textoEl = root.querySelector('.ha-estado-texto');
	const mapaEl = root.querySelector('.ha-mapa');
	if (!estadoEl || !textoEl || !mapaEl) {
		return;
	}

	let classe = 'ociosa';
	let frase = 'Aguardando caça';
	let linhaDoMapa = 'A medição começa quando você entrar num mapa de caça.';

	const ondeFoi = r.rotuloDoMapa || r.mapa || '';

	if (r.fase === 'ativa') {
		classe = 'ativa';
		frase = 'Medindo';
		if (r.ociosoMs >= OCIOSO_VISIVEL_MS) {
			frase += ` · parado há ${duracao(r.ociosoMs)}`;
		}
		linhaDoMapa = ondeFoi;
	} else if (r.fase === 'travada') {
		classe = 'travada';
		frase = r.motivoDoFim === 'morte' ? 'Travada — você morreu' : 'Travada — você está na cidade';
		linhaDoMapa = ondeFoi;
	} else if (r.fase === 'encerrada') {
		/* Aba de historico: cinza, com "quando" em vez de estado vivo. */
		frase =
			r.motivoDoFim === 'morte'
				? 'Encerrada — morte'
				: r.motivoDoFim === 'mapa'
					? 'Encerrada — trocou de mapa'
					: 'Encerrada — voltou à cidade';
		const haQuanto = r.encerradaEm ? duracao(Date.now() - r.encerradaEm) : null;
		linhaDoMapa = ondeFoi + (haQuanto ? `${ondeFoi ? ' · ' : ''}há ${haQuanto}` : '');
	}

	estadoEl.classList.remove('ha-estado--ociosa', 'ha-estado--ativa', 'ha-estado--travada');
	estadoEl.classList.add(`ha-estado--${classe === 'encerrada' ? 'ociosa' : classe}`);
	textoEl.textContent = frase;
	mapaEl.hidden = !linhaDoMapa;
	mapaEl.textContent = linhaDoMapa;
	mapaEl.title = linhaDoMapa;

	/* O Zerar so faz sentido sobre a cacada corrente. */
	const zerar = root.querySelector('.ha-zerar');
	if (zerar) {
		zerar.hidden = !aoVivo;
	}

}

/**
 * O ranking de monstros: linha por especie com contagem, participacao e a
 * barra de proporcao por tras. Reconstroi SO quando o conteudo mudou -- a
 * assinatura inclui o valor, senao a lista congelaria com o ranking estavel
 * (o caso comum, e portanto o que passaria despercebido).
 */
function desenharMonstros(root, ranking) {
	/* O mobId entra na assinatura: um id que chega DEPOIS do primeiro
	   desenho (mob anonimo que ganhou identidade) precisa redesenhar, senao
	   a linha ficaria sem avatar por "nao ter mudado". */
	const sig = ranking.map(m => `${m.nome}:${m.abates}:${m.mobId}`).join('|');
	const lista = root.querySelector('.ha-ranking');
	const vazio = root.querySelector('.ha-ranking-vazio');
	const tipos = root.querySelector('.ha-monstros-tipos');

	if (tipos) {
		tipos.textContent = `${ranking.length} ${ranking.length === 1 ? 'tipo' : 'tipos'}`;
	}
	if (vazio) {
		vazio.hidden = ranking.length > 0;
	}
	if (sig === _sigRanking || !lista) {
		return;
	}
	_sigRanking = sig;

	const total = ranking.reduce((soma, m) => soma + m.abates, 0);
	lista.textContent = '';

	for (const m of ranking) {
		const parte = total > 0 ? Math.round((m.abates * 100) / total) : 0;

		const li = document.createElement('li');
		li.className = 'ha-monstro';

		const barra = document.createElement('span');
		barra.className = 'ha-monstro-barra';
		barra.style.width = `${parte}%`;

		/*
		 * O avatar da especie — o MESMO /ragidle/mobs/<id>.png do Mapa de
		 * Caca (HuntMap.js:827) e da Config idle. O span fica mesmo sem
		 * imagem: e ele que segura a coluna do grid; o onerror esconde so a
		 * IMG, e a linha continua alinhada com as outras.
		 */
		const avatar = document.createElement('span');
		avatar.className = 'ha-monstro-avatar';
		if (m.mobId !== null && m.mobId !== undefined) {
			const img = document.createElement('img');
			img.alt = '';
			img.onerror = () => {
				img.hidden = true;
			};
			img.src = `/ragidle/mobs/${m.mobId}.png`;
			avatar.appendChild(img);
		}

		const nome = document.createElement('span');
		nome.className = 'ha-monstro-nome';
		nome.textContent = m.nome;
		/* O nome completo no title: a coluna corta com ellipsis. */
		nome.title = m.nome;

		const abates = document.createElement('span');
		abates.className = 'ha-monstro-abates';
		abates.textContent = numero(m.abates);

		const pct = document.createElement('span');
		pct.className = 'ha-monstro-parte';
		pct.textContent = total > 0 ? `${parte}%` : TRACO;

		li.append(barra, avatar, nome, abates, pct);
		lista.appendChild(li);
	}
}

/**
 * Icone do drop: tenta /ragidle/item/<ITID>.png (o builder que publica os
 * icones em paralelo) e cai pro bmp do cliente -- MESMA dupla de caminhos de
 * MochilaIdle.setItemIcon, pro visual nao divergir entre as duas janelas.
 */
function definirIconeDoDrop(img, itid) {
	const info = DB.getItemInfo(itid);
	const resName = info && info.identifiedResourceName;
	img.onerror = () => {
		img.onerror = null;
		if (resName) {
			Client.loadFile(DB.INTERFACE_PATH + 'item/' + resName + '.bmp', dataURI => {
				img.src = dataURI;
			});
		} else {
			img.hidden = true;
		}
	};
	img.src = `/ragidle/item/${itid}.png`;
}

/** A grade de drops do Midgard: quadrado com icone e badge de quantidade. */
function desenharDrops(root, itens) {
	const sig = itens.map(i => `${i.nome}:${i.quantidade}`).join('|');
	const grade = root.querySelector('.ha-drops');
	const vazio = root.querySelector('.ha-drops-vazio');
	const tipos = root.querySelector('.ha-drops-tipos');

	if (tipos) {
		tipos.textContent = `${itens.length} ${itens.length === 1 ? 'tipo' : 'tipos'}`;
	}
	if (vazio) {
		vazio.hidden = itens.length > 0;
	}
	if (sig === _sigDrops || !grade) {
		return;
	}
	_sigDrops = sig;

	grade.textContent = '';

	for (const item of itens) {
		const tile = document.createElement('div');
		tile.className = 'ha-drop';
		tile.title = `${item.nome} x${item.quantidade}`;

		if (item.itid !== null && item.itid !== undefined) {
			const img = document.createElement('img');
			img.className = 'ha-drop-icone';
			img.alt = '';
			definirIconeDoDrop(img, item.itid);
			tile.appendChild(img);
		} else {
			/* Item registrado antes de D-943 nao trazia o id: a inicial do
			   nome segura o quadrado em vez de um icone quebrado. */
			const letra = document.createElement('span');
			letra.className = 'ha-drop-letra';
			letra.textContent = (item.nome || '?').charAt(0).toUpperCase();
			tile.appendChild(letra);
		}

		const qtd = document.createElement('span');
		qtd.className = 'ha-drop-qtd';
		qtd.textContent = numero(item.quantidade);
		tile.appendChild(qtd);

		grade.appendChild(tile);
	}
}

/**
 * Desenha UM retrato (a cacada corrente ou uma do historico) na tela.
 * `aoVivo` liga o que so faz sentido no presente: %, projecoes e o Zerar.
 */
function desenharRetrato(root, r, aoVivo) {
	texto(root, '.ha-cronometro', cronometro(r.decorridoMs));
	desenharEstado(root, r, aoVivo);

	/*
	 * O QUE FALTA vem da BasicInfo NATIVA, que e onde o cliente ja guarda
	 * base_exp/base_exp_next (ela recebe ZC_PAR_CHANGE normalmente). Ler dela
	 * e o mesmo que BasicInfoIdle faz -- nao ha segunda copia deste estado.
	 * So na aba Atual: o teto de HOJE nao descreve uma cacada de ontem.
	 */
	const nativa = aoVivo && BasicInfo.getUI ? BasicInfo.getUI() : null;
	const tetoBase = nativa ? nativa.base_exp_next || 0 : 0;
	const tetoClasse = nativa ? nativa.job_exp_next || 0 : 0;

	texto(root, '.ha-exp-base-hora', numero(r.expBasePorHora));
	texto(root, '.ha-exp-base', totalComPct(r.expBase, tetoBase));
	texto(root, '.ha-exp-classe-hora', numero(r.expClassePorHora));
	texto(root, '.ha-exp-classe', totalComPct(r.expClasse, tetoClasse));

	for (const linha of root.querySelectorAll('.ha-metrica--projecao')) {
		linha.hidden = !aoVivo;
	}
	if (aoVivo) {
		const restanteBase = nativa ? (nativa.base_exp_next || 0) - (nativa.base_exp || 0) : 0;
		const restanteClasse = nativa ? (nativa.job_exp_next || 0) - (nativa.job_exp || 0) : 0;
		texto(root, '.ha-falta-base', projecao(restanteBase, r.expBasePorHora));
		texto(root, '.ha-falta-classe', projecao(restanteClasse, r.expClassePorHora));
	}

	texto(root, '.ha-abates-hora', numero(r.abatesPorHora));
	texto(root, '.ha-abates', numero(r.abatesTotal));
	texto(root, '.ha-itens-hora', numero(r.itensPorHora));
	texto(root, '.ha-itens-total', numero(r.itensTotal));
	/*
	 * UMA casa decimal, e nao `numero()`: com carta a 0,01% a taxa honesta e
	 * "0,5 por 100" e o arredondamento inteiro mostraria "1" — o dobro.
	 */
	texto(
		root,
		'.ha-itens-100',
		r.itensPor100Abates === null ? TRACO : r.itensPor100Abates.toLocaleString(localeDoIdioma(), { maximumFractionDigits: 1 })
	);

	desenharMonstros(root, r.ranking);
	desenharDrops(root, r.itens);
}

/** Habilita as abas conforme o historico existe, e mantem `_aba` valida. */
function sincronizarAbas(root, historico) {
	/* A aba na tela pode deixar de existir (troca de personagem zera o
	   historico): cair pra Atual DIRETO, sem trocarDeAba() — ela chama
	   tique() e isto roda DENTRO do tique. */
	if (_aba > historico.length) {
		_aba = 0;
		_sigRanking = null;
		_sigDrops = null;
	}
	const abas = root.querySelectorAll('.ha-aba');
	for (const aba of abas) {
		const indice = parseInt(aba.dataset.aba, 10);
		if (indice > 0) {
			const tem = historico.length >= indice;
			aba.disabled = !tem;
			aba.title = tem ? '' : 'Nenhuma caçada concluída ainda';
		}
		aba.classList.toggle('is-active', indice === _aba);
		/* O papel de aba pede o estado dito, nao so pintado (role=tablist
		   no HTML): leitor de tela sem isto anuncia tres botoes iguais. */
		aba.setAttribute('aria-selected', indice === _aba ? 'true' : 'false');
	}
}

function trocarDeAba(indice) {
	if (_aba === indice) {
		return;
	}
	_aba = indice;
	lembrarAba(_preferences, String(indice));
	/* As listas sao de OUTRA cacada agora: sem zerar a assinatura, a tela
	   ficaria com o ranking anterior "por nao ter mudado". */
	_sigRanking = null;
	_sigDrops = null;
	tique();
}

function tique() {
	const root = _root();
	const gid = Session.Entity ? Session.Entity.GID : null;

	/*
	 * O CICLO ANDA AQUI, janela aberta ou fechada: e este tique que percebe
	 * "entrou no mapa de caca" / "morreu" / "voltou pra cidade" e faz o
	 * registro iniciar, travar e arquivar. Ver o cabecalho.
	 */
	if (gid !== null && gid !== undefined) {
		atualizarSituacao(gid, situacaoDoMundo());
	}

	/*
	 * O DESENHO PARA AQUI COM A JANELA FECHADA (auditoria de desempenho,
	 * 11/09/2026).
	 *
	 * O que vem abaixo e so pintura: `sincronizarAbas` reconstroi a fileira de
	 * abas e `desenharRetrato` reescreve a tabela inteira. Com a janela fechada
	 * ninguem ve nada disso, e mesmo assim rodava 4x por segundo, durante a
	 * cacada toda -- que e exatamente quando o celular tem menos folga (17fps
	 * medidos com o processador em 1/4, gargalo na thread principal).
	 *
	 * **O ciclo ACIMA continua rodando de qualquer jeito**, e a ordem aqui nao
	 * e arbitraria: e ele que percebe "entrou no mapa de caca" / "morreu" /
	 * "voltou pra cidade" e faz o registro iniciar, travar e arquivar. Guardar
	 * o tique INTEIRO atras da janela quebraria a leitura da cacada -- ver o
	 * cabecalho do arquivo.
	 *
	 * E reabrir nao mostra dado velho: `HuntAnalyzer.toggle` chama `tique()`
	 * no ramo que abre a janela, entao o primeiro quadro dela ja vem pintado.
	 */
	/*
	 * INTERRUPTOR DE MEDICAO (11/09/2026): `window.__ri_hud_guarda = false`
	 * devolve o comportamento ANTIGO (desenhar de janela fechada).
	 *
	 * Irmao do `__ri_culling` do EntityManager e do `__ri_hud_compara` do
	 * BasicInfoIdle, pela mesma razao escrita la: duas CORRIDAS nao separam o
	 * efeito da variancia, e o A/B precisa acontecer na mesma cena.
	 *
	 * Sem ele, medir o ganho desta guarda exigiria reverter o codigo, rodar, e
	 * comparar com outra sessao — que e exatamente o que produz numero que anda
	 * sozinho.
	 */
	const guardaLigada = typeof window === 'undefined' || window.__ri_hud_guarda !== false;
	const win = root.querySelector('.ha-window');
	if (guardaLigada && (!win || !win.classList.contains('is-open'))) {
		return;
	}

	const historico = lerHistorico(gid);
	sincronizarAbas(root, historico);

	if (_aba === 0) {
		desenharRetrato(root, ler(gid), true);
	} else {
		const retrato = historico[_aba - 1];
		if (retrato) {
			desenharRetrato(root, retrato, false);
		}
	}
}

/* ─── Ciclo de vida ────────────────────────────────────────────────────── */

HuntAnalyzer.init = function init() {
	const root = _root();

	this.draggable(root.querySelector('.ha-header'));

	root.querySelector('.ha-minimize').addEventListener('click', e => {
		e.stopPropagation();
		HuntAnalyzer.alternarCompacto();
	});
	aplicarCompacto();

	root.querySelector('.ha-close').addEventListener('click', () => {
		HuntAnalyzer.toggle();
	});

	root.querySelector('.ha-zerar').addEventListener('click', () => {
		/* Descarta so a cacada CORRENTE -- o historico fica (ver o porque em
		   zerarCacadaAtual). As assinaturas tambem: senao a lista velha
		   ficaria na tela por nao "ter mudado" em relacao ao ultimo desenho. */
		zerarCacadaAtual();
		_sigRanking = null;
		_sigDrops = null;
		tique();
	});

	root.querySelector('.ha-abas').addEventListener('click', e => {
		const aba = e.target.closest('.ha-aba');
		if (aba && !aba.disabled) {
			trocarDeAba(parseInt(aba.dataset.aba, 10));
		}
	});


	/* A aba lembrada (D-797). Restaurada aqui e nao no primeiro tique: o
	   tique roda a cada 250 ms e re-restaurar a cada giro prenderia o
	   jogador na aba gravada. */
	_aba = parseInt(abaLembrada(_preferences, '0', ['0', '1', '2']), 10);

	this._host.style.top = Math.max(0, (Renderer.height - WINDOW_HEIGHT) / 2) + 'px';
	this._host.style.left = Math.max(0, (Renderer.width - WINDOW_WIDTH) / 2) + 'px';
};

/*
 * `onAppend` SO REPOSICIONA NA PRIMEIRA VEZ (14/09/2026, relato do dono: "usar
 * a asa de mosca automatica esta mudando a posicao de algumas janelas, como
 * a do hunt analyzer").
 *
 * A CAUSA: `MapEngine.js` (`onMapChange`) chama `HuntAnalyzer.append()` em
 * TODO carregamento de mapa — comentario ao lado (D-1385): *"cada
 * carregamento de mapa (a Asa de Mosca inclusive)"*. E `GUIComponent.append()`
 * dispara `onAppend()` TODA VEZ que e chamado, sem checar se a janela ja
 * estava aberta (`GUIComponent.js:308-364` — nenhum guard ali). Resultado: a
 * cada teleporte — inclusive a Asa automatica, que dispara sozinha e com
 * frequencia enquanto o jogador caca — a posicao salva (`_preferences`, so
 * atualizada quando a janela FECHA de vez) sobrescrevia o arrasto que o
 * jogador tinha acabado de fazer e nunca chegou a salvar. Parecia
 * "aleatorio" porque na verdade era "a ultima posicao salva, nem sempre a
 * que o jogador via na tela".
 *
 * O CONSERTO fica local a este arquivo, e nao no `GUIComponent` compartilhado
 * (`.append()` e chamado por ~50 janelas em `onMapChange`; mudar o
 * comportamento la sem auditar cada uma arriscaria quebrar quem DEPENDE de
 * `onAppend` rodando a cada mapa — WorldMap e MiniMap, por exemplo, plausivelmente
 * atualizam dado por mapa desse jeito). Aqui, `_jaAberta` separa as duas
 * coisas que `onAppend` fazia juntas: reposicionar (so na PRIMEIRA vez que a
 * janela aparece, ou depois de fechada de vez) e atualizar os numeros
 * (`tique`/`iniciarPolling`, que continuam corretos a cada carregamento de
 * mapa — a caçada pode ter avançado nesse meio tempo).
 */
let _jaAberta = false;

HuntAnalyzer.onAppend = function onAppend() {
	if (!_jaAberta) {
		if (_preferences.x != null && _preferences.y != null) {
			this._host.style.top = Math.min(Math.max(0, _preferences.y), Renderer.height - WINDOW_HEIGHT) + 'px';
			this._host.style.left = Math.min(Math.max(0, _preferences.x), Renderer.width - WINDOW_WIDTH) + 'px';
		}
		_jaAberta = true;
	}

	tique();
	iniciarPolling();
};

HuntAnalyzer.onRemove = function onRemove() {
	pararPolling();
	salvarPosicao();
	_jaAberta = false;
};

function salvarPosicao() {
	_preferences.x = parseInt(HuntAnalyzer._host.style.left, 10) || 0;
	_preferences.y = parseInt(HuntAnalyzer._host.style.top, 10) || 0;
	_preferences.save();
}

function iniciarPolling() {
	pararPolling();
	_pollTimer = setInterval(tique, POLL_INTERVAL_MS);
}

function pararPolling() {
	if (_pollTimer != null) {
		clearInterval(_pollTimer);
		_pollTimer = null;
	}
}

/**
 * Mantem a janela dentro da tela -- o mesmo cuidado das demais: uma posicao
 * salva com a janela maior pode cair fora depois de um resize.
 */
function manterNaTela() {
	const host = HuntAnalyzer._host;
	const topo = parseInt(host.style.top, 10) || 0;
	const esq = parseInt(host.style.left, 10) || 0;
	host.style.top = Math.min(Math.max(0, topo), Math.max(0, Renderer.height - WINDOW_HEIGHT)) + 'px';
	host.style.left = Math.min(Math.max(0, esq), Math.max(0, Renderer.width - WINDOW_WIDTH)) + 'px';
}

HuntAnalyzer.toggle = function toggle() {
	const root = _root();
	const win = root.querySelector('.ha-window');
	if (win.classList.contains('is-open')) {
		win.classList.remove('is-open');
		salvarPosicao();
	} else {
		win.classList.add('is-open');
		HuntAnalyzer.focus();
		manterNaTela();
		tique();
	}
};

/**
 * A TROCA DE PERSONAGEM ESQUECE A LEITURA DA CACADA (28/08/2026).
 *
 * Voltar ao menu de personagem NAO recarrega a pagina: `onRestartAnswer` chama
 * `cleanGameUI()` e `onRestart()`, sem `GameEngine.reload()` (o reload so
 * acontece no SAIR). Todo estado de MODULO atravessa a troca — e este arquivo
 * guarda a aba ativa e as assinaturas do ranking e dos drops.
 *
 * O relatorio de caca e por personagem — o REGISTRO (sessao + historico) se
 * limpa sozinho pela troca de GID em registroDaCaca.js; aqui limpa-se o que e
 * da TELA. Chamada por `cleanGameUI()` em Engine/MapEngine.js, junto com os
 * outros componentes RAGIDLE. Quem somar estado de personagem aqui soma a
 * linha correspondente ABAIXO, e o portao
 * `limpeza-da-troca-de-personagem.test.ts` (no repo do servidor) reprova se
 * esquecer.
 */
HuntAnalyzer.limparEstadoDoPersonagem = function limparEstadoDoPersonagem() {
	_aba = 0;
	_sigRanking = null;
	_sigDrops = null;
	/*
	 * ZERAR O DADO NAO BASTA: `GUIComponent.remove()` so DESANEXA o host,
	 * entao o shadow DOM (com `is-open` e o HTML do personagem anterior)
	 * atravessa a troca. Ver `UI/Components/limpezaDeJanelaIdle.js`.
	 */
	fecharEEsquecer(_root(), '.ha-window');
};

export default HuntAnalyzer;
