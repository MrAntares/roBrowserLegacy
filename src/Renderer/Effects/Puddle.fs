#version 300 es
precision highp float;

in vec2 vTextureCoord;
in vec3 vWorldPos;
out vec4 fragColor;

uniform sampler2D uDiffuse;
uniform vec4 uColor;
uniform float uTime;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform bool uFogUse;

void main(void) {
	vec2 uv = vTextureCoord;
	vec2 center = vec2(0.5, 0.5);
	float dist = distance(uv, center);

	// Multi-layered procedural ripples
	float wave1 = sin(dist * 40.0 - uTime * 6.0) * 0.5 + 0.5;
	float wave2 = sin(dist * 25.0 + uTime * 3.5 + vWorldPos.x * 2.0) * 0.5 + 0.5;
	float combinedWave = (wave1 * 0.7 + wave2 * 0.3) * (1.0 - dist * 2.0);

	// Distort UV based on waves for a "refraction" feel
	vec2 distortedUV = uv + (uv - center) * combinedWave * 0.04;
	vec4 texColor = texture(uDiffuse, distortedUV);

	if (texColor.a < 0.01) {
		discard;
	}

	// Dynamic specular highlight (shine) on wave peaks
	float shine = pow(combinedWave, 6.0) * 0.45;
	texColor.rgb += vec3(shine);

	// Final color with alpha from uColor
	vec4 finalColor = texColor * uColor;

	// Apply Fog
	if (uFogUse) {
		float depth = gl_FragCoord.z / gl_FragCoord.w;
		float fogFactor = smoothstep(uFogNear, uFogFar, depth);
		finalColor.rgb = mix(finalColor.rgb, uFogColor, fogFactor);
	}

	fragColor = finalColor;
}
