import DB from 'DB/DBManager.js';
import Session from 'Engine/SessionStorage.js';
import MapRenderer from 'Renderer/MapRenderer.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import MovementService from 'Engine/TextMode/MovementService.js';
import MonsterIndexService from 'Engine/TextMode/MonsterIndexService.js';
import MonsterSelectionStore from 'Engine/TextMode/MonsterSelectionStore.js';
import AutoCombatService from 'Engine/TextMode/AutoCombatService.js';
import AutomationActionService from 'Engine/TextMode/AutomationActionService.js';
import AutomationProfileStore from 'Engine/TextMode/AutomationProfileStore.js';
import { TextCommandService } from 'Engine/TextMode/TextCommandService.js';
import htmlText from './TextMode.html?raw';
import cssText from './TextMode.css?raw';

const TextMode = new GUIComponent('TextMode', cssText);
TextMode.render = () => htmlText;
TextMode.captureKeyEvents = true;
TextMode._refreshTimer = null;
TextMode._mapName = '';
TextMode._unsubscribeAutomation = null;
TextMode._actionCatalogKey = '';

const RULE_KIND_LABELS = {
	offense: '主动',
	support: '辅助',
	escape: '解围',
	recovery: '恢复'
};

function saveProfile(profile) {
	AutomationProfileStore.set(profile);
	renderStrategy();
}

function getActionName(rule) {
	if (rule.kind === 'recovery')
		return (
			AutomationActionService.getUsableItems().find(item => item.id === rule.itemId)?.name ||
			`物品 #${rule.itemId}`
		);
	return (
		AutomationActionService.getSkills().find(skill => skill.SKID === rule.skillId)?.name || `技能 #${rule.skillId}`
	);
}

function populateRuleTargets() {
	const root = TextMode.getRoot();
	const kind = root.querySelector('#rule-kind').value;
	const target = root.querySelector('#rule-target');
	const previous = target.value;
	target.replaceChildren();
	if (kind === 'recovery') {
		target.append(new Option('自己', 'self'));
		target.disabled = true;
		return;
	}
	const skill = AutomationActionService.getSkills().find(
		candidate => candidate.SKID === Number(root.querySelector('#rule-action').value)
	);
	if (!skill) {
		target.append(new Option('无可用目标', ''));
		target.disabled = true;
		return;
	}
	if (skill.type & 4 || skill.type & 16) target.append(new Option('自己', 'self'));
	if (skill.type & 1 || skill.type & 32) target.append(new Option('当前怪物', 'current-target'));
	if (skill.type & 2) {
		target.append(new Option('自己脚下', 'self-cell'));
		target.append(new Option('目标位置', 'target-cell'));
	}
	target.disabled = false;
	if ([...target.options].some(option => option.value === previous)) target.value = previous;
}

function populateRuleActions(force = false) {
	const root = TextMode.getRoot();
	const kind = root.querySelector('#rule-kind').value;
	const select = root.querySelector('#rule-action');
	const actions =
		kind === 'recovery'
			? AutomationActionService.getUsableItems().map(item => ({
					value: item.id,
					label: `${item.name} ×${item.count}`
				}))
			: AutomationActionService.getSkills().map(skill => ({
					value: skill.SKID,
					label: `${skill.name} Lv.${skill.level}`
				}));
	const catalogKey = `${kind}:${actions.map(action => action.value).join(',')}`;
	if (!force && catalogKey === TextMode._actionCatalogKey) return;
	TextMode._actionCatalogKey = catalogKey;
	const previous = select.value;
	select.replaceChildren();
	for (const action of actions) select.append(new Option(action.label, action.value));
	if (!actions.length) select.append(new Option(kind === 'recovery' ? '背包没有可用物品' : '没有已学主动技能', ''));
	if (actions.some(action => String(action.value) === previous)) select.value = previous;
	populateRuleTargets();
	root.querySelector('#rule-level').disabled = kind === 'recovery';
	root.querySelector('#rule-count').value = kind === 'escape' ? '3' : '0';
}

