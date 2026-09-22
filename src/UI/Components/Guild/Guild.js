/**
 * UI/Components/Guild/Guild.js
 *
 * Chararacter Guild
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author @vthibault, @Javierlog08, @scriptord3
 */

import DB from 'DB/DBManager.js';
import SkillInfo from 'DB/Skills/SkillInfo.js';
import KEYS from 'Controls/KeyEventHandler.js';
import MonsterTable from 'DB/Monsters/MonsterTable.js';
import Session from 'Engine/SessionStorage.js';
import Entity from 'Renderer/Entity/Entity.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import Camera from 'Renderer/Camera.js';
import Renderer from 'Renderer/Renderer.js';
import Client from 'Core/Client.js';
import PACKETVER from 'Network/PacketVerManager.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import 'UI/Elements/Elements.js';
import ContextMenu from 'UI/Components/ContextMenu/ContextMenu.js';
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';
import InputBox from 'UI/Components/InputBox/InputBox.js';
import GuildCompanion from 'UI/Components/GuildCompanion/GuildCompanion.js';
import SkillTargetSelection from 'UI/Components/SkillTargetSelection/SkillTargetSelection.js';
import SkillDescription from 'UI/Components/SkillDescription/SkillDescription.js';
import htmlText from './Guild.html?raw';
import cssText from './Guild.css?raw';
import WinStats from 'UI/Components/WinStats/WinStats.js';

/**
 * Flags to check access
 */
const AccessTypeBit = {
	0: 0x00,
	1: 0x01,
	2: 0x02,
	3: 0x04,
	4: 0x10,
	5: 0x40,
	6: 0x80
};

/**
 * Create Component
 */
const Guild = new GUIComponent('Guild', cssText);
Guild.render = () => htmlText;

/**
 * View templates (stored as DOM nodes)
 */
let _memberViewTemplate, _positionViewTemplate, _expelViewTemplate;

const _positions = [];
const _members = [];
const _skills = [];

/**
 * Grade changes queued by the member dropdown, keyed by GID so that
 * re-editing a member overwrites its pending value instead of appending.
 * Flushed on Apply, dropped whenever fresh guild data arrives.
 */
let _pendingPositions = {};

/**
 * The position rows are their own edit buffer - Apply reads them back out of
 * the DOM. Once an edit is in them, a server update must not repaint over it.
 */
let _positionsDirty = false;

/**
 * Which row carries the highlight. The client writes this from its own mouse
 * hit-tests and from building the window, never from a packet, so a refresh
 * leaves the bar where the guild master put it.
 */
let _positionsSelected = 0;

/**
 * GUILD_PERM_STORAGE exists from PACKETVER 20140205 on, and only then does the
 * tab draw a column for it. Below that the bit is preserved but never touched.
 */
const GUILD_PERM_STORAGE = 0x100;

function _hasStorageColumn() {
	// Read it late, never cached: init() runs at import, and the packetver is
	// only settled at login - and is the string 'auto' until then.
	return parseInt(PACKETVER.value, 10) >= 20140205;
}

let _btnIncSkillTemplate;
let _skpoints = 0;
let _btnLevelUp;
let lArrow, rArrow;
let _totalExp = 0;
let _guildAccess = 0;
let _checkbox_off, _checkbox_on;

/**
 * Helper: query inside shadow root
 */
function _root(comp) {
	return comp.getRoot();
}

/**
 * Helper: drop the queued grade changes
 */
function _clearPendingPositions() {
	_pendingPositions = {};
}

/**
 * Helper: reveal the Apply button, the affordance for a pending change
 */
function _showApplyButton() {
	const btnOk = _root(Guild).querySelector('.footer .btn_ok');
	if (btnOk) {
		btnOk.style.display = 'block';
	}
}

/**
 * Helper: the last login date, built from the client's own format string
 *
 * The client hands msgstring 3011 to strftime, and the tables do not all ask
 * for the same thing - the compiled default is %Y.%m.%d, the iRO table ships
 * %y.%m.%d. Only the fields those use are substituted; anything else is left
 * as it is rather than guessed at.
 *
 * @param {number} timestamp - seconds since epoch, as the member list sends it
 * @return {string} the date, localtime, like the client shows it
 */
function _formatLastLogin(timestamp) {
	const date = new Date(timestamp * 1000);
	const pad = value => `${value}`.padStart(2, '0');

	return DB.getMessage(3011, '%Y.%m.%d')
		.replace('%Y', date.getFullYear())
		.replace('%y', pad(date.getFullYear() % 100))
		.replace('%m', pad(date.getMonth() + 1))
		.replace('%d', pad(date.getDate()));
}

/**
 * Helper: escape HTML
 */
