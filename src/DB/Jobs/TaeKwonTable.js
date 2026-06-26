/**
 * DB/Jobs/TaeKwonTable.js
 *
 * List all TaeKwon-tree jobs (used for the Warm Wind / TK_SEVENWIND
 * status icon swap that the official ragexe client applies to TKM-tree
 * characters regardless of buff source — see GetEFSTImgFileName at
 * 0xc50950 in mars-26 Ragexe.exe, FIRE/WATER/.../SAINT branches).
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import JobId from './JobConst.js';

export default [
	// 1st/2nd jobs (range [4046..4049] in client)
	JobId.TAEKWON,           // 4046
	JobId.STAR,              // 4047
	JobId.STAR2,             // 4048  (Star Gladiator union form)
	JobId.LINKER,            // 4049  (Soul Linker)

	// Baby variants (individual cmp/je in client)
	JobId.TAEKWON_B,         // 4225
	JobId.STAR_B,            // 4226
	JobId.LINKER_B,          // 4227
	JobId.STAR2_B,           // 4238  (baby SG union)

	// 3rd jobs + their baby variants (range [4239..4244] in client)
	JobId.STAR_EMPEROR,      // 4239
	JobId.SOUL_REAPER,       // 4240
	JobId.STAR_EMPEROR_B,    // 4241
	JobId.SOUL_REAPER_B,     // 4242
	JobId.STAR_EMPEROR2,     // 4243  (SE union)
	JobId.STAR_EMPEROR2_B,   // 4244  (baby SE union)
	JobId.SOUL_REAPER2,      // 4245
	JobId.SOUL_REAPER2_B,    // 4246

	// 4th jobs (individual cmp/je in client)
	JobId.SKY_EMPEROR,       // 4302
	JobId.SOUL_ASCETIC,      // 4303
	JobId.SKY_EMPEROR2       // 4316  (SE 4th union form)
];
