const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const morgan = require("morgan");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const errhandeler = require("./utils/errorHandeler");
let Server = null;

try {
  ({ Server } = require("socket.io"));
} catch (error) {
  console.warn(
    "Socket.IO is not available. Realtime features will be disabled.",
  );
}

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "eventpulse-dev-secret";
const seed = require("./seed");
const connectDB = require("./db/connect");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const messageRoutes = require("./routes/messageRoutes");
const regstrationRoutes = require("./routes/regstrationRoutes");
const loginRoutes = require("./routes/loginRoutes");
const signUpRoutes = require("./routes/signUpRoutes");

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // clear and colorful in development
} else {
  app.use(morgan("combined")); // full and detailed in production
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/health/detailed", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV,
    uptime: `${Math.floor(process.uptime())} seconds`,
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api-docs", (req, res) => {
  res.status(200).json({
    message: "EventPulse API docs are available in the project documentation.",
    endpoints: [
      "/user",
      "/events",
      "/category",
      "/messages",
      "/login",
      "/signup",
    ],
  });
});

app.use("/user", userRoutes);
app.use("/events", eventRoutes);
app.use("/category", categoryRoutes);
app.use("/regstration", regstrationRoutes);
app.use("/messages", messageRoutes);
app.use("/login", loginRoutes);
app.use("/signup", signUpRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal server error",
  });
});
app.get("/health/db", async (req, res) => {
  try {
    await connectDB();

    res.json({
      database: "connected",
      readyState: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({
      database: "disconnected",
      error: error.message
    });
  }
});
app.use(errhandeler);
const server = http.createServer(app);
let io = null;

if (Server) {
  io = new Server(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
    },
  });

  app.set("io", io);

  const authenticateSocket = (socket) => {
    const authHeader = socket.handshake.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  };

  io.on("connection", (socket) => {
    const user = authenticateSocket(socket);
    console.log("Socket connected:", socket.id);

    if (!user) {
      socket.emit("auth_error", { message: "Unauthorized socket connection" });
      socket.disconnect(true);
      return;
    }

    socket.on("joinRoom", ({ eventId }) => {
      if (!eventId) {
        socket.emit("room_error", { message: "Event ID is required" });
        return;
      }

      socket.join(eventId.toString());
      console.log(`Socket ${socket.id} joined event room ${eventId}`);
    });

    socket.on("leaveRoom", ({ eventId }) => {
      if (!eventId) {
        socket.emit("room_error", { message: "Event ID is required" });
        return;
      }

      socket.leave(eventId.toString());
      console.log(`Socket ${socket.id} left event room ${eventId}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
} else {
  app.set("io", null);
}

const startServer = async () => {
  try {
    await connectDB();
    await seed();
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("db connection faild");
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
