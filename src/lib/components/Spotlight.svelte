<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-svelte';

	type SpotlightHighlight = {
		quote: string;
		spotlightNote: string | null;
		bookId: string;
		bookTitle: string;
		bookAuthor: string;
		highlightIndex: number;
	};

	const { highlights } = $props<{ highlights: SpotlightHighlight[] }>();

	let currentIndex = $state(0);
	let isPaused = $state(false);
	let autoRotateEnabled = $state(true);
	let intervalId: number | null = null;

	function nextSlide() {
		currentIndex = (currentIndex + 1) % highlights.length;
	}

	function prevSlide() {
		currentIndex = (currentIndex - 1 + highlights.length) % highlights.length;
	}

	function goToSlide(index: number) {
		currentIndex = index;
	}

	function stopAutoRotate() {
		autoRotateEnabled = false;
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	function handleManualNext() {
		stopAutoRotate();
		nextSlide();
	}

	function handleManualPrev() {
		stopAutoRotate();
		prevSlide();
	}

	function handleManualGoTo(index: number) {
		stopAutoRotate();
		goToSlide(index);
	}

	function startAutoRotate() {
		if (intervalId) clearInterval(intervalId);
		intervalId = window.setInterval(() => {
			if (!isPaused && autoRotateEnabled) {
				nextSlide();
			}
		}, 10000);
	}

	function handleMouseEnter() {
		isPaused = true;
	}

	function handleMouseLeave() {
		isPaused = false;
	}

	onMount(() => {
		startAutoRotate();
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});

	function getHighlightUrl(bookId: string, highlightIndex: number): string {
		return `/books?book=${bookId}&h=${highlightIndex}`;
	}

	function handleSpotlightClick(bookId: string, highlightIndex: number) {
		goto(getHighlightUrl(bookId, highlightIndex));
	}
</script>

{#if highlights.length > 0}
	<div
		class="spotlight-container"
		role="region"
		aria-label="Spotlight carousel"
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
	>
		<div class="spotlight-header">
			<Sparkles size={20} />
			<h2>Spotlight</h2>
		</div>

		<div class="carousel">
			<button class="nav-button prev" onclick={handleManualPrev} aria-label="Previous highlight">
				<ChevronLeft size={24} />
			</button>

			<div class="carousel-content">
				{#each highlights as highlight, index (index)}
					{#if index === currentIndex}
						<div class="spotlight-card">
							<button
								onclick={() => handleSpotlightClick(highlight.bookId, highlight.highlightIndex)}
								class="card-link"
							>
								<blockquote class="spotlight-quote">
									"{highlight.quote}"
								</blockquote>

								{#if highlight.spotlightNote}
									<p class="spotlight-note">
										<strong>Note:</strong>
										{highlight.spotlightNote}
									</p>
								{/if}

								<div class="spotlight-meta">
									<span class="book-title">{highlight.bookTitle}</span>
									<span class="book-author">by {highlight.bookAuthor}</span>
								</div>
							</button>
						</div>
					{/if}
				{/each}
			</div>

			<button class="nav-button next" onclick={handleManualNext} aria-label="Next highlight">
				<ChevronRight size={24} />
			</button>
		</div>

		<div class="carousel-dots">
			{#each highlights as _, index}
				<button
					class="dot"
					class:active={index === currentIndex}
					onclick={() => handleManualGoTo(index)}
					aria-label="Go to highlight {index + 1}"
				></button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.spotlight-container {
		margin: 2rem 0;
		padding: 1.25rem;
		background: linear-gradient(
			135deg,
			rgba(110, 209, 255, 0.05) 0%,
			rgba(110, 209, 255, 0.02) 100%
		);
		border: 1px solid rgba(110, 209, 255, 0.15);
		border-radius: 12px;
		position: relative;
	}

	.spotlight-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		color: rgba(110, 209, 255, 0.9);
	}

	.spotlight-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: rgba(110, 209, 255, 0.9);
	}

	.carousel {
		display: flex;
		align-items: center;
		gap: 1rem;
		position: relative;
	}

	.carousel-content {
		flex: 1;
		height: 200px;
		position: relative;
		overflow: hidden;
	}

	.spotlight-card {
		position: absolute;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fadeIn 0.5s ease-in-out;
	}

	.card-link {
		max-height: 100%;
		overflow-y: auto;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.card-link {
		display: block;
		width: 100%;
		background: none;
		border: none;
		padding: 0;
		text-align: left;
		text-decoration: none;
		color: inherit;
		cursor: pointer;
		transition: transform 0.2s ease;
	}

	.card-link:hover {
		transform: translateY(-2px);
	}

	.spotlight-quote {
		margin: 0 0 1rem;
		font-size: 1.1rem;
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.95);
		font-style: italic;
		padding: 0;
		border: none;
	}

	.spotlight-note {
		margin: 1rem 0;
		padding: 0.75rem 1rem;
		background: rgba(110, 209, 255, 0.08);
		border-left: 3px solid rgba(110, 209, 255, 0.5);
		border-radius: 0 6px 6px 0;
		font-size: 0.95rem;
		color: rgba(255, 255, 255, 0.85);
	}

	.spotlight-note strong {
		color: rgba(110, 209, 255, 0.9);
	}

	.spotlight-meta {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-top: 1.25rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.book-title {
		font-size: 0.95rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.9);
	}

	.book-author {
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.6);
	}

	.nav-button {
		background: transparent;
		border: none;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		padding: 1rem;
		margin: -0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.nav-button:hover {
		color: rgba(110, 209, 255, 0.9);
	}

	.carousel-dots {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1.5rem;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.2);
		border: none;
		cursor: pointer;
		transition: all 0.3s ease;
		padding: 0;
	}

	.dot:hover {
		background: rgba(110, 209, 255, 0.5);
		transform: scale(1.2);
	}

	.dot.active {
		background: rgba(110, 209, 255, 0.9);
		width: 24px;
		border-radius: 4px;
	}

	@media (max-width: 768px) {
		.spotlight-container {
			padding: 1.5rem;
			margin: 1.5rem 0;
		}

		.spotlight-header h2 {
			font-size: 1.1rem;
		}

		.spotlight-quote {
			font-size: 1rem;
		}

		.nav-button {
			padding: 0.5rem;
		}

		.carousel {
			gap: 0.5rem;
		}

		.carousel-content {
			height: 250px;
		}
	}

	@media (max-width: 480px) {
		.spotlight-container {
			padding: 1rem;
		}

		.spotlight-quote {
			font-size: 0.95rem;
			line-height: 1.6;
		}

		.nav-button {
			padding: 0.4rem;
		}

		.nav-button :global(svg) {
			width: 20px;
			height: 20px;
		}
	}
</style>
