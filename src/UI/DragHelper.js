/**
 * Small helper builders for DragManager custom drag visuals.
 *
 * @author MrUnzO
 */

function matchesSelector(element, selector) {
	return element && typeof element.matches === 'function' && selector && element.matches(selector);
}

function parseSizeValue(value) {
	const parsed = parseFloat(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function getElementSize(element, fallback = 24) {
	if (!element) {
		return { width: fallback, height: fallback };
	}

	const rect = typeof element.getBoundingClientRect === 'function' ? element.getBoundingClientRect() : null;
	const style = typeof window !== 'undefined' && window.getComputedStyle ? window.getComputedStyle(element) : null;
	const attrWidth = element.getAttribute ? parseSizeValue(element.getAttribute('width')) : 0;
	const attrHeight = element.getAttribute ? parseSizeValue(element.getAttribute('height')) : 0;

	return {
		width:
			(rect && rect.width) ||
			(style && parseSizeValue(style.width)) ||
			element.offsetWidth ||
			attrWidth ||
			fallback,
		height:
			(rect && rect.height) ||
			(style && parseSizeValue(style.height)) ||
			element.offsetHeight ||
			attrHeight ||
			fallback
	};
}

function getBackgroundImage(element) {
	if (!element) {
		return '';
	}

	const inlineBackground = element.style && element.style.backgroundImage;
	if (inlineBackground && inlineBackground !== 'none') {
		return inlineBackground;
	}

	const style = typeof window !== 'undefined' && window.getComputedStyle ? window.getComputedStyle(element) : null;
	return style && style.backgroundImage !== 'none' ? style.backgroundImage : '';
}

export function createIconDragHelper(source, iconSelector = '.icon') {
	const icon = matchesSelector(source, iconSelector) ? source : source.querySelector(iconSelector);
	const image = icon && icon.querySelector('img');
	const backgroundElement = (icon && icon.querySelector('.img')) || icon;
	const sizeElement = image || backgroundElement || source;
	const size = getElementSize(sizeElement);
	const helper = document.createElement('div');

	helper.className = 'game-icon-drag-helper';
	helper.style.width = size.width + 'px';
	helper.style.height = size.height + 'px';
	helper.style.boxSizing = 'border-box';
	helper.style.overflow = 'hidden';

	if (image && image.src) {
		const imageClone = image.cloneNode(false);
		imageClone.removeAttribute('id');
		imageClone.style.display = 'block';
		imageClone.style.width = '100%';
		imageClone.style.height = '100%';
		helper.appendChild(imageClone);
		return helper;
	}

	const backgroundImage = getBackgroundImage(backgroundElement);
	if (backgroundImage) {
		helper.style.backgroundImage = backgroundImage;
		helper.style.backgroundRepeat = 'no-repeat';
		helper.style.backgroundPosition = 'center';
		helper.style.backgroundSize = 'contain';
	}

	return helper;
}
