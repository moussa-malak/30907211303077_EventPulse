const request = require("supertest");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const mockUserModel = {
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

jest.mock("mongoose", () => {
  const actual = jest.requireActual("mongoose");
  return {
    ...actual,
    connect: jest.fn(() => Promise.resolve({ connection: { readyState: 1 } })),
    connection: { readyState: 1 },
    model: jest.fn(() => mockUserModel),
  };
});

dotenv.config();
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";
process.env.EXPIRES_IN = process.env.EXPIRES_IN || "1h";
process.exit = process.exit || (() => {});
process.exits = process.exits || process.exit.bind(process);

jest.setTimeout(50000);

const app = require("../app");

const user = {
  _id: "507f1f77bcf86cd799439011",
  email: "test@example.com",
  role: "admin",
};

const token = jwt.sign(
  { id: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.EXPIRES_IN },
);

const authHeader = { authorization: `Bearer ${token}` };

beforeEach(() => {
  jest.clearAllMocks();
  mockUserModel.find.mockReset();
  mockUserModel.findById.mockReset();
  mockUserModel.create.mockReset();
  mockUserModel.findByIdAndUpdate.mockReset();
  mockUserModel.findByIdAndDelete.mockReset();
});

afterAll(async () => {
  try {
    if (app && typeof app.close === "function") {
      await new Promise((resolve, reject) => {
        app.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
  } catch (error) {
    // Ignore server shutdown errors during test teardown.
  }

  try {
    if (mongoose.disconnect) {
      await mongoose.disconnect();
    }
    if (
      mongoose.connection &&
      typeof mongoose.connection.close === "function"
    ) {
      await mongoose.connection.close();
    }
  } catch (error) {
    // Ignore teardown errors during test shutdown.
  }

  jest.clearAllMocks();
});

describe("User API integration tests with mocked database", () => {
  it("GET /user returns 200 and a list of users", async () => {
    const users = [
      { _id: "1", name: "moussa", email: "moussa@example.com", role: "admin" },
      { _id: "2", name: "ali", email: "ali@example.com", role: "user" },
    ];

    mockUserModel.find.mockResolvedValue(users);

    const res = await request(app).get("/user").set(authHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockUserModel.find).toHaveBeenCalled();
  });

  it("POST /user creates a user and returns 201", async () => {
    const createdUser = {
      _id: "507f1f77bcf86cd799439012",
      name: "moussa",
      email: "moussa@example.com",
      password: "123456789",
      role: "admin",
    };

    mockUserModel.create.mockResolvedValue(createdUser);

    const res = await request(app).post("/user").set(authHeader).send({
      name: "moussa",
      email: "moussa@example.com",
      password: "123456789",
      role: "admin",
    });

    expect(res.status).toBe(201);
    expect(mockUserModel.create).toHaveBeenCalled();
  });

  it("PUT /user/:id updates an existing user", async () => {
    const updatedUser = {
      _id: "507f1f77bcf86cd799439013",
      name: "moussa malak",
      email: "moussamak@gmail.com",
      role: "admin",
    };

    mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

    const res = await request(app)
      .put("/user/507f1f77bcf86cd799439013")
      .set(authHeader)
      .send({ name: "moussa malak" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("moussa malak");
    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  it("DELETE /user/:id deletes an existing user", async () => {
    const deletedUser = {
      _id: "507f1f77bcf86cd799439014",
      name: "moussa7",
      email: "moussamak2@gmail.com",
      role: "admin",
    };

    mockUserModel.findByIdAndDelete.mockResolvedValue(deletedUser);

    const res = await request(app)
      .delete("/user/507f1f77bcf86cd799439014")
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(mockUserModel.findByIdAndDelete).toHaveBeenCalled();
  });

  it("returns 404 when trying to update a non-existing user", async () => {
    mockUserModel.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .put("/user/non-existing-id")
      .set(authHeader)
      .send({ name: "Test" });

    expect(res.status).toBe(404);
  });

  it("returns 404 when trying to delete a non-existing user", async () => {
    mockUserModel.findByIdAndDelete.mockResolvedValue(null);

    const res = await request(app)
      .delete("/user/non-existing-id")
      .set(authHeader);

    expect(res.status).toBe(404);
  });
});
