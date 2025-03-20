<!-- src/routes/[slug]/+page.svelte -->
<script>
	export let data;
	const { title, date, Content } = data;
</script>

<article>
	<h1>{data.title}</h1>
	<p>Published: {data.date}</p>
	<Content />
</article>