/**
 * Renderer/GR2/gr2World.js
 *
 * The GR2 world matrix — port of the sandbox `gr2BuilderRobrowser` (draw path
 * reconciled to roBrowser's /5 referential). Byte-cited from the client 3dmob draw
 * path (mars26 fcn.00b2ad20 / ver12 fcn.00567e70): Rx(+pi/2) . Ry((dir+180)) . S . T,
 * with the granny-RH -> render-LH X reflection (flipX) and the model's own granny
 * InitialPlacement (ipRow) applied innermost. (The sandbox used Rx(-pi/2) for its folded
 * camera; roBrowser's standard Y-up camera needs the faithful +pi/2 — see flagCore.)
 *
 * MATRIX CONVENTION. The chain is built row-vector (D3D, v' = v.M) with the local
 * `_mul` helper, then the flat array is handed to GL / gl-matrix as-is. A row-major
 * array reinterpreted column-major IS its transpose, and column-vector M.v with the
 * transpose equals row-vector v.M — so `mat4.multiply(out, Camera.modelView, world)`
 * (gl-matrix is column-major) reproduces the sandbox `multiply4(view, model)` with no
 * extra transpose. Do NOT transpose the output.
 *
 * /5 REFERENTIAL (build-7). roBrowser lands the RO world at /5 (World/Altitude/Ground
 * divide position + scale + heights by 5). The GR2 geometry and its cell-straddle scale
 * by RB_UNIT_SCALE (0.2 = 1.0u / 5.0u) so the model reads 1.0-cell-sized; the world
 * POSITION is left in the caller's referential (co-located with the /5 ground). See
 * re-ro-clients-asm/sandbox/CORRESPONDENCE.md (build-7).
 *
 * YAW. `((dir + 180) / 180) * pi` — the +180 is asm-cited (mars26 fcn.00b2ad20.asm:160
 * addss 180.0 / ver12 fcn.00408b70). The sandbox leaves the offset vs roBrowser's own
 * Camera.direction remap (floor((angle[1]+22.5)/45)%8, rendered dir = (Camera.direction
 * + entity.direction) mod 8) UNRESOLVED by design — both sandbox halves share flagCore
 * so they coincide with no offset. Here it is pinned empirically on the live map (see the
 * baked defaults in flagCore) and will thread into the Entity direction remap.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

/** Geometry scale under the /5 referential (0.2 = 1.0u / 5.0u). */
export const RB_UNIT_SCALE = 0.2;

/** Cell-straddle offset on X,Z, scaled with the geometry (0.2 * -2.0). */
export const RB_PLACEMENT_OFS = -0.4;

const IDENTITY_ROW = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

// Model-space X reflection (row-vector) — the granny-RH -> render-LH handedness bridge.
const FLIP_X = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

// Row-vector 4x4 helpers (D3D convention v' = v.M).
function _mul(a, b) {
	const o = new Array(16);
	for (let r = 0; r < 4; r++) {
		for (let c = 0; c < 4; c++) {
			let s = 0;
			for (let k = 0; k < 4; k++) {
				s += a[r * 4 + k] * b[k * 4 + c];
			}
			o[r * 4 + c] = s;
		}
	}
	return o;
}

// D3DXMatrixRotationX / Y (row-vector).
const _rotX = a => {
	const s = Math.sin(a);
	const c = Math.cos(a);
	return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
};
const _rotY = a => {
	const s = Math.sin(a);
	const c = Math.cos(a);
	return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
};
const _scale = s => [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1];
const _trans = (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];

/**
 * flagCore(dir, pos) -> the flip-free world core Rx(-pi/2) . Ry(yaw) . S . T at the
 * /5 referential (geometry x0.2, straddle -0.4). Position is fed unchanged.
 */
export function flagCore(dir, pos, opts) {
	const o = opts || {};
	// Orientation reconciled empirically on the live map against roBrowser's Y-up camera +
	// Camera.direction remap: rxSign +1 (pitch), yawOffsetDeg +180 on top of the asm-cited
	// (dir+180). The opts stay exposed for re-tuning other eras/models.
	const rxSign = o.rxSign != null ? o.rxSign : 1;
	const yawOffset = o.yawOffsetDeg != null ? o.yawOffsetDeg : 180;
	const yaw = ((dir + 180 + yawOffset) / 180) * Math.PI;
	let m = _mul(_rotX((rxSign * Math.PI) / 2), _rotY(yaw));
	m = _mul(m, _scale(RB_UNIT_SCALE));
	m = _mul(m, _trans(pos[0] + RB_PLACEMENT_OFS, pos[1] + (o.heightOffset || 0), pos[2] + RB_PLACEMENT_OFS));
	return m;
}

/**
 * computeGroundOffset(meshes, opts) -> the heightOffset that puts the model's base flush on the
 * terrain. roBrowser's render inverts world Y on screen (proven on the live map: a model placed at
 * world Y ABOVE the ground draws BELOW it / occluded), so the base — the part that must touch the
 * ground line — is the world-Y MAX vertex. We ground that: no vertex ends up above the ground's
 * world Y, so nothing renders under the terrain. Yaw-independent (uses the world matrix's Y-row).
 */
export function computeGroundOffset(meshes, opts) {
	const m = buildWorld(0, [0, 0, 0], null, opts);
	const a = m[1];
	const b = m[5];
	const c = m[9];
	let max = -Infinity;
	for (let k = 0; k < meshes.length; k++) {
		const bind = meshes[k].bind;
		const vc = meshes[k].vcount;
		for (let i = 0; i < vc; i++) {
			const y = a * bind[i * 3] + b * bind[i * 3 + 1] + c * bind[i * 3 + 2];
			if (y > max) {
				max = y;
			}
		}
	}
	return max === -Infinity ? 0 : -max;
}

/**
 * buildWorld(dir, pos, ipRow) -> Float32Array(16) GR2 world matrix.
 * Chain (row-vector, IP innermost): v . ipRow . flipX . flagCore(dir, pos).
 * Hand the result straight to gl-matrix `mat4.multiply(out, view, world)` (see MATRIX
 * CONVENTION above) — it is already the column-major world matrix.
 *
 * @param {number} dir - actor facing fed into Ry((dir+180))
 * @param {number[]} pos - world position [x, y, z] (caller referential, left unscaled)
 * @param {number[]} [ipRow] - the model's granny InitialPlacement row-vector mat4 (identity for flags)
 */
export function buildWorld(dir, pos, ipRow, opts) {
	const o = opts || {};
	const ip = ipRow || IDENTITY_ROW;
	// flipX (default on) = the granny-RH -> render-LH X reflection. Exposed as an opt for the
	// empirical mirror reconciliation on other eras/models.
	const flip = o.flipX === false ? IDENTITY_ROW : FLIP_X;
	return new Float32Array(_mul(ip, _mul(flip, flagCore(dir, pos, o))));
}
