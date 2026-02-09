/**
 * ESLint Configuration for roBrowserLegacy
 *
 * This config enforces ES5 syntax with AMD modules and Allman brace style
 */
module.exports = {
	env: {
		browser: true,
		amd: true
	},
	extends: ['eslint:recommended', 'prettier'],
	plugins: ['requirejs'],
	parserOptions: {
		ecmaVersion: 5,
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
		// Indentation: tabs with 4 spaces width
		indent: [
			'error',
			'tab',
			{
				SwitchCase: 1
			}
		],

		// Quotes: single quotes
		quotes: [
			'error',
			'single',
			{
				avoidEscape: true,
				allowTemplateLiterals: false
			}
		],

		// Semicolons: required
		semi: ['error', 'always'],
		'semi-spacing': [
			'error',
			{
				before: false,
				after: true
			}
		],

		// Brace style: Allman (opening brace on new line)
		'brace-style': [
			'error',
			'allman',
			{
				allowSingleLine: true
			}
		],

		// Comma: no trailing commas
		'comma-dangle': ['error', 'never'],
		'comma-spacing': [
			'error',
			{
				before: false,
				after: true
			}
		],

		// Spacing
		'space-before-function-paren': [
			'error',
			{
				anonymous: 'always',
				named: 'never',
				asyncArrow: 'always'
			}
		],
		'space-before-blocks': ['error', 'always'],
		'space-in-parens': ['error', 'never'],
		'space-infix-ops': 'error',
		'keyword-spacing': [
			'error',
			{
				before: true,
				after: true
			}
		],
		'object-curly-spacing': ['error', 'always'],
		'array-bracket-spacing': ['error', 'never'],

		// Line breaks
		'linebreak-style': ['error', 'unix'],
		'eol-last': ['error', 'always'],
		'no-trailing-spaces': 'error',
		'no-multiple-empty-lines': [
			'error',
			{
				max: 2,
				maxEOF: 1,
				maxBOF: 0
			}
		],

		// Variable declarations
		'no-var': 'off',
		'prefer-const': 'off',
		'prefer-arrow-callback': 'off',
		'no-unused-vars': [
			'warn',
			{
				vars: 'all',
				args: 'none',
				varsIgnorePattern: '^_'
			}
		],

		// Best practices
		'no-console': 'off',
		'no-debugger': 'warn',
		'no-alert': 'warn',
		'no-mixed-spaces-and-tabs': 'error',
		'no-multi-spaces': [
			'error',
			{
				ignoreEOLComments: true,
				exceptions: {
					Property: true,
					VariableDeclarator: true
				}
			}
		],

		// ES6 features - disable all
		'no-arrow-functions': 'off',
		'object-shorthand': 'off',
		'prefer-template': 'off',
		'prefer-spread': 'off',
		'prefer-rest-params': 'off',
		'prefer-destructuring': 'off',

		// Code quality
		curly: ['error', 'all'],
		eqeqeq: ['error', 'allow-null'],
		'no-eval': 'error',
		'no-implied-eval': 'error',
		'no-with': 'error',
		'no-new-func': 'error',

		// Strict mode
		strict: ['error', 'function']
	}
};
