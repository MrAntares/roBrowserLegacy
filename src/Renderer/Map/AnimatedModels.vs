#version 300 es  
precision highp float;  
  
in vec3 aPosition;  
in vec3 aNormal;  
in vec2 aTextureCoord;  
in float aAlpha;  
in float aMatrixIndex;  
  
out vec2 vTextureCoord;  
out float vLightWeighting;  
out float vAlpha;  
out float vFogFactor;  
out vec3 vWorldPos;  
  
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
  
uniform highp sampler2D uMatrixTexture;  
  
mat4 fetchMatrix(int index) {  
    int pixelIndex = index * 4;  
    vec4 row0 = texelFetch(uMatrixTexture, ivec2(pixelIndex, 0), 0);  
    vec4 row1 = texelFetch(uMatrixTexture, ivec2(pixelIndex + 1, 0), 0);  
    vec4 row2 = texelFetch(uMatrixTexture, ivec2(pixelIndex + 2, 0), 0);  
    vec4 row3 = texelFetch(uMatrixTexture, ivec2(pixelIndex + 3, 0), 0);  
    return mat4(row0, row1, row2, row3);  
}  
  
void main(void) {  
    mat4 M = fetchMatrix(int(aMatrixIndex));  
    vec4 worldPos = M * vec4(aPosition, 1.0);  
    vec4 position = uModelViewMat * worldPos;  
    gl_Position = uProjectionMat * position;  
  
    vTextureCoord = aTextureCoord;  
    vAlpha = aAlpha;  
    vWorldPos = worldPos.xyz;  
  
    vec3 c0 = normalize(M[0].xyz);  
    vec3 c1 = normalize(M[1].xyz);  
    vec3 c2 = normalize(M[2].xyz);  
    mat3 rotMat = mat3(c0, c1, c2);  
    vec3 normal = normalize(rotMat * aNormal);  
  
    float lightWeight = max(dot(normal, uLightDirection), 0.0);  
    vLightWeighting = (1.0 - uLightOpacity) + lightWeight * uLightOpacity;  
  
    if (uFogUse) {  
        float depth = length(position.xyz);  
        vFogFactor = clamp((uFogFar - depth) / (uFogFar - uFogNear), 0.0, 1.0);  
    } else {  
        vFogFactor = 1.0;  
    }  
}