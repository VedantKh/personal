#!/usr/bin/env node

/**
 * Apple Books Content Extractor
 *
 * Extends the existing highlight extraction to also pull book content/chapters
 * for context viewing. This script extracts the actual book text content
 * from Apple Books databases.
 *
 * Usage: node scripts/extract-book-content.js
 *
 * Output: static/data/books-content.json
 */

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { glob } from 'glob';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);

const username = os.userInfo().username;
const BOOK_DB_PATH = `/Users/${username}/Library/Containers/com.apple.iBooksX/Data/Documents/BKLibrary/`;
const BOOKS_FOLDER = `/Users/${username}/Library/Containers/com.apple.iBooksX/Data/Documents/BKLibrary/Assets/`;

function readJsonIfExists(filePath) {
	try {
		if (!fs.existsSync(filePath)) return null;
		return JSON.parse(fs.readFileSync(filePath, 'utf8'));
	} catch (err) {
		console.error(`Error reading JSON ${filePath}:`, err.message);
		return null;
	}
}

function walkFiles(dirPath) {
	const out = [];
	const stack = [dirPath];
	while (stack.length > 0) {
		const current = stack.pop();
		if (!current) continue;
		let entries;
		try {
			entries = fs.readdirSync(current, { withFileTypes: true });
		} catch {
			continue;
		}
		for (const entry of entries) {
			const full = path.join(current, entry.name);
			if (entry.isDirectory()) {
				stack.push(full);
			} else if (entry.isFile()) {
				out.push(full);
			}
		}
	}
	return out;
}

