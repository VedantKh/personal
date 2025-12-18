#!/usr/bin/env node

/**
 * Apple Books Highlights Extractor
 *
 * Extracts highlights and annotations from Apple Books SQLite databases
 * and outputs them as JSON for use in the personal website.
 *
 * Usage: node scripts/extract-apple-books.js
 *
 * The script reads from:
 * - ~/Library/Containers/com.apple.iBooksX/Data/Documents/AEAnnotation/*.sqlite (annotations)
 * - ~/Library/Containers/com.apple.iBooksX/Data/Documents/BKLibrary/*.sqlite (books)
 *
 * Output: static/data/books-highlights.json
 */

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { glob } from 'glob';
import crypto from 'crypto';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const username = os.userInfo().username;
const ANNOTATION_DB_PATH = `/Users/${username}/Library/Containers/com.apple.iBooksX/Data/Documents/AEAnnotation/`;
const BOOK_DB_PATH = `/Users/${username}/Library/Containers/com.apple.iBooksX/Data/Documents/BKLibrary/`;

// Apple epoch starts from 2001-01-01
const APPLE_EPOCH_START = new Date('2001-01-01').getTime();

function convertAppleTime(appleTime) {
	if (!appleTime) return null;
	return new Date(APPLE_EPOCH_START + appleTime * 1000).getTime();
}

function formatDate(timestamp) {
	if (!timestamp) return null;
	return new Date(timestamp).toISOString().split('T')[0];
}

// Generate a unique hash for a highlight (used to track exclusions)
function hashHighlight(bookId, quote) {
	return crypto.createHash('md5').update(`${bookId}:${quote}`).digest('hex');
}

// Load exclusions file (highlights that were manually pruned)
function loadExclusions(exclusionsPath) {
	if (fs.existsSync(exclusionsPath)) {
		try {
			const data = JSON.parse(fs.readFileSync(exclusionsPath, 'utf-8'));
			return new Set(data.hashes || []);
		} catch (err) {
			console.error('Error reading exclusions file:', err.message);
		}
	}
	return new Set();
}

// Save exclusions file
function saveExclusions(exclusionsPath, exclusions) {
	const data = {
		lastUpdated: new Date().toISOString(),
		count: exclusions.size,
		hashes: Array.from(exclusions)
	};
	fs.writeFileSync(exclusionsPath, JSON.stringify(data, null, 2));
}

// Load current highlights to detect pruned ones
function loadCurrentHighlights(outputPath) {
	if (fs.existsSync(outputPath)) {
		try {
			return JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
		} catch (err) {
			console.error('Error reading current highlights:', err.message);
		}
	}
	return null;
}

// Color code mapping for Apple Books highlight colors
const COLOR_MAP = {
	0: 'underline',
	1: 'green',
	2: 'blue',
	3: 'yellow',
	4: 'pink',
	5: 'purple'
};

async function createDB(filename) {
	return await open({
		filename: filename,
		driver: sqlite3.Database,
		mode: sqlite3.OPEN_READONLY
	});
}

async function getBooks() {
	const booksFiles = await glob(`${BOOK_DB_PATH}/*.sqlite`);

	if (booksFiles.length === 0) {
		console.log('No book database files found at:', BOOK_DB_PATH);
		return [];
	}

	const SELECT_ALL_BOOKS_QUERY = `
    SELECT 
      ZASSETID as id, 
      ZTITLE as title, 
      ZAUTHOR as author,
      ZGENRE as genre,
      ZLANGUAGE as language,
      ZCOVERURL as coverUrl
    FROM ZBKLIBRARYASSET
  `;

	const allBooks = [];
	for (const file of booksFiles) {
		try {
			const db = await createDB(file);
			const books = await db.all(SELECT_ALL_BOOKS_QUERY);
			allBooks.push(...books);
			await db.close();
		} catch (err) {
			console.error(`Error reading book database ${file}:`, err.message);
		}
	}

	return allBooks;
}

async function getAnnotations() {
	const annotationsFiles = await glob(`${ANNOTATION_DB_PATH}/*.sqlite`);

	if (annotationsFiles.length === 0) {
		console.log('No annotation database files found at:', ANNOTATION_DB_PATH);
		return [];
	}

	const SELECT_ALL_ANNOTATIONS_QUERY = `
    SELECT 
      ZANNOTATIONASSETID as assetId,
      ZANNOTATIONSELECTEDTEXT as quote,
      ZANNOTATIONNOTE as note,
      ZFUTUREPROOFING5 as chapter,
      ZANNOTATIONSTYLE as colorCode,
      ZANNOTATIONMODIFICATIONDATE as modifiedAt,
      ZANNOTATIONCREATIONDATE as createdAt,
      ZANNOTATIONLOCATION as location
    FROM ZAEANNOTATION
    WHERE ZANNOTATIONDELETED = 0 
      AND ZANNOTATIONSELECTEDTEXT IS NOT NULL 
      AND ZANNOTATIONSELECTEDTEXT <> ''
    ORDER BY ZANNOTATIONASSETID, ZPLLOCATIONRANGESTART
  `;

	const allAnnotations = [];
	for (const file of annotationsFiles) {
		try {
			const db = await createDB(file);
			const annotations = await db.all(SELECT_ALL_ANNOTATIONS_QUERY);
			allAnnotations.push(...annotations);
			await db.close();
		} catch (err) {
			console.error(`Error reading annotation database ${file}:`, err.message);
		}
	}

	return allAnnotations;
}

