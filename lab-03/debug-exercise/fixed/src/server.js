// debug-exercise/fixed/src/server.js
// Fixed server file resolving all 4 bugs:
//   Fix A: Use single listener and configurable process.env.PORT
//   Fix B: Correct import path './db'
//   Fix D: Added 'await' before asynchronous database operation

require('dotenv').config();
const express = require('express');

// FIX FOR BUG B: Correct relative import path pointing to ./db
const { initDb, getDb } = require('./db');

const app = express();
app.use(express.json());

// FIX FOR BUG A: Bind to a single port using environment variable fallback
// No duplicate or conflicting listen calls
const PORT = process.env.PORT || 3000;

// FIX FOR BUG D: Added 'await' so db.get() resolves the actual row record
app.get('/books/:id', async (req, res, next) => {
  try {
    const db = await getDb();
    const bookId = parseInt(req.params.id, 10);

    if (isNaN(bookId) || bookId <= 0) {
      return res.status(400).json({ message: 'Invalid book ID. Must be a positive integer' });
    }

    // Awaiting the promise resolves to the book object or undefined
    const book = await db.get('SELECT * FROM books WHERE id = ?', [bookId]);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (err) {
    next(err);
  }
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Fixed server cleanly running on http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  start();
}

module.exports = { app };
