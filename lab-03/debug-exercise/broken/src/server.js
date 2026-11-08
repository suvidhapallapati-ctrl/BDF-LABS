// debug-exercise/broken/src/server.js
// Deliberately broken server file containing:
//   Bug A: Port Conflict (EADDRINUSE)
//   Bug B: Wrong import/require path (MODULE_NOT_FOUND)
//   Bug D: Missing await on asynchronous database query

const express = require('express');
const http = require('http');

// BUG B: Wrong require path! Points to './database/db' instead of './db'
// Throws: Error: Cannot find module './database/db'
const { initDb, getDb } = require('./database/db');

const app = express();
app.use(express.json());

const PORT = 3000;

// BUG A: Creating and listening on port 3000 with a dummy HTTP server
// before calling app.listen(3000), causing:
// Error: listen EADDRINUSE: address already in use :::3000
const blockingServer = http.createServer();
blockingServer.listen(PORT);

// Endpoint with BUG D: Missing await on database query
app.get('/books/:id', async (req, res, next) => {
  try {
    const db = await getDb();
    const bookId = parseInt(req.params.id, 10);

    // BUG D: Missing 'await' before db.get(...)
    // db.get returns a Promise object, which is always TRUTHY!
    // Therefore `if (!book)` check fails, and `res.json(book)` serializes
    // an unresolved Promise to '{}' with status 200 even for non-existent IDs.
    const book = db.get('SELECT * FROM books WHERE id = ?', [bookId]);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (err) {
    next(err);
  }
});

// Second attempt to listen on the same port triggers EADDRINUSE
app.listen(PORT, () => {
  console.log(`Broken server attempting to listen on http://localhost:${PORT}`);
});
