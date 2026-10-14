/**
 * UI/Components/BotMenu/BotMenu.js
 *
 * RAGIDLE: o MENU DO BOT NOVO (07/10/2026, pacote "Novo Bot V5"). Substitui a
 * janela "Idle" (IdleConfig) como lugar de configurar o automatico. O combate
 * e 100% o do Modo Classico: o Bot do servidor decide e pede pela mesma
 * fronteira do clique do jogador, e esta janela so o liga, desliga e
 * configura.
 *
 * TRES PECAS:
 * - `estadoDoBot.js`: serverConfig x rascunho, pedidos em voo, status - sem DOM;
 * - este arquivo: a COSTURA com o jogo (pacote, arrasto, posicao, pilha);
 * - `servidor/bot/*` (no rag-idle-master): a decisao e a validacao.
 *
 * O PACOTE TEM UM DONO SO: o `ZC_RAGIDLE_BOT` (0x0fb1) e fisgado aqui.
 * O ponto de entrada do menu (o item "Bot" do TopMenuIdle) so aparece quando o
 * servidor anunciou a capacidade (`temCapacidade`), e nao depende do modo
 * classico estar ligado ou desligado.
 *
 * This file is part of the ragidle fork of ROBrowser.
 */
import Renderer from 'Renderer/Renderer.js';
import Preferences from 'Core/Preferences.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import htmlText from './BotMenu.html?raw';
import cssText from './BotMenu.css?raw';
import { fecharEEsquecer } from '../limpezaDeJanelaIdle.js';
import { escreverTexto } from 'UI/escreverSeMudou.js';
import { criarEstadoDoBot, explicacaoDoStatus, fraseDoErro, fraseDoStatus } from './estadoDoBot.js';
import { desenharEditorDeSkills } from './editorDeSkills.js';
import { desenharRodizio } from './editorDoRodizio.js';
import { definirCuraComoAtaque, temCuraQueFereMortoVivo } from './edicaoDeSkills.js';
import { desenharColeta, desenharSobrevivencia, desenharSuporte } from './editorDeManutencao.js';
import { desenharFlechas } from './editorDeFlechas.js';
import { desenharPerfis } from './editorDePerfis.js';
import { desenharAvancado, desenharConsumiveis } from './editorDeConsumiveis.js';
import { desenharPorSkill } from './editorPorSkill.js';
import RiIcones from 'UI/ri-icones.js';
import { aplicarIconeDoItem } from 'UI/itemNaTela.js';
import DB from 'DB/DBManager.js';
import Session from 'Engine/SessionStorage.js';
import { esquecer as esquecerContexto, marcarObsoleto, receberDoServidor } from 'UI/contextoDoMapa.js';

const WINDOW_WIDTH = 980;
const WINDOW_HEIGHT = 720;

/*
 * AS SECOES NA BARRA LATERAL, na ordem do mockup do dono (08/10/2026): nome, subtitulo, glifo e o
 * emblema do cabecalho (arte real `/ragidle/ui-icons/` quando ha uma que diga a mesma coisa; senao o
 * glifo). `flechas` NAO e aba: e o cartao dentro de Ataque. Secao sem backend nao entra na barra.
 * O Armazem saiu do menu nos ajustes do dono de 09/10/2026: mesmo anunciado por um servidor velho, nao volta.
 */
const ORDEM_DAS_SECOES = Object.freeze(['cacada', 'ataque', 'suporte', 'sobrevivencia', 'consumiveis', 'coleta', 'postura', 'perfis', 'avancado']);

const NOME_DA_SECAO = Object.freeze({
	cacada: 'Caçada',
	ataque: 'Ataque',
	sobrevivencia: 'Sobrevivência',
	suporte: 'Suporte',
	coleta: 'Coleta',
	postura: 'Grupo',
	perfis: 'Perfis',
	consumiveis: 'Consumíveis',
	avancado: 'Avançado'
});

const SUB_DA_SECAO = Object.freeze({
	cacada: 'Mapas e monstros',
	ataque: 'Skills e comportamento',
	suporte: 'Buffs e cura',
	sobrevivencia: 'Poções e HP/SP',
	coleta: 'Coleta de itens',
	postura: 'Postura e cooperação',
	perfis: 'Salvar e carregar',
	consumiveis: 'Poções e Asa de Mosca',
	avancado: 'O que o Bot está fazendo'
});

const GLIFO_DA_SECAO = Object.freeze({
	cacada: 'botAlvo',
	ataque: 'botEspadas',
	suporte: 'botSuporte',
	sobrevivencia: 'botCoracao',
	coleta: 'botColeta',
	postura: 'botGrupo',
	perfis: 'botPerfil',
	consumiveis: 'botConsumiveis',
	avancado: 'botAvancado'
});

const EMBLEMA_DA_SECAO = Object.freeze({
	ataque: 'caca',
	suporte: 'skills',
	postura: 'grupo',
	perfis: 'personagem'
});

const TITULO_DA_SECAO = Object.freeze({
	cacada: ['Configurações de Caçada', 'Onde e quem o Bot caça: o raio de busca e os monstros que ele nunca escolhe.'],
	ataque: ['Configurações de Ataque', 'Quais habilidades o Bot usa, em que ordem, e como ele ataca.'],
	suporte: ['Configurações de Suporte', 'Buffs mantidos e curas por limiar de HP, em você ou no grupo.'],
	sobrevivencia: ['Configurações de Sobrevivência', 'Quando beber poção de HP e de SP, e quando sentar para descansar.'],
	coleta: ['Configurações de Coleta', 'Pegar os itens do chão dentro do raio, menos os ignorados.'],
	postura: ['Postura e Grupo', 'Como o Bot combate e como ele coopera com o grupo.'],
	perfis: ['Perfis', 'Configurações nomeadas deste personagem. Usar um perfil nunca liga o Bot.'],
	consumiveis: ['Consumíveis', 'Poções de velocidade e a Asa de Mosca automática (benefício VIP).'],
	avancado: ['Avançado', 'Por que o Bot está fazendo, ou não, o que você vê, e o que ele fez nesta sessão.']
});

