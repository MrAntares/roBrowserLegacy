/**
 * Network/PacketVersions.js
 *
 * Class to list all packets versions
 * Based on : https://github.com/HerculesWS/Hercules/blob/master/src/map/packets.h
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define(['./PacketStructure'], function (PACKET) {
    'use strict';

    return {
        // BASE PACKET VERSION
        0: [
            [PACKET.CZ.ENTER, 0x0072, 19, 2, 6, 10, 14, 18],
            //packet(0x007d, 2, clif -> pLoadEndAck, 0);
            [PACKET.CZ.REQUEST_TIME, 0x007e, 6, 2],
            [PACKET.CZ.REQUEST_MOVE, 0x0085, 5, 2],
            [PACKET.CZ.REQUEST_ACT, 0x0089, 7, 2, 6],
            [PACKET.CZ.REQUEST_CHAT, 0x008c, -1, 2, 4],
            //packet(0x0090,7,clif->pNpcClicked,2);
            [PACKET.CZ.REQNAME, 0x0094, 6, 2],
            //packet(0x0096,-1,clif->pWisMessage,2,4,28);
            //packet(0x0099,-1,clif->pBroadcast,2,4);
            [PACKET.CZ.CHANGE_DIRECTION, 0x009b, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x009f, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x00a2, 6, 2, 4],
            [PACKET.CZ.USE_ITEM, 0x00a7, 8, 2, 4],
            [PACKET.CZ.REQ_WEAR_EQUIP, 0x00a9, 6, 2, 4],
            //packet(0x00ab,4,clif->pUnequipItem,2);
            //packet(0x00b2,3,clif->pRestart,2);
            //packet(0x00b8,7,clif->pNpcSelectMenu,2,6);
            //packet(0x00b9, 6, clif -> pNpcNextClicked, 2);
            //packet(0x00bb,5,clif->pStatusUp,2,4);
            //packet(0x00bf,3,clif->pEmotion,2);
            //packet(0x00c1,2,clif->pHowManyConnections,0);
            //packet(0x00c5,7,clif->pNpcBuySellSelected,2,6);
            //packet(0x00c8,-1,clif->pNpcBuyListSend,2,4);
            //packet(0x00c9,-1,clif->pNpcSellListSend,2,4);
            //packet(0x00cc,6,clif->pGMKick,2);
            //packet(0x00ce,2,clif->pGMKickAll,0);
            //packet(0x00cf,27,clif->pPMIgnore,2,26);
            //packet(0x00d0,3,clif->pPMIgnoreAll,2);
            //packet(0x00d3,2,clif->pPMIgnoreList,0);
            //packet(0x00d5,-1,clif->pCreateChatRoom,2,4,6,7,15);
            //packet(0x00d9,14,clif->pChatAddMember,2,6);
            //packet(0x00de,-1,clif->pChatRoomStatusChange,2,4,6,7,15);
            //packet(0x00e0,30,clif->pChangeChatOwner,2,6);
            //packet(0x00e2,26,clif->pKickFromChat,2);
            //packet(0x00e3,2,clif->pChatLeave,0);
            //packet(0x00e4,6,clif->pTradeRequest,2);
            //packet(0x00e6,3,clif->pTradeAck,2);
            //packet(0x00e8,8,clif->pTradeAddItem,2,4);
            //packet(0x00eb,2,clif->pTradeOk,0);
            //packet(0x00ed,2,clif->pTradeCancel,0);
            //packet(0x00ef,2,clif->pTradeCommit,0);
            [PACKET.CZ.REQ_TAKEOFF_EQUIP, 0x00ab, 4, 2],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x00f3, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x00f5, 8, 2, 4],
            [PACKET.CZ.CLOSE_STORE, 0x00f7, 2, 0],
            //packet(0x00f9,26,clif->pCreateParty,2);
            //packet(0x00fc,6,clif->pPartyInvite,2);
            //packet(0x00ff,10,clif->pReplyPartyInvite,2,6);
            //packet(0x0100,2,clif->pLeaveParty,0);
            //packet(0x0102,6,clif->pPartyChangeOption,2);
            //packet(0x0103,30,clif->pRemovePartyMember,2,6);
            //packet(0x0108,-1,clif->pPartyMessage,2,4);
            //packet(0x0112,4,clif->pSkillUp,2);
            [PACKET.CZ.USE_SKILL, 0x0113, 10, 2, 4, 6],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0116, 10, 2, 4, 6, 8],
            //packet(0x0118,2,clif->pStopAttack,0);
            //packet(0x011b, 20, clif -> pUseSkillMap, 2, 4);
            //packet(0x011d,2,clif->pRequestMemo,0);
            //packet(0x0126, 8, clif -> pPutItemToCart, 2, 4);
            //packet(0x0127,8, clif-> pGetItemFromCart, 2, 4);
            //packet(0x0128, 8, clif -> pMoveFromKafraToCart, 2, 4);
            //packet(0x0129, 8, clif -> pMoveToKafraFromCart, 2, 4);
            //packet(0x012a, 2, clif -> pRemoveOption, 0);
            /*packet(0x012e, 2, clif -> pCloseVending, 0);
            packet(0x012f,- 1);
            packet(0x0130, 6, clif -> pVendingListReq, 2);
            packet(0x0131, 86);
            packet(0x0132, 6);
            packet(0x0133, -1);
            packet(0x0134, -1, clif -> pPurchaseReq, 2, 4, 8);
            packet(0x0135, 7);
            packet(0x0136, -1);
            packet(0x0137, 6);
            packet(0x0138, 3);
            packet(0x0139, 16);
            packet(0x013a, 4);
            packet(0x013b, 4);
            packet(0x013c, 4);
            packet(0x013d, 6);
            packet(0x013e, 24);
            packet(0x013f, 26, clif -> pGM_Monster_Item, 2);
            packet(0x0140, 22, clif -> pMapMove, 2, 18, 20);
            packet(0x0141, 14);
            packet(0x0142, 6);
            packet(0x0143, 10, clif -> pNpcAmountInput, 2, 6);
            packet(0x0144, 23);
            packet(0x0145, 19);
            packet(0x0146, 6, clif -> pNpcCloseClicked, 2);
            packet(0x0147, 39);
            packet(0x0148, 8);
            packet(0x0149, 9, clif -> pGMReqNoChat, 2, 6, 7);
            packet(0x014a, 6);
            packet(0x014b, 27);
            packet(0x014c, -1);
            packet(0x014d, 2, clif -> pGuildCheckMaster, 0);
            packet(0x014e, 6);
            packet(0x014f, 6, clif -> pGuildRequestInfo, 2);
            packet(0x0150, 110);
            packet(0x0151, 6, clif -> pGuildRequestEmblem, 2);
            packet(0x0152, -1);
            packet(0x0153, -1, clif -> pGuildChangeEmblem, 2, 4);
            packet(0x0154, -1);
            packet(0x0155, -1, clif -> pGuildChangeMemberPosition, 2);
            packet(0x0156, -1);
            packet(0x0157, 6);
            packet(0x0158, -1);
            packet(0x0159, 54, clif -> pGuildLeave, 2, 6, 10, 14);
            packet(0x015a, 66);
            packet(0x015b, 54, clif -> pGuildExpulsion, 2, 6, 10, 14);
            packet(0x015c, 90);
            packet(0x015d, 42, clif -> pGuildBreak, 2);
            packet(0x015e, 6);
            packet(0x015f, 42);
            packet(0x0160, -1);
            packet(0x0161, -1, clif -> pGuildChangePositionInfo, 2);
            packet(0x0162, -1);
            packet(0x0163, -1);
            packet(0x0164, -1);
            packet(0x0165, 30, clif -> pCreateGuild, 6);
            packet(0x0166, -1);
            packet(0x0167, 3);
            packet(0x0168, 14, clif -> pGuildInvite, 2);
            packet(0x0169, 3);
            packet(0x016a, 30);
            packet(0x016b, 10, clif -> pGuildReplyInvite, 2, 6);
            packet(0x016c, 43);
            packet(0x016d, 14);
            packet(0x016e, 186, clif -> pGuildChangeNotice, 2, 6, 66);
            packet(0x016f, 182);
            packet(0x0170, 14, clif -> pGuildRequestAlliance, 2);
            packet(0x0171, 30);
            packet(0x0172, 10, clif -> pGuildReplyAlliance, 2, 6);
            packet(0x0173, 3);
            packet(0x0174, -1);
            packet(0x0175, 6);
            packet(0x0176, 106);
            packet(0x0177, -1);
            packet(0x0178, 4, clif -> pItemIdentify, 2);
            packet(0x0179, 5);
            packet(0x017a, 4, clif -> pUseCard, 2);
            packet(0x017b, -1);
            packet(0x017c, 6, clif -> pInsertCard, 2, 4);
            packet(0x017d, 7);
            packet(0x017e, -1, clif -> pGuildMessage, 2, 4);
            packet(0x017f, -1);
            packet(0x0180, 6, clif -> pGuildOpposition, 2);
            packet(0x0181, 3);
            packet(0x0182, 106);
            packet(0x0183, 10, clif -> pGuildDelAlliance, 2, 6);
            packet(0x0184, 10);
            packet(0x0185, 34);
            //packet(0x0186,-1);
            packet(0x0187, 6);
            packet(0x0188, 8);
            packet(0x0189, 4);
            packet(0x018a, 4, clif -> pQuitGame, 0);
            packet(0x018b, 4);
            packet(0x018c, 29);
            packet(0x018d, -1);
            packet(0x018e, 10, clif -> pProduceMix, 2, 4, 6, 8);*/
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0190, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME_BYGID, 0x0193, 6, 2],
            //packet(0x0197, 4, clif -> pResetChar, 2);
            //packet(0x0198,8, clif-> pGMChangeMapType, 2, 4, 6);
            [PACKET.CZ.REQ_ACCOUNTNAME, 0x01df, 6, 2],
            [PACKET.CZ.REQ_ITEMREPAIR, 0x01fd, 4, 2],
            [PACKET.CZ.ADD_FRIENDS, 0x0202, 26, 2],
            [PACKET.CZ.ACK_REQ_ADD_FRIENDS, 0x0208, 11, 2, 6, 10],
        ],

        //2004-07-05aSakexe
        20040705: [
            [PACKET.CZ.ENTER, 0x0072, 22, 5, 9, 13, 17, 21],
            [PACKET.CZ.REQUEST_MOVE, 0x0085, 8, 5],
            [PACKET.CZ.USE_ITEM, 0x00a7, 13, 5, 9],
            [PACKET.CZ.USE_SKILL, 0x0113, 15, 4, 9, 11],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0116, 15, 4, 9, 11, 13],
            [
                PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo,
                0x0190,
                95,
                4,
                9,
                11,
                13,
                15,
            ],
            [PACKET.CZ.ACK_REQ_ADD_FRIENDS, 0x0208, 14, 2, 6, 10],
        ],

        //2004-07-13aSakexe
        20040713: [
            [PACKET.CZ.ENTER, 0x0072, 39, 12, 22, 30, 34, 38],
            [PACKET.CZ.REQUEST_MOVE, 0x0085, 9, 6],
            [PACKET.CZ.CHANGE_DIRECTION, 0x009b, 13, 5, 12],
            [PACKET.CZ.ITEM_PICKUP, 0x009f, 10, 6],
            [PACKET.CZ.USE_ITEM, 0x00a7, 17, 6, 13],
            [PACKET.CZ.USE_SKILL, 0x0113, 19, 7, 9, 15],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0116, 19, 7, 9, 15, 17],
            [
                PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo,
                0x0190,
                99,
                7,
                9,
                15,
                17,
                19,
            ],
        ],

        //2004-07-26aSakexe
        20040726: [
            [PACKET.CZ.ITEM_THROW, 0x0072, 14, 5, 12],
            [PACKET.CZ.ENTER, 0x007e, 33, 12, 18, 24, 28, 32],
            [PACKET.CZ.USE_SKILL, 0x0085, 20, 7, 12, 16],
            [PACKET.CZ.REQNAME, 0x0089, 15, 11],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x008c, 23, 3, 6, 17, 21],
            [PACKET.CZ.ITEM_PICKUP, 0x0094, 10, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x009b, 6, 3],
            [PACKET.CZ.CHANGE_DIRECTION, 0x009f, 13, 5, 12],
            [
                PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo,
                0x00a2,
                103,
                3,
                6,
                17,
                21,
                23,
            ],
            [PACKET.CZ.REQNAME_BYGID, 0x00a7, 12, 8],
            [PACKET.CZ.REQUEST_CHAT, 0x00f3, -1, 2, 4],
            [PACKET.CZ.USE_ITEM, 0x00f5, 17, 6, 12],
            [PACKET.CZ.REQUEST_TIME, 0x00f7, 10, 6],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0113, 16, 5, 12],
            [PACKET.CZ.CLOSE_STORE, 0x0116, 2, 0],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0190, 26, 10, 22],
            [PACKET.CZ.REQUEST_ACT, 0x0193, 9, 3, 8],
        ],

        //2004-08-09aSakexe
        20040809: [
            [PACKET.CZ.ITEM_THROW, 0x0072, 17, 8, 15],
            [PACKET.CZ.ENTER, 0x007e, 37, 9, 21, 28, 32, 36],
            [PACKET.CZ.USE_SKILL, 0x0085, 26, 11, 18, 22],
            [PACKET.CZ.REQNAME, 0x0089, 12, 8],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x008c, 40, 5, 15, 29, 38],
            [PACKET.CZ.ITEM_PICKUP, 0x0094, 13, 9],
            [PACKET.CZ.REQUEST_MOVE, 0x009b, 15, 12],
            [PACKET.CZ.CHANGE_DIRECTION, 0x009f, 12, 7, 11],
            [
                PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo,
                0x00a2,
                120,
                5,
                15,
                29,
                38,
                40,
            ],
            [PACKET.CZ.REQNAME_BYGID, 0x00a7, 11, 7],
            [PACKET.CZ.USE_ITEM, 0x00f5, 24, 9, 20],
            [PACKET.CZ.REQUEST_TIME, 0x00f7, 13, 9],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0113, 23, 5, 19],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0190, 26, 11, 22],
            [PACKET.CZ.REQUEST_ACT, 0x0193, 18, 7, 17],
        ],

        //2004-09-06aSakexe
        20040906: [
            [PACKET.CZ.USE_ITEM, 0x0072, 20, 9, 20],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x007e, 19, 3, 15],
            [PACKET.CZ.REQUEST_ACT, 0x0085, 23, 9, 22],
            [PACKET.CZ.REQUEST_MOVE, 0x0089, 9, 6],
            [
                PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo,
                0x008c,
                105,
                10,
                14,
                18,
                23,
                25,
            ],
            [PACKET.CZ.ITEM_THROW, 0x0094, 17, 6, 15],
            [PACKET.CZ.REQNAME, 0x009b, 14, 10],
            [PACKET.CZ.REQUEST_CHAT, 0x009f, -1, 2, 4],
            [PACKET.CZ.REQNAME_BYGID, 0x00a2, 14, 10],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x00a7, 25, 10, 14, 18, 23],
            [PACKET.CZ.CHANGE_DIRECTION, 0x00f3, 10, 4, 9],
            [PACKET.CZ.ENTER, 0x00f5, 34, 7, 15, 25, 29, 33],
            [PACKET.CZ.CLOSE_STORE, 0x00f7, 2, 0],
            [PACKET.CZ.ITEM_PICKUP, 0x0113, 11, 7],
            [PACKET.CZ.REQUEST_TIME, 0x0116, 11, 7],
            [PACKET.CZ.USE_SKILL, 0x0190, 22, 9, 15, 18],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0193, 17, 3, 13],
        ],

        //2004-09-20aSakexe
        20040920: [
            [PACKET.CZ.USE_ITEM, 0x0072, 18, 10, 14],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x007e, 25, 6, 21],
            [PACKET.CZ.REQUEST_ACT, 0x0085, 9, 3, 8],
            [PACKET.CZ.REQUEST_MOVE, 0x0089, 14, 11],
            [
                PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo,
                0x008c,
                109,
                16,
                20,
                23,
                27,
                29,
            ],
            [PACKET.CZ.ITEM_THROW, 0x0094, 19, 12, 17],
            [PACKET.CZ.REQNAME, 0x009b, 10, 6],
            [PACKET.CZ.REQNAME_BYGID, 0x00a2, 10, 6],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x00a7, 29, 6, 20, 23, 27],
            [PACKET.CZ.CHANGE_DIRECTION, 0x00f3, 18, 8, 17],
            [PACKET.CZ.ENTER, 0x00f5, 32, 10, 17, 23, 27, 31],
            [PACKET.CZ.ITEM_PICKUP, 0x0113, 14, 10],
            [PACKET.CZ.REQUEST_TIME, 0x0116, 14, 10],
            [PACKET.CZ.USE_SKILL, 0x0190, 14, 4, 7, 10],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0193, 12, 4, 8],
        ],

        //2004-10-05aSakexe
        20041005: [
            [PACKET.CZ.USE_ITEM, 0x0072, 17, 6, 13],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x007e, 16, 5, 12],
            [PACKET.CZ.REQUEST_MOVE, 0x0089, 6, 3],
            [
                PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo,
                0x008c,
                103,
                2,
                6,
                17,
                21,
                23,
            ],
            [PACKET.CZ.ITEM_THROW, 0x0094, 14, 5, 12],
            [PACKET.CZ.REQNAME, 0x009b, 15, 11],
            [PACKET.CZ.REQNAME_BYGID, 0x00a2, 12, 8],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x00a7, 23, 3, 6, 17, 21],
            [PACKET.CZ.CHANGE_DIRECTION, 0x00f3, 13, 5, 12],
            [PACKET.CZ.ENTER, 0x00f5, 33, 12, 18, 24, 28, 32],
            [PACKET.CZ.ITEM_PICKUP, 0x0113, 10, 6],
            [PACKET.CZ.REQUEST_TIME, 0x0116, 10, 6],
            [PACKET.CZ.USE_SKILL, 0x0190, 20, 7, 12, 16],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0193, 26, 10, 22],
        ],

        //2004-10-25aSakexe
        20041025: [
            [PACKET.CZ.USE_ITEM, 0x0072, 13, 5, 9],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x007e, 13, 6, 9],
            [PACKET.CZ.REQUEST_ACT, 0x0085, 15, 4, 14],
            [
                PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo,
                0x008c,
                108,
                6,
                9,
                23,
                26,
                28,
            ],
            [PACKET.CZ.ITEM_THROW, 0x0094, 12, 6, 10],
            [PACKET.CZ.REQNAME, 0x009b, 10, 6],
            [PACKET.CZ.REQNAME_BYGID, 0x00a2, 16, 12],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x00a7, 28, 6, 9, 23, 26],
            [PACKET.CZ.CHANGE_DIRECTION, 0x00f3, 15, 6, 14],
            [PACKET.CZ.ENTER, 0x00f5, 29, 5, 14, 20, 24, 28],
            [PACKET.CZ.ITEM_PICKUP, 0x0113, 9, 5],
            [PACKET.CZ.REQUEST_TIME, 0x0116, 9, 5],
            [PACKET.CZ.USE_SKILL, 0x0190, 26, 4, 10, 22],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0193, 22, 12, 18],
        ],

        //2004-11-29aSakexe
        20041129: [
            [PACKET.CZ.USE_SKILL, 0x0072, 22, 8, 12, 18],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x007e, 30, 4, 9, 22, 28],
            [PACKET.CZ.REQUEST_CHAT, 0x0085, -1, 2, 4],
            [PACKET.CZ.REQUEST_TIME, 0x0089, 7, 3],
            [PACKET.CZ.REQNAME, 0x008c, 13, 9],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0094, 14, 4, 10],
            [PACKET.CZ.CLOSE_STORE, 0x009b, 2, 0],
            [PACKET.CZ.REQUEST_ACT, 0x009f, 18, 6, 17],
            [PACKET.CZ.ITEM_PICKUP, 0x00a2, 7, 3],
            [PACKET.CZ.REQUEST_MOVE, 0x00a7, 7, 4],
            [PACKET.CZ.CHANGE_DIRECTION, 0x00f3, 8, 3, 7],
            [PACKET.CZ.ENTER, 0x00f5, 29, 3, 10, 20, 24, 28],
            [PACKET.CZ.REQNAME_BYGID, 0x00f7, 14, 10],
            [
                PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo,
                0x0113,
                110,
                4,
                9,
                22,
                28,
                30,
            ],
            [PACKET.CZ.ITEM_THROW, 0x0116, 12, 4, 10],
            [PACKET.CZ.USE_ITEM, 0x0190, 15, 3, 11],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0193, 21, 4, 17],
        ],

        //2004-12-13aSakexe
        20050110: [
            [PACKET.CZ.USE_SKILL, 0x0072, 26, 8, 16, 22],
            [
                PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo,
                0x007e,
                114,
                10,
                18,
                22,
                32,
                34,
            ],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0085, 23, 12, 22],
            [PACKET.CZ.REQUEST_TIME, 0x0089, 9, 5],
            [PACKET.CZ.REQNAME, 0x008c, 8, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0094, 20, 10, 16],
            [PACKET.CZ.ENTER, 0x009b, 32, 3, 12, 23, 27, 31],
            [PACKET.CZ.USE_ITEM, 0x009f, 17, 5, 13],
            [PACKET.CZ.REQNAME_BYGID, 0x00a2, 11, 7],
            [PACKET.CZ.REQUEST_MOVE, 0x00a7, 13, 10],
            [PACKET.CZ.REQUEST_CHAT, 0x00f3, -1, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x00f5, 9, 5],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x00f7, 21, 11, 17],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0113, 34, 10, 18, 22, 32],
            [PACKET.CZ.ITEM_THROW, 0x0116, 20, 15, 18],
            [PACKET.CZ.REQUEST_ACT, 0x0190, 20, 9, 19],
            [PACKET.CZ.CLOSE_STORE, 0x0193, 2, 0],
        ],

        //2005-04-25aSakexe
        20050425: [[PACKET.CZ.COMMAND_MER, 0x022d, 5, 2, 4]],

        //2005-05-09aSakexe
        20050509: [
            [PACKET.CZ.USE_SKILL, 0x0072, 25, 6, 10, 21],
            [
                PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo,
                0x007e,
                102,
                5,
                9,
                12,
                20,
                22,
            ],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0085, 11, 7, 10],
            [PACKET.CZ.REQUEST_TIME, 0x0089, 8, 4],
            [PACKET.CZ.REQNAME, 0x008c, 11, 7],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0094, 14, 7, 10],
            [PACKET.CZ.ENTER, 0x009b, 26, 4, 9, 17, 21, 25],
            [PACKET.CZ.USE_ITEM, 0x009f, 14, 4, 10],
            [PACKET.CZ.REQNAME_BYGID, 0x00a2, 15, 11],
            [PACKET.CZ.REQUEST_MOVE, 0x00a7, 8, 5],
            [PACKET.CZ.ITEM_PICKUP, 0x00f5, 8, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x00f7, 22, 14, 18],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0113, 22, 5, 9, 12, 20],
            [PACKET.CZ.ITEM_THROW, 0x0116, 10, 5, 8],
            [PACKET.CZ.REQUEST_ACT, 0x0190, 19, 5, 18],
        ],

        //2005-05-30aSakexe
        20050608: [[PACKET.CZ.ACK_STORE_PASSWORD, 0x023b, 36, 2, 4, 20]],

        //2005-06-08aSakexe
        20050628: [
            [PACKET.CZ.USE_SKILL, 0x0072, 34, 6, 17, 30],
            [
                PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo,
                0x007e,
                113,
                12,
                15,
                18,
                31,
                33,
            ],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0085, 17, 8, 16],
            [PACKET.CZ.REQUEST_TIME, 0x0089, 13, 9],
            [PACKET.CZ.REQNAME, 0x008c, 8, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0094, 31, 16, 27],
            [PACKET.CZ.ENTER, 0x009b, 32, 9, 15, 23, 27, 31],
            [PACKET.CZ.USE_ITEM, 0x009f, 19, 9, 15],
            [PACKET.CZ.REQNAME_BYGID, 0x00a2, 9, 5],
            [PACKET.CZ.REQUEST_MOVE, 0x00a7, 11, 8],
            [PACKET.CZ.ITEM_PICKUP, 0x00f5, 13, 9],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x00f7, 18, 11, 14],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0113, 33, 12, 15, 18, 31],
            [PACKET.CZ.ITEM_THROW, 0x0116, 12, 3, 10],
            [PACKET.CZ.REQUEST_ACT, 0x0190, 24, 11, 23],
        ],

        //2005-07-18aSakexe
        20050718: [
            [PACKET.CZ.USE_SKILL, 0x0072, 19, 5, 11, 15],
            [
                PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo,
                0x007e,
                110,
                9,
                15,
                23,
                28,
                30,
            ],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0085, 11, 6, 10],
            [PACKET.CZ.REQUEST_TIME, 0x0089, 7, 3],
            [PACKET.CZ.REQNAME, 0x008c, 11, 7],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0094, 21, 12, 17],
            [PACKET.CZ.ENTER, 0x009b, 31, 3, 13, 22, 26, 30],
            [PACKET.CZ.USE_ITEM, 0x009f, 12, 3, 8],
            [PACKET.CZ.REQNAME_BYGID, 0x00a2, 18, 14],
            [PACKET.CZ.REQUEST_MOVE, 0x00a7, 15, 12],
            [PACKET.CZ.ITEM_PICKUP, 0x00f5, 7, 3],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x00f7, 13, 5, 9],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0113, 30, 9, 15, 23, 28],
            [PACKET.CZ.ITEM_THROW, 0x0116, 12, 6, 10],
            [PACKET.CZ.REQUEST_ACT, 0x0190, 21, 5, 20],
            [PACKET.CZ.MAIL_ADD_ITEM, 0x0247, 8, 2, 4],
        ],

        //2005-07-19bSakexe
        20050719: [
            [PACKET.CZ.USE_SKILL, 0x0072, 34, 6, 17, 30],
            [
                PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo,
                0x007e,
                113,
                12,
                15,
                18,
                31,
                33,
            ],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0085, 17, 8, 16],
            [PACKET.CZ.REQUEST_TIME, 0x0089, 13, 9],
            [PACKET.CZ.REQNAME, 0x008c, 8, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0094, 31, 16, 27],
            [PACKET.CZ.ENTER, 0x009b, 32, 9, 15, 23, 27, 31],
            [PACKET.CZ.USE_ITEM, 0x009f, 19, 9, 15],
            [PACKET.CZ.REQNAME_BYGID, 0x00a2, 9, 5],
            [PACKET.CZ.REQUEST_MOVE, 0x00a7, 11, 8],
            [PACKET.CZ.ITEM_PICKUP, 0x00f5, 13, 9],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x00f7, 18, 11, 14],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0113, 33, 12, 15, 18, 31],
            [PACKET.CZ.ITEM_THROW, 0x0116, 12, 3, 10],
            [PACKET.CZ.REQUEST_ACT, 0x0190, 24, 11, 23],
        ],

        //2006-03-27aSakexe
        20060327: [
            [PACKET.CZ.USE_SKILL, 0x0072, 26, 11, 18, 22],
            [
                PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo,
                0x007e,
                120,
                5,
                15,
                29,
                38,
                40,
            ],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0085, 12, 7, 11],
            [PACKET.CZ.REQUEST_TIME, 0x0089, 13, 9],
            [PACKET.CZ.REQNAME, 0x008c, 12, 8],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0094, 23, 5, 19],
            [PACKET.CZ.ENTER, 0x009b, 37, 9, 21, 28, 32, 36],
            [PACKET.CZ.USE_ITEM, 0x009f, 24, 9, 20],
            [PACKET.CZ.REQNAME_BYGID, 0x00a2, 11, 7],
            [PACKET.CZ.REQUEST_MOVE, 0x00a7, 15, 12],
            [PACKET.CZ.ITEM_PICKUP, 0x00f5, 13, 9],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x00f7, 26, 11, 22],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0113, 40, 5, 15, 29, 38],
            [PACKET.CZ.ITEM_THROW, 0x0116, 17, 8, 15],
            [PACKET.CZ.REQUEST_ACT, 0x0190, 18, 7, 17],
        ],

        //2007-01-08aSakexe
        20070108: [
            [PACKET.CZ.USE_SKILL, 0x0072, 30, 10, 14, 26],
            [
                PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo,
                0x007e,
                120,
                10,
                19,
                23,
                38,
                40,
            ],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0085, 14, 10, 13],
            [PACKET.CZ.REQUEST_TIME, 0x0089, 11, 7],
            [PACKET.CZ.REQNAME, 0x008c, 17, 13],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0094, 17, 4, 13],
            [PACKET.CZ.ENTER, 0x009b, 35, 7, 21, 26, 30, 34],
            [PACKET.CZ.USE_ITEM, 0x009f, 21, 7, 17],
            [PACKET.CZ.REQNAME_BYGID, 0x00a2, 10, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x00a7, 8, 5],
            [PACKET.CZ.ITEM_PICKUP, 0x00f5, 11, 7],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x00f7, 15, 3, 11],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0113, 40, 10, 19, 23, 38],
            [PACKET.CZ.ITEM_THROW, 0x0116, 19, 11, 17],
            [PACKET.CZ.REQUEST_ACT, 0x0190, 10, 4, 9],
        ],

        //2007-02-12aSakexe
        20070212: [
            [PACKET.CZ.USE_SKILL, 0x0072, 25, 6, 10, 21],
            [
                PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo,
                0x007e,
                102,
                5,
                9,
                12,
                20,
                22,
            ],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0085, 11, 7, 10],
            [PACKET.CZ.REQUEST_TIME, 0x0089, 8, 4],
            [PACKET.CZ.REQNAME, 0x008c, 11, 7],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0094, 14, 7, 10],
            [PACKET.CZ.ENTER, 0x009b, 26, 4, 9, 17, 21, 25],
            [PACKET.CZ.USE_ITEM, 0x009f, 14, 4, 10],
            [PACKET.CZ.REQNAME_BYGID, 0x00a2, 15, 11],
            [PACKET.CZ.REQUEST_MOVE, 0x00a7, 8, 5],
            [PACKET.CZ.ITEM_PICKUP, 0x00f5, 8, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x00f7, 22, 14, 18],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0113, 22, 5, 9, 12, 20],
            [PACKET.CZ.ITEM_THROW, 0x0116, 10, 5, 8],
            [PACKET.CZ.REQUEST_ACT, 0x0190, 19, 5, 18],
        ],

        //2007-05-07aSakexe
        20070507: [[PACKET.CZ.REQ_ITEMREPAIR, 0x01fd, 15, 2]],

        //2007-02-27aSakexe to 2007-10-02aSakexe
        20070227: [
            [PACKET.CZ.PC_BUY_CASH_POINT_ITEM, 0x0288, 10, 2, 4, 6],
            [PACKET.CZ.REQ_JOIN_GROUP, 0x02c4, 26, 2],
        ],

        //2008-01-02aSakexe
        20080102: [[PACKET.CZ.REQ_ACCOUNTNAME, 0x01df, 6, 2]],

        //2008-09-10aSakexe
        20080910: [
            [PACKET.CZ.ENTER, 0x0436, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.REQUEST_ACT, 0x0437, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x0438, 10, 2, 4, 6],
            [PACKET.CZ.USE_ITEM, 0x0439, 8, 2, 4],
        ],

        //2008-08-27aRagexeRE
        20080827: [
            [PACKET.CZ.USE_SKILL, 0x0072, 22, 9, 15, 18],
            [
                PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo,
                0x007e,
                105,
                10,
                14,
                18,
                23,
                25,
            ],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0085, 10, 4, 9],
            [PACKET.CZ.REQUEST_TIME, 0x0089, 11, 7],
            [PACKET.CZ.REQNAME, 0x008c, 14, 10],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0094, 19, 3, 15],
            [PACKET.CZ.ENTER, 0x009b, 34, 7, 15, 25, 29, 33],
            [PACKET.CZ.USE_ITEM, 0x009f, 20, 7, 20],
            [PACKET.CZ.REQNAME_BYGID, 0x00a2, 14, 10],
            [PACKET.CZ.REQUEST_MOVE, 0x00a7, 9, 6],
            [PACKET.CZ.ITEM_PICKUP, 0x00f5, 11, 7],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x00f7, 17, 3, 13],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0113, 25, 10, 14, 18, 23],
            [PACKET.CZ.ITEM_THROW, 0x0116, 17, 6, 15],
            [PACKET.CZ.REQUEST_ACT, 0x0190, 23, 9, 22],
        ],

        //2009-08-18aRagexeRE
        20090818: [[PACKET.CZ.ITEMLISTWIN_RES, 0x07e4, -1, 2, 4, 8]],

        //2009-10-27aRagexeRE
        20091027: [[PACKET.CZ.REQ_ACCOUNTNAME, 0x07f5, 6, 2]],

        //2009-12-22aRagexeRE
        20091222: [
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x0802, 18, 2, 4, 6],
            [PACKET.CZ.PARTY_BOOKING_REQ_DELETE, 0x0806, 4, 2],
        ],

        //2009-12-29aRagexeRE
        20091229: [
            [PACKET.CZ.PARTY_BOOKING_REQ_SEARCH, 0x0804, 14, 2, 4, 6, 8, 12],
            [PACKET.CZ.PARTY_BOOKING_REQ_DELETE, 0x0806, 2, 0],
            [PACKET.CZ.PARTY_BOOKING_REQ_DELETE, 0x0808, 14, 2],
        ],

        //2010-03-03aRagexeRE
        20100303: [
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0811, -1, 2, 4, 8, 9, 89],
        ],

        //2010-04-20aRagexeRE
        20100420: [
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0815, 2, 0],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0817, 6, 2],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x0819, -1, 2, 4, 8, 12],
        ],

        //2010-06-01aRagexeRE
        20100601: [
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0835, -1, 2, 4, 5, 9, 13, 14, 15],
        ],

        //2010-06-08aRagexeR
        20100608: [
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0838, 2, 0],
            [PACKET.CZ.CLOSE_SEARCH_STORE_INFO, 0x083b, 2, 0],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x083c, 12, 2, 6, 10],
        ],

        //2010-08-03aRagexeRE
        20100803: [
            [PACKET.CZ.REMOVE_AID_SSO, 0x0843, 6, 2],
            //[PACKET.CZ.PC_BUY_CASH_POINT_ITEM,0x0288,-1,2,4,8,10],
            [PACKET.CZ.PC_BUY_CASH_POINT_ITEM, 0x0288, -1, 4, 8],
        ],

        //2010-11-24aRagexeRE
        20101124: [
            [PACKET.CZ.PC_BUY_CASH_POINT_ITEM, 0x0288, -1, 4, 8],
            [PACKET.CZ.ENTER, 0x0436, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.REQUEST_MOVE, 0x035f, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x0360, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0361, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x0362, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0363, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0364, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0365, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0366, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0367, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x0368, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0369, 6, 2],
        ],

        //2011-07-18aRagexe
        20110718: [
            //[clif->pCashShopOpen,0x0844,2,2],
            //[clif->pCashShopClose,0x084a,2,2],
            //[clif->pCashShopReqTab,0x0846,4,2],
            //[clif->pCashShopSchedule,0x08c9,2,0],
            //[clif->pCashShopBuy,0x0848,-1,2],
        ],

        //2011-10-05aRagexeRE
        20111005: [
            [PACKET.CZ.REQUEST_MOVE, 0x0364, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x0817, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0366, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x0815, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0885, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0893, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0897, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0369, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x08ad, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x088a, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0838, 6, 2],
            [PACKET.CZ.USE_ITEM, 0x0439, 8, 2, 4],
            //[clif->pBGQueueRegister,0x08d7,28,2],
            //[clif->pBGQueueCheckState,0x090a,26,2],
            //[clif->pBGQueueRevokeReq,0x08da,26,2],
            //[clif->pBGQueueBattleBeginAck,0x08e0,51,2],
        ],

        //2011-11-02aRagexe
        20111102: [
            [PACKET.CZ.ADD_FRIENDS, 0x0436, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0898, 5, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0281, 36, 0],
            [PACKET.CZ.REQ_JOIN_GROUP, 0x088d, 26, 2],
            [PACKET.CZ.ENTER, 0x083c, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.REQUEST_ACT, 0x08aa, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x02c4, 10, 2, 4, 6],
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0811, -1, 2, 4, 8],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x08a5, 18, 2, 4, 6],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0835, -1, 2, 4, 8, 9, 89],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x089b, 2, 0],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x08a1, 6, 2],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x089e, -1, 2, 4, 8, 12],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x08ab, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x088b, 2, 0],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x08a2, 12, 2, 6, 10],
        ],

        //2012-03-07fRagexeRE
        20120307: [
            [PACKET.CZ.ENTER, 0x086a, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.REQUEST_MOVE, 0x0437, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x0887, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0890, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x0865, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x02c4, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x093b, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0963, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0438, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0366, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x096a, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0368, 6, 2],
            [PACKET.CZ.ADD_FRIENDS, 0x0369, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0863, 5, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0861, 36, 0],
            [PACKET.CZ.REQ_JOIN_GROUP, 0x0929, 26, 2],
            [PACKET.CZ.REQUEST_ACT, 0x0885, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x0889, 10, 2, 4, 6],
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0870, -1, 2, 4, 8],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x0926, 18, 2, 4, 6],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0815, -1, 2, 4, 8, 9, 89],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0817, 2, 0],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0360, 6, 2],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x0811, -1, 2, 4, 8, 12],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0884, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0835, 2, 0],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0838, 12, 2, 6, 10],
            [PACKET.CZ.USE_ITEM, 0x0439, 8, 2, 4],
        ],

        //2012-04-10aRagexeRE
        20120410: [
            [PACKET.CZ.REQ_ITEMREPAIR, 0x01fd, 15, 2],
            [PACKET.CZ.ADD_FRIENDS, 0x089c, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0885, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0961, 36, 0],
            [PACKET.CZ.PC_BUY_CASH_POINT_ITEM, 0x0288, -1, 4, 8],
            [PACKET.CZ.REQ_JOIN_GROUP, 0x091c, 26, 2],
            [PACKET.CZ.ENTER, 0x094b, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.REQUEST_ACT, 0x0369, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x083c, 10, 2, 4, 6],
            [PACKET.CZ.USE_ITEM, 0x0439, 8, 2, 4],
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0945, -1, 2, 4, 8],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0815, -1, 2, 4, 8, 9, 89],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0817, 2, 0],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0360, 6, 2],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x0811, -1, 2, 4, 8, 12],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0819, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0835, 2, 0],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0838, 12, 2, 6, 10],
            [PACKET.CZ.REQUEST_MOVE, 0x0437, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x0886, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0871, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x0938, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0891, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x086c, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x08a6, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0438, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0366, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x0889, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0884, 6, 2],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x08e5, 41, 2, 4],
            [PACKET.CZ.PARTY_BOOKING_REQ_SEARCH, 0x08e7, 10, 2],
            [PACKET.CZ.PARTY_BOOKING_REQ_DELETE, 0x08e9, 2, 2],
            [PACKET.CZ.PARTY_BOOKING_REQ_DELETE, 0x08eb, 39, 2],
            //[clif->pDull,0x08EF,6,2],
            //[clif->pDull,0x08F1,6,2],
            //[clif->pDull,0x08F5,-1,2,4],
            //[clif->pDull,0x08FB,6,2],
            //[clif->pMoveItem,0x0907,5,2,4],
        ],

        //2012-04-18aRagexeRE
        20120418: [
            [PACKET.CZ.ADD_FRIENDS, 0x023b, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0361, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x08a8, 36, 0],
            [PACKET.CZ.REQ_JOIN_GROUP, 0x0802, 26, 2],
            [PACKET.CZ.ENTER, 0x022d, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0281, -1, 2, 4, 8],
            [PACKET.CZ.REQUEST_TIME, 0x035f, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0202, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x07e4, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0362, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x07ec, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0364, 8, 2, 4],
            [PACKET.CZ.REQNAME, 0x096a, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0368, 6, 2],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x08e5, 41, 2, 4],
        ],

        //2012-07-02aRagexeRE
        20120702: [
            [PACKET.CZ.ENTER, 0x0363, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.REQUEST_TIME, 0x0364, 6, 2],
            [PACKET.CZ.REQUEST_ACT, 0x085a, 7, 2, 6],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0861, 8, 2, 4],
            [PACKET.CZ.USE_SKILL, 0x0862, 10, 2, 4, 6],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0863, 10, 2, 4, 6, 8],
            [PACKET.CZ.REQNAME_BYGID, 0x0886, 6, 2],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0889, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.ITEM_THROW, 0x089e, 6, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x089f, 6, 2],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x08a0, 8, 2, 4],
            [PACKET.CZ.REQNAME, 0x094a, 6, 2],
            [PACKET.CZ.REQUEST_MOVE, 0x0953, 5, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0960, 5, 2, 4],
        ],

        //2012-07-10
        20120710: [[PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0886, 2, 0]],

        //2012-07-16aRagExe
        20120716: [
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0364, 8, 2, 4],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x0879, 18, 2, 4, 6],
            [PACKET.CZ.ADD_FRIENDS, 0x023b, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0361, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0819, 36, 0],
            [PACKET.CZ.REQ_JOIN_GROUP, 0x0802, 26, 2],
            [PACKET.CZ.ENTER, 0x022d, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.REQUEST_ACT, 0x0369, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x083c, 10, 2, 4, 6],
            [PACKET.CZ.USE_ITEM, 0x0439, 8, 2, 4],
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0281, -1, 2, 4, 8],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0815, -1, 2, 4, 8, 9, 89],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0817, 2, 0],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0360, 6, 2],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x0940, -1, 2, 4, 8, 12],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0811, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0835, 2, 0],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0838, 12, 2, 6, 10],
            [PACKET.CZ.REQUEST_MOVE, 0x0437, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x035f, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0202, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x07e4, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0362, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x07ec, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0364, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0438, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0366, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x096a, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0368, 6, 2],
        ],

        //2013-03-20Ragexe
        20130320: [
            [PACKET.CZ.REQUEST_ACT, 0x088e, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x089b, 10, 2, 4, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x0881, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x0363, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0897, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x0933, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0438, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x08ac, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0874, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0959, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x085a, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x0898, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x094c, 6, 2],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0365, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x092e, 2, 0],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x094e, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x0922, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x035f, 6, 2],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0886, 2, 0],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0938, -1, 2, 4, 8, 9, 89],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x085d, 41, 2, 4],
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0868, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x0888, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.REQ_JOIN_GROUP, 0x086d, 26, 2],
            [PACKET.CZ.ADD_FRIENDS, 0x086f, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x093f, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0947, 36, 0],
            [PACKET.CZ.REQ_WEAR_EQUIP, 0x0998, 8, 2, 4],
        ],

        //2013-05-15aRagexe
        20130515: [
            [PACKET.CZ.REQUEST_ACT, 0x0369, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x083c, 10, 2, 4, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x0437, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x035f, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0362, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x08a1, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0944, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0887, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x08ac, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0438, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0366, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x096a, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0368, 6, 2],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0838, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0835, 2, 0],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0819, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x0811, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0360, 6, 2],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0817, 2, 0],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0815, -1, 2, 4, 8, 9, 89],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x092d, 41, 2, 4],
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0963, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x0943, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.REQ_JOIN_GROUP, 0x0947, 26, 2],
            [PACKET.CZ.ADD_FRIENDS, 0x0962, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0931, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x093e, 36, 0],
        ],

        //2013-05-22Ragexe
        20130522: [
            [PACKET.CZ.REQUEST_ACT, 0x08a2, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x095c, 10, 2, 4, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x0360, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x07ec, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0925, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x095e, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x089c, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x08a3, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x087e, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0811, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0964, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x08a6, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0369, 6, 2],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x093e, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x08aa, 2, 0],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x095b, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x0952, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0368, 6, 2],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x086e, 2, 0],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0874, -1, 2, 4, 8, 9, 89],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x089b, 41, 2, 4],
            [PACKET.CZ.ITEMLISTWIN_RES, 0x086a, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x08a9, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.REQ_JOIN_GROUP, 0x0950, 26, 2],
            [PACKET.CZ.ADD_FRIENDS, 0x0362, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0926, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x088e, 36, 0],
        ],

        //2013-05-29Ragexe
        20130529: [
            [PACKET.CZ.REQUEST_ACT, 0x0890, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x0438, 10, 2, 4, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x0876, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x0897, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0951, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x0895, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x08a7, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0938, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0957, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0917, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x085e, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x0863, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0937, 6, 2],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x085a, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0941, 2, 0],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0918, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x0936, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0892, 6, 2],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0964, 2, 0],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0869, -1, 2, 4, 8, 9, 89],
            /*
#ifdef PACKETVER_RE
        [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER,0x0874,41,2,4],
#else // not PACKETVER_RE
        [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x0874,18,,2,4],
#endif // PACKETVER_RE
*/
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0958, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x0919, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.PARTY_JOIN_REQ, 0x08a8, 26, 2],
            [PACKET.CZ.ADD_FRIENDS, 0x0877, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x023b, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0956, 36, 0],
        ],

        //2013-06-05Ragexe
        20130605: [
            [PACKET.CZ.REQUEST_ACT, 0x0369, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x083c, 10, 2, 4, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x0437, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x035f, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0202, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x07e4, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0362, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x07ec, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0364, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0438, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0366, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x096a, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0368, 6, 2],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0838, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0835, 2, 0],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0819, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x0811, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0360, 6, 2],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0817, 2, 0],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0815, -1, 2, 4, 8, 9, 89],
            /*
#ifdef PACKETVER_RE
        [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER,0x0365,41,2,4],
#else // not PACKETVER_RE
        [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER,0x0365,18,2,4],
#endif // PACKETVER_RE
*/
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0281, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x022d, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.PARTY_JOIN_REQ, 0x0802, 26, 2],
            [PACKET.CZ.ADD_FRIENDS, 0x023b, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0361, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0883, 36, 0],
        ],

        //2013-06-12Ragexe
        20130612: [
            [PACKET.CZ.CHANGE_DIRECTION, 0x087e, 5, 2, 4],
            [PACKET.CZ.ENTER, 0x0919, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.ADD_FRIENDS, 0x0940, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x093a, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0964, 36, 0],
        ],

        //2013-06-18Ragexe
        20130618: [
            [PACKET.CZ.REQUEST_ACT, 0x0889, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x0951, 10, 2, 4, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x088e, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x0930, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x08a6, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x0962, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0917, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0885, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0936, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x096a, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x094f, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x0944, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0945, 6, 2],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0890, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0363, 2, 0],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0281, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x0891, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0862, 6, 2],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x085a, 2, 0],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0932, -1, 2, 4, 8, 9, 89],
            /*
	#ifdef PACKETVER_RE
			[PACKET.CZ.PARTY_BOOKING_REQ_REGISTER,0x08A7,41,2,4],
	#else // not PACKETVER_RE
			[CZ.PARTY_BOOKING_REQ_REGISTER,0x08A7,18,PACKET.2,4],
	#endif // PACKETVER_RE
	*/
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0942, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x095b, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.PARTY_JOIN_REQ, 0x0887, 26, 2],
            [PACKET.CZ.ADD_FRIENDS, 0x0953, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x02c4, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0864, 36, 0],
        ],

        //2013-06-26Ragexe
        20130626: [
            [PACKET.CZ.REQUEST_ACT, 0x0369, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x083c, 10, 2, 4, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x0437, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x035f, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x094d, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x088b, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0952, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0921, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0817, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0438, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0366, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x096a, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0368, 6, 2],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0838, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0835, 2, 0],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0819, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x0811, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0360, 6, 2],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0365, 2, 0],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0815, -1, 2, 4, 8, 9, 89],
            /*
	#ifdef PACKETVER_RE
			[PACKET.CZ.PARTY_BOOKING_REQ_REGISTER,0x0894,41,clif->2,4],
	#else // not PACKETVER_RE
			[PACKET.CZ.PARTY_BOOKING_REQ_REGISTER,0x0894,18,2,4],
	#endif // PACKETVER_RE
	*/
            [PACKET.CZ.ITEMLISTWIN_RES, 0x08a5, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x088c, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.PARTY_JOIN_REQ, 0x0895, 26, 2],
            [PACKET.CZ.ADD_FRIENDS, 0x08ab, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0960, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0930, 36, 0],
        ],

        //2013-07-03Ragexe
        20130703: [
            [PACKET.CZ.CHANGE_DIRECTION, 0x0930, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x07e4, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0362, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x07ec, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0364, 8, 2, 4],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0202, 6, 2],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0817, 2, 0],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0815, -1, 2, 4, 8, 9, 89],
            /*
		#ifdef PACKETVER_RE
				[PACKET.CZ.PARTY_BOOKING_REQ_REGISTER,0x0365,41,2,4],
		#else // not PACKETVER_RE
				[PACKET.CZ.PARTY_BOOKING_REQ_REGISTER,0x0365,18,2,4],
		#endif // PACKETVER_RE
		*/
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0281, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x022d, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.PARTY_JOIN_REQ, 0x0802, 26, 2],
            [PACKET.CZ.ADD_FRIENDS, 0x0360, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x094a, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0873, 36, 0],
            //[0x097C,4,clif->pRanklist],
        ],

        // Bank system
        20130724: [
            /*
			[0x09A6,12], // ZC_BANKING_CHECK
			[0x09A7,10,clif->pBankDeposit,2,4,6],
			[0x09A8,16], // ZC_ACK_BANKING_DEPOSIT
			[0x09A9,10,clif->pBankWithdraw,2,4,6],
			[0x09AA,16], // ZC_ACK_BANKING_WITHDRAW
			[0x09AB,6,clif->pBankCheck,2,4],

			[0x09B6,6,clif->pBankOpen,2,4],
			[0x09B7,4], // ZC_ACK_OPEN_BANKING
			[0x09B8,6,clif->pBankClose,2,4],
			[0x09B9,4], // ZC_ACK_CLOSE_BANKING
	*/
        ],

        //2013-08-07Ragexe
        20130807: [
            [PACKET.CZ.REQUEST_ACT, 0x0369, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x083c, 10, 2, 4, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x0437, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x035f, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0202, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x07e4, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0362, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x07ec, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0364, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0438, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0366, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x096a, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0368, 6, 2],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0838, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0835, 2, 0],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0819, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x0811, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0360, 6, 2],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0817, 2, 0],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0815, -1, 2, 4, 8, 9, 89],
            /*
		#ifdef PACKETVER_RE
				[PACKET.CZ.PARTY_BOOKING_REQ_REGISTER,0x0365,41,2,4],
		#else // not PACKETVER_RE
				[PACKET.CZ.PARTY_BOOKING_REQ_REGISTER,0x0365,18,2,4],
		#endif // PACKETVER_RE
		*/
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0281, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x022d, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.PARTY_JOIN_REQ, 0x0802, 26, 2],
            [PACKET.CZ.ADD_FRIENDS, 0x023b, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0361, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0887, 36, 0],
        ],

        //2013-08-14Ragexe
        20130814: [
            [PACKET.CZ.REQUEST_ACT, 0x0874, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x0947, 10, 2, 4, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x093a, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x088a, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x088c, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x0926, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x095f, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0202, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0873, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0887, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0962, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x0937, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0923, 6, 2],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0868, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0941, 2, 0],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0889, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x0835, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0895, 6, 2],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x094e, 2, 0],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0936, -1, 2, 4, 8, 9, 89],
            /*
			#ifdef PACKETVER_RE
			[PACKET.CZ.PARTY_BOOKING_REQ_REGISTER,0x0365,41,2,4],
			#else // not PACKETVER_RE
			[PACKET.CZ.PARTY_BOOKING_REQ_REGISTER,0x0959,18,2,4],
			#endif // PACKETVER_RE
			*/
            // packet(0x0896,8); // CZ_JOIN_BATTLE_FIELD
            [PACKET.CZ.ITEMLISTWIN_RES, 0x08a4, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x0368, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.PARTY_JOIN_REQ, 0x0927, 26, 2],
            // packet(0x0815,4); // CZ_GANGSI_RANK
            [PACKET.CZ.ADD_FRIENDS, 0x0281, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0958, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0885, 36, 0],
        ],

        // 2013-12-18bRagexe
        20131218: [
            [PACKET.CZ.REQUEST_ACT, 0x0369, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x083c, 10, 2, 4, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x0437, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x035f, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0947, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x07e4, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0362, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x07ec, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0364, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0438, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0366, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x096a, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0368, 6, 2],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0838, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0835, 2, 0],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0819, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x022d, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0360, 6, 2],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0817, 2, 0],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0815, -1, 2, 4, 8, 9, 89],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x0365, 18, 2, 4],
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0281, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x022f, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.PARTY_JOIN_REQ, 0x0802, 26, 2],
            [PACKET.CZ.ADD_FRIENDS, 0x08ab, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0811, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x085c, 36, 0],
            // packet(0x0363,8); // CZ_JOIN_BATTLE_FIELD
            // packet(0x087B,4); // CZ_GANGSI_RANK
            /* New */
            //[0x09d4,2,clif->pNPCShopClosed],
            //[0x09ce,102,clif->pGM_Monster_Item,2],
            /* NPC Market */
            //[0x09d8,2,clif->pNPCMarketClosed],
            //[0x09d6,-1,clif->pNPCMarketPurchase],
        ],

        // 2013-12-23cRagexe
        20131223: [
            [PACKET.CZ.REQUEST_ACT, 0x0369, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x083c, 10, 2, 4, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x0437, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x035f, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0202, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x07e4, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0362, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x07ec, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0364, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0438, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0366, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x096a, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0368, 6, 2],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0838, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0835, 2, 0],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0819, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x0811, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0360, 6, 2],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0817, 2, 0],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0815, -1, 2, 4, 8, 9, 89],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x0365, 18, 2, 4],
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0281, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x022d, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.PARTY_JOIN_REQ, 0x0802, 26, 2],
            [PACKET.CZ.ADD_FRIENDS, 0x023b, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0361, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x08a4, 36, 0],
            [PACKET.CZ.NPC_SHOP_CLOSED, 0x09D4, 2, 0],
        ],

        // 2013-12-30aRagexe
        20131230: [
            [PACKET.CZ.REQUEST_ACT, 0x0871, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x02c4, 10, 2, 4, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x034f, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x0438, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x094a, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x092a, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0860, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0968, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0895, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x091e, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x096a, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x0926, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0898, 6, 2],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x087b, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0369, 2, 0],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x093d, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x087f, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0969, 6, 2],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x094c, 2, 0],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0365, -1, 2, 4, 8, 9, 89],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x091f, 18, 2, 4],
            // packet(0x093E,8); // CZ_JOIN_BATTLE_FIELD
            [PACKET.CZ.ITEMLISTWIN_RES, 0x022d, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x089c, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.PARTY_JOIN_REQ, 0x08a9, 26, 2],
            // packet(0x087E,4); // CZ_GANGSI_RANK
            [PACKET.CZ.ADD_FRIENDS, 0x0943, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0949, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x091d, 36, 0],
        ],

        // 2014-01-15eRagexe
        20140115: [
            [PACKET.CZ.REQUEST_ACT, 0x0369, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x083c, 10, 2, 4, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x0437, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x035f, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x08a7, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x0940, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0361, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x088e, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0367, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0438, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0366, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x0802, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0368, 6, 2],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0360, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0817, 2, 0],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0815, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x096a, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x088a, 6, 2],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0965, 2, 0],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0815, -1, 2, 4, 8, 9, 89],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x096a, 18, 2, 4],
            // packet(0x088A,8); // CZ_JOIN_BATTLE_FIELD
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0965, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x0966, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.PARTY_JOIN_REQ, 0x095d, 26, 2],
            // packet(0x095B,4); // CZ_GANGSI_RANK
            [PACKET.CZ.ADD_FRIENDS, 0x089b, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x092d, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0865, 36, 0],
        ],

        // 2014-02-05bRagexe
        20140205: [
            [PACKET.CZ.REQUEST_ACT, 0x0369, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x083c, 10, 2, 4, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x0437, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x035f, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0202, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x07e4, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0362, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x07ec, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0364, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0438, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0366, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x096a, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0368, 6, 2],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0838, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0835, 2, 0],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0819, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x0811, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0360, 6, 2],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0817, 2, 0],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0815, -1, 2, 4, 8, 9, 89],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x0365, 18, 2, 4],
            // packet(0x0363,8); // CZ_JOIN_BATTLE_FIELD
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0281, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x022d, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.PARTY_JOIN_REQ, 0x0802, 26, 2],
            // packet(0x0436,4); // CZ_GANGSI_RANK
            [PACKET.CZ.ADD_FRIENDS, 0x023b, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0361, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0938, 36, 0],
        ],

        // 2014-03-05bRagexe
        20140305: [
            [PACKET.CZ.REQUEST_ACT, 0x0369, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x083c, 10, 2, 4, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x0437, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x035f, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0815, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x0202, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0362, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x07ec, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0364, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0436, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0366, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x096a, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0368, 6, 2],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0838, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0835, 2, 0],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0819, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x0811, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0360, 6, 2],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0817, 2, 0],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0361, -1, 2, 4, 8, 9, 89],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x0365, 18, 2, 4],
            // packet(0x0363,8); // CZ_JOIN_BATTLE_FIELD
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0281, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x0438, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.PARTY_JOIN_REQ, 0x0802, 26, 2],
            // packet(0x0878,4); // CZ_GANGSI_RANK
            [PACKET.CZ.ADD_FRIENDS, 0x07e4, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0934, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x095e, 36, 0],
            [PACKET.CZ.REQ_OPEN_WRITE_MAIL, 0x0a08, 5],
        ],

        // 2014-04-02gRagexe
        20140402: [
            [PACKET.CZ.REQUEST_ACT, 0x0946, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x0868, 10, 2, 4, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x093f, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x0950, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0360, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x0958, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0882, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x095c, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x085b, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0364, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x092d, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x088a, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x07ec, 6, 2],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0965, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x085d, 2, 0],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0933, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x091f, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x023b, 6, 2],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0867, 2, 0],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0944, -1, 2, 4, 8, 9, 89],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x08ac, 18, 2, 4],
            // packet(0x094C,8); // CZ_JOIN_BATTLE_FIELD
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0883, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x0920, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.PARTY_JOIN_REQ, 0x0890, 26, 2],
            // packet(0x088C,4); // CZ_GANGSI_RANK
            [PACKET.CZ.ADD_FRIENDS, 0x089a, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0896, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0926, 36, 0],
        ],

        // 2014-04-16aRagexe
        20140416: [
            [PACKET.CZ.REQUEST_ACT, 0x0369, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x083c, 10, 2, 4, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x0437, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x035f, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x0202, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x07e4, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0362, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x07ec, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0364, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0438, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0366, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x096a, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x0368, 6, 2],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0838, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0835, 2, 0],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0819, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x0811, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0360, 6, 2],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0817, 2, 0],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0815, -1, 2, 4, 8, 9, 89],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x0365, 18, 2, 4],
            // packet(0x0363,8); // CZ_JOIN_BATTLE_FIELD
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0281, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x022d, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.PARTY_JOIN_REQ, 0x0802, 26, 2],
            // packet(0x0436,4); // CZ_GANGSI_RANK
            [PACKET.CZ.ADD_FRIENDS, 0x023b, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0361, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x095c, 36, 0],
        ],

        // 2014-10-16aRagexe
        20141016: [
            [PACKET.CZ.CHANGE_DIRECTION, 0x0967, 5, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x022d, 8, 2, 4],
            // packet(0x0363,8); // CZ_JOIN_BATTLE_FIELD
            [PACKET.CZ.ENTER, 0x086e, 19, 2, 6, 10, 14, 18],
            // packet(0x0922,4); // CZ_GANGSI_RANK
            [PACKET.CZ.ADD_FRIENDS, 0x094b, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0364, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0936, 36, 0],
            // packet(0x09DF,7);
            // packet(0x0a00,269);
            // packet(0x0A19,2,clif->pRouletteOpen,0);     // HEADER_CZ_REQ_OPEN_ROULETTE
            // packet(0x0A1A,23);                          // HEADER_ZC_ACK_OPEN_ROULETTE
            // packet(0x0A1B,2,clif->pRouletteInfo,0);     // HEADER_CZ_REQ_ROULETTE_INFO
            // packet(0x0A1C,-1);                          // HEADER_ZC_ACK_ROULEITTE_INFO
            // packet(0x0A1D,2,clif->pRouletteClose,0);    // HEADER_CZ_REQ_CLOSE_ROULETTE
            // packet(0x0A1E,3);                           // HEADER_ZC_ACK_CLOSE_ROULETTE
            // packet(0x0A1F,2,clif->pRouletteGenerate,0); // HEADER_CZ_REQ_GENERATE_ROULETTE
            // packet(0x0A20,21);                          // HEADER_ZC_ACK_GENERATE_ROULETTE
            // packet(0x0A21,3,clif->pRouletteRecvItem,2); // HEADER_CZ_RECV_ROULETTE_ITEM
            // packet(0x0A22,5);                           // HEADER_ZC_RECV_ROULETTE_ITEM
        ],

        // 2014-10-22bRagexe
        20141022: [
            [PACKET.CZ.CHANGE_DIRECTION, 0x08ad, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x094e, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x087d, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0878, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x08aa, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x023b, 10, 2, 4, 6, 8],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0835, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0940, 2, 0],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x0955, 18, 2, 4],
            // packet(0x092B,8); // CZ_JOIN_BATTLE_FIELD
            [PACKET.CZ.ENTER, 0x093b, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.PARTY_JOIN_REQ, 0x0896, 26, 2],
            // packet(0x08AB,4); // CZ_GANGSI_RANK
            [PACKET.CZ.ADD_FRIENDS, 0x091a, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0899, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0438, 36, 0],
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0281, -1, 2, 4, 8, 12],
        ],

        // 2015-04-22aRagexeRE
        20150422: [
            [PACKET.CZ.CHANGE_DIRECTION, 0x0202, 5, 2, 4],
            [PACKET.CZ.ENTER, 0x022d, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.ACK_REQ_ADD_FRIENDS, 0x023b, 26, 2],
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0281, -1, 2, 4, 8],
            [PACKET.CZ.REQUEST_TIME, 0x035f, 6, 2],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0360, 6, 2],
            [PACKET.CZ.COMMAND_MER, 0x0361, 5, 2, 4],
            [PACKET.CZ.ITEM_THROW, 0x362, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0364, 8, 2, 4],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x0365, 18, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x366, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME_BYGID, 0x368, 6, 2],
            [PACKET.CZ.REQUEST_ACT, 0x0369, 7, 2, 6],
            [PACKET.CZ.REQUEST_MOVE, 0x0437, 5, 2],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0438, 10, 2, 4, 6, 8],
            [PACKET.CZ.ITEM_PICKUP, 0x07e4, 6, 2],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x07ec, 8, 2, 4],
            [PACKET.CZ.PARTY_JOIN_REQ, 0x0802, 26, 2],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x0811, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x0815, -1, 2, 4, 8, 9, 89],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x0817, 2, 0],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x0819, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0835, 2, 0],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0838, 12, 2, 6, 10],
            [PACKET.CZ.USE_SKILL, 0x083c, 10, 2, 4, 6],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0995, 36, 0],
            [PACKET.CZ.REQNAME, 0x096a, 6, 2],
        ],

        // 2015-05-13aRagexe
        20150513: [
            [PACKET.CZ.CHANGE_DIRECTION, 0x0924, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x0958, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0885, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0879, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x0864, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0438, 10, 2, 4, 6, 8],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0838, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0835, 2, 0],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x022d, 2, 0],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x0883, 18, 2, 4],
            // packet(0x02C4,8); // CZ_JOIN_BATTLE_FIELD
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0960, -1, 2, 4, 8],
            [PACKET.CZ.ENTER, 0x0363, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.PARTY_JOIN_REQ, 0x094a, 26, 2],
            // packet(0x0927,4); // CZ_GANGSI_RANK
            [PACKET.CZ.ADD_FRIENDS, 0x08a8, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x0817, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0923, 36, 0],
            // packet(0x09e8,11); //CZ_OPEN_MAILBOX
            // packet(0x0a2e,6); //TITLE
        ],

        20161012: [
            [PACKET.CZ.REFINING_SELECT_ITEM, 0x0aa1, 2, 0], //0x0aa1 //int16 packetType; int16 index;
            [PACKET.CZ.REQ_REFINING, 0x0aa3, 2, 0], //0x0aa3
            [PACKET.CZ.CLOSE_REFINING_UI, 0x0aa4, 2, 0], //0x0aa4
        ],

        20170607: [
            [PACKET.CZ.ENTER, 0x0871, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.ITEM_PICKUP, 0x0897, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x0864, 6, 2, 4],
            [PACKET.CZ.CHANGE_DIRECTION, 0x085a, 5, 2, 4],
            [PACKET.CZ.ITEMLISTWIN_RES, 0x0361, -1, 2, 4, 8],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0364, 36, 0],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x089d, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x088a, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0927, 10, 2, 4, 6, 8],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x0875, 12, 2, 6, 10],
            [PACKET.CZ.SEARCH_STORE_INFO_NEXT_PAGE, 0x0917, 2, 0],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x093d, 2, 0],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x0918, 18, 2, 4],
        ],
        20170614: [
            [PACKET.CZ.ITEM_THROW, 0x0367, 6, 2, 4], //packet(0x0367,6,clif_parse_DropItem,2,4);
            [PACKET.CZ.REQUEST_MOVE, 0x0361, 5, 2], //packet(0x0361,5,clif_parse_WalkToXY,2);
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x0437, 36, 0], //packet(0x0437,36,clif_parse_StoragePassword,0);
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x0838, 10, 2, 4, 6, 8], //packet(0x0838,10,clif_parse_UseSkillToPos,2,4,6,8);
            [PACKET.CZ.REQUEST_ACT, 0x083c, 7, 2, 6], //packet(0x083C,7,clif_parse_ActionRequest,2,6);
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x0860, 6, 2], //packet(0x0860,6,clif_parse_ReqClickBuyingStore,2);
            [PACKET.CZ.ADD_FRIENDS, 0x0867, 26, 2], //packet(0x0867,26,clif_parse_FriendsListAdd,2);
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x086b, 2, 0], //packet(0x086B,2,clif_parse_ReqCloseBuyingStore,0);
            [PACKET.CZ.SEARCH_STORE_INFO, 0x086c, -1, 2, 4, 5, 9, 13, 14, 15], //packet(0x086C,-1,clif_parse_SearchStoreInfo,2,4,5,9,13,14,15);
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x0877, 18, 2, 4], //packet(0x0877,18,clif_parse_PartyBookingRegisterReq,2,4);
            [PACKET.CZ.CHANGE_DIRECTION, 0x087e, 5, 2, 4], //packet(0x087E,5,clif_parse_ChangeDir,2,4);
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x0889, 90, 2, 4, 6, 8, 10], //packet(0x0889,90,clif_parse_UseSkillToPosMoreInfo,2,4,6,8,10);
            [PACKET.CZ.REQ_JOIN_GROUP, 0x0899, 26, 2], //packet(0x0899,26,clif_parse_PartyInvite2,2);
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x089d, -1, 2, 4, 8, 12],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x08a2, -1, 2, 4, 8, 9, 89], //packet(0x08A2,-1,clif_parse_ReqOpenBuyingStore,2,4,8,9,89);
            [PACKET.CZ.ITEM_PICKUP, 0x08ad, 6, 2], //packet(0x08AD,6,clif_parse_TakeItem,2);
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x092f, -1, 2, 4, 8, 12], //packet(0x092F,-1,clif_parse_ReqTradeBuyingStore,2,4,8,12);
            [PACKET.CZ.USE_SKILL, 0x091b, 10, 2, 4, 6], //packet(0x091B,10,clif_parse_UseSkillToId,2,4,6);
            //packet(0x0928,2,clif_parse_SearchStoreInfoNextPage,0);
            [PACKET.CZ.REQNAME, 0x0936, 6, 2], //packet(0x0936,6,clif_parse_GetCharNameRequest,2);
            [PACKET.CZ.ENTER, 0x0944, 19, 2, 6, 10, 14, 18], //packet(0x0944,19,clif_parse_WantToConnection,2,6,10,14,18);
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x0879, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x023b, 8, 2, 4],

            /*
			// 2017-06-14bRagexeRE
			packet(0x0364,5,clif_parse_HomMenu,2,4);
			//packet(0x0865,4,NULL,0); // CZ_GANGSI_RANK
			packet(0x0866,6,clif_parse_TickSend,2);
			packet(0x087D,6,clif_parse_SolveCharName,2);
			//packet(0x0957,8,NULL,0); // CZ_JOIN_BATTLE_FIELD
			packet(0x0963,12,clif_parse_SearchStoreInfoListItemClick,2,6,10);
			*/
        ],
        20180207: [
            [PACKET.CZ.USE_SKILL_TOGROUND, 0xaf4, 0xb, 0x2, 0x4, 0x6, 0x8, 0xa],
        ],
        20180307: [
            [PACKET.CZ.ADD_FRIENDS, 0x202, 26, 2],
            [PACKET.CZ.COMMAND_MER, 0x22d, 5, 2, 4],
            [PACKET.CZ.ACK_STORE_PASSWORD, 0x23b, 36, 0],
            [PACKET.CZ.REQ_JOIN_GROUP, 0x2c4, 26, 2],
            [PACKET.CZ.REQUEST_MOVE, 0x35f, 5, 2],
            [PACKET.CZ.REQUEST_TIME, 0x360, 6, 2],
            [PACKET.CZ.CHANGE_DIRECTION, 0x361, 5, 2, 4],
            [PACKET.CZ.ITEM_PICKUP, 0x362, 6, 2],
            [PACKET.CZ.ITEM_THROW, 0x363, 6, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE, 0x364, 8, 2, 4],
            [PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY, 0x365, 8, 2, 4],
            [PACKET.CZ.USE_SKILL_TOGROUND, 0x366, 10, 2, 4, 6, 8],
            [PACKET.CZ.USE_SKILL_TOGROUNDMoreInfo, 0x367, 90, 2, 4, 6, 8, 10],
            [PACKET.CZ.REQNAME, 0x368, 6, 2],
            [PACKET.CZ.REQNAME_BYGID, 0x369, 6, 2],
            [PACKET.CZ.ENTER, 0x436, 19, 2, 6, 10, 14, 18],
            [PACKET.CZ.REQUEST_ACT, 0x437, 7, 2, 6],
            [PACKET.CZ.USE_SKILL, 0x438, 10, 2, 4, 6],
            [PACKET.CZ.ITEMLISTWIN_RES, 0x7e4, -1, 2, 4, 8, 12],
            [PACKET.CZ.PARTY_BOOKING_REQ_REGISTER, 0x802, 18, 2, 4],
            [PACKET.CZ.REQ_OPEN_BUYING_STORE, 0x811, -1, 2, 4, 8, 9, 0x59],
            [PACKET.CZ.REQ_CLOSE_BUYING_STORE, 0x815, 2, 0],
            [PACKET.CZ.REQ_CLICK_TO_BUYING_STORE, 0x817, 6, 2],
            [PACKET.CZ.REQ_TRADE_BUYING_STORE, 0x819, -1, 2, 4, 8, 12],
            [PACKET.CZ.SEARCH_STORE_INFO, 0x835, -1, 2, 4, 5, 9, 13, 14, 15],
            [PACKET.CZ.SSILIST_ITEM_CLICK, 0x83c, 12, 2, 6, 10],
        ],
    };
});
