define(function( require ) {

    'use strict';

    var WebGL    = require('Utils/WebGL');


    var _vertexShader = `
        #version 100
        #pragma vscode_glsllint_stage : vert
        precision highp float;

        varying vec4 fragColor;

        attribute vec2 aPosition;

        uniform vec4 uColor;

        uniform mat4 uModelViewMat;
        uniform mat4 uProjectionMat;

        uniform vec3 uPosition;
        uniform float uSize;

        void main(void) {
            vec4 position  = vec4(uPosition.x + 0.5, -uPosition.z, uPosition.y + 0.5, 1.0);
            position      += vec4(aPosition.x * uSize, 0.0, aPosition.y * uSize, 0.0);

            gl_Position    = uProjectionMat * uModelViewMat * position;
            gl_Position.z -= 0.01;
            fragColor = uColor;
        }
    `;

    var _fragmentShader = `
        #version 100
        #pragma vscode_glsllint_stage : vert
        precision highp float;

        varying vec4 fragColor;

        void main(void) {
                gl_FragColor = fragColor;
        }
    `;

    var _cache = {};

    return function(name, spec){
        var _program, _buffer;
        if (_cache[name]){
            return _cache[name]
        }
        if (spec.a === undefined){
            spec.a = 0.5;
        }

        [spec.r, spec.g, spec.b, spec.a].forEach(function(value){
            if (value === undefined){
                throw new Error('FlatColorTile: need to pass r, g, b, a')
            }
            if (value > 1.0 || value < 0.0){
                throw new Error('FlatColorTile: r, g, b, a need to be 0.0-1.0')
            }
        });

        function FlatColorTile(pos, startTick){
            this.position = pos;
        }

        FlatColorTile._uid = name;
        _cache[name] = FlatColorTile;

        FlatColorTile.prototype.init = function init( gl ){
            this.ready  = true;
        };

        FlatColorTile.prototype.free = function free( gl ){
            this.ready = false;
        };


        FlatColorTile.prototype.render = function render( gl, tick ){
			if (_program === undefined) return; // temporal hotfix to avoid crash
            gl.uniform3fv( _program.uniform.uPosition,  this.position);
            gl.uniform1f(  _program.uniform.uSize, 0.5);
            gl.uniform4fv( _program.uniform.uColor,  [spec.r, spec.g, spec.b, spec.a]);

            gl.bindBuffer( gl.ARRAY_BUFFER, _buffer );
            gl.drawArrays( gl.TRIANGLES, 0, 6 );

        };

        FlatColorTile.init = function init(gl){
            _program = WebGL.createShaderProgram( gl, _vertexShader, _fragmentShader);
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
            FlatColorTile.ready = true;
        };


        FlatColorTile.renderBeforeEntities = true;


        FlatColorTile.free = function free(gl)
        {

            if (_program) {
                gl.deleteProgram(_program);
                _program = null;
            }

            if (_buffer) {
                gl.deleteBuffer(_buffer);
            }

            this.ready = false;
        };

        FlatColorTile.beforeRender = function beforeRender(gl, modelView, projection, fog, tick)
        {
            var uniform   = _program.uniform;
            var attribute = _program.attribute;

            gl.useProgram( _program );

            gl.uniformMatrix4fv( uniform.uModelViewMat,  false, modelView );
            gl.uniformMatrix4fv( uniform.uProjectionMat, false, projection );

            gl.enableVertexAttribArray( attribute.aPosition );

            gl.bindBuffer( gl.ARRAY_BUFFER, _buffer );

            gl.vertexAttribPointer( attribute.aPosition, 2, gl.FLOAT, false, 4*4,  0   );

        };

        FlatColorTile.afterRender = function afterRender(gl)
        {
            gl.disableVertexAttribArray( _program.attribute.aPosition );
        };

        return FlatColorTile;
    }

});
