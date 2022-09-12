import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["packages/**/*-spec.ts", "test-packages/**/*-spec.ts"],
    exclude: [
      ...configDefaults.exclude,
      "packages/**/lib/*.js",
      "test-packages/**/lib/*.js",
      "packages/vscode-ui5-language-assistant/**/*",
    ],
    coverage: {
      provider: "istanbul", // or 'c8'

      include: ["packages/**/*-spec.ts", "test-packages/**/*-spec.ts"],
      exclude: [],
      reporter: ["text"],
    },
    silent: true,
  },
});
