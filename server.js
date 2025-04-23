const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const app = express();
app.use(
  cors({
    origin: "https://website-one-rho-steel.vercel.app", // allow only your frontend
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json()); // for parsing application/json

// Use environment variable or fallback secret
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "e4f1b2c3d9a7e5f0c1d4b3a2f9e8d7c6b1a3e5d9f0c4b7a8e3f1d2c6b9a7e8f4c3d2b1a6f7e9d0b3c5a8f2e1d4b7c9";

// In-memory storage using base64 (for simple use-case)
const store = new Map();

// Multer setup to handle video file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Hardcoded user example (replace with DB in real app)
const USER = {
  username: "admin",
  password: "password123", // Never store plain passwords in real apps! Use hashing.
  id: "user1",
};

// Login route - returns JWT token on success
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === USER.username && password === USER.password) {
    // Create JWT payload
    const payload = { userId: USER.id, username: USER.username };

    // Sign token (expires in 1 hour)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    return res.json({ token });
  }

  return res.status(401).json({ error: "Invalid credentials" });
});

// Accept video and JSON data together
app.post("/api/push", upload.single("video"), (req, res) => {
  const id = uuidv4();
  const jsonData = JSON.parse(req.body.data);

  const videoBuffer = req.file ? req.file.buffer : null;
  const base64Video = videoBuffer?.toString("base64");

  const payload = {
    ...jsonData,
    video: base64Video,
    mimetype: req.file?.mimetype || null,
  };

  store.set(id, payload);

  res.json({ id });
});

// Fetch route: returns data + base64 video
app.get("/api/fetch/:id", (req, res) => {
  const data = store.get(req.params.id);
  if (!data) return res.status(404).json({ error: "Not found" });
  res.json(data);
});

// Root test
app.get("/", (req, res) => {
  res.send("Server is up and running. Test successful!");
});

app.listen(3000, () => console.log("Server running on port 3000"));