const NOME_CURTO_DA_POSTURA = Object.freeze({
	tank: 'Tanque',
	'melee-dps': 'Corpo a corpo',
	'ranged-dps': 'À distância',
	'ranged-buff-ataque': 'Suporte e ataque',
	'ranged-buff': 'Só suporte'
});

const POSTURA_PADRAO = Object.freeze({ tipo: 'melee-dps', fallbackMelee: false });

/** O bloco `postura` da config (Fase 8); ausente (servidor velho) = o padrao. */
function lerPostura(c) {
	const p = (c && c.postura) || {};
	return {
		tipo: typeof p.tipo === 'string' ? p.tipo : POSTURA_PADRAO.tipo,
		fallbackMelee: typeof p.fallbackMelee === 'boolean' ? p.fallbackMelee : POSTURA_PADRAO.fallbackMelee
	};
}

/** O nome do item que o cliente conhece (a lista de ignorados da coleta); null = desconhecido. */
function nomeDoItem(itemId) {
	const it = DB.getItemInfo(itemId);
	const nome = it && it.identifiedDisplayName;
	return typeof nome === 'string' && nome && nome !== 'Unknown Item' ? nome : null;
}

function larguraNaTela() {
	return Math.min(WINDOW_WIDTH, Math.max(0, Renderer.width - 16));
}

function alturaNaTela() {
	return Math.min(WINDOW_HEIGHT, Math.max(0, Renderer.height - 24));
}

const BotMenu = new GUIComponent('BotMenu', cssText);

/**
 * A MOCHILA para o seletor de itens ignorados da Coleta (correcoes pos-QA, 08/10/2026; 05 secao 3: escolher
 * pelo nome e pelo icone, sem ID digitado). Quem liga a janela ao jogo (o MapEngine) troca esta leitura pela
 * lista do Inventory; sem ela, vazia.
 */
BotMenu.lerMochila = () => [];

function mochilaDoBot() {
	let lista;
	try {
		lista = BotMenu.lerMochila() || [];
	} catch {
		lista = [];
	}
	return lista
		.filter(i => i && Number.isInteger(i.ITID) && i.ITID > 0)
		.map(i => ({ itemId: i.ITID, quantidade: typeof i.count === 'number' ? i.count : 1 }));
}

BotMenu.render = () => htmlText.replace(/<!--RI_ICONE:(\w+)-->/g, (_, chave) => RiIcones[chave] || '');

BotMenu.mouseMode = GUIComponent.MouseMode.CROSS;

const _preferences = Preferences.get('BotMenu', { x: null, y: null, aba: 'cacada' }, 1.0);

function enviar(corpo) {
	const pkt = new PACKET.CZ.RAGIDLE_BOT_ACAO();
	pkt.json = JSON.stringify(corpo);
	Network.sendPacket(pkt);
}

const _estado = criarEstadoDoBot({ enviar });

/** A especie da lista por monstro no Avancado do Ataque (so desta tela); 'geral' = ainda nao escolhida. */
let _escopoDasSkills = 'geral';

/** Quem ouve a capacidade (o TopMenuIdle mostra o item "Bot" so com ela). */
const _ouvintesDaCapacidade = new Set();

function _root() {
	return BotMenu._shadow || BotMenu._host;
}

function el(seletor) {
	const r = _root();
	return r ? r.querySelector(seletor) : null;
}

/** O servidor anunciou o Bot novo nesta sessao? */
BotMenu.temCapacidade = function temCapacidade() {
	return _estado.secoes().length > 0;
};

BotMenu.aoMudarCapacidade = function aoMudarCapacidade(fn) {
	_ouvintesDaCapacidade.add(fn);
	return () => _ouvintesDaCapacidade.delete(fn);
};

/** Quem ouve o ON/OFF fora da janela (o botao "Ataque auto", CombatCornerIdle). */
const _ouvintesDoLigado = new Set();

/**
 * O ON/OFF DO BOT PARA QUEM FICA FORA DA JANELA (12/10/2026, pedido do dono: o botao "Ataque auto"
 * voltou). `ligado` e so o que o servidor CONFIRMOU; `pendente` = um ON/OFF em voo; `erro` = o da
 * ultima resposta (o `ligar` e o `desligar` o zeram ao pedir).
 */
BotMenu.estadoDoLigado = function estadoDoLigado() {
	const s = _estado.estado();
	return { ligado: s.ligado, pendente: s.pendenteLigarDesligar !== null, erro: s.erro };
};

/**
 * O MESMO gesto do interruptor ON/OFF da janela: liga se desligado, desliga se ligado. Com um ON/OFF
 * em voo, nao pede outro (devolve false). O interruptor e o botao "Ataque auto" passam os dois por aqui.
 */
BotMenu.alternarLigado = function alternarLigado() {
	const s = _estado.estado();
	if (s.pendenteLigarDesligar !== null) {
		return false;
	}
	if (s.ligado) {
		_estado.desligar();
	} else {
		_estado.ligar();
	}
	desenhar();
	return true;
};

BotMenu.aoMudarLigado = function aoMudarLigado(fn) {
	_ouvintesDoLigado.add(fn);
	return () => _ouvintesDoLigado.delete(fn);
};

function avisarLigado() {
	const estado = BotMenu.estadoDoLigado();
	for (const fn of _ouvintesDoLigado) {
		try {
			fn(estado);
		} catch (err) {
			console.error('[BotMenu] ouvinte do ligado falhou', err);
		}
	}
}

/** Para os testes da costura e as provas de tela. */
BotMenu._estado = _estado;

/** Conexao nova com o mesmo personagem (reconexao, volta do "Dormir"): ver `estadoDoBot.novaConexao`. */
BotMenu.novaConexaoDoServidor = function novaConexaoDoServidor() {
	_estado.novaConexao();
};

BotMenu.limparEstadoDoPersonagem = function limparEstadoDoPersonagem() {
	_estado.reiniciar();
	_escopoDasSkills = 'geral';
	// D-2385: o desenho do personagem anterior nao vale como "ultimo desenho" do novo.
	_janelaSuja = true;
	esquecerContexto();
	fecharEEsquecer(_root(), '.bm-window');
	avisarCapacidade();
	avisarLigado();
};

