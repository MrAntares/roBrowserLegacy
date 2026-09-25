/**
 * Preferences/UI.js
 *
 * UI user preferences
 *
 */

import Preferences from 'Core/Preferences.js';

/**
 * Export
 */
export default Preferences.get(
	'UI',
	{
		windowmagnet: true,

		// Whether the guild member list is ordered by login status. This is the
		// state of the tab's own checkbox, which 2022 persisted client-side as
		// bGuildMemberListSort - so it belongs to the player, not the server.
		// It is only consulted when the deployment asks for that era's
		// behaviour: Configs' guild.memberListSort defaults to mars26's, where
		// the sort is on and there is no checkbox.
		//
		// No version bump needed: get() merges by iterating the *stored* keys,
		// so a new default survives an existing preferences object untouched.
		guildMemberListSorted: true,

		// Whether guild and friend login chatter is announced in the chat: the
		// guild member line (485/486), the guild notice, and a friend connecting
		// or disconnecting (1041/1042). The client keeps all three behind one
		// flag, toggled by "/li".
		//
		// It ships on, where the client's own initialiser is off: roBrowser has
		// printed these all along, and turning them off by default would look
		// like they had broken.
		li: true
	},
	1.0
);
