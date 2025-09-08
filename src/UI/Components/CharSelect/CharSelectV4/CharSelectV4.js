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
    var htmlText           = require('text!./CharSelectV4.html');
    var cssText            = require('text!./CharSelectV4.css');
    var Client             = require('Core/Client');
    var jQuery             = require('Utils/jquery');


    /**
     * Create Chararacter Selection namespace
     */
    var CharSelectV4 = new UIComponent( 'CharSelectV4', htmlText, cssText );


    /**
     * @var {Preferences} save preferences for the last index
     */
    var _preferences = Preferences.get('CharSelectV4', {
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
     * var for background change
     */
    var img = 0;
    var _curindex = 0;
    var shouldRunBackgroundChange = false;

    let countdownInterval; // Variable to hold the interval

    /**
     * var {boolean} disable input
     */
    var _disable_UI = false;

    /**
     * Initialize UI
     */
    CharSelectV4.init = function Init()
    {
        var ui = this.ui;

        // Bind buttons
        ui.find('.ok'    ).click(connect);
        ui.find('.cancel').click(cancel);
        ui.find('.delete').click(reserve);
        ui.find('.canceldelete').click(removedelete);
        ui.find('.finaldelete').click(suppress);

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
    CharSelectV4.onAppend = function onAppend()
    {
        //_index = _preferences.index;
        const charselectready = CharSelectV4.ui;
        if (charselectready) {
            startCountdownInterval();
        }

        // Update values
        moveCursorTo(_index);

        // Start rendering
        Renderer.render(render);
    };


    /**
     * Stop rendering
     */
    CharSelectV4.onRemove = function onRemove()
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
    CharSelectV4.onKeyDown = function onKeyDown( event )
    {
		if (!this.ui.is(':visible')) return true;
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
    CharSelectV4.setInfo = function setInfo( pkt )
    {
        _maxSlots           = Math.floor((pkt.TotalSlotNum + pkt.PremiumStartSlot) || 15); // default 9 ?
        _sex                = pkt.sex;
        _slots.length       = 0;
        _entitySlots.length = 0;
        _list.length        = 0;

        if (pkt.charInfo) {
            var i, count = pkt.charInfo.length;
            for (i = 0; i < count; ++i) {
                CharSelectV4.addCharacter( pkt.charInfo[i] );
            }
            updateCharSlot();
        }

        moveCursorTo( _index );
    };

    /**
     * Format delay duration
     */
    function formatDuration(seconds) {
		const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        // Use the msgstringtable
        let formattedDuration = DB.getMessage(3349)
        .replace('%d', `${hours}` )
        .replace('%d', `${minutes}`)
        .replace('%d', `${remainingSeconds}`);

        return formattedDuration;
    }

    /**
     * Countdown for delay in deletion
     */
    function updateAllVisibleCountdowns() {
        var charselectready = CharSelectV4.ui;
        if (charselectready) {
            const visibleCountdowns = document.querySelectorAll('.timedelete:not(.hidden)');

            visibleCountdowns.forEach(countdownDiv => {
            const deleteReservedDuration = parseInt(countdownDiv.dataset.duration, 10);
            const updatedDuration = Math.max(0, deleteReservedDuration - 1); // Ensure non-negative duration

            countdownDiv.textContent = formatDuration(updatedDuration);
            if (updatedDuration > 0)
                countdownDiv.style.color = "red";
            else
                countdownDiv.style.color = "blue";

            countdownDiv.dataset.duration = updatedDuration.toString();
            });
        }
    }

    /**
    * Start the countdown update interval only when in CharSelectV4 UI
    */
    function startCountdownInterval() {
        if (!countdownInterval) {
            countdownInterval = setInterval(updateAllVisibleCountdowns, 1000);
        }
    }

    /**
     * Stop the countdown update interval
     */
    function stopCountdownInterval() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }

    /**
     * Result of Request in Deleting the Character
     *
     * @param {object} pkt - packet structure
     */
    CharSelectV4.reqdeleteAnswer = function ReqDelAnswer ( pkt )
    {
        this.on('keydown');
		var deleteReservedDate = pkt.DeleteReservedDate;
        var result = typeof( pkt.Result ) === 'undefined' ? -1 : pkt.Result;
        var info = _slots[_index];

        switch (result) {
            case 0: // 0: An unknown error has occurred.
                return;

            case 1: // 1: none/success
                var now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
                info.DeleteDate = deleteReservedDate + now;
                requestdelete(_index, deleteReservedDate);
                break;

            case 3: // 3: A database error occurred.
                return;

            case 4: // 4: To delete a character you must withdraw from the guild.
                UIManager.showMessageBox( DB.getMessage(1818), 'ok' );
                break;
            case 5: // 5: To delete a character you must withdraw from the party.
                UIManager.showMessageBox( DB.getMessage(1819), 'ok' );
                break;

            default:
                return;
        }
    }

    /**
     * When successfully requested for character deletion
     * Update UI and add timer
     */
    function requestdelete ( index, timer )
    {
        // Make it sit
        _entitySlots[index].action = 2;
        //render();

        // Add the timer
        const countdown = document.querySelector('.timedelete.slot' + index);
        if (countdown) {
            countdown.setAttribute('data-duration', timer);
            countdown.classList.remove('hidden');
            countdown.style.display = "block";
        }

        // Adjust the buttons
        CharSelectV4.ui.find('.delete').hide();
        CharSelectV4.ui.find('.canceldelete').show();
        CharSelectV4.ui.find('.finaldelete').show();
    }

    /**
     * Cancel reservation of character for deletion
     * Update UI and remove timer
     */
    function removedelete ()
    {
        if (_slots[_index]) {

            // Delete here as well? Though server should tell us this
            _slots[_index].DeleteDate = 0;

            // Make it stand
            _entitySlots[_index].action = 0;
            render();

            // Remove the timer
            const countdown = document.querySelector('.timedelete.slot' + _index);  // Adjusted selector
            if (countdown) {
                countdown.setAttribute('data-duration', 0);
                countdown.classList.add('hidden');
                countdown.style.display = "none";
            }

            // Adjust the buttons
            CharSelectV4.ui.find('.canceldelete').hide();
            CharSelectV4.ui.find('.finaldelete').hide();
            CharSelectV4.ui.find('.delete').show();

            // Send request to the server
            CharSelectV4.onCancelDeleteRequest(_slots[_index].GID);
        }
    }

    /**
     * Answer from server to delete a character
     *
     * @param {number} error id
     */
    CharSelectV4.deleteAnswer = function DeleteAnswer( error )
    {
        this.on('keydown');

        switch (error) {
            // Do nothing, just re-set the keydown
            case -1:
            case -2:
                return;

            // Success (clean up character)
            case 1:
                delete _slots[_index];
                delete _entitySlots[_index];

                if (_preferences.index === _index)
                    _preferences.index = 0;

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
            case 0:
            case 2: // 2: Due to system settings can not be deleted.
            case 6: // 6: Name does not match.
                UIManager.showMessageBox( DB.getMessage(1821), 'ok' );
                return;
            case 3: // 3: A database error occurred.
                UIManager.showMessageBox( DB.getMessage(1817), 'ok' );
                return;
            case 4: // 4: Deleting not yet possible time.
                UIManager.showMessageBox( DB.getMessage(1820), 'ok' );
                return;
            case 5: // 5: Date of birth do not match.
                UIManager.showMessageBox( DB.getMessage(1822), 'ok' );
                return;
            case 7: // 7: Character Deletion has failed because you have entered an incorrect e-mail address.
                UIManager.showMessageBox( DB.getMessage(301), 'ok' );
                return;
        }
    };


    /**
     * Adding a Character to the list
     *
     * @param {object} character data
     */
    CharSelectV4.addCharacter = function addCharacter( character )
    {
        if (!('sex' in character) || character.sex === 99) {
            character.sex = _sex;
        }

        _list.push( character );
        _slots[ character.CharNum ] = character;

        _entitySlots[ character.CharNum ] = new Entity();
        _entitySlots[ character.CharNum ].set( character );
        _entitySlots[ character.CharNum ].hideShadow = true;
        updateCharSlot();
    };


    /**
     * Disable or Enable the UI.
     *
     * @param {boolean}
     */
    CharSelectV4.setUIEnabled = function setUIEnabled( value )
    {
        _disable_UI = !value;
    }

    /**
     * Callback to use
     */
    CharSelectV4.onExitRequest    = function onExitRequest(){};
    CharSelectV4.onDeleteRequest  = function onDeleteRequest(){};
    CharSelectV4.onDeleteReqDelay = function onDeleteReqDelay(){};
    CharSelectV4.onCreateRequest  = function onCreateRequest(){};
    CharSelectV4.onConnectRequest = function onConnectRequest(){};
    CharSelectV4.onCancelDeleteRequest = function onCancelDeleteRequest(){};


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
        if (_disable_UI === false) {
            UIManager.showPromptBox( DB.getMessage(17), 'ok', 'cancel', function(){
                CharSelectV4.onExitRequest();
                updateCharSlot();
            }, null);
            stopCountdownInterval();
        }
    }


    /**
     * Jumping to Character creation window
     */
    function create()
    {
        if (_disable_UI === false) {
            CharSelectV4.onCreateRequest( _index );
        }
    }


    /**
     * Select Player, connect
     */
    function connect() {
        if (_disable_UI === false) {
            if ((_slots[_index]) && (!_slots[_index].DeleteDate)) {
                _preferences.index = _index;
                _preferences.save();
                CharSelectV4.onConnectRequest( _slots[_index] );
                stopCountdownInterval();
            }
        }
    }

    /**
     * Request to delete a character
     */
    function reserve() {
        if (_disable_UI === false) {
            if (_slots[_index]) {
                CharSelectV4.off('keydown');
                CharSelectV4.onDeleteReqDelay( _slots[_index].GID );
            }
        }
    }

    /**
     * Delete a character
     */
    function suppress() {
        if (_disable_UI === false) {
            if (_slots[_index]) {
                CharSelectV4.off('keydown');
                CharSelectV4.onDeleteRequest( _slots[_index].GID );
            }
        }
    }


    /**
     * Move cursor, update window value
     *
     * @param {number} index
     */
    function moveCursorTo( index )
    {
        var ui = CharSelectV4.ui;
        var $charinfo = ui.find('.charinfo');

        var entity = _slots[_index];
        var prevIndex = _index;
        // Update the flag based on whether an entity is present
        shouldRunBackgroundChange = false;

        if (entity) {
            Client.loadFile( DB.INTERFACE_PATH + "select_character_ver3/img_slot_normal.bmp", function(dataURI) {
                ui.find('#slot'+ prevIndex).css('backgroundImage', 'url(' + dataURI + ')');
            });
        }

        var slotIndex = _index = index > _maxSlots ? _maxSlots : (index < 0 ? 0: index);

        // Not found, just clean up.
        entity = _slots[_index];
        if (!entity) {
            $charinfo.find('div').empty();
            ui.find('.delete').hide();
            ui.find('.canceldelete').hide();
            ui.find('.finaldelete').hide();
            ui.find('.ok').hide();
            var countdown = document.querySelector('.timedelete.slot' + _index);
            if (countdown) {
                countdown.setAttribute('data-duration', 0);
                countdown.classList.add('hidden');
                countdown.style.display = "none";
            }
            return;
        } else {
            _curindex = slotIndex;
            shouldRunBackgroundChange = true;
        }

        // Call changeBackgroundEverySecond if the flag is true
        if (shouldRunBackgroundChange === true) {
            changeBackgroundEverySecond();
        }

        var info = _slots[_index];
        // Bind new value
        if (info.DeleteDate) {
            ui.find('.delete').hide();
            ui.find('.canceldelete').show();
            ui.find('.finaldelete').show();
        } else {
            ui.find('.canceldelete').hide();
            ui.find('.finaldelete').hide();
            ui.find('.delete').show();
        }

        ui.find('.ok').show();

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

    function changeBackgroundEverySecond() {
        var UIready = CharSelectV4.ui;
        if (UIready) {
            var backgroundchange = CharSelectV4.ui.find('#slot'+ _curindex);
            if (backgroundchange && shouldRunBackgroundChange === true) {
                Client.loadFile( DB.INTERFACE_PATH + "select_character_ver3/img_slot_select"+img+".bmp", function(dataURI) {
                    backgroundchange.css({'backgroundImage': 'url(' + dataURI + ')',
                    'width': '157px', 'height': '197px', 'background-size': 'contain', 'background-repeat': 'no-repeat' });
                });

                // Increment the slot index and wrap around if needed
                img = (img + 1) % 8;
            }
        }
    }

    // Change the background every millisecond
    setInterval(changeBackgroundEverySecond, 150);

    function updateCharSlot(){
        for (let i = 0; i < _maxSlots; ++i) {
            jQuery(CharSelectV4.ui.find(".char_canvas")[i]).find('.name').html(_slots[i] !== undefined ? _slots[i].name:"");
            if(_slots[i] === undefined){
                const slotNum = i;
                jQuery(CharSelectV4.ui.find(".job_icon")[slotNum]).css('background-image', '');
                if(CharSelectV4.ui.find('#slot'+ slotNum)){
                    Client.loadFile( DB.INTERFACE_PATH + "select_character_ver3/img_slot2_normal.bmp", function(dataURI) {
                        CharSelectV4.ui.find('#slot'+ slotNum).css('backgroundImage', 'url(' + dataURI + ')');
                    });
                }
                const countdown = document.querySelector('.timedelete.slot' + slotNum);  // Adjusted selector
                if (countdown) {
                    countdown.setAttribute('data-duration', 0);
                    countdown.classList.add('hidden');
                    countdown.style.display = "none";
                }
            }else{
                Client.loadFile( DB.INTERFACE_PATH + "select_character_ver3/img_slot_normal.bmp", function(dataURI) {
                    CharSelectV4.ui.find('#slot'+ i).css('backgroundImage', 'url(' + dataURI + ')');
                });

                const slotJobIcon = jQuery(CharSelectV4.ui.find(".job_icon")[i]);

                Client.loadFile( DB.INTERFACE_PATH + "renewalparty/icon_jobs_"+_slots[i].job+".bmp", function(dataURI) {
                    slotJobIcon.css('backgroundImage', 'url(' + dataURI + ')');
                });

                if (_slots[i].DeleteDate) {
                    const slotNum = i;
                    const countdown = document.querySelector('.timedelete.slot' + slotNum);  // Adjusted selector
                    if (countdown) {
                        countdown.setAttribute('data-duration', _slots[i].DeleteDate);
                        countdown.classList.remove('hidden');
                        countdown.style.display = "block";
                    }
                }
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
                SpriteRenderer.bind2DContext(_ctx[i], 78, 157);
                if (_slots[i].DeleteDate)   // Pending for Deletion Characters are sitting
                    _entitySlots[idx+i].action  = 2;
                _entitySlots[idx+i].renderEntity();
            }
        }
    }


    /**
     * Create componentand export it
     */
    return UIManager.addComponent(CharSelectV4);
});
