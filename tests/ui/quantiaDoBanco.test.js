/**
 * A QUANTIA QUE SAI DA JANELA DO BANCO (12/10/2026, anti-exploit; D-2307).
 *
 * O servidor passou a contar para a sentinela o pedido ao cofre com quantia
 * <= 0 (quase-prova) e acima do saldo (suspeita). Para isso nao acusar jogador
 * honesto, a janela nao pode mandar nenhum dos dois - e mandava:
 *   1. o "MAX" relia o saldo do TEXTO da tela (`toLocaleString`): em pt-BR
 *      "1.234.567z" virava 1, e com outros digitos ou texto vazio, NaN -> 0;
 *   2. o valor digitado nao era conferido contra o saldo.
 *
 * A regra mora em `quantiaDoBanco.js` e e medida aqui sem DOM; a janela de
 * verdade (`Bank.js`) e montada no jsdom, com o arreio de `atalhosDaCompra`,
 * para provar que o clique so vira pacote com a quantia aprovada.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	session: { zeny: 0, AID: 2000001 },
	enviados: [],
	chat: [],
	pacotes: {}
}));

vi.mock('Network/NetworkManager.js', () => ({
	default: { sendPacket: p => mocks.enviados.push(p), hookPacket: () => {} }
}));
vi.mock('Network/PacketStructure.js', () => {
	const pacote = nome =>
		function () {
			this.nome = nome;
		};
	return {
		default: {
			CZ: {
				REQ_BANKING_DEPOSIT: pacote('deposito'),
				REQ_BANKING_WITHDRAW: pacote('saque'),
				REQ_BANK_OPEN: pacote('abrir'),
				REQ_BANK_CLOSE: pacote('fechar')
			}
		}
	};
});
vi.mock('DB/DBManager.js', () => ({ default: { getMessage: id => `MSG ${id}` } }));
vi.mock('Engine/SessionStorage.js', () => ({ default: mocks.session }));
vi.mock('Controls/KeyEventHandler.js', () => ({ default: { ESCAPE: 27, ENTER: 13 } }));
vi.mock('Core/Preferences.js', () => ({ default: { get: (_n, padrao) => ({ ...padrao, save: () => {} }) } }));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1024, height: 768 } }));
vi.mock('UI/UIManager.js', () => ({ default: { addComponent: c => c } }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({
	default: {
		addText: (texto, tipo) => mocks.chat.push(texto),
		TYPE: { ERROR: 1 },
		FILTER: { PUBLIC_LOG: 1 }
	}
}));
vi.mock('UI/Components/NpcBox/NpcBox.js', () => ({ default: {} }));
vi.mock('UI/Components/NpcMenu/NpcMenu.js', () => ({ default: {} }));
vi.mock('UI/Components/InputBox/InputBox.js', () => ({ default: {} }));

const { default: Bank } = await import('UI/Components/Bank/Bank.js');
const { default: htmlDoComponente } = await import('UI/Components/Bank/Bank.html?raw');
const { DEPOSITAR, ENTRADA_MAXIMA, RECUSA, SACAR, TETO_DE_ZENY, quantiaDoPedido } = await import(
	'UI/Components/Bank/quantiaDoBanco.js'
);

const pedir = (operacao, entrada, zenyNaMao, saldoNoCofre) =>
	quantiaDoPedido({ operacao, entrada, zenyNaMao, saldoNoCofre });

describe('a regra (sem DOM): o MAX', () => {
	it('saca o saldo inteiro do cofre e deposita o zeny inteiro da mao', () => {
		expect(pedir(SACAR, ENTRADA_MAXIMA, 100, 1_234_567)).toEqual({ quantia: 1_234_567 });
		expect(pedir(DEPOSITAR, ENTRADA_MAXIMA, 5_000, 1_234_567)).toEqual({ quantia: 5_000 });
	});

	it('sem saldo do lado de onde o zeny sai: nada sai', () => {
		expect(pedir(SACAR, ENTRADA_MAXIMA, 100, 0)).toEqual({ recusa: RECUSA.SEM_SALDO });
		expect(pedir(DEPOSITAR, ENTRADA_MAXIMA, 0, 900)).toEqual({ recusa: RECUSA.SEM_SALDO });
	});

	it('saldo ilegivel (NaN, null, texto, fracao, negativo, infinito): nada sai - era o pacote com 0', () => {
		for (const ruim of [NaN, null, undefined, '1.234', 1.5, -1, Infinity]) {
			expect(pedir(SACAR, ENTRADA_MAXIMA, 100, ruim)).toEqual({ recusa: RECUSA.SALDO_ILEGIVEL });
			expect(pedir(DEPOSITAR, ENTRADA_MAXIMA, ruim, 100)).toEqual({ recusa: RECUSA.SALDO_ILEGIVEL });
		}
		// o OUTRO lado tambem precisa ser legivel: o MAX depende do espaco nele
		expect(pedir(SACAR, ENTRADA_MAXIMA, NaN, 100)).toEqual({ recusa: RECUSA.SALDO_ILEGIVEL });
		expect(pedir(DEPOSITAR, ENTRADA_MAXIMA, 100, NaN)).toEqual({ recusa: RECUSA.SALDO_ILEGIVEL });
	});

	it('para no teto do outro lado (o servidor recusaria o estouro)', () => {
		expect(pedir(SACAR, ENTRADA_MAXIMA, TETO_DE_ZENY - 10, 500)).toEqual({ quantia: 10 });
		expect(pedir(DEPOSITAR, ENTRADA_MAXIMA, 500, TETO_DE_ZENY - 10)).toEqual({ quantia: 10 });
		// exatamente o espaco que sobra cabe (o servidor aceita o igual)
		expect(pedir(SACAR, ENTRADA_MAXIMA, TETO_DE_ZENY - 500, 500)).toEqual({ quantia: 500 });
	});

	it('com o outro lado ja no teto: nada sai, com o aviso do estouro', () => {
		expect(pedir(SACAR, ENTRADA_MAXIMA, TETO_DE_ZENY, 500)).toEqual({ recusa: RECUSA.ESTOURA_A_MAO });
		expect(pedir(DEPOSITAR, ENTRADA_MAXIMA, 500, TETO_DE_ZENY)).toEqual({ recusa: RECUSA.ESTOURA_O_COFRE });
	});
});

describe('a regra (sem DOM): o valor digitado', () => {
	it('dentro do saldo sai como foi digitado; o saldo exato tambem', () => {
		expect(pedir(SACAR, '250', 0, 1000)).toEqual({ quantia: 250 });
		expect(pedir(SACAR, '1000', 0, 1000)).toEqual({ quantia: 1000 });
		expect(pedir(DEPOSITAR, '5000', 5000, 0)).toEqual({ quantia: 5000 });
		expect(pedir(DEPOSITAR, 7, 10, 0)).toEqual({ quantia: 7 }); // o +/- poe numero no campo
	});

	it('acima do saldo de onde sai: recusado (e nao aparado)', () => {
		expect(pedir(SACAR, '1001', 0, 1000)).toEqual({ recusa: RECUSA.ACIMA_DO_SALDO });
		expect(pedir(DEPOSITAR, '5001', 5000, 0)).toEqual({ recusa: RECUSA.ACIMA_DO_SALDO });
		// o saldo de onde NAO sai nao conta
		expect(pedir(SACAR, '1001', 999_999, 1000)).toEqual({ recusa: RECUSA.ACIMA_DO_SALDO });
		expect(pedir(DEPOSITAR, '5001', 5000, 999_999)).toEqual({ recusa: RECUSA.ACIMA_DO_SALDO });
	});

	it('dentro do saldo mas estourando o outro lado: recusado com o aviso do estouro', () => {
		expect(pedir(SACAR, '11', TETO_DE_ZENY - 10, 500)).toEqual({ recusa: RECUSA.ESTOURA_A_MAO });
		expect(pedir(DEPOSITAR, '11', 500, TETO_DE_ZENY - 10)).toEqual({ recusa: RECUSA.ESTOURA_O_COFRE });
		expect(pedir(SACAR, '10', TETO_DE_ZENY - 10, 500)).toEqual({ quantia: 10 });
	});

	it('vazio, letra, zero e acima do teto: os avisos de sempre, antes de olhar saldo', () => {
		expect(pedir(SACAR, '', 0, 1000)).toEqual({ recusa: RECUSA.VAZIO });
		expect(pedir(SACAR, null, 0, 1000)).toEqual({ recusa: RECUSA.VAZIO });
		expect(pedir(SACAR, '12a', 0, 1000)).toEqual({ recusa: RECUSA.NAO_NUMERICO });
		expect(pedir(SACAR, '-5', 0, 1000)).toEqual({ recusa: RECUSA.NAO_NUMERICO });
		expect(pedir(SACAR, '1.000', 0, 1000)).toEqual({ recusa: RECUSA.NAO_NUMERICO });
		expect(pedir(SACAR, '0', 0, 1000)).toEqual({ recusa: RECUSA.NAO_POSITIVO });
		expect(pedir(SACAR, '000', 0, 1000)).toEqual({ recusa: RECUSA.NAO_POSITIVO });
		expect(pedir(SACAR, '0', 0, NaN)).toEqual({ recusa: RECUSA.NAO_POSITIVO });
		expect(pedir(SACAR, '2147483648', 0, NaN)).toEqual({ recusa: RECUSA.ACIMA_DO_TETO });
		expect(pedir(SACAR, String(TETO_DE_ZENY), 0, TETO_DE_ZENY)).toEqual({ quantia: TETO_DE_ZENY });
	});

	it('o digitado com saldo ilegivel: nada sai', () => {
		expect(pedir(SACAR, '10', 0, NaN)).toEqual({ recusa: RECUSA.SALDO_ILEGIVEL });
		expect(pedir(DEPOSITAR, '10', undefined, 0)).toEqual({ recusa: RECUSA.SALDO_ILEGIVEL });
	});

	it('TODA quantia aprovada e inteiro finito em [1, saldo] - o que o servidor aceita, nunca sinal', () => {
		const entradas = ['', 'MAX', '0', '1', '7', '999', '1000', '1001', '2147483647', '2147483648', 'x', 0, 3];
		const saldos = [0, 1, 999, 1000, TETO_DE_ZENY - 1, TETO_DE_ZENY, NaN, null, -3, 2.5];
		for (const operacao of [DEPOSITAR, SACAR]) {
			for (const entrada of entradas) {
				for (const mao of saldos) {
					for (const cofre of saldos) {
						const r = pedir(operacao, entrada, mao, cofre);
						if (!('quantia' in r)) continue;
						const origem = operacao === DEPOSITAR ? mao : cofre;
						const destino = operacao === DEPOSITAR ? cofre : mao;
						expect(Number.isInteger(r.quantia)).toBe(true);
						expect(r.quantia).toBeGreaterThan(0);
						expect(r.quantia).toBeLessThanOrEqual(origem);
						expect(r.quantia + destino).toBeLessThanOrEqual(TETO_DE_ZENY);
					}
				}
			}
		}
	});
});

/* ---------------------------------------------------------------------- */
/* A janela de verdade, no jsdom                                           */
/* ---------------------------------------------------------------------- */

