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
	<ul class="list-none pl-0 space-y-5">
		<li>
			I'm finishing my undergrad at Stanford in Math. I think a lot about deploying useful tech beyond Silicon Valley.
		</li>
		<li>
			Previously CEO and cofounder of Hazel, raised $2M to build an AI real estate agent with Berkshire Hathaway.
		</li>
		<li>
			I have iterated over many different ideas while in school including
			<ul class="list-disc pl-0 mt-3 space-y-1">
				<li>
					an AI-native EHR in the UAE with the previous CTO of <a href="https://en.wikipedia.org/wiki/Abu_Dhabi_National_Oil_Company#:~:text=ADNOC%20is%20one%20of%20the,onshore%20and%20offshore%20gas%20fields." target="_blank">ADNOC</a>
				</li>
				<li>
					Siri for your <a href="https://www.youtube.com/watch?v=3ePO_Qi2jCg" target="_blank">email</a> with my friend Ethan
				</li>
				<li>
					<code>Current</code> An app that detects whether a video is AI generated or not.
				</li>
			</ul>
		</li>
		<li>
			I run a nonprofit builder community at Stanford called <a href="https://friendsandfam.xyz/manifesto" target="_blank">Friends and Family</a>. Raised $200k to give grants for technical projects. We’ve built <a href="https://www.orcahand.com/" target="_blank">robotic hands</a>, Tom & Jerry diffusion <a href="https://test-time-training.github.io/video-dit/" target="_blank">models</a> and <a href="https://www.notion.so/FAF-Projects-2398828bbc3d809fa5b6eda4ba88b539?pvs=21" target="_blank">more</a> in just the last year.
		</li>
		<li>
			Angel invested in my friends, including in Mercor.
		</li>
	</ul>
{/snippet}

{#snippet MoreInfo()}
	<div></div>
{/snippet}

<div class="bio-container mt-4">
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
	code {
		padding: 0.2rem 0.3rem;
		background-color: rgba(64, 195, 255, 0.189);
		border-radius: 4px;
		color: rgb(64, 195, 255);
		font-size: 0.9rem;
		font-weight: bold;
		vertical-align: middle;
	}

	/* Hide bullets only for the top-level list in DefaultContent */
	:global(.bio-container) .list-none {
		list-style-type: none;
		margin-left: 0;
		padding-left: 0;
	}
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

