/**
 * Engine/MapEngine/UIOpen.js
 *
 * Manage some UI open when requested by server
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require) {
    'use strict';

    var Configs          = require('Core/Configs');
    var Network = require('Network/NetworkManager');
    var PACKET = require('Network/PacketStructure');
    var PACKETVER   = require('Network/PacketVerManager');

    /**
     * Load dependencies
     */
    var PACKET = require('Network/PacketStructure');


    /**
     * Received data and request to open a specific UI
     *
     * @param {object} pkt - PACKET.ZC.UI_OPEN
     */
    function onUIOpen(pkt) {
        // Opens an UI window of the given type and initializes it with the given data
        // 0AE2 <type>.B <data>.L
        // type:
        //    0 = BANK_UI
        //    1 = STYLIST_UI
        //    2 = CAPTCHA_UI
        //    3 = MACRO_UI
        //    4 = UI_UNUSED
        //    5 = TIPBOX_UI
        //    6 = RENEWQUEST_UI
        //    7 = ATTENDANCE_UI
        //    8 = ENCHANTGRADE_UI
        //    9 = CHANGE_MATERIAL_UI
        //    10 = ENCHANT_UI

        switch (pkt.ui_type) {
            case 7:
                if (Configs.get('enableCheckAttendance') && PACKETVER.value >= 20180307) {
                    var CheckAttendance = require('UI/Components/CheckAttendance/CheckAttendance');
                    CheckAttendance.prepare();
                    CheckAttendance.setData(pkt.data);
                    CheckAttendance.cleanUI();
                    CheckAttendance.append();
                    CheckAttendance.ui.show();
                    CheckAttendance.ui.focus();
                }
                break;
            case 8:
                if (PACKETVER.value >= 20200724) {
                    var EnchantGradeUI = require('UI/Components/EnchantGrade/EnchantGrade');
                    EnchantGradeUI.prepare();
                    EnchantGradeUI.onOpenEnchantGradeUI();
                }
                break;
            default:
                console.error(`[PACKET.ZC.UI_OPEN] not implemented (${pkt.ui_type})`);
        }
    }

    /**
     * Initialize
     */
    return function MainEngine() {
        Network.hookPacket(PACKET.ZC.UI_OPEN, onUIOpen);
    };
});
