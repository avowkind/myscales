import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Project is published to GitHub Pages under https://<user>.github.io/scaleshaper/,
// so the production build is served from the /scaleshaper base path. For a custom
// domain or a <user>.github.io repo, set BASE_PATH='' (root).
const base = process.env.BASE_PATH ?? (process.env.NODE_ENV === 'production' ? '/scaleshaper' : '');

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			paths: { base },

			// Static SPA: deep links like /scale/[id] are served via a 404.html
			// fallback (GitHub Pages serves 404.html for unknown paths; the app
			// then boots and client-routes).
			adapter: adapter({ fallback: '404.html' })
		})
	]
});
