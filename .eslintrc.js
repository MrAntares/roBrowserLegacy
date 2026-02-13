/**
 * ESLint Configuration for roBrowserLegacy
 *
 * This config enforces ES5 syntax with AMD modules and Allman brace style
 */
module.exports = {
	env: {
		browser: true,
		es6: true,
		amd: true
	},
	extends: ['eslint:recommended', 'prettier'],
	plugins: ['requirejs'],
	parserOptions: {
		ecmaVersion: 2020, // Optional Chaining (?.) and Nullish Coalescing (??) support
		sourceType: 'script'
	},
	globals: {
		define: 'readonly',
		require: 'readonly',
		requirejs: 'readonly',
		jQuery: 'readonly',
		$: 'readonly',
		console: 'readonly',
		FileReaderSync: 'readonly', // Lint flagged it as warning
		importScripts: 'readonly', // Lint flagged it as warning
		Buffer: 'readonly', // Node.js function

		// Global RO config
		ROConfig: 'readonly',

		// BinaryReader global vars
		SEEK_CUR: 'readonly',
		SEEK_SET: 'readonly',
		SEEK_END: 'readonly'
	},
	rules: {
		// ======================
		// STYLE (prettier resolve)
		// ======================
		quotes: ['error', 'single', { avoidEscape: true }],
		semi: ['error', 'always'],
		'comma-dangle': ['error', 'never'],

		// ======================
		// ENGINE FRIENDLY
		// ======================
		eqeqeq: 'off',
		'no-implicit-coercion': 'off',
		'no-plusplus': 'off',
		'no-fallthrough': 'off',

		// ======================
		// USELESS RULES
		// ======================
		'no-useless-escape': 'warn',
		'no-empty': 'error',
		'no-redeclare': 'error',
		'no-constant-condition': 'error',
		'no-unused-vars': [
			'warn',
			{
				varsIgnorePattern: '^_',
				args: 'none'
			}
		],

		// ======================
		// CODE QUALITY (REAL BUGS)
		// ======================
		curly: ['error', 'all'],
		'no-eval': 'error',
		'no-implied-eval': 'error',
		'no-new-func': 'error',
		'no-with': 'error',
		'no-global-assign': 'warn',
		'no-undef': 'error',
		'no-unreachable': 'error',
		'no-new': 'warn',
		'no-unused-expressions': 'warn',

		// ======================
		// HARDCORE VARIABLE QUALITY (adjust if too many warnings)
		// ======================
		'vars-on-top': 'warn',
		//'no-magic-numbers': ['warn', {} ], // Need to find the right ignores
		'prefer-const': 'warn',
		'no-shadow': 'warn',
		'block-scoped-var': 'warn',
		//'no-var': 'warn', // we are not ready for this yet, but maybe one time

		// ======================
		// LESS NOISE FOR LEGACY
		// ======================
		'no-prototype-builtins': 'off',
		'no-inner-declarations': 'off',
		'no-case-declarations': 'off',

		// ======================
		// DEBUG
		// ======================
		'no-console': 'off',
		'no-debugger': 'warn',

		// ======================
		// STRICT MODE
		// ======================
		strict: ['error', 'function']
	}
};
