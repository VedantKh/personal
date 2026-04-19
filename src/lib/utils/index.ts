export const fetchMarkdownPosts = async () => {
	// import meta.glob imports any files that match the wildcard string
	// which is all files in writings. This returns an object where each
	// file's relative path is the key, and the value is a "resolver"
	// function that loads the file's contents as a JS promise
	const allPostFiles = import.meta.glob('/src/routes/writings/*.md');
	const iterablePostFiles = Object.entries(allPostFiles);

	const allPosts = await Promise.all(
		// shaping each file's data to handle metadata
		iterablePostFiles.map(async ([path, resolver]) => {
			interface PostModule {
				metadata: {
					title: string;
					date: string;
					hidden?: string | boolean;
					draft?: string | boolean;
					[key: string]: unknown;
				};
			}

			const resolvedPost = (await resolver()) as PostModule;
			const { metadata } = resolvedPost;

			// /src/routes/writings/post-title.md -> /writings/post-title
			// slice off /src/routes from the start, and .md from the end
			const postPath = path.slice(11, -3);

			return {
				meta: metadata,
				path: postPath
			};
		})
	);

	// Filter out any posts marked hidden or draft. Accepts boolean `true` or string 'yes'/'true'
	// so either `draft: yes` or `draft: true` in frontmatter hides a post from listings + sitemap.
	const isTruthyFlag = (v: unknown): boolean =>
		v === true || v === 'yes' || v === 'true' || v === 'ye';

	return allPosts.filter(
		(post) => !isTruthyFlag(post.meta.hidden) && !isTruthyFlag(post.meta.draft)
	);
};
