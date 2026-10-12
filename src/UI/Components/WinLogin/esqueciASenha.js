/**
 * ESQUECI MINHA SENHA, NA TELA DE LOGIN (08/10/2026).
 *
 * Dois passos na mesma janela, com a pele da janela de cadastro:
 * 1. usuario + e-mail do cadastro -> `POST /senha/esqueci`: o balcao manda um
 *    codigo de 6 digitos para o e-mail GRAVADO na conta;
 * 2. usuario + codigo + senha nova -> `POST /senha/redefinir`: a senha troca e
 *    o jogador entra direto com ela.
 *
 * O balcao responde IGUAL quando a conta nao existe ou o e-mail nao confere
 * (`servidor/web/recuperacao-de-senha.ts`), entao o passo 2 abre sempre que o
 * pedido foi aceito, com o recado que o servidor devolveu.
 *
 * As conferencias daqui sao conforto; a guarda e o servidor.
 * Teste: `tests/ui/esqueciASenha.test.js`.
 */
import { rotaDoBalcao } from 'UI/enderecoDoBalcao.js';

const USUARIO_VALIDO = /^[A-Za-z0-9_]{4,23}$/;
const EMAIL_VALIDO = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;
const CODIGO_VALIDO = /^\d{6}$/;

const FALHA_DE_REDE = 'Não foi possível falar com o servidor agora. Tente de novo daqui a pouco.';

/**
 * @param {{usuario: string, email: string}} d
 * @returns {string | null}
 */
export function conferirPedido(d) {
	if (!USUARIO_VALIDO.test(d.usuario)) return 'Digite o seu usuário (4 a 23 caracteres: letras, números e _).';
	if (!EMAIL_VALIDO.test(d.email) || d.email.length > 120) return 'O e-mail não parece válido.';
	return null;
}

/**
 * @param {{usuario: string, codigo: string, senha: string}} d
 * @returns {string | null}
 */
export function conferirRedefinicao(d) {
	if (!USUARIO_VALIDO.test(d.usuario)) return 'Digite o seu usuário (4 a 23 caracteres: letras, números e _).';
	if (!CODIGO_VALIDO.test(d.codigo)) return 'O código tem 6 números. Confira o e-mail.';
	if (d.senha.length < 4 || d.senha.length > 23) return 'A senha precisa ter de 4 a 23 caracteres.';
	return null;
}

/**
 * @param {string} rota
 * @param {object} corpo
 * @param {typeof fetch} buscar
 * @returns {Promise<{ok: true, json: object} | {ok: false, erro: string}>}
 */
async function postar(rota, corpo, buscar) {
	let resposta;
	let json;
	try {
		resposta = await buscar(rotaDoBalcao(rota), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(corpo)
		});
		json = await resposta.json();
	} catch (_e) {
		return { ok: false, erro: FALHA_DE_REDE };
	}
	if (!resposta.ok || !json || !json.ok) {
		return { ok: false, erro: (json && json.erro) || 'Não foi possível concluir o pedido.' };
	}
	return { ok: true, json };
}

/**
 * @param {{usuario: string, email: string}} dados
 * @param {typeof fetch} buscar
 * @returns {Promise<{erro: string} | {mensagem: string}>}
 */
export async function pedirCodigo(dados, buscar = fetch) {
	const r = await postar('/senha/esqueci', dados, buscar);
	if (!r.ok) return { erro: r.erro };
	return {
		mensagem:
			typeof r.json.mensagem === 'string'
				? r.json.mensagem
				: 'Se o usuário e o e-mail conferirem, enviamos um código para o e-mail do cadastro.'
	};
}

/**
 * @param {{usuario: string, codigo: string, senha: string}} dados
 * @param {typeof fetch} buscar
 * @returns {Promise<{erro: string} | {usuario: string}>}
 */
export async function redefinirSenha(dados, buscar = fetch) {
	const r = await postar('/senha/redefinir', dados, buscar);
	if (!r.ok) return { erro: r.erro };
	return { usuario: typeof r.json.usuario === 'string' ? r.json.usuario : dados.usuario };
}

/**
 * Liga a janela que ja veio no template do login.
 *
 * @param {ShadowRoot | HTMLElement} root
 * @param {{ aoEntrar: (usuario: string, senha: string) => void }} opcoes
 * @returns {{ abrir: (usuario?: string) => void, fechar: () => void, aberta: () => boolean, enviar: () => void, janela: HTMLElement } | null}
 */
