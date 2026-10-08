/**
 * Engine/MapEngine/Group.js
 *
 * Manage group/party
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

/**
 * Load dependencies
 */
import DB from 'DB/DBManager.js';
import Inflate from 'Utils/Inflate.js';
import Texture from 'Utils/Texture.js';
import BinaryWriter from 'Utils/BinaryWriter.js';
import Session from 'Engine/SessionStorage.js';
import Network from 'Network/NetworkManager.js';
import PACKETVER from 'Network/PacketVerManager.js';
import PACKET from 'Network/PacketStructure.js';
import EntityManager from 'Renderer/EntityManager.js';
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';
import Guild from 'UI/Components/Guild/Guild.js';
import GuildCompanion from 'UI/Components/GuildCompanion/GuildCompanion.js';
import UIManager from 'UI/UIManager.js';
import Configs from 'Core/Configs.js';
import MiniMap from 'UI/Components/MiniMap/MiniMap.js';
import ShortCut from 'UI/Components/ShortCut/ShortCut.js';
import UIPreferences from 'Preferences/UI.js';

/**
 * @var {Object} emblem list
 */
const _emblems = {};

/**
 * @var {boolean} shortcut bar asked for guild skills before guild info arrived
 */
let _pendingGuildSkillRequest = false;

/**
 * @var {number} timer waiting on the answer to a member info request
 */
let _memberInfoTimer = 0;

/**
 * @var {Object} last emblem version each guild announced, keyed by guild id
 */
const _emblemNotified = {};

/**
 * @var {string} who we last invited, so the answer can name them
 *
 * The ack is a flag byte, so the name can only come from this side.
 * @see docs/reference/guild/invitation-ack.md
 */
let _lastInvited = '';

/**
 * Engine namespace
 */
class GuildEngine {
	/**
	 * @var {number} our guild id
	 */
	static guild_id = -1;
	/**
	 * Initialize engine
	 */
	static init() {
		Network.hookPacket(PACKET.ZC.GUILD_CHAT, onMemberTalk);
		Network.hookPacket(PACKET.ZC.NOTIFY_POSITION_TO_GUILDM, onMemberMove);
		Network.hookPacket(PACKET.ZC.GUILD_INFO, onGuildInfo);
		Network.hookPacket(PACKET.ZC.GUILD_INFO2, onGuildInfo);
		Network.hookPacket(PACKET.ZC.GUILD_INFO3, onGuildInfo);
		Network.hookPacket(PACKET.ZC.GUILD_INFO4, onGuildInfo);
		Network.hookPacket(PACKET.ZC.MYGUILD_BASIC_INFO, onGuildRelation);
		Network.hookPacket(PACKET.ZC.GUILD_EMBLEM_IMG, onGuildEmblem);
		Network.hookPacket(PACKET.ZC.MEMBERMGR_INFO, onGuildMembers);
		Network.hookPacket(PACKET.ZC.MEMBERMGR_INFO2, onGuildMembers);
		Network.hookPacket(PACKET.ZC.MEMBERMGR_INFO3, onGuildMembers);
		Network.hookPacket(PACKET.ZC.ACK_GUILD_MEMBER_INFO, onGuildMemberUpdate);
		Network.hookPacket(PACKET.ZC.ACK_OPEN_MEMBER_INFO, onGuildMemberInfo);
		Network.hookPacket(PACKET.ZC.POSITION_INFO, onGuildPositions);
		Network.hookPacket(PACKET.ZC.POSITION_ID_NAME_INFO, onGuildPositionsName);
		Network.hookPacket(PACKET.ZC.ACK_CHANGE_GUILD_POSITIONINFO, onGuildPositions);
		Network.hookPacket(PACKET.ZC.GUILD_SKILLINFO, onGuildSkillList);
		Network.hookPacket(PACKET.ZC.GUILD_NOTICE, onGuildNotice);
		Network.hookPacket(PACKET.ZC.ACK_REQ_CHANGE_MEMBERS, onGuildMemberPositionUpdate);
		Network.hookPacket(PACKET.ZC.ACK_GUILD_MENUINTERFACE, onGuildAccess);
		Network.hookPacket(PACKET.ZC.RESULT_MAKE_GUILD, onGuildCreationResult);
		Network.hookPacket(PACKET.ZC.UPDATE_GDID, onGuildOwnInfo);
		Network.hookPacket(PACKET.ZC.UPDATE_GDID2, onGuildOwnInfo);
		Network.hookPacket(PACKET.ZC.BAN_LIST, onGuildExpelList);
		Network.hookPacket(PACKET.ZC.BAN_LIST2, onGuildExpelList);
		Network.hookPacket(PACKET.ZC.BAN_LIST3, onGuildExpelList);
		Network.hookPacket(PACKET.ZC.CHANGE_GUILD, onGuildEmblemChanged);
		Network.hookPacket(PACKET.ZC.CHANGE_GUILD2, onGuildEmblemChanged);
		Network.hookPacket(PACKET.ZC.CHANGE_GUILD3, onGuildEmblemChanged);
		Network.hookPacket(PACKET.ZC.ACK_DISORGANIZE_GUILD_RESULT, onGuildDestroy);
		Network.hookPacket(PACKET.ZC.REQ_JOIN_GUILD, onGuildInviteRequest);
		Network.hookPacket(PACKET.ZC.ACK_REQ_JOIN_GUILD, onGuildInviteResult);
		Network.hookPacket(PACKET.ZC.UPDATE_CHARSTAT, onGuildMemberStatus);
		Network.hookPacket(PACKET.ZC.UPDATE_CHARSTAT2, onGuildMemberStatus);
		Network.hookPacket(PACKET.ZC.ACK_BAN_GUILD, onGuildMemberExpulsion);
		Network.hookPacket(PACKET.ZC.ACK_BAN_GUILD_SSO, onGuildMemberExpulsion);
		Network.hookPacket(PACKET.ZC.ACK_BAN_GUILD_DELNAME, onGuildMemberExpulsionByID);
		Network.hookPacket(PACKET.ZC.ACK_LEAVE_GUILD, onGuildMemberLeave);
		Network.hookPacket(PACKET.ZC.ACK_LEAVE_GUILD_DELNAME, onGuildMemberLeaveByID);
		Network.hookPacket(PACKET.ZC.DELETE_RELATED_GUILD, onGuildAllianceDeleteAck);
		Network.hookPacket(PACKET.ZC.ADD_RELATED_GUILD, onGuildAllianceAdd);
		Network.hookPacket(PACKET.ZC.REQ_ALLY_GUILD, onGuildAskForAlliance);
		Network.hookPacket(PACKET.ZC.ACK_REQ_ALLY_GUILD, onGuildAllianceResult);
		Network.hookPacket(PACKET.ZC.ACK_REQ_HOSTILE_GUILD, onGuildHostilityResult);
		Network.hookPacket(PACKET.ZC.GUILD_AGIT_INFO, onGuildCastleInfo);

		// Hook UI
		Guild.onGuildInfoRequest = GuildEngine.requestInfo;
		Guild.onPositionUpdateRequest = GuildEngine.requestPositionUpdate;
		Guild.onChangeMemberPosRequest = GuildEngine.requestChangeMemberPos;
		Guild.onNoticeUpdateRequest = GuildEngine.requestNoticeUpdate;
		Guild.onRequestLeave = GuildEngine.requestLeave;
		Guild.onRequestMemberExpel = GuildEngine.requestMemberExpel;
		Guild.onRequestMemberInfo = GuildEngine.requestMemberInfo;
		Guild.onRequestDeleteRelation = GuildEngine.requestDeleteRelatedGuild;
		Guild.onRequestAccess = GuildEngine.requestAccess;
		Guild.onRequestCreateGuild = GuildEngine.createGuild;
		GuildCompanion.onRequestCreateGuild = GuildEngine.createGuild;
		GuildCompanion.onRequestBreakGuild = GuildEngine.breakGuild;
		Guild.onRequestBreakGuild = GuildEngine.breakGuild;
		Guild.onRequestGuildEmblem = GuildEngine.requestGuildEmblem;
		Guild.onSendEmblem = GuildEngine.sendEmblem;
		ShortCut.onRequestGuildSkills = GuildEngine.requestGuildSkills;
	}

