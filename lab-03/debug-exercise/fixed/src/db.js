// debug-exercise/fixed/src/db.js
// Fixed database module with correct table name "books"

const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
require('dotenv').config();

let dbInstance = null;

async function initDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = process.env.DB_PATH || path.join(__dirname, '../books.db');

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // FIX FOR BUG C: Correct table name "books" matches query statements in server.js
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price REAL NOT NULL
    );
  `);

  return dbInstance;
}

async function getDb() {
  if (!dbInstance) {
    return await initDb();
  }
  return dbInstance;
}

module.exports = {
  initDb,
  getDb
};
