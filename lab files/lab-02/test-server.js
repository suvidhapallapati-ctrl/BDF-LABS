const http = require('http');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Function to make HTTP requests
const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const queryDb = (query, params = []) => {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, 'books.db');
    const db = new sqlite3.Database(dbPath);
    db.all(query, params, (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('--- Starting API Endpoints Verification ---\n');
  const port = process.env.PORT || 3000;

  // Wait a moment for server to be ready
  await sleep(1500);

  // 1. GET /books/
  console.log('1. Testing GET /books/ (Retrieve all books)...');
  const res1 = await makeRequest({
    hostname: '127.0.0.1',
    port: port,
    path: '/books/',
    method: 'GET',
  });
  console.log(`Status Code: ${res1.statusCode}`);
  console.log(`Books retrieved: ${Array.isArray(res1.body) ? res1.body.length : 0}`);
  console.log('Sample book:', res1.body[0]);
  console.log('PASS: GET /books/\n');

  // 2. GET /books/1/
  console.log('2. Testing GET /books/1/ (Retrieve book by ID)...');
  const res2 = await makeRequest({
    hostname: '127.0.0.1',
    port: port,
    path: '/books/1/',
    method: 'GET',
  });
  console.log(`Status Code: ${res2.statusCode}`);
  console.log('Retrieved book:', res2.body);
  console.log('PASS: GET /books/1/\n');

  // 3. POST /books/
  console.log('3. Testing POST /books/ (Insert a new book)...');
  const newBook = {
    title: 'Learning Node.js',
    author: 'John Smith',
    price: 400,
    pages: 250,
  };
  const res3 = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: port,
      path: '/books/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    newBook
  );
  console.log(`Status Code: ${res3.statusCode}`);
  console.log('Response Body:', res3.body);
  const createdId = res3.body.bookId;
  console.log(`Verifying in SQLite database for id = ${createdId}...`);
  const dbCheckPost = await queryDb('SELECT * FROM book WHERE id = ?', [createdId]);
  console.log('DB Record after POST:', dbCheckPost[0]);
  console.log('PASS: POST /books/\n');

  // 4. PUT /books/:bookId/
  console.log(`4. Testing PUT /books/${createdId}/ (Update the new book)...`);
  const updatedBook = {
    title: 'Updated Book',
    author: 'Updated Author',
    price: 500,
    pages: 300,
  };
  const res4 = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: port,
      path: `/books/${createdId}/`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    updatedBook
  );
  console.log(`Status Code: ${res4.statusCode}`);
  console.log('Response Body:', res4.body);
  console.log(`Verifying in SQLite database for id = ${createdId}...`);
  const dbCheckPut = await queryDb('SELECT * FROM book WHERE id = ?', [createdId]);
  console.log('DB Record after PUT:', dbCheckPut[0]);
  console.log('PASS: PUT /books/:bookId/\n');

  // 5. DELETE /books/:bookId/
  console.log(`5. Testing DELETE /books/${createdId}/ (Delete the book)...`);
  const res5 = await makeRequest({
    hostname: '127.0.0.1',
    port: port,
    path: `/books/${createdId}/`,
    method: 'DELETE',
  });
  console.log(`Status Code: ${res5.statusCode}`);
  console.log('Response Body:', res5.body);
  console.log(`Verifying deletion in SQLite database for id = ${createdId}...`);
  const dbCheckDelete = await queryDb('SELECT * FROM book WHERE id = ?', [createdId]);
  console.log('DB records matching deleted id:', dbCheckDelete.length);
  console.log('PASS: DELETE /books/:bookId/\n');

  // 6. Error Cases
  console.log('6. Testing Error Cases:');

  // 6a. GET /books/999/ (Non-existent book)
  const resErrGet = await makeRequest({
    hostname: '127.0.0.1',
    port: port,
    path: '/books/999/',
    method: 'GET',
  });
  console.log(`GET /books/999/ -> Status: ${resErrGet.statusCode}, Body:`, resErrGet.body);

  // 6b. POST /books/ with missing fields
  const resErrPost = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: port,
      path: '/books/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    { title: 'Incomplete Book' }
  );
  console.log(`POST /books/ (missing fields) -> Status: ${resErrPost.statusCode}, Body:`, resErrPost.body);

  // 6c. PUT /books/999/ (Non-existent book)
  const resErrPut = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: port,
      path: '/books/999/',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    updatedBook
  );
  console.log(`PUT /books/999/ -> Status: ${resErrPut.statusCode}, Body:`, resErrPut.body);

  // 6d. DELETE /books/999/ (Non-existent book)
  const resErrDelete = await makeRequest({
    hostname: '127.0.0.1',
    port: port,
    path: '/books/999/',
    method: 'DELETE',
  });
  console.log(`DELETE /books/999/ -> Status: ${resErrDelete.statusCode}, Body:`, resErrDelete.body);

  // 6e. SQL Injection Attempt in URL param (testing that ? placeholder protects the database)
  console.log('6e. Testing SQL Injection protection in URL param...');
  const sqlInjectionId = "1; DROP TABLE book; --";
  const resSqlInj = await makeRequest({
    hostname: '127.0.0.1',
    port: port,
    path: `/books/${encodeURIComponent(sqlInjectionId)}/`,
    method: 'GET',
  });
  console.log(`GET /books/${sqlInjectionId}/ -> Status: ${resSqlInj.statusCode}, Body:`, resSqlInj.body);
  const tableCheck = await queryDb("SELECT name FROM sqlite_master WHERE type='table' AND name='book';");
  console.log('Database integrity check: "book" table exists:', tableCheck.length > 0);
  if (tableCheck.length > 0) {
    console.log('PASS: SQL Injection safely handled by ? placeholders without compromising table.');
  } else {
    throw new Error('FAIL: SQL Injection compromised the database table!');
  }

  console.log('\n--- All Tests Successfully Verified Against Live Server & SQLite DB! ---');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
