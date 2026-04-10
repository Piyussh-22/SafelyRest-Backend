import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";

let mongoServer;

/*
This test files have the following tests 

Invalid login → 401
Successful signup → 201 with token
Duplicate email → 409
Successful login → 200 with token
Logout → 200

*/
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("POST /api/auth/login", () => {
  it("should return 401 for invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "fake@test.com", password: "wrongpassword" });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/auth/signup", () => {
  it("should signup successfully", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      firstName: "Test",
      email: "test@test.com",
      password: "123456",
      confirmPassword: "123456",
      userType: "guest",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it("should return 409 for duplicate email", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      firstName: "Test",
      email: "test@test.com",
      password: "123456",
      confirmPassword: "123456",
      userType: "guest",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/auth/login", () => {
  it("should login successfully with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@test.com", password: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });
});

describe("POST /api/auth/logout", () => {
  it("should logout successfully", async () => {
    const res = await request(app).post("/api/auth/logout");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
