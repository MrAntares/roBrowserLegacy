/**
 * A ANALISE DE CACA CONTA SO O ABATE PROPRIO (D-2322, 13/10/2026 - pedido do
 * dono: "Analise contando monstros que nao estou cacando").
 *
 * O caminho real dos pacotes ate o registro: os handlers de
 * `Engine/MapEngine/Entity.js` sao os de verdade, e o registro da caca e
 * espiado. O VANISH de morte vem de TODO mob do mapa (o servidor o difunde) e
 * NAO conta mais; quem conta e o ZC_RAGIDLE_ABATE, que o servidor manda so ao
 * matador (`servidor/mapa/abate-na-analise-no-fio.test.ts` prova a outra
 * ponta). O harness e o de `tests/renderer/vidaNosPacotes.test.js`.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Events from 'Core/Events.js';

// Os handlers, Entity.set, Life e o relogio visual sao reais. So assets/GL/UI
// alheios a barra sao substituidos; os retangulos desenhados sao observados.
const entidades = new Map();
const hooks = new Map();
const renderer = { tick: 1000 };
const numeros = [];
/** As linhas que `ChatBox.addText` recebeu — ver o mock dos componentes. */
const linhasDoChat = [];
const config = { arco: false };
const packet = { ZC: new Proxy({}, { get(alvo, nome) {
	return alvo[nome] ??= function Pacote() {};
} }) };
const manager = {
	get: id => entidades.get(id),
	add: e => entidades.set(e.GID, e),
	remove: id => { entidades.get(id)?.clean(); entidades.delete(id); },
	removeGID: id => entidades.delete(id),
	storeLife: vi.fn(), getLife: () => null, removeLife: vi.fn(),
	getFocusEntity: () => null
};
vi.doMock('Renderer/Renderer.js', () => ({ default: renderer }));
vi.doMock('Renderer/EntityManager.js', () => ({ default: manager }));
vi.doMock('Network/NetworkManager.js', () => ({ default: { hookPacket: (p, f) => hooks.set(p, f) } }));
vi.doMock('Network/PacketStructure.js', () => ({ default: packet }));
vi.doMock('Network/PacketVerManager.js', () => ({ default: { value: 20211103 } }));
vi.doMock('Core/Client.js', () => ({ default: { loadFile() {} } }));
vi.doMock('Engine/SessionStorage.js', () => ({ default: { AdminList: [], Entity: { GID: 9000 }, pet: {} } }));
vi.doMock('DB/DBManager.js', () => ({ default: {
	getJobClass: () => 'Novice', getWeaponSound: () => null,
	isDualWeapon: () => false, getPCAttackMotion: () => 6,
	isBow: () => config.arco, getWeaponType: () => 0, getMonsterName: id => (id === 1002 ? 'Poring' : id === 1008 ? 'Pupa' : 'Unknown')
} }));
vi.doMock('DB/Status/StatusState.js', () => ({ default: { EffectState: {} } }));
vi.doMock('DB/Monsters/AttackEffectTable.js', () => ({ default: { PROJECTILE: {}, SPAWN: {} } }));
vi.doMock('DB/Skills/SkillAction.js', () => ({ default: { DEFAULT: () => ({ action: 2 }) } }));
vi.doMock('Renderer/Effects/Damage.js', () => ({ default: {
	add: (dano, alvo, t) => numeros.push({ dano, alvo, t }), TYPE: { COMBO: 16, COMBO_FINAL: 32 }
} }));
vi.doMock('Renderer/EffectManager.js', () => ({ default: {
	spam() {}, remove() {}, spamSkill() {}, spamSkillHit() {}, spamSkillBeforeHit() {}
} }));
vi.doMock('Renderer/Map/Altitude.js', () => ({ default: { getCellHeight: () => 0 } }));
vi.doMock('Renderer/Entity/EntityOverlay.js', () => ({ default: { append() {} } }));
vi.doMock('Engine/MapEngine/NomesDosJogadores.js', () => ({ default: { aplicar() {} } }));
const abates = [];
vi.doMock('UI/Components/HuntAnalyzer/registroDaCaca.js', () => ({ registrarAbate: (...args) => abates.push(args), registrarExp() {} }));

