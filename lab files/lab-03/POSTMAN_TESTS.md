# Lab 3: Postman Test Suite & API Verification Checklist

This document details the complete verification checklist for the REST API developed in **Lab 3: REST API, query parameters, validation, debugging**. Every test case below has been executed and verified against the running server in Phase 7.

---

## 1. Postman Environment Setup

### Environment Variables
Configure an environment in Postman with the following variable:
- `BASE_URL`: 
  - **Local Development**: `http://localhost:3000`
  - **Live Deployed**: Replace with your deployed hosting URL (e.g., `https://your-app.onrender.com`)

### Standard Headers
For all `POST` and `PUT` requests, include the header:
```
Content-Type: application/json
```

---

## 2. Test Verification Matrix

### Success Cases (S-01 to S-15)

| Test ID | Test Name | Method | Full Endpoint / URL | Request Body (JSON) | Expected Status | Expected Response Body | Actual Result Observed | Pass / Fail |
|---|---|---|---|---|---|---|---|---|
| **S-01** | Retrieve all books (defaults applied) | `GET` | `{{BASE_URL}}/books` | *None* | `200 OK` | `{"message":"Books retrieved successfully","count":9,"data":[...]}` | `200 OK` with 9 book objects in `data` array | **PASS** |
| **S-02** | Partial title search (`search_q=Code`) | `GET` | `{{BASE_URL}}/books?search_q=Code` | *None* | `200 OK` | `{"message":"Books retrieved successfully","count":1,"data":[{"id":3,"title":"Clean Code",...}]}` | `200 OK`, count 1, `Clean Code` returned | **PASS** |
| **S-03** | Ascending sort by price | `GET` | `{{BASE_URL}}/books?order_by=price&order=ASC` | *None* | `200 OK` | `{"message":"Books retrieved successfully","count":9,"data":[...]}` sorted by price 250 -> 650 | `200 OK`, sorted by price ascending (250, 299, 350...) | **PASS** |
| **S-04** | Descending sort by price | `GET` | `{{BASE_URL}}/books?order_by=price&order=DESC` | *None* | `200 OK` | `{"message":"Books retrieved successfully","count":9,"data":[...]}` sorted by price 650 -> 250 | `200 OK`, sorted by price descending (650, 599, 550...) | **PASS** |
| **S-05** | Pagination (`limit=2&offset=2`) | `GET` | `{{BASE_URL}}/books?limit=2&offset=2` | *None* | `200 OK` | `{"message":"Books retrieved successfully","count":2,"data":[{"id":3,...},{"id":4,...}]}` | `200 OK`, 2 books returned skipping first 2 (IDs 3 & 4) | **PASS** |
| **S-06** | Minimum price filter (`min_price=450`) | `GET` | `{{BASE_URL}}/books?min_price=450` | *None* | `200 OK` | `{"message":"Books retrieved successfully","count":5,"data":[...]}` (all prices >= 450) | `200 OK`, count 5, every book price >= 450 | **PASS** |
| **S-07** | Maximum price filter (`max_price=350`) | `GET` | `{{BASE_URL}}/books?max_price=350` | *None* | `200 OK` | `{"message":"Books retrieved successfully","count":3,"data":[...]}` (all prices <= 350) | `200 OK`, count 3, every book price <= 350 | **PASS** |
| **S-08** | Price range filter (`min_price=300&max_price=500`) | `GET` | `{{BASE_URL}}/books?min_price=300&max_price=500` | *None* | `200 OK` | `{"message":"Books retrieved successfully","count":4,"data":[...]}` (BETWEEN 300 AND 500) | `200 OK`, count 4, all prices between 300 and 500 | **PASS** |
| **S-09** | Combined search, price, sort & pagination | `GET` | `{{BASE_URL}}/books?search_q=a&min_price=200&max_price=600&order_by=price&order=DESC&limit=3&offset=0` | *None* | `200 OK` | `{"message":"Books retrieved successfully","count":3,"data":[...]}` | `200 OK`, count 3, matching all combined constraints | **PASS** |
| **S-10** | Retrieve single book by existing ID | `GET` | `{{BASE_URL}}/books/1` | *None* | `200 OK` | `{"message":"Book retrieved successfully","data":{"id":1,"title":"The Alchemist",...}}` | `200 OK`, book with ID 1 returned | **PASS** |
| **S-11** | Create new book (valid payload) | `POST` | `{{BASE_URL}}/books` | `{"title":"Pragmatic Programmer","author":"David Thomas","price":620,"pages":352}` | `201 Created` | `{"message":"Book created successfully","data":{"id":10,"title":"Pragmatic Programmer",...}}` | `201 Created`, created book object with auto-generated ID 10 | **PASS** |
| **S-12** | Update existing book (valid payload) | `PUT` | `{{BASE_URL}}/books/10` | `{"title":"Pragmatic Programmer (20th Anniv)","author":"David Thomas","price":680,"pages":360}` | `200 OK` | `{"message":"Book updated successfully","data":{"id":10,"price":680,...}}` | `200 OK`, updated book object returned with price 680 | **PASS** |
| **S-13** | Delete existing book by ID | `DELETE` | `{{BASE_URL}}/books/10` | *None* | `200 OK` | `{"message":"Book deleted successfully"}` | `200 OK`, `Book deleted successfully` | **PASS** |
| **S-14** | Retrieve books with trailing slash | `GET` | `{{BASE_URL}}/books/` | *None* | `200 OK` | `{"message":"Books retrieved successfully","count":9,"data":[...]}` | `200 OK`, identical response to `/books` | **PASS** |
| **S-15** | Search with no matches (empty list) | `GET` | `{{BASE_URL}}/books?search_q=NonExistentMatch12345` | *None* | `200 OK` | `{"message":"Books retrieved successfully","count":0,"data":[]}` | `200 OK`, count 0, data is empty array `[]` | **PASS** |

