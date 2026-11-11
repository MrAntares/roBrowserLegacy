import { lua as currentLua } from 'DB/Loaders/LuaRuntime.js';

/** Capture the VM as well, so a load cannot continue against a newer client. */
export function createDBLoadContext() {
	const instance = currentLua;
	let guardedContext;
	const lua = new Proxy(instance, {
		get(target, key) {
			if (key === 'ctx') {
				if (!guardedContext) {
					guardedContext = new Proxy(target.ctx, {
						set(context, name, value) {
							context[name] =
								typeof value === 'function'
									? function (...args) {
											return value.apply(this, args);
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
				const result = value.apply(target, args);
				if (result && typeof result.then === 'function')
					return Promise.resolve(result).then(output => {
						return output;
					});
				return result;
			};
		}
	});
	return { lua };
}

