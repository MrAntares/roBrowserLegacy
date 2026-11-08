import MonsterTable from './MonsterTable.js';
import MonsterNameTable from './MonsterNameTable.js';

export function getMonsterName(job) {
	return MonsterNameTable[job] ?? 'Unknown';
}

export function mergeMonsterNames(rows) { Object.assign(MonsterTable, rows); }
