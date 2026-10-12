/**
 * Engine/SessionStorage.js
 *
 * Session Storage
 * Manage session variables
 *
 * @author Vincent Thibault
 */

/** @typedef {import('Renderer/Entity/Player.js').default} Player */
/** @typedef {import('Renderer/Entity/Entity.js').default} Entity */

export default {
	isTouchDevice: false,
	isRenewal: false,
	TouchTargeting: false,
	AutoTargeting: false,

	FreezeUI: false,

	AuthCode: 0,
	AID: 0,
	GID: 0,
	UserLevel: 0,
	Sex: 0,
	LangType: 0,
	ServerName: null,
	ratesInfo: null,

	/** @type {Player|Entity|null} The entity currently controlled by the client */
	Entity: null,

	AdminList: [],

	// RAGIDLE (25/09/2026): as marcas do chat, pelo servidor, no mesmo 0x0fd0
	// da AdminList - contas VIP (fala global, grupo, eco) e os NOMES dos VIPs e
	// dos admins (sussurro e guilda, que nao levam conta). So desenho: o selo
	// de GM, o icone do RO Cash e a cor no nome (ChatBox/marcaNoNome.js).
	VipList: [],
	VipNomes: [],
	AdminNomes: [],

	underAutoCounter: false,

	moveAction: null,

	/**
	 * Lote 5 (resto do C23): o alcance da skill guardada em `moveAction` - o
	 * `onWalkEnd` re-confere com a regua da fonte antes de soltar. Ver
	 * MapEngine/alcanceNoFimDaCaminhada.js e `armarAlcanceNoFim` (Skill.js).
	 */
	moveActionAlcance: null,

	/**
	 * C47: a espera do `ZC_NOTIFY_PLAYERMOVE` que confirma a caminhada do
	 * pedido em `moveAction` - o `onWalkEnd` so solta depois dela. Ver
	 * MapEngine/confirmacaoDaCaminhada.js.
	 */
	moveActionEspera: null,

	// weight and max_weight now live on the player entity (Session.Entity)

	/**
	 * Player money, stored on the player entity.
	 * Kept here as an accessor for the many consumers reading it from the session.
	 */
	get zeny() {
		return this.Entity ? this.Entity.money : 0;
	},

	set zeny(value) {
		if (this.Entity) {
			this.Entity.money = value;
		}
	},

	/**
	 * O GID da entidade controlada agora — nao confundir com `Session.GID`
	 * (o GID da CONTA, do login, sempre um numero). Padrao ja duplicado em
	 * tres lugares como `Session.Entity ? Session.Entity.GID : null`
	 * (`Engine/MapEngine/Main.js`, `Renderer/EntityManager.js`,
	 * `UI/Components/HuntAnalyzer/HuntAnalyzer.js`); virou acessor pelo mesmo
	 * motivo do `zeny` acima, e para os pontos que ainda liam `.GID` direto
	 * sem checar (`Cannot read properties of null (reading 'GID')`, o erro
	 * mais frequente do analytics em 13/09/2026 — `Engine/MapEngine/Entity.js`
	 * tratava um acesso e deixava dois sem guarda, na MESMA funcao).
	 */
	get meuGID() {
		return this.Entity ? this.Entity.GID : null;
	},

	/**
	 * Saldo de CASH da conta (28/08/2026).
	 *
	 * Campo simples, e nao acessor sobre a entidade como o `zeny`: o cash e
	 * por CONTA (`#CASHPOINTS`, pc.cpp:2370) e nao pertence ao personagem —
	 * pendura-lo em `Session.Entity` faria o numero sumir na troca de boneco.
	 *
	 * Quem o preenche e o `ZC_RAGIDLE_SALDO_DE_CASH` (0x0f00), enganchado em
	 * UI/Components/BasicInfoIdle. Ate 28/08 nao existia campo nenhum: o saldo
	 * so aparecia dentro da janela da loja, e o HUD nao tinha de onde ler.
	 *
	 * EM MINOR UNITS desde o RO Shop (22/09/2026, CONTRATO.md do RO Shop secao
	 * 1): 1 RO Cash = 100. Quem escreve na tela passa por
	 * `Utils/roCash.js:formatarRoCash`; quem compara com preco inteiro antigo
	 * (a loja de cash de NPC) divide por 100 antes.
	 */
	cash: 0,

	petId: 0,
	pet: {},

	hasParty: false,
	isPartyLeader: false,

	hasGuild: false,
	guildRight: 0,
	guildName: '',
	isGuildMaster: false,

	Playing: false,
	hasCart: false,
	CartNum: 0,

	homCustomAI: false,
	merCustomAI: false,

	autoFollow: false,
	autoFollowTarget: null,

	ping: {
		pingTime: 0,
		pongTime: 0,
		returned: false,
		value: 0
	},

	serverTick: 0,

	mapState: {
		property: 0,
		type: 0,
		flag: 0,
		isPVPZone: false,
		isAgitZone: false,
		isPVP: false,
		isGVG: false,
		isSiege: false,
		isNoLockOn: false,
		showPVPCounter: false,
		showBFCounter: false,
		isBattleField: false
	},

	requestCashShop: true,

	captchaGetIdOnEntityClick: false,
	captchaGetIdOnFloorClick: false,
	captchaGetIdOnFloorRange: 1,

	Achievement: {
		total_achievements: 0,
		total_points: 0,
		rank: 0,
		current_rank_points: 0,
		next_rank_points: 0,
		list: {}
	}
};