BotMenu.init = function init() {
	const root = _root();
	if (!root) {
		return;
	}
	const fechar = el('.bm-close');
	if (fechar) {
		fechar.addEventListener('click', e => {
			e.stopImmediatePropagation();
			closeWindow();
		});
	}
	const titulo = el('.bm-titlebar');
	if (titulo) {
		this.draggable(titulo);
	}
	el('.bm-liga').addEventListener('click', onClickLiga);
	el('.bm-aplicar').addEventListener('click', () => {
		_estado.aplicar();
		desenhar();
	});
	// "Salvar e Iniciar": salva (se ha rascunho) e so liga depois da confirmacao do servidor.
	el('.bm-iniciar').addEventListener('click', () => {
		_estado.aplicarELigar();
		desenhar();
	});
	el('.bm-perfil-escolha').addEventListener('change', e => {
		const nome = e.target.value;
		if (nome) {
			_estado.perfilAplicar(nome);
		}
		desenhar();
	});
	el('.bm-descartar').addEventListener('click', () => {
		_estado.descartar();
		desenhar();
	});
	el('.bm-recarregar').addEventListener('click', () => {
		_estado.recarregar();
		desenhar();
	});
	el('.bm-cacar').addEventListener('change', e => editar(c => ({ ...c, cacar: e.target.checked })));
	el('.bm-raio').addEventListener('input', e => editar(c => ({ ...c, raioDePercepcao: Number(e.target.value) })));
	root.querySelectorAll('input[name="bm-modo"]').forEach(r =>
		r.addEventListener('change', e => editar(c => ({ ...c, modoDeAtaque: e.target.value })))
	);
	el('.bm-cura-ataque-ligada').addEventListener('change', e => editar(c => definirCuraComoAtaque(c, e.target.checked)));
	for (const lista of _root().querySelectorAll('.bm-monstros')) {
		lista.addEventListener('click', onClickMonstro);
		// Teclado: Espaco e Enter fazem o mesmo gesto do clique.
		lista.addEventListener('keydown', e => {
			if (e.key === ' ' || e.key === 'Enter') {
				e.preventDefault();
				onClickMonstro(e);
			}
		});
	}
	root.querySelectorAll('input[name="bm-postura"]').forEach(r =>
		r.addEventListener('change', e => editar(c => ({ ...c, postura: { ...lerPostura(c), tipo: e.target.value } })))
	);
	el('.bm-fallback').addEventListener('change', e =>
		editar(c => ({ ...c, postura: { ...lerPostura(c), fallbackMelee: e.target.checked } }))
	);
	// Tecla dentro da janela nao vira atalho do jogo nem ESC da pilha por acidente.
	el('.bm-corpo').addEventListener('keydown', e => e.stopPropagation());
	this._host.style.top = Math.max(0, (Renderer.height - alturaNaTela()) / 2) + 'px';
	this._host.style.left = Math.max(0, (Renderer.width - larguraNaTela()) / 2) + 'px';
};

BotMenu.onAppend = function onAppend() {
	if (_preferences.x != null && _preferences.y != null) {
		this._host.style.top = Math.min(Math.max(0, _preferences.y), Math.max(0, Renderer.height - alturaNaTela())) + 'px';
		this._host.style.left = Math.min(Math.max(0, _preferences.x), Math.max(0, Renderer.width - larguraNaTela())) + 'px';
	}
	// Mapa novo: o servidor pode ter invalidado a intencao; o estado operacional vem dele.
	// O contexto do mapa anterior nao vale ate a resposta chegar (`UI/contextoDoMapa.js`).
	marcarObsoleto();
	_estado.pedirEstado();
};

BotMenu.onRemove = function onRemove() {
	savePosition();
};

function savePosition() {
	_preferences.x = parseInt(BotMenu._host.style.left, 10) || 0;
	_preferences.y = parseInt(BotMenu._host.style.top, 10) || 0;
	_preferences.save();
}

BotMenu.toggle = function toggle() {
	const win = el('.bm-window');
	if (!win) {
		return;
	}
	if (win.classList.contains('is-open')) {
		closeWindow();
	} else {
		win.classList.add('is-open');
		BotMenu.focus();
		_estado.pedirEstado();
		desenhar();
	}
};

function closeWindow() {
	const win = el('.bm-window');
	if (win) {
		win.classList.remove('is-open');
	}
	savePosition();
}

function editar(fn) {
	_estado.editar(fn);
	desenhar();
}

function onClickLiga(e) {
	e.stopImmediatePropagation();
	BotMenu.alternarLigado();
}

function onClickMonstro(e) {
	const item = e.target.closest('[data-especie]');
	if (!item) {
		return;
	}
	const especie = Number(item.getAttribute('data-especie'));
	editar(c => {
		const lista = new Set(c.especiesVetadas || []);
		if (lista.has(especie)) {
			lista.delete(especie);
		} else {
			lista.add(especie);
		}
		return { ...c, especiesVetadas: [...lista] };
	});
}

/** As secoes da BARRA: as anunciadas, na ordem do mockup (o cartao das Flechas mora dentro de Ataque). */
function secoesDaBarra(secoes) {
	return ORDEM_DAS_SECOES.filter(s => secoes.includes(s));
}

function abaAtual(secoes) {
	const barra = secoesDaBarra(secoes);
	return barra.includes(_preferences.aba) ? _preferences.aba : barra[0];
}

