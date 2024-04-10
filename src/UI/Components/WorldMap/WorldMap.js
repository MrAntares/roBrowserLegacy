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
    const MapRenderer = require('Renderer/MapRenderer');
    const UIManager = require('UI/UIManager');
    const UIComponent = require('UI/UIComponent');
	const Session = require('Engine/SessionStorage');
    const htmlText = require('text!./WorldMap.html');
    const cssText = require('text!./WorldMap.css');

    /**
     * @type {WorldMap[]} map data
     */
    const MAPS = [
        // #region Midgard
        {
            id: 'worldmap', name: 'Midgard', maps: [
				{ id: 'hu_fild01', name: 'Hugel Field 01', top: 0, left: 695, width: 57, height: 57 },
				{ id: 'hu_fild02', name: 'Hugel Field 02', top: 0, left: 753, width: 58, height: 57 },
				{ id: 'hu_fild03', name: 'Hugel Field 03', top: 0, left: 811, width: 59, height: 57 },
				{ id: 'hu_fild04', name: 'Hugel Field 04', top: 58, left: 753, width: 58, height: 58 },
				{ id: 'hu_fild05', name: 'Hugel Field 05', top: 58, left: 812, width: 58, height: 58 },
				{ id: 'hu_fild06', name: 'Hugel Field 06', top: 58, left: 871, width: 56, height: 58 },
				{ id: 'hu_fild07', name: 'Hugel Field 07', top: 116, left: 811, width: 59, height: 57 },
				{ id: 'hugel', name: 'Hugel', top: 0, left: 871, width: 56, height: 57 },
				 
				{ id: 'ein_fild01', name: 'Einbroch Field 01', top: 58, left: 576, width: 59, height: 58 },
				{ id: 'ein_fild02', name: 'Einbroch Field 02', top: 116, left: 575, width: 60, height: 57 },
				{ id: 'ein_fild03', name: 'Einbroch Field 03', top: 174, left: 460, width: 57, height: 60 },
				{ id: 'ein_fild04', name: 'Einbroch Field 04', top: 174, left: 518, width: 57, height: 60 },
				{ id: 'ein_fild05', name: 'Einbroch Field 05', top: 174, left: 576, width: 59, height: 60 },
				{ id: 'ein_fild06', name: 'Einbroch Field 06', top: 174, left: 636, width: 58, height: 60 },
				{ id: 'ein_fild07', name: 'Einbroch Field 07', top: 235, left: 636, width: 58, height: 56 },
				{ id: 'ein_fild08', name: 'Einbroch Field 08', top: 292, left: 518, width: 57, height: 59 },
				{ id: 'ein_fild09', name: 'Einbroch Field 09', top: 292, left: 576, width: 59, height: 59 },
				{ id: 'ein_fild10', name: 'Einbroch Field 10', top: 292, left: 636, width: 58, height: 59 },
				{ id: 'einbroch', name: 'Einbroch', top: 235, left: 518, width: 57, height: 56 },
				{ id: 'einbech', name: 'Einbech', top: 245, left: 576, width: 59, height: 46 },
				 
				{ id: 'yuno_fild01', name: 'Yuno Field 01', top: 235, left: 812, width: 58, height: 56 },
				{ id: 'yuno_fild02', name: 'Yuno Field 02', top: 117, left: 753, width: 58, height: 56 },
				{ id: 'yuno_fild03', name: 'Yuno Field 03', top: 117, left: 707, width: 45, height: 56 },
				{ id: 'yuno_fild04', name: 'Yuno Field 04', top: 137, left: 636, width: 58, height: 36 },
				{ id: 'yuno_fild05', name: 'Yuno Field 05', top: 57, left: 635, width: 59, height: 59 },
				{ id: 'yuno_fild06', name: 'Yuno Field 06', top: 58, left: 707, width: 45, height: 58 },
				{ id: 'yuno_fild07', name: 'Yuno Field 07', top: 174, left: 695, width: 57, height: 60 },
				{ id: 'yuno_fild08', name: 'Yuno Field 08', top: 174, left: 753, width: 58, height: 60 },
				{ id: 'yuno_fild09', name: 'Yuno Field 09', top: 174, left: 812, width: 58, height: 60 },
				{ id: 'yuno_fild10', name: 'Yuno Field 10', top: 174, left: 871, width: 58, height: 60 },
				{ id: 'yuno_fild11', name: 'Yuno Field 11', top: 235, left: 695, width: 57, height: 56 },
				{ id: 'yuno_fild12', name: 'Yuno Field 12', top: 235, left: 753, width: 58, height: 56 },
				{ id: 'yuno', name: 'Yuno', top: 80, left: 644, width: 62, height: 56 },
				 
				{ id: 'odin_tem01', name: 'Odin Temple F1', top: 174, left: 988, width: 55, height: 60 },
				{ id: 'odin_tem02', name: 'Odin Temple F2', top: 174, left: 1044, width: 58, height: 60 },
				{ id: 'odin_tem03', name: 'Odin Temple F3', top: 117, left: 1044, width: 58, height: 56 },
				 
				{ id: 'lhz_fild01', name: 'Lighthalzen Field 01', top: 235, left: 401, width: 58, height: 56 },
				{ id: 'lhz_fild02', name: 'Lighthalzen Field 02', top: 235, left: 460, width: 57, height: 56 },
				{ id: 'lhz_fild03', name: 'Lighthalzen Field 03', top: 292, left: 460, width: 57, height: 59 },
				{ id: 'lighthalzen', name: 'Lighthalzen', top: 292, left: 401, width: 58, height: 54 },
				 
				{ id: 'ra_fild01', name: 'Rachel Field 01 - Audumra Grass Land', top: 117, left: 283, width: 58, height: 56 },
				{ id: 'ra_fild02', name: 'Rachel Field 02 - Oz Gorge', top: 174, left: 164, width: 59, height: 61 },
				{ id: 'ra_fild03', name: 'Rachel Field 03 - Ida Plane', top: 174, left: 224, width: 58, height: 61 },
				{ id: 'ra_fild04', name: 'Rachel Field 04 - Audumra Grass Land', top: 174, left: 283, width: 58, height: 60 },
				{ id: 'ra_fild05', name: 'Rachel Field 05 - Audumra Grass Land', top: 174, left: 342, width: 58, height: 60 },
				{ id: 'ra_fild06', name: 'Rachel Field 06 - Fortu Luna', top: 174, left: 401, width: 58, height: 60 },
				{ id: 'ra_fild07', name: 'Rachel Field 07 - Oz Gorge', top: 235, left: 164, width: 59, height: 58 },
				{ id: 'ra_fild08', name: 'Rachel Field 08 - Ida Plane', top: 235, left: 283, width: 58, height: 58 },
				{ id: 'ra_fild09', name: 'Rachel Field 09 - Audumra Grass Land', top: 235, left: 342, width: 58, height: 56 },
				{ id: 'ra_fild10', name: 'Rachel Field 10 - Oz Gorge', top: 292, left: 107, width: 56, height: 59 },
				{ id: 'ra_fild11', name: 'Rachel Field 11 - Ida Plane', top: 292, left: 164, width: 59, height: 59 },
				{ id: 'ra_fild12', name: 'Rachel Field 12 - Ida Plane', top: 292, left: 283, width: 58, height: 59 },
				{ id: 'ra_fild13', name: 'Rachel Field 13 - Beach of Tears', top: 352, left: 283, width: 58, height: 57 },
				{ id: 'ra_temple', name: 'Rachel Temple (Sesrumnis)', top: 261, left: 236, width: 35, height: 30 },
				{ id: 'rachel', name: 'Rachel, Capital of Arunafelz, the Study Nation', top: 292, left: 224, width: 58, height: 59 },
				 
				{ id: 've_fild01', name: 'Veins Field 01', top: 352, left: 164, width: 59, height: 57 },
				{ id: 've_fild02', name: 'Veins Field 02', top: 352, left: 224, width: 58, height: 57 },
				{ id: 'aru_gld', name: 'Arunafeltz Guild', top: 410, left: 224, width: 58, height: 58 },
				{ id: 've_fild03', name: 'Veins Field 03', top: 410, left: 107, width: 56, height: 58 },
				{ id: 've_fild04', name: 'Veins Field 04', top: 410, left: 164, width: 59, height: 58 },
				{ id: 've_fild05', name: 'Veins Field 05', top: 470, left: 106, width: 58, height: 58 },
				{ id: 've_fild06', name: 'Veins Field 06', top: 485, left: 164, width: 59, height: 42 },
				{ id: 've_fild07', name: 'Veins Field 07', top: 586, left: 161, width: 57, height: 57 },
				{ id: 'veins', name: 'Veins', top: 528, left: 161, width: 57, height: 57 },
				 
				{ id: 'aldebaran', name: 'Al De Baran', top: 292, left: 812, width: 58, height: 59 },
				{ id: 'alde_gld', name: 'Luina the satellite of Al De Baran', top: 292, left: 753, width: 58, height: 59 },
				{ id: 'mjolnir_01', name: 'Mt.Mjolnir 01', top: 411, left: 576, width: 59, height: 57 },
				{ id: 'mjolnir_02', name: 'Mt.Mjolnir 02', top: 411, left: 636, width: 58, height: 57 },
				{ id: 'mjolnir_03', name: 'Mt.Mjolnir 03', top: 411, left: 695, width: 57, height: 57 },
				{ id: 'mjolnir_04', name: 'Mt.Mjolnir 04', top: 411, left: 753, width: 58, height: 57 },
				{ id: 'mjolnir_05', name: 'Mt.Mjolnir 05', top: 411, left: 812, width: 58, height: 57 },
				{ id: 'mjolnir_06', name: 'Mt.Mjolnir 06', top: 469, left: 636, width: 58, height: 58 },
				{ id: 'mjolnir_07', name: 'Mt.Mjolnir 07', top: 469, left: 695, width: 57, height: 58 },
				{ id: 'mjolnir_08', name: 'Mt.Mjolnir 08', top: 469, left: 753, width: 58, height: 58 },
				{ id: 'mjolnir_09', name: 'Mt.Mjolnir 09', top: 528, left: 753, width: 58, height: 58 },
				{ id: 'mjolnir_10', name: 'Mt.Mjolnir 10', top: 469, left: 812, width: 58, height: 58 },
				{ id: 'mjolnir_11', name: 'Mt.Mjolnir 11', top: 469, left: 871, width: 56, height: 58 },
				{ id: 'mjolnir_12', name: 'Mt.Mjolnir 12', top: 352, left: 812, width: 58, height: 58 },
				 
				{ id: 'glast_01', name: 'Entrance to Glast Heim', top: 469, left: 408, width: 51, height: 58 },
				{ id: 'gef_fild00', name: 'Geffen Field 00', top: 528, left: 636, width: 58, height: 58 },
				{ id: 'gef_fild01', name: 'Geffen Field 01', top: 587, left: 636, width: 58, height: 56 },
				{ id: 'gef_fild02', name: 'Geffen Field 02', top: 644, left: 695, width: 57, height: 57 },
				{ id: 'gef_fild03', name: 'Geffen Field 03', top: 644, left: 636, width: 58, height: 57 },
				{ id: 'gef_fild04', name: 'Geffen Field 04', top: 469, left: 576, width: 59, height: 58 },
				{ id: 'gef_fild05', name: 'Geffen Field 05', top: 469, left: 518, width: 57, height: 58 },
				{ id: 'gef_fild06', name: 'Geffen Field 06', top: 469, left: 460, width: 57, height: 58 },
				{ id: 'gef_fild07', name: 'Geffen Field 07', top: 528, left: 518, width: 57, height: 58 },
				{ id: 'gef_fild08', name: 'Geffen Field 08', top: 528, left: 460, width: 57, height: 58 },
				{ id: 'gef_fild09', name: 'Geffen Field 09', top: 587, left: 576, width: 59, height: 56 },
				{ id: 'gef_fild10', name: 'Geffen Field 10', top: 644, left: 576, width: 59, height: 57 },
				{ id: 'gef_fild11', name: 'Geffen Field 11', top: 702, left: 576, width: 59, height: 58 },
				{ id: 'gef_fild12', name: 'Geffen Field 12 - Kordt Forest', top: 587, left: 460, width: 58, height: 56 },
				{ id: 'gef_fild13', name: 'Geffen Field 13 - Britoniah Guild (Geffen)', top: 587, left: 518, width: 57, height: 56 },
				{ id: 'gef_fild14', name: 'Geffen Field 14 - West Orc Village', top: 644, left: 518, width: 57, height: 57 },
				{ id: 'geffen', name: 'Geffen', top: 528, left: 576, width: 59, height: 58 },
				 
				{ id: 'prt_fild00', name: 'Prontera Field 00', top: 528, left: 695, width: 57, height: 58 },
				{ id: 'prt_fild01', name: 'Prontera Field 01', top: 528, left: 812, width: 58, height: 58 },
				{ id: 'prt_fild02', name: 'Prontera Field 02', top: 528, left: 871, width: 56, height: 58 },
				{ id: 'prt_fild03', name: 'Prontera Field 03', top: 528, left: 928, width: 58, height: 42 },
				{ id: 'prt_fild04', name: 'Prontera Field 04', top: 587, left: 695, width: 57, height: 56 },
				{ id: 'prt_fild05', name: 'Prontera Field 05', top: 587, left: 753, width: 58, height: 56 },
				{ id: 'prt_fild06', name: 'Prontera Field 06', top: 587, left: 871, width: 56, height: 56 },
				{ id: 'prt_fild07', name: 'Prontera Field 07', top: 644, left: 753, width: 58, height: 57 },
				{ id: 'prt_fild08', name: 'Prontera Field 08', top: 644, left: 812, width: 58, height: 57 },
				{ id: 'prt_fild09', name: 'Prontera Field 09', top: 702, left: 753, width: 58, height: 58 },
				{ id: 'prt_fild10', name: 'Prontera Field 10', top: 702, left: 695, width: 57, height: 58 },
				{ id: 'prt_fild11', name: 'Prontera Field 11', top: 702, left: 636, width: 58, height: 58 },
				{ id: 'prt_monk', name: 'Prontera Field - St. Capitolina Abbey', top: 528, left: 987, width: 55, height: 42 },
				{ id: 'prontera', name: 'Prontera', top: 587, left: 812, width: 58, height: 56 },
				 
				{ id: 'izlude', name: 'Izlude', top: 644, left: 871, width: 31, height: 32 },
				{ id: 'izlu2dun', name: 'Byalan Island', top: 644, left: 928, width: 20, height: 21 },
				 
				{ id: 'pay_fild01', name: 'Payon Forest 01', top: 804, left: 936, width: 58, height: 57 },
				{ id: 'pay_fild02', name: 'Payon Forest 02', top: 869, left: 960, width: 43, height: 62 },
				{ id: 'pay_fild03', name: 'Payon Forest 03', top: 885, left: 1004, width: 54, height: 46 },
				{ id: 'pay_fild04', name: 'Payon Forest 04', top: 702, left: 871, width: 56, height: 58 },
				{ id: 'pay_fild05', name: 'Payon Forest 05', top: 932, left: 960, width: 43, height: 57 },
				{ id: 'pay_fild06', name: 'Payon Forest 06', top: 932, left: 1004, width: 54, height: 57 },
				{ id: 'pay_fild07', name: 'Payon Forest 07', top: 804, left: 995, width: 58, height: 57 },
				{ id: 'pay_fild08', name: 'Payon Forest 08', top: 746, left: 1014, width: 39, height: 57 },
				{ id: 'pay_fild09', name: 'Payon Forest 09', top: 746, left: 1054, width: 59, height: 57 },
				{ id: 'pay_fild10', name: 'Payon Forest 10', top: 804, left: 1054, width: 59, height: 57 },
				{ id: 'pay_fild11', name: 'Payon Forest 11', top: 869, left: 907, width: 53, height: 62 },
				// { id: 'pay_gld', name: 'Payon Forest - Greenwood Lake (Guild)', top: 764, left: 910, width: 58, height: 58 },
				{ id: 'pay_arche', name: 'Payon Forest - Archer Village', top: 694, left: 985, width: 45, height: 51 },
				{ id: 'payon', name: 'Payon Town, home of Archers', top: 746, left: 967, width: 46, height: 57 },
				 
				{ id: 'alberta', name: 'Alberta, City of Merchants', top: 913, left: 1059, width: 54, height: 51 },
				{ id: 'alb2trea', name: 'Alberta Island', top: 920, left: 1114, width: 20, height: 24 },
				{ id: 'tur_dun01', name: 'Turtle Island', top: 974, left: 1163, width: 29, height: 30 },
				 
				{ id: 'moc_fild01', name: 'Morroc Field 01', top: 702, left: 812, width: 58, height: 58 },
				{ id: 'moc_fild02', name: 'Morroc Field 02', top: 761, left: 858, width: 48, height: 48 },
				{ id: 'moc_fild03', name: 'Morroc Field 03', top: 810, left: 883, width: 52, height: 58 },
				{ id: 'moc_fild04', name: 'Morroc Field 04', top: 785, left: 777, width: 57, height: 59 },
				{ id: 'moc_fild05', name: 'Morroc Field 05', top: 785, left: 718, width: 58, height: 59 },
				{ id: 'moc_fild06', name: 'Morroc Field 06', top: 785, left: 660, width: 57, height: 59 },
				{ id: 'moc_fild07', name: 'Morroc Field 07', top: 785, left: 603, width: 56, height: 59 },
				{ id: 'moc_fild08', name: 'Morroc Field 08', top: 845, left: 777, width: 57, height: 48 },
				{ id: 'moc_fild09', name: 'Morroc Field 09', top: 845, left: 718, width: 58, height: 48 },
				{ id: 'moc_fild10', name: 'Morroc Field 10', top: 845, left: 657, width: 60, height: 48 },
				{ id: 'moc_fild11', name: 'Morroc Field 11', top: 894, left: 660, width: 57, height: 56 },
				{ id: 'moc_fild12', name: 'Morroc Field 12', top: 894, left: 603, width: 56, height: 56 },
				{ id: 'moc_fild13', name: 'Morroc Field 13', top: 810, left: 836, width: 46, height: 58 },
				{ id: 'moc_fild14', name: 'Morroc Field 14', top: 894, left: 777, width: 57, height: 55 },
				{ id: 'moc_fild15', name: 'Morroc Field 15', top: 894, left: 718, width: 58, height: 44 },
				{ id: 'moc_fild16', name: 'Morroc Field 16', top: 939, left: 718, width: 58, height: 57 },
				{ id: 'moc_fild17', name: 'Morroc Field 17', top: 951, left: 660, width: 57, height: 58 },
				{ id: 'moc_fild18', name: 'Morroc Field 18', top: 951, left: 603, width: 56, height: 58 },
				{ id: 'moc_fild19', name: 'Morroc Field 19', top: 849, left: 567, width: 35, height: 32 },
				// { id: 'moc_fild20', name: 'Morroc Field 20', top: 838, left: 716, width: 58, height: 58 },
				// { id: 'moc_fild21', name: 'Morroc Field 21', top: 840, left: 660, width: 58, height: 58 },
				// { id: 'moc_fild22', name: 'Morroc Field 22', top: 820, left: 710, width: 58, height: 58 },
				{ id: 'moc_ruins', name: 'Morroc Field - Sograt Desert - Morroc Ruins', top: 817, left: 567, width: 35, height: 31 },
				{ id: 'morocc', name: 'Morroc Town', top: 845, left: 606, width: 49, height: 48 },
				 
				{ id: 'cmd_fild01', name: 'Comodo Field 01 - Papuchicha Forest', top: 835, left: 367, width: 58, height: 58 },
				{ id: 'cmd_fild02', name: 'Comodo Field 02 - Kokomo beach', top: 894, left: 367, width: 58, height: 56 },
				{ id: 'cmd_fild03', name: 'Comodo Field 03 - Zenhai Marsh', top: 835, left: 426, width: 57, height: 58 },
				{ id: 'cmd_fild04', name: 'Comodo Field 04 - Kokomo beach', top: 894, left: 426, width: 57, height: 56 },
				{ id: 'cmd_fild05', name: 'Comodo Field 05 - Border of Papuchica forest', top: 835, left: 484, width: 59, height: 58 },
				{ id: 'cmd_fild06', name: 'Comodo Field 06 - Fortress Saint Darmain (West)', top: 894, left: 484, width: 59, height: 56 },
				{ id: 'cmd_fild07', name: 'Comodo Field 07 - Beacon Island, Pharos', top: 951, left: 484, width: 59, height: 58 },
				{ id: 'cmd_fild08', name: 'Comodo Field 08 - Fortress Saint Darmain (East)', top: 894, left: 544, width: 58, height: 56 },
				{ id: 'cmd_fild09', name: 'Comodo Field 09 - Fortress Saint Darmain (South)', top: 951, left: 544, width: 58, height: 58 },
				{ id: 'comodo', name: 'Comodo Town', top: 835, left: 297, width: 59, height: 58 },
				 
				{ id: 'um_fild01', name: 'Umbala Forest 01', top: 776, left: 239, width: 57, height: 58 },
				{ id: 'um_fild02', name: 'Umbala Forest 02', top: 776, left: 297, width: 59, height: 58 },
				{ id: 'um_fild03', name: 'Umbala Forest 03', top: 776, left: 357, width: 59, height: 58 },
				{ id: 'um_fild04', name: 'Umbala Forest 04', top: 717, left: 297, width: 59, height: 58 },
				{ id: 'umbala', name: 'Umbala Town', top: 660, left: 308, width: 48, height: 56 },
				 
				{ id: 'nameless_n', name: 'Nameless Island', top: 698, left: 94, width: 63, height: 62 },

            ]
        },
        // #endregion

        // #region Localize1 / Eastern Kingdoms
        {
            id: 'worldmap_localizing1', name: 'Eastern Kingdoms', maps: [
                { id: 'ama_fild01', name: 'Amatsu Field 01', top: 165, left: 332, width: 88, height: 88 },
                { id: 'amatsu', name: 'Amatsu', top: 256, left: 281, width: 88, height: 88 },
                { id: 'gon_fild01', name: 'Gonryun Field 01', top: 268, left: 911, width: 88, height: 88 },
                { id: 'gon_dun01', name: 'Gonryun Dungeon 01', top: 100, left: 1030, width: 88, height: 88 },
                { id: 'gonryun', name: 'Gonryun', top: 170, left: 906, width: 88, height: 88 },
                { id: 'lou_fild01', name: 'Louyang Field 01', top: 768, left: 276, width: 88, height: 88 },
                { id: 'lou_dun01', name: 'Louyang Dungeon 01', top: 672, left: 178, width: 88, height: 88 },
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
                { id: 'mosk_dun01', name: 'Moscovia Dungeon 01', top: 206, left: 185, width: 88, height: 88 },
                { id: 'mosk_dun02', name: 'Moscovia Dungeon 02', top: 111, left: 207, width: 88, height: 88 },
                { id: 'mosk_dun03', name: 'Moscovia Dungeon 03', top: 126, left: 307, width: 88, height: 88 },
                { id: 'moscovia', name: 'Moscovia', top: 332, left: 394, width: 110, height: 110 },
                { id: 'bra_fild01', name: 'Brasilis Field 01', top: 110, left: 998, width: 88, height: 88 },
                { id: 'brasilis', name: 'Brasilis', top: 255, left: 924, width: 88, height: 88 },
                { id: 'dew_fild01', name: 'Dewata Field 01', top: 668, left: 37, width: 88, height: 88 },
                { id: 'dew_dun01', name: 'Dewata Dungeon 01', top: 836, left: 337, width: 88, height: 88 },
                { id: 'dewata', name: 'Dewata', top: 712, left: 232, width: 88, height: 88 },
                { id: 'ma_fild01', name: 'Malaya Field - Baryo Mahiwaga', top: 810, left: 956, width: 88, height: 88 },
                { id: 'ma_fild02', name: 'Malaya Field - Forest', top: 713, left: 946, width: 88, height: 88 },
                { id: 'ma_scene01', name: 'Malaya Field - Bakonawa Lake', top: 601, left: 1076, width: 88, height: 88 },
                { id: 'malaya', name: 'Malaya', top: 883, left: 832, width: 88, height: 88 },
            ]
        },
        // #endregion

        // #region Dimension / New World
        {
            id: 'worldmap_dimension', name: 'New World', maps: [
				{ id: 'eclage', name: 'Eclage', top: 185, left: 393, width: 91, height: 91 },
				{ id: 'ecl_fild01', name: 'Blooming Flower Land', top: 275, left: 393, width: 91, height: 91 },
				{ id: 'mora', name: 'Mora Village', top: 365, left: 393, width: 91, height: 91 },
				{ id: 'bif_fild01', name: 'Bifrost Bridge', top: 455, left: 393, width: 91, height: 91 },
				{ id: 'splendide', name: 'Forest Village Splendide', top: 544, left: 393, width: 91, height: 91 },
				{ id: 'spl_fild01', name: 'Splendide Field 01', top: 455, left: 483, width: 91, height: 91 },
				{ id: 'spl_fild02', name: 'Splendide Field 02', top: 544, left: 483, width: 91, height: 91 },
				{ id: 'spl_fild02', name: 'Splendide Field 03', top: 636, left: 483, width: 91, height: 91 },
				{ id: 'mid_camp', name: 'Rune Midgard Allied Forces Post', top: 544, left: 573, width: 91, height: 91 },
				{ id: 'man_fild01', name: 'Manuk Field 01', top: 544, left: 662, width: 91, height: 91 },
				{ id: 'man_fild03', name: 'Manuk Field 03', top: 636, left: 662, width: 91, height: 91 },
				{ id: 'man_fild02', name: 'Manuk Field 02', top: 544, left: 753, width: 91, height: 91 },
				{ id: 'manuk', name: 'Mining Village Manuk', top: 636, left: 753, width: 91, height: 91 },
				{ id: 'dicastes02', name: 'Dicastes Diel', top: 451, left: 978, width: 91, height: 91 },
				{ id: 'dicastes01', name: 'El Dicastes, the Sapha Capital', top: 544, left: 978, width: 91, height: 91 },
				{ id: 'dic_fild01', name: 'Outskirts of Kamidal Mountain 01', top: 636, left: 978, width: 91, height: 91 },
				{ id: 'dic_fild02', name: 'Outskirts of Kamidal Mountain 02', top: 729, left: 978, width: 91, height: 91 },
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
	
	// Party member store
	let _partyMembersByMap = {};

    /**
     * Initialize UI
     */
    WorldMap.init = function init() {
        this.ui.find('.titlebar .base').mousedown(stopPropagation);
        this.ui.find('.titlebar select').change(onSelect);
        this.ui.find('.titlebar .togglemaps').click(onToggleMaps);
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
			WorldMap.ui.find('#dialog-map-view .mapname').text(e.target.getAttribute('data-name'));
			WorldMap.ui.find('#dialog-map-view .mapid').text(e.target.id);
			
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
			
			
			// display party member list on map
			let memberList = "";
			if(Array.isArray(_partyMembersByMap[e.target.id])){
				_partyMembersByMap[e.target.id].forEach((member) => {
					memberList += member.Name+'<br/>';
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
            const el = document.createElement('div');
			const el_mapid = document.createElement('div');
			const el_mapname = document.createElement('div');
			
			
            el.id = section.id;
			
            if(currentMap == section.id){
				el.className = 'section currentmap';
			} else {
				el.className = 'section';
			}
			
            el.style.top = `${section.top}px`;
            el.style.left = `${section.left}px`;
            el.style.width = `${section.width}px`;
            el.style.height = `${section.height}px`;
            el.setAttribute('data-name', section.name);
			el.title = section.name;
			
			el_mapname.className = 'mapname';
			el_mapname.innerHTML = section.name;
			
			el_mapid.className = 'mapid';
			el_mapid.innerHTML = section.id;
			
			el.appendChild(el_mapname);
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
     * Update party members on map
     *
     * @param {object} key
     */
	WorldMap.updatePartyMembers = function updatePartyMembers(pkt){
		_partyMembersByMap = {};
		pkt.groupInfo.forEach((member) => {
			if(member.AID !== Session.AID && member.state === 0){
				const mapId = member.mapName.replace(/\.gat$/i, '')
				if(!_partyMembersByMap[mapId]){
					_partyMembersByMap[mapId] = [];
				}
				_partyMembersByMap[mapId].push({ AID: member.AID, Name: member.characterName});
			}
		});
		
		WorldMap.ui.find('.worldmap .section').removeClass('membersonmap');
		for (const [mapId, members] of Object.entries(_partyMembersByMap)) {
			WorldMap.ui.find('.worldmap .section#'+mapId).addClass('membersonmap');
		}
	}
	
	/**
     * Toggle all maps
     */
	function onToggleMaps(){
		if(WorldMap.showAllMaps){
			WorldMap.ui.find('.worldmap .section').removeClass('allmapvisible');
			WorldMap.showAllMaps = false;
		} else {
			WorldMap.ui.find('.worldmap .section').addClass('allmapvisible');
			WorldMap.showAllMaps = true;
		}
	}

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
