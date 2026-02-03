/**
 * Renderer/Map/AnimatedModels.js
 *
 * Render animated RSM models on the map
 * These models have animation keyframes and need per-frame geometry updates
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */
define(function (require) {
    'use strict';

    var Client = require('Core/Client');
    var glMatrix = require('Utils/gl-matrix');
    var WebGL = require('Utils/WebGL');

    var mat3 = glMatrix.mat3;
    var mat4 = glMatrix.mat4;
    var vec3 = glMatrix.vec3;

    /**
     * Shader program
     */
    var _program = null;

    /**
     * List of animated models
     */
    var _animatedModels = [];

    /**
     * Model shading types
     */
    var SHADING = {
        NONE: 0,
        FLAT: 1,
        SMOOTH: 2
    };

    /**
     * Vertex Shader
     */
    var _vertexShader = `
        attribute vec3 aPosition;
        attribute vec3 aNormal;
        attribute vec2 aTextureCoord;
        attribute float aAlpha;

        varying vec2 vTextureCoord;
        varying float vLightWeighting;
        varying float vAlpha;
        varying float vFogFactor;

        uniform mat4 uModelViewMat;
        uniform mat4 uProjectionMat;
        uniform mat3 uNormalMat;

        uniform vec3 uLightDirection;
        uniform float uLightOpacity;
        uniform vec3 uLightAmbient;
        uniform vec3 uLightDiffuse;

        uniform bool uFogUse;
        uniform float uFogNear;
        uniform float uFogFar;

        void main(void) {
            vec4 position = uModelViewMat * vec4(aPosition, 1.0);
            gl_Position = uProjectionMat * position;

            vTextureCoord = aTextureCoord;
            vAlpha = aAlpha;

            vec3 normal = normalize(uNormalMat * aNormal);
            float lightWeight = max(dot(normal, -uLightDirection), 0.0);
            vLightWeighting = (1.0 - uLightOpacity) + lightWeight * uLightOpacity;

            if (uFogUse) {
                float depth = length(position.xyz);
                vFogFactor = clamp((uFogFar - depth) / (uFogFar - uFogNear), 0.0, 1.0);
            } else {
                vFogFactor = 1.0;
            }
        }
    `;

    /**
     * Fragment Shader
     */
    var _fragmentShader = `
        precision highp float;

        varying vec2 vTextureCoord;
        varying float vLightWeighting;
        varying float vAlpha;
        varying float vFogFactor;

        uniform sampler2D uDiffuse;
        uniform vec3 uFogColor;
        uniform bool uFogUse;

        void main(void) {
            vec4 texture = texture2D(uDiffuse, vTextureCoord);

            if (texture.a == 0.0) {
                discard;
            }

            vec3 color = texture.rgb * vLightWeighting;

            if (uFogUse) {
                color = mix(uFogColor, color, vFogFactor);
            }

            gl_FragColor = vec4(color, texture.a * vAlpha);
        }
    `;

    /**
     * Initialize shader program
     */
    function init(gl) {
        _program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);

        _program.uniform = {
            uModelViewMat: gl.getUniformLocation(_program, 'uModelViewMat'),
            uProjectionMat: gl.getUniformLocation(_program, 'uProjectionMat'),
            uNormalMat: gl.getUniformLocation(_program, 'uNormalMat'),
            uLightDirection: gl.getUniformLocation(_program, 'uLightDirection'),
            uLightOpacity: gl.getUniformLocation(_program, 'uLightOpacity'),
            uLightAmbient: gl.getUniformLocation(_program, 'uLightAmbient'),
            uLightDiffuse: gl.getUniformLocation(_program, 'uLightDiffuse'),
            uFogUse: gl.getUniformLocation(_program, 'uFogUse'),
            uFogNear: gl.getUniformLocation(_program, 'uFogNear'),
            uFogFar: gl.getUniformLocation(_program, 'uFogFar'),
            uFogColor: gl.getUniformLocation(_program, 'uFogColor'),
            uDiffuse: gl.getUniformLocation(_program, 'uDiffuse')
        };

        _program.attribute = {
            aPosition: gl.getAttribLocation(_program, 'aPosition'),
            aNormal: gl.getAttribLocation(_program, 'aNormal'),
            aTextureCoord: gl.getAttribLocation(_program, 'aTextureCoord'),
            aAlpha: gl.getAttribLocation(_program, 'aAlpha')
        };
    }

    /**
     * Free resources
     */
    function free(gl) {
        for (var i = 0; i < _animatedModels.length; i++) {
            var model = _animatedModels[i];
            if (model.buffer) {
                gl.deleteBuffer(model.buffer);
            }
            for (var tex in model.textureObjects) {
                if (model.textureObjects[tex]) {
                    gl.deleteTexture(model.textureObjects[tex]);
                }
            }
        }
        _animatedModels = [];
    }

    /**
     * Add an animated model
     */
    function add(gl, modelData) {
        if (!modelData || !modelData.nodes || modelData.nodes.length === 0) {
            return;
        }

        // Deserialize instances
        var instances = [];
        for (var i = 0; i < modelData.instances.length; i++) {
            var instArray = modelData.instances[i];
            var matrix = mat4.create();
            for (var j = 0; j < 16; j++) {
                matrix[j] = instArray[j];
            }
            instances.push(matrix);
        }

        // Deserialize nodes - convert arrays to Float32Arrays
        var nodes = [];
        for (var n = 0; n < modelData.nodes.length; n++) {
            var srcNode = modelData.nodes[n];
            nodes.push({
                name: srcNode.name,
                parentname: srcNode.parentname,
                is_only: srcNode.is_only,
                textures: srcNode.textures,
                vertices: srcNode.vertices,
                tvertices: new Float32Array(srcNode.tvertices),
                faces: srcNode.faces,
                pos: new Float32Array(srcNode.pos),
                rotangle: srcNode.rotangle,
                rotaxis: new Float32Array(srcNode.rotaxis),
                scale: new Float32Array(srcNode.scale),
                offset: new Float32Array(srcNode.offset),
                mat3: new Float32Array(srcNode.mat3),
                rotKeyframes: srcNode.rotKeyframes || [],
                posKeyframes: srcNode.posKeyframes || [],
                scaleKeyFrames: srcNode.scaleKeyFrames || []
            });
        }

        // Convert box arrays
        var box = {
            center: new Float32Array(modelData.box.center),
            max: new Float32Array(modelData.box.max),
            min: new Float32Array(modelData.box.min),
            offset: new Float32Array(modelData.box.offset),
            range: new Float32Array(modelData.box.range)
        };
        // Calculate animLen from keyframes if not set
        var animLen = modelData.animLen || 0;
        if (animLen === 0) {
            // Find max frame from keyframes
            for (var n = 0; n < nodes.length; n++) {
                var node = nodes[n];
                if (node.rotKeyframes) {
                    for (var rk = 0; rk < node.rotKeyframes.length; rk++) {
                        animLen = Math.max(animLen, node.rotKeyframes[rk].frame || 0);
                    }
                }
                if (node.posKeyframes) {
                    for (var pk = 0; pk < node.posKeyframes.length; pk++) {
                        animLen = Math.max(animLen, node.posKeyframes[pk].frame || 0);
                    }
                }
                if (node.scaleKeyFrames) {
                    for (var sk = 0; sk < node.scaleKeyFrames.length; sk++) {
                        animLen = Math.max(animLen, node.scaleKeyFrames[sk].Frame || 0);
                    }
                }
            }
            // Add some frames to ensure last keyframe is reached
            animLen = animLen + 1;
        }

        // Create model object
        var animModel = {
            filename: modelData.filename,
            animLen: animLen,
            fps: modelData.frameRatePerSecond || 30,
            shadeType: modelData.shadeType,
            alpha: modelData.alpha,
            textures: modelData.textures,
            instances: instances,
            nodes: nodes,
            box: box,
            textureObjects: {},
            buffer: null,
            meshInfos: [],
            lastFrame: -1
        };

        // Load textures
        for (var t = 0; t < modelData.textures.length; t++) {
            var texturePath = 'data\\texture\\' + modelData.textures[t];
            loadTexture(gl, animModel, texturePath, t);
        }

        _animatedModels.push(animModel);
    }

    /**
     * Load a texture for a model
     */
    function loadTexture(gl, model, path, index) {
        Client.loadFile(path, function (data) {
            WebGL.texture(gl, data, function (texture) {
                model.textureObjects[index] = texture;
            });
        }, function () {
            // Texture not found, use a placeholder
            model.textureObjects[index] = null;
        });
    }

    /**
     * SLERP quaternion interpolation
     */
    function slerpQuat(q1, q2, t) {
        var result = new Float32Array(4);

        var dot = q1[0] * q2[0] + q1[1] * q2[1] + q1[2] * q2[2] + q1[3] * q2[3];

        var q2Sign = 1;
        if (dot < 0) {
            dot = -dot;
            q2Sign = -1;
        }

        var scale0, scale1;
        if (dot > 0.9995) {
            scale0 = 1.0 - t;
            scale1 = t * q2Sign;
        } else {
            var theta = Math.acos(dot);
            var sinTheta = Math.sin(theta);
            scale0 = Math.sin((1.0 - t) * theta) / sinTheta;
            scale1 = Math.sin(t * theta) / sinTheta * q2Sign;
        }

        result[0] = scale0 * q1[0] + scale1 * q2[0];
        result[1] = scale0 * q1[1] + scale1 * q2[1];
        result[2] = scale0 * q1[2] + scale1 * q2[2];
        result[3] = scale0 * q1[3] + scale1 * q2[3];

        return result;
    }

    /**
     * Get rotation at frame
     */
    function getRotationAtFrame(keyframes, frame) {
        if (!keyframes || keyframes.length === 0) {
            return null;
        }

        if (keyframes.length === 1) {
            return keyframes[0].q;
        }

        var prev = keyframes[0];
        var next = null;

        for (var i = 0; i < keyframes.length; i++) {
            if (keyframes[i].frame > frame) {
                next = keyframes[i];
                break;
            }
            prev = keyframes[i];
        }

        if (!next) {
            return prev.q;
        }

        var frameDiff = next.frame - prev.frame;
        if (frameDiff === 0) {
            return prev.q;
        }

        var t = (frame - prev.frame) / frameDiff;
        return slerpQuat(prev.q, next.q, t);
    }

    /**
     * Get position at frame
     */
    function getPositionAtFrame(keyframes, frame) {
        if (!keyframes || keyframes.length === 0) {
            return null;
        }

        if (keyframes.length === 1) {
            return [keyframes[0].px, keyframes[0].py, keyframes[0].pz];
        }

        var prev = keyframes[0];
        var next = null;

        for (var i = 0; i < keyframes.length; i++) {
            if (keyframes[i].frame > frame) {
                next = keyframes[i];
                break;
            }
            prev = keyframes[i];
        }

        if (!next) {
            return [prev.px, prev.py, prev.pz];
        }

        var frameDiff = next.frame - prev.frame;
        if (frameDiff === 0) {
            return [prev.px, prev.py, prev.pz];
        }

        var t = (frame - prev.frame) / frameDiff;
        return [
            prev.px + (next.px - prev.px) * t,
            prev.py + (next.py - prev.py) * t,
            prev.pz + (next.pz - prev.pz) * t
        ];
    }

    /**
     * Get scale at frame
     */
    function getScaleAtFrame(keyframes, frame) {
        if (!keyframes || keyframes.length === 0) {
            return null;
        }

        if (keyframes.length === 1) {
            return keyframes[0].Scale;
        }

        var prev = keyframes[0];
        var next = null;

        for (var i = 0; i < keyframes.length; i++) {
            if (keyframes[i].Frame > frame) {
                next = keyframes[i];
                break;
            }
            prev = keyframes[i];
        }

        if (!next) {
            return prev.Scale;
        }

        var frameDiff = next.Frame - prev.Frame;
        if (frameDiff === 0) {
            return prev.Scale;
        }

        var t = (frame - prev.Frame) / frameDiff;
        return [
            prev.Scale[0] + (next.Scale[0] - prev.Scale[0]) * t,
            prev.Scale[1] + (next.Scale[1] - prev.Scale[1]) * t,
            prev.Scale[2] + (next.Scale[2] - prev.Scale[2]) * t
        ];
    }

    /**
     * Calculate face normal
     */
    function calcFaceNormal(v0, v1, v2) {
        var ax = v1[0] - v0[0];
        var ay = v1[1] - v0[1];
        var az = v1[2] - v0[2];
        var bx = v2[0] - v0[0];
        var by = v2[1] - v0[1];
        var bz = v2[2] - v0[2];

        var nx = ay * bz - az * by;
        var ny = az * bx - ax * bz;
        var nz = ax * by - ay * bx;

        var len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (len > 0) {
            nx /= len;
            ny /= len;
            nz /= len;
        }

        return [nx, ny, nz];
    }

    /**
     * Compile a node with a specific matrix
     */
    function compileNodeWithMatrix(node, finalMatrix, outMeshes, alpha) {
        // Cache normal matrix
        if (!node._cache.normalMat) node._cache.normalMat = mat4.create();
        var normalMat = node._cache.normalMat;

        // Extract rotation for normal matrix from finalMatrix directly
        mat4.extractRotation(normalMat, finalMatrix);

        // Generate transformed vertices
        var vertices = node.vertices;
        var vertCount = vertices.length;

        // Reuse vertex buffer
        if (!node._cache.vertBuffer) {
            node._cache.vertBuffer = new Float32Array(vertCount * 3);
        }
        var vert = node._cache.vertBuffer;

        // Transform vertices directly from finalMatrix (no intermediate modelViewMat needed)
        // Manual unroll for performance
        var m0 = finalMatrix[0], m1 = finalMatrix[1], m2 = finalMatrix[2], m3 = finalMatrix[3];
        var m4 = finalMatrix[4], m5 = finalMatrix[5], m6 = finalMatrix[6], m7 = finalMatrix[7];
        var m8 = finalMatrix[8], m9 = finalMatrix[9], m10 = finalMatrix[10], m11 = finalMatrix[11];
        var m12 = finalMatrix[12], m13 = finalMatrix[13], m14 = finalMatrix[14], m15 = finalMatrix[15];

        for (var i = 0; i < vertCount; i++) {
            var x = vertices[i][0];
            var y = vertices[i][1];
            var z = vertices[i][2];

            vert[i * 3 + 0] = m0 * x + m4 * y + m8 * z + m12;
            vert[i * 3 + 1] = m1 * x + m5 * y + m9 * z + m13;
            vert[i * 3 + 2] = m2 * x + m6 * y + m10 * z + m14;
        }

        // Generate mesh data per texture
        var faces = node.faces;
        var tvertices = node.tvertices;
        var textures = node.textures;
        var meshes = outMeshes;

        // Initialize meshes if not provided (First Run)
        if (!meshes) {
            meshes = {};
            // Count faces per texture
            var meshSizes = {};
            for (var t = 0; t < textures.length; t++) {
                meshSizes[textures[t]] = 0;
            }

            for (var f = 0; f < faces.length; f++) {
                var texIdx = textures[faces[f].texid];
                if (meshSizes[texIdx] === undefined) {
                    meshSizes[texIdx] = 0;
                }
                meshSizes[texIdx]++;
            }

            for (var texId in meshSizes) {
                meshes[texId] = {
                    data: new Float32Array(meshSizes[texId] * 3 * 9),
                    offset: 0
                };
            }
        } else {
            // Reset offsets for reuse
            for (var t in meshes) {
                meshes[t].offset = 0;
            }
        }

        // Cache normal matrix values for inline use
        var n0 = normalMat[0], n1 = normalMat[1], n2 = normalMat[2];
        var n4 = normalMat[4], n5 = normalMat[5], n6 = normalMat[6];
        var n8 = normalMat[8], n9 = normalMat[9], n10 = normalMat[10];

        // Fill mesh data
        for (var fi = 0; fi < faces.length; fi++) {
            var face = faces[fi];
            var texId = textures[face.texid];
            var mesh = meshes[texId];
            var data = mesh.data;
            var offset = mesh.offset;

            // Get vertex positions directly from transformed vertices buffer
            // vert array structure: [x,y,z, x,y,z...]
            var idx0 = face.vertidx[0] * 3;
            var idx1 = face.vertidx[1] * 3;
            var idx2 = face.vertidx[2] * 3;

            var v0x = vert[idx0];
            var v0y = vert[idx0 + 1];
            var v0z = vert[idx0 + 2];

            var v1x = vert[idx1];
            var v1y = vert[idx1 + 1];
            var v1z = vert[idx1 + 2];

            var v2x = vert[idx2];
            var v2y = vert[idx2 + 1];
            var v2z = vert[idx2 + 2];

            // Calculate Normal Inline (Cross Product) using original vertices for correct normal direction?
            // Wait, calcFaceNormal uses original vertices, then transforms normal.
            // Original code:
            // calcFaceNormal(vertices[face.vertidx[0]]...) -> transform
            // My inline code above uses transformed vertices. This is WRONG if I want invalid normals?
            // Wait, if I use transformed vertices to calculate normal, I get the transformed normal directly!
            // BUT, if scaling is non-uniform, face normal perpendicularity might be preserved?
            // The original code calculated normal from ORIGINAL vertices, then transformed it with NormalMatrix.
            // This is safer for non-uniform scaling.
            // So we must use `node.vertices` (original) for normal calc, then transform.

            var origVerts = node.vertices;
            var ov0 = origVerts[face.vertidx[0]];
            var ov1 = origVerts[face.vertidx[1]];
            var ov2 = origVerts[face.vertidx[2]];

            var ax = ov1[0] - ov0[0], ay = ov1[1] - ov0[1], az = ov1[2] - ov0[2];
            var bx = ov2[0] - ov0[0], by = ov2[1] - ov0[1], bz = ov2[2] - ov0[2];

            var rx = ay * bz - az * by;
            var ry = az * bx - ax * bz;
            var rz = ax * by - ay * bx;

            // Normalize raw normal
            var len = Math.sqrt(rx * rx + ry * ry + rz * rz);
            if (len > 0) { len = 1.0 / len; rx *= len; ry *= len; rz *= len; }

            // Transform normal with Normal Matrix (Rotation)
            var nx = n0 * rx + n4 * ry + n8 * rz;
            var ny = n1 * rx + n5 * ry + n9 * rz;
            var nz = n2 * rx + n6 * ry + n10 * rz;

            // Add vertices to mesh
            for (var vi = 0; vi < 3; vi++) {
                var vertIdx = face.vertidx[vi] * 3;
                var tvertIdx = face.tvertidx[vi];

                // Position (Transformed)
                data[offset++] = vert[vertIdx];
                data[offset++] = vert[vertIdx + 1];
                data[offset++] = vert[vertIdx + 2];

                // Normal (Transformed)
                data[offset++] = nx;
                data[offset++] = ny;
                data[offset++] = nz;

                // UV
                data[offset++] = tvertices[tvertIdx * 6 + 4];
                data[offset++] = tvertices[tvertIdx * 6 + 5];

                // Alpha
                data[offset++] = alpha;
            }
            mesh.offset = offset;
        }

        return meshes;
    }

    /**
     * Update model buffer at frame
     */
    function updateModelBuffer(gl, model, frame) {
        var totalSize = 0;
        var meshInfos = [];

        // Cache node map and indices
        if (!model._nodeMap) {
            model._nodeMap = {};
            for (var n = 0; n < model.nodes.length; n++) {
                model.nodes[n]._index = n; // Cache index
                model.nodes[n]._cache = { // Cache computation matrices
                    local: mat4.create(),
                    node: mat4.create(),
                    final: mat4.create()
                };
                model._nodeMap[model.nodes[n].name] = model.nodes[n];
            }
        }
        var nodeMap = model._nodeMap;

        // Cache global matrices array
        if (!model._globalMatrices) {
            model._globalMatrices = new Array(model.nodes.length);
            for (var i = 0; i < model.nodes.length; i++) {
                model._globalMatrices[i] = mat4.create();
            }
        }
        var globalMatrices = model._globalMatrices;
        var box = model.box;
        var box = model.box;

        for (var n = 0; n < model.nodes.length; n++) {
            var node = model.nodes[n];
            var globalMatrix = globalMatrices[n]; // Use cached slot

            // 1. Inherit from Parent
            if (node.parentname && nodeMap[node.parentname] && node.parentname !== node.name) {
                var parentNode = nodeMap[node.parentname];
                var parentIdx = parentNode._index;

                if (parentIdx !== undefined && globalMatrices[parentIdx]) {
                    mat4.copy(globalMatrix, globalMatrices[parentIdx]);
                } else {
                    mat4.identity(globalMatrix);
                }
            } else {
                mat4.identity(globalMatrix);
            }

            // 2. Apply Local Animation (Reuse temp matrix from node cache)
            // We can apply directly to globalMatrix to save temp vars, 
            // BUT we need to match the logic: Global = Parent * Translate * Rotate * Scale
            // So we can chain operations on globalMatrix directly!

            // Translate Position (Animation or Static)
            var animPos = getPositionAtFrame(node.posKeyframes, frame);
            if (animPos) {
                mat4.translate(globalMatrix, globalMatrix, animPos);
            } else {
                mat4.translate(globalMatrix, globalMatrix, node.pos);
            }

            // Rotate (Animation or Static)
            var animRot = getRotationAtFrame(node.rotKeyframes, frame);
            if (animRot) {
                mat4.rotateQuat(globalMatrix, globalMatrix, animRot);
            } else if (node.rotKeyframes && node.rotKeyframes.length > 0) {
                mat4.rotateQuat(globalMatrix, globalMatrix, node.rotKeyframes[0].q);
            } else {
                mat4.rotate(globalMatrix, globalMatrix, node.rotangle, node.rotaxis);
            }

            // Scale (Animation or Static)
            var animScale = getScaleAtFrame(node.scaleKeyFrames, frame);
            if (animScale) {
                mat4.scale(globalMatrix, globalMatrix, animScale);
            } else {
                mat4.scale(globalMatrix, globalMatrix, node.scale);
            }

            // globalMatrix is now the "base" matrix for children.
            // It is already stored in globalMatrices[n] because it IS globalMatrices[n].

            // 3. Calculate FINAL matrix for mesh
            // Use cached final matrix
            var finalNodeMatrix = node._cache.final;
            mat4.identity(finalNodeMatrix);

            // Translate to center/origin first (inverse of global center)
            mat4.translate(finalNodeMatrix, finalNodeMatrix, [-box.center[0], -box.max[1], -box.center[2]]);

            // Apply accumulated global transform
            mat4.multiply(finalNodeMatrix, finalNodeMatrix, globalMatrix);

            if (!node.is_only) {
                mat4.translate(finalNodeMatrix, finalNodeMatrix, node.offset);
            }
            mat4.multiply(finalNodeMatrix, finalNodeMatrix, mat3.toMat4(node.mat3));

            node.finalMatrix = finalNodeMatrix;
        }

        // Compile all nodes at current frame for all instances
        var allMeshes = [];
        for (var ni = 0; ni < model.nodes.length; ni++) {
            for (var ii = 0; ii < model.instances.length; ii++) {

                // Calculate Final Instance Matrix: Instance * NodeFinal
                if (!model.nodes[ni]._cache.instances) model.nodes[ni]._cache.instances = [];
                if (!model.nodes[ni]._cache.instances[ii]) model.nodes[ni]._cache.instances[ii] = mat4.create();
                var finalInstanceMatrix = model.nodes[ni]._cache.instances[ii];

                mat4.multiply(finalInstanceMatrix, model.instances[ii], model.nodes[ni].finalMatrix);

                // Compile with mesh cache
                if (!model._meshCache) model._meshCache = [];
                if (!model._meshCache[ni]) model._meshCache[ni] = [];
                var cachedMeshes = model._meshCache[ni][ii]; // Pass null on first run to create

                var meshes = compileNodeWithMatrix(
                    model.nodes[ni],
                    finalInstanceMatrix, // Pass combined matrix
                    cachedMeshes, // Reusable buffer
                    model.alpha
                );

                if (!cachedMeshes) {
                    model._meshCache[ni][ii] = meshes; // Store new cache
                }

                allMeshes.push(meshes);
            }
        }

        // Calculate total buffer size and create mesh infos
        // Optimization: assume totalSize doesn't change for animated models (vertex count constant)
        var textureData = {};
        var currentTotalSize = 0;

        // Group by texture
        for (var mi = 0; mi < allMeshes.length; mi++) {
            var meshes = allMeshes[mi];
            for (var texId in meshes) {
                if (!textureData[texId]) {
                    textureData[texId] = [];
                }
                textureData[texId].push(meshes[texId].data);
                currentTotalSize += meshes[texId].data.length;
            }
        }

        // Allocate buffer once
        if (!model._gpuBuffer || model._gpuBuffer.length !== currentTotalSize) {
            model._gpuBuffer = new Float32Array(currentTotalSize);
        }
        var buffer = model._gpuBuffer;
        var offset = 0;

        for (var texId in textureData) {
            var arrays = textureData[texId];
            var vertOffset = offset / 9;
            var vertCount = 0;

            for (var ai = 0; ai < arrays.length; ai++) {
                buffer.set(arrays[ai], offset);
                offset += arrays[ai].length;
                vertCount += arrays[ai].length / 9;
            }

            meshInfos.push({
                textureIdx: parseInt(texId),
                vertOffset: vertOffset,
                vertCount: vertCount
            });
        }

        // Update GPU buffer
        if (!model.buffer) {
            model.buffer = gl.createBuffer();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, model.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW);
        // gl.flush(); // Removed flush

        model.meshInfos = meshInfos;
        model.totalVerts = currentTotalSize / 9;
    }

    /**
     * Render animated models
     */
    function render(gl, modelView, projection, normalMat, fog, light, tick) {
        if (_animatedModels.length === 0) {
            return;
        }

        if (!_program) {
            init(gl);
        }

        var uniform = _program.uniform;
        var attribute = _program.attribute;

        gl.useProgram(_program);

        // Bind matrices
        gl.uniformMatrix4fv(uniform.uModelViewMat, false, modelView);
        gl.uniformMatrix4fv(uniform.uProjectionMat, false, projection);
        gl.uniformMatrix3fv(uniform.uNormalMat, false, normalMat);

        // Bind light
        gl.uniform3fv(uniform.uLightDirection, light.direction);
        gl.uniform1f(uniform.uLightOpacity, light.opacity);
        gl.uniform3fv(uniform.uLightAmbient, light.ambient);
        gl.uniform3fv(uniform.uLightDiffuse, light.diffuse);

        // Fog settings
        gl.uniform1i(uniform.uFogUse, fog.use && fog.exist);
        gl.uniform1f(uniform.uFogNear, fog.near);
        gl.uniform1f(uniform.uFogFar, fog.far);
        gl.uniform3fv(uniform.uFogColor, fog.color);

        // Enable attributes
        gl.enableVertexAttribArray(attribute.aPosition);
        gl.enableVertexAttribArray(attribute.aNormal);
        gl.enableVertexAttribArray(attribute.aTextureCoord);
        gl.enableVertexAttribArray(attribute.aAlpha);

        // Textures
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(uniform.uDiffuse, 0);

        // Render each animated model
        for (var m = 0; m < _animatedModels.length; m++) {
            var model = _animatedModels[m];

            // Calculate current animation frame
            var animLen = model.animLen || 1;
            // RSM animations use milliseconds directly, not frames.
            // Tick is in ms, animLen is in ms.
            var frame = tick % animLen;

            // Always update buffer for now to debug
            updateModelBuffer(gl, model, frame);

            if (!model.buffer || model.meshInfos.length === 0) {
                continue;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, model.buffer);

            // Set attribute pointers (stride: 9 floats = 36 bytes)
            gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 36, 0);
            gl.vertexAttribPointer(attribute.aNormal, 3, gl.FLOAT, false, 36, 12);
            gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 36, 24);
            gl.vertexAttribPointer(attribute.aAlpha, 1, gl.FLOAT, false, 36, 32);

            // Draw each texture group
            for (var i = 0; i < model.meshInfos.length; i++) {
                var info = model.meshInfos[i];
                var texture = model.textureObjects[info.textureIdx];

                if (texture) {
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.drawArrays(gl.TRIANGLES, info.vertOffset, info.vertCount);
                }
            }
        }

        // Disable attributes
        gl.disableVertexAttribArray(attribute.aPosition);
        gl.disableVertexAttribArray(attribute.aNormal);
        gl.disableVertexAttribArray(attribute.aTextureCoord);
        gl.disableVertexAttribArray(attribute.aAlpha);
    }

    /**
     * Check if there are animated models
     */
    function hasAnimatedModels() {
        return _animatedModels.length > 0;
    }

    /**
     * Export
     */
    return {
        init: init,
        free: free,
        add: add,
        render: render,
        hasAnimatedModels: hasAnimatedModels
    };
});
