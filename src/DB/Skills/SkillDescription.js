/**
 * DB/Skills/SkillDescription.js
 *
 * Skill Description tABLE
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define(["./SkillConst"], function( SKID )
{
	"use strict";


	var SkillDescription = {};


	SkillDescription[SKID.NV_BASIC] = [
		"Basic Skill",
		"Max Level: 9 ",
		"^777777Enables the use of Basic Interface Skills.^000000",
		"[Lv 1]: Enables Trading",
		"^777777Allows the trading of items with other character.",
		"^990000Right click on a character to initiate.^000000",
		"[Lv 2]: Enables Emotions",
		"^777777Alt+(0~9) and Ctrl+(1,-,=.)",
		"Alt+L opens additional Emotion icons.^000000",
		"[Lv 3]: Enables Sitting",
		"^777777Sitting doubles HP/SP Recovery Speed.",
		"^990000Press the Insert key or type /sit.^000000",
		"[Lv 4]: Enables Chat Room Creation",
		"^777777Alt + C Opens a Chat Room or click the",
		"Chat button in the Basic Information Window.^000000",
		"[Lv 5]: Join a Party",
		"^777777Character can join a party.^000000",
		"[Lv 6]: Enables Use of Kafra Storage",
		"^777777Allows use of Kafra Storage.^000000",
		"[Lv 7]: Organize Party",
		"^777777Create a party by typing",
		"/organize ''Party Name''",
		"Set party options in the Party Window (Alt+Z).^000000",
		"[Lv 9]: Enables Change to First Job Class",
		"^777777Qualifies character for change from Novice to",
		"one of the First Job Classes.^000000"
	].join("\n");

	SkillDescription[SKID.SM_SWORD] = [
		"Sword Mastery",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase damage with",
		"One Handed Sword or Dagger Class Weapons.^000000",
		"[Lv 1]: ^777777ATK +4^000000",
		"[Lv 2]: ^777777ATK +8^000000",
		"[Lv 3]: ^777777ATK +12^000000",
		"[Lv 4]: ^777777ATK +16^000000",
		"[Lv 5]: ^777777ATK +20^000000",
		"[Lv 6]: ^777777ATK +24^000000",
		"[Lv 7]: ^777777ATK +28^000000",
		"[Lv 8]: ^777777ATK +32^000000",
		"[Lv 9]: ^777777ATK +36^000000",
		"[Lv 10]: ^777777ATK +40^000000"
	].join("\n");

	SkillDescription[SKID.SM_TWOHAND] = [
		"Two-Handed Sword Mastery",
		"Max Level: 10",
		"^CC3399Requirement: Sword Mastery 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase damage with",
		"Two Handed Sword Class Weapons.^000000",
		"[Lv 1]: ^777777ATK +4^000000",
		"[Lv 2]: ^777777ATK +8^000000",
		"[Lv 3]: ^777777ATK +12^000000",
		"[Lv 4]: ^777777ATK +16^000000",
		"[Lv 5]: ^777777ATK +20^000000",
		"[Lv 6]: ^777777ATK +24^000000",
		"[Lv 7]: ^777777ATK +28^000000",
		"[Lv 8]: ^777777ATK +32^000000",
		"[Lv 9]: ^777777ATK +36^000000",
		"[Lv 10]: ^777777ATK +40^000000"
	].join("\n");

	SkillDescription[SKID.SM_RECOVERY] = [
		"Increase HP Recovery",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enhance natural HP Recovery.",
		"Max HP affects how much HP restoration is",
		"increased by this skill.^000000",
		"[Lv 1]: ^777777HP +5^000000",
		"[Lv 2]: ^777777HP +10^000000",
		"[Lv 3]: ^777777HP +15^000000",
		"[Lv 4]: ^777777HP +20^000000",
		"[Lv 5]: ^777777HP +25^000000",
		"[Lv 6]: ^777777HP +30^000000",
		"[Lv 7]: ^777777HP +35^000000",
		"[Lv 8]: ^777777HP +40^000000",
		"[Lv 9]: ^777777HP +45^000000",
		"[Lv 10]: ^777777HP +50^000000"
	].join("\n");

	SkillDescription[SKID.SM_BASH] = [
		"Bash",
		"Max Level: 10",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Hit an enemy with crushing force.",
		"If the Fatal Blow skill is learned, Bash will have",
		"an added ^702180Stun^777777 effect at level 6 and higher.^000000",
		"[Lv 1]: ^777777130% ATK^000000",
		"[Lv 2]: ^777777160% ATK^000000",
		"[Lv 3]: ^777777190% ATK^000000",
		"[Lv 4]: ^777777220% ATK^000000",
		"[Lv 5]: ^777777250% ATK^000000",
		"[Lv 6]: ^777777280% ATK^000000",
		"[Lv 7]: ^777777310% ATK^000000",
		"[Lv 8]: ^777777340% ATK^000000",
		"[Lv 9]: ^777777370% ATK^000000",
		"[Lv 10]: ^777777400% ATK^000000"
	].join("\n");

	SkillDescription[SKID.SM_PROVOKE] = [
		"Provoke",
		"Max Level: 10",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Enrage a target to decrease its",
		"defense while increasing its Attack Strength.",
		"Ineffective against the Undead and Boss.^000000",
		"[Lv 1]: ^777777+5% ATK, -10% Def^000000",
		"[Lv 2]: ^777777+8% ATK, -15% Def^000000",
		"[Lv 3]: ^777777+11% ATK, -20% Def^000000",
		"[Lv 4]: ^777777+14% ATK, -25% Def^000000",
		"[Lv 5]: ^777777+17% ATK, -30% Def^000000",
		"[Lv 6]: ^777777+20% ATK, -35% Def^000000",
		"[Lv 7]: ^777777+23% ATK, -40% Def^000000",
		"[Lv 8]: ^777777+26% ATK, -45% Def^000000",
		"[Lv 9]: ^777777+29% ATK, -50% Def^000000",
		"[Lv 10]: ^777777+32% ATK, -55% Def^000000"
	].join("\n");

	SkillDescription[SKID.SM_MAGNUM] = [
		"Magnum Break",
		"Max Level: 10",
		"^CC3399Requirement: Bash 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^bb0000Fire^000000",
		"Description: ^777777Drain small amount HP of the",
		"caster to inflict ^FF0000Fire^777777 property area effect",
		"damage on enemies in the caster's vicinity",
		"and force them backward.",
		"For 10 seconds after Magnum Break, caster's",
		"weapon will receive 20% ^FF0000Fire^777777 property",
		"strength enhancement.^000000",
		"[Lv 1]: ^777777120% ATK^000000",
		"[Lv 2]: ^777777140% ATK^000000",
		"[Lv 3]: ^777777160% ATK^000000",
		"[Lv 4]: ^777777180% ATK^000000",
		"[Lv 5]: ^777777200% ATK^000000",
		"[Lv 6]: ^777777220% ATK^000000",
		"[Lv 7]: ^777777240% ATK^000000",
		"[Lv 8]: ^777777260% ATK^000000",
		"[Lv 9]: ^777777280% ATK^000000",
		"[Lv 10]: ^777777300% ATK^000000"
	].join("\n");

	SkillDescription[SKID.SM_ENDURE] = [
		"Endure",
		"Max Level: 10",
		"^CC3399Requirement: Provoke 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Enables attacking and movement",
		"while receiving damage, but is automatically",
		"canceled after skill duration elapses or after",
		"caster is hit by 7 attacks. 10 sec cast delay.",
		"Has no effect in War of Emperium.^000000",
		"[Lv 1]: ^77777710 sec, Mdef +1^000000",
		"[Lv 2]: ^77777713 sec, Mdef +2^000000",
		"[Lv 3]: ^77777716 sec, Mdef +3^000000",
		"[Lv 4]: ^77777719 sec, Mdef +4^000000",
		"[Lv 5]: ^77777722 sec, Mdef +5^000000",
		"[Lv 6]: ^77777725 sec, Mdef +6^000000",
		"[Lv 7]: ^77777728 sec, Mdef +7^000000",
		"[Lv 8]: ^77777731 sec, Mdef +8^000000",
		"[Lv 9]: ^77777734 sec, Mdef +9^000000",
		"[Lv 10]: ^77777737 sec, Mdef +10^000000"
	].join("\n");

	SkillDescription[SKID.MG_SRECOVERY] = [
		"Increase SP Recovery",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enhance natural SP Recovery.",
		"Max SP affects how much SP restoration is",
		"increased by this skill. Increases the efficiency",
		"of SP recovering items for 2% per skill level.^000000",
		"[Lv 1]: ^777777+3 SP every 10 seconds,^000000",
		"[Lv 2]: ^777777+6 SP every 10 seconds,^000000",
		"[Lv 3]: ^777777+9 SP every 10 seconds,^000000",
		"[Lv 4]: ^777777+12 SP every 10 seconds,^000000",
		"[Lv 5]: ^777777+15 SP every 10 seconds,^000000",
		"[Lv 6]: ^777777+18 SP every 10 seconds,^000000",
		"[Lv 7]: ^777777+21 SP every 10 seconds,^000000",
		"[Lv 8]: ^777777+24 SP every 10 seconds,^000000",
		"[Lv 9]: ^777777+27 SP every 10 seconds,^000000",
		"[Lv 10]: ^777777+30 SP every 10 seconds,^000000"
	].join("\n");

	SkillDescription[SKID.MG_SIGHT] = [
		"Sight",
		"Max Level: 1",
		"Skill Form: ^339900Supportive^000000",
		"Property: ^FF0000Fire^000000",
		"Description: ^777777Summon a fire ball that will detect",
		"hidden enemies in the caster's vicinity.^000000"
	].join("\n");

	SkillDescription[SKID.MG_NAPALMBEAT] = [
		"Napalm Beat",
		"Max Level: 10",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^bb00bbGhost^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Attack an enemy from a distance",
		"through the use of psychokinetic energy.^000000"
	].join("\n");

	SkillDescription[SKID.MG_SAFETYWALL] = [
		"Safety Wall",
		"Max Level: 10",
		"2^CC3399Requirement: Napalm Beat 7, Soul Strike 5^000000",
		"23^CC3399Requirement: Napalm Beat 7, Soul Strike 5^000000",
		"8^CC3399Requirement: Aspersio 4, Sanctuary 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Create a magic barrier on",
		"a targeted spot that will block short range",
		"melee attacks for the duration of skill.",
		"Each cast requires 1 ^00bb00Blue Gemstone^777777.^000000"
	].join("\n");

	SkillDescription[SKID.MG_SOULSTRIKE] = [
		"Soul Strike",
		"Max Level: 10",
		"^CC3399Requirement: Napalm Beat 4^000000",
		"Skill Form: ^339900Active^000000",
		"Property: ^bb00bbGhost^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Summon holy spirit to inflict",
		"ghost property attacks on a target. This skill",
		"inflicts additional damage against Undead",
		"property monster.^000000"
	].join("\n");

	SkillDescription[SKID.MG_COLDBOLT] = [
		"Cold Bolt",
		"Max Level: 10",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^0000bbWater^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Summon bolts of frigid ice to",
		"strike at an enemy. Barring changes in damage",
		"due to elemental properties, each bolt inflicts",
		"an amount of damage equal to the caster's",
		"MATK.^000000"
	].join("\n");

	SkillDescription[SKID.MG_FROSTDIVER] = [
		"Frost Diver",
		"Max Level: 10",
		"^CC3399Requirement: Cold Bolt 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^0000bbWater^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Inflicts water damage and has",
		"a chance of freezing it's target.^000000"
	].join("\n");

	SkillDescription[SKID.MG_STONECURSE] = [
		"Stone Curse",
		"Max Level: 10",
		"Skill Form: ^777777Curse^000000",
		"Property: ^cc5500Earth^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Curse an enemy by turning it",
		"into stone. Has no effect on Boss and Undead",
		"monsters.",
		"Each cast requires 1 ^00bb00Red Gemstone^777777.^000000"
	].join("\n");

	SkillDescription[SKID.MG_FIREBALL] = [
		"Fire Ball",
		"Max Level: 10",
		"^CC3399Requirement: Fire Bolt 4^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^FF0000Fire^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Summon a fire ball to damage",
		"a target and  all enemies within its area of",
		"effect. Enemies near the target receive 3/4",
		"of damage inflicted on skill's target.",
		"At levels 6 and above, Fire Ball's casting",
		"and delay time is reduced.^000000"
	].join("\n");

	SkillDescription[SKID.MG_FIREWALL] = [
		"Fire Wall",
		"Max Level: 10",
		"^CC3399Requirement: Sight 1, Fire Ball 5^000000",
		"Skill Form: ^339900Active^000000",
		"Property: ^FF0000Fire^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Create a wall of flame that",
		"will deter and cause damage to enemies.^000000"
	].join("\n");

	SkillDescription[SKID.MG_FIREBOLT] = [
		"Fire Bolt",
		"Max Level: 10",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^FF0000Fire^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Summon bolts of pure flame to",
		"strike at an enemy. Barring changes in damage",
		"due to elemental properties, each bolt inflicts",
		"an amount of damage equal to the caster's",
		"MATK.^000000"
	].join("\n");

	SkillDescription[SKID.MG_LIGHTNINGBOLT] = [
		"Lightning Bolt",
		"Max Level: 10",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^4cbb17Wind^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Summon bolts of lightning to",
		"strike at an enemy. Barring changes in damage",
		"due to elemental properties, each bolt inflicts",
		"an amount of damage equal to the caster's",
		"MATK.^000000"
	].join("\n");

	SkillDescription[SKID.MG_THUNDERSTORM] = [
		"Thunder Storm",
		"Max Level: 10",
		"^CC3399Requirement: Lightning Bolt 4^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^4cbb17Wind^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Summon a storm of lightning on a",
		"targeted area to damage enemies within the",
		"Thunder Storm's range.^000000"
	].join("\n");

	SkillDescription[SKID.AL_DP] = [
		"Divine Protection",
		"Max Level: 10",
		"14^CC3399Requirement: Cure 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase Defense against Demon",
		"and Undead monsters based on user's level.^000000",
		"[Lv 1]: ^777777DEF +3^000000",
		"[Lv 2]: ^777777DEF +6^000000",
		"[Lv 3]: ^777777DEF +9^000000",
		"[Lv 4]: ^777777DEF +12^000000",
		"[Lv 5]: ^777777DEF +15^000000",
		"[Lv 6]: ^777777DEF +18^000000",
		"[Lv 7]: ^777777DEF +21^000000",
		"[Lv 8]: ^777777DEF +24^000000",
		"[Lv 9]: ^777777DEF +27^000000",
		"[Lv 10]: ^777777DEF +30^000000"
	].join("\n");

	SkillDescription[SKID.AL_DEMONBANE] = [
		"Demon Bane",
		"Max Level: 10",
		"^CC3399Requirement: Divine Protection 3^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase Attack Strength against",
		"Demon and Undead monsters based on user's",
		"level.^000000",
		"[Lv 1]: ^777777ATK +3^000000",
		"[Lv 2]: ^777777ATK +6^000000",
		"[Lv 3]: ^777777ATK +9^000000",
		"[Lv 4]: ^777777ATK +12^000000",
		"[Lv 5]: ^777777ATK +15^000000",
		"[Lv 6]: ^777777ATK +18^000000",
		"[Lv 7]: ^777777ATK +21^000000",
		"[Lv 8]: ^777777ATK +24^000000",
		"[Lv 9]: ^777777ATK +27^000000",
		"[Lv 10]: ^777777ATK +30^000000"
	].join("\n");

	SkillDescription[SKID.AL_RUWACH] = [
		"Ruwach",
		"Max Level: 1",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Detect hidden enemies, as well as",
		"inflict holy damage once a hidden enemy is",
		"revealed by Ruwach.^000000"
	].join("\n");

	SkillDescription[SKID.AL_PNEUMA] = [
		"Pneuma",
		"Max Level: 1",
		"^CC3399Requirement: Warp Portal 4^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Create a shield that will",
		"temporarily protect a small area from long",
		"range physical attacks for a while.^000000"
	].join("\n");

	SkillDescription[SKID.AL_TELEPORT] = [
		"Teleport",
		"Max Level: 2",
		"^CC3399Requirement: Ruwach 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Teleport to other area.^000000",
		"[Lv 1]: ^777777Teleport to a random spot^000000",
		"[Lv 2]: ^777777Teleport to save point^000000"
	].join("\n");

	SkillDescription[SKID.AL_WARP] = [
		"Warp Portal",
		"Max Level: 4",
		"^CC3399Requirement: Teleport 2^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Create a Warp Portal that will",
		"teleport those who enter it to another area.",
		"Each Warp Portal can teleport up to 8 people.",
		"Each cast requires 1 ^990099Blue Gemstone^777777.^000000",
		"[Lv 1]: ^777777Warp to Save Point, 35sp^000000",
		"[Lv 2]: ^777777Enable 1 Memo point, 32sp^000000",
		"[Lv 3]: ^777777Enable 2 Memo points, 29sp^000000",
		"[Lv 4]: ^777777Enable 3 Memo points, 26sp^000000",
		"^990000[Memo Point]: ^777777Specific map area memorized",
		"as a destination for a Warp Portal.",
		"Type ^000000/memo^777777 in a target area to set location",
		"as a Memo Point.^000000"
	].join("\n");

	SkillDescription[SKID.AL_HEAL] = [
		"Heal",
		"Max Level: 10",
		"14^CC3399Requirement: Faith 10, Demon Bane 5^000000",
		"Skill Form: ^339900Recovery^000000",
		"Target: ^777777Player^000000",
		"Description: ^777777Restore a targeted player's HP.",
		"Caster's base level and INT affect the amount",
		"of HP recovered by Heal.^000000"
	].join("\n");

	SkillDescription[SKID.AL_INCAGI] = [
		"Increase Agility",
		"Max Level: 10",
		"^CC3399Requirement: Heal 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Player^000000",
		"Description: ^777777Increase targeted character's",
		"Movement and Attack Speeds for the duration",
		"of the skill. Drains 15 HP from the caster",
		"after each cast.^000000"
	].join("\n");

	SkillDescription[SKID.AL_DECAGI] = [
		"Decrease Agility",
		"Max Level: 10",
		"^CC3399Requirement: Increase Agility 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Decrease target's Movement",
		"and Attack Speeds for the skill's duration.",
		"The success rate is affected by the caster's",
		"INT and the target's MDEF.^000000"
	].join("\n");

	SkillDescription[SKID.AL_HOLYWATER] = [
		"Aqua Benedicta",
		"Max Level: 1",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Create Holy Water with",
		"1 ^008800Empty Bottle^777777 while standing in water.^000000"
	].join("\n");

	SkillDescription[SKID.AL_CRUCIS] = [
		"Signum Crucis",
		"Max Level: 10",
		"^CC3399Requirement: Demon Bane 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Decrease the Defense of Undead",
		"and Ghost monsters in the caster's screen.",
		"Success rate is determined by caster's and",
		"enemy's level^000000"
	].join("\n");

	SkillDescription[SKID.AL_ANGELUS] = [
		"Angelus",
		"Max Level: 10",
		"^CC3399Requirement: Divine Protection 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Increase the Defense of the entire",
		"party including caster's, for the skill's duration.^000000"
	].join("\n");

	SkillDescription[SKID.AL_BLESSING] = [
		"Blessing",
		"Max Level: 10",
		"^CC3399Requirement: Divine Protection 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Player^000000",
		"Description: ^777777Increases the target's STR, DEX,",
		"and INT. Can also be used to cure a target",
		"from ^702180Curse^777777 and ^702180Stone Curse^777777.^000000"
	].join("\n");

	SkillDescription[SKID.AL_CURE] = [
		"Cure",
		"Max Level: 1",
		"4^CC3399Requirement: Heal 2^000000",
		"14^CC3399Requirement: Faith 5^000000",
		"Skill Form: ^339900Recovery^000000",
		"Target: ^777777Player^000000",
		"Description: ^777777Cancel various abnormal statuses",
		"such as ^702180Mute^777777, ^702180Chaos^777777 or ^702180Blind^777777 from target",
		"characters. Cause ^702180Chaos^777777 status when used",
		"against Undead monsters.^000000"
	].join("\n");

	SkillDescription[SKID.MC_INCCARRY] = [
		"Enlarge Weight Limit",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase maximum weight limit.^000000",
		"[Lv 1]: ^777777Maximum weight +200^000000",
		"[Lv 2]: ^777777Maximum weight +400^000000",
		"[Lv 3]: ^777777Maximum weight +600^000000",
		"[Lv 4]: ^777777Maximum weight +800^000000",
		"[Lv 5]: ^777777Maximum weight +1000^000000",
		"[Lv 6]: ^777777Maximum weight +1200^000000",
		"[Lv 7]: ^777777Maximum weight +1400^000000",
		"[Lv 8]: ^777777Maximum weight +1600^000000",
		"[Lv 9]: ^777777Maximum weight +1800^000000",
		"[Lv 10]: ^777777Maximum weight +2000^000000"
	].join("\n");

	SkillDescription[SKID.MC_DISCOUNT] = [
		"Discount",
		"Max Level: 10",
		"^CC3399Requirement: Enlarge Weight Limit 3^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Decreases the prices of",
		"items sold by NPC shops.^000000 ",
		"[Lv 1]: ^7777777% discount rate^000000",
		"[Lv 2]: ^7777779% discount rate^000000",
		"[Lv 3]: ^77777711% discount rate^000000",
		"[Lv 4]: ^77777713% discount rate^000000",
		"[Lv 5]: ^77777715% discount rate^000000",
		"[Lv 6]: ^77777717% discount rate^000000",
		"[Lv 7]: ^77777719% discount rate^000000",
		"[Lv 8]: ^77777721% discount rate^000000",
		"[Lv 9]: ^77777723% discount rate^000000",
		"[Lv 10]: ^77777724% discount rate^000000"
	].join("\n");

	SkillDescription[SKID.MC_OVERCHARGE] = [
		"Overcharge",
		"Max Level: 10",
		"^CC3399Requirement: Discount 3^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increases amount of zeny",
		"received for items sold to NPC shops.^000000",
		"[Lv 1]: ^7777777% overcharge rate^000000",
		"[Lv 2]: ^7777779% overcharge rate^000000",
		"[Lv 3]: ^77777711% overcharge rate^000000",
		"[Lv 4]: ^77777713% overcharge rate^000000",
		"[Lv 5]: ^77777715% overcharge rate^000000",
		"[Lv 6]: ^77777717% overcharge rate^000000",
		"[Lv 7]: ^77777719% overcharge rate^000000",
		"[Lv 8]: ^77777721% overcharge rate^000000",
		"[Lv 9]: ^77777723% overcharge rate^000000",
		"[Lv 10]: ^77777724% overcharge rate^000000"
	].join("\n");

	SkillDescription[SKID.MC_PUSHCART] = [
		"Pushcart",
		"Max Level: 10",
		"^CC3399Requirement: Enlarge Weight Limit 5^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enables rental and use of Pushcart",
		"which provide additional storage for items,",
		"although items cannot be directly used or",
		"equipped from a Pushcart. Pushcarts can be",
		"rented from Kafra Employees.^000000",
		"Pushcart Shortcut: ^000099(Alt+W)^000000"
	].join("\n");

	SkillDescription[SKID.MC_IDENTIFY] = [
		"Item Appraisal",
		"Max Level: 1",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Identify an unknown item,",
		"making it available for use.^000000"
	].join("\n");

	SkillDescription[SKID.MC_VENDING] = [
		"Vending",
		"Max Level: 10",
		"^CC3399Requirement: Pushcart 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Open a street stall for selling",
		"items to other players. Skill level affects the",
		"number of items that can be vended at a time.^000000"
	].join("\n");

	SkillDescription[SKID.MC_MAMMONITE] = [
		"Mammonite",
		"Max Level: 10",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Uses the power of greed to strike",
		"a single target with a strong blow, dealing",
		"high damage. Consumes some Zeny.^000000",
		"[Lv 1]: ^777777150% ATK, 100 zeny^000000",
		"[Lv 2]: ^777777200% ATK, 200 zeny^000000",
		"[Lv 3]: ^777777250% ATK, 300 zeny^000000",
		"[Lv 4]: ^777777300% ATK, 400 zeny^000000",
		"[Lv 5]: ^777777350% ATK, 500 zeny^000000",
		"[Lv 6]: ^777777400% ATK, 600 zeny^000000",
		"[Lv 7]: ^777777450% ATK, 700 zeny^000000",
		"[Lv 8]: ^777777500% ATK, 800 zeny^000000",
		"[Lv 9]: ^777777550% ATK, 900 zeny^000000",
		"[Lv 10]: ^777777600% ATK, 1,000 zeny^000000"
	].join("\n");

	SkillDescription[SKID.AC_OWL] = [
		"Owl's Eye",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase DEX.^000000",
		"[Lv 1]: ^777777DEX +1^000000",
		"[Lv 2]: ^777777DEX +2^000000",
		"[Lv 3]: ^777777DEX +3^000000",
		"[Lv 4]: ^777777DEX +4^000000",
		"[Lv 5]: ^777777DEX +5^000000",
		"[Lv 6]: ^777777DEX +6^000000",
		"[Lv 7]: ^777777DEX +7^000000",
		"[Lv 8]: ^777777DEX +8^000000",
		"[Lv 9]: ^777777DEX +9^000000",
		"[Lv 10]: ^777777DEX +10^000000"
	].join("\n");

	SkillDescription[SKID.AC_VULTURE] = [
		"Vulture's Eye",
		"Max Level: 10",
		"^CC3399Requirement: Owl's Eye 3^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase attack range and",
		"hit rate with bow class weapons.^000000",
		"[Lv 1]: ^777777Range +1^000000",
		"[Lv 2]: ^777777Range +2^000000",
		"[Lv 3]: ^777777Range +3^000000",
		"[Lv 4]: ^777777Range +4^000000",
		"[Lv 5]: ^777777Range +5^000000",
		"[Lv 6]: ^777777Range +6^000000",
		"[Lv 7]: ^777777Range +7^000000",
		"[Lv 8]: ^777777Range +8^000000",
		"[Lv 9]: ^777777Range +9^000000",
		"[Lv 10]: ^777777Range +10^000000"
	].join("\n");

	SkillDescription[SKID.AC_CONCENTRATION] = [
		"Improve Concentration",
		"Max Level: 10",
		"^CC3399Requirement: Vulture's Eye 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Boosts AGI and DEX temporarily",
		"as well as detect hidden enemies.^000000"
	].join("\n");

	SkillDescription[SKID.AC_DOUBLE] = [
		"Double Strafe",
		"Max Level: 10",
		"^CC3399Requirement: Vulture's Eye 10^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Inflict double damage on a",
		"target by firing two arrows in one attack.^000000"
	].join("\n");

	SkillDescription[SKID.AC_SHOWER] = [
		"Arrow Shower",
		"Max Level: 10",
		"^CC3399Requirement: Double Strafe 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Shoots an arrow that spreads over",
		"the targeted location that damage all enemies",
		"and pushing them 2 cells backwards.^000000"
	].join("\n");

	SkillDescription[SKID.TF_DOUBLE] = [
		"Double Attack",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase the chance of performing",
		"double attacks when using Dagger Class",
		"Weapons. This skill also affects Left-Hand",
		"damage with Katar Class Weapons.^000000"
	].join("\n");

	SkillDescription[SKID.TF_MISS] = [
		"Improve Dodge",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase flee rate.",
		"Flee rate increases upon reaching 2nd Class.^000000"
	].join("\n");

	SkillDescription[SKID.TF_STEAL] = [
		"Steal",
		"Max Level: 10",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Steal item from monster.^000000"
	].join("\n");

	SkillDescription[SKID.TF_HIDING] = [
		"Hiding",
		"Max Level: 10",
		"^CC3399Requirement: Steal 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Hide under the ground to avoid",
		"enemy attack. Detection skills will cancel",
		"hiding status.^000000"
	].join("\n");

	SkillDescription[SKID.TF_POISON] = [
		"Envenom",
		"Max Level: 10",
		"Skill Form: ^FF0000Offensive (^702180Poison^777777)^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Cause ^702180Poison^777777 property damage to",
		"a target which has a chance of inflicting",
		"^702180Poison^777777 status.^000000"
	].join("\n");

	SkillDescription[SKID.TF_DETOXIFY] = [
		"Detoxify",
		"Max Level: 1",
		"^CC3399Requirement: Envenom 3^000000",
		"Skill Form: ^339900Supportive (^702180Poison^777777)^000000",
		"Description: ^777777Remove the ^702180Poison^777777 status",
		"from a targeted character.^000000",
	].join("\n");

	SkillDescription[SKID.ALL_RESURRECTION] = [
		"Resurrection",
		"Max Level: 4",
		"^CC3399Requirement: Increase SP Recovery 4,",
		"Recovery 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Dead Player^000000",
		"Description: ^777777Revive a dead character.",
		"Requires 1 ^00BB00Blue Gemstone^777777 for each cast.^000000",
		"[Lv 1]: ^777777Revive with 10% of Max HP^000000",
		"[Lv 2]: ^777777Revive with 30% of Max HP^000000",
		"[Lv 3]: ^777777Revive with 50% of Max HP^000000",
		"[Lv 4]: ^777777Revive with 80% of Max HP^000000"
	].join("\n");

	SkillDescription[SKID.KN_SPEARMASTERY] = [
		"Spear Mastery",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase damage with Spears.",
		"When riding a pecopeco, add bonus damage",
		"+1 per level.^000000",
		"[Lv 1]: ^777777ATK +4^000000",
		"[Lv 2]: ^777777ATK +8^000000",
		"[Lv 3]: ^777777ATK +12^000000",
		"[Lv 4]: ^777777ATK +16^000000",
		"[Lv 5]: ^777777ATK +20^000000",
		"[Lv 6]: ^777777ATK +24^000000",
		"[Lv 7]: ^777777ATK +28^000000",
		"[Lv 8]: ^777777ATK +32^000000",
		"[Lv 9]: ^777777ATK +36^000000",
		"[Lv 10]: ^777777ATK +40^000000"
	].join("\n");

	SkillDescription[SKID.KN_PIERCE] = [
		"Pierce",
		"Max Level: 10",
		"^CC3399Requirement: Spear Mastery 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000 ",
		"Description: ^777777Attack an enemy using a thrusting",
		"stab with a number of additional hits that will",
		"depend on the monster's size.",
		"Requires ^00BB00Spear^777777 class weapon.^000000",
		"[Small Monsters]: ^7777771 hit^000000",
		"[Medium Monsters]: ^7777772 hits^000000",
		"[Large Monsters]: ^7777773 hits^000000"
	].join("\n");

	SkillDescription[SKID.KN_BRANDISHSPEAR] = [
		"Brandish Spear",
		"Max Level: 10",
		"^CC3399Requirement: Riding 1, Spear Stab 3^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777A powerful lancing strike made",
		"while riding a Peco Peco. can only be",
		"performed while mounted on a Peco Peco.",
		"Requires ^00BB00Spear^777777 class weapon.^000000"
	].join("\n");

	SkillDescription[SKID.KN_SPEARSTAB] = [
		"Spear Stab",
		"Max Level: 10",
		"^CC3399Requirement: Pierce 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000 ",
		"Description: ^777777Attack an enemy with a forceful",
		"spear stab that will knock it back.",
		"Requires ^00bb00Spear^777777 class weapon^000000."
	].join("\n");

	SkillDescription[SKID.KN_SPEARBOOMERANG] = [
		"Spear Boomerang",
		"Max Level: 5",
		"^CC3399Requirement: Pierce 3^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000 ",
		"Description: ^777777Attack an enemy from a distance",
		"by hurling a spear.",
		"Requires ^00bb00Spear^777777 class weapon^000000."
	].join("\n");

	SkillDescription[SKID.KN_TWOHANDQUICKEN] = [
		"Two-Hand Quicken",
		"Max Level: 10",
		"^CC3399Requirement: Two-Handed Sword Mastery 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Temporarily increase attack speed",
		"with two handed sword. If you unequip the",
		"sword, this effect will dissapear.^000000",
		"[Lv 1]: ^77777730 sec duration^000000",
		"[Lv 2]: ^77777760 sec duration^000000",
		"[Lv 3]: ^77777790 sec duration^000000",
		"[Lv 4]: ^777777120 sec duration^000000",
		"[Lv 5]: ^777777150 sec duration^000000",
		"[Lv 6]: ^777777180 sec duration^000000",
		"[Lv 7]: ^777777210 sec duration^000000",
		"[Lv 8]: ^777777240 sec duration^000000",
		"[Lv 9]: ^777777270 sec duration^000000",
		"[Lv 10]: ^777777300 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.KN_AUTOCOUNTER] = [
		"Auto Counter",
		"Max Level: 5",
		"^CC3399Requirement: Two-Handed Sword Mastery 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000 ",
		"Description: ^777777After receiving melee damage from",
		"an enemy, automatically retaliate with a mighty",
		"critical attack.^000000"
	].join("\n");

	SkillDescription[SKID.KN_BOWLINGBASH] = [
		"Bowling Bash",
		"Max Level: 10",
		"^CC3399Requirement: Bash 10, Magnum Break 3,",
		"Two-Handed Sword Mastery 5,",
		"Two-Hand Quicken 10,",
		"Auto Counter 5^000000 ",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000 ",
		"Description: ^777777Strike an enemy with massive",
		"force, causing it to tumble away and damage",
		"other enemies that happen to be in its path.^000000"
	].join("\n");

	SkillDescription[SKID.KN_RIDING] = [
		"Riding",
		"Max Level: 1",
		"^CC3399Requirement: Endure 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enable riding of Peco Peco.^000000"
	].join("\n");

	SkillDescription[SKID.KN_CAVALIERMASTERY] = [
		"Cavalier Mastery",
		"Max Level: 5",
		"^CC3399Requirement: Riding 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase Attack Speed while",
		"mounted on a Peco Peco. Mastering this",
		"skill raises attack speed so that attack",
		"speed reduction while mounted on a Peco",
		"Peco is fully nullified.^000000"
	].join("\n");

	SkillDescription[SKID.PR_MACEMASTERY] = [
		"Mace Mastery",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase damage with Mace.^000000",
		"[Lv 1]: ^777777ATK +3^000000",
		"[Lv 2]: ^777777ATK +6^000000",
		"[Lv 3]: ^777777ATK +9^000000",
		"[Lv 4]: ^777777ATK +12^000000",
		"[Lv 5]: ^777777ATK +15^000000",
		"[Lv 6]: ^777777ATK +18^000000",
		"[Lv 7]: ^777777ATK +21^000000",
		"[Lv 8]: ^777777ATK +24^000000",
		"[Lv 9]: ^777777ATK +27^000000",
		"[Lv 10]: ^777777ATK +30^000000"
	].join("\n");

	SkillDescription[SKID.PR_IMPOSITIO] = [
		"Impositio Manus",
		"Max Level: 5",
		"Skill Form: ^339900Blessing^000000",
		"Target: ^777777Player^000000",
		"Description: ^777777Bless a targeted player by",
		"increasing the weapon damage of that",
		"character for 1 minute.^000000",
		"[Lv 1]: ^777777ATK +5,^000000",
		"[Lv 2]: ^777777ATK +10^000000",
		"[Lv 3]: ^777777ATK +15^000000",
		"[Lv 4]: ^777777ATK +20^000000",
		"[Lv 5]: ^777777ATK +25^000000"
	].join("\n");

	SkillDescription[SKID.PR_SUFFRAGIUM] = [
		"Suffragium",
		"Max Level: 3",
		"^CC3399Requirement: Impositio Manus 2^000000",
		"Skill Form: ^339900Blessing^000000",
		"Target: ^777777Other Player^000000",
		"Description: ^777777This invocation can only be used",
		"on others and will not work on caster.",
		"Reduces cast time of a skill for a single cast.^000000",
		"[Lv 1]: ^77777715% reduction, 30 sec^000000",
		"[Lv 2]: ^77777730% reduction, 20 sec^000000",
		"[Lv 3]: ^77777745% reduction, 10 sec^000000"
	].join("\n");

	SkillDescription[SKID.PR_ASPERSIO] = [
		"Aspersio",
		"Max Level: 5",
		"^CC3399Requirement: Aqua Benedicta 1,",
		"Impositio Manus 3^000000",
		"Skill Form: ^339900Blessing^000000",
		"Target: ^777777Player^000000",
		"Description: ^777777Endow the targeted player's",
		"weapon with the Holy property for the skill's",
		"duration.",
		"Requires 1 ^00BB00Holy Water^777777 for each cast.^000000",
		"[Lv 1]: ^77777760 sec duration^000000",
		"[Lv 2]: ^77777790 sec duration^000000",
		"[Lv 3]: ^777777120 sec duration^000000",
		"[Lv 4]: ^777777150 sec duration^000000",
		"[Lv 5]: ^777777180 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.PR_BENEDICTIO] = [
		"Benedictio Sanctissimi Sacramenti",
		"Max Level: 1",
		"^CC3399Requirement: Aspersio 5, Gloria 3^000000",
		"Skill Form: ^339900Blessing^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777This Benedictio Sanctissimi",
		"Sacramenti blessing endows the armor of all",
		"onscreen party members with the Holy property",
		"This skill requires an Acolyte, Priest or High",
		"Priest to be adjacent to the caster in order to",
		"function. Undead and Demon monsters within",
		"the range of the skill will be damaged by Holy.^000000"
	].join("\n");

	SkillDescription[SKID.PR_SANCTUARY] = [
		"Sanctuary",
		"Max Level: 10",
		"^CC3399Requirement: Heal 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Create a holy area on the ground",
		"that will provide continuous HP restoration",
		"for the skill's duration.",
		"Each cast requires 1 ^00BB00Blue Gemstone^777777.^000000"
	].join("\n");

	SkillDescription[SKID.PR_SLOWPOISON] = [
		"Slow Poison",
		"Max Level: 4",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Player^000000",
		"Description: ^777777Slow the effect of ^702180poison^777777 on a",
		"character that is affected by Poisoned status.^000000"
	].join("\n");

	SkillDescription[SKID.PR_STRECOVERY] = [
		"Status Recovery",
		"Max Level: 1",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Player^000000",
		"Description: ^777777Cancels abnormal status effects",
		"such as ^702180Frozen^777777 or ^702180Stone Curse^777777.",
		"Causes ^702180Blind^777777 effect on the Undead.^000000"
	].join("\n");

	SkillDescription[SKID.PR_KYRIE] = [
		"Kyrie Eleison",
		"Max Level: 10",
		"^CC3399Requirement: Angelus 2^000000",
		"Skill Form: ^339900Eulogy^000000",
		"Description: ^777777Create a perfect barrier around",
		"a character that will be able to withstand",
		"a certain number of attacks, before barrier",
		"is broken. Otherwise, it lasts for 2 minutes.",
		"Holy Light skill immediately cancels this skill.^000000",
		"[Lv 1]: ^77777712% Max HP, block 5 hits^000000",
		"[Lv 2]: ^77777714% Max HP, block 6 hits^000000",
		"[Lv 3]: ^77777716% Max HP, block 6 hits^000000",
		"[Lv 4]: ^77777718% Max HP, block 7 hits^000000",
		"[Lv 5]: ^77777720% Max HP, block 7 hits^000000",
		"[Lv 6]: ^77777722% Max HP, block 8 hits^000000",
		"[Lv 7]: ^77777724% Max HP, block 8 hits^000000",
		"[Lv 8]: ^77777726% Max HP, block 9 hits^000000",
		"[Lv 9]: ^77777728% Max HP, block 9 hits^000000",
		"[Lv 10]: ^77777730% Max HP, block 10 hits^000000"
	].join("\n");

	SkillDescription[SKID.PR_MAGNIFICAT] = [
		"Magnificat",
		"Max Level: 5",
		"Skill Form: ^339900Eulogy^000000",
		"Description: ^777777Double the caster and party's",
		"SP Recovery Rate for the duration of the skill.^000000"
	].join("\n");

	SkillDescription[SKID.PR_GLORIA] = [
		"Gloria",
		"Max Level: 5",
		"^CC3399Requirement: Kyrie Eleison 4, Magnificat 3^000000",
		"Skill Form: ^339900Eulogy^000000",
		"Description: ^777777Add +30 LUK to the caster and",
		"party members for the duration of the skill.^000000"
	].join("\n");

	SkillDescription[SKID.PR_LEXDIVINA] = [
		"Lex Divina",
		"Max Level: 10",
		"^CC3399Requirement: Ruwach 1^000000",
		"Skill Form: ^FF0000Exorcism^000000",
		"Target: ^777777Enemy^000000 ",
		"Description: ^702180Silence^777777 an enemy, temporarily",
		"disabling its use of skills, for a set duration."
	].join("\n");

	SkillDescription[SKID.PR_TURNUNDEAD] = [
		"Turn Undead",
		"Max Level: 10",
		"^CC3399Requirement: Resurrection 1, Lex Divina 3^000000",
		"Skill Form: ^FF0000Exorcism^000000",
		"Target: ^777777Enemy^000000 ",
		"Description: ^777777Attack Undead monsters with an",
		"exorcist skill that will cause a good deal of",
		"damage and has the chance of instantly killing",
		"the targeted Undead monster.^000000"
	].join("\n");

	SkillDescription[SKID.PR_LEXAETERNA] = [
		"Lex Aeterna",
		"Max Level: 1",
		"^CC3399Requirement: Lex Divina 5^000000",
		"Skill Form: ^FF0000Exorcism^000000",
		"Target: ^777777Enemy^000000 ",
		"Description: ^777777Weaken an enemy so that it will",
		"receive twice as much damage from the next",
		"attack that hits it. Ineffective against",
		"enemies afflicted by the ^702180Frozen^777777 or ^702180Stone",
		"Cursed^777777 status.^000000"
	].join("\n");

	SkillDescription[SKID.PR_MAGNUS] = [
		"Magnus Exorcismus",
		"MX Lv : 10",
		"^CC3399Requirement: Turn Undead 3,",
		"Lex Aeterna 1, Safety Wall 1^000000",
		"Skill Form: ^FF0000Exorcism^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Summon a purifying cross on the",
		"ground to exterminate Demon and Undead",
		"monsters.",
		"Each cast requires 1 ^00BB00Blue Gemstone^777777.^000000"
	].join("\n");

	SkillDescription[SKID.WZ_FIREPILLAR] = [
		"Fire Pillar",
		"Max Level: 10",
		"^CC3399Requirement: Fire Wall 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^bb0000Fire^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Summon a pillar of flame on a",
		"targeted spot that will damage enemies that",
		"come into contact with it.^000000"
	].join("\n");

	SkillDescription[SKID.WZ_SIGHTRASHER] = [
		"Sightrasher",
		"Max Level: 10",
		"^CC3399Requirement: Sight 1, Lightning Bolt 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^bb0000Fire^000000",
		"Description: ^777777Attack enemies by shooting",
		"fireballs, which are first summoned by the",
		"^00BB00Sight ^777777skill, in directions that radiate",
		"away from the caster.^000000"
	].join("\n");

	SkillDescription[SKID.WZ_FIREIVY] = [
		"Fire Ivy",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^bb0000Fire^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Damage enemies by summoning",
		"ivy vines of flame from the ground.^000000"
	].join("\n");

	SkillDescription[SKID.WZ_METEOR] = [
		"Meteor Storm",
		"Max Level: 10",
		"^CC3399Requirement: Thunder Storm 1, Sightrasher 2^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^bb0000Fire^000000",
		"Target: ^777777Ground^000000 ",
		"Description: ^777777Summon meteors towards a targeted",
		"area to inflict area effect damage upon enemies^000000"
	].join("\n");

	SkillDescription[SKID.WZ_JUPITEL] = [
		"Jupitel Thunder",
		"Max Level: 10",
		"^CC3399Requirement: Napalm Beat 1,",
		"Lightning Bolt 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^BBBB00Wind^000000",
		"Target: ^777777Enemy^000000 ",
		"Description: ^777777Fire a ball of crackling",
		"lightning that will damage and push back the",
		"targeted enemy.^000000"
	].join("\n");

	SkillDescription[SKID.WZ_VERMILION] = [
		"Lord of Vermilion",
		"Max Level: 10",
		"^CC3399Requirement: Thunder Storm 1,",
		"Jupitel Thunder 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^bbbb00Wind^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Summon explosive lightning to",
		"strike a targeted area. Increasing skill level",
		"will increase damage and skill cast time.^000000"
	].join("\n");

	SkillDescription[SKID.WZ_WATERBALL] = [
		"Waterball",
		"Max Level: 5",
		"^CC3399Requirement: Cold Bolt 1, Lightning Bolt 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^0000BBWater^000000",
		"Target: ^777777Enemy^000000 ",
		"Description: ^777777Hurl spheres of water at high",
		"velocity at a targeted enemy. Caster must be",
		"standing in ^00BB00water^777777 in order to cast Water Ball",
		"and cannot be used in an underwater map.^000000"
	].join("\n");

	SkillDescription[SKID.WZ_ICEWALL] = [
		"Icewall",
		"Max Level: 10",
		"^CC3399Requirement: Stone Curse 1, Frost Diver 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Property: ^0000BBWater^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Create a frozen wall",
		"of ice that will block enemies.^000000"
	].join("\n");

	SkillDescription[SKID.WZ_FROSTNOVA] = [
		"Frost Nova",
		"Max Level: 10",
		"^CC3399Requirement: Frost Diver 1, Icewall 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Property: ^0000BBWater^000000",
		"Target: ^777777Player^000000",
		"Description: ^777777Create an aura of icy cold that will",
		"simultaneously freeze enemies around the",
		"caster.^000000"
	].join("\n");

	SkillDescription[SKID.WZ_STORMGUST] = [
		"Storm Gust",
		"Max Level: 10",
		"^CC3399Requirement: Frost Diver 1, Jupitel 3^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^0000BBWater^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Summon a blizzard on a targeted",
		"spot to damage enemies within Storm Gust's range."
	].join("\n");

	SkillDescription[SKID.WZ_EARTHSPIKE] = [
		"Earth Spike",
		"Max Level: 5",
		"9^CC3399Requirement: Stone Curse 1^000000",
		"4190^CC3399Requirement: Stone Curse 1^000000",
		"16^CC3399Requirement: Seismic Weapon 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^cc5500Earth^000000",
		"Target: ^777777Enemy^000000 ",
		"Description: ^777777Command the ground beneath",
		"a targeted enemy to rise into spikes.^000000"
	].join("\n");

	SkillDescription[SKID.WZ_HEAVENDRIVE] = [
		"Heaven's Drive",
		"Max Level: 5",
		"9^CC3399Requirement: Earth Spike 3^000000",
		"4190^CC3399Requirement: Earth Spike 3^000000",
		"16^CC3399Requirement: Earth Spike 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^cc5500Earth^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Command the ground in a",
		"targeted area to rise into spikes in order to",
		"damage enemies within its range.^000000"
	].join("\n");

	SkillDescription[SKID.WZ_QUAGMIRE] = [
		"Quagmire",
		"Max Level: 5",
		"^CC3399Requirement: Heaven's Drive 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Property: ^cc5500Earth^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Temporarily convert targeted area",
		"into marshland that will reduce the Movement",
		"Speed, AGI and DEX of all targets by half.",
		"AGI and DEX has maximum of 50 can be",
		"reduced. Players will only receive half",
		"of the effect.^000000"
	].join("\n");

	SkillDescription[SKID.WZ_ESTIMATION] = [
		"Sense",
		"Max Level: 1",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Monster^000000",
		"Description: ^777777Reveal detailed information",
		"about a targeted monster to the caster and",
		"members in caster's party.^000000"
	].join("\n");

	SkillDescription[SKID.BS_IRON] = [
		"Iron Tempering",
		"Max Level: 5",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enables the tempering of",
		"1 Iron with 1 Iron Ore and 1 Mini Furnace.^000000"
	].join("\n");

	SkillDescription[SKID.BS_STEEL] = [
		"Steel Tempering",
		"Max Level: 5",
		"^CC3399Requirement: Iron Tempering 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enables the tempering of",
		"1 Steel with 5 Iron, 1 Coal and 1 Mini Furnace.^000000"
	].join("\n");

	SkillDescription[SKID.BS_ENCHANTEDSTONE] = [
		"Enchanted Stone Craft",
		"Max Level: 5",
		"^CC3399Requirement: Iron Tempering 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enables the refining of enchanted",
		"ores with 10 Green Live, 10 Wind of Verdures,",
		"10 Red Blood, 10 Crystal Blue, or 10 Star Dust",
		"with a Mini Furnace.^000000"
	].join("\n");

	SkillDescription[SKID.BS_ORIDEOCON] = [
		"Research Oridecon",
		"Max Level: 5",
		"^CC3399Requirement: Enchanted Stone Craft 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase the success rate",
		"of forging items with ^00BB00Oridecon^777777.^000000"
	].join("\n");

	SkillDescription[SKID.BS_DAGGER] = [
		"Smith Dagger",
		"Max Level: 3",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enables forging of",
		"Dagger Class weapons.^000000"
	].join("\n");

	SkillDescription[SKID.BS_SWORD] = [
		"Smith Sword",
		"Max Level: 3",
		"^CC3399Requirement: Smith Dagger 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enables forging of",
		"Sword Class weapons.^000000"
	].join("\n");

	SkillDescription[SKID.BS_TWOHANDSWORD] = [
		"Smith Two-handed Sword",
		"Max Level: 3",
		"^CC3399Requirement: Smith Sword 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enables forging of",
		"Two Handed Sword Class Weapons.^000000"
	].join("\n");

	SkillDescription[SKID.BS_AXE] = [
		"Smith Axe",
		"Max Level: 3",
		"^CC3399Requirement: Smith Sword 2^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enables forging of",
		"Axe Class Weapons.^000000"
	].join("\n");

	SkillDescription[SKID.BS_MACE] = [
		"Smith Mace",
		"Max Level: 3",
		"^CC3399Requirement: Smith Brass Knuckle 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enables forging of",
		"Mace Class weapons.^000000"
	].join("\n");

	SkillDescription[SKID.BS_KNUCKLE] = [
		"Smith Brass Knuckle",
		"Max Level: 3",
		"^CC3399Requirement: Smith Dagger 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enables forging of",
		"Knuckle Class weapons.^000000"
	].join("\n");

	SkillDescription[SKID.BS_SPEAR] = [
		"Smith Spear",
		"Max Level: 3",
		"^CC3399Requirement: Smith Dagger 2^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enables forging of",
		"Spear Class weapons.^000000"
	].join("\n");

	SkillDescription[SKID.BS_HILTBINDING] = [
		"Hilt Binding",
		"Max Level: 1",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase the duration of the",
		"Adrenaline Rush, Power Thrust and",
		"Weapon Perfection skills by 10%.",
		"This skill also adds +1 STR and +4 ATK.^000000"
	].join("\n");

	SkillDescription[SKID.BS_FINDINGORE] = [
		"Ore Discovery",
		"Max Level: 1",
		"^CC3399Requirement: Hilt Binding 1,",
		"Steel Tempering 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase the success rate of",
		"finding ores dropped from monsters.^000000"
	].join("\n");

	SkillDescription[SKID.BS_WEAPONRESEARCH] = [
		"Weaponry Research",
		"Max Level: 10",
		"^CC3399Requirement: Hilt Binding 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Improves weapon knowledge",
		"in order to create arms of higher quality.^000000"
	].join("\n");

	SkillDescription[SKID.BS_REPAIRWEAPON] = [
		"Repair Weapon",
		"Max Level: 1",
		"^CC3399Requirement: Weaponry Research^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Weaponry^000000",
		"Description: ^777777Repair damaged Weapons.",
		"Names of weapons that have been damaged",
		"are displayed in red color.^000000",
		"Armors: ^777777Steel^000000",
		"Level 1 Weapon: ^00BB00Iron Ore^000000",
		"Level 2 Weapon: ^00BB00Iron^000000",
		"Level 3 Weapon: ^00BB00Steel^000000",
		"Level 4 Weapon: ^00BB00Rough Oridecon^000000"
	].join("\n");

	SkillDescription[SKID.BS_SKINTEMPER] = [
		"Skin Tempering",
		"Max Level: 5",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase resistance to",
		"Fire and Neutral property attacks.^000000",
		"[Lv 1]: ^777777Fire +5%, Neutral +1%^000000",
		"[Lv 2]: ^777777Fire +10%, Neutral +2%^000000",
		"[Lv 3]: ^777777Fire +15%, Neutral +3%^000000",
		"[Lv 4]: ^777777Fire +20%, Neutral +4%^000000",
		"[Lv 5]: ^777777Fire +25%, Neutral +5%^000000"
	].join("\n");

	SkillDescription[SKID.BS_HAMMERFALL] = [
		"Hammerfall",
		"Max Level: 5",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Pound a targeted cell to",
		"stun enemies in the impacts vicinity.",
		"This can only be used when an Axe or Mace",
		"class weapon is equipped.^000000"
	].join("\n");

	SkillDescription[SKID.BS_ADRENALINE] = [
		"Adrenaline Rush",
		"Max Level: 5",
		"^CC3399Requirement: Hammerfall 2^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Double the Attack Speed of Axe",
		"and Mace weapon for the duration of skill.^000000"
	].join("\n");

	SkillDescription[SKID.BS_WEAPONPERFECT] = [
		"Weapon Perfection",
		"Max Level: 5",
		"^CC3399Requirement: Adrenaline Rush 2,",
		"Weaponry Research 2^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Nullify any reduction in",
		"damage resulting from monster size.^000000"
	].join("\n");

	SkillDescription[SKID.BS_OVERTHRUST] = [
		"Power Thrust",
		"Max Level: 5",
		"^CC3399Requirement: Adrenaline Rush 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Enhance the Attack Power of",
		"a weapon with a 0.1% chance of damaging that",
		"weapon.^000000",
		"[Lv 1]: ^777777ATK +5%^000000",
		"[Lv 2]: ^777777ATK +10%^000000",
		"[Lv 3]: ^777777ATK +15%^000000",
		"[Lv 4]: ^777777ATK +20%^000000",
		"[Lv 5]: ^777777ATK +25%^000000"
	].join("\n");

	SkillDescription[SKID.BS_MAXIMIZE] = [
		"Maximize Power",
		"Max Level: 5",
		"^CC3399Requirement: Weapon Perfection 3,",
		"Power Thrust 2^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Amplify Weapon Attack Power",
		"by continuously draining a specific amount",
		"of SP while skill is active. This skill can",
		"be canceled by casting it once again.^000000"
	].join("\n");

	SkillDescription[SKID.HT_SKIDTRAP] = [
		"Skid Trap",
		"Max Level: 5",
		"Skill Form: ^000099Trap (Hidden)^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Set a trap which will make",
		"an enemy slide in the direction that the caster",
		"was facing at the moment the trap was set.",
		"Each cast requires 1 ^00BB00Trap^777777.^000000",
		"[Lv 1]: ^7777776 cell sliding range, 300 sec^000000",
		"[Lv 2]: ^7777777 cell sliding range, 240 sec^000000",
		"[Lv 3]: ^7777778 cell sliding range, 180 sec^000000",
		"[Lv 4]: ^7777779 cell sliding range, 120 sec^000000",
		"[Lv 5]: ^77777710 cell sliding range, 60 sec^000000"
	].join("\n");

	SkillDescription[SKID.HT_LANDMINE] = [
		"Land Mine",
		"Max Level: 5",
		"Skill Form: ^000099Trap (Hidden)^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Set a trap which will",
		"explode once an enemy steps on it.",
		"Each cast requires 1 ^00BB00Trap^777777.^000000",
		"[Lv 1]: ^777777ATK 50%, 200 sec duration^000000",
		"[Lv 2]: ^777777ATK 75%, 160 sec duration^000000",
		"[Lv 3]: ^777777ATK 100%, 120 sec duration^000000",
		"[Lv 4]: ^777777ATK 125%, 80 sec duration^000000",
		"[Lv 5]: ^777777ATK 150%, 40 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.HT_ANKLESNARE] = [
		"Anklesnare",
		"Max Level: 5",
		"^CC3399Requirement: Skid Trap 1^000000",
		"Skill Form: ^000099Trap (Hidden)^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Set a trap that will bind an",
		"enemy to the ground for the skill's duration,",
		"which is affected by the AGI of the target.",
		"Each cast requires 1 ^00BB00Trap^777777.^000000"
	].join("\n");

	SkillDescription[SKID.HT_SHOCKWAVE] = [
		"Shockwave Trap",
		"Max Level: 5",
		"^CC3399Requirement: Anklesnare 1^000000",
		"Skill Form: ^000099Trap (Hidden)^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Set a trap which will",
		"drain SP away from enemies.",
		"Each cast requires 2 ^00BB00Traps^777777.^000000",
		"[Lv 1]: ^77777720% Max SP Drain, 200 sec duration^000000",
		"[Lv 2]: ^77777735% Max SP Drain, 160 sec duration^000000",
		"[Lv 3]: ^77777750% Max SP Drain, 120 sec duration^000000",
		"[Lv 4]: ^77777765% Max SP Drain, 80 sec duration^000000",
		"[Lv 5]: ^77777780% Max SP Drain, 40 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.HT_SANDMAN] = [
		"Sandman",
		"Max Level: 5",
		"^CC3399Requirement: Flasher 1^000000",
		"Skill Form: ^000099Trap (Hidden)^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Set a trap that will cause the",
		"enemy that steps on it, as well as enemies",
		"within the trap's range, to fall asleep.",
		"Each cast requires 1 ^00BB00Trap^777777.^000000",
		"[Lv 1]: ^777777150 sec duration^000000",
		"[Lv 2]: ^777777120 sec duration^000000",
		"[Lv 3]: ^77777790 sec duration^000000",
		"[Lv 4]: ^77777760 sec duration^000000",
		"[Lv 5]: ^77777730 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.HT_FLASHER] = [
		"Flasher",
		"Max Level: 5",
		"^CC3399Requirement: Skid Trap 1^000000",
		"Skill Form: ^000099Trap (Hidden)^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Set a trap which will emit",
		"intense light, which may inflict the target",
		"with the Blind status.",
		"Each cast requires 2 ^00BB00Traps^777777.^000000",
		"[Lv 1]: ^777777150 sec duration^000000",
		"[Lv 2]: ^777777120 sec duration^000000",
		"[Lv 3]: ^77777790 sec duration^000000",
		"[Lv 4]: ^77777760 sec duration^000000",
		"[Lv 5]: ^77777730 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.HT_FREEZINGTRAP] = [
		"Freezing Trap",
		"Max Level: 5",
		"^CC3399Requirement: Flasher 1^000000",
		"Skill Form: ^000099Trap (Hidden)^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Set a trap which will freeze",
		"an enemy once it has been triggered.",
		"Each cast requires 2 ^00BB00Traps^777777.^000000",
		"[Lv 1]: ^777777150 sec duration^000000",
		"[Lv 2]: ^777777120 sec duration^000000",
		"[Lv 3]: ^77777790 sec duration^000000",
		"[Lv 4]: ^77777760 sec duration^000000",
		"[Lv 5]: ^77777730 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.HT_BLASTMINE] = [
		"Blast Mine",
		"Max Level: 5",
		"^CC3399Requirement: Sandman 1,",
		"Land Mine 1, Freezing Trap 1^000000",
		"Skill Form: ^000099Trap (Visible)^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Set a trap that will automatically",
		"explode after a specific time period",
		"determined by the level of the skill.",
		"Each cast requires 1 ^00BB00Trap^777777.^000000",
		"[Lv 1]: ^77777725 sec duration^000000",
		"[Lv 2]: ^77777720 sec duration^000000",
		"[Lv 3]: ^77777715 sec duration^000000",
		"[Lv 4]: ^77777710 sec duration^000000",
		"[Lv 5]: ^7777775 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.HT_CLAYMORETRAP] = [
		"Claymore Trap",
		"Max Level: 5",
		"^CC3399Requirement: Blast Mine 1,",
		"Shockwave Trap 1^000000",
		"Skill Form: ^000099Trap (Visible)^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Set a trap which will inflict",
		"splashed damage.",
		"Each cast requires 2 ^00BB00Traps^777777.^000000",
		"[Lv 1]: ^77777720 sec duration^000000",
		"[Lv 2]: ^77777740 sec duration^000000",
		"[Lv 3]: ^77777760 sec duration^000000",
		"[Lv 4]: ^77777780 sec duration^000000",
		"[Lv 5]: ^777777100 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.HT_REMOVETRAP] = [
		"Remove Trap",
		"Max Level: 1",
		"11^CC3399Requirement: Land Mine 1^000000",
		"17^CC3399Requirement: Double Strafe 10^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Trap^000000",
		"Description: ^777777Remove a trap that has been set",
		"on the ground, as well as regain that Trap.^000000",
	].join("\n");

	SkillDescription[SKID.HT_TALKIEBOX] = [
		"Talkie Box",
		"Max Level: 1",
		"^CC3399Requirement: Remove Trap 1,",
		"Shockwave Trap 1^000000",
		"Skill Form: ^000099Trap (Hidden)^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Set a trap which will last for 600",
		"seconds and will display a prepared message",
		"for the person who triggers it.",
		"Each cast requires 1 ^00BB00Trap^777777.^000000"
	].join("\n");

	SkillDescription[SKID.HT_BEASTBANE] = [
		"Beastbane",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase Attack Power against",
		"Brute and Insect monsters.^000000",
		"[Lv 1]: ^777777ATK +4^000000",
		"[Lv 2]: ^777777ATK +8^000000",
		"[Lv 3]: ^777777ATK +12^000000",
		"[Lv 4]: ^777777ATK +16^000000",
		"[Lv 5]: ^777777ATK +20^000000",
		"[Lv 6]: ^777777ATK +24^000000",
		"[Lv 7]: ^777777ATK +28^000000",
		"[Lv 8]: ^777777ATK +32^000000",
		"[Lv 9]: ^777777ATK +36^000000",
		"[Lv 10]: ^777777ATK +40^000000"
	].join("\n");

	SkillDescription[SKID.HT_FALCON] = [
		"Falconry Mastery",
		"Max Level: 1",
		"^CC3399Requirement: Beastbane 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enable renting of a Falcon",
		"from the Hunter Guild.^000000"
	].join("\n");

	SkillDescription[SKID.HT_STEELCROW] = [
		"Steel Crow",
		"Max Level: 10",
		"^CC3399Requirement: Blitz Beat 5^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase the damage",
		"inflicted by Falcon.^000000",
		"[Lv 1]: ^777777ATK +6^000000",
		"[Lv 2]: ^777777ATK +12^000000",
		"[Lv 3]: ^777777ATK +18^000000",
		"[Lv 4]: ^777777ATK +24^000000",
		"[Lv 5]: ^777777ATK +30^000000",
		"[Lv 6]: ^777777ATK +36^000000",
		"[Lv 7]: ^777777ATK +42^000000",
		"[Lv 8]: ^777777ATK +48^000000",
		"[Lv 9]: ^777777ATK +54^000000",
		"[Lv 10]: ^777777ATK +60^000000"
	].join("\n");

	SkillDescription[SKID.HT_BLITZBEAT] = [
		"Blitz Beat",
		"Max Level: 5",
		"^CC3399Requirement: Falconry Mastery 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Command Falcon to attack",
		"a targeted enemy. Leveling this skill also",
		"increases the chance of automatic attacks",
		"from the Falcon when attacking an enemy",
		"with a Bow Class Weapon. The Falcon's",
		"Attack Range is equal to the level of",
		"the Vulture's Eye skill +3.^000000"
	].join("\n");

	SkillDescription[SKID.HT_DETECTING] = [
		"Detect",
		"Max Level: 4",
		"^CC3399Requirement: Improve Concentration 1,",
		"Falconry Mastery 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Command a Falcon to detect",
		"hidden enemies from a distance.^000000"
	].join("\n");

	SkillDescription[SKID.HT_SPRINGTRAP] = [
		"Spring Trap",
		"Max Level: 5",
		"^CC3399Requirement: Remove Trap 1,",
		"Falconry Mastery^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Trap^000000",
		"Description: ^777777Command Falcon to remove",
		"a set trap from a distance.^000000"
	].join("\n");

	SkillDescription[SKID.AS_RIGHT] = [
		"Righthand Mastery",
		"Max Level: 5",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increases the damage of the",
		"weapon in the right hand when equipped with",
		"dual weapons. Equipping two weapons at once",
		"reduces the Attack Power of the weapon in",
		"the right hand to only 50%.^000000",
		"[Lv 1]: ^777777ATK 60%^000000",
		"[Lv 2]: ^777777ATK 70%^000000",
		"[Lv 3]: ^777777ATK 80%^000000",
		"[Lv 4]: ^777777ATK 90%^000000",
		"[Lv 5]: ^777777ATK 100%^000000"
	].join("\n");

	SkillDescription[SKID.AS_LEFT] = [
		"Lefthand Mastery",
		"Max Level: 5",
		"^CC3399Requirement: Righthand Mastery 2^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increases the damage of the",
		"weapon in the left hand when equipped with",
		"dual weapons. Equipping two weapons at once",
		"reduces the Attack Power of the weapon in",
		"the left hand to only 30%.^000000",
		"[Lv 1]: ^777777ATK 40%^000000",
		"[Lv 2]: ^777777ATK 50%^000000",
		"[Lv 3]: ^777777ATK 60%^000000",
		"[Lv 4]: ^777777ATK 70%^000000",
		"[Lv 5]: ^777777ATK 80%^000000"
	].join("\n");

	SkillDescription[SKID.AS_KATAR] = [
		"Katar Mastery",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase damaged inflicted",
		"with Katar Class Weapons.^000000",
		"[Lv 1]: ^777777ATK +3^000000",
		"[Lv 2]: ^777777ATK +6^000000",
		"[Lv 3]: ^777777ATK +9^000000",
		"[Lv 4]: ^777777ATK +12^000000",
		"[Lv 5]: ^777777ATK +15^000000",
		"[Lv 6]: ^777777ATK +18^000000",
		"[Lv 7]: ^777777ATK +21^000000",
		"[Lv 8]: ^777777ATK +24^000000",
		"[Lv 9]: ^777777ATK +27^000000",
		"[Lv 10]: ^777777ATK +30^000000"
	].join("\n");

	SkillDescription[SKID.AS_CLOAKING] = [
		"Cloaking",
		"Max Level: 10",
		"^CC3399Requirement: Hiding 2^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Initiate Cloaking status, which",
		"hide the caster from enemies without disabling",
		"movement. At Levels 1 to 2, Cloaking will only",
		"work when caster is adjacent to a wall.",
		"At higher levels, caster can move freely in",
		"Cloaking status, but will move more slowly",
		"when away from walls.^000000"
	].join("\n");

	SkillDescription[SKID.AS_SONICBLOW] = [
		"Sonic Blow",
		"Max Level: 10",
		"^CC3399Requirement: Katar Mastery 4^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Direct a flurry of rapid Katar",
		"strikes that will have a chance of inflicting",
		"the ^702180Stun^777777 status on the target.",
		"Requires ^00BB00Katar^777777 class weapon.^000000"
	].join("\n");

	SkillDescription[SKID.AS_GRIMTOOTH] = [
		"Grimtooth",
		"Max Level: 5",
		"^CC3399Requirement: Cloaking 2, Sonic Blow 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Strike an enemy with Katar",
		"while in ^00BB00Hiding^777777 status.",
		"Requires ^00BB00Katar^777777 class weapon.^000000"
	].join("\n");

	SkillDescription[SKID.AS_ENCHANTPOISON] = [
		"Enchant Poison",
		"Max Level: 10",
		"^CC3399Requirement: Envenom 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Property: ^702180Poison^000000",
		"Target: ^777777Player^000000",
		"Description: ^777777Temporarily enchant equipped",
		"weapon with the ^702180Poison^777777 property. Poison",
		"enchanted weapons have a chance of inflicting",
		"targets with the ^702180Poison^777777 status."
	].join("\n");

	SkillDescription[SKID.AS_POISONREACT] = [
		"Poison React",
		"Max Level: 10",
		"^CC3399Requirement: Enchant Poison 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Property: ^702180Poison^000000",
		"Target: ^777777Player^000000",
		"Description: ^777777Once this skill activated, the",
		"caster will automatically cast ^008800Envenom^777777 after",
		"receiving damage from normal enemy attacks.",
		"If the enemy uses ^702180Poison^777777 property attacks,",
		"the caster will reflect the damage instead.^000000"
	].join("\n");

	SkillDescription[SKID.AS_VENOMDUST] = [
		"Venom Dust",
		"Max Level: 10",
		"^CC3399Requirement: Enchant Poison 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Property: ^702180Poison^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Contaminate a targeted area with",
		"toxin that will inflict the ^702180Poison^777777 status on",
		"enemies that come into contact with it."
	].join("\n");

	SkillDescription[SKID.AS_SPLASHER] = [
		"Venom Splasher",
		"Max Level: 10",
		"^CC3399Requirement: Poison React 5, Venom Dust 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^702180Poison^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777When struck by this skill,",
		"the target will then explode after a few",
		"seconds, dealing splash damage around it",
		"and poisoning enemies by chance.",
		"Each cast requires 1 ^00BB00Red Gemstone^777777.^000000"
	].join("\n");

	SkillDescription[SKID.NV_FIRSTAID] = [
		"First Aid",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Self^000000",
		"Description: ^777777Use 3 SP to restore 5 HP.^000000"
	].join("\n");

	SkillDescription[SKID.NV_TRICKDEAD] = [
		"Play Dead",
		"^CC3399Requirement: Finish Quest, Novice Only^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Feign death to avoid the menace",
		"of nearby enemies. The Play Dead status is",
		"cancelled by casting this skill again.^000000"
	].join("\n");

	SkillDescription[SKID.SM_MOVINGRECOVERY] = [
		"Moving HP Recovery",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enable natural recovery of HP",
		"while moving. Only 25% of the HP that is",
		"naturally recovered while standing is restored",
		"during movement. The Increase Recovery skill",
		"does not affect HP Recovery While Moving.^000000"
	].join("\n");

	SkillDescription[SKID.SM_FATALBLOW] = [
		"Fatal Blow",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Cause the Stun effect on targeted",
		"enemy when using Level 6 Bash or higher.",
		"The chance of inflicting Stun increases with",
		"Bash skill level and Base Level of the",
		"caster.^000000"
	].join("\n");

	SkillDescription[SKID.SM_AUTOBERSERK] = [
		"Auto Berserk",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Target: ^777777Self^000000",
		"Description: ^777777Empowered by rage, character",
		"enters condition that is equivalent to Level 10",
		"Provoke status when HP is reduced to less",
		"than 25% of Max HP. Provoked status lasts",
		"until character HP is restored to more",
		"than 25% of Max HP or if Provoke effect",
		"is nullified.^000000"
	].join("\n");

	SkillDescription[SKID.AC_MAKINGARROW] = [
		"Arrow Crafting",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Item^000000",
		"Description: ^777777Create arrows from specific items.",
		"The kind of arrow produced, as well as the",
		"amount, is determined by the items used.^000000"
	].join("\n");

	SkillDescription[SKID.AC_CHARGEARROW] = [
		"Charge Arrow",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Draw the bowstring to its",
		"limit to fire a volley of arrows with enough",
		"force to push the target 4 cells back.^000000"
	].join("\n");

	SkillDescription[SKID.TF_SPRINKLESAND] = [
		"Sprinkle Sand",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^cc5500Earth^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Kick sand into enemy face",
		"which will inflict 130% damage and also",
		"chance to cause ^702180Blind^777777 or ^702180Stun^777777 on the target.^000000"
	].join("\n");

	SkillDescription[SKID.TF_BACKSLIDING] = [
		"Back Slide",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Quickly move backwards to",
		"position yourself safely away from threats.^000000"
	].join("\n");

	SkillDescription[SKID.TF_PICKSTONE] = [
		"Pick Stone",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Pick up a ^008800Stone^777777 from the ground.^000000"
	].join("\n");

	SkillDescription[SKID.TF_THROWSTONE] = [
		"Throw Stone",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Attack an enemy with a Stone",
		"which inflicts 50 damage that will pierce enemy",
		"defense and has a low chance of causing the",
		"^702180Stun^777777 or ^702180Blind^777777 status.",
		"Each cast requires 1 ^00BB00Stone^777777.^000000"
	].join("\n");

	SkillDescription[SKID.MC_CARTREVOLUTION] = [
		"Cart Revolution",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777A splashed damage attack in",
		"which a Pushcart is smashed into a target.",
		"Inflicts 150% of the damage of a normal attack",
		"in addition to extra damage from the weight of",
		"items in Pushcart.^000000"
	].join("\n");

	SkillDescription[SKID.MC_CHANGECART] = [
		"Change Cart",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Change Pushcart appearance.",
		"There are five different Pushcart styles that",
		"are chosen according to the character's",
		"Base Level.^000000"
	].join("\n");

	SkillDescription[SKID.MC_LOUD] = [
		"Crazy Uproar",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Caster^000000",
		"Description: ^777777Scream with battle vigor to add",
		"+4 STR for 5 minutes.^000000"
	].join("\n");

	SkillDescription[SKID.AL_HOLYLIGHT] = [
		"Holy Light",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^777777Holy^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Summon holy light to counter evil.^000000"
	].join("\n");

	SkillDescription[SKID.MG_ENERGYCOAT] = [
		"Energy Coat",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Create a barrier of spiritual",
		"energy that will buffer attacks at the caster.",
		"The caster's remaining SP affects the amount",
		"of damage reduced by the barrier.",
		"More SP is drained as attacks buffered",
		"by the barrier accumulate.^000000"
	].join("\n");

	SkillDescription[SKID.RG_SNATCHER] = [
		"Snatcher",
		"Max Level: 10",
		"^CC3399Requirement: Steal 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Target: ^777777Caster^000000",
		"Description: ^777777Automatically steal items from",
		"monsters while attacking them. The success",
		"rate of stealing items is affected by the skill",
		"level of the Thief skill, ^00BB00Steal^777777.^000000"
	].join("\n");

	SkillDescription[SKID.RG_STEALCOIN] = [
		"Steal Coin",
		"Max Level: 10",
		"^CC3399Requirement: Snatcher 4^000000",
		"Skill Form: ^339900Active^000000",
		"Target: ^777777Monster^000000",
		"Description: ^777777Using this skill has the",
		"chance of stealing zeny from monsters.",
		"Its success rate rises as the skill level is",
		"increased. Zeny can only be stolen once from",
		"each monster, and using this skill will draw",
		"the target monster's aggression.^000000"
	].join("\n");

	SkillDescription[SKID.RG_BACKSTAP] = [
		"Back Stab",
		"Max Level: 10",
		"^CC3399Requirement: Steal Coin 4^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Back Stab is only usable when the",
		"caster is facing the enemy's rear. This skill",
		"never misses its target, but the target will",
		"face the user after it is hit. When used with",
		"a Bow, this skill's damage is reduced by half.",
		"Back Stab can be used when in Hiding status,",
		"but it will cancel Hiding.^000000"
	].join("\n");

	SkillDescription[SKID.RG_TUNNELDRIVE] = [
		"Tunnel Drive",
		"Max Level: 5",
		"^CC3399Requirement: Hiding 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Target: ^777777Caster^000000",
		"Description: ^777777Enables movement while in",
		"^00BB00Hiding^777777 status.",
		"Movement speed is slower than normal walk.^000000",
	].join("\n");

	SkillDescription[SKID.RG_RAID] = [
		"Raid",
		"Max Level: 5",
		"^CC3399Requirement: Tunnel Drive 2, Back Stab 2^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Range: ^7777779 cells around the caster^000000",
		"Description: ^777777Only usable while in ^00BB00Hiding^777777",
		"status and will cancel Hiding once used.",
		"This attack has a chance of causing Stun",
		"and Blind effects on targets within the",
		"skill's range. A sucessful hit will cause",
		"the enemy to receive 20% more damage for",
		"a certain number of hits. However, boss only",
		"get 10% more damage.^000000"
	].join("\n");

	SkillDescription[SKID.RG_STRIPWEAPON] = [
		"Strip Weapon",
		"Max Level: 5",
		"^CC3399Requirement: Strip Armor 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Forcibly strip the Weapon off a",
		"target. In PVP, targeted character temporarily",
		"cannot re-equip Weapon.",
		"On monsters, this skill will temporarily",
		"reduce Attack Power by 25%.",
		"Skill level and caster's DEX affect chance of",
		"success.^000000"
	].join("\n");

	SkillDescription[SKID.RG_STRIPSHIELD] = [
		"Strip Shield",
		"Max Level: 5",
		"^CC3399Requirement: Strip Helm 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Forcibly strip the Shield off a",
		"target. In PVP, targeted character temporarily",
		"cannot re-equip Shield. On monsters, this skill",
		"will temporarily reduce their Defense by 15%.",
		"Skill level and caster's DEX affect chance of",
		"success.^000000"
	].join("\n");

	SkillDescription[SKID.RG_STRIPARMOR] = [
		"Strip Armor",
		"Max Level: 5",
		"^CC3399Requirement: Strip Shield 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Forcibly strip the Armor off a",
		"target. In PVP, targeted character temporarily",
		"cannot re-equip Armor. On monsters, this skill",
		"will temporarily reduce their VIT by 40%.",
		"Skill level and caster's DEX affect chance of",
		"success.^000000"
	].join("\n");

	SkillDescription[SKID.RG_STRIPHELM] = [
		"Strip Helm",
		"Max Level: 5",
		"^CC3399Requirement: Steal Coin 2^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Forcibly strip the Helmet off a",
		"target. In PVP, targeted character temporarily",
		"cannot re-equip Helmet. On monsters, this skill",
		"will temporarily reduce their INT by 40%.",
		"Skill level and caster's DEX affect chance of",
		"success.^000000"
	].join("\n");

	SkillDescription[SKID.RG_INTIMIDATE] = [
		"Intimidate",
		"Max Level: 5",
		"^CC3399Requirement: Back Stab 4, Raid 5^000000",
		"Skill Form: ^339900Active^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Strike a target and forcibly",
		"teleport it with the caster to a random location",
		"on the same map. This skill's success rate is",
		"affected by the level difference between caster",
		"and target.",
		"Boss monsters are unaffected by Intimidate.^000000"
	].join("\n");

	SkillDescription[SKID.RG_GRAFFITI] = [
		"Graffiti",
		"Max Level: 1",
		"^CC3399Requirement: Flag Graffiti 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Scribble graffiti around a targeted",
		"cell with a message of up to 20 characters.",
		"Graffiti cannot be overlapped or painted over",
		"before it disappears.",
		"Requires 1 ^00BB00Red Gemstone^777777.^000000"
	].join("\n");

	SkillDescription[SKID.RG_FLAGGRAFFITI] = [
		"Flag Graffiti",
		"Max Level: 5",
		"^CC3399Requirement: Cleaner 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Guild Flag^000000",
		"Description: ^777777Paint graffiti over a guild's",
		"flag which will be shown instead of the",
		"guild's emblem. This skill's level affects",
		"the amount of graffiti that can be painted.",
		"Requires 1 ^00BB00Giant Paint Brush^777777.^000000"
	].join("\n");

	SkillDescription[SKID.RG_CLEANER] = [
		"Cleaner",
		"Max Level: 1",
		"^CC3399Requirement: Gangster Paradise 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Guild Flag^000000",
		"Description: ^777777Remove graffiti from a guild flag",
		"Requires 1 ^00BB00Wet Duster^777777.^000000"
	].join("\n");

	SkillDescription[SKID.RG_GANGSTER] = [
		"Gangster Paradise",
		"Max Level: 1",
		"^CC3399Requirement: Strip Shield 3^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777When more than 2 Rogues sit",
		"beside each other, they will not be attacked",
		"by monsters with the exception of Bosses.^000000"
	].join("\n");

	SkillDescription[SKID.RG_COMPULSION] = [
		"Compulsion Discount",
		"Max Level: 5",
		"^CC3399Requirement: Gangster Paradise 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Purchase items from NPC shops",
		"at lower prices.^000000",
		"[Lv 1]: ^7777779% Discount^000000",
		"[Lv 2]: ^77777713% Discount^000000",
		"[Lv 3]: ^77777717% Discount^000000",
		"[Lv 4]: ^77777721% Discount^000000",
		"[Lv 5]: ^77777725% Discount^000000"
	].join("\n");

	SkillDescription[SKID.RG_PLAGIARISM] = [
		"Plagiarism",
		"Max Level: 10",
		"^CC3399Requirement: Intimidate 5^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enable the use of the last skill",
		"that was inflicted by an enemy. This can only",
		"be used to remember character skills, and",
		"cannot enable the use of skills exclusive to",
		"monsters. Raising skill level will affect the",
		"level of skill that remembered.^000000"
	].join("\n");

	SkillDescription[SKID.AM_AXEMASTERY] = [
		"Axe Mastery",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase damage inflicted",
		"with Axe Class Weapons.^000000",
		"[Lv 1]: ^777777ATK +3^000000",
		"[Lv 2]: ^777777ATK +6^000000",
		"[Lv 3]: ^777777ATK +9^000000",
		"[Lv 4]: ^777777ATK +12^000000",
		"[Lv 5]: ^777777ATK +15^000000",
		"[Lv 6]: ^777777ATK +18^000000",
		"[Lv 7]: ^777777ATK +21^000000",
		"[Lv 8]: ^777777ATK +24^000000",
		"[Lv 9]: ^777777ATK +27^000000",
		"[Lv 10]: ^777777ATK +30^000000"
	].join("\n");

	SkillDescription[SKID.AM_LEARNINGPOTION] = [
		"Learning Potion",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase effectiveness of",
		"created potions, as well as increase",
		"potion creation success rate.^000000"
	].join("\n");

	SkillDescription[SKID.AM_PHARMACY] = [
		"Pharmacy",
		"Max Level: 10",
		"^CC3399Requirement: Learning Potion 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Enables manufacturing of potion",
		"and chemical. The correct ^000099Potion Creation",
		"Guide^777777 is needed for the manufacture",
		"of specific potions.",
		"Each cast requires 1 ^00BB00Medicine Bowl^777777.^000000"
	].join("\n");

	SkillDescription[SKID.AM_DEMONSTRATION] = [
		"Demonstration",
		"Max Level: 5",
		"^CC3399Requirement: Pharmacy 4^000000",
		"Skill Form: ^339900Active^000000",
		"Property: ^bb0000Fire^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Target an area and set it on fire",
		"by throwing a Bottle Grenade. The flames will",
		"not push back enemies within their range, but",
		"they do have a chance of damaging the",
		"weapons of enemies.",
		"Each cast require 1 ^00BB00Bottle Grenade^777777.^000000"
	].join("\n");

	SkillDescription[SKID.AM_ACIDTERROR] = [
		"Acid Terror",
		"Max Level: 5",
		"^CC3399Requirement: Pharmacy 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Fling a bottle of corrosive acid",
		"at an enemy that has the chance of damaging",
		"the target's armor or causing the Bleeding",
		"effect.",
		"Each cast requires 1 ^00BB00Acid Bottle^777777.^000000"
	].join("\n");

	SkillDescription[SKID.AM_POTIONPITCHER] = [
		"Potion Pitcher",
		"Max Level: 5",
		"^CC3399Requirement: Pharmacy 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Single Ally^000000",
		"Description: ^777777Throw a potion to an ally that will",
		"immediately take effect. Skill level determines",
		"the type of potion thrown, so increasing this",
		"skill's level makes more kinds of potions",
		"usable with this skill.^000000",
		"[Lv 1]: ^777777Red Potion^000000",
		"[Lv 2]: ^777777Orange Potion^000000",
		"[Lv 3]: ^777777Yellow Potion^000000",
		"[Lv 4]: ^777777White Potion^000000",
		"[Lv 5]: ^777777Blue Potion^000000"
	].join("\n");

	SkillDescription[SKID.AM_CANNIBALIZE] = [
		"Bio Cannibalize",
		"Max Level: 5",
		"^CC3399Requirement: Pharmacy 6^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Summon a ^000099Plant monster^777777 to a",
		"targeted cell. Monster will disappear after the",
		"skill's duration. Skill level affects the type",
		"of Plant monster that is summoned, as well as",
		"the monster's Max HP. Caster can only",
		"summon monsters of the same type at once.",
		"Each cast requires 1 ^00BB00Plant Bottle^777777.^000000",
		"[Lv 1]: ^777777Summon up to 5 Mandragora^000000",
		"[Lv 2]: ^777777Summon up to 4 Hydra^000000",
		"[Lv 3]: ^777777Summon up to 3 Flora^000000",
		"[Lv 4]: ^777777Summon up to 2 Parasite^000000",
		"[Lv 5]: ^777777Summon up to 1 Geographer^000000"
	].join("\n");

	SkillDescription[SKID.AM_SPHEREMINE] = [
		"Summon Marine Sphere",
		"Max Level: 5",
		"^CC3399Requirement: Pharmacy 2^000000",
		"Skill Form: ^777777Support^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Summon a ^000099Marine Sphere^777777 to a",
		"targeted cell. Marine Spheres will cast",
		"^000099Self-Destruct^777777 upon receiving damage.",
		"Each cast requires 1 ^00BB00Marine Sphere Bottle^777777.^000000"
	].join("\n");

	SkillDescription[SKID.AM_CP_WEAPON] = [
		"Chemical Protection Weapon",
		"Max Level: 5",
		"^CC3399Requirement: Chemical Protection Armor 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Ally^000000",
		"Description: ^777777Protect a targeted ally's Weapon",
		"from damage in battle for a set duration.",
		"Each cast requires 1 ^00BB00Glistening Coat^777777.^000000"
	].join("\n");

	SkillDescription[SKID.AM_CP_SHIELD] = [
		"Chemical Protection Shield",
		"Max Level: 5",
		"^CC3399Requirement: Chemical Protection Helm 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Ally^000000",
		"Description: ^777777Protect a targeted ally's Shield",
		"from damage in battle for a set duration.",
		"Each cast requires 1 ^00BB00Glistening Coat^777777.^000000"
	].join("\n");

	SkillDescription[SKID.AM_CP_ARMOR] = [
		"Chemical Protection Armor",
		"Max Level: 5",
		"^CC3399Requirement: Chemical Protection Shield 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Ally^000000",
		"Description: ^777777Protect a targeted ally's Armor",
		"from damage in battle for a set duration.",
		"Each cast requires 1 ^00BB00Glistening Coat^777777.^000000"
	].join("\n");

	SkillDescription[SKID.AM_CP_HELM] = [
		"Chemical Protection Helm",
		"Max Level: 5",
		"^CC3399Requirement: Pharmacy 2^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Ally^000000",
		"Description: ^777777Protect a targeted ally's Headgear",
		"from damage in battle for a set duration.",
		"Each cast requires 1 ^00BB00Glistening Coat^777777.^000000"
	].join("\n");

	SkillDescription[SKID.AM_BIOETHICS] = [
		"Bioethics",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777A skill that is fundamental",
		"in enabling the creation of Homunculus.^000000"
	].join("\n");

	SkillDescription[SKID.AM_BIOTECHNOLOGY] = [
		"Biotechnology",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Research biotechnology in order",
		"to increase Homunculus creation success rate and",
		"Homunculus Max HP.^000000"
	].join("\n");

	SkillDescription[SKID.AM_CREATECREATURE] = [
		"Creature Creation",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Create",
		"^000991 Embryo^777777. Skill level affects the chance",
		"of success.^000000"
	].join("\n");

	SkillDescription[SKID.AM_CULTIVATION] = [
		"Cultivation",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Develop an Embryo so that it grows",
		"into a Homunculus. Skill level affects the chance",
		"of success. Cultivation cannot be used when the",
		"caster already has a Homunculus present.^000000"
	].join("\n");

	SkillDescription[SKID.AM_FLAMECONTROL] = [
		"Flame Control",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase the chance of success when",
		"using the Cultivation skill, as well as",
		"resistance to the Fire property.^000000"
	].join("\n");

	SkillDescription[SKID.AM_CALLHOMUN] = [
		"Call Homunculus",
		"Max Level: 1",
		"^CC3399Requirement: Rest 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon an existing Homunculus",
		"that was stored by using the Vaporize skill.",
		"Each cast requires 1 ^00BB00Embryo^777777.^000000"
	].join("\n");

	SkillDescription[SKID.AM_REST] = [
		"Rest",
		"Max Level: 1",
		"^CC3399Requirement: Bioethics 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Vaporize Homunculus into a form",
		"that is much easier to carry around. This skill",
		"is only usable if Homunculus has at least 80%",
		"of its Max HP. Vaporized Homunculus can be",
		"restored with the ^00BB00Call Homunculus^000000 skill.^000000"
	].join("\n");

	SkillDescription[SKID.AM_DRILLMASTER] = [
		"Drillmaster",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase the",
		"Attack Power of Homunculi.^000000",
		"[Lv 1]: ^777777ATK +3^000000",
		"[Lv 2]: ^777777ATK +6^000000",
		"[Lv 3]: ^777777ATK +9^000000",
		"[Lv 4]: ^777777ATK +12^000000",
		"[Lv 5]: ^777777ATK +15^000000",
		"[Lv 6]: ^777777ATK +18^000000",
		"[Lv 7]: ^777777ATK +21^000000",
		"[Lv 8]: ^777777ATK +24^000000",
		"[Lv 9]: ^777777ATK +27^000000",
		"[Lv 10]: ^777777ATK +30^000000"
	].join("\n");

	SkillDescription[SKID.AM_HEALHOMUN] = [
		"Heal Homunculus",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Homunculus^000000",
		"Description: ^777777Heal a Homunculus with an amount",
		"of HP equivalent to that of the ^000099Heal^777777skill.^000000"
	].join("\n");

	SkillDescription[SKID.AM_RESURRECTHOMUN] = [
		"Ressurect Homunculus",
		"Max Level: 5",
		"^CC3399Requirement: Call Homunculus 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Homunculus^000000",
		"Description: ^777777Revive a Homunculus",
		"that has been defeated in battle.^000000"
	].join("\n");

	SkillDescription[SKID.CR_TRUST] = [
		"Faith",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase Max HP and resistance",
		"against the Holy property.^000000"
	].join("\n");

	SkillDescription[SKID.CR_AUTOGUARD] = [
		"Auto Guard",
		"Max Level: 5",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Self^000000",
		"Description: ^777777Activate Guard status which has a",
		"chance of blocking long and short range",
		"physical attacks for skill duration.",
		"When this skill blocks an attack,",
		"caster is immobilized for 0.3 seconds",
		"but this time can be reduced by",
		"increasing the skill's level. Casting",
		"this skill again cancels Guard status.",
		"Requires ^00BB00Shield^777777.^000000"
	].join("\n");

	SkillDescription[SKID.CR_SHIELDCHARGE] = [
		"Shield Charge",
		"Max Level: 5",
		"^CC3399Requirement: Auto Guard 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Smash a Shield into an enemy,",
		"pushing it a few cells backward with a chance",
		"of causing the Stun status.",
		"Requires ^00BB00Shield^777777.^000000"
	].join("\n");

	SkillDescription[SKID.CR_SHIELDBOOMERANG] = [
		"Shield Boomerang",
		"Max Level: 5",
		"^CC3399Requirement: Shield Charge 3^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Attack an enemy from a distance",
		"by throwing a Shield. The Shield's weight and",
		"upgrade status affect the amount of damage",
		"that is inflicted.",
		"Requires ^00BB00Shield^777777.^000000"
	].join("\n");

	SkillDescription[SKID.CR_REFLECTSHIELD] = [
		"Reflect Shield",
		"Max Level: 10",
		"^CC3399Requirement: Shield Boomerang 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Reflect a certain amount of",
		"damage back to the enemy after they",
		"inflict damage with melee physical attack.",
		"Requires ^00BB00Shield^777777.^000000"
	].join("\n");

	SkillDescription[SKID.CR_HOLYCROSS] = [
		"Holy Cross",
		"Max Level: 10",
		"^CC3399Requirement: Faith 7^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Attack an enemy with a double hit",
		"Holy attack that has the chance of causing the",
		"Blind status.^000000"
	].join("\n");

	SkillDescription[SKID.CR_GRANDCROSS] = [
		"Grand Cross",
		"Max Level: 10",
		"^CC3399Requirement: Faith 10, Holy Cross 6^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Summon a cross of holy light on",
		"the ground around the caster that will damage",
		"enemies that come into contact with it. Grand",
		"Cross will cause the Blind effect on Undead",
		"and Demon monster aside from Boss monster.",
		"When cast, Grand Cross will drain 20% of",
		"caster's remaining HP and inflict additional",
		"damage after Grand Cross is summoned.^000000"
	].join("\n");

	SkillDescription[SKID.CR_DEVOTION] = [
		"Devotion",
		"Max Level: 5",
		"^CC3399Requirement: Grand Cross 4, Reflect Shield 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^7777771 Party Member^000000",
		"Description: ^777777Protect a party member by",
		"receiving all damage intended for targeted",
		"ally. Devotion only works when level",
		"difference between caster and party member",
		"is less than 10. The skill's effect is",
		"canceled when the party member moves out",
		"of the skill's range or dies.",
		"Cannot be used for other Crusader class.^000000"
	].join("\n");

	SkillDescription[SKID.CR_PROVIDENCE] = [
		"Providence",
		"Max Level: 5",
		"^CC3399Requirement: Divine Protection 5, Heal 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Party^000000",
		"Description: ^777777Temporarily increase party",
		"member's resistance to Demon and Holy",
		"property monsters.^000000"
	].join("\n");

	SkillDescription[SKID.CR_DEFENDER] = [
		"Defender",
		"Max Level: 5",
		"^CC3399Requirement: Shield Boomerang 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Reduce damage inflicted from long",
		"ranged physical attacks at the cost of",
		"decreasing ASPD and movement speeds for",
		"the skill's duration. Casting this skill",
		"again cancels the Defender status.",
		"Requires ^00BB00Shield^777777.^000000"
	].join("\n");

	SkillDescription[SKID.CR_SPEARQUICKEN] = [
		"Spear Quicken",
		"Max Level: 10",
		"^CC3399Requirement: Spear Mastery 10^000000",
		"Skill Form: ^339900Active^000000",
		"Description: ^777777Increase attack speed when using",
		"spear weapon.^000000"
	].join("\n");

	SkillDescription[SKID.MO_IRONHAND] = [
		"Iron Hand",
		"Max Level: 10",
		"^CC3399Requirement: Demon Bane 10,",
		"Divine Protection 10^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase damage with bare hands",
		"and Knuckle Class Weapons.^000000",
		"[Lv 1]: ^777777ATK +3^000000",
		"[Lv 2]: ^777777ATK +6^000000",
		"[Lv 3]: ^777777ATK +9^000000",
		"[Lv 4]: ^777777ATK +12^000000",
		"[Lv 5]: ^777777ATK +15^000000",
		"[Lv 6]: ^777777ATK +18^000000",
		"[Lv 7]: ^777777ATK +21^000000",
		"[Lv 8]: ^777777ATK +24^000000",
		"[Lv 9]: ^777777ATK +27^000000",
		"[Lv 10]: ^777777ATK +30^000000"
	].join("\n");

	SkillDescription[SKID.MO_SPIRITSRECOVERY] = [
		"Spirit Recovery",
		"Max Level: 5",
		"^CC3399Requirement: Blade Stop 2^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Restore additional HP and SP",
		"every 10 sec while sitting. If user's",
		"carried weight is over 50% of the maximum",
		"capacity, this extra HP and SP is recovered",
		"every 20 sec.^000000"
	].join("\n");

	SkillDescription[SKID.MO_CALLSPIRITS] = [
		"Call Spirits",
		"Max Level: 5",
		"^CC3399Requirement: Iron Hand 2^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon a Spirit Sphere, which",
		"can be used to amplify different skill",
		"abilities. Each spirit sphere adds 3 ATK"
	].join("\n");

	SkillDescription[SKID.MO_ABSORBSPIRITS] = [
		"Absorp Sprits",
		"Max Level: 1",
		"^CC3399Requirement: Call Spirits 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Absorb certain amount of SP from",
		"a Spirit Sphere, which can be stolen from other",
		"Monks or Champions during PvP and WoE.",
		"When used on monsters, this skill has a 20%",
		"chance to give the caster an amount of SP that",
		"is determined by the level of the targeted",
		"monster. Ineffective against Boss monsters and",
		"WoE guardians.^000000"
	].join("\n");

	SkillDescription[SKID.MO_TRIPLEATTACK] = [
		"Triple Attack",
		"Max Level: 10",
		"^CC3399Requirement: Dodge 5^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enable the chance of automatically",
		"delivering a triple attack in battle. This skill",
		"can be followed up with ^00BB00Chain Combo^777777.^000000"
	].join("\n");

	SkillDescription[SKID.MO_BODYRELOCATION] = [
		"Body Relocation",
		"Max Level: 1",
		"^CC3399Requirement: Spirit Recovery 2,",
		"Asura Strike 3, Steel Body 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Instantly teleport to a targeted",
		"spot if there are no obstacles between the",
		"caster and destination.",
		"Each cast requires 1 ^00BB00Spirit Sphere^777777",
		"when not in Explosion Spirits status."
	].join("\n");

	SkillDescription[SKID.MO_DODGE] = [
		"Dodge",
		"Max Level: 10",
		"^CC3399Requirement: Iron Hand 5,",
		"Call Spirits 5^000000 ",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase flee rate.^000000"
	].join("\n");

	SkillDescription[SKID.MO_INVESTIGATE] = [
		"Investigate",
		"Max Level: 5",
		"^CC3399Requirement: Summmon Spirit Sphere 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Attack an enemy with a massive",
		"psychic impact that will inflict more damage",
		"when the enemy has high Defense.",
		"Each cast requires 1 ^00BB00Spirit Sphere.^000000"
	].join("\n");

	SkillDescription[SKID.MO_FINGEROFFENSIVE] = [
		"Finger Offensive",
		"Max Level: 5",
		"^CC3399Requirement: Investigate 3^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Attack a distant enemy by firing",
		"Spirit Sphere(s).",
		"Each cast requires at least 1 ^00BB00Spirit Sphere^777777.^000000"
	].join("\n");

	SkillDescription[SKID.MO_STEELBODY] = [
		"Steel Body",
		"Max Level: 5",
		"^CC3399Requirement: Combo Finish 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Temporarily enhance caster's",
		"Defense and Magic Defense while decreasing",
		"Movement and Attack Speed. While this skill",
		"is active, other skills cannot be used.",
		"Each cast requires 5 ^00BB00Spirit Spheres^777777.^000000"
	].join("\n");

	SkillDescription[SKID.MO_BLADESTOP] = [
		"Blade Stop",
		"Max Level: 5",
		"^CC3399Requirement: Dodge 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Immobilize both the caster and an",
		"enemy until either one of them dies.",
		"Leveling this skill allows the use of other",
		"skills during the Blade Stop status.",
		"Ineffective against Boss monsters.",
		"Each cast requires 1 ^00BB00Spirit Sphere^777777.^000000",
		"Duration and Skills Enabled in Blade Stop",
		"Status according to skill level:",
		"[Lv 1]: ^77777720 sec^000000",
		"[Lv 2]: ^77777730 sec, Finger Offensive enabled^000000",
		"[Lv 3]: ^77777740 sec, Investigate enabled^000000",
		"[Lv 4]: ^77777750 sec, Chain Combo enabled^000000",
		"[Lv 5]: ^77777760 sec, Asura Strike enabled;",
		"Caster must be in Explosion Spirits state",
		"and have at least 4 Spirit Spheres to use",
		"Asura Strike.^000000"
	].join("\n");

	SkillDescription[SKID.MO_EXPLOSIONSPIRITS] = [
		"Explosion Spirits",
		"Max Level: 5",
		"^CC3399Requirement: Absorp Sprits 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Temporarily increase caster's",
		"Critical Attack rate for period of time.",
		"During the Explosion Spirits status,",
		"natural recovery of SP is reduced by 50%.",
		"Each cast requires 5 ^00BB00Spirit Spheres^777777.^000000"
	].join("\n");

	SkillDescription[SKID.MO_EXTREMITYFIST] = [
		"Asura Strike",
		"Max Level: 5",
		"^CC3399Requirement: Explosion Spirits 3,",
		"Finger Offensive 3^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Only usable during Critical",
		"Explosion status. Inflict devastating damage",
		"by consuming the caster's remaining SP. After",
		"using Asura Strike, the Explosion Spirits",
		"status is automatically canceled and will not",
		"able to restore SP for 10 seconds.",
		"Each cast requires 5 ^00BB00Spirit Spheres.^000000"
	].join("\n");

	SkillDescription[SKID.MO_CHAINCOMBO] = [
		"Chain Combo",
		"Max Level: 5",
		"^CC3399Requirement: Triple Attack 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Only usable during Triple",
		"Attack delay. Spin a target while attacking",
		"the enemy with a combo hit. This skill",
		"can be followed up with Combo Finish.^000000"
	].join("\n");

	SkillDescription[SKID.MO_COMBOFINISH] = [
		"Combo Finish",
		"Max Level: 5",
		"^CC3399Requirement: Chain Combo 3^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Only usable during Chain",
		"Combo delay. This skill can be followed",
		"up with the Asura Strike skill if the user",
		"is in Explosion Spirits state and has",
		"summoned at least 4 Spirit Spheres.",
		"Each cast requires 1 ^00BB00Spirit Sphere^777777.^000000"
	].join("\n");

	SkillDescription[SKID.SA_ADVANCEDBOOK] = [
		"Advanced Book",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase Attack Speed",
		"and damage with Book Class Weapons.^000000",
		"[Lv 1]: ^777777ATK +3, Aspd +0.5%^000000",
		"[Lv 2]: ^777777ATK +6, Aspd +1%^000000",
		"[Lv 3]: ^777777ATK +9, Aspd +1.5%^000000",
		"[Lv 4]: ^777777ATK +12, Aspd +2%^000000",
		"[Lv 5]: ^777777ATK +15, Aspd +2.5%^000000",
		"[Lv 6]: ^777777ATK +18, Aspd +3%^000000",
		"[Lv 7]: ^777777ATK +21, Aspd +3.5%^000000",
		"[Lv 8]: ^777777ATK +24, Aspd +4%^000000",
		"[Lv 9]: ^777777ATK +27, Aspd +4.5%^000000",
		"[Lv 10]: ^777777ATK +30, Aspd +5%^000000"
	].join("\n");

	SkillDescription[SKID.SA_CASTCANCEL] = [
		"Cast Cancel",
		"Max Level: 5",
		"^CC3399Requirement: Advanced Book 2^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Only usable while casting a magic",
		"spell. Immediately cancel a spell, allowing",
		"the caster to take another action without any",
		"delay.^000000"
	].join("\n");

	SkillDescription[SKID.SA_MAGICROD] = [
		"Magic Rod",
		"Max Level: 5",
		"^CC3399Requirement: Advanced Book 4^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Upon being attacked with a skill,",
		"using Magic Rod has a chance of giving the SP",
		"that the enemy has used for the skill to the",
		"caster instead of damage. Countering Spell",
		"Breaker with Magic Rod will reduce the target's",
		"SP by 20% when it is successful.^000000"
	].join("\n");

	SkillDescription[SKID.SA_SPELLBREAKER] = [
		"Spell Breaker",
		"Max Level: 5",
		"^CC3399Requirement: Magic Rod 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Interrupt a magic spell cast by an",
		"enemy and receive the SP the enemy used to",
		"cast that spell, as well as reduce 2% of the",
		"enemy's HP. At skill 5 and above, half of this",
		"HP damage is absorbed by the caster. HP",
		"cannot be drained from Boss monsters and",
		"WoE Guardians, but this skill does have 10%",
		"chance of interrupting Boss monster spells.^000000"
	].join("\n");

	SkillDescription[SKID.SA_FREECAST] = [
		"Free Cast",
		"Max Level: 10",
		"^CC3399Requirement: Cast Cancel 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enable movement and attacking",
		"during the casting of magic spells.^000000"
	].join("\n");

	SkillDescription[SKID.SA_AUTOSPELL] = [
		"Auto Spell",
		"Max Level: 10",
		"^CC3399Requirement: Free Cast 4^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Auto Cast certain magic spells by",
		"a certain chance while battling enemies with",
		"physical attacks. Spells that are auto cast",
		"through Auto Spell only consume 2/3 of the",
		"required SP. Spells that are not learned by",
		"the caster can't be cast.^000000",
		"[Lv 2]: ^777777Level 1^000099 Cold, Fire or Lightning Bolt^000000",
		"[Lv 3]: ^777777Level 2^000099 Cold, Fire or Lightning Bolt^000000",
		"[Lv 4]: ^777777Level 3^000099 Cold, Fire or Lightning Bolt^000000",
		"[Lv 5]: ^777777Level 1^000099 Soul Strike^000000",
		"[Lv 6]: ^777777Level 2^000099 Soul Strike^000000",
		"[Lv 7]: ^777777Level 3^000099 Soul Strike^000000",
		"[Lv 8]: ^777777Level 1^000099 Fire Ball^000000",
		"[Lv 9]: ^777777Level 2^000099 Fire Ball^000000",
		"[Lv 10]: ^777777Level 1^000099 Frost Diver^000000",
		"^777777The level of the skill cast by Auto Spell",
		"is randomly determined and limited to the",
		"highest level learned by the caster.^000000"
	].join("\n");

	SkillDescription[SKID.SA_FLAMELAUNCHER] = [
		"Flame Launcher",
		"Max Level: 5",
		"^CC3399Requirement: Fire Bolt 1, Advanced Book 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Property: ^bb0000Fire^000000",
		"Target: ^777777Party Member^000000",
		"Description: ^777777Endow a party member's weapon",
		"with Fire property for the skill's duration.",
		"If the skill fails, the weapon being endowed",
		"will be destroyed.",
		"Each cast requires 1 ^00BB00Red Blood^777777.^000000"
	].join("\n");

	SkillDescription[SKID.SA_FROSTWEAPON] = [
		"Frost Weapon",
		"Max Level: 5",
		"^CC3399Requirement: Cold Bolt 1, Advanced Book 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Property: ^0000BBWater^000000",
		"Target: ^777777Party Member^000000",
		"Description: ^777777Endow a party member's weapon",
		"with Water property for the skill's duration.",
		"If the skill fails, the weapon being endowed",
		"will be destroyed.",
		"Each cast requires 1 ^00BB00Crystal Blue^777777.^000000"
	].join("\n");

	SkillDescription[SKID.SA_LIGHTNINGLOADER] = [
		"Lightning Loader",
		"Max Level: 5",
		"^CC3399Requirement: Lightning Bolt 1,",
		"Advanced Book 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Property: ^4cbb17Wind^000000",
		"Target: ^777777Party Member^000000",
		"Description: ^777777Endow a party member's weapon",
		"with Wind property for the skill's duration.",
		"If the skill fails, the weapon being endowed",
		"will be destroyed.",
		"Each cast requires 1 ^00BB00Wind of Verdure^777777.^000000"
	].join("\n");

	SkillDescription[SKID.SA_SEISMICWEAPON] = [
		"Seismic Weapon",
		"Max Level: 5",
		"^CC3399Requirement: Stone Curse 1, Advanced Book 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Property: ^cc5500Earth^000000",
		"Target: ^777777Party Member^000000",
		"Description: ^777777Endow a party member's weapon",
		"with Earth property for the skill's duration.",
		"If the skill fails, the weapon being endowed",
		"will be destroyed.",
		"Each cast requires 1 ^00BB00Green Live^777777.^000000"
	].join("\n");

	SkillDescription[SKID.SA_DRAGONOLOGY] = [
		"Dragonology",
		"Max Level: 5",
		"^CC3399Requirement: Advanced Book 9^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase resistance and damage",
		"against Dragon monsters. Mastering this skill",
		"will add +3 INT.^000000"
	].join("\n");

	SkillDescription[SKID.SA_VOLCANO] = [
		"Volcano",
		"Max Level: 5",
		"^CC3399Requirement: Flame Launcher 2^000000",
		"Skill Form: ^339900Supportive^000000",
		"Property: ^FF0000Fire^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Enchant an area on the ground so",
		"that it will amplify all Fire attacks, as well",
		"as the Fire property targets' Attack Power,",
		"in its range. Ice Wall and Sage skills that",
		"target the ground can't be cast over Volcano.",
		"Initial cast requires 1 ^00BB00Yellow Gemstone^777777, but",
		"multiple casting of this skill will not consume",
		"Gemstones throughout Volcano's active",
		"duration.^000000"
	].join("\n");

	SkillDescription[SKID.SA_DELUGE] = [
		"Deluge",
		"Max Level: 5",
		"^CC3399Requirement: Frost Weapon 2^000000",
		"Skill Form: ^339900Supportive^000000",
		"Property: ^0000BBWater^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Enchant an area on the ground so",
		"that it will amplify all Water attacks and the",
		"Max HP of Water property targets in its range.",
		"This area will also enable the use of ^000099Water Ball^777777",
		"and ^000099Aqua Benedicta^777777. Other Sage skills that",
		"target the ground can't be cast over Deluge.",
		"Initial cast requires 1 ^00BB00Yellow Gemstone^777777, but",
		"multiple casting of this skill will not consume",
		"Gemstones throughout Deluge's active",
		"duration.^000000"
	].join("\n");

	SkillDescription[SKID.SA_VIOLENTGALE] = [
		"Violent Gale",
		"Max Level: 5",
		"^CC3399Requirement: Lightning Loader 2^000000",
		"Skill Form: ^339900Supportive^000000",
		"Property: ^4cbb17Wind^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Enchant an area on the ground so",
		"that it will amplify all Wind attacks and the",
		"Flee Rate of Wind property targets in its range.",
		"This area will also increase the duration of",
		"Fire Wall so that it lasts 1.5 times longer.",
		"Other Sage skills that target the ground can't",
		"be cast over Violent Gale.",
		"Initial cast requires 1 ^00BB00Yellow Gemstone^777777, but",
		"multiple casting of this skill will not consume",
		"Gemstones throughout Violent Gale's active",
		"duration.^000000"
	].join("\n");

	SkillDescription[SKID.SA_LANDPROTECTOR] = [
		"Land Protector",
		"Max Level: 5",
		"^CC3399Requirement: Volcano 3, Deluge 3,",
		"Violent Gale 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Cast a spell that will block or",
		"cancel all ground targeting spells or",
		"enchantments. Other Sage skills that target the",
		"ground can't be cast in the area enchanted by",
		"Land Protector.",
		"Each cast requires 1 ^00BB00Blue Gemstone^777777 and",
		"1 ^00BB00Yellow Gemstone^777777.^000000"
	].join("\n");

	SkillDescription[SKID.SA_DISPELL] = [
		"Dispell",
		"Max Level: 5",
		"^CC3399Requirement: Spell Breaker 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Casting Dispell has a chance of",
		"canceling all magic effects that have been cast",
		"on a target.",
		"Each cast requires 1 ^00BB00Yellow Gemstone^777777.^000000"
	].join("\n");

	SkillDescription[SKID.SA_ABRACADABRA] = [
		"Abracadabra",
		"Max Level: 10",
		"^CC3399Requirement: Auto Spell 5, Dispell 1,",
		"Land Protector 1^000000",
		"Skill Form: ^777777Undefined^000000",
		"Target: ^777777Undefined^000000",
		"Description: ^777777Cast a random skill. Leveling this",
		"skill increases the variety of skills that are",
		"cast through Abracadabra.",
		"Each cast requires 2 ^00BB00Yellow Gemstones^777777.^000000"
	].join("\n");

	SkillDescription[SKID.SA_MONOCELL] = [
		"Mono Cell",
		"Skill Form: Active",
		"Target: Enemy",
		"Description: Transmogrify a target into a Poring for",
		"the skill's duration. This skill is exclusively",
		"cast through ^00BB00Abracadabra^777777.^000000"
	].join("\n");

	SkillDescription[SKID.SA_CLASSCHANGE] = [
		"Class Change",
		"Skill Form: ^339900Active^000000",
		"Target:^777777Enemy^000000",
		"Description: ^777777Transmogrify a target into a Boss monster",
		"for the skill's duration. This skill is exclusively",
		"cast through ^00BB00Abracadabra^777777.^000000"
	].join("\n");

	SkillDescription[SKID.SA_SUMMONMONSTER] = [
		"Summon Monster",
		"Skill Form: ^339900Active^000000",
		"Target:^777777Enemy^000000",
		"Description: ^777777Same ability as the Dead Branch item.",
		"Note: Exclusive skill that can be cast through",
		"Abracadabra.^000000"
	].join("\n");

	SkillDescription[SKID.SA_REVERSEORCISH] = [
		"Reverse Orcish",
		"Skill Form: ^339900Active^000000",
		"Target:^777777Automatically casts on its user^000000",
		"Description: ^777777Transform caster's face into an",
		"Orc for a set period.",
		"Note: Exclusive skill that can be cast through",
		"Abracadabra.^000000"
	].join("\n");

	SkillDescription[SKID.SA_DEATH] = [
		"Grim Reaper",
		"Skill Form: ^339900Active^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Deliver instant death to a target.",
		"The target will not reward any EXP points or",
		"items. Note: Exclusive skill that can be cast",
		"through Abracadabra.^000000"
	].join("\n");

	SkillDescription[SKID.SA_FORTUNE] = [
		"Fortune",
		"Skill Form: ^339900Active^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Gain as much zeny as a target's",
		"level multiplied by 100.",
		"Note: Exclusive skill that can be cast through",
		"Abracadabra.^000000"
	].join("\n");

	SkillDescription[SKID.SA_TAMINGMONSTER] = [
		"Taming Monster",
		"Skill Form: ^339900Active^000000",
		"Target:^777777Enemy^000000",
		"Description: ^777777Tame a tamable monster without the",
		"required item. Note: Exclusive skill that can be cast",
		"through Abracadabra.^000000"
	].join("\n");

	SkillDescription[SKID.SA_QUESTION] = [
		"?",
		"Skill Form: ^339900Active^000000",
		"Target:^777777Enemy^000000",
		"Description: ^777777Target shows a emotion [?].",
		"Note: Exclusive skill that can be cast through",
		"Abracadabra.^000000"
	].join("\n");

	SkillDescription[SKID.SA_GRAVITY] = [
		"Gravity",
		"Skill Form: ^339900Active^000000",
		"Target:^777777Automatically casts on its user^000000",
		"Description: ^777777Gravity logo appears on the head of",
		"caster. Note: Exclusive skill that can be cast",
		"through Abracadabra.^000000"
	].join("\n");

	SkillDescription[SKID.SA_LEVELUP] = [
		"Level Up",
		"Skill Form: ^339900Active^000000",
		"Target:^777777Automatically casts on its user^000000",
		"Description: ^777777Automatically level up the caster.",
		"Note: Exclusive skill that can be cast through Abracadabra.^000000"
	].join("\n");

	SkillDescription[SKID.SA_INSTANTDEATH] = [
		"Instant Death",
		"Skill Form: ^339900Active^000000",
		"Target:^777777Automatically casts on its user^000000",
		"Description: ^777777Kills the caster. Caster will lose EXP points.",
		"Note: Exclusive skill that can be cast through Abracadabra.^000000"
	].join("\n");

	SkillDescription[SKID.SA_FULLRECOVERY] = [
		"Full Recovery",
		"Skill Form: Active^000000",
		"Target:^777777Automatically casts on its user^000000",
		"Description: ^777777Recover full HP and SP, and cure all abnormal status.",
		"Note:^777777Exclusive skill that can be cast through Abracadabra.^000000"
	].join("\n");

	SkillDescription[SKID.SA_COMA] = [
		"Coma",
		"Skill Form: ^339900Active^000000",
		"Target:^777777Automatically casts on its user^000000",
		"Description: ^777777Reduce the caster's HP and",
		"SP down to 1. Note: Exclusive skill that can be",
		"cast through Abracadabra.^000000"
	].join("\n");

	SkillDescription[SKID.BD_ADAPTATION] = [
		"Adaptation to Circumstances",
		"Max Level: 1",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Immediately stop the current",
		"Dance or Song spell.",
		"The Encore skill cannot be used to repeat this."
	].join("\n");

	SkillDescription[SKID.BD_ENCORE] = [
		"Encore",
		"Max Level: 1",
		"^CC3399Requirement: Adaptation to Circumstances 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Recast the previous Song or",
		"Dance that was performed. Skills cast by",
		"Encore consume only half of the required SP.^000000"
	].join("\n");

	SkillDescription[SKID.BD_LULLABY] = [
		"Lullaby",
		"Max Level: 1",
		"19^CC3399Requirement: Whistle 10^000000",
		"20^CC3399Requirement: Humming 10^000000",
		"Skill Form: ^000099Ensemble Skill^000000",
		"Range: ^7777779 cells around the caster^000000",
		"Description: ^777777Cast an area that has the chance",
		"of causing the Sleep effect on enemies within",
		"its range. Ineffective against Boss monsters.^000000"
	].join("\n");

	SkillDescription[SKID.BD_RICHMANKIM] = [
		"Mr. Kim A Rich Man",
		"Max Level: 5",
		"^CC3399Requirement: Invulnerable Siegfried 3^000000",
		"Skill Form: ^000099Ensemble Skill^000000",
		"Range: ^7777779 cells around the caster^000000",
		"Description: ^777777Cast an area that increases the",
		"EXP rewarded for defeating monsters within",
		"its range.^000000"
	].join("\n");

	SkillDescription[SKID.BD_ETERNALCHAOS] = [
		"Eternal Chaos",
		"Max Level: 1",
		"^CC3399Requirement: Loki's Wail 1^000000",
		"Skill Form: ^000099Ensemble Skill^000000",
		"Range: ^7777779 cells around the caster^000000",
		"Description: ^777777Cast an area in which the Defense",
		"of all characters and monsters within its",
		"range will be reduced to 0."
	].join("\n");

	SkillDescription[SKID.BD_DRUMBATTLEFIELD] = [
		"Drum of Battlefield",
		"Max Level: 5",
		"19^CC3399Requirement: Apple of Idun 10^000000",
		"20^CC3399Requirement: Service For You 10^000000",
		"Skill Form: ^000099Ensemble Skill^000000",
		"Range: ^7777779 cells around the caster^000000",
		"Description: ^777777Increase ATK and DEF of Party",
		"Members within skill range.^000000"
	].join("\n");

	SkillDescription[SKID.BD_RINGNIBELUNGEN] = [
		"The Ring of Nibelungen",
		"Max Level: 5",
		"^CC3399Requirement: Drum of Battlefield 3^000000",
		"Skill Form: ^000099Ensemble Skill^000000",
		"Range: ^7777779 cells around the caster^000000",
		"Description: ^777777Cast an area that will amplify",
		"Party Member's Weapon's damage.^000000"
	].join("\n");

	SkillDescription[SKID.BD_ROKISWEIL] = [
		"Loki's Wail",
		"Max Level: 1",
		"19^CC3399Requirement: Assassin Cross of Sunset 10^000000",
		"20^CC3399Requirement: Forget Me Not 10^000000",
		"Skill Form: ^000099Ensemble Skill^000000",
		"Range: ^7777779 cells around the caster^000000",
		"Description: ^777777Cast an area in which skills and",
		"magic spells are disabled. Ineffective against",
		"Boss monsters.^000000"
	].join("\n");

	SkillDescription[SKID.BD_INTOABYSS] = [
		"Into the Abyss",
		"Max Level: 1",
		"^CC3399Requirement: Lullaby 1^000000",
		"Skill Form: ^000099Ensemble Skill^000000",
		"Range: ^7777779 cells around the caster^000000",
		"Description: ^777777Cast an area in which",
		"Party Members can use certain skills",
		"without any Gemstone requirement.^000000"
	].join("\n");

	SkillDescription[SKID.BD_SIEGFRIED] = [
		"Invulnerable Siegfried",
		"Max Level: 5",
		"19^CC3399Requirement: Magic Strings 10^000000",
		"20^CC3399Requirement: Fortune's Kiss 10^000000",
		"Skill Form: ^000099Ensemble Skill^000000",
		"Range: ^7777779 cells around the caster^000000",
		"Description: ^777777Cast an area that will endow",
		"resistance to every element by a set amount,",
		"as well as 50% tolerance to all abnormal",
		"statuses, for every Party Member within its",
		"range.^000000",
		"[Lv 1]: ^777777+60% Elemental Resistance^000000",
		"[Lv 2]: ^777777+65% Elemental Resistance^000000",
		"[Lv 3]: ^777777+70% Elemental Resistance^000000",
		"[Lv 4]: ^777777+75% Elemental Resistance^000000",
		"[Lv 5]: ^777777+80% Elemental Resistance^000000"
	].join("\n");

	SkillDescription[SKID.BD_RAGNAROK] = [
		"Ragnarok"
	].join("\n");

	SkillDescription[SKID.BA_MUSICALLESSON] = [
		"Musical Lesson",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase the damage of Musical",
		"Instrument Class Weapons, as well as the",
		"quality and Movement Speed of ^000099Play Skills^777777.^000000",
		"[Lv 1]: ^777777ATK +3^000000",
		"[Lv 2]: ^777777ATK +6^000000",
		"[Lv 3]: ^777777ATK +9^000000",
		"[Lv 4]: ^777777ATK +12^000000",
		"[Lv 5]: ^777777ATK +15^000000",
		"[Lv 6]: ^777777ATK +18^000000",
		"[Lv 7]: ^777777ATK +21^000000",
		"[Lv 8]: ^777777ATK +24^000000",
		"[Lv 9]: ^777777ATK +27^000000",
		"[Lv 10]: ^777777ATK +30^000000"
	].join("\n");

	SkillDescription[SKID.BA_MUSICALSTRIKE] = [
		"Musical Strike",
		"Max Level: 5",
		"^CC3399Requirement: Musical Lesson 3^000000",
		"Skill Form: ^339900Active^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Fire a powerful volley of arrows,",
		"even while using Play skills, by using an",
		"instrument. The Arrow's property determines",
		"the property of this attack.",
		"^00BB00Requires Musical Instrument Class Weapon.^000000"
	].join("\n");

	SkillDescription[SKID.BA_DISSONANCE] = [
		"Dissonance",
		"Max Level: 5",
		"^CC3399Requirement: Adaptation to Circumstances 1, Musical Lesson 1^000000",
		"Skill Form: ^339900Active^000000",
		"Range: ^7777775 cells around the caster^000000",
		"Description: ^777777Continuously inflict damage to",
		"enemies within the skill's range for skill",
		"duration.^000000"
	].join("\n");

	SkillDescription[SKID.BA_FROSTJOKE] = [
		"Frost Joke",
		"Max Level: 5",
		"^CC3399Requirement: Encore 1^000000",
		"Skill Form: ^339900Active^000000",
		"Range: ^777777Caster's View^000000",
		"Description: ^777777Freeze all enemies within the",
		"caster's view. Skill's level affects the chance",
		"of freezing enemies. However, the caster's",
		"Party Members also have a low chance of",
		"being frozen.^000000"
	].join("\n");

	SkillDescription[SKID.BA_WHISTLE] = [
		"Whistle",
		"Max Level: 10",
		"^CC3399Requirement: Dissonance 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Range: ^7777775 cells around the caster^000000",
		"Description: ^777777Increase the Flee and Perfect",
		"Dodge rate of all the players within the",
		"skill's range for skill duration.^000000"
	].join("\n");

	SkillDescription[SKID.BA_ASSASSINCROSS] = [
		"Assassin Cross of Sunset",
		"Max Level: 10",
		"^CC3399Requirement: Dissonance 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Range: ^7777775 cells around the caster^000000",
		"Description: ^777777Increase the Attack Speed of all",
		"players within the skill's range. This skill",
		"will have no effect on characters using long",
		"range attacks, as well as characters in",
		"certain statuses such as Two-Hand Quicken",
		"and Adrenaline Rush.^000000"
	].join("\n");

	SkillDescription[SKID.BA_POEMBRAGI] = [
		"Poem of Bragi",
		"Max Level: 10",
		"^CC3399Requirement: Dissonance 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Range: ^7777775 cells",
		"around the caster^000000",
		"Description: ^777777Reduce skill casting time and",
		"delay for all players within the skill's range.^000000"
	].join("\n");

	SkillDescription[SKID.BA_APPLEIDUN] = [
		"Apple of Idun",
		"Max Level: 10",
		"^CC3399Requirement: Dissonance 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Range: ^7777775 cells around the caster^000000",
		"Description: ^777777Increase the Max HP of any Party",
		"Members within the skill's range, as well as",
		"regenerate their HP over time.^000000"
	].join("\n");

	SkillDescription[SKID.DC_DANCINGLESSON] = [
		"Dancing Lesson",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase the damage of Whip",
		"Class Weapons, as well as the quality and",
		"Movement Speed of Dance skills.^000000",
		"[Lv 1]: ^777777ATK +3^000000",
		"[Lv 2]: ^777777ATK +6^000000",
		"[Lv 3]: ^777777ATK +9^000000",
		"[Lv 4]: ^777777ATK +12^000000",
		"[Lv 5]: ^777777ATK +15^000000",
		"[Lv 6]: ^777777ATK +18^000000",
		"[Lv 7]: ^777777ATK +21^000000",
		"[Lv 8]: ^777777ATK +24^000000",
		"[Lv 9]: ^777777ATK +27^000000",
		"[Lv 10]: ^777777ATK +30^000000"
	].join("\n");

	SkillDescription[SKID.DC_THROWARROW] = [
		"Throw Arrow",
		"Max Level: 5",
		"^CC3399Requirement: Dancing Lesson 3^000000",
		"Skill Form: ^339900Active^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Throw a powerful volley of arrows,",
		"even while using Dance skill, by using a whip.",
		"The Arrow's property determines the property",
		"of this attack.",
		"^00BB00Requires Whip Class Weapon.^000000"
	].join("\n");

	SkillDescription[SKID.DC_UGLYDANCE] = [
		"Ugly Dance",
		"Max Level: 5",
		"^CC3399Requirement: Adaptation to Circumstances 1,",
		"Dancing Lesson 1^000000",
		"Skill Form: ^339900Active^000000",
		"Range: ^7777775 cells around the caster^000000",
		"Description: ^777777Continuously reduce the SP",
		"of enemies within Ugly Dance's range.^000000",
		"^00BB00Requires Whip Class Weapon.^000000"
	].join("\n");

	SkillDescription[SKID.DC_SCREAM] = [
		"Scream",
		"Max Level: 5",
		"^CC3399Requirement: Encore 1^000000",
		"Skill Form: ^339900Active^000000",
		"Range: ^777777Caster's view range^000000",
		"Description: ^777777Inflict the Stun status to enemies",
		"within the caster's view with a low chance of",
		"also causing the Stun status to Party Members.^000000"
	].join("\n");

	SkillDescription[SKID.DC_HUMMING] = [
		"Humming",
		"Max Level: 10",
		"^CC3399Requirement: Ugly Dance 3^000000",
		"Skill Form: ^339900Active^000000",
		"Range: ^7777775 cells around the caster^000000",
		"Description: ^777777Increase the Accuracy Rate of all",
		"players within the range of Humming.^000000",
		"^00BB00Requires Whip Class Weapon.^000000"
	].join("\n");

	SkillDescription[SKID.DC_DONTFORGETME] = [
		"Forget Me Not",
		"Max Level: 10",
		"^CC3399Requirement: Ugly Dance 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Range: ^7777775 cells",
		"around the caster^000000",
		"Description: ^777777Decrease ASPD and Movement",
		"Speed of all enemies that are within this",
		"skill's range. Forget Me Not will also cancel",
		"any statuses that increase Movement and",
		"Attack Speed for skill duration.^000000",
		"^00BB00Requires Whip Class Weapon.^000000"
	].join("\n");

	SkillDescription[SKID.DC_FORTUNEKISS] = [
		"Fortune's Kiss",
		"Max Level: 10",
		"^CC3399Requirement: Ugly Dance 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Range: ^7777775 cells",
		"around the caster^000000",
		"Description: ^777777Increase the Critical Attack rate",
		"of all players within this skill's range.^000000",
		"^00BB00Requires Whip Class Weapon.^000000"
	].join("\n");

	SkillDescription[SKID.DC_SERVICEFORYOU] = [
		"Service For You",
		"Max Level: 10",
		"^CC3399Requirement: Ugly Dance 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Range: ^7777775 cells",
		"around the caster^000000",
		"Description: ^777777Increase the Max SP of Party",
		"Members within this skill's range, as well as",
		"reduce their SP consumption for skills.^000000",
		"^00BB00Requires Whip Class Weapon.^000000"
	].join("\n");

	SkillDescription[SKID.WE_MALE] = [
		"I'll save you",
		"Skill Form: ^777777Wedding Skill^000000",
		"Description: ^777777Restore your spouse's HP by",
		"consuming an amount of HP equal to 10% of your",
		"Max HP. This skill cannot be used when",
		"remaining HP is less than 10% of Max HP.^000000"
	].join("\n");

	SkillDescription[SKID.WE_FEMALE] = [
		"I'll sacrifice myself for you",
		"Skill Form: ^777777Wedding Skill^000000",
		"Description: ^777777Restore your spouse's SP by",
		"consuming an amount of HP equal to 10% of your",
		"Max HP. This skill cannot be used when",
		"remaining SP is less than 10% of Max SP.^000000"
	].join("\n");

	SkillDescription[SKID.WE_CALLPARTNER] = [
		"I miss you",
		"Skill Form: ^777777Wedding Skill^000000",
		"Description: ^777777Summon your spouse to your current",
		"location. This skill is disabled in certain",
		"places, such as WoE areas.^000000"
	].join("\n");

	SkillDescription[SKID.ITM_TOMAHAWK] = [
		"Tomahawk Throwing",
		"Description: ^777777Throw an axe to inflict damage",
		"to an enemy.^000000"
	].join("\n");

	SkillDescription[SKID.LK_AURABLADE] = [
		"Aura Blade",
		"Max Level: 5",
		"^CC3399Requirement: Bash 5, Magnum Break 5,",
		"Two Handed Sword Mastery 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Enchant equipped weapon with an",
		"aura that will grant additional damage that is",
		"unaffected by the caster's Accuracy Rate or the",
		"enemy's Defense.^000000",
		"[Lv 1]: ^777777+20 ATK^000000",
		"[Lv 2]: ^777777+40 ATK^000000",
		"[Lv 3]: ^777777+60 ATK^000000",
		"[Lv 4]: ^777777+80 ATK^000000",
		"[Lv 5]: ^777777+100 ATK^000000"
	].join("\n");

	SkillDescription[SKID.LK_PARRYING] = [
		"Parry",
		"Max Level: 10",
		"^CC3399Requirement: Provoke 5,",
		"Two-Handed Sword Mastery 10,",
		"Two-Hand Quicken 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Block damage from physical",
		"attack using Two Handed Sword. When",
		"successful block an attack, caster will be",
		"forced to pause momentarily.",
		"Requires ^00BB00Two Handed Sword^000000.",
		"[Lv 1]: ^777777Block +23%^000000",
		"[Lv 2]: ^777777Block +26%^000000",
		"[Lv 3]: ^777777Block +29%^000000",
		"[Lv 4]: ^777777Block +32%^000000",
		"[Lv 5]: ^777777Block +35%^000000",
		"[Lv 6]: ^777777Block +38%^000000",
		"[Lv 7]: ^777777Block +41%^000000",
		"[Lv 8]: ^777777Block +44%^000000",
		"[Lv 9]: ^777777Block +47%^000000",
		"[Lv 10]: ^777777Block +50%^000000"
	].join("\n");

	SkillDescription[SKID.LK_CONCENTRATION] = [
		"Concentration",
		"Max Level: 5",
		"^CC3399Requirement: Increase HP Recovery 5,",
		"Spear Mastery 5, Riding 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777When activated, this skill endows",
		"the caster with the Endure effect and increased",
		"Attack Power and Accuracy, but will also",
		"temporarily reduce Defense.^000000",
		"[Lv 1]: ^777777Hit +10, ATK +5%, DEF -5%^000000",
		"[Lv 2]: ^777777Hit +20, ATK +10%, DEF -10%^000000",
		"[Lv 3]: ^777777Hit +30, ATK +15%, DEF -15%^000000",
		"[Lv 4]: ^777777Hit +40, ATK +20%, DEF -20%^000000",
		"[Lv 5]: ^777777Hit +50, ATK +25%, DEF -25%^000000"
	].join("\n");

	SkillDescription[SKID.LK_TENSIONRELAX] = [
		"Tension Relax",
		"Max Level: 1",
		"^CC3399Requirement: Provoke 5,",
		"Increase HP Recovery 5, Endure 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Increase HP restoration speed",
		"while sitting and resting. The effect will",
		"cancelled if user is stand, equip a gear or",
		"use consumable.^000000"
	].join("\n");

	SkillDescription[SKID.LK_BERSERK] = [
		"Frenzy",
		"Max Level: 1",
		"^CC3399Requirement: Lord Knight Over Job Level 50^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Use the power of rage to increase",
		"Max HP, Movement Speend and Attack Power.",
		"However, this skill will decrease the caster's",
		"Flee Rate and will inhibit actions including",
		"moving, attacking, item use or receiving",
		"support from healing skills. The Frenzy",
		"status will drain a certain amount of HP per ",
		"second and disables natural HP and SP ",
		"restoration for 5 minutes after the Frenzy",
		"status has worn off.^000000"
	].join("\n");

	SkillDescription[SKID.HP_ASSUMPTIO] = [
		"Assumptio",
		"Max Level: 5",
		"^CC3399Requirement: Angelus 1,",
		"Increase SP Recovery 3, Impositio Manus 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Increase target's defense",
		"by 100% for a period of time. Cannot be used",
		"in conjunction with Kyrie Eleison skill.",
		"When used in PVP or WOE, defense is",
		"increased by 35%.^000000",
		"[Lv 1]: ^77777720 sec duration^000000",
		"[Lv 2]: ^77777740 sec duration^000000",
		"[Lv 3]: ^77777760 sec duration^000000",
		"[Lv 4]: ^77777780 sec duration^000000",
		"[Lv 5]: ^777777100 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.HP_BASILICA] = [
		"Basilica",
		"Max Level: 5",
		"^CC3399Requirement: Gloria 2,",
		"Increase SP Recovery 1, Kyrie Eleison 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Block all enemies and attacks from",
		"entering this skill's range. Ineffective against",
		"Boss monsters and WoE guardians.",
		"Basilica cannot be cast if there is an",
		"obstacle in the area.",
		"Each cast requires 1 ^00BB00Holy Water^777777, 1 ^00BB00Yellow",
		"Gemstone^777777, 1 ^00BB00Blue Gemstone^777777 and 1 ^00BB00Red",
		"Gemstone^777777.^000000",
		"[Lv 1]: ^77777720 sec duration^000000",
		"[Lv 2]: ^77777725 sec duration^000000",
		"[Lv 3]: ^77777730 sec duration^000000",
		"[Lv 4]: ^77777735 sec duration^000000",
		"[Lv 5]: ^77777740 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.HP_MEDITATIO] = [
		"Meditation",
		"Max Level: 10",
		"^CC3399Requirement: Increase SP Recovery 5,",
		"Lex Divina 5, Aspersio 3^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase SP Recovery Rate and",
		"Max SP, as well as the amount of HP restored",
		"by healing skills.^000000",
		"[Lv 1]: ^777777MaxSP +1%, SP Recovery Rate +3%^000000",
		"[Lv 2]: ^777777MaxSP +2%, SP Recovery Rate +6%^000000",
		"[Lv 3]: ^777777MaxSP +3%, SP Recovery Rate +9%^000000",
		"[Lv 4]: ^777777MaxSP +4%, SP Recovery Rate +12%^000000",
		"[Lv 5]: ^777777MaxSP +5%, SP Recovery Rate +15%^000000",
		"[Lv 6]: ^777777MaxSP +6%, SP Recovery Rate +18%^000000",
		"[Lv 7]: ^777777MaxSP +7%, SP Recovery Rate +21%^000000",
		"[Lv 8]: ^777777MaxSP +8%, SP Recovery Rate +24%^000000",
		"[Lv 9]: ^777777MaxSP +9%, SP Recovery Rate +27%^000000",
		"[Lv 10]: ^777777MaxSP +10%, SP Recovery Rate +30%^000000"
	].join("\n");

	SkillDescription[SKID.HW_SOULDRAIN] = [
		"Soul Drain",
		"Max Level: 10",
		"^CC3399Requirement: Increase SP Recovery 5,",
		"Soul Strike 7^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase MaxSP. Whenever you",
		"defeat an enemy with magical or physical",
		"attack, you will gain certain amount of SP",
		"depend on monster's level.^000000",
		"[Lv 1]: ^777777MaxSP +2%^000000",
		"[Lv 2]: ^777777MaxSP +4%^000000",
		"[Lv 3]: ^777777MaxSP +6%^000000",
		"[Lv 4]: ^777777MaxSP +8%^000000",
		"[Lv 5]: ^777777MaxSP +10%^000000",
		"[Lv 6]: ^777777MaxSP +12%^000000",
		"[Lv 7]: ^777777MaxSP +14%^000000",
		"[Lv 8]: ^777777MaxSP +16%^000000",
		"[Lv 9]: ^777777MaxSP +18%^000000",
		"[Lv 10]: ^777777MaxSP +20%^000000"
	].join("\n");

	SkillDescription[SKID.HW_MAGICCRASHER] = [
		"Magic Crasher",
		"Max Level: 1",
		"^CC3399Requirement: Increase SP Recovery 1^000000",
		"Skill Form: ^339900Active^000000",
		"Description: ^777777Inflict Neutral property damage",
		"that is equal to the Magic Attack Power (Matk)",
		"of the caster and is affected by the target's",
		"Defense.^000000"
	].join("\n");

	SkillDescription[SKID.HW_MAGICPOWER] = [
		"Mystical Amplification",
		"Max Level: 10",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Amplify the Magic Attack Power",
		"of the next magic skill that is cast.^000000",
		"[Lv 1]: ^777777Matk +5%^000000",
		"[Lv 2]: ^777777Matk +10%^000000",
		"[Lv 3]: ^777777Matk +15%^000000",
		"[Lv 4]: ^777777Matk +20%^000000",
		"[Lv 5]: ^777777Matk +25%^000000",
		"[Lv 6]: ^777777Matk +30%^000000",
		"[Lv 7]: ^777777Matk +35%^000000",
		"[Lv 8]: ^777777Matk +40%^000000",
		"[Lv 9]: ^777777Matk +45%^000000",
		"[Lv 10]: ^777777Matk +50%^000000"
	].join("\n");

	SkillDescription[SKID.PA_PRESSURE] = [
		"Pressure",
		"Max Level: 5",
		"^CC3399Requirement: Endure 5, Faith 5, Shield Charge 2^000000",
		"Skill Form: ^339900Active^000000",
		"Description: ^777777Summon a massive crucifix to",
		"crush enemies. This skill inflicts a fixed",
		"amount of damage, depending on the skill's",
		"level, which ignores DEF and ATK. On other",
		"players, this skill will also drain SP.",
		"Pressure cannot be cancelled by any method.^000000",
		"[Lv 1]: ^777777800 Damage^000000",
		"[Lv 2]: ^7777771,100 Damage^000000",
		"[Lv 3]: ^7777771,400 Damage^000000",
		"[Lv 4]: ^7777771,700 Damage^000000",
		"[Lv 5]: ^7777772,000 Damage^000000"
	].join("\n");

	SkillDescription[SKID.PA_SACRIFICE] = [
		"Sacrifice",
		"Max Level: 5",
		"^CC3399Requirement: Endure 1, Devotion 3^000000",
		"Skill Form: ^339900Active^000000",
		"Description: ^777777Enhance the damage of 5 physical",
		"attacks after activating this skill. Each attack",
		"enhanced by Sacrifice will drain an amount",
		"of HP equal to 9% of character's MaxHP.^000000",
		"[Lv 1]: ^777777Damage x1^000000",
		"[Lv 2]: ^777777Damage x1.1^000000",
		"[Lv 3]: ^777777Damage x1.2^000000",
		"[Lv 4]: ^777777Damage x1.3^000000",
		"[Lv 5]: ^777777Damage x1.4^000000"
	].join("\n");

	SkillDescription[SKID.PA_GOSPEL] = [
		"Gospel",
		"Max Level: 10",
		"^CC3399Requirement: Faith 8,",
		"Divine Protection 3, Demon Bane 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Range: ^7777777 cells",
		"around the caster^000000",
		"Description: ^777777Sing a hymn that will cause one",
		"out of 10 different negative status effects to",
		"enemies and will endow one out of 10 positive",
		"statuses upon Party Members within this skill's",
		"range. This skill is cancelled if the caster is",
		"muted during the casting of Gospel.^000000"
	].join("\n");

	SkillDescription[SKID.CH_PALMSTRIKE] = [
		"Palm Strike",
		"Max Level: 5",
		"^CC3399Requirement: Iron Hand 7,",
		"Call Spirits 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Strike an enemy using the palms,",
		"pushing back the enemy and causing damage,",
		"which is determined by the skill's level,",
		"after 1 second delay. This skill can only",
		"be used during the ^00BB00Explosion Spirits status^777777.^000000",
		"[Lv 1]: ^777777ATK +300%^000000",
		"[Lv 2]: ^777777ATK +400%^000000",
		"[Lv 3]: ^777777ATK +500%^000000",
		"[Lv 4]: ^777777ATK +600%^000000",
		"[Lv 5]: ^777777ATK +700%^000000"
	].join("\n");

	SkillDescription[SKID.CH_TIGERFIST] = [
		"Tiger Fist",
		"Max Level: 5",
		"^CC3399Requirement: Iron Hand 5,",
		"Triple Attack 5, Combo Finish 3^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777A combo skill that can be cast",
		"after using Chain Combo. An enemy hit by",
		"this skill is immobilized for a short period",
		"of time.",
		"Each cast requires 1 ^00BB00Spirit Sphere^777777.^000000",
		"[Lv 1]: ^777777ATK +140%, Freezing Chance 20%^000000",
		"[Lv 2]: ^777777ATK +240%, Freezing Chance 30%^000000",
		"[Lv 3]: ^777777ATK +340%, Freezing Chance 40%^000000",
		"[Lv 4]: ^777777ATK +440%, Freezing Chance 50%^000000",
		"[Lv 5]: ^777777ATK +540%, Freezing Chance 60%^000000"
	].join("\n");

	SkillDescription[SKID.CH_CHAINCRUSH] = [
		"Chain Crush Combo",
		"Max Level: 10",
		"^CC3399Requirement: Iron Hand 5,",
		"Call Spirits 5, Tiger Fist 2^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777A combo skill that can be cast",
		"after using Combo Finish. Tiger Fist cannot",
		"be used after this skill, although it can be",
		"followed up with Asura Strike.",
		"^00BB00Each cast requires 2 Spirit Spheres^777777.^000000",
		"[Lv 1]: ^777777ATK +500%^000000",
		"[Lv 2]: ^777777ATK +600%^000000",
		"[Lv 3]: ^777777ATK +700%^000000",
		"[Lv 4]: ^777777ATK +800%^000000",
		"[Lv 5]: ^777777ATK +900%^000000",
		"[Lv 6]: ^777777ATK +1000%^000000",
		"[Lv 7]: ^777777ATK +1100%^000000",
		"[Lv 8]: ^777777ATK +1200%^000000",
		"[Lv 9]: ^777777ATK +1300%^000000",
		"[Lv 10]: ^777777ATK +1400%^000000"
	].join("\n");

	SkillDescription[SKID.PF_HPCONVERSION] = [
		"Indulge",
		"Max Level: 5",
		"^CC3399Requirement: Increase SP Recovery 1,",
		"Magic Rod 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Consume an amount of HP equal",
		"to 10% of Max HP to restore an SP amount",
		"determined by the skill's level.^000000",
		"[Lv 1]: ^777777SP +10%^000000",
		"[Lv 2]: ^777777SP +20%^000000",
		"[Lv 3]: ^777777SP +30%^000000",
		"[Lv 4]: ^777777SP +40%^000000",
		"[Lv 5]: ^777777SP +50%^000000"
	].join("\n");

	SkillDescription[SKID.PF_SOULCHANGE] = [
		"Soul Change",
		"Max Level: 1",
		"^CC3399Requirement: Magic Rod 3, Spell Breaker 2^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Exchange caster's remaining SP",
		"with target's remaining SP. The SP that the",
		"caster receives cannot exceed the caster's",
		"Max SP limit.^000000"
	].join("\n");

	SkillDescription[SKID.PF_SOULBURN] = [
		"Soul Burn",
		"Max Level: 5",
		"^CC3399Requirement: Cast Cancel 5,",
		"Magic Rod 3, Dispell 3^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Cast a spell that has the chance",
		"of draining the target's SP. At level 5, this",
		"skill will also inflict an amount of damage",
		"equal to double of the caster's remaining SP.",
		"However, if this skill fails, this damage will",
		"be received by the caster. Soul Burn is only",
		"enabled in WoE (Guild War) battles and PvP",
		"zones, and has a 15 second delay after each",
		"use.^000000",
		"[Lv 1]: ^77777740% Success Rate^000000",
		"[Lv 2]: ^77777750% Success Rate^000000",
		"[Lv 3]: ^77777760% Success Rate^000000",
		"[Lv 4]: ^77777770% Success Rate^000000",
		"[Lv 5]: ^77777770% Success Rate^000000"
	].join("\n");

	SkillDescription[SKID.ASC_KATAR] = [
		"Advanced Katar Mastery",
		"Max Level: 5",
		"^CC3399Requirement: Double Attack 5,",
		"Katar Mastery 7^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enhance the damage inflicted",
		"with Katar Class Weapons.^000000",
		"[Lv 1]: ^777777ATK +12%^000000",
		"[Lv 2]: ^777777ATK +14%^000000",
		"[Lv 3]: ^777777ATK +16%^000000",
		"[Lv 4]: ^777777ATK +18%^000000",
		"[Lv 5]: ^777777ATK +20%^000000"
	].join("\n");

	SkillDescription[SKID.ASC_EDP] = [
		"Enchant Deadly Poison",
		"Max Level: 5",
		"^CC3399Requirement: Create Deadly Poison 1^000000 ",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Enchant a weapon with deadly",
		"poison to enhance its damage and poison",
		"targets by chance, causing the target's HP to",
		"dramatically decrease for the poison's",
		"duration. This damage enhancement will not",
		"apply to Boss monsters.",
		"Each cast requires 1 ^008800Poison Bottle^777777.^000000"
	].join("\n");

	SkillDescription[SKID.ASC_BREAKER] = [
		"Soul Destroyer",
		"Max Level: 10",
		"^CC3399Requirement: Double Attack 5, Envenom 5,",
		"Cloaking 3, Enchant Poison 6^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Inflict a range damage to an",
		"enemy, calculated as half of the target's",
		"Defense added to half of its Magic Defense,",
		"that is affected by the caster's INT and ATK^000000"
	].join("\n");

	SkillDescription[SKID.SN_SIGHT] = [
		"True Sight",
		"Max Level: 10",
		"^CC3399Requirement: Owl's Eye 10,",
		"Vulture's Eye 10, Improve Concentration 10, Falconry Mastery 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Add +5 to all Stats, as well as",
		"increase attack accuracy, weapon damage",
		"and critical attack rate.^000000",
		"[Lv 1]: ^777777Hit +3%, Damage +2%, Crit +1^000000",
		"[Lv 2]: ^777777Hit +6%, Damage +4%, Crit +2^000000",
		"[Lv 3]: ^777777Hit +9%, Damage +6%, Crit +3^000000",
		"[Lv 4]: ^777777Hit +12%, Damage +8%, Crit +4^000000",
		"[Lv 5]: ^777777Hit +15%, Damage +10%, Crit +5^000000",
		"[Lv 6]: ^777777Hit +18%, Damage +12%, Crit +6^000000",
		"[Lv 7]: ^777777Hit +21%, Damage +14%, Crit +7^000000",
		"[Lv 8]: ^777777Hit +24%, Damage +16%, Crit +8^000000",
		"[Lv 9]: ^777777Hit +27%, Damage +18%, Crit +9^000000",
		"[Lv 10]: ^777777Hit +30%, Damage +20%, Crit +10^000000"
	].join("\n");

	SkillDescription[SKID.SN_FALCONASSAULT] = [
		"Falcon Assault",
		"Max Level: 5",
		"^CC3399Requirement: Vulture's Eye 5,",
		"Falconry Mastery 1, Blitz Beat 5, Steel Crow 3^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Command Falcon to attack an",
		"enemy with numerous strikes.^000000"
	].join("\n");

	SkillDescription[SKID.SN_SHARPSHOOTING] = [
		"Sharp Shooting",
		"Max Level: 5",
		"^CC3399Requirement: Double Strafe 5,",
		"Improve Concentration 10^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Shoot an arrow with incredible",
		"might directly towards a targeted spot, greatly",
		"damaging any enemies in its path. This is a",
		"Critical Attack that is calculated as the",
		"caster's Critical Attack Rate +20.^000000",
		"[Lv 1]: ^777777ATK +150%^000000",
		"[Lv 2]: ^777777ATK +200%^000000",
		"[Lv 3]: ^777777ATK +250%^000000",
		"[Lv 4]: ^777777ATK +300%^000000",
		"[Lv 5]: ^777777ATK +350%^000000"
	].join("\n");

	SkillDescription[SKID.SN_WINDWALK] = [
		"Wind Walk",
		"Max Level: 10",
		"^CC3399Requirement: Improve Concentration 9^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Increase the Movement Speed and",
		"Flee Rate of the caster and Party Members.",
		"However, movement speed will not increased",
		"if a similar effect, such as Increase",
		"Agility, has already been cast. Skills",
		"which decrease movement speed, such as",
		"Quagmire, cancel the movement speed",
		"increase from Wind Walker.^000000"
	].join("\n");

	SkillDescription[SKID.WS_MELTDOWN] = [
		"Meltdown",
		"Max Level: 10",
		"^CC3399Requirement: Skin Tempering 3,",
		"Hilt Binding 1, Weaponry Research 5,",
		"Power Thrust 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777This skill has the chance of",
		"destroying an equipped weapon or armor when",
		"used in PvP zones on other players, or to",
		"decrease Attack Power or Defense when used",
		"on monsters. This skill's level affects",
		"its duration and rate of success.^000000",
		"[Lv 1]: ^77777715 sec duration^000000",
		"[Lv 2]: ^77777720 sec duration^000000",
		"[Lv 3]: ^77777725 sec duration^000000",
		"[Lv 4]: ^77777730 sec duration^000000",
		"[Lv 5]: ^77777735 sec duration^000000",
		"[Lv 6]: ^77777740 sec duration^000000",
		"[Lv 7]: ^77777745 sec duration^000000",
		"[Lv 8]: ^77777750 sec duration^000000",
		"[Lv 9]: ^77777755 sec duration^000000",
		"[Lv 10]: ^77777760 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.WS_CREATECOIN] = [
		"Coin Craft"
	].join("\n");

	SkillDescription[SKID.WS_CREATENUGGET] = [
		"Nugget Craft"
	].join("\n");

	SkillDescription[SKID.WS_CARTBOOST] = [
		"Cart Boost",
		"Max Level: 1",
		"^CC3399Requirement: Push Cart 5, Hilt Binding 1,",
		"Cart Revolution, Change Cart^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Increase Movement Speed when",
		"a Pushcart is equipped. Effect which decrease",
		"movement speed cannot interfere with this",
		"skill.^000000"
	].join("\n");

	SkillDescription[SKID.WS_SYSTEMCREATE] = [],
	SkillDescription[SKID.ST_CHASEWALK] = [
		"Chase Walk",
		"Max Level: 5",
		"^CC3399Requirement: Hiding 5, Tunnel Drive 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Enter a special Hiding status in",
		"which caster can move without being detected",
		"by skills such as Improve Concentration, Sight",
		"or Ruwach. However, the caster will leave",
		"footprints and can be damaged by skills that",
		"target the ground. Ineffective against Insect,",
		"Devil and Boss monsters.",
		"During WoE (Guild War),this skill will consume",
		"5 times as much SP.^000000",
		"[Lv 1]: ^77777770% Movement Speed, 12 SP/10 sec,",
		"+1 STR after 10 seconds.^000000",
		"[Lv 2]: ^77777775% Movement Speed, 14 SP/10 sec,",
		"+2 STR after 10 seconds.^000000",
		"[Lv 3]: ^77777780% Movement Speed, 16 SP/10 sec,",
		"+4 STR after 10 seconds.^000000",
		"[Lv 4]: ^77777785% Movement Speed, 18 SP/10 sec,",
		"+8 STR after 10 seconds.^000000",
		"[Lv 5]: ^77777790% Movement Speed, 20 SP/10 sec ",
		"+16 STR after 10 seconds.^000000"
	].join("\n");

	SkillDescription[SKID.ST_REJECTSWORD] = [
		"Reject Sword",
		"Max Level: 5",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777If an enemy is using a Sword",
		"Class Weapon, activating this skill can deflect",
		"attacks, reducing damage from Swords by half.",
		"A total of 3 attacks can be deflected after this",
		"skill is casted. On monsters, the damage",
		"that is deflected will be directed back at the",
		"monster.^000000",
		"[Lv 1]: ^77777715% Success rate^000000",
		"[Lv 2]: ^77777730% Success rate^000000",
		"[Lv 3]: ^77777745% Success rate^000000",
		"[Lv 4]: ^77777760% Success rate^000000",
		"[Lv 5]: ^77777775% Success rate^000000"
	].join("\n");

	SkillDescription[SKID.ST_STEALBACKPACK] = [],
	SkillDescription[SKID.CR_ALCHEMY] = [],
	SkillDescription[SKID.CR_SYNTHESISPOTION] = [],
	SkillDescription[SKID.CG_ARROWVULCAN] = [
		"Arrow Vulcan",
		"Max Level: 10",
		"19^CC3399Requirement: Musical Strike 1,",
		"20^CC3399Requirement: Throw Arrow 1,",
		"Double Strafe 5, Arrow Shower 5,^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Fire an awesome flurry of arrows",
		"at a targeted enemy.",
		"Requires ^00BB00Musical Instrument^777777 for Clown",
		"and ^00BB00Whip^777777 class weapon for Gypsy.^000000",
		"[Lv 1]: ^777777300% ATK^000000",
		"[Lv 2]: ^777777400% ATK^000000",
		"[Lv 3]: ^777777500% ATK^000000",
		"[Lv 4]: ^777777600% ATK^000000",
		"[Lv 5]: ^777777700% ATK^000000",
		"[Lv 6]: ^777777800% ATK^000000",
		"[Lv 7]: ^777777900% ATK^000000",
		"[Lv 8]: ^7777771000% ATK^000000",
		"[Lv 9]: ^7777771100% ATK^000000",
		"[Lv 10]: ^7777771200% ATK^000000"
	].join("\n");

	SkillDescription[SKID.CG_MOONLIT] = [
		"Moonlit Water Mill",
		"Max Level: 5",
		"19^CC3399Requirement: Musical Lesson 7,",
		"20^CC3399Requirement: Dancing Lesson 7,",
		"Improve Concentration 5^000000",
		"Skill Form: ^777777Ensemble Skill^000000",
		"Description: ^777777Clown and Gypsy ensemble",
		"skill that creates a 5*5 cell area around",
		"the casters where other players and monsters",
		"cannot enter. This skill cannot offer",
		"protection from magic or long ranged attacks.",
		"This skill cannot be cast in areas that are",
		"adjacent to obstacles.^000000",
		"[Lv 1]: ^77777720 sec duration^000000",
		"[Lv 2]: ^77777725 sec duration^000000",
		"[Lv 3]: ^77777730 sec duration^000000",
		"[Lv 4]: ^77777735 sec duration^000000",
		"[Lv 5]: ^77777740 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.CG_MARIONETTE] = [
		"Marionette Control",
		"Max Level: 1",
		"19^CC3399Requirement: Musical Lesson 5,",
		"20^CC3399Requirement: Dancing Lesson 5,",
		"Improve Concentration 10^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Targeted Party Member receives a",
		"bonus to all Stats equal to half of the Stats",
		"of the caster. However, each of the target's",
		"Stats cannot exceed 99. This skill is cancelled",
		"if this Party Member is more than 7 cells away",
		"from the caster.^000000"
	].join("\n");

	SkillDescription[SKID.LK_SPIRALPIERCE] = [
		"Spiral Pierce",
		"Max Level: 5",
		"^CC3399Requirement: Spear Mastery 10,",
		"Pierce 5, Riding 1, Spear Stab 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Hit an enemy with spiraling strikes",
		"that immobilize it for a second and inflict an",
		"amount of damage determined by the skill's",
		"level and the weight of the equipped weapon.",
		"This skill's level also affects its cast time",
		"and delay.^000000"
	].join("\n");

	SkillDescription[SKID.LK_HEADCRUSH] = [
		"Head Crush",
		"Max Level: 5",
		"^CC3399Requirement: Spear Mastery 9, Riding 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Brutally strike an enemy with the",
		"chance of causing the Bleeding status, which",
		"will make the target continuously receive extra",
		"damage for a while.^000000",
		"[Lv 1]: ^777777140% ATK^000000",
		"[Lv 2]: ^777777180% ATK^000000",
		"[Lv 3]: ^777777220% ATK^000000",
		"[Lv 4]: ^777777260% ATK^000000",
		"[Lv 5]: ^777777300% ATK^000000"
	].join("\n");

	SkillDescription[SKID.LK_JOINTBEAT] = [
		"Joint Beat",
		"Max Level: 10",
		"^CC3399Requirement: Spear Mastery 9,",
		"Riding 1, Cavalier Mastery 3,",
		"Head Crush 3^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Strike an enemy's vital points to",
		"cause various abnormal statuses. This skill's",
		"level affects the Attack Power and the success",
		"rate of causing abnormal status effects.",
		"Requires ^00BB00Spear^777777 Class Weapon.^000000",
		"[Lv 1]: ^77777760%ATK^000000",
		"[Lv 2]: ^77777770%ATK^000000",
		"[Lv 3]: ^77777780%ATK^000000",
		"[Lv 4]: ^77777790%ATK^000000",
		"[Lv 5]: ^777777100%ATK^000000",
		"[Lv 6]: ^777777110%ATK^000000",
		"[Lv 7]: ^777777120%ATK^000000",
		"[Lv 8]: ^777777130%ATK^000000",
		"[Lv 9]: ^777777140%ATK^000000",
		"[Lv 10]: ^777777150%ATK^000000"
	].join("\n");

	SkillDescription[SKID.HW_NAPALMVULCAN] = [
		"Napalm Vulcan",
		"Max Level: 5",
		"^CC3399Requirement: Napalm Beat 5^000000",
		"Skill Form: ^FF0000Offensive",
		"Property: ^bb00bbGhost^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Deliver multiple psychokinetic",
		"blows at an enemy with a low chance of",
		"causing an abnormal status. This skill's",
		"level affects the number of strikes from",
		"Napalm Vulcan.^000000"
	].join("\n");

	SkillDescription[SKID.CH_SOULCOLLECT] = [
		"Dangerous Soul Collect",
		"Max Level: 1",
		"^CC3399Requirement: Explosion Spirits 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon 5 Spirit Spheres at one",
		"time. The cast time of this skill is double",
		"the time of the Call Spirits skill.^000000"
	].join("\n");

	SkillDescription[SKID.PF_MINDBREAKER] = [
		"Mind Breaker",
		"Max Level: 5",
		"^CC3399Requirement: Increase SP Recovery 3,",
		"Soul Burn 2^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Induce mental turmoil in an enemy",
		"that will reduce its Magic Defense, but will",
		"also increases its Magic Attack Power. This",
		"skill's level affects its rate of success.^000000",
		"Changes to Targeted Enemy by Skill Level:",
		"[Lv 1]: ^777777Matk +20%, Mdef -12%^000000",
		"[Lv 2]: ^777777Matk +40%, Mdef -24%^000000",
		"[Lv 3]: ^777777Matk +60%, Mdef -36%^000000",
		"[Lv 4]: ^777777Matk +80%, Mdef -48%^000000",
		"[Lv 5]: ^777777Matk +100%, Mdef -60%^000000"
	].join("\n");

	SkillDescription[SKID.PF_MEMORIZE] = [
		"Memorize",
		"Max Level: 1",
		"^CC3399Requirement: Advanced Book 5, Auto Spell 1,",
		"Free Cast 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Reduce cast time for a skill by",
		"half for 5 casts. This skill is canceled when",
		"caster dies, but otherwise it has no duration.",
		"Memorize's cast time, which is unaffected by",
		"DEX, is 5 seconds.^000000"
	].join("\n");

	SkillDescription[SKID.PF_FOGWALL] = [
		"Wall of Fog",
		"Max Level: 1",
		"^CC3399Requirement: Violent Gale 2, Deluge 2^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Create a wall of fog in a 5*3 cell",
		"area that will cause the Blind status on players",
		"and monsters. All long ranged attacks targeted",
		"at players within the skill's range will have",
		"a greater chance of missing and have reduced",
		"damage. Negative effects only apply to",
		"monsters in normal fields, but will also apply",
		"to players in PvP zones.^000000"
	].join("\n");

	SkillDescription[SKID.PF_SPIDERWEB] = [
		"Spider Web",
		"Max Level: 1",
		"^CC3399Requirement: Dragonology 4^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Shoot a spider web that will bind",
		"and immobilize a target, and decrease its Flee",
		"Rate by half for 8 seconds. Fire property",
		"attacks will cause 2.5 times more damage on",
		"Fiber Locked targets and cancel the Fiber",
		"Locked status. A maximum of 2 Spider Webs",
		"can be shot at once.",
		"Each cast requires 1 ^00BB00Cobweb^777777.^000000"
	].join("\n");

	SkillDescription[SKID.ASC_METEORASSAULT] = [
		"Meteor Assault",
		"Max Level: 10",
		"^CC3399Requirement: Katar Mastery 5,",
		"Righthand Mastery 3, Sonic Blow 5,",
		"Soul Destroyer 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Damage all enemies in a 5*5 cell",
		"area around the caster with the chance of",
		"causing status such as ^702180Stun^777777, ^702180Blind^777777 or ^702180Bleed^777777.^000000",
		"[Lv 1]: ^77777780% ATK^000000",
		"[Lv 2]: ^777777120% ATK^000000",
		"[Lv 3]: ^777777160% ATK^000000",
		"[Lv 4]: ^777777200% ATK^000000",
		"[Lv 5]: ^777777240% ATK^000000",
		"[Lv 6]: ^777777280% ATK^000000",
		"[Lv 7]: ^777777320% ATK^000000",
		"[Lv 8]: ^777777360% ATK^000000",
		"[Lv 9]: ^777777400% ATK^000000",
		"[Lv 10]: ^777777440% ATK^000000"
	].join("\n");

	SkillDescription[SKID.ASC_CDP] = [
		"Create Deadly Poison",
		"Max Level: 1",
		"^CC3399Requirement: Envenom 10, Detoxify 1,",
		"Enchant Poison 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Create a bottle of Deadly Poison",
		"that will increase the Attack Speed of Assassin",
		"Crosses with the risk of being inflicted with",
		"the Poison status, but will instantly kill",
		"characters in any other job if they drink it.",
		"Caster's DEX and LUK affect this skill's",
		"success rate. If this skill fails, the caster",
		"loses an amount of HP equal to 25% of",
		"his Max HP.",
		"Items Required to create Deadly Poison:^777777",
		"1 ^702180Empty Bottle^777777",
		"1 ^702180Poison Spore^777777",
		"1 ^702180Venom Canine^777777",
		"1 ^702180Bee Sting^777777",
		"1 ^702180Cactus Needle^777777",
		"1 ^702180Berserk Potion^777777",
		"1 ^702180Karvodailnirol^000000"
	].join("\n");

	SkillDescription[SKID.WE_BABY] = [
		"Mom, Dad, I love you!",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Caster's parents will not lose any",
		"experience points if they die within this",
		"skill's 2 minute duration. Each cast consumes",
		"an amount of SP equal to 10% of the caster's ",
		"Max SP.^000000"
	].join("\n");

	SkillDescription[SKID.WE_CALLPARENT] = [
		"Mom, Dad, I miss you!",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon parents to a spot that is",
		"adjacent to caster's current location.^000000"
	].join("\n");

	SkillDescription[SKID.WE_CALLBABY] = [
		"Come to me, honey~",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Parent summons adopted child to a",
		"spot adjacent to the parent's current location.^000000"
	].join("\n");

	SkillDescription[SKID.TK_RUN] = [
		"Sprint",
		"Max Level: 10",
		"Skill Form: ^777777Movement^000000",
		"Description: ^777777Enable the caster to run with",
		"incredible speed. At levels 7 and above, this",
		"skill endows the caster with the ^FFFFFFSpurt status^777777,",
		"which will temporarily increase STR for 150",
		"seconds, if the caster stops running and is",
		"barehanded. Spurt status is canceled if the",
		"caster equips a weapon. Each level of the",
		"Run skill increases its user's barehanded ",
		"damage by +10.^000000",
		"[Lv 1]: ^7777776 Sec Cast Time, 100 SP^000000",
		"[Lv 2]: ^7777775 Sec Cast Time, 90 SP^000000",
		"[Lv 3]: ^7777774 Sec Cast Time, 80 SP^000000",
		"[Lv 4]: ^7777773 Sec Cast Time, 70 SP^000000",
		"[Lv 5]: ^7777772 Sec Cast Time, 60 SP^000000",
		"[Lv 6]: ^7777771 Sec Cast Time, 50 SP^000000",
		"[Lv 7]: ^7777770 Sec Cast Time, 40 SP^000000",
		"[Lv 8]: ^7777770 Sec Cast Time, 30 SP^000000",
		"[Lv 9]: ^7777770 Sec Cast Time, 20 SP^000000",
		"[Lv 10]: ^7777770 Sec Cast Time, 10 SP^000000"
	].join("\n");

	SkillDescription[SKID.TK_READYSTORM] = [
		"Tornado Stance",
		"Max Level: 1",
		"^CC3399Requirement: Tornado Kick 1^000000",
		"Skill Form: ^777777Stance^000000",
		"Description: ^777777Enable a 15% chance of automatically",
		"entering Tornado Stance when the caster",
		"successfully hits a target.^000000",
		"^FF0000Soul Linkers cannot perform this skill.^000000",
		"[Lv 1]: ^7777770 Sec Cast Time, 1 SP^000000"
	].join("\n");

	SkillDescription[SKID.TK_STORMKICK] = [
		"Tornado Kick",
		"Max Level: 7",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Caster must be in ^00BB00Tornado Stance^777777to",
		"perform this skill which will attack all enemies",
		"within a 5*5 cell area around the caster.^000000",
		"^FF0000Soul Linkers cannot perform this skill.^000000",
		"[Lv 1]: ^77777714 SP, 180% ATK^000000",
		"[Lv 2]: ^77777712 SP, 200% ATK^000000",
		"[Lv 3]: ^77777710 SP, 220% ATK^000000",
		"[Lv 4]: ^7777778 SP, 240% ATK^000000",
		"[Lv 5]: ^7777776 SP, 260% ATK^000000",
		"[Lv 6]: ^7777774 SP, 280% ATK^000000",
		"[Lv 7]: ^7777772 SP, 300% ATK^000000"
	].join("\n");

	SkillDescription[SKID.TK_READYDOWN] = [
		"Heel Drop Stance",
		"Max Level: 1",
		"^CC3399Requirement: Heel Drop 1^000000",
		"Skill Form: ^777777Stance^000000",
		"Description: ^777777Enable a 15% chance of automatically",
		"entering Heel Drop Stance when the caster",
		"successfully hits a target.",
		"^FF0000Soul Linkers cannot perform this skill.^000000",
		"[Lv 1]: ^7777770 Sec Cast Time, 1 SP^000000"
	].join("\n");

	SkillDescription[SKID.TK_DOWNKICK] = [
		"Heel Drop",
		"Max Level: 7",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Caster must be in ^00BB00Heel Drop Stance^777777to",
		"perform this skill which will inflict damage",
		"and cause the Stun effect for 3 seconds on the",
		"targeted enemy.^000000",
		"^FF0000Soul Linkers cannot perform this skill.^000000",
		"[Lv 1]: ^77777714 SP, 180% ATK^000000",
		"[Lv 2]: ^77777712 SP, 200% ATK^000000",
		"[Lv 3]: ^77777710 SP, 220% ATK^000000",
		"[Lv 4]: ^7777778 SP, 240% ATK^000000",
		"[Lv 5]: ^7777776 SP, 260% ATK^000000",
		"[Lv 6]: ^7777774 SP, 280% ATK^000000",
		"[Lv 7]: ^7777772 SP, 300% ATK^000000"
	].join("\n");

	SkillDescription[SKID.TK_READYTURN] = [
		"Roundhouse Stance",
		"Max Level: 1",
		"^CC3399Requirement: Roundhouse 1^00000",
		"Skill Form: ^777777Stance^000000",
		"Description: ^777777Enable a 15% chance of automatically",
		"entering Roundhouse Stance when the caster",
		"successfully hits a target.",
		"^FF0000Soul Linkers cannot perform this skill.^000000",
		"[Lv 1]: ^7777770 Sec Cast Time, 1 SP^000000"
	].join("\n");

	SkillDescription[SKID.TK_TURNKICK] = [
		"Roundhouse Kick",
		"Max Level: 7",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Caster must be in ^00BB00Roundhouse Stance^777777to",
		"perform this skill which will damage its target",
		"and and push back enemies around the target.",
		"Enemies that are pushed do not receive any",
		"damage.^000000",
		"^FF0000Soul Linkers cannot perform this skill.^000000",
		"[Lv 1]: ^77777714 SP, 220% ATK^000000",
		"[Lv 2]: ^77777712 SP, 250% ATK^000000",
		"[Lv 3]: ^77777710 SP, 280% ATK^000000",
		"[Lv 4]: ^7777778 SP, 310% ATK^000000",
		"[Lv 5]: ^7777776 SP, 340% ATK^000000",
		"[Lv 6]: ^7777774 SP, 370% ATK^000000",
		"[Lv 7]: ^7777772 SP, 400% ATK^000000"
	].join("\n");

	SkillDescription[SKID.TK_READYCOUNTER] = [
		"Counter Kick Stance",
		"Max Level: 1",
		"^CC3399Requirement: Counter Kick 1^000000",
		"Skill Form: ^777777Stance^000000",
		"Description: ^777777Enable a 20% chance of automatically",
		"entering ^00BB00Counter Kick Stance^777777when the caster",
		"successfully hits a target.",
		"^FF0000Soul Linkers cannot perform this skill.^000000",
		"[Lv 1]: ^7777770 Sec Cast Time, 1 SP^000000"
	].join("\n");

	SkillDescription[SKID.TK_COUNTER] = [
		"Counter Kick",
		"Max Level: 7",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Caster must be in Counter Kick",
		"Stance to perform this skill which will always",
		"hit its target.^000000",
		"^FF0000Soul Linkers cannot perform this skill.^000000",
		"[Lv 1]: ^77777714 SP, 220% ATK^000000",
		"[Lv 2]: ^77777712 SP, 250% ATK^000000",
		"[Lv 3]: ^77777710 SP, 280% ATK^000000",
		"[Lv 4]: ^7777778 SP, 310% ATK^000000",
		"[Lv 5]: ^7777776 SP, 340% ATK^000000",
		"[Lv 6]: ^7777774 SP, 370% ATK^000000",
		"[Lv 7]: ^7777772 SP, 400% ATK^0000000"
	].join("\n");

	SkillDescription[SKID.TK_DODGE] = [
		"Tumbling",
		"Max Level: 1",
		"^CC3399Requirement: Flying Kick 7^000000",
		"Skill Form: ^777777Stance^000000",
		"Description: ^777777Enable a 20% chance of blocking",
		"long ranged physical attacks. When caster is in",
		"Spurt status (after performing Lv 7 Sprint or",
		"higher), Tumbling will also block other kinds",
		"of attacks.^000000",
		"[Lv 1]: ^7777770 Sec Cast Time, 1 SP^000000"
	].join("\n");

	SkillDescription[SKID.TK_JUMPKICK] = [
		"Flying Kick",
		"Max Level: 7",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Attack a distant enemy with a kick",
		"that instantly close the gap between the target",
		"and the player. When in Tumbling status, the",
		"caster's Base Level affects the amount of",
		"inflicted damage.  Flying Kick will have",
		"increased damage affected by Base Level during",
		"Sprint status. If Spurt and Sprint statuses are",
		"both active, Flying Kick will inflict enhanced",
		"damage. Flying Kick will also cancel most",
		"positive statuses on the target, which include",
		"Spirit statuses endowed by Soul Linkers, One",
		"Hand Quicken, Kaahi, Kaite, and the Berserk",
		"Potion effect. However, Stalkers can protect",
		"themselves from this positive status removal",
		"effect with their Preserve skill.",
		"^FF0000Soul Linkers cannot perform this skill.^000000",
		"[Lv 1]: ^77777770 SP, 40% ATK^000000",
		"[Lv 2]: ^77777760 SP, 50% ATK^000000",
		"[Lv 3]: ^77777750 SP, 60% ATK^000000",
		"[Lv 4]: ^77777740 SP, 70% ATK^000000",
		"[Lv 5]: ^77777730 SP, 80% ATK^000000",
		"[Lv 6]: ^77777720 SP, 90% ATK^000000",
		"[Lv 7]: ^77777710 SP, 100% ATK^000000"
	].join("\n");

	SkillDescription[SKID.TK_HPTIME] = [
		"Peaceful Break",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777When two or more Taekwon Class",
		"characters sit next to each other, HP will be",
		"restored for both characters. This HP",
		"restoration is affected by VIT and enhanced by",
		"an additional 30 HP with the /doridori command.^000000",
		"[Lv 1]: ^777777HP +30^000000",
		"[Lv 2]: ^777777HP +60^000000",
		"[Lv 3]: ^777777HP +90^000000",
		"[Lv 4]: ^777777HP +120^000000",
		"[Lv 5]: ^777777HP +150^000000",
		"[Lv 6]: ^777777HP +180^000000",
		"[Lv 7]: ^777777HP +210^000000",
		"[Lv 8]: ^777777HP +240^000000",
		"[Lv 9]: ^777777HP +270^000000",
		"[Lv 10]: ^777777HP +300^000000"
	].join("\n");

	SkillDescription[SKID.TK_SPTIME] = [
		"Happy Break",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777When two or more Taekwon Class",
		"characters sit next to each other, SP will be",
		"restored for both characters. This SP",
		"restoration is affected by Max SP and enhanced",
		"by an additional 3 SP with the /doridori command.",
		"Using the /doridori command while in Happy Break",
		"status will make it last for 30 minutes. During",
		"this status, the caster will have a low chance",
		"of using the Earth Spike spell scroll, with a",
		"10% chance at Skill Level 1, and a 1% chance at",
		"Skill Level 10. Using the Earth Spike scroll",
		"during this status will consume 10 SP.^000000",
		"[Lv 1]: ^777777SP +3^000000",
		"[Lv 2]: ^777777SP +6^000000",
		"[Lv 3]: ^777777SP +9^000000",
		"[Lv 4]: ^777777SP +12^000000",
		"[Lv 5]: ^777777SP +15^000000",
		"[Lv 6]: ^777777SP +18^000000",
		"[Lv 7]: ^777777SP +21^000000",
		"[Lv 8]: ^777777SP +24^000000",
		"[Lv 9]: ^777777SP +27^000000",
		"[Lv 10]: ^777777SP +30^000000"
	].join("\n");

	SkillDescription[SKID.TK_POWER] = [
		"Kihop",
		"Max Level: 5",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase Attack Power based on the",
		"number of Party Members on the same map. Normal",
		"attacks, and ^777777skills with 500% power,",
		"inflict an amount of additional according to",
		"the skill's level.^000000",
		"Additional Damage by Level",
		"[Lv 1]: ^777777+(Party Member*2%)^000000",
		"[Lv 2]: ^777777+(Party Member*4%)^000000",
		"[Lv 3]: ^777777+(Party Member*6%)^000000",
		"[Lv 4]: ^777777+(Party Member*8%)^000000",
		"[Lv 5]: ^777777+(Party Member*10%)^000000"
	].join("\n");

	SkillDescription[SKID.TK_SEVENWIND] = [
		"Mild Wind",
		"Max Level: 7",
		"^CC3399Requirement: Peaceful Break 5,",
		"Happy Break 5, Kihop 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon a wind that will enchant",
		"the caster's attacks for 5 minutes with an",
		"elemental property based on the level of the",
		"cast skill.^000000",
		"SP Consumption and Property by Skill Level",
		"[Lv 1]: ^777777Earth (20 SP)^000000",
		"[Lv 2]: ^777777Wind (20 SP)^000000",
		"[Lv 3]: ^777777Water (20 SP)^000000",
		"[Lv 4]: ^777777Fire (20 SP)^000000",
		"[Lv 5]: ^777777Ghost (50 SP)^000000",
		"[Lv 6]: ^777777Shadow (50 SP)^000000",
		"[Lv 7]: ^777777Holy (50 SP)^000000"
	].join("\n");

	SkillDescription[SKID.TK_HIGHJUMP] = [
		"Leap",
		"Max Level: 5",
		"Skill Form: ^777777Movement^000000",
		"Description: ^777777Leap to a targeted cell within the",
		"skill's range. So long as the targeted cell is",
		"not dead or inaccesibble, the caster can leap",
		"over walls and obstacles. Leap cannot be used",
		"in areas where Fly Wings are disabled, except",
		"for WoE (Guild War) maps.^000000",
		"Cast Time & Skill Range by Level",
		"[Lv 1]: ^7777775 sec, 2 cells^000000",
		"[Lv 2]: ^7777774 sec, 4 cells^000000",
		"[Lv 3]: ^7777773 sec, 6 cells^000000",
		"[Lv 4]: ^7777772 sec, 8 cells^000000",
		"[Lv 5]: ^7777771 sec, 10 cells^000000"
	].join("\n");

	SkillDescription[SKID.SG_FEEL] = [
		"Solar, Lunar and Stellar Perception",
		"Max Level: 3",
		"Skill Form: ^777777Designation^000000",
		"Description: ^777777Designate the current map with one",
		"of the cosmic alignments, Solar, Lunar or",
		"Stellar, for the use of certain skills. It is",
		"impossible to change a map's cosmic alignment",
		"once it is designated. Using this skill on a",
		"cosmically aligned map will display a list of",
		"map designations.^FF0000",
		"Only 1 map may be designated for each cosmic",
		"alignment.^000000",
		"[Lv 1]: ^777777Designate current map with",
		"Solar alignment^000000",
		"[Lv 2]: ^777777Designate current map with",
		"Lunar alignment^000000",
		"[Lv 3]: ^777777Designate current map with",
		"Stellar alignment^000000"
	].join("\n");

	SkillDescription[SKID.SG_SUN_WARM] = [
		"Solar Heat",
		"Max Level: 3",
		"^CC3399Requirement: Solar,",
		"Lunar and Stellar Perception 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777This skill is only enabled in ^00BB00Solar",
		"areas^777777. Inflict damage, drain 2 SP and push back",
		"monsters around the caster. On other players,",
		"this skill will only have the push back effect",
		"and continuously drain SP.",
		"SP Consumption & Duration By Level",
		"[Lv 1]: ^77777720 SP, 10 sec^000000",
		"[Lv 2]: ^77777720 SP, 20 sec^000000",
		"[Lv 3]: ^77777720 SP, 60 sec^000000"
	].join("\n");

	SkillDescription[SKID.SG_MOON_WARM] = [
		"Lunar Heat",
		"Max Level: 3",
		"^CC3399Requirement: Solar,",
		"Lunar and Stellar Perception 2^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777This skill is only enabled in ^00BB00Lunar",
		"areas^777777. Inflict damage, drain 2 SP and push back",
		"monsters around the caster. On other players,",
		"this skill will only have the push back effect",
		"and continuously drain SP.",
		"SP Consumption & Cast Time By Level",
		"[Lv 1]: ^77777720 SP, 10 sec^000000",
		"[Lv 2]: ^77777720 SP, 20 sec^000000",
		"[Lv 3]: ^77777720 SP, 60 sec^000000"
	].join("\n");

	SkillDescription[SKID.SG_STAR_WARM] = [
		"Stellar Heat",
		"Max Level: 3",
		"^CC3399Requirement: Solar,",
		"Lunar and Stellar Perception 3^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777This skill is only enabled in",
		"^00BB00Stellar areas^777777. Inflict damage, drain 2 SP and",
		"push back monsters around the caster. On other",
		"players, this skill will only have the push",
		"back effect and continuously drain SP.",
		"SP Consumption & Cast Time By Level",
		"[Lv 1]: ^77777710 SP, 10 sec^000000",
		"[Lv 2]: ^77777710 SP, 20 sec^000000",
		"[Lv 3]: ^77777710 SP, 60 sec^000000"
	].join("\n");

	SkillDescription[SKID.SG_SUN_COMFORT] = [
		"Solar Protection",
		"Max Level: 4",
		"^CC3399Requirement: Solar, Lunar and",
		"Stellar Perception 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777This skill is only enabled on ^00BB00Solar",
		"(even numbered) days^777777in a ^00BB00Solar aligned map^777777.",
		"Reduces damage from enemies by a set amount",
		"calculated by this formula:",
		"(Base Level + DEX + LUK)/2",
		"SP Consumption & Duration by Level",
		"[Lv 1]: ^77777770 SP, 80 sec^000000",
		"[Lv 2]: ^77777760 SP, 160 sec^000000",
		"[Lv 3]: ^77777750 SP, 240 sec^000000",
		"[Lv 4]: ^77777740 SP, 320 sec^000000"
	].join("\n");

	SkillDescription[SKID.SG_MOON_COMFORT] = [
		"Lunar Protection",
		"Max Level: 4",
		"^CC3399Requirement: Solar, Lunar and",
		"Stellar Perception 2^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777This skill is only enabled on ^00BB00Lunar",
		"(odd numbered) days^777777in a ^00BB00Lunar aligned map^777777.",
		"Increases Flee Rate by a set amount that can be",
		"calculated by this formula:",
		"(Base Level + DEX + LUK)/10%",
		"SP Consumption & Duration by Level",
		"[Lv 1]: ^77777770 SP, 80 sec^000000",
		"[Lv 2]: ^77777760 SP, 160 sec^000000",
		"[Lv 3]: ^77777750 SP, 240 sec^000000",
		"[Lv 4]: ^77777740 SP, 320 sec^000000"
	].join("\n");

	SkillDescription[SKID.SG_STAR_COMFORT] = [
		"Stellar Protection",
		"Max Level: 4",
		"^CC3399Requirement: Solar, Lunar and",
		"Stellar Perception 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777This skill is only enabled on",
		"^00BB00Stellar (multiple of five) days^777777in a",
		"^00BB00Stellar aligned map^777777.",
		"Increases Attack Speed by a set amount that can",
		"be calculated by this formula:",
		"(Base Level + DEX + LUK)/10%",
		"SP Consumption & Duration by Level",
		"[Lv 1]: ^77777770 SP, 80 sec^000000",
		"[Lv 2]: ^77777760 SP, 160 sec^000000",
		"[Lv 3]: ^77777750 SP, 240 sec^000000",
		"[Lv 4]: ^77777740 SP, 320 sec^000000"
	].join("\n");

	SkillDescription[SKID.SG_HATE] = [
		"Solar, Lunar and Stellar Opposition",
		"Max Level: 3",
		"Skill Form: ^777777Designation^000000",
		"Description: ^777777Designate the targeted monster with",
		"one of the cosmic alignments, Solar, Lunar or",
		"Stellar, for the use of certain skills. It is",
		"impossible to change a monster's cosmic",
		"alignment once it is designated. Using this",
		"skill on a cosmically aligned monster will",
		"display a list of monster designations.^000000",
		"^FF0000Only 1 monster can be designated for each",
		"cosmic alignment.^000000",
		"[Lv 1]: ^777777Designate monster with Solar alignment.",
		" Limited to Small sized monsters.^000000",
		"[Lv 2]: ^777777Designate monster with Lunar alignment.",
		" Limited to Medium sized monsters with Max HP",
		" of 6,000 or more.^000000",
		"[Lv 3]: ^777777Designate monster with Stellar alignment.",
		" Limited to Large sized monsters with Max HP",
		" of 20,000 or more. On players, character jobs",
		" can be designated without regarding size and",
		" Max HP.^000000"
	].join("\n");

	SkillDescription[SKID.SG_SUN_ANGER] = [
		"Solar Wrath",
		"Max Level: 3",
		"^CC3399Requirement: Solar,",
		"Lunar and Stellar Opposition 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase Attack Power against",
		"Solar aligned monsters. Character's Base",
		"Level, LUK, DEX and skill's level affect",
		"this damage increase.^000000"
	].join("\n");

	SkillDescription[SKID.SG_MOON_ANGER] = [
		"Lunar Wrath",
		"Max Level: 3",
		"^CC3399Requirement: Solar,",
		"Lunar and Stellar Opposition 2^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase Attack Power against Lunar",
		"aligned monsters. Character's Base Level,",
		"LUK, DEX and skill's level affect this",
		"damage increase.^000000"
	].join("\n");

	SkillDescription[SKID.SG_STAR_ANGER] = [
		"Stellar Wrath",
		"Max Level: 3",
		"^CC3399Requirement: Solar, Lunar,",
		"and Stellar Opposition 3^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase Attack Power against",
		"Stellar aligned monsters. Character's Base",
		"Level, LUK, DEX, STR and skill's level affect",
		"this damage increase.^000000"
	].join("\n");

	SkillDescription[SKID.SG_SUN_BLESS] = [
		"Solar Blessings",
		"Max Level: 5",
		"^CC3399Requirement: Solar, Lunar and",
		"Stellar Perception 1, Solar, Lunar,",
		"and Stellar Opposition 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase the EXP reward from",
		"defeating Solar aligned monsters on Solar",
		"(even numbered) days.^000000",
		"[Lv 1]: ^777777EXP +10%^000000",
		"[Lv 2]: ^777777EXP +20%^000000",
		"[Lv 3]: ^777777EXP +30%^000000",
		"[Lv 4]: ^777777EXP +40%^000000",
		"[Lv 5]: ^777777EXP +50%^000000"
	].join("\n");

	SkillDescription[SKID.SG_MOON_BLESS] = [
		"Lunar Blessings",
		"Max Level: 5",
		"^CC3399Requirement: Solar, Lunar and",
		"Stellar Perception 2, Solar, Lunar,",
		"and Stellar Opposition 2^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase the EXP reward from",
		"defeating Lunar aligned monsters on Lunar",
		"(odd numbered) days.^000000",
		"[Lv 1]: ^777777EXP +10%^000000",
		"[Lv 2]: ^777777EXP +20%^000000",
		"[Lv 3]: ^777777EXP +30%^000000",
		"[Lv 4]: ^777777EXP +40%^000000",
		"[Lv 5]: ^777777EXP +50%^000000"
	].join("\n");

	SkillDescription[SKID.SG_STAR_BLESS] = [
		"Stellar Blessings",
		"Max Level: 5",
		"^CC3399Requirement: Solar, Lunar and",
		"Stellar Perception 3, Solar, Lunar,",
		"and Stellar Opposition 3^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase the EXP reward from",
		"defeating Stellar aligned monsters on Stellar",
		"(multiple of five) days.^000000",
		"[Lv 1]: ^777777EXP +20%^000000",
		"[Lv 2]: ^777777EXP +40%^000000",
		"[Lv 3]: ^777777EXP +60%^000000",
		"[Lv 4]: ^777777EXP +80%^000000",
		"[Lv 5]: ^777777EXP +100%^000000"
	].join("\n");

	SkillDescription[SKID.SG_DEVIL] = [
		"Solar, Lunar and Stellar Shadow",
		"Max Level: 10",
		"^CC3399Requirement: Job Level 50^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777This skill's effects will only",
		"activate for Job Level 50 characters. Increasing",
		"this skills' level will permanently increase",
		"Attack Speed and reduce character's vision,",
		"similarly to the Blind effect. increase Attack",
		"Speed; at Job Level 50, this skill will",
		"permanently reduce sight, similarly to the",
		"Blind effect.^000000",
		"[Lv 1]: ^777777Aspd +3%^000000",
		"[Lv 2]: ^777777Aspd +6%^000000",
		"[Lv 3]: ^777777Aspd +9%^000000",
		"[Lv 4]: ^777777Aspd +12%^000000",
		"[Lv 5]: ^777777Aspd +15%^000000",
		"[Lv 6]: ^777777Aspd +18%^000000",
		"[Lv 7]: ^777777Aspd +21%^000000",
		"[Lv 8]: ^777777Aspd +24%^000000",
		"[Lv 9]: ^777777Aspd +27%^000000",
		"[Lv 10]: ^777777Aspd +30%^000000"
	].join("\n");

	SkillDescription[SKID.SG_FRIEND] = [
		"Solar, Lunar and Stellar Team-Up",
		"Max Level: 3",
		"Skill Form: ^6666ccPassive^000000",
		"Target: ^777777Monk Class Party Member^000000",
		"Description: ^777777Increase a Monk class character's",
		"chance of casting Triple Attack when using",
		"Counter Kick, while Monk's Combo Finish will",
		"increase the Taekwon Master's chance of casting",
		"Counter Kick.",
		"[Lv 1]: ^777777Chance +100%^000000",
		"[Lv 2]: ^777777Chance +150%^000000",
		"[Lv 3]: ^777777Chance +200%^000000"
	].join("\n");

	SkillDescription[SKID.SG_KNOWLEDGE] = [
		"Solar, Lunar and Stellar Courier ",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"If using Taekwon Master designation",
		"skills such as Solar, Lunar and Stellar",
		"Perception and Solar, Lunar and Stellar",
		"Opposition is too confusing, you can allocate",
		"Skill Points to Taekwon Boy or Girl Job skills",
		"instead.",
		"Description: ^777777Increase Maximum Weight Limit when",
		"in Solar, Lunar and Stellar areas. The effect",
		"of this skill is^FFFFFF ^777777canceled when",
		"its user leaves the Solar, Lunar or Stellar",
		"designated area.^000000",
		"[Lv 1]: ^777777Maximum Weight +10%^000000",
		"[Lv 2]: ^777777Maximum Weight +20%^000000",
		"[Lv 3]: ^777777Maximum Weight +30%^000000",
		"[Lv 4]: ^777777Maximum Weight +40%^000000",
		"[Lv 5]: ^777777Maximum Weight +50%^000000",
		"[Lv 6]: ^777777Maximum Weight +60%^000000",
		"[Lv 7]: ^777777Maximum Weight +70%^000000",
		"[Lv 8]: ^777777Maximum Weight +80%^000000",
		"[Lv 9]: ^777777Maximum Weight +90%^000000",
		"[Lv 10]: ^777777Maximum Weight +100%^000000"
	].join("\n");

	SkillDescription[SKID.SG_FUSION] = [
		"Solar, Lunar and Stellar Union ",
		"^CC3399Requirement: Solar, Lunar, and",
		"Stellar Courier 9, Sprit State^000000",
		"Skill Form: ^777777Awakening^000000",
		"Description: ^777777Awaken the caster's hidden",
		"potential for 10 minutes while in a spirit",
		"status, endowing the caster with attacks that",
		"have 100% Accuracy and will ignore enemy's",
		"Defense, and increased Movement Speed. However,",
		"2% of caster's HP will be drained with each",
		"attack on monsters and 8% will be drained with",
		"each attack on other players. In this status,",
		"attacking when the caster's remaining HP is",
		"less that 20% of Max HP will instantly kill the",
		"caster. Caster's remaining HP is less that",
		"20% of Max HP instantly kill the caster.^000000"
	].join("\n");

	SkillDescription[SKID.SL_ALCHEMIST] = [
		"Alchemist Spirit",
		"Max Level: 5",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon the spirit of history's",
		"greatest Alchemist and temporarily endow its",
		"powers upon a targeted Alchemist, enhancing",
		"that Alchemist's Potion Pitcher skill, which is",
		"affected by Base Level, and enabling the use",
		"of the Berserk Pitcher and the Twilight",
		"Pharmacy skills.^000000",
		"SP Consumption & Duration by Level",
		"[Lv 1]: ^777777460 SP, 150 sec^000000",
		"[Lv 2]: ^777777360 SP, 200 sec^000000",
		"[Lv 3]: ^777777260 SP, 250 sec^000000",
		"[Lv 4]: ^777777160 SP, 300 sec^000000",
		"[Lv 5]: ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.AM_BERSERKPITCHER] = [
		"Berserk Pitcher",
		"^CC3399Requirement: Spirit State^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Force the imbibing of Berserk",
		"Potions upon any job class. However, the",
		"duration of the increase in Attack Speed from",
		"this skill lasts only half as long as the",
		"Berserk Potion item.",
		"Each cast requires 2 ^00BB00Berserk Potions^777777.^000000"
	].join("\n");

	SkillDescription[SKID.SL_MONK] = [
		"Monk Spirit",
		"Max Level: 5",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon the spirit of history's",
		"toughest Monk and temporarily endow its powers",
		"upon a targeted Monk, enhancing that Monk's",
		"Combo Finish skill so that it inflicts",
		"splashed damage on enemies within a 5*5 cell",
		"area. Monk Spirit also enables Monks to use",
		"combo skills with reduced SP consumption and to",
		"restore SP during Explosion Spirits status.^000000",
		"SP Consumption & Duration by Level",
		"[Lv 1]: ^777777460 SP, 150 sec^000000",
		"[Lv 2]: ^777777360 SP, 200 sec^000000",
		"[Lv 3]: ^777777260 SP, 250 sec^000000",
		"[Lv 4]: ^777777160 SP, 300 sec^000000",
		"[Lv 5]: ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_STAR] = [
		"Taekwon Master Spirit",
		"Max Level: 5",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon the spirit of history's",
		"greatest Taekwon Master and temporarily endow",
		"its power upon a targeted Taekwon Master,",
		"enabling Taekwon Master to use Solar, Lunar",
		"and Stellar Union skill.^000000",
		"SP Consumption & Duration by Level",
		"[Lv 1]: ^777777460 SP, 150 sec^000000",
		"[Lv 2]: ^777777360 SP, 200 sec^000000",
		"[Lv 3]: ^777777260 SP, 250 sec^000000",
		"[Lv 4]: ^777777160 SP, 300 sec^000000",
		"[Lv 5]: ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_SAGE] = [
		"Sage Spirit",
		"Max Level: 5",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon the spirit of history's",
		"greatest Sage and temporarily endow its",
		"abilities upon a targeted Sage, enhancing that",
		"Sage's Auto Spell skill so that it casts the",
		"highest level Bolt skills.^000000",
		"SP Consumption & Duration by Level",
		"[Lv 1]: ^777777460 SP, 150 sec^000000",
		"[Lv 2]: ^777777360 SP, 200 sec^000000",
		"[Lv 3]: ^777777260 SP, 250 sec^000000",
		"[Lv 4]: ^777777160 SP, 300 sec^000000",
		"[Lv 5]: ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_CRUSADER] = [
		"Crusader Spirit",
		"Max Level: 5",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon the spirit of history's",
		"bravest Crusader and temporarily endow its",
		"abilities on a targeted Crusader. For the",
		"skill's duration, the Crusader skill, Shield",
		"Boomerang, will have double damage and never",
		"miss its target.",
		"SP Consumption & Duration by Level",
		"[Lv 1]: ^777777460 SP, 150 sec^000000",
		"[Lv 2]: ^777777360 SP, 200 sec^000000",
		"[Lv 3]: ^777777260 SP, 250 sec^000000",
		"[Lv 4]: ^777777160 SP, 300 sec^000000",
		"[Lv 5]: ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_SUPERNOVICE] = [
		"Super Novice Spirit",
		"^CC3399Requirement: Taekwon Master Spirit 1^000000",
		"Max Level: 5",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon the spirit of history's",
		"awesomest Super Novice and temporarily endow",
		"its abilities on the Super Novice targeted by",
		"this skill. For the skill's duration, Super",
		"Novices have a low chance of summoning a",
		"Guardian Angel that will erase their previous",
		"death record. Super Novices at Base Level 90",
		"and above can any headgear regardless of",
		"location, and at Base Level 96 and above, they",
		"can equip certain Level 4 Weapons, such as One",
		"Handed Swords, Maces Axes, Staffs and Daggers.",
		"SP Consumption & Duration by Level",
		"[Lv 1]: ^777777460 SP, 150 sec^000000",
		"[Lv 2]: ^777777360 SP, 200 sec^000000",
		"[Lv 3]: ^777777260 SP, 250 sec^000000",
		"[Lv 4]: ^777777160 SP, 300 sec^000000",
		"[Lv 5]: ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_KNIGHT] = [
		"Knight Spirit",
		"Max Level: 5",
		"^CC3399Requirement: Crusader Spirit 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon the spirit of history's most",
		"chivalrous Knight and endow its abilities upon",
		"the Knight targeted by this skill. For the",
		"skill's duration, the use of One Hand Quicken",
		"will be enabled if the Two Hand Quicken skill",
		"is mastered.",
		"SP Consumption & Duration by Level",
		"[Lv 1]: ^777777460 SP, 150 sec^000000",
		"[Lv 2]: ^777777360 SP, 200 sec^000000",
		"[Lv 3]: ^777777260 SP, 250 sec^000000",
		"[Lv 4]: ^777777160 SP, 300 sec^000000",
		"[Lv 5]: ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_WIZARD] = [
		"Wizard Spirit",
		"Max Level: 5",
		"^CC3399Requirement: Sage Spirit 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon the spirit of history's most",
		"powerful Wizard and endow its abilities upon the",
		"Wizard targeted by this skill. For the skill's",
		"duration, the targeted Wizard can use certain",
		"skills without consuming Gemstones.",
		"SP Consumption & Duration by Level",
		"[Lv 1]: ^777777460 SP, 150 sec^000000",
		"[Lv 2]: ^777777360 SP, 200 sec^000000",
		"[Lv 3]: ^777777260 SP, 250 sec^000000",
		"[Lv 4]: ^777777160 SP, 300 sec^000000",
		"[Lv 5]: ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_PRIEST] = [
		"Priest Spirit",
		"Max Level: 5",
		"^CC3399Requirement: Monk Spirit 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon the spirit of history's most",
		"pious Priest and endow its abilities upon the",
		"Priest targeted by this skill. For the skill's",
		"duration, the targeted Priest's Holy Light skill",
		"will have its Attack Power and SP cost",
		"multiplied by five.^000000",
		"SP Consumption & Duration by Level",
		"[Lv 1]: ^777777460 SP, 150 sec^000000",
		"[Lv 2]: ^777777360 SP, 200 sec^000000",
		"[Lv 3]: ^777777260 SP, 250 sec^000000",
		"[Lv 4]: ^777777160 SP, 300 sec^000000",
		"[Lv 5]: ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_BARDDANCER] = [
		"Bard and Dancer Spirits",
		"Max Level: 5",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon the spirit of history's most",
		"artistic performer and endow its abilities upon",
		"the Bard or Dancer targeted by this skill. For",
		"the skill's duration, Bards and Dancers have",
		"increased Movement Speed, receive the same",
		"effect as Party Members when performing Play or",
		"Dance skills, and are able to combo skills with",
		"Whistle, Humming, Assassin Cross of Sunset,",
		"Forget Me Not, Magic Strings, Fortune's Kiss,",
		"Apple of Idun and Service For You.",
		"SP Consumption & Duration by Level",
		"[Lv 1]: ^777777460 SP, 150 sec^000000",
		"[Lv 2]: ^777777360 SP, 200 sec^000000",
		"[Lv 3]: ^777777260 SP, 250 sec^000000",
		"[Lv 4]: ^777777160 SP, 300 sec^000000",
		"[Lv 5]: ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_ROGUE] = [
		"Rogue Spirit",
		"Max Level: 5",
		"^CC3399Requirement: Assassin Spirit 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon the",
		"spirit of history's sneakiest Rogue and endow its abilities",
		"upon the Rogue targeted by this skill, enhancing",
		"Chase walk Movement Speed and STR increase.",
		"For this skill's duration, this Rogue will be",
		"unaffected by dispell skills and will receive",
		"more HP and SP from potions created by a Top",
		"Ten Rank Alchemist.",
		"SP Consumption & Duration by Level",
		"[Lv 1]: ^777777460 SP, 150 sec^000000",
		"[Lv 2]: ^777777360 SP, 200 sec^000000",
		"[Lv 3]: ^777777260 SP, 250 sec^000000",
		"[Lv 4]: ^777777160 SP, 300 sec^000000",
		"[Lv 5]: ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_ASSASIN] = [
		"Assassin Spirit",
		"Max Level: 5",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon the spirit of history's most",
		"mysterious Assassin and endow its abilities upon",
		"a targeted Assassin. For the skill's duration,",
		"Sonic Blow will have a 100% increase in damage",
		"and reduced cast delay.",
		"SP Consumption & Duration by Level",
		"[Lv 1]: ^777777460 SP, 150 sec^000000",
		"[Lv 2]: ^777777360 SP, 200 sec^000000",
		"[Lv 3]: ^777777260 SP, 250 sec^000000",
		"[Lv 4]: ^777777160 SP, 300 sec^000000",
		"[Lv 5]: ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_BLACKSMITH] = [
		"Blacksmith Spirit",
		"Max Level: 5",
		"^CC3399Requirement: Alchemist Spirit 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon the spirit of history's most",
		"proficient Blacksmith and endow its abilities",
		"upon a targeted Blacksmith. For the skill's",
		"duration, the use of Advanced Adrenaline Rush",
		"is enabled if the Blacksmith has mastered the",
		"Adrenaline Rush skill. Advanced Adrenaline Rush",
		"can be used on all weapons, except Bow Class",
		"Weapons, and cannot be used with skills with",
		"similar effects such as Two Hand Quicken,",
		"Adrenaline Rush, One Hand Quicken, Solar, Lunar",
		"and Stellar Shadow or Protection, Spear Quicken",
		"or Assassin Cross of Sunset.^000000",
		"SP Consumption & Duration by Level",
		"[Lv 1]: ^777777460 SP, 150 sec^000000",
		"[Lv 2]: ^777777360 SP, 200 sec^000000",
		"[Lv 3]: ^777777260 SP, 250 sec^000000",
		"[Lv 4]: ^777777160 SP, 300 sec^000000",
		"[Lv 5]: ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.BS_ADRENALINE2] = [
		"Full Adrenaline Rush",
		"^CC3399Requirement: Adrenaline Rush 5,",
		"Spirit State^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Increase the Attack Speed of every",
		"weapon class except for Bows. Cannot be",
		"used in conjunction with skills that have",
		"similar effects such as Adrenaline Rush,",
		"One Hand Quicken, Two Hand Quicken, Spear",
		"Quicken, Assassin Cross of Sunset, and Solar, Lunar",
		"and Stellar Shadow or Protection. has 150",
		"seconds duration.^000000"
	].join("\n");

	SkillDescription[SKID.SL_HUNTER] = [
		"Hunter Spirit",
		"Max Level: 5",
		"^CC3399Requirement: Bard and Dancer Spirit 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon the spirit of history's most",
		"popular Hunter and endow its abilities on a",
		"targeted Hunter, temporarily enhancing that",
		"Hunter's Beast Bane skill according to the",
		"Hunter's STR.^000000",
		"SP Consumption & Duration by Level",
		"[Lv 1]: ^777777460 SP, 150 sec^000000",
		"[Lv 2]: ^777777360 SP, 200 sec^000000",
		"[Lv 3]: ^777777260 SP, 250 sec^000000",
		"[Lv 4]: ^777777160 SP, 300 sec^000000",
		"[Lv 5]: ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_SOULLINKER] = [
		"Soul Linker Spirit",
		"Max Level: 5",
		"^CC3399Requirement: Taekwon Master Spirit 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Summon the spirit of history's most",
		"skilled Soul Linker and endow its abilities on",
		"a targeted Soul Linker, temporarily allowing",
		"the use of [Ka-] category skills on any",
		"character.",
		"SP Consumption & Duration by Level",
		"[Lv 1]: ^777777460 SP, 150 sec^000000",
		"[Lv 2]: ^777777360 SP, 200 sec^000000",
		"[Lv 3]: ^777777260 SP, 250 sec^000000",
		"[Lv 4]: ^777777160 SP, 300 sec^000000",
		"[Lv 5]: ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_KAIZEL] = [
		"Kaizel",
		"Max Level: 7",
		"^CC3399Requirement: Priest Spirit 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"[Ka-] Category: ^777777Can only be used on family",
		"members and other Soul Linkers^000000",
		"Description: ^777777Instantly revive a fallen character",
		"that will be in Kyrie Eleison status for",
		"3 seconds upon revival. This revival lasts for",
		"30 minutes and is cancelled by resurrecting the",
		"target. This skill is disabled during WoE.^000000",
		"Cast Time & HP Restored Upon Revival",
		"[Lv 1]: ^777777120 SP, 4.5 sec, 10% Max HP^000000",
		"[Lv 2]: ^777777110 SP, 4 sec, 20% Max HP^000000",
		"[Lv 3]: ^777777100 SP, 3.5 sec, 30% Max HP^000000",
		"[Lv 4]: ^77777790 SP, 3 sec, 40% Max HP^000000",
		"[Lv 5]: ^77777780 SP, 2.5 sec, 50% Max HP^000000",
		"[Lv 6]: ^77777770 SP, 2.5 sec, 60% Max HP^000000",
		"[Lv 7]: ^77777760 SP, 2.5 sec, 70% Max HP^000000"
	].join("\n");

	SkillDescription[SKID.SL_KAAHI] = [
		"Kaahi",
		"Max Level: 7",
		"^CC3399Requirement: Priest Spirit 1,",
		"Monk Spirit 1, Crusader Spirit 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"[Ka-] Category: ^777777Can only be used on family",
		"members and other Soul Linkers^000000",
		"Description: ^777777Consume a certain amount of SP to",
		"restore HP each time an enemy uses a normal",
		"attack.",
		"^000000SP Cost per attack: ^7777775~35^000000",
		"HP Regained: ^777777200~1,400^000000"
	].join("\n");

	SkillDescription[SKID.SL_KAUPE] = [
		"Kaupe",
		"Max Level: 3",
		"^CC3399Requirement: Assassin Spirit 1,",
		"Rogue Spirit 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"[Ka-] Category: ^777777Can only be used on family",
		"members and other Soul Linkers^000000",
		"Description: ^777777Kaupe status enables the chance of",
		"dodging a physical attack from an enemy and",
		"lasts until the 10 minute duration elapses or",
		"until character successfully dodges an attack.",
		"SP Consumption & Dodge Chance By Level",
		"[Lv 1]: ^77777720 SP, Dodge +33%^000000",
		"[Lv 2]: ^77777730 SP, Dodge +66%^000000",
		"[Lv 3]: ^77777740 SP, Dodge +100%^000000"
	].join("\n");

	SkillDescription[SKID.SL_KAITE] = [
		"Kaite",
		"^CC3399Requirement: Wizard Spirit 1,",
		"Sage Spirit 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"[Ka-] Category: ^777777Can only be used on family",
		"members and other Soul Linkers^000000",
		"Description: ^777777Reflect most magic spells back at",
		"the original caster. Reflected Healing spells",
		"will not heal the original caster. The magic",
		"spells of high level monsters cannot be",
		"reflected, although this skill has a 100%",
		"chance of reflecting spells from other players",
		"regardless of level.^000000",
		"[Lv 1]: ^7777771 Reflection 6 sec cast,",
		" 1 min duration^000000",
		"[Lv 2]: ^7777771 Reflection 5.5 sec cast,",
		" 2 min duration^000000",
		"[Lv 3]: ^7777771 Reflection 5 sec cast,",
		" 3 min duration^000000",
		"[Lv 4]: ^7777771 Reflection 4.5 sec cast,",
		" 4 min duration^000000",
		"[Lv 5]: ^7777772 Reflection 4 sec cast,",
		" 5 min duration^000000",
		"[Lv 6]: ^7777772 Reflection 3.5 sec cast,",
		" 6 min duration^000000",
		"[Lv 7]: ^7777772 Reflections 3 sec cast,",
		" 10 min duration^000000"
	].join("\n");

	SkillDescription[SKID.SL_KAINA] = [
		"Kaina",
		"Max Level: 7",
		"^CC3399Requirement: Happy Break 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase Max SP and enhance the",
		"efficiency of the Happy Break skill. At Base",
		"Level 70, this skill reduces the SP consumption",
		"of the Estin, Estun and Esma skills by 3% in",
		"proportion to the skill level of Kaina. At Base",
		"Level 80, this SP consumption is reduced by 5%",
		"and at Level 90, it is reduced by 7%.",
		"Happy Break Efficiency & MaxSP Increase By Level",
		"[Lv 1]: ^777777H.B. +40% , Max SP +30^000000",
		"[Lv 2]: ^777777H.B. +50% , Max SP +60^000000",
		"[Lv 3]: ^777777H.B. +60% , Max SP +90^000000",
		"[Lv 4]: ^777777H.B. +70% , Max SP +120^000000",
		"[Lv 5]: ^777777H.B. +80% , Max SP +150^000000",
		"[Lv 6]: ^777777H.B. +90% , Max SP +180^000000",
		"[Lv 7]: ^777777H.B. +100% , Max SP +210^000000"
	].join("\n");

	SkillDescription[SKID.SL_STIN] = [
		"Estin",
		"Max Level: 7",
		"^CC3399Requirement: Wizard Spirit 1^000000",
		"Skill Form: ^777777Magic Attack^000000",
		"[Es-] Category: ^777777Can only be used on monsters.^000000",
		"Description: ^777777Push back a targeted monster",
		"2 cells away. Only Small sized monsters are",
		"damaged by this skill, which takes the elemental",
		"property of the Mild Wind skill if it is cast.",
		"At skill level 7, Estin will have a 3 second",
		"delay that will allow the casting of the",
		"Esma skill.^000000",
		"[Lv 1]: ^77777718 SP, 10% Damage^000000",
		"[Lv 2]: ^77777720 SP, 20% Damage^000000",
		"[Lv 3]: ^77777722 SP, 30% Damage^000000",
		"[Lv 4]: ^77777724 SP, 40% Damage^000000",
		"[Lv 5]: ^77777726 SP, 50% Damage^000000",
		"[Lv 6]: ^77777728 SP, 60% Damage^000000",
		"[Lv 7]: ^77777730 SP, 70% Damage^000000"
	].join("\n");

	SkillDescription[SKID.SL_STUN] = [
		"Estun",
		"Max Level: 7",
		"^CC3399Requirement: Wizard Spirit 1^000000",
		"Skill Form: ^777777Magic Attack^000000",
		"[Es-] Category: ^777777Can only be used on monsters.^000000",
		"Description: ^777777Push back a targeted monster",
		"2 cells away. Only Medium sized monsters are",
		"damaged by this skill, which takes the elemental",
		"property of the Mild Wind skill if it is cast.",
		"At skill level 7, Estun will have a 3 second",
		"delay that will allow the casting of the",
		"Esma skill.^000000",
		"[Lv 1]: ^77777718 SP, 5% Damage^000000",
		"[Lv 2]: ^77777720 SP, 10% Damage^000000",
		"[Lv 3]: ^77777722 SP, 15% Damage^000000",
		"[Lv 4]: ^77777724 SP, 20% Damage^000000",
		"[Lv 5]: ^77777726 SP, 25% Damage^000000",
		"[Lv 6]: ^77777728 SP, 30% Damage^000000",
		"[Lv 7]: ^77777730 SP, 35% Damage^000000"
	].join("\n");

	SkillDescription[SKID.SL_SMA] = [
		"Esma",
		"Max Level: 10",
		"^CC3399Requirement: Estin 7, Estun 7^000000",
		"Skill Form: ^777777Magic Attack^000000",
		"[Es-] Category: ^777777Can only be used on monsters.^000000",
		"Description: ^777777This skill can be activated only ",
		"when the Esma casting requirement is satisfied.",
		"One blast inflicts an amount of damage that is",
		"calculated as (40 + Base Level)% of a Magic",
		"Attack, that will take on the elemental",
		"property applied by the Mild Wind skill.^000000",
		"SP Consumption and Number of Fired Blasts",
		"[Lv 1]: ^7777778 SP, 1 Blast^000000",
		"[Lv 2]: ^77777716 SP, 2 Blasts^000000",
		"[Lv 3]: ^77777724 SP, 3 Blasts^000000",
		"[Lv 4]: ^77777732 SP, 4 Blasts^000000",
		"[Lv 5]: ^77777740 SP, 5 Blasts^000000",
		"[Lv 6]: ^77777748 SP, 6 Blasts^000000",
		"[Lv 7]: ^77777756 SP, 7 Blasts^000000",
		"[Lv 8]: ^77777764 SP, 8 Blasts^000000",
		"[Lv 9]: ^77777772 SP, 9 Blasts^000000",
		"[Lv 10]: ^77777780 SP, 10 Blasts^000000"
	].join("\n");

	SkillDescription[SKID.SL_SWOO] = [
		"Eswoo",
		"Max Level: 7",
		"^CC3399Requirement: Priest Spirit 1^000000",
		"Skill Form: ^777777Status Magic^000000",
		"[Es-] Category: ^777777Can only be used on monsters.^000000",
		"Description: ^777777Temporarily shrink a monster to",
		"reduce its Movement Speed. Boss monsters will",
		"only be shrunk for 1/5th of the normal skill",
		"duration. If this skill is cast on a monster",
		"that is already shrunken, the caster will be",
		"inflicted by the Stun status and the targeted",
		"monster will recover from Shrunken status more",
		"quickly.^000000",
		"SP Consumption & Skill Duration By Level",
		"[Lv 1]: ^77777775 SP, 1 sec^000000",
		"[Lv 2]: ^77777765 SP, 2 sec^000000",
		"[Lv 3]: ^77777755 SP, 3 sec^000000",
		"[Lv 4]: ^77777745 SP, 4 sec^000000",
		"[Lv 5]: ^77777735 SP, 5 sec^000000",
		"[Lv 6]: ^77777725 SP, 6 sec^000000",
		"[Lv 7]: ^77777715 SP, 7 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_SKE] = [
		"Eske",
		"Max Level: 3",
		"^CC3399Requirement: Knight Spirit 1^000000",
		"Skill Form: ^777777Status Magic^000000",
		"[Es-] Category: ^777777Can only be used on monsters.^000000",
		"Description: ^777777Increase targeted monster's Attack",
		"Power, multiplying it by 4, but reduce its",
		"Defense by half. This skill is followed by a",
		"3 second delay in which the ^00BB00Esma^777777skill",
		"can be cast.^000000",
		"[Lv 1]: ^77777745sp, 3sec cast 10sec duration^000000",
		"[Lv 2]: ^77777730sp, 2sec cast 20sec duration^000000",
		"[Lv 3]: ^77777715sp, 1sec cast 30sec duration^000000"
	].join("\n");

	SkillDescription[SKID.SL_SKA] = [
		"Eska",
		"Max Level: 3",
		"^CC3399Requirement: Monk Spirit 1^000000",
		"Skill Form: ^777777Status Magic^000000",
		"[Es-] Category: ^777777Can only be used on monsters.^000000",
		"Description: ^777777Force a monster into a status",
		"similar to Monk's Steel Body, in which",
		"Movement and Attack Speed is reduced, but",
		"Defense and Magic Defense will be temporarily",
		"enhanced.^000000",
		"[Lv 1]: ^777777100sp, 3sec cast 10sec duration^000000",
		"[Lv 2]: ^77777780sp, 2sec cast 20sec duration^000000",
		"[Lv 3]: ^77777760sp, 1sec cast 30sec duration^000000"
	].join("\n");

	SkillDescription[SKID.ST_PRESERVE] = [
		"Preserve",
		"Max Level: 1",
		"^CC3399Requirement: Plagiarism 10^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Prevent the automatic copying of",
		"skills through the Plagiarism skill for 10",
		"minutes in order to preserve the last skill",
		"copied through Plagiarism.^000000"
	].join("\n");

	SkillDescription[SKID.ST_FULLSTRIP] = [
		"Full Strip",
		"Max Level: 5",
		"^CC3399Requirement: Strip Weapon 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Cast all four Strip skills at the",
		"same time. This skill's success rate increases",
		"if the caster has higher DEX than the target.^000000",
		"[Lv 1]: ^7777777% Success Rate, 22 SP^000000",
		"[Lv 2]: ^7777779% Success Rate, 24 SP^000000",
		"[Lv 3]: ^77777711% Success Rate, 26 SP^000000",
		"[Lv 4]: ^77777713% Success Rate, 28 SP^000000",
		"[Lv 5]: ^77777715% Success Rate, 30 SP^000000"
	].join("\n");

	SkillDescription[SKID.WS_WEAPONREFINE] = [
		"Weapon Refine",
		"Max Level: 10",
		"^CC3399Requirement: Weaponry Research 10^000000",
		"Skill Form: ^339900Craft^000000",
		"Description: ^777777Refine weapons to increase their",
		"grade. Unlike weapon smithing, which is",
		"affected by DEX or LUK, this skill's success",
		"rate is affected by the caster's Job Level.",
		"Whitesmith have same rate of success as",
		"Item Upgrade NPCs at Job Level 50, has 5%",
		"greater chance of success than Item Upgrade",
		"NPCs at Job Level 60, and have a 10% greater",
		"chance of success at Job Level 70. If upgrade",
		"attempt fails, the weapon will be destroyed.",
		"Level 1 Weapon require 1 ^00BB00Phracon^777777.",
		"Level 2 Weapon require 1 ^00BB00Emveretarcon^777777.",
		"Level 3-4 Weapon requires 1 ^00BB00Oridecon^777777.^000000",
		"[Lv 1]: ^777777+1 maximum refine level^000000",
		"[Lv 2]: ^777777+2 maximum refine level^000000",
		"[Lv 3]: ^777777+3 maximum refine level^000000",
		"[Lv 4]: ^777777+4 maximum refine level^000000",
		"[Lv 5]: ^777777+5 maximum refine level^000000",
		"[Lv 6]: ^777777+6 maximum refine level^000000",
		"[Lv 7]: ^777777+7 maximum refine level^000000",
		"[Lv 8]: ^777777+8 maximum refine level^000000",
		"[Lv 9]: ^777777+9 maximum refine level^000000",
		"[Lv 10]: ^777777+10 maximum refine level^000000"
	].join("\n");

	SkillDescription[SKID.CR_SLIMPITCHER] = [
		"Slim Potion Pitcher",
		"Max Level: 10",
		"^CC3399Requirement: Potion Pitcher 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Consume 1 Condensed Potion to",
		"heal all Party Members within a 7*7 cell area",
		"around the targeted spot.^000000",
		"[Lv 1]: ^777777110% efficiency, Require Red Potion^000000",
		"[Lv 2]: ^777777120% efficiency, Require Red Potion^000000",
		"[Lv 3]: ^777777130% efficiency, Require Red Potion^000000",
		"[Lv 4]: ^777777140% efficiency, Require Red Potion^000000",
		"[Lv 5]: ^777777150% efficiency, Require Red Potion^000000",
		"[Lv 6]: ^777777160% efficiency, Require Yellow Potion^000000",
		"[Lv 7]: ^777777170% efficiency, Require Yellow Potion^000000",
		"[Lv 8]: ^777777180% efficiency, Require Yellow Potion^000000",
		"[Lv 9]: ^777777190% efficiency, Require Yellow Potion^000000",
		"[Lv 10]: ^777777200% efficiency, Require White Potion^000000"
	].join("\n");

	SkillDescription[SKID.CR_FULLPROTECTION] = [
		"Full Protection",
		"Max Level: 5",
		"^CC3399Requirement: Chemical Protection",
		"(Helm, Shield, Armor, and Weapon) 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Protect the targeted character with",
		"all four kinds of chemical protection.",
		"Each cast requires 1 ^00BB00Glistening Coat^777777.^000000",
		"[Lv 1]: ^777777120 Sec Duration^000000",
		"[Lv 2]: ^777777240 Sec Duration^000000",
		"[Lv 3]: ^777777360 Sec Duration^000000",
		"[Lv 4]: ^777777480 Sec Duration^000000",
		"[Lv 5]: ^777777600 Sec Duration^000000"
	].join("\n");

	SkillDescription[SKID.PA_SHIELDCHAIN] = [
		"Shield Chain",
		"Max Level: 5",
		"^CC3399Requirement: Shield Boomerang 5^000000",
		"Range: ^7777774 cells^000000",
		"Description: ^777777Enable the chance of striking an",
		"enemy 5 times with a Shield while in battle.",
		"Accuracy Rate affects success chance and the",
		"Shield's weight and Upgrade status affects the",
		"amount of damage. Shield Chain has 1 second",
		"cast delay and range of 4 cells.",
		"Requires ^00BB00Shield^777777.^000000",
		"[Lv 1]: ^777777+30% Damage, HIT +20^000000",
		"[Lv 2]: ^777777+60% Damage, HIT +20^000000",
		"[Lv 3]: ^777777+90% Damage, HIT +20^000000",
		"[Lv 4]: ^777777+120% Damage, HIT +20^000000",
		"[Lv 5]: ^777777+150% Damage, HIT +20^000000"
	].join("\n");

	SkillDescription[SKID.HP_MANARECHARGE] = [
		"Mana Recharge",
		"Max Level: 5",
		"^CC3399Requirement: Mace Mastery 10,",
		"Demon Bane 10^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Reduce the amount of SP that is",
		"consumed when using skills.^000000",
		"[Lv 1]: ^777777-4% SP cost^000000",
		"[Lv 2]: ^777777-8% SP cost^000000",
		"[Lv 3]: ^777777-12% SP cost^000000",
		"[Lv 4]: ^777777-16% SP cost^000000",
		"[Lv 5]: ^777777-20% SP cost^000000"
	].join("\n");

	SkillDescription[SKID.PF_DOUBLECASTING] = [
		"Double Casting",
		"Max Level: 5",
		"^CC3399Requirement: Auto Spell 1^000000",
		"Description: ^777777Enable the chance of repeating ",
		"any Bolt skill that is cast for this",
		"skill's duration.^000000",
		"[Lv 1]: ^77777740% chance^000000",
		"[Lv 2]: ^77777750% chance^000000",
		"[Lv 3]: ^77777760% chance^000000",
		"[Lv 4]: ^77777770% chance^000000",
		"[Lv 5]: ^77777780% chance^000000"
	].join("\n");

	SkillDescription[SKID.HW_GANBANTEIN] = [
		"Ganbantein",
		"Max Level: 1",
		"^CC3399Requirement: Sense 1, Icewall 1^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Enable the chance of canceling",
		"ground targeting magic spell cast on a 3*3 cell",
		"area around the targeted spot. This skill will",
		"cancel Land Protector on areas that have been",
		"enchanted by that skill. This skill is",
		"unaffected by items or skills that remove",
		"Gemstone requirements.",
		"Each cast requires 1 ^00BB00Blue Gemstone^777777 and",
		"^00BB00Yellow Gemstone^777777.",
		"5 second cast delay.^000000"
	].join("\n");

	SkillDescription[SKID.HW_GRAVITATION] = [
		"Gravitational Field",
		"Max Level: 5",
		"^CC3399Requirement: Quagmire 1, Magic Crasher 1,",
		"Mystical Amplification 10^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Increase the gravity in a 5*5",
		"AoE which will decrease the Attack Speed",
		"of enemies and cause continuous damage that",
		"ignore Defense. When skill is active, the",
		"caster's movement and attacks are disabled.",
		"This skill's effect on Attack and Movement",
		"Speeds does not apply to Boss monsters.",
		"Each cast requires 1 ^00BB00Blue Gemstone^777777.",
		"2 second cast delay.^000000",
		"[Lv 1]: ^777777600 damage per 0.5 second,",
		"reduction rate 5%, duration 5 sec^000000",
		"[Lv 2]: ^777777700 damage per 0.5 second,",
		"reduction rate 10%, duration 6 sec^000000",
		"[Lv 3]: ^777777800 damage per 0.5 second,",
		"reduction rate 15%, duration 7 sec^000000",
		"[Lv 4]: ^777777900 damage per 0.5 second,",
		"reduction rate 20%, duration 8 sec^000000",
		"[Lv 5]: ^7777771000 damage per 0.5 second,",
		"reduction rate 25%, duration 9 sec^000000"
	].join("\n");

	SkillDescription[SKID.WS_CARTTERMINATION] = [
		"Cart Termination",
		"Max Level: 10",
		"^CC3399Requirement: Hammerfall 5,",
		"Mammonite 10, Cart Boost 1^000000",
		"Description: ^777777This skill is only enabled during",
		"Cart Boost status. Spend a certain amount of",
		"zeny to smash Pushcart into an enemy with a",
		"chance of inflicting the Stun status. The amount",
		"of this skill's damage is affected by the",
		"skill's level and the weight of items carried",
		"in the Pushcart.^000000",
		"[Lv 1]: ^777777600 zeny, 5% Stun Chance^000000",
		"[Lv 2]: ^777777700 zeny, 10% Stun Chance^000000",
		"[Lv 3]: ^777777800 zeny, 15% Stun Chance^000000",
		"[Lv 4]: ^777777900 zeny, 20% Stun Chance^000000",
		"[Lv 5]: ^7777771,000 zeny, 25% Stun Chance^000000",
		"[Lv 6]: ^7777771,100 zeny, 30% Stun Chance^000000",
		"[Lv 7]: ^7777771,200 zeny, 35% Stun Chance^000000",
		"[Lv 8]: ^7777771,300 zeny, 40% Stun Chance^000000",
		"[Lv 9]: ^7777771,400 zeny, 45% Stun Chance^000000",
		"[Lv 10]: ^7777771,500 zeny, 50% Stun Chance^000000"
	].join("\n");

	SkillDescription[SKID.WS_OVERTHRUSTMAX] = [
		"Maximum Power Thrust",
		"Max Level: 5",
		"^CC3399Requirement: Power Thrust 5^000000",
		"Target: ^777777Caster Only^000000",
		"Description: ^777777Increase caster's weapon damage",
		"by spending a certain amount of zeny. Cannot",
		"be activated to anyone beside the caster.",
		"Has 0.1% chance of destroying user's weapon",
		"every time when attacking.^000000",
		"[Lv 1]: ^77777720% ATK, 3,000 zeny^000000",
		"[Lv 2]: ^77777740% ATK, 3,500 zeny^000000",
		"[Lv 3]: ^77777760% ATK, 4,000 zeny^000000",
		"[Lv 4]: ^77777780% ATK, 4,000 zeny^000000",
		"[Lv 5]: ^777777100% ATK, 5,000 zeny^000000"
	].join("\n");

	SkillDescription[SKID.CG_LONGINGFREEDOM] = [
		"Longing for Freedom",
		"Max Level: 5",
		"19^CC3399Requirement: Musical Lesson 10, Dissonance 3, Marionette Control 1^000000",
		"20^CC3399Requirement: Dancing Lesson 10, Ugly Dance 3, Marionette Control 1^000000",
		"Description: ^777777Enable movement of Gypsy and",
		"Clown within an Ensemble skill's range, as",
		"well as the use of normal attacks and skills",
		"aside from Ensemble skills, while performing",
		"Ensemble skill. The caster will continously",
		"spend SP through the duration of the performed",
		"Ensemble skill. Longing for Freedom is",
		"cancelled when the Gypsy or Clown move",
		"out of the Ensemble skill's range, dies,",
		"or uses the Adaptation to Circumstances",
		"skill.^000000",
		"[Lv 1]: ^77777760% normal speed^000000",
		"[Lv 2]: ^77777770% normal speed^000000",
		"[Lv 3]: ^77777780% normal speed^000000",
		"[Lv 4]: ^77777790% normal speed^000000",
		"[Lv 5]: ^777777100% normal speed^000000"
	].join("\n");

	SkillDescription[SKID.CG_HERMODE] = [
		"Hermode's Rod",
		"Max Level: 5",
		"19^CC3399Requirement: Improve Concentration 10, Musical Lesson 10^000000",
		"20^CC3399Requirement: Improve Concentration 10, Dancing Lesson 10^000000",
		"Description: ^777777This skill can only be used near",
		"Warp Portals inside Guild Siege maps during ",
		"WoE times. Hermode's Rod will cancel all",
		"positive status, aside from Berserk, from all ",
		"friendly targets except for the caster, and",
		"will block any magic spells cast of this",
		"skill's targets. No one including the caster",
		"can use any skills for the skill's duration,",
		"but Hermode's Rod is canceled upon leaving",
		"its effective range.^000000",
		"[Lv 1]: ^77777710 Sec Duration^000000",
		"[Lv 2]: ^77777720 Sec Duration^000000",
		"[Lv 3]: ^77777730 Sec Duration^000000",
		"[Lv 4]: ^77777740 Sec Duration^000000",
		"[Lv 5]: ^77777750 Sec Duration^000000"
	].join("\n");

	SkillDescription[SKID.CG_TAROTCARD] = [
		"Tarot Card of Fate",
		"Max Level: 5",
		"19^CC3399Requirement: Dissonance 3, Improve Concentration 10^000000",
		"20^CC3399Requirement: Ugly Dance 3, Improve Concentration 10^000000",
		"Description: ^777777Cast a randomly chosen effect",
		"from one out of 14 tarot cards. The level",
		"of this skill affects the chance of",
		"success.^000000",
		"[Lv 1]: ^7777778% Success Chance^000000",
		"[Lv 2]: ^77777716% Success Chance^000000",
		"[Lv 3]: ^77777724% Success Chance^000000",
		"[Lv 4]: ^77777732% Success Chance^000000",
		"[Lv 5]: ^77777740% Success Chance^000000"
	].join("\n");

	SkillDescription[SKID.CR_ACIDDEMONSTRATION] = [
		"Acid Demonstration",
		"Max Level: 10",
		"^CC3399Requirement: Demonstration 5, Acid Terror 5^000000",
		"Description: ^777777Attack an enemy by throwing both",
		"a Bottle Grenade and an Acid Bottle, inflicting",
		"an amount of damage that is affected by the",
		"skill's level, the caster's INT and the target's",
		"VIT. This skill only inflicts 50% of its damage",
		"on other players, but it has the chance of",
		"damaging that player's weapon or armor.",
		"Each cast requires 1 ^00BB00Bottle Grenade^777777 and",
		"1 ^00BB00Acid Bottle^777777.^000000",
		"[Lv 1]: ^7777771 hit, 1% chance destroying^000000",
		"[Lv 2]: ^7777772 hits, 2% chance destroying^000000",
		"[Lv 3]: ^7777773 hits, 3% chance destroying^000000",
		"[Lv 4]: ^7777774 hits, 4% chance destroying^000000",
		"[Lv 5]: ^7777775 hits, 5% chance destroying^000000",
		"[Lv 6]: ^7777776 hits, 6% chance destroying^000000",
		"[Lv 7]: ^7777777 hits, 7% chance destroying^000000",
		"[Lv 8]: ^7777778 hits, 8% chance destroying^000000",
		"[Lv 9]: ^7777779 hits, 9% chance destroying^000000",
		"[Lv 10]: ^77777710 hits, 10% chance destroying^000000"
	].join("\n");

	SkillDescription[SKID.CR_CULTIVATION] = [
		"Plant Cultivation",
		"Max Level: 2",
		"Description: ^777777Initiate an attempt, which will",
		"have a 50% chance of success, to create a",
		"random type of Mushroom from a Mushroom",
		"Spore, or a Plant from a Stem. This skill is",
		"disabled during WoE.^000000",
		"[Lv 1]: ^777777Cultivate Mushrooms",
		"Requires ^00BB00Mushroom Spore^000000",
		"[Lv 2]: ^777777Cultivate Plants",
		"Requires ^00BB00Stem^000000"
	].join("\n");

	SkillDescription[SKID.TK_MISSION] = [
		"Taekwon Mission",
		"Max Level: 1",
		"^CC3399Requirement: Kihop 5^000000",
		"Skill Form: ^777777Ranking (/taekwon)^000000",
		"Description: ^FF0000This skill is disabled once a",
		"character changes to an advanced job, such as",
		"Taekwon Master or Soul Linker. Activating this",
		"skill will display the current monster target",
		"for the Taekwon Mission. Taekwon Boys and Girls",
		"will earn 1 Taekwon Mission Point by defeating",
		"100 target monsters. Fulfilling the 100 target",
		"monster quota will begin a new Taekwon Mission",
		"with a randomly chosen target. Mini Boss and",
		"Boss monsters will never be chosen as targets.",
		"Taekwon characters that achieve the Top 10",
		"Taekwon Ranking by earning the most Taekwon",
		"Mission Points can string combos with the",
		"Tornado Kick, Roundhouse, Heel Drop, and Counter",
		"Kick skills. Taekwon Rankers at Base Level 90",
		"and above with have tripled Max HP and SP, and",
		"will be able to use all Taekwon Boy and Girl",
		"skills.^000000"
	].join("\n");

	SkillDescription[SKID.SL_HIGH] = [
		"Rebirth Spirit",
		"Max Level: 5",
		"^CC3399Requirement: Super Novice Spirit 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Call upon the spirits of the most",
		"powerful 1st Transcendent Class warriors ever",
		"so that they can lend their powers to their",
		"successors. This skill will increase every Stat",
		"for friendly 1st Transcendent characters based",
		"on their Base Level, but each Stat bonus will",
		"not exceed +50.^000000",
		"[Lv 1]: ^777777460 SP, 150 sec duration^000000",
		"[Lv 2]: ^777777360 SP, 200 sec duration^000000",
		"[Lv 3]: ^777777260 SP, 250 sec duration^000000",
		"[Lv 4]: ^777777160 SP, 300 sec duration^000000",
		"[Lv 5]: ^77777760 SP, 350 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.KN_ONEHAND] = [
		"One Hand Quicken",
		"^CC3399Requirement: Two Hand Quicken 10,",
		"Spirit State^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Increase Attack Speed when using",
		"a One Handed Sword Class Weapon. Activating",
		"this skill cancels the effect of any any potions",
		"that have a similar effect, but it is possible",
		"to use these potions after One Hand Quicken",
		"has been cast. Unequipping Sword will cancel",
		"this skill's effect.^000000"
	].join("\n");

	SkillDescription[SKID.AM_TWILIGHT1] = [
		"Twilight Pharmacy",
		"^CC3399Requirement: Pharmacy 10,",
		"Spirit State^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Consume 200 SP in order to make",
		"200 attempts to create a White Potion every",
		"0.005 seconds. This skill has the same success",
		"rate as the Pharmacy skill and has a",
		"3 second cast time that is unaffected by DEX.",
		"^00BB00Each cast requires enough materials to craft",
		"200 White Potions.^000000"
	].join("\n");

	SkillDescription[SKID.AM_TWILIGHT2] = [
		"Twilight Pharmacy",
		"^CC3399Requirement: Pharmacy 10,",
		"Spirit State^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777This skill is only enabled through",
		"the power of the Super Novice Guardian Angel.",
		"Consume 200 SP in order to make 200 attempts",
		"to create a White Potion every 0.005 seconds.",
		"This skill can earn Alchemist Ranking Points",
		"and has the same success rate as the Prepare",
		"Potion skill, as well as a 3 second cast time",
		"that is unaffected by DEX. Each cast requires",
		"enough materials to craft 200 White Potions.^000000"
	].join("\n");

	SkillDescription[SKID.AM_TWILIGHT3] = [
		"Twilight Pharmacy",
		"^CC3399Requirement: Pharmacy 10,",
		"Spirit State^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777This skill is only enabled through",
		"the power of the Taekwon-Do Guardian Angel.",
		"Consume 200 SP in order to create 100 Alcohol,",
		"50 Acid Bottle and 50 Bottle Grenade. Each cast",
		"requires 50 Fabric, 50 Empty Bottle and enough",
		"materials to craft the produced items.^000000"
	].join("\n");

	SkillDescription[SKID.HT_POWER] = [
		"Beast Strafing",
		"^CC3399Requirement: Double Strafe 10,",
		"Spirit State^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Attack by using a modified form of",
		"Double Strafe that was developed to cause",
		"extra damage to Brute monsters. Caster's",
		"STR affects the amount of inflicted damage.^000000"
	].join("\n");

	SkillDescription[SKID.GS_GLITTERING] = [
		"Coin Flip",
		"Max Level: 5",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Consume 1 zeny to flip a coin.",
		"If it lands showing heads, the caster will gain",
		"1 coin, but if it shows tails, the caster will",
		"lose 1 coin. The caster can have a maximum of",
		"10 coins, and increasing this skill's level",
		"raises the success rate of flipping a coin that",
		"will show heads. Gunslinger coins are displayed",
		"as glowing orbs around the caster.^000000"
	].join("\n");

	SkillDescription[SKID.GS_FLING] = [
		"Fling",
		"Max Level: 1",
		"^CC3399Requirement: Coin Flip 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Spend coins to fling them at an",
		"enemy to inflict damage and reduce its Defense.",
		"Fling can consume up to 5 coins in a single",
		"cast, and will reduce more of an enemy's Defense",
		"if more coins are spent.^000000"
	].join("\n");

	SkillDescription[SKID.GS_TRIPLEACTION] = [
		"Triple Action",
		"Max Level: 1",
		"^CC3399Requirement: Chain Action 10,",
		"Coin Flip 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Spend 1 coin to shoot an enemy",
		"3 times in one attack.^000000"
	].join("\n");

	SkillDescription[SKID.GS_BULLSEYE] = [
		"Bull's Eye",
		"Max Level: 1",
		"^CC3399Requirement: Tracking 10, Coin Flip 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Consume 1 coin to inflict 500%",
		"damage to Demihuman and Brute monsters. Bull's",
		"Eye has a 0.1% chance to inflict the Coma effect",
		"on all enemies except Boss monsters.^000000"
	].join("\n");

	SkillDescription[SKID.GS_MADNESSCANCEL] = [
		"Madness Canceller",
		"Max Level: 1",
		"^CC3399Requirement: Gatling Fever 10,",
		"Coin Flip 4^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Consume 4 coins to activate",
		"Madness Canceller in which the caster is",
		"immobilized, but has +100 ATK and +20% Aspd.",
		"Madness Canceller has 15 second duration, and",
		"cannot be used with Adjustment.^000000"
	].join("\n");

	SkillDescription[SKID.GS_ADJUSTMENT] = [
		"Adjustment",
		"Max Level: 1",
		"^CC3399Requirement: Disarm 5, Coin Flip 4^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Consume 2 coins to activate the",
		"Adjustment status in which caster has +30 Flee",
		"and receives 20% less damage from long range",
		"physical attacks, but has -30 Accuracy.",
		"This skill has a 20 second duration, and",
		"cannot be used together with the Madness",
		"Canceller skill.^000000"
	].join("\n");

	SkillDescription[SKID.GS_INCREASING] = [
		"Increase Accuracy",
		"Max Level: 1",
		"^CC3399Requirement: Snake Eye 10, Coin Flip 2^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Consume 4 coins to add +20",
		"Accuracy, +4 DEX, and +4 AGI for a 1 minute",
		"duration.^000000"
	].join("\n");

	SkillDescription[SKID.GS_MAGICALBULLET] = [
		"Magicial Bullet",
		"Max Level: 1",
		"^CC3399Requirement: Coin Flip 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Consume 1 coin to fire a magic shot",
		"that does not use any bullets, inflicting an",
		"amount of Ghost property damage equal to the",
		"caster's ATK + MATK.^000000"
	].join("\n");

	SkillDescription[SKID.GS_CRACKER] = [
		"Cracker",
		"Max Level: 1",
		"^CC3399Requirement: Coin Flip 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Consume 1 coin to fire a bullet",
		"that will shock an enemy, causing the Stun",
		"status. The nearer the target is to the caster,",
		"the greater the chance of inflicting the Stun",
		"status.^000000"
	].join("\n");

	SkillDescription[SKID.GS_SINGLEACTION] = [
		"Single Action",
		"Max Level: 1",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Essential Gunslinger skill that",
		"enables Gunslingers to fire their weapons more",
		"quickly and accurately. Raising this skill's",
		"level will increase Accuracy and Attack Speed.^000000",
		"[Lv 1]: ^777777Accuracy +2, Aspd +1%^000000",
		"[Lv 2]: ^777777Accuracy +4, Aspd +1%^000000",
		"[Lv 3]: ^777777Accuracy +6, Aspd +2%^000000",
		"[Lv 4]: ^777777Accuracy +8, Aspd +2%^000000",
		"[Lv 5]: ^777777Accuracy +10, Aspd +3%^000000",
		"[Lv 6]: ^777777Accuracy +12, Aspd +3%^000000",
		"[Lv 7]: ^777777Accuracy +14, Aspd +4%^000000",
		"[Lv 8]: ^777777Accuracy +16, Aspd +4%^000000",
		"[Lv 9]: ^777777Accuracy +18, Aspd +5%^000000",
		"[Lv 10]: ^777777Accuracy +20, Aspd +5%^000000"
	].join("\n");

	SkillDescription[SKID.GS_SNAKEEYE] = [
		"Snake Eyes",
		"Max Level: 1",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase attack range and Accuracy",
		"when equipped with a Pistol Class Weapon.^000000",
		"[Lv 1]: ^777777Accuracy +1, Range +1^000000",
		"[Lv 2]: ^777777Accuracy +2, Range +2^000000",
		"[Lv 3]: ^777777Accuracy +3, Range +3^000000",
		"[Lv 4]: ^777777Accuracy +4, Range +4^000000",
		"[Lv 5]: ^777777Accuracy +5, Range +5^000000",
		"[Lv 6]: ^777777Accuracy +6, Range +6^000000",
		"[Lv 7]: ^777777Accuracy +7, Range +7^000000",
		"[Lv 8]: ^777777Accuracy +8, Range +8^000000",
		"[Lv 9]: ^777777Accuracy +9, Range +9^000000",
		"[Lv 10]: ^777777Accuracy +10, Range: +10^000000"
	].join("\n");

	SkillDescription[SKID.GS_CHAINACTION] = [
		"Chain Action",
		"Max Level: 10",
		"^CC3399Requirement: Single Action 5^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enables the chance of firing two",
		"shots in a single attack while fighting enemies",
		"when equipped with a Pistol Class Weapon.",
		"Raising this skill's level increases the chance",
		"of firing these double shots.^000000"
	].join("\n");

	SkillDescription[SKID.GS_TRACKING] = [
		"Tracking",
		"Max Level: 10",
		"^CC3399Requirement: Single Action 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Carefully aim at a target to",
		"inflict devastating damage. Raising this skill's",
		"level increases Cast Time and damage. Pistol or",
		"Rifle Class weapon required to use Tracking.^000000",
		"Skill Damage and Cast Time by Level",
		"[Lv 1]: ^777777300%, 1.2 sec^000000",
		"[Lv 2]: ^777777400%, 1.4 sec^000000",
		"[Lv 3]: ^777777500%, 1.6 sec^000000",
		"[Lv 4]: ^777777600%, 1.8 sec^000000",
		"[Lv 5]: ^777777700%, 2 sec^000000",
		"[Lv 6]: ^777777800%, 2.2 sec^000000",
		"[Lv 7]: ^777777900%, 2.4 sec^000000",
		"[Lv 8]: ^7777771000%, 2.6 sec^000000",
		"[Lv 9]: ^7777771100%, 2.8 sec^000000",
		"[Lv 10]: ^7777771200%, 3 sec^000000"
	].join("\n");

	SkillDescription[SKID.GS_DISARM] = [
		"Disarm",
		"Max Level: 5",
		"^CC3399Requirement: Tracking 7^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Shoot an enemy's appendages to",
		"render it incapable of attacking. This skill's",
		"success rate increases as its level is raised.",
		"When used on monsters, this skill will reduce",
		"ATK by 25%, but has no effect on Boss monsters.",
		"Disarm has a range of 7 cells, and requires",
		"a Pistol or Rifle Class Weapon.^000000"
	].join("\n");

	SkillDescription[SKID.GS_PIERCINGSHOT] = [
		"Piercing Shot",
		"Max Level: 5",
		"^CC3399Requirement: Tracking 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Inflict Defense piercing damage",
		"that has the chance of causing the Bleeding",
		"effect on its target. Requires a Pistol or",
		"Rifle Class Weapon.^000000",
		"[Lv 1]: ^777777120% ATK, Bleeding chance 3%^000000",
		"[Lv 2]: ^777777140% ATK, Bleeding chance 6%^000000",
		"[Lv 3]: ^777777160% ATK, Bleeding chance 9%^000000",
		"[Lv 4]: ^777777180% ATK, Bleeding chance 12%^000000",
		"[Lv 5]: ^777777200% ATK, Bleeding chance 15%^000000"
	].join("\n");

	SkillDescription[SKID.GS_RAPIDSHOWER] = [
		"Rapid Shower",
		"Max Level: 10",
		"^CC3399Requirement: Chain Action^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Consume 5 bullets to perform a",
		"rapidfire 5 shot attack.",
		"Requires a Pistol Class Weapon.^000000",
		"[Lv 1]: ^777777550% ATK^000000",
		"[Lv 2]: ^777777600% ATK^000000",
		"[Lv 3]: ^777777650% ATK^000000",
		"[Lv 4]: ^777777700% ATK^000000",
		"[Lv 5]: ^777777750% ATK^000000",
		"[Lv 6]: ^777777800% ATK^000000",
		"[Lv 7]: ^777777850% ATK^000000",
		"[Lv 8]: ^777777900% ATK^000000",
		"[Lv 9]: ^777777950% ATK^000000",
		"[Lv 10]: ^7777771000% ATK^000000"
	].join("\n");

	SkillDescription[SKID.GS_DESPERADO] = [
		"Desperado",
		"Max Level: 10",
		"^CC3399Requirement: Trigger Happy Shot 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Consume 10 bullets to perform a",
		"haphazard attack that may damage enemies within",
		"a 7 cell radius around the caster. Each cast has",
		"a maximum of 10 strikes, and requires a Pistol",
		"Class Weapon.^000000",
		"[Lv 1]: ^777777100% ATK^000000",
		"[Lv 2]: ^777777150% ATK^000000",
		"[Lv 3]: ^777777200% ATK^000000",
		"[Lv 4]: ^777777250% ATK^000000",
		"[Lv 5]: ^777777300% ATK^000000",
		"[Lv 6]: ^777777350% ATK^000000",
		"[Lv 7]: ^777777400% ATK^000000",
		"[Lv 8]: ^777777450% ATK^000000",
		"[Lv 9]: ^777777500% ATK^000000",
		"[Lv 10]: ^777777550% ATK^000000"
	].join("\n");

	SkillDescription[SKID.GS_GATLINGFEVER] = [
		"Gatling Fever",
		"Max Level: 10",
		"^CC3399Requirement: Trigger Happy Shot 7,",
		"Desperado 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Temporarily increase Attack Speed",
		"and damage at the cost of reducing Flee Rate",
		"and Movement Speed. Gatling Fever status is",
		"cancelled when this skill is double cast.",
		"Requires Gatling Gun Class Weapon.^000000",
		"[Lv 1]: ^777777+30 ATK, +2% Aspd ",
		" -5% Flee, 30 sec. duration^000000",
		"[Lv 2]: ^777777+40 ATK, +4% Aspd^000000",
		" ^777777-10% Flee, 45 sec. duration^000000",
		"[Lv 3]: ^777777+50 ATK, +6% Aspd^000000",
		" ^777777-15% Flee, 60 sec. duration^000000",
		"[Lv 4]: ^777777+60 ATK, +8% Aspd^000000",
		" ^777777-20% Flee, 75 sec. duration^000000",
		"[Lv 5]: ^777777+70 ATK, +10% Aspd^000000",
		" ^777777-25% Flee, 90 sec. duration^000000",
		"[Lv 6]: ^777777+80 ATK, +12% Aspd^000000",
		" ^777777-30% Flee, 105 sec. duration^000000",
		"[Lv 7]: ^777777+90 ATK, +14% Aspd^000000",
		" ^777777-35% Flee, 120 sec. duration^000000",
		"[Lv 8]: ^777777+100 ATK, +16% Aspd^000000",
		" ^777777-40% Flee, 135 sec. duration^000000",
		"[Lv 9]: ^777777+110 ATK, +18% Aspd^000000",
		" ^777777-45% Flee, 150 sec. duration^000000",
		"[Lv 10]: ^777777+120 ATK, +20% Aspd^000000",
		" ^777777-50% Flee, 165 sec. duration^000000"
	].join("\n");

	SkillDescription[SKID.GS_DUST] = [
		"Dust",
		"Max Level: 10",
		"^CC3399Requirement: Single Action 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Fire a close range shot that will",
		"push an enemy 5 cells backward.",
		"Requires a Shotgun Class Weapon.^000000",
		"[Lv 1]: ^777777150% ATK^000000",
		"[Lv 2]: ^777777200% ATK^000000",
		"[Lv 3]: ^777777250% ATK^000000",
		"[Lv 4]: ^777777300% ATK^000000",
		"[Lv 5]: ^777777350% ATK^000000",
		"[Lv 6]: ^777777400% ATK^000000",
		"[Lv 7]: ^777777450% ATK^000000",
		"[Lv 8]: ^777777500% ATK^000000",
		"[Lv 9]: ^777777550% ATK^000000",
		"[Lv 10]: ^777777600% ATK^000000"
	].join("\n");

	SkillDescription[SKID.GS_FULLBUSTER] = [
		"Full Buster",
		"Max Level: 10",
		"^CC3399Requirement: Dust 3^00000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Inflict devastating damage to an",
		"enemy by firing multiple bullets at once. This",
		"skill has a small chance of causing the Blind",
		"status to the caster, and can consume up to",
		"10 bullets per cast.",
		"Requires a Shotgun Class Weapon.^000000",
		"Attack Damage & Bullet Consumption by Level",
		"[Lv 1]: ^777777400% ATK, 2 Bullets^000000",
		"[Lv 2]: ^777777500% ATK, 2 Bullets^000000",
		"[Lv 3]: ^777777600% ATK, 4 Bullets^000000",
		"[Lv 4]: ^777777700% ATK, 4 Bullets^000000",
		"[Lv 5]: ^777777800% ATK, 6 Bullets^000000",
		"[Lv 6]: ^777777900% ATK, 6 Bullets^000000",
		"[Lv 7]: ^7777771000% ATK, 8 Bullets^000000",
		"[Lv 8]: ^7777771100% ATK, 8 Bullets^000000",
		"[Lv 9]: ^7777771200% ATK, 10 Bullets^000000",
		"[Lv 10]: ^7777771300% ATK, 10 Bullets^000000"
	].join("\n");

	SkillDescription[SKID.GS_SPREADATTACK] = [
		"Spread Attack",
		"Max Level: 10",
		"^CC3399Requirement: Full Buster 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Consume 5 bullets to spread damage",
		"over a large area.",
		"Requires a Shotgun Class Weapon.^000000",
		"[Lv 1]: ^777777100% ATK, 3*3 cells^000000",
		"[Lv 2]: ^777777120% ATK, 3*3 cells^000000",
		"[Lv 3]: ^777777140% ATK, 3*3 cells^000000",
		"[Lv 4]: ^777777160% ATK, 5*5 cells^000000",
		"[Lv 5]: ^777777180% ATK, 5*5 cells^000000",
		"[Lv 6]: ^777777200% ATK, 5*5 cells^000000",
		"[Lv 7]: ^777777220% ATK, 7*7 cells^000000",
		"[Lv 8]: ^777777240% ATK, 7*7 cells^000000",
		"[Lv 9]: ^777777260% ATK, 7*7 cells^000000",
		"[Lv 10]: ^777777280% ATK, 9*9 cells^000000"
	].join("\n");

	SkillDescription[SKID.GS_GROUNDDRIFT] = [
		"Ground Drift",
		"Max Level: 10",
		"^CC3399Requirement: Full Buster 5, Spread Attack 7^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Plant Bullet Spheres into the",
		"ground that will explode upon enemy approach.",
		"The explosion's effect varies according to the",
		"type of bullet planted. Requires a Grenade",
		"Launcher Class Weapon.^000000",
		"Attack Bonus & Mine Duration by Skill Level",
		"[Lv 1]: ^777777+50 ATK, 3 Sec.^000000",
		"[Lv 2]: ^777777+100 ATK, 6 Sec^000000",
		"[Lv 3]: ^777777+150 ATK, 9 Sec.^000000",
		"[Lv 4]: ^777777+200 ATK, 12 Sec.^000000",
		"[Lv 5]: ^777777+250 ATK, 15 Sec.^000000",
		"[Lv 6]: ^777777+300 ATK, 18 Sec.^000000",
		"[Lv 7]: ^777777+350 ATK, 21 Sec.^000000",
		"[Lv 8]: ^777777+400 ATK, 24 Sec.^000000",
		"[Lv 9]: ^777777+450 ATK, 27 Sec.^000000",
		"[Lv 10]: ^777777+500 ATK, 30 Sec.^000000"
	].join("\n");

	SkillDescription[SKID.NJ_TOBIDOUGU] = [
		"Throwing Mastery",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase Shuriken damage.^000000",
		"[Lv 1]: ^777777ATK +3^000000",
		"[Lv 2]: ^777777ATK +6^000000",
		"[Lv 3]: ^777777ATK +9^000000",
		"[Lv 4]: ^777777ATK +12^000000",
		"[Lv 5]: ^777777ATK +15^000000",
		"[Lv 6]: ^777777ATK +18^000000",
		"[Lv 7]: ^777777ATK +21^000000",
		"[Lv 8]: ^777777ATK +24^000000",
		"[Lv 9]: ^777777ATK +27^000000",
		"[Lv 10]: ^777777ATK +30^000000"
	].join("\n");

	SkillDescription[SKID.NJ_SYURIKEN] = [
		"Throw Shuriken",
		"Max Level: 10",
		"^CC3399Requirement: Throwing Mastery 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Throw a Shuriken at a target",
		"from a distance of up to 9 cells away from the",
		"caster. Each cast consumes 1 Shuriken.^000000",
		"[Lv 1]: ^777777Damage +4^000000",
		"[Lv 2]: ^777777Damage +8^000000",
		"[Lv 3]: ^777777Damage +12^000000",
		"[Lv 4]: ^777777Damage +16^000000",
		"[Lv 5]: ^777777Damage +20^000000",
		"[Lv 6]: ^777777Damage +24^000000",
		"[Lv 7]: ^777777Damage +28^000000",
		"[Lv 8]: ^777777Damage +32^000000",
		"[Lv 9]: ^777777Damage +36^000000",
		"[Lv 10]: ^777777Damage +40^000000"
	].join("\n");

	SkillDescription[SKID.NJ_KUNAI] = [
		"Throw Kunai",
		"Max Level: 10",
		"^CC3399Requirement: Throwing Mastery 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Throw a Kunai that will strike its",
		"target 3 times in one attack. Each cast consumes",
		"1 Kunai, and the attack's property is affected",
		"by the type of Kunai thrown.^000000"
	].join("\n");

	SkillDescription[SKID.NJ_HUUMA] = [
		"Throw Huuma Shuriken",
		"Max Level: 5",
		"^CC3399Requirement: Throwing Mastery 5,",
		"Throw Kunai 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Requires a Huuma Class Weapon.",
		"Throw a Huuma Shuriken that will damage its",
		"target and any nearby enemies. The total amount",
		"of damage is divided among the enemies damaged",
		"by this skill. Raising this skill's level",
		"increases its number of strikes.^000000",
		"Total Amount of Damage by Skill Level",
		"[Lv 1]: ^777777300% ATK^000000",
		"[Lv 2]: ^777777450% ATK^000000",
		"[Lv 3]: ^777777600% ATK^000000",
		"[Lv 4]: ^777777750% ATK^000000",
		"[Lv 5]: ^777777900% ATK^000000"
	].join("\n");

	SkillDescription[SKID.NJ_ZENYNAGE] = [
		"Throw Zeny",
		"Max Level: 10",
		"^CC3399Requirement: Throwing Mastery 10,",
		"Throw Huuma Shuriken 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Throw coin at a target to inflict",
		"an amount of Defense piercing damage equal to",
		"the amount of zeny spent in the attack. This",
		"skill is followed by a 5 second Cast Delay, and",
		"its damage is reduced against Boss monsters and",
		"in PvP.^000000",
		"Zeny Consumption by Skill Level",
		"[Lv 1]: ^777777500~1,000 zeny^000000",
		"[Lv 2]: ^7777771,000~2,000 zeny^000000",
		"[Lv 3]: ^7777771,500~3,000 zeny^000000",
		"[Lv 4]: ^7777772,000~4,000 zeny^000000",
		"[Lv 5]: ^7777772,500~5,000 zeny^000000",
		"[Lv 6]: ^7777773,000~6,000 zeny^000000",
		"[Lv 7]: ^7777773,500~7,000 zeny^000000",
		"[Lv 8]: ^7777774,000~8,000 zeny^000000",
		"[Lv 9]: ^7777774,500~9,000 zeny^000000",
		"[Lv 10]: ^7777775,000~10,000 zeny^000000"
	].join("\n");

	SkillDescription[SKID.NJ_TATAMIGAESHI] = [
		"Flip Tatami",
		"Max Level: 5",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Flip tatami to cause the 4*4 area",
		"around the caster to ignore long range physical",
		"damage for 3 seconds. Each cast is followed by",
		"a 3 second cast delay, and has the chance to",
		"damage and push enemies 3 cells backward if",
		"they are within the skill's attack range.^000000",
		"Attack Range & Damage by Skill Level",
		"[Lv 1]: ^7777771 cell, 110% ATK^000000",
		"[Lv 2]: ^7777772 cells, 120% ATK^000000",
		"[Lv 3]: ^7777772 cells, 130% ATK^000000",
		"[Lv 4]: ^7777773 cells, 140% ATK^000000",
		"[Lv 5]: ^7777773 cells, 150% ATK^000000"
	].join("\n");

	SkillDescription[SKID.NJ_KASUMIKIRI] = [
		"Haze Slasher",
		"Max Level: 10",
		"^CC3399Requirement: Shadow Leap 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Strike an enemy, and then",
		"immediately enter the Hiding status; can be",
		"followed by the Shadow Leap or Shadow Slash",
		"skill.^000000",
		"[Lv 1]: ^777777ATK 110%^000000",
		"[Lv 2]: ^777777ATK 120%^000000",
		"[Lv 3]: ^777777ATK 130%^000000",
		"[Lv 4]: ^777777ATK 140%^000000",
		"[Lv 5]: ^777777ATK 150%^000000",
		"[Lv 6]: ^777777ATK 160%^000000",
		"[Lv 7]: ^777777ATK 170%^000000",
		"[Lv 8]: ^777777ATK 180%^000000",
		"[Lv 9]: ^777777ATK 190%^000000",
		"[Lv 10]: ^777777ATK 200%^000000"
	].join("\n");

	SkillDescription[SKID.NJ_SHADOWJUMP] = [
		"Shadow Leap",
		"Max Level: 5",
		"^CC3399Requirement: Flip Tatami 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Shadow Leap can only be performed",
		"when the caster is in Hiding status",
		"(attainable through the Haze Slasher skill).",
		"This skill instantly moves the caster to a",
		"targeted cell, ignoring obstacles in the",
		"caster's way.^000000",
		"Leap Range by Skill Level",
		"[Lv 1]: ^7777775 cells^000000",
		"[Lv 2]: ^7777776 cells^000000",
		"[Lv 3]: ^7777777 cells^000000",
		"[Lv 4]: ^7777778 cells^000000",
		"[Lv 5]: ^7777779 cells^000000"
	].join("\n");

	SkillDescription[SKID.NJ_KIRIKAGE] = [
		"Shadow Slash",
		"Max Level: 5",
		"^CC3399Requirement: Haze Slasher 5^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Shadow Slash can only be performed",
		"during Hiding status, which can be enabled by",
		"the Haze Slasher skill. Strike a target with an",
		"attack whose range is equal to the caster's",
		"Shadow Leap range.",
		"Casting this skill will cancel Hiding status.",
		"[Lv 1]: ^777777100% ATK, +30% Critical^000000",
		"[Lv 2]: ^777777200% ATK, +35% Critical^000000",
		"[Lv 3]: ^777777300% ATK, +40% Critical^000000",
		"[Lv 4]: ^777777400% ATK, +45% Critical^000000",
		"[Lv 5]: ^777777500% ATK, +50% Critical^000000"
	].join("\n");

	SkillDescription[SKID.NJ_UTSUSEMI] = [
		"Cicada Skin Shed",
		"Max Level: 5",
		"^CC3399Requirement: Shadow Leap 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Enable Cicada Skin Shed status,",
		"which enables caster to automatically dodge a",
		"set number of attacks. Each special dodge is",
		"followed by a backward movement of 7 cells.",
		"When the number of attacks reaches the skill's",
		"limit, Cicada Skin Shed status is cancelled.^000000",
		"Duration and Number of Cicada Dodges by Level",
		"[Lv 1]: ^77777720 Sec, 1 Dodge^000000",
		"[Lv 2]: ^77777730 Sec, 1 Dodge^000000",
		"[Lv 3]: ^77777740 Sec, 2 Dodges^000000",
		"[Lv 4]: ^77777750 Sec, 2 Dodges^000000",
		"[Lv 5]: ^77777760 Sec, 3 Dodges^000000"
	].join("\n");

	SkillDescription[SKID.NJ_BUNSINJYUTSU] = [
		"Mirror Image",
		"Max Level: 10",
		"^CC3399Requirement: Shadow Slash 3,",
		"Ninja Aura 1, Cicada Skid Shed 4^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Mirror Image can only be cast",
		"during Ninja Aura status, and consumes 1 Shadow",
		"Orb. Create a mirror image that will enable the",
		"caster to dodge a set number of long and short",
		"range physical attacks. This skill cannot be",
		"used to block or evade magic based attacks.^000000",
		"Duration and Number of Dodges by Skill Level",
		"[Lv 1]: ^77777760 Sec, 1 Dodge^000000",
		"[Lv 2]: ^77777780 Sec, 1 Dodge^000000",
		"[Lv 3]: ^777777100 Sec, 2 Dodges^000000",
		"[Lv 4]: ^777777120 Sec, 2 Dodges^000000",
		"[Lv 5]: ^777777140 Sec, 3 Dodges^000000",
		"[Lv 6]: ^777777160 Sec, 3 Dodges^000000",
		"[Lv 7]: ^777777180 Sec, 4 Dodges^000000",
		"[Lv 8]: ^777777200 Sec, 4 Dodges^000000",
		"[Lv 9]: ^777777220 Sec, 5 Dodges^000000",
		"[Lv 10]: ^777777240 Sec, 5 Dodges^000000"
	].join("\n");

	SkillDescription[SKID.NJ_NINPOU] = [
		"Ninja Mastery",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase SP Restoration Speed by",
		"training in the Ninja Arts. The amount of SP",
		"restored by this skill is affected by the",
		"character's Max SP.^000000",
		"[Lv 1]: ^777777+3 SP/10 Sec.^000000",
		"[Lv 2]: ^777777+6 SP/10 Sec.^000000",
		"[Lv 3]: ^777777+9 SP/10 Sec.^000000",
		"[Lv 4]: ^777777+12 SP/10 Sec.^000000",
		"[Lv 5]: ^777777+15 SP/10 Sec.^000000",
		"[Lv 6]: ^777777+18 SP/10 Sec.^000000",
		"[Lv 7]: ^777777+21 SP/10 Sec.^000000",
		"[Lv 8]: ^777777+24 SP/10 Sec.^000000",
		"[Lv 9]: ^777777+27 SP/10 Sec.^000000",
		"[Lv 10]: ^777777+30 SP/10 Sec.^000000"
	].join("\n");

	SkillDescription[SKID.NJ_KOUENKA] = [
		"Flaming Petals",
		"Max Level: 10",
		"^CC3399Requirement: Ninja Mastery 1^000000",
		"Skill Form: ^FF0000Offensive^bb0000(Fire)^000000",
		"Description: ^777777Inflict Fire property damage at a",
		"target by shooting flaming petals. This skill's",
		"level affects the number of strikes, and each",
		"strike causes an amount of damage equal to 90%",
		"of the caster's Matk.^000000"
	].join("\n");

	SkillDescription[SKID.NJ_KAENSIN] = [
		"Blaze Shield",
		"Max Level: 10",
		"^CC3399Requirement: Flaming Petals 5^000000",
		"Skill Form: ^FF0000Offensive^bb0000(Fire)^000000",
		"Description: ^777777Summon a blazing storm in a 5*5",
		"cell area around the caster that will deliver",
		"multiple strikes to enemies within its range.",
		"The Blaze Shield lasts for 20 seconds, but is",
		"automatically canceled after inflicting its",
		"maximum number of strikes. Each cast consumes",
		"1 Flame Stone.^000000",
		"[Lv 1]: ^7777775 Strikes^000000",
		"[Lv 2]: ^7777775 Strikes^000000",
		"[Lv 3]: ^7777776 Strikes^000000",
		"[Lv 4]: ^7777776 Strikes^000000",
		"[Lv 5]: ^7777777 Strikes^000000",
		"[Lv 6]: ^7777777 Strikes^000000",
		"[Lv 7]: ^7777778 Strikes^000000",
		"[Lv 8]: ^7777778 Strikes^000000",
		"[Lv 9]: ^7777779 Strikes^000000",
		"[Lv 10]: ^7777779 Strikes^000000"
	].join("\n");

	SkillDescription[SKID.NJ_BAKUENRYU] = [
		"Exploding Dragon",
		"Max Level: 5",
		"^CC3399Requirement: Ninja Mastery 10,",
		"Blaze Shield 7^000000",
		"Skill Form: ^FF0000Offensive^bb0000(Fire)^000000",
		"Description: ^777777Summon a flaming dragon that will",
		"inflict 3 strikes on all enemies in a 5*5 cell",
		"area around the cell targeted by this skill.",
		"Each cast consumes 1 Flame Stone.^000000",
		"[Lv 1]: ^777777+300% Matk^000000",
		"[Lv 2]: ^777777+450% Matk^000000",
		"[Lv 3]: ^777777+600% Matk^000000",
		"[Lv 4]: ^777777+750% Matk^000000",
		"[Lv 5]: ^777777+900% Matk^000000"
	].join("\n");

	SkillDescription[SKID.NJ_HYOUSENSOU] = [
		"Freezing Spear",
		"Max Level: 10",
		"^CC3399Requirement: Ninja Mastery 1^000000",
		"Skill Form: ^FF0000Offensive^0000bb(Ice)^000000",
		"Description: ^777777Summon spears of ice that will",
		"strike a targeted enemy multiple times. Each",
		"strike inflicts an amount of damage that is",
		"equal to 70% of the caster's Matk.^000000",
		"[Lv 1]: ^7777773 Strikes^000000",
		"[Lv 2]: ^7777774 Strikes^000000",
		"[Lv 3]: ^7777775 Strikes^000000",
		"[Lv 4]: ^7777776 Strikes^000000",
		"[Lv 5]: ^7777777 Strikes^000000",
		"[Lv 6]: ^7777778 Strikes^000000",
		"[Lv 7]: ^7777779 Strikes^000000",
		"[Lv 8]: ^77777710 Strikes^000000",
		"[Lv 9]: ^77777711 Strikes^000000",
		"[Lv 10]: ^77777712 Strikes^000000"
	].join("\n");

	SkillDescription[SKID.NJ_SUITON] = [
		"Watery Evasion",
		"Max Level: 10",
		"^CC3399Requirement: Freezing Spear 5^000000",
		"Skill Form: ^339900Supportive^0000bb(Water)^000000",
		"Description: ^777777Create a water pool that will",
		"affect enemies within range by decreasing their",
		"AGI and reducing Movement Speed by 50%. All",
		"Ninja Class characters, including the caster,",
		"are immune to these AGI and Movement Speed",
		"penalties. The area targeted by Watery Evasion",
		"will increase the damage of the Freezing Spear",
		"skill, and enable the use of Water Ball and Aqua",
		"Benedicta for other players.",
		"Each cast consumes 1 Ice Stone.^000000",
		"Range, Duration & AGI Reduction by Skill Level",
		"[Lv 1]: ^7777773*3 cells 15 Sec.^000000",
		"[Lv 2]: ^7777773*3 cells 20 Sec, AGI - 3^000000",
		"[Lv 3]: ^7777773*3 cells 25 Sec, AGI - 3^000000",
		"[Lv 4]: ^7777775*5 cells 30 Sec, AGI - 3^000000",
		"[Lv 5]: ^7777775*5 cells 35 Sec, AGI - 5^000000",
		"[Lv 6]: ^7777775*5 cells 40 Sec, AGI - 5^000000",
		"[Lv 7]: ^7777777*7 cells 45 Sec, AGI - 5^000000",
		"[Lv 8]: ^7777777*7 cells 50 Sec, AGI - 8^000000",
		"[Lv 9]: ^7777777*7 cells 55 Sec, AGI - 8^000000",
		"[Lv 10]: ^7777779*9 cells 60 Sec, AGI - 8^000000"
	].join("\n");

	SkillDescription[SKID.NJ_HYOUSYOURAKU] = [
		"Snow Flake Draft",
		"Max Level: 5",
		"^CC3399Requirement: Ninja Mastery 10, Watery Evasion 7^000000",
		"Skill Form: ^FF0000Offensive^0000bb(Ice)^000000",
		"Description: ^777777Summon a meteor of ice that will",
		"damage enemies in a 7*7 cell area around the",
		"caster. Each cast consumes 1 Ice Stone.^000000",
		"[Lv 1]: ^777777+150% Matk 20% Freeze Chance^000000",
		"[Lv 2]: ^777777+200% Matk 30% Freeze Chance^000000",
		"[Lv 3]: ^777777+250% Matk 40% Freeze Chance^000000",
		"[Lv 4]: ^777777+300% Matk 50% Freeze Chance^000000",
		"[Lv 5]: ^777777+350% Matk 60% Freeze Chance^000000"
	].join("\n");

	SkillDescription[SKID.NJ_HUUJIN] = [
		"Wind Blade",
		"Max Level: 10",
		"^CC3399Requirement: Ninja Mastery 1^000000",
		"Skill Form: ^FF0000Offensive^bbbb00(Lightning)^000000",
		"Description: ^777777Shoot a shearing blade of",
		"air that will inflict Wind property damage",
		"to a targeted enemy.^000000",
		"[Lv 1]: ^7777771 Strike^000000",
		"[Lv 2]: ^7777772 Strikes^000000",
		"[Lv 3]: ^7777772 Strikes^000000",
		"[Lv 4]: ^7777773 Strikes^000000",
		"[Lv 5]: ^7777773 Strikes^000000",
		"[Lv 6]: ^7777774 Strikes^000000",
		"[Lv 7]: ^7777774 Strikes^000000",
		"[Lv 8]: ^7777775 Strikes^000000",
		"[Lv 9]: ^7777775 Strikes^000000",
		"[Lv 10]: ^7777776 Strikes^000000"
	].join("\n");

	SkillDescription[SKID.NJ_RAIGEKISAI] = [
		"Lightning Jolt",
		"Max Level: 5",
		"^CC3399Requirement: Wind Blade^000000",
		"Skill Form: ^FF0000Offensive^bbbb00(Lightning)^000000",
		"Description: ^777777Summon lightning bolts around the",
		"caster to damage enemies within the skill's",
		"range. Each cast consumes 1 Wind Stone.^000000",
		"Damage & Range by Skill Level",
		"[Lv 1]: ^777777+200% Matk, 3*3 cells^000000",
		"[Lv 2]: ^777777+240% Matk, 3*3 cells^000000",
		"[Lv 3]: ^777777+280% Matk, 5*5 cells^000000",
		"[Lv 4]: ^777777+320% Matk, 5*5 cells^000000",
		"[Lv 5]: ^777777+360% Matk, 7*7 cells^000000"
	].join("\n");

	SkillDescription[SKID.NJ_KAMAITACHI] = [
		"First Wind",
		"Max Level: 5",
		"^CC3399Requirement: Ninja Mastery 10,",
		"Lightning Jolt 5^000000",
		"Skill Form: ^FF0000Offensive^bbbb00(Lightning)^000000",
		"Description: ^777777Shoot a blade of sharp wind that",
		"will slash all enemies between the caster and",
		"the skill's target.",
		"Each cast consumes 1 Wind Stone.^000000",
		"Damage & Range by Skill Level",
		"[Lv 1]: ^777777+200% Matk, 5 cells^000000",
		"[Lv 2]: ^777777+300% Matk, 6 cells^000000",
		"[Lv 3]: ^777777+400% Matk, 7 cells^000000",
		"[Lv 4]: ^777777+500% Matk, 8 cells^000000",
		"[Lv 5]: ^777777+600% Matk, 9 cells^000000"
	].join("\n");

	SkillDescription[SKID.NJ_NEN] = [
		"Ninja Aura",
		"Max Level: 5",
		"^CC3399Requirement: Ninja Mastery 5^000000",
		"Skill Form: ^339900Supportive^bb00bb(Psychokinesis)^000000",
		"Description: ^777777Focus spritual energy to enter",
		"Ninja Aura status, which endows the caster with",
		"INT and STR bonuses. Ninja Aura status enables",
		"the use of the Mirror Image and Killing Strike",
		"skills, although using those skills will cancel",
		"Ninja Aura.^000000",
		"STR, INT Bonuses & Duration by Skill Level",
		"[Lv 1]: ^777777STR, INT +1, 30 Sec.^000000",
		"[Lv 2]: ^777777STR, INT +2, 45 Sec.^000000",
		"[Lv 3]: ^777777STR, INT +3, 60 Sec.^000000",
		"[Lv 4]: ^777777STR, INT +4, 75 Sec.^000000",
		"[Lv 5]: ^777777STR, INT +5, 90 Sec.^000000"
	].join("\n");

	SkillDescription[SKID.NJ_ISSEN] = [
		"Killing Strike",
		"Max Level: 10",
		"^CC3399Requirement: Throwing Mastery 7,",
		"Shadow Slash 5, Ninja Aura 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Sacrifice the caster's remaining HP",
		"to inflict devastating damage to the targeted",
		"enemy. The amount of remaining HP affects the",
		"damage inflicted, and each cast of this skill",
		"will always reduce the caster's HP to 1.^000000"
	].join("\n");

	SkillDescription[SKID.MB_FIGHTING] = [],
	SkillDescription[SKID.MB_NEUTRAL] = [],
	SkillDescription[SKID.MB_TAIMING_PUTI] = [],
	SkillDescription[SKID.MB_WHITEPOTION] = [],
	SkillDescription[SKID.MB_MENTAL] = [],
	SkillDescription[SKID.MB_CARDPITCHER] = [],
	SkillDescription[SKID.MB_PETPITCHER] = [],
	SkillDescription[SKID.MB_BODYSTUDY] = [],
	SkillDescription[SKID.MB_BODYALTER] = [],
	SkillDescription[SKID.MB_PETMEMORY] = [],
	SkillDescription[SKID.MB_M_TELEPORT] = [],
	SkillDescription[SKID.MB_B_GAIN] = [],
	SkillDescription[SKID.MB_M_GAIN] = [],
	SkillDescription[SKID.MB_MISSION] = [],
	SkillDescription[SKID.MB_MUNAKKNOWLEDGE] = [],
	SkillDescription[SKID.MB_MUNAKBALL] = [],
	SkillDescription[SKID.MB_SCROLL] = [],
	SkillDescription[SKID.MB_B_GATHERING] = [],
	SkillDescription[SKID.MB_M_GATHERING] = [],
	SkillDescription[SKID.MB_B_EXCLUDE] = [],
	SkillDescription[SKID.MB_B_DRIFT] = [],
	SkillDescription[SKID.MB_B_WALLRUSH] = [],
	SkillDescription[SKID.MB_M_WALLRUSH] = [],
	SkillDescription[SKID.MB_B_WALLSHIFT] = [],
	SkillDescription[SKID.MB_M_WALLCRASH] = [],
	SkillDescription[SKID.MB_M_REINCARNATION] = [],
	SkillDescription[SKID.MB_B_EQUIP] = [],
	SkillDescription[SKID.SL_DEATHKNIGHT] = [],
	SkillDescription[SKID.SL_COLLECTOR] = [],
	SkillDescription[SKID.SL_NINJA] = [],
	SkillDescription[SKID.SL_GUNNER] = [],
	SkillDescription[SKID.AM_TWILIGHT4] = [],
	SkillDescription[SKID.DE_BERSERKAIZER] = [],
	SkillDescription[SKID.DA_DARKPOWER] = [],
	SkillDescription[SKID.DE_PASSIVE] = [],
	SkillDescription[SKID.DE_PATTACK] = [],
	SkillDescription[SKID.DE_PSPEED] = [],
	SkillDescription[SKID.DE_PDEFENSE] = [],
	SkillDescription[SKID.DE_PCRITICAL] = [],
	SkillDescription[SKID.DE_PHP] = [],
	SkillDescription[SKID.DE_PSP] = [],
	SkillDescription[SKID.DE_RESET] = [],
	SkillDescription[SKID.DE_RANKING] = [],
	SkillDescription[SKID.DE_PTRIPLE] = [],
	SkillDescription[SKID.DE_ENERGY] = [],
	SkillDescription[SKID.DE_NIGHTMARE] = [],
	SkillDescription[SKID.DE_SLASH] = [],
	SkillDescription[SKID.DE_COIL] = [],
	SkillDescription[SKID.DE_WAVE] = [],
	SkillDescription[SKID.DE_REBIRTH] = [],
	SkillDescription[SKID.DE_AURA] = [],
	SkillDescription[SKID.DE_FREEZER] = [],
	SkillDescription[SKID.DE_CHANGEATTACK] = [],
	SkillDescription[SKID.DE_PUNISH] = [],
	SkillDescription[SKID.DE_POISON] = [],
	SkillDescription[SKID.DE_INSTANT] = [],
	SkillDescription[SKID.DE_WARNING] = [],
	SkillDescription[SKID.DE_RANKEDKNIFE] = [],
	SkillDescription[SKID.DE_RANKEDGRADIUS] = [],
	SkillDescription[SKID.DE_GAUGE] = [],
	SkillDescription[SKID.DE_GTIME] = [],
	SkillDescription[SKID.DE_GPAIN] = [],
	SkillDescription[SKID.DE_GSKILL] = [],
	SkillDescription[SKID.DE_GKILL] = [],
	SkillDescription[SKID.DE_ACCEL] = [],
	SkillDescription[SKID.DE_BLOCKDOUBLE] = [],
	SkillDescription[SKID.DE_BLOCKMELEE] = [],
	SkillDescription[SKID.DE_BLOCKFAR] = [],
	SkillDescription[SKID.DE_FRONTATTACK] = [],
	SkillDescription[SKID.DE_DANGERATTACK] = [],
	SkillDescription[SKID.DE_TWINATTACK] = [],
	SkillDescription[SKID.DE_WINDATTACK] = [],
	SkillDescription[SKID.DE_WATERATTACK] = [],
	SkillDescription[SKID.DA_ENERGY] = [],
	SkillDescription[SKID.DA_CLOUD] = [],
	SkillDescription[SKID.DA_FIRSTSLOT] = [],
	SkillDescription[SKID.DA_HEADDEF] = [],
	SkillDescription[SKID.DA_SPACE] = [],
	SkillDescription[SKID.DA_TRANSFORM] = [],
	SkillDescription[SKID.DA_EXPLOSION] = [],
	SkillDescription[SKID.DA_REWARD] = [],
	SkillDescription[SKID.DA_CRUSH] = [],
	SkillDescription[SKID.DA_ITEMREBUILD] = [],
	SkillDescription[SKID.DA_ILLUSION] = [],
	SkillDescription[SKID.DA_NUETRALIZE] = [],
	SkillDescription[SKID.DA_RUNNER] = [],
	SkillDescription[SKID.DA_TRANSFER] = [],
	SkillDescription[SKID.DA_WALL] = [],
	SkillDescription[SKID.DA_REVENGE] = [],
	SkillDescription[SKID.DA_EARPLUG] = [],
	SkillDescription[SKID.DA_CONTRACT] = [],
	SkillDescription[SKID.DA_BLACK] = [],
	SkillDescription[SKID.DA_DREAM] = [],
	SkillDescription[SKID.DA_MAGICCART] = [],
	SkillDescription[SKID.DA_COPY] = [],
	SkillDescription[SKID.DA_CRYSTAL] = [],
	SkillDescription[SKID.DA_EXP] = [],
	SkillDescription[SKID.DA_CARTSWING] = [],
	SkillDescription[SKID.DA_REBUILD] = [],
	SkillDescription[SKID.DA_JOBCHANGE] = [],
	SkillDescription[SKID.DA_EDARKNESS] = [],
	SkillDescription[SKID.DA_EGUARDIAN] = [],
	SkillDescription[SKID.DA_TIMEOUT] = [],
	SkillDescription[SKID.ALL_TIMEIN] = [],
	SkillDescription[SKID.DA_ZENYRANK] = [],
	SkillDescription[SKID.DA_ACCESSORYMIX] = [],
	SkillDescription[SKID.NPC_EARTHQUAKE] = [],
	SkillDescription[SKID.NPC_DRAGONFEAR] = [],
	SkillDescription[SKID.NPC_PULSESTRIKE] = [],
	SkillDescription[SKID.NPC_HELLJUDGEMENT] = [],
	SkillDescription[SKID.NPC_WIDESILENCE] = [],
	SkillDescription[SKID.NPC_WIDEFREEZE] = [],
	SkillDescription[SKID.NPC_WIDEBLEEDING] = [],
	SkillDescription[SKID.NPC_WIDESTONE] = [],
	SkillDescription[SKID.NPC_WIDECONFUSE] = [],
	SkillDescription[SKID.NPC_WIDESLEEP] = [],
	SkillDescription[SKID.NPC_EVILLAND] = [],
	SkillDescription[SKID.NPC_MAGICMIRROR] = [],
	SkillDescription[SKID.NPC_SLOWCAST] = [],
	SkillDescription[SKID.NPC_CRITICALWOUND] = [],
	SkillDescription[SKID.NPC_STONESKIN] = [],
	SkillDescription[SKID.NPC_ANTIMAGIC] = [],
	SkillDescription[SKID.NPC_WIDECURSE] = [],
	SkillDescription[SKID.NPC_WIDESTUN] = [],
	SkillDescription[SKID.NPC_VAMPIRE_GIFT] = [],
	SkillDescription[SKID.NPC_WIDESOULDRAIN] = [],
	SkillDescription[SKID.ALL_INCCARRY] = [
		"Enlarge Weight Limit",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase Maximum Weight Limit.^000000",
		"[Lv 1]: ^777777Maximum Weight +200^000000",
		"[Lv 2]: ^777777Maximum Weight +400^000000",
		"[Lv 3]: ^777777Maximum Weight +600^000000",
		"[Lv 4]: ^777777Maximum Weight +800^000000",
		"[Lv 5]: ^777777Maximum Weight +1000^000000",
		"[Lv 6]: ^777777Maximum Weight +1200^000000",
		"[Lv 7]: ^777777Maximum Weight +1400^000000",
		"[Lv 8]: ^777777Maximum Weight +1600^000000",
		"[Lv 9]: ^777777Maximum Weight +1800^000000",
		"[Lv 10]: ^777777Maximum Weight +2000^000000"
	].join("\n");

	SkillDescription[SKID.NPC_HELLPOWER] = [],
	SkillDescription[SKID.NPC_ALLHEAL] = [],
	SkillDescription[SKID.GM_SANDMAN] = [
		"Goodnight, Sweety",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Make the enemy fall asleep by singing an irresistible lullaby.^000000"
	].join("\n");

	SkillDescription[SKID.ALL_CATCRY] = [
		"Monster's Cry",
		"Description: ^777777Can hear a cat's crying for kicking the mice out.^000000"
	].join("\n");

	SkillDescription[SKID.ALL_PARTYFLEE] = [
		"Blowing Wind !!",
		"Description: ^777777Wind with Flowers^000000"
	].join("\n");

	SkillDescription[SKID.ALL_ANGEL_PROTECT] = [
		"Thank You So Much!!"
	].join("\n");

	SkillDescription[SKID.ALL_DREAM_SUMMERNIGHT] = [
		"Summer Dream",
		"Description: ^777777Feels like dreaming in the middle of summer.^000000"
	].join("\n");

	SkillDescription[SKID.ALL_REVERSEORCISH] = [],
	SkillDescription[SKID.ALL_PARTYFLEE] = [],
	SkillDescription[SKID.ALL_WEWISH] = [
		"Sing along with the Singing Crystal's tune:",
		"We wish you a Merry Christmas,",
		"and a Happy New Year!"
	].join("\n");

	SkillDescription[SKID.ALL_BUYING_STORE] = [
		"Buying Store",
		"Skill Form: Supportive",
		"Description: ^777777Open a simple store from which",
		"you can buy various items from others.",
		"Consumes 1 ^FF0000Bulk Buyer Shop License.^000000"
	].join("\n");

	SkillDescription[SKID.ALL_GUARDIAN_RECALL] = [
		"Call of Guardian",
		"Max Level: 1",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Move to Mora Town. 3 seconds of fixed casting. Cannot use it again for 5 minutes.^000000"
	].join("\n");

	SkillDescription[SKID.ALL_ODINS_POWER] = [
		"Odin's Power",
		"Skill Form: ^000099Active/ Buff^000000",
		"Description: Temporarily increases Magical and Physical attack damage but lowers DEF and MDEF",
		"[LV 1]: ^777777For 60 seconds ATK and MATK +70, DEF and MDEF -20.^000000",
		"[LV 2]: ^777777For 60 seconds ATK and MATK +100, DEF and MDEF -20.^000000",
	].join("\n");

	SkillDescription[SKID.KN_CHARGEATK] = [
		"Charge Attack",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Target : ^777777Enemy^000000",
		"Description: ^777777Charge toward a distant enemy.",
		"The further the enemy is, the stronger the",
		"attack becomes but increases casting time.^000000"
	].join("\n");

	SkillDescription[SKID.CR_SHRINK] = [
		"Shrink",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Shrink must be used together with",
		"the Auto Guard skill in order to have any",
		"effect. When a monster attacks and triggers",
		"the Guard effect, this skill adds a chance",
		"of pushing that monster 2 cells backward.",
		"The push back success rate is 5% for Level",
		"1 Auto Guard, and increases by 5% for each",
		"successive Auto Guard Skill Level. At Level",
		"10 Auto Guard, the push back success rate is",
		"50%. Shrink has a 5 minute duration, and is",
		"cancelled if it is double cast.^000000"
	].join("\n");

	SkillDescription[SKID.AS_SONICACCEL] = [
		"Sonic Acceleration",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase the Sonic Blow",
		"skill's success rate by 50%, and enhance",
		"its damage by 10%.^000000"
	].join("\n");

	SkillDescription[SKID.AS_VENOMKNIFE] = [
		"Venom Knife",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Active^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^702180Poison^777777 an enemy from a distance",
		"by throwing 1 ^008800Venom Knife^777777. Venom Knife item",
		"must be equipped to use this skill.^000000"
	].join("\n");

	SkillDescription[SKID.RG_CLOSECONFINE] = [
		"Close Confine",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Active^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Immobilize an enemy for 15 secs",
		"at the cost of also freezing the movements of",
		"the caster. The caster's Flee rate is",
		"increased by 10 during this skill's duration.",
		"This skill is canceled if caster or enemy dies",
		"or teleported.^000000"
	].join("\n");

	SkillDescription[SKID.WZ_SIGHTBLASTER] = [
		"Sight Blaster",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Active^000000",
		"Target: ^777777Caster^000000",
		"Description: ^777777Summon a protective fire ball that",
		"will encircle the caster for 2 minutes. When an",
		"enemy approaches the caster, the fire ball will",
		"inflict damage equal to caster's Matk, push the",
		"enemy backward, then the skill will cancel.",
		"Sight Blaster's knockback effect is cancelled",
		"during WoE.^000000"
	].join("\n");

	SkillDescription[SKID.SA_CREATECON] = [
		"Create Elemental Converter",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Consume certain items to create",
		"an Elemental Converter that will temporarily",
		"endow the user's attacks with an elemental",
		"property. There are 4 different kinds of",
		"Elemental Converters.",
		"Item Requirement :",
		"^FF0000Fire^777777 Converter: ^7777773 Scorpion Tails, 1 Blank Scroll^000000",
		"^cc5500Earth^777777 Converter: ^7777773 Horns, 1 Blank Scroll^000000",
		"^4cbb17Wind^777777 Converter: ^7777773 Rainbow Shells, 1 Blank Scroll^000000",
		"^0000BBWater^777777 Converter: ^7777773 Snail Shells, 1 Blank Scroll^000000"
	].join("\n");

	SkillDescription[SKID.SA_ELEMENTWATER] = [
		"Elemental Change (^0000BBWater^000000)",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Active^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Consume 1 Elemental Converter",
		"(Water Property) to attempt to change target",
		"monster's property to Water. This skill requires",
		"Elemental Converter items of the correct",
		"property, and has a chance of failing.^000000"
	].join("\n");

	SkillDescription[SKID.HT_PHANTASMIC] = [
		"Phantasmic Arrow",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Active^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Enable the caster to shoot a magic",
		"arrow without requiring actual arrows. Inflicts",
		"150% damage and pushes the enemy 3 cells",
		"backward after impact.^000000"
	].join("\n");

	SkillDescription[SKID.BA_PANGVOICE] = [
		"Pang Voice",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Active^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Scream at an enemy to inflict",
		"the Chaos effect. Pang Voice cannot be used",
		"against Boss monsters.^000000"
	].join("\n");

	SkillDescription[SKID.DC_WINKCHARM] = [
		"Charming Wink",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Wink at a target to prevent it from",
		"attacking the caster for 10 seconds. This",
		"skill's success rate increase when the caster's",
		"level is greater than the target. When cast",
		"against other players, this skill inflicts the",
		"Chaos effect by a low chance. Charming Wink",
		"can only be used against Angel, Demon and",
		"Demihuman monsters.",
		"Cannot be casted on Boss monsters.^000000"
	].join("\n");

	SkillDescription[SKID.BS_UNFAIRLYTRICK] = [
		"Dubious Salesmanship",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Reduce the amount of zeny",
		"consumed by the Mammonite skill by 10%.^000000"
	].join("\n");

	SkillDescription[SKID.BS_GREED] = [
		"Greed",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^7777772 cells around the Caster^000000",
		"Description: ^777777Automatically pick up every item",
		"within 2 cells of the caster. This skill cannot",
		"be used within towns, PvP maps, or in WoE.^000000"
	].join("\n");

	SkillDescription[SKID.PR_REDEMPTIO] = [
		"Redemptio",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Party Members^000000",
		"Description: ^777777Sacrifice yourself to revive every",
		"Party Member within the caster's screen,",
		"restoring 50% of their Max HP. The EXP penalty",
		"for the caster is decreased if more Party",
		"Members are revived. If the caster has less",
		"than 1% EXP for the current Base Level, then",
		"the skill cannot be cast.^000000"
	].join("\n");

	SkillDescription[SKID.MO_KITRANSLATION] = [
		"Spiritual Bestowment",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^7777771 Party Member^000000",
		"Description: ^777777Transfer the caster's Spiritual",
		"Spheres to a targeted Party Member. Each cast",
		"will transfer 1 Spiritual Sphere.^000000"
	].join("\n");

	SkillDescription[SKID.MO_BALKYOUNG] = [
		"Excruciating Palm",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Active^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Strike an enemy with the palm to",
		"inflict 300% damage, and push away enemies",
		"near the target, stunning them for 2 seconds.",
		"Each cast consumes a small HP amount.^000000"
	].join("\n");

	SkillDescription[SKID.SA_ELEMENTGROUND] = [
		"Elemental Change (^A68064Earth^000000)",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Active^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Consume 1 Elemental Converter",
		"(Earth Property) to attempt to change target",
		"monster's property to Earth. This skill requires",
		"Elemental Converter items of the correct",
		"property, and has a chance of failing.^000000"
	].join("\n");

	SkillDescription[SKID.SA_ELEMENTFIRE] = [
		"Elemental Change (^FF0000Fire^000000)",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Active^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Consume 1 Elemental Converter",
		"(Fire Property) to attempt to change target",
		"monster's property to Fire. This skill requires",
		"Elemental Converter items of the correct",
		"property, and has a chance of failing.^000000"
	].join("\n");

	SkillDescription[SKID.SA_ELEMENTWIND] = [
		"Elemental Change (^7BCC70Wind^000000)",
		"^CC3399Requirement: Finish Quest^000000",
		"Skill Form: ^339900Active^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Consume 1 Elemental Converter",
		"(Wind Property) to attempt to change target",
		"monster's property to Wind. This skill requires",
		"Elemental Converter items of the correct",
		"property, and has a chance of failing.^000000"
	].join("\n");

	SkillDescription[SKID.RK_ENCHANTBLADE] = [
		"Enchant Blade",
		"Max Level: 5",
		"^CC3399Requirement: Rune Mastery 2^000000",
		"Skill Form: ^339900Supportive^000000",
		"Target : ^777777Player^000000",
		"Description: ^777777Enchant your blade with magic,",
		"allowing you to deal additional magic with",
		"your physical attacks for 5 minutes. Amount",
		"of Matk goes up by skill level, and influenced",
		"by Base Level and INT.^000000",
		"[Lv 1]: ^777777MATK +120^000000",
		"[Lv 2]: ^777777MATK +140^000000",
		"[Lv 3]: ^777777MATK +160^000000",
		"[Lv 4]: ^777777MATK +180^000000",
		"[Lv 5]: ^777777MATK +200^000000"
	].join("\n");

	SkillDescription[SKID.RK_SONICWAVE] = [
		"Sonic Wave",
		"Max Level: 5",
		"^CC3399Requirement: Enchant Blade 3^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Smash your weapon to the",
		"ground creating a sonic wave to damage",
		"a target in the distance.^000000",
		"[Lv 1]: ^777777600% ATK^000000",
		"[Lv 2]: ^777777700% ATK^000000",
		"[Lv 3]: ^777777800% ATK^000000",
		"[Lv 4]: ^777777900% ATK^000000",
		"[Lv 5]: ^7777771000% ATK^000000"
	].join("\n");

	SkillDescription[SKID.RK_DEATHBOUND] = [
		"Death Bound",
		"Max Level: 10",
		"^CC3399Requirement: Auto Counter 1,",
		"Enchant Blade 2^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Amplify and counters damage",
		"received towards your enemy. Some of the",
		"amplified damage will also reflected on you.",
		"Cannot be used on Boss type monsters.^000000",
		"[Lv 1]: ^777777600% Damage Amplification^000000",
		"[Lv 2]: ^777777700% Damage Amplification^000000",
		"[Lv 3]: ^777777800% Damage Amplification^000000",
		"[Lv 4]: ^777777900% Damage Amplification^000000",
		"[Lv 5]: ^7777771000% Damage Amplification^000000",
		"[Lv 6]: ^7777771100% Damage Amplification^000000",
		"[Lv 7]: ^7777771200% Damage Amplification^000000",
		"[Lv 8]: ^7777771300% Damage Amplification^000000",
		"[Lv 9]: ^7777771400% Damage Amplification^000000",
		"[Lv 10]: ^7777771500% Damage Amplification^000000"
	].join("\n");

	SkillDescription[SKID.RK_HUNDREDSPEAR] = [
		"Hundred Spear",
		"Max Level: 10",
		"^CC3399Requirement: Phantom Thrust 3^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Spear exclusive skill. Pierces a",
		"target several times in a row. Has a chance of",
		"activating the highest learned level of Spear",
		"Boomerang if the caster learned that skill.",
		"If you learn skill Spiral pearce, it will",
		"increase damage infilcted. Has 5 cells range.^000000",
		"[Lv 1]: ^777777680% ATK, 13% Spear Boomerang",
		"trigger chance^000000",
		"[Lv 2]: ^777777760% ATK, 16% Spear Boomerang",
		"trigger chance^000000",
		"[Lv 3]: ^777777840% ATK, 19% Spear Boomerang",
		"trigger chance^000000",
		"[Lv 4]: ^777777920% ATK, 22% Spear Boomerang",
		"trigger chance^000000",
		"[Lv 5]: ^7777771000% ATK, 25% Spear Boomerang",
		"trigger chance^000000",
		"[Lv 6]: ^7777771080% ATK, 28% Spear Boomerang",
		"trigger chance^000000",
		"[Lv 7]: ^7777771160% ATK, 31% Spear Boomerang",
		"trigger chance^000000",
		"[Lv 8]: ^7777771240% ATK, 34% Spear Boomerang",
		"trigger chance^000000",
		"[Lv 9]: ^7777771320% ATK, 37% Spear Boomerang",
		"trigger chance^000000",
		"[Lv 10]: ^7777771400% ATK, 40% Spear Boomerang",
		"trigger chance^000000"
	].join("\n");

	SkillDescription[SKID.RK_WINDCUTTER] = [
		"Wind Cutter",
		"Max Level: 5",
		"^CC3399Requirement: Enchant Blade 5^000000",
		"Skill Form: ^FF0000Range Attack^000000",
		"Description: ^777777Swing your weapon and push an",
		"enemy down with the power of wind.",
		"Has a chance to inflict 'Fear'.^000000",
		"[Lv 1]: ^777777150% ATK, Fear chance 5%^000000",
		"[Lv 2]: ^777777200% ATK, Fear chance 7%^000000",
		"[Lv 3]: ^777777250% ATK, Fear chance 9%^000000",
		"[Lv 4]: ^777777300% ATK, Fear chance 11%^000000",
		"[Lv 5]: ^777777350% ATK, Fear chance 13%^000000"
	].join("\n");

	SkillDescription[SKID.RK_IGNITIONBREAK] = [
		"Ignition Break",
		"Max Level: 5",
		"^CC3399Requirement: Sonic Wave 2, Wind Cutter 3,",
		"Death Bound 5^000000",
		"Skill Form: ^FF0000Range Attack^000000",
		"Description: ^777777Struck the weapon to the ground",
		"causing strong explosion that damage all",
		"enemies around the caster. The closer the",
		"enemies the more damage they get.",
		"Adds additional damage when equipped with",
		"a fire property sword.^000000",
		"[Lv 1]: ^777777300%-250%-200% ATK^000000",
		"[Lv 2]: ^777777600%-500%-400% ATK^000000",
		"[Lv 3]: ^777777900%-750%-600% ATK^000000",
		"[Lv 4]: ^7777771200%-1000%-800% ATK^000000",
		"[Lv 5]: ^7777771500%-1250%-1000% ATK^000000"
	].join("\n");

	SkillDescription[SKID.RK_DRAGONTRAINING] = [
		"Dragon Training",
		"Max Level: 5",
		"^CC3399Requirement: Cavalier Mastery 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Decreases ASPD penalty from",
		"riding a dragon and increases the maximum",
		"weight limit. This skill increase Dragon",
		"Breath damage and allows Spear class",
		"weapon to ignore the size penalty and",
		"slightly increase attack power when riding",
		"a Dragon.^000000"
	].join("\n");

	SkillDescription[SKID.RK_DRAGONBREATH] = [
		"Dragon Breath",
		"Max Level: 10",
		"^CC3399Requirement: Dragon Training 2^000000",
		"Skill Form: ^FF0000Range Attack^000000",
		"Description: ^777777Commands the Dragon to spurt",
		"out scorching fire at a targeted location",
		"that will damage all enemies within its AOE.",
		"It has chance of causing ^FF0000Burning^777777 on enemy.",
		"The power of Dragon Breath depends on the",
		"condition of the rider.^000000"
	].join("\n");

	SkillDescription[SKID.RK_DRAGONHOWLING] = [
		"Dragon Howling",
		"Max Level: 5",
		"^CC3399Requirement: Dragon Training 2^000000",
		"Skill Form: ^FF0000Debuff^000000",
		"Description: ^777777Commands the dragon to howl,",
		"causing Fear status at a certain chance",
		"to all enemies in range.^000000",
		"[Lv 1]: ^7777773 cells AoE, 56% Fear Chance^000000",
		"[Lv 2]: ^7777774 cells AoE, 62% Fear Chance^000000",
		"[Lv 3]: ^7777775 cells AoE, 68% Fear Chance^000000",
		"[Lv 4]: ^7777776 cells AoE, 74% Fear Chance^000000",
		"[Lv 5]: ^7777777 cells AoE, 80% Fear Chance^000000"
	].join("\n");

	SkillDescription[SKID.RK_RUNEMASTERY] = [
		"Rune Mastery",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Rune Knights have gained the",
		"power to use Rune through Rune Mastery. This",
		"skill enable them to make Rune Stones and it",
		"affect success chance when making and using",
		"Rune Stones.",
		"1 Rune Gemstone and 1 Elder Branch will be",
		"consumed when making a Rune Stone and you",
		"need more material according to the type of",
		"Rune Stone. At lvl 5, you can make 1-2 Rune",
		"Stones at a time and from lvl 10, you can make",
		"1-3 Rune Stones.^000000",
		"[Lv 1]: ^702180Turisus Rune Stone^777777 : ^0088001 Blue Hair,",
		"1 Claw of Desert Wolf^000000",
		"[Lv 2]: ^702180Isia Rune Stone^777777 : ^0088001 Burning Heart^000000",
		"[Lv 3]: ^702180Pertz Rune Stone^777777 : ^0088001 Light Granule,",
		"1 Tangled Chain, 1 Dragon Canine^000000",
		"[Lv 4]: ^702180Hagalas Rune Stone^777777 : ^0088001 Round Shell,",
		"1 Dragon Skin^000000",
		"[Lv 5]: ^702180Asir Rune Stone^777777 : ^0088001 Light Granule,",
		"1 Ogre Tooth^000000",
		"[Lv 6]: ^702180Urj Rune Stone^777777 : ^0088001 Horrendous Hair,",
		"1 Honey^000000",
		"[Lv 7]: ^702180Rhydo Rune Stone^777777 : ^0088001 Light Granule,",
		"1 Red Gemstone^000000",
		"[Lv 8]: ^702180Nosiege Rune Stone^777777 : ^0088001 Light Granule",
		"1 Destroyed Armor, 1 Worn-out Magic Scroll^000000",
		"[Lv 9]: ^702180Verkana Rune Stone^777777 : ^0088001 Armor Piece of",
		"Dullahan^000000",
		"[Lv 10]: ^702180Lux Anima Rune Stone^777777 : ^0088003 Golds",
		"3 Light Granule^000000"
	].join("\n");

	SkillDescription[SKID.RK_MILLENNIUMSHIELD] = [],
	SkillDescription[SKID.RK_CRUSHSTRIKE] = [],
	SkillDescription[SKID.RK_REFRESH] = [],
	SkillDescription[SKID.RK_GIANTGROWTH] = [],
	SkillDescription[SKID.RK_STONEHARDSKIN] = [],
	SkillDescription[SKID.RK_VITALITYACTIVATION] = [],
	SkillDescription[SKID.RK_STORMBLAST] = [],
	SkillDescription[SKID.RK_FIGHTINGSPIRIT] = [],
	SkillDescription[SKID.RK_ABUNDANCE] = [],
	SkillDescription[SKID.RK_PHANTOMTHRUST] = [
		"Phantom Thrust",
		"Max Level: 5",
		"^CC3399Requirement: Brandish Spear 2^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Spear exclusive skill. Attack",
		"a distant enemy and pull them close to",
		"yourself. Can be used on a party member, but",
		"won't give damage. Gives additional damage",
		"when Spear Mastery is mastered.^000000",
		"[Lv 1]: ^77777750% ATK, 5 cells range^000000",
		"[Lv 2]: ^777777100% ATK, 6 cells range^000000",
		"[Lv 3]: ^777777150% ATK, 7 cells range^000000",
		"[Lv 4]: ^777777200% ATK, 8 cells range^000000",
		"[Lv 5]: ^777777250% ATK, 9 cells range^000000"
	].join("\n");

	SkillDescription[SKID.GC_VENOMIMPRESS] = [
		"Venom Impress",
		"Max Level: 5",
		"^CC3399Requirement: Enchant Poison 3^000000",
		"Skill Form: ^FF0000Active / Debuff^000000",
		"Description: ^777777Weaken the enemy's resistance",
		"against ^702180Poison^777777 property attacks.",
		"Has 10 cells range.^000000",
		"[Lv 1]: ^777777Poison resistance -10%^000000",
		"[Lv 2]: ^777777Poison resistance -20%^000000",
		"[Lv 3]: ^777777Poison resistance -30%^000000",
		"[Lv 4]: ^777777Poison resistance -40%^000000",
		"[Lv 5]: ^777777Poison resistance -50%^000000"
	].join("\n");

	SkillDescription[SKID.GC_CROSSIMPACT] = [
		"Cross Impact",
		"Max Level: 5",
		"^CC3399Requirement: Sonic Blow 10^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Attack 1 enemy with 7 fast hits.",
		"Damage increased based on base level.",
		"Has 3 cells range.^000000",
		"[Lv 1]: ^7777771100% ATK^000000",
		"[Lv 2]: ^7777771200% ATK^000000",
		"[Lv 3]: ^7777771300% ATK^000000",
		"[Lv 4]: ^7777771400% ATK^000000",
		"[Lv 5]: ^7777771500% ATK^000000"
	].join("\n");

	SkillDescription[SKID.GC_DARKILLUSION] = [
		"Dark Illusion",
		"Max Level: 5",
		"^CC3399Requirement: Cross Impact 3^000000",
		"Skill Form: ^FF0000Active / Damage - Special^000000",
		"Description: ^777777Quickly reach and attack an",
		"enemy. Has a low chance of activating Cross",
		"Impact.^000000",
		"[Lv 1]: ^777777100% ATK, 5 cells range^000000",
		"[Lv 2]: ^777777100% ATK, 6 cells range^000000",
		"[Lv 3]: ^777777100% ATK, 7 cells range^000000",
		"[Lv 4]: ^777777100% ATK, 8 cells range^000000",
		"[Lv 5]: ^777777100% ATK, 9 cells range^000000"
	].join("\n");

	SkillDescription[SKID.GC_RESEARCHNEWPOISON] = [
		"Research New Poison",
		"Max Level: 10",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enable to create new poisons.",
		"This skill extends the duration of the",
		"^00BB00Enchant Deadly Poison^777777 skill by (3*skill level)",
		"seconds. Requires ^008800Medicine Bowl^777777 and",
		"^008800Poison Kit^777777, along with additional materials,",
		"depending on the type of poison being made.^000000",
		"[Lv 1]: ^777777Success Rate 35%, ^702180Paralysis^777777:",
		"20 ^702180Poison Toad Skins^777777, 1 ^702180Poison Herb Amoena^000000",
		"[Lv 2]: ^777777Success Rate 40%, ^702180Pyrexia^777777:",
		"20 ^702180Anolian Skins^777777, 1 ^702180Poison Herb Rantana^000000",
		"[Lv 3]: ^777777Success Rate 45%, ^702180Death Hurt^777777:",
		"25 ^702180Decayed Nails^777777, 1 ^702180Poison Herb Seratum^000000",
		"[Lv 4]: ^777777Success Rate 50%, ^702180Leech End^777777:",
		"1 ^702180Poison Herb Scopolia^777777, 1 ^702180Poison Herb Nerium^000000",
		"[Lv 5]: ^777777Success Rate 55%, ^702180Antidote^777777:",
		"2 ^702180Green Herbs^777777, 1 ^702180Blue Herb^777777, 1 ^702180White Herb^000000",
		"[Lv 6]: ^777777Success Rate 60%, ^702180Venom Bleed^777777:",
		"10 ^702180Sticky Poisons^777777, 1 ^702180Izidor^000000",
		"[Lv 7]: ^777777Success Rate 65%, ^702180Magic Mushroom^777777:",
		"10 ^702180Poison Spores^777777, 1 ^702180Poison Herb Makulata^000000",
		"[Lv 8]: ^777777Success Rate 70%, ^702180Toxin^777777:",
		"10 ^702180Sticky Poisons^777777, 1 ^702180Poison Herb Nerium^000000",
		"[Lv 9]: ^777777Success Rate 75%, ^702180Oblivion Curse^777777:",
		"10 ^702180Heart Of Mermaids^777777, 1 ^702180Izidor^000000",
		"[Lv 10]: ^777777Success Rate 80%^000000"
	].join("\n");

	SkillDescription[SKID.GC_CREATENEWPOISON] = [
		"Create New Poison",
		"Max Level: 1",
		"^CC3399Requirement: Research New Poison 1^000000",
		"Skill Form: ^339900Active^000000",
		"Description: ^777777Create new poison from",
		"the list of possible poisons shown according",
		"to the level of New Poison Research and the",
		"materials you have.^000000"
	].join("\n");

	SkillDescription[SKID.GC_ANTIDOTE] = [
		"Antidote",
		"Max Level: 1",
		"^CC3399Requirement: Research New Poison 5^000000",
		"Skill Form: ^339900Active / Detoxification^000000",
		"Description: ^777777Remove Guillotine Cross's",
		"poison effect on 1 target.",
		"Consume 1 ^008800Antidote^777777.^000000"
	].join("\n");

	SkillDescription[SKID.GC_POISONINGWEAPON] = [
		"Poisoning Weapon",
		"Max Level: 5",
		"^CC3399Requirement: Research New Poison 1^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Make the caster's weapon",
		"poisoned by Guillotine Cross's new poison.^000000",
		"[Lv 1]: ^7777774% Rate, 60 sec. duration^000000",
		"[Lv 2]: ^7777776% Rate, 120 sec. duration^000000",
		"[Lv 3]: ^7777778% Rate, 180 sec. duration^000000",
		"[Lv 4]: ^77777710% Rate, 240 sec. duration^000000",
		"[Lv 5]: ^77777712% Rate, 300 sec. duration^000000"
	].join("\n");

	SkillDescription[SKID.GC_WEAPONBLOCKING] = [
		"Weapon Blocking",
		"Max Level: 5",
		"^CC3399Requirement: Lefthand Mastery 5^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Has a chance to cancel enemy's",
		"melee physical attack when skill is active.",
		"Can use Counter Slash or Weapon Crush",
		"successively. Continuously consumes SP",
		"while this skill is activated. If skill is",
		"recasted, Weapon Blocking will be canceled.",
		"Skill Duration is 180 seconds^000000",
		"[Lv 1]: ^77777712% block rate^000000",
		"[Lv 2]: ^77777714% block rate^000000",
		"[Lv 3]: ^77777716% block rate^000000",
		"[Lv 4]: ^77777718% block rate^000000",
		"[Lv 5]: ^77777720% block rate^000000"
	].join("\n");

	SkillDescription[SKID.GC_COUNTERSLASH] = [
		"Counter Slash",
		"Max Level: 5",
		"^CC3399Requirement: Weapon Blocking 1^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777When an attack successfully",
		"blocked by Weapon Blocking, you can attack",
		"the enemy successively with Counter Slash.",
		"Inflict damage to all enemies in 3x3 cells",
		"from the caster. Increase damage based on",
		"character's Base lvl, Job lvl and AGI.^000000",
		"[Lv 1]: ^777777400% ATK^000000",
		"[Lv 2]: ^777777500% ATK^000000",
		"[Lv 3]: ^777777600% ATK^000000",
		"[Lv 4]: ^777777700% ATK^000000",
		"[Lv 5]: ^777777800% ATK^000000"
	].join("\n");

	SkillDescription[SKID.GC_WEAPONCRUSH] = [
		"Weapon Crush",
		"Max Level: 5",
		"^CC3399Requirement: Weapon Blocking 1^000000",
		"Skill Form: ^FF0000Active / Debuff^000000",
		"Description: ^777777When an attack successfully",
		"blocked by Weapon Blocking, you can attack",
		"the enemy successively with Weapon Crush.",
		"Able to divest the target's weapon. Skill level",
		"affect the duration and success rate.^000000"
	].join("\n");

	SkillDescription[SKID.GC_VENOMPRESSURE] = [
		"Venom Pressure",
		"Max Level: 5",
		"^CC3399Requirement: Weapon Blocking 1,",
		"Poisoning Weapon 3^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Poisons the enemy with the",
		"poisoned weapon. After casting the skill,",
		"the effect of Poisoning Weapon is canceled.^000000",
		"[Lv 1]: ^777777Poisoning Rate 75%, HIT +14^000000",
		"[Lv 2]: ^777777Poisoning Rate 80%, HIT +18^000000",
		"[Lv 3]: ^777777Poisoning Rate 85%, HIT +22^000000",
		"[Lv 4]: ^777777Poisoning Rate 90%, HIT +26^000000",
		"[Lv 5]: ^777777Poisoning Rate 95%, HIT +30^000000"
	].join("\n");

	SkillDescription[SKID.GC_POISONSMOKE] = [
		"Poison Smoke",
		"Max Level: 5",
		"^CC3399Requirement: Venom Pressure 5,",
		"Poisoning Weapon 5^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777With Poisoning Weapon activated,",
		"spread a poisonous smoke around 5x5 cells.",
		"Enemy in the range have a 50% chance of",
		"getting poisoned every 2 seconds.",
		"Has 5 cells range.^000000",
		"[Lv 1]: ^77777710 sec. duration^000000",
		"[Lv 2]: ^77777712 sec. duration^000000",
		"[Lv 3]: ^77777714 sec. duration^000000",
		"[Lv 4]: ^77777716 sec. duration^000000",
		"[Lv 5]: ^77777718 sec. duration^000000"
	].join("\n");

	SkillDescription[SKID.GC_CLOAKINGEXCEED] = [
		"Cloaking Exceed",
		"Max Level: 5",
		"^CC3399Requirement: Cloaking 3^000000",
		"Skill Form: ^339900Active / Special^000000",
		"Description: ^777777Cannot be detected by Insect",
		"and Demon type monsters. Able to endure",
		"damage for a few times, depend on the skill",
		"level. Increase movement speed according to",
		"skill Level.^000000",
		"[Lv 1]: ^777777100% movement speed, endure 1 ",
		"damage, consume 9 sp/sec^000000",
		"[Lv 2]: ^777777110% movement speed, endure 1",
		"damage, consume 8 sp/sec^000000",
		"[Lv 3]: ^777777120% movement speed, endure 2",
		"damage, consume 7 sp/sec^000000",
		"[Lv 4]: ^777777130% movement speed, endure 2",
		"damage, consume 6 sp/sec^000000",
		"[Lv 5]: ^777777140% movement speed, endure 3",
		"damage, consume 5 sp/sec^000000"
	].join("\n");

	SkillDescription[SKID.GC_PHANTOMMENACE] = [
		"Phantom Menace",
		"Max Level: 1",
		"^CC3399Requirement: Dark Illusion 5,",
		"Cloaking Exceed 5^000000",
		"Skill Form: ^339900Active / Detecting^000000",
		"Description: ^777777Guillotine Cross attacks all",
		"hidden enemies within a 7x7 range for 300%",
		"damage. The enemies who get hit by this can",
		"be seen.^000000"
	].join("\n");

	SkillDescription[SKID.GC_HALLUCINATIONWALK] = [
		"Hallucination Walk",
		"Max Level: 5",
		"^CC3399Requirement: Phantom Menace 1^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Increase the caster's speed to",
		"the maximum, increases Flee rate and certain",
		"chance to ignore MATK. Consumes HP when",
		"casting, decreases movement speed and",
		"ASPD by half for 25 seconds after using",
		"the skill.^000000",
		"[Lv 1]: ^777777Flee +50, ignore MATK chance 10%^000000",
		"[Lv 2]: ^777777Flee +100, ignore MATK chance 20%^000000",
		"[Lv 3]: ^777777Flee +150, ignore MATK chance 30%^000000",
		"[Lv 4]: ^777777Flee +200, ignore MATK chance 40%^000000",
		"[Lv 5]: ^777777Flee +250, ignore MATK chance 50%^000000"
	].join("\n");

	SkillDescription[SKID.GC_ROLLINGCUTTER] = [
		"Rolling Cutter",
		"Max Level: 5",
		"^CC3399Requirement: Sonic Blow 10^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Katar exclusive skill, gives",
		"damage to enemies within range by spinning",
		"with a Katar. Your spinning counter is",
		"accumulated whenever you spin and it ",
		"increase the damage of Cross Ripper",
		"Slasher. Spinning counter can be",
		"accumulated maximum 10 times.^000000",
		"[Lv 1]: ^777777100% ATK, 3x3 cells AoE^000000",
		"[Lv 2]: ^777777150% ATK, 3x3 cells AoE^000000",
		"[Lv 3]: ^777777200% ATK, 3x3 cells AoE^000000",
		"[Lv 4]: ^777777250% ATK, 3x3 cells AoE^000000",
		"[Lv 5]: ^777777300% ATK, 5x5 cells AoE^000000"
	].join("\n");

	SkillDescription[SKID.GC_CROSSRIPPERSLASHER] = [
		"Cross Ripper Slasher",
		"Max Level: 5",
		"^CC3399Requirement: Rolling Cutter 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Can be activated by consuming",
		"spinning counts from Rolling Cutter.",
		"Guillotine Cross throws a knife at a target",
		"in range while spinning, causing significant",
		"amount of damage. Damage is increased by",
		"the number of counters.^000000",
		"[Lv 1]: ^777777480% ATK, 9 cells range^000000",
		"[Lv 2]: ^777777560% ATK, 10 cells range^000000",
		"[Lv 3]: ^777777640% ATK, 11 cells range^000000",
		"[Lv 4]: ^777777720% ATK, 12 cells range^000000",
		"[Lv 5]: ^777777800% ATK, 13 cells range^000000"
	].join("\n");

	SkillDescription[SKID.AB_JUDEX] = [
		"Judex",
		"Max Level: 5",
		"^CC3399Requirement: Turn Undead 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^777777Holy^000000",
		"Description: ^777777A magic attack that deals Holy",
		"property damage to a target and all enemies",
		"in the surrounding 3 cells.^000000",
		"[Lv 1]: ^777777300% MATK^000000",
		"[Lv 2]: ^777777320% MATK^000000",
		"[Lv 3]: ^777777340% MATK^000000",
		"[Lv 4]: ^777777360% MATK^000000",
		"[Lv 5]: ^777777400% MATK^000000"
	].join("\n");

	SkillDescription[SKID.AB_ANCILLA] = [
		"Ancilla",
		"Max Level: 1",
		"^CC3399Requirement: Clementia 3^000000",
		"Skill Form: ^339900Create Ancilla^000000",
		"Description: ^777777Create Ancilla, the magic stone.",
		"Consume 30% of SP and 1 Blue Gemstone.^000000"
	].join("\n");

	SkillDescription[SKID.AB_ADORAMUS] = [
		"Adoramus",
		"Max Level: 10",
		"^CC3399Requirement: Magnus Exorcismus 1, Judex 5,",
		"Ancilla 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Property: ^777777Holy^000000",
		"Description: ^777777Strikes a single target for",
		"damage with a powerful Holy light that also",
		"causes blind and decrease AGI effect.",
		"This skill consumes 1 Blue Gemstone.",
		"If the caster is standing next to another",
		"Acolyte type character, no gemstone is",
		"required, but will consume some SP from",
		"that supportive character.^000000",
		"[Lv 1]: ^777777MATK 600%^000000",
		"[Lv 2]: ^777777MATK 700%^000000",
		"[Lv 3]: ^777777MATK 800%^000000",
		"[Lv 4]: ^777777MATK 900%^000000",
		"[Lv 5]: ^777777MATK 1000%^000000",
		"[Lv 6]: ^777777MATK 1100%^000000",
		"[Lv 7]: ^777777MATK 1200%^000000",
		"[Lv 8]: ^777777MATK 1300%^000000",
		"[Lv 9]: ^777777MATK 1400%^000000",
		"[Lv 10]: ^777777MATK 1500%^000000"
	].join("\n");

	SkillDescription[SKID.AB_CLEMENTIA] = [
		"Clementia",
		"Max Level: 3",
		"^CC3399Requirement: Blessing 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Casts 'Blessing' on the caster",
		"and any party members within it's range.",
		"Blessing effect goes up based on caster's",
		"Job Level.^000000",
		"[Lv 1]: ^7777773x3 AoE, 120 sec. duration^000000",
		"[Lv 2]: ^7777777x7 AoE, 180 sec. duration^000000",
		"[Lv 3]: ^77777715x15 AoE, 240 sec. duration^000000"
	].join("\n");

	SkillDescription[SKID.AB_CANTO] = [
		"Cantocandidus",
		"Max Level: 3",
		"^CC3399Requirement: Increase Agility 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Cast 'Increase Agility' on the",
		"caster and any party members within range.",
		"AGI effect goes up based on caster's Job",
		"Level.^000000",
		"[Lv 1]: ^7777773x3 AoE, 120 sec. duration^000000",
		"[Lv 2]: ^7777777x7 AoE, 180 sec. duration^000000",
		"[Lv 3]: ^77777715x15 AoE, 240 sec. duration^000000"
	].join("\n");

	SkillDescription[SKID.AB_CHEAL] = [
		"Coluseo Heal",
		"Max Level: 3",
		"^CC3399Requirement: Heal 1^000000",
		"Skill Form: ^339900Heal^000000",
		"Description: ^777777Recover HP of all party members",
		"around the caster. Additional heal given",
		"based on party member number.^000000",
		"[Lv 1]: ^7777773x3 AoE^000000",
		"[Lv 2]: ^7777777x7 AoE^000000",
		"[Lv 3]: ^77777715x15 AoE^000000"
	].join("\n");

	SkillDescription[SKID.AB_EPICLESIS] = [
		"Epiclesis",
		"Max Level: 5",
		"^CC3399Requirement: Ancilla 1,",
		"Highness Heal 1^000000",
		"Skill Form: ^339900Summon^000000",
		"Description: ^777777Summon the Tree of Life that",
		"revives any dead characters within 5x5",
		"cell range of the tree, while increasing",
		"MaxHP and recovering HP and SP.",
		"Consumes 1 ^008800Ancilla^777777 and 1 ^008800Holy Water^777777.^000000",
		"[Lv 1]: ^777777MaxHP +5%, Recover 3% HP and",
		"2% SP every 3 sec^000000",
		"[Lv 2]: ^777777MaxHP +10%, Recover 3% HP and",
		"2% SP every 3 sec^000000",
		"[Lv 3]: ^777777MaxHP +15%, Recover 4% HP and",
		"3% SP every 3 sec^000000",
		"[Lv 4]: ^777777MaxHP +20%, Recover 4% HP and",
		"3% SP every 3 sec^000000",
		"[Lv 5]: ^777777MaxHP +25%, Recover 5% HP and",
		"4% SP every 3 sec^000000"
	].join("\n");

	SkillDescription[SKID.AB_PRAEFATIO] = [
		"Praefatio",
		"Max Level: 10",
		"^CC3399Requirement: Kyrie Eleison 1^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Casts 'Kyrie Eleison' on all",
		"party members. Def effect goes up when",
		"more party member joins.^000000",
		"[Lv 1]: ^777777Defend 7 times^000000",
		"[Lv 2]: ^777777Defend 8 times^000000",
		"[Lv 3]: ^777777Defend 9 times^000000",
		"[Lv 4]: ^777777Defend 10 times^000000",
		"[Lv 5]: ^777777Defend 11 times^000000",
		"[Lv 6]: ^777777Defend 12 times^000000",
		"[Lv 7]: ^777777Defend 13 times^000000",
		"[Lv 8]: ^777777Defend 14 times^000000",
		"[Lv 9]: ^777777Defend 15 times^000000",
		"[Lv 10]: ^777777Defend 16 times^000000"
	].join("\n");

	SkillDescription[SKID.AB_ORATIO] = [
		"Oratio",
		"Max Level: 10",
		"^CC3399Requirement: Praefatio 5^000000",
		"Skill Form: ^FF0000Debuff^000000",
		"Description: ^777777Decreases the Holy resistance",
		"of all enemies on screen for 30 seconds.^000000",
		"[Lv 1]: ^777777Success Rate 45%/resistance -2%^000000",
		"[Lv 2]: ^777777Success Rate 50%/resistance -4%^000000",
		"[Lv 3]: ^777777Success Rate 55%/resistance -6%^000000",
		"[Lv 4]: ^777777Success Rate 60%/resistance -8%^000000",
		"[Lv 5]: ^777777Success Rate 65%/resistance -10%^000000",
		"[Lv 6]: ^777777Success Rate 70%/resistance -12%^000000",
		"[Lv 7]: ^777777Success Rate 75%/resistance -14%^000000",
		"[Lv 8]: ^777777Success Rate 80%/resistance -16%^000000",
		"[Lv 9]: ^777777Success Rate 85%/resistance -18%^000000",
		"[Lv 10]: ^777777Success Rate 90%/resistance -20%^000000"
	].join("\n");

	SkillDescription[SKID.AB_LAUDAAGNUS] = [
		"Lauda Agnus",
		"Max Level: 4",
		"^CC3399Requirement: Status Recovery 1^000000",
		"Skill Form: ^777777Recover^000000",
		"Description: ^777777Recover ^702180Freezing, Stone Curse,",
		"Frozen, Crystallization, Blind^777777 and ^702180Burning^777777",
		"from all party members. Give VIT bonus",
		"when casting on normal condition party",
		"member.^000000",
		"[Lv 1]: ^777777Success Rate 50%^000000",
		"[Lv 2]: ^777777Success Rate 60%^000000",
		"[Lv 3]: ^777777Success Rate 70%^000000",
		"[Lv 4]: ^777777Success Rate 80%^000000"
	].join("\n");

	SkillDescription[SKID.AB_LAUDARAMUS] = [
		"Lauda Ramus",
		"Max Level: 4",
		"^CC3399Requirement: Lauda Agnus 2^000000",
		"Skill Form: ^339900Recovery^000000",
		"Description: ^777777Cures status effects ^702180Silence,",
		"Sleep, Deep Sleep, Stun^777777 and ^702180Mandragora",
		"Howling^777777 from all party members.",
		"Give LUK bonus when casting on normal",
		"condition party member.^000000",
		"[Lv 1]: ^777777Success Rate 50%^000000",
		"[Lv 2]: ^777777Success Rate 60%^000000",
		"[Lv 3]: ^777777Success Rate 70%^000000",
		"[Lv 4]: ^777777Success Rate 80%^000000"
	].join("\n");

	SkillDescription[SKID.AB_EUCHARISTICA] = [
		"Eucharistica",
		"Max Level:  10",
		"^CC3399Requirement: Epiclesis 1, Expiatio 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase ATK against Undead",
		"and Dark property enemies and decrease",
		"the damage the caster gets.^000000",
		"[Lv 1]: ^777777ATK +1% / Damage -1%^000000",
		"[Lv 2]: ^777777ATK +2% / Damage -2%^000000",
		"[Lv 3]: ^777777ATK +3% / Damage -3%^000000",
		"[Lv 4]: ^777777ATK +4% / Damage -4%^000000",
		"[Lv 5]: ^777777ATK +5% / Damage -5%^000000",
		"[Lv 6]: ^777777ATK +6% / Damage -6%^000000",
		"[Lv 7]: ^777777ATK +7% / Damage -7%^000000",
		"[Lv 8]: ^777777ATK +8% / Damage -8%^000000",
		"[Lv 9]: ^777777ATK +9% / Damage -9%^000000",
		"[Lv 10]: ^777777ATK +10% / Damage -10%^000000"
	].join("\n");

	SkillDescription[SKID.AB_RENOVATIO] = [
		"Renovatio",
		"Max Level:  1",
		"^CC3399Requirement: Coluseo Heal 3^000000",
		"Skill Form: ^339900Heal^000000",
		"Description: ^777777Recover 3% of max HP for",
		"1 min 30 secs. When used on Undead",
		"monsters, it does high damage in",
		"proportion to the caster's level.^000000"
	].join("\n");

	SkillDescription[SKID.AB_HIGHNESSHEAL] = [
		"Highness Heal",
		"Max Level: 5",
		"^CC3399Requirement: Renovatio 1^000000",
		"Skill Form: ^339900Heal^000000",
		"Description: ^777777Restores large amount of HP^000000",
		"[Lv 1]: ^777777Healing Amount x2^000000",
		"[Lv 2]: ^777777Healing Amount x2.3^000000",
		"[Lv 3]: ^777777Healing Amount x2.6^000000",
		"[Lv 4]: ^777777Healing Amount x2.9^000000",
		"[Lv 5]: ^777777Healing Amount x3.2^000000"
	].join("\n");

	SkillDescription[SKID.AB_CLEARANCE] = [
		"Clearance",
		"Max Level: 5",
		"^CC3399Requirement: Lauda Ramus 2^000000",
		"Skill Form: ^339900Special^000000",
		"Description: ^777777Release all buff, debuff and",
		"curse of party members and the monsters.^000000",
		"[Lv 1]: ^777777Success Rate 68%^000000",
		"[Lv 2]: ^777777Success Rate 76%^000000",
		"[Lv 3]: ^777777Success Rate 84%^000000",
		"[Lv 4]: ^777777Success Rate 92%^000000",
		"[Lv 5]: ^777777Success Rate 100%^000000"
	].join("\n");

	SkillDescription[SKID.AB_EXPIATIO] = [
		"Expiatio",
		"Max Level: 5",
		"^CC3399Requirement: Oratio 5, Duple Light 5^000000",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Give Holy power to the",
		"caster's weapon and have certain chance to",
		"ignore the target's defense rate in a melee",
		"physical attack.^000000",
		"[Lv 1]: ^777777Ignore Defense +5%^000000",
		"[Lv 2]: ^777777Ignore Defense +10%^000000",
		"[Lv 3]: ^777777Ignore Defense +15%^000000",
		"[Lv 4]: ^777777Ignore Defense +20%^000000",
		"[Lv 5]: ^777777Ignore Defense +25%^000000"
	].join("\n");

	SkillDescription[SKID.AB_DUPLELIGHT] = [
		"Duple Light",
		"Max Level: 10",
		"^CC3399Requirement: Aspersio 1^000000",
		"Skill Form: ^339900Active^000000",
		"Description: ^777777Summons two sacred lights,",
		"Violet Granium light and yellow Merriam",
		"light, assisting the Caster in battle.",
		"When caster attacks in melee, the target",
		"has a chance of taking additional physical",
		"and magical damage^000000",
		"[Lv 1]: ^777777ATK +110%, MATK +220%",
		"90 sec duration.^000000",
		"[Lv 2]: ^777777ATK +120%, MATK +240%",
		"120 sec duration.^000000",
		"[Lv 3]: ^777777ATK +130%, MATK +260%",
		"150 sec duration.^000000",
		"[Lv 4]: ^777777ATK +140%, MATK +280%",
		"180 sec duration.^000000",
		"[Lv 5]: ^777777ATK +150%, MATK +300%",
		"210 sec duration.^000000",
		"[Lv 6]: ^777777ATK +160%, MATK +320%",
		"240 sec duration.^000000",
		"[Lv 7]: ^777777ATK +170%, MATK +340%",
		"270 sec duration.^000000",
		"[Lv 8]: ^777777ATK +180%, MATK +360%",
		"300 sec duration.^000000",
		"[Lv 9]: ^777777ATK +190%, MATK +380%",
		"330 sec duration.^000000",
		"[Lv 10]: ^777777ATK +200%, MATK +400%",
		"360 sec duration.^000000"
	].join("\n");

	SkillDescription[SKID.AB_DUPLELIGHT_MELEE] = [],
	SkillDescription[SKID.AB_DUPLELIGHT_MAGIC] = [],
	SkillDescription[SKID.AB_SILENTIUM] = [
		"Silentium",
		"Max Level: 5",
		"^CC3399Requirement: Clearance 1^000000",
		"Skill Form: ^FF0000Debuff^000000",
		"Description: ^777777Cast Lex Divina to the target",
		"within the certain range from the caster.^000000",
		"[Lv 1]: ^7777779x9 AoE^000000",
		"[Lv 2]: ^77777711x11 AoE^000000",
		"[Lv 3]: ^77777713x13 AoE^000000",
		"[Lv 4]: ^77777715x15 AoE^000000",
		"[Lv 5]: ^77777717x17 AoE^000000"
	].join("\n");

	SkillDescription[SKID.WL_WHITEIMPRISON] = [
		"White Imprison",
		"Max Level: 5",
		"^CC3399Requirement: Soul Expansion 3^000000",
		"Skill Form: ^777777Curse^000000",
		"Description: ^777777Locks a target in a transparent",
		"box that prevents damage except from Ghost",
		"property damage. Can cast on oneself lasting",
		"for 5 sec. When the duration is finished, the",
		"caster loses HP of Skill Level x400. Success",
		"Rate increases according to the caster's Job",
		"Level. Not effective on Boss monsters.^000000",
		"[Lv 1]: ^777777Success Rate 50% / 10 sec. duration^000000",
		"[Lv 2]: ^777777Success Rate 60% / 12 sec. duration^000000",
		"[Lv 3]: ^777777Success Rate 70% / 14 sec. duration^000000",
		"[Lv 4]: ^777777Success Rate 80% / 16 sec. duration^000000",
		"[Lv 5]: ^777777Success Rate 90% / 18 sec. duration^000000"
	].join("\n");

	SkillDescription[SKID.WL_SOULEXPANSION] = [
		"Soul Expansion",
		"Max Level: 5",
		"^CC3399Requirement: Drain Life 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Deals Ghost Element damage to a target in distance with Psychokinesis. Psychokinesis attack hits a target twice, causing its body to expand and explode.^000000",
		"[Lv 1]: ^77777730 SP / 3x3 Aoe^000000",
		"[Lv 2]: ^77777735 SP / 3x3 Aoe^000000",
		"[Lv 3]: ^77777740 SP / 3x3 Aoe^000000",
		"[Lv 4]: ^77777745 SP / 5x5 Aoe^000000",
		"[Lv 5]: ^77777750 SP / 5x5 Aoe^000000"
	].join("\n");

	SkillDescription[SKID.WL_FROSTMISTY] = [
		"Frost Misty",
		"Max Level: 5",
		"^CC3399Requirement: Summon Waterball 1^000000",
		"Skill Form: ^FF0000Debuff^000000",
		"Description: ^777777Releases freezing mist around an area, dealing damage and inflicting Freezing status on all enemies.^000000",
		"[Lv 1]: ^777777Freezing Success Rate 30% / Magic Damage 300%^000000",
		"[Lv 2]: ^777777Freezing Success Rate 44% / Magic Damage 400%^000000",
		"[Lv 3]: ^777777Freezing Success Rate 56% / Magic Damage 500%^000000",
		"[Lv 4]: ^777777Freezing Success Rate 68% / Magic Damage 600%^000000",
		"[Lv 5]: ^777777Freezing Success Rate 80% / Magic Damage 700%^000000"
	].join("\n");

	SkillDescription[SKID.WL_JACKFROST] = [
		"Jack Frost",
		"Max Level: 5",
		"^CC3399Requirement: Frost Misty 2^000000",
		"Skill Form: ^FF0000Debuff^000000",
		"Description: ^777777Deals Water Element damage to all targets inflicted with Freezing status.^000000",
		"[Lv 1]: ^777777Magic Damage 600%^000000",
		"[Lv 2]: ^777777Magic Damage 700%^000000",
		"[Lv 3]: ^777777Magic Damage 800%^000000",
		"[Lv 4]: ^777777Magic Damage 900%^000000",
		"[Lv 5]: ^777777Magic Damage 1000%^000000"
	].join("\n");

	SkillDescription[SKID.WL_MARSHOFABYSS] = [
		"Marsh Of Abyss",
		"Max Level: 5",
		"^CC3399Requirement: Quagmire 1^000000",
		"Skill Form: ^FF0000Debuff^000000",
		"Description: ^777777Curses a target, reduce its",
		"movement speed, AGI and DEX.",
		"Caster's INT and job level increase its",
		"effects.^000000",
		"[Lv 1]: ^777777-10% movement speed^000000",
		"[Lv 2]: ^777777-20% movement speed^000000",
		"[Lv 3]: ^777777-30% movement speed^000000",
		"[Lv 4]: ^777777-40% movement speed^000000",
		"[Lv 5]: ^777777-50% movement speed^000000"
	].join("\n");

	SkillDescription[SKID.WL_RECOGNIZEDSPELL] = [
		"Recognized Spell",
		"Max Level: 5",
		"^CC3399Requirement: Release 2 , Stasis 1, White Imprison 1^000000",
		"Skill Form: ^777777Buff(Self)^000000",
		"Description: ^777777Maximizes one's own magical potential, dealing maximum damage with magical attacks for the skill duration. Increases SP Consumption by 25%^000000",
		"[Lv 1]: ^777777100 SP / 60 sec. duration^000000",
		"[Lv 2]: ^777777120 SP / 90 sec. duration^000000",
		"[Lv 3]: ^777777140 SP / 110 sec. duration^000000",
		"[Lv 4]: ^777777160 SP / 140 sec. duration^000000",
		"[Lv 5]: ^777777180 SP / 170 sec. duration^000000"
	].join("\n");

	SkillDescription[SKID.WL_SIENNAEXECRATE] = [
		"Sienna Execrate",
		"Max Level: 5",
		"^CC3399Requirement: Summon Stone 1^000000",
		"Skill Form: ^777777Curse^000000",
		"Description: ^777777All targets in range will be Petrified at a certain chance.^000000",
		"[Lv 1]: ^77777732 SP / 50% Success Rate",
		"				3x3 cells / 6 sec. duration^000000",
		"[Lv 2]: ^77777734 SP / 55% Success Rate",
		"				5x5 cells / 9 sec. duration^000000",
		"[Lv 3]: ^77777736 SP / 60% Success Rate",
		"				5x5 cells / 12 sec. duration^000000",
		"[Lv 4]: ^77777738 SP / 65% Success Rate",
		"				7x7 cells / 15 sec. duration^000000",
		"[Lv 5]: ^77777740 SP / 70% Success Rate",
		"				7x7 cells / 18 sec. duration^000000"
	].join("\n");

	SkillDescription[SKID.WL_RADIUS] = [
		"Radius",
		"Max Level: 3",
		"^CC3399Requirement: Warlock Basic Skill^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase magic skill range of",
		"the Warlock and slightly increase",
		"casting speed.^000000",
		"[Lv 1]: ^77777780 SP / Casting Range +1 Cell",
		"				Decrease fixed casting speed by 10%^000000",
		"[Lv 2]: ^777777100 SP / Casting Range +2 Cells",
		"				Decrease fixed casting speed by 15%^000000",
		"[Lv 3]: ^777777120 SP / Casting Range +3 Cells",
		"				Decrease fixed casting speed by 20%^000000"
	].join("\n");

	SkillDescription[SKID.WL_STASIS] = [
		"Stasis",
		"Max Level: 5",
		"^CC3399Requirement: Drain Life 1^000000",
		"Skill Form: ^777777Curse^000000",
		"Description: ^777777Stops the air around the Caster, preventing any spells from being cast.^000000",
		"[Lv 1]: ^77777750 SP / 10sec. duration / 19x19 AoE^000000",
		"[Lv 2]: ^77777760 SP / 15sec. duration / 21x21 AoE^000000",
		"[Lv 3]: ^77777770 SP / 20sec. duration / 23x23 AoE^000000",
		"[Lv 4]: ^77777780 SP / 25sec. duration / 25x25 AoE^000000",
		"[Lv 5]: ^77777790 SP / 30sec. duration / 27x27 AoE^000000"
	].join("\n");

	SkillDescription[SKID.WL_DRAINLIFE] = [
		"Drain Life",
		"Max Level: 5",
		"^CC3399Requirement: Radius 1^000000",
		"Skill Form: ^777777Damage / Recover^000000",
		"Description: ^777777Deals magic damage on a target, draining a certain amount of HP.^000000",
		"[Lv 1]: ^77777720 SP / Absorb 10% of Damage",
		"Absorb Success Rate 75%^000000",
		"[Lv 2]: ^77777724 SP / Absorb 15% of Damage",
		"Absorb Success Rate 80%^000000",
		"[Lv 3]: ^77777728 SP / Absorb 20% of Damage",
		"Absorb Success Rate 85%^000000",
		"[Lv 4]: ^77777732 SP / Absorb 25% of Damage",
		"Absorb Success Rate 90%^000000",
		"[Lv 5]: ^77777736 SP / Absorb 30% of Damage",
		"Absorb Success Rate 95%^000000"
	].join("\n");

	SkillDescription[SKID.WL_CRIMSONROCK] = [
		"Crimson Rock",
		"Max Level: 5",
		"^CC3399Requirement: Summon Fireball 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Summons a meteorite to deal significant amount of damage on a target with a 7x7 AoE. Knocks targets back 3 cells and has a 40% chance of adding Stun.^000000",
		"[Lv 1]: ^77777760 SP^000000",
		"[Lv 2]: ^77777770 SP^000000",
		"[Lv 3]: ^77777780 SP^000000",
		"[Lv 4]: ^77777790 SP^000000",
		"[Lv 5]: ^777777100 SP^000000"
	].join("\n");

	SkillDescription[SKID.WL_HELLINFERNO] = [
		"Hell Inferno",
		"Max Level: 5",
		"^CC3399Requirement: Crimson Rock 2^000000",
		"Skill Form: ^777777Damage / Curse^000000",
		"Description: ^777777Burns an enemy with fire from hell, inflicting Burning status at a certain chance.^000000",
		"[Lv 1]: ^77777735 SP / 20 sec duration / 60% Burning Chance^000000",
		"[Lv 2]: ^77777740 SP / 30 sec duration / 65% Burning Chance^000000",
		"[Lv 3]: ^77777745 SP / 40 sec duration / 70% Burning Chance^000000",
		"[Lv 4]: ^77777750 SP / 50 sec duration / 75% Burning Chance^000000",
		"[Lv 5]: ^77777755 SP / 60 sec duration / 80% Burning Chance^000000"
	].join("\n");

	SkillDescription[SKID.WL_COMET] = [
		"Comet",
		"Max Level: 5",
		"^CC3399Requirement: Hell Inferno 3^000000",
		"Skill Form: ^777777Damage / Curse^000000",
		"Description: ^777777Advanced destructive magic. Obliterates an area with meteor from space (19x19 AoE) inflicting all targets with Burning Status at a 100% chance.",
		"Consume 2 Red Gemstones.",
		"If cast with another Warlock next to you,",
		"consumes no Red Gemstones.^000000",
		"[Lv 1]: ^777777Magic Property Damage 1500%~3000%^000000",
		"[Lv 2]: ^777777Magic Property Damage 2000%~3500%^000000",
		"[Lv 3]: ^777777Magic Property Damage 2500%~4000%^000000",
		"[Lv 4]: ^777777Magic Property Damage 3000%~4500%^000000",
		"[Lv 5]: ^777777Magic Property Damage 3500%~5000%^000000"
	].join("\n");

	SkillDescription[SKID.WL_CHAINLIGHTNING] = [
		"Chain Lightning",
		"Max Level: 5",
		"^CC3399Requirement: Summon Ball Lightning 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Summons lightning to deal multiple (Wind Element) damage to a target and enemies around it.^000000",
		"[Lv 1]: ^77777780 SP /5 Attacks^000000",
		"[Lv 2]: ^77777790 SP /6 Attacks^000000",
		"[Lv 3]: ^777777100 SP /7 Attacks^000000",
		"[Lv 4]: ^777777110 SP /8 Attacks^000000",
		"[Lv 5]: ^777777120 SP /9 Attacks^000000"
	].join("\n");

	SkillDescription[SKID.WL_EARTHSTRAIN] = [
		"Earth Strain",
		"Max Level: 5",
		"^CC3399Requirement: Sienna Execrate 2^000000",
		"Skill Form: ^777777Damage / Debuff^000000",
		"Description: ^777777Uplift the land and attack enemies",
		"within range. Has a chance of stripping enemies",
		"of their equipment.^000000",
		"[Lv 1]: ^77777770 SP / 15x5 AoE (LengthxWidth) / 6 Hits",
		"Divest Shield and Helm 6%.^000000",
		"[Lv 2]: ^77777778 SP / 15x6 AoE (LengthxWidth) / 7 Hits",
		"Divest Shield and Helm 14%.^000000",
		"[Lv 3]: ^77777786 SP / 15x7 AoE (LengthxWidth) / 8 Hits",
		"Divest Shield, Helm and Armor 24%.^000000",
		"[Lv 4]: ^77777794 SP / 15x8 AoE (LengthxWidth) / 9 Hits",
		"Divest Shield, Helm, Armor and Weapon 36%.^000000 / 10 Hits",
		"[Lv 5]: ^777777102 SP / 15x9 AoE (LengthxWidth)",
		"Divest Shield, Helm, Armor, Weapon and Accessory 50%.^000000"
	].join("\n");

	SkillDescription[SKID.WL_TETRAVORTEX] = [
		"Tetra Vortex",
		"Max Level: 5",
		"^CC3399Requirement: Jack Frost 5,",
		"Chain Lightning 5, Earth Strain 5, Hell Inferno 5^000000",
		"Skill Form: ^777777Damage / Debuff^000000",
		"Description: ^777777Summons ether in the 4 elements, to deal magic damage of each element. Tetra Vortex requires you to have summoned one Fire Ball, Ball Lightening, and Stone before casting or the skill will fail. Randomly casts Ignition, Freezing, Stun or Bleeding^000000",
		"[Lv 1]: ^777777120 SP / Matk 1000% x 4^000000",
		"[Lv 2]: ^777777150 SP / Matk 1500% x 4^000000",
		"[Lv 3]: ^777777180 SP / Matk 2000% x 4^000000",
		"[Lv 4]: ^777777210 SP / Matk 2500% x 4^000000",
		"[Lv 5]: ^777777240 SP / Matk 3000% x 4^000000"
	].join("\n");

	SkillDescription[SKID.WL_SUMMONFB] = [
		"Summon Fire Ball",
		"Max Level: 5",
		"^CC3399Requirement: Meteor Storm 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Summon maximum 5 Fireballs around the caster. Continuously consumes SP while fireball is active. Increase the damage when using Release according to the caster's Base Level and Job Level.^000000",
		"[Lv 1]: ^777777120 sec. duration^000000",
		"[Lv 2]: ^777777160 sec. duration^000000",
		"[Lv 3]: ^777777200 sec. duration^000000",
		"[Lv 4]: ^777777240 sec. duration^000000",
		"[Lv 5]: ^777777280 sec. duration^000000"
	].join("\n");

	SkillDescription[SKID.WL_SUMMONBL] = [
		"Summon Lightning Ball",
		"Max Level: 5",
		"^CC3399Requirement: Lord Of Vermillion 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Summon maximum 5 Lightning Balls around the caster.  Continuously consumes SP while Lightning ball is active. Increase the damage when using Release according to the caster's Base Level and Job Level.^000000",
		"[Lv 1]: ^777777120 sec. duration^000000",
		"[Lv 2]: ^777777160 sec. duration^000000",
		"[Lv 3]: ^777777200 sec. duration^000000",
		"[Lv 4]: ^777777240 sec. duration^000000",
		"[Lv 5]: ^777777280 sec. duration^000000"
	].join("\n");

	SkillDescription[SKID.WL_SUMMONWB] = [
		"Summon Water Ball",
		"Max Level: 5",
		"^CC3399Requirement: Storm Gust 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Summon maximum 5 Water Balls around the caster. Continuously consumes SP while Waterball is active. Increase the damage when using Release according to the caster's Base Level and Job Level.^000000",
		"[Lv 1]: ^777777120 sec. duration^000000",
		"[Lv 2]: ^777777160 sec. duration^000000",
		"[Lv 3]: ^777777200 sec. duration^000000",
		"[Lv 4]: ^777777240 sec. duration^000000",
		"[Lv 5]: ^777777280 sec. duration^000000"
	].join("\n");

	SkillDescription[SKID.WL_SUMMONSTONE] = [
		"Summon Stone",
		"Max Level: 5",
		"^CC3399Requirement: Heaven's Drive 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Summon maximum 5 Stones around the caster. Continuously consumes SP while Stone is active. Increase the damage when using Release according to the caster's Base Level and Job Level.^000000",
		"[Lv 1]: ^777777120 sec. duration^000000",
		"[Lv 2]: ^777777160 sec. duration^000000",
		"[Lv 3]: ^777777200 sec. duration^000000",
		"[Lv 4]: ^777777240 sec. duration^000000",
		"[Lv 5]: ^777777280 sec. duration^000000"
	].join("\n");

	SkillDescription[SKID.WL_RELEASE] = [
		"Release",
		"Max Level: 2",
		"^CC3399Requirement: Warlock Basic Skill^000000",
		"Skill Form: ^339900Active / Special^000000",
		"Description: ^777777Throws your active Fire Ball, Lightning Ball, Water Ball or Stone, that you currently have summoned, to deal damage to a single target.^000000",
		"[Lv 1]: ^7777773 SP / Release 1 Magic ball at target.^000000",
		"[Lv 2]: ^77777720 SP / Release all summoned Magic balls at target.^000000"
	].join("\n");

	SkillDescription[SKID.WL_READING_SB] = [
		"Reading Spell Book",
		"Max Level: 1",
		"^CC3399Requirement: Warlock Basic Skill^000000",
		"Skill Form: ^339900Active / Special^000000",
		"Description: ^777777Warlock can maintain their magic by reading magic books and also can release those maintained magic with the Release skill. However, Reading Magic Books that contain skills not yet learned does not work.^000000"
	].join("\n");

	SkillDescription[SKID.WL_FREEZE_SP] = [
		"Freezing Spell",
		"Max Level: 5",
		"^CC3399Requirement: Warlock Basic Skill^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777To maintain magic by Reading Spell Book, Warlock has to learn the basic maintaining skills. The number of magic that can be maintained increases depending on caster's level and INT. Caster consumes SP while maintaining magic, and also consuming amount is different depending on the quantities and kinds of maintained magic.^000000",
		"[Lv 1]: ^77777740 SP / 5 sec Variable Cast Time.^000000"
	].join("\n");

	SkillDescription[SKID.RA_ARROWSTORM] = [
		"Arrow Storm",
		"Max Level: 10",
		"^CC3399Requirement: Aimed Bolt 5^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Shoots countless arrows at a target and a certain cell range around the target. Each target will take 3 consecutive hits (Total damage divided by 3 per hit). Consumes 10 arrows. Higher skill level increases the damage done, SP cost and Area of Effect.^000000",
		"[Lv 1]: ^7777771080% ATK, 7x7 AoE^000000",
		"[Lv 2]: ^7777771160% ATK, 7x7 AoE^000000",
		"[Lv 3]: ^7777771240% ATK, 7x7 AoE^000000",
		"[Lv 4]: ^7777771320% ATK, 7x7 AoE^000000",
		"[Lv 5]: ^7777771400% ATK, 7x7 AoE^000000",
		"[Lv 6]: ^7777771480% ATK, 9x9 AoE^000000",
		"[Lv 7]: ^7777771560% ATK, 9x9 AoE^000000",
		"[Lv 8]: ^7777771640% ATK, 9x9 AoE^000000",
		"[Lv 9]: ^7777771720% ATK, 9x9 AoE^000000",
		"[Lv 10]: ^7777771800% ATK, 11x11 AoE^000000"
	].join("\n");

	SkillDescription[SKID.RA_FEARBREEZE] = [
		"Fear Breeze",
		"Max Level: 5",
		"^CC3399Requirement: Camouflage 1, Arrow Storm 5^000000",
		"Skill Form: ^000099Active toggle / Buff (To yourself)^000000",
		"Description: ^777777During the skill duration, normal ranged attacks have a chance of hitting a target multiple times. (2 ~ 5 attacks). Extra attacks will consume arrows.^000000",
		"[Lv 1]: ^777777Number of Attacks +1 / proc chance 12%  / Duration 60 sec.^000000",
		"[Lv 2]: ^777777Number of Attacks +1 / proc chance 12%  / Duration 90 sec.^000000",
		"[Lv 3]: ^777777Number of Attacks +1~+2 / proc chance 21%  / Duration 120 sec.^000000",
		"[Lv 4]: ^777777Number of Attacks +1~+3 / proc chance 27%  / Duration 150 sec.^000000",
		"[Lv 5]: ^777777Number of Attacks +1~+4 / proc chance 30%  / Duration 180 sec.^000000"
	].join("\n");

	SkillDescription[SKID.RA_RANGERMAIN] = [
		"Ranger Main",
		"Max Level: 10",
		"^CC3399Requirement: Ranger Basic Skill^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase ATK to Animal, Plant and Fish type monsters and decrease damage from those monsters.^000000",
		"[Lv 1]: ^777777ATK and Resistance + 5^000000",
		"[Lv 2]: ^777777ATK and Resistance + 10^000000",
		"[Lv 3]: ^777777ATK and Resistance + 15^000000",
		"[Lv 4]: ^777777ATK and Resistance + 20^000000",
		"[Lv 5]: ^777777ATK and Resistance + 25^000000",
		"[Lv 6]: ^777777ATK and Resistance + 30^000000",
		"[Lv 7]: ^777777ATK and Resistance + 35^000000",
		"[Lv 8]: ^777777ATK and Resistance + 40^000000",
		"[Lv 9]: ^777777ATK and Resistance + 45^000000",
		"[Lv 10]: ^777777ATK and Resistance + 50^000000"
	].join("\n");

	SkillDescription[SKID.RA_AIMEDBOLT] = [
		"Aimed Bolt",
		"Max Level: 10",
		"^CC3399Requirement: Ankle Snare 5^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: If the target is immobilized",
		"(by Ankle Snare, Electric Shock, Wug Bite),",
		"the target gets more damage by this skill.",
		"The number of attacks increases depending",
		"on target's size. This skill fails when",
		"caster doesn't have enough arrows. The",
		"target gets released from traps once the",
		"target gets damaged by this skill.^000000",
		"[Lv 1]: ^777777550% ATK^000000",
		"[Lv 2]: ^777777600% ATK^000000",
		"[Lv 3]: ^777777650% ATK^000000",
		"[Lv 4]: ^777777700% ATK^000000",
		"[Lv 5]: ^777777750% ATK^000000",
		"[Lv 6]: ^777777800% ATK^000000",
		"[Lv 7]: ^777777850% ATK^000000",
		"[Lv 8]: ^777777900% ATK^000000",
		"[Lv 9]: ^777777950% ATK^000000",
		"[Lv 10]: ^7777771000% ATK^000000"
	].join("\n");

	SkillDescription[SKID.RA_DETONATOR] = [
		"Detonator",
		"Max Level: 1",
		"^CC3399Requirement: Cluster Bomb 3^000000",
		"Skill Form: ^339900Active / Special^000000",
		"Description: ^777777Immediately activates traps on the ground. Skills range is 7x7 cells around the targeted area. It can also activate Hunter's traps. This skill will not detonate traps of another player.",
		"Can activate the following traps: Cluster Bomb, Blast Mine, Claymore Trap, Sandman, Talkie Box, Firing Trap, and Ice Bound Trap.^000000"
	].join("\n");

	SkillDescription[SKID.RA_ELECTRICSHOCKER] = [
		"Electric Shock",
		"Max Level: 5",
		"^CC3399Requirement: Shockwave Trap 5^000000",
		"Skill Form: ^000099Active / Trap^000000",
		"Description: ^777777Immobilizes a target and drains a certain amount of SP per second from the target. Electric Shocker cannot be removed with the Hunter skill Remove Trap. Requires 1 ^00BB00Special Alloy Trap^777777. Maximum 3 traps are allowed to be set.^000000",
		"[Lv 1]: ^777777Consuming SP by a sec. 5% / Duration 20 sec.^000000",
		"[Lv 2]: ^777777Consuming SP by a sec. 10% / Duration 22 sec.^000000",
		"[Lv 3]: ^777777Consuming SP by a sec. 15% / Duration 24 sec.^000000",
		"[Lv 4]: ^777777Consuming SP by a sec. 20% / Duration 26 sec.^000000",
		"[Lv 5]: ^777777Consuming SP by a sec. 25% / Duration 28 sec.^000000"
	].join("\n");

	SkillDescription[SKID.RA_CLUSTERBOMB] = [
		"Cluster Bomb",
		"Max Level: 5",
		"^CC3399Requirement: Trap Research 3^000000",
		"Skill Form: ^000099Active / Trap^000000",
		"Description: ^777777Maximum 3 traps are allowed to be set at once and damage range is 3 cells wide and 5 cells deep. Can be combined with Detonator Skill. Cluster Bomb cannot be removed by [Remove Trap] from Hunter. Requires 1 ^00BB00Special Alloy Trap^777777.^000000",
		"[Lv 1]: ^777777Damage 300% + Additional Trap Damage / Duration 15 sec.^000000",
		"[Lv 2]: ^777777Damage 400% + Additional Trap Damage / Duration 15 sec.^000000",
		"[Lv 3]: ^777777Damage 500% + Additional Trap Damage / Duration 15 sec.^000000",
		"[Lv 4]: ^777777Damage 600% + Additional Trap Damage / Duration 15 sec.^000000",
		"[Lv 5]: ^777777Damage 700% + Additional Trap Damage / Duration 15 sec.^000000"
	].join("\n");

	SkillDescription[SKID.RA_WUGMASTERY] = [
		"Wug Mastery",
		"Max Level: 1",
		"^CC3399Requirement: Ranger Basic Skill^000000",
		"Skill Form: ^339900Active / Special^000000",
		"Description: ^777777Summon a Wug with a Wolf Flute. Re-using the skill returns the Wug to the wild.^000000"
	].join("\n");

	SkillDescription[SKID.RA_WUGRIDER] = [
		"Wug Rider",
		"Max Level: 3 ",
		"^CC3399Requirement: Wug Mastery 1^000000",
		"Skill Form: ^339900Active / Special^000000",
		"Description: ^777777Allows a Ranger to mount their summoned Wug. Skill level increases movement speed. While mounted on a Wug, you can't use any bow attacks or skills that are not Wug exclusive other than trap skills.",
		"Can use the following traps while on a Wug: Cobalt Trap, Magenta Trap, Verdure Trap, Maze Trap, Electric Shocker.^000000"
	].join("\n");

	SkillDescription[SKID.RA_WUGDASH] = [
		"Wug Dash",
		"Max Level: 1",
		"^CC3399Requirement: Wug Rider 1^000000",
		"Skill Form: ^339900Active / Special^000000",
		"Description: ^777777Usable only when mounted on your Wug. Makes your Wug scamper in a straight direction, and re-using the skill stops. You will automatically stop when hitting a wall or an enemy. If the Ranger has already learned Wug Strike, it gives damage to the crashed enemy.^000000"
	].join("\n");

	SkillDescription[SKID.RA_WUGSTRIKE] = [
		"Wug Strike",
		"Max Level: 5",
		"^CC3399Requirement: Tooth of Wug 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Make your Wug run into 1 target",
		"and give damage. Damage increases as skill",
		"level gets higher.^000000",
		"[Lv 1]: ^777777200% ATK^000000",
		"[Lv 2]: ^777777400% ATK^000000",
		"[Lv 3]: ^777777600% ATK^000000",
		"[Lv 4]: ^777777800% ATK^000000",
		"[Lv 5]: ^7777771000% ATK^000000"
	].join("\n");

	SkillDescription[SKID.RA_WUGBITE] = [
		"Wug Bite",
		"Max Level: 5",
		"^CC3399Requirement: Wug Strike 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Make your Wug leap at a target,",
		"dealing damage and temporarily causing",
		"immobile status. Damage increases if Tooth",
		"of Wug level is increased. Can't be used",
		"while mounted on a Wug.^000000",
		"[Lv 1]: ^777777600% ATK, Duration 1 sec + Tooth of Wug skill^000000",
		"[Lv 2]: ^777777800% ATK, Duration 2 sec + Tooth of Wug skill^000000",
		"[Lv 3]: ^7777771000% ATK, Duration 3 sec + Tooth of Wug skill^000000",
		"[Lv 4]: ^7777771200% ATK, Duration 4 sec + Tooth of Wug skill^000000",
		"[Lv 5]: ^7777771500% ATK, Duration 5 sec + Tooth of Wug skill^000000"
	].join("\n");

	SkillDescription[SKID.RA_TOOTHOFWUG] = [
		"Tooth of Wug",
		"Max Level: 10",
		"^CC3399Requirement: Wug Mastery 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increases the damage done by",
		"Wug-skills. Increase damage as skill level",
		"gets higher.^000000",
		"[Lv 1]: ^777777ATK +30^000000",
		"[Lv 2]: ^777777ATK +60^000000",
		"[Lv 3]: ^777777ATK +90^000000",
		"[Lv 4]: ^777777ATK +120^000000",
		"[Lv 5]: ^777777ATK +150^000000",
		"[Lv 6]: ^777777ATK +180^000000",
		"[Lv 7]: ^777777ATK +210^000000",
		"[Lv 8]: ^777777ATK +240^000000",
		"[Lv 9]: ^777777ATK +270^000000",
		"[Lv 10]: ^777777ATK +300^000000"
	].join("\n");

	SkillDescription[SKID.RA_SENSITIVEKEEN] = [
		"Sensitive Keen",
		"Max Level: 5",
		"^CC3399Requirement: Tooth of Wug 3^000000",
		"Skill Form: ^339900Active / Detect^000000",
		"Description: ^777777Use the Wug's senses to reveal",
		"hidden traps and enemies. Has a chance",
		"to attack enemies with Wug Bite.^000000",
		"[Lv 1]: ^7777777 x 7 AoE, Damage 150%, Wug Bite Chance 8%^000000",
		"[Lv 2]: ^7777779 x 9 AoE, Damage 200%, Wug Bite Chance 16%^000000",
		"[Lv 3]: ^77777711 x11 AoE, Damage 250%, Wug Bite Chance 24%^000000",
		"[Lv 4]: ^77777713 x13 AoE, Damage 300%, Wug Bite Chance 32%^000000",
		"[Lv 5]: ^77777715 x15 AoE, Damage 350%, Wug Bite Chance 40%^000000"
	].join("\n");

	SkillDescription[SKID.RA_CAMOUFLAGE] = [
		"Camouflage",
		"Max Level: 5",
		"^CC3399Requirement: Ranger Main 1^000000",
		"Skill Form: ^339900Active / Buff (To yourself)^000000",
		"Description: ^777777Hide yourself behind walls or any",
		"obstacles for 10 seconds so other monsters",
		"can't notice the you (Except Boss/Demon/Insect",
		"monsters). You appear translucent while",
		"Camouflaged. Increases Critical rate and ATK,",
		"but decrease DEF while casting the skill.",
		"The skill is cancelled when you attack or",
		"if the 10 duration ends. Can be re-cast",
		"to refresh the duration of the effect.",
		"It can be used without any obstacles if the",
		"skill level gets higher.^000000",
		"[Lv 1]: ^777777SP consumption per sec. 6 / move disabled^000000",
		"[Lv 2]: ^777777SP consumption per sec. 5 / move disabled^000000",
		"[Lv 3]: ^777777SP consumption per sec. 4 / 50% movement^000000",
		"[Lv 4]: ^777777SP consumption per sec. 3 / 75% movement^000000",
		"[Lv 5]: ^777777SP consumption per sec. 2 / 100% movement^000000"
	].join("\n");

	SkillDescription[SKID.RA_RESEARCHTRAP] = [
		"Trap Research",
		"Max Level: 5",
		"^CC3399Requirement: Claymore Trap 1, Remove Trap 1^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase trap damage and trap set range of Hunters and Rangers, also increases INT and MaxSP^000000",
		"[Lv 1]: ^777777Additional Damage +40 / INT +1 / MSP +220  / Skill Range +1^000000",
		"[Lv 2]: ^777777Additional Damage +80 / INT +2 / MSP +240  / Skill Range +1^000000",
		"[Lv 3]: ^777777Additional Damage +120 / INT +3 / MSP +260  / Skill Range +2^000000",
		"[Lv 4]: ^777777Additional Damage +160 / INT +4 / MSP +280  / Skill Range +2^000000",
		"[Lv 5]: ^777777Additional Damage +200 / INT +5 / MSP +300  / Skill Range +3^000000"
	].join("\n");

	SkillDescription[SKID.RA_MAGENTATRAP] = [
		"Magenta Trap",
		"Max Level: 1",
		"^CC3399Requirement: Trap Research 1^000000",
		"Skill Form: ^000099Active / Trap^000000",
		"Description: ^777777Monsters that step on this trap has its attribute changed to Fire property. Does not affect boss type monsters or players and consumes 1 ^00BB00Scarlett Point^777777 and 1 ^00BB00Special Alloy Trap^777777.^000000"
	].join("\n");

	SkillDescription[SKID.RA_COBALTTRAP] = [
		"Cobalt Trap",
		"Max Level: 1",
		"^CC3399Requirement: Trap Research 1^000000",
		"Skill Form: ^000099Active / Trap^000000",
		"Description: ^777777Monsters that step on this trap has its attribute changed to Water property. Does not affect boss type monsters or players and consumes 1 ^00BB00Indigo Point^777777 and 1 ^00BB00Special Alloy Trap^777777.^000000"
	].join("\n");

	SkillDescription[SKID.RA_MAIZETRAP] = [
		"Maze Trap",
		"Max Level: 1",
		"^CC3399Requirement: Trap Research 1^000000",
		"Skill Form: ^000099Active / Trap^000000",
		"Description: ^777777Monsters that step on this trap has its attribute changed to Earth property. Does not affect boss type monsters or players and consumes 1 ^00BB00Lime Green Point^777777 and 1 ^00BB00Special Alloy Trap^777777.^000000"
	].join("\n");

	SkillDescription[SKID.RA_VERDURETRAP] = [
		"Verdure Trap",
		"Max Level: 1",
		"^CC3399Requirement: Trap Research 1^000000",
		"Skill Form: ^000099Active / Trap^000000",
		"Description: ^777777Monsters that step on this trap has its attribute changed to Wind property. Does not affect boss type monsters or players and consumes 1 ^00BB00Yellow Wish Point^777777 and 1 ^00BB00Special Alloy Trap^777777.^000000"
	].join("\n");

	SkillDescription[SKID.RA_FIRINGTRAP] = [
		"Firing Trap",
		"Max Level: 5",
		"^CC3399Requirement: Detonator 1^000000",
		"Skill Form: ^000099Active / Trap^000000",
		"Description: ^777777When this trap activates, it deals damage in a 5x5 area and causes Burning status. Level increases success rate of inflicting Burning status. Consumes 1 ^00BB00Special Alloy Trap^777777.^000000",
		"[Lv 1]: ^777777Success Rate 60%^000000",
		"[Lv 2]: ^777777Success Rate 70%^000000",
		"[Lv 3]: ^777777Success Rate 80%^000000",
		"[Lv 4]: ^777777Success Rate 90%^000000",
		"[Lv 5]: ^777777Success Rate 100%^000000"
	].join("\n");

	SkillDescription[SKID.RA_ICEBOUNDTRAP] = [
		"Ice Bound Trap",
		"Max Level: 5",
		"^CC3399Requirement: Detonator 1^000000",
		"Skill Form: ^000099Active / Trap^000000",
		"Description: ^777777When this trap activates, it deals damage in a 3x3 area and inflicts [Burning Freeze] status. Consumes 1 ^00BB00Special Alloy Trap^777777.^000000",
		"[Lv 1]: ^777777Success Rate 60%^000000",
		"[Lv 2]: ^777777Success Rate 70%^000000",
		"[Lv 3]: ^777777Success Rate 80%^000000",
		"[Lv 4]: ^777777Success Rate 90%^000000",
		"[Lv 5]: ^777777Success Rate 100%^000000"
	].join("\n");

	SkillDescription[SKID.NC_MADOLICENCE] = [
		"Madogear License",
		"Max Level: 5",
		"^CC3399Requirement: Mechanic Basic^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Allows the Mechanic to use Mado Gear. Higher Level Increases ATK and decreases the movement penalty in Mado Gear.^000000",
		"[Lv 1]: ^777777ATK +15, Movement Speed -40%^000000",
		"[Lv 2]: ^777777ATK +30, Movement Speed -30%^000000",
		"[Lv 3]: ^777777ATK +45, Movement Speed -20%^000000",
		"[Lv 4]: ^777777ATK +60, Movement Speed -10%^000000",
		"[Lv 5]: ^777777ATK +75, No Movement Speed penalty^000000"
	].join("\n");

	SkillDescription[SKID.NC_BOOSTKNUCKLE] = [
		"Knuckle Boost",
		"Max Level: 5",
		"^CC3399Requirement: Madogear License 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Shoot a rocket punch at a single target from a distance. ATK increases as caster's Dex gets higher. Range 11 cells.^000000",
		"[Lv 1]: ^777777Damage 300%^000000",
		"[Lv 2]: ^777777Damage 400%^000000",
		"[Lv 3]: ^777777Damage 500%^000000",
		"[Lv 4]: ^777777Damage 600%^000000",
		"[Lv 5]: ^777777Damage 700%^000000"
	].join("\n");

	SkillDescription[SKID.NC_PILEBUNKER] = [
		"Pile Bunker",
		"Max Level: 3",
		"^CC3399Requirement: Knuckle Boost 2^000000",
		"Skill Form: ^FF0000Active / Damage(Special)^000000",
		"Description: ^777777Pull out deadly drills from the Madogear to inflict damage and nullify Defensive magic skills cast on the target. Nullifies [Kyrie Eleison, Assumptio, Steel Body, Gentle Touch-Change, Gentle Touch-Revitalize, Auto Guard, Reflect Shield, Defender, Reflect Damage, Prestige, and Banding]. Requires a Pile Bunker to cast.^000000",
		"[Lv 1]: ^7777773 Cell Range / Chance to cancel Defense magic skill 40%^000000",
		"[Lv 2]: ^7777774 Cell Range / Chance to cancel Defense magic skill 55%^000000",
		"[Lv 3]: ^7777775 Cell Range / Chance to cancel Defense magic skill 70%^000000"
	].join("\n");

	SkillDescription[SKID.NC_VULCANARM] = [
		"Vulcan Arm",
		"Max Level: 3",
		"^CC3399Requirement: Knuckle Boost 2^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Shoot a large-caliber gun equipped on Madogear and attack enemies. Consume 1 Vulcan Bullet to activate the skill. ATK increases as caster's DEX gets higher. Range 3 cells.^000000",
		"[Lv 1]: ^777777Damage 70 %^000000",
		"[Lv 2]: ^777777Damage 140%^000000",
		"[Lv 3]: ^777777Damage 210%^000000"
	].join("\n");

	SkillDescription[SKID.NC_FLAMELAUNCHER] = [
		"Flame Launcher",
		"Max Level: 3",
		"^CC3399Requirement: Vulcan Arm 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Set flames on the ground with a Flame Thrower to damage and inflict [Ignition] status to all targets that are inside of the range. Must have a Flame Thrower equipped. Consumes 1 Magic Gear Fuel and 20 SP.^000000",
		"[Lv 1]: ^777777Fire Property Damage 600% / Chance to curse [Ignition] status 30%^000000",
		"[Lv 2]: ^777777Fire Property Damage 900% / Chance to curse [Ignition] status 40%^000000",
		"[Lv 3]: ^777777Fire Property Damage 1200% / Chance to curse [Ignition] status 50%^000000"
	].join("\n");

	SkillDescription[SKID.NC_COLDSLOWER] = [
		"Cold Slower",
		"Max Level: 3",
		"^CC3399Requirement: Vulcan Arm 3^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Use a quick freezer to give damage inflict [Freezing] / [Freeze] status to all targets that are inside of the range. Consumes 1 Liquid Condensed Bullet and 1 Magic Gear Fuel.^000000",
		"[Lv 1]: ^777777Water property ATK 600%, 5x5 AoE^000000",
		"[Lv 2]: ^777777Water property ATK 900%, 7x7 AoE^000000",
		"[Lv 3]: ^777777Water property ATK 1200%, 9x9 AoE^000000"
	].join("\n");

	SkillDescription[SKID.NC_ARMSCANNON] = [
		"Arm Cannon",
		"Max Level: 3",
		"^CC3399Requirement: Flame Launcher 2 / Cold Slower 2^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Launch the cannon equipped on the Madogear to give great damage to the target. Damage decreases as target's size gets bigger. Damage property is changeable depending on equipped cannon ball. 1 Magic Gear Fuel and 1 cannon ball are required.^000000",
		"[Lv 1]: ^777777Attack Power 700% / 650% / 600% / Range 9 Cells / effective range of 7x7 cells^000000",
		"[Lv 2]: ^777777Attack Power 1100% / 1000% / 900% / Range 11 Cells / effective range of 5x5 cells^000000",
		"[Lv 3]: ^777777Attack Power 1500% / 1350% / 1200% / Range 13 Cells / effective range of 3x3 cells^000000"
	].join("\n");

	SkillDescription[SKID.NC_ACCELERATION] = [
		"Acceleration",
		"Max Level: 3",
		"^CC3399Requirement: Madogear License 1^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Increase Madogear's movement speed. An Accelerator must be equipped to cast and consumes 1 Magic Gear Fuel.^000000",
		"[Lv 1]: ^777777Skill Duration 60 sec.^000000",
		"[Lv 2]: ^777777Skill Duration 90 sec.^000000",
		"[Lv 3]: ^777777Skill Duration 120 sec.^000000"
	].join("\n");

	SkillDescription[SKID.NC_HOVERING] = [
		"Hover",
		"Max Level: 1",
		"^CC3399Requirement: Acceleration 1^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Make Madogear hover over the ground to escape traps and any other magic attacks. A Hovering Booster must be equiped to cast and consumes 1 Magic Gear Fuel.^000000",
		"[Lv 1]: ^777777Skill Duration 90 sec.^000000"
	].join("\n");

	SkillDescription[SKID.NC_F_SIDESLIDE] = [
		"Front Slide",
		"Max Level: 1",
		"^CC3399Requirement: Hover 1^000000",
		"Skill Form: ^339900Active / Movement^000000",
		"Description: ^777777Madogear rushes forward 7 cells and consumes 1 Magic Gear Fuel.^000000"
	].join("\n");

	SkillDescription[SKID.NC_B_SIDESLIDE] = [
		"Back Slide",
		"Max Level: 1",
		"^CC3399Requirement: Hover 1^000000",
		"Skill Form: ^339900Active / Movement^000000",
		"Description: ^777777Madogear moves backward 7 cells and consumes 1 Magic Gear Fuel.^000000"
	].join("\n");

	SkillDescription[SKID.NC_MAINFRAME] = [
		"Remodel Mainframe",
		"Max Level: 4",
		"^CC3399Requirement: Madogear License 4^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Remodel Magic Gear's main frame",
		"to increase defense and overheat limit.",
		"If Magic Gear receives damage, it will",
		"continue to receive damage.^000000",
		"[Lv 1]: ^777777Defense +40 / Overheat Limit 200^000000",
		"[Lv 2]: ^777777Defense +60 / Overheat Limit 280^000000",
		"[Lv 3]: ^777777Defense +80 / Overheat Limit 360^000000",
		"[Lv 4]: ^777777Defense +100 / Overheat Limit 450^000000"
	].join("\n");

	SkillDescription[SKID.NC_SELFDESTRUCTION] = [
		"Self Destruction",
		"Max Level: 3",
		"^CC3399Requirement: Remodel Mainframe 2^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Make Magic Gear self-destruct",
		"causing huge damage in an area around it.",
		"Caster will lose Magic Gear and all SP will",
		"be drained. [Suicide Device] is required to",
		"use this skill. Consumes 3 Magic Gear Fuel.^000000",
		"[Lv 1]: ^777777Range 5x5 cells^000000",
		"[Lv 2]: ^777777Range 7x7 cells^000000",
		"[Lv 3]: ^777777Range 9x9 cells^000000"
	].join("\n");

	SkillDescription[SKID.NC_SHAPESHIFT] = [
		"Shape Shift",
		"Max Level: 4",
		"^CC3399Requirement: Remodel Mainframe 2^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Change Madogear's property. Must have a  <Shape Shifter> equipped and consumes 2 Magic Gear Fuel and 1 Enchanted Stone.^000000",
		"[Lv 1]: ^777777Change to fire property / Consume 3 Scarlet Points^000000",
		"[Lv 2]: ^777777Change to earth property / Consume 3 Lime Green Points^000000",
		"[Lv 3]: ^777777Change to wind property / Consume 3 Yellow Wish Points^000000",
		"[Lv 4]: ^777777Change to water property / Consume 3 Indigo Points^000000"
	].join("\n");

	SkillDescription[SKID.NC_EMERGENCYCOOL] = [
		"Emergency Cool",
		"Max Level: 1",
		"^CC3399Requirement: Self Destruction 2^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Immediately cool down Madogear from overheating. Must have a <Cooling Device> and consumes 2 Magic Gear Fuel.^000000"
	].join("\n");

	SkillDescription[SKID.NC_INFRAREDSCAN] = [
		"Infrared Scan",
		"Max Level: 1",
		"^CC3399Requirement: Shape Shift 2^000000",
		"Skill Form: ^339900Active / Detect / Debuff^000000",
		"Description: ^777777Scan 15 x 15 cells around caster with a infrared scanner and find hidden enemies. Decreases all enemies' flee rate by 30% if they are inside of the skill range. (Chance of success is 100%.)^000000",
		"[Lv 1]: ^77777745 SP^000000"
	].join("\n");

	SkillDescription[SKID.NC_ANALYZE] = [
		"Analyze",
		"Max Level: 3",
		"^CC3399Requirement: Infrared Scan 1^000000",
		"Skill Form: ^FF0000Active / Debuff^000000",
		"Description: ^777777Analyze a target's status and decreases physical/magic defensive strength of the target. Skill range is 9 cells. Duration is 20 seconds and consumes 1 Magic Gear Fuel.^000000",
		"[Lv 1]: ^777777physical / magic defense 14% decrease^000000",
		"[Lv 2]: ^777777physical / magic defense 28% decrease^000000",
		"[Lv 3]: ^777777physical / magic defense 42% decrease^000000"
	].join("\n");

	SkillDescription[SKID.NC_MAGNETICFIELD] = [
		"Magnetic Field",
		"Max Level: 3",
		"^CC3399Requirement: Emergency Cool 1^000000",
		"Skill Form: ^FF0000Active / Debuff^000000",
		"Description: ^777777Immobilize all enemies that are inside of skill range with electro-magnetic waves. If caster or targets are in hovering state, they don't get skill effect. Also the magnetic field from the skill decreases target's SP continuously. Requires a <Magnetic Field Generator> and consumes 3 Magic Gear Fuel.^000000",
		"[Lv 1]: ^777777Prevents movement for 4 secs. / 50 SP reduction per sec.^000000",
		"[Lv 2]: ^777777Prevents movement for 6 secs. / 50 SP reduction per sec.^000000",
		"[Lv 3]: ^777777Prevents movement for 8 secs. / 50 SP reduction per sec.^000000"
	].join("\n");

	SkillDescription[SKID.NC_NEUTRALBARRIER] = [
		"Neutral Barrier",
		"Max Level: 3",
		"^CC3399Requirement: Magnetic Field 2^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Creates an energy field around the Caster, increasing DEF and MDEF of all targets in range and preventing all Long-range attacks from damaging the targets. Requires a <Barrier Builder> and consumes 1 Magic Gear Fuel.^000000",
		"[Lv 1]: ^777777Physical and Magic defense +15% / Duration 30 sec.^000000",
		"[Lv 2]: ^777777Physical and Magic defense +20% / Duration 45 sec.^000000",
		"[Lv 3]: ^777777Physical and Magic defense +25% / Duration 60 sec.^000000"
	].join("\n");

	SkillDescription[SKID.NC_STEALTHFIELD] = [
		"Stealth Field",
		"Max Level: 3",
		"^CC3399Requirement: Analyze 3 / Neutral Barrier 2^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Creates a 5x5 cell stealth barrier around the Caster, cloaking all targets within range. All targets cloaked by Stealth Field will be semi-visible, and they cannot be targeted by skills. Continually consumes caster's SP while the skill is active and decreases 20% of caster's movement speed. It can be canceled if Stealth Field is cast twice. Requires a <Camouflage Generator>and consume 2 Magic Gear Fuel.^000000",
		"[Lv 1]: ^77777780 SP / Duration 15 sec. / 1% SP/3 sec.^000000",
		"[Lv 2]: ^777777100 SP / Duration 20 sec. / 1% SP/4 sec.^000000",
		"[Lv 3]: ^777777120 SP / Duration 25 sec. / 1% SP/5 sec.^000000"
	].join("\n");

	SkillDescription[SKID.NC_REPAIR] = [
		"Repair",
		"Max Level: 5",
		"^CC3399Requirement: Madogear License 2^000000",
		"Skill Form: ^339900Active / Recovery^000000",
		"Description: ^777777Enable to repair (recover) Madogear or other Madogears. Requires a <Repair Kit> and consumes 1 Magic Gear Fuel.^000000",
		"[Lv 1]: ^777777Cast Range 5 Cell / MaxHP 4% recovery^000000",
		"[Lv 2]: ^777777Cast Range 6 Cell / MaxHP 7% recovery^000000",
		"[Lv 3]: ^777777Cast Range 7 Cell / MaxHP 13% recovery^000000",
		"[Lv 4]: ^777777Cast Range 8 Cell / MaxHP 17% recovery^000000",
		"[Lv 5]: ^777777Cast Range 9 Cell / MaxHP 23% recovery^000000"
	].join("\n");

	SkillDescription[SKID.NC_TRAININGAXE] = [
		"Axe Training",
		"Max Level: 10",
		"^CC3399Requirement: Mechanic Basic^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase ATK and Accuracy rate when caster equips an axe (passive), Maces also receive a small percentage of this skill.^000000",
		"[Lv 1]: ^777777ATK +5 / Accuracy Rate +3^000000",
		"[Lv 2]: ^777777ATK +10 / Accuracy Rate +6^000000",
		"[Lv 3]: ^777777ATK +15 / Accuracy Rate +9^000000",
		"[Lv 4]: ^777777ATK +20 / Accuracy Rate +12^000000",
		"[Lv 5]: ^777777ATK +25 / Accuracy Rate +15^000000",
		"[Lv 6]: ^777777ATK +30 / Accuracy Rate +18^000000",
		"[Lv 7]: ^777777ATK +35 / Accuracy Rate +21^000000",
		"[Lv 8]: ^777777ATK +40 / Accuracy Rate +24^000000",
		"[Lv 9]: ^777777ATK +45 / Accuracy Rate +27^000000",
		"[Lv 10]: ^777777ATK +50 / Accuracy Rate +30^000000"
	].join("\n");

	SkillDescription[SKID.NC_RESEARCHFE] = [
		"Fire Earth Research",
		"Max Level: 5",
		"^CC3399Requirement: Mechanic Basic^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777After researching Fire and Earth Element monsters, Mechanic gains further understanding of them, increasing damage and resistance against these monsters.^000000",
		"[Lv 1]: ^777777Resistance +10 / ATK +10^000000",
		"[Lv 2]: ^777777Resistance +20 / ATK +20^000000",
		"[Lv 3]: ^777777Resistance +30 / ATK +30^000000",
		"[Lv 4]: ^777777Resistance +40 / ATK +40^000000",
		"[Lv 5]: ^777777Resistance +50 / ATK +50^000000"
	].join("\n");

	SkillDescription[SKID.NC_AXEBOOMERANG] = [
		"Axe Boomerang",
		"Max Level: 5",
		"^CC3399Requirement: Axe Training 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Axe exclusive skill (One-handed and Two-handed) Throws axe like a boomerang at a target, causing damage and knocking it back. The weight of the axe increases damage done by the skill.^000000",
		"[Lv 1]: ^777777Damage 300% + Axe Weight / Skill Range 5 cells^000000",
		"[Lv 2]: ^777777Damage 350% + Axe Weight / Skill Range 6 cells^000000",
		"[Lv 3]: ^777777Damage 400% + Axe Weight / Skill Range 7 cells^000000",
		"[Lv 4]: ^777777Damage 450% + Axe Weight / Skill Range 8 cells^000000",
		"[Lv 5]: ^777777Damage 500% + Axe Weight / Skill Range 9 cells^000000"
	].join("\n");

	SkillDescription[SKID.NC_POWERSWING] = [
		"Power Swing",
		"Max Level: 5",
		"^CC3399Requirement: Axe Boomerang 3^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Give damage and [Stun] status to 1 target by swinging your weapon. Add a small chance of auto-casting Axe Boomerang if caster equipped with an Axe. Increases ATK depending on caster's STR and DEX.^000000",
		"[Lv 1]: ^777777ATK 400%^000000",
		"[Lv 2]: ^777777ATK 500%^000000",
		"[Lv 3]: ^777777ATK 600%^000000",
		"[Lv 4]: ^777777ATK 700%^000000",
		"[Lv 5]: ^777777ATK 800%^000000"
	].join("\n");

	SkillDescription[SKID.NC_AXETORNADO] = [
		"Axe Tornado",
		"Max Level: 5",
		"^CC3399Requirement: Axe Training 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Axe exclusive Skill (One-handed, Two-handed) Causes a tornado to form by spinning with an axe at a high speed, causing damage to all targets in range.^000000",
		"[Lv 1]: ^7777775x5 AoE / 18 SP / 20 HP^000000",
		"[Lv 2]: ^7777775x5 AoE / 20 SP / 40 HP^000000",
		"[Lv 3]: ^7777777x7 AoE / 22 SP / 60 HP^000000",
		"[Lv 4]: ^7777777x7 AoE / 24 SP / 80 HP^000000",
		"[Lv 5]: ^7777777x7 AoE / 26 SP / 100 HP^000000"
	].join("\n");

	SkillDescription[SKID.NC_SILVERSNIPER] = [
		"FAW Silver Sniper",
		"Max Level: 5",
		"^CC3399Requirement: Fire Earth Research 2^000000",
		"Skill Form: ^339900Active / FAW Set^000000",
		"Description: ^777777Set FAW (Fixed Automatic Weapon) on the ground that executes long distance attacks. Maximum of 2 FAWs can be set. Consumes 2 Steel and 1 Iron. Requires an Oridecon Hammer and Mini Furnace.^000000",
		"[Lv 1]: ^777777ATK +0  / Duration 20sec.^000000",
		"[Lv 2]: ^777777ATK +200  / Duration 30sec.^000000",
		"[Lv 3]: ^777777ATK +400  / Duration 40sec.^000000",
		"[Lv 4]: ^777777ATK +800  / Duration 50sec.^000000",
		"[Lv 5]: ^777777ATK +1000  / Duration 60sec.^000000"
	].join("\n");

	SkillDescription[SKID.NC_MAGICDECOY] = [
		"FAW Magic Decoy",
		"Max Level: 5",
		"^CC3399Requirement: FAW Silver Sniper 2^000000",
		"Skill Form: ^339900Active / FAW Set^000000",
		"Description: ^777777Set FAW (Fixed Automatic Weapon) on the ground that executes magic attacks. Maximum of 2 FAWs can be set. Consumes 2 Iron, 1 Brigan and 1 item among Red Blood, Green Live, Wind of Verdure or Crystal Blue. Requires an Oridecon Hammer and Portable Furnace.^000000",
		"[Lv 1]: ^777777MATK 300  / Duration 20sec.^000000",
		"[Lv 2]: ^777777MATK 350  / Duration 30sec.^000000",
		"[Lv 3]: ^777777MATK 400  / Duration 40sec.^000000",
		"[Lv 4]: ^777777MATK 450  / Duration 50sec.^000000",
		"[Lv 5]: ^777777MATK 500  / Duration 60sec.^000000"
	].join("\n");

	SkillDescription[SKID.NC_DISJOINT] = [
		"Divest FAW",
		"Max Level: 1",
		"^CC3399Requirement: FAW Silver Sniper 1^000000",
		"Skill Form: ^339900Active / Divest FAW^000000",
		"Description: ^777777Disarms 1 active FAW from the ground. Also enables a chance to disarm other player's FAWs. Consumes 1 <Wrench>^000000"
	].join("\n");

	SkillDescription[SKID.SC_FATALMENACE] = [
		"Fatal Menace",
		"Max Level: 5",
		"^CC3399Requirement: Intimidate 5^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^7777771 target and all enemies around",
		"the target are damaged and teleported by the",
		"skill. Undamaged enemies are not teleported.^000000",
		"[Lv 1]: ^777777200% ATK, HIT -30^000000",
		"[Lv 2]: ^777777300% ATK, HIT -25^000000",
		"[Lv 3]: ^777777400% ATK, HIT -20^000000",
		"[Lv 4]: ^777777500% ATK, HIT -15^000000",
		"[Lv 5]: ^777777600% ATK, HIT -10^000000"
	].join("\n");

	SkillDescription[SKID.SC_REPRODUCE] = [
		"Reproduce",
		"Max Level: 10",
		"^CC3399Requirement: Plagiarism 5^000000",
		"Skill Form: ^000099Active Toggle / Buff^000000",
		"Description: ^777777Learn the last skill that was",
		"inflicted by an enemy. If the caster uses",
		"this skill one more time, then the skill",
		"effect disappears and caster can keep the",
		"newly acquired skill. Caster can learn only",
		"1 skill and level learned depends on",
		"Reproduce's skill level.^000000"
	].join("\n");

	SkillDescription[SKID.SC_AUTOSHADOWSPELL] = [
		"Auto Shadow Spell",
		"Max Level: 10",
		"^CC3399Requirement: Reproduce 5^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Use a magic skill learned from",
		"^008800Plagiarism^777777 or ^008800Reproduce^777777 skill.^000000",
		"[Lv 1]: ^777777Activate chance 30%, Level 1 skill,",
		"Duration 60 sec.^000000",
		"[Lv 2]: ^777777Activate chance 28%, Level 1 skill,",
		"Duration 80 sec.^000000",
		"[Lv 3]: ^777777Activate chance 26%, Level 2 skill,",
		"Duration 100 sec.^000000",
		"[Lv 4]: ^777777Activate chance 24%, Level 2 skill,",
		"Duration 120 sec.^000000",
		"[Lv 5]: ^777777Activate chance 22%, Level 3 skill,",
		"Duration 140 sec.^000000",
		"[Lv 6]: ^777777Activate chance 20%, Level 3 skill,",
		"Duration 160 sec.^000000",
		"[Lv 7]: ^777777Activate chance 18%, Level 4 skill,",
		"Duration 180 sec.^000000",
		"[Lv 8]: ^777777Activate chance 16%, Level 4 skill,",
		"Duration 200 sec.^000000",
		"[Lv 9]: ^777777Activate chance 14%, Level 5 skill,",
		"Duration 220 sec.^000000",
		"[Lv 10]: ^777777Activate chance 12%, Level 5 skill,",
		"Duration 240 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SC_SHADOWFORM] = [
		"Shadow Form",
		"Max Level: 5",
		"^CC3399Requirement: Tunnel Drive 3^000000",
		"Skill Form: ^FF0000Active / Debuff^000000",
		"Description: ^777777Hide yourself behind another",
		"player's shadow and make the front player",
		"receive damage instead of you. The skill is",
		"canceled if the front player has been",
		"attacked a certain amount of times or the",
		"distance between you and the front player",
		"gets farther. Skills and Items can't be used",
		"while in this state.^000000",
		"[Lv 1]: ^7777775 hits, 10 SP/sec, Duration 30 sec.^000000",
		"[Lv 2]: ^7777776 hits, 9 SP/sec, Duration 40 sec.^000000",
		"[Lv 3]: ^7777777 hits, 8 SP/sec, Duration 50 sec.^000000",
		"[Lv 4]: ^7777778 hits, 7 SP/sec, Duration 60 sec.^000000",
		"[Lv 5]: ^7777779 hits, 6 SP/sec, Duration 70 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SC_TRIANGLESHOT] = [
		"Triangle Shot",
		"Max Level: 10",
		"^CC3399Requirement: Double Strafe 7^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: Attack the enemy by throwing 3",
		"arrows at once. Increase damage as caster's",
		"AGI gets higher. Consume 3 arrows to activate",
		"the skill. The damaged enemy gets knock back",
		"by a low chance.^000000",
		"[Lv 1]: ^777777Range 7 cells, 2% knock back chance^000000",
		"[Lv 2]: ^777777Range 7 cells, 3% knock back chance^000000",
		"[Lv 3]: ^777777Range 7 cells, 4% knock back chance^000000",
		"[Lv 4]: ^777777Range 9 cells, 5% knock back chance^000000",
		"[Lv 5]: ^777777Range 9 cells, 6% knock back chance^000000",
		"[Lv 6]: ^777777Range 9 cells, 7% knock back chance^000000",
		"[Lv 7]: ^777777Range 9 cells, 8% knock back chance^000000",
		"[Lv 8]: ^777777Range 11 cells, 9% knock back chance^000000",
		"[Lv 9]: ^777777Range 11 cells, 10% knock back chance^000000",
		"[Lv 10]: ^777777Range 11 cells, 11% knock back chance^000000"
	].join("\n");

	SkillDescription[SKID.SC_BODYPAINT] = [
		"Body Painting",
		"Max Level: 5",
		"^CC3399Requirement: Shadow Chaser Basic^000000",
		"Skill Form: ^FF0000Active / Debuff / Detect^000000",
		"Description: ^777777Splash paint around the caster",
		"and find hidden enemies. The target and all",
		"surroundings that have been exposed to the",
		"paint get [Blind] along with a chance to",
		"decrease attack speed.^000000",
		"[Lv 1]: ^777777Blind chance 55%, ASPD decrease chance 25%, Duration 5 sec^000000",
		"[Lv 2]: ^777777Blind chance 57%, ASPD decrease chance 30%, Duration 7 sec^000000",
		"[Lv 3]: ^777777Blind chance 59%, ASPD decrease chance 35%, Duration 9 sec^000000",
		"[Lv 4]: ^777777Blind chance 61%, ASPD decrease chance 40%, Duration 11 sec^000000",
		"[Lv 5]: ^777777Blind chance 63%, ASPD decrease chance 45%, Duration 13 sec^000000"
	].join("\n");

	SkillDescription[SKID.SC_INVISIBILITY] = [
		"Invisibility",
		"Max Level: 5",
		"^CC3399Requirement: Auto Shadow Spell 7, Deadly Infection 5, Masquerade Unlucky 3^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Make yourself invisible. You",
		"can attack enemies during invisible state",
		"but the property of attack becomes Ghost",
		"Property level 1. It keeps consuming SP and",
		"also other skill or items can not be used",
		"while the skill is casted. Skill is canceled",
		"if SP becomes 0.",
		"Ignore some of detecting skills.^000000",
		"[Lv 1]: ^777777Crit +20%, ASPD -40%, consume 10% SP/sec^000000",
		"[Lv 2]: ^777777Crit +40%, ASPD -30%, consume 8% SP/sec^000000",
		"[Lv 3]: ^777777Crit +60%, ASPD -20%, consume 6% SP/sec^000000",
		"[Lv 4]: ^777777Crit +80%, ASPD -10%, consume 5% SP/sec^000000",
		"[Lv 5]: ^777777Crit +100%, ASPD -0%, consume 2% SP/sec^000000"
	].join("\n");

	SkillDescription[SKID.SC_DEADLYINFECT] = [
		"Deadly Infection",
		"Max Level: 5",
		"^CC3399Requirement: Shadow Form 3, Auto Shadow Spell 5^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Transfer abnormal status that caster holds at the moment to the target or attacking enemies. Even if the caster transferred its curse to others, the curse on caster is maintained.^000000",
		"[Lv 1]: ^777777Skill Duration 10 sec. / 40% chance of",
		"infection, Consume 40 SP.^000000",
		"[Lv 2]: ^777777Skill Duration 15 sec. / 50% chance of",
		"infection, Consume 44 SP.^000000",
		"[Lv 3]: ^777777Skill Duration 20 sec. / 60% chance of",
		"infection, Consume 48 SP.^000000",
		"[Lv 4]: ^777777Skill Duration 25 sec. / 70% chance of",
		"infection, Consume 52 SP.^000000",
		"[Lv 5]: ^777777Skill Duration 30 sec. / 80% chance of",
		"infection, Consume 56 SP.^000000"
	].join("\n");

	SkillDescription[SKID.SC_ENERVATION] = [
		"Masquerade Enervation",
		"Max Level: 3",
		"^CC3399Requirement: Body Painting 1^000000",
		"Skill Form: ^FF0000Active / Debuff^000000",
		"Description: ^777777Decrease target's ATK with and strips all Spirit Spheres he/she has. Must have a Makeover Brush and consumes 1 Face Paint. The chance of success depends on the caster and target's level and stats.^000000",
		"[Lv 1]: ^777777ATK 30% Decrease / Duration 10 sec.^000000",
		"[Lv 2]: ^777777ATK 40% Decrease / Duration 15 sec.^000000",
		"[Lv 3]: ^777777ATK 50% Decrease / Duration 20 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SC_GROOMY] = [
		"Masquerade Gloomy",
		"Max Level: 3",
		"^CC3399Requirement: Body Painting 1^000000",
		"Skill Form: ^FF0000Active / Debuff^000000",
		"Description: ^777777Decrease target's accuracy and attack speed. Target's animals, pets or Homunculus are stripped with this skill. Must have a Makeover Brush and consume 1 Face Paint. The chance of success depends on the caster and target's level and stats.^000000",
		"[Lv 1]: ^777777Attack Speed 30% Decrease / Accuracy Rate 20% Decrease / Duration 10 sec.^000000",
		"[Lv 2]: ^777777Attack Speed 40% Decrease / Accuracy Rate 40% Decrease / Duration 15 sec.^000000",
		"[Lv 3]: ^777777Attack Speed 50% Decrease / Accuracy Rate 60% Decrease / Duration 20 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SC_IGNORANCE] = [
		"Masquerade Ignorance",
		"Max Level: 3",
		"^CC3399Requirement: Body Painting 1^000000",
		"Skill Form: ^FF0000Active / Debuff^000000",
		"Description: ^777777Drain and receive half of target's SP. To monsters, receive a certain amount of SP depending on monster's level. Target is disabled to use magic or skill while this skill is active. Must have a Makeover Brush and consumes 1 Face Paint. The chance of success depends on the caster and target's level and stats.^000000",
		"[Lv 1]: ^777777Consume SP 100 / Duration 10 sec.^000000",
		"[Lv 2]: ^777777Consume SP 200 / Duration 15 sec.^000000",
		"[Lv 3]: ^777777Consume SP 300 / Duration 20 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SC_LAZINESS] = [
		"Masquerade Laziness",
		"Max Level: 3",
		"^CC3399Requirement: Masquerade Enervation 1, Masquerade Gloomy 1, Masquerade Ignorance 1^000000",
		"Skill Form: ^FF0000Active / Debuff^000000",
		"Description: ^777777Decrease target's movement, casting speed and also flee rate. The target has to consume additional SP [Laziness skill level x 10] to use any skills while target is affected by Laziness. Must have a Makeover Brush and consume 1 Face Paint. The chance of success depends on the caster and target's level and stats.^000000",
		"[Lv 1]: ^777777Flee Rate 10% Decrease /  Casting Speed 20% Decrease / Duration 10 sec.^000000",
		"[Lv 2]: ^777777Flee Rate 20% Decrease /  Casting Speed 30% Decrease / Duration 15 sec.^000000",
		"[Lv 3]: ^777777Flee Rate 30% Decrease /  Casting Speed 40% Decrease / Duration 20 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SC_UNLUCKY] = [
		"Masquerade Unlucky",
		"Max Level: 3",
		"^CC3399Requirement: Masquerade Laziness 1, Masquerade Weakness 1^000000",
		"Skill Form: ^FF0000Active / Debuff^000000",
		"Description: ^777777Decrease target's CRI and Perfect Dodge rate. Certain amount of Zeny is consumed every time target is casting skills. Must give 1 abnormal status to the target among Poison, Blind and Silence status. Required to have Makeover Brush and consume 1 Face Paint. The chance of success is changeable depending on caster and target's level and stats.^000000",
		"[Lv 1]: ^777777Critical 10 Decrease / Perfect Dodge 10 Decrease / Duration 10 sec.^000000",
		"[Lv 2]: ^777777Critical 20 Decrease / Perfect Dodge 20 Decrease / Duration 15 sec.^000000",
		"[Lv 3]: ^777777Critical 30 Decrease / Perfect Dodge 30 Decrease / Duration 20 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SC_WEAKNESS] = [
		"Masquerade Weakness",
		"Max Level: 3",
		"^CC3399Requirement: Masquerade Enervation 1, Masquerade Groomy 1, Masquerade Ignorance 1^000000",
		"Skill Form: ^FF0000Active / Debuff^000000",
		"Description: ^777777Decrease maximum HP and strip weapon and shield from target's body temporary. Target can not equip weapon or shield during casting duration. Required to have Makeover Brush and consume 1 Face Paint. The chance of success is changeable depending on caster and target's level and stats.^000000",
		"[Lv 1]: ^777777MHP 10% Decrease / Duration 10 sec.^000000",
		"[Lv 2]: ^777777MHP 20% Decrease / Duration 15 sec.^000000",
		"[Lv 3]: ^777777MHP 30% Decrease / Duration 20 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SC_STRIPACCESSARY] = [
		"Strip Accessory",
		"Max Level: 5",
		"^CC3399Requirement: Strip Weapon 1^000000",
		"Skill Form: ^FF0000Active / Debuff^000000",
		"Description: ^777777Strip 2 accessories from target's body. The target is disabled to re-equip those released accessories during skill duration. To monsters, it decreases 20% of INT, DEX and LUK for a while.^000000",
		"[Lv 1]: ^777777Chance of Success 14%^000000",
		"[Lv 2]: ^777777Chance of Success 16%^000000",
		"[Lv 3]: ^777777Chance of Success 18%^000000",
		"[Lv 4]: ^777777Chance of Success 20%^000000",
		"[Lv 5]: ^777777Chance of Success 22%^000000"
	].join("\n");

	SkillDescription[SKID.SC_MANHOLE] = [
		"Manhole",
		"Max Level: 3",
		"^CC3399Requirement: Flag Graffiti 1^000000",
		"Skill Form: ^000099Active / Ground^000000",
		"Description: ^777777Draw 1 manhole on the ground and push 1 target into the hole. Trapped targets are disabled from doing anything including attacks. Must have a Paint Brush and consumes 1 Surface Paint.^000000",
		"[Lv 1]: ^777777Skill Duration 5 sec.^000000",
		"[Lv 2]: ^777777Skill Duration 10 sec.^000000",
		"[Lv 3]: ^777777Skill Duration 15 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SC_DIMENSIONDOOR] = [
		"Dimension Door",
		"Max Level: 3",
		"^CC3399Requirement: Manhole 1^000000",
		"Skill Form: ^000099Active / Ground^000000",
		"Description: ^777777Draw magic door on the ground and teleport the target who stepps on it to a random location. Must have a Paint Brush and consumes 1 Surface Paint.^000000",
		"[Lv 1]: ^777777Skill Duration 4 sec.^000000",
		"[Lv 2]: ^777777Skill Duration 8 sec.^000000",
		"[Lv 3]: ^777777Skill Duration 12 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SC_CHAOSPANIC] = [
		"Chaos Panic",
		"Max Level: 3",
		"^CC3399Requirement: Manhole 1^000000",
		"Skill Form: ^000099Active / Ground^000000",
		"Description: ^777777Draw whirling shape on the ground and trap the target into a chaos. The trapped target is in a chaos, so it loses its way and moves abnormally. To monsters, it makes the monster confused, so the monster changes its attacking target randomly. Must have a Paint Brush and consumes 2 Surface Paint.^000000",
		"[Lv 1]: ^777777Skill Duration 5 sec.^000000",
		"[Lv 2]: ^777777Skill Duration 10 sec.^000000",
		"[Lv 3]: ^777777Skill Duration 15 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SC_MAELSTROM] = [
		"Maelstrom",
		"Max Level: 3",
		"^CC3399Requirement: Chaos Panic 3, Masquerade Unlucky 3^000000",
		"Skill Form: ^000099Active / Ground^000000",
		"Description: ^777777Draw swirling circle on the ground and absorb other magic that is cast on the ground. Caster recovers SP depending on absorbed magic level. Must have a Paint Brush and consumes 2 Surface Paint.^000000",
		"[Lv 1]: ^777777Skill Duration 7 sec.^000000",
		"[Lv 2]: ^777777Skill Duration 14 sec.^000000",
		"[Lv 3]: ^777777Skill Duration 21 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SC_BLOODYLUST] = [
		"Bloody Lust",
		"Max Level: 3",
		"^CC3399Requirement: Dimension Door 3^000000",
		"Skill Form: ^000099Active / Ground^000000",
		"Description: ^777777Draw a red circle on the ground and give the target who steps on it level 10 Provoke effect. Must have a Paint Brush and consumes 2 Surface Paint.^000000",
		"[Lv 1]: ^777777Skill Duration 7 sec.^000000",
		"[Lv 2]: ^777777Skill Duration 14 sec.^000000",
		"[Lv 3]: ^777777Skill Duration 21 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SC_FEINTBOMB] = [
		"Feint Bomb",
		"Max Level: 3",
		"^CC3399Requirement: Dimension Door 3^000000",
		"Skill Form: ^000099Active / Ground^000000",
		"Description: ^777777Draw a fake copycat of yourself on the ground and step backwards with Backslide. After a while, the fake copycat explodes itself and gives damage to all surrounding enemies.  Must have a Paint Brush and consumes 1 Surface Paint. Increase damage as caster's DEX gets higher.^000000",
		"[Lv 1]: ^7777773 Cells Backward^000000",
		"[Lv 2]: ^7777776 Cells Backward^000000",
		"[Lv 3]: ^7777779 Cells Backward^000000"
	].join("\n");

	SkillDescription[SKID.LG_CANNONSPEAR] = [
		"Cannon Spear",
		"Max Level: 5",
		"^CC3399Requirement: Pinpoint Attack 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Attack all enemies in a straight line up to 11 cells (width 3 cells) from the caster. Increase Damage depending on caster's STR. Must have spear equipped to cast.^000000",
		"[Lv 1]: ^777777ATK 50%^000000",
		"[Lv 2]: ^777777ATK 100%^000000",
		"[Lv 3]: ^777777ATK 150%^000000",
		"[Lv 4]: ^777777ATK 200%^000000",
		"[Lv 5]: ^777777ATK 250%^000000"
	].join("\n");

	SkillDescription[SKID.LG_BANISHINGPOINT] = [
		"Banishing Point",
		"Max Level: 10",
		"^CC3399Requirement: Spear Mastery 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Attack long distance enemy that is within 7 cells. Increase Accuracy rate as skill level gets higher. Give additional damage depending on Bash level. Requires a Spear to cast.^000000",
		"[Lv 1]: ^777777ATK 50%^000000",
		"[Lv 2]: ^777777ATK 110%^000000",
		"[Lv 3]: ^777777ATK 150%^000000",
		"[Lv 4]: ^777777ATK 200%^000000",
		"[Lv 5]: ^777777ATK 250%^000000",
		"[Lv 6]: ^777777ATK 300%^000000",
		"[Lv 7]: ^777777ATK 350%^000000",
		"[Lv 8]: ^777777ATK 400%^000000",
		"[Lv 9]: ^777777ATK 450%^000000",
		"[Lv 10]: ^777777ATK 500%^000000"
	].join("\n");

	SkillDescription[SKID.LG_TRAMPLE] = [
		"Trample",
		"Max Level: 3",
		"^CC3399Requirement: Royal Guard Basic^000000",
		"Skill Form: ^339900Active / Special^000000",
		"Description: ^777777Tramples a 5x5 area around the caster, destroying all traps. Explosive type traps will activate with this skill.^000000",
		"[Lv 1]: ^777777Chance of Success 50%^000000",
		"[Lv 2]: ^777777Chance of Success 75%^000000",
		"[Lv 3]: ^777777Chance of Success 100%^000000"
	].join("\n");

	SkillDescription[SKID.LG_SHIELDPRESS] = [
		"Shield Press",
		"Max Level: 5",
		"^CC3399Requirement: Shield Charge 3^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Strikes a target with a shield and stuns the target. The damage is influenced by shield weight, refine rate, and the caster's status. A shield is required to cast this skill.^000000",
		"[Lv 1]: ^777777Chance to [Stun] 38%^000000",
		"[Lv 2]: ^777777Chance to [Stun] 46%^000000",
		"[Lv 3]: ^777777Chance to [Stun] 54%^000000",
		"[Lv 4]: ^777777Chance to [Stun] 62%^000000",
		"[Lv 5]: ^777777Chance to [Stun] 70%^000000"
	].join("\n");

	SkillDescription[SKID.LG_REFLECTDAMAGE] = [
		"Reflect Damage",
		"Max Level: 5",
		"^CC3399Requirement: Reflect Shield 5^000000",
		"Skill Form: ^339900Active / Buff (To yourself)^000000",
		"Description: ^777777When receiving physical damage,",
		"portion of the damage is returned in an",
		"area around the caster. While active,",
		"this skill drains SP every second.",
		"The maxmimum damage that reflected is",
		"depend on MaxHP and base level.",
		"Cannot be used with Reflect Shield.^000000",
		"[Lv 1]: ^777777Reflect 20% of Damage, reflect chance 40%, 30 times reflection^000000",
		"[Lv 2]: ^777777Reflect 25% of Damage, reflect chance 50%, 35 times reflection^000000",
		"[Lv 3]: ^777777Reflect 30% of Damage, reflect chance 60%, 40 times reflection^000000",
		"[Lv 4]: ^777777Reflect 35% of Damage, reflect chance 70%, 45 times reflection^000000",
		"[Lv 5]: ^777777Reflect 40% of Damage, reflect chance 80%, 50 times reflection^000000"
	].join("\n");

	SkillDescription[SKID.LG_PINPOINTATTACK] = [
		"Pinpoint Attack",
		"Max Level: 5",
		"^CC3399Requirement: Banishing Point 5^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Quickly move close to the target and hit its vital point. Has a chance to cause different status change or other effect depending on the skill level used. The caster's Agility can increase the damage. Deals 100% critical damage.^000000",
		"[Lv 1]: ^777777ATK 100% / cause bleeding^000000",
		"[Lv 2]: ^777777ATK 200% / remove spirit spheres^000000",
		"[Lv 3]: ^777777ATK 300% / break target's Shield^000000",
		"[Lv 4]: ^777777ATK 400% / break target's Armor^000000",
		"[Lv 5]: ^777777ATK 500% / break target's Weapon^000000"
	].join("\n");

	SkillDescription[SKID.LG_FORCEOFVANGUARD] = [
		"Vanguard Force",
		"Max Level: 5",
		"^CC3399Requirement: Royal Guard Basic^000000",
		"Skill Form: ^339900Active / Buff (To yourself)^000000",
		"Description: ^777777Increase your rage counter when you receive physical attack. The rage counters can be used for the skill Burst Attack. Vanguard Force will cancel when you cast Rage Burst. This skill consumes some SP at regular time interval to stay active.^000000",
		"[Lv 1]: ^77777720% chance / max rage counter 7^000000",
		"[Lv 2]: ^77777732% chance / max rage counter 9^000000",
		"[Lv 3]: ^77777744% chance / max rage counter 11^000000",
		"[Lv 4]: ^77777756% chance / max rage counter 13^000000",
		"[Lv 5]: ^77777768% chance / max rage counter 15^000000"
	].join("\n");

	SkillDescription[SKID.LG_RAGEBURST] = [
		"Burst Attack",
		"Max Level: 1",
		"^CC3399Requirement: Vanguard Force 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Release all Rage Counters from Vanguard Force to deal great damage to an enemy.^000000"
	].join("\n");

	SkillDescription[SKID.LG_SHIELDSPELL] = [
		"Shield Spell",
		"Max Level: 3",
		"^CC3399Requirement: Shield Press 3 / Earth Drive 2^000000",
		"Skill Form: ^339900Active / Special^000000",
		"Description: ^777777Summons magical abilities based on your shield defense, shield magic defense, or shield refine rate depending on the skill level used. An equipped shield is required to cast this skill.^000000",
		"[Lv 1]: ^777777Activate magic based on shield defense^000000",
		"[Lv 2]: ^777777Activate magic based on shield magic defense^000000",
		"[Lv 3]: ^777777Activate magic based on shield refine level^000000"
	].join("\n");

	SkillDescription[SKID.LG_EXEEDBREAK] = [
		"Exceed Break",
		"Max Level: 5",
		"^CC3399Requirement: Banishing Point 3^000000",
		"Skill Form: ^339900Active / Buff (To yourself)^000000",
		"Description: ^777777Gather your strength to cause greater damage on your next attack. A short range physical attack on your body will cancel the skill. Your skill damage is not affected by this skill. Movement speed reduces while this skill is active.^000000",
		"[Lv 1]: ^777777Attack Power 100%^000000",
		"[Lv 2]: ^777777Attack Power 200%^000000",
		"[Lv 3]: ^777777Attack Power 300%^000000",
		"[Lv 4]: ^777777Attack Power 400%^000000",
		"[Lv 5]: ^777777Attack Power 500%^000000"
	].join("\n");

	SkillDescription[SKID.LG_OVERBRAND] = [
		"Over Brand",
		"Max Level: 5",
		"^CC3399Requirement: Moon Slasher 3 / Pinpoint Attack 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Draws a cross on the ground to cause damage at a range of up to 6x6. Enemies that receive damage are knocked back. If targets are pushed into a wall or obstacles, they receive additional damage.^000000",
		"[Lv 1]: ^777777Piercing ATK 400% / Smashing ATK 300%^000000",
		"[Lv 2]: ^777777Piercing ATK 800% / Smashing ATK 600%^000000",
		"[Lv 3]: ^777777Piercing ATK 1200% / Smashing ATK 900%^000000",
		"[Lv 4]: ^777777Piercing ATK 1600% / Smashing ATK 1200%^000000",
		"[Lv 5]: ^777777Piercing ATK 2000% / Smashing ATK 1500%^000000"
	].join("\n");

	SkillDescription[SKID.LG_PRESTIGE] = [
		"Prestige",
		"Max Level: 5",
		"^CC3399Requirement: Trample 3^000000",
		"Skill Form: ^339900Active / Buff (To yourself)^000000",
		"Description: ^777777Chance to completely evade damage from magic attacks while increasing physical defense. The evasion rate depends on your stats. Your Defender level influences the physical defense rate.^000000",
		"[Lv 1]: ^777777Skill Duration 30 sec.^000000",
		"[Lv 2]: ^777777Skill Duration 45 sec.^000000",
		"[Lv 3]: ^777777Skill Duration 60 sec.^000000",
		"[Lv 4]: ^777777Skill Duration 75 sec.^000000",
		"[Lv 5]: ^777777Skill Duration 90 sec.^000000"
	].join("\n");

	SkillDescription[SKID.LG_BANDING] = [
		"Banding",
		"Max Level: 5",
		"^CC3399Requirement: Pinpoint Attack 3 / Burst Attack 1^000000",
		"Skill Form: ^339900Active / Buff (To yourself)^000000",
		"Description: ^777777When Royal Guards in your party have Banding activated, if you are within range with other Royal Guards, your attack and defense increases while sharing HP with them. The number of party members increases the effectiveness of the skill.",
		"Consumes SP at regular interval to keep the skill active. To deactivate the skill, use the skill again.^000000"
	].join("\n");

	SkillDescription[SKID.LG_MOONSLASHER] = [
		"Moon Slasher",
		"Max Level: 5",
		"^CC3399Requirement: Spear Mastery 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Deals damage to all targets in a 3 cell radius around the caster. Forcing all targets hit by it to sit. For monsters, they are unable to move for a short period. Damage is influenced by Over Brand skill level.^000000",
		"[Lv 1]: ^777777ATK 120%, Chance of success 40%^000000",
		"[Lv 2]: ^777777ATK 240%, Chance of success 48%^000000",
		"[Lv 3]: ^777777ATK 360%, Chance of success 56%^000000",
		"[Lv 4]: ^777777ATK 480%, Chance of success 64%^000000",
		"[Lv 5]: ^777777ATK 600%, Chance of success 72%^000000"
	].join("\n");

	SkillDescription[SKID.LG_RAYOFGENESIS] = [
		"Genesis Ray",
		"Max Level: 5",
		"^CC3399Requirement: Grand Cross 5^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Summons the wrath of Angels",
		"from the sky. Causes all targets around",
		"you in a 5 cell radius to receive holy",
		"property damage. Two or more Royal Guards",
		"with Banding activated is required. The",
		"damage is increased by the number of",
		"Banding Royal Guards.",
		"When used on undead or demon monsters,",
		"there is a 50% chance of causing Blind.^000000",
		"[Lv 1]: ^777777ATK 600%, MATK 300%, cost 3% HP^000000",
		"[Lv 2]: ^777777ATK 900%, MATK 600%, cost 6% HP^000000",
		"[Lv 3]: ^777777ATK 1200%, MATK 900%, cost 9% HP^000000",
		"[Lv 4]: ^777777ATK 1500%, MATK 1200%, cost 12% HP^000000",
		"[Lv 5]: ^777777ATK 1800%, MATK 1500%, cost 15% HP^000000"
	].join("\n");

	SkillDescription[SKID.LG_PIETY] = [
		"Piety",
		"Max Level: 5",
		"^CC3399Requirement: Faith 3^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Endows you or a party member",
		"and nearby party member's armors with Holy",
		"property.",
		"Consumes 2 ^008800Holy Waters^777777.^000000",
		"[Lv 1]: ^777777Skill Duration 60 sec.^000000",
		"[Lv 2]: ^777777Skill Duration 80 sec.^000000",
		"[Lv 3]: ^777777Skill Duration 100 sec.^000000",
		"[Lv 4]: ^777777Skill Duration 120 sec.^000000",
		"[Lv 5]: ^777777Skill Duration 140 sec.^000000"
	].join("\n");

	SkillDescription[SKID.LG_EARTHDRIVE] = [
		"Earth Drive",
		"Max Level: 5",
		"^CC3399Requirement: Reflect Damage 3^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Brandish your shield to causing",
		"all targets in an area to receive Earth",
		"elemental damage. Targets hit will have",
		"their defense and attack speed reduced by",
		"25%. The weight of your shield can increase",
		"the damage dealt.^000000",
		"[Lv 1]: ^7777773x3 AoE, 3 second duration^000000",
		"[Lv 2]: ^7777773x3 AoE, 6 second duration^000000",
		"[Lv 3]: ^7777775x5 AoE, 9 second duration^000000",
		"[Lv 4]: ^7777775x5 AoE, 12 second duration^000000",
		"[Lv 5]: ^7777777x7 AoE, 15 second duration^000000"
	].join("\n");

	SkillDescription[SKID.LG_HESPERUSLIT] = [
		"Hesperus Lit",
		"Max Level: 5",
		"^CC3399Requirement: Prestige 3, Banding 3^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Requires 3 Royal Guard with",
		"Banding activated. All Royal Guards in",
		"Banding targets the same enemy and attack",
		"it at once.",
		"Consumes half of your SP (by other Royal",
		"Guards in Banding).^000000",
		"[Lv 1]: ^777777ATK 120%^000000",
		"[Lv 2]: ^777777ATK 240%^000000",
		"[Lv 3]: ^777777ATK 360%^000000",
		"[Lv 4]: ^777777ATK 480%^000000",
		"[Lv 5]: ^777777ATK 600%^000000"
	].join("\n");

	SkillDescription[SKID.LG_INSPIRATION] = [
		"Inspiration",
		"Max Level: 5",
		"^CC3399Requirement: Shield Spell 3, Genesis Ray 4, Piety 5^000000",
		"Skill Form: ^339900Active / Buff (To yourself)^000000",
		"Description: ^777777Increases your HIT, stats,",
		"attack and MaxHP. Cost 1% of experience",
		"to cast. Consume your HP and SP over time.",
		"Part of your attack damage will reflect back",
		"to you. The skill deactivates when your SP",
		"reaches 0. You die if you HP reaches 0. When",
		"the skill is active, you cannot use Banding",
		"or Prestige.^000000",
		"[Lv 1]: ^777777Skill Duration 30 sec.^000000",
		"[Lv 2]: ^777777Skill Duration 45 sec.^000000",
		"[Lv 3]: ^777777Skill Duration 60 sec.^000000",
		"[Lv 4]: ^777777Skill Duration 75 sec.^000000",
		"[Lv 5]: ^777777Skill Duration 90 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SR_DRAGONCOMBO] = [
		"Dragon Combo",
		"Max Level: 10",
		"^CC3399Requirement: Triple Attack 5^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Rapidly hits a single target with two blows with a chance to stun the target. The skill Fallen Empire can be used in combination with this skill.^000000",
		"[Lv 1]: ^777777ATK 140%, Stun Chance 2%^000000",
		"[Lv 2]: ^777777ATK 180%, Stun Chance 3%^000000",
		"[Lv 3]: ^777777ATK 220%, Stun Chance 4%^000000",
		"[Lv 4]: ^777777ATK 260%, Stun Chance 5%^000000",
		"[Lv 5]: ^777777ATK 300%, Stun Chance 6%^000000",
		"[Lv 6]: ^777777ATK 340%, Stun Chance 7%^000000",
		"[Lv 7]: ^777777ATK 380%, Stun Chance 8%^000000",
		"[Lv 8]: ^777777ATK 420%, Stun Chance 9%^000000",
		"[Lv 9]: ^777777ATK 460%, Stun Chance 10%^000000",
		"[Lv 10]: ^777777ATK 500%, Stun Chance 11%^000000"
	].join("\n");

	SkillDescription[SKID.SR_SKYNETBLOW] = [
		"Sky Net Blow",
		"Max Level: 5",
		"^CC3399Requirement: Dragon Combo 3^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777A spinning blow that kicks up a storm, damaging all targets in an area and knocks them back 3 cells. This skill consumes 1 spirit sphere. The caster's Agi stat increase the skill damage.^000000",
		"[Lv 1]: ^777777ATK 80%^000000",
		"[Lv 2]: ^777777ATK 160%^000000",
		"[Lv 3]: ^777777ATK 240%^000000",
		"[Lv 4]: ^777777ATK 320%^000000",
		"[Lv 5]: ^777777ATK 400%^000000"
	].join("\n");

	SkillDescription[SKID.SR_EARTHSHAKER] = [
		"Earth Shaker",
		"Max Level: 5",
		"^CC3399Requirement: Dragon Combo 1, Cursed Circle 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Sends a shockwave through",
		"the ground damaging all targets in area of",
		"effect, enemies targets in Hide/Cloak will",
		"be revealed and receive additional damage.",
		"^008800Consumes 1 spirit sphere.^777777^000000",
		"[Lv 1]: ^7777773x3 AoE, ATK 100%/300%^000000",
		"[Lv 2]: ^7777775x5 AoE, ATK 150%/450%^000000",
		"[Lv 3]: ^7777777x7 AoE, ATK 200%/600%^000000",
		"[Lv 4]: ^7777779x9 AoE, ATK 250%/750%^000000",
		"[Lv 5]: ^77777711x11 AoE, ATK 300%/900%^000000"
	].join("\n");

	SkillDescription[SKID.SR_FALLENEMPIRE] = [
		"Fallen Empire",
		"Max Level: 5",
		"^CC3399Requirement: Dragon Combo 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Do an upward blow using your",
		"shoulders and fists to deal damage to a",
		"single target. Deals additional damage to",
		"targets that have more weight. The target",
		"will be immobilized. Can only be used after",
		"Dragon Combo. After Fallen Empire, Tiger",
		"Cannon and Gates of Hell can be used.^000000",
		"[Lv 1]: ^777777ATK 250%, Immobilized for 0.5 sec.^000000",
		"[Lv 2]: ^777777ATK 400%, Immobilized for 1 sec.^000000",
		"[Lv 3]: ^777777ATK 550%, Immobilized for 1.5 sec.^000000",
		"[Lv 4]: ^777777ATK 700%, Immobilized for 2 sec.^000000",
		"[Lv 5]: ^777777ATK 850%, Immobilized for 2.5 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SR_TIGERCANNON] = [
		"Tiger Cannon",
		"Max Level: 10",
		"^CC3399Requirement: Fallen Empire 3^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Damage to a target's HP and SP",
		"by consuming your own. Must be cast during",
		"Explosion Spirits state. When used after",
		"Fallen Empire, does additional damage.",
		"^008800Consumes 2 spirit spheres.^000000",
		"[Lv 1]: ^7777773x3 AoE, Consumes 12% HP, 6% SP^000000",
		"[Lv 2]: ^7777773x3 AoE, Consumes 14% HP, 7% SP^000000",
		"[Lv 3]: ^7777773x3 AoE, Consumes 16% HP, 8% SP^000000",
		"[Lv 4]: ^7777773x3 AoE, Consumes 18% HP, 9% SP^000000",
		"[Lv 5]: ^7777773x3 AoE, Consumes 20% HP, 10% SP^000000",
		"[Lv 6]: ^7777775x5 AoE, Consumes 22% HP, 11% SP^000000",
		"[Lv 7]: ^7777775x5 AoE, Consumes 24% HP, 12% SP^000000",
		"[Lv 8]: ^7777775x5 AoE, Consumes 26% HP, 13% SP^000000",
		"[Lv 9]: ^7777775x5 AoE, Consumes 28% HP, 14% SP^000000",
		"[Lv 10]: ^7777775x5 AoE, Consumes 30% HP, 15% SP^000000"
	].join("\n");

	SkillDescription[SKID.SR_RAMPAGEBLASTER] = [
		"Rampage Blaster",
		"Max Level: 5",
		"^CC3399Requirement: Earth Shaker 2^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Deals damage to all enemies in the area of effect while consuming all of your spirit spheres. The more spheres you have the more damage the enemies will take. Deals additional damage if you are in Explosion Spirits state.^000000"
	].join("\n");

	SkillDescription[SKID.SR_CRESCENTELBOW] = [
		"Crescent Elbow",
		"Max Level: 5",
		"^CC3399Requirement: Sky Net Blow 1^000000",
		"Skill Form: ^FF0000Active / Offensive^000000",
		"Description: ^777777Has a chance to counter an attack, deals damage and knocks back the enemy while taking part of the damage yourself. The higher the HP of the target, the more damage it deals. Consumes 2 spirit spheres. Does not work on MVP type monsters.^000000",
		"[Lv 1]: ^77777755% chance of proc / 3 second duration^000000",
		"[Lv 2]: ^77777760% chance of proc / 4 second duration^000000",
		"[Lv 3]: ^77777765% chance of proc / 5 second duration^000000",
		"[Lv 4]: ^77777770% chance of proc / 6 second duration^000000",
		"[Lv 5]: ^77777775% chance of proc / 7 second duration^000000"
	].join("\n");

	SkillDescription[SKID.SR_CURSEDCIRCLE] = [
		"Cursed Circle",
		"Max Level: 5",
		"^CC3399Requirement: Blade Stop 2, Gentle Touch - Silence 2^000000",
		"Skill Form: ^339900Active / Special^000000",
		"Description: ^777777While in Area of Effect, all",
		"enemies will be unable to move, attack and",
		"receive the Silence Status for the duration",
		"of the skill. If the caster uses any other",
		"skill, Cursed Circle will be cancelled.",
		"^008800Consumes 1 spirit sphere.^777777^000000",
		"[Lv 1]: ^7777773x3 AoE, Duration 3 sec.^000000",
		"[Lv 2]: ^7777773x3 AoE, Duration 4 sec.^000000",
		"[Lv 3]: ^7777775x5 AoE, Duration 5 sec.^000000",
		"[Lv 4]: ^7777775x5 AoE, Duration 6 sec.^000000",
		"[Lv 5]: ^7777777x7 AoE, Duration 7 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SR_LIGHTNINGWALK] = [
		"Lightning Walk",
		"Max Level: 5",
		"^CC3399Requirement: Windmill 1^000000",
		"Skill Form: ^339900Active Toggle / Special^000000",
		"Description: ^777777When targeted with a ranged or magic attack (single target), there is a chance that you will immediately jump to the attacker. This skill drains your SP regularly while active and consumes your HP to cast. Cancels when the skill activates.^000000",
		"[Lv 1]: ^77777745% proc chance / 5 second duration^000000",
		"[Lv 2]: ^77777750% proc chance / 6 second duration^000000",
		"[Lv 3]: ^77777755% proc chance / 7 second duration^000000",
		"[Lv 4]: ^77777760% proc chance / 8 second duration^000000",
		"[Lv 5]: ^77777765% proc chance / 9 second duration^000000"
	].join("\n");

	SkillDescription[SKID.SR_KNUCKLEARROW] = [
		"Knuckle Arrow",
		"Max Level: 5",
		"^CC3399Requirement: Lightning Walk 3 / Rampage Blaster 3^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Instantly brings you and the target next to each other, damaging the target while knocking the target back. Deals additional damage if the target hits a wall or an obstacle during the knockback. Consumes 2 spirit spheres.^000000",
		"[Lv 1]: ^777777ATK 600% / Knock back Damage 150%^000000",
		"[Lv 2]: ^777777ATK 700% / Knock back Damage 300%^000000",
		"[Lv 3]: ^777777ATK 800% / Knock back Damage 450%^000000",
		"[Lv 4]: ^777777ATK 900% / Knock back Damage 600%^000000",
		"[Lv 5]: ^777777ATK 1000% / Knock back Damage 750%^000000"
	].join("\n");

	SkillDescription[SKID.SR_WINDMILL] = [
		"Windmill",
		"Max Level: 1",
		"^CC3399Requirement: Cursed Circle 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777A low to the ground round kick that damages targets in a 5x5 area around you and forces them to sit. Monsters in the area will be stunned. Does not work on boss or MVP type monsters.^000000"
	].join("\n");

	SkillDescription[SKID.SR_RAISINGDRAGON] = [
		"Raising Dragon",
		"Max Level: 10",
		"^CC3399Requirement: Rampage Blaster 3 / Gentle Touch-Energy Gain 3^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Temporarily increase your mind and spiritual power. You will be able to gather more spirit spheres, increase your Max HP and SP while improving your attack speed. This skill drains your HP regularly, it will cancel when your HP gets to a very low level. You will remain in Explosion Spirits state while this skill is active.^000000",
		"[Lv 1]: ^777777Max Spirit Spheres 6 / Max HP-SP 3% increase / Duration 30 sec.^000000",
		"[Lv 2]: ^777777Max Spirit Spheres 7 / Max HP-SP 4% increase / Duration 45 sec.^000000",
		"[Lv 3]: ^777777Max Spirit Spheres 8 / Max HP-SP 5% increase / Duration 60 sec.^000000",
		"[Lv 4]: ^777777Max Spirit Spheres 9 / Max HP-SP 6% increase / Duration 75 sec.^000000",
		"[Lv 5]: ^777777Max Spirit Spheres 10 / Max HP-SP 7% increase / Duration 90 sec.^000000",
		"[Lv 6]: ^777777Max Spirit Spheres 11 / Max HP-SP 8% increase / Duration 105 sec.^000000",
		"[Lv 7]: ^777777Max Spirit Spheres 12 / Max HP-SP 9% increase / Duration 120 sec.^000000",
		"[Lv 8]: ^777777Max Spirit Spheres 13 / Max HP-SP 10% increase / Duration 135 sec.^000000",
		"[Lv 9]: ^777777Max Spirit Spheres 14 / Max HP-SP 11% increase / Duration 150 sec.^000000",
		"[Lv 10]: ^777777Max Spirit Spheres 15 / Max HP-SP 12% increase / Duration 165 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SR_ASSIMILATEPOWER] = [
		"Power Absorb",
		"Max Level: 1",
		"^CC3399Requirement: Absorp Sprits 1, Power Implantation 1^000000",
		"Skill Form: ^339900Active / Special^000000",
		"Description: ^777777Absorb Spirit Spheres on all targets in a 5x5 area, recovering your SP^000000"
	].join("\n");

	SkillDescription[SKID.SR_POWERVELOCITY] = [
		"Power Implantation",
		"Max Level: 1",
		"^CC3399Requirement: Call Spirits 5^000000",
		"Skill Form: ^339900Active / Special^000000",
		"Description: ^777777Transfers all of your Spirit Spheres to the selected target.^000000"
	].join("\n");

	SkillDescription[SKID.SR_GATEOFHELL] = [
		"Gate of Hell",
		"Max Level: 10",
		"^CC3399Requirement: Raising Dragon 5, Tiger Cannon 5^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Strikes the target with countless blows. The more Spirit Spheres you have, and the lower your HP, the more damage it deals. Consumes all of your Spirit Spheres and 30% of your MaxSP. Can be used after Fallen Empire, in that case the SP consumption is reduced by 10% while the damage is slightly higher. Must be in Explosion Spirits state.^000000"
	].join("\n");

	SkillDescription[SKID.SR_GENTLETOUCH_QUIET] = [
		"Gentle Touch-Silence",
		"Max Level: 5",
		"^CC3399Requirement: Power Implantation 1^000000",
		"Skill Form: ^FF0000Active / Damage and Debuff^000000",
		"Description: ^777777Using the knowledge of pressure point techniques, you put the target on Silence status while dealing damage. Your Dex will greatly increase the damage.^000000",
		"[Lv 1]: ^777777Skill Range 2 cells, ATK 100%^000000",
		"[Lv 2]: ^777777Skill Range 2 cells, ATK 200%^000000",
		"[Lv 3]: ^777777Skill Range 2 cells, ATK 300%^000000",
		"[Lv 4]: ^777777Skill Range 2 cells, ATK 400%^000000",
		"[Lv 5]: ^777777Skill Range 2 cells, ATK 500%^000000"
	].join("\n");

	SkillDescription[SKID.SR_GENTLETOUCH_CURE] = [
		"Gentle Touch-Cure",
		"Max Level: 5",
		"^CC3399Requirement: Power Implantation 1^000000",
		"Skill Form: ^339900Active / Recovery / Buff^000000",
		"Description: ^777777Using the knowledge of",
		"pressure point techniques, you cure",
		"a target's Abnormal Status and recovers",
		"the target's HP. The higher the skill",
		"level the higher the chance of success.",
		"Recover:",
		"^702180Stone Cursed, Frozen, Stun, Poison, Blind,",
		"Silence, Hallucination, Burning, Freezing^777777",
		"and^702180 Guillotine Cross Poison^777777.",
		"Can recover yourself from ^702180Stone Cursed,",
		"Frozen^777777 and^702180 Stun^777777.",
		"^008800Consumes 1 Spirit Sphere^777777.^000000"
	].join("\n");

	SkillDescription[SKID.SR_GENTLETOUCH_ENERGYGAIN] = [
		"Gentle Touch-Energy Gain",
		"Max Level: 5",
		"^CC3399Requirement: Gentle Touch-Silence 3^000000",
		"Skill Form: ^339900Active / Buff (To yourself)^000000",
		"Description: ^777777Use the knowledge of",
		"pressure point techniques, to improve",
		"your fighting spirit which allows you",
		"to the chance to gain spirit spheres",
		"when you deal or receive physical damage.",
		"This skill cannot be used in combination",
		"with Gentle Touch-Change or Gentle Touch",
		"Revitalize.^000000",
		"[Lv 1]: ^777777Consume 1% HP, Chance to gain Spirit Sphere 15%^000000",
		"[Lv 2]: ^777777Consume 2% HP, Chance to gain Spirit Sphere 20%^000000",
		"[Lv 3]: ^777777Consume 3% HP, Chance to gain Spirit Sphere 25%^000000",
		"[Lv 4]: ^777777Consume 4% HP, Chance to gain Spirit Sphere 30%^000000",
		"[Lv 5]: ^777777Consume 5% HP, Chance to gain Spirit Sphere 35%^000000"
	].join("\n");

	SkillDescription[SKID.SR_GENTLETOUCH_CHANGE] = [
		"Gentle Touch - Change",
		"Max Level: 5",
		"^CC3399Requirement: Gentle Touch - Cure 4^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Using the knowledge of",
		"pressure point techniques, converts physical",
		"and magical defense to attack and attack",
		"speed. This skill cannot be used in",
		"combination with Gentle Touch-Energy",
		"Gain or Gentle Touch-Revitalize.^000000",
		"[Lv 1]: ^777777Consume 1% HP^000000",
		"[Lv 2]: ^777777Consume 2% HP^000000",
		"[Lv 3]: ^777777Consume 3% HP^000000",
		"[Lv 4]: ^777777Consume 4% HP^000000",
		"[Lv 5]: ^777777Consume 5% HP^000000"
	].join("\n");

	SkillDescription[SKID.SR_GENTLETOUCH_REVITALIZE] = [
		"Gentle Touch-Revitalize",
		"Max Level: 5",
		"^CC3399Requirement: Gentle Touch-Change 5^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Using the knowledge of pressure",
		"point techniques, your movement speed,",
		"attack speed, Vit, Max HP and physical",
		"defense increases while improving your",
		"natural and skill HP recovery. This skill",
		"cannot be used in combination with Gentle",
		"Touch-Energy Gain or Gentle Touch-Change.",
		"^008800Consumes 2 Spirit Spheres.^777777^000000",
		"[Lv 1]: ^777777MaxHP +2%, HP regeneration +80%^000000",
		"[Lv 2]: ^777777MaxHP +4%, HP regeneration +110%^000000",
		"[Lv 3]: ^777777MaxHP +6%, HP regeneration +140%^000000",
		"[Lv 4]: ^777777MaxHP +8%, HP regeneration +170%^000000",
		"[Lv 5]: ^777777MaxHP +10%, HP regeneration +200%^000000"
	].join("\n");

	SkillDescription[SKID.WA_SWING_DANCE] = [
		"Swing Dance",
		"Max Level: 5",
		"^CC3399Requirement: Deep Sleep Lullaby 1^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Exclusive skill for Whip Class.",
		"Increase movement speed and attack speed",
		"of caster and party members for 60 seconds.",
		"Increment of attack speed is affected by",
		"skill level and caster's job level.^000000",
		"[Lv 1]: ^777777Skill Range 15 x 15 Cells^000000",
		"[Lv 2]: ^777777Skill Range 17 x 17 Cells^000000",
		"[Lv 3]: ^777777Skill Range 19 x 19 Cells^000000",
		"[Lv 4]: ^777777Skill Range 21 x 21 Cells^000000",
		"[Lv 5]: ^777777Skill Range 23 x 23 Cells^000000"
	].join("\n");

	SkillDescription[SKID.WA_SYMPHONY_OF_LOVER] = [
		"Symphony of Lover",
		"Max Level: 5",
		"^CC3399Requirement: Deep Sleep Lullaby 1^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Exclusive skill for Whip Class.",
		"Increase magic defense of caster and party",
		"members for 60 seconds. Increment of magic",
		"defense is affected by Lesson skill level",
		"and caster's job level.^000000",
		"[Lv 1]: ^777777Skill Range 15x15 cells^000000",
		"[Lv 2]: ^777777Skill Range 17x17 cells^000000",
		"[Lv 3]: ^777777Skill Range 19x19 cells^000000",
		"[Lv 4]: ^777777Skill Range 21x21 cells^000000",
		"[Lv 5]: ^777777Skill Range 23x23 cells^000000"
	].join("\n");

	SkillDescription[SKID.WA_MOONLIT_SERENADE] = [
		"Moonlight Serenade",
		"Max Level: 5",
		"^CC3399Requirement: Deep Sleep Lullaby 1^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Exclusive skill for Whip Class.",
		"Increase MATK of caster and party members",
		"for 60 seconds. Increment of MATK is",
		"affected by lesson skill and caster's",
		"job level.^000000",
		"[Lv 1]: ^777777Skill Range 15x15 cells^000000",
		"[Lv 2]: ^777777Skill Range 17x17 cells^000000",
		"[Lv 3]: ^777777Skill Range 19x19 cells^000000",
		"[Lv 4]: ^777777Skill Range 21x21 cells^000000",
		"[Lv 5]: ^777777Skill Range 23x23 cells^000000"
	].join("\n");

	SkillDescription[SKID.MI_RUSH_WINDMILL] = [
		"Windmill Rush",
		"Max Level: 5",
		"^CC3399Requirement: Deep Sleep Lullaby 1^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Increases the ATK of the caster",
		"and party members for 60 sec. This increase",
		"is increased by 1% per level of Lesson and",
		"by 0.2% per Job Level of the caster.",
		"^00BB00Requires an instrument class weapon^777777.^000000",
		"[Lv 1]: ^777777Skill Range 15x15 cells^000000",
		"[Lv 2]: ^777777Skill Range 17x17 cells^000000",
		"[Lv 3]: ^777777Skill Range 19x19 cells^000000",
		"[Lv 4]: ^777777Skill Range 21x21 cells^000000",
		"[Lv 5]: ^777777Skill Range 23x23 cells^000000"
	].join("\n");

	SkillDescription[SKID.MI_ECHOSONG] = [
		"Echo Song",
		"Max Level: 5",
		"^CC3399Requirement: Deep Sleep Lullaby 1^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Increases the defense of the",
		"caster and party members for 60 seconds.",
		"This is increased by 1% per level of Lesson",
		"and by 0.2% per Job Level of the caster.",
		"^00BB00Requires an instrument class weapon^777777.^000000",
		"[Lv 1]: ^777777Def +6%, Skill Range 15x15^000000",
		"[Lv 2]: ^777777Def +12%, Skill Range 17x17^000000",
		"[Lv 3]: ^777777Def +18%, Skill Range 19x19^000000",
		"[Lv 4]: ^777777Def +24%, Skill Range 21x21^000000",
		"[Lv 5]: ^777777Def +30%, Skill Range 23x23^000000"
	].join("\n");

	SkillDescription[SKID.MI_HARMONIZE] = [
		"Harmonize",
		"Max Level: 5",
		"^CC3399Requirement: Deep Sleep Lullaby 1^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Enter a state of harmony with",
		"another player or monster. Equalize all bonus",
		"stats of caster and 1 target for 60 seconds.",
		"^00BB00Requires an instrument class weapon^777777.^000000",
		"[Lv 1]: ^777777All bonus stats become 3-5^000000",
		"[Lv 2]: ^777777All bonus stats become 5-7^000000",
		"[Lv 3]: ^777777All bonus stats become 7-9^000000",
		"[Lv 4]: ^777777All bonus stats become 9-11^000000",
		"[Lv 5]: ^777777All bonus stats become 11-15^000000"
	].join("\n");

	SkillDescription[SKID.WM_LESSON] = [
		"Lesson",
		"Max Level: 10",
		"19^CC3399Requirement: Maestro Basic Skill^000000",
		"20^CC3399Requirement: Wanderer Basic Skill^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increases MaxSP and SP recovery",
		"for each level learned. If skill level reaches",
		"above 5, allows the Wanderer/Maestro to use",
		"3rd Class skills while performing 2nd Class",
		"dances, songs or ensembles.^000000",
		"[Lv 1]: ^777777MaxSP +30, recover 6 SP/10 secs^000000",
		"[Lv 2]: ^777777MaxSP +60, recover 9 SP/10 secs^000000",
		"[Lv 3]: ^777777MaxSP +90, recover 12 SP/10 secs^000000",
		"[Lv 4]: ^777777MaxSP +120, recover 15 SP/10 secs^000000",
		"[Lv 5]: ^777777MaxSP +150, recover 18 SP/10 secs^000000",
		"[Lv 6]: ^777777MaxSP +180, recover 21 SP/10 secs^000000",
		"[Lv 7]: ^777777MaxSP +200, recover 24 SP/10 secs^000000",
		"[Lv 8]: ^777777MaxSP +240, recover 27 SP/10 secs^000000",
		"[Lv 9]: ^777777MaxSP +270, recover 30 SP/10 secs^000000",
		"[Lv 10]: ^777777MaxSP +300, recover 33 SP/10 secs^000000"
	].join("\n");

	SkillDescription[SKID.WM_METALICSOUND] = [
		"Metallic Sound",
		"Max Level: 5",
		"^CC3399Requirement: Dominion Impulse 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Create a high-pitched sound that",
		"drains 1 target's HP and SP. Causes more",
		"damage to enemies affected by Deep Sleep.",
		"The level of Lesson learned increases",
		"damage drastically.^000000",
		"[Lv 1]: ^777777120% MATK + Lesson skill level^000000",
		"[Lv 2]: ^777777240% MATK + Lesson skill level^000000",
		"[Lv 3]: ^777777360% MATK + Lesson skill level^000000",
		"[Lv 4]: ^777777480% MATK + Lesson skill level^000000",
		"[Lv 5]: ^777777600% MATK + Lesson skill level^000000"
	].join("\n");

	SkillDescription[SKID.WM_REVERBERATION] = [
		"Reverberation",
		"Max Level: 5",
		"19^CC3399Requirement: Dissonance 5^000000",
		"20^CC3399Requirement: Ugly Dance 5^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Generate a high-frequency sound",
		"wave and place it up to 10 cells away. If an",
		"enemy touches the cell, it will explode,",
		"splitting the damage it causes across all",
		"enemies in a 3x3 AoE. If nothing comes in",
		"contact with the sound wave, it will explode",
		"on its own after 10 seconds. The sound wave",
		"can be attacked and destroyed by ranged or",
		"magic attacks and a maximum of 3",
		"Reverberations can be set on the ground",
		"at one time.^000000",
		"[Lv 1]: ^777777ATK 400% + MATK 200%^000000",
		"[Lv 2]: ^777777ATK 500% + MATK 300%^000000",
		"[Lv 3]: ^777777ATK 600% + MATK 400%^000000",
		"[Lv 4]: ^777777ATK 700% + MATK 500%^000000",
		"[Lv 5]: ^777777ATK 800% + MATK 600%^000000"
	].join("\n");

	SkillDescription[SKID.WM_DOMINION_IMPULSE] = [
		"Dominion Impulse",
		"Max Level: 1",
		"^CC3399Requirement: Reverberation 1^000000",
		"Skill Form: ^339900Active / Special^000000",
		"Description: ^777777Release a powerful scream that",
		"will activate all Reverberations within 10",
		"cells of the skill's target location. It",
		"will also activate Reverberations left by",
		"other Maestros/Wanderers.^000000"
	].join("\n");

	SkillDescription[SKID.WM_SEVERE_RAINSTORM] = [
		"Severe Rainstorm",
		"Max Level: 5",
		"19^CC3399Requirement: Musical Strike 5^000000",
		"20^CC3399Requirement: Throw Arrow 5^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Shoot a volley of arrows into the",
		"air and rain down arrows on enemies in an",
		"11x11 AoE. Damage is increased depending",
		"on the Caster's base level, Agi and Dex",
		"stats.",
		"Consumes 20 arrows and will fail otherwise.^000000",
		"[Lv 1]: ^7777771 hit/0.3 sec, Duration 0.9 sec^000000",
		"[Lv 2]: ^7777771 hit/0.3 sec, Duration 1.5 sec^000000",
		"[Lv 3]: ^7777771 hit/0.3 sec, Duration 2.1 sec^000000",
		"[Lv 4]: ^7777771 hit/0.3 sec, Duration 2.7 sec^000000",
		"[Lv 5]: ^7777771 hit/0.3 sec, Duration 3 sec^000000"
	].join("\n");

	SkillDescription[SKID.WM_POEMOFNETHERWORLD] = [
		"Song of Despair",
		"Max Level: 5",
		"^CC3399Requirement: Lesson 1^000000",
		"Skill Form: ^FF0000Active / Debuff^000000",
		"Description: ^777777Generate a sound wave on the",
		"ground that will immobilize all enemies within",
		"3x3 AOE. A maximum of 5 can be placed at the",
		"same time. Does not work against MVP type",
		"monsters.",
		"Consume 1 ^008800Neck Protection Candy^777777.",
		"^00BB00Requires instrument/whip class weapon^777777.^000000",
		"[Lv 1]: ^7777778 sec effect duration, 9 sec Sound Wave Duration^000000",
		"[Lv 2]: ^77777710 sec effect duration, 11 sec Sound Wave Duration^000000",
		"[Lv 3]: ^77777712 sec effect duration, 13 sec Sound Wave Duration^000000",
		"[Lv 4]: ^77777714 sec effect duration, 15 sec Sound Wave Duration^000000",
		"[Lv 5]: ^77777716 sec effect duration, 17 sec Sound Wave Duration^000000"
	].join("\n");

	SkillDescription[SKID.WM_VOICEOFSIREN] = [
		"Siren's Voice",
		"Max Level: 5",
		"^CC3399Requirement: Song of Despair 3^000000",
		"Skill Form: ^FF0000Active / Debuff^000000",
		"Description: ^777777Tempt all enemies that are within",
		"range to fall hopelessly in love with the Caster.",
		"Monsters will be unable to attack or target the",
		"caster with skills.",
		"Affected targets will display a 'Heart' emoticon.",
		"The duration of this skill is reduced based on",
		"the target's base level and the skill is",
		"cancelled once the target receives damage.",
		"^00BB00Requires instrument/whip class weapon^777777.^000000",
		"[Lv 1]: ^7777775x5 AOE, 15 sec duration^000000",
		"[Lv 2]: ^7777777x7 AOE, 18 sec duration^000000",
		"[Lv 3]: ^7777779x9 AOE, 21 sec duration^000000",
		"[Lv 4]: ^77777711x11 AOE, 24 sec duration^000000",
		"[Lv 5]: ^77777713x13 AOE, 27 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.WM_DEADHILLHERE] = [
		"Death Valley",
		"Max Level: 5",
		"^CC3399Requirement: Circle of Nature 3^000000",
		"Skill Form: ^339900Active / Recovery^000000",
		"Description: ^777777Recite a sacred poem to revive a",
		"dead companion. The revived player will have",
		"HP equal to the SP they had while dead. If",
		"the player had 0 SP before revival, they",
		"will be has 1 HP.",
		"Consume 1 ^008800Regrettable Tear^777777.",
		"^00BB00Requires instrument/whip class weapon^777777.^000000",
		"[Lv 1]: ^777777Success rate 90%",
		"Consume 50% SP from revival target^000000",
		"[Lv 2]: ^777777Success rate 92%",
		"Consume 40% SP from revival target^000000",
		"[Lv 3]: ^777777Success rate 94%",
		"Consume 30% SP from revival target^000000",
		"[Lv 4]: ^777777Success rate 96%",
		"Consume 20% SP from revival target^000000",
		"[Lv 5]: ^777777Success rate 98%",
		"Consume 10% SP from revival target^000000"
	].join("\n");

	SkillDescription[SKID.WM_LULLABY_DEEPSLEEP] = [
		"Deep Sleep Lullaby",
		"Max Level: 5",
		"^CC3399Requirement: Lesson 1^000000",
		"Skill Form: ^FF0000Active / Debuff^000000",
		"Description: ^777777Force all targets in a certain range",
		"into a Deep Sleep state. Once, the targets are",
		"in a 'Deep Sleep', they are unable to move,",
		"attack, use items, skills or chat. The",
		"effect is cancelled if the targets receive",
		"damage. Targets in Deep Sleep will also take",
		"1.5x greater damage from the next attack.",
		"Affected targets will also recover 3% of",
		"HP/SP every 2 seconds.",
		"^00BB00Requires instrument/whip class weapon^777777.^000000",
		"[Lv 1]: ^77777711x11 AoE^000000",
		"[Lv 2]: ^77777713x13 AoE^000000",
		"[Lv 3]: ^77777715x15 AoE^000000",
		"[Lv 4]: ^77777719x19 AoE^000000",
		"[Lv 5]: ^77777721x21 AoE^000000"
	].join("\n");

	SkillDescription[SKID.WM_SIRCLEOFNATURE] = [
		"Circle of Nature",
		"Max Level: 5",
		"^CC3399Requirement: Lesson 1^000000",
		"Skill Form: ^339900Active / Recovery^000000",
		"Description: ^777777Display the power of the Circle of",
		"Nature by draining a certain amount of SP from",
		"all targets within range, and recovers the",
		"target's HP. If the target's SP is completely",
		"drained, then the skills effect will be",
		"cancelled.",
		"^00BB00Requires instrument/whip class weapon^777777.^000000",
		"[Lv 1]: ^7777777x7 AoE, Consume 4 SP",
		"and recovers 40 HP per sec.^000000",
		"[Lv 2]: ^7777779x9 AoE, Consume 8 SP",
		"and recovers 80 HP per sec.^000000",
		"[Lv 3]: ^77777711x11 AoE, Consume 12 SP",
		"and recovers 120 HP per sec.^000000",
		"[Lv 4]: ^77777713x13 AoE, Consume 16 SP",
		"and recovers 160 HP per sec.^000000",
		"[Lv 5]: ^77777715x5 AoE, Consume 20 SP",
		"and recovers 200 HP per sec.^000000"
	].join("\n");

	SkillDescription[SKID.WM_RANDOMIZESPELL] = [
		"Improvised Song",
		"Max Level: 5",
		"^CC3399Requirement: Song of Despair 1^000000",
		"Skill Form: ^339900Active / Special^000000",
		"Description: ^777777Generate 1 Mage or Wizard spell",
		"and activate it. All required catalyst items",
		"required to generate the magic spell are",
		"ignored.^000000",
		"[Lv 1]: ^777777Uses a random Level 5 magic skill^000000",
		"[Lv 2]: ^777777Uses a random Level 6 magic skill^000000",
		"[Lv 3]: ^777777Uses a random Level 7 magic skill^000000",
		"[Lv 4]: ^777777Uses a random Level 8 magic skill^000000",
		"[Lv 5]: ^777777Uses a random Level 9 magic skill^000000"
	].join("\n");

	SkillDescription[SKID.WM_GLOOMYDAY] = [
		"Gloomy Shyness",
		"Max Level: 5",
		"^CC3399Requirement: Improvised Song 1^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Triple the damage of specific skills",
		"[Brandish Spear, Spiral Pierce, Shield",
		"Boomerang, Shield Chain, or Shield Press].",
		"If the target doesn't have one of these skills,",
		"then the target receives a flee rate and attack",
		"speed penalty.",
		"^00BB00Requires instrument/whip class weapon^777777.^000000",
		"[Lv 1]: ^777777Flee Rate -25, Attack Speed -20%^000000",
		"[Lv 2]: ^777777Flee Rate -30, Attack Speed -25%^000000",
		"[Lv 3]: ^777777Flee Rate -35, Attack Speed -30%^000000",
		"[Lv 4]: ^777777Flee Rate -40, Attack Speed -35%^000000",
		"[Lv 5]: ^777777Flee Rate -45, Attack Speed -40%^000000"
	].join("\n");

	SkillDescription[SKID.WM_GREAT_ECHO] = [
		"Great Echo",
		"Max Level: 5",
		"^CC3399Requirement: Metallic Sound 1^000000",
		"Skill Form: ^FF0000Active / Damage / Chorus^000000",
		"Description: ^777777The caster and at least one other",
		"Wanderer/Maestro in the party, sing loudly to",
		"generate a sound wave that damages all",
		"nearby enemies. The number of Wanderers/",
		"Maestros in the party increases the damage",
		"dealt, as well as reduces the SP consumed",
		"for each of them.",
		"Consume 1 ^008800Neck Protection Candy^777777.^000000",
		"[Lv 1]: ^7777775x5 AoE, 600% ATK^000000",
		"[Lv 2]: ^7777777x7 AoE, 800% ATK^000000",
		"[Lv 3]: ^7777777x7 AoE, 1000% ATK^000000",
		"[Lv 4]: ^7777779x9 AoE, 1200% ATK^000000",
		"[Lv 5]: ^7777779x9 AoE, 1400% ATK^000000"
	].join("\n");

	SkillDescription[SKID.WM_SONG_OF_MANA] = [
		"Song Of Mana",
		"Max Level: 5",
		"19^CC3399Requirement: Harmonize 1, Windmill Rush 1, Echo Song 1^000000",
		"20^CC3399Requirement: Swing Dance 1, Symphony of Lover 1, Moonlight Serenade 1^000000",
		"Skill Form: ^339900Active / Buff / Chorus^000000",
		"Description: ^777777The caster and at least one other",
		"Wanderer/Maestro in the party, sing for Mana,",
		"asking for increased circulation. Recovers 10",
		"SP of the caster and party members every 5",
		"sec. SP recovery is increased based on the",
		"number of Wanderers/Maestros in the party.",
		"^00BB00Requires instrument/whip class weapon^777777.^000000",
		"[Lv 1]: ^77777711x11 AoE, Duration 30 sec^000000",
		"[Lv 2]: ^77777713x13 AoE, Duration 60 sec^000000",
		"[Lv 3]: ^77777715x15 AoE, Duration 90 sec^000000",
		"[Lv 4]: ^77777717x17 AoE, Duration 120 sec^000000",
		"[Lv 5]: ^77777719x19 AoE, Duration 150 sec^000000"
	].join("\n");

	SkillDescription[SKID.WM_DANCE_WITH_WUG] = [
		"Dance with Wug",
		"Max Level: 5",
		"19^CC3399Requirement: Harmonize 1, Windmill Rush 1, Echo Song 1^000000",
		"20^CC3399Requirement: Swing Dance 1, Symphony of Lover 1, Moonlight Serenade 1^000000",
		"Skill Form: ^339900Active / Buff / Chorus^000000",
		"Description: ^777777The caster and at least one other",
		"Wanderer/Maestro in the party, sing a fast",
		"tempo song to encourage your party members.",
		"Increase ASPD and lowers cast time",
		"of skills. The number of Wanderers/Maestros",
		"in the party increases the effect of this",
		"skill.",
		"^00BB00Requires instrument/whip class weapon^777777.^000000",
		"[Lv 1]: ^77777711x11 AoE, Duration 30 sec.^000000",
		"[Lv 2]: ^77777713x13 AoE, Duration 60 sec.^000000",
		"[Lv 3]: ^77777715x15 AoE, Duration 90 sec.^000000",
		"[Lv 4]: ^77777717x17 AoE, Duration 120 sec.^000000",
		"[Lv 5]: ^77777719x19 AoE, Duration 150 sec.^000000"
	].join("\n");

	SkillDescription[SKID.WM_SOUND_OF_DESTRUCTION] = [
		"Song of Destruction",
		"Max Level: 5",
		"^CC3399Requirement: Saturday Night Fever 3,",
		"Sinking Melody 3^000000",
		"Skill Form: ^339900Active / Special / Chorus^000000",
		"Description: ^777777The caster and at least one other",
		"Wanderer/Maestro sing, cancelling all Singing",
		"and Chorus effects from the target and",
		"surrounding enemies while inflicting",
		"physical damage. The success rate is affected",
		"by the caster's Dex, level and skill level as",
		"well as the target's Int and level of the",
		"target's skills. Success rate improves as",
		"the number of Maestros/Wanderers in the",
		"party increases.^000000",
		"[Lv 1]: ^7777779x9 AoE^000000",
		"[Lv 2]: ^7777779x9 AoE^000000",
		"[Lv 3]: ^77777711x11 AoE^000000",
		"[Lv 4]: ^77777713x13 AoE^000000",
		"[Lv 5]: ^77777715x15 AoE^000000"
	].join("\n");

	SkillDescription[SKID.WM_SATURDAY_NIGHT_FEVER] = [
		"Saturday Night Fever",
		"Max Level: 5",
		"^CC3399Requirement: Dance with Wug 1^000000",
		"Skill Form: ^339900Active / Special / Chorus^000000",
		"Description: ^777777When sung by the caster and at",
		"least one other performer, all players",
		"in range of the caster will be compelled to",
		"disco and enter a limited Frenzy state.",
		"Frenzied targets will continuously lose HP",
		"and SP as well as lose defense and Flee",
		"while gaining ATK. Item usage is disabled,",
		"and those affected will be forced to sit",
		"on the ground for 3 seconds after the",
		"Frenzy wears off. If the skill succeeds in",
		"affecting more than 7 players at once, the",
		"Lord of Madness will appear to deal 9999",
		"damage to all those affected.",
		"^00BB00Requires instrument/whip class weapon^777777.^000000",
		"[Lv 1]: ^7777777x7 AoE, ATK +100, DEF -20%,",
		"Flee -50%^000000",
		"[Lv 2]: ^7777779x9 AoE, ATK +200, DEF -30%,",
		"Flee -60%^000000",
		"[Lv 3]: ^77777711x11 AoE, ATK +300, DEF -40%,",
		"Flee -70%^000000",
		"[Lv 4]: ^77777713x13 AoE, ATK +400, DEF -50%,",
		"Flee -80%^000000",
		"[Lv 5]: ^77777715x15 AoE, ATK +500, DEF -60%,",
		"Flee -90%^000000"
	].join("\n");

	SkillDescription[SKID.WM_LERADS_DEW] = [
		"Lerad's Dew",
		"Max Level: 5",
		"19^CC3399Requirement: Harmonize 1, Windmill Rush 1, Echo Song 1^000000",
		"20^CC3399Requirement: Swing Dance 1, Symphony of Lover 1, Moonlight Serenade 1^000000",
		"Skill Form: ^339900Active / Buff / Chorus^000000",
		"Description: ^777777When sung by the caster at least",
		"one other Wanderer/Maestro in the party,",
		"Lerad's Dew will increase the MaxHP of all",
		"surrounding party members. This skill does",
		"not affect characters who are in Frenzy.",
		"Even Meastros or Wanderers in the party",
		"increases the HP given by 300.",
		"^00BB00Requires instrument/whip class weapon^777777.^000000",
		"[Lv 1]: ^77777711x11 AoE, MaxHP +200, Duration 20 sec.^000000",
		"[Lv 2]: ^77777711x11 AoE, MaxHP +400, Duration 30 sec.^000000",
		"[Lv 3]: ^77777713x13 AoE, MaxHP +600, Duration 40 sec.^000000",
		"[Lv 4]: ^77777713x13 AoE, MaxHP +800, Duration 50 sec.^000000",
		"[Lv 5]: ^77777715x15 AoE, MaxHP +1000, Duration 60 sec.^000000"
	].join("\n");

	SkillDescription[SKID.WM_MELODYOFSINK] = [
		"Sinking Melody",
		"Max Level: 5",
		"^CC3399Requirement: Song Of Mana 1^000000",
		"Skill Form: ^339900Active / Buff / Chorus^000000",
		"Description: ^777777When sung by the caster and at",
		"least one other Maestro/Wanderer, Sinking",
		"Melody increases Matk and decreases ATK of",
		"everyone around including the caster. Cannot",
		"be used with the chorus skill Beyond of",
		"Warcry. Each additional Maestro or Wanderer",
		"in the party increases Matk by 3%.",
		"^00BB00Requires instrument/whip class weapon^777777.^000000",
		"[Lv 1]: ^777777Success rate 20%, Duration 20 sec.^000000",
		"[Lv 2]: ^777777Success rate 30%, Duration 30 sec.^000000",
		"[Lv 3]: ^777777Success rate 40%, Duration 40 sec.^000000",
		"[Lv 4]: ^777777Success rate 50%, Duration 50 sec.^000000",
		"[Lv 5]: ^777777Success rate 60%, Duration 60 sec.^000000"
	].join("\n");

	SkillDescription[SKID.WM_BEYOND_OF_WARCRY] = [
		"Beyond of Warcry",
		"Max Level: 5",
		"^CC3399Requirement: Lerad's Dew 1^000000",
		"Skill Form: ^339900Active / Buff / Chorus^000000",
		"Description: ^777777When sung by the caster and at",
		"least one other Maestro/Wanderer, increases",
		"ATK and decreases Matk of everyone around",
		"including the caster. Cannot be used with the",
		"chorus skill Sinking Melody. Each additional",
		"Maestro or Wanderer in the party increases",
		"ATK by 3%.",
		"^00BB00Requires instrument/whip class weapon^777777.^000000",
		"[Lv 1]: ^777777Success rate 20%, Duration 20 sec.^000000",
		"[Lv 2]: ^777777Success rate 25%, Duration 30 sec.^000000",
		"[Lv 3]: ^777777Success rate 30%, Duration 40 sec.^000000",
		"[Lv 4]: ^777777Success rate 35%, Duration 50 sec.^000000",
		"[Lv 5]: ^777777Success rate 40%, Duration 60 sec.^000000"
	].join("\n");

	SkillDescription[SKID.WM_UNLIMITED_HUMMING_VOICE] = [
		"Unlimited Humming Voice",
		"Max Level: 5",
		"^CC3399Requirement: Song of Destruction 1,",
		"Beyond of Warcry 1^000000",
		"Skill Form: ^339900Active / Buff / Chorus^000000",
		"Description: ^777777When sung by the caster and at",
		"least one other Maestro/Wanderer, all targets",
		"around the caster will be able to cast skills",
		"without being interrupted but will increase",
		"skill SP cost by 15%. Each Maestro/Wanderer",
		"in the party reduces this extra cost by 3%.",
		"^00BB00Requires instrument/whip class weapon^777777.^000000",
		"[Lv 1]: ^77777711x11 AoE, 60 sec duration^000000",
		"[Lv 2]: ^77777711x11 AoE, 90 sec duration^000000",
		"[Lv 3]: ^77777713x13 AoE, 120 sec duration^000000",
		"[Lv 4]: ^77777713x13 AoE, 150 sec duration^000000",
		"[Lv 5]: ^77777715x15 AoE, 180 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.SO_FIREWALK] = [
		"Fire Walk",
		"Max Level: 5",
		"^CC3399Requirement: Volcano 1^000000",
		"Skill Form: ^FF0000Active / Special / Damage^000000",
		"Description: ^777777Creates a trail of fire behind",
		"the Caster for 12 sec, dealing ^FF0000Fire^777777 property",
		"damage to enemies that walk on it.^000000",
		"[Lv 1]: ^777777Up to 8 cells^000000",
		"[Lv 2]: ^777777Up to 10 cells^000000",
		"[Lv 3]: ^777777Up to 12 cells^000000",
		"[Lv 4]: ^777777Up to 14 cells^000000",
		"[Lv 5]: ^777777Up to 16 cells^000000"
	].join("\n");

	SkillDescription[SKID.SO_ELECTRICWALK] = [
		"Electric Walk",
		"Max Level: 5",
		"^CC3399Requirement: Violent Gale 1, Seismic Weapon 1^000000",
		"Skill Form: ^FF0000Active / Special / Damage^000000",
		"Description: ^777777Summon thunder under your feet",
		"for 12 sec, dealing ^4cbb17Wind^777777 property damage to",
		"enemies that walk on it.^000000",
		"[Lv 1]: ^777777Up to 8 cells^000000",
		"[Lv 2]: ^777777Up to 10 cells^000000",
		"[Lv 3]: ^777777Up to 12 cells^000000",
		"[Lv 4]: ^777777Up to 14 cells^000000",
		"[Lv 5]: ^777777Up to 16 cells^000000"
	].join("\n");

	SkillDescription[SKID.SO_SPELLFIST] = [
		"Spell Fist",
		"Max Level: 5",
		"^CC3399Requirement: Auto Spell 4^000000",
		"Skill Form: ^FF0000Active / Special / Damage^000000",
		"Description: ^777777If the caster uses this skill",
		"while casting ^00BB00Fire Bolt^777777 or ^00BB00Cold Bolt^777777 or",
		"^00BB00Lightening Bolt^777777, the Bolt casting is",
		"cancelled but all the bolt's power is",
		"concentrated in the caster's hands.",
		"While in this state, physical attacks will",
		"deal magic damage of the bolt. The amount",
		"of damage depends on the skill level.",
		"The skill is cancelled when the duration",
		"expires or when the max number of hits is",
		"reached.^000000",
		"[Lv 1]: ^777777Duration 20 sec, Up to 2 hits^000000",
		"[Lv 2]: ^777777Duration 25 sec, Up to 3 hits^000000",
		"[Lv 3]: ^777777Duration 30 sec, Up to 4 hits^000000",
		"[Lv 4]: ^777777Duration 35 sec, Up to 5 hits^000000",
		"[Lv 5]: ^777777Duration 40 sec, Up to 6 hits^000000"
	].join("\n");

	SkillDescription[SKID.SO_EARTHGRAVE] = [
		"Earth Grave",
		"Max Level: 5",
		"^CC3399Requirement: Earth Spike 5^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Transforms the ground into",
		"spears, causes ^cc5500Earth^777777 property damage",
		"and ^702180Bleeding^777777 state to targets in its range.",
		"Increase the damage depend on ^00BB00Seismic",
		"Weapon^777777 skill level. Can also cause damage to",
		"enemy in ^00BB00Hiding^777777 and ^00BB00Cloaking^777777 state.^000000",
		"[Lv 1]: ^7777777x7 AoE^000000",
		"[Lv 2]: ^7777777x7 AoE^000000",
		"[Lv 3]: ^7777777x7 AoE^000000",
		"[Lv 4]: ^7777779x9 AoE^000000",
		"[Lv 5]: ^7777779x9 AoE^000000"
	].join("\n");

	SkillDescription[SKID.SO_DIAMONDDUST] = [
		"Diamond Dust",
		"Max Level: 5",
		"^CC3399Requirement: Deluge 3^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Creates freezing winds in an",
		"area which causes ^6996ADWater^777777 property magic",
		"damage and ^702180Crystallization^777777 state.",
		"Increase the damage depend on ^00BB00Frost Weapon^777777",
		"skill level. The duration of ^702180Crystallization^777777",
		"state can be reduced with high VIT.^000000",
		"[Lv 1]: ^7777777x7 AoE^000000",
		"[Lv 2]: ^7777777x7 AoE^000000",
		"[Lv 3]: ^7777777x7 AoE^000000",
		"[Lv 4]: ^7777777x7 AoE^000000",
		"[Lv 5]: ^7777777x7 AoE^000000"
	].join("\n");

	SkillDescription[SKID.SO_POISON_BUSTER] = [
		"Poison Buster",
		"Max Level: 5",
		"^CC3399Requirement: Killing Cloud 2^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Manipulates the poison in a",
		"target, causing it to explode and deal",
		"^702180Poison^777777 property damage. This skill cannot",
		"not be used on ^702180Poison^777777 property monsters or",
		"targets that are not poisoned. After a",
		"successful cast, ^702180Poison^777777 status is removed",
		"from the target.^000000"
	].join("\n");

	SkillDescription[SKID.SO_PSYCHIC_WAVE] = [
		"Psychic Wave",
		"Max Level: 5",
		"^CC3399Requirement: Dispell 2^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Fires a wave of psychic",
		"energy at targets in an area to deal",
		"multiple hits of Neutral elemental magic.",
		"Increase damage depending on skill level",
		"and caster's INT.^000000",
		"[Lv 1]: ^7777777x7 AoE, Hit 3 times^000000",
		"[Lv 2]: ^7777777x7 AoE, Hit 4 times^000000",
		"[Lv 3]: ^7777779x9 AoE, Hit 5 times^000000",
		"[Lv 4]: ^7777779x9 AoE, Hit 6 times^000000",
		"[Lv 5]: ^77777711x11 AoE, Hit 7 times^000000"
	].join("\n");

	SkillDescription[SKID.SO_CLOUD_KILL] = [
		"Killing Cloud",
		"Max Level: 5",
		"^CC3399Requirement: Heaven's Drive 5^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Creates a poisonous cloud in",
		"a 7x7 area, which will continuously deal",
		"^702180Poison^777777 property damage and cause ^702180Poison^777777",
		"status. Increase the damage depend on the",
		"skill level.",
		"Requires 2 ^00BB00Red Gemstone^777777 for each cast.^000000",
		"[Lv 1]: ^777777Duration 8 sec.^000000",
		"[Lv 2]: ^777777Duration 10 sec.^000000",
		"[Lv 3]: ^777777Duration 12 sec.^000000",
		"[Lv 4]: ^777777Duration 14 sec.^000000",
		"[Lv 5]: ^777777Duration 16 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SO_STRIKING] = [
		"Striking",
		"Max Level: 5",
		"^CC3399Requirement: Lightning Loader 1,",
		"Flame Launcher 1, Frost Weapon 1,",
		"Seismic Weapon 1^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Increase weapon's ATK and",
		"critical rate of caster and party members",
		"for 1 minute. Affected target consumes",
		"certain amount of SP per second. Increase",
		"skill effect depending on skill level of:",
		"^00BB00Flame Launcher, Frost Weapon, Lightning",
		"Loader^777777 and ^00BB00Seismic Weapon.^000000"
	].join("\n");

	SkillDescription[SKID.SO_WARMER] = [
		"Warmer",
		"Max Level: 5",
		"^CC3399Requirement: Volcano 1, Violent Gale 1^000000",
		"Skill Form: ^000099Active / Ground / Recovery^000000",
		"Description: ^777777Increases the temperature in",
		"7x7 AoE, removing ^702180Crystallization, Frozen^777777",
		"and ^702180Freezing^777777 state from targets in range.^000000",
		"[Lv 1]: ^777777Skill Duration 40 sec.^000000",
		"[Lv 2]: ^777777Skill Duration 45 sec.^000000",
		"[Lv 3]: ^777777Skill Duration 50 sec.^000000",
		"[Lv 4]: ^777777Skill Duration 55 sec.^000000",
		"[Lv 5]: ^777777Skill Duration 60 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SO_VACUUM_EXTREME] = [
		"Extreme Vacuum",
		"Max Level: 5",
		"^CC3399Requirement: Land Protector 2^000000",
		"Skill Form: ^339900Active / Special^000000",
		"Description: ^777777Create a vacuum on a cell that",
		"pull all targets to the center. Targets",
		"in the area cannot move until the skill",
		"duration expires. A high STR reduce the",
		"duration of this skill. Some skills ignore",
		"the effect of Extreme Vacuum.^000000",
		"[Lv 1]: ^7777773x3 AoE, Duration 4 sec.^000000",
		"[Lv 2]: ^7777773x3 AoE, Duration 6 sec.^000000",
		"[Lv 3]: ^7777775x5 AoE, Duration 8 sec.^000000",
		"[Lv 4]: ^7777775x5 AoE, Duration 10 sec.^000000",
		"[Lv 5]: ^7777777x7 AoE, Duration 12 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SO_VARETYR_SPEAR] = [
		"Varetyr Spear",
		"Max Level: 5",
		"^CC3399Requirement: Seismic Weapon 1, Violent Gale 4^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Summon a huge lightning spear",
		"from the sky and give physical and magic",
		"damage (^4cbb17Wind^777777 property) to 1 target and",
		"surrounding enemies. Has a chance to Stun",
		"targets. Increase damage depend ^00BB00Lightning",
		"Loader^777777 skill level.^000000",
		"[Lv 1]: ^7777773x3 AoE^000000",
		"[Lv 2]: ^7777773x3 AoE^000000",
		"[Lv 3]: ^7777775x5 AoE^000000",
		"[Lv 4]: ^7777775x5 AoE^000000",
		"[Lv 5]: ^7777777x7 AoE^000000"
	].join("\n");

	SkillDescription[SKID.SO_ARRULLO] = [
		"Arrullo",
		"Max Level: 5",
		"^CC3399Requirement: Warmer 2^000000",
		"Skill Form: ^339900Active / Special^000000",
		"Description: ^777777Causes Deep Sleep status",
		"on targets within an area.",
		"Consumes 1 ^00BB00Yellow Gemstone^777777 for each cast.^000000",
		"[Lv 1]: ^7777773x3 AoE^000000",
		"[Lv 2]: ^7777773x3 AoE^000000",
		"[Lv 3]: ^7777775x5 AoE^000000",
		"[Lv 4]: ^7777775x5 AoE^000000",
		"[Lv 5]: ^7777777x7 AoE^000000"
	].join("\n");

	SkillDescription[SKID.SO_SUMMON_AGNI] = [
		"Summon Agni",
		"Max Level: 3",
		"^CC3399Requirement: Elemental Control 1, Warmer 3^000000",
		"Skill Form: ^000099Active / Summon^000000",
		"Description: ^777777Summon spirit of Fire, AGNI. Consume [3 Red Blood or 6 Red Blood or 1 Flame_Heart ] as catalyst items depending on the skill level.^000000",
		"[Lv 1]: ^777777Skill Duration 600 sec. / Consume 5 SP per 10 seconds.^000000",
		"[Lv 2]: ^777777Skill Duration 900 sec. / Consume 8 SP per 10 seconds.^000000",
		"[Lv 3]: ^777777Skill Duration 1200 sec. / Consume 11 SP per 10 seconds.^000000"
	].join("\n");

	SkillDescription[SKID.SO_SUMMON_AQUA] = [
		"Summon Aqua",
		"Max Level: 3",
		"^CC3399Requirement: Elemental Control 1, Diamond Dust 3^000000",
		"Skill Form: ^000099Active / Summon^000000",
		"Description: ^777777Summon spirit of water, AQUA. Consume [3 Crystal Blue or 6 Crystal Blue or 1 Mistic Frozen ] as catalyst items depending on the skill level.^000000",
		"[Lv 1]: ^777777Skill Duration 600 sec. / Consume 5 SP per 10 seconds.^000000",
		"[Lv 2]: ^777777Skill Duration 900 sec. / Consume 8 SP per 10 seconds.^000000",
		"[Lv 3]: ^777777Skill Duration 1200 sec. / Consume 11 SP per 10 seconds.^000000"
	].join("\n");

	SkillDescription[SKID.SO_SUMMON_VENTUS] = [
		"Summon Ventus",
		"Max Level: 3",
		"^CC3399Requirement: Elemental Control 1 / Varetyr Spear 3^000000",
		"Skill Form: ^000099Active / Summon^000000",
		"Description: ^777777Summon spirit of wind, Ventus. Consume [3 Wind Of Verdure or 6 Wind Of Verdure or 1 Rough Wind ] as catalyst items depending on the skill level.^000000",
		"[Lv 1]: ^777777Skill Duration 600 sec. / Consume 5 SP per 10 seconds.^000000",
		"[Lv 2]: ^777777Skill Duration 900 sec. / Consume 8 SP per 10 seconds.^000000",
		"[Lv 3]: ^777777Skill Duration 1200 sec. / Consume 11 SP per 10 seconds.^000000"
	].join("\n");

	SkillDescription[SKID.SO_SUMMON_TERA] = [
		"Summon Tera",
		"Max Level: 3",
		"^CC3399Requirement: Elemental Control 1 / Earth Grave 3^000000",
		"Skill Form: ^000099Active / Summon^000000",
		"Description: ^777777Summon spirit of earth, Consume [3 Green Live or 6 Green Live or 1 Great Nature ] as catalyst items depending on the skill level.^000000",
		"[Lv 1]: ^777777Skill Duration 600 sec. / Consume 5 SP per 10 seconds.^000000",
		"[Lv 2]: ^777777Skill Duration 900 sec. / Consume 8 SP per 10 seconds.^000000",
		"[Lv 3]: ^777777Skill Duration 1200 sec. / Consume 11 SP per 10 seconds.^000000"
	].join("\n");

	SkillDescription[SKID.SO_EL_CONTROL] = [
		"Elemental Control",
		"Max Level: 4",
		"^CC3399Requirement: 4 Elemental Analysis 1^000000",
		"Skill Form: ^339900Active^000000",
		"Description: ^777777Command a waiting mode Elemental to switch its mode to Passive (Buff), Defensive (Defense), Offensive (Attack). To switch the elemental into waiting mode, caster just commands same order one more time. When elemental are in waiting mode, they recover little amount HP and SP continuously.^000000",
		"[Lv 1]: ^777777Switch Elemental to Passive mode^000000",
		"[Lv 2]: ^777777Swith Elemental to Defensive mode^000000",
		"[Lv 3]: ^777777Swith Elemental to Offensive mode^000000",
		"[Lv 4]: ^777777Swith Elemental to Waiting mode^000000"
	].join("\n");

	SkillDescription[SKID.SO_EL_ACTION] = [
		"Elemental Action",
		"Max Level: 1",
		"^CC3399Requirement: Elemental Control 3^000000",
		"Skill Form: ^339900Active^000000",
		"Description: ^777777Activate 1 offensive (Attack) command immediately from summoned elemental.^000000"
	].join("\n");

	SkillDescription[SKID.SO_EL_ANALYSIS] = [
		"4 Elemental Analysis",
		"^CC3399Requirement: Flame Launcher 1 / Frost Weapon 1 / Lightning Loader 1 / Seismic Weapon 1^000000",
		"Skill Form: ^339900Active^000000",
		"Description: ^777777Analyze enchanted ores which are used as catalyst items for summoning elemental into pure gemstones. Also, conversely, combine pure gemstones into an enchanted ore.^000000",
		"[Lv 1]: ^777777Analyze enchanted ores into pure gemstones (Once caster puts 1 of Flame Heart, Rough Wind, Mistic Frozen, Great Nature into convert window, it will be divided into Red Blood, Wind of Verdure, Crystal Blue, Green Live. Divided item quantities are randomly decided.^000000",
		"[Lv 2]: ^777777Combine pure gemstones into an enchanted ore (Once caster puts 10 Red Blood, Wind of Verdure, Crystal Blue, Green Live into convert window, it will be combined into 1 Flame Heart, Rough Wind, Mistic Frozen, Great Nature ) There is chance to fail in combining pure gemstones and getting nothing.^000000"
	].join("\n");

	SkillDescription[SKID.SO_EL_SYMPATHY] = [
		"Elemental Sympathy",
		"Max Level: 5",
		"^CC3399Requirement: Elemental Control 3^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase summoned elemental's HP, SP and ATK by sharing the feelings between caster and elemental. It also decreases caster's consuming SP.^000000",
		"[Lv 1]: ^777777MaxHP 5%,  MaxSP 5% Increase  / ATK +25 / SP cost reduction 10%^000000",
		"[Lv 2]: ^777777MaxHP 10%, MaxSP 10% Increase / ATK +50 / SP cost reduction 15%^000000",
		"[Lv 3]: ^777777MaxHP 15%, MaxSP 15% Increase / ATK +75 / SP cost reduction 20%^000000",
		"[Lv 4]: ^777777MaxHP 20%, MaxSP 20% Increase / ATK +100 / SP cost reduction 25%^000000",
		"[Lv 5]: ^777777MaxHP 25%, MaxSP 25% Increase / ATK +125 / SP cost reduction 30%^000000"
	].join("\n");

	SkillDescription[SKID.SO_EL_CURE] = [
		"Elemental Cure",
		"Max Level: 1",
		"^CC3399Requirement: Elemental Sympathy 1^000000",
		"Skill Form: ^339900Active / Recovery^000000",
		"Description: ^777777Recover elemental's HP and SP by consumes 10% HP and SP to recover Elemental's HP and SP for the same amount.. Skill will fail if Caster has lower than 10% HP and SP.^000000"
	].join("\n");

	SkillDescription[SKID.SO_FIRE_INSIGNIA] = [
		"Fire Insignia",
		"Max Level: 3",
		"^CC3399Requirement: Summon Agni 3^000000",
		"Skill Form: ^000099Active / Ground Magic^000000",
		"Description: ^777777Draw a fire insignia on the ground within 3 x 3 cells. Recover 1% of HP per 5 seconds if the target is equipped fire property armor or it is a fire property monster. Conversely, decrease 1% of HP per 5 seconds if the target is equipped earth property armor or it is a earth property monster. But all the targets that are inside of skill range get 1.5 times more damage from water property attack. Consume [Scarlet Point 1 / 2 / 3 ] depending on the skill level.^000000",
		"[Lv 1]: ^777777Increase AGNI's ATK by 20%. Recovery amount of HP, SP per 3 seconds doubled.^000000",
		"[Lv 2]: ^777777ATK +50. Weapon property changes to fire property. Increase physical ATK by 10%.^000000",
		"[Lv 3]: ^777777MATK +50. Increase ATK by 25% in specific fire property magic spell.^000000"
	].join("\n");

	SkillDescription[SKID.SO_WATER_INSIGNIA] = [
		"Water Insignia",
		"Max Level: 3",
		"^CC3399Requirement: Summon Aqua 3^000000",
		"Skill Form: ^000099Active / Ground^000000",
		"Description: ^777777Draw a water insignia on the",
		"ground within 3 x 3 cells. Recover 1% of",
		"HP per 5 seconds, if the target is equipped",
		"water property armor or it is a water",
		"property monster. Conversely, decrease 1% of",
		"HP per 5 seconds, if the target is equipped",
		"fire property armor or it is a fire property",
		"monster. But all the targets that are inside",
		"of skill range get 1.5 times more damage from",
		"wind property attack.",
		"Consume Indigo Point depend on the skill level.^000000",
		"[Lv 1]: ^777777AQUA ATK +20%, Doubled HP and SP recovery per 3 sec^000000",
		"[Lv 2]: ^777777Recovery effect +10%, Grant weapon with water property. ATK +10%.^000000",
		"[Lv 3]: ^777777Cast delay -30%, ATK +25% in specific water property magic spell.^000000"
	].join("\n");

	SkillDescription[SKID.SO_WIND_INSIGNIA] = [
		"Wind Insignia",
		"Max Level: 3",
		"^CC3399Requirement: Summon Ventus 3^000000",
		"Skill Form: ^000099Active / Ground^000000",
		"Description: ^777777Draw a wind insignia on the ground within 3 x 3 cells. Recover 1% of HP per 5 seconds, if the target is equipped wind property armor or it is a wind property monster. Conversely, decrease 1% of HP per 5 seconds, if the target is equipped water property armor or it is a water property monster. But all the targets that are inside of skill range get 1.5 times more damage from earth property attack. Consume [Yellow Wish Point 1 / 2 / 3 ] depending on the skill level.^000000",
		"[Lv 1]: ^777777Increase VENTUS's ATK by 20%. Recovery amount of HP, SP per 3 seconds doubled.^000000",
		"[Lv 2]: ^777777Increase attack speed a bit. Weapon property changes to wind property. Increase physical ATK by 10%.^000000",
		"[Lv 3]: ^777777Decrease casting delay by 50% and increase ATK by 25% in specific wind property magic spell.^000000"
	].join("\n");

	SkillDescription[SKID.SO_EARTH_INSIGNIA] = [
		"Earth Insignia",
		"Max Level: 3",
		"^CC3399Requirement: Summon Tera 3^000000",
		"Skill Form: ^000099Active / Ground^000000",
		"Description: ^777777Draw a earth insignia on the ground within 3 x 3 cells. Recover 1% of HP per 5 seconds, if the target is equipped earth property armor or it is a earth property monster. Conversely, decrease 1% of HP per 5 seconds, if the target is equipped wind property armor or it is a wind property monster. But all the targets that are inside of skill range get 1.5 times more damage from fire property attack. Consume [Lime Green Point 1 / 2 / 3 ] depending on the skill level.^000000",
		"[Lv 1]: ^777777Increase TERA's ATK by 20%. Recovery amount of HP, SP per 3 seconds doubled.^000000",
		"[Lv 2]: ^777777Increase MHP 500, DEF 50. Weapon property changes to earth property. Increase physical ATK by 10%.^000000",
		"[Lv 3]: ^777777Increase MSP 50 , MDEF 50. Increase ATK by 25% in specific earth property magic spell.^000000"
	].join("\n");

	SkillDescription[SKID.GN_TRAINING_SWORD] = [
		"Sword Training",
		"Max Level: 5",
		"^CC3399Requirement: Genetic Basic^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase ATK and Accuracy rate of One Handed Sword or Dagger Class Weapons.^000000",
		"[Lv 1]: ^777777ATK +10 / Accuracy Rate +3^000000",
		"[Lv 2]: ^777777ATK +20 / Accuracy Rate +6^000000",
		"[Lv 3]: ^777777ATK +30 / Accuracy Rate +9^000000",
		"[Lv 4]: ^777777ATK +40 / Accuracy Rate +12^000000",
		"[Lv 5]: ^777777ATK +50 / Accuracy Rate +15^000000"
	].join("\n");

	SkillDescription[SKID.GN_REMODELING_CART] = [
		"Cart Remodeling",
		"Max Level: 5",
		"^CC3399Requirement: Genetic Basic^000000",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase Accuracy rate of Cart Revolution, Cart Tornado and Cart Cannon by remodeling the cart. Extend maximum loading space of the cart.^000000",
		"[Lv 1]: ^777777Cart Weight +500 / Cart skill HIT bonus +4^000000",
		"[Lv 2]: ^777777Cart Weight +1000 / Cart skill HIT bonus +8^000000",
		"[Lv 3]: ^777777Cart Weight +1500 / Cart skill HIT bonus +12^000000",
		"[Lv 4]: ^777777Cart Weight +2000 / Cart skill HIT bonus +16^000000",
		"[Lv 5]: ^777777Cart Weight +2500 / Cart skill HIT bonus +20^000000"
	].join("\n");

	SkillDescription[SKID.GN_CART_TORNADO] = [
		"Cart Tornado",
		"Max Level: 5",
		"^CC3399Requirement: Cart Remodeling 1^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Deals damage by spinning cart giving 2 cells knock-back to the target and any surrounding enemies within 2 cells. Increases damage based on Cart Remodeling level and cart weight. Must have a cart in order to cast.^000000",
		"[Lv 1]: ^777777ATK 50%^000000",
		"[Lv 2]: ^777777ATK 100%^000000",
		"[Lv 3]: ^777777ATK 150%^000000",
		"[Lv 4]: ^777777ATK 200%^000000",
		"[Lv 5]: ^777777ATK 250%^000000"
	].join("\n");

	SkillDescription[SKID.GN_CARTCANNON] = [
		"Cart Cannon",
		"Max Level: 5",
		"^CC3399Requirement: Cart Remodeling 2^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Launch the cannon to deal great damage to 1 target and surroundings. Increase damage based on Cart Remodeling level and caster's INT. Must have a cart to cast and consumes 1 Cannon Ball.^000000",
		"[Lv 1]: ^777777ATK 60% + as Cart Remodeling level^000000",
		"[Lv 2]: ^777777ATK 120% + as Cart Remodeling level^000000",
		"[Lv 3]: ^777777ATK 180% + as Cart Remodeling level^000000",
		"[Lv 4]: ^777777ATK 240% + as Cart Remodeling level^000000",
		"[Lv 5]: ^777777ATK 300% + as Cart Remodeling level^000000"
	].join("\n");

	SkillDescription[SKID.GN_CARTBOOST] = [
		"Cart Boost",
		"Max Level: 5",
		"^CC3399Requirement: Cart Remodeling 3^000000",
		"Skill Form: ^339900Buff (To yourself)^000000",
		"Description: ^777777Increase caster's movement speed and ATK for 90 seconds. Must have a cart in order to cast.^000000",
		"[Lv 1]: ^777777Movement Speed 50% increase / ATK 10 increase^000000",
		"[Lv 2]: ^777777Movement Speed 50% increase / ATK 20 increase^000000",
		"[Lv 3]: ^777777Movement Speed 75% increase / ATK 30 increase^000000",
		"[Lv 4]: ^777777Movement Speed 75% increase / ATK 40 increase^000000",
		"[Lv 5]: ^777777Movement Speed 100% increase / ATK 50 increase^000000"
	].join("\n");

	SkillDescription[SKID.GN_THORNS_TRAP] = [
		"Thorns Trap",
		"Max Level: 5",
		"^CC3399Requirement: Special Pharmacy 2^000000",
		"Skill Form: ^FF0000Special / Damage^000000",
		"Description: ^777777Set Thorn Trap on the ground in a 1 cell range and trap enemies on it. Target receives damage continuously while trapped on the ground. If the trapped target gets fire attack, it burns the thorn trap and the target can be released. Consumes 1 Thorny Plant Seed.^000000",
		"[Lv 1]: ^777777Skill Duration 10 sec.^000000",
		"[Lv 2]: ^777777Skill Duration 12 sec.^000000",
		"[Lv 3]: ^777777Skill Duration 14 sec.^000000",
		"[Lv 4]: ^777777Skill Duration 16 sec.^000000",
		"[Lv 5]: ^777777Skill Duration 18 sec.^000000"
	].join("\n");

	SkillDescription[SKID.GN_BLOOD_SUCKER] = [
		"Blood Sucker",
		"Max Level: 5",
		"^CC3399Requirement: Special Pharmacy 3^000000",
		"Skill Form: ^FF0000Special / Damage^000000",
		"Description: ^777777Attach Blood Sucker Plant onto 1 target and suck all its vital energy. It gives damage to the target while recovering caster's HP. A maximum 3 Blood Sucker Plants can be used. The skill is canceled once the caster gets farther than 12 cells from the target. Consumes 1 Blood Sucker Plant Seed.^000000",
		"[Lv 1]: ^777777HP Leach 10% / Skill Duration 20 sec.^000000",
		"[Lv 2]: ^777777HP Leach 15% / Skill Duration 22 sec.^000000",
		"[Lv 3]: ^777777HP Leach 20% / Skill Duration 24 sec.^000000",
		"[Lv 4]: ^777777HP Leach 25% / Skill Duration 26 sec.^000000",
		"[Lv 5]: ^777777HP Leach 30% / Skill Duration 28 sec.^000000"
	].join("\n");

	SkillDescription[SKID.GN_SPORE_EXPLOSION] = [
		"Spore Explosion",
		"Max Level: 5",
		"^CC3399Requirement: Special Pharmacy 4^000000",
		"Skill Form: ^FF0000Special / Damage^000000",
		"Description: ^777777Attach Bomb Mushroom Spore onto 1 target. After a while, the Bomb Mushroom Spore explodes by itself and gives great damage to the target and all surrounding enemies. Explosion range increases as skill level gets higher. Consumes 1 Bomb Mushroom Spore.^000000",
		"[Lv 1]: ^7777773x3 AoE / Explode in 2 sec.^000000",
		"[Lv 2]: ^7777775x5 AoE / Explode in 2 sec.^000000",
		"[Lv 3]: ^7777777x7 AoE / Explode in 3 sec.^000000",
		"[Lv 4]: ^7777779x9 AoE / Explode in 3 sec.^000000",
		"[Lv 5]: ^77777711x11 AoE / Explode in 4 sec.^000000"
	].join("\n");

	SkillDescription[SKID.GN_WALLOFTHORN] = [
		"Wall of Thorn",
		"Max Level: 5",
		"^CC3399Requirement: Thorns Trap 3^000000",
		"Skill Form: ^FF0000Special / Wall^000000",
		"Description: ^777777Build a thorn wall around 1 target to deal damage and pushes it back. It can be destroyed by attacks and damages. If the Thorn Wall gets fire property damage, it burns out and turns into Fire Wall. Only 1 Thorn Wall can be cast and consumes 1 Thorn Plant Seed.^000000",
		"[Lv 1]: ^77777740 SP / Skill Duration 10 sec.^000000",
		"[Lv 2]: ^77777750 SP / Skill Duration 11 sec.^000000",
		"[Lv 3]: ^77777760 SP / Skill Duration 12 sec.^000000",
		"[Lv 4]: ^77777770 SP / Skill Duration 13 sec.^000000",
		"[Lv 5]: ^77777780 SP / Skill Duration 14 sec.^000000"
	].join("\n");

	SkillDescription[SKID.GN_CRAZYWEED] = [
		"Crazy Weed",
		"Max Level: 10",
		"^CC3399Requirement: Thorn Wall 3^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Give earth property damage to all the enemies within the skill range by dropping huge plant vines. Also it removes traps and its effect from the ground. Increase the number of plant vines as the skill level gets higher.^000000",
		"[Lv 1]: ^77777724 SP / ATK 600% / 3 vines^000000",
		"[Lv 2]: ^77777728 SP / ATK 700% / 4 vines^000000",
		"[Lv 3]: ^77777732 SP / ATK 800% / 4 vines^000000",
		"[Lv 4]: ^77777736 SP / ATK 900% / 5 vines^000000",
		"[Lv 5]: ^77777740 SP / ATK 1000% / 5 vines^000000",
		"[Lv 6]: ^77777744 SP / ATK 1100% / 6 vines^000000",
		"[Lv 7]: ^77777748 SP / ATK 1200% / 6 vines^000000",
		"[Lv 8]: ^77777752 SP / ATK 1300% / 7 vines^000000",
		"[Lv 9]: ^77777756 SP / ATK 1400% / 7 vines^000000",
		"[Lv 10]: ^77777760 SP / ATK 1500% / 8 vines^000000"
	].join("\n");

	SkillDescription[SKID.GN_DEMONIC_FIRE] = [
		"Demonic Fire",
		"Max Level: 5",
		"^CC3399Requirement: Spore Explosion 3^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: ^777777Throw a fire bottle on the ground and set flames. All targets within the skill range keep receiving damages and also get [Ignition] status. Consume 1 Fire Bottle.^000000",
		"[Lv 1]: ^77777724 SP / Fire Matk 130 % / Duration 10 sec. / Ignition Chance 8%^000000",
		"[Lv 2]: ^77777728 SP / Fire Matk 150 % / Duration 12 sec. / Ignition Chance 12%^000000",
		"[Lv 3]: ^77777732 SP / Fire Matk 170 % / Duration 14 sec. / Ignition Chance 16%^000000",
		"[Lv 4]: ^77777736 SP / Fire Matk 190 % / Duration 16 sec. / Ignition Chance 20%^000000",
		"[Lv 5]: ^77777740 SP / Fire Matk 210 % / Duration 18 sec. / Ignition Chance 24%^000000"
	].join("\n");

	SkillDescription[SKID.GN_FIRE_EXPANSION] = [
		"Fire Expansion",
		"Max Level: 5",
		"^CC3399Requirement: Demonic Fire 3^000000",
		"Skill Form: ^FF0000Active / Special / Damage^000000",
		"Description: ^777777When Demonic Fire and Fire Expansion are cast in the same range, it gives several effects depending on the items consumed.^000000",
		"[Lv 1]: ^77777730 SP / Consume Oil Bottle / Increase Demonic Fire Damage by 50% / Add 10 sec. Duration^000000",
		"[Lv 2]: ^77777735 SP / Consume Explosive Powder/ Increase Demonic Fire Damage depending on caster's INT / Cancel Demonic Fire^000000",
		"[Lv 3]: ^77777740 SP / Consume Smoke Powder / Demonic Fire turns into Smoke bullet / Decrease long distance and melee damage / Add Flee Rate^000000",
		"[Lv 4]: ^77777745 SP / Consume Tear Gas / Demonic Fire turns into Tear Gas / Decrease HP, Accuracy rate, Flee Rate^000000",
		"[Lv 5]: ^77777750 SP / Consume Acid Bottle / Demonic Fire turns into Acid Demonstration / Activated in highest level among acquired skill.^000000"
	].join("\n");

	SkillDescription[SKID.GN_HELLS_PLANT] = [
		"Hell's Plant",
		"Max Level: 5",
		"^CC3399Requirement: Blood Sucker 3^000000",
		"Skill Form: ^FF0000Active / Special / Damage^000000",
		"Description: ^777777Bury cannibal plants in the ground and make them bite approaching enemies. It gives damage and inflicts of [Stun] or [Bleeding] status.^000000",
		"[Lv 1]: ^77777740 SP / Max plants 2 / [Bleeding] 10% / [Stun] 30%^000000",
		"[Lv 2]: ^77777745 SP / Max plants 3 / [Bleeding] 15% / [Stun] 40%^000000",
		"[Lv 3]: ^77777750 SP / Max plants 4 / [Bleeding] 20% / [Stun] 50%^000000",
		"[Lv 4]: ^77777755 SP / Max plants 5 / [Bleeding] 25% / [Stun] 60%^000000",
		"[Lv 5]: ^77777760 SP / Max plants 6 / [Bleeding] 30% / [Stun] 70%^000000"
	].join("\n");

	SkillDescription[SKID.GN_MANDRAGORA] = [
		"Howling of Mandragora",
		"Max Level: 5",
		"^CC3399Requirement: Hell Plant 3^000000",
		"Skill Form: ^FF0000Active / Special / Damage^000000",
		"Description: ^777777Pull out a noisy MANDRAGORA from its pot and let it howl at surrounding enemies. Decrease all targets INT and SP. Increase all skill's casting delay. Decrease success rate of the skill depending on target's VIT and LUK.^000000",
		"[Lv 1]: ^77777711x11 AoE / INT -4 / SP 30% Decrease / 30% SP^000000",
		"[Lv 2]: ^77777713x13 AoE / INT -8 / SP 35% Decrease / 35% SP^000000",
		"[Lv 3]: ^77777713x13 AoE / INT -12 / SP 40% Decrease / 40% SP^000000",
		"[Lv 4]: ^77777715x15 AoE / INT -16 / SP 45% Decrease / 45% SP^000000",
		"[Lv 5]: ^77777715x15 AoE / INT -20 / SP 50% Decrease / 50% SP^000000"
	].join("\n");

	SkillDescription[SKID.GN_SLINGITEM] = [
		"Sling Item",
		"Max Level: 1",
		"^CC3399Requirement: Change Material 1^000000",
		"Skill Form: ^339900Active^000000",
		"Description: ^777777Throw fruit bombs or pitching items. Skill ranges 11 cells.^000000"
	].join("\n");

	SkillDescription[SKID.GN_CHANGEMATERIAL] = [
		"Change Material",
		"Max Level: 1",
		"^CC3399Requirement: Genetic Basic^000000",
		"Skill Form: ^339900Active^000000",
		"Description: ^777777Learn the ability to create new items by combining various items. Items can't be made by combining random items. You have to combine the correct items with exact quantities. To get more details about combining items, please travel around Rune Midgard.^000000"
	].join("\n");

	SkillDescription[SKID.GN_MIX_COOKING] = [
		"Mix Cooking",
		"Max Level: 2",
		"^CC3399Requirement: Special Pharmacy 1^000000",
		"Skill Form: ^339900Active^000000",
		"Description: ^777777Cook delicious dishes by mixing various ingredients. You can make 10 dishes at once with level 2 Mixed Cooking. Need a 'Cook Recipe (Cook Book)' to make specific food.^000000",
		"[Lv 1]: ^7777775 SP / Create 1 Food Item^000000",
		"[Lv 2]: ^77777740 SP / Create 10 Food Items^000000"
	].join("\n");

	SkillDescription[SKID.GN_MAKEBOMB] = [
		"Create Bomb",
		"Max Level: 2",
		"^CC3399Requirement: Mixed Cooking 1^000000",
		"Skill Form: ^339900Active^000000",
		"Description: ^777777Make a bomb out of fruits. You can make 10 bombs at once with level 2 Bomb Creation. Need a 'Bomb Making Manual (Manual Book)' to make specific bombs.^000000",
		"[Lv 1]: ^7777775 SP / Create 1 Fruit Bomb^000000",
		"[Lv 2]: ^77777740 SP / Create 10 Fruit Bombs^000000"
	].join("\n");

	SkillDescription[SKID.GN_S_PHARMACY] = [
		"Special Pharmacy",
		"Max Level: 10",
		"^CC3399Requirement: Genetic Basic^000000",
		"Skill Form: ^339900Active^000000",
		"Description: ^777777Geneticist can create more potions or liquid medicine. The number of liquid medicine that can be created increases based on the Geneticist's INT and skill level learned. To make liquid medicine, you need a specific Potion Making Manual.^000000"
	].join("\n");

	SkillDescription[SKID.AB_SECRAMENT] = [
		"Sacrament",
		"Max Level: 5",
		"^CC3399Requirement: Epiclesis 1 / Expiatio 1^000000",
		"Skill Form: ^339900Buff^000000",
		"Description: ^777777Reduces a target's fixed",
		"cast time by performing a holy ceremony.^000000",
		"[Lv 1]: ^777777Fixed cast time -10%, Duration 60 sec.^000000",
		"[Lv 2]: ^777777Fixed cast time -20%, Duration 90 sec.^000000",
		"[Lv 3]: ^777777Fixed cast time -30%, Duration 120 sec.^000000",
		"[Lv 4]: ^777777Fixed cast time -40%, Duration 150 sec.^000000",
		"[Lv 5]: ^777777Fixed cast time -50%, Duration 180 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SR_HOWLINGOFLION] = [
		"Howling of Lion",
		"Max Level: 5",
		"^CC3399Requirement: Power Absorb 1, Lightning Ride 3^000000",
		"Skill Form: ^FF0000Active / Damage(Special)^000000",
		"Description: ^777777Creates a Lion's Howl that",
		"damages all targets in an area around you",
		"with a chance to cause the Fear status. If",
		"the targets were under the effect of a",
		"Maestro or Wanderer's song, that effect",
		"is cancelled.^000000",
		"[Lv 1]: ^7777777x7 AoE, 300% ATK, Fear Chance 10%^000000",
		"[Lv 2]: ^7777779x9 AoE, 600% ATK, Fear Chance 15%^000000",
		"[Lv 3]: ^77777711x11 AoE, 900% ATK, Fear Chance 20%^000000",
		"[Lv 4]: ^77777713x13 AoE, 1200% ATK, Fear Chance 25%^000000",
		"[Lv 5]: ^77777715x15 AoE, 1500% ATK, Fear Chance 30%^000000"
	].join("\n");

	SkillDescription[SKID.SR_RIDEINLIGHTNING] = [
		"Ride in Lightning",
		"Max Level: 5",
		"^CC3399Requirement: Finger Offensive 3^000000",
		"Skill Form: ^FF0000Active / Damage^000000",
		"Description: Description: ^777777Fires your Spirit Spheres to create an explosion that damages all targets in the area of effect. The more Spheres fired, the higher the damage. Increases with higher level of Dex. Targets using Wind Elemental endowed weapons will take additional damage.^000000",
		"[Lv 1]: ^777777AoE 5x5, Consumes 1 Spirit Sphere^000000",
		"[Lv 2]: ^777777AoE 5x5, Consumes 2 Spirit Spheres^000000",
		"[Lv 3]: ^777777AoE 7x7, Consumes 3 Spirit Spheres^000000",
		"[Lv 4]: ^777777AoE 7x7, Consumes 4 Spirit Spheres^000000",
		"[Lv 5]: ^777777AoE 9x9, Consumes 5 Spirit Spheres^000000"
	].join("\n");

	SkillDescription[SKID.ALL_ODINS_RECALL] = [],
	SkillDescription[SKID.RETURN_TO_ELDICASTES] = [
		"Return to Eldicastes",
		"Max Level: 1",
		"Skill Form: ^339900Supportive^bb0000(Return)^000000",
		"Description: ^777777Return to El Dicastes, the Capital of Sapha. 5 minutes cool down time exist.^000000"
	].join("\n");

	SkillDescription[SKID.HLIF_HEAL] = [
		"Touch of Heal",
		"Max Level: 5",
		"Description: ^777777Restore the Master's HP with a",
		"method that mimics the Acolyte's Heal skill.",
		"The amount of restored HP is affected by the",
		"skill's level, Humonculi's Base Level and INT.",
		"^00BB00Each cast requires 1 Condensed Red Potion.^000000",
		"SP Consumption By Level",
		"[Lv 1]: ^77777713 SP^000000",
		"[Lv 2]: ^77777716 SP^000000",
		"[Lv 3]: ^77777719 SP^000000",
		"[Lv 4]: ^77777722 SP^000000",
		"[Lv 5]: ^77777725 SP^000000"
	].join("\n");

	SkillDescription[SKID.HLIF_AVOID] = [
		"Emergency Avoid",
		"Max Level: 5",
		"Description: ^777777Temporarily increase the moving",
		"speed of caster and Homunculus so that they can",
		"escape from a critical situation.^000000",
		"[Lv 1]: ^77777740 Sec Duration Movement Speed +10%^000000",
		"[Lv 2]: ^77777735 Sec Duration Movement Speed +20%^000000",
		"[Lv 3]: ^77777730 Sec Duration Movement Speed +30%^000000",
		"[Lv 4]: ^77777725 Sec Duration Moving Speed +40%^000000",
		"[Lv 5]: ^77777720 Sec Duration Movement Speed +50%000000"
	].join("\n");

	SkillDescription[SKID.HLIF_BRAIN] = [
		"Brain Surgery",
		"Max Level: 5",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Alter the Lif Homunculus's brain",
		"to increase its Max SP, SP Recovery Rate and",
		"the effectiveness of the Healing Hands skill.^000000",
		"[Lv 1]: ^777777Max SP +1% SP Recovery +3%",
		" Healing Hands +2%^000000",
		"[Lv 2]: ^777777Max SP +2% SP Recovery +6%",
		" Healing Hands+4%^000000",
		"[Lv 3]: ^777777Max SP +3% SP Recovery +9%",
		" Healing Hands +6%^000000",
		"[Lv 4]: ^777777Max SP+ 4% SP Recovery +12%",
		" Healing Hands +8%^000000",
		"[Lv 5]: ^777777Max SP +5% SP Recovery +15%",
		" Healing Hands +10%^000000"
	].join("\n");

	SkillDescription[SKID.HLIF_CHANGE] = [
		"Mental Change",
		"Max Level: 3",
		"Description: ^777777Exchange the Lif Homunculus's Max SP",
		"with its Max HP for this skill's duration.",
		"Upon activating this skill, Lif's HP will be",
		"fully restored and will perform normal attacks",
		"that inflict damage equal to its Magic Attack",
		"Power. This skill is cancelled after its",
		"duration and Lif's remaining HP and SP will",
		"become 10.^000000",
		"[Lv 1]: ^7777771 Min Duration 10 Min Cast Delay^000000",
		"[Lv 2]: ^7777773 Min Duration 15 Min Cast Delay^000000",
		"[Lv 3]: ^7777775 Min Duration 20 Min Cast Delay^000000"
	].join("\n");

	SkillDescription[SKID.HAMI_CASTLE] = [
		"Castling",
		"Max Level:5",
		"Description: ^777777Instantly switch the location of",
		"the caster with the Amistr Homunculus so that",
		"monsters attacking the caster will target",
		"Amistr instead.^000000",
		"[Lv 1]: ^77777720% Success Chance^000000",
		"[Lv 2]: ^77777740% Success Chance^000000",
		"[Lv 3]: ^77777760% Success Chance^000000",
		"[Lv 4]: ^77777780% Success Chance^000000",
		"[Lv 5]: ^777777100% Success Chance^000000"
	].join("\n");

	SkillDescription[SKID.HAMI_DEFENCE] = [
		"Defense",
		"Max Level:5",
		"Description: ^777777Enhance the Defense of the caster",
		"and the Amistr Homunculus for this skill's",
		"duration.^000000",
		"[Lv 1]: ^777777DEF+ 2, 40 Sec Duration^000000",
		"[Lv 2]: ^777777DEF +4, 35 Sec Duration^000000",
		"[Lv 3]: ^777777DEF +6, 30 Sec Duration^000000",
		"[Lv 4]: ^777777DEF +8, 25 Sec Duration^000000",
		"[Lv 5]: ^777777DEF +10, 20 Sec Duration^000000"
	].join("\n");

	SkillDescription[SKID.HAMI_SKIN] = [
		"Adamantium Skin",
		"Max Level: 5",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Permanently increase the",
		"Homunculus's Defense, Max HP and HP Recovery",
		"Rate.^000000",
		"[Lv 1]: ^777777DEF +4 Max HP +2% HP Recovery Rate +5%^000000",
		"[Lv 2]: ^777777DEF +8 Max HP +4% HP Recovery Rate +10%^000000",
		"[Lv 3]: ^777777DEF +12 Max HP +6% HP Recovery Rate +15%^000000",
		"[Lv 4]: ^777777DEF +16 Max HP +8% HP Recovery Rate +20%^000000",
		"[Lv 5]: ^777777DEF +20 Max HP +10% HP Recovery Rate +25%^000000"
	].join("\n");

	SkillDescription[SKID.HAMI_BLOODLUST] = [
		"Blood Lust",
		"Max Level: 3",
		"Description: ^777777Increase the Homunculus's Attack",
		"Power for the duration of this skill. During",
		"the Blood Lust status, each attack has the",
		"chance of restoring an amount of HP to",
		"Homunculus equal to 20% of the damage inflicted",
		"to targeted enemy.^000000",
		"[Lv 1]: ^7777771 Min Duration Attack Power +130%",
		" HP Gain Chance +3% 5 Min Cast Delay^000000",
		"[Lv 2]: ^7777773 Min Duration Attack Power +140%",
		" HP Gain Chance +6% 10 Min Cast Delay^000000",
		"[Lv 3]: ^7777775 Min Duration Attack Power +150%",
		" HP Gain Chance +9% 15 Min Cast Delay^000000"
	].join("\n");

	SkillDescription[SKID.HFLI_MOON] = [
		"Moonlight",
		"Max Level:5",
		"Description: ^777777Command Filir Homunculus to peck",
		"repeatedly at a nearby target.^000000",
		"[Lv 1]: ^7777771 Peck, Damage +220%^000000",
		"[Lv 2]: ^7777772 Pecks, Damage +330%^000000",
		"[Lv 3]: ^7777772 Pecks, Damage +440%^000000",
		"[Lv 4]: ^7777772 Pecks, Damage +550%^000000",
		"[Lv 5]: ^7777773 Pecks, Damage +660%^000000"
	].join("\n");

	SkillDescription[SKID.HFLI_FLEET] = [
		"Fleet Move",
		"Max Level:5",
		"Description: ^777777Temporarily increase Filir",
		"Homunculus's Attack Power and Speed.^000000",
		"[Lv 1]: ^777777Aspd +3 Attack Power +110%",
		" 60 Sec Duration 60 Sec Cast Delay^000000",
		"[Lv 2]: ^777777Aspd +6 Attack Power +115%",
		" 55 Sec Duration 70 Sec Cast Delay^000000",
		"[Lv 3]: ^777777Aspd +9 Attack Power +120%",
		" 50 Sec Duration 80 Sec Cast Delay^000000",
		"[Lv 4]: ^777777Aspd +12 Attack Power +125%",
		" 45 Sec Duration 90 Sec Cast Delay^000000",
		"[Lv 5]: ^777777Aspd +15 Attack Power +130%",
		" 40 Sec Duration 120 Sec Cast Delay^000000"
	].join("\n");

	SkillDescription[SKID.HFLI_SPEED] = [
		"Over Speed",
		"Max Level: 5",
		"Description: Temporarily increase Filir Homunculus's",
		"Flee Rate by pushing it to its physical limits.^000000",
		"[Lv 1]: ^777777Flee Rate +20 60 Sec Duration",
		" 60 Sec Cast Delay^000000",
		"[Lv 2]: ^777777Flee Rate +30 55 Sec Duration",
		" 70 Sec Cast Delay^000000",
		"[Lv 3]: ^777777Flee Rate +40 50 Sec Duration",
		" 80 Sec Cast Delay^000000",
		"[Lv 4]: ^777777Flee Rate +50 45 Sec Duration",
		" 90 Sec Cast Delay^000000",
		"[Lv 5]: ^777777Flee Rate +60 40 Sec Duration",
		" 120 Sec Cast Delay^000000"
	].join("\n");

	SkillDescription[SKID.HFLI_SBR44] = [
		"S.B.R.44",
		"Max Level: 3",
		"Description: ^777777Sacrifice intimacy between the",
		"caster and Homunculus to inflict great damage",
		"to a targeted enemy.^000000"
	].join("\n");

	SkillDescription[SKID.HVAN_CAPRICE] = [
		"Caprice",
		"Max Level: 5",
		"Description: ^777777Cast a random Bolt skill. The level",
		"of the Bolt skill cast is affected by the skill",
		"level of Caprice.^000000",
		"[Lv 1]: ^777777Cast Lv 1 Bolt skill^000000",
		"[Lv 2]: ^777777Cast Lv 2 Bolt skill^000000",
		"[Lv 3]: ^777777Cast Lv 3 Bolt skill^000000",
		"[Lv 4]: ^777777Cast Lv 4 Bolt skill^000000",
		"[Lv 5]: ^777777Cast Lv 5 Bolt skill^000000"
	].join("\n");

	SkillDescription[SKID.HVAN_CHAOTIC] = [
		"Chaotic Benediction",
		"Max Level:5",
		"Description: ^777777Restore HP to a target randomly",
		"selected among enemies, the Homuculus's master",
		"or the Homunculus itself.^000000",
		"[Lv 1]: ^777777Lv 1 Heal",
		" 20% Chance of Healing Self",
		" 30% Chance of Healing Master",
		" 50% Chance of Healing Enemy^000000",
		"[Lv 2]: ^777777Lv 1~2 Heal",
		" 50% Chance of Healing Self",
		" 10% Chance of Healing Master",
		" 40% Chance of Healing Enemy^000000",
		"[Lv 3]: ^777777Lv 1~3 Heal",
		" 25% Chance of Healing Self",
		" 50% Chance of Healing Master",
		" 25% Chance of Healing Enemy^000000",
		"[Lv 4]: ^777777Lv 1~4 Heal",
		" 60% Chance of Healing Self",
		" 4% Chance of Healing Master",
		" 36% Chance of Healing Enemy^000000",
		"[Lv 5]: ^777777Lv 1~5 Heal",
		" 34% Chance of Healing Self",
		" 33% Chance of Healing Master",
		" 33% Chance of Healing Enemy^000000"
	].join("\n");

	SkillDescription[SKID.HVAN_INSTRUCT] = [
		"Change Instruction",
		"Max Level: 5",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Increase Homunculus's INT and STR.^000000",
		"[Lv 1]: ^777777+1 INT, +1 STR^000000",
		"[Lv 2]: ^777777+2 INT, +1 STR^000000",
		"[Lv 3]: ^777777+2 INT, +3 STR^000000",
		"[Lv 4]: ^777777+4 INT, +4 STR^000000",
		"[Lv 5]: ^777777+5 INT, +4 STR^000000"
	].join("\n");

	SkillDescription[SKID.HVAN_EXPLOSION] = [
		"Bio Explosion",
		"Max Level: 3",
		"Description: ^777777Command the Homunculus to self",
		"destruct, inflicting splashed damage within",
		"9*9 cells, proportionate to Homunculus's Max HP,",
		"that pierces the Defense of targeted enemies. If",
		"Homunculus successfully destroys itself, the",
		"intimacy between Homunculus and master is",
		"reduced to 1.",
		"[Lv 1]: ^777777Damage = Max HP*1^000000",
		"[Lv 2]: ^777777Damage = Max HP*1.5^000000",
		"[Lv 3]: ^777777Damage = Max HP*2^000000"
	].join("\n");

	SkillDescription[SKID.MS_BASH] = [
		"Bash",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Hit an enemy with crushing force.",
		"If the Fatal Blow skill is learned, Bash will",
		"have an added Stun effect at levels 5 and higher.^000000",
		"[Lv.1]: ^777777ATK 130%^000000",
		"[Lv.2]: ^777777ATK 160%^000000",
		"[Lv.3]: ^777777ATK 190%^000000",
		"[Lv.4]: ^777777ATK 220%^000000",
		"[Lv.5]: ^777777ATK 250%^000000",
		"[Lv.6]: ^777777ATK 280%^000000",
		"[Lv.7]: ^777777ATK 310%^000000",
		"[Lv.8]: ^777777ATK 340%^000000",
		"[Lv.9]: ^777777ATK 370%^000000",
		"[Lv.10]: ^777777ATK 400%^000000"
	].join("\n");

	SkillDescription[SKID.MS_MAGNUM] = [
		"Magnum Break",
		"Skill Form: ^FF0000Offensive^bb0000(Fire)^000000",
		"Description: ^777777Drain a small amount of the",
		"caster's HP to inflict Fire property area effect",
		"damage on enemies in the caster's vicinity and",
		"force them backward. For 10 seconds after Magnum",
		"Break, caster's weapon will receive a 20% Fire",
		"property strength enhancement.^000000",
		"[Lv.1]: ^777777ATK 120%^000000",
		"[Lv.2]: ^777777ATK 140%^000000",
		"[Lv.3]: ^777777ATK 160%^000000",
		"[Lv.4]: ^777777ATK 180%^000000",
		"[Lv.5]: ^777777ATK 200%^000000",
		"[Lv.6]: ^777777ATK 220%^000000",
		"[Lv.7]: ^777777ATK 240%^000000",
		"[Lv.8]: ^777777ATK 260%^000000",
		"[Lv.9]: ^777777ATK 280%^000000",
		"[Lv.10]: ^777777ATK 300%^000000"
	].join("\n");

	SkillDescription[SKID.MS_BOWLINGBASH] = [
		"Bowling Bash",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000 ",
		"Description: ^777777Strike an enemy with massive force,",
		"causing it to tumble away and damage other",
		"enemies^000000"
	].join("\n");

	SkillDescription[SKID.MS_PARRYING] = [
		"Parry",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Block an attack using a Two Handed",
		"Sword while battling. When a block is",
		"successful, damage from the enemy is canceled,",
		"as well as one of the caster's physical attacks.^000000",
		"[Lv.1]: ^777777Block +23%^000000",
		"[Lv.2]: ^777777Block +26%^000000",
		"[Lv.3]: ^777777Block +29%^000000",
		"[Lv.4]: ^777777Block +32%^000000",
		"[Lv.5]: ^777777Block +35%^000000",
		"[Lv.6]: ^777777Block +38%^000000",
		"[Lv.7]: ^777777Block +41%^000000",
		"[Lv.8]: ^777777Block +44%^000000",
		"[Lv.9]: ^777777Block +47%^000000",
		"[Lv.10]: ^777777Block +50%^000000"
	].join("\n");

	SkillDescription[SKID.MS_REFLECTSHIELD] = [
		"Reflect Shield",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Reflect a certain amount of damage",
		"back to the enemy after they inflict damage",
		"with short ranged physical attacks.",
		"^00BB00Requires Shield.^000000"
	].join("\n");

	SkillDescription[SKID.MS_BERSERK] = [
		"Frenzy",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Use the power of rage to increase",
		"Max HP, Movement Speed and Attack Power.",
		"However, this skill will decrease the caster's",
		"Flee Rate and will inhibit actions including",
		"moving, attacking, item use or receiving support",
		"from healing skills. The Frenzy status will",
		"drain a certain amount of HP per second and",
		"disables natural HP and SP restoration for 5",
		"minutes after the Frenzy status has worn off.^000000"
	].join("\n");

	SkillDescription[SKID.MA_DOUBLE] = [
		"Double Strafe",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Inflict double damage on a target",
		"by firing two arrows in one attack.^000000"
	].join("\n");

	SkillDescription[SKID.MA_SHOWER] = [
		"Arrow Shower",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Shoot a volley of arrows at an",
		"enemy to damage a target and other enemies in",
		"the target's vicinity.^000000"
	].join("\n");

	SkillDescription[SKID.MA_SKIDTRAP] = [
		"Skid Trap",
		"Skill Form: ^000099Hidden trap^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Set a trap which will make an enemy",
		"slide in the direction that the caster was",
		"facing at the moment the trap was set.",
		"^00bb00Each cast requires 1 Trap.^000000",
		"[Lv.1]: ^7777776 cells, 300 Sec^000000",
		"[Lv.2]: ^7777777 cells, 240 Sec^000000",
		"[Lv.3]: ^7777778 cells, 180 Sec^000000",
		"[Lv.4]: ^7777779 cells, 120 Sec^000000",
		"[Lv.5]: ^77777710 cells, 60 Sec^000000"
	].join("\n");

	SkillDescription[SKID.MA_LANDMINE] = [
		"Land Mine",
		"Skill Form: ^000099Hidden trap^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Set a trap which will explode once",
		"an enemy steps on it.",
		"^00BB00Each cast requires 1 Trap.^000000",
		"Damage & Duration of Trap by Skill Level",
		"[Lv.1]: ^777777ATK 50%, 65 Sec^000000",
		"[Lv.2]: ^777777ATK 75%, 50 Sec^000000",
		"[Lv.3]: ^777777ATK 100%, 35 Sec^000000",
		"[Lv.4]: ^777777ATK 125%, 20 Sec^000000",
		"[Lv.5]: ^777777ATK 150%, 5 Sec^000000"
	].join("\n");

	SkillDescription[SKID.MA_SANDMAN] = [
		"Sandman",
		"Skill Form: ^000099Hidden Trap^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Set a trap that will cause the",
		"enemy that steps on it, as well as enemies",
		"within the trap's range, to fall asleep.",
		"^00BB00Each cast requires 1 Trap.^000000",
		"[Lv.1]: ^777777150 Sec^000000",
		"[Lv.2]: ^777777120 Sec^000000",
		"[Lv.3]: ^77777790 Sec^000000",
		"[Lv.4]: ^77777760 Sec^000000",
		"[Lv.5]: ^77777730 Sec^000000"
	].join("\n");

	SkillDescription[SKID.MA_FREEZINGTRAP] = [
		"Freezing Trap",
		"Skill Form: ^000099Hidden trap^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Set a trap which will freeze an",
		"enemy once it has been triggered.",
		"^00BB00Each cast requires 2 Traps.^000000",
		"[Lv.1]: ^777777150 Sec^000000",
		"[Lv.2]: ^777777120 Sec^000000",
		"[Lv.3]: ^77777790 Sec^000000",
		"[Lv.4]: ^77777760 Sec^000000",
		"[Lv.5]: ^77777730 Sec^000000"
	].join("\n");

	SkillDescription[SKID.MA_REMOVETRAP] = [
		"Remove Trap",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Trap^000000",
		"Description: ^777777Remove a trap that has been set on",
		"the ground, as well as regain that Trap item.^000000"
	].join("\n");

	SkillDescription[SKID.MA_CHARGEARROW] = [
		"Charge Arrow",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Draw the bowstring to its limit to",
		"fire a volley of arrows with enough force to",
		"push the target 4 cells back.^000000"
	].join("\n");

	SkillDescription[SKID.MA_SHARPSHOOTING] = [
		"Sharp Shooting",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Shoot an arrow with incredible",
		"might directly towards a targeted spot, greatly",
		"damaging any enemies in its path. This is a",
		"Critical Attack that is calculated as the",
		"caster's Critical Attack Rate +20.^000000",
		"[Lv.1]: ^777777ATK +150%^000000",
		"[Lv.2]: ^777777ATK +200%^000000",
		"[Lv.3]: ^777777ATK +250%^000000",
		"[Lv.4]: ^777777ATK +300%^000000",
		"[Lv.5]: ^777777ATK +350%^000000"
	].join("\n");

	SkillDescription[SKID.ML_PIERCE] = [
		"Pierce",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000 ",
		"Description: ^777777Attack an enemy using a thrusting",
		"stab with a number of additional hits that will",
		"depend on monster's size.",
		"^00BB00Requires Spear Class Weapon^777777.^000000",
		"[Small Monsters]: ^7777771 hit^000000",
		"[Medium Monsters]: ^7777772 hits^000000",
		"[Large Monsters]: ^7777773 hits^000000"
	].join("\n");

	SkillDescription[SKID.ML_BRANDISH] = [
		"Brandish Spear",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000 ",
		"Description: ^777777A powerful lancing strike made",
		"while riding a Peco Peco. ^00BB00Requires Spear Class",
		"Weapon^777777and can only be performed while mounted",
		"on a Peco Peco.^000000"
	].join("\n");

	SkillDescription[SKID.ML_SPIRALPIERCE] = [
		"Spiral Pierce",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Hit an enemy with spiraling strikes",
		"that immobilize it for a second and inflict an",
		"amount of damage determined by the skill's",
		"level and the weight of the equipped weapon.",
		"This skill's level also affects its cast time",
		"and delay.^000000"
	].join("\n");

	SkillDescription[SKID.ML_DEFENDER] = [
		"Defender",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Reduce damage inflicted from long ranged",
		"physical attacks at the cost of decreasing",
		"caster's attack and movement speeds for the",
		"skill's duration. Casting this skill again",
		"cancels the Defender status.^000000"
	].join("\n");

	SkillDescription[SKID.ML_AUTOGUARD] = [
		"Auto Guard",
		"Skill Form: ^339900Supportive^000000",
		"Guard status which has a chance of blocking long",
		"and short range physical attacks for the",
		"duration of the skill. When this skill blocks",
		"an attack, caster is immobilized for",
		"0.3 seconds, but this time can be reduced by",
		"increasing the skill's level. Casting this",
		"skill again cancels Guard status.",
		"^00BB00Requires Shield.^000000"
	].join("\n");

	SkillDescription[SKID.ML_DEVOTION] = [
		"Devotion",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^7777771 Party Member^000000",
		"Description: ^777777Protect a party member by receiving",
		"all damage intended for targeted ally. Devotion",
		"only works when level difference between caster",
		"and party member is less than 10. The skill's",
		"effect is canceled when the party member moves",
		"out of the skill's range or dies. Devotion",
		"cannot be used for other Crusaders or Paladins.^000000"
	].join("\n");

	SkillDescription[SKID.MER_MAGNIFICAT] = [
		"Blessing of Mana",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Player, Mercenary^000000",
		"Description: ^777777Double the caster and party",
		"members' SP Recovery Rate for the duration of",
		"the skill.^000000"
	].join("\n");

	SkillDescription[SKID.MER_QUICKEN] = [
		"Weapon Quicken",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Temporarily increase Attack Speed.",
		"Skill duration increases as skill level rises.^000000",
		"[Lv.1]: ^77777730 Sec^000000",
		"[Lv.2]: ^77777760 Sec^000000",
		"[Lv.3]: ^7777771 Min 30 Sec^000000",
		"[Lv.4]: ^7777772 Min^000000",
		"[Lv.5]: ^7777772 Min 30 Sec^000000",
		"[Lv.6]: ^7777773 Min^000000",
		"[Lv.7]: ^7777773 Min 30 Sec^000000",
		"[Lv.8]: ^7777774 Min^000000",
		"[Lv.9]: ^7777774 Min 30 Sec^000000",
		"[Lv.10]: ^7777775 Min^000000"
	].join("\n");

	SkillDescription[SKID.MER_SIGHT] = [
		"Sight",
		"Skill Form: ^339900Supportive^bb0000(Fire)^000000",
		"Description: ^777777Detects enemies hidden in the",
		"caster's vicinity.^000000"
	].join("\n");

	SkillDescription[SKID.MER_CRASH] = [
		"Crash",
		"Skill Form: ^FF0000Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Increase attack damage, and add the",
		"chance of stunning enemies.^000000",
		"[Lv.1]: ^777777ATK 110%, 6% Stun Rate^000000",
		"[Lv.2]: ^777777ATK 120%, 12% Stun Rate^000000",
		"[Lv.3]: ^777777ATK 130%, 18% Stun Rate^000000",
		"[Lv.4]: ^777777ATK 140%, 24% Stun Rate^000000",
		"[Lv.5]: ^777777ATK 150%, 30% Stun Rate^000000"
	].join("\n");

	SkillDescription[SKID.MER_REGAIN] = [
		"Regain",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Player, Mercenary^000000",
		"Description: ^777777Nullify Stun and Sleep",
		"status for the target.^000000"
	].join("\n");

	SkillDescription[SKID.MER_TENDER] = [
		"Tender",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Player, Mercenary^000000",
		"Description: ^777777Nullify Freeze and Stone",
		"status for the target.^000000"
	].join("\n");

	SkillDescription[SKID.MER_BENEDICTION] = [
		"Benediction",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Player, Mercenary^000000",
		"Description: ^777777Nullify Curse and Blind",
		"status for the target.^000000"
	].join("\n");

	SkillDescription[SKID.MER_RECUPERATE] = [
		"Recuperate",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Player, Mercenary^000000",
		"Description: ^777777Nullify Silence and Poison",
		"status for the target.^000000"
	].join("\n");

	SkillDescription[SKID.MER_MENTALCURE] = [
		"Mental Cure",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Player, Mercenary^000000",
		"Description: ^777777Nullify Confusion and Poison",
		"status for the target.^000000"
	].join("\n");

	SkillDescription[SKID.MER_COMPRESS] = [
		"Compress",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Player, Mercenary^000000",
		"Description: ^777777Nullify Bleeding status",
		"for the target.^000000"
	].join("\n");

	SkillDescription[SKID.MER_PROVOKE] = [
		"Provoke",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Enrage a target to decrease its",
		"Defense while increasing its Attack Strength.",
		"Ineffective against the Undead.^000000",
		"Effect of Provoke on Enemies by Skill's Level",
		"[Lv.1]: ^777777+5% ATK, -10% DEF^000000",
		"[Lv.2]: ^777777+8% ATK, -15% DEF^000000",
		"[Lv.3]: ^777777+11% ATK, -20% DEF^000000",
		"[Lv.4]: ^777777+14% ATK, -25% DEF^000000",
		"[Lv.5]: ^777777+17% ATK, -30% DEF^000000",
		"[Lv.6]: ^777777+20% ATK, -35% DEF^000000",
		"[Lv.7]: ^777777+23% ATK, -40% DEF^000000",
		"[Lv.8]: ^777777+26% ATK, -45% DEF^000000",
		"[Lv.9]: ^777777+29% ATK, -50% DEF^000000",
		"[Lv.10]: ^777777+32% ATK, -55% DEF^000000"
	].join("\n");

	SkillDescription[SKID.MER_AUTOBERSERK] = [
		"Auto Berserk",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Empowered by rage, character enters",
		"condition that is equivalent to Level 10 Provoke",
		"status when HP is reduced to less than 25% of",
		"Max HP. Provoked status lasts until character",
		"HP is restored to more than 25% of Max HP or",
		"if Provoke effect is nullified.^000000"
	].join("\n");

	SkillDescription[SKID.MER_DECAGI] = [
		"Decrease Agility",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Decrease target's Movement and",
		"Attack Speeds for the skill's duration.^000000"
	].join("\n");

	SkillDescription[SKID.MER_SCAPEGOAT] = [
		"Scapegoat",
		"Skill Form: ^339900Supportive^000000",
		"Description: ^777777Mercenary will sacrifice himself to",
		"give his remaining HP to his summoner.^000000"
	].join("\n");

	SkillDescription[SKID.MER_LEXDIVINA] = [
		"Lex Divina",
		"Skill Form: ^FF0000Exorcism^000000",
		"Target: ^777777Enemy^000000 ",
		"Description: ^777777Silence an enemy, temporarily",
		"disabling its use of skills, for a set duration.^000000"
	].join("\n");

	SkillDescription[SKID.MER_ESTIMATION] = [
		"Sense",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Monster^000000",
		"Description: ^777777Provide the targeted monster's",
		"information to the caster and all party members.^000000"
	].join("\n");

	SkillDescription[SKID.GD_APPROVAL] = [
		"Official Guild Approval",
		"Skill Form: ^6666ccPassive^000000",
		"Target: ^777777Guild^000000",
		"Description: ^777777Receive",
		"certification as an",
		"official guild in the",
		"Rune-Midgarts Kingdom.",
		"Official guild members are",
		"authorized to attack the",
		"Emperiums of other guilds.",
		"^000000"
	].join("\n");

	SkillDescription[SKID.GD_KAFRACONTRACT] = [
		"Contract with Kafra",
		"Skill Form: ^6666ccPassive^000000",
		"Target: ^777777Guild^000000",
		"Description: ^777777Contract",
		"with the Kafra Corporation",
		"to hire a personal Kafra",
		"Employee for territory",
		"owned by your guild.^000000"
	].join("\n");

	SkillDescription[SKID.GD_GUARDRESEARCH] = [
		"Guardian Research",
		"Skill Form: ^6666ccPassive^000000",
		"Target: ^777777Guild^000000",
		"Description: ^777777The study",
		"of Guardian technology",
		"which enables guilds to",
		"create Guardians that will",
		"protect their territories.^000000"
	].join("\n");

	SkillDescription[SKID.GD_GUARDUP] = [
		"Strengthen Guardians",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Enhance the strength of Guardians",
		"that are protecting Guild Castles in your",
		"Guild's possession. This skill's level affects",
		"the Guardians' Attack Power and Speed.^000000"
	].join("\n");

	SkillDescription[SKID.GD_EXTENSION] = [
		"Guild Extension",
		"Skill Form: ^6666ccPassive^000000",
		"Target: ^777777Guild^000000",
		"Description: ^777777Increase",
		"the maximum member",
		"capacity of your guild.",
		"[Lv 1]: ^777777+4 people^000000",
		"[Lv 2]: ^777777+8 people^000000",
		"[Lv 3]: ^777777+12 people^000000",
		"[Lv 4]: ^777777+16 people^000000",
		"[Lv 5]: ^777777+20 people^000000",
		"[Lv 6]: ^777777+24 people^000000",
		"[Lv 7]: ^777777+28 people^000000",
		"[Lv 8]: ^777777+32 people^000000",
		"[Lv 9]: ^777777+36 people^000000",
		"[Lv 10]: ^777777+40 people^000000"
	].join("\n");

	SkillDescription[SKID.GD_GLORYGUILD] = [
	].join("\n");

	SkillDescription[SKID.GD_LEADERSHIP] = [
		"Skill Form: ^6666ccPassive^000000",
		"Target: ^777777Guildsmen^00000",
		"Range: ^7777775 cells around the caster^000000",
		"Description: ^777777Add +5 STR to all guildsmen within",
		"this skill's range.^000000"
	].join("\n");

	SkillDescription[SKID.GD_GLORYWOUNDS] = [
		"Glorious Wounds",
		"Skill Form: ^6666ccPassive^000000",
		"Target: ^777777Guildsmen^00000",
		"Range: ^7777775 cells around the caster^000000",
		"Description: ^777777Add +5 VIT to all guildsmen within",
		"this skill's range.^000000"
	].join("\n");

	SkillDescription[SKID.GD_SOULCOLD] = [
		"Cold Heart",
		"Skill Form: ^6666ccPassive^000000",
		"Target: ^777777Guildsmen^00000",
		"Range: ^7777775 cells around the caster^000000",
		"Description: ^777777Add +5 AGI to all guildsmen within",
		"this skill's range.^000000"
	].join("\n");

	SkillDescription[SKID.GD_HAWKEYES] = [
		"Hawk Eyes",
		"Skill Form: ^6666ccPassive^000000",
		"Target: ^777777Guildsmen^00000",
		"Range: ^7777775 cells around the caster^000000",
		"Description: ^777777Add +5 DEX to all guildsmen within",
		"this skill's range.^000000"
	].join("\n");

	SkillDescription[SKID.GD_BATTLEORDER] = [
		"Battle Order",
		"Skill Form: ^6666ccPassive^000000",
		"Target: ^777777Guildsmen^000000",
		"Range: ^777777Guildmaster's View^000000",
		"Description: ^777777This skill is only enabled during",
		"WoE (Guild War). Guildmaster can add +5 to STR,",
		"INT and DEX for all guildsmen within the screen.",
		"This skill lasts for 1 minute and the caster",
		"must wait 5 minutes before this skill can be",
		"cast again.^000000"
	].join("\n");

	SkillDescription[SKID.GD_REGENERATION] = [
		"Regeneration",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Guildsmen^000000",
		"Range: ^777777Guildmaster's View^000000",
		"Description: ^777777This skill is only enabled during",
		"WoE (Guild War). The Guildmaster can increase",
		"the HP/SP Recovery Rate for all Guildsmen within",
		"the screen. Once used, this skill cannot be",
		"cast again for 5 minutes.^000000",
		"[Lv 1]: ^777777HP Recovery Rate*2^000000",
		"[Lv 2]: ^777777HP/SP Recovery Rate*2^000000",
		"[Lv 3]: ^777777HP/SP Recovery Rate*3^000000"
	].join("\n");

	SkillDescription[SKID.GD_RESTORE] = [
		"Restore",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777Guildsmen^000000",
		"Range: ^777777Guildmaster's View^000000",
		"Description: ^777777This skill is only enabled during",
		"WoE (Guild War). The Guildmaster can restore",
		"90% Max HP/SP for all Guildsmen within the",
		"screen. Once used, this skill cannot be cast",
		"again for 5 minutes.^000000"
	].join("\n");

	SkillDescription[SKID.GD_EMERGENCYCALL] = [
		"Emergency Call",
		"Skill Form: ^339900Supportive^000000",
		"Target: ^777777All Online Guildsmen^000000",
		"Description: ^777777This skill is only enabled during",
		"WoE (Guild War). The Guildmaster can summon",
		"all online members of his guild to his side.",
		"Once used, this skill cannot be cast again",
		"for 5 minutes.^000000"
	].join("\n");

	SkillDescription[SKID.GD_DEVELOPMENT] = [
		"Development",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777This skill enables a 50% chance",
		"of adding an extra point whenever an investment",
		"in the Guild's commercial growth is made.^000000"
	].join("\n");

	SkillDescription[SKID.GD_ITEMEMERGENCYCALL] = [
	].join("\n");

	SkillDescription[SKID.MH_SUMMON_LEGION] = [
		"Summon Legion",
		"Max Level: 5",
		"Description: ^777777Summon a group of bugs, and attack 1 target enemy.",
		"Availble for summoning more powerful group of bugs based on the skill level.^000000",
		"[Lv 1]: ^777777HORNET Summon / duration 20 Second^000000",
		"[Lv 2]: ^777777GIANT_HONET Summon / duration 30 Second^000000",
		"[Lv 3]: ^777777GIANT_HONET Summon / duration 40 Second^000000",
		"[Lv 4]: ^777777LUCIOLA_VESPA Summon / duration 50 Second^000000",
		"[Lv 5]: ^777777LUCIOLA_VESPA Summon / duration 60 Second^000000"
	].join("\n");

	SkillDescription[SKID.MH_NEEDLE_OF_PARALYZE] = [
		"Needle Of Paralyze",
		"Max Level: 5",
		"Description: ^777777Give paralyze curse to the target enemy along with poison property damage.",
		"Paralyzed enemy cannot move with delay of casting time and decrease of Defense.",
		"Paralyzing duration can be reduced based on target's VIT LUK rate.^000000",
		"[Lv 1]: ^777777Physical ATK 800% / Paralyze Rate 45%^000000",
		"[Lv 2]: ^777777Physical ATK 900% / Paralyze Rate 50%^000000",
		"[Lv 3]: ^777777Physical ATK 1000% / Paralyze Rate 55%^000000",
		"[Lv 4]: ^777777Physical ATK 1100% / Paralyze Rate 60%^000000",
		"[Lv 5]: ^777777Physical ATK 1200% / Paralyze Rate 65%^000000"
	].join("\n");

	SkillDescription[SKID.MH_POISON_MIST] = [
		"Poison Mist",
		"Max Level: 5",
		"Description: ^777777Spread poison mist to certain Range of map, and give Blind curse and constant poison property damage to",
		"enemies inside the Range. Cannot install more than 1 mist on the ground.^000000",
		"[Lv 1]: ^777777Blind Rate 20 % / duration 12 Second^000000",
		"[Lv 2]: ^777777Blind Rate 30 % / duration 14 Second^000000",
		"[Lv 3]: ^777777Blind Rate 40 % / duration 16 Second^000000",
		"[Lv 4]: ^777777Blind Rate 50 % / duration 18 Second^000000",
		"[Lv 5]: ^777777Blind Rate 60% / duration 20 Second^000000"
	].join("\n");

	SkillDescription[SKID.MH_PAIN_KILLER] = [
		"Pain Killer",
		"Max Level: 5",
		"Description: ^777777Inject paralyzing poison to 1 selected target, reduce its delay from the damage and actual damage itself.",
		"But, there will attack speed decreasing as a side effect.^000000",
		"[Lv 1]: ^777777duration 20 Second^000000",
		"[Lv 2]: ^777777duration 30 Second^000000",
		"[Lv 3]: ^777777duration 40 Second^000000",
		"[Lv 4]: ^777777duration 50 Second^000000",
		"[Lv 5]: ^777777duration 60 Second^000000"
	].join("\n");

	SkillDescription[SKID.MH_LIGHT_OF_REGENE] = [
		"Light Of Regenerate",
		"Max Level: 5",
		"Description: ^777777Homunculus spells ligt of regeneration effect to the user, sacrifice itself to resurrect the user automatically",
		"when the user dies during the duration. Intimacy between Homunculus and master reduces after skill Activation.",
		"When having other resurrection items, item Effect will be activated before this Effect.",
		"Resurrection recovering HP increase based on player's skill level.^000000",
		"[Lv 1]: ^777777duration 360 Second^000000",
		"[Lv 2]: ^777777duration 420 Second^000000",
		"[Lv 3]: ^777777duration 480 Second^000000",
		"[Lv 4]: ^777777duration 540 Second^000000",
		"[Lv 5]: ^777777duration 600 Second^000000"
	].join("\n");

	SkillDescription[SKID.MH_OVERED_BOOST] = [
		"Overed Boost",
		"Max Level: 5",
		"Description: ^777777Temporarily fixing Homunculus and master's Flee rate and Attack speed, ",
		"Defense decrease to 1/2. But, no other Flee Rate or Attack speed changing effect is possible during this skill's duration.",
		"After duration Homumculus' hungry rate and master's SP decrease to half.^000000",
		"[Lv 1]: ^777777Flee Rate 340 / Attack Speed 181^000000",
		"[Lv 2]: ^777777Flee Rate 380 / Attack Speed 183^000000",
		"[Lv 3]: ^777777Flee Rate 420 / Attack Speed 185^000000",
		"[Lv 4]: ^777777Flee Rate 460 / Attack Speed 187^000000",
		"[Lv 5]: ^777777Flee Rate 500 / Attack Speed 189^000000"
	].join("\n");

	SkillDescription[SKID.MH_ERASER_CUTTER] = [
		"Eraser Cutter",
		"Max Level: 5",
		"Description: ^777777Create a sonic blade, attack 1 long range target enemy for many times.",
		"Available for Wind and Neutral damage, based on skill levels.^000000",
		"[Lv 1]: ^777777ATK 600%, Wind Property Magic^000000",
		"[Lv 2]: ^777777ATK 1000%, Neutral property Magic Damage^000000",
		"[Lv 3]: ^777777ATK 800%, Wind Property Magic^000000",
		"[Lv 4]: ^777777ATK 1200%, Neutral property Magic Damage^000000",
		"[Lv 5]: ^777777ATK 1000%, Wind Property Magic^000000"
	].join("\n");

	SkillDescription[SKID.MH_XENO_SLASHER] = [
		"Xeno Slasher",
		"Max Level: 5",
		"Description: ^777777Use in Eraser Cutter in wide range.",
		"Attribute changes based on skill levels, same as Eraser Cutter.",
		"Low rate curse : Bleeding to all damaged targets.^000000",
		"[Lv 1]: ^777777ATK 500% / Wind Property Magic / 5 x 5 Cell^000000",
		"[Lv 2]: ^777777ATK 700% / Neutral property Magic Damage / 5 x 5 Cell^000000",
		"[Lv 3]: ^777777ATK 600% / Wind Property Magic / 7 x 7 Cell^000000",
		"[Lv 4]: ^777777ATK 900% / Neutral property Magic Damage / 7 x 7 Cell^000000",
		"[Lv 5]: ^777777ATK 700% / Wind Property Magic / 9 x 9 Cell^000000"
	].join("\n");

	SkillDescription[SKID.MH_SILENT_BREEZE] = [
		"Silent Breeze",
		"Max Level: 5",
		"Description: ^777777Wind of silence. Give certain HP recovery to 1 target, Give immediate mute Effect to",
		"prevent target from casting any skills. And this mute Effect will be removing other certain curse effects.",
		"Success Rate doubled when casting to ally target.^000000",
		"[Lv 1]: ^777777duration 9 Second^000000",
		"[Lv 2]: ^777777duration 12 Second^000000",
		"[Lv 3]: ^777777duration 15 Second^000000",
		"[Lv 4]: ^777777duration 18 Second^000000",
		"[Lv 5]: ^777777duration 21 Second^000000"
	].join("\n");

	SkillDescription[SKID.MH_STAHL_HORN] = [
		"Stahl Horn",
		"Max Level: 5",
		"Description: ^777777Rush against 1 target, give Damage, ",
		"3 Cell knock back, and curse : Stun effect.^000000",
		"[Lv 1]: ^777777ATK 600% / Casting Range 5 Cell / Stun Rate 20%^000000",
		"[Lv 2]: ^777777ATK 700% / Casting Range 6 Cell / Stun Rate 24%^000000",
		"[Lv 3]: ^777777ATK 800% / Casting Range 7 Cell / Stun Rate 28%^000000",
		"[Lv 4]: ^777777ATK 900% / Casting Range 8 Cell / Stun Rate 32%^000000",
		"[Lv 5]: ^777777ATK 1000% / Casting Range 9 Cell / Stun Rate 36%^000000"
	].join("\n");

	SkillDescription[SKID.MH_GOLDENE_FERSE] = [
		"Goldene Ferse : Heel of Gold",
		"Max Level: 5",
		"Description: ^777777Homumculus' Flee Rate and Attack speed increase, and normal attack turns into Holy property damage",
		"for certain rate. During the effect duration [Stahl Horn] will be activated as a holy property attack when casting.",
		"This skill cannot be casted along with [Angriffs Modus] skill.^000000",
		"[Lv 1]: ^777777Flee Rate + 20, Attack Speed 10% Increase / 4% Rate Holy property damage Activation / duration 30 Second^000000",
		"[Lv 2]: ^777777Flee Rate + 30, Attack Speed 14% Increase / 6% Rate Holy property damage Activation / duration 45 Second^000000",
		"[Lv 3]: ^777777Flee Rate + 40, Attack Speed 18% Increase / 8% Rate Holy property damage Activation / duration 60 Second^000000",
		"[Lv 4]: ^777777Flee Rate + 50, Attack Speed 22% Increase / 10% Rate Holy property damage Activation / duration 75 Second^000000",
		"[Lv 5]: ^777777Flee Rate + 60, Attack Speed 26% Increase / 12% Rate Holy property damage Activation / duration 90 Second^000000"
	].join("\n");

	SkillDescription[SKID.MH_STEINWAND] = [
		"Stein Wand",
		"Max Level: 5",
		"Description: ^777777Immediately casts [Safety wall] under Homunculus and master.^000000",
		"[Lv 1]: ^777777duration 30 Second^000000",
		"[Lv 2]: ^777777duration 45 Second^000000",
		"[Lv 3]: ^777777duration 60 Second^000000",
		"[Lv 4]: ^777777duration 75 Second^000000",
		"[Lv 5]: ^777777duration 90 Second^000000"
	].join("\n");

	SkillDescription[SKID.MH_HEILIGE_STANGE] = [
		"Heilige Stange : Divine Spear",
		"Max Level: 5",
		"Description: ^777777Give Holy property magic damage to 1 target and all enemies around the range.^000000",
		"[Lv 1]: ^777777ATK 750%  / Holy property magic damage / 3 x 3 Cell^000000",
		"[Lv 2]: ^777777ATK 1000% / Holy property magic damage / 3 x 3 Cell^000000",
		"[Lv 3]: ^777777ATK 1250% / Holy property magic damage / 3 x 3 Cell^000000",
		"[Lv 4]: ^777777ATK 1500% / Holy property magic damage / 3 x 3 Cell^000000",
		"[Lv 5]: ^777777ATK 1750% / Holy property magic damage / 5 x 5 Cell^000000"
	].join("\n");

	SkillDescription[SKID.MH_ANGRIFFS_MODUS] = [
		"Angriffs Modus",
		"Max Level: 5",
		"Description: ^777777Increase Homunculus' ATK for certain period, Defense and Flee Rate decrease",
		"greatly. Also, this skill cannot be used with [Goldene Ferse] skill.^000000",
		"[Lv 1]: ^777777ATK +70, Defense -50  / Flee Rate -60 / duration 30 Second^000000",
		"[Lv 2]: ^777777ATK +90, Defense -70 / Flee Rate -80 / duration 45 Second^000000",
		"[Lv 3]: ^777777ATK +110, Defense -90 / Flee Rate - 100 / duration 60 Second^000000",
		"[Lv 4]: ^777777ATK +130, Defense -110 / Flee Rate -120 / duration 75 Second^000000",
		"[Lv 5]: ^777777ATK +150, Defense -130 / Flee Rate -140 / duration 90 Second^000000"
	].join("\n");

	SkillDescription[SKID.MH_STYLE_CHANGE] = [
		"Style Change",
		"Max Level: 1",
		"Description: ^777777Changes Homunculus' style from Fighter to Grappler, or from Grappler to Fighter.",
		"When attacking or getting damaged during Fighter status, gathers Spirit Sphere for certain rate.^000000"
	].join("\n");

	SkillDescription[SKID.MH_SONIC_CRAW] = [
		"Sonic Crow",
		"Max Level: 5",
		"Description: ^777777Only available in Fighter style. Activates high speed nail attack to 1 target enemy.",
		"Attack is possible as many as currently possessing number of Spirit Spheres. Skill does not activates when out of Spirit Sphere.^000000",
		"[Lv 1]: ^777777ATK 40%^000000",
		"[Lv 2]: ^777777ATK 80%^000000",
		"[Lv 3]: ^777777ATK 120%^000000",
		"[Lv 4]: ^777777ATK 160%^000000",
		"[Lv 5]: ^777777ATK 200%^000000"
	].join("\n");

	SkillDescription[SKID.MH_SILVERVEIN_RUSH] = [
		"Silvervein Rush",
		"Max Level: 5",
		"Description: ^777777Only available in Fighter style, and after Sonic Craw skill activation.",
		"Spends 1 Spirit Sphere when casting the skill. Give Curse : Stun for certain rate, along with damaging the target.^000000",
		"[Lv 1]: ^777777ATK 150% / Stun Rate 25%^000000",
		"[Lv 2]: ^777777ATK 300% / Stun Rate 30%^000000",
		"[Lv 3]: ^777777ATK 450% / Stun Rate 35%^000000",
		"[Lv 4]: ^777777ATK 600% / Stun Rate 40%^000000",
		"[Lv 5]: ^777777ATK 750% / Stun Rate 45%^000000"
	].join("\n");

	SkillDescription[SKID.MH_MIDNIGHT_FRENZY] = [
		"Midnight Frenzy",
		"Max Level: 5",
		"Description: ^777777Only available in Fighter style,  and after Silvervein Rush skill activation.",
		"Spends 2 Spirit Spheres when casting the skill. Give Curse : terrifying for certain rate, along with damaging the target.",
		"Terrifying rate increase based on the number of Spirit Spheres.",
		"Available for using Sonic Craw as a link skill activation.^000000",
		"[Lv 1]: ^777777ATK 300%^000000",
		"[Lv 2]: ^777777ATK 600%^000000",
		"[Lv 3]: ^777777ATK 900%^000000",
		"[Lv 4]: ^777777ATK 1200%^000000",
		"[Lv 5]: ^777777ATK 1500%^000000"
	].join("\n");

	SkillDescription[SKID.MH_TINDER_BREAKER] = [
		"Tinder Breaker",
		"Max Level: 5",
		"Description: ^777777Approach to the target and breaking its joint. After the skill, target and Homunculus",
		"cannot move from the ground, each other's Flee Rate becomes 0. Spends 1 Spirit Sphere",
		"when casting the skill. ATK and grapple time increase based on Homunculus' STR stat.^000000",
		"[Lv 1]: ^777777ATK 100%^000000",
		"[Lv 2]: ^777777ATK 200%^000000",
		"[Lv 3]: ^777777ATK 300%^000000",
		"[Lv 4]: ^777777ATK 400%^000000",
		"[Lv 5]: ^777777ATK 500%^000000"
	].join("\n");

	SkillDescription[SKID.MH_CBC] = [
		"C.B.C (Continual Break Combo)",
		"Max Level: 5",
		"Description: ^777777Only available as a linked skill after Tinder Breaker activation. Spends 2 Spirit Spheres when casting the skill.",
		"Constantly reduce target's SP, along with certain damage given. If target is monster, give additional damage instead of",
		"SP drain. Cannot move during skill duration, Flee Rate becomes 0.",
		"Duration increase based on Homunculus's STR.^000000",
		"[Lv 1]: ^777777Basic 400 Damage^000000",
		"[Lv 2]: ^777777Basic 800 Damage^000000",
		"[Lv 3]: ^777777Basic 1200 Damage^000000",
		"[Lv 4]: ^777777Basic 1600 Damage^000000",
		"[Lv 5]: ^777777Basic 2000 Damage^000000"
	].join("\n");

	SkillDescription[SKID.MH_EQC] = [
		"E.Q.C (Eternal Quick Combo)",
		"Max Level: 5",
		"Description: ^777777Only available as a linked skill after C,B,C activation. Spends 3 Spirit Spheres when casting the skill.",
		"Stun the target for 100% along with damage given, also reduce MHP, ATK, and Defense.",
		"After skill, Homunculus is free to move out, Flee Rate also becomes normal.",
		"This skill is not available for boss monsters.^000000",
		"[Lv 1]: ^777777MHP 2 % Reduce / ATK, Def 5 % Reduce^000000",
		"[Lv 2]: ^777777MHP 4 % Reduce / ATK, Def 10 % Reduce^000000",
		"[Lv 3]: ^777777MHP 6 % Reduce / ATK, Def 15 % Reduce^000000",
		"[Lv 4]: ^777777MHP 8 % Reduce / ATK, Def 20 % Reduce^000000",
		"[Lv 5]: ^777777MHP 10 % Reduce / ATK, Def 25 % Reduce^000000"
	].join("\n");

	SkillDescription[SKID.MH_MAGMA_FLOW] = [
		"Magma Flow",
		"Max Level: 5",
		"Description: ^777777Erupt magma for certain rate everytime Homunculus gets damaged.",
		"Give fire property damage to all enemies around the Homunculus.^000000",
		"[Lv 1]: ^777777ATK 100% /  Range 3 x 3  / Activation Rate 3 %^000000",
		"[Lv 2]: ^777777ATK 200% /  Range 3 x 3  / Activation Rate 6 %^000000",
		"[Lv 3]: ^777777ATK 300% /  Range 3 x 3  / Activation Rate 9 %^000000",
		"[Lv 4]: ^777777ATK 400% /  Range 5 x 5  / Activation Rate 12 %^000000",
		"[Lv 5]: ^777777ATK 500% /  Range 5 x 5  / Activation Rate 15 %^000000"
	].join("\n");

	SkillDescription[SKID.MH_GRANITIC_ARMOR] = [
		"Granitic Armor",
		"Max Level: 5",
		"Description: ^777777Create a granite based strong armor, temporarily increase Homunculus and master's defense",
		"for reducing damage. Consume certain amount of HP after the skill duration.",
		"Duration is 60 Seconds.^000000",
		"[Lv 1]: ^777777Damage 2% Reduce / HP 6% Loss^000000",
		"[Lv 2]: ^777777Damage 4% Reduce / HP 12% Loss^000000",
		"[Lv 3]: ^777777Damage 6% Reduce / HP 18% Loss^000000",
		"[Lv 4]: ^777777Damage 8% Reduce / HP 24% Loss^000000",
		"[Lv 5]: ^777777Damage 10% Reduce / HP 30% Loss^000000"
	].join("\n");

	SkillDescription[SKID.MH_LAVA_SLIDE] = [
		"Lava Slide",
		"Max Level: 5",
		"Description: ^777777Spray down the lava on to the ground, give damage to all enemies around the range. All targets",
		"effectRange will be getting curse : ignition for certain rate.^000000",
		"[Lv 1]: ^777777Chance to give Ignition 10%^000000",
		"[Lv 2]: ^777777Chance to give Ignition 20%^000000",
		"[Lv 3]: ^777777Chance to give Ignition 30%^000000",
		"[Lv 4]: ^777777Chance to give Ignition 40%^000000",
		"[Lv 5]: ^777777Chance to give Ignition 50%^000000"
	].join("\n");

	SkillDescription[SKID.MH_PYROCLASTIC] = [
		"Pyroclastic",
		"Max Level: 5",
		"Description: ^777777Temporarily changeds Homumculus' attack and master's wespon's attack property as fire property,",
		"Weapon's ATK Increase. Also when attacking, [Hammerfall] skill automatically activates based on certain rate.",
		"But, the weapon gets destructed after the skill duration. More ATK possible based on Homumculus' levels.^000000",
		"[Lv 1]: ^777777Duration 60 Second^000000",
		"[Lv 2]: ^777777Duration 90 Second^000000",
		"[Lv 3]: ^777777Duration 120 Second^000000",
		"[Lv 4]: ^777777Duration 150 Second^000000",
		"[Lv 5]: ^777777Duration 180 Second^000000"
	].join("\n");

	SkillDescription[SKID.MH_VOLCANIC_ASH] = [
		"Volcanic Ash",
		"Max Level: 5",
		"Description: ^777777Spray volcanic ashes to the ground, give curse : Volcanic Ash effect to all tragets in the skill Range.",
		"Volcanic ash effected target will loose half of Accuracy rate, and gain 50% of failing rate when casting skills.",
		"Also, there will be additional damage given when getting Fire property attack from ash effecting Range. 50% defense decreasing effect",
		"given for plant type monsters, 50% AtK and Flee Rate effect given for water type monsters.",
		"Volcanic ash effect's duration increase based on skill level. Skill is possible for casting 3 times to the ground.^000000",
		"[Lv 1]: ^777777Effect duration 8 Second^000000",
		"[Lv 2]: ^777777Effect duration 16 Second^000000",
		"[Lv 3]: ^777777Effect duration 24 Second^000000",
		"[Lv 4]: ^777777Effect duration 32 Second^000000",
		"[Lv 5]: ^777777Effect duration 40 Second^000000"
	].join("\n");

	SkillDescription[SKID.KO_YAMIKUMO] = [
		"Shadow Hiding",
		"Max Level: 1",
		"^CC3399Requirement: Shadow Slash 5^000000",
		"Description: ^777777Hide yourself with this skill.",
		"This is the same as the Rogue's Hide.",
		"Skill disables if SP is fully consumed",
		"or if skill is used again.",
		"Continuously consumes SP while active^000000"
	].join("\n");

	SkillDescription[SKID.KO_RIGHT] = [
		"Righthand Mastery",
		"Max Level: 5",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Recovers the fading right",
		"hand attack when both hands are equipped",
		"with a weapon.",
		"Attack increases more than at level 4",
		"and 5 compared to when using a weapon",
		"with one hand.^000000",
		"[LV 1]: ^777777ATK 80%^000000",
		"[LV 2]: ^777777ATK 90%^000000",
		"[LV 3]: ^777777ATK 100%^000000",
		"[LV 4]: ^777777ATK 110%^000000",
		"[LV 5]: ^777777ATK 120%^000000"
	].join("\n");

	SkillDescription[SKID.KO_LEFT] = [
		"Lefthand Mastery",
		"Max Level: 5",
		"Skill Form: ^6666ccPassive^000000",
		"Description: ^777777Recovers the fading left hand attack when both hands are equipped with a weapon.^000000",
		"[LV 1]: ^777777ATK 60%^000000",
		"[LV 2]: ^777777ATK 70%^000000",
		"[LV 3]: ^777777ATK 80%^000000",
		"[LV 4]: ^777777ATK 90%^000000",
		"[LV 5]: ^777777ATK 100%^000000"
	].join("\n");

	SkillDescription[SKID.KO_JYUMONJIKIRI] = [
		"Cross Slash",
		"Max Level: 5",
		"^CC3399Requirement: Shadow Hiding 1^000000",
		"Description: ^777777Combination skill of Kagerou and",
		"Oboro. Enemy with cross impact damage will fall",
		"into a <cross wound> state for about 3 seconds.",
		"Attacking an enemy with a cross wound again",
		"with a cross impact will inflict more powerful",
		"damage.",
		"The higher the Base level of the caster,",
		"the more damage inflicted.^000000",
		"[LV 1]: ^777777ATK 150% / Range 3 cells^000000",
		"[LV 2]: ^777777ATK 300% / Range 4 cells^000000",
		"[LV 3]: ^777777ATK 450% / Range 5 cells^000000",
		"[LV 4]: ^777777ATK 600% / Range 6 cells^000000",
		"[LV 5]: ^777777ATK 750% / Range 7 cells^000000"
	].join("\n");

	SkillDescription[SKID.KO_SETSUDAN] = [
		"Soul Cutter",
		"Max Level: 5",
		"^CC3399Requirement: Cross 2^000000",
		"Description: ^777777Additional damage is inflicted if the",
		"target attacked has the Soul Linker Spirit buff.",
		"Forcibly cancels the Spirit skill. The higher the",
		"Spirit skill, the more damage is inflicted.^000000",
		"[LV 1]: ^777777ATK 100%^000000",
		"[LV 2]: ^777777ATK 200%^000000",
		"[LV 3]: ^777777ATK 300%^000000",
		"[LV 4]: ^777777ATK 400%^000000",
		"[LV 5]: ^777777ATK 500%^000000"
	].join("\n");

	SkillDescription[SKID.KO_BAKURETSU] = [
		"Kunai Explosion",
		"Max Level: 5",
		"^CC3399Requirement: Throw Kunai 5^000000",
		"Description: ^777777Throw an explosive Kunai and inflict damage to all enemies within the area of effect.",
		"Consumes 1 Explosive Kunai.",
		"Consumes any Explosive Kunai in your",
		"item inventory.",
		"(No Applicable Job for Kunai Explosion)^000000",
		"[LV 1]: ^777777Range 7 cells / AOE 3 x 3 cells^000000",
		"[LV 2]: ^777777Range 8 cells / AOE 3 x 3 cells^000000",
		"[LV 3]: ^777777Range 9 cells  / AOE 3 x 3 cells^000000",
		"[LV 4]: ^777777Range 10 cells / AOE 3 x 3 cells^000000",
		"[LV 5]: ^777777Range 11 cells / AOE 3 x 3 cells^000000"
	].join("\n");

	SkillDescription[SKID.KO_HAPPOKUNAI] = [
		"Kunai Splash",
		"Max Level: 5",
		"^CC3399Requirement: Kunai Explosion 1^000000",
		"Description: ^777777Inflict damage with a Kunai to all",
		"enemies within a radius around you.",
		"Using this skill will consume 8 equipped Kunai.^000000",
		"[LV 1]: ^777777Range 9 x 9 cells^000000",
		"[LV 2]: ^777777Range 9 x 9 cells^000000",
		"[LV 3]: ^777777Range 9 x 9 cells^000000",
		"[LV 4]: ^777777Range 9 x 9 cells^000000",
		"[LV 5]: ^777777Range 11 x 11 cells^000000"
	].join("\n");

	SkillDescription[SKID.KO_MUCHANAGE] = [
		"Rapid Throw",
		"Max Level: 10",
		"^CC3399Requirement: Makibishi 3^000000",
		"Description:  ^777777Powerup version of the Ninja skill",
		"[Throw Coins] Throw up to 100,000 Zeny that",
		"has a chance to inflict random slash damage",
		"that ignores all enemy defense within a",
		"certain range.",
		"Only half of the damage is inflicted to",
		"Boss monsters.^000000",
		"[LV 1]: ^77777710,000 zeny Consumption / 5,000 ~ 10,000 Random Damage^000000",
		"[LV 2]: ^77777720,000 zeny Consumption / 10,000 ~ 20,000 Random Damage^000000",
		"[LV 3]: ^77777730,000 zeny Consumption / 15,000 ~ 30,000 Random Damage^000000",
		"[LV 4]: ^77777740,000 zeny Consumption / 20,000 ~ 40,000 Random Damage^000000",
		"[LV 5]: ^77777750,000 zeny Consumption / 25,000 ~ 50,000 Random Damage^000000",
		"[LV 6]: ^77777760,000 zeny Consumption / 30,000 ~ 60,000 Random Damage^000000",
		"[LV 7]: ^77777770,000 zeny Consumption / 35,000 ~ 70,000 Random Damage^000000",
		"[LV 8]: ^77777780,000 zeny Consumption / 40,000 ~ 80,000 Random Damage^000000",
		"[LV 9]: ^77777790,000 zeny Consumption / 45,000 ~ 90,000 Random Damage^000000",
		"[LV 10]: ^777777100,000 zeny Consumption / 50,000 ~ 100,000 Random Damage^000000"
	].join("\n");

	SkillDescription[SKID.KO_HUUMARANKA] = [
		"Swirling Petal",
		"Max Level: 5",
		"^CC3399Requirement: Throw Huuma Shuriken 5^000000",
		"Description: ^777777Throw Shuriken and inflict damage",
		"to all enemies within 7 x 7 cells range.",
		"The higher [Ninja skill: Throw Huuma Shuriken]",
		"level and DEX / AGI of the caster, the more attack",
		"can take place.",
		"Must be equipped with a Shuriken.^000000",
		"[LV 1]: ^777777ATK 150%, Range 9 cells^000000",
		"[LV 2]: ^777777ATK 300%, Range 10 cells^000000",
		"[LV 3]: ^777777ATK 450%, Range 11 cells^000000",
		"[LV 4]: ^777777ATK 600%, Range 12 cells^000000",
		"[LV 5]: ^777777ATK 750%, Range 13 cells^000000"
	].join("\n");

	SkillDescription[SKID.KO_MAKIBISHI] = [
		"Makibishi",
		"Max Level: 5",
		"^CC3399Requirement: Throw Coins 1^000000",
		"Description: ^777777Spread out caltrops for enemies to",
		"step on and become immobilized or stunned.",
		"The higher the skill level, the more you can",
		"spread on the ground.^000000",
		"[LV 1]: ^777777Consumes 3 Makibishi/Caltrop^000000",
		"[LV 2]: ^777777Consumes 4 Makibishi/Caltrop^000000",
		"[LV 3]: ^777777Consumes 5 Makibishi/Caltrop^000000",
		"[LV 4]: ^777777Consumes 6 Makibishi/Caltrop^000000",
		"[LV 5]: ^777777Consumes 7 Makibishi/Caltrop^000000"
	].join("\n");

	SkillDescription[SKID.KO_MEIKYOUSISUI] = [
		"Pure Soul",
		"Max Level: 5",
		"^CC3399Requirement: Ninja Mastery 10^000000",
		"Description: ^777777Focus your mind for 10 seconds",
		"to recover HP and SP quickly.",
		"You are Immobilized while using this skill.",
		"May not receive damage at a certain rate when",
		"attacked in Pure Soul state.^000000",
		"[LV 1]: ^777777Recovers 2% HP/1% SP per second^000000",
		"[LV 2]: ^777777Recovers 4% HP/2% SP per second^000000",
		"[LV 3]: ^777777Recovers 6% HP/3% SP per second^000000",
		"[LV 4]: ^777777Recovers 8% HP/4% SP per second^000000",
		"[LV 5]: ^777777Recovers 10% HP/5% SP per second^000000"
	].join("\n");

	SkillDescription[SKID.KO_ZANZOU] = [
		"Illusion - Shadow",
		"Max Level: 5",
		"^CC3399Requirement: Cicada Skin Shed 1^000000",
		"Description: ^777777Creates a Shinobi clone.",
		"The clone has HP and will disappear once",
		"HP is consumed or the time expires.^000000",
		"[LV 1]: ^777777Afterimage HP 6000^000000",
		"[LV 2]: ^777777Afterimage HP 9000^000000",
		"[LV 3]: ^777777Afterimage HP 12000^000000",
		"[LV 4]: ^777777Afterimage HP 15000^000000",
		"[LV 5]: ^777777Afterimage HP 18000^000000"
	].join("\n");

	SkillDescription[SKID.KO_KYOUGAKU] = [
		"Illusion - Shock",
		"Max Level: 5",
		"^CC3399Requirement: Illusion - Bewitch 2^000000",
		"Description: ^777777Cast an illusion to a target to reduce",
		"all stats of the target and transform the target into",
		"a monster.",
		"Targets under this effect cannot change or",
		"remove equipped items.",
		"This effect does not apply to allies and monsters.",
		"Can only be used during WoE.^000000",
		"[LV 1]: ^777777All Stats 2 ~ 3 Reduction^000000",
		"[LV 2]: ^777777All Stats 4 ~ 6 Reduction^000000",
		"[LV 3]: ^777777All Stats 6 ~ 9 Reduction^000000",
		"[LV 4]: ^777777All Stats 8 ~ 12 Reduction^000000",
		"[LV 5]: ^777777All Stats 10 ~ 15 Reduction^000000"
	].join("\n");

	SkillDescription[SKID.KO_JYUSATSU] = [
		"Illusion - Death",
		"Max Level: 5",
		"^CC3399Requirement: Illusion - Shock 3^000000",
		"Description: ^777777Cast an illusion to a target to reduce",
		"HP and all stats of the target and put a curse on",
		"the target.",
		"Also puts the target into a [Coma] state with a low",
		"probability. Only applies to players with lower",
		"base levels and does not apply to monsters.^000000"
	].join("\n");

	SkillDescription[SKID.KO_GENWAKU] = [
		"Illusion - Bewitch",
		"Max Level: 5",
		"^CC3399Requirement: Cicada Skin Shed 1^000000",
		"Description: ^777777Has a chance to switch locations",
		"between the target and yourself.",
		"Has a chance to inflict both the caster and",
		"target with the [Confusion] state at a certain rate.^000000"
	].join("\n");

	SkillDescription[SKID.KO_IZAYOI] = [
		"16th Night",
		"Max Level: 5",
		"^CC3399Requirement: Ninja Mastery 5^000000",
		"Description: ^777777All fixed casting of any ninja skills",
		"will disappear when this skill is used.",
		"Variable casting time will reduce to half,",
		"while MATK increases a certain amount.^000000"
	].join("\n");

	SkillDescription[SKID.KO_KAHU_ENTEN] = [
		"Fire Charm",
		"Max Level: 1",
		"Description: ^777777Summons a Fire Spirit using a",
		"Fire Charm to increase attack of Fire Property",
		"skills.",
		"Can summon up to 10 spirits and your weapon",
		"changes to Fire Property once you succeed",
		"in summoning 10 spirits.",
		"Using this skill will consume 1 Fire Charm.^000000"
	].join("\n");

	SkillDescription[SKID.KO_HYOUHU_HUBUKI] = [
		"Ice Charm",
		"Max Level: 1",
		"Description: ^777777Summons an Ice Spirit using an",
		"Ice Charm to increase attack of Water Property",
		"skills.",
		"Can summon up to 10 spirits and your weapon",
		"changes to Water Property once you succeed",
		"in summoning 10 spirits.",
		"Using this skill will consume 1 Ice Charm.^000000"
	].join("\n");

	SkillDescription[SKID.KO_KAZEHU_SEIRAN] = [
		"Wind Charm",
		"Max Level: 1",
		"Description: ^777777Summons a Wind Spirit using a",
		"Wind Charm to increase attack of Wind Property",
		"skills.",
		"Can summon up to 10 spirits and your weapon",
		"changes to Wind Property once you succeed",
		"in summoning 10 spirits.",
		"Using this skill will consume 1 Wind Charm.^000000"
	].join("\n");

	SkillDescription[SKID.KO_DOHU_KOUKAI] = [
		"Earth Charm",
		"Max Level: 1",
		"Description: ^777777Summons an Earth Spirit using an",
		"Earth Charm to increase the caster's attack",
		"and defense.",
		"Can summon up to 10 spirits and your weapon",
		"changes to Earth Property once you succeed",
		"in summoning 10 spirits.",
		"Using this skill will consume 1 Earth Charm.^000000"
	].join("\n");

	SkillDescription[SKID.KO_KAIHOU] = [
		"Release Ninja Spell",
		"Max Level: 1",
		"^CC3399Requirement: Fire Charm 1, Ice Charm 1,",
		"Wind Charm 1, Earth Charm 1^000000",
		"Description: ^777777Releases the spiritual energy from",
		"the target to inflict damage.",
		"Damage Property depends on the property",
		"of the summoned spirit Charm.^000000"
	].join("\n");

	SkillDescription[SKID.KO_ZENKAI] = [
		"Cast Ninja Spell",
		"Max Level: 1",
		"^CC3399Requirement: Release Ninja Spell 1, 16th Night 1^000000",
		"Description: ^777777Transfer your spiritual energy to the",
		"earth to create a portal that generates various",
		"effects.",
		"^FF0000Fire Property Spirit^777777 - Casts Combust state to all",
		"enemies within range. Increases attack if",
		"equipped weapon is Fire Property.^000000",
		"^0000FFWater Property Spirit - Casts either Freezing/",
		"Deep Freeze/Congeal state to all enemies",
		"within range. Increases attack if equipped",
		"weapon is Water Property.^000000",
		"^008800Wind Property Spirit - Casts either Silence/",
		"Sleep/Deep Sleep state to all enemies",
		"within range. Increases attack if equipped",
		"weapon is Wind Property.^000000",
		"^FD6202Earth Property Spirit - Casts either",
		"Stone Curse/Poison state to all enemies",
		"within range. Increases attack if",
		"equipped weapon is Earth Property.^000000"
	].join("\n");

	SkillDescription[SKID.KG_KAGEHUMI] = [
		"Shadow Trampling",
		"Max Level: 5",
		"^CC3399Requirement: Illusion - Afterimage 1^000000",
		"Description: ^777777Stop targets using specific hiding",
		"skills temporarily and forcibly cancel the skill.",
		"Can only be used in PVP and WoE.^000000",
		"[LV 1]: ^777777AoE 5 x 5 cells^000000",
		"[LV 2]: ^777777AoE 7 x 7 cells^000000",
		"[LV 3]: ^777777AoE 9 x 9 cells^000000",
		"[LV 4]: ^777777AoE 11 x 11 cells^000000",
		"[LV 5]: ^777777AoE 13 x 13 cells^000000"
	].join("\n");

	SkillDescription[SKID.KG_KYOMU] = [
		"Empty Shadow",
		"Max Level: 5",
		"^CC3399Requirement: Shadow Trampling 2^000000",
		"Description: ^777777Dispels the reflection effect from a",
		"target for a period of time.",
		"Skill attempts may fail while under the",
		"Empty Shadow effect. Using this skill will",
		"consume 1 Shadow Orb.^000000",
		"[LV 1]: ^777777Duration 10 seconds^000000",
		"[LV 2]: ^777777Duration 15 seconds^000000",
		"[LV 3]: ^777777Duration 20 seconds^000000",
		"[LV 4]: ^777777Duration 25 seconds^000000",
		"[LV 5]: ^777777Duration 30 seconds^000000"
	].join("\n");

	SkillDescription[SKID.KG_KAGEMUSYA] = [
		"Shadow Warrior",
		"Max Level: 5",
		"^CC3399Requirement: Empty Shadow 3^000000",
		"Description: ^777777Imbues [Skill: Double Attack]",
		"to a target for a period of time.",
		"Consumes 1 SP each second while under effect.",
		"Using this skill will consume 1 Shadow Orb.^000000",
		"[LV 1]: ^777777Duration 60 seconds^000000",
		"[LV 2]: ^777777Duration 90 seconds^000000",
		"[LV 3]: ^777777Duration 120 seconds^000000",
		"[LV 4]: ^777777Duration 150 seconds^000000",
		"[LV 5]: ^777777Duration 180 seconds^000000"
	].join("\n");

	SkillDescription[SKID.OB_ZANGETSU] = [
		"Distorted Crescent",
		"Max Level: 5",
		"^CC3399Requirement: Illusion - Bewitch 1^000000",
		"Description: ^777777Changes the target's MATK or ATK",
		"according to the target's current HP and SP.",
		"[LV 1]: ^777777Duration 60 seconds^000000",
		"[LV 2]: ^777777Duration 75 seconds^000000",
		"[LV 3]: ^777777Duration 90 seconds^000000",
		"[LV 4]: ^777777Duration 105 seconds^000000",
		"[LV 5]: ^777777Duration 120 seconds^000000"
	].join("\n");

	SkillDescription[SKID.OB_AKAITSUKI] = [
		"Ominous Moonlight",
		"Max Level: 5",
		"^CC3399Requirement: Distorted Crescent 2^000000",
		"Description: ^777777When a target under this skill effect",
		"receives specific HP recovery skills damage,",
		"will be inflicted instead of recovering HP.",
		"This skill cannot be used on players outside of",
		"PVP areas and does not apply to allies and",
		"Boss monsters.^000000",
		"[LV 1]: ^777777Duration 10 seconds^000000",
		"[LV 2]: ^777777Duration 15 seconds^000000",
		"[LV 3]: ^777777Duration 20 seconds^000000",
		"[LV 4]: ^777777Duration 25 seconds^000000",
		"[LV 5]: ^777777Duration 30 seconds^000000"
	].join("\n");

	SkillDescription[SKID.OB_OBOROGENSOU] = [
		"Moonlight Fantasy",
		"Max Level: 5",
		"^CC3399Requirement: Ominous Moonlight 3^000000",
		"Description: ^777777Either randomly increases or",
		"reduces HP and SP depending on the",
		"target's current HP and SP.",
		"Targets under the Moonlight Fantasy will",
		"spread the damage they receive to",
		"surrounding targets.",
		"This skill does not apply to monsters.^000000",
		"[LV 1]: ^777777Duration 10 seconds^000000",
		"[LV 2]: ^777777Duration 15 seconds^000000",
		"[LV 3]: ^777777Duration 20 seconds^000000",
		"[LV 4]: ^777777Duration 25 seconds^000000",
		"[LV 5]: ^777777Duration 30 seconds^000000"
	].join("\n");

	SkillDescription[SKID.ECLAGE_RECALL] = [
		"Return to Eclage",
		"Effect: ^777777Teleport to Eclage.",
		"3 seconds of fixed casting.",
		"5 minute reuse delay.^000000"
	].join("\n");

	SkillDescription[SKID.ECL_SNOWFLIP] = [
		"Snow Flip",
		"^777777´«ĽŰŔĚĂł·ł ÇĎľé°í ¸¸Áö¸é ĽŐŔĚ ˝Ă¸± µíÇŃ ˛ÉŔŮ. µż»óżˇ °É¸±Áöµµ ¸đ¸Ł´Ď ÁÖŔÇ.^000000",
		"^777777Recover from burning, bleeding, deep sleep and sleep.^000000"
	].join("\n");

	SkillDescription[SKID.ECL_PEONYMAMY] = [
		"Peony Mommy",
		"^777777ľö¸¶ Ç°Ăł·ł µű˝şÇŃ żÂµµ¸¦ °ˇÁř şĐČ«»öŔÇ µµĹčÇŃ ˛ÉŔŮ.^000000",
		"^777777Recover from Frozen, Freezing and Crystallization.^000000"
	].join("\n");

	SkillDescription[SKID.ECL_SADAGUI] = [
		"Slapping Herb",
		"^777777łż»ő¸¦ ÄÚ·Î µéŔĚ¸¶˝Ă¸é ¸Ó¸®¸¦ ¶§¸®´Â µíÇŃ °­·ÄÇŃ ÇâŔ» °ˇÁř ÇăşęŔŮ. ¶§¶§·Î şÎŔŰżëµµ ŔÖ´Â µí.^000000",
		"^777777Recover from stun, fear, confuse and Hallucination.^000000"
	].join("\n");

	SkillDescription[SKID.ECL_SEQUOIADUST] = [
		"Yggdrasil Dust",
		"^777777»ý¸íŔÇ łŞą«ŔÇ ŔŮżˇ şŮľîŔÖ´ř ¸ŐÁö şÎ˝ş·Ż±âÁö¸¸ ¸đľĆĽ­ »çżëÇßŔ» ¶§´Â Á¤Č­ ´É·ÂŔ» ąßČÖÇŃ´Ů.^000000",
		"^777777Recover from stone curse, darkness, curse, poison and decrease agility.^000000"
	].join("\n");

	SkillDescription[SKID.GC_DARKCROW] = [
		"Dark Claw",
		"Max Level: ^7777775^000000",
		"^CC3399Requirement: Dark Illusion 5^000000",
		"Skill Form: ^FF0000Active / Damage - Special^000000",
		"Description: ^777777Give an enemy a painful wound for",
		"5 seconds, causing short ranged attacks to",
		"deal physical damage to the target.^000000",
		"[Lv 1]: ^777777100% ATK, Damage increase +30%^000000",
		"[Lv 2]: ^777777200% ATK, Damage increase +60%^000000",
		"[Lv 3]: ^777777300% ATK, Damage increase +90%^000000",
		"[Lv 4]: ^777777400% ATK, Damage increase +120%^000000",
		"[Lv 5]: ^777777500% ATK, Damage increase +150%^000000"
	].join("\n");

	SkillDescription[SKID.RA_UNLIMIT] = [
		"Unlimit",
		"Max Level: 5",
		"^CC3399Requirement: Fear Breeze 5^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Tap into the power of the god of hunting and archery to increase the explosive power of ranged attacks for a short time.^000000",
		"[Lv 1]: ^777777Ranged physical damage +50%^000000",
		"[Lv 2]: ^777777Ranged physical damage +100%^000000",
		"[Lv 3]: ^777777Ranged physical damage +150%^000000",
		"[Lv 4]: ^777777Ranged physical damage +200%^000000",
		"[Lv 5]: ^777777Ranged physical damage +250%^000000"
	].join("\n");

	SkillDescription[SKID.LG_KINGS_GRACE] = [
		"King's Grace",
		"Max Level: 5",
		"^CC3399Requirement: Reflect Damage 5^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Bestow royal blessings to the caster and allies around the caster to recover HP and protect against status effects.^000000",
		"^777777Remove the following status: Poison, Blind, Frozen, Stone Curse, Stun, Sleep, Bleeding, Curse,^000000",
		"^777777Chaos, Hallucination, Silence, Burning, Crystalize, Freezing, Sleep, Fear, Mandragora Howling.^000000",
		"[Lv 1]: ^777777Recover 4% of HP every 5 seconds^000000",
		"[Lv 2]: ^777777Recover 5% of HP every 5 seconds^000000",
		"[Lv 3]: ^777777Recover 6% of HP every 5 seconds^000000",
		"[Lv 4]: ^777777Recover 7% of HP every 5 seconds^000000",
		"[Lv 5]: ^777777Recover 8% of HP every 5 seconds^000000"
	].join("\n");

	SkillDescription[SKID.RK_DRAGONBREATH_WATER] = [
		"Dragon Breath Water",
		"Max Level: 10",
		"^CC3399Requirement: Dragon Training 2^000000",
		"Skill Form: ^FF0000Range Attack^000000",
		"Description: ^777777Deal ice-elemental damage with",
		"your dragon's breath. which may cause",
		"^6996ADFreezing^777777 status to the enemy. The damage",
		"depends on the stats of the rider.^000000"
	].join("\n");

	SkillDescription[SKID.NC_MAGMA_ERUPTION] = [
		"Magma Eruption",
		"Max Level: 5",
		"^CC3399Requirement: Fire Earth Research 1^000000",
		"Skill Form: ^339900Active^000000",
		"Description: ^777777Cause Lava to erupt from the ground in the targeted cell for 5 seconds in a 7x7 area dealing damage and inflicting stun and burning status. You cannot create more than 3 eruptions at a time.^000000",
		"[Lv 1]: ^7777771600 fixed damage every seconds, 10% stun and burning chance^000000",
		"[Lv 2]: ^7777772000 fixed damage every seconds, 20% stun and burning chance^000000",
		"[Lv 3]: ^7777772400 fixed damage every seconds, 30% stun and burning chance^000000",
		"[Lv 4]: ^7777772800 fixed damage every seconds, 40% stun and burning chance^000000",
		"[Lv 5]: ^7777773200 fixed damage every seconds, 50% stun and burning chance^000000"
	].join("\n");

	SkillDescription[SKID.WM_FRIGG_SONG] = [
		"Frigg's Song",
		"Max Level: 5",
		"^CC3399Requirement: Lesson 2^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Requires a whip/instrument to cast. Raise the Max HP of nearby allies and recover their HP gradually for 60 seconds.^000000",
		"^777777Consume 1 ^008800Regrettable Tears^777777.^000000",
		"^777777If used in PvP or WoE, the skill only affects the caster and nearby party members.^000000",
		"[Lv 1]: ^7777777x7 AoE, MaxHP +5%, restore 100 HP/sec^000000",
		"[Lv 2]: ^7777779x9 AoE, MaxHP +10%, restore 120 HP/sec^000000",
		"[Lv 3]: ^77777711x11 AoE, MaxHP +15%, restore 140 HP/sec^000000",
		"[Lv 4]: ^77777713x13 AoE, MaxHP +20%, restore 160 HP/sec^000000",
		"[Lv 5]: ^77777715x15 AoE, MaxHP +25%, restore 180 HP/sec^000000"
	].join("\n");

	SkillDescription[SKID.SO_ELEMENTAL_SHIELD] = [
		"Elemental Shield",
		"Max Level: 5",
		"^CC3399Requirement: Elemental Control 3^000000",
		"Skill Form: ^339900Active / Support^000000",
		"Target:^777777Ground^000000",
		"Description: ^777777By expending summoned elemental's magic, sorcerer creates a magical barrier on the cells where the caster and party members are standing on.^000000",
		"^777777Magical barrier disapper once his life reaches 0 or when skill duration ends. Affect self and all party members within sorcerer's screen.^000000",
		"^777777The magical barrier only blocks melee physical damage and caster's summoned element disappears on use.^000000",
		"^777777Consumes 1 ^008800blue gemstone^000000"
	].join("\n");

	SkillDescription[SKID.SR_FLASHCOMBO] = [
		"Flash Combo",
		"Max Level: 5",
		"^CC3399Requirement: Dragon Combo 3, Tiger Cannon 1,",
		"Fallen Empire 3, Sky Net Blow 1^000000",
		"Skill Form: ^FF0000Active / Combo^000000",
		"Description: ^777777Activate 4 consecutive combo",
		"attacks : Dragon Combo, Fallen Empire,",
		"Tiger Cannon, Sky Net Blow in extremely",
		"fast succession. Each skill activates at",
		"caster's max learned skill level.^000000",
		"[Lv 1]: ^7777775 spirit spheres, ATK +40 for 4 sec^000000",
		"[Lv 2]: ^7777775 spirit spheres, ATK +60 for 4 sec^000000",
		"[Lv 3]: ^7777774 spirit spheres, ATK +80 for 4 sec^000000",
		"[Lv 4]: ^7777774 spirit spheres, ATK +100 for 4 sec^000000",
		"[Lv 5]: ^7777773 spirit spheres, ATK +120 for 4 sec^000000"
	].join("\n");

	SkillDescription[SKID.SC_ESCAPE] = [
		"Escape",
		"Max Level: 5",
		"^CC3399Requirement: Triangle Shot 2^000000",
		"Skill Form: ^339900Active / Support^000000",
		"Description: ^777777Caster immediately lays down",
		"a trap on the ground and backslides.",
		"Caster cannot backslide over dead cells/walls.",
		"Consumes 1 ^008800Special Alloy Trap^000000",
		"[Lv 1]: ^777777Backslide range 5 cells^000000",
		"[Lv 2]: ^777777Backslide range 6 cells^000000",
		"[Lv 3]: ^777777Backslide range 7 cells^000000",
		"[Lv 4]: ^777777Backslide range 8 cells^000000",
		"[Lv 5]: ^777777Backslide range 9 cells^000000"
	].join("\n");

	SkillDescription[SKID.AB_OFFERTORIUM] = [
		"Offertorium",
		"Max Level: 5",
		"^CC3399Requirement: Highness Heal 2^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Increases the efficiency of Heal,",
		"Sanctuary, Highness Heal and Coluceo Heal.",
		"The skill cannot be used in conjunction",
		"with Manigificat.",
		"^000000Cure the following effect:",
		"^702180Curse, Poison, Hallucination, Confusion,",
		"Bleeding, Burning, Freezing, Blind,",
		"Mandragora Howling ^000000and^702180 Guillotine Cross",
		"poison^000000 (except ^702180Oblivion Curse^000000).",
		"[Lv 1]: ^777777Heal Power x1.3, SP cost 220%^000000",
		"[Lv 2]: ^777777Heal Power x1.6, SP cost 240%^000000",
		"[Lv 3]: ^777777Heal Power x1.9, SP cost 260%^000000",
		"[Lv 4]: ^777777Heal Power x2.2, SP cost 270%^000000",
		"[Lv 5]: ^777777Heal Power x2.5, SP cost 300%^000000"
	].join("\n");

	SkillDescription[SKID.WL_TELEKINESIS_INTENSE] = [
		"Telekinesis Intense",
		"Max Level: 5",
		"^CC3399Requirement: Soul Expansion 5^000000",
		"Skill Form: ^339900Active / Buff^000000",
		"Description: ^777777Ghost magic enters caster's",
		"circulatory system, increasing Ghost magic",
		"damage and reducing cast time and SP cost",
		"of spells for 1 Minute.",
		"This skill cannot be removed by ^008800Clearance^777777",
		"or ^008800Dispell^777777.^000000",
		"[Lv 1]: ^777777Ghost MATK x1.4, -10% variable cast time, -10% Ghost Spell SP Cost^000000",
		"[Lv 2]: ^777777Ghost MATK x1.8, -20% variable cast time, -20% Ghost Spell SP Cost^000000",
		"[Lv 3]: ^777777Ghost MATK x2.2, -30% variable cast time, -30% Ghost Spell SP Cost^000000",
		"[Lv 4]: ^777777Ghost MATK x2.6, -40% variable cast time, -40% Ghost Spell SP Cost^000000",
		"[Lv 5]: ^777777Ghost MATK x3, -50% variable cast time, -50% Ghost Spell SP Cost^000000"
	].join("\n");

	SkillDescription[SKID.ALL_FULL_THROTTLE] = [
		"Full Throttle",
		"Max Level: 5",
		"Description: ^777777Exceed the limits of the body by",
		"sacrificing your own vitality to stregthen",
		"yourself for a short time. You will become",
		"horribly exhausted after the skill's duration.",
		"Fully restores HP when casted and increases",
		"movement speed for the skill's duration.",
		"All stats +20%.",
		"After the skill duration ends, you will be",
		"inflicted with 'Rebound' status. During",
		"'rebound status', your movement speed is",
		"lowered and your natural HP/SP recovery is",
		"disabled.",
		"Cannot be removed by ^008800Dispell^777777.^000000",
		"[Lv 1]: ^777777Duration 10 sec, 6% HP|SP drained/sec^000000",
		"[Lv 2]: ^777777Duration 15 sec, 4% HP|SP drained/sec^000000",
		"[Lv 3]: ^777777Duration 20 sec, 3% HP|SP drained/sec^000000",
		"[Lv 4]: ^777777Duration 25 sec, 2% HP|SP drained/sec^000000",
		"[Lv 5]: ^777777Duration 30 sec, 1% HP|SP drained/sec^000000"
	].join("\n");

	SkillDescription[SKID.GN_ILLUSIONDOPING] = [
		"Illusion Doping",
		"Max Level: 5",
		"^CC3399Requirement: Special Pharmacy 1^000000",
		"Skill Form: ^777777Special / Debuff^000000",
		"Description: ^777777Throw a concentrated alcohol",
		"mix to cause hallucinations and decreased",
		"accuracy with a high probability.",
		"Consumes 1 alcohol.^000000",
		"[Lv 1]: ^777777100% damage, 9x9 splash^000000",
		"[Lv 2]: ^777777100% damage, 11x11 splash^000000",
		"[Lv 3]: ^777777100% damage, 13x13 splash^000000",
		"[Lv 4]: ^777777100% damage, 15x15 splash^000000",
		"[Lv 5]: ^777777100% damage, Full screen splash^000000",
	].join("\n");

	SkillDescription[SKID.GM_ITEM_ATKMAX] = [
		"Max Physical item attack rate",
		"Max Level: 1",
		"Description: ^777777Max Physical item attack rate^000000"
	].join("\n");

	SkillDescription[SKID.GM_ITEM_ATKMIN] = [
		"Minimize Physical item attack rate",
		"Max Level: 1",
		"Description: ^777777Minimize Physical item attack rate^000000"
	].join("\n");

	SkillDescription[SKID.GM_ITEM_MATKMAX] = [
		"Max Magic item attack rate",
		"Max Level: 1",
		"Description: ^777777Max Magic item attack rate^000000"
	].join("\n");

	SkillDescription[SKID.GM_ITEM_MATKMIN] = [
		"Minimize Magic item attack rate",
		"Max Level: 1",
		"Description: ^777777Minimize Magic item attack rate^000000"
	].join("\n");

	SkillDescription[SKID.MER_INVINCIBLEOFF2] = [
		"Mind Blaster",
		"Max Level: 1",
		"Description: ^777777Disconnect the follers and Devil King's connection to invalidate the Blessing of Masin. Shooting range 2 cells^000000"
	].join("\n");

	SkillDescription[SKID.RL_D_TAIL] = [
		"Dragon Tail",
		"Max Level: 5",
		"^CC3399Requirement: Crimson Marker 1, Howling Mine 3^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Grenade Launcher exclusive skill. Launches missiles at all targets on the screen that's marked by your Crimson Marker.^000000",
		"^777777If there are more than 1 target afflicted with your Crimson Marker, the damage done will be split between the targets.^000000",
		"^777777If there is no target afflicted with your Crimson Marker, the skill will fail to activate.^000000",
		"^777777Consumes 1 Dragon Tail Missile.^000000",
		"[Lv 1]: ^777777Damage 3000 %^000000",
		"[Lv 2]: ^777777Damage 3500 %^000000",
		"[Lv 3]: ^777777Damage 4000 %^000000",
		"[Lv 4]: ^777777Damage 4500 %^000000",
		"[Lv 5]: ^777777Damage 5000 %^000000"
	].join("\n");

	SkillDescription[SKID.RL_R_TRIP] = [
		"Round Trip",
		"Max Level: 5",
		"^CC3399Requirement: Fire Rain 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Gatling Gun exclusive skill. Unleash a barrage of gunfire at all targets in range, dealing damage and knocking the affected targets.^000000",
		"^777777If the targets are knocked back into the wall, they will take additional damage.^000000",
		"^777777Caster's DEX affects the amount of initial and knockback damage.^000000",
		"^777777Consumes 5 Bullets.^000000",
		"[Lv 1]: ^777777AoE 7x7^000000",
		"[Lv 2]: ^777777AoE 7x7^000000",
		"[Lv 3]: ^777777AoE 9x9^000000",
		"[Lv 4]: ^777777AoE 11x11^000000",
		"[Lv 5]: ^777777AoE 13x13^000000"
	].join("\n");

	SkillDescription[SKID.RL_RICHS_COIN] = [
		"Rich's Coin",
		"Max Level: 1",
		"^CC3399Requirement: Coin Flip 5^000000",
		"Skill Form: ^339900Special^000000",
		"Description: ^777777Consume 100 zenies to generate 10 coins at a 50% chance.^000000",
		"^777777Once this skill is learned, failed Coin Flip casts will no longer remove the coin.^000000"
	].join("\n");

	SkillDescription[SKID.RL_MASS_SPIRAL] = [
		"Mass Spiral",
		"Max Level: 5",
		"^CC3399Requirement: Piercing Shot 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Rifle exclusive skill. Fires a piercing bullet that additional damage depending on the target's DEF.^000000",
		"^777777Inflicts Bleeding status on the target at a high chance.^000000",
		"^777777Consumes 1 Coin and 1 Full metal Jacket Bullet^000000",
		"[Lv 1]: ^777777Damage 200% + Additional damage depending on target's def^000000",
		"[Lv 2]: ^777777Damage 400% + Additional damage depending on target's def^000000",
		"[Lv 3]: ^777777Damage 600% + Additional damage depending on target's def^000000",
		"[Lv 4]: ^777777Damage 800% + Additional damage depending on target's def^000000",
		"[Lv 5]: ^777777Damage 1000% + Additional damage depending on target's def^000000"
	].join("\n");

	SkillDescription[SKID.RL_B_TRAP] = [
		"Bound Trap",
		"Max Level: 5",
		"^CC3399Requirement: Rebellion Basics^000000",
		"Skill Form: ^777777Ground^000000",
		"Description: ^777777Lay down a powerful movement impairing trap on the ground.^000000",
		"^777777All targets that enter the trap's area of effect will have their movement slowed significantly.^000000",
		"^777777Movement debuff duration is affected by the target's STR.^000000",
		"^777777Using Flicker skill on targets affected by Bind Trap will remove the trap and deal an additional damage to the targets.^000000",
		"^777777Maximum of 1 trap can be active at a time.^000000",
		"^777777Consumes 1 Coin and Special Alloy Trap.^000000",
		"[Lv 1]: ^777777Duration 10 seconds^000000",
		"[Lv 2]: ^777777Duration 11 seconds^000000",
		"[Lv 3]: ^777777Duration 12 seconds^000000",
		"[Lv 4]: ^777777Duration 13 seconds^000000",
		"[Lv 5]: ^777777Duration 14 seconds^000000"
	].join("\n");

	SkillDescription[SKID.RL_BANISHING_BUSTER] = [
		"Banishing Buster",
		"Max Level: 5",
		"^CC3399Requirement: Shatter Storm 1^000000",
		"Skill Form: ^FF0000Offensive / Special^000000",
		"Description: ^777777Shotgun exclusive skill. Deals damage to the target and enemies within 5x5 area of the target, removing a buff or debuff randomly.^000000",
		"^777777Caster's DEX affects the success rate of buff/debuff removal.^000000",
		"^777777Consumes 1 coin.^000000",
		"[Lv 1]: ^777777Removes 4 random Buff/ Debuff^000000",
		"[Lv 2]: ^777777Removes 6 random Buff/ Debuff^000000",
		"[Lv 3]: ^777777Removes 8 random Buff/ Debuff^000000",
		"[Lv 4]: ^777777Removes 10 random Buff/ Debuff^000000",
		"[Lv 5]: ^777777Removes 12 random Buff/ Debuff^000000"
	].join("\n");

	SkillDescription[SKID.RL_S_STORM] = [
		"Shatter Storm",
		"Max Level: 5",
		"^CC3399Requirement: Disarm 1 / Dust 1^000000",
		"Skill Form: ^FF0000Offensive / Special^000000",
		"Description: ^777777Shotgun exclusive skill. Deals damage to the target and enemies within 5x5 area of the target, destroying their equipped equipments randomly.^000000",
		"^777777Caster's DEX and skill level affects the success rate of equipment destruction.^000000",
		"^777777Target's AGI affects the success rate of equipment destruction.^000000",
		"^777777Indestructible or chemical protected equipments are not affected.^000000",
		"[Lv 1]: ^777777Destroys 2 random equipments^000000",
		"[Lv 2]: ^777777Destroys 2 random equipments^000000",
		"[Lv 3]: ^777777Destroys 3 random equipments^000000",
		"[Lv 4]: ^777777Destroys 4 random equipments^000000",
		"[Lv 5]: ^777777Destroys 5 random equipments^000000"
	].join("\n");

	SkillDescription[SKID.RL_SLUGSHOT] = [
		"Slug Shot",
		"Max Level: 5",
		"^CC3399Requirement: Banishing Buster 3^000000",
		"Skill Form: ^FF0000Offensive / Debuff^000000",
		"Description: ^777777Shotgun exclusive skill. Fire a special slug shot bullet at the target to deal damage.^000000",
		"^777777Heavier Bullet will increase the damage done.^000000",
		"^777777Accuracy drops if you are more than 3 cells away from the target.^000000",
		"^777777Players hit by this skill will be forced to sit. Monsters hit by this skill will be stunned.^000000",
		"^777777Consumes 1 coin.^000000",
		"[Lv 1]: ^777777Hit rate -10 for every 1 cell (after initial 3 cells)^000000",
		"[Lv 2]: ^777777Hit rate -9 for every 1 cell (after initial 3 cells)^000000",
		"[Lv 3]: ^777777Hit rate -8 for every 1 cell (after initial 3 cells)^000000",
		"[Lv 4]: ^777777Hit rate -7 for every 1 cell (after initial 3 cells)^000000",
		"[Lv 5]: ^777777Hit rate -6 for every 1 cell (after initial 3 cells)^000000"
	].join("\n");

	SkillDescription[SKID.RL_AM_BLAST] = [
		"Anti-Material Blast",
		"Max Level: 5",
		"^CC3399Requirement: Mass Spiral 1^000000",
		"Skill Form: ^FF0000Offensive / Debuff^000000",
		"Description: ^777777Deals damage to the target and reduces the target's neutral element resistance.^000000",
		"^777777Caster's DEX and skill level affects the chance of reducing the target's neutral element resistance.^000000",
		"^777777Consumes 1 coin.^000000",
		"[Lv 1]: ^777777Duration 12 seconds / Reduce 10 % neutral resistance^000000",
		"[Lv 2]: ^777777Duration 14 seconds / Reduce 20 % neutral resistance^000000",
		"[Lv 3]: ^777777Duration 16 seconds / Reduce 30 % neutral resistance^000000",
		"[Lv 4]: ^777777Duration 18 seconds / Reduce 40 % neutral resistance^000000",
		"[Lv 5]: ^777777Duration 20 seconds / Reduce 50 % neutral resistance^000000"
	].join("\n");

	SkillDescription[SKID.RL_E_CHAIN] = [
		"Eternal Chain",
		"Max Level: 10",
		"^CC3399Requirement: Chain Action 10^000000",
		"Skill Form: ^339900Buff^000000",
		"Description: ^777777Allows the caster to use Chain Action regardless of equipped weapon for a duration.^000000",
		"^777777Chain Action level is determined by the number of coins consumed by this skill.^000000",
		"^777777Consumes all coins.^000000",
		"[LV 1]: ^777777Duration 30 seconds^000000",
		"[LV 2]: ^777777Duration 45 seconds^000000",
		"[LV 3]: ^777777Duration 60 seconds^000000",
		"[LV 4]: ^777777Duration 75 seconds^000000",
		"[LV 5]: ^777777Duration 90 seconds^000000",
		"[LV 6]: ^777777Duration 105 seconds^000000",
		"[LV 7]: ^777777Duration 120 seconds^000000",
		"[LV 8]: ^777777Duration 135 seconds^000000",
		"[LV 9]: ^777777Duration 150 seconds^000000",
		"[LV 10]: ^777777Duration 165 seconds^000000"
	].join("\n");

	SkillDescription[SKID.RL_QD_SHOT] = [
		"Quick Draw Shot",
		"Max Level: 1",
		"^CC3399Requirement: Eternal Chain 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777This skill can only be cast after Chain Action is activated to deal additional damage to the target.^000000",
		"^777777Caster's DEX determines the number of additional attacks done by this skill.^000000",
		"^777777If there is a target afflicted with Crimson Marker within 21x21 range of the caster, that target receives additional damage from this skill.^000000"
	].join("\n");

	SkillDescription[SKID.RL_C_MARKER] = [
		"Crimson Marker",
		"Max Level: 1",
		"^CC3399Requirement: Increase Accuracy 1^000000",
		"Skill Form: ^FF0000Debuff / Special^000000",
		"Description: ^777777Mark a target with crimson death mark, reducing its movement speed by 10% and allows the caster to track the target on the mini map.^000000",
		"^777777Only a maximum of 3 Crimson Marker can be active at a time.^000000",
		"^777777Boosts Quick Draw Shot, Dragon Tail and Hammer of God effect. 30 second duration.^000000"
	].join("\n");

	SkillDescription[SKID.RL_FIREDANCE] = [
		"Fire Dance",
		"Max Level: 5",
		"^CC3399Requirement: Fallen Angel 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Revolver exclusive skill. Deals damage to all targets within 5x5 of the caster.^000000",
		"^777777Consumes 1 coin and 5 bullets.^000000",
		"[Lv 1]: ^777777Damage 100% +  additional damage depending on caster's level^000000",
		"[Lv 2]: ^777777Damage 200% +  additional damage depending on caster's level^000000",
		"[Lv 3]: ^777777Damage 300% +  additional damage depending on caster's level^000000",
		"[Lv 4]: ^777777Damage 400% +  additional damage depending on caster's level^000000",
		"[Lv 5]: ^777777Damage 500% +  additional damage depending on caster's level^000000"
	].join("\n");

	SkillDescription[SKID.RL_FIRE_RAIN] = [
		"Fire Rain",
		"Max Level: 5",
		"^CC3399Requirement: Gatling Fever 1^000000",
		"Skill Form: ^FF0000Offensive / Ground^000000",
		"Description: ^777777Gatling Gun exclusive skill. Fire bullets in a 3x10 frontal cone.^000000",
		"^777777Removes ground target skills in range at a chance.^000000",
		"^777777Caster's DEX and skill level affects the damage done. Consumes 10 Bullets.^000000",
		"[Lv 1]: ^777777Damage 2000% + additional damage depending on caster's DEX^000000",
		"[Lv 2]: ^777777Damage 2000% + additional damage depending on caster's DEX^000000",
		"[Lv 3]: ^777777Damage 2000% + additional damage depending on caster's DEX^000000",
		"[Lv 4]: ^777777Damage 2000% + additional damage depending on caster's DEX^000000",
		"[Lv 5]: ^777777Damage 2000% + additional damage depending on caster's DEX^000000"
	].join("\n");

	SkillDescription[SKID.RL_FALLEN_ANGEL] = [
		"Fallen Angel",
		"Max Level: 5",
		"^CC3399Requirement: Desperado 10^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Revolver exclusive skill. Jump to the targeted location and activate desperado.^000000",
		"^777777If there is an obstacle between the caster and targeted cell, this skill fails to activate.^000000",
		"^777777Higher skill level reduces the reuse delay.^000000"
	].join("\n");

	SkillDescription[SKID.RL_P_ALTER] = [
		"Platinum Alter",
		"Max Level: 5",
		"^CC3399Requirement: Rebellion Basics^000000",
		"Skill Form: ^339900Buff^000000",
		"Description: ^777777This skill can only activate if the caster's equipped silver bullet.^000000",
		"^777777When activated, consumes all coins to increase ATK.^000000",
		"^777777Skill level affects the ATK increase. Reduces the damage taken from undead monsters during the skill duration.^000000",
		"^777777If the caster switches weapon or bullet during the duration, this buff will end.^000000"
	].join("\n");

	SkillDescription[SKID.RL_FLICKER] = [
		"Flicker",
		"Max Level: 1",
		"^CC3399Requirement: Fling 1^000000",
		"Skill Form: ^339900Special^000000",
		"Description: ^777777Activates and destroys caster's Howling Mine and Bind Trap on screen.^000000"
	].join("\n");

	SkillDescription[SKID.RL_H_MINE] = [
		"Howling Mine",
		"Max Level: 5",
		"^CC3399Requirement: Spread Attack 1^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Grenade Launcher exclusive skill. Fire a sticking bomb at the target to deal damage.^000000",
		"^777777If the caster uses Flicker skill, Howling Mine will detonate on the target, dealing fire damage to the target and all enemies in range.^000000",
		"^777777Howling Mine can only be detonated with Flicker. If the Howling Mine is not detonated for a certain duration, it will fall off from the target.^000000",
		"^777777Targets damaged by Howling Mine will be inflicted with Burning status at a chance.^000000",
		"^777777Consumes 1 Mine Projectile.^000000",
		"[Lv 1]: ^777777Damage 400 % + Explosion Damage 800%^000000",
		"[Lv 2]: ^777777Damage 600 % + Explosion Damage 1100%^000000",
		"[Lv 3]: ^777777Damage 800 % + Explosion Damage 1400%^000000",
		"[Lv 4]: ^777777Damage 1000 % + Explosion Damage 1700%^000000",
		"[Lv 5]: ^777777Damage 1200 % + Explosion Damage 2000%^000000"
	].join("\n");

	SkillDescription[SKID.RL_HAMMER_OF_GOD] = [
		"Hammer of God",
		"Max Level: 5",
		"^CC3399Requirement: Anti-Material Blast 3^000000",
		"Skill Form: ^FF0000Offensive^000000",
		"Description: ^777777Rifle exclusive skill. Target the ground to summon a hammer of god to strike it.^000000",
		"^777777If there is a target afflicted with Crimson Marker in the targeted area, hammer of god drops on the target and deals damage to the target and enemies in 5x5 area.^000000",
		"^777777If there is no target afflicted with Crimson Marker in the targeted area, hammer of god will drop on a random location within the area.^000000",
		"^777777Targets hit by this skill will be stunned at a 100% chance. Higher skill level increases the stun duration.^000000",
		"[Lv 1]: ^777777Damage 2400 % + stun lasts 3 seconds^000000",
		"[Lv 2]: ^777777Damage 3200 % + stun lasts 3 seconds^000000",
		"[Lv 3]: ^777777Damage 4000 % + stun lasts 4 seconds^000000",
		"[Lv 4]: ^777777Damage 4800 % + stun lasts 4 seconds^000000",
		"[Lv 5]: ^777777Damage 5600 % + stun lasts 5 seconds^000000"
	].join("\n");

	SkillDescription[SKID.RL_HEAT_BARREL] = [
		"Heat Barrel",
		"Max Level: 5",
		"^CC3399Requirement: Fire Dance 2^000000",
		"Skill Form: ^339900Buff^000000",
		"Description: ^777777Consume all coins to increase caster's ASPD and ATK at the cost of accuracy.",
		"Higher skill level increases ASPD and ATK increase as well as accuracy decrease.",
		"After the duration, caster will not be able to attack or use skills and items for 10 seconds.",
		"This skill cannot be used with Madness Canceller.",
		"If the caster switches equipment during the duration, the skill will end and activate the 10 second penalty. 60 second duration.^000000"
	].join("\n");

	SkillDescription[SKID.BA_POEMBRAGI2] = [
		"A Poem of Bragi",
		"Max Level: 10",
		"^CC3399Requirement: Unchained Serenade 3^000000",
		"Skill Form: ^777777Attack^000000",
		"Range : ^7777777 Cells^000000",
		"Description: ^777777Gives a fixed damage to enemies within range at regular intervals.^000000"
	].join("\n");

	SkillDescription[SKID.DC_FORTUNEKISS2] = [
		"Fortune's kiss",
		"Max Level: 10",
		"^CC3399Requirement: Ugly Dance 3^000000",
		"Skill Form: ^339900Supportive^000000",
		"Range: ^7777777 Cells^000000",
		"Description: ^777777Increases the chance to hit Critical.^000000"
	].join("\n");

	SkillDescription[SKID.GM_FORCE_TRANSFER] = [
		"Force Transfer",
		"Max Level: 1",
		"Description: ^777777^000000"
	].join("\n");

	SkillDescription[SKID.GD_GUILD_STORAGE] = [
		"Guild Storage Expansion",
		"Skill Form: ^6666ccPassive^000000",
		"Target : ^777777P^000000",
		"Description: ^777777Allows to use Guild Storage. Guild Storage Slots can be increased^000000",
		"[Lv 1]: ^777777100 Slots^000000",
		"[Lv 2]: ^777777200 Slots^000000",
		"[Lv 3]: ^777777300 Slots^000000",
		"[Lv 4]: ^777777400 Slots^000000",
		"[Lv 5]: ^777777500 Slots^000000"
	].join("\n");

	SkillDescription[SKID.GM_WIDE_RESURRECTION] = [
		"Wide Resurrection",
		"Skill Form: ^000099Active^000000",
		"Target : ^777777Dead Player^000000",
		"Description: ^777777Revive All Players Around the caster.^000000"
	].join("\n");

	SkillDescription[SKID.ALL_NIFLHEIM_RECALL] = [
		"Return to Niflheim",
		"Description: ^777777Teleport to Niflheim, 5 minutes after use delay.^000000"
	].join("\n");

	SkillDescription[SKID.ALL_PRONTERA_RECALL] = [
		"Return to Prontera",
		"Description: ^777777Teleport to Prontera, 5 minutes after use delay.^000000"
	].join("\n");

	return SkillDescription;
});
