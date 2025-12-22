import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../static/data/books-highlights.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const spotlightHighlights = [
	{ bookId: '4EF5ED391BE128C4216805B03BABCBC5', highlightIndex: 11, spotlightNote: null },
	{ bookId: '9785D0959F418F05C97EE75941CE2307', highlightIndex: 11, spotlightNote: null },
	{ bookId: '9785D0959F418F05C97EE75941CE2307', highlightIndex: 8, spotlightNote: null },
	{ bookId: '9785D0959F418F05C97EE75941CE2307', highlightIndex: 5, spotlightNote: null },
	{ bookId: '2E7CD93F2649F669CBF7A934E859445D', highlightIndex: 1, spotlightNote: null },
	{ bookId: '2E7CD93F2649F669CBF7A934E859445D', highlightIndex: 0, spotlightNote: null },
	{ bookId: '4D7FFF20FB2F135F675BA9961CEE5378', highlightIndex: 8, spotlightNote: null },
	{ bookId: '4D7FFF20FB2F135F675BA9961CEE5378', highlightIndex: 34, spotlightNote: null },
	{ bookId: 'A080DF8BBB8FC590C2E69ACB58923EAB', highlightIndex: 1, spotlightNote: null },
	{ bookId: 'A080DF8BBB8FC590C2E69ACB58923EAB', highlightIndex: 2, spotlightNote: null },
	{
		bookId: 'A080DF8BBB8FC590C2E69ACB58923EAB',
		highlightIndex: 4,
		spotlightNote: 'democracy breaks down without education'
	},
	{ bookId: 'A080DF8BBB8FC590C2E69ACB58923EAB', highlightIndex: 8, spotlightNote: null },
	{ bookId: 'A080DF8BBB8FC590C2E69ACB58923EAB', highlightIndex: 19, spotlightNote: null },
	{ bookId: 'A080DF8BBB8FC590C2E69ACB58923EAB', highlightIndex: 15, spotlightNote: null },
	{ bookId: 'A080DF8BBB8FC590C2E69ACB58923EAB', highlightIndex: 29, spotlightNote: null },
	{ bookId: 'A080DF8BBB8FC590C2E69ACB58923EAB', highlightIndex: 30, spotlightNote: null },
	{ bookId: 'A080DF8BBB8FC590C2E69ACB58923EAB', highlightIndex: 31, spotlightNote: null },
	{ bookId: 'A080DF8BBB8FC590C2E69ACB58923EAB', highlightIndex: 32, spotlightNote: null },
	{ bookId: 'A080DF8BBB8FC590C2E69ACB58923EAB', highlightIndex: 35, spotlightNote: null },
	{ bookId: 'A080DF8BBB8FC590C2E69ACB58923EAB', highlightIndex: 38, spotlightNote: null },
	{
		bookId: 'A080DF8BBB8FC590C2E69ACB58923EAB',
		highlightIndex: 48,
		spotlightNote:
			'life was fucking brutal, those of us who get to live in peace today forget how amazing and unique that is in the history of man.'
	},
	{ bookId: 'A080DF8BBB8FC590C2E69ACB58923EAB', highlightIndex: 53, spotlightNote: null }
];

let updatedCount = 0;

for (const book of data.books) {
	const spotlights = spotlightHighlights.filter((s) => s.bookId === book.id);

	if (spotlights.length > 0) {
		spotlights.forEach(({ highlightIndex, spotlightNote }) => {
			if (book.highlights[highlightIndex]) {
				book.highlights[highlightIndex].spotlight = true;
				book.highlights[highlightIndex].spotlightNote = spotlightNote;
				updatedCount++;
				console.log(`✓ Added spotlight to "${book.title}" - highlight ${highlightIndex}`);
			} else {
				console.warn(`⚠ Highlight ${highlightIndex} not found in "${book.title}"`);
			}
		});
	}
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`\n✅ Updated ${updatedCount} highlights with spotlight flags`);
