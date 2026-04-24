import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import Client from 'Core/Client.js';
import DB from 'DB/DBManager.js';
import Equipment from 'UI/Components/Equipment/Equipment.js';
import Session from 'Engine/SessionStorage.js';

import RandomOptionTable from 'DB/Items/ItemRandomOptionTable.js';
import ItemAbilityDB from 'DB/Items/ItemAbilityDB.js';

import htmlText from './EquipAbility.html?raw';
import cssText from './EquipAbility.css?raw';

const EquipAbility = new UIComponent('EquipAbility', htmlText, cssText);

let _equipAbilityTimer = null;
let _lastEquipHash = '';
let _activeTab = 'total';
let _scrollTop = 0;
let _maxScrollTop = 0;
let _scrollDragging = false;
let _scrollDragOffset = 0;

const tabs = [
	'total',
	'category1',
	'category2',
	'category3',
	'category4',
	'category5',
	'category6',
	'category7'
];

const tabText = {
	total: '전체',
	category1: '스탯',
	category2: '어빌',
	category3: '전투',
	category4: '속성',
	category5: '종족',
	category6: '스킬',
	category7: '특수'
};

const RANDOM_OPTION_LABELS = {
	1: ['MAXHP 증가', ''],
	2: ['MAXSP 증가', ''],
	3: ['STR 증가', ''],
	4: ['AGI 증가', ''],
	5: ['VIT 증가', ''],
	6: ['INT 증가', ''],
	7: ['DEX 증가', ''],
	8: ['LUK 증가', ''],
	9: ['MAXHP 증가', '%'],
	10: ['MAXSP 증가', '%'],
	11: ['HP 회복력 증가', '%'],
	12: ['SP 회복력 증가', '%'],
	13: ['ATK 증가', '%'],
	14: ['MATK 증가', '%'],
	15: ['ASPD 증가', ''],
	16: ['공격 속도 증가', '%'],
	17: ['ATK 증가', ''],
	18: ['HIT 증가', ''],
	19: ['MATK 증가', ''],
	20: ['DEF 증가', ''],
	21: ['MDEF 증가', ''],
	22: ['FLEE 증가', ''],
	23: ['완전 회피 증가', ''],
	24: ['CRI 증가', ''],

	25: ['무속성 내성 증가', '%'],
	26: ['수속성 내성 증가', '%'],
	27: ['지속성 내성 증가', '%'],
	28: ['화속성 내성 증가', '%'],
	29: ['풍속성 내성 증가', '%'],
	30: ['독속성 내성 증가', '%'],
	31: ['성속성 내성 증가', '%'],
	32: ['암속성 내성 증가', '%'],
	33: ['염속성 내성 증가', '%'],
	34: ['불사속성 내성 증가', '%'],
	35: ['모든 속성 내성 증가', '%'],

	36: ['무속성 몬스터에게 받는 물리 데미지 감소', '%'],
	37: ['무속성 몬스터에게 주는 물리 데미지 증가', '%'],
	38: ['수속성 몬스터에게 받는 물리 데미지 감소', '%'],
	39: ['수속성 몬스터에게 주는 물리 데미지 증가', '%'],
	40: ['지속성 몬스터에게 받는 물리 데미지 감소', '%'],
	41: ['지속성 몬스터에게 주는 물리 데미지 증가', '%'],
	42: ['화속성 몬스터에게 받는 물리 데미지 감소', '%'],
	43: ['화속성 몬스터에게 주는 물리 데미지 증가', '%'],
	44: ['풍속성 몬스터에게 받는 물리 데미지 감소', '%'],
	45: ['풍속성 몬스터에게 주는 물리 데미지 증가', '%'],
	46: ['독속성 몬스터에게 받는 물리 데미지 감소', '%'],
	47: ['독속성 몬스터에게 주는 물리 데미지 증가', '%'],
	48: ['성속성 몬스터에게 받는 물리 데미지 감소', '%'],
	49: ['성속성 몬스터에게 주는 물리 데미지 증가', '%'],
	50: ['암속성 몬스터에게 받는 물리 데미지 감소', '%'],
	51: ['암속성 몬스터에게 주는 물리 데미지 증가', '%'],
	52: ['염속성 몬스터에게 받는 물리 데미지 감소', '%'],
	53: ['염속성 몬스터에게 주는 물리 데미지 증가', '%'],
	54: ['불사속성 몬스터에게 받는 물리 데미지 감소', '%'],
	55: ['불사속성 몬스터에게 주는 물리 데미지 증가', '%'],

	56: ['무속성 몬스터에게 받는 마법 데미지 감소', '%'],
	57: ['무속성 몬스터에게 주는 마법 데미지 증가', '%'],
	58: ['수속성 몬스터에게 받는 마법 데미지 감소', '%'],
	59: ['수속성 몬스터에게 주는 마법 데미지 증가', '%'],
	60: ['지속성 몬스터에게 받는 마법 데미지 감소', '%'],
	61: ['지속성 몬스터에게 주는 마법 데미지 증가', '%'],
	62: ['화속성 몬스터에게 받는 마법 데미지 감소', '%'],
	63: ['화속성 몬스터에게 주는 마법 데미지 증가', '%'],
	64: ['풍속성 몬스터에게 받는 마법 데미지 감소', '%'],
	65: ['풍속성 몬스터에게 주는 마법 데미지 증가', '%'],
	66: ['독속성 몬스터에게 받는 마법 데미지 감소', '%'],
	67: ['독속성 몬스터에게 주는 마법 데미지 증가', '%'],
	68: ['성속성 몬스터에게 받는 마법 데미지 감소', '%'],
	69: ['성속성 몬스터에게 주는 마법 데미지 증가', '%'],
	70: ['암속성 몬스터에게 받는 마법 데미지 감소', '%'],
	71: ['암속성 몬스터에게 주는 마법 데미지 증가', '%'],
	72: ['염속성 몬스터에게 받는 마법 데미지 감소', '%'],
	73: ['염속성 몬스터에게 주는 마법 데미지 증가', '%'],
	74: ['불사속성 몬스터에게 받는 마법 데미지 감소', '%'],
	75: ['불사속성 몬스터에게 주는 마법 데미지 증가', '%'],

	76: ['갑옷에 무속성 부여', ''],
	77: ['갑옷에 수속성 부여', ''],
	78: ['갑옷에 지속성 부여', ''],
	79: ['갑옷에 화속성 부여', ''],
	80: ['갑옷에 풍속성 부여', ''],
	81: ['갑옷에 독속성 부여', ''],
	82: ['갑옷에 성속성 부여', ''],
	83: ['갑옷에 암속성 부여', ''],
	84: ['갑옷에 염속성 부여', ''],
	85: ['갑옷에 불사속성 부여', ''],

	87: ['무형 몬스터에게 받는 물리 데미지 감소', '%'],
	88: ['불사형 몬스터에게 받는 물리 데미지 감소', '%'],
	89: ['동물형 몬스터에게 받는 물리 데미지 감소', '%'],
	90: ['식물형 몬스터에게 받는 물리 데미지 감소', '%'],
	91: ['곤충형 몬스터에게 받는 물리 데미지 감소', '%'],
	92: ['어패형 몬스터에게 받는 물리 데미지 감소', '%'],
	93: ['악마형 몬스터에게 받는 물리 데미지 감소', '%'],
	94: ['인간형 몬스터에게 받는 물리 데미지 감소', '%'],
	95: ['천사형 몬스터에게 받는 물리 데미지 감소', '%'],
	96: ['용족 몬스터에게 받는 물리 데미지 감소', '%'],

	97: ['무형 몬스터에게 주는 물리 데미지 증가', '%'],
	98: ['불사형 몬스터에게 주는 물리 데미지 증가', '%'],
	99: ['동물형 몬스터에게 주는 물리 데미지 증가', '%'],
	100: ['식물형 몬스터에게 주는 물리 데미지 증가', '%'],
	101: ['곤충형 몬스터에게 주는 물리 데미지 증가', '%'],
	102: ['어패형 몬스터에게 주는 물리 데미지 증가', '%'],
	103: ['악마형 몬스터에게 주는 물리 데미지 증가', '%'],
	104: ['인간형 몬스터에게 주는 물리 데미지 증가', '%'],
	105: ['천사형 몬스터에게 주는 물리 데미지 증가', '%'],
	106: ['용족 몬스터에게 주는 물리 데미지 증가', '%'],

	107: ['무형 몬스터에게 주는 마법 데미지 증가', '%'],
	108: ['불사형 몬스터에게 주는 마법 데미지 증가', '%'],
	109: ['동물형 몬스터에게 주는 마법 데미지 증가', '%'],
	110: ['식물형 몬스터에게 주는 마법 데미지 증가', '%'],
	111: ['곤충형 몬스터에게 주는 마법 데미지 증가', '%'],
	112: ['어패형 몬스터에게 주는 마법 데미지 증가', '%'],
	113: ['악마형 몬스터에게 주는 마법 데미지 증가', '%'],
	114: ['인간형 몬스터에게 주는 마법 데미지 증가', '%'],
	115: ['천사형 몬스터에게 주는 마법 데미지 증가', '%'],
	116: ['용족 몬스터에게 주는 마법 데미지 증가', '%'],

	117: ['무형 몬스터에게 CRI 증가', ''],
	118: ['불사형 몬스터에게 CRI 증가', ''],
	119: ['동물형 몬스터에게 CRI 증가', ''],
	120: ['식물형 몬스터에게 CRI 증가', ''],
	121: ['곤충형 몬스터에게 CRI 증가', ''],
	122: ['어패형 몬스터에게 CRI 증가', ''],
	123: ['악마형 몬스터에게 CRI 증가', ''],
	124: ['인간형 몬스터에게 CRI 증가', ''],
	125: ['천사형 몬스터에게 CRI 증가', ''],
	126: ['용족 몬스터에게 CRI 증가', ''],

	127: ['무형 몬스터의 물리 방어력 무시', '%'],
	128: ['불사형 몬스터의 물리 방어력 무시', '%'],
	129: ['동물형 몬스터의 물리 방어력 무시', '%'],
	130: ['식물형 몬스터의 물리 방어력 무시', '%'],
	131: ['곤충형 몬스터의 물리 방어력 무시', '%'],
	132: ['어패형 몬스터의 물리 방어력 무시', '%'],
	133: ['악마형 몬스터의 물리 방어력 무시', '%'],
	134: ['인간형 몬스터의 물리 방어력 무시', '%'],
	135: ['천사형 몬스터의 물리 방어력 무시', '%'],
	136: ['용족 몬스터의 물리 방어력 무시', '%'],

	137: ['무형 몬스터의 마법 방어력 무시', '%'],
	138: ['불사형 몬스터의 마법 방어력 무시', '%'],
	139: ['동물형 몬스터의 마법 방어력 무시', '%'],
	140: ['식물형 몬스터의 마법 방어력 무시', '%'],
	141: ['곤충형 몬스터의 마법 방어력 무시', '%'],
	142: ['어패형 몬스터의 마법 방어력 무시', '%'],
	143: ['악마형 몬스터의 마법 방어력 무시', '%'],
	144: ['인간형 몬스터의 마법 방어력 무시', '%'],
	145: ['천사형 몬스터의 마법 방어력 무시', '%'],
	146: ['용족 몬스터의 마법 방어력 무시', '%'],

	147: ['일반형 몬스터에게 주는 물리 데미지 증가', '%'],
	148: ['보스형 몬스터에게 주는 물리 데미지 증가', '%'],
	149: ['일반형 몬스터에게 받는 물리 데미지 감소', '%'],
	150: ['보스형 몬스터에게 받는 물리 데미지 감소', '%'],
	151: ['일반형 몬스터에게 주는 마법 데미지 증가', '%'],
	152: ['보스형 몬스터에게 주는 마법 데미지 증가', '%'],
	153: ['일반형 몬스터의 물리 방어력 무시', '%'],
	154: ['보스형 몬스터의 물리 방어력 무시', '%'],
	155: ['일반형 몬스터의 마법 방어력 무시', '%'],
	156: ['보스형 몬스터의 마법 방어력 무시', '%'],

	157: ['소형 몬스터에게 주는 물리 데미지 증가', '%'],
	158: ['중형 몬스터에게 주는 물리 데미지 증가', '%'],
	159: ['대형 몬스터에게 주는 물리 데미지 증가', '%'],
	160: ['소형 몬스터에게 받는 물리 데미지 감소', '%'],
	161: ['중형 몬스터에게 받는 물리 데미지 감소', '%'],
	162: ['대형 몬스터에게 받는 물리 데미지 감소', '%'],
	163: ['무기 크기 패널티 제거', ''],
	164: ['크리티컬 데미지 증가', '%'],
	165: ['크리티컬 데미지 감소', '%'],
	166: ['원거리 물리 데미지 증가', '%'],
	167: ['원거리 물리 데미지 감소', '%'],
	168: ['힐 회복량 증가', '%'],
	169: ['받는 힐 회복량 증가', '%'],
	170: ['변동 캐스팅 시간 감소', '%'],
	171: ['스킬 후 딜레이 감소', '%'],
	172: ['SP 소모량 감소', '%'],

	175: ['무기에 무속성 부여', ''],
	176: ['무기에 수속성 부여', ''],
	177: ['무기에 지속성 부여', ''],
	178: ['무기에 화속성 부여', ''],
	179: ['무기에 풍속성 부여', ''],
	180: ['무기에 독속성 부여', ''],
	181: ['무기에 성속성 부여', ''],
	182: ['무기에 암속성 부여', ''],
	183: ['무기에 염속성 부여', ''],
	184: ['무기에 불사속성 부여', ''],
	185: ['무기 파괴 방지', ''],
	186: ['방어구 파괴 방지', ''],

	187: ['소형 몬스터에게 주는 마법 데미지 증가', '%'],
	188: ['중형 몬스터에게 주는 마법 데미지 증가', '%'],
	189: ['대형 몬스터에게 주는 마법 데미지 증가', '%'],
	190: ['소형 몬스터에게 받는 마법 데미지 감소', '%'],
	191: ['중형 몬스터에게 받는 마법 데미지 감소', '%'],
	192: ['대형 몬스터에게 받는 마법 데미지 감소', '%']
};

