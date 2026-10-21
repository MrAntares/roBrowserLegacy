import { describe, expect, it } from 'vitest';
import { mat4 } from 'Utils/gl-matrix.js';
import _vertexShader from 'Renderer/SpriteRenderer.vs?raw';
import _fragmentShader from 'Renderer/SpriteRenderer.fs?raw';
import _batchVertexShader from 'Renderer/SpriteBatch.vs?raw';
import _batchFragmentShader from 'Renderer/SpriteBatch.fs?raw';

/**
 * Depth of SpriteRenderer.vs/.fs ported to JS. Each sprite has two depth candidates, the billboard
 * and a vertical plane through its anchor. Taken per vertex, the min is interpolated linearly in
 * screen space; taken per fragment (gl_FragDepth), it is the min of the two perspective-correct
 * candidates. The shader source picks the model: SpriteRenderer draws one sprite at a time,
 * SpriteBatch the entities in instanced batches, both must agree.
 */
const CORNERS = [
	[-0.5, 0.5],
	[0.5, 0.5],
	[-0.5, -0.5],
	[0.5, -0.5]
];
const STRIP = [
	[0, 1, 2],
	[2, 1, 3]
];

// Layers from the ACT/SPR of the client: Dancer (female) sitting seen from behind, hairstyle 5.
const DANCER_SIT_BACK = {
	body: { anchor: [11, -42], pos: [-2, -5], width: 45, height: 51 },
	head: { anchor: [12, -52], pos: [0, -36], width: 26, height: 50 }
};

function mul(m, v) {
	const out = [0, 0, 0, 0];
	for (let r = 0; r < 4; r++) {
		out[r] = m[r] * v[0] + m[4 + r] * v[1] + m[8 + r] * v[2] + m[12 + r] * v[3];
	}
	return out;
}

function normalize(v) {
	const l = Math.hypot(v[0], v[1], v[2]);
	return [v[0] / l, v[1] / l, v[2] / l];
}

