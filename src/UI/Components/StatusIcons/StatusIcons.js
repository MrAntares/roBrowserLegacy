/**
 * UI/Components/StatusIcons/StatusIcons.js
 *
 * Status Icons UI
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import StatusTable from 'DB/Status/StatusInfo.js';
import { emPortugues } from '../../../DB/Status/StatusInfoPtBr.js';
import SC from 'DB/Status/StatusConst.js';
import DB from 'DB/DBManager.js';
import Texture from 'Utils/Texture.js';
import Client from 'Core/Client.js';
import Renderer from 'Renderer/Renderer.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import ScreenEffectManager from 'Renderer/ScreenEffectManager.js';
import Session from 'Engine/SessionStorage.js';
import htmlText from './StatusIcons.html?raw';
import cssText from './StatusIcons.css?raw';
import {
	LADO_DO_ICONE,
	PASSO_HORIZONTAL,
	PASSO_VERTICAL,
	formatarRelogioDoBuff,
	getStatusEnd,
	getStatusIconsPerColumn,
	getStatusLabel,
	isStatusActive,
	tempoDaDica
} from './statusTiming.js';

/**
 * Create component
 */
const StatusIcons = new GUIComponent('StatusIcons', cssText);

StatusIcons.render = () => htmlText;

/**
 * Mouse can cross this UI
 */
StatusIcons.mouseMode = GUIComponent.MouseMode.CROSS;

/**
 * @var {boolean} do not focus this UI
 */
StatusIcons.needFocus = false;

/**
 * @var {Array} status list
 */
let _status = {};

/**
 * @var {int} last updated time
 */
let _last_updated_time = Date.now();

/**
 * @var {int} render wait time
 */
const _render_time = 500;

const TKM_ICON_OVERRIDE = {
	[SC.ASPERSIO]: 'i_p_SAINT.tga',
	[SC.PROPERTYFIRE]: 'i_p_FIRE.tga',
	[SC.PROPERTYWATER]: 'i_p_WATER.tga',
	[SC.PROPERTYWIND]: 'i_p_WIND.tga',
	[SC.PROPERTYGROUND]: 'i_p_EARTH.tga',
	[SC.PROPERTYDARK]: 'i_p_DARK.tga',
	[SC.PROPERTYTELEKINESIS]: 'i_p_TELE.tga'
};

/**
 * Start rendering icons
 */
StatusIcons.onAppend = function onAppend() {
	resetElementsPosition();
	Renderer.render(rendering);
};

/**
 * Stop rendering icons
 */
StatusIcons.onRemove = function onRemove() {
	Renderer.stop(rendering);
};

/**
 * Clean up component
 */
/**
 * Existe um status ATIVO com este index agora? (D-1381, 13/09/2026: o
 * "Dormir" pergunta ao jogador antes de congelar a taxa durante um evento de
 * EXP — `SC.CASH_PLUSEXP`, o mesmo EFST que a HUD ja desenha.) `_status` e o
 * MESMO registro que `update`/`removeElementIndex` mantem: nenhum estado
 * novo, so uma pergunta sobre o que ja existe.
 */
StatusIcons.estaAtivo = function estaAtivo(index) {
	return index in _status;
};

StatusIcons.clean = function clean() {
	const root = StatusIcons.getRoot();
	const container = root.querySelector('#StatusIcons');
	if (container) {
		container.innerHTML = '';
	}
	_status = {};
	ScreenEffectManager.clean();
};

/**
 * Update icon on screen
 *
 * @param {number} status id
 * @param {number} enable/disable
 * @param {number} life time
 */
