import { beforeEach, describe, expect, it, vi } from 'vitest';
import Events from 'Core/Events.js';

/*
 * RG_GRAFFITI (UNT_GRAFFITI = 176) nao tem sprite de efeito -- SkillUnit
 * mapeia para EF_NONE (DB/Skills/SkillUnit.js) e a guarda de
 * `EffectManager.spamSkillZone` (`effectId in EffectDB`) retorna ANTES de
 * criar a Entity. O texto do grafite (`pkt.msg`, so existe no pacote
 * SKILL_ENTRY5) nao tinha para onde ir.
 *
 * Este teste cobre o conserto em `onSkillAppear` (Engine/MapEngine/Entity.js):
 * para este unit type especifico, o texto e desenhado pelo mesmo balao de
 * fala (`entity.dialog`) que ja mostra o nome da skill acima do personagem --
 * sem tocar em `spamSkillZone` nem no `EF_NONE`.
 */

const entidades = new Map();
const hooks = new Map();
const renderer = { tick: 1000 };
const spamSkillZone = vi.fn();
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
const manager = {
	get: id => entidades.get(id),
	add: e => entidades.set(e.GID, e),
	remove: id => {
		entidades.get(id)?.clean();
		entidades.delete(id);
	},
	removeGID: id => entidades.delete(id),
	storeLife: vi.fn(),
	getLife: () => null,
	removeLife: vi.fn(),
	getFocusEntity: () => null
};

vi.doMock('Renderer/Renderer.js', () => ({ default: renderer }));
vi.doMock('Renderer/EntityManager.js', () => ({ default: manager }));
vi.doMock('Network/NetworkManager.js', () => ({ default: { hookPacket: (p, f) => hooks.set(p, f) } }));
vi.doMock('Network/PacketStructure.js', () => ({ default: packet }));
vi.doMock('Network/PacketVerManager.js', () => ({ default: { value: 20211103 } }));
vi.doMock('Core/Client.js', () => ({ default: { loadFile() {} } }));
vi.doMock('Engine/SessionStorage.js', () => ({ default: { AdminList: [], Entity: { GID: 9000 }, pet: {} } }));
vi.doMock('DB/DBManager.js', () => ({
	default: {
		getJobClass: () => 'Novice',
		getWeaponSound: () => null,
		isDualWeapon: () => false,
		getPCAttackMotion: () => 6,
		isBow: () => false,
		getWeaponType: () => 0,
		getMonsterName: () => 'Poring'
	}
}));
vi.doMock('DB/Status/StatusState.js', () => ({ default: { EffectState: {} } }));
vi.doMock('DB/Monsters/AttackEffectTable.js', () => ({ default: { PROJECTILE: {}, SPAWN: {} } }));
vi.doMock('DB/Skills/SkillAction.js', () => ({ default: { DEFAULT: () => ({ action: 2 }) } }));
vi.doMock('Renderer/Effects/Damage.js', () => ({
	default: { add: () => {}, TYPE: { COMBO: 16, COMBO_FINAL: 32 } }
}));
vi.doMock('Renderer/EffectManager.js', () => ({
	default: { spam() {}, remove() {}, spamSkill() {}, spamSkillHit() {}, spamSkillBeforeHit() {}, spamSkillZone }
}));
vi.doMock('Renderer/Map/Altitude.js', () => ({ default: { getCellHeight: () => 0 } }));
vi.doMock('Renderer/Entity/EntityOverlay.js', () => ({ default: { append() {} } }));
vi.doMock('Engine/MapEngine/NomesDosJogadores.js', () => ({ default: { aplicar() {} } }));
vi.doMock('UI/Components/HuntAnalyzer/registroDaCaca.js', () => ({ registrarAbate() {}, registrarExp() {} }));

for (const nome of [
	'DB/Skills/SkillConst.js',
	'DB/Skills/SkillInfo.js',
	'DB/Status/StatusConst.js',
	'DB/Emotions.js',
	'DB/Skills/SkillEffect.js',
	'DB/Effects/EffectConst.js',
	'DB/Pets/PetMessageConst.js',
	'DB/Jobs/JobConst.js',
	'Audio/SoundManager.js',
	'Engine/MapEngine/Guild.js',
	'Renderer/Effects/MagicTarget.js',
	'Renderer/Effects/LockOnTarget.js',
	'Renderer/Effects/MagicRing.js',
	'Renderer/ScreenEffectManager.js'
])
	vi.doMock(nome, () => ({ default: {} }));
for (const nome of [
	'BasicInfo',
	'ChatBox',
	'ChatRoom',
	'Escape',
	'DeathWindow',
	'HomunInformations',
	'MercenaryInformations',
	'Inventory',
	'ShortCut',
	'StatusIcons',
	'StatusIdle',
	'MiniMap',
	'PartyFriends',
	'Equipment'
])
	vi.doMock(`UI/Components/${nome}/${nome}.js`, () => ({
		default: {
			isGroupMember: () => false,
			addText: () => {},
			TYPE: { INFO: 2, BLUE: 16, ERROR: 32 },
			FILTER: { BATTLE: 15, PARTY_BATTLE: 16 }
		}
	}));

