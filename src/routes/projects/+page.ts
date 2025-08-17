import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const metadata = {
		title: "Projects",
		description: "My portfolio of AI projects including Vmail (talk to your email), Co-scientist (AI research assistant), multilingual medical scribe, and more innovative applications.",
		keywords: "Vedant Khanna projects, AI projects, portfolio, Vmail, Co-scientist, medical AI, startup projects, Stanford projects"
	};
	
	return {
		metadata
	};
};
