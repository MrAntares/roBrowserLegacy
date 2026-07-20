/**
 * UI/Components/SkillList/SkillListV0/SkillListV0.js
 *
 * Chararacter Skill Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import { createSkillList } from '../SkillListCommon.js';
import htmlText from './SkillListV0.html?raw';
import cssText from './SkillListV0.css?raw';

export default createSkillList({
	name: 'SkillListV0',
	htmlText: htmlText,
	cssText: cssText,
	hasTabs: false,
	needSkillListKey: '_NeedSkillListV0',
	showDescOnMiniHover: true,
	touchDrag: false,
	incrementalRemember: false,
	guardMissingJob: false,
	readdSkillOnUpdate: false
});
