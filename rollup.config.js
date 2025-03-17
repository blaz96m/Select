import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import alias from "@rollup/plugin-alias";
import postcss from "rollup-plugin-postcss";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";

const projectRootDir = path.resolve(__dirname);

const packageJson = require("./package.json");

const customResolver = resolve({
  extensions: [".mjs", ".js", ".jsx", ".json", ".sass", ".scss", ".ts", ".tsx"],
  preferBuiltins: false,
});

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: false,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: false,
      },
    ],
    plugins: [
      peerDepsExternal(),
      typescript({ tsconfig: "./tsconfig.json" }),
      alias({
        resolve: [".js", ".ts"],
        entries: [
          { find: "src", replacement: path.resolve(projectRootDir, "src") },
        ],
        customResolver,
      }),
      resolve(),
      commonjs(),
      postcss({
        extract: true,
      }),
      terser(),
      visualizer({
        open: true,
      }),
    ],
    external: ["react", "react-dom", "react/jsx-runtime"],
  },
  {
    input: "src/index.ts",
    output: [{ file: packageJson.types }],
    plugins: [
      alias({
        resolve: [".js", ".ts"],
        entries: [
          { find: "src", replacement: path.resolve(projectRootDir, "src") },
        ],
        customResolver,
      }),
      dts.default(),
    ],
    external: ["react", "react-dom", "react/jsx-runtime"],
  },
];
