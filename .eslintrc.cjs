// .eslintrc.cjs
/**
 * ESLint Configuration for roBrowserLegacy
 *
 * This config enforces ES6+ module syntax with Vite bundler
 */
module.exports = {
	env: {
		browser: true,
		es2020: true
	},
	extends: ['eslint:recommended', 'prettier'],
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	},
	globals: {
		// removido: define, require, requirejs (não usa mais AMD)
		jQuery: 'readonly',
		$: 'readonly',
		FileReaderSync: 'readonly',
		importScripts: 'readonly',
		Buffer: 'readonly',
		ROConfig: 'readonly',
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
		// VARIABLE QUALITY
		// ======================
		'no-shadow': 'warn',
		'block-scoped-var': 'warn',
		'no-var': 'warn', // force let/const
		'prefer-const': 'warn', // force const

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
		'no-debugger': 'warn'
	},
	ignorePatterns: [
		'src/Vendors/**' // não lint em código third-party
	]
};
