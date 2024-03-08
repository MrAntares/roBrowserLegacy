define(['Utils/WebGL', 'Utils/Texture', 'Utils/gl-matrix', 'Core/Client', 'Renderer/SpriteRenderer', 'Renderer/EntityManager', 'Renderer/Camera'],
function (WebGL, Texture, glMatrix, Client, SpriteRenderer, EntityManager, Camera) {

	'use strict';

	const Entity = require('Renderer/Entity/Entity');

	/**
	 * @var {mat4}
	 */
	var mat4 = glMatrix.mat4;


	/**
	 * @var {mat4} rotation matrix
	 */
	var _matrix = mat4.create();

	function getRandomIntInclusive(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
	}

	var blendMode = {};

	function TwoDEffect(effect, EF_Inst_Par, EF_Init_Par) {
		var position = EF_Inst_Par.position;
		var startTick = EF_Inst_Par.startTick;
		var endTick = EF_Inst_Par.endTick;
		var AID = EF_Init_Par.ownerAID;

		this.AID = AID;
		this.ownerEntity = EF_Init_Par.ownerEntity;
		this.otherEntity = EF_Init_Par.otherEntity;

		this.textureName = effect.file;
		this.zIndex = effect.zIndex ? effect.zIndex : 0;
		this.fadeOut = effect.fadeOut ? true : false;
		this.fadeIn = effect.fadeIn ? true : false;

		this.alphaMax = (!isNaN(effect.alphaMax)) ? Math.max(Math.min(effect.alphaMax, 1), 0) : 1;

		this.shadowTexture = effect.shadowTexture ? true : false;

		if (effect.red) this.red = effect.red;
		else this.red = 1;

		if (effect.green) this.green = effect.green;
		else this.green = 1;

		if (effect.blue) this.blue = effect.blue;
		else this.blue = 1;

		// Original position
		this.position = position;

		// PosX
		if (effect.posxStart) this.posxStart = effect.posxStart;
		else this.posxStart = 0;

		if (effect.posxEnd) this.posxEnd = effect.posxEnd;
		else this.posxEnd = 0;

		if (effect.posx) {
			this.posxStart = effect.posx;
			this.posxEnd = effect.posx;
		}

		if (effect.posxRand) {
			this.posxStart = getRandomIntInclusive(-effect.posxRand, effect.posxRand);
			this.posxEnd = this.posxStart;
		}

		if (effect.posxRandDiff) {
			this.posxStart = getRandomIntInclusive(-effect.posxRandDiff, effect.posxRandDiff);
			this.posxEnd = getRandomIntInclusive(-effect.posxRandDiff, effect.posxRandDiff);
		}

		if (effect.posxStartRand) {
			var posxStartRandMiddle = effect.posxStartRandMiddle ? effect.posxStartRandMiddle : 0;
			this.posxStart = getRandomIntInclusive(posxStartRandMiddle - effect.posxStartRand, posxStartRandMiddle + effect.posxStartRand);
		}

		if (effect.posxEndRand) {
			var posxEndRandMiddle = effect.posxEndRandMiddle ? effect.posxEndRandMiddle : 0;
			this.posxEnd = getRandomIntInclusive(posxEndRandMiddle - effect.posxEndRand, posxEndRandMiddle + effect.posxEndRand);
		}

		this.posxSmooth = effect.posxSmooth ? true : false;

		// PosY
		if (effect.posyStart) this.posyStart = effect.posyStart;
		else this.posyStart = 0;

		if (effect.posyEnd) this.posyEnd = effect.posyEnd;
		else this.posyEnd = 0;

		if (effect.posy) {
			this.posyStart = effect.posy;
			this.posyEnd = effect.posy;
		}

		if (effect.posyRand) {
			this.posyStart = getRandomIntInclusive(-effect.posyRand, effect.posyRand);
			this.posyEnd = this.posyStart;
		}

		if (effect.posyRandDiff) {
			this.posyStart = getRandomIntInclusive(-effect.posyRandDiff, effect.posyRandDiff);
			this.posyEnd = getRandomIntInclusive(-effect.posyRandDiff, effect.posyRandDiff);
		}

		if (effect.posyStartRand) {
			var posyStartRandMiddle = effect.posyStartRandMiddle ? effect.posyStartRandMiddle : 0;
			this.posyStart = getRandomIntInclusive(posyStartRandMiddle - effect.posyStartRand, posyStartRandMiddle + effect.posyStartRand);
		}

		if (effect.posyEndRand) {
			var posyEndRandMiddle = effect.posyEndRandMiddle ? effect.posyEndRandMiddle : 0;
			this.posyEnd = getRandomIntInclusive(posyEndRandMiddle - effect.posyEndRand, posyEndRandMiddle + effect.posyEndRand);
		}

		this.posySmooth = effect.posySmooth ? true : false;

		// PosZ
		if (effect.poszStart) this.poszStart = effect.poszStart;
		else this.poszStart = 0;

		if (effect.poszEnd) this.poszEnd = effect.poszEnd;
		else this.poszEnd = 0;

		if (effect.posz) {
			this.poszStart = effect.posz;
			this.poszEnd = effect.posz;
		}

		if (effect.poszRand) {
			this.poszStart = getRandomIntInclusive(-effect.poszRand, effect.poszRand);
			this.poszEnd = this.poszStart;
		}

		if (effect.poszRandDiff) {
			this.poszStart = getRandomIntInclusive(-effect.poszRandDiff, effect.poszRandDiff);
			this.poszEnd = getRandomIntInclusive(-effect.poszRandDiff, effect.poszRandDiff);
		}

		if (effect.poszStartRand) {
			var poszStartRandMiddle = effect.poszStartRandMiddle ? effect.poszStartRandMiddle : 0;
			this.poszStart = getRandomIntInclusive(poszStartRandMiddle - effect.poszStartRand, poszStartRandMiddle + effect.poszStartRand);
		}

		if (effect.poszEndRand) {
			var poszEndRandMiddle = effect.poszEndRandMiddle ? effect.poszEndRandMiddle : 0;
			this.poszEnd = getRandomIntInclusive(poszEndRandMiddle - effect.poszEndRand, poszEndRandMiddle + effect.poszEndRand);
		}

		this.poszSmooth = effect.poszSmooth ? true : false;

		// OffsetX
		if (effect.offsetxStart) this.offsetxStart = effect.offsetxStart;
		else this.offsetxStart = 0;

		if (effect.offsetxEnd) this.offsetxEnd = effect.offsetxEnd;
		else this.offsetxEnd = 0;

		if (effect.offsetx) {
			this.offsetxStart = effect.offsetx;
			this.offsetxEnd = effect.offsetx;
		}

		if (effect.offsetxRand) {
			this.offsetxStart = getRandomIntInclusive(-effect.offsetxRand, effect.offsetxRand);
			this.offsetxEnd = this.offsetxStart;
		}

		if (effect.offsetxRandDiff) {
			this.offsetxStart = getRandomIntInclusive(-effect.offsetxRandDiff, effect.offsetxRandDiff);
			this.offsetxEnd = getRandomIntInclusive(-effect.offsetxRandDiff, effect.offsetxRandDiff);
		}

		if (effect.offsetxStartRand) {
			var offsetxStartRandMiddle = effect.offsetxStartRandMiddle ? effect.offsetxStartRandMiddle : 0;
			this.offsetxStart = getRandomIntInclusive(offsetxStartRandMiddle - effect.offsetxStartRand, offsetxStartRandMiddle + effect.offsetxStartRand);
		}

		if (effect.offsetxEndRand) {
			var offsetxEndRandMiddle = effect.offsetxEndRandMiddle ? effect.offsetxEndRandMiddle : 0;
			this.offsetxEnd = getRandomIntInclusive(offsetxEndRandMiddle - effect.offsetxEndRand, offsetxEndRandMiddle + effect.offsetxEndRand);
		}

		this.offsetxSmooth = effect.offsetxSmooth ? true : false;

		//OffsetY
		if (effect.offsetyStart) this.offsetyStart = effect.offsetyStart;
		else this.offsetyStart = 0;

		if (effect.offsetyEnd) this.offsetyEnd = effect.offsetyEnd;
		else this.offsetyEnd = 0;

		if (effect.offsety) {
			this.offsetyStart = effect.offsety;
			this.offsetyEnd = effect.offsety;
		}

		if (effect.offsetyRand) {
			this.offsetyStart = getRandomIntInclusive(-effect.offsetyRand, effect.offsetyRand);
			this.offsetyEnd = this.offsetyStart;
		}

		if (effect.offsetyRandDiff) {
			this.offsetyStart = getRandomIntInclusive(-effect.offsetyRandDiff, effect.offsetyRandDiff);
			this.offsetyEnd = getRandomIntInclusive(-effect.offsetyRandDiff, effect.offsetyRandDiff);
		}

		if (effect.offsetyStartRand) {
			var offsetyStartRandMiddle = effect.offsetyStartRandMiddle ? effect.offsetyStartRandMiddle : 0;
			this.offsetyStart = getRandomIntInclusive(offsetyStartRandMiddle - effect.offsetyStartRand, offsetyStartRandMiddle + effect.offsetyStartRand);
		}

		if (effect.offsetyEndRand) {
			var offsetyEndRandMiddle = effect.offsetyEndRandMiddle ? effect.offsetyEndRandMiddle : 0;
			this.offsetyEnd = getRandomIntInclusive(offsetyEndRandMiddle - effect.offsetyEndRand, offsetyEndRandMiddle + effect.offsetyEndRand);
		}

		this.offsetySmooth = effect.offsetySmooth ? true : false;

		// Size
		if (effect.size) {
			this.sizeStartX = effect.size;
			this.sizeStartY = effect.size;
			this.sizeEndX = effect.size;
			this.sizeEndY = effect.size;
		}

		if (effect.sizeStart) {
			this.sizeStartX = effect.sizeStart;
			this.sizeStartY = effect.sizeStart;
		}

		if (effect.sizeEnd) {
			this.sizeEndX = effect.sizeEnd;
			this.sizeEndY = effect.sizeEnd;
		}

		if (effect.sizeX) {
			this.sizeStartX = effect.sizeX;
			this.sizeEndX = effect.sizeX;
		}

		if (effect.sizeY) {
			this.sizeStartY = effect.sizeY;
			this.sizeEndY = effect.sizeY;
		}

		if (effect.sizeStartX) this.sizeStartX = effect.sizeStartX;
		if (effect.sizeStartY) this.sizeStartY = effect.sizeStartY;
		if (effect.sizeEndX) this.sizeEndX = effect.sizeEndX;
		if (effect.sizeEndY) this.sizeEndY = effect.sizeEndY;

		if (effect.sizeRand) {
			this.sizeStartX = getRandomIntInclusive(-effect.sizeRand, effect.sizeRand) + 100;
			this.sizeStartY = this.sizeStartX;
			this.sizeEndX = this.sizeStartX;
			this.sizeEndY = this.sizeStartX;
		}

		if (effect.sizeRandX) {
			var sizeRandXMiddle = effect.sizeRandXMiddle ? effect.sizeRandXMiddle : 100;
			this.sizeStartX = getRandomIntInclusive(sizeRandXMiddle - effect.sizeRandX, sizeRandXMiddle + effect.sizeRandX);
			this.sizeEndX = this.sizeStartX;
		}

		if (effect.sizeRandY) {
			var sizeRandYMiddle = effect.sizeRandYMiddle ? effect.sizeRandYMiddle : 100;
			this.sizeStartY = getRandomIntInclusive(sizeRandYMiddle - effect.sizeRandY, sizeRandYMiddle + effect.sizeRandY);
			this.sizeEndY = this.sizeStartY;
		}

		this.sizeSmooth = effect.sizeSmooth ? true : false;

		// Angle
		this.angle = effect.angle ? effect.angle : 0;
		this.rotate = effect.rotate ? true : false;
		this.toAngle = effect.toAngle ? effect.toAngle : 0;
		if(effect.angleDelta){
			this.angle += effect.angleDelta * effect.duplicateID;
			this.toAngle += effect.angleDelta * effect.duplicateID;
		}

		if(effect.rotateToTarget){
			this.rotateToTarget = true;
			var x = this.posxEnd - this.posxStart;
			var y = this.posyEnd - this.posyStart;
			this.angle += (90 - (Math.atan2(y, x) * (180 / Math.PI)));
		}

		if(effect.angleRand){
			this.angle = getRandomIntInclusive(effect.angleRand[0], effect.angleRand[1]);
		}

		if(effect.circlePattern){
			const dist = getRandomIntInclusive(effect.circleOuterSizeRand[0], effect.circleOuterSizeRand[1]);
			this.posxEnd = Math.sin(this.angle * ((Math.PI * 2) / 360)) * dist;
			this.posyEnd = Math.cos(this.angle * ((Math.PI * 2) / 360)) * dist;
			this.posxStart = Math.sin(this.angle * ((Math.PI * 2) / 360)) * effect.circleInnerSize;
			this.posyStart = Math.cos(this.angle * ((Math.PI * 2) / 360)) * effect.circleInnerSize;
		}

		if(effect.sizeRandStartX){
			this.sizeStartX = getRandomIntInclusive(effect.sizeRandStartX[0], effect.sizeRandStartX[1]);
		}
		if(effect.sizeRandStartY){
			this.sizeStartY = getRandomIntInclusive(effect.sizeRandStartY[0], effect.sizeRandStartY[1]);
		}
		if(effect.sizeRandEndY){
			this.sizeEndY = getRandomIntInclusive(effect.sizeRandEndY[0], effect.sizeRandEndY[1]);
		}
		if(effect.sizeRandEndX){
			this.sizeEndX = getRandomIntInclusive(effect.sizeRandEndX[0], effect.sizeRandEndX[1]);
		}
		if(effect.durationRand){
			effect.duration = getRandomIntInclusive(effect.durationRand[0], effect.durationRand[1]);
		}


		// Other
		if (this.ownerEntity && this.shadowTexture) {
			this.ownerEntity.attachments.add({
				'completeFile': 'data/sprite/shadow',
				'uid': this.spriteName + '-' + this.sizeStartX + '-' + this.rotateLate,
				'head': true,
				'direction': true,
				'repeat': false,
				'stopAtEnd': true
			});
		}

		this.blendMode = effect.blendMode;

		this.startTick = startTick;
		this.endTick = endTick;
	}


	TwoDEffect.prototype.init = function init(gl) {
		var self = this;
		Client.loadFile('data/texture/' + this.textureName, function (buffer) {
			WebGL.texture(gl, buffer, function (texture) {
				self.texture = texture;
				self.ready = true;
			});
		});
	};


	TwoDEffect.prototype.free = function free( gl ){
		this.ready = false;
	};


	TwoDEffect.prototype.render = function render(gl, tick) {

		if( this.startTick > tick ) return; //not yet

		var start = tick - this.startTick;
		var duration = this.endTick - this.startTick;
		var steps = start / duration * 100;

		if (steps > 100) steps = 100;

		if (this.blendMode > 0 && this.blendMode < 16) {
			gl.blendFunc(gl.SRC_ALPHA, blendMode[this.blendMode]);
		} else {
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		}

		SpriteRenderer.image.texture = this.texture;
		SpriteRenderer.zIndex = this.zIndex;

		var cRad = Camera.angle[1] * Math.PI / 180;

		// Pos
		var currentX = 0;
		if (this.posxSmooth) {
			if (this.posxStart != this.posxEnd) {
				var step = steps * 0.09 + 1;
				var smoothStep = Math.log10(step);
				var distance = this.posxEnd - this.posxStart;
				var start = this.posxStart;
				var position = smoothStep * distance + start;
				currentX = position;
			} else currentX = this.posxStart;
		} else {
			if (this.posxStart != this.posxEnd) {
				var distance = (this.posxEnd - this.posxStart) / 100;
				var start = this.posxStart;
				var position = steps * distance + start;
				currentX = position;
			} else currentX = this.posxStart;
		}

		var currentY = 0;
		if (this.posySmooth) {
			if (this.posyStart != this.posyEnd) {
				var step = steps * 0.09 + 1;
				var smoothStep = Math.log10(step);
				var distance = this.posyEnd - this.posyStart;
				var start = this.posyStart;
				var position = smoothStep * distance + start;
				currentY = position;
			} else currentY = this.posyStart;
		} else {
			if (this.posyStart != this.posyEnd) {
				var distance = (this.posyEnd - this.posyStart) / 100;
				var start = this.posyStart;
				var position = steps * distance + start;
				currentY = position;
			} else currentY = this.posyStart;
		}

		//Rotate coordinates with camera for 2D effect
		SpriteRenderer.position[0] = this.position[0] + (currentX * Math.cos(cRad) - currentY * Math.sin(cRad));
		SpriteRenderer.position[1] = this.position[1] + (currentY * Math.cos(cRad) + currentX * Math.sin(cRad));


		var currentZ = 0;
		if (this.poszSmooth) {
			if (this.poszStart != this.poszEnd) {
				var step = steps * 0.09 + 1;
				var smoothStep = Math.log10(step);
				var distance = this.poszEnd - this.poszStart;
				var start = this.poszStart;
				var position = smoothStep * distance + start;
				currentZ = position;
			} else currentZ = this.poszStart;
		} else {
			if (this.poszStart != this.poszEnd) {
				var distance = (this.poszEnd - this.poszStart) / 100;
				var start = this.poszStart;
				var position = steps * distance + start;
				currentZ = position;
			} else currentZ = this.poszStart;
		}
		SpriteRenderer.position[2] = this.position[2] + currentZ;

		// Offset
		var currentOffsetX = 0;
		if (this.offsetxSmooth) {
			if (this.offsetxStart != this.offsetxEnd) {
				var step = steps * 0.09 + 1;
				var smoothStep = Math.log10(step);
				var distance = this.offsetxEnd - this.offsetxStart;
				var start = this.offsetxStart;
				var offset = smoothStep * distance + start;
				currentOffsetX = offset;
			} else currentOffsetX = this.offsetxStart;
		} else {
			if (this.offsetxStart != this.offsetxEnd) {
				var distance = (this.offsetxEnd - this.offsetxStart) / 100;
				var start = this.offsetxStart;
				var offset = steps * distance + start;
				currentOffsetX = offset;
			} else currentOffsetX = this.offsetxStart;
		}

		var currentOffsetY = 0;
		if (this.offsetySmooth) {
			if (this.offsetyStart != this.offsetyEnd) {
				var step = steps * 0.09 + 1;
				var smoothStep = Math.log10(step);
				var distance = this.offsetyEnd - this.offsetyStart;
				var start = this.offsetyStart;
				var offset = smoothStep * distance + start;
				currentOffsetY = offset;
			} else currentOffsetY = this.offsetyStart;
		} else {
			if (this.offsetyStart != this.offsetyEnd) {
				var distance = (this.offsetyEnd - this.offsetyStart) / 100;
				var start = this.offsetyStart;
				var offset = steps * distance + start;
				currentOffsetY = offset;
			} else currentOffsetY = this.offsetyStart;
		}

		SpriteRenderer.offset[0] = currentOffsetX;
		SpriteRenderer.offset[1] = currentOffsetY;

		// Color
		var alpha = this.alphaMax;

		if (this.fadeIn && start < duration / 4) {
			alpha = start * this.alphaMax / (duration / 4);
		} else if (this.fadeOut && start > duration / 2 + duration / 4) {
			alpha = (duration - start) * this.alphaMax / (duration / 4);
		}

		if (alpha < 0) alpha = 0;
		else if (alpha > 1) alpha = 1;

		SpriteRenderer.color[3] = alpha;
		SpriteRenderer.color[0] = this.red;
		SpriteRenderer.color[1] = this.green;
		SpriteRenderer.color[2] = this.blue;

		// Size
		var currentXSize, currentYSize;
		if (this.sizeSmooth) {

			if (this.sizeEndX != this.sizeStartX) {
				var step = steps * 0.09 + 1;
				var smoothStep = Math.log10(step);
				var delta = this.sizeEndX - this.sizeStartX;
				var start = this.sizeStartX;
				var size = smoothStep * delta + start;
				currentXSize = size;
			} else currentXSize = this.sizeStartX;

			if (this.sizeEndY != this.sizeStartY) {
				var step = steps * 0.09 + 1;
				var smoothStep = Math.log10(step);
				var delta = this.sizeEndY - this.sizeStartY;
				var start = this.sizeStartY;
				var size = smoothStep * delta + start;
				currentYSize = size;
			} else currentYSize = this.sizeStartY;

		} else {

			if (this.sizeEndX != this.sizeStartX) {
				var step = (this.sizeEndX - this.sizeStartX) / 100;
				var start = this.sizeStartX;
				var size = steps * step + start;
				currentXSize = size;
			} else currentXSize = this.sizeStartX;

			if (this.sizeEndY != this.sizeStartY) {
				var step = (this.sizeEndY - this.sizeStartY) / 100;
				var start = this.sizeStartY;
				var size = steps * step + start;
				currentYSize = size;
			} else currentYSize = this.sizeStartY;

		}

		SpriteRenderer.size[0] = currentXSize;
		SpriteRenderer.size[1] = currentYSize;

		// Angle
		if (this.rotate) {
			var step = (this.toAngle - this.angle) / 100;
			var startAngle = this.angle;
			var angle = steps * step + startAngle;
			SpriteRenderer.angle = angle;
		} else SpriteRenderer.angle = this.angle;

		SpriteRenderer.render();

		if (this.ownerEntity) {
			if (this.endTick < tick) this.ownerEntity.attachments.remove(this.spriteName + '-' + this.sizeStartX + '-' + this.rotateLate);
			else {
				var attachment = this.ownerEntity.attachments.get(this.spriteName + '-' + this.sizeStartX + '-' + this.rotateLate);
				if (attachment) attachment.position = new Int16Array([SpriteRenderer.position[0], SpriteRenderer.position[1]]);
			}
		}
		this.needCleanUp = this.endTick < tick;
	};

	TwoDEffect.init = function init(gl) {
		blendMode[1] = gl.ZERO;
		blendMode[2] = gl.ONE;
		blendMode[3] = gl.SRC_COLOR;
		blendMode[4] = gl.ONE_MINUS_SRC_COLOR;
		blendMode[5] = gl.DST_COLOR;
		blendMode[6] = gl.ONE_MINUS_DST_COLOR;
		blendMode[7] = gl.SRC_ALPHA;
		blendMode[8] = gl.ONE_MINUS_SRC_ALPHA;
		blendMode[9] = gl.DST_ALPHA;
		blendMode[10] = gl.ONE_MINUS_DST_ALPHA;
		blendMode[11] = gl.CONSTANT_COLOR;
		blendMode[12] = gl.ONE_MINUS_CONSTANT_COLOR;
		blendMode[13] = gl.CONSTANT_ALPHA;
		blendMode[14] = gl.ONE_MINUS_CONSTANT_ALPHA;
		blendMode[15] = gl.SRC_ALPHA_SATURATE;

		this.ready = true;
		this.renderBeforeEntities = false;
	};

	TwoDEffect.free = function free(gl) {
		this.ready = false;
	};

	TwoDEffect.beforeRender = function beforeRender(gl, modelView, projection, fog, tick) {
		SpriteRenderer.bind3DContext(gl, modelView, projection, fog);
		SpriteRenderer.shadow = 1;
		SpriteRenderer.angle = 0;
		SpriteRenderer.size[0] = 100;
		SpriteRenderer.size[1] = 100;
		SpriteRenderer.offset[0] = 0;
		SpriteRenderer.offset[1] = 0;
		SpriteRenderer.image.palette = null;
		SpriteRenderer.color[0] = 1;
		SpriteRenderer.color[1] = 1;
		SpriteRenderer.color[2] = 1;
		SpriteRenderer.color[3] = 1;
		SpriteRenderer.depth = 10;
		SpriteRenderer.zIndex = 0;
		SpriteRenderer.objecttype = Entity.TYPE_EFFECT;
	};

	TwoDEffect.afterRender = function afterRender(gl) {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		SpriteRenderer.unbind(gl);
	};

	return TwoDEffect;
});
