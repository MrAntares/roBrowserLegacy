import fs from 'node:fs';
import path from 'node:path';
import wabtFactory from 'wabt';

const wabt = await wabtFactory();

const watFiles = [
	{
		wat: 'src/Loaders/wasm/paletteConvert.wat',
		js: 'src/Loaders/wasm/paletteConvert.js',
		exportConst: 'PALETTE_CONVERT_WASM_BASE64'
	},
	{
		wat: 'src/Loaders/wasm/spriteCompile.wat',
		js: 'src/Loaders/wasm/spriteCompile.js',
		exportConst: 'SPRITE_COMPILE_WASM_BASE64'
	}
];

for (const { wat, js, exportConst } of watFiles) {
	const watPath = path.resolve(wat);
	const jsPath = path.resolve(js);

	if (!fs.existsSync(watPath)) {
		console.warn(`WAT file not found: ${watPath}`);
		continue;
	}

	const watSource = fs.readFileSync(watPath, 'utf8');
	const wasmModule = wabt.parseWat(path.basename(watPath), watSource);
	const { buffer } = wasmModule.toBinary({});
	wasmModule.destroy();

	const base64 = Buffer.from(buffer).toString('base64');

	if (fs.existsSync(jsPath)) {
		let jsContent = fs.readFileSync(jsPath, 'utf8');
		const regex = new RegExp(`export const ${exportConst} =\\s*['"][^'"]*['"];`);
		if (regex.test(jsContent)) {
			jsContent = jsContent.replace(regex, `export const ${exportConst} =\n\t'${base64}';`);
			fs.writeFileSync(jsPath, jsContent, 'utf8');
			console.log(`Updated Base64 in ${js}`);
		} else {
			console.warn(`Constant ${exportConst} not found in ${js}`);
		}
	}
}
