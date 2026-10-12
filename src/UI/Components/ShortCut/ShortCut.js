/**
 * UI/Components/ShortCut/ShortCut.js
 *
 * ShortCut windows component
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import DB from 'DB/DBManager.js';
import ItemType from 'DB/Items/ItemType.js';
import SkillInfo from 'DB/Skills/SkillInfo.js';
import { nomeDaHabilidadeParaOJogador } from 'DB/Skills/SkillNamePtBr.js'; // RAGIDLE (29/09/2026): dica da barra em portugues (C1)
import Client from 'Core/Client.js';
import Preferences from 'Core/Preferences.js';
import Session from 'Engine/SessionStorage.js';
import Renderer from 'Renderer/Renderer.js';
import Mouse from 'Controls/MouseEventHandler.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import toqueParaAtalho from 'UI/toqueParaAtalho.js';
import { emUnidadesDaHud } from 'UI/escalaDaHud.js';
import ItemInfo from 'UI/Components/ItemInfo/ItemInfo.js';
import Inventory from 'UI/Components/Inventory/Inventory.js';
import SkillListMH from 'UI/Components/SkillListMH/SkillListMH.js';
import SkillDescription from 'UI/Components/SkillDescription/SkillDescription.js';
import SkillTargetSelection from 'UI/Components/SkillTargetSelection/SkillTargetSelection.js';
import Guild from 'UI/Components/Guild/Guild.js';
import ShortCutControls from 'Preferences/ShortCutControls.js';
import KEYS from 'Controls/KeyEventHandler.js';
import Configs from 'Core/Configs.js';
import PACKETVER from 'Network/PacketVerManager.js';
import SkillWindow from 'UI/Components/SkillList/SkillList.js';
import { aoLembrarNomes, dicaDoAtalho, fecharSeletorDeNivel, nomeNaBarra, spLembrado } from 'UI/nivelDeUso.js';
import { criarSeletorDeNivelDaBarra } from './seletorDeNivelDaBarra.js';
import { criarRelogioDaBarra } from './relogioDaBarra.js';
import htmlText from './ShortCut.html?raw';
import cssText from './ShortCut.css?raw';

/**
 * Create Component
 */
const ShortCut = new GUIComponent('ShortCut', cssText);
ShortCut.render = () => htmlText;

/**
 * @var {Array} ShortCut list
 */
const _list = [];

/**
 * O SELETOR DE NIVEL DE UM SLOT (D-1908): botao direito no desktop, tocar e
 * segurar no celular. A regra e o desenho moram em `seletorDeNivelDaBarra.js`;
 * aqui so o que ele le e escreve da barra. Regravar e o caminho de sempre do
 * slot (`addElement` + `onChange` -> `CZ_SHORTCUT_KEY_CHANGE2`).
 */
const _seletorDeNivel = criarSeletorDeNivelDaBarra({
	conteiner: () => ShortCut.getRoot().querySelector('#ShortCut'),
	slot: indice => _list[indice],
	aprendido: ID => {
		const skill = ShortCut.getSkillById(ID);
		return skill && skill.level ? skill.level : 0;
	},
	// O nome das janelas ("Lancas de Fogo"), e nao o da tabela do cliente (`nomeNaBarra`).
	nome: ID => nomeNaBarra(SkillInfo[ID], ID),
	nomeNoBanco: ID => (SkillInfo[ID] ? SkillInfo[ID].Name : ''),
	regravar: (indice, ID, nivel) => {
		ShortCut.addElement(indice, true, ID, nivel);
		ShortCut.onChange(indice, true, ID, nivel);
	},
	descricao: ID => mostrarDescricaoDaHabilidade(ID),
	ancora: indice => ShortCut.getRoot().querySelector(`.container[data-index="${indice}"]`),
	emUnidadesDaHud
});

/**
 * A DICA de um slot de HABILIDADE (D-1908): "[ F3 ] Fire Bolt · Nv 7 · 22 SP".
 * O SP sai do que a janela de Habilidades ou a Configuracao idle ja
 * receberam do servidor (`spLembrado`); sem ele, a dica sai sem SP.
 */
function dicaDaHabilidade(hotkey, ID, nivel) {
	const info = SkillInfo[ID];
	return dicaDoAtalho({
		hotkey,
		nome: nomeNaBarra(info, ID),
		nivel,
		sp: info ? spLembrado(info.Name, nivel) : null
	});
}

/**
 * @var {number} max number of rows
 */
let _rowCount = 0;

const ROW_HEIGHT = 42;
const COLLAPSED_HEIGHT = 42;
const MAX_ROW_COUNT = 4;

/**
 * @var {number} pagina ativa da HUD vertical (D-939) — indice da fileira que
 * o celular em pe mostra. Estado de MODULO, como _rowCount: a barra e
 * recriada na troca de mapa e a pagina escolhida atravessa.
 */
let _paginaVertical = 0;

/**
 * Redesenha os pontinhos e marca a fileira ativa (D-939).
 *
 * Roda no init, no setList (o numero de fileiras DISPONIVEIS vem do
 * servidor e muda ali) e no toque num pontinho. Fora da HUD vertical tudo
 * isto e inerte: os pontinhos sao display:none e a classe da fileira nao
 * casa com regra nenhuma.
 */
function aplicarPaginaVertical(pagina) {
	const root = ShortCut.getRoot();
	const paginas = root.querySelector('.shortcut-paginas');
	if (!paginas) {
		return;
	}
	const total = getAvailableRowCount();
	_paginaVertical = Math.max(0, Math.min(pagina, total - 1));

	if (paginas.childElementCount !== total) {
		paginas.innerHTML = '';
		for (let i = 0; i < total; i++) {
			const ponto = document.createElement('button');
			ponto.type = 'button';
			ponto.className = 'shortcut-pagina';
			ponto.setAttribute('data-pagina', String(i));
			ponto.setAttribute('role', 'tab');
			ponto.setAttribute('aria-label', `Página ${i + 1}`);
			paginas.appendChild(ponto);
		}
	}
	const pontos = paginas.querySelectorAll('.shortcut-pagina');
	for (let i = 0; i < pontos.length; i++) {
		pontos[i].classList.toggle('is-ativa', i === _paginaVertical);
		pontos[i].setAttribute('aria-selected', String(i === _paginaVertical));
	}
	const fileiras = root.querySelectorAll('.row');
	for (let i = 0; i < fileiras.length; i++) {
		fileiras[i].classList.toggle('is-pagina-ativa', i === _paginaVertical);
	}
}

/**
 * @var {object} server load hotkeys
 */
let _lastServerHotkeys = null;

