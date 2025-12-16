/**
 * Core/MemoryManager.js
 *
 * Memory Manager
 *
 * Set up a cache context to avoid re-loading/parsing files each time, files are removed automatically if not used
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define( ['Core/MemoryItem'], function( MemoryItem )
{
	'use strict';


	/**
	 * List of files in memory
	 * @var List MemoryItem
	 */
	var _memory = {};


	/**
	 * Remove files from memory if not used until a period of time
	 * @var {number}
	 */
	var _rememberTime = 2 * 60 * 1000; // 2 min


	/**
	 * @var {number} last time we clean up variables
	 */
	var _lastCheckTick = 0;


	/**
	 * @var {number} perform the clean up every 30 secs
	 */
	var _cleanUpInterval = 30 * 1000;

	/**
	 * @vars async cleaning tracking
	 */
	var _cleaningInProgress = false;  
	var _cleanIndex = 0;  
	var _filesToClean = [];

	/**
	 * Get back data from memory
	 *
	 * @param {string} filename
	 * @param {function} onload - optional
	 * @param {function} onerror - optional
	 * @return mixed data
	 */
	function get( filename, onload, onerror )
	{
		var item;

		// Not in memory yet, create slot
		if (!_memory[filename]) {
			_memory[filename] = new MemoryItem();
		}

		item = _memory[filename];

		if (onload) {
			item.addEventListener('load', onload );
		}

		if (onerror) {
			item.addEventListener('error', onerror );
		}

		return item.data;
	}


	/**
	 * Check if the entry exists
	 *
	 * @param {string} filename
	 * @return boolean isInMemory
	 */
	function exist( filename )
	{
		return !!_memory[filename];
	}


	/**
	 * Stored data in memory
	 *
	 * @param {string} filename
	 * @param {string|object} data
	 * @param {string} error - optional
	 */
	function set( filename, data, error )
	{
		// Not in memory yet, create slot
		if (!_memory[filename]) {
			_memory[filename] = new MemoryItem();
		}

		if (error || !data) {
			_memory[filename].onerror( error );
		}
		else {
			_memory[filename].onload( data );
		}
	}


	/**
	 * Clean up not used data from memory
	 *
	 * @param {object} gl - WebGL Context
	 * @param {number} now - game tick
	 */
	function clean( gl, now )
	{
		if (_lastCheckTick + _cleanUpInterval > now || _cleaningInProgress)
			return;

		var keys, item;
		var i, count, tick;
		var list = [];
		_filesToClean = [];

		keys  = Object.keys(_memory);
		count = keys.length;
		tick  = now - _rememberTime;

		var INTERFACE_PATH = 'data/texture/\xc0\xaf\xc0\xfa\xc0\xce\xc5\xcd\xc6\xe4\xc0\xcc\xbd\xba/';

		for (i = 0; i < count; ++i) {
			// Skip INTERFACE_PATH files  
			if (keys[i].indexOf(INTERFACE_PATH) === 0) 
				continue;

			item = _memory[ keys[i] ];
			if (item.complete && item.lastTimeUsed < tick) {
				_filesToClean.push(keys[i]);
			}
		}

		if (_filesToClean.length === 0) {  
			_lastCheckTick = now;  
			return;  
		}  
		_cleaningInProgress = true;  
		_cleanIndex = 0;
		requestIdleCallback(function cleanChunk(deadline) {  
			var processed = 0;  
			var maxProcess = Math.min(5, _filesToClean.length - _cleanIndex); // Total 5 Max Process each call 
			
			while (_cleanIndex < _filesToClean.length &&   
					(deadline.timeRemaining() > 0 || processed < maxProcess)) {  
				
				remove(gl, _filesToClean[_cleanIndex]);  
				list.push(_filesToClean[_cleanIndex]);  
				_cleanIndex++;  
				processed++;  
			}  
			
			if (_cleanIndex < _filesToClean.length) {  
				// Will be back in next time
				requestIdleCallback(cleanChunk);  
			} else {  
				// Finished 
				_cleaningInProgress = false;  
				_lastCheckTick = now;  
				_filesToClean = [];  
				
				if (list.length) {  
					console.log('%c[MemoryManager] - Removing ' + list.length +   
								' unused elements from memory.', 'color:#d35111', list);  
				}  
			}  
		});
	}


	/**
	 * Remove Item from memory
	 *
	 * @param {object} gl - WebGL Context
	 * @param {string} filename
	 */
	function remove( gl, filename )
	{
		// Not found or filename is undefined?
		if (!filename || !_memory[filename]) {
			return;
		}

		var file = get( filename );
		var ext  = '';
		var i, count;

		var matches = filename.match(/\.[^\.]+$/);

		if (matches) {
			ext = matches.toString().toLowerCase();
		}

		// Free file
		if (file) {
			switch (ext) {

				// Delete GPU textures from sprites
				case '.spr':
					if (file.frames) {
						for (i = 0, count = file.frames.length; i < count; ++i) {
							if (file.frames[i].texture && gl != null && gl.isTexture(file.frames[i].texture)) {
								gl.deleteTexture( file.frames[i].texture );
							}
						}
					}
					if (file.texture && gl != null && gl.isTexture(file.texture)) {
						gl.deleteTexture( file.texture );
					}
					break;

				// Delete palette
				case '.pal':
					if (file.texture && gl != null && gl.isTexture(file.texture)) {
						gl.deleteTexture( file.texture );
					}
					break;

				// If file is a blob, remove it (wav, mp3, lua, lub, txt, ...)
				default:
					if (file.match && file.match(/^blob\:/)) {
						URL.revokeObjectURL(file);
					}
					break;
			}
		}

		// Delete from memory
		delete _memory[filename];
	}

	/**
	 * Search files in memory based on a regex
	 *
	 * @param regex
	 * @return string[] filename
	 */
	function search(regex)
	{
		var keys;
		var i, count, out = [];

		keys  = Object.keys(_memory);
		count = keys.length;

		for (i = 0; i < count; ++i) {
			if (keys[i].match(regex)) {
				out.push( keys[i] );
			}
		}

		return out;
	}


	/**
	 * Export methods
	 */
	return {
		get:    get,
		set:    set,
		clean:  clean,
		remove: remove,
		exist:  exist,
		search: search
	};
});
