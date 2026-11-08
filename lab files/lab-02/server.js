const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

// Middleware to parse incoming JSON request bodies (for POST and PUT)
app.use(express.json());

// Port configuration: reads environment variable PORT or defaults to 3000
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, "books.db");

let db = null;

/**
 * Task T3: initializeDBAndServer()
 * ONE async function that opens the SQLite database connection first
 * and starts the Express server ONLY after the connection succeeds.
 * If the connection fails, it catches the error, logs it, and terminates (process.exit(1)).
 * 
 * VIVA NOTE (1): Why await the database call?
 * Database I/O is asynchronous and non-blocking in Node.js.
 * We must 'await' the open() and database queries so JavaScript pauses execution
 * until the database driver completes the action and returns the result,
 * preventing 'undefined' data, race conditions, or unhandled promise rejections.
 */
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Ensure the book table exists with the required schema
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        price INTEGER,
        pages INTEGER
      );
    `);

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(`Database Initialization Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Root route for sanity check
app.get("/", (request, response) => {
  response.status(200).send("Welcome to Lab 2: SQLite Database & CRUD Routes API!");
});

/**
 * Route 1: GET /books/
 * Retrieves all books from the database.
 * Returns: 200 OK with array of book objects, or 500 on server error.
 */
app.get("/books/", async (request, response) => {
  try {
    const getBooksQuery = `SELECT * FROM book;`;
    const booksArray = await db.all(getBooksQuery);
    response.status(200).json(booksArray);
  } catch (error) {
    console.error("Error retrieving books:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Route 2: GET /books/:bookId/
 * Retrieves a single book by its primary key ID.
 * Returns: 200 OK with book object, 404 if not found, or 500 on server error.
 * 
 * VIVA NOTE (2): What is SQL injection and how do ? placeholders prevent it?
 * SQL Injection occurs when untrusted user input is directly concatenated into a SQL query,
 * allowing attackers to alter the query structure (e.g., bypassing auth or dropping tables).
 * Using '?' placeholders tells the database engine to treat user input strictly as literal
 * data values rather than executable SQL commands, neutralizing injection attempts completely.
 */
app.get("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;
    const getBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const book = await db.get(getBookQuery, [bookId]);

    if (book === undefined) {
      return response.status(404).json({ error: "Book not found" });
    }

    response.status(200).json(book);
  } catch (error) {
    console.error("Error retrieving book:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Route 3: POST /books/
 * Inserts a new book into the database.
 * Returns: 201 Created with new bookId, 400 if fields are missing, or 500 on error.
 * 
 * VIVA NOTE (3): When is PUT used instead of POST?
 * - POST is used to CREATE a new resource. The server assigns the new ID and path.
 *   POST is NOT idempotent (multiple identical POST calls create multiple records).
 * - PUT is used to UPDATE or REPLACE an existing resource at a known URI (/books/:bookId/).
 *   PUT IS idempotent (repeating the exact same PUT request produces the identical end state).
 */
app.post("/books/", async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;

    // Validate required fields
    if (!title || !author || price === undefined || pages === undefined) {
      return response.status(400).json({
        error: "Missing required fields: title, author, price, and pages are required.",
      });
    }

    // Parameterized INSERT query using ? placeholders
    const addBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;

    const dbResponse = await db.run(addBookQuery, [title, author, price, pages]);
    const newBookId = dbResponse.lastID;

    response.status(201).json({
      message: "Book added successfully",
      bookId: newBookId,
    });
  } catch (error) {
    console.error("Error adding book:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Route 4: PUT /books/:bookId/
 * Updates all fields of an existing book.
 * Returns: 200 OK on success, 400 for bad input, 404 if book doesn't exist, 500 on error.
 */
app.put("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    // Validate required fields
    if (!title || !author || price === undefined || pages === undefined) {
      return response.status(400).json({
        error: "Missing required fields: title, author, price, and pages are required.",
      });
    }

    // Check if the book exists
    const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkBookQuery, [bookId]);

    if (existingBook === undefined) {
      return response.status(404).json({ error: "Book not found" });
    }

    // Parameterized UPDATE query
    const updateBookQuery = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `;

    await db.run(updateBookQuery, [title, author, price, pages, bookId]);
    response.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    console.error("Error updating book:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Route 5: DELETE /books/:bookId/
 * Deletes a book by ID.
 * Returns: 200 OK on success, 404 if not found, 500 on server error.
 */
app.delete("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    // Check if the book exists
    const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkBookQuery, [bookId]);

    if (existingBook === undefined) {
      return response.status(404).json({ error: "Book not found" });
    }

    // Parameterized DELETE query
    const deleteBookQuery = `DELETE FROM book WHERE id = ?;`;
    await db.run(deleteBookQuery, [bookId]);
    response.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// Fallback handler for unmatched endpoints
app.use((request, response) => {
  response.status(404).json({ error: "Route not found" });
});

module.exports = app;
