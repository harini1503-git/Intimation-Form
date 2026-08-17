require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDatabase } = require("./config/database");
const submitRouter = require("./routes/submit");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins and custom headers
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Idempotency-Key"],
    exposedHeaders: ["X-Idempotency-Key"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/submit", submitRouter);

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();
