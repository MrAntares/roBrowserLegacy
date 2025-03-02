/**
 * UI/Components/HomunInformations/HomunInformations.js
 *
 * Display homunculus informations
 *
 * @author IssID
 */
define(function (require) {
    'use strict';


    /**
     * Dependencies
     */
    var DB = require('DB/DBManager');
    var Client = require('Core/Client');
    var Preferences = require('Core/Preferences');
    var Renderer = require('Renderer/Renderer');
    var EntityManager = require('Renderer/EntityManager');
    var UIManager = require('UI/UIManager');
    var UIComponent = require('UI/UIComponent');
    var SkillListMH = require('UI/Components/SkillListMH/SkillListMH');
    var htmlText = require('text!./HomunInformations.html');
    var cssText = require('text!./HomunInformations.css');
    var Session = require('Engine/SessionStorage');
    var AIDriver = require('Core/AIDriver');
    var PACKETVER = require('Network/PacketVerManager');

    var autoFeedInterval;
    var autoFeedIntervalMs = 1000 * 60 * 1; // feed every 1 minutes when auto feed is enabled

    /**
     * Create Component
     */
    var HomunInformations = new UIComponent('HomunInformations', htmlText, cssText);

    /**
     * @var {Preferences} Window preferences (localStorage)
     */
    var _preferences = Preferences.get('HomunInformations', {
        x: 100,
        y: 200,
        show: false,
        autoFeed: 0,
    }, 1.0);

    /**
     * Initialize component
     */
    HomunInformations.init = function init() {
        this.draggable(this.ui.find('.content'));

        this.ui.find('.base').mousedown(stopPropagation);
        this.ui.find('.close').click(onClose);
        this.ui.find('.modify').click(onChangeName);
        this.ui.find('.feed').click(onFeed);
        this.ui.find('.del').click(onDelete);
        this.ui.find('.homun_auto_feed').click(homunToggleAutoFeed);

        if (!_preferences.show) {
            this.ui.hide();
        }

        this.ui.css({
            top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
            left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
        });

        this.ui.find('.skill').mousedown(function () {
            SkillListMH.homunculus.toggle()
        });

        // If no aggressive level defined, default to 1
        // otherwise toggle and untoggle to remain the same
        this.toggleAggressive();
        this.toggleAggressive();

        // added support to autofeed for older clients with setInterval
        if (PACKETVER.value < 20170920) {
            // feed homunculus every 1 minutes when auto feed is enabled
            // and homunculus hunger is below 90%
            // feed should restore about 10% hunger
            // 1 hunger is lost every 60 seconds
            autoFeedInterval = window.setInterval(function () {
                if (!Session.homunId) return;
                if (_preferences.autoFeed != 1) return;
                var entity = EntityManager.get(Session.homunId);
                if (!entity) return;
                // check if homunculus hunger is below 90% before feed
                if (entity.life.hunger >= 90) return console.log('homun full', entity.life.hunger);
                // feed from 89% to 99% full, restore about 10% hunger
                HomunInformations.sendHomunFeed();
            }, autoFeedIntervalMs);
        }
    };

    HomunInformations.onAppend = function onAppend() {
        Client.loadFile(DB.INTERFACE_PATH + 'checkbox_' + (_preferences.autoFeed ? '1' : '0') + '.bmp', function (data) {
            HomunInformations.ui.find('.homun_auto_feed').css('backgroundImage', 'url(' + data + ')');
        });

        // added support to autofeed for older clients with setInterval
        // if (PACKETVER.value < 20170920) {
        //     HomunInformations.ui.find('.feeding').hide();
        // }
    }

    HomunInformations.stopAutoFeed = function stopAutoFeed() {
        window.clearInterval(autoFeedInterval);
    }

    /**
     * feed homunculus
     */
    function onFeed() {
        HomunInformations.reqHomunFeed();
    }

    /**
     * delete homunculus
     */
    function onDelete() {
        HomunInformations.reqDeleteHomun();
        return true;
    }


    /**
     * Once remove from body, save user preferences
     */
    HomunInformations.onRemove = function onRemove() {
        // Save preferences
        _preferences.show = this.ui.is(':visible');
        _preferences.y = parseInt(this.ui.css('top'), 10);
        _preferences.x = parseInt(this.ui.css('left'), 10);
        _preferences.save();
        this.stopAI();
    };


    /**
     * Process shortcut
     *
     * @param {object} key
     */
    HomunInformations.onShortCut = function onShortCut(key) {
        // Not in body
        if (!this.ui) {
            return;
        }

        switch (key.cmd) {
            case 'TOGGLE':
                if (Session.homunId) {
                    this.ui.toggle();
                    if (this.ui.is(':visible')) {
                        this.focus();
                    }
                    if (!this.ui.is(':visible')) {
                        SkillListMH.homunculus.ui.hide();
                    }
                } else {
                    SkillListMH.homunculus.ui.hide();
                    this.ui.hide();
                }
                break;
            case 'AGGRESSIVE':
                this.toggleAggressive();
                break;
        }
    };


    /**
     * Update UI
     *
     * @param {object} homunculus info
     */
    HomunInformations.setInformations = function setInformations(info) {
        this.ui.find('.name').val(info.szName);
        this.ui.find('.level').text(info.nLevel);

        this.ui.find('.stats .atk').text(info.atk);
        this.ui.find('.stats .Matk').text(info.Matk);
        this.ui.find('.stats .hit').text(info.hit);
        this.ui.find('.stats .critical').text(info.critical);
        this.ui.find('.stats .def').text(info.def);
        this.ui.find('.stats .Mdef').text(info.Mdef);
        this.ui.find('.stats .flee').text(info.flee);
        this.ui.find('.stats .aspd').text(Math.floor(200 - info.aspd / 10));

        this.setHpSpBar('hp', info.hp, info.maxHP);
        this.setHpSpBar('sp', info.sp, info.maxSP);

        this.setExp(info.exp, info.maxEXP);
        this.setHunger(info.nFullness);
        this.setIntimacy(info.nRelationship);

        if (info.bModified < 5) {
            this.ui.find('.name, .modify').removeClass('disabled').attr('disabled', false);
        } else {
            this.ui.find('.name, .modify').addClass('disabled').attr('disabled', true);
        }

        SkillListMH.homunculus.setPoints(info.SKPoint);
    };


    /**
     * Set hp and sp bar (menu)
     *
     * @param type
     * @param val
     * @param val2
     */
    HomunInformations.setHpSpBar = function setHpSpBar(type, val, val2) {
        var perc = Math.floor(val * 100 / val2);
        var color = perc < 25 ? 'red' : 'blue';
        this.ui.find('.' + type + '_value').text(val);
        this.ui.find('.' + type + '_max_value').text(val2);
        this.ui.find('.' + type + '_perc').text(perc + '%');

        if (perc <= 0) {
            this.ui.find('.' + type + '_bar div').css('backgroundImage', 'none');
        }

        Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/gze' + color + '_left.bmp', function (url) {
            this.ui.find('.' + type + '_bar_left').css('backgroundImage', 'url(' + url + ')');
        }.bind(this));

        Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/gze' + color + '_mid.bmp', function (url) {
            this.ui.find('.' + type + '_bar_middle').css({
                backgroundImage: 'url(' + url + ')',
                width: Math.floor(Math.min(perc, 100) * 0.75) + 'px'
            });
        }.bind(this));

        Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/gze' + color + '_right.bmp', function (url) {
            this.ui.find('.' + type + '_bar_right').css({
                backgroundImage: 'url(' + url + ')',
                left: Math.floor(Math.min(perc, 100) * 1.27) + 'px'
            });
        }.bind(this));

        this.ui.find('.' + type + '2').text(val + '/' + val2);
    }


    /**
     * Set intimacy
     *
     * @param {number} intimacy
     */
    HomunInformations.setIntimacy = function setIntimacy(val) {
        if (!this.ui) {
            return;
        }

        this.ui.find('.intimacy').text(DB.getMessage(
            val < 100 ? 672 :
                val < 250 ? 673 :
                    val < 600 ? 669 :
                        val < 900 ? 674 :
                            675
        ));
    };


    /**
     * Set exp value
     *
     * @param exp
     * @param maxEXP
     */
    HomunInformations.setExp = function setExp(exp, maxEXP) {
        if (!this.ui) {
            return;
        }

        var canvasExp = this.ui.find('.block2 canvas.life.title_exp');
        var ctx = canvasExp.get(0).getContext('2d')

        var width = 60, height = 5;
        var exp_per = exp / maxEXP;

        // // border
        // ctx.fillStyle = '#10189c';
        // ctx.fillRect( 0, 0, width, height );

        // empty
        ctx.fillStyle = '#424242';
        ctx.fillRect(1, 1, width - 2, height - 2);

        ctx.fillStyle = '#205cc3';
        ctx.fillRect(1, 1, Math.round((width - 2) * exp_per), 3);

        this.ui.find('.exp').text(exp + '/' + maxEXP);
    }


    /**
     * Set hunger value
     *
     * @param {number} hunger
     */
    HomunInformations.setHunger = function setHunger(val) {
        if (!this.ui) {
            return;
        }

        var canvasHunger = this.ui.find('.block2 canvas.life.title_hunger');
        var ctx = canvasHunger.get(0).getContext('2d')

        var width = 60, height = 5;
        var hunger_per = val / 100;

        // // border
        // ctx.fillStyle = '#10189c';
        // ctx.fillRect( 0, 0, width, height );

        // empty
        ctx.fillStyle = '#424242';
        ctx.fillRect(1, 1, width - 2, height - 2);

        ctx.fillStyle = (hunger_per < 0.25) ? '#ff1e00' : '#205cc3';
        ctx.fillRect(1, 1, Math.round((width - 2) * hunger_per), 3);

        this.ui.find('.hunger').text(val + '/' + 100);
    };

    HomunInformations.toggleAggressive = function toggleAggressive() {
        let agr = localStorage.getItem('HOM_AGGRESSIVE') == 0 ? 1 : 0;
        localStorage.setItem('HOM_AGGRESSIVE', agr);
    };

    HomunInformations.startAI = function startAI() {
        this.stopAI();
        AIDriver.homunculus.reset();
        this.AILoop = setInterval(function () {
            if (Session.homunId) {
                var entity = EntityManager.get(Session.homunId);
                if (entity) {
                    AIDriver.homunculus.exec('AI(' + Session.homunId + ')')
                }
            }
        }, 100);
    };

    HomunInformations.stopAI = function stopAI() {
        if (this.AILoop) {
            clearInterval(this.AILoop);
        }
    };

    HomunInformations.resetAI = function resetAI() {
        this.stopAI();
        this.startAI();
    };

    HomunInformations.setFeedConfig = function setFeedConfig(flag) {
        _preferences.autoFeed = flag;
        _preferences.save();
        // server sent this info before of homun
        if (HomunInformations.ui) {
            Client.loadFile(DB.INTERFACE_PATH + 'checkbox_' + (_preferences.autoFeed ? '1' : '0') + '.bmp', function (data) {
                HomunInformations.ui.find('.homun_auto_feed').css('backgroundImage', 'url(' + data + ')');
            });
        }
    }

    /**
     * Toggle AutoFeed
     */
    function homunToggleAutoFeed() {
        HomunInformations.setFeedConfig(_preferences.autoFeed == 1 ? 0 : 1);
        if (PACKETVER.value < 20170920) return;
        HomunInformations.onConfigUpdate(3, !_preferences.autoFeed ? 1 : 0);
    }

    /**
     * Request to modify homun's name
     */
    function onChangeName() {
        var input = HomunInformations.ui.find('.name');
        HomunInformations.reqNameEdit(input.val());
    }


    /**
     * Closing window
     */
    function onClose() {
        HomunInformations.ui.hide();
        SkillListMH.homunculus.ui.hide();
    }


    /**
     * Stop event propagation
     */
    function stopPropagation(event) {
        event.stopImmediatePropagation();
        return false;
    }


    /**
     * Functions defined in Engine/MapEngine/Homun.js
     */
    HomunInformations.reqHomunFeed = function reqHomunFeed() { };
    HomunInformations.reqNameEdit = function reqNameEdit() { };
    HomunInformations.reqAttack = function reqAttack() { };
    HomunInformations.reqMoveTo = function reqMoveTo() { };
    HomunInformations.reqMoveToOwner = function reqMoveToOwner() { };

    HomunInformations.reqHomunAction = function reqHomunAction() { };
    HomunInformations.onConfigUpdate = function onConfigUpdate(/* type, value*/) { };


    /**
     * Create component and export it
     */
    return UIManager.addComponent(HomunInformations);
});
