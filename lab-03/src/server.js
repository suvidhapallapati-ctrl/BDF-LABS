// src/server.js
// Express Application Server implementing REST API with SQLite

require('dotenv').config();
const express = require('express');
const { initDb, getDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Allowed whitelist fields for SQL ORDER BY clause to prevent SQL injection
const ALLOWED_ORDER_BY = ['id', 'title', 'author', 'price'];
const ALLOWED_ORDER_DIR = ['ASC', 'DESC'];

/**
 * Helper function to validate request body for POST and PUT operations
 * Returns an error message string if invalid, or null if valid.
 */
function validateBookBody(body) {
  const { title, author, price } = body;

  // Title must be present, non-empty, and a string
  if (title === undefined || typeof title !== 'string' || title.trim() === '') {
    return 'Title is required and must be a non-empty string';
  }

  // Author must be present, non-empty, and a string
  if (author === undefined || typeof author !== 'string' || author.trim() === '') {
    return 'Author is required and must be a non-empty string';
  }

  // Price must be present, a number, not NaN, and non-negative
  if (price === undefined || typeof price !== 'number' || isNaN(price) || price < 0) {
    return 'Price is required and must be a non-negative number';
  }

  return null;
}

// -------------------------------------------------------------
// Root Route: API Overview
// -------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Lab 3 Books REST API',
    endpoints: {
      'GET /books': 'Retrieve books with optional search, sorting, price filter, and pagination',
      'GET /books/:id': 'Retrieve a specific book by ID',
      'POST /books': 'Create a new book record',
      'PUT /books/:id': 'Update an existing book record',
      'DELETE /books/:id': 'Delete a book record by ID'
    }
  });
});