for (const nome of [
	'DB/Skills/SkillConst.js', 'DB/Skills/SkillInfo.js', 'DB/Status/StatusConst.js',
	'DB/Emotions.js', 'DB/Skills/SkillEffect.js', 'DB/Effects/EffectConst.js',
	'DB/Pets/PetMessageConst.js', 'DB/Jobs/JobConst.js', 'Audio/SoundManager.js',
	'Engine/MapEngine/Guild.js', 'Renderer/Effects/MagicTarget.js',
	'Renderer/Effects/LockOnTarget.js', 'Renderer/Effects/MagicRing.js',
	'Renderer/ScreenEffectManager.js'
]) vi.doMock(nome, () => ({ default: {} }));
for (const nome of [
	'BasicInfo', 'ChatBox', 'ChatRoom', 'Escape', 'DeathWindow', 'HomunInformations',
	'MercenaryInformations', 'Inventory', 'ShortCut', 'StatusIcons', 'StatusIdle',
	'MiniMap', 'PartyFriends', 'Equipment'
]) vi.doMock(`UI/Components/${nome}/${nome}.js`, () => ({ default: {
	isGroupMember: () => false,
	// `addText` ESPIA, e nao um vazio: o bloco da linha de dano em
	// `onEntityAction` so pode ser MEDIDO se alguem observar o que ele escreve.
	// Sem isto, um mutante que apagasse o bloco inteiro sobreviveria — medido
	// em 07/09/2026, e foi assim que o controle positivo daquele caso nasceu.
	addText: (...args) => linhasDoChat.push(args),
	TYPE: { INFO: 2, BLUE: 16, ERROR: 32 },
	FILTER: { BATTLE: 15, PARTY_BATTLE: 16 }
} }));
for (const nome of [
	'EntityAction', 'EntityCast', 'EntityDisplay', 'EntityDialog', 'EntitySound',
	'EntityView', 'EntityWalk', 'EntityRender', 'EntityRoom', 'EntityState',
	'EntityAttachments', 'EntityAnimations', 'EntityAura', 'EntityDropEffect', 'EntityEmblem'
]) vi.doMock(`Renderer/Entity/${nome}.js`, () => ({ default() {} }));
vi.doMock('Controls/EntityControl.js', () => ({ default: function () {
	this.ACTION = { IDLE: 0, WALK: 1, ATTACK: 2, HURT: 3, DIE: 4, READYFIGHT: 0 };
	this.setAction = ({ action }) => { this.action = action; };
	this.files = { shadow: {} };
	this.display = { name: '', update() {}, clean() {}, STYLE: {}, TYPE: {} };
	this.walk = { speed: 150, index: 0, total: 0 };
	this.walkTo = vi.fn();
	this.aura = { remove() {}, load() {}, free() {} };
	this.animations = { free() {} };
	this.dropEffect = { free() {} };
	for (const campo of ['emblem', 'dialog', 'cast', 'room', 'attachments']) {
		this[campo] = { clean() {}, set() {}, remove() {} };
	}
} }));

const { default: Entity } = await import('Renderer/Entity/Entity.js');
const { default: iniciar } = await import('Engine/MapEngine/Entity.js');
iniciar();
function enviar(nome, dados) { hooks.get(packet.ZC[nome])(dados); }
function nascer(GID, job, nome = '') {
	enviar('NOTIFY_STANDENTRY11', { GID, objecttype: Entity.TYPE_MOB, job, hp: 1000, maxhp: 1000 });
	const mob = entidades.get(GID);
	mob.display.name = nome;
	return mob;
}
function morrer(GID) { enviar('NOTIFY_VANISH', { GID, type: Entity.VT.DEAD }); }
beforeEach(() => {
	Events.free(); entidades.clear(); abates.length = 0; renderer.tick = 1000;
	vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function () {
		return { canvas: this, fillRect: vi.fn() };
	});
	const jogador = new Entity();
	jogador.set({ GID: 9000, objecttype: Entity.TYPE_PC, job: 0 });
	entidades.set(9000, jogador);
});

describe('a Analise de Caca conta so o abate proprio (D-2322)', () => {
	it('o bicho que morre a vista, sem o sinal do servidor, NAO conta (o do vizinho)', () => {
		nascer(3000001, 1002, 'Poring');
		morrer(3000001);
		expect(entidades.has(3000001), 'o VANISH de morte nao chegou ao handler').toBe(false);
		expect(abates).toEqual([]);
	});

	it('o abate proprio conta, com o nome que o servidor deu na entrada (o homonimo, D-1870)', () => {
		nascer(3000002, 1002, 'Poring (Agua)');
		enviar('RAGIDLE_ABATE', { GID: 3000002, mobId: 1002 });
		morrer(3000002);
		expect(abates).toEqual([[9000, 'Poring (Agua)', 1002]]);
	});

	it('sem entidade (morreu fora da vista) o nome sai da tabela do cliente pelo id do pacote', () => {
		enviar('RAGIDLE_ABATE', { GID: 3000003, mobId: 1008 });
		expect(abates).toEqual([[9000, 'Pupa', 1008]]);
	});

	it('o id fora da tabela cai no balde explicito, e nao numa linha "Unknown"', () => {
		enviar('RAGIDLE_ABATE', { GID: 3000004, mobId: 31_999 });
		expect(abates).toEqual([[9000, '', 31_999]]);
	});

	it('dois jogadores no mesmo spot: so o bicho que o servidor disse ser meu entra', () => {
		nascer(3000005, 1002, 'Poring');
		nascer(3000006, 1008, 'Pupa');
		enviar('RAGIDLE_ABATE', { GID: 3000005, mobId: 1002 });
		morrer(3000005);
		morrer(3000006);
		expect(abates).toEqual([[9000, 'Poring', 1002]]);
	});
});
