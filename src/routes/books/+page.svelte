<script lang="ts">
	import type { PageData } from './$types';
	import { ChevronDown, ChevronUp, BookOpen, Quote, Tag, Search, X, Link } from 'lucide-svelte';
	import Fuse from 'fuse.js';
	import type { FuseResultMatch } from 'fuse.js';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { tick, onMount } from 'svelte';

	const { data } = $props<{ data: PageData }>();
	const { highlights } = data;

	// Track which books are expanded
	let expandedBooks = $state<Set<string>>(new Set());

	// Track focused highlight for deep linking
	let focusedHighlight = $state<{ bookId: string; index: number } | null>(null);

	// Track selected tag filter (null = show all)
	let selectedTag = $state<string | null>(null);

	// Search query for fuzzy search
	let searchQuery = $state('');

	type BooksContent = {
		bookId: string;
		title?: string;
		author?: string;
		chapters: { chapterId: string; chapterTitle: string; content: string }[];
	};

	type ContextMatch = {
		chapterTitle: string;
		snippetHtml: string;
		method: 'exact' | 'case_insensitive' | 'anchor';
	};

	let booksContent = $state<BooksContent | null>(null);
	let contextOpen = $state(false);
	let contextLoading = $state(false);
	let contextError = $state<string | null>(null);
	let contextBookTitle = $state<string | null>(null);
	let contextBookAuthor = $state<string | null>(null);
	let contextQuote = $state<string | null>(null);
	let contextMatch = $state<ContextMatch | null>(null);

	type SearchHighlight = {
		quote?: string;
		note?: string;
		color?: string;
		chapter?: string;
		bookId: string;
		bookTitle?: string;
		bookAuthor?: string;
		bookTags?: string[];
		highlightIndex: number;
		matches?: readonly FuseResultMatch[];
		useExact?: boolean;
	};

	type SearchGroup = { book: any; highlights: SearchHighlight[] };
	type SearchState = { groups: SearchGroup[]; useExact: boolean };

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
	) as SearchHighlight[];

	// Fuse.js instance for fuzzy search
	let fuse = $derived(
		new Fuse<SearchHighlight>(allHighlights, {
			keys: [
				{ name: 'quote', weight: 0.4 },
				{ name: 'note', weight: 0.3 },
				{ name: 'bookTitle', weight: 0.2 },
				{ name: 'bookAuthor', weight: 0.1 }
			],
			threshold: 0.25,
			ignoreLocation: true,
			minMatchCharLength: 3,
			includeMatches: true
		})
	);

	function normalizeForSearch(v: string | null | undefined): string {
		return (v ?? '').toLowerCase();
	}

	function escapeHtml(text: string): string {
		return text
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#39;');
	}

	function decodeHtmlEntities(text: string): string {
		if (typeof document === 'undefined') return text;
		const el = document.createElement('textarea');
		el.innerHTML = text;
		return el.value;
	}

	function canonicalizeText(text: string): string {
		return decodeHtmlEntities(text)
			.replaceAll('\u201C', '"')
			.replaceAll('\u201D', '"')
			.replaceAll('\u2018', "'")
			.replaceAll('\u2019', "'")
			.replaceAll('\u2013', '-')
			.replaceAll('\u2014', '-')
			.replaceAll('…', '...')
			.replaceAll(/\s+/g, ' ')
			.trim();
	}

	function looseCanonicalizeText(text: string): string {
		return canonicalizeText(text)
			.toLowerCase()
			.replaceAll(/[\u2013\u2014]/g, '-')
			.replaceAll(/[^a-z0-9\s]/g, ' ')
			.replaceAll(/\s+/g, ' ')
			.trim();
	}

	function escapeRegExp(text: string): string {
		return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	function buildSnippetHtml(
		content: string,
		matchStart: number,
		matchLen: number,
		windowSize = 450
	): string {
		if (matchLen <= 0) {
			const snippet = content.slice(0, Math.min(content.length, windowSize * 2));
			const suffix = snippet.length < content.length ? '…' : '';
			return `${escapeHtml(snippet)}${suffix}`;
		}

		const start = Math.max(0, matchStart - windowSize);
		const end = Math.min(content.length, matchStart + matchLen + windowSize);
		const snippet = content.slice(start, end);
		const prefix = start > 0 ? '…' : '';
		const suffix = end < content.length ? '…' : '';

		const relStart = Math.max(0, matchStart - start);
		const relEnd = Math.min(snippet.length, relStart + matchLen);

		const before = escapeHtml(snippet.slice(0, relStart));
		const mid = escapeHtml(snippet.slice(relStart, relEnd));
		const after = escapeHtml(snippet.slice(relEnd));
		return `${prefix}${before}<mark class="context-match">${mid}</mark>${after}${suffix}`;
	}

	function findTokenRegexMatch(
		haystack: string,
		needle: string
	): { start: number; length: number } | null {
		const q = canonicalizeText(needle);
		if (!q) return null;
		const tokens = q
			.split(/\s+/)
			.map((t) => t.trim())
			.filter(Boolean)
			.slice(0, 40);
		if (tokens.length === 0) return null;

		// Build a tolerant regex: allow punctuation/whitespace between tokens.
		const pattern = tokens.map((t) => escapeRegExp(t)).join('[\\s\\W]+');
		const re = new RegExp(pattern, 'i');
		const m = re.exec(haystack);
		if (!m || m.index === undefined) return null;
		return { start: m.index, length: m[0]?.length ?? 0 };
	}

	function findContextInChapters(
		quote: string,
		chapters: BooksContent['chapters']
	): ContextMatch | null {
		const q = canonicalizeText(quote);
		if (!q) return null;

		const anchor = q.length > 80 ? q.slice(0, 80) : q;

		for (const ch of chapters) {
			const content = canonicalizeText(ch.content);
			const exactIdx = content.indexOf(q);
			if (exactIdx !== -1) {
				return {
					chapterTitle: ch.chapterTitle,
					snippetHtml: buildSnippetHtml(content, exactIdx, q.length),
					method: 'exact'
				};
			}
		}

		for (const ch of chapters) {
			const content = canonicalizeText(ch.content);
			const lower = content.toLowerCase();
			const qLower = q.toLowerCase();
			const ciIdx = lower.indexOf(qLower);
			if (ciIdx !== -1) {
				return {
					chapterTitle: ch.chapterTitle,
					snippetHtml: buildSnippetHtml(content, ciIdx, q.length),
					method: 'case_insensitive'
				};
			}
		}

		for (const ch of chapters) {
			const content = canonicalizeText(ch.content);
			const idx = content.indexOf(anchor);
			if (idx !== -1) {
				return {
					chapterTitle: ch.chapterTitle,
					snippetHtml: buildSnippetHtml(content, idx, anchor.length),
					method: 'anchor'
				};
			}
		}

		// Fallback: loose (punctuation-insensitive) matching
		const qLoose = looseCanonicalizeText(q);
		if (qLoose) {
			for (const ch of chapters) {
				const original = canonicalizeText(ch.content);
				const contentLoose = looseCanonicalizeText(original);
				if (contentLoose.includes(qLoose)) {
					// Try token-regex against the full quote first, then against the anchor
					const m1 = findTokenRegexMatch(original, q);
					if (m1 && m1.length > 0) {
						return {
							chapterTitle: ch.chapterTitle,
							snippetHtml: buildSnippetHtml(original, m1.start, m1.length),
							method: 'anchor'
						};
					}
					const m2 = findTokenRegexMatch(original, anchor);
					if (m2 && m2.length > 0) {
						return {
							chapterTitle: ch.chapterTitle,
							snippetHtml: buildSnippetHtml(original, m2.start, m2.length),
							method: 'anchor'
						};
					}
					return {
						chapterTitle: ch.chapterTitle,
						snippetHtml: buildSnippetHtml(original, 0, 0),
						method: 'anchor'
					};
				}
			}
		}

		// Fallback: token-regex match (tolerates punctuation/whitespace)
		for (const ch of chapters) {
			const content = canonicalizeText(ch.content);
			const m = findTokenRegexMatch(content, q);
			if (m && m.length > 0) {
				return {
					chapterTitle: ch.chapterTitle,
					snippetHtml: buildSnippetHtml(content, m.start, m.length),
					method: 'anchor'
				};
			}
		}

		return null;
	}

	async function ensureBooksContentLoaded() {
		if (booksContent) return;
		const res = await fetch('/data/books-content.json');
		if (!res.ok) throw new Error(`Failed to load /data/books-content.json (${res.status})`);
		booksContent = (await res.json()) as BooksContent;
	}

	async function openHighlightContext(
		bookId: string,
		highlightQuote: string,
		bookTitle?: string,
		bookAuthor?: string
	) {
		contextOpen = true;
		contextLoading = true;
		contextError = null;
		contextQuote = highlightQuote;
		contextBookTitle = bookTitle ?? null;
		contextBookAuthor = bookAuthor ?? null;
		contextMatch = null;

		try {
			await ensureBooksContentLoaded();
			if (!booksContent || booksContent.bookId !== bookId) {
				contextError = 'No context content available for this book yet.';
				return;
			}

			const match = findContextInChapters(highlightQuote, booksContent.chapters);
			if (!match) {
				contextError = 'Could not find this highlight in the extracted book text.';
				return;
			}

			contextMatch = match;
		} catch (err) {
			contextError = err instanceof Error ? err.message : 'Failed to load context.';
		} finally {
			contextLoading = false;
		}
	}

	function closeHighlightContext() {
		contextOpen = false;
		contextLoading = false;
		contextError = null;
		contextQuote = null;
		contextBookTitle = null;
		contextBookAuthor = null;
		contextMatch = null;
	}

	// Exact-substring highlighting (case-insensitive)
	function highlightExact(text: string, query: string): string {
		if (!text) return text;
		const q = query.trim();
		if (!q) return escapeHtml(text);

		const lower = text.toLowerCase();
		const qLower = q.toLowerCase();
		let start = 0;
		let idx = lower.indexOf(qLower, start);
		if (idx === -1) return escapeHtml(text);

		let out = '';
		while (idx !== -1) {
			out += escapeHtml(text.slice(start, idx));
			out += `<mark class="search-match">${escapeHtml(text.slice(idx, idx + q.length))}</mark>`;
			start = idx + q.length;
			idx = lower.indexOf(qLower, start);
		}
		out += escapeHtml(text.slice(start));
		return out;
	}

	// Search results grouped by book
	let searchState = $derived.by<SearchState | null>(() => {
		if (!searchQuery.trim()) return null;

		const qNorm = normalizeForSearch(searchQuery.trim());
		const fuzzyResults = fuse.search(searchQuery);
		const exactResults = fuzzyResults.filter((r) => {
			const item = r.item;
			const hay = normalizeForSearch(
				`${item.quote ?? ''} ${item.note ?? ''} ${item.bookTitle ?? ''} ${item.bookAuthor ?? ''}`
			);
			return hay.includes(qNorm);
		});

		const results = exactResults.length > 0 ? exactResults : fuzzyResults;
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
				matches: result.matches,
				useExact: exactResults.length > 0
			});
		}

		return {
			groups: Array.from(groupedByBook.values()),
			useExact: exactResults.length > 0
		};
	});

	function clearSearch() {
		searchQuery = '';
	}

	// Highlight matching text.
	// - Prefer exact substring highlighting when exact matches exist.
	// - Fallback to Fuse indices highlighting for fuzzy-only results.
	function highlightText(
		text: string,
		matches: readonly FuseResultMatch[] | undefined,
		key: string,
		useExact: boolean
	): string {
		if (!text) return text;

		if (useExact) {
			return highlightExact(text, searchQuery);
		}

		if (!matches) return escapeHtml(text);

		const match = matches.find((m) => m.key === key);
		if (!match || !match.indices || match.indices.length === 0) return escapeHtml(text);

		// Filter to only contiguous matches of at least 3 characters
		const minMatchLength = 3;
		const validIndices = match.indices.filter(
			([start, end]: [number, number]) => end - start + 1 >= minMatchLength
		);
		if (validIndices.length === 0) return escapeHtml(text);

		// Highlight via indices against the *raw* text, but ensure HTML escaping.
		// We build segments and escape them individually.
		const segments = [...validIndices].sort((a: number[], b: number[]) => a[0] - b[0]);
		let out = '';
		let cursor = 0;
		for (const [start, end] of segments) {
			out += escapeHtml(text.slice(cursor, start));
			out += `<mark class="search-match">${escapeHtml(text.slice(start, end + 1))}</mark>`;
			cursor = end + 1;
		}
		out += escapeHtml(text.slice(cursor));
		return out;
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
		if (!searchQuery.trim()) {
			expandedBooks = new Set();
			return;
		}

		if (searchState && searchState.groups.length > 0) {
			expandedBooks = new Set(searchState.groups.map((r) => r.book.id));
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

	// Deep linking: copy link to a specific highlight
	function copyHighlightLink(bookId: string, highlightIndex: number) {
		const url = new URL(window.location.href);
		url.searchParams.set('book', bookId);
		url.searchParams.set('h', String(highlightIndex));
		navigator.clipboard.writeText(url.toString());
		// Brief visual feedback via focus state
		focusedHighlight = { bookId, index: highlightIndex };
		setTimeout(() => {
			focusedHighlight = null;
		}, 1500);
	}

	// Deep linking: handle URL params on mount
	onMount(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && contextOpen) {
				closeHighlightContext();
			}
		};
		window.addEventListener('keydown', onKeyDown);

		(async () => {
			const bookId = $page.url.searchParams.get('book');
			const hIndex = $page.url.searchParams.get('h');

			if (bookId) {
				// Expand the book
				expandedBooks.add(bookId);
				expandedBooks = new Set(expandedBooks);

				// Wait for DOM to update
				await tick();

				if (hIndex !== null) {
					const index = parseInt(hIndex, 10);
					focusedHighlight = { bookId, index };

					// Scroll to the highlight
					await tick();
					const el = document.querySelector(`[data-highlight-id="${bookId}-${index}"]`);
					if (el) {
						el.scrollIntoView({ behavior: 'smooth', block: 'center' });
					}

					// Clear focus after a delay
					setTimeout(() => {
						focusedHighlight = null;
						// Clean up URL params without reload
						goto('/books', { replaceState: true, keepFocus: true });
					}, 3000);
				} else {
					// Just scroll to the book
					const bookEl = document.querySelector(`[data-book-id="${bookId}"]`);
					if (bookEl) {
						bookEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
					}
				}
			}
		})();

		return () => window.removeEventListener('keydown', onKeyDown);
	});
