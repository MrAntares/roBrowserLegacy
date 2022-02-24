/**
 * DB/Skills/SkillEffect.js
 *
 * List of skills with informations (in progress)
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
//  effectId: hitEffectId: effectIdOnCaster: beforeCastEffectId:
define(['./SkillConst'], function( SK )
{
    'use strict';

    var SkillEffect = {};

    SkillEffect[SK.SM_PROVOKE] = {
        effectId: 67
    };
       
    SkillEffect[SK.SM_ENDURE] = {
        effectId: 11
    };

    SkillEffect[SK.SM_BASH] = {
        beforeCastEffectId: 16,
        hitEffectId: 1
    };

    SkillEffect[SK.KN_BOWLINGBASH] = {
        effectId: 149,
        hitEffectId: 1
    };

    SkillEffect[SK.LK_CONCENTRATION] = {
        effectId: 369
    };
    
    SkillEffect[SK.LK_SPIRALPIERCE] = {
        beforeCastEffectId: 'spiral_pierce_color',  // [todo: color should be white but how to use white texture?]
        hitEffectId: 'spear_hit_sound'
    };
    
    SkillEffect[SK.MG_SOULSTRIKE] = {
        effectId: 15,
        hitEffectId: 1
    };
    
    SkillEffect[SK.MG_NAPALMBEAT] = {
        // this skill don't get any animation/missile
        hitEffectId: 1
    };

    SkillEffect[SK.SM_MAGNUM] = {
        effectIdOnCaster: 17
    };

    SkillEffect[SK.AL_CRUCIS] = {
        effectId: 40
    };
    
    SkillEffect[SK.AL_TELEPORT] = {
        //effectId: 304 //must not be called on skill cast, but on destination select, which makes this a manual call.
    };

    SkillEffect[SK.MG_SAFETYWALL] = {
        effectId: 315,
        groundEffectId: '315_ground'
    };

    SkillEffect[SK.SA_DELUGE] = {
        groundEffectId: 'deluge_ground'
    };
	
	SkillEffect[SK.MG_SIGHT] = {
        effectId: 22
    };
	
    SkillEffect[SK.MG_STONECURSE] = {
        effectId: 23
    };
	
	SkillEffect[SK.MG_FIREBALL] = {
        effectId: 24,
		hitEffectId: 49
    };

    SkillEffect[SK.MG_FIREWALL] =  {
        hitEffectId: 49,
        groundEffectId: 25
    };

    SkillEffect[SK.MG_COLDBOLT] = {
        effectId: 'coldbolt',
        hitEffectId: 51
    };
    
    SkillEffect[SK.MG_FROSTDIVER] = {
        effectId: 27,
        hitEffectId: 18
    };
    
    SkillEffect[SK.MG_FIREBOLT] = {
        effectId: 'firebolt',
        hitEffectId: 49
    };
    
    SkillEffect[SK.MG_LIGHTNINGBOLT] = {
        effectId: 29,
        hitEffectId: 52
    };

    SkillEffect[SK.MG_THUNDERSTORM] = {
        effectId: 30,
        hitEffectId: 52
    };
	
	SkillEffect[SK.AL_RUWACH] = {
        effectId: 33
    };
	
    SkillEffect[SK.AL_WARP] = {
        effectId: 35,
        groundEffectId: 317 //portal unit
    };
	
	/*SkillEffect[SK.AL_WARP2] = {
        groundEffectId: 317
    };
	
    SkillEffect[SK.AL_WARP] = {
        groundEffectId: 316,
        groundEffectId2: [344, 317],
        groundEffectIdTimer2: [2000, 2000]
    };*/

    SkillEffect[SK.AL_INCAGI] = {
        effectId: 37
    };

    SkillEffect[SK.AL_DECAGI] = {
        effectId: 38
    };

    SkillEffect[SK.AL_HOLYWATER] = {
        effectId: 39
    };

    SkillEffect[SK.AL_BLESSING] = {
        effectId: 42
    };

    SkillEffect[SK.AL_PNEUMA] = {
        groundEffectId: 141
    };

    SkillEffect[SK.AL_CRUCIS] = {
        effectId: 40
    };

    SkillEffect[SK.AL_ANGELUS] = {
        effectId: 41
    };

    SkillEffect[SK.AL_CURE] = {
        effectId: 66
    };
	
	SkillEffect[SK.AL_HEAL] = {
        effectId: 312,
        hitEffectId: 320
    };
	
    SkillEffect[SK.AB_HIGHNESSHEAL] = {
        effectId: 325,
        hitEffectId: 320
    };
	
    SkillEffect[SK.AB_CHEAL] = {
        effectId: 313
    };

    SkillEffect[SK.TF_POISON] = {
        effectId: 20
    };
	
    SkillEffect[SK.TF_DETOXIFY] = {
        hitEffectId: 21
    };
	
    SkillEffect[SK.TF_STEAL] = {
        hitEffectId: 18
    };
	
    SkillEffect[SK.TF_HIDING] = {
        effectId: 16
    };	

    SkillEffect[SK.MC_MAMMONITE] = {
        effectId: 10
    };

    SkillEffect[SK.AC_CONCENTRATION] = {
        effectId: 153
    };

    SkillEffect[SK.ALL_RESURRECTION] = {
        effectId: 77
    };

    SkillEffect[SK.KN_PIERCE] =  {
        effectIdOnCaster: 148,
        hitEffectId: 'spear_hit_sound'
    };

    SkillEffect[SK.KN_BRANDISHSPEAR] = {
        effectId: 70,
        effectIdOnCaster: 144
    };

    SkillEffect[SK.KN_SPEARSTAB] =  {
        effectIdOnCaster: 150
    };
    
    SkillEffect[SK.LK_BERSERK] =  {
        effectId: 368
    };
    
    SkillEffect[SK.LK_HEADCRUSH] =  {
        beforeCastEffectId: 399,
        hitEffectId: 'enemy_hit_normal1'
    };
    
    SkillEffect[SK.LK_JOINTBEAT] =  {
        beforeCastEffectId: 400,
        hitEffectId: 'enemy_hit_normal1'
    };
    
    SkillEffect[SK.LK_AURABLADE] =  {
        beforeCastEffectId: 'white_pulse',
        effectId: 367
    };

    SkillEffect[SK.KN_SPEARBOOMERANG] = {
        effectIdOnCaster: 151,
        hitEffectId: 'enemy_hit_normal1'
    };

    SkillEffect[SK.KN_TWOHANDQUICKEN] = {
        effectId: 130
    };

    SkillEffect[SK.KN_AUTOCOUNTER] = {
        //effectId: 131
    };

    SkillEffect[SK.KN_CHARGEATK] =  {
        beforeCastEffectId: 'white_pulse',
        hitEffectId: 'enemy_hit_normal1'
    };
    
    SkillEffect[SK.PR_IMPOSITIO] = {
        effectId: 84
    };

    SkillEffect[SK.PR_SUFFRAGIUM] = {
        effectId: 88
    };

    SkillEffect[SK.PR_ASPERSIO] = {
        effectId: 86
    };

    SkillEffect[SK.PR_BENEDICTIO] = {
        effectId: 91
    };

    SkillEffect[SK.PR_SANCTUARY] = {
        effectId: 83,
        groundEffectId: 319
    };

    SkillEffect[SK.NJ_KAENSIN] = {
        groundEffectId: 634
    };

    SkillEffect[SK.PR_STRECOVERY] = {
        effectId: 78
    };

    SkillEffect[SK.PR_KYRIE] = {
        effectId: 112
    };

    SkillEffect[SK.PR_MAGNIFICAT] = {
        effectId: 76
    };
    SkillEffect[SK.PR_GLORIA] = {
        effectId: 75
    };

    SkillEffect[SK.PR_LEXDIVINA] = {
        effectId: 87
    };

    SkillEffect[SK.PR_TURNUNDEAD] = {
        effectId: 152
    };

    SkillEffect[SK.PR_LEXAETERNA] = {
        effectId: 85
    };

    SkillEffect[SK.PR_MAGNUS] = {
        effectId: 113,
        hitEffectId: 152,
        groundEffectId: 318
    };
	
    SkillEffect[SK.PR_BENEDICTIO] = {
        effectId: 91
    };

    SkillEffect[SK.WZ_FIREPILLAR] = {
        effectId: 96,
        groundEffectId: 138
    }

    SkillEffect[SK.WZ_METEOR] = {
        effectId: 92,
        hitEffectId: 49
    };

    SkillEffect[SK.WZ_VERMILION] = {
        effectId: 90,
        hitEffectId: 52
    };

    SkillEffect[SK.WZ_STORMGUST] = {
        effectId: 89
    };

    SkillEffect[SK.WZ_QUAGMIRE] = {
        groundEffectId: 95
    };

    SkillEffect[SK.BS_HAMMERFALL] = {
        effectIdOnCaster: 102
    };

    SkillEffect[SK.BS_WEAPONPERFECT] = {
        effectId: 103
    };
    
    SkillEffect[SK.BS_ADRENALINE] = {
        beforeCastEffectId: '98_beforecast',
        effectId: 98
    };

    SkillEffect[SK.BS_MAXIMIZE] = {
        beforeCastEffectId: 'maximize_power_sounds',
        effectId: 104
    };
    
    SkillEffect[SK.MC_CARTREVOLUTION] = { //same effect
        beforeCastEffectId: 170,
        hitEffectId: 170
    };

    SkillEffect[SK.HT_CLAYMORETRAP] = {
        hitEffectId: 107
    };
	
    SkillEffect[SK.HT_SPRINGTRAP] = {
        effectId: 111
    };

    SkillEffect[SK.AS_SONICBLOW] = {
		effectIdOnCaster: 121,
		effectId: 122,
        hitEffectId: 143
    };

    SkillEffect[SK.AS_POISONREACT] = {
        effectId: 126
    };

    SkillEffect[SK.AS_VENOMDUST] = {
        effectId: 124
    };

    SkillEffect[SK.AS_SPLASHER] = {
        effectId: 129
    };

    SkillEffect[SK.MC_CARTREVOLUTION] = {
        effectId: 170
    };

    SkillEffect[SK.MC_LOUD] = {
        effectId: 311
    };

    SkillEffect[SK.AL_HOLYLIGHT] = {
        effectId: 152
    };

    SkillEffect[SK.MG_ENERGYCOAT] = {
        effectId: 169
    };

    SkillEffect[SK.RG_STEALCOIN] = {
        effectId: 268
    };

    SkillEffect[SK.RG_STRIPWEAPON] = {
        effectId: 269
    };

    SkillEffect[SK.RG_STRIPSHIELD] = {
        effectId: 270
    };

    SkillEffect[SK.RG_STRIPARMOR] = {
        effectId: 271
    };

    SkillEffect[SK.RG_STRIPHELM] = {
        effectId: 272
    };

    SkillEffect[SK.CR_SHIELDCHARGE] = {
        effectId: 246
    };

    SkillEffect[SK.CR_HOLYCROSS] = {
        effectId: 245
    };

    SkillEffect[SK.CR_DEVOTION] = {
        effectId: 251
    };

    SkillEffect[SK.CR_PROVIDENCE] = {
        effectId: 248
    };

    SkillEffect[SK.CR_SPEARQUICKEN] = {
        effectId: 250
    };

    SkillEffect[SK.HP_ASSUMPTIO] = {
        effectId: 440
    };

    SkillEffect[SK.WS_MELTDOWN] = {
        effectId: 390
    };

    SkillEffect[SK.WS_CARTBOOST] = {
        effectId: 391
    };

    SkillEffect[SK.ST_REJECTSWORD] = {
        effectId: 392
    };

    SkillEffect[SK.SA_LANDPROTECTOR] = {
        groundEffectId: 242
    };

    SkillEffect[SK.PF_SPIDERWEB] = {
        groundEffectId: 404
    };
    