function desenharAbas(secoes) {
	const abas = el('.bm-abas');
	const atual = abaAtual(secoes);
	const barra = secoesDaBarra(secoes);
	const chave = barra.join(',') + '|' + atual;
	if (abas.getAttribute('data-chave') !== chave) {
		abas.setAttribute('data-chave', chave);
		abas.innerHTML = '';
		for (const s of barra) {
			const b = document.createElement('button');
			b.type = 'button';
			b.className = 'ri-tab bm-aba' + (s === atual ? ' is-active' : '');
			b.setAttribute('role', 'tab');
			b.setAttribute('aria-selected', String(s === atual));
			// O subtitulo vai por CSS (`::after`): o nome acessivel e o texto da aba ficam so o nome.
			b.setAttribute('data-sub', SUB_DA_SECAO[s] || '');
			b.setAttribute('aria-description', SUB_DA_SECAO[s] || '');
			b.innerHTML = RiIcones[GLIFO_DA_SECAO[s]] || '';
			b.appendChild(document.createTextNode(NOME_DA_SECAO[s] || s));
			b.addEventListener('click', () => {
				_preferences.aba = s;
				_preferences.save();
				desenhar();
			});
			abas.appendChild(b);
		}
	}
	_root()
		.querySelectorAll('.bm-secao')
		.forEach(sec => {
			sec.hidden = sec.getAttribute('data-secao') !== atual;
		});
	desenharCabecalhoDaSecao(atual);
}

/** O cabecalho do painel: o emblema (arte real ou glifo), o titulo e a descricao da secao. */
function desenharCabecalhoDaSecao(atual) {
	const [titulo, desc] = TITULO_DA_SECAO[atual] || [NOME_DA_SECAO[atual] || '', ''];
	el('.bm-secao-titulo').textContent = titulo;
	el('.bm-secao-desc').textContent = desc;
	const emblema = el('.bm-emblema');
	if (emblema.getAttribute('data-emblema') === atual) {
		return;
	}
	emblema.setAttribute('data-emblema', atual || '');
	emblema.innerHTML = '';
	const arte = EMBLEMA_DA_SECAO[atual];
	if (arte) {
		const img = document.createElement('img');
		img.alt = '';
		img.src = '/ragidle/ui-icons/' + arte + '.webp';
		img.onerror = () => {
			emblema.innerHTML = RiIcones[GLIFO_DA_SECAO[atual]] || '';
		};
		emblema.appendChild(img);
	} else {
		emblema.innerHTML = RiIcones[GLIFO_DA_SECAO[atual]] || '';
	}
}

/**
 * A ATUALIZACAO DO AVANCADO (D4-A3): o diagnostico so vem na RESPOSTA ao `pedir` (o status nao o leva), entao
 * a aba o pede ao abrir e a cada 5 s enquanto estiver visivel e a janela aberta. Parada fora disso.
 */
const PERIODO_DO_AVANCADO_MS = 5000;
let _relogioDoAvancado = null;

function sincronizarAtualizacaoDoAvancado(secoes) {
	const visivel = secoes.includes('avancado') && abaAtual(secoes) === 'avancado' && el('.bm-window').classList.contains('is-open');
	if (!visivel) {
		if (_relogioDoAvancado !== null) {
			clearInterval(_relogioDoAvancado);
			_relogioDoAvancado = null;
		}
		return;
	}
	if (_relogioDoAvancado === null) {
		_estado.pedirEstado();
		_relogioDoAvancado = setInterval(() => {
			if (_estado.estado().carregado) {
				_estado.pedirEstado();
			}
		}, PERIODO_DO_AVANCADO_MS);
	}
}

/*
 * O REDESENHO SO DO QUE MUDOU (D-2385, 14/10/2026, a leva de desempenho do cliente).
 *
 * O servidor manda ~0,4 status por segundo por Bot ligado, e cada um passava por `desenhar()`, que refazia a
 * janela INTEIRA: as listas do rodizio, das skills, dos monstros, das pocoes, dos perfis... (`innerHTML = ''`
 * e tudo de novo), mesmo com a janela FECHADA. O status quase sempre so troca o `status` (e o `contexto`):
 * desde a D-2366 do servidor, os blocos pesados so vem no pacote quando mudaram.
 *
 * Duas regras, as duas EXATAS:
 * 1. Janela fechada: o dado fica guardado (o `_estado` ja o guardou) e a janela fica SUJA; nada no DOM. Quem
 *    fica de fora da janela (o botao "Ataque auto", `avisarLigado`) e o relogio do Avancado (que para com a
 *    janela fechada) seguem como antes. Na proxima vez que ela desenhar aberta, desenha TUDO uma vez.
 * 2. Janela aberta: cada bloco guarda as ENTRADAS do ultimo desenho; entradas iguais, o bloco nao e refeito.
 *    As entradas sao os objetos que o bloco le (comparados por identidade: o `_estado` troca o objeto de cada
 *    bloco SO quando ele chega no pacote, e o rascunho a cada edicao) ou, no topo e no Avancado, o TEXTO que
 *    eles mostram: o status chega com um objeto novo em todo pacote, quase sempre com a mesma frase. Cada desenhador e uma funcao das entradas dele: com as mesmas entradas, refaze-lo deixaria
 *    o DOM igual (o oraculo do teste compara contra o caminho que redesenha sempre).
 *
 * A UNICA ENTRADA DE FORA DO PACOTE e a mochila do seletor de ignorados da Coleta, lida na hora enquanto o
 * seletor esta aberto: com ele aberto, a Coleta redesenha sempre, como antes.
 */
let _janelaSuja = true;
/** bloco -> as entradas do ultimo desenho. */
const _entradasDoBloco = new Map();
/** So os testes ligam (o oraculo): o caminho de antes, que redesenha tudo sempre, aberta ou fechada. */
let _redesenharSempre = false;
/** Os contadores do portao (D-2385): desenhos da janela e de cada bloco. */
const _contagem = { janela: 0, blocos: {} };

function janelaAberta() {
	const win = el('.bm-window');
	return !!(win && win.classList.contains('is-open'));
}

function mesmasEntradas(antes, agora) {
	if (!antes || antes.length !== agora.length) {
		return false;
	}
	for (let i = 0; i < agora.length; i++) {
		if (!Object.is(antes[i], agora[i])) {
			return false;
		}
	}
	return true;
}

/**
 * Desenha o bloco se as entradas mudaram. `entradas` e uma funcao: ela e lida de novo DEPOIS do desenho, porque
 * o desenho do Ataque pode trocar a especie escolhida (`_escopoDasSkills`); guardar a de antes faria o proximo
 * desenho achar uma mudanca que nao houve.
 */
