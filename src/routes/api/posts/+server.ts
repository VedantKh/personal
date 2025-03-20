import { fetchMarkdownPosts } from '$lib/utils';
import { json } from '@sveltejs/kit';

// +server.ts
export const GET = async () => {
	const allPosts = await fetchMarkdownPosts();

	const sortedPosts = allPosts.sort((a, b) => {
        // typescript doesn't subtract dates directly
		return new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime();
	});

	return json(sortedPosts);
};

