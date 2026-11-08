# Lab 1: Node.js and Express Server

## Student Details

- **Name:** PALLAPATI SUVIDHA
- **Registration Number:** 252U1R7073
- **Section:** CSE FSD 2B
- **Course:** Backend Development Fundamentals
- **Lab Number:** 01

---

## Live Link

- **Deployment Status:** Local Only (Deployment Pending)
- **Deployment URL:** N/A (Cloud deployment has not been authorized or configured for a remote hosting service).
- **Deployment Instructions:** To deploy on cloud platforms (such as Render or Railway):
  1. Push this repository to GitHub.
  2. Create a new Web Service on Render / Railway pointing to the `lab-01` directory.
  3. Set Build Command to `npm install`.
  4. Set Start Command to `node server.js`.
  5. The application dynamically binds to `process.env.PORT` if provided by the cloud platform, falling back to port `3000` locally.

---

## Objective

To set up a Node.js project, understand `package.json` and dependency management, create a basic HTTP server using Node.js's built-in `http` module, and build an Express server handling multiple routes with appropriate HTTP status codes and error handling.

---

## Technologies Used

- **Node.js:** Server-side JavaScript runtime environment.
- **Express.js:** Minimal and flexible Node.js web application framework.
- **JavaScript (CommonJS):** Standard module system using `require()` and `module.exports`.
- **npm (Node Package Manager):** Dependency and package management tool.
- **Visual Studio Code / Terminal:** Development and command-line execution environment.

---

## Project Structure

```text
lab-01/
├── node_modules/
├── screenshots/
│   ├── home.png
│   ├── about.png
│   ├── time.png
│   └── not-found.png
├── server-http.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## Installation and Setup

### Understanding `package.json` Fields

The `package.json` file serves as the manifest for the Node.js project. Key fields include:

- **`name`:** The identifier of the project or package (`lab-01`).
- **`version`:** The current version of the project (`1.0.0`), following semantic versioning (`major.minor.patch`).
- **`description`:** A brief explanation of what the project does.
- **`main`:** The primary entry point file of the application (`server.js`).
- **`scripts`:** Command shortcuts defined for npm execution (e.g., `npm start`, `npm run start:http`).
- **`dependencies`:** Lists the external npm packages required in production (`"express": "^5.3.0"`), which are downloaded into `node_modules`.
- **`type`:** Specifies the module system used across the project (`commonjs`).

### Prerequisites

- Node.js (version 18 or above)
- npm (Node Package Manager)

### Installation Steps

1. Open your terminal and navigate to the `lab-01` directory:
   ```bash
   cd lab-01
   ```
2. Install the project dependencies:
   ```bash
   npm install
   ```

---

## Steps to Run

1. Start the Express server:
   ```bash
   node server.js
   ```
   *(or run via npm script: `npm start`)*

2. The server outputs:
   ```text
   Express server running at http://localhost:3000
   ```

3. Open a browser or HTTP client (e.g., Postman, curl) and test the routes:
   - `http://localhost:3000/`
   - `http://localhost:3000/about`
   - `http://localhost:3000/time`
   - `http://localhost:3000/anything`

---

## How to Run the Basic HTTP Server

To test the server built using Node.js's native `http` module:

1. Ensure the Express server is stopped (`Ctrl + C`).
2. Run the native HTTP server:
   ```bash
   node server-http.js
   ```
   *(or run via npm script: `npm run start:http`)*

3. The server outputs:
   ```text
   HTTP server running at http://localhost:3000
   ```

4. Open `http://localhost:3000` in your browser. The response will be the plain text message:
   ```text
   Hello
   ```

> **Note:** Always stop a running server with `Ctrl + C` before starting another server on port 3000 to prevent port collisions (`EADDRINUSE`).

---

## Endpoints

| Method | Endpoint | Description | Expected Status |
| :--- | :--- | :--- | :--- |
| GET | `/` | Welcome message | 200 OK |
| GET | `/about` | Student name and section in JSON | 200 OK |
| GET | `/time` | Current date and time | 200 OK |
| GET | `/anything` | Unknown route demonstration | 404 Not Found |

