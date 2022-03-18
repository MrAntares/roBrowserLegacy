define(['Utils/WebGL', 'Utils/Texture', 'Utils/gl-matrix', 'Core/Client', 'Renderer/SpriteRenderer', 'Renderer/EntityManager'],
function (WebGL, Texture, glMatrix, Client, SpriteRenderer, EntityManager) {
	
    'use strict';

    function TwoDEffect(position, effect, startLifeTime, endLifeTime, AID) {
        this.AID = AID;
        this.textureName = effect.file;
        this.zIndex = effect.zIndex ? effect.zIndex : 0;
        this.fadeOut = effect.fadeOut ? false : true;
        this.fadeIn = effect.fadeIn ? false : true;
        this.alphaMax = effect.alphaMax;
		
        if (this.alphaMax < 0) this.alphaMax = 0;
        else if (this.alphaMax > 1 || isNaN(this.alphaMax)) this.alphaMax = 1;
		
        if (effect.red) this.red = effect.red;
        else this.red = 1;
		
        if (effect.green) this.green = effect.green;
        else this.green = 1;
		
        if (effect.blue) this.blue = effect.blue;
        else this.blue = 1;
		
        this.position = position;
		
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
		
        this.posxSmooth = effect.posxSmooth ? false : true;
		
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
		
        this.posySmooth = effect.posySmooth ? false : true;
		
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
		
        this.poszSmooth = effect.poszSmooth ? false : true;
		
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
		
        this.sizeSmooth = effect.sizeSmooth ? false : true;
        this.angle = effect.angle ? effect.angle : 0;
        this.rotate = effect.rotate ? false : true;
        this.toAngle = effect.toAngle ? effect.toAngle : 0;
		
        var entity = EntityManager.get(this.AID);
        if (entity) {
            entity.attachments.add({
                'completeFile': 'data/sprite/shadow',
                'id': this.spriteName + '-' + this.sizeStartX + '-' + this.rotateLate,
                'head': true,
                'direction': true,
                'repeat': false,
                'stopAtEnd': true
            });
        }
		
        this.startLifeTime = startLifeTime;
        this.endLifeTime = endLifeTime;
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
        var start = tick - this.startLifeTime;
        var duration = this.endLifeTime - this.startLifeTime;
        var steps = start / duration * 100;
		
        if (steps > 100) steps = 100;
		
        SpriteRenderer.image.texture = this.texture;
        SpriteRenderer.zIndex = this.zIndex;
		
        var cuj = 0;
        if (this.posxSmooth) {
            if (this.posxStart != this.posxEnd) {
                var cuk = steps * 0.09 + 1;
                var cul = Math.log10(cuk);
                var cum = this.posxEnd - this.posxStart;
                var cun = this.posxStart;
                var cuo = cul * cum + cun;
                cuj = cuo;
            } else cuj = this.posxStart;
        } else {
            if (this.posxStart != this.posxEnd) {
                var cum = (this.posxEnd - this.posxStart) / 100;
                var cun = this.posxStart;
                var cuo = steps * cum + cun;
                cuj = cuo;
            } else cuj = this.posxStart;
        }
        SpriteRenderer.position[0] = this.position[0] + cuj;
		
        cuj = 0;
        if (this.posySmooth) {
            if (this.posyStart != this.posyEnd) {
                var cuk = steps * 0.09 + 1;
                var cul = Math.log10(cuk);
                var cum = this.posyEnd - this.posyStart;
                var cun = this.posyStart;
                var cuo = cul * cum + cun;
                cuj = cuo;
            } else cuj = this.posyStart;
        } else {
            if (this.posyStart != this.posyEnd) {
                var cum = (this.posyEnd - this.posyStart) / 100;
                var cun = this.posyStart;
                var cuo = steps * cum + cun;
                cuj = cuo;
            } else cuj = this.posyStart;
        }
        SpriteRenderer.position[1] = this.position[1] + cuj;
		
        cuj = 0;
        if (this.poszSmooth) {
            if (this.poszStart != this.poszEnd) {
                var cuk = steps * 0.09 + 1;
                var cul = Math.log10(cuk);
                var cum = this.poszEnd - this.poszStart;
                var cun = this.poszStart;
                var cuo = cul * cum + cun;
                cuj = cuo;
            } else cuj = this.poszStart;
        } else {
            if (this.poszStart != this.poszEnd) {
                var cum = (this.poszEnd - this.poszStart) / 100;
                var cun = this.poszStart;
                var cuo = steps * cum + cun;
                cuj = cuo;
            } else cuj = this.poszStart;
        }
        SpriteRenderer.position[2] = this.position[2] + cuj;
		
        var alpha = this.alphaMax;
		
        if (this.fadeIn && start < duration / 4) alpha = start * this.alphaMax / (duration / 4);
        else if (this.fadeOut && start > duration / 2 + duration / 4) alpha = (duration - start) * this.alphaMax / (duration / 4);
		
        if (alpha < 0) alpha = 0;
        else if (alpha > 1) alpha = 1;
		
        SpriteRenderer.color[3] = alpha;
        SpriteRenderer.color[0] = this.red;
        SpriteRenderer.color[1] = this.green;
        SpriteRenderer.color[2] = this.blue;
		
        var cuK, cuL;
        if (this.sizeSmooth) {
			
            if (this.sizeEndX != this.sizeStartX) {
                var cuk = steps * 0.09 + 1;
                var cul = Math.log10(cuk);
                var cum = this.sizeEndX - this.sizeStartX;
                var cun = this.sizeStartX;
                var cuo = cul * cum + cun;
                cuK = cuo;
            } else cuK = this.sizeStartX;
			
            if (this.sizeEndY != this.sizeStartY) {
                var cuR = steps * 0.09 + 1;
                var cuS = Math.log10(cuR);
                var cuT = this.sizeEndY - this.sizeStartY;
                var cuU = this.sizeStartY;
                var cuV = cuS * cuT + cuU;
                cuL = cuV;
            } else cuL = this.sizeStartY;
			
        } else {
			
            if (this.sizeEndX != this.sizeStartX) {
                var cum = (this.sizeEndX - this.sizeStartX) / 100;
                var cun = this.sizeStartX;
                var cuo = steps * cum + cun;
                cuK = cuo;
            } else cuK = this.sizeStartX;
			
            if (this.sizeEndY != this.sizeStartY) {
                var cuT = (this.sizeEndY - this.sizeStartY) / 100;
                var cuU = this.sizeStartY;
                var cuV = steps * cuT + cuU;
                cuL = cuV;
            } else cuL = this.sizeStartY;
			
        }
		
        SpriteRenderer.size[0] = cuK;
        SpriteRenderer.size[1] = cuL;
		
        if (this.rotate) {
            var cv2 = (this.toAngle - this.angle) / 100;
            var angle = this.angle;
            var cv4 = steps * cv2 + angle;
            SpriteRenderer.angle = cv4;
        } else SpriteRenderer.angle = this.angle;
		
        SpriteRenderer.render();
		
        var entity = EntityManager.get(this.AID);
		
        if (entity) {
            if (this.endLifeTime < tick) entity.attachments.removeId(this.spriteName + '-' + this.sizeStartX + '-' + this.rotateLate);
            else {
                var attachment = entity.attachments.get(this.spriteName + '-' + this.sizeStartX + '-' + this.rotateLate);
                if (attachment) attachment.position = new Int16Array([SpriteRenderer.position[0], SpriteRenderer.position[1]]);
            }
        }
        this.needCleanUp = this.endLifeTime < tick;
    };
	
    TwoDEffect.init = function init(gl) {
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
    };
	
    TwoDEffect.afterRender = function afterRender(gl) {
        SpriteRenderer.unbind(gl);
    };
	
    return TwoDEffect;
});
