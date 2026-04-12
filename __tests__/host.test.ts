import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import { House } from "../src/models/house.js";
import User from "../src/models/user.js";
import { beforeAll, afterAll, describe, it, expect } from "@jest/globals";

let mongoServer;
let hostToken;
let guestToken;
let houseId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const hostRes = await request(app).post("/api/auth/signup").send({
    firstName: "Host",
    email: "host@test.com",
    password: "123456",
    confirmPassword: "123456",
    userType: "host",
  });
  hostToken = hostRes.body.token;

  const guestRes = await request(app).post("/api/auth/signup").send({
    firstName: "Guest",
    email: "guest@test.com",
    password: "123456",
    confirmPassword: "123456",
    userType: "guest",
  });
  guestToken = guestRes.body.token;

  // Create house directly in DB to avoid Cloudinary
  // @ts-ignore
  const host = await User.findOne({ email: "host@test.com" });
  const house = await House.create({
    name: "My House",
    price: 500,
    location: "Delhi",
    description: "A nice place to stay for testing purposes only",
    photos: ["http://example.com/photo.jpg"],
    capacity: 4,
    owner: host._id,
  });
  houseId = house._id.toString();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("GET /api/host/houses", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/host/houses");
    expect(res.statusCode).toBe(401);
  });

  it("should return 403 for guest", async () => {
    const res = await request(app)
      .get("/api/host/houses")
      .set("Authorization", `Bearer ${guestToken}`);
    expect(res.statusCode).toBe(403);
  });

  it("should return host houses", async () => {
    const res = await request(app)
      .get("/api/host/houses")
      .set("Authorization", `Bearer ${hostToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("DELETE /api/host/houses/:houseId", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).delete(`/api/host/houses/${houseId}`);
    expect(res.statusCode).toBe(401);
  });

  it("should delete a house as host", async () => {
    const res = await request(app)
      .delete(`/api/host/houses/${houseId}`)
      .set("Authorization", `Bearer ${hostToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
