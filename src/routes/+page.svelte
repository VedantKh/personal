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
			I arrived at Stanford determined to be a physicist after I fell in love with the subject as a
			kid, excited to dive into the big questions.
		</p>

		<p>
			Serendipity is powerful in the Bay though. Through a series of fortunate events, I ended up
			starting <a href="/experience">a company</a> with my closest friends when I was 19.
		</p>

		<p>
			There's nothing more intoxicating than working with your favourite people on changing the
			status quo. However, it requires serious sacrifice, so I realized I need equally serious
			reasoning about where the status quo is worth changing and why.
		</p>

		<p>
			The <a
				href="https://www.lesswrong.com/w/hamming-questions#:~:text=Mathematician%20Richard%20Hamming%20used%20to,people's%20attention%20on%20what%20matters."
				target="_blank">Hamming questions</a
			> have been a powerful way to structure this thinking, and I'm running experiments to improve my
			answer to these.
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
