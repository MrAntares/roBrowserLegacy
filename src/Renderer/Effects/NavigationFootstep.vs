#version 300 es
precision highp float;

in vec2 aPosition;
out vec2 vLocal;
out vec2 vTextureCoord;

uniform mat4 uModelViewMat;
uniform mat4 uProjectionMat;
uniform vec3 uPosition;
uniform float uSize;
uniform float uAngle;

void main(void) {
    float c = cos(uAngle);
    float s = sin(uAngle);
    vec2 local = aPosition * uSize;
    vec2 rotated = vec2(local.x * c - local.y * s, local.x * s + local.y * c);

    vec4 position = vec4(
        uPosition.x + 0.5 + rotated.x,
        -uPosition.z,
        uPosition.y + 0.5 + rotated.y,
        1.0
    );

    gl_Position = uProjectionMat * uModelViewMat * position;
    gl_Position.z -= 0.012;
    vLocal = aPosition;
    vTextureCoord = vec2((aPosition.x + 1.0) * 0.5, 1.0 - ((aPosition.y + 1.0) * 0.5));
}
