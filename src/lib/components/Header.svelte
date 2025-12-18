<!-- Header.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { analytics } from '$lib/utils/analytics';

	function handleNavClick(to: string) {
		const from = $page.url.pathname;
		analytics.trackNavigation(from, to);
	}
</script>

<header>
	<div class="container">
		<div class="logo">
			<a href="/" onclick={() => handleNavClick('/')}>home</a>
		</div>

		<nav>
			<ul>
				<!-- <li>
					<a href="/experience" onclick={() => handleNavClick('/experience')}>experience</a>
				</li> -->
				<!-- <li>
					<a href="/about" onclick={() => handleNavClick('/about')}>about</a>
				</li> -->
				<!-- <li>
					<a href="/projects" onclick={() => handleNavClick('/projects')}>projects</a>
				</li> -->
				<li>
					<a href="/writings" onclick={() => handleNavClick('/writings')}>writings</a>
				</li>
				<li>
					<a href="/snippets" onclick={() => handleNavClick('/snippets')}>snippets</a>
				</li>
				<li>
					<a href="/books" onclick={() => handleNavClick('/books')}>books</a>
				</li>
			</ul>
		</nav>
	</div>
</header>

<!-- ... The rest of the file's contents here -->
<style lang="scss">
	header {
		background: transparent; /* Make header transparent */
		margin: 0 auto; /* Center horizontally */
		width: 100%;
	}

	.container {
		display: flex;
		font-size: 1.15rem;
		padding: 1rem;
		justify-content: space-between;
		align-items: center;
		max-width: var(--max-content-width); /* Adjust to match main content width */
		margin: 0 auto;
		box-sizing: border-box;
		font-family: var(--font-heading);
		font-weight: var(--weight-heading);
	}

	.logo {
		display: flex;
		justify-content: flex-start;
		align-items: center;
	}

	nav {
		flex-shrink: 0;
		display: flex;
		justify-content: center;
	}

	ul {
		margin: 0;
		padding: 0;
		display: flex;
		list-style-type: none;
		gap: 1.5rem;
	}

	li {
		align-self: center;
		justify-self: center;
		white-space: nowrap;
	}

	a {
		text-decoration: none;
		color: inherit;
		display: inline-block;
	}
</style>
