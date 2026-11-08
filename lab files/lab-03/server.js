const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Middleware to catch malformed JSON bodies and return HTTP 400
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Malformed JSON in request body" });
  }
  next(err);
});

// Port configuration: reads environment variable PORT or defaults to 3000
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, "books.db");

// Table name constant to avoid typos and centralize schema reference
const TABLE_NAME = "book";

// Whitelist of allowed columns for safe sorting
const ALLOWED_ORDER_COLUMNS = ["id", "title", "author", "price", "pages"];
const ALLOWED_ORDER_DIRECTIONS = ["ASC", "DESC"];

let db = null;

/**
 * Task T3 & T7(d): initializeDBAndServer()
 * Async initialization function ensuring SQLite DB connection is opened
 * and tables verified BEFORE the HTTP server begins listening for requests.
 */
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Ensure the book table exists with required schema
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    // Auto-seed table if empty (useful for fresh cloud deployments)
    const countResult = await db.get(`SELECT COUNT(*) as count FROM ${TABLE_NAME};`);
    if (countResult && countResult.count === 0) {
      await db.exec(`
        INSERT INTO ${TABLE_NAME} (title, author, price, pages) VALUES
        ('The Alchemist', 'Paulo Coelho', 350, 208),
        ('Atomic Habits', 'James Clear', 550, 320),
        ('Clean Code', 'Robert C. Martin', 650, 464),
        ('To Kill a Mockingbird', 'Harper Lee', 399, 281),
        ('1984', 'George Orwell', 299, 328),
        ('The Great Gatsby', 'F. Scott Fitzgerald', 250, 180),
        ('Rich Dad Poor Dad', 'Robert T. Kiyosaki', 450, 336),
        ('Sapiens', 'Yuval Noah Harari', 499, 498),
        ('Thinking, Fast and Slow', 'Daniel Kahneman', 599, 512);
      `);
      console.log("Database seeded with 9 initial books.");
    }

    const portToUse = process.env.PORT || PORT;
    const server = app.listen(portToUse, "127.0.0.1", () => {
      console.log(`Server is running at http://127.0.0.1:${portToUse}/`);
    });

    return server;
  } catch (error) {
    console.error(`Database Initialization Error: ${error.message}`);
    process.exit(1);
  }
};

// Start the server if this script is executed directly
if (require.main === module) {
  initializeDBAndServer();
}

/**
 * Validation helper for POST and PUT request bodies (Task T4)
 * Ensures title, author, price (and optional pages) adhere to required types and constraints.
 */
const validateBookBody = (body) => {
  if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
    return { valid: false, message: "Request body cannot be empty" };
  }

  const { title, author, price, pages } = body;

  // Title validation: required, must be a non-empty string
  if (title === undefined || title === null || typeof title !== "string" || title.trim() === "") {
    return { valid: false, message: "title is required and must be a non-empty string" };
  }

  // Author validation: required, must be a non-empty string
  if (author === undefined || author === null || typeof author !== "string" || author.trim() === "") {
    return { valid: false, message: "author is required and must be a non-empty string" };
  }

  // Price validation: required, numeric, non-negative
  if (
    price === undefined ||
    price === null ||
    price === "" ||
    typeof price === "boolean" ||
    isNaN(Number(price))
  ) {
    return { valid: false, message: "price is required and must be a valid number" };
  }

  const numPrice = Number(price);
  if (numPrice < 0) {
    return { valid: false, message: "price must be a non-negative number" };
  }

  // Pages validation (optional in body, defaults to 0 if omitted)
  let numPages = 0;
  if (pages !== undefined && pages !== null && pages !== "") {
    if (typeof pages === "boolean" || isNaN(Number(pages)) || !Number.isInteger(Number(pages)) || Number(pages) < 0) {
      return { valid: false, message: "pages must be a non-negative integer" };
    }
    numPages = Number(pages);
  }

  return {
    valid: true,
    data: {
      title: title.trim(),
      author: author.trim(),
      price: Math.round(numPrice),
      pages: numPages,
    },
  };
};

