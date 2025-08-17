import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, fetch }) => {
	const site = url.origin;

	// Fetch all blog posts
	const postsResponse = await fetch('/api/posts');
	const posts = await postsResponse.json();

	// Static pages
	const staticPages = [
		{ url: '/', changefreq: 'monthly', priority: '1.0' },
		{ url: '/experience', changefreq: 'monthly', priority: '0.8' },
		{ url: '/projects', changefreq: 'monthly', priority: '0.8' },
		{ url: '/writings', changefreq: 'weekly', priority: '0.9' },
		{ url: '/readings', changefreq: 'monthly', priority: '0.7' }
	];

	// Generate sitemap XML
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
	.map(
		(page) => `    <url>
        <loc>${site}${page.url}</loc>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`
	)
	.join('\n')}
${posts
	.map(
		(post: { path: string; meta: { date: string } }) => `    <url>
        <loc>${site}/writings/${post.path.replace('src/routes/writings/', '').replace('.md', '')}</loc>
        <lastmod>${new Date(post.meta.date).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>`
	)
	.join('\n')}
</urlset>`.trim();

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600' // Cache for 1 hour
		}
	});
};

// Prerender the sitemap at build time
export const prerender = true;
