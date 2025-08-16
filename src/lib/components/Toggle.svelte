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
		margin-bottom: 1rem;
	}

	.toggle-button {
		width: 100%;
		background: none;
		border: none;
		text-align: left;
		padding: 1rem 0;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;

		&:hover {
			background-color: rgba(0, 0, 0, 0.02);
		}
	}

	.chevron {
		font-size: 0.8rem;
		transition: transform 0.2s ease;

		&.open {
			transform: rotate(90deg);
		}
	}

	.question-text {
		font-weight: 600;
		font-size: 1rem;
	}

	.toggle-content {
		padding: 0 1.5rem 1rem 1.5rem;
	}
</style>
