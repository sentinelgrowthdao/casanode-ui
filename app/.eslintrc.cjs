module.exports = {
	root: true,
	env: {
		node: true
	},
	extends: [
		'plugin:vue/vue3-essential',
		'eslint:recommended',
		'@vue/typescript/recommended',
	],
	plugins: [],
	parserOptions: {
		ecmaVersion: 2020
	},
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'vue/no-deprecated-slot-attribute': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'brace-style': ['error', 'allman', { allowSingleLine: true }]
	},
	overrides: [
		// Indentation for Vue SFCs
		{
			files: ['*.vue'],
			rules: {
				indent: 'off',
				'vue/script-indent': ['error', 'tab', { baseIndent: 0, switchCase: 1 }],
				'vue/html-indent': ['error', 'tab', { baseIndent: 0, alignAttributesVertically: true, ignores: [] }],
				'vue/html-closing-bracket-newline': ['error', { singleline: 'never', multiline: 'never' }]
			}
		},
		// Indentation for TS/JS
		{
			files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
			rules: {
				indent: ['error', 'tab', { SwitchCase: 1 }]
			}
		}
	]
};