function moveRule(profile, index, delta) {
	const target = index + delta;
	if (target < 0 || target >= profile.rules.length) return;
	[profile.rules[index], profile.rules[target]] = [profile.rules[target], profile.rules[index]];
	saveProfile(profile);
}

function renderStrategy() {
	const root = TextMode.getRoot();
	if (!root) return;
	const profile = AutomationProfileStore.get();
	root.querySelector('#low-hp').value = profile.safety.lowHpPercent;
	root.querySelector('#loot-enabled').checked = profile.loot.enabled;
	root.querySelector('#loot-radius').value = profile.loot.radius;
	const list = root.querySelector('#rules');
	list.replaceChildren();
	if (!profile.rules.length) {
		list.append(createText('p', 'empty', '尚未配置规则'));
		return;
	}
	profile.rules.forEach((rule, index) => {
		const row = document.createElement('div');
		row.className = 'rule-item';
		const enabled = document.createElement('input');
		enabled.type = 'checkbox';
		enabled.checked = rule.enabled;
		enabled.addEventListener('change', () => {
			profile.rules[index].enabled = enabled.checked;
			saveProfile(profile);
		});
		const details = createText(
			'span',
			'name',
			`${index + 1}. ${RULE_KIND_LABELS[rule.kind]}：${getActionName(rule)}，间隔 ${rule.intervalMs / 1000} 秒`
		);
		const controls = document.createElement('span');
		controls.className = 'controls';
		for (const [text, handler] of [
			['↑', () => moveRule(profile, index, -1)],
			['↓', () => moveRule(profile, index, 1)],
			[
				'删',
				() => {
					profile.rules.splice(index, 1);
					saveProfile(profile);
				}
			]
		]) {
			const button = document.createElement('button');
			button.type = 'button';
			button.textContent = text;
			button.addEventListener('click', handler);
			controls.append(button);
		}
		row.append(enabled, details, controls);
		list.append(row);
	});
}

const commands = new TextCommandService({
	movement: MovementService,
	monsterIndex: MonsterIndexService,
	autoCombat: AutoCombatService,
	selectionStore: MonsterSelectionStore,
	getMapName: () => TextMode._mapName
});

function setStatus(message, error = false) {
	const element = TextMode.getRoot()?.querySelector('#status');
	if (!element) return;
	element.textContent = `状态：${message}`;
	element.classList.toggle('error', error);
}

function run(action) {
	try {
		const result = action();
		if (result) setStatus(result);
	} catch (error) {
		setStatus(error.message || String(error), true);
	}
}

function createText(tag, className, text) {
	const element = document.createElement(tag);
	element.className = className;
	element.textContent = text;
	return element;
}

function renderNearby() {
	const root = TextMode.getRoot();
	const list = root.querySelector('#nearby');
	const selectedGid = Number(root.querySelector('input[name="nearby"]:checked')?.value);
	const monsters = MonsterIndexService.getNearby();
	list.replaceChildren();
	if (!monsters.length) {
		list.append(createText('p', 'empty', '附近没有怪物'));
		return;
	}
	for (const monster of monsters) {
		const label = document.createElement('label');
		label.className = 'item';
		const radio = document.createElement('input');
		radio.type = 'radio';
		radio.name = 'nearby';
		radio.value = monster.gid;
		radio.checked = monster.gid === selectedGid;
		label.append(radio, createText('span', 'name', `@${monster.label} ${monster.name}`));
		const hp = monster.hpPercent === null ? '' : `  HP ${monster.hpPercent}%`;
		label.append(createText('span', 'meta', `${Math.round(monster.distance)}格${hp}`));
		list.append(label);
	}
}