EquipAbility.init = function init() {
	this.ui.hide();
	loadInterfaceImage('basic_interface/sys_close_off.bmp', '.ea-close');
	loadInterfaceImage('equipmentpropertieswnd/btn_coparison_resize.bmp', '.ea-compare');
	loadInterfaceImage('scroll0up.bmp', '.ea-scroll-up');
	loadInterfaceImage('scroll0down.bmp', '.ea-scroll-down');
	loadInterfaceImage('scroll0mid.bmp', '.ea-scroll-track');
	loadInterfaceImage('scroll0bar_up.bmp', '.ea-scroll-thumb-top');
	loadInterfaceImage('scroll0bar_down.bmp', '.ea-scroll-thumb-bottom');
	loadInterfaceImage('scroll0bar_mid.bmp', '.ea-scroll-thumb');
	Client.loadFile(DB.INTERFACE_PATH + 'equipmentpropertieswnd/bg.bmp', data => {
		EquipAbility.ui.find('.ea-inner').css({
			backgroundImage: 'url(' + data + ')',
			backgroundRepeat: 'repeat'
		});
	});

	Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/sys_base_off.bmp', data => {
		EquipAbility.ui.find('.ea-base-icon').css('backgroundImage', 'url(' + data + ')');
	});

	this.ui.find('.ea-base-icon')
		.on('mouseover mousedown', function () {
			Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/sys_base_on.bmp', data => {
				EquipAbility.ui.find('.ea-base-icon').css('backgroundImage', 'url(' + data + ')');
			});
		})
		.on('mouseout mouseup', function () {
			Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/sys_base_off.bmp', data => {
				EquipAbility.ui.find('.ea-base-icon').css('backgroundImage', 'url(' + data + ')');
			});
		});

	this.ui.find('.ea-close')
		.on('mouseover mousedown', () => {
			loadInterfaceImage('basic_interface/sys_close_on.bmp', '.ea-close');
		})
		.on('mouseout mouseup', () => {
			loadInterfaceImage('basic_interface/sys_close_off.bmp', '.ea-close');
		});

	this.ui.find('.ea-tab').click(function () {
		EquipAbility.setTab(this.getAttribute('data-tab'));
	});

	this.draggable(this.ui.find('.ea-titlebar'));
	bindScrollbarEvents();
	this.setTab('total');
};

