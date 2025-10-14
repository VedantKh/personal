// src/routes/private/+page.ts
import type { PageLoad } from './$types';
import { loadPosts } from '$lib/utils/posts';

export const load = (async ({ fetch }) => {
	return loadPosts({ fetch });
}) satisfies PageLoad;