// EntityDialog fica REAL: e o mecanismo sob teste (nao um mixin apagado).
for (const nome of [
	'EntityAction',
	'EntityCast',
	'EntityDisplay',
	'EntitySound',
	'EntityView',
	'EntityWalk',
	'EntityRender',
	'EntityRoom',
	'EntityState',
	'EntityAttachments',
	'EntityAnimations',
	'EntityAura',
	'EntityDropEffect',
	'EntityEmblem'
])
	vi.doMock(`Renderer/Entity/${nome}.js`, () => ({ default() {} }));
vi.doMock('Controls/EntityControl.js', () => ({
	default: function () {
		this.ACTION = { IDLE: 0, WALK: 1, ATTACK: 2, HURT: 3, DIE: 4, READYFIGHT: 0 };
		this.setAction = ({ action }) => {
			this.action = action;
		};
		this.files = { shadow: {} };
		this.display = { name: '', update() {}, clean() {}, STYLE: {}, TYPE: {} };
		this.walk = { speed: 150, index: 0, total: 0 };
		this.walkTo = vi.fn();
		this.aura = { remove() {}, load() {}, free() {} };
		this.animations = { free() {} };
		this.dropEffect = { free() {} };
		for (const campo of ['emblem', 'cast', 'room', 'attachments']) {
			this[campo] = { clean() {}, set() {}, remove() {} };
		}
	}
}));

const { default: Entity } = await import('Renderer/Entity/Entity.js');
const { default: iniciar } = await import('Engine/MapEngine/Entity.js');
iniciar();
function enviar(nome, dados) {
	hooks.get(packet.ZC[nome])(dados);
}

beforeEach(() => {
	entidades.clear();
	spamSkillZone.mockClear();
	Events.free();

	// jsdom nao implementa CanvasRenderingContext2D (getContext('2d') volta null)
	// sem o pacote opcional `canvas`, que este repo nao instala. O balao de fala
	// real (EntityDialog.set) precisa de um contexto minimo para nao estourar.
	vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function () {
		return {
			canvas: this,
			font: '',
			fillStyle: '',
			strokeStyle: '',
			measureText: text => ({ width: text.length * 6 }),
			fillRect: () => {},
			fillText: () => {},
			stroke: () => {},
			beginPath: () => {},
			moveTo: () => {},
			lineTo: () => {},
			quadraticCurveTo: () => {},
			closePath: () => {}
		};
	});
});

describe('RG_GRAFFITI desenha o texto do grafite', () => {
	it('cria uma Entity na posicao e escreve pkt.msg no balao de fala', () => {
		enviar('SKILL_ENTRY5', {
			AID: 500,
			creatorAID: 9000,
			xPos: 10,
			yPos: 20,
			job: 176, // UNT_GRAFFITI
			range: 0,
			isVisible: 1,
			level: 1,
			msg: 'ola mundo'
		});

		expect(spamSkillZone).toHaveBeenCalledWith(176, 10, 20, 500, 9000);

		const entidade = entidades.get(500);
		expect(entidade).toBeDefined();
		expect(entidade.position[0]).toBe(10);
		expect(entidade.position[1]).toBe(20);
		expect(entidade.dialog.text).toBe('ola mundo');
		expect(entidade.dialog.display).toBe(true);
	});

	it('SKILL_DISAPPEAR entra no mesmo caminho de limpeza das outras unidades de chao', () => {
		/*
		 * `onSkillDisapear` chama `entity.remove()` sem tipo, que cai no ramo
		 * `default` de `Entity.remove` (Renderer/Entity/Entity.js): limpa a GUI
		 * (inclusive o balao) e agenda `remove_tick`/`remove_delay = 0`. A
		 * REMOCAO do mapa do EntityManager e feita depois, pelo laco de
		 * `render()` (EntityManager.js:544) que este teste nao simula -- entao
		 * aqui cobramos o que `onSkillDisapear` de fato controla.
		 */
		enviar('SKILL_ENTRY5', {
			AID: 501,
			creatorAID: 9000,
			xPos: 5,
			yPos: 5,
			job: 176,
			range: 0,
			isVisible: 1,
			level: 1,
			msg: 'sera removido'
		});
		const entidade = entidades.get(501);
		expect(entidade.dialog.display).toBe(true);

		enviar('SKILL_DISAPPEAR', { AID: 501 });
		expect(entidade.remove_tick).toBeGreaterThan(0);
		expect(entidade.dialog.display).toBe(false);
	});

	it('nao cria Entity nem mexe no balao quando nao ha msg (outros unit types)', () => {
		enviar('SKILL_ENTRY', {
			AID: 502,
			creatorAID: 9000,
			xPos: 1,
			yPos: 1,
			job: 127, // UNT_FIREWALL, sem campo msg
			range: 0,
			isVisible: 1,
			level: 1
		});

		expect(entidades.has(502)).toBe(false);
	});

	it('nao cria uma segunda Entity se uma ja existir com o mesmo AID', () => {
		enviar('SKILL_ENTRY5', {
			AID: 503,
			creatorAID: 9000,
			xPos: 2,
			yPos: 2,
			job: 176,
			range: 0,
			isVisible: 1,
			level: 1,
			msg: 'primeira'
		});
		const primeira = entidades.get(503);

		enviar('SKILL_ENTRY5', {
			AID: 503,
			creatorAID: 9000,
			xPos: 2,
			yPos: 2,
			job: 176,
			range: 0,
			isVisible: 1,
			level: 1,
			msg: 'segunda'
		});

		expect(entidades.get(503)).toBe(primeira);
		expect(primeira.dialog.text).toBe('segunda');
	});
});
