const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const app = express();
dotenv.config();

const PORT = process.env.PORT;
const seed = require("./seed");
const connectDB = require("./db/connect");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const messageRoutes = require("./routes/messageRoutes");
const loginRoutes = require("./routes/loginRoutes");
const signUpRoutes = require("./routes/signUpRoutes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);
app.use("/events", eventRoutes);
app.use("/category", categoryRoutes);
app.use("/messages", messageRoutes);
app.use("/login", loginRoutes);
app.use("/signup", signUpRoutes);

const server = http.createServer(app);
const io = new Server(server, {
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
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

io.on("connection", (socket) => {
  const user = authenticateSocket(socket);
  console.log("Socket connected:", socket.id);

  socket.on("joinRoom", ({ eventId }) => {
    if (!user || !eventId) return;
    socket.join(eventId.toString());
    console.log(`Socket ${socket.id} joined event room ${eventId}`);
  });

  socket.on("leaveRoom", ({ eventId }) => {
    if (!eventId) return;
    socket.leave(eventId.toString());
    console.log(`Socket ${socket.id} left event room ${eventId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

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
