/*!
 * jquery.top-droppable v0.3;
 * Allows you to drop a draggable-element only into the foremost droppable-element, if more of them are overlapping.
 * 
 * contact: matthias.klan@gmail.com
 
 
 * The MIT License (MIT)

Copyright (c) 2013 Matthias Klan

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


(function($){
	
	var hoveringOverElements = new Array();
	var topElement;
	var i = 0;
	
	$.getCurrentHoveredElements = function(){return getCurrentHoveredElements();}; 
	$.getTopElement = function(){return topElement};


	$.fn.extend({ 
		
		topDroppable: function(settings) {
 			
 			var defaults = {
 
		 	drop: function() {},
		 
		    };
		    var settings = $.extend(defaults, settings);
		
			
			return this.each(function() {
    			$(this).on( "dropover", function( event, ui ) {
    				if($(this).css("z-index") == 'auto'){
    					// alert("ERROR: please add a specific z-index to your topDroppable Elements!");
    					return;
    				}
    			    hoveringOverElements.push(i);
    			    $(this).attr('top-droppable-id', i);
    			    i++;
			        topElement = determineTopElement(); 
			    });
			    $(this).on( "dropout", function( event, ui ) {
			    	var position = hoveringOverElements.indexOf(parseInt($(this).attr('top-droppable-id')));
			 		hoveringOverElements.splice(position, 1);
		     		topElement = determineTopElement();	
			    });
				$(this).on( "drop", function( event, ui ) {
			 		hoveringOverElements = new Array();
					if($(this).attr('top-droppable-id') == $(topElement).attr('top-droppable-id')){
						i = 0;
						topElement = null;
						settings.drop.call(this, event, ui );
					}
				});
			});
		}
	});	
	
	function determineTopElement(){
	    var tmp_winner;
	    var tmp_highest = 0;
	
	    for (var i in hoveringOverElements){
	     	  var element = $( "*[top-droppable-id="+hoveringOverElements[i]+"]");
	     	  var z_index = $(element).css("z-index");
	          if( z_index > tmp_highest){
	               tmp_highest = z_index;
	               tmp_winner = element;
	          }
	    }
	    return tmp_winner;
	   
	}	

	function getCurrentHoveredElements(){
		var elements = new Array();

		for (var i in hoveringOverElements){
			var element = $( "*[top-droppable-id="+hoveringOverElements[i]+"]");
			elements.push(element);
	 	}
	 	return elements; 
	}
		
})(jQuery);