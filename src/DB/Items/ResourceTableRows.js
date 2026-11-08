import HatTable from './HatTable.js';
import RobeTable from './RobeTable.js';
import RandomOption from './ItemRandomOptionTable.js';

export function mergeAccessoryNames(rows) {
	Object.assign(HatTable, rows);
}
export function mergeRobeNames(rows) {
	Object.assign(RobeTable, rows);
}
export function mergeRandomOptions(rows) {
	Object.assign(RandomOption, rows);
}
