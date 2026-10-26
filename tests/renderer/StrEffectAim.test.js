import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const sourceRoot = process.env.EFFECT_SOURCE_ROOT || join(process.cwd(), 'src');
const code = readFileSync(join(sourceRoot, 'Renderer/Effects/StrEffect.js'), 'utf8')
	.replace(/^import .*;\r?$/gm, '')
	.replace('export default StrEffect;', 'this.StrEffect = StrEffect;');

// A StrEffect drawn from `position` at a target at `target`, seen through `modelView`.
function aimAngle({ effect, position, target, modelView }) {
	const context = vm.createContext({
		Float32Array,
		Math,
		Client: { loadFile: () => null },
		glMatrix: { mat4: { create: () => new Float32Array(16) } }
	});
	vm.runInContext(code, context);
	context.modelView = modelView;
	vm.runInContext('_modelView = modelView;', context);
	const str = new context.StrEffect('a.str', position, 0, '');
	str._Params = { effect, Inst: { otherPosition: target } };
	return str.getAimAngle();
}

const identity = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
// Turned a quarter: world +x shows as screen up.
const quarter = new Float32Array([0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

describe('StrEffect aimed at its target', () => {
	it('leaves an effect without rotateToTarget as drawn', () => {
		assert.equal(aimAngle({ effect: {}, position: [10, 10, 0], target: [20, 10, 0], modelView: identity }), 0);
	});

	it('turns art that flies left so it flies at the target', () => {
		const effect = { rotateToTarget: true, facing: 180 };
		// Target on the left: the art already points there
		assert.equal(aimAngle({ effect, position: [10, 10, 0], target: [5, 10, 0], modelView: identity }), 0);
		// Target on the right: half a turn
		assert.equal(
			Math.abs(aimAngle({ effect, position: [10, 10, 0], target: [15, 10, 0], modelView: identity })),
			180
		);
	});

	it('follows the camera', () => {
		const effect = { rotateToTarget: true };
		// Target at world +x shows straight up the screen: a quarter turn
		assert.equal(aimAngle({ effect, position: [10, 10, 0], target: [15, 10, 0], modelView: quarter }), 90);
	});

	it('does not turn when the target stands on the effect', () => {
		const effect = { rotateToTarget: true, facing: 180 };
		assert.equal(aimAngle({ effect, position: [10, 10, 0], target: [10, 10, 0], modelView: identity }), 0);
	});
});
