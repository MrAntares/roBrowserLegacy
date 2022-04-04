/**
 * Preferences/BattleMode.js
 *
 * BattleMode preferences
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define( ['Core/Preferences', 'Controls/KeyEventHandler'], function( Preferences, KEYS )
{
	'use strict';


	/**
	 * Default
	 * 0 - no modifier
	 * 1 - shift
	 * 2 - alt
	 * 3 - ctrl
	 */
	var defaultKey = {};

	// Shortcut
	defaultKey[ KEYS.F1 ]  = { component:'ShortCut',        cmd:'EXECUTE0' };
	defaultKey[ KEYS.F2 ]  = { component:'ShortCut',        cmd:'EXECUTE1' };
	defaultKey[ KEYS.F3 ]  = { component:'ShortCut',        cmd:'EXECUTE2' };
	defaultKey[ KEYS.F4 ]  = { component:'ShortCut',        cmd:'EXECUTE3' };
	defaultKey[ KEYS.F5 ]  = { component:'ShortCut',        cmd:'EXECUTE4' };
	defaultKey[ KEYS.F6 ]  = { component:'ShortCut',        cmd:'EXECUTE5' };
	defaultKey[ KEYS.F7 ]  = { component:'ShortCut',        cmd:'EXECUTE6' };
	defaultKey[ KEYS.F8 ]  = { component:'ShortCut',        cmd:'EXECUTE7' };
	defaultKey[ KEYS.F9 ]  = { component:'ShortCut',        cmd:'EXECUTE8' };

	defaultKey[ KEYS[1] ]  = { component:'ShortCut',        cmd:'EXECUTE9' };
	defaultKey[ KEYS[2] ]  = { component:'ShortCut',        cmd:'EXECUTE10' };
	defaultKey[ KEYS[3] ]  = { component:'ShortCut',        cmd:'EXECUTE11' };
	defaultKey[ KEYS[4] ]  = { component:'ShortCut',        cmd:'EXECUTE12' };
	defaultKey[ KEYS[5] ]  = { component:'ShortCut',        cmd:'EXECUTE13' };
	defaultKey[ KEYS[6] ]  = { component:'ShortCut',        cmd:'EXECUTE14' };
	defaultKey[ KEYS[7] ]  = { component:'ShortCut',        cmd:'EXECUTE15' };
	defaultKey[ KEYS[8] ]  = { component:'ShortCut',        cmd:'EXECUTE16' };
	defaultKey[ KEYS[9] ]  = { component:'ShortCut',        cmd:'EXECUTE17' };

	defaultKey[ KEYS.Q ]  = { component:'ShortCut',        cmd:'EXECUTE18' };
	defaultKey[ KEYS.W ]  = { component:'ShortCut',        cmd:'EXECUTE19' };
	defaultKey[ KEYS.E ]  = { component:'ShortCut',        cmd:'EXECUTE20' };
	defaultKey[ KEYS.R ]  = { component:'ShortCut',        cmd:'EXECUTE21' };
	defaultKey[ KEYS.T ]  = { component:'ShortCut',        cmd:'EXECUTE22' };
	defaultKey[ KEYS.Z ]  = { component:'ShortCut',        cmd:'EXECUTE23' };
	defaultKey[ KEYS.U ]  = { component:'ShortCut',        cmd:'EXECUTE24' };
	defaultKey[ KEYS.I ]  = { component:'ShortCut',        cmd:'EXECUTE25' };
	defaultKey[ KEYS.O ]  = { component:'ShortCut',        cmd:'EXECUTE26' };

	defaultKey[ KEYS.A ]  = { component:'ShortCut',        cmd:'EXECUTE27' };
	defaultKey[ KEYS.S ]  = { component:'ShortCut',        cmd:'EXECUTE28' };
	defaultKey[ KEYS.D ]  = { component:'ShortCut',        cmd:'EXECUTE29' };
	defaultKey[ KEYS.F ]  = { component:'ShortCut',        cmd:'EXECUTE30' };
	defaultKey[ KEYS.G ]  = { component:'ShortCut',        cmd:'EXECUTE31' };
	defaultKey[ KEYS.H ]  = { component:'ShortCut',        cmd:'EXECUTE32' };
	defaultKey[ KEYS.J ]  = { component:'ShortCut',        cmd:'EXECUTE33' };
	defaultKey[ KEYS.K ]  = { component:'ShortCut',        cmd:'EXECUTE34' };
	defaultKey[ KEYS.L ]  = { component:'ShortCut',        cmd:'EXECUTE35' };



	defaultKey[ KEYS.F12 ] = { component:'ShortCut',        cmd:'EXTEND'   };

	// UI
	defaultKey[ "ALT" + KEYS.C ]   = { component:'ChatRoomCreate',  cmd:'TOGGLE'};
	defaultKey[ "ALT" + KEYS.E ]   = { component:'Inventory',       cmd:'TOGGLE'};
	defaultKey[ "ALT" + KEYS.W ]   = { component:'CartItems',       cmd:'TOGGLE'};
	defaultKey[ "ALT" + KEYS.G ]   = { component:'Guild',           cmd:'TOGGLE'};
	defaultKey[ "ALT" + KEYS.J ]   = { component:'PetInformations', cmd:'TOGGLE'};
	defaultKey[ "ALT" + KEYS.R ]   = { component:'HomunInformations', cmd:'TOGGLE'};
	defaultKey[ "ALT" + KEYS.L ]   = { component:'Emoticons',       cmd:'TOGGLE'};
	defaultKey[ "ALT" + KEYS.Q ]   = { component:'Equipment',       cmd:'TOGGLE'};
	defaultKey[ "ALT" + KEYS.M ]   = { component:'ShortCuts',       cmd:'TOGGLE'};
	defaultKey[ "ALT" + KEYS.S ]   = { component:'SkillList',       cmd:'TOGGLE'};
	defaultKey[ "ALT" + KEYS.V ]   = { component:'BasicInfo',       cmd:'EXTEND'};
	defaultKey[ "ALT" + KEYS.H ]   = { component:'PartyFriends',    cmd:'FRIEND'};
	defaultKey[ "ALT" + KEYS.Z ]   = { component:'PartyFriends',    cmd:'PARTY'};


	defaultKey[ "ALT" +  KEYS[1] ]   = { component:'ShortCuts',       cmd:'EXECUTE_ALT_1'};
	defaultKey[ "ALT" +  KEYS[2] ]   = { component:'ShortCuts',       cmd:'EXECUTE_ALT_2'};
	defaultKey[ "ALT" +  KEYS[3] ]   = { component:'ShortCuts',       cmd:'EXECUTE_ALT_3'};
	defaultKey[ "ALT" +  KEYS[4] ]   = { component:'ShortCuts',       cmd:'EXECUTE_ALT_4'};
	defaultKey[ "ALT" +  KEYS[5] ]   = { component:'ShortCuts',       cmd:'EXECUTE_ALT_5'};
	defaultKey[ "ALT" +  KEYS[6] ]   = { component:'ShortCuts',       cmd:'EXECUTE_ALT_6'};
	defaultKey[ "ALT" +  KEYS[7] ]   = { component:'ShortCuts',       cmd:'EXECUTE_ALT_7'};
	defaultKey[ "ALT" +  KEYS[8] ]   = { component:'ShortCuts',       cmd:'EXECUTE_ALT_8'};
	defaultKey[ "ALT" +  KEYS[9] ]   = { component:'ShortCuts',       cmd:'EXECUTE_ALT_9'};
	defaultKey[ "ALT" +  KEYS[0] ]   = { component:'ShortCuts',       cmd:'EXECUTE_ALT_0'};

	defaultKey[ "CTRL" +  KEYS['`']]  = { component:'WorldMap',        cmd:'TOGGLE'};

	/**
	 * Export
	 */
	return Preferences.get( 'BattleMode', defaultKey, 1.5 );
});
