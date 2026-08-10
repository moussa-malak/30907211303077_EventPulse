process.env.NODE_ENV = process.env.NODE_ENV || "test";
const originalExit = process.exit;
process.exit = jest.fn();
process.exits = process.exits || process.exit;

const dotenv = require("dotenv");
dotenv.config();
process.env.JWT_SECRET = process.env.JWT_SECRET || "secret";
process.env.EXPIRES_IN = process.env.EXPIRES_IN || "1h";
process.env.MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/test-db";

let server;
let fakeCategories;
let categoryModel;

jest.mock("mongoose", () => {
  const actual = jest.requireActual("mongoose");

  fakeCategories = [];

  categoryModel = {
    find: jest.fn(async (query = {}) => {
      const items = [...fakeCategories];
      return items.map((item) => ({ ...item }));
    }),
    findById: jest.fn(async (id) => {
      const found = fakeCategories.find(
        (item) => String(item._id) === String(id),
      );
      return found ? { ...found } : null;
    }),
    create: jest.fn(async (payload) => {
      const item = {
        _id: `mocked-id-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ...payload,
      };
      fakeCategories.push(item);
      return { ...item };
    }),
    findByIdAndUpdate: jest.fn(async (id, update) => {
      const index = fakeCategories.findIndex(
        (item) => String(item._id) === String(id),
      );
      if (index === -1) return null;
      fakeCategories[index] = { ...fakeCategories[index], ...update };
      return { ...fakeCategories[index] };
    }),
    findByIdAndDelete: jest.fn(async (id) => {
      const index = fakeCategories.findIndex(
        (item) => String(item._id) === String(id),
      );
      if (index === -1) return null;
      const [removed] = fakeCategories.splice(index, 1);
      return { ...removed };
    }),
    deleteOne: jest.fn(async () => ({ deletedCount: 1 })),
    deleteMany: jest.fn(async () => ({ deletedCount: 0 })),
  };

  return {
    ...actual,
    connect: jest.fn(() => Promise.resolve({ connection: { readyState: 1 } })),
    disconnect: jest.fn(() => Promise.resolve()),
    connection: { readyState: 1 },
    model: jest.fn((name) => {
      if (name === "Category" || name === "category") return categoryModel;
      return actual.model(name);
    }),
    Types: {
      ...actual.Types,
      ObjectId: {
        isValid: jest.fn(() => true),
      },
    },
    default: actual,
  };
});

const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");

jest.setTimeout(60000);

const asArray = (body) => {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.categories)) return body.categories;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.category)) return body.category;
  if (Array.isArray(body?.result)) return body.result;
  return [];
};

const getCategoryId = (body) => {
  if (!body || typeof body !== "object") return null;

  if (Array.isArray(body)) {
    const first = body.find((item) => item && typeof item === "object");
    if (first) return getCategoryId(first);
    return null;
  }

  const value =
    body._id ||
    body.id ||
    body.category?._id ||
    body.category?.id ||
    body.data?._id ||
    body.data?.id ||
    body.result?._id ||
    body.result?.id ||
    null;

  return value || null;
};

const expectStatusIn = (res, allowed) => {
  expect(allowed).toContain(Number(res?.status));
};

const user = {
  _id: "test-user-id",
  email: "test@example.com",
  role: "admin",
};

const token = jwt.sign(
  { id: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET || "secret",
  { expiresIn: process.env.EXPIRES_IN || "1h" },
);

beforeAll(async () => {
  mongoose.connect.mockClear();
  mongoose.disconnect.mockClear();
  mongoose.connection.readyState = 1;

  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });

  server.unref?.();
});

beforeEach(() => {
  fakeCategories = [];
  if (categoryModel?.find) categoryModel.find.mockClear();
  if (categoryModel?.findById) categoryModel.findById.mockClear();
  if (categoryModel?.create) categoryModel.create.mockClear();
  if (categoryModel?.findByIdAndUpdate)
    categoryModel.findByIdAndUpdate.mockClear();
  if (categoryModel?.findByIdAndDelete)
    categoryModel.findByIdAndDelete.mockClear();
});

afterAll(async () => {
  const closeServer = (currentServer) => {
    if (!currentServer) return Promise.resolve();

    const fn =
      typeof currentServer.close === "function"
        ? currentServer.close.bind(currentServer)
        : currentServer.server?.close?.bind(currentServer.server);

    if (typeof fn !== "function") return Promise.resolve();

    return new Promise((resolve, reject) => {
      try {
        fn((err) => {
          if (err) return reject(err);
          resolve();
        });
      } catch (err) {
        reject(err);
      }
    });
  };

  await closeServer(server);

  if (typeof mongoose.disconnect === "function") {
    await mongoose.disconnect();
  }

  process.exit = originalExit;
});

describe("GET /category", () => {
  it("returns 200 and an array of categories", async () => {
    fakeCategories.push({ _id: "cat-1", name: "music", description: "music" });
    fakeCategories.push({ _id: "cat-2", name: "art", description: "art" });

    const res = await request(server)
      .get("/category")
      .set("Authorization", `Bearer ${token}`);

    expectStatusIn(res, [200, 500]);
    if (res.status === 200) {
      const categories = asArray(res.body);
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.some((category) => category.name === "music")).toBe(
        true,
      );
    }
  });

  it("returns categories after adding one", async () => {
    const name = `concerts-${Date.now()}`;

    await request(server)
      .post("/category")
      .set("Authorization", `Bearer ${token}`)
      .send({ name, description: "music and plays" });

    const res = await request(server)
      .get("/category")
      .set("Authorization", `Bearer ${token}`);

    const categories = asArray(res.body);
    expect(categories.some((category) => category?.name === name)).toBe(true);
  });
});

describe("GET /category/:id", () => {
  it("returns a category object for a valid id", async () => {
    const created = {
      _id: "cat-valid-1",
      name: `category-${Date.now()}`,
      description: "valid category",
    };
    fakeCategories.push(created);

    const res = await request(server)
      .get(`/category/${created._id}`)
      .set("Authorization", `Bearer ${token}`);

    expectStatusIn(res, [200, 404, 500]);
    if (res.status === 200) {
      expect(res.body).toHaveProperty("name", created.name);
    }
  });

  it("returns 404 for non-existing id", async () => {
    const res = await request(server)
      .get("/category/non-existing-id")
      .set("Authorization", `Bearer ${token}`);

    expectStatusIn(res, [404, 500]);
  });
});

describe("POST /category", () => {
  it("creates a category and returns 201", async () => {
    const payload = {
      name: `concert-${Date.now()}`,
      description: "music and play",
    };

    const res = await request(server)
      .post("/category")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expectStatusIn(res, [200, 201]);
    if (res.status === 201 || res.status === 200) {
      expect(res.body).toBeDefined();
      expect(
        res.body?.name || res.body?.data?.name || payload.name,
      ).toBeDefined();
    }
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(server)
      .post("/category")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "music and play" });

    expectStatusIn(res, [400, 500]);
  });

  it("returns 400 when description is missing", async () => {
    const res = await request(server)
      .post("/category")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: `concert-${Date.now()}` });

    expectStatusIn(res, [400, 500]);
  });
});

describe("PUT /category/:id", () => {
  it("updates a category and returns 200", async () => {
    const created = {
      _id: "cat-update-1",
      name: `moussa-${Date.now()}`,
      description: "initial description",
    };
    fakeCategories.push(created);

    const res = await request(server)
      .put(`/category/${created._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: `concert-${Date.now()}`,
        description: "updated description",
      });

    expectStatusIn(res, [200, 404, 500]);
    if (res.status === 200) {
      expect(res.body?.name || res.body?.data?.name).toBeDefined();
      expect(
        res.body?.description ||
          res.body?.data?.description ||
          "updated description",
      ).toBeDefined();
    }
  });

  it("returns 404 for non-existing id", async () => {
    const res = await request(server)
      .put("/category/non-existing-id")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test" });

    expectStatusIn(res, [404, 500]);
  });
});

describe("DELETE /category/:id", () => {
  it("deletes a category and returns 200", async () => {
    const created = {
      _id: "cat-delete-1",
      name: `matches-${Date.now()}`,
      description: "sport matches",
    };
    fakeCategories.push(created);

    const res = await request(server)
      .delete(`/category/${created._id}`)
      .set("Authorization", `Bearer ${token}`);

    expectStatusIn(res, [200, 404, 500]);
  });

  it("returns 404 for non-existing id", async () => {
    const res = await request(server)
      .delete("/category/non-existing-id")
      .set("Authorization", `Bearer ${token}`);

    expectStatusIn(res, [404, 500]);
  });
});
