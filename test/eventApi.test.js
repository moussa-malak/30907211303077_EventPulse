jest.mock("../models/eventModules.js", () => ({
  getAllEvents: jest.fn(),
  createEvent: jest.fn(),
  getEventById: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app.js");
const event = require("../models/eventModules.js");

const server = app && typeof app.close === "function" ? app : null;

describe("Event API", () => {
  const validToken = "valid-token";

  afterAll(async () => {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();

    jwt.verify.mockImplementation((token, secret, callback) => {
      if (token === validToken) {
        const payload = { id: 1, role: "admin" };

        if (typeof callback === "function") {
          callback(null, payload);
          return payload;
        }

        return payload;
      }

      const error = new Error("Invalid token");

      if (typeof callback === "function") {
        callback(error);
        return undefined;
      }

      throw error;
    });
  });

  it("should reject request without a token", async () => {
    const res = await request(app).get("/events");

    expect(res.status).toBe(401);
  });

  it("should return all events for an authenticated user", async () => {
    event.getAllEvents.mockResolvedValue([
      { id: 1, title: "Hackathon", date: "2025-08-20" },
      { id: 2, title: "Workshop", date: "2025-08-22" },
    ]);

    const res = await request(app)
      .get("/events")
      .set("Authorization", `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(jwt.verify).toHaveBeenCalled();
    expect(event.getAllEvents).toHaveBeenCalled();
  });

  it("should create a new event when authenticated", async () => {
    const newEvent = {
      id: 3,
      title: "Conference",
      date: "2025-09-10",
      location: "Tunis",
    };

    event.createEvent.mockResolvedValue(newEvent);

    const res = await request(app)
      .post("/events")
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        title: "Conference",
        date: "2025-09-10",
        location: "Tunis",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("title", "Conference");
    expect(event.createEvent).toHaveBeenCalled();
  });

  it("should reject invalid token requests", async () => {
    const res = await request(app)
      .get("/events")
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
  });
});
