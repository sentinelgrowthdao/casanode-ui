module.exports = {
	extends: ['stylelint-config-standard-scss'],
	overrides: [
		{
			files: ['**/*.vue', '**/*.html'],
			customSyntax: 'postcss-html',
		},
	],
	rules: {},
};
