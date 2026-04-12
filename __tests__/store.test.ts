import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import { beforeAll, afterAll, describe, it, expect } from "@jest/globals";

let mongoServer;
let token;
let houseId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create a user and get token
  const res = await request(app).post("/api/auth/signup").send({
    firstName: "Test",
    email: "guest@test.com",
    password: "123456",
    confirmPassword: "123456",
    userType: "guest",
  });
  token = res.body.token;

  // Create a house directly in DB for testing
  const { House } = await import("../src/models/house.js");
  const owner = new mongoose.Types.ObjectId();
  const house = await House.create({
    name: "Test House",
    price: 500,
    location: "Delhi",
    description: "A nice place to stay for testing purposes only",
    photos: ["http://example.com/photo.jpg"],
    owner,
  });
  houseId = house._id.toString();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("GET /api/store/houses", () => {
  it("should return list of houses", async () => {
    const res = await request(app).get("/api/store/houses");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.houses)).toBe(true);
  });
});

describe("GET /api/store/houses/:houseId", () => {
  it("should return house details", async () => {
    const res = await request(app).get(`/api/store/houses/${houseId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should return 404 for invalid houseId", async () => {
    const res = await request(app).get(
      `/api/store/houses/000000000000000000000000`,
    );
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/store/houses/:houseId/availability", () => {
  it("should return availability", async () => {
    const res = await request(app)
      .get(`/api/store/houses/${houseId}/availability`)
      .query({ checkIn: "2026-06-01", checkOut: "2026-06-05" });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("GET /api/store/favourites", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/store/favourites");
    expect(res.statusCode).toBe(401);
  });

  it("should return favourites with valid token", async () => {
    const res = await request(app)
      .get("/api/store/favourites")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("POST /api/store/favourites", () => {
  it("should add house to favourites", async () => {
    const res = await request(app)
      .post("/api/store/favourites")
      .set("Authorization", `Bearer ${token}`)
      .send({ houseId });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should return 401 without token", async () => {
    const res = await request(app)
      .post("/api/store/favourites")
      .send({ houseId });
    expect(res.statusCode).toBe(401);
  });
});