EquipAbility.toggle = function toggle() {
	this.ui.toggle();

	if (this.ui.is(':visible')) {
		this.focus();
		this.setTab(_activeTab || 'total');
		startRealtimeUpdate();
	} else {
		stopRealtimeUpdate();
	}
};

EquipAbility.setTab = function setTab(activeTab) {
	_activeTab = activeTab;

	tabs.forEach(tab => {
		const state = tab === activeTab ? 'on' : 'off';
		const btn = this.ui.find('.ea-tab[data-tab="' + tab + '"]');

		Client.loadFile(DB.INTERFACE_PATH + 'equipmentpropertieswnd/tab_' + tab + '_' + state + '.bmp', data => {
			btn.css('backgroundImage', 'url(' + data + ')');
		});
	});

	this.ui.find('.ea-page').hide();

	const page = this.ui.find('.ea-page[data-page="' + activeTab + '"]');
	const valueBox = this.ui.find('.ea-left-cover');

	page.show().empty();
	valueBox.empty();

	const rows = filterRowsByTab(getEquipAbilityTotals(), activeTab);
	renderRows(page, valueBox, rows);
};

function startRealtimeUpdate() {
	if (_equipAbilityTimer) return;

	_lastEquipHash = getEquipHash();

	_equipAbilityTimer = setInterval(() => {
		if (!EquipAbility.ui.is(':visible')) {
			stopRealtimeUpdate();
			return;
		}

		const hash = getEquipHash();

		if (hash !== _lastEquipHash) {
			_lastEquipHash = hash;
			EquipAbility.setTab(_activeTab || 'total');
		}
	}, 300);
}

