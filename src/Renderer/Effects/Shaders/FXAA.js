/**
 * Renderer/Effects/Shaders/FXAA.js
 * Implementation of Fast Approximate Anti-Aliasing (FXAA).
 * Smoothens jagged edges based on luma difference in a single pass.
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
    var _fxaaEdgeThresholdMin = 0.0;

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
  
    var fxaaFS = `  
        #version 300 es  
        #pragma vscode_glsllint_stage : frag  
        precision mediump float;  
  
        uniform sampler2D uTexture;  
        uniform float uSubpix;  
        uniform float uEdgeThreshold;  
        uniform float uEdgeThresholdMin;  
        uniform vec2 uTexelSize;  
  
        in vec2 vUv;  
        out vec4 fragColor;  
  
        float luminance(vec3 rgb) {  
            return dot(rgb, vec3(0.299, 0.587, 0.114));  
        }  
  
        void main() {  
            vec3 rgbM = texture(uTexture, vUv).rgb;  
              
            vec3 rgbNW = texture(uTexture, vUv + vec2(-uTexelSize.x, -uTexelSize.y)).rgb;  
            vec3 rgbNE = texture(uTexture, vUv + vec2(uTexelSize.x, -uTexelSize.y)).rgb;  
            vec3 rgbSW = texture(uTexture, vUv + vec2(-uTexelSize.x, uTexelSize.y)).rgb;  
            vec3 rgbSE = texture(uTexture, vUv + vec2(uTexelSize.x, uTexelSize.y)).rgb;  
   
            float lumaM = luminance(rgbM);  
            float lumaNW = luminance(rgbNW);  
            float lumaNE = luminance(rgbNE);  
            float lumaSW = luminance(rgbSW);  
            float lumaSE = luminance(rgbSE);  
  
            float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));  
            float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));  
  
            float lumaRange = lumaMax - lumaMin;  
            if(lumaRange < max(uEdgeThresholdMin, lumaMax * uEdgeThreshold)) {  
                fragColor = vec4(rgbM, 1.0);  
                return;  
            }  
  
            vec2 dir;  
            dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));  
            dir.y = ((lumaNW + lumaSW) - (lumaNE + lumaSE));  
  
            float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * 0.03125, 0.0078125);  
            float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);  
            dir = min(vec2(8.0), max(vec2(-8.0), dir * rcpDirMin)) * uTexelSize;  
   
            vec3 rgbA = 0.5 * (  
                texture(uTexture, vUv + dir * (1.0/3.0 - 0.5)).rgb +  
                texture(uTexture, vUv + dir * (2.0/3.0 - 0.5)).rgb);  
            vec3 rgbB = rgbA * 0.5 + 0.25 * (  
                texture(uTexture, vUv + dir * -0.5).rgb +  
                texture(uTexture, vUv + dir * 0.5).rgb);  
  
            float lumaB = luminance(rgbB);  
            if((lumaB < lumaMin) || (lumaB > lumaMax)) {  
                fragColor = vec4(rgbA, 1.0);  
            } else {  
                fragColor = vec4(rgbB, 1.0);  
            }  
        }  
    `;  
  
    function FXAA() {}  
  
    FXAA.render = function render(gl, inputTexture, outputFramebuffer) {  
        if (!_buffer || !_program || !FXAA.isActive()) return;  
  
        gl.bindFramebuffer(gl.FRAMEBUFFER, outputFramebuffer);  
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);  
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
  
        gl.useProgram(_program);  
  
        gl.uniform1f(_program.uniform.uSubpix, GraphicsSettings.fxaaSubpix || 0.25);  
        gl.uniform1f(_program.uniform.uEdgeThreshold, GraphicsSettings.fxaaEdgeThreshold || 0.125);  
        gl.uniform1f(_program.uniform.uEdgeThresholdMin, 0.0);  
        gl.uniform2f(_program.uniform.uTexelSize, 1.0/gl.canvas.width, 1.0/gl.canvas.height);  
  
        gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);  
        var posLoc = _program.attribute.aPosition;  
        gl.enableVertexAttribArray(posLoc);  
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);  
  
        gl.activeTexture(gl.TEXTURE0);  
        gl.bindTexture(gl.TEXTURE_2D, inputTexture);  
        gl.uniform1i(_program.uniform.uTexture, 0);  
  
        gl.drawArrays(gl.TRIANGLES, 0, 6);  
  
        FXAA.afterRender(gl);  
    };  
  
    FXAA.afterRender = function(gl) {  
        gl.useProgram(null);  
        gl.bindBuffer(gl.ARRAY_BUFFER, null);  
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);  
        gl.bindTexture(gl.TEXTURE_2D, null);  
    };  
  
    FXAA.init = function init(gl) {  
        if (!gl) return;  
        try {  
            _program = WebGL.createShaderProgram(gl, commonVS, fxaaFS);  
        } catch (e) {  
            console.error("Error compiling FXAA shader.", e);  
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
  
    FXAA.isActive = function isActive() {  
        return GraphicsSettings.fxaaEnabled;  
    };  
  
    FXAA.program = function program() {   
        return _program;   
    };  
  
    FXAA.clean = function clean(gl) {  
        if (_buffer) gl.deleteBuffer(_buffer); 
        _program = _buffer = null;   
    };  
  
    return FXAA;  
});