/* eslint-env node */
module.exports = {
	root: true,
	env: { node: true, es2022: true },
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	rules: {
		// Force Allman braces (opening brace on its own line) for JS/TS
		'brace-style': ['error', 'allman', { allowSingleLine: true }],
		'@typescript-eslint/brace-style': ['error', 'allman', { allowSingleLine: true }],
		// Use tabs for indentation in JS/TS files
		indent: 'off',
		'@typescript-eslint/indent': ['error', 'tab', { SwitchCase: 1 }],
		// Allow tab characters
		'no-tabs': 'off',
	},
	overrides: [
		{
			files: ['*.vue'],
			parser: 'vue-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
			rules: {
				'no-undef': 'off', // TypeScript handles undefined variables
			},
		},
	],
	ignorePatterns: ['dist', 'node_modules'],
};
