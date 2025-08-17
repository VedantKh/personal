// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
	const post = await import(`../${params.slug}.md`);
	const { title, date, description, keywords, tags, image, imageAlt } = post.metadata;
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
		slug: params.slug
	};
}) satisfies PageLoad;