async function main() {
	console.log('🔍 Extracting Apple Books highlights...');
	console.log('');

	// Ensure output directory exists
	const outputDir = path.join(__dirname, '..', 'static', 'data');
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	const outputPath = path.join(outputDir, 'books-highlights.json');
	const exclusionsPath = path.join(outputDir, 'books-exclusions.json');

	// Load exclusions (manually pruned highlights)
	const exclusions = loadExclusions(exclusionsPath);
	if (exclusions.size > 0) {
		console.log(`🚫 Loaded ${exclusions.size} excluded highlights`);
	}

	// Load current highlights to detect newly pruned ones
	const currentData = loadCurrentHighlights(outputPath);
	const currentHashes = new Set();
	if (currentData?.books) {
		for (const book of currentData.books) {
			for (const h of book.highlights) {
				currentHashes.add(hashHighlight(book.id, h.quote));
			}
		}
	}

	// Get books and annotations
	const books = await getBooks();
	const annotations = await getAnnotations();

	console.log(`📚 Found ${books.length} books`);
	console.log(`✨ Found ${annotations.length} highlights in Apple Books`);

	if (annotations.length === 0) {
		console.log('No highlights found. Make sure you have highlighted content in Apple Books.');
		return;
	}

	// Create book lookup map
	const booksByAssetId = {};
	for (const book of books) {
		booksByAssetId[book.id] = book;
	}

	// Build set of all new highlight hashes (from Apple Books)
	const newHashes = new Set();
	for (const annotation of annotations) {
		newHashes.add(hashHighlight(annotation.assetId, annotation.quote));
	}

	// Detect pruned highlights: in current JSON but not removed from Apple Books
	// (user manually deleted from JSON, but highlight still exists in Apple Books)
	let newlyExcluded = 0;
	for (const hash of newHashes) {
		// If this hash was in the previous JSON but is no longer there,
		// it means user pruned it - add to exclusions
		if (currentHashes.size > 0 && !currentHashes.has(hash) && currentData) {
			// This is a new highlight from Apple Books, not a pruned one
			// Don't exclude it
		}
	}

	// Actually detect pruned: highlights that WERE in currentHashes but user removed from JSON
	// We need to compare what's in the current JSON vs what would be generated
	if (currentHashes.size > 0) {
		for (const hash of newHashes) {
			// If highlight exists in Apple Books AND was in previous sync,
			// but is NOT in current JSON file, user pruned it
			if (!currentHashes.has(hash) && !exclusions.has(hash)) {
				// This is a NEW highlight from Apple Books, not pruned
				// We want it included
			}
		}

		// Build a set of hashes that SHOULD have been in the JSON (from last sync)
		// by looking at what Apple Books has that isn't excluded
		const lastSyncHashes = new Set();
		for (const hash of newHashes) {
			if (!exclusions.has(hash)) {
				lastSyncHashes.add(hash);
			}
		}

		// Pruned = was expected to be in JSON (lastSyncHashes) but user removed it (not in currentHashes)
		for (const hash of lastSyncHashes) {
			if (!currentHashes.has(hash)) {
				exclusions.add(hash);
				newlyExcluded++;
			}
		}
	}

	if (newlyExcluded > 0) {
		console.log(`✂️  Detected ${newlyExcluded} newly pruned highlights`);
	}

	// Process annotations and group by book, filtering out exclusions
	const highlightsByBook = {};
	let includedCount = 0;
	let excludedCount = 0;

	for (const annotation of annotations) {
		const highlightHash = hashHighlight(annotation.assetId, annotation.quote);

		// Skip excluded highlights
		if (exclusions.has(highlightHash)) {
			excludedCount++;
			continue;
		}

		const book = booksByAssetId[annotation.assetId];
		const bookTitle = book?.title || 'Unknown Title';
		const bookAuthor = book?.author || 'Unknown Author';

		if (!highlightsByBook[annotation.assetId]) {
			highlightsByBook[annotation.assetId] = {
				id: annotation.assetId,
				title: bookTitle,
				author: bookAuthor,
				genre: book?.genre || null,
				highlights: []
			};
		}

		highlightsByBook[annotation.assetId].highlights.push({
			quote: annotation.quote,
			note: annotation.note || null,
			chapter: annotation.chapter || null,
			color: COLOR_MAP[annotation.colorCode] || 'yellow',
			createdAt: formatDate(convertAppleTime(annotation.createdAt)),
			modifiedAt: formatDate(convertAppleTime(annotation.modifiedAt))
		});
		includedCount++;
	}

	// Convert to array and sort by most recently modified
	const output = Object.values(highlightsByBook).sort((a, b) => {
		const aLatest = a.highlights[0]?.modifiedAt || '';
		const bLatest = b.highlights[0]?.modifiedAt || '';
		return bLatest.localeCompare(aLatest);
	});

	// Save exclusions
	if (exclusions.size > 0) {
		saveExclusions(exclusionsPath, exclusions);
	}

	// Write output
	const outputData = {
		lastUpdated: new Date().toISOString(),
		totalBooks: output.length,
		totalHighlights: includedCount,
		books: output
	};

	fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

	console.log('');
	console.log(`✅ Exported to ${outputPath}`);
	console.log(`   ${output.length} books with ${includedCount} highlights`);
	if (excludedCount > 0) {
		console.log(`   ${excludedCount} highlights excluded (previously pruned)`);
	}
}

main().catch((err) => {
	console.error('Error:', err);
	process.exit(1);
});
