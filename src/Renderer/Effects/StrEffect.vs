#version 300 es
precision highp float;

in vec2 aPosition;

out vec2 vTextureCoord;

uniform mat4 uModelViewMat;
uniform mat4 uProjectionMat;

uniform float uSpriteAngle;
uniform vec4 uCornerX;
uniform vec4 uCornerY;
uniform vec3 uSpritePosition;
uniform vec2 uSpriteOffset;
uniform float uVerticalBase;

const float pixelRatio = 1.0 / 35.0;

mat4 Project( mat4 mat, vec3 pos) {

	// xyz = x(-z)y + middle of cell (0.5)
	float x =  pos.x + 0.5;
	float y = -pos.z;
	float z =  pos.y + 0.5;

	// Matrix translation
	mat[3].x += mat[0].x * x + mat[1].x * y + mat[2].x * z;
	mat[3].y += mat[0].y * x + mat[1].y * y + mat[2].y * z;
	mat[3].z += mat[0].z * x + mat[1].z * y + mat[2].z * z;
	mat[3].w += mat[0].w * x + mat[1].w * y + mat[2].w * z;

	// Spherical billboard
	mat[0].xyz = vec3( 1.0, 0.0, 0.0 );
	mat[1].xyz = vec3( 0.0, 1.0, 0.0 );
	mat[2].xyz = vec3( 0.0, 0.0, 1.0 );

	return mat;
}

void main(void) {
	vTextureCoord = aPosition;

	int corner = int(aPosition.x + aPosition.y * 2.0);
	float r = radians(-uSpriteAngle);
	vec2 p = vec2(uCornerX[corner] * pixelRatio, -uCornerY[corner] * pixelRatio);
	vec4 position = vec4(p.x * cos(r) - p.y * sin(r), p.x * sin(r) + p.y * cos(r), 0.0, 1.0);
	position.x   += uSpriteOffset.x * pixelRatio;
	position.y   -= uSpriteOffset.y * pixelRatio + uVerticalBase;

	// Project to camera plane
	gl_Position    = uProjectionMat * Project(uModelViewMat, uSpritePosition) * position;
	gl_Position.z -= 0.1;
}