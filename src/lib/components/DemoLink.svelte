<script lang="ts">
	import { analytics } from '$lib/utils/analytics';

	interface Props {
		href: string;
		projectName: string;
		children?: any;
	}

	let { href, projectName, children }: Props = $props();

	function handleClick() {
		// Track the demo click
		analytics.trackDemoClick(projectName, href);
	}
</script>

<a {href} target="_blank" rel="noopener noreferrer" onclick={handleClick}>
	{#if children}
		{@render children()}
	{:else}
		demo
	{/if}
</a>
