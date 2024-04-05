/**
 * UI/Components/WorldMap/WorldMap.js
 *
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author IssID
 * 
 * @updated 11/2023 by Sehrentos. Added map sections and airplane.
 * @todo fix scaling, now it's static 1280x1024 in size (use percentages instead of pixels)
 * @todo add map name and borders to the map sections
 * @todo add worldmap_dimension maps
 * 
 * @typedef {Object} MapSection
 * @property {string} id
 * @property {string} name
 * @property {number} top
 * @property {number} left
 * @property {number} width
 * @property {number} height
 * 
 * @typedef {Object} WorldMap
 * @property {string} id
 * @property {string} name
 * @property {MapSection[]} maps
 */
define(function (require) {
    'use strict';

    const DB = require('DB/DBManager');
    const Client = require('Core/Client');
    const Preferences = require('Core/Preferences');
    const Renderer = require('Renderer/Renderer');
    const UIManager = require('UI/UIManager');
    const UIComponent = require('UI/UIComponent');
    const htmlText = require('text!./WorldMap.html');
    const cssText = require('text!./WorldMap.css');

    /**
     * @type {WorldMap[]} map data
     */
    const MAPS = [
        // #region Midgard
        {
            id: 'worldmap', name: 'Midgard', maps: [
                { id: 'hu_fild01', name: 'Hugel Field 01', top: 0, left: 694, width: 57, height: 56 },
                { id: 'hu_fild02', name: 'Hugel Field 02', top: 0, left: 752, width: 57, height: 56 },
                { id: 'hu_fild03', name: 'Hugel Field 03', top: 0, left: 811, width: 57, height: 56 },
                { id: 'hu_fild04', name: 'Hugel Field 04', top: 57, left: 752, width: 58, height: 59 },
                { id: 'hu_fild05', name: 'Hugel Field 05', top: 57, left: 811, width: 58, height: 59 },
                { id: 'hu_fild06', name: 'Hugel Field 06', top: 57, left: 870, width: 58, height: 59 },
                { id: 'hu_fild07', name: 'Hugel Field 07', top: 120, left: 816, width: 45, height: 45 },
                { id: 'hugel', name: 'Hugel', top: 0, left: 870, width: 57, height: 56 },

                { id: 'ein_fild01', name: 'Einbroch Field 01', top: 57, left: 580, width: 58, height: 59 },
                { id: 'ein_fild02', name: 'Einbroch Field 02', top: 120, left: 580, width: 45, height: 45 },
                { id: 'ein_fild03', name: 'Einbroch Field 03', top: 177, left: 463, width: 45, height: 45 },
                { id: 'ein_fild04', name: 'Einbroch Field 04', top: 177, left: 521, width: 45, height: 45 },
                { id: 'ein_fild05', name: 'Einbroch Field 05', top: 177, left: 580, width: 45, height: 45 },
                { id: 'ein_fild06', name: 'Einbroch Field 06', top: 177, left: 640, width: 45, height: 45 },
                { id: 'ein_fild07', name: 'Einbroch Field 07', top: 237, left: 640, width: 45, height: 45 },
                { id: 'ein_fild08', name: 'Einbroch Field 08', top: 295, left: 521, width: 45, height: 45 },
                { id: 'ein_fild09', name: 'Einbroch Field 09', top: 295, left: 580, width: 45, height: 45 },
                { id: 'ein_fild10', name: 'Einbroch Field 10', top: 295, left: 640, width: 45, height: 45 },
                { id: 'einbroch', name: 'Einbroch', top: 237, left: 521, width: 45, height: 45 },
                { id: 'einbech', name: 'Einbech', top: 244, left: 575, width: 45, height: 45 },

                { id: 'yuno_fild01', name: 'Yuno Field 01', top: 237, left: 816, width: 45, height: 45 },
                { id: 'yuno_fild02', name: 'Yuno Field 02', top: 120, left: 757, width: 45, height: 45 },
                { id: 'yuno_fild03', name: 'Yuno Field 03', top: 116, left: 694, width: 58, height: 57 },
                { id: 'yuno_fild04', name: 'Yuno Field 04', top: 116, left: 635, width: 59, height: 57 },
                { id: 'yuno_fild05', name: 'Yuno Field 05', top: 57, left: 635, width: 59, height: 59 },
                { id: 'yuno_fild06', name: 'Yuno Field 06', top: 57, left: 694, width: 58, height: 59 },
                { id: 'yuno_fild07', name: 'Yuno Field 07', top: 177, left: 699, width: 45, height: 45 },
                { id: 'yuno_fild08', name: 'Yuno Field 08', top: 177, left: 757, width: 45, height: 45 },
                { id: 'yuno_fild09', name: 'Yuno Field 09', top: 177, left: 816, width: 45, height: 45 },
                { id: 'yuno_fild10', name: 'Yuno Field 10', top: 177, left: 875, width: 45, height: 45 },
                { id: 'yuno_fild11', name: 'Yuno Field 11', top: 237, left: 699, width: 45, height: 45 },
                { id: 'yuno_fild12', name: 'Yuno Field 12', top: 237, left: 757, width: 45, height: 45 },
                { id: 'yuno', name: 'Yuno', top: 79, left: 643, width: 63, height: 57 },

                { id: 'odin_tem01', name: 'Odin Temple F1', top: 177, left: 991, width: 45, height: 45 },
                { id: 'odin_tem02', name: 'Odin Temple F2', top: 177, left: 1047, width: 45, height: 45 },
                { id: 'odin_tem03', name: 'Odin Temple F3', top: 120, left: 1047, width: 45, height: 45 },

                { id: 'lhz_fild01', name: 'Lighthalzen Field 01', top: 237, left: 404, width: 45, height: 45 },
                { id: 'lhz_fild02', name: 'Lighthalzen Field 02', top: 237, left: 463, width: 45, height: 45 },
                { id: 'lhz_fild03', name: 'Lighthalzen Field 03', top: 295, left: 463, width: 45, height: 45 },
                { id: 'lighthalzen', name: 'Lighthalzen', top: 295, left: 404, width: 45, height: 45 },

                { id: 'ra_fild01', name: 'Rachel Field 01 - Audumra Grass Land', top: 120, left: 286, width: 45, height: 45 },
                { id: 'ra_fild02', name: 'Rachel Field 02 - Oz Gorge', top: 173, left: 163, width: 60, height: 61 },
                { id: 'ra_fild03', name: 'Rachel Field 03 - Ida Plane', top: 177, left: 226, width: 45, height: 45 },
                { id: 'ra_fild04', name: 'Rachel Field 04 - Audumra Grass Land', top: 177, left: 286, width: 45, height: 45 },
                { id: 'ra_fild05', name: 'Rachel Field 05 - Audumra Grass Land', top: 177, left: 345, width: 45, height: 45 },
                { id: 'ra_fild06', name: 'Rachel Field 06 - Fortu Luna', top: 177, left: 404, width: 45, height: 45 },
                { id: 'ra_fild07', name: 'Rachel Field 07 - Oz Gorge', top: 237, left: 166, width: 45, height: 45 },
                { id: 'ra_fild08', name: 'Rachel Field 08 - Ida Plane', top: 237, left: 286, width: 45, height: 45 },
                { id: 'ra_fild09', name: 'Rachel Field 09 - Audumra Grass Land', top: 237, left: 345, width: 45, height: 45 },
                { id: 'ra_fild10', name: 'Rachel Field 10 - Oz Gorge', top: 295, left: 109, width: 45, height: 45 },
                { id: 'ra_fild11', name: 'Rachel Field 11 - Ida Plane', top: 295, left: 166, width: 45, height: 45 },
                { id: 'ra_fild12', name: 'Rachel Field 12 - Ida Plane', top: 295, left: 286, width: 45, height: 45 },
                { id: 'ra_fild13', name: 'Rachel Field 13 - Beach of Tears', top: 355, left: 286, width: 45, height: 45 },
                { id: 'ra_temple', name: 'Rachel Temple (Sesrumnis)', top: 260, left: 235, width: 37, height: 31 },
                { id: 'rachel', name: 'Rachel, Capital of Arunafelz, the Study Nation', top: 295, left: 226, width: 45, height: 45 },

                { id: 've_fild01', name: 'Veins Field 01', top: 355, left: 166, width: 45, height: 45 },
                { id: 've_fild02', name: 'Veins Field 02', top: 355, left: 226, width: 45, height: 45 },
                { id: 'aru_gld', name: 'Arunafeltz Guild', top: 484, left: 163, width: 60, height: 43 },
                { id: 've_fild03', name: 'Veins Field 03', top: 413, left: 109, width: 45, height: 45 },
                { id: 've_fild04', name: 'Veins Field 04', top: 413, left: 166, width: 45, height: 45 },
                { id: 've_fild05', name: 'Veins Field 05', top: 470, left: 109, width: 45, height: 45 },
                { id: 've_fild06', name: 'Veins Field 06', top: 410, left: 224, width: 58, height: 58 },
                { id: 've_fild07', name: 'Veins Field 07', top: 589, left: 164, width: 45, height: 45 },
                { id: 'veins', name: 'Veins', top: 531, left: 164, width: 45, height: 45 },

                { id: 'aldebaran', name: 'Al De Baran', top: 295, left: 816, width: 45, height: 45 },
                { id: 'alde_gld', name: 'Luina the satellite of Al De Baran', top: 295, left: 757, width: 45, height: 45 },
                { id: 'mjolnir_01', name: 'Mt.Mjolnir 01', top: 413, left: 580, width: 45, height: 45 },
                { id: 'mjolnir_02', name: 'Mt.Mjolnir 02', top: 413, left: 640, width: 45, height: 45 },
                { id: 'mjolnir_03', name: 'Mt.Mjolnir 03', top: 413, left: 699, width: 45, height: 45 },
                { id: 'mjolnir_04', name: 'Mt.Mjolnir 04', top: 413, left: 757, width: 45, height: 45 },
                { id: 'mjolnir_05', name: 'Mt.Mjolnir 05', top: 413, left: 816, width: 45, height: 45 },
                { id: 'mjolnir_06', name: 'Mt.Mjolnir 06', top: 472, left: 639, width: 45, height: 45 },
                { id: 'mjolnir_07', name: 'Mt.Mjolnir 07', top: 472, left: 698, width: 45, height: 45 },
                { id: 'mjolnir_08', name: 'Mt.Mjolnir 08', top: 472, left: 756, width: 45, height: 45 },
                { id: 'mjolnir_09', name: 'Mt.Mjolnir 09', top: 530, left: 756, width: 45, height: 45 },
                { id: 'mjolnir_10', name: 'Mt.Mjolnir 10', top: 472, left: 816, width: 45, height: 45 },
                { id: 'mjolnir_11', name: 'Mt.Mjolnir 11', top: 472, left: 875, width: 45, height: 45 },
                { id: 'mjolnir_12', name: 'Mt.Mjolnir 12', top: 355, left: 816, width: 45, height: 45 },

                { id: 'glast_01', name: 'Entrance to Glast Heim', top: 472, left: 411, width: 45, height: 45 },
                { id: 'gef_fild00', name: 'Geffen Field 00', top: 531, left: 639, width: 45, height: 45 },
                { id: 'gef_fild01', name: 'Geffen Field 01', top: 589, left: 639, width: 45, height: 45 },
                { id: 'gef_fild02', name: 'Geffen Field 02', top: 646, left: 698, width: 45, height: 45 },
                { id: 'gef_fild03', name: 'Geffen Field 03', top: 646, left: 639, width: 45, height: 45 },
                { id: 'gef_fild04', name: 'Geffen Field 04', top: 472, left: 579, width: 45, height: 45 },
                { id: 'gef_fild05', name: 'Geffen Field 05', top: 472, left: 521, width: 45, height: 45 },
                { id: 'gef_fild06', name: 'Geffen Field 06', top: 472, left: 463, width: 45, height: 45 },
                { id: 'gef_fild07', name: 'Geffen Field 07', top: 531, left: 521, width: 45, height: 45 },
                { id: 'gef_fild08', name: 'Geffen Field 08', top: 531, left: 463, width: 45, height: 45 },
                { id: 'gef_fild09', name: 'Geffen Field 09', top: 589, left: 579, width: 45, height: 45 },
                { id: 'gef_fild10', name: 'Geffen Field 10', top: 646, left: 579, width: 45, height: 45 },
                { id: 'gef_fild11', name: 'Geffen Field 11', top: 704, left: 579, width: 45, height: 45 },
                { id: 'gef_fild12', name: 'Geffen Field 12 - Kordt Forest', top: 589, left: 463, width: 45, height: 45 },
                { id: 'gef_fild13', name: 'Geffen Field 13 - Britoniah Guild (Geffen)', top: 589, left: 521, width: 45, height: 45 },
                { id: 'gef_fild14', name: 'Geffen Field 14 - West Orc Village', top: 646, left: 521, width: 45, height: 45 },
                { id: 'geffen', name: 'Geffen', top: 531, left: 579, width: 45, height: 45 },

                { id: 'prt_fild00', name: 'Prontera Field 00', top: 531, left: 698, width: 45, height: 45 },
                { id: 'prt_fild01', name: 'Prontera Field 01', top: 531, left: 816, width: 45, height: 45 },
                { id: 'prt_fild02', name: 'Prontera Field 02', top: 531, left: 875, width: 45, height: 45 },
                { id: 'prt_fild03', name: 'Prontera Field 03', top: 531, left: 933, width: 45, height: 45 },
                { id: 'prt_fild04', name: 'Prontera Field 04', top: 589, left: 698, width: 45, height: 45 },
                { id: 'prt_fild05', name: 'Prontera Field 05', top: 589, left: 756, width: 45, height: 45 },
                { id: 'prt_fild06', name: 'Prontera Field 06', top: 589, left: 875, width: 45, height: 45 },
                { id: 'prt_fild07', name: 'Prontera Field 07', top: 646, left: 756, width: 45, height: 45 },
                { id: 'prt_fild08', name: 'Prontera Field 08', top: 646, left: 816, width: 45, height: 45 },
                { id: 'prt_fild09', name: 'Prontera Field 09', top: 704, left: 756, width: 45, height: 45 },
                { id: 'prt_fild10', name: 'Prontera Field 10', top: 704, left: 698, width: 45, height: 45 },
                { id: 'prt_fild11', name: 'Prontera Field 11', top: 704, left: 639, width: 45, height: 45 },
                { id: 'prt_monk', name: 'Prontera Field - St. Capitolina Abbey', top: 531, left: 992, width: 45, height: 45 },
                { id: 'prontera', name: 'Prontera', top: 589, left: 816, width: 45, height: 45 },

                { id: 'izlude', name: 'Izlude', top: 644, left: 876, width: 25, height: 30 },
                { id: 'izlu2dun', name: 'Byalan Island', top: 643, left: 927, width: 22, height: 22 },

                { id: 'pay_fild01', name: 'Payon Forest 01', top: 807, left: 939, width: 45, height: 45 },
                { id: 'pay_fild02', name: 'Payon Forest 02', top: 868, left: 959, width: 45, height: 63 },
                { id: 'pay_fild03', name: 'Payon Forest 03', top: 887, left: 1007, width: 45, height: 45 },
                { id: 'pay_fild04', name: 'Payon Forest 04', top: 704, left: 876, width: 45, height: 45 },
                { id: 'pay_fild05', name: 'Payon Forest 05', top: 935, left: 963, width: 45, height: 45 },
                { id: 'pay_fild06', name: 'Payon Forest 06', top: 935, left: 1007, width: 45, height: 45 },
                { id: 'pay_fild07', name: 'Payon Forest 07', top: 807, left: 997, width: 45, height: 45 },
                { id: 'pay_fild08', name: 'Payon Forest 08', top: 745, left: 1013, width: 45, height: 45 },
                { id: 'pay_fild09', name: 'Payon Forest 09', top: 748, left: 1057, width: 45, height: 45 },
                { id: 'pay_fild10', name: 'Payon Forest 10', top: 807, left: 1057, width: 45, height: 45 },
                { id: 'pay_fild11', name: 'Payon Forest 11', top: 872, left: 910, width: 45, height: 45 },
                // { id: 'pay_gld', name: 'Payon Forest - Greenwood Lake (Guild)', top: 764, left: 910, width: 45, height: 45 },
                { id: 'pay_arche', name: 'Payon Forest - Archer Village', top: 697, left: 988, width: 45, height: 45 },
                { id: 'payon', name: 'Payon Town, home of Archers', top: 745, left: 966, width: 47, height: 59 },

                { id: 'alberta', name: 'Alberta, City of Merchants', top: 912, left: 1058, width: 55, height: 53 },
                { id: 'alb2trea', name: 'Alberta Island', top: 919, left: 1113, width: 21, height: 25 },
                { id: 'tur_dun01', name: 'Turtle Island', top: 974, left: 1163, width: 29, height: 30 },

                { id: 'moc_fild01', name: 'Morroc Field 01', top: 704, left: 816, width: 45, height: 45 },
                { id: 'moc_fild02', name: 'Morroc Field 02', top: 764, left: 862, width: 45, height: 45 },
                { id: 'moc_fild03', name: 'Morroc Field 03', top: 813, left: 886, width: 45, height: 45 },
                { id: 'moc_fild13', name: 'Morroc Field 13', top: 813, left: 839, width: 45, height: 45 },
                { id: 'moc_fild07', name: 'Morroc Field 07', top: 789, left: 607, width: 45, height: 45 },
                { id: 'moc_fild12', name: 'Morroc Field 12', top: 897, left: 606, width: 45, height: 45 },
                { id: 'moc_fild11', name: 'Morroc Field 11', top: 897, left: 663, width: 45, height: 45 },
                { id: 'moc_fild16', name: 'Morroc Field 16', top: 941, left: 722, width: 45, height: 45 },
                { id: 'moc_fild17', name: 'Morroc Field 17', top: 953, left: 663, width: 45, height: 45 },
                { id: 'moc_fild18', name: 'Morroc Field 18', top: 953, left: 607, width: 45, height: 45 },
                { id: 'moc_fild19', name: 'Morroc Field 19', top: 848, left: 566, width: 37, height: 34 },
                // { id: 'moc_fild20', name: 'Morroc Field 20', top: 800, left: 670, width: 45, height: 45 },
                // { id: 'moc_fild21', name: 'Morroc Field 21', top: 840, left: 660, width: 45, height: 45 },
                // { id: 'moc_fild22', name: 'Morroc Field 22', top: 820, left: 710, width: 45, height: 45 },
                { id: 'moc_ruins', name: 'Morroc Field - Sograt Desert - Morroc Ruins', top: 816, left: 566, width: 36, height: 32 },
                { id: 'morocc', name: 'Morroc Town', top: 848, left: 609, width: 45, height: 45 },

                { id: 'cmd_fild01', name: 'Comodo Field 01 - Papuchicha Forest', top: 837, left: 369, width: 45, height: 45 },
                { id: 'cmd_fild02', name: 'Comodo Field 02 - Kokomo beach', top: 897, left: 369, width: 45, height: 45 },
                { id: 'cmd_fild03', name: 'Comodo Field 03 - Zenhai Marsh', top: 837, left: 428, width: 45, height: 45 },
                { id: 'cmd_fild04', name: 'Comodo Field 04 - Kokomo beach', top: 897, left: 428, width: 45, height: 45 },
                { id: 'cmd_fild05', name: 'Comodo Field 05 - Border of Papuchica forest', top: 837, left: 486, width: 45, height: 45 },
                { id: 'cmd_fild06', name: 'Comodo Field 06 - Fortress Saint Darmain (West)', top: 897, left: 486, width: 45, height: 45 },
                { id: 'cmd_fild07', name: 'Comodo Field 07 - Beacon Island, Pharos', top: 953, left: 486, width: 45, height: 45 },
                { id: 'cmd_fild08', name: 'Comodo Field 08 - Fortress Saint Darmain (East)', top: 897, left: 546, width: 45, height: 45 },
                { id: 'cmd_fild09', name: 'Comodo Field 09 - Fortress Saint Darmain (South)', top: 953, left: 546, width: 45, height: 45 },
                { id: 'comodo', name: 'Comodo Town', top: 837, left: 300, width: 45, height: 45 },

                { id: 'um_fild01', name: 'Umbala Forest 01', top: 719, left: 299, width: 45, height: 45 },
                { id: 'um_fild02', name: 'Umbala Forest 02', top: 778, left: 240, width: 45, height: 45 },
                { id: 'um_fild03', name: 'Umbala Forest 03', top: 778, left: 299, width: 45, height: 45 },
                { id: 'um_fild04', name: 'Umbala Forest 04', top: 778, left: 359, width: 45, height: 45 },
                { id: 'umbala', name: 'Umbala Town', top: 662, left: 310, width: 45, height: 45 },

                { id: 'nameless_n', name: 'Nameless Island', top: 700, left: 96, width: 60, height: 60 },
            ]
        },
        // #endregion

        // #region Localize1 / Eastern Kingdoms
        {
            id: 'worldmap_localizing1', name: 'Eastern Kingdoms', maps: [
                { id: 'ama_fild01', name: 'Amatsu Field 01', top: 165, left: 332, width: 88, height: 88 },
                { id: 'amatsu', name: 'Amatsu', top: 256, left: 281, width: 88, height: 88 },
                { id: 'gon_fild01', name: 'Gonryun Field 01', top: 170, left: 906, width: 88, height: 88 },
                { id: 'gonryun', name: 'Gonryun', top: 268, left: 911, width: 88, height: 88 },
                { id: 'lou_fild01', name: 'Louyang Field 01', top: 768, left: 276, width: 88, height: 88 },
                { id: 'louyang', name: 'Louyang', top: 673, left: 276, width: 88, height: 88 },
                { id: 'ayo_fild01', name: 'Ayothaya Field 01', top: 734, left: 920, width: 88, height: 88 },
                { id: 'ayothaya', name: 'Ayothaya', top: 724, left: 827, width: 88, height: 88 },
            ]
        },
        // #endregion

        // #region Localize2 / Far Fields
        {
            id: 'worldmap_localizing2', name: 'Far Lands', maps: [
                { id: 'mosk_fild02', name: 'Moscovia Field 02', top: 299, left: 187, width: 88, height: 88 },
                { id: 'moscovia', name: 'Moscovia', top: 332, left: 394, width: 110, height: 110 },
                { id: 'bra_fild01', name: 'Brasilis Field 01', top: 110, left: 998, width: 88, height: 88 },
                { id: 'brasilis', name: 'Brasilis', top: 255, left: 924, width: 88, height: 88 },
                { id: 'dew_fild01', name: 'Dewata Field 01', top: 668, left: 37, width: 88, height: 88 },
                { id: 'dewata', name: 'Dewata', top: 712, left: 232, width: 88, height: 88 },
                { id: 'mal_fild01', name: 'Malaya Field 01', top: 810, left: 956, width: 88, height: 88 },
                { id: 'mal_fild02', name: 'Malaya Field 02', top: 713, left: 946, width: 88, height: 88 },
                { id: 'mal_fild03', name: 'Malaya Field 03', top: 601, left: 1076, width: 88, height: 88 },
                { id: 'malaya', name: 'Malaya', top: 883, left: 832, width: 88, height: 88 },
            ]
        },
        // #endregion

        // #region Dimension / New World
        {
            id: 'worldmap_dimension', name: 'New World', maps: [
                // TODO
                // { id: 'dimension', name: 'Dimension', top: 0, left: 0, width: 0, height: 0 },
            ]
        },
        // #endregion
    ];

    /**
     * Create Component
     */
    const WorldMap = new UIComponent('WorldMap', htmlText, cssText);

    /**
     * @type {Preferences} window preferences
     */
    const _preferences = Preferences.get('WorldMap', {
        x: 0,
        y: 0,
        width: Renderer.width,
        height: Renderer.height,
        show: false,
    }, 1.0);

    /**
     * Initialize UI
     */
    WorldMap.init = function init() {
        this.ui.find('.titlebar .base').mousedown(stopPropagation);
        this.ui.find('.titlebar select').change(onSelect);
        this.ui.find('.titlebar .close').click(onClose);

        // worldmap dialog
        this.ui.find('.map .content').on('click', onWorldMapClick);
        this.ui.find('#dialog-map-view').on('click', onWorldMapDialogClick);

        setMapList();
    };

    /**
     * Create WorldMap list of maps (select Element)
     */
    function setMapList() {
        WorldMap.ui.find('#WorldMaps').prepend(function () {
            let list = '';
            for (const map of MAPS) {
                // list += '<option value="' + mapList[wmap].img + '">' + mapList[wmap].name + '</option>'
                list += `<option value="${map.id}">${map.name}</option>`;
            }
            return list;
        })
    }

    function onSelect() {
        resize(WorldMap.ui.find('.titlebar select').val());
    }

    /**
     * Extend WorldMap window size
     * 
     * @param {string} name eg. `"worldmap_localizing1"`
     */
    function resize(name = 'worldmap') {
        // load map image asset and render it
        Client.loadFile(DB.INTERFACE_PATH + name + '.bmp', (data) => {
            // find map data by name and render it
            for (const map of MAPS) {
                if (map.id === name) {
                    createWorldMapView(map, data);
                    break;
                }
            }
        });
    }

    /**
     * When worldmap container is clicked
     * @param {*} e 
     */
    function onWorldMapClick(e) {
        // event delegation from .selection
        if (e.target.classList.contains('section')) {
            const dialog = WorldMap.ui.find('#dialog-map-view')[0];
            if (dialog == null) return;
            dialog.showModal();

            const img = dialog.querySelector('#img-map-view');
            img.src = '';
            img.alt = `Loading ${e.target.id}...`;
            // load the image
            Client.loadFile(`${DB.INTERFACE_PATH}map/${e.target.id}.bmp`, (data) => {
                // img.src = `textures/map/${e.target.id}.bmp`;
                // http://127.0.0.1/data/texture/À¯ÀúÀÎÅÍÆäÀÌ½º/map/prontera.bmp
                //img.src = `${resourcePath}/map/${e.target.id}.bmp`;
                //img.alt = `${e.target.id}.bmp`;
                img.src = data;
                // try to adjust purple color transparency
                img.onload = () => adjustImageTransparency(img);
                // when image is loaded for 100% chance, then use this instead
                // adjustImageTransparency(img);
            });
        }
    }

    /**
     * When the user clicks outside of the dialog, close it
     *
     * @param {*} e 
     * @returns 
     */
    function onWorldMapDialogClick(e) {
        const dialog = WorldMap.ui.find('#dialog-map-view')[0];
        if (dialog == null) return;
        const dialogDimensions = dialog.getBoundingClientRect()
        if (
            e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom
        ) {
            dialog.close()
            return;
        }
        // close button
        if (e.target.id === 'dialog-close') {
            dialog.close()
            return;
        }
    }

    /**
     * Create the .worldmap container and loop through all the maps 
     * and render them to the container.
     * 
     * @param {WorldMap} map world map data
     * @param {string} imgData world map image data as a base64
     */
    function createWorldMapView(map, imgData) {
        const container = WorldMap.ui.find('.map .content');
        const worldmap = document.createElement('div');
        worldmap.className = 'worldmap';

        // set loaded worldmap background image
        // worldmap.css('backgroundImage', `url(${imgData})`);
        const mapView = document.createElement('div');
        mapView.id = map.id;
        mapView.className = 'map-view';
        mapView.style.backgroundImage = `url(${imgData})`;
        mapView.setAttribute('data-name', map.name);
        worldmap.appendChild(mapView);

        // output <div id="worldmap_localizing1" class="map-view" data-name="Eastern Kingdoms"></div>
        for (const section of map.maps) {
            const el = document.createElement('div');
			const el_mapid = document.createElement('div');
			
            el.id = section.id;
            el.className = 'section';
            el.style.top = `${section.top}px`;
            el.style.left = `${section.left}px`;
            el.style.width = `${section.width}px`;
            el.style.height = `${section.height}px`;
            el.setAttribute('data-name', section.name);
			el.title = section.name;
			
			el_mapid.className = 'mapid';
			el_mapid.innerHTML = section.id;
			
			el.appendChild(el_mapid);
			
            mapView.appendChild(el);
            // output <div id="um_fild04" class="section" title="Umbala Forest 04"></div>
        }
        // airplanes, currently only in the worldmap
        // do secondary assets loading to load the airplane image
        // and then create element and append it to the DOM
        if (map.id === 'worldmap') {
            loadAirplane(mapView);
        }
        worldmap.appendChild(mapView);
        container.html(worldmap);
    }

    /**
     * Load airplane image and append it to the DOM (.map-view element)
     * 
     * @param {HTMLElement} mapView target where to append to
     */
    function loadAirplane(mapView) {
        Client.loadFile(DB.INTERFACE_PATH + 'worldview_interface/wv_airplen32.bmp', (data) => {
            const airplane = document.createElement('img');
            airplane.id = 'midgard-airplane';
            airplane.className = 'airplane';
            airplane.src = data;
            // update it's position and angle
            setAirplanePosition(airplane);
            mapView.appendChild(airplane);
        });
    }

    /**
     * Refresh airplane position
     * 
     * @param {HTMLElement} airplane optional. if not provided, will use .worldmap #midgard-airplane
     * 
     * @todo use server time and set position and angle
     * @returns JQuery Element
     */
    function setAirplanePosition(airplane) {
        const el = airplane || document.querySelector('.worldmap #midgard-airplane');
        el.style.top = '35%';
        el.style.left = '35%';
        el.style.transform = `rotate(75deg)`;
    }

    /**
     * helper function to convert purple (255,0,255) color to transparent from image.
     * 
     * Note: will not work on local files, needs to be hosted on 
     * server for CORS (See: 'getImageData' on 'CanvasRenderingContext2D': 
     * The canvas has been tainted by cross-origin data)
     * 
     * Will set `[data-transparency-adjusted="true"]` on image element.
     * 
     * @param {HTMLImageElement} img source image element
     * 
     * @example const img = document.querySelector('img');
        img.src = `textures/map/${e.target.id}.bmp`;
        img.onload = () => {
            adjustImageTransparency(img);
        };
    */
    function adjustImageTransparency(img) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || img.clientWidth;
        canvas.height = img.height || img.clientHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // iterate over all pixels
        // in the image data and turn purple pixels transparent
        let i = 0, n = imgData.data.length, red, green, blue, isPurple = false;

        for (; i < n; i += 4) {
            red = imgData.data[i];
            green = imgData.data[i + 1];
            blue = imgData.data[i + 2];

            // with exact color
            isPurple = (red === 255 && blue === 255) && green === 0;
            // with some tolerance
            // let isPurple = (red >= 150 && blue >= 150) && green < 150;

            if (isPurple) {
                imgData.data[i + 3] = 0; // Set alpha channel to 0 for transparency
            }
        }
        ctx.putImageData(imgData, 0, 0);

        // replace the existing source image with the new one
        img.src = canvas.toDataURL();
    }

    /**
     * Apply preferences once append to body
     */
    WorldMap.onAppend = function onAppend() {
        // Apply preferences
        if (!_preferences.show) {
            this.ui.hide();
        }

        //  resize map container
        resize();

        this.ui.css({
            top: 0,
            left: 0
        });
    };

    WorldMap.onRemove = function onRemove() {
        // Save preferences
        _preferences.show = this.ui.is(':visible');
        _preferences.y = 0;
        _preferences.x = 0;
        _preferences.width = 0;
        _preferences.height = 0;
        _preferences.save();
    };

    /**
     * Show/Hide UI
     */
    WorldMap.toggle = function toggle() {
        this.ui.toggle();

        if (this.ui.is(':visible')) {
            this.focus();
        }
    };

    /**
     * Process shortcut
     *
     * @param {object} key
     */
    WorldMap.onShortCut = function onShortCut(key) {
        switch (key.cmd) {
            case 'TOGGLE':
                this.toggle();
                break;
        }
    };

    /**
     * Stop event propagation
     */
    function stopPropagation(event) {
        event.stopImmediatePropagation();
        return false;
    }

    /**
     * Closing window
     */
    function onClose() {
        WorldMap.ui.hide();
    }

    /**
     * Create component and export it
     */
    return UIManager.addComponent(WorldMap);
});
