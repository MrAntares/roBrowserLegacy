/**
 * O RELOGIO DE RECARGA NA BARRA DE ATALHOS (item 3.10 do pedido do dono,
 * 09/10/2026): o `ZC_SKILL_POSTDELAY` (0x043d) acende o relogio no icone de
 * cada slot da barra que tem a skill, a sombra revela o icone em sentido
 * horario e o numero do centro conta; ao vencer, some.
 *
 * A barra e montada aqui em jsdom com a MESMA fabrica que `ShortCut.js` usa
 * (`criarRelogioDaBarra`), com um relogio de mentira (`agora`) e um armador
 * de intervalo espiao, para provar que nao sobra timer parado. As costuras
 * com `ShortCut.js` e com o pacote sao cobradas no fim, pelo fonte: o
 * componente da barra depende do DOM do roBrowser e nao monta em Node.
 *
 * O que NAO esta provado aqui, e e dito: a pintura (a fatia escura de fato
 * desenhada pelo `conic-gradient`, o numero legivel no celular). Isso pede a
 * tela de verdade (prova de tela do backend, prints-09-10).
 */
import fs from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import { CLASSE_DO_RELOGIO, criarRelogioDaBarra } from '../../src/UI/Components/ShortCut/relogioDaBarra.js';
import { PASSO_DO_RELOGIO_MS } from '../../src/UI/Components/ShortCut/relogioDeRecarga.js';

const ENDURE = 8;
const BASH = 5;
const PROVOKE = 6;

/** Uma barra minima: um `.container` por slot, com `.icon` quando ocupado. */
function montarBarra(slots) {
	document.body.innerHTML = '';
	const barra = document.createElement('div');
	barra.id = 'ShortCut';
	slots.forEach((s, i) => {
		const c = document.createElement('div');
		c.className = 'container';
		c.setAttribute('data-index', String(i));
		if (s) {
			c.innerHTML = '<div class="icon"><div class="img"></div><div class="amount"></div></div>';
		}
		barra.appendChild(c);
	});
	document.body.appendChild(barra);
	return barra;
}

function criar(lista) {
	const relogio = { t: 100000 };
	const timers = { armados: 0, desarmados: 0, vivo: null, fn: null };
	const r = criarRelogioDaBarra({
		slots: () =>
			lista.map((s, i) => ({
				skillId: s && s.isSkill ? s.ID : null,
				icone: document.querySelector(`.container[data-index="${i}"] .icon`)
			})),
		agora: () => relogio.t,
		armar: (fn, ms) => {
			expect(ms).toBe(PASSO_DO_RELOGIO_MS);
			timers.armados++;
			timers.fn = fn;
			timers.vivo = { fn };
			return timers.vivo;
		},
		desarmar: id => {
			expect(id).toBe(timers.vivo);
			timers.desarmados++;
			timers.vivo = null;
		}
	});
	/** Avanca o relogio de mentira e roda o passo armado (se houver). */
	const passar = ms => {
		relogio.t += ms;
		if (timers.vivo) {
			timers.fn();
		}
	};
	return { r, relogio, timers, passar };
}

const relogioDe = i => document.querySelector(`.container[data-index="${i}"] .${CLASSE_DO_RELOGIO}`);
const numeroDe = i => relogioDe(i).textContent;
const fracaoDe = i => Number(relogioDe(i).style.getPropertyValue('--cd-fracao'));

describe('o 0x043d acende o relogio no slot certo', () => {
	let lista;
	beforeEach(() => {
		lista = [{ isSkill: true, ID: BASH }, { isSkill: true, ID: ENDURE }, { isSkill: false, ID: 501 }, null];
		montarBarra(lista);
	});

	it('so o slot da skill recebe a sombra e o numero', () => {
		const { r } = criar(lista);
		r.recarga(ENDURE, 8000);
		expect(relogioDe(1)).not.toBeNull();
		expect(numeroDe(1)).toBe('8.0');
		expect(fracaoDe(1)).toBe(1);
		expect(relogioDe(0)).toBeNull();
		expect(relogioDe(2)).toBeNull();
		expect(document.querySelectorAll(`.${CLASSE_DO_RELOGIO}`).length).toBe(1);
	});

	it('a sombra anda e o numero conta a cada passo', () => {
		const { r, passar } = criar(lista);
		r.recarga(ENDURE, 8000);
		passar(2000);
		expect(numeroDe(1)).toBe('6.0');
		expect(fracaoDe(1)).toBeCloseTo(0.75, 3);
		passar(4000);
		expect(numeroDe(1)).toBe('2.0');
		expect(fracaoDe(1)).toBeCloseTo(0.25, 3);
	});

	it('recarga de 10 s ou mais mostra segundos inteiros', () => {
		const { r } = criar(lista);
		r.recarga(ENDURE, 60000);
		expect(numeroDe(1)).toBe('60s');
	});

	it('o relogio nao responde a mouse nem a leitor de tela', () => {
		const { r } = criar(lista);
		r.recarga(ENDURE, 8000);
		expect(relogioDe(1).getAttribute('aria-hidden')).toBe('true');
	});
});

