#version 300 es
precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uLightningTex;
uniform float uLightningAlpha;

in vec2 vUv;
out vec4 fragColor;

void main() {
	vec3 scene = texture(uTexture, vUv).rgb;
	vec4 bolt = texture(uLightningTex, vUv);
	fragColor = vec4(scene + bolt.rgb * (bolt.a * uLightningAlpha), 1.0);
}

