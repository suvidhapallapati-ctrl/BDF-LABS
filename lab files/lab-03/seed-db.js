const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'books.db');
const seedSqlPath = path.join(__dirname, 'seed.sql');

const sqlContent = fs.readFileSync(seedSqlPath, 'utf8');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to books.db');
});

db.exec(sqlContent, (err) => {
  if (err) {
    console.error('Error executing seed SQL:', err.message);
    db.close();
    process.exit(1);
  }

  console.log('Seed SQL executed successfully!');

  db.all('SELECT * FROM book', [], (err, rows) => {
    if (err) {
      console.error('Error querying book table:', err.message);
    } else {
      console.log(`Verified: ${rows.length} records found in book table:`);
      console.table(rows);
    }
    db.close();
  });
});
