import DB from 'DB/DBManager.js';
import ItemType from 'DB/Items/ItemType.js';
import Session from 'Engine/SessionStorage.js';
import Network from 'Network/NetworkManager.js';
import PACKETVER from 'Network/PacketVerManager.js';
import PACKET from 'Network/PacketStructure.js';
import EntityManager from 'Renderer/EntityManager.js';
import Entity from 'Renderer/Entity/Entity.js';
import Inventory from 'UI/Components/Inventory/Inventory.js';
import SkillList from 'UI/Components/SkillList/SkillList.js';
import SkillTargetSelection from 'UI/Components/SkillTargetSelection/SkillTargetSelection.js';
import MovementService from './MovementService.js';

const USABLE_ITEM_TYPES = new Set([ItemType.HEALING, ItemType.USABLE, ItemType.CASH]);

export class AutomationActionService {
	constructor({ session = Session, movement = MovementService, entityManager = EntityManager } = {}) {
		this.session = session;
		this.movement = movement;
		this.entityManager = entityManager;
	}

	getSkills() {
		try {
			return SkillList.getUI()
				.getSkills()
				.filter(skill => skill.level > 0 && skill.type)
				.map(skill => ({ ...skill, name: DB.getSkillName(skill.SKID) || skill.skillName || `#${skill.SKID}` }));
		} catch (_error) {
			return [];
		}
	}

	getUsableItems() {
		try {
			return Inventory.getUI()
				.list.filter(item => item.count > 0 && USABLE_ITEM_TYPES.has(item.type))
				.map(item => ({
					id: item.ITID,
					index: item.index,
					count: item.count,
					name: DB.getItemName(item, { showItemRefine: false, showItemSlots: false, showItemOptions: false })
				}));
		} catch (_error) {
			return [];
		}
	}

	getSkill(skillId) {
		return this.getSkills().find(skill => skill.SKID === Number(skillId)) || null;
	}

	useSkill(rule, target) {
		const skill = this.getSkill(rule.skillId);
		if (!skill) return false;
		const level = Math.min(skill.level, Math.max(1, Number(rule.level) || 1));
		const entityTarget = target?.entity || (rule.target === 'self' ? this.session.Entity : null);
		if (rule.target === 'self') {
			if (!(skill.type & SkillTargetSelection.TYPE.SELF) && !(skill.type & SkillTargetSelection.TYPE.FRIEND))
				return false;
			SkillTargetSelection.onUseSkillToId(skill.SKID, level, this.session.Entity.GID);
			return true;
		}
		if (rule.target === 'current-target') {
			if (!entityTarget || !(skill.type & (SkillTargetSelection.TYPE.ENEMY | SkillTargetSelection.TYPE.TRAP)))
				return false;
			SkillTargetSelection.onUseSkillToId(skill.SKID, level, entityTarget.GID);
			return true;
		}
		if (!(skill.type & SkillTargetSelection.TYPE.PLACE)) return false;
		const position = rule.target === 'self-cell' ? this.session.Entity.position : entityTarget?.position;
		if (!position) return false;
		SkillTargetSelection.onUseSkillToPos(skill.SKID, level, Math.trunc(position[0]), Math.trunc(position[1]));
		return true;
	}

	useItem(itemId) {
		const item = this.getUsableItems().find(candidate => candidate.id === Number(itemId));
		if (!item) return false;
		Inventory.getUI().onUseItem(item.index);
		return true;
	}

	attackEntity(gid) {
		return this.movement.attackEntity(gid);
	}

	pickUpNearest(radius) {
		const player = this.session.Entity;
		if (!player) return false;
		let closest = null;
		let closestDistance = Infinity;
		this.entityManager.forEach(entity => {
			if (entity.objecttype !== Entity.TYPE_ITEM || !entity.position) return;
			const distance = Math.hypot(
				entity.position[0] - player.position[0],
				entity.position[1] - player.position[1]
			);
			if (distance <= radius && distance < closestDistance) {
				closest = entity;
				closestDistance = distance;
			}
		});
		if (!closest) return false;
		const packet = PACKETVER.value >= 20180307 ? new PACKET.CZ.ITEM_PICKUP2() : new PACKET.CZ.ITEM_PICKUP();
		packet.ITAID = closest.GID;
		if (closestDistance > 2) {
			const path = this.movement.getPath(closest.position[0], closest.position[1], 2);
			this.session.moveAction = packet;
			this.movement.sendMove(path.destination);
		} else Network.sendPacket(packet);
		return true;
	}
}

export default new AutomationActionService();