function _escapeHTML(text) {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

/**
 * Initialize component
 */
Guild.init = function init() {
	const root = _root(this);

	// Extract templates
	_memberViewTemplate = root.querySelector('.MemberView');
	if (_memberViewTemplate) {
		_memberViewTemplate.remove();
	}
	_positionViewTemplate = root.querySelector('.PositionView');
	if (_positionViewTemplate) {
		_positionViewTemplate.remove();
	}
	_expelViewTemplate = root.querySelector('.ExpelView');
	if (_expelViewTemplate) {
		_expelViewTemplate.remove();
	}

	// Close button
	const closeBtn = root.querySelector('.close');
	if (closeBtn) {
		closeBtn.addEventListener('mousedown', e => e.stopImmediatePropagation());
		closeBtn.addEventListener('click', () => Guild.toggle());
	}

	// Tab buttons
	const tabsContainer = root.querySelector('.tabs');
	if (tabsContainer) {
		tabsContainer.addEventListener('click', e => {
			const btn = e.target.closest('button');
			if (btn) {
				onChangeTab.call(btn, e);
			}
		});
	}

	// Preload checkbox images
	Client.loadFiles([`${DB.INTERFACE_PATH}checkbox_0.bmp`, `${DB.INTERFACE_PATH}checkbox_1.bmp`], (off, on) => {
		_checkbox_off = off;
		_checkbox_on = on;
	});

	// Positions
	const posBody = root.querySelector('.content.positions tbody');
	if (posBody) {
		posBody.addEventListener('mousedown', e => {
			const input = e.target.closest('input');
			if (input && !Session.isGuildMaster) {
				e.preventDefault();
			}

			const tr = e.target.closest('tr');
			if (tr) {
				const rows = [...posBody.querySelectorAll('tr')];
				for (const row of rows) {
					row.classList.remove('active');
				}
				tr.classList.add('active');
				_positionsSelected = rows.indexOf(tr);
			}
		});

		posBody.addEventListener(
			'focus',
			e => {
				if (e.target.matches('input')) {
					_positionsDirty = true;
					const btnOk = root.querySelector('.footer .btn_ok');
					if (btnOk) {
						btnOk.style.display = 'block';
					}
					e.target.select();
				}
			},
			true
		);

		posBody.addEventListener('click', e => {
			const box = e.target.closest('.checkbox');
			if (box && Session.isGuildMaster) {
				// Read the state before clearing it, or the test below never sees
				// an `on` and the box only ever ticks.
				const isOn = !box.classList.contains('on');
				box.className = box.className.replace(/\b(on|off)\b/g, '').trim();
				box.classList.add(isOn ? 'on' : 'off');
				box.style.backgroundImage = `url(${isOn ? _checkbox_on : _checkbox_off})`;
				_positionsDirty = true;
				const btnOk = root.querySelector('.footer .btn_ok');
				if (btnOk) {
					btnOk.style.display = 'block';
				}
			}
		});
	}

	// Antagonist/Ally context menu
	const allyHostileContainer = root.querySelector('.content.info');
	if (allyHostileContainer) {
		const lists = allyHostileContainer.querySelectorAll('.ally_list, .hostile_list');
		for (const list of lists) {
			list.addEventListener('contextmenu', e => {
				const div = e.target.closest('div');
				if (!div) {
					return;
				}
				const relation = div.parentNode.classList.contains('ally_list') ? 0 : 1;
				const guildId = parseInt(div.getAttribute('data-guild-id'), 10);

				for (const d of allyHostileContainer.querySelectorAll('.ally_list div, .hostile_list div')) {
					d.classList.remove('active');
				}
				div.classList.add('active');

				ContextMenu.remove();
				ContextMenu.append();
				ContextMenu.addElement(DB.getMessage(351), () => {
					Guild.onRequestDeleteRelation(guildId, relation);
				});
			});
		}
	}

	// Members
	const membersBody = root.querySelector('.content.members tbody');
	if (membersBody) {
		membersBody.addEventListener('mousedown', e => {
			const tr = e.target.closest('tr');
			if (tr) {
				for (const row of membersBody.querySelectorAll('tr')) {
					row.classList.remove('active');
				}
				tr.classList.add('active');
			}
		});

		membersBody.addEventListener('contextmenu', e => {
			const td = e.target.closest('td.name');
			if (!td) {
				return;
			}
			const tr = td.parentNode;
			const index = tr.getAttribute('data-index');
			const member = _members[index];
			const isSelf = member.AID === Session.AID && member.GID === Session.GID;

			ContextMenu.remove();
			ContextMenu.append();

			ContextMenu.addElement(DB.getMessage(129), () => {
				Guild.onRequestMemberInfo(member.AID);
			});

			if (isSelf && !Session.isGuildMaster) {
				ContextMenu.addElement(DB.getMessage(508), () => {
					InputBox.append();
					InputBox.setType('text');
					const textEl = (_root(InputBox) || InputBox.ui?.[0])?.querySelector?.('.text');
					if (textEl) {
						textEl.textContent = DB.getMessage(523);
					} else {
						InputBox.ui.find('.text').text(DB.getMessage(523));
					}
					InputBox.onSubmitRequest = reason => {
						InputBox.remove();
						Guild.onRequestLeave(member.AID, member.GID, reason);
					};
				});
			}

			if (Session.isGuildMaster && !isSelf) {
				ContextMenu.addElement(DB.getMessage(2923, 'Assign Guild Leader'), () => {
					// The message takes two placeholders: the member taking over,
					// and the grade we are left with. The server swaps the two
					// rows, so that is the grade the member holds right now.
					const grade = _positions[member.GPositionID];
					const text = DB.getMessage(
						2924,
						'Are you sure you want to assign %s as guild leader? After assigning your position will become %s'
					)
						.replace('%s', member.CharName || DB.getMessage(581, 'Nameless'))
						.replace('%s', grade && grade.posName ? grade.posName : '');

					UIManager.showPromptBox(text, 'ok', 'cancel', () => {
						Guild.onChangeMemberPosRequest([{ AID: member.AID, GID: member.GID, positionID: 0 }]);
					});
				});
			}

			if (Session.guildRight & 0x10 && !isSelf) {
				ContextMenu.addElement(DB.getMessage(509), () => {
					InputBox.append();
					InputBox.setType('text');
					const textEl = (_root(InputBox) || InputBox.ui?.[0])?.querySelector?.('.text');
					if (textEl) {
						textEl.textContent = DB.getMessage(524);
					} else {
						InputBox.ui.find('.text').text(DB.getMessage(524));
					}
					InputBox.onSubmitRequest = reason => {
						InputBox.remove();
						Guild.onRequestMemberExpel(member.AID, member.GID, reason);
					};
				});
			}
		});
	}

	// Skills — get level up button template
	const levelupBtn = root.querySelector('.btn.levelup');
	if (levelupBtn) {
		_btnIncSkillTemplate = levelupBtn.cloneNode(true);
		levelupBtn.remove();
		_btnIncSkillTemplate.addEventListener('click', function () {
			onRequestSkillUp.call(this);
		});
	}

	// Level up notification button
	const lvlupBtn = root.querySelector('#lvlup_job');
	if (lvlupBtn) {
		_btnLevelUp = lvlupBtn;
		_btnLevelUp.remove();
		_btnLevelUp.addEventListener('click', () => {
			if (_btnLevelUp.parentNode) {
				_btnLevelUp.remove();
			}
			Guild.ui.show();
		});
		_btnLevelUp.addEventListener('mousedown', e => e.stopImmediatePropagation());
	}

	// Bind skill events on container (delegated)
	const container = root.querySelector('#Guild') || root;
	container.addEventListener('dblclick', e => {
		const target = e.target.closest('.skill .icon, .skill .name');
		if (target) {
			onRequestUseSkill.call(target);
		}
	});
	container.addEventListener('contextmenu', e => {
		const target = e.target.closest('.skill .icon, .skill .name');
		if (target) {
			onRequestSkillInfo.call(target);
		}
	});
	container.addEventListener('mousedown', e => {
		const target = e.target.closest('.selectable');
		if (target && target.closest('.content.skills')) {
			onSkillFocus.call(target);
		}
	});

	// Drag events for skills
	container.addEventListener('dragstart', e => {
		const target = e.target.closest('.skill');
		if (target && target.closest('.content.skills')) {
			onSkillDragStart.call(target, e);
		}
	});
	container.addEventListener('dragend', e => {
		const target = e.target.closest('.skill');
		if (target && target.closest('.content.skills')) {
			onSkillDragEnd.call(target);
		}
	});

	// Notice
	const noticeContent = root.querySelector('.content.notice');
	if (noticeContent) {
		noticeContent.addEventListener(
			'focus',
			e => {
				if (e.target.matches('textarea, input')) {
					const btnOk = root.querySelector('.footer .btn_ok');
					if (btnOk) {
						btnOk.style.display = 'block';
					}
				}
			},
			true
		);
	}

	// Upload emblem
	const emblemInput = root.querySelector('.content.info .emblem_edit input');
	if (emblemInput) {
		emblemInput.addEventListener('change', function () {
			const file = this.files[0];
			if (!file) {
				return;
			}

			const isBmp = /^image\/(bmp|x-bmp|x-ms-bmp|x-windows-bmp)$/.test(file.type) || /\.bmp$/i.test(file.name);
			const isGif = file.type === 'image/gif' || /\.gif$/i.test(file.name);

			if ((isBmp && file.size <= 1783) || (isGif && file.size <= 50000)) {
				const reader = new FileReader();
				reader.onload = e => {
					Guild.onSendEmblem(new Uint8Array(e.target.result));
				};
				reader.readAsArrayBuffer(this.files[0]);
			} else {
				console.warn(
					'[Warning] Incorrect emblem file type. Only BMP, 24bit or lower is accepted or GIFs max size 50Kb or lower.'
				);
			}
		});
	}

	// Footer OK button
	const footerOk = root.querySelector('.footer .btn_ok');
	if (footerOk) {
		footerOk.addEventListener('click', () => onValidate());
	}

	this.draggable('.titlebar');
	this.ui.hide();

	Client.loadFile(`${DB.INTERFACE_PATH}basic_interface/arw_right.bmp`, data => {
		rArrow = `url(${data})`;
	});
	Client.loadFile(`${DB.INTERFACE_PATH}basic_interface/arw_left.bmp`, data => {
		lArrow = `url(${data})`;
	});

	renderTendency(0, 0);
};

/**
 * Removing guild, stop rendering
 */
Guild.onRemove = function onRemove() {
	Renderer.stop(renderMemberFaces);
	_positionsDirty = false;
	_positionsSelected = 0;
};

Guild.onShortCut = function onShortCut(key) {
	if (key.cmd === 'TOGGLE') {
		this.toggle();
	}
};

Guild.toggle = function onToggle() {
	if (!Session.hasGuild) {
		Guild.promptCreateGuild();
		return;
	}

	if (this.ui.is(':visible')) {
		this.hide();
		if (_btnLevelUp && _btnLevelUp.parentNode) {
			_btnLevelUp.remove();
		}
	} else {
		this.show();
	}
};

Guild.onKeyDown = function onKeyDown(event) {
	if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this.ui.is(':visible')) {
		this.toggle();
	}
};

