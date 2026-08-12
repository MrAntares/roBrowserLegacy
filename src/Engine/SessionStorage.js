/**
 * Engine/SessionStorage.js
 *
 * Session Storage
 * Manage session variables
 *
 * @author Vincent Thibault
 */

/** @typedef {import('Renderer/Entity/Player.js').default} Player */

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

	/** @type {Array<Player>} Player instances indexed by CharNum, populated during char-select */
	characters: [],

	/** @type {Player|null} The currently controlled Player (one of the above) */
	player: null,

	AdminList: [],

	underAutoCounter: false,

	moveAction: null,

	// zeny, weight, max_weight are now on Session.player (Player.prototype)

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
