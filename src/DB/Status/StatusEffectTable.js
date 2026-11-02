/**
 * DB/Status/StatusEffectTable.js
 *
 * Effects the official client draws on an actor while a status is on.
 *
 * start: played each time the status starts.
 * loop: started with the status, one copy per actor, removed when the status ends.
 *
 * Effect names are keys of DB/Effects/EffectTable.js. The rows below are rows
 * of the client's ez2streffect.bson (DBManager mergeEz2Effects): endless
 * (IsInfinite) files that the client loops on the actor while the status is on.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import StatusConst from './StatusConst.js';

export default {
	// Unlimit (RA_UNLIMIT)
	[StatusConst.UNLIMIT]: {
		loop: ['unlimit_loop_bottom', 'unlimit_loop']
	},

	// Servant Weapon: Sign (DK_SERVANT_W_SIGN), on the marked target
	[StatusConst.SERVANT_SIGN]: {
		loop: ['servant_sign_bottom', 'servant_sign']
	},

	// Vigor (DK_VIGOR)
	[StatusConst.VIGOR]: {
		loop: ['vigor_buff']
	},

	// Dancing Knife (SHC_DANCING_KNIFE)
	[StatusConst.DANCING_KNIFE]: {
		start: ['dancing_knife_skill_bottom_begin', 'dancing_knife_skill_begin'],
		loop: ['dancing_knife_skill_bottom_loop', 'dancing_knife_skill_loop']
	},

	// Guard Stance (IG_GUARD_STANCE)
	[StatusConst.GUARD_STANCE]: {
		loop: ['new_guard_stance_loop_bottom']
	},

	// Attack Stance (IG_ATTACK_STANCE)
	[StatusConst.ATTACK_STANCE]: {
		loop: ['new_attack_stance_loop_bottom']
	},

	// Guardian Shield (IG_GUARDIAN_SHIELD)
	[StatusConst.GUARDIAN_S]: {
		start: ['new_guardianshield_buff_start'],
		loop: ['new_guardianshield_buff_loop']
	},

	// Holy Shield (IG_HOLY_SHIELD)
	[StatusConst.HOLY_S]: {
		loop: ['new_holy_shield_loop', 'new_holy_shield_loop_bottom']
	},

	// Ultimate Sacrifice (IG_ULTIMATE_SACRIFICE)
	[StatusConst.ULTIMATE_S]: {
		loop: ['ultimate_sacrifice_buff']
	},

	// Grand Judgement (IG_GRAND_JUDGEMENT): the client draws this status with its buff
	[StatusConst.SPEAR_SCAR]: {
		loop: ['new_grand_judgement_buff']
	},

	// Calamity Gale (WH_CALAMITYGALE)
	[StatusConst.CALAMITYGALE]: {
		loop: ['calumitygale_loop']
	},

	// Mystic Symphony (TR_MYSTIC_SYMPHONY)
	[StatusConst.MYSTIC_SYMPHONY]: {
		loop: ['mysticsymphony_note']
	},

	// Hidden Card (NW_HIDDEN_CARD)
	[StatusConst.HIDDEN_CARD]: {
		loop: ['hiddencard_thunder']
	},

	// Circle of Directions and Elementals (SOA_CIRCLE_OF_DIRECTIONS_AND_ELEMENTALS)
	[StatusConst.T_FIVETH_GOD]: {
		loop: ['circle_directions_elements_loop']
	},

	// Soul of Heaven and Earth (SOA_SOUL_OF_HEAVEN_AND_EARTH)
	[StatusConst.HEAVEN_AND_EARTH]: {
		loop: ['soul_of_heaven_and_earth_buff']
	},

	// Howling of Chul Ho (SH_HOWLING_OF_CHUL_HO), on the scared target
	[StatusConst.HOGOGONG]: {
		loop: ['howling_of_chul_ho_scared']
	},

	// Temporary Communion (SH_TEMPORARY_COMMUNION)
	[StatusConst.TEMPORARY_COMMUNION]: {
		loop: ['temporary_communion_buff_bottom', 'temporary_communion_buff']
	},

	// Breaking Limit (HN_BREAKINGLIMIT)
	[StatusConst.BREAKINGLIMIT]: {
		loop: ['breakinglimit_buff']
	},

	// Rule Break (HN_RULEBREAK)
	[StatusConst.RULEBREAK]: {
		loop: ['rulebreak_buff']
	},

	// Nightmare (Shinkiro/Shiranui)
	[StatusConst.NIGHTMARE]: {
		loop: ['efst_nightmare']
	}
};
