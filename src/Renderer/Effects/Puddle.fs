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
uniform vec2 uPlayerPos;
uniform vec3 uCameraPos;

void main(void) {
	vec2 uv = vTextureCoord;
	vec2 center = vec2(0.5, 0.5);
	float dist = distance(uv, center);

	// Multi-layered procedural ripples - made slower for "standing water" look
	float wave1 = sin(dist * 20.0 - uTime * 2.2) * 0.5 + 0.5;
	float wave2 = sin(dist * 12.0 + uTime * 1.4 + vWorldPos.x * 0.5) * 0.5 + 0.5;
	float combinedWave = (wave1 * 0.7 + wave2 * 0.3) * (1.0 - dist * 2.0);

	// Distort UV based on waves for a "refraction" feel
	vec2 distortedUV = uv + (uv - center) * combinedWave * 0.035;
	vec4 texColor = texture(uDiffuse, distortedUV);

	if (texColor.a < 0.01) {
		discard;
	}

	// Fresnel Effect: Water reflects more at shallow angles
	vec3 viewDir = normalize(uCameraPos - vWorldPos);
	float fresnel = pow(1.0 - max(0.0, dot(viewDir, vec3(0.0, 1.0, 0.0))), 3.5);

	// Player Interaction Ripple
	float playerDist = distance(vWorldPos.xz, uPlayerPos);
	float playerRipple = 0.0;
	if (playerDist < 1.8) {
		playerRipple = sin(playerDist * 15.0 - uTime * 6.0) * (1.0 - playerDist / 1.8) * 0.15;
	}

	// Combine all waves
	float finalWave = combinedWave + playerRipple;

	// Fake sky reflection (Bright Platinum mix)
	vec3 skyReflect = vec3(0.88, 0.92, 1.0); 
	float reflectFactor = (pow(max(0.0, finalWave), 2.2) * 0.4 + fresnel * 0.5) * 0.8;
	
	// Brighter deep water tone
	texColor.rgb *= 0.98; 
	texColor.rgb = mix(texColor.rgb, skyReflect, reflectFactor);

	// Stronger dynamic specular highlight (shine)
	float shine = pow(max(0.0, finalWave), 6.0) * 0.6 + fresnel * 0.1;
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
