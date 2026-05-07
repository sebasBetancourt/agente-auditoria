import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/infrastructure/http/server.ts'],
  format: ['esm'],
  outDir: 'dist',
  outExtension: () => ({ js: '.js' }),
  clean: true,
  bundle: true,
  platform: 'node',
  target: 'node20',
  sourcemap: false,
  splitting: false,
  // Excluir puppeteer del bundle (usa el instalado en node_modules)
  external: ['puppeteer'],
});