describe('ao terminar some, e o timer para', () => {
	it('o relogio sai do icone e o intervalo e desarmado', () => {
		const lista = [{ isSkill: true, ID: ENDURE }];
		montarBarra(lista);
		const { r, timers, passar } = criar(lista);
		r.recarga(ENDURE, 1000);
		expect(timers.armados).toBe(1);
		passar(999);
		expect(relogioDe(0)).not.toBeNull();
		passar(1);
		expect(relogioDe(0)).toBeNull();
		expect(timers.desarmados).toBe(1);
		expect(timers.vivo).toBeNull();
		expect(r.vivas()).toEqual([]);
	});

	it('sem recarga nenhum intervalo e armado', () => {
		const lista = [{ isSkill: true, ID: ENDURE }];
		montarBarra(lista);
		const { r, timers } = criar(lista);
		r.desenhar();
		expect(timers.armados).toBe(0);
	});

	it('duas recargas vivas dividem UM intervalo', () => {
		const lista = [
			{ isSkill: true, ID: ENDURE },
			{ isSkill: true, ID: PROVOKE }
		];
		montarBarra(lista);
		const { r, timers, passar } = criar(lista);
		r.recarga(ENDURE, 8000);
		r.recarga(PROVOKE, 800);
		expect(timers.armados).toBe(1);
		passar(800);
		expect(relogioDe(1)).toBeNull();
		expect(relogioDe(0)).not.toBeNull();
		expect(timers.desarmados).toBe(0);
		passar(7200);
		expect(timers.desarmados).toBe(1);
	});

	it('delay zero ou invalido nao acende nada', () => {
		const lista = [{ isSkill: true, ID: ENDURE }];
		montarBarra(lista);
		const { r, timers } = criar(lista);
		r.recarga(ENDURE, 0);
		r.recarga(ENDURE, NaN);
		expect(relogioDe(0)).toBeNull();
		expect(timers.armados).toBe(0);
	});

	it('uma recarga mais curta nao encurta a que esta viva', () => {
		const lista = [{ isSkill: true, ID: ENDURE }];
		montarBarra(lista);
		const { r, passar } = criar(lista);
		r.recarga(ENDURE, 8000);
		passar(1000);
		r.recarga(ENDURE, 500);
		expect(numeroDe(0)).toBe('7.0');
	});
});

describe('skill sem slot na barra nao quebra', () => {
	it('a recarga fica guardada e acende quando a skill e posta na barra', () => {
		const lista = [{ isSkill: true, ID: BASH }, null];
		montarBarra(lista);
		const { r, passar } = criar(lista);
		expect(() => r.recarga(ENDURE, 8000)).not.toThrow();
		expect(document.querySelectorAll(`.${CLASSE_DO_RELOGIO}`).length).toBe(0);
		// o jogador arrasta o Endure para o slot 1 no meio da recarga
		lista[1] = { isSkill: true, ID: ENDURE };
		montarBarra(lista);
		passar(PASSO_DO_RELOGIO_MS);
		expect(relogioDe(1)).not.toBeNull();
		expect(relogioDe(0)).toBeNull();
	});

	it('slot cujo icone ainda nao carregou (sem .icon) e pulado', () => {
		const lista = [{ isSkill: true, ID: ENDURE }];
		montarBarra([null]);
		const { r } = criar(lista);
		expect(() => r.recarga(ENDURE, 8000)).not.toThrow();
		expect(document.querySelectorAll(`.${CLASSE_DO_RELOGIO}`).length).toBe(0);
	});
});

describe('mesma skill em dois slots mostra nos dois', () => {
	it('os dois icones ganham o relogio, com o mesmo numero, e os dois somem juntos', () => {
		const lista = [{ isSkill: true, ID: ENDURE }, { isSkill: true, ID: BASH }, { isSkill: true, ID: ENDURE }];
		montarBarra(lista);
		const { r, passar } = criar(lista);
		r.recarga(ENDURE, 4000);
		passar(1500);
		expect(numeroDe(0)).toBe('2.5');
		expect(numeroDe(2)).toBe('2.5');
		expect(relogioDe(1)).toBeNull();
		passar(2500);
		expect(relogioDe(0)).toBeNull();
		expect(relogioDe(2)).toBeNull();
	});
});

describe('o slot redesenhado recebe o relogio de volta', () => {
	it('um `addElement` que troca o icone no meio da recarga nao apaga a contagem', () => {
		const lista = [{ isSkill: true, ID: ENDURE }];
		montarBarra(lista);
		const { r, passar } = criar(lista);
		r.recarga(ENDURE, 8000);
		// o servidor atualiza a skill (onUpdateSkill -> addElement): o icone nasce de novo
		montarBarra(lista);
		expect(relogioDe(0)).toBeNull();
		r.desenhar();
		expect(relogioDe(0)).not.toBeNull();
		passar(1000);
		expect(numeroDe(0)).toBe('7.0');
	});
});

