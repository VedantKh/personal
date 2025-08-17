<script lang="ts">
	import { page } from '$app/stores';

	interface Props {
		type?: 'Person' | 'Article' | 'WebSite' | 'WebPage';
		title?: string;
		description?: string;
		author?: string;
		datePublished?: string;
		dateModified?: string;
		image?: string;
		tags?: string[];
	}

	let {
		type = 'WebPage',
		title = 'Vedant Khanna',
		description = 'Studying Math and Physics at Stanford.',
		author = 'Vedant Khanna',
		datePublished,
		dateModified,
		image = 'https://www.vedant.space/me.png',
		tags = []
	}: Props = $props();

	// Get the current URL from the page store
	const url = $derived($page.url.href);

	// Person schema (author)
	const personSchema = {
		'@type': 'Person',
		'@id': 'https://www.vedant.space/#person',
		name: 'Vedant Khanna',
		url: 'https://www.vedant.space',
		image: 'https://www.vedant.space/me.png',
		sameAs: [
			'https://twitter.com/vedant__khanna',
			'https://www.linkedin.com/in/vedant-khanna',
			'https://github.com/VedantKh'
		],
		jobTitle: 'Mathematics Student',
		worksFor: {
			'@type': 'EducationalOrganization',
			name: 'Stanford University'
		},
		description:
			'Stanford Mathematics student exploring AI applications beyond the Silicon Valley bubble.',
		alumniOf: {
			'@type': 'EducationalOrganization',
			name: 'Stanford University'
		}
	};

	// Generate schema based on type
	const schema = $derived(
		type === 'Person'
			? {
					'@context': 'https://schema.org',
					...personSchema
				}
			: type === 'Article'
				? {
						'@context': 'https://schema.org',
						'@type': 'BlogPosting',
						headline: title,
						description: description,
						author: personSchema,
						datePublished: datePublished,
						dateModified: dateModified || datePublished,
						image: image,
						url: url,
						keywords: tags.join(', '),
						publisher: {
							'@type': 'Person',
							name: 'Vedant Khanna',
							logo: {
								'@type': 'ImageObject',
								url: 'https://www.vedant.space/me.png'
							}
						},
						mainEntityOfPage: {
							'@type': 'WebPage',
							'@id': url
						}
					}
				: type === 'WebSite'
					? {
							'@context': 'https://schema.org',
							'@type': 'WebSite',
							name: 'Vedant Khanna',
							description: description,
							url: 'https://www.vedant.space',
							author: personSchema,
							publisher: personSchema,
							potentialAction: {
								'@type': 'SearchAction',
								target: {
									'@type': 'EntryPoint',
									urlTemplate: 'https://www.vedant.space/writings?search={search_term_string}'
								},
								'query-input': 'required name=search_term_string'
							}
						}
					: {
							// Default WebPage
							'@context': 'https://schema.org',
							'@type': 'WebPage',
							name: title,
							description: description,
							url: url,
							author: personSchema,
							publisher: personSchema,
							image: image,
							breadcrumb: {
								'@type': 'BreadcrumbList',
								itemListElement: [
									{
										'@type': 'ListItem',
										position: 1,
										name: 'Home',
										item: 'https://www.vedant.space'
									},
									...(url !== 'https://www.vedant.space/'
										? [
												{
													'@type': 'ListItem',
													position: 2,
													name: title,
													item: url
												}
											]
										: [])
								]
							}
						}
	);

	const jsonLd = $derived(JSON.stringify(schema));
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>
