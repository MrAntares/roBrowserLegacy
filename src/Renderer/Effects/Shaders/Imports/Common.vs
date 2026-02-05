#version 300 es
#pragma vscode_glsllint_stage : vert
precision highp float;
in vec2 aPosition;
out vec2 vUv;

void main() {
	vUv = aPosition * 0.5 + 0.5;
	gl_Position = vec4(aPosition, 0.0, 1.0);
}