	/**
	 * Request the guild skill list, deferred until we know the player has a guild
	 */
	static requestGuildSkills() {
		if (Session.hasGuild) {
			GuildEngine.requestInfo(3);
		} else {
			_pendingGuildSkillRequest = true;
		}
	}

	/**
	 * Ask server to get guild informations
	 *
	 * @param {number} type (page)
	 */
	static requestInfo(type) {
		if (type > 4) {
			return;
		}

		const pkt = new PACKET.CZ.REQ_GUILD_MENU();
		pkt.Type = type;
		Network.sendPacket(pkt);
	}

	/**
	 * Ask to get an emblem
	 *
	 * @param {number} guild id
	 * @param {number} version
	 * @param {function} callback
	 * @param {function} [onFailure] - the fetch gave up, and nothing was repainted
	 */
	static requestGuildEmblem(guild_id, version, callback, onFailure) {
		const failed = onFailure || function () {};

		// Guild does not exist
		if (!_emblems[guild_id]) {
			_emblems[guild_id] = {
				version: -1,
				image: new Image(),
				gif: null,
				callback: []
			};
		}

		if (Session.Entity.GUID === guild_id) {
			GuildEngine.guild_id = guild_id;
		}
		const emblem = _emblems[guild_id];

		// Lower version, update it to the current
		if (version <= emblem.version) {
			EntityManager.forEach(entity => {
				if (entity.GUID === guild_id) {
					entity.setEntityGuildEmblem(emblem.image, emblem.gif);
				}
			});
			callback(emblem.image, emblem.gif);
			return;
		}

		if (PACKETVER.value >= 20170315) {
			if (
				!guild_id ||
				typeof guild_id === 'undefined' ||
				!Session.AID ||
				Session.AID === 0 ||
				!Session.ServerName ||
				Session.ServerName === undefined ||
				!Session.WebToken ||
				Session.WebToken === undefined
			) {
				// Nothing was painted, so this counts as giving up like any other: a
				// broadcast can arrive before the web token does, and a caller holding
				// a mark for this version has to be told, or that version is refused
				// for good once the token turns up.
				failed();
				return;
			}

			const formData = new FormData();
			formData.append('GDID', guild_id);
			formData.append('WorldName', Session.ServerName);
			formData.append('AuthToken', Session.WebToken);
			formData.append('AID', Session.AID);

			const xhr = new XMLHttpRequest();

			let webserverAddress = '';
			if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
				webserverAddress = Configs.get('webserverAddress', 'http://127.0.0.1:8888');
			}

			xhr.open('POST', webserverAddress + '/emblem/download', true);
			xhr.responseType = 'blob';

			xhr.timeout = 5000;

			// A newer version can be asked for while this one is still downloading,
			// and the two answers can land in either order. Storing the older image
			// would repaint every entity with it and put the stored version back down,
			// and nothing would come to correct it: the mark that holds the burst back
			// already sits on the newer version, so every later broadcast of it is
			// refused.
			//
			// Only an older version is dropped, never an equal one. One version is
			// asked for by several callers at once - the guild info, the broadcast,
			// an entity coming into view - and each passes a callback that repaints
			// something different. Refusing the ones that land second would leave
			// whichever surface they own showing the emblem before.
			// @see docs/reference/guild/emblem-picker.md
			const commit = (img, gifCanvas) => {
				if (version < emblem.version) {
					return;
				}

				if (version > emblem.version) {
					emblem.version = version;
					emblem.image = img;
					emblem.gif = gifCanvas;
				}

				callback(emblem.image, emblem.gif);
				EntityManager.forEach(entity => {
					if (entity.GUID === guild_id) {
						entity.setEntityGuildEmblem(emblem.image, emblem.gif);
					}
				});
			};

			xhr.onload = () => {
				if (xhr.status !== 200) {
					console.warn('Emblem download returned non-200 status:', xhr.status);
					failed();
					return;
				}
				try {
					const contentType = xhr.getResponseHeader('Content-Type');
					const isGif = contentType === 'image/gif';
					if (!isGif) {
						const img = new Image();
						img.onload = () => {
							commit(img, null);
						};
						img.decoding = 'async';
						const blobUrl = URL.createObjectURL(xhr.response);
						// Load the emblem, remove magenta, free blob from memory
						Texture.load(blobUrl, function () {
							img.src = this.toDataURL();
							URL.revokeObjectURL(blobUrl);
						});
					} else {
						Texture.processGifToSpriteSheet(xhr.response, function (sucess) {
							if (sucess) {
								const gifCanvas = this;
								const img = new Image();
								img.onload = () => {
									commit(img, gifCanvas);
								};
								img.decoding = 'async';
								const blobUrl = URL.createObjectURL(xhr.response);
								// Load the emblem as img, remove magenta, free blob from memory
								Texture.load(blobUrl, function () {
									img.src = this.toDataURL();
									URL.revokeObjectURL(blobUrl);
								});
							} else {
								console.warn('Emblem gif could not be decoded');
								failed();
							}
						});
					}
				} catch (e) {
					console.error('Error processing guild emblem:', e);
					failed();
				}
			}; // End xhr.onload
			xhr.onerror = () => {
				console.warn('Emblem download failed: web-server unreachable');
				failed();
			};
			xhr.ontimeout = () => {
				console.warn('Emblem download timed out');
				failed();
			};

			xhr.send(formData);
		} else {
			// Ask for new version via Packet
			const pkt = new PACKET.CZ.REQ_GUILD_EMBLEM_IMG();
			pkt.GDID = guild_id;
			Network.sendPacket(pkt);
			emblem.callback.push(callback);
		}
	}

	/**
	 * Need to know the access we have to the guild UI
	 */
	static requestAccess() {
		Network.sendPacket(new PACKET.CZ.REQ_GUILD_MENUINTERFACE());
	}

	/**
	 * Empty the guild window for the character now entering the map
	 * @see docs/reference/guild/member-view.md
	 */
	static resetForNewCharacter() {
		Session.isGuildMaster = false;

		// A request the character before this one made, still waiting on its own
		// silence, would otherwise report itself in the new one's guild chat.
		// @see docs/reference/guild/member-info-request.md
		clearTimeout(_memberInfoTimer);
		_memberInfoTimer = 0;

		Guild.reset();
	}

	/**
	 * Ask the server to create a guild
	 *
	 * @param {string} guild name
	 */
	static createGuild(name) {
		const pkt = new PACKET.CZ.REQ_MAKE_GUILD();
		pkt.GID = Session.GID;
		pkt.GName = name;

		Network.sendPacket(pkt);
	}

	/**
	 * Ask the server to delete the guild
	 *
	 * @param {string} guild name
	 */
	static breakGuild(name) {
		const pkt = new PACKET.CZ.REQ_DISORGANIZE_GUILD();
		pkt.key = name;

		Network.sendPacket(pkt);
	}

	/**
	 * Send new positions list to server
	 *
	 * @param {Array} positions
	 */
	static requestPositionUpdate(positions) {
		const pkt = new PACKET.CZ.REG_CHANGE_GUILD_POSITIONINFO();
		pkt.memberList = positions;

		Network.sendPacket(pkt);
	}

	/**
	 * Send new player position
	 *
	 * @param {Array} positions
	 */
	static requestChangeMemberPos(memberInfo) {
		const pkt = new PACKET.CZ.REQ_CHANGE_MEMBERPOS();
		pkt.memberInfo = memberInfo;

		Network.sendPacket(pkt);
	}

	/**
	 * Send new notice to server
	 *
	 * @param {string} subject
	 * @param {string} content
	 */
	static requestNoticeUpdate(subject, content) {
		const pkt = new PACKET.CZ.GUILD_NOTICE();
		pkt.GDID = GuildEngine.guild_id;
		pkt.subject = subject;
		pkt.notice = content;

		Network.sendPacket(pkt);
	}

	/**
	 * Send an invitation to the player
	 *
	 * @param {number} target account id
	 */
	static requestPlayerInvitation(AID) {
		const entity = EntityManager.get(AID);
		_lastInvited = entity ? entity.display.name : '';

		const pkt = new PACKET.CZ.REQ_JOIN_GUILD();
		pkt.AID = AID;
		pkt.MyAID = Session.AID;
		pkt.MyGID = Session.GID;

		Network.sendPacket(pkt);
	}

	/**
	 * Send an invitation to the player by name
	 *
	 * @param {string} target character name
	 *
	 * @note Sends CZ.REQ_JOIN_GUILD2 (0x916), which is only valid for
	 *   PACKETVER >= 20120131 (length table defines 0x916 from that date).
	 *   Older clients can't invite by name — see REVIEW.md (Packet changes /
	 *   PACKETVER range).
	 */
	static requestPlayerInvitationByName(name) {
		if (PACKETVER.value < 20120131) {
			ChatBox.addText(
				'Guild invite by name requires client 2012-01-31 or newer.',
				ChatBox.TYPE.ERROR,
				ChatBox.FILTER.PUBLIC_LOG
			);
			return;
		}

		_lastInvited = name;

		const pkt = new PACKET.CZ.REQ_JOIN_GUILD2();
		pkt.name = name;

		Network.sendPacket(pkt);
	}

	/**
	 * Send a guild alliance to a target player
	 *
	 * @param {number} target account id
	 */
	static requestAlliance(AID) {
		const pkt = new PACKET.CZ.REQ_ALLY_GUILD();
		pkt.AID = AID;
		pkt.MyAID = Session.AID;
		pkt.MyGID = Session.GID;

		Network.sendPacket(pkt);
	}

	/**
	 * Set a guild as hostile
	 *
	 * @param {number} target account id
	 */
	static requestHostility(AID) {
		const pkt = new PACKET.CZ.REQ_HOSTILE_GUILD();
		pkt.AID = AID;

		Network.sendPacket(pkt);
	}

	/**
	 * Request to leave the guild
	 *
	 * @param {number} account id
	 * @param {number} character id
	 * @param {string} reason for the leave
	 */
	static requestLeave(AID, GID, reason) {
		const pkt = new PACKET.CZ.REQ_LEAVE_GUILD();
		pkt.GDID = GuildEngine.guild_id;
		pkt.AID = AID;
		pkt.GID = GID;
		pkt.reasonDesc = reason;

		Network.sendPacket(pkt);
	}

	/**
	 * Request to expel a member from the guild
	 *
	 * @param {number} account id
	 * @param {number} character id
	 * @param {string} reason to expel
	 */
	static requestMemberExpel(AID, GID, reason) {
		const pkt = new PACKET.CZ.REQ_BAN_GUILD();
		pkt.GDID = GuildEngine.guild_id;
		pkt.AID = AID;
		pkt.GID = GID;
		pkt.reasonDesc = reason;

		Network.sendPacket(pkt);
	}

	/**
	 * Request to get member information
	 *
	 * @param {number} account id
	 */
	static requestMemberInfo(AID) {
		const pkt = new PACKET.CZ.REQ_OPEN_MEMBER_INFO();
		pkt.AID = AID;

		Network.sendPacket(pkt);

		// Not every server answers this one. Name the reason rather than leave
		// the click looking like nothing happened.
		// @see docs/reference/guild/member-info-request.md
		clearTimeout(_memberInfoTimer);
		_memberInfoTimer = setTimeout(() => {
			ChatBox.addText(
				`${DB.getMessage(129, 'View Information')} : the server did not answer.`,
				ChatBox.TYPE.ERROR,
				ChatBox.FILTER.GUILD
			);
		}, 3000);
	}

	/**
	 * Request to delete an ally or antagonist
	 *
	 * @param {number} guild_id
	 * @param {number} relation (0 = Ally, 1 = Enemy)
	 */
	static requestDeleteRelatedGuild(guild_id, relation) {
		const pkt = new PACKET.CZ.REQ_DELETE_RELATED_GUILD();

		pkt.OpponentGDID = guild_id;
		pkt.Relation = relation;
		Network.sendPacket(pkt);
	}

	/**
	 * Send Emblem to server.
	 * Note: it's a hacky way that do not compress the emblem.
	 *
	 * @param {Uint8Array} file
	 * @see docs/reference/guild/emblem-picker.md
	 */
	static sendEmblem(data) {
		if (PACKETVER.value >= 20170315) {
			function getFileType(_data) {
				// "GI" Magic Bytes check (same from src)
				if (_data.length >= 3 && _data[0] === 0x47 && _data[1] === 0x49 && _data[2] === 0x46) {
					return { type: 'image/gif', imgType: 'GIF' };
				}
				return { type: 'image/bmp', imgType: 'BMP' };
			}
			const fileInfo = getFileType(data);
			const formData = new FormData();
			formData.append('GDID', Session.Entity.GUID);
			formData.append('WorldName', Session.ServerName);
			formData.append('AuthToken', Session.WebToken);
			formData.append('AID', Session.AID);
			formData.append('Img', new Blob([data], { type: fileInfo.type }));
			formData.append('ImgType', fileInfo.imgType);

			const xhr = new XMLHttpRequest();

			let webserverAddress = '';
			if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
				webserverAddress = Configs.get('webserverAddress', 'http://127.0.0.1:8888');
			}
			xhr.open('POST', webserverAddress + '/emblem/upload', true);

			xhr.timeout = 5000;
			xhr.onload = () => {
				if (xhr.status !== 200) {
					console.warn('Emblem upload returned non-200 status:', xhr.status);
					return;
				}
				try {
					const response = JSON.parse(xhr.responseText);
					console.log('Emblem uploaded successfully, version:', response.version);

					// The web server only writes the image; it never tells the map
					// server, and the server only listens for this from 20190724.
					// @see docs/reference/guild/emblem-picker.md
					if (PACKETVER.value >= 20190724) {
						const pkt = new PACKET.CZ.REQ_ADD_NEW_EMBLEM();
						pkt.GDID = Session.Entity.GUID;
						pkt.version = response.version;
						Network.sendPacket(pkt);
					}

					GuildEngine.requestGuildEmblem(Session.Entity.GUID, response.version, (image, _gif) => {
						Guild.setEmblem(image);
					});
				} catch (e) {
					console.error('Error parsing emblem upload response:', e);
				}
			};
			xhr.onerror = () => {
				console.warn('Emblem upload failed: web-server unreachable');
			};

			xhr.send(formData);
		} else {
			const len = data.length;
			const out = new BinaryWriter(2 + 1 + 2 + 2 + len + 4);

			// zlib compression
			out.writeUChar(0x78);
			out.writeUChar(0x1);
			out.writeUChar(0x1);
			out.writeUShort(len);
			out.writeUShort(~len & 0xffff);
			out.writeBuffer(data.buffer);
			out.view.setInt32(out.offset, adler32(data), false); // big endian

			// send packet
			const pkt = new PACKET.CZ.REGISTER_GUILD_EMBLEM_IMG();
			pkt.img = out.buffer;
			Network.sendPacket(pkt);
		}
	}
}
function adler32(data) {
	let s1 = 1;
	let s2 = 0;
	for (let i = 0, len = data.length; i < len; i++) {
		s1 = (s1 + data[i]) % 65521;
		s2 = (s2 + s1) % 65521;
	}
	return (s2 << 16) + s1;
}
/**
 * Display entity life
 *
 * @param {object} pkt - PACKET.ZC.NOTIFY_HP_TO_GROUPM
 */