function dot(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

// Same matrices as Camera.update() and Renderer.resize(), camera on the entity
function camera(zoom, latitude) {
	const modelView = mat4.create();
	mat4.translateZ(modelView, -zoom / 2);
	mat4.rotateX(modelView, modelView, ((latitude + 180) / 180) * Math.PI);
	mat4.translate(modelView, modelView, [-0.5, 0, -0.5]);

	const projection = mat4.create();
	mat4.perspective(15, 16 / 9, 1, 1000, projection);

	return { modelView, viewModel: mat4.invert(mat4.create(), modelView), projection, zoom };
}

// SpriteRenderer render() + Project() + main() of the vertex shader
function vertex(cam, quad, corner) {
	const position = [corner[0] * quad.size[0] + quad.offset[0], corner[1] * quad.size[1] - quad.offset[1] - 0.5, 0, 1];

	// Entity on cell 0,0 lifted by 0.2, as in renderEntity()
	const mv = Array.from(cam.modelView);
	const x = 0.5,
		y = -0.2,
		z = 0.5;
	for (let r = 0; r < 4; r++) {
		mv[12 + r] += mv[r] * x + mv[4 + r] * y + mv[8 + r] * z;
	}
	mv.splice(0, 3, 1, 0, 0);
	mv.splice(4, 3, 0, 1, 0);
	mv.splice(8, 3, 0, 0, 1);

	const viewPosition = mul(mv, position);
	const clip = mul(cam.projection, viewPosition);

	const cameraPos = mul(cam.viewModel, [0, 0, 0, 1]);
	const forward = normalize(mul(cam.viewModel, [0, 0, -1, 0]));
	const planePoint = mul(cam.viewModel, mul(mv, [0, 0, 0, 1]));
	const planeNormal = normalize([forward[0], 0, forward[2]]);
	const world = mul(cam.viewModel, viewPosition);
	const ray = normalize([world[0] - cameraPos[0], world[1] - cameraPos[1], world[2] - cameraPos[2]]);
	const toPlane = [planePoint[0] - cameraPos[0], planePoint[1] - cameraPos[1], planePoint[2] - cameraPos[2]];
	const dist = dot(toPlane, planeNormal) / Math.max(dot(planeNormal, ray), 0.000001);
	const hit = [cameraPos[0] + ray[0] * dist, cameraPos[1] + ray[1] * dist, cameraPos[2] + ray[2] * dist, 1];
	const planeClip = mul(cam.projection, mul(cam.modelView, hit));

	const zOffset = (quad.zIndex * 0.01) / Math.max(cam.zoom, 1);
	const billboardZ = clip[2] - zOffset;
	const planeZ = planeClip[2] * (clip[3] / Math.max(planeClip[3], 0.000001)) - zOffset;

	return { x: clip[0] / clip[3], y: clip[1] / clip[3], w: clip[3], billboardZ, planeZ };
}

function quad(cam, layer, anchor, zIndex) {
	const q = {
		size: [(layer.width / 175) * 5, (layer.height / 175) * 5],
		offset: [((layer.pos[0] + anchor[0]) / 175) * 5, ((layer.pos[1] + anchor[1]) / 175) * 5 - 0.5],
		zIndex
	};
	q.vertices = CORNERS.map(corner => vertex(cam, q, corner));
	return q;
}

// NDC depth of the quad at a screen point, null outside
function depthAt(q, sx, sy, fragmentMin) {
	for (let t = 0; t < STRIP.length; t++) {
		const v = STRIP[t].map(i => q.vertices[i]);
		const det = (v[1].y - v[2].y) * (v[0].x - v[2].x) + (v[2].x - v[1].x) * (v[0].y - v[2].y);
		const l0 = ((v[1].y - v[2].y) * (sx - v[2].x) + (v[2].x - v[1].x) * (sy - v[2].y)) / det;
		const l1 = ((v[2].y - v[0].y) * (sx - v[2].x) + (v[0].x - v[2].x) * (sy - v[2].y)) / det;
		const l = [l0, l1, 1 - l0 - l1];

		if (l[0] < 0 || l[1] < 0 || l[2] < 0) {
			continue;
		}

		if (!fragmentMin) {
			return l.reduce((sum, li, i) => sum + (li * Math.min(v[i].billboardZ, v[i].planeZ)) / v[i].w, 0);
		}

		const invW = l.reduce((sum, li, i) => sum + li / v[i].w, 0);
		const billboardZ = l.reduce((sum, li, i) => sum + (li * v[i].billboardZ) / v[i].w, 0) / invW;
		const planeZ = l.reduce((sum, li, i) => sum + (li * v[i].planeZ) / v[i].w, 0) / invW;
		return Math.min(billboardZ, planeZ) * invW;
	}
	return null;
}

// The lines of each shader the model above stands for
const VERTEX_DEPTH = [
	/out float vBillboardZ;/,
	/out float vPlaneZ;/,
	/float billboardZ = gl_Position\.z;/,
	/planeZ = correctedZBase;/,
	/vBillboardZ\s*=\s*billboardZ - zOffset;/,
	/vPlaneZ\s*=\s*planeZ - zOffset;/,
	/gl_Position\.z\s*=\s*min\(vBillboardZ, vPlaneZ\);/
];
const FRAGMENT_DEPTH = [
	/in float vBillboardZ;/,
	/in float vPlaneZ;/,
	/float fragDepth = min\(vBillboardZ, vPlaneZ\) \* gl_FragCoord\.w \* 0\.5 \+ 0\.5;/,
	/gl_FragDepth\s*=\s*fragDepth;/,
	/float depth\s*=\s*fragDepth \/ gl_FragCoord\.w;/
];

for (const [name, vertexShader, fragmentShader] of [
	['SpriteRenderer', _vertexShader, _fragmentShader],
	['SpriteBatch', _batchVertexShader, _batchFragmentShader]
]) {
	const fragmentMin = fragmentShader.includes('gl_FragDepth');

	describe(`${name} depth`, () => {
		it('writes the depth the model takes, and fogs at that depth', () => {
			for (const line of VERTEX_DEPTH) {
				expect(vertexShader).toMatch(line);
			}
			for (const line of FRAGMENT_DEPTH) {
				expect(fragmentShader).toMatch(line);
			}
		});

		for (const latitude of [50, 65]) {
			for (const zoom of [15, 50, 125]) {
				it(`keeps the hair of a sitting Dancer seen from behind in front of her body (lat ${latitude}, zoom ${zoom})`, () => {
					const cam = camera(zoom, latitude);
					const { body, head } = DANCER_SIT_BACK;
					const headAnchor = [body.anchor[0] - head.anchor[0], body.anchor[1] - head.anchor[1]];
					const bodyQuad = quad(cam, body, [0, 0], 150);
					const headQuad = quad(cam, head, headAnchor, 300);

					const xs = headQuad.vertices.map(v => v.x);
					const ys = headQuad.vertices.map(v => v.y);
					let samples = 0;
					let lost = 0;

					for (let i = 0; i <= 40; i++) {
						for (let j = 0; j <= 40; j++) {
							const sx = Math.min(...xs) + ((Math.max(...xs) - Math.min(...xs)) * i) / 40;
							const sy = Math.min(...ys) + ((Math.max(...ys) - Math.min(...ys)) * j) / 40;
							const bodyZ = depthAt(bodyQuad, sx, sy, fragmentMin);
							const headZ = depthAt(headQuad, sx, sy, fragmentMin);

							if (bodyZ === null || headZ === null) {
								continue;
							}
							samples++;
							if (headZ >= bodyZ) {
								lost++;
							}
						}
					}

					expect(samples).toBeGreaterThan(100);
					expect(lost).toBe(0);
				});
			}
		}

		it('keeps the feet below the anchor on the billboard depth, in front of the ground', () => {
			const cam = camera(50, 50);
			const bodyQuad = quad(cam, DANCER_SIT_BACK.body, [0, 0], 150);
			const bottom = bodyQuad.vertices[2];
			const z = depthAt(bodyQuad, bottom.x + 0.0001, bottom.y + 0.0001, fragmentMin);

			expect(bottom.billboardZ).toBeLessThan(bottom.planeZ);
			expect(z).toBeCloseTo(bottom.billboardZ / bottom.w, 4);
		});
	});
}
