// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
	const post = await import(`../${params.slug}.md`);
	const { title, date, description, keywords, tags, image, imageAlt } = post.metadata;
	const Content = post.default;

	return {
		title,
		date,
		description: description || '',
		keywords: keywords || '',
		tags: tags || [],
		image: image || undefined,
		imageAlt: imageAlt || title,
		Content,
		slug: params.slug
	};
}) satisfies PageLoad;
