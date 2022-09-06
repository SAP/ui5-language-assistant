import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["packages/**/*-spec.ts", "test-packages/**/*-spec.ts"],
    exclude: [
      ...configDefaults.exclude,
      "packages/**/*.js",
      "test-packages/**/*.js",
      "packages/vscode-ui5-language-assistant/**/*",
    ],
    coverage: {
      provider: "istanbul",
      reporter: ["json", "html"], // or 'c8'
    },
    silent: true,
  },
});