Guild.show = function show() {
	this.focus();

	if (this.ui.is(':visible')) {
		return;
	}

	this.ui.show();
	const root = _root(this);

	if (!root.querySelector('.tabs .active')) {
		const infoBtn = root.querySelector('.tabs .info');
		if (infoBtn) {
			infoBtn.click();
		}
		Guild.onRequestAccess();
	}

	const membersContent = root.querySelector('.content.members');
	if (membersContent && membersContent.style.display !== 'none') {
		Renderer.render(renderMemberFaces);
	}
};

Guild.hide = function hide() {
	this.ui.hide();
	Renderer.stop(renderMemberFaces);
};

Guild.setGuildInformations = function setGuildInformations(info) {
	const root = _root(this);
	const general = root.querySelector('.content.info');
	if (!general) {
		return;
	}

	general.querySelector('.name .value').textContent = info.guildname;
	general.querySelector('.level .value').textContent = info.level;
	general.querySelector('.master .value').textContent = info.masterName;
	general.querySelector('.members .online').textContent = info.userNum;
	general.querySelector('.members .maxMember').textContent = info.maxUserNum;
	general.querySelector('.avglevel .value').textContent = info.userAverageLevel;
	general.querySelector('.territory .value').textContent = info.manageLand;
	general.querySelector('.exp .value').textContent = info.exp;
	general.querySelector('.tax .value').textContent = info.point;

	Guild.updateSession(info);
	Guild.onRequestGuildEmblem(info.GDID, info.emblemVersion, Guild.setEmblem.bind(this));

	const emblemEdit = general.querySelector('.emblem_edit');
	if (emblemEdit) {
		emblemEdit.style.display = Session.isGuildMaster ? '' : 'none';
	}

	updateDisbandButton(root, getActiveTab(root));
	updateSkillPoints(root, getActiveTab(root));

	WinStats.getUI().update('guildname', info.guildname);

	renderTendency(info.honor, info.virtue);
};

Guild.setEmblem = function setEmblem(image) {
	const root = _root(this);
	const el = root.querySelector('.content.info .emblem_container');
	if (el) {
		el.style.backgroundImage = `url(${image.src})`;
	}
};

Guild.setRelations = function setRelations(guilds) {
	const root = _root(this);
	const allyList = root.querySelector('.ally_list');
	const hostileList = root.querySelector('.hostile_list');
	if (allyList) {
		allyList.innerHTML = '';
	}
	if (hostileList) {
		hostileList.innerHTML = '';
	}

	for (let i = 0, count = guilds.length; i < count; ++i) {
		this.addRelation(guilds[i]);
	}
};

Guild.addRelation = function addRelation(guild) {
	const root = _root(this);
	const list = root.querySelector(`.${guild.relation === 0 ? 'ally' : 'hostile'}_list`);
	if (!list) {
		return;
	}
	const div = document.createElement('div');
	div.setAttribute('data-guild-id', guild.GDID);
	div.textContent = guild.guildName;
	list.appendChild(div);
};

