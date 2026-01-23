/**
 * Renderer/Effects/Shaders/CAS.js
 * Implementation of AMD FidelityFX Contrast Adaptive Sharpening (CAS).
 * Sharpens the image while minimizing artifacts and preserving detail.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
 */
define(function(require) {  
    'use strict';  
  
    var GraphicsSettings = require('Preferences/Graphics');  
    var WebGL = require('Utils/WebGL');  
    var PostProcess = require('Renderer/Effects/PostProcess');  
  
    var _program, _buffer;  
  
    /**  
     * Vertex Shader: Common quad  
     */  
    var commonVS = `  
        #version 300 es  
        #pragma vscode_glsllint_stage : vert  
        precision highp float;  
        in vec2 aPosition;  
        out vec2 vUv;  
  
        void main() {  
            vUv = aPosition * 0.5 + 0.5;  
            gl_Position = vec4(aPosition, 0.0, 1.0);  
        }  
    `;  
  
    /**  
     * Fragment Shader: AMD FidelityFX CAS  
     * Converted from HLSL to GLSL WebGL  
     */  
    var casFS = `  
        #version 300 es  
        #pragma vscode_glsllint_stage : frag  
        precision mediump float;  
  
        uniform sampler2D uTexture;  
        uniform float uContrast;  
        uniform float uSharpening;  
        uniform vec2 uTexelSize;  
  
        in vec2 vUv;  
        out vec4 fragColor;  
  
        void main() {  
            // Sampling 3x3  
            //  a b c  
            //  d(e)f  
            //  g h i  
              
            vec3 a = texture(uTexture, vUv + vec2(-uTexelSize.x, -uTexelSize.y)).rgb;  
            vec3 b = texture(uTexture, vUv + vec2(0.0, -uTexelSize.y)).rgb;  
            vec3 c = texture(uTexture, vUv + vec2(uTexelSize.x, -uTexelSize.y)).rgb;  
            vec3 d = texture(uTexture, vUv + vec2(-uTexelSize.x, 0.0)).rgb;  
            vec3 e = texture(uTexture, vUv).rgb;  
            vec3 f = texture(uTexture, vUv + vec2(uTexelSize.x, 0.0)).rgb;  
            vec3 g = texture(uTexture, vUv + vec2(-uTexelSize.x, uTexelSize.y)).rgb;  
            vec3 h = texture(uTexture, vUv + vec2(0.0, uTexelSize.y)).rgb;  
            vec3 i = texture(uTexture, vUv + vec2(uTexelSize.x, uTexelSize.y)).rgb;  
  
            // Soft min e max 
            vec3 mnRGB = min(min(min(d, e), min(f, b)), h);  
            vec3 mnRGB2 = min(mnRGB, min(min(a, c), min(g, i)));  
            mnRGB += mnRGB2;  
  
            vec3 mxRGB = max(max(max(d, e), max(f, b)), h);  
            vec3 mxRGB2 = max(mxRGB, max(max(a, c), max(g, i)));  
            mxRGB += mxRGB2;  
  
            vec3 rcpMRGB = 1.0 / mxRGB;  
            vec3 ampRGB = clamp(min(mnRGB, 2.0 - mxRGB) * rcpMRGB, 0.0, 1.0);  
  
            ampRGB = inversesqrt(ampRGB);  
  
            float peak = -3.0 * uContrast + 8.0;  
            vec3 wRGB = -1.0 / (ampRGB * peak);  
            vec3 rcpWeightRGB = 1.0 / (4.0 * wRGB + 1.0);  
  
            // Cross Filter 
            //  0 w 0  
            //  w 1 w  
            //  0 w 0  
            vec3 window = (b + d) + (f + h);  
            vec3 outColor = clamp((window * wRGB + e) * rcpWeightRGB, 0.0, 1.0);  
  
            // Blend 
            fragColor = vec4(mix(e, outColor, uSharpening), 1.0);  
        }  
    `;  
  
    function CAS() {}  
  
    /**  
     * Render CAS  
     */  
    CAS.render = function render(gl, inputTexture, outputFramebuffer) {  
        if (!_buffer || !_program || !CAS.isActive()) return;  
  
        gl.bindFramebuffer(gl.FRAMEBUFFER, outputFramebuffer);  
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);  
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
  
        gl.useProgram(_program);  
  
        // Uniforms
        gl.uniform1f(_program.uniform.uContrast, GraphicsSettings.casContrast || 0.0);  
        gl.uniform1f(_program.uniform.uSharpening, GraphicsSettings.casSharpening || 1.0);  
        gl.uniform2f(_program.uniform.uTexelSize, 1.0/gl.canvas.width, 1.0/gl.canvas.height);  
  
        gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);  
        var posLoc = _program.attribute.aPosition;  
        gl.enableVertexAttribArray(posLoc);  
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);  
  
        gl.activeTexture(gl.TEXTURE0);  
        gl.bindTexture(gl.TEXTURE_2D, inputTexture);  
        gl.uniform1i(_program.uniform.uTexture, 0);  
  
        gl.drawArrays(gl.TRIANGLES, 0, 6);  
  
        CAS.afterRender(gl);  
    };  
  
    CAS.afterRender = function(gl) {  
        gl.useProgram(null);  
        gl.bindBuffer(gl.ARRAY_BUFFER, null);  
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);  
        gl.bindTexture(gl.TEXTURE_2D, null);  
    };  
  
    CAS.init = function init(gl) {  
        if (!gl) return;  
        try {  
            _program = WebGL.createShaderProgram(gl, commonVS, casFS);  
        } catch (e) {  
            console.error("Error compiling CAS shader.", e);  
            return;  
        }  
        var quadVertices = new Float32Array([  
            -1, -1, 1, -1, -1, 1,  
            -1, 1, 1, -1, 1, 1  
        ]);  
        _buffer = gl.createBuffer();  
        gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);  
        gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);  
    };  
  
    CAS.isActive = function isActive() {  
        return GraphicsSettings.casEnabled;  
    };  
  
    CAS.program = function program() {   
        return _program;   
    };  
  
    CAS.clean = function clean(gl) {   
        _program = _buffer = null;   
    };  
  
    return CAS;  
});