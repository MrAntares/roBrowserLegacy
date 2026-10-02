/**
 * DB/Skills/SkillEffect.js
 *
 * List of skills with informations (in progress)
 *
 * @author Vincent Thibault
 */

/**
 *
 *	Possible types
 *	--------------
 *
 *	- effectId: 				Triggers once for every skill use. The packet determines who receives the effect.
 *								Can be used to create regular effects.
 *
 *	- effectIdOnCaster:			Triggers once for every skill use. The caster receives the effect.
 *								Can be used to create skill use effects on the caster.
 *
 *	- groundEffectId: 			Triggers once for every ground skill entity entry. Some skills have multiple entities, like songs, others have only one.
 *								Can be used to create ground effects.
 *
 *	- hitEffectId: 				Triggers on every hit with damage (including every hit of a multi hit skill) on the receiving entity.
 *								Can be used to create damage effects.
 *
 *	- beforeHitEffectId: 		Triggers before every hit (including every hit of a multi hit skill) and after the cast.
 *								Can be used to create pre-damage effects like flying balls and others.
 *								Note: Effect duration in EffectTable has to be equal to the damage display delay to make the effect look like it reaches the target right before the damage. Now it is fixed 200ms.
 *
 *	- releaseEffectId: 			Triggers once when the skill is released on a target (after the cast, before the hit lands), even if the skill misses.
 *								Can be used for effects traveling from the caster toward the target.
 *
 *	- beginCastEffectId: 		Triggers once right after the skill is released, before the cast ends.
 *								Can be used to create casting effects.
 *
 *	- successEffectId: 			Triggers when a skill yealds a "successful" result.
 *								Can be used for non-damaging skills that has an effect by a chance
 *
 *	- successEffectIdOnCaster: 	Triggers on the caster when a skill yealds a "successful" result.
 *								Can be used for non-damaging skills that has an effect by a chance
 *
 *	- hideCastBar:				When set to true hides the cast bar when casting.
 *	- hideCastAura:			When set to true hides the elemental magic circle when casting.
 *
 */

import SK from 'DB/Skills/SkillConst.js';
import EntityManager from 'Renderer/EntityManager.js';
import JobId from 'DB/Jobs/JobConst.js';

// _job dont store mount variants, just the real job, so it's ok to check like this
// this is used on monk asura strike effect
const CHAMPION_JOBS = new Set([
	JobId.MONK_H, // 4016
	JobId.SURA, // 4070
	JobId.SURA_H, // 4077
	JobId.SURA_B, // 4106
	JobId.SURA_2ND, // 4342
	JobId.INQUISITOR // 4262
]);

const SkillEffect = {};