function onMemberTalk(pkt) {
	ChatBox.addText(pkt.msg, ChatBox.TYPE.GUILD, ChatBox.FILTER.GUILD);
}

/**
 * Display guild member position
 *
 * @param {object} pkt - PACKET.ZC.NOTIFY_POSITION_TO_GUILDM
 */
function onMemberMove(pkt) {
	// Server remove mark with "-1" as position
	if (pkt.xPos < 0 || pkt.yPos < 0) {
		MiniMap.removeGuildMemberMark(pkt.AID);
	} else {
		MiniMap.addGuildMemberMark(pkt.AID, pkt.xPos, pkt.yPos);
	}
}

/**
 * Get guild informations
 *
 * @param {object} pkt - PACKET.ZC.GUILD_INFO
 */
function onGuildInfo(pkt) {
	Guild.setGuildInformations(pkt);
}

/**
 * Get guild access to tab
 *
 * @param {object} pkt - PACKET.ZC.ACK_GUILD_MENUINTERFACE
 */
function onGuildAccess(pkt) {
	Guild.setAccess(pkt.guildMemuFlag);
}

/**
 * Get informations about our user in the guild
 *
 * @param {object} pkt - PACKET.ZC.UPDATE_GDID
 */
function onGuildOwnInfo(pkt) {
	if (pkt.GDID === undefined) {
		return;
	}

	GuildEngine.guild_id = pkt.GDID;

	const wasMaster = Session.isGuildMaster;
	// Whether the role we are comparing against was ever told to us, rather than
	// just the value the session starts on.
	const knewRole = Session.hasGuild;

	Session.hasGuild = true;
	Session.guildPermission = pkt.right;
	Session.isGuildMaster = !!pkt.isMaster;

	// Only on a change. This packet is not rare - an emblem change sends it to the
	// whole roster - and the repaint rebuilds the member rows, which would drop a
	// guild master's queued grade edits under them.
	// @see docs/reference/guild/member-view.md
	if (Session.isGuildMaster !== wasMaster) {
		// A real handover only: on the first of these there was no earlier role
		// for the mask to have been answered under.
		if (knewRole) {
			Guild.invalidateAccess();
		}

		Guild.updateMasterView();
	}

	Guild.requestAccessIfUnknown();

	if (pkt.GName) {
		Session.guildName = pkt.GName;
	}

	Session.Entity.GUID = pkt.GDID;
	Session.Entity.GEmblemVer = pkt.emblemVersion;

	if (_pendingGuildSkillRequest) {
		_pendingGuildSkillRequest = false;
		GuildEngine.requestInfo(3);
	}

	// Request emblem for the player's own entity
	if (pkt.GDID && pkt.emblemVersion) {
		GuildEngine.requestGuildEmblem(pkt.GDID, pkt.emblemVersion, (image, gif) => {
			Session.Entity.setEntityGuildEmblem(image, gif);
		});
	}
}

