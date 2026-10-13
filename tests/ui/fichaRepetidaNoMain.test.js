import { beforeEach, describe, expect, it, vi } from 'vitest';

/*
 * A FICHA REENVIADA NAO E NIVEL NOVO NEM MORTE NOVA (D-2374, 13/10/2026).
 *
 * O servidor reenvia a ficha inteira (`enviarAtributos`,
 * `servidor/mapa/servidor-mapa.ts`) a cada ficha suja do tique: buff que entra
 * ou sai, equipamento, item. Cada reenvio traz `ZC_PAR_CHANGE` de CLEVEL com o
 * nivel IGUAL e, com o personagem morto, de HP com o mesmo 0. O handler
 * (`Engine/MapEngine/Main.js`, `onParameterChange`) mandava um `CZ_PET_ACT`
 * ("subi de nivel" / "morri") a cada um — e o servidor DIFUNDE o gesto do pet
 * ao mapa inteiro.
 *
 * Este arquivo dirige o handler DE VERDADE (o `Main.js` real, com as janelas
 * trocadas por duplos) e CONTA os `CZ_PET_ACT` que saem:
 *
 *   ANTES (a3ebe0fe): 1 reenvio de CLEVEL igual -> 1 CZ_PET_ACT; 5 reenvios -> 5.
 *   DEPOIS: 5 reenvios iguais -> 0; uma subida de nivel -> 1.
 *   ANTES: morto + 3 reenvios de HP 0 -> 4 "morri". DEPOIS: 1.
 */

// O jsdom nao tem canvas 2D, e meio cliente desenha texto num canvas ao ser
// importado (`EntityDisplay.js`). Um contexto que aceita tudo basta: aqui so
// se contam pacotes.
const contextoMudo = new Proxy(
	{},
	{
		get: (alvo, nome) => {
			if (nome === 'measureText') return () => ({ width: 0 });
			if (nome === 'getImageData' || nome === 'createImageData') return () => ({ data: new Uint8ClampedArray(4) });
			return nome in alvo ? alvo[nome] : () => {};
		},
		set: (alvo, nome, valor) => {
			alvo[nome] = valor;
			return true;
		}
	}
);
HTMLCanvasElement.prototype.getContext = () => contextoMudo;

const hooks = new Map();
const enviados = [];
const packet = {
	ZC: new Proxy({}, { get: (alvo, nome) => (alvo[nome] ??= function Pacote() {}) }),
	CZ: new Proxy(
		{},
		{
			get: (alvo, nome) =>
				(alvo[nome] ??= function Pacote() {
					this.nome = nome;
				})
		}
	)
};

const janela = () => ({
	update: vi.fn(),
	onLevelUp: vi.fn(),
	setPoints: vi.fn(),
	updateMemberLife: vi.fn(),
	base_exp: 0,
	base_exp_next: 0,
	job_exp: 0,
	job_exp_next: 0,
	weight_max: -1,
	weight: -1
});
const basicInfo = janela();
const equipment = janela();
const skillList = janela();
const winStats = janela();
const party = janela();
const changeCart = { onLevelUp: vi.fn() };

vi.doMock('Network/NetworkManager.js', () => ({
	default: { hookPacket: (p, f) => hooks.set(p, f), sendPacket: p => enviados.push(p) }
}));
vi.doMock('Network/PacketStructure.js', () => ({ default: packet }));
vi.doMock('Network/PacketVerManager.js', () => ({ default: { value: 20211103 } }));
vi.doMock('DB/DBManager.js', () => ({
	default: { getPetHungryState: () => 0, getPetTalkNumber: (job, tipo) => tipo, getMessage: () => '' }
}));
vi.doMock('UI/Components/BasicInfo/BasicInfo.js', () => ({ default: { getUI: () => basicInfo } }));
vi.doMock('UI/Components/Equipment/Equipment.js', () => ({ default: { getUI: () => equipment } }));
vi.doMock('UI/Components/SkillList/SkillList.js', () => ({ default: { getUI: () => skillList } }));
vi.doMock('UI/Components/WinStats/WinStats.js', () => ({ default: { getUI: () => winStats } }));
vi.doMock('UI/Components/PartyFriends/PartyFriends.js', () => ({ default: { getUI: () => party } }));
vi.doMock('UI/Components/ChangeCart/ChangeCart.js', () => ({ default: changeCart }));
vi.doMock('UI/Components/ChatBox/ChatBox.js', () => ({
	default: { addText: vi.fn(), TYPE: { BLUE: 1 }, FILTER: { FARM_NIVEL: 1, FARM_ZENY: 2 } }
}));
vi.doMock('Renderer/EffectManager.js', () => ({ default: {} }));

