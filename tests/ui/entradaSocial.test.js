/**
 * Entrar com Google ou Discord na tela de login (10/10/2026).
 * Ver `src/UI/Components/WinLogin/entradaSocial.js` e, no servidor,
 * `servidor/web/login-social.ts`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const configs = vi.hoisted(() => ({ valores: {} }));
vi.mock('Core/Configs.js', () => ({
	default: { get: (chave, padrao) => (chave in configs.valores ? configs.valores[chave] : padrao) }
}));

import { irAoProvedor, lerErroSocial, montarEntradaSocial, MOTIVOS_DO_ERRO_SOCIAL } from 'UI/Components/WinLogin/entradaSocial.js';
import { cookiesDoPixel, guardarCorrespondencia } from 'UI/Components/WinLogin/cadastroNaEntrada.js';

const HTML_LOGIN = readFileSync(join(process.cwd(), 'src/UI/Components/WinLogin/WinLoginV2/WinLoginV2.html'), 'utf8');

function provedores(lista) {
	return vi.fn(async () => ({ ok: true, json: async () => ({ provedores: lista }) }));
}

function janelaFalsa(hash = '') {
	const atribuidos = [];
	const janela = {
		location: { hash, pathname: '/', search: '', assign: u => atribuidos.push(['esta', u]) },
		history: { replaceState: vi.fn() },
		top: { location: { assign: u => atribuidos.push(['topo', u]) } }
	};
	return { janela, atribuidos };
}

beforeEach(() => {
	configs.valores = { cadastroUrl: 'https://api.roclassicidle.com.br' };
	document.body.innerHTML = HTML_LOGIN;
});
afterEach(() => {
	document.body.innerHTML = '';
});

describe('os botoes', () => {
	it('nascem escondidos e so aparecem os provedores ligados no servidor', async () => {
		const caixa = document.querySelector('.wl-social');
		expect(caixa.hidden).toBe(true);
		const { janela } = janelaFalsa();
		const mostrados = await montarEntradaSocial(document, { avisar: vi.fn(), buscar: provedores(['discord']), janela });
		expect(mostrados).toEqual(['discord']);
		expect(caixa.hidden).toBe(false);
		expect(document.querySelector('[data-social="google"]').hidden).toBe(true);
		expect(document.querySelector('[data-social="discord"]').hidden).toBe(false);
	});

	it('sem provedor ligado (ou sem servidor), a caixa fica escondida', async () => {
		const { janela } = janelaFalsa();
		await montarEntradaSocial(document, { avisar: vi.fn(), buscar: provedores([]), janela });
		expect(document.querySelector('.wl-social').hidden).toBe(true);
		const quebrado = vi.fn(async () => {
			throw new Error('offline');
		});
		await montarEntradaSocial(document, { avisar: vi.fn(), buscar: quebrado, janela });
		expect(document.querySelector('.wl-social').hidden).toBe(true);
	});

	it('o clique leva a JANELA DE CIMA ao balcao, com origem=jogo', async () => {
		const { janela, atribuidos } = janelaFalsa();
		await montarEntradaSocial(document, { avisar: vi.fn(), buscar: provedores(['google', 'discord']), janela });
		document.querySelector('[data-social="google"]').click();
		expect(atribuidos).toEqual([['topo', 'https://api.roclassicidle.com.br/social/google/iniciar?origem=jogo']]);
	});

	it('se o navegador recusar a janela de cima, vai nesta', () => {
		const { janela, atribuidos } = janelaFalsa();
		janela.top = {
			get location() {
				throw new Error('SecurityError');
			}
		};
		irAoProvedor('discord', janela);
		expect(atribuidos).toEqual([['esta', 'https://api.roclassicidle.com.br/social/discord/iniciar?origem=jogo']]);
	});
});

describe('a volta com erro', () => {
	it('#social-erro=<motivo> vira aviso e sai da barra', async () => {
		const { janela } = janelaFalsa('#social-erro=cancelado');
		const avisar = vi.fn();
		await montarEntradaSocial(document, { avisar, buscar: provedores([]), janela });
		expect(avisar).toHaveBeenCalledWith(MOTIVOS_DO_ERRO_SOCIAL.cancelado);
		expect(janela.history.replaceState).toHaveBeenCalled();
	});

	it('motivo desconhecido vira "falhou"; sem fragmento, nada', () => {
		expect(lerErroSocial(janelaFalsa('#social-erro=xyz').janela)).toBe(MOTIVOS_DO_ERRO_SOCIAL.falhou);
		expect(lerErroSocial(janelaFalsa('#entrada=a.b').janela)).toBeNull();
	});
});

describe('a conversao no cadastro de dentro do jogo', () => {
	it('le os cookies do Pixel', () => {
		const doc = { cookie: 'x=1; _fbp=fb.1.1728500000000.123; _fbc=fb.1.1728500000000.AbC_12345' };
		expect(cookiesDoPixel(doc)).toEqual({ fbp: 'fb.1.1728500000000.123', fbc: 'fb.1.1728500000000.AbC_12345' });
		expect(cookiesDoPixel({ cookie: '' })).toEqual({});
	});

	it('guarda as chaves no dominio inteiro em producao, e so na pagina fora dela', () => {
		const doc = { cookie: '' };
		guardarCorrespondencia({ em: 'a'.repeat(64) }, doc, { hostname: 'play.roclassicidle.com.br', protocol: 'https:' });
		expect(doc.cookie).toContain('rci_am=');
		expect(doc.cookie).toContain('domain=.roclassicidle.com.br');
		expect(doc.cookie).toContain('Secure');
		guardarCorrespondencia({ em: 'a' }, doc, { hostname: '127.0.0.1', protocol: 'http:' });
		expect(doc.cookie).not.toContain('domain=');
		const antes = doc.cookie;
		guardarCorrespondencia(undefined, doc, { hostname: 'x', protocol: 'https:' });
		expect(doc.cookie).toBe(antes);
	});
});
