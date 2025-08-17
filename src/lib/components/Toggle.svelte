<script lang="ts">
	export let question: string;
	let isOpen = false;

	function toggle() {
		isOpen = !isOpen;
	}
</script>

<div class="toggle-container">
	<button class="toggle-button" on:click={toggle}>
		<span class="chevron" class:open={isOpen}>▶</span>
		<span class="question-text">{question}</span>
	</button>
	{#if isOpen}
		<div class="toggle-content">
			<slot />
		</div>
	{/if}
</div>

<style lang="scss">
	.toggle-container {
		margin-bottom: 0.25rem;
	}

	.toggle-button {
		width: 100%;
		background: none;
		border: none;
		text-align: left;
		padding: 1rem 0;
		cursor: pointer;
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;

		&:hover {
			color: var(--text-color, #e7e4e4);
		}
	}

	.chevron {
		font-size: 0.8rem;
		transition: transform 0.2s ease;
		margin-top: 0.1rem; // Align with text baseline
		flex-shrink: 0; // Prevent chevron from shrinking

		&.open {
			transform: rotate(90deg);
		}
	}

	.question-text {
		font-weight: 500;
		font-size: 1rem;
	}

	.toggle-content {
		margin-left: calc(0.8rem + 0.5rem); // chevron width + gap
		padding-top: 0.5rem;
	}
</style>