Guild.removeRelation = function removeRelation(guildId, relation) {
	const root = _root(this);
	const list = root.querySelector(`.content.info .${relation === 0 ? 'ally' : 'hostile'}_list`);
	if (!list) {
		return;
	}
	const el = list.querySelector(`div[data-guild-id="${guildId}"]`);
	if (el) {
		el.remove();
	}
};

Guild.setMembers = function setMembers(members, hasMemo) {
	let online = 0;
	const count = members.length;
	_members.length = 0;
	_totalExp = 0;

	_clearPendingPositions();

	const root = _root(this);

	// The 0x0154 list carries a note and no last login, the later ones the
	// other way round. Show the column the wire actually feeds, which is what
	// the client of each era does.
	const membersContent = root.querySelector('.content.members');
	if (membersContent) {
		membersContent.classList.toggle('has-memo', !!hasMemo);
	}

	const tbody = root.querySelector('.content.members tbody');
	if (tbody) {
		tbody.innerHTML = '';
	}

	for (let i = 0; i < count; ++i) {
		_totalExp += members[i].MemberExp;
		online += members[i].CurrentState ? 1 : 0;
	}

	const numMember = root.querySelector('.content.info .members .numMember');
	if (numMember) {
		numMember.textContent = count;
	}
	const onlineEl = root.querySelector('.content.info .members .online');
	if (onlineEl) {
		onlineEl.textContent = online;
	}

	for (let i = 0; i < count; ++i) {
		this.setMember(members[i]);
	}

	renderMemberFaces(Renderer.tick + 1000);
};

Guild.setMember = function setMember(member) {
	let i, count;
	const root = _root(this);

	for (i = 0, count = _members.length; i < count; ++i) {
		if (_members[i].AID === member.AID && _members[i].GID === member.GID) {
			break;
		}
	}

	let view;

	if (i < count) {
		view = root.querySelector(`.MemberView[data-index="${i}"]`);

		// The row is rendered from this object and read back from the list, by
		// the grade guard and by the context menu. Keep the two in step.
		_members[i] = member;
	} else {
		view = _memberViewTemplate.cloneNode(true);
		const tbody = root.querySelector('.content.members tbody');
		if (tbody) {
			tbody.appendChild(view);
		}
		_members.push(member);
	}

	if (member.CurrentState) {
		view.classList.add('online');
	}

	view.setAttribute('data-index', i);
	// The 0x0aa5 list carries no character name at all, and the client falls
	// back to a placeholder rather than leaving the column blank.
	const displayName = member.CharName || DB.getMessage(581, 'Nameless');

	const nameValue = view.querySelector('.name .value');
	if (nameValue) {
		nameValue.textContent = displayName;
		nameValue.title = displayName;
	}

	const lastLogin = view.querySelector('.name .lastlogin');
	if (lastLogin) {
		lastLogin.textContent = member.LastLogin
			? DB.getMessage(3012, 'Last login: %s').replace('%s', _formatLastLogin(member.LastLogin))
			: '';
	}

	if (_positions[member.GPositionID]) {
		const positionCell = view.querySelector('.position');
		if (Session.isGuildMaster) {
			let selectHTML = `<select class="changePosition member_${member.AID}_${member.GID}">`;
			_positions.forEach((position, key) => {
				selectHTML +=
					`<option value="${position.positionID}" ${key === member.GPositionID ? 'selected' : ''}>` +
					`${_escapeHTML(position.posName)}</option>`;
			});
			selectHTML += '</select>';
			positionCell.innerHTML = selectHTML;

			const selectEl = positionCell.querySelector(`.member_${member.AID}_${member.GID}`);
			if (selectEl) {
				selectEl.addEventListener('change', evt => {
					const positionID = parseInt(evt.target.value, 10);
					if (!Guild.updateMemberPosition(member.AID, member.GID, positionID, true)) {
						// Refused selection, keep the dropdown on the grade we know.
						evt.target.value = member.GPositionID;
						return;
					}
					_showApplyButton();
				});
			}
		} else {
			positionCell.textContent = _positions[member.GPositionID].posName;
			positionCell.title = _positions[member.GPositionID].posName;
		}
	}

	const jobCell = view.querySelector('.job');
	if (jobCell) {
		jobCell.textContent = MonsterTable[member.Job];
		jobCell.title = MonsterTable[member.Job];
	}
	const levelCell = view.querySelector('.level');
	if (levelCell) {
		levelCell.textContent = member.Level;
	}
	const noteCell = view.querySelector('.note');
	if (noteCell) {
		noteCell.textContent = member.Memo;
	}
	const devotionCell = view.querySelector('.devotion');
	if (devotionCell) {
		devotionCell.textContent = `${member.MemberExp ? Math.round((member.MemberExp / _totalExp) * 100) : 0} %`;
	}
	const taxCell = view.querySelector('.tax');
	if (taxCell) {
		taxCell.textContent = member.MemberExp;
		taxCell.title = member.MemberExp;
	}

	if (!member.entity) {
		member.entity = new Entity();
		member.entity.direction = 4;
		member.entity.objecttype = Entity.TYPE_PC;
		member.entity.files.shadow.spr = null;
	}
	member.entity.sex = member.Sex;
	member.entity._job = member.Job;
	member.entity._effectiveJob = member.Job;
	member.entity.head = member.HeadType;
	member.entity.headpalette = member.HeadPalette;

	const numMember = root.querySelector('.content.info .members .numMember');
	if (numMember) {
		numMember.textContent = _members.length;
	}
};

Guild.updateMemberStatus = function updateMemberStatus(member) {
	let i, count;
	let online = 0;
	const root = _root(this);

	for (i = 0, count = _members.length; i < count; ++i) {
		if (_members[i].AID === member.AID && _members[i].GID === member.GID) {
			break;
		}
	}

	if (i >= count) {
		return;
	}

	const view = root.querySelector(`.MemberView[data-index="${i}"]`);

	_members[i].CurrentState = member.status;
	if (view) {
		if (_members[i].CurrentState) {
			view.classList.add('online');
		} else {
			view.classList.remove('online');
		}
	}

	if ('sex' in member) {
		_members[i].entity.sex = member.sex;
	}

	if ('head' in member) {
		_members[i].entity.head = member.head;
	}

	if ('headPalette' in member) {
		_members[i].entity.headpalette = member.headPalette;
	}

	for (i = 0, count = _members.length; i < count; ++i) {
		online += _members[i].CurrentState ? 1 : 0;
	}
	const onlineEl = root.querySelector('.content.info .members .online');
	if (onlineEl) {
		onlineEl.textContent = online;
	}

	const nameValue = view?.querySelector('.name .value');
	ChatBox.addText(
		DB.getMessage(485 + (member.status ? 0 : 1)).replace('%s', nameValue ? nameValue.textContent : ''),
		ChatBox.TYPE.BLUE,
		ChatBox.FILTER.GUILD
	);
};