const { default: StatusProperty } = await import('DB/Status/StatusProperty.js');
const { default: PetMessageConst } = await import('DB/Pets/PetMessageConst.js');
const { default: Session } = await import('Engine/SessionStorage.js');
const { default: iniciar } = await import('Engine/MapEngine/Main.js');
iniciar();

function parametro(varID, amount) {
	hooks.get(packet.ZC.PAR_CHANGE)({ varID, amount });
}

const falasDoPet = tipo => enviados.filter(p => p.nome === 'PET_ACT' && p.data === tipo).length;

beforeEach(() => {
	enviados.length = 0;
	Session.Entity = {
		GID: 150001,
		clevel: 50,
		joblevel: 10,
		walk: {},
		aura: { load: vi.fn() },
		life: { hp: 500, hp_max: 1000, sp: 10, sp_max: 10, update: vi.fn(), canvas: null }
	};
	Session.pet = { friendly: 950, job: 1002, oldHungry: 50 };
	Session.hasParty = false;
});

describe('CLEVEL reenviado: o pet so comemora nivel que SUBIU', () => {
	it('cinco reenvios do MESMO nivel mandam ZERO CZ_PET_ACT (antes: cinco)', () => {
		for (let i = 0; i < 5; ++i) {
			parametro(StatusProperty.CLEVEL, 50);
		}
		expect(falasDoPet(PetMessageConst.PM_LEVELUP)).toBe(0);
	});

	it('a subida de nivel manda UM, e o reenvio seguinte do nivel novo nao manda outro', () => {
		parametro(StatusProperty.CLEVEL, 51);
		expect(falasDoPet(PetMessageConst.PM_LEVELUP)).toBe(1);
		parametro(StatusProperty.CLEVEL, 51);
		parametro(StatusProperty.CLEVEL, 51);
		expect(falasDoPet(PetMessageConst.PM_LEVELUP)).toBe(1);
		expect(Session.Entity.clevel).toBe(51);
	});

	it('CONTROLE: pet de amizade baixa nao fala nem subindo (a guarda antiga continua)', () => {
		Session.pet.friendly = 100;
		parametro(StatusProperty.CLEVEL, 51);
		expect(falasDoPet(PetMessageConst.PM_LEVELUP)).toBe(0);
	});

	it('o resto do CLEVEL segue rodando no reenvio (janela, entidade, aura)', () => {
		parametro(StatusProperty.CLEVEL, 50);
		expect(Session.Entity.clevel).toBe(50);
		expect(basicInfo.update).toHaveBeenCalledWith('blvl', 50);
		expect(Session.Entity.aura.load).toHaveBeenCalled();
		expect(equipment.onLevelUp).toHaveBeenCalled();
	});
});

describe('HP reenviado com o personagem morto: o pet lamenta UMA vez', () => {
	it('morrer e receber tres reenvios de HP 0 manda UM "morri" (antes: quatro)', () => {
		parametro(StatusProperty.HP, 0);
		parametro(StatusProperty.HP, 0);
		parametro(StatusProperty.HP, 0);
		parametro(StatusProperty.HP, 0);
		expect(falasDoPet(PetMessageConst.PM_DEAD)).toBe(1);
	});

	it('reviver e morrer de novo lamenta de novo', () => {
		parametro(StatusProperty.HP, 0);
		parametro(StatusProperty.HP, 800);
		parametro(StatusProperty.HP, 0);
		expect(falasDoPet(PetMessageConst.PM_DEAD)).toBe(2);
	});

	it('entrar no jogo ja morto (HP anterior -1, sem informacao) ainda lamenta', () => {
		Session.Entity.life.hp = -1;
		parametro(StatusProperty.HP, 0);
		expect(falasDoPet(PetMessageConst.PM_DEAD)).toBe(1);
	});

	it('o HP reenviado ainda atualiza a entidade e a janela', () => {
		parametro(StatusProperty.HP, 0);
		expect(Session.Entity.life.hp).toBe(0);
		expect(basicInfo.update).toHaveBeenCalledWith('hp', 0, 1000);
	});
});
