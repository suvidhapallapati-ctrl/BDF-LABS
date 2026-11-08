# Backend Development Fundamentals - Lab Reports

Comprehensive laboratory experiments, implementations, and documentation for the **Backend Development Fundamentals** course.

---

## Student Information

- **Student Name:** PALLAPATI SUVIDHA
- **Registration Number:** 252U1R7073
- **Branch / Section:** CSE FSD 2B
- **Course:** Backend Development Fundamentals
- **Lab Number:** 01

---

## Lab Directory Index

| Lab | Title | Description | Technologies | Report Link |
| :---: | :--- | :--- | :--- | :---: |
| **Lab 01** | **Node.js and Express Server** | Introduction to backend servers using Node.js built-in `http` module and Express.js routing, status codes, and error handling. | Node.js, Express.js | [View Lab 01](./lab-01/) |
| **Lab 03** | **REST API, query parameters, validation, debugging** | Clean Books REST API featuring search, whitelisted sorting, price-range filtering, strict validation, correct HTTP status codes, and debugging exercise. | Node.js, Express.js, SQLite | [View Lab 03](./lab-03/) |

---

## Repository Structure

```plaintext
BDF LABS/
├── .gitignore
├── README.md
├── lab-01/
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   ├── server-http.js         # Built-in Node http server
│   ├── server.js              # Express application server
│   └── screenshots/           # Endpoint response screenshots
└── lab-03/
    ├── .env.example
    ├── .gitignore
    ├── package.json
    ├── package-lock.json
    ├── README.md
    ├── src/
    │   ├── db.js              # SQLite initialization & connection
    │   └── server.js          # REST API server & validation
    ├── debug-exercise/        # Broken and fixed debugging scenarios
    ├── postman/               # Postman collection v2.1
    └── screenshots/           # Endpoint execution screenshots
        ├── home.png
        ├── about.png
        ├── time.png
        └── not-found.png
```

---

## General Setup & Installation

Each lab experiment is self-contained within its respective directory. To set up and run Lab 01:

1. **Navigate into the lab directory:**
   ```bash
   cd lab-01
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the server:**
   - **Express Server:**
     ```bash
     npm start        # or: node server.js
     ```
   - **Basic HTTP Server:**
     ```bash
     npm run start:http # or: node server-http.js
     ```

Refer to [lab-01/README.md](./lab-01/README.md) for full experiment details, API endpoint specifications, review questions, and screenshots.

