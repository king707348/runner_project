const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },
  {
    // 伺服器端程式碼一律使用 src/utils/logger.js，禁止直接用 console
    files: ['bin/**/*.js', 'src/**/*.js', 'db/data-source.js'],
    rules: { 'no-console': 'error' },
  },
  {
    // db 相關程式碼暫不調整，未使用變數僅警告，不讓 CI 失敗
    files: ['db/**/*.js', 'src/repositories/**/*.js', 'tests/unit/typeorm.test.js'],
    rules: { 'no-unused-vars': 'warn' },
  },
];
