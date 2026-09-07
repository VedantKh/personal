import type { RequestHandler } from './$types';
import type { Post } from '$lib/utils/posts';

const SITE_TITLE = 'Vedant Khanna';
const SITE_DESCRIPTION = 'Essays on building, leverage, fundraising, and thinking.';

const escapeXml = (s: string) =>
	s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');

export const GET: RequestHandler = async ({ url, fetch }) => {
	const site = url.origin;
	const posts: Post[] = await (await fetch('/api/posts')).json();

	const items = posts
		.map((post) => {
			const link = `${site}${post.path}`;
			const description = typeof post.meta.description === 'string' ? post.meta.description : '';
			return `    <item>
      <title>${escapeXml(post.meta.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(post.meta.date).toUTCString()}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
		})
		.join('\n');

	const lastBuildDate = posts.length
		? new Date(posts[0].meta.date).toUTCString()
		: new Date().toUTCString();

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${site}/writings</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

	return new Response(rss, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};

export const prerender = true;