function stopRealtimeUpdate() {
	if (_equipAbilityTimer) {
		clearInterval(_equipAbilityTimer);
		_equipAbilityTimer = null;
	}
}

function getEquippedItems() {
	const eq = Equipment.getUI && Equipment.getUI();

	if (eq && eq._itemlist) {
		return Object.values(eq._itemlist).filter(Boolean);
	}

	if (Session.Character && Session.Character.equip) {
		return Session.Character.equip.filter(Boolean);
	}

	return [];
}

function getItemId(item) {
	return Number(item.ITID || item.itemId || item.ItemID || item.item_id || item.id || item.ID || 0);
}

function getRefine(item) {
	return Number(item.RefiningLevel || item.refine || item.refine_level || item.Refine || item.RefineLevel || item.refiningLevel || 0);
}

function getGrade(item) {
	return Number(item.enchantgrade || item.enchantGrade || item.EnchantGrade || item.grade || item.Grade || item.itemGrade || item.ItemGrade || 0);
}

function getItemOptions(item) {
	const out = [];

	[item.Options, item.options, item.option, item.randomOptions, item.RandomOptions].forEach(list => {
		if (!Array.isArray(list)) return;

		list.forEach(opt => {
			if (!opt) return;

			const index = Number(opt.index || opt.Index || opt.id || opt.ID || opt.option || 0);
			const value = Number(opt.value || opt.Value || opt.val || opt.amount || 0);
			const param = Number(opt.param || opt.Param || opt.parameter || 0);

			if (index) out.push({ index, value, param });
		});
	});

	return out;
}

