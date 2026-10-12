/**
 * ENTRAR COM GOOGLE OU DISCORD NA TELA DE LOGIN (10/10/2026, pedido do dono).
 *
 * A conta que nasceu pelo Google/Discord nao tem senha que alguem conheca: a
 * entrada e SEMPRE pelo provedor. O botao leva ao balcao
 * (`/social/<provedor>/iniciar?origem=jogo`, servidor `servidor/web/login-social.ts`),
 * o balcao leva ao provedor, e a volta chega a esta pagina como
 * `#entrada=<usuario>.<passe>` -- o MESMO passe de uso unico do cadastro
 * (D-1379), que a guarda do `api.html` ja captura e o login ja aceita.
 *
 * Quem ainda nao tem conta volta ao SITE (`#social=<token>`), escolhe o usuario
 * e o telefone, e cai aqui do mesmo jeito.
 *
 * Os botoes nascem escondidos e so aparecem quando o servidor diz que o
 * provedor esta ligado (`/social/provedores`): sem isso, um clique levaria a um
 * "indisponivel" que a pessoa nao tem como resolver.
 *
 * A navegacao vai para a janela de CIMA: o Google recusa abrir dentro de um
 * iframe (`X-Frame-Options`), e no `npm run dev` o jogo mora num iframe.
 * Teste: `tests/ui/entradaSocial.test.js`.
 */
import { rotaDoBalcao } from 'UI/enderecoDoBalcao.js';

export const MOTIVOS_DO_ERRO_SOCIAL = {
	cancelado: 'Login cancelado. Você pode tentar de novo.',
	expirou: 'O login demorou demais e expirou. Clique no botão de novo.',
	falhou: 'Não conseguimos confirmar o login agora. Tente de novo em instantes.',
	indisponivel: 'O login por Google/Discord está fora do ar agora.'
};

/**
 * O motivo do `#social-erro=<motivo>` na URL, ou `null`. Tira o fragmento da
 * barra para um F5 nao repetir o aviso.
 *
 * @param {Window} janela
 * @returns {string | null} a frase para mostrar
 */
export function lerErroSocial(janela = window) {
	const hash = (janela.location && janela.location.hash) || '';
	if (hash.indexOf('#social-erro=') !== 0) return null;
	const motivo = hash.slice('#social-erro='.length);
	try {
		janela.history.replaceState(null, '', janela.location.pathname + janela.location.search);
	} catch (_e) {
		/* sem history: o # fica, e so */
	}
	return MOTIVOS_DO_ERRO_SOCIAL[motivo] || MOTIVOS_DO_ERRO_SOCIAL.falhou;
}

/** Leva a janela de cima ao provedor; se o navegador recusar (origem cruzada), leva esta. */
export function irAoProvedor(provedor, janela = window) {
	const destino = rotaDoBalcao(`/social/${provedor}/iniciar?origem=jogo`);
	try {
		janela.top.location.assign(destino);
	} catch (_e) {
		janela.location.assign(destino);
	}
}

/**
 * Liga os botoes que ja vieram no template do login.
 *
 * @param {ShadowRoot | HTMLElement} root
 * @param {{ avisar: (texto: string) => void, buscar?: typeof fetch, janela?: Window }} opcoes
 * @returns {Promise<string[]>} os provedores mostrados
 */
export async function montarEntradaSocial(root, { avisar, buscar = fetch, janela = window }) {
	const caixa = root.querySelector('.wl-social');
	if (!caixa) return [];

	const erro = lerErroSocial(janela);
	if (erro) avisar(erro);

	for (const botao of caixa.querySelectorAll('[data-social]')) {
		botao.addEventListener('click', event => {
			event.preventDefault();
			event.stopImmediatePropagation();
			irAoProvedor(botao.dataset.social, janela);
		});
	}

	let provedores = [];
	try {
		const resposta = await buscar(rotaDoBalcao('/social/provedores'), { cache: 'no-store' });
		const json = await resposta.json();
		provedores = Array.isArray(json && json.provedores) ? json.provedores : [];
	} catch (_e) {
		return [];
	}
	const mostrados = [];
	for (const botao of caixa.querySelectorAll('[data-social]')) {
		const ligado = provedores.includes(botao.dataset.social);
		botao.hidden = !ligado;
		if (ligado) mostrados.push(botao.dataset.social);
	}
	caixa.hidden = mostrados.length === 0;
	return mostrados;
}
