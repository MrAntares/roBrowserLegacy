/**
 * Controls/ProcessCommand.js - extended from ChatBox
 *
 * Command in chatbox handler
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require) {
	"use strict";

	// Load dependencies
	const DB = require("DB/DBManager");
	const Emotions = require("DB/Emotions");
	const BGM = require("Audio/BGM");
	const Sound = require("Audio/SoundManager");
	const Session = require("Engine/SessionStorage");
	const PACKET = require("Network/PacketStructure");
	const PACKETVER = require("Network/PacketVerManager");
	const Network = require("Network/NetworkManager");
	const ControlPreferences = require("Preferences/Controls");
	const UIPreferences = require("Preferences/UI");
	const AudioPreferences = require("Preferences/Audio");
	const MapPreferences = require("Preferences/Map");
	const CameraPreferences = require("Preferences/Camera");
	const Renderer = require("Renderer/Renderer");
	const Configs = require("Core/Configs");
	const EffectConst = require("DB/Effects/EffectConst");
	const getModule = require;

	let aliases = {};

	let CommandStore = {
		sound: {
			description: "Toggles playing of sound effects",
			callback: function () {
				this.addText(
					DB.getMessage(27 + AudioPreferences.Sound.play),
					this.TYPE.INFO,
					this.FILTER.PUBLIC_LOG
				);
				AudioPreferences.Sound.play = !AudioPreferences.Sound.play;
				AudioPreferences.save();
				if (AudioPreferences.Sound.play) {
					Sound.stop();
				}
			},
		},
		bgm: {
			description: "Toggles playing of background music",
			callback: function () {
				this.addText(
					DB.getMessage(31 + AudioPreferences.BGM.play),
					this.TYPE.INFO,
					this.FILTER.PUBLIC_LOG
				);
				AudioPreferences.BGM.play = !AudioPreferences.BGM.play;
				AudioPreferences.save();

				if (AudioPreferences.BGM.play) {
					BGM.play(BGM.filename);
				} else {
					BGM.stop();
				}
				return;
			},
		},
		effect: {
			description: "Toggles the display of anything but basic graphical effects",
			callback: function () {
				this.addText(
					DB.getMessage(23 + MapPreferences.effect),
					this.TYPE.INFO,
					this.FILTER.PUBLIC_LOG
				);
				MapPreferences.effect = !MapPreferences.effect;
				MapPreferences.save();
				return;
			},
		},
		mineffect: {
			description: "Enables less graphically intense effects. This command does not work for Wizard's AoE skills.",
			callback: function () {
				this.addText(
					DB.getMessage(687 + MapPreferences.mineffect),
					this.TYPE.INFO,
					this.FILTER.PUBLIC_LOG
				);
				MapPreferences.mineffect = !MapPreferences.mineffect;
				MapPreferences.save();
				return;
			},
		},
		miss: {
			description: "Toggles display of the ‘miss’ animation",
			callback: function () {
				this.addText(
					DB.getMessage(317 + MapPreferences.miss),
					this.TYPE.INFO,
					this.FILTER.PUBLIC_LOG
				);
				MapPreferences.miss = !MapPreferences.miss;
				MapPreferences.save();
				return;
			},
		},
		aura: {
			description: "Minimizes the aura effect for level 99 and 175 characters",
			callback: function () {
				const isSimplified = MapPreferences.aura > 1;
				this.addText(
					DB.getMessage(711 + isSimplified),
					this.TYPE.INFO,
					this.FILTER.PUBLIC_LOG
				);
				MapPreferences.aura = isSimplified ? 1 : 2;
				MapPreferences.save();

				var EntityManager = getModule("Renderer/EntityManager");
				var EffectManager = getModule("Renderer/EffectManager");
				EntityManager.forEach(function (entity) {
					entity.aura.load(EffectManager);
				});
				return;
			},
		},
		aura2: {
			description: "Disables the aura effect for level 99 and 175 characters",
			callback: function () {
				this.addText(
					DB.getMessage(
						2994 + MapPreferences.aura,
						MapPreferences.aura
							? "Aura effect is OFF"
							: "Aura effect is ON" // default text if not in DB msgstringtable
					),
					this.TYPE.INFO,
					this.FILTER.PUBLIC_LOG
				);
				MapPreferences.aura = MapPreferences.aura ? 0 : 1;
				MapPreferences.save();

				var EntityManager = getModule("Renderer/EntityManager");
				var EffectManager = getModule("Renderer/EffectManager");
				EntityManager.forEach(function (entity) {
					entity.aura.load(EffectManager);
				});
				return;
			},
		},
		showname: {
			description: "Returns to the original font",
			callback: function () {
				this.addText(
					DB.getMessage(722 + MapPreferences.showname),
					this.TYPE.INFO
				);
				MapPreferences.showname = !MapPreferences.showname;
				MapPreferences.save();

				var EntityManager = getModule("Renderer/EntityManager");

				// update all display names
				EntityManager.forEach(function (entity) {
					entity.display.refresh(entity);
				});
				return;
			},
		},
		camera: {
			description: "Turns camera 'smoothing' off and on.",
			callback: function () {
				this.addText(
					DB.getMessage(319 + CameraPreferences.smooth),
					this.TYPE.INFO,
					this.FILTER.PUBLIC_LOG
				);
				CameraPreferences.smooth = !CameraPreferences.smooth;
				CameraPreferences.save();
				return;
			},
		},

		fog: {
			description: "Turns fog on and off",
			callback: function () {
				MapPreferences.fog = !MapPreferences.fog;
				this.addText(
					"fog " + (MapPreferences.fog ? "on" : "off"),
					this.TYPE.INFO,
					this.FILTER.PUBLIC_LOG
				);
				MapPreferences.save();
				return;
			},
		},

		lightmap: {
			description: "Removes shade effects and a majority of lighting effects",
			callback: function () {
				MapPreferences.lightmap = !MapPreferences.lightmap;
				MapPreferences.save();
				return;
			},
		},

		smoothlight: {
			description: "Cycles the posterization effect of the lightmap: on, off, off with gamma correction",  
			callback: function () {  
				MapPreferences.smoothlight = (MapPreferences.smoothlight + 1) % 3;  
				var messages = ["Posterization On", "Smoothlight On", "Smoothlight On with Gamma Correction"];  
				this.addText(
					messages[MapPreferences.smoothlight],  
					this.TYPE.INFO,  
					this.FILTER.PUBLIC_LOG  
				);  
				MapPreferences.save();  
				return;  
			},
		},

		noctrl: {
			description: "Allows attacking monsters continuously with only one left-click",
			callback: function () {
				this.addText(
					DB.getMessage(717 + ControlPreferences.noctrl),
					this.TYPE.INFO,
					this.FILTER.PUBLIC_LOG
				);
				ControlPreferences.noctrl = !ControlPreferences.noctrl;
				ControlPreferences.save();
				return;
			},
			aliases: ["nc"],
		},

		noshift: {
			description: " Allows targeting monsters or other players in PvP arenas with support skills without having to press the Shift key",
			callback: function () {
				this.addText(
					DB.getMessage(701 + ControlPreferences.noshift),
					this.TYPE.INFO,
					this.FILTER.PUBLIC_LOG
				);
				ControlPreferences.noshift = !ControlPreferences.noshift;
				ControlPreferences.save();
				return;
			},
			aliases: ["ns"],
		},

		snap: {
			description: "The mouse cursor semi-automatically moves to the target",
			callback: function () {
				this.addText(
					DB.getMessage(271 + ControlPreferences.snap),
					this.TYPE.INFO,
					this.FILTER.PUBLIC_LOG
				);
				ControlPreferences.snap = !ControlPreferences.snap;
				ControlPreferences.save();
				return;
			},
		},

		itemsnap: {
			description: "The mouse cursor semi-automatically moves to the loot",
			callback: function () {
				this.addText(
					DB.getMessage(276 + ControlPreferences.itemsnap),
					this.TYPE.INFO,
					this.FILTER.PUBLIC_LOG
				);
				ControlPreferences.itemsnap = !ControlPreferences.itemsnap;
				ControlPreferences.save();
				return;
			},
		},
		window: {
			description: "Toggles snapping/magnetism between windows",
			callback: function () {
				UIPreferences.windowmagnet = !UIPreferences.windowmagnet;
				this.addText(
					"Window magnet " +
						(UIPreferences.windowmagnet ? "ON" : "OFF"),
					this.TYPE.INFO,
					this.FILTER.PUBLIC_LOG
				);
				UIPreferences.save();
				return;
			},
			aliases: ["wi"],
		},

		stand: {
			description: "Makes your character sit or stand",
			callback: function () {
				var pkt;
				if (PACKETVER.value >= 20180307) {
					pkt = new PACKET.CZ.REQUEST_ACT2();
				} else {
					pkt = new PACKET.CZ.REQUEST_ACT();
				}
				if (Session.Entity.action === Session.Entity.ACTION.SIT) {
					pkt.action = 3; // stand up
				} else {
					pkt.action = 2; // sit down
				}
				Network.sendPacket(pkt);
				return;
			},
			aliases: ["sit"],
		},

		doridori: {
			description: "Moves your character's head from side to side",
			callback: function () {
				var pkt;
				Session.Entity.headDir = Session.Entity.headDir === 1 ? 2 : 1;
				if (PACKETVER.value >= 20180307) {
					pkt = new PACKET.CZ.CHANGE_DIRECTION2();
				} else {
					pkt = new PACKET.CZ.CHANGE_DIRECTION();
				}
				pkt.headDir = Session.Entity.headDir;
				pkt.dir = Session.Entity.direction;
				Network.sendPacket(pkt);

				// Doridori recovery bonus
				if (Session.Entity.action === Session.Entity.ACTION.SIT) {
					if (!Session.Entity.doriTime) {
						Session.Entity.doriTime = [0, 0, 0, 0, 0];
					}

					Session.Entity.doriTime.shift();
					Session.Entity.doriTime.push(Renderer.tick);

					const doriStart = Session.Entity.doriTime[0];
					const doriEnd = Session.Entity.doriTime[4];

					if (
						doriEnd - doriStart > 1500 &&
						doriEnd - doriStart < 3000
					) {
						const doripkt = new PACKET.CZ.DORIDORI();
						Network.sendPacket(doripkt);
						Session.Entity.doriTime = [0, 0, 0, 0, 0];
					}
				}
				return;
			},
		},

		bangbang: {
			description: "Rotates your character clockwise",
			callback: function () {
				var pkt;
				Session.Entity.direction = (Session.Entity.direction + 1) % 8;
				if (PACKETVER.value >= 20180307) {
					pkt = new PACKET.CZ.CHANGE_DIRECTION2();
				} else {
					pkt = new PACKET.CZ.CHANGE_DIRECTION();
				}
				pkt.headDir = Session.Entity.headDir;
				pkt.dir = Session.Entity.direction;
				Network.sendPacket(pkt);
				return;
			},
		},

		bingbing: {
			description: "Rotates your character counterclockwise",
			callback: function () {
				var pkt;
				Session.Entity.direction = (Session.Entity.direction + 7) % 8;
				if (PACKETVER.value >= 20180307) {
					pkt = new PACKET.CZ.CHANGE_DIRECTION2();
				} else {
					pkt = new PACKET.CZ.CHANGE_DIRECTION();
				}
				pkt.headDir = Session.Entity.headDir;
				pkt.dir = Session.Entity.direction;
				Network.sendPacket(pkt);
				return;
			},
		},

		where: {
			description: "Shows your character's location as a map name and set of coordinates",
			callback: function () {
				const currentMap = getModule("Renderer/MapRenderer").currentMap;
				this.addText(
					DB.getMapName(currentMap) +
						"(" +
						currentMap +
						") : " +
						Math.floor(Session.Entity.position[0]) +
						", " +
						Math.floor(Session.Entity.position[1]),
					this.TYPE.INFO,
					this.FILTER.PUBLIC_LOG
				);
				return;
			},
		},

		who: {
			description: "Shows the current number of players on the server",
			callback: function () {
				var pkt = new PACKET.CZ.REQ_USER_COUNT();
				Network.sendPacket(pkt);
				return;
			},
			aliases: ["w"],
		},

		memo: {
			description: "Memorizes a location for use with the Warp Portal skill",
			callback: function () {
				var pkt = new PACKET.CZ.REMEMBER_WARPPOINT();
				Network.sendPacket(pkt);
				return;
			},
		},

		chat: {
			description: "Creates a chat room",
			callback: function () {
				getModule("UI/Components/ChatRoomCreate/ChatRoomCreate").show();
				return;
			},
		},

		q: {
			description: "Leaves a chat room",
			callback: function () {
				getModule("UI/Components/ChatRoom/ChatRoom").remove();
				return;
			},
		},

		leave: {
			description: "Allows one to leave a party",
			callback: function () {
				getModule("Engine/MapEngine/Group").onRequestLeave();
				return;
			},
		},

		invite: {
			description: "\"<name>\" Invite a person to your party. Works across different maps",
			callback: function (text) {
				var matches = text.match(/^invite\s+(")?([^"]+)(")?/);
				if (matches && matches[2]) {
					getModule("Engine/MapEngine/Group").onRequestInvitation(
						0,
						matches[2]
					);
					return;
				}
			},
		},

		organize: {
			description: "Creates a party named <Party Name>",
			callback: function (text) {
				var matches = text.match(/^organize\s+(")?([^"]+)(")?/);
				if (matches && matches[2]) {
					getModule("Engine/MapEngine/Group").onRequestCreationEasy(
						matches[2]
					);
					return;
				}
			},
		},

		hi: {
			description: "Sends the specified message to everyone on your friend list",
			callback: function () {
				getModule("Engine/MapEngine/Friends").sayHi();
				return;
			},
		},

		guild: {
			description: "Creates a guild named <Guild Name>. This requires an Emperium to be in the creator's inventory",
			callback: function (text) {
				var matches = text.match(/^guild\s+(")?([^"]+)(")?/);
				if (matches && matches[2]) {
					getModule("Engine/MapEngine/Guild").createGuild(matches[2]);
					return;
				}
			},
		},

		breakguild: {
			description: "Disbands a guild. Can only be used by the guild leader. All members must be expelled first",
			callback: function (text) {
				var matches = text.match(/^breakguild\s+(")?([^"]+)(")?/);
				if (matches && matches[2]) {
					getModule("Engine/MapEngine/Guild").breakGuild(matches[2]);
					return;
				}
			},
		},

		alchemist: {
			description: "Shows the top 10 brewing Alchemists in the server.",
			callback: function () {
				var pkt = new PACKET.CZ.ALCHEMIST_RANK();
				Network.sendPacket(pkt);
				return;
			},
		},

		blacksmith: {
			description: "Shows the top 10 forging/upgrading Blacksmiths in the server",
			callback: function () {
				var pkt = new PACKET.CZ.BLACKSMITH_RANK();
				Network.sendPacket(pkt);
				return;
			},
		},

		taekwon: {
			description: "Shows the top 10 TaeKwon Kids based on completion of TaeKwon Missions in the server",
			callback: function () {
				var pkt = new PACKET.CZ.TAEKWON_RANK();
				Network.sendPacket(pkt);
				return;
			},
		},

		hoai: {
			description: "Switches Homunculus AI between default and custom mode",
			callback: function () {
				Session.homCustomAI = !Session.homCustomAI;
				if (Session.homCustomAI) {
					getModule(
						"UI/Components/HomunInformations/HomunInformations"
					).resetAI();
					this.addText(
						DB.getMessage(1023),
						this.TYPE.INFO,
						this.FILTER.PUBLIC_LOG
					);
				} else {
					getModule(
						"UI/Components/HomunInformations/HomunInformations"
					).resetAI();
					this.addText(
						DB.getMessage(1024),
						this.TYPE.INFO,
						this.FILTER.PUBLIC_LOG
					);
				}
				return;
			},
		},

		merai: {
			description: "Switches Mercenary AI between default and custom mode",
			callback: function () {
				Session.merCustomAI = !Session.merCustomAI;
				if (Session.merCustomAI) {
					getModule(
						"UI/Components/MercenaryInformations/MercenaryInformations"
					).resetAI();
					this.addText(
						DB.getMessage(1273),
						this.TYPE.INFO,
						this.FILTER.PUBLIC_LOG
					);
				} else {
					getModule(
						"UI/Components/MercenaryInformations/MercenaryInformations"
					).resetAI();
					this.addText(
						DB.getMessage(1274),
						this.TYPE.INFO,
						this.FILTER.PUBLIC_LOG
					);
				}
				return;
			},
		},
		call: {
			description: "Toggles the ability to be Urgent Called.",
			callback: function () {
				var pkt    = new PACKET.CZ.CONFIG();
				pkt.Config = 1;
				pkt.Value  = !Session.Entity.call_flag ? 1 : 0;
				Network.sendPacket(pkt);
				return;
			},
		},

		cl: {
			description: "Sends a message to the player clan.",
			callback: function (text) {
				var pkt    = new PACKET.CZ.CLAN_CHAT();
				var matches = text.match(/(^cl)\s+(.*)/);
				if (matches && matches[2]) {
					pkt.msg    = Session.Entity.display.name + ' : ' + matches[2];
					Network.sendPacket(pkt);
					return;
				}
			},
		},


		/*
		*  GM COMMANDS
		*/
		broadcast: {
			description: "Sends a broadcast message with your name (yellow).",
			callback:function (text) {
				var matches = text.match(/(^broadcast|^b)\s+(.*)/);
				if (matches && matches[2]) {
					var pkt = new PACKET.CZ.BROADCAST();
					pkt.msg = Session.Entity.display.name + ' : ' + matches[2];
					Network.sendPacket(pkt);
					return;
				}
			},
			aliases: ["b"],
		},
		nb: {
			description: "Sends a broadcast message without your name (yellow).",
			callback:function (text) {
				var matches = text.match(/(^nb)\s+(.*)/);
				if (matches && matches[2]) {
					var pkt = new PACKET.CZ.BROADCAST();
					pkt.msg = matches[2];
					Network.sendPacket(pkt);
					return;
				}
			},
		},
		localbroadcast: {
			description: "Sends a local broadcast message with your name. (yellow)",
			callback:function (text) {
				var matches = text.match(/(^localbroadcast|^lb)\s+(.*)/);
				if (matches && matches[2]) {
					var pkt = new PACKET.CZ.LOCALBROADCAST();
					pkt.msg = Session.Entity.display.name + ' : ' + matches[2];
					Network.sendPacket(pkt);
					return;
				}
			},
			aliases: ["lb"],
		},
		nlb: {
			description: "Sends a local broadcast message without your name. (yellow)",
			callback:function (text) {
				var matches = text.match(/(^nlb)\s+(.*)/);
				if (matches && matches[2]) {
					var pkt = new PACKET.CZ.LOCALBROADCAST();
					pkt.msg = matches[2];
					Network.sendPacket(pkt);
					return;
				}
			},
		},
		mapmove: {
			description: "Move to map x y.",
			callback: function (text) {
				var matches = text.match(/(^mapmove|^mm)\s+([\w.]+)\s+(\d+)\s+(\d+)/);
				if (matches) {
					var pkt = new PACKET.CZ.MOVETO_MAP();
					pkt.mapName = matches[2];
					pkt.xPos = parseInt(matches[3], 10);
					pkt.yPos = parseInt(matches[4], 10);
					Network.sendPacket(pkt);
					return;
				}
			},
			aliases: ["mm"],
		},
		shift: {
			description: "Warp to a character.",
			callback: function (text) {
				var matches = text.match(/^shift\s+(")?([^"]+)(")?/);
				if (matches && matches[2]) {
					var pkt = new PACKET.CZ.SHIFT();
					pkt.CharacterName = matches[2].trim();
					Network.sendPacket(pkt);
					return;
				}
			},
		},
		summon: {
			description: "Recall a player at your position",
			callback: function (text) {
				var matches = text.match(/(^summon)\s+(.*)/);
				if (matches) {
					var pkt = new PACKET.CZ.MOVETO_MAP();
					pkt.CharacterName = matches[2];
					Network.sendPacket(pkt);
					return;
				}
			},
		},
		recall: {
			description: "Sends a local broadcast message (needs account name).",
			callback: function (text) {
				var matches = text.match(/(^recall)\s+(.*)/);
				if (matches) {
					var pkt = new PACKET.CZ.RECALL();
					pkt.AccountName = matches[2];
					Network.sendPacket(pkt);
					return;
				}
			},
		},
		hide: {
			description: "Enter in Perfect Hide.",
			callback: function () {
				var pkt    = new PACKET.CZ.CHANGE_EFFECTSTATE();
				Network.sendPacket(pkt);
				return;
			},
		},
		kill: {
			description: "Disconnect a player (needs account id).",
			callback: function (text) {
				var matches = text.match(/(^kill)\s+(\d+)/);
				if (matches) {
					var pkt = new PACKET.CZ.DISCONNECT_CHARACTER();
					pkt.AID = matches[2];
					Network.sendPacket(pkt);
					return;
				}
			},
		},
		killall: {
			description: "Disconnect all players.",
			callback: function () {
				var pkt    = new PACKET.CZ.DISCONNECT_ALL_CHARACTER();
				Network.sendPacket(pkt);
				return;
			},
		},
		item: {
			description: "Create Item or Monster (uses AEGIS name).",
			callback: function (text) {
				var matches = text.match(/(^item|^monster)\s+(")?([^"]+)(")?/);
				if (matches && matches[2]) {
					var pkt    = new PACKET.CZ.ITEM_CREATE();
					pkt.itemName = matches[2];
					Network.sendPacket(pkt);
					return;
				}
			},
			aliases: ["monster"],
		},
		resetstate: {
			description: "Reset Stats.",
			callback: function () {
				var pkt    = new PACKET.CZ.RESET();
				pkt.type = 0;
				Network.sendPacket(pkt);
				return;
			},
		},
		resetskill: {
			description: "Reset Skills.",
			callback: function () {
				var pkt    = new PACKET.CZ.RESET();
				pkt.type = 1;
				Network.sendPacket(pkt);
				return;
			},
		},
		remove: {
			description: "Remove a player (need account name)",
			callback: function (text) {
				var matches = text.match(/(^remove)\s+(.*)/);
				if (matches) {
					var pkt = new PACKET.CZ.REMOVE_AID();
					pkt.AccountName = matches[2];
					Network.sendPacket(pkt);
					return;
				}
			},
		},
		changemaptype: {
			description: "Change a cell type (x,y,type).",
			callback: function (text) {
				var matches = text.match(/(^changemaptype|cmt)\s+(\d+)\s+(\d+)\s+(\d+)/);
				if (matches) {
					var pkt = new PACKET.CZ.MOVETO_MAP();
					pkt.xPos = matches[2];
					pkt.yPos = matches[3];
					pkt.type = matches[4];
					Network.sendPacket(pkt);
					return;
				}
			},
			aliases: ["cmt"],
		},
		check: {
			description: "Check stats of a player (GM command).",
			callback: function (text) {
				var matches = text.match(/^check\s+(")?([^"]+)(")?/);
				if (matches && matches[2]) {
					var pkt = new PACKET.CZ.REQ_STATUS_GM();
					pkt.CharName = matches[2].trim();
					Session.gmCheckTarget = pkt.CharName;
					Network.sendPacket(pkt);
					return;
				}
			},
		},
		macro_register: {
			description: "Open the interface to upload image to captcha system",
			callback: function () {
				var CaptchaUpload = getModule("UI/Components/Captcha/CaptchaUpload");
				CaptchaUpload.prepare();
				CaptchaUpload.append();
			},
			aliases: ["mr"],
		},
		macro_detector: {
			description: "Open the macro detector interface",
			callback: function () {
				var CaptchaSelector = getModule("UI/Components/Captcha/CaptchaSelector");
				CaptchaSelector.prepare();
				CaptchaSelector.append();
			},
			aliases: ["md"],
		},
		macro_preview: {
			description: "Request to preview a captcha image",
			callback: function (text) {
				var matches = text.match(/^macro_preview\s+(\d+)/);
				if (matches && matches[1]) {
					var pkt = new PACKET.CZ.REQ_PREVIEW_MACRO_DETECTOR();
					pkt.captchaID = matches[1];
					Network.sendPacket(pkt);
				}
				return;
			},
		},
		commands: {
			description: "Show available commands.",
			callback: function () {
				function addTextCommand(cmd, commands) {
					let textAliases = '';

					if (commands[cmd].aliases && commands[cmd].aliases.length > 0) {
						textAliases = ` (${commands[cmd].aliases.join(", ")})`;
					}

					return `/${cmd}` + textAliases + ` : ${commands[cmd].description || 'Unknown description.'}\n`;
				}
				// we list custom in a separate section
				let customsEnabled = false;

				const separator = "=======================\n";

				let messages = `${separator}Available Commands:\n${separator}`;
				let customMessages = `${separator}Custom Commands:\n${separator}`;

				const sortedCommands = {};

				// sort a-z commands by their name
				Object.keys(CommandStore).sort().forEach(function (key) {
					sortedCommands[key] = CommandStore[key];
				});


				for (const cmd in sortedCommands) {
					if (sortedCommands[cmd].custom) {
						customMessages += addTextCommand(cmd, sortedCommands);
						customsEnabled = true;
					} else {
						messages += addTextCommand(cmd, sortedCommands);
					}
				}

				this.addText(messages, this.TYPE.BLUE, this.FILTER.PUBLIC_LOG);

				if (customsEnabled)
					this.addText(customMessages, this.TYPE.INFO, this.FILTER.PUBLIC_LOG);

				return;
			},
			aliases: ["cmd", "h", "help"],
		},
	};

	// Dev-only weather helper to trigger weather effects locally.
	if (Configs.get("development")) {
			CommandStore.weather = {
				description: "Dev-only weather toggle. Usage: /weather snow|rain|leaves|sakura|fireworks|off",
				callback: function (text) {
					var args = text.trim().split(/\s+/).slice(1);
					var mode = (args[0] || "").toLowerCase();

					if (!mode || mode === "help") {
						this.addText(
							"Usage: /weather snow|rain|leaves|sakura|fireworks|off",
							this.TYPE.INFO,
							this.FILTER.PUBLIC_LOG
						);
						return;
					}

					if (!Session.Entity) {
						return;
					}

					var ownerAID = Session.Entity.GID || Session.GID || Session.AID;
					var EffectManager = getModule("Renderer/EffectManager");
					var SnowWeatherEffect = getModule("Renderer/Effects/SnowWeather");
					var RainWeatherEffect = getModule("Renderer/Effects/RainWeather");
					var SakuraWeatherEffect = getModule("Renderer/Effects/SakuraWeatherEffect");
					var PokJukWeatherEffect = getModule("Renderer/Effects/PokJukWeatherEffect");

					if (mode === "snow" || mode === "on") {
						EffectManager.spam({
							effectId: EffectConst.EF_SNOW,
							ownerAID: ownerAID
						});
						this.addText(
							"Snow started.",
							this.TYPE.INFO,	
							this.FILTER.PUBLIC_LOG
						);
						return;
					}

					if (mode === "rain") {
						EffectManager.spam({
							effectId: EffectConst.EF_RAIN,
							ownerAID: ownerAID
						});
						this.addText(
							"Rain started.",
							this.TYPE.INFO,
							this.FILTER.PUBLIC_LOG
						);
						return;
					}

					if (mode === "sakura") {
						EffectManager.spam({
							effectId: EffectConst.EF_SAKURA,
							ownerAID: ownerAID
						});
						this.addText(
							"Cherry tree leaves have begun to fall.",
							this.TYPE.INFO,
							this.FILTER.PUBLIC_LOG
						);
						return;
					}

					if (mode === "leaves") {
						EffectManager.spam({
							effectId: EffectConst.EF_MAPLE,
							ownerAID: ownerAID
						});
						this.addText(
							"Fallen leaves fall.",
							this.TYPE.INFO,
							this.FILTER.PUBLIC_LOG
						);
						return;
					}

					if (mode === "fireworks") {
						EffectManager.spam({
							effectId: EffectConst.EF_POKJUK,
							ownerAID: ownerAID
						});
						this.addText(
							"Fireworks are launched.",
							this.TYPE.INFO,
							this.FILTER.PUBLIC_LOG
						);
						return;
					}

					if (mode === "off" || mode === "stop" || mode === "clear") {
						SnowWeatherEffect.stop(ownerAID, Renderer.tick);
						RainWeatherEffect.stop(ownerAID, Renderer.tick);
						SakuraWeatherEffect.stop(ownerAID, Renderer.tick);
						PokJukWeatherEffect.stop(ownerAID, Renderer.tick);
						this.addText(
							"Weather stopping.",
							this.TYPE.INFO,
							this.FILTER.PUBLIC_LOG
						);
						return;
					}

					this.addText(
						"Unknown weather. Usage: /weather snow|rain|leaves|sakura|fireworks|off",
						this.TYPE.INFO,
						this.FILTER.PUBLIC_LOG
					);
				}
			};
	}

	/**
	 * Load aliases
	 */
	function loadAliases() {
		for (var cmd in CommandStore) {
			if (CommandStore[cmd].aliases) {
				for (var i = 0; i < CommandStore[cmd].aliases.length; i++) {
					aliases[CommandStore[cmd].aliases[i]] = cmd;
				}
			}
		}
	}

	loadAliases();

	/**
	 * Process command
	 */
	function processCommand(text) {
		var cmd = text.split(" ")[0];
		var pkt, matches;

		// Check if the command exists in the store
		if (CommandStore[cmd]) {
			CommandStore[cmd].callback.call(this, text);
		} else if (aliases[cmd]) {
			var parentCommand = aliases[cmd];
			CommandStore[parentCommand].callback.call(this, text);
		} else {
			// /str+
			// TODO: do we have to spam the server with "1" unit or do we have to fix the servers code ?
			matches = text.match(/^(\w{3})\+ (\d+)$/);
			if (matches) {
				var pos = ["str", "agi", "vit", "int", "dex", "luk"].indexOf(
					matches[1]
				);
				if (pos > -1 && matches[2] !== 0) {
					pkt = new PACKET.CZ.STATUS_CHANGE();
					pkt.statusID = pos + 13;
					pkt.changeAmount = parseInt(matches[2], 10);
					Network.sendPacket(pkt);
					return;
				}
			}

			if (matches) {
				var pos = ["pow", "sta", "wis", "spl", "con", "crt"].indexOf(
					matches[1]
				);
				if (pos > -1 && matches[2] !== 0) {
					pkt = new PACKET.CZ.STATUS_CHANGE();
					pkt.statusID = pos + 219;
					pkt.changeAmount = parseInt(matches[2], 10);
					Network.sendPacket(pkt);
					return;
				}
			}

			// Show emotion
			if (cmd in Emotions.commands) {
				pkt = new PACKET.CZ.REQ_EMOTION();
				pkt.type = Emotions.commands[cmd];
				Network.sendPacket(pkt);
				return;
			}

			// Command not found
			this.addText(
				DB.getMessage(95),
				this.TYPE.INFO,
				this.FILTER.PUBLIC_LOG
			);
		}
	}

	/**
	 * Add a command to the store
	 */
	function addCommand(
		name,
		description = "",
		callback = () => {},
		aliases = [],
		custom = true
	) {
		const ChatBox = getModule("UI/Components/ChatBox/ChatBox");
		callback = callback.bind(ChatBox);

		CommandStore[name] = {
			description: description,
			callback: callback,
			aliases: aliases,
			custom
		};
		reloadAliases();
	}

	/**
	 * Remove a command from the store
	 */
	function removeCommand(name) {
		delete CommandStore[name];
		reloadAliases();
	}

	/**
	 * Reload aliases (we dont reload aliases on each ProcessCommand because it's not a common operation)
	 */
	function reloadAliases() {
		aliases = {};
		loadAliases();
	}

	return {
		processCommand: processCommand,
		add: addCommand,
		remove: removeCommand,
		isEnabled: function (name) {
			return name in CommandStore;
		},
		reloadAliases: reloadAliases,
	};
});
