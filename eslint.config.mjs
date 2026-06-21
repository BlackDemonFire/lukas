import tseslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig(tseslint.configs.recommendedTypeChecked, [
  {
    plugins: { prettier },

    languageOptions: { parserOptions: { projectService: true } },

    rules: {
      "prettier/prettier": "error",
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
      "handle-callback-err": "off",
      "no-console": "warn",
      "no-empty-function": "error",
      "no-floating-decimal": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "no-inline-comments": "error",
      "no-lonely-if": "error",

      "no-shadow": ["error", { allow: ["err", "resolve", "reject"] }],

      "no-trailing-spaces": ["error"],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": "warn",
      "@typescript-eslint/restrict-template-expressions": "warn",
      "no-var": "error",
      "object-curly-spacing": ["error", "always"],
      "prefer-const": "error",
    },
  },
]);
