// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';
import { fetchPosts, type Post } from '$lib/utils/posts';

export type RelatedPost = { slug: string; title: string; description: string };

export const load = (async ({ params, fetch }) => {
	const post = await import(`../${params.slug}.md`);
	const { title, date, description, keywords, tags, image, imageAlt, related } = post.metadata;

	const relatedSlugs: string[] = Array.isArray(related) ? related : [];
	let relatedPosts: RelatedPost[] = [];
	if (relatedSlugs.length) {
		const allPosts: Post[] = await fetchPosts(fetch);
		const bySlug = new Map(allPosts.map((p) => [p.path.replace('/writings/', ''), p]));
		relatedPosts = relatedSlugs
			.filter((slug) => slug !== params.slug && bySlug.has(slug))
			.map((slug) => {
				const p = bySlug.get(slug)!;
				return {
					slug,
					title: p.meta.title,
					description: typeof p.meta.description === 'string' ? p.meta.description : ''
				};
			});
	}
	const Content = post.default;

	// Calculate reading time from word count (assuming 200 words per minute)
	// For Svelte 5, we'll estimate from the raw markdown content instead
	let wordCount = 0;
	try {
		// Try to get the raw markdown content from the module
		const moduleText = await import(`../${params.slug}.md?raw`);
		const rawMarkdown = moduleText.default || '';
		// Remove frontmatter and count words
		const contentWithoutFrontmatter = rawMarkdown.replace(/^---[\s\S]*?---\n/, '');
		wordCount = contentWithoutFrontmatter
			.replace(/[#*_`[\]()]/g, '') // Remove markdown formatting
			.split(/\s+/)
			.filter((word: string) => word.length > 0).length;
	} catch {
		// Fallback: estimate based on description length
		const descriptionWords = (description || '').split(/\s+/).length;
		wordCount = Math.max(descriptionWords * 10, 200); // Rough estimate
	}

	const readingTimeMinutes = Math.ceil(wordCount / 200);
	const duration = `~ ${readingTimeMinutes} min read`;

	return {
		title,
		date,
		description: description || '',
		keywords: keywords || '',
		tags: tags || [],
		image: image || undefined,
		imageAlt: imageAlt || title,
		Content,
		duration,
		relatedPosts,
		slug: params.slug
	};
}) satisfies PageLoad;
