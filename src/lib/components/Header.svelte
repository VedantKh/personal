<!-- Header.svelte -->

<header>
	<div class="container">
		<div class="logo">
			<a href="/">home</a>
		</div>

		<nav>
			<ul>
				<li>
					<a href="/experience">experience</a>
				</li>
				<li>
					<a href="/projects">projects</a>
				</li>
				<li>
					<a href="/writings">writings</a>
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
		padding: 1rem;
		justify-content: space-between;
		align-items: center;
		max-width: 40rem; /* Adjust to match main content width */
		margin: 0 auto;
		box-sizing: border-box;
	}

	.logo {
		display: flex;
		justify-content: flex-start;
		align-items: center;
	}

	nav {
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style-type: none;
		display: flex;
		gap: 1.5rem;
	}

	li {
		white-space: nowrap;
	}

	a {
		text-decoration: none;
		color: inherit;
		display: inline-block;
	}
</style>
