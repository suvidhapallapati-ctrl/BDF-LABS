-- SQLite CLI Seed Script for Lab 2
-- Run this script using: sqlite3 books.db < seed.sql

CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price INTEGER NOT NULL,
  pages INTEGER NOT NULL
);

INSERT INTO book (title, author, price, pages) VALUES
('The Alchemist', 'Paulo Coelho', 350, 208),
('Atomic Habits', 'James Clear', 550, 320),
('Clean Code', 'Robert C. Martin', 650, 464),
('To Kill a Mockingbird', 'Harper Lee', 399, 281),
('1984', 'George Orwell', 299, 328),
('The Great Gatsby', 'F. Scott Fitzgerald', 250, 180),
('Rich Dad Poor Dad', 'Robert T. Kiyosaki', 450, 336),
('Sapiens', 'Yuval Noah Harari', 499, 498),
('Thinking, Fast and Slow', 'Daniel Kahneman', 599, 512);

SELECT * FROM book;
