import run from "@rollup/plugin-run";
import swc from "@rollup/plugin-swc";

const dev = process.env.ROLLUP_WATCH === "true";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
  },
  plugins: [swc(), dev && run()],
};
