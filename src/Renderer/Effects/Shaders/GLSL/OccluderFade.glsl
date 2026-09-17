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

// The faded region is a truncated cone from the eye to the focus: full radius
// at the eye, this fraction of it at the focus, nothing behind the focus.
const float OCCLUDER_FADE_TIP = 0.4;

// Distance (cells) before the focus over which the cone closes
const float OCCLUDER_FADE_END = 0.5;

// x: distance to the eye->focus axis, y: signed distance past the focus along it,
// z: cone radius at that position
vec3 occluderFadeCone(vec3 worldPos) {
	vec3 axis = uOccluderFadeFocus - uOccluderFadeEye;
	vec3 rel  = worldPos - uOccluderFadeEye;
	float len  = max(length(axis), 0.01);
	float proj = dot(rel, axis) / len;
	float t    = clamp(proj / len, 0.0, 1.0);
	float r    = uOccluderFadeRadius * mix(1.0, OCCLUDER_FADE_TIP, t);
	return vec3(length(rel - axis * t), proj - len, r);
}

// 0.0 = untouched, 1.0 = fully inside the cone between eye and focus
float occluderFadeAmount(vec3 worldPos) {
	vec3 c = occluderFadeCone(worldPos);
	float radial = 1.0 - smoothstep(c.z * 0.5, c.z, c.x);
	float along  = 1.0 - smoothstep(-OCCLUDER_FADE_END, 0.0, c.y);
	return radial * along * uOccluderFadeStrength;
}

// Applies the fade to the fragment alpha. Returns false when the fragment must be discarded.
bool occluderFade(vec3 worldPos, inout float alpha) {
	if (uOccluderFadeMode == 0) {
		return true;
	}

	if (uOccluderFadeMode == 4) {
		vec3 c = occluderFadeCone(worldPos);
		// stop short of the focus so the floor under the entity does not count
		return c.x < uOccluderFadeRadius && c.y < -0.5;
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