/**
 * Validation helper for path parameter :id
 */
const validateId = (idParam) => {
  // Must be a positive integer without decimals or extra characters
  if (!/^[1-9]\d*$/.test(idParam)) {
    return { valid: false, message: "id must be a positive integer" };
  }
  return { valid: true, id: parseInt(idParam, 10) };
};

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// Root route (Sanity check / deployment health-check)
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Lab 3: REST API, Query Parameters, Validation & Debugging",
  });
});

/**
 * Task T1, T2, T3: GET /books (and GET /books/)
 * List books with search, sort, price-range filter, and pagination.
 */
app.get(["/books", "/books/"], async (req, res) => {
  try {
    const {
      search_q = "",
      order_by = "id",
      order = "ASC",
      limit = "10",
      offset = "0",
      min_price,
      max_price,
    } = req.query;

    // 1. Validate search_q
    if (typeof search_q !== "string") {
      return res.status(400).json({ message: "search_q must be a string" });
    }

    // 2. Validate order_by against whitelist
    const normalizedOrderBy = String(order_by).toLowerCase();
    if (!ALLOWED_ORDER_COLUMNS.includes(normalizedOrderBy)) {
      return res.status(400).json({
        message: `Invalid order_by column '${order_by}'. Allowed columns: ${ALLOWED_ORDER_COLUMNS.join(", ")}`,
      });
    }

    // 3. Validate order against whitelist
    const normalizedOrder = String(order).toUpperCase();
    if (!ALLOWED_ORDER_DIRECTIONS.includes(normalizedOrder)) {
      return res.status(400).json({
        message: `Invalid order value '${order}'. Allowed values: ${ALLOWED_ORDER_DIRECTIONS.join(", ")}`,
      });
    }

    // 4. Validate limit (must be integer between 1 and 100)
    if (!/^[1-9]\d*$/.test(String(limit))) {
      return res.status(400).json({ message: "limit must be a positive integer between 1 and 100" });
    }
    const parsedLimit = parseInt(limit, 10);
    if (parsedLimit > 100) {
      return res.status(400).json({ message: "limit cannot exceed 100" });
    }

    // 5. Validate offset (must be non-negative integer)
    if (!/^(0|[1-9]\d*)$/.test(String(offset))) {
      return res.status(400).json({ message: "offset must be a non-negative integer" });
    }
    const parsedOffset = parseInt(offset, 10);

    // 6. Validate price-range filters (min_price and max_price)
    let parsedMinPrice = null;
    let parsedMaxPrice = null;

    if (min_price !== undefined) {
      if (min_price === "" || typeof min_price === "boolean" || isNaN(Number(min_price))) {
        return res.status(400).json({ message: "min_price must be a valid number" });
      }
      parsedMinPrice = Number(min_price);
      if (parsedMinPrice < 0) {
        return res.status(400).json({ message: "min_price must be a non-negative number" });
      }
    }

    if (max_price !== undefined) {
      if (max_price === "" || typeof max_price === "boolean" || isNaN(Number(max_price))) {
        return res.status(400).json({ message: "max_price must be a valid number" });
      }
      parsedMaxPrice = Number(max_price);
      if (parsedMaxPrice < 0) {
        return res.status(400).json({ message: "max_price must be a non-negative number" });
      }
    }

    if (parsedMinPrice !== null && parsedMaxPrice !== null && parsedMinPrice > parsedMaxPrice) {
      return res.status(400).json({ message: "min_price cannot be greater than max_price" });
    }

    // Build parameterized query safely
    const whereClauses = [];
    const queryParams = [];

    // Partial title match using SQL LIKE with bound %wildcards%
    if (search_q.trim() !== "") {
      whereClauses.push("title LIKE ?");
      queryParams.push(`%${search_q.trim()}%`);
    }

    // Price range conditions
    if (parsedMinPrice !== null && parsedMaxPrice !== null) {
      whereClauses.push("price BETWEEN ? AND ?");
      queryParams.push(parsedMinPrice, parsedMaxPrice);
    } else if (parsedMinPrice !== null) {
      whereClauses.push("price >= ?");
      queryParams.push(parsedMinPrice);
    } else if (parsedMaxPrice !== null) {
      whereClauses.push("price <= ?");
      queryParams.push(parsedMaxPrice);
    }

    const whereSQL = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(" AND ")}` : "";
    // Note: normalizedOrderBy and normalizedOrder are verified against hardcoded whitelists
    const booksQuery = `SELECT * FROM ${TABLE_NAME}${whereSQL} ORDER BY ${normalizedOrderBy} ${normalizedOrder} LIMIT ? OFFSET ?;`;
    queryParams.push(parsedLimit, parsedOffset);

    const books = await db.all(booksQuery, queryParams);

    res.status(200).json({
      message: "Books retrieved successfully",
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error("Error retrieving books:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Task T1, T5: GET /books/:id
 * Retrieve a single book by ID
 */
app.get("/books/:id", async (req, res) => {
  try {
    const idValidation = validateId(req.params.id);
    if (!idValidation.valid) {
      return res.status(400).json({ message: idValidation.message });
    }

    const book = await db.get(`SELECT * FROM ${TABLE_NAME} WHERE id = ?;`, [idValidation.id]);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      message: "Book retrieved successfully",
      data: book,
    });
  } catch (error) {
    console.error("Error retrieving book:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Task T1, T4, T5: POST /books
 * Create a new book
 */
app.post(["/books", "/books/"], async (req, res) => {
  try {
    const validation = validateBookBody(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const { title, author, price, pages } = validation.data;

    const insertQuery = `
      INSERT INTO ${TABLE_NAME} (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;

    const result = await db.run(insertQuery, [title, author, price, pages]);
    const createdBook = await db.get(`SELECT * FROM ${TABLE_NAME} WHERE id = ?;`, [result.lastID]);

    res.status(201).json({
      message: "Book created successfully",
      data: createdBook,
    });
  } catch (error) {
    console.error("Error creating book:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Task T1, T4, T5: PUT /books/:id
 * Update an existing book completely
 */
app.put("/books/:id", async (req, res) => {
  try {
    const idValidation = validateId(req.params.id);
    if (!idValidation.valid) {
      return res.status(400).json({ message: idValidation.message });
    }

    // Check existence first to return 404 if record does not exist
    const existingBook = await db.get(`SELECT * FROM ${TABLE_NAME} WHERE id = ?;`, [idValidation.id]);
    if (!existingBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    const validation = validateBookBody(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const { title, author, price, pages } = validation.data;

    const updateQuery = `
      UPDATE ${TABLE_NAME}
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `;

    await db.run(updateQuery, [title, author, price, pages, idValidation.id]);
    const updatedBook = await db.get(`SELECT * FROM ${TABLE_NAME} WHERE id = ?;`, [idValidation.id]);

    res.status(200).json({
      message: "Book updated successfully",
      data: updatedBook,
    });
  } catch (error) {
    console.error("Error updating book:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Task T1, T5: DELETE /books/:id
 * Delete a book by ID
 */
app.delete("/books/:id", async (req, res) => {
  try {
    const idValidation = validateId(req.params.id);
    if (!idValidation.valid) {
      return res.status(400).json({ message: idValidation.message });
    }

    // Check existence first to return 404 if record does not exist
    const existingBook = await db.get(`SELECT * FROM ${TABLE_NAME} WHERE id = ?;`, [idValidation.id]);
    if (!existingBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    await db.run(`DELETE FROM ${TABLE_NAME} WHERE id = ?;`, [idValidation.id]);

    res.status(200).json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting book:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// JSON 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Generic unhandled error handler (500 Internal server error)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = { app, initializeDBAndServer };
