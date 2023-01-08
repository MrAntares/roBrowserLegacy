/**
 * Renderer/Effects/QuadHorn.js
 *
 * Generate Ice Wall effect like.
 *
 * @author MrUnzO
 */
define(['Utils/WebGL', 'Utils/gl-matrix', 'Core/Client', 'Utils/Texture'], 
function (WebGL,        glMatrix,         Client,           Texture) {

    'use strict';

    function randBetween(minimum, maximum) {
        return parseFloat(Math.min(minimum + Math.random() * (maximum - minimum), maximum).toFixed(3));
    }
	
    var _texture;
    var _program;
    var mat4 = glMatrix.mat4;
    
    var blendMode = {};
	
    var _vertexShader = `
        #version 100
        #pragma vscode_glsllint_stage : vert
        precision highp float;

		attribute vec3 aPosition;
		attribute vec2 aTextureCoord;
		varying vec2 vTextureCoord;

        uniform vec3 uPosition;
		uniform float uHeight;
		uniform float uBottomSize;
		uniform float uOffsetX;
		uniform float uOffsetY;
		uniform float uOffsetZ;

		uniform mat4 uModelViewMat;
		uniform mat4 uProjectionMat;
		uniform mat4 uYRotationMat;
		uniform mat4 uZRotationMat;
		void main(void) {
			vec4 position       = vec4(uPosition.x + uOffsetX, -uPosition.z - ((uHeight * 0.9) + uOffsetZ), uPosition.y + uOffsetY, 1.0);
			position            += vec4(aPosition.x * uBottomSize, aPosition.y * uHeight, aPosition.z * uBottomSize, 0.0) * uYRotationMat * uZRotationMat;
            gl_Position         = uProjectionMat * uModelViewMat * position;

            vTextureCoord = aTextureCoord;
		}
	`;
	
    var _fragmentShader = `
        #version 100
        #pragma vscode_glsllint_stage : frag
        precision highp float;

		varying vec2 vTextureCoord;
        uniform vec4 uColor;
		uniform sampler2D uDiffuse;
		uniform bool  uFogUse;
		uniform float uFogNear;
		uniform float uFogFar;
		uniform vec3  uFogColor;
		
		void main(void) {
			
			vec4 texture = texture2D( uDiffuse,  vTextureCoord.st );
			
			if (texture.a == 0.0 ) { discard; }
            if (texture.r < 0.01 && texture.g < 0.01 && texture.b < 0.01) {
                discard;
             }
			
			gl_FragColor = texture * uColor;

			if (uFogUse) {
				float depth     = gl_FragCoord.z / gl_FragCoord.w;
				float fogFactor = smoothstep( uFogNear, uFogFar, depth );
				gl_FragColor    = mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );
			}
		}
	`;

    //vertices
    const vertices = [
        0.0,  1.0,  0.0,
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,

        0.0,  1.0,  0.0,
        1.0, -1.0,  1.0,
        1.0, -1.0, -1.0,

        0.0,  1.0,  0.0,
        1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,

        0.0,  1.0,  0.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
    ];

    var texCoords = [
        0,      0,
        1,      0,
        0.5,    1,

        0,      0,
        1,      0,
        0.5,    1,

        0,      0,
        1,      0,
        0.5,    1,

        0,      0,
        1,      0,
        0.5,    1,
      ];

    function QuadHorn(effect, EF_Inst_Par, EF_Init_Par) {
        var startTick = EF_Inst_Par.startTick;
		var endTick = EF_Inst_Par.endTick;

        this._zRotationMatrix = mat4.create();
        this._yRotationMatrix = mat4.create();

        this.position   = EF_Inst_Par.position;
        this.blendMode  = effect.blendMode || 1;
        this.height     = ((effect.height && effect.height instanceof Array) ? randBetween(effect.height[0], effect.height[1]) : effect.height) || 0.0;
        this.rotateY    = ((effect.rotateY && effect.rotateY instanceof Array) ? randBetween(effect.rotateY[0], effect.rotateY[1]) : effect.rotateY) || 0.0;
        this.rotateZ    = ((effect.rotateZ && effect.rotateZ instanceof Array) ? randBetween(effect.rotateZ[0], effect.rotateZ[1]) : effect.rotateZ) || 0.0;
        this.offsetX    = ((effect.offsetX && effect.offsetX instanceof Array) ? randBetween(effect.offsetX[0], effect.offsetX[1]) : effect.offsetX) || 0.5;
        this.offsetY    = ((effect.offsetY && effect.offsetY instanceof Array) ? randBetween(effect.offsetY[0], effect.offsetY[1]) : effect.offsetY) || 0.5;
        this.offsetZ    = ((effect.offsetZ && effect.offsetZ instanceof Array) ? randBetween(effect.offsetZ[0], effect.offsetZ[1]) : effect.offsetZ) || 0.5;
        this.bottomSize = ((effect.bottomSize && effect.bottomSize instanceof Array) ? randBetween(effect.bottomSize[0], effect.bottomSize[1]) : effect.bottomSize) || 0.0;
        this.color      = effect.color || [1.0, 1.0, 1.0, 1.0];
        this.animation  = effect.animation || 0;
        this.animationSpeed  = effect.animationSpeed || 100;
        this.animationOut  = effect.animationOut || false;
        this.textureFile = effect.textureFile;
        this.startTick  = startTick;
		this.endTick    = endTick;

        console.log(this);
    }
	
    QuadHorn.prototype.init = function init(gl) {

        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW); 
        
        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

        var self = this;
        Client.loadFile('data/texture/' + this.textureFile, function (buffer) {
            WebGL.texture(gl, buffer, function (texture) {
                self.texture = texture;
                self.ready = true;
            });
        });
        
    };
	
    QuadHorn.prototype.free = function free(gl) {
        gl.deleteBuffer(this.buffer);
        this.ready = false;
    };
	
    QuadHorn.prototype.render = function render(gl, tick) {
        var uniform = _program.uniform;
        var attribute = _program.attribute;
        var deltaTick = tick - this.startTick;
        var end = this.endTick - this.startTick;
        
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);

        gl.enableVertexAttribArray(attribute.aPosition);
        gl.enableVertexAttribArray(attribute.aTextureCoord);
        gl.enableVertexAttribArray(attribute.aColor);

        if (this.blendMode > 0 && this.blendMode < 16) {
			gl.blendFunc(gl.SRC_ALPHA, blendMode[this.blendMode]);
		} else {
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		}

        if(this.animation === 1){
            //Grow up
            const lerpHeight = deltaTick / this.animationSpeed * this.height;
            if(lerpHeight > this.height){
                gl.uniform1f(   uniform.uHeight,       this.height);
            }else{
                gl.uniform1f(   uniform.uHeight,       lerpHeight);
            }
            gl.uniform1f(   uniform.uOffsetZ, this.offsetZ);
        }else if(this.animation === 2){
            //Move up - not finish
            const lerpZOffset = -((deltaTick / this.animationSpeed)) * (this.offsetZ - this.height);
            console.log("lerpZOffset", lerpZOffset);
            console.log("deltaTick", deltaTick);
            if(lerpZOffset > this.offsetZ){
                gl.uniform1f(   uniform.uOffsetZ, this.offsetZ);
            }else{
                gl.uniform1f(   uniform.uOffsetZ, lerpZOffset);
            }
            gl.uniform1f(   uniform.uHeight,       this.height);
        }else{
            gl.uniform1f(   uniform.uHeight,       this.height);
        }

        if(this.animationOut && deltaTick > end){
            //Animation out
            this.needCleanUp = this.endTick < tick;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 0, 0);

        gl.uniform3fv(  uniform.uPosition,    this.position);
		
		gl.uniform1f(   uniform.uBottomSize, this.bottomSize);
		gl.uniform1f(   uniform.uOffsetX, this.offsetX);
		gl.uniform1f(   uniform.uOffsetY, this.offsetY);
		
		gl.uniform4fv(  uniform.uColor, this.color);

        mat4.identity(this._yRotationMatrix);
        mat4.rotate(this._yRotationMatrix, this._yRotationMatrix, (this.rotateY * Math.PI / 180), [0, 1, 0]);
        gl.uniformMatrix4fv(uniform.uYRotationMat, false, this._yRotationMatrix);

        mat4.identity(this._zRotationMatrix);
        mat4.rotate(this._zRotationMatrix, this._zRotationMatrix, ((180 + this.rotateZ) * Math.PI / 180), [0, 0, 1]);
        gl.uniformMatrix4fv(uniform.uZRotationMat, false, this._zRotationMatrix);

        gl.drawArrays(gl.TRIANGLES, 0, 12);

    };
	
    QuadHorn.init = function init(gl) {
        _program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);

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

        QuadHorn.ready = true;
    };
	
	QuadHorn.renderBeforeEntities = false;
	
    QuadHorn.free = function free(gl) {
		
        if (_program) {
			gl.deleteProgram(_program);
			_program = null;
		}
		if (this.buffer) {
			gl.deleteBuffer(this.buffer);
		}

		this.ready = false;
    };
	
    QuadHorn.beforeRender = function beforeRender(gl, modelView, projection, fog, tick) {
        var uniform = _program.uniform;

        gl.useProgram(_program);
        
        gl.uniformMatrix4fv(uniform.uModelViewMat, false, modelView);
        gl.uniformMatrix4fv(uniform.uProjectionMat, false, projection);
        
        gl.uniform1i(uniform.uFogUse, fog.use && fog.exist);
        gl.uniform1f(uniform.uFogNear, fog.near);
        gl.uniform1f(uniform.uFogFar, fog.far);
        gl.uniform3fv(uniform.uFogColor, fog.color);

        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(uniform.uDiffuse, 0);
    };
	
    QuadHorn.afterRender = function afterRender(gl) {
        gl.disableVertexAttribArray(_program.attribute.aPosition);
        gl.disableVertexAttribArray(_program.attribute.aTextureCoord);
        gl.disableVertexAttribArray(_program.attribute.aColor);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    };
	
    return QuadHorn;
});
