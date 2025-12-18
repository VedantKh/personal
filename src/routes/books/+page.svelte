<script lang="ts">
	import type { PageData } from './$types';
	import { ChevronDown, ChevronUp, BookOpen, Quote, Tag, Search, X } from 'lucide-svelte';
	import Fuse from 'fuse.js';

	const { data } = $props<{ data: PageData }>();
	const { highlights } = data;

	// Track which books are expanded
	let expandedBooks = $state<Set<string>>(new Set());

	// Track selected tag filter (null = show all)
	let selectedTag = $state<string | null>(null);

	// Search query for fuzzy search
	let searchQuery = $state('');

	// Build flat list of all highlights with book info for searching
	let allHighlights = $derived(
		highlights.books.flatMap((book: any) =>
			book.highlights.map((h: any, idx: number) => ({
				...h,
				bookId: book.id,
				bookTitle: book.title,
				bookAuthor: book.author,
				bookTags: book.tags,
				highlightIndex: idx
			}))
		)
	);

	// Fuse.js instance for fuzzy search
	let fuse = $derived(
		new Fuse(allHighlights, {
			keys: [
				{ name: 'quote', weight: 0.4 },
				{ name: 'note', weight: 0.3 },
				{ name: 'bookTitle', weight: 0.2 },
				{ name: 'bookAuthor', weight: 0.1 }
			],
			threshold: 0.4,
			ignoreLocation: true,
			includeMatches: true
		})
	);

	// Search results grouped by book
	let searchResults = $derived.by(() => {
		if (!searchQuery.trim()) return null;

		const results = fuse.search(searchQuery);
		const groupedByBook = new Map<string, { book: any; highlights: any[] }>();

		for (const result of results) {
			const item = result.item;
			const book = highlights.books.find((b: any) => b.id === item.bookId);
			if (!book) continue;

			// Apply tag filter if active
			if (selectedTag && !book.tags?.includes(selectedTag)) continue;

			if (!groupedByBook.has(item.bookId)) {
				groupedByBook.set(item.bookId, { book, highlights: [] });
			}
			groupedByBook.get(item.bookId)!.highlights.push({
				...item,
				matches: result.matches
			});
		}

		return Array.from(groupedByBook.values());
	});

	function clearSearch() {
		searchQuery = '';
	}

	function toggleBook(bookId: string) {
		if (expandedBooks.has(bookId)) {
			expandedBooks.delete(bookId);
			expandedBooks = new Set(expandedBooks);
		} else {
			expandedBooks.add(bookId);
			expandedBooks = new Set(expandedBooks);
		}
	}

	function expandAll() {
		expandedBooks = new Set(filteredBooks.map((b: any) => b.id));
	}

	function collapseAll() {
		expandedBooks = new Set();
	}

	function toggleTagFilter(tag: string) {
		if (selectedTag === tag) {
			selectedTag = null;
		} else {
			selectedTag = tag;
		}
	}

	// Filter books by selected tag (only used when not searching)
	let filteredBooks = $derived(
		selectedTag
			? highlights.books.filter((b: any) => b.tags?.includes(selectedTag))
			: highlights.books
	);

	// Auto-expand books that have search results
	$effect(() => {
		if (searchResults && searchResults.length > 0) {
			expandedBooks = new Set(searchResults.map((r) => r.book.id));
		}
	});

	// Color classes for highlight colors
	const colorClasses: Record<string, string> = {
		yellow: 'highlight-yellow',
		green: 'highlight-green',
		blue: 'highlight-blue',
		pink: 'highlight-pink',
		purple: 'highlight-purple',
		underline: 'highlight-underline'
	};
</script>

<h1>Books</h1>

<p class="intro">
	Highlights and notes from books I've read, automatically synced from Apple Books.
</p>

