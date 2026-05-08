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

	// Multi-layered procedural ripples - made slower for "standing water" look
	float wave1 = sin(dist * 25.0 - uTime * 2.0) * 0.5 + 0.5;
	float wave2 = sin(dist * 15.0 + uTime * 1.2 + vWorldPos.x * 0.5) * 0.5 + 0.5;
	float combinedWave = (wave1 * 0.7 + wave2 * 0.3) * (1.0 - dist * 2.0);

	// Distort UV based on waves for a "refraction" feel
	vec2 distortedUV = uv + (uv - center) * combinedWave * 0.035;
	vec4 texColor = texture(uDiffuse, distortedUV);

	if (texColor.a < 0.01) {
		discard;
	}

	// Fake sky reflection (soft blue-white mix on peak waves)
	vec3 skyReflect = vec3(0.5, 0.6, 0.85);
	float reflectFactor = pow(combinedWave, 4.0) * 0.25;
	
	// Deep water tint
	texColor.rgb *= 0.85; 
	texColor.rgb = mix(texColor.rgb, skyReflect, reflectFactor);

	// Dynamic specular highlight (shine) on wave peaks
	float shine = pow(combinedWave, 10.0) * 0.3;
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
