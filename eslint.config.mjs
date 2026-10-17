import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactHooks from "eslint-plugin-react-hooks";
import jsxAa12y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  {
    // Register the plugins so their rules can be enabled explicitly.
    plugins: {
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      // React hooks role set, enabled at error severity.
      "react-hooks/rules-of/hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      // JSX accessibility rule set, enabled at error severity.
      ...jsxAa12y.configs.recommended.rules,
    },
  },
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