function getItemCards(item) {
	const out = [];

	function push(id) {
		id = Number(id || 0);
		if (!id) return;
		if (id === 254 || id === 255 || id === 0x00fe || id === 0x00ff || id === 0xff00) return;
		if (id > 100) out.push(id);
	}

	[
		'card0', 'card1', 'card2', 'card3', 'card4',
		'Card0', 'Card1', 'Card2', 'Card3', 'Card4',
		'card_0', 'card_1', 'card_2', 'card_3', 'card_4'
	].forEach(k => push(item[k]));

	if (item.slot) {
		[
			'card0', 'card1', 'card2', 'card3', 'card4',
			'Card0', 'Card1', 'Card2', 'Card3', 'Card4'
		].forEach(k => push(item.slot[k]));
	}

	if (Array.isArray(item.cards)) item.cards.forEach(push);
	if (Array.isArray(item.Cards)) item.Cards.forEach(push);

	return unique(out);
}

function getEquipHash() {
	return getEquippedItems().map(item => {
		const opts = getItemOptions(item).map(opt => [opt.index, opt.value, opt.param].join(':')).join(',');
		const cards = getItemCards(item).join(',');
		return [getItemId(item), getRefine(item), getGrade(item), cards, opts].join('_');
	}).join('|');
}

function getEquipAbilityTotals() {
	const result = {};
	const equips = getEquippedItems();

	equips.forEach(item => {
		if (!item) return;

		applyItemAbility(result, getItemId(item), item, '아이템정보');
		applyCardAbility(result, item);
		applyRandomOptions(result, item);
	});

	applyComboAbility(result, equips);
	normalizeExceptionRows(result);

	return result;
}

function applyItemAbility(result, itemId, item, source) {
	const data = ItemAbilityDB && ItemAbilityDB.items && ItemAbilityDB.items[itemId];

	if (!data || !data.entries) return;

	data.entries.forEach(entry => {
		applyAbilityEntry(result, entry, item, source || '아이템정보');
	});
}

function applyCardAbility(result, item) {
	getItemCards(item).forEach(cardId => {
		applyItemAbility(result, cardId, item, '카드/인챈트');
	});
}

function applyComboAbility(result, equips) {
	const comboList = ItemAbilityDB && ItemAbilityDB.combos;

	if (!Array.isArray(comboList)) return;

	const ids = equips.map(getItemId).filter(Boolean);

	comboList.forEach(combo => {
		if (!combo || !Array.isArray(combo.items) || !Array.isArray(combo.entries)) return;

		const ok = combo.items.every(id => ids.includes(Number(id)));
		if (!ok) return;

		combo.entries.forEach(entry => {
			applyAbilityEntry(result, entry, null, '콤보옵션');
		});
	});
}

function applyAbilityEntry(result, entry, item, source) {
	if (!entry) return;
	if (!checkAbilityRequirement(entry, item)) return;

	const value = calcAbilityValue(entry.value, item);

	if (!value && entry.suffix !== '') return;

	const label = cleanLabel(entry.label || entry.name || '옵션');
	const suffix = entry.suffix || guessSuffix(label, entry.name);

	addRow(
		result,
		source + '|' + (entry.name || '') + '|' + (entry.arg || '') + '|' + label,
		label,
		value,
		suffix,
		guessTabByLabel(label)
	);
}

function checkAbilityRequirement(entry, item) {
	const req = entry.req || {};

	if (Array.isArray(req.conds)) {
		for (let i = 0; i < req.conds.length; i++) {
			if (!checkCondition(req.conds[i], item)) return false;
		}
	}

	return true;
}

function checkCondition(cond, item) {
	if (!item) return false;

	try {
		let js = String(cond)
			.replace(/\.@r/g, String(getRefine(item)))
			.replace(/\.@g/g, String(getGrade(item)))
			.replace(/ENCHANTGRADE_NONE/g, '0')
			.replace(/ENCHANTGRADE_D/g, '1')
			.replace(/ENCHANTGRADE_C/g, '2')
			.replace(/ENCHANTGRADE_B/g, '3')
			.replace(/ENCHANTGRADE_A/g, '4')
			.replace(/\band\b/gi, '&&')
			.replace(/\bor\b/gi, '||');

		if (!/^[0-9+\-*/().<>=!&|\s]+$/.test(js)) return false;

		return !!Function('"use strict"; return (' + js + ');')();
	} catch (e) {
		return false;
	}
}