/**
 * Move a member to another grade
 *
 * From the dropdown the change is only queued: the native client guards the
 * selection then flushes the queue on Apply, it never sends on selection.
 *
 * @param {number} AID - account id
 * @param {number} GID - character id
 * @param {number} positionID - grade to move the member to
 * @param {boolean} fromDropdown - true when the grade dropdown is the source
 * @return {boolean} false when the member is unknown or the selection refused
 */
Guild.updateMemberPosition = function updateMemberPosition(AID, GID, positionID, fromDropdown) {
	for (let i = 0, count = _members.length; i < count; ++i) {
		if (_members[i].AID === AID && _members[i].GID === GID) {
			const currentID = _members[i].GPositionID;

			// Grade 0 is the guild master. It is neither given nor taken from the
			// dropdown, delegation is a path of its own. An unchanged grade and a
			// value that did not parse are refused the same way, silently.
			if (fromDropdown && (!positionID || !currentID || positionID === currentID)) {
				return false;
			}

			_members[i].GPositionID = positionID;

			if (fromDropdown) {
				_pendingPositions[GID] = { AID: AID, GID: GID, positionID: positionID };
			} else {
				// The dropdown already displays the new position, re-rendering the row
				// here would replace the <select> while its change event is dispatching.
				Guild.setMember(_members[i]);
			}

			return true;
		}
	}

	return false;
};

/**
 * Apply the grades the server acknowledged
 *
 * The acknowledgement is the server truth, so it also drops whatever was
 * still queued. A grade of 0 is the guild master moving, not a grade change.
 *
 * @param {Array} memberInfo - PACKET.ZC.ACK_REQ_CHANGE_MEMBERS entries
 */
Guild.setMemberPositions = function setMemberPositions(memberInfo) {
	_clearPendingPositions();

	if (!memberInfo) {
		return;
	}

	for (let i = 0, count = memberInfo.length; i < count; ++i) {
		const entry = memberInfo[i];

		// A grade of 0 acknowledges a new guild master, not a grade change. The
		// member list the server pushes along with it repaints the rows.
		if (!entry.positionID) {
			Session.isGuildMaster = entry.AID === Session.AID && entry.GID === Session.GID;
			continue;
		}

		Guild.updateMemberPosition(entry.AID, entry.GID, entry.positionID, false);
	}
};

Guild.setPositions = function setPositions(positions, erase) {
	let rank;

	if (erase) {
		_positions.length = positions.length;
	}

	for (let i = 0, count = positions.length; i < count; ++i) {
		rank = positions[i];

		if (!(rank.positionID in _positions)) {
			_positions[rank.positionID] = {};
		}

		_positions[rank.positionID].positionID = rank.positionID;
		_positions[rank.positionID].right = rank.right;
		_positions[rank.positionID].ranking = rank.ranking;
		_positions[rank.positionID].payRate = rank.payRate;

		if (rank.posName) {
			_positions[rank.positionID].posName = rank.posName;
		}
	}

	Guild.updatePositionView();
};

Guild.setPositionsName = function setPositionsName(positions) {
	let rank;

	_clearPendingPositions();

	for (let i = 0, count = positions.length; i < count; ++i) {
		rank = positions[i];

		if (!(rank.positionID in _positions)) {
			_positions[rank.positionID] = {};
		}

		// The grade dropdown carries this as its option value, and this packet
		// can be the only one to ever feed a grade.
		_positions[rank.positionID].positionID = rank.positionID;
		_positions[rank.positionID].posName = rank.posName;
	}

	Guild.updatePositionView();
};

Guild.updatePositionView = function updatePositionView() {
	const root = _root(this);
	const container = root.querySelector('.content.positions tbody');
	if (!container) {
		return;
	}

	// 0x166 rides in with every member list, and rebuilding here would drop the
	// edits the rows are holding. The guild master's changes stand until Apply.
	if (_positionsDirty) {
		return;
	}

	container.closest('.content.positions')?.classList.toggle('has-storage', _hasStorageColumn());

	container.innerHTML = '';

	// _positions is keyed by positionID and the server is free to skip one, so
	// it can have holes - and setPositions truncates its length to the entry
	// count, which leaves them inside the range. Rows carry the id they render
	// rather than relying on their place in the table matching it.
	const count = _positions.length;
	let rendered = 0;
	for (let i = 0; i < count; ++i) {
		const rank = _positions[i];
		if (!rank) {
			continue;
		}

		const view = _positionViewTemplate.cloneNode(true);
		view.dataset.positionId = rank.positionID;

		if (rendered === _positionsSelected) {
			view.classList.add('active');
		}
		++rendered;

		const idCell = view.querySelector('.id');
		if (idCell) {
			idCell.textContent = rank.positionID;
		}
		const titleInput = view.querySelector('.title input');
		if (titleInput) {
			titleInput.value = rank.posName;
		}
		const taxInput = view.querySelector('.tax input');
		if (taxInput) {
			taxInput.value = rank.payRate;
		}

		const inviteBox = view.querySelector('.invite .checkbox');
		if (inviteBox) {
			inviteBox.style.backgroundImage = `url(${rank.right & 0x01 ? _checkbox_on : _checkbox_off})`;
			inviteBox.className = inviteBox.className.replace(/\b(on|off)\b/g, '').trim();
			inviteBox.classList.add(rank.right & 0x01 ? 'on' : 'off');
		}

		const punishBox = view.querySelector('.punish .checkbox');
		if (punishBox) {
			punishBox.style.backgroundImage = `url(${rank.right & 0x10 ? _checkbox_on : _checkbox_off})`;
			punishBox.className = punishBox.className.replace(/\b(on|off)\b/g, '').trim();
			punishBox.classList.add(rank.right & 0x10 ? 'on' : 'off');
		}

		const storageBox = view.querySelector('.storage .checkbox');
		if (storageBox) {
			const on = rank.right & GUILD_PERM_STORAGE;
			storageBox.style.backgroundImage = `url(${on ? _checkbox_on : _checkbox_off})`;
			storageBox.className = storageBox.className.replace(/\b(on|off)\b/g, '').trim();
			storageBox.classList.add(on ? 'on' : 'off');
		}

		container.appendChild(view);
	}
};

