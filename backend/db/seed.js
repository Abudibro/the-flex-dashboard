import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import listings from '../data/mockListings.js';
import mockReviews from '../data/mockReviews.js';

const reviews = mockReviews.result;

const db = {
  listings,
  reviews
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(db, null, 2));
console.log('Seeded db.json with mock data.');
