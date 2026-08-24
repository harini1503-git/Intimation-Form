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

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/submit", submitRouter);

/* Serve index.html dynamically with .env vars injected BEFORE
   express.static can intercept the request and serve the raw file */
const fs = require("fs");
const indexTemplate = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

function serveIndex(_req, res) {
  const injected = indexTemplate.replace(
    "<!-- ENV_INJECT -->",
    `<script>
window.EMAILJS_CONFIG = {
  publicKey:      "${process.env.EMAILJS_PUBLIC_KEY      || ""}",
  serviceId:      "${process.env.EMAILJS_SERVICE_ID      || ""}",
  templateId:     "${process.env.EMAILJS_TEMPLATE_ID     || ""}",
  userTemplateId: "${process.env.EMAILJS_USER_TEMPLATE_ID || ""}"
};
</script>`
  );
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(injected);
}

app.get("/", serveIndex);
app.get("/index.html", serveIndex);

/* Static assets (css, js, images, etc.) — index:false so express.static
   never serves index.html and our dynamic route always wins */
app.use(express.static(__dirname, { index: false }));

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
