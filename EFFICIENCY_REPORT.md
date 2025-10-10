# Efficiency Report - VedantKh/personal

This report documents code locations in the codebase that could be optimized for better performance.

## High Priority Issues

### 1. CursorTrail.svelte - Array Allocations in Animation Loop

**File:** `src/lib/components/CursorTrail.svelte`  
**Lines:** 80-87  
**Severity:** HIGH 🔴

**Issue:**
The `drawTrail()` function creates new arrays on every animation frame (60fps) using `map()` and `filter()`:

```typescript
// Update opacity for all points
trail = trail.map((point) => ({
	...point,
	opacity: point.opacity * FADE_SPEED
}));

// Remove fully faded points
trail = trail.filter((point) => point.opacity > 0.01);
```

**Impact:**

- Creates 2 new arrays per frame (60 times per second)
- Each `map()` creates new objects with spread operator
- Causes frequent garbage collection pauses
- Can lead to janky animations, especially on lower-end devices
- Allocates memory continuously in the hot path

**Recommended Fix:**
Use in-place mutation to avoid allocations:

```typescript
// Update opacity for all points and remove faded ones in a single pass
for (let i = trail.length - 1; i >= 0; i--) {
	trail[i].opacity *= FADE_SPEED;
	if (trail[i].opacity <= 0.01) {
		trail.splice(i, 1);
	}
}
```

**Benefits:**

- Zero array allocations in animation loop
- Reduces GC pressure significantly
- Combines two passes into one
- Maintains identical visual behavior

---

## Medium Priority Issues

### 2. CursorTrail.svelte - Resize Handler Without Throttling

**File:** `src/lib/components/CursorTrail.svelte`  
**Lines:** 25-30, 152  
**Severity:** MEDIUM 🟡

**Issue:**
The window resize event listener calls `resizeCanvas()` on every resize event without throttling:

```typescript
window.addEventListener('resize', resizeCanvas);
```

**Impact:**

- During window resize, this fires many times per second
- Canvas resizing is expensive (width/height changes clear canvas state)
- Can cause UI lag during window resize operations

**Recommended Fix:**
Add throttling similar to scroll handlers:

```typescript
let resizeTimer: number;
const throttledResize = () => {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(resizeCanvas, 100);
};

window.addEventListener('resize', throttledResize);
```

---

### 3. API Posts Endpoint - Repeated Date Object Creation

**File:** `src/routes/api/posts/+server.ts`  
**Lines:** 8-11  
**Severity:** MEDIUM 🟡

**Issue:**
Creates new Date objects for every comparison during sorting:

```typescript
const sortedPosts = allPosts.sort((a, b) => {
	// typescript doesn't subtract dates directly
	return new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime();
});
```

**Impact:**

- For N posts, creates 2N Date objects during sort (O(N log N) comparisons)
- Date parsing is relatively expensive
- Wasteful when dates could be parsed once

**Recommended Fix:**
Parse dates once before sorting:

```typescript
// Parse dates once and cache timestamps
const postsWithTimestamps = allPosts.map((post) => ({
	...post,
	timestamp: new Date(post.meta.date).getTime()
}));

// Sort using cached timestamps
const sortedPosts = postsWithTimestamps.sort((a, b) => b.timestamp - a.timestamp);
```

Or use a technique to memoize during sorting if the data is already in memory.

---

### 4. Sitemap Generation - Repeated Date Object Creation

**File:** `src/routes/sitemap.xml/+server.ts`  
**Lines:** 31-40  
**Severity:** MEDIUM 🟡

**Issue:**
Creates a new Date object for every post during sitemap generation:

```typescript
${posts
    .map(
        (post: { path: string; meta: { date: string } }) => `    <url>
        <loc>${site}/writings/${post.path.replace('src/routes/writings/', '').replace('.md', '')}</loc>
        <lastmod>${new Date(post.meta.date).toISOString()}</lastmod>
        ...
```

**Impact:**

- Creates N Date objects for N posts
- Date parsing and ISO string conversion is expensive
- Happens on every sitemap generation

**Recommended Fix:**
Parse dates once or use cached timestamps from the posts API.

---

## Low Priority Issues

### 5. Analytics - Milestone Array Recreated in Multiple Places

**File:** `src/lib/utils/analytics.ts`  
**Lines:** 50, 145  
**Severity:** LOW 🟢

**Issue:**
The milestones array `[25, 50, 75, 90, 100]` is created in multiple functions:

```typescript
// In trackScrollDepth
const milestones = [25, 50, 75, 90, 100];

