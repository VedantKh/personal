export const fetchMarkdownPosts = async () => {
    // import meta.glob imports any files that match the wildcard string
    // which is all files in blogs. This returns an object where each 
    // file's relative path is the key, and the value is a "resolver"
    // function that loads the file's contents as a JS promise
	const allPostFiles = import.meta.glob('/src/routes/blogs/*.md');
	const iterablePostFiles = Object.entries(allPostFiles);

	const allPosts = await Promise.all(
        // shaping each file's data to handle metadata 
		iterablePostFiles.map(async ([path, resolver]) => {
			interface PostModule {
				metadata: {
					title: string;
					date: string;
					[key: string]: unknown;
				};
			}

			const resolvedPost = (await resolver()) as PostModule;
			const { metadata } = resolvedPost;

            // /src/routes/blogs/post-title.md -> /blogs/post-title
            // slice off /src/routes from the start, and .md from the end
			const postPath = path.slice(11, -3);

			return {
				meta: metadata,
				path: postPath
			};
		})
	);

	return allPosts;
};
