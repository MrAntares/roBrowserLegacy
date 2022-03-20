/**
 * UI/Components/WorldMap/WorldMap.js
 *
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author IssID
 */
define(function (require) {
    'use strict';

    /**
     * Dependencies
     */
    var DB           = require('DB/DBManager');
    var Client       = require('Core/Client');
    var Preferences  = require('Core/Preferences');
    var Renderer     = require('Renderer/Renderer');
    var UIManager    = require('UI/UIManager');
    var UIComponent  = require('UI/UIComponent');
    var htmlText     = require('text!./WorldMap.html');
    var cssText      = require('text!./WorldMap.css');

    /**
     * Create Component
     */
    var WorldMap = new UIComponent('WorldMap', htmlText, cssText);

    /**
     * @var {Preferences} window preferences
     */
    var _preferences = Preferences.get('WorldMap', {
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
    };

    function onSelect() {
        resize(WorldMap.ui.find('.titlebar select').val());
    }


    /**
     * Extend WorldMap window size
     */
    function resize(name = 'worldmap.bmp') {
        // Load tabs
        Client.loadFile(DB.INTERFACE_PATH + name, function (data) {
            WorldMap.ui.find('.map .content')
                .css('backgroundImage', 'url("' + data + '")')
                .css('backgroundSize', '100% 100%')
                .css({position: 'absolute', width: '100%', height: '100%'})
        });
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