/**
 * O RELOGIO DE RECARGA dos slots (item 3.10 do pedido do dono, 09/10/2026):
 * sombra que revela o icone em sentido horario e o numero no centro, por
 * skill, enquanto o `Cooldown` dela corre. A regra e o desenho moram em
 * `relogioDaBarra.js` (contas em `relogioDeRecarga.js`); aqui so como ler os
 * slots. Substitui o relogio antigo da barra, um quadro de animacao por slot
 * (60 por segundo) que se perdia quando o `.icon` era redesenhado e nao
 * mostrava numero.
 */
const _relogioDaBarra = criarRelogioDaBarra({
	slots: () => {
		const slots = [];
		const root = ShortCut.getRoot();
		if (!root) {
			return slots;
		}
		for (let i = 0; i < _list.length; ++i) {
			const s = _list[i];
			if (s && s.isSkill) {
				slots.push({ skillId: Number(s.ID), icone: root.querySelector(`.container[data-index="${i}"] .icon`) });
			}
		}
		return slots;
	}
});

/**
 * Desassinar de "toqueParaAtalho" (D-938). Guarda a funcao devolvida por
 * "assinar()" para poder desligar em "onRemove" e tambem para proteger
 * contra assinar duas vezes se "init" rodar de novo.
 */
let _desassinarToque = null;

/**
 * @var {Preference} structure to save informations about shortcut
 */
const _preferences = Preferences.get(
	'ShortCut',
	{
		size: 1,
		lastSize: 1,
		x: null,
		y: null
	},
	/*
	 * VERSAO 1.1 — a 1.0 GUARDA A BARRA NO LUGAR ANTIGO.
	 *
	 * "Preferences.get" (Core/Preferences.js:41-58) so aplica o objeto de
	 * default quando NAO existe valor salvo ou quando a versao mudou; havendo
	 * valor da MESMA versao, ele copia chave a chave por cima do default. Quem
	 * ja jogou tem "ShortCut" no localStorage com o x/y do desenho anterior
	 * (480/54, topo-centro) — e "onAppend" trata x/y nao-nulos como "o jogador
	 * escolheu este lugar". Sem virar a versao, a barra nova nasceria no lugar
	 * VELHO para todo mundo que ja abriu o jogo alguma vez, e so quem nunca
	 * abriu veria o centro inferior pedido. Virar para 1.1 descarta a
	 * preferencia antiga uma unica vez; dai em diante o que o jogador arrastar
	 * volta a mandar.
	 */
	1.1
);

/**
 * Initialize UI
 */
ShortCut.init = function init() {
	const root = ShortCut.getRoot();

	const resizeBtn = root.querySelector('.resize');
	if (resizeBtn) {
		resizeBtn.addEventListener('mousedown', onResize);
	}

	const closeBtn = root.querySelector('.close');
	if (closeBtn) {
		closeBtn.addEventListener('mousedown', e => {
			e.stopImmediatePropagation();
			e.preventDefault();
		});
		closeBtn.addEventListener('click', onClose);
	}

	const reopenBtn = root.querySelector('.reopen');
	if (reopenBtn) {
		reopenBtn.addEventListener('mousedown', e => {
			e.stopImmediatePropagation();
			e.preventDefault();
		});
		reopenBtn.addEventListener('click', onReopen);
	}

	const container = root.querySelector('#ShortCut');

	// D-1908: tocar e segurar um slot de habilidade abre o seletor de nivel.
	_seletorDeNivel.ligarSegurar(container);

	/*
	 * TOQUE: rotulo "algo na mao" (D-938) — criado aqui em JS, e nao em
	 * ShortCut.html, para nao mexer no template. Mora dentro do MESMO
	 * shadow root do ShortCut (nunca em document.body — ver o comentario
	 * de "atualizarRotuloDeToque" sobre por que ele precisa ser fixo).
	 */
	if (!root.querySelector('.shortcut-toque-rotulo')) {
		const rotuloToque = document.createElement('div');
		rotuloToque.className = 'shortcut-toque-rotulo';
		container.appendChild(rotuloToque);
	}
	if (!_desassinarToque) {
		_desassinarToque = toqueParaAtalho.assinar(atualizarRotuloDeToque);
	}

	/*
	 * PAGINAS DA HUD VERTICAL (D-939) — os pontinhos do mockup.
	 *
	 * No desktop as fileiras aparecem por ALTURA (applyShortcutSize corta o
	 * host em N x 42px, e o resize da mais fileiras). No celular em pe nao ha
	 * altura para empilhar fileiras nem pegador para redimensionar: cada
	 * fileira vira uma PAGINA, e os pontinhos trocam qual esta na tela.
	 *
	 * Criado em JS como o rotulo de toque acima (nao mexe no template), e
	 * INERTE fora da vertical: o CSS so mostra os pontinhos e so esconde
	 * fileiras dentro de `.ri-vertical`. A classe `is-pagina-ativa` existe
	 * sempre, mas nenhuma regra de desktop a le.
	 */
	if (!root.querySelector('.shortcut-paginas')) {
		const paginas = document.createElement('div');
		paginas.className = 'shortcut-paginas';
		paginas.setAttribute('role', 'tablist');
		paginas.setAttribute('aria-label', 'Páginas da barra de atalhos');
		paginas.addEventListener('click', e => {
			const ponto = e.target.closest('.shortcut-pagina');
			if (ponto) {
				e.stopImmediatePropagation();
				aplicarPaginaVertical(parseInt(ponto.getAttribute('data-pagina'), 10) || 0);
			}
		});
		container.appendChild(paginas);
	}
	aplicarPaginaVertical(_paginaVertical);

	// Dropping to the shortcut
	container.addEventListener('drop', e => {
		const target = e.target.closest('.container');
		if (target) {
			onDrop(e, target);
		}
	});
	container.addEventListener('dragover', e => {
		const target = e.target.closest('.container');
		if (target) {
			e.stopImmediatePropagation();
			e.preventDefault();
			e.dataTransfer.dropEffect = 'copy';
			target.classList.add('is-drop-target');
		}
	});
	container.addEventListener('dragleave', e => {
		const target = e.target.closest('.container');
		if (target && !target.contains(e.relatedTarget)) {
			target.classList.remove('is-drop-target');
		}
	});

	// Icons — delegated events
	container.addEventListener('dragstart', e => {
		const icon = e.target.closest('.icon');
		if (icon) {
			onDragStart(e, icon);
		}
	});
	container.addEventListener('dragend', e => {
		const icon = e.target.closest('.icon');
		if (icon) {
			onDragEnd(icon);
		}
	});
	container.addEventListener('dblclick', e => {
		const icon = e.target.closest('.icon');
		if (icon) {
			onUseShortCut(icon);
		}
	});
	container.addEventListener('contextmenu', e => {
		const icon = e.target.closest('.icon');
		if (icon) {
			onElementInfo(e, icon);
		}
	});
	container.addEventListener('mousedown', e => {
		if (e.target.closest('.icon')) {
			e.stopImmediatePropagation();
		}
	});

	/*
	 * TOQUE: o SEGUNDO gesto de "pegar e por" (D-938, ver
	 * UI/toqueParaAtalho.js). O toque nao gera "dragstart", entao o "por"
	 * chega aqui como um "click" comum no slot de destino. Sem nada
	 * pendente, um clique simples num slot NUNCA fez nada neste componente
	 * (o unico gesto de um toque e o "dblclick" via "onUseShortCut") — e
	 * isso continua valendo: o guarda abaixo devolve sem tocar em nada.
	 */
	container.addEventListener('click', e => {
		const target = e.target.closest('.container');
		if (!target || !toqueParaAtalho.pendente()) {
			return;
		}
		e.stopImmediatePropagation();
		e.preventDefault();
		const carga = toqueParaAtalho.entregar();
		const index = parseInt(target.getAttribute('data-index'), 10);
		aplicarNoSlot(carga, index);
	});

	/*
	 * ARRASTE DA BARRA — DEPOIS do "mousedown" delegado acima, e nao antes.
	 *
	 * O punho e o proprio "#ShortCut", o MESMO elemento onde mora aquele
	 * ouvinte. Ouvintes do mesmo elemento disparam na ordem de registro, e o
	 * "stopImmediatePropagation()" de la so cala os que vierem DEPOIS dele —
	 * entao registrar o arraste primeiro fazia a barra inteira acompanhar o
	 * mouse enquanto o jogador so queria mover um icone de um slot para outro.
	 * Com o registro invertido, arrastar um slot OCUPADO nao move a barra;
	 * linha e slot vazios continuam movendo, que e o pegador pedido.
	 */
	this.draggable(root.querySelector('#ShortCut'));

	// A rede de seguranca do paragrafo de "persistirPosicao": o fim real do
	// arraste e o "mouseup", nao o "transitionend" que o GUIComponent espera.
	// Fica no documento porque um arraste rapido solta o botao FORA da barra.
	const doc = this._host.ownerDocument;
	doc.addEventListener('mouseup', persistirPosicao);
	doc.addEventListener('touchend', persistirPosicao);

	// Tooltip events
	root.querySelectorAll('.container').forEach(el => {
		el.addEventListener('mouseenter', onContainerMouseEnter);
		el.addEventListener('mouseleave', onContainerMouseLeave);
	});

	// Add to item owner name update queue
	DB.UpdateOwnerName.ShortCut = onUpdateOwnerName;

	Inventory.getUI().onUpdateItem = onUpdateItem;
};