// Swordman
SkillEffect[SK.SM_BASH] = { beginCastEffectId: 16, hitEffectId: 1 }; //Bash
SkillEffect[SK.SM_PROVOKE] = { successEffectId: 67 }; //Provoke
SkillEffect[SK.SM_MAGNUM] = { effectIdOnCaster: 17, effectId: 'quake_magnum' }; //Magnum Break
SkillEffect[SK.SM_ENDURE] = { effectId: 11 }; //Endure
// Mage
SkillEffect[SK.MG_SIGHT] = {/* effectId: 22 not here*/}; //Sight
SkillEffect[SK.MG_NAPALMBEAT] = { hitEffectId: 1 }; //Napalm Beat
SkillEffect[SK.MG_SAFETYWALL] = {/*not here*/}; //Safety Wall
SkillEffect[SK.MG_SOULSTRIKE] = { beforeHitEffectId: 15, hitEffectId: 1 }; //Soul Strike
SkillEffect[SK.MG_COLDBOLT] = { beforeHitEffectId: 'ef_coldbolt', hitEffectId: 51 }; //Cold Bolt
SkillEffect[SK.MG_FROSTDIVER] = { releaseEffectId: 27, hitEffectId: 28 }; //Frost Diver
SkillEffect[SK.MG_STONECURSE] = { effectId: 23 }; //Stone Curse
SkillEffect[SK.MG_FIREBALL] = { beforeHitEffectId: 24, hitEffectId: 49 }; //Fire Ball
SkillEffect[SK.MG_FIREWALL] = { hitEffectId: 49, groundEffectId: 25 }; //Fire Wall
SkillEffect[SK.MG_FIREBOLT] = { beforeHitEffectId: 'ef_firebolt', hitEffectId: 49 }; //Fire Bolt
SkillEffect[SK.MG_LIGHTNINGBOLT] = { effectId: 29, hitEffectId: 52 }; //Lightning Bolt
SkillEffect[SK.MG_THUNDERSTORM] = { effectId: 30, hitEffectId: 52 }; //Thunderstorm
// Acolyte
SkillEffect[SK.AL_RUWACH] = { hitEffectId: 1 /*state effect not here*/ }; //Ruwach
SkillEffect[SK.AL_PNEUMA] = { groundEffectId: 141 }; //Pneuma
SkillEffect[SK.AL_TELEPORT] = {/*not here*/}; //Teleport
SkillEffect[SK.AL_WARP] = {/*not here*/}; //Warp Portal
SkillEffect[SK.AL_HEAL] = { effectId: 312, hitEffectId: 320 }; //Heal
SkillEffect[SK.AL_INCAGI] = { effectId: 37 }; //Increase AGI
SkillEffect[SK.AL_DECAGI] = { effectId: 38 }; //Decrease AGI
SkillEffect[SK.AL_HOLYWATER] = { effectId: 39 }; //Aqua Benedicta
SkillEffect[SK.AL_CRUCIS] = { effectId: 40 }; //Signum Crucis
SkillEffect[SK.AL_ANGELUS] = { effectId: 41 }; //Angelus
SkillEffect[SK.AL_BLESSING] = { effectId: 42 }; //Blessing
SkillEffect[SK.AL_CURE] = { effectId: 66 }; //Cure
// Merchant
SkillEffect[SK.MC_IDENTIFY] = {}; //Item Appraisal
SkillEffect[SK.MC_VENDING] = {}; //Vending
SkillEffect[SK.MC_MAMMONITE] = { effectId: 10 }; //Mammonite
// Archer
SkillEffect[SK.AC_CONCENTRATION] = { effectId: 153 }; //Improve Concentration
SkillEffect[SK.AC_DOUBLE] = { beginCastEffectId: 16, beforeHitEffectId: 'ef_arrow_projectile', hitEffectId: 1 }; //Double Strafe
SkillEffect[SK.AC_SHOWER] = { effectId: 'ef_arrow_shower_projectile', hitEffectId: 1 }; //Arrow Shower
// Thief
SkillEffect[SK.TF_STEAL] = { successEffectId: 18 }; //Steal
SkillEffect[SK.TF_HIDING] = {/*Handled by state*/}; //Hiding
SkillEffect[SK.TF_POISON] = { hitEffectId: 20 }; //Envenom
SkillEffect[SK.TF_DETOXIFY] = { effectId: 21 }; //Detoxify
// All
SkillEffect[SK.ALL_RESURRECTION] = { effectId: [77, 140] }; //Resurrection
// Knight
SkillEffect[SK.KN_PIERCE] = { effectIdOnCaster: 148, hitEffectId: 147 }; //Pierce
SkillEffect[SK.KN_BRANDISHSPEAR] = { hideCastBar: true, hideCastAura: true, effectId: 70, effectIdOnCaster: 144 }; //Brandish Spear
SkillEffect[SK.KN_SPEARSTAB] = { effectIdOnCaster: 150 }; //Spear Stab
SkillEffect[SK.KN_SPEARBOOMERANG] = {
	effectIdOnCaster: 151,
	beforeHitEffectId: 'ef_spear_projectile',
	hitEffectId: 80
}; //Spear Boomerang
SkillEffect[SK.KN_TWOHANDQUICKEN] = { effectId: 130 }; //Twohand Quicken
SkillEffect[SK.KN_AUTOCOUNTER] = {
	hideCastAura: true /*effectId: 131    NOT USED HERE, but hardcoded in onEntityCastCancel!*/
}; //Counter Attack
SkillEffect[SK.KN_BOWLINGBASH] = { hideCastBar: true, hideCastAura: true, effectIdOnCaster: 149, hitEffectId: 1 }; //Bowling Bash
// Priest
SkillEffect[SK.PR_IMPOSITIO] = { effectId: 84 }; //Impositio Manus
SkillEffect[SK.PR_SUFFRAGIUM] = { effectId: 88 }; //Suffragium
SkillEffect[SK.PR_ASPERSIO] = { effectId: 86 }; //Aspersio
SkillEffect[SK.PR_BENEDICTIO] = { effectId: 91 }; //B.S. Sacramenti
SkillEffect[SK.PR_SANCTUARY] = { effectId: 83, groundEffectId: 319 }; //Sanctuary
SkillEffect[SK.PR_SLOWPOISON] = { effectId: 136 }; //Slow Poison
SkillEffect[SK.PR_STRECOVERY] = { effectId: 78 }; //Status Recovery
SkillEffect[SK.PR_KYRIE] = { effectId: 112 }; //Kyrie Eleison
SkillEffect[SK.PR_MAGNIFICAT] = { effectId: 76 }; //Magnificat
SkillEffect[SK.PR_GLORIA] = { effectId: 75 }; //Gloria
SkillEffect[SK.PR_LEXDIVINA] = { effectId: 87 }; //Lex Divina
SkillEffect[SK.PR_TURNUNDEAD] = { hitEffectId: 152 }; //Turn Undead
SkillEffect[SK.PR_LEXAETERNA] = { effectId: 85 }; //Lex Aeterna
SkillEffect[SK.PR_MAGNUS] = { effectId: 113, hitEffectId: 152, groundEffectId: 318 }; //Magnus Exorcismus
// Wizard
SkillEffect[SK.WZ_FIREPILLAR] = { effectId: 96, groundEffectId: 138, hitEffectId: 97 }; //Fire Pillar
SkillEffect[SK.WZ_SIGHTRASHER] = { effectId: 62, hitEffectId: 49 }; //Sightrasher
SkillEffect[SK.WZ_METEOR] = { effectId: 92, hitEffectId: 49 }; //Meteor Storm
SkillEffect[SK.WZ_JUPITEL] = { effectId: 93, beforeHitEffectId: 94 }; //Jupitel Thunder
SkillEffect[SK.WZ_VERMILION] = { effectId: 90, hitEffectId: 52 }; //Lord of Vermilion
SkillEffect[SK.WZ_WATERBALL] = { beforeHitEffectIdOnCaster: 116, hitEffectIdOnCaster: 117 }; //Water Ball
SkillEffect[SK.WZ_ICEWALL] = { groundEffectId: 74 }; //Ice Wall
SkillEffect[SK.WZ_FROSTNOVA] = { effectIdOnCaster: 28, hitEffectId: 51 }; //Frost Nova
SkillEffect[SK.WZ_STORMGUST] = { effectId: 89, hitEffectId: 51 }; //Storm Gust
SkillEffect[SK.WZ_EARTHSPIKE] = { effectId: 79, hitEffectId: 147 }; //Earth Spike
SkillEffect[SK.WZ_HEAVENDRIVE] = { effectId: 142, hitEffectId: 147 }; //Heaven's Drive
SkillEffect[SK.WZ_QUAGMIRE] = { groundEffectId: 95 }; //Quagmire
SkillEffect[SK.WZ_ESTIMATION] = {}; //Sense
// Blacksmith
SkillEffect[SK.BS_REPAIRWEAPON] = { effectId: 101 }; //Weapon Repair
SkillEffect[SK.BS_HAMMERFALL] = { effectId: 102 }; //Hammer Fall
SkillEffect[SK.BS_ADRENALINE] = { beginCastEffectId: '98_beforecast', effectId: 98 }; //Adrenaline Rush
SkillEffect[SK.BS_WEAPONPERFECT] = { effectId: 103 }; //Weapon Perfection
SkillEffect[SK.BS_OVERTHRUST] = { effectId: 128 }; //Power-Thrust
SkillEffect[SK.BS_MAXIMIZE] = { beginCastEffectId: 'maximize_power_sounds', effectId: 104 }; //Maximize Power
// Hunter
SkillEffect[SK.HT_SKIDTRAP] = { effectId: 69 }; //Skid Trap
SkillEffect[SK.HT_LANDMINE] = { effectId: 'ef_ht_landmine' }; //Land Mine
SkillEffect[SK.HT_ANKLESNARE] = { groundEffectId: 'ef_anklesnare' }; //Ankle Snare
SkillEffect[SK.HT_SHOCKWAVE] = { effectId: 145, hitEffectId: 146 }; //Shockwave Trap
SkillEffect[SK.HT_SANDMAN] = { hitEffectId: 139 }; //Sandman
SkillEffect[SK.HT_FLASHER] = { hitEffectId: 99 }; //Flasher
SkillEffect[SK.HT_FREEZINGTRAP] = { hitEffectId: 108 }; //Freezing Trap
SkillEffect[SK.HT_BLASTMINE] = { hitEffectId: 106 }; //Blast Mine
SkillEffect[SK.HT_CLAYMORETRAP] = { hitEffectId: 107 }; //Claymore Trap
SkillEffect[SK.HT_REMOVETRAP] = { effectId: 100 }; //Remove Trap
SkillEffect[SK.HT_TALKIEBOX] = {}; //Talkie Box
SkillEffect[SK.HT_BLITZBEAT] = { effectId: 115 }; //Blitz Beat
SkillEffect[SK.HT_DETECTING] = { effectId: 119 }; //Detect
SkillEffect[SK.HT_SPRINGTRAP] = { effectId: 111 }; //Spring Trap
// Assassin
SkillEffect[SK.AS_CLOAKING] = { effectId: 120 }; //Cloaking
SkillEffect[SK.AS_SONICBLOW] = { effectIdOnCaster: 121, effectId: 143, hitEffectId: 122 }; //Sonic Blow
SkillEffect[SK.AS_GRIMTOOTH] = { releaseEffectId: 123, hitEffectId: 132 }; //Grimtooth
SkillEffect[SK.AS_ENCHANTPOISON] = { effectId: 20 }; //Enchant Poison
SkillEffect[SK.AS_POISONREACT] = { effectId: 126, hitEffectId: 127 }; //Poison React
SkillEffect[SK.AS_VENOMDUST] = { effectId: 124, groundEffectId: 171 }; //Venom Dust
SkillEffect[SK.AS_SPLASHER] = { effectId: 129 }; //Venom Splasher
// 1st Class Quest
SkillEffect[SK.NV_FIRSTAID] = { effectId: 309 }; //First Aid
SkillEffect[SK.NV_TRICKDEAD] = {}; //Play Dead
SkillEffect[SK.HN_DOUBLEBOWLINGBASH] = { effectId: 'ef_hn_doublebowlingbash' }; //Double Bowling Bash
SkillEffect[SK.HN_MEGA_SONIC_BLOW] = { effectId: 'ef_hn_mega_sonic_blow' }; //Mega Sonic Blow
SkillEffect[SK.HN_SHIELD_CHAIN_RUSH] = { effectId: 'ef_hn_shield_chain_rush' }; //Shield Chain Rush
SkillEffect[SK.HN_SPIRAL_PIERCE_MAX] = { effectId: 'ef_hn_spiral_pierce_max' }; //Spiral Pierce Max
SkillEffect[SK.HN_METEOR_STORM_BUSTER] = { effectId: 'ef_hn_meteor_storm_buster' }; //Meteor Storm Buster
SkillEffect[SK.HN_JUPITEL_THUNDER_STORM] = { effectId: 'ef_hn_jupitel_thunder_storm' }; //Jupitel Thunderstorm
SkillEffect[SK.HN_JACK_FROST_NOVA] = { effectId: 'ef_hn_jack_frost_nova' }; //Jack Frost Nova
SkillEffect[SK.HN_HELLS_DRIVE] = { effectId: 'ef_hn_hells_drive' }; //Hell's Drive
SkillEffect[SK.HN_GROUND_GRAVITATION] = { effectId: 'ef_hn_ground_gravitation' }; //Ground Gravitation
SkillEffect[SK.HN_NAPALM_VULCAN_STRIKE] = { effectId: 'ef_hn_napalm_vulcan_strike' }; //Napalm Vulcan Strike
SkillEffect[SK.HN_BREAKINGLIMIT] = { effectId: 'ef_hn_breakinglimit' }; //Breaking Limit
SkillEffect[SK.HN_RULEBREAK] = { effectId: 'ef_hn_rulebreak' }; //Rule Break
SkillEffect[5505 /* HN_OVERCOMING_CRISIS */] = { effectId: 'ef_hn_overcoming_crisis' }; //Overcoming Crisis
SkillEffect[SK.SM_AUTOBERSERK] = {}; //Auto Berserk
SkillEffect[SK.AC_MAKINGARROW] = {}; //Arrow Crafting
SkillEffect[SK.AC_CHARGEARROW] = { hideCastAura: true, beforeHitEffectId: 'ef_arrow_projectile' }; //Arrow Repel
SkillEffect[SK.TF_SPRINKLESAND] = { effectId: 310 }; //Sand Attack
SkillEffect[SK.TF_BACKSLIDING] = {}; //Back Slide
SkillEffect[SK.TF_PICKSTONE] = { hideCastAura: true }; //Find Stone
SkillEffect[SK.TF_THROWSTONE] = { beforeHitEffectId: 308 }; //Stone Fling
SkillEffect[SK.MC_CARTREVOLUTION] = { beginCastEffectId: 170, hitEffectId: 170 }; //Cart Revolution
SkillEffect[SK.MC_CHANGECART] = {}; //Change Cart
SkillEffect[SK.MC_LOUD] = { effectId: 311 }; //Crazy Uproar
SkillEffect[SK.AL_HOLYLIGHT] = { effectId: 152 }; //Holy Light
SkillEffect[SK.MG_ENERGYCOAT] = { effectId: 169 }; //Energy Coat
// NPC Skills
SkillEffect[SK.NPC_PIERCINGATT] = { effectIdOnCaster: 148 }; //Piercing Attack
SkillEffect[SK.NPC_MENTALBREAKER] = { effectId: 181 }; //Spirit Destruction
SkillEffect[SK.NPC_RANGEATTACK] = {}; //Stand off attack
SkillEffect[SK.NPC_ATTRICHANGE] = {}; //Attribute Change
SkillEffect[SK.NPC_CHANGEWATER] = { effectId: 174 }; //Water Attribute Change
SkillEffect[SK.NPC_CHANGEGROUND] = { effectId: 177 }; //Earth Attribute Change
SkillEffect[SK.NPC_CHANGEFIRE] = { effectId: 173 }; //Fire Attribute Change
SkillEffect[SK.NPC_CHANGEWIND] = { effectId: 175 }; //Wind Attribute Change
SkillEffect[SK.NPC_CHANGEPOISON] = { effectId: 179 }; //Poison Attribute Change
SkillEffect[SK.NPC_CHANGEHOLY] = { effectId: 178 }; //Holy Attribute Change
SkillEffect[SK.NPC_CHANGEDARKNESS] = { effectId: 172 }; //Shadow Attribute Change
SkillEffect[SK.NPC_CHANGETELEKINESIS] = {}; //Ghost Attribute Change
SkillEffect[SK.NPC_CRITICALSLASH] = { effectIdOnCaster: 16 }; //Defense disregard attack
SkillEffect[SK.NPC_COMBOATTACK] = {}; //Multi-stage Attack
SkillEffect[SK.NPC_GUIDEDATTACK] = { effectId: 191 }; //Guided Attack
SkillEffect[SK.NPC_SELFDESTRUCTION] = { effectId: 183 }; //Suicide bombing
SkillEffect[SK.NPC_SPLASHATTACK] = {}; //Splash attack
SkillEffect[SK.NPC_SUICIDE] = { effectId: 185 }; //Suicide
SkillEffect[SK.NPC_POISON] = { effectId: 192 }; //Poison Attack
SkillEffect[SK.NPC_BLINDATTACK] = {}; //Blind Attack
SkillEffect[SK.NPC_SILENCEATTACK] = { effectId: 193 }; //Silence Attack
SkillEffect[SK.NPC_STUNATTACK] = { effectId: 194 }; //Stun Attack
SkillEffect[SK.NPC_PETRIFYATTACK] = { effectId: 195 }; //Petrify Attack
SkillEffect[SK.NPC_CURSEATTACK] = { effectId: 196 }; //Curse Attack
SkillEffect[SK.NPC_SLEEPATTACK] = { effectId: 197 }; //Sleep attack
SkillEffect[SK.NPC_RANDOMATTACK] = {}; //Random Attack
SkillEffect[SK.NPC_WATERATTACK] = { hitEffectId: 51 }; //Water Attribute Attack
SkillEffect[SK.NPC_GROUNDATTACK] = { hitEffectId: 147 }; //Earth Attribute Attack
SkillEffect[SK.NPC_FIREATTACK] = { hitEffectId: 49 }; //Fire Attribute Attack
SkillEffect[SK.NPC_WINDATTACK] = { hitEffectId: 52 }; //Wind Attribute Attack
SkillEffect[SK.NPC_POISONATTACK] = { hitEffectId: 53 }; //Poison Attribute Attack
SkillEffect[SK.NPC_HOLYATTACK] = { hitEffectId: 152 }; //Holy Attribute Attack
SkillEffect[SK.NPC_DARKNESSATTACK] = { effectId: 184, hitEffectId: 180 }; //Shadow Attribute Attack
SkillEffect[SK.NPC_TELEKINESISATTACK] = { effectId: 198 }; //Ghost Attribute Attack
SkillEffect[SK.NPC_MAGICALATTACK] = { hitEffectId: 182 }; //Demon Shock Attack
SkillEffect[SK.NPC_METAMORPHOSIS] = {}; //Metamorphosis
SkillEffect[SK.NPC_PROVOCATION] = { successEffectId: 67 }; //Provocation
SkillEffect[SK.NPC_SMOKING] = {}; //Smoking
SkillEffect[SK.NPC_SUMMONSLAVE] = {}; //Follower Summons
SkillEffect[SK.NPC_EMOTION] = {}; //Emotion
SkillEffect[SK.NPC_TRANSFORMATION] = {}; //Transformation
SkillEffect[SK.NPC_BLOODDRAIN] = { effectIdOnCaster: 216 }; //Sucking Blood
SkillEffect[SK.NPC_ENERGYDRAIN] = { effectIdOnCaster: 217 }; //Energy Drain
SkillEffect[SK.NPC_KEEPING] = { effectId: 214 }; //Keeping
SkillEffect[SK.NPC_DARKBREATH] = { effectId: 212 }; //Dark Breath
SkillEffect[SK.NPC_DARKBLESSING] = {}; //Dark Blessing
SkillEffect[SK.NPC_BARRIER] = {}; //Barrier
SkillEffect[SK.NPC_DEFENDER] = { effectId: 213 }; //Defender
SkillEffect[SK.NPC_LICK] = {}; //Lick
SkillEffect[SK.NPC_HALLUCINATION] = {}; //Hallucination
SkillEffect[SK.NPC_REBIRTH] = {}; //Rebirth
SkillEffect[SK.NPC_SUMMONMONSTER] = {}; //Monster Summons
// Rogue
SkillEffect[SK.RG_STEALCOIN] = { successEffectId: [268, 274] }; //Mug
SkillEffect[SK.RG_BACKSTAP] = { hitEffectId: 275 }; //Back Stab
SkillEffect[SK.RG_RAID] = { effectIdOnCaster: 276 }; //Sightless Mind
SkillEffect[SK.RG_STRIPWEAPON] = { successEffectId: 269 }; //Divest Weapon
SkillEffect[SK.RG_STRIPSHIELD] = { successEffectId: 270 }; //Divest Shield
SkillEffect[SK.RG_STRIPARMOR] = { successEffectId: 271 }; //Divest Armor
SkillEffect[SK.RG_STRIPHELM] = { successEffectId: 272 }; //Divest Helm
SkillEffect[SK.RG_INTIMIDATE] = { effectId: 227 }; //Snatch
SkillEffect[SK.RG_GRAFFITI] = {}; //Scribble
SkillEffect[SK.RG_FLAGGRAFFITI] = {}; //Piece
SkillEffect[SK.RG_CLEANER] = {}; //Remover
// Alchemist
SkillEffect[SK.AM_PHARMACY] = {}; //Prepare Potion
SkillEffect[SK.AM_DEMONSTRATION] = { groundEffectId: 302 }; //Bomb
SkillEffect[SK.AM_ACIDTERROR] = { beforeHitEffectId: 298 }; //Acid Terror
SkillEffect[SK.AM_POTIONPITCHER] = { effectId: 299 }; //Aid Potion
SkillEffect[SK.AM_CANNIBALIZE] = {}; //Summon Flora
SkillEffect[SK.AM_SPHEREMINE] = {}; //Summon Marine Sphere
SkillEffect[SK.AM_CP_WEAPON] = { effectId: 300 }; //Alchemical Weapon
SkillEffect[SK.AM_CP_SHIELD] = { effectId: 300 }; //Synthesized Shield
SkillEffect[SK.AM_CP_ARMOR] = { effectId: 300 }; //Synthetic Armor
SkillEffect[SK.AM_CP_HELM] = { effectId: 300 }; //Biochemical Helm
SkillEffect[SK.AM_CALLHOMUN] = {}; //Call Homunculus
SkillEffect[SK.AM_REST] = {}; //Vaporize
SkillEffect[SK.AM_RESURRECTHOMUN] = {}; //Homunculus Resurrection
// Crusader
SkillEffect[SK.CR_AUTOGUARD] = { effectId: 336 }; //Guard
SkillEffect[SK.CR_SHIELDCHARGE] = { effectId: 246 }; //Smite
SkillEffect[SK.CR_SHIELDBOOMERANG] = { beforeHitEffectId: 'ef_shield_projectile', effectId: 249 }; //Shield Boomerang
SkillEffect[SK.CR_REFLECTSHIELD] = { effectId: 252 }; //Shield Reflect
SkillEffect[SK.CR_HOLYCROSS] = { effectId: 245 }; //Holy Cross
SkillEffect[SK.CR_GRANDCROSS] = { effectId: 226 }; //Grand Cross
SkillEffect[SK.CR_DEVOTION] = { effectId: 251 }; //Sacrifice
SkillEffect[SK.CR_PROVIDENCE] = { effectId: 248 }; //Resistant Souls
SkillEffect[SK.CR_DEFENDER] = { effectId: 222 }; //Defending Aura
SkillEffect[SK.CR_SPEARQUICKEN] = { effectId: 250 }; //Spear Quicken
// Monk
SkillEffect[SK.MO_CALLSPIRITS] = {}; //Summon Spirit Sphere
SkillEffect[SK.MO_ABSORBSPIRITS] = { successEffectIdOnCaster: 253 }; //Absorb Spirit Sphere
SkillEffect[SK.MO_TRIPLEATTACK] = { effectId: 329 }; //Triple Attack
SkillEffect[SK.MO_BODYRELOCATION] = { effectId: 166 }; //Snap (EF_MAKEBLUR)
SkillEffect[SK.MO_INVESTIGATE] = { effectId: 267 }; //Occult Impaction
SkillEffect[SK.MO_FINGEROFFENSIVE] = { effectId: 265, hitEffectId: 1 }; //Throw Spirit Sphere
SkillEffect[SK.MO_STEELBODY] = { effectId: [254, 'quake'] }; //Mental Strength
SkillEffect[SK.MO_BLADESTOP] = {}; //Root
SkillEffect[SK.MO_EXPLOSIONSPIRITS] = { beginCastEffectId: 12, effectIdOnCaster: [261, 'quake'] }; //Fury
SkillEffect[SK.MO_EXTREMITYFIST] = {
	effectId: srcAID => {
		const src = EntityManager.get(srcAID);
		return src && CHAMPION_JOBS.has(src._job) ? [510, 'quake'] : [328, 'quake']; /* champion 510 */
	},
	hitEffectId: 266,
	beginCastEffectId: 12
}; //Asura Strike
SkillEffect[SK.MO_CHAINCOMBO] = { effectId: [262, 273], effectIdOnCaster: 263 }; //Raging Quadruple Blow
SkillEffect[SK.MO_COMBOFINISH] = { effectId: [330, 'quake'] }; //Raging Thrust
// Sage
SkillEffect[SK.SA_CASTCANCEL] = {}; //Cast Cancel
SkillEffect[SK.SA_MAGICROD] = { successEffectId: 244 }; //Magic Rod
SkillEffect[SK.SA_SPELLBREAKER] = { successEffectId: 234 }; //Spell Breaker
SkillEffect[SK.SA_AUTOSPELL] = {}; //Hindsight
SkillEffect[SK.SA_FLAMELAUNCHER] = { successEffectId: 255 }; //Endow Blaze
SkillEffect[SK.SA_FROSTWEAPON] = { successEffectId: 256 }; //Endow Tsunami
SkillEffect[SK.SA_LIGHTNINGLOADER] = { successEffectId: 257 }; //Endow Tornado
SkillEffect[SK.SA_SEISMICWEAPON] = { successEffectId: 258 }; //Endow Quake
SkillEffect[SK.SA_VOLCANO] = { effectIdOnCaster: 225, groundEffectId: 239 }; //Volcano
SkillEffect[SK.SA_DELUGE] = { effectIdOnCaster: 236, groundEffectId: 240 }; //Deluge
SkillEffect[SK.SA_VIOLENTGALE] = { effectIdOnCaster: 237, groundEffectId: 241 }; //Whirlwind
SkillEffect[SK.SA_LANDPROTECTOR] = { effectIdOnCaster: 238, groundEffectId: 242 }; //Magnetic Earth
SkillEffect[SK.SA_DISPELL] = { successEffectId: 235 }; //Dispell
SkillEffect[SK.SA_ABRACADABRA] = {}; //Hocus-pocus
SkillEffect[SK.SA_MONOCELL] = {}; //Monocell
SkillEffect[SK.SA_CLASSCHANGE] = {}; //Class Change
SkillEffect[SK.SA_SUMMONMONSTER] = {}; //Monster Chant
SkillEffect[SK.SA_REVERSEORCISH] = {}; //Grampus Morph
SkillEffect[SK.SA_DEATH] = {}; //Grim Reaper
SkillEffect[SK.SA_FORTUNE] = {}; //Gold Digger
SkillEffect[SK.SA_TAMINGMONSTER] = {}; //Beastly Hypnosis
SkillEffect[SK.SA_QUESTION] = {}; //Questioning
SkillEffect[SK.SA_GRAVITY] = {}; //Gravity
SkillEffect[SK.SA_LEVELUP] = {}; //Leveling
SkillEffect[SK.SA_INSTANTDEATH] = { effectId: 'ef_sa_instantdeath' }; //Suicide
SkillEffect[SK.SA_FULLRECOVERY] = {}; //Rejuvenation
SkillEffect[SK.SA_COMA] = {}; //Coma
// Bard & Dancer
SkillEffect[SK.BD_ADAPTATION] = {}; //Amp
SkillEffect[SK.BD_ENCORE] = {}; //Encore
SkillEffect[SK.BD_LULLABY] = { effectId: 278, groundEffectId: '278_ground' }; //Lullaby
SkillEffect[SK.BD_RICHMANKIM] = { effectId: 279, groundEffectId: '279_ground' }; //Mental Sensing
SkillEffect[SK.BD_ETERNALCHAOS] = { effectId: 280, groundEffectId: '280_ground' }; //Down Tempo
SkillEffect[SK.BD_DRUMBATTLEFIELD] = { effectId: 281, groundEffectId: '281_ground' }; //Battle Theme
SkillEffect[SK.BD_RINGNIBELUNGEN] = { effectId: 282, groundEffectId: '282_ground' }; //Harmonic Lick
SkillEffect[SK.BD_ROKISWEIL] = { effectId: 283, groundEffectId: '283_ground' }; //Classical Pluck
SkillEffect[SK.BD_INTOABYSS] = { effectId: 284, groundEffectId: '284_ground' }; //Power Chord
SkillEffect[SK.BD_SIEGFRIED] = { effectId: 285, groundEffectId: '285_ground' }; //Acoustic Rhythm
// Bard
SkillEffect[SK.BA_MUSICALSTRIKE] = { hideCastAura: true, beforeHitEffectId: 'ef_arrow_projectile' }; //Melody Strike
SkillEffect[SK.BA_DISSONANCE] = { groundEffectId: '277_ground' }; //Unchained Serenade
SkillEffect[SK.BA_FROSTJOKE] = { beginCastEffectId: 295 }; //Unbarring Octave
SkillEffect[SK.BA_WHISTLE] = { effectId: 286, groundEffectId: '286_ground' }; //Perfect Tablature
SkillEffect[SK.BA_ASSASSINCROSS] = { effectId: 287, groundEffectId: '287_ground' }; //Impressive Riff
SkillEffect[SK.BA_POEMBRAGI] = { effectId: 288, groundEffectId: '288_ground' }; //Magic Strings
SkillEffect[SK.BA_APPLEIDUN] = { effectId: 289, groundEffectId: '289_ground' }; //Song of Lutie
// Dancer
SkillEffect[SK.DC_THROWARROW] = { hideCastAura: true, beforeHitEffectId: 'ef_arrow_projectile' }; //Slinging Arrow
SkillEffect[SK.DC_UGLYDANCE] = { groundEffectId: '290_ground' }; //Hip Shaker
SkillEffect[SK.DC_SCREAM] = { beginCastEffectId: 296 }; //Dazzler
SkillEffect[SK.DC_HUMMING] = { effectId: 291, groundEffectId: '291_ground' }; //Focus Ballet
SkillEffect[SK.DC_DONTFORGETME] = { effectId: 292, groundEffectId: '292_ground' }; //Slow Grace
SkillEffect[SK.DC_FORTUNEKISS] = { effectId: 293, groundEffectId: '293_ground' }; //Lady Luck
SkillEffect[SK.DC_SERVICEFORYOU] = { effectId: 294, groundEffectId: '294_ground' }; //Gypsy's Kiss
// NPC Skills
SkillEffect[SK.NPC_RANDOMMOVE] = {}; //Random Move
SkillEffect[SK.NPC_SPEEDUP] = {}; //Speed UP
SkillEffect[SK.NPC_REVENGE] = {}; //Revenge
// Marriage Skills
SkillEffect[SK.WE_MALE] = {}; //I Will Protect You
SkillEffect[SK.WE_FEMALE] = {}; //I Look up to You
SkillEffect[SK.WE_CALLPARTNER] = {}; //I miss You
// NPC Skills
SkillEffect[SK.ITM_TOMAHAWK] = { beforeHitEffectId: 'ef_tomahawk_projectile', effectId: 494 }; //Throw Tomahawk
SkillEffect[SK.NPC_DARKCROSS] = { effectId: 450 }; //Cross of Darkness
SkillEffect[SK.NPC_GRANDDARKNESS] = {}; //Grand cross of Darkness
SkillEffect[SK.NPC_DARKSTRIKE] = { effectId: 451 }; //Soul Strike of Darkness
SkillEffect[SK.NPC_DARKTHUNDER] = { effectId: 93, hitEffectId: 94 }; //Darkness Jupitel
SkillEffect[SK.NPC_STOP] = { effectId: 453 }; //Stop
SkillEffect[SK.NPC_WEAPONBRAKER] = {}; //Break weapon
SkillEffect[SK.NPC_ARMORBRAKE] = {}; //Break armor
SkillEffect[SK.NPC_HELMBRAKE] = {}; //Break helm
SkillEffect[SK.NPC_SHIELDBRAKE] = {}; //Break shield
SkillEffect[SK.NPC_UNDEADATTACK] = {}; //Undead Element Attack
SkillEffect[SK.NPC_CHANGEUNDEAD] = {}; //Undead Attribute Change
SkillEffect[SK.NPC_POWERUP] = { effectId: 456 }; //Power Up
SkillEffect[SK.NPC_AGIUP] = SkillEffect[SK.AL_INCAGI]; //Agility UP
SkillEffect[SK.NPC_CALLSLAVE] = {}; //Recall Slaves
SkillEffect[SK.NPC_RUN] = {}; //Run
// Lord Knight
SkillEffect[SK.LK_AURABLADE] = { beginCastEffectId: 'white_pulse', effectId: 367 }; //Aura Blade
SkillEffect[SK.LK_PARRYING] = { effectId: 336 }; //Parrying
SkillEffect[SK.LK_CONCENTRATION] = { effectId: 369 }; //Concentration
SkillEffect[SK.LK_TENSIONRELAX] = {}; //Relax
SkillEffect[SK.LK_BERSERK] = { effectId: [368, 'quake'] }; //Frenzy
SkillEffect[SK.LK_FURY] = { effectId: [368, 'quake'] }; //Fury
// High Priest
SkillEffect[SK.HP_ASSUMPTIO] = { effectId: 440 }; //Assumptio
SkillEffect[SK.HP_BASILICA] = { groundEffectId: 374 }; //Basilica
// High Wizard
SkillEffect[SK.HW_MAGICCRASHER] = { effectId: 380 }; //Stave Crasher
SkillEffect[SK.HW_MAGICPOWER] = { hideCastAura: true, beginCastEffectId: 16, effectId: 'ef_magicpower' }; //Mystical Amplification
SkillEffect[SK.HW_SOULDRAIN] = { effectIdOnCaster: 217 };
// Paladin
SkillEffect[SK.PA_PRESSURE] = { beforeHitEffectId: 365 }; //Gloria Domini
SkillEffect[SK.PA_SACRIFICE] = { effectId: 366 }; // Martyr's Reckoning
SkillEffect[SK.PA_GOSPEL] = { effectId: 370, groundEffectId: '370_ground' }; //Battle Chant
// Champion
SkillEffect[SK.CH_PALMSTRIKE] = { hitEffectId: [376, 'quake'] }; //Raging Palm Strike
SkillEffect[SK.CH_TIGERFIST] = { effectIdOnCaster: 263, effectId: [377, 'quake'] }; //Glacier Fist
SkillEffect[SK.CH_CHAINCRUSH] = { effectId: 512 }; //Chain Crush Combo
// Professor
SkillEffect[SK.PF_HPCONVERSION] = { effectId: 383, effectIdOnCaster: 378, successEffectIdOnCaster: 379 }; //Indulge
SkillEffect[SK.PF_SOULCHANGE] = { effectId: 384, successEffectId: 385 }; //Soul Exhale
SkillEffect[SK.PF_SOULBURN] = { effectId: 406 }; //Soul Siphon
// Asassin Cross
SkillEffect[SK.ASC_EDP] = { effectId: 493 }; //Enchant Deadly Poison
SkillEffect[SK.ASC_BREAKER] = { beforeHitEffectId: 361 }; //Soul Destroyer
// Sniper
SkillEffect[SK.SN_SIGHT] = { effectId: 386 }; //Falcon Eyes
SkillEffect[SK.SN_FALCONASSAULT] = { hideCastAura: true, effectId: 387 }; //Falcon Assault
SkillEffect[SK.SN_SHARPSHOOTING] = {
	hitEffectId: 388,
	beforeHitEffectId: 'ef_arrow_projectile',
	beginCastEffectId: '496_beforecast'
}; //Focused Arrow Strike
SkillEffect[SK.SN_WINDWALK] = { effectId: 389 }; //Wind Walker
// Whitesmith
SkillEffect[SK.WS_MELTDOWN] = { effectId: 390 }; //Shattering Strike
SkillEffect[SK.WS_CREATECOIN] = {}; //Create Coins
SkillEffect[SK.WS_CREATENUGGET] = {}; //Create Nuggets
SkillEffect[SK.WS_CARTBOOST] = { effectId: 391 }; //Cart Boost
SkillEffect[SK.WS_SYSTEMCREATE] = {}; //Auto Attack System
// Stalker
SkillEffect[SK.ST_CHASEWALK] = { beginCastEffectId: 501 }; //Stealth
SkillEffect[SK.ST_REJECTSWORD] = { effectId: 392 }; //Counter Instinct
// Creator
SkillEffect[SK.CR_ALCHEMY] = {}; //Alchemy
SkillEffect[SK.CR_SYNTHESISPOTION] = {}; //Potion Synthesis
// Clown & Gypsy
SkillEffect[SK.CG_ARROWVULCAN] = { effectId: 393, beforeHitEffectId: 'ef_arrow_projectile' }; //Vulcan Arrow
SkillEffect[SK.CG_MOONLIT] = { effectId: 394, groundEffectId: '394_ground' }; //Sheltering Bliss
SkillEffect[SK.CG_MARIONETTE] = { effectId: 395, hitEffectId: 396 }; //Marionette Control
// Lord Knight
SkillEffect[SK.LK_SPIRALPIERCE] = {
	hideCastAura: true,
	beginCastEffectId: '339_beforecast',
	effectId: 339,
	hitEffectId: 'spear_hit_sound'
}; //Spiral Pierce
SkillEffect[SK.LK_HEADCRUSH] = { beginCastEffectId: 399, hitEffectId: 'enemy_hit_normal1' }; //Traumatic Blow
SkillEffect[SK.LK_JOINTBEAT] = { beginCastEffectId: 400, hitEffectId: 'enemy_hit_normal1' }; //Vital Strike
// High Wizard
SkillEffect[SK.HW_NAPALMVULCAN] = { effectId: 401 }; //Napalm Vulcan
// Champion
SkillEffect[SK.CH_SOULCOLLECT] = { beginCastEffectId: [402, 12] }; //Zen
// Professor
SkillEffect[SK.PF_MINDBREAKER] = { successEffectId: 403 }; //Mind Breaker
SkillEffect[SK.PF_MEMORIZE] = { effectId: 505 }; //Foresight
SkillEffect[SK.PF_FOGWALL] = { groundEffectId: '405_ground' }; //Blinding Mist
SkillEffect[SK.PF_SPIDERWEB] = { groundEffectId: 404 }; //Fiber Lock
// Assassin Cross
SkillEffect[SK.ASC_METEORASSAULT] = { hideCastAura: true, effectIdOnCaster: 409 }; //Meteor Assault
SkillEffect[SK.ASC_CDP] = {}; //Create Deadly Poison
// Marriage Skills for Baby
SkillEffect[SK.WE_BABY] = { effectId: 408 }; //Baby
SkillEffect[SK.WE_CALLPARENT] = {}; //Call Parent
SkillEffect[SK.WE_CALLBABY] = {}; //Call Baby
// Taekwon
SkillEffect[SK.TK_RUN] = { effectId: 443, groundEffectId: 442 /*wallhit 458*/ }; //Running
SkillEffect[SK.TK_READYSTORM] = {}; //Tornado Stance
SkillEffect[SK.TK_STORMKICK] = { effectId: 435 }; //Tornado Kick
SkillEffect[SK.TK_READYDOWN] = {}; //Heel Drop Stance
SkillEffect[SK.TK_DOWNKICK] = { effectId: 413 }; //Heel Drop
SkillEffect[SK.TK_READYTURN] = {}; //Roundhouse Stance
SkillEffect[SK.TK_TURNKICK] = { effectId: 414 }; //Roundhouse Kick
SkillEffect[SK.TK_READYCOUNTER] = {}; //Counter Kick Stance
SkillEffect[SK.TK_COUNTER] = { effectId: 'ef_tk_counter' }; //Counter Kick
SkillEffect[SK.TK_DODGE] = {}; //Tumbling
SkillEffect[SK.TK_JUMPKICK] = { effectId: 439, hitEffectId: 457 }; //Flying Kick
SkillEffect[SK.TK_SEVENWIND] = {/* 467 - 473 is done by entity */}; //Mild Wind
SkillEffect[SK.TK_HIGHJUMP] = { hideCastAura: true, groundEffectId: 411, effectIdOnCaster: 445 /*down 446*/ }; //Taekwon Jump
// Star Gladiator
SkillEffect[SK.SG_FEEL] = { effectId: 432 }; //Feeling the Sun Moon and Stars
SkillEffect[SK.SG_SUN_WARM] = { effectId: 488 }; //Warmth of the Sun
SkillEffect[SK.SG_MOON_WARM] = { effectId: 488 }; //Warmth of the Moon
SkillEffect[SK.SG_STAR_WARM] = { effectId: 488 }; //Warmth of the Stars
SkillEffect[SK.SG_SUN_COMFORT] = { effectId: 441 }; //Comfort of the Sun
SkillEffect[SK.SG_MOON_COMFORT] = { effectId: 441 }; //Comfort of the Moon
SkillEffect[SK.SG_STAR_COMFORT] = { effectId: 441 }; //Comfort of the Stars
SkillEffect[SK.SG_HATE] = { /*475 - 484*/ groundEffectId: 487 }; //Hatred of the Sun Moon and Stars
SkillEffect[SK.SG_FUSION] = { effectId: [433, 'quake'] }; //Union of the Sun Moon and Stars
// Alchemist
SkillEffect[SK.AM_BERSERKPITCHER] = { beforeHitEffectId: 541, effectId: 220 }; //Aid Berserk Potion
// Soul Linker
SkillEffect[SK.SL_ALCHEMIST] = //↓		//Spirit of the Alchemist
	SkillEffect[SK.SL_MONK] = //↓		//Spirit of the Monk
	SkillEffect[SK.SL_STAR] = //↓		//Spirit of the Star Gladiator
	SkillEffect[SK.SL_SAGE] = //↓		//Spirit of the Sage
	SkillEffect[SK.SL_CRUSADER] = //↓		//Spirit of the Crusader
	SkillEffect[SK.SL_SUPERNOVICE] = //↓		//Spirit of the Supernovice
	SkillEffect[SK.SL_KNIGHT] = //↓		//Spirit of the Knight
	SkillEffect[SK.SL_WIZARD] = //↓		//Spirit of the Wizard
	SkillEffect[SK.SL_PRIEST] = //↓		//Spirit of the Priest
	SkillEffect[SK.SL_BARDDANCER] = //↓		//Spirit of the Artist
	SkillEffect[SK.SL_ROGUE] = //↓		//Spirit of the Rogue
	SkillEffect[SK.SL_ASSASIN] = //↓		//Spirit of the Assasin
	SkillEffect[SK.SL_BLACKSMITH] =
		{ effectId: [424, 503] }; //Spirit of the Blacksmith
