#!/usr/bin/env node

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { glob } from 'glob';
import os from 'os';

const username = os.userInfo().username;
const ANNOTATION_DB_PATH = `/Users/${username}/Library/Containers/com.apple.iBooksX/Data/Documents/AEAnnotation/`;

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

async function debugAnnotations(bookId) {
	const annotationsFiles = await glob(`${ANNOTATION_DB_PATH}/*.sqlite`);

	if (annotationsFiles.length === 0) {
		console.log('No annotation database files found at:', ANNOTATION_DB_PATH);
		return;
	}

	console.log(`🔍 Searching for ALL annotations for book ID: ${bookId}`);
	console.log('');

	const DEBUG_QUERY = `
    SELECT 
      ZANNOTATIONASSETID as assetId,
      ZANNOTATIONSELECTEDTEXT as quote,
      ZANNOTATIONNOTE as note,
      ZFUTUREPROOFING5 as chapter,
      ZANNOTATIONSTYLE as colorCode,
      ZANNOTATIONDELETED as deleted,
      ZANNOTATIONTYPE as type,
      ZANNOTATIONLOCATION as location,
      ZPLLOCATIONRANGESTART as locationStart,
      length(ZANNOTATIONSELECTEDTEXT) as quoteLength
    FROM ZAEANNOTATION
    WHERE ZANNOTATIONASSETID = ?
    ORDER BY ZPLLOCATIONRANGESTART
  `;

	let totalFound = 0;
	let purpleCount = 0;
	let emptyTextCount = 0;

	for (const file of annotationsFiles) {
		try {
			const db = await createDB(file);
			const annotations = await db.all(DEBUG_QUERY, [bookId]);

			if (annotations.length > 0) {
				console.log(`📁 File: ${file}`);
				console.log(`   Found ${annotations.length} annotation(s)`);
				console.log('');

				for (let i = 0; i < annotations.length; i++) {
					const ann = annotations[i];
					const color = COLOR_MAP[ann.colorCode] || `unknown(${ann.colorCode})`;
					const isPurple = ann.colorCode === 5;
					const hasText = ann.quote && ann.quote.trim().length > 0;

					if (isPurple) purpleCount++;
					if (!hasText) emptyTextCount++;

					console.log(`   [${i + 1}] ${isPurple ? '💜 PURPLE' : color.toUpperCase()}`);
					console.log(`       Deleted: ${ann.deleted === 1 ? 'YES' : 'NO'}`);
					console.log(`       Type: ${ann.type}`);
					console.log(
						`       LocationStart: ${ann.locationStart !== null ? ann.locationStart : 'NULL'}`
					);
					console.log(
						`       Has text: ${hasText ? 'YES' : 'NO'} (length: ${ann.quoteLength || 0})`
					);

					if (hasText) {
						const preview = ann.quote.substring(0, 100);
						console.log(`       Preview: "${preview}${ann.quote.length > 100 ? '...' : ''}"`);
					} else {
						console.log(`       Text: [EMPTY or NULL]`);
					}

					if (ann.note) {
						console.log(
							`       Note: "${ann.note.substring(0, 50)}${ann.note.length > 50 ? '...' : ''}"`
						);
					}

					console.log('');
					totalFound++;
				}
			}

			await db.close();
		} catch (err) {
			console.error(`Error reading annotation database ${file}:`, err.message);
		}
	}

	console.log('📊 Summary:');
	console.log(`   Total annotations found: ${totalFound}`);
	console.log(`   Purple highlights: ${purpleCount}`);
	console.log(`   Empty/null text: ${emptyTextCount}`);
}

const FOURTH_REVOLUTION_ID = 'A080DF8BBB8FC590C2E69ACB58923EAB';
debugAnnotations(FOURTH_REVOLUTION_ID).catch((err) => {
	console.error('Error:', err);
	process.exit(1);
});
