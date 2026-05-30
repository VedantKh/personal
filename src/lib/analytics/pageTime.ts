import { track } from '@vercel/analytics';

let currentPath: string | null = null;
let accumulatedMs = 0;
let lastResumeAt: number | null = null;

function now(): number {
	return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function pause(): void {
	if (lastResumeAt != null) {
		accumulatedMs += now() - lastResumeAt;
		lastResumeAt = null;
	}
}

function resume(): void {
	if (lastResumeAt == null) lastResumeAt = now();
}

function flush(): void {
	pause();
	if (currentPath && accumulatedMs > 500) {
		const seconds = Math.round(accumulatedMs / 1000);
		const path = currentPath;
		const section = path.startsWith('/writings')
			? 'writings'
			: path.startsWith('/books')
				? 'books'
				: path.startsWith('/projects')
					? 'projects'
					: path === '/'
						? 'home'
						: 'other';
		// Bucket seconds for easier aggregation in Vercel's dashboard
		// (custom event props are stored as strings).
		const bucket =
			seconds < 5
				? '0-5s'
				: seconds < 15
					? '5-15s'
					: seconds < 30
						? '15-30s'
						: seconds < 60
							? '30-60s'
							: seconds < 180
								? '1-3m'
								: seconds < 600
									? '3-10m'
									: '10m+';
		track('page_time', {
			path,
			section,
			seconds,
			bucket
		});
	}
	accumulatedMs = 0;
	currentPath = null;
}

export function startPageTimer(path: string): void {
	flush();
	currentPath = path;
	accumulatedMs = 0;
	lastResumeAt = now();
}

let listenersInitialized = false;
export function initPageTimeListeners(): void {
	if (typeof document === 'undefined' || listenersInitialized) return;
	listenersInitialized = true;

	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden') {
			// Tab hidden or being closed — flush so we don't lose the data.
			flush();
		} else {
			resume();
		}
	});

	// pagehide fires on tab close, refresh, and bfcache navigations.
	window.addEventListener('pagehide', flush);
}
