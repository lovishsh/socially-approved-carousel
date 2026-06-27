// Loads backend/data/dummyVideos.json into MongoDB.
// Run with: npm run seed
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");
const Video = require("./models/Video");

async function seed() {
  await connectDB();

  const dataPath = path.join(__dirname, "data", "dummyVideos.json");
  const videos = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  const existing = await Video.countDocuments();
  if (existing > 0) {
    console.log(
      `[seed] collection already has ${existing} videos. Dropping before reseeding...`
    );
    await Video.deleteMany({});
  }

  await Video.insertMany(videos);
  console.log(`[seed] inserted ${videos.length} videos`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
