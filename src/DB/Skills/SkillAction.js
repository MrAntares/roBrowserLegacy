/**
 * DB/Skills/SkillAction.js
 *
 * List of entity actions performed on skill usage
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * 
 */

define(['./SkillConst'], function(SK) {
	'use strict';
	
	var SkillAction = {};
	
	//Default skill action
	SkillAction['DEFAULT'] = function(entity){
		return {
			action: entity.ACTION.SKILL,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.IDLE,
				frame:  0,
				repeat: false,
				play:   false,
				next:   false
			}
		};
	};
		
	//Skill action overrides
	//READYFIRGHT
	SkillAction[SK.SM_ENDURE] = function(entity){
		return {
			action: entity.ACTION.READYFIGHT,
			frame: 0,
			repeat: true,
			play: false,
			next: {
				action: entity.ACTION.IDLE,
				frame: 0,
				repeat: false,
				play: false,
				next: true
			}
		};
	};
	
	//ATTACK - Normal attack with visible weapon
	SkillAction[SK.SM_BASH] =
	SkillAction[SK.SM_MAGNUM] =
	SkillAction[SK.AC_SHOWER] =
	
	SkillAction[SK.KN_PIERCE] =
	SkillAction[SK.KN_BRANDISHSPEAR] =
	SkillAction[SK.KN_SPEARSTAB] =
	SkillAction[SK.KN_BOWLINGBASH] =
	SkillAction[SK.BS_HAMMERFALL] =
	SkillAction[SK.AC_CHARGEARROW] =
	SkillAction[SK.RG_BACKSTAP] = 
	SkillAction[SK.RG_RAID] =
	SkillAction[SK.RG_INTIMIDATE] =
	SkillAction[SK.CR_SHIELDCHARGE] =
	SkillAction[SK.CR_HOLYCROSS] =
	SkillAction[SK.MO_INVESTIGATE] =
	SkillAction[SK.MO_FINGEROFFENSIVE] =
	SkillAction[SK.MO_EXTREMITYFIST] =
	SkillAction[SK.MO_CHAINCOMBO] =
	SkillAction[SK.MO_COMBOFINISH] =
	SkillAction[SK.BA_MUSICALSTRIKE] =
	SkillAction[SK.DC_THROWARROW] =
	
	SkillAction[SK.NPC_DARKCROSS] =
	SkillAction[SK.CH_PALMSTRIKE] =
	SkillAction[SK.CH_TIGERFIST] =
	SkillAction[SK.CH_CHAINCRUSH] =
	SkillAction[SK.LK_SPIRALPIERCE] =
	SkillAction[SK.LK_HEADCRUSH] =
	SkillAction[SK.LK_JOINTBEAT] =
	SkillAction[SK.HW_MAGICPOWER] =
	SkillAction[SK.PA_SACRIFICE] =
	SkillAction[SK.ASC_METEORASSAULT] =
	
	SkillAction[SK.TK_STORMKICK] =
	SkillAction[SK.TK_DOWNKICK] =
	SkillAction[SK.TK_TURNKICK] =
	SkillAction[SK.TK_COUNTER] =
	SkillAction[SK.TK_JUMPKICK] =
	SkillAction[SK.CR_ACIDDEMONSTRATION] =
	SkillAction[SK.GS_TRIPLEACTION] =
	SkillAction[SK.GS_BULLSEYE] =
	SkillAction[SK.GS_TRACKING] =
	SkillAction[SK.GS_DISARM] =
	SkillAction[SK.GS_PIERCINGSHOT] =
	SkillAction[SK.GS_RAPIDSHOWER] =
	SkillAction[SK.GS_DESPERADO] =
	SkillAction[SK.GS_DUST] =
	SkillAction[SK.GS_FULLBUSTER] =
	SkillAction[SK.GS_SPREADATTACK] =
	SkillAction[SK.GS_GROUNDDRIFT] =
	SkillAction[SK.NJ_HUUMA] =
	SkillAction[SK.NJ_KASUMIKIRI] =
	SkillAction[SK.NJ_KIRIKAGE] =
	SkillAction[SK.NJ_ISSEN] =
	
	SkillAction[SK.RK_SONICWAVE] =
	SkillAction[SK.RK_HUNDREDSPEAR] =
	SkillAction[SK.RK_WINDCUTTER] =
	SkillAction[SK.RK_IGNITIONBREAK] =
	SkillAction[SK.RK_DRAGONBREATH] =
	SkillAction[SK.GC_DARKILLUSION] =
	SkillAction[SK.GC_COUNTERSLASH] =
	SkillAction[SK.GC_WEAPONCRUSH] =
	SkillAction[SK.GC_VENOMPRESSURE] =
	SkillAction[SK.GC_PHANTOMMENACE] =
	SkillAction[SK.GC_CROSSRIPPERSLASHER] =
	SkillAction[SK.NC_PILEBUNKER] =
	SkillAction[SK.NC_VULCANARM] =
	SkillAction[SK.NC_FLAMELAUNCHER] =
	SkillAction[SK.NC_COLDSLOWER] =
	SkillAction[SK.NC_ARMSCANNON] =
	SkillAction[SK.NC_POWERSWING] =
	SkillAction[SK.NC_AXETORNADO] =
	SkillAction[SK.SC_FATALMENACE] =
	SkillAction[SK.LG_CANNONSPEAR] =
	SkillAction[SK.LG_BANISHINGPOINT] =
	SkillAction[SK.LG_TRAMPLE] =
	SkillAction[SK.LG_SHIELDPRESS] =
	SkillAction[SK.LG_PINPOINTATTACK] =
	SkillAction[SK.LG_RAGEBURST] =
	SkillAction[SK.LG_OVERBRAND] =
	SkillAction[SK.LG_RAYOFGENESIS] =
	SkillAction[SK.LG_EARTHDRIVE] =
	SkillAction[SK.SR_DRAGONCOMBO] =
	SkillAction[SK.SR_SKYNETBLOW] =
	SkillAction[SK.SR_FALLENEMPIRE] =
	SkillAction[SK.SR_TIGERCANNON] =
	SkillAction[SK.SR_CRESCENTELBOW] =
	SkillAction[SK.SR_GATEOFHELL] = function(entity){
		return {
			action: entity.ACTION.ATTACK,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.IDLE,
				frame:  0,
				repeat: false,
				play:   false,
				next:   false
			}
		};
	};
	
	//ATTACK1 - Throwing attack without visible weapon
	SkillAction[SK.KN_SPEARBOOMERANG] =
	SkillAction[SK.CR_SHIELDBOOMERANG] =
	SkillAction[SK.AM_DEMONSTRATION] =
	SkillAction[SK.AM_ACIDTERROR] =
	SkillAction[SK.AM_POTIONPITCHER] =
	SkillAction[SK.TF_SPRINKLESAND] =
	SkillAction[SK.TF_THROWSTONE] =
	SkillAction[SK.NJ_SYURIKEN] =
	SkillAction[SK.NJ_KUNAI] =
	SkillAction[SK.NJ_ZENYNAGE] =
	SkillAction[SK.ITM_TOMAHAWK] =
	SkillAction[SK.AS_VENOMKNIFE] =
	SkillAction[SK.NC_AXEBOOMERANG] =
	SkillAction[SK.GN_SLINGITEM] = function(entity){
		return {
			action: entity.ACTION.ATTACK1,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.IDLE,
				frame:  0,
				repeat: false,
				play:   false,
				next:   false
			}
		};
	};
	
	//ATTACK2 - Normal attack without visible weapon
	SkillAction[SK.TF_POISON] =
	SkillAction[SK.MC_MAMMONITE] =
	SkillAction[SK.MC_CARTREVOLUTION] = function(entity){
		return {
			action: entity.ACTION.ATTACK2,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.IDLE,
				frame:  0,
				repeat: false,
				play:   false,
				next:   false
			}
		};
	};
	
	//ATTACK3 - Ranged attack with visible weapon
	SkillAction[SK.AC_DOUBLE] =
	SkillAction[SK.ASC_BREAKER] = 
	SkillAction[SK.HT_PHANTASMIC] =
	SkillAction[SK.SN_SHARPSHOOTING] =
	SkillAction[SK.RA_ARROWSTORM] =
	SkillAction[SK.RA_AIMEDBOLT] =
	SkillAction[SK.SC_TRIANGLESHOT] = function(entity){
		return {
			action: entity.ACTION.ATTACK3,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.IDLE,
				frame:  0,
				repeat: false,
				play:   false,
				next:   false
			}
		};
	};
	
	//PICKUP
	SkillAction[SK.HT_LANDMINE] =
	SkillAction[SK.HT_ANKLESNARE] =
	SkillAction[SK.HT_SHOCKWAVE] =
	SkillAction[SK.HT_SANDMAN] =
	SkillAction[SK.HT_FLASHER] =
	SkillAction[SK.HT_FREEZINGTRAP] =
	SkillAction[SK.HT_BLASTMINE] =
	SkillAction[SK.HT_CLAYMORETRAP] =
	SkillAction[SK.HT_REMOVETRAP] =
	SkillAction[SK.HT_TALKIEBOX] =
	SkillAction[SK.TF_PICKSTONE] =
	SkillAction[SK.BS_GREED] =
	SkillAction[SK.RA_ELECTRICSHOCKER] =
	SkillAction[SK.RA_CLUSTERBOMB] =
	SkillAction[SK.RA_MAGENTATRAP] =
	SkillAction[SK.RA_COBALTTRAP] =
	SkillAction[SK.RA_MAIZETRAP] =
	SkillAction[SK.RA_VERDURETRAP] =
	SkillAction[SK.RA_FIRINGTRAP] =
	SkillAction[SK.RA_ICEBOUNDTRAP] = function(entity){
		return {
			action: entity.ACTION.PICKUP,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.IDLE,
				frame:  0,
				repeat: false,
				play:   false,
				next:   false
			}
		};
	};
	
	//Stay in PICKUP
	SkillAction[SK.NJ_TATAMIGAESHI] =
	SkillAction[SK.SR_EARTHSHAKER] = function(entity){
		return {
			action: entity.ACTION.PICKUP,
			frame:  2,
			repeat: false,
			play:   false,
			next:   false
		};
	};
	
	
	//ACTION
	SkillAction[SK.SN_SIGHT] = function(entity){
		return {
			action: entity.ACTION.ACTION,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.IDLE,
				frame:  0,
				repeat: false,
				play:   false,
				next:   false
			}
		};
	};
	
	
	//EXTRA
	//9hit
	SkillAction[SK.CG_ARROWVULCAN] = function(entity){
		return {
			action: entity.ACTION.ATTACK,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.ATTACK,
				frame:  0,
				repeat: false,
				play:   true,
				next:   {
					action: entity.ACTION.ATTACK,
					frame:  0,
					repeat: false,
					play:   true,
					next:   {
						action: entity.ACTION.ATTACK,
						frame:  0,
						repeat: false,
						play:   true,
						next:   {
							action: entity.ACTION.ATTACK,
							frame:  0,
							repeat: false,
							play:   true,
							next:   {
								action: entity.ACTION.ATTACK,
								frame:  0,
								repeat: false,
								play:   true,
								next:   {
									action: entity.ACTION.ATTACK,
									frame:  0,
									repeat: false,
									play:   true,
									next:   {
										action: entity.ACTION.ATTACK,
										frame:  0,
										repeat: false,
										play:   true,
										next:   {
											action: entity.ACTION.ATTACK,
											frame:  0,
											repeat: false,
											play:   true,
											next:   false
										}
									}
								}
							}
						}
					}
				}
			}
		};
	};
	
	
	//8hit
	SkillAction[SK.AS_SONICBLOW] = function(entity){
		return {
			action: entity.ACTION.ATTACK,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.ATTACK,
				frame:  0,
				repeat: false,
				play:   true,
				next:   {
					action: entity.ACTION.ATTACK,
					frame:  0,
					repeat: false,
					play:   true,
					next:   {
						action: entity.ACTION.ATTACK,
						frame:  0,
						repeat: false,
						play:   true,
						next:   {
							action: entity.ACTION.ATTACK,
							frame:  0,
							repeat: false,
							play:   true,
							next:   {
								action: entity.ACTION.ATTACK,
								frame:  0,
								repeat: false,
								play:   true,
								next:   {
									action: entity.ACTION.ATTACK,
									frame:  0,
									repeat: false,
									play:   true,
									next:   {
										action: entity.ACTION.ATTACK,
										frame:  0,
										repeat: false,
										play:   true,
										next:   false
									}
								}
							}
						}
					}
				}
			}
		};
	};
	
	//7hit
	SkillAction[SK.GC_CROSSIMPACT] = function(entity){
		return {
			action: entity.ACTION.ATTACK,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.ATTACK,
				frame:  0,
				repeat: false,
				play:   true,
				next:   {
					action: entity.ACTION.ATTACK,
					frame:  0,
					repeat: false,
					play:   true,
					next:   {
						action: entity.ACTION.ATTACK,
						frame:  0,
						repeat: false,
						play:   true,
						next:   {
							action: entity.ACTION.ATTACK,
							frame:  0,
							repeat: false,
							play:   true,
							next:   {
								action: entity.ACTION.ATTACK,
								frame:  0,
								repeat: false,
								play:   true,
								next:   {
									action: entity.ACTION.ATTACK,
									frame:  0,
									repeat: false,
									play:   true,
									next:   false
								}
							}
						}
					}
				}
			}
		};
	};
	
	
	//SPIN
	/*
	SkillAction[SK.GC_ROLLINGCUTTER] =
	SkillAction[SK.LG_MOONSLASHER] =
	SkillAction[SK.GN_CART_TORNADO] = function(entity){
	};
	*/
	
		
	//Prevent default skill action
	SkillAction[SK.TF_BACKSLIDING] =
	SkillAction[SK.NV_TRICKDEAD] =
	SkillAction[SK.TK_HIGHJUMP] =
	SkillAction[SK.TK_DODGE] =
	SkillAction[SK.LK_TENSIONRELAX] =
	SkillAction[SK.NC_F_SIDESLIDE] =
	SkillAction[SK.NC_B_SIDESLIDE] = false;
		
	
	return SkillAction;

});	
