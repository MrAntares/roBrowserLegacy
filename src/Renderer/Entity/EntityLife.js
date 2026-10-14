/**
 * Renderer/EntityLife.js
 *
 * Manage Entity Life GUI
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import glMatrix from 'Utils/gl-matrix.js';
import DB from 'DB/DBManager.js';
import EntityOverlay from 'Renderer/Entity/EntityOverlay.js';
import Events from 'Core/Events.js';
import Renderer from 'Renderer/Renderer.js';
import VidaNoImpacto from 'Renderer/Entity/VidaNoImpacto.js';

/**
 * Global methods
 */
const vec4 = glMatrix.vec4;
const _pos = new Float32Array(4);
const _size = new Float32Array(2);

/**
 * Life class — HP / SP / AP health bar rendering above entity
 *
 * @class Life
 * @property {number} hp Current health points
 * @property {number} sp Current spell points
 * @property {number} ap Current action points
 * @property {number} hp_max Maximum health points
 * @property {number} sp_max Maximum spell points
 * @property {number} ap_max Maximum action points
 * @property {number} hunger Current companion hunger
 * @property {number} hunger_max Max companion hunger
 * @property {boolean} display Whether health bar is visible
 * @property {HTMLCanvasElement} canvas Health bar canvas element
 * @property {CanvasRenderingContext2D} ctx 2d context for health bar
 * @property {Entity|null} entity Attached entity reference
 */
class Life {
	constructor() {
		this.hp = -1;
		this.sp = -1;
		this.ap = -1;
		this.hp_max = -1;
		this.sp_max = -1;
		this.ap_max = -1;
		this.display = false;
		this.canvas = document.createElement('canvas');
		this.canvas.className = 'entity-life';
		this.ctx = this.canvas.getContext('2d');
		this.canvas.style.position = 'absolute';
		this.canvas.style.zIndex = 1;
		this.entity = null;
		this.hunger = -1;
		this.hunger_max = -1;
		this.vidaNoImpacto = new VidaNoImpacto(
			() => Renderer.tick,
			Events.setTimeout,
			Events.clearTimeout,
			() => this.update(),
			// A aba escondida (relato de 03/10, ver VidaNoImpacto): ninguem ve o impacto.
			() => typeof document !== 'undefined' && document.hidden === true
		);
		/*
		 * O ULTIMO DESENHO (D-2374, 13/10/2026). `update()` redesenhava o canvas
		 * inteiro (redimensionar zera o bitmap, mais cinco `fillRect`) a CADA
		 * pacote — e o servidor reenvia a ficha a cada ficha suja do tique, com
		 * o mesmo HP. Os campos abaixo guardam as entradas do ultimo desenho; se
		 * o pacote seguinte traz as mesmas, o bitmap que esta no canvas JA E o
		 * que seria desenhado, e o redesenho e pulado. So este metodo escreve no
		 * canvas (o Grupo so o LE com `drawImage`), entao nada o suja por fora.
		 * O contexto 2D perdido pelo navegador volta EM BRANCO: o memo cai e o
		 * proximo `update()` redesenha, como antes.
		 */
		this._desenhoValido = false;
		this._dTipo = 0;
		this._dHp = 0;
		this._dHpMax = 0;
		this._dSp = 0;
		this._dSpMax = 0;
		this._dAp = 0;
		this._dApMax = 0;
		this._dFome = 0;
		this._dFomeMax = 0;
		this.canvas.addEventListener('contextlost', () => {
			this._desenhoValido = false;
		});
		this.canvas.addEventListener('contextrestored', () => {
			this._desenhoValido = false;
		});
	}

	/**
	 * As entradas do desenho sao as mesmas do ultimo? (D-2374)
	 *
	 * Compara TODO campo que o desenho le, inclusive os que o ramo atual nao
	 * usa (o SP de quem nao mostra SP): conservador de proposito — no pior caso
	 * redesenha sem precisar, nunca pula um desenho que mudaria. NaN nunca e
	 * igual a nada, entao tambem redesenha. A "quarta classe" nao entra: ela so
	 * muda a ALTURA (a faixa de AP), e a altura do canvas ja e comparada — a
	 * bateria de mutacao mostrou que compara-la tambem era redundante.
	 *
	 * @returns {boolean}
	 */
	mesmoDesenho(tipo, hpVisivel, altura) {
		return (
			this._desenhoValido &&
			this._dTipo === tipo &&
			this._dHp === hpVisivel &&
			this._dHpMax === this.hp_max &&
			this._dSp === this.sp &&
			this._dSpMax === this.sp_max &&
			this._dAp === this.ap &&
			this._dApMax === this.ap_max &&
			this._dFome === this.hunger &&
			this._dFomeMax === this.hunger_max &&
			this.canvas.width === 60 &&
			this.canvas.height === altura
		);
	}

	/** Guarda as entradas do desenho que acabou de sair (D-2374). */
	anotarDesenho(tipo, hpVisivel) {
		this._desenhoValido = true;
		this._dTipo = tipo;
		this._dHp = hpVisivel;
		this._dHpMax = this.hp_max;
		this._dSp = this.sp;
		this._dSpMax = this.sp_max;
		this._dAp = this.ap;
		this._dApMax = this.ap_max;
		this._dFome = this.hunger;
		this._dFomeMax = this.hunger_max;
	}

	/**
	 * Remove Life GUI
	 */
	remove() {
		this.display = false;
		this.canvas.remove();
	}

	/**
	 * Clean Up Life
	 */
	clean() {
		this.vidaNoImpacto.limpar();
		this.remove();
	}

	registrarImpactos(instantes) {
		this.vidaNoImpacto.receber(this.hp, this.hp_max);
		this.vidaNoImpacto.registrar(instantes);
	}

