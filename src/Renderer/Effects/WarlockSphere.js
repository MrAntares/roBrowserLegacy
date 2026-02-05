define(function( require ) {

    'use strict';


    // Load dependencies
    var WebGL    = require('Utils/WebGL');
    var Texture  = require('Utils/Texture');
    var glMatrix = require('Utils/gl-matrix');
    var Client   = require('Core/Client');
    var Camera   = require('Renderer/Camera');
    var SpriteRenderer = require('Renderer/SpriteRenderer');
    var Configs  = require('../../Core/Configs');


    /**
     * @var {WebGLTexture}
     */
    var _texture;


    /**
     * @var {WebGLProgram}
     */
    var _program;


    /**
     * @var {WebGLBuffer}
     */
    var _buffer;


    /**
     * @var {mat4}
     */
    var mat4 = glMatrix.mat4;


    var _rotationMatrices = (function(){
        var matrices = [];
        for (var i = 0; i < 5; i++){
            matrices.push( {
                posMat: mat4.create(),
                texMat: mat4.create()
            } );
        }
        return matrices;
    }());
    
    var _textureMatrix = mat4.create();
    
    /**
     * @var {string} Vertex Shader
     */
    var _vertexShader   = `
        #version 300 es
        #pragma vscode_glsllint_stage : vert
        precision highp float;

        in vec2 aPosition;
        in vec2 aTextureCoord;

        out vec2 vTextureCoord;

        uniform mat4 uModelViewMat;
        uniform mat4 uProjectionMat;
        uniform mat4 uTextureRotMat;
        uniform mat4 uRotationMat;

        uniform float uCameraZoom;

        uniform vec3 uPosition;
        uniform float uSize;
        uniform float uZIndex;

        void main(void) {

            vec4 position  = vec4(uPosition.x + 0.5, -uPosition.z - 2.0, uPosition.y + 0.5, 1.0);
            
            vec4 pos2      = vec4(aPosition.x * uSize, 0.0, aPosition.y * uSize, 0.0) * uTextureRotMat;
            pos2.x        += 1.0;
            position      += pos2 * uRotationMat;

            gl_Position    = uProjectionMat * uModelViewMat * position;
            gl_Position.z -= uZIndex / max(uCameraZoom, 1.0);

            vTextureCoord  = aTextureCoord;
        }`;


    /**
     * @var {string} Fragment Shader
     */
    var _fragmentShader = `
        #version 300 es
        #pragma vscode_glsllint_stage : frag
        precision highp float;

        in vec2 vTextureCoord;

        uniform vec4 uColor;
        uniform sampler2D uDiffuse;
        float tmp;
        out vec4 fragColor;

        void main(void) {
            vec4 textureSample = texture( uDiffuse,  vTextureCoord.st );
            
            textureSample *= uColor;
            
            /*if (texture.r < 0.1 && texture.g < 0.1 && texture.b < 0.1) {
               discard;
            }*/
            
            fragColor = textureSample;

        }`;

	var WLS = {
		FIRE: 68, // WLS_FIRE
		WIND: 69, // WLS_WIND
		WATER: 70, // WLS_WATER
		STONE: 71 // WLS_STONE
	};
	
	var SphereFiles = [];
	SphereFiles[WLS.FIRE] = 'fireorb.bmp';
	SphereFiles[WLS.WIND] = 'lightningorb.bmp';
	SphereFiles[WLS.WATER] = 'waterorb.bmp';
	SphereFiles[WLS.STONE] = 'stoneorb.bmp';

    function WarlockSphere(entity, spheres)
    {
        this.position = entity.position;
        this.spheres = spheres ? spheres : [];
        
        this.initialAlpha = 0;
    }


    WarlockSphere.prototype.init = function init( gl )
    {
        this.ready  = true;
    };

    WarlockSphere.prototype.free = function free( gl )
    {
        this.ready = false;
    };

    WarlockSphere.renderBeforeEntities = false;

    WarlockSphere.init = function init(gl)
    {
        _program = WebGL.createShaderProgram( gl, _vertexShader, _fragmentShader );
        _buffer  = gl.createBuffer();

        gl.bindBuffer( gl.ARRAY_BUFFER, _buffer );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array([
            -1.0, -1.0, 0.0, 0.0,
            +1.0, -1.0, 1.0, 0.0,
            +1.0, +1.0, 1.0, 1.0,
            +1.0, +1.0, 1.0, 1.0,
            -1.0, +1.0, 0.0, 1.0,
            -1.0, -1.0, 0.0, 0.0
        ]), gl.STATIC_DRAW );

        Client.loadFile('data/texture/effect/thunder_center.bmp', function(buffer) {
            Texture.load(buffer, function() {
                var enableMipmap = Configs.get('enableMipmap');
                var ctx = this.getContext('2d');
                ctx.save();
                ctx.translate(  this.width/2,  this.height/2 );
                // ctx.rotate( 45 / 180 * Math.PI);
                ctx.translate( -this.width/2, -this.height/2 );
                ctx.drawImage( this, 0, 0);
                ctx.restore();

                _texture = gl.createTexture();
                gl.bindTexture( gl.TEXTURE_2D, _texture );
                gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
                gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                if(enableMipmap) {
                    gl.generateMipmap( gl.TEXTURE_2D );
                }

                WarlockSphere.ready = true;
            });
        });
    };

    WarlockSphere.free = function free(gl)
    {
        if (_texture) {
            gl.deleteTexture(_texture);
            _texture = null;
        }

        if (_program) {
            gl.deleteProgram(_program);
            _program = null;
        }

        if (_buffer) {
            gl.deleteBuffer(_buffer);
        }

        this.ready = false;
    };


    WarlockSphere.beforeRender = function beforeRender(gl, modelView, projection, fog, tick)
    {
        var uniform   = _program.uniform;
        var attribute = _program.attribute;
        gl.useProgram( _program );
        
        var _matrix, offset;
        for (var i = 0, _len = _rotationMatrices.length; i < _len; i++){
            var vcRad = (Camera.angle[0]-90) * Math.PI / 180;
            var hcRad = Camera.angle[1] * Math.PI / 180;
            offset = (i * 2 * Math.PI / _rotationMatrices.length);
            var rotRad = offset - (tick/64) / 180 * Math.PI;
            
            //_matrix = _rotationMatrices[i].texMat;
            //mat4.identity(_matrix);
            var textureMatrix = mat4.create();
            mat4.rotateX(_rotationMatrices[i].texMat, textureMatrix, vcRad);
            mat4.rotateY(_rotationMatrices[i].texMat, _rotationMatrices[i].texMat, hcRad-rotRad);
            
            
            _matrix = _rotationMatrices[i].posMat;
            mat4.identity(_matrix);
            mat4.rotateY(_matrix, _matrix, rotRad);
            
        }
        
        // Bind matrix
        gl.uniformMatrix4fv( uniform.uModelViewMat,  false, modelView );
        gl.uniformMatrix4fv( uniform.uProjectionMat, false, projection );

        // Texture
        gl.activeTexture( gl.TEXTURE0 );
        gl.bindTexture( gl.TEXTURE_2D, _texture );
        gl.uniform1i( uniform.uDiffuse, 0 );

        // Enable all attributes
        gl.enableVertexAttribArray( attribute.aPosition );
        gl.enableVertexAttribArray( attribute.aTextureCoord );

        gl.bindBuffer( gl.ARRAY_BUFFER, _buffer );

        gl.vertexAttribPointer( attribute.aPosition,     2, gl.FLOAT, false, 4*4,  0   );
        gl.vertexAttribPointer( attribute.aTextureCoord, 2, gl.FLOAT, false, 4*4,  2*4 );
    };

    WarlockSphere.prototype.render = function render( gl, tick )
    {
        var uniform = _program.uniform;
        
        gl.uniform3fv( uniform.uPosition,  this.position);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, _buffer );
        
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        
        gl.uniform1f( uniform.uCameraZoom, Camera.zoom );
        
        var _matrix;
	var self = this;
	SpriteRenderer.runWithDepth(false, true, false, function () {
            for (var i = self.spheres.length; i > 0; i--){
            
                _matrix = _rotationMatrices[i % _rotationMatrices.length];
            
                gl.uniformMatrix4fv( uniform.uTextureRotMat, false, _matrix.texMat);
                gl.uniformMatrix4fv( uniform.uRotationMat, false, _matrix.posMat);
            
                if (i>10) {
                
                    if(self.isCoin){
                        gl.uniform1f( uniform.uSize, 0.3);
                        gl.uniform4fv( uniform.uColor,  [1.0, 0.9, 0.4, 0.2 * self.initialAlpha] );
                    } else {
                        gl.uniform1f( uniform.uSize, 0.55);
                        gl.uniform4fv( uniform.uColor,  [0.0, 0.0, 1.0, 0.2 * self.initialAlpha] );
                    }
                
                    gl.uniform1f( uniform.uZIndex, 0.0);
                    gl.drawArrays( gl.TRIANGLES, 0, 6 );
                
                } else if (i>5) {
                
                    if(self.isCoin){
                        gl.uniform1f( uniform.uSize, 0.2);
                        gl.uniform4fv(  uniform.uColor,  [1.0, 0.9, 0.4, 0.4 * self.initialAlpha] );
                    } else {
                        gl.uniform1f( uniform.uSize, 0.35);
                        gl.uniform4fv(  uniform.uColor,  [0.0, 0.0, 1.0, 0.6 * self.initialAlpha] );
                    }
                
                    gl.uniform1f( uniform.uZIndex, 0.01);
                    gl.drawArrays( gl.TRIANGLES, 0, 6 );
                
                } else {
                
                    if(self.isCoin){
                        gl.uniform1f( uniform.uSize, 0.1);
                        gl.uniform4fv(  uniform.uColor,  [1.0, 0.9, 0.4, 0.6 * self.initialAlpha] );
                    } else {
                        gl.uniform1f( uniform.uSize, 0.25);
                        gl.uniform4fv(  uniform.uColor,  [0.0, 0.0, 1.0, 1.0 * self.initialAlpha] );
                    }
                    gl.uniform1f( uniform.uZIndex, 0.02);
                    gl.drawArrays( gl.TRIANGLES, 0, 6 );
                
                
                    if(self.isCoin){
                        gl.uniform1f( uniform.uSize, 0.05);
                        gl.uniform4fv(  uniform.uColor,  [1.0, 1.0, 0.7, 1.0 * self.initialAlpha] );
                    } else {
                        gl.uniform1f( uniform.uSize, 0.15);
                        gl.uniform4fv(  uniform.uColor,  [0.8, 0.8, 1.0, 1.0 * self.initialAlpha] );
                    }
                    gl.uniform1f( uniform.uZIndex, 0.03);
                    gl.drawArrays( gl.TRIANGLES, 0, 6 );
                    
                }
            }
        });

        if(this.initialAlpha < 1){
            this.initialAlpha = Math.min(this.initialAlpha + 0.005, 1);
        }

    };

    WarlockSphere.afterRender = function afterRender(gl)
    {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.disableVertexAttribArray( _program.attribute.aPosition );
        gl.disableVertexAttribArray( _program.attribute.aTextureCoord );
    };


    /**
     * Export
     */
    return WarlockSphere;
});
