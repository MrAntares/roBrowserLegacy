export class TextCommandService {
	constructor({ movement, monsterIndex, autoCombat, selectionStore, getMapName }) {
		this.movement = movement;
		this.monsterIndex = monsterIndex;
		this.autoCombat = autoCombat;
		this.selectionStore = selectionStore;
		this.getMapName = getMapName;
	}

	execute(input) {
		const text = String(input || '').trim();
		let match;
		if ((match = text.match(/^(北|南|西|东)(?:\s+(\d+))?$/))) {
			this.movement.moveDirection(match[1], match[2] || 1);
			return `正在向${match[1]}移动 ${match[2] || 1} 格。`;
		}
		if ((match = text.match(/^前往\s+(-?\d+)\s+(-?\d+)$/))) {
			this.movement.moveTo(match[1], match[2]);
			return `正在前往 (${match[1]},${match[2]})。`;
		}
		if ((match = text.match(/^前往\s+(.+)$/))) {
			const landmark = this.movement.moveToLandmark(match[1]);
			return `正在前往 ${landmark.name} (${landmark.x},${landmark.y})。`;
		}
		if ((match = text.match(/^攻击\s+@(\d+)$/))) {
			const monster = this.monsterIndex.getByLabel(match[1]);
			if (!monster) throw new Error(`附近没有 @${match[1]}。`);
			this.autoCombat.stop('单只目标攻击。');
			this.movement.attackEntity(monster.gid);
			return `正在攻击 @${monster.label} ${monster.name}；目标死亡后停止。`;
		}
		if ((match = text.match(/^勾选\s+(.+)$/))) {
			const species = this.monsterIndex
				.getSpeciesCatalog()
				.find(item => item.name === match[1] || String(item.id) === match[1]);
			if (!species) throw new Error(`本地图没有找到怪物“${match[1]}”。`);
			this.selectionStore.toggle(this.getMapName(), species.id, true);
			return `已勾选 ${species.name}；点击或输入“开始挂机”后才会攻击。`;
		}
		if (text === '开始挂机') {
			this.autoCombat.start();
			return '挂机已开始。';
		}
		if (text === '暂停') {
			this.autoCombat.pause();
			return '挂机已暂停。';
		}
		if (text === '继续') {
			this.autoCombat.resume();
			return '挂机已继续。';
		}
		if (text === '停止') {
			const wasActive = this.autoCombat.state !== 'stopped';
			this.autoCombat.stop();
			if (!wasActive) this.movement.cancelMovement();
			return '挂机已停止。';
		}
		throw new Error(
			'无法识别命令。支持：北 5、前往 160 182、前往 卡普拉、攻击 @1、勾选 波利、开始挂机、暂停、继续、停止。'
		);
	}
}
