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
	SkillAction['DEFAULT'] = function(entity, tick){
		return {
			action: entity.ACTION.SKILL,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.IDLE,
				frame:  0,
				repeat: true,
				play:   true,
				next:   false
			}
		};
	};
		
	//Skill action overrides
	
	
	//IDLE
	SkillAction[SK.ST_CHASEWALK] = function(entity, tick){
		return {
			action: entity.ACTION.IDLE,
			frame: 0,
			repeat: true,
			play: true,
			next: false
		};
	};
	
	//ATTACK - Normal attack with visible weapon
	SkillAction[SK.SM_BASH] =
	SkillAction[SK.SM_MAGNUM] =
	//SkillAction[SK.AC_SHOWER] =
	
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
	SkillAction[SK.GC_ROLLINGCUTTER] =
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
	SkillAction[SK.LG_MOONSLASHER] =
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
	SkillAction[SK.SR_GATEOFHELL] = function(entity, tick){
		return {
			action: entity.ACTION.ATTACK,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.IDLE,
				frame:  0,
				repeat: true,
				play:   true,
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
	SkillAction[SK.AM_CANNIBALIZE] =
	SkillAction[SK.TF_SPRINKLESAND] =
	SkillAction[SK.TF_THROWSTONE] =
	SkillAction[SK.NJ_SYURIKEN] =
	SkillAction[SK.NJ_KUNAI] =
	SkillAction[SK.NJ_ZENYNAGE] =
	SkillAction[SK.ITM_TOMAHAWK] =
	SkillAction[SK.AS_VENOMKNIFE] =
	SkillAction[SK.PA_SHIELDCHAIN] =
	SkillAction[SK.NC_AXEBOOMERANG] =
	SkillAction[SK.GN_SLINGITEM] = function(entity, tick){
		return {
			action: entity.ACTION.ATTACK1,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.IDLE,
				frame:  0,
				repeat: true,
				play:   true,
				next:   false
			}
		};
	};
	
	//ATTACK2 - Normal attack without visible weapon
	SkillAction[SK.TF_POISON] =
	SkillAction[SK.MC_MAMMONITE] =
	SkillAction[SK.MC_CARTREVOLUTION] =
	SkillAction[SK.GN_CART_TORNADO] = function(entity, tick){
		return {
			action: entity.ACTION.ATTACK2,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.IDLE,
				frame:  0,
				repeat: true,
				play:   true,
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
	SkillAction[SK.SC_TRIANGLESHOT] = function(entity, tick){
		return {
			action: entity.ACTION.ATTACK3,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.IDLE,
				frame:  0,
				repeat: true,
				play:   true,
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
	SkillAction[SK.RA_ICEBOUNDTRAP] = function(entity, tick){
		return {
			action: entity.ACTION.PICKUP,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.IDLE,
				frame:  0,
				repeat: true,
				play:   true,
				next:   false
			}
		};
	};
	
	//Stay in PICKUP
	SkillAction[SK.NJ_TATAMIGAESHI] =
	SkillAction[SK.SR_EARTHSHAKER] = function(entity, tick){
		return {
			action: entity.ACTION.PICKUP,
			frame:  1,
			repeat: false,
			play:   false,
			next:   false
		};
	};
	
	
	//ACTION
	SkillAction[SK.SN_SIGHT] = function(entity, tick){
		return {
			action: entity.ACTION.ACTION,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.IDLE,
				frame:  0,
				repeat: true,
				play:   true,
				next:   false
			}
		};
	};
	
	//EXTRA
	//DANCE/PLAY
	SkillAction[SK.DC_WINKCHARM] =
	SkillAction[SK.DC_FORTUNEKISS] =
	SkillAction[SK.DC_UGLYDANCE] =
	SkillAction[SK.DC_HUMMING] =
	SkillAction[SK.DC_DONTFORGETME] =
	SkillAction[SK.DC_SERVICEFORYOU] =
	SkillAction[SK.BA_APPLEIDUN] =
	SkillAction[SK.BA_DISSONANCE] =
	SkillAction[SK.BA_WHISTLE] =
	SkillAction[SK.BA_ASSASSINCROSS] =
	SkillAction[SK.BA_POEMBRAGI] =
	SkillAction[SK.BD_LULLABY] =
	SkillAction[SK.BD_RICHMANKIM] =
	SkillAction[SK.BD_ETERNALCHAOS] =
	SkillAction[SK.BD_DRUMBATTLEFIELD] =
	SkillAction[SK.BD_SIEGFRIED] =
	SkillAction[SK.CG_HERMODE] =
	SkillAction[SK.BD_RINGNIBELUNGEN] =
	SkillAction[SK.SKID_BD_ROKISWEIL] =
	SkillAction[SK.BD_INTOABYSS] =
	SkillAction[SK.CG_MOONLIT] =
	SkillAction[SK.CG_MARIONETTE] = function(entity, tick){
		return {
			action: entity.ACTION.SKILL,
			frame: 1,
			length: 3,
			speed: 250,
			repeat: true,
			play: true,
			next: false
		};
	};
	
	//ENDURE
	SkillAction[SK.SM_ENDURE] = function(entity, tick){
		return {
			action: entity.ACTION.READYFIGHT,
			frame: 0,
			repeat: false,
			play: true,
			next: {
				action: entity.ACTION.IDLE,
				frame: 0,
				repeat: true,
				play: true,
				next: false
			}
		};
	};
	
	//ARROW SHOWER
	SkillAction[SK.AC_SHOWER] = function(entity, tick){
		return {
			action: entity.ACTION.ATTACK,
			frame:  0,
			repeat: false,
			speed: 50,
			play:   true,
			next: {
				action: entity.ACTION.READYFIGHT,
				frame:  0,
				repeat: true,
				play:   true,
				next:   false
			}
		};
	};
	
	//AUTO COUNTER
	SkillAction[SK.KN_AUTOCOUNTER] = function(entity, tick){
		return {
			action: entity.ACTION.ATTACK,
			frame:  0,
			repeat: false,
			play:   false,
			next: false
		};
	};
	
	//BLADE STOP
	SkillAction[SK.MO_BLADESTOP] = function(entity, tick){
		return {
			action: entity.ACTION.SKILL,
			frame:  3,
			repeat: false,
			play:   false,
			next: {
				delay: tick + 3000,
				action: entity.ACTION.IDLE,
				frame:  0,
				repeat: true,
				play:   true,
				next:   false
			}
		};
	};
	
	//KAMEHAMEHA
	SkillAction[SK.MO_INVESTIGATE] =
	SkillAction[SK.MO_FINGEROFFENSIVE] = function(entity, tick){
		return {
			action: entity.ACTION.SKILL,
			frame: 4,
			repeat: false,
			play: false,
			next: false
		};
	};
	
	//TK STANCE
	SkillAction[SK.TK_READYSTORM] = function(entity, tick){
		return {
			action: entity.ACTION.SKILL,
			frame: 0,
			repeat: false,
			play: false,
			next: false
		};
	};
	SkillAction[SK.TK_READYDOWN] = function(entity, tick){
		return {
			action: entity.ACTION.SKILL,
			frame: 2,
			repeat: false,
			play: false,
			next: false
		};
	};
	SkillAction[SK.TK_READYTURN] = function(entity, tick){
		return {
			action: entity.ACTION.SKILL,
			frame: 3,
			repeat: false,
			play: false,
			next: false
		};
	};
	SkillAction[SK.TK_READYCOUNTER] = function(entity, tick){
		return {
			action: entity.ACTION.SKILL,
			frame: 4,
			repeat: false,
			play: false,
			next: false
		};
	};
	
	//9hit
	SkillAction[SK.CG_ARROWVULCAN] = function(entity, tick){
		return {
			action: entity.ACTION.ATTACK,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.ATTACK,
				frame:  0,
				repeat: false,
				speed:  30,
				play:   true,
				next:   {
					action: entity.ACTION.ATTACK,
					frame:  0,
					repeat: false,
					speed:  30,
					play:   true,
					next:   {
						action: entity.ACTION.ATTACK,
						frame:  0,
						repeat: false,
						speed:  30,
						play:   true,
						next:   {
							action: entity.ACTION.ATTACK,
							frame:  0,
							repeat: false,
							speed:  30,
							play:   true,
							next:   {
								action: entity.ACTION.ATTACK,
								frame:  0,
								repeat: false,
								speed:  30,
								play:   true,
								next:   {
									action: entity.ACTION.ATTACK,
									frame:  0,
									repeat: false,
									speed:  30,
									play:   true,
									next:   {
										action: entity.ACTION.ATTACK,
										frame:  0,
										repeat: false,
										speed:  30,
										play:   true,
										next:   {
											action: entity.ACTION.ATTACK,
											frame:  0,
											repeat: false,
											speed:  30,
											play:   true,
											next: {
												action: entity.ACTION.READYFIGHT,
												frame:  0,
												repeat: true,
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
			}
		};
	};
	
	
	//8hit
	SkillAction[SK.AS_SONICBLOW] = function(entity, tick){
		return {
			action: entity.ACTION.ATTACK,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.ATTACK,
				frame:  0,
				repeat: false,
				speed:  30,
				play:   true,
				next:   {
					action: entity.ACTION.ATTACK,
					frame:  0,
					repeat: false,
					speed:  30,
					play:   true,
					next:   {
						action: entity.ACTION.ATTACK,
						frame:  0,
						repeat: false,
						speed:  30,
						play:   true,
						next:   {
							action: entity.ACTION.ATTACK,
							frame:  0,
							repeat: false,
							speed:  30,
							play:   true,
							next:   {
								action: entity.ACTION.ATTACK,
								frame:  0,
								repeat: false,
								speed:  30,
								play:   true,
								next:   {
									action: entity.ACTION.ATTACK,
									frame:  0,
									repeat: false,
									speed:  30,
									play:   true,
									next:   {
										action: entity.ACTION.ATTACK,
										frame:  0,
										repeat: false,
										speed:  30,
										play:   true,
										next: {
											action: entity.ACTION.READYFIGHT,
											frame:  0,
											repeat: true,
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
	
	//7hit
	SkillAction[SK.GC_CROSSIMPACT] = function(entity, tick){
		return {
			action: entity.ACTION.ATTACK,
			frame:  0,
			repeat: false,
			play:   true,
			next: {
				action: entity.ACTION.ATTACK,
				frame:  0,
				repeat: false,
				speed:  30,
				play:   true,
				next:   {
					action: entity.ACTION.ATTACK,
					frame:  0,
					repeat: false,
					speed:  30,
					play:   true,
					next:   {
						action: entity.ACTION.ATTACK,
						frame:  0,
						repeat: false,
						speed:  30,
						play:   true,
						next:   {
							action: entity.ACTION.ATTACK,
							frame:  0,
							repeat: false,
							speed:  30,
							play:   true,
							next:   {
								action: entity.ACTION.ATTACK,
								frame:  0,
								repeat: false,
								speed:  30,
								play:   true,
								next:   {
									action: entity.ACTION.ATTACK,
									frame:  0,
									repeat: false,
									speed:  30,
									play:   true,
									next: {
										action: entity.ACTION.READYFIGHT,
										frame:  0,
										repeat: true,
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

