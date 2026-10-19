#version 300 es
precision highp float;

in vec2 aParam; // x: k / 20.0 (u parameter along ribbon), y: side (0.0 = base/inner, 1.0 = top/outer)
in vec2 aTextureCoord;

out vec2 vTextureCoord;

uniform mat4 uModelViewMat;
uniform mat4 uProjectionMat;
uniform mat4 uModelMat;
uniform float uZIndex;

// Band dynamic parameters
uniform float uProcess;
uniform float uRotStart;
uniform float uBasicAngle;
uniform float uDistance;
uniform float uMaxHeight;
uniform float uRiseAngle;

const float DEG_TO_RAD = 3.1415926535897932384626433832795 / 180.0;
const float MIDDLE = 10.0;
const float STEP = 9.0;

void main(void) {
	float k = aParam.x * 20.0;
	float side = aParam.y;

	// Height profile calculation (equivalent to updateHeightProfile)
	float sinLimit = (90.0 + (k - MIDDLE) * STEP) * DEG_TO_RAD;
	float sinLimitValue = sin(sinLimit);
	float maxPossible = uMaxHeight * sinLimitValue;

	float h;
	if (uProcess <= 90.0) {
		float sinProcess = sin(uProcess * DEG_TO_RAD);
		h = clamp(uMaxHeight * sinLimitValue * sinProcess, 0.0, maxPossible);
	} else {
		h = maxPossible;
	}

	// Angle and base position calculation
	float angle = (uRotStart + k * uBasicAngle) * DEG_TO_RAD;
	float cosAngle = cos(angle);
	float sinAngle = sin(angle);

	float baseX = uDistance * cosAngle;
	float baseZ = uDistance * sinAngle;

	// Top position calculation
	float cosRise = cos(uRiseAngle);
	float sinRise = sin(uRiseAngle);
	float Rx = cosRise * h;
	float Ry = sinRise * h;

	vec3 pos;
	if (side > 0.5) {
		// Top vertex
		pos = vec3(baseX + Rx * cosAngle, -Ry, baseZ + Rx * sinAngle);
	} else {
		// Base vertex
		pos = vec3(baseX, 0.0, baseZ);
	}

	vec4 worldPos = uModelMat * vec4(pos, 1.0);
	gl_Position = uProjectionMat * uModelViewMat * worldPos;
	gl_Position.z -= uZIndex;
	vTextureCoord = aTextureCoord;
}