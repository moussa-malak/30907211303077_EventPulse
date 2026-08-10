const express = require('express');
const request = require('supertest');

// Helper that creates an app with the registration route.
// The business logic is mocked so the API can be tested in isolation.
function createApp(registerUser = jest.fn()) {
  const app = express();

  app.use(express.json());

  app.post('/register', async (req, res) => {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const user = await registerUser({ name, email, password });
      return res.status(201).json({
        message: 'User registered successfully',
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (error) {
      return res.status(400).json({ message: error.message || 'Registration failed' });
    }
  });

  return app;
}

describe('POST /register', () => {
  test('registers a new user successfully', async () => {
    const registerUser = jest.fn().mockResolvedValue({
      id: '123',
      name: 'Moussa',
      email: 'moussa@example.com',
    });

    const app = createApp(registerUser);

    const response = await request(app)
      .post('/register')
      .send({
        name: 'Moussa',
        email: 'moussa@example.com',
        password: 'secret123',
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
    expect(response.body.user).toEqual({
      id: '123',
      name: 'Moussa',
      email: 'moussa@example.com',
    });

    expect(registerUser).toHaveBeenCalledWith({
      name: 'Moussa',
      email: 'moussa@example.com',
      password: 'secret123',
    });
  });

  test('returns 400 when required fields are missing', async () => {
    const registerUser = jest.fn();
    const app = createApp(registerUser);

    const response = await request(app).post('/register').send({
      name: 'Moussa',
      email: 'moussa@example.com',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Missing required fields');
    expect(registerUser).not.toHaveBeenCalled();
  });

  test('returns 400 when registration service rejects', async () => {
    const registerUser = jest.fn().mockRejectedValue(new Error('Email already exists'));
    const app = createApp(registerUser);

    const response = await request(app).post('/register').send({
      name: 'Moussa',
      email: 'existing@example.com',
      password: 'secret123',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email already exists');
    expect(registerUser).toHaveBeenCalledTimes(1);
  });
});
