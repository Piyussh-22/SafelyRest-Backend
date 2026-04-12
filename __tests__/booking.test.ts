import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import { Booking } from "../src/models/booking.js";
import { House } from "../src/models/house.js";
import User from "../src/models/user.js";
import { beforeAll, afterAll, describe, it, expect } from "@jest/globals";

let mongoServer;
let guestToken;
let hostToken;
let houseId;
let bookingId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const guestRes = await request(app).post("/api/auth/signup").send({
    firstName: "Guest",
    email: "guest@test.com",
    password: "123456",
    confirmPassword: "123456",
    userType: "guest",
  });
  guestToken = guestRes.body.token;

  const hostRes = await request(app).post("/api/auth/signup").send({
    firstName: "Host",
    email: "host@test.com",
    password: "123456",
    confirmPassword: "123456",
    userType: "host",
  });
  hostToken = hostRes.body.token;

  // @ts-ignore
  const host = await User.findOne({ email: "host@test.com" });
  // @ts-ignore
  const guest = await User.findOne({ email: "guest@test.com" });

  const house = await House.create({
    name: "Test House",
    price: 500,
    location: "Mumbai",
    description: "A nice place to stay for testing purposes only",
    photos: ["http://example.com/photo.jpg"],
    owner: host._id,
  });
  houseId = house._id.toString();

  // Create booking directly to avoid transaction issue
  const booking = await Booking.create({
    guest: guest._id,
    house: house._id,
    checkIn: new Date("2027-06-01"),
    checkOut: new Date("2027-06-05"),
    guests: 2,
    totalPrice: 2000,
    status: "pending",
  });
  bookingId = booking._id.toString();
}, 15000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 15000);

describe("POST /api/bookings", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).post("/api/bookings").send({});
    expect(res.statusCode).toBe(401);
  });

  it("should return 403 if host tries to book", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${hostToken}`)
      .send({
        houseId,
        checkIn: "2027-07-01",
        checkOut: "2027-07-05",
        guests: 2,
      });
    expect(res.statusCode).toBe(403);
  });
});

describe("GET /api/bookings/my", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/bookings/my");
    expect(res.statusCode).toBe(401);
  });

  it("should return guest bookings", async () => {
    const res = await request(app)
      .get("/api/bookings/my")
      .set("Authorization", `Bearer ${guestToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("GET /api/bookings/host", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/bookings/host");
    expect(res.statusCode).toBe(401);
  });

  it("should return host bookings", async () => {
    const res = await request(app)
      .get("/api/bookings/host")
      .set("Authorization", `Bearer ${hostToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("PATCH /api/bookings/:bookingId/cancel", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).patch(`/api/bookings/${bookingId}/cancel`);
    expect(res.statusCode).toBe(401);
  });

  it("should cancel a booking as guest", async () => {
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${guestToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
