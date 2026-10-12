import fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { criarPedidoAdiado } from '../../src/Engine/MapEngine/pedidoAdiadoPeloGolpe.js';

/*
 * Lote 7, achados #6 e #29 (cliente): o pedido de skill guardado so caia no
 * clique esquerdo do mapa, na troca de mapa e na morte. O joystick do celular
 * (MobileUI), o gamepad (JoystickCharacterControl) e o seguir automatico
 * mandavam CZ_REQUEST_MOVE sem descartar nada, e o ZC_NOTIFY_PLAYERMOVE deles
 * CONFIRMAVA o pedido velho (confirmarPeloServidor so compara o pacote com o
 * Session.moveAction): a skill saia no fim da caminhada de fuga ou arrastava o
 * boneco de volta ao alvo. Agora todo gesto "o jogador pediu para andar" passa
 * por UMA funcao, `jogadorPediuParaAndar`.
 */

const mocks = vi.hoisted(() => {
	class Pacote {
		constructor() {
			this.dest = [0, 0];
		}
	}
	class REQUEST_MOVE extends Pacote {}
	class REQUEST_MOVE2 extends Pacote {}
	return {
		rede: { sendPacket: vi.fn() },
		pacotes: { CZ: { REQUEST_MOVE, REQUEST_MOVE2 } },
		versao: { value: 20200101 },
		camera: { direction: 0 }
	};
});

