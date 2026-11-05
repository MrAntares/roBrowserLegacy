const MONSTER_ROW_CLASS = 'tooltip-monster-row';

function createTextElement(className, text) {
	const element = document.createElement('span');
	element.className = className;
	element.textContent = text;
	return element;
}

export function createWorldMapRecommendedLevelBadge(section) {
	const recommendedLevel = String(section?.moblevel ?? '').trim();
	if (!recommendedLevel) return null;

	const badge = createTextElement('monster-count-badge recommended-level-badge', recommendedLevel);
	badge.title = `Recommended level ${recommendedLevel}`;
	badge.setAttribute('aria-label', badge.title);
	return badge;
}

export function createWorldMapMonsterLevelRange(monsters) {
	const levels = (Array.isArray(monsters) ? monsters : []).flatMap(monster => {
		if ([1, 2].includes(Number(monster?.mobType))) return [];
		if (Array.isArray(monster?.baseLevels)) return monster.baseLevels;
		return [monster?.baseLevel];
	});
	const validLevels = levels.map(Number).filter(level => Number.isFinite(level) && level > 0);
	if (!validLevels.length) return null;

	const minimum = Math.min(...validLevels);
	const maximum = Math.max(...validLevels);
	const range = minimum === maximum ? String(minimum) : `${minimum}-${maximum}`;
	const element = createTextElement('monster-level-range', `Lv. ${range}`);
	element.setAttribute(
		'aria-label',
		minimum === maximum ? `Monster level ${minimum}` : `Monster levels ${minimum} to ${maximum}`
	);
	return element;
}

/**
 * Fill the World Map hover panel with the monsters resolved by Navigation.
 *
 * @param {HTMLElement} tooltip
 * @param {Array<Object>} monsters
 * @param {boolean} visible
 */
export function renderWorldMapMonsterPanel(tooltip, monsters, visible) {
	if (!tooltip) {
		return;
	}

	const panel = tooltip.querySelector('.tooltip-monsters');
	const list = tooltip.querySelector('.tooltip-monster-list');
	const count = tooltip.querySelector('.tooltip-monster-count');
	const shouldShow = Boolean(visible && panel && list);

	tooltip.classList.toggle('show-monster-list', shouldShow);
	if (panel) {
		panel.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
	}
	if (!list) {
		return;
	}

	list.replaceChildren();
	if (!shouldShow) {
		if (count) count.textContent = '';
		return;
	}

	const entries = Array.isArray(monsters)
		? monsters.filter(monster => monster && String(monster.name || '').trim())
		: [];

	if (count) {
		count.textContent = '[' + entries.length + ']';
	}

	if (!entries.length) {
		const empty = document.createElement('div');
		empty.className = 'tooltip-monster-empty';
		empty.textContent = 'No monster data';
		list.appendChild(empty);
		return;
	}

	for (const monster of entries) {
		const row = document.createElement('div');
		row.className = MONSTER_ROW_CLASS;
		row.dataset.monsterId = String(monster.id || '');

		const name = String(monster.name || '').trim();
		const amount = Math.max(0, Math.floor(Number(monster.amount) || 0));
		const amountLabel = amount ? '[' + amount + ']' : '';
		const rateLabel = String(monster.rateLabel || '').trim();

		row.appendChild(createTextElement('tooltip-monster-name', name));
		row.appendChild(createTextElement('tooltip-monster-amount', amountLabel));
		row.title = [name, rateLabel, amountLabel].filter(Boolean).join(' ');
		list.appendChild(row);
	}
}
