import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/main.ts', 'src/bin/cli.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist/',
  clean: true,
  sourcemap: false,
  treeshake: false,
  target: 'es2022',
  platform: 'node',
  tsconfig: './tsconfig.json',
  cjsDefault: true,
  fixedExtension: true,
  minify: false,
})