function calcAbilityValue(value, item) {
	if (typeof value === 'number') return value;
	if (!value) return 0;

	let total = Number(value.base || 0);

	if (value.perRefineEvery) {
		if (!item) return total;
		total += Math.floor(getRefine(item) / Number(value.perRefineEvery)) * Number(value.perRefineValue || 0);
	}

	if (value.raw && item) {
		const rawValue = evalSimpleExpression(value.raw, item);
		if (rawValue !== null) total += rawValue;
	}

	return total;
}

function evalSimpleExpression(expr, item) {
	try {
		const r = getRefine(item);
		const g = getGrade(item);

		let js = String(expr)
			.replace(/\.@r/g, String(r))
			.replace(/\.@g/g, String(g))
			.replace(/ENCHANTGRADE_NONE/g, '0')
			.replace(/ENCHANTGRADE_D/g, '1')
			.replace(/ENCHANTGRADE_C/g, '2')
			.replace(/ENCHANTGRADE_B/g, '3')
			.replace(/ENCHANTGRADE_A/g, '4');

		if (!/^[0-9+\-*/().\s]+$/.test(js)) return null;

		return Math.floor(Function('"use strict"; return (' + js + ');')());
	} catch (e) {
		return null;
	}
}

function applyRandomOptions(result, item) {
	getItemOptions(item).forEach(opt => {
		const meta = getRandomOptionMeta(opt.index);
		if (!meta) return;

		addRow(
			result,
			'랜덤옵션|' + opt.index + '|' + meta.label,
			meta.label,
			Number(opt.value || 0),
			meta.suffix,
			guessTabByLabel(meta.label)
		);
	});
}

function getRandomOptionMeta(index) {
	index = Number(index || 0);

	if (RANDOM_OPTION_LABELS[index]) {
		return {
			label: RANDOM_OPTION_LABELS[index][0],
			suffix: RANDOM_OPTION_LABELS[index][1]
		};
	}

	const raw = String(RandomOptionTable[index] || '');

	if (!raw) {
		return {
			label: '랜덤옵션 ' + index,
			suffix: ''
		};
	}

	return translateRandomOptionRaw(raw);
}

function translateRandomOptionRaw(raw) {
	let label = String(raw)
		.replace(/\+%d%%|-%d%%|%d%%|\+%d|-%d|%d/g, '')
		.replace(/[+\-]\s*$/, '')
		.trim();

	const suffix = /%%|%/.test(String(raw)) ? '%' : '';

	const direct = [
		[/fixed cast|bfixedcast/i, '고정 캐스팅 시간 감소'],
		[/variable cast/i, '변동 캐스팅 시간 감소'],
		[/after cast delay|after skill delay/i, '스킬 후 딜레이 감소'],
		[/attack speed|delay after attack|aspd/i, '공격 속도 증가'],
		[/long range physical/i, '원거리 물리 데미지 증가'],
		[/short range physical|melee/i, '근접 물리 데미지 증가'],
		[/critical attack|critical damage/i, '크리티컬 데미지 증가'],
		[/p\.atk|patk/i, 'P.ATK 증가'],
		[/s\.matk|smatk/i, 'S.MATK 증가'],
		[/mres/i, 'MRES 증가'],
		[/res/i, 'RES 증가'],
		[/c\.rate|crate/i, 'C.RATE 증가'],
		[/maxhp/i, 'MAXHP 증가'],
		[/maxsp/i, 'MAXSP 증가'],
		[/matk/i, 'MATK 증가'],
		[/atk/i, 'ATK 증가'],
		[/mdef/i, 'MDEF 증가'],
		[/def/i, 'DEF 증가'],
		[/hit/i, 'HIT 증가'],
		[/flee/i, 'FLEE 증가'],
		[/crit|cri/i, 'CRI 증가'],
		[/str/i, 'STR 증가'],
		[/agi/i, 'AGI 증가'],
		[/vit/i, 'VIT 증가'],
		[/int/i, 'INT 증가'],
		[/dex/i, 'DEX 증가'],
		[/luk/i, 'LUK 증가']
	];

	for (let i = 0; i < direct.length; i++) {
		if (direct[i][0].test(raw)) {
			return {
				label: direct[i][1],
				suffix
			};
		}
	}

	return {
		label: cleanLabel(label || raw),
		suffix
	};
}

function addRow(result, key, label, value, suffix, tab) {
	label = cleanLabel(label);
	value = Number(value || 0);
	suffix = suffix || '';

	const mergeKey = 'merge|' + label + '|' + suffix;

	if (!result[mergeKey]) {
		result[mergeKey] = {
			key: mergeKey,
			label,
			value: 0,
			suffix,
			tab: tab || guessTabByLabel(label)
		};
	}

	result[mergeKey].value += value;
}

