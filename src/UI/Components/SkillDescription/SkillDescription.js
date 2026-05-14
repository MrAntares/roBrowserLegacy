/**
 * UI/Components/SkillDescription/SkillDescription.js
 *
 * Skill Information
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import DB from 'DB/DBManager.js';
import Renderer from 'Renderer/Renderer.js';
import KEYS from 'Controls/KeyEventHandler.js';
import Mouse from 'Controls/MouseEventHandler.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import htmlText from './SkillDescription.html?raw';
import cssText from './SkillDescription.css?raw';

/**
 * Create Component
 */
const SkillDescription = new GUIComponent('SkillDescription', cssText);

SkillDescription.render = () => htmlText;

/**
 * SkillDescription unique id
 */
SkillDescription.uid = -1;

/**
 * Helper to get the shadow root
 */
function _getRoot() {
	return SkillDescription._shadow || SkillDescription._host;
}

/**
 * Possible to exit using ESCAPE
 */
SkillDescription.onKeyDown = function onKeyDown(event) {
	if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this._host.style.display !== 'none') {
		this.remove();
	}
};

/**
 * Once removed
 */
SkillDescription.onRemove = function onRemove() {
	this.uid = -1;
};

/**
 * Initialize UI
 */
SkillDescription.init = function init() {
	const root = _getRoot();

	const closeBtn = root.querySelector('.close');
	if (closeBtn) {
		closeBtn.addEventListener('mousedown', e => e.stopImmediatePropagation());
		closeBtn.addEventListener('click', () => SkillDescription.remove());
	}

	this.draggable();
};

/**
 * Add content to the box
 *
 * @param {number} skill id
 */
SkillDescription.setSkill = function setSkill(id) {
	this.uid = id;

	const root = _getRoot();
	const content = root.querySelector('.content');
	if (content) {
		content.textContent = DB.getSkillDescription(id);
	}

	const hostWidth = this._host.getBoundingClientRect().width;
	const hostHeight = this._host.getBoundingClientRect().height;

	this._host.style.top = `${Math.min(Mouse.screen.y + 10, Renderer.height - hostHeight)}px`;
	this._host.style.left = `${Math.min(Mouse.screen.x + 10, Renderer.width - hostWidth)}px`;
};

/**
 * Create component and export it
 */
export default UIManager.addComponent(SkillDescription);