function bloco(nome, entradas, desenharOBloco, forcar = false) {
	if (!_redesenharSempre && !forcar && mesmasEntradas(_entradasDoBloco.get(nome), entradas())) {
		return;
	}
	_contagem.blocos[nome] = (_contagem.blocos[nome] || 0) + 1;
	desenharOBloco();
	_entradasDoBloco.set(nome, entradas());
}

/** Para os testes: os contadores, a limpeza deles e o caminho de antes (o oraculo). */
BotMenu._contagemDeDesenhos = function contagemDeDesenhos() {
	return { janela: _contagem.janela, blocos: { ..._contagem.blocos } };
};
BotMenu._zerarContagemDeDesenhos = function zerarContagemDeDesenhos() {
	_contagem.janela = 0;
	_contagem.blocos = {};
};
BotMenu._redesenharSempre = function redesenharSempre(ligado) {
	_redesenharSempre = !!ligado;
};

function desenhar() {
	// Todo gesto e toda resposta do servidor passam por aqui: o botao "Ataque auto" segue o mesmo estado.
	avisarLigado();
	const root = _root();
	if (!root) {
		return;
	}
	if (!_redesenharSempre && !janelaAberta()) {
		// Fechada: so suja. O relogio do Avancado para (o mesmo que o `sincronizar` fazia aqui, fechada).
		_janelaSuja = true;
		sincronizarAtualizacaoDoAvancado(_estado.secoes());
		return;
	}
	if (_janelaSuja) {
		_entradasDoBloco.clear();
		_janelaSuja = false;
	}
	_contagem.janela++;
	const s = _estado.estado();
	const ctx = s.contexto || {};
	/*
	 * O TOPO pelas entradas que ele MOSTRA, e nao pelo objeto do status: todo status chega com um objeto novo
	 * (o JSON do pacote), quase sempre com a mesma frase ("Atacando Poring" de novo). Comparar o que vai para
	 * a tela deixa o topo parado enquanto a frase nao muda.
	 */
	const pendenteOnOff = s.pendenteLigarDesligar !== null;
	const textoDoLiga = pendenteOnOff ? '...' : s.ligado ? 'ON' : 'OFF';
	const fraseDoTopo = s.carregado ? fraseDoStatus(s.status) : 'Carregando...';
	const suspenso = s.status && s.status.codigo === 'suspenso-manual';
	const textoDoMapa = ctx.rotuloDoMapa || ctx.mapa || s.mapa || '';
	const naCidade = !!ctx.ehCidade;
	bloco(
		'topo',
		// O texto do botao sai do `ligado` e do em voo; o "suspenso" sai da frase (so o suspenso-manual a tem).
		() => [s.ligado, pendenteOnOff, fraseDoTopo, textoDoMapa, naCidade],
		() => {
			const liga = el('.bm-liga');
			liga.setAttribute('aria-checked', String(s.ligado));
			liga.classList.toggle('is-pendente', pendenteOnOff);
			escreverTexto(el('.bm-liga-texto'), textoDoLiga);
			liga.title = s.ligado ? 'Bot ligado: clique para desligar' : 'Bot desligado: clique para ligar';
			el('.bm-window').classList.toggle('is-ligado', s.ligado);
			const status = el('.bm-status');
			escreverTexto(status, fraseDoTopo);
			status.classList.toggle('is-suspenso', suspenso);
			escreverTexto(el('.bm-mapa'), textoDoMapa);
			escreverTexto(el('.bm-mapa-rotulo'), naCidade ? 'Você está na cidade' : 'Você está em');
		}
	);
	bloco('perfil', () => [s.perfis, s.perfilAtivo, s.pendentePerfil], () => desenharEscolhaDoPerfil(s));
	bloco('flecha-atual', () => [s.municoes], () => desenharFlechaAtual(s));
	// O header mostra o perfil (de onde veio a config) e a postura confirmada (05 secao 3).
	const posturaConfirmada = s.serverConfig && s.serverConfig.postura ? NOME_CURTO_DA_POSTURA[s.serverConfig.postura.tipo] : null;
	bloco(
		'perfil-ativo',
		() => [s.perfilAtivo, posturaConfirmada],
		() => escreverTexto(el('.bm-perfil-ativo'), [s.perfilAtivo, posturaConfirmada].filter(Boolean).join(' · '))
	);

	const secoes = _estado.secoes();
	bloco('abas', () => [secoes, _preferences.aba], () => desenharAbas(secoes));
	sincronizarAtualizacaoDoAvancado(secoes);

	const c = s.editConfig;
	if (c) {
		const lim = (s.capacidades && s.capacidades.limites) || {};
		bloco(
			'cacada',
			() => [c, s.capacidades],
			() => {
				el('.bm-cacar').checked = !!c.cacar;
				const raio = el('.bm-raio');
				raio.min = String(lim.raioMinimo || 3);
				raio.max = String(lim.raioMaximo || 30);
				raio.value = String(c.raioDePercepcao);
				escreverTexto(el('.bm-raio-valor'), String(c.raioDePercepcao));
				root.querySelectorAll('input[name="bm-modo"]').forEach(r => {
					r.checked = r.value === c.modoDeAtaque;
				});
			}
		);
		bloco('monstros', () => [c, s.monstros], () => desenharMonstros(s, c));
		bloco('postura', () => [c, s.grupo], () => desenharPostura(s, c));
		bloco(
			'ataque',
			() => [c, s.skills, s.monstros, s.capacidades, _escopoDasSkills, !!(s.contexto && s.contexto.ehCidade)],
			() => desenharAtaque(s, c, lim)
		);
		desenharManutencao(s, c, secoes, lim);
	}

	bloco(
		'recado',
		() => [s.erro, s.mudouNoServidor],
		() => {
			const recado = el('.bm-recado');
			recado.classList.remove('is-aviso');
			if (s.erro) {
				recado.textContent = fraseDoErro(s.erro);
			} else if (s.mudouNoServidor) {
				recado.textContent = 'A configuração mudou no servidor enquanto você editava. Aplique para manter a sua ou recarregue.';
				recado.classList.add('is-aviso');
			} else {
				recado.textContent = '';
			}
		}
	);
	bloco(
		'problemas',
		() => [s.problemas],
		() => {
			const problemas = el('.bm-problemas');
			problemas.innerHTML = '';
			for (const p of s.problemas || []) {
				const li = document.createElement('li');
				li.textContent = p.mensagem;
				problemas.appendChild(li);
			}
		}
	);
	bloco(
		'rodape',
		() => [s.conflito, s.mudouNoServidor, s.dirty, s.pendenteAplicar, s.ligado, s.pendenteLigarDesligar, s.carregado],
		() => {
			el('.bm-recarregar').hidden = !(s.conflito || s.mudouNoServidor);
			el('.bm-aplicar').disabled = !s.dirty || s.pendenteAplicar;
			escreverTexto(el('.bm-aplicar-texto'), s.pendenteAplicar ? 'Salvando...' : 'Salvar');
			el('.bm-descartar').disabled = !s.dirty || s.pendenteAplicar;
			// "Salvar e Iniciar" so com o Bot desligado (ligado, o Salvar ja basta).
			const iniciar = el('.bm-iniciar');
			iniciar.hidden = s.ligado;
			iniciar.disabled = s.pendenteAplicar || s.pendenteLigarDesligar !== null || !s.carregado;
		}
	);
}

