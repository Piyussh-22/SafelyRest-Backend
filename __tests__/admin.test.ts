import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import { beforeAll, afterAll, describe, it, expect } from "@jest/globals";

let mongoServer;
let adminToken;
let guestToken;
let houseId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create admin directly in DB since signup doesn't allow admin role
  const User = (await import("../src/models/user.js")).default;
  const bcrypt = (await import("bcryptjs")).default;
  const { signToken } = await import("../src/utils/token.js");

  const hashedPassword = await bcrypt.hash("123456", 12);
  // @ts-ignore
  const admin = await User.create({
    firstName: "Admin",
    email: "admin@test.com",
    password: hashedPassword,
    userType: "admin",
  });
  adminToken = signToken(admin);

  const guestRes = await request(app).post("/api/auth/signup").send({
    firstName: "Guest",
    email: "guest@test.com",
    password: "123456",
    confirmPassword: "123456",
    userType: "guest",
  });
  guestToken = guestRes.body.token;

  const { House } = await import("../src/models/house.js");
  const house = await House.create({
    name: "House to Delete",
    price: 500,
    location: "Chennai",
    description: "A nice place to stay for testing purposes only",
    photos: ["http://example.com/photo.jpg"],
    owner: admin._id,
  });
  houseId = house._id.toString();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("GET /api/admin/stats", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/admin/stats");
    expect(res.statusCode).toBe(401);
  });

  it("should return 403 for guest", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${guestToken}`);
    expect(res.statusCode).toBe(403);
  });

  it("should return stats for admin", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("GET /api/admin/bookings", () => {
  it("should return all bookings for admin", async () => {
    const res = await request(app)
      .get("/api/admin/bookings")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

/*
describe("DELETE /api/admin/houses/:houseId", () => {
  it("should delete a house as admin", async () => {
    const res = await request(app)
      .delete(`/api/admin/houses/${houseId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
*/
