/**
 * UI/Components/MakeItemSelection/ItemConvertSelection/ConvertItems.js
 *
 * ConvertItems windows
 *
 *
 * @author Vincent Thibault
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
	 var MessageModel= require('UI/Components/MakeItemSelection/ItemConvertSelection/MessageModel');
     var htmlText    = require('text!./ConvertItems.html');
     var cssText     = require('text!./ConvertItems.css');
     var getModule   = require;
 
    /**
	 * @var {Preference} structure to save
	 */
	var _preferences = Preferences.get('ConvertItems', {
		x:      200,
		y:      500,
		height:   8
	}, 1.0);

     /**
      * Create ConvertItems namespace
      */
     var ConvertItems = new UIComponent( 'ConvertItems', htmlText, cssText );


    /**
	 * Store Convert Items items
	 */
    ConvertItems.material = [];
      
     /**
      * Initialize UI
      */
     ConvertItems.init = function init()
     {
         // Show at center.
         this.ui.css({
             top:  (Renderer.height- 200)/2,
             left: (Renderer.width - 10)/2
         });
 
         this.material = [];
 
         this.draggable(this.ui.find('.head'));
         this.ui.find('.footer .extend').mousedown(onResize);
		 this.ui.find('.trade').on('click',onMessageModel);  // remove all item reset layout
		 
         resizeHeight(_preferences.height);
         
        this.ui
            .on('drop',     onDrop)
            .on('dragover', stopPropagation)

			.find('.container .content')
				.on('mousewheel DOMMouseScroll', onScroll)
				.on('mouseover',   '.item',      onItemOver)
				.on('mouseout',    '.item',      onItemOut)
				.on('dragstart',   '.item',      onItemDragStart)
				.on('dragend',     '.item',      onItemDragEnd)
				.on('contextmenu', '.item',      onItemInfo);


        this.draggable(this.ui.find('.titlebar'));
     };
 
     ConvertItems.addItem = function addItem( item ){
        var it   = DB.getItemInfo( item.ITID );

        this.ui.find('.container .content').append(
            '<div class="item" data-index="' + item.index +'" draggable="true">' +
                '<div class="icon"></div>' +
                '<div class="amount">'+ (item.count ? '<span class="count">' + item.count + '</span>' + ' ' : '') + '</div>' +
                '<span class="name">' + jQuery.escape(DB.getItemName(item)) + '</span>' +
            '</div>'
        );

        Client.loadFile( DB.INTERFACE_PATH + 'item/' + ( item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName ) + '.bmp', function(data){
            this.ui.find('.item[data-index="'+ item.index +'"] .icon').css('backgroundImage', 'url('+ data +')');
        }.bind(this));

        return true;
     }


     /**
	 * Remove item from inventory
	 *
	 * @param {number} index in inventory
	 * @param {number} count
	 */
    ConvertItems.updateItem = function UpdateItem( index, count )
	{
		var item = this.getItemByIndex(index);

		if (!item) {
			return;
		}

		item.count = item.count+count; // update item list

		// Update quantity
		if (item.count > 0) {
			this.ui.find('.item[data-index="'+ item.index +'"] .count').text( item.count );
			return;
		}

		// no quantity, remove
		this.material.splice( this.material.indexOf(item), 1 );
		this.ui.find('.item[data-index="'+ item.index +'"]').remove();

		var content = this.ui.find('.container .content');
		if (content.height() === content[0].scrollHeight) {
			this.ui.find('.hide').show();
		}
	};


    /**
	 * Search in a list for an item by its index
	 *
	 * @param {number} index
	 * @returns {Item}
	 */
    ConvertItems.getItemByIndex = function getItemByIndex( index )
	{
		var i, count;
		var list = ConvertItems.material;

		for (i = 0, count = list.length; i < count; ++i) {
			if (list[i].index === index) {
				return list[i];
			}
		}

		return null;
	};
	
	function onMessageModel(event){
		event.stopImmediatePropagation();
		MessageModel.append();
	}

     /**
	 * Extend ConvertItems window size
	 */
	function onResize()
	{
		var ui         = ConvertItems.ui;
		var top        = ui.position().top;
		var lastHeight = 0;
		var _Interval;

		function resizing()
		{
			var extraY = 31 + 19 - 30;
			var h = Math.floor( (Mouse.screen.y - top  - extraY) / 32 );

			// Maximum and minimum window size
			h = Math.min( Math.max(h, 8), 17);

			if (h === lastHeight) {
				return;
			}

			resizeHeight(h);
			lastHeight = h;
		}

		// Start resizing
		_Interval = setInterval( resizing, 30);

		// Stop resizing on left click
		jQuery(window).on('mouseup.resize', function(event){
			if (event.which === 1) {
				clearInterval(_Interval);
				jQuery(window).off('mouseup.resize');
			}
		});
	}


    /**
	 * Extend ConvertItems window size
	 */
	function resizeHeight(height)
	{
		height = Math.min( Math.max(height, 8), 17);

		ConvertItems.ui.find('.container .content').css('height', height * 32);
		ConvertItems.ui.css('height', 31 + 19 + height * 32);
	}
 
     /**
      * Free variables once removed from HTML
      */
     ConvertItems.onRemove = function onRemove()
     {
         this.index = 0;
     };
 
 
     /**
      * Set new window name
      *
      * @param {string} title
      */
     ConvertItems.setTitle = function setTitle( title )
     {
         this.ui.find('.head .text').text( title );
     };
 
 
     /**
      * Insert material to creation
      *
      * @param {object} Item
      */
     ConvertItems.addMaterial = function AddMaterial( item )
     {
        var object = getItemIndexById(item.index);

        if(object < 0){
            if (this.addItem(item)) {
                this.material.push(item);
            }
        }else{            
            this.updateItem(item.index, item.count)
        }

        console.log(this.material, 'addMaterial');
     };



     /**
	 * Remove item from Storage
	 *
	 * @param {number} index in Storage
	 */
    ConvertItems.removeItem = function removeItem( index, count )
	{
		var i = getItemIndexById(index);
		var item;

		// Not found
		if (i < 0) {
			return null;
		}

		if (ConvertItems.material[i].count) {
			ConvertItems.material[i].count -= count;

			if (ConvertItems.material[i].count > 0) {
				this.ui.find('.item[data-index="'+ index +'"] .count').text(ConvertItems.material[i].count);
				return ConvertItems.material[i];
			}
		}

		// Remove item
		item = ConvertItems.material[i];
		ConvertItems.material.splice( i, 1 );
		this.ui.find('.item[data-index="'+ index +'"]').remove();

		return item;
	};
     
    /**
	 * Mouse mouve out of an item, hide title description
	 */
	function onItemOut()
	{
		ConvertItems.ui.find('.overlay').hide();
	}
     
     /**
	 * Start dragging an item
	 */
	function onItemDragStart( event )
	{
		var index   = parseInt(this.getAttribute('data-index'), 10);
		var i       = getItemIndexById(index);

		if (i === -1) {
			return;
		}

		// Set image to the drag drop element
		var img = new Image();
		var url = this.firstChild.style.backgroundImage.match(/\(([^\)]+)/)[1];
		url     = url = url.replace(/^\"/, '').replace(/\"$/, ''); // Firefox bug
		img.src = url;

		event.originalEvent.dataTransfer.setDragImage( img, 12, 12 );
		event.originalEvent.dataTransfer.setData('Text',
			JSON.stringify( window._OBJ_DRAG_ = {
				type: 'item',
				from: 'ConvertItems',
				data: ConvertItems.material[i]
			})
		);

		onItemOut();
	}

    /**
	 * Display item description
	 *
	 */
	function onItemInfo( event )
	{
		event.stopImmediatePropagation();

		var index   = parseInt(this.getAttribute('data-index'), 10);
		var i       = getItemIndexById(index);

		if (i === -1) {
			return false;
		}

		// Don't add the same UI twice, remove it
		if (ItemInfo.uid === ConvertItems.material[i].ITID) {
			ItemInfo.remove();
		}

		// Add ui to window
		ItemInfo.append();
		ItemInfo.uid = ConvertItems.material[i].ITID;
		ItemInfo.setItem( ConvertItems.material[i] );

		return false;
	}


    /**
	 * Stop the drag/drop on an item
	 */
	function onItemDragEnd()
	{
		delete window._OBJ_DRAG_;
	}

    /**
	 * Get item index in list base on it's ID
	 *
	 * @param {number} item id
	 */
	function getItemIndexById( index )
	{
		var i, count;

		for (i = 0, count = ConvertItems.material.length; i < count; ++i) {
			if (ConvertItems.material[i].index === index) {
				return i;
			}
		}

		return -1;
	}
 
     /**
      * Drop an item from storage to inventory
      *
      * @param {event}
      */
     function onDrop( event )
     {
         var item, data;
 
         try {
             data = JSON.parse(
                 event.originalEvent.dataTransfer.getData('Text')
             );
         }
         catch(e) {}
 
         event.stopImmediatePropagation();
 
         // Just support items for now ?
         if (!data || data.type !== 'item' || data.from !== 'ItemListWindowSelection') {
             return false;
         }
 
         item = data.data;
        // validar se esta marcado
        var valid_select_all = !getModule('UI/Components/MakeItemSelection/ItemListWindowSelection')
                                    .getSelectAll();

        if (item.count > 1 && valid_select_all) {
			InputBox.append();
			InputBox.setType('number', false, item.count);
			InputBox.onSubmitRequest = function OnSubmitRequest( count ) {
				InputBox.remove();

                
                getModule('UI/Components/MakeItemSelection/ItemListWindowSelection')
                .removeItem(
                    item.index,
                    parseInt(count, 10 )
                );			

                item.count = parseInt(count, 10 );
                ConvertItems.addMaterial( item );
			};
			return false;
		}


        getModule('UI/Components/MakeItemSelection/ItemListWindowSelection')
            .removeItem(
                item.index,
                item.count
            );
 
        ConvertItems.addMaterial( item );
        return false;
     }
 
 
     /**
      * Stop event propagation
      */
     function stopPropagation( event )
     {
         event.stopImmediatePropagation();
         return false;
     }

     /**
	 * Update scroll by block (32px)
	 */
	function onScroll( event )
	{
		var delta;

		if (event.originalEvent.wheelDelta) {
			delta = event.originalEvent.wheelDelta / 120 ;
			if (window.opera) {
				delta = -delta;
			}
		}
		else if (event.originalEvent.detail) {
			delta = -event.originalEvent.detail;
		}

		this.scrollTop = Math.floor(this.scrollTop/32) * 32 - (delta * 32);
		return false;
	}


    /**
	 * Mouse over item, display name and informations
	 */
	function onItemOver()
	{
		var idx = parseInt( this.getAttribute('data-index'), 10);
		var i   = getItemIndexById(idx);

		// Not found
		if (i < 0) {
			return;
		}

		// Get back data
		var item    = ConvertItems.material[i];
		var pos     = jQuery(this).position();
		var overlay = ConvertItems.ui.find('.overlay');

		// Display box
		overlay.show();
		overlay.css({top: pos.top-10, left:pos.left+35});
		overlay.text(DB.getItemName(item) + ' ' + ( item.count || 1 ) + ' ea');

		if (item.IsIdentified) {
			overlay.removeClass('grey');
		}
		else {
			overlay.addClass('grey');
		}
	}
     
     /**
      * Create component based on view file and export it
      */
     return UIManager.addComponent(ConvertItems);
 });
 
