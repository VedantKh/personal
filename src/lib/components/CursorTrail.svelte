<script lang="ts">
	import { onMount } from 'svelte';

	interface TrailPoint {
		x: number;
		y: number;
		opacity: number;
		isOrange: boolean; // Track if this point should be orange
	}

	let canvas: HTMLCanvasElement;
	let cursorElement: HTMLDivElement;
	let ctx: CanvasRenderingContext2D;
	let trail: TrailPoint[] = [];
	let mouseX = 0;
	let mouseY = 0;
	let isMouseDown = false; // Track mouse button state
	let animationFrameId: number;
	let cursorVisible = false; // Track if cursor has been initialized

	const TRAIL_LENGTH = 5; // Number of points in the trail
	const TRAIL_WIDTH = 2; // Width of the trail line
	const FADE_SPEED = 0.92; // How quickly the trail fades (lower = faster fade)

	function resizeCanvas() {
		if (canvas) {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}
	}

	function handleMouseMove(e: MouseEvent) {
		mouseX = e.clientX;
		mouseY = e.clientY;

		// Make cursor visible on first mouse movement
		if (!cursorVisible) {
			cursorVisible = true;
		}

		// Update cursor position
		if (cursorElement) {
			cursorElement.style.left = `${mouseX}px`;
			cursorElement.style.top = `${mouseY}px`;
		}

		// Add new point to trail
		trail.push({
			x: mouseX,
			y: mouseY,
			opacity: 1,
			isOrange: isMouseDown // Orange if mouse is down, blue if not
		});

		// Keep trail at max length
		if (trail.length > TRAIL_LENGTH) {
			trail.shift();
		}
	}

	function handleMouseDown() {
		isMouseDown = true;
	}

	function handleMouseUp() {
		isMouseDown = false;
	}

	function drawTrail() {
		if (!ctx || !canvas) return;

		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (trail.length < 2) {
			animationFrameId = requestAnimationFrame(drawTrail);
			return;
		}

		// Update opacity for all points
		trail = trail.map((point) => ({
			...point,
			opacity: point.opacity * FADE_SPEED
		}));

		// Remove fully faded points
		trail = trail.filter((point) => point.opacity > 0.01);

		// Draw the trail with glow effect
		for (let i = 0; i < trail.length - 1; i++) {
			const point = trail[i];
			const nextPoint = trail[i + 1];

			// Calculate opacity based on position in trail
			const positionFade = (i / trail.length) * 0.7 + 0.3;
			const finalOpacity = point.opacity * positionFade;

			// Choose color based on mouse state
			const colors = point.isOrange
				? {
						outer: `rgba(255, 140, 0, ${finalOpacity * 0.15})`, // Orange outer glow
						middle: `rgba(255, 150, 0, ${finalOpacity * 0.3})`, // Orange middle glow
						inner: `rgba(255, 180, 50, ${finalOpacity * 0.8})` // Bright orange core
					}
				: {
						outer: `rgba(0, 180, 255, ${finalOpacity * 0.15})`, // Blue outer glow
						middle: `rgba(0, 200, 255, ${finalOpacity * 0.3})`, // Blue middle glow
						inner: `rgba(100, 230, 255, ${finalOpacity * 0.8})` // Bright blue core
					};

			// Outer glow (larger, more transparent)
			ctx.beginPath();
			ctx.moveTo(point.x, point.y);
			ctx.lineTo(nextPoint.x, nextPoint.y);
			ctx.strokeStyle = colors.outer;
			ctx.lineWidth = TRAIL_WIDTH * 6;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.stroke();

			// Middle glow
			ctx.beginPath();
			ctx.moveTo(point.x, point.y);
			ctx.lineTo(nextPoint.x, nextPoint.y);
			ctx.strokeStyle = colors.middle;
			ctx.lineWidth = TRAIL_WIDTH * 3;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.stroke();

			// Inner bright line (Tron cyan/blue or orange)
			ctx.beginPath();
			ctx.moveTo(point.x, point.y);
			ctx.lineTo(nextPoint.x, nextPoint.y);
			ctx.strokeStyle = colors.inner;
			ctx.lineWidth = TRAIL_WIDTH;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.stroke();
		}

		animationFrameId = requestAnimationFrame(drawTrail);
	}

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		resizeCanvas();

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mousedown', handleMouseDown);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('resize', resizeCanvas);

		// Start animation loop
		animationFrameId = requestAnimationFrame(drawTrail);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mousedown', handleMouseDown);
			window.removeEventListener('mouseup', handleMouseUp);
			window.removeEventListener('resize', resizeCanvas);
			cancelAnimationFrame(animationFrameId);
		};
	});
</script>

<canvas
	bind:this={canvas}
	style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 0; mix-blend-mode: screen;"
></canvas>

<!-- Custom Tron cursor -->
<div
	bind:this={cursorElement}
	class="tron-cursor"
	class:active={isMouseDown}
	class:visible={cursorVisible}
>
	<div class="cursor-outer-ring"></div>
	<div class="cursor-inner-ring"></div>
	<div class="cursor-dot"></div>
</div>

<style>
	canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
		z-index: 0; /* In front of background grid (-10 to -8) but behind content (1+) */
		mix-blend-mode: screen; /* Makes the glow effect blend better with dark backgrounds */
	}

	.tron-cursor {
		position: fixed;
		width: 32px;
		height: 32px;
		pointer-events: none;
		z-index: 9999;
		transform: translate(-50%, -50%);
		transition: transform 0.1s ease-out;
		opacity: 0;
	}

	.tron-cursor.visible {
		opacity: 1;
	}

	.tron-cursor.active {
		transform: translate(-50%, -50%) scale(0.85);
	}

	.cursor-outer-ring {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 32px;
		height: 32px;
		border: 2px solid rgba(0, 200, 255, 0.3);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		box-shadow:
			0 0 10px rgba(0, 200, 255, 0.4),
			inset 0 0 10px rgba(0, 200, 255, 0.2);
		transition: all 0.15s ease-out;
	}

	.tron-cursor.active .cursor-outer-ring {
		border-color: rgba(255, 140, 0, 0.5);
		box-shadow:
			0 0 15px rgba(255, 140, 0, 0.6),
			inset 0 0 10px rgba(255, 140, 0, 0.3);
	}

	.cursor-inner-ring {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 16px;
		height: 16px;
		border: 1.5px solid rgba(100, 230, 255, 0.6);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		box-shadow: 0 0 8px rgba(100, 230, 255, 0.5);
		transition: all 0.15s ease-out;
	}

	.tron-cursor.active .cursor-inner-ring {
		border-color: rgba(255, 180, 50, 0.8);
		box-shadow: 0 0 12px rgba(255, 180, 50, 0.7);
	}

	.cursor-dot {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 4px;
		height: 4px;
		background: radial-gradient(circle, rgba(100, 230, 255, 1) 0%, rgba(0, 200, 255, 0.8) 100%);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		box-shadow: 0 0 6px rgba(100, 230, 255, 0.8);
		transition: all 0.15s ease-out;
	}

	.tron-cursor.active .cursor-dot {
		background: radial-gradient(circle, rgba(255, 200, 100, 1) 0%, rgba(255, 140, 0, 0.9) 100%);
		box-shadow: 0 0 8px rgba(255, 180, 50, 0.9);
	}

	/* Hide cursor trail on mobile devices */
	@media (max-width: 768px) {
		canvas,
		.tron-cursor {
			display: none;
		}
	}
</style>
