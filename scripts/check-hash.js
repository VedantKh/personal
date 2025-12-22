#!/usr/bin/env node

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bookId = 'A080DF8BBB8FC590C2E69ACB58923EAB';
const quoteStart =
	'The most advanced civilizations were all in the East. Beijing was the largest city in the world';

const hash = crypto.createHash('md5').update(`${bookId}:${quoteStart}`).digest('hex');
console.log('Hash for purple highlight:', hash);

const exclusionsPath = path.join(__dirname, '..', 'static', 'data', 'books-exclusions.json');
if (fs.existsSync(exclusionsPath)) {
	const exclusions = JSON.parse(fs.readFileSync(exclusionsPath, 'utf8'));
	console.log('Is in exclusions?', exclusions.hashes.includes(hash));
	console.log('');
	console.log('All exclusion hashes:');
	exclusions.hashes.forEach((h, i) => console.log(`  ${i + 1}. ${h}`));
} else {
	console.log('No exclusions file found');
}
