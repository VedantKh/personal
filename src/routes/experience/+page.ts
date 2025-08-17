import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const metadata = {
		title: "Experience",
		description: "My entrepreneurial journey - From founding Hazel and raising $2M at 19 to building voice-first AI applications for real estate.",
		keywords: "Vedant Khanna experience, Hazel, startup founder, entrepreneur, AI applications, real estate tech, Stanford"
	};
	
	return {
		metadata
	};
};