/*
 * A SECAO ATAQUE (ajustes do dono, 09/10/2026): na frente, o modo e o RODIZIO (as skills que o Bot usa, na
 * ordem da lista geral, cada uma com o seu liga/desliga); o nivel fixo, o escopo de alvos por skill e a lista
 * propria por monstro ficam no "Avancado" recolhido. Sem mudanca de contrato: a lista geral e a ordem do
 * rodizio e desligar e `skills.porSkill[id].ativa = false`.
 */
function desenharAtaque(s, c, lim) {
	const secao = el('[data-secao="ataque"]');
	const monstros = s.monstros || [];
	const tetoGeral = lim.skillsNaListaGeral || 3;
	desenharRodizio(secao.querySelector('.bm-rodizio-caixa'), { config: c, skills: s.skills, teto: tetoGeral }, editar);
	// Bug #12 de 13/10: o interruptor da Cura contra morto-vivo (so com uma cura que fere morto-vivo e um servidor que o cumpre).
	const cartaoCura = secao.querySelector('.bm-cura-ataque');
	cartaoCura.hidden = !temCuraQueFereMortoVivo(s.skills);
	secao.querySelector('.bm-cura-ataque-ligada').checked = c.curaComoAtaque === true;

	// AVANCADO, lista por monstro: so especies (a lista geral e o rodizio da frente).
	const comRegra = Object.keys(c.skills.porMonstro || {}).map(Number);
	const especies = [...monstros.map(m => m.especie), ...comRegra];
	if (!especies.includes(_escopoDasSkills)) {
		_escopoDasSkills = especies.length > 0 ? especies[0] : 'geral';
	}
	desenharEditorDeSkills(
		secao,
		{
			config: c,
			skills: s.skills,
			monstros,
			escopo: _escopoDasSkills,
			teto: { geral: tetoGeral, porMonstro: lim.skillsPorMonstro || 3 }
		},
		editar,
		escopo => {
			_escopoDasSkills = escopo;
			desenhar();
		}
	);
	const caixa = secao.querySelector('.bm-skills');
	const geral = secao.querySelector('.bm-escopo option[value="geral"]');
	if (geral) {
		geral.remove();
	}
	if (_escopoDasSkills === 'geral') {
		caixa.hidden = true;
	}
	/*
	 * POR MONSTRO VAZIO (correcoes pos-QA, 08/10/2026): sem monstro no mapa e sem lista salva, o motivo em vez
	 * de um bloco em branco: na cidade nao ha monstros; fora dela, o mapa nao tem.
	 */
	const vazio = secao.querySelector('.bm-por-monstro-vazio');
	vazio.hidden = !(Array.isArray(s.skills) && caixa.hidden);
	vazio.textContent = s.contexto && s.contexto.ehCidade
		? 'Na cidade não há monstros. Entre num mapa de caça para montar a lista de cada monstro.'
		: 'Nenhum monstro neste mapa para montar uma lista própria.';
	desenharPorSkill(secao.querySelector('.bm-por-skill'), { config: c, skills: s.skills, monstros, tetoGeral }, editar);
}

/** O perfil atual no topo: escolher um perfil e o mesmo verbo imediato da aba Perfis. */
function desenharEscolhaDoPerfil(s) {
	const sel = el('.bm-perfil-escolha');
	const perfis = s.perfis || [];
	const chave = JSON.stringify([perfis.map(p => p.nome), s.perfilAtivo, s.pendentePerfil]);
	if (sel.getAttribute('data-chave') === chave) {
		return;
	}
	sel.setAttribute('data-chave', chave);
	sel.innerHTML = '';
	const nenhum = document.createElement('option');
	nenhum.value = '';
	nenhum.textContent = perfis.length ? 'Configuração própria' : 'Nenhum perfil salvo';
	sel.appendChild(nenhum);
	for (const p of perfis) {
		const o = document.createElement('option');
		o.value = p.nome;
		o.textContent = p.nome;
		sel.appendChild(o);
	}
	sel.value = s.perfilAtivo && perfis.some(p => p.nome === s.perfilAtivo) ? s.perfilAtivo : '';
	sel.disabled = perfis.length === 0 || !!s.pendentePerfil;
}

/** A flecha vestida agora, na faixa de status (so quando o personagem usa municao). */
function desenharFlechaAtual(s) {
	const vestida = (s.municoes || []).find(m => m.vestida);
	el('.bm-flecha-atual-passo').hidden = !vestida;
	el('.bm-flecha-atual').textContent = vestida ? vestida.nome : '';
}

