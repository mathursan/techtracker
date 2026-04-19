import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Next.js build outputs.
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Test artefacts produced by Playwright — never linted, not reviewable.
    "playwright-report/**",
    "test-results/**",
    // Generated fixtures.
    "src/domain/__fixtures__/band-grid.json",
    // Python package + venv live outside TS lint scope.
    "scoring/**",
    ".venv/**",
  ]),
]);

export default eslintConfig;