function stripHtmlToText(html) {
	return html
		.replace(/<script[\s\S]*?<\/script>/gi, ' ')
		.replace(/<style[\s\S]*?<\/style>/gi, ' ')
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function shouldSkipChapterFileName(fileName) {
	const lower = fileName.toLowerCase();
	if (lower.includes('signup')) return true;
	if (lower.includes('sign-up')) return true;
	if (lower.includes('newsletter')) return true;
	return false;
}

function shouldSkipChapterText(text) {
	const lower = text.toLowerCase();
	if (!lower) return true;
	if (lower.length < 120) return true;
	if (lower.includes('click here to sign up')) return true;
	if (lower.includes('join our mailing list')) return true;
	return false;
}

function chapterSortKey(name) {
	const base = path.basename(name).toLowerCase();
	// Prefer chapter-like files first
	if (/^(ch|chapter)[\s_\-]*\d+/.test(base)) return `0-${base}`;
	if (/^bm\d+/.test(base)) return `1-${base}`;
	if (base.includes('intro')) return `2-${base}`;
	return `9-${base}`;
}

function isLikelyEpubHtmlPath(p) {
	const lower = p.toLowerCase();
	if (!(lower.endsWith('.xhtml') || lower.endsWith('.html') || lower.endsWith('.htm')))
		return false;
	if (lower.includes('meta-inf')) return false;
	if (lower.includes('/toc.') || lower.includes('nav.xhtml') || lower.includes('toc.xhtml'))
		return false;
	if (lower.includes('cover') || lower.includes('titlepage')) return true;
	// Common EPUB content dirs
	if (lower.includes('/text/') || lower.includes('/ops/') || lower.includes('/oebps/')) return true;
	// Fallback: accept any html inside the epub package
	return true;
}

async function createDB(filename) {
	return await open({
		filename: filename,
		driver: sqlite3.Database,
		mode: sqlite3.OPEN_READONLY
	});
}

async function getBookFilePaths() {
	const booksFiles = await glob(`${BOOK_DB_PATH}/*.sqlite`);

	if (booksFiles.length === 0) {
		console.log('No book database files found at:', BOOK_DB_PATH);
		return [];
	}

	const SELECT_BOOK_PATHS_QUERY = `
    SELECT 
      ZASSETID as id, 
      ZTITLE as title, 
      ZAUTHOR as author,
      ZPATH as filePath
    FROM ZBKLIBRARYASSET
    WHERE ZPATH IS NOT NULL
  `;

	const allBooks = [];
	for (const file of booksFiles) {
		try {
			const db = await createDB(file);
			const books = await db.all(SELECT_BOOK_PATHS_QUERY);
			allBooks.push(...books);
			await db.close();
		} catch (err) {
			console.error(`Error reading book database ${file}:`, err.message);
		}
	}

	return allBooks;
}

async function extractBookContent(bookPath) {
	try {
		// Check if the book file exists
		if (!fs.existsSync(bookPath)) {
			console.log(`Book file not found: ${bookPath}`);
			return null;
		}

		const stat = fs.statSync(bookPath);
		if (stat.isFile() && stat.size < 1024) {
			console.log(
				`Book file is very small (${stat.size} bytes) - might be an iCloud placeholder: ${bookPath}`
			);
		}

		// For EPUB files, we need to parse them
		if (bookPath.endsWith('.epub')) {
			if (stat.isDirectory()) {
				return await extractEPUBDirectoryContent(bookPath);
			}
			return await extractEPUBContent(bookPath);
		}

		// For PDF files, extract text
		if (bookPath.endsWith('.pdf')) {
			return await extractPDFContent(bookPath);
		}

		console.log(`Unsupported format: ${bookPath}`);
		return null;
	} catch (err) {
		console.error(`Error extracting content from ${bookPath}:`, err.message);
		return null;
	}
}

async function extractEPUBContent(epubPath) {
	// This is a simplified EPUB parser - in production you'd use a proper library
	// For now, we'll create a basic structure

	try {
		const AdmZip = await import('adm-zip');
		const zip = new AdmZip.default(epubPath);

		const chapters = [];
		const contentFiles = zip.getEntries().filter((entry) => {
			const name = entry.entryName;
			if (!name) return false;
			const lower = name.toLowerCase();
			if (!(lower.endsWith('.xhtml') || lower.endsWith('.html') || lower.endsWith('.htm')))
				return false;
			if (lower.includes('meta-inf')) return false;
			if (lower.includes('/toc.') || lower.includes('nav.xhtml') || lower.includes('toc.xhtml'))
				return false;
			if (shouldSkipChapterFileName(lower)) return false;
			// Prefer typical content locations but don’t require them
			return true;
		});

		// Sort to get stable/likely reading order-ish
		contentFiles.sort((a, b) =>
			chapterSortKey(a.entryName || '').localeCompare(chapterSortKey(b.entryName || ''))
		);

		let idx = 0;
		for (const file of contentFiles) {
			idx += 1;
			const content = file.getData().toString('utf8');
			const textContent = stripHtmlToText(content);
			if (!textContent) continue;
			if (shouldSkipChapterText(textContent)) continue;

			chapters.push({
				chapterId: file.entryName || `chapter_${idx}`,
				chapterTitle: path.basename(file.entryName || `chapter_${idx}`),
				content: textContent
			});
		}

		return chapters;
	} catch (err) {
		console.error(`Error parsing EPUB ${epubPath}:`, err.message);
		return null;
	}
}

async function extractEPUBDirectoryContent(epubDirPath) {
	try {
		const allFiles = walkFiles(epubDirPath);
		const htmlFiles = allFiles
			.filter((p) => isLikelyEpubHtmlPath(p))
			.filter((p) => !shouldSkipChapterFileName(p))
			.sort((a, b) => chapterSortKey(a).localeCompare(chapterSortKey(b)));

		const chapters = [];
		let idx = 0;
		for (const filePath of htmlFiles) {
			idx += 1;
			let content;
			try {
				content = fs.readFileSync(filePath, 'utf8');
			} catch {
				continue;
			}
			const textContent = stripHtmlToText(content);
			if (!textContent) continue;
			if (shouldSkipChapterText(textContent)) continue;

			chapters.push({
				chapterId: path.relative(epubDirPath, filePath),
				chapterTitle: path.basename(filePath),
				content: textContent
			});
		}

		return chapters.length > 0 ? chapters : null;
	} catch (err) {
		console.error(`Error parsing EPUB directory ${epubDirPath}:`, err.message);
		return null;
	}
}

async function extractPDFContent(pdfPath) {
	// Placeholder for PDF extraction
	// Would need pdf-parse or similar library
	return [
		{
			chapterId: 'full_book',
			chapterTitle: 'Complete Book',
			content: 'PDF content extraction requires additional library setup'
		}
	];
}

async function main() {
	console.log('📖 Extracting Apple Books content...');
	console.log('');

	// Ensure output directory exists
	const outputDir = path.join(__dirname, '..', 'static', 'data');
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	const outputPath = path.join(outputDir, 'books-content.json');
	const perBookOutputDir = path.join(outputDir, 'books-content');
	if (!fs.existsSync(perBookOutputDir)) {
		fs.mkdirSync(perBookOutputDir, { recursive: true });
	}
	const highlightsPath = path.join(outputDir, 'books-highlights.json');
	const onlyBookIds = (process.env.BOOK_IDS || '')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);

	// Get book file paths from Apple Books database
	const books = await getBookFilePaths();

	if (books.length === 0) {
		console.log('No books with file paths found in Apple Books database');
		return;
	}

	console.log(`Found ${books.length} books with file paths`);

	const highlightsData = readJsonIfExists(highlightsPath);
	const preferredBookIds = highlightsData?.books?.map((b) => b.id).filter(Boolean) ?? [];
	const preferredBooksFromHighlights = highlightsData?.books ?? [];

	const preferredBooks = preferredBookIds
		.map((id) => books.find((b) => b.id === id && b.filePath))
		.filter(Boolean);
	const fallbackBooks = books.filter((b) => !preferredBookIds.includes(b.id));
	const candidates = [...preferredBooks, ...fallbackBooks];

	// If you have highlights data, extract for those books; otherwise fall back to extracting one demo book.
	const booksToExtract =
		preferredBooksFromHighlights.length > 0
			? onlyBookIds.length > 0
				? preferredBooksFromHighlights.filter((b) => onlyBookIds.includes(b.id))
				: preferredBooksFromHighlights
			: [];

	const extractedBookIds = [];
	const failedBooks = [];

	if (booksToExtract.length > 0) {
		console.log(`Extracting content for ${booksToExtract.length} highlighted books...`);
		console.log('');

		for (let i = 0; i < booksToExtract.length; i++) {
			const hb = booksToExtract[i];
			const candidate = books.find((b) => b.id === hb.id && b.filePath);
			if (!candidate) {
				failedBooks.push({
					id: hb.id,
					title: hb.title,
					reason: 'No file path found in Apple Books DB'
				});
				continue;
			}

			console.log(`[${i + 1}/${booksToExtract.length}] ${candidate.title} by ${candidate.author}`);
			console.log(`File: ${candidate.filePath}`);
			const chapters = await extractBookContent(candidate.filePath);
			if (!chapters || chapters.length === 0) {
				failedBooks.push({
					id: candidate.id,
					title: candidate.title,
					reason: 'Could not extract chapters'
				});
				console.log('Could not extract content from this book');
				console.log('');
				continue;
			}

			const bookContent = {
				bookId: candidate.id,
				title: candidate.title,
				author: candidate.author,
				filePath: candidate.filePath,
				chapters: chapters,
				extractedAt: new Date().toISOString()
			};

			const perBookPath = path.join(perBookOutputDir, `${candidate.id}.json`);
			fs.writeFileSync(perBookPath, JSON.stringify(bookContent, null, 2));
			extractedBookIds.push(candidate.id);
			console.log(`✅ Saved: ${perBookPath}`);
			console.log(`   Chapters: ${chapters.length}`);
			console.log('');
		}

		const manifestPath = path.join(perBookOutputDir, 'index.json');
		fs.writeFileSync(
			manifestPath,
			JSON.stringify(
				{
					bookIds: extractedBookIds,
					failed: failedBooks,
					extractedAt: new Date().toISOString()
				},
				null,
				2
			)
		);

		console.log(`📚 Per-book content written under ${perBookOutputDir}`);
		console.log(`   Extracted: ${extractedBookIds.length}`);
		console.log(`   Failed: ${failedBooks.length}`);
		console.log(`   Manifest: ${manifestPath}`);

		// Keep legacy single-file output for backward compatibility (use first extracted book if available)
		if (extractedBookIds.length > 0) {
			const legacyId = extractedBookIds[0];
			const legacyPath = path.join(perBookOutputDir, `${legacyId}.json`);
			try {
				const legacyContent = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
				fs.writeFileSync(outputPath, JSON.stringify(legacyContent, null, 2));
				console.log(`   Legacy file updated: ${outputPath}`);
			} catch (err) {
				console.log(
					`   Could not update legacy file: ${err instanceof Error ? err.message : String(err)}`
				);
			}
		}

		return;
	}

	// No highlights data; process one demo book as before
	const candidatesForDemo = candidates.slice(0, 25);
	let demoBook = null;
	let chapters = null;
	for (const candidate of candidatesForDemo) {
		console.log(`Processing: ${candidate.title} by ${candidate.author}`);
		console.log(`File: ${candidate.filePath}`);
		chapters = await extractBookContent(candidate.filePath);
		if (chapters && chapters.length > 0) {
			demoBook = candidate;
			break;
		}
		console.log('Could not extract content from this book');
		console.log('');
	}

	if (!demoBook || !chapters) {
		console.log('❌ Failed to extract content from any candidate books.');
		return;
	}

	const bookContent = {
		bookId: demoBook.id,
		title: demoBook.title,
		author: demoBook.author,
		filePath: demoBook.filePath,
		chapters: chapters,
		extractedAt: new Date().toISOString()
	};

	fs.writeFileSync(outputPath, JSON.stringify(bookContent, null, 2));

	console.log('');
	console.log(`✅ Extracted content saved to ${outputPath}`);
	console.log(`   Book: ${demoBook.title}`);
	console.log(`   Chapters: ${chapters.length}`);
	console.log(
		`   Total content: ${chapters.reduce((sum, ch) => sum + ch.content.length, 0)} chars`
	);
}

// Check if required dependencies are available
function checkDependencies() {
	const requiredDeps = ['adm-zip'];
	const missingDeps = [];

	for (const dep of requiredDeps) {
		try {
			require.resolve(dep);
		} catch {
			missingDeps.push(dep);
		}
	}

	if (missingDeps.length > 0) {
		console.log('Missing dependencies:', missingDeps.join(', '));
		console.log('Install with: npm install ' + missingDeps.join(' '));
		return false;
	}

	return true;
}

if (checkDependencies()) {
	main().catch((err) => {
		console.error('Error:', err);
		process.exit(1);
	});
} else {
	console.log('Please install missing dependencies and try again');
}
