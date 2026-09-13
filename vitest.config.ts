import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: /^lodash\/(.*)/, replacement: path.resolve(__dirname, "./src/lib/lodash/$1.js") },
      { find: "lodash", replacement: path.resolve(__dirname, "./src/lib/lodash/index.js") },
    ],
  },
});
