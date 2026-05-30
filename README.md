# Backend

Express API for the coding platform. It handles authentication, problem management, code execution through Judge0, submission tracking, and AI help through Gemini.

## Features

- Cookie-based authentication with JWT
- User registration, login, logout, and profile lookup
- Admin-only problem creation, update, and deletion
- Problem listing, solved-problem tracking, and submission history
- Code run and submit flows powered by Judge0
- AI helper endpoint backed by Gemini

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT and `cookie-parser`
- Judge0 via RapidAPI
- Google Gemini API

## Project Structure

```text
src/
  config/        Database connection
  controllers/   Route handlers
  middleware/    Auth and admin guards
  models/        Mongoose schemas
  routes/        Express routers
  utils/         Validation and Judge0 helpers
  index.js       App entry point
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
PORT=3000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
DB_CONNECT_STRING=your_mongodb_connection_string
JWT_KEY=your_jwt_secret
JUDGE0_API_KEY=your_judge0_api_key
JUDGE0_API_HOST=judge029.p.rapidapi.com
GEMINI_API_KEY=your_gemini_api_key
```

Optional:

```env
AUTH_COOKIE_DOMAIN=your-domain.com
```

`AUTH_COOKIE_DOMAIN` is only needed when you want to control the auth cookie domain in production.

## Installation

```bash
npm install
```

## Running Locally

Development:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

The API runs on `http://localhost:3000` by default.

## Scripts

- `npm run dev` starts the server with `nodemon`
- `npm start` starts the server with Node
- `npm test` is currently a placeholder

## Main API Routes

### Auth

- `POST /user/register`
- `POST /user/login`
- `GET /user/logout`
- `GET /user/myprofile`

### Problems

- `POST /problem/create` admin only
- `PUT /problem/update/:id` admin only
- `DELETE /problem/delete/:id` admin only
- `GET /problem/getallproblems`
- `GET /problem/mysolvedproblem`
- `GET /problem/submissions/:pid`
- `GET /problem/check/:problemid`

### Code Execution

- `POST /solution/runcode/:id`
- `POST /solution/submit/:id`

### Profile

- `DELETE /profile/deleteprofile/:id`

### AI

- `POST /ai/getdata`

## Auth Notes

- Auth uses an HTTP-only cookie named `token`
- Protected routes require that cookie to be present
- Admin routes require the logged-in user role to be `admin`
- New registrations default to the `user` role

## Setup Notes

- The frontend origin must match `CLIENT_ORIGIN` so cookies work correctly
- Judge0 credentials are required for problem validation, running code, and submissions
- `GEMINI_API_KEY` is required only for the AI endpoint

## Current Limitations

- No automated tests yet
- Admin accounts are not created from a dedicated admin onboarding flow
- API documentation is lightweight and based on route names rather than OpenAPI
