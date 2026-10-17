#version 300 es
precision highp float;
precision highp int;

precision highp sampler2DArray;

in vec2 aPosition;
in vec2 aTextureCoord;

// Per-instance
in vec3  iPosition;
in vec4  iColor;
in vec2  iSize;
in vec2  iOffset;
in float iZindex;
in float iDepth;
in float iShadow;
in float iAngle;
in float iFlags;
in vec2  iTextSize;
in float iTextureLayer;
in vec2  iUvScale;
in float iPaletteLayer;

out vec2  vTextureCoord;
out vec2  vUv;
out vec4  vColor;
out float vShadow;
out vec2  vTextSize;
flat out int vTextureLayer;
flat out int vPaletteLayer;
flat out int   vFlags;

uniform mat4 uModelViewMat;
uniform mat4 uViewModelMat;
uniform mat4 uProjectionMat;

uniform float uCameraZoom;
uniform float uCameraLatitude;

const float PI = 3.141592653589793;
const int FLAG_DISABLE_DEPTH_CORRECTION = 4;
const int FLAG_IGNORE_ZINDEX_CAP        = 8;

mat4 Project( mat4 mat, vec3 pos) {
    float x =  pos.x + 0.5;
    float y = -pos.z;
    float z =  pos.y + 0.5;
    mat[3].x += mat[0].x * x + mat[1].x * y + mat[2].x * z;
    mat[3].y += mat[0].y * x + mat[1].y * y + mat[2].y * z;
    mat[3].z += (mat[0].z * x + mat[1].z * y + mat[2].z * z);
    mat[3].w += (mat[0].w * x + mat[1].w * y + mat[2].w * z);
    mat[0].xyz = vec3( 1.0, 0.0, 0.0 );
    mat[1].xyz = vec3( 0.0, 1.0, 0.0 );
    mat[2].xyz = vec3( 0.0, 0.0, 1.0 );
    return mat;
}

void main(void) {
    float rad = -iAngle * PI / 180.0;
    float c = cos(rad);
    float s = sin(rad);

    vec2 local = vec2(aPosition.x * iSize.x, aPosition.y * iSize.y);
    vec2 rotated;
    rotated.x = local.x * c - local.y * s;
    rotated.y = local.x * s + local.y * c;

    vec4 position = vec4(rotated, 0.0, 1.0);
    position.x += iOffset.x;
    position.y -= iOffset.y + 0.5;

    mat4 modelView = Project(uModelViewMat, iPosition);
    vec4 viewPosition = modelView * position;
    vec4 viewCenter   = modelView * vec4( 0.0, 0.0, 0.0, 1.0 );

    gl_Position = uProjectionMat * viewPosition;

    int flags = int(iFlags);
    bool disableDepthCorrection = (flags & FLAG_DISABLE_DEPTH_CORRECTION) != 0;
    bool ignoreZindexCap        = (flags & FLAG_IGNORE_ZINDEX_CAP) != 0;

    if (!disableDepthCorrection) {
        vec3 cameraPos     = (uViewModelMat * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        vec3 cameraForward = normalize((uViewModelMat * vec4(0.0, 0.0, -1.0, 0.0)).xyz);

        vec3 planePoint  = (uViewModelMat * viewCenter).xyz;
        vec3 planeNormal = normalize(vec3(cameraForward.x, 0.0, cameraForward.z));
        if (length(planeNormal) < 0.000001) {
            planeNormal = cameraForward;
        }

        vec3  worldVertex = (uViewModelMat * viewPosition).xyz;
        vec3  rayDir      = normalize(worldVertex - cameraPos);
        float denom       = max(dot(planeNormal, rayDir), 0.000001);
        float dist        = dot(planePoint - cameraPos, planeNormal) / denom;

        vec4  planeClip      = uProjectionMat * (uModelViewMat * vec4(cameraPos + rayDir * dist, 1.0));
        float correctedZBase = planeClip.z * (gl_Position.w / max(planeClip.w, 0.000001));

        gl_Position.z = ignoreZindexCap ? correctedZBase : min(gl_Position.z, correctedZBase);
    }
    gl_Position.z -= (iZindex * 0.01 + iDepth) / max(uCameraZoom, 1.0);

    vTextureCoord = aTextureCoord;
    vUv           = aTextureCoord * iUvScale;
    vColor        = iColor;
    vShadow       = iShadow;
    vTextSize     = iTextSize;
    vTextureLayer = int(iTextureLayer);
    vPaletteLayer = int(iPaletteLayer);
    vFlags        = flags;
}