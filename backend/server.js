import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

// Routes
import userRoutes from "./routes/userRoute.js";
import progressRoutes from "./routes/progressRoute.js";
import requestRoutes from "./routes/requestRoute.js";
import chatRoutes from "./routes/chatRoute.js";

// Socket setup
import { setupSocket } from "./socket/socket.js";

// === CORS configuration ===
// Allow frontends you're developing from. Extend array if you have multiple origins (e.g., Vite dev on 5173).
const allowedOrigins = ["http://localhost:3000"]; // add "http://localhost:5173" if needed

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // if you use cookies or authentication requiring credentials
  })
);

app.use('/uploads', express.static('uploads'));

// Body parsing
app.use(express.json());

// Socket.IO with matching CORS config
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize socket logic
setupSocket(io);

// Connect to DB
connectDB(); // Connect to MongoDB

// API routes
app.use("/api/users", userRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/chat", chatRoutes);

// Health check / root
app.get("/", (req, res) => {
  res.send("Welcome to the Backend Server!");
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server with Socket.io running on http://localhost:${PORT}`);
});
console.log("Database connected successfully");
