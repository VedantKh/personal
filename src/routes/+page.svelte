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
		I'm finishing my undergrad at Stanford in Math. I think a lot about applications of AI
		beyond the Silicon Valley bubble.
	</p>

	<p>
		I enjoy reading, currently reading <a href="https://www.goodreads.com/book/show/27220736-shoe-dog" target="_blank">Shoe Dog</a>. I also love
		<a
			href="https://www.youtube.com/watch?v=YyoKXfBQgXw&ab_channel=Kimer%E2%80%9CRawCut%E2%80%9DLorens"
			target="_blank">Tron Legacy's</a
		> aesthetic, and this page is heavily inspired by it. I occasionally angel invest in friends, and scout for <a href="https://a16z.com/about/" target="_blank">a16z</a> on the side.
	</p>
{/snippet}

{#snippet MoreInfo()}
	<div class="bio-extended">
		<p>
			I was CEO and cofounder of Hazel (<a href="https://pear.vc/" target="_blank">PearX W23</a>), where I led product, hiring, and sales. Skipped sophomore year to raise a couple million dollars and build an AI real estate agent for Berkshire Hathaway's brokerage.
		</p>

		<p>
			I'm currently exploring problems in the Bay and back home in the UAE, while writing my thoughts down here.
		</p>
		<p>
			I believe that as capabilities of tech improve, two human skills will continue to grow in importance:
			problem selection and building trust with people.
		</p>
	</div>
{/snippet}

<div class="bio-container mt-8">
	<img
		src="me.png"
		alt="Vedant Khanna smiling"
		style="float: left; border-radius: 85px; width: 170px; margin: 0.25rem 1rem 0.5rem 0;"
	/>

	{@render DefaultContent()}
</div>

<div class="mt-1 flex items-start justify-start">
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
	I want to reduce the activation energy for people to build what they believe in, which led to FAF, a community of builders at Stanford. We have built some awesome <a href="https://vedantkhanna.notion.site/Projects-2398828bbc3d809fa5b6eda4ba88b539?source=copy_link" target="_blank">projects</a> including a new type of robotic hand, a Tom and Jerry diffusion model, and an app that allows you to talk to your email. 
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
