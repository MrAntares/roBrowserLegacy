import Session from 'Engine/SessionStorage.js';
import EntityManager from 'Renderer/EntityManager.js';
import Entity from 'Renderer/Entity/Entity.js';
import Altitude from 'Renderer/Map/Altitude.js';
import MapRenderer from 'Renderer/MapRenderer.js';
import UIManager from 'UI/UIManager.js';
import MovementService, { MovementError } from './MovementService.js';
import MonsterIndexService from './MonsterIndexService.js';
import MonsterSelectionStore, { normalizeMapName } from './MonsterSelectionStore.js';
import AutomationProfileStore from './AutomationProfileStore.js';
import AutomationActionService from './AutomationActionService.js';

const TICK_MS = 500;
const ATTACK_RETRY_MS = 700;
const BLOCKING_COMPONENTS = [
	'NpcBox',
	'NpcMenu',
	'NpcStore',
	'Trade',
	'Storage',
	'Rodex',
	'ReadRodex',
	'WriteRodex',
	'VendingShop'
];

export class AutoCombatService {
	constructor({
		session = Session,
		movement = MovementService,
		index = MonsterIndexService,
		selectionStore = MonsterSelectionStore,
		profileStore = AutomationProfileStore,
		actions = null,
		entityManager = EntityManager,
		uiManager = UIManager,
		setIntervalFn = globalThis.setInterval,
		clearIntervalFn = globalThis.clearInterval,
		nowFn = Date.now
	} = {}) {
		this.session = session;
		this.movement = movement;
		this.index = index;
		this.selectionStore = selectionStore;
		this.profileStore = profileStore;
		this.entityManager = entityManager;
		this.actions = actions || new AutomationActionService({ session, movement, entityManager });
		this.uiManager = uiManager;
		this.setIntervalFn = setIntervalFn;
		this.clearIntervalFn = clearIntervalFn;
		this.nowFn = nowFn;
		this.state = 'stopped';
		this.mapName = '';
		this.targetGid = null;
		this.timer = null;
		this.lastAttackAt = 0;
		this.lastPatrolAt = 0;
		this.visits = new Map();
		this.listeners = new Set();
		this.ruleLastRun = new Map();
		this.recovery = null;
		this.status = '已停止';
	}