/**
 * Get guild relations (allies / enemies)
 *
 * @param {objec} pkt - PACKET.ZC.MYGUILD_BASIC_INFO
 */
function onGuildRelation(pkt) {
	Guild.setRelations(pkt.relatedGuildList);
}

/**
 * Receving emblem data from a guild
 *
 * @param {object} pkt - PACKET.ZC.GUILD_EMBLEM_IMG
 */
const onGuildEmblem = (function onGuildEmblemClosure() {
	const data = new Uint8Array(2 * 1024);

	return function (pkt) {
		// Create guild namespace if does not exist
		if (!_emblems[pkt.GDID]) {
			_emblems[pkt.GDID] = {
				version: -1,
				image: new Image(),
				gif: null,
				callback: []
			};
		}

		// Uncompress emblem
		const inflate = new Inflate(pkt.img);
		const len = inflate.getBytes(data);
		const src = URL.createObjectURL(new Blob([data.subarray(0, len).buffer], { type: 'image/bmp' }));
		const emblem = _emblems[pkt.GDID];

		// Prepare our emblem image
		const img = new Image();
		img.onload = renderEmblem;
		emblem.version = pkt.emblemVersion;
		img.decoding = 'async';

		// Load the emblem, remove magenta, free blob from memory
		Texture.load(src, function () {
			img.src = this.toDataURL();
		});

		// Start displaying the emblem
		function renderEmblem() {
			emblem.image = this;
			emblem.gif = null;

			// Update our guild emblem
			if (pkt.GDID === GuildEngine.guild_id) {
				Guild.setEmblem(this);
			}

			// Execute callbacks
			while (emblem.callback.length) {
				emblem.callback.shift().call(null, this, null);
			}

			// Update display name of entities
			EntityManager.forEach(entity => {
				if (entity.GUID === pkt.GDID) {
					entity.setEntityGuildEmblem(img);
				}
			});
		}
	};
})();

