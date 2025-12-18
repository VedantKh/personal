import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const metadata = {
		title: 'Books',
		description:
			"Highlights and notes from books I've read - automatically synced from Apple Books.",
		keywords: 'Vedant Khanna books, reading list, book highlights, book notes, Apple Books'
	};

	// Fetch highlights data
	let highlights = {
		lastUpdated: new Date().toISOString(),
		totalBooks: 0,
		totalHighlights: 0,
		books: []
	};

	try {
		const response = await fetch('/data/books-highlights.json');
		if (response.ok) {
			highlights = await response.json();
		}
	} catch (err) {
		console.error('Failed to load book highlights:', err);
	}

	return {
		metadata,
		highlights
	};
};