vi.mock('Network/NetworkManager.js', () => ({ default: mocks.rede }));
vi.mock('Network/PacketStructure.js', () => ({ default: mocks.pacotes }));
vi.mock('Network/PacketVerManager.js', () => ({ default: mocks.versao }));
vi.mock('Renderer/Camera.js', () => ({ default: mocks.camera }));
vi.mock('Renderer/Map/Altitude.js', () => ({ default: { getCellType: () => 2, TYPE: { WALKABLE: 2 } } }));
vi.mock('Renderer/EntityManager.js', () => ({ default: {} }));
vi.mock('Utils/PathFinding.js', () => ({ default: {} }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({ default: {} }));
vi.mock('UI/Components/JoystickUI/JoystickTargetService.js', () => ({ default: {} }));

const {
	FOLGA_DO_GESTO_DE_ANDAR_MS,
	criarGestoDeAndar,
	jogadorPediuParaAndar
} = await import('../../src/Engine/MapEngine/pedidoGuardado.js');
const { default: Session } = await import('../../src/Engine/SessionStorage.js');
const { default: Gamepad } = await import('../../src/UI/Components/JoystickUI/JoystickCharacterControl.js');

const sessaoComPedido = () => ({
	moveAction: { SKID: 83 },
	moveActionAlcance: { alcance: 9 },
	moveActionEspera: { confirmada: false }
});

describe('jogadorPediuParaAndar e a funcao unica de quem anda por vontade propria', () => {
	it('sem gesto: zera o moveAction, o alcance e a espera e cancela o pedido da janela do golpe', () => {
		const sessao = sessaoComPedido();
		const adiado = { cancelar: vi.fn() };
		expect(jogadorPediuParaAndar(sessao, { adiado })).toBe(true);
		expect(adiado.cancelar).toHaveBeenCalledTimes(1);
		expect(sessao.moveAction).toBe(null);
		expect(sessao.moveActionAlcance).toBe(null);
		expect(sessao.moveActionEspera).toBe(null);
	});

	it('sem gesto: cada chamada descarta (o clique, o seguir ligado, o pegar item)', () => {
		const sessao = sessaoComPedido();
		const adiado = { cancelar: vi.fn() };
		jogadorPediuParaAndar(sessao, { adiado });
		sessao.moveAction = { SKID: 28 };
		jogadorPediuParaAndar(sessao, { adiado });
		expect(sessao.moveAction).toBe(null);
		expect(adiado.cancelar).toHaveBeenCalledTimes(2);
	});

	it('o pedido agendado de verdade na janela do golpe nao sai depois do andar do jogador', () => {
		vi.useFakeTimers();
		try {
			const p = criarPedidoAdiado({ agendar: (fn, ms) => setTimeout(fn, ms), cancelar: id => clearTimeout(id) });
			const sai = vi.fn();
			p.adiarSeNaJanela(2000, 1000, sai);
			jogadorPediuParaAndar({ moveAction: null, moveActionAlcance: null, moveActionEspera: null }, { adiado: p });
			vi.advanceTimersByTime(10000);
			expect(sai).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});
});

describe('o gesto continuo (joystick, gamepad): so o INICIO descarta', () => {
	it('a 1a chamada descarta; as do mesmo gesto (a cada 100 ms) deixam passar o pedido NOVO', () => {
		const sessao = sessaoComPedido();
		const adiado = { cancelar: vi.fn() };
		const gesto = criarGestoDeAndar();

		expect(jogadorPediuParaAndar(sessao, { gesto, agora: 1000, adiado })).toBe(true);
		expect(sessao.moveAction).toBe(null);

		// O jogador segura o stick e pede uma skill: ela e DEPOIS do inicio do gesto.
		const pedidoNovo = { SKID: 28 };
		sessao.moveAction = pedidoNovo;
		expect(jogadorPediuParaAndar(sessao, { gesto, agora: 1100, adiado })).toBe(false);
		expect(jogadorPediuParaAndar(sessao, { gesto, agora: 1200, adiado })).toBe(false);
		expect(sessao.moveAction).toBe(pedidoNovo);
		expect(adiado.cancelar).toHaveBeenCalledTimes(1);
	});

	it('passada a folga sem andar, o gesto seguinte e novo e descarta de novo', () => {
		const sessao = sessaoComPedido();
		const gesto = criarGestoDeAndar();
		const adiado = { cancelar: vi.fn() };
		jogadorPediuParaAndar(sessao, { gesto, agora: 1000, adiado });
		sessao.moveAction = { SKID: 28 };
		// Dentro da folga ainda e o mesmo gesto; um ms alem dela, e outro.
		expect(jogadorPediuParaAndar(sessao, { gesto, agora: 1000 + FOLGA_DO_GESTO_DE_ANDAR_MS, adiado })).toBe(false);
		sessao.moveAction = { SKID: 28 };
		const ultimo = 1000 + FOLGA_DO_GESTO_DE_ANDAR_MS;
		expect(jogadorPediuParaAndar(sessao, { gesto, agora: ultimo + FOLGA_DO_GESTO_DE_ANDAR_MS + 1, adiado })).toBe(true);
		expect(sessao.moveAction).toBe(null);
	});

	it('encerrar() (soltar o joystick) faz o proximo toque ser gesto novo mesmo logo depois', () => {
		const sessao = sessaoComPedido();
		const gesto = criarGestoDeAndar();
		const adiado = { cancelar: vi.fn() };
		jogadorPediuParaAndar(sessao, { gesto, agora: 1000, adiado });
		gesto.encerrar();
		sessao.moveAction = { SKID: 28 };
		expect(jogadorPediuParaAndar(sessao, { gesto, agora: 1050, adiado })).toBe(true);
		expect(sessao.moveAction).toBe(null);
	});

	it('a folga cobre o ritmo do gamepad e do joystick (100 ms) com sobra e e curta', () => {
		expect(FOLGA_DO_GESTO_DE_ANDAR_MS).toBeGreaterThanOrEqual(200);
		expect(FOLGA_DO_GESTO_DE_ANDAR_MS).toBeLessThanOrEqual(500);
	});
});

describe('gamepad: JoystickCharacterControl.move (achado #6)', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-10-02T12:00:00Z'));
		mocks.rede.sendPacket.mockClear();
		Session.Entity = { position: [10, 10] };
		Session.moveAction = { SKID: 83 };
		Session.moveActionAlcance = { alcance: 9 };
		Session.moveActionEspera = { confirmada: true };
	});

	afterEach(() => {
		vi.useRealTimers();
		Session.Entity = null;
		Session.moveAction = null;
		Session.moveActionAlcance = null;
		Session.moveActionEspera = null;
	});

	it('empurrar o stick para fugir descarta a skill guardada, e o andar sai', () => {
		Gamepad.move(1, 0);
		expect(Session.moveAction).toBe(null);
		expect(Session.moveActionAlcance).toBe(null);
		expect(Session.moveActionEspera).toBe(null);
		expect(mocks.rede.sendPacket).toHaveBeenCalledTimes(1);
		expect(mocks.rede.sendPacket.mock.calls[0][0].dest).toEqual([13, 10]);
	});

	it('com o stick segurado (100 ms), a skill pedida DEPOIS do inicio nao e cancelada no tique seguinte', () => {
		Gamepad.move(1, 0);
		const pedidoNovo = { SKID: 28 };
		Session.moveAction = pedidoNovo;
		vi.advanceTimersByTime(100);
		Gamepad.move(1, 0);
		expect(Session.moveAction).toBe(pedidoNovo);
		expect(mocks.rede.sendPacket).toHaveBeenCalledTimes(2);
	});

	it('soltar o stick e empurrar de novo (gesto novo) descarta o pedido que ficou', () => {
		Gamepad.move(1, 0);
		Session.moveAction = { SKID: 28 };
		vi.advanceTimersByTime(FOLGA_DO_GESTO_DE_ANDAR_MS + 50);
		Gamepad.move(0, 1);
		expect(Session.moveAction).toBe(null);
	});

	it('sem personagem nao anda e nao descarta', () => {
		Session.Entity = null;
		const pedido = Session.moveAction;
		Gamepad.move(1, 0);
		expect(Session.moveAction).toBe(pedido);
		expect(mocks.rede.sendPacket).not.toHaveBeenCalled();
	});
});

