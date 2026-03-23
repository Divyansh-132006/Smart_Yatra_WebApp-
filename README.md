# Smart Yatra (Smart_Yatra_WebApp-)

A **tourist safety & assistance platform** with:
- **Mobile app (Expo / React Native)** for tourists, guides, and officials
- **Backend API (Node.js / Express)** with **MongoDB (Mongoose)** for authentication, profiles, alerts, OTP flows, etc.

> Repo: `Divyansh-132006/Smart_Yatra_WebApp-`

---

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Backend (API)](#backend-api)
  - [API Base URL](#api-base-url)
  - [Routes (Current)](#routes-current)
  - [Database](#database)
  - [Environment Variables](#environment-variables)
  - [Run Backend Locally](#run-backend-locally)
- [Frontend (Mobile App)](#frontend-mobile-app)
  - [Run App Locally](#run-app-locally)
- [Security Notes](#security-notes)
- [Roadmap / Improvements](#roadmap--improvements)
- [Contributing](#contributing)
- [License](#license)

---

## Overview
**Smart Yatra** is designed to improve tourist safety by combining:
- Secure authentication (JWT)
- OTP verification (SMS)
- User profile management
- Location-based safety support (maps, geofence-style zones, nearby emergency points)
- “Tips” and issue flagging UI modules (currently frontend-driven / simulated in places)

---

## Key Features
### Mobile App (Expo / React Native)
- Authentication flow with an **Auth Stack** and a **Main Screen** after login
- Location access via `expo-location`
- Map and safety UI experience (WebView map HTML + safety points)
- Tourist “Tips” UI module (currently uses sample tips data)
- “Flag an Issue” UI module with image picker + location capture

### Backend (Node / Express)
- Express API server with MongoDB connection
- Tourist auth + OTP-based registration flow
- Tourist profile endpoints (get/update)

---

## Tech Stack

### Frontend
- **Expo** (`expo ~54`)
- **React Native** (`react-native 0.81.x`)
- **React Navigation** (native stack + bottom tabs)
- **Maps / Location**: `expo-location`, `react-native-maps` (plus a WebView-based map renderer in places)
- **UI**: `expo-linear-gradient`, Lottie, vector icons

### Backend
- **Node.js** (ESM modules)
- **Express**
- **MongoDB + Mongoose**
- **Auth**: JWT (`jsonwebtoken`)
- **Security**: password hashing with `bcrypt`
- **HTTP client**: `axios`
- **OTP storage**: MongoDB collection with TTL index (auto-expire OTP docs)

---

## Architecture

### High-level diagram
```txt
+--------------------------+           +------------------------------+
|   Expo Mobile App        |  HTTPS     |   Node.js / Express API      |
|  (React Native)          +----------->|   /api/...                   |
|                          |           |                              |
| - Auth UI + Navigation   |           | - Auth + OTP flows           |
| - Location / Maps        |           | - Tourist profile APIs        |
| - Tips / Flag modules    |           | - MongoDB persistence         |
+------------+-------------+           +---------------+--------------+
             |                                             |
             |                                             |
             |                                   +---------v---------+
             |                                   |     MongoDB       |
             |                                   | (smart_yatra_db)  |
             |                                   +-------------------+
             |
             | SMS gateway calls (server-side)
             v
      TextBee SMS API
```

### Backend layering (as implemented)
```txt
src/
  config/        -> db.js, jwt.js
  models/        -> Mongoose schemas (Tourist, OTP, Alert, ...)
  controllers/   -> request handlers (Authcontroller, Touristcontroller)
  routes/        -> express routers (Tourist_route.js)
  utils/         -> response formatter utilities
  app.js         -> express app setup + routes mount
  server.js      -> listen()
```

### Frontend layering (as implemented)
```txt
App.js
src/
  context/        -> AuthContext
  navigation/     -> AuthStack etc.
  screens/
    auth/         -> Intro screens
    authlogin/    -> Login screen(s)
    authSignup/   -> Signup screens
    dutyselector/ -> user type selection
    main/         -> MainScreen (tabs + map/safety)
    profile/      -> Tips, FlagSection, ProfileSection, etc.
  data/           -> geofence zones JSON (Greater Noida)
```

---

## Project Structure
```txt
.
├── backend/
│   └── smartyatra_backend/
│       ├── package.json
│       └── src/
│           ├── app.js
│           ├── server.js
│           ├── config/
│           ├── controllers/
│           ├── models/
│           ├── routes/
│           └── utils/
└── frontend/
    └── Smart_Yatra/
        ├── App.js
        ├── index.js
        ├── package.json
        ├── app.json
        └── src/
            ├── context/
            ├── navigation/
            ├── screens/
            └── data/
```

---

## Backend (API)

### API Base URL
By default, the server listens on:
- `http://localhost:5000`

Root health check:
- `GET /` → `API is running...`

### Routes (Current)
Mounted in backend `src/app.js`:
- Base: `/api/tourists`

Currently defined routes (from `src/routes/Tourist_route.js`):
- `POST /api/tourists/register` — register tourist
- `POST /api/tourists/register-teamlead` — register team lead
- `POST /api/tourists/register-authority` — register authority
- `POST /api/tourists/login` — login tourist
- `POST /api/tourists/sendRegistrationOTP` — send OTP (registration)
- `POST /api/tourists/verifyOTP` — verify OTP
- `POST /api/tourists/auth/login` — login (duplicate path)
- `POST /api/tourists/auth/refresh` — refresh token
- `GET  /api/tourists/profile/:id` — get tourist profile (password excluded)
- `GET  /api/tourists/location` — get location (note: controller expects `:id` but route currently doesn’t include it)
- `PUT  /api/tourists/location` — update location (note: controller expects `:id` but route currently doesn’t include it)
- `PUT  /api/tourists/name` — update name (note: controller expects `:id` but route currently doesn’t include it)
- `PUT  /api/tourists/profile/update/:id` — update profile fields

> Note: Some route params and controller expectations look mismatched (ex: `getLocation` uses `req.params.id` but route is `/location` without `:id`). You may want to normalize these endpoints.

### Database
Backend uses MongoDB with Mongoose.
- Database name in code: `smart_yatra_db`
- Connection: `${MONGODB_URI}/smart_yatra_db`

### Environment Variables
Create a `.env` in `backend/smartyatra_backend` (example keys based on code):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# TextBee SMS Gateway
TEXTBEE_API_KEY=your_textbee_key
TEXTBEE_DEVICE_ID=your_device_id
```

### Run Backend Locally
```bash
cd backend/smartyatra_backend
npm install
npm run dev
```

---

## Frontend (Mobile App)

### Run App Locally
```bash
cd frontend/Smart_Yatra
npm install
npm start
```

Then run:
- `a` for Android emulator
- or scan QR with Expo Go (if supported by your Expo SDK workflow)

> App entry:
- `index.js` registers `App.js` using Expo `registerRootComponent`.

---

## Security Notes
- Store secrets in `.env` (do not commit them).
- Use strong `JWT_SECRET` in production.
- OTPs are stored hashed; OTP docs auto-expire via a TTL index.

---

## Roadmap / Improvements
- Fix route param mismatches for location/name endpoints (`/location/:id`, `/name/:id`, etc.)
- Add request validation (e.g., Zod/Joi) + centralized error middleware
- Add role-based authorization (tourist/guide/authority) middleware
- Add proper API documentation (OpenAPI/Swagger)
- Add `.env.example` files for backend and frontend
- Add CI (lint/test) and formatting (ESLint/Prettier)

---

## Contributing
1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Open a PR

---

## License
Add your preferred license (MIT/Apache-2.0/etc.) in a `LICENSE` file.
