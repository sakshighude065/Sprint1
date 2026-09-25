# SkillSwap (MERN)

A full MERN rebuild of the SkillSwap corkboard prototype — same design, same pages,
now backed by a real Node/Express/MongoDB API instead of hardcoded demo data.

## Stack
- **Frontend:** React 18 + Vite, React Router, Axios, Socket.io client — using the exact
  corkboard/pinned-card CSS from the static prototype (`src/index.css`)
- **Backend:** Node.js, Express, MongoDB/Mongoose, Socket.io, JWT + bcrypt

## Project structure
```
skillswap-mern/
  backend/    Express API + Socket.io chat server
  frontend/   React + Vite client
```

## Getting started

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
```
Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/skillswap
JWT_SECRET=replace_this_with_a_long_random_string
CLIENT_URL=http://localhost:5173
```
Then:
```bash
npm run dev
```
Requires a running MongoDB (local `mongod`, or MongoDB Atlas — see the Atlas note below).

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Opens on `http://localhost:5173`.

## How the pieces map to the site you already saw

| Page | Route | Backed by |
|---|---|---|
| Home | `/` | `GET /api/users` (public, searchable board) |
| About / Contact | `/about`, `/contact` | static content, no API |
| Login / Sign up | `/login`, `/signup` | `POST /api/auth/login` \| `/register` |
| Matches | `/matches` | `GET /api/matches` (mutual-match scoring) |
| Profile (view) | `/profile/:id` | `GET /api/users/:id`, `POST /api/swaps` |
| Profile (edit) | `/profile-edit` | `PUT /api/users/me` — also the onboarding page when `?onboarding=1` |
| Swap requests | `/swap-requests` | `GET/PUT /api/swaps` |
| Chat | `/chat/:swapId` | Socket.io, room `swap:<id>`, history via `GET /api/messages/:swapId` |

## Notable backend behavior
- **Sign up without adding skills** → `needsOnboarding: true` in the response, and the
  frontend routes to `/profile-edit?onboarding=1` instead of straight to the board.
- **Pin-to-board toggle** → stored as `isPinned` on the user; unpinned users are excluded
  from the public board (`/api/users`) and from other people's matches, but can still see
  their own profile and use the app normally.
- **Mutual matches** → `/api/matches` flags a match `mutual` when they teach something you
  want to learn *and* want to learn something you teach; these sort first and get the
  "✦ Mutual match" badge.
- **Streak badges** → `swapsCompleted` increments automatically the first time a swap is
  marked `completed`; the frontend only shows the 🏅 badge at 10+.
- **Category filter pills** → computed server-side from a skill→category map on the User
  model (`code`, `music`, `language`, `media`, `games`) so the frontend doesn't duplicate
  that logic.
- **Chat** → scoped per swap request (not a generic DM), matching the "Open chat" button
  living on an accepted/completed swap. Socket.io authenticates the handshake with the
  same JWT used for REST calls.

## MongoDB Atlas connection tip
If `mongodb+srv://` fails locally with `querySrv ECONNREFUSED` (some networks block the
DNS SRV lookup Atlas's connection string needs), switch to Atlas's **direct (non-SRV)
connection string** instead:
1. In Atlas → Connect → Drivers, note the three `xxx-shard-00-0{0,1,2}` hostnames from a
   `nslookup -type=SRV _mongodb._tcp.<cluster>.mongodb.net`.
2. Get the replica set name from `nslookup -type=TXT <cluster>.mongodb.net`.
3. Build: `mongodb://user:pass@host0:27017,host1:27017,host2:27017/skillswap?ssl=true&replicaSet=<name>&authSource=admin&retryWrites=true&w=majority`

## Next steps / production notes
- Add request validation (`zod`/`joi`) beyond the current basic checks.
- Add pagination to `/api/matches` and `/api/users` for larger user bases.
- Rate-limit the auth routes (`express-rate-limit`).
- Real skill taxonomy with autocomplete instead of free-text tags, to avoid near-duplicates
  like "js" vs "javascript" breaking matches.
- Drop real photos into `frontend/public/images/` (`hero-bg.jpg`, `hero-left.jpg`,
  `hero-right.jpg`) — the CSS already layers them over the gradient fallback.
