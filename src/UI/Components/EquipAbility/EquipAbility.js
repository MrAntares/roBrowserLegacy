import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import Client from 'Core/Client.js';
import DB from 'DB/DBManager.js';
import Session from 'Engine/SessionStorage.js';
import Equipment from 'UI/Components/Equipment/Equipment.js';

import EquipAbilityParser from 'Engine/EquipAbilityParser/EquipAbilityParser.js';

import htmlText from './EquipAbility.html?raw';
import cssText from './EquipAbility.css?raw';

const EquipAbility = new UIComponent('EquipAbility', htmlText, cssText);

let _lastEquipSignature = '';
let _autoRefreshTimer = null;
let _activeTab = 'total';
let _scrollTop = 0;
let _maxScrollTop = 0;
let _scrollDragging = false;
let _scrollDragOffset = 0;

// -------------------------------------------------
// Tabs / 탭 목록
// -------------------------------------------------
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

// -------------------------------------------------
// Tab → Parser category mapping
// 탭 → 파서 카테고리 매핑
// -------------------------------------------------
const tabMap = {
	total: 'total',
	category1: 'stat',
	category2: 'ability',
	category3: 'battle',
	category4: 'element',
	category5: 'race',
	category6: 'skill',
	category7: 'special'
};

// -------------------------------------------------
// Tab text / 탭 표시 이름
// -------------------------------------------------
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

// -------------------------------------------------
// INIT / 초기화
// -------------------------------------------------
EquipAbility.init = function init() {
	this.ui.hide();

	// Load static background images
	// 고정 배경 이미지 로딩
	loadDataBackgrounds();

	// Load interface images
	// 인터페이스 이미지 로딩
	loadInterfaceImage('basic_interface/sys_close_off.bmp', '.ea-close');
	loadInterfaceImage('equipmentpropertieswnd/btn_coparison_resize.bmp', '.ea-compare');
	loadInterfaceImage('scroll0up.bmp', '.ea-scroll-up');
	loadInterfaceImage('scroll0down.bmp', '.ea-scroll-down');
	loadInterfaceImage('scroll0mid.bmp', '.ea-scroll-track');
	loadInterfaceImage('scroll0bar_up.bmp', '.ea-scroll-thumb-top');
	loadInterfaceImage('scroll0bar_down.bmp', '.ea-scroll-thumb-bottom');
	loadInterfaceImage('scroll0bar_mid.bmp', '.ea-scroll-thumb');

	// Inner tiled background
	// 내부 반복 배경
	Client.loadFile(DB.INTERFACE_PATH + 'equipmentpropertieswnd/bg.bmp', data => {
		EquipAbility.ui.find('.ea-inner').css({
			backgroundImage: 'url(' + data + ')',
			backgroundRepeat: 'repeat'
		});
	});

	// Base icon default image
	// 기본 아이콘 기본 이미지
	Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/sys_base_off.bmp', data => {
		EquipAbility.ui.find('.ea-base-icon').css('backgroundImage', 'url(' + data + ')');
	});

	// Base icon hover image
	// 기본 아이콘 hover 이미지
	this.ui.find('.ea-base-icon')
		.off('mouseover mousedown mouseout mouseup')
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

	// Close button hover/click
	// 닫기 버튼 hover/click
	this.ui.find('.ea-close')
		.off('mouseover mousedown mouseout mouseup click')
		.on('mouseover mousedown', () => {
			loadInterfaceImage('basic_interface/sys_close_on.bmp', '.ea-close');
		})
		.on('mouseout mouseup', () => {
			loadInterfaceImage('basic_interface/sys_close_off.bmp', '.ea-close');
		})
		.on('click', () => {
			this.ui.hide();
		});

	// Tab click
	// 탭 클릭
	this.ui.find('.ea-tab').off('click').on('click', function () {
		EquipAbility.setTab(this.getAttribute('data-tab'));
	});

	this.draggable(this.ui.find('.ea-titlebar'));
	bindScrollbarEvents();
	bindAutoRefresh();

	this.refresh();
};

// -------------------------------------------------
// TOGGLE / 열기 닫기
// -------------------------------------------------
EquipAbility.toggle = function toggle() {
	this.ui.toggle();

	if (this.ui.is(':visible')) {
		this.focus();
		this.refresh();
	}
};

