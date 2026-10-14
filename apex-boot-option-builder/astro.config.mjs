import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const owner = process.env.GITHUB_REPOSITORY?.split('/')[0];
const base = process.env.ASTRO_BASE_PATH ?? (process.env.GITHUB_ACTIONS && repo !== `${owner}.github.io` ? `/${repo}/` : '/');

export default defineConfig({ integrations: [svelte()], base, outDir: process.env.ASTRO_OUT_DIR ?? './dist/', output: 'static' });
