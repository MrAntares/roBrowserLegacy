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
    const Configs = require('Core/Configs');
    const Preferences = require('Core/Preferences');
    const Renderer = require('Renderer/Renderer');
    const MapRenderer = require('Renderer/MapRenderer');
    const UIManager = require('UI/UIManager');
    const UIComponent = require('UI/UIComponent');
    const Session = require('Engine/SessionStorage');
    const htmlText = require('text!./WorldMap.html');
    const cssText = require('text!./WorldMap.css');

    /**
     * @type {WorldMap[]} map data
     * todo create a database for this list. this does not belong here
     */
    const MAPS = [
        // #region Midgard
        {
            id: 'worldmap', ep_from: 0, ep_to: 99, name: 'Midgard', maps: [
                { id: 'hu_fild01', ep_from: 10.3, ep_to: 99, name: 'Hugel Field 01 - Entrance to Thanatos Tower', top: 0, left: 695, width: 57, height: 57 },
                { id: 'hu_fild02', ep_from: 10.3, ep_to: 99, name: 'Hugel Field 02', top: 0, left: 753, width: 58, height: 57 },
                { id: 'hu_fild03', ep_from: 10.3, ep_to: 13.1, name: 'Hugel Field 03 - Royal Hunting Ground', top: 0, left: 811, width: 59, height: 57 },
                { id: 'hu_fild04', ep_from: 10.3, ep_to: 99, name: 'Hugel Field 04', top: 58, left: 753, width: 58, height: 58 },
                { id: 'hu_fild05', ep_from: 10.3, ep_to: 99, name: 'Hugel Field 05 - Entrance to The Abyss Lake', top: 58, left: 812, width: 58, height: 58 },
                { id: 'hu_fild06', ep_from: 10.4, ep_to: 99, name: 'Hugel Field 06', top: 58, left: 871, width: 56, height: 58 },
                { id: 'hu_fild07', ep_from: 10.4, ep_to: 13.1, name: 'Hugel Field 07', top: 116, left: 811, width: 59, height: 57 },
                { id: 'hugel', ep_from: 10.4, ep_to: 99, name: 'Hugel', top: 0, left: 871, width: 56, height: 57 },

                { id: 'ein_fild01', ep_from: 10.1, ep_to: 99, name: 'Einbroch Field 01', top: 58, left: 576, width: 59, height: 58 },
                { id: 'ein_fild02', ep_from: 10.1, ep_to: 13.1, name: 'Einbroch Field 02', top: 116, left: 575, width: 60, height: 57 },
                { id: 'ein_fild03', ep_from: 10.1, ep_to: 99, name: 'Einbroch Field 03', top: 174, left: 460, width: 57, height: 60 },
                { id: 'ein_fild04', ep_from: 10.1, ep_to: 99, name: 'Einbroch Field 04', top: 174, left: 518, width: 57, height: 60 },
                { id: 'ein_fild05', ep_from: 10.1, ep_to: 99, name: 'Einbroch Field 05', top: 174, left: 576, width: 59, height: 60 },
                { id: 'ein_fild06', ep_from: 10.1, ep_to: 99, name: 'Einbroch Field 06', top: 174, left: 636, width: 58, height: 60 },
                { id: 'ein_fild07', ep_from: 10.1, ep_to: 99, name: 'Einbroch Field 07', top: 235, left: 636, width: 58, height: 56 },
                { id: 'ein_fild08', ep_from: 10.1, ep_to: 99, name: 'Einbroch Field 08', top: 292, left: 518, width: 57, height: 59 },
                { id: 'ein_fild09', ep_from: 10.1, ep_to: 99, name: 'Einbroch Field 09', top: 292, left: 576, width: 59, height: 59 },
                { id: 'ein_fild10', ep_from: 10.1, ep_to: 13.1, name: 'Einbroch Field 10', top: 292, left: 636, width: 58, height: 59 },
                { id: 'einbroch', ep_from: 10.1, ep_to: 99, name: 'Einbroch, the city of steel', top: 235, left: 518, width: 57, height: 56 },
                { id: 'einbech', ep_from: 10.1, ep_to: 99, name: 'Einbech, the mining village', top: 245, left: 576, width: 59, height: 46 },

                { id: 'yuno_fild01', ep_from: 5, ep_to: 99, name: 'Yuno Field 01 - Border Posts', top: 235, left: 812, width: 58, height: 56 },
                { id: 'yuno_fild02', ep_from: 5, ep_to: 99, name: 'Yuno Field 02 - Kiel Hyre\'s Cottage', top: 117, left: 753, width: 58, height: 56 },
                { id: 'yuno_fild03', ep_from: 5, ep_to: 99, name: 'Yuno Field 03 - El Mes Plateau', top: 117, left: 707, width: 45, height: 56 },
                { id: 'yuno_fild04', ep_from: 5, ep_to: 99, name: 'Yuno Field 04 - El Mes Plateau', top: 137, left: 636, width: 58, height: 36 },
                { id: 'yuno_fild05', ep_from: 5, ep_to: 13.1, name: 'Yuno Field 05 - El Mes Plateau', top: 57, left: 635, width: 59, height: 59 },
                { id: 'yuno_fild06', ep_from: 10.12, ep_to: 99, name: 'Yuno Field 06 - El Mes Plateau', top: 58, left: 707, width: 45, height: 58 },
                { id: 'yuno_fild07', ep_from: 10.12, ep_to: 99, name: 'Yuno Field 07 - El Mes Gorge (Valley of Abyss)', top: 174, left: 695, width: 57, height: 60 },
                { id: 'yuno_fild08', ep_from: 10.12, ep_to: 99, name: 'Yuno Field 08 - Kiel Khayr\'s Academy', top: 174, left: 753, width: 58, height: 60 },
                { id: 'yuno_fild09', ep_from: 10.12, ep_to: 99, name: 'Yuno Field 09 - Schwaltzwald Guards Camp', top: 174, left: 812, width: 58, height: 60 },
                { id: 'yuno_fild10', ep_from: 10.12, ep_to: 13.1, name: 'Yuno Field 10', top: 174, left: 871, width: 58, height: 60 },
                { id: 'yuno_fild11', ep_from: 10.12, ep_to: 99, name: 'Yuno Field 11', top: 235, left: 695, width: 57, height: 56 },
                { id: 'yuno_fild12', ep_from: 10.12, ep_to: 99, name: 'Yuno Field 12 - Border Checkpoint', top: 235, left: 753, width: 58, height: 56 },
                { id: 'yuno', ep_from: 5, ep_to: 99, name: 'Yuno, the capital of Schwarzwald Republic', top: 80, left: 644, width: 62, height: 56 },

                { id: 'odin_tem01', ep_from: 10.4, ep_to: 99, name: 'Odin Temple F1', top: 174, left: 988, width: 55, height: 60 },
                { id: 'odin_tem02', ep_from: 10.4, ep_to: 99, name: 'Odin Temple F2', top: 174, left: 1044, width: 58, height: 60 },
                { id: 'odin_tem03', ep_from: 10.4, ep_to: 99, name: 'Odin Temple F3', top: 117, left: 1044, width: 58, height: 56 },

                { id: 'lhz_fild01', ep_from: 10.2, ep_to: 99, name: 'Lighthalzen Field 01', top: 235, left: 401, width: 58, height: 56 },
                { id: 'lhz_fild02', ep_from: 10.2, ep_to: 99, name: 'Lighthalzen Field 02 - Lighthalzen Field (Grim Reaper\'s Valley)', top: 235, left: 460, width: 57, height: 56 },
                { id: 'lhz_fild03', ep_from: 10.2, ep_to: 99, name: 'Lighthalzen Field 03', top: 292, left: 460, width: 57, height: 59 },
                { id: 'lighthalzen', ep_from: 10.2, ep_to: 99, name: 'Lighthalzen, the City-State of Prosperity', top: 292, left: 401, width: 58, height: 54 },

                { id: 'ra_fild01', ep_from: 11.1, ep_to: 99, name: 'Rachel Field 01 - Audumra Grass Land', top: 117, left: 283, width: 58, height: 56 },
                { id: 'ra_fild02', ep_from: 11.1, ep_to: 13.1, name: 'Rachel Field 02 - Oz Gorge', top: 174, left: 164, width: 59, height: 61 },
                { id: 'ra_fild03', ep_from: 11.1, ep_to: 99, name: 'Rachel Field 03 - Ida Plane', top: 174, left: 224, width: 58, height: 61 },
                { id: 'ra_fild04', ep_from: 11.1, ep_to: 99, name: 'Rachel Field 04 - Audumra Grass Land', top: 174, left: 283, width: 58, height: 60 },
                { id: 'ra_fild05', ep_from: 11.1, ep_to: 99, name: 'Rachel Field 05 - Audumra Grass Land', top: 174, left: 342, width: 58, height: 60 },
                { id: 'ra_fild06', ep_from: 11.1, ep_to: 99, name: 'Rachel Field 06 - Fortu Luna', top: 174, left: 401, width: 58, height: 60 },
                { id: 'ra_fild07', ep_from: 11.1, ep_to: 13.1, name: 'Rachel Field 07 - Oz Gorge', top: 235, left: 164, width: 59, height: 58 },
                { id: 'ra_fild08', ep_from: 11.1, ep_to: 99, name: 'Rachel Field 08 - Ida Plane', top: 235, left: 283, width: 58, height: 58 },
                { id: 'ra_fild09', ep_from: 11.1, ep_to: 13.1, name: 'Rachel Field 09 - Audumra Grass Land', top: 235, left: 342, width: 58, height: 56 },
                { id: 'ra_fild10', ep_from: 11.1, ep_to: 13.1, name: 'Rachel Field 10 - Oz Gorge', top: 292, left: 107, width: 56, height: 59 },
                { id: 'ra_fild11', ep_from: 11.1, ep_to: 13.1, name: 'Rachel Field 11 - Ida Plane', top: 292, left: 164, width: 59, height: 59 },
                { id: 'ra_fild12', ep_from: 11.1, ep_to: 99, name: 'Rachel Field 12 - Ida Plane', top: 292, left: 283, width: 58, height: 59 },
                { id: 'ra_fild13', ep_from: 11.1, ep_to: 13.1, name: 'Rachel Field 13 - Beach of Tears', top: 352, left: 283, width: 58, height: 57 },
                { id: 'ra_temple', ep_from: 11.1, ep_to: 99, name: 'Rachel Temple (Sesrumnis)', top: 261, left: 236, width: 35, height: 30 },
                { id: 'rachel', ep_from: 11.1, ep_to: 99, name: 'Rachel, Capital of Arunafelz, the Study Nation', top: 292, left: 224, width: 58, height: 59 },

                { id: 've_fild01', ep_from: 11.2, ep_to: 99, name: 'Veins Field 01', top: 352, left: 164, width: 59, height: 57 },
                { id: 've_fild02', ep_from: 11.2, ep_to: 99, name: 'Veins Field 02', top: 352, left: 224, width: 58, height: 57 },
                { id: 'aru_gld', ep_from: 12, ep_to: 99, name: 'Arunafeltz Guild', top: 410, left: 224, width: 58, height: 58 },
                { id: 've_fild03', ep_from: 11.2, ep_to: 99, name: 'Veins Field 03', top: 410, left: 107, width: 56, height: 58 },
                { id: 've_fild04', ep_from: 11.2, ep_to: 99, name: 'Veins Field 04', top: 410, left: 164, width: 59, height: 58 },
                { id: 've_fild05', ep_from: 11.2, ep_to: 13.1, name: 'Veins Field 05', top: 470, left: 106, width: 58, height: 58 },
                { id: 've_fild06', ep_from: 11.2, ep_to: 99, name: 'Veins Field 06', top: 485, left: 164, width: 59, height: 42 },
                { id: 've_fild07', ep_from: 11.2, ep_to: 99, name: 'Veins Field 07', top: 586, left: 161, width: 57, height: 57 },
                { id: 'veins', ep_from: 11.2, ep_to: 99, name: 'Veins, the Canyon Village', top: 528, left: 161, width: 57, height: 57 },

                { id: 'aldebaran', ep_from: 0, ep_to: 99, name: 'Al De Baran', top: 292, left: 812, width: 58, height: 59 },
                { id: 'alde_gld', ep_from: 4, ep_to: 99, name: 'Luina the satellite of Al De Baran', top: 292, left: 753, width: 58, height: 59 },
                { id: 'mjolnir_01', ep_from: 0, ep_to: 99, name: 'Mt.Mjolnir 01', top: 411, left: 576, width: 59, height: 57 },
                { id: 'mjolnir_02', ep_from: 0, ep_to: 99, name: 'Mt.Mjolnir 02', top: 411, left: 636, width: 58, height: 57 },
                { id: 'mjolnir_03', ep_from: 0, ep_to: 99, name: 'Mt.Mjolnir 03', top: 411, left: 695, width: 57, height: 57 },
                { id: 'mjolnir_04', ep_from: 0, ep_to: 99, name: 'Mt.Mjolnir 04', top: 411, left: 753, width: 58, height: 57 },
                { id: 'mjolnir_05', ep_from: 0, ep_to: 99, name: 'Mt.Mjolnir 05', top: 411, left: 812, width: 58, height: 57 },
                { id: 'mjolnir_06', ep_from: 0, ep_to: 99, name: 'Mt.Mjolnir 06', top: 469, left: 636, width: 58, height: 58 },
                { id: 'mjolnir_07', ep_from: 0, ep_to: 99, name: 'Mt.Mjolnir 07', top: 469, left: 695, width: 57, height: 58 },
                { id: 'mjolnir_08', ep_from: 0, ep_to: 99, name: 'Mt.Mjolnir 08', top: 469, left: 753, width: 58, height: 58 },
                { id: 'mjolnir_09', ep_from: 0, ep_to: 99, name: 'Mt.Mjolnir 09', top: 528, left: 753, width: 58, height: 58 },
                { id: 'mjolnir_10', ep_from: 0, ep_to: 99, name: 'Mt.Mjolnir 10', top: 469, left: 812, width: 58, height: 58 },
                { id: 'mjolnir_11', ep_from: 0, ep_to: 99, name: 'Mt.Mjolnir 11', top: 469, left: 871, width: 56, height: 58 },
                { id: 'mjolnir_12', ep_from: 0, ep_to: 99, name: 'Mt.Mjolnir 12', top: 352, left: 812, width: 58, height: 58 },

                { id: 'glast_01', ep_from: 0, ep_to: 99, name: 'Entrance to Glast Heim', top: 469, left: 408, width: 51, height: 58 },
                { id: 'gef_fild00', ep_from: 0, ep_to: 99, name: 'Geffen Field 00', top: 528, left: 636, width: 58, height: 58 },
                { id: 'gef_fild01', ep_from: 0, ep_to: 99, name: 'Geffen Field 01', top: 587, left: 636, width: 58, height: 56 },
                { id: 'gef_fild02', ep_from: 0, ep_to: 99, name: 'Geffen Field 02', top: 644, left: 695, width: 57, height: 57 },
                { id: 'gef_fild03', ep_from: 0, ep_to: 99, name: 'Geffen Field 03', top: 644, left: 636, width: 58, height: 57 },
                { id: 'gef_fild04', ep_from: 0, ep_to: 99, name: 'Geffen Field 04', top: 469, left: 576, width: 59, height: 58 },
                { id: 'gef_fild05', ep_from: 0, ep_to: 99, name: 'Geffen Field 05', top: 469, left: 518, width: 57, height: 58 },
                { id: 'gef_fild06', ep_from: 0, ep_to: 99, name: 'Geffen Field 06', top: 469, left: 460, width: 57, height: 58 },
                { id: 'gef_fild07', ep_from: 0, ep_to: 99, name: 'Geffen Field 07', top: 528, left: 518, width: 57, height: 58 },
                { id: 'gef_fild08', ep_from: 0, ep_to: 99, name: 'Geffen Field 08', top: 528, left: 460, width: 57, height: 58 },
                { id: 'gef_fild09', ep_from: 0, ep_to: 99, name: 'Geffen Field 09', top: 587, left: 576, width: 59, height: 56 },
                { id: 'gef_fild10', ep_from: 0, ep_to: 99, name: 'Geffen Field 10', top: 644, left: 576, width: 59, height: 57 },
                { id: 'gef_fild11', ep_from: 0, ep_to: 99, name: 'Geffen Field 11', top: 702, left: 576, width: 59, height: 58 },
                { id: 'gef_fild12', ep_from: 0, ep_to: 13.1, name: 'Geffen Field 12 - Kordt Forest', top: 587, left: 460, width: 58, height: 56 },
                { id: 'gef_fild13', ep_from: 0, ep_to: 99, name: 'Geffen Field 13 - Britoniah Guild (Geffen)', top: 587, left: 518, width: 57, height: 56 },
                { id: 'gef_fild14', ep_from: 0, ep_to: 13.1, name: 'Geffen Field 14 - West Orc Village', top: 644, left: 518, width: 57, height: 57 },
                { id: 'geffen', ep_from: 0, ep_to: 99, name: 'Geffen', top: 528, left: 576, width: 59, height: 58 },

                { id: 'prt_fild00', ep_from: 0, ep_to: 99, name: 'Prontera Field 00', top: 528, left: 695, width: 57, height: 58 },
                { id: 'prt_fild01', ep_from: 0, ep_to: 99, name: 'Prontera Field 01', top: 528, left: 812, width: 58, height: 58 },
                { id: 'prt_fild02', ep_from: 0, ep_to: 99, name: 'Prontera Field 02', top: 528, left: 871, width: 56, height: 58 },
                { id: 'prt_fild03', ep_from: 0, ep_to: 99, name: 'Prontera Field 03', top: 528, left: 928, width: 58, height: 42 },
                { id: 'prt_fild04', ep_from: 0, ep_to: 99, name: 'Prontera Field 04', top: 587, left: 695, width: 57, height: 56 },
                { id: 'prt_fild05', ep_from: 0, ep_to: 99, name: 'Prontera Field 05', top: 587, left: 753, width: 58, height: 56 },
                { id: 'prt_fild06', ep_from: 0, ep_to: 99, name: 'Prontera Field 06', top: 587, left: 871, width: 56, height: 56 },
                { id: 'prt_fild07', ep_from: 0, ep_to: 99, name: 'Prontera Field 07', top: 644, left: 753, width: 58, height: 57 },
                { id: 'prt_fild08', ep_from: 0, ep_to: 99, name: 'Prontera Field 08', top: 644, left: 812, width: 58, height: 57 },
                { id: 'prt_fild09', ep_from: 0, ep_to: 99, name: 'Prontera Field 09', top: 702, left: 753, width: 58, height: 58 },
                { id: 'prt_fild10', ep_from: 0, ep_to: 99, name: 'Prontera Field 10', top: 702, left: 695, width: 57, height: 58 },
                { id: 'prt_fild11', ep_from: 0, ep_to: 99, name: 'Prontera Field 11', top: 702, left: 636, width: 58, height: 58 },
                { id: 'prt_monk', ep_from: 0, ep_to: 99, name: 'St. Capitolina Abbey', top: 528, left: 987, width: 55, height: 42 },
                { id: 'prontera', ep_from: 0, ep_to: 99, name: 'Prontera', top: 587, left: 812, width: 58, height: 56 },

                { id: 'izlude', ep_from: 0, ep_to: 99, name: 'Izlude', top: 644, left: 871, width: 31, height: 32 },
                { id: 'izlu2dun', ep_from: 0, ep_to: 99, name: 'Byalan Island', top: 644, left: 928, width: 20, height: 21 },

                { id: 'pay_fild01', ep_from: 0, ep_to: 99, name: 'Payon Forest 01', top: 804, left: 936, width: 58, height: 57 },
                { id: 'pay_fild02', ep_from: 0, ep_to: 99, name: 'Payon Forest 02', top: 869, left: 960, width: 43, height: 62 },
                { id: 'pay_fild03', ep_from: 0, ep_to: 99, name: 'Payon Forest 03', top: 885, left: 1004, width: 54, height: 46 },
                { id: 'pay_fild04', ep_from: 0, ep_to: 99, name: 'Payon Forest 04', top: 702, left: 871, width: 56, height: 58 },
                { id: 'pay_fild05', ep_from: 0, ep_to: 13.1, name: 'Payon Forest 05', top: 932, left: 960, width: 43, height: 57 },
                { id: 'pay_fild06', ep_from: 0, ep_to: 99, name: 'Payon Forest 06', top: 932, left: 1004, width: 54, height: 57 },
                { id: 'pay_fild07', ep_from: 0, ep_to: 99, name: 'Payon Forest 07', top: 804, left: 995, width: 58, height: 57 },
                { id: 'pay_fild08', ep_from: 0, ep_to: 99, name: 'Payon Forest 08', top: 746, left: 1014, width: 39, height: 57 },
                { id: 'pay_fild09', ep_from: 0, ep_to: 99, name: 'Payon Forest 09', top: 746, left: 1054, width: 59, height: 57 },
                { id: 'pay_fild10', ep_from: 0, ep_to: 99, name: 'Payon Forest 10', top: 804, left: 1054, width: 59, height: 57 },
                { id: 'pay_fild11', ep_from: 0, ep_to: 13.1, name: 'Payon Forest 11', top: 869, left: 907, width: 53, height: 62 },
                { id: 'pay_gld', ep_from: 4, ep_to: 99, name: 'Payon Forest - Greenwood Lake (Guild)', top: 764, left: 910, width: 58, height: 58 },
                { id: 'pay_arche', ep_from: 0, ep_to: 99, name: 'Payon Forest - Archer Village', top: 694, left: 985, width: 45, height: 51 },
                { id: 'payon', ep_from: 0, ep_to: 99, name: 'Payon Town, home of Archers', top: 746, left: 967, width: 46, height: 57 },

                { id: 'alberta', ep_from: 0, ep_to: 99, name: 'Alberta, City of Merchants', top: 913, left: 1059, width: 54, height: 51 },
                { id: 'alb2trea', ep_from: 0, ep_to: 99, name: 'Alberta Island', top: 920, left: 1114, width: 20, height: 24 },
                { id: 'tur_dun01', ep_from: 0, ep_to: 99, name: 'Turtle Island', top: 974, left: 1163, width: 29, height: 30 },

                { id: 'moc_fild01', ep_from: 0, ep_to: 99, name: 'Morroc Field 01 - Sograt Desert', top: 702, left: 812, width: 58, height: 58 },
                { id: 'moc_fild02', ep_from: 0, ep_to: 99, name: 'Morroc Field 02 - Sograt Desert', top: 761, left: 858, width: 48, height: 48 },
                { id: 'moc_fild03', ep_from: 0, ep_to: 99, name: 'Morroc Field 03 - Sograt Desert', top: 810, left: 883, width: 52, height: 58 },
                { id: 'moc_fild04', ep_from: 0, ep_to: 12, name: 'Morroc Field 04 - Sograt Desert', top: 785, left: 777, width: 57, height: 59 },
                { id: 'moc_fild05', ep_from: 0, ep_to: 12, name: 'Morroc Field 05 - Sograt Desert', top: 785, left: 718, width: 58, height: 59 },
                { id: 'moc_fild06', ep_from: 0, ep_to: 12, name: 'Morroc Field 06 - Sograt Desert', top: 785, left: 660, width: 57, height: 59 },
                { id: 'moc_fild07', ep_from: 0, ep_to: 99, name: 'Morroc Field 07 - Sograt Desert', top: 785, left: 603, width: 56, height: 59 },
                { id: 'moc_fild08', ep_from: 0, ep_to: 12, name: 'Morroc Field 08 - Sograt Desert', top: 845, left: 777, width: 57, height: 48 },
                { id: 'moc_fild09', ep_from: 0, ep_to: 12, name: 'Morroc Field 09 - Sograt Desert', top: 845, left: 718, width: 58, height: 48 },
                { id: 'moc_fild10', ep_from: 0, ep_to: 12, name: 'Morroc Field 10 - Sograt Desert', top: 845, left: 657, width: 60, height: 48 },
                { id: 'moc_fild11', ep_from: 0, ep_to: 99, name: 'Morroc Field 11 - Sograt Desert', top: 894, left: 660, width: 57, height: 56 },
                { id: 'moc_fild12', ep_from: 0, ep_to: 99, name: 'Morroc Field 12 - Sograt Desert', top: 894, left: 603, width: 56, height: 56 },
                { id: 'moc_fild13', ep_from: 0, ep_to: 99, name: 'Morroc Field 13 - Sograt Desert', top: 810, left: 836, width: 46, height: 58 },
                { id: 'moc_fild14', ep_from: 0, ep_to: 12, name: 'Morroc Field 14 - Sograt Desert', top: 894, left: 777, width: 57, height: 55 },
                { id: 'moc_fild15', ep_from: 0, ep_to: 12, name: 'Morroc Field 15 - Sograt Desert', top: 894, left: 718, width: 58, height: 44 },
                { id: 'moc_fild16', ep_from: 0, ep_to: 99, name: 'Morroc Field 16 - Sograt Desert', top: 939, left: 718, width: 58, height: 57 },
                { id: 'moc_fild17', ep_from: 0, ep_to: 99, name: 'Morroc Field 17 - Sograt Desert', top: 951, left: 660, width: 57, height: 58 },
                { id: 'moc_fild18', ep_from: 0, ep_to: 99, name: 'Morroc Field 18 - Sograt Desert', top: 951, left: 603, width: 56, height: 58 },
                { id: 'moc_fild19', ep_from: 0, ep_to: 99, name: 'Morroc Field 19 - Sograt Desert', top: 849, left: 567, width: 35, height: 32 },
                { id: 'moc_fild20', ep_from: 12, ep_to: 99, name: 'Morroc Field 20 - Sograt Desert - Continental Guard Quarantine', top: 838, left: 716, width: 58, height: 58 },
                // { id: 'moc_fild21', ep_from: 0, ep_to: 99, name: 'Morroc Field 21', top: 840, left: 660, width: 58, height: 58 },
                // { id: 'moc_fild22', ep_from: 0, ep_to: 99, name: 'Morroc Field 22 - Dimensional Gorge', top: 820, left: 710, width: 58, height: 58 },
                { id: 'moc_ruins', ep_from: 0, ep_to: 99, name: 'Morroc Ruins', top: 817, left: 567, width: 35, height: 31 },
                { id: 'morocc', ep_from: 0, ep_to: 99, name: 'Morroc Town', top: 845, left: 606, width: 49, height: 48 },

                { id: 'cmd_fild01', ep_from: 3, ep_to: 99, name: 'Comodo Field 01 - Papuchicha Forest', top: 835, left: 367, width: 58, height: 58 },
                { id: 'cmd_fild02', ep_from: 3, ep_to: 99, name: 'Comodo Field 02 - Kokomo beach', top: 894, left: 367, width: 58, height: 56 },
                { id: 'cmd_fild03', ep_from: 3, ep_to: 99, name: 'Comodo Field 03 - Zenhai Marsh', top: 835, left: 426, width: 57, height: 58 },
                { id: 'cmd_fild04', ep_from: 3, ep_to: 99, name: 'Comodo Field 04 - Kokomo beach', top: 894, left: 426, width: 57, height: 56 },
                { id: 'cmd_fild05', ep_from: 3, ep_to: 13.1, name: 'Comodo Field 05 - Border of Papuchica forest', top: 835, left: 484, width: 59, height: 58 },
                { id: 'cmd_fild06', ep_from: 3, ep_to: 99, name: 'Comodo Field 06 - Fortress Saint Darmain (West)', top: 894, left: 484, width: 59, height: 56 },
                { id: 'cmd_fild07', ep_from: 3, ep_to: 99, name: 'Comodo Field 07 - Beacon Island, Pharos', top: 951, left: 484, width: 59, height: 58 },
                { id: 'cmd_fild08', ep_from: 3, ep_to: 99, name: 'Comodo Field 08 - Fortress Saint Darmain (East)', top: 894, left: 544, width: 58, height: 56 },
                { id: 'cmd_fild09', ep_from: 3, ep_to: 99, name: 'Comodo Field 09 - Fortress Saint Darmain (South)', top: 951, left: 544, width: 58, height: 58 },
                { id: 'comodo', ep_from: 3, ep_to: 99, name: 'Comodo Town', top: 835, left: 297, width: 59, height: 58 },

                { id: 'um_fild01', ep_from: 0, ep_to: 99, name: 'Umbala Forest 01 - Luluka Forest', top: 776, left: 239, width: 57, height: 58 },
                { id: 'um_fild02', ep_from: 0, ep_to: 99, name: 'Umbala Forest 02 - Hoomga Forest', top: 776, left: 297, width: 59, height: 58 },
                { id: 'um_fild03', ep_from: 0, ep_to: 99, name: 'Umbala Forest 03 - Kalala Swamp', top: 776, left: 357, width: 59, height: 58 },
                { id: 'um_fild04', ep_from: 0, ep_to: 99, name: 'Umbala Forest 04 - Hoomga Jungle', top: 717, left: 297, width: 59, height: 58 },
                { id: 'umbala', ep_from: 0, ep_to: 99, name: 'Umbala Town', top: 660, left: 308, width: 48, height: 56 },

                { id: 'nameless_n', ep_from: 11.3, ep_to: 99, name: 'Nameless Island', top: 698, left: 94, width: 63, height: 62 },

            ],
        },
        // #endregion

        // #region Localize1 / Eastern Kingdoms
        {
            id: 'worldmap_localizing1', ep_from: 6, ep_to: 99, name: 'Eastern Kingdoms', maps: [
                { id: 'ama_fild01', ep_from: 6, ep_to: 99, name: 'Amatsu Field 01', top: 165, left: 332, width: 88, height: 88 },
                { id: 'amatsu', ep_from: 6, ep_to: 99, name: 'Amatsu', top: 256, left: 281, width: 88, height: 88 },
                { id: 'gon_fild01', ep_from: 6, ep_to: 99, name: 'Gonryun Field 01', top: 268, left: 911, width: 88, height: 88 },
                { id: 'gon_dun01', ep_from: 6, ep_to: 99, name: 'Gonryun Dungeon 01', top: 100, left: 1030, width: 88, height: 88 },
                { id: 'gonryun', ep_from: 6, ep_to: 99, name: 'Gonryun', top: 170, left: 906, width: 88, height: 88 },
                { id: 'lou_fild01', ep_from: 8.12, ep_to: 99, name: 'Louyang Field 01', top: 768, left: 276, width: 88, height: 88 },
                { id: 'lou_dun01', ep_from: 8.12, ep_to: 99, name: 'Louyang Dungeon 01', top: 672, left: 178, width: 88, height: 88 },
                { id: 'louyang', ep_from: 8.12, ep_to: 99, name: 'Louyang', top: 673, left: 276, width: 88, height: 88 },
                { id: 'ayo_fild01', ep_from: 8.2, ep_to: 99, name: 'Ayothaya Field 01', top: 734, left: 920, width: 88, height: 88 },
                { id: 'ayothaya', ep_from: 8.2, ep_to: 99, name: 'Ayothaya', top: 724, left: 827, width: 88, height: 88 },
            ],
        },
        // #endregion

        // #region Localize2 / Far Fields
        {
            id: 'worldmap_localizing2', ep_from: 12, ep_to: 99, name: 'Far Lands', maps: [
                { id: 'mosk_fild02', ep_from: 12, ep_to: 99, name: 'Moscovia Field 02', top: 299, left: 187, width: 88, height: 88 },
                { id: 'mosk_dun01', ep_from: 12, ep_to: 99, name: 'Moscovia Dungeon 01', top: 206, left: 185, width: 88, height: 88 },
                { id: 'mosk_dun02', ep_from: 12, ep_to: 99, name: 'Moscovia Dungeon 02', top: 111, left: 207, width: 88, height: 88 },
                { id: 'mosk_dun03', ep_from: 12, ep_to: 99, name: 'Moscovia Dungeon 03', top: 126, left: 307, width: 88, height: 88 },
                { id: 'moscovia', ep_from: 12, ep_to: 99, name: 'Moscovia', top: 332, left: 394, width: 110, height: 110 },
                { id: 'bra_fild01', ep_from: 13.2, ep_to: 99, name: 'Brasilis Field 01', top: 110, left: 998, width: 88, height: 88 },
                { id: 'brasilis', ep_from: 13.2, ep_to: 99, name: 'Brasilis', top: 255, left: 924, width: 88, height: 88 },
                { id: 'dew_fild01', ep_from: 14.1, ep_to: 99, name: 'Dewata Field (Tribal Village)', top: 668, left: 37, width: 88, height: 88 },
                { id: 'dew_dun01', ep_from: 14.1, ep_to: 99, name: 'Dewata Dungeon 01', top: 836, left: 337, width: 88, height: 88 },
                { id: 'dewata', ep_from: 14.1, ep_to: 99, name: 'Dewata', top: 712, left: 232, width: 88, height: 88 },
                { id: 'ma_fild01', ep_from: 14.1, ep_to: 99, name: 'Malaya Field 01 - Baryo Mahiwaga', top: 810, left: 956, width: 88, height: 88 },
                { id: 'ma_fild02', ep_from: 14.1, ep_to: 99, name: 'Malaya Field 02 - Forest', top: 713, left: 946, width: 88, height: 88 },
                { id: 'ma_scene01', ep_from: 14.1, ep_to: 99, name: 'Bakonawa Lake', top: 601, left: 1076, width: 88, height: 88 },
                { id: 'malaya', ep_from: 14.1, ep_to: 99, name: 'Malaya', top: 883, left: 832, width: 88, height: 88 },
            ],
        },
        // #endregion

        // #region Dimension / New World
        {
            id: 'worldmap_dimension', ep_from: 13.1, ep_to: 99, name: 'New World', maps: [
                { id: 'eclage', ep_from: 14.2, ep_to: 99, name: 'Eclage', top: 185, left: 393, width: 91, height: 91 },
                { id: 'ecl_fild01', ep_from: 14.2, ep_to: 99, name: 'Blooming Flower Land', top: 275, left: 393, width: 91, height: 91 },
                { id: 'mora', ep_from: 14.1, ep_to: 99, name: 'Mora Village', top: 365, left: 393, width: 91, height: 91 },
                { id: 'bif_fild01', ep_from: 14.1, ep_to: 99, name: 'Bifrost Bridge', top: 455, left: 393, width: 91, height: 91 },
                { id: 'splendide', ep_from: 13.2, ep_to: 99, name: 'Forest Village Splendide', top: 544, left: 393, width: 91, height: 91 },
                { id: 'spl_fild01', ep_from: 13.1, ep_to: 99, name: 'Splendide Field 01', top: 455, left: 483, width: 91, height: 91 },
                { id: 'spl_fild02', ep_from: 13.1, ep_to: 99, name: 'Splendide Field 02', top: 544, left: 483, width: 91, height: 91 },
                { id: 'spl_fild02', ep_from: 13.2, ep_to: 99, name: 'Splendide Field 03', top: 636, left: 483, width: 91, height: 91 },
                { id: 'mid_camp', ep_from: 13.1, ep_to: 99, name: 'Rune Midgard Allied Forces Post', top: 544, left: 573, width: 91, height: 91 },
                { id: 'man_fild01', ep_from: 13.1, ep_to: 99, name: 'Manuk Field 01', top: 544, left: 662, width: 91, height: 91 },
                { id: 'man_fild03', ep_from: 13.2, ep_to: 99, name: 'Manuk Field 03', top: 636, left: 662, width: 91, height: 91 },
                { id: 'man_fild02', ep_from: 13.1, ep_to: 99, name: 'Manuk Field 02', top: 544, left: 753, width: 91, height: 91 },
                { id: 'manuk', ep_from: 13.2, ep_to: 99, name: 'Mining Village Manuk', top: 636, left: 753, width: 91, height: 91 },
                { id: 'dicastes02', ep_from: 13.3, ep_to: 99, name: 'Dicastes Diel', top: 451, left: 978, width: 91, height: 91 },
                { id: 'dicastes01', ep_from: 13.3, ep_to: 99, name: 'El Dicastes, the Sapha Capital', top: 544, left: 978, width: 91, height: 91 },
                { id: 'dic_fild01', ep_from: 13.3, ep_to: 99, name: 'Outskirts of Kamidal Mountain 01', top: 636, left: 978, width: 91, height: 91 },
                { id: 'dic_fild02', ep_from: 13.3, ep_to: 99, name: 'Outskirts of Kamidal Mountain 02', top: 729, left: 978, width: 91, height: 91 },
            ],
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

    // Party member store
    let _partyMembersByMap = {};

    // Sizing params
    const C_TITLEBARHEIGHT = 17;
    const C_BASEWIDTH = 1280;
    const C_BASEHEIGHT = 1024;
    const C_ASPECTX = 5;
    const C_ASPECTY = 4;
    const C_DIALOG_BASEWIDTH = 512;
    const C_DIALOG_BASEHEIGHT = 512;
    const C_DIALOG_ASPECTX = 1;
    const C_DIALOG_ASPECTY = 1;
    const C_DIALOGPADDING = 20;

    /**
     * Initialize UI
     */
    WorldMap.init = function init () {
        this.ui.find('.titlebar .base').mousedown(stopPropagation);
        this.ui.find('.titlebar select').change(onSelect);
        this.ui.find('.titlebar .togglemaps').click(onToggleMaps);
        this.ui.find('.titlebar .close').click(onClose);

        // worldmap dialog
        this.ui.find('.map .content').on('click', onWorldMapClick);
        this.ui.find('#dialog-map-view').on('click', onWorldMapDialogClick);
    };


    /**
     * Create WorldMap list of maps (select Element)
     */
    function setMapList () {
        WorldMap.ui.find('#WorldMaps').html(function () {
            let list = '';
            for (const map of MAPS) {
                // list += '<option value="' + mapList[wmap].img + '">' + mapList[wmap].name + '</option>'
                // Episode check
                if (WorldMap.settings.episode >= map.ep_from && WorldMap.settings.episode < map.ep_to) {
                    list += `<option value="${map.id}">${map.name}</option>`;
                }
            }
            return list;
        });
    }


    function onSelect () {
        selectMap(WorldMap.ui.find('.titlebar select').val());
    }


    /**
     * Select world map
     *
     * @param {string} name eg. `"worldmap_localizing1"`
     */
    function selectMap (name = 'worldmap') {
        // load map image asset and render it
        Client.loadFile(DB.INTERFACE_PATH + name + '.bmp', (data) => {
            // find map data by name and render it
            for (const map of MAPS) {
                if (map.id === name) {
                    createWorldMapView(map, data);
                    resizeMap();
                    break;
                }
            }
        });
    }


    /**
     * Resize world map
     */
    function resizeMap () {

        const mapContainer = WorldMap.ui.find('.map-view');

        const currentwidth = Renderer.width;
        const currentheight = Renderer.height - C_TITLEBARHEIGHT;

        const xmult = currentwidth / C_BASEWIDTH;
        const ymult = currentheight / C_BASEHEIGHT;

        let mult = xmult;
        if (currentwidth / C_ASPECTX > currentheight / C_ASPECTY) {
            mult = ymult;
        }

        mapContainer.width(C_BASEWIDTH * mult);
        mapContainer.height(C_BASEHEIGHT * mult);

        const dialogImg = WorldMap.ui.find('#img-map-view');
        let d_width = C_DIALOG_BASEWIDTH;
        let d_height = C_DIALOG_BASEHEIGHT;
        if (currentwidth < C_DIALOG_BASEWIDTH + C_DIALOGPADDING || currentheight < C_DIALOG_BASEHEIGHT + C_DIALOGPADDING) {
            const d_xmult = (currentwidth - C_DIALOGPADDING) / C_DIALOG_BASEWIDTH;
            const d_ymult = (currentheight - C_DIALOGPADDING) / C_DIALOG_BASEHEIGHT;

            let mult = d_xmult;
            if (currentwidth / C_DIALOG_ASPECTX > currentheight / C_DIALOG_ASPECTY) {
                mult = d_ymult;
            }

            d_width = C_DIALOG_BASEWIDTH * mult;
            d_height = C_DIALOG_BASEHEIGHT * mult;
        }
        dialogImg.width(d_width);
        dialogImg.height(d_height);
    }


    /**
     * When worldmap container is clicked
     * @param {*} e
     */
    function onWorldMapClick (e) {
        // event delegation from .selection
        if (e.target.classList.contains('section')) {
            const dialog = WorldMap.ui.find('#dialog-map-view')[0];
            if (dialog == null) return;
            WorldMap.ui.find('#dialog-map-view .mapname').text(e.target.getAttribute('data-name'));
            WorldMap.ui.find('#dialog-map-view .mapid').text(e.target.id);

            dialog.showModal();

            const img = dialog.querySelector('#img-map-view');
            img.style.backgroundImage = '';

            // loader (now text)
            const loader = img.querySelector('#loader');
            loader.innerText = `Loading ${e.target.id}...`;

            // load the image
            Client.loadFile(`${DB.INTERFACE_PATH}map/${e.target.id}.bmp`, (data) => {
                // img.src = data;

                loader.innerText = '';
                img.style.backgroundImage = `url(${data})`;
                img.style.backgroundSize = 'cover';

                // try to adjust purple color transparency
                img.onload = () => adjustImageTransparency(img);
                // when image is loaded for 100% chance, then use this instead
                // adjustImageTransparency(img);
            });

            // display party member list on map
            let memberList = '';
            if (Array.isArray(_partyMembersByMap[e.target.id])) {
                _partyMembersByMap[e.target.id].forEach((member) => {
                    memberList += member.Name + '<br/>';
                });

            }
            WorldMap.ui.find('#dialog-map-view .memberlist').text(memberList);
        }
    }


    /**
     * When the user clicks outside of the dialog, close it
     *
     * @param {*} e
     * @returns
     */
    function onWorldMapDialogClick (e) {
        const dialog = WorldMap.ui.find('#dialog-map-view')[0];
        if (dialog == null) {
            return;
        }

        const dialogDimensions = dialog.getBoundingClientRect();
        if (
            e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom
        ) {
            closeMapDialog();
            return;
        }
        // close button
        if (e.target.id === 'dialog-close') {
            closeMapDialog();
            return;
        }
    }


    function closeMapDialog () {
        // Remove image (causes fps drop)
        WorldMap.ui.find('#img-map-view').attr('src', '');
        const dialog = WorldMap.ui.find('#dialog-map-view')[0];
        if (dialog) {
            dialog.close();
        }
    }


    /**
     * Create the .worldmap container and loop through all the maps
     * and render them to the container.
     *
     * @param {WorldMap} map world map data
     * @param {string} imgData world map image data as a base64
     */
    function createWorldMapView (map, imgData) {
        const container = WorldMap.ui.find('.map .content');
        const worldmap = document.createElement('div');
        const currentMap = MapRenderer.currentMap.replace(/\.gat$/i, '');

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

            //Episode & custom add/remove check
            if (((WorldMap.settings.episode >= section.ep_from && WorldMap.settings.episode < section.ep_to) || WorldMap.settings.add.includes(section.id)) && !WorldMap.settings.remove.includes(section.id)) {
                const el = document.createElement('div');
                const el_mapid = document.createElement('div');
                const el_mapname = document.createElement('div');

                el.id = section.id;

                if (currentMap == section.id) {
                    el.className = 'section currentmap';
                } else {
                    el.className = 'section';
                }

                el.style.top = `${section.top / C_BASEHEIGHT * 100}%`;
                el.style.left = `${section.left / C_BASEWIDTH * 100}%`;
                el.style.width = `${section.width / C_BASEWIDTH * 100}%`;
                el.style.height = `${section.height / C_BASEHEIGHT * 100}%`;
                el.setAttribute('data-name', section.name);
                el.title = section.name;

                el_mapname.className = 'mapname';
                el_mapname.innerHTML = section.name;

                el_mapid.className = 'mapid';
                el_mapid.innerHTML = section.id;

                el.appendChild(el_mapname);
                el.appendChild(el_mapid);
                mapView.appendChild(el);
            }
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
    function loadAirplane (mapView) {
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
    function setAirplanePosition (airplane) {
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
     * @example
     const img = document.querySelector('img');
         img.src = `textures/map/${e.target.id}.bmp`;
         img.onload = () => {
         adjustImageTransparency(img);
     };
     */
    function adjustImageTransparency (img) {
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
    WorldMap.onAppend = function onAppend () {
        // Apply preferences
        if (!_preferences.show) {
            this.ui.hide();
        }

        // settings
        this.settings = { episode: 98, add: [], remove: [] };
        const conf = Configs.get('worldMapSettings', { episode: 98, add: [], remove: [] });

        // Prevent stupidity
        if ('episode' in conf) {
            this.settings.episode = conf.episode;
        }

        if ('add' in conf && Array.isArray(conf.add)) {
            this.settings.add = conf.add;
        }

        if ('remove' in conf && Array.isArray(conf.remove)) {
            this.settings.remove = conf.remove;
        }

        console.log('%c[WoldMap] Episode: ', 'color:#007000', this.settings.episode);
        if (this.settings.add.length > 0) {
            console.log('%c[WoldMap] Add Maps: ', 'color:#007000', this.settings.add);
        }
        if (this.settings.remove.length > 0) {
            console.log('%c[WoldMap] Remove Maps: ', 'color:#007000', this.settings.remove);
        }

        // set maps
        setMapList();

        // resize map container & add sections
        selectMap();

        this.ui.css({
            top: 0,
            left: 0,
        });
    };

    WorldMap.onRemove = function onRemove () {
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
    WorldMap.toggle = function toggle () {
        this.ui.toggle();

        if (this.ui.is(':visible')) {
            this.focus();
        } else {
            closeMapDialog();
        }
    };

    /**
     * Process shortcut
     *
     * @param {object} key
     */
    WorldMap.onShortCut = function onShortCut (key) {
        switch (key.cmd) {
            case 'TOGGLE':
                this.toggle();
                break;
        }
    };

    /**
     * Resize UI
     */
    WorldMap.onResize = function () {
        resizeMap();
    };

    /**
     * Update party members on map
     *
     * @param {object} pkt
     */
    WorldMap.updatePartyMembers = function updatePartyMembers (pkt) {
        _partyMembersByMap = {};
        pkt.groupInfo.forEach((member) => {
            if (member.AID !== Session.AID && member.state === 0) {
                const mapId = member.mapName.replace(/\.gat$/i, '');
                if (!_partyMembersByMap[mapId]) {
                    _partyMembersByMap[mapId] = [];
                }
                _partyMembersByMap[mapId].push({ AID: member.AID, Name: member.characterName });
            }
        });

        WorldMap.ui.find('.worldmap .section').removeClass('membersonmap');
        for (const [mapId, members] of Object.entries(_partyMembersByMap)) {
            WorldMap.ui.find('.worldmap .section#' + mapId).addClass('membersonmap');
        }
    };


    /**
     * Toggle all maps
     */
    function onToggleMaps () {
        if (WorldMap.showAllMaps) {
            WorldMap.ui.find('.worldmap .section').removeClass('allmapvisible');
            WorldMap.showAllMaps = false;
        } else {
            WorldMap.ui.find('.worldmap .section').addClass('allmapvisible');
            WorldMap.showAllMaps = true;
        }
    }


    /**
     * Stop event propagation
     * @param {object} event
     */
    function stopPropagation (event) {
        event.stopImmediatePropagation();
        return false;
    }


    /**
     * Closing window
     */
    function onClose () {
        WorldMap.ui.hide();
    }


    /**
     * Create component and export it
     */
    return UIManager.addComponent(WorldMap);
});