describe('o atraso global (POSTDELAY) cobre todas as skills da barra', () => {
	it('acende em toda skill, nao em item, e a recarga propria mais longa vence', () => {
		const lista = [{ isSkill: true, ID: ENDURE }, { isSkill: true, ID: BASH }, { isSkill: false, ID: 501 }];
		montarBarra(lista);
		const { r, passar } = criar(lista);
		r.recarga(ENDURE, 8000);
		r.recargaGlobal(1000);
		expect(numeroDe(0)).toBe('8.0');
		expect(numeroDe(1)).toBe('1.0');
		expect(relogioDe(2)).toBeNull();
		passar(1000);
		expect(relogioDe(1)).toBeNull();
		expect(numeroDe(0)).toBe('7.0');
	});
});

describe('trocar de personagem limpa', () => {
	it('`limpar` tira todo relogio, esquece as recargas e desarma o intervalo', () => {
		const lista = [{ isSkill: true, ID: ENDURE }];
		montarBarra(lista);
		const { r, timers, passar } = criar(lista);
		r.recarga(ENDURE, 8000);
		r.recargaGlobal(1000);
		r.limpar();
		expect(relogioDe(0)).toBeNull();
		expect(r.vivas()).toEqual([]);
		expect(timers.desarmados).toBe(1);
		expect(timers.vivo).toBeNull();
		// o proximo personagem tem a mesma skill na barra: nada da recarga do anterior
		montarBarra(lista);
		passar(1000);
		r.desenhar();
		expect(relogioDe(0)).toBeNull();
	});
});

describe('costura com a barra e com o pacote (pelo fonte)', () => {
	const shortcut = fs.readFileSync('src/UI/Components/ShortCut/ShortCut.js', 'utf8');
	const css = fs.readFileSync('src/UI/Components/ShortCut/ShortCut.css', 'utf8');
	const skill = fs.readFileSync('src/Engine/MapEngine/Skill.js', 'utf8');
	const entity = fs.readFileSync('src/Engine/MapEngine/Entity.js', 'utf8');

	it('o 0x043d chega a barra pelo setSkillDelay, e o POSTDELAY pelo global', () => {
		expect(skill).toContain('Network.hookPacket(PACKET.ZC.SKILL_POSTDELAY, onSetSkillDelay);');
		expect(skill).toContain('ShortCut.setSkillDelay(pkt.SKID, pkt.DelayTM);');
		expect(entity).toContain('ShortCut.setGlobalSkillDelay(pkt.RemainMS);');
	});

	it('a barra monta a fabrica e encaminha os dois atrasos para ela', () => {
		expect(shortcut).toContain("import { criarRelogioDaBarra } from './relogioDaBarra.js';");
		expect(shortcut).toMatch(/ShortCut\.setSkillDelay = function setSkillDelay\(ID, delay\) \{\s*_relogioDaBarra\.recarga\(/);
		expect(shortcut).toMatch(
			/ShortCut\.setGlobalSkillDelay = function setGlobalSkillDelay\(delay\) \{\s*_relogioDaBarra\.recargaGlobal\(/
		);
	});

	it('o icone que nasce de novo (addElement) recebe o relogio na hora', () => {
		const corpo = shortcut.slice(shortcut.indexOf('ShortCut.addElement = function addElement'));
		const callback = corpo.slice(corpo.indexOf('Client.loadFile('), corpo.indexOf('});'));
		expect(callback).toContain('_relogioDaBarra.desenhar();');
	});

	it('trocar de personagem (clean) limpa o relogio; trocar de mapa (onRemove) NAO', () => {
		const clean = shortcut.slice(shortcut.indexOf('ShortCut.clean = function clean()'));
		expect(clean.slice(0, clean.indexOf('\n};'))).toContain('_relogioDaBarra.limpar();');
		// A troca de mapa tira e repoe a barra (UIManager.removeComponents): a
		// recarga continua valendo no servidor, entao a contagem continua aqui.
		const remove = shortcut.slice(shortcut.indexOf('ShortCut.onRemove = function onRemove()'));
		expect(remove.slice(0, remove.indexOf('\n};'))).not.toContain('_relogioDaBarra');
	});

	it('o relogio antigo por quadro (requestAnimationFrame por slot) saiu', () => {
		expect(shortcut).not.toContain('requestAnimationFrame');
		expect(shortcut).not.toContain('cooldown-overlay');
		expect(css).not.toContain('cooldown-overlay');
	});

	it('o CSS desenha a sombra em sentido horario a partir do topo e o numero no centro', () => {
		expect(css).toContain(`#ShortCut .${CLASSE_DO_RELOGIO} {`);
		expect(css).toContain('transparent calc((1 - var(--cd-fracao)) * 1turn)');
		expect(css).toContain(`#ShortCut .${CLASSE_DO_RELOGIO}-num {`);
	});
});
