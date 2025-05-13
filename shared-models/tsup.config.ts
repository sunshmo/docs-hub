import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    outDir: 'dist',
    sourcemap: false,
    minify: false,
    dts: true,
    clean: true,
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.mjs' : '.js'
      }
    }
  },
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    name: 'SharedModels',
    globalName: 'SharedModels',
    outDir: 'dist',
    sourcemap: false,
    minify: false,
    clean: true,
  },
]);