// -------------------------------------------------
// REFRESH / 데이터 새로고침
// -------------------------------------------------
EquipAbility.refresh = function refresh() {
	const equipList = getCurrentEquipList();
	
	_lastEquipSignature = getEquipSignature(equipList);

	console.log('[EquipAbility UI] equipList:', equipList);

	const result = EquipAbilityParser.parse(equipList, DB);

	this._result = result;
	this.setTab(_activeTab || 'total');
};

// -------------------------------------------------
// SET TAB / 탭 변경
// -------------------------------------------------
EquipAbility.setTab = function setTab(activeTab) {
	_activeTab = activeTab || 'total';

	// Load tab images
	// 탭 이미지 로딩
	tabs.forEach(tab => {
		const state = tab === _activeTab ? 'on' : 'off';
		const btn = this.ui.find('.ea-tab[data-tab="' + tab + '"]');

		Client.loadFile(DB.INTERFACE_PATH + 'equipmentpropertieswnd/tab_' + tab + '_' + state + '.bmp', data => {
			btn.css('backgroundImage', 'url(' + data + ')');
		});
	});

	this.ui.find('.ea-page').hide();

	const page = this.ui.find('.ea-page[data-page="' + _activeTab + '"]');
	const valueBox = this.ui.find('.ea-left-cover');

	page.show().empty();
	valueBox.empty();

	const rows = filterRowsByTab(this._result, _activeTab);
	renderRows(page, valueBox, rows);
};

// -------------------------------------------------
// Filter rows by tab
// 탭별 행 필터링
// -------------------------------------------------
function filterRowsByTab(result, tab) {
	if (!result) return [];

	const category = tabMap[tab] || tab;
	let rows = [];

	if (category === 'total') {
		rows = Object.values(result.total || {});
	} else {
		rows = (result.categories && result.categories[category]) || [];
	}

	rows = mergeSameRows(rows);

	rows = rows.filter(row => row && row.label && Number(row.value || 0) !== 0);

	rows.sort((a, b) => {
		return Math.abs(Number(b.value || 0)) - Math.abs(Number(a.value || 0));
	});

	return rows;
}
// 같은 이름이어도 +숫자와 +%는 따로 유지
// Keep flat value and percent value separated
function mergeSameRows(rows) {
	const map = {};

	(rows || []).forEach(row => {
		if (!row || !row.label) return;

		const unit = row.unit || '';
		const category = row.category || '';

		const key = category + '|' + row.label + '|' + unit;

		if (!map[key]) {
			map[key] = {
				key: row.key,
				label: row.label,
				value: 0,
				unit: unit,
				category: category,
				source: row.source,
				isError: row.isError
			};
		}

		map[key].value += Number(row.value || 0);
	});

	return Object.values(map);
}