	/**
	 * Update life
	 */
	update() {
		const width = 60;
		let height = 5;
		const Entity = this.entity.constructor;

		// Don't display it, if negatives values.
		// RAGIDLE (08/09/2026): hp_max ZERO tambem e "sem informacao". O servidor
		// mandava 0/0 no pacote de entrada de todo jogador e a barra era desenhada
		// VAZIA (largura NaN) — a "barra de HP zerado" que o dono viu sobre os
		// outros jogadores. E e o apagador que o servidor manda no
		// ZC_NOTIFY_MONSTER_HP quando o mob saiu da luta.
		if (this.hp < 0 || this.hp_max <= 0) {
			this.remove();
			return;
		}

		// Init variables
		this.display = true;
		const ctx = this.ctx;
		const hpVisivel =
			this.entity.objecttype === Entity.TYPE_MOB ? this.vidaNoImpacto.receber(this.hp, this.hp_max) : this.hp;
		const hp_per = hpVisivel / this.hp_max;
		const sp = this.sp > -1 && this.sp_max > -1;
		const sp_per = this.sp / this.sp_max;
		const ap = this.ap > -1 && this.ap_max > -1;
		const ap_per = this.ap / this.ap_max;

		const hunger = this.hunger > -1 && this.hunger_max > -1;
		const hunger_per = this.hunger / this.hunger_max;

		if (sp) {
			height += 4;
		}

		// AP should only show to 4th Job Class
		if (DB.getJobClass(this.entity._job) === 'Fourth_Class' && ap) {
			height += 4;
		}

		if (hunger) {
			height += 4;
		}

		// D-2374: as mesmas entradas do ultimo desenho -> o canvas ja tem este
		// bitmap. O `display` (acima) e o `zIndex` (funcao do tipo, que entra na
		// comparacao) ficam como o desenho os deixaria.
		const tipo = this.entity.objecttype;
		if (this.mesmoDesenho(tipo, hpVisivel, height)) {
			return;
		}

		// Draw life
		ctx.canvas.width = width;
		ctx.canvas.height = height;

		// border
		ctx.fillStyle = '#10189c';
		ctx.fillRect(0, 0, width, height);

		// empty
		ctx.fillStyle = '#424242';
		ctx.fillRect(1, 1, width - 2, height - 2);

		//zIndex
		this.canvas.style.zIndex = this.entity.objecttype === Entity.TYPE_PC ? 2 : 1;

		// Display HP
		if (
			this.entity.objecttype === Entity.TYPE_MOB ||
			this.entity.objecttype === Entity.TYPE_NPC_ABR ||
			this.entity.objecttype === Entity.TYPE_NPC_BIONIC
		) {
			ctx.fillStyle = hp_per < 0.25 ? '#FFFF00' : '#FF00E7';
		} else if (this.entity.objecttype === Entity.TYPE_PET) {
			ctx.fillStyle = hp_per < 0.25 ? '#FFFF00' : '#FFE7E7';
		} else {
			ctx.fillStyle = hp_per < 0.25 ? '#FF0000' : '#10ef21';
		}

		ctx.fillRect(1, 1, Math.round((width - 2) * hp_per), 3);

		// Display SP
		if (sp) {
			ctx.fillStyle = '#10189c';
			ctx.fillRect(0, 4, width, 1);
			ctx.fillStyle = '#1863de';
			ctx.fillRect(1, 5, Math.round((width - 2) * sp_per), 3);
		}

		if (ap) {
			ctx.fillStyle = '#424242';
			ctx.fillRect(1, 9, width, 1);
			ctx.fillStyle = '#ffc663';
			ctx.fillRect(1, 9, Math.round((width - 2) * ap_per), 3);
		}

		if (hunger) {
			ctx.fillStyle = '#424242';
			ctx.fillRect(1, 9, width, 1);
			ctx.fillStyle = hunger_per < 0.25 ? '#FFFF00' : '#FFE7E7';
			ctx.fillRect(1, 9, Math.round((width - 2) * hunger_per), 3);
		}

		this.anotarDesenho(tipo, hpVisivel);
	}

	/**
	 * Rendering life
	 *
	 * @param {mat4} matrix
	 */
	render(matrix) {
		const canvas = this.canvas;

		// Cast position
		_pos[0] = 0.0;
		_pos[1] = -0.5;
		_pos[2] = 0.0;
		_pos[3] = 1.0;

		// Set the viewport
		_size[0] = window.innerWidth / 2;
		_size[1] = window.innerHeight / 2;

		// Project point to scene
		vec4.transformMat4(_pos, _pos, matrix);

		// Calculate position
		const z = _pos[3] === 0.0 ? 1.0 : 1.0 / _pos[3];
		_pos[0] = _size[0] + Math.round(_size[0] * (_pos[0] * z));
		_pos[1] = _size[1] - Math.round(_size[1] * (_pos[1] * z));

		// Check if the Vertical Flip (Illusion effect) is active
		// If true, invert the Y coordinate relative to the renderer height
		// Using a dynamic check or window access to avoid cycle if possible,
		// but usually Shaders don't import Renderer.
		if (window.VerticalFlip && window.VerticalFlip.isActive()) {
			_pos[1] = window.innerHeight - _pos[1];
		}

		canvas.style.top = (_pos[1] | 0) + 'px';
		canvas.style.left = ((_pos[0] - canvas.width / 2) | 0) + 'px';

		// Append to the clipped overlay layer
		EntityOverlay.append(canvas);
	}
}
/**
 * Export
 */
export default function Init() {
	this.life = new Life();
	this.life.entity = this;
}
