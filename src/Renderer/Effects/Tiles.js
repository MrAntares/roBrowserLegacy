"use strict";

define(["exports", "Utils/WebGL", "Utils/Texture", "Utils/gl-matrix", "Core/Client", "Core/Configs", "Renderer/SpriteRenderer"], function (exports, _WebGL, _Texture, _glMatrix, _Client, Configs, SpriteRenderer) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.HoveringTexture = exports.FlatTexture = exports.flatTextureFragmentShader = exports.flatTextureVertexShader = undefined;
  exports.loadTexture = loadTexture;

  var _WebGL2 = _interopRequireDefault(_WebGL);

  var _Texture2 = _interopRequireDefault(_Texture);

  var _glMatrix2 = _interopRequireDefault(_glMatrix);

  var _Client2 = _interopRequireDefault(_Client);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  const mat4 = _glMatrix2.default.mat4;
  var flatTextureVertexShader = exports.flatTextureVertexShader = `
        #version 300 es
        #pragma vscode_glsllint_stage : vert
        precision highp float;

        in vec2 aPosition;
        in vec2 aTextureCoord;
        out vec2 vTextureCoord;
        uniform mat4 uModelViewMat;
        uniform mat4 uProjectionMat;
        uniform vec3 uPosition;
		    uniform float uSize;
		

        void main(void) {
            vec4 position  = vec4(uPosition.x + 0.5, -uPosition.z, uPosition.y + 0.5, 1.0);
            position      += vec4(aPosition.x * uSize, 0.0, aPosition.y * uSize, 0.0);
            gl_Position    = uProjectionMat * uModelViewMat * position;
            gl_Position.z -= 0.01;
            vTextureCoord  = aTextureCoord;
        }
`;

  var flatTextureFragmentShader = exports.flatTextureFragmentShader = `
        #version 300 es
        #pragma vscode_glsllint_stage : frag
        precision highp float;
        
        in vec2 vTextureCoord;
        out vec4 fragColor;
        uniform sampler2D uDiffuse;
        uniform float alpha;
        
        uniform bool  uFogUse;
        uniform float uFogNear;
        uniform float uFogFar;
        uniform vec3  uFogColor;
        
            void main(void) {
                vec4 textureSample = texture( uDiffuse,  vTextureCoord.st );
                if (textureSample.r < 0.1 || textureSample.g < 0.1 || textureSample.b < 0.1) {
                  discard;
                }
                textureSample.a = alpha;
                fragColor = textureSample;
          
          if (uFogUse) {
            float depth     = gl_FragCoord.z / gl_FragCoord.w;
            float fogFactor = smoothstep( uFogNear, uFogFar, depth );
            fragColor    = mix( fragColor, vec4( uFogColor, fragColor.w ), fogFactor );
          }
        }
`;

  function loadTexture(gl, texture, cb) {
    var _texture = gl.createTexture();

    _Client2.default.loadFile(texture.filename, function (buffer) {
      _Texture2.default.load(buffer, function (canvas) {
        var enableMipmap = Configs.get('enableMipmap');
        var size = texture.size;
        var canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        var ctx = canvas.getContext('2d');
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        ctx.drawImage(this, 0, 0, size, size);
        ctx.restore();
        gl.bindTexture(gl.TEXTURE_2D, _texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        if(enableMipmap) {
          gl.generateMipmap( gl.TEXTURE_2D );
        }
        cb(_texture);
      });
    });
  }

  var FlatTexture = exports.FlatTexture = (textureFilename, size = 64) => class {
    static get renderBeforeEntities() {
      return true;
    }

    static createShaderProgram(gl) {
      return _WebGL2.default.createShaderProgram(gl, flatTextureVertexShader, flatTextureFragmentShader);
    }

    static init(gl) {
      var self = this;
      this._program = this.createShaderProgram(gl);
      this._buffer = gl.createBuffer();
      this._texture = null;
      gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 0.0, 0.0, +1.0, -1.0, 1.0, 0.0, +1.0, +1.0, 1.0, 1.0, +1.0, +1.0, 1.0, 1.0, -1.0, +1.0, 0.0, 1.0, -1.0, -1.0, 0.0, 0.0]), gl.STATIC_DRAW);
      loadTexture(gl, {
        filename: textureFilename,
        size
      }, texture => {
        self._texture = texture;
        self.ready = true;
      });
	  
		/*_Client2.default.loadFile(textureFilename, function(buffer) {
			_WebGL2.default.texture( gl, buffer, function(texture) {
				self._texture = texture;
				self.ready   = true;
			});
		});*/
    }

    static free(gl) {
      if (this._texture) {
        gl.deleteTexture(this._texture);
        this._texture = null;
      }

      if (this._program) {
        gl.deleteProgram(this._program);
        this._program = null;
      }

      if (this._buffer) {
        gl.deleteBuffer(this._buffer);
        this._buffer = null;
      }

      this.ready = false;
    }

    static beforeRender(gl, modelView, projection, fog, tick) {
      var uniform = this._program.uniform;
      var attribute = this._program.attribute;
      gl.useProgram(this._program); // Bind matrix

      gl.uniformMatrix4fv(uniform.uModelViewMat, false, modelView);
      gl.uniformMatrix4fv(uniform.uProjectionMat, false, projection); // Texture

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this._texture);
      gl.uniform1i(uniform.uDiffuse, 0); // Enable all attributes
	  
	  gl.uniform1i(  uniform.uFogUse,   fog.use && fog.exist );
	  gl.uniform1f(  uniform.uFogNear,  fog.near );
	  gl.uniform1f(  uniform.uFogFar,   fog.far  );
	  gl.uniform3fv( uniform.uFogColor, fog.color );

      gl.enableVertexAttribArray(attribute.aPosition);
      gl.enableVertexAttribArray(attribute.aTextureCoord);
      gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
      gl.vertexAttribPointer(attribute.aPosition, 2, gl.FLOAT, false, 4 * 4, 0);
      gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
    }

    static afterRender(gl) {
      gl.disableVertexAttribArray(this._program.attribute.aPosition);
      gl.disableVertexAttribArray(this._program.attribute.aTextureCoord);
    }

    constructor(pos, startTick) {
      this.position = pos;
    }

    init() {
      this.ready = true;
    }

    free() {
      this.ready = false;
    }

    render(gl, tick) {
      gl.uniform3fv(this.constructor._program.uniform.uPosition, this.position);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.constructor._buffer);

      SpriteRenderer.runWithDepth(false, false, false, function () {
          gl.drawArrays(gl.TRIANGLES, 0, 6);
      });
    }

  };

  var _hoveringNum = 0;

  var HoveringTexture = exports.HoveringTexture = (textureFilename, effectSize = 1, alpha = 1) => class extends FlatTexture(textureFilename) {
    constructor() {
      super(...arguments);
      this.ix = ++_hoveringNum;
      this.effectSize = effectSize;
	  this.alpha = alpha
    }

    render(gl, tick) {
		var oddEven = this.ix % 2 === 0 ? Math.PI : 0;
		var heightMult = Math.sin(oddEven + tick / (540 * Math.PI));
		var position = [this.position[0], this.position[1], this.position[2] + 0.4 - 0.2 * heightMult];
		gl.uniform3fv(this.constructor._program.uniform.uPosition, position);
		gl.uniform1f(this.constructor._program.uniform.uSize, this.effectSize);
		gl.uniform1f(this.constructor._program.uniform.alpha, this.alpha);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.constructor._buffer);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

  };
});
