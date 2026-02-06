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

    // Normals are already in World Space (transformed in JS)
    // LightDirection is also World Space.
    // Match logic from Models.js (Static models)
    vec3 normal = normalize(aNormal);
    float lightWeight = max(dot(normal, uLightDirection), 0.0);
    vLightWeighting = (1.0 - uLightOpacity) + lightWeight * uLightOpacity;

    if (uFogUse) {
        float depth = length(position.xyz);
        vFogFactor = clamp((uFogFar - depth) / (uFogFar - uFogNear), 0.0, 1.0);
    } else {
        vFogFactor = 1.0;
    }
}