import PACKETVER from 'Network/PacketVerManager.js';
import Base62 from 'Utils/Base62.js';

export function createItemLink(item) {
	if (!item) {
		return null;
	}

	// Handle legacy formats (ITEMLINK and ITEM)
	if (PACKETVER.value < 20151104) {
		return `<ITEMLINK>${item.name}<INFO>${item.ITID}</INFO></ITEMLINK>`;
	}

	if (PACKETVER.value < 20160113) {
		return `<ITEM>${item.name}<INFO>${item.ITID}</INFO></ITEM>`;
	}

	// Handle ITEML format (newest, most complex)
	let data = '';

	// Encode equipment location (5 chars)
	data += Base62.encode(item.location || 0).padStart(5, '0');

	// Encode is equipment flag (1 char)
	const isEquip = item.type === 5 ? '1' : '0';
	data += isEquip;

	// Encode item ID (variable length)
	data += Base62.encode(item.ITID || 512);

	// Encode refine level (optional, starts with %)
	if (item.RefiningLevel > 0) {
		data += '%';
		data += Base62.encode(item.RefiningLevel).padStart(2, '0');
	}

	// Encode item sprite number (optional, starts with &)
	if (PACKETVER.value >= 20161116) {
		data += '&';
		const spriteNumber = item.wItemSpriteNumber ? item.wItemSpriteNumber : 0;
		data += Base62.encode(spriteNumber).padStart(2, '0');
	}

	// Encode enchant grade (optional, starts with ')
	if (PACKETVER.value >= 20200724 && item.enchantgrade > 0) {
		data += "'";
		data += Base62.encode(item.enchantgrade).padStart(2, '0');
	}

	// Determine separators based on packet version
	let card_sep, optid_sep, optpar_sep, optval_sep;
	if (PACKETVER.value >= 20200724) {
		card_sep = ')';
		optid_sep = '+';
		optpar_sep = ',';
		optval_sep = '-';
	} else if (PACKETVER.value >= 20161116) {
		card_sep = '(';
		optid_sep = '*';
		optpar_sep = '+';
		optval_sep = ',';
	} else {
		card_sep = "'";
		optid_sep = ')';
		optpar_sep = '*';
		optval_sep = '+';
	}

	// Encode cards (4 cards)
	const cardKeys = ['card1', 'card2', 'card3', 'card4'];
	for (let i = 0; i < 4; i++) {
		const cardValue = item.slot?.[cardKeys[i]] || 0;
		if (cardValue > 0) {
			data += card_sep;
			data += Base62.encode(cardValue).padStart(2, '0');
		}
	}

	// Encode random options (up to 5)
	if (item.Options) {
		item.Options.forEach(option => {
			if (option.index > 0) {
				data += optid_sep;
				data += Base62.encode(option.index).padStart(2, '0');
				data += optpar_sep;
				data += Base62.encode(option.param).padStart(2, '0');
				data += optval_sep;
				data += Base62.encode(option.value).padStart(2, '0');
			}
		});
	}

	return `<ITEML>${data}</ITEML>`;
}

