/**
 * O MARTELO DO MOBILEUI SAI DE CIMA DAS JANELAS DE TELA CHEIA (decisao D13, 08/10/2026; V-09 da sonda de
 * tela do QA final): no celular em pe a janela vira folha e o martelo (z-index 1000) ficava sobre o canto do
 * titulo do menu do Bot. A pilha de janelas diz "uma janela cobre a HUD" e avisa quem assina; o MobileUI
 * assina e se esconde.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const aparelho = vi.hoisted(() => ({ celularEmPe: true }));
vi.mock('UI/hudVertical.js', () => ({ ehCelularEmPe: () => aparelho.celularEmPe }));

import Pilha, { aoMudarAPilha, janelaCobreAHud } from 'UI/pilhaDeJanelas.js';

function janelaFalsa(prefixo) {
	const host = document.createElement('div');
	const win = document.createElement('div');
	win.className = `${prefixo}-window`;
	host.appendChild(win);
	document.body.appendChild(host);
	return {
		win,
		seletor: `.${prefixo}-window`,
		componente: {
			_host: host,
			_shadow: host,
			toggle() {
				win.classList.toggle('is-open');
			}
		}
	};
}

describe('janelaCobreAHud e a assinatura da pilha', () => {
	let bot;
	beforeEach(() => {
		Pilha._zerar();
		document.body.innerHTML = '';
		aparelho.celularEmPe = true;
		bot = janelaFalsa('bm');
		Pilha.registrar({ nome: 'bot', componente: bot.componente, seletor: bot.seletor });
	});

	it('no celular em pe, janela aberta cobre a HUD; fechada, nao', () => {
		expect(janelaCobreAHud()).toBe(false);
		bot.componente.toggle();
		expect(janelaCobreAHud()).toBe(true);
		bot.componente.toggle();
		expect(janelaCobreAHud()).toBe(false);
	});

	it('no desktop e no celular deitado a janela flutua e NAO cobre o canto', () => {
		aparelho.celularEmPe = false;
		bot.componente.toggle();
		expect(Pilha.temAberta()).toBe(true);
		expect(janelaCobreAHud()).toBe(false);
	});

	it('o assinante e avisado a cada abrir e fechar, e a assinatura cancela', () => {
		const ouvinte = vi.fn(() => janelaCobreAHud());
		const cancelar = aoMudarAPilha(ouvinte);
		Pilha.aoAbrir('bot');
		bot.win.classList.add('is-open');
		Pilha.aoFechar('bot');
		expect(ouvinte).toHaveBeenCalledTimes(2);
		cancelar();
		Pilha.aoAbrir('bot');
		expect(ouvinte).toHaveBeenCalledTimes(2);
	});

	it('um assinante que lanca nao derruba a pilha nem os outros', () => {
		const erro = vi.spyOn(console, 'error').mockImplementation(() => {});
		const ruim = aoMudarAPilha(() => {
			throw new Error('boom');
		});
		const bom = vi.fn();
		const cancelarBom = aoMudarAPilha(bom);
		Pilha.aoAbrir('bot');
		expect(bom).toHaveBeenCalledTimes(1);
		expect(Pilha.abertas).toBeTypeOf('function');
		ruim();
		cancelarBom();
		erro.mockRestore();
	});
});

describe('a costura do MobileUI', () => {
	const fonte = readFileSync(join(__dirname, '..', '..', 'src', 'UI', 'Components', 'MobileUI', 'MobileUI.js'), 'utf8');

	it('o martelo assina a pilha e se esconde enquanto uma janela cobre a HUD', () => {
		expect(fonte).toMatch(/import \{ aoMudarAPilha, janelaCobreAHud \} from 'UI\/pilhaDeJanelas\.js';/);
		expect(fonte).toMatch(/root\.querySelector\('#toggleUIButton'\)/);
		expect(fonte).toMatch(/martelo\.style\.display = janelaCobreAHud\(\) \? 'none' : '';/);
		expect(fonte).toMatch(/aoMudarAPilha\(sincronizarOMartelo\)/);
	});
});