function normalizeExceptionRows(result) {
	const pairs = [
		['모든 종족 몬스터에게 주는 물리 데미지 증가', '플레이어 인간형 몬스터에게 주는 물리 데미지 증가', '모든 종족(플레이어 제외) 몬스터에게 주는 물리 데미지 증가'],
		['모든 종족 몬스터에게 주는 마법 데미지 증가', '플레이어 인간형 몬스터에게 주는 마법 데미지 증가', '모든 종족(플레이어 제외) 몬스터에게 주는 마법 데미지 증가'],
		['모든 종족 몬스터에게 받는 데미지 감소', '플레이어 인간형 몬스터에게 받는 데미지 감소', '모든 종족(플레이어 제외) 몬스터에게 받는 데미지 감소']
	];

	pairs.forEach(pair => {
		const allKey = findRowKey(result, pair[0]);
		const playerKey = findRowKey(result, pair[1]);

		if (!allKey || !playerKey) return;

		if (result[playerKey].value < 0 && Math.abs(result[playerKey].value) === Math.abs(result[allKey].value)) {
			result[allKey].label = pair[2];
			delete result[playerKey];
		}
	});
}

function findRowKey(result, label) {
	const keys = Object.keys(result);

	for (let i = 0; i < keys.length; i++) {
		if (result[keys[i]].label === label) return keys[i];
	}

	return null;
}

function filterRowsByTab(totals, activeTab) {
	return Object.keys(totals)
		.map(k => totals[k])
		.filter(row => activeTab === 'total' || row.tab === activeTab)
		.filter(row => row.value !== 0 || row.suffix === '')
		.sort((a, b) => {
			const ta = tabOrder(a.tab);
			const tb = tabOrder(b.tab);

			if (ta !== tb) return ta - tb;

			return a.label.localeCompare(b.label);
		});
}

function tabOrder(tab) {
	const idx = tabs.indexOf(tab);
	return idx < 0 ? 99 : idx;
}

function guessTabByLabel(label) {
	label = String(label || '');

	// skill tab
	if (/\b(HN_|DK_|IG_|SHC_|ABC_|CD_|IQ_|MT_|BO_|WH_|TR_|AG_|EM_|NW_|SH_|SS_|SKE_|SOA_)/.test(label)) {
		return 'category6';
	}

	// 종족
	if (/형 몬스터|종족/.test(label)) return 'category5';

	// 속성
	if (/속성 몬스터/.test(label)) return 'category4';

	if (/STR|AGI|VIT|INT|DEX|LUK|POW|STA|WIS|SPL|CON|CRT/.test(label)) return 'category1';
	if (/MAX|HP|SP|AP|HIT|FLEE|CRI|ASPD|DEF|MDEF|ATK|MATK|P\.ATK|S\.MATK|RES|MRES|C\.RATE/.test(label)) return 'category2';
	if (/원거리|근접|크리티컬|물리 데미지|마법 데미지/.test(label)) return 'category3';

	return 'category7';
}

function guessSuffix(label, name) {
	if (/데미지|내성|무시|감소|공격 속도/.test(label)) {
		if (!/초|ms/.test(label)) return '%';
	}

	if (/Rate|rate|Percent|percent/.test(String(name || ''))) return '%';

	return '';
}

function cleanLabel(label) {
	return String(label || '')
		.replace(/\^[0-9A-Fa-f]{6}/g, '')
		.replace(/bFixedCastRate|bFixedCastrate|bFixedCast/g, '고정 캐스팅 시간 감소')
		.replace(/\s+/g, ' ')
		.replace(/[+\-]\s*$/, '')
		.trim();
}

function formatCastTimeValue(value) {
	value = Number(value || 0);

	// 1000 = 1초 기준 (n/100000)
	const sec = Math.abs(value) / 1000;

	if (sec % 1 === 0) {
		return sec + '초';
	}

	return sec.toFixed(2).replace(/0+$/, '').replace(/\.$/, '') + '초';
}

function formatValue(value, suffix, label) {
	value = Number(value || 0);

	if (/고정 캐스팅 시간 감소/.test(label || '')) {
		return formatCastTimeValue(value);
	}

	const sign = value > 0 ? '+' : '';

	if (suffix === 'ms') return sign + value + 'ms';
	if (suffix === 'sec') return sign + value + '초';

	return sign + value + (suffix || '');
}

function renderRows(page, valueBox, rows) {
	let count = 0;

	rows.forEach(row => {
		const valueClass = Number(row.value || 0) < 0 ? ' ea-value-negative' : '';
		valueBox.append('<div class="ea-value-row' + valueClass + '">' + escapeHtml(formatValue(row.value, row.suffix, row.label)) + '</div>');
		page.append('<div class="ea-row" title="' + escapeHtml(row.label) + '">' + escapeHtml(row.label) + '</div>');
		count++;
	});

	if (count === 0) {
		valueBox.append('<div class="ea-value-row">0</div>');
		page.append('<div class="ea-row">' + escapeHtml(tabText[_activeTab] || '옵션') + ' 없음</div>');
		count++;
	}

	for (let i = count; i < 18; i++) {
		valueBox.append('<div class="ea-value-row"></div>');
		page.append('<div class="ea-row"></div>');
	}

	updateScrollbar(count);
}

