import { describe, expect, it, vi } from 'vitest';

/*
 * A BARRA DE VIDA NAO SE REDESENHA COM AS MESMAS ENTRADAS (D-2374).
 *
 * `EntityLife.update()` redimensionava o canvas (o que zera o bitmap) e
 * repintava tudo a cada pacote de HP/SP — e o servidor reenvia a ficha a cada
 * ficha suja do tique, com o mesmo HP. Agora o desenho guarda as entradas e
 * pula quando nada mudou.
 *
 * Contagem (o portao): 6 `update()` com as mesmas entradas
 *   ANTES (a3ebe0fe): 6 redesenhos. DEPOIS: 1.
 * Exatidao (o oraculo): depois de CADA passo de uma sequencia semeada, o
 * bitmap do canvas (as operacoes desde o ultimo redimensionamento), o z-index
 * e o `display` sao IGUAIS aos de uma barra nova com o mesmo estado, desenhada
 * do zero — que e o que o codigo antigo fazia a todo pacote.
 */

let classeDoJob = 'First_Class';
vi.doMock('DB/DBManager.js', () => ({ default: { getJobClass: () => classeDoJob } }));
vi.doMock('Renderer/Renderer.js', () => ({ default: { tick: 0 } }));
vi.doMock('Core/Events.js', () => ({ default: { setTimeout: () => 0, clearTimeout: () => {} } }));
vi.doMock('Renderer/Entity/EntityOverlay.js', () => ({ default: { append: () => {} } }));

/*
 * Um contexto 2D que GRAVA: cada canvas guarda as operacoes desde o ultimo
 * `width`/`height` atribuido (atribuir zera o bitmap, como no navegador), e
 * conta quantas vezes foi redimensionado (= quantos redesenhos houve).
 */
HTMLCanvasElement.prototype.getContext = function getContext() {
	if (this.__ctx) return this.__ctx;
	const canvas = this;
	let largura = 300;
	let altura = 150;
	canvas.__ops = [];
	canvas.__redesenhos = 0;
	Object.defineProperty(canvas, 'width', {
		get: () => largura,
		set: v => {
			largura = v;
			canvas.__ops = [];
			canvas.__redesenhos++;
		}
	});
	Object.defineProperty(canvas, 'height', {
		get: () => altura,
		set: v => {
			altura = v;
			canvas.__ops = [];
		}
	});
	const ctx = {
		canvas,
		fillStyle: '',
		fillRect(...a) {
			canvas.__ops.push([ctx.fillStyle, ...a]);
		}
	};
	canvas.__ctx = ctx;
	return ctx;
};

const { default: iniciarVida } = await import('Renderer/Entity/EntityLife.js');

class Ent {
	static TYPE_PC = 0;
	static TYPE_NPC_ABR = 3;
	static TYPE_NPC_BIONIC = 4;
	static TYPE_MOB = 5;
	static TYPE_PET = 7;
}

function entidade(tipo = Ent.TYPE_PC) {
	const e = new Ent();
	e.objecttype = tipo;
	e._job = 1;
	iniciarVida.call(e);
	return e;
}

/** O que esta no canvas agora: o bitmap (operacoes), o tamanho, o z-index e o display. */
function retrato(life) {
	return {
		ops: JSON.stringify(life.canvas.__ops),
		w: life.canvas.width,
		h: life.canvas.height,
		z: String(life.canvas.style.zIndex),
		display: life.display
	};
}

const CAMPOS = ['hp', 'hp_max', 'sp', 'sp_max', 'ap', 'ap_max', 'hunger', 'hunger_max'];

/** O oraculo: uma barra NOVA, com o mesmo estado, desenhada uma vez do zero. */
function desenhadaDoZero(life) {
	const outra = entidade(life.entity.objecttype);
	for (const c of CAMPOS) outra.life[c] = life[c];
	outra.life.update();
	return retrato(outra.life);
}