</script>

<h1>Books</h1>

<p class="intro">
	Highlights and notes from books I've read, automatically synced from Apple Books.
</p>

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
	{#if searchState}
		<span class="search-status">
			Found {searchState.groups.reduce(
				(acc: number, r: SearchGroup) => acc + r.highlights.length,
				0
			)} highlights in
			{searchState.groups.length} books
		</span>
	{/if}
</div>

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
		{#if searchState}
			<!-- Search results view -->
			{#each searchState.groups as { book, highlights: matchedHighlights } (book.id)}
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
									<div
										class="highlight-item {colorClasses[highlight.color ?? 'yellow'] ||
											'highlight-yellow'}"
										class:highlight-focused={focusedHighlight?.bookId === highlight.bookId &&
											focusedHighlight?.index === highlight.highlightIndex}
										data-highlight-id="{highlight.bookId}-{highlight.highlightIndex}"
									>
										<blockquote class="highlight-quote">
											"{@html highlightText(
												highlight.quote ?? '',
												highlight.matches,
												'quote',
												searchState.useExact
											)}"
										</blockquote>
										{#if highlight.note}
											<p class="highlight-note">
												<strong>Note:</strong>
												{@html highlightText(
													highlight.note ?? '',
													highlight.matches,
													'note',
													searchState.useExact
												)}
											</p>
										{/if}
										<div class="highlight-meta">
											{#if highlight.chapter}
												<span class="highlight-chapter">{highlight.chapter}</span>
											{/if}
											<button
												class="copy-link-btn"
												onclick={() =>
													copyHighlightLink(highlight.bookId, highlight.highlightIndex)}
												title="Copy link to this highlight"
											>
												<Link size={14} />
											</button>
											<button
												class="context-btn"
												onclick={() =>
													openHighlightContext(
														highlight.bookId,
														highlight.quote ?? '',
														highlight.bookTitle,
														highlight.bookAuthor
													)}
												title="View highlight in context"
											>
												<BookOpen size={14} />
											</button>
										</div>
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
				<div class="book-card" data-book-id={book.id}>
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
									<div
										class="highlight-item {colorClasses[highlight.color] || 'highlight-yellow'}"
										class:highlight-focused={focusedHighlight?.bookId === book.id &&
											focusedHighlight?.index === i}
										data-highlight-id="{book.id}-{i}"
									>
										<blockquote class="highlight-quote">
											"{highlight.quote}"
										</blockquote>
										{#if highlight.note}
											<p class="highlight-note">
												<strong>Note:</strong>
												{highlight.note}
											</p>
										{/if}
										<div class="highlight-meta">
											{#if highlight.chapter}
												<span class="highlight-chapter">{highlight.chapter}</span>
											{/if}
											<button
												class="copy-link-btn"
												onclick={() => copyHighlightLink(book.id, i)}
												title="Copy link to this highlight"
											>
												<Link size={14} />
											</button>
											<button
												class="context-btn"
												onclick={() =>
													openHighlightContext(book.id, highlight.quote, book.title, book.author)}
												title="View highlight in context"
											>
												<BookOpen size={14} />
											</button>
										</div>
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

{#if contextOpen}
	<div class="context-overlay" onclick={closeHighlightContext} role="presentation">
		<div class="context-modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="context-header">
				<div class="context-heading">
					<h3 class="context-title">
						{contextBookTitle ?? 'Highlight context'}
					</h3>
					{#if contextBookAuthor}
						<p class="context-subtitle">by {contextBookAuthor}</p>
					{/if}
					{#if contextMatch}
						<p class="context-subtitle">{contextMatch.chapterTitle}</p>
					{/if}
				</div>
				<button class="context-close" onclick={closeHighlightContext} title="Close">
					<X size={18} />
				</button>
			</div>
			<div class="context-body">
				{#if contextLoading}
					<p class="context-status">Loading…</p>
				{:else if contextError}
					<p class="context-status context-error">{contextError}</p>
					{#if contextQuote}
						<blockquote class="context-quote">"{contextQuote}"</blockquote>
					{/if}
				{:else if contextMatch}
					<div class="context-snippet">{@html contextMatch.snippetHtml}</div>
				{/if}
			</div>
		</div>
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

	:global(.search-match) {
		background: rgba(110, 209, 255, 0.3);
		color: rgba(110, 209, 255, 1);
		padding: 0.1rem 0.2rem;
		border-radius: 3px;
		font-style: normal;
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
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.highlight-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 0.5rem;
		gap: 0.5rem;
	}

	.copy-link-btn {
		background: transparent;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 4px;
		opacity: 0;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;

		&:hover {
			color: rgba(110, 209, 255, 0.9);
			background: rgba(110, 209, 255, 0.1);
		}
	}

	.context-btn {
		background: transparent;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 4px;
		opacity: 0;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;

		&:hover {
			color: rgba(110, 209, 255, 0.9);
			background: rgba(110, 209, 255, 0.1);
		}
	}

	.highlight-item:hover .copy-link-btn,
	.highlight-item:hover .context-btn {
		opacity: 1;
	}

	.highlight-focused {
		animation: highlight-pulse 1.5s ease-out;
		box-shadow: 0 0 0 2px rgba(110, 209, 255, 0.6);
	}

	@keyframes highlight-pulse {
		0% {
			box-shadow: 0 0 0 4px rgba(110, 209, 255, 0.8);
		}
		100% {
			box-shadow: 0 0 0 2px rgba(110, 209, 255, 0.3);
		}
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

	.context-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.65);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		z-index: 50;
	}

	.context-modal {
		width: min(900px, 100%);
		max-height: min(80vh, 900px);
		overflow: hidden;
		background: rgba(15, 15, 18, 0.95);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		display: flex;
		flex-direction: column;
	}

	.context-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.context-heading {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.context-title {
		margin: 0;
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.95);
	}

	.context-subtitle {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.85rem;
	}

	.context-close {
		background: transparent;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: 0.35rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		transition: all 0.2s ease;

		&:hover {
			color: rgba(255, 255, 255, 0.9);
			background: rgba(255, 255, 255, 0.06);
		}
	}

	.context-body {
		padding: 1rem 1.25rem 1.25rem;
		overflow: auto;
		line-height: 1.8;
		color: rgba(255, 255, 255, 0.85);
	}

	.context-status {
		margin: 0;
		color: var(--text-muted);
	}

	.context-error {
		color: rgba(255, 120, 120, 0.9);
	}

	.context-quote {
		margin: 0.75rem 0 0;
		font-style: italic;
		color: rgba(255, 255, 255, 0.9);
		padding: 0.75rem 1rem;
		border-left: 3px solid rgba(255, 255, 255, 0.25);
		background: rgba(255, 255, 255, 0.03);
		border-radius: 0 8px 8px 0;
	}

	.context-snippet {
		font-size: 0.98rem;
	}

	:global(.context-match) {
		background: rgba(255, 235, 59, 0.25);
		color: rgba(255, 235, 59, 1);
		padding: 0.1rem 0.15rem;
		border-radius: 3px;
	}
</style>
