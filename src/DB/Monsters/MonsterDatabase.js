import MonsterTable from 'DB/Monsters/MonsterTable.js';
import MonsterNameTable from 'DB/Monsters/MonsterNameTable.js';

export function getMonsterName(job) {
	return MonsterNameTable[job] ?? 'Unknown';
}

export function mergeMonsterNames(rows) { Object.assign(MonsterTable, rows); }