function renderSpecies() {
	const list = TextMode.getRoot().querySelector('#species');
	const selected = MonsterSelectionStore.get(TextMode._mapName);
	const species = MonsterIndexService.getSpeciesCatalog();
	list.replaceChildren();
	if (!species.length) {
		list.append(createText('p', 'empty', '本地图资料中没有怪物'));
		return;
	}
	for (const monster of species) {
		const label = document.createElement('label');
		label.className = 'item';
		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.checked = selected.has(monster.id);
		checkbox.addEventListener('change', () => {
			MonsterSelectionStore.toggle(TextMode._mapName, monster.id, checkbox.checked);
			setStatus(`${checkbox.checked ? '已勾选' : '已取消'} ${monster.name}；挂机状态未改变。`);
		});
		label.append(checkbox, createText('span', 'name', monster.name));
		const description = monster.count
			? `附近${monster.count}只，最近${Math.round(monster.nearest)}格`
			: '附近0只，本地图存在';
		label.append(createText('span', 'meta', description));
		list.append(label);
	}
}

function refresh() {
	if (!Session.Entity) return;
	const root = TextMode.getRoot();
	const mapLabel = DB.getMapName(MapRenderer.currentMap, TextMode._mapName || MapRenderer.currentMap);
	root.querySelector('#position').textContent =
		`当前位置：${mapLabel} (${Math.trunc(Session.Entity.position[0])},${Math.trunc(Session.Entity.position[1])})`;
	renderNearby();
	renderSpecies();
	populateRuleActions();
}

