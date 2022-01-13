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
        //117: waterball  (caster or hit?)
        119: [{
            wav:  'effect/hunter_detecting',
            attachedEntity: true
        }],

        //121: // sonic blow caster

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


        158: [{
            type: 'STR',
            file: 'joblvup',
            attachedEntity: true
        }],

        165: [{ //Comodo Fireworks Ball
            wav:  'effect/\xc6\xf8\xc1\xd7', //ĆřÁ×
            attachedEntity: false
        }],

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


        197: [{
            type: 'STR',
            file: 'sleep',
            attachedEntity: true
        }],


        199: [{
            type: 'STR',
            file: 'pong%d',
            rand: [1, 3],
            attachedEntity: false
        }],


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

        227: [{ //Intimidate / Snatch
            wav:  'effect/rog_intimidate',
            attachedEntity: true
        }],

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

        242: [{
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var LPEffect = require('Renderer/Effects/LPEffect');
                this.add(new LPEffect(pos, tick), AID);
            }
        }],

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


        251: [{
            type: 'STR',
            file: 'devotion',
            attachedEntity: true
        }],


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

        261: [{ //fury / critical explosion TODO: combo sounds, super novice fury
            wav:  'effect/\x6d\x6f\x6e\x5f\xc6\xf8\xb1\xe2', //mon_Ćř±â
            attachedEntity: true
        }],

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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var PinkTile = FlatColorTile('white', {r: 0xff/255, g: 0xff/255, b: 0xff/255, a: 0.6});
                this.add(new PinkTile(pos, tick), AID);
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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var PinkTile = FlatColorTile('pink', {r: 0xed/255, g: 0x9e/255, b: 0xff/255, a: 0.6});
                this.add(new PinkTile(pos, tick), AID);
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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var PinkTile = FlatColorTile('gold', {r: 0xfc/255, g: 0xc7/255, b: 0xc7/255, a: 0.6});
                this.add(new PinkTile(pos, tick), AID);
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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var PinkTile = FlatColorTile('lime', {r: 0x80/255, g: 0xff/255, b: 0xc2/255, a: 0.6});
                this.add(new PinkTile(pos, tick), AID);
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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var PinkTile = FlatColorTile('purple', {r: 0xed/255, g: 0x65/255, b: 0xfc/255, a: 0.6});
                this.add(new PinkTile(pos, tick), AID);
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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var PinkTile = FlatColorTile('cyan', {r: 0x1c/255, g: 0xec/255, b: 0xff/255, a: 0.6});
                this.add(new PinkTile(pos, tick), AID);
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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var PinkTile = FlatColorTile('purple', {r: 0xdc/255, g: 0x65/255, b: 0xfc/255, a: 0.6});
                this.add(new PinkTile(pos, tick), AID);
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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var PinkTile = FlatColorTile('white', {r: 0xff/255, g: 0xff/255, b: 0xff/255, a: 0.6});
                this.add(new PinkTile(pos, tick), AID);
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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var PinkTile = FlatColorTile('blue', {r: 0x48/255, g: 0x3b/255, b: 0xff/255, a: 0.6});
                this.add(new PinkTile(pos, tick), AID);
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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var PinkTile = FlatColorTile('pink', {r: 0xff/255, g: 0xc0/255, b: 0xcb/255, a: 0.6});
                this.add(new PinkTile(pos, tick), AID);
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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var PinkTile = FlatColorTile('pink', {r: 0xff/255, g: 0xc0/255, b: 0xcb/255, a: 0.6});
                this.add(new PinkTile(pos, tick), AID);
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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var BlueTile = FlatColorTile('blue', {r: 0, g: 0xbf/255, b: 0xff/255, a: 0.6});
                this.add(new BlueTile(pos, tick), AID);
            }
        }],

		289: [{
            wav:  'effect/\xc0\xcc\xb5\xd0\xc0\xc7\x20\xbb\xe7\xb0\xfa', //Windows 1250: ŔĚµĐŔÇ »ç°ú		EUC-KR: 이둔의 사과		Hex: \xc0\xcc\xb5\xd0\xc0\xc7\x20\xbb\xe7\xb0\xfa		USE THIS AS REFERENCE FOR ENCODING
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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var BlueTile = FlatColorTile('white', {r: 0xff/255, g: 0xff/255, b: 0xff/255, a: 0.6});
                this.add(new BlueTile(pos, tick), AID);
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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var BlueTile = FlatColorTile('gray', {r: 0xe6/255, g: 0xd1/255, b: 0xd1/255, a: 0.6});
                this.add(new BlueTile(pos, tick), AID);
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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var BlueTile = FlatColorTile('blue', {r: 0x1c/255, g: 0xff/255, b: 0x73/255, a: 0.6});
                this.add(new BlueTile(pos, tick), AID);
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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var BlueTile = FlatColorTile('red', {r: 0xfc/255, g: 0x6f/255, b: 0x65/255, a: 0.6});
                this.add(new BlueTile(pos, tick), AID);
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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var BlueTile = FlatColorTile('salmon', {r: 0xff/255, g: 0x80/255, b: 0xb7/255, a: 0.6});
                this.add(new BlueTile(pos, tick), AID);
            }
        }],

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


        311: [{ //crazy uproar
            type: 'STR',
            file: 'loud',
            wav: 'effect/\xb0\xed\xbc\xba\xb9\xe6\xb0\xa1', //°íĽşąć°ˇ
            attachedEntity: true
        }],


        315: [{
            type: 'STR',
            file: 'safetywall',
            attachedEntity: false
        }],

        316: [{
            //type: 'FUNC',
            wav: 'effect/ef_readyportal',
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

        'deluge_ground': [{
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var PropertyGround = require('Renderer/Effects/PropertyGround');
                this.add(new PropertyGround(pos, 3.0, 1.0, 2, 'ring_blue', tick), AID);
            }
        }],

        317: [{
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var Cylinder = require('Renderer/Effects/Cylinder');
                this.add(new Cylinder(pos, 0.6, 0.6, 40, 'magic_blue', tick), AID);
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

        336: [{ //kyrie eleison / parrying    (when target blocked dmg)
            wav:  'effect/kyrie_guard',
            attachedEntity: true
        }],

        337: [{
            type: 'STR',
            file: 'joblvup',
            attachedEntity: true
        }],


        363: [{
            type: 'SPR',
            file: 'vallentine',
            attachedEntity: true
        }],       
        
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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var BlueTile = FlatColorTile('white', {r: 0xff/255, g: 0xff/255, b: 0xff/255, a: 0.6});
                this.add(new BlueTile(pos, tick), AID);
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


        382: [{
            type: 'SPR',
            file: '\xc7\x4e\x6f\x31\x41\xb5\xbb\xe7', //ÇNo1Aµ»ç
            head: true,
            attachedEntity: true
        }],

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
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var BlueTile = FlatColorTile('gray', {r: 0x60/255, g: 0x60/255, b: 0x60/255, a: 0.6});
                this.add(new BlueTile(pos, tick), AID);
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

        426: [{ //taekwon sprint collision effect
            wav:  'effect/\xba\xb9\xc8\xa3\xb0\xdd', //şąČŁ°Ý
            attachedEntity: true
        }],

        440: [{
            type: 'STR',
            file: 'asum',
            wav:  'effect/\xbe\xc6\xbc\xfb\xc7\xc1\xc6\xbc\xbf\xc0', //ľĆĽűÇÁĆĽżŔ
            attachedEntity: true
        }],

        445: [{ //high jump caster
            wav:  'effect/\x74\x5f\xc8\xb8\xc7\xc7\x32', //t_Č¸ÇÇ2
            attachedEntity: true
        }],

		450: [{ // Dark cross
            
        }],

        457: [{ //flying kick on target
            wav:  'effect/\x74\x5f\xb3\xaf\xb6\xf3\xc2\xf7\xb1\xe2', //t_łŻ¶óÂ÷±â
            attachedEntity: true
        }],

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

        '496_beforecast': [{
            type: 'FUNC',
            attachedEntity: true,
            func: function(entity, tick) {
                var MagicRing = require('Renderer/Effects/MagicRing');
                this.add(new MagicRing(entity, 2.45, 0.8, 2.80, 'ring_jadu', tick+10000), entity.GID);
            }
        }],

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


        519: [{ //speed potion
            type: 'SPR',
            file: 'fast',
            wav:  'effect/fast',
            attachedEntity: true
        }],

		'522_ground': [{ // Gravitation field
            type: 'FUNC',
            attachedEntity: false,
            func: function(pos, tick, AID){
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var BlueTile = FlatColorTile('white', {r: 0xff/255, g: 0xff/255, b: 0xff/255, a: 0.6});
                this.add(new BlueTile(pos, tick), AID);
            }
        }],


/*
523.	Tarot Card of Fate (The Fool)
524.	Tarot Card of Fate (The Magician)
525.	Tarot Card of Fate (The High Priestess)
526.	Tarot Card of Fate (The Chariot)
527.	Tarot Card of Fate (Strength)
528.	Tarot Card of Fate (The Lovers)
529.	Tarot Card of Fate (The Wheel of Fortune)
530.	Tarot Card of Fate (The Hanged Man)
531.	Tarot Card of Fate (Death)
532.	Tarot Card of Fate (Temperance)
533.	Tarot Card of Fate (The Devil)
534.	Tarot Card of Fate (The Tower)
535.	Tarot Card of Fate (The Star)
536.	Tarot Card of Fate (The Sun)
*/
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


        612: [{
            type: 'SPR',
            file: '\xc7\x4f\xb0\xdd\x5f', //ÇO°Ý_
            attachedEntity: true
        },{
            type: 'STR',
            file: 'itempokjuk',
            attachedEntity: true
        }],


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


        666: [{
            type: 'SPR',
            file: '\x33\xee\x31\x6f\xc4\x75\x41\x49\x41\xa9', //3î1oÄuAIA©
            attachedEntity: true
        }],


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


		'674_ground': [{ // evil land
            type: 'FUNC',
            attachedEntity: false,
			//file: 'status-curse',
            func: function(pos, tick, AID){
                var FlatColorTile = require('Renderer/Effects/FlatColorTile');
                var BlueTile = FlatColorTile('gray', {r: 0x40/255, g: 0x40/255, b: 0x40/255, a: 0.6});
                this.add(new BlueTile(pos, tick), AID);
            }
        }],


        677: [{
            type: 'STR',
            file: 'cwound',
            attachedEntity: true
        }],


        699: [{
            type: 'STR',
            file: 'flower_leaf',
            attachedEntity: true
        }],


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


        717: [{
            type: 'STR',
            file: 'angelus',
            wav:  'effect/ef_angelus',
            min:  'jong_mini',
            attachedEntity: true
        }],


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


        731: [{
            type: 'STR',
            file: 'dragon_h',
            attachedEntity: true
        }],


        734: [{
            type: 'STR',
            file: 'chainlight',
            attachedEntity: true
        }],


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


        756: [{
            type: 'STR',
            file: '\x31\xf6\x31\xad\x41\xa9', //1ö1­A©
            attachedEntity: true
        }],


        795: [{
            type: 'STR',
            file: 'powerswing',
            attachedEntity: true
        }],


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


        920: [{
            type: 'STR',
            file: 'firewall_per',
            attachedEntity: true
        }],


        926: [{
            type: 'STR',
            file: 'hunter_shockwave_blue',
            attachedEntity: true
        }],


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
