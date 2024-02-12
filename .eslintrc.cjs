module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react/jsx-runtime', 'plugin:react-hooks/recommended', 'prettier'],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    settings: { react: { version: '18.2' } },
    plugins: ['react-refresh', 'prettier'],
    rules: {
        'prettier/prettier': [
            'error',
            {
                tabWidth: 4,
                useTabs: false,
                singleQuote: true,
                printWidth: 160,
            },
        ],
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
};
