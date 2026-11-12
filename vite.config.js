import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';
import uiCssHmrPlugin from './vite/csshotreload.plugin.js';
import glob from 'glob'; 

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDocker = process.env.RO_PROXY_TARGET === 'docker';
const webTarget = isDocker ? 'http://rathena-web:8888' : 'http://127.0.0.1:8888';
const remoteClientTarget = isDocker ? 'http://remote-client-php:80' : 'http://127.0.0.1:8000';
  
// custom/Components/ChatBox/ChatBox.js → alias 'UI/Components/ChatBox/ChatBox.js'  
const customAliases = glob  
	.sync('custom/**/*.js')  
	.map(f => ({  
		find: new RegExp(`^UI/${f.slice(7).replace(/[/.]/g, m => '\\' + m)}$`),  
		replacement: path.resolve(__dirname, f)  
	}));  

const _proxy = {
	'/get': {
		target: webTarget,
		changeOrigin: true,
		secure: false,
		ws: false
	},
	'/emblem': {
		target: webTarget,
		changeOrigin: true,
		secure: false,
		ws: false
	},
	'/userconfig': {
		target: webTarget,
		changeOrigin: true,
		secure: false,
		ws: false
	}
};

if (isDocker) {
	_proxy['/remote-client'] = {
		target: remoteClientTarget,
		changeOrigin: true,
		secure: false,
		rewrite: path => path.replace(/^\/remote-client/, '')
	};
}

export default defineConfig({
	plugins: [uiCssHmrPlugin()],
	root: './',
	base: './',
	resolve: {
		alias: [  
			...customAliases, 
			...aliasConfig.dirs.map(d => ({  
				find: d,  
				replacement: path.resolve(__dirname, './src', d)  
			}))  
		]
	},
	optimizeDeps: {
		include: ['bson', 'lodash', 'rijndael-js']
	},
	test: {
		environment: 'jsdom',
		env: { TZ: 'UTC' },
		setupFiles: ['./tests/setup.js'],
		include: ['tests/**/*.test.js'],
		exclude: [...configDefaults.exclude, 'tests/bench/**'],
		execArgv: ['--no-experimental-webstorage'],
		benchmark: {
			include: ['tests/bench/**/*.bench.js'],
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			include: ['src/**/*.js'],
			exclude: ['src/Vendors/**']
		}
	},
	build: {
		sourcemap: false, // Saves RAM
		minify: false, // Makes the build run much faster
		outDir: 'dist/Web',
		rollupOptions: {
			input: {
				main: path.resolve(__dirname, 'index.html')
			}
		}
	},
	server: {
		host: isDocker ? '0.0.0.0' : 'localhost',
		port: 3000,
		open: !isDocker,
		cors: true,
		...(isDocker && {
			watch: {
				usePolling: true,
				interval: 1000
			}
		}),
		proxy: _proxy
	}
});
