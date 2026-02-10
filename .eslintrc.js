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
		jQuery: 'readonly',
		$: 'readonly',
		console: 'readonly'
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
		'no-case-declarations': 'off',
		'no-useless-escape': 'off',
		'no-empty': 'warn',
		'no-constant-condition': 'warn',
		'no-global-assign': 'off',
		'no-undef': 'warn',
		'no-redeclare': 'warn',

		// ======================
		// CODE QUALITY (REAL BUGS)
		// ======================
		curly: ['error', 'all'],
		'no-eval': 'error',
		'no-implied-eval': 'error',
		'no-new-func': 'error',
		'no-with': 'error',

		// ======================
		// LESS NOISE FOR LEGACY
		// ======================
		'no-unused-vars': [
			'warn',
			{
				varsIgnorePattern: '^_',
				args: 'none'
			}
		],

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
