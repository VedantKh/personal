<!-- Header.svelte -->

<header>
	<a href="/">Home</a>

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
</header>

<!-- ... The rest of the file's contents here -->
<style lang="scss">
	header {
		padding: 1rem;
		background: lightgrey;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	ul {
		margin: 0;
		list-style-type: none;
		display: flex;
		gap: 1rem;
	}

	a {
		text-decoration: none;
		color: inherit;
	}
</style>