/**
 * Append to body
 */
ShortCut.onAppend = function onAppend() {
	// A primeira abertura nasce no centro inferior. Depois que o jogador move,
	// a posicao salva ganha da ancora CSS e volta limitada a viewport atual.
	applyShortcutSize(_preferences.size);
	if (_preferences.x != null && _preferences.y != null) {
		const rect = this._host.getBoundingClientRect();
		this._host.style.bottom = 'auto';
		this._host.style.left = Math.min(Math.max(0, _preferences.x), Renderer.width - rect.width) + 'px';
		this._host.style.top = Math.min(Math.max(0, _preferences.y), Renderer.height - rect.height) + 'px';
	}

	SkillWindow.getUI().onUpdateSkill = onUpdateSkill;

	// Initialize tooltips for empty slots
	updateEmptySlotTooltips();
};

/**
 * Guarda a nova ancora somente depois de um arraste real.
 *
 * "onDragEnd" e chamado pelo GUIComponent NO "transitionend" da opacidade
 * (GUIComponent.js:753-763), e isso sozinho NAO da conta: medido no jogo de
 * pe, um arraste curto termina com a opacidade ja no valor final, o evento
 * nunca dispara, e o "x/y" gravado ficou UMA ARRASTADA ATRASADA — o jogador
 * move a barra, atualiza a pagina e ela volta para o lugar de antes. Por isso
 * o mesmo gravador tambem pende do "mouseup" (ver ShortCut.init), que e o
 * instante em que o arraste de fato acabou. Os dois chamam a funcao abaixo,
 * que so escreve quando ha o que escrever.
 */
ShortCut.onDragEnd = function persistDragPosition() {
	persistirPosicao();
};

/**
 * Copia a posicao INLINE para a preferencia, se houver posicao inline.
 *
 * O guarda de "!left || !top" nao e zelo: a barra nasce ancorada pelo CSS
 * ("bottom"), sem "style.left/top" nenhum, e "parseInt('') || 0" daria ZERO —
 * ou seja, um F5 depois de qualquer chamada indevida grudaria a barra no
 * canto superior esquerdo, que e justamente o estado que ninguem pediu.
 */
function persistirPosicao() {
	const host = ShortCut._host;
	if (!host) {
		return;
	}

	const left = parseInt(host.style.left, 10);
	const top = parseInt(host.style.top, 10);
	if (!Number.isFinite(left) || !Number.isFinite(top)) {
		return;
	}
	if (_preferences.x === left && _preferences.y === top) {
		return;
	}

	_preferences.x = left;
	_preferences.y = top;
	_preferences.save();
}

/**
 * When removed, clean up
 */
ShortCut.onRemove = function onRemove() {
	// D-1908: o seletor de nivel nao sobrevive a barra fora da tela.
	_seletorDeNivel.cancelarSegurar();
	fecharSeletorDeNivel();

	// Hide tooltip
	const root = ShortCut.getRoot();
	const tooltip = root.querySelector('.shortcut-tooltip');
	if (tooltip) {
		tooltip.classList.remove('show');
	}

	// D-938: desliga a assinatura de "toqueParaAtalho" — senao um segundo
	// "init" (ver o guarda "if (!_desassinarToque)") nunca voltaria a assinar.
	if (_desassinarToque) {
		_desassinarToque();
		_desassinarToque = null;
	}

	// O relogio de recarga NAO e limpo aqui: a troca de mapa tira e repoe a
	// barra (UIManager.removeComponents) e a recarga segue valendo no servidor.
	// Quem esquece e o `clean` (troca de personagem).

	// Save preferences
	_preferences.size = this._host.classList.contains('is-collapsed')
		? 0
		: Math.floor(parseInt(this._host.style.height, 10) / ROW_HEIGHT);
	_preferences.save();
};

/**
 * Request to clean the list
 * Used only from MapEngine when exiting the game
 */
