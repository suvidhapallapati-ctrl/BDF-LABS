# Debugging Exercise - Lab 3

This folder contains a deliberately broken version of the project (`debug-exercise/broken/`) and its corrected counterpart (`debug-exercise/fixed/`).

---

## Summary of the 4 Bugs

| Bug | Category | File Affected | Error Produced | Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **Bug A** | Port Conflict | `src/server.js` | `Error: listen EADDRINUSE: address already in use :::3000` | Eliminate duplicate listeners and bind once using `process.env.PORT \|\| 3000`. |
| **Bug B** | Wrong Require Path | `src/server.js` | `Error: Cannot find module './database/db'` | Correct the relative module path from `'./database/db'` to `'./db'`. |
| **Bug C** | Table-Name Typo | `src/db.js` | `SQLITE_ERROR: no such table: books` | Align table name in DDL (`CREATE TABLE books`) with queries (`SELECT ... FROM books`). |
| **Bug D** | Missing `await` | `src/server.js` | Returns HTTP 200 with `{}` on missing ID instead of HTTP 404 | Add `await` before asynchronous `db.get(...)` call. |

---

## Detailed Breakdown

### Bug A: Port Conflict (`EADDRINUSE`)

- **Description:** Attempting to bind the Express application to a port that is already occupied by another running process or socket listener.
- **Broken Code (`debug-exercise/broken/src/server.js`):**
  ```javascript
  const blockingServer = http.createServer();
  blockingServer.listen(3000);

  // Attempting to listen on 3000 again
  app.listen(3000);
  ```
- **Error Output in Terminal:**
  ```text
  node:events:497
        throw er; // Unhandled 'error' event
        ^

  Error: listen EADDRINUSE: address already in use :::3000
      at Server.setupListenHandle [as _listen2] (node:net:1904:16)
      at listenInCluster (node:net:1961:12)
      at Server.listen (node:net:2063:7)
  Emitted 'error' event on Server instance at:
      at emitErrorNT (node:net:1940:8)
      at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
    code: 'EADDRINUSE',
    errno: -4091,
    syscall: 'listen',
    address: '::',
    port: 3000
  }
  ```
- **Root Cause:** In TCP/IP networking, only one process/socket can listen on a specific port at any given time on the same IP interface.
- **Fix Applied (`debug-exercise/fixed/src/server.js`):**
  ```javascript
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  ```
  Ensure any hanging node process on port 3000 is terminated (`npx kill-port 3000` or `Stop-Process`), or specify an unused port in `.env` (e.g. `PORT=3001`).

---

### Bug B: Wrong Import / Require Path (`MODULE_NOT_FOUND`)

- **Description:** The server file attempts to require `./database/db` when the actual file is at `./db.js`.
- **Broken Code (`debug-exercise/broken/src/server.js`):**
  ```javascript
  const { initDb, getDb } = require('./database/db');
  ```
- **Error Output in Terminal:**
  ```text
  node:internal/modules/cjs/loader:1252
    throw err;
    ^

  Error: Cannot find module './database/db'
  Require stack:
  - C:\Users\suvid\OneDrive\Desktop\BDF LABS\lab-03\debug-exercise\broken\src\server.js
      at Module._resolveFilename (node:internal/modules/cjs/loader:1249:15)
      at Module._load (node:internal/modules/cjs/loader:1075:27)
      at TracingChannel.traceSync (node:diagnostics_channel:322:14)
      at wrapModuleLoad (node:internal/modules/cjs/loader:220:24)
      at Module.require (node:internal/modules/cjs/loader:1342:12)
      at require (node:internal/modules/helpers:138:16) {
    code: 'MODULE_NOT_FOUND',
    requireStack: [
      'C:\\Users\\suvid\\OneDrive\\Desktop\\BDF LABS\\lab-03\\debug-exercise\\broken\\src\\server.js'
    ]
  }
  ```
- **Root Cause:** CommonJS module resolution resolves relative paths starting with `./` from the directory of the requesting file (`src/`). There is no subfolder `src/database/db.js`.
- **Fix Applied (`debug-exercise/fixed/src/server.js`):**
  ```javascript
  const { initDb, getDb } = require('./db');
  ```

---

### Bug C: Table-Name Typo ("no such table")

- **Description:** The database initialization creates a table named `books_inventory`, but SQL endpoints query `books`.
- **Broken Code (`debug-exercise/broken/src/db.js`):**
  ```javascript
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS books_inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price REAL NOT NULL
    );
  `);
  ```
- **Error Output in Terminal / Response:**
  ```text
  [Error: SQLITE_ERROR: no such table: books] {
    errno: 1,
    code: 'SQLITE_ERROR'
  }
  ```
- **Root Cause:** SQLite evaluates SQL statements at execution time. If the referenced table identifier in `SELECT * FROM books` does not exist in the database schema, SQLite raises a fatal syntax/schema error (`SQLITE_ERROR: no such table: books`).
- **Fix Applied (`debug-exercise/fixed/src/db.js`):**
  ```javascript
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price REAL NOT NULL
    );
  `);
  ```

---

### Bug D: Missing `await` on Asynchronous Database Operation

- **Description:** Calling an asynchronous promise-returning database method without the `await` keyword.
- **Broken Code (`debug-exercise/broken/src/server.js`):**
  ```javascript
  app.get('/books/:id', async (req, res, next) => {
    // Missing 'await'!
    const book = db.get('SELECT * FROM books WHERE id = ?', [bookId]);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  });
  ```
- **Error Output / Faulty Behavior:**
  - An asynchronous function returns a `Promise { <pending> }`.
  - In JavaScript, any object reference—including an unresolved Promise—is **truthy**.
  - The condition `if (!book)` evaluates to `false`, bypassing the 404 check!
  - `res.json(book)` passes the unresolved Promise to `JSON.stringify()`, which serializes non-enumerable properties to `{}`.
  - The client receives `HTTP 200 OK` with body `{}` even when the book ID does not exist in the database!
- **Fix Applied (`debug-exercise/fixed/src/server.js`):**
  ```javascript
  const book = await db.get('SELECT * FROM books WHERE id = ?', [bookId]);
  ```