{#if highlights.totalBooks > 0}
	<div class="stats">
		<span class="stat">
			<BookOpen size={16} />
			{highlights.totalBooks} books
		</span>
		<span class="stat">
			<Quote size={16} />
			{highlights.totalHighlights} highlights
		</span>
		<span class="stat-date">
			Last updated: {new Date(highlights.lastUpdated).toLocaleDateString()}
		</span>
	</div>

	<div class="search-container">
		<div class="search-input-wrapper">
			<Search size={18} />
			<input
				type="text"
				class="search-input"
				placeholder="Search highlights, notes, books..."
				bind:value={searchQuery}
			/>
			{#if searchQuery}
				<button class="clear-search" onclick={clearSearch}>
					<X size={16} />
				</button>
			{/if}
		</div>
		{#if searchResults}
			<span class="search-status">
				Found {searchResults.reduce((acc, r) => acc + r.highlights.length, 0)} highlights in {searchResults.length}
				books
			</span>
		{/if}
	</div>

	{#if highlights.availableTags?.length > 0}
		<div class="tag-filters">
			<Tag size={14} />
			{#each highlights.availableTags as tag}
				<button
					class="tag-chip"
					class:active={selectedTag === tag}
					onclick={() => toggleTagFilter(tag)}
				>
					{tag}
				</button>
			{/each}
			{#if selectedTag}
				<button class="clear-filter" onclick={() => (selectedTag = null)}> Clear filter </button>
			{/if}
		</div>
	{/if}

	<div class="controls">
		{#if selectedTag}
			<span class="filter-status"
				>Showing {filteredBooks.length} of {highlights.totalBooks} books</span
			>
		{/if}
	</div>

	<div class="books-list">
		{#if searchResults}
			<!-- Search results view -->
			{#each searchResults as { book, highlights: matchedHighlights } (book.id)}
				<div class="book-card">
					<button class="book-header" onclick={() => toggleBook(book.id)}>
						<div class="book-info">
							<h2 class="book-title">{book.title}</h2>
							<span class="book-author">by {book.author}</span>
							<span class="highlight-count">{matchedHighlights.length} matching highlights</span>
						</div>
						<div class="book-right">
							{#if book.tags?.length > 0}
								<div class="book-tags">
									{#each book.tags as tag}
										<span class="tag-badge">{tag}</span>
									{/each}
								</div>
							{/if}
							<div class="expand-icon">
								{#if expandedBooks.has(book.id)}
									<ChevronUp size={20} />
								{:else}
									<ChevronDown size={20} />
								{/if}
							</div>
						</div>
					</button>

					{#if expandedBooks.has(book.id)}
						<div class="book-content">
							<div class="highlights-list">
								{#each matchedHighlights as highlight}
									<div class="highlight-item {colorClasses[highlight.color] || 'highlight-yellow'}">
										<blockquote class="highlight-quote">
											"{highlight.quote}"
										</blockquote>
										{#if highlight.note}
											<p class="highlight-note">
												<strong>Note:</strong>
												{highlight.note}
											</p>
										{/if}
										{#if highlight.chapter}
											<span class="highlight-chapter">{highlight.chapter}</span>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<div class="no-results">
					<p>No highlights found for "{searchQuery}"</p>
				</div>
			{/each}
		{:else}
			<!-- Default book list view -->
			{#each filteredBooks as book (book.id)}
				<div class="book-card">
					<button class="book-header" onclick={() => toggleBook(book.id)}>
						<div class="book-info">
							<h2 class="book-title">{book.title}</h2>
							<span class="book-author">by {book.author}</span>
							<span class="highlight-count">{book.highlights.length} highlights</span>
						</div>
						<div class="book-right">
							{#if book.tags?.length > 0}
								<div class="book-tags">
									{#each book.tags as tag}
										<span class="tag-badge">{tag}</span>
									{/each}
								</div>
							{/if}
							<div class="expand-icon">
								{#if expandedBooks.has(book.id)}
									<ChevronUp size={20} />
								{:else}
									<ChevronDown size={20} />
								{/if}
							</div>
						</div>
					</button>

					{#if expandedBooks.has(book.id)}
						<div class="book-content">
							{#if book.summary}
								<div class="book-summary">
									<p>{book.summary}</p>
								</div>
							{/if}
							<div class="highlights-list">
								{#each book.highlights as highlight, i}
									<div class="highlight-item {colorClasses[highlight.color] || 'highlight-yellow'}">
										<blockquote class="highlight-quote">
											"{highlight.quote}"
										</blockquote>
										{#if highlight.note}
											<p class="highlight-note">
												<strong>Note:</strong>
												{highlight.note}
											</p>
										{/if}
										{#if highlight.chapter}
											<span class="highlight-chapter">{highlight.chapter}</span>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
{:else}
	<div class="empty-state">
		<BookOpen size={48} />
		<p>No highlights yet. Start reading and highlighting in Apple Books!</p>
	</div>
{/if}

<style lang="scss">
	h1 {
		margin-bottom: 0.5rem;
	}

	.intro {
		color: var(--text-muted);
		margin-bottom: 1.5rem;
	}

	.stats {
		display: flex;
		gap: 1.5rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: rgba(110, 209, 255, 0.9);
		font-size: 0.95rem;
	}

	.stat-date {
		color: var(--text-muted);
		font-size: 0.85rem;
	}

	.search-container {
		margin-bottom: 1rem;
	}

	.search-input-wrapper {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 0.75rem 1rem;
		transition: all 0.2s ease;

		&:focus-within {
			border-color: rgba(110, 209, 255, 0.4);
			background: rgba(110, 209, 255, 0.05);
		}

		:global(svg) {
			color: var(--text-muted);
			flex-shrink: 0;
		}
	}

	.search-input {
		flex: 1;
		background: transparent;
		border: none;
		color: inherit;
		font-size: 0.95rem;
		outline: none;

		&::placeholder {
			color: var(--text-muted);
		}
	}

	.clear-search {
		background: transparent;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.2s ease;

		&:hover {
			color: rgba(255, 100, 100, 0.9);
			background: rgba(255, 100, 100, 0.1);
		}
	}

	.search-status {
		display: block;
		margin-top: 0.5rem;
		color: rgba(110, 209, 255, 0.8);
		font-size: 0.85rem;
	}

	.no-results {
		text-align: center;
		padding: 2rem 1rem;
		color: var(--text-muted);

		p {
			margin: 0;
		}
	}

	.tag-filters {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
		color: var(--text-muted);

		:global(svg) {
			opacity: 0.6;
		}
	}

	.tag-chip {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: rgba(255, 255, 255, 0.7);
		padding: 0.3rem 0.7rem;
		border-radius: 16px;
		cursor: pointer;
		font-size: 0.8rem;
		transition: all 0.2s ease;

		&:hover {
			background: rgba(110, 209, 255, 0.1);
			border-color: rgba(110, 209, 255, 0.4);
			color: rgba(110, 209, 255, 0.9);
		}

		&.active {
			background: rgba(110, 209, 255, 0.2);
			border-color: rgba(110, 209, 255, 0.6);
			color: rgba(110, 209, 255, 1);
		}
	}

	.clear-filter {
		background: transparent;
		border: none;
		color: rgba(255, 100, 100, 0.7);
		padding: 0.3rem 0.5rem;
		cursor: pointer;
		font-size: 0.8rem;
		transition: color 0.2s ease;

		&:hover {
			color: rgba(255, 100, 100, 1);
		}
	}

	.filter-status {
		color: var(--text-muted);
		font-size: 0.85rem;
		margin-left: auto;
	}

	.controls {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.control-btn {
		background: transparent;
		border: 1px solid rgba(110, 209, 255, 0.3);
		color: rgba(110, 209, 255, 0.8);
		padding: 0.4rem 0.8rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.85rem;
		transition: all 0.2s ease;

		&:hover {
			background: rgba(110, 209, 255, 0.1);
			border-color: rgba(110, 209, 255, 0.5);
		}
	}

	.books-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.book-card {
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.02);
	}

	.book-header {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: left;
		color: inherit;
		transition: background 0.2s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.03);
		}
	}

	.book-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.book-title {
		font-size: 1.1rem;
		margin: 0;
		border: none;
		padding: 0;
	}

	.book-author {
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.highlight-count {
		color: rgba(110, 209, 255, 0.7);
		font-size: 0.8rem;
		margin-top: 0.25rem;
	}

	.book-right {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-shrink: 0;
	}

	.book-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.tag-badge {
		background: rgba(110, 209, 255, 0.1);
		border: 1px solid rgba(110, 209, 255, 0.3);
		color: rgba(110, 209, 255, 0.8);
		padding: 0.2rem 0.5rem;
		border-radius: 12px;
		font-size: 0.7rem;
	}

	.expand-icon {
		color: rgba(110, 209, 255, 0.6);
		flex-shrink: 0;
	}

	.book-content {
		padding: 0 1.25rem 1.25rem;
	}

	.book-summary {
		background: rgba(110, 209, 255, 0.05);
		border-left: 3px solid rgba(110, 209, 255, 0.4);
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 0 6px 6px 0;

		p {
			margin: 0;
			font-size: 0.95rem;
			line-height: 1.6;
			color: rgba(255, 255, 255, 0.85);
		}
	}

	.highlights-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.highlight-item {
		padding: 1rem;
		border-radius: 6px;
		border-left: 3px solid;
	}

	.highlight-yellow {
		background: rgba(255, 235, 59, 0.08);
		border-left-color: rgba(255, 235, 59, 0.6);
	}

	.highlight-green {
		background: rgba(76, 175, 80, 0.08);
		border-left-color: rgba(76, 175, 80, 0.6);
	}

	.highlight-blue {
		background: rgba(33, 150, 243, 0.08);
		border-left-color: rgba(33, 150, 243, 0.6);
	}

	.highlight-pink {
		background: rgba(233, 30, 99, 0.08);
		border-left-color: rgba(233, 30, 99, 0.6);
	}

	.highlight-purple {
		background: rgba(156, 39, 176, 0.08);
		border-left-color: rgba(156, 39, 176, 0.6);
	}

	.highlight-underline {
		background: rgba(255, 255, 255, 0.03);
		border-left-color: rgba(255, 255, 255, 0.3);
	}

	.highlight-quote {
		margin: 0;
		font-style: italic;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.9);
	}

	.highlight-note {
		margin: 0.75rem 0 0;
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.7);
		padding-top: 0.75rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.highlight-chapter {
		display: inline-block;
		margin-top: 0.5rem;
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: var(--text-muted);

		:global(svg) {
			opacity: 0.4;
			margin-bottom: 1rem;
		}
	}
</style>
