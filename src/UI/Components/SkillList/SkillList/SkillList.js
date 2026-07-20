/**
 * UI/Components/SkillList/SkillList.js
 *
 * Chararacter Skill Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import { createSkillList } from '../SkillListCommon.js';
import htmlText from './SkillList.html?raw';
import cssText from './SkillList.css?raw';

export default createSkillList({
	name: 'SkillList',
	htmlText: htmlText,
	cssText: cssText,
	hasTabs: true,
	needSkillListKey: '_NeedSkillList',
	showDescOnMiniHover: false,
	touchDrag: true,
	incrementalRemember: true,
	guardMissingJob: true,
	readdSkillOnUpdate: true
});
