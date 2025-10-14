<script lang="ts">
	import type { PageData } from './$types';
	import PostList from '$lib/components/PostList.svelte';
	import type { Post } from '$lib/utils/posts';
	import { goto } from '$app/navigation';
	const { data } = $props<{ data: PageData }>();
	const { posts } = data;

	// Filter posts to only show highlighted ones
	const highlightedPosts = posts.filter(
		(post: Post) => post.meta.highlight === 'yes' || post.meta.highlight === true
	);

	let showMore = $state(true);

	function showMoreInfoToggle() {
		showMore = !showMore;
	}

	function showAllWritings() {
		// redirect to /writings using sveltekit's navigate
		goto('/writings');
	}
</script>

{#snippet DefaultContent()}
	<h2 class="!mt-0 !border-b-0 !pb-0">Vedant Khanna</h2>
	<p class="!mb-2">
		I'm finishing my undergrad at Stanford in Math. I think a lot about deploying useful tech beyond Silicon Valley.
	</p>

	<p class="!mb-2">
		I was previously CEO and cofounder of Hazel (PearX W23), where we raised $2M to build an AI real estate agent with Berkshire Hathaway.
		I occasionally angel invest in friends.
	</p>
{/snippet}

{#snippet MoreInfo()}
	<div class="bio-extended">
		<p>
			I helped build <a href="https://friendsandfam.xyz/manifesto" target="_blank"
				>Friends and Family</a
			>, a community at Stanford that ships. We make
			<a href="https://www.orcahand.com/" target="_blank">robotic hands</a>, Tom & Jerry diffusion
			<a href="https://test-time-training.github.io/video-dit/" target="_blank">models</a>, Siri for
			your <a href="https://www.youtube.com/watch?v=3ePO_Qi2jCg" target="_blank">email</a>, and
			<a
				href="https://vedantkhanna.notion.site/FAF-Projects-2398828bbc3d809fa5b6eda4ba88b539"
				target="_blank">more</a
			>.
		</p>
		<!-- <p>
			I believe that as capabilities of tech improve, two human skills will continue to grow in importance:
			problem selection and building trust with people.
		</p> -->
	</div>
{/snippet}

<div class="bio-container mt-4">
	<img
		src="me.png"
		alt="Vedant Khanna smiling"
		style="float: left; border-radius: 85px; width: 170px; margin: 1.25rem 1rem 0.5rem 0;"
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

<!-- <h2>Friends and Family</h2>
<p>
	Built a community at Stanford that ships. We built some awesome <a href="https://vedantkhanna.notion.site/Projects-2398828bbc3d809fa5b6eda4ba88b539?source=copy_link" target="_blank">projects</a> including a new type of robotic hand, a Tom and Jerry diffusion model, and an app that allows you to talk to your email. 
	Here are my <a href="https://friendsandfam.xyz/manifesto" target="_blank">thoughts</a> about why this is important.
</p> -->

<h2 class="!mt-4">Highlighted writings</h2>

<PostList posts={highlightedPosts} showHeading={false} showHighlightedTag={false} />

<!-- All writings button -->
<div class="mt-4">
	<button class="more-button" onclick={showAllWritings}>
		<span>All writings</span>
	</button>
</div>

<style lang="scss">
	.more-button {
		position: relative;
		color: rgba(110, 209, 255, 0.891);
		padding: 0.5rem 1rem;
		font-size: 1rem;
		background-color: transparent;
		border: 2px solid rgba(110, 209, 255, 0.2);
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