describe('a barra de vida nao se redesenha com as mesmas entradas', () => {
	it('seis updates iguais: UM redesenho (antes: seis)', () => {
		const e = entidade();
		Object.assign(e.life, { hp: 500, hp_max: 1000, sp: 10, sp_max: 20 });
		for (let i = 0; i < 6; ++i) {
			e.life.update();
		}
		expect(e.life.canvas.__redesenhos).toBe(1);
		expect(retrato(e.life)).toEqual(desenhadaDoZero(e.life));
	});

	it('cada campo que o desenho le, mudado sozinho, redesenha', () => {
		const e = entidade();
		Object.assign(e.life, { hp: 500, hp_max: 1000, sp: 10, sp_max: 20, ap: 5, ap_max: 10, hunger: 3, hunger_max: 9 });
		e.life.update();
		let antes = e.life.canvas.__redesenhos;
		for (const c of CAMPOS) {
			e.life[c] += 1;
			e.life.update();
			expect(e.life.canvas.__redesenhos, `mudar ${c} tem de redesenhar`).toBe(antes + 1);
			antes = e.life.canvas.__redesenhos;
			expect(retrato(e.life)).toEqual(desenhadaDoZero(e.life));
		}
		e.objecttype = Ent.TYPE_PET;
		e.life.update();
		expect(e.life.canvas.__redesenhos, 'mudar o tipo tem de redesenhar').toBe(antes + 1);
		antes = e.life.canvas.__redesenhos;
		classeDoJob = 'Fourth_Class';
		e.life.update();
		classeDoJob = 'First_Class';
		expect(e.life.canvas.__redesenhos, 'virar quarta classe (a barra de AP) tem de redesenhar').toBe(antes + 1);
	});

	it('remover e voltar com o mesmo HP: o display volta, sem redesenho, e o bitmap e o certo', () => {
		const e = entidade();
		Object.assign(e.life, { hp: 500, hp_max: 1000 });
		e.life.update();
		e.life.remove();
		expect(e.life.display).toBe(false);
		e.life.update();
		expect(e.life.display).toBe(true);
		expect(e.life.canvas.__redesenhos).toBe(1);
		expect(retrato(e.life)).toEqual(desenhadaDoZero(e.life));
	});

	it('HP sem teto (o "sem informacao") remove, e voltar redesenha so se mudou', () => {
		const e = entidade();
		Object.assign(e.life, { hp: 500, hp_max: 1000 });
		e.life.update();
		e.life.hp_max = 0;
		e.life.update();
		expect(e.life.display).toBe(false);
		e.life.hp_max = 1000;
		e.life.update();
		expect(e.life.display).toBe(true);
		expect(retrato(e.life)).toEqual(desenhadaDoZero(e.life));
	});

	it('o contexto 2D perdido e devolvido pelo navegador (em branco) faz o proximo update redesenhar', () => {
		const e = entidade();
		Object.assign(e.life, { hp: 500, hp_max: 1000 });
		e.life.update();
		e.life.canvas.dispatchEvent(new Event('contextlost'));
		e.life.update();
		expect(e.life.canvas.__redesenhos).toBe(2);
		e.life.canvas.dispatchEvent(new Event('contextrestored'));
		e.life.update();
		expect(e.life.canvas.__redesenhos).toBe(3);
	});

	it('canvas redimensionado por fora (nunca acontece hoje) tambem redesenha', () => {
		const e = entidade();
		Object.assign(e.life, { hp: 500, hp_max: 1000 });
		e.life.update();
		e.life.canvas.height = 99;
		e.life.update();
		expect(e.life.canvas.__redesenhos).toBe(2);
		expect(retrato(e.life)).toEqual(desenhadaDoZero(e.life));
		e.life.canvas.width = 300; // conta como redesenho no duplo; o que importa e o proximo
		e.life.update();
		expect(e.life.canvas.__redesenhos).toBe(4);
		expect(retrato(e.life)).toEqual(desenhadaDoZero(e.life));
	});

	it('ORACULO: 600 passos semeados, PC, mob e pet, igual ao caminho antigo a cada passo', () => {
		/*
		 * O gemeo recebe a MESMA sequencia, mas com o memo derrubado antes de
		 * cada `update()` — e o caminho antigo, que redesenhava sempre, com a
		 * mesma continuidade de estado (o `VidaNoImpacto` do mob guarda o HP
		 * anterior, entao uma barra nova nao serviria de oraculo para ele).
		 */
		let s = 2374;
		const sorte = () => {
			s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
			return s / 4294967296;
		};
		for (const tipo of [Ent.TYPE_PC, Ent.TYPE_MOB, Ent.TYPE_PET]) {
			const e = entidade(tipo);
			const gemeo = entidade(tipo);
			for (let passo = 0; passo < 600; ++passo) {
				// Valores de um conjunto pequeno: repetir e o caso que importa.
				const c = CAMPOS[Math.floor(sorte() * 4)];
				const v = [-1, 0, 100, 250, 1000][Math.floor(sorte() * 5)];
				e.life[c] = v;
				gemeo.life[c] = v;
				e.life.update();
				gemeo.life._desenhoValido = false;
				gemeo.life.update();
				expect(retrato(e.life), `passo ${passo}`).toEqual(retrato(gemeo.life));
			}
			// E economizou de fato (na sequencia de 2374: 203 contra 259 no PC).
			expect(e.life.canvas.__redesenhos).toBeLessThan(gemeo.life.canvas.__redesenhos);
		}
	});
});