function montar() {
	Bank._host = document.createElement('div');
	Bank._host.innerHTML = htmlDoComponente;
	Bank._shadow = Bank._host;
	Bank._container = Bank._host;
	Bank.draggable = () => {};
	Bank.init();
}

const raiz = () => Bank.getRoot();
const campo = () => raiz().querySelector('.depo');
const aviso = () => raiz().querySelector('.errorupdate').textContent;
const clicar = cls => raiz().querySelector(`.${cls}`).click();
function digitar(valor) {
	campo().value = valor;
}

describe('a janela: o que vira pacote', () => {
	beforeEach(() => {
		mocks.enviados.length = 0;
		mocks.chat.length = 0;
		mocks.session.zeny = 5_000;
		montar();
	});

	it('o MAX do saque manda o saldo inteiro, mesmo com o texto da tela no formato pt-BR', () => {
		Bank.updateBankDisplay(1_234_567, mocks.session.zeny);
		// O texto da tela e do locale; a regra antiga lia daqui (e em pt-BR dava 1).
		raiz().querySelector('.inbank.currency').textContent = '1.234.567z';
		clicar('max');
		clicar('withdraw');
		expect(mocks.enviados).toEqual([expect.objectContaining({ nome: 'saque', money: 1_234_567, AID: 2000001 })]);
		expect(campo().value).toBe('');
	});

	it('o MAX do saque com o texto da tela ilegivel (outros digitos) ainda manda o numero certo', () => {
		Bank.updateBankDisplay(800, mocks.session.zeny);
		raiz().querySelector('.inbank.currency').textContent = '٨٠٠z';
		clicar('max');
		clicar('withdraw');
		expect(mocks.enviados.map(p => p.money)).toEqual([800]);
	});

	it('o MAX do deposito manda o zeny da mao', () => {
		Bank.updateBankDisplay(0, mocks.session.zeny);
		clicar('max');
		clicar('deposit');
		expect(mocks.enviados).toEqual([expect.objectContaining({ nome: 'deposito', money: 5_000 })]);
	});

	it('o MAX com o cofre vazio NAO manda nada, e avisa como o servidor avisaria', () => {
		Bank.updateBankDisplay(0, mocks.session.zeny);
		clicar('max');
		clicar('withdraw');
		expect(mocks.enviados).toEqual([]);
		expect(aviso()).toBe('MSG 2786');
		expect(mocks.chat).toEqual(['MSG 2455']);
		expect(campo().value).toBe('');
	});

	it('o MAX do deposito sem zeny na mao NAO manda nada (o aviso de sempre)', () => {
		mocks.session.zeny = 0;
		Bank.updateBankDisplay(300, 0);
		clicar('max');
		clicar('deposit');
		expect(mocks.enviados).toEqual([]);
		expect(aviso()).toBe('MSG 2785');
		expect(mocks.chat).toEqual(['MSG 2770']);
	});

	it('sem o saldo do cofre (a janela fechou e reabriu sem o pacote): o MAX nao manda nada, calado', () => {
		Bank.updateBankDisplay(900, mocks.session.zeny);
		Bank.onRemove(); // esquece o saldo
		montar();
		clicar('max');
		clicar('withdraw');
		expect(mocks.enviados).toEqual([]);
		expect(mocks.chat).toEqual([]);
		expect(aviso()).toBe('');
	});

	it('o saque digitado acima do cofre NAO sai: o aviso do servidor (2786/2455)', () => {
		Bank.updateBankDisplay(1000, mocks.session.zeny);
		digitar('1001');
		clicar('withdraw');
		expect(mocks.enviados).toEqual([]);
		expect(aviso()).toBe('MSG 2786');
		expect(mocks.chat).toEqual(['MSG 2455']);
		expect(campo().value).toBe('');
	});

	it('o deposito digitado acima da mao NAO sai: o aviso do servidor (2780/2456)', () => {
		Bank.updateBankDisplay(0, mocks.session.zeny);
		digitar('5001');
		clicar('deposit');
		expect(mocks.enviados).toEqual([]);
		expect(aviso()).toBe('MSG 2780');
		expect(mocks.chat).toEqual(['MSG 2456']);
	});

	it('dentro do saldo, o digitado sai como foi digitado', () => {
		Bank.updateBankDisplay(1000, mocks.session.zeny);
		digitar('1000');
		clicar('withdraw');
		digitar('5000');
		clicar('deposit');
		expect(mocks.enviados.map(p => [p.nome, p.money])).toEqual([
			['saque', 1000],
			['deposito', 5000]
		]);
	});

	it('zero e letra nao saem, com os avisos de sempre', () => {
		Bank.updateBankDisplay(1000, mocks.session.zeny);
		digitar('0');
		clicar('withdraw');
		expect(aviso()).toBe('MSG 2784');
		digitar('abc');
		clicar('deposit');
		expect(aviso()).toBe('MSG 2782');
		digitar('');
		clicar('deposit');
		expect(aviso()).toBe('MSG 2781');
		expect(mocks.chat).toEqual(['MSG 2769', 'MSG 2488', 'MSG 2779']);
		expect(mocks.enviados).toEqual([]);
	});

	it('o saque que estoura a mao segue recusado com o aviso que a janela ja dava (2787/2459)', () => {
		mocks.session.zeny = TETO_DE_ZENY - 5;
		Bank.updateBankDisplay(1000, mocks.session.zeny);
		digitar('6');
		clicar('withdraw');
		expect(mocks.enviados).toEqual([]);
		expect(aviso()).toBe('MSG 2787');
		expect(mocks.chat).toEqual(['MSG 2459']);
	});
});