// Blacksmith
SkillEffect[SK.BS_ADRENALINE2] = SkillEffect[SK.BS_ADRENALINE]; //Advanced Adrenaline Rush
// Soul Linker
SkillEffect[SK.SL_HUNTER] = //↓		//Spirit of the Hunter
	SkillEffect[SK.SL_SOULLINKER] = { effectId: [424, 503] }; //Spirit of the Soul Linker
SkillEffect[SK.SL_KAIZEL] = { effectId: 590 }; //Kaizel
SkillEffect[SK.SL_KAAHI] = { effectId: 543 }; //Kaahi
SkillEffect[SK.SL_KAUPE] = { effectId: 546 }; //Kaupe
SkillEffect[SK.SL_KAITE] = { effectId: 419 }; //Kaite
SkillEffect[SK.SL_STIN] = { effectId: 547 }; //Estin
SkillEffect[SK.SL_STUN] = { effectId: [555, 'ef_sl_stun'] }; //Estun
SkillEffect[SK.SL_SMA] = { effectId: 553, successEffectId: 425 }; //Esma
SkillEffect[SK.SL_SWOO] = { effectId: 589, successEffectId: 420 }; //Eswoo
SkillEffect[SK.SL_SKE] = { effectId: 427 }; //Eske
SkillEffect[SK.SL_SKA] = { effectId: [254, 261, 'quake'] }; //Eska
// Other 2nd Skills
SkillEffect[SK.SM_SELFPROVOKE] = {}; //Provoke Self
SkillEffect[SK.NPC_EMOTION_ON] = {}; //Emotion ON
SkillEffect[SK.ST_PRESERVE] = { beginCastEffectId: '496_beforecast', effectId: 496 }; //Preserve
SkillEffect[SK.ST_FULLSTRIP] = { successEffectId: 495 }; //Divest All
SkillEffect[SK.WS_WEAPONREFINE] = {}; //Upgrade Weapon
SkillEffect[SK.CR_SLIMPITCHER] = {}; //Aid Condensed Potion
SkillEffect[SK.CR_FULLPROTECTION] = { effectId: [300, 500] }; //Full Protection
SkillEffect[SK.PA_SHIELDCHAIN] = { beforeHitEffectId: 'ef_shield_projectile' }; //Shield Chain
SkillEffect[SK.PF_DOUBLECASTING] = { effectId: 521 }; //Double Casting
SkillEffect[SK.HW_GANBANTEIN] = { effectId: 223, groundEffectId: 224 }; //Ganbantein
SkillEffect[SK.HW_GRAVITATION] = { groundEffectId: '522_ground' }; //Gravitation Field
SkillEffect[SK.WS_CARTTERMINATION] = { effectId: 518 }; //Cart Termination
SkillEffect[SK.WS_OVERTHRUSTMAX] = SkillEffect[SK.BS_OVERTHRUST]; //Maximum Power Thrust
SkillEffect[SK.CG_LONGINGFREEDOM] = { effectId: 500 }; //Longing for Freedom
SkillEffect[SK.CG_HERMODE] = { effectId: '517_music', groundEffectId: 517 }; //Wand of Hermode
SkillEffect[SK.CG_TAROTCARD] = { successEffectId: 500 }; //Tarot Card of Fate
SkillEffect[SK.CR_ACIDDEMONSTRATION] = { effectId: 537 }; //Acid Demonstration
SkillEffect[SK.CR_CULTIVATION] = {}; //Plant Cultivation
SkillEffect[SK.ITEM_ENCHANTARMS] = {}; //Weapon Enchantment
SkillEffect[SK.TK_MISSION] = {/*effect/piring.wav*/}; //Taekwon Mission
SkillEffect[SK.SL_HIGH] = { effectId: [424, 503] }; //Spirit of Rebirth
SkillEffect[SK.KN_ONEHAND] = SkillEffect[SK.KN_TWOHANDQUICKEN]; //Onehand Quicken
SkillEffect[SK.AM_TWILIGHT1] = { effectId: 497 }; //Twilight Alchemy 1
SkillEffect[SK.AM_TWILIGHT2] = { effectId: 498 }; //Twilight Alchemy 2
SkillEffect[SK.AM_TWILIGHT3] = { effectId: 499 }; //Twilight Alchemy 3
SkillEffect[SK.HT_POWER] = {}; //Beast Strafing
// Gunslinger
SkillEffect[SK.GS_GLITTERING] = { effectId: 'gunslinger_coin' }; //Flip the Coin
SkillEffect[SK.GS_FLING] = {}; //Fling
SkillEffect[SK.GS_TRIPLEACTION] = { effectId: 648 }; //Triple Action
SkillEffect[SK.GS_BULLSEYE] = { effectId: 649 }; //Bulls Eye
SkillEffect[SK.GS_MADNESSCANCEL] = { effectId: 625 }; //Madness Canceller
SkillEffect[SK.GS_ADJUSTMENT] = { effectId: 626 }; //AdJustment
SkillEffect[SK.GS_INCREASING] = { effectId: [456, 'ef_gs_increasing'], effectIdOnCaster: 'ef_gs_increasing_cast' }; //Increasing Accuracy
SkillEffect[SK.GS_MAGICALBULLET] = { effectId: 644 }; //Magical Bullet
SkillEffect[SK.GS_CRACKER] = {/*effect\\cracker.wav*/}; //Cracker
SkillEffect[SK.GS_TRACKING] = { effectId: 646, hitEffectId: 647 }; //Tracking
SkillEffect[SK.GS_DISARM] = { effectId: 627 }; //Disarm
SkillEffect[SK.GS_PIERCINGSHOT] = {}; //Piercing Shot
SkillEffect[SK.GS_RAPIDSHOWER] = { effectId: 643 }; //Rapid Shower
SkillEffect[SK.GS_DESPERADO] = { effectId: 637 }; //Desperado
SkillEffect[SK.GS_GATLINGFEVER] = { effectId: 626 }; //Gatling Fever
SkillEffect[SK.GS_DUST] = { effectId: 628 }; //Dust
SkillEffect[SK.GS_FULLBUSTER] = { effectId: 584 }; //Full Buster
SkillEffect[SK.GS_SPREADATTACK] = { effectId: 645 }; //Spread Attack
SkillEffect[SK.GS_GROUNDDRIFT] = {}; //Ground Drift
// Ninja
SkillEffect[SK.NJ_SYURIKEN] = { beforeHitEffectId: 613 }; //Throw Shuriken
SkillEffect[SK.NJ_KUNAI] = { beforeHitEffectId: 614 }; //Throw Kunai
SkillEffect[SK.NJ_HUUMA] = { beforeHitEffectId: 615 }; //Throw Huuma Shuriken
SkillEffect[SK.NJ_ZENYNAGE] = { beforeHitEffectId: 616 }; //Throw Zeny
SkillEffect[SK.NJ_TATAMIGAESHI] = { groundEffectId: 631 }; //Improvised Defense
SkillEffect[SK.NJ_KASUMIKIRI] = { effectId: 632 }; //Vanishing Slash
SkillEffect[SK.NJ_SHADOWJUMP] = {}; //Shadow Leap
SkillEffect[SK.NJ_KIRIKAGE] = { effectId: 630 }; //Shadow Slash
SkillEffect[SK.NJ_UTSUSEMI] = {}; //Cicada Skin Sheeding
SkillEffect[SK.NJ_BUNSINJYUTSU] = { effectId: 617 }; //Mirror Image
SkillEffect[SK.NJ_KOUENKA] = { effectId: 618 }; //Crimson Fire Petal
SkillEffect[SK.NJ_KAENSIN] = { groundEffectId: 634 }; //Crimson Fire Formation
SkillEffect[SK.NJ_BAKUENRYU] = { effectId: 635 }; //Raging Fire Dragon
SkillEffect[SK.NJ_HYOUSENSOU] = { effectId: 619 }; //Spear of Ice
SkillEffect[SK.NJ_SUITON] = { groundEffectId: 620 }; //Hidden Water
SkillEffect[SK.NJ_HYOUSYOURAKU] = { effectId: 636 }; //Ice Meteor
SkillEffect[SK.NJ_HUUJIN] = { effectId: 621 }; //Wind Blade
SkillEffect[SK.NJ_RAIGEKISAI] = { effectId: 622 }; //Lightning Strike of Destruction
SkillEffect[SK.NJ_KAMAITACHI] = {}; //Kamaitachi
SkillEffect[SK.NJ_NEN] = {}; //Soul
SkillEffect[SK.NJ_ISSEN] = { effectId: 633 }; //Final Strike
// Additional NPC Skills (Episode 11.3)
SkillEffect[SK.NPC_EARTHQUAKE] = { effectIdOnCaster: 666 }; //Earthquake
SkillEffect[SK.NPC_FIREBREATH] = { effectId: 'ef_firebreath', hitEffectId: 49 }; //Fire Breath
SkillEffect[SK.NPC_ICEBREATH] = {}; //Ice Breath
SkillEffect[SK.NPC_THUNDERBREATH] = { hitEffectId: 52 }; //Thunder Breath
SkillEffect[SK.NPC_ACIDBREATH] = {}; //Acid Breath
SkillEffect[SK.NPC_DARKNESSBREATH] = {}; //Darkness Breath
SkillEffect[SK.NPC_DRAGONFEAR] = { effectId: 668 }; //Dragon Fear
SkillEffect[SK.NPC_BLEEDING] = {}; //Bleeding
SkillEffect[SK.NPC_PULSESTRIKE] = { effectIdOnCaster: 409 }; //Pulse Strike
SkillEffect[SK.NPC_HELLJUDGEMENT] = {}; //Hell's Judgement
SkillEffect[SK.NPC_WIDESILENCE] = {}; //Wide Silence
SkillEffect[SK.NPC_WIDEFREEZE] = { effectIdOnCaster: 89 }; //Wide Freeze
SkillEffect[SK.NPC_WIDEBLEEDING] = { effectIdOnCaster: 669 }; //Wide Bleeding
SkillEffect[SK.NPC_WIDESTONE] = {}; //Wide Petrify
SkillEffect[SK.NPC_WIDECONFUSE] = {}; //Wide Confusion
SkillEffect[SK.NPC_WIDESLEEP] = {}; //Wide Sleep
SkillEffect[SK.NPC_WIDESIGHT] = {}; //Wide Sight
SkillEffect[SK.NPC_EVILLAND] = { groundEffectId: 674 }; //Evil Land
SkillEffect[SK.NPC_MAGICMIRROR] = {}; //Magic Mirror
SkillEffect[SK.NPC_SLOWCAST] = {}; //Slow Cast
SkillEffect[SK.NPC_CRITICALWOUND] = { hitEffectId: 677 }; //Critical Wounds
SkillEffect[SK.NPC_EXPULSION] = {}; //Expulsion
SkillEffect[SK.NPC_STONESKIN] = {}; //Stone Skin
SkillEffect[SK.NPC_ANTIMAGIC] = {}; //Anti Magic
SkillEffect[SK.NPC_WIDECURSE] = {}; //Wide Curse
SkillEffect[SK.NPC_WIDESTUN] = {}; //Wide Stun
SkillEffect[SK.NPC_VAMPIRE_GIFT] = {}; //Vampire Gift
SkillEffect[SK.NPC_WIDESOULDRAIN] = {}; //Wide Soul Drain
// Cash Shop Skill
// Additional NPC skill (Episode 12)
SkillEffect[SK.NPC_TALK] = {}; //Talk
SkillEffect[SK.NPC_HELLPOWER] = {}; //Hell Power
SkillEffect[SK.NPC_WIDEHELLDIGNITY] = {}; //Hell Dignity
SkillEffect[SK.NPC_INVINCIBLE] = {}; //Invincible
SkillEffect[SK.NPC_INVINCIBLEOFF] = {}; //Invincible off
SkillEffect[SK.NPC_ALLHEAL] = {}; //Full Heal
// Additional Skill (??)
SkillEffect[SK.GM_SANDMAN] = {}; //GM Sandman
SkillEffect[SK.CASH_BLESSING] = SkillEffect[SK.AL_BLESSING]; //Party Blessing
SkillEffect[SK.CASH_INCAGI] = SkillEffect[SK.AL_INCAGI]; //Party Increase AGI
SkillEffect[SK.CASH_ASSUMPTIO] = SkillEffect[SK.HP_ASSUMPTIO]; //Party Assumptio
SkillEffect[SK.ALL_PARTYFLEE] = {}; //Party Flee
SkillEffect[SK.ALL_REVERSEORCISH] = {}; //Reverse Orcish
SkillEffect[SK.ALL_WEWISH] = { effectId: 717 }; //Christmas Carol
// New NPC Wide Status AoE Skills And Others
SkillEffect[SK.NPC_VENOMFOG] = { effectId: 1020 }; //Venom Fog
SkillEffect[SK.NPC_MAXPAIN] = {}; //Max Pain
SkillEffect[SK.NPC_MAXPAIN_ATK] = {}; //Max Pain Attack
// 2nd Quest Skills
SkillEffect[SK.KN_CHARGEATK] = { beginCastEffectId: 'white_pulse', hitEffectId: 'enemy_hit_normal1' }; //Charge Attack
SkillEffect[SK.CR_SHRINK] = { effectId: 599 }; //Shrink
SkillEffect[SK.AS_VENOMKNIFE] = { beforeHitEffectId: 600 }; //Throw Venom Knife
SkillEffect[SK.RG_CLOSECONFINE] = { effectId: 602, groundEffectId: 604 }; //Close Confine
SkillEffect[SK.WZ_SIGHTBLASTER] = { effectId: 601 }; //Sight Blaster
SkillEffect[SK.SA_CREATECON] = {}; //Create Elemental Converter
SkillEffect[SK.SA_ELEMENTWATER] = { effectId: 256 }; //Elemental Change Water
SkillEffect[SK.HT_PHANTASMIC] = { beforeHitEffectId: 'ef_arrow_projectile', hitEffectId: 1 }; //Phantasmic Arrow
SkillEffect[SK.BA_PANGVOICE] = { successEffectId: 606 }; //Pang Voice
SkillEffect[SK.DC_WINKCHARM] = { successEffectId: 607 }; //Wink of Charm
SkillEffect[SK.BS_GREED] = { effectId: 'ef_greed_sound' }; //Greed
SkillEffect[SK.PR_REDEMPTIO] = {}; //Redemptio
SkillEffect[SK.MO_KITRANSLATION] = {}; //Ki Translation
SkillEffect[SK.MO_BALKYOUNG] = { effectId: 514 }; //Ki Explosion
SkillEffect[SK.SA_ELEMENTGROUND] = { effectId: 258 }; //Elemental Change Earth
SkillEffect[SK.SA_ELEMENTFIRE] = { effectId: 255 }; //Elemental Change Fire
SkillEffect[SK.SA_ELEMENTWIND] = { effectId: 257 }; //Elemental Change Wind
// RK Rune Knight
SkillEffect[SK.RK_ENCHANTBLADE] = { effectId: 756 }; //Enchant Blade
SkillEffect[SK.RK_SONICWAVE] = { effectId: 832 }; //Sonic Wave
SkillEffect[SK.RK_DEATHBOUND] = {}; //Death Bound
SkillEffect[SK.RK_HUNDREDSPEAR] = { effectId: 723 }; //Hundred Spear
SkillEffect[SK.RK_WINDCUTTER] = { effectId: 'ef_rk_windcutter' }; //Wind Cutter
SkillEffect[SK.RK_IGNITIONBREAK] = { effectIdOnCaster: 722 }; //Ignition Break
SkillEffect[SK.RK_DRAGONBREATH] = { hitEffectId: 587 }; //Dragon Breath
SkillEffect[SK.RK_DRAGONHOWLING] = { effectId: 731 }; //Dragon Howling
SkillEffect[SK.RK_MILLENNIUMSHIELD] = { effectId: 749 }; //Millenium Shield
SkillEffect[SK.RK_CRUSHSTRIKE] = {}; //Crush Strike
SkillEffect[SK.RK_REFRESH] = {}; //Refresh
SkillEffect[SK.RK_GIANTGROWTH] = {}; //Giant Growth
SkillEffect[SK.RK_STONEHARDSKIN] = {}; //Stone Hard Skin
SkillEffect[SK.RK_VITALITYACTIVATION] = {}; //Vitality Activation
SkillEffect[SK.RK_STORMBLAST] = {}; //Storm Blast
SkillEffect[SK.RK_FIGHTINGSPIRIT] = {}; //Fighting Spirit //CHECK Is this splash needed?
SkillEffect[SK.RK_ABUNDANCE] = {}; //Abundance
SkillEffect[SK.RK_PHANTOMTHRUST] = {}; //Phantom Thrust
// WL Warlock
SkillEffect[SK.WL_WHITEIMPRISON] = { effectId: 802 }; //White Imprison
SkillEffect[SK.WL_SOULEXPANSION] = {
	effectIdOnCaster: 'ef_wl_soulexpansion_cast',
	hitEffectId: 'ef_wl_soulexpansion_hit'
}; //Soul Expansion
SkillEffect[SK.WL_FROSTMISTY] = { effectId: 726 }; //Frosty Misty
SkillEffect[SK.WL_JACKFROST] = { successEffectIdOnCaster: 'ef_jackfrost', hitEffectId: 28 }; //Jack Frost
SkillEffect[SK.WL_MARSHOFABYSS] = { effectId: 729 }; //Marsh of Abyss
SkillEffect[SK.WL_RECOGNIZEDSPELL] = { effectId: 803 }; //Recognized Spell
SkillEffect[SK.WL_SIENNAEXECRATE] = { effectId: 'ef_siennaexecrate' }; //Sienna Execrate
SkillEffect[SK.WL_STASIS] = { effectId: 799 }; //Stasis
SkillEffect[SK.WL_DRAINLIFE] = {}; //Drain Life
SkillEffect[SK.WL_CRIMSONROCK] = { effectId: 727 }; //Crimson Rock
SkillEffect[SK.WL_HELLINFERNO] = {
	groundEffectId: 728,
	effectId: 'ef_wl_hellinferno',
	effectIdOnCaster: 'ef_wl_hellinferno_cast'
}; //Hell Inferno
SkillEffect[SK.WL_COMET] = { effectId: 'ef_wl_comet', effectIdOnCaster: 'ef_wl_comet_cast' }; //Comet
SkillEffect[SK.WL_CHAINLIGHTNING] = { effectIdOnCaster: 'ef_wl_chainlightning_cast' }; //Chain Lightning
SkillEffect[SK.WL_CHAINLIGHTNING_ATK] = { effectId: 734 }; //Chain Lightning Attack
SkillEffect[SK.WL_EARTHSTRAIN] = { groundEffectId: 732 }; //Earth Strain
SkillEffect[SK.WL_TETRAVORTEX] = { effectId: 804, beginCastEffectId: 805 }; //Tetra Vortex
SkillEffect[SK.WL_TETRAVORTEX_FIRE] = { effectId: 'ef_wl_tetravortex_fire' }; //Tetra Vortex Fire
SkillEffect[SK.WL_TETRAVORTEX_WATER] = { effectId: 'ef_wl_tetravortex_water' }; //Tetra Vortex Water
SkillEffect[SK.WL_TETRAVORTEX_WIND] = { effectId: 'ef_wl_tetravortex_wind' }; //Tetra Vortex Wind
SkillEffect[SK.WL_TETRAVORTEX_GROUND] = {}; //Tetra Vortex Earth
SkillEffect[SK.WL_SUMMONFB] = {}; //Summon Fire Ball
SkillEffect[SK.WL_SUMMONBL] = {}; //Summon Lightning Ball
SkillEffect[SK.WL_SUMMONWB] = {}; //Summon Water Ball
SkillEffect[SK.WL_SUMMON_ATK_FIRE] = { effectId: 'ef_wl_summon_atk_fire' }; //Summon Attack Fire
SkillEffect[SK.WL_SUMMON_ATK_WIND] = {}; //Summon Attack Wind
SkillEffect[SK.WL_SUMMON_ATK_WATER] = {}; //Summon Attack Water
SkillEffect[SK.WL_SUMMON_ATK_GROUND] = {}; //Summon Attack Earth
SkillEffect[SK.WL_SUMMONSTONE] = {}; //Summon Stone
SkillEffect[SK.WL_RELEASE] = { effectId: 751 }; //Release //CHECK Should it be left to do multi hit or single hit?
SkillEffect[SK.WL_READING_SB] = {}; //Reading Spellbook
// GC Guillotine Cross
SkillEffect[SK.GC_VENOMIMPRESS] = { effectId: 788 }; //Venom Impress
SkillEffect[SK.GC_CROSSIMPACT] = { effectId: 'ef_gc_crossimpact' }; //Cross Impact
SkillEffect[SK.GC_DARKILLUSION] = {}; //Dark Illusion
SkillEffect[SK.GC_CREATENEWPOISON] = {}; //Create New Poison
SkillEffect[SK.GC_ANTIDOTE] = {}; //Antidote
SkillEffect[SK.GC_POISONINGWEAPON] = { effectId: 'ef_gc_poisoningweapon' }; //Poisoning Weapon
SkillEffect[SK.GC_WEAPONBLOCKING] = {}; //Weapon Blocking
SkillEffect[SK.GC_COUNTERSLASH] = { effectId: 'ef_gc_counterslash' }; //Counter Slash
SkillEffect[SK.GC_WEAPONCRUSH] = {}; //Weapon Crush
SkillEffect[SK.GC_VENOMPRESSURE] = {}; //Venom Pressure
SkillEffect[SK.GC_POISONSMOKE] = { effectId: 'ef_gc_poisonsmoke' }; //Poison Smoke
SkillEffect[SK.GC_CLOAKINGEXCEED] = {}; //Cloaking Exceed
SkillEffect[SK.GC_PHANTOMMENACE] = {}; //Phantom Menace
SkillEffect[SK.GC_HALLUCINATIONWALK] = { effectId: 'ef_hallucinationwalk' }; //Hallucination Walk
SkillEffect[SK.GC_ROLLINGCUTTER] = { effectId: 775 }; //Rolling Cutter
SkillEffect[SK.GC_CROSSRIPPERSLASHER] = { effectId: 'ef_gc_crossripperslasher' }; //Cross Ripper Slasher
// AB Arch Bishop
SkillEffect[SK.AB_JUDEX] = { effectId: 718, hitEffectId: 152 }; //Judex
SkillEffect[SK.AB_ANCILLA] = { effectId: 'ef_ancilla' }; //Ancilla
SkillEffect[SK.AB_ADORAMUS] = { effectId: 721 }; //Adoramus
SkillEffect[SK.AB_CLEMENTIA] = {}; //Crementia
SkillEffect[SK.AB_CANTO] = {}; //Canto Candidus
SkillEffect[SK.AB_CHEAL] = { effectId: 313 }; //Coluceo Heal
SkillEffect[SK.AB_EPICLESIS] = { effectId: 883, groundEffectId: 754 }; //Epiclesis
SkillEffect[SK.AB_PRAEFATIO] = {}; //Praefatio
SkillEffect[SK.AB_ORATIO] = { effectId: 755 /*effectId: 725*/ }; //Oratio
SkillEffect[SK.AB_LAUDAAGNUS] = {}; //Lauda Agnus
SkillEffect[SK.AB_LAUDARAMUS] = {}; //Lauda Ramus
SkillEffect[SK.AB_RENOVATIO] = {}; //Renovatio
SkillEffect[SK.AB_HIGHNESSHEAL] = { effectId: 325, hitEffectId: 320 }; //Highness Heal //CHECK Info shows this has magic attack.
SkillEffect[SK.AB_CLEARANCE] = { effectId: 753 }; //Clearance
SkillEffect[SK.AB_EXPIATIO] = {}; //Expiatio //CHECK Does this also give the buff to party members?
SkillEffect[SK.AB_DUPLELIGHT] = { effectId: 'ef_duplelight' }; //Duple Light //CHECK Had issues adding a skill level check to make the % go higher with the skills level. Will do later.
SkillEffect[SK.AB_DUPLELIGHT_MELEE] = {}; //Duple Light Melee
SkillEffect[SK.AB_DUPLELIGHT_MAGIC] = {}; //Duple Light Magic
SkillEffect[SK.AB_SILENTIUM] = {}; //Silentium //CHECk Marked magic attack as well. Hmmmm....
SkillEffect[SK.AB_SECRAMENT] = { effectId: 'ef_ab_secrament' }; //Secrament
// RA Ranger
SkillEffect[SK.RA_ARROWSTORM] = { effectId: 746 }; //Arrow Storm
SkillEffect[SK.RA_FEARBREEZE] = { effectId: 'ef_ra_fearbreeze' }; //Fear Breeze
SkillEffect[SK.RA_AIMEDBOLT] = { effectId: 745, beforeHitEffectId: 'ef_arrow_projectile' }; //Aimed Bolt
SkillEffect[SK.RA_DETONATOR] = { effectId: 750 }; //Detonator
SkillEffect[SK.RA_ELECTRICSHOCKER] = {}; //Electric Shocker
SkillEffect[SK.RA_CLUSTERBOMB] = {}; //Cluster Bomb
SkillEffect[SK.RA_WUGMASTERY] = {}; //Warg Mastery
SkillEffect[SK.RA_WUGRIDER] = { effectId: 'ef_wugrider' }; //Warg Rider
SkillEffect[SK.RA_WUGDASH] = {}; //Warg Dash
SkillEffect[SK.RA_WUGSTRIKE] = { effectId: 'ef_wugstrike' }; //Warg Strike
SkillEffect[SK.RA_WUGBITE] = { effectId: 'ef_wugbite' }; //Warg Bite
SkillEffect[SK.RA_SENSITIVEKEEN] = {}; //Sensitive Keen
SkillEffect[SK.RA_CAMOUFLAGE] = { effectId: 744 }; //Camouflage
SkillEffect[SK.RA_MAGENTATRAP] = { groundEffectId: 739 }; //Magenta Trap
SkillEffect[SK.RA_COBALTTRAP] = { groundEffectId: 740 }; //Cobalt Trap
SkillEffect[SK.RA_MAIZETRAP] = { groundEffectId: 741 }; //Maize Trap
SkillEffect[SK.RA_VERDURETRAP] = { groundEffectId: 742 }; //Verdure Trap
SkillEffect[SK.RA_FIRINGTRAP] = {}; //Firing Trap
SkillEffect[SK.RA_ICEBOUNDTRAP] = {}; //Icebound Trap
// NC Mechanic
SkillEffect[SK.NC_BOOSTKNUCKLE] = {}; //Boost Knuckle
SkillEffect[SK.NC_PILEBUNKER] = {}; //Pile Bunker
SkillEffect[SK.NC_VULCANARM] = { effectId: 'ef_nc_vulcanarm' }; //Vulcan Arm
SkillEffect[SK.NC_FLAMELAUNCHER] = { effectId: 787 }; //Flame Launcher
SkillEffect[SK.NC_COLDSLOWER] = {}; //Cold Slower
SkillEffect[SK.NC_ARMSCANNON] = { effectIdOnCaster: 'ef_nc_armscannon_cast' }; //Arm Cannon
SkillEffect[SK.NC_ACCELERATION] = {}; //Acceleration
SkillEffect[SK.NC_HOVERING] = {}; //Hovering
SkillEffect[SK.NC_F_SIDESLIDE] = {}; //Front-Side Slide
SkillEffect[SK.NC_B_SIDESLIDE] = {}; //Back-Side Slide
SkillEffect[SK.NC_SELFDESTRUCTION] = {}; //Self Destruction
SkillEffect[SK.NC_SHAPESHIFT] = {}; //Shape Shift
SkillEffect[SK.NC_EMERGENCYCOOL] = {}; //Emergency Cool
SkillEffect[SK.NC_INFRAREDSCAN] = { effectId: 794 }; //Infrared Scan
SkillEffect[SK.NC_ANALYZE] = {}; //Analyze
SkillEffect[SK.NC_MAGNETICFIELD] = { effectId: 781 }; //Magnetic Field
SkillEffect[SK.NC_NEUTRALBARRIER] = {}; //Neutral Barrier
SkillEffect[SK.NC_STEALTHFIELD] = {}; //Stealth Field
SkillEffect[SK.NC_REPAIR] = { effectId: 'ef_nc_repair' }; //Repair
SkillEffect[SK.NC_AXEBOOMERANG] = {
	effectId: 'ef_nc_axeboomerang',
	effectIdOnCaster: 'ef_nc_axeboomerang_cast',
	hitEffectId: 'ef_nc_axeboomerang_hit'
}; //Axe Boomerang
SkillEffect[SK.NC_POWERSWING] = { effectId: 795 }; //Power Swing
SkillEffect[SK.NC_AXETORNADO] = { effectId: 'ef_nc_axetornado' }; //Axe Tornado
SkillEffect[SK.NC_SILVERSNIPER] = {}; //FAW - Silver Sniper
SkillEffect[SK.NC_MAGICDECOY] = {}; //FAW - Magic Decoy
SkillEffect[SK.NC_DISJOINT] = {}; //FAW Removal
// SC Shadow Chaser
SkillEffect[SK.SC_FATALMENACE] = { effectId: 'ef_sc_fatalmenace', effectIdOnCaster: 'ef_sc_fatalmenace_cast' }; //Fatal Menace
SkillEffect[SK.SC_REPRODUCE] = { effectId: 'ef_sc_reproduce' }; //Reproduce
SkillEffect[SK.SC_AUTOSHADOWSPELL] = { effectId: 'ef_sc_autoshadowspell' }; //Auto Shadow Spell
SkillEffect[SK.SC_SHADOWFORM] = {}; //Shadow Form
SkillEffect[SK.SC_TRIANGLESHOT] = { beforeHitEffectId: 'ef_arrow_projectile' }; //Triangle Shot
SkillEffect[SK.SC_BODYPAINT] = { effectId: 811 }; //Body Painting
SkillEffect[SK.SC_INVISIBILITY] = {}; //Invisibility
SkillEffect[SK.SC_DEADLYINFECT] = {}; //Deadly Infect
SkillEffect[SK.SC_ENERVATION] = { effectId: 813 }; //Masquerade - Enervation
SkillEffect[SK.SC_GROOMY] = { effectId: 814 }; //Masquerade - Gloomy
SkillEffect[SK.SC_IGNORANCE] = { effectId: 815 }; //Masquerade - Ignorance
SkillEffect[SK.SC_LAZINESS] = { effectId: 816 }; //Masquerade - Laziness
SkillEffect[SK.SC_UNLUCKY] = { effectId: 817 }; //Masquerade - Unlucky
SkillEffect[SK.SC_WEAKNESS] = { effectId: 818 }; //Masquerade - Weakness
SkillEffect[SK.SC_STRIPACCESSARY] = { effectId: 820 }; //Strip Accessory
SkillEffect[SK.SC_MANHOLE] = { groundEffectId: 822, successEffectId: 823 }; //Man Hole
SkillEffect[SK.SC_DIMENSIONDOOR] = { groundEffectId: 825 }; //Dimension Door
SkillEffect[SK.SC_CHAOSPANIC] = { groundEffectId: 827 }; //Chaos Panic
SkillEffect[SK.SC_MAELSTROM] = { groundEffectId: 828 }; //Maelstrom
SkillEffect[SK.SC_BLOODYLUST] = { groundEffectId: 829 }; //Bloody Lust
SkillEffect[SK.SC_FEINTBOMB] = {}; //Feint Bomb
// LG Royal Guard
SkillEffect[SK.LG_CANNONSPEAR] = { effectId: ['ef_cannonspear', 'ef_lg_cannonspear'] }; //Cannon Spear
SkillEffect[SK.LG_BANISHINGPOINT] = { effectId: 'ef_banishingpoint', effectIdOnCaster: 'ef_lg_banishingpoint_cast' }; //Banishing Point
SkillEffect[SK.LG_TRAMPLE] = { effectId: 'ef_trample' }; //Trample
SkillEffect[SK.LG_SHIELDPRESS] = { beforeHitEffectId: 906 }; //Shield Press
SkillEffect[SK.LG_REFLECTDAMAGE] = { effectId: 'ef_reflectdamage' }; //Reflect Damage
SkillEffect[SK.LG_PINPOINTATTACK] = { effectId: 'ef_pinpointattack' }; //Pinpoint Attack
SkillEffect[SK.LG_FORCEOFVANGUARD] = {}; //Force of Vanguard
SkillEffect[SK.LG_RAGEBURST] = { effectId: 'ef_rageburst' }; //Rage Burst
SkillEffect[SK.LG_SHIELDSPELL] = { effectId: 'ef_shieldspell' }; //Shield Spell
SkillEffect[SK.LG_EXEEDBREAK] = { effectId: 'ef_exceedbreak' }; //Exceed Break
SkillEffect[SK.LG_OVERBRAND] = {
	effectId: 'ef_overbrand',
	effectIdOnCaster: 'ef_lg_overbrand_cast',
	hitEffectId: 'ef_lg_overbrand_hit'
}; //Over Brand
SkillEffect[SK.LG_PRESTIGE] = { effectId: 908 }; //Prestige
SkillEffect[SK.LG_BANDING] = { effectId: 909 }; //Banding //CHECK Splash isnt needed right? Banding has its own UNIT ID.
SkillEffect[SK.LG_MOONSLASHER] = { effectId: 'ef_moonslasher' }; //Moon Slasher
SkillEffect[SK.LG_RAYOFGENESIS] = {
	effectId: ['ef_rayofgenesis', 'ef_lg_rayofgenesis'],
	effectIdOnCaster: 'ef_lg_rayofgenesis_cast',
	hitEffectId: 'ef_lg_rayofgenesis_hit'
}; //Ray of Genesis
SkillEffect[SK.LG_PIETY] = { effectId: 'ef_piety' }; //Piety
SkillEffect[SK.LG_EARTHDRIVE] = { effectId: ['ef_earthdrive', 'ef_lg_earthdrive'] }; //Earth Drive
SkillEffect[SK.LG_HESPERUSLIT] = { effectId: 'ef_hesperuslit' }; //Hesperus Lit
SkillEffect[SK.LG_INSPIRATION] = { effectId: 910 }; //Inspiration
SkillEffect[2519 /* LG_OVERBRAND_BRANDISH */] = {
	effectIdOnCaster: 'ef_lg_overbrand_brandish_cast',
	hitEffectId: 'ef_lg_overbrand_brandish_hit'
}; //Overbrand Brandish
SkillEffect[2520 /* LG_OVERBRAND_PLUSATK */] = {
	effectIdOnCaster: 'ef_lg_overbrand_plusatk_cast',
	hitEffectId: 'ef_lg_overbrand_plusatk_hit'
}; //Overbrand Plus Attack
// SR Sura
SkillEffect[SK.SR_DRAGONCOMBO] = { effectId: 'ef_dragoncombo' }; //Dragon Combo
SkillEffect[SK.SR_SKYNETBLOW] = { effectId: 'ef_skynetblow' }; //Sky Net Blow
SkillEffect[SK.SR_EARTHSHAKER] = { effectId: 888 }; //Earth Shaker
SkillEffect[SK.SR_FALLENEMPIRE] = {
	effectId: ['ef_fallenempire', 'ef_sr_fallenempire'],
	hitEffectId: 'ef_sr_fallenempire_hit'
}; //Fallen Empire
SkillEffect[SK.SR_TIGERCANNON] = { effectId: ['ef_tigercannon', 'ef_sr_tigercannon'] }; //Tiger Cannon
SkillEffect[SK.SR_RAMPAGEBLASTER] = { effectId: ['ef_rampageblaster', 'ef_sr_rampageblaster'] }; //Rampage Blaster
SkillEffect[SK.SR_CRESCENTELBOW] = { effectId: 'ef_crescentelbow' }; //Crescent Elbow
SkillEffect[SK.SR_CURSEDCIRCLE] = { effectId: 'ef_cursedcircle' }; //Cursed Circle
SkillEffect[SK.SR_LIGHTNINGWALK] = { effectId: ['ef_lightningwalk', 'ef_sr_lightningwalk'] }; //Lightning Walk
SkillEffect[SK.SR_KNUCKLEARROW] = { effectId: 'ef_knucklearrow' }; //Knuckle Arrow
SkillEffect[SK.SR_WINDMILL] = { effectId: 'ef_windmill' }; //Windmill
SkillEffect[SK.SR_RAISINGDRAGON] = { effectId: 'ef_raisingdragon' }; //Raising Dragon
SkillEffect[SK.SR_ASSIMILATEPOWER] = {}; //Assimilate Power
SkillEffect[SK.SR_POWERVELOCITY] = { effectId: 'ef_powervelocity' }; //Power Velocity
SkillEffect[SK.SR_CRESCENTELBOW_AUTOSPELL] = {}; //Crescent Elbow Autospell
SkillEffect[SK.SR_GATEOFHELL] = { effectId: 'ef_gateofhell', effectIdOnCaster: 'ef_sr_gateofhell_cast' }; //Gate of Hell
SkillEffect[SK.SR_GENTLETOUCH_QUIET] = {}; //Gentle Touch - Quiet
SkillEffect[SK.SR_GENTLETOUCH_CURE] = {}; //Gentle Touch - Cure
SkillEffect[SK.SR_GENTLETOUCH_ENERGYGAIN] = {}; //Gentle Touch - Energy Gain
SkillEffect[SK.SR_GENTLETOUCH_CHANGE] = {}; //Gentle Touch - Change
SkillEffect[SK.SR_GENTLETOUCH_REVITALIZE] = {}; //Gentle Touch - Revitalize
//More from Sura but not following ID order
SkillEffect[SK.SR_HOWLINGOFLION] = {
	effectId: ['ef_howlingoflion', 'ef_sr_howlingoflion'],
	effectIdOnCaster: 'ef_sr_howlingoflion_cast',
	hitEffectId: 'ef_sr_howlingoflion_hit'
}; //Howling of Lion
SkillEffect[SK.SR_RIDEINLIGHTNING] = { effectId: 'ef_rideinlightning' }; //Ride In Lightening
// WA Wanderer
SkillEffect[SK.WA_SWING_DANCE] = { effectId: 'ef_swing_dance' }; //Swing Dance
SkillEffect[SK.WA_SYMPHONY_OF_LOVER] = { effectId: 'ef_symphony_of_lovers' }; //Symphony of Lovers
SkillEffect[SK.WA_MOONLIT_SERENADE] = { effectId: 'ef_moonlit_serenade' }; //Moonlit Serenade
// MI Minstrel
SkillEffect[SK.MI_RUSH_WINDMILL] = { effectId: 'ef_rush_windmill' }; //Windmill Rush Attack
SkillEffect[SK.MI_ECHOSONG] = { effectId: 'ef_echo_song' }; //Echo Song
SkillEffect[SK.MI_HARMONIZE] = { effectId: 'ef_harmonize' }; //Harmonize
// WM Wanderer/Minstrel
SkillEffect[SK.WM_METALICSOUND] = {
	effectId: ['ef_metalicsound', 'ef_wm_metalicsound'],
	hitEffectId: 'ef_wm_metalicsound_hit'
}; //Metallic Sound
SkillEffect[SK.WM_REVERBERATION] = { groundEffectId: 856 }; //Reverberation
SkillEffect[SK.WM_REVERBERATION_MELEE] = { effectId: 860 }; //Reverberation Melee
SkillEffect[SK.WM_REVERBERATION_MAGIC] = { hitEffectId: 'ef_wm_reverberation_magic_hit' }; //Reverberation Magic
SkillEffect[SK.WM_DOMINION_IMPULSE] = { effectId: 863 }; //Dominion Impulse
SkillEffect[SK.WM_SEVERE_RAINSTORM] = {
	effectId: [857, 'ef_wm_severe_rainstorm'],
	effectIdOnCaster: 'ef_wm_severe_rainstorm_cast'
}; //Severe Rainstorm
SkillEffect[SK.WM_POEMOFNETHERWORLD] = { groundEffectId: 860 }; //Poem of The Netherworld
SkillEffect[SK.WM_VOICEOFSIREN] = { groundEffectId: 879 }; //Voice of Siren
SkillEffect[SK.WM_DEADHILLHERE] = { effectId: 'ef_valley_of_death' }; //Valley of Death
SkillEffect[SK.WM_LULLABY_DEEPSLEEP] = { effectId: 858 }; //Deep Sleep Lullaby
SkillEffect[SK.WM_SIRCLEOFNATURE] = { effectId: 861 }; //Circle of Nature's Sound
SkillEffect[SK.WM_RANDOMIZESPELL] = { effectId: 862 }; //Improvised Song
SkillEffect[SK.WM_GLOOMYDAY] = { effectId: 847 /*848*/ }; //Gloomy Day
SkillEffect[SK.WM_GREAT_ECHO] = { effectId: 'ef_great_echo' }; //Great Echo
SkillEffect[SK.WM_SONG_OF_MANA] = { groundEffectId: 868, effectIdOnCaster: 865 }; //Song of Mana
SkillEffect[SK.WM_DANCE_WITH_WUG] = { groundEffectId: 866, effectIdOnCaster: 867 }; //Dance With A Warg
SkillEffect[SK.WM_SOUND_OF_DESTRUCTION] = {
	effectId: 'ef_sound_of_destruction',
	effectIdOnCaster: 'ef_wm_sound_of_destruction_cast'
}; //Sound of Destruction
SkillEffect[SK.WM_SATURDAY_NIGHT_FEVER] = { groundEffectId: 870, effectIdOnCaster: 871 }; //Saturday Night Fever
SkillEffect[SK.WM_LERADS_DEW] = { groundEffectId: 872, effectIdOnCaster: 871 }; //Lerad's Dew
SkillEffect[SK.WM_MELODYOFSINK] = { groundEffectId: 874, effectIdOnCaster: 873 }; //Melody of Sink
SkillEffect[SK.WM_BEYOND_OF_WARCRY] = { groundEffectId: 876, effectIdOnCaster: 875 }; //Warcry of Beyond
SkillEffect[SK.WM_UNLIMITED_HUMMING_VOICE] = { groundEffectId: 878, effectId: 'ef_wm_unlimited_humming_voice' }; //Unlimited Humming Voice
SkillEffect[SK.WM_SEVERE_RAINSTORM_MELEE] = {
	effectId: 'ef_wm_severe_rainstorm_melee',
	effectIdOnCaster: 'ef_wm_severe_rainstorm_melee_cast'
}; //Severe Rainstorm Melee
// SO Sorcerer
SkillEffect[SK.SO_FIREWALK] = { groundEffectId: 920 }; //Fire Walk //CHECK Video and data shows each cell only hits once.
SkillEffect[SK.SO_ELECTRICWALK] = { groundEffectId: 926 }; //Electric Walk
SkillEffect[SK.SO_SPELLFIST] = {}; //Spell Fist
SkillEffect[SK.SO_EARTHGRAVE] = { effectId: 'ef_so_earthgrave', hitEffectId: 'ef_so_earthgrave_hit' }; //Earth Grave
SkillEffect[SK.SO_DIAMONDDUST] = { effectId: [928, 'ef_so_diamonddust'], effectIdOnCaster: 'ef_so_diamonddust_cast' }; //Diamond Dust
SkillEffect[SK.SO_POISON_BUSTER] = { effectId: 'ef_so_poison_buster' }; //Poison Buster
SkillEffect[SK.SO_PSYCHIC_WAVE] = {
	effectId: [922, 'ef_so_psychic_wave'],
	effectIdOnCaster: 'ef_so_psychic_wave_cast'
}; //Psychic Wave
SkillEffect[SK.SO_CLOUD_KILL] = {}; //Cloud Kill
SkillEffect[SK.SO_STRIKING] = {}; //Striking
SkillEffect[SK.SO_WARMER] = { effectId: 929 }; //Warmer
SkillEffect[SK.SO_VACUUM_EXTREME] = { effectId: 921 }; //Vacuum Extreme
SkillEffect[SK.SO_VARETYR_SPEAR] = { beforeHitEffectId: 930 }; //Varetyr Spear
SkillEffect[SK.SO_ARRULLO] = {}; //Arrullo
SkillEffect[SK.SO_EL_CONTROL] = {}; //Spirit Control
SkillEffect[SK.SO_SUMMON_AGNI] = {}; //Summon Fire Spirit Agni
SkillEffect[SK.SO_SUMMON_AQUA] = {}; //Summon Water Spirit Aqua
SkillEffect[SK.SO_SUMMON_VENTUS] = {}; //Summon Wind Spirit Ventus
SkillEffect[SK.SO_SUMMON_TERA] = {}; //Summon Earth Spirit Tera
SkillEffect[SK.SO_EL_ACTION] = {}; //Elemental Action
SkillEffect[SK.SO_EL_ANALYSIS] = {}; //Four Spirit Analysis
SkillEffect[SK.SO_EL_CURE] = { effectId: 'ef_so_el_cure' }; //Spirit Recovery
SkillEffect[SK.SO_FIRE_INSIGNIA] = {}; //Fire Insignia
SkillEffect[SK.SO_WATER_INSIGNIA] = {}; //Water Insignia
SkillEffect[SK.SO_WIND_INSIGNIA] = {}; //Wind Insignia
SkillEffect[SK.SO_EARTH_INSIGNIA] = {}; //Earth Insignia
// GN Genetic
SkillEffect[SK.GN_CART_TORNADO] = { effectId: 'ef_gn_cart_tornado' }; //Cart Tornado
SkillEffect[SK.GN_CARTCANNON] = { effectId: 'ef_gn_cartcannon', effectIdOnCaster: 'ef_gn_cartcannon_cast' }; //Cart Cannon
SkillEffect[SK.GN_CARTBOOST] = { effectId: 'ef_gn_cartboost' }; //Cart Boost
SkillEffect[SK.GN_THORNS_TRAP] = { effectId: 'ef_thorntrap' }; //Thorn Trap
SkillEffect[SK.GN_BLOOD_SUCKER] = {}; //Blood Sucker //CHECK Data says its a magic attack. Hmmmm....
SkillEffect[SK.GN_SPORE_EXPLOSION] = {}; //Spore Explosion //CHECK Data says its element is set to neutral. Need to confirm.
SkillEffect[SK.GN_WALLOFTHORN] = { effectIdOnCaster: 'ef_gn_wallofthorn_cast' }; //Wall of Thorns
SkillEffect[SK.GN_CRAZYWEED] = { effectId: 915 }; //Crazy Weed
SkillEffect[SK.GN_CRAZYWEED_ATK] = {}; //Crazy Weed Attack
SkillEffect[SK.GN_DEMONIC_FIRE] = { effectId: 916 }; //Demonic Fire
SkillEffect[SK.GN_FIRE_EXPANSION] = { effectId: 917 }; //Fire Expansion
SkillEffect[SK.GN_FIRE_EXPANSION_SMOKE_POWDER] = { effectId: 918 }; //Fire Expansion Smoke Powder
SkillEffect[SK.GN_FIRE_EXPANSION_TEAR_GAS] = {}; //Fire Expansion Tear Gas
SkillEffect[SK.GN_FIRE_EXPANSION_ACID] = {}; //Fire Expansion Acid
SkillEffect[SK.GN_HELLS_PLANT] = { effectId: 919 }; //Hell's Plant
SkillEffect[SK.GN_HELLS_PLANT_ATK] = {}; //Hell's Plant Attack
SkillEffect[SK.GN_MANDRAGORA] = { effectId: 'ef_gn_mandragora', effectIdOnCaster: 'ef_gn_mandragora_cast' }; //Howling of Mandragora
SkillEffect[SK.GN_SLINGITEM] = {}; //Sling Item
SkillEffect[SK.GN_CHANGEMATERIAL] = { effectId: 'ef_gn_changematerial' }; //Change Material
SkillEffect[SK.GN_MIX_COOKING] = {}; //Mix Cooking
SkillEffect[SK.GN_MAKEBOMB] = {}; //Create Bomb
SkillEffect[SK.GN_S_PHARMACY] = {}; //Special Pharmacy
SkillEffect[SK.GN_SLINGITEM_RANGEMELEEATK] = {}; //Sling Item Attack
// Episode 13.3
SkillEffect[SK.ALL_ODINS_RECALL] = {}; //Odin's Recall
SkillEffect[SK.RETURN_TO_ELDICASTES] = {}; //Return To Eldicastes
SkillEffect[SK.ALL_BUYING_STORE] = {}; //Open Buying Store
SkillEffect[SK.ALL_GUARDIAN_RECALL] = {}; //Guardian's Recall
SkillEffect[SK.ALL_ODINS_POWER] = {}; //Odin's Power
SkillEffect[SK.MC_CARTDECORATE] = {}; //Decorate Cart
// Rebellion
SkillEffect[SK.RL_RICHS_COIN] = {}; //Rich's Coin
SkillEffect[SK.RL_MASS_SPIRAL] = {}; //Mass Spiral
SkillEffect[SK.RL_BANISHING_BUSTER] = {}; //Banishing Buster
SkillEffect[SK.RL_B_TRAP] = {}; //Bind Trap
SkillEffect[SK.RL_FLICKER] = {}; //Flicker
SkillEffect[SK.RL_S_STORM] = { effectId: 'ef_s_storm' }; //Shatter Storm
SkillEffect[SK.RL_E_CHAIN] = { effectId: 'ef_rl_e_chain' }; //Eternal Chain
SkillEffect[SK.RL_QD_SHOT] = {}; //Quick Draw Shot
SkillEffect[SK.RL_C_MARKER] = { successEffectId: 'ef_c_marker1' }; //Crimson Marker
SkillEffect[SK.RL_FIREDANCE] = { effectId: 'ef_rl_firedance' }; //Fire Dance
SkillEffect[SK.RL_H_MINE] = { effectId: 'ef_rl_h_mine' }; //Howling Mine
SkillEffect[SK.RL_P_ALTER] = { effectId: 'ef_rl_p_alter' }; //Platinum Alter
SkillEffect[SK.RL_FALLEN_ANGEL] = { effectId: 'ef_rl_fallen_angel' }; //Fallen Angel
SkillEffect[SK.RL_R_TRIP] = {}; //Round Trip
SkillEffect[SK.RL_D_TAIL] = { effectId: 'ef_rl_d_tail' }; //Dragon Tail
SkillEffect[SK.RL_FIRE_RAIN] = { effectId: 'ef_rl_fire_rain' }; //Fire Rain
SkillEffect[SK.RL_HEAT_BARREL] = { effectId: 'ef_rl_heat_barrel' }; //Heat Barrel
SkillEffect[SK.RL_AM_BLAST] = {}; //Anti-Material Blast
SkillEffect[SK.RL_SLUGSHOT] = { effectId: 'ef_rl_slugshot' }; //Slug Shot
SkillEffect[SK.RL_HAMMER_OF_GOD] = {}; //Hammer of God
SkillEffect[SK.RL_R_TRIP_PLUSATK] = {}; //Round Trip Plus Attack
SkillEffect[SK.NW_INTENSIVE_AIM] = { effectId: 'ef_nw_intensive_aim' }; //Intensive Aim
SkillEffect[SK.NW_GRENADE_FRAGMENT] = { effectId: 'ef_nw_grenade_fragment' }; //Grenade Fragment
SkillEffect[SK.NW_THE_VIGILANTE_AT_NIGHT] = { effectId: 'ef_nw_the_vigilante_at_night' }; //The Vigilante at Night
SkillEffect[SK.NW_ONLY_ONE_BULLET] = { effectId: 'ef_nw_only_one_bullet', hitEffectId: 'ef_nw_only_one_bullet_hit' }; //Only One Bullet
SkillEffect[SK.NW_SPIRAL_SHOOTING] = { effectId: 'ef_nw_spiral_shooting' }; //Spiral Shooting
SkillEffect[SK.NW_MAGAZINE_FOR_ONE] = { effectId: 'ef_nw_magazine_for_one' }; //Magazine for One
SkillEffect[SK.NW_WILD_FIRE] = { effectId: 'ef_nw_wild_fire' }; //Wild Fire
SkillEffect[SK.NW_BASIC_GRENADE] = { effectId: 'ef_nw_basic_grenade' }; //Basic Grenade
SkillEffect[SK.NW_GRENADES_DROPPING] = { effectId: 'ef_nw_grenades_dropping' }; //Grenades Dropping
SkillEffect[SK.NW_AUTO_FIRING_LAUNCHER] = { effectId: 'ef_nw_auto_firing_launcher' }; //Auto Firing Launcher
SkillEffect[SK.NW_HIDDEN_CARD] = { effectId: 'ef_nw_hidden_card' }; //Hidden Card
SkillEffect[SK.NW_MISSION_BOMBARD] = { effectId: 'ef_nw_mission_bombard', hitEffectId: 'ef_nw_mission_bombard_hit' }; //Mission Bombard
SkillEffect[5500 /* NW_WILD_SHOT */] = {
	effectId: 'ef_nw_wild_shot',
	effectIdOnCaster: 'ef_nw_wild_shot_cast',
	hitEffectId: 'ef_nw_wild_shot_hit'
}; //Wild Shot
SkillEffect[5501 /* NW_MIDNIGHT_FALLEN */] = {
	effectId: 'ef_nw_midnight_fallen',
	effectIdOnCaster: 'ef_nw_midnight_fallen_cast'
}; //Midnight Fallen
// Kagerou & Oboro
SkillEffect[SK.KO_YAMIKUMO] = {}; //Shadow Hiding
SkillEffect[SK.KO_JYUMONJIKIRI] = { effectId: 'ef_ko_jyumonjikiri' }; //Cross Slash
SkillEffect[SK.KO_SETSUDAN] = { effectId: 'ef_ko_setsudan' }; //Soul Cutter
SkillEffect[SK.KO_BAKURETSU] = {}; //Kunai Explosion
SkillEffect[SK.KO_HAPPOKUNAI] = {}; //Kunai Splash
SkillEffect[SK.KO_MUCHANAGE] = {}; //Rapid Throw
SkillEffect[SK.KO_HUUMARANKA] = {}; //Swirling Petal
SkillEffect[SK.KO_MAKIBISHI] = {}; //Makibishi
SkillEffect[SK.KO_MEIKYOUSISUI] = {}; //Pure Soul
SkillEffect[SK.KO_ZANZOU] = {}; //Illusion - Shadow
SkillEffect[SK.KO_KYOUGAKU] = {}; //Illusion - Shock
SkillEffect[SK.KO_JYUSATSU] = {}; //Illusion - Death
SkillEffect[SK.KO_KAHU_ENTEN] = {}; //Fire Charm
SkillEffect[SK.KO_HYOUHU_HUBUKI] = {}; //Ice Charm
SkillEffect[SK.KO_KAZEHU_SEIRAN] = {}; //Wind Charm
SkillEffect[SK.KO_DOHU_KOUKAI] = {}; //Earth Charm
SkillEffect[SK.KO_KAIHOU] = {}; //Release Ninja Spell
SkillEffect[SK.KO_ZENKAI] = {}; //Cast Ninja Spell
SkillEffect[SK.KO_GENWAKU] = {}; //Illusion - Bewitch
SkillEffect[SK.KO_IZAYOI] = {}; //16th Night
SkillEffect[SK.SS_TOKEDASU] = { effectId: 'ef_ss_tokedasu' }; //Melt Away
SkillEffect[SK.SS_SHIMIRU] = { effectId: 'ef_ss_shimiru' }; //Infiltrate
SkillEffect[SK.SS_AKUMUKESU] = { effectId: 'ef_ss_akumukesu' }; //Nightmare Erasion
SkillEffect[SK.SS_KAGEGARI] = { effectId: 'ef_ss_kagegari' }; //Shadow Hunting
SkillEffect[SK.SS_KAGENOMAI] = { effectId: 'ef_ss_kagenomai' }; //Shadow Dance
SkillEffect[SK.SS_KAGEGISSEN] = { effectId: 'ef_ss_kagegissen', hitEffectId: 'ef_ss_kagegissen_hit' }; //Shadow Flash
SkillEffect[SK.SS_FUUMASHOUAKU] = { effectId: 'ef_ss_fuumashouaku' }; //Huuma Shuriken - Grasp
SkillEffect[SK.SS_FUUMAKOUCHIKU] = { effectId: 'ef_ss_fuumakouchiku' }; //Huuma Shuriken - Construct
SkillEffect[SK.SS_KUNAIWAIKYOKU] = { effectId: 'ef_ss_kunaiwaikyoku' }; //Kunai - Distortion
SkillEffect[SK.SS_KUNAIKAITEN] = { effectId: 'ef_ss_kunaikaiten' }; //Kunai - Rotation
SkillEffect[SK.SS_KUNAIKUSSETSU] = { effectId: 'ef_ss_kunaikussetsu' }; //Kunai - Refraction
SkillEffect[SK.SS_SEKIENHOU] = { effectId: 'ef_ss_sekienhou' }; //Red Flame Cannon
SkillEffect[SK.SS_REIKETSUHOU] = { effectId: 'ef_ss_reiketsuhou' }; //Cold Blooded Cannon
SkillEffect[SK.SS_RAIDENPOU] = {
	effectId: 'ef_ss_raidenpou',
	effectIdOnCaster: 'ef_ss_raidenpou_cast',
	hitEffectId: 'ef_ss_raidenpou_hit'
}; //Thundering Cannon
SkillEffect[SK.SS_KINRYUUHOU] = { effectId: 'ef_ss_kinryuuhou', hitEffectId: 'ef_ss_kinryuuhou_hit' }; //Golden Dragon Cannon
SkillEffect[SK.SS_ANTENPOU] = { effectId: 'ef_ss_antenpou' }; //Darkening Cannon
SkillEffect[SK.SS_KAGEAKUMU] = { effectId: 'ef_ss_kageakumu' }; //Shadow - Nightmare
SkillEffect[SK.SS_HITOUAKUMU] = { effectId: 'ef_ss_hitouakumu' }; //Kunai - Nightmare
SkillEffect[SK.SS_ANKOKURYUUAKUMU] = { effectId: 'ef_ss_ankokuryuuakumu' }; //Dark Dragon - Nightmare
SkillEffect[5499 /* SS_FOUR_CHARM */] = { effectId: 'ef_ss_four_charm' }; //Four Colors Charm
SkillEffect[SK.KG_KAGEHUMI] = {}; //Shadow Trampling
SkillEffect[SK.KG_KYOMU] = {}; //Empty Shadow
SkillEffect[SK.KG_KAGEMUSYA] = {}; //Shadow Warrior
SkillEffect[SK.SOA_TALISMAN_OF_PROTECTION] = { effectId: 'ef_soa_talisman_of_protection' }; //Talisman Of Protection
SkillEffect[SK.SOA_TALISMAN_OF_WARRIOR] = { effectId: 'ef_soa_talisman_of_warrior' }; //Talisman Of Warrior
SkillEffect[SK.SOA_TALISMAN_OF_MAGICIAN] = { effectId: 'ef_soa_talisman_of_magician' }; //Talisman Of Magician
SkillEffect[SK.SOA_SOUL_GATHERING] = { effectId: 'ef_soa_soul_gathering' }; //Soul Gathering
SkillEffect[SK.SOA_TOTEM_OF_TUTELARY] = { effectId: 'ef_soa_totem_of_tutelary' }; //Totem Of Tutelary
SkillEffect[SK.SOA_TALISMAN_OF_FIVE_ELEMENTS] = { effectId: 'ef_soa_talisman_of_five_elements' }; //Talisman Of Five Elements
SkillEffect[SK.SOA_TALISMAN_OF_SOUL_STEALING] = { effectId: 'ef_soa_talisman_of_soul_stealing' }; //Talisman Of Soul Stealing
SkillEffect[SK.SOA_EXORCISM_OF_MALICIOUS_SOUL] = { effectId: 'ef_soa_exorcism_of_malicious_soul' }; //Exorcism Of Malicious Soul
SkillEffect[SK.SOA_TALISMAN_OF_BLUE_DRAGON] = { effectId: 'ef_soa_talisman_of_blue_dragon' }; //Talisman Of Blue Dragon
SkillEffect[SK.SOA_TALISMAN_OF_WHITE_TIGER] = { effectId: 'ef_soa_talisman_of_white_tiger' }; //Talisman Of White Tiger
SkillEffect[SK.SOA_TALISMAN_OF_RED_PHOENIX] = { effectId: 'ef_soa_talisman_of_red_phoenix' }; //Talisman Of Red Phoenix
SkillEffect[SK.SOA_TALISMAN_OF_BLACK_TORTOISE] = { effectId: 'ef_soa_talisman_of_black_tortoise' }; //Talisman Of Black Tortoise
SkillEffect[SK.SOA_TALISMAN_OF_FOUR_BEARING_GOD] = { effectId: 'ef_soa_talisman_of_four_bearing_god' }; //Talisman Of Four Bearing God
SkillEffect[SK.SOA_CIRCLE_OF_DIRECTIONS_AND_ELEMENTALS] = { effectId: 'ef_soa_circle_of_directions_and_elementals' }; //Circle Of Directions And Elementals
SkillEffect[SK.SOA_SOUL_OF_HEAVEN_AND_EARTH] = { effectId: 'ef_soa_soul_of_heaven_and_earth' }; //Soul Of Heaven And Earth
SkillEffect[SK.OB_ZANGETSU] = {}; //Distorted Crescent
SkillEffect[SK.OB_OBOROGENSOU] = {}; //Moonlight Fantasy
SkillEffect[SK.OB_OBOROGENSOU_TRANSITION_ATK] = {}; //Moonlight Fantasy Transition Attack
SkillEffect[SK.OB_AKAITSUKI] = {}; //Ominous Moonlight
SkillEffect[SK.SKE_RISING_SUN] = { effectId: 'ef_ske_rising_sun' }; //Rising Sun
SkillEffect[SK.SKE_NOON_BLAST] = { effectId: 'ef_ske_noon_blast' }; //Noon Blast
SkillEffect[SK.SKE_SUNSET_BLAST] = { effectId: 'ef_ske_sunset_blast' }; //Sunset Blast
SkillEffect[SK.SKE_MIDNIGHT_KICK] = { effectId: 'ef_ske_midnight_kick' }; //Midnight Kick
SkillEffect[SK.SKE_DAWN_BREAK] = { effectId: 'ef_ske_dawn_break' }; //Dawn Break
SkillEffect[SK.SKE_TWINKLING_GALAXY] = { effectId: 'ef_ske_twinkling_galaxy' }; //Twinkling Galaxy
SkillEffect[SK.SKE_STAR_BURST] = { effectId: 'ef_ske_star_burst' }; //Star Burst
SkillEffect[SK.SKE_STAR_CANNON] = { effectId: 'ef_ske_star_cannon' }; //Star Cannon
SkillEffect[SK.SKE_ALL_IN_THE_SKY] = { effectId: 'ef_ske_all_in_the_sky' }; //All in the Sky
SkillEffect[SK.SKE_ENCHANTING_SKY] = { effectId: 'ef_ske_enchanting_sky' }; //Enchanting Sky
SkillEffect[5502 /* SKE_SKY_SUN */] = { effectId: 'ef_ske_sky_sun', hitEffectId: 'ef_ske_sky_sun_hit' }; //Sky Sun
SkillEffect[5503 /* SKE_SKY_MOON */] = {
	effectId: 'ef_ske_sky_moon',
	effectIdOnCaster: 'ef_ske_sky_moon_cast',
	hitEffectId: 'ef_ske_sky_moon_hit'
}; //Sky Moon
SkillEffect[5504 /* SKE_STAR_LIGHT_KICK */] = {
	effectId: 'ef_ske_star_light_kick',
	hitEffectId: 'ef_ske_star_light_kick_hit'
}; //Star Light Kick
// Eclage Skills
SkillEffect[SK.ECL_SNOWFLIP] = {}; //Snow Flip
SkillEffect[SK.ECL_PEONYMAMY] = {}; //Peony Mamy
SkillEffect[SK.ECL_SADAGUI] = {}; //Sadagui
SkillEffect[SK.ECL_SEQUOIADUST] = {}; //Sequoia Dust
SkillEffect[SK.ECLAGE_RECALL] = {}; //Return To Eclage
// Copied Bard / Dancer Skills
// EP 14.3 Part 2 3rd Job Skills
SkillEffect[SK.SHC_SHADOW_EXCEED] = { effectIdOnCaster: 'ef_shc_shadow_exceed_cast' }; //Shadow Exceed
SkillEffect[SK.SHC_DANCING_KNIFE] = { effectIdOnCaster: 'ef_shc_dancing_knife_cast' }; //Dancing Knife
SkillEffect[SK.SHC_SAVAGE_IMPACT] = { effectId: 'ef_shc_savage_impact', hitEffectId: 'ef_shc_savage_impact_hit' }; //Savage Impact
SkillEffect[SK.SHC_ETERNAL_SLASH] = { effectId: 'ef_shc_eternal_slash', hitEffectId: 'ef_shc_eternal_slash_hit' }; //Eternal Slash
SkillEffect[SK.SHC_POTENT_VENOM] = { effectId: 'ef_shc_potent_venom' }; //Potent Venom
SkillEffect[SK.SHC_SHADOW_STAB] = { effectId: 'ef_shc_shadow_stab' }; //Shadow Stab
SkillEffect[SK.SHC_IMPACT_CRATER] = { effectId: 'ef_shc_impact_crater', hitEffectId: 'ef_shc_impact_crater_hit' }; //Impact Crater
SkillEffect[SK.SHC_ENCHANTING_SHADOW] = { effectId: 'ef_shc_enchanting_shadow' }; //Enchanting Shadow
SkillEffect[SK.SHC_FATAL_SHADOW_CROW] = {
	effectId: 'ef_shc_fatal_shadow_crow',
	hitEffectId: 'ef_shc_fatal_shadow_crow_hit'
}; //Fatal Shadow Crow
SkillEffect[6511 /* SHC_CROSS_SLASH */] = { effectId: 'ef_shc_cross_slash' }; //Cross Slash
SkillEffect[SK.GC_DARKCROW] = { effectId: 1040 }; //Dark Claw
SkillEffect[SK.RA_UNLIMIT] = { effectId: 'ef_ra_unlimit' }; //Unlimited
SkillEffect[SK.GN_ILLUSIONDOPING] = { effectId: 1049 }; //Illusion Doping
SkillEffect[5307 /* BO_ACIDIFIED_ZONE_WATER_ATK */] = { effectId: 'ef_bo_acidified_zone_water_atk' }; //Actified Zone Water Attack
SkillEffect[5308 /* BO_ACIDIFIED_ZONE_GROUND_ATK */] = { effectId: 'ef_bo_acidified_zone_ground_atk' }; //Actified Zone Ground Attack
SkillEffect[5309 /* BO_ACIDIFIED_ZONE_WIND_ATK */] = { effectId: 'ef_bo_acidified_zone_wind_atk' }; //Actified Zone Wind Attack
SkillEffect[5310 /* BO_ACIDIFIED_ZONE_FIRE_ATK */] = { effectId: 'ef_bo_acidified_zone_fire_atk' }; //Actified Zone Fire Attack
SkillEffect[SK.BO_ADVANCE_PROTECTION] = { effectId: 'ef_bo_advance_protection' }; //Advance Protection
SkillEffect[SK.BO_ACIDIFIED_ZONE_WATER] = {
	effectIdOnCaster: 'ef_bo_acidified_zone_water_cast',
	hitEffectId: 'ef_bo_acidified_zone_water_hit'
}; //Acidified Zone Water
SkillEffect[SK.BO_ACIDIFIED_ZONE_GROUND] = {
	effectIdOnCaster: 'ef_bo_acidified_zone_ground_cast',
	hitEffectId: 'ef_bo_acidified_zone_ground_hit'
}; //Acidified Zone Ground
SkillEffect[SK.BO_ACIDIFIED_ZONE_WIND] = {
	effectIdOnCaster: 'ef_bo_acidified_zone_wind_cast',
	hitEffectId: 'ef_bo_acidified_zone_wind_hit'
}; //Acidified Zone Wind
SkillEffect[SK.BO_ACIDIFIED_ZONE_FIRE] = {
	effectIdOnCaster: 'ef_bo_acidified_zone_fire_cast',
	hitEffectId: 'ef_bo_acidified_zone_fire_hit'
}; //Acidified Zone Fire
SkillEffect[SK.BO_WOODENWARRIOR] = {
	effectIdOnCaster: 'ef_bo_woodenwarrior_cast',
	hitEffectId: 'ef_bo_woodenwarrior_hit'
}; //Wooden Warrior
SkillEffect[SK.BO_WOODEN_FAIRY] = { effectIdOnCaster: 'ef_bo_wooden_fairy_cast' }; //Wooden Fairy
SkillEffect[SK.BO_RESEARCHREPORT] = { effectId: 'ef_bo_researchreport', effectIdOnCaster: 'ef_bo_researchreport_cast' }; //Research Report
SkillEffect[SK.BO_HELLTREE] = { effectIdOnCaster: 'ef_bo_helltree_cast' }; //Hell Tree
SkillEffect[5385 /* BO_WOODEN_ATTACK */] = { hitEffectId: 'ef_bo_wooden_attack_hit' }; //Wooden Attack
SkillEffect[SK.BO_EXPLOSIVE_POWDER] = { effectId: 'ef_bo_explosive_powder' }; //Explosive Powder
SkillEffect[SK.BO_MAYHEMIC_THORNS] = { effectId: 'ef_bo_mayhemic_thorns' }; //Mayhemic Thorns
SkillEffect[6509 /* BO_MYSTERY_POWDER */] = {
	effectId: 'ef_bo_mystery_powder',
	hitEffectId: 'ef_bo_mystery_powder_hit'
}; //Mystery Powder
SkillEffect[6510 /* BO_DUST_EXPLOSION */] = {
	effectId: 'ef_bo_dust_explosion',
	hitEffectId: 'ef_bo_dust_explosion_hit'
}; //Dust Explosion
SkillEffect[SK.RK_DRAGONBREATH_WATER] = { hitEffectId: 'ef_dragonbreath_water' }; //Dragon Breath - Water
SkillEffect[SK.WH_WIND_SIGN] = { effectId: 'ef_wh_wind_sign' }; //Wind Sign
SkillEffect[SK.WH_HAWKRUSH] = { effectId: 'ef_wh_hawkrush' }; //Hawk Rush
SkillEffect[SK.WH_CALAMITYGALE] = { effectIdOnCaster: 'ef_wh_calamitygale_cast' }; //Calamity Gale
SkillEffect[SK.WH_HAWKBOOMERANG] = { effectId: 'ef_wh_hawkboomerang' }; //Hawk Boomerang
SkillEffect[SK.WH_GALESTORM] = {
	effectId: 'ef_wh_galestorm',
	effectIdOnCaster: 'ef_wh_galestorm_cast',
	hitEffectId: 'ef_wh_galestorm_hit'
}; //Gale Storm
SkillEffect[SK.WH_DEEPBLINDTRAP] = {
	effectId: 'ef_wh_deepblindtrap',
	effectIdOnCaster: 'ef_wh_deepblindtrap_cast',
	hitEffectId: 'ef_wh_deepblindtrap_hit'
}; //Deep Blind Trap
SkillEffect[SK.WH_SOLIDTRAP] = {
	effectId: 'ef_wh_solidtrap',
	effectIdOnCaster: 'ef_wh_solidtrap_cast',
	hitEffectId: 'ef_wh_solidtrap_hit'
}; //Solid Trap
SkillEffect[SK.WH_SWIFTTRAP] = {
	effectId: 'ef_wh_swifttrap',
	effectIdOnCaster: 'ef_wh_swifttrap_cast',
	hitEffectId: 'ef_wh_swifttrap_hit'
}; //Swift Trap
SkillEffect[SK.WH_CRESCIVE_BOLT] = {
	effectId: 'ef_wh_crescive_bolt',
	effectIdOnCaster: 'ef_wh_crescive_bolt_cast',
	hitEffectId: 'ef_wh_crescive_bolt_hit'
}; //Crescive Bolt
SkillEffect[SK.WH_FLAMETRAP] = {
	effectId: 'ef_wh_flametrap',
	effectIdOnCaster: 'ef_wh_flametrap_cast',
	hitEffectId: 'ef_wh_flametrap_hit'
}; //Flame Trap
SkillEffect[6520 /* WH_WILD_WALK */] = {
	effectId: 'ef_wh_wild_walk',
	effectIdOnCaster: 'ef_wh_wild_walk_cast',
	hitEffectId: 'ef_wh_wild_walk_hit'
}; //Wild Walk
SkillEffect[SK.RK_LUXANIMA] = { effectId: 1044 }; //Lux Anima
SkillEffect[SK.DK_SERVANTWEAPON] = {
	effectId: 'ef_dk_servantweapon',
	effectIdOnCaster: 'ef_dk_servantweapon_cast',
	hitEffectId: 'ef_dk_servantweapon_hit'
}; //Servant Weapon
SkillEffect[SK.DK_SERVANTWEAPON_ATK] = { effectId: 'ef_dk_servantweapon_atk' }; //Servant Weapon Attack
SkillEffect[SK.DK_SERVANT_W_SIGN] = { effectId: 'ef_dk_servant_w_sign' }; //Servant Weapon Sign
SkillEffect[SK.DK_SERVANT_W_PHANTOM] = { effectId: 'ef_dk_servant_w_phantom' }; //Servant Weapon Phantom
SkillEffect[SK.DK_SERVANT_W_DEMOL] = { hitEffectId: 'ef_dk_servant_w_demol_hit' }; //Servant Weapon Demolition
SkillEffect[SK.DK_CHARGINGPIERCE] = {
	effectIdOnCaster: 'ef_dk_chargingpierce_cast',
	hitEffectId: 'ef_dk_chargingpierce_hit'
}; //Charging Pierce
SkillEffect[SK.DK_HACKANDSLASHER] = { effectId: 'ef_dk_hackandslasher', hitEffectId: 'ef_dk_hackandslasher_hit' }; //Hack And Slasher
SkillEffect[SK.DK_HACKANDSLASHER_ATK] = { effectId: 'ef_dk_hackandslasher_atk' }; //Hack And Slasher Attack
SkillEffect[SK.DK_DRAGONIC_AURA] = { effectIdOnCaster: 'ef_dk_dragonic_aura' }; //Dragonic Aura
SkillEffect[SK.DK_MADNESS_CRUSHER] = { effectId: 'ef_dk_madness_crusher' }; //Madness Crusher
SkillEffect[SK.DK_VIGOR] = { effectId: 'ef_dk_vigor', effectIdOnCaster: 'ef_dk_vigor_cast' }; //Vigor
SkillEffect[SK.DK_STORMSLASH] = { hitEffectId: 'ef_dk_stormslash_hit' }; //Storm Slash
SkillEffect[SK.DK_DRAGONIC_BREATH] = { effectId: 'ef_dk_dragonic_breath', hitEffectId: 'ef_dk_dragonic_breath_hit' }; //Dragonic Breath
SkillEffect[6502 /* DK_DRAGONIC_PIERCE */] = {
	effectId: 'ef_dk_dragonic_pierce',
	effectIdOnCaster: 'ef_dk_dragonic_pierce_cast',
	hitEffectId: 'ef_dk_dragonic_pierce_hit'
}; //Dragonic Pierce
SkillEffect[SK.NC_MAGMA_ERUPTION] = { effectId: 1050 }; //Magma Eruption
SkillEffect[SK.MT_AXE_STOMP] = { effectId: 'ef_mt_axe_stomp', hitEffectId: 'ef_mt_axe_stomp_hit' }; //Axe Stomp
SkillEffect[SK.MT_RUSH_QUAKE] = { effectId: 'ef_mt_rush_quake', hitEffectId: 'ef_mt_rush_quake_hit' }; //Rush Quake
SkillEffect[SK.MT_A_MACHINE] = {
	effectId: 'ef_mt_a_machine',
	effectIdOnCaster: 'ef_mt_a_machine_cast',
	hitEffectId: 'ef_mt_a_machine_hit'
}; //Attack Machine
SkillEffect[SK.MT_D_MACHINE] = { effectId: 'ef_mt_d_machine', effectIdOnCaster: 'ef_mt_d_machine_cast' }; //Defense Machine
SkillEffect[SK.MT_SUMMON_ABR_BATTLE_WARIOR] = { effectId: 'ef_mt_summon_abr_battle_warior' }; //ABR Battle Warior
SkillEffect[SK.MT_SUMMON_ABR_DUAL_CANNON] = { effectId: 'ef_mt_summon_abr_dual_cannon' }; //ABR Dual Cannon
SkillEffect[SK.MT_SUMMON_ABR_INFINITY] = {
	effectId: 'ef_mt_summon_abr_infinity',
	effectIdOnCaster: 'ef_mt_summon_abr_infinity_cast',
	hitEffectId: 'ef_mt_summon_abr_infinity_hit'
}; //ABR Infinity
SkillEffect[SK.MT_SPARK_BLASTER] = { effectId: 'ef_mt_spark_blaster' }; //Spark Blaster
SkillEffect[SK.MT_TRIPLE_LASER] = { effectId: 'ef_mt_triple_laser' }; //Triple Laser
SkillEffect[SK.MT_MIGHTY_SMASH] = { effectId: 'ef_mt_mighty_smash' }; //Mighty Smash
SkillEffect[6506 /* MT_RUSH_STRIKE */] = { effectId: 'ef_mt_rush_strike' }; //Rush Strike
SkillEffect[6507 /* MT_POWERFUL_SWING */] = {
	effectId: 'ef_mt_powerful_swing',
	hitEffectId: 'ef_mt_powerful_swing_hit'
}; //Powerful Swing
SkillEffect[6508 /* MT_ENERGY_CANNONADE */] = {
	effectId: 'ef_mt_energy_cannonade',
	effectIdOnCaster: 'ef_mt_energy_cannonade_cast',
	hitEffectId: 'ef_mt_energy_cannonade_hit'
}; //Energy Cannonade
SkillEffect[SK.WM_FRIGG_SONG] = { effectId: 'ef_frigg_song' }; //Frigg's Song
SkillEffect[SK.TR_MYSTIC_SYMPHONY] = {
	effectId: 'ef_tr_mystic_symphony',
	effectIdOnCaster: 'ef_tr_mystic_symphony_cast'
}; //Mystic Symphony
SkillEffect[SK.TR_KVASIR_SONATA] = { effectId: 'ef_tr_kvasir_sonata', effectIdOnCaster: 'ef_tr_kvasir_sonata_cast' }; //Kvasir Sonata
SkillEffect[SK.TR_ROSEBLOSSOM] = { effectIdOnCaster: 'ef_tr_roseblossom_cast', hitEffectId: 'ef_tr_roseblossom_hit' }; //Rose Blossom
SkillEffect[SK.TR_ROSEBLOSSOM_ATK] = { effectId: 'ef_tr_roseblossom_atk' }; //Rose Blossom Attack
SkillEffect[SK.TR_RHYTHMSHOOTING] = {
	effectIdOnCaster: 'ef_tr_rhythmshooting_cast',
	hitEffectId: 'ef_tr_rhythmshooting_hit'
}; //Rhythm Shooting
SkillEffect[SK.TR_METALIC_FURY] = { effectId: 'ef_tr_metalic_fury' }; //Metallic Fury
SkillEffect[SK.TR_SOUNDBLEND] = { effectId: 'ef_tr_soundblend', effectIdOnCaster: 'ef_tr_soundblend_cast' }; //Sound Blend
SkillEffect[SK.TR_GEF_NOCTURN] = { effectId: 'ef_tr_gef_nocturn', effectIdOnCaster: 'ef_tr_gef_nocturn_cast' }; //Geffenia Nocturn
SkillEffect[SK.TR_ROKI_CAPRICCIO] = { effectId: 'ef_tr_roki_capriccio', effectIdOnCaster: 'ef_tr_roki_capriccio_cast' }; //Roki Capriccio
SkillEffect[SK.TR_AIN_RHAPSODY] = { effectId: 'ef_tr_ain_rhapsody', effectIdOnCaster: 'ef_tr_ain_rhapsody_cast' }; //Ain Rhapsody
SkillEffect[SK.TR_MUSICAL_INTERLUDE] = {
	effectId: 'ef_tr_musical_interlude',
	effectIdOnCaster: 'ef_tr_musical_interlude_cast'
}; //Musical Interlude
SkillEffect[SK.TR_JAWAII_SERENADE] = {
	effectId: 'ef_tr_jawaii_serenade',
	effectIdOnCaster: 'ef_tr_jawaii_serenade_cast'
}; //Jawaii Serenade
SkillEffect[SK.TR_NIPELHEIM_REQUIEM] = {
	effectId: 'ef_tr_nipelheim_requiem',
	effectIdOnCaster: 'ef_tr_nipelheim_requiem_cast'
}; //Nipelheim Requiem
SkillEffect[SK.TR_PRON_MARCH] = { effectId: 'ef_tr_pron_march', effectIdOnCaster: 'ef_tr_pron_march_cast' }; //Pron March
SkillEffect[6521 /* TR_RHYTHMICAL_WAVE */] = {
	effectId: 'ef_tr_rhythmical_wave',
	effectIdOnCaster: 'ef_tr_rhythmical_wave_cast',
	hitEffectId: 'ef_tr_rhythmical_wave_hit'
}; //Rhythmical Wave
SkillEffect[SK.SO_ELEMENTAL_SHIELD] = { effectId: 1046 }; //Elemental Shield
SkillEffect[SK.EM_SPELL_ENCHANTING] = { effectId: 'ef_em_spell_enchanting' }; //Spell Enchanting
SkillEffect[SK.EM_ACTIVITY_BURN] = { effectId: 'ef_em_activity_burn', effectIdOnCaster: 'ef_em_activity_burn_cast' }; //Activity Burn
SkillEffect[SK.EM_INCREASING_ACTIVITY] = {
	effectId: 'ef_em_increasing_activity',
	effectIdOnCaster: 'ef_em_increasing_activity_cast'
}; //Increasing Activity
SkillEffect[SK.EM_DIAMOND_STORM] = {
	effectId: 'ef_em_diamond_storm',
	effectIdOnCaster: 'ef_em_diamond_storm_cast',
	hitEffectId: 'ef_em_diamond_storm_hit'
}; //Diamond Storm
SkillEffect[SK.EM_LIGHTNING_LAND] = {
	effectId: 'ef_em_lightning_land',
	effectIdOnCaster: 'ef_em_lightning_land_cast',
	hitEffectId: 'ef_em_lightning_land_hit'
}; //Lightning Land
SkillEffect[SK.EM_VENOM_SWAMP] = {
	effectId: 'ef_em_venom_swamp',
	effectIdOnCaster: 'ef_em_venom_swamp_cast',
	hitEffectId: 'ef_em_venom_swamp_hit'
}; //Venom Swamp
SkillEffect[SK.EM_CONFLAGRATION] = {
	effectId: 'ef_em_conflagration',
	effectIdOnCaster: 'ef_em_conflagration_cast',
	hitEffectId: 'ef_em_conflagration_hit'
}; //Conflagration
SkillEffect[SK.EM_TERRA_DRIVE] = {
	effectId: 'ef_em_terra_drive',
	effectIdOnCaster: 'ef_em_terra_drive_cast',
	hitEffectId: 'ef_em_terra_drive_hit'
}; //Terra Drive
SkillEffect[SK.EM_SUMMON_ELEMENTAL_ARDOR] = {
	effectId: 'ef_em_summon_elemental_ardor',
	effectIdOnCaster: 'ef_em_summon_elemental_ardor_cast',
	hitEffectId: 'ef_em_summon_elemental_ardor_hit'
}; //Summon Elemental Ardor
SkillEffect[SK.EM_SUMMON_ELEMENTAL_DILUVIO] = {
	effectIdOnCaster: 'ef_em_summon_elemental_diluvio_cast',
	hitEffectId: 'ef_em_summon_elemental_diluvio_hit'
}; //Summon Elemental Diluvio
SkillEffect[SK.EM_SUMMON_ELEMENTAL_PROCELLA] = {
	effectId: 'ef_em_summon_elemental_procella',
	effectIdOnCaster: 'ef_em_summon_elemental_procella_cast',
	hitEffectId: 'ef_em_summon_elemental_procella_hit'
}; //Summon Elemental Procella
SkillEffect[SK.EM_SUMMON_ELEMENTAL_TERREMOTUS] = {
	effectId: 'ef_em_summon_elemental_terremotus',
	effectIdOnCaster: 'ef_em_summon_elemental_terremotus_cast',
	hitEffectId: 'ef_em_summon_elemental_terremotus_hit'
}; //Summon Elemental Terremotus
SkillEffect[SK.EM_SUMMON_ELEMENTAL_SERPENS] = {
	effectId: 'ef_em_summon_elemental_serpens',
	effectIdOnCaster: 'ef_em_summon_elemental_serpens_cast',
	hitEffectId: 'ef_em_summon_elemental_serpens_hit'
}; //Summon Elemental Serpens
SkillEffect[SK.EM_ELEMENTAL_BUSTER] = { effectIdOnCaster: 'ef_em_elemental_buster_cast' }; //Elemental Buster
SkillEffect[SK.EM_ELEMENTAL_BUSTER_FIRE] = {
	effectId: 'ef_em_elemental_buster_fire',
	hitEffectId: 'ef_em_elemental_buster_fire_hit'
}; //Elemental Buster Fire
SkillEffect[SK.EM_ELEMENTAL_BUSTER_WATER] = {
	effectId: 'ef_em_elemental_buster_water',
	hitEffectId: 'ef_em_elemental_buster_water_hit'
}; //Elemental Buster Water
SkillEffect[SK.EM_ELEMENTAL_BUSTER_WIND] = {
	effectId: 'ef_em_elemental_buster_wind',
	hitEffectId: 'ef_em_elemental_buster_wind_hit'
}; //Elemental Buster Wind
SkillEffect[SK.EM_ELEMENTAL_BUSTER_GROUND] = {
	effectId: 'ef_em_elemental_buster_ground',
	hitEffectId: 'ef_em_elemental_buster_ground_hit'
}; //Elemental Buster Ground
SkillEffect[SK.EM_ELEMENTAL_BUSTER_POISON] = {
	effectId: 'ef_em_elemental_buster_poison',
	hitEffectId: 'ef_em_elemental_buster_poison_hit'
}; //Elemental Buster Poison
SkillEffect[6517 /* EM_PSYCHIC_STREAM */] = {
	effectId: 'ef_em_psychic_stream',
	effectIdOnCaster: 'ef_em_psychic_stream_cast',
	hitEffectId: 'ef_em_psychic_stream_hit'
}; //Psychic Stream
SkillEffect[SK.EM_EL_FLAMETECHNIC] = { effectId: 'ef_em_el_flametechnic' }; //Flame Technic
SkillEffect[SK.EM_EL_FLAMEARMOR] = { effectId: 'ef_em_el_flamearmor' }; //Flame Armor
SkillEffect[SK.EM_EL_COLD_FORCE] = { effectId: 'ef_em_el_cold_force' }; //Cold Force
SkillEffect[SK.EM_EL_GRACE_BREEZE] = { effectId: 'ef_em_el_grace_breeze' }; //Grace Breeze
SkillEffect[SK.EM_EL_EARTH_CARE] = { effectId: 'ef_em_el_earth_care' }; //Earth Care
SkillEffect[SK.EM_EL_DEEP_POISONING] = { effectId: 'ef_em_el_deep_poisoning' }; //Deep Poisoning
SkillEffect[SK.EM_EL_DEADLY_POISON] = { effectId: 'ef_em_el_deadly_poison' }; //Deadly Poison
SkillEffect[SK.SR_FLASHCOMBO] = { effectId: 1043 }; //Flash Combo
SkillEffect[SK.IQ_POWERFUL_FAITH] = { effectId: 'ef_iq_powerful_faith' }; //Powerful Faith
SkillEffect[SK.IQ_FIRM_FAITH] = { effectId: 'ef_iq_firm_faith' }; //Firm Faith
SkillEffect[SK.IQ_OLEUM_SANCTUM] = { effectId: 'ef_iq_oleum_sanctum', hitEffectId: 'ef_iq_oleum_sanctum_hit' }; //Oleum Sanctum
SkillEffect[SK.IQ_SINCERE_FAITH] = { effectId: 'ef_iq_sincere_faith' }; //Sincere Faith
SkillEffect[SK.IQ_MASSIVE_F_BLASTER] = {
	effectId: 'ef_iq_massive_f_blaster',
	hitEffectId: 'ef_iq_massive_f_blaster_hit'
}; //Massive Flame Blaster
SkillEffect[SK.IQ_EXPOSION_BLASTER] = { effectId: 'ef_iq_exposion_blaster', hitEffectId: 'ef_iq_exposion_blaster_hit' }; //Explosion Blaster
SkillEffect[SK.IQ_FIRST_BRAND] = { effectId: 'ef_iq_first_brand', hitEffectId: 'ef_iq_first_brand_hit' }; //First Brand
SkillEffect[SK.IQ_FIRST_FAITH_POWER] = {
	effectId: 'ef_iq_first_faith_power',
	effectIdOnCaster: 'ef_iq_first_faith_power_cast'
}; //First Faith Power
SkillEffect[SK.IQ_JUDGE] = { effectId: 'ef_iq_judge', effectIdOnCaster: 'ef_iq_judge_cast' }; //Judge
SkillEffect[SK.IQ_SECOND_FLAME] = { effectId: 'ef_iq_second_flame' }; //Second Flame
SkillEffect[SK.IQ_SECOND_FAITH] = { effectId: 'ef_iq_second_faith' }; //Second Faith
SkillEffect[SK.IQ_SECOND_JUDGEMENT] = { effectId: 'ef_iq_second_judgement' }; //Second Judgement
SkillEffect[SK.IQ_THIRD_PUNISH] = { effectId: 'ef_iq_third_punish' }; //Third Punish
SkillEffect[SK.IQ_THIRD_FLAME_BOMB] = { effectId: 'ef_iq_third_flame_bomb' }; //Third Flame Bomb
SkillEffect[SK.IQ_THIRD_CONSECRATION] = { effectId: 'ef_iq_third_consecration' }; //Third Consecration
SkillEffect[SK.IQ_THIRD_EXOR_FLAME] = {
	effectId: 'ef_iq_third_exor_flame',
	effectIdOnCaster: 'ef_iq_third_exor_flame_cast'
}; //Third Exorcism Flame
SkillEffect[6519 /* IQ_BLAZING_FLAME_BLAST */] = {
	effectId: 'ef_iq_blazing_flame_blast',
	effectIdOnCaster: 'ef_iq_blazing_flame_blast_cast',
	hitEffectId: 'ef_iq_blazing_flame_blast_hit'
}; //Blazing Flame Blast
SkillEffect[SK.SC_ESCAPE] = {}; //Emergency Escape
SkillEffect[SK.ABC_ABYSS_DAGGER] = { effectId: 'ef_abc_abyss_dagger', hitEffectId: 'ef_abc_abyss_dagger_hit' }; //Abyss Dagger
SkillEffect[SK.ABC_UNLUCKY_RUSH] = {
	effectId: 'ef_abc_unlucky_rush',
	effectIdOnCaster: 'ef_abc_unlucky_rush_cast',
	hitEffectId: 'ef_abc_unlucky_rush_hit'
}; //Unlucky Rush
SkillEffect[SK.ABC_CHAIN_REACTION_SHOT] = {
	effectId: 'ef_abc_chain_reaction_shot',
	effectIdOnCaster: 'ef_abc_chain_reaction_shot_cast',
	hitEffectId: 'ef_abc_chain_reaction_shot_hit'
}; //Chain Reaction Shot
SkillEffect[SK.ABC_FROM_THE_ABYSS] = { hitEffectId: 'ef_abc_from_the_abyss_hit' }; //From The Abyss
SkillEffect[SK.ABC_ABYSS_SLAYER] = { effectId: 'ef_abc_abyss_slayer', effectIdOnCaster: 'ef_abc_abyss_slayer_cast' }; //Abyss Slayer
SkillEffect[SK.ABC_ABYSS_STRIKE] = {
	effectId: 'ef_abc_abyss_strike',
	effectIdOnCaster: 'ef_abc_abyss_strike_cast',
	hitEffectId: 'ef_abc_abyss_strike_hit'
}; //Omega Abyss Strike
SkillEffect[SK.ABC_DEFT_STAB] = { effectId: 'ef_abc_deft_stab' }; //Deft Stab
SkillEffect[SK.ABC_ABYSS_SQUARE] = { effectId: 'ef_abc_abyss_square', hitEffectId: 'ef_abc_abyss_square_hit' }; //Abyss Square
SkillEffect[SK.ABC_FRENZY_SHOT] = { effectId: 'ef_abc_frenzy_shot', hitEffectId: 'ef_abc_frenzy_shot_hit' }; //Frenzy Shot
SkillEffect[SK.ABC_CHAIN_REACTION_SHOT_ATK] = { effectId: 'ef_abc_chain_reaction_shot_atk' }; //Chain Reaction Shot Attack
SkillEffect[SK.ABC_FROM_THE_ABYSS_ATK] = { effectId: 'ef_abc_from_the_abyss_atk' }; //From The Abyss Attack
SkillEffect[6513 /* ABC_CHASING_BREAK */] = { effectId: 'ef_abc_chasing_break' }; //Chasing Break
SkillEffect[6514 /* ABC_CHASING_SHOT */] = {
	effectIdOnCaster: 'ef_abc_chasing_shot_cast',
	hitEffectId: 'ef_abc_chasing_shot_hit'
}; //Chasing Shot
SkillEffect[6515 /* ABC_ABYSS_FLAME */] = {
	effectId: 'ef_abc_abyss_flame',
	effectIdOnCaster: 'ef_abc_abyss_flame_cast',
	hitEffectId: 'ef_abc_abyss_flame_hit'
}; //Abyss Flame
SkillEffect[SK.AB_OFFERTORIUM] = { effectId: 1047 }; //Offertorium
SkillEffect[SK.CD_REPARATIO] = { effectId: 'ef_cd_reparatio', effectIdOnCaster: 'ef_cd_reparatio_cast' }; //Reparatio
SkillEffect[SK.CD_MEDIALE_VOTUM] = { effectId: 'ef_cd_mediale_votum', effectIdOnCaster: 'ef_cd_mediale_votum_cast' }; //Mediale Votum
SkillEffect[SK.CD_ARGUTUS_VITA] = { effectId: 'ef_cd_argutus_vita', effectIdOnCaster: 'ef_cd_argutus_vita_cast' }; //Argutus Vita
SkillEffect[SK.CD_ARGUTUS_TELUM] = { effectId: 'ef_cd_argutus_telum', effectIdOnCaster: 'ef_cd_argutus_telum_cast' }; //Argutus Telum
SkillEffect[SK.CD_ARBITRIUM] = {
	effectId: 'ef_cd_arbitrium',
	effectIdOnCaster: 'ef_cd_arbitrium_cast',
	hitEffectId: 'ef_cd_arbitrium_hit'
}; //Arbitrium
SkillEffect[SK.CD_ARBITRIUM_ATK] = { effectId: 'ef_cd_arbitrium_atk' }; //Arbitrium Attack
SkillEffect[SK.CD_PRESENS_ACIES] = { effectId: 'ef_cd_presens_acies', effectIdOnCaster: 'ef_cd_presens_acies_cast' }; //Presens Acies
SkillEffect[SK.CD_EFFLIGO] = { effectId: 'ef_cd_effligo', hitEffectId: 'ef_cd_effligo_hit' }; //Effligo
SkillEffect[SK.CD_COMPETENTIA] = { effectId: 'ef_cd_competentia', effectIdOnCaster: 'ef_cd_competentia_cast' }; //Competentia
SkillEffect[SK.CD_PNEUMATICUS_PROCELLA] = {
	effectId: 'ef_cd_pneumaticus_procella',
	effectIdOnCaster: 'ef_cd_pneumaticus_procella_cast'
}; //Pneumaticus Procella
SkillEffect[SK.CD_DILECTIO_HEAL] = { effectId: 'ef_cd_dilectio_heal', effectIdOnCaster: 'ef_cd_dilectio_heal_cast' }; //Dilectio Heal
SkillEffect[SK.CD_RELIGIO] = { effectId: 'ef_cd_religio', effectIdOnCaster: 'ef_cd_religio_cast' }; //Religio
SkillEffect[SK.CD_BENEDICTUM] = { effectId: 'ef_cd_benedictum', effectIdOnCaster: 'ef_cd_benedictum_cast' }; //Benedictum
SkillEffect[SK.CD_PETITIO] = { effectId: 'ef_cd_petitio' }; //Petitio
SkillEffect[SK.CD_FRAMEN] = { effectId: 'ef_cd_framen' }; //Framen
SkillEffect[6518 /* CD_DIVINUS_FLOS */] = {
	effectId: 'ef_cd_divinus_flos',
	effectIdOnCaster: 'ef_cd_divinus_flos_cast',
	hitEffectId: 'ef_cd_divinus_flos_hit'
}; //Divinus Flos
SkillEffect[SK.WL_TELEKINESIS_INTENSE] = { effectId: 1048 }; //Intense Telekinesis
SkillEffect[SK.AG_DEADLY_PROJECTION] = {
	effectIdOnCaster: 'ef_ag_deadly_projection_cast',
	hitEffectId: 'ef_ag_deadly_projection_hit'
}; //Deadly Projection
SkillEffect[SK.AG_DESTRUCTIVE_HURRICANE] = {
	effectId: 'ef_ag_destructive_hurricane',
	effectIdOnCaster: 'ef_ag_destructive_hurricane_cast',
	hitEffectId: 'ef_ag_destructive_hurricane_hit'
}; //Destructive Hurricane
SkillEffect[SK.AG_RAIN_OF_CRYSTAL] = {
	effectIdOnCaster: 'ef_ag_rain_of_crystal_cast',
	hitEffectId: 'ef_ag_rain_of_crystal_hit'
}; //Rain Of Crystal
SkillEffect[SK.AG_MYSTERY_ILLUSION] = {
	effectId: 'ef_ag_mystery_illusion',
	effectIdOnCaster: 'ef_ag_mystery_illusion_cast',
	hitEffectId: 'ef_ag_mystery_illusion_hit'
}; //Mystery Illusion
SkillEffect[SK.AG_VIOLENT_QUAKE] = {
	effectId: 'ef_ag_violent_quake',
	effectIdOnCaster: 'ef_ag_violent_quake_cast',
	hitEffectId: 'ef_ag_violent_quake_hit'
}; //Violent Quake
SkillEffect[SK.AG_VIOLENT_QUAKE_ATK] = { effectId: 'ef_ag_violent_quake_atk' }; //Violent Quake Attack
SkillEffect[SK.AG_SOUL_VC_STRIKE] = {
	effectIdOnCaster: 'ef_ag_soul_vc_strike_cast',
	hitEffectId: 'ef_ag_soul_vc_strike_hit'
}; //Soul Vulcan Strike
SkillEffect[SK.AG_STRANTUM_TREMOR] = {
	effectId: 'ef_ag_strantum_tremor',
	effectIdOnCaster: 'ef_ag_strantum_tremor_cast',
	hitEffectId: 'ef_ag_strantum_tremor_hit'
}; //Strantum Tremor
SkillEffect[SK.AG_ALL_BLOOM] = {
	effectId: 'ef_ag_all_bloom',
	effectIdOnCaster: 'ef_ag_all_bloom_cast',
	hitEffectId: 'ef_ag_all_bloom_hit'
}; //All Bloom
SkillEffect[SK.AG_ALL_BLOOM_ATK] = { effectId: 'ef_ag_all_bloom_atk' }; //All Bloom Attack
SkillEffect[SK.AG_ALL_BLOOM_ATK2] = { effectId: 'ef_ag_all_bloom_atk2' }; //All Bloom Attack 2
SkillEffect[SK.AG_CRYSTAL_IMPACT] = {
	effectId: 'ef_ag_crystal_impact',
	effectIdOnCaster: 'ef_ag_crystal_impact_cast',
	hitEffectId: 'ef_ag_crystal_impact_hit'
}; //Crystal Impact
SkillEffect[SK.AG_CRYSTAL_IMPACT_ATK] = { effectId: 'ef_ag_crystal_impact_atk' }; //Crystal Impact Attack
SkillEffect[SK.AG_TORNADO_STORM] = {
	effectId: 'ef_ag_tornado_storm',
	effectIdOnCaster: 'ef_ag_tornado_storm_cast',
	hitEffectId: 'ef_ag_tornado_storm_hit'
}; //Tornado Storm
SkillEffect[SK.AG_ASTRAL_STRIKE] = { effectId: 'ef_ag_astral_strike', effectIdOnCaster: 'ef_ag_astral_strike_cast' }; //Astral Strike
SkillEffect[SK.AG_CLIMAX] = { effectId: 'ef_ag_climax', effectIdOnCaster: 'ef_ag_climax_cast' }; //Climax
SkillEffect[SK.AG_ROCK_DOWN] = {
	effectId: 'ef_ag_rock_down',
	effectIdOnCaster: 'ef_ag_rock_down_cast',
	hitEffectId: 'ef_ag_rock_down_hit'
}; //Rock Down
SkillEffect[SK.AG_STORM_CANNON] = { effectId: 'ef_ag_storm_cannon', effectIdOnCaster: 'ef_ag_storm_cannon_cast' }; //Storm Cannon
SkillEffect[SK.AG_CRIMSON_ARROW] = {
	effectId: 'ef_ag_crimson_arrow',
	effectIdOnCaster: 'ef_ag_crimson_arrow_cast',
	hitEffectId: 'ef_ag_crimson_arrow_hit'
}; //Crimson Arrow
SkillEffect[SK.AG_CRIMSON_ARROW_ATK] = { effectId: 'ef_ag_crimson_arrow_atk' }; //Crimson Arrow Attack
SkillEffect[SK.AG_FROZEN_SLASH] = {
	effectId: 'ef_ag_frozen_slash',
	effectIdOnCaster: 'ef_ag_frozen_slash_cast',
	hitEffectId: 'ef_ag_frozen_slash_hit'
}; //Frozen Slash
SkillEffect[5306 /* AG_DESTRUCTIVE_HURRICANE_CLIMAX */] = { effectId: 'ef_ag_destructive_hurricane_climax' }; //Destructive Hurricane Climax
SkillEffect[6516 /* AG_ENERGY_CONVERSION */] = {
	effectId: 'ef_ag_energy_conversion',
	effectIdOnCaster: 'ef_ag_energy_conversion_cast'
}; //Energy Conversion
SkillEffect[SK.LG_KINGS_GRACE] = { effectId: 'ef_kings_grace' }; //King's Grace
SkillEffect[SK.IG_GUARD_STANCE] = { effectId: 'ef_ig_guard_stance', effectIdOnCaster: 'ef_ig_guard_stance_cast' }; //Guard Stance
SkillEffect[SK.IG_GUARDIAN_SHIELD] = { effectId: 'ef_ig_guardian_shield' }; //Guardian Shield
SkillEffect[SK.IG_REBOUND_SHIELD] = { effectId: 'ef_ig_rebound_shield', effectIdOnCaster: 'ef_ig_rebound_shield_cast' }; //Rebound Shield
SkillEffect[SK.IG_ATTACK_STANCE] = { effectId: 'ef_ig_attack_stance', effectIdOnCaster: 'ef_ig_attack_stance_cast' }; //Attack Stance
SkillEffect[SK.IG_ULTIMATE_SACRIFICE] = { effectId: 'ef_ig_ultimate_sacrifice' }; //Ultimate Sacrifice
SkillEffect[SK.IG_HOLY_SHIELD] = { effectId: 'ef_ig_holy_shield', effectIdOnCaster: 'ef_ig_holy_shield_cast' }; //Holy Shield
SkillEffect[SK.IG_GRAND_JUDGEMENT] = {
	effectId: 'ef_ig_grand_judgement',
	effectIdOnCaster: 'ef_ig_grand_judgement_cast'
}; //Grand Judgement
SkillEffect[SK.IG_JUDGEMENT_CROSS] = {
	effectId: 'ef_ig_judgement_cross',
	effectIdOnCaster: 'ef_ig_judgement_cross_cast',
	hitEffectId: 'ef_ig_judgement_cross_hit'
}; //Judgement Cross
SkillEffect[SK.IG_SHIELD_SHOOTING] = {
	effectId: 'ef_ig_shield_shooting',
	effectIdOnCaster: 'ef_ig_shield_shooting_cast',
	hitEffectId: 'ef_ig_shield_shooting_hit'
}; //Shield Shooting
SkillEffect[SK.IG_OVERSLASH] = {
	effectId: 'ef_ig_overslash',
	effectIdOnCaster: 'ef_ig_overslash_cast',
	hitEffectId: 'ef_ig_overslash_hit'
}; //Overslash
SkillEffect[SK.IG_CROSS_RAIN] = { effectId: 'ef_ig_cross_rain', effectIdOnCaster: 'ef_ig_cross_rain_cast' }; //Cross Rain
SkillEffect[6503 /* IG_RADIANT_SPEAR */] = { effectIdOnCaster: 'ef_ig_radiant_spear_cast' }; //Radiant Spear
SkillEffect[6504 /* IG_IMPERIAL_CROSS */] = { effectId: 'ef_ig_imperial_cross' }; //Imperial Cross
SkillEffect[6505 /* IG_IMPERIAL_PRESSURE */] = {
	effectId: 'ef_ig_imperial_pressure',
	effectIdOnCaster: 'ef_ig_imperial_pressure_cast',
	hitEffectId: 'ef_ig_imperial_pressure_hit'
}; //Imperial Pressure
SkillEffect[SK.ALL_FULL_THROTTLE] = { effectId: 1042 }; //Full Throttle
// Summoner
SkillEffect[SK.SU_BITE] = { effectId: 'ef_su_bite' }; //Bite
SkillEffect[SK.SU_HIDE] = {}; //Hide
SkillEffect[SK.SU_SCRATCH] = { effectId: 'ef_su_scratch' }; //Scratch
SkillEffect[SK.SU_STOOP] = {}; //Stoop
SkillEffect[SK.SU_LOPE] = {}; //Lope
SkillEffect[SK.SU_SV_STEMSPEAR] = { effectId: 'ef_su_sv_stemspear' }; //Silvervine Stem Spear
SkillEffect[SK.SU_CN_POWDERING] = {}; //Catnip Powdering
SkillEffect[SK.SU_CN_METEOR] = {}; //Catnip Meteor
SkillEffect[SK.SU_SV_ROOTTWIST] = {}; //Silvervine Root Twist
SkillEffect[SK.SU_SV_ROOTTWIST_ATK] = {}; //Silver Vine Root Twist Attack
SkillEffect[SK.SU_SCAROFTAROU] = { effectId: 'ef_su_scaroftarou' }; //Scar of Tarou
SkillEffect[SK.SU_PICKYPECK] = { effectId: 'ef_su_pickypeck' }; //Picky Peck
SkillEffect[SK.SU_PICKYPECK_DOUBLE_ATK] = {}; //Picky Peck Double Attack
SkillEffect[SK.SU_ARCLOUSEDASH] = { effectId: 'ef_su_arclousedash' }; //Arclouse Dash
SkillEffect[SK.SU_LUNATICCARROTBEAT] = {}; //Lunatic Carrot Beat
SkillEffect[SK.SU_TUNABELLY] = { effectId: 'ef_su_tunabelly' }; //Tuna Belly
SkillEffect[SK.SU_TUNAPARTY] = {}; //Tuna Party
SkillEffect[SK.SU_BUNCHOFSHRIMP] = { effectId: 'ef_su_bunchofshrimp' }; //Bunch of Shrimp
SkillEffect[SK.SU_FRESHSHRIMP] = { effectId: 'ef_su_freshshrimp' }; //Fresh Shrimp
// Unknown Unconfirmed Summoner Skills - Animations Show On These
SkillEffect[SK.SU_POWEROFFLOCK] = { effectId: 'ef_su_powerofflock' }; //Power of Flock
SkillEffect[SK.SU_SVG_SPIRIT] = { effectId: 'ef_su_svg_spirit' }; //Spirit of Savage
SkillEffect[SK.SU_HISS] = { effectId: 'ef_su_hiss' }; //Hiss
SkillEffect[SK.SU_NYANGGRASS] = { effectId: 'ef_su_nyanggrass' }; //Nyang Grass
SkillEffect[SK.SU_GROOMING] = { effectId: 'ef_su_grooming' }; //Grooming
SkillEffect[SK.SU_PURRING] = {}; //Purring
SkillEffect[SK.SU_SHRIMPARTY] = {}; //Tasty Shrimp Party
SkillEffect[SK.SU_MEOWMEOW] = {}; //Meow Meow
SkillEffect[SK.SU_CHATTERING] = { effectId: 'ef_su_chattering' }; //Chattering
// Wedding Skills 3
SkillEffect[SK.WE_CALLALLFAMILY] = {}; //Call All Family
SkillEffect[SK.WE_ONEFOREVER] = {}; //One Forever
SkillEffect[SK.WE_CHEERUP] = {}; //Cheer Up
SkillEffect[SK.SH_CHUL_HO_SONIC_CLAW] = { effectId: 'ef_sh_chul_ho_sonic_claw' }; //Chulho Sonic Claw
SkillEffect[SK.SH_HOWLING_OF_CHUL_HO] = { effectId: 'ef_sh_howling_of_chul_ho' }; //Howling of Chulho
SkillEffect[SK.SH_HOGOGONG_STRIKE] = { effectId: 'ef_sh_hogogong_strike' }; //Hogogong Strike
SkillEffect[SK.SH_KI_SUL_WATER_SPRAYING] = { effectId: 'ef_sh_ki_sul_water_spraying' }; //Kisul Water Spraying
SkillEffect[SK.SH_MARINE_FESTIVAL_OF_KI_SUL] = { effectId: 'ef_sh_marine_festival_of_ki_sul' }; //Marine Festival of Kisul
SkillEffect[SK.SH_SANDY_FESTIVAL_OF_KI_SUL] = { effectId: 'ef_sh_sandy_festival_of_ki_sul' }; //Sandy Festival of Kisul
SkillEffect[SK.SH_KI_SUL_RAMPAGE] = { effectId: 'ef_sh_ki_sul_rampage' }; //Kisul Rampage
SkillEffect[SK.SH_COLORS_OF_HYUN_ROK] = { effectId: 'ef_sh_colors_of_hyun_rok' }; //Colors of Hyunrok
SkillEffect[SK.SH_HYUN_ROKS_BREEZE] = { effectId: 'ef_sh_hyun_roks_breeze' }; //Hyunrok Breeze
SkillEffect[SK.SH_HYUN_ROK_CANNON] = { effectId: 'ef_sh_hyun_rok_cannon' }; //Hyunrok Cannon
SkillEffect[SK.SH_TEMPORARY_COMMUNION] = { effectId: 'ef_sh_temporary_communion' }; //Temporary Communion
SkillEffect[SK.SH_BLESSING_OF_MYSTICAL_CREATURES] = { effectId: 'ef_sh_blessing_of_mystical_creatures' }; //Blessing of Mystical Creatures
SkillEffect[5506 /* SH_CHUL_HO_BATTERING */] = {
	effectId: 'ef_sh_chul_ho_battering',
	effectIdOnCaster: 'ef_sh_chul_ho_battering_cast',
	hitEffectId: 'ef_sh_chul_ho_battering_hit'
}; //Chulho Battering
SkillEffect[5507 /* SH_HYUN_ROK_SPIRIT_POWER */] = {
	effectId: 'ef_sh_hyun_rok_spirit_power',
	effectIdOnCaster: 'ef_sh_hyun_rok_spirit_power_cast',
	hitEffectId: 'ef_sh_hyun_rok_spirit_power_hit'
}; //Hyunrok Spirit Power
// Homunculus S
SkillEffect[SK.HLIF_HEAL] = SkillEffect[SK.AL_HEAL]; //Healing Touch
SkillEffect[SK.HLIF_AVOID] = SkillEffect[SK.AL_INCAGI]; //Avoid
SkillEffect[SK.HLIF_CHANGE] = { effectId: 505 }; //Change
SkillEffect[SK.HAMI_CASTLE] = { effectId: 570 }; //Castling
SkillEffect[SK.HAMI_DEFENCE] = { effectId: 569 }; //Defense
SkillEffect[SK.HAMI_BLOODLUST] = { effectId: 571 }; //Bloodlust
SkillEffect[SK.HFLI_MOON] = {/*565 - 567*/}; //Moonlight
SkillEffect[SK.HFLI_FLEET] = { effectId: 564 }; //Fleeting Move
SkillEffect[SK.HFLI_SPEED] = { effectId: 564 }; //Speed
SkillEffect[SK.HFLI_SBR44] = {}; //S.B.R.44
SkillEffect[SK.HVAN_CAPRICE] = {}; //Caprice
SkillEffect[SK.HVAN_CHAOTIC] = {}; //Benediction of Chaos
SkillEffect[SK.HVAN_EXPLOSION] = { effectId: 183 }; //Bio Explosion
SkillEffect[SK.MH_SUMMON_LEGION] = {}; //Summon Legion
SkillEffect[SK.MH_NEEDLE_OF_PARALYZE] = {}; //Needle of Paralyze
SkillEffect[SK.MH_POISON_MIST] = { effectId: 959 }; //Poison Mist
SkillEffect[SK.MH_PAIN_KILLER] = {}; //Pain Killer
SkillEffect[SK.MH_LIGHT_OF_REGENE] = {}; //Light of Regene
SkillEffect[SK.MH_OVERED_BOOST] = {}; //Overed Boost
SkillEffect[SK.MH_ERASER_CUTTER] = { effectId: 960 }; //Eraser Cutter
SkillEffect[SK.MH_XENO_SLASHER] = {}; //Xeno Slasher
SkillEffect[SK.MH_SILENT_BREEZE] = { effectId: 961 }; //Silent Breeze
SkillEffect[SK.MH_STYLE_CHANGE] = {}; //Style Change
SkillEffect[SK.MH_SONIC_CRAW] = { effectId: 965 }; //Sonic Claw
SkillEffect[SK.MH_SILVERVEIN_RUSH] = {}; //Silver Bain Rush
SkillEffect[SK.MH_MIDNIGHT_FRENZY] = { effectId: 967 }; //Midnight Frenzy
SkillEffect[SK.MH_STAHL_HORN] = {}; //Steel Horn
SkillEffect[SK.MH_GOLDENE_FERSE] = {}; //Golden Heel
SkillEffect[SK.MH_STEINWAND] = {}; //Stone Wall
SkillEffect[SK.MH_HEILIGE_STANGE] = {}; //Holy Pole
SkillEffect[SK.MH_ANGRIFFS_MODUS] = {}; //Attack Mode
SkillEffect[SK.MH_TINDER_BREAKER] = { effectId: 966 }; //Tinder Breaker
SkillEffect[SK.MH_CBC] = {}; //Continual Break Combo
SkillEffect[SK.MH_EQC] = {}; //Eternal Quick Combo
SkillEffect[SK.MH_MAGMA_FLOW] = { effectId: 962 }; //Magma Flow
SkillEffect[SK.MH_GRANITIC_ARMOR] = {}; //Granitic Armor
SkillEffect[SK.MH_LAVA_SLIDE] = { effectId: 964 }; //Lava Slide
SkillEffect[SK.MH_PYROCLASTIC] = {}; //Pyroclastic
SkillEffect[SK.MH_VOLCANIC_ASH] = { effectId: 975 }; //Volcanic Ash
// Mercenary Skill Place holders
SkillEffect[SK.MS_BASH] = SkillEffect[SK.SM_BASH]; //Bash
SkillEffect[SK.MS_MAGNUM] = SkillEffect[SK.SM_MAGNUM]; //Magnum_Break
SkillEffect[SK.MS_BOWLINGBASH] = SkillEffect[SK.KN_BOWLINGBASH]; //Bowling_Bash
SkillEffect[SK.MS_PARRYING] = SkillEffect[SK.LK_PARRYING]; //Parry
SkillEffect[SK.MS_REFLECTSHIELD] = SkillEffect[SK.CR_REFLECTSHIELD]; //Shield_Reflect
SkillEffect[SK.MS_BERSERK] = SkillEffect[SK.LK_BERSERK]; //Frenzy
SkillEffect[SK.MA_DOUBLE] = SkillEffect[SK.AC_DOUBLE]; //Double_Strafe
SkillEffect[SK.MA_SHOWER] = SkillEffect[SK.AC_SHOWER]; //Arrow_Shower
SkillEffect[SK.MA_SKIDTRAP] = SkillEffect[SK.HT_SKIDTRAP]; //Skid_Trap
SkillEffect[SK.MA_LANDMINE] = SkillEffect[SK.HT_LANDMINE]; //Land_Mine
SkillEffect[SK.MA_SANDMAN] = SkillEffect[SK.HT_SANDMAN]; //Sandman
SkillEffect[SK.MA_FREEZINGTRAP] = SkillEffect[SK.HT_FREEZINGTRAP]; //Freezing_Trap
SkillEffect[SK.MA_REMOVETRAP] = SkillEffect[SK.HT_REMOVETRAP]; //Remove_Trap
SkillEffect[SK.MA_CHARGEARROW] = SkillEffect[SK.AC_CHARGEARROW]; //Arrow_Repel
SkillEffect[SK.MA_SHARPSHOOTING] = SkillEffect[SK.SN_SHARPSHOOTING]; //Focused_Arrow_Strike
SkillEffect[SK.ML_PIERCE] = SkillEffect[SK.KN_PIERCE]; //Pierce
SkillEffect[SK.ML_BRANDISH] = SkillEffect[SK.KN_BRANDISH]; //Brandish_Spear
SkillEffect[SK.ML_SPIRALPIERCE] = SkillEffect[SK.LK_SPIRALPIERCE]; //Spiral_Pierce
SkillEffect[SK.ML_DEFENDER] = SkillEffect[SK.CR_DEFENDER]; //Defending_Aura
SkillEffect[SK.ML_AUTOGUARD] = SkillEffect[SK.CR_AUTOGUARD]; //Guard
SkillEffect[SK.ML_DEVOTION] = SkillEffect[SK.CR_DEVOTION]; //Sacrifice
SkillEffect[SK.MER_MAGNIFICAT] = SkillEffect[SK.PR_MAGNIFICAT]; //Magnificat
SkillEffect[SK.MER_QUICKEN] = SkillEffect[SK.KN_TWOHANDQUICKEN]; //Two-Hand_Quicken
SkillEffect[SK.MER_SIGHT] = SkillEffect[SK.MG_SIGHT]; //Sight
SkillEffect[SK.MER_CRASH] = {}; //Crash
SkillEffect[SK.MER_REGAIN] = {}; //Regain
SkillEffect[SK.MER_TENDER] = {}; //Tender
SkillEffect[SK.MER_BENEDICTION] = {}; //Benediction
SkillEffect[SK.MER_RECUPERATE] = {}; //Recuperate
SkillEffect[SK.MER_MENTALCURE] = {}; //Mental_Cure
SkillEffect[SK.MER_COMPRESS] = {}; //Compress
SkillEffect[SK.MER_PROVOKE] = SkillEffect[SK.SM_PROVOKE]; //Provoke
SkillEffect[SK.MER_AUTOBERSERK] = SkillEffect[SK.SM_AUTOBERSERK]; //Berserk
SkillEffect[SK.MER_DECAGI] = SkillEffect[SK.AL_DECAGI]; //Decrease_AGI
SkillEffect[SK.MER_SCAPEGOAT] = {}; //Scapegoat
SkillEffect[SK.MER_LEXDIVINA] = SkillEffect[SK.PR_LEXDIVINA]; //Lex_Divina
SkillEffect[SK.MER_ESTIMATION] = SkillEffect[SK.WZ_ESTIMATION]; //Sense
SkillEffect[SK.MER_KYRIE] = SkillEffect[SK.PR_KYRIE]; //Kyrie Eleison
SkillEffect[SK.MER_BLESSING] = SkillEffect[SK.AL_BLESSING]; //Blessing
SkillEffect[SK.MER_INCAGI] = SkillEffect[SK.AL_INCAGI]; //Increase Agility
// Elemental Spirits Skills
SkillEffect[SK.EL_CIRCLE_OF_FIRE] = {}; //Circle of Fire
SkillEffect[SK.EL_FIRE_CLOAK] = {}; //Fire Cloak
SkillEffect[SK.EL_FIRE_MANTLE] = {}; //Fire Mantle
SkillEffect[SK.EL_WATER_SCREEN] = {}; //Water Screen
SkillEffect[SK.EL_WATER_DROP] = {}; //Water Drop
SkillEffect[SK.EL_WATER_BARRIER] = {}; //Water Barrier
SkillEffect[SK.EL_WIND_STEP] = {}; //Wind Step
SkillEffect[SK.EL_WIND_CURTAIN] = {}; //Wind Curtain
SkillEffect[SK.EL_ZEPHYR] = {}; //Zephyr
SkillEffect[SK.EL_SOLID_SKIN] = {}; //Solid Skin
SkillEffect[SK.EL_STONE_SHIELD] = {}; //Stone Shield
SkillEffect[SK.EL_POWER_OF_GAIA] = {}; //Power of Gaia
SkillEffect[SK.EL_PYROTECHNIC] = {}; //Pyrotechnic
SkillEffect[SK.EL_HEATER] = {}; //Heater
SkillEffect[SK.EL_TROPIC] = {}; //Tropic
SkillEffect[SK.EL_AQUAPLAY] = {}; //Aqua Play
SkillEffect[SK.EL_COOLER] = {}; //Cooler
SkillEffect[SK.EL_CHILLY_AIR] = {}; //Cool Air
SkillEffect[SK.EL_GUST] = {}; //Gust
SkillEffect[SK.EL_BLAST] = {}; //Blast
SkillEffect[SK.EL_WILD_STORM] = {}; //Wild Storm
SkillEffect[SK.EL_PETROLOGY] = {}; //Petrology
SkillEffect[SK.EL_CURSED_SOIL] = {}; //Cursed Soil
SkillEffect[SK.EL_UPHEAVAL] = {}; //Upheaval
SkillEffect[SK.EL_FIRE_ARROW] = {}; //Fire Arrow
SkillEffect[SK.EL_FIRE_BOMB] = {}; //Fire Bomb
SkillEffect[SK.EL_FIRE_BOMB_ATK] = {}; //Fire Bomb Attack
SkillEffect[SK.EL_FIRE_WAVE] = {}; //Fire Wave
SkillEffect[SK.EL_FIRE_WAVE_ATK] = {}; //Fire Wave Attack
SkillEffect[SK.EL_ICE_NEEDLE] = {}; //Ice Needle
SkillEffect[SK.EL_WATER_SCREW] = {}; //Water Screw
SkillEffect[SK.EL_WATER_SCREW_ATK] = {}; //Water Screw Attack
SkillEffect[SK.EL_TIDAL_WEAPON] = {}; //Tidal Weapon
SkillEffect[SK.EL_WIND_SLASH] = {}; //Wind Slasher
SkillEffect[SK.EL_HURRICANE] = {}; //Hurricane Rage
SkillEffect[SK.EL_HURRICANE_ATK] = {}; //Hurricane Rage Attack
SkillEffect[SK.EL_TYPOON_MIS] = {}; //Typhoon Missile
SkillEffect[SK.EL_TYPOON_MIS_ATK] = {}; //Typhoon Missile Attack
SkillEffect[SK.EL_STONE_HAMMER] = {}; //Stone Hammer
SkillEffect[SK.EL_ROCK_CRUSHER] = {}; //Rock Launcher
SkillEffect[SK.EL_ROCK_CRUSHER_ATK] = {}; //Rock Launcher Attack
SkillEffect[SK.EL_STONE_RAIN] = {}; //Stone Rain
//Guild Skills
SkillEffect[SK.GD_BATTLEORDER] = {}; //Battle Orders
SkillEffect[SK.GD_REGENERATION] = {}; //Regeneration
SkillEffect[SK.GD_RESTORE] = {}; //Restoration
SkillEffect[SK.GD_EMERGENCYCALL] = {}; //Urgent Call
SkillEffect[SK.GD_ITEMEMERGENCYCALL] = {}; //Item Emergency Call

