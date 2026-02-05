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
    var commonVS = require('text!./Imports/Common.vs');
  
    /**  
     * Fragment Shader: AMD FidelityFX CAS  
     * Converted from HLSL to GLSL WebGL  
     */  
    var casFS = require('text!./Imports/CAS.fs'); 
  
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
        if (_buffer) gl.deleteBuffer(_buffer); 
        _program = _buffer = null;   
    };  
  
    return CAS;  
});