ShortCut.clean = function clean() {
	// Troca de personagem: as recargas do anterior nao valem para o proximo.
	_relogioDaBarra.limpar();

	_list.length = 0;
	const root = ShortCut.getRoot();
	root.querySelectorAll('.container').forEach(el => {
		el.innerHTML = '';
	});
};

/**
 * Process shortcut
 *
 * @param {object} key
 */
ShortCut.onShortCut = function onShortCut(key) {
	switch (key.cmd.replace(/\d+$/, '')) {
		case 'EXECUTE':
			clickElement(parseInt(key.cmd.match(/\d+$/).toString(), 10));
			break;

		case 'EXTEND':
			applyShortcutSize((_preferences.size + 1) % (getAvailableRowCount() + 1));
			_preferences.save();
			break;
	}
};

ShortCut.useSkill = function useSkill(id, level) {
	if (id > 10000 && id < 10100) {
		Guild.useSkillID(id, level);
	} else if (id > 8000 && id < 8044) {
		// if one of them don't have the skill, it returns early
		SkillListMH.mercenary.useSkillID(id, level);
		SkillListMH.homunculus.useSkillID(id, level);
	} else {
		SkillWindow.getUI().useSkillID(id, level);
	}
};

ShortCut.getSkillById = function getSkillById(id) {
	let skill;

	if (id > 10000 && id < 10100) {
		skill = Guild.getSkillById(id);
	} else if (id > 8000 && id < 8044) {
		skill = SkillListMH.mercenary.getSkillById(id);
		if (!skill) {
			skill = SkillListMH.homunculus.getSkillById(id);
		}
	} else {
		skill = SkillWindow.getUI().getSkillById(id);
	}

	return skill;
};

/**
 * Bind UI with list of shortcut
 *
 * @param {Array} shortcut list
 */
ShortCut.setList = function setList(list) {
	let skill;
	const root = ShortCut.getRoot();

	root.querySelectorAll('.container').forEach(el => {
		el.innerHTML = '';
	});
	_list.length = list.length;
	_rowCount = Math.min(4, Math.floor(list.length / 9));
	/* D-939: o numero de paginas da HUD vertical segue o de fileiras
	   disponiveis — e ele acabou de (possivelmente) mudar. */
	aplicarPaginaVertical(_paginaVertical);

	for (let i = 0, count = list.length; i < count; ++i) {
		if (list[i].isSkill) {
			skill = ShortCut.getSkillById(list[i].ID);

			if (skill && skill.level) {
				ShortCut.addElement(i, true, list[i].ID, list[i].count || skill.level);
			} else {
				if (!_list[i]) {
					_list[i] = {};
				}

				_list[i].isSkill = true;
				_list[i].ID = list[i].ID;
				_list[i].count = list[i].count;
			}
		} else {
			ShortCut.addElement(i, list[i].isSkill, list[i].ID, list[i].count);
		}
	}
	// D-1908: a lista nova (o slot no maximo que acompanhou a subida, D-1907)
	// chega com o seletor aberto — ele passa a mostrar o nivel de agora.
	_seletorDeNivel.redesenharSeAberto();
};

/**
 * Update tooltip for empty slots with hotkey only
 */
function updateEmptySlotTooltips() {
	const root = ShortCut.getRoot();
	const containers = root.querySelectorAll('.container');

	for (let i = 0; i < containers.length; ++i) {
		// Only update empty slots
		if (!_list[i] || (!_list[i].isSkill && !_list[i].ID)) {
			const hotkey = getHotKeyString(i);
			if (hotkey) {
				containers[i].setAttribute('data-tooltip', hotkey);
			}
		}
	}
}

/**
 * Update all tooltips (for both empty and filled slots)
 * Called when hotkey settings change
 */
ShortCut.updateAllTooltips = function updateAllTooltips() {
	const root = ShortCut.getRoot();

	for (let i = 0, size = _list.length; i < size; ++i) {
		const container = root.querySelector(`.container[data-index="${i}"]`);
		if (!container) {
			continue;
		}

		const hotkey = getHotKeyString(i);

		// Update empty slots
		if (!_list[i] || (!_list[i].isSkill && !_list[i].ID)) {
			if (hotkey) {
				container.setAttribute('data-tooltip', hotkey);
			}
		}
		// Update filled slots
		else if (_list[i] && (_list[i].isSkill || _list[i].ID)) {
			let name = '';
			if (_list[i].isSkill && SkillInfo[_list[i].ID]) {
				name = nomeDaHabilidadeParaOJogador(_list[i].ID);
			} else if (_list[i].ID) {
				const item = Inventory.getUI().getItemById(_list[i].ID);
				if (item) {
					name = DB.getItemName(item);
				}
			}

			if (name) {
				const tooltipText = _list[i].isSkill
					? dicaDaHabilidade(hotkey, _list[i].ID, _list[i].count)
					: hotkey
						? `[ ${hotkey} ] ${name}`
						: name;
				container.setAttribute('data-tooltip', tooltipText);
			}
		}
	}
};

/*
 * O NOME DAS JANELAS CHEGOU (01/10/2026): a Configuracao idle e sondada a cada
 * entrada no mapa, depois de a barra ja ter montado as dicas com o nome da
 * tabela do cliente. Refaz as dicas com o nome novo (`nomeNaBarra`). Antes de
 * a barra existir nao ha raiz, e o `addElement` de quando ela nascer ja le o
 * nome lembrado.
 */
aoLembrarNomes(() => ShortCut.__loaded && ShortCut.updateAllTooltips());

/**
 * Get hotkey string for shortcut index
 *
 * @param {number} index of the shortcut slot
 * @return {string} hotkey string or empty string
 */
function getHotKeyString(index) {
	const shortcutKeys = [
		'F1_1',
		'F1_2',
		'F1_3',
		'F1_4',
		'F1_5',
		'F1_6',
		'F1_7',
		'F1_8',
		'F1_9',
		'F2_1',
		'F2_2',
		'F2_3',
		'F2_4',
		'F2_5',
		'F2_6',
		'F2_7',
		'F2_8',
		'F2_9',
		'F3_1',
		'F3_2',
		'F3_3',
		'F3_4',
		'F3_5',
		'F3_6',
		'F3_7',
		'F3_8',
		'F3_9',
		'F4_1',
		'F4_2',
		'F4_3',
		'F4_4',
		'F4_5',
		'F4_6',
		'F4_7',
		'F4_8',
		'F4_9'
	];

	if (index < 0 || index >= shortcutKeys.length) {
		return '';
	}

	const scKey = shortcutKeys[index];
	const shortcut = ShortCutControls.ShortCuts[scKey];

	if (!shortcut) {
		return '';
	}

	const key = shortcut.cust ? shortcut.cust.key : shortcut.init.key;
	const alt = shortcut.cust ? shortcut.cust.alt : shortcut.init.alt;
	const ctrl = shortcut.cust ? shortcut.cust.ctrl : shortcut.init.ctrl;
	const shift = shortcut.cust ? shortcut.cust.shift : shortcut.init.shift;

	if (!key) {
		return '';
	}

	let hotkeyStr = '';
	if (alt) {
		hotkeyStr += 'ALT + ';
	}
	if (ctrl) {
		hotkeyStr += 'CTRL + ';
	}
	if (shift) {
		hotkeyStr += 'SHIFT + ';
	}
	hotkeyStr += KEYS.toReadableKey(key);

	return hotkeyStr;
}

