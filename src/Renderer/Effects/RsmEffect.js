/**
 * @module Renderer/Effects/RsmEffect
 *
 * Rendering Rsm,Rsm2 File object
 */
define(['Utils/WebGL', 'Utils/gl-matrix', 'Core/Client', 'Loaders/Model'], function (WebGL, glMatrix, Client, Model) {
    "use strict";

    var _objects   = [];
    var _program   = null;
    var _buffer    = null;
    var _params    = null;
    var _model    = null;
    var _normalMat = new Float32Array(3 * 3);
    var mat4       = glMatrix.mat4;
    var mat3       = glMatrix.mat3;

    /**
     * @var {string} vertex shader
     */
    var _vertexShader = `
		#version 100
		#pragma vscode_glsllint_stage : vert
		precision highp float;

		attribute vec3 aPosition;
		attribute vec3 aVertexNormal;
		attribute vec2 aTextureCoord;
		attribute float aAlpha;

		varying vec2 vTextureCoord;
		varying float vLightWeighting;
		varying float vAlpha;

		uniform mat4 uModelViewMat;
		uniform mat4 uProjectionMat;

		uniform vec3 uLightDirection;
		uniform mat3 uNormalMat;

		void main(void) {
			gl_Position     = uProjectionMat * uModelViewMat * vec4( aPosition, 1.0);

			vTextureCoord   = aTextureCoord;
			vAlpha          = aAlpha;

			vec4 lDirection  = uModelViewMat * vec4( uLightDirection, 0.0);
			vec3 dirVector   = normalize(lDirection.xyz);
			float dotProduct = dot( uNormalMat * aVertexNormal, dirVector );
			vLightWeighting  = max( dotProduct, 0.5 );
		}
	`;


    /**
     * @var {string} fragment shader
     */
    var _fragmentShader = `
		#version 100
		#pragma vscode_glsllint_stage : frag
		precision highp float;

		varying vec2 vTextureCoord;
		varying float vLightWeighting;
		varying float vAlpha;

		uniform sampler2D uDiffuse;

		uniform bool  uFogUse;
		uniform float uFogNear;
		uniform float uFogFar;
		uniform vec3  uFogColor;

		uniform vec3  uLightAmbient;
		uniform vec3  uLightDiffuse;
		uniform float uLightOpacity;

		void main(void) {
			vec4 texture  = texture2D( uDiffuse,  vTextureCoord.st );

			if (texture.a == 0.0) {
				discard;
			}

			vec3 Ambient    = uLightAmbient * uLightOpacity;
			vec3 Diffuse    = uLightDiffuse * vLightWeighting;
			vec4 LightColor = vec4( Ambient + Diffuse, 1.0);

			gl_FragColor    = texture * clamp(LightColor, 0.0, 1.0);
			gl_FragColor.a *= vAlpha;

			if (uFogUse) {
				float depth     = gl_FragCoord.z / gl_FragCoord.w;
				float fogFactor = smoothstep( uFogNear, uFogFar, depth );
				gl_FragColor    = mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );
			}
		}
	`;

    var _light = {
        opacity:   1.0,
        ambient:   new Float32Array([1, 1, 1]),
        diffuse:   new Float32Array([0, 0, 0]),
        direction: new Float32Array([0, 1, 0]),
    };

    var _GlobalParameters = {
        position: new Float32Array(3),
        rotation: new Float32Array(3),
        scale:    new Float32Array([-0.075, -0.075, 0.075]),
        filename: null
    };


    function RsmEffect(params) {
        _params            = params;
        RsmEffect.filename = 'data\\model\\' + _params.effect.file + '.rsm';
    }

    function initModel(gl, data) {
        var count       = data.infos.length;
        _objects.length = count;

        // Bind buffer
        if (!_buffer) {
            _buffer = gl.createBuffer();
        }

        if (!_program) {
            _program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data.buffer, gl.STATIC_DRAW);

        function onTextureLoaded(texture, i) {
            _objects[i].texture  = texture;
            _objects[i].complete = true;
        }

        // Fetch all images, and draw them in a mega-texture
        for (var i = 0; i < count; ++i) {
            if (!_objects[i]) {
                _objects[i] = {};
            }

            _objects[i].vertCount  = data.infos[i].vertCount;
            _objects[i].vertOffset = data.infos[i].vertOffset;
            _objects[i].complete   = false;

            WebGL.texture(gl, data.infos[i].texture, onTextureLoaded, i);
        }
    }

    RsmEffect.init = function init(gl) {
        var self     = this;
        var filename = RsmEffect.filename;
        Client.getFile(filename, function (buf) {
            _model = new Model(buf);

            var data;
            var i, count, j, size, total, offset, length, pos;
            var objects = [], infos = [], meshes, index, object;
            var buffer;

            // Create model in world
            _GlobalParameters.filename = filename.replace('data/model/', '') + Math.floor(Math.random() * 15);
            _model.createInstance(_GlobalParameters, 0, 0);

            // Compile model
            data  = _model.compile();
            count = data.meshes.length;
            total = 0;

            // Extract meshes
            for (i = 0, count = data.meshes.length; i < count; ++i) {
                meshes = data.meshes[i];
                index  = Object.keys(meshes);

                for (j = 0, size = index.length; j < size; ++j) {
                    objects.push({
                        texture: data.textures[index[j]],
                        alpha:   _model.alpha,
                        mesh:    meshes[index[j]]
                    });

                    total += meshes[index[j]].length;
                }
            }

            buffer = new Float32Array(total);
            count  = objects.length;
            pos    = 0;
            offset = 0;

            // Merge meshes to buffer
            for (i = 0; i < count; ++i) {
                object = objects[i];
                length = object.mesh.length;

                infos[i] = {
                    texture:    'data/texture/' + object.texture,
                    vertOffset: offset / 9,
                    vertCount:  length / 9
                };

                // Add to buffer
                buffer.set(object.mesh, offset);
                offset += length;
            }

            // Load textures
            i = -1;

            function loadNextTexture() {

                // Loading complete, rendering...
                if ((++i) === count) {
                    // Initialize renderer
                    initModel(gl, {
                        buffer: buffer,
                        infos:  infos
                    });
                    self.ready = true;
                    return;
                }

                Client.loadFile(infos[i].texture, function (data) {
                    infos[i].texture = data;
                    loadNextTexture();
                }, loadNextTexture);
            }

            // Start loading textures
            loadNextTexture();
        });
    };

    RsmEffect.prototype.init = function render(gl, tick) {
        console.warn(_params)
        this.ready = true;
    }

    RsmEffect.prototype.free = function free(gl) {
        this.ready = false;
    };

    RsmEffect.free = function free(gl) {
        if (_buffer) {
            gl.deleteBuffer(_buffer);
            _buffer = null;
        }

        if (_program) {
            gl.deleteProgram(_program);
            _program = null;
        }

        for (var i = 0, count = _objects.length; i < count; ++i) {
            gl.deleteTexture(_objects[i].texture);
        }

        _objects.length = 0;
        this.ready      = false;
    };

    RsmEffect.beforeRender = function beforeRender(gl, modelView, projection, fog, tick) {
        // -- positions
        var offsetx = _model.box.range[0]*0.1;
        var offsetz = _model.box.range[1]*0.5;
        mat4.translate(modelView, modelView, [_params.Inst.position[0] + offsetx, -_params.Inst.position[2], _params.Inst.position[1] + offsetz]);
        mat4.rotateX(modelView, modelView, Math.PI); // Math.PI = 1rad = 180deg

        // Calculate normal mat
        mat4.toInverseMat3(modelView, _normalMat);
        mat3.transpose(_normalMat, _normalMat);


        // -- render
        var uniform   = _program.uniform;
        var attribute = _program.attribute;

        gl.useProgram(_program);

        // Bind matrix
        gl.uniformMatrix4fv(uniform.uModelViewMat, false, modelView);
        gl.uniformMatrix4fv(uniform.uProjectionMat, false, projection);
        gl.uniformMatrix3fv(uniform.uNormalMat, false, _normalMat);

        // Bind light
        gl.uniform3fv(uniform.uLightDirection, _light.direction);
        gl.uniform1f(uniform.uLightOpacity, _light.opacity);
        gl.uniform3fv(uniform.uLightAmbient, _light.ambient);
        gl.uniform3fv(uniform.uLightDiffuse, _light.diffuse);

        // Fog settings
        gl.uniform1i(uniform.uFogUse, fog.use && fog.exist);
        gl.uniform1f(uniform.uFogNear, fog.near);
        gl.uniform1f(uniform.uFogFar, fog.far);
        gl.uniform3fv(uniform.uFogColor, fog.color);

        // Enable all attributes
        gl.enableVertexAttribArray(attribute.aPosition);
        gl.enableVertexAttribArray(attribute.aVertexNormal);
        gl.enableVertexAttribArray(attribute.aTextureCoord);
        gl.enableVertexAttribArray(attribute.aAlpha);

        gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);

        // Link attribute
        gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 9 * 4, 0);
        gl.vertexAttribPointer(attribute.aVertexNormal, 3, gl.FLOAT, false, 9 * 4, 3 * 4);
        gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 9 * 4, 6 * 4);
        gl.vertexAttribPointer(attribute.aAlpha, 1, gl.FLOAT, false, 9 * 4, 8 * 4);

        // Textures
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(uniform.uDiffuse, 0);
    };

    RsmEffect.prototype.render = function render(gl, tick) {
        for (var i = 0, count = _objects.length; i < count; ++i) {
            if (_objects[i].complete) {
                gl.bindTexture(gl.TEXTURE_2D, _objects[i].texture);
                gl.drawArrays(gl.TRIANGLES, _objects[i].vertOffset, _objects[i].vertCount);
            }
        }
    }

    RsmEffect.afterRender = function afterRender(gl) {
        var attribute = _program.attribute;
        gl.disableVertexAttribArray(attribute.aPosition);
        gl.disableVertexAttribArray(attribute.aVertexNormal);
        gl.disableVertexAttribArray(attribute.aTextureCoord);
        gl.disableVertexAttribArray(attribute.aAlpha);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    };

    return RsmEffect;
});
