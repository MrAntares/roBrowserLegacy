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
import Session from 'Engine/SessionStorage.js';
import SkillTreeView from 'DB/Skills/SkillTreeView.js';
import { findLineageJob } from 'UI/Components/SkillList/SkillRequirements.js';
import KEYS from 'Controls/KeyEventHandler.js';
import Mouse from 'Controls/MouseEventHandler.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import htmlText from './SkillDescription.html?raw';
import cssText from './SkillDescription.css?raw';

/**
 * Whitelist of allowed HTML tags in skill descriptions
 */
const _allowedTags = new Set(['font', 'i', 'b']);

/**
 * A line that applies to one job only starts with that job's id, right
 * before its colour code: "16^CC3399Requirement: Seismic Weapon 1".
 */
const _jobLineReg = /^(\d+)(?=\^[a-fA-F0-9]{6})/;

/**
 * Keep only the job-specific lines that apply to the character's job, without
 * their job id, as the official client does: a Sage reads "Requirement:
 * Seismic Weapon 1" and never sees the Wizard's line. When several of the
 * line's jobs are in the character's lineage, the nearest one wins, as it
 * does for the skill tree's own requirements. Lines for other jobs are left
 * out. Numbers in the monster id range are not job ids and stay as they are.
 *
 * @param {string} txt - skill description text
 * @param {number} jobId - the character's job
 * @returns {string}
 */
function _resolveJobLines(txt, jobId) {
	const lines = txt.split('\n');
	const lineJob = lines.map(line => {
		const id = line.match(_jobLineReg)?.[1];
		const n = Number(id);
		return id !== undefined && (n < 1000 || n >= 4000) ? id : null;
	});

	const jobIds = new Set(lineJob.filter(id => id !== null));
	if (!jobIds.size) {
		return txt;
	}

	const kept = jobId == null ? undefined : findLineageJob(jobIds, jobId, SkillTreeView);
	const out = [];
	lines.forEach((line, i) => {
		if (lineJob[i] === null) {
			out.push(line);
		} else if (lineJob[i] === kept) {
			out.push(line.slice(lineJob[i].length));
		}
	});
	return out.join('\n');
}

/**
 * Sanitize and format RO text with ^rrggbb color codes, ^nItemID^NNN
 * item name substitution, and newline conversion.
 *
 * @param {string} value - raw skill description text
 * @param {?number} jobId - the character's job, for job-specific lines
 * @returns {string} safe HTML string
 */
export function _formatROText(value, jobId = null) {
	const tmp = document.createElement('div');
	tmp.innerHTML = String(value);

	tmp.querySelectorAll('*').forEach(el => {
		if (!_allowedTags.has(el.tagName.toLowerCase())) {
			el.replaceWith(...el.childNodes);
		}
	});

	let txt = _resolveJobLines(tmp.innerHTML, jobId);

	let result;
	const colorReg = /\^([a-fA-F0-9]{6})/;
	while ((result = colorReg.exec(txt))) {
		txt = txt.replace(result[0], `<span style="color:#${result[1]}">`) + '</span>';
	}

	const itemReg = /\^nItemID\^(\d+)/g;
	while ((result = itemReg.exec(txt))) {
		txt = txt.replace(result[0], DB.getItemInfo(result[1]).identifiedDisplayName);
	}

	txt = txt.replace(/\n/g, '<br/>');

	return txt;
}

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
	const root = this.getRoot();

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

	const root = this.getRoot();
	const content = root.querySelector('.content');
	if (content) {
		// Like the skill tree, follow the real job, never a transformation
		const entity = Session.Entity;
		const jobId = entity ? entity._job || entity.job : null;
		content.innerHTML = _formatROText(DB.getSkillDescription(id), jobId);
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