export function montarEsqueciASenha(root, { aoEntrar }) {
	const modal = root.querySelector('.esq');
	if (!modal) return null;

	const janela = modal.querySelector('.cad-janela');
	const formPedir = modal.querySelector('.esq-pedir');
	const formRedefinir = modal.querySelector('.esq-redefinir');
	const aviso = modal.querySelector('.esq-aviso');
	let ocupado = false;

	const campo = (form, nome) => form.querySelector(`[name="${nome}"]`);
	const recado = form => form.querySelector('.cad-recado');
	const botao = form => form.querySelector('.cad-enviar');

	// O mesmo cuidado dos campos do login: o mousedown nao pode chegar ao motor.
	for (const input of modal.querySelectorAll('input')) {
		input.addEventListener('mousedown', event => event.stopImmediatePropagation());
	}

	for (const fechador of modal.querySelectorAll('[data-fechar-esq]')) {
		fechador.addEventListener('click', event => {
			event.preventDefault();
			fechar();
		});
	}

	formPedir.addEventListener('submit', event => {
		event.preventDefault();
		enviar();
	});
	formRedefinir.addEventListener('submit', event => {
		event.preventDefault();
		enviar();
	});
	modal.querySelector('.esq-ja-tenho').addEventListener('click', () => {
		irParaRedefinir('');
	});
	modal.querySelector('.esq-outro').addEventListener('click', () => {
		irParaPedir();
	});

	function dizer(form, texto) {
		const p = recado(form);
		p.textContent = texto;
		p.hidden = !texto;
	}

	function irParaPedir() {
		formRedefinir.hidden = true;
		formPedir.hidden = false;
		dizer(formPedir, '');
		const usuario = campo(formRedefinir, 'usuario').value.trim();
		if (usuario) campo(formPedir, 'usuario').value = usuario;
		(campo(formPedir, 'usuario').value ? campo(formPedir, 'email') : campo(formPedir, 'usuario')).focus();
	}

	function irParaRedefinir(mensagem) {
		formPedir.hidden = true;
		formRedefinir.hidden = false;
		dizer(formRedefinir, '');
		aviso.textContent = mensagem || 'Digite o código que chegou no seu e-mail e escolha a senha nova.';
		const usuario = campo(formPedir, 'usuario').value.trim();
		if (usuario) campo(formRedefinir, 'usuario').value = usuario;
		(campo(formRedefinir, 'usuario').value
			? campo(formRedefinir, 'codigo')
			: campo(formRedefinir, 'usuario')
		).focus();
	}

	/** @param {string} [usuario] - o que ja estava digitado no login */
	function abrir(usuario) {
		formPedir.reset();
		formRedefinir.reset();
		if (typeof usuario === 'string' && usuario.trim()) campo(formPedir, 'usuario').value = usuario.trim();
		modal.hidden = false;
		void modal.offsetWidth; // deixa a transicao pegar
		modal.classList.add('is-open');
		irParaPedir();
	}

	function fechar() {
		if (ocupado) return;
		modal.classList.remove('is-open');
		modal.hidden = true;
	}

	async function ocupar(form, tarefa) {
		ocupado = true;
		botao(form).classList.add('is-loading');
		try {
			return await tarefa();
		} finally {
			ocupado = false;
			botao(form).classList.remove('is-loading');
		}
	}

	async function enviar() {
		if (ocupado) return;

		if (!formPedir.hidden) {
			const dados = {
				usuario: campo(formPedir, 'usuario').value.trim(),
				email: campo(formPedir, 'email').value.trim()
			};
			const problema = conferirPedido(dados);
			if (problema) {
				dizer(formPedir, problema);
				return;
			}
			dizer(formPedir, '');
			const resultado = await ocupar(formPedir, () => pedirCodigo(dados));
			if ('erro' in resultado) {
				dizer(formPedir, resultado.erro);
				return;
			}
			irParaRedefinir(resultado.mensagem);
			return;
		}

		const dados = {
			usuario: campo(formRedefinir, 'usuario').value.trim(),
			codigo: campo(formRedefinir, 'codigo').value.trim(),
			senha: campo(formRedefinir, 'senha').value
		};
		const problema = conferirRedefinicao(dados);
		if (problema) {
			dizer(formRedefinir, problema);
			return;
		}
		dizer(formRedefinir, '');
		const resultado = await ocupar(formRedefinir, () => redefinirSenha(dados));
		if ('erro' in resultado) {
			dizer(formRedefinir, resultado.erro);
			return;
		}
		fechar();
		formPedir.reset();
		formRedefinir.reset();
		aoEntrar(resultado.usuario, dados.senha);
	}

	return { abrir, fechar, aberta: () => !modal.hidden, enviar, janela };
}
