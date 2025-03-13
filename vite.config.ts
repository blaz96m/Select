import { UserConfig, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";
import { analyzer } from "vite-bundle-analyzer";

export default defineConfig({
  plugins: [tsconfigPaths(), react(), analyzer()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/tests/setup.ts",
  } /*
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "select-ui",
      fileName: "selectUi",
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
  },*/,
} as UserConfig);