Guild.setSkills = function setSkills(skills) {
	const root = _root(this);

	for (let i = 0, count = _skills.length; i < count; ++i) {
		this.onUpdateSkill(_skills[i].SKID, 0);
	}

	_skills.length = 0;
	const table = root.querySelector('.content.skills .skill_list table');
	if (table) {
		table.innerHTML = '';
	}

	for (let i = 0, count = skills.length; i < count; ++i) {
		this.addSkill(skills[i]);
	}
};

Guild.addSkill = function addSkill(skill) {
	if (!(skill.SKID in SkillInfo)) {
		return;
	}

	const root = _root(this);
	const existing = root.querySelector(`.skill.id${skill.SKID}`);
	if (existing) {
		this.updateSkill(skill);
		return;
	}

	const sk = SkillInfo[skill.SKID];
	const levelup = _btnIncSkillTemplate.cloneNode(true);
	levelup.addEventListener('click', function () {
		onRequestSkillUp.call(this);
	});
	const className = !skill.level ? 'disabled' : skill.type ? 'active' : 'passive';

	const tr = document.createElement('tr');
	tr.className = `skill id${skill.SKID} ${className}`;
	tr.setAttribute('data-index', skill.SKID);
	tr.setAttribute('draggable', 'true');
	tr.innerHTML =
		'<td class="icon"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" width="24" height="24" /></td>' +
		'<td class="levelupcontainer"></td>' +
		'<td class=selectable>' +
		`<div class="name">${_escapeHTML(sk.SkillName)}<br/>` +
		'<span class="level">' +
		(sk.bSeperateLv
			? `<button class="currentDown"></button>Lv : <span class="current">${skill.level}</span> / <span class="max">${skill.level}</span><button class="currentUp"></button>`
			: `Lv : <span class="current">${skill.level}</span>`) +
		'</span></div></td>' +
		'<td class="selectable type">' +
		`<div class="consume">${skill.type ? `Sp : <span class="spcost">${skill.spcost}</span>` : 'Passive'}</div>` +
		'</td>';

	if (!skill.upgradable || !_skpoints) {
		levelup.style.display = 'none';
	}

	tr.querySelector('.levelupcontainer').appendChild(levelup);

	const currentUp = tr.querySelector('.level .currentUp');
	if (currentUp) {
		if (rArrow) {
			currentUp.style.backgroundImage = rArrow;
		}
		currentUp.addEventListener('click', () => {
			skillLevelSelectUp(skill);
		});
	}
	const currentDown = tr.querySelector('.level .currentDown');
	if (currentDown) {
		if (lArrow) {
			currentDown.style.backgroundImage = lArrow;
		}
		currentDown.addEventListener('click', () => {
			skillLevelSelectDown(skill);
		});
	}

	const table = root.querySelector('.content.skills .skill_list table');
	if (table) {
		table.appendChild(tr);
	}

	// Process data attributes on the levelup button for GUIComponent
	this.parseHTML.call(levelup);

	Client.loadFile(`${DB.INTERFACE_PATH}item/${sk.Name}.bmp`, data => {
		const img = tr.querySelector('.icon img');
		if (img) {
			img.src = data;
		}
	});

	_skills.push(skill);
	this.onUpdateSkill(skill.SKID, skill.level);
};

Guild.removeSkill = function removeSkill() {
	// Not implemented by gravity
};

Guild.updateSkill = function updateSkill(skill) {
	const target = getSkillById(skill.SKID);

	if (!target) {
		return;
	}

	target.level = skill.level;
	target.spcost = skill.spcost;
	target.attackRange = skill.attackRange;
	target.upgradable = skill.upgradable;
	if (Number.isInteger(skill.type)) {
		target.type = skill.type;
	}

	const root = _root(this);
	const element = root.querySelector(`.skill.id${skill.SKID}`);
	if (!element) {
		return;
	}

	for (const el of element.querySelectorAll('.level .current, .level .max')) {
		el.textContent = skill.level;
	}
	if (skill.selectedLevel) {
		const current = element.querySelector('.level .current');
		if (current) {
			current.textContent = skill.selectedLevel;
		}
	}
	const spcost = element.querySelector('.spcost');
	if (spcost) {
		spcost.textContent = skill.spcost;
	}

	element.classList.remove('active', 'passive', 'disabled');
	element.classList.add(!skill.level ? 'disabled' : skill.type ? 'active' : 'passive');

	const levelupEl = element.querySelector('.levelup');
	if (levelupEl) {
		levelupEl.style.display = skill.upgradable && _skpoints ? '' : 'none';
	}

	this.onUpdateSkill(skill.SKID, skill.level);
};

Guild.useSkillID = function useSkillID(id, level) {
	const skill = getSkillById(id);
	if (!skill || !skill.level || !skill.type) {
		return;
	}

	Guild.useSkill(skill, level ? level : skill.selectedLevel);
};

Guild.useSkill = function useSkill(skill, level) {
	if (skill.type & SkillTargetSelection.TYPE.SELF) {
		this.onUseSkill(skill.SKID, level ? level : skill.level);
	}

	skill.useLevel = level;

	if (skill.type & SkillTargetSelection.TYPE.TARGET) {
		SkillTargetSelection.append();
		SkillTargetSelection.set(skill, skill.type);
	}
};

Guild.setPoints = function setPoints(amount) {
	const root = _root(this);
	const el = root.querySelector('.skpoints_count');
	if (el) {
		el.textContent = amount;
	}

	if (!_skpoints === !amount) {
		_skpoints = amount;
		return;
	}

	_skpoints = amount;
	const count = _skills.length;

	for (let i = 0; i < count; ++i) {
		const levelupEl = root.querySelector(`.skill.id${_skills[i].SKID} .levelup`);
		if (levelupEl) {
			levelupEl.style.display = _skills[i].upgradable && amount ? '' : 'none';
		}
	}
};

Guild.onLevelUp = function onLevelUp() {
	if (_btnLevelUp) {
		document.body.appendChild(_btnLevelUp);
	}
};

function getSkillById(id) {
	const count = _skills.length;

	for (let i = 0; i < count; ++i) {
		if (_skills[i].SKID === id) {
			return _skills[i];
		}
	}

	return null;
}

