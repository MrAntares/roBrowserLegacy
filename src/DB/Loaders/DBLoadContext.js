import Client from 'Core/Client.js';
import { lua as currentLua, getLuaGeneration, getClientGeneration } from './LuaRuntime.js';

/** Capture a client generation for one DB load. */
export function createDBFileContext(clientOnly = false) {
	const getGeneration = clientOnly ? getClientGeneration : getLuaGeneration;
	const generation = getGeneration();
	const isCurrent = () => generation === getGeneration();
	const guard = callback =>
		typeof callback !== 'function'
			? callback
			: function (...args) {
					if (isCurrent()) return callback.apply(this, args);
				};
	const loadFile = (path, success, failure, ...rest) =>
		Client.loadFile(path, guard(success), guard(failure), ...rest);
	return { loadFile, guard, isCurrent };
}

/** Capture the VM as well, so a load cannot continue against a newer client. */
export function createDBLoadContext() {
	const { loadFile, guard, isCurrent } = createDBFileContext();
	const instance = currentLua;
	let guardedContext;
	const lua = new Proxy(instance, {
		get(target, key) {
			if (key === 'ctx') {
				if (!isCurrent()) throw new Error('DB load belongs to a previous client');
				if (!guardedContext) {
					guardedContext = new Proxy(target.ctx, {
						set(context, name, value) {
							context[name] =
								typeof value === 'function'
									? function (...args) {
											return isCurrent() ? value.apply(this, args) : 1;
										}
									: value;
							return true;
						}
					});
				}
				return guardedContext;
			}
			const value = Reflect.get(target, key, target);
			if (typeof value !== 'function') return value;
			if (key === 'unmountFile') return value.bind(target);
			return (...args) => {
				if (!isCurrent()) throw new Error('DB load belongs to a previous client');
				const result = value.apply(target, args);
				if (result && typeof result.then === 'function')
					return Promise.resolve(result).then(output => {
						if (!isCurrent()) throw new Error('DB load belongs to a previous client');
						return output;
					});
				return result;
			};
		}
	});
	return { lua, loadFile, guard, isCurrent };
}