---

### Failure & Validation Cases (F-01 to F-20)

| Test ID | Test Name | Method | Full Endpoint / URL | Request Body (JSON) | Expected Status | Expected Response Body | Actual Result Observed | Pass / Fail |
|---|---|---|---|---|---|---|---|---|
| **F-01** | POST missing title | `POST` | `{{BASE_URL}}/books` | `{"author":"No Title Author","price":300,"pages":100}` | `400 Bad Request` | `{"message":"title is required and must be a non-empty string"}` | `400 Bad Request`, message: `title is required and must be a non-empty string` | **PASS** |
| **F-02** | POST missing author | `POST` | `{{BASE_URL}}/books` | `{"title":"No Author Title","price":300,"pages":100}` | `400 Bad Request` | `{"message":"author is required and must be a non-empty string"}` | `400 Bad Request`, message: `author is required and must be a non-empty string` | **PASS** |
| **F-03** | POST non-numeric price (`"abc"`) | `POST` | `{{BASE_URL}}/books` | `{"title":"Bad Price Book","author":"Author","price":"abc","pages":100}` | `400 Bad Request` | `{"message":"price is required and must be a valid number"}` | `400 Bad Request`, message: `price is required and must be a valid number` | **PASS** |
| **F-04** | POST negative price (`-50`) | `POST` | `{{BASE_URL}}/books` | `{"title":"Negative Price Book","author":"Author","price":-50,"pages":100}` | `400 Bad Request` | `{"message":"price must be a non-negative number"}` | `400 Bad Request`, message: `price must be a non-negative number` | **PASS** |
| **F-05** | POST malformed JSON payload | `POST` | `{{BASE_URL}}/books` | `{"title": "Broken JSON", "price": }` | `400 Bad Request` | `{"message":"Malformed JSON in request body"}` | `400 Bad Request`, message: `Malformed JSON in request body` | **PASS** |
| **F-06** | GET invalid ID format (`/books/abc`) | `GET` | `{{BASE_URL}}/books/abc` | *None* | `400 Bad Request` | `{"message":"id must be a positive integer"}` | `400 Bad Request`, message: `id must be a positive integer` | **PASS** |
| **F-07** | GET non-existent ID (`/books/999999`) | `GET` | `{{BASE_URL}}/books/999999` | *None* | `404 Not Found` | `{"message":"Book not found"}` | `404 Not Found`, message: `Book not found` | **PASS** |
| **F-08** | PUT non-existent ID (`/books/999999`) | `PUT` | `{{BASE_URL}}/books/999999` | `{"title":"Valid Title","author":"Author","price":300,"pages":100}` | `404 Not Found` | `{"message":"Book not found"}` | `404 Not Found`, message: `Book not found` | **PASS** |
| **F-09** | PUT with invalid body (missing author) | `PUT` | `{{BASE_URL}}/books/1` | `{"title":"Valid Title","price":300}` | `400 Bad Request` | `{"message":"author is required and must be a non-empty string"}` | `400 Bad Request`, message: `author is required and must be a non-empty string` | **PASS** |
| **F-10** | DELETE non-existent ID (`/books/999999`) | `DELETE` | `{{BASE_URL}}/books/999999` | *None* | `404 Not Found` | `{"message":"Book not found"}` | `404 Not Found`, message: `Book not found` | **PASS** |
| **F-11** | DELETE invalid ID format (`/books/abc`) | `DELETE` | `{{BASE_URL}}/books/abc` | *None* | `400 Bad Request` | `{"message":"id must be a positive integer"}` | `400 Bad Request`, message: `id must be a positive integer` | **PASS** |
| **F-12** | Invalid sort direction (`order=SIDEWAYS`) | `GET` | `{{BASE_URL}}/books?order=SIDEWAYS` | *None* | `400 Bad Request` | `{"message":"Invalid order value 'SIDEWAYS'. Allowed values: ASC, DESC"}` | `400 Bad Request`, message: `Invalid order value 'SIDEWAYS'. Allowed values: ASC, DESC` | **PASS** |
| **F-13** | SQL injection / invalid column in `order_by` | `GET` | `{{BASE_URL}}/books?order_by=password;DROP TABLE books` | *None* | `400 Bad Request` | `{"message":"Invalid order_by column 'password;DROP TABLE books'. Allowed columns: id, title, author, price, pages"}` | `400 Bad Request`, column rejected, database unharmed | **PASS** |
| **F-14** | Invalid limit values (`abc`, `0`, `-5`, `150`) | `GET` | `{{BASE_URL}}/books?limit=abc` | *None* | `400 Bad Request` | `{"message":"limit must be a positive integer between 1 and 100"}` | `400 Bad Request`, all tested invalid limit values rejected | **PASS** |
| **F-15** | Invalid offset values (`-1`, `abc`) | `GET` | `{{BASE_URL}}/books?offset=-1` | *None* | `400 Bad Request` | `{"message":"offset must be a non-negative integer"}` | `400 Bad Request`, all tested invalid offset values rejected | **PASS** |
| **F-16** | Non-numeric `min_price` (`min_price=abc`) | `GET` | `{{BASE_URL}}/books?min_price=abc` | *None* | `400 Bad Request` | `{"message":"min_price must be a valid number"}` | `400 Bad Request`, message: `min_price must be a valid number` | **PASS** |
| **F-17** | Inverted price range (`min_price=500&max_price=100`) | `GET` | `{{BASE_URL}}/books?min_price=500&max_price=100` | *None* | `400 Bad Request` | `{"message":"min_price cannot be greater than max_price"}` | `400 Bad Request`, message: `min_price cannot be greater than max_price` | **PASS** |
| **F-18** | Unknown endpoint (`/unknown-route`) | `GET` | `{{BASE_URL}}/unknown-route` | *None* | `404 Not Found` | `{"message":"Route not found"}` | `404 Not Found`, message: `Route not found` | **PASS** |
| **F-19** | SQL injection in `search_q` (`' OR '1'='1`) | `GET` | `{{BASE_URL}}/books?search_q=' OR '1'='1` | *None* | `200 OK` | `{"message":"Books retrieved successfully","count":0,"data":[]}` | `200 OK`, treated safely as literal search text, 0 matches, no data leak | **PASS** |
| **F-20** | Unexpected server error handler | `ALL` | *Triggered via DB connection error* | *N/A* | `500 Internal Server Error` | `{"message":"Internal server error"}` | `500 Internal Server Error`, generic error returned without leaking stack trace | **PASS** |
