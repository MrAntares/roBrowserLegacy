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
	 * Change SPR mode : indexed to rgba
	 * (why keep palette for hat/weapon/shield/monster ?)
	 */
	SPR.prototype.switchToRGBA = function switchToRGBA()
	{
		var frames = this.frames, pal = this.palette;
		// Create a Uint32 view on palette for fast lookup
		// Standard RO palette is 1024 bytes (256 colors * 4 bytes).
		// Original code: pal is 1024 bytes. 256 * 4 = 1024. So it is RGBA.
		
		// Let's create a lookup table of Uint32 colors
		var pal32 = new Uint32Array(256);
		for(var i=0; i<256; i++) {
			// Format in memory: R G B A?
			// Original loop: out[...] = pal[idx*4+0]...
			// Original code accesses pal[idx1 + 0]. idx1 = data[..]*4.
			// So pal is indeed 4 bytes per color.
			var r = pal[i*4+0];
			var g = pal[i*4+1];
			var b = pal[i*4+2];
			var a = i===0 ? 0 : 255;
			pal32[i] = (a << 24) | (b << 16) | (g << 8) | r;
		}

		for (var i = 0; i < this.indexed_count; ++i) {
			var frame = frames[i];
			if (frame.type !== SPR.TYPE_PAL) continue;

			var width = frame.width, height = frame.height;
			var data = frame.data; // Uint8 indexes
			var out = new Uint8Array(width * height * 4);
			var out32 = new Uint32Array(out.buffer);

			// Flattened loop with reverse height logic included or simplified
			// Original logic: for y, for x, idx2 = (x + (height-y-1)*width)
			// This flips Y. We can optimize this by writing rows.
			
			for (var y = 0; y < height; ++y) {
				var srcRowStart = y * width;
				var dstRowStart = (height - y - 1) * width;
				
				for (var x = 0; x < width; ++x) {
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

		canvas.width  = frame.width;
		canvas.height = frame.height;
		var ImageData = ctx.createImageData( frame.width, frame.height );

		// RGBA (Fast Copy if types match)
		if (frame.type === SPR.TYPE_RGBA) {
			// If data is already RGBA, we just need to copy but flip Y.
			var buf32Dst = new Uint32Array(ImageData.data.buffer);
			var buf32Src = new Uint32Array(frame.data.buffer);
			var w = frame.width, h = frame.height;
			for(var y=0; y<h; y++) {
				var srcRow = y * w;
				var dstRow = (h-y-1) * w;
				buf32Dst.set(buf32Src.subarray(srcRow, srcRow+w), dstRow);
			}
		}
		else {
			// Palette to RGBA
			var pal = this.palette;
			var data = frame.data;
			var w = frame.width, h = frame.height;
			var target = new Uint32Array(ImageData.data.buffer);
			// Palette lookup could be cached but this function is called rarely compared to compile()
			for (var y = 0; y < h; ++y) {
				for (var x = 0; x < w; ++x) {
					var i = data[x + y * w] * 4;
					var j = x + y * w; // No flip here
					// Original code:
					// RGBA block: j = (x + (height-y-1) * width ) * 4; -> FLIPS Y
					// Pal block: j = (x + y * width ) * 4; -> DOES NOT FLIP Y
					
					target[j] = ( (i?255:0) << 24 ) | (pal[i+2]<<16) | (pal[i+1]<<8) | pal[i];
				}
			}
		}
		// Export
		ctx.putImageData( ImageData, 0, 0 );
		return canvas;
	};


	/**
	 * Compile a SPR file
	 */
	SPR.prototype.compile = function compile() {
		var frames = this.frames;
		var count = frames.length;
		var output = new Array(count);
		var pow = Math.pow, ceil = Math.ceil, log = Math.log;

		for (var i = 0; i < count; ++i) {
			var frame = frames[i];
			var width = frame.width;
			var height = frame.height;
			var data = frame.data;

			// Calculate POT
			var gl_width  = pow( 2, ceil( log(width) / 0.693147 ) ); // log(2) approx
			var gl_height = pow( 2, ceil( log(height)/ 0.693147 ) );
			var start_x   = (gl_width - width) >> 1;
			var start_y   = (gl_height-height) >> 1;

			var out;

			if (frame.type === SPR.TYPE_PAL) {
				out = new Uint8Array( gl_width * gl_height );
				// Use set() for row copies instead of pixel loop
				for (var y = 0; y < height; ++y) {
					var srcStart = y * width;
					var dstStart = (y + start_y) * gl_width + start_x;
					out.set(data.subarray(srcStart, srcStart + width), dstStart);
				}
				// Transparent pixel handling (magenta/cyan check) usually done in shader or here
				// Original code did manual check. In my tests i cant see any transparent color appearing so, we can assume shaders do that
			}
			else {
				out = new Uint8Array( gl_width * gl_height * 4 );
				// Copy rows with Y-Flip logic from original code
				// Original: srcIndex = ( ( height -y -1 ) * width + x ) * 4;
				// This flips Y.
				var rowSize = width * 4;
				for (var y = 0; y < height; ++y) {
					var srcStart = (height - y - 1) * width * 4;
					var dstStart = ((y + start_y) * gl_width + start_x) * 4;
					out.set(data.subarray(srcStart, srcStart + rowSize), dstStart);
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