// -------------------------------------------------
// Render rows
// 행 렌더링
// -------------------------------------------------
function renderRows(page, valueBox, rows) {
	let count = 0;

	rows.forEach(row => {
		const value = Number(row.value || 0);
		const valueClass = value < 0 ? ' ea-value-negative' : '';

		valueBox.append(
			'<div class="ea-value-row' + valueClass + '">' +
			escapeHtml(formatValue(row.value, row.unit, row.label)) +
			'</div>'
		);

		page.append(
			'<div class="ea-row" title="' + escapeHtml(row.label) + '">' +
			escapeHtml(row.label) +
			'</div>'
		);

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

// -------------------------------------------------
// Format value
// 값 표시 형식
// -------------------------------------------------
function formatValue(value, unit, label) {
	value = Number(value || 0);
	if (!value) return '';

	const sign = value > 0 ? '+' : '';

	// Seconds unit
	// 초 단위
	if (unit === '초') {
		return sign + Math.abs(value) + '초';
	}

	// Millisecond casting fallback
	// 밀리초 캐스팅 값 보정
	if (label && label.includes('캐스팅') && Math.abs(value) >= 1000) {
		return sign + (Math.abs(value) / 1000).toFixed(1) + '초';
	}

	return sign + value + (unit || '');
}

// -------------------------------------------------
// Update scrollbar
// 스크롤바 갱신
// -------------------------------------------------
function updateScrollbar(rowCount) {
	const innerHeight = 306;
	const rowHeight = 17;

	const contentHeight = Math.max(rowCount * rowHeight, innerHeight);
	_maxScrollTop = Math.max(0, contentHeight - innerHeight);

	const scrollbar = EquipAbility.ui.find('.ea-scrollbar');
	const content = EquipAbility.ui.find('.ea-scroll-content');
	const thumb = EquipAbility.ui.find('.ea-scroll-thumb');

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

	// Keep thumb caps fixed
	// 스크롤 캡 위치 고정
	topCap.css({ top: '0px' });
	bottomCap.css({ bottom: '0px' });
}

// -------------------------------------------------
// Set scroll position
// 스크롤 위치 설정
// -------------------------------------------------
function setScrollTop(value) {
	_scrollTop = Math.max(0, Math.min(_maxScrollTop, value));
	EquipAbility.setTab(_activeTab || 'total');
}

// -------------------------------------------------
// Bind scrollbar events
// 스크롤 이벤트 바인딩
// -------------------------------------------------
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

// -------------------------------------------------
// Scroll thumb move
// 스크롤바 드래그 이동
// -------------------------------------------------
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

// -------------------------------------------------
// Scroll thumb up
// 스크롤바 드래그 종료
// -------------------------------------------------
function onEquipAbilityScrollUp() {
	_scrollDragging = false;
}

// -------------------------------------------------
// Load interface image
// 인터페이스 이미지 로딩
// -------------------------------------------------
function loadInterfaceImage(file, selector) {
	Client.loadFile(DB.INTERFACE_PATH + file, data => {
		EquipAbility.ui.find(selector).css({
			backgroundImage: 'url(' + data + ')',
			backgroundRepeat: selector === '.ea-scroll-track' || selector === '.ea-scroll-thumb' ? 'repeat-y' : 'no-repeat'
		});
	});
}

// -------------------------------------------------
// Load data-background images from HTML
// HTML data-background 이미지 로딩
// -------------------------------------------------
function loadDataBackgrounds() {
	EquipAbility.ui.find('[data-background]').each(function () {
		const el = EquipAbility.ui.find(this);
		const file = el.attr('data-background');

		if (!file) return;

		Client.loadFile(DB.INTERFACE_PATH + file, data => {
			el.css({
				backgroundImage: 'url(' + data + ')'
			});
		});
	});
}

// -------------------------------------------------
// Escape HTML
// HTML 이스케이프
// -------------------------------------------------
function escapeHtml(str) {
	return String(str).replace(/[&<>"']/g, ch => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	}[ch]));
}

// -------------------------------------------------
// 헬퍼 함수 (여기에 추가) helper
// -------------------------------------------------
function getCurrentEquipList() {
	const equipUI = Equipment.getUI ? Equipment.getUI() : Equipment;

	if (equipUI && equipUI._itemlist) {
		const list = equipUI._itemlist;

		// 🔥 핵심: object → array 변환
		const arr = Object.values(list).filter(item => item && item.ITID);

		if (arr.length) {
			return arr;
		}
	}

	console.log('[EquipAbility UI] Equipment._itemlist:', equipUI?._itemlist);

	return [];
}

// -------------------------------------------------
// Auto refresh when equipment changes
// 장비 변경 시 자동 갱신
// -------------------------------------------------
function bindAutoRefresh() {
	if (_autoRefreshTimer) {
		clearInterval(_autoRefreshTimer);
	}

	_autoRefreshTimer = setInterval(function () {
		if (!EquipAbility.ui || !EquipAbility.ui.is(':visible')) return;

		const equipList = getCurrentEquipList();
		const signature = getEquipSignature(equipList);

		if (signature !== _lastEquipSignature) {
			_lastEquipSignature = signature;
			EquipAbility.refresh();
		}
	}, 300);
}

// -------------------------------------------------
// Equipment signature
// 장비 상태 비교용 문자열
// -------------------------------------------------
function getEquipSignature(equipList) {
	return (equipList || []).map(item => {
		if (!item) return '';

		const opt = item.Options || item.option || [];
		const slot = item.slot || {};

		return [
			item.ITID,
			item.RefiningLevel || 0,
			item.enchantgrade || 0,
			slot.card1 || 0,
			slot.card2 || 0,
			slot.card3 || 0,
			slot.card4 || 0,
			JSON.stringify(opt)
		].join(':');
	}).join('|');
}
// -------------------------------------------------
export default UIManager.addComponent(EquipAbility);