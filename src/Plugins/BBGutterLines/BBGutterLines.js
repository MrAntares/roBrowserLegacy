/**
 * BBGutterLines Plugin
 *
 * Makes the Bowling Bash "Gutter Lines" visible when casting BB
 *
 * This file is a plugin for ROBrowser, (http://www.robrowser.com/).
 *
 * @author Antares
 */
define(function( require )
{
	// Dependencies
	var Session					= require('Engine/SessionStorage');
	var SkillTargetSelection	= require('UI/Components/SkillTargetSelection/SkillTargetSelection');
	var EffectManager			= require('Renderer/EffectManager');
	var SkillId					= require('DB/Skills/SkillConst');
	var Altitude				= require('Renderer/Map/Altitude');
	
	var _skill = 0;
	var _maxIndex = 0;
	
	const C_EFFECT_SIZE			= 14;	// Radius to check around the player
	const C_EFFECT_ID 			= 242;	// Land Protector effect
	const C_EFFECT_AID_PREFIX	= 'BBGL_';
	
	function showGutterLines(self, args){
		if(args && args[0] && args[0].SKID){
			_skill = args[0].SKID
			if(_skill === SkillId.KN_BOWLINGBASH){
				if(Session.Entity){
					var pos = Session.Entity.position;
					var startX = pos[0] - C_EFFECT_SIZE;
					var startY = pos[1] - C_EFFECT_SIZE;
					var endX = pos[0] + C_EFFECT_SIZE;
					var endY = pos[1] + C_EFFECT_SIZE;
					var index = 0;
					for(var x = startX; x <= endX; x++){
						for(var y = startY; y <= endY; y++){
							if(!checkPosition([x, y])){
								var AID = C_EFFECT_AID_PREFIX + (index++);
								var alt = Altitude.getCellHeight(  x,  y );
								EffectManager.spam(C_EFFECT_ID, AID, [x, y, alt ]);
							}
						}
					}
					_maxIndex = index;
				}
			}
		}
	}
	
	function removeGutterLines(self, args){
		if(_skill === SkillId.KN_BOWLINGBASH){
			if(_maxIndex){
				for(var i = 0; i < _maxIndex; i++){
					var AID = C_EFFECT_AID_PREFIX + i;
					EffectManager.remove(null, AID);
				}
			}
		}
	}
	
	function checkPosition( position ){
		var posX = position[0];
		var posY = position[1];
		return (checkPosSub(posX) && checkPosSub(posY));
	}
	
	function checkPosSub( coord ){
		if(!isNaN(coord)){
			var remainder = coord % 40;
			return (remainder > 5 && remainder < 35);
		}
		return false;
	}
	
	function extendSet(){
		var orig = SkillTargetSelection.set;
		SkillTargetSelection.set = function(){
			orig.apply(this, arguments);
			showGutterLines(this, arguments);
		}
	}

	function extendRemove(){
		var orig = SkillTargetSelection.onRemove;
		SkillTargetSelection.onRemove = function(){
			orig.apply(this, arguments);
			removeGutterLines(this, arguments);
		}
	}
	
	return function Init(){
		//Check if already set
		if(!SkillTargetSelection.BBGLPluginEnabled){
			extendSet();
			extendRemove();
			SkillTargetSelection.BBGLPluginEnabled = true;
		}
		
		//Return true to signal successful initialization
		return true;
	}
});
