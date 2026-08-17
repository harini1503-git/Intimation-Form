const mongoose = require("mongoose");

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to your .env file (see .env.example)."
    );
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);
  console.log("MongoDB connected successfully.");
}

module.exports = { connectDatabase };
