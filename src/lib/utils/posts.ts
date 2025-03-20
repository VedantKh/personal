/**
 * Utility functions for fetching posts data
 */

export type Post = {
	path: string;
	meta: {
		title: string;
		date: string;
		[key: string]: unknown; // For additional metadata properties
	};
};

export type Posts = Post[];

/**
 * Fetches posts from the API
 */
export async function fetchPosts(fetch: (input: RequestInfo) => Promise<Response>) {
	const response = await fetch(`/api/posts`);
	const posts = await response.json();
	return posts;
}

/**
 * Loads posts data for use in SvelteKit routes
 */
export async function loadPosts({ fetch }: { fetch: (input: RequestInfo) => Promise<Response> }) {
	const posts = await fetchPosts(fetch);
	return {
		posts
	};
}