/**
 * A guild changed its emblem - fetch the new one for everyone wearing it
 *
 * Sent to everyone in range, so it arrives for other guilds too. The request
 * repaints every entity of that guild.
 * @see docs/reference/guild/emblem-picker.md
 *
 * @param {object} pkt - PACKET.ZC.CHANGE_GUILD | PACKET.ZC.CHANGE_GUILD2
 */
function onGuildEmblemChanged(pkt) {
	if (!pkt.GDID || !pkt.emblemVersion) {
		return;
	}

	// The server sends this once per entity of that guild in range, so the same
	// version arrives many times over. The request only stops repeating once the
	// image has decoded, which is far too late to hold off a burst.
	if (_emblemNotified[pkt.GDID] === pkt.emblemVersion) {
		return;
	}
	_emblemNotified[pkt.GDID] = pkt.emblemVersion;

	const isOwnGuild = pkt.GDID === Session.Entity.GUID;
	if (isOwnGuild) {
		Session.Entity.GEmblemVer = pkt.emblemVersion;
	}

	// The fetch repaints the entities on the map by itself. An open window is a
	// separate surface and has to be told, or it keeps the old emblem until
	// something else happens to rebuild the Info tab. Our own guild only: another
	// guild's emblem arriving would otherwise land in our own tab.
	// @see docs/reference/guild/emblem-picker.md
	GuildEngine.requestGuildEmblem(
		pkt.GDID,
		pkt.emblemVersion,
		image => {
			if (isOwnGuild) {
				Guild.setEmblem(image);
			}
		},
		// The mark above means "asked for", not "have". A fetch that gave up
		// leaves nothing painted, so holding the mark would refuse every later
		// broadcast of that version and freeze the emblem until the next one.
		// Only this version's own mark is released: a slower fetch for an older
		// one must not hand back a newer version's, which is being waited on or
		// already painted.
		() => {
			if (_emblemNotified[pkt.GDID] === pkt.emblemVersion) {
				delete _emblemNotified[pkt.GDID];
			}
		}
	);
}

