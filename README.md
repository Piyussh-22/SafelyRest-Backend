# SafelyRest — Backend

A hotel/house booking REST API built with Node.js, Express, and MongoDB. Supports three user roles (guest, host, admin) with full booking lifecycle, Cloudinary image uploads, Google OAuth, and JWT authentication.

---

## Tech Stack

| Layer            | Technology                               |
| ---------------- | ---------------------------------------- |
| Runtime          | Node.js (ESM modules)                    |
| Framework        | Express v5                               |
| Database         | MongoDB via Mongoose v8                  |
| Authentication   | JWT + Google OAuth (google-auth-library) |
| File Upload      | Multer + Cloudinary                      |
| Validation       | express-validator                        |
| Password Hashing | bcryptjs                                 |

---

## Project Structure

```
safely-rest-backend/
├── app.js
├── .env
├── package.json
└── src/
    ├── config/
    │   └── cloudinary.config.js
    ├── constants/
    │   ├── httpStatus.js
    │   ├── messages.js
    │   └── roles.js
    ├── controllers/
    │   ├── admin.controller.js
    │   ├── auth.controller.js
    │   ├── booking.controller.js
    │   ├── host.controller.js
    │   └── store.controller.js
    ├── middlewares/
    │   ├── auth.js
    │   ├── errorHandler.js
    │   └── upload.js
    ├── models/
    │   ├── booking.js
    │   ├── favourite.js
    │   ├── house.js
    │   └── user.js
    ├── routes/
    │   ├── admin.routes.js
    │   ├── auth.routes.js
    │   ├── booking.routes.js
    │   ├── host.routes.js
    │   └── store.routes.js
    ├── services/
    │   ├── admin.service.js
    │   ├── booking.service.js
    │   ├── host.service.js
    │   └── store.service.js
    └── validations/
        ├── auth.validation.js
        ├── booking.validation.js
        └── host.validation.js
```

---

## Architecture

The codebase follows a three-layer architecture:

- **Routes** — define endpoints and attach middleware
- **Controllers** — handle HTTP only (parse request, call service, send response)
- **Services** — contain all business logic and database operations

Error handling uses a custom `AppError` class. Throwing `new AppError("message", statusCode)` anywhere in the service layer is caught by the global `errorHandler` middleware in `app.js`.

---

## Environment Variables

```env
MONGODB_URI=
PORT=4000
FRONTEND_URL=http://localhost:5173

JWT_SECRET=
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin@gmail.com
```

---

## Data Models

### User

```
firstName       String
email           String (unique, required)
password        String (select: false)
googleId        String (sparse unique)
userType        enum: guest | host | admin (default: guest)
```

### House

```
name            String (required)
price           Number (min: 400, max: 1000 per day)
location        String (required)
description     String (required, min 20 chars)
photos          [String] (1-2 Cloudinary URLs)
amenities       [String] enum: wifi | parking | ac | heating | kitchen | tv | pool | gym
isAvailable     Boolean (default: true)
owner           ObjectId -> User
```

### Booking

```
guest           ObjectId -> User
house           ObjectId -> House
checkIn         Date
checkOut        Date
guests          Number (1-10)
totalPrice      Number (auto-calculated: nights × house.price)
status          enum: pending | confirmed | rejected | cancelled (default: pending)
message         String (optional, max 500 chars)
```

### Favourite

```
userId          ObjectId -> User
houseId         ObjectId -> House
savedAt         Date
```

Compound unique index on `{ userId, houseId }` prevents duplicate favourites.

---

## API Reference

Base URL: `/api`

### Auth — `/api/auth`

| Method | Endpoint        | Auth   | Description                                   |
| ------ | --------------- | ------ | --------------------------------------------- |
| POST   | `/signup`       | Public | Register new user (guest or host)             |
| POST   | `/login`        | Public | Login with email and password                 |
| POST   | `/logout`       | Public | Client-side logout (clears token on frontend) |
| POST   | `/google-login` | Public | Login or register via Google OAuth            |

**Signup body:**

```json
{
  "firstName": "Rahul",
  "email": "rahul@test.com",
  "password": "rahul123",
  "confirmPassword": "rahul123",
  "userType": "guest"
}
```

**Login body:**

```json
{
  "email": "rahul@test.com",
  "password": "rahul123"
}
```

**Google login body:**

```json
{
  "idToken": "<google_id_token>",
  "userType": "guest"
}
```

All auth responses return:

```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id", "name", "email", "role" }
}
```

---

### Store — `/api/store` (Public)

| Method | Endpoint           | Auth       | Description                           |
| ------ | ------------------ | ---------- | ------------------------------------- |
| GET    | `/houses`          | Public     | Get all available houses with filters |
| GET    | `/houses/:houseId` | Public     | Get single house details              |
| GET    | `/favourites`      | Guest/Host | Get logged-in user's favourites       |
| POST   | `/favourites`      | Guest/Host | Toggle favourite (add or remove)      |

**GET /houses query params:**

```
location    string    partial case-insensitive match
minPrice    number    minimum price per day
maxPrice    number    maximum price per day
amenities   string    comma-separated: wifi,ac,parking
page        number    default: 1
limit       number    default: 10, max: 20
```

**GET /houses response:**

