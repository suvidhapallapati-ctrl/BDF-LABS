# Lab 3: REST API, query parameters, validation, debugging

**Name:** PALLAPATI SUVIDHA · **Registration Number:** 252U1R7073 · **Section:** CSE FSD 2B  
**GitHub Profile:** [PALLAPATI SUVIDHA (suvidhapallapati-ctrl)](https://github.com/suvidhapallapati-ctrl)  
**GitHub Repository:** [suvidhapallapati-ctrl/suvidha](https://github.com/suvidhapallapati-ctrl/suvidha)  
**Live link:** https://bdf-lab03-books-api.onrender.com *(Deployment Status: Local verification complete. Remote cloud deployment on Render/Railway is pending environment provisioning; comprehensive Postman test collection and response screenshots are provided below for every endpoint).*

---

## How to run

1. **Clone the repository and navigate into the `lab-03` directory:**
   ```bash
   cd lab-03
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the `.env.example` template to `.env`:
   ```bash
   cp .env.example .env
   ```
   Configure the following environment variables in `.env` (variable names only):
   - `PORT`: Network port number on which the Express server listens.
   - `DB_PATH`: Relative or absolute file path to the SQLite database file.

4. **Start the server:**
   ```bash
   npm start
   ```
   *(For development with auto-reloading: `npm run dev`)*

---

## Endpoints

| Method | Path | One-line description |
| :--- | :--- | :--- |
| **GET** | `/` | API overview and available endpoints directory. |
| **GET** | `/books` | Retrieve books with optional search, sorting, price filtering, and pagination. |
| **GET** | `/books/:id` | Retrieve a single book record by its unique ID. |
| **POST** | `/books` | Create and persist a new book record with input validation. |
| **PUT** | `/books/:id` | Update an existing book record by ID with full input validation. |
| **DELETE** | `/books/:id` | Remove an existing book record from the database by ID. |

---

## Postman test list

| Test | Request | Expected status | Expected response |
| :--- | :--- | :---: | :--- |
| **GET /books (Default)** | `GET http://localhost:3000/books` | `200 OK` | JSON array of up to 10 books sorted by `id ASC`. |
| **GET /books (Search Query)** | `GET http://localhost:3000/books?search_q=The` | `200 OK` | JSON array of books with titles containing `"The"`. |
| **GET /books (Sorting)** | `GET http://localhost:3000/books?order_by=price&order=DESC` | `200 OK` | JSON array of books ordered by price descending. |
| **GET /books (Pagination)** | `GET http://localhost:3000/books?limit=5&offset=0` | `200 OK` | JSON array containing exactly the first 5 books. |
| **GET /books (Price Range)** | `GET http://localhost:3000/books?min_price=10&max_price=15` | `200 OK` | JSON array of books with price between 10.00 and 15.00. |
| **GET /books/:id (Success)** | `GET http://localhost:3000/books/1` | `200 OK` | Book object: `{"id":1,"title":"The Great Gatsby","author":"F. Scott Fitzgerald","price":10.99}`. |
| **GET /books/:id (Not Found)** | `GET http://localhost:3000/books/9999` | `404 Not Found` | `{"message":"Book not found"}` |
| **POST /books (Valid Body)** | `POST http://localhost:3000/books`<br>Body: `{"title":"Clean Code","author":"Robert C. Martin","price":28.50}` | `201 Created` | `{"message":"Book created successfully","book":{"id":13,"title":"Clean Code","author":"Robert C. Martin","price":28.5}}` |
| **POST /books (Missing Title)** | `POST http://localhost:3000/books`<br>Body: `{"author":"Robert C. Martin","price":28.50}` | `400 Bad Request` | `{"message":"Title is required and must be a non-empty string"}` |
| **POST /books (Missing Author)** | `POST http://localhost:3000/books`<br>Body: `{"title":"The Pragmatic Programmer","price":34.00}` | `400 Bad Request` | `{"message":"Author is required and must be a non-empty string"}` |
| **POST /books (Price = "abc")** | `POST http://localhost:3000/books`<br>Body: `{"title":"Refactoring","author":"Martin Fowler","price":"abc"}` | `400 Bad Request` | `{"message":"Price is required and must be a non-negative number"}` |
| **PUT /books/:id (Valid Body)** | `PUT http://localhost:3000/books/1`<br>Body: `{"title":"The Great Gatsby (Revised)","author":"F. Scott Fitzgerald","price":14.50}` | `200 OK` | `{"message":"Book updated successfully","book":{"id":1,"title":"The Great Gatsby (Revised)","author":"F. Scott Fitzgerald","price":14.5}}` |
| **PUT /books/:id (Missing ID)** | `PUT http://localhost:3000/books/9999`<br>Body: `{"title":"Ghost Book","author":"Nobody","price":20.00}` | `404 Not Found` | `{"message":"Book not found"}` |
| **PUT /books/:id (Invalid Body)**| `PUT http://localhost:3000/books/1`<br>Body: `{"title":"","author":"Valid Author","price":15.00}` | `400 Bad Request` | `{"message":"Title is required and must be a non-empty string"}` |
| **DELETE /books/:id (Success)** | `DELETE http://localhost:3000/books/12` | `200 OK` | `{"message":"Book deleted successfully"}` |
| **DELETE /books/:id (Missing ID)**| `DELETE http://localhost:3000/books/9999` | `404 Not Found` | `{"message":"Book not found"}` |

---

## Screenshots

### 1. Success Responses
- **GET /books (Default List):**  
  ![GET /books default response](screenshots/01-get-books-default.png)
- **GET /books (Search by query `search_q=The`):**  
  ![GET /books search_q response](screenshots/02-get-books-search.png)
- **GET /books (Sorting by `order_by=price&order=DESC`):**  
  ![GET /books order_by and order response](screenshots/03-get-books-sorted.png)
- **GET /books (Pagination with `limit=5&offset=0`):**  
  ![GET /books limit and offset response](screenshots/04-get-books-pagination.png)
- **GET /books (Price filter `min_price=10&max_price=15`):**  
  ![GET /books min_price and max_price response](screenshots/05-get-books-price-filter.png)
- **GET /books/:id (Retrieve Book 1):**  
  ![GET /books/:id success response](screenshots/06-get-book-by-id-200.png)
- **POST /books (Create valid book):**  
  ![POST /books success 201 response](screenshots/07-post-book-201.png)
- **PUT /books/:id (Update book 1):**  
  ![PUT /books/:id success 200 response](screenshots/08-put-book-200.png)
- **DELETE /books/:id (Delete book):**  
  ![DELETE /books/:id success 200 response](screenshots/09-delete-book-200.png)

### 2. Error Responses
- **GET /books/:id (Non-existent ID 9999 - 404):**  
  ![GET /books/:id 404 Not Found](screenshots/10-get-book-404.png)
- **POST /books (Missing Title - 400):**  
  ![POST /books 400 Missing Title](screenshots/11-post-missing-title-400.png)
- **POST /books (Missing Author - 400):**  
  ![POST /books 400 Missing Author](screenshots/12-post-missing-author-400.png)
- **POST /books (Non-numeric Price "abc" - 400):**  
  ![POST /books 400 Price String](screenshots/13-post-price-abc-400.png)
- **PUT /books/:id (Non-existent ID 9999 - 404):**  
  ![PUT /books/:id 404 Not Found](screenshots/14-put-book-404.png)
- **PUT /books/:id (Empty Title - 400):**  
  ![PUT /books/:id 400 Empty Title](screenshots/15-put-invalid-body-400.png)
- **DELETE /books/:id (Non-existent ID 9999 - 404):**  
  ![DELETE /books/:id 404 Not Found](screenshots/16-delete-book-404.png)

### 3. Database View
- **SQLite Database View (showing seeded and inserted records):**  
  ![SQLite Database Schema and Records](screenshots/17-database-view.png)

---

## Debugging exercise

The folder `debug-exercise/` contains a deliberately broken implementation in `debug-exercise/broken/` and the resolved version in `debug-exercise/fixed/`.

### Bug 1: Port Conflict (`EADDRINUSE`)
- **Error Message:**  
  ```text
  Error: listen EADDRINUSE: address already in use :::3000
      at Server.setupListenHandle [as _listen2] (node:net:1904:16)
      code: 'EADDRINUSE',
      syscall: 'listen',
      port: 3000
  ```
- **Cause:** Two servers or processes attempted to bind to port 3000 at the same time.
- **Fix:** Ensure only a single listener binds to `PORT`, utilize `process.env.PORT` to allow dynamic allocation, and kill any lingering processes using `npx kill-port 3000` or choosing another free port.

### Bug 2: Wrong Import/Require Path (`MODULE_NOT_FOUND`)
- **Error Message:**  
  ```text
  Error: Cannot find module './database/db'
  Require stack:
  - lab-03/debug-exercise/broken/src/server.js
      code: 'MODULE_NOT_FOUND'
  ```
- **Cause:** The require statement referenced `./database/db` when the actual database module was located at `./db.js`.
- **Fix:** Correct the relative import path to `const { initDb, getDb } = require('./db');`.

### Bug 3: Table-Name Typo ("no such table")
- **Error Message:**  
  ```text
  [Error: SQLITE_ERROR: no such table: books] {
    errno: 1,
    code: 'SQLITE_ERROR'
  }
  ```
- **Cause:** The DDL migration created a table named `books_inventory`, but endpoint queries executed `SELECT * FROM books`.
- **Fix:** Align table names by updating DDL to `CREATE TABLE IF NOT EXISTS books (...)`.

### Bug 4: Missing `await` on Asynchronous Operation
- **Error / Faulty Behavior:**  
  Requesting `GET /books/9999` returned `HTTP 200 OK` with `{}` instead of `HTTP 404 Not Found` with `{ "message": "Book not found" }`.
- **Cause:** Calling `const book = db.get(...)` without `await` stores an unresolved `Promise` object. In JavaScript, promises are truthy, which bypasses `if (!book)` checks and serializes to an empty object `{}`.
- **Fix:** Add `await` before asynchronous database calls: `const book = await db.get('SELECT * FROM books WHERE id = ?', [bookId]);`.

---

## Notes: problems faced and how I solved them

1. **SQL Injection Prevention with Dynamic Filtering and Sorting:**
   - *Problem:* While filter values (`LIKE ?`, `BETWEEN ? AND ?`) can use standard SQLite parameter placeholders `?`, SQL does not allow table/column names in `ORDER BY ?` or direction `?` to be parameterized.
   - *Solution:* Implemented strict whitelist validation (`ALLOWED_ORDER_BY = ['id', 'title', 'author', 'price']` and `ALLOWED_ORDER_DIR = ['ASC', 'DESC']`). If a user passes an unapproved sort column or direction, the API rejects the request with HTTP 400 rather than concatenating untrusted strings into the query.

2. **Strict Type Coercion and Input Validation:**
   - *Problem:* In JSON payloads, clients can pass numbers formatted as strings (e.g. `"price": "abc"` or `"price": "10.5"`), or omit required fields altogether.
   - *Solution:* Built a dedicated `validateBookBody()` helper that strictly validates `typeof title === 'string' && title.trim() !== ''`, `typeof author === 'string' && author.trim() !== ''`, and `typeof price === 'number' && !isNaN(price) && price >= 0`. Any violation immediately halts processing and returns HTTP 400 with a descriptive error message.

3. **Database Concurrency and Initialization:**
   - *Problem:* Simultaneous incoming requests could trigger race conditions if the database was not initialized prior to the server accepting traffic.
   - *Solution:* Ensured `await initDb()` resolves fully in `startServer()` before `app.listen(PORT)` binds to the network port. Cached the connection instance to reuse the same database handle across requests.

---

## Viva answers (short, 2-3 lines each)

- **Query parameter vs path parameter?**  
  A path parameter (e.g. `/books/:id`) identifies a specific resource entity hierarchically and is required to locate the resource. A query parameter (e.g. `/books?order_by=price&limit=5`) is optional and used after the `?` to filter, sort, search, or paginate a collection without altering the endpoint identity.

- **What does stateless mean?**  
  Statelessness means every HTTP request from a client to a server must contain all the information necessary to understand and process the request. The server retains no client session context between requests, improving scalability, reliability, and caching.

- **Which status code for bad input vs a missing record?**  
  Use `400 Bad Request` when the client sends invalid, malformed, or missing input (such as a missing title or non-numeric price). Use `404 Not Found` when the request syntax is valid but the requested resource ID does not exist in the database.
