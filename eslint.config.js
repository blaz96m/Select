import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: { globals: globals.browser, parser: tseslint.parser },
    plugins: {
      react: pluginReact,
    },

    rules: {
      ...pluginJs.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...pluginReact.configs.flat.recommended.rules,

      "no-console": "error",
      "react/display-name": "off",

      "no-unused-expressions": [
        "error",
        { allowShortCircuit: true, allowTernary: true },
      ],

      "no-unused-vars": [
        "warning",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
];
