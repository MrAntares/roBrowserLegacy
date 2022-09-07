/**
 * UI/Components/CharSelect/CharSelect.js
 *
 * Chararacter Selection windows
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function(require)
{
    'use strict';


    /**
     * Dependencies
     */
    var DB                 = require('DB/DBManager');
    var MonsterTable       = require('DB/Monsters/MonsterTable');
    var Preferences        = require('Core/Preferences');
    var Client             = require('Core/Client');
    var KEYS               = require('Controls/KeyEventHandler');
    var Renderer           = require('Renderer/Renderer');
    var Entity             = require('Renderer/Entity/Entity');
    var SpriteRenderer     = require('Renderer/SpriteRenderer');
    var Camera             = require('Renderer/Camera');
    var UIManager          = require('UI/UIManager');
    var UIComponent        = require('UI/UIComponent');
    var htmlText           = require('text!./CharSelectV2.html');
    var cssText            = require('text!./CharSelectV2.css');


    /**
     * Create Chararacter Selection namespace
     */
    var CharSelectV2 = new UIComponent( 'CharSelectV2', htmlText, cssText );


    /**
     * @var {Preferences} save where the cursor position is
     */
    var _preferences = Preferences.get('CharSelectV2', {
        index: 0
    }, 1.0 );


    /**
     * @var {number} max slots
     */
    var _maxSlots = 3 * 9;


    /**
     * var {Array} list of characters
     */
    var _list = [];


    /**
     * @var {Array} list of characters (index by slot)
     */
    var _slots = [];


    /**
     * @var {Array} list of entities (index by slot)
     */
    var _entitySlots = [];


    /**
     * @var {number} selector index
     */
    var _index = 0;


    /**
     * @var {Array} canvas context
     */
    var _ctx = [];


    /**
     * var {number} sex
     */
    var _sex = 0;


    /**
     * Initialize UI
     */
    CharSelectV2.init = function Init()
    {
        var ui = this.ui;

        ui.css({
            top:  (Renderer.height-358)/2,
            left: (Renderer.width-576)/2
        });

        // Bind buttons
        ui.find('.ok'    ).click(connect);
        ui.find('.cancel').click(cancel);
        ui.find('.make'  ).click(create);
        ui.find('.delete').click(suppress);

        ui.find('.arrow.left' ).mousedown(genericArrowDown(-1));
        ui.find('.arrow.right').mousedown(genericArrowDown(+1));

        // Bind canvas
        ui.find('.slot1').mousedown(genericCanvasDown(0));
        ui.find('.slot2').mousedown(genericCanvasDown(1));
        ui.find('.slot3').mousedown(genericCanvasDown(2));

        ui.find('.make1').mousedown(function (e){ genericCanvasDown(0)(e);  create(); });
        ui.find('.make2').mousedown(function (e){ genericCanvasDown(1)(e);  create(); });
        ui.find('.make3').mousedown(function (e){ genericCanvasDown(2)(e);  create(); });

        ui.find('canvas').
        dblclick(function(){
            if (_slots[_index]) {
                connect();
            }
            else {
                create();
            }
        }).
        each(function(){
            _ctx.push( this.getContext('2d') );
        });

        this.draggable();
    };


    /**
     * Once append to body
     */
    CharSelectV2.onAppend = function onAppend()
    {
        _index = _preferences.index;

        this.ui.find('.slotinfo .number').text( _list.length + ' / ' + _maxSlots );
        this.ui.find('.pageinfo .count').text( _maxSlots / 3 );

        // Update values
        moveCursorTo(_index);

        // Start rendering
        Renderer.render(render);
    };


    /**
     * Stop rendering
     */
    CharSelectV2.onRemove = function onRemove()
    {
        _preferences.index = _index;
        _preferences.save();
        Renderer.stop();
    };


    /**
     * Bind Key events
     *
     * @param {object} event
     */
    CharSelectV2.onKeyDown = function onKeyDown( event )
    {
        switch (event.which) {
            case KEYS.ESCAPE:
                cancel();
                break;

            case KEYS.LEFT:
                moveCursorTo(_index-1);
                break;

            case KEYS.RIGHT:
                moveCursorTo(_index+1);
                break;

            case KEYS.SUPR:
                if (_slots[_index]) {
                    suppress();
                }
                break;

            case KEYS.ENTER:
                if (_slots[_index]) {
                    connect();
                }
                else {
                    create();
                }
                break;

            default:
                return true;
        }

        event.stopImmediatePropagation();
        return false;
    };


    /**
     * Add players to window
     *
     * @param {object} pkt - packet structure
     */
    CharSelectV2.setInfo = function setInfo( pkt )
    {
        _maxSlots           = Math.floor((pkt.TotalSlotNum + pkt.PremiumStartSlot) || 9); // default 9 ?
        _sex                = pkt.sex;
        _slots.length       = 0;
        _entitySlots.length = 0;
        _list.length        = 0;

        if (pkt.charInfo) {
            var i, count = pkt.charInfo.length;
            for (i = 0; i < count; ++i) {
                CharSelectV2.addCharacter( pkt.charInfo[i] );

                // Guess the max slot
                // required if the client is < 20100413 and have more than 9 slots
                _maxSlots = Math.max( _maxSlots, Math.floor(pkt.charInfo[i].CharNum / 3 + 1) * 3 );
            }
        }

        this.ui.find('.slotinfo .number').text( _list.length + ' / ' + _maxSlots );

        moveCursorTo( _index );
    };


    function drawBall(btnList, index, sel) {
        btnList.append('<button class="btn_pageinfo' + index + '" data-background="select_character/page_ball_empty.bmp" data-hover="select_character/page_ball_empty.bmp" data-down="select_character/page_ball_fill.bmp"></button><img width="8px" />');
        if (!sel) {
            Client.loadFile(DB.INTERFACE_PATH + 'select_character/page_ball_empty.bmp', function (data) {
                btnList.find('.btn_pageinfo' + index).css('backgroundImage', 'url("' + data + '")');
            });
        }
        else {
            Client.loadFile(DB.INTERFACE_PATH + 'select_character/page_ball_fill.bmp', function (data) {
                btnList.find('.btn_pageinfo' + index).css('backgroundImage', 'url("' + data + '")');
            });
        }

        btnList.find('.btn_pageinfo' + index).css('border', '0');
        btnList.find('.btn_pageinfo' + index).css('width', '8px');
        btnList.find('.btn_pageinfo' + index).css('height', '8px');
        btnList.find('.btn_pageinfo' + index).css('background-color', 'transparent');
    }


    /**
     * Answer from server to delete a character
     *
     * @param {number} error id
     */
    CharSelectV2.deleteAnswer = function DeleteAnswer( error )
    {
        this.on('keydown');

        switch (error) {
            // Do nothing, just re-set the keydown
            case -2:
                return;

            // Success (clean up character)
            case -1:
                delete _slots[_index];
                delete _entitySlots[_index];

                var i = 0;
                var count = _list.length;

                while (i < count) {
                    if (_list[i].CharNum === _index) {
                        _list.splice( i, 1 );
                        --count;
                    }
                    else {
                        i++;
                    }
                }

                // Refresh UI
                moveCursorTo( _index );
                this.ui.find('.slotinfo .number').text( _list.length + ' / ' + _maxSlots );
                return;

            default: // Others error ?
            case  0: // Incorrect adress email
                UIManager.showMessageBox( DB.getMessage(301), 'ok' );
                break;
        }
    };


    /**
     * Adding a Character to the list
     *
     * @param {object} character data
     */
    CharSelectV2.addCharacter = function addCharacter( character )
    {
        if (!('sex' in character) || character.sex === 99) {
            character.sex = _sex;
        }

        _list.push( character );
        _slots[ character.CharNum ] = character;

        _entitySlots[ character.CharNum ] = new Entity();
        _entitySlots[ character.CharNum ].set( character );
    };


    /**
     * Callback to use
     */
    CharSelectV2.onExitRequest    = function onExitRequest(){};
    CharSelectV2.onDeleteRequest  = function onDeleteRequest(){};
    CharSelectV2.onCreateRequest  = function onCreateRequest(){};
    CharSelectV2.onConnectRequest = function onConnectRequest(){};


    /**
     * Generic method to handle mousedown on arrow
     *
     * @param {number} value to move
     */
    function genericArrowDown( value )
    {
        return function( event ) {
            moveCursorTo((_index + _maxSlots + value) % _maxSlots );
            event.stopImmediatePropagation();
            return false;
        };
    }


    /**
     * Generic method to handle mousedown on arrow
     *
     * @param {number} value to move
     */
    function genericCanvasDown( value )
    {
        return function( event ) {
            moveCursorTo( Math.floor(_index / 3) * 3 + value );
            event.stopImmediatePropagation();
            return false;
        };
    }


    /**
     * Press "cancel" or ESCAPE key
     */
    function cancel()
    {
        UIManager.showPromptBox( DB.getMessage(17), 'ok', 'cancel', function(){
            CharSelectV2.onExitRequest();
        }, null);
    }


    /**
     * Jumping to Character creation window
     */
    function create()
    {
        CharSelectV2.onCreateRequest( _index );
    }


    /**
     * Select Player, connect
     */
    function connect() {
        if (_slots[_index]) {
            _preferences.index = _index;
            _preferences.save();
            CharSelectV2.onConnectRequest( _slots[_index] );
        }
    }


    /**
     * Delete a character
     */
    function suppress() {
        if (_slots[_index]) {
            CharSelectV2.off('keydown');
            CharSelectV2.onDeleteRequest( _slots[_index].GID );
        }
    }


    /**
     * Move cursor, update window value
     *
     * @param {number} index
     */
    function moveCursorTo( index )
    {
        var ui = CharSelectV2.ui;
        var $charinfo = ui.find('.charinfo');

        // Set the last entity to idle
        var entity = _entitySlots[_index];
        if (entity) {
            entity.setAction({
                action: entity.ACTION.IDLE,
                frame:  0,
                play:   true,
                repeat: true
            });
        }

        // Move
        _index = (index + _maxSlots) % _maxSlots;
        ui.find('.box_select').
        removeClass('slot1 slot2 slot3').
        addClass('slot' + (_index % 3 + 1));

        // Set page
        // clear pageinfo
        ui.find('.pageinfo .pagebtn').text('');

        // draw pageinfo button
        for (var i = 1; i <= (_maxSlots / 3); i++) {
            if ((Math.floor(_index / 3) + 1) === i) {
                drawBall(ui.find('.pageinfo .pagebtn'), i, true);
            }
            else {
                drawBall(ui.find('.pageinfo .pagebtn'), i, false);
            }
        }
        // pageinfo position center
        ui.find('.pageinfo').css('left', 576 / 2 - ((_maxSlots / 3) * 8))

        // show make add button
        var mix = ((index+1) % 3) === 0 ? (index+1) - 3 : ((index+1) - ((index+1) % 3));
        mix = (mix >= _maxSlots ? 0 : mix);
        for (var i = 1; i <= 3; i++) {
            ui.find('.make' + i).hide();
            if (!_entitySlots[mix + (i -1)]) {
                ui.find('.make' + i).show();
            }
        }

        // Not found, just clean up.
        entity = _entitySlots[_index];
        if (!entity) {
            $charinfo.find('div').empty();
            ui.find('.make').show();
            ui.find('.delete').hide();
            ui.find('.ok').hide();
            return;
        }

        // Animate the character
        entity.setAction({
            action: entity.ACTION.READYFIGHT,
            frame:  0,
            play:   true,
            repeat: true
        });

        // Bind new value
        ui.find('.make').hide();
        ui.find('.delete').show();
        ui.find('.ok').show();

        var info = _slots[_index];
        $charinfo.find('.name').text( info.name );
        $charinfo.find('.job').text( MonsterTable[info.job] || '' );
        $charinfo.find('.lvl').text( info.level );
        $charinfo.find('.exp').text( info.exp );
        $charinfo.find('.hp').text( info.hp );
        $charinfo.find('.sp').text( info.sp );

        //TODO: Check win_select.bmp size to insert it if needed ?
        $charinfo.find('.map').text( DB.getMapName(info.lastMap, '') || '' );
        $charinfo.find('.str').text( info.Str );
        $charinfo.find('.agi').text( info.Agi );
        $charinfo.find('.vit').text( info.Vit );
        $charinfo.find('.int').text( info.Int );
        $charinfo.find('.dex').text( info.Dex );
        $charinfo.find('.luk').text( info.Luk );
    }


    /**
     * Render sprites to canvas
     */
    function render()
    {
        var i, count, idx;
        var ui = CharSelectV2.ui;

        Camera.direction = 4;
        idx              = Math.floor(_index / 3) * 3;
        count            = _ctx.length;


        for (i = 0; i < count; ++i) {
            _ctx[i].clearRect(0, 0, _ctx[i].canvas.width, _ctx[i].canvas.height);

            if (_entitySlots[idx + i]) {
                SpriteRenderer.bind2DContext(_ctx[i], 63, 130);
                _entitySlots[idx + i].renderEntity();
            }
        }
    }


    /**
     * Create componentand export it
     */
    return UIManager.addComponent(CharSelectV2);
});