```json
{
  "success": true,
  "houses": [...],
  "pagination": {
    "total": 18,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

Only houses with `isAvailable: true` are returned.

---

### Host — `/api/host` (Host only)

All routes require `Authorization: Bearer <token>` with `userType: host`.

| Method | Endpoint           | Description                            |
| ------ | ------------------ | -------------------------------------- |
| GET    | `/houses`          | Get all houses owned by logged-in host |
| POST   | `/houses`          | Add a new house listing                |
| DELETE | `/houses/:houseId` | Delete own house                       |

**POST /houses — multipart/form-data:**

```
name          string    required, max 100 chars
price         number    required, 400-1000
location      string    required, max 200 chars
description   string    required, 20-1000 chars
amenities     string    comma-separated or array
photos        file      1-2 images, max 2MB each (jpg/jpeg/png)
```

Deleting a house:

- Removes images from Cloudinary
- Cascades deletes all related Favourites (via Mongoose pre-hook)
- Does not cancel active bookings (frontend should handle UX)

---

### Bookings — `/api/bookings`

| Method | Endpoint             | Auth  | Description                     |
| ------ | -------------------- | ----- | ------------------------------- |
| POST   | `/`                  | Guest | Create booking request          |
| GET    | `/my`                | Guest | Get own bookings                |
| PATCH  | `/:bookingId/cancel` | Guest | Cancel a pending booking        |
| GET    | `/host`              | Host  | Get all bookings for own houses |
| PATCH  | `/:bookingId/status` | Host  | Confirm or reject a booking     |

**POST / body:**

```json
{
  "houseId": "...",
  "checkIn": "2026-03-26",
  "checkOut": "2026-03-29",
  "guests": 2,
  "message": "Looking forward to the stay!"
}
```

**Date rules (IST — UTC+5:30):**

- Check-in: minimum today, maximum 1 month from today
- Check-out: minimum check-in + 1 day, maximum check-in + 10 days
- Maximum stay: 10 nights

**Booking guards:**

- Guest cannot book their own house
- House must have `isAvailable: true`
- Only confirmed bookings block new requests — multiple guests can send pending requests for same dates
- Same guest cannot send duplicate pending requests for overlapping dates on same house
- When host confirms a booking, all other pending requests for overlapping dates are auto-rejected
- Pending bookings whose check-in date has passed are auto-cancelled (lazy expiry — no cron job)

**PATCH /:bookingId/status body (host only):**

```json
{ "status": "confirmed" }
```

or

```json
{ "status": "rejected" }
```

Only `pending` bookings can be updated.

**GET /my response — hostContact exposed only on confirmed bookings:**

```json
{
  "status": "confirmed",
  "hostContact": {
    "name": "Amit",
    "email": "amit@test.com"
  }
}
```

---

### Admin — `/api/admin` (Admin only)

All routes require `Authorization: Bearer <token>` with `userType: admin`.

| Method | Endpoint           | Description                    |
| ------ | ------------------ | ------------------------------ |
| GET    | `/stats`           | Platform stats                 |
| GET    | `/bookings`        | All bookings with pagination   |
| DELETE | `/houses/:houseId` | Delete any house platform-wide |

**GET /stats response:**

```json
{
  "totalMembers": 23,
  "totalHosts": 9,
  "totalGuests": 13,
  "totalHouses": 18,
  "totalBookings": 1,
  "recentUsers": [...]
}
```

**GET /bookings query params:**

```
status    pending | confirmed | rejected | cancelled
page      number
limit     number
```

Admin delete also removes Cloudinary images.

---

## Auth Flow

All protected routes use the `protect` middleware which:

1. Reads `Authorization: Bearer <token>` header
2. Verifies JWT against `JWT_SECRET`
3. Fetches the real user from DB using `decoded.id`
4. Attaches user to `req.user`

Role restriction uses `restrictTo(...roles)` middleware applied at the route level in `app.js`:

```js
app.use("/api/host", protect, restrictTo(ROLES.HOST), hostRoutes);
app.use("/api/admin", protect, restrictTo(ROLES.ADMIN), adminRoutes);
```

Booking routes apply `protect` and `restrictTo` per-route since the same prefix serves both guests and hosts.

---

## Admin Setup

Admin is a real DB user with `userType: "admin"`. To seed:

```js
node seed-admin.js
```

This creates the admin user defined in `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`). Run once on fresh deployment.

---

## Error Handling

All errors go through the global `errorHandler` middleware.

Operational errors (known, intentional):

```js
throw new AppError("House not found", 404);
```

Returns the exact message and status to the client.

Unexpected errors (bugs, DB crashes):

- Development: returns message and stack trace
- Production: returns generic "Internal Server Error"

---

## Key Business Rules

- House price must be between 400 and 1000 per day
- House photos: minimum 1, maximum 2, max 2MB each
- Max booking advance: 2 months from today (IST)
- Max stay: 10 nights
- Only pending bookings can be cancelled or updated
- Host contact (name + email) is only visible to guest after booking is confirmed
- Deleting a house removes it from all users' favourites automatically
- Houses with `isAvailable: false` are hidden from public listing

---

## Future Features to Consider for version 3

- Review system — guest can rate a house after a completed stay
- `isAvailable` toggle endpoint for host to temporarily hide a listing
- Phone number field on User model for better host contact
- Token blacklisting for proper server-side logout
- Email notifications on booking status change
- Refresh token flow for longer sessions
