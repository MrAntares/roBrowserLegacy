/**
 * UI/Components/Bank/quantiaDoBanco.js
 *
 * A QUANTIA QUE PODE SAIR DA JANELA DO BANCO (12/10/2026, anti-exploit; D-2307).
 *
 * ── Por que isto existe ─────────────────────────────────────────────────
 * O servidor passou a contar para a sentinela de integridade o pedido ao cofre
 * com quantia <= 0 (quase-prova: "nenhum clique manda isso") e acima do saldo
 * (suspeita). Para essas palavras serem verdade, a janela nao pode mandar
 * nenhum dos dois por um caminho legitimo - e mandava:
 *
 *   1. O "MAX" lia o saldo do cofre do TEXTO da tela:
 *      `parseInt(getIntValueFromFormattedString(inbank.textContent))`. O texto
 *      e `bankMoney.toLocaleString() + 'z'`, e o locale manda no formato: em
 *      pt-BR "1.234.567z" virava 1 (o MAX sacava 1 zeny); com outros digitos
 *      (arabe, persa...) ou texto vazio, `NaN`/`null`, e o pacote saia com 0.
 *   2. O valor digitado nao era conferido contra o saldo (o do cofre no saque,
 *      o da mao no deposito): o erro de digitacao honesto ia ao fio acima do
 *      possivel.
 *
 * ── A escolha: RECUSAR com o aviso, e nao aparar ─────────────────────────
 * A troca (Trade.js, `onConclude`) apara o zeny ao saldo; o armazem
 * (`quantidadeDaRetirada`) recusa o que passa da pilha. O banco fica com a
 * recusa, por tres motivos:
 *   - a resposta do proprio servidor a esse pedido e uma RECUSA com aviso
 *     (`ZC_ACK_BANKING_*` motivo 1/2, que `Engine/MapEngine/Bank.js` ja pinta
 *     com 2786/2455 e 2780/2456). Recusar aqui com as MESMAS mensagens deixa o
 *     jogador ver exatamente o que via antes - so o pacote deixa de sair;
 *   - a janela ja recusava, e nao aparava, o caso vizinho (o saque que estoura
 *     o teto da mao, 2787/2459);
 *   - o banco executa no clique: aparar moveria outra quantia que nao a
 *     digitada, sem o jogador conferir. Na troca o numero aparado fica visivel
 *     e ainda passa por dois OKs.
 *
 * ── O saldo vem do NUMERO, e nao do texto ────────────────────────────────
 * Quem chama passa o saldo do cofre que chegou no pacote (`updateBankDisplay`)
 * e o zeny da sessao. Mesmo assim esta funcao desconfia: saldo que nao e
 * inteiro finito >= 0 e "ilegivel", e nada sai.
 *
 * Nada aqui fala com DOM nem com a rede: so decide.
 */

/** O teto do zeny na mao e no cofre: `MAX_ZENY`/`MAX_BANK_ZENY` (`INT_MAX`, mmo.hpp:82-83). */
export const TETO_DE_ZENY = 2147483647;

/** O texto que o botao "MAX" poe no campo. */
export const ENTRADA_MAXIMA = 'MAX';

export const DEPOSITAR = 'depositar';
export const SACAR = 'sacar';

/**
 * Os motivos de nada sair. Cada um vira um aviso em `Bank.js` (o mapa
 * `AVISO_DA_RECUSA`), menos `saldo-ilegivel`, que sai calado: nao ha mensagem
 * do cliente que diga isso, e inventar uma seria pior que o silencio.
 */
export const RECUSA = Object.freeze({
	VAZIO: 'vazio',
	NAO_NUMERICO: 'nao-numerico',
	NAO_POSITIVO: 'nao-positivo',
	ACIMA_DO_TETO: 'acima-do-teto',
	SALDO_ILEGIVEL: 'saldo-ilegivel',
	SEM_SALDO: 'sem-saldo',
	ACIMA_DO_SALDO: 'acima-do-saldo',
	ESTOURA_O_COFRE: 'estoura-o-cofre',
	ESTOURA_A_MAO: 'estoura-a-mao'
});

/** Saldo que se pode usar numa conta: inteiro, finito e nao negativo. */
function saldoLegivel(valor) {
	return Number.isInteger(valor) && valor >= 0;
}

/**
 * A quantia que o pedido ao cofre pode levar, ou por que nada sai.
 *
 * Toda quantia devolvida e inteiro finito em [1, saldo] e nao estoura o teto do
 * outro lado: e o que o servidor aceita (`servidor/banco.ts`, `depositar` e
 * `sacar`), e por isso nunca e sinal para a sentinela.
 *
 * @param {object} p
 * @param {string} p.operacao - DEPOSITAR ou SACAR
 * @param {unknown} p.entrada - o texto do campo (ou ENTRADA_MAXIMA)
 * @param {unknown} p.zenyNaMao - `Session.zeny`
 * @param {unknown} p.saldoNoCofre - o saldo do cofre que veio no pacote
 * @returns {{quantia: number} | {recusa: string}}
 */
export function quantiaDoPedido({ operacao, entrada, zenyNaMao, saldoNoCofre }) {
	const texto = typeof entrada === 'number' ? String(entrada) : entrada;
	if (texto === '' || texto === undefined || texto === null) {
		return { recusa: RECUSA.VAZIO };
	}
	if (typeof texto !== 'string' || (texto !== ENTRADA_MAXIMA && !/^\d+$/.test(texto))) {
		return { recusa: RECUSA.NAO_NUMERICO };
	}

	const maximo = texto === ENTRADA_MAXIMA;
	// O que o campo diz por si so vem antes dos saldos (os avisos de sempre).
	const pedido = maximo ? null : parseInt(texto, 10);
	if (!maximo && pedido <= 0) {
		return { recusa: RECUSA.NAO_POSITIVO };
	}
	if (!maximo && pedido > TETO_DE_ZENY) {
		return { recusa: RECUSA.ACIMA_DO_TETO };
	}

	// Sem os dois saldos nao ha conta honesta: nem o MAX nem a conferencia do
	// digitado. Nao sai nada (o pacote com 0 era exatamente este caso).
	if (!saldoLegivel(zenyNaMao) || !saldoLegivel(saldoNoCofre)) {
		return { recusa: RECUSA.SALDO_ILEGIVEL };
	}

	const deposito = operacao === DEPOSITAR;
	// De onde o zeny sai e para onde vai.
	const origem = deposito ? zenyNaMao : saldoNoCofre;
	const destino = deposito ? saldoNoCofre : zenyNaMao;
	const espaco = TETO_DE_ZENY - destino;

	if (maximo) {
		if (origem <= 0) {
			return { recusa: RECUSA.SEM_SALDO };
		}
		if (espaco <= 0) {
			return { recusa: deposito ? RECUSA.ESTOURA_O_COFRE : RECUSA.ESTOURA_A_MAO };
		}
		return { quantia: Math.min(origem, espaco) };
	}

	if (pedido > origem) {
		return { recusa: RECUSA.ACIMA_DO_SALDO };
	}
	if (pedido > espaco) {
		return { recusa: deposito ? RECUSA.ESTOURA_O_COFRE : RECUSA.ESTOURA_A_MAO };
	}
	return { quantia: pedido };
}
