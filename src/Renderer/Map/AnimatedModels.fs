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