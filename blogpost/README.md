# Simple Blog Platform

A full-stack blog application built with a **React + TypeScript** frontend and an **Express + TypeScript** backend, connected to a **MySQL** database. Supports creating, reading, updating, and deleting blog posts with real-time search and dark/light mode.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Concepts Used](#concepts-used)
- [Project Structure](#project-structure)
- [How It All Works Together](#how-it-all-works-together)
- [File-by-File Breakdown](#file-by-file-breakdown)
  - [Root](#root)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, TypeScript, Vite, TailwindCSS v3      |
| Routing    | React Router DOM v6                             |
| Backend    | Node.js, Express v4, TypeScript, ts-node-dev    |
| Database   | MySQL 8 via `mysql2/promise` (connection pool)  |
| Styling    | TailwindCSS with custom dark/light theme tokens |
| Build Tool | Vite (frontend), tsc (backend)                  |
| Env Config | dotenv                                          |

---

## Concepts Used

### Backend
- **REST API** — Five endpoints following REST conventions (GET, POST, PUT, DELETE)
- **Express Router** — Routes are separated into their own module (`postRoutes.ts`) and mounted on `app.ts`
- **MVC-like Architecture** — Controllers handle business logic; routes only define the URL-to-handler mapping
- **MySQL Connection Pool** — `mysql2/promise` creates a reusable pool of connections instead of opening/closing one per request
- **Parameterised SQL Queries** — Placeholders (`?`) prevent SQL injection in all queries
- **LIKE Search** — Dynamic WHERE clause built at runtime for title/content search
- **dotenv** — Environment variables (DB credentials, PORT) are loaded from `.env` and never hardcoded
- **CORS Middleware** — Allows the frontend (different origin/port) to make API calls
- **TypeScript Interfaces** — `Post` interface enforces the shape of post data across the backend
- **async/await** — All DB calls are asynchronous (non-blocking)
- **ts-node-dev** — Hot-reloads the TypeScript server on file changes during development

### Frontend
- **React Functional Components** — Every UI piece is a function component, no class components
- **React Hooks**
  - `useState` — Local state for posts, search term, loading/error flags, form fields
  - `useEffect` — Fetches data on mount and whenever the `search` dependency changes
- **React Router DOM v6**
  - `BrowserRouter` — Wraps the app in `main.tsx` to enable client-side routing
  - `Routes` / `Route` — Declarative route definitions in `App.tsx`
  - `Link` — Client-side navigation without full page reload
  - `useNavigate` — Programmatically redirect after form submission
  - `useParams` — Extract dynamic URL segments (`:id`) in detail/edit pages
- **TypeScript Generics** — `apiFetch<T>` is a generic helper that infers the response type
- **Fetch API** — Native browser API used for all HTTP requests (no Axios)
- **Separation of Concerns** — API calls are isolated in `src/api/posts.ts`; components only call these functions
- **Component Composition** — `Home → PostList → PostCard` is a clear parent-to-child data chain
- **Props & Callback Pattern** — Parent pages own state; child components receive data and callbacks via props
- **TailwindCSS Dark Mode (`class` strategy)** — Dark mode toggled by adding/removing `dark` class on `<html>`
- **localStorage Persistence** — Dark/light preference is saved to `localStorage` and restored on reload
- **System Preference Detection** — `window.matchMedia('(prefers-color-scheme: dark)')` as a fallback
- **Custom Tailwind Theme Tokens** — Semantic color names (`dark-bg`, `accent-green`, `light-text`, etc.) defined in `tailwind.config.js`
- **Controlled Inputs** — Form fields bind to `useState` via `value` + `onChange`
- **Inline Form Validation** — `PostForm` checks for empty title/content before calling `onSubmit`
- **Loading & Error States** — Every async operation tracks `loading` and `error` state for UI feedback
- **Optimistic UI Refresh** — After delete, `loadPosts()` is called immediately to reflect the change
- **SVG Icons** — Inline SVG used for the search icon (no icon library needed)
- **`line-clamp`** — Tailwind utility to truncate overflowing text in post cards

---

## Project Structure

```
blogpost/                          ← Monorepo root
├── package.json                   ← Root-level deps (react-router-dom)
├── README.md                      ← This file
│
├── backend/                       ← Express + TypeScript API server
│   ├── .env                       ← DB credentials & PORT (not committed)
│   ├── package.json               ← Backend scripts & dependencies
│   ├── tsconfig.json              ← TypeScript compiler config (backend)
│   └── src/
│       ├── server.ts              ← Entry point — starts HTTP server
│       ├── app.ts                 ← Express app — middleware + route mounting
│       ├── db.ts                  ← MySQL connection pool (shared singleton)
│       ├── types/
│       │   └── Post.ts            ← TypeScript interface for a Post object
│       ├── routes/
│       │   └── postRoutes.ts      ← Maps URL patterns to controller functions
│       └── controllers/
│           └── postController.ts  ← All SQL logic for CRUD + search
│
└── frontend/                      ← React + Vite + TailwindCSS SPA
    ├── index.html                 ← HTML shell — mounts React at #root
    ├── vite.config.ts             ← Vite build configuration
    ├── tailwind.config.js         ← Custom color tokens + dark mode strategy
    ├── postcss.config.js          ← PostCSS config (required by TailwindCSS)
    ├── tsconfig.json              ← Root TS config (references app + node)
    ├── tsconfig.app.json          ← TS config for src/ files
    ├── tsconfig.node.json         ← TS config for vite.config.ts
    ├── eslint.config.js           ← ESLint rules (React hooks, refresh)
    ├── package.json               ← Frontend scripts & dependencies
    └── src/
        ├── main.tsx               ← React entry — wraps App in BrowserRouter
        ├── App.tsx                ← Root component — navbar + route definitions
        ├── index.css              ← Global base styles (Tailwind directives)
        ├── App.css                ← App-level styles
        ├── api/
        │   └── posts.ts           ← All fetch() calls to the backend API
        ├── components/
        │   ├── PostCard.tsx        ← Single post card (title, content, actions)
        │   ├── PostForm.tsx        ← Controlled form (used for create & edit)
        │   └── PostList.tsx        ← Maps posts array → list of PostCards
        └── pages/
            ├── Home.tsx            ← Fetches all posts, handles search & delete
            ├── CreatePost.tsx      ← Collects form data and calls createPost API
            ├── EditPost.tsx        ← Loads existing post data, submits update
            └── PostDetail.tsx      ← Fetches and displays a single full post
```

---

## How It All Works Together

```
Browser
  │
  ▼
main.tsx          ← Bootstraps React, wraps in <BrowserRouter>
  │
  ▼
App.tsx           ← Renders navbar + <Routes>; manages dark mode toggle
  │
  ├─ /            → Home.tsx
  ├─ /post/:id    → PostDetail.tsx
  ├─ /create      → CreatePost.tsx
  └─ /edit/:id    → EditPost.tsx
        │
        │  (all pages import from)
        ▼
   api/posts.ts   ← apiFetch<T>() wrapper → fetch() → HTTP request
        │
        │  (sends request to)
        ▼
   backend: app.ts → postRoutes.ts → postController.ts
                                           │
                                           ▼
                                        db.ts → MySQL (blog_db)
```

**Data flows top-down via props and bottom-up via callbacks:**

- `Home` owns `posts[]` state → passes it down to `PostList` → `PostList` maps to `PostCard`
- `PostCard` receives `onDelete` and `onEdit` callbacks from `Home` and calls them on user action
- `PostForm` receives `initialData` and `onSubmit` — it manages its own field state internally and calls `onSubmit` with the result

---

## File-by-File Breakdown

### Root

#### `package.json`
- Minimal root-level manifest
- Contains `react-router-dom ^7` as a dependency (likely added for monorepo convenience; the frontend uses its own copy at v6)

---

### Backend

#### `src/server.ts`
- **Role:** Application entry point
- Imports the configured `app` from `app.ts`
- Reads `PORT` from environment (defaults to `5000`)
- Calls `app.listen()` to start the HTTP server
- **Connects to:** `app.ts`

#### `src/app.ts`
- **Role:** Express application factory
- Creates the `express()` instance
- Registers global middleware:
  - `cors()` — permits cross-origin requests from the React dev server
  - `express.json()` — parses incoming JSON request bodies
- Mounts `postRoutes` at `/api/posts`
- Exports `app` for `server.ts` to consume
- **Connects to:** `server.ts`, `routes/postRoutes.ts`

#### `src/db.ts`
- **Role:** Shared MySQL connection pool
- Loads `.env` via `dotenv.config()`
- Creates and exports a `mysql2/promise` pool using env variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`)
- The pool is a singleton — imported wherever DB access is needed
- **Connects to:** `controllers/postController.ts`

#### `src/types/Post.ts`
- **Role:** TypeScript type definition
- Exports the `Post` interface:
  ```ts
  interface Post {
    id?: number       // optional (not present on creation)
    title: string
    content: string
    user_id?: number  // optional (not required in updates)
  }
  ```
- **Connects to:** Used by the controller for type safety

#### `src/routes/postRoutes.ts`
- **Role:** URL-to-handler mapping
- Creates an Express `Router` instance
- Defines five routes:

  | Method | Path  | Handler        |
  |--------|-------|----------------|
  | GET    | `/`   | `getPosts`     |
  | GET    | `/:id`| `getPostById`  |
  | POST   | `/`   | `createPost`   |
  | PUT    | `/:id`| `updatePost`   |
  | DELETE | `/:id`| `deletePost`   |

- Exports the router; `app.ts` mounts it at `/api/posts`
- **Connects to:** `app.ts`, `controllers/postController.ts`

#### `src/controllers/postController.ts`
- **Role:** All business + database logic
- Imports the `db` pool from `db.ts`
- Exports five async handler functions:
  - **`getPosts`** — Reads optional `?search=` query param; builds a `SELECT * FROM posts` query with optional `WHERE title LIKE ? OR content LIKE ?` clause; returns all matching rows as JSON
  - **`getPostById`** — Runs `SELECT * FROM posts WHERE id = ?`; returns the first row
  - **`createPost`** — Reads `{ title, content, user_id }` from `req.body`; runs `INSERT INTO posts`; returns `201 { message: "Post created" }`
  - **`updatePost`** — Reads `{ title, content }` from `req.body` and `:id` from URL; runs `UPDATE posts SET ... WHERE id = ?`
  - **`deletePost`** — Reads `:id` from URL; runs `DELETE FROM posts WHERE id = ?`
- **Connects to:** `db.ts`, `routes/postRoutes.ts`

---

### Frontend

#### `src/main.tsx`
- **Role:** React application bootstrap
- Calls `ReactDOM.createRoot()` targeting `#root` in `index.html`
- Wraps `<App />` in `<React.StrictMode>` and `<BrowserRouter>`
- `BrowserRouter` makes React Router hooks (`useNavigate`, `useParams`, etc.) available throughout the tree
- Imports global `index.css`
- **Connects to:** `App.tsx`, `index.html`

#### `src/App.tsx`
- **Role:** Root component — layout, navigation, routing, dark mode
- **Dark mode logic:**
  - On render, reads `localStorage.theme` or the OS preference (`prefers-color-scheme`)
  - `toggleDarkMode()` adds/removes the `dark` class on `<html>` and saves choice to `localStorage`
- Renders a persistent navbar with `<Link>` to `/` (Home) and `/create` (Create Post)
- Defines all client-side routes using `<Routes>` + `<Route>`
- **Connects to:** `pages/Home.tsx`, `pages/CreatePost.tsx`, `pages/EditPost.tsx`, `pages/PostDetail.tsx`

#### `src/api/posts.ts`
- **Role:** Centralised HTTP client layer
- `BASE_URL = 'http://127.0.0.1:5000/api/posts'`
- **`apiFetch<T>(url, options)`** — Generic helper; sets `Content-Type: application/json`, throws a typed `Error` on non-OK responses, returns parsed JSON
- Exports five functions consumed by page components:

  | Function        | Method | URL                        | Purpose                    |
  |-----------------|--------|----------------------------|----------------------------|
  | `fetchPosts`    | GET    | `/api/posts[?search=...]`  | Fetch all (with search)    |
  | `fetchPostById` | GET    | `/api/posts/:id`           | Fetch one post             |
  | `createPost`    | POST   | `/api/posts`               | Create a new post          |
  | `updatePost`    | PUT    | `/api/posts/:id`           | Update title & content     |
  | `deletePost`    | DELETE | `/api/posts/:id`           | Delete a post              |

- **Connects to:** `pages/Home.tsx`, `pages/CreatePost.tsx`, `pages/EditPost.tsx`, `pages/PostDetail.tsx`

#### `src/components/PostCard.tsx`
- **Role:** Display card for a single post in the list
- **Props:**
  - `post` — the post data object
  - `onDelete(id)` — callback fired when the user clicks "delete"
  - `onEdit(id)` — callback fired when the user clicks "edit"
- Renders: post title (as a `<Link>` to `/post/:id`), truncated content (`line-clamp-3`), author (`u/user_id`), date, and edit/delete buttons
- Styled with custom Tailwind dark/light tokens (e.g., `bg-light-card dark:bg-dark-card`)
- **Connects to:** `components/PostList.tsx`, `App.tsx` (routes)

#### `src/components/PostForm.tsx`
- **Role:** Reusable controlled form for creating and editing posts
- **Props:**
  - `initialData` — prefills title/content (defaults to empty strings)
  - `onSubmit(data)` — called with `{ title, content }` on valid submission
  - `disabled` — disables inputs and button while the API call is in progress
- Manages its own `title` and `content` state with `useState`
- `handleSubmit` validates non-empty fields before calling `onSubmit`
- Button label changes: `"Create Post"` (new) ↔ `"Update Post"` (editing) ↔ `"Saving..."` (loading)
- **Connects to:** `pages/CreatePost.tsx`, `pages/EditPost.tsx`

#### `src/components/PostList.tsx`
- **Role:** Renders a list of `PostCard` components
- **Props:** `posts[]`, `onDelete`, `onEdit` (all passed through from `Home`)
- Shows `"No posts found."` if the array is empty
- Maps `posts` → `<PostCard key={post.id} ...>` in a vertical flex column
- **Connects to:** `pages/Home.tsx`, `components/PostCard.tsx`

#### `src/pages/Home.tsx`
- **Role:** Main listing page — orchestrates search, loading, error, and delete
- **State:** `posts[]`, `search`, `loading`, `error`
- **`loadPosts()`** — calls `fetchPosts(search)`, updates state; run on mount and whenever `search` changes (via `useEffect`)
- **`handleDelete(id)`** — confirms with `window.confirm`, calls `deletePost(id)`, then refreshes the list
- **`handleEdit(id)`** — uses `useNavigate` to push `/edit/:id`
- Renders: search input → loading spinner → error banner → `<PostList>` (or "no posts" empty state)
- **Connects to:** `api/posts.ts`, `components/PostList.tsx`, `App.tsx`

#### `src/pages/CreatePost.tsx`
- **Role:** Page for writing and submitting a new post
- **State:** `disabled`, `error`, `success`
- `handleSubmit` appends `user_id: 1` to the form data (hardcoded; auth not yet implemented) and calls `createPost(payload)`
- On success: shows a green banner, then redirects to `/` after 1.5s via `setTimeout` + `useNavigate`
- On failure: shows a red error banner (with friendly message for foreign key violations)
- Renders `<PostForm>` with no `initialData` (blank form)
- **Connects to:** `api/posts.ts`, `components/PostForm.tsx`, `App.tsx`

#### `src/pages/EditPost.tsx`
- **Role:** Page for editing an existing post
- Extracts `:id` from the URL via `useParams`
- `useEffect` loads the post data via `fetchPostById(id)` on mount
- `handleSubmit` calls `updatePost(id, data)`, then navigates to `/` on success
- Renders `<PostForm initialData={post}>` so the form is pre-filled with existing content
- **Connects to:** `api/posts.ts`, `components/PostForm.tsx`, `App.tsx`

#### `src/pages/PostDetail.tsx`
- **Role:** Full read view of a single post
- Extracts `:id` via `useParams`, fetches via `fetchPostById(id)` in a `useEffect`
- Displays: large title, author + date, full content with `white-space: pre-wrap`
- Provides links to Edit this post (`/edit/:id`) and Back to Home (`/`)
- **Connects to:** `api/posts.ts`, `App.tsx`

#### `tailwind.config.js`
- **Role:** Tailwind configuration — extends the default theme with custom semantic color tokens
- `darkMode: 'class'` — dark mode is activated by adding the `dark` class to `<html>` (controlled by `App.tsx`)
- **Custom tokens:**

  | Token                   | Value       | Usage                         |
  |-------------------------|-------------|-------------------------------|
  | `dark-bg`               | `#0a0a0a`   | Page background in dark mode  |
  | `dark-card`             | `#111111`   | Card background in dark mode  |
  | `dark-border`           | `#222222`   | Borders in dark mode          |
  | `dark-text`             | `#e0e0e0`   | Primary text in dark mode     |
  | `dark-text-secondary`   | `#a0a0a0`   | Muted text in dark mode       |
  | `accent-green`          | `#00ff9d`   | Links & accents in dark mode  |
  | `accent-green-hover`    | `#00cc7a`   | Hover state in dark mode      |
  | `light-bg`              | `#f8f9fa`   | Page background in light mode |
  | `light-card`            | `#ffffff`   | Card background in light mode |
  | `light-border`          | `#dee2e6`   | Borders in light mode         |
  | `light-text`            | `#212529`   | Primary text in light mode    |
  | `light-text-secondary`  | `#6c757d`   | Muted text in light mode      |
  | `accent-blue`           | `#0061d5`   | Links & accents in light mode |
  | `accent-blue-hover`     | `#0050b0`   | Hover state in light mode     |

---

## API Reference

Base URL: `http://localhost:5000/api/posts`

| Method | Endpoint    | Body                              | Description                        |
|--------|-------------|-----------------------------------|------------------------------------|
| GET    | `/`         | —                                 | Get all posts                      |
| GET    | `/?search=` | —                                 | Search posts by title or content   |
| GET    | `/:id`      | —                                 | Get a single post by ID            |
| POST   | `/`         | `{ title, content, user_id }`     | Create a new post                  |
| PUT    | `/:id`      | `{ title, content }`              | Update a post                      |
| DELETE | `/:id`      | —                                 | Delete a post                      |

---

## Database Schema

Database name: `blog_db`

```sql
CREATE TABLE posts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(255)  NOT NULL,
  content    TEXT          NOT NULL,
  user_id    INT,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);
```

> **Note:** `user_id` references a `users` table (foreign key). Currently, `user_id = 1` is hardcoded in the frontend. Authentication and user management are planned for a future iteration.

## Core Architectural Q&A

### 1️⃣ System Entry Flow
**What exactly happens from the moment the user opens the blog app?**
- `index.html` loads the Vite module `main.tsx`.
- `main.tsx` mounts the `<App />` component inside a `<BrowserRouter>` (React Router) to the DOM's `div#root`.
- `App.tsx` reads theme preferences and sets up routing. For the root path `/`, it mounts the `<Home />` component.
- On initial render of `Home.tsx`, the `loading` state is true. The `useEffect` hook triggers `loadPosts()`.
- `loadPosts()` calls the `fetchPosts()` API wrapper, retrieving data from the backend, storing it in the `posts` state, and setting `loading` to false. 

### 2️⃣ Frontend Architecture & State Flow
**How is data managed and passed across components?**
- State is managed **top-down**. The main `posts[]` list is stored in the `Home.tsx` page component.
- The `Home` page passes the `posts` array down as a prop to the `<PostList />` component, which maps them into individual `<PostCard />` components.
- Callbacks like `onDelete` and `onEdit` are defined in `Home` and passed down precisely the same chain. When a user clicks a button inside `PostCard`, it invokes the callback, bubbling up context to `Home` to perform API calls and trigger re-renders.
- `useState` combined with `useEffect` in forms completely controls input reactivity and submission pipelines without needing an external state library.

### 3️⃣ API Layer Deep Dive
**How does the frontend communicate with the backend?**
- All backend communication is abstracted into `frontend/src/api/posts.ts`.
- The native browser `fetch` API is wrapped via a generic `apiFetch<T>()` function. This helper appends required headers (like `Content-Type: application/json`).
- Standard REST HTTP methods (GET, POST, PUT, DELETE) are used per endpoint.
- If an HTTP response is not `ok`, `apiFetch` attempts to parse a JSON error payload from the backend and throws a standard JavaScript `Error`, which the UI `try/catch` blocks intercept to populate `error` state banners.

### 4️⃣ Post Lifecycle (End-to-End Flow)
**What happens internally when a user creates, edits, or deletes a post?**
- **Create:** User visits `/create`, filling out the `<PostForm />` inputs. On submit, form field validation runs, and `<CreatePost />` invokes `createPost()`. The API sends a JSON `POST` request. The DB `INSERT`s the record. On a `201` response, `navigate('/')` redirects back to Home.
- **Edit:** User visits `/edit/:id`. `EditPost` extracts the ID and calls `fetchPostById(id)`, passing the result to `<PostForm>` as `initialData`. On save, `updatePost()` sends a `PUT` request. DB performs `UPDATE`. The user is redirected to Home.
- **Delete:** `Home`'s `handleDelete(id)` triggers a `window.confirm`. It calls `deletePost(id)` via API (`DELETE` request). The DB deletes the row, and the `loadPosts()` callback refetches the list from scratch to update the UI.

### 5️⃣ Backend Architecture & Routing
**How is the backend structured and how do requests flow?**
- **Flow:** Client → `app.ts` → `postRoutes.ts` → `postController.ts` → `db.ts`
- `server.ts` is strictly the entry point that binds the Express app to a port.
- `app.ts` configures global middleware (CORS, JSON parsing) and mounts specific route files (like `/api/posts`).
- `postRoutes.ts` defines URL-to-handler mappings utilizing an Express Router.
- `postController.ts` houses business logic containing async functions connecting to the database using SQL.

### 6️⃣ Database Interaction & Query Design
**How does the backend interact with MySQL?**
- Uses `mysql2/promise` to create a globally available **Connection Pool** in `db.ts`. Pooling is drastically more efficient as it constantly reuses established database connections rather than opening and closing heavy connections per request.
- **Parameterized Queries:** All SQL queries use placeholders (`?`) preventing SQL Injection. 
- **Search (LIKE):** Generates queries like `title LIKE ? OR content LIKE ?` utilizing `%search%` parameters to locate substrings securely.

### 7️⃣ Search & Filtering Logic
**How does search actually work internally?**
- Search starts at `Home.tsx` where an input binds to the `search` string state.
- `useEffect` watches the `search` dependency and refetches `fetchPosts(search)` (appending `?search=term`) on keystrokes.
- Backend `postController.ts` retrieves `req.query.search`. If it exists, SQL strings are dynamically concatenated with `WHERE ... LIKE ?` and parameters are pushed into the query `values` array.
- Both `title` and `content` are checked using `OR`. If search is empty, the `WHERE` clause is skipped, returning all records.

### 8️⃣ Error Handling & Edge Cases
**What happens when something goes wrong?**
- **API Failure:** Handled by frontend `try/catch`. The generic `apiFetch` parses the response and UI handlers load error strings to be displayed inside red UI banners.
- **DB Failure:** Caught asynchronously on the backend server logs. Currently, standard errors bubble to Express which handles unhandled promise rejections or returns 500 status.
- **Missing Resource:** Attempting to manipulate a missing post ID often does nothing on the UI, missing specific 404 handlers. 

### 9️⃣ Performance & Limitations
**Where does the system start breaking or slowing down?**
- **Missing Pagination:** Fetching all posts every time heavily stresses the database and network payload when data scales significantly.
- **No Debouncing:** The `useEffect` search runs exactly on every keystroke, meaning continuous typing rapidly fires concurrent redundant API queries.
- **List Over-fetching:** Re-rendering the full UI lists on minor edits and full DB array retrievals upon deletes guarantees unnecessary load.

### 🔟 Design Decisions & Trade-offs
**Why were these choices made?**
- **Why React + TypeScript:** Emphasizes absolute type safety and powerful component reusability. 
- **Why REST:** Highly intuitive mapping structure to standard CRUD API patterns, where GraphQL query overhead is entirely unnecessary for a flat resource mapping.
- **Why Fetch API:** Browsers natively support Fetch API, stripping dependence on dense libraries like Axios.
- **No Auth Yet:** Rapid prototyping iteration. `user_id` is mocked out for later inclusion without blocking MVP post development.
- **Prop Drilling (No Redux):** Component architecture is extremely shallow (Home -> PostList -> PostCard), avoiding over-engineering states using Redux or Context API.

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MySQL 8 running locally with a `blog_db` database and a `posts` table (see schema above)

### 1. Backend

```bash
cd backend
npm install
# Copy and fill in your credentials
cp .env.example .env
npm run dev        # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:5173
```

### Available Scripts

| Location | Command         | Description                             |
|----------|-----------------|-----------------------------------------|
| backend  | `npm run dev`   | Start backend with hot reload           |
| backend  | `npm run build` | Compile TypeScript to `dist/`           |
| backend  | `npm start`     | Run compiled JS (`node dist/server.js`) |
| frontend | `npm run dev`   | Start Vite dev server                   |
| frontend | `npm run build` | Type-check + bundle for production      |
| frontend | `npm run lint`  | Run ESLint                              |
| frontend | `npm run preview` | Preview production build              |

---

## ⚡ Structure V2 (Supabase Migration Update)

**The project was entirely refactored from a standalone Express + MySQL backend to a Backend-as-a-Service (BaaS) utilizing Supabase.**

### Overview of Changes
- **Express Backend Removed:** The custom Node.js Express server (`backend/`) was completely deleted.
- **Supabase Integration:** The application now communicates directly with Supabase via the `@supabase/supabase-js` client SDK on the frontend (`frontend/src/api/posts.ts`).
- **PostgreSQL Database:** MySQL was swapped for Supabase's hosted PostgreSQL. The schema leverages UUIDs and triggers to synchronize user profiles alongside post entries.
- **Supabase Auth:** Users log in and register directly with Supabase's Auth suite. React context securely stores the current session and protects internal routes (`/create`, `/edit`).
- **Row Level Security (RLS):** Policies defined on the database tables ensure that edits/deletes are strictly locked to the authenticated user that created the entry (`auth.uid() = author_id`). Non-owners hold public `SELECT` read-access only.
- **Improved UX Metrics:** Added API request debounce delays for robust local search and pagination to optimize data queries directly atop Supabase `.range()` mechanisms.