StatusIcons.update = function update(index, state, life) {
	const active = isStatusActive(state);

	// Um `state` explicito em zero e autoritativo, mesmo quando uma variante
	// de servidor conserva RemainMS no pacote de remocao.
	if (!active) {
		removeElementIndex(index);
		resetElementsPosition();
		return;
	}

	// Intialize slot
	if (!(index in _status)) {
		createElement(index);
	}

	// Save tick for progressbar
	_status[index].start = Renderer.tick;
	_status[index].end = getStatusEnd(Renderer.tick, life);
	// C9 (29/09/2026): status re-emitido com o icone ja na tela ganha o relogio
	// novo AGORA, sem esperar o passo de 500 ms do `rendering`.
	if (_status[index].img) {
		renderStatus(_status[index], Renderer.tick);
	}

	// O cliente desta instalacao roda com loadLua:false porque o conjunto de
	// dados nao possui todos os LUBs. Um EFST legitimo sem entrada hardcoded
	// ainda precisa existir na HUD; recebe fallback ate haver arte oficial.
	if (!StatusTable[index] || !StatusTable[index].icon) {
		addFallbackStatusIcon(index);
		ScreenEffectManager.parseStatus(index);
		return;
	}

	// Image already loaded.
	//
	// For statuses with a TKM (Warm Wind) icon override, the variant
	// can flip when the player's job changes (e.g. @job from a
	// TaeKwon-tree class to another, or vice versa). The official
	// client also re-resolves the icon path on every status update —
	// so as long as the server re-emits the status (re-cast, refresh
	// scroll), we pick up the new variant. If the buff is held
	// without any re-emit, the cached icon stays, which matches the
	// official client behaviour.
	if (_status[index].img) {
		if (TKM_ICON_OVERRIDE[index]) {
			const isTKM = Session.Entity && DB.isTaeKwon(Session.Entity._job);
			const wantVariant = (isTKM && TKM_ICON_OVERRIDE[index]) || null;
			if (_status[index].tkmVariant !== wantVariant) {
				_status[index].img = null;
			} else {
				return;
			}
		} else {
			return;
		}
	}
	if (_status[index].loading) {
		return;
	}

	loadStatusIcon(index);

	ScreenEffectManager.parseStatus(index);
};

/** O icone e uma arte publicada pelo jogo (URL absoluta), e nao um arquivo do GRF? */
export function iconeDePublicacao(nome) {
	return typeof nome === 'string' && nome.startsWith('/');
}

function loadStatusIcon(index) {
	const isTKM = Session.Entity && DB.isTaeKwon(Session.Entity._job);
	const tkmVariant = (isTKM && TKM_ICON_OVERRIDE[index]) || null;
	const iconName = tkmVariant || StatusTable[index].icon;
	_status[index].tkmVariant = tkmVariant;
	_status[index].loading = true;
	// ARTE PUBLICADA PELO JOGO (caminho com "/", ex.: o cronometro da Praca de
	// Zeny): vem por URL, e nao do GRF, que nao a tem.
	if (iconeDePublicacao(iconName)) {
		const img = new Image();
		img.onload = () => {
			if (_status[index] && !_status[index].img) {
				_status[index].loading = false;
				addResizedStatusIcon(img, index);
			}
		};
		img.onerror = () => addFallbackStatusIcon(index);
		img.src = iconName;
		return;
	}
	Client.loadFile(
		`data/texture/effect/${iconName}`,
		data => {
			Texture.load(data, function (success) {
				if (_status[index] && !_status[index].img) {
					_status[index].loading = false;
					if (!success || !this) {
						addFallbackStatusIcon(index);
						return;
					}
					addResizedStatusIcon(this, index);
				}
			});
		},
		() => addFallbackStatusIcon(index)
	);
}

/**
 * Um arquivo ausente nao pode transformar silenciosamente um buff ativo em
 * "nada". O fallback preserva o slot e o tooltip ate o GRF ser corrigido.
 */
function addFallbackStatusIcon(index) {
	if (!_status[index] || _status[index].img) {
		return;
	}

	const canvas = document.createElement('canvas');
	canvas.width = 32;
	canvas.height = 32;
	const ctx = canvas.getContext('2d');
	const gradient = ctx.createLinearGradient(0, 0, 0, 32);
	gradient.addColorStop(0, '#4b81b8');
	gradient.addColorStop(1, '#12315a');
	ctx.fillStyle = gradient;
	ctx.beginPath();
	ctx.roundRect(1, 1, 30, 30, 6);
	ctx.fill();
	ctx.strokeStyle = '#e9cc8f';
	ctx.stroke();
	ctx.fillStyle = '#ffffff';
	ctx.font = '700 10px Arial';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	const initials = getStatusLabel(SC, index)
		.split(' ')
		.slice(0, 2)
		.map(word => word.charAt(0))
		.join('')
		.toUpperCase();
	ctx.fillText(initials || '?', 16, 16);

	_status[index].loading = false;
	_status[index].img = canvas;
	mostrarIcone(index);
}

/**
 * O icone entra na tela JA com o relogio pintado (C9, 29/09/2026). Antes a
 * faixa so era escrita no proximo passo do laco `rendering`, que e global e de
 * 500 ms: um status curto (o Contra-Ataque dura 2 s) passava ate meio segundo
 * sem numero, e a auditoria de tela o fotografava vazio.
 */