//Bard, dancer, ensemble
    SkillEffect[SK.BA_DISSONANCE] = {
        groundEffectId: '277_ground'
    }

    SkillEffect[SK.BD_LULLABY] = {
        effectId: 278,
		groundEffectId: '278_ground'
    }

    SkillEffect[SK.BD_RICHMANKIM] = {
        effectId: 279,
		groundEffectId: '279_ground'
    }

    SkillEffect[SK.BD_ETERNALCHAOS] = {
        effectId: 280,
		groundEffectId: '280_ground'
    }

    SkillEffect[SK.BD_DRUMBATTLEFIELD] = {
        effectId: 281,
		groundEffectId: '281_ground'
    }

    SkillEffect[SK.BD_RINGNIBELUNGEN] = {
        effectId: 282,
		groundEffectId: '282_ground'
    }

    SkillEffect[SK.BD_ROKISWEIL] = {
        effectId: 283,
		groundEffectId: '283_ground'
    }

    SkillEffect[SK.BD_INTOABYSS] = {
        effectId: 284,
		groundEffectId: '284_ground'
    }

    SkillEffect[SK.BD_SIEGFRIED] = {
        effectId: 285,
		groundEffectId: '285_ground'
    }

    SkillEffect[SK.BA_WHISTLE] = {
        effectId: 286,
		groundEffectId: '286_ground'
    }

    SkillEffect[SK.BA_ASSASSINCROSS] = {
        effectId: 287,
		groundEffectId: '287_ground'
    }

    SkillEffect[SK.BA_POEMBRAGI] = {
        effectId: 288,
		groundEffectId: '288_ground'
    }

    SkillEffect[SK.BA_APPLEIDUN] = {
        effectId: 289,
		groundEffectId: '289_ground'
    }

    SkillEffect[SK.DC_UGLYDANCE] = {
        groundEffectId: '290_ground'
    }

    SkillEffect[SK.DC_HUMMING] = {
        effectId: 291,
		groundEffectId: '291_ground'
    }

    SkillEffect[SK.DC_DONTFORGETME] = {
        effectId: 292,
		groundEffectId: '292_ground'
    }

    SkillEffect[SK.DC_FORTUNEKISS] = {
        effectId: 293,
		groundEffectId: '293_ground'
    }

    SkillEffect[SK.DC_SERVICEFORYOU] = {
        effectId: 294,
		groundEffectId: '294_ground'
    }
	
	SkillEffect[SK.CG_ARROWVULCAN] = {
        effectId: 393
    }

    SkillEffect[SK.CG_MOONLIT] = {
        effectId: 394,
		groundEffectId: '394_ground'
    }

	SkillEffect[SK.PA_GOSPEL] = {
        effectId: 370,
		groundEffectId: '370_ground'
    }

	SkillEffect[SK.PF_FOGWALL] = {
        groundEffectId: '405_ground'
    }

	SkillEffect[SK.HW_GRAVITATION] = {
        groundEffectId: '522_ground'
    }

	SkillEffect[SK.NPC_EVILLAND] = {
        groundEffectId: '674_ground'
    }

    
    SkillEffect[SK.NPC_CRITICALWOUND] = {
        hitEffectId: 677
    };

    SkillEffect[SK.ST_PRESERVE] =  {
        beforeCastEffectId: '496_beforecast'
    };
	
	SkillEffect[SK.NPC_WIDEFREEZE] = {
        effectId: 89
    };
	
	SkillEffect[SK.NJ_TATAMIGAESHI] = {
        groundEffectId: 631
    };
	
	SkillEffect[SK.GS_GLITTERING] = {
        effectId: 'gunslinger_coin'
    };
	
	SkillEffect[SK.MO_FINGEROFFENSIVE] = {
        effectId: 265
    };
	
	SkillEffect[SK.MO_EXPLOSIONSPIRITS] = {
        effectId: 261
    };
	
	SkillEffect[SK.MO_CHAINCOMBO] = {
        effectId: 273
    };
	
	SkillEffect[SK.BS_GREED] = {
        effectId: 'ef_greed_sound'
    };
	
	SkillEffect[SK.HT_BLITZBEAT] = {
        effectId: 'ef_blitzbeat_sound'
    };
	
	SkillEffect[SK.HW_MAGICCRASHER] = {
        effectId: 380
    };
	
	SkillEffect[SK.ASC_BREAKER] = {
        effectId: 361
    };
	
	SkillEffect[SK.ASC_METEORASSAULT] = {
        effectId: 409
    };
	
	SkillEffect[SK.CR_SHIELDBOOMERANG] = {
        effectId: 249
    };
	
	SkillEffect[SK.MI_RUSH_WINDMILL] = {
        effectId: 'ef_rush_windmill'
    };
	
	SkillEffect[SK.WA_SWING_DANCE] = {
        effectId: 'ef_swing_dance'
    };
	
	SkillEffect[SK.HW_MAGICPOWER] = {
        effectId: 'ef_magicpower'
    };
	
	SkillEffect[SK.MA_SHARPSHOOTING] = {
        effectId: 'ef_sharpshooting'
    };
	
	SkillEffect[SK.WM_POEMOFNETHERWORLD] = {
        effectId: 'ef_poemofnetherworld'
    };
	
	SkillEffect[SK.WM_RANDOMIZESPELL] = {
        effectId: 862
    };
	
	SkillEffect[SK.SC_MANHOLE] = {
        groundEffectId: 822,
		hitEffectId: 823
    };
	
	SkillEffect[SK.SC_DIMENSIONDOOR] = {
        groundEffectId: 822
    };
	
	SkillEffect[SK.SC_MAELSTROM] = {
        groundEffectId: 828
    };
	
	SkillEffect[SK.SC_CHAOSPANIC] = {
        groundEffectId: 827
    };
	
	SkillEffect[SK.SC_BLOODYLUST] = {
        groundEffectId: 829
    };
	
	SkillEffect[SK.SC_BODYPAINT] = {
        effectId: 811
    };
	
	SkillEffect[SK.AB_JUDEX] = {
        effectId: 718
    };
	
	SkillEffect[SK.AB_ANCILLA] = {
        effectId: 'ef_ancilla'
    };
	
	SkillEffect[SK.WM_SEVERE_RAINSTORM] = {
        groundEffectId: 857
    };
	
	SkillEffect[SK.AS_CLOAKING] = {
        effectId: 120
    };
	
	
	
	

    return SkillEffect;
});
