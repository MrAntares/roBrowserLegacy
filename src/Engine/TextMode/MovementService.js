import DB from 'DB/DBManager.js';
import Session from 'Engine/SessionStorage.js';
import Network from 'Network/NetworkManager.js';
import PACKETVER from 'Network/PacketVerManager.js';
import PACKET from 'Network/PacketStructure.js';
import EntityManager from 'Renderer/EntityManager.js';
import Entity from 'Renderer/Entity/Entity.js';
import Altitude from 'Renderer/Map/Altitude.js';
import MapRenderer from 'Renderer/MapRenderer.js';
import PathFinding from 'Utils/PathFinding.js';
import { normalizeMapName } from './MonsterSelectionStore.js';

const DIRECTIONS = {
	north: [0, 1],
	south: [0, -1],
	west: [-1, 0],
	east: [1, 0],
	北: [0, 1],
	南: [0, -1],
	西: [-1, 0],
	东: [1, 0]
};

export class MovementError extends Error {}

export class MovementService {
	constructor({ session = Session, network = Network, packet = PACKET, packetver = PACKETVER } = {}) {
		this.session = session;
		this.network = network;
		this.packet = packet;
		this.packetver = packetver;
	}

	assertReady() {
		if (!this.session.Playing || !this.session.Entity) throw new MovementError('角色尚未进入地图。');
	}

	getPath(x, y, range = 0) {
		this.assertReady();
		x = Math.trunc(Number(x));
		y = Math.trunc(Number(y));
		if (!Number.isFinite(x) || !Number.isFinite(y)) throw new MovementError('坐标必须是数字。');
		if (x < 0 || y < 0 || x >= Altitude.width || y >= Altitude.height)
			throw new MovementError('坐标超出地图范围。');
		if (range === 0 && !(Altitude.getCellType(x, y) & Altitude.TYPE.WALKABLE)) {
			throw new MovementError(`坐标 (${x},${y}) 不可行走。`);
		}
		const out = [];
		const player = this.session.Entity;
		const count = PathFinding.search(
			Math.trunc(player.position[0]),
			Math.trunc(player.position[1]),
			x,
			y,
			range,
			out
		);
		if (!count) throw new MovementError(`无法到达 (${x},${y})。`);
		return { out, count, length: count - 1, destination: [out[(count - 1) * 2], out[(count - 1) * 2 + 1]] };
	}

	sendMove(destination) {
		const pkt =
			this.packetver.value >= 20180307 ? new this.packet.CZ.REQUEST_MOVE2() : new this.packet.CZ.REQUEST_MOVE();
		pkt.dest[0] = destination[0];
		pkt.dest[1] = destination[1];
		this.network.sendPacket(pkt);
	}

	moveTo(x, y) {
		this.session.moveAction = null;
		const path = this.getPath(x, y);
		if (path.length) this.sendMove(path.destination);
		return path;
	}

	moveDirection(direction, steps = 1) {
		this.assertReady();
		const delta = DIRECTIONS[String(direction).toLowerCase()] || DIRECTIONS[direction];
		if (!delta) throw new MovementError(`未知方向“${direction}”。`);
		steps = Math.max(1, Math.min(100, Math.trunc(Number(steps) || 1)));
		return this.moveTo(
			this.session.Entity.position[0] + delta[0] * steps,
			this.session.Entity.position[1] + delta[1] * steps
		);
	}

	moveToEntity(gid, range = 1) {
		const entity = EntityManager.get(Number(gid));
		if (!entity) throw new MovementError('目标已离开附近。');
		return this.moveToRange(entity.position[0], entity.position[1], range);
	}

	moveToRange(x, y, range) {
		this.session.moveAction = null;
		const path = this.getPath(x, y, range);
		if (path.length > 0) this.sendMove(path.destination);
		return path;
	}

	moveToLandmark(query) {
		const currentMap = normalizeMapName(MapRenderer.currentMap);
		const result = DB.searchNavigation(String(query), 'NPC').find(
			item => normalizeMapName(item.mapName) === currentMap
		);
		if (!result) throw new MovementError(`当前地图没有找到地点“${query}”。`);
		this.moveTo(result.x, result.y);
		return result;
	}

	attackEntity(gid) {
		this.assertReady();
		const entity = EntityManager.get(Number(gid));
		if (!entity || ![Entity.TYPE_MOB, Entity.TYPE_NPC_ABR, Entity.TYPE_NPC_BIONIC].includes(entity.objecttype)) {
			throw new MovementError('怪物目标已消失。');
		}
		if (entity.action === entity.ACTION?.DIE) throw new MovementError('怪物已经死亡。');
		const path = this.getPath(entity.position[0], entity.position[1], this.session.Entity.attack_range + 1);
		const action =
			this.packetver.value >= 20180307 ? new this.packet.CZ.REQUEST_ACT2() : new this.packet.CZ.REQUEST_ACT();
		action.action = 7;
		action.targetGID = entity.GID;
		if (path.count < 2) this.network.sendPacket(action);
		else {
			this.session.moveAction = action;
			this.sendMove(path.destination);
		}
		return path;
	}

	cancelMovement() {
		this.session.moveAction = null;
		if (!this.session.Playing || !this.session.Entity) return;
		const position = this.session.Entity.position;
		this.sendMove([Math.trunc(position[0]), Math.trunc(position[1])]);
	}
}

export default new MovementService();
