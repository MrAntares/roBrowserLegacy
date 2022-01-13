/**
 * DB/Items/WeaponHitSoundTable.js
 *
 * Weapon sound table resources
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define(["./WeaponType"], function( WeaponType )
{
	"use strict";


	var WeaponSound = {};

	WeaponSound[WeaponType.NONE]                  = ["_hit_fist1.wav", "_hit_fist2.wav", "_hit_fist3.wav", "_hit_fist4.wav"];
	WeaponSound[WeaponType.SHORTSWORD]            = ["_hit_dagger.wav"];
	WeaponSound[WeaponType.SWORD]                 = ["_hit_sword.wav"];
	WeaponSound[WeaponType.TWOHANDSWORD]          = ["_hit_sword.wav"];
	WeaponSound[WeaponType.SPEAR]                 = ["_hit_spear.wav"];
	WeaponSound[WeaponType.TWOHANDSPEAR]          = ["_hit_spear.wav"];
	WeaponSound[WeaponType.AXE]                   = ["_hit_axe.wav"];
	WeaponSound[WeaponType.TWOHANDAXE]            = ["_hit_axe.wav"];
	WeaponSound[WeaponType.MACE]                  = ["_hit_mace.wav"];
	WeaponSound[WeaponType.TWOHANDMACE]           = ["_hit_mace.wav"];
	WeaponSound[WeaponType.ROD]                   = ["_hit_rod.wav"];
	WeaponSound[WeaponType.BOW]                   = ["_hit_arrow.wav"];
	WeaponSound[WeaponType.KNUKLE]                = ["_HIT_FIST2.wav"];
	WeaponSound[WeaponType.INSTRUMENT]            = ["_hit_mace.wav"];
	WeaponSound[WeaponType.WHIP]                  = ["_hit_mace.wav"];
	WeaponSound[WeaponType.BOOK]                  = ["_hit_mace.wav"];
	WeaponSound[WeaponType.KATAR]                 = ["_hit_mace.wav"];
	WeaponSound[WeaponType.GUN_HANDGUN]           = ["\x5f\x68\x69\x74\x5f\xb1\xc7\x3f\x3f\x2e\x77\x61\x76"]; //_hit_±ÇÃÑ.wav
	WeaponSound[WeaponType.GUN_RIFLE]             = ["\x5f\x68\x69\x74\x5f\xb6\xf3\x3f\x3f\xc7\x3f\x2e\x77\x61\x76"]; //_hit_¶óÀÌÇÃ.wav
	WeaponSound[WeaponType.GUN_GATLING]           = ["\x5f\x68\x69\x74\x5f\xb0\x3f\x3f\x3f\xb8\xb5\xc7\x3f\x3f\xdf\x2e\x77\x61\x76"]; //_hit_°³Æ²¸µÇÑ¹ß.wav
	WeaponSound[WeaponType.GUN_SHOTGUN]           = ["\x5f\x68\x69\x74\x5f\x3f\xa6\xb0\xc7\x2e\x77\x61\x76"]; //_hit_¼¦°Ç.wav
	WeaponSound[WeaponType.GUN_GRANADE]           = ["\x5f\x68\x69\x74\x5f\xb1\xd7\xb7\x3f\x3f\xd7\x3f\x3f\xb5\x3f\xb7\xb1\x3f\xc4\x2e\x77\x61\x76"]; //_hit_±×·¹³×ÀÌµå·±ÃÄ.wav
	WeaponSound[WeaponType.SYURIKEN]              = ["_hit_mace.wav"];
	WeaponSound[WeaponType.TWOHANDROD]            = ["_hit_rod.wav"];
	WeaponSound[WeaponType.LAST]                  = ["_hit_fist4.wav"];
	WeaponSound[WeaponType.SHORTSWORD_SHORTSWORD] = ["_hit_mace.wav"];
	WeaponSound[WeaponType.SWORD_SWORD]           = ["_hit_mace.wav"];
	WeaponSound[WeaponType.AXE_AXE]               = ["_hit_mace.wav"];
	WeaponSound[WeaponType.SHORTSWORD_SWORD]      = ["_hit_mace.wav"];
	WeaponSound[WeaponType.SHORTSWORD_AXE]        = ["_hit_mace.wav"];
	WeaponSound[WeaponType.SWORD_AXE]             = ["_hit_mace.wav"];
	WeaponSound[WeaponType.MAX]                   = ["_hit_mace.wav"];

	return WeaponSound;
});
