<script lang="ts">
	import type { PageData } from './$types';
	import PostList from '$lib/components/PostList.svelte';
	import type { Post } from '$lib/utils/posts';
	const { data } = $props<{ data: PageData }>();
	const { posts } = data;

	// Filter posts to only show highlighted ones
	const highlightedPosts = posts.filter(
		(post: Post) => post.meta.highlight === 'yes' || post.meta.highlight === true
	);

	let showMore = $state(false);

	function showMoreInfoToggle() {
		showMore = !showMore;
	}
</script>

{#snippet DefaultContent()}
	<h1 class="!mt-0 !border-b-0 !pb-0 !text-xl">Vedant Khanna</h1>
	<p>
		I'm currently finishing my undergrad at Stanford in Math. I think a lot about applications of AI
		beyond the Silicon Valley bubble.
	</p>

	<p>
		I enjoy reading, from books like <a
			href="https://www.goodreads.com/en/book/show/18667988-the-fourth-revolution"
			target="_blank">The Fourth Revolution</a
		>
		to
		<a href="https://www.goodreads.com/book/show/30013.Prelude_to_Foundation" target="_blank"
			>Prelude to Foundation</a
		>. I also love
		<a
			href="https://www.youtube.com/watch?v=YyoKXfBQgXw&ab_channel=Kimer%E2%80%9CRawCut%E2%80%9DLorens"
			target="_blank">Tron Legacy's aesthetic</a
		>, and this page is heavily inspired by it.
	</p>
{/snippet}

{#snippet MoreInfo()}
	<div class="bio-extended">
		<p>
			I arrived at Stanford to study physics, but through a series of fortunate events, I ended up leaving for over a year to build an AI
			real estate agent with my closest friends two weeks after ChatGPT was released. 
			I introduced LLMs to hundreds of 50-60 year olds through this process which was a blast.
		</p>

		<p>
			I learned that hiring, fundraising, and selling are different flavors of storytelling, and 
			explored the subtleties of each through many mistakes. Product is closer to the scientific method, 
			with hypothesis testing and iteration, and then an effort to make a beautiful and simple unifying theory based on the data.
		</p>
		<p>
			I believe that as capabilities of AI and tech improve, two human skills will also grow in importance:
			problem selection and relationship building.
		</p>
	</div>
{/snippet}

<div class="bio-container mt-8">
	<img
		src="me.png"
		alt="Vedant Khanna smiling"
		style="float: left; border-radius: 85px; width: 170px; margin: 0 1rem 0.5rem 0;"
	/>

	{@render DefaultContent()}
</div>

<div class="mt-4 flex items-start justify-start">
	{#if !showMore}
		<button class="more-button" onclick={showMoreInfoToggle}>
			<span>More about me</span>
		</button>
	{/if}
</div>

{#if showMore}
	{@render MoreInfo()}
{/if}

<h2>Friends and Family</h2>
<p>
	I want to reduce the activation energy for people to build what they believe in, so I am working on nurturing a community of builders at Stanford. We have built some awesome <a href="https://vedantkhanna.notion.site/Projects-2398828bbc3d809fa5b6eda4ba88b539?source=copy_link" target="_blank">projects</a> and raised a few hundred thousand dollars to give in grants to the right people. 
	Here are my <a href="https://friendsandfam.xyz/manifesto" target="_blank">thoughts</a> about why this is important.
</p>

<h2>Highlighted writings</h2>

<PostList posts={highlightedPosts} showHeading={false} />

<style lang="scss">
	p {
		font-size: 0.95rem;
	}
	.more-button {
		position: relative;
		color: rgba(110, 209, 255, 0.891);
		padding: 0.5rem 1rem;
		font-size: 1rem;
		background-color: transparent;
		border: 1px solid rgba(110, 209, 255, 0.2);
		border-radius: 4px;
		cursor: pointer;
		overflow: hidden;
		transition: all 0.3s ease;

		&::after {
			content: '';
			position: absolute;
			width: 0;
			height: 2px;
			bottom: 0;
			left: 0;
			background-color: rgba(110, 209, 255, 0.891);
			transition: width 0.3s ease-in-out;
		}

		&:hover {
			border-color: rgba(110, 209, 255, 0.6);
			background-color: rgba(110, 209, 255, 0.05);

			&::after {
				width: 100%;
			}
		}

		&:focus {
			outline: none;
			box-shadow: 0 0 0 2px rgba(110, 209, 255, 0.3);
		}

		span {
			position: relative;
			z-index: 1;
		}
	}
</style>
