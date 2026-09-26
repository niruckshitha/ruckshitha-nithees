import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// WhatsApp needs an absolute address for the preview image (og:image).
// On Netlify, fall back to the site's own address (Netlify sets URL during the build).
const env = (globalThis as unknown as { process: { env: Record<string, string | undefined> } }).process.env;
if (!env.VITE_SITE_URL && env.URL) {
  env.VITE_SITE_URL = env.URL.replace(/\/$/, '');
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { target: 'es2020', assetsInlineLimit: 0 },
});
