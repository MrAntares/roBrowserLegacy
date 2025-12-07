"use strict";

define(["exports", "Utils/WebGL", "Renderer/Effects/Tiles"], function (exports, _WebGL, _Tiles) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _WebGL2 = _interopRequireDefault(_WebGL);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _SpiderWebVertexShader = `
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
  var _SpiderWebFragmentShader = `
        #version 300 es
        #pragma vscode_glsllint_stage : frag
        precision highp float;

        in vec2 vTextureCoord;
        out vec4 fragColor;

        uniform sampler2D uDiffuse;

        void main(void) {
            vec4 textureSample = texture( uDiffuse,  vTextureCoord.st );
            if (textureSample.r < 0.5 || textureSample.g < 0.5 || textureSample.b < 0.5) {
               discard;
            }
            textureSample.a = 0.7;
            fragColor = textureSample;
        }
`;
  var _lpNum = 0;

  class SpiderWeb extends (0, _Tiles.FlatTexture)('data/texture/effect/spiderweb.tga', 128) {
    static createShaderProgram(gl) {
      return _WebGL2.default.createShaderProgram(gl, _SpiderWebVertexShader, _SpiderWebFragmentShader);
    }

    constructor() {
      super(...arguments);
      this.ix = ++_lpNum;
    }

    render(gl, tick) {
      var oddEven = this.ix % 2 === 0 ? Math.PI : 0;
      var sizeMult = Math.sin(oddEven + tick / (540 * Math.PI));
      gl.uniform3fv(this.constructor._program.uniform.uPosition, this.position);
      gl.uniform1f(this.constructor._program.uniform.uSize, 1.5 + 0.05 * sizeMult);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.constructor._buffer);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

  }

  return SpiderWeb;
});