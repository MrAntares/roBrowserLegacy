import { beforeEach, describe, expect, it, vi } from 'vitest';

/*
 * A CONTAGEM DE ABATES DO MERCENARIO NUNCA SE MEXIA NA JANELA (achado da
 * conferencia dos pacotes do modo classico, 28/09/2026).
 *
 * O servidor credita o abate e manda `ZC_MER_PAR_CHANGE` (0x02a2) com
 * `atributo: SP_MERCKILLS` (`servidor/mapa/servidor-mapa.ts:17832`, o mesmo
 * `SP_MERCKILLS = 189` de `map.hpp:527` do emulador) toda vez que
 * `creditarAbateAoMercenario` soma um abate. O roBrowser JA TEM os dois
 * pedacos prontos para isto -- `StatusProperty.MER_KILLCOUNT`/`MER_FAITH`
 * (`DB/Status/StatusProperty.js`, 0xbd/0xbe) e
 * `MercenaryInformations.setKills`/`setFaith` (chamados pelo `ZC_MER_INIT`
 * no `setInformations`) -- mas `onParameterChange`
 * (`Engine/MapEngine/Mercenary.js`) so tratava os quatro casos de HP/SP com
 * numeros LITERAIS (0x0-0x3, que nem sao o `SP_HP`/`SP_MAXHP`/`SP_SP`/
 * `SP_MAXSP` de verdade -- isso e outro achado, mas o servidor nunca manda
 * HP/SP do mercenario por este pacote, entao fica so anotado). O `switch`
 * caia no vazio para 189: o numero da janela ficava parado no valor do
 * ultimo `ZC_MER_INIT` (login/troca de mapa) ate o jogador relogar.
 *
 * Este teste cobre o conserto: as duas checagens novas respondem ANTES do
 * `EntityManager.get`, do mesmo jeito que `Homun.js:onHomunParameterChange`
 * atualiza a janela mesmo sem achar a entidade em cena (o mercenario pode
 * estar fora da area de interesse quando o abate chega).
 */

const hooks = new Map();
const packet = {
	ZC: new Proxy(
		{},
		{
			get(alvo, nome) {
				return (alvo[nome] ??= function Pacote() {});
			}
		}
	)
};
const entidades = new Map();
const manager = {
	get: id => entidades.get(id),
	storeLife: vi.fn()
};
const informacoes = {
	append: vi.fn(),
	startAI: vi.fn(),
	setInformations: vi.fn(),
	setKills: vi.fn(),
	setFaith: vi.fn(),
	ui: { hide: vi.fn() }
};

vi.doMock('Network/NetworkManager.js', () => ({ default: { hookPacket: (p, f) => hooks.set(p, f), sendPacket: vi.fn() } }));
vi.doMock('Network/PacketStructure.js', () => ({ default: packet }));
vi.doMock('Engine/SessionStorage.js', () => ({ default: { mercId: null } }));
vi.doMock('Renderer/EntityManager.js', () => ({ default: manager }));
vi.doMock('UI/UIManager.js', () => ({ default: { showPromptBox: vi.fn() } }));
vi.doMock('DB/DBManager.js', () => ({ default: { getMessage: () => '' } }));
vi.doMock('UI/Components/MercenaryInformations/MercenaryInformations.js', () => ({ default: informacoes }));
vi.doMock('UI/Components/SkillListMH/SkillListMH.js', () => ({
	default: { mercenary: { setSkills: vi.fn(), updateSkill: vi.fn(), setPoints: vi.fn(), ui: { hide: vi.fn() } } }
}));
vi.doMock('Controls/MouseEventHandler.js', () => ({ default: { world: { x: 0, y: 0 } } }));

const { default: StatusProperty } = await import('DB/Status/StatusProperty.js');
const { default: Session } = await import('Engine/SessionStorage.js');
const { default: iniciar } = await import('Engine/MapEngine/Mercenary.js');
iniciar();

function enviar(nome, dados) {
	hooks.get(packet.ZC[nome])(dados);
}

beforeEach(() => {
	entidades.clear();
	Session.mercId = null;
	informacoes.setKills.mockClear();
	informacoes.setFaith.mockClear();
	manager.storeLife.mockClear();
});

describe('ZC_MER_PAR_CHANGE: abate e fe atualizam a janela', () => {
	it('MER_KILLCOUNT chama setKills mesmo sem entidade em cena', () => {
		expect(entidades.has(Session.mercId)).toBe(false);

		enviar('MER_PAR_CHANGE', { param: StatusProperty.MER_KILLCOUNT, value: 7 });

		expect(informacoes.setKills).toHaveBeenCalledWith(7);
		expect(informacoes.setFaith).not.toHaveBeenCalled();
	});

	it('MER_FAITH chama setFaith mesmo sem entidade em cena', () => {
		enviar('MER_PAR_CHANGE', { param: StatusProperty.MER_FAITH, value: 42 });

		expect(informacoes.setFaith).toHaveBeenCalledWith(42);
		expect(informacoes.setKills).not.toHaveBeenCalled();
	});

	it('os valores reais do protocolo sao 189/190, nao numeros pequenos', () => {
		// SP_MERCKILLS/SP_MERCFAITH de map.hpp:527 (emulador) -- se estes
		// valores mudarem sem querer, a comparacao acima para de bater com o
		// que o servidor manda de verdade.
		expect(StatusProperty.MER_KILLCOUNT).toBe(189);
		expect(StatusProperty.MER_FAITH).toBe(190);
	});

	it('CONTROLE: o HP ainda respeita a entidade existente (nao regrediu)', () => {
		Session.mercId = 55;
		const entity = { life: { update: vi.fn() } };
		entidades.set(55, entity);

		enviar('MER_PAR_CHANGE', { param: 0x0, value: 321 });

		expect(entity.life.hp).toBe(321);
		expect(manager.storeLife).toHaveBeenCalledWith(55, { hp: 321 });
	});

	it('CONTROLE: sem entidade e param desconhecido, nao faz nada e nao estoura', () => {
		Session.mercId = 99;
		expect(() => enviar('MER_PAR_CHANGE', { param: 0x0, value: 10 })).not.toThrow();
		expect(manager.storeLife).not.toHaveBeenCalled();
	});
});
