import { createDBFileContext } from 'DB/Loaders/DBLoadContext.js';
import TextEncoding from 'Utils/CodepageManager.js';
import ItemTable from 'DB/Items/ItemTable.js';

export function loadMoveInfoTable(getUserCharpage, onEnd) {
	const resolveUserCharpage =
		typeof getUserCharpage === 'function' ? getUserCharpage : () => getUserCharpage;
	const { loadFile, guard } = createDBFileContext();
	onEnd = guard(onEnd);
	loadFile(
		'data/ItemMoveInfoV5.txt',
		function (file) {
			console.log('Loading file "ItemMoveInfoV5.txt"...');

			let data = file instanceof ArrayBuffer ? new Uint8Array(file) : file;
			data = TextEncoding.decode(data, resolveUserCharpage());
			const lines = data.split(/\r?\n/);

			for (let line of lines) {
				line = line.trim();
				if (!line || line.startsWith('//')) {
					continue;
				}

				// Remove inline comments
				const commentIndex = line.indexOf('//');
				if (commentIndex !== -1) {
					line = line.slice(0, commentIndex).trim();
				}

				const cols = line.split(/\s+/);
				if (cols.length < 9) {
					console.warn('Invalid ItemMoveInfo line:', line);
					continue;
				}

				const [key, drop, exchange, storage, cart, npcSale, mail, auction, guildStorage] = cols;

				const item = ItemTable[key] || (ItemTable[key] = {});

				item.moveInfo = {
					Drop: drop === '1',
					Exchange: exchange === '1',
					Storage: storage === '1',
					Cart: cart === '1',
					NPCSale: npcSale === '1',
					Mail: mail === '1',
					Auction: auction === '1',
					GuildStorage: guildStorage === '1'
				};
			}
			onEnd();
		},
		onEnd
	);
}
