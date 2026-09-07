import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const WRITINGS_DIR = join(process.cwd(), 'src/routes/writings');

export type EssayMeta = {
	slug: string;
	title: string;
	date: string;
	description: string;
	related: string[];
	published: boolean;
};

const truthy = (v: string | undefined) => v === 'true' || v === 'yes' || v === 'ye';

function parseFrontmatter(raw: string): Record<string, string> {
	const match = raw.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return {};
	const out: Record<string, string> = {};
	for (const line of match[1].split('\n')) {
		const idx = line.indexOf(':');
		if (idx === -1) continue;
		out[line.slice(0, idx).trim()] = line
			.slice(idx + 1)
			.trim()
			.replace(/^['"]|['"]$/g, '');
	}
	return out;
}

export function loadEssays(): EssayMeta[] {
	return readdirSync(WRITINGS_DIR)
		.filter((f) => f.endsWith('.md'))
		.map((file) => {
			const fm = parseFrontmatter(readFileSync(join(WRITINGS_DIR, file), 'utf8'));
			const related = (fm.related ?? '')
				.replace(/^\[|\]$/g, '')
				.split(',')
				.map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
				.filter(Boolean);
			return {
				slug: file.replace(/\.md$/, ''),
				title: fm.title,
				date: fm.date,
				description: fm.description ?? '',
				related,
				published: !truthy(fm.hidden) && !truthy(fm.draft)
			};
		});
}

export const publishedEssays = () => loadEssays().filter((e) => e.published);
export const unpublishedEssays = () => loadEssays().filter((e) => !e.published);
export const essayBySlug = (slug: string) => loadEssays().find((e) => e.slug === slug);
