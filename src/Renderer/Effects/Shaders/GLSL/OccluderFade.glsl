// Fades world geometry lying between the camera and the followed entity
// (third person camera). Included by the model fragment shaders.
//
// uOccluderFadeMode:
//   0 - disabled
//   1 - dither (screen-door, single opaque pass)
//   2 - alpha, opaque pass: discard fragments inside the fade capsule
//   3 - alpha, blend pass: draw only fragments inside the fade capsule, translucent
//   4 - line of sight query: keep only fragments inside the (narrow) capsule,
//       used with an occlusion query to detect geometry covering the entity

uniform int   uOccluderFadeMode;
uniform vec3  uOccluderFadeEye;
uniform vec3  uOccluderFadeFocus;
uniform float uOccluderFadeRadius;
uniform float uOccluderFadeOpacity;
uniform float uOccluderFadeStrength;

const float OCCLUDER_FADE_BAYER[16] = float[16](
	 0.0,  8.0,  2.0, 10.0,
	12.0,  4.0, 14.0,  6.0,
	 3.0, 11.0,  1.0,  9.0,
	15.0,  7.0, 13.0,  5.0
);

// Distance to the eye->focus segment (x) and normalized position along it (y)
vec2 occluderFadeCapsule(vec3 worldPos) {
	vec3 axis = uOccluderFadeFocus - uOccluderFadeEye;
	vec3 rel  = worldPos - uOccluderFadeEye;
	float len2 = max(dot(axis, axis), 0.0001);
	float t    = clamp(dot(rel, axis) / len2, 0.0, 1.0);
	return vec2(length(rel - axis * t), t);
}

// 0.0 = untouched, 1.0 = fully inside the capsule between eye and focus
float occluderFadeAmount(vec3 worldPos) {
	vec2 c = occluderFadeCapsule(worldPos);
	float radial = 1.0 - smoothstep(uOccluderFadeRadius * 0.5, uOccluderFadeRadius, c.x);
	float along  = 1.0 - smoothstep(0.85, 1.0, c.y);
	return radial * along * uOccluderFadeStrength;
}

// Applies the fade to the fragment alpha. Returns false when the fragment must be discarded.
bool occluderFade(vec3 worldPos, inout float alpha) {
	if (uOccluderFadeMode == 0) {
		return true;
	}

	if (uOccluderFadeMode == 4) {
		vec2 c = occluderFadeCapsule(worldPos);
		return c.x < uOccluderFadeRadius && c.y < 0.97;
	}

	float fade = occluderFadeAmount(worldPos);
	float visibility = 1.0 - fade * (1.0 - uOccluderFadeOpacity);

	if (uOccluderFadeMode == 1) {
		ivec2 p = ivec2(gl_FragCoord.xy) & 3;
		float threshold = (OCCLUDER_FADE_BAYER[p.x + p.y * 4] + 0.5) / 16.0;
		return visibility > threshold;
	}

	if (uOccluderFadeMode == 2) {
		return fade < 0.01;
	}

	if (fade < 0.01) {
		return false;
	}
	alpha *= visibility;
	return true;
}