function updateScrollbar(rowCount) {
	const innerHeight = 306;
	const rowHeight = 17;

	const contentHeight = Math.max(rowCount * rowHeight, innerHeight);
	_maxScrollTop = Math.max(0, contentHeight - innerHeight);

	const scrollbar = EquipAbility.ui.find('.ea-scrollbar');
	const content = EquipAbility.ui.find('.ea-scroll-content');
	const thumb = EquipAbility.ui.find('.ea-scroll-thumb');

	// scrollcap
	const topCap = thumb.find('.ea-scroll-thumb-top');
	const bottomCap = thumb.find('.ea-scroll-thumb-bottom');

	if (_maxScrollTop <= 0) {
		_scrollTop = 0;
		scrollbar.hide();
		content.css('top', '0px');
		return;
	}

	scrollbar.show();

	if (_scrollTop > _maxScrollTop) {
		_scrollTop = _maxScrollTop;
	}

	content.css('top', '-' + _scrollTop + 'px');

	const trackHeight = 278;
	const thumbHeight = Math.max(24, Math.floor(innerHeight / contentHeight * trackHeight));
	const maxThumbTop = trackHeight - thumbHeight;
	const thumbTop = Math.floor((_scrollTop / _maxScrollTop) * maxThumbTop);

	thumb.css({
		height: thumbHeight + 'px',
		top: thumbTop + 'px'
	});

	//cap
	topCap.css({ top: '0px' });
	bottomCap.css({ bottom: '0px' });
}

function setScrollTop(value) {
	_scrollTop = Math.max(0, Math.min(_maxScrollTop, value));
	EquipAbility.setTab(_activeTab || 'total');
}

function bindScrollbarEvents() {
	const ui = EquipAbility.ui;

	ui.find('.ea-scroll-up').off('click').on('click', function () {
		setScrollTop(_scrollTop - 17);
	});

	ui.find('.ea-scroll-down').off('click').on('click', function () {
		setScrollTop(_scrollTop + 17);
	});

	ui.find('.ea-inner').off('wheel').on('wheel', function (e) {
		if (_maxScrollTop <= 0) return;

		const oe = e.originalEvent || e;
		const delta = oe.deltaY || 0;

		setScrollTop(_scrollTop + (delta > 0 ? 51 : -51));
		e.preventDefault();
	});

	ui.find('.ea-scroll-thumb').off('mousedown').on('mousedown', function (e) {
		_scrollDragging = true;
		_scrollDragOffset = e.pageY - ui.find('.ea-scroll-thumb').offset().top;
		e.preventDefault();
	});

	document.removeEventListener('mousemove', onEquipAbilityScrollMove);
	document.removeEventListener('mouseup', onEquipAbilityScrollUp);

	document.addEventListener('mousemove', onEquipAbilityScrollMove);
	document.addEventListener('mouseup', onEquipAbilityScrollUp);
}

function onEquipAbilityScrollMove(e) {
	if (!_scrollDragging) return;

	const ui = EquipAbility.ui;
	const track = ui.find('.ea-scroll-track');
	const thumb = ui.find('.ea-scroll-thumb');

	if (!track.length || !thumb.length) return;

	const trackTop = track.offset().top;
	const trackHeight = 278;
	const thumbHeight = thumb.height();
	const maxThumbTop = trackHeight - thumbHeight;

	let thumbTop = e.pageY - trackTop - _scrollDragOffset;
	thumbTop = Math.max(0, Math.min(maxThumbTop, thumbTop));

	_scrollTop = maxThumbTop > 0 ? Math.floor((thumbTop / maxThumbTop) * _maxScrollTop) : 0;
	EquipAbility.setTab(_activeTab || 'total');
}

function onEquipAbilityScrollUp() {
	_scrollDragging = false;
}
function loadInterfaceImage(file, selector) {
	Client.loadFile(DB.INTERFACE_PATH + file, data => {
		EquipAbility.ui.find(selector).css({
			backgroundImage: 'url(' + data + ')',
			backgroundRepeat: selector === '.ea-scroll-track' || selector === '.ea-scroll-thumb' ? 'repeat-y' : 'no-repeat'
		});
	});
}
function escapeHtml(str) {
	return String(str).replace(/[&<>"']/g, ch => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	}[ch]));
}

function unique(arr) {
	const seen = {};
	const out = [];

	arr.forEach(v => {
		v = Number(v || 0);

		if (!v || seen[v]) return;

		seen[v] = true;
		out.push(v);
	});

	return out;
}

export default UIManager.addComponent(EquipAbility);
