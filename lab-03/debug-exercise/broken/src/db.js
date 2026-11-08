// debug-exercise/broken/src/db.js
// Intentionally broken database module containing Bug C (table-name typo)

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

  // BUG C: Table created as "books_inventory" instead of "books"
  // When queries in server.js execute "SELECT * FROM books", SQLite throws:
  // "SQLITE_ERROR: no such table: books"
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS books_inventory (
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
