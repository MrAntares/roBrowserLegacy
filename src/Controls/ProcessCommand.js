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
	var DB = require("DB/DBManager");
	var Emotions = require("DB/Emotions");
	var BGM = require("Audio/BGM");
	var Sound = require("Audio/SoundManager");
	var Session = require("Engine/SessionStorage");
	var PACKET = require("Network/PacketStructure");
	var PACKETVER = require("Network/PacketVerManager");
	var Network = require("Network/NetworkManager");
	var ControlPreferences = require("Preferences/Controls");
	var AudioPreferences = require("Preferences/Audio");
	var MapPreferences = require("Preferences/Map");
	var CameraPreferences = require("Preferences/Camera");
	var Renderer = require("Renderer/Renderer");
	var getModule = require;

	var aliases = {};

	var CommandStore = {
		sound: {
			description: "Toggle sound.",
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
			description: "Toggle BGM.",
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
			description: "Toggle effects.",
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
			description: "Toggle mine effects.",
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
			description: "Toggle miss effects.",
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
			description: "Toggle aura effect.",
			callback: function () {
				var isSimplified = MapPreferences.aura > 1;
				this.addText(
					DB.getMessage(711 + isSimplified),
					this.TYPE.INFO,
					this.FILTER.PUBLIC_LOG
				);
				MapPreferences.aura = isSimplified ? 1 : 2;
				MapPreferences.save();
				return;
			},
		},
		aura2: {
			description: "Toggle aura2 effect.",
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
				return;
			},
		},
		showname: {
			description: "Toggle display names.",
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
			description: "Toggle camera smoothing.",
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
			description: "Toggle fog.",
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
			description: "Toggle lightmap",
			callback: function () {
				MapPreferences.lightmap = !MapPreferences.lightmap;
				MapPreferences.save();
				return;
			},
		},

		noctrl: {
			description: "Toggle noctrl.",
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
			description: "Toggle noshift.",
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
			description: "Toggle snap.",
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
			description: "Toggle itemsnap.",
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

		stand: {
			description: "Sit/Stand",
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
			description: "Doridori",
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

					var doriStart = Session.Entity.doriTime[0];
					var doriEnd = Session.Entity.doriTime[4];

					if (
						doriEnd - doriStart > 1500 &&
						doriEnd - doriStart < 3000
					) {
						var doripkt = new PACKET.CZ.DORIDORI();
						Network.sendPacket(doripkt);
						Session.Entity.doriTime = [0, 0, 0, 0, 0];
					}
				}
				return;
			},
		},

		bangbang: {
			description: "Bangbang",
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
			description: "Bingbing",
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
			description: "Show current position.",
			callback: function () {
				var currentMap = getModule("Renderer/MapRenderer").currentMap;
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
			description: "Show online players.",
			callback: function () {
				var pkt = new PACKET.CZ.REQ_USER_COUNT();
				Network.sendPacket(pkt);
				return;
			},
			aliases: ["w"],
		},

		memo: {
			description: "Save current position.",
			callback: function () {
				var pkt = new PACKET.CZ.REMEMBER_WARPPOINT();
				Network.sendPacket(pkt);
				return;
			},
		},

		chat: {
			description: "Create chat room.",
			callback: function () {
				getModule("UI/Components/ChatRoomCreate/ChatRoomCreate").show();
				return;
			},
		},

		q: {
			description: "Close chat room.",
			callback: function () {
				getModule("UI/Components/ChatRoom/ChatRoom").remove();
				return;
			},
		},

		leave: {
			description: "Leave group.",
			callback: function () {
				getModule("Engine/MapEngine/Group").onRequestLeave();
				return;
			},
		},

		invite: {
			description: "Invite player to group.",
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
			description: "Create group.",
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
			description: "Say hi to friends.",
			callback: function () {
				getModule("Engine/MapEngine/Friends").sayHi();
				return;
			},
		},

		guild: {
			description: "Create guild.",
			callback: function (text) {
				var matches = text.match(/^guild\s+(")?([^"]+)(")?/);
				if (matches && matches[2]) {
					getModule("Engine/MapEngine/Guild").createGuild(matches[2]);
					return;
				}
			},
		},

		breakguild: {
			description: "Break guild.",
			callback: function (text) {
				var matches = text.match(/^breakguild\s+(")?([^"]+)(")?/);
				if (matches && matches[2]) {
					getModule("Engine/MapEngine/Guild").breakGuild(matches[2]);
					return;
				}
			},
		},

		alchemist: {
			description: "Show alchemist ranking.",
			callback: function () {
				var pkt = new PACKET.CZ.ALCHEMIST_RANK();
				Network.sendPacket(pkt);
				return;
			},
		},

		blacksmith: {
			description: "Show blacksmith ranking.",
			callback: function () {
				var pkt = new PACKET.CZ.BLACKSMITH_RANK();
				Network.sendPacket(pkt);
				return;
			},
		},

		taekwon: {
			description: "Show taekwon ranking.",
			callback: function () {
				var pkt = new PACKET.CZ.TAEKWON_RANK();
				Network.sendPacket(pkt);
				return;
			},
		},

		hoai: {
			description: "Toggle custom homunculus AI.",
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
			description: "Toggle custom mercenary AI.",
			callback: function () {
				Session.merCustomAI = !Session.merCustomAI;
				if (Session.merCustomAI) {
					this.addText(
						DB.getMessage(1273),
						this.TYPE.INFO,
						this.FILTER.PUBLIC_LOG
					);
				} else {
					this.addText(
						DB.getMessage(1274),
						this.TYPE.INFO,
						this.FILTER.PUBLIC_LOG
					);
				}
				this.addText(
					"(Mercenary not supported yet)",
					this.TYPE.INFO,
					this.FILTER.PUBLIC_LOG
				);
				return;
			},
		},
		commands: {
			//description: "Show available commands.",
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
		var ChatBox = getModule("UI/Components/ChatBox/ChatBox");
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
