# SafelyRest — Backend

[![CI/CD](https://github.com/Piyussh-22/SafelyRest-Backend/actions/workflows/deploy.yml/badge.svg)](https://github.com/Piyussh-22/SafelyRest-Backend/actions/workflows/deploy.yml)

A production-grade REST API for a property booking platform built with Node.js, Express, and MongoDB. Supports three user roles — guest, host, and admin — with a full booking lifecycle, Cloudinary image uploads, Google OAuth, and JWT authentication.

**Live App:** [https://safely-rest-frontend.vercel.app](https://safely-rest-frontend.vercel.app)
**Frontend Repo:** [https://github.com/Piyussh-22/SafelyRest-Frontend](https://github.com/Piyussh-22/SafelyRest-Frontend)

---

## Tech Stack

| Layer            | Technology                               |
| ---------------- | ---------------------------------------- |
| Language         | TypeScript                               |
| Runtime          | Node.js (ESM modules)                    |
| Framework        | Express v5                               |
| Database         | MongoDB via Mongoose v8                  |
| Authentication   | JWT + Google OAuth (google-auth-library) |
| File Upload      | Multer + Cloudinary                      |
| Validation       | express-validator                        |
| Password Hashing | bcryptjs                                 |
| Testing          | Jest + Supertest + MongoDB Memory Server |
| Containerization | Docker + Docker Compose                  |
| CI/CD            | GitHub Actions → Render                  |

---

## Architecture

The codebase follows a strict three-layer architecture:

```
Routes → Controllers → Services
```

- **Routes** — define endpoints and attach middleware
- **Controllers** — handle HTTP only (parse request, call service, send response)
- **Services** — contain all business logic and database operations

Error handling uses a custom `AppError` class. Throwing `new AppError("message", statusCode)` anywhere in the service layer is automatically caught by the global `errorHandler` middleware.

---

## Project Structure

```
safely-rest-backend/
├── app.ts
├── Dockerfile
├── dockerignore
├── package.json
└── src/
    ├── config/
    │   └── cloudinary.config.ts
    ├── constants/
    │   ├── httpStatus.ts
    │   ├── messages.ts
    │   └── roles.ts
    ├── controllers/
    │   ├── admin.controller.ts
    │   ├── auth.controller.ts
    │   ├── booking.controller.ts
    │   ├── host.controller.ts
    │   └── store.controller.ts
    ├── middlewares/
    │   ├── auth.ts
    │   ├── errorHandler.ts
    │   └── upload.ts
    ├── models/
    │   ├── booking.ts
    │   ├── favourite.ts
    │   ├── house.ts
    │   └── user.ts
    ├── routes/
    │   ├── admin.routes.ts
    │   ├── auth.routes.ts
    │   ├── booking.routes.ts
    │   ├── host.routes.ts
    │   └── store.routes.ts
    ├── services/
    │   ├── admin.service.ts
    │   ├── booking.service.ts
    │   ├── host.service.ts
    │   └── store.service.ts
    └── validations/
        ├── auth.validation.ts
        ├── booking.validation.ts
        └── host.validation.ts
```

---

## CI/CD Pipeline

Every push to `main` triggers the following pipeline:

```
Install dependencies → Run 31 tests → Docker build validation → Deploy to Render
```

If any step fails, deployment is blocked. All secrets are managed via GitHub Actions Secrets. Render auto-deploy is disabled — deployments are triggered exclusively via webhook from GitHub Actions.

---

## Testing

```bash
npm test
```

**31 tests across 5 suites:**

| Suite    | Coverage                                                        |
| -------- | --------------------------------------------------------------- |
| auth     | signup, duplicate email, login, logout                          |
| store    | list houses, house details, 404, availability, favourites       |
| host     | auth checks, role checks, house creation and deletion           |
| admin    | auth checks, role checks, stats, bookings, delete house         |
| bookings | auth checks, role checks, guest bookings, host bookings, cancel |

Tests use MongoDB Memory Server for full isolation — no real database is touched.

---

## Environment Variables

```env
MONGODB_URI=
PORT=4000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

JWT_SECRET=
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Running Locally

```bash
# Clone the repo
git clone https://github.com/Piyussh-22/SafelyRest-Backend.git
cd SafelyRest-Backend

# Install dependencies
npm install

# Add environment variables
cp .env.example .env

# Start development server
npm run dev
```

Or with Docker:

```bash
docker-compose up
```

---

## Data Models

### User

| Field     | Type   | Notes                  |
| --------- | ------ | ---------------------- |
| firstName | String |                        |
| email     | String | unique, required       |
| password  | String | select: false          |
| googleId  | String | sparse unique          |
| userType  | Enum   | guest \| host \| admin |

### House

| Field       | Type     | Notes                                                            |
| ----------- | -------- | ---------------------------------------------------------------- |
| name        | String   | required                                                         |
| price       | Number   | 400–1000 per night                                               |
| location    | String   | required                                                         |
| description | String   | min 20 chars                                                     |
| photos      | String[] | 1–2 Cloudinary URLs                                              |
| amenities   | Enum[]   | wifi \| parking \| ac \| heating \| kitchen \| tv \| pool \| gym |
| isAvailable | Boolean  | default: true                                                    |
| owner       | ObjectId | ref: User                                                        |

### Booking

| Field      | Type     | Notes                                         |
| ---------- | -------- | --------------------------------------------- |
| guest      | ObjectId | ref: User                                     |
| house      | ObjectId | ref: House                                    |
| checkIn    | Date     |                                               |
| checkOut   | Date     |                                               |
| guests     | Number   | 1–10                                          |
| totalPrice | Number   | auto-calculated                               |
| status     | Enum     | pending \| confirmed \| rejected \| cancelled |
| message    | String   | optional, max 500 chars                       |

---

## API Reference

Base URL: `/api`

### Auth — `/api/auth`

| Method | Endpoint      | Auth   | Description                   |
| ------ | ------------- | ------ | ----------------------------- |
| POST   | /signup       | Public | Register as guest or host     |
| POST   | /login        | Public | Login with email and password |
| POST   | /logout       | Public | Logout                        |
| POST   | /google-login | Public | Login via Google OAuth        |

### Store — `/api/store`

| Method | Endpoint                 | Auth       | Description                  |
| ------ | ------------------------ | ---------- | ---------------------------- |
| GET    | /houses                  | Public     | List all available houses    |
| GET    | /houses/:id              | Public     | Get house details            |
| GET    | /houses/:id/availability | Public     | Check availability for dates |
| GET    | /favourites              | Guest/Host | Get saved favourites         |
| POST   | /favourites              | Guest/Host | Toggle favourite             |

### Host — `/api/host`

| Method | Endpoint    | Description        |
| ------ | ----------- | ------------------ |
| GET    | /houses     | Get own listings   |
| POST   | /houses     | Add new listing    |
| DELETE | /houses/:id | Delete own listing |

### Bookings — `/api/bookings`

| Method | Endpoint    | Auth  | Description                 |
| ------ | ----------- | ----- | --------------------------- |
| POST   | /           | Guest | Create booking request      |
| GET    | /my         | Guest | Get own bookings            |
| PATCH  | /:id/cancel | Guest | Cancel a pending booking    |
| GET    | /host       | Host  | Get bookings for own houses |
| PATCH  | /:id/status | Host  | Confirm or reject a booking |

### Admin — `/api/admin`

| Method | Endpoint    | Description                  |
| ------ | ----------- | ---------------------------- |
| GET    | /stats      | Platform stats               |
| GET    | /bookings   | All bookings with pagination |
| DELETE | /houses/:id | Delete any house             |

---

## Key Business Rules

- House price must be between ₹400 and ₹1000 per night
- House photos: minimum 1, maximum 2, max 2MB each
- Check-in: minimum today, maximum 1 month from today (IST)
- Maximum stay: 10 nights
- Only pending bookings can be cancelled or updated
- Confirming a booking auto-rejects all other pending requests for overlapping dates
- Host contact is only revealed to guest after booking is confirmed
- Deleting a house removes it from all users' favourites automatically
- Pending bookings with a past check-in date are lazily auto-cancelled on next request

---

## Admin Setup

Admin is a real database user with `userType: "admin"`. To seed:

```bash
node seed-admin.js
```

---

## Author

**Piyush Raj** — Full Stack Developer
[GitHub](https://github.com/Piyussh-22) · [LinkedIn](https://linkedin.com/in/piyush-raj-tech)

---

## License

MIT
