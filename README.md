# TaskManager — Full-Stack Assessment

A full-stack Task Management System built with **Laravel**, **Next.js**, and **React Native**.

---

## Tech Stack

| Layer    | Technology                                          |
|----------|-----------------------------------------------------|
| Backend  | Laravel 13, SQLite (local), Repository/Service pattern |
| Frontend | Next.js 14 (App Router), TanStack Query, Zod        |
| Mobile   | React Native + Expo, TypeScript, AsyncStorage        |
| DevOps   | Docker Compose                                       |

---

## Setup Instructions

### Prerequisites
- PHP 8.5+, Composer
- Node.js 20+
- SQLite (bundled with PHP — no install needed)
- Expo Go app on your mobile device (iOS or Android)

---

### Backend (Laravel)

```bash
cd backend

# Install dependencies
composer install

# Configure environment
cp .env.example .env

# Edit .env and make sure DB is set to SQLite:
# DB_CONNECTION=sqlite
# (comment out DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD)

# Add this line for CORS:
# FRONTEND_URL=http://localhost:3000

# Generate app key
php artisan key:generate

# Register the API routes (Laravel 11+ requirement)
php artisan install:api

# Add this line to bootstrap/app.php inside withRouting():
# api: __DIR__.'/../routes/api.php',

# Create the SQLite database file
New-Item -Path "database\database.sqlite" -ItemType File   # Windows
# or: touch database/database.sqlite                       # Mac/Linux

# Run migrations + seed
php artisan migrate --seed

# Start dev server
php artisan serve
# → http://127.0.0.1:8000

# To allow mobile devices on the same network to connect:
php artisan serve --host=0.0.0.0 --port=8000
```

**Run tests:**
```bash
php artisan test
```

---

### Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Set: NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api

# Start dev server
npm run dev
# → http://localhost:3000
```

---

### Mobile (React Native + Expo)

```bash
cd mobile

# Install dependencies
npm install

# Find your PC's local IP (must be on same WiFi as your phone)
ipconfig   # Windows — look for IPv4 Address under Wi-Fi

# Update src/api/tasks.ts:
# const API_URL = 'http://<your-ip>:8000/api';

# Start Expo
npx expo start

# Scan the QR code with Expo Go (iOS/Android)
```

> **Important:** Your phone and PC must be on the same WiFi network. Use `php artisan serve --host=0.0.0.0` so Laravel is reachable from the phone.

---

### Docker (Full Stack)

```bash
# From project root
docker-compose up --build

# In a new terminal, run migrations inside the container
docker exec taskmanager_backend php artisan migrate --seed
```

Services:
- Backend → http://localhost:8000
- Frontend → http://localhost:3000
- MySQL → localhost:3306

---

## API Reference

| Method | Endpoint         | Description              |
|--------|------------------|--------------------------|
| GET    | /api/tasks       | List tasks (filterable)  |
| POST   | /api/tasks       | Create a task            |
| GET    | /api/tasks/{id}  | Get single task          |
| PUT    | /api/tasks/{id}  | Update task              |
| DELETE | /api/tasks/{id}  | Delete task              |

**Query parameters for GET /api/tasks:**
- `status` — `pending` or `completed`
- `priority` — `low`, `medium`, or `high`
- `search` — search by title or description
- `page` — page number
- `per_page` — items per page (5–100, default 15)

**Examples:**
```
GET /api/tasks?status=pending
GET /api/tasks?priority=high&page=1&per_page=10
GET /api/tasks?search=fix+bug
```

---

## Assumptions Made

1. **No authentication** — the brief didn't mention it; adding auth would be straightforward via Laravel Sanctum.
2. **SQLite for local development** — used instead of MySQL for simplicity. Switching to MySQL is a one-line `.env` change (`DB_CONNECTION=mysql`) with credentials filled in.
3. **Soft deletes not required** — tasks are hard-deleted per the spec.
4. **Duplicate prevention** is scoped to exact title match within 10 seconds (case-sensitive).
5. **Mobile is read + toggle + delete only** — no create screen on mobile; task creation is handled via the web frontend.
6. **Expo Go used for mobile demo** — a production APK/IPA build would use Expo EAS.
7. **`bootstrap/app.php` requires manual edit** — Laravel 11+ does not load `routes/api.php` by default; the `api:` key must be added to `withRouting()`.

---

## Libraries Used

### Backend
- `laravel/framework` — core framework
- `laravel/sanctum` — installed via `php artisan install:api` (used for API route registration)
- `mockery/mockery` — mocking in unit tests

### Frontend
- `@tanstack/react-query` — server state management & caching
- `react-hook-form` — form management
- `zod` — schema validation
- `@hookform/resolvers` — react-hook-form ↔ Zod bridge
- `sonner` — toast notifications
- `tailwindcss` — utility-first CSS
- `shadcn/ui` — accessible UI components

### Mobile
- `expo` / `expo-router` — app framework and navigation
- `@react-native-async-storage/async-storage` — offline cache
- `react-native-safe-area-context` — safe area handling
- `react-native-screens` — native screen management

---

## Architecture Decisions

### Backend — Repository/Service Pattern
- **Repository** (`TaskRepository`) owns all database queries, making the data layer easy to swap or mock in tests.
- **Service** (`TaskService`) holds business rules — duplicate title check within 10 seconds, 404 handling.
- **Controller** is thin — validates input via Form Requests, calls the service, returns an API Resource.
- **API Resources** (`TaskResource`) ensure a consistent JSON shape regardless of model changes.

### Frontend — TanStack Query
- Queries are keyed by filters so each unique filter combination is cached separately.
- Mutations automatically invalidate the `tasks` query key to trigger a refetch.
- API validation errors from Laravel are mapped back to react-hook-form fields so inline errors appear correctly under each input.

### Mobile — Optimistic Updates + Offline Cache
- Toggle and delete apply changes immediately to local state and revert on API failure.
- `AsyncStorage` caches the last successful API response per URL with a 5-minute TTL.
- On network failure the app displays stale cached data with an offline banner rather than an empty screen.

---

## What I Would Improve With More Time

1. **Authentication** — Laravel Sanctum for token-based auth, protected routes in Next.js, secure token storage in React Native.
2. **Real-time updates** — Laravel Echo + Pusher so task changes sync across devices instantly.
3. **Optimistic updates on web** — TanStack Query supports optimistic mutations for snappier UI feedback.
4. **Create/Edit on mobile** — a bottom sheet form for creating and editing tasks without leaving the list screen.
5. **E2E tests** — Playwright for web, Detox for mobile.
6. **CI/CD pipeline** — GitHub Actions running `php artisan test` and `npm run build` on every PR.
7. **Rate limiting** — `throttle` middleware on `POST /api/tasks` as an extra guard against spam.
8. **Soft deletes** — keep task history recoverable via `SoftDeletes` trait.
9. **Better offline queue** — queue mutations made while offline and replay them when connectivity is restored.
10. **Accessibility** — ARIA labels throughout the web UI, `accessibilityRole` and `accessibilityLabel` throughout React Native components.