// <ITEMLINK> (Oldest format)
// Used for NPC message item links in clients from 2010-01-01 to before 2015-11-04.
// example: <ITEMLINK>Display Name<INFO>Item ID</INFO></ITEMLINK>
// <ITEM> (Middle format)
// Used for NPC message item links in clients from 2015-11-04 onwards, replacing <ITEMLINK>.
// example: <ITEM>Display Name<INFO>Item ID</INFO></ITEM>
// <ITEML> (Newest format)
// Used for player-generated item links (like Shift+Click from inventory) in clients from 2016-01-13 onwards.
// example: <ITEML>encoded_item_data</ITEML>
export function parseItemLink(itemLink, getItemName) {
	if (!itemLink) {
		return null;
	}

	const item = {
		ITID: 512,
		name: 'Unknown Item',
		type: 1,
		location: 0,
		slot: {
			card1: 0,
			card2: 0,
			card3: 0,
			card4: 0
		},
		nRandomOptionCnt: 0,
		Options: [{ index: 0, value: 0, param: 0 }],
		RefiningLevel: 0,
		enchantgrade: 0,
		IsIdentified: 1,
		IsDamaged: 0,
		wItemSpriteNumber: 0
	};

	let content = null;

	// parse ITEMLINK and ITEM format
	content = itemLink.match(/<(ITEMLINK|ITEM)>([\s\S]*?)<INFO>([\s\S]*?)<\/INFO><\/\1>/);
	if (content) {
		const [, , name, id] = content;
		item.ITID = id;
		item.name = name;
		return item;
	}

	content = itemLink.match(/<ITEML>([\s\S]*?)<\/ITEML>/);
	if (!content) {
		return item;
	}

	const data = content[1];
	let pos = 0;

	try {
		// Parse equipment location (5 chars)
		item.location = Base62.decode(data.substr(pos, 5));
		pos += 5;

		// Parse is equipment flag (1 char)
		const isEquip = data[pos] === '1';

		// TODO: add equipment type
		item.type = isEquip ? 5 : 0; // Default to armor type if equipment
		pos += 1;

		// Parse item ID (variable length until special char)
		let itemIdStr = '';
		while (pos < data.length && !"%&')(*+,-".includes(data[pos])) {
			itemIdStr += data[pos];
			pos++;
		}
		item.ITID = Base62.decode(itemIdStr);

		// Parse refine level (optional, starts with %)
		if (pos < data.length && data[pos] === '%') {
			pos++; // Skip %
			item.RefiningLevel = Base62.decode(data.substr(pos, 2));
			pos += 2;
		}

		if (PACKETVER.value >= 20161116 && pos < data.length && data[pos] === '&') {
			pos++; // Skip &
			item.wItemSpriteNumber = Base62.decode(data.substr(pos, 2));
			pos += 2;
		}

		if (PACKETVER.value >= 20200724 && pos < data.length && data[pos] === "'") {
			pos++; // Skip '
			item.enchantgrade = Base62.decode(data.substr(pos, 2));
			pos += 2;
		}

		// Determine separators based on detected packet version
		let card_sep, optid_sep, optpar_sep, optval_sep;
		if (PACKETVER.value >= 20200724) {
			card_sep = ')';
			optid_sep = '+';
			optpar_sep = ',';
			optval_sep = '-';
		} else if (PACKETVER.value >= 20161116) {
			card_sep = '(';
			optid_sep = '*';
			optpar_sep = '+';
			optval_sep = ',';
		} else {
			card_sep = "'";
			optid_sep = ')';
			optpar_sep = '*';
			optval_sep = '+';
		}

		// Parse cards
		const cardKeys = ['card1', 'card2', 'card3', 'card4'];
		let cardIndex = 0;

		while (cardIndex < 4 && pos < data.length) {
			if (data[pos] !== card_sep) {
				break;
			} // não tem mais carta

			pos++; // skip

			// take all characters that are not card separators or random option separators
			let cardStr = '';
			while (pos < data.length) {
				const c = data[pos];
				// stop if next separator is a card separator or random option separator
				if (c === card_sep || c === optid_sep) {
					break;
				}
				// stop if next separator is a future separator (security)
				if ("%&'()*+,-".includes(c)) {
					break;
				}
				cardStr += c;
				pos++;
			}

			// if nothing was taken, it's an empty card (0)
			if (cardStr === '' || cardStr === '00') {
				item.slot[cardKeys[cardIndex]] = 0;
			} else {
				item.slot[cardKeys[cardIndex]] = Base62.decode(cardStr);
			}

			cardIndex++;
		}

		// fill the cards that didn't exist with 0
		while (cardIndex < 4) {
			item.slot[cardKeys[cardIndex]] = 0;
			cardIndex++;
		}

		// Parse random options (variable count)
		let optionIdx = 0;
		while (pos < data.length && data[pos] === optid_sep && optionIdx < 5) {
			pos++; // Skip option ID separator
			const optId = Base62.decode(data.substr(pos, 2));
			pos += 2;

			if (pos >= data.length || data[pos] !== optpar_sep) {
				break;
			}
			pos++; // Skip param separator
			const optParam = Base62.decode(data.substr(pos, 2));
			pos += 2;

			if (pos >= data.length || data[pos] !== optval_sep) {
				break;
			}
			pos++; // Skip value separator
			const optValue = Base62.decode(data.substr(pos, 2));
			pos += 2;

			item.Options.push({
				index: optId,
				value: optValue,
				param: optParam
			});
			optionIdx++;
		}

		// Fill remaining option slots with zeros
		while (item.Options.length < 5 + 1) {
			item.Options.push({ index: 0, value: 0, param: 0 });
		}

		item.nRandomOptionCnt = optionIdx;

		item.name = getItemName(item);

		return item;
	} catch (error) {
		console.error('Error parsing item link:', error);
		return null;
	}
}

export function getItemNameFromLink(itemLink, parse) {
	if (!itemLink) return null;
	return parse(itemLink).name;
}
