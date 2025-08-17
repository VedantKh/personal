import { track } from '@vercel/analytics';
import { browser } from '$app/environment';

// Custom event tracking wrapper for type safety and consistency
export const analytics = {
	// Page view tracking (automatic with Vercel Analytics, but can be used for custom logic)
	pageView: (page: string, properties?: Record<string, any>) => {
		if (!browser) return;
		track('page_view', {
			page,
			...properties
		});
	},

	// Track reading time for blog posts
	trackReadingTime: (slug: string, timeInSeconds: number) => {
		if (!browser) return;
		track('reading_time', {
			article_slug: slug,
			time_seconds: Math.round(timeInSeconds),
			time_minutes: Math.round(timeInSeconds / 60)
		});
	},

	// Track when someone starts reading an article
	startReading: (slug: string, title: string, category?: string) => {
		if (!browser) return;
		track('article_read_start', {
			article_slug: slug,
			article_title: title,
			category: category || 'writing'
		});
	},

	// Track when someone finishes reading (scrolled to bottom)
	finishReading: (slug: string, title: string, timeInSeconds: number) => {
		if (!browser) return;
		track('article_read_complete', {
			article_slug: slug,
			article_title: title,
			time_seconds: Math.round(timeInSeconds),
			time_minutes: Math.round(timeInSeconds / 60)
		});
	},

	// Track scroll depth
	trackScrollDepth: (depth: number, page: string) => {
		if (!browser) return;
		// Only track significant milestones
		const milestones = [25, 50, 75, 90, 100];
		const milestone = milestones.find((m) => depth >= m && depth < m + 5);

		if (milestone) {
			track('scroll_depth', {
				depth_percentage: milestone,
				page
			});
		}
	},

	// Track external link clicks (especially demo links)
	trackExternalLink: (
		url: string,
		label: string,
		category: 'demo' | 'social' | 'resource' | 'other' = 'other'
	) => {
		if (!browser) return;
		track('external_link_click', {
			url,
			label,
			category
		});
	},

	// Track project interactions
	trackProjectView: (projectName: string, hasDemo: boolean) => {
		if (!browser) return;
		track('project_view', {
			project_name: projectName,
			has_demo: hasDemo
		});
	},

	// Track demo button clicks
	trackDemoClick: (projectName: string, demoUrl: string) => {
		if (!browser) return;
		track('demo_click', {
			project_name: projectName,
			demo_url: demoUrl
		});
	},

	// Track navigation menu clicks
	trackNavigation: (from: string, to: string) => {
		if (!browser) return;
		track('navigation', {
			from_page: from,
			to_page: to
		});
	},

	// Track engagement with specific sections
	trackSectionEngagement: (section: string, action: string) => {
		if (!browser) return;
		track('section_engagement', {
			section,
			action
		});
	},

	// Track contact/social link clicks
	trackContactClick: (platform: string, url: string) => {
		if (!browser) return;
		track('contact_click', {
			platform,
			url
		});
	}
};

// Utility to calculate reading time in minutes based on word count
export function calculateReadingTime(text: string): number {
	const wordsPerMinute = 200; // Average reading speed
	const words = text.trim().split(/\s+/).length;
	return Math.ceil(words / wordsPerMinute);
}

// Scroll tracking helper
export function initScrollTracking(pageName: string) {
	if (!browser) return;

	let scrollDepthTracked = new Set<number>();
	let maxScroll = 0;

	const handleScroll = () => {
		const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
		const scrolled = window.scrollY;
		const scrollPercentage = Math.round((scrolled / scrollHeight) * 100);

		// Track max scroll depth
		if (scrollPercentage > maxScroll) {
			maxScroll = scrollPercentage;

			// Track milestones
			[25, 50, 75, 90, 100].forEach((milestone) => {
				if (scrollPercentage >= milestone && !scrollDepthTracked.has(milestone)) {
					scrollDepthTracked.add(milestone);
					analytics.trackScrollDepth(milestone, pageName);
				}
			});
		}
	};

	// Throttle scroll events
	let scrollTimer: NodeJS.Timeout;
	const throttledScroll = () => {
		clearTimeout(scrollTimer);
		scrollTimer = setTimeout(handleScroll, 150);
	};

	window.addEventListener('scroll', throttledScroll, { passive: true });

	// Track max scroll when user leaves
	const cleanup = () => {
		window.removeEventListener('scroll', throttledScroll);
		if (maxScroll > 10) {
			track('max_scroll_depth', {
				page: pageName,
				max_depth: maxScroll
			});
		}
	};

	return cleanup;
}

// Reading progress tracker
export function initReadingTracker(slug: string, title: string) {
	if (!browser) return;

	const startTime = Date.now();
	let isReading = true;
	let totalReadingTime = 0;
	let lastActiveTime = startTime;

	// Track when user becomes inactive
	const handleVisibilityChange = () => {
		if (document.hidden) {
			if (isReading) {
				totalReadingTime += Date.now() - lastActiveTime;
				isReading = false;
			}
		} else {
			if (!isReading) {
				lastActiveTime = Date.now();
				isReading = true;
			}
		}
	};

	// Track article start
	analytics.startReading(slug, title);

	document.addEventListener('visibilitychange', handleVisibilityChange);

	// Check if user reached the end
	const checkComplete = () => {
		const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
		const scrolled = window.scrollY;
		const scrollPercentage = (scrolled / scrollHeight) * 100;

		if (scrollPercentage >= 90) {
			const finalTime = totalReadingTime + (isReading ? Date.now() - lastActiveTime : 0);
			analytics.finishReading(slug, title, finalTime / 1000);
			cleanup();
		}
	};

	window.addEventListener('scroll', checkComplete, { passive: true });

	const cleanup = () => {
		document.removeEventListener('visibilitychange', handleVisibilityChange);
		window.removeEventListener('scroll', checkComplete);

		// Track total reading time when leaving
		const finalTime = totalReadingTime + (isReading ? Date.now() - lastActiveTime : 0);
		if (finalTime > 5000) {
			// Only track if more than 5 seconds
			analytics.trackReadingTime(slug, finalTime / 1000);
		}
	};

	return cleanup;
}
