#!/usr/bin/env node

/**
 * Wrapper script for sync-books that preserves spotlight data
 *
 * This script:
 * 1. Extracts spotlight data from existing books-highlights.json
 * 2. Runs the Apple Books sync
 * 3. Reapplies spotlight data to the new file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../static/data/books-highlights.json');
const backupPath = path.join(__dirname, '../static/data/books-highlights.backup.json');

console.log('📚 Starting Apple Books sync with spotlight preservation...\n');

// Step 1: Extract spotlight data
console.log('1️⃣  Extracting spotlight data...');
let spotlightData = new Map();

try {
	if (fs.existsSync(jsonPath)) {
		const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

		for (const book of data.books) {
			for (let i = 0; i < book.highlights.length; i++) {
				const highlight = book.highlights[i];
				if (highlight.spotlight === true) {
					const key = `${book.id}:${i}`;
					spotlightData.set(key, {
						spotlight: true,
						spotlightNote: highlight.spotlightNote || null
					});
				}
			}
		}

		console.log(`   ✓ Found ${spotlightData.size} spotlight highlights\n`);

		// Create backup
		fs.copyFileSync(jsonPath, backupPath);
		console.log(`   ✓ Backup created at ${backupPath}\n`);
	} else {
		console.log('   ℹ️  No existing file found, skipping extraction\n');
	}
} catch (err) {
	console.error('   ❌ Error extracting spotlight data:', err.message);
	process.exit(1);
}

// Step 2: Run the sync
console.log('2️⃣  Running Apple Books sync...');
try {
	execSync('node scripts/extract-apple-books.js', {
		cwd: path.join(__dirname, '..'),
		stdio: 'inherit'
	});
	console.log('\n   ✓ Sync completed\n');
} catch (err) {
	console.error('   ❌ Sync failed:', err.message);
	console.log('   ℹ️  Restoring backup...');
	if (fs.existsSync(backupPath)) {
		fs.copyFileSync(backupPath, jsonPath);
		console.log('   ✓ Backup restored');
	}
	process.exit(1);
}

// Step 3: Reapply spotlight data
console.log('3️⃣  Reapplying spotlight data...');
try {
	const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
	let reappliedCount = 0;

	for (const book of data.books) {
		for (let i = 0; i < book.highlights.length; i++) {
			const key = `${book.id}:${i}`;
			if (spotlightData.has(key)) {
				const spotlightInfo = spotlightData.get(key);
				book.highlights[i].spotlight = spotlightInfo.spotlight;
				book.highlights[i].spotlightNote = spotlightInfo.spotlightNote;
				reappliedCount++;
			}
		}
	}

	fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
	console.log(`   ✓ Reapplied ${reappliedCount} spotlight highlights\n`);

	// Clean up backup
	if (fs.existsSync(backupPath)) {
		fs.unlinkSync(backupPath);
		console.log('   ✓ Backup cleaned up\n');
	}

	console.log('✅ Sync completed successfully with spotlight data preserved!');
} catch (err) {
	console.error('   ❌ Error reapplying spotlight data:', err.message);
	console.log('   ℹ️  Restoring backup...');
	if (fs.existsSync(backupPath)) {
		fs.copyFileSync(backupPath, jsonPath);
		console.log('   ✓ Backup restored');
	}
	process.exit(1);
}