> **Note:** `/anything` is an example of an undefined path. All other unregistered or unknown routes also trigger the catch-all middleware and return HTTP status `404 Not Found` with the body `404 - Page Not Found`.

---

## Screenshots

### 1. Home Route (`GET /`)
Returns a welcome message with HTTP status 200 OK.

![Home route](screenshots/home.png)

### 2. About Route (`GET /about`)
Returns the student's name and section in JSON format with HTTP status 200 OK.

![About route](screenshots/about.png)

### 3. Time Route (`GET /time`)
Returns the current date and time generated via `new Date()` with HTTP status 200 OK.

![Time route](screenshots/time.png)

### 4. Unknown Route (`GET /anything`)
Returns a 404 Not Found message with HTTP status 404.

![Unknown route](screenshots/not-found.png)

---

## HTTP Status Codes

- **200 OK:** Standard HTTP response indicating that the request has succeeded. Returned by the `/`, `/about`, and `/time` endpoints.
- **404 Not Found:** Standard HTTP client error response indicating that the server cannot find the requested resource. Returned by the catch-all middleware for any undefined route.

---

## Viva Questions and Answers

### 1. What is the difference between `package.json` and `node_modules`?
- **`package.json`** is a lightweight manifest file written in JSON that records project metadata, author information, executable scripts, and lists package dependencies and version ranges. It is committed to version control.
- **`node_modules`** is the physical directory that stores the actual downloaded JavaScript code and binary artifacts for all installed packages and their transitive dependencies. Due to its large size and system-specific builds, it is excluded from version control and installed on demand using `npm install`.

### 2. What does `app.listen()` do?
`app.listen()` binds and starts the web server on a designated network port and host address. Behind the scenes, it invokes Node.js's native `http.createServer()` method and begins listening for incoming client TCP connections, routing HTTP requests to the defined Express routes and middleware handlers.

### 3. What do `request` and `response` represent?
- **`request` (req):** Represents the incoming HTTP request from the client. It contains request details such as the HTTP method (`GET`, `POST`), request URL, headers, query parameters (`req.query`), route parameters (`req.params`), and request body (`req.body`).
- **`response` (res):** Represents the outgoing HTTP response sent back to the client. It provides helper methods such as `res.status()` to set HTTP status codes, `res.send()` to transmit plain text or HTML, `res.json()` to format and return JSON data, and `res.setHeader()` / `res.writeHead()` to configure response headers.

---

## Problems Faced and Solutions

1. **Reference Repository Lookup:**
   - *Problem:* Accessing `https://github.com/shaik-creator/Backend_development_fundamentals_lab_01` resulted in a 404 error because the repository name on GitHub is `Backend_development_fundamentals_lab`.
   - *Solution:* Used the GitHub API to query repositories owned by `shaik-creator`, identified the active repository name `Backend_development_fundamentals_lab`, and inspected the exact reference implementation inside `lab-01/`.
2. **Port 3000 Collision Between Servers:**
   - *Problem:* Starting `server.js` while `server-http.js` was still active caused an `EADDRINUSE: address already in use :::3000` error.
   - *Solution:* Ensured the native HTTP server process was terminated before starting the Express server, and documented the need to stop running servers with `Ctrl + C`.
3. **HTTP 404 Status Code Handling:**
   - *Problem:* Merely returning a string containing "404" with `response.send()` would default to HTTP status 200 OK.
   - *Solution:* Explicitly chained `response.status(404).send("404 - Page Not Found")` in the catch-all handler so that the client receives the proper HTTP 404 status header.

---

## Git and Repository Notes

- The `.gitignore` file excludes `node_modules/` and `.env` from Git tracking.
- `node_modules/` is never committed to GitHub.
- Screenshots are stored under `screenshots/` and referenced using relative Markdown paths.
- The project is cleanly structured for submission to GitHub.

