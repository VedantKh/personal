<script lang="ts">
	import type { PageData } from './$types';
	import { ChevronDown, ChevronUp, BookOpen, Quote } from 'lucide-svelte';

	const { data } = $props<{ data: PageData }>();
	const { highlights } = data;

	// Track which books are expanded
	let expandedBooks = $state<Set<string>>(new Set());

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
		expandedBooks = new Set(highlights.books.map((b: any) => b.id));
	}

	function collapseAll() {
		expandedBooks = new Set();
	}

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

	<div class="controls">
		<button class="control-btn" onclick={expandAll}>Expand all</button>
		<button class="control-btn" onclick={collapseAll}>Collapse all</button>
	</div>

	<div class="books-list">
		{#each highlights.books as book (book.id)}
			<div class="book-card">
				<button class="book-header" onclick={() => toggleBook(book.id)}>
					<div class="book-info">
						<h2 class="book-title">{book.title}</h2>
						<span class="book-author">by {book.author}</span>
						<span class="highlight-count">{book.highlights.length} highlights</span>
					</div>
					<div class="expand-icon">
						{#if expandedBooks.has(book.id)}
							<ChevronUp size={20} />
						{:else}
							<ChevronDown size={20} />
						{/if}
					</div>
				</button>

				{#if expandedBooks.has(book.id)}
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
				{/if}
			</div>
		{/each}
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

	.expand-icon {
		color: rgba(110, 209, 255, 0.6);
		flex-shrink: 0;
	}

	.highlights-list {
		padding: 0 1.25rem 1.25rem;
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