describe('a costura: quem anda por vontade propria chama a funcao unica', () => {
	const MAPCONTROL = 'src/Controls/MapControl.js';
	const MOBILE = 'src/UI/Components/MobileUI/MobileUI.js';
	const GAMEPAD = 'src/UI/Components/JoystickUI/JoystickCharacterControl.js';
	const lido = arquivo => fs.readFileSync(arquivo, 'utf8').replace(/\r\n/g, '\n');
	const semTabs = arquivo => lido(arquivo).replace(/\n\t+/g, '\n');
	/**
	 * O corpo (sem tabs) de `function nome(...) {` ate o primeiro `\n}\n` na
	 * coluna 0 - com as tabs ainda no texto, so a chave da funcao fecha ali.
	 */
	const corpoDe = (arquivo, nome) => {
		const src = lido(arquivo);
		const i = src.indexOf('function ' + nome + '(');
		expect(i, nome).toBeGreaterThan(-1);
		const f = src.indexOf('\n}\n', i);
		expect(f, nome).toBeGreaterThan(i);
		return src.slice(i, f).replace(/\n\t+/g, '\n');
	};

	it('o clique esquerdo do MapControl passa pela funcao unica (no lugar do descarte solto)', () => {
		const src = semTabs(MAPCONTROL);
		expect(src.indexOf('jogadorPediuParaAndar(Session);\nSession.autoFollow = false;')).toBeGreaterThan(-1);
		expect(src).not.toContain('descartarPedidoGuardado');
	});

	it('ligar o seguir (Shift + botao direito) descarta ANTES do primeiro andar; o laco do seguir NAO descarta', () => {
		const src = semTabs(MAPCONTROL);
		expect(
			src.indexOf(
				'jogadorPediuParaAndar(Session);\nSession.autoFollowTarget = entityOver;\nSession.autoFollow = true;\nonAutoFollow();'
			)
		).toBeGreaterThan(-1);
		expect(corpoDe(MAPCONTROL, 'onAutoFollow')).not.toContain('jogadorPediuParaAndar');
	});

	it('o seguir do celular descarta ao LIGAR; o laco dele nao', () => {
		const src = semTabs(MOBILE);
		expect(
			src.indexOf(
				'jogadorPediuParaAndar(Session);\nSession.autoFollow = true;\nSession.autoFollowTarget = entityFocus;\nonAutoFollow();'
			)
		).toBeGreaterThan(-1);
		expect(corpoDe(MOBILE, 'onAutoFollow')).not.toContain('jogadorPediuParaAndar');
	});

	it('o joystick do celular: gesto proprio, avaliado em moveCharacter, encerrado ao soltar', () => {
		const src = semTabs(MOBILE);
		expect(src).toContain('const _gestoDoJoystick = criarGestoDeAndar();');
		expect(corpoDe(MOBILE, 'moveCharacter')).toContain('jogadorPediuParaAndar(Session, { gesto: _gestoDoJoystick });');
		expect(corpoDe(MOBILE, 'stopDrag')).toContain('_gestoDoJoystick.encerrar();');
	});

	it('o pegar item do celular descarta quando manda andar', () => {
		const corpo = corpoDe(MOBILE, 'pickUpItem');
		const i = corpo.indexOf('jogadorPediuParaAndar(Session);');
		expect(i).toBeGreaterThan(-1);
		expect(i).toBeLessThan(corpo.indexOf('Network.sendPacket(pkt);'));
	});

	it('o gamepad avalia o gesto em move, depois da guarda do personagem', () => {
		const src = semTabs(GAMEPAD);
		expect(src).toContain('const _gestoDoStick = criarGestoDeAndar();');
		const corpo = corpoDe(GAMEPAD, 'move');
		expect(corpo.indexOf('jogadorPediuParaAndar(Session, { gesto: _gestoDoStick });')).toBeGreaterThan(corpo.indexOf('if (!player) {'));
	});
});
