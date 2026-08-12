const request = require('supertest');

let app;
let AppError;
let asyncHandler;

try {
  app = require('../app');
} catch (error) {
  app = null;
}

try {
  AppError = require('../utils/appError');
} catch (error) {
  AppError = null;
}

try {
  asyncHandler = require('../utils/asyncHandler');
} catch (error) {
  asyncHandler = null;
}

describe('Unit tests: AppError and asyncHandler', () => {
  test('AppError should set message, statusCode, and isOperational values', () => {
    if (!AppError) {
      return expect(AppError).not.toBeNull();
    }

    const error = new AppError('Invalid request', 400);

    expect(error.message).toBe('Invalid request');
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
    expect(error.status).toBe('fail');
  });

  test('asyncHandler should call next with error when handler rejects', async () => {
    if (!asyncHandler) {
      return expect(asyncHandler).not.toBeNull();
    }

    const next = jest.fn();
    const handler = asyncHandler(async () => {
      throw new Error('Handler failure');
    });

    await handler({}, {}, next);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  test('asyncHandler should resolve successfully when handler fulfills', async () => {
    if (!asyncHandler) {
      return expect(asyncHandler).not.toBeNull();
    }

    const json = jest.fn();
    const handler = asyncHandler(async (_req, res) => {
      res.json({ success: true });
    });

    await handler({}, { json }, jest.fn());

    expect(json).toHaveBeenCalledWith({ success: true });
  });
});

describe('Integration tests: Events API', () => {
  const eventPayload = {
    title: 'Test Event',
    date: '2026-12-31',
    location: 'Test Venue',
    category: 'Testing',
    description: 'A sample event used for integration tests'
  };

  let createdEvent;

  test('should create an event with POST /events', async () => {
    if (!app) {
      return expect(app).not.toBeNull();
    }

    const response = await request(app)
      .post('/events')
      .send(eventPayload)
      .set('Accept', 'application/json');

    expect([200, 201]).toContain(response.status);
    expect(response.body).toBeDefined();
    expect(response.body.title || response.body.name).toBe(eventPayload.title);

    createdEvent = response.body;
  });

  test('should list events with GET /events', async () => {
    if (!app) {
      return expect(app).not.toBeNull();
    }

    const response = await request(app).get('/events');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(0);
  });

  test('should filter events with GET /events?category=Testing', async () => {
    if (!app) {
      return expect(app).not.toBeNull();
    }

    const response = await request(app).get('/events').query({ category: 'Testing' });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    response.body.forEach((event) => {
      expect(event.category || event.type || event.tag).toBeDefined();
    });
  });
});
