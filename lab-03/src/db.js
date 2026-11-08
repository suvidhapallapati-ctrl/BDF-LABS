// src/db.js
// Database configuration and initialization using SQLite and SQLite3 driver

const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
require('dotenv').config();

// Cached database connection instance
let dbInstance = null;

/**
 * Initializes and returns the SQLite database connection.
 * Creates the books table and seeds initial sample records if empty.
 */
async function initDb() {
  if (dbInstance) {
    return dbInstance;
  }

  // Determine database file path from environment variable or fallback to default
  const dbPath = process.env.DB_PATH || path.join(__dirname, '../books.db');

  // Open the SQLite database connection using promise-based wrapper
  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys for data integrity
  await dbInstance.run('PRAGMA foreign_keys = ON;');

  // Create the books table if it does not already exist
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price REAL NOT NULL
    );
  `);

  // Check if initial seed data is needed
  const rowCount = await dbInstance.get('SELECT COUNT(*) AS count FROM books');
  if (rowCount.count === 0) {
    console.log('Seeding initial books data into database...');
    const seedBooks = [
      ['The Great Gatsby', 'F. Scott Fitzgerald', 10.99],
      ['To Kill a Mockingbird', 'Harper Lee', 12.50],
      ['1984', 'George Orwell', 9.99],
      ['Pride and Prejudice', 'Jane Austen', 8.95],
      ['The Catcher in the Rye', 'J.D. Salinger', 11.20],
      ['The Hobbit', 'J.R.R. Tolkien', 14.99],
      ['Brave New World', 'Aldous Huxley', 13.40],
      ['Crime and Punishment', 'Fyodor Dostoevsky', 15.00],
      ['The Odyssey', 'Homer', 7.50],
      ['Don Quixote', 'Miguel de Cervantes', 16.80],
      ['War and Peace', 'Leo Tolstoy', 19.99],
      ['Hamlet', 'William Shakespeare', 6.99]
    ];

    for (const [title, author, price] of seedBooks) {
      await dbInstance.run(
        'INSERT INTO books (title, author, price) VALUES (?, ?, ?)',
        [title, author, price]
      );
    }
    console.log('Initial books seeded successfully.');
  }

  return dbInstance;
}

/**
 * Returns the active database instance.
 */
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
