import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [mdx(), tailwind()],
  output: 'static',
  // Override site per-clone in env or here; placeholder keeps build valid
  site: process.env.SITE_URL ?? 'https://example.com',
});
