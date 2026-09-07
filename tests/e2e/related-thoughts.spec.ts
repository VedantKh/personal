import { test, expect, type Page } from '@playwright/test';
import { publishedEssays, essayBySlug } from './helpers';

const section = (page: Page) => page.getByTestId('related-thoughts');
const relatedLinks = (page: Page) => section(page).getByRole('link');

const expectedRelated = (slug: string) =>
	(essayBySlug(slug)?.related ?? [])
		.filter((s) => s !== slug)
		.map((s) => essayBySlug(s))
		.filter((e) => e && e.published) as NonNullable<ReturnType<typeof essayBySlug>>[];

test.describe('Related thoughts', () => {
	const essays = publishedEssays();
	const withHiddenRelated = essays.find((e) =>
		e.related.some((s) => essayBySlug(s) && !essayBySlug(s)!.published)
	);

	test('AC7: Given a published essay, When I scroll to the bottom, Then a "Related thoughts" section follows the body', async ({
		page
	}) => {
		await page.goto('/writings/leverage');
		const heading = section(page).getByRole('heading', { name: 'Related thoughts' });
		await heading.scrollIntoViewIfNeeded();
		await expect(heading).toBeVisible();

		const articleBottom = await page.locator('article .post-meta-container').boundingBox();
		const sectionBox = await section(page).boundingBox();
		expect(sectionBox!.y).toBeGreaterThan(articleBottom!.y);
	});

	test('AC8: Given an essay declares related slugs, When I read the section, Then links show target titles and hrefs', async ({
		page
	}) => {
		await page.goto('/writings/leverage');
		const expected = expectedRelated('leverage');
		expect(expected.length).toBeGreaterThan(0);
		const links = relatedLinks(page);
		await expect(links).toHaveCount(expected.length);
		for (const [i, e] of expected.entries()) {
			await expect(links.nth(i)).toHaveText(e.title);
			await expect(links.nth(i)).toHaveAttribute('href', `/writings/${e.slug}`);
		}
	});

	test('AC9: Given a related slug points to a hidden/draft essay, When I read the section, Then it is omitted', async ({
		page
	}) => {
		expect(
			withHiddenRelated,
			'fixture: an essay whose related list includes an unpublished essay'
		).toBeTruthy();
		await page.goto(`/writings/${withHiddenRelated!.slug}`);
		const hrefs = await relatedLinks(page).evaluateAll((els) =>
			els.map((a) => a.getAttribute('href'))
		);
		for (const slug of withHiddenRelated!.related) {
			const target = essayBySlug(slug);
			if (target && !target.published) expect(hrefs).not.toContain(`/writings/${slug}`);
		}
		expect(hrefs.length).toBeGreaterThan(0);
	});

	test('AC10: Given I am on an essay, When I click a related link, Then I land on that essay', async ({
		page
	}) => {
		await page.goto('/writings/boredom');
		const first = relatedLinks(page).first();
		const title = (await first.textContent())!.trim();
		const href = (await first.getAttribute('href'))!;
		await first.click();
		await expect(page).toHaveURL(href);
		await expect(page.locator('h1.post-h1')).toHaveText(title);
	});

	test('AC11: Given every essay, When I read its section, Then it never links to itself', async ({
		page
	}) => {
		for (const essay of essays) {
			await page.goto(`/writings/${essay.slug}`);
			const hrefs = await relatedLinks(page).evaluateAll((els) =>
				els.map((a) => a.getAttribute('href'))
			);
			expect(hrefs, essay.slug).not.toContain(`/writings/${essay.slug}`);
		}
	});

	test('AC12: Given every published essay, When I count related links, Then there are 1-3 distinct ones', async ({
		page
	}) => {
		for (const essay of essays) {
			await page.goto(`/writings/${essay.slug}`);
			const hrefs = await relatedLinks(page).evaluateAll((els) =>
				els.map((a) => a.getAttribute('href'))
			);
			expect(hrefs.length, essay.slug).toBeGreaterThanOrEqual(1);
			expect(hrefs.length, essay.slug).toBeLessThanOrEqual(3);
			expect(new Set(hrefs).size, essay.slug).toBe(hrefs.length);
		}
	});

	test('AC14: Given an essay, When I inspect the section, Then it is an accessible labelled aside', async ({
		page
	}) => {
		await page.goto('/writings/thinking');
		const aside = page.locator('aside[data-testid="related-thoughts"]');
		await expect(aside).toHaveAttribute('aria-labelledby', 'related-heading');
		await expect(aside.locator('#related-heading')).toHaveText('Related thoughts');
		await expect(page.getByRole('complementary', { name: 'Related thoughts' })).toBeVisible();
		await expect(aside.locator('ul > li > a')).toHaveCount(await relatedLinks(page).count());
	});
});
