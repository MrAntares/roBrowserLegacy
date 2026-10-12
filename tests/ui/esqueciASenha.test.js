/**
 * "Esqueci minha senha" na tela de login (08/10/2026).
 * Ver `src/UI/Components/WinLogin/esqueciASenha.js`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const configs = vi.hoisted(() => ({ valores: {} }));
vi.mock('Core/Configs.js', () => ({
	default: { get: (chave, padrao) => (chave in configs.valores ? configs.valores[chave] : padrao) }
}));

import {
	conferirPedido,
	conferirRedefinicao,
	montarEsqueciASenha,
	pedirCodigo,
	redefinirSenha
} from 'UI/Components/WinLogin/esqueciASenha.js';
import { montarCadastroNaEntrada } from 'UI/Components/WinLogin/cadastroNaEntrada.js';

const PASTA = join(process.cwd(), 'src/UI/Components/WinLogin');
const HTML = readFileSync(join(PASTA, 'esqueciASenha.html'), 'utf8');
const HTML_CADASTRO = readFileSync(join(PASTA, 'cadastroNaEntrada.html'), 'utf8');
const HTML_LOGIN = readFileSync(join(PASTA, 'WinLoginV2/WinLoginV2.html'), 'utf8');

function resposta(ok, json) {
	return vi.fn(async () => ({ ok, json: async () => json }));
}

const esperar = () => new Promise(r => setTimeout(r, 0));

beforeEach(() => {
	configs.valores = { cadastroUrl: 'https://api.roclassicidle.com.br' };
});
afterEach(() => {
	document.body.innerHTML = '';
	vi.unstubAllGlobals();
});

describe('as conferencias', () => {
	it('pedido bom passa; usuario e e-mail ruins reprovam', () => {
		expect(conferirPedido({ usuario: 'jhow18', email: 'j@x.com' })).toBeNull();
		expect(conferirPedido({ usuario: 'ab', email: 'j@x.com' })).toMatch(/usuário/);
		expect(conferirPedido({ usuario: 'jhow18', email: 'sem-arroba' })).toMatch(/e-mail/);
	});
	it('a redefinicao pede 6 numeros e senha de 4 a 23', () => {
		const bom = { usuario: 'jhow18', codigo: '123456', senha: 'nova1234' };
		expect(conferirRedefinicao(bom)).toBeNull();
		expect(conferirRedefinicao({ ...bom, codigo: '12345' })).toMatch(/6 números/);
		expect(conferirRedefinicao({ ...bom, codigo: '12a456' })).toMatch(/6 números/);
		expect(conferirRedefinicao({ ...bom, senha: '123' })).toMatch(/senha/);
	});
});

describe('as chamadas ao balcao', () => {
	it('pedirCodigo posta em /senha/esqueci e devolve o recado do servidor', async () => {
		const buscar = resposta(true, { ok: true, mensagem: 'Enviamos.' });
		expect(await pedirCodigo({ usuario: 'jhow18', email: 'j@x.com' }, buscar)).toEqual({ mensagem: 'Enviamos.' });
		expect(buscar).toHaveBeenCalledWith(
			'https://api.roclassicidle.com.br/senha/esqueci',
			expect.objectContaining({ method: 'POST' })
		);
		expect(JSON.parse(buscar.mock.calls[0][1].body)).toEqual({ usuario: 'jhow18', email: 'j@x.com' });
	});
	it('redefinirSenha posta em /senha/redefinir e devolve o usuario do servidor', async () => {
		const buscar = resposta(true, { ok: true, usuario: 'Jhow18' });
		const r = await redefinirSenha({ usuario: 'jhow18', codigo: '123456', senha: 'nova1234' }, buscar);
		expect(r).toEqual({ usuario: 'Jhow18' });
		expect(buscar.mock.calls[0][0]).toBe('https://api.roclassicidle.com.br/senha/redefinir');
	});
	it('a recusa do servidor chega como esta; a falha de rede vira recado', async () => {
		expect(await pedirCodigo({}, resposta(false, { ok: false, erro: 'Indisponivel.' }))).toEqual({
			erro: 'Indisponivel.'
		});
		const quebrado = vi.fn(async () => {
			throw new Error('offline');
		});
		expect((await redefinirSenha({}, quebrado)).erro).toMatch(/servidor/);
	});
});

describe('a janela', () => {
	function montar() {
		document.body.innerHTML = HTML_CADASTRO + HTML;
		const aoEntrar = vi.fn();
		const janela = montarEsqueciASenha(document.body, { aoEntrar });
		const modal = document.querySelector('.esq');
		const pedir = modal.querySelector('.esq-pedir');
		const redefinir = modal.querySelector('.esq-redefinir');
		return { janela, aoEntrar, modal, pedir, redefinir };
	}

	it('o login oferece o link, e a janela de cadastro nao pega a de esqueci', () => {
		expect(HTML_LOGIN).toContain('class="btn forgot');
		document.body.innerHTML = HTML + HTML_CADASTRO;
		const cadastro = montarCadastroNaEntrada(document.body, { aoEntrar: vi.fn() });
		cadastro.abrir();
		expect(document.querySelector('.esq').hidden).toBe(true);
		expect(document.querySelector('.cad:not(.esq)').hidden).toBe(false);
	});

	it('abre no passo 1 com o usuario que ja estava no login', () => {
		const { janela, modal, pedir, redefinir } = montar();
		janela.abrir('jhow18');
		expect(janela.aberta()).toBe(true);
		expect(modal.classList.contains('is-open')).toBe(true);
		expect(pedir.hidden).toBe(false);
		expect(redefinir.hidden).toBe(true);
		expect(pedir.querySelector('[name="usuario"]').value).toBe('jhow18');
	});

	it('o caminho inteiro: pede o codigo, troca a senha e entra com a nova', async () => {
		const buscar = vi
			.fn()
			.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, mensagem: 'Confira o e-mail.' }) })
			.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, usuario: 'jhow18' }) });
		vi.stubGlobal('fetch', buscar);
		const { janela, aoEntrar, pedir, redefinir } = montar();
		janela.abrir('jhow18');
		pedir.querySelector('[name="email"]').value = 'j@x.com';
		janela.enviar();
		await esperar();
		expect(pedir.hidden).toBe(true);
		expect(redefinir.hidden).toBe(false);
		expect(redefinir.querySelector('.esq-aviso').textContent).toBe('Confira o e-mail.');
		expect(redefinir.querySelector('[name="usuario"]').value).toBe('jhow18');

		redefinir.querySelector('[name="codigo"]').value = '123456';
		redefinir.querySelector('[name="senha"]').value = 'nova1234';
		janela.enviar();
		await esperar();
		expect(aoEntrar).toHaveBeenCalledWith('jhow18', 'nova1234');
		expect(janela.aberta()).toBe(false);
		expect(JSON.parse(buscar.mock.calls[1][1].body)).toEqual({
			usuario: 'jhow18',
			codigo: '123456',
			senha: 'nova1234'
		});
	});

	it('conferencia local reprova sem chamar o servidor', async () => {
		const buscar = vi.fn();
		vi.stubGlobal('fetch', buscar);
		const { janela, pedir } = montar();
		janela.abrir('');
		janela.enviar();
		await esperar();
		expect(buscar).not.toHaveBeenCalled();
		const recado = pedir.querySelector('.cad-recado');
		expect(recado.hidden).toBe(false);
		expect(recado.textContent).toMatch(/usuário/);
	});

	it('codigo errado fica no passo 2 com o recado do servidor', async () => {
		vi.stubGlobal('fetch', resposta(false, { ok: false, erro: 'Codigo invalido ou vencido.' }));
		const { janela, aoEntrar, modal, redefinir } = montar();
		janela.abrir('jhow18');
		modal.querySelector('.esq-ja-tenho').click();
		expect(redefinir.hidden).toBe(false);
		redefinir.querySelector('[name="codigo"]').value = '000000';
		redefinir.querySelector('[name="senha"]').value = 'nova1234';
		janela.enviar();
		await esperar();
		expect(aoEntrar).not.toHaveBeenCalled();
		expect(redefinir.querySelector('.cad-recado').textContent).toBe('Codigo invalido ou vencido.');
		expect(janela.aberta()).toBe(true);
	});

	it('"Pedir outro codigo" volta ao passo 1 e o fechar esconde', () => {
		const { janela, modal, pedir } = montar();
		janela.abrir('jhow18');
		modal.querySelector('.esq-ja-tenho').click();
		modal.querySelector('.esq-outro').click();
		expect(pedir.hidden).toBe(false);
		modal.querySelector('.cad-fechar').click();
		expect(janela.aberta()).toBe(false);
	});
});
