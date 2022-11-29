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
    var KEYS               = require('Controls/KeyEventHandler');
    var Renderer           = require('Renderer/Renderer');
    var Entity             = require('Renderer/Entity/Entity');
    var SpriteRenderer     = require('Renderer/SpriteRenderer');
    var Camera             = require('Renderer/Camera');
    var UIManager          = require('UI/UIManager');
    var UIComponent        = require('UI/UIComponent');
    var htmlText           = require('text!./CharSelectV3.html');
    var cssText            = require('text!./CharSelectV3.css');
    var Client             = require('Core/Client');
    var jQuery    = require('Utils/jquery');


    /**
     * Create Chararacter Selection namespace
     */
    var CharSelectV3 = new UIComponent( 'CharSelectV3', htmlText, cssText );


    /**
     * @var {Preferences} save where the cursor position is
     */
    var _preferences = Preferences.get('CharSelectV3', {
        index: 0
    }, 1.0 );


    /**
     * @var {number} max slots
     */
    var _maxSlots = 15;


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
    CharSelectV3.init = function Init()
    {
        var ui = this.ui;

        // Bind buttons
        ui.find('.ok'    ).click(connect);
        ui.find('.cancel').click(cancel);
        ui.find('.delete').click(suppress);

        // Bind canvas
        ui.find('#slot0').mousedown(genericCanvasDown(0));
        ui.find('#slot1').mousedown(genericCanvasDown(1));
        ui.find('#slot2').mousedown(genericCanvasDown(2));
        ui.find('#slot3').mousedown(genericCanvasDown(3));
        ui.find('#slot4').mousedown(genericCanvasDown(4));
        ui.find('#slot5').mousedown(genericCanvasDown(5));
        ui.find('#slot6').mousedown(genericCanvasDown(6));
        ui.find('#slot7').mousedown(genericCanvasDown(7));
        ui.find('#slot8').mousedown(genericCanvasDown(8));
        ui.find('#slot9').mousedown(genericCanvasDown(9));
        ui.find('#slot10').mousedown(genericCanvasDown(10));
        ui.find('#slot11').mousedown(genericCanvasDown(11));
        ui.find('#slot12').mousedown(genericCanvasDown(12));
        ui.find('#slot13').mousedown(genericCanvasDown(13));
        ui.find('#slot14').mousedown(genericCanvasDown(14));

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


    };


    /**
     * Once append to body
     */
    CharSelectV3.onAppend = function onAppend()
    {
        _index = _preferences.index;
        updateCharSlot();

        // Update values
        moveCursorTo(_index);

        // Start rendering
        Renderer.render(render);
    };


    /**
     * Stop rendering
     */
    CharSelectV3.onRemove = function onRemove()
    {
        _preferences.index = _index;
        _preferences.save();
        _list = [];

        Renderer.stop();
    };


    /**
     * Bind Key events
     *
     * @param {object} event
     */
    CharSelectV3.onKeyDown = function onKeyDown( event )
    {
        switch (event.which) {
            case KEYS.ESCAPE:
                cancel();
                break;

            case KEYS.LEFT:
                moveCursorTo(_index-1 > (_list.length - 1) ? (_list.length - 1) : (_index-1 < 0 ? 0: _index-1));
                break;

            case KEYS.RIGHT:
                moveCursorTo(_index+1 > (_list.length - 1) ? (_list.length - 1) : (_index+1 < 0 ? 0: _index+1));
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
    CharSelectV3.setInfo = function setInfo( pkt )
    {
        _maxSlots           = Math.floor((pkt.TotalSlotNum + pkt.PremiumStartSlot) || 15); // default 9 ?
        _sex                = pkt.sex;
        _slots.length       = 0;
        _entitySlots.length = 0;
        _list.length        = 0;

        if (pkt.charInfo) {
            var i, count = pkt.charInfo.length;
            for (i = 0; i < count; ++i) {
                CharSelectV3.addCharacter( pkt.charInfo[i] );
            }
            updateCharSlot();
        }

        moveCursorTo( _index );
    };


    /**
     * Answer from server to delete a character
     *
     * @param {number} error id
     */
    CharSelectV3.deleteAnswer = function DeleteAnswer( error )
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
    CharSelectV3.addCharacter = function addCharacter( character )
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
    CharSelectV3.onExitRequest    = function onExitRequest(){};
    CharSelectV3.onDeleteRequest  = function onDeleteRequest(){};
    CharSelectV3.onCreateRequest  = function onCreateRequest(){};
    CharSelectV3.onConnectRequest = function onConnectRequest(){};


    /**
     * Generic method to handle mousedown on arrow
     *
     * @param {number} value to move
     */
    function genericCanvasDown( value )
    {
        return function( event ) {
            moveCursorTo( value );
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
            CharSelectV3.onExitRequest();
            updateCharSlot();
        }, null);
    }


    /**
     * Jumping to Character creation window
     */
    function create()
    {
        CharSelectV3.onCreateRequest( _index );
    }


    /**
     * Select Player, connect
     */
    function connect() {
        if (_slots[_index]) {
            _preferences.index = _index;
            _preferences.save();
            CharSelectV3.onConnectRequest( _slots[_index] );
        }
    }


    /**
     * Delete a character
     */
    function suppress() {
        if (_slots[_index]) {
            CharSelectV3.off('keydown');
            CharSelectV3.onDeleteRequest( _slots[_index].GID );
        }
    }


    /**
     * Move cursor, update window value
     *
     * @param {number} index
     */
    function moveCursorTo( index )
    {
        var ui = CharSelectV3.ui;
        var $charinfo = ui.find('.charinfo');
        var bg_uri    = null;
        // Set the last entity to idle
        var entity = _entitySlots[_index];
        if (entity) {
            Client.loadFile( DB.INTERFACE_PATH + "select_character_ver3/img_slot_normal.bmp", function(dataURI) {
                bg_uri = dataURI;
                ui.find('#slot'+ _index).css('backgroundImage', 'url(' + bg_uri + ')');
            });
            entity.setAction({
                action: entity.ACTION.IDLE,
                frame:  0,
                play:   true,
                repeat: true
            });
        }
        _index = index > _maxSlots ? _maxSlots : (index < 0 ? 0: index);

        // Not found, just clean up.
        entity = _entitySlots[_index];
        if (!entity) {
            $charinfo.find('div').empty();
            ui.find('.delete').hide();
            ui.find('.ok').hide();
            return;
        }
        Client.loadFile( DB.INTERFACE_PATH + "select_character_ver3/img_slot_over.bmp", function(dataURI) {
            bg_uri = dataURI;
            ui.find('#slot'+ _index).css('backgroundImage', 'url(' + bg_uri + ')');
        });

        // Animate the character
        entity.setAction({
            action: entity.ACTION.READYFIGHT,
            frame:  0,
            play:   true,
            repeat: true
        });

        // Bind new value
        ui.find('.delete').show();
        ui.find('.ok').show();

        var info = _slots[_index];
        $charinfo.find('.map').text( DB.getMapName(info.lastMap, '') || '' );
        $charinfo.find('.job').text( MonsterTable[info.job] || '' );
        $charinfo.find('.lvl').text( info.level );
        $charinfo.find('.exp').text( info.exp );
        $charinfo.find('.hp').text( info.hp );
        $charinfo.find('.sp').text( info.sp );
        $charinfo.find('.str').text( info.Str );
        $charinfo.find('.agi').text( info.Agi );
        $charinfo.find('.vit').text( info.Vit );
        $charinfo.find('.int').text( info.Int );
        $charinfo.find('.dex').text( info.Dex );
        $charinfo.find('.luk').text( info.Luk );
    }

    function updateCharSlot(){
        for (let i = 0; i < _maxSlots; ++i) {
            jQuery(CharSelectV3.ui.find(".char_canvas")[i]).find('.name').html(_slots[i] !== undefined ? _slots[i].name:"");
        }

        for (let i = 0; i < _maxSlots; i++) {
            if(_slots[i] === undefined){
                var bg_uri;
                const slotNum = i;
                if(CharSelectV3.ui.find('#slot'+ slotNum)){
                    Client.loadFile( DB.INTERFACE_PATH + "select_character_ver3/img_slot2_normal.bmp", function(dataURI) {
                        bg_uri = dataURI;
                        CharSelectV3.ui.find('#slot'+ slotNum).css('backgroundImage', 'url(' + bg_uri + ')');
                    });
                }
            }else{
                CharSelectV3.ui.find('#slot'+ i).css("background-image", "");
            }
        }
    }


    /**
     * Render sprites to canvas
     */
    function render()
    {
        var i, count, idx;

        Camera.direction = 4;
        idx              = Math.floor(_index / _maxSlots) * _maxSlots;
        count            = _ctx.length;


        for (i = 0; i < count; ++i) {
            _ctx[i].clearRect(0, 0, _ctx[i].canvas.width, _ctx[i].canvas.height);

            if (_entitySlots[idx+i]) {
                SpriteRenderer.bind2DContext(_ctx[i], 83, 157);
                _entitySlots[idx+i].renderEntity();
            }
        }
    }


    /**
     * Create componentand export it
     */
    return UIManager.addComponent(CharSelectV3);
});