/**
 * Show fixed tooltip on container hover
 */
function onContainerMouseEnter(event) {
	const container = event.currentTarget;
	// D-1908: a dica da habilidade e refeita aqui, e nao so ao por o slot — o
	// SP de cada nivel pode ter chegado depois (a janela de Habilidades aberta
	// mais tarde), e a dica velha diria o nivel sem o custo.
	const indice = parseInt(container.getAttribute('data-index'), 10);
	const slot = _list[indice];
	if (slot && slot.isSkill && slot.ID && slot.count) {
		container.setAttribute('data-tooltip', dicaDaHabilidade(getHotKeyString(indice), slot.ID, slot.count));
	}
	const tooltipText = container.getAttribute('data-tooltip');

	if (tooltipText) {
		const root = ShortCut.getRoot();
		const tooltip = root.querySelector('.shortcut-tooltip');
		const host = ShortCut._host;
		const hostRect = host.getBoundingClientRect();

		tooltip.textContent = tooltipText;
		tooltip.classList.add('show');

		// Calculate tooltip dimensions
		const tooltipRect = tooltip.getBoundingClientRect();

		// Check if there's enough space below
		const windowHeight = window.innerHeight;
		const spaceBelow = windowHeight - (hostRect.top + hostRect.height);
		const showAbove = spaceBelow < tooltipRect.height + 10;

		// Position tooltip centered horizontally
		const left = hostRect.left + hostRect.width / 2 - tooltipRect.width / 2;
		let top;

		if (showAbove) {
			top = hostRect.top - tooltipRect.height - 2;
		} else {
			top = hostRect.top + hostRect.height + 2;
		}

		/*
		 * A CONVERSAO DO ZOOM (D-934), e ela vale para os DOIS rotulos fixos
		 * deste componente.
		 *
		 * `getBoundingClientRect()` devolve pixel de VIEWPORT; `style.left`
		 * escrito num elemento que vive dentro de um host com `zoom` e lido
		 * nas unidades LOCAIS dele. `position: fixed` NAO escapa disso —
		 * medido em 05/09/2026: `left: 400px` dentro de `zoom: 0.5` desenha em
		 * x=200. Sem a divisao, a dica de item saia do lugar em toda janela
		 * pequena. Em escala 1 a funcao e identidade.
		 */
		tooltip.style.left = `${emUnidadesDaHud(left)}px`;
		tooltip.style.top = `${emUnidadesDaHud(top)}px`;
	}
}

/**
 * Hide fixed tooltip on container leave
 */
function onContainerMouseLeave() {
	const root = ShortCut.getRoot();
	const tooltip = root.querySelector('.shortcut-tooltip');
	if (tooltip) {
		tooltip.classList.remove('show');
	}
}

ShortCut.setElement = function setElement(isSkill, ID, count) {
	for (let i = 0, size = _list.length; i < size; ++i) {
		if (_list[i] && _list[i].isSkill == isSkill && _list[i].ID === ID) {
			if (isSkill && _list[i].count && _list[i].count <= count) {
				ShortCut.addElement(i, isSkill, ID, _list[i].count);
			} else {
				ShortCut.addElement(i, isSkill, ID, count);
			}
		}
	}
};

/**
 * Resizing hotkey window
 */
function onResize(event) {
	const host = ShortCut._host;
	const top = host.offsetTop;
	let lastHeight = 0;

	function resizing() {
		let h = Math.floor((Mouse.screen.y - top) / ROW_HEIGHT + 1);

		// Maximum and minimum window size
		h = Math.min(Math.max(h, 1), getAvailableRowCount());

		if (h === lastHeight) {
			return;
		}

		host.style.height = `${h * ROW_HEIGHT}px`;
		_preferences.size = h;
		_preferences.lastSize = h;
		_preferences.save();
		lastHeight = h;
	}

	// Start resizing
	const _Interval = setInterval(resizing, 30);

	// Stop resizing on left click
	const mouseUpHandler = _event => {
		if (_event.which === 1) {
			clearInterval(_Interval);
			window.removeEventListener('mouseup', mouseUpHandler);
		}
	};
	window.addEventListener('mouseup', mouseUpHandler);

	event.stopImmediatePropagation();
	event.preventDefault();
}

/**
 * Add an element to shortcut
 *
 * @param {number} index of the element
 * @param {boolean} is a skill ?
 * @param {number} ID
 * @param {number} count or level
 */
ShortCut.addElement = function addElement(index, isSkill, ID, count) {
	let file, name;
	const root = ShortCut.getRoot();
	const ui = root.querySelector(`.container[data-index="${index}"]`);
	if (!ui) return;
	ui.innerHTML = '';

	if (!_list[index]) {
		_list[index] = {};
	}

	_list[index].isSkill = isSkill;
	_list[index].ID = ID;

	if (isSkill) {
		// Do not display if no level.
		if (!count) {
			return;
		} else {
			_list[index].count = count;
			file = SkillInfo[ID].Name;
			name = nomeDaHabilidadeParaOJogador(ID);
		}
	} else {
		_list[index].count = count;
		const item = Inventory.getUI().getItemById(ID);

		// Do not display items not in inventory
		if (!item) {
			return;
		}

		const it = DB.getItemInfo(ID);
		file = item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName;
		name = DB.getItemName(item);

		// If equipment, do not display count
		if (item.type === ItemType.WEAPON || item.type === ItemType.ARMOR || item.type === ItemType.SHADOWGEAR) {
			count = 1;
		}
		// Get item count
		else {
			count = item.count;
		}

		// Do not display item if there is none in the inventory
		if (!count) {
			return;
		}
	}

	// Get hotkey for this slot
	const hotkey = getHotKeyString(index);
	// D-1908: a habilidade diz o nivel (e o SP) em que o slot conjura.
	const tooltipText = isSkill ? dicaDaHabilidade(hotkey, ID, count) : hotkey ? `[ ${hotkey} ] ${name}` : name;

	Client.loadFile(`${DB.INTERFACE_PATH}item/${file}.bmp`, url => {
		ui.innerHTML = '<div draggable="true" class="icon"><div class="img"></div><div class="amount"></div></div>';

		ui.querySelector('.img').style.backgroundImage = `url(${url})`;
		ui.querySelector('.amount').textContent = count;
		ui.setAttribute('data-tooltip', tooltipText);
		// O `.icon` nasceu de novo: se a skill esta em recarga, o relogio volta ja.
		_relogioDaBarra.desenhar();
	});
};

