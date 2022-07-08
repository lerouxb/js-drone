module.exports = {
  env: {
    browser: true,
    es2022: true
  },
  extends: ['react-app', 'react-app/jest'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 13,
    sourceType: 'module'
  },
  plugins: ['react'],
  rules: {}
};
