const base64ToUint8Array = base64 => {
	const binaryString = atob(base64);
	const len = binaryString.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; ++i) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
};

export const createWasmLoader = (base64, instance, name, imports = {}) => {
	return () => {
		if (instance) return instance;
		if (typeof WebAssembly !== 'object' || typeof WebAssembly.Module !== 'function') {
			return null;
		}
		try {
			instance = new WebAssembly.Instance(new WebAssembly.Module(base64ToUint8Array(base64)), imports);
			return instance;
		} catch (e) {
			console.warn(`Loaderswasm${name} - Failed to instantiate WASM module`, e);
			return null;
		}
	};
};