/**
 * O atraso de TODAS as skills (status POSTDELAY, `Entity.js`).
 *
 * @param {number} delay in ms
 */
ShortCut.setGlobalSkillDelay = function setGlobalSkillDelay(delay) {
	_relogioDaBarra.recargaGlobal(delay);
};

/**
 * O `Cooldown` de uma skill (`ZC_SKILL_POSTDELAY`, 0x043d, por
 * `Skill.js:onSetSkillDelay`): acende o relogio em todo slot que a tem. Vale
 * para a skill usada a mao e para a pedida pelo Bot.
 *
 * @param {number} ID of the skill
 * @param {number} delay in ms
 */
ShortCut.setSkillDelay = function setSkillDelay(ID, delay) {
	_relogioDaBarra.recarga(Number(ID), delay);
};

/** As skills com recarga guardada agora (exposto para a prova de tela). */
ShortCut.recargasVivas = function recargasVivas() {
	return _relogioDaBarra.vivas();
};

/**
 * Remove an element from shortcut
 *
 * @param {boolean} is a skill ?
 * @param {number} ID of the element to remove
 * @param {number} row id
 * @param {number} amount (optional)
 */
ShortCut.removeElement = function removeElement(isSkill, ID, row, amount) {
	// Do not need to modify empty slot
	if (!ID) {
		return;
	}

	const root = ShortCut.getRoot();

	for (let i = row * 9, count = Math.min(_list.length, row * 9 + 9); i < count; ++i) {
		if (_list[i] && _list[i].isSkill == isSkill && _list[i].ID === ID && (!isSkill || _list[i].count == amount)) {
			const container = root.querySelector(`.container[data-index="${i}"]`);
			if (container) {
				container.innerHTML = '';
			}
			_list[i].isSkill = 0;
			_list[i].ID = 0;
			_list[i].count = 0;

			ShortCut.onChange(i, 0, 0, 0);
		}
	}
};

/**
 * Drop something in the shortcut
 * Does the client allow other source than shortcut, inventory
 * and skill window to save to shortcut ?
 */
function onDrop(event, target) {
	let data;
	const index = parseInt(target.getAttribute('data-index'), 10);

	event.stopImmediatePropagation();
	event.preventDefault();
	target.classList.remove('is-drop-target');

	try {
		const serialized = event.dataTransfer.getData('Text') || event.dataTransfer.getData('text/plain');
		data = serialized ? JSON.parse(serialized) : window._OBJ_DRAG_;
	} catch (_e) {
		return;
	}

	aplicarNoSlot(data, index);
}

/**
 * Aplica um payload {type, from, data} JA PRONTO num slot da barra — o MESMO
 * switch que "onDrop" sempre teve, agora tambem chamado pelo caminho de
 * TOQUE (D-938, ver "toqueParaAtalho.entregar()" em ShortCut.init). Nenhuma
 * linha da logica mudou, so saiu do meio da leitura do "dataTransfer": quem
 * chama aqui ja tem o payload pronto, seja do mouse (onDrop) ou da mao
 * (toqueParaAtalho).
 *
 * @param {{type:string, from:string, data:object}} data payload pronto
 * @param {number} index slot de destino
 */
function aplicarNoSlot(data, index) {
	if (!data) {
		return;
	}

	const row = Math.floor(index / 9);
	const element = data.data;

	// Do not process others things than item and skill
	if (data.type !== 'item' && data.type !== 'skill') {
		return;
	}

	switch (data.from) {
		case 'SkillList':
		case 'IdleSkills':
		case 'Guild':
		case 'SkillListMH':
			ShortCut.removeElement(
				true,
				element.SKID,
				row,
				element.selectedLevel ? element.selectedLevel : element.level
			);
			ShortCut.addElement(
				index,
				true,
				element.SKID,
				element.selectedLevel ? element.selectedLevel : element.level
			);
			ShortCut.onChange(index, true, element.SKID, element.selectedLevel ? element.selectedLevel : element.level);
			break;

		case 'Inventory':
			ShortCut.removeElement(false, element.ITID, row);
			ShortCut.addElement(index, false, element.ITID, 0);
			ShortCut.onChange(index, false, element.ITID, 0);
			break;

		case 'ShortCut':
			ShortCut.removeElement(element.isSkill, element.ID, row, element.isSkill ? element.count : null);
			ShortCut.addElement(index, element.isSkill, element.ID, element.count);
			ShortCut.onChange(index, element.isSkill, element.ID, element.count);
			break;
	}
}

/**
 * TOQUE: mostra/esconde o rotulo "algo na mao" (D-938) e destaca os slots.
 *
 * O rotulo E FIXO ("position: fixed" no CSS) pelo MESMO motivo que ja obriga
 * ".shortcut-tooltip" a ser fixo: tanto ":host" quanto "#ShortCut" tem
 * "overflow: hidden" (ver o comentario da TEXTURA no topo do CSS), entao um
 * rotulo absoluto posicionado ACIMA da barra seria cortado — so um elemento
 * fixo escapa da caixa do host. A conta de posicao repete a de
 * "onContainerMouseEnter" logo abaixo: centraliza pela largura do HOST e
 * mede o proprio elemento depois de mostrar, para nao adivinhar a largura.
 *
 * Assinado em "toqueParaAtalho.assinar()" (ShortCut.init) — chamado com o
 * pendente atual sempre que ele muda, e com `null` quando a mao esvazia.
 *
 * @param {?{type:string, from:string, data:object, rotulo?:string}} payload
 */
function atualizarRotuloDeToque(payload) {
	const root = ShortCut.getRoot();
	const container = root.querySelector('#ShortCut');
	const rotulo = root.querySelector('.shortcut-toque-rotulo');
	if (!container || !rotulo) {
		return;
	}

	if (!payload) {
		container.classList.remove('is-esperando-atalho');
		rotulo.classList.remove('show');
		return;
	}

	container.classList.add('is-esperando-atalho');
	rotulo.textContent = payload.rotulo ? `${payload.rotulo} → toque num espaço` : 'Toque num espaço da barra';
	rotulo.classList.add('show');

	const host = ShortCut._host;
	if (!host) {
		return;
	}
	const hostRect = host.getBoundingClientRect();
	const rotuloRect = rotulo.getBoundingClientRect();
	/* A mesma conversao do zoom da dica de item — ver o comentario la. */
	rotulo.style.left = `${emUnidadesDaHud(hostRect.left + hostRect.width / 2 - rotuloRect.width / 2)}px`;
	rotulo.style.top = `${emUnidadesDaHud(hostRect.top - rotuloRect.height - 8)}px`;
}

