// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	try {
		const post = await import(`../${params.slug}.md`);
		const { title, date } = post.metadata;
		const Content = post.default;

		return {
			title,
			date,
			Content
		};
	} catch (e) {
		console.error(`Failed to load post: ${params.slug}`, e);
		throw error(404, `Could not find ${params.slug}`);
	}
}) satisfies PageLoad;
