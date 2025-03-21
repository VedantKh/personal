<script lang="ts">
	let mouseX = $state(0);
	let mouseY = $state(0);
	let ripples = $state<{ x: number; y: number; timestamp: number }[]>([]);

	// Update mouse position
	function handleMouseMove(event: MouseEvent) {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

	// Add ripple effect on click
	function handleClick(event: MouseEvent) {
		const newRipple = {
			x: event.clientX,
			y: event.clientY,
			timestamp: Date.now()
		};
		ripples = [...ripples, newRipple];

		// Remove ripple after animation completes
		setTimeout(() => {
			ripples = ripples.filter((r) => r !== newRipple);
		}, 1100);
	}

	// Ripple action to be used with any element
	type RippleOptions = {
		color?: string;
		duration?: number;
		css?: string;
	};

	export function ripple(node: HTMLElement, options: RippleOptions = {}) {
		const duration = options.duration || 800;
		const defaultColor = 'rgba(255, 255, 255, 0.5)';

		// Create a container for positioning context if it doesn't exist
		if (getComputedStyle(node).position === 'static') {
			node.style.position = 'relative';
		}

		node.style.overflow = 'hidden';

		function createRipple(event: MouseEvent) {
			// Get position relative to the node
			const rect = node.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			// Calculate ripple size (diagonal of the element for full coverage)
			const rippleSize = Math.max(rect.width, rect.height) * 2;

			// Create ripple element
			const rippleEl = document.createElement('span');
			rippleEl.className = 'ripple';

			// Position and style the ripple
			rippleEl.style.position = 'absolute';
			rippleEl.style.borderRadius = '50%';
			rippleEl.style.pointerEvents = 'none';
			rippleEl.style.transform = 'translate(-50%, -50%) scale(0)';
			rippleEl.style.left = `${x}px`;
			rippleEl.style.top = `${y}px`;

			// Apply custom styles
			if (options.color) {
				rippleEl.style.backgroundColor = options.color;
			} else {
				rippleEl.style.backgroundColor = defaultColor;
			}

			if (options.css) {
				rippleEl.setAttribute('style', rippleEl.getAttribute('style') + options.css);
			}

			// Animation
			rippleEl.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
			rippleEl.style.width = `${rippleSize}px`;
			rippleEl.style.height = `${rippleSize}px`;

			// Add ripple to DOM
			node.appendChild(rippleEl);

			// Start animation on next frame
			requestAnimationFrame(() => {
				rippleEl.style.transform = 'translate(-50%, -50%) scale(1)';
				rippleEl.style.opacity = '0';
			});

			// Remove the ripple after animation completes
			setTimeout(() => {
				node.removeChild(rippleEl);
			}, duration);
		}

		node.addEventListener('click', createRipple);

		return {
			destroy() {
				node.removeEventListener('click', createRipple);
			},
			update(newOptions: RippleOptions) {
				options = newOptions;
			}
		};
	}
</script>

<svelte:window onmousemove={handleMouseMove} onclick={handleClick} />

<div
	class="dynamic-background"
	style:background-color="#1a1a1a"
	style:transition="background-color 0.3s"
>
	<div
		class="cursor-effect"
		style:background="radial-gradient(circle 200px at {mouseX}px {mouseY}px, transparent,
		rgba(0,0,0,0.5))"
	></div>

	<div class="colored-grid" style:--mouse-x="{mouseX}px" style:--mouse-y="{mouseY}px"></div>

	{#each ripples as ripple (ripple.timestamp)}
		<div class="ripple" style:left="{ripple.x}px" style:top="{ripple.y}px"></div>
	{/each}
	<slot />
</div>

<style>
	.dynamic-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		/* Create grid using background image */
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
			linear-gradient(90deg, rgba(120, 120, 120, 0.1) 1px, transparent 1px);
		background-size: 20px 20px;
		z-index: -10;
	}

	.cursor-effect {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: -9;
		pointer-events: none;
		mix-blend-mode: overlay;
	}

	.colored-grid {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: -8;
		pointer-events: none;
		background-image:
			linear-gradient(rgba(64, 196, 255, 0.2) 1px, transparent 1px),
			linear-gradient(90deg, rgba(64, 196, 255, 0.2) 1px, transparent 1px);
		background-size: 20px 20px;
		-webkit-mask-image: radial-gradient(
			circle 100px at var(--mouse-x) var(--mouse-y),
			black 0%,
			transparent 100%
		);
		mask-image: radial-gradient(
			circle 100px at var(--mouse-x) var(--mouse-y),
			black 0%,
			transparent 100%
		);
	}

	.ripple {
		position: absolute;
		border: 1px solid rgba(120, 120, 120, 0.5);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		pointer-events: none;
		animation: ripple-effect 1s linear forwards;
	}

	@keyframes ripple-effect {
		0% {
			width: 0px;
			height: 0px;
			opacity: 0.8;
			border-width: 1px;
		}
		100% {
			width: 500px;
			height: 500px;
			opacity: 0;
			border-width: 0;
		}
	}
</style>