/** Sobrevivencia, Suporte e Coleta (Fase 6): so desenha a secao que o servidor anunciou. */
function desenharManutencao(s, c, secoes, lim) {
	// D-2385: cada secao e um bloco com as entradas que o desenhador dela le (ver `bloco`).
	if (secoes.includes('sobrevivencia')) {
		bloco('sobrevivencia', () => [c, s.pocoes, s.capacidades], () =>
			desenharSobrevivencia(
				el('[data-secao="sobrevivencia"]'),
				{ config: c, pocoes: s.pocoes, teto: lim.pocoesPorLista || 6, nomeDoItem },
				editar
			)
		);
	}
	if (secoes.includes('suporte')) {
		bloco('suporte', () => [c, s.skills, s.capacidades], () =>
			desenharSuporte(el('[data-secao="suporte"]'), { config: c, skills: s.skills, teto: lim.skillsDeSuporte || 64 }, editar)
		);
	}
	if (secoes.includes('coleta')) {
		// Com o seletor de ignorados ABERTO a lista le a mochila na hora (`seletorDeItem.js`): redesenha sempre.
		const seletor = el('[data-secao="coleta"] .bm-seletor');
		bloco(
			'coleta',
			() => [c, s.capacidades],
			() =>
				desenharColeta(
					el('[data-secao="coleta"]'),
					{
						config: c,
						teto: lim.itensIgnoradosNaColeta || 300,
						raioMinimo: lim.raioDeColetaMinimo || 1,
						raioMaximo: lim.raioDeColetaMaximo || 20,
						nomeDoItem,
						mochila: mochilaDoBot,
						iconeDoItem: aplicarIconeDoItem
					},
					editar
				),
			!!(seletor && !seletor.hidden)
		);
	}
	if (secoes.includes('consumiveis')) {
		bloco('consumiveis', () => [c, s.consumiveis, s.capacidades], () =>
			desenharConsumiveis(
				el('[data-secao="consumiveis"]'),
				{ config: c, consumiveis: s.consumiveis, limites: lim, iconeDoItem: aplicarIconeDoItem },
				editar
			)
		);
	}
	if (secoes.includes('avancado')) {
		// Como o topo: o que o Avancado mostra do status e a frase e a explicacao (o diagnostico vem inteiro).
		const doStatus = s.diagnostico ? s.diagnostico.status : s.status;
		const textoDoAvancado = fraseDoStatus(doStatus) + '|' + explicacaoDoStatus(doStatus);
		bloco('avancado', () => [s.diagnostico, textoDoAvancado], () =>
			desenharAvancado(el('[data-secao="avancado"]'), { status: s.status, diagnostico: s.diagnostico, ligado: s.ligado })
		);
	}
	if (secoes.includes('perfis')) {
		bloco('perfis', () => [s.perfis, s.perfilAtivo, s.pendentePerfil], () => desenharPerfisDoMenu(s));
	}
	bloco('flechas', () => [c, s.municoes, s.municao, s.monstros, s.capacidades, secoes], () => desenharCartaoDasFlechas(s, c, secoes, lim));
}

/** A aba Perfis (os verbos sao imediatos, fora do Aplicar). */
function desenharPerfisDoMenu(s) {
	desenharPerfis(
		el('[data-secao="perfis"]'),
		{ perfis: s.perfis, perfilAtivo: s.perfilAtivo, pendente: s.pendentePerfil, nomeMaximo: 24 },
		{
			salvar: nome => {
				_estado.perfilSalvar(nome);
				desenhar();
			},
			aplicar: nome => {
				_estado.perfilAplicar(nome);
				desenhar();
			},
			renomear: (de, para) => {
				_estado.perfilRenomear(de, para);
				desenhar();
			},
			excluir: nome => {
				_estado.perfilExcluir(nome);
				desenhar();
			}
		}
	);
}

/** O cartao das Flechas, dentro de Ataque (Fase 7): escondido sem a secao, o icone uma vez, o editor com ela. */
function desenharCartaoDasFlechas(s, c, secoes, lim) {
	const cartaoDasFlechas = el('[data-secao="flechas"]');
	cartaoDasFlechas.hidden = !secoes.includes('flechas');
	const iconeDasFlechas = cartaoDasFlechas.querySelector('.bm-flechas-icone');
	if (!iconeDasFlechas.getAttribute('src')) {
		aplicarIconeDoItem(iconeDasFlechas, 1752);
	}
	if (secoes.includes('flechas')) {
		desenharFlechas(
			el('[data-secao="flechas"]'),
			{
				config: c,
				municoes: s.municoes,
				municao: s.municao,
				monstros: s.monstros,
				tetoPermitidas: lim.municoesPermitidas || 30,
				tetoMonstros: lim.monstrosComRegraDeFlecha || 120,
				nomeDoItem,
				iconeDoItem: aplicarIconeDoItem
			},
			editar,
			() => {
				_estado.retomarMunicao();
				desenhar();
			}
		);
	}
}

/** A aba Postura (Fase 8): a postura do rascunho, o fallback (so no Dano a distancia) e o posto em vigor. */
function desenharPostura(s, c) {
	const p = lerPostura(c);
	_root()
		.querySelectorAll('input[name="bm-postura"]')
		.forEach(r => {
			r.checked = r.value === p.tipo;
		});
	el('.bm-fallback').checked = p.fallbackMelee;
	el('.bm-fallback-melee').hidden = p.tipo !== 'ranged-dps';
	// Frente P (13/10/2026): na postura "So suporte" o Bot nunca ataca, e a aba Ataque diz que o modo nao vale (a escolha
	// segue gravada e editavel para a proxima postura).
	const soSuporte = p.tipo === 'ranged-buff';
	el('.bm-modo-sem-efeito').hidden = !soSuporte;
	el('.bm-modo').classList.toggle('is-sem-efeito', soSuporte);
	const g = s.grupo;
	el('.bm-posto-atual').textContent =
		g && g.emGrupo ? 'Posto em vigor: ' + g.postoNome + '.' : 'Sem grupo: o Bot caça sozinho (Andarilho).';
}

