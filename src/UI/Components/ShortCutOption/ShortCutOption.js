/**
 * UI/Components/ShortCutOption/ShortCutOption.js
 *
 * Short Cut Settings
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
define(function (require) {

	'use strict';
	
	var $ = require("Utils/jquery");
	var KEYS = require("Controls/KeyEventHandler");
	var Preferences = require("Core/Preferences");
	var Renderer = require("Renderer/Renderer");
	var UIManager = require("UI/UIManager");
	var UIComponent = require("UI/UIComponent");
	var ShortCutControls = require("Preferences/ShortCutControls");
	var BattleMode = require("Controls/BattleMode");
	var htmlText = require("text!./ShortCutOption.html");
	var cssText = require("text!./ShortCutOption.css");
	
	var ShortCutOption = new UIComponent("ShortCutOption", htmlText, cssText);
	
	var ShortCuts = ShortCutControls.ShortCuts;
	var ShortCutsTemp = {};
	
	ShortCutOption.isCapturing = false;
	
	/**
	 * @var {Preferences} structure
	 */
	var _preferences = Preferences.get("ShortCutOption", {
		x: 300,
		y: 300
	}, 1.0);


	/**
	 * Initialize UI
	 */
	ShortCutOption.init = function () {
		this.ui.find(".close").on("click", function(){ ShortCutOption.remove(); });
		this.ui.find(".tabs").on("click", "button", function () {
			if (0 == $(this).data("index")) {
				if (ShortCutOption.ui.find(".border").hasClass("ui")) {
					ShortCutOption.ui.find(".border").removeClass("ui").addClass("ShortCut");
				}
			} else {
				if (ShortCutOption.ui.find(".border").hasClass("ShortCut")) {
					ShortCutOption.ui.find(".border").removeClass("ShortCut").addClass("ui");
				}
			}
		});
		this.ui.find("td").on("click", function () {
			if ($(this).hasClass("customize")) {
				ShortCutOption.isCapturing = true;
				$("#ShortCutOption td.selected").removeClass("selected");
				$(this).addClass("selected");
			} else {
				ShortCutOption.isCapturing = false;
				$("#ShortCutOption td.selected").removeClass("selected");
			}
		});
		
		this.ui.find(".button.reset").on("click", function(){ resetKeysToDefault(); });
		this.ui.find(".button.ok").on("click", function(){ applySettings(); });
		this.ui.find(".button.cancel").on("click", function(){ cancelSettings(); });
		
		updateKeyList();
		this.draggable(this.ui.find(".titlebar"));
	};


	/**
	 * Apply preferences once append to body
	 */
	ShortCutOption.onAppend = function () {
		this.ui.css({
			top: .5 * (Renderer.height - this.ui.height()),
			left: .5 * (Renderer.width - this.ui.width()),
			zIndex: 100
		});
	};


	/**
	 * Remove Inventory from window (and so clean up items)
	 */
	ShortCutOption.onRemove = function () {
		_preferences.x = parseInt(this.ui.css("left"), 10);
		_preferences.y = parseInt(this.ui.css("top"), 10);
		_preferences.save();
	};


	/**
	 * Process key
	 *
	 * @param {object} key
	 */
	ShortCutOption.onKeyDown = function (event) {
		if (ShortCutOption.isCapturing) {
			if (16 != event.which && 17 != event.which && 18 != event.which) {
				var box = ShortCutOption.ui.find("td.selected");
				
				if ( tempMatch(event.which) ) {
					return alert("Key already assigned!"), false;
				} else if( ShortCuts[box.data("button")] ){
					
					if(event.which == 27){ // Escape
						ShortCutsTemp[box.data("button")] = {};
						ShortCutsTemp[box.data("button")].cust = {};
						ShortCutsTemp[box.data("button")].cust.key = "";
						ShortCutsTemp[box.data("button")].cust.alt = false;
						ShortCutsTemp[box.data("button")].cust.ctrl = false;
						ShortCutsTemp[box.data("button")].cust.shift = false;
					} else {
						ShortCutsTemp[box.data("button")] = {};
						ShortCutsTemp[box.data("button")].cust = {};
						ShortCutsTemp[box.data("button")].cust.key = event.which;
						ShortCutsTemp[box.data("button")].cust.alt = KEYS.ALT;
						ShortCutsTemp[box.data("button")].cust.ctrl = KEYS.CTRL;
						ShortCutsTemp[box.data("button")].cust.shift = KEYS.SHIFT;
					}
					
					box.text((getAlt(box.data("button")) ? "ALT + " : "") + (getCtrl(box.data("button")) ? "CTRL + " : "") + (getShift(box.data("button")) ? "SHIFT + " : "") + KEYS.toReadableKey(getKey(box.data("button")), 10));
					
					$("#ShortCutOption td.selected").addClass("changed");
					$("#ShortCutOption td.selected").removeClass("selected");
					ShortCutOption.isCapturing = false;
				} else {
					console.warn( 'Shortcut "'+box.data("button")+'" is not defined in ShortCutControls' );
					$("#ShortCutOption td.selected").removeClass("selected");
					ShortCutOption.isCapturing = false;
				}
				event.stopImmediatePropagation();
				return false;
			}
		}
	};

	/**
	 * Updates the key list on the UI
	 */
	function updateKeyList() {
		var $shortcut = ShortCutOption.ui.find("td[data-button]");
		for (var i=0; i < $shortcut.length; i++) {
			if (getKey($shortcut.eq(i).data("button"))) {
				$shortcut.eq(i).text(
					(getAlt($shortcut.eq(i).data("button")) ? "ALT + " : "") + 
					(getCtrl($shortcut.eq(i).data("button")) ? "CTRL + " : "") + 
					(getShift($shortcut.eq(i).data("button")) ? "SHIFT + " : "") + 
					KEYS.toReadableKey(parseInt(getKey($shortcut.eq(i).data("button")), 10))
				);
			} else {
				$shortcut.eq(i).text("N/A");
			}
		}
	}
	
	/**
	 * Resets key bindings to initial
	 */
	function resetKeysToDefault() {
		
		Object.keys(ShortCuts).forEach(SC => {
			// Set empty customs
			ShortCutsTemp[SC] = {};
			ShortCutsTemp[SC].cust = false;
			if( ShortCuts[SC].cust != ShortCutsTemp[SC].cust){
				$("#ShortCutOption td[data-button='"+SC+"']").addClass("changed");
			} else {
				$("#ShortCutOption td[data-button='"+SC+"']").removeClass("changed");
			}
		});
		updateKeyList();
	}
	
	/**
	 * Applies the key bindings
	 */
	function applySettings() {
		
		Object.keys(ShortCutsTemp).forEach(SC => {
			// Copy settings
			if (ShortCutsTemp[SC].cust){
				ShortCuts[SC].cust = {};
				ShortCuts[SC].cust.key = ShortCutsTemp[SC].cust.key;
				ShortCuts[SC].cust.alt = ShortCutsTemp[SC].cust.alt;
				ShortCuts[SC].cust.ctrl = ShortCutsTemp[SC].cust.ctrl;
				ShortCuts[SC].cust.shift = ShortCutsTemp[SC].cust.shift;
			} else {
				ShortCuts[SC].cust = false;
			}
		});
		
		ShortCutControls.save();
		BattleMode.reload();
		ShortCutsTemp = {};
		updateKeyList();
		$("#ShortCutOption td.changed").removeClass("changed");
	}
	
	/**
	 * Cancels the key bindings
	 */
	function cancelSettings() {
		ShortCutsTemp = {};
		updateKeyList();
		$("#ShortCutOption td.changed").removeClass("changed");
	}

	/**
	 * Get shortcut key setting
	 */
	function getKey(sc) {
		if(ShortCutsTemp[sc]){
			return ShortCutsTemp[sc].cust ? ShortCutsTemp[sc].cust.key : ShortCuts[sc].init.key;
		} else if(ShortCuts[sc]){
			return ShortCuts[sc].cust ? ShortCuts[sc].cust.key : ShortCuts[sc].init.key;
		} else {
			return false;
		}
	}

	/**
	 * Get shortcut alt setting
	 */
	function getAlt(sc) {
		if(ShortCutsTemp[sc]){
			return ShortCutsTemp[sc].cust ? ShortCutsTemp[sc].cust.alt : ShortCuts[sc].init.alt;
		} else if(ShortCuts[sc]){
			return ShortCuts[sc].cust ? ShortCuts[sc].cust.alt : ShortCuts[sc].init.alt;
		} else {
			return false;
		}
	}

	/**
	 * Get shortcut ctrl setting
	 */
	function getCtrl(sc) {
		if(ShortCutsTemp[sc]){
			return ShortCutsTemp[sc].cust ? ShortCutsTemp[sc].cust.ctrl : ShortCuts[sc].init.ctrl;
		} else if(ShortCuts[sc]){
			return ShortCuts[sc].cust ? ShortCuts[sc].cust.ctrl : ShortCuts[sc].init.ctrl;
		} else {
			return false;
		}
	}

	/**
	 * Get shortcut shift setting
	 */
	function getShift(sc) {
		if(ShortCutsTemp[sc]){
			return ShortCutsTemp[sc].cust ? ShortCutsTemp[sc].cust.shift : ShortCuts[sc].init.shift;
		} else if(ShortCuts[sc]){
			return ShortCuts[sc].cust ? ShortCuts[sc].cust.shift : ShortCuts[sc].init.shift;
		} else {
			return false;
		}
	}
	
	
	/**
	 * Checks if there is a match in the temporary settings
	 */
	function tempMatch(key) {
		var TempState = {};
		var match = false;
		
		Object.keys(ShortCuts).forEach(SC => {
			// Copy current settings
			if (ShortCuts[SC].cust){
				TempState[SC] = {};
				TempState[SC].key = ShortCuts[SC].cust.key;
				TempState[SC].alt = ShortCuts[SC].cust.alt;
				TempState[SC].ctrl = ShortCuts[SC].cust.ctrl;
				TempState[SC].shift = ShortCuts[SC].cust.shift;
			} else {
				TempState[SC] = {};
				TempState[SC].key = ShortCuts[SC].init.key;
				TempState[SC].alt = ShortCuts[SC].init.alt;
				TempState[SC].ctrl = ShortCuts[SC].init.ctrl;
				TempState[SC].shift = ShortCuts[SC].init.shift;
			}
		});
		
		Object.keys(ShortCutsTemp).forEach(SC => {
			// Merge temp settings
			if (ShortCutsTemp[SC].cust){
				TempState[SC] = {};
				TempState[SC].key = ShortCutsTemp[SC].cust.key;
				TempState[SC].alt = ShortCutsTemp[SC].cust.alt;
				TempState[SC].ctrl = ShortCutsTemp[SC].cust.ctrl;
				TempState[SC].shift = ShortCutsTemp[SC].cust.shift;
			}
		});
		
		Object.keys(TempState).every(SC => {
			// Find match
			if (TempState[SC]){
				if(
					TempState[SC].key == key &&
					TempState[SC].alt == KEYS.ALT &&
					TempState[SC].ctrl == KEYS.CTRL &&
					TempState[SC].shift == KEYS.SHIFT
				){ 
					match = true;
					return false;
				} else {
					return true;
				}
			}
		});
		
		return match;
	}
	
	return UIManager.addComponent(ShortCutOption);
});
