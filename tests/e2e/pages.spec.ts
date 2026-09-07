import { test, expect } from '@playwright/test';

const routes = ['/', '/writings', '/snippets', '/books'];

test.describe('Core pages', () => {
	for (const route of routes) {
		test(`AC13: Given ${route}, When the page loads, Then it renders a heading without console errors`, async ({
			page
		}) => {
			const errors: string[] = [];
			page.on('console', (msg) => {
				// Vercel analytics scripts are injected by the Vercel edge and 404 in local preview
				const fromVercel = msg.location().url.includes('/_vercel/');
				if (msg.type() === 'error' && !fromVercel) errors.push(msg.text());
			});
			page.on('pageerror', (err) => errors.push(err.message));

			const res = await page.goto(route);
			expect(res?.status()).toBe(200);
			await expect(page.getByRole('heading').first()).toBeVisible();
			expect(errors).toEqual([]);
		});
	}
});