/**
 * Get guild members informations
 *
 * @param {object} pkt - PACKET.ZC.MEMBERMGR_INFO
 */
function onGuildMembers(pkt) {
	// Only the oldest list carries a note, and only the later ones a last
	// login. The column shown follows the packet.
	Guild.setMembers(pkt.memberInfo, pkt instanceof PACKET.ZC.MEMBERMGR_INFO);
}

/**
 * Update guild positions
 *
 * @param {object} pkt - PACKET.ZC.POSITION_INFO | PACKET.ZC.ACK_CHANGE_GUILD_POSITIONINFO
 */
function onGuildPositions(pkt) {
	let erase = false;
	let list;

	if (pkt instanceof PACKET.ZC.POSITION_INFO) {
		list = pkt.memberInfo;
		erase = true;
	} else {
		list = pkt.memberList;
	}

	Guild.setPositions(list, erase);
}

/**
 * Update guild position names
 *
 * @param {object} pkt - PACKET.ZC.POSITION_ID_NAME_INFO
 */
function onGuildPositionsName(pkt) {
	Guild.setPositionsName(pkt.memberList);
}

/**
 * A server did answer the member info request
 *
 * There is no window to show it in yet, but the answer is what tells us the
 * request is supported, so the timer waiting on it has to be called off.
 *
 * @param {object} pkt - PACKET.ZC.ACK_OPEN_MEMBER_INFO
 */
function onGuildMemberInfo() {
	clearTimeout(_memberInfoTimer);
}

/**
 * Update a guild member
 *
 * @param {object} pkt - PACKET.ZC.ACK_GUILD_MEMBER_INFO
 */
function onGuildMemberUpdate(pkt) {
	Guild.setMember(pkt.Info);
}

/**
 * Update member ranks
 *
 * @param {object} pkt - PACKET.ZC.ACK_REQ_CHANGE_MEMBERS
 */
function onGuildMemberPositionUpdate(pkt) {
	Guild.setMemberPositions(pkt.memberInfo);
}

/**
 * List of guild skills
 *
 * @param {object} pkt - PACKET_ZC_GUILD_SKILLINFO
 */
function onGuildSkillList(pkt) {
	Guild.setPoints(pkt.skillPoint);
	Guild.setSkills(pkt.skillList);
}

/**
 * Display guild notice
 *
 * @param {object} pkt - PACKET.ZC.GUILD_NOTICE
 */
function onGuildNotice(pkt) {
	// The window keeps the notice either way - only the chat echo is the
	// player's to silence, behind the same /li flag as the login lines.
	// @see docs/reference/guild/login-announcements.md
	if (UIPreferences.li) {
		ChatBox.addText('[ ' + pkt.subject + ' ]', ChatBox.TYPE.GUILD, ChatBox.FILTER.GUILD, '#FFFF63');
		ChatBox.addText('[ ' + pkt.notice + ' ]', ChatBox.TYPE.GUILD, ChatBox.FILTER.GUILD, '#FFFF63');
	}

	Guild.setNotice(pkt.subject, pkt.notice);
}

/**
 * Get the ban list from server
 *
 * @param {object} pkt - PACKET.ZC.BAN_LIST
 */
function onGuildExpelList(pkt) {
	Guild.setExpelList(pkt.banList);
}