function mostrarIcone(index) {
	addElement(_status[index].element);
	renderStatus(_status[index], Renderer.tick);
}

function addResizedStatusIcon(img, index) {
	if (img.width < 33 && img.height < 33) {
		_status[index].img = img;
		mostrarIcone(index);
		return;
	}

	const canvas = document.createElement('canvas');
	canvas.width = 32;
	canvas.height = 32;
	const ctx = canvas.getContext('2d');

	ctx.save();
	ctx.translate(0, 32); // Move to left
	ctx.scale(1, -1); // flip vertical  (official client does)

	// resize with scale
	const scale = Math.min(32 / img.width, 32 / img.height);
	const width = img.width * scale;
	const height = img.height * scale;
	const x = (32 - width) / 2;
	const y = (32 - height) / 2;

	ctx.drawImage(img, x, y, width, height);
	ctx.restore();

	const resizedImg = new Image();
	resizedImg.src = canvas.toDataURL();
	resizedImg.onload = () => {
		if (!_status[index]) {
			return;
		}
		_status[index].img = resizedImg;
		mostrarIcone(index);
	};
}

/**
 * Reset elements position.
 *
 * Used when one element is removed.
 */
function resetElementsPosition() {
	const root = StatusIcons.getRoot();
	const elements = root.querySelectorAll('.state');
	const count = elements.length;
	const perColumn = getIconsPerColumn();

	for (let i = 0; i < count; ++i) {
		const element = elements[i];
		element.style.top = `${(i % perColumn) * PASSO_VERTICAL}px`;
		element.style.right = `${Math.floor(i / perColumn) * PASSO_HORIZONTAL}px`;
	}
}

function getIconsPerColumn() {
	const hostTop =
		StatusIcons._host && StatusIcons._host.isConnected ? StatusIcons._host.getBoundingClientRect().top : 0;
	return getStatusIconsPerColumn(Renderer.height, hostTop);
}

/**
 * Remove an element from list and DOM
 *
 * @param {number} index
 */
function removeElementIndex(index) {
	if (!(index in _status)) {
		return;
	}

	const element = _status[index].element;

	if (element && element.parentNode) {
		element.parentNode.removeChild(element);
	}

	ScreenEffectManager.cleanStatusEffect(index);

	delete _status[index];
}

/**
 * Create an element
 *
 * @param {number} index
 */
function createElement(index) {
	const state = document.createElement('div');
	state.className = 'state';

	/*
	 * A CELULA (06/09/2026 — pedido do dono, com print): moldura com o icone
	 * dentro e, colada embaixo, a faixa com o tempo que falta.
	 *
	 * Ate aqui o `<canvas>` era filho direto de `.state` e nao tinha moldura
	 * nenhuma: o icone ficava solto no canto da tela, e o tempo restante so
	 * existia dentro da dica de hover — que no celular ninguem alcanca, porque
	 * nao ha hover. A faixa poe o numero na tela em qualquer aparelho.
	 *
	 * A moldura e um `<div>` proprio, e nao borda no `.state`, porque a faixa
	 * precisa ficar FORA dela: com borda no `.state`, o relogio entraria dentro
	 * do quadro do icone.
	 */
	const moldura = document.createElement('div');
	moldura.className = 'moldura';

	const canvas = document.createElement('canvas');
	canvas.width = LADO_DO_ICONE;
	canvas.height = LADO_DO_ICONE;
	moldura.appendChild(canvas);
	state.appendChild(moldura);

	const relogio = document.createElement('div');
	relogio.className = 'relogio';
	state.appendChild(relogio);

	_status[index] = {};
	_status[index].element = state;
	_status[index].relogio = relogio;
	_status[index].ctx = canvas.getContext('2d');

	// Add description. Sem os LUBs stateicon, o nome do EFST e melhor que um
	// icone mudo: deixa o jogador e o diagnostico identificarem o buff ausente.
	const descriptions =
		StatusTable[index] && StatusTable[index].descript && StatusTable[index].descript.length
			? StatusTable[index].descript
			: [[getStatusLabel(SC, index)]];
	if (descriptions.length) {
		const info = document.createElement('div');
		info.className = 'description';

		const lines = descriptions;
		const count = lines.length;

		for (let i = 0; i < count; ++i) {
			const line = document.createElement('div');
			// A dica sai em PORTUGUES (03/09/2026). Frase sem traducao passa
			// direto — ver `StatusInfoPtBr.js` para o porque do dicionario.
			line.textContent = emPortugues(lines[i][0]);

			// Custom color
			if (lines[i][1]) {
				line.style.color = lines[i][1];
			}

			// Time value
			line.innerHTML = line.innerHTML.replace('%s', '<span class="time">0</span>');
			info.appendChild(line);
		}

		const time = info.getElementsByClassName('time');
		if (time.length) {
			_status[index].time = time[0];
			_status[index].timeTick = 0;
		}

		state.appendChild(info);
	}
}