/**
 * Stop the drag and drop
 */
function onDragEnd(icon) {
	delete window._OBJ_DRAG_;
	icon.classList.remove('hide');
}

/**
 * Prepare data to be stored in the dragged element
 * to change position in the shortcut.
 */
function onDragStart(event, icon) {
	const index = parseInt(icon.parentNode.getAttribute('data-index'), 10);
	icon.classList.add('hide');

	// Extract image from css to get it when dragging the element
	const img = new Image();
	img.decoding = 'async';
	img.src = icon
		.querySelector('.img')
		.style.backgroundImage.match(/\(([^)]+)/)[1]
		.replace(/"/g, '');

	// Metade do slot novo (32px, ver ShortCut.css) — com 12 o icone arrastado
	// nascia deslocado do cursor depois que os slots cresceram.
	event.dataTransfer.setDragImage(img, 16, 16);
	event.dataTransfer.setData(
		'Text',
		JSON.stringify(
			(window._OBJ_DRAG_ = {
				type: _list[index].isSkill ? 'skill' : 'item',
				from: 'ShortCut',
				data: _list[index]
			})
		)
	);
}

/**
 * Get informations from a skill/item when
 * using right click on it.
 */
function onElementInfo(event, icon) {
	const index = parseInt(icon.parentNode.getAttribute('data-index'), 10);
	const element = _list[index];

	event.stopImmediatePropagation();
	event.preventDefault();

	/*
	 * D-1908: o botao direito numa HABILIDADE abre o seletor de nivel do slot
	 * (no Android o tocar e segurar tambem chega aqui, como `contextmenu`). A
	 * descricao, que era o que este gesto fazia, continua a um clique: o
	 * botao "Descricao" do seletor.
	 */
	if (element.isSkill) {
		_seletorDeNivel.abrir(index);
	}
	// Display item informations
	else {
		if (ItemInfo.uid === _list[index].ID) {
			ItemInfo.remove();
			return;
		}

		ItemInfo.append();
		ItemInfo.uid = _list[index].ID;
		ItemInfo.setItem(Inventory.getUI().getItemById(_list[index].ID));
	}
}

/** A descricao da habilidade (o que o botao direito fazia ate D-1908). */
function mostrarDescricaoDaHabilidade(ID) {
	if (SkillDescription.uid === ID) {
		SkillDescription.remove();
	} else {
		SkillDescription.append();
		SkillDescription.setSkill(ID);
	}
}

/**
 * Double-click on a shortcut
 */
function onUseShortCut(icon) {
	const index = parseInt(icon.parentNode.getAttribute('data-index'), 10);
	clickElement(index);
}

/**
 * Clicking on a shortcut
 *
 * @param {number} shortcut index
 */
function clickElement(index) {
	const shortcut = _list[index];

	SkillTargetSelection.remove();

	// Nothing here ?
	if (!shortcut) {
		return;
	}

	// Execute skill
	if (shortcut.isSkill) {
		ShortCut.useSkill(shortcut.ID, shortcut.count);
	}
	// Use the item
	else {
		const item = Inventory.getUI().getItemById(_list[index].ID);
		if (item) {
			Inventory.getUI().useItem(item);
		}
	}
}

/**
 * Closing the window
 */
function onClose() {
	applyShortcutSize(0);
	_preferences.save();
}

/**
 * Reopens the bar from the persistent collapsed handle.
 */
function onReopen() {
	applyShortcutSize(_preferences.lastSize || 1);
	_preferences.save();
}

/**
 * Applies expanded/collapsed state without ever making the component
 * undiscoverable. The server may not have sent the shortcut list yet, so at
 * least one row must remain available to F12 and to the reopen handle.
 *
 * @param {number} requestedSize number of visible rows, zero to collapse
 */
function applyShortcutSize(requestedSize) {
	const availableRows = getAvailableRowCount();
	const numericSize = Number.isFinite(requestedSize) ? requestedSize : 1;
	const size = Math.min(Math.max(Math.floor(numericSize), 0), availableRows);
	const collapsed = size === 0;

	ShortCut._host.classList.toggle('is-collapsed', collapsed);
	ShortCut._host.style.height = `${collapsed ? COLLAPSED_HEIGHT : size * ROW_HEIGHT}px`;
	_preferences.size = size;

	if (!collapsed) {
		_preferences.lastSize = size;
	}
}

function getAvailableRowCount() {
	return _rowCount > 0 ? _rowCount : MAX_ROW_COUNT;
}

/**
 * Hook Inventory, get informations when there is a change
 * to update the shortcut
 *
 * @param {number} index
 * @param {number} count
 */
function onUpdateItem(index, count) {
	ShortCut.setElement(false, index, count);
}

/**
 * Hook Skill List, get informations when there is a change
 * to update the shortcut
 *
 * @param {number} skill id
 * @param {number} level
 */
function onUpdateSkill(id, level) {
	ShortCut.setElement(true, id, level);
}

Guild.onUpdateSkill = (id, level) => {
	ShortCut.setElement(true, id, level);
};

SkillListMH.mercenary.onUpdateSkill = (id, level) => {
	ShortCut.setElement(true, id, level);
};

SkillListMH.homunculus.onUpdateSkill = (id, level) => {
	ShortCut.setElement(true, id, level);
};

function onUpdateOwnerName() {
	for (const index in _list) {
		if (!_list[index].isSkill) {
			ShortCut.setElement(false, _list[index].ID, _list[index].count);
		}
	}
}

/**
 * Method to define to notify a change.
 *
 * @param {number} index
 * @param {boolean} isSkill
 * @param {number} id
 * @param {number} count
 */
ShortCut.onChange = function onChange(/*index, isSkill, ID, count*/) {};

function convertHotkeysToServerFormat() {
	const serverData = {
		Type: 1,
		data: {
			EmotionHotkey: [],
			UserHotkey_V2: {
				SkillBar_1Tab: []
			}
		}
	};

	const emotionKeys = [
		'Macro1',
		'Macro2',
		'Macro3',
		'Macro4',
		'Macro5',
		'Macro6',
		'Macro7',
		'Macro8',
		'Macro9',
		'Macro10'
	];
	emotionKeys.forEach((key, index) => {
		const shortcut = ShortCutControls.ShortCuts[key];
		if (shortcut && shortcut.cust && shortcut.cust.emotion) {
			serverData.data.EmotionHotkey[index] = shortcut.cust.emotion;
		}
	});

	const shortcutKeys = [
		'F1_1',
		'F1_2',
		'F1_3',
		'F1_4',
		'F1_5',
		'F1_6',
		'F1_7',
		'F1_8',
		'F1_9',
		'F2_1',
		'F2_2',
		'F2_3',
		'F2_4',
		'F2_5',
		'F2_6',
		'F2_7',
		'F2_8',
		'F2_9',
		'F3_1',
		'F3_2',
		'F3_3',
		'F3_4',
		'F3_5',
		'F3_6',
		'F3_7',
		'F3_8',
		'F3_9',
		'F4_1',
		'F4_2',
		'F4_3',
		'F4_4',
		'F4_5',
		'F4_6',
		'F4_7',
		'F4_8',
		'F4_9'
	];

	shortcutKeys.forEach((key, index) => {
		const shortcut = ShortCutControls.ShortCuts[key];
		if (shortcut) {
			const keyData = shortcut.cust || shortcut.init;
			serverData.data.UserHotkey_V2.SkillBar_1Tab.push({
				desc: `Skill ${index + 1}`,
				index: index,
				key1: keyData.key || 0,
				key2: 0
			});
		}
	});

	return serverData;
}

function convertHotkeysFromServerFormat(serverData) {
	if (!serverData || !serverData.data) {
		return;
	}

	if (serverData.data.EmotionHotkey) {
		const emotionKeys = [
			'Macro1',
			'Macro2',
			'Macro3',
			'Macro4',
			'Macro5',
			'Macro6',
			'Macro7',
			'Macro8',
			'Macro9',
			'Macro10'
		];
		serverData.data.EmotionHotkey.forEach((emotion, index) => {
			if (emotion && emotionKeys[index]) {
				if (!ShortCutControls.ShortCuts[emotionKeys[index]].cust) {
					ShortCutControls.ShortCuts[emotionKeys[index]].cust = {};
				}
				ShortCutControls.ShortCuts[emotionKeys[index]].cust.emotion = emotion;
			}
		});
	}

	if (serverData.data.UserHotkey_V2 && serverData.data.UserHotkey_V2.SkillBar_1Tab) {
		const shortcutKeys = [
			'F1_1',
			'F1_2',
			'F1_3',
			'F1_4',
			'F1_5',
			'F1_6',
			'F1_7',
			'F1_8',
			'F1_9',
			'F2_1',
			'F2_2',
			'F2_3',
			'F2_4',
			'F2_5',
			'F2_6',
			'F2_7',
			'F2_8',
			'F2_9',
			'F3_1',
			'F3_2',
			'F3_3',
			'F3_4',
			'F3_5',
			'F3_6',
			'F3_7',
			'F3_8',
			'F3_9',
			'F4_1',
			'F4_2',
			'F4_3',
			'F4_4',
			'F4_5',
			'F4_6',
			'F4_7',
			'F4_8',
			'F4_9'
		];

		serverData.data.UserHotkey_V2.SkillBar_1Tab.forEach(skillData => {
			if (skillData && skillData.index < shortcutKeys.length) {
				const key = shortcutKeys[skillData.index];
				if (key && skillData.key1) {
					if (!ShortCutControls.ShortCuts[key].cust) {
						ShortCutControls.ShortCuts[key].cust = {};
					}
					ShortCutControls.ShortCuts[key].cust.key = skillData.key1;
				}
			}
		});
	}
}

function haveHotkeysChanged(currentData) {
	if (!_lastServerHotkeys) {
		return true;
	}
	return JSON.stringify(currentData) !== JSON.stringify(_lastServerHotkeys);
}

ShortCut.saveToServer = function saveToServer() {
	if (PACKETVER.value >= 20170315 && Session.WebToken) {
		const hotkeys = JSON.stringify(convertHotkeysToServerFormat());
		if (!haveHotkeysChanged(hotkeys)) {
			return;
		}
		const formData = new FormData();
		formData.append('AID', Session.AID);
		formData.append('WorldName', Session.ServerName);
		formData.append('AuthToken', Session.WebToken);
		formData.append('data', hotkeys);

		const xhr = new XMLHttpRequest();
		let webserverAddress = '';
		if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
			webserverAddress = Configs.get('webserverAddress', 'http://127.0.0.1:8888');
		}
		xhr.open('POST', `${webserverAddress}/userconfig/save`, true);
		xhr.timeout = 5000;
		xhr.onload = () => {
			if (xhr.status === 200) {
				console.log('Hotkeys saved to server successfully');
			} else {
				console.warn('Hotkey save returned non-200 status:', xhr.status);
			}
		};
		xhr.onerror = () => {
			console.warn('Hotkey save failed: web-server unreachable');
		};
		xhr.ontimeout = () => {
			console.warn('Hotkey save timed out');
		};
		xhr.send(formData);
	}
};

