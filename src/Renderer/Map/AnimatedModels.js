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
    var Session = require('Engine/SessionStorage');
    var GraphicsSettings = require('Preferences/Graphics');
    var _vertexShader = require('text!./AnimatedModels.vs');
    var _fragmentShader = require('text!./AnimatedModels.fs');

    var mat3 = glMatrix.mat3;
    var mat4 = glMatrix.mat4;
    var vec3 = glMatrix.vec3;
    var quat = glMatrix.quat;

    /**
     * Scratchpads to evade GC (Garbage Collector)
     */
    var _tempVec3 = vec3.create();
    var _tempVec3Scale = vec3.create();
    var _tempQuat = quat.create();
    var _tempMat4 = mat4.create();

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
            uLightEnv: gl.getUniformLocation(_program, 'uLightEnv'),
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
            if (model.vao) {
                gl.deleteVertexArray(model.vao);
            }
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

    function isNodeStatic(node) {
        return (!node.rotKeyframes || node.rotKeyframes.length === 0) &&
            (!node.posKeyframes || node.posKeyframes.length === 0) &&
            (!node.scaleKeyFrames || node.scaleKeyFrames.length === 0);
    }

    /**
     * Add an animated model
     */
    function add(gl, modelData) {
        if (!modelData || !modelData.nodes || modelData.nodes.length === 0) {
            return;
        }

        if (!_program) {
            init(gl);
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
        var totalAnimationLength = 0;
        var hasAnyAnimation = false;

        for (var n = 0; n < modelData.nodes.length; n++) {
            var srcNode = modelData.nodes[n];
            if (!isNodeStatic(srcNode)) hasAnyAnimation = true;
            var node = {
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
                scaleKeyFrames: srcNode.scaleKeyFrames || [],
                _isStatic: !hasAnyAnimation,
                _index: n,
                _cache: {
                    local: mat4.create(),
                    final: mat4.create(),
                    // Cache for instances final matrices
                    instances: new Array(instances.length)
                }
            };
            // Pre-calculate local matrix for static nodes
            if (node._isStatic) {
                var local = mat4.create();
                mat4.identity(local);
                mat4.translate(local, local, node.pos);
                mat4.rotate(local, local, node.rotangle, node.rotaxis);
                mat4.scale(local, local, node.scale);
                node._staticLocalMatrix = local;
            }
            // Initialize instance cache
            for(var k=0; k<instances.length; k++) {
                node._cache.instances[k] = mat4.create();
            }

            if (node.rotKeyframes) {
                for (var rk = 0; rk < node.rotKeyframes.length; rk++){ 
                    var kf = node.rotKeyframes[rk];
                    totalAnimationLength = Math.max(totalAnimationLength, kf.frame || 0);

                    if (kf.q) {
                        kf._quat = quat.fromValues(kf.q[0], kf.q[1], kf.q[2], kf.q[3]);
                    }
                }
            }

            if (node.posKeyframes) {
                for (var pk = 0; pk < node.posKeyframes.length; pk++){ 
                    var kf = node.posKeyframes[pk];
                    totalAnimationLength = Math.max(totalAnimationLength, kf.frame || 0);
                    kf._vec = vec3.fromValues(kf.px, kf.py, kf.pz);
                }
            }

            if (node.scaleKeyFrames) {
                for (var sk = 0; sk < node.scaleKeyFrames.length; sk++){ 
                    var kf = node.scaleKeyFrames[sk];

                    totalAnimationLength = Math.max(totalAnimationLength, kf.Frame || 0);
                    kf._vec = vec3.fromValues(kf.Scale[0], kf.Scale[1], kf.Scale[2]);
                }
            }

            nodes.push(node);
        }

        // Calculate animLen from keyframes if not set
        var animLen = modelData.animLen || 0;

        // Build Mesh Layout Plan (Group by Texture -> Node -> Instance)
        // This prevents rebuilding the array structure every frame.
        var textureGroups = {};
        var totalFloats = 0;

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
        // Calculate size per texture
        // Iterate all nodes to find which textures they use and how many faces
        for (var n = 0; n < nodes.length; n++) {
            var node = nodes[n];
            // Count faces per texture for this node
            var facesPerTex = {};
            for (var f = 0; f < node.faces.length; f++) {
                var tid = node.textures[node.faces[f].texid];
                if (!facesPerTex[tid]) facesPerTex[tid] = 0;
                facesPerTex[tid]++;
            }

            // Add to global texture groups
            for (var tid in facesPerTex) {
                if (!textureGroups[tid]) textureGroups[tid] = { count: 0, writePlan: [] };
                
                // For every instance of this node
                for (var inst = 0; inst < instances.length; inst++) {
                    var vertCount = facesPerTex[tid] * 3; // 3 verts per face
                    var floatCount = vertCount * 9; // 9 floats per vert (3 pos, 3 norm, 2 uv, 1 alpha)
                    
                    // Create a write instruction
                    textureGroups[tid].writePlan.push({
                        nodeIndex: n,
                        instanceIndex: inst,
                        faceCount: facesPerTex[tid],
                        startFaceIndex: 0, // Need to find where faces for this tex start in node.faces? No, faces are mixed.
                        // We will need to iterate faces in update and pick matches
                        targetOffset: 0 // Will be calculated below
                    });
                    
                    textureGroups[tid].count += vertCount;
                    totalFloats += floatCount;
                }
            }
        }

        var currentOffset = 0;
        var meshInfos = [];

        for (var tid in textureGroups) {
            var group = textureGroups[tid];
            var startOffset = currentOffset;
            
            // Record where each sub-mesh writes
            for (var wp = 0; wp < group.writePlan.length; wp++) {
                var plan = group.writePlan[wp];
                plan.targetOffset = currentOffset;
                currentOffset += (plan.faceCount * 3 * 9);
            }

            meshInfos.push({
                textureIdx: parseInt(tid),
                vertOffset: startOffset / 9,
                vertCount: (currentOffset - startOffset) / 9
            });
        }

        // Create Model Object
        var animModel = {
            filename: modelData.filename,
            animLen: animLen,
            fps: modelData.frameRatePerSecond || 30,
            shadeType: modelData.shadeType,
            alpha: modelData.alpha,
            textures: modelData.textures,
            instances: instances,
            nodes: nodes,
            box: {
                center: new Float32Array(modelData.box.center),
                max: new Float32Array(modelData.box.max),
                min: new Float32Array(modelData.box.min),
                offset: new Float32Array(modelData.box.offset),
                range: new Float32Array(modelData.box.range)
            },
            textureObjects: {},
            
            // WebGL & Caching
            buffer: gl.createBuffer(),
            _gpuBuffer: new Float32Array(totalFloats), // Allocate once
            meshInfos: meshInfos,
            writePlans: textureGroups, // Instructions for update
            
            // State
            lastFrame: -1,
            lastAnimFrame: -1,
            staticModel: !hasAnyAnimation,
            _nodeMap: {},
            _globalMatrices: new Array(nodes.length)
        };

        // Cache Node Map
        for(var n=0; n<nodes.length; n++) {
            animModel._nodeMap[nodes[n].name] = nodes[n];
            animModel._globalMatrices[n] = mat4.create();
        }

        // Allocate Buffer on GPU immediately (Empty but sized)
        gl.bindBuffer(gl.ARRAY_BUFFER, animModel.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, animModel._gpuBuffer.byteLength, gl.DYNAMIC_DRAW);

        // Load textures
        for (var t = 0; t < modelData.textures.length; t++) {
            var texturePath = 'data\\texture\\' + modelData.textures[t];
            loadTexture(gl, animModel, texturePath, t);
        }

        animModel.vao = gl.createVertexArray();
        gl.bindVertexArray(animModel.vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, animModel.buffer);

        var attribute = _program.attribute;
        var stride = 36; // 9 floats * 4 bytes

        gl.enableVertexAttribArray(attribute.aPosition);
        gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, stride, 0);

        gl.enableVertexAttribArray(attribute.aNormal);
        gl.vertexAttribPointer(attribute.aNormal, 3, gl.FLOAT, false, stride, 12);

        gl.enableVertexAttribArray(attribute.aTextureCoord);
        gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, stride, 24);

        gl.enableVertexAttribArray(attribute.aAlpha);
        gl.vertexAttribPointer(attribute.aAlpha, 1, gl.FLOAT, false, stride, 32);

        gl.bindVertexArray(null);

        _animatedModels.push(animModel);
        
        // Force first update to populate buffer
        updateModelBuffer(gl, animModel, 0, true);
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

    function getPositionAtFrame(keyframes, frame, out) {
        if (!keyframes || keyframes.length === 0) return null;
        if (keyframes.length === 1) return keyframes[0]._vec;

        var prev = keyframes[0], next = null;
        for (var i = 0; i < keyframes.length; i++) {
            if (keyframes[i].frame > frame) {
                next = keyframes[i];
                break;
            }
            prev = keyframes[i];
        }

        if (!next) return prev._vec;
        var t = (frame - prev.frame) / (next.frame - prev.frame);
        return vec3.lerp(out, prev._vec, next._vec, t);
    }

    function getRotationAtFrame(keyframes, frame, out) {
        if (!keyframes || keyframes.length === 0) return null;
        if (keyframes.length === 1) return keyframes[0]._quat;

        var prev = keyframes[0], next = null;
        for (var i = 0; i < keyframes.length; i++) {
            if (keyframes[i].frame > frame) {
                next = keyframes[i];
                break;
            }
            prev = keyframes[i];
        }

        if (!next) return prev._quat;
        var t = (frame - prev.frame) / (next.frame - prev.frame);
        return quat.slerp(out, prev._quat, next._quat, t);
    }

    function getScaleAtFrame(keyframes, frame, out) {
        if (!keyframes || keyframes.length === 0) return null;
        if (keyframes.length === 1) return keyframes[0]._vec;

        var prev = keyframes[0], next = null;
        for (var i = 0; i < keyframes.length; i++) {
            var f = (typeof keyframes[i].Frame !== 'undefined') ? keyframes[i].Frame : keyframes[i].frame;
            if (f > frame) {
                next = keyframes[i];
                break;
            }
            prev = keyframes[i];
        }

        if (!next) return prev._vec;
        
        var fPrev = (typeof prev.Frame !== 'undefined') ? prev.Frame : prev.frame;
        var fNext = (typeof next.Frame !== 'undefined') ? next.Frame : next.frame;
        
        var t = (frame - fPrev) / (fNext - fPrev);
        return vec3.lerp(out, prev._vec, next._vec, t);
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
     * Transform a specific node's geometry for a specific texture and instance
     * Writes directly to the monolithic buffer
     */
    function transformAndWrite(node, finalMatrix, textureId, offset, buffer, alpha) {
        // Extract Rotation for normals
        // Optimization: Don't use mat4.extractRotation/invert/transpose every face.
        // Just use the upper 3x3 of finalMatrix if uniform scaling.
        // For non-uniform, we strictly need normal matrix, but RSMs usually handle normals simpler.
        // Let's stick to standard logic: Extract rotation from finalMatrix.
        
        var normalMat = node._cache.normalMat || mat4.create();
        node._cache.normalMat = normalMat;
        mat4.extractRotation(normalMat, finalMatrix);

        var m = finalMatrix;
        var n = normalMat;
        
        // Cache Matrix access
        var m0=m[0], m1=m[1], m2=m[2], m4=m[4], m5=m[5], m6=m[6], m8=m[8], m9=m[9], m10=m[10], m12=m[12], m13=m[13], m14=m[14];
        var n0=n[0], n1=n[1], n2=n[2], n4=n[4], n5=n[5], n6=n[6], n8=n[8], n9=n[9], n10=n[10];

        var faces = node.faces;
        var vertices = node.vertices;
        var tvertices = node.tvertices;
        var textures = node.textures;
        var output = buffer;
        var o = offset;

        // Iterate faces, process only those matching textureId
        for (var f = 0; f < faces.length; f++) {
            var face = faces[f];
            if (textures[face.texid] !== textureId) continue;

            // Compute Face Normal (using Original Vertices)
            var v0 = vertices[face.vertidx[0]];
            var v1 = vertices[face.vertidx[1]];
            var v2 = vertices[face.vertidx[2]];

            var ax = v1[0] - v0[0], ay = v1[1] - v0[1], az = v1[2] - v0[2];
            var bx = v2[0] - v0[0], by = v2[1] - v0[1], bz = v2[2] - v0[2];

            var nx = ay * bz - az * by;
            var ny = az * bx - ax * bz;
            var nz = ax * by - ay * bx;

            // Normalize
            var len = nx * nx + ny * ny + nz * nz;
            if (len > 0) { len = 1.0 / Math.sqrt(len); nx *= len; ny *= len; nz *= len; }

            // Transform Normal
            var tnx = n0 * nx + n4 * ny + n8 * nz;
            var tny = n1 * nx + n5 * ny + n9 * nz;
            var tnz = n2 * nx + n6 * ny + n10 * nz;

            // Process 3 Vertices
            for (var vi = 0; vi < 3; vi++) {
                var vIdx = face.vertidx[vi];
                var tIdx = face.tvertidx[vi];
                
                var vx = vertices[vIdx][0];
                var vy = vertices[vIdx][1];
                var vz = vertices[vIdx][2];

                // Position (Transformed)
                output[o++] = m0 * vx + m4 * vy + m8 * vz + m12;
                output[o++] = m1 * vx + m5 * vy + m9 * vz + m13;
                output[o++] = m2 * vx + m6 * vy + m10 * vz + m14;

                // Normal (Transformed)
                output[o++] = tnx;
                output[o++] = tny;
                output[o++] = tnz;

                // UV
                output[o++] = tvertices[tIdx * 6 + 4];
                output[o++] = tvertices[tIdx * 6 + 5];

                // Alpha
                output[o++] = alpha;
            }
        }
    }

    /**
     * Update model buffer at frame
     */
    function updateModelBuffer(gl, model, frame, force) {
        var frameDuration = 1000 / (model.fps/(GraphicsSettings.culling ? 2 : 1.14));
        var currentAnimFrame = Math.floor(frame / frameDuration);

        if (!force && model.lastAnimFrame === currentAnimFrame && !model.staticModel) {
           return;
        }

        if (model.staticModel && model.lastAnimFrame !== -1 && !force) {
              return;
        }

        model.lastAnimFrame = currentAnimFrame;
        model.lastFrame = frame;

        var box = model.box;
        var nodeMap = model._nodeMap;
        var globalMatrices = model._globalMatrices;

        // 1. Update Matrix Hierarchy
        for (var n = 0; n < model.nodes.length; n++) {
            var node = model.nodes[n];
            var globalMatrix = globalMatrices[n];

            // Parent Transform
            if (node.parentname && nodeMap[node.parentname] && node.parentname !== node.name) {
                var parentIdx = nodeMap[node.parentname]._index;
                mat4.copy(globalMatrix, globalMatrices[parentIdx]);
            } else {
                mat4.identity(globalMatrix);
            }

            // Local Transform
            if (node._isStatic) {
                // Optimization: Use precalculated local matrix
                mat4.multiply(globalMatrix, globalMatrix, node._staticLocalMatrix);
            } else {
                var animPos = getPositionAtFrame(node.posKeyframes, frame, _tempVec3);
                mat4.translate(globalMatrix, globalMatrix, animPos || node.pos);

                var animRot = getRotationAtFrame(node.rotKeyframes, frame, _tempQuat);
                if (animRot) {
                    mat4.fromQuat(_tempMat4, animRot);
                    mat4.multiply(globalMatrix, globalMatrix, _tempMat4);
                } else {
                    mat4.rotate(globalMatrix, globalMatrix, node.rotangle, node.rotaxis);
                }

                var animScale = getScaleAtFrame(node.scaleKeyFrames, frame, _tempVec3Scale);
                mat4.scale(globalMatrix, globalMatrix, animScale || node.scale);
            }

            // Final Node Matrix (Center correction + Offset)
            var finalNodeMatrix = node._cache.final;
            mat4.identity(finalNodeMatrix);
            mat4.translate(finalNodeMatrix, finalNodeMatrix, [-box.center[0], -box.max[1], -box.center[2]]);
            mat4.multiply(finalNodeMatrix, finalNodeMatrix, globalMatrix); // Apply hierarchy

            if (!node.is_only) {
                mat4.translate(finalNodeMatrix, finalNodeMatrix, node.offset);
            }
            mat4.multiply(finalNodeMatrix, finalNodeMatrix, mat3.toMat4(node.mat3));
            
            // Cache for step 2
            node.finalMatrix = finalNodeMatrix;
        }

        // 2. Pre-calculate Instance Matrices
        // We do this to avoid recalculating Node * Instance for every texture group
        for (var n = 0; n < model.nodes.length; n++) {
            var node = model.nodes[n];
            for (var i = 0; i < model.instances.length; i++) {
                // Instance Final = InstanceWorld * NodeFinal
                mat4.multiply(node._cache.instances[i], model.instances[i], node.finalMatrix);
            }
        }

        // 3. Write Geometry to Buffer (Using WritePlan)
        // This ensures the buffer is ordered by Texture, maximizing batching
        var buffer = model._gpuBuffer;
        var writePlans = model.writePlans;

        for (var tid in writePlans) {
            var group = writePlans[tid];
            var plans = group.writePlan;
            var textureId = parseInt(tid);

            for (var p = 0; p < plans.length; p++) {
                var plan = plans[p];
                var node = model.nodes[plan.nodeIndex];
                var finalInstanceMatrix = node._cache.instances[plan.instanceIndex];

                transformAndWrite(
                    node,
                    finalInstanceMatrix,
                    textureId,
                    plan.targetOffset,
                    buffer,
                    model.alpha
                );
            }
        }

        // 4. Upload to GPU
        // Use bufferSubData to avoid reallocation
        gl.bindBuffer(gl.ARRAY_BUFFER, model.buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, buffer);
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
	gl.uniform3fv(uniform.uLightEnv, light.env);

        // Fog settings
        gl.uniform1i(uniform.uFogUse, fog.use && fog.exist);
        gl.uniform1f(uniform.uFogNear, fog.near);
        gl.uniform1f(uniform.uFogFar, fog.far);
        gl.uniform3fv(uniform.uFogColor, fog.color);

        // Textures
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(uniform.uDiffuse, 0);

        var playerPos = Session.Entity.position;

        // Render each animated model
        for (var m = 0; m < _animatedModels.length; m++) {
            var model = _animatedModels[m];
            var frame = tick % (model.animLen || 1);

            updateModelBuffer(gl, model, frame, false);

            if (!model.buffer || model.meshInfos.length === 0) continue;

            gl.bindVertexArray(model.vao);

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
        gl.bindVertexArray(null);
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
