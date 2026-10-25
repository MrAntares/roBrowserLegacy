/**
 * Renderer/Effects/ScreenDirection.js
 *
 * Which way one entity lies from another as seen on screen. Some official
 * skill effects come in one STR per direction (Chul Ho Sonic Claw's waves)
 * and the client picks the file from this on-screen angle, so turning the
 * camera changes the variant. Radiant Spear only asks which half of the
 * screen the target is in (screenSide).
 */
import glMatrix from 'Utils/gl-matrix.js';
import Camera from 'Renderer/Camera.js';
import Renderer from 'Renderer/Renderer.js';

const { mat4, vec4 } = glMatrix;

const _matrix = mat4.create();
const _point = vec4.create();

/**
 * Project a cell position to screen pixels, y going down.
 *
 * @param {Array} position entity position [x, y, z]
 * @param {mat4} matrix projection * modelView
 * @param {number} width screen width
 * @param {number} height screen height
 * @return {Array} [x, y]
 */
function toScreen(position, matrix, width, height) {
	_point[0] = position[0] + 0.5;
	_point[1] = -position[2];
	_point[2] = position[1] + 0.5;
	_point[3] = 1.0;
	vec4.transformMat4(_point, _point, matrix);
	const w = _point[3] === 0.0 ? 1.0 : 1.0 / _point[3];
	return [(_point[0] * w * width) / 2, (-_point[1] * w * height) / 2];
}

/**
 * On-screen angle from one position to another, in degrees, clockwise from
 * "right": 0 right, 90 down, 180 left, 270 up. 0 when both land on the same spot.
 *
 * @param {Array} from position [x, y, z]
 * @param {Array} to position [x, y, z]
 * @param {mat4} [matrix] projection * modelView, the current camera by default
 * @param {number} [width] screen width, the renderer's by default
 * @param {number} [height] screen height, the renderer's by default
 * @return {number}
 */
export function screenAngle(from, to, matrix, width = Renderer.width, height = Renderer.height) {
	if (!matrix) {
		matrix = mat4.multiply(_matrix, Camera.projection, Camera.modelView);
	}
	const [x1, y1] = toScreen(from, matrix, width, height);
	const [x2, y2] = toScreen(to, matrix, width, height);
	const dx = x2 - x1;
	const dy = y2 - y1;
	const length = Math.hypot(dx, dy);
	if (length === 0) {
		return 0;
	}
	const angle = (Math.acos(Math.max(-1, Math.min(1, dx / length))) * 180) / Math.PI;
	return dy < 0 ? 360 - angle : angle;
}

/**
 * The official 12-way split of that angle: 30 degree sectors, sector 0
 * centred straight up (255 to 285 degrees), going clockwise.
 *
 * @param {number} angle from screenAngle
 * @return {number} 0 to 11
 */
export function screenSector(angle) {
	return Math.floor((Math.trunc(angle + 105) % 360) / 30);
}

/**
 * The official two-way split of that angle: 'right' from 270 through 0 to 90
 * degrees, both ends included, 'left' strictly between 90 and 270. Straight
 * up, straight down and the same spot count as right.
 *
 * @param {number} angle from screenAngle
 * @return {string} 'right' or 'left'
 */
export function screenSide(angle) {
	return angle <= 90 || angle >= 270 ? 'right' : 'left';
}

export default { screenAngle, screenSector, screenSide };