	subscribe(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	emit(status = this.status) {
		this.status = status;
		for (const listener of this.listeners) listener(this.getSnapshot());
	}

	getSnapshot() {
		return { state: this.state, status: this.status, targetGid: this.targetGid, mapName: this.mapName };
	}

	onMapLoaded(mapName) {
		this.stop('地图已切换；挂机保持停止。');
		this.mapName = normalizeMapName(mapName);
		this.index.reset();
		this.visits.clear();
		this.ruleLastRun.clear();
		this.recovery = null;
	}

	getSelection() {
		return this.selectionStore.get(this.mapName || MapRenderer.currentMap);
	}

	start() {
		const selection = this.getSelection();
		if (!selection.size) throw new Error('请先勾选至少一种怪物。');
		if (!this.session.Playing || !this.session.Entity) throw new Error('角色尚未进入地图。');
		this.state = 'running';
		this.targetGid = null;
		this.recovery = null;
		this.ensureTimer();
		this.emit('正在当前地图寻找已勾选怪物；不会进入传送点。');
		this.tick();
	}

	pause(reason = '已暂停；勾选和设置已保留。') {
		if (this.state === 'stopped') return;
		this.state = 'paused';
		this.targetGid = null;
		this.recovery = null;
		try {
			this.movement.cancelMovement();
		} catch (_error) {
			// A disconnect can close the socket before the cancel packet is sent.
			this.session.moveAction = null;
		}
		this.emit(reason);
	}

	resume() {
		if (this.state !== 'paused') return;
		this.start();
	}

	stop(reason = '已停止；怪物勾选已保留。') {
		const wasActive = this.state !== 'stopped';
		this.state = 'stopped';
		this.targetGid = null;
		this.recovery = null;
		if (this.timer !== null) this.clearIntervalFn(this.timer);
		this.timer = null;
		if (wasActive) {
			try {
				this.movement.cancelMovement();
			} catch (_error) {
				this.session.moveAction = null;
			}
		} else this.session.moveAction = null;
		this.emit(reason);
	}

	ensureTimer() {
		if (this.timer === null) this.timer = this.setIntervalFn(() => this.tick(), TICK_MS);
	}

	unsafeReason() {
		if (!this.session.Playing || !this.session.Entity) return '连接已中断，挂机已暂停。';
		if (normalizeMapName(MapRenderer.currentMap) !== this.mapName) return '地图已切换，挂机已暂停。';
		if (this.session.FreezeUI) return '对话或功能窗口已打开，挂机已暂停。';
		if (this.hasBlockingWindow()) return 'NPC、交易、仓库或邮件窗口已打开，挂机已暂停。';
		if (this.session.Entity.action === this.session.Entity.ACTION?.DIE) return '角色已死亡，挂机已暂停。';
		return null;
	}

	hasBlockingWindow() {
		return BLOCKING_COMPONENTS.some(name => {
			const component = this.uiManager.components?.[name];
			const host = component?._host;
			if (!host?.isConnected) return false;
			const style = globalThis.getComputedStyle?.(host);
			return !style || (style.display !== 'none' && style.visibility !== 'hidden');
		});
	}

	tick() {
		if (this.state !== 'running') return;
		const unsafe = this.unsafeReason();
		if (unsafe) {
			this.pause(unsafe);
			return;
		}

		const selected = this.getSelection();
		if (!selected.size) {
			this.stop('勾选已清空，挂机已停止。');
			return;
		}

		const nearby = this.index.getNearby();
		const candidates = nearby
			.filter(monster => selected.has(monster.speciesId))
			.map(monster => {
				try {
					return { ...monster, pathDistance: this.index.getPathDistance(monster.entity, this.movement) };
				} catch (_error) {
					return { ...monster, pathDistance: Infinity };
				}
			})
			.filter(monster => Number.isFinite(monster.pathDistance))
			.sort((a, b) => a.pathDistance - b.pathDistance || a.distance - b.distance);

		const profile = this.profileStore.get();
		if (this.handleLowHp(profile)) return;

		const current = candidates.find(monster => monster.gid === this.targetGid);
		const target = current || candidates[0];
		if (this.runConfiguredRule(profile, nearby, target)) return;
		if (!target) {
			this.targetGid = null;
			if (profile.loot.enabled) {
				try {
					if (this.actions.pickUpNearest(profile.loot.radius)) {
						this.emit('正在拾取附近物品。');
						return;
					}
				} catch (error) {
					if (!(error instanceof MovementError)) console.warn('[TextMode] Auto pickup error:', error);
				}
			}
			this.patrol();
			return;
		}

		this.targetGid = target.gid;
		if (this.nowFn() - this.lastAttackAt < ATTACK_RETRY_MS) return;
		try {
			this.actions.attackEntity(target.gid);
			this.lastAttackAt = this.nowFn();
			this.emit(`正在攻击 @${target.label} ${target.name}。`);
		} catch (error) {
			this.targetGid = null;
			if (!(error instanceof MovementError)) console.warn('[TextMode] Auto combat error:', error);
		}
	}

	getPercent(current, maximum) {
		return current >= 0 && maximum > 0 ? (current / maximum) * 100 : null;
	}

	handleLowHp(profile) {
		const life = this.session.Entity.life || {};
		const hpPercent = this.getPercent(life.hp, life.hp_max);
		if (hpPercent === null || hpPercent > profile.safety.lowHpPercent) {
			this.recovery = null;
			return false;
		}
		const now = this.nowFn();
		if (this.recovery) {
			if (life.hp > this.recovery.hpBefore) {
				this.recovery = null;
				return false;
			}
			if (now - this.recovery.at < profile.safety.recoveryTimeoutMs) return true;
		}
		const attempts = (this.recovery?.attempts || 0) + 1;
		if (attempts > profile.safety.maxRecoveryAttempts) {
			this.stop('低血量恢复连续失败，挂机已停止，请人工处理。');
			return true;
		}
		let recoveryRule = null;
		for (const rule of profile.rules) {
			if (!rule.enabled || rule.kind !== 'recovery') continue;
			if (this.actions.useItem(rule.itemId)) {
				recoveryRule = rule;
				break;
			}
			rule.enabled = false;
			this.profileStore.set(profile);
		}
		if (!recoveryRule) {
			this.stop('生命值低于安全阈值且没有可用恢复物品，挂机已停止。');
			return true;
		}
		this.recovery = { hpBefore: life.hp, at: now, attempts };
		this.ruleLastRun.set(recoveryRule.id, now);
		this.emit(`生命值 ${Math.round(hpPercent)}%，正在使用恢复物品。`);
		return true;
	}

	runConfiguredRule(profile, nearby, target) {
		const life = this.session.Entity.life || {};
		const hpPercent = this.getPercent(life.hp, life.hp_max);
		const spPercent = this.getPercent(life.sp, life.sp_max);
		const now = this.nowFn();
		for (const rule of profile.rules) {
			if (!rule.enabled || rule.kind === 'recovery' || !rule.skillId) continue;
			if (now - (this.ruleLastRun.get(rule.id) || 0) < rule.intervalMs) continue;
			if (rule.hpBelow !== null && (hpPercent === null || hpPercent > rule.hpBelow)) continue;
			if (rule.spAbove > 0 && (spPercent === null || spPercent < rule.spAbove)) continue;
			if (rule.nearbyCount > 0) {
				const count = nearby.filter(monster => monster.distance <= rule.radius).length;
				if (count < rule.nearbyCount) continue;
			}
			if (['current-target', 'target-cell'].includes(rule.target) && !target) continue;
			if (this.actions.getSkill && !this.actions.getSkill(rule.skillId)) {
				rule.enabled = false;
				this.profileStore.set(profile);
				continue;
			}
			try {
				if (!this.actions.useSkill(rule, target)) continue;
			} catch (error) {
				console.warn('[TextMode] Automation skill error:', error);
				continue;
			}
			this.ruleLastRun.set(rule.id, now);
			this.emit(`正在执行${rule.kind === 'escape' ? '解围' : rule.kind === 'support' ? '辅助' : '主动'}技能。`);
			return true;
		}
		return false;
	}

	patrol() {
		if (this.nowFn() - this.lastPatrolAt < 3000) return;
		const player = this.session.Entity;
		if (!player) return;
		const now = this.nowFn();
		const candidates = [];
		for (let radius = 15; radius <= 25; radius += 2) {
			for (let angle = 0; angle < 16; angle++) {
				const x = Math.round(player.position[0] + Math.cos((angle * Math.PI) / 8) * radius);
				const y = Math.round(player.position[1] + Math.sin((angle * Math.PI) / 8) * radius);
				if (!this.isSafePatrolCell(x, y)) continue;
				try {
					const path = this.movement.getPath(x, y);
					if (!this.isSafePatrolPath(path)) continue;
					candidates.push({ x, y, path, visited: this.visits.get(`${x},${y}`) || 0 });
				} catch (_error) {
					// Unreachable cells are deliberately excluded.
				}
			}
		}
		const destination = candidates.sort((a, b) => a.visited - b.visited || b.path.length - a.path.length)[0];
		if (!destination) {
			this.emit('未发现怪物，也没有安全可达的巡逻点。');
			return;
		}
		this.visits.set(`${destination.x},${destination.y}`, now);
		this.lastPatrolAt = now;
		this.movement.moveTo(destination.x, destination.y);
		this.emit('未发现已勾选怪物，正在当前地图安全巡逻。');
	}

	isSafePatrolCell(x, y) {
		if (x < 1 || y < 1 || x >= Altitude.width - 1 || y >= Altitude.height - 1) return false;
		if (!(Altitude.getCellType(x, y) & Altitude.TYPE.WALKABLE)) return false;
		let safe = true;
		this.entityManager.forEach(entity => {
			if (!entity.position) return;
			if (Math.trunc(entity.position[0]) !== x || Math.trunc(entity.position[1]) !== y) return;
			if ([Entity.TYPE_WARP, Entity.TYPE_NPC, Entity.TYPE_NPC2].includes(entity.objecttype)) safe = false;
		});
		return safe;
	}

	isSafePatrolPath(path) {
		const blocked = new Set();
		this.entityManager.forEach(entity => {
			if (!entity.position || ![Entity.TYPE_WARP, Entity.TYPE_NPC, Entity.TYPE_NPC2].includes(entity.objecttype))
				return;
			const x = Math.trunc(entity.position[0]);
			const y = Math.trunc(entity.position[1]);
			const margin = entity.objecttype === Entity.TYPE_WARP ? 1 : 0;
			for (let dx = -margin; dx <= margin; dx++) {
				for (let dy = -margin; dy <= margin; dy++) blocked.add(`${x + dx},${y + dy}`);
			}
		});
		for (let i = 1; i < path.count; i++) {
			if (blocked.has(`${path.out[i * 2]},${path.out[i * 2 + 1]}`)) return false;
		}
		return true;
	}
}

export default new AutoCombatService();
