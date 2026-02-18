module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'plugin:import/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    settings: {
        react: { version: '18.2' },
        "import/resolver": {
            alias: {
                map: [
                    ["@", "./src"]
                ],
                extensions: [".js", ".jsx"]
            }
        }
    },
    plugins: ['react-refresh', 'import'],
    overrides: [
        {
            files: ['vite.config.js', '*.config.js'],
            rules: {
                'import/default': 'off',
            },
        },
    ],
    rules: {
        'react-refresh/only-export-components': 'off',
        'no-undef': 'error',
        'no-unused-vars': ['warn', { varsIgnorePattern: '^_' }],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'import/no-unresolved': 'error',
        'import/named': 'error',
        'import/default': 'error',
        'import/namespace': 'error',
        'react/prop-types': 'off'
    },
}
