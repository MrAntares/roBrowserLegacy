/**
 * Renderer/Effects/Shaders/Vibrance.js
 * Implementation of the Vibrance post-processing effect.
 * Adjusts color saturation based on existing saturation levels.
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
  
    var commonVS = `  
        #version 300 es  
        precision highp float;  
        in vec2 aPosition;  
        out vec2 vUv;  
  
        void main() {  
            vUv = aPosition * 0.5 + 0.5;  
            gl_Position = vec4(aPosition, 0.0, 1.0);  
        }  
    `;  
  
    var vibranceFS = `  
        #version 300 es  
        precision mediump float;  
  
        uniform sampler2D uTexture;  
        uniform float uVibrance;  
        uniform vec3 uVibranceRGBBalance;  
  
        in vec2 vUv;  
        out vec4 fragColor;  
  
        void main() {  
            vec3 color = texture(uTexture, vUv).rgb;  
              
            // (Rec. 709)  
            vec3 coefLuma = vec3(0.212656, 0.715158, 0.072186);  
            float luma = dot(coefLuma, color);  
  
            float max_color = max(color.r, max(color.g, color.b));  
            float min_color = min(color.r, min(color.g, color.b));  
            float color_saturation = max_color - min_color;  
  
            vec3 coeffVibrance = uVibranceRGBBalance * uVibrance;  

            float strength = 1.0 + (coeffVibrance.r * (1.0 - (sign(coeffVibrance.r) * color_saturation)));  
            color.r = mix(luma, color.r, strength);  
              
            strength = 1.0 + (coeffVibrance.g * (1.0 - (sign(coeffVibrance.g) * color_saturation)));  
            color.g = mix(luma, color.g, strength);  
              
            strength = 1.0 + (coeffVibrance.b * (1.0 - (sign(coeffVibrance.b) * color_saturation)));  
            color.b = mix(luma, color.b, strength);  
  
            fragColor = vec4(color, 1.0);  
        }  
    `;  
  
    function Vibrance() {}  
  
    Vibrance.render = function render(gl, inputTexture, outputFramebuffer) {  
        if (!_buffer || !_program || !Vibrance.isActive()) return;  
  
        gl.bindFramebuffer(gl.FRAMEBUFFER, outputFramebuffer);  
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);  
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
  
        gl.useProgram(_program);  
  
        gl.uniform1f(_program.uniform.uVibrance, GraphicsSettings.vibrance || 0.15);  
        gl.uniform3f(_program.uniform.uVibranceRGBBalance, 1.0, 1.0, 1.0);  
  
        gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);  
        var posLoc = _program.attribute.aPosition;  
        gl.enableVertexAttribArray(posLoc);  
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);  
  
        gl.activeTexture(gl.TEXTURE0);  
        gl.bindTexture(gl.TEXTURE_2D, inputTexture);  
        gl.uniform1i(_program.uniform.uTexture, 0);  
  
        gl.drawArrays(gl.TRIANGLES, 0, 6);  
  
        Vibrance.afterRender(gl);  
    };  
  
    Vibrance.afterRender = function(gl) {  
        gl.useProgram(null);  
        gl.bindBuffer(gl.ARRAY_BUFFER, null);  
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);  
        gl.bindTexture(gl.TEXTURE_2D, null);  
    };  
  
    Vibrance.init = function init(gl) {  
        if (!gl) return;  
        try {  
            _program = WebGL.createShaderProgram(gl, commonVS, vibranceFS);  
        } catch (e) {  
            console.error("Error compiling Vibrance shader.", e);  
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
  
    Vibrance.isActive = function isActive() {  
        return GraphicsSettings.vibranceEnabled;  
    };  
  
    Vibrance.program = function program() {   
        return _program;   
    };  
  
    Vibrance.clean = function clean(gl) {   
        _program = _buffer = null;   
    };  
  
    return Vibrance;  
});