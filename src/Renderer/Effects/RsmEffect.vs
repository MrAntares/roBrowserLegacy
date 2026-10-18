#version 300 es
precision highp float;

in vec3 aPosition;
in vec3 aVertexNormal;
in vec2 aTextureCoord;
in float aAlpha;

out vec2 vTextureCoord;
out float vLightWeighting;
out float vAlpha;

uniform mat4 uModelViewMat;
uniform mat4 uProjectionMat;
uniform mat4 uModelMat;
uniform mat3 uNodeNormalMat;
uniform float uApplyNodeNormal;

uniform vec3 uLightDirection;
uniform mat3 uNormalMat;

uniform vec3 uPosition;
uniform float uSize;

void main(void) {

	vec4 position  = vec4(uPosition.x + 0.55, -uPosition.z - 0.5, uPosition.y, 1.0);
	vec3 wp = (uModelMat * vec4(aPosition, 1.0)).xyz;  
	position += vec4(wp.x * uSize, wp.y * -uSize, wp.z * uSize, 0.0);

	gl_Position	 = uProjectionMat * uModelViewMat * position;

	vTextureCoord   = aTextureCoord;
	vAlpha		  = aAlpha;

	vec4 lDirection  = uModelViewMat * vec4( uLightDirection, 0.0);
	vec3 dirVector   = normalize(lDirection.xyz);
	vec3 worldNormal = uApplyNodeNormal > 0.5 ? (uNodeNormalMat * aVertexNormal) : aVertexNormal;
	vec3 viewNormal  = uNormalMat * worldNormal;
	float dotProduct = dot( viewNormal, dirVector );
	vLightWeighting  = max( dotProduct, 0.5 );
}