/**
 * UI/Components/MakeItemSelection/ItemConvertSelection/MessageModel.js
 *
 * MessageModel windows
 *
 * @author Francisco Wallison
 */
 define(function(require)
 {
     'use strict';
 
 
     /**
      * Dependencies
      */
     var jQuery      = require('Utils/jquery');
     var DB          = require('DB/DBManager');
     var Preferences = require('Core/Preferences');
     var Mouse       = require('Controls/MouseEventHandler');
     var Client      = require('Core/Client');
     var Renderer    = require('Renderer/Renderer');
     var UIManager   = require('UI/UIManager');
     var UIComponent = require('UI/UIComponent');
     var InputBox    = require('UI/Components/InputBox/InputBox');
     var Inventory   = require('UI/Components/Inventory/Inventory');
     var htmlText    = require('text!./MessageModel.html');
     var cssText     = require('text!./MessageModel.css');
     var getModule   = require;

     /**
      * Create MessageModel namespace
      */
     var MessageModel = new UIComponent( 'MessageModel', htmlText, cssText );
      
     /**
      * Initialize UI
      */
     MessageModel.init = function init()
     {
        // Show at center.
        this.ui.css({
            top:  (Renderer.height- 200)/2,
            left: (Renderer.width - 200)/2
        });

        this.ui.find('.ok').on('click',onSendMaterial); 
        this.ui.find('.cancel').on('click',onClose);

        this.draggable(this.ui.find('.titlebar'));
     };


    function onSendMaterial(event){
        event.stopImmediatePropagation();
        getModule('UI/Components/MakeItemSelection/ItemConvertSelection/ConvertItems')
            .validItemSend(true);

    }


     function onClose(event){
		event.stopImmediatePropagation();
		getModule('UI/Components/MakeItemSelection/ItemConvertSelection/ConvertItems')
            .validItemSend(false);
	}

    /**
     * Create component based on view file and export it
     */
    return UIManager.addComponent(MessageModel);
 });
 
