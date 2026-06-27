require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const videoRoutes = require("./routes/videoRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_ORIGIN
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, service: "socially-approved-backend" });
});

app.use("/api", videoRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server listening on http://localhost:${PORT}`);
  });
});