TextMode.init = function init() {
	const root = this.getRoot();
	this.draggable(root.querySelector('header'));
	root.querySelector('#collapse').addEventListener('click', () => {
		root.querySelector('.panel').classList.toggle('collapsed');
		root.querySelector('#collapse').textContent = root.querySelector('.panel').classList.contains('collapsed')
			? '+'
			: '−';
	});
	root.querySelectorAll('[data-direction]').forEach(button => {
		button.addEventListener('click', () =>
			run(() => {
				MovementService.moveDirection(button.dataset.direction, root.querySelector('#steps').value);
				return `正在向${button.dataset.direction}移动。`;
			})
		);
	});
	root.querySelector('#coordinate-form').addEventListener('submit', event => {
		event.preventDefault();
		run(() => {
			MovementService.moveTo(root.querySelector('#x').value, root.querySelector('#y').value);
			return `正在前往 (${root.querySelector('#x').value},${root.querySelector('#y').value})。`;
		});
	});
	root.querySelector('#go-landmark').addEventListener('click', () =>
		run(() => {
			const landmark = MovementService.moveToLandmark(root.querySelector('#landmark').value);
			return `正在前往 ${landmark.name}。`;
		})
	);
	root.querySelector('#cancel-movement').addEventListener('click', () =>
		run(() => {
			MovementService.cancelMovement();
			return '已取消当前移动和排队攻击。';
		})
	);
	root.querySelector('#attack-target').addEventListener('click', () =>
		run(() => {
			const gid = root.querySelector('input[name="nearby"]:checked')?.value;
			if (!gid) throw new Error('请先选择一个附近怪物。');
			const monster = MonsterIndexService.getNearby().find(item => item.gid === Number(gid));
			if (!monster) throw new Error('所选怪物已离开附近。');
			AutoCombatService.stop('单只目标攻击。');
			MovementService.attackEntity(gid);
			return `正在攻击 @${monster.label} ${monster.name}；目标死亡后停止。`;
		})
	);
	root.querySelector('#start').addEventListener('click', () => run(() => AutoCombatService.start()));
	root.querySelector('#pause').addEventListener('click', () =>
		run(() => {
			if (AutoCombatService.state === 'paused') AutoCombatService.resume();
			else AutoCombatService.pause();
		})
	);
	root.querySelector('#stop').addEventListener('click', () =>
		run(() => {
			const wasActive = AutoCombatService.state !== 'stopped';
			AutoCombatService.stop();
			if (!wasActive) MovementService.cancelMovement();
		})
	);
	root.querySelector('#clear').addEventListener('click', () =>
		run(() => {
			MonsterSelectionStore.clear(TextMode._mapName);
			if (AutoCombatService.state === 'running') AutoCombatService.stop('勾选已清空，挂机已停止。');
			refresh();
			return '已清空当前地图的怪物勾选。';
		})
	);
	root.querySelector('#low-hp').addEventListener('change', event => {
		const profile = AutomationProfileStore.get();
		profile.safety.lowHpPercent = event.target.value;
		saveProfile(profile);
	});
	root.querySelector('#loot-enabled').addEventListener('change', event => {
		const profile = AutomationProfileStore.get();
		profile.loot.enabled = event.target.checked;
		saveProfile(profile);
	});
	root.querySelector('#loot-radius').addEventListener('change', event => {
		const profile = AutomationProfileStore.get();
		profile.loot.radius = event.target.value;
		saveProfile(profile);
	});
	root.querySelector('#rule-kind').addEventListener('change', () => populateRuleActions(true));
	root.querySelector('#rule-action').addEventListener('change', populateRuleTargets);
	root.querySelector('#rule-form').addEventListener('submit', event => {
		event.preventDefault();
		const actionId = Number(root.querySelector('#rule-action').value);
		if (!actionId) return setStatus('当前没有可添加的技能或物品。', true);
		const kind = root.querySelector('#rule-kind').value;
		const profile = AutomationProfileStore.get();
		profile.rules.push({
			id: globalThis.crypto?.randomUUID?.() || `rule-${Date.now()}`,
			enabled: true,
			kind,
			skillId: kind === 'recovery' ? null : actionId,
			itemId: kind === 'recovery' ? actionId : null,
			level: root.querySelector('#rule-level').value,
			target: root.querySelector('#rule-target').value,
			hpBelow: root.querySelector('#rule-hp').value || null,
			spAbove: root.querySelector('#rule-sp').value,
			nearbyCount: root.querySelector('#rule-count').value,
			radius: root.querySelector('#rule-radius').value,
			intervalMs: Number(root.querySelector('#rule-interval').value) * 1000
		});
		saveProfile(profile);
		setStatus('策略规则已添加；运行中会在下一个周期生效。');
	});
	root.querySelector('#command-form').addEventListener('submit', event => {
		event.preventDefault();
		run(() => commands.execute(root.querySelector('#command').value));
	});
	this._unsubscribeAutomation?.();
	this._unsubscribeAutomation = AutoCombatService.subscribe(snapshot => {
		root.querySelector('#pause').textContent = snapshot.state === 'paused' ? '继续' : '暂停';
		setStatus(snapshot.status);
	});
	populateRuleActions(true);
	renderStrategy();
};

TextMode.setMap = function setMap(mapName) {
	this._mapName = String(mapName || '')
		.replace(/\.gat$/i, '')
		.toLowerCase();
	AutoCombatService.onMapLoaded(this._mapName);
	const select = this.getRoot().querySelector('#landmark');
	select.replaceChildren(new Option('请选择', ''));
	for (const npc of DB.getNavigationNpcsForMap(this._mapName))
		select.append(new Option(`${npc.name} (${npc.x},${npc.y})`, npc.name));
	refresh();
};

TextMode.onAppend = function onAppend() {
	if (this._refreshTimer === null) this._refreshTimer = window.setInterval(refresh, 750);
	refresh();
	populateRuleActions(true);
	renderStrategy();
};

TextMode.onRemove = function onRemove() {
	if (this._refreshTimer !== null) window.clearInterval(this._refreshTimer);
	this._refreshTimer = null;
	this._unsubscribeAutomation?.();
	this._unsubscribeAutomation = null;
	const wasActive = AutoCombatService.state !== 'stopped';
	AutoCombatService.stop('文字模式已关闭，挂机已停止。');
	if (!wasActive) MovementService.cancelMovement();
};

export default UIManager.addComponent(TextMode);