function onRequestSkillUp() {
	const index = this.parentNode.parentNode.getAttribute('data-index');
	Guild.onIncreaseSkill(parseInt(index, 10));
}

function onRequestUseSkill() {
	let main = this.parentElement;

	if (!main.classList.contains('skill')) {
		main = main.parentElement;
	}

	Guild.useSkillID(parseInt(main.getAttribute('data-index'), 10));
}

function onRequestSkillInfo() {
	let main = this.parentElement;
	if (!main.classList.contains('skill')) {
		main = main.parentElement;
	}

	const skill = getSkillById(parseInt(main.getAttribute('data-index'), 10));

	if (SkillDescription.uid === skill.SKID) {
		SkillDescription.remove();
		return;
	}

	SkillDescription.append();
	SkillDescription.setSkill(skill.SKID);
}

function onSkillFocus() {
	let main = this.parentElement;

	if (!main.classList.contains('skill')) {
		main = main.parentElement;
	}

	const root = _root(Guild);
	for (const el of root.querySelectorAll('.skill')) {
		el.classList.remove('selected');
	}
	main.classList.add('selected');
}

function onSkillDragStart(event) {
	const index = parseInt(this.getAttribute('data-index'), 10);
	const skill = getSkillById(index);

	if (!skill || !skill.level || !skill.type) {
		event.stopImmediatePropagation();
		return false;
	}

	const img = new Image();
	img.decoding = 'async';
	img.src = this.querySelector('.icon img')?.src || '';

	event.dataTransfer.setDragImage(img, 12, 12);
	event.dataTransfer.setData(
		'Text',
		JSON.stringify(
			(window._OBJ_DRAG_ = {
				type: 'skill',
				from: 'Guild',
				data: skill
			})
		)
	);
}

function onSkillDragEnd() {
	delete window._OBJ_DRAG_;
}

function skillLevelSelectUp(skill) {
	const level = skill.selectedLevel ? skill.selectedLevel : skill.level;
	if (level < skill.level) {
		skill.selectedLevel = level + 1;
		const root = _root(Guild);
		const element = root.querySelector(`.skill.id${skill.SKID}`);
		if (element) {
			const current = element.querySelector('.level .current');
			if (current) {
				current.textContent = skill.selectedLevel;
			}
		}
	}
}

function skillLevelSelectDown(skill) {
	const level = skill.selectedLevel ? skill.selectedLevel : skill.level;
	if (level > 1) {
		skill.selectedLevel = level - 1;
		const root = _root(Guild);
		const element = root.querySelector(`.skill.id${skill.SKID}`);
		if (element) {
			const current = element.querySelector('.level .current');
			if (current) {
				current.textContent = skill.selectedLevel;
			}
		}
	}
}

Guild.setNotice = function setNotice(subject, notice) {
	const root = _root(this);
	const subjectInput = root.querySelector('.content.notice .subject');
	if (subjectInput) {
		subjectInput.value = subject;
	}
	const noticeTextarea = root.querySelector('.content.notice textarea.notice');
	if (noticeTextarea) {
		noticeTextarea.value = notice;
	}
};

Guild.setExpelList = function setExpelList(list) {
	const root = _root(this);
	const container = root.querySelector('.content.history tbody');
	if (!container) {
		return;
	}
	container.innerHTML = '';

	for (let i = 0, count = list.length; i < count; ++i) {
		const element = _expelViewTemplate.cloneNode(true);
		const nameCell = element.querySelector('.name');
		if (nameCell) {
			nameCell.textContent = list[i].charname;
		}
		const reasonCell = element.querySelector('.reason');
		if (reasonCell) {
			reasonCell.textContent = list[i].reason;
		}
		container.appendChild(element);
	}
};

Guild.setAccess = function setAccess(access) {
	_guildAccess = access;
};

function onChangeTab(event) {
	const tab = parseInt(this.getAttribute('data-flag'), 10);
	const root = _root(Guild);

	if (this.classList.contains('active') || (tab && !(_guildAccess & AccessTypeBit[tab]))) {
		return false;
	}

	Guild.onGuildInfoRequest(tab);

	for (const btn of root.querySelectorAll('.tabs button')) {
		btn.classList.remove('active');
	}
	for (const content of root.querySelectorAll('.content')) {
		content.style.display = 'none';
	}

	const targetClass = this.className.replace(/\s*active\s*/g, '').trim();
	const targetContent = root.querySelector(`.content.${targetClass}`);
	if (targetContent) {
		targetContent.style.display = 'block';
	}

	const btnOk = root.querySelector('.footer .btn_ok');
	if (btnOk) {
		btnOk.style.display = 'none';
	}

	// The positions tab holds its edits in its rows, so coming back to an edited
	// one has to bring the way to apply them back too.
	if (targetClass === 'positions' && _positionsDirty) {
		_showApplyButton();
	}

	updateDisbandButton(root, targetClass);
	updateSkillPoints(root, targetClass);

	if (targetClass === 'members') {
		Renderer.render(renderMemberFaces);
	} else {
		Renderer.stop(renderMemberFaces);
	}

	this.classList.add('active');

	return false;
}

function renderTendency(honor, virtue) {
	const root = _root(Guild);
	const canvas = root.querySelector('.content.info .tendency canvas');
	if (!canvas) {
		return;
	}
	const ctx = canvas.getContext('2d');

	ctx.fillStyle = '#cecfce';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = '#739eef';
	ctx.fillRect(1, 1, canvas.width - 2, canvas.height - 2);

	ctx.fillStyle = '#4261a5';
	ctx.fillRect(canvas.width / 2 - 1, 1, 2, canvas.height - 2);
	ctx.fillRect(1, canvas.height / 2 - 1, canvas.width - 2, 2);

	ctx.fillStyle = '#ffffff';
	ctx.fillRect(canvas.width / 2 - 1, canvas.height / 2 - 1, 2, 2);
}

const renderMemberFaces = (function renderMemberFacesClosure() {
	let lastTick = 0;

	return function renderMemberFace(tick) {
		if (tick < lastTick + 1000) {
			return;
		}

		lastTick = tick;
		const root = _root(Guild);
		const canvases = root.querySelectorAll('.content.members canvas');
		Camera.direction = 4;

		for (let i = 0, count = _members.length; i < count; ++i) {
			if (!canvases[i]) {
				continue;
			}
			const ctx = canvases[i].getContext('2d');
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

			if (!_members[i].CurrentState) {
				continue;
			}

			SpriteRenderer.bind2DContext(ctx, 15, 45);
			_members[i].entity.renderEntity();
		}
	};
})();

