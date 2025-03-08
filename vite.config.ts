import { UserConfig, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/tests/setup.ts",
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "select-ui",
      fileName: "select-ui",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDom",
          "react/jsx-runtime": "react/jsx-runtime",
        },
      },
    },
  },
} as UserConfig);
