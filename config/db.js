const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`connection established : ${mongoose.connection.name}`);
  } catch (err) {
    console.error("connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
