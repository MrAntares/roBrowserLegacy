/**
 * UI/Components/Rodex/RodexIcon.js
 *
 * Rodex Icon
 *
 * @author Alisonrag
 *
 */
'use strict';

import UIManager from 'UI/UIManager';
import UIComponent from 'UI/UIComponent';
import htmlText from './RodexIcon.html?raw';
import cssText from './RodexIcon.css?raw';
import Rodex from 'UI/Components/Rodex/Rodex';

	/**
	 * Create Component
	 */
	const RodexIcon = new UIComponent('RodexIcon', htmlText, cssText);

	/**
	 * Apply preferences once append to body
	 */
	RodexIcon.onAppend = function OnAppend() {
		const icon = this.ui.find('.rodex-icon');
		icon.on('click', onClickRodexIcon);
		icon.focus();
	};

	RodexIcon.toggle = function toggle() {
		this.ui.toggle();
		if (this.ui.is(':visible')) {
			this.focus();
		}
	};

	function onClickRodexIcon() {
		Rodex.openRodexBox();
		Rodex.append();
		Rodex.ui.show();
		Rodex.ui.focus();
	}

	/**
	 * Create component and export it
	 */
	export default UIManager.addComponent(RodexIcon);