/**
 * MONSTROS DO MAPA (segunda rodada dos ajustes do dono, 09/10/2026, item 4.4): todos os monstros do mapa de agora,
 * cada um com a caixa MARCADA (o Bot ataca). Desmarcar = ignorar (entra em `especiesVetadas`); marcar de novo tira do
 * veto. O gesto e o INVERSO do antigo, o dado gravado e o MESMO. Vetos de especies que nao estao neste mapa seguem
 * gravados e aparecem recolhidos em "Ignorados em outros mapas", com o botao de reativar.
 */
function desenharMonstros(s, c) {
	const vetadas = new Set(c.especiesVetadas || []);
	const noMapa = new Map();
	const fora = new Map();
	// Bug #16 de 13/10/2026: a copia de praca ([EXP]/[ZENY], ids 31xxx) mostra a imagem da especie original.
	const avatarDe = new Map();
	for (const m of s.monstros || []) {
		if (typeof m.avatar === 'number') {
			avatarDe.set(m.especie, m.avatar);
		}
		// `noMapa` ausente (servidor antigo) vale como "esta no mapa".
		if (m.noMapa === false) {
			fora.set(m.especie, m.nome);
		} else {
			noMapa.set(m.especie, m.nome);
		}
	}
	for (const v of vetadas) {
		if (!noMapa.has(v) && !fora.has(v)) {
			fora.set(v, '#' + v);
		}
	}
	for (const e of [...fora.keys()]) {
		if (!vetadas.has(e)) {
			fora.delete(e);
		}
	}
	preencherMonstros(el('.bm-monstros:not(.bm-monstros-outros)'), noMapa, vetadas, false, avatarDe);
	preencherMonstros(el('.bm-monstros-outros'), fora, vetadas, true, avatarDe);
	el('.bm-outros-mapas').hidden = fora.size === 0;
	el('.bm-outros-qtd').textContent = String(fora.size);
}

function preencherMonstros(lista, especies, vetadas, reativar, avatarDe = new Map()) {
	const chave = [...especies].map(([e, n]) => e + ':' + n + ':' + vetadas.has(e) + ':' + (avatarDe.get(e) ?? '')).join(',');
	if (lista.getAttribute('data-chave') === chave) {
		return;
	}
	lista.setAttribute('data-chave', chave);
	lista.innerHTML = '';
	const ordenados = [...especies].sort((a, b) => String(a[1]).localeCompare(String(b[1])));
	for (const [especie, nome] of ordenados) {
		const ignorado = vetadas.has(especie);
		const li = document.createElement('li');
		li.className = 'bm-monstro' + (ignorado ? ' is-ignorado' : '');
		li.setAttribute('data-especie', String(especie));
		li.tabIndex = 0;
		const rotulo = document.createElement('span');
		rotulo.textContent = nome;
		rotulo.setAttribute('translate', 'no');
		const avatar = document.createElement('img');
		avatar.alt = '';
		avatar.loading = 'lazy';
		avatar.src = '/ragidle/mobs/' + (avatarDe.get(especie) ?? especie) + '.png';
		avatar.onerror = () => {
			avatar.style.display = 'none';
		};
		if (reativar) {
			li.setAttribute('role', 'button');
			li.setAttribute('aria-label', 'Reativar ' + nome);
			li.appendChild(avatar);
			li.appendChild(rotulo);
			const botao = document.createElement('small');
			botao.className = 'bm-monstro-estado';
			botao.textContent = 'Reativar';
			li.appendChild(botao);
		} else {
			li.setAttribute('role', 'checkbox');
			li.setAttribute('aria-checked', String(!ignorado));
			const caixa = document.createElement('input');
			caixa.type = 'checkbox';
			caixa.checked = !ignorado;
			caixa.tabIndex = -1;
			caixa.setAttribute('aria-hidden', 'true');
			li.appendChild(caixa);
			li.appendChild(avatar);
			li.appendChild(rotulo);
			if (ignorado) {
				const estado = document.createElement('small');
				estado.className = 'bm-monstro-estado';
				estado.textContent = 'Ignorado';
				li.appendChild(estado);
			}
		}
		lista.appendChild(li);
	}
}

function avisarCapacidade() {
	const tem = BotMenu.temCapacidade();
	for (const fn of _ouvintesDaCapacidade) {
		try {
			fn(tem);
		} catch (err) {
			console.error('[BotMenu] ouvinte da capacidade falhou', err);
		}
	}
}

function onBotRecebido(pkt) {
	let dados;
	try {
		dados = JSON.parse(pkt.json);
	} catch (err) {
		console.error('[BotMenu] payload nao e JSON valido', err);
		return;
	}
	const tinha = BotMenu.temCapacidade();
	/*
	 * O PERSONAGEM DESTA SESSAO (correcoes pos-QA, 08/10/2026; V-18 do QA final; 05 secao 4). Era o do
	 * proprio estado, que a troca de personagem zera (`reiniciar`): o status do personagem ANTERIOR que
	 * chegasse depois entrava e fixava o antigo, e o novo passava a ser recusado. A identidade vem da
	 * sessao: `Session.GID` e o `personagemId` do `HC_NOTIFY_ZONESVR2` (servidor-char.ts), o mesmo que o
	 * `CZ_ENTER2` leva ao mapa e que o servidor poe em toda resposta e status do Bot. Sem sessao (0),
	 * vale o do estado, como antes.
	 */
	const daSessao = Session.GID;
	const atual = Number.isInteger(daSessao) && daSessao > 0 ? daSessao : _estado.estado().personagemId;
	if (_estado.receber(dados, atual)) {
		// O contexto do mapa (cidade? qual mapa?) e o Bot ligado alimentam quem nao e do Bot:
		// drop da Analise, botao Cacar, tela acesa no farm.
		receberDoServidor(dados.contexto, _estado.estado().ligado);
		desenhar();
		if (tinha !== BotMenu.temCapacidade()) {
			avisarCapacidade();
		}
	}
}

Network.hookPacket(PACKET.ZC.RAGIDLE_BOT, onBotRecebido);

export default UIManager.addComponent(BotMenu);
