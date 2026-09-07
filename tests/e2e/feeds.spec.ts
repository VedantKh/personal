import { test, expect } from '@playwright/test';
import { publishedEssays, unpublishedEssays } from './helpers';

const ORIGIN = 'https://www.vedant.space';

const items = (xml: string) => [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
const field = (item: string, tag: string) =>
	item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1] ?? '';

test.describe('RSS feed', () => {
	test('AC1: Given the site is built, When I request /rss.xml, Then I get a valid RSS document', async ({
		request
	}) => {
		const res = await request.get('/rss.xml');
		expect(res.status()).toBe(200);
		expect(res.headers()['content-type']).toMatch(/xml/);
		const xml = await res.text();
		expect(xml.trimStart()).toMatch(/^<\?xml/);
		expect(xml).toContain('<rss version="2.0"');
		expect(xml).toContain('<channel>');
		expect(xml).toContain('<title>Vedant Khanna</title>');
	});

	test('AC2: Given published essays exist, When I parse the feed, Then each has a complete <item>', async ({
		request
	}) => {
		const xml = await (await request.get('/rss.xml')).text();
		const feedItems = items(xml);
		const essays = publishedEssays();
		expect(feedItems).toHaveLength(essays.length);
		for (const essay of essays) {
			const item = feedItems.find((i) => field(i, 'link') === `${ORIGIN}/writings/${essay.slug}`);
			expect(item, `item for ${essay.slug}`).toBeTruthy();
			expect(field(item!, 'title')).toBe(essay.title.replace(/&/g, '&amp;'));
			expect(field(item!, 'guid')).toBe(`${ORIGIN}/writings/${essay.slug}`);
			expect(new Date(field(item!, 'pubDate')).toISOString().slice(0, 10)).toBe(essay.date);
		}
	});

	test('AC3: Given draft/hidden essays exist, When I parse the feed, Then they are excluded', async ({
		request
	}) => {
		const xml = await (await request.get('/rss.xml')).text();
		const hidden = unpublishedEssays();
		expect(hidden.length).toBeGreaterThan(0);
		for (const essay of hidden) {
			expect(xml).not.toContain(`/writings/${essay.slug}<`);
		}
	});

	test('AC4: Given feed items, When I read their order, Then they are newest-first with production links', async ({
		request
	}) => {
		const xml = await (await request.get('/rss.xml')).text();
		const dates = items(xml).map((i) => new Date(field(i, 'pubDate')).getTime());
		for (let i = 1; i < dates.length; i++) expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
		expect(xml).not.toContain('sveltekit-prerender');
		expect(xml).toContain(`<atom:link href="${ORIGIN}/rss.xml"`);
	});

	test('AC5: Given any HTML page, When I inspect <head>, Then the feed is discoverable', async ({
		page
	}) => {
		await page.goto('/writings');
		const link = page.locator('link[rel="alternate"][type="application/rss+xml"]');
		await expect(link).toHaveAttribute('href', '/rss.xml');
	});
});

test.describe('Sitemap', () => {
	test('AC6: Given the site is built, When I request /sitemap.xml, Then live pages are listed and dead ones are not', async ({
		request
	}) => {
		const xml = await (await request.get('/sitemap.xml')).text();
		expect(xml).toContain(`<loc>${ORIGIN}/snippets</loc>`);
		expect(xml).toContain(`<loc>${ORIGIN}/books</loc>`);
		expect(xml).not.toContain('/readings');
		expect(xml).not.toContain('sveltekit-prerender');
	});
});
