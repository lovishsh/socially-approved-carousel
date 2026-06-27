const express = require("express");
const router = express.Router();
const {
  getVideos,
  getVideoById,
  likeVideo,
  shareVideo,
  getComments,
  addComment,
} = require("../controllers/videoController");

router.get("/videos", getVideos);
router.get("/videos/:id", getVideoById);
router.get("/videos/:id/comments", getComments);

router.post("/like", likeVideo);
router.post("/share", shareVideo);
router.post("/comment", addComment);

module.exports = router;
