import run from "@rollup/plugin-run";
import swc from "@rollup/plugin-swc";

export default {
  input: "src-consumer/index.ts",
  output: {
    file: "dist/index-consumer.mjs",
    format: "es",
  },
  plugins: [swc(), run()],
};
