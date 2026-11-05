#version 300 es
precision mediump float;

uniform sampler2D uTexture;
uniform vec3 uOverlayColor;
uniform float uOverlayAlpha;

in vec2 vUv;
out vec4 fragColor;

void main() {
	vec3 scene = texture(uTexture, vUv).rgb;
	fragColor = vec4(mix(scene, uOverlayColor, uOverlayAlpha), 1.0);
}
