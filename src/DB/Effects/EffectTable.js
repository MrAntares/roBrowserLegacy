/**
 * DB/Effects/EffectTable.js
 *
 * List effects
 * TODO: complete the list, add informations about sound.
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function( require )
{
    'use strict';

    /// type = STR
    ///
    /// - file:
    ///   STR file name stored in data/texture/effect/(.*).str
    ///
    /// - min:
    ///   minify str file stored in data/texture/effect/(.*).str
    ///   used when /mineffect is enabled
    ///
    /// - rand
    ///   replace the %d in the file name with a rand(val1, val2).
    ///
    /// - wav:
    ///   audio file stored in data/wav/ folder
    ///
    /// - attachedEntity:
    ///   if set to true, the effect will follow the entity attached


    /// type = SPR
    ///
    /// - file:
    ///   Sprite file name stored in data/sprite/AIANA®/(.*).spr
    ///
    /// - wav:
    ///   audio file stored in data/wav/ folder
    ///
    /// - attachedEntity:
    ///   if set to true, the effect will follow the entity attached
    ///
    /// - head
    ///   if set to true, the sprite will be at the character's head
    ///
    /// - stopAtEnd
    ///   do not remove when animation end
    ///
    /// - direction
    ///   if set to true, the sprite will inherit character's direction

    /// type = FUNC
    ///
    /// - func:
    ///   callback to use


    return {

        1: [{
            //  Loads 2 tga-images, semi-randomly (alternating pattern but random position) aligns 4 instances of each (=8 in total) in a circle around the object and stretches them away.
            //  Important note: It really is just stretching one end further and further out, one end of the images is tied to the object
            //type: 'FUNC',
            //file:  'lens1', // lens2 is also used
            wav: 'effect/ef_hit2',
            attachedEntity: true
        }],


        2: [{
            //type:  'FUNC',
            wav: 'effect/ef_hit3',
            attachedEntity: true
        }],


        3: [{
            //type:  'FUNC',
            wav: 'effect/ef_hit4',
            attachedEntity: true
        }],


        4: [{
            //type:  'FUNC',
            //file:  'lens2',
            wav: 'effect/ef_hit5',
            attachedEntity: true
        }],


        5: [{
            //type:  'FUNC',
            //file: 'lens2',
            wav: 'effect/ef_hit6',
            attachedEntity: true
        }],


        6: [{ //portal - entering the new map
            //type: 'FUNC',
            //file: 'effect/ring_blue',
            wav: 'effect/ef_portal',
            attachedEntity: true
        }],


        7: [{
            //type: 'FUNC',
            //file: 'effect/alpha_down',
            wav: '_heal_effect',
            attachedEntity: true
        }],


        8: [{
            //type: 'FUNC',
            //file: 'effect/ring_yellow',
            attachedEntity: false
        }],


        9: [{
            //type: 'FUNC',
            //file: 'effect/alpha_down',
            attachedEntity: false
        }],


        10: [{
            type: 'STR',
            file: 'maemor',
            min:  'memor_min',
            wav:  'effect/ef_coin2',
            attachedEntity: true
        }],


        11: [{
            //type: 'FUNC',
            //file: 'effect/endure',
          wav:  'effect/ef_endure',
          attachedEntity: true
        }],


        12: [{
            //type: 'FUNC',
            //file: 'effect/ring_yellow',
            wav:  'effect/ef_beginspell',
            attachedEntity: true
        }],


        13: [{
            type: 'STR',
            file: 'effect/safetywall',
            wav:  'effect/ef_glasswall',
            attachedEntity: false
        }],


        14: [{
            //type: 'FUNC',
            //file: 'effect/ring_blue',
            wav: '_heal_effect',
            attachedEntity: true
        }],


        15: [{ //soul strike caster
            //type: 'FUNC',
            //file: 'sprite/AIANA®/particle1',
            wav: 'effect/ef_soulstrike',
            attachedEntity: false
        }],


        16: [{ //hide and monster body relocation sound
            //type: 'FUNC',
            //file: 'effect/alpha_center',
            wav: 'effect/ef_bash',
            attachedEntity: true
        }],

        
        17: [{   // still missing half of sphere with text. 'effect/´ëAo1ß',
            type: 'FUNC',
            wav: 'effect/ef_magnumbreak',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var MagnumBreak = require('Renderer/Effects/MagnumBreak');
                this.add(new MagnumBreak(pos, 3.0, 1.0, 2, 'ring_yellow', 0), AID);
            }
        }],
        

        18: [{
            //type: 'FUNC',
            //file: 'sprite/AIANA®/particle7',
            wav: 'effect/ef_steal',
            attachedEntity: true
        }],


        // 19: Invalid Effect ID Popup in client


        20: [{
            //type: 'FUNC',
            //file: 'sprite/AIANA®/particle3',
            wav: 'effect/assasin_enchantpoison',
            attachedEntity: false
        }],


        21: [{
            //type: 'FUNC',
            wav: 'effect/ef_detoxication',
            //file: 'sprite/AIANA®/particle2',
            attachedEntity: false
        }],


        22: [{
            // Sight effect, circling the entity 3.75 times
            type: 'SPR', //type: 'FUNC',
            file: 'sight',  //file: 'sprite/AIANA®/sight',
            wav: 'effect/ef_sight',
            attachedEntity: true
        }],


        23: [{
            type: 'STR',
            file: 'stonecurse',
            attachedEntity: true
        }],


        24: [{ //fireball caster effect (on target effect 49:)
            type: 'FUNC',
            wav: 'effect/ef_fireball',
            attachedEntity: false
        }],


        25: [{
            type: 'STR',
            file: 'firewall%d',
            wav:  'effect/ef_firewall',
            rand: [1, 2],
            attachedEntity: false
        }],


        26: [{
            //type: 'FUNC',
            wav: 'effect/ef_icearrow%d', // Or ef_icearrow2 & ef_icearrow3 . Seems to be random
            rand: [1, 3],
            attachedEntity: false
        }],


        27: [{ //Frost diver caster (ice traveling to target)
            //type: 'FUNC',
            file: 'effect/ice',
            wav: 'effect/ef_frostdiver1',
            attachedEntity: false
        }],


        28: [{ //Frost Diver target hit
            //type: 'FUNC',
            file: 'effect/ice',
            wav: 'effect/ef_frostdiver2',
            attachedEntity: true
        }],


        29: [{
            type: 'STR',
            file: 'lightning',
            attachedEntity: true
        }],


        30: [{
            type: 'STR',
            file: 'thunderstorm',
            wav:  'effect/magician_thunderstorm',
            attachedEntity: false
        }],


        31: [{
            //type: 'FUNC',
            wav: 'effect/ef_firearrow1',
            attachedEntity: true
        }],


        32: [{
            //type: 'FUNC',
            //file: 'effect/Ao1ß1', // Uses up to Ao1ß8 , so eight files for an animated explosion
            wav: 'effect/ef_napalmbeat',
            attachedEntity: true
        }],

        //33: //ruwach
        34: [{
            //type: 'FUNC',
            //file: 'effect/ring_blue',
            wav: 'effect/ef_teleportation',
            attachedEntity: false
        }],


        35: [{ //warp portal casting before unit appear
            //type: 'FUNC',
            //file: 'effect/ring_blue',
            wav: 'effect/ef_readyportal',
            attachedEntity: false
        }],

        //36: //warp portal unit

        37: [{
            //type: 'FUNC',
            //file: 'effect/ac_center2',
            wav: 'effect/ef_incagility',
            attachedEntity: true
        }],


        38: [{
            //type: 'FUNC',
            wav: 'effect/ef_decagility',
            attachedEntity: true
        }],


        39: [{
            type: 'SPR',
            file: '1o1ö¶ß±â',
            wav:  'effect/ef_aqua',
            head:  true,
            attachedEntity: true
        }],


        40: [{
            type: 'STR',
            file: 'cross',
            wav:  'effect/ef_signum',
            attachedEntity: true
        }],


        41: [{
            type: 'STR',
            file: 'angelus',
            wav:  'effect/ef_angelus',
            min:  'jong_mini',
            head:  true,
            attachedEntity: true
        }],


        42: [{
            type: 'SPR',
            file: 'Aao1',
            wav: 'effect/ef_blessing',
            attachedEntity: false,
            head: true
        }],


        43: [{
            //type: 'FUNC',
            wav: 'effect/ef_incagidex',
            attachedEntity: true
        }],


        45: [{ // This one is almost invisible, but there are some small white thingies flying around
            type: 'FUNC',
            //file: 'sprite/AIANA®/particle1',
            attachedEntity: true
        }],


        47: [{
            type: 'SPR',
            file: 'torch_01',
            attachedEntity: false,
            repeat: true
        }],


        49: [{
            type: 'STR',
            file: 'firehit%d',
            wav:  'effect/ef_firehit',
            rand: [1, 3],
            attachedEntity: true
        }],

        51: [{ // water hit
            wav:  '_hit_fist%d',
            rand: [3, 4],
            attachedEntity: true
        }],  

        52: [{
            type: 'STR',
            file: 'windhit%d',
            wav:  '_hit_fist%d',
            rand: [1, 3],
            attachedEntity: true
        }],


        53: [{
            type: 'SPR',
            file: 'poisonhit',
            wav:  'effect/ef_poisonattack',
            attachedEntity: false
        }],


        54: [{
            //type: 'FUNC',
            wav:  'effect/ef_beginspell',
            attachedEntity: true
        }],


        55: [{
            //type: 'FUNC',
            wav:  'effect/ef_beginspell',
            attachedEntity: true
        }],


        56: [{
            //type: 'FUNC',
            wav:  'effect/ef_beginspell',
            attachedEntity: true
        }],


        57: [{
            //type: 'FUNC',
            wav:  'effect/ef_beginspell',
            attachedEntity: true
        }],


        58: [{
            //type: 'FUNC',
            wav:  'effect/ef_beginspell',
            attachedEntity: true
        }],


        59: [{
            //type: 'FUNC',
            wav:  'effect/ef_beginspell',
            attachedEntity: true
        }],


        60: [{
            type: 'FUNC',
            attachedEntity: true,
            func: function(entity, tick) {
                var LockOnTarget = require('Renderer/Effects/LockOnTarget');

                this.add(new LockOnTarget(
                    entity,
                    tick,
                    tick + 10000
                ), entity.GID);
            },
        }],


        62: [{
            //type: 'FUNC',
            //file: 'sprite/AIANA®/sight',
            wav:  'effect/wizard_sightrasher',
            attachedEntity: false
        }],


        64: [{
            type: 'STR',
            file: 'arrowshot',
            attachedEntity: true
        }],


        65: [{
            type: 'STR',
            file: 'invenom',
            wav:  'effect/thief_invenom',
            attachedEntity: true
        }],


        66: [{
            type: 'STR',
            file: 'cure',
            wav:  'effect/acolyte_cure',
            min:  'cure_min',
            attachedEntity: true
        }],


        67: [{
            type: 'STR',
            file: 'provoke',
            wav:  'effect/swordman_provoke',
            attachedEntity: true
        }],


        68: [{
            type: 'STR',
            file: 'mvp',
            wav:  'effect/st_mvp',
            attachedEntity: true
        }],


        69: [{
            type: 'STR',
            file: 'skidtrap',
            wav:  'effect/hunter_skidtrap', // or hallucinationwalk ?
            attachedEntity: false
        }],


        70: [{
            type: 'STR',
            file: 'brandish',
            wav: '_enemy_hit_normal1',  //wav:  'effect/knight_brandish_spear', fake
            attachedEntity: true
        }],


        74: [{
            //type: 'FUNC',
            wav:  'effect/wizard_icewall',
            attachedEntity: false
        }],


        75: [{
            type: 'STR',
            file: 'gloria',
            wav:  'effect/priest_gloria',
            min:  'gloria_min',
            attachedEntity: true
        }],


        76: [{
            type: 'STR',
            file: 'magnificat',
            wav:  'effect/priest_magnificat',
            min:  'magnificat_min',
            attachedEntity: true
        }],


        77: [{
            type: 'STR',
            file: 'resurrection',
            wav:  'effect/priest_resurrection',
            min:  'resurrection_min',
            attachedEntity: true
        }],


        78: [{
            type: 'STR',
            file: 'recovery',
            wav:  'effect/priest_recovery',
            attachedEntity: true
        }],


        79: [{
            //type: 'FUNC',
            wav:  'effect/wizard_earthspike',
            attachedEntity: false
        }],

        80: [{ //spear boomerang hit on target
            //type: 'FUNC',
			wav:  'effect/ef_fireball',				  
            attachedEntity: true
        }],

        81: [{ // default skill sound?
            wav:  'effect/ef_bash',
            attachedEntity: true
        }],

        82: [{ //turn undead caster
            //type: 'FUNC',
            wav:  'effect/ef_bash',
            attachedEntity: true
        }],

        83: [{
            type: 'STR',
            file: 'sanctuary',
            wav:  'effect/priest_sanctuary',
            attachedEntity: false
        }],


        84: [{
            type: 'STR',
            file: 'impositio',
            wav:  'effect/priest_impositio',
            attachedEntity: true
        }],


        85: [{
            type: 'STR',
            file: 'lexaeterna',
            wav:  'effect/priest_lexaeterna',
            min:  'lexaeterna_min',
            attachedEntity: true
        }],


        86: [{
            type: 'STR',
            file: 'aspersio',
            wav:  'effect/priest_aspersio',
            attachedEntity: true
        }],


        87: [{
            type: 'STR',
            file: 'lexdivina',
            wav:  'effect/priest_lexdivina',
            attachedEntity: true
        }],


        88: [{
            type: 'STR',
            file: 'suffragium',
            wav:  'effect/priest_suffragium',
            min:  'suffragium_min',
            attachedEntity: true
        }],


        89: [{
            type: 'STR',
            file: 'stormgust',
            wav:  'effect/wizard_stormgust',
            min:  'storm_min',
            attachedEntity: false
        }],


        90: [{
            type: 'STR',
            file: 'lord',
            wav:  'effect/wizard_fire_ivy',
            attachedEntity: false
        }],


        91: [{
            type: 'STR',
            file: 'benedictio',
            wav:  'effect/priest_benedictio',
            attachedEntity: true
        }],


        92: [{
            type: 'STR',
            file: 'meteor%d',
            wav:  'effect/wizard_meteor',
            rand: [1, 4],
            attachedEntity: false
        }],


        93: [{
            type: 'STR',
            //file: 'ufidel',
            //file: 'thunder_ball000%d',
            wav:  'effect/hunter_shockwavetrap',
            //rand: [1, 6],
            attachedEntity: true
        }],


        94: [{
            type: 'STR',
            file: 'ufidel_pang',
            attachedEntity: true
        }],


        95: [{
            type: 'STR',
            file: 'quagmire',
            wav:  'effect/wizard_quagmire',
            attachedEntity: false
        }],


        96: [{ //firepillar caster
            type: 'STR',
            file: 'firepillar',
            wav:  'effect/wizard_fire_pillar_a',
            attachedEntity: false
        }],


        97: [{ //firepillar target hit
            type: 'STR',
            file: 'firepillarbomb',
            wav:  'effect/wizard_fire_pillar_b',
            attachedEntity: false
        }],


        98: [{
            //type: 'FUNC',
            // This one is pretty messy... it somehow consists of two sprites, one is attached to the Entity, one isnt. additionally it consists of two sounds
            // For the sake of simplicity, I propose just using one sprite and one sound - the _a sound is just some "intro" while _b is a real effect
            // black_adrenalinerush.wav what is this for?
            wav:  'effect/black_adrenalinerush_b',  // The original client plays _a first and then continues with b
            attachedEntity: true
        }],

        '98_beforecast': [{
            wav:  'effect/black_adrenalinerush_a',
            attachedEntity: true
        }],
        

        99: [{
            //type: 'FUNC',
            // Again two sprites... one attached one not. But here the "main" sprite is ment to stay a little longer
            wav:  'effect/hunter_flasher',
            attachedEntity: false
        }],


        100: [{
            //type: 'FUNC',
            wav:  'effect/hunter_removetrap',
            attachedEntity: false
        }],

        101: [{
            type: 'STR',
            file: 'repairweapon',
            wav:  'effect/black_weapon_repear',
            attachedEntity: true
        }],


        102: [{
            type: 'STR',
            file: 'crashearth',
            wav:  'effect/black_hammerfall',
            attachedEntity: false
        }],


        103: [{
            type: 'STR',
            file: 'weaponperfection',
            wav:  'effect/black_weapon_perfection',
            min:  'weaponperfection_min',
            attachedEntity: true
        }],


        104: [{
            type: 'STR',
            file: 'maximizepower',
            min:  'maximize_min',
            attachedEntity: true
        }],

        //105: empty

        106: [{
            type: 'STR',
            file: 'blastmine',
            wav:  'effect/hunter_blastmine', //hun_blastmine
            attachedEntity: false
        }],


        107: [{
            type: 'STR',
            file: 'claymore',
            wav:  'effect/hunter_claymoretrap',
            attachedEntity: false
        }],


        108: [{
            type: 'STR',
            file: 'freezing',
            wav:  'effect/hunter_freezingtrap',
            attachedEntity: false
        }],


        109: [{
            type: 'STR',
            file: 'bubble%d',
            rand: [1, 4],
            attachedEntity: false
        }],


        110: [{
            type: 'STR',
            file: 'gaspush',
            wav:  'effect/se_gas_pushhh',
            attachedEntity: false
        }],


        111: [{
            type: 'STR',
            file: 'spring',
            wav:  'effect/hunter_springtrap',
            attachedEntity: false
        }],


        112: [{ //kyrie caster
            type: 'STR',
            file: 'kyrie',
            wav:  'effect/priest_kyrie_eleison_a', //on target its priest_kyrie_eleison_b
            min:  'kyrie_min',
            attachedEntity: true
        }],



        113: [{
            type: 'STR',
            file: 'magnus',
            wav:  'effect/priest_magnus',
            attachedEntity: false
        }],

        115: [{ //blitzbeat on target hit
            wav:  'effect/hunter_blitzbeat',
            attachedEntity: true
        }],
		
		//116:	Fling Watersphere
        //117: waterball  (caster or hit?)
		
        119: [{
            wav:  'effect/hunter_detecting',
            attachedEntity: true
        }],
		
		//120:	Cloaking
        //121: // sonic blow caste
		//122:	Multi hit effect

        123: [{ //grimtooth caster
            wav:  'effect/ef_frostdiver',
            attachedEntity: true
        }],

        124: [{
            type: 'STR',
            file: 'venomdust',
            wav:  'effect/assasin_venomdust',
            attachedEntity: false
        }],


        126: [{
            type: 'STR',
            file: 'poisonreact_1st',
            wav:  'effect/assasin_poisonreact',
            attachedEntity: true
        }],


        127: [{
            type: 'STR',
            file: 'poisonreact',
            wav:  'effect/assasin_poisonreact',
            attachedEntity: true
        }],

        128: [{
            wav:  'effect/black_overthrust',
            attachedEntity: true
        }],

        129: [{
            type: 'STR',
            file: 'venomsplasher',
            wav:  'effect/assasin_venomsplasher',
            attachedEntity: true
        }],


        130: [{
            type: 'STR',
            file: 'twohand',
            wav:  'effect/knight_twohandquicken',
            head: true,
            attachedEntity: true
        }],


        131: [{ //autocounter activate hit
            type: 'STR',
            file: 'autocounter',
            wav:  'effect/knight_autocounter',
            attachedEntity: true
        }],
		
		//132:	Grimtooth Hit

        133: [{
            type: 'STR',
            file: 'freeze',
            attachedEntity: true
        }],


        134: [{
            type: 'STR',
            file: 'freezed',
            attachedEntity: true
        }],


        135: [{
            type: 'STR',
            file: 'icecrash',
            attachedEntity: true
        }],


        136: [{
            type: 'STR',
            file: 'slowp',
            wav:  'effect/priest_slowpoison',
            attachedEntity: false
        }],

        138: [{
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var FPEffect = require('Renderer/Effects/FirePillar');
                this.add(new FPEffect(pos, tick), AID);
            }
        }],

        139: [{
            type: 'STR',
            file: 'sandman',
            wav:  'effect/hunter_sandman',
            attachedEntity: false
        }],

        140: [{
            wav:  'effect/priest_resurrection',
            attachedEntity: true
        }],

        141: [{
            type: 'STR',
            file: 'pneuma%d',
            rand: [1, 3],
            attachedEntity: false
        }],

		//142	Heaven's Drive

        143: [{ //sonicblow at target
            type: 'STR',
            file: 'sonicblow',
            attachedEntity: true
        }],


        144: [{
            type: 'STR',
            file: 'brandish2',
            wav:  'effect/knight_brandish_spear',
            attachedEntity: true
        }],


        145: [{
            type: 'STR',
            file: 'shockwave',
            wav:  'effect/hunter_shockwavetrap',
            attachedEntity: true
        }],


        146: [{
            type: 'STR',
            file: 'shockwavehit',
            attachedEntity: true
        }],


        147: [{
            type: 'STR',
            file: 'earthhit',
            attachedEntity: true
        }],


        148: [{
            type: 'STR',
            file: 'pierce',
            attachedEntity: true
            // attach animation at middle of body
        }],


        149: [{
            type: 'STR',
            file: 'bowling',
            wav: '_enemy_hit_normal1',  //'effect/knight_bowling_bash', fake
            head: true,
            attachedEntity: true
        }],


        150: [{
            type: 'STR',
            file: 'spearstab',
            wav: '_enemy_hit_normal1',
            attachedEntity: true
            // attach animation at middle of body
        }],


        151: [{ //spear boomerang caster
            type: 'STR',
            file: 'spearboomerang',
            wav:  'effect/knight_spear_boomerang',
            head: true,
            attachedEntity: true
        }],


        152: [{ //turn undead hit on targer
            type: 'STR',
            file: 'holyhit',
            attachedEntity: true
        }],


        153: [{
            type: 'STR',
            file: 'concentration',
            wav:  'effect/ac_concentration',
            attachedEntity: true
        }],


        154: [{
            type: 'STR',
            file: 'bs_refinesuccess',
            wav:  'effect/bs_refinesuccess',
            attachedEntity: true
        }],


        155: [{
            type: 'STR',
            file: 'bs_refinefailed',
            wav:  'effect/bs_refinefailed',
            attachedEntity: true
        }],

		//156:	jobchange.str not found error
		//157:	levelup.str not found error

        158: [{
            type: 'STR',
            file: 'joblvup',
            attachedEntity: true
        }],
		
		//159:	PvP circle
		//160:	PvP Party Circle
		//161:	(Nothing)
		//162:	Snow
		//163:	White Sakura Leaves
		//164:	(Nothing)

        165: [{ //Comodo Fireworks Ball
            wav:  'effect/\xc6\xf8\xc1\xd7', //ĆřÁ×
            attachedEntity: false
        }],
		
		//166:	Energy Coat (Visual Effect)
		//167:	(Nothing)
		//168:	(Nothing)
		
        169: [{
            type: 'STR',
            file: 'energycoat',
            attachedEntity: true
        }],


        170: [{
            type: 'STR',
            file: 'cartrevolution',
            attachedEntity: true
        }],

		//171:	Venom Dust Map Unit
		//172:	Change Element (Dark)
		//173:	Change Element (Fire)
		//174:	Change Element (Water)
		//175:	Change Element (Wind)
		//176:	Change Element (Fire)
		//177:	Change Element (Earth)
		//178:	Change Element (Holy)
		//179:	Change Element (Poison)

        181: [{
            type: 'STR',
            file: 'mentalbreak',
            attachedEntity: true
        }],


        182: [{
            type: 'STR',
            file: 'magical',
            attachedEntity: true
        }],


        183: [{
            type: 'STR',
            file: 'sui_explosion',
            attachedEntity: true
        }],


        185: [{
            type: 'STR',
            file: 'suicide',
            attachedEntity: true
        }],


        186: [{
            type: 'STR',
            file: 'yunta_1',
            attachedEntity: true
        }],


        187: [{
            type: 'STR',
            file: 'yunta_2',
            attachedEntity: true
        }],


        188: [{
            type: 'STR',
            file: 'yunta_3',
            attachedEntity: true
        }],


        189: [{
            type: 'STR',
            file: 'yunta_4',
            attachedEntity: true
        }],


        190: [{
            type: 'STR',
            file: 'yunta_5',
            attachedEntity: true
        }],


        191: [{
            type: 'STR',
            file: 'homing',
            attachedEntity: true
        }],


        192: [{
            type: 'STR',
            file: 'poison',
            attachedEntity: true
        }],


        193: [{
            type: 'STR',
            file: 'silence',
            attachedEntity: true
        }],


        194: [{
            type: 'STR',
            file: 'stun',
            attachedEntity: true
        }],


        195: [{
            type: 'STR',
            file: 'stonecurse',
            attachedEntity: true
        }],

		//196:	Curse Attack

        197: [{
            type: 'STR',
            file: 'sleep',
            attachedEntity: true
        }],

		//198:	(Nothing)

        199: [{
            type: 'STR',
            file: 'pong%d',
            rand: [1, 3],
            attachedEntity: false
        }],

		//200:	Normal level 99 Aura (Middle)
		//201:	Normal level 99 Aura (Bottom)
		//202:	Lv 99 Aura Bubble
		//203:	Fury (Visual Effect)

        204: [{
            type: 'STR',
            file: '\xbb\x21\xb0\x4c\x41\xf7\x31\xc7', //»!°LA÷1Ç
            attachedEntity: true
        }],


        205: [{
            type: 'STR',
            file: '\xc1\xd6\x45\xab\x41\xf7\x31\xc7', //ÁÖE«A÷1Ç
            attachedEntity: true
        }],


        206: [{
            type: 'STR',
            file: '\x33\xeb\xb6\x6f\x41\xf7\x31\xc7', //3ë¶oA÷1Ç
            attachedEntity: true
        }],


        207: [{
            type: 'STR',
            file: '\xc7\x49\x33\xe1\x41\xf7\x31\xc7', //ÇI3áA÷1Ç
            attachedEntity: true
        }],


        208: [{
            type: 'STR',
            file: '\x41\xc4\xb6\x6f\x41\xf7\x31\xc7', //AÄ¶oA÷1Ç
            attachedEntity: true
        }],


        209: [{
            type: 'STR',
            file: '\x41\x45\xb7\x49\x41\xf7\x31\xc7', //AE·IA÷1Ç
            attachedEntity: true
        }],


        210: [{
            type: 'STR',
            file: 'fruit',
            attachedEntity: true
        }],


        211: [{
            type: 'STR',
            file: 'fruit_',
            attachedEntity: true
        }],


        212: [{
            type: 'SPR',
            file: 'darkbreath',
            head: true,
            attachedEntity: true
        }],


        213: [{
            type: 'STR',
            file: 'deffender',
            attachedEntity: true
        }],


        214: [{
            type: 'STR',
            file: 'keeping',
            attachedEntity: true
        }],


        218: [{
            type: 'STR',
            file: '\xc1\xfd\xc1\xdf', //ÁýÁß
            attachedEntity: true
        }],


        219: [{
            type: 'STR',
            file: '\xb0\x63\x31\x6f', //°c1o
            attachedEntity: true
        }],


        220: [{
            type: 'STR',
            file: '\x31\xf6\x31\xad\x41\xa9', //1ö1­A©
            attachedEntity: true
        }],

		//221:	Intense light beam
		//222:	Defender (Crusader)
		//223:	Holy Cast Aura
		//224:	Wind (Map effect)
		//225:	Volcano casting effect
		//226:	Grand Cross Effect

        227: [{ //Intimidate / Snatch
            wav:  'effect/rog_intimidate',
            attachedEntity: true
        }],

		//228:	(Nothing)
		//229:	(Nothing)
		//230:	(Nothing)
		//231:	Map Light Pillar Animation 1
		//232:	Sacrifice (Visual Effect)
		//233:	Fog

        234: [{
            type: 'STR',
            file: 'spell',
            attachedEntity: true
        }],


        235: [{
            type: 'STR',
            file: '\xb5\x3f\x31\x6f\x41\xe7', //µ?1oAç
            attachedEntity: true
        }],

		//236:	Deluge Cast Aura
		//237:	Violent Gale Cast Aura
		//238:	Magnetic Earth Cast Aura
		//239:	Volcano (Visual Effect)
		//240:	Deluge (Visual Effect)
		//241:	Violent Gale (Visual Effect)

        242: [{
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var LPEffect = require('Renderer/Effects/LPEffect');
                this.add(new LPEffect(pos, tick), AID);
            }
        }],

		//243:	(Invalid)

        244: [{
            type: 'STR',
            file: '\xb8\x41\xc1\xf7\xb7\xce\xb5\x61', //¸AÁ÷·Îµa
            wav:  'effect/sage_magic rod',
            attachedEntity: true
        }],


        245: [{
            type: 'STR',
            file: 'holy_cross',
            wav:  'effect/cru_holycross',
            attachedEntity: true
        }],


        246: [{
            type: 'STR',
            file: 'shield_charge',
            attachedEntity: true
        }],

		//247:	Map Light Pillar Animation 2

        248: [{
            type: 'STR',
            file: 'providence',
            attachedEntity: true
        }],


        249: [{
            type: 'STR',
            file: 'twohand',
            wav:  'effect/knight_twohandquicken',
            head: true,
            attachedEntity: true
        }],

		//250:	Spear Quicken

        251: [{
            type: 'STR',
            file: 'devotion',
            attachedEntity: true
        }],

		//252:	Reflect Shield
		//253:	Absorb Spirit Spheres
		//254:	Mental Strength (Visual Effect)

        255: [{
            type: 'STR',
            file: 'enc_fire',
            attachedEntity: true
        }],


        256: [{
            type: 'STR',
            file: 'enc_ice',
            attachedEntity: true
        }],


        257: [{ //endow wind on target
            type: 'STR',
            file: 'enc_wind',
            wav:  'effect/_enemy_hit_wind1',
            attachedEntity: true
        }],


        258: [{
            type: 'STR',
            file: 'enc_earth',
            attachedEntity: true
        }],

		//259:	Map Light Pillar Animation 3
		//260:	Map Light Pillar Animation 4

        261: [{ //fury / critical explosion TODO: combo sounds, super novice fury
            wav:  'effect/\x6d\x6f\x6e\x5f\xc6\xf8\xb1\xe2', //mon_Ćř±â
            attachedEntity: true
        }],

		//262:	Raging Quadruple Blow
		//263:	Raging Quadruple Blow 2
		//264:	(Nothing)
		//265:	Throw Spirit Sphere
		//266:	Raging Quadruple Blow 3
		//267:	Occult Impaction

        268: [{
            type: 'STR',
            file: 'steal_coin',
            wav:  'rog_steal coin',
            attachedEntity: true
        }],


        269: [{
            type: 'STR',
            file: 'strip_weapon',
            wav:  'effect/\x74\x5f\x6f\xae\x41\xa8\xb1\x65', //t_o®A¨±e
            attachedEntity: true
        }],


        270: [{
            type: 'STR',
            file: 'strip_shield',
            wav:  'effect/\x74\x5f\x6f\xae\x41\xa8\xb1\x65', //t_o®A¨±e
            attachedEntity: true
        }],


        271: [{
            type: 'STR',
            file: 'strip_armor',
            wav:  'effect/\x74\x5f\x6f\xae\x41\xa8\xb1\x65', //t_o®A¨±e
            attachedEntity: true
        }],


        272: [{
            type: 'STR',
            file: 'strip_helm',
            wav:  'effect/\x74\x5f\x6f\xae\x41\xa8\xb1\x65', //t_o®A¨±e
            attachedEntity: true
        }],

        273: [{
            type: 'STR',
            file: '\x3f\xac\x45\x97', //?¬E—
            attachedEntity: true
        }],
		
		//274:	Steal Coin Animation

        275: [{ //backstab on target hit
            wav:  'effect/rog_back stap',
            attachedEntity: true
        }],
		
		276: [{ //raging thurst
            attachedEntity: true
        }],

		'277_ground': [{ // Dissonance
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var DissonanceEffects = require('Renderer/Effects/Songs').DissonanceEffects;
                DissonanceEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		278: [{
            wav:  'effect/\xc0\xda\xc0\xe5\xb0\xa1', //ŔÚŔĺ°ˇ
            attachedEntity: true
        }],

		'278_ground': [{ // Lullaby
            type: 'FUNC',
			attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var LullabyEffects = require('Renderer/Effects/Songs').LullabyEffects;
                LullabyEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		279: [{
            wav:  'effect/\xb1\xe8\xbc\xad\xb9\xe6\xb5\xb7', //±čĽ­ąćµ·
            attachedEntity: true
        }],

		'279_ground': [{ // Mr Kim
            type: 'FUNC',
			attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var MrKimEffects = require('Renderer/Effects/Songs').MrKimEffects;
                MrKimEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		280: [{
            wav:  'effect/\xbf\xb5\xbf\xf8\xc0\xc7\x20\xc8\xa5\xb5\xb7', //żµżřŔÇ ČĄµ·
            attachedEntity: true
        }],

		'280_ground': [{ // Chaos
            type: 'FUNC',
			attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var EtChaosEffects = require('Renderer/Effects/Songs').EtChaosEffects;
                EtChaosEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		281: [{
            wav:  'effect/\xc0\xfc\xc0\xe5\xc0\xc7', //ŔüŔĺŔÇ
            attachedEntity: true
        }],

		'281_ground': [{ // Drum on battlefield
            type: 'FUNC',
			attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var DrumEffects = require('Renderer/Effects/Songs').DrumEffects;
                DrumEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		282: [{
            wav:  'effect/\xb4\xcf\xba\xa7\xb7\xee\xb0\xd5\xc0\xc7\x20\xb9\xdd\xc1\xf6', //´Ďş§·î°ŐŔÇ ąÝÁö
            attachedEntity: true
        }],

		'282_ground': [{ // Ring nibelun
            type: 'FUNC',
			attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var NibelungEffects = require('Renderer/Effects/Songs').NibelungEffects;
                NibelungEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		283: [{
            wav:  'effect/\xb7\xce\xc5\xb0', //·ÎĹ°
            attachedEntity: true
        }],

		'283_ground': [{ // Loki Veil
            type: 'FUNC',
			attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var LokiEffects = require('Renderer/Effects/Songs').LokiEffects;
                LokiEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		284: [{
            wav:  'effect/\xbd\xc9\xbf\xac\xbc\xd3\xc0\xb8\xb7\xce', //˝Éż¬ĽÓŔ¸·Î
            attachedEntity: true
        }],

		'284_ground': [{ // Into abyss
            type: 'FUNC',
			attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var AbyssEffects = require('Renderer/Effects/Songs').AbyssEffects();
                AbyssEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		285: [{
            wav:  'effect/\xba\xd2\xbb\xe7\xbd\xc5', //şŇ»ç˝Ĺ
            attachedEntity: true
        }],

		'285_ground': [{ // Invulnerable Sieg
            type: 'FUNC',
			attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var SiegfiedEffects = require('Renderer/Effects/Songs').SiegfiedEffects;
                SiegfiedEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		286: [{
            wav:  'effect/\xb4\xde\xba\xfb\xbc\xbc\xb7\xb9\xb3\xaa\xb5\xa5', //´ŢşűĽĽ·ąłŞµĄ
            attachedEntity: true
        }],

        '286_ground': [{ // A whistle
            type: 'FUNC',
			attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var WhistleEffects = require('Renderer/Effects/Songs').WhistleEffects;
                WhistleEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		287: [{
            wav:  'effect/\xbc\xae\xbe\xe7\xc0\xc7\x20\xbe\xee\xbd\xd8\xbd\xc5', //Ľ®ľçŔÇ ľî˝Ř˝Ĺ
            attachedEntity: true
        }],

        '287_ground': [{ // Assassin cross
            type: 'FUNC',
			attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var SinEffects = require('Renderer/Effects/Songs').SinEffects;
                SinEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		288: [{
            wav:  'effect/\xba\xea\xb6\xf3\xb1\xe2\xc0\xc7\x20\xbd\xc3', //şę¶ó±âŔÇ ˝Ă
            attachedEntity: true
        }],

        '288_ground': [{ // Bragi
            type: 'FUNC',
			attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var BragiEffects = require('Renderer/Effects/Songs').BragiEffects();
                BragiEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		289: [{
            wav:  'effect/\xc0\xcc\xb5\xd0\xc0\xc7\x20\xbb\xe7\xb0\xfa',
			//ISO-8859-1:	ÀÌµÐÀÇ »ç°ú
			//Windows 1250: ŔĚµĐŔÇ »ç°ú
			//EUC-KR: 		이둔의 사과
			//Hex: 			\xc0\xcc\xb5\xd0\xc0\xc7\x20\xbb\xe7\xb0\xfa
			//reference for finding encoding
            attachedEntity: true
        }],

        '289_ground': [{ // Apple
            type: 'FUNC',
			attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var AppleEffects = require('Renderer/Effects/Songs').AppleEffects;
                AppleEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

        '290_ground': [{ // Ugly
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var UglyEffects = require('Renderer/Effects/Songs').UglyEffects;
                UglyEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		291: [{
            wav:  'effect/\xc8\xef\xbe\xf3\xb0\xc5\xb8\xb2', //Čďľó°Ĺ¸˛
            attachedEntity: true
        }],

        '291_ground': [{ // Humming
            type: 'FUNC',
			attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var HummingEffects = require('Renderer/Effects/Songs').HummingEffects;
                HummingEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		292: [{
            wav:  'effect/\xb3\xaa\xb8\xa6\xc0\xd8\xc1\xf6\xb8\xbb\xbe\xc6\xbf\xe4', //łŞ¸¦ŔŘÁö¸»ľĆżä
            attachedEntity: true
        }],

        '292_ground': [{ // Dont forget
            type: 'FUNC',
			attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var ForgetEffects = require('Renderer/Effects/Songs').ForgetEffects;
                ForgetEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		293: [{
            wav:  'effect/\xc7\xe0\xbf\xee\xc0\xc7', //ÇŕżîŔÇ
			attachedEntity: true
        }],

        '293_ground': [{ // Fortune kiss /ladyluck
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var FortuneEffects = require('Renderer/Effects/Songs').FortuneEffects;
                FortuneEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		294: [{
			wav:  'effect/\xb4\xe7\xbd\xc5\xc0\xbb\x20\xc0\xa7\xc7\xd1\x20\xbc\xad\xba\xf1\xbd\xba', //´ç˝ĹŔ» Ŕ§ÇŃ Ľ­şń˝ş
            attachedEntity: true,
        }],

        '294_ground': [{ // Service
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var ServiceEffects = require('Renderer/Effects/Songs').ServiceEffects;
                ServiceEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		//295:	Frost Joke
		//296:	Scream
		//297:	Fire Works (Visual Effect)
		//298:	Acid Terror Animnation
		//299:	(Nothing)
		//300:	Chemical Protection
		//301:	Fire Works (Sound Effect)

        302: [{
            type: 'SPR',
            file: '\xb5\x59\xb8\xf3\x31\x6f\x41\xae\xb7\x31\x41\x49\x31\xc7', //µY¸ó1oA®·1AI1Ç
            attachedEntity: false
        }],

        304: [{ //teleportation animation
            wav: 'effect/ef_teleportation',
            attachedEntity: true
        }],

        305: [{ //potion success
            type: 'STR',
            file: 'p_success',
            wav: 'effect/p_success',
            attachedEntity: true
        }],


        306: [{ //potion failed
            type: 'STR',
            file: 'p_failed',
            wav: 'effect/p_failed',
            attachedEntity: true
        }],

		//307:	Forest Light 1
		//308:	Throw Stone
		//309:	First Aid
		//310:	Sprinkle Sand

        311: [{ //crazy uproar
            type: 'STR',
            file: 'loud',
            wav: 'effect/\xb0\xed\xbc\xba\xb9\xe6\xb0\xa1', //°íĽşąć°ˇ
            attachedEntity: true
        }],

		//312:	Heal Effect
		//313:	Heal Effect 2
		//314:	Old Map Exit effect (Unused)

        315: [{
            type: 'STR',
            file: 'safetywall',
            attachedEntity: false
        }],
		
		'315_ground': [{
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var Cylinder = require('Renderer/Effects/Cylinder');
                this.add(new Cylinder(pos, 0.7, 0.7, 20, 'magic_violet', tick), AID);
            }
        }],

        316: [{ //Warp Portal Animation 1
            //type: 'FUNC',
            wav: 'effect/ef_readyportal',
            attachedEntity: false
        }],

        317: [{ //Warp Portal Animation 2
            /*type: 'FUNC',
            attachedEntity: false,
			textureName: 'magic_blue',
            func: function(pos, tick, AID){
                var Cylinder = require('Renderer/Effects/Cylinder');
                this.add(new Cylinder(pos, 0.6, 0.6, 40, 'magic_blue', tick), AID);
            }*/
			type: 'CYLINDER',
            attachedEntity: false,
			wav: '',
			topSize: 0.6,
			bottomSize: 0.6,
			height: 40
        }],

        'deluge_ground': [{
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var PropertyGround = require('Renderer/Effects/PropertyGround');
                this.add(new PropertyGround(pos, 3.0, 1.0, 2, 'ring_blue', tick), AID);
            }
        }],
		
        'soulink_caster_effect': [{ // todo
            wav:  'effect/\x74\x5f\x6f\xae\x41\xa8\xb1\x65', //t_o®A¨±e
            attachedEntity: false
        }],

        'soulink_target_effect': [{ // todo
            wav:  'effect/\x74\x5f\xbf\xb5\xc8\xa5', //t_żµČĄ
            attachedEntity: true
        }],

        'gunslinger_coin': [{ // coin caster
            wav:  'effect/\xc7\xc3\xb8\xb3', //ÇĂ¸ł
            attachedEntity: true
        }],
        
        'coldbolt': [{ //coldbolt falling objects
            wav:  'effect/ef_icearrow%d',
            rand: [1, 3],
            attachedEntity: true
        }],
        
        'firebolt': [{ //fireolt falling objects
            wav:  'effect/ef_firearrow%d',
            rand: [1, 3],
            attachedEntity: true
        }],

        318: [{
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var WhiteTile = FlatColorTile('white', {r: 1, g: 1, b: 1, a: 0.8});
                this.add(new WhiteTile(pos, tick), AID);
                //this.add(new SquareGround(pos, 1.0, 1.0, 3.0, 'magic_green', tick), AID);
            }
        }],

        319: [{
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var WhiteTile = FlatColorTile('white', {r: 1, g: 1, b: 1, a: 0.8});
                this.add(new WhiteTile(pos, tick), AID);
                //this.add(new SquareGround(pos, 1.0, 1.0, 3.0, 'magic_green', tick), AID);
            }
        }],
		
		//320:	Offensive Heal
		//321:	Warp NPC
		//322:	Forest Light 2
		//323:	Forest Light 3
		//324:	Forest Light 4
		//325:	Heal Effect 4
		//326:	Chase Walk Left Foot
		//327:	Chse Walk Right Foot
		//328:	Monk Asura Strike
		//329:	Triple Strike
		//330:	Combo Finish
		//331:	Natural HP Regeneration
		//332:	Natural SP Regeneration
		//333:	Autumn Leaves
		//334:	Blind
		//335:	Poison

        336: [{ //kyrie eleison / parrying    (when target blocked dmg)
            wav:  'effect/kyrie_guard',
            attachedEntity: true
        }],

        337: [{
            type: 'STR',
            file: 'joblvup',
            attachedEntity: true
        }],

		//338:	Super Novice/Taekwon Level Up Angel
		//339:	Spiral Pierce
		//340:	(Nothing)
		//341:	Wedding Warp Portal
		//342:	Wedding Skill
		//343:	Another Merry Skill
		//344:	Character map entry effect
		//345:	Wings (Animated)
		//346:	Like Moonlight But Blue
		//347:	Wedding Ceremony
		//348:	Like 1000 Blade trepassing
		//349:	Waterfall (Horizonatal)
		//350:	Waterfall (Vertical)
		//351:	Small Waterfall (Horizonatal)
		//352:	Small Waterfall (Vertical)
		//353:	Dark Waterfall (Horizonatal)
		//354:	Dark Waterfall (Vertical)
		//355:	Dark Small Waterfall (Horizonatal)
		//356:	Dark Small Waterfall (Vertical)
		//357:	(Nothing)
		//358:	Niflheim Ghost
		//359:	Niflheim Bat Slow
		//360:	Niflheim Bat Fast
		//361:	Soul Destroyer
		//362:	Trancendant Level 99 Aura 1

        363: [{
            type: 'SPR',
            file: 'vallentine',
            attachedEntity: true
        }],       
        
		//364:	Valentine Day Heart
		//365:	Gloria Domini
		//366:	Martyr's Reckoning
		
        367: [{ //aura blade
            wav:  'effect/\xbf\xc0\xb6\xf3\x20\xba\xed\xb7\xb9\xc0\xcc\xb5\xe5', //żŔ¶ó şí·ąŔĚµĺ
            attachedEntity: true
            //+ on cast small white-magic aura (double)
        }],
        
        368: [{
            wav:  'effect/\xef\x82\xb9\xef\x83\xb6\xef\x82\xbc\xef\x82\xad\xc5\xa9',
            attachedEntity: true
            //shake screen
        }],

        369: [{
            type: 'STR',
            file: 'twohand',
            wav:  'effect/knight_twohandquicken',
            head: true,
            attachedEntity: true
        }],

		370: [{
            wav:  'effect/\xb0\xa1\xbd\xba\xc6\xe7', //°ˇ˝şĆç
			attachedEntity: true
        }],

		'370_ground': [{ // Gospel
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var GospelEffects = require('Renderer/Effects/Songs').GospelEffects;
                GospelEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],


        371: [{
            type: 'STR',
            file: 'angel',
            wav:  'levelup',
            attachedEntity: true
        }],


        372: [{
            type: 'STR',
            file: 'devil',
            attachedEntity: true
        }],


        373: [{
            type: 'SPR',
            file: 'poisonhit',
            attachedEntity: true
        }],

		//374:	Basilica
		//375:	Assumptio (Visual Effect)
		//376:	Palm Strike
		//377:	Matyr's Reckoning 2
		//378:	Soul Drain (1st Part)
		//379:	Soul Drain (2nd Part)
		//380:	Magic Crasher
		//381:	Blue Starburst (Unknown use)

        382: [{
            type: 'SPR',
            file: '\xc7\x4e\x6f\x31\x41\xb5\xbb\xe7', //ÇNo1Aµ»ç
            head: true,
            attachedEntity: true
        }],

		//383:	Health Conversion
		//384:	Soul Change (Sound Effect)
		//385:	Soul Change (Visual Effect)
		//386:	True Sight
		//387:	Falcon Assault
		//388:	Focused Arrow Strike (Sound Effect)

        389: [{ //windwalk
            wav:  'effect/\xc0\xa9\xb5\xe5\xbf\xf6\xc5\xa9', //Ŕ©µĺżöĹ©
            attachedEntity: true
        }],

        390: [{
            type: 'STR',
            file: 'melt',
            attachedEntity: true
        }],


        391: [{
            type: 'STR',
            file: 'cart',
            attachedEntity: true
        }],


        392: [{
            type: 'STR',
            file: 'sword',
            attachedEntity: true
        }],
		
		//393:	Arrow Vulcan
		
        394: [{ // Moonlit water mill/sheltering bliss
            type: 'FUNC',
			//wav:  'effect/´Ţşű',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var BlueTile = FlatColorTile('salmon', {r: 0xff/255, g: 0x8a/255, b: 0xbb/255, a: 0.6});
                this.add(new BlueTile(pos, tick), AID);
            }
        }],

		//395:	Marionette Control (Sound Effect)
		//396:	Marionette Control (Visual Effect)
		//397:	Trancended 99 Aura (Middle)
		//398:	Trancended 99 Aura (Bottom)

        399: [{ //headcrush caster
            wav:  'effect/\xc7\xec\xb5\xe5\x20\xc5\xa9\xb7\xaf\xbd\xac', //Çěµĺ Ĺ©·Ż˝¬
            //same effect on caster like 'Bash' but stripes are yellow + assumptio effect on caster
            attachedEntity: true
        }],
        
        400: [{ //joint beat caster
            //sound missing
            //same effect on caster like 'Bash' + assumptio effect on caster
            attachedEntity: true
        }],
        
        'charge_attack': [{ //charge attack (quest-skill)
            //same effect on target like 'Bash'
            attachedEntity: true
        }],
        
		//401:	Napalm Vulcan Sound
		//402:	Dangerous Soul Collect
		//403:	Mind Breaker
		
        404: [{
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var SpiderWeb = require('Renderer/Effects/SpiderWeb');
                this.add(new SpiderWeb(pos, tick), AID);
            }
        }],

		'405_ground': [{ //wall of fog
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var FogEffects = require('Renderer/Effects/Songs').FogEffects;
                FogEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],
        
        406: [{
            type: 'STR',
            file: '\x31\x4f\x3f\x69\x31\x6f', //1O?i1o
            attachedEntity: true
        }],


        407: [{
            type: 'STR',
            file: '\xbb\xe7\xb6\xf7\x45\x3f\xb0\xfa', //»ç¶÷E?°ú
            attachedEntity: true
        }],

		//408:	Mom, Dad, I love you! (Baby Skill)
		//409:	Meteor Assault
		//410:	Rainbow
		//411:	Leap
		//412:	Like Throw Spirit Sphere
		//413:	Axe Kick
		//414:	Round Kick
		//415:	Counter Kick
		//416:	(Nothing)
		//417:	Flash
		//418:	Warmth Lightning
		//419:	Kaite (Visual Effect)

        420: [{
            type: 'FUNC',
            attachedEntity: true,
            func: function EffectSmallTransition(entity) {
                var xSize = entity.xSize;
                var ySize = entity.ySize;

                entity.animations.add(function(tick){
                    entity.xSize = xSize + (2.5 - xSize) * (Math.min(tick, 300) / 300);
                    entity.ySize = ySize + (2.5 - ySize) * (Math.min(tick, 300) / 300);

                    return (tick > 300);
                });
            }
        }],


        421: [{
            type: 'FUNC',
            attachedEntity: true,
            func: function EffectSmall(entity) {
                entity.xSize = 2.5;
                entity.ySize = 2.5;
            }
        }],


        422: [{
            type: 'FUNC',
            attachedEntity: true,
            func: function EffectBigTransition(entity) {
                var xSize = entity.xSize;
                var ySize = entity.ySize;

                entity.animations.add(function(tick){
                    entity.xSize = xSize + (7.5 - xSize) * (Math.min(tick, 300) / 300);
                    entity.ySize = ySize + (7.5 - ySize) * (Math.min(tick, 300) / 300);

                    return (tick > 300);
                });
            }
        }],


        423: [{
            type: 'FUNC',
            attachedEntity: true,
            func: function EffectBig(entity) {
                entity.xSize = 7.5;
                entity.ySize = 7.5;
            }
        }],

		//424:	Spirit Link (Visual Effect)
		//425:	Esma Hit (Visual Effect)

        426: [{ //taekwon sprint collision effect
            wav:  'effect/\xba\xb9\xc8\xa3\xb0\xdd', //şąČŁ°Ý
            attachedEntity: true
        }],

		//427:	(Nothing)
		//428:	(Nothing)
		//429:	Taekwon Kick Hit 1
		//430:	Taekwon Kick Hit 2
		//431:	Taekwon Kick Hit 3
		//432:	Solar, Lunar and Stellar Perception (Visual Effect)
		//433:	Solar, Lunar and Stellar Opposition (Visual Effect)
		//434:	Taekwon Kick Hit 4
		//435:	Whirlwind Kick
		//436:	White Barrier (Unused)
		//437:	White barrier 2 (Unused)
		//438:	Kaite Reflect Animation
		//439:	Flying Side Kick

        440: [{
            type: 'STR',
            file: 'asum',
            wav:  'effect/\xbe\xc6\xbc\xfb\xc7\xc1\xc6\xbc\xbf\xc0', //ľĆĽűÇÁĆĽżŔ
            attachedEntity: true
        }],

		//441:	Comfort Skills Cast Aura
		//442:	Foot Prints caused by Sprint.
		//443:	(Nothing)
		//444:	Sprint Stop Animation

        445: [{ //high jump caster
            wav:  'effect/\x74\x5f\xc8\xb8\xc7\xc7\x32', //t_Č¸ÇÇ2
            attachedEntity: true
        }],

		//446:	High Jump (Return Down)
		//447:	Running Left Foot
		//448:	Running Right Foot
		//449:	KA-Spell (1st Part)

		450: [{ // Dark cross
            
        }],

		//451:	Dark Strike
		//452:	Something Like Jupitel Thunder
		//453:	Paralized
		//454:	Like Blind
		//455:	Another Warmth Lightning
		//456:	Power Up

        457: [{ //flying kick on target
            wav:  'effect/\x74\x5f\xb3\xaf\xb6\xf3\xc2\xf7\xb1\xe2', //t_łŻ¶óÂ÷±â
            attachedEntity: true
        }],

		//458:	Running/Sprint (running into a wall)
		//459:	Brown tornado that spins sprite (unused)
		//460:	Green tornado (unused)
		//461:	Blue tornado (unused)
		//462:	Kaupe Dodge Effect
		//463:	Kaupe Dodge Effect
		//464:	White tornado (unused)
		//465:	Purple tornado (unused)
		//466:	Another Round Kick
		//467:	Warm/Mild Wind (Earth)
		//468:	Warm/Mild Wind (Wind)
		//469:	Warm/Mild Wind (Water)
		//470:	Warm/Mild Wind (Fire)
		//471:	Warm/Mild Wind (Undead)
		//472:	Warm/Mild Wind (Shadow)
		//473:	Warm/Mild Wind (Holy)
		//474:	(Nothing)
		//475:	Demon of The Sun Moon And Stars (Level 1)
		//476:	Demon of The Sun Moon And Stars (Level 2)
		//477:	Demon of The Sun Moon And Stars (Level 3)
		//478:	Demon of The Sun Moon And Stars (Level 4)
		//479:	Demon of The Sun Moon And Stars (Level 5)
		//480:	Demon of The Sun Moon And Stars (Level 6)
		//481:	Demon of The Sun Moon And Stars (Level 7)
		//482:	Demon of The Sun Moon And Stars (Level 8)
		//483:	Demon of The Sun Moon And Stars (Level 9)
		//484:	Demon of The Sun Moon And Stars (Level 10)
		//485:	Mental Strength Lightning but White
		//486:	Mental Strength Lightning
		//487:	Demon of The Sun Moon And Stars Ground Effect
		//488:	Comfort Skills
		//489:	(Nothing)
		//490:	(Nothing)

        491: [{
            type: 'STR',
            file: '\xc2\xfd\x31\x4f\xb6\xb1', //Âý1O¶±
            attachedEntity: true
        }],


        492: [{
            type: 'STR',
            file: 'ramadan',
            attachedEntity: true
        }],
        
        493: [{ // edp
            wav:  'effect/assasin_cloaking',
            //blinking
            attachedEntity: true
        }],

		//494:	Throwing Tomahawk
		//495:	Full Strip Sound

        '496_beforecast': [{
            type: 'FUNC',
            attachedEntity: true,
            func: function(entity, tick) {
                var MagicRing = require('Renderer/Effects/MagicRing');
                this.add(new MagicRing(entity, 2.45, 0.8, 2.80, 'ring_jadu', tick+10000), entity.GID);
            }
        }],

		//497:	Twilight Alchemy 1
		//498:	Twilight Alchemy 2
		//499:	Twilight Alchemy 3
		//500:	Player Become Blue with Blue Aura
		//501:	Chase Walk Animation
		//502:	Player Become Yellow with Yellow Aura
		//503:	Soul Link Word
		//504:	(Nothing)
		//505:	Memorize
		//506:	(Nothing)

        507: [{ //Authoritative Badge
            type: 'STR',
            file: 'mapae',
            wav:  'effect/mapae',
            attachedEntity: true
        }],


        508: [{
            type: 'STR',
            file: 'itempokjuk',
            attachedEntity: true
        }],


        509: [{
            type: 'SPR',
            file: '05vallentine',
            attachedEntity: true
        }],

		//510:	Champion Asura Strike
		//511:	(Nothing)
		//512:	Chain Crush Combo
		//513:	Area Cast
		//514:	Really Big Circle
		//515:	Einbroch Fog
		//516:	Airship Cloud
		//517:	(Nothing)
		//518:	Cart Termination

        519: [{ //speed potion
            type: 'SPR',
            file: 'fast',
            wav:  'effect/fast',
            attachedEntity: true
        }],

		//520:	Shield Bumerang
		//521:	Player Become Red with Red Aura

		'522_ground': [{ // Gravitation field
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var self = this;
                var GravityEffects = require('Renderer/Effects/Songs').GravityEffects;
                GravityEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		//523:	Tarot Card of Fate (The Fool)
		//524:	Tarot Card of Fate (The Magician)
		//525:	Tarot Card of Fate (The High Priestess)
		//526:	Tarot Card of Fate (The Chariot)
		//527:	Tarot Card of Fate (Strength)
		//528:	Tarot Card of Fate (The Lovers)
		//529:	Tarot Card of Fate (The Wheel of Fortune)
		//530:	Tarot Card of Fate (The Hanged Man)
		//531:	Tarot Card of Fate (Death)
		//532:	Tarot Card of Fate (Temperance)
		//533:	Tarot Card of Fate (The Devil)
		//534:	Tarot Card of Fate (The Tower)
		//535:	Tarot Card of Fate (The Star)
		//536:	Tarot Card of Fate (The Sun)
		
		//537:	Acid Demonstration
		//538:	Player Become Green with Green Aura
		//539:	Throw Random Bottle
		//540:	Instant Small->Normal
		//541:	(Nothing)
		//542:	KA-Spell (1st Part)
		//543:	Kahii
		//544:	Warmth Red Sprite
		//545:	Sound And... PUFF Client Crash :P
		//546:	Kaupe
		//547:	Estin
		//548:	Instant Red Sprite
		//549:	Instant Blue Sprite
		//550:	Another Effect like Running Hit
		//551:	Effect Like Estun but with Circle
		//552:	(Nothing)
		//553:	Esma
		//554:	Large White Cloud
		//555:	Estun
		//556:	(Nothing)
		//557:	Juperos Energy Waterfall (Horizontal)
		//558:	Juperos Energy Waterfall (Vertical)
		//559:	Juperos Energy Waterfall Fast (Horizontal)
		//560:	Juperos Energy Waterfall Fast (Vertical)
		//561:	Juperos Warp
		//562:	Juperos Warp
		//563:	Earthquake Effect (Juperos Elevator)
		//564:	Wedding Cast
		
        565: [{
            type: 'STR',
            file: 'moonlight_1',
            attachedEntity: true
        }],


        566: [{
            type: 'STR',
            file: 'moonlight_2',
            attachedEntity: true
        }],


        567: [{
            type: 'STR',
            file: 'moonlight_3',
            attachedEntity: true
        }],


        568: [{ //homun?
            type: 'STR',
            file: 'h_levelup',
            attachedEntity: true
        }],


        569: [{
            type: 'STR',
            file: 'defense',
            attachedEntity: true
        }],


        570: [{
            type: 'SPR',
            file: '\xc4\x33\x31\x31\xb8\xb5', //Ä311¸µ
            attachedEntity: true
        }],


        571: [{
            type: 'SPR',
            file: '\x6f\xed\xb7\x97\xb5\x61\xb7\x97\x31\x6f\x41\xae', //oí·—µa·—1oA®
            attachedEntity: true
        }],

		//572:	Warmth Soul
		//573:	Twilight Alchemy 1
		//574:	Twilight Alchemy 2
		//575:	Twilight Alchemy 3

        576: [{
            type: 'SPR',
            file: 'item_thunder',
            attachedEntity: true
        }],


        577: [{
            type: 'SPR',
            file: 'item_cloud',
            attachedEntity: true
        }],


        578: [{
            type: 'SPR',
            file: 'item_curse',
            attachedEntity: true
        }],


        579: [{
            type: 'SPR',
            file: 'item_zzz',
            attachedEntity: true
        }],


        580: [{
            type: 'SPR',
            file: 'item_rain',
            attachedEntity: true
        }],

		//581:	Box Effect (Sunlight)
		//582:	Another Super Novice/Taekwon Angel

        583: [{
            type: 'SPR',
            file: 'm_ef01',
            attachedEntity: true
        }],


        584: [{
            type: 'SPR',
            file: 'm_ef02',
            attachedEntity: true,
            direction: true
        }],


        585: [{
            type: 'SPR',
            file: 'm_ef03',
            attachedEntity: true
        }],


        586: [{
            type: 'SPR',
            file: 'm_ef04',
            attachedEntity: true
        }],


        587: [{
            type: 'SPR',
            file: 'm_ef05',
            attachedEntity: true
        }],


        588: [{
            type: 'SPR',
            file: 'm_ef06',
            attachedEntity: true
        }],


        589: [{
            type: 'SPR',
            file: 'm_ef07',
            attachedEntity: true
        }],

		//590:	Running Stop
		//591:	(Nothing)
		//592:	Thanatos Tower Bloody Clouds

        593: [{
            type: 'STR',
            file: 'food_str',
            attachedEntity: true
        }],


        594: [{
            type: 'STR',
            file: 'food_int',
            attachedEntity: true
        }],


        595: [{
            type: 'STR',
            file: 'food_vit',
            attachedEntity: true
        }],


        596: [{
            type: 'STR',
            file: 'food_agi',
            attachedEntity: true
        }],


        597: [{
            type: 'STR',
            file: 'food_dex',
            attachedEntity: true
        }],


        598: [{
            type: 'STR',
            file: 'food_luk',
            attachedEntity: true
        }],

		//599:	Cast Time Sound and Flashing Animation on Player
		//600:	Throw Venom Knife
		//601:	Sight Blaster
		//602:	Close Confine (Grab Effect)

        603: [{
            type: 'STR',
            file: 'firehit%d',
            rand: [1, 3],
            attachedEntity: true
        }],


        604: [{
            type: 'SPR',
            file: 'cconfine',
            attachedEntity: true,
            stopAtEnd: true
        }],

		//605:	(Nothing)
		//606:	Pang Voice (Visual Effect)
		//607:	Wink of Charm (Visual Effect)

        608: [{
            type: 'STR',
            file: 'cook_suc',
            attachedEntity: true
        }],


        609: [{
            type: 'STR',
            file: 'cook_fail',
            attachedEntity: true
        }],

		//610:	Success
		//611:	Failed

        612: [{
            type: 'SPR',
            file: '\xc7\x4f\xb0\xdd\x5f', //ÇO°Ý_
            attachedEntity: true
        },{
            type: 'STR',
            file: 'itempokjuk',
            attachedEntity: true
        }],

		//613:	Throw Shuriken
		//614:	Throw Kunai
		//615:	Throw Fumma Shuriken
		//616:	Throw Money
		//617:	Illusionary Shadow
		//618:	Crimson Fire Bolossom
		//619:	Lightning Spear Of Ice
		//620:	Water Escape Technique
		//621:	Wind Blade
		//622:	Lightning Crash
		//623:	Piercing Shot
		//624:	Kamaitachi
		//625:	Madness Canceller
		//626:	Adjustment
		//627:	Disarm (Sound Effect)
		//628:	Dust
		//629:	(Nothing)

        630: [{
            type: 'SPR',
            file: '\xb1\xd7\xb8\x32\x41\xda\x6f\x4c\xb1\xe2', //±×¸2AÚoL±â
            attachedEntity: true
        }],


        631: [{ //reverse tatami map unit
            type: 'SPR',
            file: '\xb4\x55\xb4\x55\x31\x49', //´U´U1I
            wav: '\xb4\xd9\xb4\xd9\xb9\xcc\xb5\xda\xc1\xfd\xb1\xe2', //´Ů´ŮąĚµÚÁý±â
            attachedEntity: true
        }],


        632: [{
            type: 'SPR',
            file: '\x33\x45\xb0\x33\x6f\x4c\xb1\xe2', //3E°3oL±â
            attachedEntity: true
        }],


        633: [{
            type: 'SPR',
            file: '\x41\x49\x31\xb6', //AI1¶
            attachedEntity: true
        }],


        634: [{
            type: 'SPR',
            file: '\x45\xad\x3f\xb0\xc1\x6f', //E­?°Áo
            attachedEntity: false
        }],


        635: [{
            type: 'STR',
            file: 'fire dragon',
            attachedEntity: false
        }],


        636: [{
            type: 'STR',
            file: 'icy',
            attachedEntity: false
        }],


        637: [{
            type: 'SPR',
            file: '\xb5\x59\x31\x6f\x41\xe4\xb6\xf3\xb5\xb5', //µY1oAä¶óµµ
            attachedEntity: true
        }],


        638: [{
            type: 'SPR',
            file: '\xb6\xf3\x41\x49\x41\xae\xb4\xd7\x31\x6f\xc7\xc7\x33\xee', //¶óAIA®´×1oÇÇ3î
            attachedEntity: false
        }],


        639: [{
            type: 'SPR',
            file: '\x6f\xed\xb6\xf3\x41\xce\xb5\x61\x31\x6f\xc7\xc7\x33\xee', //oí¶óAÎµa1oÇÇ3î
            attachedEntity: false
        }],


        640: [{
            type: 'SPR',
            file: '\x41\xf7\x41\x49\xc1\x3f\x31\x6f\xc7\xc7\x33\xee', //A÷AIÁ?1oÇÇ3î
            attachedEntity: false
        }],


        641: [{
            type: 'SPR',
            file: '\xc7\xc1\xb8\xae\xc2\x21\x31\x6f\xc7\xc7\x33\xee', //ÇÁ¸®Â!1oÇÇ3î
            attachedEntity: false
        }],


        642: [{
            type: 'SPR',
            file: '\xc7\x41\xb7\x31\x33\xee\x31\x6f\xc7\xc7\x33\xee', //ÇA·13î1oÇÇ3î
            attachedEntity: false
        }],


        643: [{
            type: 'SPR',
            file: '\xb7\x21\xc7\xc7\xb5\x61\xbb\x3f\x3f\xf6', //·!ÇÇµa»??ö
            attachedEntity: true
        }],


        644: [{
            type: 'SPR',
            file: '\xb8\x41\xc1\xf6\xc4\x41\x6f\x4f\xb8\xb4', //¸AÁöÄAoO¸´
            attachedEntity: true
        }],


        645: [{
            type: 'SPR',
            file: '\x31\x6f\xc7\xc1\xb7\x31\xb5\x61', //1oÇÁ·1µa
            attachedEntity: true,
            direction: true,
        }],


        646: [{
            type: 'STR',
            file: '\x41\xae\xb7\x63\x41\xb7', //A®·cA·
            attachedEntity: true
        }],


        647: [{
            type: 'SPR',
            file: '\x41\xae\xb7\x21\x41\xb7', //A®·!A·
            attachedEntity: true
        }],


        648: [{
            type: 'SPR',
            file: '\x41\xae\xb8\xae\xc7\x41\x33\xd7\x31\xc7', //A®¸®ÇA3×1Ç
            attachedEntity: true
        }],


        649: [{
            type: 'STR',
            file: '\x6f\x4f\x31\x6f\x33\x41\x41\x49', //oO1o3AAI
            attachedEntity: true
        }],

		//650:	Ice Cave Level 4 Circle
		//651:	Ice Cave Level 4 Big Circle
		//652:	Like Regeneration Number but Red with a Sound
		//653:	Like Regeneration Number but Red
		//654:	Like Regeneration Number but Purple
		//655:	Mobs Skill (Change Undead Element)
		//656:	Last animation before Change Undead Element finish
		//657:	(Nothing)
		//658:	(Nothing)
		//659:	(Nothing)
		//660:	(Nothing)
		//661:	(Nothing)
		//662:	(Nothing)
		//663:	(Nothing)
		//664:	(Nothing)
		//665:	Little Blue Ball Falling From the Sky

        666: [{  //Earthquake
            type: 'SPR',
            file: '\x33\xee\x31\x6f\xc4\x75\x41\x49\x41\xa9', //3î1oÄuAIA©
            attachedEntity: true
        }],

		//667:	(Nothing)

        668: [{
            type: 'STR',
            file: 'dragon_h',
            attachedEntity: true
        }],


        669: [{ //wide bleeding
            type: 'STR',
            file: 'wideb',
            wav: 'wideb',
            attachedEntity: true
        }],


        670: [{
            type: 'STR',
            file: 'dfear',
            attachedEntity: true
        }],

		//671:	The Japan Earth Symbol (like 'Seven Wind Lv1', but on the ground)
		//672:	The Japan Wind Symbol (like 'Seven Wind Lv2', but on the ground)
		//673:	Map turns Blue (like Soul Link)

		'674_ground': [{ // evil land
            type: 'FUNC',
            attachedEntity: false,
			//file: 'status-curse',
            func: function(pos, tick, AID){
				var self = this;
                var EvillandEffects = require('Renderer/Effects/Songs').EvillandEffects;
                EvillandEffects.forEach(function(effect){
                    self.add(new effect(pos, tick), AID);
                });
            }
        }],

		//675:	Like Parrying/Kyrie Eleison barrier but Yellow with small Cross in every barrier piece

        677: [{
            type: 'STR',
            file: 'cwound',
            attachedEntity: true
        }],
		
		//678:	White 99 Aura Bubbles
		//679:	Green Aura (Middle)
		//680:	Green Aura (Bottom)
		//681:	Dimensional Gorge Map Effect
		//682:	I Love You Banner
		//683:	Happy White Day Banner
		//684:	Happy Valentine Day Banner
		//685:	Happy Birthday Banner
		//686:	Merry Christmas Banner
		//687:	Cast Circle-Like effect 1
		//688:	Cast Circle-Like effect 2
		//689:	Endless Tower Map Effect
		//690:	Burning Flame (Red)
		//691:	Burning Flame (Green)
		//692:	Unknown Aura Bubbles (Small ghosts)
		//693:	Translucent yellow circle
		//694:	Translucent green circle
		//695:	Rotating green light
		//696:	The same of 690 and 691 but Blue/Purple
		//697:	(Nothing)
		//698:	(Nothing)

        699: [{
            type: 'STR',
            file: 'flower_leaf',
            attachedEntity: true
        }],

		//700:	Big Colored Green Sphere.
		//701:	Huge Blue Sphere
		//702:	Little Colored Violet Sphere
		//703:	Light Infiltration with fall of pownder

        704: [{
            type: 'STR',
            file: 'mobile_ef02',
            attachedEntity: true
        }],


        705: [{
            type: 'STR',
            file: 'mobile_ef01',
            attachedEntity: true
        }],


        706: [{
            type: 'STR',
            file: 'mobile_ef03',
            attachedEntity: true
        }],

		//707:	Client Crash :P

        708: [{
            type: 'STR',
            file: 'storm_min',
            attachedEntity: false
        }],


        709: [{
            type: 'STR',
            file: 'pokjuk_jap',
            attachedEntity: false
        }],

		//710:	A Sphere like Effect 701 but Green, and a bit more larger
		//711:	A big violet wall
		//712:	A Little Flame Sphere
		//713:	A lot of Very Small and Yellow Sphere
		//714:	(Nothing)
		//715:	Little blue Basilica
		//716:	Same as 715

        717: [{
            type: 'STR',
            file: 'angelus',
            wav:  'effect/ef_angelus',
            min:  'jong_mini',
            attachedEntity: true
        }],

		//718:	Judex (Visual Effect)
		//719:	Renovatio (light beam)
		//720:	Yellow version of Soul Breaker

        721: [{
            type: 'STR',
            file: 'ado',
            attachedEntity: true
        }],


        722: [{
            type: 'STR',
            file: '\x41\x49\xb1\xd7\xb4\x49\x31\xc7\x6f\x65\xb7\x31\x41\x49\x41\xa9', //AI±×´I1Çoe·1AIA©
            attachedEntity: true
        }],

		//723:	Hundred Spear (sound effect)
		//724:	Green version of Detecting
		//725:	Oratorio (like Detecting)
		//726:	Frost Misty (blue vapor and bubbles)

        727: [{
            type: 'STR',
            file: 'crimson_r',
            attachedEntity: true
        }],


        728: [{
            type: 'STR',
            file: 'hell_in',
            attachedEntity: true
        }],

		//729:	Marsh of Abyss (like Close Confine)
		//730:	Small, cartoony explosion (part of Soul Expansion)

        731: [{
            type: 'STR',
            file: 'dragon_h',
            attachedEntity: true
        }],

		//732:	Spike from the ground
		//733:	Fluffy Ball flying by

        734: [{
            type: 'STR',
            file: 'chainlight',
            attachedEntity: true
        }],

		//735:	(Nothing)
		//736:	(Nothing)
		//737:	(Nothing)
		//738:	(Nothing)
		//739:	Old Magenta Trap
		//740:	Old Cobald Trap
		//741:	Old Maize Trap
		//742:	Old Verdure Trap
		//743:	White Ranger Trap
		//744:	Camouflage

        745: [{
            type: 'STR',
            file: 'aimed',
            attachedEntity: true
        }],


        746: [{
            type: 'STR',
            file: 'arrowstorm',
            attachedEntity: true
        }],


        747: [{
            type: 'STR',
            file: 'laulamus',
            attachedEntity: true
        }],


        748: [{
            type: 'STR',
            file: 'lauagnus',
            attachedEntity: true
        }],


        749: [{
            type: 'STR',
            file: 'mil_shield',
            attachedEntity: true
        }],


        750: [{
            type: 'STR',
            file: 'concentration',
            attachedEntity: true
        }],

		//751:	Releasing summoned warlock spheres
		//752:	Like Energy Coat, but not as dark
		//753:	Clearance
		//754:	Green warp portal (root of Epiclesis)
		//755:	Oratio (spinning blue symbol)

        756: [{
            type: 'STR',
            file: '\x31\xf6\x31\xad\x41\xa9', //1ö1­A©
            attachedEntity: true
        }],
		
		//757:	Third Class Aura (Middle)
		//758:	Rolling Cutter - Spin Count 1
		//759:	Rolling Cutter - Spin Count 2
		//760:	Rolling Cutter - Spin Count 3
		//761:	Rolling Cutter - Spin Count 4
		//762:	Rolling Cutter - Spin Count 5
		//763:	Rolling Cutter - Spin Count 6
		//764:	Rolling Cutter - Spin Count 7
		//765:	Rolling Cutter - Spin Count 8
		//766:	Rolling Cutter - Spin Count 9
		//767:	Rolling Cutter - Spin Count 10
		//768:	Blinking
		//769:	Cross Ripper Slasher (flying knives)
		//770:	Strip sound
		//771:	Poison sound
		//772:	Poison particles
		//773:	Expanding purple aura (part of Phantom Menace)
		//774:	Axe Boomerang
		//775:	Spinning character sprite
		//776:	Like Desperado sound effect
		//777:	Faded light from the ground [S]
		//778:	Expanding white aura (like Clearance)
		//779:	Faded light from the ground [S]
		//780:	Expanding red aura (from Infrared Scan)
		//781:	Magnetic Field (purple chains)
		//782:	All-around shield [S]
		//783:	Yellow shaft of light
		//784:	White shaft of light
		//785:	Upward flying wrenches
		//786:	Symbol with bleeping sound [S]
		//787:	Flare Launcher (line of fire)
		//788:	Venom Impress (green skull)
		//789:	Freezing Status Effect (two ancillas)
		//790:	Burning Status Effect (flame symbol)
		//791:	Two ice shots
		//792:	Upward streaming white particles
		//793:	Same, but more brief
		//794:	Infrared Scan (red lasers)

        795: [{
            type: 'STR',
            file: 'powerswing',
            attachedEntity: true
        }],

		//796:	Spinning blue triangles
		//797:	Stapo
		//798:	Red triangles (like Intimidate)
		//799:	Stasis (expanding blue mist) [S]
		//800:	Hell Inferno (red lights)
		//801:	Jack Frost unit (ice spikes)
		//802:	White Imprison
		//803:	Recognized Spell
		//804:	Tetra Vortex [S]
		//805:	Tetra Vortex cast animation (blinking colors)
		//806:	Flying by as fast as a rocket
		//807:	Kidnapping sound
		//808:	Like Recognized Spell, but one symbol
		//809:	Shadowy filter [S]
		//810:	Damp thud sound [S]
		//811:	Body Painting
		//812:	Black expanding aura

        813: [{
            type: 'STR',
            file: 'enervation',
            attachedEntity: true
        }],


        814: [{
            type: 'STR',
            file: 'groomy',
            attachedEntity: true
        }],


        815: [{
            type: 'STR',
            file: 'ignorance',
            attachedEntity: true
        }],


        816: [{
            type: 'STR',
            file: 'laziness',
            attachedEntity: true
        }],


        817: [{
            type: 'STR',
            file: 'unlucky',
            attachedEntity: true
        }],


        818: [{
            type: 'STR',
            file: 'weakness',
            attachedEntity: true
        }],
		
		//819:	(Nothing)
		//820:	Strip Accessory
		//821:	Waterfall
		//822:	Dimension Door (spinning blue aura)
		//823:	in-the-manhole effect
		//824:	Some filter
		//825:	Dimension Door (aura + blue light)
		//826:	Expanding black casting anim:
		//827:	Chaos Panic (spinning brown aura)
		//828:	Maelstrom (spinning pink aura)
		//829:	Bloody Lust (spinning red aura)
		//830:	Blue aura (Arch Bishop cast animation)
		//831:	Blue cone [S]
		//832:	Sonic Wave
		//833:	(Nothing)
		//834:	Light shooting away circlish
		//835:	Fastness yellow-reddish
		//836:	Fastness yellow-pinkish
		//837:	Casting [S]
		//838:	Watery aura
		//839:	[Client Error]
		//840:	Red cone
		//841:	Green cone
		//842:	Yellow cone
		//843:	White cone
		//844:	Purple cone
		//845:	light-bluish turquoise cone
		//846:	(Nothing)
		//847:	Gloomy Day (white/red light rays)
		//848:	Gloomy Day (white/blue light rays)
		//849:	(Nothing)
		//850:	(Nothing)
		//851:	Green mushy-foggy stuff (dull)
		//852:	Green mushy-foggy stuff (bright)
		//853:	Bright green flower area
		//854:	Blue beam of light with notes
		//855:	(Nothing)
		//856:	Reverberation (red eighth notes)
		//857:	Severe Rainstorm (falling red and blue beams)
		//858:	Deep Sleep Lullaby (two red beams and music notes)
		//859:	Holograph of text (blue)
		//860:	Distorted note (blue)
		//861:	Green aura (from Circle of Life's Melody)
		//862:	Randomize Spell (holograph of text)
		//863:	Dominion Impulse (two spears of light)
		//864:	Gloomy Day (colorful lines)
		//865:	Blue aura (from Song of Mana)
		//866:	Dance with a Warg (Wargs)
		//867:	Yellow aura (from Dance with a Warg)
		//868:	Song of Mana (Violies)
		//869:	Strip sound [S]
		//870:	Ghostly Succubuses of fire
		//871:	Red aura (from Lerad's Dew)
		//872:	Lerad's Dew (Minerals)
		//873:	Stargate-wormhole stuff (bright purple)
		//874:	Melody of Sink (Ktullanuxes)
		//875:	Stargate-wormhole stuff (bright turquoise)
		//876:	Warcry of Beyond (Garms)
		//877:	Stargate-wormhole stuff (white)
		//878:	Unlimited Humming Voice (Miyabi Ningyos)
		//879:	Siren's Voice (heart-like)
		//880:	Bluish castish cone
		//881:	Blue aura
		//882:	Whirl of fireflies (red)
		//883:	Epiclesis (transparent green tree)
		//884:	Green beam
		//885:	Blue light beams
		//886:	Blue castish cone
		//887:	Wavy sparks
		//888:	Earth Shaker (same as 432)
		//889:	Fast light beams
		//890:	Rotation
		//891:	Magic shots [S]
		//892:	Fastness with hitting sound[S]
		//893:	Blue-white light passing by
		//894:	(Nothing)
		//895:	Big wheel of flat light beams
		//896:	Still sun shaped lightning aura
		//897:	Animated sun shaped lightning aura
		//898:	Animated, curvy sun shaped lightning aura
		//899:	White/red light shots from below
		//900:	Animated, slow curvy sun shaped lightning aura
		//901:	Explosion
		//902:	Floating bedtable texture
		//903:	Castish flamey cone
		//904:	Yellow/pink lights passing by
		//905:	Expanding circle
		//906:	Shield Press (falling shield)
		//907:	Chainy, metalish sound [S]
		//908:	Prestige (sphere of yellow particles)
		//909:	Banding (sphere of red particles)
		//910:	Inspiration (sphere of blue particles)
		//911:	Green castish animation [S]
		//912:	Wall of Thorns unit (green fog cloud)
		//913:	Magic projectiles
		//914:	(Nothing)
		//915:	Crazy Weed
		//916:	Demonic Fire
		//917:	More angry, demonic flames
		//918:	Fire Insignia (demonic flames)
		//919:	Hell's Plant (green snapping plant)

        920: [{
            type: 'STR',
            file: 'firewall_per',
            attachedEntity: true
        }],

		//921:	Vacuum Extreme (whirlwind)
		//922:	Psychic Wave
		//923:	Poison Buster
		//924:	Poisoning animation
		//925:	Some filter

        926: [{
            type: 'STR',
            file: 'hunter_shockwave_blue',
            attachedEntity: true
        }],

		//927:	Earth Grave (speary roots)
		//928:	Ice cloud projectiles
		//929:	Warmer (field of flames)
		//930:	Varetyr Spear (falling spear)
		//931:	(Nothing)
		//932:	Firefly
		//933:	[Client Crash]
		//934:	White, castishly expanding cone
		//935:	Green magic projectile
		//936:	Red, castishly expanding cone
		//937:	Yellow, castishly expanding cone
		//938:	Dark-red, castishly expanding cone
		//939:	Blue, conish aura
		//940:	Snow flake
		//941:	Explosion of red, demonic fire
		//942:	Expanding, white dome
		//943:	Green, fluffy projectile
		//944:	Falling gems
		//945:	(Nothing)
		//946:	Floating lights
		//947:	Blue lightning sphere
		//948:	Two blue lightning spheres
		//949:	Flat, spinning diamond
		//950:	Circling, planetlike spheres
		//951:	Three lightning spheres
		//952:	Flat, spinning gem and two lightning spheres
		//953:	Spinning, planetlike spheres
		//954:	Two lightblue glowing spheres
		//955:	Three spinning flame spheres
		//956:	Flame
		//957:	Spinning planetlike sphere
		//958:	Two flames

        959: [{
            type: 'STR',
            file: 'poison_mist',
            attachedEntity: true
        }],


        960: [{
            type: 'STR',
            file: 'eraser_cutter',
            attachedEntity: true
        }],

		//961:	Cartoony whirlwind
		//962:	Rising fire
		//963:	Dark filter (like Stone Curse)

        964: [{
            type: 'STR',
            file: 'lava_slide',
            attachedEntity: true
        }],


        965: [{
            type: 'STR',
            file: 'sonic_claw',
            attachedEntity: true
        }],


        966: [{
            type: 'STR',
            file: 'tinder',
            attachedEntity: true
        }],


        967: [{
            type: 'STR',
            file: 'mid_frenzy',
            attachedEntity: true
        }],


        975: [{
            type: 'STR',
            file: 'vash00',
            attachedEntity: true
        }],


        987: [{
            type: 'STR',
            file: 'rwc2011',
            attachedEntity: true
        }],


        988: [{
            type: 'STR',
            file: 'rwc2011_2',
            attachedEntity: true
        }],


        1015: [{
            type: 'STR',
            file: 'rune_success',
            attachedEntity: true
        }],


        1016: [{
            type: 'STR',
            file: 'rune_fail',
            attachedEntity: true
        }],


        1017: [{
            type: 'STR',
            file: 'changematerial_su',
            attachedEntity: true
        }],


        1018: [{
            type: 'STR',
            file: 'changematerial_fa',
            attachedEntity: true
        }],


        1019: [{
            type: 'STR',
            file: 'guardian',
            attachedEntity: true
        }],


        1020: [{
            type: 'STR',
            file: 'bubble%d_1',
            rand: [1, 4],
            attachedEntity: true
        }],


        1021: [{
            type: 'STR',
            file: 'dust',
            attachedEntity: true
        }],


        1029: [{
            type: 'STR',
            file: 'dancingblade',
            attachedEntity: true
        }],


        1031: [{
            type: 'STR',
            file: 'invincibleoff2',
            attachedEntity: true
        }],


        1033: [{
            type: 'STR',
            file: 'devil',
            attachedEntity: true
        }],


        1040: [{
            type: 'STR',
            file: 'gc_darkcrow',
            attachedEntity: true
        }],


        1042: [{
            type: 'STR',
            file: 'all_full_throttle',
            attachedEntity: true
        }],


        1043: [{
            type: 'STR',
            file: 'sr_flashcombo',
            attachedEntity: true
        }],


        1044: [{
            type: 'STR',
            file: 'rk_luxanima',
            attachedEntity: true
        }],


        1046: [{
            type: 'STR',
            file: 'so_elemental_shield',
            attachedEntity: true
        }],


        1047: [{
            type: 'STR',
            file: 'ab_offertorium',
            attachedEntity: true
        }],


        1048: [{
            type: 'STR',
            file: 'wl_telekinesis_intense',
            attachedEntity: true
        }],


        1049: [{
            type: 'STR',
            file: 'gn_illusiondoping',
            attachedEntity: true
        }],


        1050: [{
            type: 'STR',
            file: 'nc_magma_eruption',
            attachedEntity: true
        }],


        1055: [{
            type: 'STR',
            file: 'chill',
            attachedEntity: true
        }],


        1057: [{
            type: 'STR',
            file: 'ab_offertorium_ring',
            attachedEntity: true
        }],


        1062: [{
            type: 'STR',
            file: 'stormgust',
            attachedEntity: true
        }],
        
        
        1111: [{
            type: 'FUNC',
            attachedEntity: true,
            func: function EffectBodyColor(entity) {
                entity._virtueColor[0] = 1.0;
                entity._virtueColor[1] = 0.0;
                entity._virtueColor[2] = 0.0;
                entity._virtueColor[3] = 0.0;
                entity.recalculateBlendingColor();

                entity.animations.add(function(tick){
                    entity._virtueColor[3] = 0.0 + tick/100;
                    entity.recalculateBlendingColor();
                    if(tick > 300) {
                        entity._virtueColor[0] = 1.0;
                        entity._virtueColor[1] = 1.0;
                        entity._virtueColor[2] = 1.0;
                        entity._virtueColor[3] = 1.0;
                        entity.recalculateBlendingColor();
                        return true;
                    }
                });
            }
        }],
        
        2222: [{
            type: 'FUNC',
            attachedEntity: true,
            func: function EffectBodyColor(entity) {
                entity._virtueColor[0] = 1.0;
                entity._virtueColor[1] = 1.0;
                entity._virtueColor[2] = 1.0;
                entity._virtueColor[3] = 1.0;
                entity.recalculateBlendingColor();
                var up = true;

                entity.animations.add(function(tick, up){
                    if(up) {
                        entity._virtueColor[0] = 0.0 + tick/100;
                        entity._virtueColor[3] = 0.0 + tick/100;
                        if(entity._virtueColor[0] == 1.0)
                            up = false;
                    }
                    else {
                        entity._virtueColor[0] = 1.0 - tick/100;
                        entity._virtueColor[3] = 1.0 - tick/100;
                        if(entity._virtueColor[0] == 0.0)
                            up = true;
                    }
                    entity.recalculateBlendingColor();
                    /**if(dummy%5 == 0) {
                        entity._virtueColor[0] = 1.0;
                        entity._virtueColor[1] = 1.0;
                        entity._virtueColor[2] = 1.0;
                        entity._virtueColor[3] = 1.0;
                        entity.recalculateBlendingColor();
                        if(dummy == 1000)
                            return true;
                    }*/
                });
            }
        }],
        
        'maximize_power_sounds': [{
            type: 'FUNC',
            attachedEntity: true,
            func: function MaximizePowerSounds(entity) {
                var Eventss = require('Core/Events');
                var Soundd = require('Audio/SoundManager');
                Eventss.setTimeout(function(){ Soundd.play('effect/black_maximize_power_circle.wav'); }, 1 );
                Eventss.setTimeout(function(){ Soundd.play('effect/black_maximize_power_sword.wav'); }, 550 );
                Eventss.setTimeout(function(){ Soundd.play('effect/black_maximize_power_sword.wav'); }, 700 );
                Eventss.setTimeout(function(){ Soundd.play('effect/black_maximize_power_sword_bic.wav'); }, 950 );

            }
        }],
        
        
        'spiral_pierce_color': [{
            type: 'FUNC',
            attachedEntity: true,
            func: function EffectBodyColor(entity) {
                entity._virtueColor[0] = 1.0;
                entity._virtueColor[1] = 1.0;
                entity._virtueColor[2] = 1.0;
                entity._virtueColor[3] = 1.0;
                entity.recalculateBlendingColor();

                entity.animations.add(function(tick){
                
                    if (!entity.cast.display) {     //we don't know cast time here so.. let's hack
                        entity._virtueColor[0] = 1.0;
                        entity._virtueColor[1] = 1.0;
                        entity._virtueColor[2] = 1.0;
                        entity._virtueColor[3] = 1.0;
                        entity.recalculateBlendingColor();
                        return true;
                    }
                        entity._virtueColor[1] = 0.0 + Math.sin(tick / (6 * Math.PI));
                        entity._virtueColor[2] = 0.0 + Math.sin(tick / (6 * Math.PI));
                        entity.recalculateBlendingColor();
                });
            }
        }],        
        
        
        'magic_ring_red': [{
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var Cylinder = require('Renderer/Effects/Cylinder');
                this.add(new Cylinder(pos, 2.45, 0.8, 2.80, 'ring_red', tick), AID);
            }
        }],
        
        'magic_ring_blue': [{
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var Cylinder = require('Renderer/Effects/Cylinder');
                this.add(new Cylinder(pos, 2.45, 0.8, 2.80, 'ring_blue', tick), AID);
            }
        }],
        
        'magic_ring_yellow': [{
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var Cylinder = require('Renderer/Effects/Cylinder');
                this.add(new Cylinder(pos, 2.45, 0.8, 2.80, 'ring_yellow', tick), AID);
            }
        }],
        
        'white_pulse': [{
            //type: 'FUNC',
            attachedEntity: true
        }],
        
        'yellow_pulse': [{
            //type: 'FUNC',
            attachedEntity: true
        }],
        
        'black_pulse': [{
            //type: 'FUNC',
            attachedEntity: true
        }],
        
        'spear_hit_sound': [{
            wav: '_hit_spear',
            attachedEntity: true
        }],
        
         'enemy_hit_normal1': [{
            wav: '_enemy_hit_normal1',
            attachedEntity: true
        }],
        
        'ef_hit2_sound': [{
            wav: 'effect/ef_hit2',
            attachedEntity: true
        }],      
        
    };
});