// -------------------------------------------------------------
// Task 1 & 2 & 3: GET /books (with query parameters, filtering, sorting, pagination)
// -------------------------------------------------------------
app.get('/books', async (req, res, next) => {
  try {
    const db = await getDb();

    // Destructure query parameters with defaults
    const {
      search_q = '',
      order_by = 'id',
      order = 'ASC',
      limit = '10',
      offset = '0',
      min_price,
      max_price
    } = req.query;

    // Validate order_by against whitelist
    const normalizedOrderBy = String(order_by).toLowerCase();
    if (!ALLOWED_ORDER_BY.includes(normalizedOrderBy)) {
      return res.status(400).json({
        message: `Invalid order_by field. Allowed fields: ${ALLOWED_ORDER_BY.join(', ')}`
      });
    }

    // Validate order direction against whitelist
    const normalizedOrder = String(order).toUpperCase();
    if (!ALLOWED_ORDER_DIR.includes(normalizedOrder)) {
      return res.status(400).json({
        message: 'Invalid order direction. Allowed values: ASC, DESC'
      });
    }

    // Validate limit parameter (positive integer)
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum <= 0) {
      return res.status(400).json({
        message: 'Invalid limit parameter. Must be a positive integer'
      });
    }

    // Validate offset parameter (non-negative integer)
    const offsetNum = parseInt(offset, 10);
    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({
        message: 'Invalid offset parameter. Must be a non-negative integer'
      });
    }

    // Validate price range if provided
    let minPriceNum = null;
    let maxPriceNum = null;

    if (min_price !== undefined) {
      minPriceNum = Number(min_price);
      if (isNaN(minPriceNum) || minPriceNum < 0) {
        return res.status(400).json({
          message: 'Invalid min_price parameter. Must be a non-negative number'
        });
      }
    }

    if (max_price !== undefined) {
      maxPriceNum = Number(max_price);
      if (isNaN(maxPriceNum) || maxPriceNum < 0) {
        return res.status(400).json({
          message: 'Invalid max_price parameter. Must be a non-negative number'
        });
      }
    }

    if (minPriceNum !== null && maxPriceNum !== null && minPriceNum > maxPriceNum) {
      return res.status(400).json({
        message: 'min_price cannot be greater than max_price'
      });
    }

    // Build parameterized query dynamically
    let baseSql = 'SELECT * FROM books';
    const whereConditions = [];
    const params = [];

    // Search filter: partial title match using LIKE
    if (search_q && search_q.trim() !== '') {
      whereConditions.push('title LIKE ?');
      params.push(`%${search_q.trim()}%`);
    }

    // Price range conditions
    if (minPriceNum !== null && maxPriceNum !== null) {
      whereConditions.push('price BETWEEN ? AND ?');
      params.push(minPriceNum, maxPriceNum);
    } else if (minPriceNum !== null) {
      whereConditions.push('price >= ?');
      params.push(minPriceNum);
    } else if (maxPriceNum !== null) {
      whereConditions.push('price <= ?');
      params.push(maxPriceNum);
    }

    if (whereConditions.length > 0) {
      baseSql += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Append safe ORDER BY and parameterised LIMIT / OFFSET
    baseSql += ` ORDER BY ${normalizedOrderBy} ${normalizedOrder} LIMIT ? OFFSET ?`;
    params.push(limitNum, offsetNum);

    const books = await db.all(baseSql, params);
    return res.status(200).json(books);
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// Task 1: GET /books/:id (Retrieve single book by ID)
// -------------------------------------------------------------
app.get('/books/:id', async (req, res, next) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    if (isNaN(bookId) || bookId <= 0) {
      return res.status(400).json({
        message: 'Invalid book ID. Must be a positive integer'
      });
    }

    const db = await getDb();
    const book = await db.get('SELECT * FROM books WHERE id = ?', [bookId]);

    if (!book) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    return res.status(200).json(book);
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// Task 1 & 4 & 5: POST /books (Create new book)
// -------------------------------------------------------------
app.post('/books', async (req, res, next) => {
  try {
    const validationError = validateBookBody(req.body);
    if (validationError) {
      return res.status(400).json({
        message: validationError
      });
    }

    const { title, author, price } = req.body;
    const db = await getDb();

    const result = await db.run(
      'INSERT INTO books (title, author, price) VALUES (?, ?, ?)',
      [title.trim(), author.trim(), price]
    );

    return res.status(201).json({
      message: 'Book created successfully',
      book: {
        id: result.lastID,
        title: title.trim(),
        author: author.trim(),
        price
      }
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// Task 1 & 4 & 5: PUT /books/:id (Update existing book)
// -------------------------------------------------------------
app.put('/books/:id', async (req, res, next) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    if (isNaN(bookId) || bookId <= 0) {
      return res.status(400).json({
        message: 'Invalid book ID. Must be a positive integer'
      });
    }

    const validationError = validateBookBody(req.body);
    if (validationError) {
      return res.status(400).json({
        message: validationError
      });
    }

    const db = await getDb();

    // Check if the book exists
    const existingBook = await db.get('SELECT * FROM books WHERE id = ?', [bookId]);
    if (!existingBook) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    const { title, author, price } = req.body;
    await db.run(
      'UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?',
      [title.trim(), author.trim(), price, bookId]
    );

    return res.status(200).json({
      message: 'Book updated successfully',
      book: {
        id: bookId,
        title: title.trim(),
        author: author.trim(),
        price
      }
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// Task 1 & 5: DELETE /books/:id (Delete existing book)
// -------------------------------------------------------------
app.delete('/books/:id', async (req, res, next) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    if (isNaN(bookId) || bookId <= 0) {
      return res.status(400).json({
        message: 'Invalid book ID. Must be a positive integer'
      });
    }

    const db = await getDb();

    // Check if the book exists
    const existingBook = await db.get('SELECT * FROM books WHERE id = ?', [bookId]);
    if (!existingBook) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    await db.run('DELETE FROM books WHERE id = ?', [bookId]);

    return res.status(200).json({
      message: 'Book deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 404 Handler for undefined routes
// -------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    message: 'Endpoint not found'
  });
});

// -------------------------------------------------------------
// Global Error Handler (500 Internal Server Error)
// -------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: `Internal server error: ${err.message}`
  });
});

// -------------------------------------------------------------
// Start Server
// -------------------------------------------------------------
async function startServer() {
  try {
    // Initialize SQLite database
    await initDb();
    const server = app.listen(PORT, () => {
      console.log(`Lab 3 Books API server running on http://localhost:${PORT}`);
    });
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start only when run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
