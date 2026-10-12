/**
 * A janela de cadastro dentro da tela de login (23/09/2026).
 * Ver `src/UI/Components/WinLogin/cadastroNaEntrada.js`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const configs = vi.hoisted(() => ({ valores: {} }));
vi.mock('Core/Configs.js', () => ({
	default: { get: (chave, padrao) => (chave in configs.valores ? configs.valores[chave] : padrao) }
}));

import {
	conferirCadastro,
	enviarCadastro,
	montarCadastroNaEntrada
} from 'UI/Components/WinLogin/cadastroNaEntrada.js';
import {
	_reiniciarParaTeste,
	abrirCriacaoDireto,
	loginAceito,
	pedidoDeLogin
} from 'Engine/entradaPosCadastro.js';

const PASTA = join(process.cwd(), 'src/UI/Components/WinLogin');
const HTML = readFileSync(join(PASTA, 'cadastroNaEntrada.html'), 'utf8');
const PASSE = 'abcdefghijklmnopqrstuv';

const BOM = {
	nome: 'Jhow',
	telefone: '(11) 91234-5678',
	email: 'jhow@exemplo.com',
	usuario: 'jhow18',
	senha: 'segredo'
};

function resposta(ok, json) {
	return vi.fn(async () => ({ ok, json: async () => json }));
}

beforeEach(() => {
	configs.valores = { cadastroUrl: 'https://api.roclassicidle.com.br' };
	_reiniciarParaTeste();
});
afterEach(() => {
	document.body.innerHTML = '';
});

describe('conferirCadastro', () => {
	it('dados bons passam', () => {
		expect(conferirCadastro(BOM)).toBeNull();
	});
	it.each([
		['nome', 'J', /nome/],
		['email', 'sem-arroba', /e-mail/],
		['telefone', '1234', /DDD/],
		['telefone', '98765-4321', /DDD/],
		['usuario', 'ab', /usuário/],
		['usuario', 'com espaco', /usuário/],
		['senha', '123', /senha/]
	])('%s = %j reprova', (campo, valor, texto) => {
		expect(conferirCadastro({ ...BOM, [campo]: valor })).toMatch(texto);
	});
});

describe('enviarCadastro', () => {
	it('posta no /cadastrar do balcao', async () => {
		const buscar = resposta(true, { ok: true, usuario: 'jhow18', entrada: PASSE });
		await enviarCadastro({ ...BOM, sexo: 1 }, buscar);
		expect(buscar).toHaveBeenCalledWith(
			'https://api.roclassicidle.com.br/cadastrar',
			expect.objectContaining({ method: 'POST' })
		);
		expect(JSON.parse(buscar.mock.calls[0][1].body)).toMatchObject({ usuario: 'jhow18', sexo: 1 });
	});

	it('com passe, entra com o passe e a criacao abre direto (D-1379)', async () => {
		const r = await enviarCadastro(BOM, resposta(true, { ok: true, usuario: 'jhow18', entrada: PASSE }));
		expect(r).toEqual({ usuario: 'jhow18', senha: PASSE, comPasse: true });
		pedidoDeLogin('jhow18', PASSE);
		expect(loginAceito()).toBe('jhow18');
		expect(abrirCriacaoDireto(0)).toBe(true);
	});

	it('sem passe, entra com a senha digitada e nada fica armado', async () => {
		const r = await enviarCadastro(BOM, resposta(true, { ok: true, usuario: 'jhow18' }));
		expect(r).toEqual({ usuario: 'jhow18', senha: 'segredo', comPasse: false });
		pedidoDeLogin('jhow18', 'segredo');
		expect(loginAceito()).toBeNull();
	});

	it('recusa do balcao traz a mensagem dele', async () => {
		const r = await enviarCadastro(BOM, resposta(false, { ok: false, erro: 'Esse usuário já existe.' }));
		expect(r).toEqual({ erro: 'Esse usuário já existe.' });
	});

	it('rede caida vira mensagem, nao excecao', async () => {
		const r = await enviarCadastro(
			BOM,
			vi.fn(async () => {
				throw new TypeError('Failed to fetch');
			})
		);
		expect(r.erro).toMatch(/servidor/);
	});
});

describe('montarCadastroNaEntrada', () => {
	function montar(aoEntrar = vi.fn()) {
		document.body.innerHTML = HTML;
		return { janela: montarCadastroNaEntrada(document.body, { aoEntrar }), aoEntrar };
	}
	function preencher() {
		for (const [campo, valor] of Object.entries(BOM)) {
			document.querySelector(`[name="${campo}"]`).value = valor;
		}
	}

	it('nasce fechada, abre com foco no nome e fecha pelo "Ja tenho conta"', () => {
		const { janela } = montar();
		expect(janela.aberta()).toBe(false);
		janela.abrir();
		expect(janela.aberta()).toBe(true);
		expect(document.activeElement.id).toBe('cad-nome');
		document.querySelector('.cad-ja').click();
		expect(janela.aberta()).toBe(false);
	});

	it('dado torto fica na janela, com o recado, e nao posta', async () => {
		const buscar = vi.fn();
		vi.stubGlobal('fetch', buscar);
		const { janela, aoEntrar } = montar();
		janela.abrir();
		await janela.enviar();
		expect(document.querySelector('.cad-recado').hidden).toBe(false);
		expect(buscar).not.toHaveBeenCalled();
		expect(aoEntrar).not.toHaveBeenCalled();
		vi.unstubAllGlobals();
	});

	it('cadastro aceito fecha a janela e entra com o passe', async () => {
		vi.stubGlobal('fetch', resposta(true, { ok: true, usuario: 'jhow18', entrada: PASSE }));
		const { janela, aoEntrar } = montar();
		janela.abrir();
		preencher();
		await janela.enviar();
		expect(janela.aberta()).toBe(false);
		expect(aoEntrar).toHaveBeenCalledWith('jhow18', PASSE);
		vi.unstubAllGlobals();
	});

	it('o codigo de indicacao segue no corpo', async () => {
		configs.valores.codigoDeIndicacao = 'ab12cd';
		const buscar = resposta(true, { ok: true, usuario: 'jhow18', entrada: PASSE });
		vi.stubGlobal('fetch', buscar);
		const { janela } = montar();
		janela.abrir();
		preencher();
		await janela.enviar();
		expect(JSON.parse(buscar.mock.calls[0][1].body).ref).toBe('AB12CD');
		vi.unstubAllGlobals();
	});

	it('o olho revela e esconde a senha', () => {
		montar();
		const senha = document.querySelector('[name="senha"]');
		document.querySelector('.cad-olho').click();
		expect(senha.type).toBe('text');
		document.querySelector('.cad-olho').click();
		expect(senha.type).toBe('password');
	});
});
