#!/usr/bin/env node

/**
 * Goodreads Link Fetcher
 *
 * Fetches Goodreads URLs for books by searching the Goodreads API/website
 * and updates the books-highlights.json file with goodreadsUrl field.
 *
 * Usage: node scripts/fetch-goodreads-links.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOODREADS_SEARCH_BASE = 'https://www.goodreads.com/search?q=';

function normalizeForSearch(text) {
	return encodeURIComponent(text.trim());
}

function generateGoodreadsSearchUrl(title, author) {
	const query = `${title} ${author}`;
	return `${GOODREADS_SEARCH_BASE}${normalizeForSearch(query)}`;
}

async function fetchGoodreadsUrl(title, author) {
	try {
		const searchUrl = generateGoodreadsSearchUrl(title, author);
		const response = await fetch(searchUrl, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
			},
			redirect: 'follow'
		});

		if (!response.ok) {
			console.log(`  ⚠️  Failed to fetch for "${title}": ${response.status}`);
			return null;
		}

		const html = await response.text();

		// Extract the first book result URL from the search results
		// Goodreads book URLs follow the pattern: /book/show/{id}-{slug}
		const bookUrlMatch = html.match(/\/book\/show\/\d+[^"'\s]*/);

		if (bookUrlMatch) {
			const bookPath = bookUrlMatch[0];
			return `https://www.goodreads.com${bookPath}`;
		}

		console.log(`  ⚠️  No Goodreads URL found for "${title}"`);
		return null;
	} catch (error) {
		console.log(`  ❌ Error fetching Goodreads URL for "${title}": ${error.message}`);
		return null;
	}
}

async function main() {
	console.log('🔍 Fetching Goodreads links for books...');
	console.log('');

	const outputDir = path.join(__dirname, '..', 'static', 'data');
	const highlightsPath = path.join(outputDir, 'books-highlights.json');

	if (!fs.existsSync(highlightsPath)) {
		console.error('❌ books-highlights.json not found. Run sync-books first.');
		process.exit(1);
	}

	const data = JSON.parse(fs.readFileSync(highlightsPath, 'utf8'));

	if (!data.books || data.books.length === 0) {
		console.log('No books found in highlights file.');
		return;
	}

	console.log(`📚 Processing ${data.books.length} books...`);
	console.log('');

	let updated = 0;
	let skipped = 0;
	let failed = 0;

	for (const book of data.books) {
		// Skip if already has a Goodreads URL
		if (book.goodreadsUrl) {
			console.log(`✓ "${book.title}" - already has Goodreads URL`);
			skipped++;
			continue;
		}

		console.log(`🔎 Searching for "${book.title}" by ${book.author}...`);

		const goodreadsUrl = await fetchGoodreadsUrl(book.title, book.author);

		if (goodreadsUrl) {
			book.goodreadsUrl = goodreadsUrl;
			console.log(`  ✅ Found: ${goodreadsUrl}`);
			updated++;
		} else {
			failed++;
		}

		// Rate limiting: wait 1 second between requests to be respectful
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	// Write updated data back to file
	fs.writeFileSync(highlightsPath, JSON.stringify(data, null, 2));

	console.log('');
	console.log('📊 Summary:');
	console.log(`   ✅ Updated: ${updated}`);
	console.log(`   ⏭️  Skipped (already had URL): ${skipped}`);
	console.log(`   ❌ Failed: ${failed}`);
	console.log('');
	console.log(`✅ Saved to ${highlightsPath}`);
}

main().catch((err) => {
	console.error('Error:', err);
	process.exit(1);
});
