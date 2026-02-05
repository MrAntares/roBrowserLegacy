/**
 * Renderer/EntityAttachments.js
 *
 * Helper to manage entity's attachment
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(['Core/Client', 'Renderer/Renderer', 'Renderer/SpriteRenderer', 'Renderer/Camera', 'Renderer/Map/Ground', 'Renderer/Effects/StrEffect'],
function(     Client,            Renderer,            SpriteRenderer,            Camera,               Ground,                    StrEffect )
{
	'use strict';

	// Default fog for STR attachments
	var _defaultFog = {
		use: false,
		exist: false,
		near: 30,
		far: 180,
		color: new Float32Array([1, 1, 1])
	};

	/**
	 * AttachmentManager class
	 *
	 * @constructor
	 * @param {object} entity attached
	 */
	function AttachmentManager( entity )
	{
		this.list   = [];
		this.entity = entity;
	}


	/**
	 * Add an attachment
	 *
	 * @param {object} attachment options
	 */
	AttachmentManager.prototype.add = function add( attachment )
	{
		if (attachment.uid) {
			this.remove(attachment.uid);
		}

		attachment.startTick     = Renderer.tick;
		attachment.opacity       = !isNaN(attachment.opacity) ? attachment.opacity : 1.0;
		attachment.direction     = attachment.hasOwnProperty('frame')   ? false : true;
		attachment.frame         = attachment.frame     || 0;
		attachment.depth         = attachment.depth     || 0.0;
		attachment.head          = attachment.head      || false;

		attachment.position = false;
        if (attachment.yOffset || attachment.xOffset) attachment.position = new Int16Array(2);
        if (attachment.xOffset) attachment.position[0] = attachment.xOffset;
        if (attachment.yOffset) attachment.position[1] = attachment.yOffset;

		attachment.repeat        = attachment.repeat    || false;
		attachment.duplicate 	 = attachment.duplicate || 0;
		attachment.stopAtEnd     = attachment.stopAtEnd || false;
		attachment.delay = attachment.delay || false;
		attachment.renderBefore  = attachment.renderBefore || false;

		if (attachment.completeFile) {
            attachment.spr = attachment.completeFile + '.spr';
            attachment.act = attachment.completeFile + '.act';
        } else if (attachment.file) {
			attachment.spr = 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/' + attachment.file + '.spr';
			attachment.act = 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/' + attachment.file + '.act';
		}

		// STR file attachment
		if (attachment.strFile) {
			attachment.isStr = true;
			var strNormalized = attachment.strFile.replace(/\\/g, '/');
			var lastSlash = strNormalized.lastIndexOf('/');
			var strTexturePath = lastSlash >= 0 ? strNormalized.substring(0, lastSlash + 1) : '';
			
			var strEffect = new StrEffect(
				attachment.strFile,
				this.entity.position,
				Renderer.tick,
				strTexturePath
			);
			strEffect.ownerEntity = this.entity;
			strEffect.persistent = attachment.repeat !== false;
			strEffect.xOffset = attachment.xOffset || 0;
			strEffect.yOffset = attachment.yOffset || 0;
			
			attachment.strEffect = strEffect;
			this.list.push(attachment);
			return;
		}

		// Start rendering once sprite is loaded
		Client.loadFile(attachment.spr, function onLoad() {
			this.list.push(attachment);
		}.bind(this), null, {to_rgba:true});
	};

	/**
	 * Get an attachment
	 *
	 * @param {mixed} unique id
	 */
	AttachmentManager.prototype.get = function get( uid ) {
        var i, length = this.list.length;
        for (i = 0; i < length; ++i) {
            if (this.list[i].uid == uid) return this.list[i];
        }
        return null;
    };

	/**
	 * Remove an attachment
	 *
	 * @param {mixed} unique id
	 */
	AttachmentManager.prototype.remove = function remove( uid )
	{
		var i, count;
		var list;

		list  = this.list;
		count = list.length;

		for (i = 0; i < count; ++i) {
			if (list[i].uid === uid) {
				this.removeIndex(i);
				i--;
				count--;
			}
		}
	};


	/**
	 * Remove attachment at index
	 *
	 * @param {number} index
	 */
	AttachmentManager.prototype.removeIndex = function removeIndex( index )
	{
		this.list.splice(index, 1);

		// Is effect and no attachment, clean up
		if (this.list.length === 0 && this.entity.objecttype === this.entity.constructor.TYPE_EFFECT) {
			this.entity.remove();
		}
	};


	/**
	 * Render attachments filtered by renderBefore flag
	 */
	AttachmentManager.prototype._renderFiltered = function renderFilteredClosure()
	{
		var effectColor = new Float32Array(4);

		return function _renderFiltered( tick, renderBeforeEntity )
		{
			var list;
			var i, count;
			var hasAttachments = false;

			list  = this.list;
			count = list.length;

			for (i = 0; i < count; ++i) {
				if (!!this.list[i].renderBefore === renderBeforeEntity) {
					hasAttachments = true;
					break;
				}
			}

			if (!hasAttachments) {
				return;
			}

			SpriteRenderer.shadow = Ground.getShadowFactor( this.entity.position[0], this.entity.position[1] );

			effectColor[0] = this.entity.effectColor[0];
			effectColor[1] = this.entity.effectColor[1];
			effectColor[2] = this.entity.effectColor[2];
			effectColor[3] = this.entity.effectColor[3];

			// Reset effectColor to white for attachments
			this.entity.effectColor[0] = 1.0;
			this.entity.effectColor[1] = 1.0;
			this.entity.effectColor[2] = 1.0;
			this.entity.effectColor[3] = 1.0;

			for (i = 0; i < count; ++i) {
				if (!!this.list[i].renderBefore !== renderBeforeEntity) {
					continue;
				}
				
				// Effects ignore ground shadow
				if (this.list[i].ignoreShadow || this.list[i].renderBefore) {
					SpriteRenderer.shadow = 1.0;
				}
				
				if (this.renderAttachment( this.list[i], tick)) {
					this.removeIndex(i);
					i--;
					count--;
				}
			}

			SpriteRenderer.depth = 0.0;
			
			// Restore original effectColor
			this.entity.effectColor[0] = effectColor[0];
			this.entity.effectColor[1] = effectColor[1];
			this.entity.effectColor[2] = effectColor[2];
			this.entity.effectColor[3] = effectColor[3];
		};
	}();


	/**
	 * Render attachments before (behind) the entity
	 */
	AttachmentManager.prototype.renderBefore = function renderBefore( tick )
	{
		this._renderFiltered(tick, true);
	};


	/**
	 * Render attachments after (in front of) the entity
	 */
	AttachmentManager.prototype.render = function render( tick )
	{
		this._renderFiltered(tick, false);
	};


	/**
	 * Render an attachment
	 *
	 * @param {object} attachment options
	 * @param {number} game tick
	 * @return {boolean} remove from the list
	 */
	AttachmentManager.prototype.renderAttachment = function renderAttachmentClosure()
	{
		var position = new Int16Array(2);

		return function renderAttachment( attachment, tick)
		{
			// Nothing to render yet
			if (attachment.startTick > tick) {
				return;
			}

			// Render STR attachment
			if (attachment.isStr && attachment.strEffect) {
				var strEffect = attachment.strEffect;
				var gl = Renderer.gl;
				
				try {
					strEffect.position = this.entity.position;
					strEffect.ownerDirection = this.entity.direction;
					
					if (!StrEffect.ready) {
						StrEffect.init(gl);
					}
					
					// Pass true for disableDepthTest since this is an entity attachment
					StrEffect.beforeRender(gl, Camera.modelView, Camera.projection, _defaultFog, tick, true);
					strEffect.render(gl, tick);
					StrEffect.afterRender(gl);
				} catch (e) {
					console.error('STR attachment error:', e);
					// Ensure WebGL state is restored even on error
					StrEffect.afterRender(gl);
				}
				
				SpriteRenderer.bind3DContext(gl, Camera.modelView, Camera.projection, _defaultFog);
				
				if (!strEffect.persistent && strEffect.needCleanUp) {
					return true;
				}
				
				return false;
			}

			var i, count;
			var spr, act, delay, frame;
			var animation, animations, layers;
			var clean = false;

			spr = Client.loadFile(attachment.spr);
			act = Client.loadFile(attachment.act);

			if (!spr || !act || !spr.frames) {
				return clean;
			}

			this.entity.effectColor[3]  = attachment.opacity;
			if(!attachment.position){
				position[1] = attachment.head ? -100 : 0;
			} else if(attachment.position){
				position[0] = attachment.position[0];
				position[1] = attachment.position[1];
			}

			frame                       = attachment.direction ? (Camera.direction + this.entity.direction + 8) % 8 : attachment.frame;
			frame                      %= act.actions.length;
			animations                  = act.actions[frame].animations;
			delay                       = attachment.delay || act.actions[frame].delay;
			SpriteRenderer.depth        = attachment.depth || 0;

			// pause
			if ('animationId' in attachment) {
				layers = animations[attachment.animationId].layers;
			}

			// repeat animation
			else if (attachment.repeat) {
				layers = animations[ Math.floor((tick - attachment.startTick) / delay) % animations.length].layers;
			}

			// repeat duplicate times
			else if (attachment.duplicate > 0){
				var index = Math.floor((tick - attachment.startTick) / delay) % animations.length;
				layers = animations[index].layers;
				if(index == animations.length - 1) attachment.duplicate--;
			}

			// stop at end
			else {
				animation = Math.min( Math.floor((tick - attachment.startTick) / delay), animations.length-1);
				layers    = animations[animation].layers;

				if (animation === animations.length - 1 && !attachment.stopAtEnd) {
					clean = true;
				}
			}

			// Render layers with depth ordering (renderBefore behind, normal in front)
			var self = this;
			var zIdx = attachment.renderBefore ? -10 : 500;
			
			SpriteRenderer.runWithDepth(true, false, false, function () {
				SpriteRenderer.zIndex = zIdx;
				for (i = 0, count = layers.length; i < count; ++i) {
					self.entity.renderLayer(layers[i], spr, spr, 1.0, position, false);
				}
			});
			
			return clean;
		};
	}();


	/**
	 * Export
	 */
	return function init()
	{
		this.attachments = new AttachmentManager(this);
	};
});
