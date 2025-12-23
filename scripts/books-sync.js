#!/usr/bin/env node

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readJsonIfExists(filePath) {
	try {
		if (!fs.existsSync(filePath)) return null;
		return JSON.parse(fs.readFileSync(filePath, 'utf8'));
	} catch {
		return null;
	}
}

function runNodeScript(scriptPath, env = {}) {
	return new Promise((resolve) => {
		const child = spawn(process.execPath, [scriptPath], {
			stdio: 'inherit',
			env: { ...process.env, ...env }
		});

		child.on('close', (code) => {
			resolve(code ?? 0);
		});
	});
}

function getBookIdSet(highlightsData) {
	const ids = highlightsData?.books?.map((b) => b.id).filter(Boolean) ?? [];
	return new Set(ids);
}

async function main() {
	const outputDir = path.join(__dirname, '..', 'static', 'data');
	const highlightsPath = path.join(outputDir, 'books-highlights.json');

	const beforeHighlights = readJsonIfExists(highlightsPath);
	const beforeIds = getBookIdSet(beforeHighlights);

	const extractHighlightsScript = path.join(__dirname, 'extract-apple-books.js');
	const extractContentScript = path.join(__dirname, 'extract-book-content.js');
	const fetchGoodreadsScript = path.join(__dirname, 'fetch-goodreads-links.js');

	console.log('🔄 Running highlights export...');
	const highlightsExit = await runNodeScript(extractHighlightsScript);
	if (highlightsExit !== 0) {
		console.log('');
		console.log(
			`❌ Highlights export failed (exit code ${highlightsExit}). Skipping content extraction.`
		);
		process.exit(highlightsExit);
	}

	const afterHighlights = readJsonIfExists(highlightsPath);
	const afterIds = getBookIdSet(afterHighlights);

	const newIds = [];
	for (const id of afterIds) {
		if (!beforeIds.has(id)) newIds.push(id);
	}

	console.log('');
	console.log(`🆕 New books detected: ${newIds.length}`);
	if (newIds.length === 0) {
		console.log('No new books; skipping content extraction.');
		return;
	}

	console.log('');
	console.log('📖 Extracting content for new books...');
	const contentExit = await runNodeScript(extractContentScript, {
		BOOK_IDS: newIds.join(',')
	});

	const perBookOutputDir = path.join(outputDir, 'books-content');
	const manifestPath = path.join(perBookOutputDir, 'index.json');
	const manifest = readJsonIfExists(manifestPath);

	console.log('');
	console.log('📋 Content extraction summary');
	if (manifest) {
		const extracted = Array.isArray(manifest.bookIds) ? manifest.bookIds : [];
		const failed = Array.isArray(manifest.failed) ? manifest.failed : [];

		console.log(`- Extracted: ${extracted.length}`);
		console.log(`- Failed: ${failed.length}`);
		if (failed.length > 0) {
			for (const f of failed) {
				const title = f?.title ? String(f.title) : 'Unknown title';
				const reason = f?.reason ? String(f.reason) : 'Unknown reason';
				console.log(`  - ${title}: ${reason}`);
			}
		}
		console.log(`- Manifest: ${manifestPath}`);
	} else {
		console.log(`- (No manifest found at ${manifestPath})`);
	}

	if (contentExit !== 0) {
		process.exit(contentExit);
	}

	console.log('');
	console.log('🔗 Fetching Goodreads links for new books...');
	const goodreadsExit = await runNodeScript(fetchGoodreadsScript);
	if (goodreadsExit !== 0) {
		console.log('⚠️  Goodreads link fetching failed, but continuing...');
	}
}

main().catch((err) => {
	console.error('Error:', err);
	process.exit(1);
});
