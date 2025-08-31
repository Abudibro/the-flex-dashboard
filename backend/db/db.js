

import path from 'path';
import { fileURLToPath } from 'url';
import { Low, JSONFile } from 'lowdb';
let dbInstance = null;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function getDb() {
	if (dbInstance) return dbInstance;
	const file = path.join(__dirname, 'db.json');
	const adapter = new JSONFile(file);
	const db = new Low(adapter);
	await db.read();
	if (!db.data) {
		db.data = { listings: [], reviews: [] };
		await db.write();
	}
	dbInstance = db;
	return db;
}
