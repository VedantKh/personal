<script lang="ts">
	import { page } from '$app/stores';

	interface Props {
		title?: string;
		description?: string;
		keywords?: string;
		author?: string;
		image?: string;
		imageAlt?: string;
		type?: 'website' | 'article' | 'profile';
		publishedTime?: string;
		modifiedTime?: string;
		section?: string;
		tags?: string[];
	}

	let {
		title = "Vedant Khanna's space",
		description = 'Studying Math and Physics.',
		keywords = 'Vedant Khanna, Vedant, Stanford, Mathematics, AI, Silicon Valley',
		author = 'Vedant Khanna',
		image = 'https://www.vedant.space/me.png',
		imageAlt = 'Vedant Khanna smiling',
		type = 'website',
		publishedTime,
		modifiedTime,
		section,
		tags = []
	}: Props = $props();

	// Get the current URL from the page store
	const url = $derived($page.url.href);

	// Format the title with site name
	const formattedTitle = $derived(title === "Vedant Khanna's space" ? title : `${title}`);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{formattedTitle}</title>
	<meta name="title" content={formattedTitle} />
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />
	<meta name="author" content={author} />
	<link rel="canonical" href={url} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={formattedTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:site_name" content="Vedant Khanna" />
	<meta property="og:locale" content="en_US" />

	{#if image}
		<meta property="og:image" content={image} />
		<meta property="og:image:alt" content={imageAlt} />
	{/if}

	<!-- Article specific tags -->
	{#if type === 'article'}
		{#if publishedTime}
			<meta property="article:published_time" content={publishedTime} />
		{/if}
		{#if modifiedTime}
			<meta property="article:modified_time" content={modifiedTime} />
		{/if}
		{#if section}
			<meta property="article:section" content={section} />
		{/if}
		{#if tags && tags.length > 0}
			{#each tags as tag}
				<meta property="article:tag" content={tag} />
			{/each}
		{/if}
		<meta property="article:author" content={author} />
	{/if}

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:url" content={url} />
	<meta name="twitter:title" content={formattedTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:site" content="@vedant__khanna" />
	<meta name="twitter:creator" content="@vedant__khanna" />

	{#if image}
		<meta name="twitter:image" content={image} />
		<meta name="twitter:image:alt" content={imageAlt} />
	{/if}

	<!-- Additional Meta Tags -->
	<meta name="robots" content="index, follow" />
	<meta
		name="googlebot"
		content="index, follow, max-snippet:-1, max-image-preview:standard, max-video-preview:-1"
	/>

	<!-- Profile metadata -->
	{#if type === 'profile' || type === 'website'}
		<meta property="profile:first_name" content="Vedant" />
		<meta property="profile:last_name" content="Khanna" />
	{/if}
</svelte:head>
