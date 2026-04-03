import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function uiCssHmrPlugin() {
	return {
		name: 'ui-css-hmr',
		apply: 'serve',
		transform(code, id) {
			/*
			* Skip if not a UI component file
			*/
			if (!id.includes('/src/UI/Components/') || !id.endsWith('.js')) {
				return null;
			}

			/*
			* Find CSS import
			*/
			const cssImportRegex = /import\s+(\w+)\s+from\s+['"](\.[^'"]+\.css\?raw)['"]/g;
			const match = cssImportRegex.exec(code);
			if (!match) return null;

			const cssPath = match[2];

			/*
			* Find component name
			*/
			const compRegex = /new\s+UIComponent\(\s*['"](\w+)['"]/;
			const compMatch = compRegex.exec(code);
			if (!compMatch) return null;

			const componentName = compMatch[1];
			/*
			* Inject HMR code to reload CSS when file is modified
			*/
			const hmrBlock = `
			if (import.meta.hot) {
				import.meta.hot.accept('${cssPath}', (newModule) => {
					if (newModule && newModule.default) {
						UIComponent.reloadCSS('${componentName}', newModule.default);
					}
				});
			}`;
			return { code: code + hmrBlock, map: null };
		}
	};
}

export default defineConfig({
	plugins: [uiCssHmrPlugin()],
	root: './',
	base: './',
	resolve: {
		alias: {
			'jquery': path.resolve(__dirname, 'src/Vendors/jquery-1.9.1.js'),
			App: path.resolve(__dirname, './src/App'),
			Audio: path.resolve(__dirname, './src/Audio'),
			Controls: path.resolve(__dirname, './src/Controls'),
			Core: path.resolve(__dirname, './src/Core'),
			DB: path.resolve(__dirname, './src/DB'),
			Engine: path.resolve(__dirname, './src/Engine'),
			Loaders: path.resolve(__dirname, './src/Loaders'),
			Network: path.resolve(__dirname, './src/Network'),
			Plugins: path.resolve(__dirname, './src/Plugins'),
			Preferences: path.resolve(__dirname, './src/Preferences'),
			Renderer: path.resolve(__dirname, './src/Renderer'),
			UI: path.resolve(__dirname, './src/UI'),
			Utils: path.resolve(__dirname, './src/Utils'),
			Vendors: path.resolve(__dirname, './src/Vendors')
		}
	},
	build: {
		outDir: 'dist/Web',
		rollupOptions: {
			input: {
				main: path.resolve(__dirname, 'index.html')
			}
		}
	},
	server: {
		port: 3000,
		open: true
	}
});