// Earlier classes: entries for skills that had none.
SkillEffect[SK.SL_ASSASIN] = { effectId: 'ef_sl_assasin' }; //Spirit of the Assasin
SkillEffect[SK.BS_ADRENALINE2] = { effectId: 'ef_bs_adrenaline2' }; //Advanced Adrenaline Rush
SkillEffect[SK.SL_HUNTER] = { effectId: 'ef_sl_hunter' }; //Spirit of the Hunter
SkillEffect[SK.SJ_FULLMOONKICK] = { effectId: 'ef_sj_fullmoonkick' }; //Full Moon Kick
SkillEffect[SK.SJ_NEWMOONKICK] = { effectId: 'ef_sj_newmoonkick' }; //New Moon Kick
SkillEffect[SK.SJ_FLASHKICK] = { effectId: 'ef_sj_flashkick' }; //Flash Kick
SkillEffect[SK.SJ_FALLINGSTAR] = { effectId: 'ef_sj_fallingstar' }; //Falling Star
SkillEffect[SK.SJ_DOCUMENT] = { effectId: 'ef_sj_document' }; //Document of Sun Moon and Star
SkillEffect[SK.SJ_SOLARBURST] = { effectId: 'ef_sj_solarburst' }; //Solar Burst
SkillEffect[SK.SJ_PROMINENCEKICK] = { effectId: 'ef_sj_prominencekick' }; //Prominence Kick
SkillEffect[SK.SP_SOULGOLEM] = { effectId: 'ef_sp_soulgolem' }; //Golem's Soul
SkillEffect[SK.SP_SOULCURSE] = { effectId: 'ef_sp_soulcurse' }; //Soul Curse
SkillEffect[SK.SP_SOULREVOLVE] = { effectId: 'ef_sp_soulrevolve' }; //Soul Revolution
SkillEffect[SK.NV_HELPANGEL] = { effectId: 'ef_nv_helpangel' }; //Help Angel

export default SkillEffect;
