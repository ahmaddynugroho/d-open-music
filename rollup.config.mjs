import run from "@rollup/plugin-run";
import swc from "@rollup/plugin-swc";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.mjs",
    format: "es",
  },
  plugins: [swc(), run()],
};
