/**
 * UI/Components/PincodeWindow/PincodeWindow.js
 *
 * Pincode windows
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Disaml
 */
define(function(require)
{
    'use strict';


    /**
     * Dependencies
     */
    var DB                 = require('DB/DBManager');
    var Preferences        = require('Core/Preferences');
    var Renderer           = require('Renderer/Renderer');
    var UIManager          = require('UI/UIManager');
    var UIComponent        = require('UI/UIComponent');
    var htmlText           = require('text!./PincodeWindow.html');
    var cssText            = require('text!./PincodeWindow.css');


    /**
     * Pincode Window namespace
     */
    var PincodeWindow = new UIComponent( 'PincodeWindow', htmlText, cssText );


    /**
     * @var {Preference} window preferences
     */
    var _preferences = Preferences.get('PincodeWindow', {
        x: 540,
        y: 320
    }, 1.0);


    var sel_input = 0;


    /**
     * Initialize UI
     */
    PincodeWindow.init = function init() {
        var ui = this.ui;

        ui.css({
            top: (Renderer.height - 358) / 2,
            left: (Renderer.width - 576) / 2
        });

        // Bind buttons
        ui.find('.btn2.cancel').click(cancel);
        ui.find('.btn2.ok').click(success);
        ui.find('.btn.num1').click(keyNum('1'));
        ui.find('.btn.num2').click(keyNum('2'));
        ui.find('.btn.num3').click(keyNum('3'));
        ui.find('.btn.num4').click(keyNum('4'));
        ui.find('.btn.num5').click(keyNum('5'));
        ui.find('.btn.num6').click(keyNum('6'));
        ui.find('.btn.num7').click(keyNum('7'));
        ui.find('.btn.num8').click(keyNum('8'));
        ui.find('.btn.num9').click(keyNum('9'));
        ui.find('.btn.num0').click(keyNum('0'));
        ui.find('.numReset').click(keyNum('10'));
        //ui.find('.btn.num3').click(suppress);

        // Don't activate drag drop when clicking on buttons
        ui.find('.titlebar .base').mousedown(stopPropagation);

        this.draggable(ui.find('.titlebar'));
    };

    /**
     * Once append to body
     */
    PincodeWindow.onAppend = function onAppend() {
        // Start rendering
        Renderer.render(render);
    };


    /**
     * Stop rendering
     */
    PincodeWindow.onRemove = function onRemove() {
        Renderer.stop();
    };


    /**
     * Stop an event to propagate
     */
    function stopPropagation(event) {
        event.stopImmediatePropagation();
        return false;
    }

    function success() {
        var ui = PincodeWindow.ui;

        PincodeWindow.onPincodeCheckRequest(
            ui.find('.pass').val()
        );
    }


    /**
     * Press "cancel" or ESCAPE key
     */
    function cancel() {
        UIManager.showPromptBox(DB.getMessage(17), 'ok', 'cancel', function () {
            PincodeWindow.onExitRequest();
        }, null);
    }


    function keyNum(num) {
        var ui = PincodeWindow.ui;
        switch (PincodeWindow.sel_input) {
            case 1:
                if (num === '10') {
                    ui.find('.newpass').text('');
                }
                else {
                    ui.find('.newpass').text(num);
                }
                break;
            case 2:
                if (num === '10') {
                    ui.find('.checkpass').text('');
                }
                else {
                    ui.find('.checkpass').text(num);
                }
                break;
            default:
                if (num === '10') {
                    ui.find('.pass').text('');
                }
                else {
                    ui.find('.pass').text(num);
                }
                break;
        }
    }


    /**
     * Method to define
     */
    PincodeWindow.onPincodeCheckRequest = function onPincodeCheckRequest() { };
    PincodeWindow.onExitRequest = function onExitRequest() { };


    function render() {

    }


    /**
     * Create componentand export it
     */
    return UIManager.addComponent(PincodeWindow);
});
