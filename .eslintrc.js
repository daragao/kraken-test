module.exports = {
  extends: ["airbnb-base", "prettier", "plugin:node/recommended"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
  },
  env: {
    browser: false,
    es6: true,
    node: true,
    mocha: true,
  },
};
