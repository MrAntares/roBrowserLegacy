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
		"Max Lv : 9",
		"Skill Form : ^000099Passive^000000",
		"^777777Enables the use of Basic Interface Skills.^000000",
		"[Lv 1]: Enables Trading",
		"^777777Allows the trading of items with other characters. ^990000Right click on a character to initiate.^000000",
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
		"^777777Create a party by typing /organize ''[Party Name]''",
		"Set party options in the Party Window (Alt+Z).^000000",
		"[Lv 9]: Enables Change to First Job Class",
		"^777777Qualifies character for change from Novice to one",
		"of the First Job Classes.^000000"
	].join("\n");

	SkillDescription[SKID.SM_SWORD] = [
		"Sword Mastery",
		"Max Lv : 10",
		"Skill Form : ^000099Passive^000000",
		"Description: ^777777Increase damage with One Handed",
		"Sword or Dagger Class Weapons.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Damage +4^000000",
		"[Lv 2] : ^777777Damage +8^000000",
		"[Lv 3] : ^777777Damage +12^000000",
		"[Lv 4] : ^777777Damage +16^000000",
		"[Lv 5] : ^777777Damage +20^000000",
		"[Lv 6] : ^777777Damage +24^000000",
		"[Lv 7] : ^777777Damage +28^000000",
		"[Lv 8] : ^777777Damage +32^000000",
		"[Lv 9] : ^777777Damage +36^000000",
		"[Lv10] : ^777777Damage +40^000000"
	].join("\n");

	SkillDescription[SKID.SM_TWOHAND] = [
		"Two Handed Sword Mastery",
		"Max Lv : 10",
		"^777777Skill Requirement : Sword Mastery 1^000000",
		"Skill Form : ^000099Passive^000000",
		"Description: ^777777Increase damage with Two Handed Sword Class Weapons.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Damage +4^000000",
		"[Lv 2] : ^777777Damage +8^000000",
		"[Lv 3] : ^777777Damage +12^000000",
		"[Lv 4] : ^777777Damage +16^000000",
		"[Lv 5] : ^777777Damage +20^000000",
		"[Lv 6] : ^777777Damage +24^000000",
		"[Lv 7] : ^777777Damage +28^000000",
		"[Lv 8] : ^777777Damage +32^000000",
		"[Lv 9] : ^777777Damage +36^000000",
		"[Lv10] : ^777777Damage +40^000000"
	].join("\n");

	SkillDescription[SKID.SM_RECOVERY] = [
		"Increase HP Recovery",
		"Max Lv : 10",
		"Skill Form : ^000099Passive^000000",
		"Description: ^777777Enhance natural HP Recovery. Max",
		"HP affects how much HP restoration is increased.",
		"HP recovery happens every 10 seconds while standing.",
		"But it doesn't work while walking or HP/SP regen disabled.^000000",
		"^ffffff_^000000",
		"[Lv 1]: ^777777(HP 5+0.2% of MaxHP)/10 sec^000000",
		"[Lv 2]: ^777777(HP 10+0.4% of MaxHP)/10 sec^000000",
		"[Lv 3]: ^777777(HP 15+0.6% of MaxHP)/10 sec^000000",
		"[Lv 4]: ^777777(HP 20+0.8% of MaxHP)/10 sec^000000",
		"[Lv 5]: ^777777(HP 25+1.0% of MaxHP)/10 sec^000000",
		"[Lv 6]: ^777777(HP 30+1.2% of MaxHP)/10 sec^000000",
		"[Lv 7]: ^777777(HP 35+1.4% of MaxHP)/10 sec^000000",
		"[Lv 8]: ^777777(HP 40+1.6% of MaxHP)/10 sec^000000",
		"[Lv 9]: ^777777(HP 45+1.8% of MaxHP)/10 sec^000000",
		"[Lv 10]: ^777777(HP 50+2.0% of MaxHP)/10 sec^000000"
	].join("\n");

	SkillDescription[SKID.SM_BASH] = [
		"Bash",
		"Max Lv : 10",
		"Skill Form: ^777777Offensive^000000",
		"Type : ^777777Physical Attack^000000",
		"Target: ^7777771 Enemy^000000",
		"Description: ^777777Hit an enemy with crushing force.",
		"If the Fatal Blow skill is learned, Bash will have",
		"an added Stun effect at levels 5 and higher.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 130%, Acurracy Bonus: 5%, SP Consumption: 8^000000",
		"[Lv 2] : ^777777ATK 160%, Acurracy Bonus:10%, SP Consumption: 8^000000",
		"[Lv 3] : ^777777ATK 190%, Acurracy Bonus:15%, SP Consumption: 8^000000",
		"[Lv 4] : ^777777ATK 220%, Acurracy Bonus:20%, SP Consumption: 8^000000",
		"[Lv 5] : ^777777ATK 250%, Acurracy Bonus:25%, SP Consumption: 8^000000",
		"[Lv 6] : ^777777ATK 280%, Acurracy Bonus:30%, SP Consumption:15^000000",
		"[Lv 7] : ^777777ATK 310%, Acurracy Bonus:35%, SP Consumption:15^000000",
		"[Lv 8] : ^777777ATK 340%, Acurracy Bonus:40%, SP Consumption:15^000000",
		"[Lv 9] : ^777777ATK 370%, Acurracy Bonus:45%, SP Consumption:15^000000",
		"[Lv10] : ^777777ATK 400%, Acurracy Bonus:50%, SP Consumption:15^000000"
	].join("\n");

	SkillDescription[SKID.SM_PROVOKE] = [
		"Provoke",
		"Max Lv : 10",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Target: ^7777771 Enemy^000000",
		"Description: ^777777Enrage a single target to decrease player's defense",
		"based on VIT or monster's physical defense",
		"at cost of increasing its Attack Strength.",
		"Ineffective against the Undead and Boss monster.",
		"Effect of Provoke on Enemies by Skill's Level.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Enemy's ATK +5%, Enemy's DEF -10%^000000",
		"[Lv 2] : ^777777Enemy's ATK +8%, Enemy's DEF -15%^000000",
		"[Lv 3] : ^777777Enemy's ATK +11%, Enemy's DEF -20%^000000",
		"[Lv 4] : ^777777Enemy's ATK +14%, Enemy's DEF -25%^000000",
		"[Lv 5] : ^777777Enemy's ATK +17%, Enemy's DEF -30%^000000",
		"[Lv 6] : ^777777Enemy's ATK +20%, Enemy's DEF -35%^000000",
		"[Lv 7] : ^777777Enemy's ATK +23%, Enemy's DEF -40%^000000",
		"[Lv 8] : ^777777Enemy's ATK +26%, Enemy's DEF -45%^000000",
		"[Lv 9] : ^777777Enemy's ATK +29%, Enemy's DEF -50%^000000",
		"[Lv10] : ^777777Enemy's ATK +32%, Enemy's DEF -55%^000000"
	].join("\n");

	SkillDescription[SKID.SM_MAGNUM] = [
		"Magnum Break",
		"Max Lv : 10",
		"^777777Skill Requirement : Bash 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Offensive, Buff^000000",
		"Description: ^777777Drain a small amount of the caster's",
		"HP to inflict Fire property area effect damage on",
		"enemies in the caster's vicinity and force them",
		"backward. For 10 seconds after Magnum Break,",
		"caster's weapon will receive a 20% Fire property",
		"strength enhancement.",
		"Description : ^777777SP 30  Consumption, inflict Fire property physical damage to all enemies in a 5x5 area around the user and push them 2 cells backwards.",
		"This skill adds an additional 20% Fire property damage for ten seconds.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 120%^000000",
		"[Lv 2] : ^777777ATK 140%^000000",
		"[Lv 3] : ^777777ATK 160%^000000",
		"[Lv 4] : ^777777ATK 180%^000000",
		"[Lv 5] : ^777777ATK 200%^000000",
		"[Lv 6] : ^777777ATK 220%^000000",
		"[Lv 7] : ^777777ATK 240%^000000",
		"[Lv 8] : ^777777ATK 260%^000000",
		"[Lv 9] : ^777777ATK 280%^000000",
		"[Lv10] : ^777777ATK 300%^000000"
	].join("\n");

	SkillDescription[SKID.SM_ENDURE] = [
		"Endure",
		"Max Lv : 10",
		"^777777Skill Requirement : Provoke 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description: ^777777Enables attacking and movement",
		"while receiving damage, but is automatically",
		"canceled after skill duration elapses or after",
		"caster is hit by 7 attacks. 10 sec cast delay.",
		"Disabled in War of Emperium.^000000",
		"Duration and Mdef Bonus by Skill's Level",
		"Description : ^777777Resist flinching from enemy melee attacks temporarily. Stiffness occurs when damage is caused by Magic and skill attacks.",
		"If attacked more than seven times by an enemy in an Endure state, the Endure state will be released. ^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration 10 sec, MDEF +1^000000",
		"[Lv 2] : ^777777Duration 13 sec, MDEF +2^000000",
		"[Lv 3] : ^777777Duration 16 sec, MDEF +3^000000",
		"[Lv 4] : ^777777Duration 19 sec, MDEF +4^000000",
		"[Lv 5] : ^777777Duration 22 sec, MDEF +5^000000",
		"[Lv 6] : ^777777Duration 25 sec, MDEF +6^000000",
		"[Lv 7] : ^777777Duration 28 sec, MDEF +7^000000",
		"[Lv 8] : ^777777Duration 31 sec, MDEF +8^000000",
		"[Lv 9] : ^777777Duration 34 sec, MDEF +9^000000",
		"[Lv10] : ^777777Duration 37 sec, MDEF +10^000000"
	].join("\n");

	SkillDescription[SKID.MG_SRECOVERY] = [
		"Increase SP Recovery",
		"Max Lv : 10",
		"Skill Form : ^000099Passive^000000",
		"Description: ^777777Enhance natural SP Recovery.",
		"MaxSP affects how much SP restoration is",
		"increased by this skill. Increases the efficiency",
		"of SP recovering items for 2% per skill level.^000000",
		"Description : ^777777Additional SP every 10 seconds while the character is not moving.",
		"No SP is restored if normal SP/HP regeneration is not permitted or the character is moving.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777(3 + 0.2% of MaxSP)/10 sec^000000",
		"[Lv 2] : ^777777(6 + 0.4% of MaxSP)/10 sec^000000",
		"[Lv 3] : ^777777(9 + 0.6% of MaxSP)/10 sec^000000",
		"[Lv 4] : ^777777(12 + 0.8% of MaxSP)/10 sec^000000",
		"[Lv 5] : ^777777(15 + 1.0% of MaxSP)/10 sec^000000",
		"[Lv 6] : ^777777(18 + 1.2% of MaxSP)/10 sec^000000",
		"[Lv 7] : ^777777(21 + 1.4% of MaxSP)/10 sec^000000",
		"[Lv 8] : ^777777(24 + 1.6% of MaxSP)/10 sec^000000",
		"[Lv 9] : ^777777(27 + 1.8% of MaxSP)/10 sec^000000",
		"[Lv10] : ^777777(30 + 2.0% of MaxSP)/10 sec^000000"
	].join("\n");

	SkillDescription[SKID.MG_SIGHT] = [
		"Sight",
		"Max Lv : 1",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target : ^777777Immediately^000000",
		"Description: ^7777777Summon a fire ball that will detect",
		"all hidden enemies in 7x7 cells as of the caster by consuming SP 10."
	].join("\n");

	SkillDescription[SKID.MG_NAPALMBEAT] = [
		"Napalm beat",
		"Max Lv : 10",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Special Attack(Magic)^000000",
		"Target: ^7777771 Enemy^000000",
		"Description: ^777777Attack an enemy from a distance",
		"through the use of psychokinetic energy.^000000",
		"Description : ^777777Strikes at a single target with psychokinetic energy to inflict Ghost property magic damage to all enemies within the area of effect.",
		"The more targets, the more scattered the damage.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777MATK  80%, SP Consumption: 9^000000",
		"[Lv 2] : ^777777MATK  90%, SP Consumption: 9^000000",
		"[Lv 3] : ^777777MATK 100%, SP Consumption: 9^000000",
		"[Lv 4] : ^777777MATK 110%, SP Consumption:12^000000",
		"[Lv 5] : ^777777MATK 120%, SP Consumption:12^000000",
		"[Lv 6] : ^777777MATK 130%, SP Consumption:12^000000",
		"[Lv 7] : ^777777MATK 140%, SP Consumption:15^000000",
		"[Lv 8] : ^777777MATK 150%, SP Consumption:15^000000",
		"[Lv 9] : ^777777MATK 160%, SP Consumption:15^000000",
		"[Lv10] : ^777777MATK 170%, SP Consumption:18^000000"
	].join("\n");

	SkillDescription[SKID.MG_SAFETYWALL] = [
		"Safety wall",
		"Max Lv : 10",
		"2^777777Skill Requirement : Napalm Beat 7, Soul Strike 5^000000",
		"23^777777Skill Requirement : Napalm Beat 7, Soul Strike 5^000000",
		"8^777777Skill Requirement : Aspersio 4, Sanctuary 3^000000",
		"2^777777Skill Requirement : Napalm Beat 7, Soul Strike 5^000000",
		"8^777777Skill Requirement : Aspersio 4, Sanctuary 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic, Supportive^000000",
		"Target: ^777771 cell on ground^000000",
		"Description: ^777777Create a magic barrier on",
		"a targeted spot that will block short range melee",
		"attacks for the duration of the Safety Wall.",
		"Each cast requires ^BB00BB1 Blue Gemstone^777777.^000000",
		"Description : ^777777Creates a wall on a targeted location that blocks every form of close range physical damage until its durability wears off or expires. Each cast consumes a Blue Gemstone.^000000",
		"^777777INT, Base Level, MaxSP affects durability of defence",
		"Only the first time can prevent damage beyond the total durability.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Durability: 300, Number of Defence: 2times^000000",
		"[Lv 2] : ^777777Durability: 600, Number of Defence: 3times^000000",
		"[Lv 3] : ^777777Durability: 900, Number of Defence: 4times^000000",
		"[Lv 4] : ^777777Durability:1200, Number of Defence: 5times^000000",
		"[Lv 5] : ^777777Durability:1500, Number of Defence: 6times^000000",
		"[Lv 6] : ^777777Durability:1800, Number of Defence: 7times^000000",
		"[Lv 7] : ^777777Durability:2100, Number of Defence: 8times^000000",
		"[Lv 8] : ^777777Durability:2400, Number of Defence: 9times^000000",
		"[Lv 9] : ^777777Durability:2700, Number of Defence:10times^000000",
		"[Lv10] : ^777777Durability:3000, Number of Defence:11times^000000"
	].join("\n");

	SkillDescription[SKID.MG_SOULSTRIKE] = [
		"Soul Strike",
		"Max Lv : 10",
		"^777777Skill Requirement : Napalm Beat 4^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Target: ^7777771 Enemy^000000",
		"Description: ^777777Summon holy ghosts to inflict",
		"Ghost property attacks on a target. At level 10,",
		"these ghosts will inflict 5 consecutive strikes.",
		"This skill has a 0.5 second Cast Delay.^000000",
		"Description : ^777777Summoning the Ancient Holy Spirit and attacking the enemy directly",
		"Inflict 100% Ghost property magic damage.",
		"This skill inflicts additional damage against Undead property entities.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 1time, + 5% dmg to Undead, SP Consumption:18^000000",
		"[Lv 2] : ^777777ATK 1time, +10% dmg to Undead, SP Consumption:14^000000",
		"[Lv 3] : ^777777ATK 2times, +15% dmg to Undead, SP Consumption:24^000000",
		"[Lv 4] : ^777777ATK 2times, +20% dmg to Undead, SP Consumption:20^000000",
		"[Lv 5] : ^777777ATK 3times, +25% dmg to Undead, SP Consumption:30^000000",
		"[Lv 6] : ^777777ATK 3times, +30% dmg to Undead, SP Consumption:26^000000",
		"[Lv 7] : ^777777ATK 4times, +35% dmg to Undead, SP Consumption:36^000000",
		"[Lv 8] : ^777777ATK 4times, +40% dmg to Undead, SP Consumption:32^000000",
		"[Lv 9] : ^777777ATK 5times, +45% dmg to Undead, SP Consumption:42^000000",
		"[Lv10] : ^777777ATK 5times, +50% dmg to Undead, SP Consumption:38^000000"
	].join("\n");

	SkillDescription[SKID.MG_COLDBOLT] = [
		"Cold Bolt",
		"Max Lv : 10",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Target: ^7777771 Enemy^000000",
		"Description: ^777777Summon bolts of frigid ice to",
		"strike at an enemy. Barring changes in damage",
		"due to elemental properties, each bolt inflicts",
		"an amount of damage equal to the caster's Matk.^000000",
		"Description : ^777777Attack enemies with bolts of frigid ice",
		"Inflict 100% Water property magic damage.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 1 Bolt, SP Consumption:12^000000",
		"[Lv 2] : ^777777 2 Bolt, SP Consumption:14^000000",
		"[Lv 3] : ^777777 3 Bolt, SP Consumption:16^000000",
		"[Lv 4] : ^777777 4 Bolt, SP Consumption:18^000000",
		"[Lv 5] : ^777777 5 Bolt, SP Consumption:20^000000",
		"[Lv 6] : ^777777 6 Bolt, SP Consumption:22^000000",
		"[Lv 7] : ^777777 7 Bolt, SP Consumption:24^000000",
		"[Lv 8] : ^777777 8 Bolt, SP Consumption:26^000000",
		"[Lv 9] : ^777777 9 Bolt, SP Consumption:28^000000",
		"[Lv10] : ^77777710 Bolt, SP Consumption:30^000000"
	].join("\n");

	SkillDescription[SKID.MG_FROSTDIVER] = [
		"Frost diver",
		"Max Lv : 10",
		"^777777Skill Requirement : Cold Bolt 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic, Debuff^000000",
		"Target: ^7777771 Enemy^000000",
		"Description: ^777777Inflicts water damage and has",
		"a chance of freezing it's target.^000000",
		"Description : ^777777inflict Water property magic damage, It has a chance of leaving the target [Abnormal Status : Frozen].",
		"The Chance and Duration are affected by target's magic defense and LUK.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777MATK 110%, Chance of freezing: 38%^000000",
		"[Lv 2] : ^777777MATK 120%, Chance of freezing: 41%^000000",
		"[Lv 3] : ^777777MATK 130%, Chance of freezing: 44%^000000",
		"[Lv 4] : ^777777MATK 140%, Chance of freezing: 47%^000000",
		"[Lv 5] : ^777777MATK 150%, Chance of freezing: 50%^000000",
		"[Lv 6] : ^777777MATK 160%, Chance of freezing: 53%^000000",
		"[Lv 7] : ^777777MATK 170%, Chance of freezing: 56%^000000",
		"[Lv 8] : ^777777MATK 180%, Chance of freezing: 59%^000000",
		"[Lv 9] : ^777777MATK 190%, Chance of freezing: 62%^000000",
		"[Lv10] : ^777777MATK 200%, Chance of freezing: 65%^000000"
	].join("\n");

	SkillDescription[SKID.MG_STONECURSE] = [
		"Stone Curse",
		"Max Lv : 10",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic, debuff^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Attempt to [Abnormal Status : petrify] a single target. Each cast consumes a Red Gemstone.",
		"At Levels 6 to 10, only successful casts consume the Red Gemstone.",
		"The Duration is affected by target's Level, LUK and magic defense.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Consumption: In use, Petrifaction Chance: 24%^000000",
		"[Lv 2] : ^777777Consumption: In use, Petrifaction Chance: 28%^000000",
		"[Lv 3] : ^777777Consumption: In use, Petrifaction Chance: 32%^000000",
		"[Lv 4] : ^777777Consumption: In use, Petrifaction Chance: 36%^000000",
		"[Lv 5] : ^777777Consumption: In use, Petrifaction Chance: 40%^000000",
		"[Lv 7] : ^777777Consumption: On Success, Petrifaction Chance: 48%^000000",
		"[Lv 8] : ^777777Consumption: On Success, Petrifaction Chance: 52%^000000",
		"[Lv 9] : ^777777Consumption: On Success, Petrifaction Chance: 56%^000000",
		"[Lv10] : ^777777Consumption: On Success, Petrifaction Chance: 60%^000000"
	].join("\n");

	SkillDescription[SKID.MG_FIREBALL] = [
		"Fireball",
		"Max Lv : 10",
		"^777777Skill Requirement : Firebolt 4^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Shoots a fire ball to inflict Fire property magic damage to all enemies within its area of effect. Damage to Center(3X3cell) and Edge(5X5cell) is different.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Center: MATK 160%, Edge: MATK 120%^000000",
		"[Lv 2] : ^777777Center: MATK 180%, Edge: MATK 135%^000000",
		"[Lv 3] : ^777777Center: MATK 200%, Edge: MATK 150%^000000",
		"[Lv 4] : ^777777Center: MATK 220%, Edge: MATK 165%^000000",
		"[Lv 5] : ^777777Center: MATK 240%, Edge: MATK 180%^000000",
		"[Lv 6] : ^777777Center: MATK 260%, Edge: MATK 195%^000000",
		"[Lv 7] : ^777777Center: MATK 280%, Edge: MATK 210%^000000",
		"[Lv 8] : ^777777Center: MATK 300%, Edge: MATK 225%^000000",
		"[Lv 9] : ^777777Center: MATK 320%, Edge: MATK 240%^000000",
		"[Lv10] : ^777777Center: MATK 340%, Edge: MATK 255%^000000"
	].join("\n");

	SkillDescription[SKID.MG_FIREWALL] = [
		"Firewall",
		"Max Lv : 10",
		"^777777Skill Requirement : Sight 1, Fireball 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Each cast consumes SP40, Creates a wall of flame on a targeted location that will inflict 50% Fire property magic damage and push enemies two cells backwards upon contact.^000000",
		"^777777Up to three can be installed.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777per wall: Attack 3times, Duration: 5sec^000000",
		"[Lv 2] : ^777777per wall: Attack 4times, Duration: 6sec^000000",
		"[Lv 3] : ^777777per wall: Attack 5times, Duration: 7sec^000000",
		"[Lv 4] : ^777777per wall: Attack 6times, Duration: 8sec^000000",
		"[Lv 5] : ^777777per wall: Attack 7times, Duration: 9sec^000000",
		"[Lv 6] : ^777777per wall: Attack 8times, Duration:10sec^000000",
		"[Lv 7] : ^777777per wall: Attack 9times, Duration:11sec^000000",
		"[Lv 8] : ^777777per wall:Attack 10times, Duration:12sec^000000",
		"[Lv 9] : ^777777per wall:Attack 11times, Duration:13sec^000000",
		"[Lv10] : ^777777per wall:Attack 12times, Duration:14sec^000000"
	].join("\n");

	SkillDescription[SKID.MG_FIREBOLT] = [
		"Firebolt",
		"Max Lv : 10",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Attack enemies with fire bolt",
		"inflict 100% Fire property magic damage.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 Attack 1time, SP Consumption:12^000000",
		"[Lv 2] : ^777777 Attack 2times, SP Consumption:14^000000",
		"[Lv 3] : ^777777 Attack 3times, SP Consumption:16^000000",
		"[Lv 4] : ^777777 Attack 4times, SP Consumption:18^000000",
		"[Lv 5] : ^777777 Attack 5times, SP Consumption:20^000000",
		"[Lv 6] : ^777777 Attack 6times, SP Consumption:22^000000",
		"[Lv 7] : ^777777 Attack 7times, SP Consumption:24^000000",
		"[Lv 8] : ^777777 Attack 8times, SP Consumption:26^000000",
		"[Lv 9] : ^777777 Attack 9times, SP Consumption:28^000000",
		"[Lv10] : ^777777Attack 10times, SP Consumption:30^000000"
	].join("\n");

	SkillDescription[SKID.MG_LIGHTNINGBOLT] = [
		"Lightening Bolt",
		"Max Lv : 10",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Drop lightning to give the enemy a 100% wind property magic damage.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 Attack 1time, SP Consumption:12^000000",
		"[Lv 2] : ^777777 Attack 2times, SP Consumption:14^000000",
		"[Lv 3] : ^777777 Attack 3times, SP Consumption:16^000000",
		"[Lv 4] : ^777777 Attack 4times, SP Consumption:18^000000",
		"[Lv 5] : ^777777 Attack 5times, SP Consumption:20^000000",
		"[Lv 6] : ^777777 Attack 6times, SP Consumption:22^000000",
		"[Lv 7] : ^777777 Attack 7times, SP Consumption:24^000000",
		"[Lv 8] : ^777777 Attack 8times, SP Consumption:26^000000",
		"[Lv 9] : ^777777 Attack 9times, SP Consumption:28^000000",
		"[Lv10] : ^777777Attack 10times, SP Consumption:30^000000"
	].join("\n");

	SkillDescription[SKID.MG_THUNDERSTORM] = [
		"Thunder storm",
		"Max Lv : 10",
		"^777777Skill Requirement : Lightning Bolt 4^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Each bolt will inflict 100% Wind property magic damage to 5*5cell.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 Attack 1time, SP Consumption:29^000000",
		"[Lv 2] : ^777777 Attack 2times, SP Consumption:34^000000",
		"[Lv 3] : ^777777 Attack 3times, SP Consumption:39^000000",
		"[Lv 4] : ^777777 Attack 4times, SP Consumption:44^000000",
		"[Lv 5] : ^777777 Attack 5times, SP Consumption:49^000000",
		"[Lv 6] : ^777777 Attack 6times, SP Consumption:54^000000",
		"[Lv 7] : ^777777 Attack 7times, SP Consumption:59^000000",
		"[Lv 8] : ^777777 Attack 8times, SP Consumption:64^000000",
		"[Lv 9] : ^777777 Attack 9times, SP Consumption:69^000000",
		"[Lv10] : ^777777Attack 10times, SP Consumption:74^000000"
	].join("\n");

	SkillDescription[SKID.AL_DP] = [
		"Divine Protection",
		"Max Lv : 10",
		"14^777777Skill Requirement : Cure 1^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Raises Soft Defense against Demon and Undead race monsters. The higher the character level, the higher the damage reduction.",
		"Decrease the damage received from Demon and Undead race monsters by the amount of damage reduction.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Damage reduction + 3^000000",
		"[Lv 2] : ^777777Damage reduction + 6^000000",
		"[Lv 3] : ^777777Damage reduction + 9^000000",
		"[Lv 4] : ^777777Damage reduction + 12^000000",
		"[Lv 5] : ^777777Damage reduction + 15^000000",
		"[Lv 6] : ^777777Damage reduction + 18^000000",
		"[Lv 7] : ^777777Damage reduction + 21^000000",
		"[Lv 8] : ^777777Damage reduction + 24^000000",
		"[Lv 9] : ^777777Damage reduction + 27^000000",
		"[Lv10] : ^777777Damage reduction + 30^000000"
	].join("\n");

	SkillDescription[SKID.AL_DEMONBANE] = [
		"Demonbane",
		"Max Lv : 10",
		"^777777Skill Requirement : Divine Protection 3^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Raises Physical Attack (Weapon Mastery) against Demon and Undead race monsters. 캐릭터 레벨이 높아질수록 공격력이 증가한다.",
		"Damage is added to the physical damage given to Demon and Undead race monsters.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Damage + 3^000000",
		"[Lv 2] : ^777777Damage + 6^000000",
		"[Lv 3] : ^777777Damage + 9^000000",
		"[Lv 4] : ^777777Damage + 12^000000",
		"[Lv 5] : ^777777Damage + 15^000000",
		"[Lv 6] : ^777777Damage + 18^000000",
		"[Lv 7] : ^777777Damage + 21^000000",
		"[Lv 8] : ^777777Damage + 24^000000",
		"[Lv 9] : ^777777Damage + 27^000000",
		"[Lv10] : ^777777Damage + 30^000000"
	].join("\n");

	SkillDescription[SKID.AL_RUWACH] = [
		"Ruwach",
		"Max Lv : 1",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive, Magic^000000",
		"Target : ^777777Immediately^000000",
		"Description : ^777777Each cast consumes SP10, reveal hidden enemies within 5*5cell around it.",
		"If the hidden is enemy, inflict 145% Holy property magic damage.^000000"
	].join("\n");

	SkillDescription[SKID.AL_PNEUMA] = [
		"Pneuma",
		"Max Lv : 1",
		"^777777Skill Requirement : Warp portal 4^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Each cast consumes SP10, Creates a green cloud on a targeted location that blocks Ranged physical damage for ten seconds.^000000"
	].join("\n");

	SkillDescription[SKID.AL_TELEPORT] = [
		"Teleport",
		"Max Lv : 2",
		"^777777Skill Requirement : Ruwach 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target : ^777777Immediately^000000",
		"Description : ^777777Warps the user to a different location instantly.",
		"This skill is disabled within land protector effect.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Warps to Random in Map,  ConsumptionSP: 10^000000",
		"[Lv 2] : ^777777Warps to Map and Save Point,  ConsumptionSP: 9^000000"
	].join("\n");

	SkillDescription[SKID.AL_WARP] = [
		"Warp portal",
		"Max Lv : 4",
		"^777777Skill Requirement : Teleportation 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Creates a Warp Portal that will transport those that enter to the portal's destination. Up to 8 players can be transported regardless of the skill level. Each cast consumes a Blue Gemstone.",
		"This skill is disabled within land protector effect.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Move to save point.^000000",
		"[Lv 2] : ^777777 1 custom position available^000000",
		"[Lv 3] : ^777777 2 custom position available^000000",
		"[Lv 4] : ^777777 3 custom position available^000000",
		"[Custom Position] : ^777777Stand in the area and type in [/memo] to store a Memo Point of the current spot.^000000"
	].join("\n");

	SkillDescription[SKID.AL_HEAL] = [
		"Heal",
		"Max Lv : 10",
		"14^777777Skill Requirement : Faith 10, Demon Bane 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Recovery^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Restores HP of a single target. This skill is also affected by User's LV, total INT, MATK.",
		"Versus Undead property targets, inflicts Holy property damage equal to half the amount of the HP restored.^000000"
	].join("\n");

	SkillDescription[SKID.AL_INCAGI] = [
		"Increase agility",
		"Max Lv : 10",
		"^777777Skill Requirement : Heal 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Places a temporary buff on a single target that increases AGI and Movement Speed. Each cast consumes additional HP10.",
		"When use this skill to the target leaving in [Abnormal Status : Decrease agility], the target releases the state and increases agility.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777AGI+3, ATK Speed: +1%, Duration: 60sec^000000",
		"[Lv 2] : ^777777AGI+4, ATK Speed: +2%, Duration: 80sec^000000",
		"[Lv 3] : ^777777AGI+5, ATK Speed: +3%, Duration:100sec^000000",
		"[Lv 4] : ^777777AGI+6, ATK Speed: +4%, Duration:120sec^000000",
		"[Lv 5] : ^777777AGI+7, ATK Speed: +5%, Duration:140sec^000000",
		"[Lv 6] : ^777777AGI+8, ATK Speed: +6%, Duration:160sec^000000",
		"[Lv 7] : ^777777AGI+9, ATK Speed: +7%, Duration:180sec^000000",
		"[Lv 8] : ^777777AGI+10, ATK Speed: +8%, Duration:200sec^000000",
		"[Lv 9] : ^777777AGI+11, ATK Speed: +9%, Duration:220sec^000000",
		"[Lv10] : ^777777AGI+12, ATK Speed: +10%, Duration:240sec^000000"
	].join("\n");

	SkillDescription[SKID.AL_DECAGI] = [
		"Decrease agility",
		"Max Lv : 10",
		"^777777Skill Requirement : Increase agility 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Attempts to place a debuff[Abnormal Status : Decrease agility] on a single target.",
		"Target's movement speed and AGI is decreased during the Duration.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777AGI- 3, success rate: 53%, Duration: 20sec^000000",
		"[Lv 2] : ^777777AGI- 4, success rate: 56%, Duration: 25sec^000000",
		"[Lv 3] : ^777777AGI- 5, success rate: 59%, Duration: 30sec^000000",
		"[Lv 4] : ^777777AGI- 6, success rate: 62%, Duration: 35sec^000000",
		"[Lv 5] : ^777777AGI- 7, success rate: 65%, Duration: 40sec^000000",
		"[Lv 6] : ^777777AGI- 8, success rate: 68%, Duration: 45sec^000000",
		"[Lv 7] : ^777777AGI- 9, success rate: 71%, Duration: 50sec^000000",
		"[Lv 8] : ^777777AGI-10, success rate: 74%, Duration: 55sec^000000",
		"[Lv 9] : ^777777AGI-11, success rate: 77%, Duration: 60sec^000000",
		"[Lv10] : ^777777AGI-12, success rate: 80%, Duration: 65sec^000000"
	].join("\n");

	SkillDescription[SKID.AL_HOLYWATER] = [
		"Aqua Benedicta",
		"Max Lv : 1",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target : ^777777Immediately^000000",
		"Description : ^777777Draws water under the caster to create a single Holy Water from it. Requires the player to be in shallow water and each cast consumes SP10.^000000"
	].join("\n");

	SkillDescription[SKID.AL_CRUCIS] = [
		"Signum Crucis",
		"Max Lv : 10",
		"^777777Skill Requirement : Demon Bane 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Target : ^777777Immediately^000000",
		"Description : ^777777Decreases the hard defense of all Undead property and Demon race monsters in the caster's screen.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Physical Defense -14%, success rate: 27%^000000",
		"[Lv 2] : ^777777Physical Defense -18%, success rate: 31%^000000",
		"[Lv 3] : ^777777Physical Defense -22%, success rate: 35%^000000",
		"[Lv 4] : ^777777Physical Defense -26%, success rate: 39%^000000",
		"[Lv 5] : ^777777Physical Defense -30%, success rate: 43%^000000",
		"[Lv 6] : ^777777Physical Defense -34%, success rate: 47%^000000",
		"[Lv 7] : ^777777Physical Defense -38%, success rate: 51%^000000",
		"[Lv 8] : ^777777Physical Defense -42%, success rate: 55%^000000",
		"[Lv 9] : ^777777Physical Defense -46%, success rate: 59%^000000",
		"[Lv10] : ^777777Physical Defense -50%, success rate: 63%^000000"
	].join("\n");

	SkillDescription[SKID.AL_ANGELUS] = [
		"Angelus",
		"Max Lv : 10",
		"^777777Skill Requirement : Divine Protection 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target : ^777777Immediately^000000",
		"Description : ^777777Increase physical defense and MaxHP on the user and all party members in a 14x14 area around the user.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777VIT Defense+ 5%, HP+ 50, Duration: 30sec^000000",
		"[Lv 2] : ^777777VIT Defense+10%, HP+100, Duration: 60sec^000000",
		"[Lv 3] : ^777777VIT Defense+15%, HP+150, Duration: 90sec^000000",
		"[Lv 4] : ^777777VIT Defense+20%, HP+200, Duration:120sec^000000",
		"[Lv 5] : ^777777VIT Defense+25%, HP+250, Duration:150sec^000000",
		"[Lv 6] : ^777777VIT Defense+30%, HP+300, Duration:180sec^000000",
		"[Lv 7] : ^777777VIT Defense+35%, HP+350, Duration:210sec^000000",
		"[Lv 8] : ^777777VIT Defense+40%, HP+400, Duration:240sec^000000",
		"[Lv 9] : ^777777VIT Defense+45%, HP+450, Duration:270sec^000000",
		"[Lv10] : ^777777VIT Defense+50%, HP+500, Duration:300sec^000000"
	].join("\n");

	SkillDescription[SKID.AL_BLESSING] = [
		"Blessing",
		"Max Lv : 10",
		"^777777Skill Requirement : Divine Protection 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Places a temporary buff on a single target that increases STR, DEX, INT and Accuracy rate. This skill also purges the target of Curse and Stone statuses.",
		"Versus Undead property and Demon race monsters, halves their STR, DEX and INT instead.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777STR,INT,DEX+1,HIT+2, Duration: 60sec^000000",
		"[Lv 2] : ^777777STR,INT,DEX+2,HIT+4, Duration: 80sec^000000",
		"[Lv 3] : ^777777STR,INT,DEX+3,HIT+6, Duration:100sec^000000",
		"[Lv 4] : ^777777STR,INT,DEX+4,HIT+8, Duration:120sec^000000",
		"[Lv 5] : ^777777STR,INT,DEX+5,HIT+10, Duration:140sec^000000",
		"[Lv 6] : ^777777STR,INT,DEX+6,HIT+12, Duration:160sec^000000",
		"[Lv 7] : ^777777STR,INT,DEX+7,HIT+14, Duration:180sec^000000",
		"[Lv 8] : ^777777STR,INT,DEX+8,HIT+16, Duration:200sec^000000",
		"[Lv 9] : ^777777STR,INT,DEX+9,HIT+18, Duration:220sec^000000",
		"[Lv10] : ^777777STR,INT,DEX+10,HIT+20, Duration:240sec^000000"
	].join("\n");

	SkillDescription[SKID.AL_CURE] = [
		"Cure",
		"Max Lv : 1",
		"4^777777Skill Requirement : Heal 2^000000",
		"14^777777Skill Requirement : Faith 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Cures a single target from the following status effects: Silence, Chaos and Blind and consumes SP15.^000000"
	].join("\n");

	SkillDescription[SKID.MC_INCCARRY] = [
		"Enlarge Weight limit",
		"Max Lv : 10",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enhances Weight Limit.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Weight limit + 200^000000",
		"[Lv 2] : ^777777Weight limit + 400^000000",
		"[Lv 3] : ^777777Weight limit + 600^000000",
		"[Lv 4] : ^777777Weight limit + 800^000000",
		"[Lv 5] : ^777777Weight limit +1000^000000",
		"[Lv 6] : ^777777Weight limit +1200^000000",
		"[Lv 7] : ^777777Weight limit +1400^000000",
		"[Lv 8] : ^777777Weight limit +1600^000000",
		"[Lv 9] : ^777777Weight limit +1800^000000",
		"[Lv10] : ^777777Weight limit +2000^000000"
	].join("\n");

	SkillDescription[SKID.MC_DISCOUNT] = [
		"Discount",
		"Max Lv : 10",
		"^777777Skill Requirement : Enlarge Weight limit 3^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Allows to purchase items from NPC shops at lower prices.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Discount Rate 7%^000000",
		"[Lv 2] : ^777777Discount Rate 9%^000000",
		"[Lv 3] : ^777777Discount Rate 11%^000000",
		"[Lv 4] : ^777777Discount Rate 13%^000000",
		"[Lv 5] : ^777777Discount Rate 15%^000000",
		"[Lv 6] : ^777777Discount Rate 17%^000000",
		"[Lv 7] : ^777777Discount Rate 19%^000000",
		"[Lv 8] : ^777777Discount Rate 21%^000000",
		"[Lv 9] : ^777777Discount Rate 23%^000000",
		"[Lv10] : ^777777Discount Rate 24%^000000"
	].join("\n");

	SkillDescription[SKID.MC_OVERCHARGE] = [
		"Overcharge",
		"Max Lv : 10",
		"^777777Skill Requirement : Discount 3^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Allows to sell items to NPC shops at higher prices..^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Overcharge Rate 7%^000000",
		"[Lv 2] : ^777777Overcharge Rate 9%^000000",
		"[Lv 3] : ^777777Overcharge Rate 11%^000000",
		"[Lv 4] : ^777777Overcharge Rate 13%^000000",
		"[Lv 5] : ^777777Overcharge Rate 15%^000000",
		"[Lv 6] : ^777777Overcharge Rate 17%^000000",
		"[Lv 7] : ^777777Overcharge Rate 19%^000000",
		"[Lv 8] : ^777777Overcharge Rate 21%^000000",
		"[Lv 9] : ^777777Overcharge Rate 23%^000000",
		"[Lv10] : ^777777Overcharge Rate 24%^000000"
	].join("\n");

	SkillDescription[SKID.MC_PUSHCART] = [
		"Push Cart(Pushcart)",
		"Max Lv : 10",
		"^777777Skill Requirement : Enlarge Weight limit 5^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Able to use pushcart that carries a lot of items.",
		"Enables to rent a Pushcart from most Kafra employees, using [Alt-W]key.",
		"can't use the items in pushcart directly.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Mov. Speed: 45%^000000",
		"[Lv 2] : ^777777Mov. Speed: 40%^000000",
		"[Lv 3] : ^777777Mov. Speed: 35%^000000",
		"[Lv 4] : ^777777Mov. Speed: 30%^000000",
		"[Lv 5] : ^777777Mov. Speed: 25%^000000",
		"[Lv 6] : ^777777Mov. Speed: 20%^000000",
		"[Lv 7] : ^777777Mov. Speed: 15%^000000",
		"[Lv 8] : ^777777Mov. Speed: 10%^000000",
		"[Lv 9] : ^777777Mov. Speed:  5%^000000",
		"[Lv10] : ^777777Mov. Speed: none^000000"
	].join("\n");

	SkillDescription[SKID.MC_IDENTIFY] = [
		"Item Appraisal",
		"Max Lv : 1",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Identifies unknown items using SP10.^000000"
	].join("\n");

	SkillDescription[SKID.MC_VENDING] = [
		"Vending",
		"Max Lv : 10",
		"^777777Skill Requirement : Push Cart 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Requires the user to have a pushcart equipped. Consumes SP 30 and opens a custom shop from which items can be sold to other players.",
		"Only items stored in the Pushcart can be sold, The number of items available for sale increases with each level.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Item Stacks: 3items^000000",
		"[Lv 2] : ^777777Item Stacks: 4items^000000",
		"[Lv 3] : ^777777Items Stacks: 5items^000000",
		"[Lv 4] : ^777777Items Stacks: 6items^000000",
		"[Lv 5] : ^777777Items Stacks: 7items^000000",
		"[Lv 6] : ^777777Items Stacks: 8items^000000",
		"[Lv 7] : ^777777Items Stacks: 9items^000000",
		"[Lv 8] : ^777777Items Stacks:10items^000000",
		"[Lv 9] : ^777777Items Stacks:11items^000000",
		"[Lv10] : ^777777Items Stacks:12items^000000"
	].join("\n");

	SkillDescription[SKID.MC_MAMMONITE] = [
		"Mammonite",
		"Max Lv : 10",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Consumes SP5 and strike a single target with a strong blow, inflicting high physical damage.",
		"Each use consumes some Zeny.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Damage (ATK) 150%,  Zeny Cost : 100Z^000000",
		"[Lv 2] : ^777777Damage (ATK) 200%,  Zeny Cost : 200Z^000000",
		"[Lv 3] : ^777777Damage (ATK) 250%,  Zeny Cost : 300Z^000000",
		"[Lv 4] : ^777777Damage (ATK) 300%,  Zeny Cost : 400Z^000000",
		"[Lv 5] : ^777777Damage (ATK) 350%,  Zeny Cost : 500Z^000000",
		"[Lv 6] : ^777777Damage (ATK) 400%,  Zeny Cost : 600Z^000000",
		"[Lv 7] : ^777777Damage (ATK) 450%,  Zeny Cost : 700Z^000000",
		"[Lv 8] : ^777777Damage (ATK) 500%,  Zeny Cost : 800Z^000000",
		"[Lv 9] : ^777777Damage (ATK) 550%,  Zeny Cost : 900Z^000000",
		"[Lv10] : ^777777Damage (ATK) 600%,  Zeny Cost :1000Z^000000"
	].join("\n");

	SkillDescription[SKID.AC_OWL] = [
		"Owl's Eye",
		"Max Lv : 10",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Boosts DEX^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777DEX + 1^000000",
		"[Lv 2] : ^777777DEX + 2^000000",
		"[Lv 3] : ^777777DEX + 3^000000",
		"[Lv 4] : ^777777DEX + 4^000000",
		"[Lv 5] : ^777777DEX + 5^000000",
		"[Lv 6] : ^777777DEX + 6^000000",
		"[Lv 7] : ^777777DEX + 7^000000",
		"[Lv 8] : ^777777DEX + 8^000000",
		"[Lv 9] : ^777777DEX + 9^000000",
		"[Lv10] : ^777777DEX +10^000000"
	].join("\n");

	SkillDescription[SKID.AC_VULTURE] = [
		"Vulture's Eye",
		"Max Lv : 10",
		"3^777777Skill Requirement : Owl's Eye 3^000000",
		"23^777777Skill Requirement : Owl's Eye 3^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enhances Attack range and Hit rate with Bow class weapons.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 Range Bonus  + 1, HIT Bonus: 1%^000000",
		"[Lv 2] : ^777777 Range Bonus  + 2, HIT Bonus: 2%^000000",
		"[Lv 3] : ^777777 Range Bonus  + 3, HIT Bonus: 3%^000000",
		"[Lv 4] : ^777777 Range Bonus  + 4, HIT Bonus: 4%^000000",
		"[Lv 5] : ^777777 Range Bonus  + 5, HIT Bonus: 5%^000000",
		"[Lv 6] : ^777777 Range Bonus  + 6, HIT Bonus: 6%^000000",
		"[Lv 7] : ^777777 Range Bonus  + 7, HIT Bonus: 7%^000000",
		"[Lv 8] : ^777777 Range Bonus  + 8, HIT Bonus: 8%^000000",
		"[Lv 9] : ^777777 Range Bonus  + 9, HIT Bonus: 9%^000000",
		"[Lv10] : ^777777 Range Bonus  +10, HIT Bonus:10%^000000"
	].join("\n");

	SkillDescription[SKID.AC_CONCENTRATION] = [
		"Improve Concentration(Attention concentrate)",
		"Max Lv : 10",
		"^777777Skill Requirement : Vulture's Eye 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff, Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Boosts AGI and DEX temporarily.",
		"Additionally, when using Improve Concentration,",
		"This skill will also reveal any hidden enemies in a 3x3 area around the user.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777DEX, AGI + 3%, Duration:  60sec^000000",
		"[Lv 2] : ^777777DEX, AGI + 4%, Duration:  80sec^000000",
		"[Lv 3] : ^777777DEX, AGI + 5%, Duration: 100sec^000000",
		"[Lv 4] : ^777777DEX, AGI + 6%, Duration: 120sec^000000",
		"[Lv 5] : ^777777DEX, AGI + 7%, Duration: 140sec^000000",
		"[Lv 6] : ^777777DEX, AGI + 8%, Duration: 160sec^000000",
		"[Lv 7] : ^777777DEX, AGI + 9%, Duration: 180sec^000000",
		"[Lv 8] : ^777777DEX, AGI +10%, Duration: 200sec^000000",
		"[Lv 9] : ^777777DEX, AGI +11%, Duration: 220sec^000000",
		"[Lv10] : ^777777DEX, AGI +12%, Duration: 240sec^000000"
	].join("\n");

	SkillDescription[SKID.AC_DOUBLE] = [
		"Double Strafe(Double strafing)",
		"Max Lv : 10",
		"17^777777Skill Requirement : Vulture's Eye 10^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ranged Physical Attack^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Consumes SP12 and shoots a double bolt at a single target.",
		"Double Strafe's basic range is 9 cells.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 100% X 2times^000000",
		"[Lv 2] : ^777777ATK 110% X 2times^000000",
		"[Lv 3] : ^777777ATK 120% X 2times^000000",
		"[Lv 4] : ^777777ATK 130% X 2times^000000",
		"[Lv 5] : ^777777ATK 140% X 2times^000000",
		"[Lv 6] : ^777777ATK 150% X 2times^000000",
		"[Lv 7] : ^777777ATK 160% X 2times^000000",
		"[Lv 8] : ^777777ATK 170% X 2times^000000",
		"[Lv 9] : ^777777ATK 180% X 2times^000000",
		"[Lv10] : ^777777ATK 190% X 2times^000000"
	].join("\n");

	SkillDescription[SKID.AC_SHOWER] = [
		"Arrow Shower",
		"Max Lv : 10",
		"^777777Skill Requirement : Double Strafe 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ranged Physical Attack^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Consumes SP 15 and shoots an arrow that spreads over a targeted location to inflict ranged physical damage to all enemies in 3*3 cells.",
		"And push all enemies 2 cells backward within the area of effect.",
		"Arrow Shower's area of effect is 9 cells.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 160%^000000",
		"[Lv 2] : ^777777ATK 170%^000000",
		"[Lv 3] : ^777777ATK 180%^000000",
		"[Lv 4] : ^777777ATK 190%^000000",
		"[Lv 5] : ^777777ATK 200%^000000",
		"[Lv 6] : ^777777ATK 210%^000000",
		"[Lv 7] : ^777777ATK 220%^000000",
		"[Lv 8] : ^777777ATK 230%^000000",
		"[Lv 9] : ^777777ATK 240%^000000",
		"[Lv10] : ^777777ATK 250%^000000"
	].join("\n");

	SkillDescription[SKID.TF_DOUBLE] = [
		"Double Attack",
		"Max Lv : 10",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Gives the chance to inflict two hits instead of one and improves hit rate while attacking with Dagger class weapons.",
		"When using Katar type weapon, it affects off-hand damage.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Chance:  7%, Hit improvement:  1%^000000",
		"[Lv 2] : ^777777Chance: 14%, Hit improvement:  2%^000000",
		"[Lv 3] : ^777777Chance: 21%, Hit improvement:  3%^000000",
		"[Lv 4] : ^777777Chance: 28%, Hit improvement:  4%^000000",
		"[Lv 5] : ^777777Chance: 35%, Hit improvement:  5%^000000",
		"[Lv 6] : ^777777Chance: 42%, Hit improvement:  6%^000000",
		"[Lv 7] : ^777777Chance: 49%, Hit improvement:  7%^000000",
		"[Lv 8] : ^777777Chance: 56%, Hit improvement:  8%^000000",
		"[Lv 9] : ^777777Chance: 63%, Hit improvement:  9%^000000",
		"[Lv10] : ^777777Chance: 70%, Hit improvement: 10%^000000"
	].join("\n");

	SkillDescription[SKID.TF_MISS] = [
		" Improve Dodge",
		"Max Lv : 10",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enhances flee rate. The benefits of this skill are improved upon reaching 2nd class and further.",
		"Also slightly enhances the Movement Speed of the Assassin class.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^7777771st Class FLEE + 3, 2nd Class FLEE + 4^000000",
		"[Lv 2] : ^7777771st Class FLEE + 6, 2nd Class FLEE + 8^000000",
		"[Lv 3] : ^7777771st Class FLEE + 9, 2nd Class FLEE +12^000000",
		"[Lv 4] : ^7777771st Class FLEE +12, 2nd Class FLEE +16^000000",
		"[Lv 5] : ^7777771st Class FLEE +15, 2nd Class FLEE +20^000000",
		"[Lv 6] : ^7777771st Class FLEE +18, 2nd Class FLEE +24^000000",
		"[Lv 7] : ^7777771st Class FLEE +21, 2nd Class FLEE +28^000000",
		"[Lv 8] : ^7777771st Class FLEE +24, 2nd Class FLEE +32^000000",
		"[Lv 9] : ^7777771st Class FLEE +27, 2nd Class FLEE +36^000000",
		"[Lv10] : ^7777771st Class FLEE +30, 2nd Class FLEE +40^000000"
	].join("\n");

	SkillDescription[SKID.TF_STEAL] = [
		"Steal",
		"Max Lv : 10",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Consumes SP10 and attempts to steal an item from a targeted monster. The higher the target's DEX than yours, the lower the chance of success.",
		"Boss monsters and players cannot be stolen from. After success, it is not possible to steal again from the same target.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Base success rate:  8%^000000",
		"[Lv 2] : ^777777Base success rate: 14%^000000",
		"[Lv 3] : ^777777Base success rate: 20%^000000",
		"[Lv 4] : ^777777Base success rate: 26%^000000",
		"[Lv 5] : ^777777Base success rate: 32%^000000",
		"[Lv 6] : ^777777Base success rate: 38%^000000",
		"[Lv 7] : ^777777Base success rate: 44%^000000",
		"[Lv 8] : ^777777Base success rate: 50%^000000",
		"[Lv 9] : ^777777Base success rate: 56%^000000",
		"[Lv10] : ^777777Base success rate: 62%^000000"
	].join("\n");

	SkillDescription[SKID.TF_HIDING] = [
		"Hiding",
		"Max Lv : 10",
		"^777777Skill Requirement : Steal 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target : ^777777Immediately^000000",
		"Description : ^777777Consumes SP10 and conceals oneself to avoid enemies. The skills Sight and Ruwach can be used to reveal hidden players.",
		"Insect, Demon and Boss Protocol monsters can detect hidden players. Reveals oneself when using the skill again.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration:  30s,  Add SP 1 per 5 seconds  Consumption^000000",
		"[Lv 2] : ^777777Duration:  60s,  Add SP 1 per 6 seconds  Consumption^000000",
		"[Lv 3] : ^777777Duration:  90s,  Add SP 1 per 7 seconds  Consumption^000000",
		"[Lv 4] : ^777777Duration: 120s,  Add SP 1 per 8 seconds  Consumption^000000",
		"[Lv 5] : ^777777Duration: 150s,  Add SP 1 per 9 seconds  Consumption^000000",
		"[Lv 6] : ^777777Duration: 180s, Add SP 1 per 10 seconds  Consumption^000000",
		"[Lv 7] : ^777777Duration: 210s, Add SP 1 per 11 seconds  Consumption^000000",
		"[Lv 8] : ^777777Duration: 240s, Add SP 1 per 12 seconds  Consumption^000000",
		"[Lv 9] : ^777777Duration: 270s, Add SP 1 per 13 seconds  Consumption^000000",
		"[Lv10] : ^777777Duration: 300s, Add SP 1 per 14 seconds  Consumption^000000"
	].join("\n");

	SkillDescription[SKID.TF_POISON] = [
		"Envenom",
		"Max Lv : 10",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Consumes SP12 and strikes a single target to inflict Poison property physical damage. It has a chance of leaving the target [Abnormal Status : poisoned].",
		"Poisoned targets take damage per second, and their physical defense is reduced by 25%.",
		"Envenom Skill damage is the sum of general physical damage and damage by this skill^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Damage: + 15, Chance of Effect: 14%^000000",
		"[Lv 2] : ^777777Damage: + 30, Chance of Effect: 18%^000000",
		"[Lv 3] : ^777777Damage: + 45, Chance of Effect: 22%^000000",
		"[Lv 4] : ^777777Damage: + 60, Chance of Effect: 26%^000000",
		"[Lv 5] : ^777777Damage: + 75, Chance of Effect: 30%^000000",
		"[Lv 6] : ^777777Damage: + 90, Chance of Effect: 34%^000000",
		"[Lv 7] : ^777777Damage: +105, Chance of Effect: 38%^000000",
		"[Lv 8] : ^777777Damage: +120, Chance of Effect: 42%^000000",
		"[Lv 9] : ^777777Damage: +135, Chance of Effect: 46%^000000",
		"[Lv10] : ^777777Damage: +150, Chance of Effect: 50%^000000"
	].join("\n");

	SkillDescription[SKID.TF_DETOXIFY] = [
		"Detoxify",
		"Max Lv : 1",
		"^777777Skill Requirement : Envenom 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Consumes SP 10 and cures a single target from Poison status effect. ^000000"
	].join("\n");

	SkillDescription[SKID.NV_TRICKDEAD] = [
		"Play Dead",
		"^777777Skill Requirement : Finish Quest, Novice Only^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Feign death to avoid",
		"the menace of nearby enemies.",
		"The Play Dead status is cancelled by casting",
		"this skill again or attacks from an enemy.^000000"
	].join("\n");

	SkillDescription[SKID.NV_FIRSTAID] = [
		"First Aid",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^777777Player^000000",
		"Description: ^777777Consume 3SP to restore 5HP.^000000"
	].join("\n");

	SkillDescription[SKID.SM_MOVINGRECOVERY] = [
		"HP Recovery While Moving",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^000099Passive^000000",
		"Description: ^777777Enable natural recovery of HP",
		"while moving. Only 25% of the HP that is",
		"naturally recovered while standing is restored",
		"during movement. The Increase Recovery skill",
		"does not affect HP Recovery While Moving.^000000"
	].join("\n");

	SkillDescription[SKID.SM_FATALBLOW] = [
		"Fatal Blow",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^000099Passive^000000",
		"Description: ^777777Cause the Stun effect on targeted",
		"enemy when using Level 5 Bash or higher.",
		"The chance of inflicting Stun increases with Bash",
		"skill level and Base Level of the caster."
	].join("\n");

	SkillDescription[SKID.SM_AUTOBERSERK] = [
		"Berserk",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^000099Passive^000000",
		"Description: ^777777Empowered by rage, character",
		"enters condition that is equivalent to Level 10",
		"Provoke status when HP is reduced to less than",
		"25% of MaxHP. Provoked status lasts until",
		"character HP is restored to more than 25% of",
		"MaxHP or if Provoke effect is nullified.^000000"
	].join("\n");

	SkillDescription[SKID.AC_MAKINGARROW] = [
		"Arrow Crafting",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^777777Item^000000",
		"Description: ^777777Create arrows out of specific items.",
		"The kind of arrow produced, as well as the",
		"amount, is determined by the items used.^000000"
	].join("\n");

	SkillDescription[SKID.AC_CHARGEARROW] = [
		"Arrow Repel",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Draw the bowstring to its",
		"limit to fire a volley of arrows with enough",
		"force to push the target 4 cells back.",
		"Consumes 15 SP regardless of skill level.^000000",
		"[Lv 1]:^77777780% Atk^000000",
		"[Lv 2]:^77777785% Atk^000000",
		"[Lv 3]:^77777790% Atk^000000",
		"[Lv 4]:^77777795% Atk^000000",
		"[Lv 5]:^777777100% Atk^000000",
		"[Lv 6]:^777777105% Atk^000000",
		"[Lv 7]:^777777110% Atk^000000",
		"[Lv 8]:^777777115% Atk^000000",
		"[Lv 9]:^777777120% Atk^000000",
		"[Lv 10]:^777777125% Atk^000000"
	].join("\n");

	SkillDescription[SKID.TF_SPRINKLESAND] = [
		"Sand Attack",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Offensive (Earth Property)^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Kick sand into the face of an enemy",
		"which will inflict 130% of the damage of a",
		"normal attack and also have the chance to",
		"cause the Blind or Stun status on the target.^000000"
	].join("\n");

	SkillDescription[SKID.TF_BACKSLIDING] = [
		"Back Slide",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Quickly move backwards to position",
		"yourself safely away from threats.^000000"
	].join("\n");

	SkillDescription[SKID.TF_PICKSTONE] = [
		"Find Stone",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Pick up a Stone from the ground.^000000"
	].join("\n");

	SkillDescription[SKID.TF_THROWSTONE] = [
		"Stone Fling",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Attack^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Attack an enemy with a Stone which",
		"inflicts 50 damage that will pierce enemy",
		"defense and has a low chance of causing the",
		"Stun or Blind status.",
		"^00BB00Each cast requires 1 Stone.^000000"
	].join("\n");

	SkillDescription[SKID.MC_CARTREVOLUTION] = [
		"Cart Revolution",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Attack^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777A splashed damage attack in which",
		"a Pushcart is smashed into a target.",
		"Inflicts 150% of the damage of a normal attack",
		"in addition to extra damage from the weight of",
		"items in Pushcart.^000000"
	].join("\n");

	SkillDescription[SKID.MC_CHANGECART] = [
		"Change Cart",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Change Pushcart appearance.",
		"There are five different Pushcart styles that",
		"are chosen according to the character's",
		"Base Level.^000000"
	].join("\n");

	SkillDescription[SKID.MC_LOUD] = [
		"Crazy Uproar",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^777777Caster^000000",
		"Description: ^777777Scream with battle vigor to add",
		"+4 STR for 5 minutes.^000000"
	].join("\n");

	SkillDescription[SKID.AL_HOLYLIGHT] = [
		"Holy Light",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Offensive^000000",
		"Property: ^777777Holy^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Summon holy light to counter evil.^000000"
	].join("\n");

	SkillDescription[SKID.MG_ENERGYCOAT] = [
		"Energy Coat",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Create a barrier of spiritual",
		"energy that will buffer attacks at the caster.",
		"The caster's remaining SP affects the amount",
		"of damage reduced by the barrier.",
		"More SP is drained as attacks buffered",
		"by the barrier accumulate.^000000"
	].join("\n");

	SkillDescription[SKID.ALL_RESURRECTION] = [
		"Resurrection",
		"Max Lv : 4",
		"^777777Skill Requirement : Imporves SP recovery 4, Recovery 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Recovery^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Each cast consumes a Blue Gemstone. Returns a single dead player to life.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Revival to HP 10% Recovery^000000",
		"[Lv 2] : ^777777Revival to HP 30% Recovery^000000",
		"[Lv 3] : ^777777Revival to HP 50% Recovery^000000",
		"[Lv 4] : ^777777Revival to HP 80% Recovery^000000"
	].join("\n");

	SkillDescription[SKID.KN_SPEARMASTERY] = [
		"Spear Mastery",
		"Max Lv : 10",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enhances attack (Weapon Mastery) with Spear class weapons.",
		"This bonus is higher if the user is mounted.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Not Mounted, Damage + 4, Mounted, + 5^000000",
		"[Lv 2] : ^777777Not Mounted, Damage + 8, Mounted, +10^000000",
		"[Lv 3] : ^777777Not Mounted, Damage +12, Mounted, +15^000000",
		"[Lv 4] : ^777777Not Mounted, Damage +16, Mounted, +20^000000",
		"[Lv 5] : ^777777Not Mounted, Damage +20, Mounted, +25^000000",
		"[Lv 6] : ^777777Not Mounted, Damage +24, Mounted, +30^000000",
		"[Lv 7] : ^777777Not Mounted, Damage +28, Mounted, +35^000000",
		"[Lv 8] : ^777777Not Mounted, Damage +32, Mounted, +40^000000",
		"[Lv 9] : ^777777Not Mounted, Damage +36, Mounted, +45^000000",
		"[Lv10] : ^777777Not Mounted, Damage +40, Mounted, +50^000000"
	].join("\n");

	SkillDescription[SKID.KN_PIERCE] = [
		"Pierce",
		"Max Lv : 10",
		"^777777Skill Requirement : Spear Mastery 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Spear Skill Form.",
		"Thrusts the equipped spear into a single target to inflict physical damage multiple times depending on the size of the target. Small enemies will take one hit, Medium enemies will take two hits, and Large enemies will take three hits. .",
		"The Accuracy Bonus is applied after the hit rate is determined.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 1time ATK 110%, Acurracy Bonus: 5%^000000",
		"[Lv 2] : ^777777 1time ATK 120%, Acurracy Bonus:10%^000000",
		"[Lv 3] : ^777777 1time ATK 130%, Acurracy Bonus:15%^000000",
		"[Lv 4] : ^777777 1time ATK 140%, Acurracy Bonus:20%^000000",
		"[Lv 5] : ^777777 1time ATK 150%, Acurracy Bonus:25%^000000",
		"[Lv 6] : ^777777 1time ATK 160%, Acurracy Bonus:30%^000000",
		"[Lv 7] : ^777777 1time ATK 170%, Acurracy Bonus:35%^000000",
		"[Lv 8] : ^777777 1time ATK 180%, Acurracy Bonus:40%^000000",
		"[Lv 9] : ^777777 1time ATK 190%, Acurracy Bonus:45%^000000",
		"[Lv10] : ^777777 1time ATK 200%, Acurracy Bonus:50%^000000"
	].join("\n");

	SkillDescription[SKID.KN_BRANDISHSPEAR] = [
		"Brandish Spear",
		"Max Lv : 10",
		"^777777Skill Requirement : Riding 1, Spear Stab 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ranged Physical Attack^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Spear Skill Form.",
		"This skill can be used when the user is mounted, Swings the equipped spear forward to a single target to inflict physical damage to all enemies in front of the user..",
		"Damage can be increased upon the user's STR.",
		"The player cannot change weapons during this time.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 500%, Range: 5X2cell^000000",
		"[Lv 2] : ^777777ATK 600%, Range: 5X2cell^000000",
		"[Lv 3] : ^777777ATK 700%, Range: 5X2cell^000000",
		"[Lv 4] : ^777777ATK 800%, Range: 5X3cell^000000",
		"[Lv 5] : ^777777ATK 900%, Range: 5X3cell^000000",
		"[Lv 6] : ^777777ATK 1000%, Range: 5X3cell^000000",
		"[Lv 7] : ^777777ATK 1100%, Range: 5X4cell^000000",
		"[Lv 8] : ^777777ATK 1200%, Range: 5X4cell^000000",
		"[Lv 9] : ^777777ATK 1300%, Range: 5X4cell^000000",
		"[Lv10] : ^777777ATK 1400%, Range: 5X5cell^000000"
	].join("\n");

	SkillDescription[SKID.KN_SPEARSTAB] = [
		"Spear Stab",
		"Max Lv : 10",
		"^777777Skill Requirement : Pierce 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ranged Physical Attack^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777 Spear Skill Form.",
		"Thrusts the equipped spear into a single target to inflict physical damage to all enemies in straight line between the user and the target and push them 6 cells backwards.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 120%^000000",
		"[Lv 2] : ^777777ATK 140%^000000",
		"[Lv 3] : ^777777ATK 160%^000000",
		"[Lv 4] : ^777777ATK 180%^000000",
		"[Lv 5] : ^777777ATK 200%^000000",
		"[Lv 6] : ^777777ATK 220%^000000",
		"[Lv 7] : ^777777ATK 240%^000000",
		"[Lv 8] : ^777777ATK 260%^000000",
		"[Lv 9] : ^777777ATK 280%^000000",
		"[Lv10] : ^777777ATK 300%^000000"
	].join("\n");

	SkillDescription[SKID.KN_SPEARBOOMERANG] = [
		"Spear Boomerang",
		"Max Lv : 5",
		"^777777Skill Requirement : Pierce 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ranged Physical Attack^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777 Spear Skill Form.",
		"Consumes SP 12 and hurls the equipped spear like a boomerang at a single target to inflict ranged physical damage.",
		"level 1 gives a physical Attack damage.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 150%, Range: 3cell^000000",
		"[Lv 2] : ^777777ATK 200%, Range: 5cell^000000",
		"[Lv 3] : ^777777ATK 250%, Range: 7cell^000000",
		"[Lv 4] : ^777777ATK 300%, Range: 9cell^000000",
		"[Lv 5] : ^777777ATK 350%, Range:11cell^000000"
	].join("\n");

	SkillDescription[SKID.KN_TWOHANDQUICKEN] = [
		"TwoHand Quicken",
		"Max Lv : 10",
		"^777777Skill Requirement : Two-Handed Sword Mastery 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Two-Handed Sword Skill Form.",
		"Temporarily boosts attack speed, critical rate and Accuracy Rate. This effect is knocked off by changing weapons except two-handed.",
		"This effect is also knocked off by Decrease AGI and Quagmire.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration : 30sec, CRI + 3, HIT + 2^000000",
		"[Lv 2] : ^777777Duration : 60sec, CRI + 4, HIT + 4^000000",
		"[Lv 3] : ^777777Duration : 90sec, CRI + 5, HIT + 6^000000",
		"[Lv 4] : ^777777Duration :120sec, CRI + 6, HIT + 8^000000",
		"[Lv 5] : ^777777Duration :150sec, CRI + 7, HIT +10^000000",
		"[Lv 6] : ^777777Duration :180sec, CRI + 8, HIT +12^000000",
		"[Lv 7] : ^777777Duration :210sec, CRI + 9, HIT +14^000000",
		"[Lv 8] : ^777777Duration :240sec, CRI +10, HIT +16^000000",
		"[Lv 9] : ^777777Duration :270sec, CRI +11, HIT +18^000000",
		"[Lv10] : ^777777Duration :300sec, CRI +12, HIT +20^000000"
	].join("\n");

	SkillDescription[SKID.KN_AUTOCOUNTER] = [
		"Auto Counter",
		"Max Lv : 5",
		"^777777Skill Requirement : Two-Handed Sword Mastery 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target : ^777777Self^000000",
		"Description : ^777777If an opponent physically attacks a player casting Auto Counter while facing it, the attack will be blocked and the caster will perform one critical attack on them.",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Auto Counter Duration : 0.4 sec^000000",
		"[Lv 2] : ^777777Auto Counter Duration : 0.8 sec^000000",
		"[Lv 3] : ^777777Auto Counter Duration : 1.2 sec^000000",
		"[Lv 4] : ^777777Auto Counter Duration : 1.6 sec^000000",
		"[Lv 5] : ^777777Auto Counter Duration : 2.0 sec^000000"
	].join("\n");

	SkillDescription[SKID.KN_BOWLINGBASH] = [
		"Bowling Bash",
		"Max Lv : 10",
		"^777777Skill Requirement : Bash 10, Magnum Break 3, Two-Handed Sword Mastery 5, Two Hand Quicken 10, Auto Counter 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Inflict physical attack damage twice to all enemies and push tehm backwards.",
		"If attacked with two-hand sword, the number of attacks increases according to the number of enemy targets and targets surrounding them, and attacks them up to four times.",
		"The player cannot change weapons temporarilty.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 140%^000000",
		"[Lv 2] : ^777777ATK 180%^000000",
		"[Lv 3] : ^777777ATK 220%^000000",
		"[Lv 4] : ^777777ATK 260%^000000",
		"[Lv 5] : ^777777ATK 300%^000000",
		"[Lv 6] : ^777777ATK 340%^000000",
		"[Lv 7] : ^777777ATK 380%^000000",
		"[Lv 8] : ^777777ATK 420%^000000",
		"[Lv 9] : ^777777ATK 460%^000000",
		"[Lv10] : ^777777ATK 500%^000000"
	].join("\n");

	SkillDescription[SKID.KN_RIDING] = [
		"Peco Peco Ride",
		"Max Lv : 1",
		"^777777Skill Requirement : Endure 1^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enables Knights and Crusaders to ride a Peco Peco.^000000"
	].join("\n");

	SkillDescription[SKID.KN_CAVALIERMASTERY] = [
		"Cavalier Mastery",
		"Max Lv : 5",
		"^777777Skill Requirement : Riding 1^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Regains the attack speed loss when riding a Peco Peco .^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 ATK Speed : 60%^000000",
		"[Lv 2] : ^777777 ATK Speed : 70%^000000",
		"[Lv 3] : ^777777 ATK Speed : 80%^000000",
		"[Lv 4] : ^777777 ATK Speed : 90%^000000",
		"[Lv 5] : ^777777 ATK Speed :100%^000000"
	].join("\n");

	SkillDescription[SKID.PR_MACEMASTERY] = [
		"Mace Mastery",
		"Max Lv : 10",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enhances attack (Weapon Mastery) with Mace class weapons, and dmages per skill level are added to the physical damage.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Damage +3, CRI + 1^000000",
		"[Lv 2] : ^777777Damage +6, CRI + 2^000000",
		"[Lv 3] : ^777777Damage +9, CRI + 3^000000",
		"[Lv 4] : ^777777Damage +12, CRI + 4^000000",
		"[Lv 5] : ^777777Damage +15, CRI + 5^000000",
		"[Lv 6] : ^777777Damage +18, CRI + 6^000000",
		"[Lv 7] : ^777777Damage +21, CRI + 7^000000",
		"[Lv 8] : ^777777Damage +24, CRI + 8^000000",
		"[Lv 9] : ^777777Damage +27, CRI + 9^000000",
		"[Lv10] : ^777777Damage +30, CRI +10^000000"
	].join("\n");

	SkillDescription[SKID.PR_IMPOSITIO] = [
		"Impositio Manus",
		"Max Lv : 5",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Blesses a single target's weapon to increase its attack power for one minute.",
		"Increase ATK, MATK on the user and all party members around the user for 120s.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK/MATK + 5^000000",
		"[Lv 2] : ^777777ATK/MATK +10^000000",
		"[Lv 3] : ^777777ATK/MATK +15^000000",
		"[Lv 4] : ^777777ATK/MATK +20^000000",
		"[Lv 5] : ^777777ATK/MATK +25^000000"
	].join("\n");

	SkillDescription[SKID.PR_SUFFRAGIUM] = [
		"Suffragium",
		"Max Lv : 3",
		"^777777Skill Requirement : Impositio Manus 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Blesses for another person.",
		"Decrease variable casting on the user and all party members around the user for 60s.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^77777710% reduction in variable casting^000000",
		"[Lv 2] : ^77777715% reduction in variable casting^000000",
		"[Lv 3] : ^77777720% reduction in variable casting^000000"
	].join("\n");

	SkillDescription[SKID.PR_ASPERSIO] = [
		"Aspersio",
		"Max Lv : 5",
		"^777777Skill Requirement : Aqua Benedicta 1, Impositio Manus 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Consumes 1 Holy Water.",
		"Endows a single target's weapon with the Holy property temporarily.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration: 60sec^000000",
		"[Lv 2] : ^777777Duration: 90sec^000000",
		"[Lv 3] : ^777777Duration:120sec^000000",
		"[Lv 4] : ^777777Duration:150sec^000000",
		"[Lv 5] : ^777777Duration:180sec^000000"
	].join("\n");

	SkillDescription[SKID.PR_BENEDICTIO] = [
		"Benedictio Sanctissimi Sacramenti",
		"Max Lv : 5",
		"^777777Skill Requirement : Aspersio 5, Gloria 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Blesses a targeted location to endow the armor of all players within the area of effect with the Holy property.",
		"Requires the user to have two Acolyte class players horizontally adjacent to the user.",
		"Acts as Offensive Endowment when used against Undead property and Demon race monsters^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration: 40sec^000000",
		"[Lv 2] : ^777777Duration: 80sec^000000",
		"[Lv 3] : ^777777Duration:120sec^000000",
		"[Lv 4] : ^777777Duration:160sec^000000",
		"[Lv 5] : ^777777Duration:200sec^000000"
	].join("\n");

	SkillDescription[SKID.PR_SANCTUARY] = [
		"Sanctuary",
		"Max Lv : 10",
		"^777777Skill Requirement : Heal 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Recovery^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Each cast consumes a Blue Gemstone.",
		"Creates a soothing area on a targeted location that will restore HP of all entities within the area of effect every second. SKill level affects healing Value and Target Limit.",
		"Against Undead property and Demon race monsters, this skill will inflict Holy property damage equal to half of the healing value and push them 2 cells backwards.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Target Limit: 4, Healing Value:100, Duration: 4sec^000000",
		"[Lv 2] : ^777777Target Limit: 5, Healing Value:200, Duration: 7sec^000000",
		"[Lv 3] : ^777777Target Limit: 6, Healing Value:300, Duration:10sec^000000",
		"[Lv 4] : ^777777Target Limit: 7, Healing Value:400, Duration:13sec^000000",
		"[Lv 5] : ^777777Target Limit: 8, Healing Value:500, Duration:16sec^000000",
		"[Lv 6] : ^777777Target Limit: 9, Healing Value:600, Duration:19sec^000000",
		"[Lv 7] : ^777777Target Limit:10, Healing Value:777, Duration:22sec^000000",
		"[Lv 8] : ^777777Target Limit:11, Healing Value:777, Duration:25sec^000000",
		"[Lv 9] : ^777777Target Limit:12, Healing Value:777, Duration:28sec^000000",
		"[Lv10] : ^777777Target Limit:13, Healing Value:777, Duration:31sec^000000"
	].join("\n");

	SkillDescription[SKID.PR_SLOWPOISON] = [
		"Slow Poison",
		"Max Lv : 4",
		"Skill Form : ^777777Supportive^000000",
		"Target: ^777777Player^000000",
		"Description : ^777777Stops the HP drain from the Poison status effect that affects a single target.^000000"
	].join("\n");

	SkillDescription[SKID.PR_STRECOVERY] = [
		"Recovery",
		"Max Lv : 1",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Consumes SP 5 and cures a single target from the following status effects: Frozen, Stone and Stun.",
		"Against Undead property monsters, this skill will leave it [Abnormal Status : blind].^000000"
	].join("\n");

	SkillDescription[SKID.PR_KYRIE] = [
		"Kyrie Eleison",
		"Max Lv : 10",
		"^777777Skill Requirement : Angelus 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Creates a protective barrier on a single target that blocks every form of physical damage until its durability wears off or expires. Its durability is a portion of the target's MaxHP.",
		"level of this skill Maximize the number of hits blocked per skill point used",
		"Holy Light will immediately cancel the barrier on the targeted player.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Durability: MaxHP 12%, Up to 5 Hits Blocked^000000",
		"[Lv 2] : ^777777Durability: MaxHP 14%, Up to 6 Hits Blocked^000000",
		"[Lv 3] : ^777777Durability: MaxHP 16%, Up to 6 Hits Blocked^000000",
		"[Lv 4] : ^777777Durability: MaxHP 18%, Up to 7 Hits Blocked^000000",
		"[Lv 5] : ^777777Durability: MaxHP 20%, Up to 7 Hits Blocked^000000",
		"[Lv 6] : ^777777Durability: MaxHP 22%, Up to 8 Hits Blocked^000000",
		"[Lv 7] : ^777777Durability: MaxHP 24%, Up to 8 Hits Blocked^000000",
		"[Lv 8] : ^777777Durability: MaxHP 26%, Up to 9 Hits Blocked^000000",
		"[Lv 9] : ^777777Durability: MaxHP 28%, Up to 9 Hits Blocked^000000",
		"[Lv10] : ^777777Durability: MaxHP 30%, Up to 10 Hits Blocked^000000"
	].join("\n");

	SkillDescription[SKID.PR_MAGNIFICAT] = [
		"Magnificat",
		"Max Lv : 5",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target : ^777777Immediately^000000",
		"Description : ^777777Consumes SP40 and temporarily doubles the SP Recovery rate of the user and party members.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration: 30sec^000000",
		"[Lv 2] : ^777777Duration: 45sec^000000",
		"[Lv 3] : ^777777Duration: 60sec^000000",
		"[Lv 4] : ^777777Duration: 75sec^000000",
		"[Lv 5] : ^777777Duration: 90sec^000000"
	].join("\n");

	SkillDescription[SKID.PR_GLORIA] = [
		"Gloria",
		"Max Lv : 5",
		"8^777777Skill Requirement : Kyrie Eleison 4, Magnificat 3^000000",
		"4190^777777Skill Requirement : Sanctuary 7 ^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target : ^777777Immediately^000000",
		"Description : ^777777Consumes SP20 and temporarily boosts LUK by 30 to the user and party members.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration: 10sec^000000",
		"[Lv 2] : ^777777Duration: 15sec^000000",
		"[Lv 3] : ^777777Duration: 20sec^000000",
		"[Lv 4] : ^777777Duration: 25sec^000000",
		"[Lv 5] : ^777777Duration: 30sec^000000"
	].join("\n");

	SkillDescription[SKID.PR_LEXDIVINA] = [
		"Lex Divina",
		"Max Lv : 10",
		"^777777Skill Requirement : Ruwach 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Attempts to [Abnormal Status : silence] a single target.",
		"Duration can be decreased upon status of the target.",
		"If the target is already silenced, this skill will cure it from the forementioned effect.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Silence Duration: 30sec, SP Cost: 20^000000",
		"[Lv 2] : ^777777Silence Duration: 35sec, SP Cost: 20^000000",
		"[Lv 3] : ^777777Silence Duration: 40sec, SP Cost: 20^000000",
		"[Lv 4] : ^777777Silence Duration: 45sec, SP Cost: 20^000000",
		"[Lv 5] : ^777777Silence Duration: 50sec, SP Cost: 20^000000",
		"[Lv 6] : ^777777Silence Duration: 60sec, SP Cost: 18^000000",
		"[Lv 7] : ^777777Silence Duration: 60sec, SP Cost: 16^000000",
		"[Lv 8] : ^777777Silence Duration: 60sec, SP Cost: 14^000000",
		"[Lv 9] : ^777777Silence Duration: 60sec, SP Cost: 12^000000",
		"[Lv10] : ^777777Silence Duration: 60sec, SP Cost: 10^000000"
	].join("\n");

	SkillDescription[SKID.PR_TURNUNDEAD] = [
		"Turn Undead",
		"Max Lv : 10",
		"^777777Skill Requirement : Resurrection 1, Lex Divina 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Consumes SP20 and exorcizes a single target to inflict Holy property piercing damage.",
		"If the skill fails, inflicts 30% of MATK damage.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Success rate: 2%^000000",
		"[Lv 2] : ^777777Success rate: 4%^000000",
		"[Lv 3] : ^777777Success rate: 6%^000000",
		"[Lv 4] : ^777777Success rate: 8%^000000",
		"[Lv 5] : ^777777Success rate:10%^000000",
		"[Lv 6] : ^777777Success rate:12%^000000",
		"[Lv 7] : ^777777Success rate:14%^000000",
		"[Lv 8] : ^777777Success rate:16%^000000",
		"[Lv 9] : ^777777Success rate:18%^000000",
		"[Lv10] : ^777777Success rate:20%^000000"
	].join("\n");

	SkillDescription[SKID.PR_LEXAETERNA] = [
		"Lex Aeterna",
		"Max Lv : 1",
		"^777777Skill Requirement : Lex Divina 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Consumes SP10 and weakens a single target so it can take double damage from the next incoming attack.",
		"Can not be cast on a frozen or petrified target.^000000"
	].join("\n");

	SkillDescription[SKID.PR_MAGNUS] = [
		"Magnus Exorcismus",
		"Max Lv : 10",
		"^777777Skill Requirement : Turn Undead 3, Lex Aeterna 1, Safety Wall 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Consumping 1 blue gemstone, makes a big cross.",
		"Each wave will inflict several hits of 100% Holy property magic damage.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Number of consecutive hits: 1time, Duration: 4sec^000000",
		"[Lv 2] : ^777777Number of consecutive hits: 2times, Duration: 5sec^000000",
		"[Lv 3] : ^777777Number of consecutive hits: 3times, Duration: 6sec^000000",
		"[Lv 4] : ^777777Number of consecutive hits: 4times, Duration: 7sec^000000",
		"[Lv 5] : ^777777Number of consecutive hits: 5times, Duration: 8sec^000000",
		"[Lv 6] : ^777777Number of consecutive hits: 6times, Duration: 9sec^000000",
		"[Lv 7] : ^777777Number of consecutive hits: 7times, Duration:10sec^000000",
		"[Lv 8] : ^777777Number of consecutive hits: 8times, Duration:11sec^000000",
		"[Lv 9] : ^777777Number of consecutive hits: 9times, Duration:12sec^000000",
		"[Lv10] : ^777777Number of consecutive hits:10times, Duration:13sec^000000"
	].join("\n");

	SkillDescription[SKID.WZ_FIREPILLAR] = [
		"Fire Pillar",
		"Max Lv : 10",
		"^777777Skill Requirement : Fire Wall 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Summons a pillar of flame on a targeted location that flares when triggered, inflicting piercing Fire property magic damage each hit to all enemies within its area of effect.",
		"It will vanish itself if they were not used for 30s.",
		"Up to 5 can be installed, each cast consumes a Blue Gemstone if Level 6 or higher is cast.",
		"It can't be installed if there are enemies or allies in 3*3 cells.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Hits Inflicted: 3times, Effective Range: 3X3cell^000000",
		"[Lv 2] : ^777777Hits Inflicted: 4times, Effective Range: 3X3cell^000000",
		"[Lv 3] : ^777777Hits Inflicted: 5times, Effective Range: 3X3cell^000000",
		"[Lv 4] : ^777777Hits Inflicted: 6times, Effective Range: 3X3cell^000000",
		"[Lv 5] : ^777777Hits Inflicted: 7times, Effective Range: 3X3cell^000000",
		"[Lv 6] : ^777777Hits Inflicted: 8times, Effective Range: 7X7cell^000000",
		"[Lv 7] : ^777777Hits Inflicted: 9times, Effective Range: 7X7cell^000000",
		"[Lv 8] : ^777777Hits Inflicted:10times, Effective Range: 7X7cell^000000",
		"[Lv 9] : ^777777Hits Inflicted:11times, Effective Range: 7X7cell^000000",
		"[Lv10] : ^777777Hits Inflicted:12times, Effective Range: 7X7cell^000000"
	].join("\n");

	SkillDescription[SKID.WZ_SIGHTRASHER] = [
		"Sightrasher",
		"Max Lv : 10",
		"^777777Skill Requirement : Sight 1, Lightning Bolt 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Target : ^777777Immediately^000000",
		"Description : Projects the fireball summoned from the Sight skill in 8 directions around the caster to inflict Fire property magic damage to all enemies around the caster and push them 2 cells backwards.",
		"After use, the fireball summoned to the Sight disappear..^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777MATK 120%^000000",
		"[Lv 2] : ^777777MATK 140%^000000",
		"[Lv 3] : ^777777MATK 160%^000000",
		"[Lv 4] : ^777777MATK 180%^000000",
		"[Lv 5] : ^777777MATK 200%^000000",
		"[Lv 6] : ^777777MATK 220%^000000",
		"[Lv 7] : ^777777MATK 240%^000000",
		"[Lv 8] : ^777777MATK 260%^000000",
		"[Lv 9] : ^777777MATK 280%^000000",
		"[Lv10] : ^777777MATK 300%^000000"
	].join("\n");

	SkillDescription[SKID.WZ_FIREIVY] = [
		"Fire Ivy",
		"Skill Form : ^777777Attack^bb0000(Fire)^000000",
		"Target: ^777777지면^000000",
		"Description : ^777777Damage enemies by summoning ivy vines of flame from the ground.^000000"
	].join("\n");

	SkillDescription[SKID.WZ_METEOR] = [
		"Meteor Storm",
		"Max Lv : 10",
		"^777777Skill Requirement : Thunder Storm 1, Sightrasher 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Each meteor will inflict 125% Fire property magic damage each hit to all enemies, and it has a chance of leaving enemies [Abnormal Status : Stun].",
		"Each meteor has a 7*7 area. Skill level affects hits per meteor and the number of meteors.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Meteors:2, Hits per Meteor:1time, Stun Chance: 3%^000000",
		"[Lv 2] : ^777777Meteors:3, Hits per Meteor:1time, Stun Chance: 6%^000000",
		"[Lv 3] : ^777777Meteors:3, Hits per Meteor:2times, Stun Chance: 9%^000000",
		"[Lv 4] : ^777777Meteors:4, Hits per Meteor:2times, Stun Chance:12%^000000",
		"[Lv 5] : ^777777Meteors:4, Hits per Meteor:3times, Stun Chance:15%^000000",
		"[Lv 6] : ^777777Meteors:5, Hits per Meteor:3times, Stun Chance:18%^000000",
		"[Lv 7] : ^777777Meteors:5, Hits per Meteor:4times, Stun Chance:21%^000000",
		"[Lv 8] : ^777777Meteors:6, Hits per Meteor:4times, Stun Chance:24%^000000",
		"[Lv 9] : ^777777Meteors:6, Hits per Meteor:5times, Stun Chance:27%^000000",
		"[Lv10] : ^777777Meteors:7, Hits per Meteor:5times, Stun Chance:30%^000000"
	].join("\n");

	SkillDescription[SKID.WZ_JUPITEL] = [
		"Jupitel Thunder",
		"Max Lv : 10",
		"^777777Skill Requirement : Napalm Beat 1, Lightning Bolt 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Fires a ball of crackling lightning at a single target that inflicts 100% Wind property magic damage each shock and pushes it backwards.",
		"Skill level increases the number of hits inflicted.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Hits Inflicted: 3times^000000",
		"[Lv 2] : ^777777Hits Inflicted: 4times^000000",
		"[Lv 3] : ^777777Hits Inflicted: 5times^000000",
		"[Lv 4] : ^777777Hits Inflicted: 6times^000000",
		"[Lv 5] : ^777777Hits Inflicted: 7times^000000",
		"[Lv 6] : ^777777Hits Inflicted: 8times^000000",
		"[Lv 7] : ^777777Hits Inflicted: 9times^000000",
		"[Lv 8] : ^777777Hits Inflicted:10times^000000",
		"[Lv 9] : ^777777Hits Inflicted:11times^000000",
		"[Lv10] : ^777777Hits Inflicted:12times^000000"
	].join("\n");

	SkillDescription[SKID.WZ_VERMILION] = [
		"Lord of Vermilion",
		"Max Lv : 10",
		"^777777Skill Requirement : Thunder Storm 1, Jupitel Thunder 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Calls forth destructive bolts from the skies upon a targeted location that will inflict Wind property magic damage every second to all enemies within its area of effect. It has a chance of leaving enemies blind.",
		"The chance of effect is reduced by the target's resistance to abnormal status.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777MATK 500%, Blind Chance:15%^000000",
		"[Lv 2] : ^777777MATK 600%, Blind Chance:20%^000000",
		"[Lv 3] : ^777777MATK 700%, Blind Chance:25%^000000",
		"[Lv 4] : ^777777MATK 800%, Blind Chance:30%^000000",
		"[Lv 5] : ^777777MATK 900%, Blind Chance:35%^000000",
		"[Lv 6] : ^777777MATK 1000%, Blind Chance:40%^000000",
		"[Lv 7] : ^777777MATK 1100%, Blind Chance:45%^000000",
		"[Lv 8] : ^777777MATK 1200%, Blind Chance:50%^000000",
		"[Lv 9] : ^777777MATK 1300%, Blind Chance:55%^000000",
		"[Lv10] : ^777777MATK 1400%, Blind Chance:60%^000000"
	].join("\n");

	SkillDescription[SKID.WZ_WATERBALL] = [
		"Waterball",
		"Max Lv : 5",
		"^777777Skill Requirement : Cold Bolt 1, Lightning Bolt 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Requires to be in shallow water.",
		"Inflicts Water property Magic Damage to a single target multiple times in rapid succession.",
		"The range increases upon skill level, and can also be used above skill effects such as Deluge.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 MATK 130% per 1time, Range: 1X1^000000",
		"[Lv 2] : ^777777 MATK 160% per 1time, Range: 3X3^000000",
		"[Lv 3] : ^777777 MATK 190% per 1time, Range: 3X3^000000",
		"[Lv 4] : ^777777 MATK 220% per 1time, Range: 5X5^000000",
		"[Lv 5] : ^777777 MATK 250% per 1time, Range: 5X5^000000"
	].join("\n");

	SkillDescription[SKID.WZ_ICEWALL] = [
		"Icewall",
		"Max Lv : 10",
		"^777777Skill Requirement : Stone Curse 1, Frost Diver 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Creates a wall of ice in a targeted location to impede movement.",
		"can't go through this ice wall, but can do long-range attacks such as arrow attacks.",
		"Depending on the skill level, durability exists, and when installed, durability is reduced by 50 per second",
		"When the durability reaches zero, it disappears.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Durability: 400^000000",
		"[Lv 2] : ^777777Durability: 600^000000",
		"[Lv 3] : ^777777Durability: 800^000000",
		"[Lv 4] : ^777777Durability:1000^000000",
		"[Lv 5] : ^777777Durability:1200^000000",
		"[Lv 6] : ^777777Durability:1400^000000",
		"[Lv 7] : ^777777Durability:1600^000000",
		"[Lv 8] : ^777777Durability:1800^000000",
		"[Lv 9] : ^777777Durability:2000^000000",
		"[Lv10] : ^777777Durability:2200^000000"
	].join("\n");

	SkillDescription[SKID.WZ_FROSTNOVA] = [
		"Frost Nova",
		"Max Lv : 10",
		"^777777Skill Requirement : Frost Diver 1, Icewall 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Raises ice spikes around the user that will inflict Water property magic damage to all enemies around the user. It has a chance of leaving enemies frozen.",
		"The chance of effect and cast time increases upon skill level.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Cast Time: 1.5sec, Chance of frozen: 38%^000000",
		"[Lv 2] : ^777777Cast Time: 3.0sec, Chance of frozen: 43%^000000",
		"[Lv 3] : ^777777Cast Time: 4.5sec, Chance of frozen: 48%^000000",
		"[Lv 4] : ^777777Cast Time: 6.0sec, Chance of frozen: 53%^000000",
		"[Lv 5] : ^777777Cast Time: 7.5sec, Chance of frozen: 58%^000000",
		"[Lv 6] : ^777777Cast Time: 9.0sec, Chance of frozen: 63%^000000",
		"[Lv 7] : ^777777Cast Time:10.5sec, Chance of frozen: 68%^000000",
		"[Lv 8] : ^777777Cast Time:12.0sec, Chance of frozen: 73%^000000",
		"[Lv 9] : ^777777Cast Time:13.5sec, Chance of frozen: 78%^000000",
		"[Lv10] : ^777777Cast Time:15.0sec, Chance of frozen: 83%^000000"
	].join("\n");

	SkillDescription[SKID.WZ_STORMGUST] = [
		"Storm Gust",
		"Max Lv : 10",
		"^777777Skill Requirement : Frost Diver 1, Jupitel 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Summons a vicious blizzard upon a targeted location that will inflict Water property magic damage every half a second to all enemies within its area of effect.",
		"It lasts for 4.5s, hits every 0.45s and push them 2 cells.",
		"It has a chance of leaving enemies frozen,and frozen enemies will not take further damage from this skill.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 MATK 120%^000000 per 1time",
		"[Lv 2] : ^777777 MATK 170%^000000 per 1time",
		"[Lv 3] : ^777777 MATK 220%^000000 per 1time",
		"[Lv 4] : ^777777 MATK 270%^000000 per 1time",
		"[Lv 5] : ^777777 MATK 320%^000000 per 1time",
		"[Lv 6] : ^777777 MATK 370%^000000 per 1time",
		"[Lv 7] : ^777777 MATK 420%^000000 per 1time",
		"[Lv 8] : ^777777 MATK 470%^000000 per 1time",
		"[Lv 9] : ^777777 MATK 520%^000000 per 1time",
		"[Lv10] : ^777777 MATK 570%^000000 per 1time"
	].join("\n");

	SkillDescription[SKID.WZ_EARTHSPIKE] = [
		"Earth Spike",
		"Max Lv : 5",
		"9^777777Skill Requirement : Stone Curse 1^000000",
		"4190^777777Skill Requirement : Stone Curse 1^000000",
		"16^777777Skill Requirement : Seismic Weapon 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Commands the ground beneath a single target to rise into spikes, where each spike will inflict 200% Earth property magic damage.",
		"The number of consecutive hits increases with skill level.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 1time^000000",
		"[Lv 2] : ^777777ATK 2time^000000",
		"[Lv 3] : ^777777ATK 3time^000000",
		"[Lv 4] : ^777777ATK 4time^000000",
		"[Lv 5] : ^777777ATK 5time^000000"
	].join("\n");

	SkillDescription[SKID.WZ_HEAVENDRIVE] = [
		"Heaven's Drive",
		"Max Lv : 5",
		"9^777777Skill Requirement : Earth Spike 3^000000",
		"4190^777777Skill Requirement : Earth Spike 3^000000",
		"16^777777Skill Requirement : Earth Spike 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Commands the ground in a targeted location to rise into spikes, where each series of spikes will inflict Earth property magic damage to all enemies within its area of effect.",
		"This skill is capable of hitting hidden enemies.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777MATK 125%^000000",
		"[Lv 2] : ^777777MATK 250%^000000",
		"[Lv 3] : ^777777MATK 375%^000000",
		"[Lv 4] : ^777777MATK 500%^000000",
		"[Lv 5] : ^777777MATK 625%^000000"
	].join("\n");

	SkillDescription[SKID.WZ_QUAGMIRE] = [
		"Quagmire",
		"Max Lv : 5",
		"^777777Skill Requirement : Heaven's Drive 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Turns a targeted location into a marshland that reduces Movement Speed, AGI and DEX of all enemies within its area of effect.",
		"This skill cannot reduce the affected stats of monsters by more than 50%, and those of players by more than 25%.",
		"Also removes certain skill effects, such as Increase AGI, Twohand Quicken, Wind Walker and Adrenaline Rush.",
		"A Maximum of three quagmires can be placed before the first one expires.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration: 5sec, AGI/DEXReduction: 10%^000000",
		"[Lv 2] : ^777777Duration:10sec, AGI/DEXReduction: 20%^000000",
		"[Lv 3] : ^777777Duration:15sec, AGI/DEXReduction: 30%^000000",
		"[Lv 4] : ^777777Duration:20sec, AGI/DEXReduction: 40%^000000",
		"[Lv 5] : ^777777Duration:25sec, AGI/DEXReduction: 50%^000000"
	].join("\n");

	SkillDescription[SKID.WZ_ESTIMATION] = [
		"Monster Property",
		"Max Lv : 1",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Analyzes a single target, revealing information.If the user is in a party, all party members can see the target's information.^000000"
	].join("\n");

	SkillDescription[SKID.BS_IRON] = [
		"Iron Tempering",
		"Max Lv : 5",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enables to create 1 refined Iron , 1 Iron ore by consuming a Mini Furnace.",
		"Skill level affects success rate.",
		"DEX and LUK additionally affect success rate.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 success rate: 45%^000000",
		"[Lv 2] : ^777777 success rate: 50%^000000",
		"[Lv 3] : ^777777 success rate: 55%^000000",
		"[Lv 4] : ^777777 success rate: 60%^000000",
		"[Lv 5] : ^777777 success rate: 65%^000000"
	].join("\n");

	SkillDescription[SKID.BS_STEEL] = [
		"Steel Tempering",
		"Max Lv : 5",
		"^777777Skill Requirement : Iron Tempering 1^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enables to create 1 steel , 5 Iron and 1 Coal by consuming a Mini Furnace.",
		"Skill level affects success rate.",
		"DEX and LUK additionally affect success rate.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 success rate: 35%^000000",
		"[Lv 2] : ^777777 success rate: 40%^000000",
		"[Lv 3] : ^777777 success rate: 45%^000000",
		"[Lv 4] : ^777777 success rate: 50%^000000",
		"[Lv 5] : ^777777 success rate: 55%^000000"
	].join("\n");

	SkillDescription[SKID.BS_ENCHANTEDSTONE] = [
		"Enchanted Stone Craft",
		"Max Lv : 5",
		"^777777Skill Requirement : Iron Tempering 1^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enables to create elemental stones by consuming a Mini Furnace and 10 elemental ores.",
		"Skill level affects success rate.",
		"DEX and LUK additionally affect success rate.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 success rate: 15%^000000",
		"[Lv 2] : ^777777 success rate: 20%^000000",
		"[Lv 3] : ^777777 success rate: 25%^000000",
		"[Lv 4] : ^777777 success rate: 30%^000000",
		"[Lv 5] : ^777777 success rate: 35%^000000"
	].join("\n");

	SkillDescription[SKID.BS_ORIDEOCON] = [
		"Oridecon Research",
		"Max Lv : 5",
		"^777777Skill Requirement : Enchanted Stone Craft 1^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : Enhances the success rate of forging weapons with Oridecon.^000000"
	].join("\n");

	SkillDescription[SKID.BS_DAGGER] = [
		"Smith Dagger",
		"Max Lv : 3",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enables to forge various Dagger class weapons by consuming a forging hammer and all required items(steel, gold, oridecon hammer).",
		"Required to possess of materials and items required for production.",
		"Skill level affects success rate.",
		"DEX and LUK additionally affect success rate.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 success rate: 5%^000000",
		"[Lv 2] : ^777777 success rate: 10%^000000",
		"[Lv 3] : ^777777 success rate: 15%^000000"
	].join("\n");

	SkillDescription[SKID.BS_SWORD] = [
		"Smith Sword",
		"Max Lv : 3",
		"^777777Skill Requirement : Smith Dagger 1^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enables to forge various One-handed swords by consuming a forging hammer and all required items(steel, gold, oridecon hammer).",
		"Required to possess of materials and items required for production.",
		"Skill level affects success rate.",
		"DEX and LUK additionally affect success rate.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 success rate: 5%^000000",
		"[Lv 2] : ^777777 success rate: 10%^000000",
		"[Lv 3] : ^777777 success rate: 15%^000000"
	].join("\n");

	SkillDescription[SKID.BS_TWOHANDSWORD] = [
		"Smith Two-handed Sword",
		"Max Lv : 3",
		"^777777Skill Requirement : Smith Sword 1^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enables to forge various two-handed swords class weapons by consuming a forging hammer and all required items(steel, gold, oridecon hammer).",
		"Required to possess of materials and items required for production.",
		"Skill level affects success rate.",
		"DEX and LUK additionally affect success rate.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 success rate: 5%^000000",
		"[Lv 2] : ^777777 success rate: 10%^000000",
		"[Lv 3] : ^777777 success rate: 15%^000000"
	].join("\n");

	SkillDescription[SKID.BS_AXE] = [
		"Smith Axe",
		"Max Lv : 3",
		"^777777Skill Requirement : Smith Sword 2^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enables to forge various Axe class weapons by consuming a forging hammer and all required items(steel, gold, oridecon hammer).",
		"Required to possess of materials and items required for production.",
		"Skill level affects success rate.",
		"DEX and LUK additionally affect success rate.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 success rate: 5%^000000",
		"[Lv 2] : ^777777 success rate: 10%^000000",
		"[Lv 3] : ^777777 success rate: 15%^000000"
	].join("\n");

	SkillDescription[SKID.BS_MACE] = [
		"Smith Mace",
		"Max Lv : 3",
		"^777777Skill Requirement : Smith Brass Knuckle 1^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enables to forge various Mace class weapons by consuming a forging hammer and all required items(steel, gold, oridecon hammer).",
		"Required to possess of materials and items required for production.",
		"Skill level affects success rate.",
		"DEX and LUK additionally affect success rate.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 success rate: 5%^000000",
		"[Lv 2] : ^777777 success rate: 10%^000000",
		"[Lv 3] : ^777777 success rate: 15%^000000"
	].join("\n");

	SkillDescription[SKID.BS_KNUCKLE] = [
		"Smith Brass Knuckle",
		"Max Lv : 3",
		"^777777Skill Requirement : Smith Dagger 1^000000",
		"Skill Form : ^000099Passive^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enables to forge various Knuckle class weapons by consuming a forging hammer and all required items(steel, gold, oridecon hammer).",
		"Required to possess of materials and items required for production.",
		"Skill level affects success rate.",
		"DEX and LUK additionally affect success rate.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 success rate: 5%^000000",
		"[Lv 2] : ^777777 success rate: 10%^000000",
		"[Lv 3] : ^777777 success rate: 15%^000000"
	].join("\n");

	SkillDescription[SKID.BS_SPEAR] = [
		"Smith Spear",
		"Max Lv : 3",
		"^777777Skill Requirement : Smith Dagger 2^000000",
		"Skill Form : ^000099Passive^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enables to forge various Spear class weapons by consuming a forging hammer and all required items(steel, gold, oridecon hammer).",
		"Required to possess of materials and items required for production.",
		"Skill level affects success rate.",
		"DEX and LUK additionally affect success rate.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 success rate: 5%^000000",
		"[Lv 2] : ^777777 success rate: 10%^000000",
		"[Lv 3] : ^777777 success rate: 15%^000000"
	].join("\n");

	SkillDescription[SKID.BS_HILTBINDING] = [
		"Hilt Binding",
		"Max Lv : 1",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enhances STR and attack by 1 and 4, respectively.",
		"This skill also extends the duration of Adrenaline Rush, Power-Thrust and Weapon Perfection skills by 10%.^000000"
	].join("\n");

	SkillDescription[SKID.BS_FINDINGORE] = [
		"Finding Ore",
		"Max Lv : 1",
		"^777777Skill Requirement : Hilt Binding1, Steel Tempering 1^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Gives a very low chance of monsters dropping an ore item when defeated by the player.^000000"
	].join("\n");

	SkillDescription[SKID.BS_WEAPONRESEARCH] = [
		"Weaponry Research",
		"Max Lv : 10",
		"^777777Skill Requirement : Hilt Binding 1^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Raises the success rate of forging.",
		"This skill also raises Physical Attack (Weapon Mastery) and the accuracy with any weapon.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Acurracy Bonus: 2, Damage + 2^000000",
		"[Lv 2] : ^777777Acurracy Bonus: 4, Damage + 4^000000",
		"[Lv 3] : ^777777Acurracy Bonus: 5, Damage + 6^000000",
		"[Lv 4] : ^777777Acurracy Bonus: 6, Damage + 8^000000",
		"[Lv 5] : ^777777Acurracy Bonus:10, Damage +10^000000",
		"[Lv 6] : ^777777Acurracy Bonus:12, Damage +12^000000",
		"[Lv 7] : ^777777Acurracy Bonus:14, Damage +14^000000",
		"[Lv 8] : ^777777Acurracy Bonus:16, Damage +16^000000",
		"[Lv 9] : ^777777Acurracy Bonus:18, Damage +18^000000",
		"[Lv10] : ^777777Acurracy Bonus:20, Damage +20^000000"
	].join("\n");

	SkillDescription[SKID.BS_REPAIRWEAPON] = [
		"Repair Weapon",
		"Max Lv : 1",
		"^777777Skill Requirement : Weaponry Research 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777 Consumes SPS and repairs the damaged equipment of a single target, allowing it to be usable again.",
		"The materials required for repair vary depending on the type of equipment.^000000",
		"^ffffff_^000000",
		"[Armor Skill Form] : ^777777 1 Steel^000000",
		"[Lv 1 Weapon] : ^777777 1 Iron Ore^000000",
		"[Lv 2 Weapon] : ^777777 1 Iron^000000",
		"[Lv 3 Weapon] : ^777777 1 Steel^000000",
		"[Lv 4 Weapon] : ^777777 1 Rough Oridecon^000000"
	].join("\n");

	SkillDescription[SKID.BS_SKINTEMPER] = [
		"Skin Tempering",
		"Max Lv : 5",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enhances resistance to Fire and Neutral property damage.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Fire Res + 4%, Neutral Res + 1%^000000",
		"[Lv 2] : ^777777Fire Res + 8%, Neutral Res + 2%^000000",
		"[Lv 3] : ^777777Fire Res +12%, Neutral Res + 3%^000000",
		"[Lv 4] : ^777777Fire Res +16%, Neutral Res + 4%^000000",
		"[Lv 5] : ^777777Fire Res +20%, Neutral Res + 5%^000000"
	].join("\n");

	SkillDescription[SKID.BS_HAMMERFALL] = [
		"Hammerfall",
		"Max Lv : 5",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Slams a targeted location with the equipped weapon.",
		"has a chance of leaving all enemies within the area of effect stunned.",
		"Enemy's VIT lowers the chance of stun and duration.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Stun Chance: 30%^000000",
		"[Lv 2] : ^777777Stun Chance: 40%^000000",
		"[Lv 3] : ^777777Stun Chance: 50%^000000",
		"[Lv 4] : ^777777Stun Chance: 60%^000000",
		"[Lv 5] : ^777777Stun Chance: 70%^000000"
	].join("\n");

	SkillDescription[SKID.BS_ADRENALINE] = [
		"Adrenaline Rush",
		"Max Lv : 5",
		"^777777Skill Requirement : Hammerfall 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^777777 the user and all party members ^000000",
		"Description : ^777777Axe, Mace Skill Form.",
		"Places a temporary buff on the user and all party members that increases Attack Speed by 30% with Axe and Mace class weapon.",
		"The attack speed of Blacksmiths is increased by 30% while the attack speed of other job classes is increased by 25%.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration : 30sec, HIT + 8^000000",
		"[Lv 2] : ^777777Duration : 60sec, HIT +11^000000",
		"[Lv 3] : ^777777Duration : 90sec, HIT +14^000000",
		"[Lv 4] : ^777777Duration :120sec, HIT +17^000000",
		"[Lv 5] : ^777777Duration :150sec, HIT +20^000000"
	].join("\n");

	SkillDescription[SKID.BS_WEAPONPERFECT] = [
		"Weapon Perfection",
		"Max Lv : 5",
		"^777777Skill Requirement : Adrenaline Rush 2, Weaponry Research 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^777777 the user and all party members^000000",
		"Description : ^777777Removes the size penalty associated with the equipped weapon temporarily.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration : 10sec, SP Consumption:18^000000",
		"[Lv 2] : ^777777Duration : 20sec, SP Consumption:16^000000",
		"[Lv 3] : ^777777Duration : 30sec, SP Consumption:14^000000",
		"[Lv 4] : ^777777Duration : 40sec, SP Consumption:12^000000",
		"[Lv 5] : ^777777Duration : 50sec, SP Consumption:10^000000"
	].join("\n");

	SkillDescription[SKID.BS_OVERTHRUST] = [
		"Power Thrust(Over Thrust)",
		"Max Lv : 5",
		"^777777Skill Requirement : Adrenaline Rush 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^777777 the user and all party members^000000",
		"Description : ^777777Boosts attack of the user and party members temporarily.",
		"the increase in itself and the party members is different.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Asset growth + 5%, Party member increase: + 5%^000000",
		"[Lv 2] : ^777777Asset growth +10%, Party member increase: + 5%^000000",
		"[Lv 3] : ^777777Asset growth +15%, Party member increase: +10%^000000",
		"[Lv 4] : ^777777Asset growth +20%, Party member increase: +10%^000000",
		"[Lv 5] : ^777777Asset growth +25%, Party member increase: +15%^000000"
	].join("\n");

	SkillDescription[SKID.BS_MAXIMIZE] = [
		"Maximize Power",
		"Max Lv : 5",
		"^777777Skill Requirement : Weapon Perfection 3, Power Thrust 2^000000",
		"Skill Form : ^993300Active(toggle)^000000",
		"Type : ^777777Buff^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Alters the damage variance of the equipped weapon to inflict the Maximum of its damage by consuming SP10.",
		"Maintaining this skill active will drain SP. need to use this skill again in order to release this status.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 SP 1 Consumption^000000 per 1sec",
		"[Lv 2] : ^777777 SP 1 Consumption^000000 per 2sec",
		"[Lv 3] : ^777777 SP 1 Consumption^000000 per 3sec",
		"[Lv 4] : ^777777 SP 1 Consumption^000000 per 4sec",
		"[Lv 5] : ^777777 SP 1 Consumption^000000 per 5sec"
	].join("\n");

	SkillDescription[SKID.HT_SKIDTRAP] = [
		"Skid Trap",
		"Max Lv : 5",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Installation^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Sets a trap that causes any enemy that steps on it to slip and slide in a certain direction.",
		"After the slide, the enemy will be immobilized for 3 seconds.",
		"The untapped trap is uninstalled and returned to the inventory after the operating time.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Distance: 6cell, Operating time:300sec^000000",
		"[Lv 2] : ^777777Distance: 7cell, Operating time:240sec^000000",
		"[Lv 3] : ^777777Distance: 8cell, Operating time:180sec^000000",
		"[Lv 4] : ^777777Distance: 9cell, Operating time:120sec^000000",
		"[Lv 5] : ^777777Distance:10cell, Operating time: 60sec^000000"
	].join("\n");

	SkillDescription[SKID.HT_LANDMINE] = [
		"Land Mine",
		"Max Lv : 5",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Installation^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Sets a trap that triggers an explosion from below when an enemy steps on it",
		"inflicting piercing Earth property damage to all enemies within its area of effect. Damage increases upon skill level, user's base level, DEX and INT.",
		"The untapped trap is uninstalled and returned to the inventory after the operating time.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Operating time:200sec^000000",
		"[Lv 2] : ^777777Operating time:160sec^000000",
		"[Lv 3] : ^777777Operating time:120sec^000000",
		"[Lv 4] : ^777777Operating time: 80sec^000000",
		"[Lv 5] : ^777777Operating time: 40sec^000000"
	].join("\n");

	SkillDescription[SKID.HT_ANKLESNARE] = [
		"Anklesnare",
		"Max Lv : 5",
		"^777777Skill Requirement : Skid Trap 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Installation^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Sets a trap on a targeted location that will catch and immobilize any enemy that steps on it.",
		"The untapped trap is uninstalled and returned to the inventory after the operating time.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Operating time:250sec^000000",
		"[Lv 2] : ^777777Operating time:200sec^000000",
		"[Lv 3] : ^777777Operating time:150sec^000000",
		"[Lv 4] : ^777777Operating time:100sec^000000",
		"[Lv 5] : ^777777Operating time: 50sec^000000"
	].join("\n");

	SkillDescription[SKID.HT_SHOCKWAVE] = [
		"Shockwave Trap",
		"Max Lv : 5",
		"^777777Skill Requirement : Anklesnare 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Installation^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Sets a trap that releases a shockwave when an enemy steps on it, draining the SP of all enemies within the area of effect.",
		"The untapped trap is uninstalled and returned to the inventory after the operating time.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777SP 20% Drain, Operating time:200sec^000000",
		"[Lv 2] : ^777777SP 35% Drain, Operating time:160sec^000000",
		"[Lv 3] : ^777777SP 50% Drain, Operating time:120sec^000000",
		"[Lv 4] : ^777777SP 65% Drain, Operating time: 80sec^000000",
		"[Lv 5] : ^777777SP 80% Drain, Operating time: 40sec^000000"
	].join("\n");

	SkillDescription[SKID.HT_SANDMAN] = [
		"Sandman",
		"Max Lv : 5",
		"^777777Skill Requirement : Flasher 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Installation^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Sets a trap that releases sedative when an enemy steps on it, which has a chance of leaving all enemies within its area of effect sleeping.",
		"The untapped trap is uninstalled and returned to the inventory after the operating time.",
		"The chance of effect is reduced by the target's resistance to abnormal status.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Chance of Effect: 50%, Operating time:150sec^000000",
		"[Lv 2] : ^777777Chance of Effect: 60%, Operating time:120sec^000000",
		"[Lv 3] : ^777777Chance of Effect: 70%, Operating time: 90sec^000000",
		"[Lv 4] : ^777777Chance of Effect: 80%, Operating time: 60sec^000000",
		"[Lv 5] : ^777777Chance of Effect: 90%, Operating time: 30sec^000000"
	].join("\n");

	SkillDescription[SKID.HT_FLASHER] = [
		"Flasher",
		"Max Lv : 5",
		"^777777Skill Requirement : Skid Trap 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Installation^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Sets 2 traps on a targeted location that loose a blinding flash when an enemy steps on it, which has a chance of leaving all enemies within the area of effect blind.",
		"The chance of effect is reduced by the target's resistance to abnormal status.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Operating time:150sec^000000\t",
		"[Lv 2] : ^777777Operating time:120sec^000000",
		"[Lv 3] : ^777777Operating time: 90sec^000000",
		"[Lv 4] : ^777777Operating time: 60sec^000000",
		"[Lv 5] : ^777777Operating time: 30sec^000000"
	].join("\n");

	SkillDescription[SKID.HT_FREEZINGTRAP] = [
		"Freezing Trap",
		"Max Lv : 5",
		"^777777Skill Requirement : Flasher 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Installation^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Sets 2 traps that release an icy blast when an enemy steps on it, inflicting piercing Water property physical damage to all enemies within its area of effect.",
		"The chance of effect is reduced by the target's resistance to abnormal status.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Operating time:150sec^000000",
		"[Lv 2] : ^777777Operating time:120sec^000000",
		"[Lv 3] : ^777777Operating time: 90sec^000000",
		"[Lv 4] : ^777777Operating time: 60sec^000000",
		"[Lv 5] : ^777777Operating time: 30sec^000000"
	].join("\n");

	SkillDescription[SKID.HT_BLASTMINE] = [
		"Blast Mine",
		"Max Lv : 5",
		"^777777Skill Requirement : Sandman 1, Land Mine 1, Freezing Trap 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Installation^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Set 2 traps that will explode after the trap duration expires or when an enemy steps on it",
		"inflicting piercing Wind property damage to all enemies within its area of effect.",
		"Blast Mine can be moved by arbitrary attack before the end of the operating time.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Operating time:25sec^000000",
		"[Lv 2] : ^777777Operating time:20sec^000000",
		"[Lv 3] : ^777777Operating time:15sec^000000",
		"[Lv 4] : ^777777Operating time:10sec^000000",
		"[Lv 5] : ^777777Operating time: 5sec^000000"
	].join("\n");

	SkillDescription[SKID.HT_CLAYMORETRAP] = [
		"Claymore Trap",
		"Max Lv : 5",
		"^777777Skill Requirement : Blast Mine 1, Shockwave Trap 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Installation^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Sets 2 traps that will explode when an enemy steps on it, inflicting piercing Fire property damage to all enemies within its area of effect.",
		"Cremore traps can be directly attacked and blown up.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Operating time: 20sec^000000",
		"[Lv 2] : ^777777Operating time: 40sec^000000",
		"[Lv 3] : ^777777Operating time: 60sec^000000",
		"[Lv 4] : ^777777Operating time: 80sec^000000",
		"[Lv 5] : ^777777Operating time:100sec^000000"
	].join("\n");

	SkillDescription[SKID.HT_REMOVETRAP] = [
		"Remove Trap",
		"Max Lv : 1",
		"11^777777Skill Requirement : Land Mine 1^000000",
		"17^777777Skill Requirement : Double Strafe5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Installed trap^000000",
		"Description : ^777777Removes a trap that has been set on the ground by consuming SPS.",
		"When the trap is removed, the item is returned to the inventory.^000000"
	].join("\n");

	SkillDescription[SKID.HT_TALKIEBOX] = [
		"Talkie Box",
		"Max Lv : 1",
		"^777777Skill Requirement : Remove Trap 1, Shockwave Trap 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Installation^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Sets a trap on a targeted location that displays a prerecorded text message to any player that steps on it.",
		"A message is printed on the head of the target who stepped on the trap, and the trap disappears.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Operating time:600sec^000000"
	].join("\n");

	SkillDescription[SKID.HT_BEASTBANE] = [
		"Beastbane",
		"Max Lv : 10",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enhances attack (Weapon Mastery) against Brute and Insect race monsters.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Damage: +4^000000",
		"[Lv 2] : ^777777Damage: +8^000000",
		"[Lv 3] : ^777777Damage: +12^000000",
		"[Lv 4] : ^777777Damage: +16^000000",
		"[Lv 5] : ^777777Damage: +20^000000",
		"[Lv 6] : ^777777Damage: +24^000000",
		"[Lv 7] : ^777777Damage: +28^000000",
		"[Lv 8] : ^777777Damage: +32^000000",
		"[Lv 9] : ^777777Damage: +36^000000",
		"[Lv10] : ^777777Damage: +40^000000"
	].join("\n");

	SkillDescription[SKID.HT_FALCON] = [
		"Falconry Mastery",
		"Max Lv : 1",
		"^777777Skill Requirement : Beastbane 1^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enables Hunters to command a Falcon.",
		"Additionally, the falcon flutes can be used to load falcons.^000000"
	].join("\n");

	SkillDescription[SKID.HT_STEELCROW] = [
		"Steel Crow",
		"Max Lv : 10",
		"^777777Skill Requirement : Blitz Beat 5^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enhances damage inflicted with Blitz Beat and Falcon Assault.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Damage: +6^000000",
		"[Lv 2] : ^777777Damage: +12^000000",
		"[Lv 3] : ^777777Damage: +18^000000",
		"[Lv 4] : ^777777Damage: +24^000000",
		"[Lv 5] : ^777777Damage: +30^000000",
		"[Lv 6] : ^777777Damage: +36^000000",
		"[Lv 7] : ^777777Damage: +42^000000",
		"[Lv 8] : ^777777Damage: +48^000000",
		"[Lv 9] : ^777777Damage: +54^000000",
		"[Lv10] : ^777777Damage: +60^000000"
	].join("\n");

	SkillDescription[SKID.HT_BLITZBEAT] = [
		"Blitz Beat",
		"Max Lv : 5",
		"^777777Skill Requirement : Falconly Mastery 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777special physics^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Commands the Falcon to dive at a single target and strike repeatedly to inflict piercing ranged damage to all enemies in a 3x3 area around the target.",
		"Falcon damage increases with owner's AGI and DEX.",
		"For every 3 points of LUK the chance of auto-cast is increased by 1%.",
		"Falcon has a range equal to 3 cells added to the range of Vulture's Eye skill learned by the caster.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Number of consecutive hits: 1times, SP Consumption: 10^000000",
		"[Lv 2] : ^777777Number of consecutive hits: 2times, SP Consumption: 13^000000",
		"[Lv 3] : ^777777Number of consecutive hits: 3times, SP Consumption: 16^000000",
		"[Lv 4] : ^777777Number of consecutive hits: 4times, SP Consumption: 19^000000",
		"[Lv 5] : ^777777Number of consecutive hits: 5times, SP Consumption: 22^000000"
	].join("\n");

	SkillDescription[SKID.HT_DETECTING] = [
		"Detecting",
		"Max Lv : 4",
		"^777777Skill Requirement : Improve Concentration 1, Falconly Mastery 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Commands the Falcon to scout a targeted location to reveal all hidden enemies in a 7x7 area by consuming SP8.",
		"Depending on skill level, the range that can send Falcon increases.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 Range : 2cell^000000",
		"[Lv 2] : ^777777 Range : 4cell^000000",
		"[Lv 3] : ^777777 Range : 6cell^000000",
		"[Lv 4] : ^777777 Range : 8cell^000000"
	].join("\n");

	SkillDescription[SKID.HT_SPRINGTRAP] = [
		"Spring Trap",
		"Max Lv : 5",
		"^777777Skill Requirement : Remove Trap 1, Falconly Mastery^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Commands the Falcon to remove a set trap from a distance by consuming SP10.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 Range : 4cell^000000",
		"[Lv 2] : ^777777 Range : 5cell^000000",
		"[Lv 3] : ^777777 Range : 6cell^000000",
		"[Lv 4] : ^777777 Range : 7cell^000000",
		"[Lv 5] : ^777777 Range : 8cell^000000"
	].join("\n");

	SkillDescription[SKID.AS_RIGHT] = [
		"Right hand Mastery",
		"Max Lv : 5",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Restores right-hand damage that is reduced when using two-hand weapons.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Right Hand Damage: 60%^000000",
		"[Lv 2] : ^777777Right Hand Damage: 70%^000000",
		"[Lv 3] : ^777777Right Hand Damage: 80%^000000",
		"[Lv 4] : ^777777Right Hand Damage: 90%^000000",
		"[Lv 5] : ^777777Right Hand Damage:100%^000000"
	].join("\n");

	SkillDescription[SKID.AS_LEFT] = [
		"Left hand Mastery",
		"Max Lv : 5",
		"^777777Skill Requirement : Righthand Mastery 2^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Restores right-hand damage that is reduced when using two-hand weapons.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Left Hand Damage: 40%^000000",
		"[Lv 2] : ^777777Left Hand Damage: 50%^000000",
		"[Lv 3] : ^777777Left Hand Damage: 60%^000000",
		"[Lv 4] : ^777777Left Hand Damage: 70%^000000",
		"[Lv 5] : ^777777Left Hand Damage: 80%^000000"
	].join("\n");

	SkillDescription[SKID.AS_KATAR] = [
		"Katar Matery",
		"Max Lv : 10",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enhances attack (Weapon Mastery) with Katar class weapons.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Damage: +3^000000",
		"[Lv 2] : ^777777Damage: +6^000000",
		"[Lv 3] : ^777777Damage: +9^000000",
		"[Lv 4] : ^777777Damage: +12^000000",
		"[Lv 5] : ^777777Damage: +15^000000",
		"[Lv 6] : ^777777Damage: +18^000000",
		"[Lv 7] : ^777777Damage: +21^000000",
		"[Lv 8] : ^777777Damage: +24^000000",
		"[Lv 9] : ^777777Damage: +27^000000",
		"[Lv10] : ^777777Damage: +30^000000"
	].join("\n");

	SkillDescription[SKID.AS_CLOAKING] = [
		"Cloaking",
		"Max Lv : 10",
		"^777777Skill Requirement : Hiding 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Conceals oneself and allows movement in this state.",
		"It can move quickly when it is attached to the wall, but it slows down when it is not attached.",
		"For levels 1 and 2, this skill can only be used if the user is adjacent to a wall.",
		"Maintaining this skill active will drain SP.",
		"Demon, Insect race monsters and boss monsters can find.^000000",
		"After the effect is released, the item cannot be picked up for 3 seconds.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Off Wall:Not available, On Wall:100%, per0.5sec SP1^000000per0.5sec",
		"[Lv 2] : ^777777Off Wall:Not available, On Wall:103%, SP1^000000per1.0sec",
		"[Lv 3] : ^777777Off Wall: 79%, On Wall:106%, SP1^000000per2.0sec",
		"[Lv 4] : ^777777Off Wall: 82%, On Wall:109%, SP1^000000per3.0sec",
		"[Lv 5] : ^777777Off Wall: 85%, On Wall:112%, SP1^000000per4.0sec",
		"[Lv 6] : ^777777Off Wall: 88%, On Wall:115%, SP1^000000per5.0sec",
		"[Lv 7] : ^777777Off Wall: 91%, On Wall:118%, SP1^000000per6.0sec",
		"[Lv 8] : ^777777Off Wall: 94%, On Wall:121%, SP1^000000per7.0sec",
		"[Lv 9] : ^777777Off Wall: 97%, On Wall:124%, SP1^000000per8.0sec",
		"[Lv10] : ^777777Off Wall:100%, On Wall:125%, SP1^000000per9.0sec"
	].join("\n");

	SkillDescription[SKID.AS_SONICBLOW] = [
		"Sonic Blow",
		"Max Lv : 10",
		"^777777Skill Requirement : Katar Matery 4^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Only for Katar.",
		"Directs a flurry of rapid slices with the equipped katar at a single target while spinning it to inflict physical damage.",
		"It has a chance of leaving the target stunned.",
		"The chance of stun is reduced by the target's resistance to abnormal status.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 300%, Stun Chance: 12%^000000",
		"[Lv 2] : ^777777ATK 400%, Stun Chance: 14%^000000",
		"[Lv 3] : ^777777ATK 500%, Stun Chance: 16%^000000",
		"[Lv 4] : ^777777ATK 600%, Stun Chance: 18%^000000",
		"[Lv 5] : ^777777ATK 700%, Stun Chance: 20%^000000",
		"[Lv 6] : ^777777ATK 800%, Stun Chance: 22%^000000",
		"[Lv 7] : ^777777ATK 900%, Stun Chance: 24%^000000",
		"[Lv 8] : ^777777ATK1000%, Stun Chance: 26%^000000",
		"[Lv 9] : ^777777ATK1100%, Stun Chance: 28%^000000",
		"[Lv10] : ^777777ATK1200%, Stun Chance: 30%^000000"
	].join("\n");

	SkillDescription[SKID.AS_GRIMTOOTH] = [
		"Grimtooth",
		"Max Lv : 5",
		"^777777Skill Requirement : Cloaking 2, Sonic Blow 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777PATK^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Only for Katar.",
		"Strikes a single target with the equipped katar while hidden at a distance to inflict physical damage to all enemies within the area of effect by consuming SP3.",
		"Levels 1 and 2 inflict close range damage while Levels 3 and above inflict ranged damage .",
		"For normal monsters, movement speed of targets that take damage are reduced by 50% for 1 second.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 120%, Range: 2cell^000000",
		"[Lv 2] : ^777777ATK 140%, Range: 3cell^000000",
		"[Lv 3] : ^777777ATK 160%, Range: 4cell^000000",
		"[Lv 4] : ^777777ATK 180%, Range: 5cell^000000",
		"[Lv 5] : ^777777ATK 200%, Range: 6cell^000000"
	].join("\n");

	SkillDescription[SKID.AS_ENCHANTPOISON] = [
		"Enchant Poison",
		"Max Lv : 10",
		"^777777Skill Requirement : Envenom 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^777777the user and 1 party member^000000",
		"Description : ^777777Endows a single target's equipped weapon with the Poison property temporarily.",
		"This skill also gives the chance of leaving enemies poisoned while physically attacking.",
		"Switching to a different weapon will cancel this effect.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration: 30sec^000000",
		"[Lv 2] : ^777777Duration: 45sec^000000",
		"[Lv 3] : ^777777Duration: 60sec^000000",
		"[Lv 4] : ^777777Duration: 75sec^000000",
		"[Lv 5] : ^777777Duration: 90sec^000000",
		"[Lv 6] : ^777777Duration:105sec^000000",
		"[Lv 7] : ^777777Duration:120sec^000000",
		"[Lv 8] : ^777777Duration:135sec^000000",
		"[Lv 9] : ^777777Duration:150sec^000000",
		"[Lv10] : ^777777Duration:165sec^000000"
	].join("\n");

	SkillDescription[SKID.AS_POISONREACT] = [
		"Poison React",
		"Max Lv : 10",
		"^777777Skill Requirement : Enchant Poison 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777the user^000000",
		"Description : ^777777Retaliates with a stronger physical attack against poison property attack for 1 time.",
		"If the caster have learned Double Attack, the chance of Double Attack is applied when counterattacking.",
		"Gives a level 5 Envenom when the user or monster which is not poison property attack.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777counterattack ATK 130%, Envenom: 1times^000000",
		"[Lv 2] : ^777777counterattack ATK 160%, Envenom: 1times^000000",
		"[Lv 3] : ^777777counterattack ATK 190%, Envenom: 2times^000000",
		"[Lv 4] : ^777777counterattack ATK 220%, Envenom: 2times^000000",
		"[Lv 5] : ^777777counterattack ATK 250%, Envenom: 3times^000000",
		"[Lv 6] : ^777777counterattack ATK 280%, Envenom: 3times^000000",
		"[Lv 7] : ^777777counterattack ATK 310%, Envenom: 4times^000000",
		"[Lv 8] : ^777777counterattack ATK 340%, Envenom: 4times^000000",
		"[Lv 9] : ^777777counterattack ATK 370%, Envenom: 5times^000000",
		"[Lv10] : ^777777counterattack ATK 400%, Envenom: 5times^000000"
	].join("\n");

	SkillDescription[SKID.AS_VENOMDUST] = [
		"Venom Dust",
		"Max Lv : 10",
		"^777777Skill Requirement : Enchant Poison 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Installation^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Contaminates a targeted location with a toxin that will leave all enemies within the area of effect poisoned. Each cast consumes a Red Gemstone. .",
		"It has a chance of leaving the target [Abnormal Status: Poisoned].",
		"The chance of poisoned is reduced by the target's resistance to abnormal status.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration :  5sec^000000",
		"[Lv 2] : ^777777Duration : 10sec^000000",
		"[Lv 3] : ^777777Duration : 15sec^000000",
		"[Lv 4] : ^777777Duration : 20sec^000000",
		"[Lv 5] : ^777777Duration : 25sec^000000",
		"[Lv 6] : ^777777Duration : 30sec^000000",
		"[Lv 7] : ^777777Duration : 35sec^000000",
		"[Lv 8] : ^777777Duration : 40sec^000000",
		"[Lv 9] : ^777777Duration : 45sec^000000",
		"[Lv10] : ^777777Duration : 50sec^000000"
	].join("\n");

	SkillDescription[SKID.AS_SPLASHER] = [
		"Venom Splasher",
		"Max Lv : 10",
		"^777777Skill Requirement : Poison React 5, Venom Dust 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Attaches a dangerous toxin onto a single target which causes a venomous explosion afterwards.",
		"inflicting physical damage to all enemies around the target and leaves the target [Abnormal Status: Poisoned].",
		"The chance of poisoned is reduced by the target's resistance to abnormal status.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 500%, Explosion delay time: 11sec^000000",
		"[Lv 2] : ^777777ATK 600%, Explosion delay time: 10sec^000000",
		"[Lv 3] : ^777777ATK 700%, Explosion delay time:  9sec^000000",
		"[Lv 4] : ^777777ATK 800%, Explosion delay time:  8sec^000000",
		"[Lv 5] : ^777777ATK 900%, Explosion delay time:  7sec^000000",
		"[Lv 6] : ^777777ATK1000%, Explosion delay time:  6sec^000000",
		"[Lv 7] : ^777777ATK1100%, Explosion delay time:  5sec^000000",
		"[Lv 8] : ^777777ATK1200%, Explosion delay time:  4sec^000000",
		"[Lv 9] : ^777777ATK1300%, Explosion delay time:  3sec^000000",
		"[Lv10] : ^777777ATK1400%, Explosion delay time:  2sec^000000"
	].join("\n");

	SkillDescription[SKID.RG_SNATCHER] = [
		"Snatcher",
		"Max Lv : 10",
		"^777777Skill Requirement : Steal 1^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Gives a chance to autocast Steal on the target when physically attacking, using its currently learned level.",
		"Skill level affects the chance of steel.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Steal Chance: 7%^000000",
		"[Lv 2] : ^777777Steal Chance: 8%^000000",
		"[Lv 3] : ^777777Steal Chance: 10%^000000",
		"[Lv 4] : ^777777Steal Chance: 11%^000000",
		"[Lv 5] : ^777777Steal Chance: 13%^000000",
		"[Lv 6] : ^777777Steal Chance: 14%^000000",
		"[Lv 7] : ^777777Steal Chance: 16%^000000",
		"[Lv 8] : ^777777Steal Chance: 17%^000000",
		"[Lv 9] : ^777777Steal Chance: 19%^000000",
		"[Lv10] : ^777777Steal Chance: 20%^000000"
	].join("\n");

	SkillDescription[SKID.RG_STEALCOIN] = [
		"Steal Coin",
		"Max Lv : 10",
		"^777777Skill Requirement : Snatcher 4^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Attempts to snatch a set amount of Zeny from a targeted monster. A successful cast will draw the targeted monster's aggresion.",
		"Success Rate is affected by the user's DEX, LUK, and the level difference between the user and the target.",
		"Cannot be used on players and Boss monsters.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Base success rate: 1%^000000",
		"[Lv 2] : ^777777Base success rate: 2%^000000",
		"[Lv 3] : ^777777Base success rate: 3%^000000",
		"[Lv 4] : ^777777Base success rate: 4%^000000",
		"[Lv 5] : ^777777Base success rate: 5%^000000",
		"[Lv 6] : ^777777Base success rate: 6%^000000",
		"[Lv 7] : ^777777Base success rate: 7%^000000",
		"[Lv 8] : ^777777Base success rate: 8%^000000",
		"[Lv 9] : ^777777Base success rate: 9%^000000",
		"[Lv10] : ^777777Base success rate:10%^000000"
	].join("\n");

	SkillDescription[SKID.RG_BACKSTAP] = [
		"Back Stab",
		"Max Lv : 10",
		"^777777Skill Requirement : Steal Coin 4^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Attack from the other side of the target, causing a physical attack damage.",
		"The damage is reduced by half when the bow is mounted, and the damage occurs twice when the dagger is mounted.",
		"Enhances hit rate upon skill level.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 340%, with Bow ATK 170%^000000",
		"[Lv 2] : ^777777ATK 380%, with Bow ATK 190%^000000",
		"[Lv 3] : ^777777ATK 420%, with Bow ATK 210%^000000",
		"[Lv 4] : ^777777ATK 460%, with Bow ATK 230%^000000",
		"[Lv 5] : ^777777ATK 500%, with Bow ATK 250%^000000",
		"[Lv 6] : ^777777ATK 540%, with Bow ATK 270%^000000",
		"[Lv 7] : ^777777ATK 580%, with Bow ATK 290%^000000",
		"[Lv 8] : ^777777ATK 620%, with Bow ATK 310%^000000",
		"[Lv 9] : ^777777ATK 660%, with Bow ATK 330%^000000",
		"[Lv10] : ^777777ATK 700%, with Bow ATK 350%^000000"
	].join("\n");

	SkillDescription[SKID.RG_TUNNELDRIVE] = [
		"Stalk (Tunnel Drive)",
		"Max Lv : 5",
		"^777777Skill Requirement : Hiding 1^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Allows the user to move while hidden. Moving in Hiding status is slower than general moving.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Movement speed : 26%^000000",
		"[Lv 2] : ^777777Movement speed : 32%^000000",
		"[Lv 3] : ^777777Movement speed : 38%^000000",
		"[Lv 4] : ^777777Movement speed : 44%^000000",
		"[Lv 5] : ^777777Movement speed : 50%^000000"
	].join("\n");

	SkillDescription[SKID.RG_RAID] = [
		"Raid",
		"Max Lv : 5",
		"^777777Skill Requirement : Stalk 2, Back Stap 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Target : ^777777Immediately^000000",
		"Description : ^777777This skill can only be used with Hiding active.",
		"Hiding is canceled afterwards. It has a chance of leaving them [Abnormal Status: blind] or [Abnormal Status: stunned].",
		"Enemies struck with this skill will take 30% more damage for 10 seconds .",
		"The chance of stun/blind is reduced by the target's resistance to abnormal status.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 200%, Blind and Stun chance: 13%^000000",
		"[Lv 2] : ^777777ATK 350%, Blind and Stun chance: 16%^000000",
		"[Lv 3] : ^777777ATK 500%, Blind and Stun chance: 19%^000000",
		"[Lv 4] : ^777777ATK 650%, Blind and Stun chance: 22%^000000",
		"[Lv 5] : ^777777ATK 800%, Blind and Stun chance: 25%^000000"
	].join("\n");

	SkillDescription[SKID.RG_STRIPWEAPON] = [
		"Divest Weapon (Strip Weapon)",
		"Max Lv : 5",
		"^777777Skill Requirement : Strip Armor 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Attempt to forcibly strip the equipped weapon off a single target and prevents it to equip any weapon temporarily.",
		"Against monsters, this will decrease their ATK by 25% temporarily.",
		"Both Base Chance and Base Duration are affected by the difference between both the user's and target's DEX. (Chance, Duration).^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 Strip chance: 10%^000000",
		"[Lv 2] : ^777777 Strip chance: 15%^000000",
		"[Lv 3] : ^777777 Strip chance: 20%^000000",
		"[Lv 4] : ^777777 Strip chance: 25%^000000",
		"[Lv 5] : ^777777 Strip chance: 30%^000000"
	].join("\n");

	SkillDescription[SKID.RG_STRIPSHIELD] = [
		"Strip Shield",
		"Max Lv : 5",
		"^777777Skill Requirement : Strip Helm 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Attempt to forcibly strip the equipped shield off a single target and prevents it to equip any shield temporarily.",
		"Against monsters, this will decrease their Hard DEF by 15% temporarily.",
		"Both Base Chance and Base Duration are affected by the difference between both the user's and target's DEX. (Chance, Duration).^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 Strip chance: 10%^000000",
		"[Lv 2] : ^777777 Strip chance: 15%^000000",
		"[Lv 3] : ^777777 Strip chance: 20%^000000",
		"[Lv 4] : ^777777 Strip chance: 25%^000000",
		"[Lv 5] : ^777777 Strip chance: 30%^000000"
	].join("\n");

	SkillDescription[SKID.RG_STRIPARMOR] = [
		"Strip Armor",
		"Max Lv : 5",
		"^777777Skill Requirement : Strip Shield 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Attempt to forcibly strip the equipped armor off a single target and prevents it to equip any armor temporarily.",
		"Against monsters, this will decrease their VIT by 40% temporarily.",
		"it does not affect the HP of the monster.",
		"Both Base Chance and Base Duration are affected by the difference between both the user's and target's DEX. (Chance, Duration).^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 Strip chance: 10%^000000",
		"[Lv 2] : ^777777 Strip chance: 15%^000000",
		"[Lv 3] : ^777777 Strip chance: 20%^000000",
		"[Lv 4] : ^777777 Strip chance: 25%^000000",
		"[Lv 5] : ^777777 Strip chance: 30%^000000"
	].join("\n");

	SkillDescription[SKID.RG_STRIPHELM] = [
		"Strip Helm",
		"Max Lv : 5",
		"^777777Skill Requirement : Steal Coin 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Attempt to forcibly strip the equipped headgear off a single target and prevents it to equip any headgear temporarily.",
		"Against monsters, this will decrease their INT by 40% temporarily.",
		"it does not affect the SP of the monster.",
		"Both Base Chance and Base Duration are affected by the difference between both the user's and target's DEX. (Chance, Duration).^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777 Strip chance: 10%^000000",
		"[Lv 2] : ^777777 Strip chance: 15%^000000",
		"[Lv 3] : ^777777 Strip chance: 20%^000000",
		"[Lv 4] : ^777777 Strip chance: 25%^000000",
		"[Lv 5] : ^777777 Strip chance: 30%^000000"
	].join("\n");

	SkillDescription[SKID.RG_INTIMIDATE] = [
		"Intimidate",
		"Max Lv : 5",
		"^777777Skill Requirement : Raid 5, Back Stap 4^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Attack the target, give it a physical Attack damage, and warp to a random place within the map with the target.",
		"Cannot be used on players and Boss monsters, The higher the caster's level, the lower the target's level/the higher the probability of success.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 130%^000000",
		"[Lv 2] : ^777777ATK 160%^000000",
		"[Lv 3] : ^777777ATK 190%^000000",
		"[Lv 4] : ^777777ATK 220%^000000",
		"[Lv 5] : ^777777ATK 250%^000000"
	].join("\n");

	SkillDescription[SKID.RG_GRAFFITI] = [
		"Graffiti",
		"Max Lv : 1",
		"^777777Skill Requirement : Flag Graffiti 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Places a graffiti on the targeted location with a message.  Each cast consumes 1 Red Gemstone.",
		"The message is up to 20 characters.",
		"Instances of this skill cannot be overlapped.^000000"
	].join("\n");

	SkillDescription[SKID.RG_FLAGGRAFFITI] = [
		"Flag Graffiti",
		"Max Lv : 5",
		"^777777Skill Requirement : Remover 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Flag^000000",
		"Description : ^777777Places a graffiti on the targeted Guild Flag to replace the guild emblem with an image of the user's making.",
		"As skill levels increase, the type of graffiti increases. 사Each cast consumes 1 Giant Paint Brush ^000000"
	].join("\n");

	SkillDescription[SKID.RG_CLEANER] = [
		"Remover",
		"Max Lv : 1",
		"^777777Skill Requirement : GangSter Paradise^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Flag^000000",
		"Description : ^777777Cleans graffiti from the targeted Guild Flag. Each cast consumes 1 Wet Duster^000000"
	].join("\n");

	SkillDescription[SKID.RG_GANGSTER] = [
		"GangSter's Paradise",
		"Max Lv : 1",
		"^777777Skill Requirement : Strip Shield 3^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777When two or more Rogues are sitting adjacent to each other and at least one of them knows this skill, monsters will not attack them.",
		"This skill does not affect boss monsters.^000000"
	].join("\n");

	SkillDescription[SKID.RG_COMPULSION] = [
		"Compulsion Discount",
		"Max Lv : 5",
		"^777777Skill Requirement : GangSter's Paradise 1^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enables to purchase items from NPC Shops at lower prices.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Discount rate 9%^000000",
		"[Lv 2] : ^777777Discount rate 13%^000000",
		"[Lv 3] : ^777777Discount rate 17%^000000",
		"[Lv 4] : ^777777Discount rate 21%^000000",
		"[Lv 5] : ^777777Discount rate 25%^000000"
	].join("\n");

	SkillDescription[SKID.RG_PLAGIARISM] = [
		"Intimidate (Plagiarism)",
		"Max Lv : 10",
		"^777777Skill Requirement : Intimidate 5^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Attack speed increases with skill level,",
		"Enables to use the last skill that was inflicted by the enemy, which does not need to connect in order to be plagiarized.",
		"Skill level affects the Maximum level of the plagiarized skill that the user can obtain.",
		"It cannot exceed the Maximum level of this skill. Special effects such as items that affect the skill tree or bring the level of learning cannot be used.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Lv. 1 Able to memorize, Increase ATK Speed: 1%^000000",
		"[Lv 2] : ^777777Lv. 2 Able to memorize, Increase ATK Speed: 2%^000000",
		"[Lv 3] : ^777777Lv. 3 Able to memorize, Increase ATK Speed: 3%^000000",
		"[Lv 4] : ^777777Lv. 4 Able to memorize, Increase ATK Speed: 4%^000000",
		"[Lv 5] : ^777777Lv. 5 Able to memorize, Increase ATK Speed: 5%^000000",
		"[Lv 6] : ^777777Lv. 6 Able to memorize, Increase ATK Speed: 6%^000000",
		"[Lv 7] : ^777777Lv. 7 Able to memorize, Increase ATK Speed: 7%^000000",
		"[Lv 8] : ^777777Lv. 8 Able to memorize, Increase ATK Speed: 8%^000000",
		"[Lv 9] : ^777777Lv. 9 Able to memorize, Increase ATK Speed: 9%^000000",
		"[Lv10] : ^777777Lv.10 Able to memorize, Increase ATK Speed:10%^000000"
	].join("\n");

	SkillDescription[SKID.AM_AXEMASTERY] = [
		"Axe Mastery",
		"Max Lv : 10",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enhances attack (Weapon Mastery) with Axe and Sword class weapons.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Damage + 3^000000",
		"[Lv 2] : ^777777Damage + 6^000000",
		"[Lv 3] : ^777777Damage + 9^000000",
		"[Lv 4] : ^777777Damage +12^000000",
		"[Lv 5] : ^777777Damage +15^000000",
		"[Lv 6] : ^777777Damage +18^000000",
		"[Lv 7] : ^777777Damage +21^000000",
		"[Lv 8] : ^777777Damage +24^000000",
		"[Lv 9] : ^777777Damage +27^000000",
		"[Lv10] : ^777777Damage +30^000000"
	].join("\n");

	SkillDescription[SKID.AM_LEARNINGPOTION] = [
		"Learning Potion",
		"Max Lv : 10",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enhances the success rate for brewing. This skill also increases the effectiveness of healing potions.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Increase Potion Efficiency 5%^000000",
		"[Lv 2] : ^777777Increase Potion Efficiency 10%^000000",
		"[Lv 3] : ^777777Increase Potion Efficiency 15%^000000",
		"[Lv 4] : ^777777Increase Potion Efficiency 20%^000000",
		"[Lv 5] : ^777777Increase Potion Efficiency 25%^000000",
		"[Lv 6] : ^777777Increase Potion Efficiency 30%^000000",
		"[Lv 7] : ^777777Increase Potion Efficiency 35%^000000",
		"[Lv 8] : ^777777Increase Potion Efficiency 40%^000000",
		"[Lv 9] : ^777777Increase Potion Efficiency 45%^000000",
		"[Lv10] : ^777777Increase Potion Efficiency 50%^000000"
	].join("\n");

	SkillDescription[SKID.AM_PHARMACY] = [
		"Pharmacy",
		"Max Lv : 10",
		"^777777Skill Requirement : Learning Potion 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Creation^000000",
		"Target : ^777777Immediately^000000",
		"Description : ^777777Brews an item, available from the Creation Guides the user is carrying. Each cast consumes a Medicine Bowl.^000000"
	].join("\n");

	SkillDescription[SKID.AM_DEMONSTRATION] = [
		"Demonstration",
		"Max Lv : 5",
		"^777777Skill Requirement : Pharmacy 4^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Throws a bottle of flammable liquid at a targeted location that will inflict Fire property hybrid damage every half a second to all enemies within its area of effect.",
		"It has a chance of breaking enemies' equipped weapon.",
		"Damage per attack is increased according to skill level of the learning potion.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration: 40sec, Destruction Chance : 3%^000000",
		"[Lv 2] : ^777777Duration: 45sec, Destruction Chance : 6%^000000",
		"[Lv 3] : ^777777Duration: 50sec, Destruction Chance : 9%^000000",
		"[Lv 4] : ^777777Duration: 55sec, Destruction Chance :12%^000000",
		"[Lv 5] : ^777777Duration: 60sec, Destruction Chance :15%^000000"
	].join("\n");

	SkillDescription[SKID.AM_ACIDTERROR] = [
		"Acid Terror",
		"Max Lv : 5",
		"^777777Skill Requirement : Pharmacy 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ranged Physical Attack^000000",
		"Target: ^7777771 Enemy^000000",
		"Description : ^777777Throws a bottle of corrosive acid at a single target that will inflict hybrid damage. It has a chance of leaving the target [Abnormal Status: bleeding] or breaking its equipped armor",
		"As skill levels increase, chances of damaging armor or causing bleeding increase.",
		"Damage is increased according to skill level of the learning potion. The chance of bleeding is reduced by the target's resistance to abnormal status.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 200%, Destruction Chance: 5%, Bleeding chance: 3%^000000",
		"[Lv 2] : ^777777ATK 400%, Destruction Chance:15%, Bleeding chance: 6%^000000",
		"[Lv 3] : ^777777ATK 600%, Destruction Chance:25%, Bleeding chance: 9%^000000",
		"[Lv 4] : ^777777ATK 800%, Destruction Chance:35%, Bleeding chance:12%^000000",
		"[Lv 5] : ^777777ATK 1000%, Destruction Chance:45%, Bleeding chance:15%^000000"
	].join("\n");

	SkillDescription[SKID.AM_POTIONPITCHER] = [
		"Potion Pitcher",
		"Max Lv : 5",
		"^777777Skill Requirement : Pharmacy 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Recovery^000000",
		"Target : ^777777Target 1^000000",
		"Description : ^777777Throws a potion and recovers party member/guild member/ humunculus.",
		"The effectiveness of the thrown potion increases based on the skill level, and when the skill level rises, the number of potions you can throw increases.",
		"Can throw normal potions, ranking effect does not apply.",
		"HP recovery hugely increases when used on Homunculus.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Can use red potion^000000",
		"[Lv 2] : ^777777Can use orange potion^000000",
		"[Lv 3] : ^777777Can use yellow potion^000000",
		"[Lv 4] : ^777777Can use white potion^000000",
		"[Lv 5] : ^777777Can use blue potion^000000"
	].join("\n");

	SkillDescription[SKID.AM_CANNIBALIZE] = [
		"Bio Cannibalize",
		"Max Lv : 5",
		"^777777Skill Requirement : Pharmacy 6^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Installation^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Summons a plant monster on a targeted location. Each cast consumes a Plant Bottle.",
		"Installed monsters automatically disappear after a certain period of time",
		"Monster MaxHP depends on skill level.",
		"Different monsters are installed for each skill level, and only one type of monster can be installed..",
		"The lower the skill level, the more monsters can be installed. At level 5, only one monster can be installed.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Maximum installations: 5monsters, Installed Monster: Mandragora^000000",
		"[Lv 2] : ^777777Maximum installations: 4monsters, Installed Monster: Hydra^000000",
		"[Lv 3] : ^777777Maximum installations: 3monsters, Installed Monster: Flora^000000",
		"[Lv 4] : ^777777Maximum installations: 2monsters, Installed Monster: Parasite^000000",
		"[Lv 5] : ^777777Maximum installations: 1monsters, Installed Monster: Geographer^000000"
	].join("\n");

	SkillDescription[SKID.AM_SPHEREMINE] = [
		"Marine Sphere",
		"Max Lv : 5",
		"^777777Skill Requirement : Pharmacy 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Installation^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Summons a Marine Sphere on a targeted location, which will cast Self Destruction upon receiving damage. Each cast consumes a Marine Sphere Bottle.",
		"When the Marine Spear is attacked, it moves in the opposite direction of the attacked target and casts a self-destructing skill.",
		"A Maximum of three Marine Spheres can be summoned before the first one expires, In PvP environment, an exploding Marine Sphere will damage allies, enemies, and the user itself.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Mine Sphere HP: 2400^000000",
		"[Lv 2] : ^777777Mine Sphere HP: 2800^000000",
		"[Lv 3] : ^777777Mine Sphere HP: 3200^000000",
		"[Lv 4] : ^777777Mine Sphere HP: 3600^000000",
		"[Lv 5] : ^777777Mine Sphere HP: 4000^000000"
	].join("\n");

	SkillDescription[SKID.AM_CP_WEAPON] = [
		"Chemical Protection(Weapon) (Chemical Protection Weapon)",
		"Max Lv : 5",
		"^777777Skill Requirement : Chemical Protection Armor 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Protects the equipped weapon of a single target from damage and removal temporarily. Each cast consumes a Glistening Coat.",
		"As skill levels increase, duration becomes longer.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration: 120sec^000000",
		"[Lv 2] : ^777777Duration: 240sec^000000",
		"[Lv 3] : ^777777Duration: 360sec^000000",
		"[Lv 4] : ^777777Duration: 480sec^000000",
		"[Lv 5] : ^777777Duration: 600sec^000000"
	].join("\n");

	SkillDescription[SKID.AM_CP_SHIELD] = [
		"Chemical Protection(Shield) (Chemical Protection Shield)",
		"Max Lv : 5",
		"^777777Skill Requirement : Chemical Protection Helm 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Protect the equipped shield of a single target from damage and removal temporarily. Each cast consumes a Glistening Coat.",
		"As skill levels increase, duration becomes longer.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration: 120sec^000000",
		"[Lv 2] : ^777777Duration: 240sec^000000",
		"[Lv 3] : ^777777Duration: 360sec^000000",
		"[Lv 4] : ^777777Duration: 480sec^000000",
		"[Lv 5] : ^777777Duration: 600sec^000000"
	].join("\n");

	SkillDescription[SKID.AM_CP_ARMOR] = [
		"Chemical Protection(Armor) (Chemical Protection Armor)",
		"Max Lv : 5",
		"^777777Skill Requirement : Chemical Protection Shield 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Protect the equipped armor of a single target from damage and removal temporarily. Each cast consumes a Glistening Coat.",
		"As skill levels increase, duration becomes longer.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration: 120sec^000000",
		"[Lv 2] : ^777777Duration: 240sec^000000",
		"[Lv 3] : ^777777Duration: 360sec^000000",
		"[Lv 4] : ^777777Duration: 480sec^000000",
		"[Lv 5] : ^777777Duration: 600sec^000000"
	].join("\n");

	SkillDescription[SKID.AM_CP_HELM] = [
		"Chemical Protection(Helm) (Chemical Protection Helm)",
		"Max Lv : 5",
		"^777777Skill Requirement : Pharmacy 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Protect the equipped headgear of a single target from damage and removal temporarily. Each cast consumes a Glistening Coat.",
		"As skill levels increase, duration becomes longer.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration: 120sec^000000",
		"[Lv 2] : ^777777Duration: 240sec^000000",
		"[Lv 3] : ^777777Duration: 360sec^000000",
		"[Lv 4] : ^777777Duration: 480sec^000000",
		"[Lv 5] : ^777777Duration: 600sec^000000"
	].join("\n");

	SkillDescription[SKID.AM_BIOETHICS] = [
		"Bioethics",
		"^777777Skill Requirement : Quest complete^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777A skill that is fundamental in enabling the creation of Homunculi.^000000"
	].join("\n");

	SkillDescription[SKID.AM_BIOTECHNOLOGY] = [
		"Biotechnology",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Increases the chance of successful Homunculus creation and its MaxHP.^000000"
	].join("\n");

	SkillDescription[SKID.AM_CREATECREATURE] = [
		"Create Creature",
		"Skill Form : ^777777Supportive^000000",
		"Description : ^777777Creates an Embryo. Skill level affects success chance.^000000"
	].join("\n");

	SkillDescription[SKID.AM_CULTIVATION] = [
		"Cultivation",
		"Skill Form : ^777777Supportive^000000",
		"Description : ^777777Creates a Homunculus. Skill level affects success chance. Cannot be used if the caster already has a Homunculus present.^000000"
	].join("\n");

	SkillDescription[SKID.AM_FLAMECONTROL] = [
		"Flame Control",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Increases the success rate of Cultivation and Fire resistance of the user.^000000"
	].join("\n");

	SkillDescription[SKID.AM_CALLHOMUN] = [
		"Call Homunculus",
		"Max Lv : 1",
		"^777777Skill Requirement : Rest 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Assist^000000",
		"Target : ^777777Instant Cast^000000",
		"Description : ^777777Calls out an existing homunculus that is in resting with the Vaporize skill or creates a new homunculus with an embryo.^000000"
	].join("\n");

	SkillDescription[SKID.AM_REST] = [
		"Rest",
		"Max Lv : 1",
		"^777777Skill Requirement : Bioethics 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Assist^000000",
		"Target : ^777777Instant Cast^000000",
		"Description : ^777777Puts homunculus in rest.",
		"This skill is only usable if Homunculus has at least 80% of it's MaxHP.",
		"Rested Homunculus can be restored with the Call.^000000"
	].join("\n");

	SkillDescription[SKID.AM_DRILLMASTER] = [
		"Drillmaster",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Raises the Attack Power of the player's Homunculus.^000000",
		"[Lv 1] : ^777777ATK Power +3^000000",
		"[Lv 2] : ^777777ATK Power +6^000000",
		"[Lv 3] : ^777777ATK Power +9^000000",
		"[Lv 4] : ^777777ATK Power +12^000000",
		"[Lv 5] : ^777777ATK Power +15^000000",
		"[Lv 6] : ^777777ATK Power +18^000000",
		"[Lv 7] : ^777777ATK Power +21^000000",
		"[Lv 8] : ^777777ATK Power +24^000000",
		"[Lv 9] : ^777777ATK Power +27^000000",
		"[Lv10] : ^777777ATK Power +30^000000"
	].join("\n");

	SkillDescription[SKID.AM_HEALHOMUN] = [
		"Heal Homunculus",
		"Skill Form : ^777777Supportive^000000",
		"Target: ^777777Homunculus^000000",
		"Description : ^777777Enables the Alchemist to Heal their Homunculus. Skill power is that of an Acolyte's Heal.^000000"
	].join("\n");

	SkillDescription[SKID.AM_RESURRECTHOMUN] = [
		"Resurrect Homunculus",
		"Max Lv : 5",
		"^777777Skill Requirement : Call Homunculus 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Recovery^000000",
		"Target : ^777777Instant Cast^000000",
		"Description : ^777777Restores Homunculus from rested status or resurrects a dead homunculus.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Resurrects with HP 20%^000000",
		"[Lv 2] : ^777777Resurrects with HP 40%^000000",
		"[Lv 3] : ^777777Resurrects with HP 60%^000000",
		"[Lv 4] : ^777777Resurrects with HP 80%^000000",
		"[Lv 5] : ^777777Resurrects with HP100%^000000"
	].join("\n");

	SkillDescription[SKID.CR_TRUST] = [
		"Faith (Faith)",
		"Max Lv : 10",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enhances MaxHP and resistance to Holy property damage.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777MaxHP + 200, Resistance to Sacred property: + 5%^000000",
		"[Lv 2] : ^777777MaxHP + 400, Resistance to Sacred property: +10%^000000",
		"[Lv 3] : ^777777MaxHP + 600, Resistance to Sacred property: +15%^000000",
		"[Lv 4] : ^777777MaxHP + 800, Resistance to Sacred property: +20%^000000",
		"[Lv 5] : ^777777MaxHP +1000, Resistance to Sacred property: +25%^000000",
		"[Lv 6] : ^777777MaxHP +1200, Resistance to Sacred property: +30%^000000",
		"[Lv 7] : ^777777MaxHP +1400, Resistance to Sacred property: +35%^000000",
		"[Lv 8] : ^777777MaxHP +1600, Resistance to Sacred property: +40%^000000",
		"[Lv 9] : ^777777MaxHP +1800, Resistance to Sacred property: +45%^000000",
		"[Lv10] : ^777777MaxHP +2000, Resistance to Sacred property: +50%^000000"
	].join("\n");

	SkillDescription[SKID.CR_AUTOGUARD] = [
		"Auto Guard",
		"Max Lv : 10",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target : ^777777Immediately^000000",
		"Description : ^777777Requires the user to have a shield equipped.",
		"Allows the user to block physical attacks with the equipped shield by chance in duration.",
		"The player will be forced to pause momentarily whenever this skill blocks damage.",
		"This skill can be switched on and off.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Defense probability: 5%^000000",
		"[Lv 2] : ^777777Defense probability:10%^000000",
		"[Lv 3] : ^777777Defense probability:14%^000000",
		"[Lv 4] : ^777777Defense probability:18%^000000",
		"[Lv 5] : ^777777Defense probability:21%^000000",
		"[Lv 6] : ^777777Defense probability:24%^000000",
		"[Lv 7] : ^777777Defense probability:26%^000000",
		"[Lv 8] : ^777777Defense probability:28%^000000",
		"[Lv 9] : ^777777Defense probability:29%^000000",
		"[Lv10] : ^777777Defense probability:30%^000000"
	].join("\n");

	SkillDescription[SKID.CR_SHIELDCHARGE] = [
		"Smite (Shield Charge)",
		"Max Lv : 5",
		"^777777Skill Requirement : Auto Guard 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Requires the user to have a shield equipped.",
		"Smashes the equipped shield into a single target to inflict physical damage and push it backwards. It has a chance of leaving the target [Abnormal Status: stunned].",
		"The chance of stun is reduced by the target's resistance to abnormal status.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 120%, Stun Chance:20%, Knock Back Distance: 5^000000",
		"[Lv 2] : ^777777ATK 140%, Stun Chance:25%, Knock Back Distance: 6^000000",
		"[Lv 3] : ^777777ATK 160%, Stun Chance:30%, Knock Back Distance: 7^000000",
		"[Lv 4] : ^777777ATK 180%, Stun Chance:35%, Knock Back Distance: 8^000000",
		"[Lv 5] : ^777777ATK 200%, Stun Chance:40%, Knock Back Distance: 9^000000"
	].join("\n");

	SkillDescription[SKID.CR_SHIELDBOOMERANG] = [
		"Shield Boomerang",
		"Max Lv : 5",
		"^777777Skill Requirement : Smite 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ranged Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Requires the user to have a shield equipped.",
		"Hurls the equipped shield like a boomerang at a single target to inflict ranged physical damage.",
		"The damage is affected by the equiped shield's weight and upgrade level.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK  80%, Range: 3cell^000000",
		"[Lv 2] : ^777777ATK 160%, Range: 5cell^000000",
		"[Lv 3] : ^777777ATK 240%, Range: 7cell^000000",
		"[Lv 4] : ^777777ATK 320%, Range: 9cell^000000",
		"[Lv 5] : ^777777ATK 400%, Range:11cell^000000"
	].join("\n");

	SkillDescription[SKID.CR_REFLECTSHIELD] = [
		"Reflect Shield",
		"Max Lv : 10",
		"^777777Skill Requirement : Shield Boomerang 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target : ^777777Immediately^000000",
		"Description : ^777777Requires the user to have a shield equipped.",
		"Produces an aura of retaliation to reflect a portion of the close range physical damage taken back at the attacker for five minutes.",
		"This skill is deactivated when the shield is released in duration.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Damage Reflection : 13%^000000",
		"[Lv 2] : ^777777Damage Reflection : 16%^000000",
		"[Lv 3] : ^777777Damage Reflection : 19%^000000",
		"[Lv 4] : ^777777Damage Reflection : 22%^000000",
		"[Lv 5] : ^777777Damage Reflection : 25%^000000",
		"[Lv 6] : ^777777Damage Reflection : 28%^000000",
		"[Lv 7] : ^777777Damage Reflection : 31%^000000",
		"[Lv 8] : ^777777Damage Reflection : 34%^000000",
		"[Lv 9] : ^777777Damage Reflection : 37%^000000",
		"[Lv10] : ^777777Damage Reflection : 40%^000000"
	].join("\n");

	SkillDescription[SKID.CR_HOLYCROSS] = [
		"Holy Cross",
		"Max Lv : 10",
		"^777777Skill Requirement : Faith 7^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Slices a single target with a cross shaped attack to inflict Holy property physical damage. It has a chance of leaving the target [Abnormal Status: blind].",
		"The chance of blind is reduced by the target's resistance to abnormal status.",
		"The damage is doubled with a two-handed Spear.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 135%, with a two-handed Spear ATK 270%^000000",
		"[Lv 2] : ^777777ATK 170%, with a two-handed Spear ATK 340%^000000",
		"[Lv 3] : ^777777ATK 205%, with a two-handed Spear ATK 410%^000000",
		"[Lv 4] : ^777777ATK 240%, with a two-handed Spear ATK 480%^000000",
		"[Lv 5] : ^777777ATK 275%, with a two-handed Spear ATK 550%^000000",
		"[Lv 6] : ^777777ATK 310%, with a two-handed Spear ATK 620%^000000",
		"[Lv 7] : ^777777ATK 345%, with a two-handed Spear ATK 690%^000000",
		"[Lv 8] : ^777777ATK 380%, with a two-handed Spear ATK 760%^000000",
		"[Lv 9] : ^777777ATK 415%, with a two-handed Spear ATK 830%^000000",
		"[Lv10] : ^777777ATK 450%, with a two-handed Spear ATK 900%^000000"
	].join("\n");

	SkillDescription[SKID.CR_GRANDCROSS] = [
		"Grand Cross",
		"Max Lv : 10",
		"^777777Skill Requirement : Faith 10, Holy Cross 6^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Special(Magic)^000000",
		"Target : ^777777Immediately^000000",
		"Description : ^777777Inflicts Holy property Hybrid Damage 1 to 3 times to all enemies in a cross-shaped area around the user.",
		"each cast drains 20% of MaxHP and inflicts a third of the damage to the user.",
		"Cast Time cannot be interrupted.",
		"All demon, undead race monsters becomes [Abnormal Status: Blind] except boss monster.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK, MATK 140%^000000",
		"[Lv 2] : ^777777ATK, MATK 180%^000000",
		"[Lv 3] : ^777777ATK, MATK 220%^000000",
		"[Lv 4] : ^777777ATK, MATK 260%^000000",
		"[Lv 5] : ^777777ATK, MATK 300%^000000",
		"[Lv 6] : ^777777ATK, MATK 340%^000000",
		"[Lv 7] : ^777777ATK, MATK 380%^000000",
		"[Lv 8] : ^777777ATK, MATK 420%^000000",
		"[Lv 9] : ^777777ATK, MATK 460%^000000",
		"[Lv10] : ^777777ATK, MATK 500%^000000"
	].join("\n");

	SkillDescription[SKID.CR_DEVOTION] = [
		"Sacrifice (Devotion)",
		"Max Lv : 5",
		"^777777Skill Requirement : Grand Cross 4, Reflect Shield 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Links to a single target to take all of the damage in its place.",
		"The level of the target and the caster's level must not differ by more than 10. This skill does not deactivate until a player takes damage when out of range of the skill, or the duration of the skill expires.",
		"Since it takes damage instead, the cast does not break even if the connected target is attacked during casting.",
		"Crusaders cannot be targeted by this skill.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration : 30sec, Maximum Connections: 1person^000000",
		"[Lv 2] : ^777777Duration : 45sec, Maximum Connections: 2people^000000",
		"[Lv 3] : ^777777Duration : 60sec, Maximum Connections: 3people^000000",
		"[Lv 4] : ^777777Duration : 75sec, Maximum Connections: 4people^000000",
		"[Lv 5] : ^777777Duration : 90sec, Maximum Connections: 5people^000000"
	].join("\n");

	SkillDescription[SKID.CR_PROVIDENCE] = [
		"Providence",
		"Max Lv : 5",
		"^777777Skill Requirement : Divine Protection 5, Heal 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Boosts resistance against Demon race monsters and Holy property damage.",
		"Crusaders cannot be targeted by this skill, including the player itself.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777resistance against Demon race: + 5%, Resistance to Sacred property: + 5%^000000",
		"[Lv 2] : ^777777resistance against Demon race: +10%, Resistance to Sacred property: +10%^000000",
		"[Lv 3] : ^777777resistance against Demon race: +15%, Resistance to Sacred property: +15%^000000",
		"[Lv 4] : ^777777resistance against Demon race: +20%, Resistance to Sacred property: +20%^000000",
		"[Lv 5] : ^777777resistance against Demon race: +25%, Resistance to Sacred property: +25%^000000"
	].join("\n");

	SkillDescription[SKID.CR_DEFENDER] = [
		"Defender",
		"Max Lv : 5",
		"^777777Skill Requirement : Shield Boomerang 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Requires the user to have a shield equipped.",
		"Produces an aura of protection to buffer all incoming ranged physical damage at cost of attack speed and movement speed.",
		"Skill level affects damage reduction and ATK speed.",
		"This skill can be switched on and off.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Damage reduction from long distance: 20%, ATK Speed: 80%^000000",
		"[Lv 2] : ^777777Damage reduction from long distance: 35%, ATK Speed: 85%^000000",
		"[Lv 3] : ^777777Damage reduction from long distance: 50%, ATK Speed: 90%^000000",
		"[Lv 4] : ^777777Damage reduction from long distance: 65%, ATK Speed: 95%^000000",
		"[Lv 5] : ^777777Damage reduction from long distance: 80%, ATK Speed:100%^000000"
	].join("\n");

	SkillDescription[SKID.CR_SPEARQUICKEN] = [
		"Spear Quicken",
		"Max Lv : 10",
		"^777777Skill Requirement : Spear Mastery 10^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Requires the user to have a Spear class weapons equipped.",
		"Temporarily increases attack speed, critical hit rate and flee rate with Spear class weapons.",
		"Duration, the chance of critical, and flee rate increase depending on skill level.",
		"Switching to a different weapon or dismounting a spear will cancel this effect.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration: 30sec, CRI+ 3, FLEE+ 2^000000",
		"[Lv 2] : ^777777Duration: 60sec, CRI+ 6, FLEE+ 4^000000",
		"[Lv 3] : ^777777Duration: 90sec, CRI+ 9, FLEE+ 6^000000",
		"[Lv 4] : ^777777Duration:120sec, CRI+12, FLEE+ 8^000000",
		"[Lv 5] : ^777777Duration:150sec, CRI+15, FLEE+10^000000",
		"[Lv 6] : ^777777Duration:180sec, CRI+18, FLEE+12^000000",
		"[Lv 7] : ^777777Duration:210sec, CRI+21, FLEE+14^000000",
		"[Lv 8] : ^777777Duration:240sec, CRI+24, FLEE+16^000000",
		"[Lv 9] : ^777777Duration:270sec, CRI+27, FLEE+18^000000",
		"[Lv10] : ^777777Duration:300sec, CRI+30, FLEE+20^000000"
	].join("\n");

	SkillDescription[SKID.MO_IRONHAND] = [
		"Iron Fists",
		"Max Lv : 10",
		"^777777Skill Requirement : Demonbane, Divine Protection 10^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Increases ATK (Weapon Mastery) with Knuckle class weapons or Bare Handed.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Damage +3^000000",
		"[Lv 2] : ^777777Damage +6^000000",
		"[Lv 3] : ^777777Damage +9^000000",
		"[Lv 4] : ^777777Damage +12^000000",
		"[Lv 5] : ^777777Damage +15^000000",
		"[Lv 6] : ^777777Damage +18^000000",
		"[Lv 7] : ^777777Damage +21^000000",
		"[Lv 8] : ^777777Damage +24^000000",
		"[Lv 9] : ^777777Damage +27^000000",
		"[Lv10] : ^777777Damage +30^000000"
	].join("\n");

	SkillDescription[SKID.MO_SPIRITSRECOVERY] = [
		"Spiritual Cadence",
		"Max Lv : 5",
		"^777777Skill Requirement : Root 2^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enables to naturally recover additional HP and SP while the user is sitting.",
		"When overweight(over 70%), HP and SP is recovered every 20 seconds instead.",
		"Below is the recovery amount for 10sec.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777HP+( 4+MaxHP 0.2%),SP+( 2+MaxSP 0.2%)^000000",
		"[Lv 2] : ^777777HP+( 8+MaxHP 0.4%),SP+( 4+MaxSP 0.4%)^000000",
		"[Lv 3] : ^777777HP+(12+MaxHP 0.6%),SP+( 6+MaxSP 0.6%)^000000",
		"[Lv 4] : ^777777HP+(16+MaxHP 0.8%),SP+( 8+MaxSP 0.8%)^000000",
		"[Lv 5] : ^777777HP+(20+MaxHP 1.0%),SP+(10+MaxSP 1.0%)^000000"
	].join("\n");

	SkillDescription[SKID.MO_CALLSPIRITS] = [
		"Summon Spirit Sphere",
		"Max Lv : 5",
		"^777777Skill Requirement : Iron Fists 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Summons one Spirit Sphere that will orbit the user consuming SP8.",
		"Summoned sphere is maintained for 10 minutes. and affeccts when using the skill.",
		"Each sphere increases ATK by 3.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Maximum Summon Spirit Sphere : 1^000000",
		"[Lv 2] : ^777777Maximum Summon Spirit Sphere : 2^000000",
		"[Lv 3] : ^777777Maximum Summon Spirit Sphere : 3^000000",
		"[Lv 4] : ^777777Maximum Summon Spirit Sphere : 4^000000",
		"[Lv 5] : ^777777Maximum Summon Spirit Sphere : 5^000000"
	].join("\n");

	SkillDescription[SKID.MO_ABSORBSPIRITS] = [
		"Spiritual Sphere Absorption",
		"Max Lv : 1",
		"^777777Skill Requirement : Summon Spirit Sphere 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Absorbs all Spirit Spheres the user/target has to regain SP consuming SP5,.",
		"regains 7 SP per sphere. In PvP, Guild battle, it is available to absorb the spirit sphere of another monk.",
		"Versus monsters, each cast has a 20% chance to regain SP equal to twice the target's level.",
		"This skill does not work for boss monsters or guardians..^000000"
	].join("\n");

	SkillDescription[SKID.MO_TRIPLEATTACK] = [
		"Raging Trifecta Blow",
		"Max Lv : 10",
		"^777777Skill Requirement : Flee (Skill) 5^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Each cast has a 30% chance to inflict one bundle of 3 hits.",
		"There's a dalay time (0.3s) for cast Raging quadruple after casting Raging Trifecta Blow.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 120%^000000",
		"[Lv 2] : ^777777ATK 140%^000000",
		"[Lv 3] : ^777777ATK 160%^000000",
		"[Lv 4] : ^777777ATK 180%^000000",
		"[Lv 5] : ^777777ATK 200%^000000",
		"[Lv 6] : ^777777ATK 220%^000000",
		"[Lv 7] : ^777777ATK 240%^000000",
		"[Lv 8] : ^777777ATK 260%^000000",
		"[Lv 9] : ^777777ATK 280%^000000",
		"[Lv10] : ^777777ATK 300%^000000"
	].join("\n");

	SkillDescription[SKID.MO_BODYRELOCATION] = [
		"Snap",
		"Max Lv : 1",
		"^777777Skill Requirement : Spiritual Cadence  2, Guillotine Fist 3, Mental Strength 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Instantly transports the user to a targeted location. Each cast uses a Spirit Sphere and SP 14.",
		"If there's solid obstacle between the user and the destination, this skill is unavailable.",
		"In Fury status, a Spirit Sphere is not consumed.",
		"There is a Cast Delay of 2 seconds for a casted Guillotine Fist immediately after this skill.^000000"
	].join("\n");

	SkillDescription[SKID.MO_DODGE] = [
		"Flee (Skill)",
		"Max Lv : 10",
		"^777777Skill Requirement : Iron Fists 5, Summon Spirit Sphere 5^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Increases Flee Rate.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777FLEE + 1^000000",
		"[Lv 2] : ^777777FLEE + 3^000000",
		"[Lv 3] : ^777777FLEE + 4^000000",
		"[Lv 4] : ^777777FLEE + 6^000000",
		"[Lv 5] : ^777777FLEE + 7^000000",
		"[Lv 6] : ^777777FLEE + 9^000000",
		"[Lv 7] : ^777777FLEE +10^000000",
		"[Lv 8] : ^777777FLEE +12^000000",
		"[Lv 9] : ^777777FLEE +13^000000",
		"[Lv10] : ^777777FLEE +15^000000"
	].join("\n");

	SkillDescription[SKID.MO_INVESTIGATE] = [
		"Occult Impaction",
		"Max Lv : 5",
		"^777777Skill Requirement : Summon Spirit Sphere 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Special^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Strikes inside a single target with a psychic impact.",
		"inflict piercing physical damage in proportion with the target's defense.",
		"The higher the target's equipment defense, the more damage it has..",
		"Damage of skill itself is increased by 50% when using in Root status.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 100%, SP  Consumption: 10^000000",
		"[Lv 2] : ^777777ATK 200%, SP  Consumption: 14^000000",
		"[Lv 3] : ^777777ATK 300%, SP  Consumption: 17^000000",
		"[Lv 4] : ^777777ATK 400%, SP  Consumption: 19^000000",
		"[Lv 5] : ^777777ATK 500%, SP  Consumption: 20^000000"
	].join("\n");

	SkillDescription[SKID.MO_FINGEROFFENSIVE] = [
		"Throw Spirit Sphere",
		"Max Lv : 5",
		"^777777Skill Requirement : Occult Impaction 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ranged Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Throws the Spirit Spheres at a single target that will inflict ranged physical damage.",
		"Damage of skill itself is increased by 50% when using in Root status.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 800%^000000",
		"[Lv 2] : ^777777ATK 1000%^000000",
		"[Lv 3] : ^777777ATK 1200%^000000",
		"[Lv 4] : ^777777ATK 1400%^000000",
		"[Lv 5] : ^777777ATK 1600%^000000"
	].join("\n");

	SkillDescription[SKID.MO_STEELBODY] = [
		"Mental Strength",
		"Max Lv : 5",
		"^777777Skill Requirement : Raging Thrust 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Strengthens the user's mind to temporarily reduce all incoming damage to 10%. Each cast uses five Spirit Spheres and SP200.",
		"Cost of reduced Movement Speed and Attack Speed and the inability of using active and offensive skills.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration: 30sec^000000",
		"[Lv 2] : ^777777Duration: 60sec^000000",
		"[Lv 3] : ^777777Duration: 90sec^000000",
		"[Lv 4] : ^777777Duration:120sec^000000",
		"[Lv 5] : ^777777Duration:150sec^000000"
	].join("\n");

	SkillDescription[SKID.MO_BLADESTOP] = [
		"Root",
		"Max Lv : 5",
		"^777777Skill Requirement : Flee (Skill) 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Catch the target attacking you and stop the caster and target for 10 seconds consuming SP10 and 1 summoned spirit sphere.",
		"When one of the two becomes incapable of fighting, the other one can move.",
		"When the skill level increases, some skill attacks while holding the target become possible.",
		"When used on boss monsters, the casting time is reduced.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777skill unavailable^000000",
		"[Lv 2] : ^777777Throw Spririt Sphere available^000000",
		"[Lv 3] : ^777777Occult impaction available^000000",
		"[Lv 4] : ^777777Raging quadruple available^000000",
		"[Lv 5] : ^777777Guillotine available^000000",
		"^777777There must be at leaset one spirit sphere.^000000"
	].join("\n");

	SkillDescription[SKID.MO_EXPLOSIONSPIRITS] = [
		"Fury",
		"Max Lv : 5",
		"^777777Skill Requirement : Spiritual Sphere Absorption 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Unleashes the inner power of the user to increase Critical Hit Rate. Each cast uses five Spirit Spheres.",
		"In Fury status, SP natural recovery speed is reduced by 50%.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777CRI + 10.0^000000",
		"[Lv 2] : ^777777CRI + 12.5^000000",
		"[Lv 3] : ^777777CRI + 15.0^000000",
		"[Lv 4] : ^777777CRI + 17.5^000000",
		"[Lv 5] : ^777777CRI + 20.0^000000"
	].join("\n");

	SkillDescription[SKID.MO_EXTREMITYFIST] = [
		"Guillotine Fist",
		"Max Lv : 5",
		"^777777Skill Requirement : Fury 3, Throw Spirit Sphere 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Special physics^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Requires the user to be in Fury status.",
		"Performs an ultimate, devastating strike at a single/current target to inflict massive piercing physical damage at cost of all of the user's SP.",
		"After the execution of this skill, the user cannot regenerate SP naturally for 10 seconds afterwards.^000000"
	].join("\n");

	SkillDescription[SKID.MO_CHAINCOMBO] = [
		"Raging Quadruple Blow",
		"Max Lv : 5",
		"^777777Skill Requirement : Raging Trifecta Blow 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777This skill can only be used immediately after Raging Trifecta Blow or during Level 4 Root status and can be followed up with Raging Thrust.",
		"Inflicts four hits while spinning the current target.",
		"When used as a knuckle weapon, it hits the enemy 6 times with double damage.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 300%, SP Consumption: 5^000000",
		"[Lv 2] : ^777777ATK 350%, SP Consumption: 6^000000",
		"[Lv 3] : ^777777ATK 400%, SP Consumption: 7^000000",
		"[Lv 4] : ^777777ATK 450%, SP Consumption: 8^000000",
		"[Lv 5] : ^777777ATK 500%, SP Consumption: 9^000000"
	].join("\n");

	SkillDescription[SKID.MO_COMBOFINISH] = [
		"Raging Thrust",
		"Max Lv : 5",
		"^777777Skill Requirement : Raging Quadruple Blow 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777This skill can only be used immediately after Raging Quadruple Blow.",
		"Performs a brutal, finishing strike at the current target. Each cast uses a Spirit Sphere.",
		"Damage is further increased by caster's STR.",
		"If learned Guillotine Fist, there's a delay time(0.3) for casting Guillotine Fist.",
		"This skill can be followed up with Chain Crush Combo, Glacier Fist or Guillotine Fist if the user is in Fury status and has 4 Spirit Spheres after this skill.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 600%, SP Consumption: 3^000000",
		"[Lv 2] : ^777777ATK 750%, SP Consumption: 4^000000",
		"[Lv 3] : ^777777ATK 900%, SP Consumption: 5^000000",
		"[Lv 4] : ^777777ATK1050%, SP Consumption: 6^000000",
		"[Lv 5] : ^777777ATK1200%, SP Consumption: 7^000000"
	].join("\n");

	SkillDescription[SKID.SA_ADVANCEDBOOK] = [
		"Study (Advanced Book)",
		"Max Lv : 10",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enhances attack (Weapon Mastery) and attack speed with Book class weapons.",
		"Additionally, when using a book weapon, the attack speed is increased..^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777increase damage+ 3, ATK Speed:0.5% increase^000000",
		"[Lv 2] : ^777777increase damage+ 6, ATK Speed:1.0% increase^000000",
		"[Lv 3] : ^777777increase damage+ 9, ATK Speed:1.5% increase^000000",
		"[Lv 4] : ^777777increase damage+12, ATK Speed:2.0% increase^000000",
		"[Lv 5] : ^777777increase damage+15, ATK Speed:2.5% increase^000000",
		"[Lv 6] : ^777777increase damage+18, ATK Speed:3.0% increase^000000",
		"[Lv 7] : ^777777increase damage+21, ATK Speed:3.5% increase^000000",
		"[Lv 8] : ^777777increase damage+24, ATK Speed:4.0% increase^000000",
		"[Lv 9] : ^777777increase damage+27, ATK Speed:4.5% increase^000000",
		"[Lv10] : ^777777increase damage+30, ATK Speed:5.0% increase^000000"
	].join("\n");

	SkillDescription[SKID.SA_CASTCANCEL] = [
		"Cast Cancel (Cast Cancel)",
		"Max Lv : 5",
		"^777777Skill Requirement : Study 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Can only be used during magic casting.",
		"Cancels the ongoing cast of a skill before it finishes casting and retains a fraction of its SP Cost.",
		"When the skill level increases, the SP consumption of the skill decreases when canceled.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777SP Consumption: 90%^000000",
		"[Lv 2] : ^777777SP Consumption: 70%^000000",
		"[Lv 3] : ^777777SP Consumption: 50%^000000",
		"[Lv 4] : ^777777SP Consumption: 30%^000000",
		"[Lv 5] : ^777777SP Consumption: 10%^000000"
	].join("\n");

	SkillDescription[SKID.SA_MAGICROD] = [
		"Magic Rod (Magic Rod)",
		"Max Lv : 5",
		"^777777Skill Requirement : Study 4^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Absorbs incoming magic spells and replenishes SP from a portion of their SP Cost.",
		" If an enemy casts Spell Breaker and is countered by this skill, the user of this skill will absorb 20% of the enemy's MaxSP.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Timing: 0.4sec, SP Absorbed amount: 20%^000000",
		"[Lv 2] : ^777777Timing: 0.6sec, SP Absorbed amount: 40%^000000",
		"[Lv 3] : ^777777Timing: 0.8sec, SP Absorbed amount: 60%^000000",
		"[Lv 4] : ^777777Timing: 1.0sec, SP Absorbed amount: 80%^000000",
		"[Lv 5] : ^777777Timing: 1.2sec, SP Absorbed amount:100%^000000"
	].join("\n");

	SkillDescription[SKID.SA_SPELLBREAKER] = [
		"Spell Breaker (Spell Breaker)",
		"Max Lv : 5",
		"^777777Skill Requirement : Magic Rod 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Can be used for casting targets.",
		"Disrupts a single target's ongoing skill casting and replenishes SP from a portion of its SP Cost.",
		"If mastered, this skill also inflicts damage equal to 2% of the target's MaxHP and absorbs the half of it.",
		"This skill can interrupt skills from boss and Guardian monsters, ",
		"although the chance of success is reduced to 10%.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777SP Absorbed amount:  0%^000000",
		"[Lv 2] : ^777777SP Absorbed amount: 25%^000000",
		"[Lv 3] : ^777777SP Absorbed amount: 50%^000000",
		"[Lv 4] : ^777777SP Absorbed amount: 75%^000000",
		"[Lv 5] : ^777777SP Absorbed amount:100%^000000"
	].join("\n");

	SkillDescription[SKID.SA_FREECAST] = [
		"Free Cast",
		"Max Lv : 10",
		"^777777Skill Requirement : Cast Cancel 1^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Allows the user to move and attack while casting spells.",
		"Movement speed and attack speed depend on skill level.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Movement Speed:30%, Attack Speed: 55%^000000",
		"[Lv 2] : ^777777Movement Speed:35%, Attack Speed: 60%^000000",
		"[Lv 3] : ^777777Movement Speed:40%, Attack Speed: 65%^000000",
		"[Lv 4] : ^777777Movement Speed:45%, Attack Speed: 70%^000000",
		"[Lv 5] : ^777777Movement Speed:50%, Attack Speed: 75%^000000",
		"[Lv 6] : ^777777Movement Speed:55%, Attack Speed: 80%^000000",
		"[Lv 7] : ^777777Movement Speed:60%, Attack Speed: 85%^000000",
		"[Lv 8] : ^777777Movement Speed:65%, Attack Speed: 90%^000000",
		"[Lv 9] : ^777777Movement Speed:70%, Attack Speed: 95%^000000",
		"[Lv10] : ^777777Movement Speed:75%, Attack Speed:100%^000000"
	].join("\n");

	SkillDescription[SKID.SA_AUTOSPELL] = [
		"Hindsight (Auto Spell)",
		"Max Lv : 10",
		"^777777Skill Requirement : Free Cast 4^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Allows to autocast a spell while physically attacking enemies temporarily.",
		"Spells triggered by this skill only consume 2/3 of their SP Cost.",
		"they cannot be cast through this skill if they have not yet learned.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Chance of Autocast: 2%, Add Fire/Cold/Lightning Bolt^000000",
		"[Lv 2] : ^777777Chance of Autocast: 4%^000000",
		"[Lv 3] : ^777777Chance of Autocast: 6%^000000",
		"[Lv 4] : ^777777Chance of Autocast: 8%, Add Soul Strike/Fire ball^000000",
		"[Lv 5] : ^777777Chance of Autocast:10%^000000",
		"[Lv 6] : ^777777Chance of Autocast:12%^000000",
		"[Lv 7] : ^777777Chance of Autocast:14%, Add Frost diver/Earth Spike^000000",
		"[Lv 8] : ^777777Chance of Autocast:16%^000000",
		"[Lv 9] : ^777777Chance of Autocast:18%^000000",
		"[Lv10] : ^777777Chance of Autocast:20%, Add Thunder storm/Heaven's Drive 000000"
	].join("\n");

	SkillDescription[SKID.SA_FLAMELAUNCHER] = [
		"Flame Launcher",
		"Max Lv : 5",
		"^777777Skill Requirement : Firebolt 1, Study 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Inflicts Fire property Ranged Physical Damage to all enemies in a set area around a single target. Each cast consumes 1 Scarlet point^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration:10min, Fire property Magic damage 1% Increase^000000",
		"[Lv 2] : ^777777Duration:15min, Fire property Magic damage 2% Increase^000000",
		"[Lv 3] : ^777777Duration:20min, Fire property Magic damage 3% Increase^000000",
		"[Lv 4] : ^777777Duration:25min, Fire property Magic damage 4% Increase^000000",
		"[Lv 5] : ^777777Duration:30min, Fire property Magic damage 5% Increase^000000"
	].join("\n");

	SkillDescription[SKID.SA_FROSTWEAPON] = [
		"Frost Weapon",
		"Max Lv : 5",
		"^777777Skill Requirement : Cold Bolt 1, Study 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Attempts to endow a single target's weapon with the Water property temporarily. Each cast consumes 1 Indigo point^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration:10min, Water property Magic damage 1% Increase^000000",
		"[Lv 2] : ^777777Duration:15min, Water property Magic damage 2% Increase^000000",
		"[Lv 3] : ^777777Duration:20min, Water property Magic damage 3% Increase^000000",
		"[Lv 4] : ^777777Duration:25min, Water property Magic damage 4% Increase^000000",
		"[Lv 5] : ^777777Duration:30min, Water property Magic damage 5% Increase^000000"
	].join("\n");

	SkillDescription[SKID.SA_LIGHTNINGLOADER] = [
		"Lightning Loader",
		"Max Lv : 5",
		"^777777Skill Requirement : Lightning Bolt 1, Study 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Attempts to endow a single target's weapon with the Wind property temporarily. Each cast consumes 1 Yellow wish point^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration:10min, Wind property Magic damage 1% Increase^000000",
		"[Lv 2] : ^777777Duration:15min, Wind property Magic damage 2% Increase^000000",
		"[Lv 3] : ^777777Duration:20min, Wind property Magic damage 3% Increase^000000",
		"[Lv 4] : ^777777Duration:25min, Wind property Magic damage 4% Increase^000000",
		"[Lv 5] : ^777777Duration:30min, Wind property Magic damage 5% Increase^000000"
	].join("\n");

	SkillDescription[SKID.SA_SEISMICWEAPON] = [
		"Seismic Weapon",
		"Max Lv : 5",
		"^777777Skill Requirement : Stone Curse 1, Study 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Attempts to endow a single target's weapon with the Earth property temporarily. Each cast consumes 1 Lime green point^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration:10min, Earth property Magic damage 1% Increase^000000",
		"[Lv 2] : ^777777Duration:15min, Earth property Magic damage 2% Increase^000000",
		"[Lv 3] : ^777777Duration:20min, Earth property Magic damage 3% Increase^000000",
		"[Lv 4] : ^777777Duration:25min, Earth property Magic damage 4% Increase^000000",
		"[Lv 5] : ^777777Duration:30min, Earth property Magic damage 5% Increase^000000"
	].join("\n");

	SkillDescription[SKID.SA_DRAGONOLOGY] = [
		"Dragonology",
		"Max Lv : 5",
		"^777777Skill Requirement : Study 9^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777By studying dragons, enhances all damage and resistance against Dragon race monsters.",
		"Also enhances INT by 3.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777tolerance 4%,Physical/Magic damage:4/2%,Int+1^000000",
		"[Lv 2] : ^777777tolerance 8%,Physical/Magic damage:8/4%,Int+1^000000",
		"[Lv 3] : ^777777tolerance12%,Physical/Magic damage:12/6%,Int+2^000000",
		"[Lv 4] : ^777777tolerance16%,Physical/Magic damage:16/8%,Int+2^000000",
		"[Lv 5] : ^777777tolerance20%,Physical/Magic damage:20/10+%,Int+3^000000"
	].join("\n");

	SkillDescription[SKID.SA_VOLCANO] = [
		"Volcano",
		"Max Lv : 5",
		"^777777Skill Requirement : Flame Launcher 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Installation^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Consumption of one blue gemstone, making 7X7 cells around the designated area into a volcano area.",
		"amplifies all Fire property attacks and increases the attack power of all characters within its area of effect.",
		"Additionally increases ATK and MATK,",
		"This skill prevents the use of Ice Wall on the affected area.",
		"This skill cannot be cast on a cell currently affected by any floor skill or ground targeted skill.",
		"Duration is (skill level)minutes. Casting this skill, Deluge or Whirlwind while the buff is active will not incur a Gemstone cost.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777damage(fire) +10%, ATK/MATK +10^000000",
		"[Lv 2] : ^777777damage(fire) +14%, ATK/MATK +15^000000",
		"[Lv 3] : ^777777damage(fire) +17%, ATK/MATK +20^000000",
		"[Lv 4] : ^777777damage(fire) +19%, ATK/MATK +25^000000",
		"[Lv 5] : ^777777damage(fire) +20%, ATK/MATK +30^000000"
	].join("\n");

	SkillDescription[SKID.SA_DELUGE] = [
		"Deluge",
		"Max Lv : 5",
		"^777777Skill Requirement : Frost Weapon 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Installation^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Consumption of one blue gemstone, making 7X7 cells around the designated area into a deluge area.",
		"Casts an area on the ground that amplifies all Water property attacks.",
		"and increases the MaxHP of all characters within its area of effect,",
		"This skill acts as shallow water for skills Aqua Benedicta and Water Ball.",
		"(When using waterball, Deluge's range is reduced by the range of waterball.)",
		"This skill cannot be cast on a cell currently affected by any floor skill or ground targeted skill.",
		"Duration is (skill level)minutes. Casting this skill, Whirlwind or Volcano while the buff is active will not incur a Gemstone cost.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777damage(water) +10%, MaxHP + 5%^000000",
		"[Lv 2] : ^777777damage(water) +14%, MaxHP + 9%^000000",
		"[Lv 3] : ^777777damage(water) +17%, MaxHP +12%^000000",
		"[Lv 4] : ^777777damage(water) +19%, MaxHP +14%^000000",
		"[Lv 5] : ^777777damage(water) +20%, MaxHP +15%^000000"
	].join("\n");

	SkillDescription[SKID.SA_VIOLENTGALE] = [
		"Whirlwind (Violent Gale)",
		"Max Lv : 5",
		"^777777Skill Requirement : Lightning Loader 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Installation^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Consumption of one blue gemstone, making 7X7 cells around the designated area into a whirlwind area.",
		"Casts an area on the ground that amplifies all Wind property attacks.",
		"and increases the flee rate of all characters within its area of effect,",
		"This skill extends the duration of Fire Wall by 50%.",
		"This skill cannot be cast on a cell currently affected by any floor skill or ground targeted skill.",
		"Duration is (skill level)minutes. this skill, Deluge or Volcano while the buff is active will not incur a Gemstone cost.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777damage(wind) +10%, Flee+ 3^000000",
		"[Lv 2] : ^777777damage(wind) +14%, Flee+ 6^000000",
		"[Lv 3] : ^777777damage(wind) +17%, Flee+ 9^000000",
		"[Lv 4] : ^777777damage(wind) +19%, Flee+12^000000",
		"[Lv 5] : ^777777damage(wind) +20%, Flee+15^000000"
	].join("\n");

	SkillDescription[SKID.SA_LANDPROTECTOR] = [
		"Land Protector",
		"Max Lv : 5",
		"^777777Skill Requirement : Volcano 3, Deluge 3, Whirlwind 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Installation^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description : ^777777Places a set area on the targeted location that nullifies and blocks some ground targeting skills. Each cast consumes 1 Blue Gemstone and 1 Yellow Gemstone.",
		"Sages can cancel each other's instances of this skill.",
		"This skill cannot be cast on a cell currently affected by any floor skill or ground targeted skill.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration:120sec, Effective range: 7X7^000000",
		"[Lv 2] : ^777777Duration:165sec, Effective range: 7X7^000000",
		"[Lv 3] : ^777777Duration:210sec, Effective range: 9X9^000000",
		"[Lv 4] : ^777777Duration:255sec, Effective range: 9X9^000000",
		"[Lv 5] : ^777777Duration:300sec, Effective range:11X11^000000"
	].join("\n");

	SkillDescription[SKID.SA_DISPELL] = [
		"Dispell",
		"Max Lv : 5",
		"^777777Skill Requirement : Spell Breaker 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Attempts to nullify the majority of the stat changes, benefits and status effects of a single target. Each successful cast consumes a Yellow Gemstone.",
		"target's magic defense affects the chance of effect. When using level 5, 100% success regardless of the magic defense of the target.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Base success rate: 60%^000000",
		"[Lv 2] : ^777777Base success rate: 70%^000000",
		"[Lv 3] : ^777777Base success rate: 80%^000000",
		"[Lv 4] : ^777777Base success rate: 90%^000000",
		"[Lv 5] : ^777777Base success rate:100%(fixed)^000000"
	].join("\n");

	SkillDescription[SKID.SA_ABRACADABRA] = [
		"Hocus Pocus",
		"Max Lv : 10",
		"^777777Skill Requirement : Auto Spell 5, Dispell 1, Land Protector 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777???^000000",
		"Target: ^777777???^000000",
		"Description : ^777777Casts a random skill among character, monster, and a few exclusive skills. Each cast consumes two Yellow Gemstones and SP50",
		"Skill Level affects the variety of skills that can be cast, and the level of the randomly selected skill if applicable.",
		"Even if there is an effect of nullifying the gemstone consumption, at least one yellow gemstone is consumed.^000000"
	].join("\n");

	SkillDescription[SKID.SA_MONOCELL] = [
		"Mono Cell",
		"Type\t : Active Skill",
		"Target\t : 1 enemy",
		"Description: Change the target to the monster 'PORING' for a certain period of time.",
		"Etc.\t : This skill is implemented only by Hocus Pocus"
	].join("\n");

	SkillDescription[SKID.SA_CLASSCHANGE] = [
		"Class Change",
		"Type\t : Active Skill",
		"Target\t : 1 enemy",
		"Description: Change the target to the boss monster for a certain period of time.",
		"Etc.\t : This skill is implemented only by Hocus Pocus"
	].join("\n");

	SkillDescription[SKID.SA_SUMMONMONSTER] = [
		"Summon Monster",
		"Type\t : Active Skill",
		"Target\t : Autocast",
		"Description: Equivalent to old tree branches",
		"Etc.\t : This skill is implemented only by Hocus Pocus"
	].join("\n");

	SkillDescription[SKID.SA_REVERSEORCISH] = [
		"Reverse Orcish",
		"Type\t : Active Skill",
		"Target\t : Autocast on self",
		"Description: Change the subject's face type to 'orc' for a certain period of time.",
		"Etc.\t : This skill is implemented only by Hocus Pocus"
	].join("\n");

	SkillDescription[SKID.SA_DEATH] = [
		"Death",
		"Type\t : Active Skill",
		"Target\t : 1 enemy",
		"Description: Kill the object instantly. target does not give exp and items.",
		"Etc.\t : This skill is implemented only by Hocus Pocus"
	].join("\n");

	SkillDescription[SKID.SA_FORTUNE] = [
		"Fortune",
		"Type\t : Active Skill",
		"Target\t : 1 enemy",
		"Description: Gain Zeny equal to the target's Lv * 100.",
		"Etc.\t : This skill is implemented only by Hocus Pocus"
	].join("\n");

	SkillDescription[SKID.SA_TAMINGMONSTER] = [
		"Taming Monster",
		"Type\t : Active Skill",
		"Target\t : 1 enemy",
		"Description: If the target is a tameable monster, tame that monster.",
		"Etc.\t : This skill is implemented only by Hocus Pocus"
	].join("\n");

	SkillDescription[SKID.SA_QUESTION] = [
		"?",
		"Type\t : Active Skill",
		"Target\t : 1 enemy",
		"Description: The subject displays the emoticon'?'. Then nothing happens.",
		"Etc.\t : This skill is implemented only by Hocus Pocus"
	].join("\n");

	SkillDescription[SKID.SA_GRAVITY] = [
		"Gravity",
		"Type\t : Active Skill",
		"Target\t : Autocast on self",
		"Description: Effect appears above the subject's head. This effect is a mark of Gravity Co., Ltd. ",
		"Etc.\t : This skill is implemented only by Hocus Pocus"
	].join("\n");

	SkillDescription[SKID.SA_LEVELUP] = [
		"Level Up",
		"Type\t : Active Skill",
		"Target\t : Autocast on self",
		"Description: Character level up",
		"Etc.\t : This skill is implemented only by Hocus Pocus"
	].join("\n");

	SkillDescription[SKID.SA_INSTANTDEATH] = [
		"Instant Death",
		"Type\t : Active Skill",
		"Target\t : Autocast on self",
		"Description: It becomes incompetent. Everything is the same as incompetent, such as lost exp.",
		"Etc.\t : This skill is implemented only by Hocus Pocus"
	].join("\n");

	SkillDescription[SKID.SA_FULLRECOVERY] = [
		"Full Recovery",
		"Type\t : Active Skill",
		"Target\t : Autocast on self",
		"Description: The target's HP, SP, and all conditions are restored.",
		"Etc.\t : This skill is implemented only by Hocus Pocus"
	].join("\n");

	SkillDescription[SKID.SA_COMA] = [
		"Coma",
		"Type\t : Active Skill",
		"Target\t : Autocast on self",
		"Description: The target's HP and SP become unconditionally 1.",
		"Etc.\t : This skill is implemented only by Hocus Pocus."
	].join("\n");

	SkillDescription[SKID.BD_ADAPTATION] = [
		"Amp",
		"Max Lv : 1",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777It is a skill to cope with various unexpected situations occurring during a performance.",
		"Reduces SP consumption used for performances, ensembles and dances for a certain period of time by 20%.",
		"Can be used in duplicate with Encore."
	].join("\n");

	SkillDescription[SKID.BD_ENCORE] = [
		"Encore",
		"Max Lv : 1",
		"^777777Skill Requirement : Amp 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Replays the last song/dance performed at half of its SP Cost.",
		"You can use the performance, dance, and ensemble skills with 1/2 of the usual SP consumption.",
		"When the last dance, ensemble, or performance is not available, only skill is used and delay time is occured.^000000"
	].join("\n");

	SkillDescription[SKID.BD_LULLABY] = [
		"Lullaby",
		"Max Lv : 1",
		"^777777Skill Requirement : Perfect Tablature(Focus Ballet) 10^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777ensemble skill^000000",
		"Target: ^777777 9*9 cells around the user^000000",
		"Description : ^777777Performs a dreamy ensemble that may leave all enemies sleeping.",
		"The chance of sleep and duration is reduced by the target's resistance to abnormal status.",
		"This skill can be overlapped with other ensemble skills, and can only be used when the caster is equipped with an instrument or whip.",
		"Ensemble skill is activated when the bard / dancer in the party is within 9 x 9 cells",
		"Enters a ensemble aftermath(unavailable skill, reduced movement speed and attack speed) for 10 seconds.",
		"Cannot be used on players and Boss monsters.^000000"
	].join("\n");

	SkillDescription[SKID.BD_RICHMANKIM] = [
		"Mental Sensing",
		"Max Lv : 5",
		"^777777Skill Requirement : Acoustic Rhythm 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ensemble Skill^000000",
		"Target : ^777777Self and Party members around 31 X 31 cell^000000",
		"Description : ^777777On-screen (31x31) Gives yourself and your party members a chance to gain EXP points based on its skill level when fighting monsters.",
		"It does not overlap with other Ensemble Skill and can only be used when the caster is equipping whips.",
		"Ensemble Skill only activates when Bard/ Dancer is within 9 X 9 cell. When Ensemble Skill is used, caster and partner becomes Aftereffect.",
		"Cannot use skills, movement speed and ASP reduction for 10 sec.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Exp Increase : 20%^000000",
		"[Lv 2] : ^777777Exp Increase : 30%^000000",
		"[Lv 3] : ^777777Exp Increase : 40%^000000",
		"[Lv 4] : ^777777Exp Increase : 50%^000000",
		"[Lv 5] : ^777777Exp Increase : 60%^000000"
	].join("\n");

	SkillDescription[SKID.BD_ETERNALCHAOS] = [
		"Down Tempo",
		"Max Lv : 1",
		"^777777Skill Requirement : Classic Pluck 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777ensemble skill^000000",
		"Target: ^777777 9*9 cells around the user^000000",
		"Description : ^777777Performs an ensemble that will nullify all defense of all enemies around the performers.",
		"This skill cannot be overlapped with other ensemble skills, and can only be used when the caster is equipped with an instrument or whip.",
		"Ensemble skill is activated when the bard / dancer in the party is within 9 x 9 cells",
		"Enters a ensemble aftermath(unavailable skill, reduced movement speed and attack speed) for 10 seconds.",
		"This skill can only be used in PVP / Sieze Mode.^000000"
	].join("\n");

	SkillDescription[SKID.BD_DRUMBATTLEFIELD] = [
		"Battle Theme",
		"Max Lv : 5",
		"^777777Skill Requirement : Song of Lutie(Gypsy's Kiss) 10^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ensemble Skill^000000",
		"Target : ^777777Self and Party members around 31 X 31 cell^000000",
		"Description : ^777777On-screen (31x31) Increases yourself and your party members ATK and DEF based on its skill level.",
		"It does not overlap with other Ensemble Skill and can only be used when the caster is equipping whips / instruments.",
		"Ensemble Skill only activates when Bard/ Dancer is within 9 X 9 cell. When Ensemble Skill is used, caster and partner becomes Aftereffect.",
		"Cannot use skills, movement speed and ASP reduction for 10 sec.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK + 20, DEF + 15.^000000",
		"[Lv 2] : ^777777ATK + 25, DEF + 30.^000000",
		"[Lv 3] : ^777777ATK + 30, DEF + 45.^000000",
		"[Lv 4] : ^777777ATK + 35, DEF + 60.^000000",
		"[Lv 5] : ^777777ATK + 40, DEF + 75.^000000"
	].join("\n");

	SkillDescription[SKID.BD_RINGNIBELUNGEN] = [
		"Harmonic Lick",
		"Max Lv : 5",
		"^777777Skill Requirement : Battle Theme 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777ensemble skill^000000",
		"Target: ^777777 31*31 cells around the user^000000",
		"Description : ^777777Performs an ensemble that will add piercing damage on the attack of all players around the performers.",
		"This skill cannot be overlapped with other ensemble skills, and can only be used when the caster is equipped with an instrument or whip.",
		"Ensemble skill is activated when the bard / dancer in the party is within 9 x 9 cells",
		"Enters a ensemble aftermath(unavailable skill, reduced movement speed and attack speed) for 10 seconds.^000000",
		"^ffffff_^000000",
		"^777777ATK speed 20% increase.^000000",
		"^777777PATK speed 20% increase.^000000",
		"^777777MATK power 20% increase.^000000",
		"^777777Maximum HP 30% increase.^000000",
		"^777777Maximum SP 30% increase.^000000",
		"^777777Every status 15 increase.^000000",
		"^777777HIT 50 increase.^000000",
		"^777777FLEE 50 increase.^000000",
		"^777777SP consumption 30% decrease.^000000",
		"^777777HP recovery 100% increase.^000000",
		"^777777SP recovery 100% increase.^000000"
	].join("\n");

	SkillDescription[SKID.BD_ROKISWEIL] = [
		"Classical Pluck",
		"Max Lv : 1",
		"^777777Skill Requirement : Impressive Riff(Slow Grace) 10^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777ensemble skill^000000",
		"Target: ^777777 9*9 cells around the user^000000",
		"Description : ^777777For 60 seconds, all targets except the caster within the range of 9 X 9 cells will not be able to use skills and magic..",
		"This skill cannot be overlapped with other ensemble skills, and can only be used when the caster is equipped with an instrument or whip.",
		"Ensemble skill is activated when the bard / dancer in the party is within 9 x 9 cells",
		"Enters a ensemble aftermath(unavailable skill, reduced movement speed and attack speed) for 10 seconds.",
		"This skill can only be used in PVP / Sieze Mode.^000000",
		"^ffffff_^000000"
	].join("\n");

	SkillDescription[SKID.BD_INTOABYSS] = [
		"Power Cord",
		"Max Lv : 1",
		"^777777Skill Requirement : Lullaby 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ensemble Skill^000000",
		"Target : ^777777Self and Party members around 31 X 31 cell^000000",
		"Description : ^777777On-screen (31x31), Casts a skill to yourself and your party members that nullifies gemstone by 1 when using magic.",
		"It does not overlap with other Ensemble Skill and can only be used when the caster is equipping whips / instruments.",
		"Ensemble Skill only activates when Bard/ Dancer is within 9 X 9 cell. When Ensemble Skill is used, caster and partner becomes Aftereffect.",
		"Cannot use skills, movement speed and ASP reduction for 10 sec.^000000"
	].join("\n");

	SkillDescription[SKID.BD_SIEGFRIED] = [
		"Acoustic Rhythm",
		"Max Lv : 5",
		"^777777Skill Requirement : Magic Strings(Lady Luck) 10^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ensemble Skill^000000",
		"Target : ^777777Self and Party members around 31 X 31 cell^000000",
		"Description : ^777777On-screen (31x31), increases resistance of party members' Earth/Water/Fire/Wind resistance based on its skill level.",
		"Al increases resistance to Petrification, Stone, Frozen, Stun, Curse, Sleep, Silence, Confusion.",
		"It does not overlap with other Ensemble Skill and can only be used when the caster is equipping whips / instruments. ",
		"Ensemble Skill only activates when Bard/ Dancer is within 9 X 9 cell. When Ensemble Skill is used, caster and partner becomes Aftereffect.",
		"Cannot use skills, movement speed and ASP reduction for 10 sec.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Property Resistance + 3%, Status Effect Resistance + 5%^000000",
		"[Lv 2] : ^777777Property Resistance + 6%, Status Effect Resistance + 10%^000000",
		"[Lv 3] : ^777777Property Resistance + 9%, Status Effect Resistance + 15%^000000",
		"[Lv 4] : ^777777Property Resistance + 12%, Status Effect Resistance + 20%^000000",
		"[Lv 5] : ^777777Property Resistance + 15%, Status Effect Resistance + 25%^000000"
	].join("\n");

	SkillDescription[SKID.BD_RAGNAROK] = [ "Ragnarok" ].join("\n");

	SkillDescription[SKID.BA_MUSICALLESSON] = [
		"Musical Lesson",
		"Max Lv : 10",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enhances attack (Weapon Mastery) with Instrument class weapons and enables movement while playing songs.",
		"MaxSP always increases and ATK, Cirital Rate increases only with intruments.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK Bonus +3, Reduction of delay after atk 1%, MaxSP + 1%^000000",
		"[Lv 2] : ^777777ATK Bonus +6, Reduction of delay after atk 2% MaxSP + 2%^000000",
		"[Lv 3] : ^777777ATK Bonus +9, Reduction of delay after atk 3%, MaxSP + 3%^000000",
		"[Lv 4] : ^777777ATK Bonus +12, Reduction of delay after atk 4%, MaxSP + 4%^000000",
		"[Lv 5] : ^777777ATK Bonus +15, Reduction of delay after atk 5%, MaxSP + 5%^000000",
		"[Lv 6] : ^777777ATK Bonus +18, Reduction of delay after atk 6%, MaxSP + 6%^000000",
		"[Lv 7] : ^777777ATK Bonus +21, Reduction of delay after atk 7%, MaxSP + 7%^000000",
		"[Lv 8] : ^777777ATK Bonus +24, Reduction of delay after atk 8%, MaxSP + 8%^000000",
		"[Lv 9] : ^777777ATK Bonus +27, Reduction of delay after atk 9%, MaxSP + 9%^000000",
		"[Lv 10] : ^777777ATK Bonus +30, Reduction of delay after atk 10%, MaxSP + 10%^000000"
	].join("\n");

	SkillDescription[SKID.BA_MUSICALSTRIKE] = [
		"Melody Strike (Musical Strike)",
		"Max Lv : 5",
		"^777777Skill Requirement : Music Lessons 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ranged Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777can only be used when the instrument is mounted.",
		"Slings a bolt at a single target using the equipped Instrument.",
		"Each cast uses one arrow, the property of which depends the property of this skill.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 150% X 2^000000",
		"[Lv 2] : ^777777ATK 190% X 2^000000",
		"[Lv 3] : ^777777ATK 230% X 2^000000",
		"[Lv 4] : ^777777ATK 270% X 2^000000",
		"[Lv 5] : ^777777ATK 310% X 2^000000"
	].join("\n");

	SkillDescription[SKID.BA_DISSONANCE] = [
		"Unchained Serenade (Dissonance)",
		"Max Lv : 5",
		"^777777Skill Requirement : Amp 1, Music Lessons 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Instrument^000000",
		"Target: ^777777 9*9 cells around the user^000000",
		"Description : ^777777Performs a song that will inflict piercing damage to all enemies around the performer.",
		"Damage increases as the caster's job level increases. ",
		"It does not overlap with other playing skills and can only be used when the instrument is mounted. ",
		"This skill can only be used in PVP / Sieze Mode.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777MATK 110%^000000",
		"[Lv 2] : ^777777MATK 120%^000000",
		"[Lv 3] : ^777777MATK 130%^000000",
		"[Lv 4] : ^777777MATK 140%^000000",
		"[Lv 5] : ^777777MATK 150%^000000"
	].join("\n");

	SkillDescription[SKID.BA_FROSTJOKE] = [
		"Unbarring Octave",
		"Max Lv : 5",
		"^777777Skill Requirement : Encore 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Tells a lame joke loudly, which has a chance of leaving enemies frozen due to how boring it was.",
		"Skill level affects chance of effect.",
		"Bard's party members have a low probability of being frozen, and in PVP they have a chance of leaving all players frozen.",
		"The chance of frozen is reduced by the target's resistance to abnormal status.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Chance of freezing: 20%^000000",
		"[Lv 2] : ^777777Chance of freezing: 25%^000000",
		"[Lv 3] : ^777777Chance of freezing: 30%^000000",
		"[Lv 4] : ^777777Chance of freezing: 35%^000000",
		"[Lv 5] : ^777777Chance of freezing: 40%^000000"
	].join("\n");

	SkillDescription[SKID.BA_WHISTLE] = [
		"Perfect Tablature",
		"Max Lv : 10",
		"^777777Skill Requirement : Dissonance 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Instrumental Skill^000000",
		"Target : ^777777Self and Party members around 31 X 31 cell^000000",
		"Description : ^777777On-screen (31x31), increases party members' FLEE and perfect dodge.",
		"It does not overlap with other Instrumental Skill and can only be used when the caster is equipping instruments.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Flee + 20, Perfect Dodge +1^000000",
		"[Lv 2] : ^777777Flee + 22, Perfect Dodge +1^000000",
		"[Lv 3] : ^777777Flee + 24, Perfect Dodge +2^000000",
		"[Lv 4] : ^777777Flee + 26, Perfect Dodge +2^000000",
		"[Lv 5] : ^777777Flee + 28, Perfect Dodge +3^000000",
		"[Lv 6] : ^777777Flee + 30, Perfect Dodge +3^000000",
		"[Lv 7] : ^777777Flee + 32, Perfect Dodge +4^000000",
		"[Lv 8] : ^777777Flee + 34, Perfect Dodge +4^000000",
		"[Lv 9] : ^777777Flee + 36, Perfect Dodge +5^000000",
		"[Lv10] : ^777777Flee + 40, Perfect Dodge +5^000000"
	].join("\n");

	SkillDescription[SKID.BA_ASSASSINCROSS] = [
		"Impressive Riff",
		"Max Lv : 10",
		"^777777Skill Requirement : Dissonance 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Instrumental Skill^000000",
		"Target : ^777777Self and Party members around 31 X 31 cell^000000",
		"Description : ^777777On-screen (31x31), increases party members' ASPD.",
		"It does not overlap with other Instrumental Skill and can only be used when the caster is equipping instruments.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Increases ASPD(Reduce delay after attack by 1%)^000000",
		"[Lv 2] : ^777777Increases ASPD(Reduce delay after attack by 3%)^000000",
		"[Lv 3] : ^777777Increases ASPD(Reduce delay after attack by 5%)^000000",
		"[Lv 4] : ^777777Increases ASPD(Reduce delay after attack by 7%)^000000",
		"[Lv 5] : ^777777Increases ASPD(Reduce delay after attack by 9%)^000000",
		"[Lv 6] : ^777777Increases ASPD(Reduce delay after attack by 11%)^000000",
		"[Lv 7] : ^777777Increases ASPD(Reduce delay after attack by 13%)^000000",
		"[Lv 8] : ^777777Increases ASPD(Reduce delay after attack by 15%)^000000",
		"[Lv 9] : ^777777Increases ASPD(Reduce delay after attack by 17%)^000000",
		"[Lv10] : ^777777Increases ASPD(Reduce delay after attack by 20%)^000000"
	].join("\n");

	SkillDescription[SKID.BA_POEMBRAGI] = [
		"Magic Strings",
		"Max Lv : 10",
		"^777777Skill Requirement : Dissonance 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Instrumental Skill^000000",
		"Target : ^777777Self and Party members around 31 X 31 cell^000000",
		"Description : ^777777On-screen (31x31), reduces party members' variable casting time and global skill cooltime.",
		"It does not overlap with other Instrumental Skill and can only be used when the caster is equipping instruments.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Variable Casting- 2%, Global Cooltime- 3%^000000",
		"[Lv 2] : ^777777Variable Casting- 4%, Global Cooltime- 6%^000000",
		"[Lv 3] : ^777777Variable Casting- 6%, Global Cooltime- 9%^000000",
		"[Lv 4] : ^777777Variable Casting- 8%, Global Cooltime-12%^000000",
		"[Lv 5] : ^777777Variable Casting-10%, Global Cooltime-15%^000000",
		"[Lv 6] : ^777777Variable Casting-12%, Global Cooltime-18%^000000",
		"[Lv 7] : ^777777Variable Casting-14%, Global Cooltime-21%^000000",
		"[Lv 8] : ^777777Variable Casting-16%, Global Cooltime-24%^000000",
		"[Lv 9] : ^777777Variable Casting-18%, Global Cooltime-27%^000000",
		"[Lv10] : ^777777Variable Casting-20%, Global Cooltime-30%^000000"
	].join("\n");

	SkillDescription[SKID.BA_APPLEIDUN] = [
		"Song of Lutie",
		"Max Lv : 10",
		"^777777Skill Requirement : Dissonance 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Instrumental Skill^000000",
		"Target : ^777777Self and Party members around 31 X 31 cell^000000",
		"Description : ^777777On-screen (31x31), increases party members' Maximum HP and healings received.",
		"It does not overlap with other Instrumental Skill and can only be used when the caster is equipping instruments.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777MaxHP +10%, Healings Received + 2%^000000",
		"[Lv 2] : ^777777MaxHP +11%, Healings Received + 4%^000000",
		"[Lv 3] : ^777777MaxHP +12%, Healings Received + 6%^000000",
		"[Lv 4] : ^777777MaxHP +13%, Healings Received + 8%^000000",
		"[Lv 5] : ^777777MaxHP +14%, Healings Received +10%^000000",
		"[Lv 6] : ^777777MaxHP +15%, Healings Received +12%^000000",
		"[Lv 7] : ^777777MaxHP +16%, Healings Received +14%^000000",
		"[Lv 8] : ^777777MaxHP +17%, Healings Received +16%^000000",
		"[Lv 9] : ^777777MaxHP +18%, Healings Received +18%^000000",
		"[Lv10] : ^777777MaxHP +20%, Healings Received +20%^000000"
	].join("\n");

	SkillDescription[SKID.DC_DANCINGLESSON] = [
		"Dancing Lesson",
		"Max Lv : 10",
		"Skill Form : ^000099Passive^000000",
		"Description :  ^777777Enhances attack (Weapon Mastery) with Whip class weapons and enables movement while dancing.",
		"MaxSP always increases and ATK, Cirital Rate increases only with whip.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Whip Damage +3, CRI + 1, MaxSP + 1%^000000",
		"[Lv 2] : ^777777Whip Damage +6, CRI + 2, MaxSP + 2%^000000",
		"[Lv 3] : ^777777Whip Damage +9, CRI + 3, MaxSP + 3%^000000",
		"[Lv 4] : ^777777Whip Damage +12, CRI + 4, MaxSP + 4%^000000",
		"[Lv 5] : ^777777Whip Damage +15, CRI + 5, MaxSP + 5%^000000",
		"[Lv 6] : ^777777Whip Damage +18, CRI + 6, MaxSP + 6%^000000",
		"[Lv 7] : ^777777Whip Damage +21, CRI + 7, MaxSP + 7%^000000",
		"[Lv 8] : ^777777Whip Damage +24, CRI + 8, MaxSP + 8%^000000",
		"[Lv 9] : ^777777Whip Damage +27, CRI + 9, MaxSP + 9%^000000",
		"[Lv 10] : ^777777Whip Damage +30, CRI + 10, MaxSP + 10%^000000"
	].join("\n");

	SkillDescription[SKID.DC_THROWARROW] = [
		"Slinging Arrow (Throw Arrow)",
		"Max Lv : 5",
		"^777777Skill Requirement : Dancing Lesson 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ranged Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777 Available with Whip Skill.",
		"Slings a bolt at a single target using the equipped Whip.",
		"Each cast uses one arrow, the property of which depends the property of this skill.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 150% X 2^000000",
		"[Lv 2] : ^777777ATK 190% X 2^000000",
		"[Lv 3] : ^777777ATK 230% X 2^000000",
		"[Lv 4] : ^777777ATK 270% X 2^000000",
		"[Lv 5] : ^777777ATK 310% X 2^000000"
	].join("\n");

	SkillDescription[SKID.DC_UGLYDANCE] = [
		"Hip Shaker (Ugly Dance)",
		"Max Lv : 5",
		"^777777Skill Requirement : Amp 1, Dancing Lesson 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Dance skill^000000",
		"Target: ^7777779*9 cells around the user^000000",
		"Description : ^777777Performs a dance that will drain SP every 3 seconds of all enemies around the performer.",
		"As the skill level increases, the probability of success increases and can only be used when equipped with a whip. ",
		"This skill can only be used in PVP / Sieze Mode. ^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777SP hit 12%, success rate 25%^000000",
		"[Lv 2] : ^777777SP hit 14%, success rate 30%^000000",
		"[Lv 3] : ^777777SP hit 16%, success rate 35%^000000",
		"[Lv 4] : ^777777SP hit 18%, success rate 40%^000000",
		"[Lv 5] : ^777777SP hit 20%, success rate 45%^000000"
	].join("\n");

	SkillDescription[SKID.DC_SCREAM] = [
		"Dazzler",
		"Max Lv : 5",
		"^777777Skill Requirement : Encore 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Shouts a stunning sentence loudly, which has a chance of leaving enemies stunned due to the shock.",
		"Skill level affects stun chance.",
		"Dancer's party members have a low probability of being stun, and in PVP they have a chance of leaving all players stun.",
		"The chance of stun is reduced by the target's resistance to abnormal status.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Stun chance: 30%^000000",
		"[Lv 2] : ^777777Stun chance: 35%^000000",
		"[Lv 3] : ^777777Stun chance: 40%^000000",
		"[Lv 4] : ^777777Stun chance: 45%^000000",
		"[Lv 5] : ^777777Stun chance: 50%^000000"
	].join("\n");

	SkillDescription[SKID.DC_HUMMING] = [
		"Focus Ballet",
		"Max Lv : 10",
		"^777777Skill Requirement : Ugly Dance 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Dance Skill^000000",
		"Target : ^777777Self and Party members in 31x31 cell^000000",
		"Description : ^777777Increases HIT rate of all targets in an area based on its skill level.",
		"It does not overlap with other Dance Skills and can only be used when the caster has a whip equipped.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777HIT + 4^000000",
		"[Lv 2] : ^777777HIT + 8^000000",
		"[Lv 3] : ^777777HIT + 12^000000",
		"[Lv 4] : ^777777HIT + 16^000000",
		"[Lv 5] : ^777777HIT + 20^000000",
		"[Lv 6] : ^777777HIT + 24^000000",
		"[Lv 7] : ^777777HIT + 28^000000",
		"[Lv 8] : ^777777HIT + 32^000000",
		"[Lv 9] : ^777777HIT + 36^000000",
		"[Lv 10] : ^777777HIT + 40^000000"
	].join("\n");

	SkillDescription[SKID.DC_DONTFORGETME] = [
		"Slow Grace",
		"Max Lv : 10",
		"^777777Skill Requirement : Hip Shaker 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777dance skill^000000",
		"Target: ^777777 9*9 cells around the user^000000",
		"Description : ^777777Performs a dance that will drop attack and movement speed of all enemies around the performer for 60s.",
		"If the target has an effect of increasing movement speed or attack speed, it is canceled.",
		"It does not overlap with other playing skills and can only be used when the whip is mounted.",
		"This skill can only be used in PVP / Sieze Mode.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK Speed 3%, Movement Speed 2% 감소^000000",
		"[Lv 2] : ^777777ATK Speed 6%, Movement Speed 4% 감소^000000",
		"[Lv 3] : ^777777ATK Speed 9%, Movement Speed 6% 감소^000000",
		"[Lv 4] : ^777777ATK Speed 12%, Movement Speed 8% 감소^000000",
		"[Lv 5] : ^777777ATK Speed 15%, Movement Speed 10% 감소^000000",
		"[Lv 6] : ^777777ATK Speed 18%, Movement Speed 12% 감소^000000",
		"[Lv 7] : ^777777ATK Speed 21%, Movement Speed 14% 감소^000000",
		"[Lv 8] : ^777777ATK Speed 24%, Movement Speed 16% 감소^000000",
		"[Lv 9] : ^777777ATK Speed 27%, Movement Speed 18% 감소^000000",
		"[Lv10] : ^777777ATK Speed 30%, Movement Speed 20% 감소^000000"
	].join("\n");

	SkillDescription[SKID.DC_FORTUNEKISS] = [
		"Lady Luck",
		"Max Lv : 10",
		"^777777Skill Requirement : Ugly Dance 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Dance Skill^000000",
		"Target : ^777777Self and Party members around 31 X 31 cell^000000",
		"Description : ^777777On-screen (31x31), increases Critical Rate and Critical Damage of targets in area.",
		"It does not overlap with other Dance Skill and can only be used when the caster is equipping whips.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777CRI +1, Critical Damage + 2%^000000",
		"[Lv 2] : ^777777CRI +2, Critical Damage + 4%^000000",
		"[Lv 3] : ^777777CRI +3, Critical Damage + 6%^000000",
		"[Lv 4] : ^777777CRI +4, Critical Damage + 8%^000000",
		"[Lv 5] : ^777777CRI +5, Critical Damage + 10%^000000",
		"[Lv 6] : ^777777CRI +6, Critical Damage + 12%^000000",
		"[Lv 7] : ^777777CRI +7, Critical Damage + 14%^000000",
		"[Lv 8] : ^777777CRI +8, Critical Damage + 16%^000000",
		"[Lv 9] : ^777777CRI +9, Critical Damage + 18%^000000",
		"[Lv10] : ^777777CRI +10, Critical Damage + 20%^000000"
	].join("\n");

	SkillDescription[SKID.DC_SERVICEFORYOU] = [
		"Gypsy's Kiss",
		"Max Lv : 10",
		"^777777Skill Requirement : Ugly Dance 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Dance Skill^000000",
		"Target : ^777777Self and Party members around 31 X 31 cell^000000",
		"Description : ^777777On-screen (31x31), increases MaxSP, reduces SP consumption of targets in area.",
		"It does not overlap with other Dance Skill and can only be used when the caster is equipping whips.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777MaxSP + 10%, SP consumption: 6%^000000",
		"[Lv 2] : ^777777MaxSP + 11%, SP consumption: 7%^000000",
		"[Lv 3] : ^777777MaxSP + 12%, SP consumption: 8%^000000",
		"[Lv 4] : ^777777MaxSP + 13%, SP consumption: 9%^000000",
		"[Lv 5] : ^777777MaxSP + 14%, SP consumption: 10%^000000",
		"[Lv 6] : ^777777MaxSP + 15%, SP consumption: 11%^000000",
		"[Lv 7] : ^777777MaxSP + 16%, SP consumption: 12%^000000",
		"[Lv 8] : ^777777MaxSP + 17%, SP consumption: 13%^000000",
		"[Lv 9] : ^777777MaxSP + 18%, SP consumption: 14%^000000",
		"[Lv10] : ^777777MaxSP + 20%, SP consumption: 15%^000000"
	].join("\n");

	SkillDescription[SKID.KN_CHARGEATK] = [
		"Charge Attack",
		"^777777Skill Requirement : Quest complete^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777Consumes 40 SP. Quickly approach and attack a distant target.",
		"This skill inflicts damage at 700% of ATK and knocks the target 2 cells backward. Knocks 4 cells backward in PvP. This Knockback effect is disabled in WoE.^000000",
		"^ffffff_^000000"
	].join("\n");

	SkillDescription[SKID.CR_SHRINK] = [
		"Shrink",
		"^777777Skill Requirement : Quest complete^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description: ^777777Consumes 100 SP. Creates a high chance of Stunning enemies with a successful Guard within 15 minutes.",
		"Use this skill again for its duration to cancel its effect."
	].join("\n");

	SkillDescription[SKID.AS_SONICACCEL] = [
		"Sonic Acceleration",
		"^777777Skill Requirement : Quest complete^000000",
		"Skill Form : ^000099Passive^000000",
		"Description: ^777777Adjusts Sonic Blow HIT Rate by 90% and increases its damage by 90%.^000000"
	].join("\n");

	SkillDescription[SKID.AS_VENOMKNIFE] = [
		"Venom Knife",
		"^777777Skill Requirement : Quest complete^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ranged Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Description: ^777777Throws 1 Venom Knife you're equipping to the target to inflict Long-ranged Physical damage of 500% of ATK at the cost of 35 SP.",
		"Creates a high chance of Poisoning the target.^000000"
	].join("\n");

	SkillDescription[SKID.RG_CLOSECONFINE] = [
		"Close Confine",
		"^777777Skill Requirement : Quest complete^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Target: ^7777771 Target^000000",
		"Description: ^777777Takes hold of the attacker for 10 sec. to disable their movement at the cost of 40 SP. You become unable to move too.",
		"Receives a FLEE + 50 bonus while holding the target. If you use Fly Wing, Butterfly Wing, or Teleportation, get detached from the target due to knockdown or a Knockback skill, or go into Hiding status, this skill is automatically canceled.",
		"You cannot hold a Boss monster with this skill.^000000"
	].join("\n");

	SkillDescription[SKID.WZ_SIGHTBLASTER] = [
		"Sight Blaster",
		"^777777Skill Requirement : Quest complete^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Target: ^777777Caster Only^000000",
		"Description: ^777777Summons Sight's flame that roams around and protects you for 15 min. at the cost of 80 SP.",
		"If an enemy steps into 3 x3 range around you, inflicts Fire damage of 600% of MATK and knocks them back by 3 cells.",
		"The flame vanishes after inflicting damage.^000000"
	].join("\n");

	SkillDescription[SKID.SA_CREATECON] = [
		"Create Elemental Converter",
		"^777777Skill Requirement : Quest complete^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777create^000000",
		"Target: ^777777Caster Only^000000",
		"Description: ^777777Creates an Elemental Converter at the cost of 30 SP. You can create converters of four elements: Water, Wind, Earth, and Fire.^000000",
		"^ffffff_^000000",
		"[Elemental Converter (Water)]: ^7777771 Crystal Blue + 1 Blank Scroll^000000",
		"[Elemental Converter (Wind)]: ^7777771 Wind of Verdure + 1 Blank Scroll^000000",
		"[Elemental Converter (Earth)]: ^7777771 Green Live + 1 Blank Scroll^000000",
		"[Elemental Converter (Fire)]: ^7777771 Red Blood + 1 Blank Scroll^000000"
	].join("\n");

	SkillDescription[SKID.SA_ELEMENTWATER] = [
		"Elemental Change - Water",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Active^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Consume 1 Elemental Converter",
		"(Water Property) to attempt to change target",
		"monster's property to Water. This skill requires",
		"Elemental Converter items of the correct",
		"property, and has a chance of failing.^000000"
	].join("\n");

	SkillDescription[SKID.HT_PHANTASMIC] = [
		"Phantasmic Arrow",
		"^777777Skill Requirement : Quest complete^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ranged Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Description: ^777777Fires a phantasmic arrow at the target to inflict Long-ranged Physical damage at the cost of 50 SP. You don't need to equip arrows to use this skill.",
		"Inflicts Wind damage of 500% of ATK and knocks the target back by 3 cells upon hit.^000000"
	].join("\n");

	SkillDescription[SKID.BA_PANGVOICE] = [
		"Pang Voice",
		"^777777Skill Requirement : Quest complete^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Target: ^7777771 Target^000000",
		"Description: ^777777Shouts a horrible shriek to the target at the cost of 40 SP. Creates a high chance of Confusing and Bleeding them.",
		"Not applicable to Boss monsters.^000000"
	].join("\n");

	SkillDescription[SKID.DC_WINKCHARM] = [
		"Charming Wink",
		"^777777Skill Requirement : Quest complete^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Target: ^7777771 Target^000000",
		"Description: ^777777Sends a perturbing wink toward the target at the cost of 40 SP. Creates a high chance of Confusing and Hallucinating them.",
		"Not applicable to Boss monsters.^000000"
	].join("\n");

	SkillDescription[SKID.BS_UNFAIRLYTRICK] = [
		"Dubious Salesmanship",
		"^777777Skill Requirement : Quest complete^000000",
		"Skill Form : ^000099Passive^000000",
		"Description: ^777777Reduces the Zeny cost for Mammonite and Cart Termination by 20%.^000000"
	].join("\n");

	SkillDescription[SKID.BS_GREED] = [
		"Greed",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^7777772 cells around the Caster^000000",
		"Description: ^777777Automatically pick up every item",
		"within 2 cells of the caster. This skill cannot",
		"be used within towns, PvP maps, or in WoE.^000000"
	].join("\n");

	SkillDescription[SKID.PR_REDEMPTIO] = [
		"Redemptio",
		"^777777Skill Requirement : Quest complete^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Recovery^000000",
		"Target: ^777777Caster Only^000000",
		"Description: ^777777Reduces your HP to 1 and revives all the party members on the screen at the cost of 800 SP. Heals the HP of every revived player by 50%."
	].join("\n");

	SkillDescription[SKID.MO_KITRANSLATION] = [
		"Spiritual Bestowment",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^7777771 Party Member^000000",
		"Description: ^777777Transfer the caster's Spiritual",
		"Spheres to a targeted Party Member. Each cast",
		"will transfer 1 Spiritual Sphere.^000000"
	].join("\n");

	SkillDescription[SKID.MO_BALKYOUNG] = [
		"Excruciating Palm",
		"^777777Skill Requirement : Quest complete^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Focus your inner energies and attack an enemy. The targeted enemy receives 800% ATK damage, and adds a chance to push back and stun nearby monsters. Drains SP 40, HP 200 per use."
	].join("\n");

	SkillDescription[SKID.SA_ELEMENTGROUND] = [
		"Elemental Change - Ground",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Active^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Consume 1 Elemental Converter",
		"(Earth Property) to attempt to change target",
		"monster's property to Earth. This skill requires",
		"Elemental Converter items of the correct",
		"property, and has a chance of failing.^000000"
	].join("\n");

	SkillDescription[SKID.SA_ELEMENTFIRE] = [
		"Elemental Change - Fire",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Active^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Consume 1 Elemental Converter",
		"(Fire Property) to attempt to change target",
		"monster's property to Fire. This skill requires",
		"Elemental Converter items of the correct",
		"property, and has a chance of failing.^000000"
	].join("\n");

	SkillDescription[SKID.SA_ELEMENTWIND] = [
		"Elemental Change - Wind",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Active^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Consume 1 Elemental Converter",
		"(Wind Property) to attempt to change target",
		"monster's property to Wind. This skill requires",
		"Elemental Converter items of the correct",
		"property, and has a chance of failing.^000000"
	].join("\n");

	SkillDescription[SKID.HT_POWER] = [
		"Beast Charge",
		"^777777Skill Requirement : Double Strafe 10,",
		"Spirit State^000000",
		"Skill Form: ^777777Aggressive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Attack by using a modified form of",
		"Double Strafe that was developed to cause extra",
		"damage to Brute monsters. Caster's STR affects",
		"the amount of inflicted damage.^000000"
	].join("\n");

	SkillDescription[SKID.KN_ONEHAND] = [
		"One Hand Quicken",
		"^777777Skill Requirement : Two Hand Quicken 10,",
		"Spirit State^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Increase Attack Speed when using",
		"a One Handed Sword Class Weapon. Activating",
		"this skill cancels the effect of any any potions",
		"that have a similar effect, but it is possible",
		"to use these potions after One Hand Quicken has",
		"been cast. Unequipping Sword will cancel this",
		"skill's effect.^000000"
	].join("\n");

	SkillDescription[SKID.AM_TWILIGHT1] = [
		"Spiritual Potion Creation",
		"^777777Skill Requirement : Prepare Potion 10,",
		"Spirit State^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Consume 200 SP in order to make",
		"200 attempts to create a White Potion every",
		"0.005 seconds. This skill has the same success",
		"rate as the Prepare Potion skill and has a",
		"3 second cast time that is unaffected by DEX.",
		"^00BB00Each cast requires enough materials to craft",
		"200 White Potions.^000000"
	].join("\n");

	SkillDescription[SKID.AM_TWILIGHT2] = [
		"Spiritual Potion Creation",
		"^777777Skill Requirement : Prepare Potion 10,",
		"Spirit State^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777This skill is only enabled through",
		"the power of the Super Novice Guardian Angel.",
		"Consume 200 SP in order to make 200 attempts to",
		"create a White Potion every 0.005 seconds. This",
		"skill can earn Alchemist Ranking Points and has",
		"the same success rate as the Prepare Potion",
		"skill, as well as a 3 second cast time that",
		"is unaffected by DEX. Each cast requires enough",
		"materials to craft 200 White Potions.^000000"
	].join("\n");

	SkillDescription[SKID.AM_TWILIGHT3] = [
		"Spiritual Potion Creation",
		"^777777Skill Requirement : Prepare Potion 10,",
		"Spirit State^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777This skill is only enabled through",
		"the power of the Taekwon-Do Guardian Angel.",
		"Consume 200 SP in order to create 100 Alcohol,",
		"50 Acid Bottle and 50 Bottle Grenade. Each cast",
		"requires 50 Fabric, 50 Empty Bottle and enough",
		"materials to craft the produced items.^000000"
	].join("\n");

	SkillDescription[SKID.AM_BERSERKPITCHER] = [
		"Aid Berserk Potion",
		"^777777Skill Requirement : Spirit State^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Force the imbibing of Berserk",
		"Potions upon any job class. However, the",
		"duration of the increase in Attack Speed from",
		"this skill lasts only half as long as the",
		"Berserk Potion item.",
		"^00BB00Each cast requires 2 Berserk Potions.^000000"
	].join("\n");

	SkillDescription[SKID.BS_ADRENALINE2] = [
		"Advanced Adrenaline Rush",
		"^777777Skill Requirement : Adrenaline Rush 5,",
		"Spirit State^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Increase the Attack Speed of every",
		"weapon class except for Bows. Cannot be used in",
		"conjunction with skills that have similar",
		"effects such as Adrenaline Rush, One Hand",
		"Quicken, Two Hand Quicken, Spear Quicken,",
		"Impressive Riff, and Solar, Lunar and Stellar",
		"Shadow or Protection. Consumes 64 SP and has",
		"a duration of 150 seconds.^000000"
	].join("\n");

	SkillDescription[SKID.WE_MALE] = [
		"I'll save you",
		"Max Lv : 1",
		"^777777Skill Requirement : Wedding, wear wedding rings^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Recovery^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Can only be used for caster's partner.",
		"Use your own HP to recover your partner's HP.",
		"Cannot be used when the remaining HP is less than 10%.^000000"
	].join("\n");

	SkillDescription[SKID.WE_FEMALE] = [
		"I'll sacrifice myself for you",
		"Max Lv : 1",
		"^777777Skill Requirement : Wedding, wear wedding rings^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Recovery^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Can only be used for caster's partner.",
		"Use your own SP to recover your partner's SP.",
		"Cannot be used when the remaining SP is less than 10%.^000000"
	].join("\n");

	SkillDescription[SKID.WE_CALLPARTNER] = [
		"I'm missing you",
		"Max Lv : 1",
		"^777777Skill Requirement : Wedding, wear wedding rings^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Summons the partner on the same map to its location.",
		"Not available in areas where warp portal is not available.^000000"
	].join("\n");

	SkillDescription[SKID.WE_BABY] = [
		"Mom, Dad, I love you!",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Caster's parents will not lose any",
		"experience points if they die within this",
		"skill's 2 minute duration. Each cast consumes",
		"an amount of SP equal to 10% of the caster's ",
		"MaxSP.^000000"
	].join("\n");

	SkillDescription[SKID.WE_CALLPARENT] = [
		"Mom, Dad, I miss you!",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Summon parents to a spot that is",
		"adjacent to caster's current location.^000000"
	].join("\n");

	SkillDescription[SKID.WE_CALLBABY] = [
		"Come to me, honey~",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Parent summons adopted child to a",
		"spot adjacent to the parent's current location.^000000"
	].join("\n");

	SkillDescription[SKID.WE_CALLALLFAMILY] = [
		"Let's Go Family!.",
		"Max Lv : 1",
		"Class : ^777777Support^000000",
		"Effect : ^777777The family members on the same map are brought to your location.^000000",
		"^777777Your family members must be in the same party.^000000"
	].join("\n");

	SkillDescription[SKID.WE_ONEFOREVER] = [
		"Love Conquers Death.",
		"Max Lv : 1",
		"Class : ^777777Support^000000",
		"Target : ^777777A family member unable to fight^000000",
		"Effect : ^777777Restores a family member that is out of combat to HP 30%.^000000",
		"^777777The effect is not triggered if the family is in the Undead attribute.^000000"
	].join("\n");

	SkillDescription[SKID.WE_CHEERUP] = [
		"Go Parents Go!",
		"Max Lv : 1",
		"Class : ^777777Support / Buff^000000",
		"Effect : ^777777Increase all Parent's stats by +3 for 60 seconds within 7x7 cells around you.^000000"
	].join("\n");

	SkillDescription[SKID.ITM_TOMAHAWK] = [
		"Tomahawk Throwing",
		"Description : ^777777Inflicts 100% ranged Wind property physical damage to a single target by hurling the equipped Tomahawk at them.^000000"
	].join("\n");

	SkillDescription[SKID.LK_AURABLADE] = [
		"Aura Blade",
		"Max Lv : 5",
		"^777777Skill Requirement : Bash 5, Magnum Break 5, Two-Handed Sword Mastery 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Produces a special aura around the equipped weapon to strengthen its power temporarily.",
		"Damage is affected by the caster's base level.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Additional Damage : Base level X 4^000000",
		"[Lv 2] : ^777777Additional Damage : Base level X 5^000000",
		"[Lv 3] : ^777777Additional Damage : Base level X 6^000000",
		"[Lv 4] : ^777777Additional Damage : Base level X 7^000000",
		"[Lv 5] : ^777777Additional Damage : Base level X 8^000000"
	].join("\n");

	SkillDescription[SKID.LK_PARRYING] = [
		"Parrying",
		"Max Lv : 10",
		"^777777Skill Requirement : Provoke 5, Two-Handed Sword Mastery 10, Two Hand Quicken 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Allows the user to block physical attacks with the equipped two-handed sword by chance temporarily.",
		"Only available with two handed sword.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Block +23%^000000",
		"[Lv 2] : ^777777Block +26%^000000",
		"[Lv 3] : ^777777Block +29%^000000",
		"[Lv 4] : ^777777Block +32%^000000",
		"[Lv 5] : ^777777Block +35%^000000",
		"[Lv 6] : ^777777Block +38%^000000",
		"[Lv 7] : ^777777Block +41%^000000",
		"[Lv 8] : ^777777Block +44%^000000",
		"[Lv 9] : ^777777Block +47%^000000",
		"[Lv10] : ^777777Block +50%^000000"
	].join("\n");

	SkillDescription[SKID.LK_CONCENTRATION] = [
		"Spear Dynamo",
		"Max Lv : 5",
		"^777777Skill Requirement : HP Recovery 5, Spear Mastery 5, Riding 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777This skill also boosts attack power and Hit rate and endure effect at cost of physical defense.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777HIT +10, ATK + 7%, DEF - 7%^000000",
		"[Lv 2] : ^777777HIT +20, ATK + 9%, DEF - 9%^000000",
		"[Lv 3] : ^777777HIT +30, ATK +11%, DEF -11%^000000",
		"[Lv 4] : ^777777HIT +40, ATK +13%, DEF -13%^000000",
		"[Lv 5] : ^777777HIT +50, ATK +15%, DEF -15%^000000"
	].join("\n");

	SkillDescription[SKID.LK_TENSIONRELAX] = [
		"Tension Relax",
		"Max Lv : 1",
		"^777777Skill Requirement : Provoke 5, HP Recovery 10, Endure 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Sits down and relaxes to triple the HP Recovery rate.",
		"Standing up cancels this skill, whether the user manually stood up or was knocked out of sitting by an attack.^000000"
	].join("\n");

	SkillDescription[SKID.LK_BERSERK] = [
		"Berserk",
		"Max Lv : 1",
		"^777777Skill Requirement : over Lord Knight Job Level 50^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777HP increases, moving speed and attack power increases, but the flee rate decreases and all other actions are impossible.",
		"Items cannot be used, and it is impossible to be treated with heel skills. In this state, HP gradually decreases over time.",
		"After use, HP and SP do not recover naturally for 5 minutes.^000000"
	].join("\n");

	SkillDescription[SKID.LK_SPIRALPIERCE] = [
		"Clashing Spiral",
		"Max Lv : 5",
		"^777777Skill Requirement : Spear Mastery 10,",
		"Pierce 5, Peco Peco Riding 1, Spear Stab 5^000000",
		"Skill Form: ^777777Aggressive^000000",
		"Description: ^777777Hit an enemy with spiraling strikes",
		"that immobilize it for a second and inflict an",
		"amount of damage determined by the skill's",
		"level and the weight of the equipped weapon.",
		"This skill's level also affects its cast time",
		"and delay.^000000"
	].join("\n");

	SkillDescription[SKID.LK_HEADCRUSH] = [
		"Traumatic Blow",
		"Max Lv : 5",
		"^777777Skill Requirement : Spear Mastery 9,",
		"Peco Peco Riding 1^000000",
		"Skill Form: ^777777Aggressive^000000",
		"Description: ^777777Brutally strike an enemy with the",
		"chance of causing the Bleeding status, which",
		"will make the target continuously receive extra",
		"damage for a while.^000000",
		"[Lv 1]: ^777777Atk 140%^000000",
		"[Lv 2]: ^777777Atk 180%^000000",
		"[Lv 3]: ^777777Atk 220%^000000",
		"[Lv 4]: ^777777Atk 260%^000000",
		"[Lv 5]: ^777777Atk 300%^000000"
	].join("\n");

	SkillDescription[SKID.LK_JOINTBEAT] = [
		"Vital Strike",
		"Max Lv : 10",
		"^777777Skill Requirement :  Spear Mastery 9,",
		"Peco Peco Riding 1, Cavalier Mastery 3, Traumatic Blow 3^000000",
		"Skill Form: ^777777Aggressive^000000",
		"Description: ^777777Strike an enemy's vital points to",
		"cause various abnormal statuses. This skill's",
		"level affects the Attack Power and the success",
		"rate of causing abnormal status effects.",
		"^00BB00Requires Spear Class Weapon.^000000",
		"[Lv 1]: ^777777Atk 60%^000000",
		"[Lv 2]: ^777777Atk 70%^000000",
		"[Lv 3]: ^777777Atk 80%^000000",
		"[Lv 4]: ^777777Atk 90%^000000",
		"[Lv 5]: ^777777Atk 100%^000000",
		"[Lv 6]: ^777777Atk 110%^000000",
		"[Lv 7]: ^777777Atk 120%^000000",
		"[Lv 8]: ^777777Atk 130%^000000",
		"[Lv 9]: ^777777Atk 140%^000000",
		"[Lv 10]: ^777777Atk 150%^000000"
	].join("\n");

	SkillDescription[SKID.HP_ASSUMPTIO] = [
		"Assumptio",
		"Max Lv : 5",
		"^777777Skill Requirement : Angelus 1, Improved SP Recovery 3, Impositio Manus 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Places a temporary buff on a single target that doubles their Hard Defense and Hard Magic Defense.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777DEF + 50, Received heal amount + 2%, Duration 20sec^000000",
		"[Lv 2] : ^777777DEF +100, Received heal amount + 4%, Duration 40sec^000000",
		"[Lv 3] : ^777777DEF +150, Received heal amount + 6%, Duration 60sec^000000",
		"[Lv 4] : ^777777DEF +200, Received heal amount + 8%, Duration 80sec^000000",
		"[Lv 5] : ^777777DEF +250, Received heal amount +10%, Duration 100sec^000000"
	].join("\n");

	SkillDescription[SKID.HP_BASILICA] = [
		"Basilica",
		"Max Lv : 5",
		"^777777Skill Requirement : Gloria 2, Improved SP Recovery 1, Kyrie Eleison 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target : ^777777Immediately^000000",
		"Description : ^777777Enhances itself by accepting the power of sanctuary temporarily.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Magic damage + 3%, Physical damage + 5%^000000",
		"[Lv 2] : ^777777Magic damage + 6%, Physical damage +10%^000000",
		"[Lv 3] : ^777777Magic damage + 9%, Physical damage +15%^000000",
		"[Lv 4] : ^777777Magic damage +12%, Physical damage +20%^000000",
		"[Lv 5] : ^777777Magic damage +15%, Physical damage +25%^000000"
	].join("\n");

	SkillDescription[SKID.HP_MEDITATIO] = [
		"Meditatio",
		"Max Lv : 10",
		"^777777Skill Requirement : Improved SP Recovery 5, Lex Divina 5, Aspersio 3^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Increases the player's Maximum SP and SP regeneration rate.",
		" It also increases the amount of HP that is restored using the Heal skill.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777MaxSP +1%, SP Regeneration 3% increase^000000",
		"[Lv 2] : ^777777MaxSP +2%, SP Regeneration 6% increase^000000",
		"[Lv 3] : ^777777MaxSP +3%, SP Regeneration 9% increase^000000",
		"[Lv 4] : ^777777MaxSP +4%, SP Regeneration 12% increase^000000",
		"[Lv 5] : ^777777MaxSP +5%, SP Regeneration 15% increase^000000",
		"[Lv 6] : ^777777MaxSP +6%, SP Regeneration 18% increase^000000",
		"[Lv 7] : ^777777MaxSP +7%, SP Regeneration 21% increase^000000",
		"[Lv 8] : ^777777MaxSP +8%, SP Regeneration 24% increase^000000",
		"[Lv 9] : ^777777MaxSP +9%, SP Regeneration 27% increase^000000",
		"[Lv10] : ^777777MaxSP +10%, SP Regeneration 30% increase^000000"
	].join("\n");

	SkillDescription[SKID.HW_SOULDRAIN] = [
		"Soul Drain",
		"Max Lv : 10",
		"^777777Skill Requirement : SP Recovery 5, Soul Strike 7^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enhances Max HSP, allows to absorb SP based on monster's level when they're killed with single target spells.",
		"(The effect is determined based on the skill used just before the effect of the soul drain is activated) ^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777MaxSP +2%^000000",
		"[Lv 2] : ^777777MaxSP +4%^000000",
		"[Lv 3] : ^777777MaxSP +6%^000000",
		"[Lv 4] : ^777777MaxSP +8%^000000",
		"[Lv 5] : ^777777MaxSP +10%^000000",
		"[Lv 6] : ^777777MaxSP +12%^000000",
		"[Lv 7] : ^777777MaxSP +14%^000000",
		"[Lv 8] : ^777777MaxSP +16%^000000",
		"[Lv 9] : ^777777MaxSP +18%^000000",
		"[Lv10] : ^777777MaxSP +20%^000000"
	].join("\n");

	SkillDescription[SKID.HP_MANARECHARGE] = [
		"Spiritual Thrift",
		"Max Lv : 5",
		"^777777Skill Requirement : Mace Mastery 10,",
		"Demon Bane 10^000000",
		"Description: ^777777Reduce the amount of SP that is",
		"consumed by skills.^000000",
		"Reduction of SP Consumption By Level",
		"[Lv 1]:^7777774%^000000",
		"[Lv 2]:^7777778%^000000",
		"[Lv 3]:^77777712%^000000",
		"[Lv 4]:^77777716%^000000",
		"[Lv 5]:^77777720%^000000"
	].join("\n");

	SkillDescription[SKID.HW_MAGICCRASHER] = [
		"Stave Crasher (Magic Crasher)",
		"Max Lv : 1",
		"^777777Skill Requirement : Improved SP Recovery 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ranged Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Description : ^777777Combines attack and magic to strike a single target from distance and inflict ranged physical damage.^000000"
	].join("\n");

	SkillDescription[SKID.HW_MAGICPOWER] = [
		"Mystical Amplification",
		"Max Lv : 10",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target : ^777777Self^000000",
		"Description : ^777777Increases base MATK for 60 sec.^000000",
		"^ffffff_^000000",
		"[Level 1] : ^777777MATK + 5%^000000",
		"[Level 2] : ^777777MATK +10%^000000",
		"[Level 3] : ^777777MATK +15%^000000",
		"[Level 4] : ^777777MATK +20%^000000",
		"[Level 5] : ^777777MATK +25%^000000",
		"[Level 6] : ^777777MATK +30%^000000",
		"[Level 7] : ^777777MATK +35%^000000",
		"[Level 8] : ^777777MATK +40%^000000",
		"[Level 9] : ^777777MATK +45%^000000",
		"[Level 10] : ^777777MATK +50%^000000"
	].join("\n");

	SkillDescription[SKID.HW_GANBANTEIN] = [
		"Ganbantein",
		"Max Lv : 1",
		"^777777Skill Requirement : Sense 1, Icewall 1^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Enable the chance of canceling any",
		"ground targeting magic spell cast on a 3*3 cell",
		"area around the targeted spot. This skill will",
		"cancel Magnetic Earth on areas that have been",
		"enchanted by that skill. This skill is",
		"unaffected by items or skills that remove",
		"Gemstone requirements. ^00BB00Each cast requires",
		"1 Blue Gemstone and Yellow Gemstone.",
		"^7777775 second Cast Delay.^000000"
	].join("\n");

	SkillDescription[SKID.HW_GRAVITATION] = [
		"Gravitational Field",
		"Max Lv : 5",
		"^777777Skill Requirement : Quagmire 1,",
		"Stave Crasher 1, Mystical Amplification 10^000000",
		"Target: ^777777Ground^000000",
		"Description: ^777777Increase the gravity in a 5*5 cell",
		"area around a targeted spot which will decrease",
		"the Movement and ASPD of enemies within",
		"range, as well as cause continuous damage that",
		"will pierce Defense. This skill's effect on",
		"Movement and ASPD does not apply to",
		"Boss monsters.",
		"[Lv 1]:^7777775 Sec Duration Enemy Speed -5%",
		" 400 Damage/Sec^000000",
		"[Lv 2]:^7777776 Sec Duration Enemy Speed -10%",
		" 600 Damage/Sec^000000",
		"[Lv 3]:^7777777 Sec Duration Enemy Speed -15%",
		" 800 Damage/Sec^000000",
		"[Lv 4]:^7777778 Sec Duration Enemy Speed -20%",
		" 1,000 Damage/Sec^000000",
		"[Lv 5]:^7777779 Sec Duration Enemy Speed -25%",
		" 1,200 Damage/Sec^000000"
	].join("\n");

	SkillDescription[SKID.HW_NAPALMVULCAN] = [
		"Napalm Vulcan",
		"Max Lv : 5",
		"^777777Skill Requirement : Napalm Beat 5^000000",
		"Skill Form: ^777777Aggressive",
		"^bb00bb(Psychokinesis)^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Deliver multiple psychokinetic",
		"blows at an enemy with a low chance of causing",
		"an abnormal status. This skill's level affects",
		"the number of strikes from Napalm Vulcan.^000000"
	].join("\n");

	SkillDescription[SKID.PA_PRESSURE] = [
		"Gloria Domini",
		"Max Lv : 5",
		"^777777Skill Requirement : Endure 5, Faith 5, Smite 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Target: ^7777771 Target^000000",
		"Description: ^777777Summon a massive crucifix to magical attack",
		"enemies with Holy property.",
		"^ffffff_^000000",
		"[Lv 1] : ^777777MATK 650%^000000",
		"[Lv 2] : ^777777MATK 800%^000000",
		"[Lv 3] : ^777777MATK 950%^000000",
		"[Lv 4] : ^777777MATK 1100%^000000",
		"[Lv 5] : ^777777MATK 1250%^000000"
	].join("\n");

	SkillDescription[SKID.PA_SACRIFICE] = [
		"Martyr's Reckoning",
		"Max Lv : 5",
		"^777777Skill Requirement : Endure 1, Sacrifice 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Target^000000",
		"Description: ^777777Change 5 physical attacks",
		"after activating this skill into special attack.",
		"Each attack enhanced by Martyr's Reckoning will drain an",
		"amount of HP equal to 9% of character's MaxHP.",
		"This skill can make the caster killed.^000000",
		"^ffffff_^000000",
		"[Lv 1]: ^777777Damage times 1^000000",
		"[Lv 2]: ^777777Damage*1.1^000000",
		"[Lv 3]: ^777777Damage*1.2^000000",
		"[Lv 4]: ^777777Damage*1.3^000000",
		"[Lv 5]: ^777777Damage*1.4^000000"
	].join("\n");

	SkillDescription[SKID.PA_GOSPEL] = [
		"Battle Chant",
		"Max Lv : 10",
		"^777777Skill Requirement : Faith 8, Divine Protection 3, Demon Bane 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target : ^777777Immediately^000000",
		"Description: ^777777Sing a hymn that will cause one",
		"out of 10 different negative status effects to",
		"enemies and will endow one out of 10 positive",
		"statuses upon Party Members within this skill's",
		"range. This skill is cancelled if the caster is",
		"muted during the casting of Battle Chant.^000000"
	].join("\n");

	SkillDescription[SKID.CH_PALMSTRIKE] = [
		"Raging Palm Strike",
		"Max Lv : 5",
		"^777777Skill Requirement : Iron Fists 7, Summon Spirit Sphere 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Description: ^777777Strike an enemy using the palms,",
		"pushing back the enemy and causing damage, which",
		"is determined by the skill's level, after a",
		"1 second delay. This skill can only be used",
		"during the ^00BB00Fury status^777777.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 300%^000000",
		"[Lv 2] : ^777777ATK 400%^000000",
		"[Lv 3] : ^777777ATK 500%^000000",
		"[Lv 4] : ^777777ATK 600%^000000",
		"[Lv 5] : ^777777ATK 700%^000000"
	].join("\n");

	SkillDescription[SKID.CH_TIGERFIST] = [
		"Glacier Fist",
		"Max Lv : 5",
		"^777777Skill Requirement : Iron Fists 5, Raging Trifecta Blow 5, Raging Thrust 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Description: ^777777A combo skill that can be cast",
		"after using Raging Quadruple Blow. An enemy hit",
		"by this skill is immobilized for a short period",
		"of time. ^00BB00Each cast requires 1 Spirit Sphere.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 650%, Freezing Chance 20%^000000",
		"[Lv 2] : ^777777ATK 800%, Freezing Chance 30%^000000",
		"[Lv 3] : ^777777ATK 950%, Freezing Chance 40%^000000",
		"[Lv 4] : ^777777ATK 1100%, Freezing Chance 50%^000000",
		"[Lv 5] : ^777777ATK 1250%, Freezing Chance 60%^000000"
	].join("\n");

	SkillDescription[SKID.CH_CHAINCRUSH] = [
		"Chain Crush Combo",
		"Max Lv : 10",
		"^777777Skill Requirement : Iron Fists 5, Summon Spirit Sphere 5, Glacier Fist 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Description: ^777777A combo skill that can be cast",
		"after using Raging Thrust. Glacier Fist cannot",
		"be used after this skill, although it can be",
		"followed up with Guillotine Fist.",
		"^00BB00Each cast requires 1 Spirit Spheres.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 200%^000000",
		"[Lv 2] : ^777777ATK 400%^000000",
		"[Lv 3] : ^777777ATK 600%^000000",
		"[Lv 4] : ^777777ATK 800%^000000",
		"[Lv 5] : ^777777ATK 1000%^000000",
		"[Lv 6] : ^777777ATK 1200%^000000",
		"[Lv 7] : ^777777ATK 1400%^000000",
		"[Lv 8] : ^777777ATK 1600%^000000",
		"[Lv 9] : ^777777ATK 1800%^000000",
		"[Lv10] : ^777777ATK 2000%^000000"
	].join("\n");

	SkillDescription[SKID.CH_SOULCOLLECT] = [
		"Zen",
		"Max Lv : 1",
		"^777777Skill Requirement : Fury 5^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Summon 5 Spirit Spheres at one time.",
		"The cast time of this skill is double the time",
		"of the Summon Spirit Sphere skill.^000000"
	].join("\n");

	SkillDescription[SKID.PF_DOUBLECASTING] = [
		"Double Bolt",
		"Max Lv : 5",
		"^777777Skill Requirement : Hindsignts 1^000000",
		"Description: ^777777Enable the chance of repeating any",
		"Bolt skill that is cast for this skill's",
		"90 second duration.^000000",
		"Chance of Double Casting Bolt Skill By Level",
		"[Lv 1]: ^77777740%^000000",
		"[Lv 2]: ^77777750%^000000",
		"[Lv 3]: ^77777760%^000000",
		"[Lv 4]: ^77777770%^000000",
		"[Lv 5]: ^77777780%^000000"
	].join("\n");

	SkillDescription[SKID.PF_HPCONVERSION] = [
		"Indulge",
		"Max Lv : 5",
		"^777777Skill Requirement : Improved SP Recovery 1, Magic Rod 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description: ^777777Consume an amount of HP equal to",
		"10% of MaxHP to restore an SP amount",
		"determined by the skill's level.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777SP +10% of reduced HP^000000",
		"[Lv 2] : ^777777SP +20% of reduced HP^000000",
		"[Lv 3] : ^777777SP +30% of reduced HP^000000",
		"[Lv 4] : ^777777SP +40% of reduced HP^000000",
		"[Lv 5] : ^777777SP +50% of reduced HP^000000"
	].join("\n");

	SkillDescription[SKID.PF_SOULCHANGE] = [
		"Soul Exhale",
		"Max Lv : 1",
		"^777777Skill Requirement : Magic Rod 3, Spell Breaker 2^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^7777771 Target^000000",
		"Description: ^777777Exchange caster's remaining SP with",
		"target's remaining SP. The SP that the caster",
		"receives cannot exceed the caster's MaxSP limit.^000000"
	].join("\n");

	SkillDescription[SKID.PF_SOULBURN] = [
		"Soul Siphon",
		"Max Lv : 5",
		"^777777Skill Requirement : Cast Cancel 5, Magic Rod 3, Dispell 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Magic^000000",
		"Target: ^7777771 Target^000000",
		"Description: ^777777Cast a spell that has the chance",
		"of draining the target's SP. At level 5, this",
		"skill will also inflict an amount of damage",
		"equal to double of the caster's remaining SP.",
		"However, if this skill fails, this damage will",
		"be received by the caster. Soul Siphon is only",
		"enabled in WoE (Guild War) battles and PvP.^000000",
		"[Lv 1]: ^77777740% Success Rate^000000",
		"[Lv 2]: ^77777750% Success Rate^000000",
		"[Lv 3]: ^77777760% Success Rate^000000",
		"[Lv 4]: ^77777770% Success Rate^000000",
		"[Lv 5]: ^77777770% Success Rate^000000"
	].join("\n");

	SkillDescription[SKID.PF_MINDBREAKER] = [
		"Mind Breaker",
		"Max Lv : 5",
		"^777777Skill Requirement : Improved SP Recovery 3,",
		"Soul Siphon 2^000000",
		"Skill Form: ^777777Supportive^000000",
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
		"Foresight",
		"Max Lv : 1",
		"^777777Skill Requirement : Study 5, Hindsight 1,",
		"Free Cast 5^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Reduce cast time for a skill by",
		"half for 5 casts. This skill is canceled when",
		"caster dies, but otherwise it has no duration.",
		"Foresight's cast time, which is unaffected by",
		"DEX, is 5 seconds.^000000"
	].join("\n");

	SkillDescription[SKID.PF_FOGWALL] = [
		"Blinding Mist",
		"Max Lv : 1",
		"^777777Skill Requirement : Whirlwind 2, Deluge 2^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Create a wall of fog in a 5*3 cell",
		"area that will cause the Blind status on players",
		"and monsters. All long ranged attacks targeted",
		"at players within the skill's range will have",
		"a greater chance of missing and have reduced",
		"damage. Negative effects only apply to monsters",
		"in normal fields, but will also apply to players",
		"in PvP zones."
	].join("\n");

	SkillDescription[SKID.PF_SPIDERWEB] = [
		"Fiber Lock",
		"Max Lv : 1",
		"^777777Skill Requirement : Dragonology 4^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Shoot a spider web that will bind",
		"and immobilize a target, and decrease its Flee",
		"Rate by half for 8 seconds. Fire property",
		"attacks will cause 2.5 times more damage on",
		"Fiber Locked targets and cancel the Fiber",
		"Locked status. A Maximum of 2 Spider Webs can",
		"be shot at once. ^00BB00Each cast requires 1 Cobweb.^000000"
	].join("\n");

	SkillDescription[SKID.ASC_METEORASSAULT] = [
		"Meteor Assault",
		"Max Lv : 10",
		"Skill Requirement :^777777Katar Mastery 5,",
		"Righthand Mastery 3, Sonic Blow 5,",
		"Soul Destroyer 1^000000",
		"Skill Form: ^777777Aggressive^000000",
		"Description: ^777777Damage all enemies in a 5*5 cell",
		"area around the caster with the chance of",
		"causing statuses such as Stun, Blind or Bleed.",
		"[Lv 1]: ^777777Atk 80%^000000",
		"[Lv 2]: ^777777Atk 120%^000000",
		"[Lv 3]: ^777777Atk 160%^000000",
		"[Lv 4]: ^777777Atk 200%^000000",
		"[Lv 5]: ^777777Atk 240%^000000",
		"[Lv 6]: ^777777Atk 280%^000000",
		"[Lv 7]: ^777777Atk 320%^000000",
		"[Lv 8]: ^777777Atk 360%^000000",
		"[Lv 9]: ^777777Atk 400%^000000",
		"[Lv 10]: ^777777Atk 440%^000000"
	].join("\n");

	SkillDescription[SKID.ASC_CDP] = [
		"Create Deadly Poison",
		"Max Lv : 1",
		"^777777Skill Requirement :  Envenom 10, Detoxify 1,",
		"Enchant Poison 5^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Create a bottle of Deadly Poison",
		"that will increase the Attack Speed of Assassin",
		"Crosses with the risk of being inflicted with",
		"the Poison status, but will instantly kill",
		"characters in any other job if they drink it.",
		"Caster's DEX and LUK affect this skill's",
		"success rate. If this skill fails, the caster",
		"loses an amount of HP equal to 25% of",
		"his MaxHP.",
		"Items Required to create Deadly Poison:^777777",
		"1 Empty Bottle",
		"1 Poison Spore",
		"1 Venom Canine",
		"1 Bee Sting",
		"1 Cactus Needle",
		"1 Berserk Potion",
		"1 Karvodailnirol^000000"
	].join("\n");

	SkillDescription[SKID.ASC_KATAR] = [
		"Advanced Katar Mastery",
		"Max Lv : 5",
		"^777777Skill Requirement : Double Attack 5, Katar Matery 7^000000",
		"Skill Form : ^000099Passive^000000",
		"Description : ^777777Enhance the damage that is",
		"inflicted with Katar Class Weapons.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Damage +12%^000000",
		"[Lv 2] : ^777777Damage +14%^000000",
		"[Lv 3] : ^777777Damage +16%^000000",
		"[Lv 4] : ^777777Damage +18%^000000",
		"[Lv 5] : ^777777Damage +20%^000000"
	].join("\n");

	SkillDescription[SKID.ASC_EDP] = [
		"Enchant Deadly Poison",
		"Max Lv : 5",
		"^777777Skill Requirement : Create Deadly Poison 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^777777Caster Only^000000",
		"Description: ^777777Enchant a weapon with deadly",
		"poison to enhance its damage and poison",
		"targets by chance, causing the target's HP to",
		"dramatically decrease for the poison's duration.",
		"^00BB00Each cast requires 1 Poison Bottle.^000000"
	].join("\n");

	SkillDescription[SKID.ASC_BREAKER] = [
		"Soul Destroyer",
		"Max Lv : 10",
		"^777777Skill Requirement : Double Attack 5, Envenom 5, Cloaking 3, Enchant Poison 6^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ranged physical^000000",
		"Target : ^7777771 target^000000",
		"Description : ^777777Deals strong ranged physical damage to a target.",
		"Only the half of Critical Chance is applied. Damage increases based on BaseLv, STR and INT.",
		"Only the half of Critical Damage option applies.^000000",
		"[Lv 1] : ^777777ATK 150%^000000",
		"[Lv 2] : ^777777ATK 300%^000000",
		"[Lv 3] : ^777777ATK 450%^000000",
		"[Lv 4] : ^777777ATK 600%^000000",
		"[Lv 5] : ^777777ATK 750%^000000",
		"[Lv 6] : ^777777ATK 900%^000000",
		"[Lv 7] : ^777777ATK 1050%^000000",
		"[Lv 8] : ^777777ATK 1200%^000000",
		"[Lv 9] : ^777777ATK 1350%^000000",
		"[Lv10] : ^777777ATK 1500%^000000"
	].join("\n");

	SkillDescription[SKID.SN_SIGHT] = [
		"Falcon Eyes",
		"Max Lv : 10",
		"^777777Skill Requirement : Owl's Eye 10 , Vulture's Eye 10,",
		"Improve Concentration 10, Falconly Mastery 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^777777Caster Only^000000",
		"Description: ^777777Add +5 to all Stats, as well as",
		"increase Attack Accuracy (Hit), Weapon Damage",
		"and Critical Attack Rate.^000000",
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
		"Max Lv : 5",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Special Ranged Attack^000000",
		"Target: ^7777771 Target^000000",
		"^777777Skill Requirement : Vulture's Eye 5, Falconly Mastery 1, Blitz Beat 5, Steel Crow 3^000000",
		"Description: ^777777Command Falcon to attack an",
		"enemy with numerous strikes.",
		"Damage is increased by Skill level and the caster's base level.^000000"
	].join("\n");

	SkillDescription[SKID.SN_SHARPSHOOTING] = [
		"Focused Arrow Strike",
		"Max Lv : 5",
		"^777777Skill Requirement : Double Strafe 5, Attention Concentrate 10^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ranged physical^000000",
		"Target : ^777777Target 1^000000",
		"Description : ^777777Inflicts ranged physical damage to all enemies within the Area of Effect of 5x5 cell.",
		"Half of Critical chance is applied.",
		"Half of Critical damage option is applied.",
		"Range of Sharp Shooting is fixed at 11cell.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 600%^000000",
		"[Lv 2] : ^777777ATK 900%^000000",
		"[Lv 3] : ^777777ATK 1200%^000000",
		"[Lv 4] : ^777777ATK 1500%^000000",
		"[Lv 5] : ^777777ATK 1800%^000000"
	].join("\n");

	SkillDescription[SKID.SN_WINDWALK] = [
		"Wind Walker",
		"Max Lv : 10",
		"^777777Skill Requirement : Improve Concentration 9^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description: ^777777Increase the Movement Speed and",
		"Flee Rate of the caster and Party Members.",
		"However, Movement Speed will not be increased",
		"if a similar effect, such as Increase AGI, has",
		"already been cast. Skills which decrease",
		"Movement Speed, such as Quagmire, cancel the",
		"Movement Speed increase from Wind Walker.^000000"
	].join("\n");

	SkillDescription[SKID.WS_MELTDOWN] = [
		"Shattering Strike",
		"Max Lv : 10",
		"^777777Skill Requirement : Skin Tempering 3, Hilt Binding 1,",
		"Weaponry Research 5, Power Thrust 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description: ^777777This skill has the chance of",
		"destroying an equipped weapon or armor when",
		"used in PvP zones on other players, or to",
		"decrease Attack Power or Defense when used on",
		"monsters. This skill's level affects its",
		"duration and rate of success.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777Duration 15 sec^000000",
		"[Lv 2] : ^777777Duration 20 sec^000000",
		"[Lv 3] : ^777777Duration 25 sec^000000",
		"[Lv 4] : ^777777Duration 30 sec^000000",
		"[Lv 5] : ^777777Duration 35 sec^000000",
		"[Lv 6] : ^777777Duration 40 sec^000000",
		"[Lv 7] : ^777777Duration 45 sec^000000",
		"[Lv 8] : ^777777Duration 50 sec^000000",
		"[Lv 9] : ^777777Duration 55 sec^000000",
		"[Lv10] : ^777777Duration 60 sec^000000"
	].join("\n");

	SkillDescription[SKID.WS_CREATECOIN] = [].join("\n");

	SkillDescription[SKID.WS_CREATENUGGET] = [].join("\n");

	SkillDescription[SKID.WS_CARTBOOST] = [
		"Cart Boost",
		"Max Lv : 1",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"^777777Skill Requirement : Push Cart 5, Hilt Binding 1, Cart Revolution, Change Cart^000000",
		"Description: ^777777Increase Movement Speed when",
		"a Pushcart is equipped. Effects which decrease",
		"Movement Speed cannot interfere with this skill.^000000"
	].join("\n");

	SkillDescription[SKID.WS_SYSTEMCREATE] = [].join("\n");

	SkillDescription[SKID.ST_CHASEWALK] = [
		"Stealth",
		"Max Lv : 5",
		"^777777Skill Requirement : Hiding 5, Stalk 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description: ^777777Enter a special Hiding status in",
		"which caster can move without being detected by",
		"skills such as Improve Concentration, Sight or",
		"Ruwach. However, the caster will leave",
		"footprints and can be damaged by skills that",
		"target the ground. Ineffective against Insect,",
		"Devil and Boss monsters. During WoE (Guild War),",
		"this skill will consume 5 times as much SP.^000000",
		"^ffffff_^000000",
		"[Lv 1]: ^77777712 SP/10 sec 70% Movement Speed",
		" +1 STR added after 1st 10 sec^000000",
		"[Lv 2]: ^77777714 SP/10 sec 75% Movement Speed",
		" +2 STR added after 1st 10 sec^000000",
		"[Lv 3]: ^77777716 SP/10 sec 80% Movement Speed",
		" +4 STR added after 1st 10 sec^000000",
		"[Lv 4]: ^77777718 SP/10 sec 85% Movement Speed",
		" +8 STR added after 1st 10 sec^000000",
		"[Lv 5]: ^77777720 SP/10 sec 90% Movement Speed",
		" +16 STR added after 1st 10 sec^000000"
	].join("\n");

	SkillDescription[SKID.ST_REJECTSWORD] = [
		"Counter Instinct",
		"Max Lv : 5",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description: ^777777If an enemy is using a Sword Class",
		"Weapon, activating this skill can deflect",
		"attacks, reducing damage from Swords by half.",
		"A total of 3 attacks can be deflected after",
		"this skill is cast. On monsters, the damage",
		"that is deflected will be directed back at the",
		"monster.",
		"^ffffff_^000000",
		"[Lv 1]: ^77777715% Deflect Sword Attack Success^000000",
		"[Lv 2]: ^77777730% Deflect Sword Attack Success^000000",
		"[Lv 3]: ^77777745% Deflect Sword Attack Success^000000",
		"[Lv 4]: ^77777760% Deflect Sword Attack Success^000000",
		"[Lv 5]: ^77777775% Deflect Sword Attack Success^000000"
	].join("\n");

	SkillDescription[SKID.ST_STEALBACKPACK] = [].join("\n");

	SkillDescription[SKID.CR_ALCHEMY] = [].join("\n");

	SkillDescription[SKID.CR_SYNTHESISPOTION] = [].join("\n");

	SkillDescription[SKID.CG_ARROWVULCAN] = [
		"Arrow Vulcan",
		"Max Lv : 10",
		"^777777Skill Requirement : Double Strafe 5, Arrow Shower 5, Melody Strike(Slinging Arrow) 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ranged Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Description: ^777777Fire an awesome flurry of arrows at",
		"a targeted enemy. ^00BB00Requires Musical Instrument",
		"Class Weapon^777777for Minstrels and ^00BB00Whip Class Weapon^777777",
		"for Gypsies.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 600%^000000",
		"[Lv 2] : ^777777ATK 700%^000000",
		"[Lv 3] : ^777777ATK 800%^000000",
		"[Lv 4] : ^777777ATK 900%^000000",
		"[Lv 5] : ^777777ATK1000%^000000",
		"[Lv 6] : ^777777ATK1100%^000000",
		"[Lv 7] : ^777777ATK1200%^000000",
		"[Lv 8] : ^777777ATK1300%^000000",
		"[Lv 9] : ^777777ATK1400%^000000",
		"[Lv10] : ^777777ATK1500%^000000"
	].join("\n");

	SkillDescription[SKID.CG_MOONLIT] = [
		"Sheltering Bliss",
		"Max Lv : 5",
		"^777777Skill Requirement : Improve Concentration 5, Music(Dance) Lessons 7^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ensemble^000000",
		"Target : ^777777Immediately^000000",
		"Description: ^777777A Minstrel and Gypsy Ensemble Skill",
		"that creates a 5*5 cell area around the casters",
		"where other players and monsters cannot enter.",
		"This skill cannot offer protection from magic",
		"or long ranged attacks. This skill cannot be",
		"cast in areas that are adjacent to obstacles.^000000",
		"[Lv 1] : ^777777Duration 20 sec^000000",
		"[Lv 2] : ^777777Duration 25 sec^000000",
		"[Lv 3] : ^777777Duration 30 sec^000000",
		"[Lv 4] : ^777777Duration 35 sec^000000",
		"[Lv 5] : ^777777Duration 40 sec^000000"
	].join("\n");

	SkillDescription[SKID.CG_MARIONETTE] = [
		"Marionette Control",
		"Max Lv : 1",
		"^777777Skill Requirement : Improve Concentration 10, Music(Dance) Lessons 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^7777771 Target^000000",
		"Description: ^777777Targeted Party Member receives a",
		"bonus to all Stats equal to half of the Stats",
		"of the caster. However, each of the target's",
		"Stats cannot exceed 99. This skill is cancelled",
		"if this Party Member is more than 7 cells away",
		"from the caster.^000000"
	].join("\n");

	SkillDescription[SKID.TK_RUN] = [
		"Sprint",
		"Max Lv : 10",
		"Skill Form: ^777777Movement^000000",
		"Description: ^777777Enable the caster to run with",
		"incredible speed. At levels 7 and above, this",
		"skill endows the caster with the ^FFFFFFSpurt status^777777,",
		"which will temporarily increase STR for 150",
		"seconds, if the caster stops running and is",
		"barehanded. Spurt status is canceled if the",
		"caster equips a weapon. Each level of the",
		"Sprint skill increases its user's barehanded ",
		"damage by +10.^000000",
		"[Lv 1] ^7777776 Sec Cast Time, 100 SP^000000",
		"[Lv 2] ^7777775 Sec Cast Time, 90 SP^000000",
		"[Lv 3] ^7777774 Sec Cast Time, 80 SP^000000",
		"[Lv 4] ^7777773 Sec Cast Time, 70 SP^000000",
		"[Lv 5] ^7777772 Sec Cast Time, 60 SP^000000",
		"[Lv 6] ^7777771 Sec Cast Time, 50 SP^000000",
		"[Lv 7] ^7777770 Sec Cast Time, 40 SP^000000",
		"[Lv 8] ^7777770 Sec Cast Time, 30 SP^000000",
		"[Lv 9] ^7777770 Sec Cast Time, 20 SP^000000",
		"[Lv 10] ^7777770 Sec Cast Time, 10 SP^000000"
	].join("\n");

	SkillDescription[SKID.TK_READYSTORM] = [
		"Tornado Stance",
		"Max Lv : 1",
		"^777777Skill Requirement : Tornado Kick 1^000000",
		"Skill Form: ^777777Stance^000000",
		"Description: ^777777Enable a 15% chance of automatically",
		"entering Tornado Stance when the caster",
		"successfully hits a target.^000000",
		"^FF0000Soul Linkers cannot perform this skill.^000000",
		"[Lv 1] ^7777770 Sec Cast Time, 1 SP^000000"
	].join("\n");

	SkillDescription[SKID.TK_STORMKICK] = [
		"Tornado Kick",
		"Max Lv : 7",
		"Skill Form: ^777777Aggressive^000000",
		"Description: ^777777Caster must be in ^00BB00Tornado Stance^777777to",
		"perform this skill which will attack all enemies",
		"within a 5*5 cell area around the caster.^000000",
		"^FF0000Soul Linkers cannot perform this skill.^000000",
		"[Lv 1] ^77777714 SP, 180% Atk^000000",
		"[Lv 2] ^77777712 SP, 200% Atk^000000",
		"[Lv 3] ^77777710 SP, 220% Atk^000000",
		"[Lv 4] ^7777778 SP, 240% Atk^000000",
		"[Lv 5] ^7777776 SP, 260% Atk^000000",
		"[Lv 6] ^7777774 SP, 280% Atk^000000",
		"[Lv 7] ^7777772 SP, 300% Atk^000000"
	].join("\n");

	SkillDescription[SKID.TK_READYDOWN] = [
		"Heel Drop Stance",
		"Max Lv : 1",
		"^777777Skill Requirement : Heel Drop 1^000000",
		"Skill Form: ^777777Stance^000000",
		"Description: ^777777Enable a 15% chance of automatically",
		"entering Heel Drop Stance when the caster",
		"successfully hits a target.",
		"^FF0000Soul Linkers cannot perform this skill.^000000",
		"[Lv 1] ^7777770 Sec Cast Time, 1 SP^000000"
	].join("\n");

	SkillDescription[SKID.TK_DOWNKICK] = [
		"Heel Drop",
		"Max Lv : 7",
		"Skill Form: ^777777Aggressive^000000",
		"Description: ^777777Caster must be in ^00BB00Heel Drop Stance^777777to",
		"perform this skill which will inflict damage",
		"and cause the Stun effect for 3 seconds on the",
		"targeted enemy.^000000",
		"^FF0000Soul Linkers cannot perform this skill.^000000",
		"[Lv 1] ^77777714 SP, 180% Atk^000000",
		"[Lv 2] ^77777712 SP, 200% Atk^000000",
		"[Lv 3] ^77777710 SP, 220% Atk^000000",
		"[Lv 4] ^7777778 SP, 240% Atk^000000",
		"[Lv 5] ^7777776 SP, 260% Atk^000000",
		"[Lv 6] ^7777774 SP, 280% Atk^000000",
		"[Lv 7] ^7777772 SP, 300% Atk^000000"
	].join("\n");

	SkillDescription[SKID.TK_READYTURN] = [
		"Roundhouse Stance",
		"Max Lv : 1",
		"^777777Skill Requirement : Roundhouse 1^00000",
		"Skill Form: ^777777Stance^000000",
		"Description: ^777777Enable a 15% chance of automatically",
		"entering Roundhouse Stance when the caster",
		"successfully hits a target. ",
		"^FF0000Soul Linkers cannot perform this skill.^000000",
		"[Lv 1] ^7777770 Sec Cast Time, 1 SP^000000"
	].join("\n");

	SkillDescription[SKID.TK_TURNKICK] = [
		"Roundhouse",
		"Max Lv : 7",
		"Skill Form: ^777777Aggressive^000000",
		"Description: ^777777Caster must be in ^00BB00Roundhouse Stance^777777to",
		"perform this skill which will damage its target",
		"and and push back enemies around the target.",
		"Enemies that are pushed do not receive any",
		"damage.^000000",
		"^FF0000Soul Linkers cannot perform this skill.^000000",
		"[Lv 1] ^77777714 SP, 220% Atk^000000",
		"[Lv 2] ^77777712 SP, 250% Atk^000000",
		"[Lv 3] ^77777710 SP, 280% Atk^000000",
		"[Lv 4] ^7777778 SP, 310% Atk^000000",
		"[Lv 5] ^7777776 SP, 340% Atk^000000",
		"[Lv 6] ^7777774 SP, 370% Atk^000000",
		"[Lv 7] ^7777772 SP, 400% Atk^000000"
	].join("\n");

	SkillDescription[SKID.TK_READYCOUNTER] = [
		"Counter Kick Stance",
		"Max Lv : 1",
		"^777777Skill Requirement : Counter Kick 1^000000",
		"Skill Form: ^777777Stance^000000",
		"Description: ^777777Enable a 20% chance of automatically",
		"entering ^00BB00Counter Kick Stance^777777when the caster",
		"successfully hits a target. ",
		"^FF0000Soul Linkers cannot perform this skill.^000000",
		"[Lv 1]: ^7777770 Sec Cast Time, 1 SP^000000"
	].join("\n");

	SkillDescription[SKID.TK_COUNTER] = [
		"Counter Kick",
		"Max lv : 7",
		"Skill Form: ^777777Aggressive^000000",
		"Description: ^777777Caster must be in Counter Kick",
		"Stance to perform this skill which will always",
		"hit its target.^000000",
		"^FF0000Soul Linkers cannot perform this skill.^000000",
		"[Lv 1] ^77777714 SP, 220% Atk^000000",
		"[Lv 2] ^77777712 SP, 250% Atk^000000",
		"[Lv 3] ^77777710 SP, 280% Atk^000000",
		"[Lv 4] ^7777778 SP, 310% Atk^000000",
		"[Lv 5] ^7777776 SP, 340% Atk^000000",
		"[Lv 6] ^7777774 SP, 370% Atk^000000",
		"[Lv 7] ^7777772 SP, 400% Atk^0000000"
	].join("\n");

	SkillDescription[SKID.TK_DODGE] = [
		"Tumbling",
		"Max Lv : 1",
		"^777777Skill Requirement : Flying Kick 7^000000",
		"Skill Form: ^777777Stance^000000",
		"Description: ^777777Enable a 20% chance of blocking",
		"long ranged physical attacks. When caster is in",
		"Spurt status (after performing Lv 7 Sprint or",
		"higher), Tumbling will also block other kinds",
		"of attacks.^000000",
		"[Lv 1] ^7777770 Sec Cast Time, 1 SP^000000"
	].join("\n");

	SkillDescription[SKID.TK_JUMPKICK] = [
		"Flying Kick",
		"Max Lv : 7",
		"Skill Form: ^777777Aggressive^000000",
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
		"[Lv 1] ^77777770 SP, 40% Atk^000000",
		"[Lv 2] ^77777760 SP, 50% Atk^000000",
		"[Lv 3] ^77777750 SP, 60% Atk^000000",
		"[Lv 4] ^77777740 SP, 70% Atk^000000",
		"[Lv 5] ^77777730 SP, 80% Atk^000000",
		"[Lv 6] ^77777720 SP, 90% Atk^000000",
		"[Lv 7] ^77777710 SP, 100% Atk^000000"
	].join("\n");

	SkillDescription[SKID.TK_HPTIME] = [
		"Peaceful Break",
		"Max Lv : 10",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777When two or more Taekwon Class",
		"characters sit next to each other, HP will be",
		"restored for both characters. This HP",
		"restoration is affected by VIT and enhanced by",
		"an additional 30 HP with the /doridori command.^000000",
		"[Lv 1] ^777777HP +30^000000",
		"[Lv 2] ^777777HP +60^000000",
		"[Lv 3] ^777777HP +90^000000",
		"[Lv 4] ^777777HP +120^000000",
		"[Lv 5] ^777777HP +150^000000",
		"[Lv 6] ^777777HP +180^000000",
		"[Lv 7] ^777777HP +210^000000",
		"[Lv 8] ^777777HP +240^000000",
		"[Lv 9] ^777777HP +270^000000",
		"[Lv 10] ^777777HP +300^000000"
	].join("\n");

	SkillDescription[SKID.TK_SPTIME] = [
		"Happy Break",
		"Max Lv : 10",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777When two or more Taekwon Class",
		"characters sit next to each other, SP will be",
		"restored for both characters. This SP",
		"restoration is affected by MaxSP and enhanced",
		"by an additional 3 SP with the /doridori command.",
		"Using the /doridori command while in Happy Break",
		"status will make it last for 30 minutes. During",
		"this status, the caster will have a low chance",
		"of using the Earth Spike spell scroll, with a",
		"10% chance at Skill Level 1, and a 1% chance at",
		"Skill Level 10. Using the Earth Spike scroll",
		"during this status will consume 10 SP.^000000",
		"[Lv 1] ^777777SP +3^000000",
		"[Lv 2] ^777777SP +6^000000",
		"[Lv 3] ^777777SP +9^000000",
		"[Lv 4] ^777777SP +12^000000",
		"[Lv 5] ^777777SP +15^000000",
		"[Lv 6] ^777777SP +18^000000",
		"[Lv 7] ^777777SP +21^000000",
		"[Lv 8] ^777777SP +24^000000",
		"[Lv 9] ^777777SP +27^000000",
		"[Lv 10] ^777777SP +30^000000"
	].join("\n");

	SkillDescription[SKID.TK_POWER] = [
		"Kihop",
		"Max Lv : 5",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777Increase Attack Power based on the",
		"number of Party Members on the same map. Normal",
		"attacks, and ^777777skills with 500% power,",
		"inflict an amount of additional according to",
		"the skill's level.^000000",
		"Additional Damage by Level",
		"[Lv 1] ^777777+(Party Member*2%)^000000",
		"[Lv 2] ^777777+(Party Member*4%)^000000",
		"[Lv 3] ^777777+(Party Member*6%)^000000",
		"[Lv 4] ^777777+(Party Member*8%)^000000",
		"[Lv 5] ^777777+(Party Member*10%)^000000"
	].join("\n");

	SkillDescription[SKID.TK_SEVENWIND] = [
		"Mild Wind",
		"Max Lv : 7",
		"^777777Skill Requirement : Peaceful Break 5,",
		"Happy Break 5, Kihop 5^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Summon a wind that will enchant",
		"the caster's attacks for 5 minutes with an",
		"elemental property based on the level of the",
		"cast skill.^000000",
		"SP Consumption and Property by Skill Level",
		"[Lv 1] ^777777Earth (20 SP)^000000",
		"[Lv 2] ^777777Wind (20 SP)^000000",
		"[Lv 3] ^777777Water (20 SP)^000000",
		"[Lv 4] ^777777Fire (20 SP)^000000",
		"[Lv 5] ^777777Ghost (50 SP)^000000",
		"[Lv 6] ^777777Shadow (50 SP)^000000",
		"[Lv 7] ^777777Holy (50 SP)^000000"
	].join("\n");

	SkillDescription[SKID.TK_HIGHJUMP] = [
		"Leap",
		"Max Lv : 5",
		"Skill Form: ^777777Movement^000000",
		"Description: ^777777Leap to a targeted cell within the",
		"skill's range. So long as the targeted cell is",
		"not dead or inaccesibble, the caster can leap",
		"over walls and obstacles. Leap cannot be used",
		"in areas where Fly Wings are disabled, except",
		"for WoE (Guild War) maps.^000000",
		"Cast Time & Skill Range by Level",
		"[Lv 1] ^7777775 sec, 2 cells^000000",
		"[Lv 2] ^7777774 sec, 4 cells^000000",
		"[Lv 3] ^7777773 sec, 6 cells^000000",
		"[Lv 4] ^7777772 sec, 8 cells^000000",
		"[Lv 5] ^7777771 sec, 10 cells^000000"
	].join("\n");

	SkillDescription[SKID.SG_FEEL] = [
		"Solar, Lunar and Stellar Perception",
		"Max Lv : 3",
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
		"[Lv 1] ^777777Designate current map with",
		"Solar alignment^000000",
		"[Lv 2] ^777777Designate current map with",
		"Lunar alignment^000000",
		"[Lv 3] ^777777Designate current map with",
		"Stellar alignment^000000"
	].join("\n");

	SkillDescription[SKID.SG_SUN_WARM] = [
		"Solar Heat",
		"Max Lv : 3",
		"^777777Skill Requirement : Solar,",
		"Lunar and Stellar Perception 1^000000",
		"Skill Form: ^777777Aggressive^000000",
		"Description: ^777777This skill is only enabled in ^00BB00Solar",
		"areas^777777. Inflict damage, drain 2 SP and push back",
		"monsters around the caster. On other players,",
		"this skill will only have the push back effect",
		"and continuously drain SP.",
		"SP Consumption & Duration By Level",
		"[Lv 1] ^77777720 SP, 10 sec^000000",
		"[Lv 2] ^77777720 SP, 20 sec^000000",
		"[Lv 3] ^77777720 SP, 60 sec^000000"
	].join("\n");

	SkillDescription[SKID.SG_MOON_WARM] = [
		"Lunar Heat",
		"Max Lv :3",
		"^777777Skill Requirement : Solar,",
		"Lunar and Stellar Perception 2^000000",
		"Skill Form: ^777777Aggressive^000000",
		"Description: ^777777This skill is only enabled in ^00BB00Lunar",
		"areas^777777. Inflict damage, drain 2 SP and push back",
		"monsters around the caster. On other players,",
		"this skill will only have the push back effect",
		"and continuously drain SP.",
		"SP Consumption & Cast Time By Level",
		"[Lv 1] ^77777720 SP, 10 sec^000000",
		"[Lv 2] ^77777720 SP, 20 sec^000000",
		"[Lv 3] ^77777720 SP, 60 sec^000000"
	].join("\n");

	SkillDescription[SKID.SG_STAR_WARM] = [
		"Stellar Heat",
		"Max Lv : 3",
		"^777777Skill Requirement : Solar,",
		"Lunar and Stellar Perception 3^000000",
		"Skill Form: ^777777Aggressive^000000",
		"Description: ^777777This skill is only enabled in",
		"^00BB00Stellar areas^777777. Inflict damage, drain 2 SP and",
		"push back monsters around the caster. On other",
		"players, this skill will only have the push",
		"back effect and continuously drain SP.",
		"SP Consumption & Cast Time By Level",
		"[Lv 1] ^77777710 SP, 10 sec^000000",
		"[Lv 2] ^77777710 SP, 20 sec^000000",
		"[Lv 3] ^77777710 SP, 60 sec^000000"
	].join("\n");

	SkillDescription[SKID.SG_SUN_COMFORT] = [
		"Solar Protection",
		"Max Lv : 4",
		"^777777Skill Requirement : Solar, Lunar and",
		"Stellar Perception 1^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777This skill is only enabled on ^00BB00Solar",
		"(even numbered) days^777777in a ^00BB00Solar aligned map^777777.",
		"Reduces damage from enemies by a set amount",
		"calculated by this formula:",
		"(Base Level + DEX + LUK)/2",
		"SP Consumption & Duration by Level",
		"[Lv 1] ^77777770 SP, 80 sec^000000",
		"[Lv 2] ^77777760 SP, 160 sec^000000",
		"[Lv 3] ^77777750 SP, 240 sec^000000",
		"[Lv 4] ^77777740 SP, 320 sec^000000"
	].join("\n");

	SkillDescription[SKID.SG_MOON_COMFORT] = [
		"Lunar Protection",
		"Max Lv : 4",
		"^777777Skill Requirement : Solar, Lunar and",
		"Stellar Perception 2^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777This skill is only enabled on ^00BB00Lunar",
		"(odd numbered) days^777777in a ^00BB00Lunar aligned map^777777.",
		"Increases Flee Rate by a set amount that can be",
		"calculated by this formula:",
		"(Base Level + DEX + LUK)/10%",
		"SP Consumption & Duration by Level",
		"[Lv 1] ^77777770 SP, 80 sec^000000",
		"[Lv 2] ^77777760 SP, 160 sec^000000",
		"[Lv 3] ^77777750 SP, 240 sec^000000",
		"[Lv 4] ^77777740 SP, 320 sec^000000"
	].join("\n");

	SkillDescription[SKID.SG_STAR_COMFORT] = [
		"Stellar Protection",
		"Max Lv : 4",
		"^777777Skill Requirement : Solar, Lunar and",
		"Stellar Perception 3^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777This skill is only enabled on",
		"^00BB00Stellar (multiple of five) days^777777in a",
		"^00BB00Stellar aligned map^777777.",
		"Increases Attack Speed by a set amount that can",
		"be calculated by this formula:",
		"(Base Level + DEX + LUK)/10%",
		"SP Consumption & Duration by Level",
		"[Lv 1] ^77777770 SP, 80 sec^000000",
		"[Lv 2] ^77777760 SP, 160 sec^000000",
		"[Lv 3] ^77777750 SP, 240 sec^000000",
		"[Lv 4] ^77777740 SP, 320 sec^000000"
	].join("\n");

	SkillDescription[SKID.SG_HATE] = [
		"Solar, Lunar and Stellar Opposition",
		"Max Lv : 3",
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
		"[Lv 1] ^777777Designate monster with Solar alignment.",
		" Limited to Small sized monsters.^000000",
		"[Lv 2] ^777777Designate monster with Lunar alignment.",
		" Limited to Medium sized monsters with MaxHP",
		" of 6,000 or more.^000000",
		"[Lv 3] ^777777Designate monster with Stellar alignment.",
		" Limited to Large sized monsters with MaxHP",
		" of 20,000 or more. On players, character jobs",
		" can be designated without regarding size and",
		" MaxHP.^000000"
	].join("\n");

	SkillDescription[SKID.SG_SUN_ANGER] = [
		"Solar Wrath",
		"Max Lv : 3",
		"^777777Skill Requirement : Solar,",
		"Lunar and Stellar Opposition 1^000000",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777Increase Attack Power against",
		"Solar aligned monsters. Character's Base",
		"Level, LUK, DEX and skill's level affect",
		"this damage increase.^000000"
	].join("\n");

	SkillDescription[SKID.SG_MOON_ANGER] = [
		"Lunar Wrath",
		"Max Lv : 3",
		"^777777Skill Requirement : Solar,",
		"Lunar and Stellar Opposition 2^000000",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777Increase Attack Power against Lunar",
		"aligned monsters. Character's Base Level,",
		"LUK, DEX and skill's level affect this",
		"damage increase.^000000"
	].join("\n");

	SkillDescription[SKID.SG_STAR_ANGER] = [
		"Stellar Wrath",
		"Max Lv : 3",
		"^777777Skill Requirement : Solar, Lunar,",
		"and Stellar Opposition 3^000000",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777Increase Attack Power against",
		"Stellar aligned monsters. Character's Base",
		"Level, LUK, DEX, STR and skill's level affect",
		"this damage increase.^000000"
	].join("\n");

	SkillDescription[SKID.SG_SUN_BLESS] = [
		"Solar Blessings",
		"Max Lv : 5",
		"^777777Skill Requirement : Solar, Lunar and",
		"Stellar Perception 1, Solar, Lunar,",
		"and Stellar Opposition 1^000000",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777Increase the EXP reward from",
		"defeating Solar aligned monsters on Solar",
		"(even numbered) days.^000000",
		"[Lv 1] ^777777EXP +10%^000000",
		"[Lv 2] ^777777EXP +20%^000000",
		"[Lv 3] ^777777EXP +30%^000000",
		"[Lv 4] ^777777EXP +40%^000000",
		"[Lv 5] ^777777EXP +50%^000000"
	].join("\n");

	SkillDescription[SKID.SG_MOON_BLESS] = [
		"Lunar Blessings",
		"Max Lv : 5",
		"^777777Skill Requirement : Solar, Lunar and",
		"Stellar Perception 2, Solar, Lunar,",
		"and Stellar Opposition 2^000000",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777Increase the EXP reward from",
		"defeating Lunar aligned monsters on Lunar",
		"(odd numbered) days.^000000",
		"[Lv 1] ^777777EXP +10%^000000",
		"[Lv 2] ^777777EXP +20%^000000",
		"[Lv 3] ^777777EXP +30%^000000",
		"[Lv 4] ^777777EXP +40%^000000",
		"[Lv 5] ^777777EXP +50%^000000"
	].join("\n");

	SkillDescription[SKID.SG_STAR_BLESS] = [
		"Stellar Blessings",
		"Max Lv : 5",
		"^777777Skill Requirement : Solar, Lunar and",
		"Stellar Perception 3, Solar, Lunar,",
		"and Stellar Opposition 3^000000",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777Increase the EXP reward from",
		"defeating Stellar aligned monsters on Stellar",
		"(multiple of five) days.^000000",
		"[Lv 1] ^777777EXP +20%^000000",
		"[Lv 2] ^777777EXP +40%^000000",
		"[Lv 3] ^777777EXP +60%^000000",
		"[Lv 4] ^777777EXP +80%^000000",
		"[Lv 5] ^777777EXP +100%^000000"
	].join("\n");

	SkillDescription[SKID.SG_DEVIL] = [
		"Solar, Lunar and Stellar Shadow ",
		"Max Lv : 10",
		"^777777Skill Requirement : Job Level 50^000000",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777This skill's effects will only",
		"activate for Job Level 50 characters. Increasing",
		"this skills' level will permanently increase",
		"Attack Speed and reduce character's vision,",
		"similarly to the Blind effect. increase Attack",
		"Speed; at Job Level 50, this skill will",
		"permanently reduce sight, similarly to the",
		"Blind effect.^000000",
		"[Lv 1] ^777777Aspd +3%^000000",
		"[Lv 2] ^777777Aspd +6%^000000",
		"[Lv 3] ^777777Aspd +9%^000000",
		"[Lv 4] ^777777Aspd +12%^000000",
		"[Lv 5] ^777777Aspd +15%^000000",
		"[Lv 6] ^777777Aspd +18%^000000",
		"[Lv 7] ^777777Aspd +21%^000000",
		"[Lv 8] ^777777Aspd +24%^000000",
		"[Lv 9] ^777777Aspd +27%^000000",
		"[Lv 10] ^777777Aspd +30%^000000"
	].join("\n");

	SkillDescription[SKID.SG_FRIEND] = [
		"Solar, Lunar and Stellar Team-Up",
		"Max Lv : 3",
		"Skill Form: ^777777Passive^000000",
		"Target: ^777777Monk Class Party Member^000000",
		"Description: ^777777Increase a Monk class character's",
		"chance of casting Raging Trifecta when using",
		"Counter Kick, while Monk's Raging Thrust will",
		"increase the Taekwon Master's chance of casting",
		"Counter Kick.",
		"[Lv 1] ^777777Chance +100%^000000",
		"[Lv 2] ^777777Chance +150%^000000",
		"[Lv 3] ^777777Chance +200%^000000"
	].join("\n");

	SkillDescription[SKID.SG_KNOWLEDGE] = [
		"Solar, Lunar and Stellar Courier ",
		"Max Lv : 10",
		"Skill Form: ^777777Passive^000000",
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
		"[Lv 1] ^777777Maximum Weight +10%^000000",
		"[Lv 2] ^777777Maximum Weight +20%^000000",
		"[Lv 3] ^777777Maximum Weight +30%^000000",
		"[Lv 4] ^777777Maximum Weight +40%^000000",
		"[Lv 5] ^777777Maximum Weight +50%^000000",
		"[Lv 6] ^777777Maximum Weight +60%^000000",
		"[Lv 7] ^777777Maximum Weight +70%^000000",
		"[Lv 8] ^777777Maximum Weight +80%^000000",
		"[Lv 9] ^777777Maximum Weight +90%^000000",
		"[Lv 10] ^777777Maximum Weight +100%^000000"
	].join("\n");

	SkillDescription[SKID.SG_FUSION] = [
		"Solar, Lunar and Stellar Union ",
		"^777777Skill Requirement : Solar, Lunar, and",
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
		"less that 20% of MaxHP will instantly kill the",
		"caster. Caster's remaining HP is less that",
		"20% of MaxHP instantly kill the caster.^000000"
	].join("\n");

	SkillDescription[SKID.SL_ALCHEMIST] = [
		"Alchemist Spirit",
		"Max Lv : 5",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Summon the spirit of history's",
		"greatest Alchemist and temporarily endow its",
		"powers upon a targeted Alchemist, enhancing",
		"that Alchemist's Aid Potion skill, which is",
		"affected by Base Level, and enabling the use",
		"of the Aid Berserk Potion and the Spiritual",
		"Potion Creation skills.^000000",
		"SP Consumption & Duration by Level",
		"[Lv 1] ^777777460 SP, 150 sec^000000",
		"[Lv 2] ^777777360 SP, 200 sec^000000",
		"[Lv 3] ^777777260 SP, 250 sec^000000",
		"[Lv 4] ^777777160 SP, 300 sec^000000",
		"[Lv 5] ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_MONK] = [
		"Monk Spirit",
		"Max Lv : 5",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Summon the spirit of history's",
		"toughest Monk and temporarily endow its powers",
		"upon a targeted Monk, enhancing that Monk's",
		"Raging Thrust skill so that it inflicts",
		"splashed damage on enemies within a 5*5 cell",
		"area. Monk Spirit also enables Monks to use",
		"combo skills with reduced SP consumption and to",
		"restore SP during Fury status.^000000",
		"SP Consumption & Duration by Level",
		"[Lv 1] ^777777460 SP, 150 sec^000000",
		"[Lv 2] ^777777360 SP, 200 sec^000000",
		"[Lv 3] ^777777260 SP, 250 sec^000000",
		"[Lv 4] ^777777160 SP, 300 sec^000000",
		"[Lv 5] ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_STAR] = [
		"Taekwon Master Spirit",
		"Max Lv : 5",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Summon the spirit of history's",
		"greatest Taekwon Master and temporarily endow",
		"its power upon a targeted Taekwon Master,",
		"enabling Taekwon Master to use Solar, Lunar",
		"and Stellar Union skill.^000000",
		"SP Consumption & Duration by Level",
		"[Lv 1] ^777777460 SP, 150 sec^000000",
		"[Lv 2] ^777777360 SP, 200 sec^000000",
		"[Lv 3] ^777777260 SP, 250 sec^000000",
		"[Lv 4] ^777777160 SP, 300 sec^000000",
		"[Lv 5] ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_SAGE] = [
		"Sage Spirit",
		"Max Lv : 5",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Summon the spirit of history's",
		"greatest Sage and temporarily endow its",
		"abilities upon a targeted Sage, enhancing that",
		"Sage's Hindsight skill so that it casts the",
		"highest level Bolt skills.^000000",
		"SP Consumption & Duration by Level",
		"[Lv 1] ^777777460 SP, 150 sec^000000",
		"[Lv 2] ^777777360 SP, 200 sec^000000",
		"[Lv 3] ^777777260 SP, 250 sec^000000",
		"[Lv 4] ^777777160 SP, 300 sec^000000",
		"[Lv 5] ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_CRUSADER] = [
		"Crusader Spirit",
		"Max Lv : 5",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Summon the spirit of history's",
		"bravest Crusader and temporarily endow its",
		"abilities on a targeted Crusader. For the",
		"skill's duration, the Crusader skill, Shield",
		"Boomerang, will have double damage and never",
		"miss its target.",
		"SP Consumption & Duration by Level",
		"[Lv 1] ^777777460 SP, 150 sec^000000",
		"[Lv 2] ^777777360 SP, 200 sec^000000",
		"[Lv 3] ^777777260 SP, 250 sec^000000",
		"[Lv 4] ^777777160 SP, 300 sec^000000",
		"[Lv 5] ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_SUPERNOVICE] = [
		"Super Novice Spirit",
		"^777777Skill Requirement : Taekwon Master Spirit 1^000000",
		"Max Lv : 5",
		"Skill Form: ^777777Supportive^000000",
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
		"[Lv 1] ^777777460 SP, 150 sec^000000",
		"[Lv 2] ^777777360 SP, 200 sec^000000",
		"[Lv 3] ^777777260 SP, 250 sec^000000",
		"[Lv 4] ^777777160 SP, 300 sec^000000",
		"[Lv 5] ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_KNIGHT] = [
		"Knight Spirit",
		"Max Lv : 5",
		"^777777Skill Requirement : Crusader Spirit 1^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Summon the spirit of history's most",
		"chivalrous Knight and endow its abilities upon",
		"the Knight targeted by this skill. For the",
		"skill's duration, the use of One Hand Quicken",
		"will be enabled if the Two Hand Quicken skill",
		"is mastered.",
		"SP Consumption & Duration by Level",
		"[Lv 1] ^777777460 SP, 150 sec^000000",
		"[Lv 2] ^777777360 SP, 200 sec^000000",
		"[Lv 3] ^777777260 SP, 250 sec^000000",
		"[Lv 4] ^777777160 SP, 300 sec^000000",
		"[Lv 5] ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_WIZARD] = [
		"Wizard Spirit",
		"Max Lv : 5",
		"^777777Skill Requirement : Sage Spirit 1^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Summon the spirit of history's most",
		"powerful Wizard and endow its abilities upon the",
		"Wizard targeted by this skill. For the skill's",
		"duration, the targeted Wizard can use certain",
		"skills without consuming Gemstones.",
		"SP Consumption & Duration by Level",
		"[Lv 1] ^777777460 SP, 150 sec^000000",
		"[Lv 2] ^777777360 SP, 200 sec^000000",
		"[Lv 3] ^777777260 SP, 250 sec^000000",
		"[Lv 4] ^777777160 SP, 300 sec^000000",
		"[Lv 5] ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_PRIEST] = [
		"Priest Spirit",
		"Max Lv : 5",
		"^777777Skill Requirement : Monk Spirit 1^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Summon the spirit of history's most",
		"pious Priest and endow its abilities upon the",
		"Priest targeted by this skill. For the skill's",
		"duration, the targeted Priest's Holy Light skill",
		"will have its Attack Power and SP cost",
		"multiplied by five.^000000",
		"SP Consumption & Duration by Level",
		"[Lv 1] ^777777460 SP, 150 sec^000000",
		"[Lv 2] ^777777360 SP, 200 sec^000000",
		"[Lv 3] ^777777260 SP, 250 sec^000000",
		"[Lv 4] ^777777160 SP, 300 sec^000000",
		"[Lv 5] ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_BARDDANCER] = [
		"Bard and Dancer Spirits",
		"Max Lv : 5",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Summon the spirit of history's most",
		"artistic performer and endow its abilities upon",
		"the Bard or Dancer targeted by this skill. For",
		"the skill's duration, Bards and Dancers have",
		"increased Movement Speed, receive the same",
		"effect as Party Members when performing Play or",
		"Dance skills, and are able to combo skills with",
		"Perfect Tablature, Focus Ballet, Impressive",
		"Riff, Slow Grace, Magic Strings, Lady Luck,",
		"Song of Lutie and Gypsy's Kiss.",
		"SP Consumption & Duration by Level",
		"[Lv 1] ^777777460 SP, 150 sec^000000",
		"[Lv 2] ^777777360 SP, 200 sec^000000",
		"[Lv 3] ^777777260 SP, 250 sec^000000",
		"[Lv 4] ^777777160 SP, 300 sec^000000",
		"[Lv 5] ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_ROGUE] = [
		"Rogue Spirit",
		"Max Lv : 5",
		"^777777Skill Requirement : Assassin Spirit 1^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Summon the",
		"spirit of history's sneakiest Rogue and endow its abilities",
		"upon the Rogue targeted by this skill, enhancing",
		"Stealth status's Movement Speed and STR",
		"increase. For this skill's duration, this Rogue",
		"will be unaffected by dispell skills and will",
		"receive more HP and SP from potions created by",
		"a Top Ten Ranking Alchemist.",
		"SP Consumption & Duration by Level",
		"[Lv 1] ^777777460 SP, 150 sec^000000",
		"[Lv 2] ^777777360 SP, 200 sec^000000",
		"[Lv 3] ^777777260 SP, 250 sec^000000",
		"[Lv 4] ^777777160 SP, 300 sec^000000",
		"[Lv 5] ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_ASSASIN] = [
		"Assassin Spirit",
		"Max Lv : 5",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Summon the spirit of history's most",
		"mysterious Assassin and endow its abilities upon",
		"a targeted Assassin. For the skill's duration,",
		"Sonic Blow will have a 100% increase in damage",
		"and reduced cast delay.",
		"SP Consumption & Duration by Level",
		"[Lv 1] ^777777460 SP, 150 sec^000000",
		"[Lv 2] ^777777360 SP, 200 sec^000000",
		"[Lv 3] ^777777260 SP, 250 sec^000000",
		"[Lv 4] ^777777160 SP, 300 sec^000000",
		"[Lv 5] ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_BLACKSMITH] = [
		"Blacksmith Spirit",
		"Max Lv : 5",
		"^777777Skill Requirement : Alchemist Spirit 1^000000",
		"Skill Form: ^777777Supportive^000000",
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
		"or Impressive Riff.^000000",
		"SP Consumption & Duration by Level",
		"[Lv 1] ^777777460 SP, 150 sec^000000",
		"[Lv 2] ^777777360 SP, 200 sec^000000",
		"[Lv 3] ^777777260 SP, 250 sec^000000",
		"[Lv 4] ^777777160 SP, 300 sec^000000",
		"[Lv 5] ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_HUNTER] = [
		"Hunter Spirit",
		"Max Lv : 5",
		"^777777Skill Requirement : Bard and Dancer Spirit 1^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Summon the spirit of history's most",
		"popular Hunter and endow its abilities on a",
		"targeted Hunter, temporarily enhancing that",
		"Hunter's Beast Bane skill according to the",
		"Hunter's STR.^000000",
		"SP Consumption & Duration by Level",
		"[Lv 1] ^777777460 SP, 150 sec^000000",
		"[Lv 2] ^777777360 SP, 200 sec^000000",
		"[Lv 3] ^777777260 SP, 250 sec^000000",
		"[Lv 4] ^777777160 SP, 300 sec^000000",
		"[Lv 5] ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_SOULLINKER] = [
		"Soul Linker Spirit",
		"Max Lv : 5",
		"^777777Skill Requirement : Taekwon Master Spirit 1^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Summon the spirit of history's most",
		"skilled Soul Linker and endow its abilities on",
		"a targeted Soul Linker, temporarily allowing",
		"the use of [Ka-] category skills on any",
		"character.",
		"SP Consumption & Duration by Level",
		"[Lv 1] ^777777460 SP, 150 sec^000000",
		"[Lv 2] ^777777360 SP, 200 sec^000000",
		"[Lv 3] ^777777260 SP, 250 sec^000000",
		"[Lv 4] ^777777160 SP, 300 sec^000000",
		"[Lv 5] ^77777760 SP, 350 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_KAIZEL] = [
		"Kaizel",
		"Max Lv : 7",
		"^777777Skill Requirement : Priest Spirit 1^000000",
		"Skill Form: ^777777Supportive^000000",
		"[Ka-] Category: ^777777Can only be used on family",
		"members and other Soul Linkers^000000",
		"Description: ^777777Instantly revive a fallen character",
		"that will be in Kyrie Eleison status for",
		"3 seconds upon revival. This revival lasts for",
		"30 minutes and is cancelled by resurrecting the",
		"target. This skill is disabled during WoE.^000000",
		"Cast Time & HP Restored Upon Revival",
		"[Lv 1] ^777777120 SP, 4.5 sec, 10% MaxHP^000000",
		"[Lv 2] ^777777110 SP, 4 sec, 20% MaxHP^000000",
		"[Lv 3] ^777777100 SP, 3.5 sec, 30% MaxHP^000000",
		"[Lv 4] ^77777790 SP, 3 sec, 40% MaxHP^000000",
		"[Lv 5] ^77777780 SP, 2.5 sec, 50% MaxHP^000000",
		"[Lv 6] ^77777770 SP, 2.5 sec, 60% MaxHP^000000",
		"[Lv 7] ^77777760 SP, 2.5 sec, 70% MaxHP^000000"
	].join("\n");

	SkillDescription[SKID.SL_KAAHI] = [
		"Kaahi",
		"Max Lv : 7",
		"^777777Skill Requirement : Priest Spirit 1,",
		"Monk Spirit 1, Crusader Spirit 1^000000",
		"Skill Form: ^777777Supportive^000000",
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
		"Max Lv : 3",
		"^777777Skill Requirement : Assassin Spirit 1,",
		"Rogue Spirit 1^000000",
		"Skill Form: ^777777Supportive^000000",
		"[Ka-] Category: ^777777Can only be used on family",
		"members and other Soul Linkers^000000",
		"Description: ^777777Kaupe status enables the chance of",
		"dodging a physical attack from an enemy and",
		"lasts until the 10 minute duration elapses or",
		"until character successfully dodges an attack.",
		"SP Consumption & Dodge Chance By Level",
		"[Lv 1] ^77777720 SP, Dodge +33%^000000",
		"[Lv 2] ^77777730 SP, Dodge +66%^000000",
		"[Lv 3] ^77777740 SP, Dodge +100%^000000"
	].join("\n");

	SkillDescription[SKID.SL_KAITE] = [
		"Kaite",
		"^777777Skill Requirement : Wizard Spirit 1,",
		"Sage Spirit 1^000000",
		"Skill Form: ^777777Supportive^000000",
		"[Ka-] Category: ^777777Can only be used on family",
		"members and other Soul Linkers^000000",
		"Description: ^777777Reflect most magic spells back at",
		"the original caster. Reflected Healing spells",
		"will not heal the original caster. The magic",
		"spells of high level monsters cannot be",
		"reflected, Player have chance to block/reflect",
		"incoming single target magic damage",
		"from other players regardless of level.",
		"Does not stack with Asumptio and takes 400%",
		"more physical damage while on Kaite state.^000000",
		"[Lv 1] ^7777771 Reflection 6 sec cast,",
		" 1 min duration^000000",
		"[Lv 2] ^7777771 Reflection 5.5 sec cast,",
		" 2 min duration^000000",
		"[Lv 3] ^7777771 Reflection 5 sec cast,",
		" 3 min duration^000000",
		"[Lv 4] ^7777771 Reflection 4.5 sec cast,",
		" 4 min duration^000000",
		"[Lv 5] ^7777772 Reflection 4 sec cast,",
		" 5 min duration^000000",
		"[Lv 6] ^7777772 Reflection 3.5 sec cast,",
		" 6 min duration^000000",
		"[Lv 7] ^7777772 Reflections 3 sec cast,",
		" 10 min duration^000000"
	].join("\n");

	SkillDescription[SKID.SL_KAINA] = [
		"Kaina",
		"Max Lv : 7",
		"^777777Skill Requirement : Happy Break 1^000000",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777Increase MaxSP and enhance the",
		"efficiency of the Happy Break skill. At Base",
		"Level 70, this skill reduces the SP consumption",
		"of the Estin, Estun and Esma skills by 3% in",
		"proportion to the skill level of Kaina. At Base",
		"Level 80, this SP consumption is reduced by 5%",
		"and at Level 90, it is reduced by 7%.",
		"Happy Break Efficiency & MaxSP Increase By Level",
		"[Lv 1] ^777777H.B. +40% , MaxSP +30^000000",
		"[Lv 2] ^777777H.B. +50% , MaxSP +60^000000",
		"[Lv 3] ^777777H.B. +60% , MaxSP +90^000000",
		"[Lv 4] ^777777H.B. +70% , MaxSP +120^000000",
		"[Lv 5] ^777777H.B. +80% , MaxSP +150^000000",
		"[Lv 6] ^777777H.B. +90% , MaxSP +180^000000",
		"[Lv 7] ^777777H.B. +100% , MaxSP +210^000000"
	].join("\n");

	SkillDescription[SKID.SL_STIN] = [
		"Estin",
		"Max Lv : 7",
		"^777777Skill Requirement : Wizard Spirit 1^000000",
		"Skill Form: ^777777Magic Attack^000000",
		"[Es-] Category: ^777777Can only be used on monsters.^000000",
		"Description: ^777777Push back a targeted monster",
		"2 cells away. Only Small sized monsters are",
		"damaged by this skill, which takes the elemental",
		"property of the Mild Wind skill if it is cast.",
		"At skill level 7, Estin will have a 3 second",
		"delay that will allow the casting of the",
		"Esma skill.^000000",
		"[Lv 1] ^77777718 SP, 10% Damage^000000",
		"[Lv 2] ^77777720 SP, 20% Damage^000000",
		"[Lv 3] ^77777722 SP, 30% Damage^000000",
		"[Lv 4] ^77777724 SP, 40% Damage^000000",
		"[Lv 5] ^77777726 SP, 50% Damage^000000",
		"[Lv 6] ^77777728 SP, 60% Damage^000000",
		"[Lv 7] ^77777730 SP, 70% Damage^000000"
	].join("\n");

	SkillDescription[SKID.SL_STUN] = [
		"Estun",
		"Max Lv : 7",
		"^777777Skill Requirement : Wizard Spirit 1^000000",
		"Skill Form: ^777777Magic Attack^000000",
		"[Es-] Category: ^777777Can only be used on monsters.^000000",
		"Description: ^777777Push back a targeted monster",
		"2 cells away. Only Medium sized monsters are",
		"damaged by this skill, which takes the elemental",
		"property of the Mild Wind skill if it is cast.",
		"At skill level 7, Estun will have a 3 second",
		"delay that will allow the casting of the",
		"Esma skill.^000000",
		"[Lv 1] ^77777718 SP, 5% Damage^000000",
		"[Lv 2] ^77777720 SP, 10% Damage^000000",
		"[Lv 3] ^77777722 SP, 15% Damage^000000",
		"[Lv 4] ^77777724 SP, 20% Damage^000000",
		"[Lv 5] ^77777726 SP, 25% Damage^000000",
		"[Lv 6] ^77777728 SP, 30% Damage^000000",
		"[Lv 7] ^77777730 SP, 35% Damage^000000"
	].join("\n");

	SkillDescription[SKID.SL_SMA] = [
		"Esma",
		"Max Lv : 10",
		"^777777Skill Requirement : Estin 7, Estun 7^000000",
		"Skill Form: ^777777Magic Attack^000000",
		"[Es-] Category: ^777777Can only be used on monsters.^000000",
		"Description: ^777777This skill can be activated only ",
		"when the Esma casting requirement is satisfied.",
		"One blast inflicts an amount of damage that is",
		"calculated as (40 + Base Level)% of a Magic",
		"Attack, that will take on the elemental",
		"property applied by the Mild Wind skill.^000000",
		"SP Consumption and Number of Fired Blasts",
		"[Lv 1]:^7777778 SP, 1 Blast^000000",
		"[Lv 2]:^77777716 SP, 2 Blasts^000000",
		"[Lv 3]:^77777724 SP, 3 Blasts^000000",
		"[Lv 4]:^77777732 SP, 4 Blasts^000000",
		"[Lv 5]:^77777740 SP, 5 Blasts^000000",
		"[Lv 6]:^77777748 SP, 6 Blasts^000000",
		"[Lv 7]:^77777756 SP, 7 Blasts^000000",
		"[Lv 8]:^77777764 SP, 8 Blasts^000000",
		"[Lv 9]:^77777772 SP, 9 Blasts^000000",
		"[Lv 10]:^77777780 SP, 10 Blasts^000000"
	].join("\n");

	SkillDescription[SKID.SL_SWOO] = [
		"Eswoo",
		"Max Lv : 7",
		"^777777Skill Requirement : Priest Spirit 1^000000",
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
		"[Lv 1]:^77777775 SP, 1 sec^000000",
		"[Lv 2]:^77777765 SP, 2 sec^000000",
		"[Lv 3]:^77777755 SP, 3 sec^000000",
		"[Lv 4]:^77777745 SP, 4 sec^000000",
		"[Lv 5]:^77777735 SP, 5 sec^000000",
		"[Lv 6]:^77777725 SP, 6 sec^000000",
		"[Lv 7]:^77777715 SP, 7 sec^000000"
	].join("\n");

	SkillDescription[SKID.SL_SKE] = [
		"Eske",
		"Max Lv : 3",
		"^777777Skill Requirement : Knight Spirit 1^000000",
		"Skill Form: ^777777Status Magic^000000",
		"[Es-] Category: ^777777Can only be used on monsters.^000000",
		"Description: ^777777Increase targeted monster's Attack",
		"Power, multiplying it by 4, but reduce its",
		"Defense by half. This skill is followed by a",
		"3 second delay in which the ^00BB00Esma^777777skill",
		"can be cast.^000000",
		"[Lv 1]:^77777745sp, 3sec cast 10sec duration^000000",
		"[Lv 2]:^77777730sp, 2sec cast 20sec duration^000000",
		"[Lv 3]:^77777715sp, 1sec cast 30sec duration^000000"
	].join("\n");

	SkillDescription[SKID.SL_SKA] = [
		"Eska",
		"Max Lv : 3",
		"^777777Skill Requirement : Monk Spirit 1^000000",
		"Skill Form: ^777777Status Magic^000000",
		"[Es-] Category: ^777777Can only be used on monsters.^000000",
		"Description: ^777777Force a monster into a status",
		"similar to Monk's Mental Strength, in which",
		"Movement and Attack Speed is reduced, but",
		"Defense and Magic Defense will be temporarily",
		"enhanced.^000000",
		"[Lv 1]:^777777100sp, 3sec cast 10sec duration^000000",
		"[Lv 2]:^77777780sp, 2sec cast 20sec duration^000000",
		"[Lv 3]:^77777760sp, 1sec cast 30sec duration^000000"
	].join("\n");

	SkillDescription[SKID.ST_PRESERVE] = [
		"Preserve",
		"Max Lv : 1",
		"^777777Skill Requirement : Intimidate 10^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description: ^777777Prevent the automatic copying of",
		"skills through the Intimidate skill for 10",
		"minutes in order to preserve the last skill",
		"copied through Intimidate.^000000"
	].join("\n");

	SkillDescription[SKID.ST_FULLSTRIP] = [
		"Full Divestment",
		"Max Lv : 5",
		"^777777Skill Requirement : Divest Weapon 5^000000",
		"Type : ^777777Debuff^000000",
		"Target: ^7777771 Target^000000",
		"Description: ^777777Cast all four Divest skills at the",
		"same time. This skill's success rate increases",
		"if the caster has higher DEX than the skill's",
		"target.^000000",
		"[Lv 1]: ^7777777% Success Rate^000000",
		"[Lv 2]: ^7777779% Success Rate^000000",
		"[Lv 3]: ^77777711% Success Rate^000000",
		"[Lv 4]: ^77777713% Success Rate^000000",
		"[Lv 5]: ^77777715% Success Rate^000000"
	].join("\n");

	SkillDescription[SKID.WS_WEAPONREFINE] = [
		"Upgrade Weapon",
		"Max Lv : 10",
		"^777777Skill Requirement : Weaponry Research 10^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description:^777777Refine weapons to increase their",
		"grade. Unlike weapon smithing, which is affected",
		"by DEX or LUK, this skill's success rate is",
		"affected by the caster's Job Level. Master",
		"Smiths have about the same rate of success as",
		"Item Upgrade NPCs at Job Level 50, have a 5%",
		"greater chance of success than Item Upgrade",
		"NPCs at Job Level 60, and have a 10% greater",
		"chance of success at Job Level 70. If upgrade",
		"attempt fails, the weapon will be destroyed.",
		"^00BB00Lvl 1 Weapon Upgrade requires 1 Phracon. Lvl 2",
		"Weapon Upgrade requires 1 Emveretarcon. Lvl 3-4",
		"Weapon Upgrade requires 1 Oridecon.^000000",
		"^ffffff_^000000",
		"Maximum Possible Upgrade Limit By Level",
		"[Lv 1]:^777777+1^000000",
		"[Lv 2]:^777777+2^000000",
		"[Lv 3]:^777777+3^000000",
		"[Lv 4]:^777777+4^000000",
		"[Lv 5]:^777777+5^000000",
		"[Lv 6]:^777777+6^000000",
		"[Lv 7]:^777777+7^000000",
		"[Lv 8]:^777777+8^000000",
		"[Lv 9]:^777777+9^000000",
		"[Lv 10]:^777777+10^000000"
	].join("\n");

	SkillDescription[SKID.CR_SLIMPITCHER] = [
		"Aid Condensed Potion",
		"Max Lv : 10",
		"^777777Skill Requirement : Aid Potion 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description: ^777777Consume one Condensed Potion to",
		"heal all Party Members within a 7*7 cell area",
		"around the targeted spot.^000000",
		"^777777Only normal type Condensed Potion can be consumed.",
		"This skill doesn't get affected by ranker effect.",
		"^ffffff_^000000",
		"Potion Efficiency & Required Condensed Potion",
		"[Lv 1]: ^777777110%, [Red]^000000",
		"[Lv 2]: ^777777120%, [Red]^000000",
		"[Lv 3]: ^777777130%, [Red]^000000",
		"[Lv 4]: ^777777140%, [Red]^000000",
		"[Lv 5]: ^777777150%, [Red]^000000",
		"[Lv 6]: ^777777160%, [Yellow]^000000",
		"[Lv 7]: ^777777170%, [Yellow]^000000",
		"[Lv 8]: ^777777180%, [Yellow]^000000",
		"[Lv 9]: ^777777190%, [Yellow]^000000",
		"[Lv 10]: ^777777200%, [White]^000000"
	].join("\n");

	SkillDescription[SKID.CR_FULLPROTECTION] = [
		"Full Chemical Protection",
		"Max Lv : 5",
		"^777777Skill Requirement : Chemical Protection(Helm, Shield, Armor, and Weapon) 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Description: ^777777Protect the targeted character with",
		"all four kinds of chemical protection.",
		"^00BB00Each cast requires 1 Glistening Coat.^000000",
		"[Lv 1] : ^777777Duration 120 sec^000000",
		"[Lv 2] : ^777777Duration 240 sec^000000",
		"[Lv 3] : ^777777Duration 360 sec^000000",
		"[Lv 4] : ^777777Duration 480 sec^000000",
		"[Lv 5] : ^777777Duration 600 sec^000000"
	].join("\n");

	SkillDescription[SKID.PA_SHIELDCHAIN] = [
		"Rapid Smiting",
		"Max Lv : 5",
		"^777777Skill Requirement : Shield Boomerang 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ranged Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Description: ^777777Enable the chance of striking an",
		"enemy 5 times with a Shield while in battle.",
		"Accuracy Rate affects chance of success and the",
		"Shield's weight and Upgrade status and caster's level affects the",
		"amount of damage. Rapid Smiting ^00BB00requires Shield^777777.^000000",
		"[Lv 1] : ^777777ATK 500% , Accuracy Rate +20^000000",
		"[Lv 2] : ^777777ATK 700% , Accuracy Rate +20^000000",
		"[Lv 3] : ^777777ATK 900% , Accuracy Rate +20^000000",
		"[Lv 4] : ^777777ATK 1100%, Accuracy Rate +20^000000",
		"[Lv 5] : ^777777ATK 1300% , Accuracy Rate +20^000000"
	].join("\n");

	SkillDescription[SKID.WS_CARTTERMINATION] = [
		"High Speed Cart Ram",
		"Max Lv : 10",
		"^777777Skill Requirement : Mammonite 10, Hammerfall 5, Cart Boost 1^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Attack^000000",
		"Target: ^7777771 Target^000000",
		"Description: ^777777This skill is only enabled during",
		"Cart Boost status. Spend a certain amount of",
		"zeny to smash a Pushcart into an enemy with a",
		"chance of inflicting the Stun status. The amount",
		"of this skill's damage is affected by the",
		"skill's level and the weight of items carried",
		"in the Pushcart.^000000",
		"[Lv 1] : ^777777Zeny amount  600z , Stun Chance  5%^000000",
		"[Lv 2] : ^777777Zeny amount  700z , Stun Chance 10%^000000",
		"[Lv 3] : ^777777Zeny amount  800z , Stun Chance 15%^000000",
		"[Lv 4] : ^777777Zeny amount  900z , Stun Chance 20%^000000",
		"[Lv 5] : ^777777Zeny amount 1000z , Stun Chance 25%^000000",
		"[Lv 6] : ^777777Zeny amount 1100z , Stun Chance 30%^000000",
		"[Lv 7] : ^777777Zeny amount 1200z , Stun Chance 35%^000000",
		"[Lv 8] : ^777777Zeny amount 1300z , Stun Chance 40%^000000",
		"[Lv 9] : ^777777Zeny amount 1400z , Stun Chance 45%^000000",
		"[Lv10] : ^777777Zeny amount 1500z , Stun Chance 50%^000000"
	].join("\n");

	SkillDescription[SKID.WS_OVERTHRUSTMAX] = [
		"Maximum Power-Thrust",
		"Max Lv : 5",
		"^777777Skill Requirement : Power Thrust 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Buff^000000",
		"Target: ^777777Caster Only^000000",
		"Description: ^777777Increase caster's weapon damage by",
		"spending a certain amount of zeny. Cannot be",
		"activated to anyone beside the caster.",
		"[Lv 1] : ^777777Damage : 20%, Zeny Amount : 3000z^000000",
		"[Lv 2] : ^777777Damage : 40%, Zeny Amount : 3500z^000000",
		"[Lv 3] : ^777777Damage : 60% , Zeny Amount : 4000z^000000",
		"[Lv 4] : ^777777Damage : 80% , Zeny Amount : 4500z^000000",
		"[Lv 5] : ^777777Damage :100% , Zeny Amount : 5000z^000000"
	].join("\n");

	SkillDescription[SKID.CG_SPECIALSINGER] = [
		"Skilled Special Singer",
		"Max Lv : 1",
		"^777777Skill Requirement : Marionette Control 1,",
		"Unchained Serenade(Hip Shaker) 3, Music(Dance) Lessons 10^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Supportive^000000",
		"Target: ^777777Caster Only^000000",
		"Description : ^777777Overcome fatigue after ensemble by gypsy and clown right away.^000000"
	].join("\n");

	SkillDescription[SKID.CG_HERMODE] = [
		"Hermode's Rod",
		"Max Lv : 5",
		"^777777Skill Requirement : Improve Concentration 10, Music(Dance) Lessons 10^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Target: ^777777Music&Dance^000000",
		"Description: ^777777This skill can only be used near",
		"Warp Portals inside Guild Siege maps during WoE",
		"times. Hermode's Rod will cancel all positive",
		"statuses, aside from Berserk, from all friendly",
		"targets except for the caster, and will block",
		"any magic spells cast of this skill's targets.",
		"No one including the caster can use any skills",
		"for the skill's duration, but Hermode's Rod is",
		"canceled upon leaving its effective range.^000000",
		"[Lv 1]:^77777710 Sec Duration^000000",
		"[Lv 2]:^77777720 Sec Duration^000000",
		"[Lv 3]:^77777730 Sec Duration^000000",
		"[Lv 4]:^77777740 Sec Duration^000000",
		"[Lv 5]:^77777750 Sec Duration^000000"
	].join("\n");

	SkillDescription[SKID.CG_TAROTCARD] = [
		"Tarot Card of Fate",
		"Max Lv : 5",
		"^777777Skill Requirement : Improve Concentration 10, Unchained Serenade(Hip Shaker) 3^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Debuff^000000",
		"Target: ^7777771 Target^000000",
		"Description: ^777777Cast a randomly chosen effect from",
		"one out of 14 tarot cards. The level of this",
		"skill affects the chance of success.",
		"[Lv 1]:^7777778% Success Chance^000000",
		"[Lv 2]:^77777716% Success Chance^000000",
		"[Lv 3]:^77777724% Success Chance^000000",
		"[Lv 4]:^77777732% Success Chance^000000",
		"[Lv 5]:^77777740% Success Chance^000000"
	].join("\n");

	SkillDescription[SKID.CR_ACIDDEMONSTRATION] = [
		"Acid Bomb",
		"Max Lv : 10",
		"^777777Skill Requirement : Demonstration 5, Acid Terror 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Ranged Physical^000000",
		"Target : ^777777Target 1^000000",
		"Description : ^777777 Ranged Physical Damage to a target, consumes 1 Fire and Acid Bottle.",
		"Damage increases based on BaseLv, INT, and target's VIT.",
		"Deals half of the damage to players",
		"and adds a chance to break target's weapon and armors based on skill level.^000000",
		"[Lv 1] : ^777777ATK 200%^000000",
		"[Lv 2] : ^777777ATK 400%^000000",
		"[Lv 3] : ^777777ATK 600%^000000",
		"[Lv 4] : ^777777ATK 800%^000000",
		"[Lv 5] : ^777777ATK 1000%^000000",
		"[Lv 6] : ^777777ATK 1200%^000000",
		"[Lv 7] : ^777777ATK 1400%^000000",
		"[Lv 8] : ^777777ATK 1600%^000000",
		"[Lv 9] : ^777777ATK 1800%^000000",
		"[Lv10] : ^777777ATK 2000%^000000"
	].join("\n");

	SkillDescription[SKID.CR_CULTIVATION] = [
		"Cultivate Plant",
		"Max Lv : 2",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Installation^000000",
		"Type : ^7777771 cell on ground^000000",
		"Description: ^777777Initiate an attempt, which will",
		"have a 50% chance of success, to create a",
		"random type of Mushroom from a Mushroom Spore,",
		"or a Plant from a Stem. This skill is disabled",
		"during WoE (Guild War).^000000",
		"[Lv 1]: ^777777Cultivate Mushrooms",
		" ^00BB00Requires Mushroom Spore^000000",
		"[Lv 2]: ^777777Cultivate Plants",
		" ^00BB00Requires Stem^000000"
	].join("\n");

	SkillDescription[SKID.TK_MISSION] = [
		"Taekwon Mission",
		"Max Lv : 1",
		"^777777Skill Requirement : Kihop 5^000000",
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
		"and above with have tripled MaxHP and SP, and",
		"will be able to use all Taekwon Boy and Girl",
		"skills.^000000"
	].join("\n");

	SkillDescription[SKID.SL_HIGH] = [
		"1st Transcendent Spirit",
		"Max Lv : 5",
		"^777777Skill Requirement : Super Novice Spirit 5^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Call upon the spirits of the most",
		"powerful 1st Transcendent Class warriors ever",
		"so that they can lend their powers to their",
		"successors. This skill will increase every Stat",
		"for friendly 1st Transcendent characters based",
		"on their Base Level, but each Stat bonus will",
		"not exceed +50.^000000",
		"[Lv 1]:^777777460 SP, 150 sec duration^000000",
		"[Lv 2]:^777777360 SP, 200 sec duration^000000",
		"[Lv 3]:^777777260 SP, 250 sec duration^000000",
		"[Lv 4]:^777777160 SP, 300 sec duration^000000",
		"[Lv 5]:^77777760 SP, 350 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.GS_GLITTERING] = [
		"Coin Flip",
		"Max Lv : 5",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Consume 1 zeny to flip a coin.",
		"If it lands showing heads, the caster will gain",
		"1 coin, but if it shows tails, the caster will",
		"lose 1 coin. The caster can have a Maximum of",
		"10 coins, and increasing this skill's level",
		"raises the success rate of flipping a coin that",
		"will show heads.^000000"
	].join("\n");

	SkillDescription[SKID.GS_FLING] = [
		"Coin Fling",
		"Max Lv : 1",
		"^777777Skill Requirement : Coin Flip 1^000000",
		"Skill Form: ^777777Offensive^000000",
		"Description: ^777777Spend coins to fling them at an",
		"enemy to inflict damage and reduce its Defense.",
		"Coin Fling can consume up to 5 coins in a single",
		"cast, and will reduce more of an enemy's Defense",
		"if more coins are spent.^000000"
	].join("\n");

	SkillDescription[SKID.GS_TRIPLEACTION] = [
		"Triple Action",
		"Max Lv : 1",
		"^777777Skill Requirement : Coin Flip 1^000000",
		"Skill Form: ^777777Offensive^000000",
		"Description: ^777777Spend 1 coin to shoot an enemy 3 times in one attack.^000000"
	].join("\n");

	SkillDescription[SKID.GS_BULLSEYE] = [
		"Bull's Eye",
		"Max Lv : 1",
		"^777777Skill Requirement :Coin Flip 5^000000",
		"Skill Form: ^777777Offensive^000000",
		"Description: ^777777Consume 1 coin to inflict 500%",
		"damage to Demihuman and Brute monsters. Bull's",
		"Eye has a 0.1% chance to inflict the Coma effect",
		"Coma will have no effect on Boss Type Monsters.^000000"
	].join("\n");

	SkillDescription[SKID.GS_MADNESSCANCEL] = [
		"Last Stand",
		"Max Lv : 1",
		"^777777Skill Requirement : Coin Flip 4^000000",
		"Skill Form:^777777Supportive^000000",
		"Description: ^777777Consume 1 coin to activate Last",
		"Stand status in which the caster is immobilized,",
		"but has +100 Atk and +20% Aspd. Last Stand has",
		"a 15 second duration, and cannot be used with",
		"Gunslinger's Panic, Hit Barrel and Platinum Altar.^000000"
	].join("\n");

	SkillDescription[SKID.GS_ADJUSTMENT] = [
		"Gunslinger's Panic",
		"Max Lv : 1",
		"^777777Skill Requirement : Coin Flip 4^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Consume 2 coins to activate the",
		"Gunslinger's Panic status in which caster has",
		"+30 Flee Rate and receives 20% less damage from",
		"long range physical attacks, but has -30",
		"Accuracy. This skill has a 20 second duration,",
		"and cannot be used together with the Last Stand",
		"skill.^000000"
	].join("\n");

	SkillDescription[SKID.GS_INCREASING] = [
		"Increase Accuracy",
		"Max Lv : 1",
		"^777777Skill Requirement : Coin Flip 2^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Consume 4 coins to add +20",
		"Accuracy, +4 DEX, and +4 AGI for a 1 minute",
		"duration.^000000"
	].join("\n");

	SkillDescription[SKID.GS_MAGICALBULLET] = [
		"Magicial Bullet",
		"Max Lv : 1",
		"^777777Skill Requirement : Coin Flip 1^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Consume 1 coin to fire a magic shot, which add Magic damage for 30 seconds, this does not effect skills.^000000"
	].join("\n");

	SkillDescription[SKID.GS_CRACKER] = [
		"Cracker",
		"Max Lv : 1",
		"^777777Skill Requirement : Coin Flip 1^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Consume 1 coin to fire a bullet",
		"that will shock an enemy, causing the Stun",
		"status. The nearer the target is to the caster,",
		"the greater the chance of inflicting the Stun",
		"status.^000000"
	].join("\n");

	SkillDescription[SKID.GS_SINGLEACTION] = [
		"Single Action",
		"Max Lv : 10",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777Essential Gunslinger skill that",
		"enables Gunslingers to fire their weapons more",
		"quickly and accurately. Raising this skill's",
		"level will increase accuracy and attack speed.^000000",
		"[Level 1] : ^777777Accuracy +2, Aspd + 1%^000000",
		"[Level 2] : ^777777Accuracy +4, Aspd + 1%^000000",
		"[Level 3] : ^777777Accuracy +6, Aspd + 2%^000000",
		"[Level 4] : ^777777Accuracy +8, Aspd + 2%^000000",
		"[Level 5] : ^777777Accuracy +10, Aspd + 3%^000000",
		"[Level 6] : ^777777Accuracy +12, Aspd + 3%^000000",
		"[Level 7] : ^777777Accuracy +14, Aspd + 4%^000000",
		"[Level 8] : ^777777Accuracy +16, Aspd + 4%^000000",
		"[Level 9] : ^777777Accuracy +18, Aspd + 5%^000000",
		"[Level 10] : ^777777Accuracy +20, Aspd + 5%^000000"
	].join("\n");

	SkillDescription[SKID.GS_SNAKEEYE] = [
		"Snake Eyes",
		"Max Lv : 10",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777Increase attack range and accuracy",
		"when equipped with a Pistol Class Weapon.^000000",
		"[Level 1] : ^777777Accuracy +1, Range +1^000000",
		"[Level 2] : ^777777Accuracy +2, Range +2^000000",
		"[Level 3] : ^777777Accuracy +3, Range +3^000000",
		"[Level 4] : ^777777Accuracy +4, Range +4^000000",
		"[Level 5] : ^777777Accuracy +5, Range +5^000000",
		"[Level 6] : ^777777Accuracy +6, Range +6^000000",
		"[Level 7] : ^777777Accuracy +7, Range +7^000000",
		"[Level 8] : ^777777Accuracy +8, Range +8^000000",
		"[Level 9] : ^777777Accuracy +9, Range +9^000000",
		"[Level 10] : ^777777Accuracy +10, Range +10^000000"
	].join("\n");

	SkillDescription[SKID.GS_CHAINACTION] = [
		"Chain Action",
		"Max Lv : 10",
		"^777777Skill Requirement : Single Action 1^000000",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777Enables the chance of firing two",
		"shots in a single attack while fighting enemies",
		"when equipped with a Pistol Class Weapon.",
		"Raising this skill's level increases the chance",
		"of firing these double shots.^000000"
	].join("\n");

	SkillDescription[SKID.GS_TRACKING] = [
		"Tracking",
		"Max Lv : 10",
		"^777777Skill Requirement : Single Action 5^000000",
		"Skill Form: ^777777Offensive^000000",
		"Description: ^777777Carefully aim at a target to",
		"inflict devastating damage. Raising this skill's",
		"level increases Cast Time and damage. Pistol or",
		"Rifle Class weapon required to use Tracking.^000000",
		"Skill Damage and Cast Time by Level",
		"[Level 1] : ^777777Attack 300%, Cast Time 0.6 sec^000000",
		"[Level 2] : ^777777Attack 400%, Cast Time 0.7 sec^000000",
		"[Level 3] : ^777777Attack 500%, Cast Time 0.8 sec^000000",
		"[Level 4] : ^777777Attack 600%, Cast Time 0.9 sec^000000",
		"[Level 5] : ^777777Attack 700%, Cast Time 1.0 sec^000000",
		"[Level 6] : ^777777Attack 800%, Cast Time 1.1 sec^000000",
		"[Level 7] : ^777777Attack 900%, Cast Time 1.2 sec^000000",
		"[Level 8] : ^777777Attack 1000%, Cast Time 1.3 sec^000000",
		"[Level 9] : ^777777Attack 1100%, Cast Time 1.4 sec^000000",
		"[Level 10] : ^777777Attack 1200%, Cast Time 1.5 sec^000000"
	].join("\n");

	SkillDescription[SKID.GS_DISARM] = [
		"Disarm",
		"Max Lv : 5",
		"^777777Skill Requirement : Tracking 7^000000",
		"Description: ^777777Shoot an enemy's appendages to",
		"render it incapable of attacking. This skill's",
		"success rate increases as its level is raised.",
		"When used on monsters, this skill will reduce",
		"Atk by 25%, but has no effect on Boss monsters.",
		"Disarm has a range of 9 cells, and requires",
		"a Pistol or Rifle Class Weapon.^000000"
	].join("\n");

	SkillDescription[SKID.GS_PIERCINGSHOT] = [
		"Wounding Shot",
		"Max Lv : 5",
		"^777777Skill Requirement : Tracking 5^000000",
		"Skill Form:^777777Offensive^000000",
		"Description: ^777777Inflict Defense piercing damage",
		"that has the chance of causing the Bleeding",
		"effect on its target. Requires a Pistol or",
		"Rifle Class Weapon.^000000",
		"Damage, Bleeding Chance by Level",
		"The damage done is create when using a Rifle Class Weapon",
		"[Level 1] : ^777777Attack 220%(280%), Bleeding Chance 3%^000000",
		"[Level 2] : ^777777Attack 240%(310%), Bleeding Chance 6%^000000",
		"[Level 3] : ^777777Attack 260%(340%), Bleeding Chance 9%^000000",
		"[Level 4] : ^777777Attack 280%(370%), Bleeding Chance 12%^000000",
		"[Level 5] : ^777777Attack 300%(400%), Bleeding Chance 15%^000000"
	].join("\n");

	SkillDescription[SKID.GS_RAPIDSHOWER] = [
		"Trigger Happy Shot",
		"Max Lv : 10",
		"^777777Skill Requirement :  Chain Action 3^000000",
		"Skill Form:^777777Offensive^000000",
		"Description: ^777777Consume 1 bullet to perform a",
		"rapidfire 5 shot attack.",
		"Requires a Pistol Class Weapon.^000000",
		"[Lv 1]: ^777777550% Atk^000000",
		"[Lv 2]: ^777777600% Atk^000000",
		"[Lv 3]: ^777777650% Atk^000000",
		"[Lv 4]: ^777777700% Atk^000000",
		"[Lv 5]: ^777777750% Atk^000000",
		"[Lv 6]: ^777777800% Atk^000000",
		"[Lv 7]: ^777777850% Atk^000000",
		"[Lv 8]: ^777777900% Atk^000000",
		"[Lv 9]: ^777777950% Atk^000000",
		"[Lv 10]: ^7777771000% Atk^000000"
	].join("\n");

	SkillDescription[SKID.GS_DESPERADO] = [
		"Desperado",
		"Max Lv : 10",
		"^777777Skill Requirement : Trigger Happy Shot 5^000000",
		"Skill Form:^777777Offensive^000000",
		"Description: ^777777Consume 10 bullets to perform a",
		"haphazard attack that may damage enemies within",
		"a 7 cell radius around the caster. Each cast has",
		"a Maximum of 10 strikes, and requires a Pistol",
		"Class Weapon.^000000",
		"[Lv 1]: ^777777100% Atk^000000",
		"[Lv 2]: ^777777150% Atk^000000",
		"[Lv 3]: ^777777200% Atk^000000",
		"[Lv 4]: ^777777250% Atk^000000",
		"[Lv 5]: ^777777300% Atk^000000",
		"[Lv 6]: ^777777350% Atk^000000",
		"[Lv 7]: ^777777400% Atk^000000",
		"[Lv 8]: ^777777450% Atk^000000",
		"[Lv 9]: ^777777500% Atk^000000",
		"[Lv 10]: ^777777550% Atk^000000"
	].join("\n");

	SkillDescription[SKID.GS_GATLINGFEVER] = [
		"Gatling Fever",
		"Max Lv : 10",
		"^777777Skill Requirement : Trigger Happy Shot 7,",
		"Desperado 5^000000",
		"Skill Form:^777777Supportive^000000",
		"Description: ^777777Temporarily increase Attack Speed",
		"and damage at the cost of reducing Flee Rate",
		"and Movement Speed. Gatling Fever status is",
		"cancelled when this skill is double cast.",
		"Requires Gatling Gun Class Weapon.^000000",
		"[Level 1] : ^777777Damage +30, Aspd +1%, Flee -5, Duration 30 sec^000000",
		"[Level 2] : ^777777Damage +40, Aspd +2%, Flee -10, Duration 45 sec^000000",
		"[Level 3] : ^777777Damage +50, Aspd +3%, Flee -15, Duration 60 sec^000000",
		"[Level 4] : ^777777Damage +60, Aspd +4%, Flee -20, Duration 75 sec^000000",
		"[Level 5] : ^777777Damage +70, Aspd +5%, Flee -25, Duration 90 sec^000000",
		"[Level 6] : ^777777Damage +80, Aspd +6%, Flee -30, Duration 105 sec^000000",
		"[Level 7] : ^777777Damage +90, Aspd +7%, Flee -35, Duration 120 sec^000000",
		"[Level 8] : ^777777Damage +100, Aspd +8%, Flee -40, Duration 135 sec^000000",
		"[Level 9] : ^777777Damage +110, Aspd +9%, Flee -45, Duration 150 sec^000000",
		"[Level 10] : ^777777Damage +120, Aspd +10%, Flee -50, Duration 165 sec^000000"
	].join("\n");

	SkillDescription[SKID.GS_DUST] = [
		"Crowd Control Shot",
		"Max Lv : 10",
		"^777777Skill Requirement : Single Action 5^000000",
		"Skill Form: ^777777Offensive^000000",
		"Description: ^777777Fire a close range shot that will",
		"push an enemy 5 cells backward. ",
		"Requires a Shotgun Class Weapon.^000000",
		"[Level 1] : ^777777Attack 150%^000000",
		"[Level 2] : ^777777Attack 200%^000000",
		"[Level 3] : ^777777Attack 250%^000000",
		"[Level 4] : ^777777Attack 300%^000000",
		"[Level 5] : ^777777Attack 350%^000000",
		"[Level 6] : ^777777Attack 400%^000000",
		"[Level 7] : ^777777Attack 450%^000000",
		"[Level 8] : ^777777Attack 500%^000000",
		"[Level 9] : ^777777Attack 550%^000000",
		"[Level 10] : ^777777Attack 600%^000000"
	].join("\n");

	SkillDescription[SKID.GS_FULLBUSTER] = [
		"Full Blast",
		"Max Lv : 10",
		"^777777Skill Requirement : Crowd Control Shot 3^000000",
		"Skill Form:^777777Offensive^000000",
		"Description: ^777777Inflict devastating damage to an",
		"enemy by firing multiple bullets at once. This",
		"skill has a small chance of causing the Blind",
		"status to the caster, and consumes ",
		"2 bullets per cast.",
		"Requires a Shotgun Class Weapon.^000000",
		"[Level 1] : ^777777Attack 400%^000000",
		"[Level 2] : ^777777Attack 500%^000000",
		"[Level 3] : ^777777Attack 600%^000000",
		"[Level 4] : ^777777Attack 700%^000000",
		"[Level 5] : ^777777Attack 800%^000000",
		"[Level 6] : ^777777Attack 900%^000000",
		"[Level 7] : ^777777Attack 1000%^000000",
		"[Level 8] : ^777777Attack 1100%^000000",
		"[Level 9] : ^777777Attack 1200%^000000",
		"[Level 10] : ^777777Attack 1300%^000000"
	].join("\n");

	SkillDescription[SKID.GS_SPREADATTACK] = [
		"Spread Shot",
		"Max Lv : 10",
		"^777777Skill Requirement : Single Action 5^000000",
		"Skill Form: ^777777Offensive^000000",
		"Description: ^777777Consume 5 bullets to spread damage",
		"over a large area.",
		"Requires a Shotgun or a Grenade Launcher.^000000",
		"[Level 1] : ^777777Attack 230%, 3*3 cells^000000",
		"[Level 2] : ^777777Attack 260%, 3*3 cells^000000",
		"[Level 3] : ^777777Attack 290%, 3*3 cells^000000",
		"[Level 4] : ^777777Attack 320%, 5*5 cells^000000",
		"[Level 5] : ^777777Attack 350%, 5*5 cells^000000",
		"[Level 6] : ^777777Attack 380%, 5*5 cells^000000",
		"[Level 7] : ^777777Attack 410%, 7*7 cells^000000",
		"[Level 8] : ^777777Attack 440%, 7*7 cells^000000",
		"[Level 9] : ^777777Attack 470%, 7*7 cells^000000",
		"[Level 10] : ^777777Attack 500%, 9*9 cells^000000"
	].join("\n");

	SkillDescription[SKID.GS_GROUNDDRIFT] = [
		"Gunslinger Mine",
		"Max Lv : 10",
		"^777777Skill Requirement : Spread Shot 7^000000",
		"Skill Form: ^777777Offensive^000000",
		"Description: ^777777Plant Bullet Spheres into the",
		"ground that will explode upon enemy approach.",
		"The explosion's effect varies according to the",
		"type of bullet planted. Requires a Grenade",
		"Launcher Class Weapon.^000000",
		"Attack Bonus & Mine Duration by Skill Level",
		"[Level 1] : ^777777Damage 220%, Duration 3 sec^000000",
		"[Level 2] : ^777777Damage 240%, Duration 6 sec^000000",
		"[Level 3] : ^777777Damage 260%, Duration 9 sec^000000",
		"[Level 4] : ^777777Damage 280%, Duration 12 sec^000000",
		"[Level 5] : ^777777Damage 300%, Duration 15 sec^000000",
		"[Level 6] : ^777777Damage 320%, Duration 18 sec^000000",
		"[Level 7] : ^777777Damage 340%, Duration 21 sec^000000",
		"[Level 8] : ^777777Damage 360%, Duration 24 sec^000000",
		"[Level 9] : ^777777Damage 380%, Duration 27 sec^000000",
		"[Level 10] : ^777777Damage 400%, Duration 30 sec^000000"
	].join("\n");

	SkillDescription[SKID.NJ_TOBIDOUGU] = [
		"Dagger Throwing Practice",
		"Max Lv : 10",
		"Skill Form:^777777Passive^000000",
		"Description: ^777777Increase Shuriken damage.^000000",
		"[Lv 1]: ^777777Atk +3^000000",
		"[Lv 2]: ^777777Atk +6^000000",
		"[Lv 3]: ^777777Atk +9^000000",
		"[Lv 4]: ^777777Atk +12^000000",
		"[Lv 5]: ^777777Atk +15^000000",
		"[Lv 6]: ^777777Atk +18^000000",
		"[Lv 7]: ^777777Atk +21^000000",
		"[Lv 8]: ^777777Atk +24^000000",
		"[Lv 9]: ^777777Atk +27^000000",
		"[Lv 10]: ^777777Atk +30^000000"
	].join("\n");

	SkillDescription[SKID.NJ_SYURIKEN] = [
		"Throw Shuriken",
		"Max Lv : 10",
		"^777777Skill Requirement : Dagger Throwing Practice 1^000000",
		"Skill Form:^777777Offensive^000000",
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
		"Max Lv : 5",
		"^777777Skill Requirement : Throw Shuriken 5^000000",
		"Skill Form:^777777Offensive^000000",
		"Description: ^777777Throw a Kunai that will strike its",
		"target 3 times in one attack. Each cast consumes",
		"1 Kunai, and the attack's property is affected",
		"by the type of Kunai thrown.^000000"
	].join("\n");

	SkillDescription[SKID.NJ_HUUMA] = [
		"Throw Huuma Shuriken",
		"Max Lv : 5",
		"^777777Skill Requirement : Dagger Throwing Practice 5,",
		"Throw Kunai 5^000000",
		"Skill Form:^777777Offensive^000000",
		"Description: ^777777Requires a Huuma Class Weapon.",
		"Throw a Huuma Shuriken that will damage its",
		"target and any nearby enemies. The total amount",
		"of damage is divided among the enemies damaged",
		"by this skill. Raising this skill's level",
		"increases its number of strikes.^000000",
		"Total Amount of Damage by Skill Level",
		"[Lv 1]: ^777777300% Atk^000000",
		"[Lv 2]: ^777777450% Atk^000000",
		"[Lv 3]: ^777777600% Atk^000000",
		"[Lv 4]: ^777777750% Atk^000000",
		"[Lv 5]: ^777777900% Atk^000000"
	].join("\n");

	SkillDescription[SKID.NJ_ZENYNAGE] = [
		"Throw Coins",
		"Max Lv : 10",
		"^777777Skill Requirement : Dagger Throwing Practice 10,",
		"Throw Huuma Shuriken 5^000000",
		"Skill Form:^777777Offensive^000000",
		"Description: ^777777Throw money at a target to inflict",
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
		"Max Lv : 5",
		"Skill Form:^777777Offensive^000000",
		"Description: ^777777Flip tatami to cause the 4*4 area",
		"around the caster to ignore long range physical",
		"damage for 3 seconds. Each cast is followed by",
		"a 3 second cast delay, and has the chance to",
		"damage and push enemies 3 cells backward if",
		"they are within the skill's attack range.^000000",
		"Attack Range & Damage by Skill Level",
		"[Lv 1]: ^7777771 cell, 110% Atk^000000",
		"[Lv 2]: ^7777772 cells, 120% Atk^000000",
		"[Lv 3]: ^7777772 cells, 130% Atk^000000",
		"[Lv 4]: ^7777773 cells, 140% Atk^000000",
		"[Lv 5]: ^7777773 cells, 150% Atk^000000"
	].join("\n");

	SkillDescription[SKID.NJ_KASUMIKIRI] = [
		"Haze Slasher",
		"Max Lv : 10",
		"^777777Skill Requirement : Shadow Leap 1^000000",
		"Skill Form:^777777Offensive^000000",
		"Description: ^777777Strike an enemy, and then",
		"immediately enter the Hiding status; can be",
		"followed by the Shadow Leap or Shadow Slash",
		"skill.^000000",
		"[Lv 1]: ^777777Atk 110%^000000",
		"[Lv 2]: ^777777Atk 120%^000000",
		"[Lv 3]: ^777777Atk 130%^000000",
		"[Lv 4]: ^777777Atk 140%^000000",
		"[Lv 5]: ^777777Atk 150%^000000",
		"[Lv 6]: ^777777Atk 160%^000000",
		"[Lv 7]: ^777777Atk 170%^000000",
		"[Lv 8]: ^777777Atk 180%^000000",
		"[Lv 9]: ^777777Atk 190%^000000",
		"[Lv 10]: ^777777Atk 200%^000000"
	].join("\n");

	SkillDescription[SKID.NJ_SHADOWJUMP] = [
		"Shadow Leap",
		"Max Lv : 5",
		"^777777Skill Requirement : Flip Tatami 1^000000",
		"Skill Form:^777777Supportive^000000",
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
		"Max Lv : 5",
		"^777777Skill Requirement : Haze Slashwer 5^000000",
		"Skill Form : ^993300Active^000000",
		"Type : ^777777Physical Melee^000000",
		"Target : ^777777 1 target^000000",
		"Description : ^777777Requires Hiding Status.",
		"Leaps from the shadows toward a single target and performs a slicing move to inflict physical damage.",
		"Hiding is removed upon using this skill, and Critical Damage can be applied depending on its skill level.",
		"For Critical Damage, only the half of total Critical Damage Options will be applied.^000000",
		"^ffffff_^000000",
		"[Lv 1] : ^777777ATK 200%, Critical Chance 30%^000000",
		"[Lv 2] : ^777777ATK 350%, Critical Chance 35%^000000",
		"[Lv 3] : ^777777ATK 500%, Critical Chance 40%^000000",
		"[Lv 4] : ^777777ATK 650%, Critical Chance 45%^000000",
		"[Lv 5] : ^777777ATK 800%, Critical Chance 50%^000000"
	].join("\n");

	SkillDescription[SKID.NJ_UTSUSEMI] = [
		"Cicada Skin Shed",
		"Max Lv : 5",
		"^777777Skill Requirement : Shadow Leap 5^000000",
		"Skill Form:^777777Supportive^000000",
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
		"Max Lv : 10",
		"^777777Skill Requirement : Shadow Slash 3,",
		"Ninja Aura 1, Cicada Skid Shed 4^000000",
		"Skill Form:^777777Supportive^000000",
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
		"[Lv 9]: ^777777220 Sec,^ 5 Dodges000000",
		"[Lv 10]: ^777777240 Sec, 5 Dodges^000000"
	].join("\n");

	SkillDescription[SKID.NJ_NINPOU] = [
		"Ninja Mastery",
		"Max Lv : 10",
		"Skill Form:^777777Passive^000000",
		"Description: ^777777Increase SP Restoration Speed by",
		"training in the Ninja Arts. The amount of SP",
		"restored by this skill is affected by the",
		"character's MaxSP.^000000",
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
		"Max Lv : 10",
		"^777777Skill Requirement : Ninja Mastery 1^000000",
		"Skill Form:^777777Offensive^bb0000(Fire)^000000",
		"Description: ^777777Inflict Fire property damage at a",
		"target by shooting flaming petals. This skill's",
		"level affects the number of strikes, and each",
		"strike causes an amount of damage equal to 90%",
		"of the caster's Matk.^000000"
	].join("\n");

	SkillDescription[SKID.NJ_KAENSIN] = [
		"Blaze Shield",
		"Max Lv : 10",
		"^777777Skill Requirement : Flaming Petals 5^000000",
		"Skill Form:^777777Offensive^bb0000(Fire)^000000",
		"Description: ^777777Summon a blazing storm in a 5*5",
		"cell area around the caster that will deliver",
		"multiple strikes to enemies within its range.",
		"The Blaze Shield lasts for 20 seconds, but is",
		"automatically canceled after inflicting its",
		"Maximum number of strikes. Each cast consumes",
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
		"Max Lv : 5",
		"^777777Skill Requirement : Ninja Mastery 10,",
		"Blaze Shield 7^000000",
		"Skill Form:^777777Offensive^bb0000(Fire)^000000",
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
		"Max Lv : 10",
		"^777777Skill Requirement : Ninja Mastery 1^000000",
		"Skill Form:^777777Offensive^0000bb(Ice)^000000",
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
		"Max Lv : 10",
		"^777777Skill Requirement : Freezing Spear 5^000000",
		"Skill Form:^777777Supportive^0000bb(Ice)^000000",
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
		"Max Lv : 5",
		"^777777Skill Requirement : Ninja Mastery 10, Watery Evasion 7^000000",
		"Skill Form:^777777Offensive^0000bb(Ice)^000000",
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
		"Max Lv : 10",
		"^777777Skill Requirement : Ninja Mastery 1^000000",
		"Skill Form:^777777Offensive^bbbb00(Lightning)^000000",
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
		"Max Lv : 5",
		"^777777Skill Requirement : Wind Blade^000000",
		"Skill Form:^777777Offensive^bbbb00(Lightning)^000000",
		"Description: ^777777Summon lightning bolts around the",
		"caster to damage enemies within the skill's",
		"range. Each cast consumes 1 Wind Stone.^000000",
		"Damage & Range by Skill Level",
		"[Lv 1]: ^777777+200% Matk, 5*5 cells^000000",
		"[Lv 2]: ^777777+240% Matk, 5*5 cells^000000",
		"[Lv 3]: ^777777+280% Matk, 7*7 cells^000000",
		"[Lv 4]: ^777777+320% Matk, 7*7 cells^000000",
		"[Lv 5]: ^777777+360% Matk, 9*9 cells^000000"
	].join("\n");

	SkillDescription[SKID.NJ_KAMAITACHI] = [
		"First Wind",
		"Max Lv : 5",
		"^777777Skill Requirement : Ninja Mastery 10,",
		"Lightning Jolt 5^000000",
		"Skill Form:^777777Offensive^bbbb00(Lightning)^000000",
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
		"Max Lv : 5",
		"^777777Skill Requirement : Ninja Mastery 5^000000",
		"Skill Form:^777777Supportive^bb00bb(Psychokinesis)^000000",
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
		"Max Lv : 10",
		"^777777Skill Requirement : Dagger Throwing Practice 7,",
		"Shadow Slash 5, Ninja Aura 1^000000",
		"Skill Form:^777777Offensive^000000",
		"Description: ^777777Sacrifice the caster's remaining HP",
		"to inflict devastating damage to the targeted",
		"enemy. The amount of remaining HP affects the",
		"damage inflicted, and each cast of this skill",
		"will always reduce the caster's HP to 1.^000000"
	].join("\n");

	SkillDescription[SKID.MB_FIGHTING] = [].join("\n");

	SkillDescription[SKID.MB_NEUTRAL] = [].join("\n");

	SkillDescription[SKID.MB_TAIMING_PUTI] = [].join("\n");

	SkillDescription[SKID.MB_WHITEPOTION] = [].join("\n");

	SkillDescription[SKID.MB_MENTAL] = [].join("\n");

	SkillDescription[SKID.MB_CARDPITCHER] = [].join("\n");

	SkillDescription[SKID.MB_PETPITCHER] = [].join("\n");

	SkillDescription[SKID.MB_BODYSTUDY] = [].join("\n");

	SkillDescription[SKID.MB_BODYALTER] = [].join("\n");

	SkillDescription[SKID.MB_PETMEMORY] = [].join("\n");

	SkillDescription[SKID.MB_M_TELEPORT] = [].join("\n");

	SkillDescription[SKID.MB_B_GAIN] = [].join("\n");

	SkillDescription[SKID.MB_M_GAIN] = [].join("\n");

	SkillDescription[SKID.MB_MISSION] = [].join("\n");

	SkillDescription[SKID.MB_MUNAKKNOWLEDGE] = [].join("\n");

	SkillDescription[SKID.MB_MUNAKBALL] = [].join("\n");

	SkillDescription[SKID.MB_SCROLL] = [].join("\n");

	SkillDescription[SKID.MB_B_GATHERING] = [].join("\n");

	SkillDescription[SKID.MB_M_GATHERING] = [].join("\n");

	SkillDescription[SKID.MB_B_EXCLUDE] = [].join("\n");

	SkillDescription[SKID.MB_B_DRIFT] = [].join("\n");

	SkillDescription[SKID.MB_B_WALLRUSH] = [].join("\n");

	SkillDescription[SKID.MB_M_WALLRUSH] = [].join("\n");

	SkillDescription[SKID.MB_B_WALLSHIFT] = [].join("\n");

	SkillDescription[SKID.MB_M_WALLCRASH] = [].join("\n");

	SkillDescription[SKID.MB_M_REINCARNATION] = [].join("\n");

	SkillDescription[SKID.MB_B_EQUIP] = [].join("\n");

	SkillDescription[SKID.SL_DEATHKNIGHT] = [].join("\n");

	SkillDescription[SKID.SL_COLLECTOR] = [].join("\n");

	SkillDescription[SKID.SL_NINJA] = [].join("\n");

	SkillDescription[SKID.SL_GUNNER] = [].join("\n");

	SkillDescription[SKID.AM_TWILIGHT4] = [].join("\n");

	SkillDescription[SKID.DE_BERSERKAIZER] = [].join("\n");

	SkillDescription[SKID.DA_DARKPOWER] = [].join("\n");

	SkillDescription[SKID.DE_PASSIVE] = [].join("\n");

	SkillDescription[SKID.DE_PATTACK] = [].join("\n");

	SkillDescription[SKID.DE_PSPEED] = [].join("\n");

	SkillDescription[SKID.DE_PDEFENSE] = [].join("\n");

	SkillDescription[SKID.DE_PCRITICAL] = [].join("\n");

	SkillDescription[SKID.DE_PHP] = [].join("\n");

	SkillDescription[SKID.DE_PSP] = [].join("\n");

	SkillDescription[SKID.DE_RESET] = [].join("\n");

	SkillDescription[SKID.DE_RANKING] = [].join("\n");

	SkillDescription[SKID.DE_PTRIPLE] = [].join("\n");

	SkillDescription[SKID.DE_ENERGY] = [].join("\n");

	SkillDescription[SKID.DE_NIGHTMARE] = [].join("\n");

	SkillDescription[SKID.DE_SLASH] = [].join("\n");

	SkillDescription[SKID.DE_COIL] = [].join("\n");

	SkillDescription[SKID.DE_WAVE] = [].join("\n");

	SkillDescription[SKID.DE_REBIRTH] = [].join("\n");

	SkillDescription[SKID.DE_AURA] = [].join("\n");

	SkillDescription[SKID.DE_FREEZER] = [].join("\n");

	SkillDescription[SKID.DE_CHANGEATTACK] = [].join("\n");

	SkillDescription[SKID.DE_PUNISH] = [].join("\n");

	SkillDescription[SKID.DE_POISON] = [].join("\n");

	SkillDescription[SKID.DE_INSTANT] = [].join("\n");

	SkillDescription[SKID.DE_WARNING] = [].join("\n");

	SkillDescription[SKID.DE_RANKEDKNIFE] = [].join("\n");

	SkillDescription[SKID.DE_RANKEDGRADIUS] = [].join("\n");

	SkillDescription[SKID.DE_GAUGE] = [].join("\n");

	SkillDescription[SKID.DE_GTIME] = [].join("\n");

	SkillDescription[SKID.DE_GPAIN] = [].join("\n");

	SkillDescription[SKID.DE_GSKILL] = [].join("\n");

	SkillDescription[SKID.DE_GKILL] = [].join("\n");

	SkillDescription[SKID.DE_ACCEL] = [].join("\n");

	SkillDescription[SKID.DE_BLOCKDOUBLE] = [].join("\n");

	SkillDescription[SKID.DE_BLOCKMELEE] = [].join("\n");

	SkillDescription[SKID.DE_BLOCKFAR] = [].join("\n");

	SkillDescription[SKID.DE_FRONTATTACK] = [].join("\n");

	SkillDescription[SKID.DE_DANGERATTACK] = [].join("\n");

	SkillDescription[SKID.DE_TWINATTACK] = [].join("\n");

	SkillDescription[SKID.DE_WINDATTACK] = [].join("\n");

	SkillDescription[SKID.DE_WATERATTACK] = [].join("\n");

	SkillDescription[SKID.DA_ENERGY] = [].join("\n");

	SkillDescription[SKID.DA_CLOUD] = [].join("\n");

	SkillDescription[SKID.DA_FIRSTSLOT] = [].join("\n");

	SkillDescription[SKID.DA_HEADDEF] = [].join("\n");

	SkillDescription[SKID.DA_SPACE] = [].join("\n");

	SkillDescription[SKID.DA_TRANSFORM] = [].join("\n");

	SkillDescription[SKID.DA_EXPLOSION] = [].join("\n");

	SkillDescription[SKID.DA_REWARD] = [].join("\n");

	SkillDescription[SKID.DA_CRUSH] = [].join("\n");

	SkillDescription[SKID.DA_ITEMREBUILD] = [].join("\n");

	SkillDescription[SKID.DA_ILLUSION] = [].join("\n");

	SkillDescription[SKID.DA_NUETRALIZE] = [].join("\n");

	SkillDescription[SKID.DA_RUNNER] = [].join("\n");

	SkillDescription[SKID.DA_TRANSFER] = [].join("\n");

	SkillDescription[SKID.DA_WALL] = [].join("\n");

	SkillDescription[SKID.DA_REVENGE] = [].join("\n");

	SkillDescription[SKID.DA_EARPLUG] = [].join("\n");

	SkillDescription[SKID.DA_CONTRACT] = [].join("\n");

	SkillDescription[SKID.DA_BLACK] = [].join("\n");

	SkillDescription[SKID.DA_DREAM] = [].join("\n");

	SkillDescription[SKID.DA_MAGICCART] = [].join("\n");

	SkillDescription[SKID.DA_COPY] = [].join("\n");

	SkillDescription[SKID.DA_CRYSTAL] = [].join("\n");

	SkillDescription[SKID.DA_EXP] = [].join("\n");

	SkillDescription[SKID.DA_CARTSWING] = [].join("\n");

	SkillDescription[SKID.DA_REBUILD] = [].join("\n");

	SkillDescription[SKID.DA_JOBCHANGE] = [].join("\n");

	SkillDescription[SKID.DA_EDARKNESS] = [].join("\n");

	SkillDescription[SKID.DA_EGUARDIAN] = [].join("\n");

	SkillDescription[SKID.DA_TIMEOUT] = [].join("\n");

	SkillDescription[SKID.ALL_TIMEIN] = [].join("\n");

	SkillDescription[SKID.DA_ZENYRANK] = [].join("\n");

	SkillDescription[SKID.DA_ACCESSORYMIX] = [].join("\n");

	SkillDescription[SKID.NPC_EARTHQUAKE] = [].join("\n");

	SkillDescription[SKID.NPC_DRAGONFEAR] = [].join("\n");

	SkillDescription[SKID.NPC_PULSESTRIKE] = [].join("\n");

	SkillDescription[SKID.NPC_HELLJUDGEMENT] = [].join("\n");

	SkillDescription[SKID.NPC_WIDESILENCE] = [].join("\n");

	SkillDescription[SKID.NPC_WIDEFREEZE] = [].join("\n");

	SkillDescription[SKID.NPC_WIDEBLEEDING] = [].join("\n");

	SkillDescription[SKID.NPC_WIDESTONE] = [].join("\n");

	SkillDescription[SKID.NPC_WIDECONFUSE] = [].join("\n");

	SkillDescription[SKID.NPC_WIDESLEEP] = [].join("\n");

	SkillDescription[SKID.NPC_EVILLAND] = [].join("\n");

	SkillDescription[SKID.NPC_MAGICMIRROR] = [].join("\n");

	SkillDescription[SKID.NPC_SLOWCAST] = [].join("\n");

	SkillDescription[SKID.NPC_CRITICALWOUND] = [].join("\n");

	SkillDescription[SKID.NPC_STONESKIN] = [].join("\n");

	SkillDescription[SKID.NPC_ANTIMAGIC] = [].join("\n");

	SkillDescription[SKID.NPC_WIDECURSE] = [].join("\n");

	SkillDescription[SKID.NPC_WIDESTUN] = [].join("\n");

	SkillDescription[SKID.NPC_VAMPIRE_GIFT] = [].join("\n");

	SkillDescription[SKID.NPC_WIDESOULDRAIN] = [].join("\n");

	SkillDescription[SKID.ALL_INCCARRY] = [
		"Enlarge Weight LimitR",
		"Max Lv : 10",
		"Skill Form : ^000099Passive^000000",
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

	SkillDescription[SKID.NPC_HELLPOWER] = [].join("\n");

	SkillDescription[SKID.NPC_ALLHEAL] = [].join("\n");

	SkillDescription[SKID.GM_SANDMAN] = [
		"Goodnight, Sweety",
		"Skill Form : ^777777Supportive^000000",
		"Description : ^777777Make the enemy fall asleep by singing an irresistible lullaby.^000000"
	].join("\n");

	SkillDescription[SKID.ALL_CATCRY] = [
		"Monster's Cry",
		"Description : ^777777Can hear a cat's crying for kicking the mice out.^000000"
	].join("\n");

	SkillDescription[SKID.ALL_PARTYFLEE] = [].join("\n");

	SkillDescription[SKID.ALL_ANGEL_PROTECT] = [ "Thank You So Much!!" ].join("\n");

	SkillDescription[SKID.ALL_DREAM_SUMMERNIGHT] = [
		"Summer Dream",
		"Description : ^777777Feels like dreaming in the middle of summer.^000000"
	].join("\n");

	SkillDescription[SKID.ALL_REVERSEORCISH] = [].join("\n");

	SkillDescription[SKID.ALL_WEWISH] = [
		"Sing along with the Singing Crystal's tune:",
		"We wish you a Merry Christmas,",
		"and a Happy New Year!"
	].join("\n");

	SkillDescription[SKID.ALL_BUYING_STORE] = [
		"Open Buying Store",
		"Skill Form : Supportive",
		"Description : ^777777Open a simple store from which",
		"you can buy various items from others.",
		"Consumes 1 ^FF0000Bulk Buyer Shop License.^000000"
	].join("\n");

	SkillDescription[SKID.ALL_GUARDIAN_RECALL] = [
		"Call of Guardian",
		"Max LV : 1",
		"Skill Form : ^777777Supportive^bb0000^000000",
		"Description : ^777777Move to Mora Town. 3 seconds of fixed casting. Cannot use it again for 5 minutes.^000000"
	].join("\n");

	SkillDescription[SKID.ALL_ODINS_POWER] = [
		"Odin's Power",
		"Description : ^777777+70 ATK and MATK for 60 seconds, -20 DEF and MDEF at the same time. ^000000"
	].join("\n");

	SkillDescription[SKID.RK_ENCHANTBLADE] = [
		"Enchant Blade",
		"Max Lv :  10",
		"^777777Skill Requirement : Rune Mastery 2^000000",
		"Skill Form : ^777777Asist^000000",
		"Target : ^777777Self^000000",
		"Description : ^777777Adds the caster's MATK to the melee physical attack for 5 minutes. Additional MATK per skill level. It's affected by the caster's BaseLv and INT.  ^000000",
		"[Level 1] : ^777777MATK +120^000000",
		"[Level 2] : ^777777MATK +140^000000",
		"[Level 3] : ^777777MATK +160^000000",
		"[Level 4] : ^777777MATK +180^000000",
		"[Level 5] : ^777777MATK +200^000000",
		"[Level 6] : ^777777MATK +220^000000",
		"[Level 7] : ^777777MATK +240^000000",
		"[Level 8] : ^777777MATK +260^000000",
		"[Level 9] : ^777777MATK +280^000000",
		"[Level10] : ^777777MATK +300^000000"
	].join("\n");

	SkillDescription[SKID.RK_SONICWAVE] = [
		"Sonic Wave",
		"Max Lv :  10",
		"^777777Skill Requirement : Enchant Blade 3^000000",
		"Skill Form : ^777777Damage^000000",
		"Description : ^777777Strikes the ground and attacks enemies at a far distance.",
		"HIT rate is assisted as skill level increases. Half of Critical Hit rate is applied.",
		"Damage increases as BaseLv increases. Half of Critical Damage option can be applied.^000000",
		"[Level 1] : ^777777ATK 1200%^000000",
		"[Level 2] : ^777777ATK 1350%^000000",
		"[Level 3] : ^777777ATK 1500%^000000",
		"[Level 4] : ^777777ATK 1650%^000000",
		"[Level 5] : ^777777ATK 1800%^000000",
		"[Level 6] : ^777777ATK 1950%^000000",
		"[Level 7] : ^777777ATK 2100%^000000",
		"[Level 8] : ^777777ATK 2250%^000000",
		"[Level 9] : ^777777ATK 2400%^000000",
		"[Level10] : ^777777ATK 2550%^000000"
	].join("\n");

	SkillDescription[SKID.RK_DEATHBOUND] = [
		"Death Bound",
		"Max Lv :  10",
		"^777777Skill Requirement : Counter Attack 1,",
		"Enchant Blade 2^000000",
		"Skill Form : ^777777Offensive^000000",
		"Description : ^777777Amplify and counters damage",
		"received towards your enemy. Some of the",
		"amplified damage will also reflect on you.",
		"While in this stance, you cannot move for 2 seconds.",
		"Must wait 5 seconds before re-casting.",
		"Cannot be used on MVP type monsters.",
		"[Lv 1] : ^77777728 SP / Amplify Damage by 600%^000000",
		"[Lv 2] : ^77777731 SP / Amplify Damage by 700%^000000",
		"[Lv 3] : ^77777734 SP / Amplify Damage by 800%^000000",
		"[Lv 4] : ^77777737 SP / Amplify Damage by 900%^000000",
		"[Lv 5] : ^77777740 SP / Amplify Damage by 1000%^000000",
		"[Lv 6] : ^77777743 SP / Amplify Damage by 1100%^000000",
		"[Lv 7] : ^77777746 SP / Amplify Damage by 1200%^000000",
		"[Lv 8] : ^77777749 SP / Amplify Damage by 1300%^000000",
		"[Lv 9] : ^77777752 SP / Amplify Damage by 1400%^000000",
		"[Lv 10] : ^77777755 SP / Amplify Damage by 1500%^000000"
	].join("\n");

	SkillDescription[SKID.RK_HUNDREDSPEAR] = [
		"Hundred Spears",
		"Max Lv :  10",
		"^777777Skill Requirement : Phantom Thrust 3^000000",
		"Skill Form : ^777777Damage^000000",
		"Description : ^777777Spear Weapon Skill. Deals great damage to a target, also enemies in range. Damage increases as BaseLv and slv of Spiral Pierce increase.",
		"Range: 7 cells. ^000000",
		"[Level 1] : ^777777ATK 800%  / Area : 3x3^000000",
		"[Level 2] : ^777777ATK 1000% / Area : 3x3^000000",
		"[Level 3] : ^777777ATK 1200% / Area : 3x3^000000",
		"[Level 4] : ^777777ATK 1400% / Area : 3x3^000000",
		"[Level 5] : ^777777ATK 1600% / Area : 5x5^000000",
		"[Level 6] : ^777777ATK 1800% / Area : 5x5^000000",
		"[Level 7] : ^777777ATK 2000% / Area : 5x5^000000",
		"[Level 8] : ^777777ATK 2200% / Area : 5x5^000000",
		"[Level 9] : ^777777ATK 2400% / Area : 7x7^000000",
		"[Level 10] : ^777777ATK 2600% / Area : 7x7^000000"
	].join("\n");

	SkillDescription[SKID.RK_WINDCUTTER] = [
		"Wind Cutter",
		"Max Lv :  5",
		"^777777Skill Requirement : Enchant Blade 5^000000",
		"Skill Form : ^777777Area of EffectDamage^000000",
		"Description : ^777777 Wields a powerful weapon and damages the surrounding enemies using a wind pressure.",
		"When spear's equipped, damage becomes ranged. When two-handed sword's equipped, damages twice",
		"Damage increases as BaseLv increases.^000000",
		"[Level 1] : ^777777Normal Weapon: ATK 300%/Two-handed Sword: ATK 250%/Spear: 400%^000000",
		"[Level 2] : ^777777Normal Weapon: ATK 600%/Two-handed Sword: ATK 500%/Spear: 800%^000000",
		"[Level 3] : ^777777Normal Weapon: ATK 900%/Two-handed Sword: ATK 750%/Spear:1200%^000000",
		"[Level 4] : ^777777Normal Weapon: ATK1200%/Two-handed Sword: ATK1000%/Spear:1600%^000000",
		"[Level 5] : ^777777Normal Weapon: ATK1500%/Two-handed Sword: ATK1250%/Spear:2000%^000000"
	].join("\n");

	SkillDescription[SKID.RK_IGNITIONBREAK] = [
		"Ignition Break",
		"Max Lv :  5",
		"^777777Skill Requirement : Sonic Wave 2, Wind Cutter 3, Death Bound 5^000000",
		"Skill Form : ^777777Area of EffectDamage^000000",
		"Description : ^777777  The weapon hits the ground, causing a strong explosion, damaging all enemies around.",
		"Half of the critical chance of the caster is applied, damage increases as BaseLv increases.^000000",
		"For Critical Damage, half of Critical Damage option is applied.^000000",
		"[Level 1] : ^777777ATK 450%^000000",
		"[Level 2] : ^777777ATK 900%^000000",
		"[Level 3] : ^777777ATK 1350%^000000",
		"[Level 4] : ^777777ATK 1800%^000000",
		"[Level 5] : ^777777ATK 2250%^000000"
	].join("\n");

	SkillDescription[SKID.RK_DRAGONTRAINING] = [
		"Dragon Training",
		"Max Lv :  5",
		"^777777Skill Requirement : Cavalier Mastery 1^000000",
		"Skill Form : ^777777Passive^000000",
		"Description : ^777777When mounted on a dragon, this skill increases Weight Limit, increase the damage of Dragon Breath.",
		"allows Spear class weapons to ignore the size modifiers, dealing 100% damage at all time and increases attack power.. ^000000",
		"[Level 1] : ^777777Dragon Breath Modifier 100%^000000",
		"[Level 2] : ^777777Dragon Breath Modifier 110%^000000",
		"[Level 3] : ^777777Dragon Breath Modifier 120%^000000",
		"[Level 4] : ^777777Dragon Breath Modifier 130%^000000",
		"[Level 5] : ^777777Dragon Breath Modifier 140%^000000"
	].join("\n");

	SkillDescription[SKID.RK_DRAGONBREATH] = [
		"Dragon's Breath",
		"Max Lv :  10",
		"^777777Skill Requirement : Dragon Training 2^000000",
		"Skill Form : ^777777Area of EffectDamage^000000",
		"Description : ^777777Uses Firebreath, causing special ranged physical damage to the speed of fire, and enemies who are damaged by the dragon's breath sometimes suffer continuous damage due to fire. The power of the dragon's breath depends on the condition of the caster who controls it.",
		"When Giant Growth Effect, attack property becomes Holy. When Lux Anima Effect, attack property becomes Shadow.",
		"(When Giant Growth and Anima Effect, attack property becomes Shadow)^000000"
	].join("\n");

	SkillDescription[SKID.RK_DRAGONHOWLING] = [
		"Dragon Howling",
		"Max Lv :  5",
		"^777777Skill Requirement : Dragon Training 2^000000",
		"Skill Form : ^777777Debuff^000000",
		"Description : ^777777Commands the dragon to howl, causing Fear status at a certain chance to all enemies in range.",
		"[Lv 1] : ^7777773 cell AoE / 56% Fear Chance^000000",
		"[Lv 2] : ^7777774 cell AoE / 62% Fear Chance^000000",
		"[Lv 3] : ^7777775 cell AoE / 68% Fear Chance^000000",
		"[Lv 4] : ^7777776 cell AoE / 74% Fear Chance^000000",
		"[Lv 5] : ^7777777 cell AoE / 80% Fear Chance^000000"
	].join("\n");

	SkillDescription[SKID.RK_RUNEMASTERY] = [
		"Rune Mastery",
		"Max Lv :  10",
		"Skill Form : ^777777Passive^000000",
		"Description : ^777777Rune Knights gain the power to understand and use runes through Rune Mastery. This skill enables playes to make rune stones and it affects the success rate. There are 10 different types of runes, and number of makable runes stones increase depending on the runes mastery level.",
		"One rune stone and one Elder branch are basically consumed to make a rune stone, and additional materials are required for each rune stone. At least two are produced at once, from slv 5, 2-4 are produced, and from level 10, 2-6 are produced.^000000",
		"[Level 1] : ^777777Turisus Runestone - Blue Hair 1 , Claw of Desert Wolf 1 ^000000",
		"[Level 2] : ^777777Isia Runestone - Burning Heart 1 ^000000",
		"[Level 3] : ^777777Pertz Runestone - Light Granule 1, Tangled Chains 1, Dragon Canine 1 ^000000",
		"[Level 4] : ^777777Hagalas Runestone - Materials : Round Shell 1 , Dragon Skin 1 ^000000",
		"[Level 5] : ^777777Asir Runestone - Materials : Light Granule 1, Ogre Tooth 1 ^000000",
		"[Level 6] : ^777777Urj Runestone - Materials : Horrendous Hair 1, Honey 1 ^000000",
		"[Level 7] : ^777777Rhydo Runestone - Materials : Light Granule 1, Red Gemstone 1 ^000000",
		"[Level 8] : ^777777Nosiege Runestone - Materials : Light Granule 1, Destroyed Armor 1, Worn-out Magic Scroll 1 ^000000",
		"[Level 9] : ^777777Verkana Runestone - Materials : Armor Piece of Dullahan 1 ^000000",
		"[Level10] : ^777777Lux Anima Runestone - Materials : Gold 3, Light Granule 3 ^000000"
	].join("\n");

	SkillDescription[SKID.RK_MILLENNIUMSHIELD] = [].join("\n");

	SkillDescription[SKID.RK_CRUSHSTRIKE] = [].join("\n");

	SkillDescription[SKID.RK_REFRESH] = [].join("\n");

	SkillDescription[SKID.RK_GIANTGROWTH] = [].join("\n");

	SkillDescription[SKID.RK_STONEHARDSKIN] = [].join("\n");

	SkillDescription[SKID.RK_VITALITYACTIVATION] = [].join("\n");

	SkillDescription[SKID.RK_STORMBLAST] = [].join("\n");

	SkillDescription[SKID.RK_FIGHTINGSPIRIT] = [].join("\n");

	SkillDescription[SKID.RK_ABUNDANCE] = [].join("\n");

	SkillDescription[SKID.RK_PHANTOMTHRUST] = [
		"Phantom Thrust",
		"Max Lv :  5",
		"^777777Skill Requirement : Brandish Spear 2^000000",
		"Skill Form : ^777777Offensive^000000",
		"Description : ^777777Attacks a distant enemy bringing",
		"them close to the caster. Can be used on a",
		"party member, but won't give damage. Gives",
		"Additional damage with Lv 10 Spear Mastery.^000000",
		"[Lv 1] : ^77777715 SP / 5 Cell Range / ATK 50%^000000",
		"[Lv 2] : ^77777718 SP / 6 Cell Range / ATK 100%^000000",
		"[Lv 3] : ^77777721 SP / 7 Cell Range / ATK 150%^000000",
		"[Lv 4] : ^77777724 SP / 8 Cell Range / ATK 200%^000000",
		"[Lv 5] : ^77777727 SP / 9 Cell Range / ATK 250%^000000"
	].join("\n");

	SkillDescription[SKID.GC_VENOMIMPRESS] = [
		"Venom Impression",
		"Max Lv : 5",
		"^777777Skill Requirement : Enchant Poison 3 ^000000",
		"Skill Form : ^777777Active / Debuff  ^000000",
		"Description : ^777777Weaken the enemy's resistance",
		"against Venom type attacks in a 10x10 range.^000000",
		"[Lv 1] : ^777777Weaken venom resistance by 10%^000000",
		"[Lv 2] : ^777777Weaken venom resistance by 20%^000000",
		"[Lv 3] : ^777777Weaken venom resistance by 30%^000000",
		"[Lv 4] : ^777777Weaken venom resistance by 40%^000000",
		"[Lv 5] : ^777777Weaken venom resistance by 50%^000000"
	].join("\n");

	SkillDescription[SKID.GC_CROSSIMPACT] = [
		"Cross Impact",
		"Max Lv : 5",
		"^777777Skill Requirement : Sonic Blow 10 ^000000",
		"Skill Form : ^777777  Active / Damage  ^000000",
		"Description : ^777777  Leaps to a target and deals melee physical damage.",
		"Only the half of critical chance applies, damage increases based on BaseLv.",
		"Only the half of Critical Damage option applies. Range 7Cell.^000000",
		"[Level 1] : ^777777 Damage 1550% ^000000",
		"[Level 2] : ^777777 Damage 1700% ^000000",
		"[Level 3] : ^777777 Damage 1850% ^000000",
		"[Level 4] : ^777777 Damage 2000% ^000000",
		"[Level 5] : ^777777 Damage 2150% ^000000"
	].join("\n");

	SkillDescription[SKID.GC_DARKILLUSION] = [
		"Dark Illusion",
		"Max Lv : 5",
		"^777777Skill Requirement : Cross Impact 3 ^000000",
		"Skill Form : ^777777Active / Damage - Special ^000000",
		"Description : ^777777Quickly reach and attack an enemy. Has a low chance of activating Cross Impact.^000000",
		"[Lv 1] : ^777777Damage 100% / 5 cell range^000000",
		"[Lv 2] : ^777777Damage 100% / 6 cell range^000000",
		"[Lv 3] : ^777777Damage 100% / 7 cell range^000000",
		"[Lv 4] : ^777777Damage 100% / 8 cell range^000000",
		"[Lv 5] : ^777777Damage 100% / 9 cell range^000000"
	].join("\n");

	SkillDescription[SKID.GC_RESEARCHNEWPOISON] = [
		"New Poison Research",
		"Max Lv : 10",
		"^777777Skill Requirement : Guillotine Cross Base Skill ^000000",
		"Skill Form : ^777777  Passive  ^000000",
		"Description : ^777777  Learns to create a new poison. Depending on the skill level, the number of poisons and manufacturing that can be made increases, and the probability of success rate increases.",
		"Requires a medicine bowl and a poison kit, and each poison must have the necessary materials.",
		"Additionally, the lethal poison grant time is increased by 15 seconds per level from 45 sec^000000",
		"[Level 1] : ^777777 Chance to success 35% / Paralysis : 20 Poisonous Toad Skin, 1 Poison herb Amoena ^000000",
		"[Level 2] : ^777777 Chance to success 40% / Pyrexia: \t20 Anolian Skin,1 Poison Herb Rantana ^000000",
		"[Level 3] : ^777777 Chance to success 45% / Death Hurt: 25 Decayed Nail, 1 Poison Herb Seratum ^000000",
		"[Level 4] : ^777777 Chance to success 50% / Leech End: 1 Poison Herb Scopolia, 1 Poison Herb Nerium^000000",
		"[Level 5] : ^777777 Chance to success 55% / Antidote: 2 Green Herb, 1 Blue Herb, 1 White Herb ^000000",
		"[Level 6] : ^777777 Chance to success 60% / Venom Bleed: 10 Sticky Poison, 1 Izidor ^000000",
		"[Level 7] : ^777777 Chance to success 65% / Magic Mushroom: 10 Poison Spore, 1 Poison herb Makulata ^000000",
		"[Level 8] : ^777777 Chance to success 70% / Toxin: 10 Sticky Poison, 1 Poison Herb Nerium ^000000",
		"[Level 9] : ^777777 Chance to success 75% / Oblivion Curse: 10 Mermaid's Heart, 1 Izidor ^000000",
		"[Level 10] : ^777777 Chance to success 80% / -  ^000000"
	].join("\n");

	SkillDescription[SKID.GC_CREATENEWPOISON] = [
		"New Poison Creation",
		"Max Lv : 1",
		"^777777Skill Requirement : New Poison Research 1  ^000000",
		"Skill Form : ^777777Active  ^000000",
		"Description : ^777777Create new poison from",
		"the list of possible poisons shown according",
		"to the level of New Poison Research and the",
		"materials you have. ^000000"
	].join("\n");

	SkillDescription[SKID.GC_ANTIDOTE] = [
		"Antidote",
		"Max Lv : 1",
		"^777777Skill Requirement : New Poison Research 5  ^000000",
		"Skill Form : ^777777Active / Detoxification  ^000000",
		"Description : ^777777Can detoxify Guillotine Cross's",
		"poison status and 1 target consuming 1 Antidote. ^000000"
	].join("\n");

	SkillDescription[SKID.GC_POISONINGWEAPON] = [
		"Poisonous Weapon",
		"Max Lv : 5",
		"^777777Skill Requirement : Research New Poison 1 ^000000",
		"Skill Form : ^777777  Active / Buff  ^000000",
		"Description : ^777777  Make the caster's weapon coated by Guillotine Cross's new poison. During duration, caster's melee physical damage increases, provides special effect based on what's coated.",
		"Has a change to poison the target by attacking.^000000",
		"[Level 1] : ^777777 Chance 4% / Duration 60 sec ^000000",
		"[Level 2] : ^777777 Chance 6% / Duration 120 sec ^000000",
		"[Level 3] : ^777777 Chance 8% / Duration 180 sec ^000000",
		"[Level 4] : ^777777 Chance 10% / Duration 240 sec ^000000",
		"[Level 5] : ^777777 Chance 12% / Duration 300 sec ^000000",
		"[Paralysis] : ^777777 Increase movement speed ^000000",
		"[Pyrexia] : ^777777 Increase critical damage, increase base physical damage ^000000",
		"[Death Hurt] : ^777777 Recovers MaxHP 1% per 1 sec ^000000",
		"[Leech End] : ^777777 Increase resistance to dark and stun status by 100% ^000000",
		"[Venom Bleed] : ^777777 Reduce melee reflection damage by 30% ^000000",
		"[Magic Mushroom] : ^777777 Reduce delay after skill by 10% ^000000",
		"[Toxin] : ^777777 Recovers MaxSP 1% per 1 sec ^000000",
		"[Oblivion Curse] : ^777777 Increase resistance to silence and curse by 100%^000000"
	].join("\n");

	SkillDescription[SKID.GC_WEAPONBLOCKING] = [
		"Weapon Blocking",
		"Max Lv : 5",
		"^777777Skill Requirement : Lefthand Mastery 5 ^000000",
		"Skill Form : ^777777  Active / Buff  ^000000",
		"Description : ^777777  Has a chance to cancel an enemy's",
		"melee physical attack and can use Weapon Crush when skill is active.",
		"When attack block success, get into the counter stance for 10 secods.",
		"During the counter stance, you can use Counter Slash.",
		"Continuously consumes SP while",
		"this skill is activated. If skill is recast,",
		"Weapon Blocking is canceled.^000000",
		"[Level 1] : ^777777 Defense Rate 12% / Duration 180 sec ^000000",
		"[Level 2] : ^777777 Defense Rate 14% / Duration 180 sec ^000000",
		"[Level 3] : ^777777 Defense Rate 16% / Duration 180 sec ^000000",
		"[Level 4] : ^777777 Defense Rate 18% / Duration 180 sec ^000000",
		"[Level 5] : ^777777 Defense Rate 20% / Duration 180 sec ^000000"
	].join("\n");

	SkillDescription[SKID.GC_COUNTERSLASH] = [
		"Counter Slash",
		"Max Lv : 10",
		"^777777Skill Requirement : Weapon Blocking 1 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Can be used while in Counter by Weapon Blocking. Deals damage to enemies around.",
		"Damage ignores targets' physical defense, and damage ignorance increases based on BaseLv, JobLv and AGI. ^000000",
		"[Level 1] : ^777777 Damage 450% / Area of Effect 3 x 3^000000",
		"[Level 2] : ^777777 Damage 600% / Area of Effect 3 x 3^000000",
		"[Level 3] : ^777777 Damage 750% / Area of Effect 3 x 3^000000",
		"[Level 4] : ^777777 Damage 900% / Area of Effect 3 x 3^000000",
		"[Level 5] : ^777777 Damage 1050% / Area of Effect 3 x 3^000000",
		"[Level 6] : ^777777 Damage 1200% / Area of Effect 5 x 5^000000",
		"[Level 7] : ^777777 Damage 1350% / Area of Effect 5 x 5^000000",
		"[Level 8] : ^777777 Damage 1500% / Area of Effect 5 x 5^000000",
		"[Level 9] : ^777777 Damage 1650% / Area of Effect 5 x 5^000000",
		"[Level10] : ^777777 Damage 1800% / Area of Effect 5 x 5^000000"
	].join("\n");

	SkillDescription[SKID.GC_WEAPONCRUSH] = [
		"Weapon Crush ",
		"Max Lv : 5",
		"^777777Skill Requirement : Weapon Blocking 1 ^000000",
		"Skill Form : ^777777  Active / Debuff  ^000000",
		"Description : ^777777  If Weapon Blocking skill",
		"is successful, you can attack the enemy",
		"successively with Weapon Crush. Able to",
		"divest the target's weapon. Increases the",
		"duration and success rate according to the",
		"caster's Skill Level. ^000000"
	].join("\n");

	SkillDescription[SKID.GC_VENOMPRESSURE] = [
		"Venom Pressure",
		"Max Lv : 5",
		"^777777Skill Requirement : Weapon Blocking 1,",
		"Poisoning Weapon 3 ^000000",
		"Skill Form : ^777777Active / Buff  ^000000",
		"Description : ^777777Gives damage to the enemy nearby",
		"and poisons the enemy with the poisoned",
		"weapon. After casting the skill, the effect",
		"of Poisoning Weapon is canceled. ^000000",
		"[Lv 1] : ^777777Poisoning Rate 75% / Accuracy +14 ^000000",
		"[Lv 2] : ^777777Poisoning Rate 80% / Accuracy +18 ^000000",
		"[Lv 3] : ^777777Poisoning Rate 85% / Accuracy +22 ^000000",
		"[Lv 4] : ^777777Poisoning Rate 90% / Accuracy +26 ^000000",
		"[Lv 5] : ^777777Poisoning Rate 95% / Accuracy +30 ^000000"
	].join("\n");

	SkillDescription[SKID.GC_POISONSMOKE] = [
		"Poisonous Smoke",
		"Max Lv : 5",
		"^777777Skill Requirement : Venom Pressure 5, Poisoning Weapon 5 ^000000",
		"Skill Form : ^777777Active / Buff  ^000000",
		"Description : ^777777With Poisoning Weapon activated, spread a poisonous smoke around 5x5 cells. Enemy in the range have a 20% chance of getting poisoned every 2 seconds. When casting, Poisoning Weapon effect gets removed.^000000",
		"[Lv 1] : ^77777710 sec. duration ^000000",
		"[Lv 2] : ^77777712 sec. duration ^000000",
		"[Lv 3] : ^77777714 sec. duration ^000000",
		"[Lv 4] : ^77777716 sec. duration ^000000",
		"[Lv 5] : ^77777718 sec. duration ^000000"
	].join("\n");

	SkillDescription[SKID.GC_CLOAKINGEXCEED] = [
		"Cloaking Exceed",
		"Max Lv : 5",
		"^777777Skill Requirement : Cloaking 3 ^000000",
		"Skill Form : ^777777Active / Special  ^000000",
		"Description : ^777777Cannot be found by Insect and",
		"Demon type monsters. Not released until the",
		"caster is hit 3 times. Increase Movement",
		"Speed according to Skill Level. ^000000",
		"[Lv 1] : ^777777Consume SP 9 per sec. / Movement",
		"Speed 100% / Endure the damage once^000000",
		"[Lv 2] : ^777777Consume SP 8 per sec. / Movement",
		"Speed 110% / Endure the damage once^000000",
		"[Lv 3] : ^777777Consume SP 7 per sec. / Movement",
		"Speed 120% / Endure the damage twice^000000",
		"[Lv 4] : ^777777Consume SP 6 per sec. / Movement",
		"Speed 130% / Endure the damage twice^000000",
		"[Lv 5] : ^777777Consume SP 5 per sec. / Movement",
		"Speed 140% / Endure the damage three times^000000"
	].join("\n");

	SkillDescription[SKID.GC_PHANTOMMENACE] = [
		"Phantom Menace",
		"Max Lv : 1",
		"^777777Skill Requirement : Dark Illusion 5,",
		"Cloaking Exceed 5 ^000000",
		"Skill Form : ^777777Active / Detecting  ^000000",
		"Description : ^777777Guillotine Cross attacks all",
		"hidden enemies within a 7x7 range for 300%",
		"damage. The enemies hit by this can be seen.^000000"
	].join("\n");

	SkillDescription[SKID.GC_HALLUCINATIONWALK] = [
		"Hallucination Walk",
		"Max Lv : 5",
		"^777777Skill Requirement : Phantom Menace 1 ^000000",
		"Skill Form : ^777777Active / Buff ^000000",
		"Description : ^777777Increase the caster's speed to the Maximum, increases Flee rate and certain chance to ignore MATK. Consumes HP when casting, decreases Movement Speed and ASPD by half for 25 secondsafter using the skill.^000000",
		"[Lv 1] : ^777777Flee Rate +50 / ignore MATK +10%^000000",
		"[Lv 2] : ^777777Flee Rate +100 / ignore MATK +20%^000000",
		"[Lv 3] : ^777777Flee Rate +150 / ignore MATK +30%^000000",
		"[Lv 4] : ^777777Flee Rate +200 / ignore MATK +40%^000000",
		"[Lv 5] : ^777777Flee Rate +250 / ignore MATK +50%^000000"
	].join("\n");

	SkillDescription[SKID.GC_ROLLINGCUTTER] = [
		"Rolling Cutter",
		"Max Lv : 5",
		"^777777Skill Requirement : Sonic Blow 10 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Katar Weapon Skill, spins and inflicts damage to all enemies around.",
		"Spin Count increases as using the skill, and damage of Cross Ripper Slasher increases based on Spin Counts.",
		"Spin Counter continues for 10 sec, and the effect is removed when you move. ^000000",
		"[Level 1] : ^777777 Damage 130% / Area of Effect 3 x 3^000000",
		"[Level 2] : ^777777 Damage 210% / Area of Effect 3 x 3^000000",
		"[Level 3] : ^777777 Damage 290% / Area of Effect 5 x 5^000000",
		"[Level 4] : ^777777 Damage 370% / Area of Effect 5 x 5^000000",
		"[Level 5] : ^777777 Damage 450% / Area of Effect 7 x 7^000000"
	].join("\n");

	SkillDescription[SKID.GC_CROSSRIPPERSLASHER] = [
		"Cross Ripper Slasher",
		"Max Lv : 5",
		"^777777Skill Requirement : Rolling Cutter 1  ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Can be used when player has Spin Counts.",
		"Inflicts a strong damage to a target far away.",
		"Damage increases based on BaseLv, AGI, and number of Spin Counts.",
		"Skill range increases 1 cell per skill level, starting from 9 cell.^000000",
		"[Level 1] : ^777777 Damage 80%+Spin Count%^000000",
		"[Level 2] : ^777777 Damage160%+Spin Count%^000000",
		"[Level 3] : ^777777 Damage240%+Spin Count%^000000",
		"[Level 4] : ^777777 Damage320%+Spin Count%^000000",
		"[Level 5] : ^777777 Damage400%+Spin Count%^000000"
	].join("\n");

	SkillDescription[SKID.AB_JUDEX] = [
		"Judex",
		"Max Lv :  10",
		"^777777Skill Requirement : Turn Undead 1^000000",
		"Skill Form : ^777777Holy Magic^000000",
		"Description : ^777777Deals holy damage to a targets within 3 cells around the target.",
		"Damage increases as caster's BaseLv increases ^000000",
		"[Level 1] : ^777777MATK 370%^000000",
		"[Level 2] : ^777777MATK 440%^000000",
		"[Level 3] : ^777777MATK 510%^000000",
		"[Level 4] : ^777777MATK 580%^000000",
		"[Level 5] : ^777777MATK 650%^000000",
		"[Level 6] : ^777777MATK 720%^000000",
		"[Level 7] : ^777777MATK 790%^000000",
		"[Level 8] : ^777777MATK 860%^000000",
		"[Level 9] : ^777777MATK 930%^000000",
		"[Level10] : ^777777MATK 1000%^000000"
	].join("\n");

	SkillDescription[SKID.AB_ANCILLA] = [
		"Ancilla",
		"Max Lv :  1",
		"^777777Skill Requirement : Clementia 3^000000",
		"Skill Form : ^777777Ancilla^000000",
		"Description : ^777777Creates magic stone called Ancilla.",
		"When used, consumes SP 10% and 1 Blue Gemstone. When using Ancilla,",
		"increase healing by 15% for 60 sec, SP recovery by 30%, property of Adoramus becomes neutral.^000000"
	].join("\n");

	SkillDescription[SKID.AB_ADORAMUS] = [
		"Adoramus",
		"Max Lv :  10",
		"^777777Skill Requirement : Judex 5, Ancilla 1, Magnus Exorcismus 1^000000",
		"Skill Form : ^777777Holy Magic^000000",
		"Description : ^777777Deals holy magic damage in AoE, lowering AGI and Shadow.",
		"Damage increases based on BaseLv, consumes 1 Blue Gemstone when used.",
		"While in Ancilla effect, attack property becomes neutral.",
		"When Cleric is around, skill no longer consumes Blue Gemstone, Cleric's partial SP is consumed, caster's Adoramus SP consumption is reduced.",
		"Cannot damage targets on Land Protector. ^000000",
		"[Level 1] : ^777777MATK 550%/ Area of Effect 7x7Cell^000000",
		"[Level 2] : ^777777MATK 800%/ Area of Effect 7x7Cell^000000",
		"[Level 3] : ^777777MATK 1050%/ Area of Effect 7x7Cell^000000",
		"[Level 4] : ^777777MATK 1300%/ Area of Effect 7x7Cell^000000",
		"[Level 5] : ^777777MATK 1550%/ Area of Effect 7x7Cell^000000",
		"[Level 6] : ^777777MATK 1800%/ Area of Effect 7x7Cell^000000",
		"[Level 7] : ^777777MATK 2050%/ Area of Effect 11x11Cell^000000",
		"[Level 8] : ^777777MATK 2300%/ Area of Effect 11x11Cell^000000",
		"[Level 9] : ^777777MATK 2550%/ Area of Effect 11x11Cell^000000",
		"[Level10] : ^777777MATK 2800%/ Area of Effect 11x11Cell^000000"
	].join("\n");

	SkillDescription[SKID.AB_CLEMENTIA] = [
		"Clementia",
		"Max Lv :  3",
		"^777777Skill Requirement : Blessing 1^000000",
		"Skill Form : ^777777Supportive^000000",
		"Description :^777777Casts 'Blessing' on the caster and any party members within it's range. Blessing effect goes up based on caster's JobLevel.^000000",
		"[Lv 1] : ^7777773 cells AoE / 120 sec. duration^000000",
		"[Lv 2] : ^7777777 cells AoE / 180 sec. duration^000000",
		"[Lv 3] : ^77777715 cells AoE / 240 sec. duration^000000"
	].join("\n");

	SkillDescription[SKID.AB_CANTO] = [
		"Cantocandidus",
		"Max Lv :  3",
		"^777777Skill Requirement : Increase AGI 1^000000",
		"Skill Form : ^777777Supportive^000000",
		"Description : ^777777Casts 'Increase AGI' on the caster and any party members within range. AGI effect goes up based on caster's JobLevel.^000000",
		"[Lv 1] : ^7777773 cell range / 120 sec. duration^000000",
		"[Lv 2] : ^7777777 cell range / 180 sec. duration^000000",
		"[Lv 3] : ^77777715 cell range / 240 sec. duration^000000"
	].join("\n");

	SkillDescription[SKID.AB_CHEAL] = [
		"Coluseo Heal",
		"Max Lv :  3",
		"^777777Skill Requirement : Heal 1^000000",
		"Skill Form : ^777777Heal^000000",
		"Description : ^777777Recover HP of all party members around the caster. Additional heal given based on party member number.^000000",
		"[Lv 1] : ^7777773 cells range AoE^000000",
		"[Lv 2] : ^7777777 cells range AoE^000000",
		"[Lv 3] : ^77777715 cells range AoE^000000"
	].join("\n");

	SkillDescription[SKID.AB_EPICLESIS] = [
		"Epiclesis",
		"Max Lv :  5",
		"^777777Skill Requirement : Ancilla 1,",
		"High Heal 1^000000",
		"Skill Form : ^777777Summon^000000",
		"Description : ^777777Summon the Tree of Life that",
		"revives any dead characters within 5x5 cell range of the tree, while increasing MaxHP and recovering HP and SP. Consumes 1 Ancilla and 1 Holy Water. ^000000",
		"[Lv 1] : ^777777MaxHP +5%  Recover 3% HP per 3 sec.",
		"         SP Recovery by 2 %^000000",
		"[Lv 2] : ^777777MaxHP +10% Recover 3% HP per 3 sec.",
		"         SP Recovery by 2 % ^000000",
		"[Lv 3] : ^777777MaxHP +15% Recover 4 % HP per 3 sec.",
		"         SP Recovery by 3 % ^000000",
		"[Lv 4] : ^777777MaxHP +20% Recover 4 % HP per 3 sec.",
		"         SP Recovery by 3 % ^000000",
		"[Lv 5] : ^777777MaxHP +25% Recover 5 % HP per 3 sec.",
		"         SP Recovery by 4 % ^000000"
	].join("\n");

	SkillDescription[SKID.AB_PRAEFATIO] = [
		"Praefatio",
		"Max Lv :  10",
		"^777777Skill Requirement : Kyrie Eleison 1^000000",
		"Skill Form : ^777777Supportive^000000",
		"Description : ^777777Casts 'Kyrie Eleison' on all party members. Def effect goes up when more party member joins.^000000",
		"[Lv 1] : ^777777Defend 7 times^000000",
		"[Lv 2] : ^777777Defend 8 times^000000",
		"[Lv 3] : ^777777Defend 9 times^000000",
		"[Lv 4] : ^777777Defend 10 times^000000",
		"[Lv 5] : ^777777Defend 11 times^000000",
		"[Lv 6] : ^777777Defend 12 times^000000",
		"[Lv 7] : ^777777Defend 13 times^000000",
		"[Lv 8] : ^777777Defend 14 times^000000",
		"[Lv 9] : ^777777Defend 15 times^000000",
		"[Lv 10] : ^777777Defend 16 times^000000"
	].join("\n");

	SkillDescription[SKID.AB_ORATIO] = [
		"Oratio",
		"Max Lv :  10",
		"^777777Skill Requirement : Praefatio 5^000000",
		"Skill Form : ^777777Debuff^000000",
		"Description : ^777777Decreases the Holy resistance",
		"of all enemies on screen for 30 seconds.^000000",
		"[Lv 1] : ^777777Success Rate 45%/resistance -2%^000000",
		"[Lv 2] : ^777777Success Rate 50%/resistance -4%^000000",
		"[Lv 3] : ^777777Success Rate 55%/resistance -6%^000000",
		"[Lv 4] : ^777777Success Rate 60%/resistance -8%^000000",
		"[Lv 5] : ^777777Success Rate 65%/resistance -10%^000000",
		"[Lv 6] : ^777777Success Rate 70%/resistance -12%^000000",
		"[Lv 7] : ^777777Success Rate 75%/resistance -14%^000000",
		"[Lv 8] : ^777777Success Rate 80%/resistance -16%^000000",
		"[Lv 9] : ^777777Success Rate 85%/resistance -18%^000000",
		"[Lv 10] : ^777777Success Rate 90%/resistance -20%^000000"
	].join("\n");

	SkillDescription[SKID.AB_LAUDAAGNUS] = [
		"Lauda Agnus",
		"Max Lv :  4",
		"^777777Skill Requirement : Recovery 1^000000",
		"Skill Form : ^777777Recover^000000",
		"Description : ^777777Recover Freezing, Stone Curse, Dark Curse, Frozen, Crystallization, and Burning of all party members. MaxHP bonus when casting on normal condition party member. ^000000",
		"[Lv 1] : ^777777Success Rate 70% / MaxHP + 4%^000000",
		"[Lv 2] : ^777777Success Rate 80% / MaxHP + 6%^000000",
		"[Lv 3] : ^777777Success Rate 90% / MaxHP + 8%^000000",
		"[Lv 4] : ^777777Success Rate 100% / MaxHP + 10%^000000"
	].join("\n");

	SkillDescription[SKID.AB_LAUDARAMUS] = [
		"Lauda Ramus",
		"Max Lv :  4",
		"^777777Skill Requirement : Lauda Agnus 2^000000",
		"Skill Form : ^777777Recovery^000000",
		"Description : ^777777Cures status effects Silence, Sleep, Stun Curse, Howling, and Deep Sleep from all party members. Critical damage bonus when casting on normal condition party member.",
		"[Lv 1] : ^777777Success Rate 70% / Critical Damage +5%^000000",
		"[Lv 2] : ^777777Success Rate 80% / Critical Damage +10%^000000",
		"[Lv 3] : ^777777Success Rate 90% / Critical Damage +15%^000000",
		"[Lv 4] : ^777777Success Rate 100% / Critical Damage +20%^000000"
	].join("\n");

	SkillDescription[SKID.AB_EUCHARISTICA] = [
		"Eucharistica",
		"Max Lv :  10",
		"^777777Skill Requirement : Epiclesis 1, Expiatio 1^000000",
		"Skill Form : ^777777Passive^000000",
		"Description : ^777777Increase ATK against Undead",
		"and Dark property enemies and decrease",
		"the damage the caster gets.^000000",
		"[Lv 1] : ^777777ATK +1% / Damage -1% ^000000",
		"[Lv 2] : ^777777ATK +2% / Damage -2% ^000000",
		"[Lv 3] : ^777777ATK +3% / Damage -3% ^000000",
		"[Lv 4] : ^777777ATK +4% / Damage -4% ^000000",
		"[Lv 5] : ^777777ATK +5% / Damage -5% ^000000",
		"[Lv 6] : ^777777ATK +6% / Damage -6% ^000000",
		"[Lv 7] : ^777777ATK +7% / Damage -7% ^000000",
		"[Lv 8] : ^777777ATK +8% / Damage -8% ^000000",
		"[Lv 9] : ^777777ATK +9% / Damage -9% ^000000",
		"[Lv 10] : ^777777ATK +10% / Damage -10% ^000000"
	].join("\n");

	SkillDescription[SKID.AB_CONVENIO] = [
		"CONVENIO / Gather",
		"Max Lv :  1",
		"^777777Skill Requirement : Ancilla 1, Oratio 5^000000",
		"Skill Form : ^777777Support^000000",
		"Description : ^777777Summons party members on the same map to the caster's location. ",
		"The skill cannot be used on PVP areas or maps where Teleport is disabled. ",
		"The skill can be used only when caster is a party leader, cannot be used if not in a party. ^000000"
	].join("\n");

	SkillDescription[SKID.AB_VITUPERATUM] = [
		"VITUPERATUM / Criticism",
		"Max Lv :  5",
		"^777777Skill Requirement : Epiclesis 1, Expiatio 1^000000",
		"Skill Form : ^777777Support^000000",
		"Description : ^777777Doubles the damage of the next incoming attack on everyone around the target. Consumes 1 Blue Gemstone. ",
		"The cast time and SP consumption decrease per skill level. ^000000",
		"[Level 1] : ^777777Splash Range 3 ^000000",
		"[Level 2] : ^777777Splash Range 3 ^000000",
		"[Level 3] : ^777777Splash Range 3 ^000000",
		"[Level 4] : ^777777Splash Range 5 ^000000",
		"[Level 5] : ^777777Splash Range 5 ^000000"
	].join("\n");

	SkillDescription[SKID.AB_RENOVATIO] = [
		"Renovatio",
		"Max Lv :  4",
		"^777777Skill Requirement : Coluseo Heal 3^000000",
		"Skill Form : ^777777Heal^000000",
		"Description : ^777777Restores a certain amount of HP per 5 seconds to caster and party members on the screen.^000000",
		"[Level 1] : ^777777Heal 5% of HP every 5 seconds for 90 seconds^000000",
		"[Level 2] : ^777777Heal 6% of HP every 5 seconds for 120 seconds^000000",
		"[Level 3] : ^777777Heal 7% of HP every 5 seconds for 150 seconds^000000",
		"[Level 4] : ^777777Heal 8% of HP every 5 seconds for 180 seconds^000000"
	].join("\n");

	SkillDescription[SKID.AB_HIGHNESSHEAL] = [
		"HIGHNESSHEAL / High Priest's Healing",
		"Max Lv : 5 ",
		"^777777Skill Requirement : Renovatio 1^000000",
		"Skill Form : ^777777Heal^000000",
		"Description : ^777777Restores a lot more HP than acolyte's heal. ^000000",
		"[Level 1] : ^777777 Healing amount 2x  ^000000",
		"[Level 2] : ^777777 Healing amount 2.3x ^000000",
		"[Level 3] : ^777777 Healing amount 2.6x ^000000",
		"[Level 4] : ^777777 Healing amount 2.9x ^000000",
		"[Level 5] : ^777777 Healing amount 3.2x ^000000"
	].join("\n");

	SkillDescription[SKID.AB_CLEARANCE] = [
		"CLEARANCE / Removal",
		"Max Lv : 5 ",
		"^777777Skill Requirement : Laudaramus 2  ^000000",
		"Skill Form : ^777777Special^000000",
		"Description : ^777777Remove all party members and monsters' buffs, debuffs, and status effects. ^000000",
		"[Level 1] : ^777777 Success Rate 68%  ^000000",
		"[Level 2] : ^777777 Success Rate 76%  ^000000",
		"[Level 3] : ^777777 Success Rate 84%  ^000000",
		"[Level 4] : ^777777 Success Rate 92%  ^000000",
		"[Level 5] : ^777777 Success Rate 100%  ^000000"
	].join("\n");

	SkillDescription[SKID.AB_EXPIATIO] = [
		"EXPIATIO / Expiation",
		"Max Lv : 5 ",
		"^777777Skill Requirement : Oratio 5  Duple Light 5 ^000000",
		"Skill Form : ^777777Active^000000",
		"Description : ^777777Grants divine power to one's weapon to penetrate armors when physical/magical attacks. ^000000",
		"[Level 1] : ^777777 Armor Penetration 5% / Lasts for 150 sec  ^000000",
		"[Level 2] : ^777777 Armor Penetration 10% / Lasts for 180 sec  ^000000",
		"[Level 3] : ^777777 Armor Penetration 15% / Lasts for 210 sec  ^000000",
		"[Level 4] : ^777777 Armor Penetration 20% / Lasts for 240 sec  ^000000",
		"[Level 5] : ^777777 Armor Penetration 25% / Lasts for 270 sec  ^000000",
		" "
	].join("\n");

	SkillDescription[SKID.AB_DUPLELIGHT] = [
		"Duple Light / Two Lights",
		"Max Lv : 10 ",
		"^777777Skill Requirement : Aspersio 1^000000",
		"Skill Form : ^777777Active^000000",
		"Description : ^777777Summons two holy lights, deals extra damage when melee attacking.  ^000000",
		"[Level 1] : ^777777Physical ATK + 165% Magical Attack + 440% / Lasts for 90  sec  ^000000",
		"[Level 2] : ^777777Physical ATK + 180% Magical Attack + 480% / Lasts for 120 sec ^000000",
		"[Level 3] : ^777777Physical ATK + 195% Magical Attack + 520% / Lasts for 150 sec  ^000000",
		"[Level 4] : ^777777Physical ATK + 210% Magical Attack + 560% / Lasts for 180 sec  ^000000",
		"[Level 5] : ^777777Physical ATK + 225% Magical Attack + 600% / Lasts for 210 sec  ^000000",
		"[Level 6] : ^777777Physical ATK + 240% Magical Attack + 640% / Lasts for 240 sec  ^000000",
		"[Level 7] : ^777777Physical ATK + 255% Magical Attack + 680% / Lasts for 270 sec  ^000000",
		"[Level 8] : ^777777Physical ATK + 270% Magical Attack + 720% / Lasts for 300 sec  ^000000",
		"[Level 9] : ^777777Physical ATK + 285% Magical Attack + 760% / Lasts for 330 sec  ^000000",
		"[Level10] : ^777777Physical ATK + 300% Magical Attack + 800% / Lasts for 360 sec  ^000000"
	].join("\n");

	SkillDescription[SKID.AB_DUPLELIGHT_MELEE] = [].join("\n");

	SkillDescription[SKID.AB_DUPLELIGHT_MAGIC] = [].join("\n");

	SkillDescription[SKID.AB_SILENTIUM] = [
		"Silentium",
		"Max Lv : 5 ",
		"^777777Skill Requirement : Clearance 1^000000",
		"Skill Form : ^777777Debuff^000000",
		"Description : ^777777Cast Lex Divina to the target",
		"within the certain range from the caster.^000000",
		"[Lv 1] : ^77777764 SP / 9x9 Range^000000",
		"[Lv 2] : ^77777768 SP / 11x11 Range^000000",
		"[Lv 3] : ^77777772 SP / 13x13 Range^000000",
		"[Lv 4] : ^77777776 SP / 15x15 Range^000000",
		"[Lv 5] : ^77777780 SP / 17x17 Range^000000"
	].join("\n");

	SkillDescription[SKID.WL_WHITEIMPRISON] = [
		"White Imprison",
		"Max LV 5 ",
		"^777777Skill Requirement : Soul Expansion 3^000000",
		"Skill Form : ^777777Curse ^000000",
		"Description : ^777777Locks a target in a transparent",
		"box that prevents damage except from Ghost",
		"property damage. Can cast on oneself lasting",
		"for 5 sec. When the duration is finished, the",
		"caster loses HP of Skill Level x400. Success",
		"Rate increases according to the caster's Job",
		"Level. Not effective on Boss monsters.^000000",
		"[Lv 1] : ^777777Success Rate 50% / 10 sec. duration^000000",
		"[Lv 2] : ^777777Success Rate 60% / 12 sec. duration^000000",
		"[Lv 3] : ^777777Success Rate 70% / 14 sec. duration^000000",
		"[Lv 4] : ^777777Success Rate 80% / 16 sec. duration^000000",
		"[Lv 5] : ^777777Success Rate 90% / 18 sec. duration^000000"
	].join("\n");

	SkillDescription[SKID.WL_SOULEXPANSION] = [
		"Soul Expansion",
		"Max LV 5 ",
		"^777777Skill Requirement : Drain Life 1  ^000000",
		"Skill Form : ^777777 Active / Damage ^000000",
		"Description : ^777777 Deals Ghost magic damage to a target and enemies in AoE. Deals twice damage when target is in White Imprison.",
		"Damage increases based on BaseLv and INT.^000000",
		"[Level 1] : ^777777 MATK 1200% ^000000",
		"[Level 2] : ^777777 MATK 1400% ^000000",
		"[Level 3] : ^777777 MATK 1600% ^000000",
		"[Level 4] : ^777777 MATK 1800% ^000000",
		"[Level 5] : ^777777 MATK 2000% ^000000"
	].join("\n");

	SkillDescription[SKID.WL_FROSTMISTY] = [
		"Frost Misty",
		"Max LV 5",
		"^777777Skill Requirement : Summon Water Ball 1  ^000000",
		"Skill Form : ^777777 Damage / Status Effect ^000000",
		"Description : ^777777 Releases freezing mist around an area, dealing damage and inflicting Freezing status on all enemies. Enemies on Freezing status will have reduced movement speed, attack speed, and armor, and increased fixed cast time and damage received from Jack Frost.",
		"Damage increases based on caster's BaseLv.^000000",
		"[Level 1] : ^777777 Chance of Freezing 30%/MATK 300%/attacks 1 time ^000000",
		"[Level 2] : ^777777 Chance of Freezing 35%/MATK 400%/attacks 2 times ^000000",
		"[Level 3] : ^777777 Chance of Freezing 40%/MATK 500%/attacks 3 times ^000000",
		"[Level 4] : ^777777 Chance of Freezing 45%/MATK 600%/attacks 4 times ^000000",
		"[Level 5] : ^777777 Chance of Freezing 50%/MATK 700%/attacks 5 times ^000000"
	].join("\n");

	SkillDescription[SKID.WL_JACKFROST] = [
		"Jack Frost",
		"Max LV 5",
		"^777777Skill Requirement : Frost Misty 2  ^000000",
		"Skill Form : ^777777 Active / Damage ^000000",
		"Description : ^777777 Inflicts Water property magic damage to all anemies around the target. Deals more damage to Frozen status.",
		"Damage increases based on caster's BaseLv.^000000",
		"[Level 1] : ^777777 MATK 1300%/Frozen Status MATK 1800%^000000",
		"[Level 2] : ^777777 MATK 1600%/Frozen Status MATK 2400%^000000",
		"[Level 3] : ^777777 MATK 1900%/Frozen Status MATK 3000%^000000",
		"[Level 4] : ^777777 MATK 2200%/Frozen Status MATK 3600%^000000",
		"[Level 5] : ^777777 MATK 2500%/Frozen Status MATK 4200%^000000"
	].join("\n");

	SkillDescription[SKID.WL_MARSHOFABYSS] = [
		"Marsh Of Abyss",
		"Max LV 5",
		"^777777Skill Requirement : Quagmire 1  ^000000",
		"Skill Form : ^777777Debuff ^000000",
		"Description : ^777777Curses a target, slowing its movement speed, AGI and DEX.^000000",
		"[Lv 1] : ^77777740 SP / Movement -10%^000000",
		"          AGI/DEX: -6% Monster / -3% Player",
		"[Lv 2] : ^77777742 SP / Movement -20%^000000",
		"          AGI/DEX: -12% Monster / -6% Player",
		"[Lv 3] : ^77777744 SP / Movement -30%^000000",
		"          AGI/DEX: -18% Monster / -9% Player",
		"[Lv 4] : ^77777746 SP / Movement -40%^000000",
		"          AGI/DEX: -24% Monster / -12% Player",
		"[Lv 5] : ^77777748 SP / Movement -50%^000000",
		"          AGI/DEX: -30% Monster / -15% Player"
	].join("\n");

	SkillDescription[SKID.WL_RECOGNIZEDSPELL] = [
		"Recognized Spell",
		"Max LV 5",
		"^777777Skill Requirement : Release 2 , Stasis 1, White Imprison 1  ^000000",
		"Skill Form : ^777777Buff(Self)^000000",
		"Description : ^777777Maximizes one's own magical potential, dealing Maximum damage with magical attacks for the skill duration.^000000",
		"[Lv 1] : ^777777100 SP / 60 sec. duration^000000",
		"[Lv 2] : ^777777120 SP / 90 sec. duration^000000",
		"[Lv 3] : ^777777140 SP / 110 sec. duration^000000",
		"[Lv 4] : ^777777160 SP / 140 sec. duration^000000",
		"[Lv 5] : ^777777180 SP / 170 sec. duration^000000"
	].join("\n");

	SkillDescription[SKID.WL_SIENNAEXECRATE] = [
		"Sienna Execrate",
		"Max LV 5",
		"^777777Skill Requirement : Summon Stone 1  ^000000",
		"Skill Form : ^777777Curse  ^000000",
		"Description : ^777777All targets in range will be Petrified at a certain chance.^000000",
		"[Lv 1] : ^77777732 SP / 50% Success Rate",
		"         3x3 cells / 6 sec. duration^000000",
		"[Lv 2] : ^77777734 SP / 55% Success Rate",
		"         5x5 cells / 9 sec. duration^000000",
		"[Lv 3] : ^77777736 SP / 60% Success Rate",
		"         5x5 cells / 12 sec. duration^000000",
		"[Lv 4] : ^77777738 SP / 65% Success Rate",
		"         7x7 cells / 15 sec. duration^000000",
		"[Lv 5] : ^77777740 SP / 70% Success Rate",
		"         7x7 cells / 18 sec. duration^000000"
	].join("\n");

	SkillDescription[SKID.WL_RADIUS] = [
		"Radius",
		"Max LV 3",
		"^777777Skill Requirement : Warlock Basic Skill ^000000",
		"Skill Form : ^777777Passive^000000",
		"Description : ^777777Increases the range of",
		"Warlock magic skills and decreases their",
		"fixed casting time. Base level, caster INT and",
		"skill level increase the reduction of cast.^000000",
		"[Lv 1] : ^77777780 SP / Casting Range +1 Cell",
		"         Decrease fixed casting speed by 5%^000000",
		"[Lv 2] : ^777777100 SP / Casting Range +2 Cells",
		"         Decrease fixed casting speed by 10%^000000",
		"[Lv 3] : ^777777120 SP / Casting Range +3 Cells",
		"         Decrease fixed casting speed by 15%^000000"
	].join("\n");

	SkillDescription[SKID.WL_STASIS] = [
		"Stasis",
		"Max LV 5",
		"^777777Skill Requirement : Drain Life 1  ^000000",
		"Skill Form : ^777777Curse^000000",
		"Description : ^777777Stops the air",
		"around the Caster, preventing any spells",
		"from being cast.^000000",
		"[Lv 1] : ^77777750 SP / 10sec. duration / 19x19 AoE^000000",
		"[Lv 2] : ^77777760 SP / 15sec. duration / 21x21 AoE^000000",
		"[Lv 3] : ^77777770 SP / 20sec. duration / 23x23 AoE^000000",
		"[Lv 4] : ^77777780 SP / 25sec. duration / 25x25 AoE^000000",
		"[Lv 5] : ^77777790 SP / 30sec. duration / 27x27 AoE^000000"
	].join("\n");

	SkillDescription[SKID.WL_DRAINLIFE] = [
		"Drain Life",
		"Max LV 5",
		"^777777Skill Requirement : Radius 1  ^000000",
		"Skill Form : ^777777Damage / Recover  ^000000",
		"Description : ^777777Strikes a single target with",
		"magical damage, and absorb some of that",
		"damage as HP. Damage and HP recovered is",
		"influenced by the caster's INT and base level.",
		"The success rate varies according to the",
		"skill level.^000000",
		"[Lv 1] : ^77777720 SP / Absorb 10% of Damage",
		"Absorb Success Rate 75%^000000",
		"[Lv 2] : ^77777724 SP / Absorb 15% of Damage",
		"Absorb Success Rate 80%^000000",
		"[Lv 3] : ^77777728 SP / Absorb 20% of Damage",
		"Absorb Success Rate 85%^000000",
		"[Lv 4] : ^77777732 SP / Absorb 25% of Damage",
		"Absorb Success Rate 90%^000000",
		"[Lv 5] : ^77777736 SP / Absorb 30% of Damage",
		"Absorb Success Rate 95%^000000"
	].join("\n");

	SkillDescription[SKID.WL_CRIMSONROCK] = [
		"Crimson Rock",
		"Max LV 5",
		"^777777Skill Requirement : Summon Fire Ball 1  ^000000",
		"Skill Form : ^777777 Active / Damage  ^000000",
		"Description : ^777777 Summons a meteor, inflicts Fire property Magic Damage to all enemies around the target.",
		"All enemies inflicted by damage will get knocked back.",
		"Damage increases based on caster's BaseLv.^000000",
		"[Level 1] : ^777777 MATK 1300%  ^000000",
		"[Level 2] : ^777777 MATK 1900%  ^000000",
		"[Level 3] : ^777777 MATK 2500%  ^000000",
		"[Level 4] : ^777777 MATK 3100%  ^000000",
		"[Level 5] : ^777777 MATK 3700%  ^000000"
	].join("\n");

	SkillDescription[SKID.WL_HELLINFERNO] = [
		"Hell Inferno",
		"Max LV 5",
		"^777777Skill Requirement : Crimson Rock 2  ^000000",
		"Skill Form : ^777777  Active / Damage  ^000000",
		"Description : ^777777 Inflicts Fire and Shadow property Magic Damage to all enemies around the target.",
		"Damage increases based on caster's BaseLv.^000000",
		"[Level 1] : ^777777 MATK(Fire/Shadow) 400%/1000%/Area 3x3^000000",
		"[Level 2] : ^777777 MATK(Fire/Shadow) 800%/1200%/Area 3x3^000000",
		"[Level 3] : ^777777 MATK(Fire/Shadow) 1200%/1800%/Area 3x3^000000",
		"[Level 4] : ^777777 MATK(Fire/Shadow) 1600%/2400%/Area 5x5^000000",
		"[Level 5] : ^777777 MATK(Fire/Shadow) 2000%/3000%/Area 5x5^000000"
	].join("\n");

	SkillDescription[SKID.WL_COMET] = [
		"Comet",
		"Max LV 5",
		"^777777Skill Requirement : Hell Inferno 3  ^000000",
		"Skill Form : ^777777  Damage / Special  ^000000",
		"Description : ^777777 Inflicts Neutral property Magic Damage to all enemies in a 13x13 area around the targeted location, leaving them magic poisoned that reduces resistance to all property by 50%.",
		"Damage increases based on BaseLv.^000000",
		"[Level 1] : ^777777 MATK 3200% ^000000",
		"[Level 2] : ^777777 MATK 3900% ^000000",
		"[Level 3] : ^777777 MATK 4600% ^000000",
		"[Level 4] : ^777777 MATK 5300% ^000000",
		"[Level 5] : ^777777 MATK 6000% ^000000"
	].join("\n");

	SkillDescription[SKID.WL_CHAINLIGHTNING] = [
		"Chain Lightning",
		"Max LV 5",
		"^777777Skill Requirement : Summon Ball Lightning 1^000000",
		"Skill Form : ^777777Active / Damage  ^000000",
		"Description : ^777777Summons lightning to deal multiple (Wind Element) damage to a target and enemies around it.^000000",
		"[Lv 1] : ^77777780 SP /5 Attacks^000000",
		"[Lv 2] : ^77777790 SP /6 Attacks^000000",
		"[Lv 3] : ^777777100 SP /7 Attacks^000000",
		"[Lv 4] : ^777777110 SP /8 Attacks^000000",
		"[Lv 5] : ^777777120 SP /9 Attacks^000000"
	].join("\n");

	SkillDescription[SKID.WL_EARTHSTRAIN] = [
		"Earth Strain",
		"Max LV 5",
		"^777777Skill Requirement : Sienna Execrate 2  ^000000",
		"Skill Form : ^777777   Active / Damage  ^000000",
		"Description : ^777777   Uplift the land and attack enemies within range.^000000",
		"[Level 1] : ^777777 MATK 1600% ^000000",
		"[Level 2] : ^777777 MATK 2200% ^000000",
		"[Level 3] : ^777777 MATK 2800% ^000000",
		"[Level 4] : ^777777 MATK 3400% ^000000",
		"[Level 5] : ^777777 MATK 4000% ^000000"
	].join("\n");

	SkillDescription[SKID.WL_TETRAVORTEX] = [
		"Tetra Vortex",
		"Max LV 10",
		"^777777Skill Requirement : Jack Frost 5, Chain Lightning 5, Earth Strain 5, Hell Inferno 5  ^000000",
		"Skill Form : ^777777    Damage / Debuff   ^000000",
		"Description : ^777777 Summons 4 property ethers, deals fire, water, earth, wind magic property damage.",
		"Requires at least 4 of Fireball, Lightningball, Waterball, Stoneball summoned.",
		"Damage property depends on the Summoned skill (Fire Ball, Water Ball, Lightning Ball, Stone) used. Requires at least 4 spheres to use.",
		"When skill level is 6 or higher, deals damage to a target and enemies in AOE around it.",
		"Adds a high chance to Blaze, Freeze, Stun, or Bleed when damaging.^000000",
		"[Level 1] : ^777777 MATK 1200%x4 /1 Target^000000",
		"[Level 2] : ^777777 MATK 1600%x4 /1 Target^000000",
		"[Level 3] : ^777777 MATK 2000%x4 /1 Target^000000",
		"[Level 4] : ^777777 MATK 2400%x4 /1 Target^000000",
		"[Level 5] : ^777777 MATK 2800%x4 /1 Target^000000",
		"[Level 6] : ^777777 MATK 3200%x4 /Targets around 3x3^000000",
		"[Level 7] : ^777777 MATK 3600%x4 /Targets around 3x3^000000",
		"[Level 8] : ^777777 MATK 4000%x4 /Targets around 3x3^000000",
		"[Level 9] : ^777777 MATK 4400%x4 /Targets around 3x3^000000",
		"[Level10] : ^777777 MATK 4800%x4 /Targets around 7x7^000000"
	].join("\n");

	SkillDescription[SKID.WL_SUMMONFB] = [
		"Summon Fire Ball",
		"Max LV 2",
		"^777777Skill Requirement : Meteor Storm 1  ^000000",
		"Skill Form : ^777777   Active / Damage  ^000000",
		"Description : ^777777 Summon Maximum 5 Fireballs around the caster. Continuously consumes SP while fireball is active.",
		"When level 2, removes all active Summon Balls, and summons 5 Fireballs.",
		"When released, each fireball inflicts fire property magic damage, and damage increases based on caster's BaseLv.  ^000000",
		"[Level 1] : ^777777  Summons 1 Fireball / Duration: 280 sec ^000000",
		"[Level 2] : ^777777  Summons 5 Fireballs / Duration: 280 sec ^000000"
	].join("\n");

	SkillDescription[SKID.WL_SUMMONBL] = [
		"Summon Lightning Ball",
		"Max LV 2",
		"^777777Skill Requirement : Lord of Vermilion 1  ^000000",
		"Skill Form : ^777777   Active / Damage ^000000",
		"Description : ^777777 Summon Maximum 5 Lightningballs around the caster. Continuously consumes SP while fireball is active.",
		"When level 2, removes all active Summon Balls, and summons 5 Lightningballs.",
		"When released, each lightningball inflicts wind property magic damage, and damage increases based on caster's BaseLv.  ^000000",
		"[Level 1] : ^777777 Summons 1 Lightningball / Duration: 280 sec ^000000",
		"[Level 2] : ^777777 Summons 5 Lightningballs / Duration: 280 sec ^000000"
	].join("\n");

	SkillDescription[SKID.WL_SUMMONWB] = [
		"Summon Water Ball",
		"Max LV 2",
		"^777777Skill Requirement : Storm Gust 1  ^000000",
		"Skill Form : ^777777   Active / Damage  ^000000",
		"Description : ^777777 Summon Maximum 5 Waterballs around the caster. Continuously consumes SP while fireball is active.",
		"When level 2, removes all active Summon Balls, and summons 5 Waterballs.",
		"When released, each waterball inflicts water property magic damage, and damage increases based on caster's BaseLv.  ^000000",
		"[Level 1] : ^777777 Summons 1 Waterball / Duration: 280 sec ^000000",
		"[Level 2] : ^777777 Summons 5 Waterballs / Duration: 280 sec ^000000"
	].join("\n");

	SkillDescription[SKID.WL_SUMMONSTONE] = [
		"Summon Stone",
		"Max LV 2",
		"^777777Skill Requirement : Heaven's Drive 1  ^000000",
		"Skill Form : ^777777   Active / Damage  ^000000",
		"Description : ^777777 Summon Maximum 5 Stoneballs around the caster. Continuously consumes SP while fireball is active.",
		"When level 2, removes all active Summon Balls, and summons 5 Stoneballs.",
		"When released, each stoneball inflicts earth property magic damage, and damage increases based on caster's BaseLv.  ^000000",
		"[Level 1] : ^777777 Summons 1 Stoneball / Duration: 280 sec ^000000",
		"[Level 2] : ^777777 Summons 5 Stoneballs / Duration: 280 sec ^000000"
	].join("\n");

	SkillDescription[SKID.WL_RELEASE] = [
		"Release",
		"Max LV 2",
		"^777777Skill Requirement : Warlock Base Skill   ^000000",
		"Skill Form : ^777777   Active / Special  ^000000",
		"Description : ^777777 Release spells memorized with Reading Spell Book. Releases summoned orbs from Summon skill (Fire Ball, Water Ball, Lightning Ball, Stone) and inflicts Magic Damage to a single target one or multiple times. ^000000",
		"[Level 1] : ^777777 Release memorized spell.^000000",
		"[Level 2] : ^777777 Release all Summoned balls at the target.^000000"
	].join("\n");

	SkillDescription[SKID.WL_READING_SB] = [
		"Reading Spellbook",
		"Max LV 1",
		"^777777Skill Requirement : Warlock Base Skill   ^000000",
		"Skill Form : ^777777   Passive / Special  ^000000",
		"Description : ^777777 Reads a spell inscribed in the selected Spell Book and seals it up. This skill can be used in conjunction with the Release skill in order to let out the sealed spells. ^000000"
	].join("\n");

	SkillDescription[SKID.WL_FREEZE_SP] = [
		"Freezing Spell",
		"Max LV 10",
		"^777777Skill Requirement : Warlock Base Skill   ^000000",
		"Skill Form : ^777777   Passive  ^000000",
		"Description : ^777777 Raises the amount of Mind Slots available for Reading Spell Book. Number of spells increases based on level and INT. When spells are sealed up, slowly drains SP depending on the number of spells..^000000"
	].join("\n");

	SkillDescription[SKID.RA_ARROWSTORM] = [
		"Arrow Storm",
		"Max Lv : 10 ",
		"^777777Skill Requirement : Aimed Bolt 5 ^000000",
		"Skill Form : ^777777Active / Damage ^000000",
		"Description : ^777777 Shoots a storm of arrows at a single target for ranged physical damage to all enemies around the target.",
		"Consumes 5 arrows, damage increases based on BaseLv.",
		"Inflicts more damage while in Fear Breeze.^000000",
		"[Level 1] : ^777777 ATK 380%/450%(Fear Breeze)",
		"Area of Effect : Target and Aoe 5x5Cell^000000",
		"[Level 2] : ^777777 ATK 560%/700%(Fear Breeze)",
		"Area of Effect : Target and Aoe 5x5Cell^000000",
		"[Level 3] : ^777777 ATK 740%/950%(Fear Breeze)",
		"Area of Effect : Target and Aoe 5x5Cell^000000",
		"[Level 4] : ^777777 ATK 920%/1200%(Fear Breeze)",
		"Area of Effect : Target and Aoe 5x5Cell^000000",
		"[Level 5] : ^777777 ATK 1100%/1450%(Fear Breeze)",
		"Area of Effect : Target and Aoe 5x5Cell^000000",
		"[Level 6] : ^777777 ATK 1280%/1700%(Fear Breeze)",
		"Area of Effect : Target and Aoe 7x7Cell^000000",
		"[Level 7] : ^777777 ATK 1460%/1950%(Fear Breeze)",
		"Area of Effect : Target and Aoe 7x7Cell^000000",
		"[Level 8] : ^777777 ATK 1640%/2200%(Fear Breeze)",
		"Area of Effect : Target and Aoe 7x7Cell^000000",
		"[Level 9] : ^777777 ATK 1820%/2450%(Fear Breeze)",
		"Area of Effect : Target and Aoe 7x7Cell^000000",
		"[Level10] : ^777777 ATK 2000%/2700%(Fear Breeze)",
		"Area of Effect : Target and Aoe 9x9Cell^000000"
	].join("\n");

	SkillDescription[SKID.RA_FEARBREEZE] = [
		"Fear Breeze",
		"Max Lv : 5",
		"^777777Skill Requirement : Camouflage 1, Arrow Storm 5 ^000000",
		"Skill Form : ^777777Active toggle / Buff (To yourself) ^000000",
		"Description : ^777777 During duration, Hit Count increases when Normal attack using a bow. Consumes extra bows as hit counts.^000000",
		"[Level 1] : ^777777 Hit Count+1/Chance 12%/60 sec 지속^000000",
		"[Level 2] : ^777777 Hit Count+1/Chance 12%/90 sec 지속^000000",
		"[Level 3] : ^777777 Hit Count+1~2/Chance 21%/120 sec 지속^000000",
		"[Level 4] : ^777777 Hit Count+1~3/Chance 27%/150 sec 지속^000000",
		"[Level 5] : ^777777 Hit Count+1~4/Chance 30%/180 sec 지속^000000"
	].join("\n");

	SkillDescription[SKID.RA_RANGERMAIN] = [
		"Main Ranger",
		"Max Lv : 10 ",
		"^777777Skill Requirement : Ranger Basic Skill ^000000",
		"Skill Form : ^777777Passive ^000000",
		"Description : ^777777Increase Atk to Animal, Plant and Fish type monsters and decrease damage from those monsters.^000000",
		"[Lv 1] : ^777777Atk / Resistance + 5^000000",
		"[Lv 2] : ^777777Atk / Resistance + 10^000000",
		"[Lv 3] : ^777777Atk / Resistance + 15^000000",
		"[Lv 4] : ^777777Atk / Resistance + 20^000000",
		"[Lv 5] : ^777777Atk / Resistance + 25^000000",
		"[Lv 6] : ^777777Atk / Resistance + 30^000000",
		"[Lv 7] : ^777777Atk / Resistance + 35^000000",
		"[Lv 8] : ^777777Atk / Resistance + 40^000000",
		"[Lv 9] : ^777777Atk / Resistance + 45^000000",
		"[Lv 10] : ^777777Atk / Resistance + 50^000000"
	].join("\n");

	SkillDescription[SKID.RA_AIMEDBOLT] = [
		"Aimed Bolt",
		"Max Lv : 10 ",
		"^777777Skill Requirement : Ankle Snare 5 ^000000",
		"Skill Form : ^777777 Active / Damage ^000000",
		"Description : ^777777 Shoots a focused arrow, and deals huge ranged physical damage to a target.",
		"Consumes 3 arrows, deals damage 5 times.",
		"Damage increases based on BaseLv.",
		"While in Fear Breeze effect, deals more damage.^000000",
		"[Level 1] : ^777777 ATK 520%/835%(Fear Breeze)^000000",
		"[Level 2] : ^777777 ATK 540%/870%(Fear Breeze)^000000",
		"[Level 3] : ^777777 ATK 560%/905%(Fear Breeze)^000000",
		"[Level 4] : ^777777 ATK 580%/940%(Fear Breeze)^000000",
		"[Level 5] : ^777777 ATK 600%/975%(Fear Breeze)^000000",
		"[Level 6] : ^777777 ATK 620%/1010%(Fear Breeze)^000000",
		"[Level 7] : ^777777 ATK 640%/1045%(Fear Breeze)^000000",
		"[Level 8] : ^777777 ATK 660%/1080%(Fear Breeze)^000000",
		"[Level 9] : ^777777 ATK 680%/1115%(Fear Breeze)^000000",
		"[Level10] : ^777777 ATK 700%/1150%(Fear Breeze)^000000"
	].join("\n");

	SkillDescription[SKID.RA_DETONATOR] = [
		"Detonator",
		"Max Lv : 1 ",
		"^777777Skill Requirement : Bomb Cluster 3 ^000000",
		"Skill Form : ^777777Active / Special ^000000",
		"Description : ^777777Immediately activates traps on the ground. Skills range is 7x7 cells around the targeted area. It can also activate Hunter's traps. This skill will not detonate traps of another player.",
		"Can activate the following traps: Cluster Bomb, Blast Mine, Claymore Trap, Sandman, Talkie Box, Fire Trap, and Ice Trap.^000000"
	].join("\n");

	SkillDescription[SKID.RA_ELECTRICSHOCKER] = [
		"Electric Shock",
		"Max Lv : 5",
		"^777777Skill Requirement : Shockwave Trap 5^000000",
		"Skill Form : ^777777Active / Trap ^000000",
		"Description : ^777777Immobilizes a target and drains a certain amount of SP per second from the target. Electric Shocker cannot be removed with the Hunter skill Remove Trap. Requires 1 Special Alloy Trap. Maximum 3 traps are allowed to be set. ^000000",
		"[Lv 1] : ^777777Consuming SP by a sec. 5% / Duration 20 sec.^000000",
		"[Lv 2] : ^777777Consuming SP by a sec. 10% / Duration 22 sec.^000000",
		"[Lv 3] : ^777777Consuming SP by a sec. 15% / Duration 24 sec.^000000",
		"[Lv 4] : ^777777Consuming SP by a sec. 20% / Duration 26 sec.^000000",
		"[Lv 5] : ^777777Consuming SP by a sec. 25% / Duration 28 sec.^000000"
	].join("\n");

	SkillDescription[SKID.RA_CLUSTERBOMB] = [
		"Bomb Cluster",
		"Max Lv : 5",
		"^777777Skill Requirement : Trap Research 3 ^000000",
		"Skill Form : ^777777Active / Trap ^000000",
		"Description : ^777777Maximum 3 traps are allowed to be set at once and damage range is 3 cells wide and 5 cells deep. Can be combined with Detonator Skill. Bomb Cluster cannot be removed by [Remove Trap] from Hunter. Requires 1 Special Alloy Trap.^000000",
		"[Lv 1] : ^777777Damage 300% + Additional Trap Damage / Duration 15 sec.^000000",
		"[Lv 2] : ^777777Damage 400% + Additional Trap Damage / Duration 15 sec.^000000",
		"[Lv 3] : ^777777Damage 500% + Additional Trap Damage / Duration 15 sec.^000000",
		"[Lv 4] : ^777777Damage 600% + Additional Trap Damage / Duration 15 sec.^000000",
		"[Lv 5] : ^777777Damage 700% + Additional Trap Damage / Duration 15 sec.^000000"
	].join("\n");

	SkillDescription[SKID.RA_WUGMASTERY] = [
		"Warg Mastery",
		"Max Lv : 1 ",
		"^777777Skill Requirement : Ranger Basic Skill ^000000",
		"Skill Form : ^777777Active / Special ^000000",
		"Description : ^777777Summon a Warg with a Wolf Flute. Re-using the skill returns the Warg to the wild.^000000"
	].join("\n");

	SkillDescription[SKID.RA_WUGRIDER] = [
		"Warg Ride",
		"Max Lv : 3 ",
		"^777777Skill Requirement : Warg Mastery 1 ^000000",
		"Skill Form : ^777777Active / Special ^000000",
		"Description : ^777777Allows a Ranger to mount their summoned Warg. Skill level increases movement speed. While mounted on a Warg, you can't use any bow attacks or skills that are not Warg exclusive other than trap skills.",
		"Can use the following traps while on a warg: Cobalt Trap, Magenta Trap, Verdure Trap, Maze Trap, Electric Shocker.^000000"
	].join("\n");

	SkillDescription[SKID.RA_WUGDASH] = [
		"Warg Dash",
		"Max Lv : 1 ",
		"^777777Skill Requirement : Warg Rider 1 ^000000",
		"Skill Form : ^777777Active / Special ^000000",
		"Description : ^777777Usable only when mounted on your Warg. Makes your Warg scamper in a straight direction, and re-using the skill stops. You will automatically stop when hitting a wall or an enemy. If the Ranger has already learned Warg Strike, it gives damage to the crashed enemy.^000000"
	].join("\n");

	SkillDescription[SKID.RA_WUGSTRIKE] = [
		"Warg Strike",
		"Max Lv : 5",
		"^777777Skill Requirement : Warg Teeth 1 ^000000",
		"Skill Form : ^777777Active / Damage ^000000",
		"Description : ^777777Make your Warg run into 1 target and give damage. Damage increases as skill level gets higher.^000000",
		"[Lv 1] : ^777777Damage 200%^000000",
		"[Lv 2] : ^777777Damage 400%^000000",
		"[Lv 3] : ^777777Damage 600%^000000",
		"[Lv 4] : ^777777Damage 800%^000000",
		"[Lv 5] : ^777777Damage 1000%^000000"
	].join("\n");

	SkillDescription[SKID.RA_WUGBITE] = [
		"Warg Bite",
		"Max Lv : 5",
		"^777777Skill Requirement : Warg Strike 1 ^000000",
		"Skill Form : ^777777Active / Damage ^000000",
		"Description : ^777777Make your Warg leap at a target, dealing damage and temporarily causing immobile status. Damage increases if Warg Teeth level is increased. Can't be used while mounted on a Warg.^000000",
		"[Lv 1] : ^777777Damage 600% / 1 sec duration^000000",
		"[Lv 2] : ^777777Damage 800% / 2 sec duration^000000",
		"[Lv 3] : ^777777Damage 1000% / 3 sec duration^000000",
		"[Lv 4] : ^777777Damage 1200% / 4 sec duration^000000",
		"[Lv 5] : ^777777Damage 1500% / 5 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.RA_TOOTHOFWUG] = [
		"Warg Teeth",
		"Max Lv : 10 ",
		"^777777Skill Requirement : Warg Mastery 1 ^000000",
		"Skill Form : ^777777Passive ^000000",
		"Description : ^777777Increases the damage done by Warg-skills. Increase damage as skill level gets higher. ^000000",
		"[Lv 1] : ^777777Atk +30^000000",
		"[Lv 2] : ^777777Atk +60^000000",
		"[Lv 3] : ^777777Atk +90^000000",
		"[Lv 4] : ^777777Atk +120^000000",
		"[Lv 5] : ^777777Atk +150^000000",
		"[Lv 6] : ^777777Atk +180^000000",
		"[Lv 7] : ^777777Atk +210^000000",
		"[Lv 8] : ^777777Atk +240^000000",
		"[Lv 9] : ^777777Atk +270^000000",
		"[Lv 10] : ^777777Atk +300^000000"
	].join("\n");

	SkillDescription[SKID.RA_SENSITIVEKEEN] = [
		"Keen Nose",
		"Max Lv : 5",
		"^777777Skill Requirement : Warg Teeth 3 ^000000",
		"Skill Form : ^777777Active / Detect  ^000000",
		"Description : ^777777Use the Warg's senses to reveal hidden traps and enemies. Has a chance to attack enemies with Warg Bite.^000000",
		"[Lv 1] : ^777777Range 3 x 3 / Damage 150% / Chance to auto-cast Warg Bite 8% ^000000",
		"[Lv 2] : ^777777Range 4 x 4 / Damage 200% / Chance to auto-cast Warg Bite 16%^000000",
		"[Lv 3] : ^777777Range 5 x 5 / Damage 250% / Chance to auto-cast Warg Bite 24% ^000000",
		"[Lv 4] : ^777777Range 6 x 6 / Damage 300% / Chance to auto-cast Warg Bite 32% ^000000",
		"[Lv 5] : ^777777Range 7 x 7 / Damage 350% / Chance to auto-cast Warg Bite 40% ^000000"
	].join("\n");

	SkillDescription[SKID.RA_CAMOUFLAGE] = [
		"Camouflage",
		"Max Lv : 5",
		"^777777Skill Requirement : Main Ranger 1 ^000000",
		"Skill Form : ^777777Active / Buff (To yourself)  ^000000",
		"Description : ^777777Hide yourself behind walls or any",
		"obstacles for 10 seconds so other monsters",
		"can't notice the you (Except Boss/Demon/Insect",
		"monsters). You appear translucent while",
		"Camouflaged. Increases Critical rate and ATK,",
		"but decrease DEF while casting the skill.",
		"The skill is cancelled when you attack or",
		"if the 10 duration ends. Can be re-cast",
		"to refresh the duration of the effect.",
		"It can be used without any obstacles if the",
		"skill level gets higher. ^000000",
		"[Lv 1] : ^777777SP consumption per sec. 6 / move disabled^000000",
		"[Lv 2] : ^777777SP consumption per sec. 5 / move disabled^000000",
		"[Lv 3] : ^777777SP consumption per sec. 4 / 50% movement^000000",
		"[Lv 4] : ^777777SP consumption per sec. 3 / 75% movement^000000",
		"[Lv 5] : ^777777SP consumption per sec. 2 / 100% movement^000000"
	].join("\n");

	SkillDescription[SKID.RA_RESEARCHTRAP] = [
		"Trap Research (RESEARCH TRAP / Trap Research)",
		"Max Lv : 10",
		"^777777Skill Requirement : Claymore Trap 1, Remove Trap 1 ^000000",
		"Skill Form : ^777777  Passive  ^000000",
		"Description : ^777777Increase trap damage and trap set range of Hunters and Rangers, also increases INT and MaxSP^000000",
		"[Level 1] : ^777777 Additional Damage +40 / INT +1 / MaxSP +220  / Skill Range +1 ^000000",
		"[Level 2] : ^777777 Additional Damage +80 / INT +2 / MaxSP +240  / Skill Range +1 ^000000",
		"[Level 3] : ^777777 Additional Damage +120 / INT +3 / MaxSP +260  / Skill Range +2 ^000000",
		"[Level 4] : ^777777 Additional Damage +160 / INT +4 / MaxSP +280  / Skill Range +2 ^000000",
		"[Level 5] : ^777777 Additional Damage +200 / INT +5 / MaxSP +300  / Skill Range +3 ^000000",
		"[Level 6] : ^777777 Additional Damage +240 / INT +6 / MaxSP +320  / Skill Range +3 ^000000",
		"[Level 7] : ^777777 Additional Damage +280 / INT +7 / MaxSP +340  / Skill Range +4 ^000000",
		"[Level 8] : ^777777 Additional Damage +320 / INT +8 / MaxSP +360  / Skill Range +4 ^000000",
		"[Level 9] : ^777777 Additional Damage +360 / INT +9 / MaxSP +380  / Skill Range +5 ^000000",
		"[Level10] : ^777777 Additional Damage +400 / INT +10 / MaxSP +400  / Skill Range +5 ^000000"
	].join("\n");

	SkillDescription[SKID.RA_MAGENTATRAP] = [
		"Magenta Trap",
		"Max Lv : 1",
		"^777777Skill Requirement :  Trap Research 1 ^000000",
		"Skill Form : ^777777Active / Trap   ^000000",
		"Description : ^777777Monsters that step on this trap has its attribute changed to Fire property. Does not affect boss type monsters or players and consumes 1 Scarlett Point and 1 Special Alloy Trap.^000000"
	].join("\n");

	SkillDescription[SKID.RA_COBALTTRAP] = [
		"Cobalt Trap",
		"Max Lv : 1",
		"^777777Skill Requirement :  Trap Research 1 ^000000",
		"Skill Form : ^777777Active / Trap   ^000000",
		"Description : ^777777Monsters that step on this trap has its attribute changed to Water property. Does not affect boss type monsters or players and consumes 1 Indigo Point and 1 Special Alloy Trap.^000000"
	].join("\n");

	SkillDescription[SKID.RA_MAIZETRAP] = [
		"Maze Trap",
		"Max Lv : 1",
		"^777777Skill Requirement :  Trap Research 1 ^000000",
		"Skill Form : ^777777Active / Trap   ^000000",
		"Description : ^777777Monsters that step on this trap has its attribute changed to Earth property. Does not affect boss type monsters or players and consumes 1 Lime Green Point and 1 Special Alloy Trap.^000000"
	].join("\n");

	SkillDescription[SKID.RA_VERDURETRAP] = [
		"Verdure Trap",
		"Max Lv : 1",
		"^777777Skill Requirement :  Trap Research 1 ^000000",
		"Skill Form : ^777777Active / Trap   ^000000",
		"Description : ^777777Monsters that step on this trap has its attribute changed to Wind property. Does not affect boss type monsters or players and consumes 1 Yellow Wish Point and 1 Special Alloy Trap.^000000"
	].join("\n");

	SkillDescription[SKID.RA_FIRINGTRAP] = [
		"Fire Trap",
		"Max Lv : 5",
		"^777777Skill Requirement :  Detonator 1 ^000000",
		"Skill Form : ^777777Active / Trap  ^000000",
		"Description : ^777777When this trap activates, it deals damage in a 5x5 area and causes Burning status. Level increases success rate of inflicting Burning status. Consumes 1 Special Alloy Trap.^000000",
		"[Lv 1] : ^777777Success Rate 60%^000000",
		"[Lv 2] : ^777777Success Rate 70%^000000",
		"[Lv 3] : ^777777Success Rate 80%^000000",
		"[Lv 4] : ^777777Success Rate 90%^000000",
		"[Lv 5] : ^777777Success Rate 100%^000000"
	].join("\n");

	SkillDescription[SKID.RA_ICEBOUNDTRAP] = [
		"Ice Trap",
		"Max Lv : 5",
		"^777777Skill Requirement :  Detonator 1 ^000000",
		"Skill Form : ^777777Active / Trap  ^000000",
		"Description : ^777777When this trap activates, it deals damage in a 3x3 area and inflicts [Burning Freeze] status. Consumes 1 Special Alloy Trap.^000000",
		"[Lv 1] : ^777777Success Rate 60%^000000",
		"[Lv 2] : ^777777Success Rate 70%^000000",
		"[Lv 3] : ^777777Success Rate 80%^000000",
		"[Lv 4] : ^777777Success Rate 90%^000000",
		"[Lv 5] : ^777777Success Rate 100%^000000"
	].join("\n");

	SkillDescription[SKID.NC_MADOLICENCE] = [
		"Madogear License",
		"Max Lv : 5",
		"^777777Skill Requirement : Mechanic Basic  ^000000",
		"Skill Form : ^777777Passive ^000000",
		"Description : ^777777Allows the Mechanic to use Mado Gear. Higher Level Increases ATK and decreases the movement penalty in Mado Gear.^000000",
		"[Lv 1] : ^777777Atk +15  / Movement Speed -40%^000000",
		"[Lv 2] : ^777777Atk +30  / Movement Speed -30%^000000",
		"[Lv 3] : ^777777Atk +45  / Movement Speed -20%^000000",
		"[Lv 4] : ^777777Atk +60  / Movement Speed -10%^000000",
		"[Lv 5] : ^777777Atk +75  / No Movement Speed penalty^000000"
	].join("\n");

	SkillDescription[SKID.NC_BOOSTKNUCKLE] = [
		"Knuckle Boost",
		"Max Lv : 5",
		"^777777Skill Requirement : Madogear License 1 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Inflicts Ranged Physical Damage to a single target.",
		"Damage increases based on BaseLv and DEX.",
		"Range: 11 Cell.^000000",
		"[Level 1] : ^777777 ATK 300%^000000",
		"[Level 2] : ^777777 ATK 500%^000000",
		"[Level 3] : ^777777 ATK 700%^000000",
		"[Level 4] : ^777777 ATK 900%^000000",
		"[Level 5] : ^777777 ATK 1100%^000000"
	].join("\n");

	SkillDescription[SKID.NC_PILEBUNKER] = [
		"Pile Bunker",
		"Max Lv : 3",
		"^777777Skill Requirement :  Knuckle Boost 2 ^000000",
		"Skill Form : ^777777Active / Damage(Special) ^000000",
		"Description : ^777777Pull out deadly drills from the Madogear to inflict damage and nullify Defensive magic skills cast on the target. Nullifies [Kyrie Eleison, Assumptio, Mental Strength, Gentle Touch-Change, Gentle Touch-Revitalize, Auto Guard, Reflect Shield, Defending Aura, Reflect Damage, Prestige, and Banding]. Requires a Pile Bunker to cast.^000000",
		"[Lv 1] : ^7777773 Cell Range / Chance to cancel Defense magic skill 40%^000000",
		"[Lv 2] : ^7777774 Cell Range / Chance to cancel Defense magic skill 55%^000000",
		"[Lv 3] : ^7777775 Cell Range / Chance to cancel Defense magic skill 70%^000000"
	].join("\n");

	SkillDescription[SKID.NC_VULCANARM] = [
		"Vulcan Arm",
		"Max Lv : 3",
		"^777777Skill Requirement : Knuckle Boost 2 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Shoots a target, dealing ranged physical damage to the surrounding targets.",
		"Consumes one Vulcan Bullet. Damage increases based on BaseLv and DEX.",
		"Range: 13 Cell.^000000",
		"[Level 1] : ^777777 ATK 140% / Area of Effect 5 x 5^000000",
		"[Level 2] : ^777777 ATK 280% / Area of Effect 5 x 5^000000",
		"[Level 3] : ^777777 ATK 420% / Area of Effect 5 x 5^000000"
	].join("\n");

	SkillDescription[SKID.NC_FLAMELAUNCHER] = [
		"Flame Launcher",
		"Max Lv : 3",
		"^777777Skill Requirement :  Vulcan Arm 1 ^000000",
		"Skill Form : ^777777Active / Damage ^000000",
		"Description : ^777777Set flames on the ground with a Flame Thrower to damage and inflict [Ignition] status to all targets that are inside of the range. Must have a Flame Thrower equipped. Consumes 1 Magic Gear Fuel and 20 SP.^000000",
		"[Lv 1] : ^777777Fire Property Damage 600% / Chance to curse [Ignition] status 30%^000000",
		"[Lv 2] : ^777777Fire Property Damage 900% / Chance to curse [Ignition] status 40%^000000",
		"[Lv 3] : ^777777Fire Property Damage 1200% / Chance to curse [Ignition] status 50%^000000"
	].join("\n");

	SkillDescription[SKID.NC_COLDSLOWER] = [
		"Ice Launcher",
		"Max Lv : 3",
		"^777777Skill Requirement :  Vulcan Arm 3 ^000000",
		"Skill Form : ^777777Active / Damage ^000000",
		"Description : ^777777Use a quick freezer to give damage inflict [Freezing] / [Freeze] status to all targets that are inside of the range. Consumes 1 Liquid Condensed Bullet and 1 Magic Gear Fuel.^000000",
		"[Lv 1] : ^777777Water property Atk 600 % / 5x5 AoE^000000",
		"[Lv 2] : ^777777Water property Atk 900 % / 7x7 AoE^000000",
		"[Lv 3] : ^777777Water property Atk 1200 % / 9x9 AoE^000000"
	].join("\n");

	SkillDescription[SKID.NC_ARMSCANNON] = [
		"Arm Cannon",
		"Max Lv : 5",
		"^777777Skill Requirement : Flame Launcher 2 / Ice Launcher 2  ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Inflicts Ranged Physical Damage to all enemies in a set area around the targeted location.",
		"Damage increases based on BaseLv.",
		"Each cast consumes 1 Magic Gear Fuel and 1 Cannon Ball, the property of which depends the property of this skill.",
		"Range: 9 Cell.^000000",
		"[Level 1] : ^777777 ATK 700% / Area of Effect 3 x 3^000000",
		"[Level 2] : ^777777 ATK 1000% / Area of Effect 3 x 3^000000",
		"[Level 3] : ^777777 ATK 1300% / Area of Effect 3 x 3^000000",
		"[Level 4] : ^777777 ATK 1600% / Area of Effect 5 x 5^000000",
		"[Level 5] : ^777777 ATK 1900% / Area of Effect 5 x 5^000000"
	].join("\n");

	SkillDescription[SKID.NC_ACCELERATION] = [
		"Acceleration",
		"Max Lv : 3",
		"^777777Skill Requirement :  Madogear License 1 ^000000",
		"Skill Form : ^777777Active / Buff ^000000",
		"Description : ^777777Increase Madogear's movement speed. An Accelerator must be equipped to cast and consumes 1 Magic Gear Fuel.^000000",
		"[Lv 1] : ^777777Skill Duration 60 sec. ^000000",
		"[Lv 2] : ^777777Skill Duration 90 sec. ^000000",
		"[Lv 3] : ^777777Skill Duration 120 sec. ^000000"
	].join("\n");

	SkillDescription[SKID.NC_HOVERING] = [
		"Hover",
		"Max Lv : 1",
		"^777777Skill Requirement :  Acceleration 1 ^000000",
		"Skill Form : ^777777Active / Buff ^000000",
		"Description : ^777777Make Madogear hover over the ground to escape traps and any other magic attacks. A Hovering Booster must be equiped to cast and consumes 1 Magic Gear Fuel.^000000",
		"[Lv 1] : ^777777Skill Duration 90 sec. ^000000"
	].join("\n");

	SkillDescription[SKID.NC_F_SIDESLIDE] = [
		"Front Slide",
		"Max Lv : 1",
		"^777777Skill Requirement :  Hover 1 ^000000",
		"Skill Form : ^777777Active / Movement ^000000",
		"Description : ^777777Madogear rushes forward 7 cells and consumes 1 Magic Gear Fuel.^000000"
	].join("\n");

	SkillDescription[SKID.NC_B_SIDESLIDE] = [
		"Back Slide",
		"Max Lv : 1",
		"^777777Skill Requirement :  Hover 1 ^000000",
		"Skill Form : ^777777Active / Movement ^000000",
		"Description : ^777777Madogear moves backward 7 cells and consumes 1 Magic Gear Fuel.^000000"
	].join("\n");

	SkillDescription[SKID.NC_MAINFRAME] = [
		"Remodel Mainframe",
		"Max Lv : 4",
		"^777777Skill Requirement : Madogear License 4 ^000000",
		"Skill Form : ^777777Passive^000000",
		"Description : ^777777Remodel Magic Gear's main frame",
		"to increase defense and overheat limit.",
		"If Magic Gear receives damage, it will",
		"continue to receive damage.^000000",
		"[Lv 1] : ^777777Defense +40 / Overheat Limit 200 ^000000",
		"[Lv 2] : ^777777Defense +60 / Overheat Limit 280 ^000000",
		"[Lv 3] : ^777777Defense +80 / Overheat Limit 360 ^000000",
		"[Lv 4] : ^777777Defense +100 / Overheat Limit 450 ^000000"
	].join("\n");

	SkillDescription[SKID.NC_SELFDESTRUCTION] = [
		"Suicidal Destruction",
		"Max Lv : 3",
		"^777777Skill Requirement : Remodel Mainframe 2 ^000000",
		"Skill Form : ^777777Active / Damage  ^000000",
		"Description : ^777777Make Magic Gear self-destruct",
		"causing huge damage in an area around it.",
		"Caster will lose Magic Gear and all SP will",
		"be drained. [Suicide Device] is required to",
		"use this skill. Consumes 3 Magic Gear Fuel.^000000",
		"[Lv 1] : ^777777Range 5x5 cells ^000000",
		"[Lv 2] : ^777777Range 7x7 cells ^000000",
		"[Lv 3] : ^777777Range 9x9 cells ^000000"
	].join("\n");

	SkillDescription[SKID.NC_SHAPESHIFT] = [
		"Elemental Shift",
		"Max Lv : 4",
		"^777777Skill Requirement :  Remodel Mainframe 2  ^000000",
		"Skill Form : ^777777Active / Buff ^000000",
		"Description : ^777777Change Madogear's property. Must have a  <Shape Shifter> equipped and consumes 2 Magic Gear Fuel and 1 Enchanted Stone.^000000",
		"[Lv 1] : ^777777Change to fire property / Consume 3 Scarlet Points^000000",
		"[Lv 2] : ^777777Change to earth property / Consume 3 Lime Green Points^000000",
		"[Lv 3] : ^777777Change to wind property / Consume 3 Yellow Wish Points^000000",
		"[Lv 4] : ^777777Change to water property / Consume 3 Indigo Points^000000"
	].join("\n");

	SkillDescription[SKID.NC_EMERGENCYCOOL] = [
		"Cooldown",
		"Max Lv : 1",
		"^777777Skill Requirement :  Suicidal Destruction 2  ^000000",
		"Skill Form : ^777777Active / Buff ^000000",
		"Description : ^777777Cools down Madogear, resetting",
		"the overheat counter and prevents overheating",
		"from occuring.",
		"Must have the [Cooling Device] accessory",
		"and consumes 2 Magic Gear Fuel.^000000"
	].join("\n");

	SkillDescription[SKID.NC_INFRAREDSCAN] = [
		"Infrared Scan",
		"Max Lv : 1",
		"^777777Skill Requirement :  Elemental Shift  2  ^000000",
		"Skill Form : ^777777Active / Detect / Debuff ^000000",
		"Description : ^777777Scan 15 x 15 cells around caster with a infrared scanner and find hidden enemies. Decreases all enemies' flee rate by 30% if they are inside of the skill range. (Chance of success is 100%.)^000000",
		"[Lv 1] : ^77777745 SP^000000"
	].join("\n");

	SkillDescription[SKID.NC_ANALYZE] = [
		"Analyze",
		"Max Lv : 3",
		"^777777Skill Requirement :  Infrared Scan 1 ^000000",
		"Skill Form : ^777777Active / Debuff ^000000",
		"Description : ^777777Analyze a target's status and decreases physical/magic defensive strength of the target. Skill range is 9 cells. Duration is 20 seconds and consumes 1 Magic Gear Fuel.^000000",
		"[Lv 1] : ^777777physical / magic defense 14% decrease ^000000",
		"[Lv 2] : ^777777physical / magic defense 28% decrease ^000000",
		"[Lv 3] : ^777777physical / magic defense 42% decrease ^000000"
	].join("\n");

	SkillDescription[SKID.NC_MAGNETICFIELD] = [
		"Magnetic Field",
		"Max Lv : 3",
		"^777777Skill Requirement :  Cooldown 1 ^000000",
		"Skill Form : ^777777Active / Debuff ^000000",
		"Description : ^777777Immobilize all enemies that are inside of skill range with electro-magnetic waves. If caster or targets are in hovering state, they don't get skill effect. Also the magnetic field from the skill decreases target's SP continuously. Requires a <Magnetic Field Generator> and consumes 3 Magic Gear Fuel.^000000",
		"[Lv 1] : ^777777Prevents movement for 4 secs. / 50 SP reduction per sec.^000000",
		"[Lv 2] : ^777777Prevents movement for 6 secs. / 50 SP reduction per sec.^000000",
		"[Lv 3] : ^777777Prevents movement for 8 secs. / 50 SP reduction per sec.^000000"
	].join("\n");

	SkillDescription[SKID.NC_NEUTRALBARRIER] = [
		"Neutral Barrier",
		"Max Lv : 3",
		"^777777Skill Requirement :  Magnetic Field 2 ^000000",
		"Skill Form : ^777777Active / Buff ^000000",
		"Description : ^777777Creates an energy field around the Caster, increasing DEF and MDEF of all targets in range and preventing all Long-range attacks from damaging the targets. Requires a <Barrier Builder> and consumes 1 Magic Gear Fuel.^000000",
		"[Lv 1] : ^777777Physical and Magic defense +15% / Duration 30 sec. ^000000",
		"[Lv 2] : ^777777Physical and Magic defense +20% / Duration 45 sec. ^000000",
		"[Lv 3] : ^777777Physical and Magic defense +25% / Duration 60 sec. ^000000"
	].join("\n");

	SkillDescription[SKID.NC_STEALTHFIELD] = [
		"Stealth Field",
		"Max Lv : 3",
		"^777777Skill Requirement :  Analyze 3 / Neutral Barrier 2 ^000000",
		"Skill Form : ^777777Active / Buff ^000000",
		"Description : ^777777Creates a 5x5 cell stealth barrier around the Caster, cloaking all targets within range. All targets cloaked by Stealth Field will be semi-visible, and they cannot be targeted by skills. Continually consumes caster's SP while the skill is active and decreases 20% of caster's movement speed. It can be canceled if Stealth Field is cast twice. Requires a <Camouflage Generator>and consume 2 Magic Gear Fuel.^000000",
		"[Lv 1] : ^77777780 SP / Duration 15 sec. / 1% SP/3 sec.^000000",
		"[Lv 2] : ^777777100 SP / Duration 20 sec. / 1% SP/4 sec.^000000",
		"[Lv 3] : ^777777120 SP / Duration 25 sec. / 1% SP/5 sec.^000000"
	].join("\n");

	SkillDescription[SKID.NC_REPAIR] = [
		"Repair",
		"Max Lv : 5",
		"^777777Skill Requirement :  Madogear License 2 ^000000",
		"Skill Form : ^777777Active / Recovery ^000000",
		"Description : ^777777Enable to repair (recover) Madogear or other Madogears. Requires a <Repair Kit> and consumes 1 Magic Gear Fuel.^000000",
		"[Lv 1] : ^777777Cast Range 5 Cell / MaxHP 4% recovery ^000000",
		"[Lv 2] : ^777777Cast Range 6 Cell / MaxHP 7% recovery ^000000",
		"[Lv 3] : ^777777Cast Range 7 Cell / MaxHP 13% recovery ^000000",
		"[Lv 4] : ^777777Cast Range 8 Cell / MaxHP 17% recovery ^000000",
		"[Lv 5] : ^777777Cast Range 9 Cell / MaxHP 23% recovery ^000000"
	].join("\n");

	SkillDescription[SKID.NC_TRAININGAXE] = [
		"Axe Mastery ",
		"Max Lv : 10",
		"^777777Skill Requirement : Mechanic Basic  ^000000",
		"Skill Form : ^777777Passive ^000000",
		"Description : ^777777Increase ATK and Accuracy rate when caster equips an axe (passive), Maces also receive a small percentage of this skill.^000000",
		"[Lv 1] : ^777777ATK +5 / Accuracy Rate +3  ^000000",
		"[Lv 2] : ^777777ATK +10 / Accuracy Rate +6  ^000000",
		"[Lv 3] : ^777777ATK +15 / Accuracy Rate +9  ^000000",
		"[Lv 4] : ^777777ATK +20 / Accuracy Rate +12 ^000000",
		"[Lv 5] : ^777777ATK +25 / Accuracy Rate +15  ^000000",
		"[Lv 6] : ^777777ATK +30 / Accuracy Rate +18  ^000000",
		"[Lv 7] : ^777777ATK +35 / Accuracy Rate +21  ^000000",
		"[Lv 8] : ^777777ATK +40 / Accuracy Rate +24  ^000000",
		"[Lv 9] : ^777777ATK +45 / Accuracy Rate +27  ^000000",
		"[Lv 10] : ^777777ATK +50 / Accuracy Rate +30  ^000000"
	].join("\n");

	SkillDescription[SKID.NC_RESEARCHFE] = [
		"Fire Earth Research ",
		"Max Lv : 5",
		"^777777Skill Requirement : Mechanic Basic  ^000000",
		"Skill Form : ^777777Passive ^000000",
		"Description : ^777777After researching Fire and Earth Element monsters, Mechanic gains further understanding of them, increasing damage and resistance against these monsters.^000000",
		"[Lv 1] : ^777777Resistance +10 / ATK +10  ^000000",
		"[Lv 2] : ^777777Resistance +20 / ATK +20  ^000000",
		"[Lv 3] : ^777777Resistance +30 / ATK +30  ^000000",
		"[Lv 4] : ^777777Resistance +40 / ATK +40 ^000000",
		"[Lv 5] : ^777777Resistance +50 / ATK +50  ^000000"
	].join("\n");

	SkillDescription[SKID.NC_AXEBOOMERANG] = [
		"Axe Boomerang",
		"Max Lv : 5",
		"^777777Skill Requirement :  Axe Mastery 1  ^000000",
		"Skill Form : ^777777Active / Damage ^000000",
		"Description : ^777777Axe exclusive skill (One-handed and Two-handed) Throws axe like a boomerang at a target, causing damage and knocking it back. The weight of the axe increases damage done by the skill.^000000",
		"[Lv 1] : ^777777Damage 300% + Axe Weight / Skill Range 5 cells^000000",
		"[Lv 2] : ^777777Damage 350% + Axe Weight / Skill Range 6 cells^000000",
		"[Lv 3] : ^777777Damage 400% + Axe Weight / Skill Range 7 cells^000000",
		"[Lv 4] : ^777777Damage 450% + Axe Weight / Skill Range 8 cells^000000",
		"[Lv 5] : ^777777Damage 500% + Axe Weight / Skill Range 9 cells^000000"
	].join("\n");

	SkillDescription[SKID.NC_POWERSWING] = [
		"Power Swing",
		"Max Lv : 10",
		"^777777Skill Requirement : Axe Boomerang 3  ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Deals melee physical damage, and stuns the target.",
		"Damage increases based on BaseLv, STR and Dex.^000000",
		"[Level 1] : ^777777 ATK 400% ^000000",
		"[Level 2] : ^777777 ATK 500% ^000000",
		"[Level 3] : ^777777 ATK 600% ^000000",
		"[Level 4] : ^777777 ATK 700% ^000000",
		"[Level 5] : ^777777 ATK 800% ^000000",
		"[Level 6] : ^777777 ATK 900% ^000000",
		"[Level 7] : ^777777 ATK 1000% ^000000",
		"[Level 8] : ^777777 ATK 1100% ^000000",
		"[Level 9] : ^777777 ATK 1200% ^000000",
		"[Level10] : ^777777 ATK 1300% ^000000"
	].join("\n");

	SkillDescription[SKID.NC_AXETORNADO] = [
		"Axe Tornado ",
		"Max Lv : 5",
		"^777777Skill Requirement : Axe Training 1  ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Deals melee physical damage by spining axes.",
		"Damage increases based on BaseLv and VIT. ^000000",
		"[Level 1] : ^777777 ATK 380%/ Area of Effect 5 x 5^000000",
		"[Level 2] : ^777777 ATK 560%/ Area of Effect 5 x 5^000000",
		"[Level 3] : ^777777 ATK 740%/ Area of Effect 7 x 7^000000",
		"[Level 4] : ^777777 ATK 920%/ Area of Effect 7 x 7^000000",
		"[Level 5] : ^777777 ATK 1100%/ Area of Effect 7 x 7^000000"
	].join("\n");

	SkillDescription[SKID.NC_SILVERSNIPER] = [
		"FAW Silver Sniper",
		"Max Lv : 5",
		"^777777Skill Requirement :  Fire Earth Research 2  ^000000",
		"Skill Form : ^777777Active / FAW Set ^000000",
		"Description : ^777777Set FAW (Fixed Automatic Weapon) on the ground that executes long distance attacks. Maximum of 2 FAWs can be set. Consumes 2 Steel and 1 Iron. Requires an Oridecon Hammer and Mini Furnace. ^000000",
		"[Lv 1] : ^777777ATK +0  / Duration 20sec. ^000000",
		"[Lv 2] : ^777777ATK +200  / Duration 30sec. ^000000",
		"[Lv 3] : ^777777ATK +400  / Duration 40sec. ^000000",
		"[Lv 4] : ^777777ATK +800  / Duration 50sec. ^000000",
		"[Lv 5] : ^777777ATK +1000  / Duration 60sec. ^000000"
	].join("\n");

	SkillDescription[SKID.NC_MAGICDECOY] = [
		"FAW Magic Decoy",
		"Max Lv : 5",
		"^777777Skill Requirement :  FAW Silver Sniper  2  ^000000",
		"Skill Form : ^777777Active / FAW Set ^000000",
		"Description : ^777777Set FAW (Fixed Automatic Weapon) on the ground that executes magic attacks. Maximum of 2 FAWs can be set. Consumes 2 Iron, 1 Brigan and 2 item among Scarlet Point, Yellow Wish Point, or Lime Green Point, or Indigo Point. Requires an Oridecon Hammer and Portable Furnace.^000000",
		"[Lv 1] : ^777777MATK 300  / Duration 20sec. ^000000",
		"[Lv 2] : ^777777MATK 350  / Duration 30sec. ^000000",
		"[Lv 3] : ^777777MATK 400  / Duration 40sec. ^000000",
		"[Lv 4] : ^777777MATK 450  / Duration 50sec. ^000000",
		"[Lv 5] : ^777777MATK 500  / Duration 60sec. ^000000"
	].join("\n");

	SkillDescription[SKID.NC_DISJOINT] = [
		"Divest FAW ",
		"Max Lv : 1",
		"^777777Skill Requirement :  FAW Silver Sniper 1  ^000000",
		"Skill Form : ^777777Active / Divest FAW ^000000",
		"Description : ^777777Disarms 1 active FAW from the ground. Also enables a chance to disarm other player's FAWs. Consumes 1 <Wrench>^000000"
	].join("\n");

	SkillDescription[SKID.SC_FATALMENACE] = [
		"Fatal Manace",
		"Max Lv : 10",
		"^777777Skill Requirement : Intimidate 5 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Deals melee physical damage to a target and enemies around it.",
		"Damage increases based on BaseLv and AGI.",
		"When using knife, deals damage twice.^000000",
		"[Level 1] : ^777777 ATK 120%/HIT-30/Area of Effect 3x3^000000",
		"[Level 2] : ^777777 ATK 240%/HIT-25/Area of Effect 3x3^000000",
		"[Level 3] : ^777777 ATK 360%/HIT-20/Area of Effect 3x3^000000",
		"[Level 4] : ^777777 ATK 480%/HIT-15/Area of Effect 3x3^000000",
		"[Level 5] : ^777777 ATK 600%/HIT-10/Area of Effect 3x3^000000",
		"[Level 6] : ^777777 ATK 720%/HIT+ 0/Area of Effect 5x5^000000",
		"[Level 7] : ^777777 ATK 840%/HIT+ 5/Area of Effect 5x5^000000",
		"[Level 8] : ^777777 ATK 960%/HIT+10/Area of Effect 5x5^000000",
		"[Level 9] : ^777777 ATK 1080%/HIT+15/Area of Effect 5x5^000000",
		"[Level10] : ^777777 ATK 1200%/HIT+20/Area of Effect 5x5^000000"
	].join("\n");

	SkillDescription[SKID.SC_REPRODUCE] = [
		"Reproduce",
		"Max Lv: 10",
		"^777777Skill Requirement: Intimidate Lv. 5 ^000000",
		"Class: ^777777  Active Toggle/Buff ^000000",
		"Details: ^777777 Enables you to learn enemy skills used on you. Use this skill again to cancel its effect and lock in the skill you've learned.  ^000000",
		"^777777 Only 1 skill can be learned, and its learning level is affected by your Reproduce level. ^000000",
		"^777777 Skills learned by Reproduce require 30% more SP than usual. ^000000",
		"^777777 These skills, since they're not really learned with SP, can't be chained with other skills or used with special effects and items based on their learning levels. ^000000"
	].join("\n");

	SkillDescription[SKID.SC_AUTOSHADOWSPELL] = [
		"Shadow Spell",
		"Max Lv : 10",
		"^777777Skill Requirement : Reproduce 5 ^000000",
		"Skill Form : ^777777  Active / Buff ^000000",
		"Description : ^777777 Enables the caster to use magic skills that the caster has learned through Intimidate or Reproduce.",
		"Basic physical attacks creates a chance of casting those magic skills for its skills duration. ^000000",
		"[Level 1] : ^777777 Chance 28%/3LvCast/MATK+ 5/60 sec^000000",
		"[Level 2] : ^777777 Chance 26%/3LvCast/MATK+10/80 sec^000000",
		"[Level 3] : ^777777 Chance 24%/4LvCast/MATK+15/100 sec^000000",
		"[Level 4] : ^777777 Chance 22%/4LvCast/MATK+20/120 sec^000000",
		"[Level 5] : ^777777 Chance 20%/5LvCast/MATK+25/140 sec^000000",
		"[Level 6] : ^777777 Chance 18%/5LvCast/MATK+30/160 sec^000000",
		"[Level 7] : ^777777 Chance 16%/6LvCast/MATK+35/180 sec^000000",
		"[Level 8] : ^777777 Chance 14%/6LvCast/MATK+40/200 sec^000000",
		"[Level 9] : ^777777 Chance 12%/7LvCast/MATK+45/220 sec^000000",
		"[Level 10] : ^777777 Chance 15%/7LvCast/MATK+50/300 sec^000000"
	].join("\n");

	SkillDescription[SKID.SC_SHADOWFORM] = [
		"Shadow Formation",
		"Max Lv : 5",
		"^777777Skill Requirement :  Stalk 3 ^000000",
		"Skill Form : ^777777Active / Debuff ^000000",
		"Description : ^777777Hide yourself behind another player's shadow and make the front player receive damage instead of you. The skill is canceled if the front player has been attacked a certain amount of times or the distance between you and the front player gets farther. Skills and Items can't be used while in this state. ^000000",
		"[Lv 1] : ^777777Number of damage - 5 times / Consume 10 SP per sec. 10 / Duration 30 sec. ^000000",
		"[Lv 2] : ^777777Number of damage - 6 times / Consume 9 SP per sec. / Duration 40 sec. ^000000",
		"[Lv 3] : ^777777Number of damage - 7 times / Consume 8 SP per sec. / Duration 50 sec. ^000000",
		"[Lv 4] : ^777777Number of damage - 8 times / Consume 7 SP per sec. / Duration 60 sec. ^000000",
		"[Lv 5] : ^777777Number of damage - 9 times / Consume 6 SP per sec. / Duration 70 sec. ^000000"
	].join("\n");

	SkillDescription[SKID.SC_TRIANGLESHOT] = [
		"Triangle Shot",
		"Max Lv : 10",
		"^777777Skill Requirement : Double Strafe 7 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777 Deals ranged physical damage to 1 target.",
		"Damage increases based on BaseLv and AGI.",
		"Consumes 3 arrows.^000000",
		"[Level 1] : ^777777 ATK 230% / Range 7Cell^000000",
		"[Level 2] : ^777777 ATK 460% / Range 7Cell^000000",
		"[Level 3] : ^777777 ATK 690% / Range 7Cell^000000",
		"[Level 4] : ^777777 ATK 920% / Range 9Cell^000000",
		"[Level 5] : ^777777 ATK 1150% / Range 9Cell^000000",
		"[Level 6] : ^777777 ATK 1380% / Range 9Cell^000000",
		"[Level 7] : ^777777 ATK 1610% / Range 9Cell^000000",
		"[Level 8] : ^777777 ATK 1840% / Range 11Cell^000000",
		"[Level 9] : ^777777 ATK 2070% / Range 11Cell^000000",
		"[Level 10] : ^777777 ATK 2300% / Range 11Cell^000000"
	].join("\n");

	SkillDescription[SKID.SC_BODYPAINT] = [
		"Body Painting",
		"Max Lv : 5",
		"^777777Skill Requirement :  Shadow Chaser Basic ^000000",
		"Skill Form : ^777777Active / Debuff / Detect ^000000",
		"Description : ^777777Splash paint around the caster and find hidden enemies. The target and all surroundings that have been exposed to the paint get [Blind] curse along with a chance to decrease attack speed.^000000",
		"[Lv 1] : ^777777Chance to curse [Blind] 55% / Chance to decrease attack speed 25% /  Duration 5 sec. ^000000",
		"[Lv 2] : ^777777Chance to curse [Blind] 57% / Chance to decrease attack speed 30% /  Duration 7 sec.  ^000000",
		"[Lv 3] : ^777777Chance to curse [Blind] 59% / Chance to decrease attack speed 35% /  Duration 9 sec. ^000000",
		"[Lv 4] : ^777777Chance to curse [Blind] 61% / Chance to decrease attack speed 40% /  Duration 11 sec.  ^000000",
		"[Lv 5] : ^777777Chance to curse [Blind] 63% / Chance to decrease attack speed 45% /  Duration 13 sec.  ^000000"
	].join("\n");

	SkillDescription[SKID.SC_INVISIBILITY] = [
		"Invisibility",
		"Max Lv : 5",
		"^777777Skill Requirement : Shadow Spell 7 / Deadly Infection 5 / Masquerade-Unlucky 3 ^000000",
		"Skill Form : ^777777Active / Buff ^000000",
		"Description : ^777777Make yourself invisible. You can attack enemies during invisible state but the property of attack becomes Ghost Property level 1. It keeps consuming caster's SP and also other skill or items can not be used while the skill is casted. Skill is canceled if SP becomes 0. Ignore some of detect skills. ^000000",
		"[Lv 1] : ^777777Critical +20% / Attack Speed decrease 40% / Consume SP in a sec. 10% ^000000",
		"[Lv 2] : ^777777Critical +40% / Attack Speed decrease 30% / Consume SP in a sec. 8%   ^000000",
		"[Lv 3] : ^777777Critical +60% / Attack Speed decrease 20% / Consume SP in a sec. 6%  ^000000",
		"[Lv 4] : ^777777Critical +80% / Attack Speed decrease 10% / Consume SP in a sec. 5%   ^000000",
		"[Lv 5] : ^777777Critical +100% / Attack Speed decrease 0% / Consume SP in a sec. 2%   ^000000"
	].join("\n");

	SkillDescription[SKID.SC_DEADLYINFECT] = [
		"Deadly Infection",
		"Max Lv : 5",
		"^777777Skill Requirement : Shadow Formation 3 / Shadow Spell 5 ^000000",
		"Skill Form : ^777777Active / Buff ^000000",
		"Description : ^777777Transfer abnormal status that caster holds at the moment to the target or attacking enemies. Even if the caster transferred its curse to others, the curse on caster is maintained. ^000000",
		"[Lv 1] : ^777777Skill Duration 10 sec. / 40% chance of infection^000000",
		"[Lv 2] : ^777777Skill Duration 15 sec. / 50% chance of infection^000000",
		"[Lv 3] : ^777777Skill Duration 20 sec. / 60% chance of infection^000000",
		"[Lv 4] : ^777777Skill Duration 25 sec. / 70% chance of infection^000000",
		"[Lv 5] : ^777777Skill Duration 30 sec. / 80% chance of infection^000000"
	].join("\n");

	SkillDescription[SKID.SC_ENERVATION] = [
		"Masquerade-Enervation",
		"Max Lv : 3",
		"^777777Skill Requirement :  Body Painting 1 ^000000",
		"Skill Form : ^777777Active / Debuff ^000000",
		"Description : ^777777Decrease target's ATK with and strips all Spirit Spheres he/she has. Must have a Makeover Brush and consumes 1 Face Paint. The chance of success depends on the caster and target's level and stats.^000000",
		"[Lv 1] : ^777777ATK 30% Decrease / Duration 10 sec. ^000000",
		"[Lv 2] : ^777777ATK 40% Decrease / Duration 15 sec. ^000000",
		"[Lv 3] : ^777777ATK 50% Decrease / Duration 20 sec. ^000000"
	].join("\n");

	SkillDescription[SKID.SC_GROOMY] = [
		"Masquerade-Gloomy",
		"Max Lv : 3",
		"^777777Skill Requirement :  Body Painting 1 ^000000",
		"Skill Form : ^777777Active / Debuff ^000000",
		"Description : ^777777Decrease target's accuracy and attack speed. Target's animals, pets or Homunculus are stripped with this skill. Must have a Makeover Brush and consume 1 Face Paint. The chance of success depends on the caster and target's level and stats.^000000",
		"[Lv 1] : ^777777Attack Speed 30% Decrease / Accuracy Rate 20% Decrease / Duration 10 sec. ^000000",
		"[Lv 2] : ^777777Attack Speed 40% Decrease / Accuracy Rate 40% Decrease / Duration 15 sec. ^000000",
		"[Lv 3] : ^777777Attack Speed 50% Decrease / Accuracy Rate 60% Decrease / Duration 20 sec. ^000000"
	].join("\n");

	SkillDescription[SKID.SC_IGNORANCE] = [
		"Masquerade-Ignorance",
		"Max Lv : 3",
		"^777777Skill Requirement :  Body Painting 1 ^000000",
		"Skill Form : ^777777Active / Debuff ^000000",
		"Description : ^777777Drain and receive half of target's SP. To monsters, receive a certain amount of SP depending on monster's level. Target is disabled to use magic or skill while this skill is active. Must have a Makeover Brush and consumes 1 Face Paint. The chance of success depends on the caster and target's level and stats.^000000",
		"[Lv 1] : ^777777Consume SP 100 / Duration 10 sec. ^000000",
		"[Lv 2] : ^777777Consume SP 200 / Duration 15 sec. ^000000",
		"[Lv 3] : ^777777Consume SP 300 / Duration 20 sec. ^000000"
	].join("\n");

	SkillDescription[SKID.SC_LAZINESS] = [
		"Masquerade-Laziness",
		"Max Lv : 3",
		"^777777Skill Requirement : Masquerade-Enervation 1 / Gloomy 1 / Ignorance 1 ^000000",
		"Skill Form : ^777777Active / Debuff ^000000",
		"Description : ^777777Decrease target's movement, casting speed and also flee rate. The target has to consume additional SP [Laziness skill level x 10] to use any skills while target is affected by Laziness. Must have a Makeover Brush and consume 1 Face Paint. The chance of success depends on the caster and target's level and stats.^000000",
		"[Lv 1] : ^777777Flee Rate 10% Decrease /  Casting Speed 20% Decrease / Duration 10 sec.^000000",
		"[Lv 2] : ^777777Flee Rate 20% Decrease /  Casting Speed 30% Decrease / Duration 15 sec.^000000",
		"[Lv 3] : ^777777Flee Rate 30% Decrease /  Casting Speed 40% Decrease / Duration 20 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SC_UNLUCKY] = [
		"Masquerade-Unlucky",
		"Max Lv : 3",
		"^777777Skill Requirement : Masquerade-Laziness 1 / Weakness 1  ^000000",
		"Skill Form : ^777777Active / Debuff ^000000",
		"Description : ^777777Decrease target's CRI and Perfect Dodge rate. Certain amount of Zeny is consumed every time target is casting skills. Must give 1 abnormal status to the target among Poison, Blind and Silence status. Required to have Makeover Brush and consume 1 Face Paint. The chance of success is changeable depending on caster and target's level and stats. ^000000",
		"[Lv 1] : ^777777Critical 10 Decrease / Perfect Dodge 10 Decrease / Duration 10 sec.^000000",
		"[Lv 2] : ^777777Critical 20 Decrease / Perfect Dodge 20 Decrease / Duration 15 sec.^000000",
		"[Lv 3] : ^777777Critical 30 Decrease / Perfect Dodge 30 Decrease / Duration 20 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SC_WEAKNESS] = [
		"Masquerade-Weakness",
		"Max Lv : 3",
		"^777777Skill Requirement : Masquerade-Enervation 1 / Gloomy 1 / Ignorance 1 ^000000",
		"Skill Form : ^777777Active / Debuff ^000000",
		"Description : ^777777Decrease Maximum HP and divest weapon and shield from target's body temporary. Target can not equip weapon or shield during casting duration. Required to have Makeover Brush and consume 1 Face Paint. The chance of success is changeable depending on caster and target's level and stats. ^000000",
		"[Lv 1] : ^777777MaxHP 10% Decrease / Duration 10 sec.^000000",
		"[Lv 2] : ^777777MaxHP 20% Decrease / Duration 15 sec.^000000",
		"[Lv 3] : ^777777MaxHP 30% Decrease / Duration 20 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SC_STRIPACCESSARY] = [
		"Divest Accessory ",
		"Max Lv : 5",
		"^777777Skill Requirement : Divest Weapon 1 ^000000",
		"Skill Form : ^777777Active / Debuff ^000000",
		"Description : ^777777Divest 2 accessories from target's body. The target is disabled to re-equip those released accessories during skill duration. To monsters, it decreases 20% of INT, DEX and LUK for a while. ^000000",
		"[Lv 1] : ^777777Chance of Success 14% / Duration 60 sec. ^000000",
		"[Lv 2] : ^777777Chance of Success 16% / Duration 60 sec.  ^000000",
		"[Lv 3] : ^777777Chance of Success 18% / Duration 60 sec.  ^000000",
		"[Lv 4] : ^777777Chance of Success 20% / Duration 60 sec.  ^000000",
		"[Lv 5] : ^777777Chance of Success 22% / Duration 60 sec.  ^000000"
	].join("\n");

	SkillDescription[SKID.SC_MANHOLE] = [
		"Manhole ",
		"Max Lv : 3",
		"^777777Skill Requirement : Piece 1 ^000000",
		"Skill Form : ^777777Active / Ground ^000000",
		"Description : ^777777Draw 1 manhole on the ground and push 1 target into the hole. Trapped targets are disabled from doing anything including attacks. Must have a Paint Brush and consumes 1 Surface Paint. ^000000",
		"[Lv 1] : ^777777Skill Duration 5 sec. ^000000",
		"[Lv 2] : ^777777Skill Duration 10 sec. ^000000",
		"[Lv 3] : ^777777Skill Duration 15 sec. ^000000"
	].join("\n");

	SkillDescription[SKID.SC_DIMENSIONDOOR] = [
		"Dimensional Door",
		"Max Lv : 3",
		"^777777Skill Requirement : Manhole 1 ^000000",
		"Skill Form : ^777777Active / Ground ^000000",
		"Description : ^777777Draw magic door on the ground and teleport the target who stepps on it to a random location. Must have a Paint Brush and consumes 1 Surface Paint.^000000",
		"[Lv 1] : ^777777Skill Duration 4 sec. ^000000",
		"[Lv 2] : ^777777Skill Duration 8 sec. ^000000",
		"[Lv 3] : ^777777Skill Duration 12 sec. ^000000"
	].join("\n");

	SkillDescription[SKID.SC_CHAOSPANIC] = [
		"Chaos Panic ",
		"Max Lv : 3",
		"^777777Skill Requirement : Manhole 1 ^000000",
		"Skill Form : ^777777Active / Ground ^000000",
		"Description : ^777777Draw whirling shape on the ground and trap the target into a chaos. The trapped target is in a chaos, so it loses its way and moves abnormally. To monsters, it makes the monster confused, so the monster changes its attacking target randomly. Must have a Paint Brush and consumes 2 Surface Paint.^000000",
		"[Lv 1] : ^777777Skill Duration 5 sec. ^000000",
		"[Lv 2] : ^777777Skill Duration 10 sec. ^000000",
		"[Lv 3] : ^777777Skill Duration 15 sec. ^000000"
	].join("\n");

	SkillDescription[SKID.SC_MAELSTROM] = [
		"Maelstrom",
		"Max Lv : 3",
		"^777777Skill Requirement : Chaos Panic 3 / Masquerade-Unlucky 3 ^000000",
		"Skill Form : ^777777Active / Ground ^000000",
		"Description : ^777777Draw swirling circle on the ground and absorb other magic that is cast on the ground. Caster recovers SP depending on absorbed magic level. Must have a Paint Brush and consumes 2 Surface Paint.^000000",
		"[Lv 1] : ^777777Skill Duration 7 sec. ^000000",
		"[Lv 2] : ^777777Skill Duration 14 sec. ^000000",
		"[Lv 3] : ^777777Skill Duration 21 sec. ^000000"
	].join("\n");

	SkillDescription[SKID.SC_BLOODYLUST] = [
		"Bloody Lust ",
		"Max Lv : 3",
		"^777777Skill Requirement : Dimensional Door 3 ^000000",
		"Skill Form : ^777777Active / Ground ^000000",
		"Description : ^777777Draw a red circle on the ground and give the target who steps on it the Frenzy effect. Must have a Paint Brush and consumes 2 Surface Paint.^000000",
		"[Lv 1] : ^777777Skill Duration 7 sec. ^000000",
		"[Lv 2] : ^777777Skill Duration 14 sec. ^000000",
		"[Lv 3] : ^777777Skill Duration 21 sec. ^000000"
	].join("\n");

	SkillDescription[SKID.SC_FEINTBOMB] = [
		"Feint Bomb",
		"Max Lv : 10",
		"^777777Skill Requirement : Dimensional Door 3 ^000000",
		"Skill Form : ^777777  Active / Ground ^000000",
		"Description : ^777777 Draw a fake copycat of yourself on the ground and step backwards with Backslide.",
		"After a while, the fake copycat explodes itself and gives damage to all surrounding enemies.",
		"Must have a Paint Brush and consumes 1 Surface Paint.",
		"Increase damage as caster's BaseLV, JobLV, and DEX gets higher.^000000",
		"[Level 1] : ^777777 1 cell Backward ^000000",
		"[Level 2] : ^777777 2 cells Backward ^000000",
		"[Level 3] : ^777777 3 cells Backward^000000",
		"[Level 4] : ^777777 4 cells Backward ^000000",
		"[Level 5] : ^777777 5 cells Backward ^000000",
		"[Level 6] : ^777777 6 cells Backward^000000",
		"[Level 7] : ^777777 7 cells Backward ^000000",
		"[Level 8] : ^777777 8 cells Backward ^000000",
		"[Level 9] : ^777777 9 cells Backward^000000",
		"[Level10] : ^777777 10 cells Backward^000000"
	].join("\n");

	SkillDescription[SKID.LG_CANNONSPEAR] = [
		"Cannon Spear",
		"Max Lv : 5",
		"^777777Skill Requirement : Pinpoint Attack 1^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Spear Weapon Skill. Deals ranged physical damage to one target and all enemies within the AoE around it.",
		"Damage increases based on BaseLv and STR.",
		"Half of Critical rate is applied.",
		"Half of Critical Damage option is applied.^000000",
		"[Level 1] : ^777777 ATK 50% / Area of Effect : 3 x 3^000000",
		"[Level 2] : ^777777 ATK 100% / Area of Effect : 3 x 3^000000",
		"[Level 3] : ^777777 ATK 150% / Area of Effect : 3 x 3^000000",
		"[Level 4] : ^777777 ATK 200% / Area of Effect : 5 x 5^000000",
		"[Level 5] : ^777777 ATK 250% / Area of Effect : 5 x 5^000000"
	].join("\n");

	SkillDescription[SKID.LG_BANISHINGPOINT] = [
		"Vanishing Point",
		"Max Lv : 10",
		"^777777Skill Requirement : Spear Mastery 1 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Spear Weapon Skill. Deals ranged physical damage to 1 target.",
		"Hit increases as skill level increases, Damage increases based on BaseLv and Bash skill level.",
		"Range 7Cell.^000000",
		"[Level 1] : ^777777 ATK 80% ^000000",
		"[Level 2] : ^777777 ATK 160% ^000000",
		"[Level 3] : ^777777 ATK 240% ^000000",
		"[Level 4] : ^777777 ATK 320% ^000000",
		"[Level 5] : ^777777 ATK 400% ^000000",
		"[Level 6] : ^777777 ATK 480%^000000",
		"[Level 7] : ^777777 ATK 560% ^000000",
		"[Level 8] : ^777777 ATK 640% ^000000",
		"[Level 9] : ^777777 ATK 720% ^000000",
		"[Level 10] : ^777777 ATK 800% ^000000"
	].join("\n");

	SkillDescription[SKID.LG_TRAMPLE] = [
		"Trample",
		"Max Lv : 3",
		"^777777Skill Requirement : Royal Guard Basic ^000000",
		"Skill Form : ^777777 Active / Special ^000000",
		"Description : ^777777Tramples a 5x5 area around the caster, destroying all traps. Explosive type traps will activate with this skill.^000000",
		"[Lv 1] : ^777777Chance of Success 50% ^000000",
		"[Lv 2] : ^777777Chance of Success 75%  ^000000",
		"[Lv 3] : ^777777Chance of Success 100%  ^000000"
	].join("\n");

	SkillDescription[SKID.LG_SHIELDPRESS] = [
		"Shield Press",
		"Max Lv : 10",
		"^777777Skill Requirement : Smite 3 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Strikes a target with a shield and stuns the target.",
		"The damage is influenced by shield weight, refine rate, and the caster's Base LV, STR, and VIT.",
		"A shield is required to cast this skill.^000000",
		"[Level 1] : ^777777ATK 200% ^000000",
		"[Level 2] : ^777777ATK 400% ^000000",
		"[Level 3] : ^777777ATK 600% ^000000",
		"[Level 4] : ^777777ATK 800% ^000000",
		"[Level 5] : ^777777ATK 1000% ^000000",
		"[Level 6] : ^777777ATK 1200% ^000000",
		"[Level 7] : ^777777ATK 1400% ^000000",
		"[Level 8] : ^777777ATK 1600% ^000000",
		"[Level 9] : ^777777ATK 1800% ^000000",
		"[Level10] : ^777777ATK 2000% ^000000"
	].join("\n");

	SkillDescription[SKID.LG_REFLECTDAMAGE] = [
		"Reflect Damage",
		"Max Lv : 5",
		"^777777Skill Requirement : Reflect Shield 5 ^000000",
		"Skill Form : ^777777  Active / Self Buff ^000000",
		"Description : ^777777  Shield Skill.",
		"Reduce incoming reflection damage during the duration.^000000",
		"[Level 1] : ^777777 Reflection Damage 10% reduced ^000000",
		"[Level 2] : ^777777 Reflection Damage 20% reduced ^000000",
		"[Level 3] : ^777777 Reflection Damage 30% reduced ^000000",
		"[Level 4] : ^777777 Reflection Damage 40% reduced ^000000",
		"[Level 5] : ^777777 Reflection Damage 50% reduced ^000000"
	].join("\n");

	SkillDescription[SKID.LG_PINPOINTATTACK] = [
		"Pinpoint Attack",
		"Max Lv : 5",
		"^777777Skill Requirement : Vanishing Point 5 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Spear skill. Leaps toward a single target and inflicts Critical Damage.",
		"It has a chance of either leaving them bleeding or breaking a piece of their equipment, depending on the skill level. Damage increases depending on the player's BaseLv and AGI.",
		"For Critical Damage, only the half of total Critical Damage Options will be applied. ^000000",
		"[Level 1] : ^777777 ATK 100% / Bleed ^000000",
		"[Level 2] : ^777777 ATK 200% / Break Helm ^ 000000",
		"[Level 3] : ^777777 ATK 300% / Break Shield ^000000",
		"[Level 4] : ^777777 ATK 400% / Break Armor ^000000",
		"[Level 5] : ^777777 ATK 500% / Break Weapon ^000000"
	].join("\n");

	SkillDescription[SKID.LG_FORCEOFVANGUARD] = [
		"Vanguard Force",
		"Max Lv : 5",
		"^777777Skill Requirement : Royal Guard Basic ^000000",
		"Skill Form : ^777777Active / Buff (To yourself) ^000000",
		"Description : ^777777Increase your rage counter when you receive physical attack. The rage counters can be used for the skill Burst Attack. Vanguard Force will cancel when you cast Rage Burst. This skill consumes some SP at regular time interval to stay active.^000000",
		"[Lv 1] : ^77777720% chance / Max rage counter 7^000000",
		"[Lv 2] : ^77777732% chance / Max rage counter 9^000000",
		"[Lv 3] : ^77777744% chance / Max rage counter 11^000000",
		"[Lv 4] : ^77777756% chance / Max rage counter 13^000000",
		"[Lv 5] : ^77777768% chance / Max rage counter 15^000000"
	].join("\n");

	SkillDescription[SKID.LG_RAGEBURST] = [
		"Burst Attack",
		"Max Lv : 1",
		"^777777Skill Requirement : Vanguard Force 1 ^000000",
		"Skill Form : ^777777Active / Damage ^000000",
		"Description : ^777777Release all Rage Counters from Vanguard Force to deal great damage to an enemy.^000000"
	].join("\n");

	SkillDescription[SKID.LG_SHIELDSPELL] = [
		"Shield Spell",
		"Max Lv : 3",
		"^777777Skill Requirement : Shield Press 3 / Earth Drive 2  ^000000",
		"Skill Form : ^777777  Active / Special ^000000",
		"Description : ^777777  Shield Weapon Skill.",
		"Put your will on the shield and give yourself an effect for 90 seconds.",
		"Effect cannot be overlapped.^000000",
		"[Level 1] : ^777777 Recovers 3% of MaxHP every 3 sec.^000000",
		"[Level 2] : ^777777 Recovers 5% of MaxSP every 5 sec.^000000",
		"[Level 3] : ^777777 ATK +150, MATK +150^000000"
	].join("\n");

	SkillDescription[SKID.LG_EXEEDBREAK] = [
		"Exceed Break",
		"Max Lv : 5",
		"^777777Skill Requirement : Vanishing Point 3  ^000000",
		"Skill Form : ^777777Active / Buff (To yourself) ^000000",
		"Description : ^777777Gather your strength to cause greater damage on your next attack. A short range physical attack on your body will cancel the skill. Your skill damage is not affected by this skill. Movement speed reduces while this skill is active.^000000",
		"[Lv 1] : ^777777Attack Power 100%^000000",
		"[Lv 2] : ^777777Attack Power 200%^000000",
		"[Lv 3] : ^777777Attack Power 300%^000000",
		"[Lv 4] : ^777777Attack Power 400%^000000",
		"[Lv 5] : ^777777Attack Power 500%^000000"
	].join("\n");

	SkillDescription[SKID.LG_OVERBRAND] = [
		"Overbrand",
		"Max Lv : 5",
		"^777777Skill Requirement : Moon Slasher 3 / Pinpoint Attack 1  ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Spear Weapon Skill. Inflicts Melee Physical Damage to all enemies in a set area (7X7).",
		"While in Moon Slasher effect, it deals more damage. Damage increases based on BaseLv, STR and DEX.^000000",
		"[Level 1] : ^777777 ATK 300% / 450%(Moon Slasher)^000000",
		"[Level 2] : ^777777 ATK 600% / 900%(Moon Slasher)^000000",
		"[Level 3] : ^777777 ATK 900% / 1350%(Moon Slasher)^000000",
		"[Level 4] : ^777777 ATK 1200% / 1800%(Moon Slasher)^000000",
		"[Level 5] : ^777777 ATK 1500% / 2250%(Moon Slasher)^000000"
	].join("\n");

	SkillDescription[SKID.LG_PRESTIGE] = [
		"Prestige",
		"Max Lv : 5",
		"^777777Skill Requirement : Trample 3  ^000000",
		"Skill Form : ^777777  Active / Self Buff ^000000",
		"Description : ^777777  Places a temporary buff on the user that increases Physical Defense and gives a chance of dodging magic damage. Dodging magic damage increases based on caster's stats, defense increases based on Defending Aura. Caster does not receive magic damage when dodged.",
		"It does not overlap with Banding effect.^000000",
		"[Level 1] : ^777777 Duration 30 sec^000000",
		"[Level 2] : ^777777 Duration 45 sec ^000000",
		"[Level 3] : ^777777 Duration 60 sec ^000000",
		"[Level 4] : ^777777 Duration 75 sec ^000000",
		"[Level 5] : ^777777 Duration 90 sec ^000000"
	].join("\n");

	SkillDescription[SKID.LG_BANDING] = [
		"Banding",
		"Max Lv : 5",
		"^777777Skill Requirement : Pinpoint Attack 3 / Rage Burst Attack 1  ^000000",
		"Skill Form : ^777777  Active / Self Buff ^000000",
		"Description : ^777777  Can be used when caster's in party.",
		"When casted, increase caster's physical armor based on number of players in 11x11 Area around the caster.",
		"It does not overlap with Prestige effect.^000000",
		"[Level 1] : ^777777 Per 1 party member, DEF + 18 / Duration : 60 sec^000000",
		"[Level 2] : ^777777 Per 1 party member, DEF + 21 / Duration : 90 sec^000000",
		"[Level 3] : ^777777 Per 1 party member, DEF + 24 / Duration : 120 sec^000000",
		"[Level 4] : ^777777 Per 1 party member, DEF + 27 / Duration : 150 sec^000000",
		"[Level 5] : ^777777 Per 1 party member, DEF + 30 / Duration : 180 sec^000000"
	].join("\n");

	SkillDescription[SKID.LG_MOONSLASHER] = [
		"Moonslasher",
		"Max Lv : 5",
		"^777777Skill Requirement : Spear Mastery 1  ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Inflicts melee physical damages to all enemies around the caster(7x7 Cell).",
		"Damage increases based on BaseLv and skill level of Overbrand.",
		"When casted, it amplifies Overbrand.^000000",
		"[Level 1] : ^777777 ATK 120%/  Duration : 2 sec^000000",
		"[Level 2] : ^777777 ATK 240%/  Duration : 4 sec^000000",
		"[Level 3] : ^777777 ATK 360%/  Duration : 6 sec^000000",
		"[Level 4] : ^777777 ATK 480%/  Duration : 8 sec^000000",
		"[Level 5] : ^777777 ATK 600%/  Duration : 10 sec^000000"
	].join("\n");

	SkillDescription[SKID.LG_RAYOFGENESIS] = [
		"Genesis Ray",
		"Max Lv : 10",
		"^777777Skill Requirement : Grand Cross 5 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Inflicts Holy property Magic damage to all enemies in a 11x11 area around the Caster. Versus Undead property and Demon race monsters, it has a 50% chance of leaving them blind.",
		"Damage increases based on BaseLv and INT. During Inpiration, attack becomes neutral and deals more damage.^000000",
		"[Level 1] : ^777777 MATK 230%/300%(Inspiration)^000000",
		"[Level 2] : ^777777 MATK 460%/600%(Inspiration)^000000",
		"[Level 3] : ^777777 MATK 690%/900%(Inspiration)^000000",
		"[Level 4] : ^777777 MATK 920%/1200%(Inspiration)^000000",
		"[Level 5] : ^777777 MATK 1150%/1500%(Inspiration)^000000",
		"[Level 6] : ^777777 MATK 1380%/1800%(Inspiration)^000000",
		"[Level 7] : ^777777 MATK 1610%/2100%(Inspiration)^000000",
		"[Level 8] : ^777777 MATK 1840%/2400%(Inspiration)^000000",
		"[Level 9] : ^777777 MATK 2070%/2700%(Inspiration)^000000",
		"[Level10] : ^777777 MATK 2300%/3000%(Inspiration)^000000"
	].join("\n");

	SkillDescription[SKID.LG_PIETY] = [
		"Piety",
		"Max Lv : 5",
		"^777777Skill Requirement : Faith 3 ^000000",
		"Skill Form : ^777777Active / Buff ^000000",
		"Description : ^777777Endows you or a party member and nearby party member's armors with Holy element. Consumes 2 Holy Waters.^000000",
		"[Lv 1] : ^777777Skill Duration 60 sec.^000000",
		"[Lv 2] : ^777777Skill Duration 80 sec.^000000",
		"[Lv 3] : ^777777Skill Duration 100 sec.^000000",
		"[Lv 4] : ^777777Skill Duration 120 sec.^000000",
		"[Lv 5] : ^777777Skill Duration 140 sec.^000000"
	].join("\n");

	SkillDescription[SKID.LG_EARTHDRIVE] = [
		"Earth Drive",
		"Max Lv : 5",
		"^777777Skill Requirement : Reflect Damage Reduction 3 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Shield Skill. Deals melee physical damge to targets around.",
		"Can remove some earth related magics. Can deal damage to enemies in Hiding.",
		"Damage increases based on BaseLv, STR and VIT.^000000",
		"[Level 1] : ^777777 ATK 380% / Area of Effect: 3 x 3^000000",
		"[Level 2] : ^777777 ATK 760% / Area of Effect : 3 x 3 ^000000",
		"[Level 3] : ^777777 ATK 1140% / Area of Effect : 5 x 5^000000",
		"[Level 4] : ^777777 ATK 1520% / Area of Effect : 5 x 5^000000",
		"[Level 5] : ^777777 ATK 1900% / Area of Effect : 7 x 7^000000"
	].join("\n");

	SkillDescription[SKID.LG_HESPERUSLIT] = [
		"Hesperus Lit",
		"Max Lv : 5",
		"^777777Skill Requirement : Prestige 3 / Banding 3 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Deals melee physical damage to 1 target.",
		"Damage increases based on BaseLv and VIT, deals more damage when Inspiration is active.^000000",
		"[Level 1] : ^777777 ATK 300%/450%(Inspiration)^000000",
		"[Level 2] : ^777777 ATK 600%/900%(Inspiration)^000000",
		"[Level 3] : ^777777 ATK 900%/1350%(Inspiration)^000000",
		"[Level 4] : ^777777 ATK 1200%/1800%(Inspiration)^000000",
		"[Level 5] : ^777777 ATK 1500%/2250%(Inspiration)^000000"
	].join("\n");

	SkillDescription[SKID.LG_INSPIRATION] = [
		"Inspiration",
		"Max Lv : 5",
		"^777777Skill Requirement : Shield Spell 3 / Ray of Genesis 4 / Piety 5 ^000000",
		"Skill Form : ^777777  Active / Self Buff ^000000",
		"Description : ^777777  Inspired by holy spirit. Temporarily increase HIT, State, ATK, MATK, and MaxHP.",
		"During the duration, character is immune to some buffs or status effects. Consumes HP and SP per 5 sec.",
		"Skill goes off when Duration is over or HP or SP becomes 0.",
		"Protected buff and Status Effect : Poison, Dark, Stun, Silence, Confusion, Stone, Sleep, Bleeding, Curse, Blazing, Freezing, Frozen, Fear, Toxin, Paralysis, Venom Bleed, Magic Mushroom, Death heart, Pyrexia, Oblivion, Deel Sleep, Frenzy, Masquerade (Body Painting, Innovation, Groomy, Ignorance, Laziness, Unlucky, Weakness)^000000",
		"[Level 1] : ^777777 HIT +12/ All State +6/ MaxHP +4%",
		"/ ATK +40/ MATK +40/ Duration 60 sec",
		"Consumes HP 3%, SP 4% per 5 sec.^000000",
		"[Level 2] : ^777777 HIT +24/ All State +12/ MaxHP +8%",
		"/ ATK +80/ MATK +80/ Duration 90 sec",
		"Consumes HP 2.5%, SP 3.5% per 5 sec.^000000",
		"[Level 3] : ^777777 HIT +36/ All State +18/ MaxHP +12%",
		"/ ATK +120/ MATK +120/ Duration 120 sec",
		"Consumes HP 2%, SP 3% per 5 sec.^000000",
		"[Level 4] : ^777777 HIT +48/ All State +24/ MaxHP +16%",
		"/ ATK +160/ MATK +160/ Duration 150 sec",
		"Consumes HP 1.5%, SP 2.5% per 5 sec.^000000",
		"[Level 5] : ^777777 HIT +60/ All State +30/ MaxHP +20%",
		"/ ATK +200/ MATK +200/ Duration 180 sec",
		"Consumes HP 1%, SP 2% per 5 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SR_DRAGONCOMBO] = [
		"Dragon Combo",
		"Max Lv : 10",
		"^777777Skill Requirement : Raging Trifecta Blow 5^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Kicks twice, inflicts Melee Physical Damage to a single target. Can use with Fallen Empire as a combo. ^000000",
		"[Level 1] : ^777777 ATK 180% / Chance to stun 2% ^000000",
		"[Level 2] : ^777777 ATK 260% / Chance to stun 3% ^000000",
		"[Level 3] : ^777777 ATK 340% / Chance to stun 4%^000000",
		"[Level 4] : ^777777 ATK 420% / Chance to stun 5%^000000",
		"[Level 5] : ^777777 ATK 500% / Chance to stun 6%^000000",
		"[Level 6] : ^777777 ATK 580% / Chance to stun 7% ^000000",
		"[Level 7] : ^777777 ATK 660% / Chance to stun 8%^000000",
		"[Level 8] : ^777777 ATK 740% / Chance to stun 9%^000000",
		"[Level 9] : ^777777 ATK 820% / Chance to stun 10%^000000",
		"[Level 10] : ^777777 ATK 900% / Chance to stun 11% ^000000"
	].join("\n");

	SkillDescription[SKID.SR_SKYNETBLOW] = [
		"Sky Blow",
		"Max Lv : 5",
		"^777777Skill Requirement : Dragon Combo 3^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Spinning blow that kicks up a storm, dealing damage to all targets in an area. Damage increases as BaseLv and AGI increases.  ^000000",
		"[Level 1] : ^777777 ATK 200%   ^000000",
		"[Level 2] : ^777777 ATK 400%  ^000000",
		"[Level 3] : ^777777 ATK 600%  ^000000",
		"[Level 4] : ^777777 ATK 800%  ^000000",
		"[Level 5] : ^777777 ATK 1000%  ^000000"
	].join("\n");

	SkillDescription[SKID.SR_EARTHSHAKER] = [
		"Earth Shaker",
		"Max Lv : 5",
		"^777777Skill Requirement : Dragon Combo 3^000000",
		"Skill Form : ^777777Active / Damage ^000000",
		"Description : ^777777Sends a shockwave through the ground damaging all targets in the area of effect, targets in Hide/Cloak will be revealed and receive additional damage.^000000",
		"^777777If the target is a monster, increase the skill damage of Rampage Blast to the target for 5 seconds. The caster's Str stat and base level increase the skill damage.^000000",
		"[Lv 1] : ^777777Range 3 x 3  cells / Atk 300% ^000000",
		"[Lv 2] : ^777777Range 5 x 5  cells / Atk 600% ^000000",
		"[Lv 3] : ^777777Range 7 x 7  cells / Atk 900%^000000",
		"[Lv 4] : ^777777Range 9 x 9  cells / Atk 1200% ^000000",
		"[Lv 5] : ^777777Range 11 x 11  cells / Atk 1500% ^000000"
	].join("\n");

	SkillDescription[SKID.SR_FALLENEMPIRE] = [
		"Fallen Empire",
		"Max Lv : 10",
		"^777777Skill Requirement : Dragon Combo 3 ^000000",
		"Skill Form : ^777777  Active / Damage(Special) ^000000",
		"Description : ^777777  Use your shoulders and fists to do an upwards blow to deal large damage.",
		"Can be casted after Dragon Combo, and can cast Tiger Cannon / Gate of Hell after.",
		"Damage increases based on BaseLv and caster's STR.",
		"Two Sphere is consumed when using the skill, and one Sphere is consumed from level 6. ^000000",
		"[Level 1] : ^777777 ATK 400%^000000",
		"[Level 2] : ^777777 ATK 700%^000000",
		"[Level 3] : ^777777 ATK 1000%^000000",
		"[Level 4] : ^777777 ATK 1300%^000000",
		"[Level 5] : ^777777 ATK 1600%^000000",
		"[Level 6] : ^777777 ATK 1900%^000000",
		"[Level 7] : ^777777 ATK 2200%^000000",
		"[Level 8] : ^777777 ATK 2500%^000000",
		"[Level 9] : ^777777 ATK 2800%^000000",
		"[Level10] : ^777777 ATK 3100%^000000"
	].join("\n");

	SkillDescription[SKID.SR_TIGERCANNON] = [
		"Tiger Cannon",
		"Max Lv : 10",
		"^777777Skill Requirement : Fallen Empire 3^000000",
		"Skill Form : ^777777  Active / Damage(Special) ^000000",
		"Description : ^777777  Deals special physical damage based on caster's MaxHP and MaxSP, to targets around the caster. Consumes 2 Spheres and it can only be used while in Critical Explosion.",
		"Can be used after Fallen Empire as a combo. ^000000",
		"[Level 1] : ^777777Area of Effect 5 x 5Cell/ MaxHP 12%/ MaxSP 6%^000000",
		"[Level 2] : ^777777Area of Effect 5 x 5Cell/ MaxHP 14%/ MaxSP 7%^000000",
		"[Level 3] : ^777777Area of Effect 5 x 5Cell/ MaxHP 16%/ MaxSP 8%^000000",
		"[Level 4] : ^777777Area of Effect 5 x 5Cell/ MaxHP 18%/ MaxSP 9%^000000",
		"[Level 5] : ^777777Area of Effect 5 x 5Cell/ MaxHP 20%/ MaxSP 10%^000000",
		"[Level 6] : ^777777Area of Effect 7 x 7Cell/ MaxHP 22%/ MaxSP 11%^000000",
		"[Level 7] : ^777777Area of Effect 7 x 7Cell/ MaxHP 24%/ MaxSP 12%^000000",
		"[Level 8] : ^777777Area of Effect 7 x 7Cell/ MaxHP 26%/ MaxSP 13%^000000",
		"[Level 9] : ^777777Area of Effect 7 x 7Cell/ MaxHP 28%/ MaxSP 14%^000000",
		"[Level 10] : ^777777Area of Effect 7 x 7Cell/ MaxHP 30%/ MaxSP 15%^000000"
	].join("\n");

	SkillDescription[SKID.SR_RAMPAGEBLASTER] = [
		"Rampage Blast",
		"Max Lv : 5",
		"^777777Skill Requirement : Earth Shaker 2 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777 Deals ranged physical damage to targets within 7 x 7 cells around the caster. Consumes 3 Spheres, and can be used when Critical Explosion is active.",
		"Damage increases based on caster's BaseLv and skill level of Critical Explosion.^000000",
		"[Level 1] : ^777777 ATK 350%(Normal)/ 550%(Earth Shaker)^000000",
		"[Level 2] : ^777777 ATK 700%(Normal)/1100%(Earth Shaker)^000000",
		"[Level 3] : ^777777 ATK1050%(Normal)/1650%(Earth Shaker)^000000",
		"[Level 4] : ^777777 ATK1400%(Normal)/2200%(Earth Shaker)^000000",
		"[Level 5] : ^777777 ATK1750%(Normal)/2750%(Earth Shaker)^000000"
	].join("\n");

	SkillDescription[SKID.SR_CRESCENTELBOW] = [
		"Crescent Elbow",
		"Max Lv : 5",
		"^777777Skill Requirement : Windmill 1  ^000000",
		"Skill Form : ^777777Active / Counterattack ^000000",
		"Description : ^777777Has a chance to counter an attack, deals damage and knocks back the enemy while taking part of the damage yourself when receiving physical attack. The higher the HP of the target, the more damage it deals. Consumes 2 spirit spheres. Does not work on MVP type monsters.^000000",
		"[Lv 1] : ^77777755% chance of proc / 3 second duration^000000",
		"[Lv 2] : ^77777760% chance of proc / 4 second duration^000000",
		"[Lv 3] : ^77777765% chance of proc / 5 second duration^000000",
		"[Lv 4] : ^77777770% chance of proc / 6 second duration^000000",
		"[Lv 5] : ^77777775% chance of proc / 7 second duration^000000"
	].join("\n");

	SkillDescription[SKID.SR_CURSEDCIRCLE] = [
		"Cursed Circle",
		"Max Lv : 5",
		"^777777Skill Requirement : Root 2 / Gentle Touch-Silence 2 ^000000",
		"Skill Form : ^777777Active / Special ^000000",
		"Description : ^777777While in Area of Effect, all enemies will be unable to move, attack and receive the Silence Status for the duration of the skill. If the caster uses any other skill, Cursed Circle will be cancelled. Consumes 1 spirit sphere per 1 target.^000000",
		"[Lv 1] : ^777777Range 3 x 3  cells / Duration 3 sec.  ^000000",
		"[Lv 2] : ^777777Range 3 x 3  cells / Duration 4 sec. ^000000",
		"[Lv 3] : ^777777Range 5 x 5  cells / Duration 5 sec. ^000000",
		"[Lv 4] : ^777777Range 5 x 5  cells / Duration 6 sec. ^000000",
		"[Lv 5] : ^777777Range 7 x 7  cells / Duration 7 sec. ^000000"
	].join("\n");

	SkillDescription[SKID.SR_LIGHTNINGWALK] = [
		"Lightning Walk",
		"Max Lv : 5",
		"^777777Skill Requirement : Windmill 1^000000",
		"Skill Form : ^777777Active Toggle / Special ^000000",
		"Description : ^777777When targeted with a ranged or magic attack (single target), there is a chance that you will immediately jump to the attacker. Cancels when the skill activates.^000000",
		"[Lv 1] : ^77777745% proc chance / 5 second duration^000000",
		"[Lv 2] : ^77777750% proc chance / 6 second duration^000000",
		"[Lv 3] : ^77777755% proc chance / 7 second duration^000000",
		"[Lv 4] : ^77777760% proc chance / 8 second duration^000000",
		"[Lv 5] : ^77777765% proc chance / 9 second duration^000000"
	].join("\n");

	SkillDescription[SKID.SR_KNUCKLEARROW] = [
		"Knuckle Arrow",
		"Max Lv : 10",
		"^777777Skill Requirement : Lightning Walk 1^000000",
		"Skill Form : ^777777Active / Damage ^000000",
		"Description : ^777777Instantly brings you and the target next to each other, damaging the target while knocking the target back. Deals additional damage if the target hits a wall or an obstacle during the knockback.",
		"The caster's base level increase the skill damage. Deals additional knock back damage to targets that have more weight. Boss monster that cannot be nocked back get additional skill damage.",
		"Consumes 1 spirit spheres and no spirit sphere from level 6.^000000",
		"[Lv 1] : ^777777Atk 600% / Knock back Damage 150% / Boss type Attack 700%^000000",
		"[Lv 2] : ^777777Atk 700% / Knock back Damage 300% / Boss type Attack 900%^000000",
		"[Lv 3] : ^777777Atk 800% / Knock back Damage 450% / Boss type Attack 1100%^000000",
		"[Lv 4] : ^777777Atk 900% / Knock back Damage 600% / Boss type Attack 1300%^000000",
		"[Lv 5] : ^777777Atk 1000% / Knock back Damage 750% / Boss type Attack 1500%^000000",
		"[Lv 6] : ^777777Atk 1100% / Knock back Damage 900% / Boss type Attack 1700%^000000",
		"[Lv 7] : ^777777Atk 1200% / Knock back Damage 1050% / Boss type Attack 1900%^000000",
		"[Lv 8] : ^777777Atk 1300% / Knock back Damage 1200% / Boss type Attack 2100%^000000",
		"[Lv 9] : ^777777Atk 1400% / Knock back Damage 1350% / Boss type Attack 2300%^000000",
		"[Lv 10] : ^777777Atk 1500% / Knock back Damage 1500% / Boss type Attack 2500%^000000"
	].join("\n");

	SkillDescription[SKID.SR_WINDMILL] = [
		"Windmill",
		"Max Lv : 1",
		"^777777Skill Requirement : Cursed Circle 1 ^000000",
		"Skill Form : ^777777Active / Damage ^000000",
		"Description : ^777777A low to the ground round kick that damages targets in a 5x5 area around you and forces them to sit. Monsters in the area will be stunned. Does not work on boss or MVP type monsters.^000000"
	].join("\n");

	SkillDescription[SKID.SR_RAISINGDRAGON] = [
		"Rising Dragon",
		"Max Lv : 10",
		"^777777Skill Requirement : Power Implantation 1 ^000000",
		"Skill Form : ^777777  Active / Buff ^000000",
		"Description : ^777777  Places a temporary buff on the user that extends the limit of Spirit Spheres the user can have,",
		"increases MaxHP and MaxSP based on skill level as a percentage, and applies all the effects of Fury..^000000",
		"[Level 1] : ^777777Spheres 6 / Duration 120 sec^000000",
		"[Level 2] : ^777777Spheres 7 / Duration 140 sec^000000",
		"[Level 3] : ^777777Spheres 8 / Duration 160 sec^000000",
		"[Level 4] : ^777777Spheres 9 / Duration 180 sec^000000",
		"[Level 5] : ^777777Spheres 10 / Duration 200 sec^000000",
		"[Level 6] : ^777777Spheres 11 / Duration 220 sec^000000",
		"[Level 7] : ^777777Spheres 12 / Duration 240 sec^000000",
		"[Level 8] : ^777777Spheres 13 / Duration 260 sec^000000",
		"[Level 9] : ^777777Spheres 14 / Duration 280 sec^000000",
		"[Level 10] : ^777777Spheres 15 / Duration 300 sec^000000"
	].join("\n");

	SkillDescription[SKID.SR_ASSIMILATEPOWER] = [
		"Power Absorb",
		"Max Lv : 1",
		"^777777Skill Requirement : Spiritual Sphere Absorption 1, Power Implantation 1 ^000000",
		"Skill Form : ^777777Active / Special ^000000",
		"Description : ^777777Absorb Spirit Spheres on all targets in a 5x5 area, recovering your SP^000000"
	].join("\n");

	SkillDescription[SKID.SR_POWERVELOCITY] = [
		"Power Implantation",
		"Max Lv : 1",
		"^777777Skill Requirement : Summon Spirit Sphere 5^000000",
		"Skill Form : ^777777Active / Special ^000000",
		"Description : ^777777Transfers all of your Spirit Spheres to the selected target.^000000"
	].join("\n");

	SkillDescription[SKID.SR_GATEOFHELL] = [
		"Gates of Hell",
		"Max Lv : 10",
		"^777777Skill Requirement : Rising Dragon 5 / Tiger Cannon 5 ^000000",
		"Skill Form : ^777777Active / Damage ^000000",
		"Description : ^777777Strikes the target with countless blows. The lower your HP, the more damage it deals. Consumes 2 Spirit Spheres and 100 SP. Can be used after Fallen Empire, in that case the damage is slightly higher.^000000"
	].join("\n");

	SkillDescription[SKID.SR_GENTLETOUCH_QUIET] = [
		"Gentle Touch-Silence",
		"Max Lv : 5",
		"^777777Skill Requirement : Basic Skill^000000",
		"Skill Form : ^777777Active / Damage and Debuff ^000000",
		"Description : ^777777Using the knowledge of pressure point techniques, you put the target on Silence status while dealing damage. Your Dex will greatly increase the damage.^000000",
		"[Lv 1] : ^777777Skill Range 2 cells / Atk 100% ^000000",
		"[Lv 2] : ^777777Skill Range 2 cells / Atk 200% ^000000",
		"[Lv 3] : ^777777Skill Range 2 cells / Atk 300% ^000000",
		"[Lv 4] : ^777777Skill Range 2 cells / Atk 400% ^000000",
		"[Lv 5] : ^777777Skill Range 2 cells / Atk 500% ^000000"
	].join("\n");

	SkillDescription[SKID.SR_GENTLETOUCH_CURE] = [
		"Gentle Touch-Cure",
		"Max Lv : 5",
		"^777777Skill Requirement : Gentle Touch-Silence 1 ^000000",
		"Skill Form : ^777777Active /  Recovery and Buff ^000000",
		"Description : ^777777Using the knowledge of pressure point techniques, you cure a target's Abnormal Status and recovers the target's HP. The higher the skill level the higher the chance of success. Can recover Petrify, Frozen, Stun, Poison, Silence, Blind, Hallucination. Caster can recover from Petrify, Frozen and Stun. Consumes 1 Spirit Sphere.^000000"
	].join("\n");

	SkillDescription[SKID.SR_GENTLETOUCH_ENERGYGAIN] = [
		"Gentle Touch-Energy Gain",
		"Max Lv : 5",
		"^777777Skill Requirement : Gentle Touch-Cure 1 ^000000",
		"Skill Form : ^777777Active / Buff (To yourself) ^000000",
		"Description : ^777777Use the knowledge of pressure point techniques, to improve your fighting spirit which allows you to the chance to gain a spirit sphere when you deal or receive physical damage.",
		"Increase damage of Raging Thrust, Chain Crush Combo, Glacier Fist while consuming HP.^000000",
		"[Lv 1] : ^777777HP 1% Consumption / Chance to gain Spirit Sphere 15% ^000000",
		"[Lv 2] : ^777777HP 2% Consumption / Chance to gain Spirit Sphere 20% ^000000",
		"[Lv 3] : ^777777HP 3% Consumption / Chance to gain Spirit Sphere 25% ^000000",
		"[Lv 4] : ^777777HP 4% Consumption / Chance to gain Spirit Sphere 30% ^000000",
		"[Lv 5] : ^777777HP 5% Consumption / Chance to gain Spirit Sphere 35% ^000000"
	].join("\n");

	SkillDescription[SKID.SR_GENTLETOUCH_CHANGE] = [
		"Gentle Touch-Convert",
		"Max Lv : 5",
		"^777777Skill Requirement : Gentle Touch-Energy Gain 3 ^000000",
		"Skill Form : ^777777Active /  Buff ^000000",
		"Description : ^777777Using the knowledge of pressure point techniques, increase attack and attack speed and skill damage of Rampage Blast and Knuckle Arrow. Consumes 1 Spirit Sphere and some HP. This skill cannot be used in combination with Gentle Touch-Revitalize.^000000",
		"[Lv 1] : ^777777HP 1% Consumption / ATK + 8 / ATK + 1%^000000",
		"[Lv 2] : ^777777HP 2% Consumption / ATK +16 / ATK + 2%^000000",
		"[Lv 3] : ^777777HP 3% Consumption / ATK +24 / ATK + 3%^000000",
		"[Lv 4] : ^777777HP 4% Consumption / ATK +32 / ATK + 4%^000000",
		"[Lv 5] : ^777777HP 5% Consumption / ATK +40 / ATK + 5%^000000"
	].join("\n");

	SkillDescription[SKID.SR_GENTLETOUCH_REVITALIZE] = [
		"Gentle Touch-Revitalize",
		"Max Lv : 5",
		"^777777Skill Requirement : Gentle Touch-Energy Gain 3 ^000000",
		"Skill Form : ^777777Active / Buff ^000000",
		"Description : ^777777Using the knowledge of pressure point techniques, your attack speed, MaxHP and DEF increases while improving your natural and skill HP recovery. HP can be recovered while moving or attacking. This skill cannot be used in combination with Gentle Touch-Energy Gain or Gentle Touch-Convert. Consumes 1 Spirit Spheres.^000000",
		"[Lv 1] : ^777777MaxHP increases by 2% / DEF + 20 / HP Recovery Speed increases by 80%^000000",
		"[Lv 2] : ^777777MaxHP increases by 4% / DEF + 40 / HP Recovery Speed increases by 110%^000000",
		"[Lv 3] : ^777777MaxHP increases by 6% / DEF + 60 / HP Recovery Speed increases by 140%^000000",
		"[Lv 4] : ^777777MaxHP increases by 8% / DEF + 80 / HP Recovery Speed increases by 170%^000000",
		"[Lv 5] : ^777777MaxHP increases by 10% / DEF + 100 / HP Recovery Speed increases by 200% ^000000"
	].join("\n");

	SkillDescription[SKID.WA_SWING_DANCE] = [
		"Swing Dance",
		"Max Lv : 5",
		"^777777Skill Requirement : Deep Sleep Lullaby 1 ^000000",
		"Skill Form : ^777777  Active / Buff ^000000",
		"Description : ^777777 Whips Weapon Skill. 31 X 31 Cell, increases party members' movement speed, ASPD based on status, reduces fixed casting. ASPD is based on caster's Lesson skill level.  ^000000",
		"[Level 1] : ^777777 Increases ASPD 5%, Additional increase based on caster's Lesson level / Reduces fixed casting by 6%. ^000000",
		"[Level 2] : ^777777 Increases ASPD 10%, Additional increase based on caster's Lesson level. / Reduces fixed casting by 12%. ^000000",
		"[Level 3] : ^777777 Increases ASPD 15%, Additional increase based on caster's Lesson level. / Reduces fixed casting by 18%.^000000",
		"[Level 4] : ^777777 Increases ASPD 20%, Additional increase based on caster's Lesson level. / Reduces fixed casting by 24%. ^000000",
		"[Level 5] : ^777777 Increases ASPD 25%, Additional increase based on caster's Lesson level. / Reduces fixed casting by 30%.^000000"
	].join("\n");

	SkillDescription[SKID.WA_SYMPHONY_OF_LOVER] = [
		"Lover Symphony",
		"Max Lv : 5",
		"^777777Skill Requirement : Deep Sleep Lullaby 1 ^000000",
		"Skill Form : ^777777  Active / Buff ^000000",
		"Description : ^777777 Whips Weapon Skill. 31 X 31 Cell, increases party members' magic armor and resistance to Holy and Ghost property. ^000000",
		"[Level 1] : ^777777 MDEF + 2%, Property Resistance + 3%  ^000000",
		"[Level 2] : ^777777 MDEF + 4%, Property Resistance + 6%  ^000000",
		"[Level 3] : ^777777 MDEF + 6%, Property Resistance + 9%  ^000000",
		"[Level 4] : ^777777 MDEF + 8%, Property Resistance + 12%  ^000000",
		"[Level 5] : ^777777 MDEF + 10%, Property Resistance + 15%  ^000000"
	].join("\n");

	SkillDescription[SKID.WA_MOONLIT_SERENADE] = [
		"Moonlight Serenade",
		"Max Lv : 5",
		"^777777Skill Requirement : Deep Sleep Lullaby 1 ^000000",
		"Skill Form : ^777777  Active / Buff ^000000",
		"Description : ^777777 Whips Weapon Skill. 31 X 31 Cell, increases party members' MATK. It does not overlap with other Wanderer's Dance Skill and can only be used when caster's equipping whips. MATK increases based on Lesson Skill and BaseLv. ^000000",
		"[Level 1] : ^777777 MATK + 7, Additional increase based on caster's Lesson level. ^000000",
		"[Level 2] : ^777777 MATK + 10, Additional increase based on caster's Lesson level. ^000000",
		"[Level 3] : ^777777 MATK + 13, Additional increase based on caster's Lesson level. ^000000",
		"[Level 4] : ^777777 MATK + 15, Additional increase based on caster's Lesson level. ^000000",
		"[Level 5] : ^777777 MATK + 20, Additional increase based on caster's Lesson level. ^000000"
	].join("\n");

	SkillDescription[SKID.MI_RUSH_WINDMILL] = [
		"Windmill Rush",
		"Max Lv : 5",
		"^777777Skill Requirement : Deep Sleep Lullaby 1 ^000000",
		"Skill Form : ^777777  Active / Buff ^000000",
		"Target : ^777777  Party members in area ^000000",
		"Description : ^777777 Instrument Weapon Skill. 31 X 31 Cell, increases party member's ATK and movement speed. It does not overlap with other Minstrel's Instrumental Skill and can only be used when caster's equipping instruments. Effect increases bassd on Lesson level. ^000000",
		"[Level 1] : ^777777 ATK + 7, increases based on caster's Lesson level. ^000000",
		"[Level 2] : ^777777 ATK + 10, increases based on caster's Lesson level. ^000000",
		"[Level 3] : ^777777 ATK + 13, increases based on caster's Lesson level. ^000000",
		"[Level 4] : ^777777 ATK + 15, increases based on caster's Lesson level. ^000000",
		"[Level 5] : ^777777 ATK + 20, increases based on caster's Lesson level. ^000000"
	].join("\n");

	SkillDescription[SKID.MI_ECHOSONG] = [
		"Echo Song",
		"Max Lv : 5",
		"^777777Skill Requirement : Deep Sleep Lullaby 1 ^000000",
		"Skill Form : ^777777Active / Buff ^000000",
		"Description : ^777777Increases the defense of the caster",
		"and party members for 60 seconds. This is",
		"increased by 1% per level of Voice Lessons and",
		"by 0.2% per Job Level of the caster.",
		"Requires an instrument to cast.^000000",
		"[Lv 1] : ^777777Def +6% / Skill Range 15 x 15  ^000000",
		"[Lv 2] : ^777777Def +12% / Skill Range 17 x 17  ^000000",
		"[Lv 3] : ^777777Def +18% / Skill Range 19 x 19  ^000000",
		"[Lv 4] : ^777777Def +24% / Skill Range 21 x 21  ^000000",
		"[Lv 5] : ^777777Def +30% / Skill Range 23 x 23  ^000000"
	].join("\n");

	SkillDescription[SKID.MI_HARMONIZE] = [
		"Harmonize",
		"Max Lv : 5",
		"^777777Skill Requirement : Deep Sleep Lullaby 1 ^000000",
		"Skill Form : ^777777Active / Buff ^000000",
		"Description : ^777777Enter a state of harmony with",
		"another player or monster. Equalize all bonus",
		"stats of caster and 1 target for 60 seconds.",
		"Requires an instrument to cast.^000000",
		"[Lv 1] : ^777777All bonus stats become 3-5 ^000000",
		"[Lv 2] : ^777777All bonus stats become 5-7  ^000000",
		"[Lv 3] : ^777777All bonus stats become 7-9  ^000000",
		"[Lv 4] : ^777777All bonus stats become 9-11  ^000000",
		"[Lv 5] : ^777777All bonus stats become 11-15 ^000000"
	].join("\n");

	SkillDescription[SKID.WM_LESSON] = [
		"Voice Lessons",
		"Max Lv : 10",
		"^777777Skill Requirement : Wanderer/Maestro Basic Skill^000000",
		"Skill Form : ^777777 Passive ^000000",
		"Description : ^777777Increases MaxSP and SP recovery",
		"for each level learned.",
		"If skill is level 5 or higher, allows the",
		"Wanderer/Maestro to use Third Class skills",
		"while performing Second Class dances, songs,",
		"or ensembles",
		"[Lv 1] : ^777777MaxSP +30, recover 6 SP every 10 secs^000000",
		"[Lv 2] : ^777777MaxSP +60, recover 9 SP every 10 secs^000000",
		"[Lv 3] : ^777777MaxSP +90, recover 12 SP every 10 secs^000000",
		"[Lv 4] : ^777777MaxSP +120, recover 15 SP every 10 secs^000000",
		"[Lv 5] : ^777777MaxSP +150, recover 18 SP every 10 secs^000000",
		"[Lv 6] : ^777777MaxSP +180, recover 21 SP every 10 secs^000000",
		"[Lv 7] : ^777777MaxSP +200, recover 24 SP every 10 secs^000000",
		"[Lv 8] : ^777777MaxSP +240, recover 27 SP every 10 secs^000000",
		"[Lv 9] : ^777777MaxSP +270, recover 30 SP every 10 secs^000000",
		"[Lv 10] : ^777777MaxSP +300, recover 33 SP every 10 secs^000000"
	].join("\n");

	SkillDescription[SKID.WM_METALICSOUND] = [
		"Metalic Sound",
		"Max Lv : 10",
		"^777777Skill Requirement : Reverberation 5 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777 Generates a high-frequency sound wave to 1 target and deals neutral magical damage. Deals more damage to enemies in sleep.",
		"Damage increases as BaseLv increases. Additional damage: Voice Lesson skill level x 60%.^000000",
		"[Level 1] : ^777777 MATK 120% + Lesson level x 60% ^000000",
		"[Level 2] : ^777777 MATK 240% + Lesson level x 60% ^000000",
		"[Level 3] : ^777777 MATK 360% + Lesson level x 60% ^000000",
		"[Level 4] : ^777777 MATK 480% + Lesson level x 60% ^000000",
		"[Level 5] : ^777777 MATK 600% + Lesson level x 60% ^000000",
		"[Level 6] : ^777777 MATK 720% + Lesson level x 60% ^000000",
		"[Level 7] : ^777777 MATK 840% + Lesson level x 60% ^000000",
		"[Level 8] : ^777777 MATK 960% + Lesson level x 60% ^000000",
		"[Level 9] : ^777777 MATK1080% + Lesson level x 60% ^000000",
		"[Level10] : ^777777 MATK1200% + Lesson level x 60% ^000000"
	].join("\n");

	SkillDescription[SKID.WM_REVERBERATION] = [
		"Reverberation",
		"Max Lv : 5",
		"^777777Skill Requirement : Dissonance or Ugly Dance 5 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777Skills for Whips and Instruments.",
		"Shoots multiple arrows that generate high-frequency sound wave, and deals magical damage to all targets in 5 x 5 Area of Effect. Damage property follows the property of the equipped arrow.",
		"Damage increases as BaseLv increases.",
		"Consumes 5 arrows, cannot be casted when caster has less than 5 arrow.^000000",
		"[Level 1] : ^777777 MATK 1000%^000000",
		"[Level 2] : ^777777 MATK 1300%^000000",
		"[Level 3] : ^777777 MATK 1600%^000000",
		"[Level 4] : ^777777 MATK 1900%^000000",
		"[Level 5] : ^777777 MATK 2200%^000000"
	].join("\n");

	SkillDescription[SKID.WM_DEADHILLHERE] = [
		"Death Valley",
		"Max Lv : 5",
		"^777777Skill Requirement : Circle of Nature 3 ^000000",
		"Skill Form : ^777777Active / Recovery ^000000",
		"Description : ^777777Recite a sacred poem to revive a",
		"dead companion. The revived player will have HP",
		"equal to the SP they had while dead. If the player",
		"had 0 SP before revival, they will be has 1 HP.",
		"An instrument/whip is required to cast this skill,",
		"and consumes 1 Regrettable Tear.^000000",
		"[Lv 1] : ^777777Chance of Success 90%",
		"Consume 50% SP from revival target ^000000",
		"[Lv 2] : ^777777Chance of Success 92%",
		"Consume 40% SP from revival target  ^000000",
		"[Lv 3] : ^777777Chance of Success 94%",
		"Consume 30% SP from revival target  ^000000",
		"[Lv 4] : ^777777Chance of Success 96%",
		"Consume 20% SP from revival target  ^000000",
		"[Lv 5] : ^777777Chance of Success 98%",
		"Consume 10% SP from revival target  ^000000"
	].join("\n");

	SkillDescription[SKID.WM_SEVERE_RAINSTORM] = [
		"Severe Rainstorm",
		"Max Lv : 5",
		"^777777Skill Requirement : Throw Arrow Or Musical Strike 5 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777 Bow, Whips, Instrument skill.",
		"Shoots a volley of arrows into the air and rain down arrows on enemies in a 11 x 11 area, dealing damage 12 times.",
		"Damage increases based on BaseLv and AGI / DEX.",
		"Consumes 10 arrows, cannot be casted when caster has less than 10 arrow.",
		"Damage increases when whips or instrument is equipped.^000000",
		"[Level 1] : ^777777 ATK 100%(Bow)/120%(Instrument/Whips)^000000",
		"[Level 2] : ^777777 ATK 200%(Bow)/240%(Instrument/Whips)^000000",
		"[Level 3] : ^777777 ATK 300%(Bow)/360%(Instrument/Whips)^000000",
		"[Level 4] : ^777777 ATK 400%(Bow)/480%(Instrument/Whips)^000000",
		"[Level 5] : ^777777 ATK 500%(Bow)/600%(Instrument/Whips)^000000"
	].join("\n");

	SkillDescription[SKID.WM_POEMOFNETHERWORLD] = [
		"Song of Despair",
		"Max Lv : 5",
		"^777777Skill Requirement : Voice Lessons 1 ^000000",
		"Skill Form : ^777777Active / Debuff ^000000",
		"Description : ^777777Generate a sound wave on the",
		"ground that will immobilize  1 enemy within a",
		"3x3 area. A Maximum of 5 can be placed at the same",
		"time. Does not work against MVP type monsters.",
		"Requires an instrument or whip to cast.",
		"Consumes 1 Throat Lozenge.^000000",
		"[Lv 1] : ^777777Effect Duration 8 sec. / Sound Wave Duration 9 sec. ^000000",
		"[Lv 2] : ^777777Effect Duration 10 sec. / Sound Wave Duration 11 sec. ^000000",
		"[Lv 3] : ^777777Effect Duration 12 sec. / Sound Wave Duration 13 sec. ^000000",
		"[Lv 4] : ^777777Effect Duration 14 sec. / Sound Wave Duration 15 sec. ^000000",
		"[Lv 5] : ^777777Effect Duration 16 sec. / Sound Wave Duration 17 sec. ^000000"
	].join("\n");

	SkillDescription[SKID.WM_VOICEOFSIREN] = [
		"Siren's Voice",
		"Max Lv : 5",
		"^777777Skill Requirement : Song of Despair 3 ^000000",
		"Skill Form : ^777777Active / Debuff ^000000",
		"Description : ^777777Tempt all enemies that are within",
		"range to fall hopelessly in love with the Caster.",
		"Monsters will be unable to attack or target the",
		"caster with skills.",
		"Affected targets will display a 'Heart' emoticon.",
		"The duration of this skill is reduced based on the",
		"target's base level and the skill is cancelled once",
		"the target receives damage.",
		"An instrument/whip is required to cast this skill.^000000",
		"[Lv 1] : ^777777Skill Range 5 x 5 / Skill Duration 15 sec.^000000",
		"[Lv 2] : ^777777Skill Range 7 x 7 / Skill Duration 18 sec.^000000",
		"[Lv 3] : ^777777Skill Range 9 x 9 / Skill Duration 21 sec.^000000",
		"[Lv 4] : ^777777Skill Range 11 x 11 / Skill Duration 24 sec.^000000",
		"[Lv 5] : ^777777Skill Range 13 x 13 / Skill Duration 27 sec.^000000"
	].join("\n");

	SkillDescription[SKID.WM_LULLABY_DEEPSLEEP] = [
		"Deep Sleep Lullaby",
		"Max Lv : 5",
		"^777777Skill Requirement : Voice Lessons 1 ^000000",
		"Skill Form : ^777777Active / Debuff ^000000",
		"Target: ^777777 Enemy Player and around ^000000",
		"Description : ^777777Force all targets in a certain range",
		"into a 'Deep Sleep' state.  Once, the targets are in",
		"a 'Deep Sleep', they are unable to move, attack,",
		"use items, skills or chat. The effect is cancelled",
		"if the targets receive damage. Targets in",
		"'Deep Sleep' will also take 1.5x greater damage",
		"from the next attack. Affected targets will also",
		"recover 3% of HP/SP every 2 seconds.",
		"and consumes 2 Regrettable Tear.",
		"Requires an instrument/whip to cast.^000000",
		"[Lv 1] : ^777777Range 3 x 3 ^000000",
		"[Lv 2] : ^777777Range 3 x 3 ^000000",
		"[Lv 3] : ^777777Range 3 x 3 ^000000",
		"[Lv 4] : ^777777Range 5 x 5 ^000000",
		"[Lv 5] : ^777777Range 5 x 5 ^000000"
	].join("\n");

	SkillDescription[SKID.WM_SIRCLEOFNATURE] = [
		"Circle of Nature",
		"Max Lv : 5",
		"^777777Skill Requirement : Voice Lessons 1 ^000000",
		"Skill Form : ^777777Active / Recovery ^000000",
		"Target: ^777777 Party member in range ^000000",
		"Description : ^777777Display the power of the Circle of",
		"Nature by increasing HP regeneration rate from all",
		"party members within range.",
		"Increasing range and skill effect as caster's skill level of Lesson additionally.",
		"An instrument/whip is required to cast this skill.^000000",
		"[Lv 1] : ^777777Skill Range 31 x 31 / HP regeneration rate +50%^000000",
		"[Lv 2] : ^777777Skill Range 31 x 31 / HP regeneration rate +100%^000000",
		"[Lv 3] : ^777777Skill Range 31 x 31 / HP regeneration rate +150%^000000",
		"[Lv 4] : ^777777Skill Range 31 x 31 / HP regeneration rate +200%^000000",
		"[Lv 5] : ^777777Skill Range 31 x 31 / HP regeneration rate +250%^000000"
	].join("\n");

	SkillDescription[SKID.WM_RANDOMIZESPELL] = [
		"Improvised Song",
		"Max Lv : 5",
		"^777777Skill Requirement : Song of Despair 1 ^000000",
		"Skill Form : ^777777Active / Special ^000000",
		"Target: ^777777All players except for caster^000000",
		"Description : ^777777  Use unknown language to remove higher level chorus effect from targeted player. Success rate increases based on skill level.^000000",
		"[Lv 1] : ^777777 Success rate: 40% ^000000",
		"[Lv 2] : ^777777 Success rate: 50% ^000000",
		"[Lv 3] : ^777777 Success rate: 60% ^000000",
		"[Lv 4] : ^777777 Success rate: 70% ^000000",
		"[Lv 5] : ^777777 Success rate: 80% ^000000"
	].join("\n");

	SkillDescription[SKID.WM_GLOOMYDAY] = [
		"Gloomy Shyness",
		"Max Lv : 5",
		"^777777Skill Requirement : Improvised Song 1 ^000000",
		"Skill Form : ^777777Active / Buff ^000000",
		"Target : ^777777Enemy Player^000000",
		"Description : ^777777Increase Enemy Player's SP consumption and fixed casting time.",
		"Sometimes too much depression reduces moving speed.",
		"And sometimes the riding Pecopeco, Dragon or Gryphon can run away.",
		"This skill is available only on PvP area.",
		"Requires an instrument/whip to cast.^000000",
		"[Lv 1] : ^777777Fixed Casting Time +0.5sec / SP consumption +10%^000000",
		"[Lv 2] : ^777777Fixed Casting Time +1.0sec / SP consumption +20%^000000",
		"[Lv 3] : ^777777Fixed Casting Time +1.5sec / SP consumption +30%^000000",
		"[Lv 4] : ^777777Fixed Casting Time +2.0sec / SP consumption +40%^000000",
		"[Lv 5] : ^777777Fixed Casting Time +2.5sec / SP consumption +50%^000000"
	].join("\n");

	SkillDescription[SKID.WM_GREAT_ECHO] = [
		"Great Echo",
		"Max Lv : 5",
		"^777777Skill Requirement : Metallic Sound 1 ^000000",
		"Skill Form : ^777777Active / Damage / Chorus ^000000",
		"Target : ^777777Player(Enemy), Monster^000000",
		"Description : ^777777  Caster creates a huge echo that inflicts damage to all targets in area of effect. Damage increases based on BaseLv and Voice Lesson level. Damage dealt will be doubled when the partner is in same party. Consumes 2 Throat Lozenge when using the skill. ^000000",
		"[Level 1] : ^777777 AoE 5 x 5 / ATK 750% ^000000",
		"[Level 2] : ^777777 AoE 7 x 7 / ATK 1250%^000000",
		"[Level 3] : ^777777 AoE 7 x 7 / ATK 1750% ^000000",
		"[Level 4] : ^777777 AoE 9 x 9 / ATK 2250% ^000000",
		"[Level 5] : ^777777 AoE 9 x 9 / ATK 2750% ^000000"
	].join("\n");

	SkillDescription[SKID.WM_SONG_OF_MANA] = [
		"Song Of Mana",
		"Max Lv : 5",
		"^777777Skill Requirement : Harmonize / Swing Dance,",
		"Windmill Rush / Lover Symphony & Echo Song /",
		"Moonlight Serenade 1^000000",
		"Skill Form : ^777777Active / Buff / Chorus ^000000",
		"Description : ^777777The caster and at least one other",
		"Wanderer/Maestro in the party, sing for Mana,",
		"asking for increased circulation. Recovers % of MaxSP",
		"of the caster and party members and increase SP regeneration rate.",
		"SP recovery amount and regeneration speed is increased based on the skill level of Lesson.",
		"Consume 1 [Throat Lozenge].",
		"Requires an instrument/whip to cast.^000000",
		"[Lv 1] : ^777777Skill Range 11 x 11 / Recovery 10% of MaxSP / SP regeneration rate +50% ^000000",
		"[Lv 2] : ^777777Skill Range 13 x 13 / Recovery 10% of MaxSP / SP regeneration rate +100% ^000000",
		"[Lv 3] : ^777777Skill Range 15 x 15 / Recovery 15% of MaxSP / SP regeneration rate +150% ^000000",
		"[Lv 4] : ^777777Skill Range 17 x 17 / Recovery 15% of MaxSP / SP regeneration rate +200% ^000000",
		"[Lv 5] : ^777777Skill Range 19 x 19 / Recovery 20% of MaxSP / SP regeneration rate +250% ^000000"
	].join("\n");

	SkillDescription[SKID.WM_DANCE_WITH_WUG] = [
		"Dances with Wargs",
		"Max Lv : 5",
		"^777777Skill Requirement : Harmonize / Swing Dance,",
		"Windmill Rush / Lover Symphony & Echo Song /",
		"Moonlight Serenade 1  ^000000",
		"Skill Form : ^777777Active / Buff / Chorus ^000000",
		"Target : Party member in range",
		"Description : ^777777Reduces self and party member's",
		"Fixed Cast Time and increases ASPD.",
		"And increase party member's ranged physical attack, and attack using Warg as well.",
		"Consume 1 [Throat Lozenge].",
		"Requires an instrument/whip to cast.^000000",
		"[Lv 1] : ^777777Skill Range 11 x 11 / Fixed Casting Time -30%, ASPD +5%, Ranged Damage +1% ^000000",
		"[Lv 2] : ^777777Skill Range 13 x 13 / Fixed Casting Time -40%, ASPD +10%, Ranged Damage +2% ^000000",
		"[Lv 3] : ^777777Skill Range 15 x 15 / Fixed Casting Time -50%, ASPD +15%, Ranged Damage +3% ^000000",
		"[Lv 4] : ^777777Skill Range 17 x 17 / Fixed Casting Time -60%, ASPD +20%, Ranged Damage +4% ^000000",
		"[Lv 5] : ^777777Skill Range 19 x 19 / Fixed Casting Time -70%, ASPD +25%, Ranged Damage +5% ^000000"
	].join("\n");

	SkillDescription[SKID.WM_SOUND_OF_DESTRUCTION] = [
		"Song of Destruction",
		"Max Lv : 5",
		"^777777Skill Requirement : Saturday Night Fever 3,",
		"Sinking Melody 3  ^000000",
		"Skill Form : ^777777Active / Special / Chorus ^000000",
		"Target : Enemy player in range",
		"Description : ^777777It doubles all damage for 10 seconds to surrounding enemy players, centering on the caster.",
		"The effect does not disappear when damaged",
		"Increasing duration time as caster's skill level of Lesson additionally.",
		"Consume 10 [Throat Lozenge].",
		"Only usable in PVP/WoE",
		"Requires an instrument/whip to cast.^000000",
		"[Lv 1] : ^777777Effective range 11x11^000000",
		"[Lv 2] : ^777777Effective range 11x11^000000",
		"[Lv 3] : ^777777Effective range 13x13^000000",
		"[Lv 4] : ^777777Effective range 13x13^000000",
		"[Lv 5] : ^777777Effective range 15x15^000000"
	].join("\n");

	SkillDescription[SKID.WM_SATURDAY_NIGHT_FEVER] = [
		"Saturday Night Fever",
		"Max Lv : 5",
		"^777777Skill Requirement : Dances with Wargs 1 ^000000",
		"Skill Form : ^777777Active / Special / Chorus ^000000",
		"Description : ^777777When sung by the caster and at",
		"least one other Maestro/Wanderer, all players in",
		"range of the caster will be compelled to disco",
		"and enter a limited Frenzy state. Frenzied",
		"targets will continuously lose HP and SP as well",
		"as lose Flee and Hit. Item",
		"usage is disabled, and those affected will be",
		"forced to sit on the ground for 3 seconds after",
		"the Frenzy wears off.",
		"Increasing success rate as caster's skill level of Lesson additionally.",
		"Consume 5 [Throat Lozenge].",
		"Only usable in PVP/WoE",
		"Requires an instrument/whip to cast.^000000",
		"[Lv 1] : ^777777Skill Range 9x9 / HIT -100 / FLEE -50 ^000000",
		"[Lv 2] : ^777777Skill Range 9x9 / HIT -150 / FLEE -80 ^000000",
		"[Lv 3] : ^777777Skill Range 11x11 / HIT -200 / FLEE -110 ^000000",
		"[Lv 4] : ^777777Skill Range 11x11 / HIT -250 / FLEE -140 ^000000",
		"[Lv 5] : ^777777Skill Range 13x13 / HIT -300 / FLEE -170 ^000000"
	].join("\n");

	SkillDescription[SKID.WM_LERADS_DEW] = [
		"Lerad's Dew",
		"Max Lv : 5",
		"^777777Skill Requirement : Swing Dance/Harmonize,",
		"Lover Symphony/Windmill Rush,",
		"Moonlight Serenade/Echo Song 1  ^000000",
		"Skill Form : ^777777Active / Buff / Chorus ^000000",
		"Target : Party member in range",
		"Description : ^777777When sung by the caster at least",
		"one other Wanderer/Maestro in the party, Lerad's",
		"Dew will increase the MaxHP of all surrounding",
		"party members. This skill does not affect",
		"characters who are in Frenzy.",
		"Increasing MaxHP as caster's skill level of Lesson additionally.",
		"Consume 1 [Throat Lozenge].",
		"Requires an instrument/whip to cast.^000000",
		"[Lv 1] : ^777777Range 11x11 / MaxHP +5%^000000",
		"[Lv 2] : ^777777Range 11x11 / MaxHP +8%^000000",
		"[Lv 3] : ^777777Range 13x13 / MaxHP +11%^000000",
		"[Lv 4] : ^777777Range 13x13 / MaxHP +14%^000000",
		"[Lv 5] : ^777777Range 15x15 / MaxHP +17%^000000"
	].join("\n");

	SkillDescription[SKID.WM_MELODYOFSINK] = [
		"Sinking Melody",
		"Max Lv : 5",
		"^777777Skill Requirement : Song Of Mana 1^000000",
		"Skill Form : ^777777Active / Buff / Chorus ^000000",
		"Target : Enemy player in range",
		"Description : ^777777Decrease MaxSP and INT of enemy players around the caster.",
		"Increasing success rate as caster's skill level of Lesson additionally.",
		"Consume 2 [Throat Lozenge].",
		"Only usable in PVP/WoE",
		"Requires an instrument/whip to cast.^000000",
		"[Lv 1] : ^777777Success Chance 10% / Increasing Caster's skill level of Lesson additionally.000000",
		"[Lv 2] : ^777777Success Chance 15% / Increasing Caster's skill level of Lesson additionally.^000000",
		"[Lv 3] : ^777777Success Chance 20% / Increasing Caster's skill level of Lesson additionally.^000000",
		"[Lv 4] : ^777777Success Chance 25% / Increasing Caster's skill level of Lesson additionally.^000000",
		"[Lv 5] : ^777777Success Chance 30% / Increasing Caster's skill level of Lesson additionally.^000000"
	].join("\n");

	SkillDescription[SKID.WM_BEYOND_OF_WARCRY] = [
		"Warcry from Beyond",
		"Max Lv : 5",
		"^777777Skill Requirement : Lerad's Dew 1^000000",
		"Skill Form : ^777777Active / Buff / Chorus ^000000",
		"Target : Enemy player in range",
		"Description : ^777777Decrease MaxHP and STR of enemy players around the caster.",
		"Increasing success rate and skill effect as caster's skill level of Lesson additionally.",
		"Consume 2 [Throat Lozenge].",
		"Only usable in PVP/WoE",
		"Requires an instrument/whip to cast.^000000",
		"[Lv 1] : ^777777Success Chance 15% / Increasing Caster's skill level of Lesson additionally.^000000",
		"[Lv 2] : ^777777Success Chance 18% / Increasing Caster's skill level of Lesson additionally.^000000",
		"[Lv 3] : ^777777Success Chance 21% / Increasing Caster's skill level of Lesson additionally.^000000",
		"[Lv 4] : ^777777Success Chance 24% / Increasing Caster's skill level of Lesson additionally.^000000",
		"[Lv 5] : ^777777Success Chance 27% / Increasing Caster's skill level of Lesson additionally.^000000"
	].join("\n");

	SkillDescription[SKID.WM_UNLIMITED_HUMMING_VOICE] = [
		"Infinite Humming",
		"Max Lv : 5",
		"^777777Skill Requirement : Song of Destruction 1 , Warcry from Beyond 1^000000",
		"Skill Form : ^777777  Active / Buff / Chorus^000000",
		"Tarket : ^777777  Party member in range^000000",
		"Description : ^777777  Requires an instrument/whip to cast. Increases all property magical damage of party members around caster including yourself. Increases skill effect as caster's skill level of Lesson additionally. Consume 5 [Throat Lozenge]  ^000000",
		"[Level 1] : ^777777 Range 11 x 11 / All property magical damage +4%, Increasing Caster's skill level of Lesson additionally.^000000",
		"[Level 2] : ^777777 Range 11 x 11 / All property magical damage +8%, Increasing Caster's skill level of Lesson additionally.^000000",
		"[Level 3] : ^777777 Range 13 x 13 / All property magical damage +12%, Increasing Caster's skill level of Lesson additionally.^000000",
		"[Level 4] : ^777777 Range 13 x 13 / All property magical damage +16%, Increasing Caster's skill level of Lesson additionally.^000000",
		"[Level 5] : ^777777 Range 15 x 15 / All property magical damage +20%, Increasing Caster's skill level of Lesson additionally.^000000"
	].join("\n");

	SkillDescription[SKID.SO_FIREWALK] = [
		"Fire Walk",
		"Max Lv : 5",
		"^777777Skill Requirement : Volcano 1 ^000000",
		"Skill Form : ^777777Active / Special / Damage ^000000",
		"Description : ^777777Creates a trail of fire behind the Caster, dealing Fire element damage to enemies that walk on it.^000000",
		"[Lv 1] : ^77777730 SP / Max area 8 cells^000000",
		"[Lv 2] : ^77777734 SP / Max area 10 cells^000000",
		"[Lv 3] : ^77777738 SP / Max area 12 cells^000000",
		"[Lv 4] : ^77777742 SP / Max area 14 cells^000000",
		"[Lv 5] : ^77777746 SP / Max area 16 cells^000000"
	].join("\n");

	SkillDescription[SKID.SO_ELECTRICWALK] = [
		"Electric Walk",
		"Max Lv : 5",
		"^777777Skill Requirement : Whirlwind 1,",
		"Endow Quake 1^000000",
		"Skill Form : ^777777Active / Special / Damage ^000000",
		"Description : ^777777Summons thunder under your feet, dealing Wind element damage to enemies that walk on it.^000000",
		"[Lv 1] : ^77777730 SP / Max area 8 cells^000000",
		"[Lv 2] : ^77777734 SP / Max area 10 cells^000000",
		"[Lv 3] : ^77777738 SP / Max area 12 cells^000000",
		"[Lv 4] : ^77777742 SP / Max area 14 cells^000000",
		"[Lv 5] : ^77777746 SP / Max area 16 cells^000000"
	].join("\n");

	SkillDescription[SKID.SO_SPELLFIST] = [
		"Spell Fist",
		"Max Lv : 10",
		"^777777Skill Requirement : Autospell 4 ^000000",
		"Skill Form : ^777777  Active / Special / Damage ^000000",
		"Description : ^777777 When Spell Fist is used during the casting of Fire, Cold, Lighting Bolt, the casting is interrupted.",
		"When performing a physical attack on a target, the target is dealt the interrupted elemental bolt damage.",
		"Damage increases based on BaseLv. During duration, consumes SP 20. Skill goes off when duration is over or SP becomes 0.^000000",
		"[Level 1] : ^777777 Duration 45 sec ^000000",
		"[Level 2] : ^777777 Duration 60 sec ^000000",
		"[Level 3] : ^777777 Duration 75 sec ^000000",
		"[Level 4] : ^777777 Duration 90 sec ^000000",
		"[Level 5] : ^777777 Duration 105 sec ^000000",
		"[Level 6] : ^777777 Duration 120 sec ^000000",
		"[Level 7] : ^777777 Duration 135 sec ^000000",
		"[Level 8] : ^777777 Duration 150 sec ^000000",
		"[Level 9] : ^777777 Duration 165 sec ^000000",
		"[Level10] : ^777777 Duration 180 sec ^000000"
	].join("\n");

	SkillDescription[SKID.SO_EARTHGRAVE] = [
		"Earth Grave",
		"Max Lv : 5",
		"^777777Skill Requirement :  Earth Spike 5 ^000000",
		"Skill Form : ^777777  Active / Damage  ^000000",
		"Description : ^777777  Summons spears of solid earth from underneath a targeted location that will inflict Earth property magic damage. Has a chance to bleed enemies.",
		"Damage increases based on skill level, INT, BaseLv and skill level of Seismic Weapon.",
		"Can damage targets in Hiding.^000000",
		"[Level 1] : ^777777 Area of Effect 7 x 7 Cell  ^000000",
		"[Level 2] : ^777777 Area of Effect 7 x 7 Cell  ^000000",
		"[Level 3] : ^777777 Area of Effect 7 x 7 Cell   ^000000",
		"[Level 4] : ^777777 Area of Effect 9 x 9 Cell   ^000000",
		"[Level 5] : ^777777 Area of Effect 9 x 9 Cell   ^000000"
	].join("\n");

	SkillDescription[SKID.SO_DIAMONDDUST] = [
		"Diamond Dust",
		"Max Lv : 5",
		"^777777Skill Requirement :  Deluge 3 ^000000",
		"Skill Form : ^777777  Active / Damage  ^000000",
		"Description : ^777777  Deals water property damage in AoE and provokes Frozen effect.",
		"Damage increases based on Skill level, caster's INT, skill level of Frost Weapon, and BaseLv.^000000",
		"[Level 1] : ^777777 Area of Effect 7 x 7 Cell^000000",
		"[Level 2] : ^777777 Area of Effect 7 x 7 Cell^000000",
		"[Level 3] : ^777777 Area of Effect 7 x 7 Cell ^000000",
		"[Level 4] : ^777777 Area of Effect 9 x 9 Cell^000000",
		"[Level 5] : ^777777 Area of Effect 9 x 9 Cell^000000"
	].join("\n");

	SkillDescription[SKID.SO_POISON_BUSTER] = [
		"Poison Burst",
		"Max Lv : 5",
		"^777777Skill Requirement : Killing Cloud 2  ^000000",
		"Skill Form : ^777777  Active / Damage  ^000000",
		"Description : ^777777  Inflicts poison property damage to a target and enemies in AoE.",
		"Inflicts more damage to a target in Cloud Poison effect. Damage increases based on BaseLv and INT.^000000",
		"[Level 1] : ^777777 MATK 1300% /1500%(Killing Cloud)^000000",
		"[Level 2] : ^777777 MATK 1600% /2000%(Killing Cloud)^000000",
		"[Level 3] : ^777777 MATK 1900% /2500%(Killing Cloud)^000000",
		"[Level 4] : ^777777 MATK 2200% /3000%(Killing Cloud)^000000",
		"[Level 5] : ^777777 MATK 2500% /3500%(Killing Cloud)^000000"
	].join("\n");

	SkillDescription[SKID.SO_PSYCHIC_WAVE] = [
		"Psychic Wave",
		"Max Lv : 5",
		"^777777Skill Requirement :  Dispell 2  ^000000",
		"Skill Form : ^777777  Active / Damage  ^000000",
		"Description : ^777777  Deals Neutral magic damage in AOE.",
		"When equipping staff or book type weapon, deals damage 2 times of 1 hit",
		"Damage increases based on Skill Level, BaseLv, and INT.^000000",
		"[Level 1] : ^777777 Area of Effect 7 x 7 Cell/ Hit Count 3 ^000000",
		"[Level 2] : ^777777 Area of Effect 7 x 7 Cell/ Hit Count 4  ^000000",
		"[Level 3] : ^777777 Area of Effect 9 x 9 Cell/ Hit Count 5  ^000000",
		"[Level 4] : ^777777 Area of Effect 9 x 9 Cell/ Hit Count 6  ^000000",
		"[Level 5] : ^777777 Area of Effect 11 x 11 Cell/ Hit Count 7  ^000000"
	].join("\n");

	SkillDescription[SKID.SO_CLOUD_KILL] = [
		"Killing Cloud",
		"Max Lv : 5",
		"^777777Skill Requirement :  Heavens Drive 5  ^000000",
		"Skill Form : ^777777  Active / Damage  ^000000",
		"Description : ^777777 Summons a poison cloud in 7x7Cell AoE. During the duration, deals poison property magic damage in AoE and leaves Cloud Poison effect.",
		"Targets' resistance in Cloud Poison effect decreases.",
		"Damage increases based on BaseLv and INT.^000000",
		"[Level 1] : ^777777 MATK 40% /Poison Resistance - 5%^000000",
		"[Level 2] : ^777777 MATK 80% /Poison Resistance -10%^000000",
		"[Level 3] : ^777777 MATK 120% /Poison Resistance -15%^000000",
		"[Level 4] : ^777777 MATK 160% /Poison Resistance -20%^000000",
		"[Level 5] : ^777777 MATK 200% /Poison Resistance -25%^000000"
	].join("\n");

	SkillDescription[SKID.SO_STRIKING] = [
		"Striking",
		"Max Lv : 5",
		"^777777Skill Requirement :  Flame Launcher 1 / Frost Weapon 1 / Lightning Loader 1 / Seismic Weapon 1  ^000000",
		"Skill Form : ^777777  Active / Buff  ^000000",
		"Description : ^777777  Increases caster and 1 party member's ATK and chance to guide hit for 90 sec.",
		"Targets with Striking buff consumes some SP every sec.",
		"Can be used while in party.^000000",
		"[Level 1] : ^777777 ATK+20/Guide Hit+30/Consumes SP5^000000",
		"[Level 2] : ^777777 ATK+40/Guide Hit+40/Consumes SP4^000000",
		"[Level 3] : ^777777 ATK+60/Guide Hit+50/Consumes SP3^000000",
		"[Level 4] : ^777777 ATK+80/Guide Hit+60/Consumes SP2^000000",
		"[Level 5] : ^777777 ATK+100/Guide Hit+70/Consumes SP1^000000"
	].join("\n");

	SkillDescription[SKID.SO_WARMER] = [
		"Warmer",
		"Max Lv : 5",
		"^777777Skill Requirement :  Volcano 1 / Whirlwind 1 ^000000",
		"Skill Form : ^777777Active / Ground / Recovery  ^000000",
		"Description : ^777777Increases the temperature in an area, removing Crystallization, Frozen and Freezing status effect from targets in range.^000000",
		"[Lv 1] : ^777777Skill Duration 40 sec.^000000",
		"[Lv 2] : ^777777Skill Duration 45 sec.^000000",
		"[Lv 3] : ^777777Skill Duration 50 sec.^000000",
		"[Lv 4] : ^777777Skill Duration 55 sec.^000000",
		"[Lv 5] : ^777777Skill Duration 60 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SO_VACUUM_EXTREME] = [
		"Extreme Vacuum",
		"Max Lv : 5",
		"^777777Skill Requirement : Magnetic Earth 2 ^000000",
		"Skill Form : ^777777Active / Special  ^000000",
		"Description : ^777777Create a vacuum on a cell that suspends all targets in a 7x7 area. Targets in the area cannot move until the skill duration expires.^000000",
		"[Lv 1] : ^77777734 SP / 3x3 AoE / Duration 4 sec.^000000",
		"[Lv 2] : ^77777742 SP / 3x3 AoE / Duration 6 sec.^000000",
		"[Lv 3] : ^77777750 SP / 5x5 AoE / Duration 8 sec.^000000",
		"[Lv 4] : ^77777758 SP / 5x5 AoE / Duration 10 sec.^000000",
		"[Lv 5] : ^77777766 SP / 7x7 AoE / Duration 12 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SO_VARETYR_SPEAR] = [
		"Varetyr Spear",
		"Max Lv : 10",
		"^777777Skill Requirement :  Seismic Weapon 1 / Violent Gale 4 ^000000",
		"Skill Form : ^777777  Active / Damage  ^000000",
		"Description : ^777777  Summons a huge lightning spear, inflicts wind property magic damage to a target and enemies around it.",
		"Adds a chance to stun damaged targets.",
		"Damage increases based on skill level, INT, Lightning Loader, Striking skill level, BaseLv.^000000",
		"[Level 1] : ^777777 Target and Aoe 3 x 3 Cell ^000000",
		"[Level 2] : ^777777 Target and Aoe 3 x 3 Cell ^000000",
		"[Level 3] : ^777777 Target and Aoe 3 x 3 Cell ^000000",
		"[Level 4] : ^777777 Target and Aoe 5 x 5 Cell ^000000",
		"[Level 5] : ^777777 Target and Aoe 5 x 5 Cell ^000000",
		"[Level 6] : ^777777 Target and Aoe 5 x 5 Cell ^000000",
		"[Level 7] : ^777777 Target and Aoe 7 x 7 Cell ^000000",
		"[Level 8] : ^777777 Target and Aoe 7 x 7 Cell ^000000",
		"[Level 9] : ^777777 Target and Aoe 7 x 7 Cell ^000000",
		"[Level10] : ^777777 Target and Aoe 9 x 9 Cell ^000000"
	].join("\n");

	SkillDescription[SKID.SO_ARRULLO] = [
		"Arrullo",
		"Max Lv : 5",
		"^777777Skill Requirement :   Warmer 2  ^000000",
		"Skill Form : ^777777Active / Special  ^000000",
		"Description : ^777777Causes Deep Sleep status on targets within an area. Consumes 1 Yellow Gemstone to activate the skill.^000000",
		"[Lv 1] : ^777777target ground 3x3 cells / 20% Success Chance / 8 sec duration^000000",
		"[Lv 2] : ^777777target ground 3x3 cells / 25% Success Chance / 10 sec duration^000000",
		"[Lv 3] : ^777777target ground 5x5 cells / 30% Success Chance / 12 sec duration^000000",
		"[Lv 4] : ^777777target ground 5x5 cells / 35% Success Chance / 14 sec duration^000000",
		"[Lv 5] : ^777777target ground 7x7 cells / 40% Success Chance / 16 sec duration^000000"
	].join("\n");

	SkillDescription[SKID.SO_SUMMON_AGNI] = [
		"Call Agni",
		"Max Lv : 3",
		"^777777Skill Requirement :  Spirit Control 1 / Warmer 3  ^000000",
		"Skill Form : ^777777Active / Summon  ^000000",
		"Description : ^777777Summon Spirit of Fire, AGNI. Consume [3 Red Blood or 6 Red Blood or 1 Flame_Heart ] as catalyst items depending on the skill level. ^000000",
		"[Lv 1] : ^777777Skill Duration 600 sec. / Consume 5 SP per 10 seconds.^000000",
		"[Lv 2] : ^777777Skill Duration 900 sec. / Consume 8 SP per 10 seconds.^000000",
		"[Lv 3] : ^777777Skill Duration 1200 sec. / Consume 11 SP per 10 seconds.^000000"
	].join("\n");

	SkillDescription[SKID.SO_SUMMON_AQUA] = [
		"Call Aqua",
		"Max Lv : 3",
		"^777777Skill Requirement :   Spirit Control 1 / Diamond Dust 3  ^000000",
		"Skill Form : ^777777Active / Summon  ^000000",
		"Description : ^777777Summon spirit of water, AQUA. Consume [3 Crystal Blue or 6 Crystal Blue or 1 Mistic Frozen ] as catalyst items depending on the skill level. ^000000",
		"[Lv 1] : ^777777Skill Duration 600 sec. / Consume 5 SP per 10 seconds.^000000",
		"[Lv 2] : ^777777Skill Duration 900 sec. / Consume 8 SP per 10 seconds.^000000",
		"[Lv 3] : ^777777Skill Duration 1200 sec. / Consume 11 SP per 10 seconds. ^000000"
	].join("\n");

	SkillDescription[SKID.SO_SUMMON_VENTUS] = [
		"Call Ventus",
		"Max Lv : 3",
		"^777777Skill Requirement : Spirit Control 1 / Varetyr Spear 3  ^000000",
		"Skill Form : ^777777Active / Summon  ^000000",
		"Description : ^777777Summon spirit of wind, Ventus. Consume [3 Wind Of Verdure or 6 Wind Of Verdure or 1 Rough Wind ] as catalyst items depending on the skill level. ^000000",
		"[Lv 1] : ^777777Skill Duration 600 sec. / Consume 5 SP per 10 seconds. ^000000",
		"[Lv 2] : ^777777Skill Duration 900 sec. / Consume 8 SP per 10 seconds.^000000",
		"[Lv 3] : ^777777Skill Duration 1200 sec. / Consume 11 SP per 10 seconds. ^000000"
	].join("\n");

	SkillDescription[SKID.SO_SUMMON_TERA] = [
		"Call Tera",
		"Max Lv : 3",
		"^777777Skill Requirement :   Spirit Control 1 / Earth Grave 3  ^000000",
		"Skill Form : ^777777Active / Summon  ^000000",
		"Description : ^777777Summon spirit of earth, Consume [3 Green Live or 6 Green Live or 1 Great Nature ] as catalyst items depending on the skill level. ^000000",
		"[Lv 1] : ^777777Skill Duration 600 sec. / Consume 5 SP per 10 seconds. ^000000",
		"[Lv 2] : ^777777Skill Duration 900 sec. / Consume 8 SP per 10 seconds.^000000",
		"[Lv 3] : ^777777Skill Duration 1200 sec. / Consume 11 SP per 10 seconds. ^000000"
	].join("\n");

	SkillDescription[SKID.SO_EL_CONTROL] = [
		"Spirit Control ",
		"Max Lv : 4",
		"^777777Skill Requirement :  Analyze Element 1   ^000000",
		"Skill Form : ^777777Active  ^000000",
		"Description : ^777777Command a waiting mode spirit to switch its mode to Passive (Buff), Defensive (Defense), Offensive (Attack). To switch the spirit into waiting mode, caster just commands same order one more time. When spirits are in waiting mode, they recover little amount HP and SP continuously.  ^000000",
		"[Lv 1] : ^777777Switch the spirit to Passive mode^000000",
		"[Lv 2] : ^777777Swith the spirit to Defensive mode^000000",
		"[Lv 3] : ^777777Swith the spirit to Offensive mode^000000",
		"[Lv 4] : ^777777Swith the spirit to Waiting mode^000000"
	].join("\n");

	SkillDescription[SKID.SO_EL_ACTION] = [
		"Elemental Action",
		"Max Lv : 1 ",
		"^777777Skill Requirement : Spirit Control 3   ^000000",
		"Skill Form : ^777777Active  ^000000",
		"Description : ^777777Activate 1 offensive (Attack) command immediately from summoned spirit. ^000000"
	].join("\n");

	SkillDescription[SKID.SO_EL_ANALYSIS] = [
		"Analyze Element",
		"^777777Skill Requirement :  Flame Launcher 1 / Endow Tsunami 1 / Endow Tornado 1 / Endow Quake 1   ^000000",
		"Skill Form : ^777777Active  ^000000",
		"Description : ^777777Analyze enchanted ores which are used as catalyst items for summoning spirits into pure gemstones. Also, conversely, combine pure gemstones into an enchanted ore. ^000000",
		"[Lv 1] : ^777777Analyze enchanted ores into pure gemstones (Once caster puts 1 of Flame Heart, Rough Wind, Mistic Frozen, Great Nature into convert window, it will be divided into Red Blood, Wind of Verdure, Crystal Blue, Green Live. Divided item quantities are randomly decided.  ^000000",
		"[Lv 2] : ^777777Combine pure gemstones into an enchanted ore (Once caster puts 10 Red Blood, Wind of Verdure, Crystal Blue, Green Live into convert window, it will be combined into 1 Flame Heart, Rough Wind, Mistic Frozen, Great Nature ) There is chance to fail in combining pure gemstones and getting nothing. ^000000"
	].join("\n");

	SkillDescription[SKID.SO_EL_SYMPATHY] = [
		"Spirit Sympathy",
		"Max Lv : 5",
		"^777777Skill Requirement : Spirit Control 3  ^000000",
		"Skill Form : ^777777Passive  ^000000",
		"Description : ^777777Increase summoned spirit's HP, SP and ATK by sharing the feelings between caster and spirits. It also decreases caster's consuming SP. ^000000",
		"[Lv 1] : ^777777MaxHP 5%,  MaxSP 5% Increase  / ATK +25 / SP cost reduction 10% ^000000",
		"[Lv 2] : ^777777MaxHP 10%, MaxSP 10% Increase / ATK +50 / SP cost reduction 15% ^000000",
		"[Lv 3] : ^777777MaxHP 15%, MaxSP 15% Increase / ATK +75 / SP cost reduction 20% ^000000",
		"[Lv 4] : ^777777MaxHP 20%, MaxSP 20% Increase / ATK +100 / SP cost reduction 25% ^000000",
		"[Lv 5] : ^777777MaxHP 25%, MaxSP 25% Increase / ATK +125 / SP cost reduction 30% ^000000"
	].join("\n");

	SkillDescription[SKID.SO_EL_CURE] = [
		"Spirit Cure",
		"Max Lv : 1 ",
		"^777777Skill Requirement :  Spirit Sympathy 1   ^000000",
		"Skill Form : ^777777 Active / Recovery ^000000",
		"Description : ^777777Recover spirit's HP and SP by consumes 10% HP and SP to recover Elemental's HP and SP for the same amount.. Skill will fail if Caster has lower than 10% HP and SP.^000000"
	].join("\n");

	SkillDescription[SKID.SO_FIRE_INSIGNIA] = [
		"Fire Insignia",
		"Max Lv : 3",
		"^777777Skill Requirement :   Call Agni 3   ^000000",
		"Skill Form : ^777777Active / Ground Magic  ^000000",
		"Description : ^777777Draw a fire insignia on the ground within 3 x 3 cells. Recover 1% of HP per 5 seconds if the target is equipped fire property armor or it is a fire property monster. Conversely, decrease 1% of HP per 5 seconds if the target is equipped earth property armor or it is a earth property monster. But all the targets that are inside of skill range get 1.5 times more damage from water property attack. Consume [Scarlet Point 1 / 2 / 3 ] depending on the skill level. ^000000",
		"[Lv 1] : ^777777Increase AGNI's ATK by 20%. Recovery amount of HP, SP per 3 seconds doubled. ^000000",
		"[Lv 2] : ^777777ATK + 50. Weapon property changes to fire property. Increase physical ATK by 10%. ^000000",
		"[Lv 3] : ^777777MATK + 50. Increase ATK by 25% in specific fire property magic spell. ^000000"
	].join("\n");

	SkillDescription[SKID.SO_WATER_INSIGNIA] = [
		"Water Insignia",
		"Max Lv : 3",
		"^777777Skill Requirement :   Call Aqua 3   ^000000",
		"Skill Form : ^777777Active / Ground   ^000000",
		"Description : ^777777Draw a water insignia on the ground within 3 x 3 cells. Recover 1% of HP per 5 seconds, if the target is equipped water property armor or it is a water property monster. Conversely, decrease 1% of HP per 5 seconds, if the target is equipped fire property armor or it is a fire property monster. But all the targets that are inside of skill range get 1.5 times more damage from wind property attack. Consume [Indigo Point 1 / 2 / 3 ] depending on the skill level. ^000000",
		"[Lv 1] : ^777777Increase AQUA's ATK by 20%. Recovery amount of HP, SP per 3 seconds doubled. ^000000",
		"[Lv 2] : ^777777Increase Recovery effect by 10%. Weapon property changes to water property. Increase physical ATK by 10%. ^000000",
		"[Lv 3] : ^777777Decrease casting delay by 30% and increase ATK by 25% in specific water property magic spell. ^000000"
	].join("\n");

	SkillDescription[SKID.SO_WIND_INSIGNIA] = [
		"Wind Insignia",
		"Max Lv : 3",
		"^777777Skill Requirement : Call Ventus 3   ^000000",
		"Skill Form : ^777777Active / Ground  ^000000",
		"Description : ^777777Draw a wind insignia on the ground within 3 x 3 cells. Recover 1% of HP per 5 seconds, if the target is equipped wind property armor or it is a wind property monster. Conversely, decrease 1% of HP per 5 seconds, if the target is equipped water property armor or it is a water property monster. But all the targets that are inside of skill range get 1.5 times more damage from earth property attack. Consume [Yellow Wish Point 1 / 2 / 3 ] depending on the skill level. ^000000",
		"[Lv 1] : ^777777Increase VENTUS's ATK by 20%. Recovery amount of HP, SP per 3 seconds doubled. ^000000",
		"[Lv 2] : ^777777Increase attack speed a bit. Weapon property changes to wind property. Increase physical ATK by 10%. ^000000",
		"[Lv 3] : ^777777Decrease casting delay by 50% and increase ATK by 25% in specific wind property magic spell. ^000000"
	].join("\n");

	SkillDescription[SKID.SO_EARTH_INSIGNIA] = [
		"Earth Insignia",
		"Max Lv : 3",
		"^777777Skill Requirement :  Call Tera 3   ^000000",
		"Skill Form : ^777777Active / Ground ^000000",
		"Description : ^777777Draw a earth insignia on the ground within 3 x 3 cells. Recover 1% of HP per 5 seconds, if the target is equipped earth property armor or it is a earth property monster. Conversely, decrease 1% of HP per 5 seconds, if the target is equipped wind property armor or it is a wind property monster. But all the targets that are inside of skill range get 1.5 times more damage from fire property attack. Consume [Lime Green Point 1 / 2 / 3 ] depending on the skill level. ^000000",
		"[Lv 1] : ^777777Increase TERA's ATK by 20%. Recovery amount of HP, SP per 3 seconds doubled. ^000000",
		"[Lv 2] : ^777777Increase MaxHP 500, DEF 50. Weapon property changes to earth property. Increase physical ATK by 10%. ^000000",
		"[Lv 3] : ^777777Increase MaxSP 50 , MDEF 50. Increase ATK by 25% in specific earth property magic spell. ^000000"
	].join("\n");

	SkillDescription[SKID.GN_TRAINING_SWORD] = [
		"Sword Mastery",
		"Max Lv : 5",
		"^777777Skill Requirement : Genetic Basic^000000",
		"Skill Form : ^777777Passive ^000000",
		"Description : ^777777Increase ATK and Accuracy rate of One Handed Sword or Dagger Class Weapons. ^000000",
		"[Lv 1] : ^777777ATK +10 / Accuracy Rate +3^000000",
		"[Lv 2] : ^777777ATK +20 / Accuracy Rate +6^000000",
		"[Lv 3] : ^777777ATK +30 / Accuracy Rate +9^000000",
		"[Lv 4] : ^777777ATK +40 / Accuracy Rate +12^000000",
		"[Lv 5] : ^777777ATK +50 / Accuracy Rate +15^000000"
	].join("\n");

	SkillDescription[SKID.GN_REMODELING_CART] = [
		"Cart Remodeling",
		"Max Lv : 5",
		"^777777Skill Requirement : Genetic Basic^000000",
		"Skill Form : ^777777Passive ^000000",
		"Description : ^777777Increase Accuracy rate of Cart Revolution, Cart Tornado and Cart Cannon by remodeling the cart. Extend Maximum loading space of the cart. ^000000",
		"[Lv 1] : ^777777Cart Weight +500 / Cart skill HIT bonus +4  ^000000",
		"[Lv 2] : ^777777Cart Weight +1000 / Cart skill HIT bonus +8  ^000000",
		"[Lv 3] : ^777777Cart Weight +1500 / Cart skill HIT bonus +12  ^000000",
		"[Lv 4] : ^777777Cart Weight +2000 / Cart skill HIT bonus +16  ^000000",
		"[Lv 5] : ^777777Cart Weight +2500 / Cart skill HIT bonus +20  ^000000"
	].join("\n");

	SkillDescription[SKID.GN_CART_TORNADO] = [
		"Cart Tornado",
		"Max Lv : 10",
		"^777777Skill Requirement : Cart Remodeling 1^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777 Spins the pushcart like a tornado to inflict physical damage to all enemies in 2 cells around the user. Cannot be used without cart.",
		"Damage increases based on STR, weight of the cart, skill level of Cart Remodeling.^000000",
		"[Level 1] : ^777777 ATK 200% ^000000",
		"[Level 2] : ^777777 ATK 400% ^000000",
		"[Level 3] : ^777777 ATK 600% ^000000",
		"[Level 4] : ^777777 ATK 800% ^000000",
		"[Level 5] : ^777777 ATK 1000% ^000000",
		"[Level 6] : ^777777 ATK 1200% ^000000",
		"[Level 7] : ^777777 ATK 1400% ^000000",
		"[Level 8] : ^777777 ATK 1600% ^000000",
		"[Level 9] : ^777777 ATK 1800% ^000000",
		"[Level10] : ^777777 ATK 2000% ^000000"
	].join("\n");

	SkillDescription[SKID.GN_CARTCANNON] = [
		"Cart Cannon",
		"Max Lv : 5",
		"^777777Skill Requirement : Cart Remodeling 2^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777 Deals special ranged physical damage to a target and enemies around it.",
		"Cannot be used without a cart. Damage increases based on skill level of Cart Remodeling.",
		"Damage increases based on BaseLv and INT.",
		"Consumes 1 Cannon Ball when used.^000000",
		"[Level 1] : ^777777 ATK (250+Cart Remodeling sLv x20)%^000000",
		"[Level 2] : ^777777 ATK (500+Cart Remodeling sLv x40)%^000000",
		"[Level 3] : ^777777 ATK (750+Cart Remodeling sLv x60)%^000000",
		"[Level 4] : ^777777 ATK (1000+Cart Remodeling sLv x80)%^000000",
		"[Level 5] : ^777777 ATK (1250+Cart Remodeling sLv x100)%^000000"
	].join("\n");

	SkillDescription[SKID.GN_CARTBOOST] = [
		"Geneticist Cart Boost",
		"Max Lv : 5",
		"^777777Skill Requirement : Cart Remodeling 3^000000",
		"Skill Form : ^777777Buff (To yourself)  ^000000",
		"Description : ^777777Increase caster's movement speed and ATK for 90 seconds. Must have a cart in order to cast.^000000",
		"[Lv 1] : ^777777Movement Speed 50% increase / ATK 10 increase^000000",
		"[Lv 2] : ^777777Movement Speed 50% increase / ATK 20 increase^000000",
		"[Lv 3] : ^777777Movement Speed 75% increase / ATK 30 increase^000000",
		"[Lv 4] : ^777777Movement Speed 75% increase / ATK 40 increase^000000",
		"[Lv 5] : ^777777Movement Speed 100% increase / ATK 50 increase^000000"
	].join("\n");

	SkillDescription[SKID.GN_THORNS_TRAP] = [
		"Thorn Trap",
		"Max Lv : 5",
		"^777777Skill Requirement : Special Pharmacy 2 ^000000",
		"Skill Form : ^777777Special / Damage ^000000",
		"Description : ^777777Set Thorn Trap on the ground in a 1 cell range and trap enemies on it. Target receives damage continuously while trapped on the ground. If the trapped target gets fire attack, it burns the thorn trap and the target can be released. Consumes 1 Thorny Plant Seed.^000000",
		"[Lv 1] : ^777777Skill Duration 10 sec.^000000",
		"[Lv 2] : ^777777Skill Duration 12 sec.^000000",
		"[Lv 3] : ^777777Skill Duration 14 sec.^000000",
		"[Lv 4] : ^777777Skill Duration 16 sec.^000000",
		"[Lv 5] : ^777777Skill Duration 18 sec.^000000"
	].join("\n");

	SkillDescription[SKID.GN_BLOOD_SUCKER] = [
		"Blood Sucker",
		"Max Lv : 5",
		"^777777Skill Requirement : Special Pharmacy 3 ^000000",
		"Skill Form : ^777777  Active / Buff ^000000",
		"Description : ^777777 Gives the party member a chance to drain HP when dealing physical attack.",
		"Drain amount and chance increases based on skill level.",
		"Consumes 5 Blood Sucker Plant Seeds when used. ^000000",
		"[Level 1] : ^777777 Chance 1%/Drain amount 1%/Duration 40 sec^000000",
		"[Level 2] : ^777777 Chance 3%/Drain amount 2%/Duration 100 sec^000000",
		"[Level 3] : ^777777 Chance 5%/Drain amount 3%/Duration 160 sec^000000",
		"[Level 4] : ^777777 Chance 7%/Drain amount 4%/Duration 220 sec^000000",
		"[Level 5] : ^777777 Chance 9%/Drain amount 5%/Duration 280 sec^000000"
	].join("\n");

	SkillDescription[SKID.GN_SPORE_EXPLOSION] = [
		"Spore Explosion",
		"Max Lv : 10",
		"^777777Skill Requirement : Special Pharmacy 4 ^000000",
		"Skill Form : ^777777  Active / Damage  ^000000",
		"Description : ^777777 Throws an expolosive spore, deals ranged physical damage to a target and enemies in AoE.",
		"Damage increases based on BaseLv and INT.",
		"Additionally, it gives the target within the Area of Effect receive increased long-distance physical damage for 5 seconds.",
		"(Normal enemy : increase 10% / Boss monsters : increase 5%)",
		"Consumes 1 Bomb Mushroom Spore when used. ^000000",
		"[Level 1] : ^777777 ATK 600%/ Area of Effect: 3x3Cell^000000",
		"[Level 2] : ^777777 ATK 800%/ Area of Effect: 3x3Cell^000000",
		"[Level 3] : ^777777 ATK 1000%/ Area of Effect: 5x5Cell^000000",
		"[Level 4] : ^777777 ATK 1200%/ Area of Effect: 5x5Cell^000000",
		"[Level 5] : ^777777 ATK 1400%/ Area of Effect: 7x7Cell^000000",
		"[Level 6] : ^777777 ATK 1600%/ Area of Effect: 7x7Cell^000000",
		"[Level 7] : ^777777 ATK 1800%/ Area of Effect: 9x9Cell^000000",
		"[Level 8] : ^777777 ATK 2000%/ Area of Effect: 9x9Cell^000000",
		"[Level 9] : ^777777 ATK 2200%/ Area of Effect:11x11Cell^000000",
		"[Level10] : ^777777 ATK 2400%/ Area of Effect:11x11Cell^000000"
	].join("\n");

	SkillDescription[SKID.GN_WALLOFTHORN] = [
		"Thorn Wall",
		"Max Lv : 5",
		"^777777Skill Requirement : Thorn Trap 3 ^000000",
		"Skill Form : ^777777Special / Wall ^000000",
		"Description : ^777777Build a thorn wall around 1 target to deal damage and pushes it back. It can be destroyed by attacks and damages. If the Thorn Wall gets fire property damage, it burns out and turns into Fire Wall. Only 1 Thorn Wall can be cast and consumes 1 Thorn Plant Seed.^000000",
		"[Lv 1] : ^77777740 SP / Skill Duration 10 sec.^000000",
		"[Lv 2] : ^77777750 SP / Skill Duration 11 sec.^000000",
		"[Lv 3] : ^77777760 SP / Skill Duration 12 sec.^000000",
		"[Lv 4] : ^77777770 SP / Skill Duration 13 sec.^000000",
		"[Lv 5] : ^77777780 SP / Skill Duration 14 sec.^000000"
	].join("\n");

	SkillDescription[SKID.GN_CRAZYWEED] = [
		"Crazy Vines",
		"Max Lv : 10",
		"^777777Skill Requirement : Wall of Thorns 3 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777 Consuming one Seed of Thorns, summoning and dropping a huge block of plants, inflicting ranged physical damage on all targets in the area. It eliminates traps and effects laid on the ground.",
		"As the skill level increases, the number of plant lumps summoned increases, and the damage is further increased based on BaseLv. ^000000",
		"[Level 1] : ^777777 ATK 800% / 5 ^000000",
		"[Level 2] : ^777777 ATK 900% / 6 ^000000",
		"[Level 3] : ^777777 ATK1000% / 6 ^000000",
		"[Level 4] : ^777777 ATK1100% / 7  ^000000",
		"[Level 5] : ^777777 ATK1200% / 7 ^000000",
		"[Level 6] : ^777777 ATK1300% / 8 ^000000",
		"[Level 7] : ^777777 ATK1400% / 8 ^000000",
		"[Level 8] : ^777777 ATK1500% / 9 ^000000",
		"[Level 9] : ^777777 ATK1600% / 9 ^000000",
		"[Level 10] : ^777777 ATK1700% /10  ^000000"
	].join("\n");

	SkillDescription[SKID.GN_DEMONIC_FIRE] = [
		"Demonic Fire ",
		"Max Lv : 5",
		"^777777Skill Requirement : Spore Explosion 3 ^000000",
		"Skill Form : ^777777Active / Damage ^000000",
		"Description : ^777777Throw a fire bottle on the ground and set flames. All targets within the skill range keep receiving damages and also get [Ignition] status. Consume 1 Fire Bottle. ^000000",
		"[Lv 1] : ^77777724 SP / Fire Matk 130 % / Duration 10 sec. / Ignition Chance 8%  ^000000",
		"[Lv 2] : ^77777728 SP / Fire Matk 150 % / Duration 12 sec. / Ignition Chance 12% ^000000",
		"[Lv 3] : ^77777732 SP / Fire Matk 170 % / Duration 14 sec. / Ignition Chance 16% ^000000",
		"[Lv 4] : ^77777736 SP / Fire Matk 190 % / Duration 16 sec. / Ignition Chance 20% ^000000",
		"[Lv 5] : ^77777740 SP / Fire Matk 210 % / Duration 18 sec. / Ignition Chance 24% ^000000"
	].join("\n");

	SkillDescription[SKID.GN_FIRE_EXPANSION] = [
		"Fire Expansion",
		"Max Lv : 5",
		"^777777Skill Requirement : Demonic Fire 3 ^000000",
		"Skill Form : ^777777Active / Special / Damage ^000000",
		"Description : ^777777When Demonic Fire and Fire Expansion are cast in the same range, it gives several effects depending on the items consumed. ^000000",
		"[Lv 1] : ^77777730 SP / Consume Oil Bottle / Increase Demonic Fire Damage by 50% / Add 10 sec. Duration ^000000",
		"[Lv 2] : ^77777735 SP / Consume Explosive Powder/ Increase Demonic Fire Damage depending on caster's INT / Cancel Demonic Fire  ^000000",
		"[Lv 3] : ^77777740 SP / Consume Smoke Powder / Demonic Fire turns into Smoke bullet / Decrease long distance and melee damage / Add Flee Rate ^000000",
		"[Lv 4] : ^77777745 SP / Consume Tear Gas / Demonic Fire turns into Tear Gas / Decrease HP, Accuracy rate, Flee Rate ^000000",
		"[Lv 5] : ^77777750 SP / Consume Acid Bottle / Demonic Fire turns into Acid Bomb / Activated in highest level among acquired skill. ^000000"
	].join("\n");

	SkillDescription[SKID.GN_HELLS_PLANT] = [
		"Hell Plant",
		"Max Lv : 5",
		"^777777Skill Requirement : Blood Sucker 3 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777 Attach cannibals summoned from hell to his body, bite and damage when Target approaches the 5x5 Cell Area around a target. Damage is further increased based on the BaseLv, INT and the skill level of Biocannabis.",
		"Consumes 1 MenEater Plant Bottle. ^000000",
		"[Level 1] : ^777777 ATK 100% / Duration 60 sec ^000000",
		"[Level 2] : ^777777 ATK 200% / Duration 90 sec ^000000",
		"[Level 3] : ^777777 ATK 300% / Duration 120 sec ^000000",
		"[Level 4] : ^777777 ATK 400% / Duration 150 sec ^000000",
		"[Level 5] : ^777777 ATK 500% / Duration 180 sec ^000000"
	].join("\n");

	SkillDescription[SKID.GN_MANDRAGORA] = [
		"Mandragora Howl",
		"Max Lv : 5",
		"^777777Skill Requirement : Hell Plant  3 ^000000",
		"Skill Form : ^777777Active / Special / Damage ^000000",
		"Description : ^777777Pull out a noisy MANDRAGORA from its pot and let it howl at surrounding enemies. Decrease all targets' INT and SP. Increase all skill's casting delay. Decrease success rate of the skill depending on target's VIT and LUK. ^000000",
		"[Lv 1] : ^77777711x11 AoE / INT -4 / SP 30% Decrease / 30% SP^000000",
		"[Lv 2] : ^77777713x13 AoE / INT -8 / SP 35% Decrease / 35% SP^000000",
		"[Lv 3] : ^77777713x13 AoE / INT -12 / SP 40% Decrease / 40% SP^000000",
		"[Lv 4] : ^77777715x15 AoE / INT -16 / SP 45% Decrease / 45% SP^000000",
		"[Lv 5] : ^77777715x15 AoE / INT -20 / SP 50% Decrease / 50% SP^000000"
	].join("\n");

	SkillDescription[SKID.GN_SLINGITEM] = [
		"Item Sling",
		"Max Lv : 1",
		"^777777Skill Requirement : Change Material 1 ^000000",
		"Skill Form : ^777777Active  ^000000",
		"Description : ^777777Throw fruit bombs or pitching items. Skill ranges 11 cells. ^000000"
	].join("\n");

	SkillDescription[SKID.GN_CHANGEMATERIAL] = [
		"Change Material",
		"Max Lv : 1",
		"^777777Skill Requirement : Genetic Basic ^000000",
		"Skill Form : ^777777Active  ^000000",
		"Description : ^777777Learn the ability to create new items by combining various items. Items can't be made by combining random items. You have to combine the correct items with exact quantities. To get more details about combining items, please travel around Rune Midgard.^000000"
	].join("\n");

	SkillDescription[SKID.GN_MIX_COOKING] = [
		"Mixed Cooking",
		"Max Lv : 2",
		"^777777Skill Requirement : Special Pharmacy 1 ^000000",
		"Skill Form : ^777777Active  ^000000",
		"Description : ^777777Cook delicious dishes by mixing various ingredients. You can make 10 dishes at once with level 2 Mixed Cooking. Need a 'Cook Recipe (Cook Book)' to make specific food. ^000000",
		"[Lv 1] : ^7777775 SP / Create 1 Food Item^000000",
		"[Lv 2] : ^77777740 SP / Create 10 Food Items^000000"
	].join("\n");

	SkillDescription[SKID.GN_MAKEBOMB] = [
		"Bomb Creation",
		"Max Lv : 2",
		"^777777Skill Requirement : Mixed Cooking 1 ^000000",
		"Skill Form : ^777777Active  ^000000",
		"Description : ^777777Make a bomb out of fruits. You can make 10 bombs at once with level 2 Bomb Creation. Need a 'Bomb Making Manual (Manual Book)' to make specific bombs. ^000000",
		"[Lv 1] : ^7777775 SP / Create 1 Fruit Bomb^000000",
		"[Lv 2] : ^77777740 SP / Create 10 Fruit Bombs^000000"
	].join("\n");

	SkillDescription[SKID.GN_S_PHARMACY] = [
		"Special Pharmacy ",
		"Max Lv : 10",
		"^777777Skill Requirement : Geneticist Basic ^000000",
		"Skill Form : ^777777Active  ^000000",
		"Description : ^777777Geneticist can create more potions or liquid medicine. The number of liquid medicine that can be created increases based on the Geneticist's INT and skill level learned. To make liquid medicine, you need a specific Potion Making Manual.^000000"
	].join("\n");

	SkillDescription[SKID.AB_SECRAMENT] = [
		"Sacrament",
		"Max Lv : 5 ",
		"^777777Skill Requirement : Epiclesis 1 / Expiatio 1 ^000000",
		"Skill Form : ^777777Buff^000000",
		"Description : ^777777Reduces a target's fixed cast time by performing a holy ceremony. ^000000",
		"[Lv 1] : ^777777Decrease fixed cast by 10% / Duration 60 sec.^000000",
		"[Lv 2] : ^777777Decrease fixed cast by 20% / Duration 90 sec.^000000",
		"[Lv 3] : ^777777Decrease fixed cast by 30% / Duration 120 sec.^000000",
		"[Lv 4] : ^777777Decrease fixed cast by 40% / Duration 150 sec.^000000",
		"[Lv 5] : ^777777Decrease fixed cast by 50% / Duration 180 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SR_HOWLINGOFLION] = [
		"Lion's Howl",
		"Max Lv : 5",
		"^777777Skill Requirement :  Lightning Ride 3, Power Absorb 1 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Inflicts ranged physical damage to all enemies in a set area around the user and cancels their Maestro and Wanderer songs.",
		"Damage increases depending on player's base level, and consumes 3 Spheres when used.^000000",
		"[Level 1] : ^777777 Area of Effect 5 x 5  / ATK 500%^000000",
		"[Level 2] : ^777777 Area of Effect 5 x 5  / ATK 1000%^000000",
		"[Level 3] : ^777777 Area of Effect 7 x 7  / ATK 1500%^000000",
		"[Level 4] : ^777777 Area of Effect 7 x 7  / ATK 2000%^000000",
		"[Level 5] : ^777777 Area of Effect 9 x 9  / ATK 2500%^000000"
	].join("\n");

	SkillDescription[SKID.SR_RIDEINLIGHTNING] = [
		"Lightning Ride",
		"Max Lv : 5",
		"^777777Skill Requirement :  Spirit Sphere 3 ^000000",
		"Skill Form : ^777777  Active / Damage ^000000",
		"Description : ^777777  Inflicts Ranged Physical Damage to all enemies in a set area around the targeted location by using 2 Spheres.",
		"Damage increases depending on caster's base level, and if the equipped weapon is a Knuckle, this skill will inflict additional damage.^000000",
		"[Level 1] : ^777777ATK  40%/  90%(Knuckle)/Area of Effect 3 x 3/1 time attack^000000",
		"[Level 2] : ^777777ATK  80%/ 180%(Knuckle)/Area of Effect 3 x 3/2 time attack^000000",
		"[Level 3] : ^777777ATK 120%/270%(Knuckle)/Area of Effect 5 x 5/3 time attack^000000",
		"[Level 4] : ^777777ATK 160%/360%(Knuckle)/Area of Effect 5 x 5/4 time attack^000000",
		"[Level 5] : ^777777ATK 200%/450%(Knuckle)/Area of Effect 7 x 7/5 time attack^000000"
	].join("\n");

	SkillDescription[SKID.ALL_ODINS_RECALL] = [].join("\n");

	SkillDescription[SKID.RETURN_TO_ELDICASTES] = [
		"To El Dicastes",
		"Max LV : 1",
		"Skill Form : ^777777Supportive^bb0000(Return)^000000",
		"Description : ^777777Return to El Dicastes, the Capital of Sapha. 5 minutes cool down time exist.^000000"
	].join("\n");

	SkillDescription[SKID.HLIF_HEAL] = [
		"Healing Hands",
		"Max Lv : 5",
		"Description: ^777777Restore the Master's HP with a",
		"method that mimics the Acolyte's Heal skill.",
		"The amount of restored HP is affected by the",
		"skill's level, Humonculi's Base Level and INT.",
		"^00BB00Each cast requires 1 Condensed Red Potion.^000000",
		"SP Consumption By Level",
		"[Lv 1]:^77777713 SP^000000",
		"[Lv 2]:^77777716 SP^000000",
		"[Lv 3]:^77777719 SP^000000",
		"[Lv 4]:^77777722 SP^000000",
		"[Lv 5]:^77777725 SP^000000"
	].join("\n");

	SkillDescription[SKID.HLIF_AVOID] = [
		"Urgent Escape",
		"Max Lv : 5",
		"Description: ^777777Temporarily increase the moving",
		"speed of caster and Homunculus so that they can",
		"escape from a critical situation.^000000",
		"[Lv 1]:^77777740 Sec Duration Movement Speed +10%^000000",
		"[Lv 2]:^77777735 Sec Duration Movement Speed +20%^000000",
		"[Lv 3]:^77777730 Sec Duration Movement Speed +30%^000000",
		"[Lv 4]:^77777725 Sec Duration Moving Speed +40%^000000",
		"[Lv 5]:^77777720 Sec Duration Movement Speed +50%000000"
	].join("\n");

	SkillDescription[SKID.HLIF_BRAIN] = [
		"Brain Surgery",
		"Max Lv : 5",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777Alter the Lif Homunculus's brain",
		"to increase its MaxSP, SP Recovery Rate and",
		"the effectiveness of the Healing Hands skill.^000000",
		"[Lv 1]:^777777MaxSP +1% SP Recovery +3%",
		" Healing Hands +2%^000000",
		"[Lv 2]:^777777MaxSP +2% SP Recovery +6%",
		" Healing Hands+4%^000000",
		"[Lv 3]:^777777MaxSP +3% SP Recovery +9%",
		" Healing Hands +6%^000000",
		"[Lv 4]:^777777MaxSP+ 4% SP Recovery +12%",
		" Healing Hands +8%^000000",
		"[Lv 5]:^777777MaxSP +5% SP Recovery +15%",
		" Healing Hands +10%^000000"
	].join("\n");

	SkillDescription[SKID.HLIF_CHANGE] = [
		"Mental Charge",
		"Max Lv : 3",
		"Description: ^777777Exchange the Lif Homunculus's MaxSP",
		"with its MaxHP for this skill's duration.",
		"Upon activating this skill, Lif's HP will be",
		"fully restored and will perform normal attacks",
		"that inflict damage equal to its Magic Attack",
		"Power. This skill is cancelled after its",
		"duration and Lif's remaining HP and SP will",
		"become 10.^000000",
		"[Lv 1] ^7777771 Min Duration 10 Min Cast Delay^000000",
		"[Lv 2] ^7777773 Min Duration 15 Min Cast Delay^000000",
		"[Lv 3] ^7777775 Min Duration 20 Min Cast Delay^000000"
	].join("\n");

	SkillDescription[SKID.HAMI_CASTLE] = [
		"Castling",
		"Max Lv :5",
		"Description: ^777777Instantly switch the location of",
		"the caster with the Amistr Homunculus so that",
		"monsters attacking the caster will target",
		"Amistr instead.^000000",
		"[Lv 1]:^77777720% Success Chance^000000",
		"[Lv 2]:^77777740% Success Chance^000000",
		"[Lv 3]:^77777760% Success Chance^000000",
		"[Lv 4]:^77777780% Success Chance^000000",
		"[Lv 5]:^777777100% Success Chance^000000"
	].join("\n");

	SkillDescription[SKID.HAMI_DEFENCE] = [
		"Amistr Bulwark",
		"Max Lv :5",
		"Description: ^777777Enhance the Defense of the caster",
		"and the Amistr Homunculus for this skill's",
		"duration.^000000",
		"[Lv 1]:^777777Player's DEF+5, Homun's DEF+10, 40 Sec Duration^000000",
		"[Lv 2]:^777777Player's DEF+7, Homun's DEF+15, 35 Sec Duration^000000",
		"[Lv 3]:^777777Player's DEF+10, Homun's DEF+20, 30 Sec Duration^000000",
		"[Lv 4]:^777777Player's DEF+12, Homun's DEF+25, 25 Sec Duration^000000",
		"[Lv 5]:^777777Player's DEF+15, Homun's DEF+30, 20 Sec Duration^000000"
	].join("\n");

	SkillDescription[SKID.HAMI_SKIN] = [
		"Adamantium Skin",
		"Max Lv : 5",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777Permanently increase the",
		"Homunculus's Defense, MaxHP and HP Recovery",
		"Rate.^000000",
		"[Lv 1]:^777777DEF +4 MaxHP +2% HP Recovery Rate +5%^000000",
		"[Lv 2]:^777777DEF +8 MaxHP +4% HP Recovery Rate +10%^000000",
		"[Lv 3]:^777777DEF +12 MaxHP +6% HP Recovery Rate +15%^000000",
		"[Lv 4]:^777777DEF +16 MaxHP +8% HP Recovery Rate +20%^000000",
		"[Lv 5]:^777777DEF +20 MaxHP +10% HP Recovery Rate +25%^000000"
	].join("\n");

	SkillDescription[SKID.HAMI_BLOODLUST] = [
		"Blood Lust",
		"Max Lv : 3",
		"Description: ^777777Increase the Homunculus's Attack",
		"Power for the duration of this skill. During",
		"the Blood Lust status, each attack has the",
		"chance of restoring an amount of HP to",
		"Homunculus equal to 20% of the damage inflicted",
		"to targeted enemy.^000000",
		"[Lv 1]:^7777771 Min Duration Attack Power +130%",
		" HP Gain Chance +3% 5 Min Cast Delay^000000",
		"[Lv 2]:^7777773 Min Duration Attack Power +140%",
		" HP Gain Chance +6% 10 Min Cast Delay^000000",
		"[Lv 3]:^7777775 Min Duration Attack Power +150%",
		" HP Gain Chance +9% 15 Min Cast Delay^000000"
	].join("\n");

	SkillDescription[SKID.HFLI_MOON] = [
		"Moonlight",
		"Max Lv :5",
		"Description: ^777777Command Filir Homunculus to peck",
		"repeatedly at a nearby target.^000000",
		"[Lv 1]:^7777771 Peck, Damage +220%^000000",
		"[Lv 2]:^7777772 Pecks, Damage +330%^000000",
		"[Lv 3]:^7777772 Pecks, Damage +440%^000000",
		"[Lv 4]:^7777772 Pecks, Damage +550%^000000",
		"[Lv 5]:^7777773 Pecks, Damage +660%^000000"
	].join("\n");

	SkillDescription[SKID.HFLI_FLEET] = [
		"Flitting",
		"Max Lv :5",
		"Description: ^777777Temporarily increase Filir",
		"Homunculus's Attack Power and Speed.^000000",
		"[Lv 1]:^777777Aspd +3 Attack Power +110%",
		" 60 Sec Duration 60 Sec Cast Delay^000000",
		"[Lv 2]:^777777Aspd +6 Attack Power +115%",
		" 55 Sec Duration 70 Sec Cast Delay^000000",
		"[Lv 3]:^777777Aspd +9 Attack Power +120%",
		" 50 Sec Duration 80 Sec Cast Delay^000000",
		"[Lv 4]:^777777Aspd +12 Attack Power +125%",
		" 45 Sec Duration 90 Sec Cast Delay^000000",
		"[Lv 5]:^777777Aspd +15 Attack Power +130%",
		" 40 Sec Duration 120 Sec Cast Delay^000000"
	].join("\n");

	SkillDescription[SKID.HFLI_SPEED] = [
		"Accelerated Flight",
		"Max Lv : 5",
		"Description: Temporarily increase Filir Homunculus's",
		"Flee Rate by pushing it to its physical limits.^000000",
		"[Lv 1]:^777777Flee Rate +20 60 Sec Duration",
		" 60 Sec Cast Delay^000000",
		"[Lv 2]:^777777Flee Rate +30 55 Sec Duration",
		" 70 Sec Cast Delay^000000",
		"[Lv 3]:^777777Flee Rate +40 50 Sec Duration",
		" 80 Sec Cast Delay^000000",
		"[Lv 4]:^777777Flee Rate +50 45 Sec Duration",
		" 90 Sec Cast Delay^000000",
		"[Lv 5]:^777777Flee Rate +60 40 Sec Duration",
		" 120 Sec Cast Delay^000000"
	].join("\n");

	SkillDescription[SKID.HFLI_SBR44] = [
		"S.B.R.44",
		"Max Lv : 3",
		"Description: ^777777Sacrifice intimacy between the",
		"caster and Homunculus to inflict great damage",
		"to a targeted enemy.^000000"
	].join("\n");

	SkillDescription[SKID.HVAN_CAPRICE] = [
		"Caprice",
		"Max Lv : 5",
		"Description: ^777777Cast a random Bolt skill. The level",
		"of the Bolt skill cast is affected by the skill",
		"level of Caprice.^000000",
		"[Lv 1]:^777777Cast Lv 1 Bolt skill^000000",
		"[Lv 2]:^777777Cast Lv 2 Bolt skill^000000",
		"[Lv 3]:^777777Cast Lv 3 Bolt skill^000000",
		"[Lv 4]:^777777Cast Lv 4 Bolt skill^000000",
		"[Lv 5]:^777777Cast Lv 5 Bolt skill^000000"
	].join("\n");

	SkillDescription[SKID.HVAN_CHAOTIC] = [
		"Chaotic Blessings",
		"Max Lv :5",
		"Description: ^777777Restore HP to a target randomly",
		"selected among enemies, the Homuculus's master",
		"or the Homunculus itself.^000000",
		"[Lv 1]:^777777Lv 1 Heal",
		" 20% Chance of Healing Self",
		" 30% Chance of Healing Master",
		" 50% Chance of Healing Enemy^000000",
		"[Lv 2]:^777777Lv 1~2 Heal",
		" 50% Chance of Healing Self",
		" 10% Chance of Healing Master",
		" 40% Chance of Healing Enemy^000000",
		"[Lv 3]:^777777Lv 1~3 Heal",
		" 25% Chance of Healing Self",
		" 50% Chance of Healing Master",
		" 25% Chance of Healing Enemy^000000",
		"[Lv 4]:^777777Lv 1~4 Heal",
		" 60% Chance of Healing Self",
		" 4% Chance of Healing Master",
		" 36% Chance of Healing Enemy^000000",
		"[Lv 5]:^777777Lv 1~5 Heal",
		" 34% Chance of Healing Self",
		" 33% Chance of Healing Master",
		" 33% Chance of Healing Enemy^000000"
	].join("\n");

	SkillDescription[SKID.HVAN_INSTRUCT] = [
		"Instruction Change",
		"Max Lv : 5",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777Increase Homunculus's INT and STR.^000000",
		"[Lv 1]:^777777+1 INT, +1 STR^000000",
		"[Lv 2]:^777777+2 INT, +1 STR^000000",
		"[Lv 3]:^777777+2 INT, +3 STR^000000",
		"[Lv 4]:^777777+4 INT, +4 STR^000000",
		"[Lv 5]:^777777+5 INT, +4 STR^000000"
	].join("\n");

	SkillDescription[SKID.HVAN_EXPLOSION] = [
		"Self-Destruction",
		"Max Lv : 3",
		"Description: ^777777Command the Homunculus to self",
		"destruct, inflicting splashed damage within",
		"9*9 cells, proportionate to Homunculus's MaxHP,",
		"that pierces the Defense of targeted enemies. If",
		"Homunculus successfully destroys itself, the",
		"intimacy between Homunculus and master is",
		"reduced to 1.",
		"[Lv 1]:^777777Damage = MaxHP*1^000000",
		"[Lv 2]:^777777Damage = MaxHP*1.5^000000",
		"[Lv 3]:^777777Damage = MaxHP*2^000000"
	].join("\n");

	SkillDescription[SKID.MS_BASH] = [
		"Bash",
		"Skill Form: ^777777Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Hit an enemy with crushing force.",
		"If the Fatal Blow skill is learned, Bash will",
		"have an added Stun effect at levels 5 and higher.^000000",
		"[Lv.1]: ^777777Atk 130%^000000",
		"[Lv.2]: ^777777Atk 160%^000000",
		"[Lv.3]: ^777777Atk 190%^000000",
		"[Lv.4]: ^777777Atk 220%^000000",
		"[Lv.5]: ^777777Atk 250%^000000",
		"[Lv.6]: ^777777Atk 280%^000000",
		"[Lv.7]: ^777777Atk 310%^000000",
		"[Lv.8]: ^777777Atk 340%^000000",
		"[Lv.9]: ^777777Atk 370%^000000",
		"[Lv.10]: ^777777Atk 400%^000000"
	].join("\n");

	SkillDescription[SKID.MS_MAGNUM] = [
		"Magnum Break",
		"Skill Form: ^777777Offensive^bb0000(Fire)^000000",
		"Description: ^777777Drain a small amount of the",
		"caster's HP to inflict Fire property area effect",
		"damage on enemies in the caster's vicinity and",
		"force them backward. For 10 seconds after Magnum",
		"Break, caster's weapon will receive a 20% Fire",
		"property strength enhancement.^000000",
		"[Lv.1]: ^777777Atk 120%^000000",
		"[Lv.2]: ^777777Atk 140%^000000",
		"[Lv.3]: ^777777Atk 160%^000000",
		"[Lv.4]: ^777777Atk 180%^000000",
		"[Lv.5]: ^777777Atk 200%^000000",
		"[Lv.6]: ^777777Atk 220%^000000",
		"[Lv.7]: ^777777Atk 240%^000000",
		"[Lv.8]: ^777777Atk 260%^000000",
		"[Lv.9]: ^777777Atk 280%^000000",
		"[Lv.10]: ^777777Atk 300%^000000"
	].join("\n");

	SkillDescription[SKID.MS_BOWLINGBASH] = [
		"Bowling Bash",
		"Skill Form: ^777777Offensive^000000",
		"Target: ^777777Enemy^000000 ",
		"Description: ^777777Strike an enemy with massive force,",
		"causing it to tumble away and damage other",
		"enemies^000000"
	].join("\n");

	SkillDescription[SKID.MS_PARRYING] = [
		" ",
		"Parry",
		"Skill Form: ^777777Supportive^000000",
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
		"Shield Reflect",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Reflect a certain amount of damage",
		"back to the enemy after they inflict damage",
		"with short ranged physical attacks.",
		"^00BB00Requires Shield.^000000"
	].join("\n");

	SkillDescription[SKID.MS_BERSERK] = [
		"Frenzy",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Use the power of rage to increase",
		"MaxHP, Movement Speed and Attack Power.",
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
		"Skill Form: ^777777Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Inflict double damage on a target",
		"by firing two arrows in one attack.^000000"
	].join("\n");

	SkillDescription[SKID.MA_SHOWER] = [
		"Arrow Shower",
		"Skill Form: ^777777Offensive^000000",
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
		"an enemy steps on it. ",
		"^00BB00Each cast requires 1 Trap.^000000",
		"Damage & Duration of Trap by Skill Level",
		"[Lv.1]: ^777777Atk 50%, 65 Sec^000000",
		"[Lv.2]: ^777777Atk 75%, 50 Sec^000000",
		"[Lv.3]: ^777777Atk 100%, 35 Sec^000000",
		"[Lv.4]: ^777777Atk 125%, 20 Sec^000000",
		"[Lv.5]: ^777777Atk 150%, 5 Sec^000000"
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
		"Skill Form: ^000099Supportive^000000",
		"Target: ^777777Trap^000000",
		"Description: ^777777Remove a trap that has been set on",
		"the ground, as well as regain that Trap item.^000000"
	].join("\n");

	SkillDescription[SKID.MA_CHARGEARROW] = [
		"Arrow Repel",
		"Skill Form: ^777777Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Draw the bowstring to its limit to",
		"fire a volley of arrows with enough force to",
		"push the target 4 cells back.^000000"
	].join("\n");

	SkillDescription[SKID.MA_SHARPSHOOTING] = [
		"Focused Arrow Strike",
		"Skill Form: ^777777Offensive^000000",
		"Description: ^777777Shoot an arrow with incredible",
		"might directly towards a targeted spot, greatly",
		"damaging any enemies in its path. This is a",
		"Critical Attack that is calculated as the",
		"caster's Critical Attack Rate +20.^000000",
		"[Lv.1]: ^777777Atk +150%^000000",
		"[Lv.2]: ^777777Atk +200%^000000",
		"[Lv.3]: ^777777Atk +250%^000000",
		"[Lv.4]: ^777777Atk +300%^000000",
		"[Lv.5]: ^777777Atk +350%^000000"
	].join("\n");

	SkillDescription[SKID.ML_PIERCE] = [
		"Pierce",
		"Skill Form: ^777777Offensive^000000",
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
		"Skill Form: ^777777Offensive^000000",
		"Target: ^777777Enemy^000000 ",
		"Description: ^777777A powerful lancing strike made",
		"while riding a Peco Peco. ^00BB00Requires Spear Class",
		"Weapon^777777and can only be performed while mounted",
		"on a Peco Peco.^000000"
	].join("\n");

	SkillDescription[SKID.ML_SPIRALPIERCE] = [
		"Clashing Spiral",
		"Skill Form: ^777777Offensive^000000",
		"Description: ^777777Hit an enemy with spiraling strikes",
		"that immobilize it for a second and inflict an",
		"amount of damage determined by the skill's",
		"level and the weight of the equipped weapon.",
		"This skill's level also affects its cast time",
		"and delay.^000000"
	].join("\n");

	SkillDescription[SKID.ML_DEFENDER] = [
		"Defending Aura",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^Reduce damage inflicted from long ranged",
		"physical attacks at the cost of decreasing",
		"caster's attack and movement speeds for the",
		"skill's duration. Casting this skill again",
		"cancels the Defending Aura status.^000000"
	].join("\n");

	SkillDescription[SKID.ML_AUTOGUARD] = [
		"Guard",
		"Skill Form: ^777777Supportive^000000",
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
		"Sacrifice",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^7777771 Party Member^000000",
		"Description: ^777777Protect a party member by receiving",
		"all damage intended for targeted ally. Sacrifice",
		"only works when level difference between caster",
		"and party member is less than 10. The skill's",
		"effect is canceled when the party member moves",
		"out of the skill's range or dies. Sacrifice",
		"cannot be used for other Crusaders or Paladins.^000000"
	].join("\n");

	SkillDescription[SKID.MER_MAGNIFICAT] = [
		"Magnificat",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^777777Player, Mercenary^000000",
		"Description: ^777777Double the caster and party",
		"members' SP Recovery Rate for the duration of",
		"the skill.^000000"
	].join("\n");

	SkillDescription[SKID.MER_QUICKEN] = [
		"Weapon Quicken",
		"Skill Form: ^777777Supportive^000000",
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
		"Skill Form: ^777777Supportive^bb0000(Fire)^000000",
		"Description: ^777777Detects enemies hidden in the",
		"caster's vicinity.^000000"
	].join("\n");

	SkillDescription[SKID.MER_CRASH] = [
		"Crash",
		"Skill Form: ^000099Offensive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Increase attack damage, and add the",
		"chance of stunning enemies.^000000",
		"[Lv.1]: ^777777Atk 110%, 6% Stun Rate^000000",
		"[Lv.2]: ^777777Atk 120%, 12% Stun Rate^000000",
		"[Lv.3]: ^777777Atk 130%, 18% Stun Rate^000000",
		"[Lv.4]: ^777777Atk 140%, 24% Stun Rate^000000",
		"[Lv.5]: ^777777Atk 150%, 30% Stun Rate^000000"
	].join("\n");

	SkillDescription[SKID.MER_REGAIN] = [
		"Regain",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^777777Player, Mercenary^000000",
		"Description: ^777777Nullify Stun and Sleep",
		"status for the target.^000000"
	].join("\n");

	SkillDescription[SKID.MER_TENDER] = [
		"Tender",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^777777Player, Mercenary^000000",
		"Description: ^777777Nullify Freeze and Stone",
		"status for the target.^000000"
	].join("\n");

	SkillDescription[SKID.MER_BENEDICTION] = [
		"Benediction",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^777777Player, Mercenary^000000",
		"Description: ^777777Nullify Curse and Blind",
		"status for the target.^000000"
	].join("\n");

	SkillDescription[SKID.MER_RECUPERATE] = [
		"Recuperate",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^777777Player, Mercenary^000000",
		"Description: ^777777Nullify Silence and Poison",
		"status for the target.^000000"
	].join("\n");

	SkillDescription[SKID.MER_MENTALCURE] = [
		"Mental Cure",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^777777Player, Mercenary^000000",
		"Description: ^777777Nullify Confusion and Poison",
		"status for the target.^000000"
	].join("\n");

	SkillDescription[SKID.MER_COMPRESS] = [
		"Compress",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^777777Player, Mercenary^000000",
		"Description: ^777777Nullify Bleeding status",
		"for the target.^000000"
	].join("\n");

	SkillDescription[SKID.MER_PROVOKE] = [
		"Provoke",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Enrage a target to decrease its",
		"Defense while increasing its Attack Strength.",
		"Ineffective against the Undead.^000000",
		"Effect of Provoke on Enemies by Skill's Level",
		"[Lv.1]: ^777777+5% Atk, -10% DEF^000000",
		"[Lv.2]: ^777777+8% Atk, -15% DEF^000000",
		"[Lv.3]: ^777777+11% Atk, -20% DEF^000000",
		"[Lv.4]: ^777777+14% Atk, -25% DEF^000000",
		"[Lv.5]: ^777777+17% Atk, -30% DEF^000000",
		"[Lv.6]: ^777777+20% Atk, -35% DEF^000000",
		"[Lv.7]: ^777777+23% Atk, -40% DEF^000000",
		"[Lv.8]: ^777777+26% Atk, -45% DEF^000000",
		"[Lv.9]: ^777777+29% Atk, -50% DEF^000000",
		"[Lv.10]: ^777777+32% Atk, -55% DEF^000000"
	].join("\n");

	SkillDescription[SKID.MER_AUTOBERSERK] = [
		"Berserk",
		"Skill Form: ^000099Passive^000000",
		"Description: ^777777Empowered by rage, character enters",
		"condition that is equivalent to Level 10 Provoke",
		"status when HP is reduced to less than 25% of",
		"MaxHP. Provoked status lasts until character",
		"HP is restored to more than 25% of MaxHP or",
		"if Provoke effect is nullified.^000000"
	].join("\n");

	SkillDescription[SKID.MER_DECAGI] = [
		"Decrease AGI",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^777777Enemy^000000",
		"Description: ^777777Decrease target's Movement and",
		"Attack Speeds for the skill's duration.^000000"
	].join("\n");

	SkillDescription[SKID.MER_SCAPEGOAT] = [
		"Scapegoat",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Mercenary will sacrifice himself to",
		"give his remaining HP to his summoner.^000000"
	].join("\n");

	SkillDescription[SKID.MER_LEXDIVINA] = [
		"Lex Divina",
		"Skill Form: ^777777Exorcism^000000",
		"Target: ^777777Enemy^000000 ",
		"Description: ^777777Silence an enemy, temporarily",
		"disabling its use of skills, for a set duration.^000000"
	].join("\n");

	SkillDescription[SKID.MER_ESTIMATION] = [
		"Sense",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^777777Monster^000000",
		"Description: ^777777Provide the targeted monster's",
		"information to the caster and all party members.^000000"
	].join("\n");

	SkillDescription[SKID.GD_APPROVAL] = [
		"Official Guild Approval",
		"Skill Form: ^777777Passive^000000",
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
		"Contract With Kafra",
		"Skill Form: ^777777Passive^000000",
		"Target: ^777777Guild^000000",
		"Description: ^777777Contract",
		"with the Kafra Corporation",
		"to hire a personal Kafra",
		"Employee for territory",
		"owned by your guild.^000000"
	].join("\n");

	SkillDescription[SKID.GD_GUARDRESEARCH] = [
		"Guardian Research",
		"Skill Form: ^777777Passive^000000",
		"Target: ^777777Guild^000000",
		"Description: ^777777The study",
		"of Guardian technology",
		"which enables guilds to",
		"create Guardians that will",
		"protect their territories.^000000"
	].join("\n");

	SkillDescription[SKID.GD_GUARDUP] = [
		"Strengthen Guardians",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777Enhance the strength of Guardians",
		"that are protecting Guild Castles in your",
		"Guild's possession. This skill's level affects",
		"the Guardians' Attack Power and Speed.^000000"
	].join("\n");

	SkillDescription[SKID.GD_EXTENSION] = [
		"Guild Extension",
		"Skill Form: ^777777Passive^000000",
		"Target: ^777777Guild^000000",
		"Description: ^777777Increase",
		"the Maximum member",
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

	SkillDescription[SKID.GD_GLORYGUILD] = [].join("\n");

	SkillDescription[SKID.GD_LEADERSHIP] = [
		"Skill Form: ^000099Passive^000000",
		"Target: ^777777Guildsmen^00000",
		"Max Lv : ^7777775^000000",
		"Range: ^7777775 cells around the caster^000000",
		"Description: ^777777All guild members within 5x5 cells of the guild master receives 1x skill level STR bonus.^000000"
	].join("\n");

	SkillDescription[SKID.GD_GLORYWOUNDS] = [
		"Glorious Wounds",
		"Skill Form: ^000099Passive^000000",
		"Target: ^777777Guildsmen^00000",
		"Max Lv : ^7777775^000000",
		"Range: ^7777775 cells around the caster^000000",
		"Description: ^777777All guild members within 5x5 cells of the guild master receives 1x skill level VIT bonus.^000000"
	].join("\n");

	SkillDescription[SKID.GD_SOULCOLD] = [
		"Cold Heart",
		"Skill Form: ^000099Passive^000000",
		"Target: ^777777Guildsmen^00000",
		"Max Lv : ^7777775^000000",
		"Range: ^7777775 cells around the caster^000000",
		"Description: ^777777All guild members within 5x5 cells of the guild master receives 1x skill level AGI bonus^000000"
	].join("\n");

	SkillDescription[SKID.GD_HAWKEYES] = [
		"Sharp Gaze",
		"Skill Form: ^000099Passive^000000",
		"Target: ^777777Guildsmen^00000",
		"Max Lv : ^7777775^000000",
		"Range: ^7777775 cells around the caster^000000",
		"Description: ^777777All guild members within 5x5 cells of the guild master receives 1x skill level DEX bonus.^000000"
	].join("\n");

	SkillDescription[SKID.GD_BATTLEORDER] = [
		"Battle Command",
		"Skill Form: ^000099Supportive^000000",
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
		"Skill Form: ^777777Supportive^000000",
		"Target: ^777777Guildsmen^000000",
		"Range: ^777777Guildmaster's View^000000\t",
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
		"Restoration",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^777777Guildsmen^000000",
		"Range: ^777777Guildmaster's View^000000\t",
		"Description: ^777777This skill is only enabled during",
		"WoE (Guild War). The Guildmaster can restore",
		"90% MaxHP/SP for all Guildsmen within the",
		"screen. Once used, this skill cannot be cast",
		"again for 5 minutes.^000000"
	].join("\n");

	SkillDescription[SKID.GD_EMERGENCYCALL] = [
		"Urgent Call",
		"Skill Form: ^777777Supportive^000000",
		"Target: ^777777All Online Guildsmen^000000",
		"Description: ^777777This skill is only enabled during",
		"WoE (Guild War). The Guildmaster can summon",
		"all online members of his guild to his side.",
		"Once used, this skill cannot be cast again",
		"for 5 minutes.^000000"
	].join("\n");

	SkillDescription[SKID.GD_DEVELOPMENT] = [
		"Permanent Development",
		"Skill Form: ^777777Passive^000000",
		"Description: ^777777This skill enables a 50% chance",
		"of adding an extra point whenever an investment",
		"in the Guild's commercial growth is made.^000000"
	].join("\n");

	SkillDescription[SKID.GD_ITEMEMERGENCYCALL] = [].join("\n");

	SkillDescription[SKID.MH_SUMMON_LEGION] = [
		"Summon Legion",
		"Max Lv : 5",
		"Description : ^777777 Summon a group of bugs, and attack 1 target enemy.",
		"Availble for summoning more powerful group of bugs based on the skill level.^000000",
		" [Lv 1] ^777777 HORNET Summon / duration 20 Second ^000000",
		" [Lv 2] ^777777 GIANT_HONET Summon / duration 30 Second ^000000",
		" [Lv 3] ^777777 GIANT_HONET Summon / duration 40 Second ^000000",
		" [Lv 4] ^777777 LUCIOLA_VESPA Summon / duration 50 Second ^000000",
		" [Lv 5] ^777777 LUCIOLA_VESPA Summon / duration 60 Second ^000000"
	].join("\n");

	SkillDescription[SKID.MH_NEEDLE_OF_PARALYZE] = [
		"Needle Of Paralyze",
		"Max Lv : 10",
		"Description : ^777777 Deals poison damage that ignores target's physical defense,",
		"and puts a target in Paralysis effect.",
		"Target in Paralysis effect cannot move, casting time increases, defense decreases.",
		"Damage increases based on BaseLv and DEX, and Paralysis duration decreases based on target's VIT and LUK. ^000000",
		" [Lv 1] ^777777Physical ATK 450% / Paralysis Chance 35%^000000",
		" [Lv 2] ^777777Physical ATK 900% / Paralysis Chance 40%^000000",
		" [Lv 3] ^777777Physical ATK 1350% / Paralysis Chance 45%^000000",
		" [Lv 4] ^777777Physical ATK 1800% / Paralysis Chance 50%^000000",
		" [Lv 5] ^777777Physical ATK 2250% / Paralysis Chance 55%^000000",
		" [Lv 6] ^777777Physical ATK 2700% / Paralysis Chance 60%^000000",
		" [Lv 7] ^777777Physical ATK 3150% / Paralysis Chance 65%^000000",
		" [Lv 8] ^777777Physical ATK 3600% / Paralysis Chance 70%^000000",
		" [Lv 9] ^777777Physical ATK 4050% / Paralysis Chance 75%^000000",
		" [Lv 10] ^777777Physical ATK 4500% / Paralysis Chance 80%^000000"
	].join("\n");

	SkillDescription[SKID.MH_POISON_MIST] = [
		"Poison Mist",
		"Max Lv : 5",
		"Description : ^777777 Throws poison powerders to an area, and deals continuous poison damage to all enemies in AoE.",
		"Gives a fog poisoning effect.",
		"Damage increases based on BaseLv of Homunculus and DEX, can not create more than 1 poison mist at a time.^000000",
		" [Lv 1] ^777777MATK 200% / Area of Effect Duration 3sec^000000",
		" [Lv 2] ^777777MATK 400% / Area of Effect Duration 6sec^000000",
		" [Lv 3] ^777777MATK 600% / Area of Effect Duration 9sec^000000",
		" [Lv 4] ^777777MATK 800% / Area of Effect Duration 12sec^000000",
		" [Lv 5] ^777777MATK 1000% / Area of Effect Duration 15sec^000000"
	].join("\n");

	SkillDescription[SKID.MH_PAIN_KILLER] = [
		"Pain Killer",
		"Max Lv : 10",
		"Description : ^777777 Reduces incoming damage and delays when attacked.^000000",
		" [Lv 1] ^777777Duration 330 sec^000000",
		" [Lv 2] ^777777Duration 360 sec^000000",
		" [Lv 3] ^777777Duration 390 sec^000000",
		" [Lv 4] ^777777Duration 420 sec^000000",
		" [Lv 5] ^777777Duration 450 sec^000000",
		" [Lv 6] ^777777Duration 480 sec^000000",
		" [Lv 7] ^777777Duration 510 sec^000000",
		" [Lv 8] ^777777Duration 540 sec^000000",
		" [Lv 9] ^777777Duration 570 sec^000000",
		" [Lv 10] ^777777Duration 600 sec^000000"
	].join("\n");

	SkillDescription[SKID.MH_LIGHT_OF_REGENE] = [
		"Light Of Regenerate",
		"Max Lv : 5",
		"Description : ^777777 Homunculus uses light of regeneration, and resurrects owner.",
		"If you have another item that resurrects you from death, the item will be used before this effect..",
		"HP recovery increases based on skill level. ^000000",
		" [Lv 1] ^777777Duration 360  sec ^000000",
		" [Lv 2] ^777777Duration 420  sec ^000000",
		" [Lv 3] ^777777Duration 480  sec ^000000",
		" [Lv 4] ^777777Duration 540  sec ^000000",
		" [Lv 5] ^777777Duration 600  sec ^000000"
	].join("\n");

	SkillDescription[SKID.MH_OVERED_BOOST] = [
		"Over Boost",
		"Max Lv : 5",
		"Description : ^777777 Increase dodge rate ASPD of homunculus and the caster, ",
		"but reduces defense by 50%. During duration, other dodge or ASPD related effects does not affect you.",
		"After duration, hunger drops by 50%, owner's SP drained by 50%",
		" [Lv 1] ^777777FLEE 440 / ASPD 182 ^000000",
		" [Lv 2] ^777777FLEE 480 / ASPD 184 ^000000",
		" [Lv 3] ^777777FLEE 520 / ASPD 186 ^000000",
		" [Lv 4] ^777777FLEE 560 / ASPD 188 ^000000",
		" [Lv 5] ^777777FLEE 600 / ASPD 190 ^000000"
	].join("\n");

	SkillDescription[SKID.MH_ERASER_CUTTER] = [
		"Eraser Cutter",
		"Max Lv : 10",
		"Description : ^777777 Attacks a target using a sonic knife.",
		"Deals neutral magic damage that ignores target's magic defense.",
		"Damage increases based on BaseLv of Homunculus and INT.^000000",
		" [Lv 1] ^777777MATK 450% ^000000",
		" [Lv 2] ^777777MATK 900% ^000000",
		" [Lv 3] ^777777MATK 1350% ^000000",
		" [Lv 4] ^777777MATK 1800% ^000000",
		" [Lv 5] ^777777MATK 2250% ^000000",
		" [Lv 6] ^777777MATK 2700% ^000000",
		" [Lv 7] ^777777MATK 3150% ^000000",
		" [Lv 8] ^777777MATK 3600% ^000000",
		" [Lv 9] ^777777MATK 4050% ^000000",
		" [Lv 10] ^777777MATK 4500% ^000000"
	].join("\n");

	SkillDescription[SKID.MH_XENO_SLASHER] = [
		"Xeno Slasher",
		"Max Lv : 10",
		"Description : ^777777 Deals wind property magic damage to a target and enemies around that ignores target's magic defense. ",
		"Damage increases based on BaseLv of Homunculus and INT.^000000",
		" [Lv 1] ^777777MATK 350% / 3x3Cell ^000000",
		" [Lv 2] ^777777MATK 700% / 3x3Cell ^000000",
		" [Lv 3] ^777777MATK1050% / 3x3Cell ^000000",
		" [Lv 4] ^777777MATK1400% / 5x5Cell ^000000",
		" [Lv 5] ^777777MATK1750% / 5x5Cell ^000000",
		" [Lv 6] ^777777MATK2100% / 5x5Cell ^000000",
		" [Lv 7] ^777777MATK2450% / 7x7Cell ^000000",
		" [Lv 8] ^777777MATK2800% / 7x7Cell ^000000",
		" [Lv 9] ^777777MATK3150% / 7x7Cell ^000000",
		" [Lv 10] ^777777MATK3500% / 9x9Cell ^000000"
	].join("\n");

	SkillDescription[SKID.MH_SILENT_BREEZE] = [
		"Silent Breeze",
		"Max Lv : 5",
		"Description : ^777777 Wind of silence. Give certain HP recovery to 1 target, Give immediate mute Effect to",
		"prevent target from casting any skills. And this mute Effect will be removing other certain curse effects.",
		"Success Rate doubled when casting to ally target. ^000000",
		" [Lv 1] ^777777 duration 9 Second ^000000",
		" [Lv 2] ^777777 duration 12 Second ^000000",
		" [Lv 3] ^777777 duration 15 Second ^000000",
		" [Lv 4] ^777777 duration 18 Second ^000000",
		" [Lv 5] ^777777 duration 21 Second ^000000"
	].join("\n");

	SkillDescription[SKID.MH_STAHL_HORN] = [
		"Stahl Horn",
		"Max Lv : 10",
		"Description : ^777777 Dash attack to a target, deals damage that has a chance to stun.",
		"Damage increases based on BaseLv of Homunculus and VIT.^000000",
		" [Lv 1] ^777777Physical ATK 1800% / Chance to stun 22%^000000",
		" [Lv 2] ^777777PhysicalATK 2100% / Chance to stun 24%^000000",
		" [Lv 3] ^777777PhysicalATK 2400% / Chance to stun 26%^000000",
		" [Lv 4] ^777777PhysicalATK 2700% / Chance to stun 28%^000000",
		" [Lv 5] ^777777PhysicalATK 3000% / Chance to stun 30%^000000",
		" [Lv 6] ^777777PhysicalATK 3300% / Chance to stun 32%^000000",
		" [Lv 7] ^777777PhysicalATK 3600% / Chance to stun 34%^000000",
		" [Lv 8] ^777777PhysicalATK 3900% / Chance to stun 36%^000000",
		" [Lv 9] ^777777Physical ATK 4200% / Chance to stun 38%^000000",
		" [Lv 10] ^777777Physical ATK 4500% / Chance to stun 40%^000000"
	].join("\n");

	SkillDescription[SKID.MH_GOLDENE_FERSE] = [
		"Goldene Ferse",
		"Max Lv : 5",
		"Description : ^777777 Homumculus' Flee Rate and Attack speed increase, and normal attack turns into Holy property damage",
		"for certain rate. During the effect duration [Stahl Horn] will be activated as a holy property attack when casting.",
		"This skill cannot be casted along with [Angriffs_Modus] skill. ^000000",
		" [Lv 1] ^777777 Flee Rate + 20  / Attack Speed 10% Increase / 4% Rate Holy property damage Activation / duration 30 Second ^000000",
		" [Lv 2] ^777777 Flee Rate + 30  / Attack Speed 14% Increase / 6% Rate Holy property damage Activation / duration 45 Second ^000000",
		" [Lv 3] ^777777 Flee Rate + 40  / Attack Speed 18% Increase / 8% Rate Holy property damage Activation / duration 60 Second ^000000",
		" [Lv 4] ^777777 Flee Rate + 50  / Attack Speed 22% Increase / 10% Rate Holy property damage Activation / duration 75 Second ^000000",
		" [Lv 5] ^777777 Flee Rate + 60  / Attack Speed 26% Increase / 12% Rate Holy property damage Activation / duration 90 Second ^000000"
	].join("\n");

	SkillDescription[SKID.MH_STEINWAND] = [
		"Stein Wand",
		"Max Lv : 5",
		"Description : ^777777 Creates a Safety Wall under the caster and Homunculus, increases physical damage and magical damage during the duration.^000000",
		" [Lv 1] ^777777DEF +100, MDEF + 30, Duration 200 sec^000000",
		" [Lv 2] ^777777DEF +200, MDEF + 60, Duration 300 sec^000000",
		" [Lv 3] ^777777DEF +300, MDEF + 90, Duration 400 sec^000000",
		" [Lv 4] ^777777DEF +400, MDEF +120, Duration 500 sec^000000",
		" [Lv 5] ^777777DEF +500, MDEF +150, Duration 600 sec^000000"
	].join("\n");

	SkillDescription[SKID.MH_HEILIGE_STANGE] = [
		"Heilige Stange",
		"Max Lv : 10",
		"Description : ^777777 Deals holy magic damage to the target and surrounding enemies that ignores the target's magic defense.",
		"Damage increases based on BaseLv of Homunculus and VIT.^000000",
		" [Lv 1] ^777777MATK 1750% / 3 x 3 Cell ^000000",
		" [Lv 2] ^777777MATK 2000% / 3 x 3 Cell ^000000",
		" [Lv 3] ^777777MATK 2250% / 3 x 3 Cell ^000000",
		" [Lv 4] ^777777MATK 2500% /  3 x 3 Cell ^000000",
		" [Lv 5] ^777777MATK 2750% / 5 x 5 Cell ^000000",
		" [Lv 6] ^777777MATK 3000% / 5 x 5 Cell ^000000",
		" [Lv 7] ^777777MATK 3250% / 5 x 5 Cell ^000000",
		" [Lv 8] ^777777MATK 3500% / 5 x 5 Cell ^000000",
		" [Lv 9] ^777777MATK 3750% / 7 x 7 Cell ^000000",
		" [Lv 10] ^777777MATK 4000% / 7 x 7 Cell ^000000"
	].join("\n");

	SkillDescription[SKID.MH_ANGRIFFS_MODUS] = [
		"Angriffs_Modus",
		"Max Lv : 5",
		"Description : ^777777 Increase Homunculus' ATK for certain period, Defense and Flee Rate decrease",
		"greatly. Also, this skill cannot be used with [Goldene Ferse] skill. ^000000",
		" [Lv 1] ^777777 ATK +70  / Defense -50  / Flee Rate -60 / duration 30 Second ^000000",
		" [Lv 2] ^777777 ATK +90  / Defense -70 / Flee Rate -80 / duration 45 Second ^000000",
		" [Lv 3] ^777777 ATK +110 / Defense -90 / Flee Rate - 100 / duration 60 Second ^000000",
		" [Lv 4] ^777777 ATK +130 / Defense -110 / Flee Rate -120 / duration 75 Second ^000000",
		" [Lv 5] ^777777 ATK +150 / Defense -130 / Flee Rate -140 / duration 90 Second ^000000"
	].join("\n");

	SkillDescription[SKID.MH_STYLE_CHANGE] = [
		"Style Change",
		"Max Lv : 1",
		"Description : ^777777 Changes Homunculus' style from Fighter to Grappler, or from Grappler to Fighter.",
		"When attacking or getting damaged during Fighter status, gathers Spirit Sphere for certain rate. ^000000"
	].join("\n");

	SkillDescription[SKID.MH_SONIC_CRAW] = [
		"Sonic_Claw",
		"Max Lv : 5",
		"Description : ^777777 Can be used while in Fighting Style. Rapidly scratches a target.",
		"Attack count is based on the Spheres summoned. Cannot be casted without it.",
		"Damage increases based on BaseLv of Homunculus.^000000",
		" [Lv 1] ^777777ATK 60%  ^000000",
		" [Lv 2] ^777777ATK 120%  ^000000",
		" [Lv 3] ^777777ATK 180% ^000000",
		" [Lv 4] ^777777ATK 240% ^000000",
		" [Lv 5] ^777777ATK 300% ^000000"
	].join("\n");

	SkillDescription[SKID.MH_SILVERVEIN_RUSH] = [
		"Silvervein Rush",
		"Max Lv : 10",
		"Description : ^777777 Can be used while in Fighting Style. Can only be casted after Sonic Claw. ",
		"Consumes 1 Sphere.",
		"Inflicts damage to a target. Damage increases based on BaseLv of Homunculus and STR. ^000000",
		" [Lv 1] ^777777ATK 250%^000000",
		" [Lv 2] ^777777ATK 500%^000000",
		" [Lv 3] ^777777ATK 750%^000000",
		" [Lv 4] ^777777ATK1000%^000000",
		" [Lv 5] ^777777ATK1250%^000000",
		" [Lv 6] ^777777ATK1500%^000000",
		" [Lv 7] ^777777ATK1750%^000000",
		" [Lv 8] ^777777ATK2000%^000000",
		" [Lv 9] ^777777ATK2250%^000000",
		" [Lv 10] ^777777ATK2500%^000000"
	].join("\n");

	SkillDescription[SKID.MH_MIDNIGHT_FRENZY] = [
		"Midnight Frenzy",
		"Max Lv : 10",
		"Description : ^777777 Can be used in Fighting Style. Can be casted as a combo, followed by Silvervein Rush.",
		"Consumes 1 Sphere when used. Deals damage to a target.",
		"Damage increases based on BaseLv of Homunculus and STR.^000000",
		"After using the skill, can use Sonic Crow as a combo. ^000000",
		" [Lv 1] ^777777ATK 450%^000000",
		" [Lv 2] ^777777ATK 900%^000000",
		" [Lv 3] ^777777ATK 1350%^000000",
		" [Lv 4] ^777777ATK 1800%^000000",
		" [Lv 5] ^777777ATK 2250%^000000",
		" [Lv 6] ^777777ATK 2700%^000000",
		" [Lv 7] ^777777ATK 3150%^000000",
		" [Lv 8] ^777777ATK 3600%^000000",
		" [Lv 9] ^777777ATK 4050%^000000",
		" [Lv 10] ^777777ATK 4500%^000000"
	].join("\n");

	SkillDescription[SKID.MH_TINDER_BREAKER] = [
		"Tinder Breaker",
		"Max Lv : 5",
		"Description : ^777777 Gets close to a target and breaks its joints.",
		"Deals special damage to a target, and reduce its dodge rate by 50%",
		"Consumes 1 Sphere, damage increases based on BaseLv of Homunculus, and Dodge Rate reduction based on STR.^000000",
		" [Lv 1] ^777777ATK 2500 ^000000",
		" [Lv 2] ^777777ATK 5000 ^000000",
		" [Lv 3] ^777777ATK 7500 ^000000",
		" [Lv 4] ^777777ATK 10000 ^000000",
		" [Lv 5] ^777777ATK 12500^000000"
	].join("\n");

	SkillDescription[SKID.MH_CBC] = [
		"C.B.C (Continual Break Combo)",
		"Max Lv : 5",
		"Description : ^777777 Can only be used after Tinder Break. Consumes 1 Sphere.",
		"Deals special damage to a target. Damage increases based on BaseLv of Homunculus. ^000000",
		" [Lv 1] ^777777ATK 4000 ^000000",
		" [Lv 2] ^777777ATK 8000 ^000000",
		" [Lv 3] ^777777ATK 12000 ^000000",
		" [Lv 4] ^777777ATK 16000 ^000000",
		" [Lv 5] ^777777ATK 20000^000000"
	].join("\n");

	SkillDescription[SKID.MH_EQC] = [
		"E.Q.C (Eternal Quick Combo)",
		"Max Lv : 5",
		"Description : ^777777 Can only be used after C.B.C. Consumes 2 Spheres.",
		"Deals special damage to a target. Damage increases based on BaseLv of Homunculus. ^000000",
		" [Lv 1] ^777777ATK 6000 ^000000",
		" [Lv 2] ^777777ATK 12000 ^000000",
		" [Lv 3] ^777777ATK 18000 ^000000",
		" [Lv 4] ^777777ATK 24000 ^000000",
		" [Lv 5] ^777777ATK 30000 ^000000"
	].join("\n");

	SkillDescription[SKID.MH_MAGMA_FLOW] = [
		"Magma Flow",
		"Max Lv : 5",
		"Description : ^777777 Erupt magma for certain rate everytime Homunculus gets damaged.",
		"Give fire property damage to all enemies around the Homunculus.^000000",
		" [Lv 1] ^777777 ATK 100% /  Range 3 x 3  / Activation Rate 3 %^000000",
		" [Lv 2] ^777777 ATK 200% /  Range 3 x 3  / Activation Rate 6 % ^000000",
		" [Lv 3] ^777777 ATK 300% /  Range 3 x 3  / Activation Rate 9 %^000000",
		" [Lv 4] ^777777 ATK 400% /  Range 5 x 5  / Activation Rate 12 % ^000000",
		" [Lv 5] ^777777 ATK 500% /  Range 5 x 5  / Activation Rate 15 %^000000"
	].join("\n");

	SkillDescription[SKID.MH_GRANITIC_ARMOR] = [
		"Granitic Armor",
		"Max Lv : 5",
		"Description : ^777777 Create a granite based strong armour, temporarily increase Homunculs and master's defense",
		"for reducing damage. But, certain amount of HP after the skill duration",
		"Duration is for60 Seconds. ^000000",
		" [Lv 1] ^777777 Damage 2% Reduce / HP 6% Loss ^000000",
		" [Lv 2] ^777777 Damage 4% Reduce / HP 12% Loss ^000000",
		" [Lv 3] ^777777 Damage 6% Reduce / HP 18% Loss^000000",
		" [Lv 4] ^777777 Damage 8% Reduce / HP 24% Loss ^000000",
		" [Lv 5] ^777777 Damage 10% Reduce / HP 30% Loss^000000"
	].join("\n");

	SkillDescription[SKID.MH_LAVA_SLIDE] = [
		"Lava Slide",
		"Max Lv : 10",
		"Description : ^777777 Deals fire property physical damage to all enemies in AoE.",
		"Damage increases based on BaseLv of Homunculus and STR, can not create more than 1 lava at a time.^000000",
		" [Lv 1] ^777777Physical ATK 50% / Area of Effect Duration 6sec^000000",
		" [Lv 2] ^777777Physical ATK 100% / Area of Effect Duration 7sec^000000",
		" [Lv 3] ^777777Physical ATK 150% / Area of Effect Duration 8sec^000000",
		" [Lv 4] ^777777Physical ATK 200% / Area of Effect Duration 9sec^000000",
		" [Lv 5] ^777777Physical ATK 250% / Area of Effect Duration 10 sec^000000",
		" [Lv 6] ^777777Physical ATK 300% / Area of Effect Duration 11sec^000000",
		" [Lv 7] ^777777Physical ATK 350% / Area of Effect Duration 12sec^000000",
		" [Lv 8] ^777777Physical ATK 400% / Area of Effect Duration 13sec^000000",
		" [Lv 9] ^777777Physical ATK 450% / Area of Effect Duration 14sec^000000",
		" [Lv 10] ^777777Physical ATK 500% / Area of Effect Duration 15sec^000000"
	].join("\n");

	SkillDescription[SKID.MH_PYROCLASTIC] = [
		"Pyroclastic",
		"Max Lv : 10",
		"Description : ^777777 Caster's weapon ATK and Humunculus ATK increases. Gives additional debuff, Divest Weapon.^000000",
		" [Lv 1] ^777777Duration 330 sec^000000",
		" [Lv 2] ^777777Duration 360 sec^000000",
		" [Lv 3] ^777777Duration 390 sec^000000",
		" [Lv 4] ^777777Duration 420 sec^000000",
		" [Lv 5] ^777777Duration 450 sec^000000",
		" [Lv 6] ^777777Duration 480 sec^000000",
		" [Lv 7] ^777777Duration 510 sec^000000",
		" [Lv 8] ^777777Duration 540 sec^000000",
		" [Lv 9] ^777777Duration 570 sec^000000",
		" [Lv 10] ^777777Duration 600 sec^000000"
	].join("\n");

	SkillDescription[SKID.MH_VOLCANIC_ASH] = [
		"Volcanic Ash",
		"Max Lv : 5",
		"Description : ^777777 Spray volcanic ashes to the ground, give curse : Volcanic Ash effect to all tragets in the skill Range.",
		"Volcanic ash effected target will loose half of Accuracy rate, and gain 50% of failing rate when casting skills.",
		"Also, there will be additional damage given when getting Fire property attack from ash effecting Range. 50% defense decreasing effect",
		"given for plant type monsters, 50% AtK and Flee Rate effect given for water type monsters.",
		"Volcanic ash effect's duration increase based on skill level. Skill is possible for casting 3 times to the ground.^000000",
		" [Lv 1] ^777777 Effect duration 8 Second ^000000",
		" [Lv 2] ^777777 Effect duration 16 Second ^000000",
		" [Lv 3] ^777777 Effect duration 24 Second ^000000",
		" [Lv 4] ^777777 Effect duration 32 Second ^000000",
		" [Lv 5] ^777777 Effect duration 40 Second ^000000"
	].join("\n");

	SkillDescription[SKID.KO_YAMIKUMO] = [
		"Shadow Hiding",
		"Max Lv : 1",
		"^777777Skill Requirement: Shadow Slash Lv. 5^000000",
		"Description: ^777777Enables you to hide yourself. Basically the same as Thief's Hiding skill.",
		"The skill is canceled if your SP reaches 0 or if you cast it again. Shadow Hiding continuously consumes",
		"SP for its duration.^000000"
	].join("\n");

	SkillDescription[SKID.KO_RIGHT] = [
		"Righthand Mastery",
		"Max Lv : 5  (Passive)",
		"Description: ^777777Restores your right-hand ATK, which decreases when you're equipped with two weapons.",
		"At Levels 4 and 5, it also increases your ATK past the single-wield limit.^000000",
		"[Level 1]: ^77777780% of ATK^000000",
		"[Level 2]: ^77777790% of ATK^000000",
		"[Level 3]: ^777777100% of ATK^000000",
		"[Level 4]: ^777777110% of ATK^000000",
		"[Level 5]: ^777777120% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.KO_LEFT] = [
		"Lefthand Mastery",
		"Max Lv : 5 (Passive)",
		"Description: ^777777Restores your left-hand ATK, which decreases when you're equipped with two weapons.^000000",
		"[Level 1]: ^77777760% of ATK^000000",
		"[Level 2]: ^77777770% of ATK^000000",
		"[Level 3]: ^77777780% of ATK^000000",
		"[Level 4]: ^77777790% of ATK^000000",
		"[Level 5]: ^777777100% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.KO_JYUMONJIKIRI] = [
		"Cross Slash",
		"Max Lv: 10",
		"^777777Skill Requirement: Shadow Hiding Lv. 1 ^000000",
		"Description: A Kagerou and Oboro Co-op skill. Deliver a Cross Slash, causing Cross Wound on enemies for 3 seconds.",
		"Cross Wound intensifies Cross Slash damage on the enemies.",
		"The higher your Base Level, the greater the additional damage.^000000",
		"[Level 1]: ^777777200% of ATK/Attack Range: 4 Cells^000000",
		"[Level 2]: ^777777400% of ATK/Attack Range: 4 Cells^000000",
		"[Level 3]: ^777777600% of ATK/Attack Range: 4 Cells^000000",
		"[Level 4]: ^777777800% of ATK/Attack Range: 5 Cells^000000",
		"[Level 5]: ^777777 1,000% of ATK/Attack Range: 5 Cells^000000",
		"[Level 6]: ^777777 1,200% of ATK/Attack Range: 5 Cells^000000",
		"[Level 7]: ^777777 1,400% of ATK/Attack Range: 6 Cells^000000",
		"[Level 8]: ^777777 1,600% of ATK/Attack Range: 6 Cells^000000",
		"[Level 9]: ^7777771,800% of ATK/Attack Range: 6 Cells^000000",
		"[Level 10]: ^7777772,000% of ATK/Attack Range: 7 Cells^000000"
	].join("\n");

	SkillDescription[SKID.KO_SETSUDAN] = [
		"Soul Cutter",
		"Max Lv : 5",
		"^777777Skill Requirement: Cross Slash Lv. 2 ^000000",
		"Description: Inflicts additional damage on targets with the Soul Linker's Soul buffs on them.",
		"Also, force-cancels the Soul skills. The higher the Soul skill level, the greater this skill's additional damage. ^000000",
		"[Level 1]: ^777777 100% of ATK^000000",
		"[Level 2]: ^777777 200% of ATK^000000",
		"[Level 3]: ^777777 300% of ATK^000000",
		"[Level 4]: ^777777 400% of ATK^000000",
		"[Level 5]: ^777777 500% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.KO_BAKURETSU] = [
		"Kunai Explosion",
		"Max Lv : 5 ",
		"^777777Skill Requirement: Throw Kunai Lv. 5^000000",
		"Description: Throw an explosive kunai at a target and inflict damage on and around the target.",
		"This skill consumes 1 Explosive Kunai per use. Explosive Kunais are consumed directly from your inventory. (Can't be equipped)^000000",
		"[Level 1]: ^777777 Attack Range: 7 Cells/Effective Range: 5 x5 Cells^000000",
		"[Level 2]: ^777777 Attack Range: 8 Cells/Effective Range: 5 x5 Cells^000000",
		"[Level 3]: ^777777Attack Range: 9 Cells/Effective Range: 5 x5 Cells^000000",
		"[Level 4]: ^777777 Attack Range: 10 Cells/Effective Range: 5 x5 Cells^000000",
		"[Level 5]: ^777777 Attack Range: 11 Cells/Effective Range: 5 x5 Cells^000000"
	].join("\n");

	SkillDescription[SKID.KO_HAPPOKUNAI] = [
		"Kunai Splash",
		"Max Lv : 5 ",
		"^777777Skill Requirement: Kunai Explosion Lv. 1^000000",
		"Description: Attack all surrounding enemies within range with kunais.",
		"This skill consumes 2 kunais per use.^000000",
		"[Level 1]: ^777777 Range: 9 x9 Cells^000000",
		"[Level 2]: ^777777 Range: 9 x9 Cells^000000",
		"[Level 3]: ^777777 Range: 9 x9 Cells^000000",
		"[Level 4]: ^777777 Range: 9 x9 Cells^000000",
		"[Level 5]: ^777777Range: 11 x11 Cells^000000"
	].join("\n");

	SkillDescription[SKID.KO_MUCHANAGE] = [
		"Rapid Throw",
		"Max Lv : 10 ",
		"^777777Skill Requirement: Makibishi Lv. 3^000000",
		"Description: A souped-up version of Ninja's [Coin Throw]. Throw up to 100,000 Zeny at all enemies within range, inflicting random, DEF-ignoring splashed damage. This skill's damage is halved against Boss monsters.",
		"[Level 1]: ^777777 Costs 10,000 Zeny and randomly inflicts 5,000 - 10,000 damage.^000000",
		"[Level 2]: ^777777 Costs 20,000 Zeny and randomly inflicts 10,000 - 20,000 damage.^000000",
		"[Level 3]: ^777777 Costs 30,000 Zeny and randomly inflicts 15,000 - 30,000 damage.^000000",
		"[Level 4]: ^777777 Costs 40,000 Zeny and randomly inflicts 20,000 - 40,000 damage.^000000",
		"[Level 5]: ^777777 Costs 50,000 Zeny and randomly inflicts 25,000 - 50,000 damage.^000000",
		"[Level 6]: ^777777 Costs 60,000 Zeny and randomly inflicts 30,000 - 60,000 damage.^000000",
		"[Level 7]: ^777777 Costs 70,000 Zeny and randomly inflicts 35,000 - 70,000 damage.^000000",
		"[Level 8]: ^777777 Costs 80,000 Zeny and randomly inflicts 40,000 - 80,000 damage.^000000",
		"[Level 9]: ^777777 Costs 90,000 Zeny and randomly inflicts 45,000 - 90,000 damage.^000000",
		"[Level 10]: ^777777 Costs 100,000 Zeny and randomly inflicts 50,000 - 100,000 damage.^000000"
	].join("\n");

	SkillDescription[SKID.KO_HUUMARANKA] = [
		"Swirling Petal",
		"Max Lv: 10",
		"^777777Skill Requirement: Throw Huuma Shuriken Lv. 5^000000",
		"Description: Throw a Huuma Shuriken at a target and inflict damage on and around the target.",
		"Your Base Level affects your [Throw Huuma Shuriken] Level and your STR affects this skill's ATK.",
		"[Level 1]: ^777777 150% of ATK/Attack Range: 11 Cells^000000",
		"[Level 2]: ^777777 300% of ATK/Attack Range: 11 Cells^000000",
		"[Level 3]: ^777777 450% of ATK/Attack Range: 11 Cells^000000",
		"[Level 4]: ^777777 600% of ATK/Attack Range: 11 Cells^000000",
		"[Level 5]: ^777777 750% of ATK/Attack Range: 11 Cells^000000",
		"[Level 6]: ^777777 900% of ATK/Attack Range: 11 Cells^000000",
		"[Level 7]: ^777777 1,050% of ATK/Attack Range: 11 Cells^000000",
		"[Level 8]: ^777777 1,200% of ATK/Attack Range: 11 Cells^000000",
		"[Level 9]: ^777777 1,350% of ATK/Attack Range: 11 Cells^000000",
		"[Level 10]: ^777777 1,500% of ATK/Attack Range: 11 Cells^000000"
	].join("\n");

	SkillDescription[SKID.KO_MAKIBISHI] = [
		"Makibishi (Caltrop Scatter)",
		"Max Lv : 5 ",
		"^777777Skill Requirement: Throw Coins Lv. 1^000000",
		"Description: Scatter diamond-shaped metal spikes to temporarily Immobilize or Stun enemies around you.",
		"The higher this skill's level, the more Makibishis you can scatter. You can also use this skill while moving.",
		"[Level 1]: ^777777Costs 3 Makibishis^000000",
		"[Level 2]: ^777777Costs 4 Makibishis^000000",
		"[Level 3]: ^777777Costs 5 Makibishis^000000",
		"[Level 4]: ^777777Costs 6 Makibishis^000000",
		"[Level 5]: ^777777Costs 7 Makibishis^000000"
	].join("\n");

	SkillDescription[SKID.KO_MEIKYOUSISUI] = [
		"Pure Soul ",
		"Max Lv : 5 ",
		"^777777Skill Requirement: Ninja Mastery Lv. 10^000000",
		"Description: Concentrate your mind for 10 seconds to restore HP and SP rapidly. You can't move while using this skill.",
		"Creates a chance of ignoring incoming damage for its duration.",
		"[Level 1]: ^777777 HP +2% and SP +1% per sec.  ^000000",
		"[Level 2]: ^777777 HP +4% and SP +2% per sec.  ^000000",
		"[Level 3]: ^777777 HP +6% and SP +3% per sec.  ^000000",
		"[Level 4]: ^777777 HP +8% and SP +4% per sec.  ^000000",
		"[Level 5]: ^777777 HP +10% and SP +5% per sec.  ^000000"
	].join("\n");

	SkillDescription[SKID.KO_ZANZOU] = [
		"Illusion - Shadow",
		"Max Lv : 5 ",
		"^777777Skill Requirement: Cicada Skin Shed Lv. 1^000000",
		"Description: Create a likeness of you using illusion. This clone has a certain amount of HP and disappears if its HP reaches 0.",
		"The higher your MaxSP, the more your clone's HP.",
		"[Level 1]: ^777777 Clone HP: 6,000  ^000000",
		"[Level 2]: ^777777 Clone HP: 9,000   ^000000",
		"[Level 3]: ^777777 Clone HP: 12,000   ^000000",
		"[Level 4]: ^777777 Clone HP: 15,000   ^000000",
		"[Level 5]: ^777777 Clone HP: 18,000   ^000000"
	].join("\n");

	SkillDescription[SKID.KO_KYOUGAKU] = [
		"Illusion - Shock",
		"Max Lv : 5 ",
		"^777777Skill Requirement: Illusion - Bewitch Lv. 2^000000",
		"Description: Cast Illusion on 1 target, turning it into a monster with decreased stats.",
		"During this skill's effect, the target can't switch or remove equipment. Not applicable to allies or monsters.",
		"For WoE only",
		"[Level 1]: ^777777All stats -2 to 3^000000",
		"[Level 2]: ^777777All stats -4 to 6^000000",
		"[Level 3]: ^777777All stats -6 to 9^000000",
		"[Level 4]: ^777777All stats -8 to 12^000000",
		"[Level 5]: ^777777All stats -10 to 15^000000"
	].join("\n");

	SkillDescription[SKID.KO_JYUSATSU] = [
		"Illusion - Death",
		"Max Lv : 5 ",
		"^777777Skill Requirement: Illusion - Shock Lv. 3^000000",
		"Description: Cast Illusion on 1 target, Cursing and decreasing its HP.",
		"Also, create a low chance of [Coma]. [Coma] is only applied to enemies at the same Level as you",
		"or lower. Not applicable to monsters."
	].join("\n");

	SkillDescription[SKID.KO_GENWAKU] = [
		"Illusion - Bewitch",
		"Max Lv : 5 ",
		"^777777Skill Requirement: Cicada Skin Shed Lv. 1^000000",
		"Description: Switch places with a target. This skill creates a chance of [Confusing] you and your target."
	].join("\n");

	SkillDescription[SKID.KO_IZAYOI] = [
		"16th Night ",
		"Max Lv : 5 ",
		"^777777Skill Requirement: Ninja Mastery Lv. 5^000000",
		"Description: Removes Fixed Cast Time from all Ninja skills, halves Variable Cast Time, and increases MATK."
	].join("\n");

	SkillDescription[SKID.KO_KAHU_ENTEN] = [
		"Fire Charm",
		"Max Lv : 1 ",
		"Description: Summon a Fire Spirit by using a Fire Charm to increase the damage of Fire Property skills.",
		"Can summon up to 10 spirits. If 10 spirits are summoned, Weapon Property changes to Fire.",
		"Consumes 1 Fire Charm per use."
	].join("\n");

	SkillDescription[SKID.KO_HYOUHU_HUBUKI] = [
		"Ice Charm",
		"Max Lv : 1 ",
		"Description: Summon an Ice Spirit by using an Ice Charm to increase the damage of Ice Property skills.",
		"Can summon up to 10 spirits. If 10 spirits are summoned, Weapon Property changes to Water.",
		"Consumes 1 Ice Charm per use."
	].join("\n");

	SkillDescription[SKID.KO_KAZEHU_SEIRAN] = [
		"Wind Charm",
		"Max Lv : 1 ",
		"Description: Summon a Wind Spirit by using a Wind Charm to increase the damage of Wind Property skills.",
		"Can summon up to 10 spirits. If 10 spirits are summoned, Weapon Property changes to Wind.",
		"Consumes 1 Wind Charm per use."
	].join("\n");

	SkillDescription[SKID.KO_DOHU_KOUKAI] = [
		"Earth Charm",
		"Max Lv : 1 ",
		"Description: Summon an Earth Spirit by using an Earth Charm to increase the damage of Earth Property skills.",
		"Can summon up to 10 spirits. If 10 spirits are summoned, Weapon Property changes to Earth.",
		"Consumes 1 Earth Charm per use."
	].join("\n");

	SkillDescription[SKID.KO_KAIHOU] = [
		"Release Ninja Spell",
		"Max Lv : 1 ",
		"^777777Skill Requirement: Fire/Ice/Wind/Earth Charm Lv. 1^000000",
		"Description: Discharge the power of your Charms, attacking 1 target. The inflicted damage is of the same property as your summoned Charms."
	].join("\n");

	SkillDescription[SKID.KO_ZENKAI] = [
		"Cast Ninja Spell",
		"Max Lv : 1 ",
		"^777777Skill Requirement : Release Ninja Spell 1,",
		"16th Night 1 ^000000",
		"Description: Release the power of your Charms onto the ground, summoning a circle that creates various effects.",
		"^FF0000 Fire Charm: Causes Ignition to all enemies within range. Also, increases your weapon's ATK if it's of Fire Property.^000000",
		"^0000FF Water Charm: Causes Frozen, Crystallization, or Freezing to all enemies within range. Also, increases your weapon's ATK if it's of Water Property.^000000",
		"^00FF00 Wind Charm: Causes Silence, Sleep, or Deep Sleep to all enemies within range. Also, increases your weapon's ATK if it's of Wind Property.^000000",
		"^FD6202 Earth Charm: Causes Petrification or Poison to all enemies within range. Also, increases your weapon's ATK if it's of Earth Property.^000000"
	].join("\n");

	SkillDescription[SKID.KG_KAGEHUMI] = [
		"Shadow Trampling",
		"Max Lv : 5 ",
		"^777777Skill Requirement: Illusion - Shadow Lv. 1^000000",
		"Description: Temporarily Immobilizes targets that are using certain hiding skills, and force-cancels the skills. Not applicable to monsters.",
		"[Level 1]: ^777777Effective Range: 5 x5 Cells^000000",
		"[Level 2]: ^777777Effective Range: 7 x7 Cells^000000",
		"[Level 3]: ^777777Effective Range: 9 x9 Cells^000000",
		"[Level 4]: ^777777Effective Range: 11 x11 Cells^000000",
		"[Level 5]: ^777777Effective Range: 13 x13 Cells^000000"
	].join("\n");

	SkillDescription[SKID.KG_KYOMU] = [
		"Empty Shadow",
		"Max Lv : 5",
		"^777777Skill Requirement : Shadow Trampling 2 ^000000",
		"Description: Temporarily nullifies a target's Reflection ability.",
		"This skill creates a chance of dispelling its target's skills. Consumes 1 Shadow Orb for use.",
		"[Level 1]: ^777777Duration: 10 sec.^000000",
		"[Level 2]: ^777777Duration: 15 sec.^000000",
		"[Level 3]: ^777777Duration: 20 sec.^000000",
		"[Level 4]: ^777777Duration: 25 sec.^000000",
		"[Level 5]: ^777777Duration: 30 sec.^000000"
	].join("\n");

	SkillDescription[SKID.KG_KAGEMUSYA] = [
		"Shadow Warrior",
		"Max Lv : 5",
		"^777777Skill Requirement : Empty Shadow 3 ^000000",
		"Description: Temporarily grants [Skill: Double Attack] to 1 target, and increases Kunai Explosion, Kunai Splash, Cross Slash, and Swirling Petal damage.",
		"This skill consumes 1 SP per sec. for its duration. Also, consumes 1 Shadow Orb per use.",
		"[Level 1]: ^777777Duration: 60 sec.^000000",
		"[Level 2]: ^777777Duration: 90 sec.^000000",
		"[Level 3]: ^777777Duration: 120 sec.^000000",
		"[Level 4]: ^777777Duration: 150 sec.^000000",
		"[Level 5]: ^777777Duration: 180 sec.^000000"
	].join("\n");

	SkillDescription[SKID.OB_ZANGETSU] = [
		"Distorted Crescent",
		"Max Lv : 5",
		"^777777Skill Requirement : Illusion - Bewitch 1 ^000000",
		"Description: Changes a target's ATK or MATK based on its HP or SP.",
		"[Level 1]: ^777777Duration: 60 sec.^000000",
		"[Level 2]: ^777777Duration: 75 sec.^000000",
		"[Level 3]: ^777777Duration: 90 sec.^000000",
		"[Level 4]: ^777777Duration: 105 sec.^000000",
		"[Level 5]: ^777777Duration: 120 sec.^000000"
	].join("\n");

	SkillDescription[SKID.OB_AKAITSUKI] = [
		"Ominous Moonlight",
		"Max Lv : 5",
		"^777777Skill Requirement: Distorted Crescent Lv. 2 ^000000",
		"Description: Makes certain HP-healing skills inflict damage on their targets instead of restoring their HP.",
		"This skill can't be used on players outside PvP. Not Applicable to allies or Boss monsters.",
		"[Level 1]: ^777777Duration: 10 sec.^000000",
		"[Level 2]: ^777777Duration: 15 sec.^000000",
		"[Level 3]: ^777777Duration: 20 sec.^000000",
		"[Level 4]: ^777777Duration: 25 sec.^000000",
		"[Level 5]: ^777777Duration: 30 sec.^000000"
	].join("\n");

	SkillDescription[SKID.OB_OBOROGENSOU] = [
		"Moonlight Fantasy",
		"Max Lv : 5",
		"^777777Skill Requirement: Ominous Moonlight Lv. 3 ^000000",
		"Description: Randomly increases or decreases a target's HP and SP, depending on its current HP and SP.",
		"Also, makes the target give off splash damage when attacked. Not applicable to monsters.",
		"[Level 1]: ^777777Duration: 10 sec.^000000",
		"[Level 2]: ^777777Duration: 15 sec.^000000",
		"[Level 3]: ^777777Duration: 20 sec.^000000",
		"[Level 4]: ^777777Duration: 25 sec.^000000",
		"[Level 5]: ^777777Duration: 30 sec.^000000"
	].join("\n");

	SkillDescription[SKID.ECLAGE_RECALL] = [
		"Move to Eclage",
		"Max LV : 1",
		"Skill Form : ^777777Supportive^bb0000^000000",
		"Description : ^777777Warp to Eclage Town. 3 seconds of fixed casting. 5 minute reuse time.^000000"
	].join("\n");

	SkillDescription[SKID.GC_DARKCROW] = [
		"Dark Claw",
		"Max Lv : 5",
		"^777777Skill Requirement : Dark Illusion 5 ^000000",
		"Skill Form : ^777777  Active / Damage(Debuff) ^000000",
		"Description : ^777777  Inflicts a wound that deals melee physical damge, and removes target's damage reflection effect.",
		"Wound continues for 20 sec, and target cannot use damage reflection effect, receives more damage from melee physical attack.",
		"Only the half of damage amplification applies to Boss monsters.^000000",
		"[Level 1] : ^777777 Damage 100%/Wound damage 1.3X^000000",
		"[Level 2] : ^777777 Damage 200%/Wound Damage 1.6X^000000",
		"[Level 3] : ^777777 Damage 300%/Wound Damage 1.9X^000000",
		"[Level 4] : ^777777 Damage 400%/Wound Damage 2.2X^000000",
		"[Level 5] : ^777777 Damage 500%/Wound Damage 2.5X^000000"
	].join("\n");

	SkillDescription[SKID.RA_UNLIMIT] = [
		"No Limits",
		"Max Lv : 5",
		"^777777Skill Requirement : Fear Breeze 5^000000",
		"Skill Form : ^777777 Active / Buff (Self) ^000000",
		"Description : ^777777  Borrows power from God of Archery, and gains great power for 150 sec.^000000",
		"[Level 1] : ^777777 Ranged Physical Damage 1.5X^000000",
		"[Level 2] : ^777777 Ranged Physical Damage 2.0X^000000",
		"[Level 3] : ^777777 Ranged Physical Damage 2.5X^000000",
		"[Level 4] : ^777777 Ranged Physical Damage 3.0X^000000",
		"[Level 5] : ^777777 Ranged Physical Damage 3.5X^000000"
	].join("\n");

	SkillDescription[SKID.LG_KINGS_GRACE] = [
		"King's Grace",
		"Max Lv : 5",
		"^777777Skill Requirement : Reflect Damage Reduction 5 ^000000",
		"Skill Form : ^777777  Active / Buff ^000000",
		"Description : ^777777Protects and recovers nearby allies from all status effects and damage, recovers them as well.^000000",
		"^777777Cannot control while being protected. During PVP, only party members can be affected.^000000",
		"^777777Curable status : Poison, Frozen, Freezing, Sleep, Deep Sleep, Stone, Stun, BLeeding, Curse, Confusion, Hallucination, Petrification, Silence, Burning, Fear, Mandragora howling.^000000",
		"[Level 1] : ^777777 Cures ally's status effect for 5 sec, Recovers 4% HP per 1 sec ^000000",
		"[Level 2] : ^777777 Cures ally's status effect for 5 sec, Recovers 5% HP per 1 sec ^000000",
		"[Level 3] : ^777777 Cures ally's status effect for 5 sec, Recovers 6% HP per 1 sec ^000000",
		"[Level 4] : ^777777 Cures ally's status effect for 5 sec, Recovers 7% HP per 1 sec ^000000",
		"[Level 5] : ^777777 Cures ally's status effect for 5 sec, Recovers 8% HP per 1 sec ^000000"
	].join("\n");

	SkillDescription[SKID.RK_DRAGONBREATH_WATER] = [
		"Dragon Water Breath",
		"Max Lv :  10",
		"^777777Skill Requirement : Dragon Training 2^000000",
		"Skill Form : ^777777Area of EffectDamage^000000",
		"Description : ^777777Uses Icebreath. Enemies damaged by the dragon's breath may sometimes freeze and slow down their movement.",
		"When Fightning Spirit Effect, attack property becomes ghost. When Lux Anima effect, attack property becomes neutral.",
		"(When Fighting Spirit and Anima Effect, attack property becomes neutral)^000000"
	].join("\n");

	SkillDescription[SKID.NC_MAGMA_ERUPTION] = [
		"Lava Flow",
		"Max Lv : 5",
		"^777777Skill Requirement : Fire Earth Research 1  ^000000",
		"Type : ^777777  Active ^000000",
		"Description : ^777777 Cause Lava to erupt from the ground in the targeted cell for 5 seconds in a 7x7 area, dealing damage and inflicting stun and burning status. You cannot create more than 3 eruptions at a time. ^000000",
		"[Level 1] : ^777777 1000 fixed damage per 1/2 second / 10% Stun and Burning status chance ^000000",
		"[Level 2] : ^777777 1200 fixed damage per 1/2 second / 20% Stun and Burning status chance ^000000",
		"[Level 3] : ^777777 1400 fixed damage per 1/2 second / 30% Stun and Burning status chance ^000000",
		"[Level 4] : ^777777 1600 fixed damage per 1/2 second / 40% Stun and Burning status chance ^000000",
		"[Level 5] : ^777777 1800 fixed damage per 1/2 second / 50% Stun and Burning status chance ^000000"
	].join("\n");

	SkillDescription[SKID.WM_FRIGG_SONG] = [
		"Frigg's Song",
		"Max Lv : 5",
		"^777777Skill Requirement : Lesson 2 ^000000",
		"Type : ^777777  Active / Buff ^000000",
		"Description : ^777777 Increase MaxHP of",
		"allies for 60 sec and recover certain HP.",
		"Consumes 1 Regrettable Tears.^000000",
		"^777777 in Siege mode such as PVP, only yourself and your party memeber will get the effect.^000000",
		"[Level 1] : ^777777 Affected area-  Caster's near cell 7 x 7, MaxHP 5% increase, Per 1 sec, 100 recover.^000000",
		"[Level 2] : ^777777 Affected area-  Caster's near cell 9 x 9, MaxHP 10% increase, Per 1 sec, 120 recover.^000000",
		"[Level 3] : ^777777 Affected area-  Caster's near cell 11 x 11, MaxHP 15% increase, Per 1 sec, 140 recover.^000000",
		"[Level 4] : ^777777 Affected area-  Caster's near cell 13 x 13, MaxHP 20% increase, Per 1 sec, 160 recover.^000000",
		"[Level 5] : ^777777 Affected area-  Caster's near cell 15 x 15, MaxHP 25% increase, Per 1 sec, 180 recover.^000000"
	].join("\n");

	SkillDescription[SKID.SO_ELEMENTAL_SHIELD] = [
		"Elemental Shield",
		"Max Lv : 5",
		"^777777Skill Requirement : Spirit Control 3^000000",
		"Type : ^777777Sub^bb00bb(psychokinesis)^000000",
		"Target : ^777777Ground^000000",
		"Description : ^777777By expending summoned elemental's magic, sorcerer creates a magical barrier on the cells the caster and party members are standing on. Magical barrier dissipates once its durability reaches 0 or when skill duration ends.^000000 ",
		"^777777Affects self and all party members within sorcerer's screen.^000000 ",
		"^777777This magical barrier only blocks melee physical damage and caster's summoned elemental disappears on use. Consumes 1 blue gemstone.^000000 "
	].join("\n");

	SkillDescription[SKID.SR_FLASHCOMBO] = [
		"Flash Combo",
		"Max Lv : 5",
		"^777777Skill Requirement : Dragon Combo 3 / Fallen Empire 3 / Tiger Cannon 5 / Sky Blow 1^000000",
		"Skill Form : ^777777  Active / Special ^000000",
		"Description : ^777777  Performs Dragon Combo, Fallen Empire and Tiger Cannon in rapid succession. Uses highest level learned of each of the skills.",
		"Cannot consume any items or use other skills while casting. ^000000",
		"[Level 1] : ^777777Consumes 5 Spheres, For 4 sec, ATK 40 increased^000000",
		"[Level 2] : ^777777Consumes 5 Spheres, For 4 sec, ATK 60 increased^000000",
		"[Level 3] : ^777777Consumes 4 Spheres, For 4 sec, ATK 80 increased^000000",
		"[Level 4] : ^777777Consumes 4 Spheres, For 4 sec, ATK 100 increased^000000",
		"[Level 5] : ^777777Consumes 3 Spheres, For 4 sec, ATK 120 increased^000000"
	].join("\n");

	SkillDescription[SKID.SC_ESCAPE] = [
		"Urgent Escape",
		"Max Lv : 5",
		"^777777Skill Requirement : Triangle Shot 2 ^000000",
		"Type : ^777777  Active / Sub ^000000",
		"Description : ^777777 Caster immediately lays down a trap on the ground and backslides. Caster cannot backslide over dead cells (walls etc).^000000",
		"^777777 Consumes 1 Special Alloy Trap.^000000",
		"[Level 1] : ^777777 Escape range 5 Cells^000000",
		"[Level 2] : ^777777 Escape range 6 Cells^000000",
		"[Level 3] : ^777777 Escape range 7 Cells^000000",
		"[Level 4] : ^777777 Escape range 8 Cells^000000",
		"[Level 5] : ^777777 Escape range 9 Cells^000000"
	].join("\n");

	SkillDescription[SKID.AB_OFFERTORIUM] = [
		"Offertorium",
		"Max Lv : 5",
		"^777777Skill Requirement : Highness Heal 2^000000",
		"Type : ^777777Active / Buff^000000",
		"Description : ^777777Increases the efficiency of High Heal, Coluseo Heal, Sanctuary, and Heal. This skill cannot be used in conjunction with Magnificat.^000000",
		"^777777 Cures status : Darkness, Curse, Poison, Delusion, Chaos, Bleeding, fire, Ice, Mandragora Howling, Guillotine Cross poison^000000",
		"[Level 1] : ^777777 90 seconds / Healing Power +30% / SP Cost 220% ^000000",
		"[Level 2] : ^777777 90 seconds / Healing Power +60% / SP Cost 240% ^000000",
		"[Level 3] : ^777777 90 seconds / Healing Power +90% / SP Cost 260% ^000000",
		"[Level 4] : ^777777 90 seconds / Healing Power +120% / SP Cost 280% ^000000",
		"[Level 5] : ^777777 90 seconds / Healing Power +150% / SP Cost 300% ^000000"
	].join("\n");

	SkillDescription[SKID.WL_TELEKINESIS_INTENSE] = [
		"Intensification",
		"Max LV 5 ",
		"^777777Skill Requirement : Soul Expansion 5  ^000000",
		"Type : ^777777 Active / Buff ^000000",
		"Description : ^777777 Ghost magic enters caster's circulatory system, increasing Ghost-type magic damage and reducing cast time and mana cost of spells. ^000000",
		"^777777 This skill cannot be removed by clearance or dispel. ^000000",
		"[Level 1] : ^777777 3 Minutes / Ghost-Spell Magic Damage +40% / -10% Variable Cast Time on all skills / -10% Ghost-Spell SP Cost ^000000",
		"[Level 2] : ^777777 3 Minutes / Ghost-Spell Magic Damage +80% / -20% Variable Cast Time on all skills / -20% Ghost-Spell SP Cost ^000000",
		"[Level 3] : ^777777 3 Minutes / Ghost-Spell Magic Damage +120% / -30% Variable Cast Time on all skills / -30% Ghost-Spell SP Cost ^000000",
		"[Level 4] : ^777777 3 Minutes / Ghost-Spell Magic Damage +160% / -40% Variable Cast Time on all skills / -40% Ghost-Spell SP Cost ^000000",
		"[Level 5] : ^777777 3 Minutes / Ghost-Spell Magic Damage +200% / -50% Variable Cast Time on all skills / -50% Ghost-Spell SP Cost ^000000"
	].join("\n");

	SkillDescription[SKID.ALL_FULL_THROTTLE] = [
		"Full Throttle",
		"Max Lv : 5",
		"^777777Skill Requirement : 3rd jobs  ^000000",
		"Description : ^777777Exceed the limits of the body by ",
		"sacrificing your own vitality to strengthen yourself",
		"for a short time. You will become horribly ",
		"exhausted after the skill's duration. ^000000",
		"^777777Fully restores HP when cast and increases",
		"movement speed for the skill's duration.",
		"All stats +20%. ^000000",
		"^777777After the skill duration ends, you will be inflicted",
		"with Rebound status. During rebound status,",
		"your movement speed is lowered and your",
		"natural HP/SP recovery is disabled. ^000000",
		"^777777Cannot be removed by dispel or clearance. ^000000",
		"^0000ff50 Minute playtime cooldown^000000",
		"[Level 1] : ^777777Duration 10 seconds",
		"                    Consumes 6% MaxSP per second^000000",
		"[Level 2] : ^777777Duration 15 seconds",
		"                    Consumes 4% MaxSP per second ^000000",
		"[Level 3] : ^777777Duration 20 seconds",
		"                    Consumes 3% MaxSP per second ^000000",
		"[Level 4] : ^777777Duration 25 seconds",
		"                    Consumes 2% MaxSP per second ^000000",
		"[Level 5] : ^777777Duration 30 seconds",
		"                    Consumes 1% MaxSP per second ^000000"
	].join("\n");

	SkillDescription[SKID.GN_ILLUSIONDOPING] = [
		"Hallucination Drug",
		"Max Lv : 5",
		"^777777Skill Requirement : Special Pharmacy  1 ^000000",
		"Type : ^777777  Special / Debuff ^000000",
		"Description : ^777777 Throw a concentrated alcohol mix",
		"to cause hallucinations and decreased accuracy",
		"with a high probability. Consumes 1 alcohol.^000000",
		"[Level 1] : ^777777100% damage / 9 x 9 splash ^000000",
		"[Level 2] : ^777777100% damage / 11 x 11 splash ^000000",
		"[Level 3] : ^777777100% damage / 13 x 13 splash ^000000",
		"[Level 4] : ^777777100% damage / 15 x 15 splash ^000000",
		"[Level 5] : ^777777100% damage / Full screen splash. ^000000"
	].join("\n");

	SkillDescription[SKID.GM_ITEM_ATKMAX] = [
		"Max Physical item attack rate",
		"Max LV : 1",
		"Description : ^777777 Max Physical item attack rate^000000"
	].join("\n");

	SkillDescription[SKID.GM_ITEM_ATKMIN] = [
		"Minimize Physical item attack rate",
		"Max LV : 1",
		"Description : ^777777 Minimize Physical item attack rate^000000"
	].join("\n");

	SkillDescription[SKID.GM_ITEM_MATKMAX] = [
		"Max Magic item attack rate",
		"Max LV : 1",
		"Description : ^777777 Max Magic item attack rate^000000"
	].join("\n");

	SkillDescription[SKID.GM_ITEM_MATKMIN] = [
		"Minimize Magic item attack rate",
		"Max LV : 1",
		"Description : ^777777 Minimize Magic item attack rate^000000"
	].join("\n");

	SkillDescription[SKID.MER_INVINCIBLEOFF2] = [
		"Mind Blaster",
		"Max Lv : 1",
		"Description : Disconnect the follers and Devil King's connection to invalidate the Blessing of Masin. Shooting range 2 cells"
	].join("\n");

	SkillDescription[SKID.RL_RICHS_COIN] = [
		"Rich's Coin (Fortune of the Rich)",
		"Max Lv: 1",
		"^777777Skill Requirement: Coin Flip Lv. 5^000000",
		"Class: ^777777Special^000000",
		"Description: ^777777Creates 10 Coins at once at the cost of 100 Zeny.^000000",
		"^777777This skill negates possible Coin losses by [Coin Flip] once learned.^000000"
	].join("\n");

	SkillDescription[SKID.RL_FALLEN_ANGEL] = [
		"Fallen Angel (Nephilim)",
		"Max Lv: 1",
		"^777777Skill Requirement: Desperado Lv. 10^000000",
		"Class: ^777777Move^000000",
		"Description: ^777777A Revolver (Pistol) skill.^000000",
		"^777777Move to the location you want. Use Desperado in 2 seconds after the move to increase Desperado damage.^000000",
		"^777777The skill automatically fails if there's a wall or another obstacle in your way.^000000",
		"^777777Consumes 1 Coin for use.^000000"
	].join("\n");

	SkillDescription[SKID.RL_S_STORM] = [
		"Shattering Storm (Grinding Storm)",
		"Max Lv: 5",
		"^777777Skill Requirement: Disarm Lv. 1 / Crowd Control Shot Lv. 1^000000",
		"Class: ^777777Attack/Special^000000",
		"Description: ^777777A Shotgun skill.^000000",
		"^777777Attack a target and all surrounding enemies within range and destroy their helms.^000000",
		"^777777This skill's helm destruction chance increases, the higher your DEX and its level and the lower the target's Level and AGI.^000000",
		"^777777Coated or Indestructible helms can't be destroyed.^000000",
		"^777777Consumes 1 bullet for use.^000000",
		"[Level 1]: ^777777Effective Range: 5 x5 Cells/1,900% of ATK^000000",
		"[Level 2]: ^777777Effective Range: 5 x5 Cells/2,100% of ATK^000000",
		"[Level 3]: ^777777Effective Range: 5 x5 Cells/2,300% of ATK^000000",
		"[Level 4]: ^777777Effective Range: 5 x5 Cells/2,500% of ATK^000000",
		"[Level 5]: ^777777Effective Range: 7 x7 Cells/2,700% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.RL_MASS_SPIRAL] = [
		"Mass Spiral (Absolute Penetration)",
		"Max Lv: 5",
		"^777777Skill Requirement: Wounding Shot Lv. 1^000000",
		"Class: ^777777Attack/Special^000000",
		"Description: ^777777A Rifle skill.^000000",
		"^777777Fire a piercing bullet that increases ATK according to its target's DEF.^000000",
		"^777777Creates a high chance of Bleeding the target on hit.^000000",
		"^777777This skill consumes 1 Full Metal Jacket Bullet in your inventory upon use.^000000",
		"[Level 1]: ^777777200% of ATK/Bleeding Chance: 40%^000000",
		"[Level 2]: ^777777400% of ATK/Bleeding Chance: 50%^000000",
		"[Level 3]: ^777777600% of ATK/Bleeding Chance: 60%^000000",
		"[Level 4]: ^777777800% of ATK/Bleeding Chance: 70%^000000",
		"[Level 5]: ^7777771,000% of ATK/Bleeding Chance: 80%^000000"
	].join("\n");

	SkillDescription[SKID.RL_E_CHAIN] = [
		"Eternal Chain (Infinite Chain)",
		"Max Lv: 10",
		"^777777Skill Requirement: Coin Flip Lv. 1 and Chain Action Lv. 10^000000",
		"Class: ^777777Support^000000",
		"Description: ^777777[Eternal Chain] always activates [Chain Action], regardless of your equipment.^000000",
		"^777777The activated [Chain Action] is at the same level as [Eternal Chain].^000000",
		"^777777Consumes 1 Coin for use.^000000",
		"[Level 1]: ^777777Duration: 45 sec.^000000",
		"[Level 2]: ^777777Duration: 60 sec.^000000",
		"[Level 3]: ^777777Duration: 75 sec.^000000",
		"[Level 4]: ^777777Duration: 90 sec.^000000",
		"[Level 5]: ^777777Duration: 105 sec.^000000",
		"[Level 6]: ^777777Duration: 120 sec.^000000",
		"[Level 7]: ^777777Duration: 135 sec.^000000",
		"[Level 8]: ^777777Duration: 150 sec.^000000",
		"[Level 9]: ^777777Duration: 165 sec.^000000",
		"[Level 10]: ^777777Duration: 180 sec.^000000"
	].join("\n");

	SkillDescription[SKID.RL_H_MINE] = [
		"Howling Mine (Destructive Cry)",
		"Max Lv: 5",
		"^777777Skill Requirement: Gunslinger Mine Lv. 1^000000",
		"Class: ^777777Attack/Special^000000",
		"Description: ^777777A Grenade Launcher skill.^000000",
		"^777777Fire a sticky bomb at a target, inflicting damage. Up to 5 Howling Mines can be fired at the same time.^000000",
		"^777777Use [Flicker] to detonate Howling Mines and inflict additional Fire damage on and around the targets.^000000",
		"^777777Howling Mines can only be detonated by [Flicker]. They fall off their targets and disappear if not detonated in 50 seconds.^000000",
		"^777777Consumes 1 Projectile Mine for use.^000000",
		"[Level 1]: ^777777400% of ATK + 800% Explosion Damage^000000",
		"[Level 2]: ^777777600% of ATK + 1,100% Explosion Damage^000000",
		"[Level 3]: ^777777800% of ATK + 1,400% Explosion Damage^000000",
		"[Level 4]: ^7777771,000% of ATK + 1,700% Explosion Damage^000000",
		"[Level 5]: ^7777771,200% of ATK + 2,000% Explosion Damage^000000"
	].join("\n");

	SkillDescription[SKID.RL_FIRE_RAIN] = [
		"Fire Rain (Fire Deluge)",
		"Max Lv: 5",
		"^777777Skill Requirement: Gatling Fever Lv. 1^000000",
		"Class: ^777777Ground/Attack^000000",
		"Description: ^777777A Gatling Gun skill.^000000",
		"^777777Attack 3 x10 cells in front of you in sequential order.^000000",
		"^777777Creates a chance of removing Ground skills cast within range.^000000",
		"^777777Consumes 10 bullets for use. (At least 11 bullets required for activation)^000000",
		"[Level 1]: ^7777773,800% of ATK/Removal Chance: 20%^000000",
		"[Level 2]: ^7777774,100% of ATK/Removal Chance: 25%^000000",
		"[Level 3]: ^7777774,400% of ATK/Removal Chance: 30%^000000",
		"[Level 4]: ^7777774,700% of ATK/Removal Chance: 35%^000000",
		"[Level 5]: ^7777775,000% of ATK/Removal Chance: 40%^000000"
	].join("\n");

	SkillDescription[SKID.RL_FLICKER] = [
		"Flicker (Flashing Signal)",
		"Max Lv: 1",
		"^777777Skill Requirement: Coin Flip Lv. 1^000000",
		"Class: ^777777Special^000000",
		"Description: ^777777Activates and detonates your [Howling Mines] and [Binding Traps] in one screen. Only applicable to your own traps.^000000",
		"^777777Consumes 1 Coin for use.^000000"
	].join("\n");

	SkillDescription[SKID.RL_FIREDANCE] = [
		"Fire Dance (Dance of Massacre)",
		"Max Lv: 10",
		"^777777Skill Requirement: Desperado Lv. 1^000000",
		"Class: ^777777Attack^000000",
		"Description: ^777777A Revolver (Pistol) skill.^000000",
		"^777777Attack all enemies in 7 x7 cells around you.^000000",
		"^777777This skill's damage increases, depending on your Desperado level and Base Level.^000000",
		"^777777Consumes 3 bullets for use.^000000",
		"[Level 1]: ^777777300% of ATK^000000",
		"[Level 2]: ^777777400% of ATK^000000",
		"[Level 3]: ^777777500% of ATK^000000",
		"[Level 4]: ^777777600% of ATK^000000",
		"[Level 5]: ^777777700% of ATK^000000",
		"[Level 6]: ^777777800% of ATK^000000",
		"[Level 7]: ^777777900% of ATK^000000",
		"[Level 8]: ^7777771,000% of ATK^000000",
		"[Level 9]: ^7777771,100% of ATK^000000",
		"[Level 10]: ^7777771,200% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.RL_BANISHING_BUSTER] = [
		"Vanishing Buster (Exile)",
		"Max Lv: 10",
		"^777777Skill Requirement: Shattering Storm Lv. 1^000000",
		"Class: ^777777Attack/Special^000000",
		"Description: ^777777A Shotgun skill.^000000",
		"^777777Attack a target and remove its buff effects.^000000",
		"^777777This skill's damage additionally increases, depending on your Base Level.^000000",
		"^777777Consumes 1 bullet for use.^000000",
		"[Level 1]: ^7777771,600% of ATK/Buff Removal Chance: 55%^000000",
		"[Level 2]: ^7777771,700% of ATK/Buff Removal Chance: 60%^000000",
		"[Level 3]: ^7777771,800% of ATK/Buff Removal Chance: 65%^000000",
		"[Level 4]: ^7777771,900% of ATK/Buff Removal Chance: 70%^000000",
		"[Level 5]: ^7777772,000% of ATK/Buff Removal Chance: 75%^000000",
		"[Level 6]: ^7777772,100% of ATK/Buff Removal Chance: 80%^000000",
		"[Level 7]: ^7777772,200% of ATK/Buff Removal Chance: 85%^000000",
		"[Level 8]: ^7777772,300% of ATK/Buff Removal Chance: 90%^000000",
		"[Level 9]: ^7777772,400% of ATK/Buff Removal Chance: 95%^000000",
		"[Level 10]: ^7777772,500% of ATK/Buff Removal Chance: 100%^000000"
	].join("\n");

	SkillDescription[SKID.RL_AM_BLAST] = [
		"Anti Material Blast (Obliterator)",
		"Max Lv: 5",
		"^777777Skill Requirement: Mass Spiral Lv. 1^000000",
		"Class: ^777777Attack/Special^000000",
		"Description: ^777777A Rifle skill.^000000",
		"^777777Inflict damage and decrease the target's Player Damage [Resistance].^000000",
		"^777777This skill creates a higher chance of the Anti-material effect at a higher level.^000000",
		"^777777Consumes 1 bullet for use.^000000",
		"[Level 1]: ^777777Duration: 6 sec./Anti-material Chance: 30%/ Resistance -10%^000000",
		"[Level 2]: ^777777Duration: 7 sec./Anti-material Chance: 40%/Resistance -20%^000000",
		"[Level 3]: ^777777Duration: 8 sec./Anti-material Chance: 50%/Resistance -30%^000000",
		"[Level 4]: ^777777Duration: 9 sec./Anti-material Chance: 60%/Resistance -40%^000000",
		"[Level 5]: ^777777Duration: 10 sec./Anti-material Chance: 70%/Resistance -50%^000000"
	].join("\n");

	SkillDescription[SKID.RL_QD_SHOT] = [
		"Quick Draw Shot (Tailwind Shot)",
		"Max Lv: 1",
		"^777777Skill Requirement: Chain Action Lv. 1^000000",
		"Class: ^777777Attack^000000",
		"Description: ^777777Enables Quick Draw Shot during Chain Action for additional attacks.^000000",
		"^777777This skill can be used in the middle of Chain Action. The higher your Job Level, the more additional attacks you can deliver.^000000",
		"^777777If there are [Crimson Marker] targets in 21 x21 cells around you, the additional Quick Draw Shots will be delivered to all of them.^000000"
	].join("\n");

	SkillDescription[SKID.RL_D_TAIL] = [
		"Dragon Tail (Magic Beast Tail)",
		"Max Lv: 10",
		"^777777Skill Requirement: Crimson Marker Lv. 1, Howling Mine Lv. 3^000000",
		"Class: ^777777Attack^000000",
		"Description: ^777777A Grenade Launcher skill.^000000",
		"^777777Fire missiles at a target and all surrounding enemies within range.^000000",
		"^777777This skill inflicts more damage on targets affected by Crimson Marker.^000000",
		"^777777This skill's damage additionally increases, depending on your Base Level.^000000",
		"^777777Consumes 1 Dragon Tail Missile per use.^000000",
		"[Level 1]: ^777777700% of ATK/Crimson Marker Target: 1,400%^000000",
		"[Level 2]: ^777777900% of ATK/Crimson Marker Target: 1,800%^000000",
		"[Level 3]: ^7777771,100% of ATK/Crimson Marker Target: 2,200%^000000",
		"[Level 4]: ^7777771,300% of ATK/Crimson Marker Target: 2,600%^000000",
		"[Level 5]: ^7777771,500% of ATK/Crimson Marker Target: 3,000%^000000",
		"[Level 6]: ^7777771,700% of ATK/Crimson Marker Target: 3,400%^000000",
		"[Level 7]: ^7777771,900% of ATK/Crimson Marker Target: 3,800%^000000",
		"[Level 8]: ^7777772,100% of ATK/Crimson Marker Target: 4,200%^000000",
		"[Level 9]: ^7777772,300% of ATK/Crimson Marker Target: 4,600%^000000",
		"[Level 10]: ^7777772,500% of ATK/Crimson Marker Target: 5,000%^000000"
	].join("\n");

	SkillDescription[SKID.RL_R_TRIP] = [
		"Round Trip (Circle Dance)",
		"Max Lv: 10",
		"^777777Skill Requirement: Fire Rain Lv. 1^000000",
		"Class: ^777777Attack^000000",
		"Description: ^777777A Gatling Gun skill.^000000",
		"^777777Attack all surrounding enemies with a Gatling gun.^000000",
		"^777777This skill also knocks all enemies 3 cells backward, outside its range.^000000",
		"^777777The knocked enemies can hit a wall and receive additional damage.^000000",
		"^777777This skill's damage additionally increases, depending on your Base Level.^000000",
		"^777777Consumes 5 bullets per use. (At least 6 bullets required for activation)^000000",
		"[Level 1]: ^777777700% of ATK/Effective Range: 7 x7 Cells^000000",
		"[Level 2]: ^777777900% of ATK/Effective Range: 7 x7 Cells^000000",
		"[Level 3]: ^7777771,100% of ATK/Effective Range: 7 x7 Cells^000000",
		"[Level 4]: ^7777771,300% of ATK/Effective Range: 9 x9 Cells^000000",
		"[Level 5]: ^7777771,500% of ATK/Effective Range: 9 x9 Cells^000000",
		"[Level 6]: ^7777771,700% of ATK/Effective Range: 9 x9 Cells^000000",
		"[Level 7]: ^7777771,900% of ATK/Effective Range: 11 x11 Cells^000000",
		"[Level 8]: ^7777772,100% of ATK/Effective Range: 11 x11 Cells^000000",
		"[Level 9]: ^7777772,300% of ATK/Effective Range: 11 x11 Cells^000000",
		"[Level 10]: ^7777772,500% of ATK/Effective Range: 13 x13 Cells^000000"
	].join("\n");

	SkillDescription[SKID.RL_HEAT_BARREL] = [
		"Hit Barrel (Acceleration Bullet)",
		"Max Lv: 5",
		"^777777Skill Requirement: Rich's Coin Lv. 1^000000",
		"Class: ^777777Support^000000",
		"Description: ^777777Consumes all your Coins when used. Decreases Fixed Cast Time and increases ASPD and ATK, but decreases HIT.^000000",
		"^777777The ATK and Fixed Cast Time effects improve as you use more Coins.^000000",
		"^777777This skill's effect disappears immediately if you change your equipment midway.^000000",
		"^777777This skill can't be used with [Last Stand] or [Platinum Altar].^000000",
		"[Level 1]: ^777777ASPD +1/HIT -30/Duration: 60 sec.^000000",
		"[Level 2]: ^777777ASPD +2/HIT -35/Duration: 60 sec.^000000",
		"[Level 3]: ^777777ASPD +3/HIT -40/Duration: 60 sec.^000000",
		"[Level 4]: ^777777ASPD +4/HIT -45/Duration: 60 sec.^000000",
		"[Level 5]: ^777777ASPD +5/HIT -50/Duration: 60 sec.^000000"
	].join("\n");

	SkillDescription[SKID.RL_SLUGSHOT] = [
		"Slug Shot (Fundamental Destruction)",
		"Max Lv: 5",
		"^777777Skill Requirement: Vanishing Buster Lv. 3^000000",
		"Class: ^777777Attack/Special^000000",
		"Description: ^777777A Shotgun skill.^000000",
		"^777777Slug bullets are so heavy that they decrease your HIT when you're 3 or more cells away from your target.^000000",
		"^777777This skill knocks its target 6 cells backward.^000000",
		"^777777Consumes 1 Slug Bullet in your inventory upon use.^000000",
		"[Level 1]: ^7777772,000% damage to players/1,200% damage to monsters/HIT -10% per cell after 2 cells^000000",
		"[Level 2]: ^7777774,000% damage to players/2,400% damage to monsters/HIT -9% per cell after 2 cells^000000",
		"[Level 3]: ^7777776,000% damage to players/3,600% damage to monsters/HIT -8% per cell after 2 cells^000000",
		"[Level 4]: ^7777778,000% damage to players/4,800% damage to monsters/HIT -7% per cell after 2 cells^000000",
		"[Level 5]: ^77777710,000% damage to players/6,000% damage to monsters/HIT -6% per cell after 2 cells^000000"
	].join("\n");

	SkillDescription[SKID.RL_HAMMER_OF_GOD] = [
		"God's Hammer (God's Wrath)",
		"Max Lv: 10",
		"^777777Skill Requirement: Rich's Coin Lv. 1 and Anti-material Blast Lv. 3^000000",
		"Class: ^777777Attack/Special^000000",
		"Description: ^777777A Rifle skill.^000000",
		"^777777Launches an attack that falls upon enemies from the sky.^000000",
		"^777777Inflict damage upon the targeted enemies along with the surrounding targets.^000000",
		"^777777This skill inflicts more damage on targets affected by Crimson Marker.^000000",
		"^777777Consumes all of your Coins when used. Your ATK is increased depending on your Base Level and the amount of Coins consumed.^000000",
		"[Level 1]: ^777777100% of ATK/Range: 5 x5 Cells^000000",
		"[Level 2]: ^777777200% of ATK/Range: 5 x5 Cells^000000",
		"[Level 3]: ^777777300% of ATK/Range: 5 x5 Cells^000000",
		"[Level 4]: ^777777400% of ATK/Range: 5 x5 Cells^000000",
		"[Level 5]: ^777777500% of ATK/Range: 5 x5 Cells^000000",
		"[Level 6]: ^777777600% of ATK/Range: 7 x7 Cells^000000",
		"[Level 7]: ^777777700% of ATK/Range: 7 x7 Cells^000000",
		"[Level 8]: ^777777800% of ATK/Range: 7 x7 Cells^000000",
		"[Level 9]: ^777777900% of ATK/Range: 7 x7 Cells^000000",
		"[Level 10]: ^7777771,000% of ATK/Range: 7 x7 Cells^000000"
	].join("\n");

	SkillDescription[SKID.RL_C_MARKER] = [
		"Crimson Marker (Blood Brand)",
		"Max Lv: 1",
		"^777777Skill Requirement: Coin Flip Lv. 1^000000",
		"Class: ^777777Special^000000",
		"Description: ^777777Brands 1 target with a crimson sign, decreasing its Evasion by 10 and marking its location on the mini-map.^000000",
		"^777777Up to 3 enemies can be marked. This skill also affects [Quick Draw Shot], [Dragon Tail], and [God's Hammer].^000000",
		"^777777Consumes 1 Coin for use.^000000",
		"[Level 1]: ^777777Duration: 50 sec.^000000"
	].join("\n");

	SkillDescription[SKID.RL_P_ALTER] = [
		"Platinum Altar (White Gold Altar)",
		"Max Lv: 5",
		"^777777Skill Requirement: Rich's Coin Lv. 1^000000",
		"Class: ^777777Support^000000",
		"Description: ^777777Requires Holy bullets.^000000",
		"^777777Consumes all your Coins and increases your ATK, depending on its skill level and the number of Coins consumed.^000000",
		"^777777Also, casts a barrier around you for its duration, protecting you for a set number of times per skill level. Holy Light instantly cancels this barrier.^000000",
		"^777777Platinum Altar is canceled if you change your weapon or bullet before it expires. The barrier is retained.^000000",
		"^777777This skill can't used with [Last Stand] or [Hit Barrel].^000000",
		"[Level 1]: ^777777Barrier HP: 5% of Max HP, 4 Blocks, Duration: 30 sec.^000000",
		"[Level 2]: ^777777Barrier HP: 10% of Max HP, 5 Blocks, Duration: 45 sec.^000000",
		"[Level 3]: ^777777Barrier HP: 15% of Max HP, 6 Blocks, Duration: 60 sec.^000000",
		"[Level 4]: ^777777Barrier HP: 20% of Max HP, 7 Blocks, Duration: 75 sec.^000000",
		"[Level 5]: ^777777Barrier HP: 25% of Max HP, 8 Blocks, Duration: 90 sec.^000000"
	].join("\n");

	SkillDescription[SKID.RL_B_TRAP] = [
		"Binding Trap (Dark Pit)",
		"Max Lv: 5",
		"^777777Skill Requirement: Flicker Lv. 1^000000",
		"Class: ^777777Ground/Special^000000",
		"Description: ^777777Set up a special trap underneath you that significantly decreases Movement Speed.^000000",
		"^777777This trap significantly decreases Movement Speed for all targets that enter its range. Its duration decreases, depending on the target's STR.^000000",
		"^777777Only 1 Binding Trap can be set up at the same time. [Flicker] can be used to detonate Bind Trap and inflict additional damage on all enemies within the trap's range.^000000",
		"^777777This skill's damage increases, depending on your DEX, the target's HP, and its skill level.^000000",
		"^777777Its duration decreases depending, on the target's STR, but can't fall below 4 seconds.^000000",
		"^777777Consumes 1 Special Alloy Trap for use.^000000",
		"[Level 1]: ^777777Effective Range: 3 x3 Cells/Duration: 4 +6 sec.^000000",
		"[Level 2]: ^777777Effective Range: 5 x5 Cells/Duration: 4 +7 sec.^000000",
		"[Level 3]: ^777777Effective Range: 5 x5 Cells/Duration: 4 +8 sec.^000000",
		"[Level 4]: ^777777Effective Range: 7 x7 Cells/Duration: 4 +9 sec.^000000",
		"[Level 5]: ^777777Effective Range: 7 x7 Cells/Duration: 4 +10 sec.^000000"
	].join("\n");

	SkillDescription[SKID.ECL_SNOWFLIP] = [
		"Snow Flip",
		"^777777 It is white as a snow and you should be careful to get frostbite. ^000000",
		"^777777 When using it, It cures Ignition, Bleeding, Deep Sleeping, Sleeping. ^000000"
	].join("\n");

	SkillDescription[SKID.ECL_PEONYMAMY] = [
		"Peonymamy",
		"^777777 This floral leaf is as warm as your mother's chest. ^000000",
		"^777777 When using it, it cures Frost, Frozen and Freezing. ^000000"
	].join("\n");

	SkillDescription[SKID.ECL_SADAGUI] = [
		"Sadagui",
		"^777777 It has strong smell and when you smell it, it feels like something is hitting your head. ^000000",
		"^777777 When using it, it cures stun, Fear, Confusion and Hallucination. ^000000"
	].join("\n");

	SkillDescription[SKID.ECL_SEQUOIADUST] = [
		"Sequoia Dust",
		"^777777 When you gather dust from the tree of life, it brings purification ability. ^000000",
		"^777777 When using it, Petrification, Blind, Curse, Decrease Agility and Grampus Morph. ^000000"
	].join("\n");

	SkillDescription[SKID.MC_CARTDECORATE] = [
		"Cart Decoration",
		"^777777Skill Requirement : Finish Quest^000000",
		"Skill Form: ^777777Supportive^000000",
		"Description: ^777777Change Pushcart appearance."
	].join("\n");

	SkillDescription[SKID.SU_BASIC_SKILL] = [
		"New Basic Skill",
		"Max Lv: 1",
		"Class: ^000099Passive^000000",
		"Details: ^777777Enables the Basic Interface skills.^000000",
		"^777777Trade with other players, use emotes, Sit, create Chat rooms, create/join parties, and use the Kafra Storage.^000000"
	].join("\n");

	SkillDescription[SKID.SU_BITE] = [
		"Bite",
		"Max Lv: 1",
		"^777777Skill Requirement: New Basic Skill Lv. 1^000000",
		"Class: ^777777Attack^000000",
		"Target: ^777777Enemy^000000",
		"Details: ^777777Bite at enemies. Inflicts more damage on weakened enemies.^000000",
		"^777777This skill creates a chance of being activated twice at Base Level 30 or above. This chance increases every 30 Base levels.^000000",
		"[Level 1] : ^777777200% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.SU_HIDE] = [
		"Hide",
		"Max Lv: 1",
		"^777777Skill Requirement: Bite Lv. 1^000000",
		"Class: ^777777Support^000000",
		"Details: ^777777Hide in a bush to avoid attacks from enemies. Can be found by enemies' Detection skills.^000000"
	].join("\n");

	SkillDescription[SKID.SU_SCRATCH] = [
		"Scratch",
		"Max Lv: 3",
		"^777777Skill Requirement: Hide Lv. 1 ^000000",
		"Class: ^777777Attack^000000",
		"Target: ^777777Enemy^000000",
		"Details: ^777777Claw at the selected enemy, wounding it. (This skill deals a small area of splash damage to surrounding enemies and creates a chance of Bleeding.)^000000",
		"^777777This skill creates a chance of being activated twice at Base Level 30 or above. This chance increases every 30 Base levels.^000000",
		"[Level 1]: ^777777100% of ATK^000000",
		"[Level 2]: ^777777150% of ATK^000000",
		"[Level 3]: ^777777200% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.SU_STOOP] = [
		"Stoop",
		"Max Lv: 1",
		"^777777Skill Requirement: Scratch Lv. 3^000000",
		"Class: ^777777Support^000000",
		"Details: ^777777Decreases incoming damage by 90% for 6 seconds. Knockback force-cancels this skill.^000000"
	].join("\n");

	SkillDescription[SKID.SU_LOPE] = [
		"Lope",
		"Max Lv: 3",
		"^777777Skill Requirement: Stoop Lv. 1 ^000000",
		"Class: ^777777Move^000000",
		"Details: ^777777Leap over to a targeted location.^000000",
		"^777777If the targeted coordinates are not accessible, then you'll jump where you stand.^000000",
		"^777777Can't be used where Fly Wings can't be used.^000000",
		"^777777Learning Lope doubles the cast time of the Guild skill, Emergency Call. It also cools down twice longer than usual in the WoE area.^000000",
		"[Level 1] ^777777Move 6 cells away.^000000",
		"[Level 2] ^777777Move 10 cells away.^000000",
		"[Level 3] ^777777Move 14 cells away.^000000"
	].join("\n");

	SkillDescription[SKID.SU_SPRITEMABLE] = [
		"Sprite Marble",
		"Max Lv: 1",
		"^777777Skill Requirement: Leap Lv. 3^000000",
		"Class: ^000099Passive^000000",
		"Details: ^777777Employ sprites.^000000",
		"^777777MaxHP +1,000, MaxSP +100^000000",
		"^777777Employ Sea, Earth, and Life Sprites.^000000"
	].join("\n");

	SkillDescription[SKID.SU_FRESHSHRIMP] = [
		"Fresh Shrimp",
		"Max Lv: 5",
		"^777777Skill Requirement: Sprite Marble Lv. 1^000000",
		"Class: ^777777Seafood (Recovery)^000000",
		"Target: ^777777Player^000000",
		"Details: ^777777Absorb the spirits of small fresh shrimps for 2 minutes, recovering a small amount of HP every time.",
		"This skill restores HP by 50% of the amounts restored at Level 5 Heal every time.",
		"Heal bonus effects are also applied to the restored HP.^000000",
		"[Level 1]: ^777777Recover every 10 sec.^000000",
		"[Level 2]: ^777777Recover every 9 sec.^000000",
		"[Level 3]: ^777777Recover every 8 sec.^000000",
		"[Level 4]: ^777777Recover every 7 sec.^000000",
		"[Level 5]: ^777777Recover every 6 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SU_BUNCHOFSHRIMP] = [
		"Bunch of Shrimp",
		"Max Lv: 5",
		"^777777Skill Requirement: Fresh Shrimp Lv. 3 ^000000",
		"Class: ^777777Seafood (Supportive)^000000",
		"Target: ^777777All party members in one screen^000000",
		"Details: ^777777Instantly restore a small amount of HP. The bunch of shrimps also temporarily increases ATK and MATK by 10%.^000000",
		"^777777Requires 1 Shrimp.^000000",
		"[Level 1]: ^777777Lasts for 60 sec.^000000",
		"[Level 2]: ^777777Lasts for 90 sec.^000000",
		"[Level 3]: ^777777Lasts for 120 sec.^000000",
		"[Level 4]: ^777777Lasts for 150 sec.^000000",
		"[Level 5]: ^777777Lasts for 180 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SU_TUNABELLY] = [
		"Tuna Belly",
		"Max Lv: 5",
		"^777777Skill Requirement: Bunch of Shrimp Lv. 3 ^000000",
		"Class: ^777777Seafood (Recovery)^000000",
		"Target: ^777777Player^000000",
		"Details: ^777777Absorb the spirit of delicious tuna belly meat, healing a target by a certain amount of MaxHP.^000000",
		"[Level 1]: ^777777Restores 10% of MaxHP.^000000",
		"[Level 2]: ^777777Restores 30% of MaxHP.^000000",
		"[Level 3]: ^777777Restores 50% of MaxHP.^000000",
		"[Level 4]: ^777777Restores 70% of MaxHP.^000000",
		"[Level 5]: ^777777Restores 90% of MaxHP.^000000"
	].join("\n");

	SkillDescription[SKID.SU_TUNAPARTY] = [
		"Tuna Party",
		"Max Lv: 5",
		"^777777Skill Requirement: Tuna Belly Lv. 3 ^000000",
		"Class: ^777777Seafood (Supportive)^000000",
		"Target: ^777777Player^000000",
		"Details: ^777777The spirit of a delicious tuna protects a target for 30 seconds.^000000",
		"[Level 1]: ^777777Tuna DEF: 10% of your MaxHP^000000",
		"[Level 2]: ^777777Tuna DEF: 20% of your MaxHP^000000",
		"[Level 3]: ^777777Tuna DEF: 30% of your MaxHP^000000",
		"[Level 4]: ^777777Tuna DEF: 40% of your MaxHP^000000",
		"[Level 5]: ^777777Tuna DEF: 50% of your MaxHP^000000"
	].join("\n");

	SkillDescription[SKID.SU_SV_STEMSPEAR] = [
		"Silvervine Stem Spear",
		"Max Lv: 5",
		"^777777Skill Requirement: Sprite Marble Lv. 1^000000",
		"Class: ^777777Plant (Attack)^000000",
		"Target: ^777777Enemy^000000",
		"Details: ^777777Penetrate enemies with the spirit of a silvervine stem.^000000",
		"^777777This skill creates a chance of being activated twice at Base Level 30 or above. This chance increases every 30 Base levels.^000000",
		"[Level 1]: ^777777Earth Magic / 700% of MATK / Bleeding Rate: 10%^000000",
		"[Level 2]: ^777777Fire Magic / 700% of MATK / Bleeding Rate: 10%^000000",
		"[Level 3]: ^777777Water Magic / 700% of MATK / Bleeding Rate: 10%^000000",
		"[Level 4]: ^777777Wind Magic / 700% of MATK / Bleeding Rate: 10%^000000",
		"[Level 5]: ^777777Ghost Magic / 700% of MATK / Bleeding Rate: 10%^000000"
	].join("\n");

	SkillDescription[SKID.SU_SV_ROOTTWIST] = [
		"Silvervine Root Twist",
		"Max Lv: 5",
		"^777777Skill Requirement: Silvervine Stem Spear Lv. 3 ^000000",
		"Class: ^777777Plant (Supportive)^000000",
		"Target: ^777777Enemy^000000",
		"Details: ^777777Bind enemies with the spirit of silvervine roots. The bound enemies receive Neutral damage.^000000",
		"^777777Can be canceled by Heaven's Drive and Trample. Can't be used on Boss monsters.^000000",
		"[Level 1]: ^777777Lasts for 7 sec.^000000",
		"[Level 2]: ^777777Lasts for 9 sec.^000000",
		"[Level 3]: ^777777Lasts for 11 sec.^000000",
		"[Level 4]: ^777777Lasts for 13 sec.^000000",
		"[Level 5]: ^777777Lasts for 15 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SU_CN_METEOR] = [
		"Catnip Meteor",
		"Max Lv: 5",
		"^777777Skill Requirement: Silvervine Root Twist Lv. 3 ^000000",
		"Class: ^777777Plant (Attack)^000000",
		"Target: ^777777Enemy^000000",
		"Details: ^777777Drop the spirits of giant catnip plants from a high place. The number of catnip plants dropped increases, depending on the skill level.",
		"Each catnip plant covers a 5 x5 area.",
		"Use 1 Catnip Fruit to create a chance of Curse.^000000",
		"[Level 1]: ^777777Neutral Magic / Effective Range: 7 x7 / 300% of MATK^000000",
		"[Level 2]: ^777777Neutral Magic / Effective Range: 7 x7 / 400% of MATK^000000",
		"[Level 3]: ^777777Neutral Magic / Effective Range: 7 x7 / 500% of MATK^000000",
		"[Level 4]: ^777777Neutral Magic / Effective Range: 7 x7 / 600% of MATK^000000",
		"[Level 5]: ^777777Neutral Magic / Effective Range: 7 x7 / 700% of MATK^000000"
	].join("\n");

	SkillDescription[SKID.SU_CN_POWDERING] = [
		"Catnip Powdering",
		"Max Lv: 5",
		"^777777Skill Requirement: Catnip Meteor Lv. 3 ^000000",
		"Class: ^777777Plant (Supportive)^000000",
		"Target: ^777777Enemy^000000",
		"Details: ^777777Scatter catnip powder, temporarily decreasing ATK and MATK by 50% within range. MSPD is also decreased within the area.^000000",
		"^777777This skill also significantly increases natural HP and SP Recovery.^000000",
		"^777777Requires 1 Catnip Fruit.^000000",
		"[Level 1]: ^777777Effective Range: 3 x3 / Lasts for 3 sec.^000000",
		"[Level 2]: ^777777Effective Range: 3 x3 / Lasts for 4 sec.^000000",
		"[Level 3]: ^777777Effective Range: 5 x5 / Lasts for 5 sec.^000000",
		"[Level 4]: ^777777Effective Range: 5 x5 / Lasts for 6 sec.^000000",
		"[Level 5]: ^777777Effective Range: 7 x7 / Lasts for 7 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SU_PICKYPECK] = [
		"Picky Peck",
		"Max Lv: 5",
		"^777777Skill Requirement: Sprite Marble Lv. 1^000000",
		"Class: ^777777Animal (Attack)^000000",
		"Target: ^777777Enemy^000000",
		"Details: ^777777Shoot the spirit of an angry picky at enemies. Inflicts double damage on enemies with less than 50% of HP.^000000",
		"^777777This skill creates a chance of being activated twice at Base Level 30 or above. This chance increases every 30 Base levels.^000000",
		"[Level 1]: ^777777Long-ranged Physical / 300% of ATK^000000",
		"[Level 2]: ^777777Long-ranged Physical / 400% of ATK^000000",
		"[Level 3]: ^777777Long-ranged Physical / 500% of ATK^000000",
		"[Level 4]: ^777777Long-ranged Physical / 600% of ATK^000000",
		"[Level 5]: ^777777Long-ranged Physical / 700% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.SU_ARCLOUSEDASH] = [
		"Arclouse Dash",
		"Max Lv: 5",
		"^777777Skill Requirement: Picky Peck Lv. 3 ^000000",
		"Class: ^777777Animal (Supportive)^000000",
		"Target: ^777777Player^000000",
		"Details: ^777777Absorb the spirit of an Arclouse and temporarily become agile. This skill also increases Long-ranged Physical damage by 10% if its target is a Doram (you included).^000000",
		"[Level 1]: ^777777AGI +20 and increased MSPD for 60 sec.^000000",
		"[Level 2]: ^777777AGI +25 and increased MSPD for 70 sec.^000000",
		"[Level 3]: ^777777AGI +30 and increased MSPD for 80 sec.^000000",
		"[Level 4]: ^777777AGI +35 and increased MSPD for 90 sec.^000000",
		"[Level 5]: ^777777AGI +40 and increased MSPD for 100 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SU_SCAROFTAROU] = [
		"Scar of Tarou",
		"Max Lv: 5",
		"^777777Skill Requirement: Arclouse Dash Lv. 3 ^000000",
		"Class: ^777777Animal (Attack)^000000",
		"Target: ^777777Enemy^000000",
		"Details: ^777777The wounded spirit of a country mouse inflicts the same wounds on enemies.^000000",
		"^777777The bite wounds remove a certain amount of MaxHP, depending on the skill level and your DEX.^000000",
		"^777777Can be canceled by Heal, Cure, Clearance, High Heal, or Coluseo Heal. This skill can't debuff Boss monsters, but inflicts double damage on them.^000000",
		"^777777This skill creates a chance of being activated twice at Base Level 30 or above. This chance increases every 30 Base levels.^000000",
		"[Level 1]: ^777777100% of ATK / Bite Wound: Remove some MaxHP every sec. for 9 sec.^000000",
		"[Level 2]: ^777777200% of ATK / Bite Wound: Remove some MaxHP every sec. for 9 sec.^000000",
		"[Level 3]: ^777777300% of ATK / Bite Wound: Remove some MaxHP every sec. for 9 sec.^000000",
		"[Level 4]: ^777777400% of ATK / Bite Wound: Remove some MaxHP every sec. for 9 sec.^000000",
		"[Level 5]: ^777777500% of ATK / Bite Wound: Remove some MaxHP every sec. for 9 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SU_LUNATICCARROTBEAT] = [
		"Lunatic Carrot Beat",
		"Max Lv: 5",
		"^777777Skill Requirement: Scar of Tarou Lv. 3 ^000000",
		"Class: ^777777Animal (Attack)^000000",
		"Target: ^777777Enemy^000000",
		"Details: ^777777The wrath of a Lunatic spirit rains carrots on enemies.^000000",
		"^777777Use 1 Carrot to create a chance of Stun.^000000",
		"[Level 1]: ^777777300% of ATK / Effective Range: 3 x3^000000",
		"[Level 2]: ^777777400% of ATK / Effective Range: 3 x3^000000",
		"[Level 3]: ^777777500% of ATK / Effective Range: 5 x5^000000",
		"[Level 4]: ^777777600% of ATK / Effective Range: 5 x5^000000",
		"[Level 5]: ^777777700% of ATK / Effective Range: 7 x7^000000"
	].join("\n");

	SkillDescription[SKID.SU_POWEROFSEA] = [
		"Power of Sea",
		"Max Lv: 1",
		"^777777Skill Requirement: Tuna Party Lv. 3 ^000000",
		"Class: ^000099Passive^000000",
		"Details: ^777777You've acquired the power of the sea, though partially, through the spirits you command.^000000",
		"^777777MaxHP +1,000, MaxSP +100, healing amounts +10%. Invest 20 or more SP in Seafood skills to additionally get MaxHP +3,000, MaxSP +300, and healing amounts +20%.^000000"
	].join("\n");

	SkillDescription[SKID.SU_POWEROFLAND] = [
		"Power of Land",
		"Max Lv: 1",
		"^777777Skill Requirement: Catnip Powdering Lv. 3 ^000000",
		"Class: ^000099Passive^000000",
		"Details: ^777777You've acquired the power of earth, though partially, through the spirits you command.^000000",
		"^777777INT +20. Invest 20 or more SP in Plant skills to get MATK +20%.^000000"
	].join("\n");

	SkillDescription[SKID.SU_POWEROFLIFE] = [
		"Power of Life",
		"Max Lv: 1",
		"^777777Skill Requirement: Lunatic Carrot Beat Lv. 3 ^000000",
		"Class: ^000099Passive^000000",
		"Details: ^777777You've acquired the power of life, though partially, through the spirits you command.^000000",
		"^777777FLEE, HIT, and CRI +20. Invest in 20 or more SP in Animal skills to get Long-ranged Physical ATK +20%.^000000"
	].join("\n");

	SkillDescription[SKID.ALL_GLASTHEIM_RECALL] = [
		"Glast Heim Return",
		"Max Lv: 1",
		"Class: ^777777Supportive^bb0000 (Return)^000000",
		"Details: ^777777Move to ''Glast Heim.'' Cools down for 5 minutes after use.^000000"
	].join("\n");

	SkillDescription[SKID.SU_SOULATTACK] = [
		"Soul Attack",
		"Max Lv: 1",
		"^777777Skill Requirement: Sprite Marble Lv. 1^000000",
		"Class: ^000099Passive^000000",
		"Target: ^777777Enemy^000000",
		"Details: ^777777Basic attacks become Long-ranged attacks, throwing heavy souls at enemies.^000000"
	].join("\n");

	SkillDescription[SKID.SU_GROOMING] = [
		"Grooming",
		"Max Lv: 5",
		"^777777Skill Requirement: Power of Sea Lv. 1 ^000000",
		"Class: ^777777Seafood (Supportive)^000000",
		"Target: ^777777Yourself^000000",
		"Details: ^777777Groom your hair, treating yourself.^000000",
		"^777777Removes the following Status effects: Stun, Frozen, Petrification, Sleep, Silence, Bleeding, Poison, Fear, Mandragora Howling, Crystallization, Freezing, and Deep Sleep.^000000",
		"^777777Temporarily increases Dodge.^000000",
		"^777777Can't be used if you're not in the condition to use skills (Frozen, Petrified, Silent, etc.).^000000",
		"[Level 1]: ^777777 FLEE +100, Lasts for 3 sec.^000000",
		"[Level 2]: ^777777 FLEE +100, Lasts for 4 sec.^000000",
		"[Level 3]: ^777777 FLEE +100, Lasts for 5 sec.^000000",
		"[Level 4]: ^777777 FLEE +100, Lasts for 6 sec.^000000",
		"[Level 5]: ^777777 FLEE +100, Lasts for 7 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SU_PURRING] = [
		"Purring",
		"Max Lv: 5",
		"^777777Skill Requirement: Grooming Lv. 5 ^000000",
		"Class: ^777777Seafood (Supportive)^000000",
		"Target: ^777777Entire Party^000000",
		"Details: ^777777Purr happily, treating everyone.^000000",
		"^777777Temporarily cast the skill, [Grooming], on you and all party members in one screen.^000000",
		"^777777Can't be used if you're not in the condition to use skills (Frozen, Petrified, Silent, etc.).^000000",
		"[Level 1]: ^777777 FLEE +100, Lasts for 7 sec.^000000",
		"[Level 2]: ^777777 FLEE +100, Lasts for 9 sec.^000000",
		"[Level 3]: ^777777 FLEE +100, Lasts for 11 sec.^000000",
		"[Level 4]: ^777777 FLEE +100, Lasts for 13 sec.^000000",
		"[Level 5]: ^777777 FLEE +100, Lasts for 15 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SU_SHRIMPARTY] = [
		"Tasty Shrimp Party",
		"Max Lv: 5",
		"^777777Skill Requirement: Purring Lv. 5 ^000000",
		"Class: ^777777Seafood (Supportive)^000000",
		"Target: ^777777Entire Party^000000",
		"Details: ^777777Cast the skill, [Fresh Shrimp], on you and all party members in one screen. (Duration affected by the skill level)^000000",
		"^777777This skill additionally casts [Blessing of Shrimp], the skill that increases SP Recovery by 150%, on you.^000000",
		"[Level 1]: ^777777Increased SP Recovery for 12 sec.^000000",
		"[Level 2]: ^777777Increased SP Recovery for 14 sec.^000000",
		"[Level 3]: ^777777Increased SP Recovery for 16 sec.^000000",
		"[Level 4]: ^777777Increased SP Recovery for 18 sec.^000000",
		"[Level 5]: ^777777Increased SP Recovery for 20 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SU_CHATTERING] = [
		"Chattering",
		"Max Lv: 5",
		"^777777Skill Requirement: Power of Land Lv. 1 ^000000",
		"Class: ^777777Plant (Supportive)^000000",
		"Target: ^777777Yourself^000000",
		"Details: ^777777Awakens you to your hunting instinct, along with the thrill of the hunt.^000000",
		"^777777ATK/MATK + 100 for 5 sec. Increased MSPD for 10 sec.^000000",
		"[Level 1]: ^777777SP Cost: 50^000000",
		"[Level 2]  ^777777SP Cost: 45 ^000000",
		"[Level 3]: ^777777SP Cost: 40^000000",
		"[Level 4]  ^777777SP Cost: 35 ^000000",
		"[Level 5]  ^777777SP Cost: 30 ^000000"
	].join("\n");

	SkillDescription[SKID.SU_MEOWMEOW] = [
		"Meow Meow",
		"Max Lv: 5",
		"^777777Skill Requirement: Chattering Lv. 5 ^000000",
		"Class: ^777777Plant (Supportive)^000000",
		"Target: ^777777Entire Party^000000",
		"Details: ^777777Awaken your comrades' hunting instinct through Chattering.^000000",
		"^777777Temporarily increase ATK/MATK by 100 and MSPD by a certain amount for you and all your party members in one screen.^000000",
		"[Level 1]: ^777777Lasts for 8 sec. / SP Cost: 100^000000",
		"[Level 2]: ^777777Lasts for 8 sec. / SP Cost: 90^000000",
		"[Level 3]: ^777777Lasts for 10 sec. / SP Cost: 80^000000",
		"[Level 4]: ^777777Lasts for 10 sec. / SP Cost: 70^000000",
		"[Level 5]: ^777777Lasts for 12 sec. / SP Cost: 60^000000"
	].join("\n");

	SkillDescription[SKID.SU_NYANGGRASS] = [
		"Nyang Grass",
		"Max Lv: 5",
		"^777777Skill Requirement: Meow Meow Lv. 5 ^000000",
		"Class: ^777777Plant (Supportive)^000000",
		"Target: ^777777Enemy^000000",
		"Details: ^777777Neutralizes enemy DEF within range. (Instantly canceled out of range)^000000",
		"^777777In the case of Player-type enemies, sets Equipment's DEF/MDEF to 0.^000000",
		"^777777In the case of Monster-type enemies, sets DEF/MDEF to 50%.^000000",
		"[Level 1]: ^777777Effective Range: 5 x5, Lasts for 6 sec.^000000",
		"[Level 2]: ^777777Effective Range: 5 x5, Lasts for 7 sec.^000000",
		"[Level 3]: ^777777Effective Range: 7 x7, Lasts for 8 sec.^000000",
		"[Level 4]: ^777777Effective Range: 7 x7, Lasts for 9 sec.^000000",
		"[Level 5]: ^777777Effective Range: 9 x9, Lasts for 10 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SU_HISS] = [
		"Hiss",
		"Max Lv: 5",
		"^777777Skill Requirement: Power of Life Lv. 1 ^000000",
		"Class: ^777777Animal (Supportive)^000000",
		"Target: ^777777Entire Party^000000",
		"Details: ^777777Stay alert for possible danger.^000000",
		"^777777Temporarily increase Perfect Dodge and MSPD for you and all party members in one screen.^000000",
		"[Level 1]: ^777777Perfect Dodge +50 for 3 sec. Increased MSPD for 3 sec.^000000",
		"[Level 2]: ^777777Perfect Dodge +50 for 3 sec. Increased MSPD for 3 sec.^000000",
		"[Level 3]: ^777777Perfect Dodge +50 for 3 sec. Increased MSPD for 4 sec.^000000",
		"[Level 4]: ^777777Perfect Dodge +50 for 3 sec. Increased MSPD for 4 sec.^000000",
		"[Level 5]: ^777777Perfect Dodge +50 for 3 sec. Increased MSPD for 5 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SU_POWEROFFLOCK] = [
		"Power of Flock",
		"Max Lv: 5",
		"^777777Skill Requirement: Hiss Lv. 5 ^000000",
		"Class: ^777777Animal (Supportive)^000000",
		"Target: ^777777Enemy^000000",
		"Details: ^777777Your powerful presence strikes terror into everyone around you.^000000",
		"^777777Cast Fear and Frozen on all enemies within range.^000000",
		"[Level 1]: ^777777Effective Range: 7 x7 around you^000000",
		"[Level 2]: ^777777Effective Range: 9 x9 around you^000000",
		"[Level 3]: ^777777Effective Range: 11 x11 around you^000000",
		"[Level 4]: ^777777Effective Range: 13 x13 around you^000000",
		"[Level 5]: ^777777Effective Range: Current screen^000000"
	].join("\n");

	SkillDescription[SKID.SU_SVG_SPIRIT] = [
		"Spirit of Savage",
		"Max Lv: 5",
		"^777777Skill Requirement: Power of Flock Lv. 5 ^000000",
		"Class: ^777777Animal (Attack)^000000",
		"Details: ^777777Summon the spirit of a Savage that charges at the selected target.^000000",
		"^777777The Savage travels to its destination in a straight line, attacking all enemies in its path.^000000",
		"[Level 1]: ^777777ATK +400%^000000",
		"[Level 2]: ^777777ATK +550%^000000",
		"[Level 3]: ^777777ATK +700%^000000",
		"[Level 4]: ^777777ATK +850%^000000",
		"[Level 5]: ^777777ATK +1,000%^000000"
	].join("\n");

	SkillDescription[SKID.SU_SPIRITOFSEA] = [
		"Spirit of Sea",
		"Max Lv: 1",
		"^777777Skill Requirement: Tasty Shrimp Party Lv. 5 ^000000",
		"Class: ^000099Passive^000000",
		"Details: ^777777The spirit of the sea lends you its great power, improving your Seafood skills.^000000",
		"* Fresh Shrimp: ^777777HP healing amounts x2 times^000000",
		"* Bunch of Shrimp: ^777777ATK/MATK bonus duration +120 sec.^000000",
		"* Tuna Belly: ^777777Skill cooldown -5 sec.^000000",
		"* Tuna Party: ^777777Increased tuna DEF^000000",
		"* Shrimp Party: ^777777Increased HP healing amounts for you and your party^000000"
	].join("\n");

	SkillDescription[SKID.SU_SPIRITOFLAND] = [
		"Spirit of Land",
		"Max Lv: 1",
		"^777777Skill Requirement: Nyang Grass Lv. 5 ^000000",
		"Class: ^000099Passive^000000",
		"Details: ^777777The spirit of earth lends you its great power, improving your Plant skills.^000000",
		"* Silvervine Stem Spear: ^777777Significantly increases MSPD for 3 seconds.^000000",
		"* Silvervine Root Twist: ^777777Increases MATK by Base Level for 3 seconds.^000000",
		"* Catnip Powdering: ^777777Increases Perfect Dodge by Base Level/12 for 3 seconds.^000000",
		"* Catnip Meteor: ^777777For 3 seconds, when hit with a melee attack, there is a chance to auto cast Silvervine Stem Spear against the attacker.^000000",
		"* Nyang Grass: ^777777Increases MATK by Base Level for 3 seconds.^000000"
	].join("\n");

	SkillDescription[SKID.SU_SPIRITOFLIFE] = [
		"Spirit of Life",
		"Max Lv: 1",
		"^777777Skill Requirement: Spirit of Savage Lv. 5^000000",
		"Class: ^000099Passive^000000",
		"Details: ^777777The spirit of life lends you its great power, improving your Animal skills.^000000",
		"^777777The following skills increase ATK based on your remaining HP (%).^000000",
		"* Picky Peck",
		"* Scar of Tarou",
		"* Lunatic Carrot Beat",
		"* Spirit of Savage"
	].join("\n");

	SkillDescription[SKID.ALL_PRONTERA_RECALL] = [
		"Prontera Recall",
		"Max LV : 2",
		"Class : ^777777Support^bb0000(Recall)^000000",
		"Subject : ^777777Return back to Prontera. Unavaialble for 15 minutes after use.^000000"
	].join("\n");

	SkillDescription[SKID.GD_GUILD_STORAGE] = [
		"Guild Storage Extension",
		"Skill Form : ^000099Passive^000000",
		"Target : ^777777Guild^000000",
		"Description : ^777777Guild Storage Service can be enabled. Increase the slot available.^000000",
		"[Level 1] : ^777777Slots 100^000000",
		"[Level 2] : ^777777Slots 200^000000",
		"[Level 3] : ^777777Slots 300^000000",
		"[Level 4] : ^777777Slots 400^000000",
		"[Level 5] : ^777777Slots 500^000000"
	].join("\n");

	SkillDescription[SKID.SJ_PURIFY] = [
		"Solar, Lunar, and Stellar Purification",
		"Max Lv: 1",
		"^777777Skill Requirement: Solar, Lunar, and Stellar Shadow Lv. 10^000000",
		"Class: ^777777Passive^000000",
		"Description: ^777777Decreases Solar, Lunar, and Stellar Shadow's penalty.^000000",
		"^777777Halves Solar, Lunar, and Stellar Shadow's vision penalty.^000000"
	].join("\n");

	SkillDescription[SKID.SJ_DOCUMENT] = [
		"Solar, Lunar, and Stellar Record",
		"Max Lv: 3",
		"^777777Skill Requirement: Solar, Lunar, and Stellar Perception Lv. 3/Solar, Lunar, and Stellar Opposition Lv. 3^000000",
		"Class: ^777777Support^000000",
		"Description: ^777777Resets set effects.^000000",
		"^777777Resets the maps and monsters selected for Solar, Lunar, and Stellar Perception/Opposition.^000000",
		"[Level.1]: ^777777Resets the selected maps \t/Skill cooldown: 60 sec. ^000000",
		"[Level 2]: ^777777Resets the selected monsters\t/Skill cooldown: 60 sec.^000000",
		"[Level 3]: ^777777Resets everything \t/Skill cooldown: 60 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SJ_PROMINENCEKICK] = [
		"Blaze Kick",
		"Max Lv: 7",
		"^777777Skill Requirement: Solar Stance Lv. 1^000000",
		"Class: ^777777Attack^000000",
		"Description: ^777777A Solar skill.^000000",
		"^777777Deliver a crimson, blazing kick to a target and surrounding enemies.^000000",
		"^777777This skill additionally inflicts damage at 100% of Physical Attack in 3 x3 range around you.^000000",
		"^777777Can be chained with Solar Explosion.^000000",
		"[Level 1]: ^777777200% of ATK^000000",
		"[Level 2]: ^777777250% of ATK^000000",
		"[Level 3]: ^777777300% of ATK^000000",
		"[Level 4]: ^777777350% of ATK^000000",
		"[Level 5]: ^777777400% of ATK^000000",
		"[Level 6]: ^777777450% of ATK^000000",
		"[Level 7]: ^777777500% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.SJ_SOLARBURST] = [
		"Solar Explosion",
		"Max Lv: 10",
		"^777777Skill Requirement: Blaze Kick Lv. 7^000000",
		"Class: ^777777Attack^000000",
		"Description: ^777777A Solar skill.^000000",
		"^777777Can be chained with Blaze Kick.^000000",
		"^777777Explode your inner Solar energy, attacking surrounding enemies.^000000",
		"^777777This skill's ATK increases, depending on your Base Level.^000000",
		"[Level 1]: ^7777771,220% of ATK/Range: 7 x7 Cells^000000",
		"[Level 2]: ^7777771,440% of ATK/Range: 7 x7 Cells^000000",
		"[Level 3]: ^7777771,660% of ATK/Range: 7 x7 Cells^000000",
		"[Level 4]: ^7777771,880% of ATK/Range: 7 x7 Cells^000000",
		"[Level 5]: ^7777772,100% of ATK/Range: 7 x7 Cells^000000",
		"[Level 6]: ^7777772,320% of ATK/Range: 7 x7 Cells^000000",
		"[Level 7]: ^7777772,540% of ATK/Range: 7 x7 Cells^000000",
		"[Level 8]: ^7777772,760% of ATK/Range: 7 x7 Cells^000000",
		"[Level 9]: ^7777772,980% of ATK/Range: 7 x7 Cells^000000",
		"[Level 10]: ^7777773,200% of ATK/Range: 7 x7 Cells^000000"
	].join("\n");

	SkillDescription[SKID.SJ_LIGHTOFSUN] = [
		"Solar Luminance",
		"Max Lv: 5",
		"^777777Skill Requirement: Solar Explosion Lv. 3^000000",
		"Class: ^777777Support^000000",
		"Description: ^777777A Solar skill.^000000",
		"^777777Gathers sunlight, intensifying the power of Solar Explosion.^000000",
		"^777777This effect doesn't stack with Lunar or Stellar Luminance.^000000",
		"[Level 1]: ^777777Power bonus +5%/Duration: 20 sec.^000000",
		"[Level 2]: ^777777Power bonus +10%/Duration: 30 sec.^000000",
		"[Level 3]: ^777777Power bonus +15%/Duration: 40 sec.^000000",
		"[Level 4]: ^777777Power bonus +20%/Duration: 50 sec.^000000",
		"[Level 5]: ^777777Power bonus +25%/Duration: 60 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SJ_SUNSTANCE] = [
		"Solar Stance",
		"Max Lv: 3",
		"^777777Skill Requirement: Solar, Lunar, and Stellar Record Lv. 1^000000",
		"Class: ^777777Support/Toggle^000000",
		"Description: ^777777A Stance skill.^000000",
		"^777777Take the stance to employ the power of the sun.^000000",
		"^777777This skill activates the Solar skills and increases ATK for its duration.^000000",
		"[Level 1]: ^777777ATK +3%^000000",
		"[Level 2]: ^777777ATK +4%^000000",
		"[Level 3]: ^777777ATK +5%^000000"
	].join("\n");

	SkillDescription[SKID.SJ_LUNARSTANCE] = [
		"Lunar Stance",
		"Max Lv: 3",
		"^777777Skill Requirement: Solar, Lunar, and Stellar Record Lv. 1^000000",
		"Class: ^777777Support/Toggle^000000",
		"Description: ^777777A Stance skill.^000000",
		"^777777Take the stance to employ the power of the moon.^000000",
		"^777777This skill activates the Lunar skills and increases Max HP for its duration.^000000",
		"[Level 1]: ^777777MHP +3%^000000",
		"[Level 2]: ^777777MHP +4%^000000",
		"[Level 3]: ^777777MHP +5%^000000"
	].join("\n");

	SkillDescription[SKID.SJ_STARSTANCE] = [
		"Stellar Stance",
		"Max Lv: 3",
		"^777777Skill Requirement: Solar, Lunar, and Stellar Record Lv. 1^000000",
		"Class: ^777777Support/Toggle^000000",
		"Description: ^777777A Stance skill.^000000",
		"^777777Take the stance to employ the power of the stars.^000000",
		"^777777This skill activates the Stellar skills and increases ASPD for its duration.^000000",
		"[Level 1]: ^777777Post-attack delay -6%^000000",
		"[Level 2]: ^777777Post-attack delay -8%^000000",
		"[Level 3]: ^777777Post-attack delay -10%^000000"
	].join("\n");

	SkillDescription[SKID.SJ_UNIVERSESTANCE] = [
		"Universal Stance",
		"Max Lv: 3",
		"^777777Skill Requirement: Solar Stance Lv. 3/Lunar Stance Lv. 3/Stellar Stance Lv. 3^000000",
		"Class: ^777777Support/Toggle^000000",
		"Description: ^777777A Stance skill.^000000",
		"^777777Take the stance to draw upon and wield the power of the universe.^000000",
		"^777777This skill activates all your skills, including the Universal type, and increases all your stats for its duration.^000000",
		"[Level 1]: ^777777All stats +3^000000",
		"[Level 2]: ^777777All stats +4^000000",
		"[Level 3]: ^777777All stats +5^000000"
	].join("\n");

	SkillDescription[SKID.SJ_NEWMOONKICK] = [
		"New Moon Kick",
		"Max Lv: 7",
		"^777777Skill Requirement: Lunar Stance Lv. 1^000000",
		"Class: ^777777Attack/Special^000000",
		"Description: ^777777A Lunar skill.^000000",
		"^777777Enter [New Moon] mode in which you can attack surrounding enemies while hiding from their detection.^000000",
		"^777777[New Moon] Mode: Enables you to move while invisible for 15 seconds.^000000",
		"^777777This mode can't even be detected by Demon or Insect monsters, and persists through a Maximum of 7 incoming attacks.^000000",
		"^777777New Moon Kick consumes 1 SP every second for its duration, and it's immediately canceled if you use a skill or become Detected.^000000",
		"[Level 1]: ^777777700% of ATK/Range: 7 x7 Cells^000000",
		"[Level 2]: ^777777800% of ATK/Range: 7 x7 Cells^000000",
		"[Level 3]: ^777777900% of ATK/Range: 7 x7 Cells^000000",
		"[Level 4]: ^7777771,100% of ATK/Range: 7 x7 Cells^000000",
		"[Level 5]: ^7777771,200% of ATK/Range: 7 x7 Cells^000000",
		"[Level 6]: ^7777771,300% of ATK/Range: 7 x7 Cells^000000",
		"[Level 7]: ^7777771,400% of ATK/Range: 7 x7 Cells^000000"
	].join("\n");

	SkillDescription[SKID.SJ_FULLMOONKICK] = [
		"Full Moon Kick",
		"Max Lv: 10",
		"^777777Skill Requirement: New Moon Kick Lv. 7^000000",
		"Class: ^777777Attack/Special^000000",
		"Description: ^777777A Lunar skill.^000000",
		"^777777Requires the [New Moon] mode.^000000",
		"^777777Immediately cancels your [New Moon] mode and attacks surrounding enemies with a chance of Blinding them.^000000",
		"^777777This skill's ATK increases, depending on your Base Level.^000000",
		"[Level 1]: ^7777771,200% of ATK/Range: 7 x7 Cells^000000",
		"[Level 2]: ^7777771,300% of ATK/Range: 7 x7 Cells^000000",
		"[Level 3]: ^7777771,400% of ATK/Range: 7 x7 Cells^000000",
		"[Level 4]: ^7777771,500% of ATK/Range: 7 x7 Cells^000000",
		"[Level 5]: ^7777771,600% of ATK/Range: 7 x7 Cells^000000",
		"[Level 6]: ^7777771,700% of ATK/Range: 7 x7 Cells^000000",
		"[Level 7]: ^7777771,800% of ATK/Range: 7 x7 Cells^000000",
		"[Level 8]: ^7777771,900% of ATK/Range: 7 x7 Cells^000000",
		"[Level 9]: ^7777772,000% of ATK/Range: 7 x7 Cells^000000",
		"[Level 10]: ^7777772,100% of ATK/Range: 7 x7 Cells^000000"
	].join("\n");

	SkillDescription[SKID.SJ_LIGHTOFMOON] = [
		"Lunar Luminance",
		"Max Lv: 5",
		"^777777Skill Requirement: Full Moon Kick Lv. 3^000000",
		"Class: ^777777Support^000000",
		"Description: ^777777A Lunar skill.^000000",
		"^777777Gathers moonlight, intensifying the power of Full Moon Kick.^000000",
		"^777777This effect doesn't stack with Solar or Stellar Luminance.^000000",
		"[Level 1]: ^777777Power bonus +5%/Duration: 20 sec.^000000",
		"[Level 2]: ^777777Power bonus +10%/Duration: 30 sec.^000000",
		"[Level 3]: ^777777Power bonus +15%/Duration: 40 sec.^000000",
		"[Level 4]: ^777777Power bonus +20%/Duration: 50 sec.^000000",
		"[Level 5]: ^777777Power bonus +25%/Duration: 60 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SJ_FLASHKICK] = [
		"Flash Kick",
		"Max Lv: 7",
		"^777777Skill Requirement: Stellar Stance Lv. 1^000000",
		"Class: ^777777Attack/Special^000000",
		"Description: ^777777A Stellar skill.^000000",
		"^777777Deliver a Stellar energy-charged kick that leaves a Star Mark on the target.^000000",
		"^777777Up to 5 Star Marks can be left at the same time.^000000",
		"[Level 1]: ^777777100% of ATK/Star Mark Duration: 4 sec.^000000",
		"[Level 2]: ^777777100% of ATK/Star Mark Duration: 5 sec.^000000",
		"[Level 3]: ^777777100% of ATK/Star Mark Duration: 6 sec.^000000",
		"[Level 4]: ^777777100% of ATK/Star Mark Duration: 7 sec.^000000",
		"[Level 5]: ^777777100% of ATK/Star Mark Duration: 8 sec.^000000",
		"[Level 6]: ^777777100% of ATK/Star Mark Duration: 9 sec.^000000",
		"[Level 7]: ^777777100% of ATK/Star Mark Duration: 10 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SJ_FALLINGSTAR] = [
		"Falling Stars",
		"MAX Lv : 10",
		"^777777Requirement: Flash Kick 7^000000",
		"Type : ^777777Buff / Special^000000",
		"Description : ^777777A stellar skill.^000000",
		"^777777When dealing a basic physical attack, adds a chance to drop the falling stars to the targets marked by Stellar Mark in 5 X 5 around the caster. Stellar Mark inflicts damage on the marked target and surrounding enemeies in 3 X 3.^000000",
		"^777777Damage increases as base level increases.^000000",
		"[Lv 1] : ^777777ATK 200%^000000",
		"[Lv 2] : ^777777ATK 300%^000000",
		"[Lv 3] : ^777777ATK 400%^000000",
		"[Lv 4] : ^777777ATK 500%^000000",
		"[Lv 5] : ^777777ATK 600%^000000",
		"[Lv 6] : ^777777ATK 700%^000000",
		"[Lv 7] : ^777777ATK 800%^000000",
		"[Lv 8] : ^777777ATK 900%^000000",
		"[Lv 9] : ^777777ATK 1000%^000000",
		"[Lv10] : ^777777ATK 1100%^000000"
	].join("\n");

	SkillDescription[SKID.SJ_LIGHTOFSTAR] = [
		"Stellar Luminance",
		"Max Lv: 5",
		"^777777Skill Requirement: Falling Stars Lv. 3^000000",
		"Class: ^777777Support^000000",
		"Description: ^777777A Stellar skill.^000000",
		"^777777Gathers starlight, intensifying the power of Falling Stars.^000000",
		"^777777This effect doesn't stack with Solar or Lunar Luminance.^000000",
		"[Level 1]: ^777777Power bonus +5%/Duration: 20 sec.^000000",
		"[Level 2]: ^777777Power bonus +10%/Duration: 30 sec.^000000",
		"[Level 3]: ^777777Power bonus +15%/Duration: 40 sec.^000000",
		"[Level 4]: ^777777Power bonus +20%/Duration: 50 sec.^000000",
		"[Level 5]: ^777777Power bonus +25%/Duration: 60 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SJ_NOVAEXPLOSING] = [
		"Nova Explosion",
		"Max Lv: 5",
		"^777777Skill Requirement: Universal Stance Lv. 1^000000",
		"Class: ^777777Attack/Special^000000",
		"Description: ^777777A Universal skill.^000000",
		"^777777Can be used in WoE and PvP.^000000",
		"^777777Inflicts fixed Melee Neutral damage that can't be decreased by any effects.^000000",
		"^777777This skill requires all your Universal energy and disables other skills for 2 seconds after its use.^000000",
		"[Level 1]: ^777777300% of ATK/Skill cooldown: 20 sec.^000000",
		"[Level 2]: ^777777400% of ATK/Skill cooldown: 20 sec.^000000",
		"[Level 3]: ^777777500% of ATK/Skill cooldown: 20 sec.^000000",
		"[Level 4]: ^777777600% of ATK/Skill cooldown: 20 sec.^000000",
		"[Level 5]: ^777777700% of ATK/Skill cooldown: 20 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SJ_GRAVITYCONTROL] = [
		"Gravity Control",
		"Max Lv: 1",
		"^777777Skill Requirement: Universal Stance Lv. 1^000000",
		"Class: ^777777Special^000000",
		"Description: ^777777A Universal skill.^000000",
		"^777777Can be used in WoE and PvP.^000000",
		"^777777Controls gravity, lifting enemies in the air.^000000",
		"^777777Lifted enemies can't attack or move, and receive Neutral falling damage after this skill's effect.^000000",
		"^777777The falling damage is affected by your Physical ATK and the target's carrying weight.^000000",
		"^777777Use this skill on the lifted targets to cancel its effect.^000000"
	].join("\n");

	SkillDescription[SKID.SJ_STAREMPEROR] = [
		"Star Emperor's Descent",
		"Max Lv: 5",
		"^777777Skill Requirement: Universal Stance Lv. 3 and Nova Explosion Lv. 5^000000",
		"Class: ^777777Attack/Special^000000",
		"Description: ^777777A Universal skill.^000000",
		"^777777Can be used in WoE and PvP.^000000",
		"^777777The Star Emperor has learned the laws of the universe. Enables you to discharge energy, attacking and Silencing surrounding enemies.^000000",
		"[Level 1]: ^7777771,000% of ATK/Range: 7 x7 Cells^000000",
		"[Level 2]: ^7777771,200% of ATK/Range: 7 x7 Cells^000000",
		"[Level 3]: ^7777771,400% of ATK/Range: 7 x7 Cells^000000",
		"[Level 4]: ^7777771,600% of ATK/Range: 7 x7 Cells^000000",
		"[Level 5]: ^7777771,800% of ATK/Range: 7 x7 Cells^000000"
	].join("\n");

	SkillDescription[SKID.SJ_BOOKOFCREATINGSTAR] = [
		"Star Creator's Book",
		"Max Lv: 5",
		"^777777Skill Requirement: Solar, Lunar, and Stellar Record Lv. 3/Star Emperor's Descent Lv. 3^000000",
		"Class: ^777777Attack/Special^000000",
		"Description: ^777777A Universal skill.^000000",
		"^777777Can be used in WoE and PvP.^000000",
		"^777777Shape the power of the universe into an imaginary star surrounded by a high-level gravitational field.^000000",
		"^777777This gravitational field decreases MSPD by 90% for all targets within range, and attacks enemies at regular intervals.^000000",
		"[Level 1]: ^777777Duration: 6 sec./Range: 5 x5/Hits: 12^000000",
		"[Level 2]: ^777777Duration: 7 sec./Range: 5 x5/Hits: 14^000000",
		"[Level 3]: ^777777Duration: 8 sec./Range: 5 x5/Hits: 16^000000",
		"[Level 4]: ^777777Duration: 9 sec./Range: 5 x5/Hits: 18^000000",
		"[Level 5]: ^777777Duration: 10 sec./Range: 5 x5/Hits: 20^000000"
	].join("\n");

	SkillDescription[SKID.SJ_BOOKOFDIMENSION] = [
		"Book of Dimensions",
		"Max Lv: 5",
		"^777777Skill Requirement: Solar, Lunar, and Stellar Record Lv. 3/Star Emperor's Descent Lv. 3^000000",
		"Class: ^777777Buff/Special^000000",
		"Description: ^777777A Universal skill.^000000",
		"^777777Can be used in WoE and PvP.^000000",
		"^777777Temporarily lends you the power of a different dimension, helping you use the power of the universe to the fullest.^000000",
		"^777777Nova Explosion and Star Emperor's Descent create the following effects for this skill's duration.^000000",
		"^777777Nova Explosion: Waives cooldown and skill use restriction for 5 sec.^000000",
		"^777777Star Emperor's Descent: Creates 2 defensive orbs by your Max SP for 30 seconds.^000000",
		"[Level 1]: ^777777Duration: 60 sec./Skill cooldown: 150 sec.^000000",
		"[Level 2]: ^777777Duration: 60 sec./Skill cooldown: 120 sec.^000000",
		"[Level 3]: ^777777Duration: 60 sec./Skill cooldown: 90 sec.^000000",
		"[Level 4]: ^777777Duration: 60 sec./Skill cooldown: 60 sec.^000000",
		"[Level 5]: ^777777Duration: 60 sec./Skill cooldown: 30 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SP_SOULCOLLECT] = [
		"Soul Collection",
		"Max Lv: 5",
		"^777777Skill Requirement: Provided by default^000000",
		"Class: ^777777Buff/Toggle^000000",
		"Description: ^777777Periodically collects the Soul Energy required for the Soul Reaper skills.^000000",
		"^777777Initially, you can have up to 5 Soul Energy. Once you reach the Maximum limit, you can no longer collect it.^000000",
		"[Level 1]: ^7777771 Soul Energy every 60 sec.^000000",
		"[Level 2]: ^7777771 Soul Energy every 50 sec.^000000",
		"[Level 3]: ^7777771 Soul Energy every 40 sec.^000000",
		"[Level 4]: ^7777771 Soul Energy every 30 sec.^000000",
		"[Level 5]: ^7777771 Soul Energy every 20 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SP_SOULENERGY] = [
		"Soul Energy Research",
		"Max Lv: 5",
		"^777777Skill Requirement: Soul Collection Lv. 1^000000",
		"Class: ^777777Passive^000000",
		"Description: ^777777Study the special energy released from souls and increase the amount of energy you can collect to use your Soul Reaper skills.^000000",
		"[Level 1]: ^777777Max 8 Soul Energy^000000",
		"[Level 2]: ^777777Max 11 Soul Energy^000000",
		"[Level 3]: ^777777Max 14 Soul Energy^000000",
		"[Level 4]: ^777777Max 17 Soul Energy^000000",
		"[Level 5]: ^777777Max 20 Soul Energy^000000"
	].join("\n");

	SkillDescription[SKID.SP_KAUTE] = [
		"Kaute",
		"Max Lv: 5",
		"^777777Skill Requirement: Soul Energy Research Lv. 1^000000",
		"Class: ^777777Buff/Special^000000",
		"Description: ^777777Requires 5 Soul Energy.^000000",
		"^777777Use Soul Energy and convert your HP into a target's SP.^000000",
		"^777777This skill can be used on you, the Soul Linker classes, and your Family members, and Soul-bound targets.^000000",
		"^777777Also, requires at least 30% of remaining HP for use.^000000",
		"[Level 1]: ^777777MHP -12%/SP +12%^000000",
		"[Level 2]: ^777777MHP -14%/SP +14%^000000",
		"[Level 3]: ^777777MHP -16%/SP +16%^000000",
		"[Level 4]: ^777777MHP -18%/SP +18%^000000",
		"[Level 5]: ^777777MHP -20%/SP +20%^000000"
	].join("\n");

	SkillDescription[SKID.SP_SOULUNITY] = [
		"Soul Bind",
		"Max Lv: 7",
		"^777777Skill Requirement: Soul Energy Research Lv. 3^000000",
		"Class: ^777777Buff/Special^000000",
		"Description: ^777777Requires 10 Soul Energy.^000000",
		"^777777Binds your and nearby party members' souls together.^000000",
		"^777777You can restore some HP for the Soul-bound every 3 seconds and use Kaute on them.^000000",
		"^777777This skill's effect is canceled if you become Silenced or Cursed.^000000",
		"[Level 1]: ^777777HP +150/Range: 3 x3 Cells^000000",
		"[Level 2]: ^777777HP +300/Range: 3 x3 Cells^000000",
		"[Level 3]: ^777777HP +450/Range: 5 x5 Cells^000000",
		"[Level 4]: ^777777HP +600/Range: 5 x5 Cells^000000",
		"[Level 5]: ^777777HP +750/Range: 7 x7 Cells^000000",
		"[Level 6]: ^777777HP +900/Range: 7 x7 Cells^000000",
		"[Level 7]: ^777777HP +1,050/Range: 9 x9 Cells^000000"
	].join("\n");

	SkillDescription[SKID.SP_SOULREVOLVE] = [
		"Soul Circulation",
		"Max Lv: 3",
		"^777777Skill Requirement: Soul Energy Research Lv. 3 and Kaute Lv. 3^000000",
		"Class: ^777777Buff/Special^000000",
		"Description: ^777777Can be used on Soul-bestowed targets.^000000",
		"^777777Converts a Soul bestowed on you or your party member to restore your SP.^000000",
		"^777777The Soul disappears upon SP recovery.^000000",
		"[Level 1]: ^777777SP +50^000000",
		"[Level 2]: ^777777SP +100^000000",
		"[Level 3]: ^777777SP +150^000000"
	].join("\n");

	SkillDescription[SKID.SP_SOULSHADOW] = [
		"Shadow Soul",
		"Max Lv: 5",
		"^777777Skill Requirement: Soul Bind Lv. 5^000000",
		"Class: ^777777Buff/Special^000000",
		"Description: ^777777Requires 1 Soul Energy.^000000",
		"^777777Shapes your Soul Energy into a shadowy soul and bestows it upon you or a target (player).^000000",
		"^777777This soul increases Critical Hit Rate and ASPD for its duration.^000000",
		"^777777Can't be used on a target with a different soul already bestowed on it.^000000",
		"[Level 1]: ^777777CRI +12/ASPD +1/Duration: 60 sec.^000000",
		"[Level 2]: ^777777CRI +14/ASPD +1/Duration: 120 sec.^000000",
		"[Level 3]: ^777777CRI +16/ASPD +2/Duration: 180 sec.^000000",
		"[Level 4]: ^777777CRI +18/ASPD +2/Duration: 240 sec.^000000",
		"[Level 5]: ^777777CRI +20/ASPD +3/Duration: 300 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SP_SOULFAIRY] = [
		"Fairy Soul",
		"Max Lv: 5",
		"^777777Skill Requirement: Soul Bind Lv. 5^000000",
		"Class: ^777777Buff/Special^000000",
		"Description: ^777777Requires 1 Soul Energy.^000000",
		"^777777Shapes your Soul Energy into a fairy soul and bestows it upon you or a target (player).^000000",
		"^777777This soul increases MATK and decreases Variable Cast Time for its duration.^000000",
		"^777777Can't be used on a target with a different soul already bestowed on it.^000000",
		"[Level 1]: ^777777MATK +10/Variable Cast Time -5%/Duration: 60 sec.^000000",
		"[Level 2]: ^777777MATK +20/Variable Cast Time -5%/Duration: 120 sec.^000000",
		"[Level 3]: ^777777MATK +30/Variable Cast Time -7%/Duration: 180 sec.^000000",
		"[Level 4]: ^777777MATK +40/Variable Cast Time -7%/Duration: 240 sec.^000000",
		"[Level 5]: ^777777MATK +50/Variable Cast Time -10%/Duration: 300 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SP_SOULFALCON] = [
		"Falcon Soul",
		"Max Lv: 5",
		"^777777Skill Requirement: Soul Circulation Lv. 2^000000",
		"Class: ^777777Buff/Special^000000",
		"Description: ^777777Requires 1 Soul Energy.^000000",
		"^777777Shapes your Soul Energy into a Falcon Soul and bestows it upon you or a target (player).^000000",
		"^777777This soul increases Physical ATK and Hit Rate for its duration.^000000",
		"^777777Can't be used on a target with a different soul already bestowed on it.^000000",
		"[Level 1]: ^777777ATK +10/ HIT +10/Duration: 60 sec.^000000",
		"[Level 2]: ^777777ATK +20/HIT +10/Duration: 120 sec.^000000",
		"[Level 3]: ^777777ATK +30/HIT +13/Duration: 180 sec.^000000",
		"[Level 4]: ^777777ATK +40/HIT +13/Duration: 240 sec.^000000",
		"[Level 5]: ^777777ATK +50/HIT +15/Duration: 300 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SP_SOULGOLEM] = [
		"Golem Soul",
		"Max Lv: 5",
		"^777777Skill Requirement: Soul Circulation Lv. 2^000000",
		"Class: ^777777Buff/Special^000000",
		"Description: ^777777Requires 1 Soul Energy.^000000",
		"^777777Shapes your Soul Energy into a Golem Soul and bestows it upon you or a target (player).^000000",
		"^777777This soul increases Physical and Magic DEF for its duration.^000000",
		"^777777Can't be used on a target with a different soul already bestowed on it.^000000",
		"[Level 1]: ^777777DEF +60/MDEF +20/Duration: 60 sec.^000000",
		"[Level 2]: ^777777DEF +120/MDEF +25/Duration: 120 sec.^000000",
		"[Level 3]: ^777777DEF +180/MDEF +30/Duration: 180 sec.^000000",
		"[Level 4]: ^777777DEF +240/MDEF +35/Duration: 240 sec.^000000",
		"[Level 5]: ^777777DEF +300/MDEF +40/Duration: 300 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SP_SOULREAPER] = [
		"Soul Harvest",
		"Max Lv: 5",
		"^777777Skill Requirement: Soul Collection Lv. 1^000000",
		"Class: ^777777Buff/Special^000000",
		"Description: ^777777Requires 2 Soul Energy.^000000",
		"^777777All your attacks harvests souls from their targets.^000000",
		"^777777Attacking enemies for this skill's duration creates a chance of gaining 1 Soul Energy.^000000",
		"[Level 1]: ^777777Harvest Chance: 15%/Duration: 90 sec.^000000",
		"[Level 2]: ^777777Harvest Chance: 20%/Duration: 120 sec.^000000",
		"[Level 3]: ^777777Harvest Chance: 25%/Duration: 150 sec.^000000",
		"[Level 4]: ^777777Harvest Chance: 30%/Duration: 180 sec.^000000",
		"[Level 5]: ^777777Harvest Chance: 35%/Duration: 210 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SP_SOULCURSE] = [
		"Evil Soul Curse",
		"Max Lv: 5",
		"^777777Skill Requirement: Soul Harvest Lv. 3^000000",
		"Class: ^777777Debuff^000000",
		"Description: ^777777Requires 3 Soul Energy.^000000",
		"^777777Commands evil souls and cast [Evil Curse] on and around a target.^000000",
		"^777777Evil Curse decreases Shadow Resistance by 100%. (20% for Boss monsters and players)^000000",
		"[Level 1]: ^777777Evil Curse Chance: 20%/Range: 7 x7 Cells^000000",
		"[Level 2]: ^777777Evil Curse Chance: 40%/Range: 7 x7 Cells^000000",
		"[Level 3]: ^777777Evil Curse Chance: 60%/Range: 7 x7 Cells^000000",
		"[Level 4]: ^777777Evil Curse Chance: 80%/Range: 7 x7 Cells^000000",
		"[Level 5]: ^777777Evil Curse Chance: 100%/Range: 7 x7 Cells^000000"
	].join("\n");

	SkillDescription[SKID.SP_CURSEEXPLOSION] = [
		"Curse Explosion",
		"Max Lv: 10",
		"^777777Skill Requirement: Evil Soul Curse Lv. 3^000000",
		"Class: ^777777Attack/Damage^000000",
		"Description: ^777777Inflict Shadow Magic damage on your target and other enemies within 7 x7 cells around it.^000000",
		"^777777This skill inflicts more damage on Evil Curse targets.^000000",
		"[Level 1]: ^777777500% Magic Damage/1,500% on the Evil-Cursed^000000",
		"[Level 2]: ^777777600% Magic Damage/1,800% on the Evil-Cursed^000000",
		"[Level 3]: ^777777700% Magic Damage/2,100% on the Evil-Cursed^000000",
		"[Level 4]: ^777777800% Magic Damage/2,400% on the Evil-Cursed^000000",
		"[Level 5]: ^777777900% Magic Damage/2,700% on the Evil-Cursed^000000",
		"[Level 6]: ^7777771,000% Magic Damage/3,000% on the Evil-Cursed^000000",
		"[Level 7]: ^7777771,100% Magic Damage/3,300% on the Evil-Cursed^000000",
		"[Level 8]: ^7777771,200% Magic Damage/3,600% on the Evil-Cursed^000000",
		"[Level 9]: ^7777771,300% Magic Damage/3,900% on the Evil-Cursed^000000",
		"[Level 10]: ^7777771,400% Magic Damage/4,200% on the Evil-Cursed^000000"
	].join("\n");

	SkillDescription[SKID.SP_SHA] = [
		"Esha",
		"Max Lv: 5",
		"^777777Skill Requirement: Soul Harvest Lv. 3^000000",
		"Class: ^777777Attack/Special^000000",
		"Description: ^777777Requires 1 Soul Energy.^000000",
		"^777777Inflicts Magic damage on and around your target and halves their MSPD.^000000",
		"^777777Enables Esma for 5 seconds after use.^000000",
		"^777777Can't be used on players or affect them.^000000",
		"[Level 1]: ^7777775% Magic Damage/MSPD Decrease Duration: 3 sec.^000000",
		"[Level 2]: ^77777710% Magic Damage/MSPD Decrease Duration: 4 sec.^000000",
		"[Level 3]: ^77777715% Magic Damage/MSPD Decrease Duration: 5 sec.^000000",
		"[Level 4]: ^77777720% Magic Damage/MSPD Decrease Duration: 6 sec.^000000",
		"[Level 5]: ^77777725% Magic Damage/MSPD Decrease Duration: 7 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SP_SPA] = [
		"Espa",
		"Max Lv: 10",
		"^777777Skill Requirement: Esha Lv. 1^000000",
		"Class: ^777777Attack/Special^000000",
		"Description: ^777777Requires 1 Soul Energy.^000000",
		"^777777Inflicts Magic damage on your target.^000000",
		"^777777Increases ATK, depending on your Base Level. Also, enables Eswoo for 5 seconds after use.^000000",
		"^777777Consumes 1 Soul Energy for use. This skill doesn't consume Soul Energy at Level 10.^000000",
		"^777777Can't be used on players or affect them.^000000",
		"[Level 1]: ^777777750% Magic Damage^000000",
		"[Level 2]: ^7777771,000% Magic Damage^000000",
		"[Level 3]: ^7777771,250% Magic Damage^000000",
		"[Level 4]: ^7777771,500% Magic Damage^000000",
		"[Level 5]: ^7777771,750% Magic Damage^000000",
		"[Level 6]: ^7777772,000% Magic Damage^000000",
		"[Level 7]: ^7777772,250% Magic Damage^000000",
		"[Level 8]: ^7777772,500% Magic Damage^000000",
		"[Level 9]: ^7777772,750% Magic Damage^000000",
		"[Level 10]: ^7777773,000% Magic Damage, No Soul Energy cost^000000"
	].join("\n");

	SkillDescription[SKID.SP_SWHOO] = [
		"Eswhoo",
		"Max Lv: 10",
		"^777777Skill Requirement: Espa Lv. 3^000000",
		"Class: ^777777Attack/Special^000000",
		"Description: ^777777Requires 2 Soul Energy.^000000",
		"^777777Inflicts Magic damage on and around your target.^000000",
		"^777777Increases ATK, depending on your Base Level. Also, enables Esma for 5 seconds after use.^000000",
		"^777777Consumes 2 Soul Energy for use. This skill only consumes 1 Soul Energy at Level 10.^000000",
		"^777777Can't be used on players or affect them.^000000",
		"[Level 1]: ^7777771,700% Magic Damage/Range: 3 x3 Cells^000000",
		"[Level 2]: ^7777771,900% Magic Damage/Range: 3 x3 Cells^000000",
		"[Level 3]: ^7777772,100% Magic Damage/Range: 3 x3 Cells^000000",
		"[Level 4]: ^7777772,300% Magic Damage/Range: 5 x5 Cells^000000",
		"[Level 5]: ^7777772,500% Magic Damage/Range: 5 x5 Cells^000000",
		"[Level 6]: ^7777772,700% Magic Damage/Range: 5 x5 Cells^000000",
		"[Level 7]: ^7777772,900% Magic Damage/Range: 7 x7 Cells^000000",
		"[Level 8]: ^7777773,100% Magic Damage/Range: 7 x7 Cells^000000",
		"[Level 9]: ^7777773,300% Magic Damage/Range: 7 x7 Cells^000000",
		"[Level 10]: ^7777773,500% Magic Damage/Range: 9 x9 Cells^000000"
	].join("\n");

	SkillDescription[SKID.SP_SOULDIVISION] = [
		"Soul Division",
		"Max Lv: 5",
		"^777777Skill Requirement: Esha Lv. 5 and Espa Lv. 5^000000",
		"Class: ^777777Special^000000",
		"Description: ^777777Requires 1 Soul Energy.^000000",
		"^777777Can be used in WoE and PvP.^000000",
		"^777777Temporarily separates your target's soul from the body, disrupting its reasonable thought process.^000000",
		"^777777Increases the target's post-skill delay for 5 seconds.^000000",
		"[Level 1]: ^777777Post-skill delay +10%^000000",
		"[Level 2]: ^777777Post-skill delay +20%^000000",
		"[Level 3]: ^777777Post-skill delay +30%^000000",
		"[Level 4]: ^777777Post-skill delay +40%^000000",
		"[Level 5]: ^777777Post-skill delay +50%^000000"
	].join("\n");

	SkillDescription[SKID.SP_SOULEXPLOSION] = [
		"Soul Explosion",
		"Max Lv: 5",
		"^777777Skill Requirement: Curse Explosion Lv. 2, Shadow Soul Lv. 1, Fairy Soul Lv. 1, Falcon Soul Lv. 1, and Golem Soul Lv. 1^000000",
		"Class: ^777777Special^000000",
		"Description: ^777777Requires 10 Soul Energy.^000000",
		"^777777Can be used in WoE and PvP.^000000",
		"^777777Detonates the Soul bestowed on your target, inflicting damage based on its current HP.^000000",
		"^777777Requires a soul-bestowed target and it must have at least 10 remaining HP.^000000",
		"[Level 1]: ^777777Target's remaining HP -30%^000000",
		"[Level 2]: ^777777Target's remaining HP -40%^000000",
		"[Level 3]: ^777777Target's remaining HP -50%^000000",
		"[Level 4]: ^777777Target's remaining HP -60%^000000",
		"[Level 5]: ^777777Target's remaining HP -70%^000000"
	].join("\n");

	SkillDescription[SKID.NV_BREAKTHROUGH] = [
		"Breakthrough",
		"Max Lv: 5",
		"Class: ^000099Passive^000000",
		"Description: ^777777The ultimate physical training skill achieved by constant training.^000000",
		"^777777Increases your MaxHP, MaxSP, ATK, and incoming healing amounts.^000000",
		"^ffffff_^000000",
		"[Level 1]: ATK +15, MaxHP +350, MaxSP +30, and incoming healing amounts +2%",
		"[Level 2]: ATK +30, MaxHP +700, MaxSP +60, incoming healing amounts +4%",
		"[Level 3]: ATK +45, MaxHP +1,050, MaxSP +90, and incoming healing amounts +6%",
		"[Level 4]: ATK +60, MaxHP +1,400, MaxSP +120, and incoming healing amounts +8%",
		"[Level 5]: ATK +100, MaxHP +2,000, MaxSP +200, and incoming healing amounts +10%"
	].join("\n");

	SkillDescription[SKID.NV_HELPANGEL] = [
		"Help, Angel!",
		"Max Lv: 1",
		"Class: ^000099Active^000000",
		"Type: ^777777Healing^000000",
		"Target: ^777777Instant cast^000000",
		"Description: ^777777Divine intervention for a Novice in a dangerous situation.^000000",
		"^777777Restores HP and SP for you and your party members in 15 x15 cells around you.^777777",
		"^ffffff_^000000",
		"HP +1,000 and SP +350 per sec./Duration: 20 sec./Skill cooldown: 300 sec."
	].join("\n");

	SkillDescription[SKID.NV_TRANSCENDENCE] = [
		"Transcendence",
		"Max Lv: 5",
		"Class: ^000099Passive^000000",
		"Description: ^777777The ultimate mental training skill achieved by constant training.^000000",
		"^777777Increases your MaxHP, MaxSP, MATK, and healing amounts.^000000",
		"^ffffff_^000000",
		"[Level 1]: MATK +15, MaxHP +350, MaxSP +30, and healing amounts +3%",
		"[Level 2]: MATK +30, MaxHP +700, MaxSP +60, and healing amounts +6%",
		"[Level 3]: MATK +45, MaxHP +1,050, MaxSP +90, and healing amounts +9%",
		"[Level 4]: MATK +60, MaxHP +1,400, MaxSP +120, and healing amounts +12%",
		"[Level 5]: MATK +100, MaxHP +2,000, MaxSP +200, and healing amounts +15%"
	].join("\n");

	SkillDescription[SKID.ALL_NIFLHEIM_RECALL] = [
		"The World of the Dead!",
		"Max Lv: 1",
		"Type : ^777777sub^bb0000(return)^000000",
		"Description: ^777777 Niflheim Returns to 'The World of the Dead'. Cannot be reused for 5 minutes after use.^000000"
	].join("\n");

	SkillDescription[SKID.DK_SERVANTWEAPON] = [
		"Servant Weapon",
		"Max Lv.: 5",
		"Class: ^993300Active^000000",
		"Type: ^777777Support^000000",
		"Target: ^777777Self^000000",
		"Recovery: ^0054FFAP (Skill Level x6)^000000",
		"Details: ^777777Command ethereal weapons, delivering additional attacks with Normal Melee Physical attacks.",
		"You can command up to 5 weapons, and their recharge speed increases with every new skill level.",
		"This skill additionally increases damage, depending on your Base Level and POW, and follows your CRIT to inflict Critical damage.",
		"If it crits, it inflicts half of the total of your Critical Damage Bonus options as damage.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777200% of ATK, Duration: 30 sec.^000000",
		"[Lv. 2]: ^777777250% of ATK, Duration: 60 sec.^000000",
		"[Lv. 3]: ^777777300% of ATK, Duration: 90 sec.^000000",
		"[Lv. 4]: ^777777350% of ATK, Duration: 120 sec.^000000",
		"[Lv. 5]: ^777777400% of ATK, Duration: 150 sec.^000000"
	].join("\n");

	SkillDescription[SKID.DK_SERVANT_W_SIGN] = [
		"Servant Weapon - Sign",
		"Max Lv.: 5",
		"^777777Learning Conditions: Servant Weapon Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Support^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777A Servant Weapon skill.",
		"Shoot a servant Weapon at an enemy, marking it as a Servant Weapon - Phantom and Demolition target.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Marking Duration: 2 sec.^000000",
		"[Lv. 2]: ^777777Marking Duration: 4 sec.^000000",
		"[Lv. 3]: ^777777Marking Duration: 6 sec.^000000",
		"[Lv. 4]: ^777777Marking Duration: 8 sec.^000000",
		"[Lv. 5]: ^777777Marking Duration: 10 sec.^000000"
	].join("\n");

	SkillDescription[SKID.DK_SERVANT_W_PHANTOM] = [
		"Servant Weapon - Phantom",
		"Max Lv.: 5",
		"^777777Learning Conditions: Servant Weapon Lv. 5 and Servant Weapon - Sign Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777A Servant Weapon skill.",
		"Instantly approach a target and use all your servant weapons to attack all Sign targets in 7 x7 cells around the target and others in 5 x5 cells around them. This skill inflicts Melee Physical damage by the number of servant weapons consumed, and also creates a chance of Sightless.",
		"It additionally increases damage, depending on your Base Level and POW, and follows your CRIT to inflict Critical damage.",
		"If it crits, it inflicts half of the total of your Critical Damage Bonus options as damage.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777200% of ATK, Sightless Chance: 40%^000000",
		"[Lv. 2]: ^777777300% of ATK, Sightless Chance: 50%^000000",
		"[Lv. 3]: ^777777400% of ATK, Sightless Chance: 60%^000000",
		"[Lv. 4]: ^777777500% of ATK, Sightless Chance: 70%^000000",
		"[Lv. 5]: ^777777600% of ATK, Sightless Chance: 80%^000000"
	].join("\n");

	SkillDescription[SKID.DK_SERVANT_W_DEMOL] = [
		"Servant Weapon - Demolition",
		"Max Lv.: 5",
		"^777777Learning Conditions: Servant Weapon - Phantom Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^777777Instant cast^000000",
		"Recovery: ^0054FF3 AP^000000",
		"Details: ^777777A Servant Weapon skill.",
		"Use all your servant weapons and attack all Sign targets in 13 x13 cells around you, inflicting Melee Physical damage by the number of servant weapons consumed. This skill recharges servant weapons by the number of targets you hit.",
		"It additionally increases damage, depending on your Base Level and POW, and follows your CRIT to inflict Critical damage.",
		"If it crits, it inflicts half of the total of your Critical Damage Bonus options as damage.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777150% of ATK^000000",
		"[Lv. 2]: ^777777300% of ATK^000000",
		"[Lv. 3]: ^777777450% of ATK^000000",
		"[Lv. 4]: ^777777600% of ATK^000000",
		"[Lv. 5]: ^777777750% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.DK_CHARGINGPIERCE] = [
		"Charging Pierce",
		"Max Lv.: 10",
		"^777777Learning Conditions: Hundred Spears Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Support^000000",
		"Target: ^777777Self^000000",
		"Details: ^777777A Spear and Two-handed Sword skill.",
		"Pierce, Clashing Spiral, Hundred Spears, and Madness Crusher temporarily add Charge stacks.",
		"Charge stacks last for 5 seconds, and disappear if not increased within the time limit.",
		"You can get up to 10 Charge stacks to significantly increase Pierce, Clashing Spiral, Hundred Spears, and Madness Crusher damage.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 90 sec.^000000",
		"[Lv. 2]: ^777777Duration: 100 sec.^000000",
		"[Lv. 3]: ^777777Duration: 110 sec.^000000",
		"[Lv. 4]: ^777777Duration: 120 sec.^000000",
		"[Lv. 5]: ^777777Duration: 130 sec.^000000",
		"[Lv. 6]: ^777777Duration: 140 sec.^000000",
		"[Lv. 7]: ^777777Duration: 150 sec.^000000",
		"[Lv. 8]: ^777777Duration: 160 sec.^000000",
		"[Lv. 9]: ^777777Duration: 170 sec.^000000",
		"[Lv. 10]: ^777777Duration: 180 sec.^000000"
	].join("\n");

	SkillDescription[SKID.DK_TWOHANDDEF] = [
		"Two-handed Defense",
		"Max Lv.: 10",
		"Class: ^000099Passive^000000",
		"Details: ^777777Two-handed Swords, Spears, and Axes decrease Physical damage from enemies of all sizes.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Small -1%, Medium -2%, Large -3%^000000",
		"[Lv. 2]: ^777777Small -2%, Medium -3%, Large -5%^000000",
		"[Lv. 3]: ^777777Small -3%, Medium -5%, Large -7%^000000",
		"[Lv. 4]: ^777777Small -4%, Medium -6%, Large -9%^000000",
		"[Lv. 5]: ^777777Small -5%, Medium -8%, Large -10%^000000",
		"[Lv. 6]: ^777777Small -6%, Medium -9%, Large -12%^000000",
		"[Lv. 7]: ^777777Small -7%, Medium -11%, Large -13%^000000",
		"[Lv. 8]: ^777777Small -8%, Medium -12%, Large -15%^000000",
		"[Lv. 9]: ^777777Small -9%, Medium -14%, Large -16%^000000",
		"[Lv. 10]: ^777777Small -10%, Medium -15%, Large -18%^000000"
	].join("\n");

	SkillDescription[SKID.DK_HACKANDSLASHER] = [
		"Hack and Slash",
		"Max Lv.: 10",
		"^777777Learning Conditions: Two-handed Defense Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777A Two-handed Sword/Axe skill.",
		"Slash at a target, inflicting Melee Physical damage, and then swing your Weapon, inflicting Long-ranged Physical damage on others around it.",
		"Two-handed Swords additionally increase the slashing damage, depending on your Base Level and POW.",
		"Two-handed Axes additionally increase the swinging damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777620% of ATK (Slash/Swing), Swing Range: 3 x3 cells^000000",
		"[Lv. 2]: ^777777840% of ATK (Slash/Swing), Swing Range: 3 x3 cells^000000",
		"[Lv. 3]: ^777777960% of ATK (Slash/Swing), Swing Range: 3 x3 cells^000000",
		"[Lv. 4]: ^7777771,080% of ATK (Slash/Swing), Swing Range: 3 x3 cells^000000",
		"[Lv. 5]: ^7777771,200% of ATK (Slash/Swing), Swing Range: 5 x5 cells^000000",
		"[Lv. 6]: ^7777771,320% of ATK (Slash/Swing), Swing Range: 5 x5 cells^000000",
		"[Lv. 7]: ^7777771,440% of ATK (Slash/Swing), Swing Range: 5 x5 cells^000000",
		"[Lv. 8]: ^7777771,560% of ATK (Slash/Swing), Swing Range: 5 x5 cells^000000",
		"[Lv. 9]: ^7777771,680% of ATK (Slash/Swing), Swing Range: 7 x7 cells^000000",
		"[Lv. 10]: ^7777771,800% of ATK (Slash/Swing), Swing Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.DK_MADNESS_CRUSHER] = [
		"Madness Crusher",
		"Max Lv.: 5",
		"^777777Learning Conditions: Charging Pierce Lv. 5 and Hack and Slash Lv. 10^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF2 AP^000000",
		"Details: ^777777A Two-handed Sword/Spear skill.",
		"Strike your Weapon downward, inflicting Long-ranged Physical damage on and around a target.",
		"This skill additionally increases damage, depending on your Base Level, POW, and weapon weight.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777450% of ATK, Range: 3 x3 cells^000000",
		"[Lv. 2]: ^777777900% of ATK, Range: 5 x5 cells^000000",
		"[Lv. 3]: ^7777771,350% of ATK, Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777771,800% of ATK, Range: 7 x7 cells^000000",
		"[Lv. 5]: ^7777772,250% of ATK, Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.DK_STORMSLASH] = [
		"Storm Slash",
		"Max Lv.: 5",
		"^777777Learning Conditions: Two-handed Defense Lv. 10 and Hack and Slash Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF1 AP^000000",
		"Details: ^777777A Two-handed Sword/Axe skill.",
		"Repeatedly slash at a target, inflicting Melee Physical damage. Giant Growth creates a chance of doubling the damage.",
		"This skill additionally increases damage, depending on your Base Level and POW, and follows your CRIT to inflict Critical damage.",
		"If it crits, it inflicts half of the total of your Critical Damage Bonus options as damage.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777120% of ATK, Hits: 1^000000",
		"[Lv. 2]: ^777777240% of ATK, Hits: 2^000000",
		"[Lv. 3]: ^777777360% of ATK, Hits: 3^000000",
		"[Lv. 4]: ^777777480% of ATK, Hits: 4^000000",
		"[Lv. 5]: ^777777600% of ATK, Hits: 5^000000"
	].join("\n");

	SkillDescription[SKID.DK_DRAGONIC_AURA] = [
		"Dragonic Aura",
		"Max Lv.: 10",
		"^777777Learning Conditions: Charging Pierce Lv. 10, Dragon Breath Lv. 10, and Dragon Water Breath Lv. 10^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^7777771 Target^000000",
		"Cost: ^FF0000150 AP^000000",
		"Details: ^777777Inflict great Long-ranged Physical damage on a target, and increase Dragon Breath, Dragon Water Breath, and Hundred Spears damage for 300 seconds.",
		"This skill additionally increases damage, depending on your Base Level and POW.",
		"Also, inflicts more damage on Demi-Human and Angel monsters.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777950% of ATK (1,400% on Human/Angel)^000000",
		"[Lv. 2]: ^7777771,900% of ATK (2,800% on Human/Angel)^000000",
		"[Lv. 3]: ^7777772,850% of ATK (4,200% on Human/Angel)^000000",
		"[Lv. 4]: ^7777773,800% of ATK (5,600% on Human/Angel)^000000",
		"[Lv. 5]: ^7777774,750% of ATK (7,000% on Human/Angel)^000000",
		"[Lv. 6]: ^7777775,700% of ATK (8,400% on Human/Angel)^000000",
		"[Lv. 7]: ^7777776,650% of ATK (9,800% on Human/Angel)^000000",
		"[Lv. 8]: ^7777777,600% of ATK (11,200% on Human/Angel)^000000",
		"[Lv. 9]: ^7777778,550% of ATK (12,600% on Human/Angel)^000000",
		"[Lv. 10]: ^7777779,500% of ATK (14,000% on Human/Angel)^000000"
	].join("\n");

	SkillDescription[SKID.DK_VIGOR] = [
		"Vigor",
		"Max Lv.: 10",
		"^777777Learning Conditions: Servant Weapon - Demolition Lv. 3 and Storm Slash Lv. 5^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Support^000000",
		"Target: ^777777Self^000000",
		"Cost: ^FF0000150 AP^000000",
		"Details: ^777777Temporarily increase Normal Melee Physical damage.",
		"Each attack consumes HP and inflicts 50% more Physical damage on Human and Angel monsters.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 30 sec., HP -15^000000",
		"[Lv. 2]: ^777777Duration: 60 sec., HP -14^000000",
		"[Lv. 3]: ^777777Duration: 90 sec., HP -12^000000",
		"[Lv. 4]: ^777777Duration: 120 sec., HP -11^000000",
		"[Lv. 5]: ^777777Duration: 150 sec., HP -9^000000",
		"[Lv. 6]: ^777777Duration: 180 sec., HP -8^000000",
		"[Lv. 7]: ^777777Duration: 210 sec., HP -6^000000",
		"[Lv. 8]: ^777777Duration: 240 sec., HP -5^000000",
		"[Lv. 9]: ^777777Duration: 270 sec., HP -3^000000",
		"[Lv. 10]: ^777777Duration: 300 sec., HP -2^000000"
	].join("\n");

	SkillDescription[SKID.AG_DEADLY_PROJECTION] = [
		"Deadly Projection",
		"Max Lv.: 5",
		"^777777Learning Conditions: Mystery Illusion Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777Cause the target's body to rot.",
		"This skill temporarily neutralizes its magical immunity and inflicts Undead Magic damage.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777600% of MATK%, Neutralization: 4 sec.^000000",
		"[Lv. 2]: ^7777771,200% of MATK%, Neutralization: 5 sec.^000000",
		"[Lv. 3]: ^7777771,800% of MATK%, Neutralization: 6 sec.^000000",
		"[Lv. 4]: ^7777772,400% of MATK%, Neutralization: 7 sec.^000000",
		"[Lv. 5]: ^7777773,000% of MATK%, Neutralization: 8 sec.^000000"
	].join("\n");

	SkillDescription[SKID.AG_DESTRUCTIVE_HURRICANE] = [
		"Destructive Hurricane",
		"Max Lv.: 5",
		"^777777Learning Conditions: Tornado Storm Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^777777AoE^000000",
		"Details: ^777777Agitate the air around you, inflicting Wind Magic damage on targets within range.",
		"This skill additionally increases damage, depending on your Base Level and SPL.",
		"Climax mode changes its effect, depending on its stage.^000000",
		"^8041D9Climax (Stage 1)^000000",
		"^777777Additional Wind Magic damage at 500% of MATK^000000",
		"^CC723DClimax (Stage 2)^000000",
		"^777777Additional 2-cell knockback^000000",
		"^47C83EClimax (Stage 3)^000000",
		"^777777Destructive Hurricane damage +100%^000000",
		"^4641D9Climax (Stage 4)^000000",
		"^777777Disables Destructive Hurricane damage, and instead adds MATK +100 and Wind Magic damage +30% to you for 900 seconds.^000000",
		"^CC3D3DClimax (Stage 5)^000000",
		"^777777Changes range to 19 x19 cells and increases Destructive Hurricane damage +70%.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^7777771,600% of MATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 2]: ^7777773,200% of MATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 3]: ^7777774,800% of MATK, Effective Range: 9 x9 cells^000000",
		"[Lv. 4]: ^7777776,400% of MATK, Effective Range: 9 x9 cells^000000",
		"[Lv. 5]: ^7777778,000% of MATK, Effective Range: 11 x11 cells^000000"
	].join("\n");

	SkillDescription[SKID.AG_RAIN_OF_CRYSTAL] = [
		"Crystal Rain",
		"Max Lv.: 5",
		"^777777Learning Conditions: Frost Misty Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^777777AoE^000000",
		"Details: ^777777Shower surrounding enemies with icicles, inflicting Water Magic damage.",
		"This skill additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777150% of MATK, Effective Range: 11 x11 cells^000000",
		"[Lv. 2]: ^777777300% of MATK, Effective Range: 13 x13 cells^000000",
		"[Lv. 3]: ^777777450% of MATK, Effective Range: 15 x15 cells^000000",
		"[Lv. 4]: ^777777600% of MATK, Effective Range: 17 x17 cells^000000",
		"[Lv. 5]: ^777777750% of MATK, Effective Range: 19 x19 cells^000000"
	].join("\n");

	SkillDescription[SKID.AG_MYSTERY_ILLUSION] = [
		"Mystery Illusion",
		"Max Lv.: 5",
		"^777777Learning Conditions: Hell Inferno Lv. 3 and Soul Vulcan Strike Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Ground cell^000000",
		"Details: ^777777Cast mysterious magic on the selected ground spot.",
		"This magic inflicts Shadow Magic damage on targets within range for its duration.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777250% of MATK, Effective Range: 9 x9 cells^000000",
		"[Lv. 2]: ^777777500% of MATK, Effective Range: 9 x9 cells^000000",
		"[Lv. 3]: ^777777750% of MATK, Effective Range: 11 x11 cells^000000",
		"[Lv. 4]: ^7777771,000% of MATK, Effective Range: 11 x11 cells^000000",
		"[Lv. 5]: ^7777771,250% of MATK, Effective Range: 13 x13 cells^000000"
	].join("\n");

	SkillDescription[SKID.AG_VIOLENT_QUAKE] = [
		"Violent Quake",
		"Max Lv.: 5",
		"^777777Learning Conditions: Stratum Tremor Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Ground cell^000000",
		"Details: ^777777Temporarily shake the ground and shoot rocks out of it, randomly attacking targets within range.",
		"Rocks inflict Earth Magic damage on their target and others in 7 x7 cells around it.",
		"This skill additionally increases damage, depending on your Base Level and SPL.",
		"Climax mode changes its effect, depending on its stage.^000000",
		"^8041D9Climax (Stage 1)^000000",
		"^777777Decreases damage, but summons 2 rocks at a time.^000000",
		"^CC723DClimax (Stage 2)^000000",
		"^777777Rocks attack 9 x9 cells.^000000",
		"^47C83EClimax (Stage 3)^000000",
		"^777777Violent Quake damage +100%^000000",
		"^4641D9Climax (Stage 4)^000000",
		"^777777Instead of summoning rocks, adds Earth Resistance -100% to targets within range for 30 seconds.^000000",
		"^CC3D3DClimax (Stage 5)^000000",
		"^777777Effective range set to 7 x7 cells^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777120% of MATK, Rocks: 4, Effective Range: 7 x7 cells^000000",
		"[Lv. 2]: ^777777240% of MATK, Rocks: 8, Effective Range: 7 x7 cells^000000",
		"[Lv. 3]: ^777777360% of MATK, Rocks: 12, Effective Range: 9 x9 cells^000000",
		"[Lv. 4]: ^777777480% of MATK, Rocks: 16, Effective Range: 9 x9 cells^000000",
		"[Lv. 5]: ^777777600% of MATK, Rocks: 20, Effective Range: 9 x9 cells^000000"
	].join("\n");

	SkillDescription[SKID.AG_SOUL_VC_STRIKE] = [
		"Soul Vulcan Strike",
		"Max Lv.: 5",
		"^777777Learning Conditions: Soul Expansion Lv. 5 and Two-handed Staff Mastery Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777Repeatedly cast a powerful Soul Strike at a target and others around it.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777180% of MATK, Souls: 3, Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^777777360% of MATK, Souls: 4, Effective Range: 5 x5 cells^000000",
		"[Lv. 3]: ^777777540% of MATK, Souls: 5, Effective Range: 7 x7 cells^000000",
		"[Lv. 4]: ^777777720% of MATK, Souls: 6, Effective Range: 9 x9 cells^000000",
		"[Lv. 5]: ^777777900% of MATK, Souls: 7, Effective Range: 11 x11 cells^000000"
	].join("\n");

	SkillDescription[SKID.AG_STRANTUM_TREMOR] = [
		"Stratum Tremor",
		"Max Lv.: 5",
		"^777777Learning Conditions: Sienna Execrate Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Ground cell^000000",
		"Details: ^777777Shake the ground, inflicting Earth Magic damage on targets within range.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777250% of MATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 2]: ^777777500% of MATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 3]: ^777777750% of MATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 4]: ^7777771,000% of MATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 5]: ^7777771,250% of MATK, Effective Range: 9 x9 cells^000000"
	].join("\n");

	SkillDescription[SKID.AG_ALL_BLOOM] = [
		"All Bloom",
		"Max Lv.: 5",
		"^777777Learning Conditions: Floral Flare Road Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Ground cell^000000",
		"Details: ^777777Create a flower garden on the ground. Blazing flower buds randomly appear and explode,",
		"inflicting Fire Magic damage on targets in 7 x7 cells around them.",
		"This skill additionally increases damage, depending on your Base Level and SPL.",
		"Climax mode changes its effect, depending on its stage.^000000",
		"^8041D9Climax (Stage 1)^000000",
		"^777777Flower buds appear twice more quickly.^000000",
		"^CC723DClimax (Stage 2)^000000",
		"^777777Decreases damage, but summons 2 flower buds at a time.^000000",
		"^47C83EClimax (Stage 3)^000000",
		"^777777All Bloom damage +100%^000000",
		"^4641D9Climax (Stage 4)^000000",
		"^777777Instead of summoning flower buds, adds Fire Resistance -100% to targets within range for 30 seconds.^000000",
		"^CC3D3DClimax (Stage 5)^000000",
		"^777777Additional Fire Magic damage at 7,000% of MATK after all the flower buds explode.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777100% of MATK, Flowers: 4, Effective Range: 7 x7 cells^000000",
		"[Lv. 2]: ^777777200% of MATK, Flowers: 8, Effective Range: 7 x7 cells^000000",
		"[Lv. 3]: ^777777300% of MATK, Flowers: 12, Effective Range: 9 x9 cells^000000",
		"[Lv. 4]: ^777777400% of MATK, Flowers: 16, Effective Range: 9 x9 cells^000000",
		"[Lv. 5]: ^777777500% of MATK, Flowers: 20, Effective Range: 9 x9 cells^000000"
	].join("\n");

	SkillDescription[SKID.AG_CRYSTAL_IMPACT] = [
		"Crystal Impact",
		"Max Lv.: 5",
		"^777777Learning Conditions: Crystal Rain Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^777777AoE^000000",
		"Details: ^777777Send forth a powerful water wave from where you stand, inflicting Water Magic damage on targets within range.",
		"The targets receive additional Water Magic damage after a while.",
		"This skill additionally increases damage, depending on your Base Level and SPL.",
		"Climax mode changes its effect, depending on its stage.^000000",
		"^8041D9Climax (Stage 1)^000000",
		"^777777Water Resistance +30%, DEF +300, MDEF +100, and Water Magic damage +30% for surrounding allies for 900 seconds.^000000",
		"^CC723DClimax (Stage 2)^000000",
		"^777777The ice wave attacks twice.^000000",
		"^47C83EClimax (Stage 3)^000000",
		"^777777Ice wave damage +50%^000000",
		"^4641D9Climax (Stage 4)^000000",
		"^777777Deceases the ice wave damage, but increases its additional damage +150%.^000000",
		"^CC3D3DClimax (Stage 5)^000000",
		"^777777The ice wave attacks the entire screen, and its additional damage also covers additional 5 x5 cells.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777800% of MATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 2]: ^7777771,600% of MATK, Effective Range: 9 x9 cells^000000",
		"[Lv. 3]: ^7777772,400% of MATK, Effective Range: 11 x11 cells^000000",
		"[Lv. 4]: ^7777773,200% of MATK, Effective Range: 13 x13 cells^000000",
		"[Lv. 5]: ^7777774,000% of MATK, Effective Range: 15 x15 cells^000000"
	].join("\n");

	SkillDescription[SKID.AG_TORNADO_STORM] = [
		"Tornado Storm",
		"Max Lv.: 5",
		"^777777Learning Conditions: Chain Lightning Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Ground cell^000000",
		"Details: ^777777Summon a lightning-charged tornado on the selected spot, inflicting Wind Magic damage on targets within range.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^77777790% of MATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 2]: ^777777180% of MATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 3]: ^777777270% of MATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 4]: ^777777360% of MATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 5]: ^777777450% of MATK, Effective Range: 9 x9 cells^000000"
	].join("\n");

	SkillDescription[SKID.AG_TWOHANDSTAFF] = [
		"Two-handed Staff Mastery",
		"Max Lv.: 10",
		"Class: ^993300Passive^000000",
		"Details: ^777777Two-handed Staves increase your MATK.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777S.MATK +2^000000",
		"[Lv. 2]: ^777777S.MATK +4^000000",
		"[Lv. 3]: ^777777S.MATK +6^000000",
		"[Lv. 4]: ^777777S.MATK +8^000000",
		"[Lv. 5]: ^777777S.MATK +10^000000",
		"[Lv. 6]: ^777777S.MATK +12^000000",
		"[Lv. 7]: ^777777S.MATK +14^000000",
		"[Lv. 8]: ^777777S.MATK +16^000000",
		"[Lv. 9]: ^777777S.MATK +18^000000",
		"[Lv. 10]: ^777777S.MATK +20 ^000000"
	].join("\n");

	SkillDescription[SKID.AG_FLORAL_FLARE_ROAD] = [
		"Floral Flare Road",
		"Max Lv.: 5",
		"^777777Learning Conditions: Crimson Rock Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Ground cell^000000",
		"Details: ^777777Temporarily summon blazing flower petals from the ground in your facing direction, inflicting Fire Magic damage within range.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777200% of MATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^777777400% of MATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 3]: ^777777600% of MATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 4]: ^777777800% of MATK, Effective Range: 9 x9 cells^000000",
		"[Lv. 5]: ^7777771,000% of MATK, Effective Range: 11 x11 cells^000000"
	].join("\n");

	SkillDescription[SKID.AG_ASTRAL_STRIKE] = [
		"Astral Strike",
		"Max Lv.: 10",
		"^777777Learning Conditions: Comet Lv. 5, Mystery Illusion Lv. 3, and Deadly Projection Lv. 3^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Ground cell^000000",
		"Cost: ^FF0000150 AP^000000",
		"Details: ^777777Drop a massive meteor onto the ground, inflicting Neutral Magic damage on targets within range. The impact from this meteor also causes additional Neutral Magic damage at regular intervals.",
		"The meteor inflicts more damage on Undead and Dragon monsters.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777500% of MATK (1,100% on Undead/Dragon), Effective Range: 5 x5 cells^000000",
		"[Lv. 2]: ^7777771,000% of MATK (2,200% on Undead/Dragon), Effective Range: 5 x5 cells^000000",
		"[Lv. 3]: ^7777771,500% of MATK (3,300% on Undead/Dragon), Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777772,000% of MATK (4,400% on Undead/Dragon), Effective Range: 7 x7 cells^000000",
		"[Lv. 5]: ^7777772,500% of MATK (5,500% on Undead/Dragon), Effective Range: 7 x7 cells^000000",
		"[Lv. 6]: ^7777773,000% of MATK (6,600% on Undead/Dragon), Effective Range: 7 x7 cells^000000",
		"[Lv. 7]: ^7777773,500% of MATK (7,700% on Undead/Dragon), Effective Range: 9 x9 cells^000000",
		"[Lv. 8]: ^7777774,000% of MATK (8,800% on Undead/Dragon), Effective Range: 9 x9 cells^000000",
		"[Lv. 9]: ^7777774,500% of MATK (9,900% on Undead/Dragon), Effective Range: 9 x9 cells^000000",
		"[Lv. 10]: ^7777775,000% of MATK (11,000% on Undead/Dragon), Effective Range: 11 x11 cells^000000"
	].join("\n");

	SkillDescription[SKID.AG_CLIMAX] = [
		"Climax",
		"Max Lv.: 5",
		"^777777Learning Conditions: Tetra Vortex Lv. 5 and Two-handed Staff Mastery Lv. 3^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Magic^000000",
		"Target: ^777777Self^000000",
		"Cost: ^FF0000200 AP^000000",
		"Details: ^777777Create special effects with certain magic you use for 300 seconds.",
		"Different effects are added, depending on the skill level.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Add Climax Stage 1.^000000",
		"[Lv. 2]: ^777777Add Climax Stage 2.^000000",
		"[Lv. 3]: ^777777Add Climax Stage 3.^000000",
		"[Lv. 4]: ^777777Add Climax Stage 4.^000000",
		"[Lv. 5]: ^777777Add Climax Stage 5.^000000"
	].join("\n");

	SkillDescription[SKID.AG_ROCK_DOWN] = [
		"Rock Down",
		"Max Lv.: 5",
		"^777777Learning Conditions: Stratum Tremor Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF4 AP^000000",
		"Details: ^777777Drop a big rock, inflicting Earth Magic damage on a target and others in 3 x3 cells around it.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777750% of MATK^000000",
		"[Lv. 2]: ^7777771,500% of MATK^000000",
		"[Lv. 3]: ^7777772,250% of MATK^000000",
		"[Lv. 4]: ^7777773,000% of MATK^000000",
		"[Lv. 5]: ^7777773,750% of MATK^000000"
	].join("\n");

	SkillDescription[SKID.AG_STORM_CANNON] = [
		"Storm Cannon",
		"Max Lv.: 5",
		"^777777Learning Conditions: Tornado Storm Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF4 AP^000000",
		"Details: ^777777Shoot a twister at a target. This twister travels in a straight line, inflicting Wind Magic damage on all enemies in its path.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777600% of MATK^000000",
		"[Lv. 2]: ^7777771,200% of MATK^000000",
		"[Lv. 3]: ^7777771,800% of MATK^000000",
		"[Lv. 4]: ^7777772,400% of MATK^000000",
		"[Lv. 5]: ^7777773,000% of MATK^000000"
	].join("\n");

	SkillDescription[SKID.AG_CRIMSON_ARROW] = [
		"Crimson Arrow",
		"Max Lv.: 5",
		"^777777Learning Conditions: Floral Flare Road Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF4 AP^000000",
		"Details: ^777777Shoot a flaming arrow at a target. This arrow travels in a straight line, inflicting Fire Magic damage on all enemies in its path.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777300% of MATK^000000",
		"[Lv. 2]: ^777777600% of MATK^000000",
		"[Lv. 3]: ^777777900% of MATK^000000",
		"[Lv. 4]: ^7777771,200% of MATK^000000",
		"[Lv. 5]: ^7777771,500% of MATK^000000"
	].join("\n");

	SkillDescription[SKID.AG_FROZEN_SLASH] = [
		"Frozen Slash",
		"Max Lv.: 5",
		"^777777Learning Conditions: Crystal Rain Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^777777Target In Range^000000",
		"Recovery: ^0054FF4 AP^000000",
		"Details: ^777777Sharp ice inflicts Water Magic damage on targets around you.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777750% of MATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 2]: ^7777771,500% of MATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 3]: ^7777772,250% of MATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 4]: ^7777773,000% of MATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 5]: ^7777773,750% of MATK, Effective Range: 9 x9 cells^000000"
	].join("\n");

	SkillDescription[SKID.IQ_POWERFUL_FAITH] = [
		"Powerful Faith",
		"Max Lv.: 5",
		"^777777Learning Conditions: Will of Faith Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Support^000000",
		"Target: ^777777Self^000000",
		"Details: ^777777Strengthen your faith, increasing your ATK and P. ATK.",
		"Can't be used with Firm Faith or Sincere Faith.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777ATK +10, P.ATK +7, Duration: 120 sec.^000000",
		"[Lv. 2]: ^777777ATK +15, P.ATK +9, Duration: 150 sec.^000000",
		"[Lv. 3]: ^777777ATK +20, P.ATK +11, Duration: 180 sec.^000000",
		"[Lv. 4]: ^777777ATK +25, P.ATK +13, Duration: 210 sec.^000000",
		"[Lv. 5]: ^777777ATK +30, P.ATK +15, Duration: 240 sec.^000000"
	].join("\n");

	SkillDescription[SKID.IQ_FIRM_FAITH] = [
		"Firm Faith",
		"Max Lv.: 5",
		"^777777Learning Conditions: Will of Faith Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Support^000000",
		"Target: ^777777Self^000000",
		"Details: ^777777Strengthen your faith, increasing your Max HP and RES.",
		"Can't be used with Powerful Faith or Sincere Faith.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777MHP +2%, RES +8, Duration: 120 sec.^000000",
		"[Lv. 2]: ^777777MHP +4%, RES +16, Duration: 150 sec.^000000",
		"[Lv. 3]: ^777777MHP +6%, RES +24, Duration: 180 sec.^000000",
		"[Lv. 4]: ^777777MHP +8%, RES +32, Duration: 210 sec.^000000",
		"[Lv. 5]: ^777777MHP +10%, RES +40, Duration: 240 sec.^000000"
	].join("\n");

	SkillDescription[SKID.IQ_WILL_OF_FAITH] = [
		"Will of Faith",
		"Max Lv.: 10",
		"Class: ^993300Passive^000000",
		"Details: ^777777Fortify your determination to eradicate evil.",
		"Knuckles inflict more Physical damage on Demon and Undead monsters and decrease Physical/Magic damage from them.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Physical Damage +3% on Demon/Undead, Physical/Magic Damage -1% from Demon/Undead^000000",
		"[Lv. 2]: ^777777Physical Damage +4% on Demon/Undead, Physical/Magic Damage -2% from Demon/Undead^000000",
		"[Lv. 3]: ^777777Physical Damage +5% on Demon/Undead, Physical/Magic Damage -3% from Demon/Undead^000000",
		"[Lv. 4]: ^777777Physical Damage +6% on Demon/Undead, Physical/Magic Damage -4% from Demon/Undead^000000",
		"[Lv. 5]: ^777777Physical Damage +7% on Demon/Undead, Physical/Magic Damage -5% from Demon/Undead^000000",
		"[Lv. 6]: ^777777Physical Damage +8% on Demon/Undead, Physical/Magic Damage -6% from Demon/Undead^000000",
		"[Lv. 7]: ^777777Physical Damage +9% on Demon/Undead, Physical/Magic Damage -7% from Demon/Undead^000000",
		"[Lv. 8]: ^777777Physical Damage +10% on Demon/Undead, Physical/Magic Damage -8% from Demon/Undead^000000",
		"[Lv. 9]: ^777777Physical Damage +11% on Demon/Undead, Physical/Magic Damage -9% from Demon/Undead^000000",
		"[Lv. 10]: ^777777Physical Damage +12% on Demon/Undead, Physical/Magic Damage -10% from Demon/Undead^000000"
	].join("\n");

	SkillDescription[SKID.IQ_OLEUM_SANCTUM] = [
		"Oleum Sanctum",
		"Max Lv.: 5",
		"^777777Learning Conditions: Aqua Benedicta Lv. 1 and Will of Faith Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777Consumes 1 Holy Water. Spray consecrating oil over surrounding targets, inflicting Long-ranged Physical damage",
		"and increasing their incoming Long-ranged Physical damage for a while.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777400% of ATK, Effective Range: 3 x3 cells, Duration: 3 sec.^000000",
		"[Lv. 2]: ^777777800% of ATK, Effective Range: 3 x3 cells, Duration: 4 sec.^000000",
		"[Lv. 3]: ^7777771,200% of ATK, Effective Range: 5 x5 cells, Duration: 5 sec.^000000",
		"[Lv. 4]: ^7777771,600% of ATK, Effective Range: 5 x5 cells, Duration: 6 sec.^000000",
		"[Lv. 5]: ^7777772,000% of ATK, Effective Range: 7 x7 cells, Duration: 7 sec.^000000"
	].join("\n");

	SkillDescription[SKID.IQ_SINCERE_FAITH] = [
		"Sincere Faith",
		"Max Lv.: 5",
		"^777777Learning Conditions: Will of Faith Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Support^000000",
		"Target: ^777777Self^000000",
		"Details: ^777777Strengthen your faith, increasing your ASPD and adding durability to your attacks.",
		"Can't be used with Powerful Faith or Firm Faith.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777ASPD +1, Guided Attack Chance: 4%, Duration: 120 sec.^000000",
		"[Lv. 2]: ^777777ASPD +1, Guided Attack Chance: 8%, Duration: 150 sec.^000000",
		"[Lv. 3]: ^777777ASPD +2, Guided Attack Chance: 12%, Duration: 180 sec.^000000",
		"[Lv. 4]: ^777777ASPD +2, Guided Attack Chance: 16%, Duration: 210 sec.^000000",
		"[Lv. 5]: ^777777ASPD +3, Guided Attack Chance: 20%, Duration: 240 sec.^000000"
	].join("\n");

	SkillDescription[SKID.IQ_FIRST_BRAND] = [
		"First Brand",
		"Max Lv.: 5",
		"^777777Learning Conditions: Will of Faith Lv. 2^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777Brand a target and others around it with Melee Physical damage.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777450% of ATK, Branding Duration: 1 sec., Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^777777900% of ATK, Branding Duration: 2 sec., Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^7777771,350% of ATK, Branding Duration: 3 sec., Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777771,800% of ATK, Branding Duration: 4 sec., Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^7777772,250% of ATK, Branding Duration: 5 sec., Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.IQ_FIRST_FAITH_POWER] = [
		"First Faith Power",
		"Max Lv.: 5",
		"^777777Learning Conditions: Will of Faith Lv. 3 and First Brand Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Support^000000",
		"Target: ^777777Self^000000",
		"Details: ^777777Reflect your sincere faith in combat.",
		"During First Faith Power mode, you can also use Fallen Empire without spirit spheres.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 60 sec.^000000",
		"[Lv. 2]: ^777777Duration: 120 sec.^000000",
		"[Lv. 3]: ^777777Duration: 180 sec.^000000",
		"[Lv. 4]: ^777777Duration: 240 sec.^000000",
		"[Lv. 5]: ^777777Duration: 300 sec.^000000"
	].join("\n");

	SkillDescription[SKID.IQ_THIRD_PUNISH] = [
		"Third Punishment",
		"Max Lv.: 5",
		"^777777Learning Conditions: Second Faith Lv. 2^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777Can be used during First Faith Power, Judgment, and Third Exorcism Flame.",
		"Inflict Melee Physical damage on an enemy and surrounding Judgment Brand targets, and remove their Judgment Brands.",
		"This skill additionally increases damage, depending on your Base Level and POW.",
		"Also, activates the Zen effect.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777550% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^7777771,100% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^7777771,650% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777772,200% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^7777772,750% of ATK, Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.IQ_THIRD_FLAME_BOMB] = [
		"Third Flame Bomb",
		"Max Lv.: 5",
		"^777777Learning Conditions: Second Flame Lv. 2^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777Can be used during Third Exorcism Flame.",
		"Inflict Melee Physical damage on an enemy and surrounding Judgment Brand targets, and remove their Judgment Brands.",
		"This skill increases damage based on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777650% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^7777771,300% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^7777771,950% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777772,600% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^7777773,250% of ATK, Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.IQ_THIRD_CONSECRATION] = [
		"Third Consecration",
		"Max Lv.: 5",
		"^777777Learning Conditions: Second Judgment Lv. 2^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777Can be used during Judgment and Third Exorcism Flame.",
		"Inflict Melee Physical damage on an enemy and surrounding Judgment Brand targets, and remove their Judgment Brands.",
		"This skill additionally increases damage, depending on your Base Level and POW.",
		"The power of consecration also restores your HP and SP, and their healing amounts increase based on the skill level and your Base Level.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777650% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^7777771,300% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^7777771,950% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777772,600% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^7777773,250% of ATK, Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.IQ_MASSIVE_F_BLASTER] = [
		"Massive Flame Blaster",
		"Max Lv.: 10",
		"^777777Learning Conditions: Oleum Sanctum Lv. 3, Explosion Blaster Lv. 3, and Will of Faith Lv. 5^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^777777AoE^000000",
		"Cost: ^FF0000150 AP^000000",
		"Details: ^777777Instantly discharge the powerful energy concentrated inside you, inflicting great Long-ranged Physical damage on surrounding targets.",
		"This skill inflicts more damage on Demon and Animal enemies.",
		"This skill additionally increases damage, depending on your Base Level and POW.",
		"The energy explosion also activates Rampaging Energy inside you, enabling you to use Lightning Ride and Rampage Blast without spirit spheres for 300 seconds.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777800% of ATK (1,100% on Demon/Animal)^000000",
		"[Lv. 2]: ^7777771,600% of ATK (2,200% on Demon/Animal)^000000",
		"[Lv. 3]: ^7777772,400% of ATK (3,300% on Demon/Animal)^000000",
		"[Lv. 4]: ^7777773,200% of ATK (4,400% on Demon/Animal)^000000",
		"[Lv. 5]: ^7777774,000% of ATK (5,500% on Demon/Animal)^000000",
		"[Lv. 6]: ^7777774,800% of ATK (6,600% on Demon/Animal)^000000",
		"[Lv. 7]: ^7777775,600% of ATK (7,700% on Demon/Animal)^000000",
		"[Lv. 8]: ^7777776,400% of ATK (8,800% on Demon/Animal)^000000",
		"[Lv. 9]: ^7777777,200% of ATK (9,900% on Demon/Animal)^000000",
		"[Lv. 10]: ^7777778,000% of ATK (11,000% on Demon/Animal)^000000"
	].join("\n");

	SkillDescription[SKID.IQ_JUDGE] = [
		"Judgment",
		"Max Lv.: 5",
		"^777777Learning Conditions: First Faith Power Lv. 1^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Support^000000",
		"Target: ^777777AoE^000000",
		"Cost: ^FF0000100 AP^000000",
		"Details: ^777777Can be used during First Faith Power mode.",
		"Punish the wicked as a divine agent.",
		"During Judgment mode, you can also use Fallen Empire and Flash Combo without spirit spheres.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 60 sec.^000000",
		"[Lv. 2]: ^777777Duration: 120 sec.^000000",
		"[Lv. 3]: ^777777Duration: 180 sec.^000000",
		"[Lv. 4]: ^777777Duration: 240 sec.^000000",
		"[Lv. 5]: ^777777Duration: 300 sec.^000000"
	].join("\n");

	SkillDescription[SKID.IQ_THIRD_EXOR_FLAME] = [
		"Third Exorcism Flame",
		"Max Lv.: 5",
		"^777777Learning Conditions: Judgment Lv. 1^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Support^000000",
		"Target: ^777777AoE^000000",
		"Cost: ^FF0000150 AP^000000",
		"Details: ^777777Can be used during Judgment mode.",
		"Enter the Exorcism Flame mode to eliminate all evil creatures.",
		"During Exorcism Flame mode, you can also use Fallen Empire, Flash Combo, and Tiger Cannon without spirit spheres.^000000",
		"",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 30 sec.^000000",
		"[Lv. 2]: ^777777Duration: 60 sec.^000000",
		"[Lv. 3]: ^777777Duration: 90 sec.^000000",
		"[Lv. 4]: ^777777Duration: 120 sec.^000000",
		"[Lv. 5]: ^777777Duration: 10 sec.^000000"
	].join("\n");

	SkillDescription[SKID.IQ_SECOND_FLAME] = [
		"Second Flame",
		"Max Lv.: 5",
		"^777777Learning Conditions: Third Exorcism Flame Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF3 AP^000000",
		"Details: ^777777Can be used during Third Exorcism Flame.",
		"Inflict Melee Physical damage on an enemy and surrounding Brand/Judgment Brand targets,",
		"change Brands to Judgment Brands, and renew the existing Judgment Brands.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777550% of ATK, Branding Duration: 5 sec., Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^7777771,100% of ATK, Branding Duration: 5 sec., Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^7777771,650% of ATK, Branding Duration: 5 sec., Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777772,200% of ATK, Branding Duration: 5 sec., Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^7777772,750% of ATK, Branding Duration: 5 sec., Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.IQ_SECOND_FAITH] = [
		"Second Faith",
		"Max Lv.: 5",
		"^777777Learning Conditions: First Faith Power Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF1 AP^000000",
		"Details: ^777777Can be used during First Faith Power, Judgment, and Third Exorcism Flame.",
		"Inflict Melee Physical damage on an enemy and surrounding Brand/Judgment Brand targets,",
		"change Brands to Judgment Brands, and renew the existing Judgment Brands.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777500% of ATK, Branding Duration: 5 sec., Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^7777771,000% of ATK, Branding Duration: 5 sec., Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^7777771,500% of ATK, Branding Duration: 5 sec., Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777772,000% of ATK, Branding Duration: 5 sec., Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^7777772,500% of ATK, Branding Duration: 5 sec., Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.IQ_SECOND_JUDGEMENT] = [
		"Second Judgment",
		"Max Lv.: 5",
		"^777777Learning Conditions: Judgment Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF2 AP^000000",
		"Details: ^777777Can be used during Judgment and Third Exorcism Flame.",
		"Inflict Melee Physical damage on an enemy and surrounding Brand/Judgment Brand targets,",
		"change Brands to Judgment Brands, and renew the existing Judgment Brands.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777500% of ATK, Branding Duration: 5 sec., Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^7777771,000% of ATK, Branding Duration: 5 sec., Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^7777771,500% of ATK, Branding Duration: 5 sec., Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777772,000% of ATK, Branding Duration: 5 sec., Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^7777772,500% of ATK, Branding Duration: 5 sec., Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.IQ_EXPOSION_BLASTER] = [
		"Explosion Blaster",
		"Max Lv.: 5",
		"^777777Learning Conditions: Oleum Sanctum Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF5 AP^000000",
		"Details: ^777777Shoot a powerful energy bomb at a target, inflicting Long-ranged Physical damage.",
		"This skill inflicts more damage on Oleum Sanctum targets.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777450% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 2]: ^777777900% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 3]: ^7777771,350% of ATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 4]: ^7777771,800% of ATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 5]: ^7777772,250% of ATK, Effective Range: 9 x9 cells^000000"
	].join("\n");

	SkillDescription[SKID.IG_GUARD_STANCE] = [
		"Guard Stance",
		"Max Lv.: 5",
		"^777777Learning Conditions: Shield Mastery Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Toggle^000000",
		"Target: ^777777Self^000000",
		"Details: ^777777A Shield skill.",
		"Increase your equipment's DEF at the cost of its ATK.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777DEF +100, ATK -50^000000",
		"[Lv. 2]: ^777777DEF +150, ATK -100^000000",
		"[Lv. 3]: ^777777DEF +200, ATK -150^000000",
		"[Lv. 4]: ^777777DEF +250, ATK -200^000000",
		"[Lv. 5]: ^777777DEF +300, ATK -250^000000"
	].join("\n");

	SkillDescription[SKID.IG_GUARDIAN_SHIELD] = [
		"Guardian Shield",
		"Max Lv.: 5",
		"^777777Learning Conditions: Guard Stance Lv. 2^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777You and Party Members^000000",
		"Details: ^777777Requires Guard Stance.",
		"Cast a Physical barrier based on your HP for 60 seconds for you and your party members in 21 x21 cells around you.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^77777750% of HP^000000",
		"[Lv. 2]: ^777777100% of HP^000000",
		"[Lv. 3]: ^777777150% of HP^000000",
		"[Lv. 4]: ^777777200% of HP^000000",
		"[Lv. 5]: ^777777250% of HP^000000"
	].join("\n");

	SkillDescription[SKID.IG_REBOUND_SHIELD] = [
		"Rebound Shield",
		"Max Lv.: 5",
		"^777777Learning Conditions: Guard Stance Lv. 4^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777Self^000000",
		"Details: ^777777Can only be used while using Sacrifice in Guard Stance mode.",
		"Decrease Sacrifice-directed damage on you for 60 seconds.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Damage -10%^000000",
		"[Lv. 2]: ^777777Damage -20%^000000",
		"[Lv. 3]: ^777777Damage -30%^000000",
		"[Lv. 4]: ^777777Damage -40%^000000",
		"[Lv. 5]: ^777777Damage -50%^000000"
	].join("\n");

	SkillDescription[SKID.IG_SHIELD_MASTERY] = [
		"Shield Mastery",
		"Max Lv.: 10",
		"Class: ^993300Passive^000000",
		"Details: ^777777Shields increase Physical Resistance and Imperial Guard skill damage.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Physical Resistance +3^000000",
		"[Lv. 2]: ^777777Physical Resistance +6^000000",
		"[Lv. 3]: ^777777Physical Resistance +9^000000",
		"[Lv. 4]: ^777777Physical Resistance +12^000000",
		"[Lv. 5]: ^777777Physical Resistance +15^000000",
		"[Lv. 6]: ^777777Physical Resistance +18^000000",
		"[Lv. 7]: ^777777Physical Resistance +21^000000",
		"[Lv. 8]: ^777777Physical Resistance +24^000000",
		"[Lv. 9]: ^777777Physical Resistance +27^000000",
		"[Lv. 10]: ^777777Physical Resistance +30^000000"
	].join("\n");

	SkillDescription[SKID.IG_SPEAR_SWORD_M] = [
		"Spear Sword Mastery",
		"Max Lv.: 10",
		"Class: ^993300Passive^000000",
		"Details: ^777777One-handed Swords, One-handed Spears, and Two-handed Spears increase HIT and Imperial Guard skill damage.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777HIT +3^000000",
		"[Lv. 2]: ^777777HIT +6^000000",
		"[Lv. 3]: ^777777HIT +9^000000",
		"[Lv. 4]: ^777777HIT +12^000000",
		"[Lv. 5]: ^777777HIT +15^000000",
		"[Lv. 6]: ^777777HIT +18^000000",
		"[Lv. 7]: ^777777HIT +21^000000",
		"[Lv. 8]: ^777777HIT +24^000000",
		"[Lv. 9]: ^777777HIT +27^000000",
		"[Lv. 10]: ^777777HIT +30^000000"
	].join("\n");

	SkillDescription[SKID.IG_ATTACK_STANCE] = [
		"Attack Stance",
		"Max Lv.: 5",
		"^777777Learning Conditions: Spear Sword Mastery Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Toggle^000000",
		"Target: ^777777Self^000000",
		"Details: ^777777Increase your equipment's ATK at the cost of its DEF.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777DEF -40, ATK +10^000000",
		"[Lv. 2]: ^777777DEF -80, ATK +15^000000",
		"[Lv. 3]: ^777777DEF -120, ATK +20^000000",
		"[Lv. 4]: ^777777DEF -160, ATK +25^000000",
		"[Lv. 5]: ^777777DEF -200, ATK +30^000000"
	].join("\n");

	SkillDescription[SKID.IG_ULTIMATE_SACRIFICE] = [
		"Ultimate Sacrifice",
		"Max Lv.: 5",
		"^777777Learning Conditions: Rebound Shield Lv. 3 and Guardian Shield Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Support^000000",
		"Target: ^777777You and Party Members^000000",
		"Details: ^777777Requires Guard Stance.",
		"Use all your remaining HP except 1 to give Resurrection Crystals to surrounding party members.",
		"The Resurrection Crystal immediately resurrects its target on their current spot with full HP and SP.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Skill Cooldown: 20 sec., Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^777777Skill Cooldown: 40 sec., Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^777777Skill Cooldown: 60 sec., Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^777777Skill Cooldown: 80 sec., Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^777777Skill Cooldown: 100 sec., Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.IG_HOLY_SHIELD] = [
		"Holy Shield",
		"Max Lv.: 5",
		"^777777Learning Conditions: Shield Mastery Lv. 5 and Cross Rain Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777Self^000000",
		"Details: ^777777A Shield skill.",
		"Improve your Shadow and Undead Resistances and cast a Holy Magic Damage buff on you.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Shadow/Undead Resistance +7%, Holy Magic Damage +7%^000000",
		"[Lv. 2]: ^777777Shadow/Undead Resistance +9%, Holy Magic Damage +9%^000000",
		"[Lv. 3]: ^777777Shadow/Undead Resistance +11%, Holy Magic Damage +11%^000000",
		"[Lv. 4]: ^777777Shadow/Undead Resistance +13%, Holy Magic Damage +13%^000000",
		"[Lv. 5]: ^777777Shadow/Undead Resistance +15%, Holy Magic Damage +15%^000000"
	].join("\n");

	SkillDescription[SKID.IG_GRAND_JUDGEMENT] = [
		"Grand Judgment",
		"Max Lv.: 10",
		"^777777Learning Conditions: Overslash Lv. 5 and Spear Sword Mastery Lv. 5^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^777777AoE^000000",
		"Cost: ^FF0000150 AP^000000",
		"Details: ^777777A Spear skill. Requires Attack Stance.",
		"Inflict Long Physical damage on a target and others in 7x7 cells around it.",
		"This skill also increases Vanishing Point and Cannon Spear damage for 300 seconds.",
		"Inflicts more damage on Plant and Insect enemies.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777750% of ATK (1,100% on Plant/Insect)^000000",
		"[Lv. 2]: ^7777771,500% of ATK (2,200% on Plant/Insect)^000000",
		"[Lv. 3]: ^7777772,250% of ATK (3,300% on Plant/Insect)^000000",
		"[Lv. 4]: ^7777773,000% of ATK (4,400% on Plant/Insect)^000000",
		"[Lv. 5]: ^7777773,750% of ATK (5,500% on Plant/Insect)^000000",
		"[Lv. 6]: ^7777774,500% of ATK (6,600% on Plant/Insect)^000000",
		"[Lv. 7]: ^7777775,250% of ATK (7,700% on Plant/Insect)^000000",
		"[Lv. 8]: ^7777776,000% of ATK (8,800% on Plant/Insect)^000000",
		"[Lv. 9]: ^7777776,750% of ATK (9,900% on Plant/Insect)^000000",
		"[Lv. 10]: ^7777777,500% of ATK (11,000% on Plant/Insect)^000000"
	].join("\n");

	SkillDescription[SKID.IG_JUDGEMENT_CROSS] = [
		"Judgement Cross",
		"Max Lv.: 10",
		"^777777Learning Conditions: Cross Rain Lv. 5 and Holy Shield Lv. 3^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Magic^000000",
		"Target: ^777777AoE^000000",
		"Cost: ^FF0000150 AP^000000",
		"Details: ^777777Inflict Holy Magic damage on a target.",
		"Inflicts more damage on Plant and Insect enemies.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777750% of MATK (1,100% on Plant/Insect)^000000",
		"[Lv. 2]: ^7777771,500% of MATK (2,200% on Plant/Insect)^000000",
		"[Lv. 3]: ^7777772,250% of MATK (3,300% on Plant/Insect)^000000",
		"[Lv. 4]: ^7777773,000% of MATK (4,400% on Plant/Insect)^000000",
		"[Lv. 5]: ^7777773,750% of MATK (5,500% on Plant/Insect)^000000",
		"[Lv. 6]: ^7777774,500% of MATK (6,600% on Plant/Insect)^000000",
		"[Lv. 7]: ^7777775,250% of MATK (7,700% on Plant/Insect)^000000",
		"[Lv. 8]: ^7777776,000% of MATK (8,800% on Plant/Insect)^000000",
		"[Lv. 9]: ^7777776,750% of MATK (9,900% on Plant/Insect)^000000",
		"[Lv. 10]: ^7777777,500% of MATK (11,000% on Plant/Insect)^000000"
	].join("\n");

	SkillDescription[SKID.IG_SHIELD_SHOOTING] = [
		"Shield Shooting",
		"Max Lv.: 5",
		"^777777Learning Conditions: Shield Mastery Lv. 5 and Attack Stance Lv. 2^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF2 AP^000000",
		"Details: ^777777A Shield skill. Requires Attack Stance.",
		"Throw a shield at the target, inflicting Long-ranged Physical damage.",
		"This skill also increases Rapid Smiting, Shield Press, and Earth Drive damage for 10 seconds.",
		"This skill additionally increases damage, depending on your Base Level and POW.",
		"and your shield's weight and upgrade level.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777600% of ATK^000000",
		"[Lv. 2]: ^7777771,200% of ATK^000000",
		"[Lv. 3]: ^7777771,800% of ATK^000000",
		"[Lv. 4]: ^7777772,400% of ATK^000000",
		"[Lv. 5]: ^7777773,000% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.IG_OVERSLASH] = [
		"Overslash",
		"Max Lv.: 10",
		"^777777Learning Conditions: Attack Stance Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF3 AP^000000",
		"Details: ^777777Requires Attack Stance.",
		"Inflict Melee Physical damage on a target, and then on others in 7 x7 cells around it.",
		"This skill's hit count increases, depending on the number of enemies around the target.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^77777760% of ATK^000000",
		"[Lv. 2]: ^777777120% of ATK^000000",
		"[Lv. 3]: ^777777180% of ATK^000000",
		"[Lv. 4]: ^777777240% of ATK^000000",
		"[Lv. 5]: ^777777300% of ATK^000000",
		"[Lv. 6]: ^777777360% of ATK^000000",
		"[Lv. 7]: ^777777420% of ATK^000000",
		"[Lv. 8]: ^777777480% of ATK^000000",
		"[Lv. 9]: ^777777540% of ATK^000000",
		"[Lv. 10]: ^777777600% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.IG_CROSS_RAIN] = [
		"Cross Rain",
		"Max Lv.: 10",
		"^777777Learning Conditions: Shield Mastery Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Ground cell^000000",
		"Recovery: ^0054FF5 AP^000000",
		"Details: ^777777Summon a holy ground that inflicts Holy Magic damage once every 0.3 seconds for 4.5 seconds.",
		"Holy Shield increases its damage.",
		"This skill additionally increases damage, depending on your Base Level, SPL, and Spear Sword Mastery level.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^77777730% of MATK (50% with Holy Shield), Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^77777760% of MATK (100% with Holy Shield), Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^77777790% of MATK (150% with Holy Shield), Effective Range: 3 x3 cells^000000",
		"[Lv. 4]: ^777777120% of MATK (200% with Holy Shield), Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^777777150% of MATK (250% with Holy Shield), Effective Range: 5 x5 cells^000000",
		"[Lv. 6]: ^777777180% of MATK (300% with Holy Shield), Effective Range: 5 x5 cells^000000",
		"[Lv. 7]: ^777777210% of MATK (350% with Holy Shield), Effective Range: 7 x7 cells^000000",
		"[Lv. 8]: ^777777240% of MATK (400% with Holy Shield), Effective Range: 7 x7 cells^000000",
		"[Lv. 9]: ^777777270% of MATK (450% with Holy Shield), Effective Range: 7 x7 cells^000000",
		"[Lv. 10]: ^777777300% of MATK (500% with Holy Shield), Effective Range: 9 x9 cells^000000"
	].join("\n");

	SkillDescription[SKID.SHC_DANCING_KNIFE] = [
		"Dancing Knife",
		"Max Lv.: 5",
		"^777777Learning Conditions: Shadow Sense Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777Self^000000",
		"Details: ^777777A Dagger skill.",
		"Summon small spinning blades around you to attack surrounding enemies in 5 x5 cells.",
		"This skill's effect is canceled immediately if you change to a different, non-Dagger Weapon for its duration.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777200% of ATK^000000",
		"[Lv. 2]: ^777777400% of ATK^000000",
		"[Lv. 3]: ^777777600% of ATK^000000",
		"[Lv. 4]: ^777777800% of ATK^000000",
		"[Lv. 5]: ^7777771,000% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.SHC_SAVAGE_IMPACT] = [
		"Savage Impact",
		"Max Lv.: 10",
		"^777777Learning Conditions: Cross Impact Lv. 5 and Shadow Sense Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^777777AoE^000000",
		"Details: ^777777A Katar skill. Requires Cloaking or Cloaking Exceed.",
		"Quickly approach a target and inflict Melee Physical damage on it and others in 3 x3 cells around it.",
		"This skill immediately cancels your Cloaking mode.",
		"This skill additionally increases damage, depending on your Base Level and POW.",
		"and uses 50% of your CRIT to inflict Critical damage.",
		"If it crits, it inflicts half of the total of your Critical Damage Bonus options as damage.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777350% of ATK^000000",
		"[Lv. 2]: ^777777700% of ATK^000000",
		"[Lv. 3]: ^7777771,050% of ATK^000000",
		"[Lv. 4]: ^7777771,400% of ATK^000000",
		"[Lv. 5]: ^7777771,750% of ATK^000000",
		"[Lv. 6]: ^7777772,100% of ATK^000000",
		"[Lv. 7]: ^7777772,450% of ATK^000000",
		"[Lv. 8]: ^7777772,800% of ATK^000000",
		"[Lv. 9]: ^7777773,150% of ATK^000000",
		"[Lv. 10]: ^7777773,500% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.SHC_SHADOW_SENSE] = [
		"Shadow Sense",
		"Max Lv.: 10",
		"Class: ^993300Passive^000000",
		"Details: ^777777Increase your FLEE. Katars and Daggers also increase CRIT.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777FLEE +10, CRIT +14 (with Dagger) / CRIT +7 (with Katar)^000000",
		"[Lv. 2]: ^777777FLEE +20, CRIT +18 (with Dagger) / CRIT +9 (with Katar)^000000",
		"[Lv. 3]: ^777777FLEE +30, CRIT +22 (with Dagger) / CRIT +11 (with Katar)^000000",
		"[Lv. 4]: ^777777FLEE +40, CRIT +26 (with Dagger) / CRIT +13 (with Katar)^000000",
		"[Lv. 5]: ^777777FLEE +50, CRIT +30 (with Dagger) / CRIT +15 (with Katar)^000000",
		"[Lv. 6]: ^777777FLEE +60, CRIT +34 (with Dagger) / CRIT +17 (with Katar)^000000",
		"[Lv. 7]: ^777777FLEE +70, CRIT +38 (with Dagger) / CRIT +19 (with Katar)^000000",
		"[Lv. 8]: ^777777FLEE +80, CRIT +42 (with Dagger) / CRIT +21 (with Katar)^000000",
		"[Lv. 9]: ^777777FLEE +90, CRIT +46 (with Dagger) / CRIT +23 (with Katar)^000000",
		"[Lv. 10]: ^777777FLEE +100, CRIT +50 (with Dagger) / CRIT +25 (with Katar)^000000"
	].join("\n");

	SkillDescription[SKID.SHC_ETERNAL_SLASH] = [
		"Eternal Slash",
		"Max Lv.: 5",
		"^777777Learning Conditions: Weapon Blocking Lv. 3, Shadow Sense Lv. 5, and Dancing Knife Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777Can be used during Weapon Blocking.",
		"Critically inflict Melee Physical damage on a target.",
		"This skill's hit count increases if recast in 3 seconds.",
		"This skill additionally increases damage, depending on your Base Level and POW.",
		"and uses 50% of your CRIT to inflict Critical damage.",
		"If it crits, it inflicts half of the total of your Critical Damage Bonus options as damage.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777350% of ATK^000000",
		"[Lv. 2]: ^777777700% of ATK^000000",
		"[Lv. 3]: ^7777771,050% of ATK^000000",
		"[Lv. 4]: ^7777771,400% of ATK^000000",
		"[Lv. 5]: ^7777771,750% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.SHC_ENCHANTING_SHADOW] = [
		"Enchanting Shadow",
		"Max Lv.: 5",
		"^777777Learning Conditions: Poisonous Weapon Lv. 5 and Shadow Sense Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777Self^000000",
		"Details: ^777777Imbue your Weapon with the power of shadows.",
		"Attacks create a chance of leaving Shadow Wounds on enemies, increasing their damage, depending on the number of Shadow Wounds on them.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Shadow Wound Chance: 1%^000000",
		"[Lv. 2]: ^777777Shadow Wound Chance: 2%^000000",
		"[Lv. 3]: ^777777Shadow Wound Chance: 3%^000000",
		"[Lv. 4]: ^777777Shadow Wound Chance: 4%^000000",
		"[Lv. 5]: ^777777Shadow Wound Chance: 5%^000000"
	].join("\n");

	SkillDescription[SKID.SHC_POTENT_VENOM] = [
		"Potent Venom",
		"Max Lv.: 10",
		"^777777Learning Conditions: Shadow Sense Lv. 5 and Enchanting Shadow Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777Self^000000",
		"Details: ^777777Requires a Weapon with Deadly Poison applied on it.",
		"Ignore your target's Physical Resistance.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Ignore 3% of Physical Resistance, Duration: 30 sec.^000000",
		"[Lv. 2]: ^777777Ignore 6% of Physical Resistance, Duration: 40 sec.^000000",
		"[Lv. 3]: ^777777Ignore 9% of Physical Resistance, Duration: 50 sec.^000000",
		"[Lv. 4]: ^777777Ignore 12% of Physical Resistance, Duration: 60 sec.^000000",
		"[Lv. 5]: ^777777Ignore 15% of Physical Resistance, Duration: 70 sec.^000000",
		"[Lv. 6]: ^777777Ignore 18% of Physical Resistance, Duration: 80 sec.^000000",
		"[Lv. 7]: ^777777Ignore 21% of Physical Resistance, Duration: 90 sec.^000000",
		"[Lv. 8]: ^777777Ignore 24% of Physical Resistance, Duration: 100 sec.^000000",
		"[Lv. 9]: ^777777Ignore 27% of Physical Resistance, Duration: 110 sec.^000000",
		"[Lv. 10]: ^777777Ignore 30% of Physical Resistance, Duration: 120 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SHC_SHADOW_EXCEED] = [
		"Shadow Exceed",
		"Max Lv.: 10",
		"^777777Learning Conditions: Shadow Sense Lv. 7, Enchanting Shadow Lv. 5, and Potent Venom Lv. 3^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777Self^000000",
		"Cost: ^FF0000150 AP^000000",
		"Details: ^777777Maximize your abilities to temporarily improve Savage Impact and Eternal Slash.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 60 sec.^000000",
		"[Lv. 2]: ^777777Duration: 80 sec.^000000",
		"[Lv. 3]: ^777777Duration: 100 sec.^000000",
		"[Lv. 4]: ^777777Duration: 120 sec.^000000",
		"[Lv. 5]: ^777777Duration: 140 sec.^000000",
		"[Lv. 6]: ^777777Duration: 160 sec.^000000",
		"[Lv. 7]: ^777777Duration: 180 sec.^000000",
		"[Lv. 8]: ^777777Duration: 200 sec.^000000",
		"[Lv. 9]: ^777777Duration: 220 sec.^000000",
		"[Lv. 10]: ^777777Duration: 240 sec.^000000"
	].join("\n");

	SkillDescription[SKID.SHC_FATAL_SHADOW_CROW] = [
		"Fatal Shadow Claw",
		"Max Lv.: 10",
		"^777777Learning Conditions: Shadow Stab Lv. 5 and Impact Crater Lv. 5^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Cost: ^FF0000150 AP^000000",
		"Details: ^777777Approach a target, cast Dark Claw on it and others around it, and Critically inflict Melee Physical damage.",
		"This Dark Claw effect follows your Dark Claw level.",
		"Inflicts more damage on Demi-Human and Dragon monsters.",
		"This skill additionally increases damage, depending on your Base Level and POW. If it crits, it adds and inflicts half of the total of your Critical Damage Bonus options as damage.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777650% of ATK (950% on Human/Dragon)^000000",
		"[Lv. 2]: ^7777771,300% of ATK (1,900% on Human/Dragon)^000000",
		"[Lv. 3]: ^7777771,950% of ATK (2,850% on Human/Dragon)^000000",
		"[Lv. 4]: ^7777772,600% of ATK (3,800% on Human/Dragon)^000000",
		"[Lv. 5]: ^7777773,250% of ATK (4,750% on Human/Dragon)^000000",
		"[Lv. 6]: ^7777773,900% of ATK (5,700% on Human/Dragon)^000000",
		"[Lv. 7]: ^7777774,550% of ATK (6,650% on Human/Dragon)^000000",
		"[Lv. 8]: ^7777775,200% of ATK (7,600% on Human/Dragon)^000000",
		"[Lv. 9]: ^7777775,850% of ATK (8,550% on Human/Dragon)^000000",
		"[Lv. 10]: ^7777776,500% of ATK (9,500% on Human/Dragon)^000000"
	].join("\n");

	SkillDescription[SKID.SHC_SHADOW_STAB] = [
		"Shadow Stab",
		"Max Lv.: 5",
		"^777777Learning Conditions: Cloaking Exceed Lv. 5, Shadow Sense Lv. 5, Dancing Knife Lv. 5, and Eternal Slash Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF1 AP^000000",
		"Details: ^777777A Dagger skill.",
		"Inflict Melee Physical damage that ignores the target's DEF.",
		"Can attack twice when used during Cloaking or Cloaking Exceed mode.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777750% of ATK^000000",
		"[Lv. 2]: ^7777771,500% of ATK^000000",
		"[Lv. 3]: ^7777772,250% of ATK^000000",
		"[Lv. 4]: ^7777773,000% of ATK^000000",
		"[Lv. 5]: ^7777773,750% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.SHC_IMPACT_CRATER] = [
		"Impact Crater",
		"Max Lv.: 5",
		"^777777Learning Conditions: Rolling Cutter Lv. 5, Shadow Sense Lv. 5, and Savage Impact Lv. 5, and Weapon Blocking Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^777777AoE^000000",
		"Recovery: ^0054FF5 AP^000000",
		"Details: ^777777A Katar skill.",
		"Inflict Melee Physical damage on surrounding target that can crit, depending on your Spin stacks.",
		"This skill also casts Weapon Blocking Success mode.",
		"This skill additionally increases damage, depending on your Base Level and POW.",
		"and uses 50% of your CRIT to inflict Critical damage.",
		"If it crits, it inflicts half of the total of your Critical Damage Bonus options as damage.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^77777765% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^777777130% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^777777195% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^777777260% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^777777325% of ATK, Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.CD_REPARATIO] = [
		"Repatatio",
		"Max Lv.: 5",
		"^777777Learning Conditions: Mediale Votum Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Healing^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777Fully restore the target's HP.",
		"Can't be used on monsters, Mercenaries, Spirits, or Humunculi.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Skill Cooldown: 150 sec.^000000",
		"[Lv. 2]: ^777777Skill Cooldown: 100 sec.^000000",
		"[Lv. 3]: ^777777Skill Cooldown: 60 sec.^000000",
		"[Lv. 4]: ^777777Skill Cooldown: 30 sec.^000000",
		"[Lv. 5]: ^777777Skill Cooldown: 10 sec.^000000"
	].join("\n");

	SkillDescription[SKID.CD_MEDIALE_VOTUM] = [
		"Mediale Votum",
		"Max Lv.: 5",
		"^777777Learning Conditions: Dilectio Heal Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Healing^000000",
		"Target: ^777777You and Your Party^000000",
		"Details: ^777777Bless 1 party member.",
		"This skill restores HP for its target and surrounding party members in 9 x9 cells every 2 seconds, by a portion of the target's HP.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Healing Check Rate: 2%, Duration: 40 sec.^000000",
		"[Lv. 2]: ^777777Healing Check Rate: 4%, Duration: 60 sec.^000000",
		"[Lv. 3]: ^777777Healing Check Rate: 6%, Duration: 80 sec.^000000",
		"[Lv. 4]: ^777777Healing Check Rate: 8%, Duration: 100 sec.^000000",
		"[Lv. 5]: ^777777Healing Check Rate: 10%, Duration: 120 sec.^000000"
	].join("\n");

	SkillDescription[SKID.CD_MACE_BOOK_M] = [
		"Mace Book Mastery",
		"Max Lv.: 10",
		"Class: ^993300Passive^000000",
		"Details: ^777777Maces and Books increase Physical damage on enemies, depending on their size.",
		"This skill also affects Petitio and Effligo damage.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Small +1%, Medium +2%, Large +3%^000000",
		"[Lv. 2]: ^777777Small +2%, Medium +3%, Large +5%^000000",
		"[Lv. 3]: ^777777Small +3%, Medium +5%, Large +7%^000000",
		"[Lv. 4]: ^777777Small +4%, Medium +6%, Large +9%^000000",
		"[Lv. 5]: ^777777Small +5%, Medium +8%, Large +10%^000000",
		"[Lv. 6]: ^777777Small +6%, Medium +9%, Large +12%^000000",
		"[Lv. 7]: ^777777Small +7%, Medium +11%, Large +13%^000000",
		"[Lv. 8]: ^777777Small +8%, Medium +12%, Large +15%^000000",
		"[Lv. 9]: ^777777Small +9%, Medium +14%, Large +16%^000000",
		"[Lv. 10]: ^777777Small +10%, Medium +15%, Large +18%^000000"
	].join("\n");

	SkillDescription[SKID.CD_ARGUTUS_VITA] = [
		"Argutus Vita",
		"Max Lv.: 5",
		"^777777Learning Conditions: Mediale Votum Lv. 3 and Repatatio Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777You and Your Party^000000",
		"Details: ^777777Enable you and 1 party member to ignore Magic Resistance.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Ignore 5% of Magic Resistance, Duration: 120 sec.^000000",
		"[Lv. 2]: ^777777Ignore 10% of Magic Resistance, Duration: 150 sec.^000000",
		"[Lv. 3]: ^777777Ignore 15% of Magic Resistance, Duration: 180 sec.^000000",
		"[Lv. 4]: ^777777Ignore 20% of Magic Resistance, Duration: 210 sec.^000000",
		"[Lv. 5]: ^777777Ignore 25% of Magic Resistance, Duration: 240 sec.^000000"
	].join("\n");

	SkillDescription[SKID.CD_ARGUTUS_TELUM] = [
		"Argutus Telum",
		"Max Lv.: 5",
		"^777777Learning Conditions: Mediale Votum Lv. 3 and Repatatio Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777You and Your Party^000000",
		"Details: ^777777Enable you and 1 party member to ignore Physical Resistance.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Ignore 5% of Physical Resistance, Duration: 120 sec.^000000",
		"[Lv. 2]: ^777777Ignore 10% of Physical Resistance, Duration: 150 sec.^000000",
		"[Lv. 3]: ^777777Ignore 15% of Physical Resistance, Duration: 180 sec.^000000",
		"[Lv. 4]: ^777777Ignore 20% of Physical Resistance, Duration: 210 sec.^000000",
		"[Lv. 5]: ^777777Ignore 25% of Physical Resistance, Duration: 240 sec.^000000"
	].join("\n");

	SkillDescription[SKID.CD_ARBITRIUM] = [
		"Arbitrium",
		"Max Lv.: 10",
		"^777777Learning Conditions: Adoramus Lv. 5 and Flamen Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777Deliver powerful judgment of light onto a target, inflicting Holy Magic damage with a chance of Quiet.",
		"Light explodes out of the target, splashing Holy Magic damage to others around it.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777200% of MATK, Quiet Chance: 25%^000000",
		"[Lv. 2]: ^777777400% of MATK, Quiet Chance: 30%^000000",
		"[Lv. 3]: ^777777600% of MATK, Quiet Chance: 35%^000000",
		"[Lv. 4]: ^777777800% of MATK, Quiet Chance: 40%^000000",
		"[Lv. 5]: ^7777771,000% of MATK, Quiet Chance: 45%^000000",
		"[Lv. 6]: ^7777771,200% of MATK, Quiet Chance: 50%^000000",
		"[Lv. 7]: ^7777771,400% of MATK, Quiet Chance: 55%^000000",
		"[Lv. 8]: ^7777771,600% of MATK, Quiet Chance: 60%^000000",
		"[Lv. 9]: ^7777771,800% of MATK, Quiet Chance: 65%^000000",
		"[Lv. 10]: ^7777772,000% of MATK, Quiet Chance: 70%^000000"
	].join("\n");

	SkillDescription[SKID.CD_PRESENS_ACIES] = [
		"Presens Acies",
		"Max Lv.: 5",
		"^777777Learning Conditions: Mediale Votum Lv. 3 and Repatatio Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777You and party members^000000",
		"Details: ^777777Increase Critical damage rate for you or 1 party member.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Critical Damage Rate +2, Duration: 120 sec.^000000",
		"[Lv. 2]: ^777777Critical Damage Rate +4, Duration: 150 sec.^000000",
		"[Lv. 3]: ^777777Critical Damage Rate +6, Duration: 180 sec.^000000",
		"[Lv. 4]: ^777777Critical Damage Rate +8, Duration: 210 sec.^000000",
		"[Lv. 5]: ^777777Critical Damage Rate +10, Duration: 240 sec.^000000"
	].join("\n");

	SkillDescription[SKID.CD_FIDUS_ANIMUS] = [
		"Fidus Animus",
		"Max Lv.: 10",
		"Class: ^993300Passive^000000",
		"Details: ^777777Increase your Holy Magic damage.",
		"This skill also affects Flamen, Arbitrium, and Pneumaticus Procella damage.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Holy Magic Damage +1%^000000",
		"[Lv. 2]: ^777777Holy Magic Damage +3%^000000",
		"[Lv. 3]: ^777777Holy Magic Damage +4%^000000",
		"[Lv. 4]: ^777777Holy Magic Damage +6%^000000",
		"[Lv. 5]: ^777777Holy Magic Damage +7%^000000",
		"[Lv. 6]: ^777777Holy Magic Damage +9%^000000",
		"[Lv. 7]: ^777777Holy Magic Damage +10%^000000",
		"[Lv. 8]: ^777777Holy Magic Damage +12%^000000",
		"[Lv. 9]: ^777777Holy Magic Damage +13%^000000",
		"[Lv. 10]: ^777777Holy Magic Damage +15%^000000"
	].join("\n");

	SkillDescription[SKID.CD_EFFLIGO] = [
		"Effligo",
		"Max Lv.: 10",
		"^777777Learning Conditions: Oratio Lv. 5 and Petitio Lv. 10^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Cost: ^FF0000100 AP^000000",
		"Details: ^777777A Mace/Book skill.",
		"Inflict great Melee Physical damage.",
		"This skill inflicts more damage on Demon and Undead enemies.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777800% of ATK (1,200% on Demon/Undead)^000000",
		"[Lv. 2]: ^7777771,600% of ATK (2,400% on Demon/Undead)^000000",
		"[Lv. 3]: ^7777772,400% of ATK (3,600% on Demon/Undead)^000000",
		"[Lv. 4]: ^7777773,200% of ATK (4,800% on Demon/Undead)^000000",
		"[Lv. 5]: ^7777774,000% of ATK (6,000% on Demon/Undead)^000000",
		"[Lv. 6]: ^7777774,800% of ATK (7,200% on Demon/Undead)^000000",
		"[Lv. 7]: ^7777775,600% of ATK (8,400% on Demon/Undead)^000000",
		"[Lv. 8]: ^7777776,400% of ATK (9,600% on Demon/Undead)^000000",
		"[Lv. 9]: ^7777777,200% of ATK (10,800% on Demon/Undead)^000000",
		"[Lv. 10]: ^7777778,000% of ATK (12,000% on Demon/Undead)^000000"
	].join("\n");

	SkillDescription[SKID.CD_COMPETENTIA] = [
		"Competentia",
		"Max Lv.: 5",
		"^777777Learning Conditions: Presens Acies Lv. 2, Argutus Telum Lv. 2, and Argutus Vita Lv. 2^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Healing^000000",
		"Target: ^777777AoE^000000",
		"Cost: ^FF0000200 AP^000000",
		"Details: ^777777Restore HP and SP for you and surrounding party members. Also, increase P. ATK and S. MATK.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777HP/SP +20%, Duration: 120 sec.^000000",
		"[Lv. 2]: ^777777HP/SP +40%, Duration: 150 sec.^000000",
		"[Lv. 3]: ^777777HP/SP +60%, Duration: 180 sec.^000000",
		"[Lv. 4]: ^777777HP/SP +80%, Duration: 210 sec.^000000",
		"[Lv. 5]: ^777777HP/SP +100%, Duration: 240 sec.^000000"
	].join("\n");

	SkillDescription[SKID.CD_PNEUMATICUS_PROCELLA] = [
		"Pneumaticus Procella",
		"Max Lv.: 10",
		"^777777Learning Conditions: Flamen Lv. 5 and Arbitrium Lv. 10^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Ground cell^000000",
		"Cost: ^FF0000150 AP^000000",
		"Details: ^777777Cause a holy storm, inflicting Holy Magic damage on targets within range.",
		"This skill inflicts more damage on Demon and Undead enemies.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777200% of MATK (300% on Demon/Undead), Effective Range: 5 x5 cells^000000",
		"[Lv. 2]: ^777777400% of MATK (600% on Demon/Undead), Effective Range: 5 x5 cells^000000",
		"[Lv. 3]: ^777777600% of MATK (900% on Demon/Undead), Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^777777800% of MATK (1,200% on Demon/Undead), Effective Range: 7 x7 cells^000000",
		"[Lv. 5]: ^7777771,000% of MATK (1,500% on Demon/Undead), Effective Range: 7 x7 cells^000000",
		"[Lv. 6]: ^7777771,200% of MATK (1,800% on Demon/Undead), Effective Range: 7 x7 cells^000000",
		"[Lv. 7]: ^7777771,400% of MATK (2,100% on Demon/Undead), Effective Range: 9 x9 cells^000000",
		"[Lv. 8]: ^7777771,600% of MATK (2,400% on Demon/Undead), Effective Range: 9 x9 cells^000000",
		"[Lv. 9]: ^7777771,800% of MATK (2,700% on Demon/Undead), Effective Range: 9 x9 cells^000000",
		"[Lv. 10]: ^7777772,000% of MATK (3,000% on Demon/Undead), Effective Range: 11 x11 cells^000000"
	].join("\n");

	SkillDescription[SKID.CD_DILECTIO_HEAL] = [
		"Dilectio Heal",
		"Max Lv.: 5",
		"^777777Learning Conditions: Coluseo Heal Lv. 3 and High Heal Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Healing^000000",
		"Target: ^777777You and Your Party^000000",
		"Recovery: ^0054FF1 AP^000000",
		"Details: ^777777Restore HP for you and one or more surrounding party members.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Recovery Intensification +10%, Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^777777Recovery Intensification +25%, Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^777777Recovery Intensification +30%, Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^777777Recovery Intensification +35%, Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^777777Recovery Intensification +40%, Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.CD_RELIGIO] = [
		"Religio",
		"Max Lv.: 5",
		"^777777Learning Conditions: Clementia Lv. 3 and Dilectio Heal Lv. 2^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF1 AP^000000",
		"Details: ^777777Maximize the target's faith, temporarily increasing their SPL, WIS, and STA.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777SPL/WIS/STA +2, Duration: 120 sec.^000000",
		"[Lv. 2]: ^777777SPL/WIS/STA +4, Duration: 150 sec.^000000",
		"[Lv. 3]: ^777777SPL/WIS/STA +6, Duration: 180 sec.^000000",
		"[Lv. 4]: ^777777SPL/WIS/STA +8, Duration: 210 sec.^000000",
		"[Lv. 5]: ^777777SPL/WIS/STA +10, Duration: 240 sec.^000000"
	].join("\n");

	SkillDescription[SKID.CD_BENEDICTUM] = [
		"Benedictum",
		"Max Lv.: 5",
		"^777777Learning Conditions: Canto Candidus Lv. 3 and Dilectio Heal Lv. 2^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF1 AP^000000",
		"Details: ^777777Bless a target, temporarily increasing their POW, CRT, and CON.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777POW/CRT/CON +2, Duration: 120 sec.^000000",
		"[Lv. 2]: ^777777POW/CRT/CON +4, Duration: 150 sec.^000000",
		"[Lv. 3]: ^777777POW/CRT/CON +6, Duration: 180 sec.^000000",
		"[Lv. 4]: ^777777POW/CRT/CON +8, Duration: 210 sec.^000000",
		"[Lv. 5]: ^777777POW/CRT/CON +10, Duration: 240 sec.^000000"
	].join("\n");

	SkillDescription[SKID.CD_PETITIO] = [
		"Petitio",
		"Max Lv.: 10",
		"^777777Learning Conditions: Duple Light Lv. 10 and Mace Book Mastery Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF2 AP^000000",
		"Details: ^777777A Mace/Book skill.",
		"Forcefully strike a target, inflicting Physical damage on and around it.",
		"Maces inflict Long-ranged Physical damage; Books, Melee Physical damage.",
		"This skill additionally increases damage, depending on your Base Level and POW.",
		"Duple Light creates a chance of auto-casting Petitio with Normal Physical attacks.",
		"The auto-cast Petitio is activated at your current Petitio level without consuming AP.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777270% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^777777540% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^777777810% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 4]: ^7777771,080% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^7777771,350% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 6]: ^7777771,620% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 7]: ^7777771,890% of ATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 8]: ^7777772,160% of ATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 9]: ^7777772,430% of ATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 10]: ^7777772,700% of ATK, Effective Range: 9 x9 cells^000000"
	].join("\n");

	SkillDescription[SKID.CD_FRAMEN] = [
		"Flamen",
		"Max Lv.: 5",
		"^777777Learning Conditions: Judex Lv. 10 and Fidus Animus Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF3 AP^000000",
		"Details: ^777777Using your holy power, inflict Holy Magic damage on and around a target.",
		"This skill inflicts more damage on Demon and Undead enemies.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777500% of MATK (650% on Demon/Undead), Effective Range: 5 x5 cells^000000",
		"[Lv. 2]: ^7777771,000% of MATK (1,300% on Demon/Undead), Effective Range: 5 x5 cells^000000",
		"[Lv. 3]: ^7777771,500% of MATK (1,950% on Demon/Undead), Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777772,000% of MATK (2,600% on Demon/Undead), Effective Range: 7 x7 cells^000000",
		"[Lv. 5]: ^7777772,500% of MATK (3,250% on Demon/Undead), Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.BO_BIONIC_PHARMACY] = [
		"Bionic Pharmacy",
		"Max Lv.: 5",
		"^777777Learning Conditions: Special Pharmacy Lv. 5^000000",
		"Class: ^993300Active/Crafting^000000",
		"Type: ^777777Crafting^000000",
		"Target: ^777777Self^000000",
		"Details: ^777777Create a chemical at the cost of 30 SP.",
		"Consumes 1 Beaker along with other ingredients, depending on the chemical you create. ^000000",
		"Icicle Acid: 5 Bottle Grenades, 5 Acid Bottles, and 2 Crystal Blues^000000",
		"Earth Acid: 5 Bottle Grenades, 5 Acid Bottles, and 2 Green Lives^000000",
		"Gale Acid: 5 Bottle Grenades, 5 Acid Bottles, and 2 Winds of Verdure^000000",
		"Flame Acid: 5 Bottle Grenades, 5 Acid Bottles, and 2 Red Bloods^000000",
		"Advanced Glistening Coat: 10 Glistening Coats and 5 Empty Bottles^000000",
		"Advanced Plant Bottle: 10 Plant Bottles, 5 Mandragora Pots, 2 Thorn Plant Seeds, and 2 Bloodsuck Plant Seeds.^000000",
		"Eye Cleaner (Sightless Remover): 10 Empty Bottles, 5 Holy Waters, 3 White Herbs, and 3 Green Herbs^000000",
		"Ear Cleaner (Quiet Remover): 10 Empty Bottles, 5 Holy Waters, 2 Blue Herbs, and 3 Green Herbs^000000",
		"Energy Tonic (Lethargy Remover): 10 Empty Bottles, 5 Holy Waters, 2 Yggdrasilberries, 3 Royal Jellies^000000",
		"Mini Extinguisher (Arson Remover): 10 Empty Bottles, 5 Holy Waters, 5 Crystal Blues, and 3 Irons^000000",
		"Lucky Water (Misfortune Remover): 10 Empty Bottles, 5 Holy Waters, 10 Clovers, and 3 Green Herbs^000000",
		"Strong Antidote (Strong Poison Remover): 10 Empty Bottles, 5 Holy Waters, 3 Poison Bottles, and 10 Green Herbs^000000",
		"High-calorie Chocolate (Depression Remover): 10 Empty Bottles, 3 Cacaos, 3 Royal Jellies, and 5 Yggdrasil Seeds^000000",
		"Refined Holy Water (Holy Fire Remover): 10 Empty Bottles, 10 Holy Waters, and 3 Royal Jellies^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Max Crafting Count: 11^000000",
		"[Lv. 2]: ^777777Max Crafting Count: 12^000000",
		"[Lv. 3]: ^777777Max Crafting Count: 13^000000",
		"[Lv. 4]: ^777777Max Crafting Count: 14^000000",
		"[Lv. 5]: ^777777Max Crafting Count: 15^000000"
	].join("\n");

	SkillDescription[SKID.BO_BIONICS_M] = [
		"Bionics Mastery",
		"Max Lv.: 10",
		"Class: ^993300Passive^000000",
		"Details: ^777777Improve Plant minion stats.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777ATK +200, MHP +2,000, MSP +20, DEF +20, MDEF +4, FLEE +10^000000",
		"[Lv. 2]: ^777777ATK +400, MHP +4,000, MSP +40, DEF +40, MDEF +8, FLEE +20^000000",
		"[Lv. 3]: ^777777ATK +600, MHP +6,000, MSP +60, DEF +60, MDEF +12, FLEE +30^000000",
		"[Lv. 4]: ^777777ATK +800, MHP +8,000, MSP +80, DEF +80, MDEF +16, FLEE +40^000000",
		"[Lv. 5]: ^777777ATK +1,000, MHP +10,000, MSP +100, DEF +100, MDEF +20, FLEE +50^000000",
		"[Lv. 6]: ^777777ATK +1,200, MHP +12,000, MSP +120, DEF +120, MDEF +24, FLEE +60^000000",
		"[Lv. 7]: ^777777ATK +1,400, MHP +14,000, MSP +140, DEF +140, MDEF +28, FLEE +70^000000",
		"[Lv. 8]: ^777777ATK +1,600, MHP +16,000, MSP +160, DEF +160, MDEF +32, FLEE +80^000000",
		"[Lv. 9]: ^777777ATK +1,800, MHP +18,000, MSP +180, DEF +180, MDEF +36, FLEE +90^000000",
		"[Lv. 10]: ^777777ATK +2,000, MHP +20,000, MSP +200, DEF +200, MDEF +40, FLEE +100^000000"
	].join("\n");

	SkillDescription[SKID.BO_RESEARCHREPORT] = [
		"Research Report",
		"Max Lv.: 1",
		"^777777Learning Conditions: Acidified Zone (Fire) Lv. 3 and Acidified Zone (Water) Lv. 3^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777Self^000000",
		"Cost: ^FF0000100 AP^000000",
		"Details: ^777777Report the findings of your study.",
		"This skill increases Acidified Zone damage and your damage on Neutral and Plant enemies.",
		"It additionally increases Acidified Zone damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Acidified Zone Damage +50%, Ingredient Cost -1^000000"
	].join("\n");

	SkillDescription[SKID.BO_HELLTREE] = [
		"Create Hell Tree",
		"Max Lv.: 5",
		"^777777Learning Conditions: Create Wooden Fairy Lv. 3 and Create Wooden Warrior Lv. 3^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Summon^000000",
		"Target: ^777777Self^000000",
		"Cost: ^FF0000100 AP^000000",
		"Details: ^777777Summon a hellish tree.",
		"Up to 1 hellish tree can be summoned at the same time.",
		"Consumes 3 Advanced Plant Bottles.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 60 sec.^000000",
		"[Lv. 2]: ^777777Duration: 90 sec.^000000",
		"[Lv. 3]: ^777777Duration: 120 sec.^000000",
		"[Lv. 4]: ^777777Duration: 150 sec.^000000",
		"[Lv. 5]: ^777777Duration: 180 sec.^000000"
	].join("\n");

	SkillDescription[SKID.BO_WOODEN_FAIRY] = [
		"Create Wooden Fairy",
		"Max Lv.: 5",
		"^777777Learning Conditions: Create Creeper Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Summon^000000",
		"Target: ^777777Self^000000",
		"Recovery: ^0054FF20 AP^000000",
		"Details: ^777777Summon a wooden fairy.",
		"Up to 1 wooden fairy can be summoned.",
		"This fairy increases Spore Explosion damage for its duration.",
		"Consumes 2 Advanced Plant Bottles.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 120 sec.^000000",
		"[Lv. 2]: ^777777Duration: 180 sec.^000000",
		"[Lv. 3]: ^777777Duration: 240 sec.^000000",
		"[Lv. 4]: ^777777Duration: 300 sec.^000000",
		"[Lv. 5]: ^777777Duration: 360 sec.^000000"
	].join("\n");

	SkillDescription[SKID.BO_WOODENWARRIOR] = [
		"Create Wooden Warrior",
		"Max Lv.: 5",
		"^777777Learning Conditions: Create Creeper Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Summon^000000",
		"Target: ^777777Self^000000",
		"Recovery: ^0054FF20 AP^000000",
		"Details: ^777777Summon a wooden warrior.",
		"Up to 1 wooden warrior can be summoned.",
		"This warrior increases Cart Tornado and Cart Cannon damage for its duration.",
		"Consumes 2 Advanced Plant Bottles.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 120 sec.^000000",
		"[Lv. 2]: ^777777Duration: 180 sec.^000000",
		"[Lv. 3]: ^777777Duration: 240 sec.^000000",
		"[Lv. 4]: ^777777Duration: 300 sec.^000000",
		"[Lv. 5]: ^777777Duration: 360 sec.^000000"
	].join("\n");

	SkillDescription[SKID.BO_CREEPER] = [
		"Create Creeper",
		"Max Lv.: 5",
		"^777777Learning Conditions: Bionics Mastery Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Summon^000000",
		"Target: ^777777Self^000000",
		"Recovery: ^0054FF10 AP^000000",
		"Details: ^777777Summon a tough vine monster.",
		"Up to 1 creeper can be summoned at the same time.",
		"Consumes 1 Advanced Plant Bottle.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 120 sec.^000000",
		"[Lv. 2]: ^777777Duration: 180 sec.^000000",
		"[Lv. 3]: ^777777Duration: 240 sec.^000000",
		"[Lv. 4]: ^777777Duration: 300 sec.^000000",
		"[Lv. 5]: ^777777Duration: 360 sec.^000000"
	].join("\n");

	SkillDescription[SKID.BO_ACIDIFIED_ZONE_FIRE] = [
		"Acidified Zone (Fire)",
		"Max Lv.: 5",
		"^777777Learning Conditions: Acidified Zone (Earth) Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF4 AP (Lv. 1 - 3)/5 AP (Lv. 4 - 5)^000000",
		"Details: ^777777Inflict Fire Physical damage on and around a target.",
		"If the targets are players, an Acidified Zone appears where they stand.",
		"Consumes 2 Flame Acid Bottles.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777250% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^777777500% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^777777750% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777771,000% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^7777771,250% of ATK, Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.BO_ACIDIFIED_ZONE_GROUND] = [
		"Acidified Zone (Earth)",
		"Max Lv.: 5",
		"^777777Learning Conditions: Bionics Mastery Lv. 3 and Bionic Pharmacy Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF4 AP (Lv. 1 - 3)/5 AP (Lv. 4 - 5)^000000",
		"Details: ^777777Inflict Earth Physical damage on and around a target.",
		"If the targets are players, an Acidified Zone appears where they stand.",
		"Consumes 2 Earth Acid Bottles.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777250% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^777777500% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^777777750% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777771,000% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^7777771,250% of ATK, Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.BO_ACIDIFIED_ZONE_WATER] = [
		"Acidified Zone (Water)",
		"Max Lv.: 5",
		"^777777Learning Conditions: Acidified Zone (Wind) Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF4 AP (Lv. 1 - 3)/5 AP (Lv. 4 - 5)^000000",
		"Details: ^777777Inflict Water Physical damage on and around a target.",
		"If the targets are players, an Acidified Zone appears where they stand.",
		"Consumes 2 Icicle Acid Bottles.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777250% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^777777500% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^777777750% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777771,000% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^7777771,250% of ATK, Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.BO_ACIDIFIED_ZONE_WIND] = [
		"Acidified Zone (Wind)",
		"Max Lv.: 5",
		"^777777Learning Conditions: Bionics Mastery Lv. 3 and Bionic Pharmacy Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF4 AP (Lv. 1 - 3)/5 AP (Lv. 4 - 5)^000000",
		"Details: ^777777Inflict Wind Physical damage on and around a target.",
		"If the targets are players, an Acidified Zone appears where they stand.",
		"Consumes 2 Gale Acid Bottles.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777250% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^777777500% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^777777750% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777771,000% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^7777771,250% of ATK, Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.BO_ADVANCE_PROTECTION] = [
		"Full Shadow Protection",
		"Max Lv.: 4",
		"^777777Learning Conditions: Bionic Pharmacy Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777You and Allies^000000",
		"Recovery: ^0054FF2 AP (Lv. 1 - 2)/3 AP (Lv. 3 - 4)^000000",
		"Details: ^777777Coat Shadow equipment for you and 1 other target.",
		"Consumes 1 Advanced Glistening Coat.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 30 sec.^000000",
		"[Lv. 2]: ^777777Duration: 40 sec.^000000",
		"[Lv. 3]: ^777777Duration: 50 sec.^000000",
		"[Lv. 4]: ^777777Duration: 60 sec.^000000"
	].join("\n");

	SkillDescription[SKID.BO_THE_WHOLE_PROTECTION] = [
		"Group Protection",
		"Max Lv.: 5",
		"^777777Learning Conditions: Bionic Pharmacy Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777You and party members^000000",
		"Recovery: ^0054FF20 AP^000000",
		"Details: ^777777Coat equipment for you and your party members.",
		"Consumes 3 Advanced Glistening Coats.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 60 sec., Effective Range: 15 x15 cells^000000",
		"[Lv. 2]: ^777777Duration: 90 sec., Effective Range: 15 x15 cells^000000",
		"[Lv. 3]: ^777777Duration: 120 sec., Effective Range: 15 x15 cells^000000",
		"[Lv. 4]: ^777777Duration: 150 sec., Effective Range: 31 x31 cells^000000",
		"[Lv. 5]: ^777777Duration: 180 sec., Effective Range: 31 x31 cells^000000"
	].join("\n");

	SkillDescription[SKID.WH_ADVANCED_TRAP] = [
		"Advanced Trap",
		"Max Lv.: 5",
		"^777777Learning Conditions: Trap Research Lv. 3^000000",
		"Class: ^993300Passive^000000",
		"Details: ^777777Improve the Wind Hawk traps",
		"(Deep Blind Trap, Swift Trap, Solid Trap, and Flame Trap).^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 3 sec., Damage +20%^000000",
		"[Lv. 2]: ^777777Duration: 6 sec., Damage +40%^000000",
		"[Lv. 3]: ^777777Duration: 9 sec., Damage +60%, AP Gain +1^000000",
		"[Lv. 4]: ^777777Duration: 12 sec., Damage +80%, AP Gain +1^000000",
		"[Lv. 5]: ^777777Duration: 15 sec., Damage +100%, AP Gain +1^000000"
	].join("\n");

	SkillDescription[SKID.WH_WIND_SIGN] = [
		"Wind Sign",
		"Max Lv.: 5",
		"^777777Learning Conditions: Nature's Friend Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Debuff^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777Temporarily leave a Wind Sign on the target.",
		"Normal Long-ranged Physical attacks on this target creates a chance of restoring your AP.",
		"Wind Signs persist even if their targets use Hiding, Cloaking, and Cloaking Exceed.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 20 sec., AP Chance: 14%^000000",
		"[Lv. 2]: ^777777Duration: 30 sec., AP Chance: 20%^000000",
		"[Lv. 3]: ^777777Duration: 40 sec., AP Chance: 26%^000000",
		"[Lv. 4]: ^777777Duration: 50 sec., AP Chance: 32%^000000",
		"[Lv. 5]: ^777777Duration: 60 sec., AP Chance: 40%^000000"
	].join("\n");

	SkillDescription[SKID.WH_NATUREFRIENDLY] = [
		"Nature's Friend",
		"Max Lv.: 5",
		"Class: ^993300Passive^000000",
		"Details: ^777777Improve your wild animal training skills,",
		"so you can command hawks more easily.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Hawk Rush Auto Chance +20%^000000",
		"[Lv. 2]: ^777777Hawk Rush Auto Chance +40%^000000",
		"[Lv. 3]: ^777777Hawk Rush Auto Chance +60%^000000",
		"[Lv. 4]: ^777777Hawk Rush Auto Chance +80%^000000",
		"[Lv. 5]: ^777777Hawk Rush Auto Chance +100%^000000"
	].join("\n");

	SkillDescription[SKID.WH_HAWKRUSH] = [
		"Hawk Rush",
		"Max Lv.: 5",
		"^777777Learning Conditions: Hawk Mastery Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777Your hawk inflicts Long-ranged Physical damage on the target twice.",
		"This skill follows your CRIT to inflict Critical damage.",
		"Normal Long-ranged attacks create a 1% chance per 3 CON of auto-casting Hawk Rush when you learn this skill.",
		"It additionally increases damage, depending on your Base Level and CON.",
		"If it crits, it inflicts half of the total of your Critical Damage Bonus options as damage.^000000",
		"Requires a Bow for both manual/auto use.^000000",
		"^ffffff_^000000",
		"[Lv 1]: ^777777100% of ATK^000000",
		"[Lv. 2]: ^777777200% of ATK^000000",
		"[Lv. 3]: ^777777300% of ATK^000000",
		"[Lv. 4]: ^777777400% of ATK^000000",
		"[Lv. 5]: ^777777500% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.WH_HAWK_M] = [
		"Hawk Mastery",
		"Max Lv.: 1",
		"^777777Learning Conditions: Steel Crow Lv. 1^000000",
		"Class: ^993300Active/Special^000000",
		"Details: ^777777Train a hawk.",
		"You can train your hawk with your warg. Summoning both of them, however, decreases your Warg Strike chance by 1/3.",
		"Requires a Hawk Pipe.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Summon a hawk.^000000"
	].join("\n");

	SkillDescription[SKID.WH_CALAMITYGALE] = [
		"Calamity Gale",
		"Max Lv.: 1",
		"^777777Learning Conditions: Gale Storm Lv. 5 and Wind Sign Lv. 5^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777Self^000000",
		"Cost: ^FF0000200 AP^000000",
		"Details: ^777777Shield yourself with the energy of a raging wind.",
		"This skill temporarily adds Level 5 No Limits, increases Crescive Bolt damage by 20%, and makes Gale Storm crit.",
		"Also, Crescive Bolt and Gale Storm inflict 50% more damage on Animal/Fish enemies for the skill's duration.",
		"Can't be used with No Limits.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Buff yourself.^000000"
	].join("\n");

	SkillDescription[SKID.WH_HAWKBOOMERANG] = [
		"Hawk Boomerang",
		"Max Lv.: 5",
		"^777777Learning Conditions: Hawk Rush Lv. 5^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^7777771 Target^000000",
		"Cost: ^FF000050 AP^000000",
		"Details: ^777777Your hawk inflicts Long-ranged Physical Critical damage on the target once, depending on your CRIT.",
		"This skill inflicts 50% more damage on Animal/Fish enemies.",
		"It additionally increases damage, depending on your Base Level and Traits.",
		"If it crits, it inflicts half of the total of your Critical Damage Bonus options as damage.^000000",
		"Requires a Bow.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777500% of ATK (750% on Animal/Fish)^000000",
		"[Lv. 2]: ^7777771,000% of ATK (1,500% on Animal/Fish)^000000",
		"[Lv. 3]: ^7777771,500% of ATK (2,250% on Animal/Fish)^000000",
		"[Lv. 4]: ^7777772,000% of ATK (3,000% on Animal/Fish)^000000",
		"[Lv. 5]: ^7777772,500% of ATK (3,750% on Animal/Fish)^000000"
	].join("\n");

	SkillDescription[SKID.WH_GALESTORM] = [
		"Gale Storm",
		"Max Lv.: 10",
		"^777777Learning Conditions: Crescive Bolt Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF10 AP upon hitting 3 or more targets^000000",
		"Details: ^777777Inflict Long-ranged Physical damage on enemies around the target 5 times.",
		"This skill restores AP upon hitting 3 or more enemies.",
		"It additionally increases damage, depending on your Base Level and CON.",
		"Consumes 5 equipped arrows.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777250% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 2]: ^777777500% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 3]: ^777777750% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777771,000% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^7777771,250% of ATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 6]: ^7777771,500% of ATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 7]: ^7777771,750% of ATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 8]: ^7777772,000% of ATK, Effective Range: 9 x9 cells^000000",
		"[Lv. 9]: ^7777772,250% of ATK, Effective Range: 9 x9 cells^000000",
		"[Lv. 10]: ^7777772,500% of ATK, Effective Range: 11 x11 cells^000000"
	].join("\n");

	SkillDescription[SKID.WH_DEEPBLINDTRAP] = [
		"Deep Blind Trap",
		"Max Lv.: 5",
		"^777777Learning Conditions: Advanced Trap Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Trap^000000",
		"Target: ^7777771 Ground cell^000000",
		"Recovery: ^0054FF3 - 4 AP^000000",
		"Details: ^777777Set up a trap on a ground cell that periodically inflicts Shadow Melee Physical damage for its duration.",
		"This trap also creates a chance of Sightless.",
		"Its attack intervals decrease and duration increases, depending on the skill level.",
		"Consumes 2 Special Alloy Traps.",
		"This skill additionally increases damage, depending on your Base Level and CON.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777250% of ATK, Trap Duration: 12 sec.^000000",
		"[Lv. 2]: ^777777500% of ATK, Trap Duration: 24 sec.^000000",
		"[Lv. 3]: ^777777750% of ATK, Trap Duration: 36 sec.^000000",
		"[Lv. 4]: ^7777771,000% of ATK, Trap Duration: 48 sec.^000000",
		"[Lv. 5]: ^7777771,250% of ATK, Trap Duration: 60 sec.^000000"
	].join("\n");

	SkillDescription[SKID.WH_SOLIDTRAP] = [
		"Solid Trap",
		"Max Lv.: 5",
		"^777777Learning Conditions: Advanced Trap Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Trap^000000",
		"Target: ^7777771 Ground cell^000000",
		"Recovery: ^0054FF3 - 4 AP^000000",
		"Details: ^777777Set up a trap on a ground cell that periodically inflicts Earth Melee Physical damage for its duration.",
		"This trap also creates a chance of Crystallized.",
		"Its attack intervals decrease and duration increases, depending on the skill level.",
		"Consumes 2 Special Alloy Traps.",
		"This skill additionally increases damage, depending on your Base Level and CON.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777250% of ATK, Trap Duration: 12 sec.^000000",
		"[Lv. 2]: ^777777500% of ATK, Trap Duration: 24 sec.^000000",
		"[Lv. 3]: ^777777750% of ATK, Trap Duration: 36 sec.^000000",
		"[Lv. 4]: ^7777771,000% of ATK, Trap Duration: 48 sec.^000000",
		"[Lv. 5]: ^7777771,250% of ATK, Trap Duration: 60 sec.^000000"
	].join("\n");

	SkillDescription[SKID.WH_SWIFTTRAP] = [
		"Swift Trap",
		"Max Lv.: 5",
		"^777777Learning Conditions: Deep Blind Trap Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Trap^000000",
		"Target: ^7777771 Ground cell^000000",
		"Recovery: ^0054FF3 - 4 AP^000000",
		"Details: ^777777Set up a trap on a ground cell that periodically inflicts Wind Melee Physical damage for its duration.",
		"This trap also creates a chance of Torrent.",
		"Its attack intervals decrease and duration increases, depending on the skill level.",
		"Consumes 2 Special Alloy Traps.",
		"This skill additionally increases damage, depending on your Base Level and CON.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777250% of ATK, Trap Duration: 12 sec.^000000",
		"[Lv. 2]: ^777777500% of ATK, Trap Duration: 24 sec.^000000",
		"[Lv. 3]: ^777777750% of ATK, Trap Duration: 36 sec.^000000",
		"[Lv. 4]: ^7777771,000% of ATK, Trap Duration: 48 sec.^000000",
		"[Lv. 5]: ^7777771,250% of ATK, Trap Duration: 60 sec.^000000"
	].join("\n");

	SkillDescription[SKID.WH_FLAMETRAP] = [
		"Flame Trap",
		"Max Lv.: 5",
		"^777777Learning Conditions: Solid Trap Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Trap^000000",
		"Target: ^7777771 Ground cell^000000",
		"Recovery: ^0054FF3 - 4 AP^000000",
		"Details: ^777777Set up a trap on a ground cell that periodically inflicts Fire Melee Physical damage for its duration.",
		"This trap also creates a chance of Arson.",
		"Its attack intervals decrease and duration increases, depending on the skill level.",
		"Consumes 2 Special Alloy Traps.",
		"This skill additionally increases damage, depending on your Base Level and CON.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777250% of ATK, Trap Duration: 12 sec.^000000",
		"[Lv. 2]: ^777777500% of ATK, Trap Duration: 24 sec.^000000",
		"[Lv. 3]: ^777777750% of ATK, Trap Duration: 36 sec.^000000",
		"[Lv. 4]: ^7777771,000% of ATK, Trap Duration: 48 sec.^000000",
		"[Lv. 5]: ^7777771,250% of ATK, Trap Duration: 60 sec.^000000"
	].join("\n");

	SkillDescription[SKID.WH_CRESCIVE_BOLT] = [
		"Crescive Bolt",
		"Max Lv.: 10",
		"^777777Learning Conditions: Aimed Bolt Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF1 AP^000000",
		"Details: ^777777Inflict Long-ranged Physical damage on the target once.",
		"Use this skill without moving to increase your skill damage and SP cost, up to 3 times.",
		"The Damage/SP Cost stacks are canceled if you move or are pushed away from your original spot, or 10 seconds after they're added.",
		"It additionally increases damage, depending on your Base Level and CON.",
		"Consumes 1 equipped arrow.",
		"This skill follows your CRIT to inflict Critical damage.",
		"If it crits, it inflicts half of the total of your Critical Damage Bonus options as damage.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777300% of ATK^000000",
		"[Lv. 2]: ^777777600% of ATK^000000",
		"[Lv. 3]: ^777777900% of ATK^000000",
		"[Lv. 4]: ^7777771,200% of ATK^000000",
		"[Lv. 5]: ^7777771,500% of ATK^000000",
		"[Lv. 6]: ^7777771,800% of ATK^000000",
		"[Lv. 7]: ^7777772,100% of ATK^000000",
		"[Lv. 8]: ^7777772,400% of ATK^000000",
		"[Lv. 9]: ^7777772,700% of ATK^000000",
		"[Lv. 10]: ^7777773,000% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.TR_STAGE_MANNER] = [
		"Stage Etiquette",
		"Max Lv.: 5",
		"Class: ^993300Passive^000000",
		"Details: ^777777Increase AP gain through your Troubadour/Trouvere Attack skills and improve certain Performance skills.",
		"Instruments, Bows, and Whips increase P. ATK and S. MATK.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777P.ATK/S.MATK +3^000000",
		"[Lv. 2]: ^777777P.ATK/S.MATK +6^000000",
		"[Lv. 3]: ^777777P.ATK/S.MATK +9^000000",
		"[Lv. 4]: ^777777P.ATK/S.MATK +12^000000",
		"[Lv. 5]: ^777777P.ATK/S.MATK +15^000000"
	].join("\n");

	SkillDescription[SKID.TR_RETROSPECTION] = [
		"Retrospection",
		"Max Lv.: 1",
		"^777777Learning Conditions: Stage Etiquette Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Support^000000",
		"Target: ^777777Self^000000",
		"Details: ^777777Cast again the last Song skill you've used.",
		"The recast skill consumes 30% less SP and gains 1.5 times the AP.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Recast the latest Song skill you've used.^000000"
	].join("\n");

	SkillDescription[SKID.TR_MYSTIC_SYMPHONY] = [
		"Mystic Symphony",
		"Max Lv.: 1",
		"^777777Learning Conditions: Metallic Fury Lv. 1 and Rose Blossom Lv. 5^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777Self^000000",
		"Cost: ^FF0000100 AP^000000",
		"Details: ^777777An Instrument, Bow, and Whip skill.",
		"Cast a buff that increases your Sound Blend, Rhythm Shooting, and Rose Blossom damage by 40% for 60 seconds.",
		"This skill also increases your Physical/Magic damage on Fish and Demi-Human enemies for its duration.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Increase Sound Blend/Rhythm Shooting/Rose Blossom damage^000000"
	].join("\n");

	SkillDescription[SKID.TR_KVASIR_SONATA] = [
		"Kvasir Sonata",
		"Max Lv.: 1",
		"^777777Learning Conditions: Loki Capriccio Lv. 1 and Nifflheim Requiem Lv. 1^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777Self^000000",
		"Cost: ^FF0000100 AP^000000",
		"Details: ^777777An Instrument, Bow, and Whip skill.",
		"You can use any Ensemble skills by yourself for 60 seconds.",
		"Requires a party.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Use Ensemble skills by yourself.^000000"
	].join("\n");

	SkillDescription[SKID.TR_ROSEBLOSSOM] = [
		"Rose Blossom",
		"Max Lv.: 5",
		"^777777Learning Conditions: Rhythm Shooting Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF5 AP^000000",
		"Details: ^777777An Instrument, Bow, and Whip skill.",
		"Shoot a flower seed along with an arrow at a target, inflicting great Long-ranged Physical damage.",
		"After a while, a flower blooms from the target, additionally inflicting Long-ranged Physical damage on and around it.",
		"This skill additionally increases damage, depending on your Base Level.",
		"Learn Stage Etiquette to further increase damage based on your CON.",
		"Consumes 1 equipped arrow.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777500% of ATK, AoE Range: 3 x3 cells^000000",
		"[Lv. 2]: ^7777771,000% of ATK, AoE Range: 3 x3 cells^000000",
		"[Lv. 3]: ^7777771,500% of ATK, AoE Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777772,000% of ATK, AoE Range: 5 x5 cells^000000",
		"[Lv. 5]: ^7777772,500% of ATK, AoE Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.TR_RHYTHMSHOOTING] = [
		"Rhythm Shooting",
		"Max Lv.: 5",
		"Class: ^993300Active^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF1 AP (Lv. 1 - 3)/2 AP (Lv. 4 - 5)^000000",
		"Details: ^777777An Instrument, Bow, and Whip skill.",
		"Throw an arrow at a target, inflicting Long-ranged Physical damage 3 times.",
		"This skill additionally increases damage, depending on your Base Level.",
		"Learn Stage Etiquette to further increase damage based on your CON.",
		"Consumes 1 equipped arrow.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777120% of ATK^000000",
		"[Lv. 2]: ^777777240% of ATK^000000",
		"[Lv. 3]: ^777777360% of ATK^000000",
		"[Lv. 4]: ^777777480% of ATK^000000",
		"[Lv. 5]: ^777777600% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.TR_METALIC_FURY] = [
		"Metallic Fury",
		"Max Lv.: 5",
		"^777777Learning Conditions: Sound Blend Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF4 AP (Lv. 1 - 3)/5 AP (Lv. 4 - 5)^000000",
		"Details: ^777777An Instrument/Whip skill.",
		"Shoot an arrow at a target that inflates and explodes.",
		"This skill inflicts additional damage on Sound Brand targets.",
		"This additional damage is applied to up to 5 Sound Brands. The explosion property depends on the arrow's.",
		"This skill additionally increases damage, depending on your Base Level and SPL.",
		"Consumes 1 equipped arrow.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777600% of MATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 2]: ^7777771,200% of MATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 3]: ^7777771,800% of MATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777772,400% of MATK, Effective Range: 7 x7 cells^000000",
		"[Lv. 5]: ^7777773,000% of MATK, Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.TR_SOUNDBLEND] = [
		"Sound Blend",
		"Max Lv.: 5",
		"^777777Learning Conditions: Metallic Sound Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF2 AP (Lv. 1 - 3)/3 AP (Lv. 4 - 5)^000000",
		"Details: ^777777An Instrument/Whip skill.",
		"Add a Sound Brand to the target, inflicting Magic damage.",
		"The Sound Brand lasts longer at higher skill levels.",
		"It attacks once before it explodes, and its property depends on the arrow you used.",
		"Sound Brand targets receive more damage from Reverberation, Metallic Sound, Rose Blossom, and Rhythm Shooting.",
		"This skill additionally increases damage, depending on your Base Level and SPL.",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777120% of MATK, Duration: 10 sec.^000000",
		"[Lv. 2]: ^777777240% of MATK, Duration: 10 sec.^000000",
		"[Lv. 3]: ^777777360% of MATK, Duration: 15 sec.^000000",
		"[Lv. 4]: ^777777480% of MATK, Duration: 15 sec.^000000",
		"[Lv. 5]: ^777777600% of MATK, Duration: 20 sec.^000000"
	].join("\n");

	SkillDescription[SKID.TR_GEF_NOCTURN] = [
		"Geffenia Nocturne",
		"Max Lv.: 5",
		"^777777Learning Conditions: Stage Etiquette Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Debuff^000000",
		"Target: ^777777Enemies within range^000000",
		"Recovery: ^0054FF20 AP^000000",
		"Details: ^777777An Instrument/Whip skill.",
		"Create a chance of decreasing Magic Resistance for 30 seconds for Normal monsters and enemy players within range.",
		"This skill's effect improves if a partner in your party is within your screen.",
		"Consumes 1 Throat Lozenge.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Decrease Magic Resistance, Effective Range: 15 x15 cells^000000",
		"[Lv. 2]: ^777777Decrease Magic Resistance, Effective Range: 15 x15 cells^000000",
		"[Lv. 3]: ^777777Decrease Magic Resistance, Effective Range: 17 x17 cells^000000",
		"[Lv. 4]: ^777777Decrease Magic Resistance, Effective Range: 21 x21 cells^000000",
		"[Lv. 5]: ^777777Decrease Magic Resistance, Effective Range: 23 x23 cells^000000"
	].join("\n");

	SkillDescription[SKID.TR_ROKI_CAPRICCIO] = [
		"Loki Capriccio",
		"Max Lv.: 5",
		"^777777Learning Conditions: Jawaii Serenade Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Debuff^000000",
		"Target: ^777777Enemy players within range^000000",
		"Recovery: ^0054FF20 AP^000000",
		"Details: ^777777An Instrument/Whip skill.",
		"Create a chance of Misfortune and Confusion on enemy players within range.",
		"This skill's effect improves if a partner in your party is within your screen.",
		"For PvP only.",
		"Consumes 1 Throat Lozenge.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Misfortune and Confusion, Effective Range: 15 x15 cells^000000",
		"[Lv. 2]: ^777777Misfortune and Confusion, Effective Range: 15 x15 cells^000000",
		"[Lv. 3]: ^777777Misfortune and Confusion, Effective Range: 17 x17 cells^000000",
		"[Lv. 4]: ^777777Misfortune and Confusion, Effective Range: 21 x21 cells^000000",
		"[Lv. 5]: ^777777Misfortune and Confusion, Effective Range: 23 x23 cells^000000"
	].join("\n");

	SkillDescription[SKID.TR_AIN_RHAPSODY] = [
		"Miner Rhapsody",
		"Max Lv.: 5",
		"^777777Learning Conditions: Stage Etiquette Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Debuff^000000",
		"Target: ^777777Enemies within range^000000",
		"Recovery: ^0054FF20 AP^000000",
		"Details: ^777777An Instrument/Whip skill.",
		"Create a chance of decreasing Physical Resistance for 30 seconds for Normal monsters and enemy players within range.",
		"This skill's effect improves if a partner in your party is within your screen.",
		"Consumes 1 Throat Lozenge.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Decrease Physical Resistance, Effective Range: 15 x15 cells^000000",
		"[Lv. 2]: ^777777Decrease Physical Resistance, Effective Range: 15 x15 cells^000000",
		"[Lv. 3]: ^777777Decrease Physical Resistance, Effective Range: 17 x17 cells^000000",
		"[Lv. 4]: ^777777Decrease Physical Resistance, Effective Range: 21 x21 cells^000000",
		"[Lv. 5]: ^777777Decrease Physical Resistance, Effective Range: 23 x23 cells^000000"
	].join("\n");

	SkillDescription[SKID.TR_MUSICAL_INTERLUDE] = [
		"Musical Interlude",
		"Max Lv.: 5",
		"^777777Learning Conditions: Miner Rhapsody Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777You and party members^000000",
		"Recovery: ^0054FF10 AP^000000",
		"Details: ^777777An Instrument/Whip skill.",
		"Increase Physical Resistance for 180 seconds for you and surrounding party members.",
		"This skill's effect improves if a partner in your party is within your screen.",
		"Consumes 1 Throat Lozenge.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Physical Resistance +10, Effective Range: 15 x15 cells^000000",
		"[Lv. 2]: ^777777Physical Resistance +15, Effective Range: 15 x15 cells^000000",
		"[Lv. 3]: ^777777Physical Resistance +20, Effective Range: 17 x17 cells^000000",
		"[Lv. 4]: ^777777Physical Resistance +25, Effective Range: 21 x21 cells^000000",
		"[Lv. 5]: ^777777Physical Resistance +30, Effective Range: 23 x23 cells^000000"
	].join("\n");

	SkillDescription[SKID.TR_JAWAII_SERENADE] = [
		"Jawaii Serenade",
		"Max Lv.: 5",
		"^777777Learning Conditions: Geffenia Nocturne Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777You and party members^000000",
		"Recovery: ^0054FF10 AP^000000",
		"Details: ^777777An Instrument/Whip skill.",
		"Increase S. MATK and MSPD for 180 seconds for you and surrounding party members.",
		"This skill's effect improves if a partner in your party is within your screen.",
		"Consumes 1 Throat Lozenge.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777S.MATK +3, Effective Range: 15 x15 cells^000000",
		"[Lv. 2]: ^777777S.MATK +6, Effective Range: 15 x15 cells^000000",
		"[Lv. 3]: ^777777S.MATK +9, Effective Range: 17 x17 cells^000000",
		"[Lv. 4]: ^777777S.MATK +12, Effective Range: 21 x21 cells^000000",
		"[Lv. 5]: ^777777S.MATK +15, Effective Range: 23 x23 cells^000000"
	].join("\n");

	SkillDescription[SKID.TR_NIPELHEIM_REQUIEM] = [
		"Nifflheim Requiem",
		"Max Lv.: 5",
		"^777777Learning Conditions: Musical Interlude Lv. 1 and Prontera March Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Debuff^000000",
		"Target: ^777777Enemy players within range^000000",
		"Recovery: ^0054FF20 AP^000000",
		"Details: ^777777An Instrument/Whip skill.",
		"Create a chance of Depression and Curse on enemy players within range.",
		"This skill's effect improves if a partner in your party is within your screen.",
		"For PvP only.",
		"Consumes 1 Throat Lozenge.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Depression and Curse, Effective Range: 15 x15 cells^000000",
		"[Lv. 2]: ^777777Depression and Curse, Effective Range: 15 x15 cells^000000",
		"[Lv. 3]: ^777777Depression and Curse, Effective Range: 17 x17 cells^000000",
		"[Lv. 4]: ^777777Depression and Curse, Effective Range: 21 x21 cells^000000",
		"[Lv. 5]: ^777777Depression and Curse, Effective Range: 23 x23 cells^000000"
	].join("\n");

	SkillDescription[SKID.TR_PRON_MARCH] = [
		"Prontera March",
		"Max Lv.: 5",
		"^777777Learning Conditions: Miner Rhapsody Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777You and party members^000000",
		"Recovery: ^0054FF10 AP^000000",
		"Details: ^777777An Instrument/Whip skill.",
		"Increase P.ATK and MSPD for 180 seconds for you and surrounding party members.",
		"This skill's effect improves if a partner in your party is within your screen.",
		"Consumes 1 Throat Lozenge.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777P.ATK +3, Effective Range: 15 x15 cells^000000",
		"[Lv. 2]: ^777777P.ATK +6, Effective Range: 15 x15 cells^000000",
		"[Lv. 3]: ^777777P.ATK +9, Effective Range: 17 x17 cells^000000",
		"[Lv. 4]: ^777777P.ATK +12, Effective Range: 21 x21 cells^000000",
		"[Lv. 5]: ^777777P.ATK +15, Effective Range: 23 x23 cells^000000"
	].join("\n");

	SkillDescription[SKID.ABC_DAGGER_AND_BOW_M] = [
		"Dagger Bow Mastery",
		"Max Lv.: 10",
		"Class: ^993300Passive^000000",
		"Details: ^777777Daggers and Bows increase Physical damage on enemies, depending on their size.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Small +1%, Medium +2%, Large +2%^000000",
		"[Lv. 2]: ^777777Small +2%, Medium +3%, Large +4%^000000",
		"[Lv. 3]: ^777777Small +3%, Medium +5%, Large +6%^000000",
		"[Lv. 4]: ^777777Small +4%, Medium +6%, Large +8%^000000",
		"[Lv. 5]: ^777777Small +5%, Medium +8%, Large +10%^000000",
		"[Lv. 6]: ^777777Small +6%, Medium +9%, Large +12%^000000",
		"[Lv. 7]: ^777777Small +7%, Medium +11%, Large +14%^000000",
		"[Lv. 8]: ^777777Small +8%, Medium +12%, Large +16%^000000",
		"[Lv. 9]: ^777777Small +9%, Medium +14%, Large +18%^000000",
		"[Lv. 10]: ^777777Small +10%, Medium +15%, Large +20%^000000"
	].join("\n");

	SkillDescription[SKID.ABC_MAGIC_SWORD_M] = [
		"Magic Sword Mastery",
		"Max Lv.: 10",
		"^777777Learning Conditions: Reproduce Lv. 5 and Shadow Spell Lv. 5^000000",
		"Class: ^993300Passive^000000",
		"Details: ^777777Daggers and One-handed Swords increase Magic damage on enemies, depending on their size.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Small +2%, Medium +2%, Large +2%^000000",
		"[Lv. 2]: ^777777Small +3%, Medium +3%, Large +3%^000000",
		"[Lv. 3]: ^777777Small +5%, Medium +5%, Large +5%^000000",
		"[Lv. 4]: ^777777Small +6%, Medium +6%, Large +6%^000000",
		"[Lv. 5]: ^777777Small +8%, Medium +8%, Large +8%^000000",
		"[Lv. 6]: ^777777Small +9%, Medium +9%, Large +9%^000000",
		"[Lv. 7]: ^777777Small +11%, Medium +11%, Large +11%^000000",
		"[Lv. 8]: ^777777Small +12%, Medium +12%, Large +12%^000000",
		"[Lv. 9]: ^777777Small +14%, Medium +14%, Large +14%^000000",
		"[Lv. 10]: ^777777Small +15%, Medium +15%, Large +15%^000000"
	].join("\n");

	SkillDescription[SKID.ABC_STRIP_SHADOW] = [
		"Divest Shadow",
		"Max Lv.: 5",
		"^777777Learning Conditions: Divest Accessory Lv. 1 and Dagger Bow Mastery Lv. 7^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Debuff^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777Remove all Shadow equipment from the target and prevent reequipping for a while.",
		"In the case of monsters, this skill decreases their Physical and Magical Resistances.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Divest Chance: 20%, Duration: 60 sec.^000000",
		"[Lv. 2]: ^777777Divest Chance: 25%, Duration: 70 sec.^000000",
		"[Lv. 3]: ^777777Divest Chance: 30%, Duration: 80 sec.^000000",
		"[Lv. 4]: ^777777Divest Chance: 35%, Duration: 90 sec.^000000",
		"[Lv. 5]: ^777777Divest Chance: 40%, Duration: 100 sec.^000000"
	].join("\n");

	SkillDescription[SKID.ABC_ABYSS_DAGGER] = [
		"Abyss Dagger",
		"Max Lv.: 5",
		"^777777Learning Conditions: Fatal Menace Lv. 5 and Dagger Bow Mastery Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^777777Self^000000",
		"Details: ^777777A Dagger/One-handed Sword skill.",
		"Inflict Melee Physical damage in 5 x5 cells around you and increase your Fatal Menace damage.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777550% of ATK, Fatal Menace Damage Bonus: 2 sec.^000000",
		"[Lv. 2]: ^7777771,100% of ATK, Fatal Menace Damage Bonus: 4 sec.^000000",
		"[Lv. 3]: ^7777771,650% of ATK, Fatal Menace Damage Bonus: 6 sec.^000000",
		"[Lv. 4]: ^7777772,200% of ATK, Fatal Menace Damage Bonus: 8 sec.^000000",
		"[Lv. 5]: ^7777772,750% of ATK, Fatal Menace Damage Bonus: 10 sec.^000000"
	].join("\n");

	SkillDescription[SKID.ABC_UNLUCKY_RUSH] = [
		"Misfortune Rush",
		"Max Lv.: 5",
		"^777777Learning Conditions: Abyss Dagger Lv. 3 and Dagger Bow Mastery Lv. 4^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777Instantly move to the target, inflicting Melee Physical damage with a chance of Misfortune.",
		"This skill additionally increases damage, depending on your Base Level and CRT.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777500% of ATK, Misfortune Chance: 40%^000000",
		"[Lv. 2]: ^7777771,000% of ATK, Misfortune Chance: 50%^000000",
		"[Lv. 3]: ^7777771,500% of ATK, Misfortune Chance: 60%^000000",
		"[Lv. 4]: ^7777772,000% of ATK, Misfortune Chance: 70%^000000",
		"[Lv. 5]: ^7777772,500% of ATK, Misfortune Chance: 80%^000000"
	].join("\n");

	SkillDescription[SKID.ABC_CHAIN_REACTION_SHOT] = [
		"Chain Reaction Shot",
		"Max Lv.: 5",
		"^777777Learning Conditions: Triangle Shot Lv. 5 and Dagger Bow Mastery Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777A Bow skill.",
		"Using 7 equipped arrows, inflict Long-ranged Physical damage on and around a target.",
		"You must have at least 8 arrows to activate this skill.",
		"The targets additionally inflict Long-ranged Physical damage around them.",
		"It additionally increases damage, depending on your Base Level and CON.",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777600% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^7777771,200% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^7777771,800% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777772,400% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^7777773,000% of ATK, Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.ABC_FROM_THE_ABYSS] = [
		"From the Abyss",
		"Max Lv.: 5",
		"^777777Learning Conditions: Magic Sword Mastery Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777Self^000000",
		"Details: ^777777Temporarily control orbs imbued with the power of the Abyss.",
		"This skill instantly creates 5 Abyss Orbs,",
		"and Normal Physical attacks create a chance of consuming 1 Abyss Orb and inflicting Neutral Magic damage on a target and others in 7 x7 cells.",
		"Abyss Orbs are regenerated at regular intervals.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777220% of MATK, Duration: 30 sec., Orb Intervals: 10 sec.^000000",
		"[Lv. 2]: ^777777290% of MATK, Duration: 60 sec., Orb Intervals: 8 sec.^000000",
		"[Lv. 3]: ^777777360% of MATK, Duration: 90 sec., Orb Intervals: 6 sec.^000000",
		"[Lv. 4]: ^777777430% of MATK, Duration: 120 sec., Orb Intervals: 4 sec.^000000",
		"[Lv. 5]: ^777777500% of MATK, Duration: 150 sec., Orb Intervals: 2 sec.^000000"
	].join("\n");

	SkillDescription[SKID.ABC_ABYSS_SLAYER] = [
		"Abyss Slayer",
		"Max Lv.: 10",
		"^777777Learning Conditions: Abyss Dagger Lv. 5 and Deft Stab Lv. 5^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777Self^000000",
		"Cost: ^FF0000150 AP^000000",
		"Details: ^777777Accept the power of the Abyss into your body",
		"to significantly improve your physical abilities.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777P.MATK/S.MATK +12, HIT +120^000000",
		"[Lv. 2]: ^777777P.MATK/S.MATK +14, HIT +140^000000",
		"[Lv. 3]: ^777777P.MATK/S.MATK +16, HIT +160^000000",
		"[Lv. 4]: ^777777P.MATK/S.MATK +18, HIT +180^000000",
		"[Lv. 5]: ^777777P.MATK/S.MATK +20, HIT +200^000000",
		"[Lv. 6]: ^777777P.MATK/S.MATK +22, HIT +220^000000",
		"[Lv. 7]: ^777777P.MATK/S.MATK +24, HIT +240^000000",
		"[Lv. 8]: ^777777P.MATK/S.MATK +26, HIT +260^000000",
		"[Lv. 9]: ^777777P.MATK/S.MATK +28, HIT +280^000000",
		"[Lv. 10]: ^777777P.MATK/S.MATK +30, HIT +300^000000"
	].join("\n");

	SkillDescription[SKID.ABC_ABYSS_STRIKE] = [
		"Omega Abyss Strike",
		"Max Lv.: 10",
		"^777777Learning Conditions: From the Abyss Square Lv. 3 and Abyss Square Lv. 3^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Ground cell^000000",
		"Cost: ^FF0000150 AP^000000",
		"Details: ^777777Drop a massive meteor onto the ground, inflicting Neutral Magic damage in 9 x9 cells.",
		"This skill inflicts more damage on Angel and Demon enemies.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777600% of MATK (1,150% on Angel/Demon)^000000",
		"[Lv. 2]: ^7777771,200% of MATK (2,300% on Angel/Demon)^000000",
		"[Lv. 3]: ^7777771,800% of MATK (3,450% on Angel/Demon)^000000",
		"[Lv. 4]: ^7777772,400% of MATK (4,600% on Angel/Demon)^000000",
		"[Lv. 5]: ^7777773,000% of MATK (5,750% on Angel/Demon)^000000",
		"[Lv. 6]: ^7777773,600% of MATK (6,900% on Angel/Demon)^000000",
		"[Lv. 7]: ^7777774,200% of MATK (8,050% on Angel/Demon)^000000",
		"[Lv. 8]: ^7777774,800% of MATK (9,200% on Angel/Demon)^000000",
		"[Lv. 9]: ^7777775,400% of MATK (10,350% on Angel/Demon)^000000",
		"[Lv. 10]: ^7777776,000% of MATK (11,500% on Angel/Demon)^000000"
	].join("\n");

	SkillDescription[SKID.ABC_DEFT_STAB] = [
		"Deft Stab",
		"Max Lv.: 10",
		"^777777Learning Conditions: Abyss Dagger Lv. 3 and Dagger Bow Mastery Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF2 AP^000000",
		"Details: ^777777Quickly attack the target and others around it, inflicting Melee Physical damage.",
		"This skill creates a chance of attacking one more time, and this chance increases with every new skill level.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777360% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^777777720% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^7777771,080% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 4]: ^7777771,440% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 5]: ^7777771,800% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 6]: ^7777772,160% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 7]: ^7777772,520% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 8]: ^7777772,880% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 9]: ^7777773,240% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 10]: ^7777773,600% of ATK, Effective Range: 5 x5 cells^000000"
	].join("\n");

	SkillDescription[SKID.ABC_ABYSS_SQUARE] = [
		"Abyss Square",
		"Max Lv.: 5",
		"^777777Learning Conditions: From the Abyss Square Lv. 1 and Magic Sword Mastery Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Ground cell^000000",
		"Recovery: ^0054FF4 AP^000000",
		"Details: ^777777Awaken the Abyss and inflict Neutral Magic damage in 7 x7 cells on the ground.",
		"Stay within this skill's range to inflict damage twice with each hit.",
		"This skill additionally increases damage, depending on your Base Level and SPL.",
		"From the Abyss creates a chance of auto-casting Abyss Square with Normal Physical attacks.",
		"The auto-cast Abyss Square is activated at your current Abyss Square level without consuming AP.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777140% of MATK^000000",
		"[Lv. 2]: ^777777280% of MATK^000000",
		"[Lv. 3]: ^777777420% of MATK^000000",
		"[Lv. 4]: ^777777560% of MATK^000000",
		"[Lv. 5]: ^777777700% of MATK^000000"
	].join("\n");

	SkillDescription[SKID.ABC_FRENZY_SHOT] = [
		"Frenzy Shot",
		"Max Lv.: 10",
		"^777777Learning Conditions: Chain Reaction Shot Lv. 3 and Dagger Bow Mastery Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Long-ranged Physical^000000",
		"Target: ^7777771 Target^000000",
		"Recovery: ^0054FF2 AP^000000",
		"Details: ^777777A Bow skill.",
		"Inflict Long-ranged Physical damage on the target.",
		"This skill creates a chance of casting its effect one more time.",
		"It additionally increases damage, depending on your Base Level and CON.",
		"Consumes 10 equipped arrows.",
		"This skill follows your CRIT to inflict Critical damage.",
		"If it crits, it inflicts half of the total of your Critical Damage Bonus options as damage.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777350% of ATK^000000",
		"[Lv. 2]: ^777777700% of ATK^000000",
		"[Lv. 3]: ^7777771,050% of ATK^000000",
		"[Lv. 4]: ^7777771,400% of ATK^000000",
		"[Lv. 5]: ^7777771,750% of ATK^000000",
		"[Lv. 6]: ^7777772,100% of ATK^000000",
		"[Lv. 7]: ^7777772,450% of ATK^000000",
		"[Lv. 8]: ^7777772,800% of ATK^000000",
		"[Lv. 9]: ^7777773,150% of ATK^000000",
		"[Lv. 10]: ^7777773,500% of ATK^000000"
	].join("\n");

	SkillDescription[SKID.MT_ABR_M] = [
		"ABR Mastery",
		"Max Lv.: 10",
		"^777777Learning Conditions: Manufacture Machine Lv. 1^000000",
		"Class: ^993300Passive^000000",
		"Details: ^777777Improve your summoned ABR (Automatic Battle Robot).^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Improved ABR Stats (ATK +700, MHP: 2,000, DEF: 20, MDEF: 4, FLEE: 10)^000000",
		"[Lv. 2]: ^777777Improved ABR Stats (ATK +900, MHP: 4,000, DEF: 40, MDEF: 8, FLEE: 20)^000000",
		"[Lv. 3]: ^777777Improved ABR Stats (ATK +1,100, MHP: 6,000, DEF: 60, MDEF: 12, FLEE: 30)^000000",
		"[Lv. 4]: ^777777Improved ABR Stats (ATK +1,300, MHP: 8,000, DEF: 80, MDEF: 16, FLEE: 40)^000000",
		"[Lv. 5]: ^777777Improved ABR Stats (ATK +1,500, MHP: 10,000, DEF: 100, MDEF: 20, FLEE: 50)^000000",
		"[Lv. 6]: ^777777Improved ABR Stats (ATK +1,700, MHP: 12,000, DEF: 120, MDEF: 24, FLEE: 60)^000000",
		"[Lv. 7]: ^777777Improved ABR Stats (ATK +1,900, MHP: 14,000, DEF: 140, MDEF: 28, FLEE: 70)^000000",
		"[Lv. 8]: ^777777Improved ABR Stats (ATK +2,100, MHP: 16,000, DEF: 160, MDEF: 32, FLEE: 80)^000000",
		"[Lv. 9]: ^777777Improved ABR Stats (ATK +2,300, MHP: 18,000, DEF: 180, MDEF: 36, FLEE: 90)^000000",
		"[Lv. 10]: ^777777Improved ABR Stats (ATK +2,500, MHP: 20,000, DEF: 200, MDEF: 40, FLEE: 100)^000000"
	].join("\n");

	SkillDescription[SKID.MT_SUMMON_ABR_DUAL_CANNON] = [
		"ABR: Dual Cannon",
		"Max Lv.: 4",
		"^777777Learning Conditions: ABR Mastery Lv. 3 and ABR: Battle Warrior Lv. 2^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Summon^000000",
		"Target: ^777777Self^000000",
		"Recovery: ^0054FF20 AP^000000",
		"Details: ^777777Consumes 1 ABR Capsule. Summon the support ABR, Dual Cannon.",
		"Dual Cannon's stats increase, depending on your stats and ABR Mastery level.",
		"While Dual Cannon is summoned, Knuckle Boost, Vulcan Arm, and Arm Cannon attack twice.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 120 sec.^000000",
		"[Lv. 2]: ^777777Duration: 180 sec.^000000",
		"[Lv. 3]: ^777777Duration: 240 sec.^000000",
		"[Lv. 4]: ^777777Duration: 300 sec.^000000"
	].join("\n");

	SkillDescription[SKID.MT_SUMMON_ABR_MOTHER_NET] = [
		"ABR: Mother Net",
		"Max Lv.: 4",
		"^777777Learning Conditions: ABR Mastery Lv. 5, ABR: Battle Warrior Lv. 3, and ABR: Dual Cannon Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Summon^000000",
		"Target: ^777777Self^000000",
		"Recovery: ^0054FF20 AP^000000",
		"Details: ^777777Consumes 1 ABR Capsule. Summon the support ABR, Mother Net.",
		"Mother Net's stats increase, depending on your stats and ABR Mastery level.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 120 sec.^000000",
		"[Lv. 2]: ^777777Duration: 180 sec.^000000",
		"[Lv. 3]: ^777777Duration: 240 sec.^000000",
		"[Lv. 4]: ^777777Duration: 300 sec.^000000"
	].join("\n");

	SkillDescription[SKID.MT_SUMMON_ABR_BATTLE_WARIOR] = [
		"ABR: Battle Warrior",
		"Max Lv.: 4",
		"^777777Learning Conditions: ABR Mastery Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Summon^000000",
		"Target: ^777777Self^000000",
		"Recovery: ^0054FF20 AP^000000",
		"Details: ^777777Consumes 1 ABR Capsule. Summon the combat support ABR, Battle Warrior.",
		"Battle Warrior's stats increase, depending on your stats and ABR Mastery level.",
		"While Battle Warrior is summoned, Power Swing damage increases. (It inflicts damage once, but displays the damage in 2 parts.)^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 120 sec.^000000",
		"[Lv. 2]: ^777777Duration: 180 sec.^000000",
		"[Lv. 3]: ^777777Duration: 240 sec.^000000",
		"[Lv. 4]: ^777777Duration: 300 sec.^000000"
	].join("\n");

	SkillDescription[SKID.MT_SUMMON_ABR_INFINITY] = [
		"ABR: Infinity",
		"Max Lv.: 4",
		"^777777Learning Conditions: ABR Mastery Lv. 10, ABR: Battle Warrior Lv. 4, ABR: Dual Cannon Lv. 4, and ABR: Mother Net Lv. 4^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Summon^000000",
		"Target: ^777777Self^000000",
		"Cost: ^FF0000200 AP^000000",
		"Details: ^777777Consumes 5 ABR Capsules. Summon the combat support ABR, Infinity.",
		"Infinity's stats increase, depending on your stats and ABR Mastery level.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 120 sec.^000000",
		"[Lv. 2]: ^777777Duration: 180 sec.^000000",
		"[Lv. 3]: ^777777Duration: 240 sec.^000000",
		"[Lv. 4]: ^777777Duration: 300 sec.^000000"
	].join("\n");

	SkillDescription[SKID.MT_A_MACHINE] = [
		"Activate Attack Device",
		"Max Lv.: 5",
		"^777777Learning Conditions: Manufacture Machine Lv. 3 and Axe Stomp Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777You and party members^000000",
		"Details: ^777777Consumes 1 Device Capsule. Add a device to an ally that temporarily attacks enemies around them.",
		"This device inflicts Melee Physical damage every second.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Effective Range: 3 x3 cells, Duration: 80 sec.^000000",
		"[Lv. 2]: ^777777Effective Range: 3 x3 cells, Duration: 120 sec.^000000",
		"[Lv. 3]: ^777777Effective Range: 5 x5 cells, Duration: 160 sec.^000000",
		"[Lv. 4]: ^777777Effective Range: 5 x5 cells, Duration: 200 sec.^000000",
		"[Lv. 5]: ^777777Effective Range: 7 x7 cells, Duration: 240 sec.^000000"
	].join("\n");

	SkillDescription[SKID.MT_D_MACHINE] = [
		"Activate Defense Device",
		"Max Lv.: 5",
		"^777777Learning Conditions: Manufacture Machine Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777You and party members^000000",
		"Details: ^777777Consumes 1 Device Capsule. Add a device to an ally that temporarily increases their DEF and Physical Resistance.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777DEF +250, RES +20, Duration: 80 sec.^000000",
		"[Lv. 2]: ^777777DEF +300, RES +40, Duration: 120 sec.^000000",
		"[Lv. 3]: ^777777DEF +350, RES +60, Duration: 160 sec.^000000",
		"[Lv. 4]: ^777777DEF +400, RES +80, Duration: 200 sec.^000000",
		"[Lv. 5]: ^777777DEF +450, RES +100, Duration: 240 sec.^000000"
	].join("\n");

	SkillDescription[SKID.MT_M_MACHINE] = [
		"Manufacture Machine",
		"Max Lv.: 5",
		"Class: ^993300Active^000000",
		"Type: ^777777Crafting^000000",
		"Target: ^777777You and party members^000000",
		"Details: ^777777Create various devices for your skills.",
		"Requires a Machine Creation Guide.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Max Crafting Count: 8^000000",
		"[Lv. 2]: ^777777Max Crafting Count: 9^000000",
		"[Lv. 3]: ^777777Max Crafting Count: 10^000000",
		"[Lv. 4]: ^777777Max Crafting Count: 11^000000",
		"[Lv. 5]: ^777777Max Crafting Count: 12^000000"
	].join("\n");

	SkillDescription[SKID.MT_RUSH_QUAKE] = [
		"Rush Quake",
		"Max Lv.: 10",
		"^777777Learning Conditions: Axe Stomp Lv. 5^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^7777771 Target^000000",
		"Cost: ^FF0000150 AP^000000",
		"Details: ^777777Approach a target within 9 cells and inflict Melee Physical damage on and around it.",
		"This skill inflicts more damage on Formless and Insect enemies.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777750% of ATK (1,100% on Formless/Insect), Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^7777771,500% of ATK (2,200% on Formless/Insect), Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^7777772,250% of ATK (3,300% on Formless/Insect), Effective Range: 3 x3 cells^000000",
		"[Lv. 4]: ^7777773,000% of ATK (4,400% on Formless/Insect), Effective Range: 3 x3 cells^000000",
		"[Lv. 5]: ^7777773,750% of ATK (5,500% on Formless/Insect), Effective Range: 5 x5 cells^000000",
		"[Lv. 6]: ^7777774,500% of ATK (6,600% on Formless/Insect), Effective Range: 5 x5 cells^000000",
		"[Lv. 7]: ^7777775,250% of ATK (7,700% on Formless/Insect), Effective Range: 5 x5 cells^000000",
		"[Lv. 8]: ^7777776,000% of ATK (8,800% on Formless/Insect), Effective Range: 5 x5 cells^000000",
		"[Lv. 9]: ^7777776,750% of ATK (9,900% on Formless/Insect), Effective Range: 7 x7 cells^000000",
		"[Lv. 10]: ^7777777,500% of ATK (11,000% on Formless/Insect), Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.MT_AXE_STOMP] = [
		"Axe Stomp",
		"Max Lv.: 5",
		"^777777Learning Conditions: Two-handed Axe Defense Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Melee Physical^000000",
		"Target: ^777777Enemies within range^000000",
		"Recovery: ^0054FF2 AP^000000",
		"Details: ^777777An Axe skill.",
		"Slam an axe onto the ground, inflicting Melee Physical damage within range.",
		"Two-handed Axes attack twice. This skill also increases Axe Tornado damage for 5 seconds.",
		"This skill additionally increases damage, depending on your Base Level and POW.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777350% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 2]: ^777777700% of ATK, Effective Range: 3 x3 cells^000000",
		"[Lv. 3]: ^7777771,050% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 4]: ^7777771,400% of ATK, Effective Range: 5 x5 cells^000000",
		"[Lv. 5]: ^7777771,750% of ATK, Effective Range: 7 x7 cells^000000"
	].join("\n");

	SkillDescription[SKID.MT_TWOAXEDEF] = [
		"Two-handed Axe Defense",
		"Max Lv.: 10",
		"Class: ^993300Passive^000000",
		"Details: ^777777Two-handed Axes decrease Physical damage from enemies of all sizes.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Small -1%, Medium -2%, Large -3%^000000",
		"[Lv. 2]: ^777777Small -2%, Medium -3%, Large -5%^000000",
		"[Lv. 3]: ^777777Small -3%, Medium -5%, Large -7%^000000",
		"[Lv. 4]: ^777777Small -4%, Medium -6%, Large -9%^000000",
		"[Lv. 5]: ^777777Small -5%, Medium -8%, Large -10%^000000",
		"[Lv. 6]: ^777777Small -6%, Medium -9%, Large -12%^000000",
		"[Lv. 7]: ^777777Small -7%, Medium -11%, Large -13%^000000",
		"[Lv. 8]: ^777777Small -8%, Medium -12%, Large -15%^000000",
		"[Lv. 9]: ^777777Small -9%, Medium -14%, Large -16%^000000",
		"[Lv. 10]: ^777777Small -10%, Medium -15%, Large -18%^000000"
	].join("\n");

	SkillDescription[SKID.EM_DIAMOND_STORM] = [
		"Diamond Storm",
		"Max Lv.: 5",
		"^777777Learning Conditions: Magic Book Mastery Lv. 2^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Ground cell^000000",
		"Recovery: ^0054FF4 AP^000000",
		"Details: ^777777Summon an ice storm in 9 x9 cells on the ground, inflicting Water Magic damage",
		"with a chance of Rapid Chilling within range.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777700% of MATK, Rapid Chilling Chance: 50%^000000",
		"[Lv. 2]: ^7777771,400% of MATK, Rapid Chilling Chance: 60%^000000",
		"[Lv. 3]: ^7777772,100% of MATK, Rapid Chilling Chance: 70%^000000",
		"[Lv. 4]: ^7777772,800% of MATK, Rapid Chilling Chance: 80%^000000",
		"[Lv. 5]: ^7777773,500% of MATK, Rapid Chilling Chance: 90%^000000"
	].join("\n");

	SkillDescription[SKID.EM_LIGHTNING_LAND] = [
		"Lightning Land",
		"Max Lv.: 5",
		"^777777Learning Conditions: Magic Book Mastery Lv. 2^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Ground cell^000000",
		"Recovery: ^0054FF4 AP^000000",
		"Details: ^777777Summon a lightning storm in 9 x9 cells on the ground for 4 seconds, inflicting Wind Magic damage",
		"with a chance of Torrent within range.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777150% of MATK, Torrent Chance: 20%^000000",
		"[Lv. 2]: ^777777300% of MATK, Torrent Chance: 30%^000000",
		"[Lv. 3]: ^777777450% of MATK, Torrent Chance: 40%^000000",
		"[Lv. 4]: ^777777600% of MATK, Torrent Chance: 50%^000000",
		"[Lv. 5]: ^777777750% of MATK, Torrent Chance: 60%^000000"
	].join("\n");

	SkillDescription[SKID.EM_VENOM_SWAMP] = [
		"Venom Swamp",
		"Max Lv.: 5",
		"^777777Learning Conditions: Magic Book Mastery Lv. 2^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Ground cell^000000",
		"Recovery: ^0054FF4 AP^000000",
		"Details: ^777777Summon a deadly poisonous swamp in 9 x9 cells on the ground for 4 seconds, inflicting Poison Magic damage",
		"with a chance of Strong Poison within range.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777150% of MATK, Strong Poison Chance: 20%^000000",
		"[Lv. 2]: ^777777300% of MATK, Strong Poison Chance: 30%^000000",
		"[Lv. 3]: ^777777450% of MATK, Strong Poison Chance: 40%^000000",
		"[Lv. 4]: ^777777600% of MATK, Strong Poison Chance: 50%^000000",
		"[Lv. 5]: ^777777750% of MATK, Strong Poison Chance: 60%^000000"
	].join("\n");

	SkillDescription[SKID.EM_CONFLAGRATION] = [
		"Conflagration",
		"Max Lv.: 5",
		"^777777Learning Conditions: Magic Book Mastery Lv. 2^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Ground cell^000000",
		"Recovery: ^0054FF4 AP^000000",
		"Details: ^777777Set 9 x9 cells on the ground on fire for 4 seconds, inflicting Fire Magic damage",
		"with a chance of Arson.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777150% of MATK, Arson Chance: 20%^000000",
		"[Lv. 2]: ^777777300% of MATK, Arson Chance: 30%^000000",
		"[Lv. 3]: ^777777450% of MATK, Arson Chance: 40%^000000",
		"[Lv. 4]: ^777777600% of MATK, Arson Chance: 50%^000000",
		"[Lv. 5]: ^777777750% of MATK, Arson Chance: 60%^000000"
	].join("\n");

	SkillDescription[SKID.EM_MAGIC_BOOK_M] = [
		"Magic Book Mastery",
		"Max Lv.: 10",
		"Class: ^993300Passive^000000",
		"Details: ^777777Books increase Magic damage of the following properties: Water, Wind, Earth, Fire, and Poison.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Magic Damage +1% (Water, Wind, Earth, Fire, and Poison)^000000",
		"[Lv. 2]: ^777777Magic Damage +2% (Water, Wind, Earth, Fire, and Poison)^000000",
		"[Lv. 3]: ^777777Magic Damage +3% (Water, Wind, Earth, Fire, and Poison)^000000",
		"[Lv. 4]: ^777777Magic Damage +4% (Water, Wind, Earth, Fire, and Poison)^000000",
		"[Lv. 5]: ^777777Magic Damage +5% (Water, Wind, Earth, Fire, and Poison)^000000",
		"[Lv. 6]: ^777777Magic Damage +6% (Water, Wind, Earth, Fire, and Poison)^000000",
		"[Lv. 7]: ^777777Magic Damage +7% (Water, Wind, Earth, Fire, and Poison)^000000",
		"[Lv. 8]: ^777777Magic Damage +8% (Water, Wind, Earth, Fire, and Poison)^000000",
		"[Lv. 9]: ^777777Magic Damage +9% (Water, Wind, Earth, Fire, and Poison)^000000",
		"[Lv. 10]: ^777777Magic Damage +10% (Water, Wind, Earth, Fire, and Poison)^000000"
	].join("\n");

	SkillDescription[SKID.EM_TERRA_DRIVE] = [
		"Terra Drive",
		"Max Lv.: 5",
		"^777777Learning Conditions: Magic Book Mastery Lv. 2^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Magic^000000",
		"Target: ^7777771 Ground cell^000000",
		"Recovery: ^0054FF4 AP^000000",
		"Details: ^777777Raise the ground in 9 x9 cells, inflicting Earth Magic damage",
		"with a chance of Crystallized within range.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777700% of MATK, Crystallized Chance: 50%^000000",
		"[Lv. 2]: ^7777771,400% of MATK, Crystallized Chance: 60%^000000",
		"[Lv. 3]: ^7777772,100% of MATK, Crystallized Chance: 70%^000000",
		"[Lv. 4]: ^7777772,800% of MATK, Crystallized Chance: 80%^000000",
		"[Lv. 5]: ^7777773,500% of MATK, Crystallized Chance: 90%^000000"
	].join("\n");

	SkillDescription[SKID.EM_SUMMON_ELEMENTAL_DILUVIO] = [
		"Summon Elemental: Diluvio",
		"Max Lv.: 1",
		"^777777Learning Conditions: Call Aqua Lv. 3, Elemental Spirit Mastery Lv. 1, and Diamond Storm Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Summon^000000",
		"Details: ^777777Consumes 1 Ice Stone. Possess a Large Aqua with the higher Water spirit, Diluvio.",
		"Diluvio increases your Water Magic damage (+10%) and Diamond Storm damage.",
		"Diluvio's stats increase, depending on your stats and Elemental Spirit Mastery level.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Spirit Duration: 1,500 sec.^000000"
	].join("\n");

	SkillDescription[SKID.EM_SUMMON_ELEMENTAL_SERPENS] = [
		"Summon Elemental: Serpens",
		"Max Lv.: 1",
		"^777777Learning Conditions: Call Aqua Lv. 3, Call Agni Lv. 3, Call Ventus Lv. 3, Call Terra Lv. 3, Elemental Spirit Mastery Lv. 1, and Venom Swamp Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Summon^000000",
		"Details: ^777777Consumes 1 Poison Stone. Possess a Large spirit with the higher Poison spirit, Serpens.",
		"Requires a Large Agni, Aqua, Ventus, or Terra.",
		"Serpens increases your Poison Magic damage (+10%) and Venom Swamp damage.",
		"Serpens's stats increase, depending on your stats and Elemental Spirit Mastery level.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Spirit Duration: 1,500 sec.^000000"
	].join("\n");

	SkillDescription[SKID.EM_SUMMON_ELEMENTAL_ARDOR] = [
		"Summon Elemental: Ador",
		"Max Lv.: 1",
		"^777777Learning Conditions: Call Agni Lv. 3, Elemental Spirit Mastery Lv. 1, and Conflagration Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Summon^000000",
		"Details: ^777777Consumes 1 Flame Stone. Possess a Large Agni with the higher Fire spirit, Ador.",
		"Ador increases your Fire Magic damage (+10%) and Conflagration damage.",
		"Ador's stats increase, depending on your stats and Elemental Spirit Mastery level.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Spirit Duration: 1,500 sec.^000000"
	].join("\n");

	SkillDescription[SKID.EM_SUMMON_ELEMENTAL_TERREMOTUS] = [
		"Summon Elemental: Terremotus",
		"Max Lv.: 1",
		"^777777Learning Conditions: Call Terra Lv. 3, Elemental Spirit Mastery Lv. 1, and Terra Drive Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Summon^000000",
		"Details: ^777777Consumes 1 Earth Stone. Possess a Large Terra with the higher Earth spirit, Terremotus.",
		"Terremotus increases your Earth Magic damage (+10%) and Terra Drive damage.",
		"Terremotus's stats increase, depending on your stats and Elemental Spirit Mastery level.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Spirit Duration: 1,500 sec.^000000"
	].join("\n");

	SkillDescription[SKID.EM_SUMMON_ELEMENTAL_PROCELLA] = [
		"Summon Elemental: Procella",
		"Max Lv.: 1",
		"^777777Learning Conditions: Call Ventus Lv. 3, Elemental Spirit Mastery Lv. 1, and Lightning Land Lv. 1^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Summon^000000",
		"Details: ^777777Consumes 1 Lightning Stone. Possess a Large Agni with the higher Wind spirit, Procella.",
		"Procella increases your Wind Magic damage (+10%) and Lightning Land damage.",
		"Procella's stats increase, depending on your stats and Elemental Spirit Mastery level.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Spirit Duration: 1,500 sec.^000000"
	].join("\n");

	SkillDescription[SKID.EM_SPELL_ENCHANTING] = [
		"Spell Enchanting",
		"Max Lv.: 5",
		"^777777Learning Conditions: Magic Book Mastery Lv. 5^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Buff^000000",
		"Target: ^777777You and party members^000000",
		"Details: ^777777Cast a buff that temporarily increases its target's S. MATK.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777S.MATK +4, Duration: 80 sec.^000000",
		"[Lv. 2]: ^777777S.MATK +8, Duration: 120 sec.^000000",
		"[Lv. 3]: ^777777S.MATK +12, Duration: 160 sec.^000000",
		"[Lv. 4]: ^777777S.MATK +16, Duration: 200 sec.^000000",
		"[Lv. 5]: ^777777S.MATK +20, Duration: 240 sec.^000000"
	].join("\n");

	SkillDescription[SKID.EM_ACTIVITY_BURN] = [
		"AP Burn",
		"Max Lv.: 5",
		"^777777Learning Conditions: Spell Enchanting Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Special^000000",
		"Target: ^7777771 Target^000000",
		"Details: ^777777Create a chance of decreasing the target's AP.",
		"For PvP and WoE only.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777AP -20, Success Chance: 30%^000000",
		"[Lv. 2]: ^777777AP -30, Success Chance: 40%^000000",
		"[Lv. 3]: ^777777AP -50, Success Chance: 50%^000000",
		"[Lv. 4]: ^777777AP -60, Success Chance: 60%^000000",
		"[Lv. 5]: ^777777AP -70, Success Chance: 70%^000000"
	].join("\n");

	SkillDescription[SKID.EM_ELEMENTAL_BUSTER] = [
		"Elemental Buster",
		"Max Lv.: 10",
		"^777777Learning Conditions: Summon Elemental: Diluvio Lv. 1, Summon Elemental: Ador Lv. 1, Summon Elemental: Procella Lv. 1, Summon Elemental: Terremotus Lv. 1, Summon Elemental: Serpens Lv. 1, and Elemental Spirit Mastery Lv. 5^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Magic^000000",
		"Target: ^777777AoE^000000",
		"Cost: ^FF0000150 AP^000000",
		"Details: ^777777Inflict Magic damage of the same property as your current high spirit on targets in 13 x13 cells.",
		"Requires a high spirit.",
		"This skill inflicts more damage on Dragon and Formless enemies.",
		"It additionally increases damage, depending on your Base Level and SPL.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777480% of MATK (1,100% on Dragon/Formless)^000000",
		"[Lv. 2]: ^777777960% of MATK (2,200% on Dragon/Formless)^000000",
		"[Lv. 3]: ^7777771,440% of MATK (3,300% on Dragon/Formless)^000000",
		"[Lv. 4]: ^7777771,920% of MATK (4,400% on Dragon/Formless)^000000",
		"[Lv. 5]: ^7777772,400% of MATK (5,500% on Dragon/Formless)^000000",
		"[Lv. 6]: ^7777772,880% of MATK (6,600% on Dragon/Formless)^000000",
		"[Lv. 7]: ^7777773,360% of MATK (7,700% on Dragon/Formless)^000000",
		"[Lv. 8]: ^7777773,840% of MATK (8,800% on Dragon/Formless)^000000",
		"[Lv. 9]: ^7777774,320% of MATK (9,900% on Dragon/Formless)^000000",
		"[Lv. 10]: ^7777774,800% of MATK (11,000% on Dragon/Formless)^000000"
	].join("\n");

	SkillDescription[SKID.EM_ELEMENTAL_VEIL] = [
		"Elemental Veil",
		"Max Lv.: 5",
		"^777777Learning Conditions: Elemental Spirit Mastery Lv. 3^000000",
		"Class: ^993300Active^000000",
		"Type: ^777777Support^000000",
		"Target: ^777777Your Spirit^000000",
		"Details: ^777777Make your high spirit semi-transparent.",
		"Requires a high spirit.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Duration: 120 sec.^000000",
		"[Lv. 2]: ^777777Duration: 150 sec.^000000",
		"[Lv. 3]: ^777777Duration: 180 sec.^000000",
		"[Lv. 4]: ^777777Duration: 210 sec.^000000",
		"[Lv. 5]: ^777777Duration: 240 sec.^000000"
	].join("\n");

	SkillDescription[SKID.EM_ELEMENTAL_SPIRIT_M] = [
		"Elemental Spirit Mastery",
		"Max Lv.: 10",
		"^777777Learning Conditions: Spirit Sympathy Lv. 1^000000",
		"Class: ^993300Passive^000000",
		"Details: ^777777Improve your summoned high spirit.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777Improved High Spirit Stats (ATK: 120, MATK: 20, MHP: 13,000, MSP: 100, DEF: 20, MDEF: 4, FLEE: 10)^000000",
		"[Lv. 2]: ^777777Improved High Spirit Stats (ATK: 140, MATK: 40, MHP: 16,000, MSP: 200, DEF: 40, MDEF: 8, FLEE: 20)^000000",
		"[Lv. 3]: ^777777Improved High Spirit Stats (ATK: 160, MATK: 60, MHP: 19,000, MSP: 300, DEF: 60, MDEF: 12, FLEE: 30)^000000",
		"[Lv. 4]: ^777777Improved High Spirit Stats (ATK: 180, MATK: 80, MHP: 22,000, MSP: 400, DEF: 80, MDEF: 16, FLEE: 40)^000000",
		"[Lv. 5]: ^777777Improved High Spirit Stats (ATK: 200, MATK: 100, MHP: 25,000, MSP: 500, DEF: 100, MDEF: 20, FLEE: 50)^000000",
		"[Lv. 6]: ^777777Improved High Spirit Stats (ATK: 220, MATK: 120, MHP: 28,000, MSP: 600, DEF: 120, MDEF: 24, FLEE: 60)^000000",
		"[Lv. 7]: ^777777Improved High Spirit Stats (ATK: 240, MATK: 140, MHP: 31,000, MSP: 700, DEF: 140, MDEF: 28, FLEE: 70)^000000",
		"[Lv. 8]: ^777777Improved High Spirit Stats (ATK: 260, MATK: 160, MHP: 34,000, MSP: 800, DEF: 160, MDEF: 32, FLEE: 80)^000000",
		"[Lv. 9]: ^777777Improved High Spirit Stats (ATK: 280, MATK: 180, MHP: 37,000, MSP: 900, DEF: 180, MDEF: 36, FLEE: 90)^000000",
		"[Lv. 10]: ^777777Improved High Spirit Stats (ATK: 300, MATK: 200, MHP: 40,000, MSP: 1,000, DEF: 200, MDEF: 40, FLEE: 100)^000000"
	].join("\n");

	SkillDescription[SKID.EM_INCREASING_ACTIVITY] = [
		"Increase AP",
		"Max Lv.: 5",
		"^777777Learning Conditions: AP Burn Lv. 5^000000",
		"Class: ^3F0099Active (AP)^000000",
		"Type: ^777777Buff^000000",
		"Target: ^7777771 Party Member (except you)^000000",
		"Cost: ^FF000050 AP^000000",
		"Details: ^777777Use 50 AP to increase the target's HP.^000000",
		"^ffffff_^000000",
		"[Lv. 1]: ^777777AP +25^000000",
		"[Lv. 2]: ^777777AP +30^000000",
		"[Lv. 3]: ^777777AP +35^000000",
		"[Lv. 4]: ^777777AP +40^000000",
		"[Lv. 5]: ^777777AP +45^000000"
	].join("\n");

	return SkillDescription;
});
