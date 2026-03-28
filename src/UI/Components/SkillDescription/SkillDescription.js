/**
 * UI/Components/SkillDescription/SkillDescription.js
 *
 * Skill Information
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import jQuery from 'Utils/jquery.js';
import DB from 'DB/DBManager.js';
import Renderer from 'Renderer/Renderer.js';
import KEYS from 'Controls/KeyEventHandler.js';
import Mouse from 'Controls/MouseEventHandler.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import htmlText from './SkillDescription.html?raw';
import cssText from './SkillDescription.css?raw';

/**
 * Create Component
 */
const SkillDescription = new UIComponent('SkillDescription', htmlText, cssText);

/**
 * SkillDescription unique id
 */
SkillDescription.uid = -1;

/**
 * Once append to the DOM
 */
SkillDescription.onKeyDown = function onKeyDown(event) {
	if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this.ui.is(':visible')) {
		this.remove();
	}
};

/**
 * Once append
 */
SkillDescription.onAppend = function onAppend() {
	// Seems like "EscapeWindow" is execute first, push it before.
	const events = jQuery._data(window, 'events').keydown;
	events.unshift(events.pop());
};

/**
 * Once removed
 */
SkillDescription.onRemove = function onRemove() {
	this.uid = -1; // reset uid
};

/**
 * Initialize UI
 */
SkillDescription.init = function init() {
	this.ui.find('.close').click(
		function () {
			this.remove();
		}.bind(this)
	);

	this.draggable();
};

/**
 * Add content to the box
 *
 * @param {number} skill id
 */
SkillDescription.setSkill = function setSkill(id) {
	this.uid = id;
	this.ui.find('.content').text(DB.getSkillDescription(id));

	this.ui.css({
		top: Math.min(Mouse.screen.y + 10, Renderer.height - this.ui.height()),
		left: Math.min(Mouse.screen.x + 10, Renderer.width - this.ui.width())
	});
};

/**
 * Create component and export it
 */
export default UIManager.addComponent(SkillDescription);
