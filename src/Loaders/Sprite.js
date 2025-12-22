/**
 * Loaders/Sprite.js
 *
 * Loaders for Gravity .spr file (Sprite)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define( ['Utils/BinaryReader'], function( BinaryReader )
{
	'use strict';


	/**
	 * Sprite Constructor
	 *
	 * @param {ArrayBuffer} data - optional data to work with
	 */
	function SPR( data )
	{
		if (data) {
			this.load(data);
		}
	}


	/**
	 * Sprite Constants
	 */
	SPR.TYPE_PAL  = 0;
	SPR.TYPE_RGBA = 1;


	/**
	 * Sprite public methods
	 */
	SPR.prototype.fp             = null;
	SPR.prototype.header         = 'SP';
	SPR.prototype.version        = 0.0;
	SPR.prototype.indexed_count  = 0;
	SPR.prototype._indexed_count = 0;
	SPR.prototype.rgba_count     = 0;
	SPR.prototype.rgba_index     = 0;
	SPR.prototype.palette        = null;
	SPR.prototype.frames         = null;


	/**
	 * Load a Sprite data
	 *
	 * @param {ArrayBuffer} data - file content
	 */
	SPR.prototype.load = function load(data)
	{
		this.fp      = new BinaryReader(data);
		this.header  = this.fp.readBinaryString(2);
		this.version = this.fp.readUByte()/10 + this.fp.readUByte();

		if (this.header != 'SP') {
			throw new Error('SPR::load() - Incorrect header "' + this.header + '", must be "SP"');
		}

		this.indexed_count  = this.fp.readUShort();
		this._indexed_count = this.indexed_count + 0;

		if (this.version > 1.1) {
			this.rgba_count = this.fp.readUShort();
		}

		this.frames      = new Array(this.indexed_count + this.rgba_count);
		this.rgba_index  = this.indexed_count;


		if (this.version < 2.1) {
			this.readIndexedImage();
		}
		else {
			this.readIndexedImageRLE();
		}

		this.readRgbaImage();

		// Read palettes.
		if (this.version > 1.0) {
			this.palette = new Uint8Array( this.fp.buffer, this.fp.length-1024, 1024 );
		}
	};


	/**
	 * Parse SPR indexed images
	 */
	SPR.prototype.readIndexedImage = function readIndexedImage()
	{
		var pal_count = this.indexed_count;
		var fp        = this.fp;
		var i, width, height;
		var frames    = this.frames;

		for (i = 0; i < pal_count; ++i) {
			width     =  fp.readUShort();
			height    =  fp.readUShort();
			frames[i] = {
				type:   SPR.TYPE_PAL,
				width:  width,
				height: height,
				data:   new Uint8Array( fp.buffer, fp.tell(), width * height )
			};

			fp.seek( width * height, SEEK_CUR );
		}
	};


	/**
	 * Parse SPR indexed images encoded with RLE
	 */
	SPR.prototype.readIndexedImageRLE = function readIndexedImageRLE()
	{
		var pal_count = this.indexed_count;
		var fp        = this.fp;
		var i, width, height, size, data, index, c, count, j, end;
		var frames    = this.frames;

		for (i = 0; i < pal_count; ++i) {

			width   =  fp.readUShort();
			height  =  fp.readUShort();
			size    =  width * height;
			data    =  new Uint8Array( size );
			index   = 0;
			end     = fp.readUShort() + fp.tell();

			while (fp.tell() < end) {
				c = fp.readUByte();
				data[ index++ ] = c;

				if (!c) {
					count = fp.readUByte();
					if (!count) {
						data[ index++ ] = count;
					}
					else {
						for (j = 1; j < count; ++j) {
							data[ index++ ] = c;
						}
					}
				}
			}

			frames[i] = {
				type:   SPR.TYPE_PAL,
				width:  width,
				height: height,
				data:   data
			};
		}
	};


	/**
	 * Parse SPR rgba images
	 */
	SPR.prototype.readRgbaImage = function readRGBAImage()
	{
		var rgba   = this.rgba_count;
		var index  = this.rgba_index;
		var fp     = this.fp;
		var frames = this.frames;
		var i, width, height;

		for (i = 0; i < rgba; ++i) {
			width   =  fp.readShort();
			height  =  fp.readShort();

			frames[ i + index ] = {
				type:   SPR.TYPE_RGBA,
				width:  width,
				height: height,
				data:   new Uint8Array( fp.buffer, fp.tell(), width * height * 4 )
			};

			fp.seek( width * height * 4, SEEK_CUR );
		}
	};


	/**
	 * Builds a 32-bit palette lookup table.
	 *
	 * NOTE ABOUT ENDIANNESS:
	 * JavaScript TypedArrays are Little Endian.
	 *
	 * Writing (A<<24 | B<<16 | G<<8 | R) produces memory bytes [R, G, B, A],
	 * which matches Canvas ImageData (RGBA).
	 *
	 * The exact byte layout depends on the chosen packing below.
	 */
	SPR.prototype.convert32bPal = function convert32bPal( pal, flip = false) {
		var pal32 = new Uint32Array(256);
		for (var i = 0; i < 256; i++) {
			var r = pal[i * 4 + 0];
			var g = pal[i * 4 + 1];
			var b = pal[i * 4 + 2];
			var a = i === 0 ? 0 : 255; // A? A = 255

			// If flip=true, we prepare the integer to be written as ABGR in memory
			// effectively resulting in RGBA sequence in Little Endian systems.
			if(flip === true) // Memory (LE): [R, G, B, A]  -> Canvas RGBA
				pal32[i] = (a << 24) | (b << 16) | (g << 8) | r;
			else // Memory (LE): [A, B, G, R]  -> ABGR layout
				pal32[i] = (r << 24) | (g << 16) | (b << 8) | a;
		}
		return pal32;
	}
	
	/**
	 * Change SPR mode : indexed to rgba
	 * (why keep palette for hat/weapon/shield/monster ?)
	 */
	SPR.prototype.switchToRGBA = function switchToRGBA()
	{
		var frames = this.frames, pal = this.palette;		
		// Create a lookup table of Uint32 colors to speed up conversion
		var pal32 = this.convert32bPal (pal, false);
		for (var i = 0; i < this.indexed_count; ++i) {
			var frame = frames[i];
			if (frame.type !== SPR.TYPE_PAL) continue;

			var width = frame.width, height = frame.height;
			var data = frame.data; // Uint8 indexes
			var out = new Uint8Array(width * height * 4);
			
			// We map a Uint32View to the output buffer to write 4 bytes at once
			var out32 = new Uint32Array(out.buffer);
			
			/**
			 * OLD LOGIC: 
			 * - READ: Accessed data[x + y * width] every iteration (redundant multiplication).
			 * - WRITE: Performed 4 separate byte assignments (out[ idx2 + 3 ] = pal[ idx1 + 0 ]...out[ idx2 + 1 ] = pal[ idx1 + 2 ]).
			 * NEW LOGIC:
			 * - READ: Pre-calculates row offsets per line to minimize arithmetic overhead.
			 * - WRITE: Uses a single 32-bit integer assignment to write all 4 channels (RGBA) at once.
			 * COORDINATES: Vertical flip logic (height - y - 1) is maintained for correct visual orientation.
			 */
			for (var y = 0; y < height; ++y) { // reverse height
				var srcRowStart = y * width;
				var dstRowStart = (height - y - 1) * width;

				for (var x = 0; x < width; ++x) {
					// Single 32-bit assignment from pre-calculated palette table
					out32[dstRowStart + x] = pal32[ data[srcRowStart + x] ];
				}
			}

			frame.data = out;
			frame.type = SPR.TYPE_RGBA;
		}

		this.indexed_count  = 0;
		this.rgba_count     = frames.length;
		this.rgba_index     = 0;
	};


	/**
	 * Get back a canvas from a frame
	 *
	 * @param {number} index frame
	 * @return {HTMLElement} canvas
	 */
	SPR.prototype.getCanvasFromFrame = function getCanvasFromFrame( index )
	{
		var canvas = document.createElement('canvas');
		var ctx    = canvas.getContext('2d');
		var frame = this.frames[index];

		// Missing/empty frame?
		if ( !frame || frame.width <= 0 || frame.height <= 0) {
			// Create a red X on a 30x30 canvas as error image
			var size = 30;
			var fontSize = Math.floor(size * 0.8);
			canvas.width = canvas.height = size;
			ctx.fillStyle = 'red';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.font = fontSize+'px sans-serif';
			ctx.fillText('X', size / 2, size / 2);
			
			return canvas; // Return error image. Caller expects a canvas..
		}

		var width = canvas.width = frame.width;
		var height = canvas.height = frame.height;
		var imageData = ctx.createImageData(width, height);

		// Use a 32-bit view to write pixels to the ImageData buffer efficiently
		var data32 = new Uint32Array(imageData.data.buffer);
		
		// RGBA
		if (frame.type === SPR.TYPE_RGBA) {
			var frameData32 = new Uint32Array(frame.data.buffer);
			for (var y = 0; y < height; ++y) {
				var srcRow = y * width;
				var dstRow = (height - y - 1) * width; // Flip Y
				for (var x = 0; x < width; ++x) {
					var pixel = frameData32[srcRow + x];

					/**
					 * OLD LOGIC: Manual assignments for each channel (ImageData.data[j+0] = ...).
					 * NEW LOGIC: Reads the source pixel as a 32-bit integer and performs a bitwise "Byte Swap".
					 * WHY: The source RGBA order in .spr files might not match the Canvas [R,G,B,A] layout. 
					 * Manipulating the full 32-bit word with shifts and masks is faster than 4 separate array writes.
					 */
					data32[dstRow + x] = 
						((pixel & 0x000000ff) << 24) | // A
						((pixel & 0x0000ff00) << 8)  | // R
						((pixel & 0x00ff0000) >> 8)  | // G
						((pixel & 0xff000000) >> 24);  // B
				}
			}
		}

		// Palette
		else {
			// Convert palette to 32bit using flip=true for ABGR order (Little Endian -> RGBA)
			var pal32 = this.convert32bPal (this.palette, true);
			for (var y = 0; y < height; ++y) { // reverse height
				var rowStart = y * width;
				for (var x = 0; x < width; ++x) {
					var idx = frame.data[rowStart + x];
					data32[rowStart + x] = pal32[idx];
				}
			}
		}

		// Export
		ctx.putImageData( imageData, 0, 0 );
		return canvas;
	};


	/**
	 * Compile a SPR file
	 */
	SPR.prototype.compile = function compile() {
		var frames = this.frames;
		var frame;
		var i, count = frames.length;
		var data, width, height, gl_width, gl_height, start_x, start_y, x, y, alpha;
		var pow = Math.pow, ceil = Math.ceil, log = Math.log, floor = Math.floor;
		var out;
		var output = new Array(count);

		for (i = 0; i < count; ++i) {

			// Avoid look up
			frame  = frames[i];
			data   = frame.data;
			width  = frame.width;
			height = frame.height;

			// Calculate new texture size and pos to center
			gl_width  = pow( 2, ceil( log(width) /log(2) ) );
			gl_height = pow( 2, ceil( log(height)/log(2) ) );
			start_x   = floor( (gl_width - width) * 0.5 );
			start_y   = floor( (gl_height-height) * 0.5 );

			// If palette.
			if (frame.type === SPR.TYPE_PAL) {
				out = new Uint8Array( gl_width * gl_height );

				for (y = 0; y < height; ++y) {
					for (x = 0; x < width; ++x) {
						out[ ( ( y + start_y ) * gl_width + ( x + start_x ) ) ] = data[ y * width + x ];
						if(this.palette[data[ y * width + x ]*4]==255
							&& this.palette[data[ y * width + x ]*4+2]==255
							&&this.palette[data[ y * width + x ]*4+1]==0 )
							out[ ( ( y + start_y ) * gl_width + ( x + start_x ) ) ] = 0;
					}
				}
			}

			// RGBA Images
			else {
				out = new Uint8Array( gl_width * gl_height * 4 );
				let srcIndex, dstIndex;

				for (y = 0; y < height; ++y) {
					for (x = 0; x < width; ++x) {
						srcIndex = ( ( height -y -1 ) * width + x ) * 4;
						dstIndex = ( ( y + start_y ) * gl_width + ( x + start_x ) ) * 4;
						// Set all colors to 0 if alpha is also 0
						// This fixes white outlines appearing on RGBA sprites
						alpha = data[srcIndex];
						out[dstIndex + 0 ] = alpha ? data[srcIndex + 3] : 0;
						out[dstIndex + 1 ] = alpha ? data[srcIndex + 2] : 0;
						out[dstIndex + 2 ] = alpha ? data[srcIndex + 1] : 0;
						out[dstIndex + 3 ] = alpha;
					}
				}
			}

			output[i] = {
				type:           frame.type,
				width:          gl_width,
				height:         gl_height,
				originalWidth:  width,
				originalHeight: height,
				data:           out
			};
		}

		return {
			frames:        output,
			palette:       this.palette,
			rgba_index:    this.rgba_index,
			old_rgba_index:this._indexed_count
		};
	};


	return SPR;
});
