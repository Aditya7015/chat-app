import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Server } from "socket.io";
import http from "http";
import User from "./models/User.js";
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/chatapp");

// JWT middleware
function auth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Auth routes
app.post("/auth/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();
  res.json({ message: "User registered" });
});

app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.sendStatus(404);
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.sendStatus(401);
  const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET || "secret");
  res.json({ token });
});

// Users list
app.get("/users", auth, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user.id } });
  res.json(users);
});

// Conversation messages
app.get("/conversations/:id/messages", auth, async (req, res) => {
  const messages = await Message.find({ conversationId: req.params.id });
  res.json(messages);
});

// --- Socket.IO ---
io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("message:send", async (data) => {
    const { conversationId, senderId, text } = data;
    const msg = new Message({ conversationId, senderId, text, read: false });
    await msg.save();
    io.to(conversationId).emit("message:new", msg);
  });

  socket.on("typing:start", (data) => {
    io.to(data.conversationId).emit("typing:start", data);
  });

  socket.on("typing:stop", (data) => {
    io.to(data.conversationId).emit("typing:stop", data);
  });

  socket.on("message:read", async (msgId) => {
    await Message.findByIdAndUpdate(msgId, { read: true });
  });

  socket.on("join", (conversationId) => {
    socket.join(conversationId);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
