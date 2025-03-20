<!-- Footer.svelte -->

<footer>

	<!-- Convert into icons and links -->
	<nav>
		<ul>
			<li>
				<a href="/">Email</a>
			</li>
			<li>
				<a href="/">Github</a>
			</li>
			<li>
				<a href="/">LinkedIn</a>
			</li>
		</ul>
	</nav>

	<p>License</p>
</footer>

<!-- ... The rest of the file's contents here -->
<style lang="scss">
	footer {
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