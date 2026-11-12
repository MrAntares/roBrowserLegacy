/**
 * UI/GUI/Scrollbars.js
 *
 * Sets up scrollbars for a GUIComponent.
 *
 * @author AoShinHo
 */

import { getScrollBar } from 'UI/GUI/GUIDeps.js';

export function setupScrollbars(component) {
	const self = component;
	// Search inside the shadow container, not the host (light DOM)
	const root = component._container || component._host;
	// Observe the shadow root to detect changes inside Shadow DOM
	const observeTarget = component._shadow || component._host;

	setTimeout(() => {
		if (!component._host || !component._host.parentNode) return;

		const checkScrollbars = el => {
			// Check the element itself and all descendants
			const candidates = [el, ...el.querySelectorAll('*')];
			for (const node of candidates) {
				if (node.nodeType !== 1) continue;

				if (node._roScrollbarApplied) {
					getScrollBar()?.applyDOMScrollbar(node);
					continue;
				}

				const oy = window.getComputedStyle(node).overflowY;
				if (oy === 'auto' || oy === 'scroll') {
					getScrollBar()?.applyDOMScrollbar(node);
				}
			}
		};

		// Stagger checks to wait for CSS parsing
		checkScrollbars(root);
		setTimeout(() => checkScrollbars(root), 50);
		setTimeout(() => checkScrollbars(root), 150);
		setTimeout(() => checkScrollbars(root), 500);

		// Re-apply on visibility or content changes
		const observer = new MutationObserver(mutations => {
			let needsCheck = false;
			for (const mutation of mutations) {
				if (mutation.type === 'childList') {
					needsCheck = true;
				} else if (mutation.type === 'attributes') {
					if (mutation.attributeName === 'style') {
						const oldVal = mutation.oldValue || '';
						const wasHidden = oldVal.includes('display: none') || oldVal.includes('display:none');
						const isHidden = mutation.target.style.display === 'none';
						if (wasHidden && !isHidden) needsCheck = true;
					} else if (mutation.attributeName === 'class') {
						needsCheck = true;
					}
				}
			}
			if (needsCheck) checkScrollbars(root);
		});

		observer.observe(observeTarget, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeOldValue: true,
			attributeFilter: ['style', 'class']
		});

		self.__scrollbarObserver = observer;
	}, 0);
}
