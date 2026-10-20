#version 300 es
precision highp float;

// The quad, shared by every sprite
in vec2 aPosition;
in vec2 aTextureCoord;

// One sprite per instance; see SpriteBatch.js for how these are packed
in vec4 aPositionZIndex;  // xyz world position, w zIndex
in vec4 aOffsetSize;      // xy offset, zw size (both in world units)
in vec4 aColor;
in vec4 aUV;              // xy top-left, zw bottom-right, in the texture
in vec4 aAngleDepthShadowCap; // angle (degrees), depth, shadow, ignore z-index cap (0/1)
in vec3 aSource;          // where the pixels are, atlas layer, palette row (see SpriteBatch.js)

out vec2 vTextureCoord;
flat out vec4 vUV;
flat out vec4 vColor;
flat out float vShadow;
flat out vec3 vSource;    // source, atlas layer, palette row

uniform mat4 uModelViewMat;
uniform mat4 uViewModelMat;
uniform mat4 uProjectionMat;

uniform float uCameraZoom;
uniform bool  uDisableDepthCorrection;

// The same as SpriteRenderer.vs, with the per-sprite uniforms read from the instance.
mat4 Project( mat4 mat, vec3 pos) {

    // xyz = x(-z)y + middle of cell (0.5)
    float x =  pos.x + 0.5;
    float y = -pos.z;
    float z =  pos.y + 0.5;

    // Matrix translation
    mat[3].x += mat[0].x * x + mat[1].x * y + mat[2].x * z;
    mat[3].y += mat[0].y * x + mat[1].y * y + mat[2].y * z;
    mat[3].z += (mat[0].z * x + mat[1].z * y + mat[2].z * z);
    mat[3].w += mat[0].w * x + mat[1].w * y + mat[2].w * z;

    // Spherical billboard
    mat[0].xyz = vec3( 1.0, 0.0, 0.0 );
    mat[1].xyz = vec3( 0.0, 1.0, 0.0 );
    mat[2].xyz = vec3( 0.0, 0.0, 1.0 );

    return mat;
}

vec3 getCameraPosition() {
    return (uViewModelMat * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
}

vec3 getCameraForward() {
    return normalize((uViewModelMat * vec4(0.0, 0.0, -1.0, 0.0)).xyz);
}

void main(void) {
    // Rotation, as mat4.rotateZ(-angle) in SpriteRenderer.js
    float angle = -aAngleDepthShadowCap.x / 180.0 * 3.14159265358979;
    float c = cos(angle);
    float s = sin(angle);
    vec2 scaled = aPosition * aOffsetSize.zw;
    vec4 position = vec4( c * scaled.x - s * scaled.y, s * scaled.x + c * scaled.y, 0.0, 1.0 );
    position.x   += aOffsetSize.x;
    position.y   -= aOffsetSize.y + 0.5;

    mat4 modelView = Project(uModelViewMat, aPositionZIndex.xyz);
    vec4 viewPosition = modelView * position;
    vec4 viewCenter   = modelView * vec4( 0.0, 0.0, 0.0, 1.0 );

    gl_Position = uProjectionMat * viewPosition;

    vec3 cameraPos     = getCameraPosition();
    vec3 cameraForward = getCameraForward();

    if (!uDisableDepthCorrection) {
        // See SpriteRenderer.vs
        vec3 planePoint = (uViewModelMat * viewCenter).xyz;
        vec3 planeNormal = normalize(vec3(cameraForward.x, 0.0, cameraForward.z));
        if (length(planeNormal) < 0.000001) {
            planeNormal = cameraForward;
        }

        vec3 worldVertex = (uViewModelMat * viewPosition).xyz;
        vec3 rayDir      = normalize(worldVertex - cameraPos);
        float denom      = max(dot(planeNormal, rayDir), 0.000001);
        float dist       = dot(planePoint - cameraPos, planeNormal) / denom;

        vec4 planeClip       = uProjectionMat * (uModelViewMat * vec4(cameraPos + rayDir * dist, 1.0));
        float correctedZBase = planeClip.z * (gl_Position.w / max(planeClip.w, 0.000001));

        gl_Position.z = aAngleDepthShadowCap.w > 0.5 ? correctedZBase : min(gl_Position.z, correctedZBase);
    }
    gl_Position.z -= (aPositionZIndex.w * 0.01 + aAngleDepthShadowCap.y) / max(uCameraZoom, 1.0);

    vTextureCoord = aTextureCoord;
    vUV     = aUV;
    vColor  = aColor;
    vShadow = aAngleDepthShadowCap.z;
    vSource = aSource;
}