/**
 * Add element to the list, helper for multi-column
 *
 * A CONTA DA POSICAO E UMA SO (06/09/2026): esta funcao repetia, com os
 * numeros escritos a mao, a mesma aritmetica de `resetElementsPosition` — duas
 * copias que precisavam concordar para a pilha nao ficar torta, e que so
 * concordavam por sorte. Anexar e reposicionar todo mundo da o mesmo resultado
 * (a ordem do DOM e a ordem de insercao) com uma fonte so.
 *
 * @param {CanvasElement}
 */
function addElement(element) {
	const root = StatusIcons.getRoot();
	const container = root.querySelector('#StatusIcons');
	if (container) {
		container.appendChild(element);
	}
	resetElementsPosition();
}

/**
 * Rendering a status icon
 *
 * @param {object} status
 * @param {number} tick
 */
function renderStatus(status, now) {
	if (!status.img) {
		return;
	}

	const ctx = status.ctx;
	let end = status.end;

	if (now > end) {
		end = now;
	}

	/*
	 * O ICONE SAI LIMPO (06/09/2026). Ate aqui, por cima dele era pintado um
	 * setor de circulo translucido — a "torta" de progresso do upstream —, e
	 * com a faixa numerica embaixo ele passou a ser ruido: sao duas leituras do
	 * mesmo dado, e a que borra o glifo e a menos precisa. A print do dono nao
	 * tem torta nenhuma.
	 */
	ctx.clearRect(0, 0, LADO_DO_ICONE, LADO_DO_ICONE);
	ctx.drawImage(status.img, 0, 0);

	/*
	 * A FAIXA e escrita a cada passe (meio segundo), e nao a cada segundo como
	 * a dica: a comparacao com o texto de agora evita o toque no DOM quando
	 * nada mudou, que e o custo real — e um relogio que so acorda de segundo em
	 * segundo perde o instante em que o buff acaba.
	 */
	if (status.relogio) {
		const texto = formatarRelogioDoBuff(end - now);
		if (status.relogio.textContent !== texto) {
			status.relogio.textContent = texto;
		}
	}

	if (status.time && status.timeTick + 1000 < now) {
		status.timeTick = now;

		/*
		 * O TEMPO EM PORTUGUES, E O PLURAL CERTO (03/09/2026).
		 *
		 * O upstream escrevia `17 minute(s) 13 second(s)`: ingles, e com o `(s)`
		 * que evita decidir o plural. Em portugues da para decidir — 1 minuto, 2
		 * minutos —, e o `(s)` num HUD inteiro em portugues le como texto nao
		 * traduzido, que e o que o dono reportou.
		 *
		 * `DB.getMessage(1807/1808)` vem do `msgstringtable` do cliente oficial:
		 * quando ele existe, manda ele; o segundo argumento e so o fallback. Por
		 * isso a traducao passa por `emPortugues` DEPOIS — assim ela cobre os dois
		 * casos, a tabela e o fallback.
		 *
		 * A CONTA saiu para `tempoDaDica` (13/09/2026, D-1376): a tabela desta
		 * instalacao ja traz a palavra no plural, e o `+ 's'` daqui escrevia
		 * `minutoss`; e so havendo minuto e segundo, o evento de EXP de dois dias
		 * aparecia como 2878 minutos.
		 */
		status.time.textContent =
			now >= end || end === Infinity
				? ''
				: tempoDaDica(
						end - now,
						emPortugues(DB.getMessage(1807, 'minute')),
						emPortugues(DB.getMessage(1808, 'second'))
					);
	}
}

/**
 * Rendering status icons progressbar
 *
 * @param {number} tick
 */
function rendering(tick) {
	const indexes = Object.keys(_status);
	const count = indexes.length;

	const time_now = Date.now();
	if (time_now - _last_updated_time > _render_time) {
		_last_updated_time = time_now;
		for (let i = 0; i < count; ++i) {
			renderStatus(_status[indexes[i]], tick);
		}
	}
}

/**
 * Create component and return it
 */
export default UIManager.addComponent(StatusIcons);
