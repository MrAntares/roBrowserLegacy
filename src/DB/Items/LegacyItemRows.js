import ItemTable from 'DB/Items/ItemTable.js';

export function unidentifiedDisplayName(_index, key, val) {
	(ItemTable[key] || (ItemTable[key] = {})).unidentifiedDisplayName = val.replace(/_/g, ' ');
}

export function unidentifiedResourceName(_index, key, val) {
	(ItemTable[key] || (ItemTable[key] = {})).unidentifiedResourceName = val;
}

export function unidentifiedDescriptionName(_index, key, val) {
	(ItemTable[key] || (ItemTable[key] = {})).unidentifiedDescriptionName = val.split('\n');
}

export function identifiedDisplayName(_index, key, val) {
	(ItemTable[key] || (ItemTable[key] = {})).identifiedDisplayName = val.replace(/_/g, ' ');
}

export function identifiedResourceName(_index, key, val) {
	(ItemTable[key] || (ItemTable[key] = {})).identifiedResourceName = val;
}

export function identifiedDescriptionName(_index, key, val) {
	(ItemTable[key] || (ItemTable[key] = {})).identifiedDescriptionName = val.split('\n');
}

export function slotCount(_index, key, val) {
	(ItemTable[key] || (ItemTable[key] = {})).slotCount = val;
}

export function processitemlist(_index, key, val) {
	(ItemTable[key] || (ItemTable[key] = {})).processitemlist = val.split('\n');
}

export function illustResourcesName(_index, key, val) {
	(ItemTable[key] || (ItemTable[key] = {})).illustResourcesName = val;
}

export function prefixName(_index, key, val) {
	(ItemTable[key] || (ItemTable[key] = {})).prefixName = val;
}

export function isPostfix(_index, key) {
	(ItemTable[key] || (ItemTable[key] = {})).isPostfix = true;
}
