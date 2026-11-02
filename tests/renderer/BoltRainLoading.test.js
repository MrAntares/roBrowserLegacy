import { describe, expect, it, vi } from 'vitest';

// Cold Bolt / Fire Bolt and Frost Diver: geometry built without temporary objects, and texture
// loads that finish after the class was freed (map change, context reset) are dropped.

const pending = vi.hoisted(() => ({ loads: [] }));
vi.mock('Core/Client.js', () => ({
	default: {
		loadFile(path, onload) {
			pending.loads.push(() => onload(new ArrayBuffer(4)));
		}
	}
}));
vi.mock('Utils/WebGL.js', () => ({
	default: {
		texture(gl, buffer, onload) {
			onload({ id: Math.random() });
		},
		createShaderProgram: () => ({ attribute: {}, uniform: {} })
	}
}));
vi.mock('Renderer/SpriteRenderer.js', () => ({ default: { runWithDepth: (a, b, c, fn) => fn() } }));

const { default: BoltRain } = await import('../../src/Renderer/Effects/BoltRain.js');
const { default: IceSpikes } = await import('../../src/Renderer/Effects/IceSpikes.js');
const { planBolts, boltAt, buildBolt, BOLT_KINDS, BOLT_VERTICES } = await import(
	'../../src/Renderer/Effects/BoltRainSim.js'
);
const { planPath, buildSpike, spikeAxes, SPIKE, SPIKE_VERTICES } = await import(
	'../../src/Renderer/Effects/IceSpikesSim.js'
);

function makeGl() {
	const deleted = [];
	return {
		deleted,
		createBuffer: () => ({}),
		deleteBuffer() {},
		deleteProgram() {},
		deleteTexture: t => deleted.push(t)
	};
}

describe('texture loads across a context reset', () => {
	it('drops a bolt texture that arrives after the class was freed', () => {
		const gl = makeGl();
		BoltRain.init(gl);
		pending.loads.length = 0;
		new BoltRain([0, 0, 0], 0, 1, 'cold').init(gl);
		const stale = pending.loads.splice(0);
		BoltRain.free(gl);
		BoltRain.init(gl);
		new BoltRain([0, 0, 0], 0, 1, 'cold').init(gl);
		const fresh = pending.loads.splice(0);
		stale.forEach(run => run());
		expect(gl.deleted).toHaveLength(stale.length);
		gl.deleted.length = 0;
		fresh.forEach(run => run());
		expect(gl.deleted).toHaveLength(0);
	});

	it('drops a Frost Diver texture that arrives after the class was freed', () => {
		const gl = makeGl();
		IceSpikes.init(gl);
		pending.loads.length = 0;
		new IceSpikes([0, 0, 0], 0, [], 10).init(gl);
		const stale = pending.loads.splice(0);
		expect(stale).toHaveLength(1);
		IceSpikes.free(gl);
		stale[0]();
		expect(gl.deleted).toHaveLength(1);
	});
});

describe('geometry', () => {
	let seed = 3;
	const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

	it('builds a bolt as two crossed quads along its line', () => {
		const [bolt] = planBolts(1, random);
		const point = boltAt(bolt, 5);
		const kind = BOLT_KINDS.fire;
		const out = new Float32Array(BOLT_VERTICES * 5);
		buildBolt(out, 0, bolt, point, kind, [0, 0, 0]);
		const vertex = i => [out[i * 5] - 0.5, -out[i * 5 + 1], out[i * 5 + 2] - 0.5].map(v => v * 5);
		// Each quad's tail and head corners sit L either side of the bolt point along its line
		const tail = vertex(0);
		const head = vertex(1);
		const len = Math.hypot(bolt.step.x, bolt.step.y, bolt.step.up);
		expect(Math.hypot(head[0] - tail[0], head[1] - tail[1], head[2] - tail[2])).toBeCloseTo(2 * kind.length, 3);
		expect((head[0] - tail[0]) / (2 * kind.length)).toBeCloseTo(bolt.step.x / len, 3);
		// Building twice gives the same vertices (the axes are kept on the bolt)
		const again = new Float32Array(out.length);
		buildBolt(again, 0, bolt, point, kind, [0, 0, 0]);
		expect(Array.from(again)).toEqual(Array.from(out));
	});

	it('builds a spike with its tip along its axis', () => {
		const [spike] = planPath(20, 0, random);
		const out = new Float32Array(SPIKE_VERTICES * 5);
		buildSpike(out, 0, spike, 10, [0, 0, 0]);
		const [axis] = spikeAxes(spike);
		const tipX = (out[5] - 0.5) * 5;
		const tipUp = -out[6] * 5;
		expect(tipX).toBeCloseTo(spike.x + axis[0] * (10 + spike.height), 3);
		expect(tipUp).toBeCloseTo(-SPIKE.depth + axis[2] * (10 + spike.height), 3);
	});
});
