/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  "root": true,
  "parser": "vue-eslint-parser",
  "plugins": [
    "@typescript-eslint",
    "vue",
    "prettier"
  ],
  "extends": [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "airbnb-base",
    "airbnb-typescript/base",
    "plugin:@typescript-eslint/recommended",
    "@vue/eslint-config-typescript/recommended",
    "plugin:prettier/recommended",
    "@vue/eslint-config-prettier",
  ],
  "parserOptions": {
    "project": "./tsconfig.json",
    "ecmaVersion": 2020,
    "parser" : "@typescript-eslint/parser",
    "sourceType": "module"
  },
  "settings": {
    "import/resolver": {
      "typescript": {} // this loads <rootdir>/tsconfig.json to eslint
    },
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-expressions": [
      "error",
      {
        "allowShortCircuit": true
      }
    ],
    "@typescript-eslint/array-type": [
      "error",
      {
        "default": "array"
      }
    ],
    "max-lines-per-function": [
      "error",
      40
    ],
  },
  "ignorePatterns": [
    "*.config.ts"
  ]
}