ShortCut.loadFromServer = function loadFromServer(callback) {
	if (PACKETVER.value >= 20170315 && Session.WebToken) {
		const formData = new FormData();
		formData.append('AID', Session.AID);
		formData.append('WorldName', Session.ServerName);
		formData.append('AuthToken', Session.WebToken);

		const xhr = new XMLHttpRequest();
		let webserverAddress = '';
		if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
			webserverAddress = Configs.get('webserverAddress', 'http://127.0.0.1:8888');
		}
		xhr.open('POST', `${webserverAddress}/userconfig/load`, true);
		xhr.timeout = 5000;
		xhr.onload = () => {
			if (xhr.status === 200) {
				try {
					const serverData = JSON.parse(xhr.responseText);
					_lastServerHotkeys = JSON.parse(JSON.stringify(serverData));
					convertHotkeysFromServerFormat(serverData);
				} catch (e) {
					console.error('Error parsing server hotkeys:', e);
				}
			} else {
				console.warn('Hotkey load returned non-200 status:', xhr.status);
			}
			if (callback) {
				callback();
			}
		};
		xhr.onerror = () => {
			console.warn('Hotkey load failed: web-server unreachable');
			if (callback) {
				callback();
			}
		};
		xhr.ontimeout = () => {
			console.warn('Hotkey load timed out');
			if (callback) {
				callback();
			}
		};
		xhr.send(formData);
	} else if (callback) {
		callback();
	}
};

ShortCut.getList = function getList() {
	return _list;
};

/**
 * Create component and export it
 */
export default UIManager.addComponent(ShortCut);
