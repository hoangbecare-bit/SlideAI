import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Manual "@/*" -> src/* alias so we don't pull in an extra tsconfig-paths plugin.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
