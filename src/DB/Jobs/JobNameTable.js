/**
 * DB/Jobs/JobNameTable.js
 *
 * Look up: job id -> ressource name
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault, Antares
 */

define(["./JobConst"], function( JobId )
{
	"use strict";


	var JobNameTable = {};

	JobNameTable[JobId.NOVICE]           = "\xC3\xCA\xBA\xB8\xC0\xDA";

	JobNameTable[JobId.SWORDMAN]         = "\xB0\xCB\xBB\xE7";
	JobNameTable[JobId.MAGICIAN]         = "\xB8\xB6\xB9\xFD\xBB\xE7";
	JobNameTable[JobId.ARCHER]           = "\xB1\xC3\xBC\xF6";
	JobNameTable[JobId.ACOLYTE]          = "\xBC\xBA\xC1\xF7\xC0\xDA";
	JobNameTable[JobId.MERCHANT]         = "\xBB\xF3\xC0\xCE";
	JobNameTable[JobId.THIEF]            = "\xB5\xB5\xB5\xCF";

	JobNameTable[JobId.KNIGHT]           = "\xB1\xE2\xBB\xE7";
	JobNameTable[JobId.PRIEST]           = "\xC7\xC1\xB8\xAE\xBD\xBA\xC6\xAE";
	JobNameTable[JobId.WIZARD]           = "\xC0\xA7\xC0\xFA\xB5\xE5";
	JobNameTable[JobId.BLACKSMITH]       = "\xC1\xA6\xC3\xB6\xB0\xF8";
	JobNameTable[JobId.HUNTER]           = "\xC7\xE5\xC5\xCD";
	JobNameTable[JobId.ASSASSIN]         = "\xBE\xEE\xBC\xBC\xBD\xC5";
	JobNameTable[JobId.KNIGHT2]          = "\xC6\xE4\xC4\xDA\xC6\xE4\xC4\xDA_\xB1\xE2\xBB\xE7";

	JobNameTable[JobId.CRUSADER]         = "\xC5\xA9\xB7\xE7\xBC\xBC\xC0\xCC\xB4\xF5";
	JobNameTable[JobId.MONK]             = "\xB8\xF9\xC5\xA9";
	JobNameTable[JobId.SAGE]             = "\xBC\xBC\xC0\xCC\xC1\xF6";
	JobNameTable[JobId.ROGUE]            = "\xB7\xCE\xB1\xD7";
	JobNameTable[JobId.ALCHEMIST]        = "\xBF\xAC\xB1\xDD\xBC\xFA\xBB\xE7";
	JobNameTable[JobId.BARD]             = "\xB9\xD9\xB5\xE5";
	JobNameTable[JobId.DANCER]           = "\xB9\xAB\xC8\xF1";
	JobNameTable[JobId.CRUSADER2]        = "\xBD\xC5\xC6\xE4\xC4\xDA\xC5\xA9\xB7\xE7\xBC\xBC\xC0\xCC\xB4\xF5";

	JobNameTable[JobId.SUPERNOVICE]      = "\xBD\xB4\xC6\xDB\xB3\xEB\xBA\xF1\xBD\xBA";
	JobNameTable[JobId.GUNSLINGER]       = "\xB0\xC7\xB3\xCA";
	JobNameTable[JobId.NINJA]            = "\xB4\xD1\xC0\xDA";
	JobNameTable[JobId.TAEKWON]          = "\xc5\xc2\xb1\xc7\xbc\xd2\xb3\xe2";
	JobNameTable[JobId.STAR]             = "\xb1\xc7\xbc\xba";
	JobNameTable[JobId.STAR2]            = "\xb1\xc7\xbc\xba\xc0\xb6\xc7\xd5";
	JobNameTable[JobId.LINKER]           = "\xbc\xd2\xbf\xef\xb8\xb5\xc4\xbf";

	JobNameTable[JobId.MARRIED]          = "\xB0\xE1\xC8\xA5";
	JobNameTable[JobId.XMAS]             = "\xBB\xEA\xC5\xB8";
	JobNameTable[JobId.SUMMER]           = "\xBF\xA9\xB8\xA7";

	JobNameTable[JobId.KNIGHT_H]         = "\xB7\xCE\xB5\xE5\xB3\xAA\xC0\xCC\xC6\xAE";
	JobNameTable[JobId.PRIEST_H]         = "\xC7\xCF\xC0\xCC\xC7\xC1\xB8\xAE";
	JobNameTable[JobId.WIZARD_H]         = "\xC7\xCF\xC0\xCC\xC0\xA7\xC0\xFA\xB5\xE5";
	JobNameTable[JobId.BLACKSMITH_H]     = "\xC8\xAD\xC0\xCC\xC6\xAE\xBD\xBA\xB9\xCC\xBD\xBA";
	JobNameTable[JobId.HUNTER_H]         = "\xBD\xBA\xB3\xAA\xC0\xCC\xC6\xDB";
	JobNameTable[JobId.ASSASSIN_H]       = "\xBE\xEE\xBD\xD8\xBD\xC5\xC5\xA9\xB7\xCE\xBD\xBA";
	JobNameTable[JobId.KNIGHT2_H]        = "\xB7\xCE\xB5\xE5\xC6\xE4\xC4\xDA";
	JobNameTable[JobId.CRUSADER_H]       = "\xC6\xC8\xB6\xF3\xB5\xF2";
	JobNameTable[JobId.MONK_H]           = "\xC3\xA8\xC7\xC7\xBF\xC2";
	JobNameTable[JobId.SAGE_H]           = "\xC7\xC1\xB7\xCE\xC6\xE4\xBC\xAD";
	JobNameTable[JobId.ROGUE_H]          = "\xBD\xBA\xC5\xE4\xC4\xBF";
	JobNameTable[JobId.ALCHEMIST_H]      = "\xC5\xA9\xB8\xAE\xBF\xA1\xC0\xCC\xC5\xCD";
	JobNameTable[JobId.BARD_H]           = "\xC5\xAC\xB6\xF3\xBF\xEE";
	JobNameTable[JobId.DANCER_H]         = "\xC1\xFD\xBD\xC3";
	JobNameTable[JobId.CRUSADER2_H]      = "\xC6\xE4\xC4\xDA\xC6\xC8\xB6\xF3\xB5\xF2";

	JobNameTable[JobId.RUNE_KNIGHT]      = "\xB7\xE9\xB3\xAA\xC0\xCC\xC6\xAE";
	JobNameTable[JobId.WARLOCK]          = "\xBF\xF6\xB7\xCF";
	JobNameTable[JobId.RANGER]           = "\xB7\xB9\xC0\xCE\xC1\xAE";
	JobNameTable[JobId.ARCHBISHOP]       = "\xBE\xC6\xC5\xA9\xBA\xF1\xBC\xF3";
	JobNameTable[JobId.MECHANIC]         = "\xB9\xCC\xC4\xC9\xB4\xD0";
	JobNameTable[JobId.GUILLOTINE_CROSS] = "\xB1\xE6\xB7\xCE\xC6\xBE\xC5\xA9\xB7\xCE\xBD\xBA";

	JobNameTable[JobId.ROYAL_GUARD]      = "\xB0\xA1\xB5\xE5";
	JobNameTable[JobId.SORCERER]         = "\xBC\xD2\xBC\xAD\xB7\xAF";
	JobNameTable[JobId.MINSTREL]         = "\xB9\xCE\xBD\xBA\xC6\xAE\xB7\xB2";
	JobNameTable[JobId.WANDERER]         = "\xBF\xF8\xB4\xF5\xB7\xAF";
	JobNameTable[JobId.SURA]             = "\xBD\xB4\xB6\xF3";
	JobNameTable[JobId.GENETIC]          = "\xC1\xA6\xB3\xD7\xB8\xAF";
	JobNameTable[JobId.SHADOW_CHASER]    = "\xBD\xA6\xB5\xB5\xBF\xEC\xC3\xBC\xC0\xCC\xBC\xAD";

	JobNameTable[JobId.RUNE_KNIGHT2]     = "\xB7\xE9\xB3\xAA\xC0\xCC\xC6\xAE\xBB\xDA\xB6\xEC";
	JobNameTable[JobId.ROYAL_GUARD2]     = "\xB1\xD7\xB8\xAE\xC6\xF9\xB0\xA1\xB5\xE5";
	JobNameTable[JobId.RANGER2]          = "\xB7\xB9\xC0\xCE\xC1\xAE\xB4\xC1\xB4\xEB";
	JobNameTable[JobId.MECHANIC2]        = "\xB8\xB6\xB5\xB5\xB1\xE2\xBE\xEE";
	
	JobNameTable[JobId.SUPERNOVICE2]	 = "\xBD\xB4\xC6\xDB\xB3\xEB\xBA\xF1\xBD\xBA";
	JobNameTable[JobId.KAGEROU] 		 = "kagerou";
	JobNameTable[JobId.OBORO] 			 = "oboro";
	JobNameTable[JobId.REBELLION] 		 = "rebellion";
	
	//MOUNTS
	JobNameTable[JobId.PORING_NOVICE]     = "³ëºñ½ºÆ÷¸µ";

	JobNameTable[JobId.SHEEP_ACO]         = "º¹»ç¾ËÆÄÄ«";
	JobNameTable[JobId.OSTRICH_ARCHER]    = "Å¸Á¶±Ã¼ö";
	JobNameTable[JobId.FOX_MAGICIAN]      = "¿©¿ì¸¶¹ý»ç";
	JobNameTable[JobId.PIG_MERCHANT]      = "»óÀÎ¸äµÅÁö";
	JobNameTable[JobId.PECO_SWORD]        = "ÆäÄÚ°Ë»ç";
	JobNameTable[JobId.DOG_THIEF]         = "ÄÌº£·Î½ºµµµÏ";

	JobNameTable[JobId.SHEEP_PRIEST]      = "ÇÁ¸®½ºÆ®¾ËÆÄÄ«";
	JobNameTable[JobId.OSTRICH_HUNTER]    = "Å¸Á¶ÇåÅÍ";
	JobNameTable[JobId.FOX_WIZ]           = "¿©¿ìÀ§Àúµå";
	JobNameTable[JobId.PIG_BLACKSMITH]    = "Á¦Ã¶°ø¸äµÅÁö";
	JobNameTable[JobId.LION_KNIGHT]       = "»çÀÚ±â»ç";
	JobNameTable[JobId.DOG_ASSASSIN]      = "ÄÌº£·Î½º¾î½ê½Å";

	JobNameTable[JobId.SHEEP_MONK]        = "¸ùÅ©¾ËÆÄÄ«";
	JobNameTable[JobId.OSTRICH_BARD]      = "Å¸Á¶¹Ùµå";
	JobNameTable[JobId.OSTRICH_DANCER]    = "Å¸Á¶¹«Èñ";
	JobNameTable[JobId.FOX_SAGE]          = "¿©¿ì¼¼ÀÌÁö";
	JobNameTable[JobId.PIG_ALCHE]         = "¿¬±Ý¼ú»ç¸äµÅÁö";
	JobNameTable[JobId.LION_CRUSADER]     = "»çÀÚÅ©·ç¼¼ÀÌ´õ";
	JobNameTable[JobId.DOG_ROGUE]         = "ÄÌº£·Î½º·Î±×";

	JobNameTable[JobId.SHEEP_ARCB]        = "¾ÆÅ©ºñ¼ó¾ËÆÄÄ«";
	JobNameTable[JobId.OSTRICH_RANGER]    = "Å¸Á¶·¹ÀÎÁ®";
	JobNameTable[JobId.FOX_WARLOCK]       = "¿©¿ì¿ö·Ï";
	JobNameTable[JobId.PIG_MECHANIC]      = "¹ÌÄÉ´Ð¸äµÅÁö";
	JobNameTable[JobId.LION_RUNE_KNIGHT]  = "»çÀÚ·é³ªÀÌÆ®";
	JobNameTable[JobId.DOG_G_CROSS]       = "ÄÌº£·Î½º±æ·ÎÆ¾Å©·Î½º";

	JobNameTable[JobId.SHEEP_SURA]        = "½´¶ó¾ËÆÄÄ«";
	JobNameTable[JobId.OSTRICH_MINSTREL]  = "Å¸Á¶¹Î½ºÆ®·²";
	JobNameTable[JobId.OSTRICH_WANDER]    = "Å¸Á¶¿ø´õ·¯";
	JobNameTable[JobId.FOX_SORCERER]      = "¿©¿ì¼Ò¼­·¯";
	JobNameTable[JobId.PIG_GENETIC]       = "Á¦³×¸¯¸äµÅÁö";
	JobNameTable[JobId.LION_ROYAL_GUARD]  = "»çÀÚ·Î¾â°¡µå";
	JobNameTable[JobId.DOG_CHASER]        = "ÄÌº£·Î½º½¦µµ¿ìÃ¼ÀÌ¼­";

	JobNameTable[JobId.PORING_SNOVICE]    = "½´ÆÛ³ëºñ½ºÆ÷¸µ";

	JobNameTable[JobId.FROG_NINJA]        = "³ëºñ½ºÆ÷¸µ";
	JobNameTable[JobId.PECO_GUNNER]       = "ÆäÄÚ°Ç³Ê";
	JobNameTable[JobId.PORING_TAEKWON]    = "ÅÂ±Ç¼Ò³âÆ÷¸µ";

	JobNameTable[JobId.PORING_STAR]       = "±Ç¼ºÆ÷¸µ";
	JobNameTable[JobId.FROG_LINKER]       = "µÎ²¨ºñ¼Ò¿ï¸µÄ¿";

	JobNameTable[JobId.FROG_KAGEROU]      = "frog_kagerou";
	JobNameTable[JobId.FROG_OBORO]        = "frog_oboro";
	JobNameTable[JobId.PECO_REBELLION]    = "peco_rebellion";

	JobNameTable[JobId.SHEEP_HPRIEST]     = "ÇÏÀÌÇÁ¸®½ºÆ®¾ËÆÄÄ«";
	JobNameTable[JobId.OSTRICH_SNIPER]    = "Å¸Á¶½º³ªÀÌÆÛ";
	JobNameTable[JobId.FOX_HWIZ]          = "¿©¿ìÇÏÀÌÀ§Àúµå";
	JobNameTable[JobId.PIG_WHITESMITH]    = "È­ÀÌÆ®½º¹Ì½º¸äµÅÁö";
	JobNameTable[JobId.LION_KNIGHT_H]     = "»çÀÚ·Îµå³ªÀÌÆ®";
	JobNameTable[JobId.DOG_ASSA_X]        = "ÄÌº£·Î½º¾î½ê½ÅÅ©·Î½º";

	JobNameTable[JobId.SHEEP_CHAMP]       = "Ã¨ÇÇ¿Â¾ËÆÄÄ«";
	JobNameTable[JobId.OSTRICH_CROWN]     = "Å¸Á¶Å©¶ó¿î";
	JobNameTable[JobId.OSTRICH_ZIPSI]     = "Å¸Á¶Â¤½Ã";
	JobNameTable[JobId.FOX_PROF]          = "¿©¿ìÇÁ·ÎÆä¼­";
	JobNameTable[JobId.PIG_CREATOR]       = "Å©¸®¿¡ÀÌÅÍ¸äµÅÁö";
	JobNameTable[JobId.LION_CRUSADER_H]   = "»çÀÚÆÈ¶óµò";
	JobNameTable[JobId.DOG_STALKER]       = "ÄÌº£·Î½º½ºÅäÄ¿";

	function duplicateEntry(origin) {
		var value = JobNameTable[origin];
		var i, count = arguments.length;

		for (i = 1; i < count; ++i) {
			JobNameTable[arguments[i]] = value;
		}
	}

	// Inherit
	duplicateEntry(JobId.NOVICE,           JobId.NOVICE_H,           JobId.NOVICE_B);
	duplicateEntry(JobId.SWORDMAN,         JobId.SWORDMAN_H,         JobId.SWORDMAN_B);
	duplicateEntry(JobId.MAGICIAN,         JobId.MAGICIAN_H,         JobId.MAGICIAN_B);
	duplicateEntry(JobId.ARCHER,           JobId.ARCHER_H,           JobId.ARCHER_B);
	duplicateEntry(JobId.ACOLYTE,          JobId.ACOLYTE_H,          JobId.ACOLYTE_B);
	duplicateEntry(JobId.MERCHANT,         JobId.MERCHANT_H,         JobId.MERCHANT_B);
	duplicateEntry(JobId.THIEF,            JobId.THIEF_H,            JobId.THIEF_B);

	duplicateEntry(JobId.KNIGHT,           JobId.KNIGHT_B);
	duplicateEntry(JobId.KNIGHT2,          JobId.KNIGHT2_B);
	duplicateEntry(JobId.PRIEST,           JobId.PRIEST_B);
	duplicateEntry(JobId.WIZARD,           JobId.WIZARD_B);
	duplicateEntry(JobId.BLACKSMITH,       JobId.BLACKSMITH_B);
	duplicateEntry(JobId.HUNTER,           JobId.HUNTER_B);
	duplicateEntry(JobId.ASSASSIN,         JobId.ASSASSIN_B);
	duplicateEntry(JobId.CRUSADER,         JobId.CRUSADER_B);
	duplicateEntry(JobId.CRUSADER2,        JobId.CRUSADER2_B);
	duplicateEntry(JobId.MONK,             JobId.MONK_B);
	duplicateEntry(JobId.SAGE,             JobId.SAGE_B);
	duplicateEntry(JobId.ROGUE,            JobId.ROGUE_B);
	duplicateEntry(JobId.ALCHEMIST,        JobId.ALCHEMIST_B);
	duplicateEntry(JobId.BARD,             JobId.BARD_B);
	duplicateEntry(JobId.DANCER,           JobId.DANCER_B);

	duplicateEntry(JobId.RUNE_KNIGHT,      JobId.RUNE_KNIGHT_H,      JobId.RUNE_KNIGHT_B);
	duplicateEntry(JobId.RUNE_KNIGHT2,     JobId.RUNE_KNIGHT2_H,     JobId.RUNE_KNIGHT2_B);
	duplicateEntry(JobId.WARLOCK,          JobId.WARLOCK_H,          JobId.WARLOCK_B);
	duplicateEntry(JobId.RANGER,           JobId.RANGER_H,           JobId.RANGER_B);
	duplicateEntry(JobId.RANGER2,          JobId.RANGER2_H,          JobId.RANGER2_B);
	duplicateEntry(JobId.ARCHBISHOP,       JobId.ARCHBISHOP_H,       JobId.ARCHBISHOP_B);
	duplicateEntry(JobId.MECHANIC,         JobId.MECHANIC_H,         JobId.MECHANIC_B);
	duplicateEntry(JobId.MECHANIC2,        JobId.MECHANIC2_H,        JobId.MECHANIC2_B);
	duplicateEntry(JobId.GUILLOTINE_CROSS, JobId.GUILLOTINE_CROSS_H, JobId.GUILLOTINE_CROSS_B);
	duplicateEntry(JobId.ROYAL_GUARD,      JobId.ROYAL_GUARD_H,      JobId.ROYAL_GUARD_B);
	duplicateEntry(JobId.ROYAL_GUARD2,     JobId.ROYAL_GUARD2_H,     JobId.ROYAL_GUARD2_B);
	duplicateEntry(JobId.SORCERER,         JobId.SORCERER_H,         JobId.SORCERER_B);
	duplicateEntry(JobId.MINSTREL,         JobId.MINSTREL_H,         JobId.MINSTREL_B);
	duplicateEntry(JobId.WANDERER,         JobId.WANDERER_H,         JobId.WANDERER_B);
	duplicateEntry(JobId.SURA,             JobId.SURA_H,             JobId.SURA_B);
	duplicateEntry(JobId.GENETIC,          JobId.GENETIC_H,          JobId.GENETIC_B);
	duplicateEntry(JobId.SHADOW_CHASER,    JobId.SHADOW_CHASER_H,    JobId.SHADOW_CHASER_B);
	
	//MOUNTS
	duplicateEntry(JobId.PORING_NOVICE    ,JobId.PORING_NOVICE_H     ,JobId.PORING_NOVICE_B);

	duplicateEntry(JobId.SHEEP_ACO        ,JobId.SHEEP_ACO_H         ,JobId.SHEEP_ACO_B);
	duplicateEntry(JobId.OSTRICH_ARCHER   ,JobId.OSTRICH_ARCHER_H    ,JobId.OSTRICH_ARCHER_B);
	duplicateEntry(JobId.FOX_MAGICIAN     ,JobId.FOX_MAGICIAN_H      ,JobId.FOX_MAGICIAN_B);
	duplicateEntry(JobId.PIG_MERCHANT     ,JobId.PIG_MERCHANT_H      ,JobId.PIG_MERCHANT_B);
	duplicateEntry(JobId.PECO_SWORD       ,JobId.PECO_SWORD_H        ,JobId.PECO_SWORD_B);
	duplicateEntry(JobId.DOG_THIEF        ,JobId.DOG_THIEF_H         ,JobId.DOG_THIEF_B);

	duplicateEntry(JobId.SHEEP_PRIEST     ,JobId.SHEEP_PRIEST_B);
	duplicateEntry(JobId.OSTRICH_HUNTER   ,JobId.OSTRICH_HUNTER_B);
	duplicateEntry(JobId.FOX_WIZ          ,JobId.FOX_WIZ_B);
	duplicateEntry(JobId.PIG_BLACKSMITH   ,JobId.PIG_BLACKSMITH_B);
	duplicateEntry(JobId.LION_KNIGHT      ,JobId.LION_KNIGHT_B);
	duplicateEntry(JobId.DOG_ASSASSIN     ,JobId.DOG_ASSASSIN_B);

	duplicateEntry(JobId.SHEEP_MONK       ,JobId.SHEEP_MONK_B);
	duplicateEntry(JobId.OSTRICH_BARD     ,JobId.OSTRICH_BARD_B);
	duplicateEntry(JobId.OSTRICH_DANCER   ,JobId.OSTRICH_DANCER_B);
	duplicateEntry(JobId.FOX_SAGE         ,JobId.FOX_SAGE_B);
	duplicateEntry(JobId.PIG_ALCHE        ,JobId.PIG_ALCHE_B);
	duplicateEntry(JobId.LION_CRUSADER    ,JobId.LION_CRUSADER_B);
	duplicateEntry(JobId.DOG_ROGUE        ,JobId.DOG_ROGUE_B);

	duplicateEntry(JobId.SHEEP_ARCB       ,JobId.SHEEP_ARCB_B);
	duplicateEntry(JobId.OSTRICH_RANGER   ,JobId.OSTRICH_RANGER_B);
	duplicateEntry(JobId.FOX_WARLOCK      ,JobId.FOX_WARLOCK_B);
	duplicateEntry(JobId.PIG_MECHANIC     ,JobId.PIG_MECHANIC_B);
	duplicateEntry(JobId.LION_RUNE_KNIGHT ,JobId.LION_RUNE_KNIGHT_B);
	duplicateEntry(JobId.DOG_G_CROSS      ,JobId.DOG_G_CROSS_B);

	duplicateEntry(JobId.SHEEP_SURA       ,JobId.SHEEP_SURA_B);
	duplicateEntry(JobId.OSTRICH_MINSTREL ,JobId.OSTRICH_MINSTREL_B);
	duplicateEntry(JobId.OSTRICH_WANDER   ,JobId.OSTRICH_WANDER_B);
	duplicateEntry(JobId.FOX_SORCERER     ,JobId.FOX_SORCERER_B);
	duplicateEntry(JobId.PIG_GENETIC      ,JobId.PIG_GENETIC_B);
	duplicateEntry(JobId.LION_ROYAL_GUARD ,JobId.LION_ROYAL_GUARD_B);
	duplicateEntry(JobId.DOG_CHASER       ,JobId.DOG_CHASER_B);

	duplicateEntry(JobId.PORING_SUPERNOVICE ,JobId.PORING_SUPERNOVICE_B ,JobId.PORING_SNOVICE2 ,JobId.PORING_SNOVICE2_B);

	duplicateEntry(JobId.FROG_NINJA       ,JobId.FROG_NINJA_B);
	duplicateEntry(JobId.PECO_GUNNER      ,JobId.PECO_GUNNER_B);
	duplicateEntry(JobId.PORING_TAEKWON   ,JobId.PORING_TAEKWON_B);

	duplicateEntry(JobId.PORING_STAR      ,JobId.PORING_STAR_B);
	duplicateEntry(JobId.FROG_LINKER      ,JobId.FROG_LINKER_B);

	duplicateEntry(JobId.PORING_SNOVICE2  ,JobId.PORING_SNOVICE2_B);
	duplicateEntry(JobId.FROG_KAGEROU     ,JobId.FROG_KAGEROU_B);
	duplicateEntry(JobId.FROG_OBORO       ,JobId.FROG_OBORO_B);
	duplicateEntry(JobId.PECO_REBELLION   ,JobId.PECO_REBELLION_B);
	
	
	return JobNameTable;
});
