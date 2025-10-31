// mdsvex.config.js
import { defineMDSveXConfig as defineConfig } from 'mdsvex';

const layoutPath = `${process.cwd()}/src/lib/components/MarkdownLayout.svelte`;

const config = defineConfig({
	extensions: ['.md'],
	layout: { _: layoutPath },
	smartypants: { dashes: 'oldschool' },
	remarkPlugins: [],
	rehypePlugins: []
});

export default config;