/**
 * Creation response from server
 *
 * @param {object} pkt - PACKET.ZC.RESULT_MAKE_GUILD
 */
function onGuildCreationResult(pkt) {
	const createFailed = message => {
		ChatBox.addText(message, ChatBox.TYPE.ERROR, ChatBox.FILTER.GUILD);
		UIManager.showMessageBox(message, 'ok');
	};

	switch (pkt.result) {
		case 0: // Success
			Session.hasGuild = true;
			ChatBox.addText(DB.getMessage(374), ChatBox.TYPE.BLUE, ChatBox.FILTER.GUILD);
			Guild.show();
			break;

		case 1: // You are already in a Guild.#
			createFailed(DB.getMessage(375, 'You are already in a Guild.'));
			break;

		case 2: // That Guild Name already exists.
			createFailed(DB.getMessage(376, 'That Guild Name already exists.'));
			break;

		case 3: // You need the neccessary item to create a Guild.
			createFailed(DB.getMessage(405, 'You need the necessary item to create a Guild.'));
			break;
	}
}

/**
 * Notify of the result of breaking a guild
 *
 * @param {object} pkt - PACKET.ZC.ACK_DISORGANIZE_GUILD_RESULT
 */
function onGuildDestroy(pkt) {
	const fail = message => {
		ChatBox.addText(message, ChatBox.TYPE.ERROR, ChatBox.FILTER.GUILD);
		UIManager.showMessageBox(message, 'ok', () => {
			GuildCompanion.closeDisband();
		});
	};

	switch (pkt.reason) {
		case 0: // success
			GuildCompanion.closeDisband();
			Guild.hide();
			Session.hasGuild = false;
			Session.guildName = '';
			Session.isGuildMaster = false;
			Session.guildPermission = 0;
			Session.Entity.GUID = 0;
			// After the flags, never before: the window is a singleton and reset
			// repaints from them.
			// @see docs/reference/guild/member-view.md
			Guild.reset();
			ChatBox.addText(DB.getMessage(400), ChatBox.TYPE.BLUE, ChatBox.FILTER.GUILD);
			break;

		case 1: // invalid guild name
			fail(DB.getMessage(401, 'You have failed to disband the guild.'));
			break;

		case 2: // still members on the guild
			fail(DB.getMessage(402, 'There are still members in the guild.'));
			break;
	}
}

/**
 * A player want us to join a guild
 *
 * @param {object} PACKET.ZC.REQ_JOIN_GUILD
 */
function onGuildInviteRequest(pkt) {
	const guild_id = pkt.GDID;

	function answer(result) {
		return () => {
			const _pkt = new PACKET.CZ.JOIN_GUILD();
			_pkt.GDID = guild_id;
			_pkt.answer = result;

			Network.sendPacket(_pkt);
		};
	}

	UIManager.showPromptBox('(' + pkt.guildName + ') ' + DB.getMessage(377), 'ok', 'cancel', answer(1), answer(0));
}

/**
 * One line of the invitation result, with the invited character's name
 * substituted if the message table asked for one.
 *
 * A no-op on the stock tables, none of whose strings carry a `%s`.
 * @see docs/reference/guild/invitation-ack.md
 *
 * @param {number} id - message table id
 * @param {string} defaultText - used when the table has no such id
 * @param {number} type - ChatBox.TYPE
 */
function addInviteResult(id, defaultText, type) {
	// No-op on a string without one, which is every stock table.
	const text = DB.getMessage(id, defaultText).replace('%s', _lastInvited || DB.getMessage(581, 'Nameless'));

	// The name answers one ack and is then spent. The server drops some invites
	// without replying at all, so a name kept past its own answer would end up
	// on somebody else's.
	_lastInvited = '';

	ChatBox.addText(text, type, ChatBox.FILTER.GUILD);
}

/**
 * Result from a guild invitation
 *
 * @param {object} pkt - PACKET.ZC.ACK_REQ_JOIN_GUILD
 */
function onGuildInviteResult(pkt) {
	switch (pkt.answer) {
		case 0: // Already in guild.
			addInviteResult(378, 'He/She is already in a Guild.', ChatBox.TYPE.ERROR);
			break;

		case 1: // Offer rejected.
			addInviteResult(379, 'You have refused the guild invitation.', ChatBox.TYPE.ERROR);
			break;

		case 2: // Offer accepted.
			addInviteResult(380, 'You have accepted the guild invitation.', ChatBox.TYPE.BLUE);
			break;

		case 3: // Guild full.
			addInviteResult(381, 'Your Guild is full.', ChatBox.TYPE.ERROR);
			break;
	}
}

/**
 * Get member status (online/offline)
 *
 * @param {object} pkt - PACKET.ZC.UPDATE_CHARSTAT
 */
function onGuildMemberStatus(pkt) {
	Guild.updateMemberStatus(pkt);
}

/**
 * Announce a member's departure, and empty the window when it is ours
 *
 * The server sends nothing else that would take the window down, so this is
 * where it happens.
 *
 * @param {string} charName - who left
 * @param {string} reasonDesc - the reason the server gave
 * @param {boolean} isSelf - whether the member who left is us
 * @param {number} announceID - message for the departure line
 * @param {number} reasonID - message for the reason line
 */
function reportDeparture(charName, reasonDesc, isSelf, announceID, reasonID) {
	ChatBox.addText(
		DB.getMessage(announceID).replace('%s', charName),
		ChatBox.TYPE.GUILD,
		ChatBox.FILTER.GUILD,
		'#FFFF00'
	);
	ChatBox.addText(
		DB.getMessage(reasonID).replace('%s', reasonDesc),
		ChatBox.TYPE.GUILD,
		ChatBox.FILTER.GUILD,
		'#FFFF00'
	);

	if (!isSelf) {
		return;
	}

	Guild.hide();
	Session.hasGuild = false;
	Session.guildName = '';
	Session.isGuildMaster = false;
	Session.guildPermission = 0;
	Session.Entity.GUID = 0;
	Guild.reset();
}