function onValidate() {
	const root = _root(Guild);
	const visibleContent = Array.from(root.querySelectorAll('.content')).find(el => {
		const d = el.style.display;
		return d !== 'none' && getComputedStyle(el).display !== 'none';
	});

	if (!visibleContent) {
		return;
	}

	let activeTab = '';
	for (const cls of visibleContent.classList) {
		if (cls !== 'content') {
			activeTab = cls;
			break;
		}
	}

	switch (activeTab) {
		case 'members': {
			const list = [];
			for (const GID in _pendingPositions) {
				list.push(_pendingPositions[GID]);
			}

			// Nothing queued, nothing to apply. Sending the whole roster here is
			// what the server reads as a guild master transfer.
			if (!list.length) {
				return;
			}

			Guild.onChangeMemberPosRequest(list);
			_clearPendingPositions();
			break;
		}
		case 'positions': {
			const positionList = [];
			const positions = root.querySelectorAll('.PositionView');

			for (const position of positions) {
				// The row says which position it renders. Pairing it with the store by
				// its place in the table breaks the moment the server skips an id.
				const rank = _positions[parseInt(position.dataset.positionId, 10)];

				// 0x160 carries the mode and nothing else does. Until it lands there
				// is nothing to preserve and nothing to compare against, and sending
				// would push a zeroed mode over the server's own.
				if (!rank || rank.right === undefined) {
					continue;
				}

				const posName = position.querySelector('.title input')?.value || '';

				// The client's edit takes two characters, so 0-99, and that is
				// also rathena's ceiling for guild_exp_limit. The limit itself is
				// per-server config, so it is not ours to second-guess any
				// further - the server caps what it will accept.
				const typed = parseInt(position.querySelector('.tax input')?.value, 10) || 0;
				const payRate = Math.min(99, Math.max(0, typed));

				// Keep every bit the tab has no column for. Rebuilding the mode
				// from zero is what used to drop the guild storage right on a
				// packetver too old to draw it.
				const owned = _hasStorageColumn() ? 0x01 | 0x10 | GUILD_PERM_STORAGE : 0x01 | 0x10;
				let right = rank.right & ~owned;

				const inviteBox = position.querySelector('.invite .checkbox');
				if (inviteBox && inviteBox.classList.contains('on')) {
					right |= 0x01;
				}

				const punishBox = position.querySelector('.punish .checkbox');
				if (punishBox && punishBox.classList.contains('on')) {
					right |= 0x10;
				}

				const storageBox = position.querySelector('.storage .checkbox');
				if (_hasStorageColumn() && storageBox && storageBox.classList.contains('on')) {
					right |= GUILD_PERM_STORAGE;
				}

				if (rank.right !== right || rank.posName !== posName || rank.payRate !== payRate) {
					positionList.push({
						positionID: rank.positionID,
						ranking: rank.ranking,
						right: right,
						posName: posName,
						payRate: payRate
					});
				}
			}

			// Applied or not, the rows go back to being the server's to repaint.
			if (positionList.length) {
				Guild.onPositionUpdateRequest(positionList);
			}
			_positionsDirty = false;
			break;
		}
		case 'notice': {
			const subject = root.querySelector('.content.notice input')?.value || '';
			const content = root.querySelector('.content.notice textarea')?.value || '';
			Guild.onNoticeUpdateRequest(subject, content);
			break;
		}
	}

	const btnOk = root.querySelector('.footer .btn_ok');
	if (btnOk) {
		btnOk.style.display = 'none';
	}
}

function getActiveTab(root) {
	const btn = root ? root.querySelector('.tabs button.active') : null;
	return btn ? btn.className.replace(/\s*active\s*/g, '').trim() : '';
}

function updateDisbandButton(root, activeTab) {
	if (!root) {
		return;
	}

	const btn = root.querySelector('.footer .btn_disband');
	if (!btn) {
		return;
	}

	btn.style.display = activeTab === 'info' && Session.isGuildMaster ? 'block' : 'none';

	if (!btn.dataset.bound) {
		btn.dataset.bound = '1';
		btn.addEventListener('click', () => {
			Guild.promptDisbandGuild();
		});
	}
}

// The client draws the skill point readout at window coordinates that land on
// the bottom bar, not inside the skill list, so it lives in the frame's footer
// and follows the tab instead of the pane.
function updateSkillPoints(root, activeTab) {
	if (!root) {
		return;
	}

	const el = root.querySelector('.footer .skpoints');
	if (el) {
		el.style.display = activeTab === 'skills' ? 'block' : 'none';
	}
}

Guild.promptCreateGuild = function promptCreateGuild() {
	GuildCompanion.toggleCreate();
};

Guild.promptDisbandGuild = function promptDisbandGuild() {
	if (!Session.isGuildMaster) {
		return;
	}

	UIManager.showMessageBox('If you are using a guild storage, all items inside it will disappear.', 'ok', () => {
		GuildCompanion.openDisband();
	});
};

Guild.onGuildInfoRequest = function () {};
Guild.onRequestCreateGuild = function () {};
Guild.onRequestBreakGuild = function () {};
Guild.onPositionUpdateRequest = function () {};
Guild.onChangeMemberPosRequest = function () {};
Guild.onNoticeUpdateRequest = function () {};
Guild.onRequestMemberInfo = function () {};
Guild.onRequestLeave = function () {};
Guild.onRequestMemberExpel = function () {};
Guild.onRequestDeleteRelation = function () {};
Guild.onRequestAccess = function () {};

Guild.updateSession = function (info) {
	Session.hasGuild = true;
	Session.guildName = info.guildname || '';
	Session.Entity.GUID = info.GDID;
	Session.Entity.GEmblemVer = info.emblemVersion;
	if (Session.Entity.display.name === info.masterName) {
		Session.isGuildMaster = true;
	}
};

Guild.onRequestGuildEmblem = function () {};
Guild.onSendEmblem = function () {};
Guild.onUseSkill = function onUseItem() {};
Guild.onIncreaseSkill = function onIncreaseSkill() {};
Guild.onUpdateSkill = function onUpdateSkill() {};
Guild.getSkillById = getSkillById;

export default UIManager.addComponent(Guild);
