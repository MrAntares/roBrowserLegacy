import HatTable from 'DB/Items/HatTable.js';
import RobeTable from 'DB/Items/RobeTable.js';
import RandomOption from 'DB/Items/ItemRandomOptionTable.js';

export function mergeAccessoryNames(rows) {
	Object.assign(HatTable, rows);
}
export function mergeRobeNames(rows) {
	Object.assign(RobeTable, rows);
}
export function mergeRandomOptions(rows) {
	Object.assign(RandomOption, rows);
}
