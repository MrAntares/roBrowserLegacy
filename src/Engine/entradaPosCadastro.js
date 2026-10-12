/**
 * Engine/entradaPosCadastro.js
 *
 * A ENTRADA POS-CADASTRO (D-1379, 13/09/2026, pedido do dono).
 *
 * O jogador cria a conta no site (roclassicidle.com.br) e cai AQUI ja logado,
 * direto na criacao de personagem, sem digitar usuario e senha de novo. O site
 * recebe do balcao um passe de uso unico e abre o jogo com
 * `#entrada=<usuario>.<passe>`; este modulo pega o passe, e o LoginEngine o
 * manda no `CA_LOGIN` no lugar da senha. O servidor aceita uma vez
 * (`servidor/login/passe-de-entrada.ts`, no repositorio do servidor).
 *
 * ---------------------------------------------------------------------------
 * O PASSE SAI DO ENDERECO ANTES DE TUDO
 * ---------------------------------------------------------------------------
 * O `api.html` tira o fragmento da barra de endereco com um script inline que
 * roda ANTES do Pixel da Meta, e guarda o texto em `window.RAGIDLE_ENTRADA`
 * (`applications/tools/builder-web.mjs`, `createApiHTML`). A razao e o Pixel:
 * ele envia a URL da pagina no PageView, e o passe e credencial. Este modulo
 * le primeiro essa variavel; o fragmento cru so e lido como reserva (um
 * `api.html` antigo servido pelo cache), e nesse caso ele tambem e apagado.
 *
 * ---------------------------------------------------------------------------
 * O ESTADO, E POR QUE ELE E AMARRADO AO PEDIDO
 * ---------------------------------------------------------------------------
 * Tres fatos, nesta ordem, e cada um so vale se o anterior aconteceu:
 *
 *   1. o login saiu COM o passe (`pedidoDeLogin`);
 *   2. o servidor ACEITOU (`loginAceito`), e isso so ele pode dizer: um passe
 *      vencido ou ja gasto cai na senha e e recusado;
 *   3. a lista de personagens chegou vazia (`abrirCriacaoDireto`).
 *
 * Um login manual qualquer (outro usuario, outra senha) APAGA o estado. Sem
 * isso, uma entrada que falhasse na rede deixaria o estado armado, e o proximo
 * login digitado a mao seria contado como cadastro: abriria a criacao e
 * dispararia a conversao para um jogador recorrente, que e o que o pedido
 * proibe com todas as letras.
 *
 * **Uma excecao aqui mata o laco de rede** (os handlers de pacote rodam dentro
 * dele, e a excecao descarta o resto do quadro WS). Por isso a chamada ao Pixel
 * e cercada: o jogo nao pode parar porque um bloqueador de anuncio apagou o
 * `fbq`.
 */

/** O prefixo do fragmento que o site escreve. */
export const PREFIXO_DO_FRAGMENTO = '#entrada=';

/**
 * A forma exata: o usuario com as regras do balcao (4 a 23, letras, numeros e
 * `_`) e o passe com 22 caracteres base64url. O `.` separa porque nao existe em
 * nenhum dos dois alfabetos.
 */
const FORMA_DA_ENTRADA = /^([A-Za-z0-9_]{4,23})\.([A-Za-z0-9_-]{22})$/;

/**
 * Le o texto `<usuario>.<passe>`. Devolve `null` para qualquer coisa fora da
 * forma: um fragmento torto nao pode virar tentativa de login com lixo.
 *
 * @param {unknown} texto
 * @returns {{usuario: string, passe: string} | null}
 */
export function lerEntrada(texto) {
	if (typeof texto !== 'string') return null;
	let limpo = texto;
	try {
		limpo = decodeURIComponent(texto);
	} catch (e) {
		return null;
	}
	const casado = FORMA_DA_ENTRADA.exec(limpo);
	if (!casado) return null;
	return { usuario: casado[1], passe: casado[2] };
}

/** @type {{usuario: string, passe: string} | null} */
let _entrada = null;
/** O login com o passe esta no ar, esperando resposta. */
let _pendente = false;
/** O servidor aceitou o passe, e a lista de personagens ainda nao chegou. */
let _aceita = false;
/**
 * O usuario do passe aceito, guardado para o `eventID` da conversao: o estado
 * de cima se apaga antes de a criacao abrir, e a conversao sai depois.
 * @type {string | null}
 */
let _usuarioDaConversao = null;

/**
 * Pega a entrada deixada pelo `api.html` (ou, na reserva, do fragmento), e a
 * apaga da origem. So devolve algo UMA vez por pagina.
 *
 * @param {Window} janela
 * @returns {{usuario: string, passe: string} | null}
 */
export function capturarEntrada(janela = window) {
	let bruto = null;
	if (typeof janela.RAGIDLE_ENTRADA === 'string') {
		bruto = janela.RAGIDLE_ENTRADA;
		janela.RAGIDLE_ENTRADA = undefined;
	} else {
		const hash = janela.location && janela.location.hash;
		if (typeof hash === 'string' && hash.indexOf(PREFIXO_DO_FRAGMENTO) === 0) {
			bruto = hash.slice(PREFIXO_DO_FRAGMENTO.length);
			try {
				janela.history.replaceState(null, '', janela.location.pathname + janela.location.search);
			} catch (e) {
				// Sem `history` (um ambiente estranho) o jogo segue: o passe e de uso
				// unico e vence em minutos, deixa-lo na barra nao abre nada depois.
			}
		}
	}
	if (bruto === null) return null;
	_entrada = lerEntrada(bruto);
	_pendente = false;
	_aceita = false;
	return _entrada;
}

