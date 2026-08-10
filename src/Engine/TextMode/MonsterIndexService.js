import DB from 'DB/DBManager.js';
import Session from 'Engine/SessionStorage.js';
import EntityManager from 'Renderer/EntityManager.js';
import Entity from 'Renderer/Entity/Entity.js';
import MapRenderer from 'Renderer/MapRenderer.js';

const MOB_TYPES = new Set([Entity.TYPE_MOB, Entity.TYPE_NPC_ABR, Entity.TYPE_NPC_BIONIC]);

export class MonsterIndexService {
	constructor({ entityManager = EntityManager, session = Session, db = DB } = {}) {
		this.entityManager = entityManager;
		this.session = session;
		this.db = db;
		this.labels = new Map();
		this.nextLabel = 1;
		this.knownSpecies = new Map();
		this.navigationSpecies = null;
	}

	reset() {
		this.labels.clear();
		this.nextLabel = 1;
		this.knownSpecies.clear();
		this.navigationSpecies = null;
	}

	isMonster(entity) {
		return Boolean(entity && MOB_TYPES.has(entity.objecttype));
	}

	isAlive(entity) {
		return this.isMonster(entity) && entity.action !== entity.ACTION?.DIE;
	}

	getSpeciesId(entity) {
		return Number(entity?.job ?? entity?._job);
	}

	getName(entity) {
		const speciesId = this.getSpeciesId(entity);
		return entity?.display?.name || entity?.name || this.db.getMonsterName(speciesId);
	}

	getDistance(entity) {
		const player = this.session.Entity;
		if (!player || !entity?.position) return Infinity;
		return Math.hypot(entity.position[0] - player.position[0], entity.position[1] - player.position[1]);
	}

	getPathDistance(entity, movementService) {
		return (
			movementService?.getPath(entity.position[0], entity.position[1], this.session.Entity?.attack_range + 1)
				?.length ?? Infinity
		);
	}

	getNearby() {
		const result = [];
		const activeGids = new Set();
		this.entityManager.forEach(entity => {
			if (!this.isAlive(entity)) return;
			const gid = entity.GID;
			activeGids.add(gid);
			if (!this.labels.has(gid)) this.labels.set(gid, this.nextLabel++);
			const speciesId = this.getSpeciesId(entity);
			const name = this.getName(entity);
			this.knownSpecies.set(speciesId, name);
			const life = this.entityManager.getLife(gid);
			const hp = life?.hp ?? entity.hp;
			const maxHp = life?.hp_max ?? entity.maxhp;
			result.push({
				label: this.labels.get(gid),
				gid,
				speciesId,
				name,
				distance: this.getDistance(entity),
				hpPercent: hp >= 0 && maxHp > 0 ? Math.round((hp / maxHp) * 100) : null,
				entity
			});
		});
		for (const gid of this.labels.keys()) {
			if (!activeGids.has(gid)) this.labels.delete(gid);
		}
		return result.sort((a, b) => a.distance - b.distance || a.label - b.label);
	}

	getByLabel(label) {
		return this.getNearby().find(monster => monster.label === Number(label)) || null;
	}

	getSpeciesCatalog() {
		const nearby = this.getNearby();
		const byId = new Map();
		this.navigationSpecies ??= this.db.getNavigationMonstersForMap(MapRenderer.currentMap);
		for (const monster of this.navigationSpecies) {
			byId.set(monster.id, { ...monster, exists: true, count: 0, nearest: Infinity });
		}
		for (const [id, name] of this.knownSpecies)
			byId.set(id, { id, name, exists: true, count: 0, nearest: Infinity });
		for (const monster of nearby) {
			const row = byId.get(monster.speciesId) || {
				id: monster.speciesId,
				name: monster.name,
				exists: true,
				count: 0,
				nearest: Infinity
			};
			row.count++;
			row.nearest = Math.min(row.nearest, monster.distance);
			byId.set(row.id, row);
		}
		return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
	}
}

export default new MonsterIndexService();
