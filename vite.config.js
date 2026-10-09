import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // HMR is disabled in AI Studio via DISABLE_HMR env var to prevent flickering during agent edits.
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