// In initScrollTracking
[25, 50, 75, 90, 100].forEach((milestone) => {
```

**Impact:**

- Minor memory allocations
- Code duplication
- Not DRY (Don't Repeat Yourself)

**Recommended Fix:**
Define as a constant at module level:

```typescript
const SCROLL_MILESTONES = [25, 50, 75, 90, 100] as const;
```

---

### 6. Layout - Resize Event Listener Without Cleanup Check

**File:** `src/routes/+layout.svelte`  
**Lines:** 27-37  
**Severity:** LOW 🟢

**Issue:**
Resize event listener is added but there's no explicit cleanup/removal:

```typescript
onMount(() => {
	width = window.innerWidth;
	height = window.innerHeight;

	// Optional; update on resize
	window.addEventListener('resize', () => {
		width = window.innerWidth;
		height = window.innerHeight;
	});
});
```

**Impact:**

- Listener stays attached if component unmounts
- Can lead to memory leaks in SPA context
- Values are updated but not currently used elsewhere (dead code)

**Recommended Fix:**
Either remove the resize listener if width/height aren't used, or add proper cleanup:

```typescript
onMount(() => {
	const handleResize = () => {
		width = window.innerWidth;
		height = window.innerHeight;
	};

	handleResize();
	window.addEventListener('resize', handleResize);

	return () => {
		window.removeEventListener('resize', handleResize);
	};
});
```

---

### 7. CursorTrail - Multiple Canvas Drawing Operations

**File:** `src/lib/components/CursorTrail.svelte`  
**Lines:** 90-140  
**Severity:** LOW 🟢

**Issue:**
Each trail segment draws three separate strokes (outer glow, middle glow, inner line):

```typescript
// Outer glow
ctx.beginPath();
ctx.moveTo(point.x, point.y);
ctx.lineTo(nextPoint.x, nextPoint.y);
ctx.strokeStyle = colors.outer;
ctx.stroke();

// Middle glow
ctx.beginPath();
// ... (repeated)

// Inner bright line
ctx.beginPath();
// ... (repeated)
```

**Impact:**

- 3N drawing operations for N trail segments
- Multiple state changes and draw calls per segment
- Canvas operations are relatively expensive

**Recommended Fix:**
This is harder to optimize without affecting visual quality. Possible approaches:

- Use a single path with gradient
- Pre-render glow effect as texture
- Reduce trail length or segment count
- Use CSS filters instead of multiple draws

Note: The visual effect might be hard to replicate with fewer draws, so this optimization requires careful testing.

---

### 8. String Operations in Hot Path

**File:** `src/lib/components/CursorTrail.svelte`  
**Lines:** 99-109  
**Severity:** LOW 🟢

**Issue:**
Creates new color string objects in the animation loop:

```typescript
const colors = point.isOrange
	? {
			outer: `rgba(255, 140, 0, ${finalOpacity * 0.15})`,
			middle: `rgba(255, 150, 0, ${finalOpacity * 0.3})`,
			inner: `rgba(255, 180, 50, ${finalOpacity * 0.8})`
		}
	: {
			outer: `rgba(0, 180, 255, ${finalOpacity * 0.15})`,
			middle: `rgba(0, 200, 255, ${finalOpacity * 0.3})`,
			inner: `rgba(100, 230, 255, ${finalOpacity * 0.8})`
		};
```

**Impact:**

- Creates 3 new strings per trail segment per frame
- String template evaluation in hot path
- Minor but unnecessary allocations

**Recommended Fix:**
Pre-compute base colors and use `ctx.globalAlpha` for opacity:

```typescript
// Set up colors once per point color
const baseColors = point.isOrange
	? { outer: 'rgb(255, 140, 0)', middle: 'rgb(255, 150, 0)', inner: 'rgb(255, 180, 50)' }
	: { outer: 'rgb(0, 180, 255)', middle: 'rgb(0, 200, 255)', inner: 'rgb(100, 230, 255)' };

// Use globalAlpha for opacity
ctx.globalAlpha = finalOpacity * 0.15;
ctx.strokeStyle = baseColors.outer;
ctx.stroke();
```

---

## Summary

**Fixed in this PR:**

- ✅ Issue #1: CursorTrail array allocations (HIGH priority)

**Remaining Issues:**

- 🟡 Medium Priority: 3 issues
- 🟢 Low Priority: 5 issues

**Estimated Impact:**
The fix applied in this PR (Issue #1) should provide the most noticeable performance improvement as it:

- Runs 60 times per second in the animation loop
- Eliminates the primary source of garbage collection pressure
- Improves frame consistency and reduces jank

The other issues can be addressed in future optimization passes if needed.

---

## Testing Recommendations

For the cursor trail optimization:

1. Test on various devices (desktop, tablet, mobile if applicable)
2. Monitor frame rate using browser DevTools Performance tab
3. Verify trail appearance is identical (fading, colors, length)
4. Test with mouse down/up to verify orange/blue color switching
5. Check for any visual glitches or stuttering

## Measurement Tips

To measure the impact:

- Use Chrome DevTools Performance tab
- Record a session while moving the mouse in circles
- Compare GC events before and after the fix
- Check for improved frame consistency in the flame graph