/**
 * Event occured when a player got expel from the guild
 *
 * @param {object} pkt - PACKET.ZC.ACK_BAN_GUILD | PACKET.ZC.ACK_BAN_GUILD_SSO
 */
function onGuildMemberExpulsion(pkt) {
	// %s has been expelled from our guild.
	// Expulsion Reason: %s
	reportDeparture(pkt.charName, pkt.reasonDesc, pkt.charName === Session.Entity.display.name, 370, 371);
}

/**
 * Event occured when a player left the guild
 *
 * @param {object} pkt - PACKET.ZC.ACK_LEAVE_GUILD
 */
function onGuildMemberLeave(pkt) {
	// %s has withdrawn from the guild
	// Secession Reason: %s
	reportDeparture(pkt.charName, pkt.reasonDesc, pkt.charName === Session.Entity.display.name, 364, 365);
}

/**
 * The same two departures, from the era that sends a character id and no name
 *
 * Session.GID is the character id; Session.Entity.GID is the account's, and
 * matching on that one would never fire.
 * @see docs/reference/guild/member-view.md
 *
 * @param {object} pkt - PACKET.ZC.ACK_BAN_GUILD_DELNAME
 */
function onGuildMemberExpulsionByID(pkt) {
	reportDeparture(Guild.getMemberName(pkt.GID), pkt.reasonDesc, pkt.GID === Session.GID, 370, 371);
}

/**
 * @param {object} pkt - PACKET.ZC.ACK_LEAVE_GUILD_DELNAME
 */
function onGuildMemberLeaveByID(pkt) {
	reportDeparture(Guild.getMemberName(pkt.GID), pkt.reasonDesc, pkt.GID === Session.GID, 364, 365);
}

/**
 * Remove guild relation
 *
 * @param {object} pkt - PACKET.ZC.DELETE_RELATED_GUILD
 */
function onGuildAllianceDeleteAck(pkt) {
	Guild.removeRelation(pkt.OpponentGDID, pkt.Relation);
}

/**
 * Add an ally/antagonist guild to the list
 *
 * @param {object} pkt - PACKET.ZC.ADD_RELATED_GUILD
 */
function onGuildAllianceAdd(pkt) {
	Guild.addRelation(pkt.Info);
}

/**
 * A guild ask for an alliance
 *
 * @param {object} pkt - PACKET.ZC.REQ_ALLY_GUILD
 */
function onGuildAskForAlliance(pkt) {
	const AID = pkt.otherAID;

	function answer(result) {
		return () => {
			const _pkt = new PACKET.CZ.ALLY_GUILD();
			_pkt.otherAID = AID;
			_pkt.answer = result;

			Network.sendPacket(_pkt);
		};
	}

	// Guild is asking you to agree to an Alliance with them. Do you accept?#
	UIManager.showPromptBox('(' + pkt.guildName + ') ' + DB.getMessage(393), 'ok', 'cancel', answer(1), answer(0));
}

/**
 * Answer from player about guild alliance
 *
 * @param {object} pkt - PACKET.ZC.ACK_REQ_ALLY_GUILD
 */
function onGuildAllianceResult(pkt) {
	switch (pkt.answer) {
		case 0: // Already allied.
			ChatBox.addText(DB.getMessage(394), ChatBox.TYPE.ERROR, ChatBox.FILTER.GUILD);
			break;

		case 1: // You rejected the offer.
			ChatBox.addText(DB.getMessage(395), ChatBox.TYPE.ERROR, ChatBox.FILTER.GUILD);
			break;

		case 2: // You accepted the offer.
			ChatBox.addText(DB.getMessage(396), ChatBox.TYPE.BLUE, ChatBox.FILTER.GUILD);
			break;

		case 3: // They have too any alliances.
			ChatBox.addText(DB.getMessage(397), ChatBox.TYPE.ERROR, ChatBox.FILTER.GUILD);
			break;

		case 4: // You have too many alliances.
			ChatBox.addText(DB.getMessage(398), ChatBox.TYPE.ERROR, ChatBox.FILTER.GUILD);
			break;

		case 5: // Alliances are disabled.
			ChatBox.addText(DB.getMessage(1717), ChatBox.TYPE.ERROR, ChatBox.FILTER.GUILD);
			break;
	}
}

/**
 * Result of hostility
 *
 * @param {object} pkt - PACKET.ZC.ACK_REQ_HOSTILE_GUILD
 */
function onGuildHostilityResult(pkt) {
	switch (pkt.result) {
		case 0: // Antagonist has been set.
			ChatBox.addText(DB.getMessage(495), ChatBox.TYPE.BLUE, ChatBox.FILTER.GUILD);
			break;

		case 1: // Guild has too many Antagonists.
			ChatBox.addText(DB.getMessage(496), ChatBox.TYPE.ERROR, ChatBox.FILTER.GUILD);
			break;

		case 2: // Already set as an Antagonist.
			ChatBox.addText(DB.getMessage(497), ChatBox.TYPE.ERROR, ChatBox.FILTER.GUILD);
			break;

		case 3: // Antagonists are disabled.
			ChatBox.addText(DB.getMessage(1718), ChatBox.TYPE.ERROR, ChatBox.FILTER.GUILD);
			break;
	}
}

function onGuildCastleInfo(pkt) {
	// TODO: what is castle list?
}

/**
 * Initialize
 */
export default GuildEngine;