/**
 * O cadastro feito DENTRO da tela de login (23/09/2026,
 * `UI/Components/WinLogin/cadastroNaEntrada.js`) recebe o passe na resposta do
 * balcao, sem passar por endereco nenhum. Arma o mesmo estado que
 * `capturarEntrada`, para o login com o passe cair na criacao de personagem e
 * contar a conversao, igual ao cadastro pelo site.
 *
 * @param {string} usuario
 * @param {string} passe
 * @returns {{usuario: string, passe: string} | null}
 */
export function armarEntrada(usuario, passe) {
	_entrada = lerEntrada(String(usuario) + '.' + String(passe));
	_pendente = false;
	_aceita = false;
	return _entrada;
}

/**
 * Todo `CA_LOGIN` passa por aqui. So o login que leva EXATAMENTE o passe
 * capturado arma o estado; qualquer outro o apaga.
 *
 * @param {string} usuario
 * @param {string} senha
 */
export function pedidoDeLogin(usuario, senha) {
	_pendente = _entrada !== null && usuario === _entrada.usuario && senha === _entrada.passe;
	_aceita = false;
	if (!_pendente) _entrada = null;
}

/**
 * O servidor aceitou o login. Se era o do passe, devolve o usuario (para a
 * tela de login lembrar dele), senao `null`.
 *
 * @returns {string | null}
 */
export function loginAceito() {
	if (!_pendente || _entrada === null) return null;
	const usuario = _entrada.usuario;
	// O passe esta gasto no servidor. Apagar a entrada aqui, e nao so no fim,
	// impede que um login digitado depois (por exemplo, voltando da selecao)
	// case com ela e seja lido como o do passe.
	_entrada = null;
	_pendente = false;
	_aceita = true;
	_usuarioDaConversao = usuario;
	return usuario;
}

/**
 * O servidor recusou. Se era o login do passe (vencido, ja gasto, servidor
 * reiniciado), devolve o usuario para a tela de login vir preenchida.
 *
 * @returns {string | null}
 */
export function loginRecusado() {
	const usuario = _pendente && _entrada !== null ? _entrada.usuario : null;
	_entrada = null;
	_pendente = false;
	_aceita = false;
	return usuario;
}

/**
 * A lista de personagens chegou. Abre a criacao direto SO para a conta que
 * acabou de entrar pelo passe e ainda nao tem personagem nenhum. Decide uma
 * vez: depois disso o estado se apaga, e voltar da criacao para a selecao e o
 * jogo de sempre.
 *
 * @param {number} quantosPersonagens
 * @returns {boolean}
 */
export function abrirCriacaoDireto(quantosPersonagens) {
	const abrir = _aceita && quantosPersonagens === 0;
	_entrada = null;
	_pendente = false;
	_aceita = false;
	return abrir;
}

/**
 * O EVENTO DE CONVERSAO do Meta Pixel, na chegada a criacao de personagem
 * pos-cadastro. Quem chama e o CharEngine, e SO no ramo em que
 * `abrirCriacaoDireto` disse sim, entao ele sai uma vez por cadastro: o passe e
 * de uso unico no servidor, e um F5 ja nao tem passe para recapturar.
 *
 * @param {Window} janela
 * @returns {boolean} se o evento foi entregue ao Pixel
 */
export function registrarConversaoDoCadastro(janela = window) {
	try {
		if (typeof janela.fbq !== 'function') return false;
		const usuario = _usuarioDaConversao;
		_usuarioDaConversao = null;
		const fbq = janela.fbq;
		/*
		 * O EVENTO E `Lead` (10/10/2026, decisao do dono): o conjunto de anuncios
		 * otimiza por Lead, e o dataset fica so com PageView e Lead. Ate aqui ele
		 * era o `CompleteRegistration`.
		 *
		 * O `eventID` (09/10/2026) e o MESMO do evento que o servidor manda pela
		 * API de Conversoes (`servidor/web/conversoes-meta.ts`, no rag-idle):
		 * `cadastro.<sha256 do usuario em minusculas>`. Com ele a Meta junta os
		 * dois e conta o cadastro UMA vez. O hash e assincrono no navegador, por
		 * isso o evento sai na volta dele; sem `crypto.subtle` (pagina sem
		 * HTTPS) ou sem usuario, sai sem id, como antes.
		 */
		idDoEventoDeCadastro(usuario, janela)
			.then(eventID => {
				if (eventID) fbq('track', 'Lead', {}, { eventID });
				else fbq('track', 'Lead');
			})
			.catch(() => {});
		return true;
	} catch (e) {
		return false;
	}
}

/**
 * `cadastro.<sha256(usuario em minusculas)>`, ou null quando nao da para calcular.
 *
 * @param {string | null} usuario
 * @param {Window} janela
 * @returns {Promise<string | null>}
 */
export async function idDoEventoDeCadastro(usuario, janela = window) {
	try {
		const subtle = janela.crypto && janela.crypto.subtle;
		if (!usuario || !subtle) return null;
		const bytes = new TextEncoder().encode(usuario.trim().toLowerCase());
		const resumo = new Uint8Array(await subtle.digest('SHA-256', bytes));
		return 'cadastro.' + Array.from(resumo, b => b.toString(16).padStart(2, '0')).join('');
	} catch (e) {
		return null;
	}
}

/** So para os testes: volta o modulo ao estado de pagina nova. */
export function _reiniciarParaTeste() {
	_entrada = null;
	_pendente = false;
	_aceita = false;
	_usuarioDaConversao = null;
}
