# EventPulse API

An event management API built with Node.js, Express, and MongoDB. Manage events, users, messaging, and real-time features with JWT authentication.

## Quick Start

### What you need

- Node.js (v14+)
- MongoDB
- npm

### Setup

```bash
# Clone and install
git clone <repository-url>
cd Deci_project-l4-s2
npm install

# Create .env file
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eventpulse
JWT_SECRET=your-secret-key

# Run dev server
npm run dev
```

Server runs on http://localhost:5000
deploment link : https://30907211303077-event-pulse.vercel.app
## What's Built In

- Events - Create/read/update/delete events
- Users - Register and manage users
- Categories - Organize events by category
- Messages - Send messages between users
- Real-time updates with Socket.IO
- JWT authentication
- Role-based access (admin/user)
- Input validation & error handling

## Tech Stack

- **Express.js** - Web framework
- **MongoDB & Mongoose** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Socket.IO** - Real-time features
- **Jest** - Testing

## API Endpoints

**Base URL:** `http://localhost:5000`

### Auth

- `POST /login` - Login
- `POST /signup` - Sign up

### Events

- `GET /events` - Get all
- `GET /events/:id` - Get one
- `POST /events` - Create (admin)
- `PUT /events/:id` - Update (admin)
- `DELETE /events/:id` - Delete (admin)

### Users

- `GET /user` - Get all
- `GET /user/:id` - Get one
- `POST /user` - Create
- `PUT /user/:id` - Update
- `DELETE /user/:id` - Delete

### Categories

- `GET /category` - Get all
- `POST /category` - Create (admin)
- `PUT /category/:id` - Update (admin)
- `DELETE /category/:id` - Delete (admin)

### Messages

- `GET /messages` - Get all
- `POST /messages` - Send
- `PUT /messages/:id` - Update
- `DELETE /messages/:id` - Delete

### Registration

- `POST /regstration` - Register new user

## Authentication

Login to get a JWT token, then include it in requests:

```bash
Authorization: Bearer <your-token>
```

All protected routes need this header.

## Authorization

Two roles: **admin** and **user**

- Admins can create/update/delete events and categories
- Users can view and use features

## Database

MongoDB stores:

- **Users** - name, email, password, role
- **Events** - title, description, date, location, category, creator, attendees
- **Categories** - name, description
- **Messages** - sender, recipient, content, eventId, read status
- **Registrations** - username, email, password, status

## Real-time (Socket.IO)

Connect with your JWT token:

```javascript
const socket = io("http://localhost:5000", {
  auth: { token: "your-token" },
});

// Join an event room
socket.emit("joinRoom", { eventId: "123" });

// Leave an event room
socket.emit("leaveRoom", { eventId: "123" });
```

Get real-time updates when events or messages change.

## Testing

```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

Tests check API endpoints, error handling, and async functions.

## Scripts

```bash
npm run dev          # Start dev server (auto-reload)
npm start            # Start production server
npm test             # Run tests
npm run test:watch   # Tests in watch mode
npm run test:coverage # Coverage report
```

## Error Handling

All errors return:

```json
{
  "statusCode": 400,
  "message": "Error description"
}
```

## Deployment

Deploy to Vercel:

1. Connect GitHub repo to Vercel
2. Set environment variables
3. Deploy

**Environment variables needed:**

- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV=production`

## Folder Structure

```
├── controller/      - Route handlers
├── models/         - Database schemas
├── routes/         - API routes
├── middleware/     - Auth & validation
├── db/            - Database config
├── utils/         - Helper functions
├── test/          - Tests
└── app.js         - Main app
```

## Health Check

```bash
GET /health/detailed
```

Returns server and database status.

---

**Version:** 1.0.0  
**License:** ISC
