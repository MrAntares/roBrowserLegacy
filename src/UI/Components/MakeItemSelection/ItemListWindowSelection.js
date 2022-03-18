/**
 * UI/Components/MakeItemSelection/ItemListWindowSelection.js
 *
 * ItemListWindowSelection windows
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
     var SkillInfo   = require('DB/Skills/SkillInfo');
     var Client      = require('Core/Client');
     var Renderer    = require('Renderer/Renderer');
     var UIManager   = require('UI/UIManager');
     var UIComponent = require('UI/UIComponent');
     var Inventory   = require('UI/Components/Inventory/Inventory');
     var htmlText    = require('text!./ItemListWindowSelection.html');
     var cssText     = require('text!./ItemListWindowSelection.css');
 
 
     /**
      * Create ItemListWindowSelection namespace
      */
     var ItemListWindowSelection = new UIComponent( 'ItemListWindowSelection', htmlText, cssText );
     
     var validMaterials = 	[	
                                 1000 //star crumb
                                 ,997 //great nature
                                 ,996 //rough wind
                                 ,995 //mystic frozen
                                 ,994 //flame heart
                             ];
 
     /**
      * Initialize UI
      */
     ItemListWindowSelection.init = function init()
     {
         // Show at center.
         this.ui.css({
             top:  (Renderer.height- 200)/2,
             left: (Renderer.width - 200)/2
         });
 
         this.list  = this.ui.find('.list:first');
         this.index = 0;
         this.material = [];
 
         this.draggable(this.ui.find('.head'));
         
         // Click Events
         this.ui.find('.cancel').click(function(){
             this.index = -1;
             this.selectIndex();
         }.bind(this) );
 
         // Bind events
         this.ui
             .on('mousedown', '.item', function(){
                 ItemListWindowSelection.setIndex( Math.floor(this.getAttribute('data-index')) );
             });
             
         // on drop item
         this.ui.find('.materials')
                 .on('drop',     onDrop)
                 .on('dragover', stopPropagation);
 
		
		this.ui.find('.item').remove();
        this.ui.find('.materials').hide();
     };
 
 
     /**
      * Add elements to the list
      *
      * @param {Array} list object to display
      */
     ItemListWindowSelection.setList = function setList( list )
     {
         var i, count;
         var item, it, file, name, showMaterials;
 
         ItemListWindowSelection.list.empty();
		 this.ui.find('.list').css('backgroundColor', '#f7f7f7');
         this.ui.find('.materials').hide();
		 this.ui.find('.item').remove();
 
         showMaterials = true;
         
         this.material = [];
 
         for (i = 0, count = list.length; i < count; ++i) {
             
             item = list[i];
             it   = DB.getItemInfo( item.ITID );
             file = it.identifiedResourceName;
             name = it.identifiedDisplayName;
 
             if(it.processitemlist === ''){
				 showMaterials = false;
			 }
 
             addElement( DB.INTERFACE_PATH + 'item/' + file + '.bmp', list[i].ITID, name);
         }
         
		 this.setIndex(list[0].ITID);
		 
		 bindSelectEvents(showMaterials);
     };
 
 
     /**
      * Add elements to the list
      *
      * @param {Array} list object to display
      */
      ItemListWindowSelection.setCookingList = function setCookingList( list )
      {
         var i, count;
         var item, it, file, name;
  
         ItemListWindowSelection.list.empty();
		 this.ui.find('.list').css('backgroundColor', '#f7f7f7');
         this.ui.find('.materials').hide();
		 this.ui.find('.item').remove();
		 
		 this.material = list[0]; // add mk type
  
         for (i = 1, count = list.length; i < count; ++i) {
              
             item = list[i];
             it   = DB.getItemInfo( item );
             file = it.identifiedResourceName;
             name = it.identifiedDisplayName;
 
             addElement( DB.INTERFACE_PATH + 'item/' + file + '.bmp', list[i], name);
         }
		 
		 this.setIndex(list[0].ITID);
          
         bindSelectEvents(false);
      };
 
 
     /**
      * Add an element to the list
      *
      * @param {string} image url
      * @param {index} index in list
      * @param {string} element name
      */
     function addElement( url, index, name)
     {
         ItemListWindowSelection.list.append(
             '<div class="item" data-index="'+ index +'">' +
                 '<div class="icon"></div>' +
                 '<span class="name">' + jQuery.escape(name) + '</span>' +
             '</div>'
         );
 
         Client.loadFile( url, function(data){
             ItemListWindowSelection.list
                 .find('div[data-index='+ index +'] .icon')
                 .css('backgroundImage', 'url('+ data +')');
         });
     }
     
     
     /**
      * Advances to the next screen of the item creation
      *
      * @param {number} index in list
      */
     ItemListWindowSelection.advance = function advance(){
         var it, title, metal;
         ItemListWindowSelection.list.empty();
         it   = DB.getItemInfo( this.index );
         title = it.identifiedDisplayName + ' ' + DB.getMessage(426);
         metal = it.processitemlist;
         ItemListWindowSelection.setTitle(title);
         
         this.ui.find('.ok').unbind('click');
         this.ui.find('.ok').click( this.selectIndex.bind(this) );
         this.ui.find('.list').css('backgroundColor', '#ffffff');
 
         // Rune craft passa direto
         this.ui.find('.list')
			.append(
				`<pre>${it.identifiedDisplayName} - ${DB.getMessage(427)}`+
					`\n`+
					`${metal}`+
				`</pre>`
			);
         this.ui.find('.materials').show()
         
     };
 
 
     /**
      * Change selection
      *
      * @param {number} id in list
      */
     ItemListWindowSelection.setIndex = function setIndex( id )
     {
		 id = id === 0 ? this.index : id;
         this.list.find('div[data-index='+ this.index +']').removeClass('select');
         this.list.find('div[data-index='+ id         +']').addClass('select');
         this.index = id;
     };
 
 
     /**
      * Select a server, callback
      */
     ItemListWindowSelection.selectIndex = function selectIndex()
     {
         this.onIndexSelected( this.index, this.material );
         if(this.index > -1){
             if(typeof this.material == ! 'number')
                 this.material.forEach(item => Inventory.removeItem(item.index, 1));
         }
         this.remove();
     };
 
 
 
     /**
      * Free variables once removed from HTML
      */
     ItemListWindowSelection.onRemove = function onRemove()
     {
         this.index = 0;
     };
 
 
     /**
      * Set new window name
      *
      * @param {string} title
      */
     ItemListWindowSelection.setTitle = function setTitle( title )
     {
         this.ui.find('.head .text').text( title );
     };
 
 
     /**
      * Functions to define
      */
     ItemListWindowSelection.onIndexSelected = function onIndexSelected(){};
 
     /**
      * Insert material to creation
      *
      * @param {object} Item
      */
     ItemListWindowSelection.addMaterial = function AddMaterial( item )
     {
         if( this.material.length < 3 && validMaterials.includes(item.ITID)){
             if (this.addItemSub(item)) {
                 this.material.push(item);
             }
         }
     };
     
     /**
      * Add item to inventory
      *
      * @param {object} Item
      */
     ItemListWindowSelection.addItemSub = function AddItemSub( item )
     {
         
         var it      = DB.getItemInfo( item.ITID );
         var content = this.ui.find('.materials');
 
         content.append(
             '<div class="item" data-index="'+ item.index +'" draggable="false">' +
                 '<div class="icon"></div>' +
             '</div>'
         );
 
         if (content.height() < content[0].scrollHeight) {
             this.ui.find('.hide').hide();
         }
         else {
             this.ui.find('.hide').show();
         }
 
         Client.loadFile( DB.INTERFACE_PATH + 'item/' + ( item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName ) + '.bmp', function(data){
             content.find('.item[data-index="'+ item.index +'"] .icon').css('backgroundImage', 'url('+ data +')');
         });
 
         return true;
     };
     
     
 
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
         if (!data || data.type !== 'item' || data.from !== 'Inventory') {
             return false;
         }
 
         item = data.data;
 
         ItemListWindowSelection.addMaterial( item );
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
     
 
     function bindSelectEvents(showMaterials){
         if(showMaterials){
			 
             ItemListWindowSelection.ui.find('.ok').unbind('click');
             ItemListWindowSelection.ui.find('.ok').click( ItemListWindowSelection.advance.bind(ItemListWindowSelection) );
			 
			 ItemListWindowSelection.ui.off('dblclick', '.item');
			 ItemListWindowSelection.ui.on('dblclick', '.item', ItemListWindowSelection.advance.bind(ItemListWindowSelection));
			 
         }else{
			 
             ItemListWindowSelection.ui.find('.ok').unbind('click');
			 ItemListWindowSelection.ui.find('.ok').click( ItemListWindowSelection.selectIndex.bind(ItemListWindowSelection) );
			 
             ItemListWindowSelection.ui.off('dblclick', '.item');
             ItemListWindowSelection.ui.on('dblclick', '.item', ItemListWindowSelection.selectIndex.bind(ItemListWindowSelection));
         }
     }
 
     /**
      * Create component based on view file and export it
      */
     return UIManager.addComponent(ItemListWindowSelection);
 });
 
