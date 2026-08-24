/**
 * Priorities for windows that receive full inventory stacks.
 * Modal interaction windows take precedence over secondary inventory windows.
 */
export const InventoryItemTransferPriority = Object.freeze({
	TRADE: 300,
	NPC_STORE: 400
});

/**
 * Transfer an inventory item stack to the highest-priority active receiver.
 * Once selected, the receiver owns the request even if it declines the item.
 *
 * @param {object} item Inventory item
 * @param {object} components Registered UI components
 * @returns {boolean} Whether an active receiver handled the request
 */
export function transferInventoryItemStack(item, components) {
	if (!item || !components) {
		return false;
	}

	const receiver = Object.values(components)
		.filter(component => {
			return (
				component?.__active &&
				component._host?.isConnected &&
				component._host.style.display !== 'none' &&
				typeof component.receiveInventoryItemStack === 'function'
			);
		})
		.sort((a, b) => (b.inventoryTransferPriority || 0) - (a.inventoryTransferPriority || 0))[0];

	if (!receiver) {
		return false;
	}

	receiver.receiveInventoryItemStack(item);
	return true;
}
