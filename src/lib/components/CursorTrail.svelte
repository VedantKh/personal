<script lang="ts">
	import { onMount } from 'svelte';

	interface TrailPoint {
		x: number;
		y: number;
		opacity: number;
		isOrange: boolean; // Track if this point should be orange
	}

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let trail: TrailPoint[] = [];
	let mouseX = 0;
	let mouseY = 0;
	let isMouseDown = false; // Track mouse button state
	let animationFrameId: number;
	let pulsePhase = 0; // For pulsing effect

	const TRAIL_LENGTH = 30; // Number of points in the trail
	const TRAIL_WIDTH = 3; // Width of the trail line
	const FADE_SPEED = 0.9; // How quickly the trail fades (lower = faster fade)
	const CURSOR_DISC_SIZE = 8; // Size of the cursor disc

	function resizeCanvas() {
		if (canvas) {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}
	}

	function handleMouseMove(e: MouseEvent) {
		mouseX = e.clientX;
		mouseY = e.clientY;

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

		// Update pulse phase for animated effects
		pulsePhase = (pulsePhase + 0.05) % (Math.PI * 2);
		const pulse = Math.sin(pulsePhase) * 0.3 + 0.7; // Oscillates between 0.4 and 1.0

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

		// Draw the trail with intense Tron glow effect
		for (let i = 0; i < trail.length - 1; i++) {
			const point = trail[i];
			const nextPoint = trail[i + 1];

			// Calculate opacity based on position in trail
			const positionFade = (i / trail.length) * 0.7 + 0.3;
			const finalOpacity = point.opacity * positionFade;

			// Tron-themed colors: electric cyan and vibrant orange
			const colors = point.isOrange
				? {
						outer: `rgba(255, 100, 0, ${finalOpacity * 0.25})`, // Vibrant orange outer glow
						middle: `rgba(255, 140, 0, ${finalOpacity * 0.5})`, // Orange middle glow
						inner: `rgba(255, 200, 100, ${finalOpacity})` // Bright orange-yellow core
					}
				: {
						outer: `rgba(0, 230, 255, ${finalOpacity * 0.25})`, // Electric cyan outer glow
						middle: `rgba(0, 255, 255, ${finalOpacity * 0.5})`, // Cyan middle glow
						inner: `rgba(150, 255, 255, ${finalOpacity})` // Bright cyan-white core
					};

			// Outer glow (larger, more transparent)
			ctx.beginPath();
			ctx.moveTo(point.x, point.y);
			ctx.lineTo(nextPoint.x, nextPoint.y);
			ctx.strokeStyle = colors.outer;
			ctx.lineWidth = TRAIL_WIDTH * 8;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.stroke();

			// Middle glow
			ctx.beginPath();
			ctx.moveTo(point.x, point.y);
			ctx.lineTo(nextPoint.x, nextPoint.y);
			ctx.strokeStyle = colors.middle;
			ctx.lineWidth = TRAIL_WIDTH * 4;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.stroke();

			// Inner bright line (Tron electric)
			ctx.beginPath();
			ctx.moveTo(point.x, point.y);
			ctx.lineTo(nextPoint.x, nextPoint.y);
			ctx.strokeStyle = colors.inner;
			ctx.lineWidth = TRAIL_WIDTH;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.stroke();
		}

		// Draw Tron-style cursor disc at current position
		if (trail.length > 0) {
			const discColor = isMouseDown
				? {
						outer: `rgba(255, 100, 0, ${0.3 * pulse})`,
						middle: `rgba(255, 140, 0, ${0.6 * pulse})`,
						inner: `rgba(255, 200, 100, ${0.9 * pulse})`
					}
				: {
						outer: `rgba(0, 230, 255, ${0.3 * pulse})`,
						middle: `rgba(0, 255, 255, ${0.6 * pulse})`,
						inner: `rgba(150, 255, 255, ${0.9 * pulse})`
					};

			// Outer disc glow
			ctx.beginPath();
			ctx.arc(mouseX, mouseY, CURSOR_DISC_SIZE * 2, 0, Math.PI * 2);
			ctx.fillStyle = discColor.outer;
			ctx.fill();

			// Middle disc glow
			ctx.beginPath();
			ctx.arc(mouseX, mouseY, CURSOR_DISC_SIZE * 1.2, 0, Math.PI * 2);
			ctx.fillStyle = discColor.middle;
			ctx.fill();

			// Inner bright disc core
			ctx.beginPath();
			ctx.arc(mouseX, mouseY, CURSOR_DISC_SIZE * 0.6, 0, Math.PI * 2);
			ctx.fillStyle = discColor.inner;
			ctx.fill();

			// Disc outline
			ctx.beginPath();
			ctx.arc(mouseX, mouseY, CURSOR_DISC_SIZE, 0, Math.PI * 2);
			ctx.strokeStyle = discColor.inner;
			ctx.lineWidth = 1.5;
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
</style>
