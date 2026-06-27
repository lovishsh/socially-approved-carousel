const mongoose = require("mongoose");
const Video = require("../models/Video");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

async function getVideos(req, res) {
  try {
    const guest = (req.query.guest && String(req.query.guest)) || req.ip || "anonymous";
    const videos = await Video.find().sort({ createdAt: 1 }).lean();

    const cards = videos.map((v) => ({
      id: v._id,
      title: v.title,
      description: v.description,
      videoUrl: v.videoUrl,
      thumbnailUrl: v.thumbnailUrl,
      duration: v.duration,
      author: v.author,
      likeCount: v.likeCount,
      liked: Array.isArray(v.likedBy) && v.likedBy.includes(guest),
      shareCount: v.shareCount,
      commentCount: v.comments?.length || 0,
    }));

    res.json({ count: cards.length, videos: cards });
  } catch (err) {
    console.error("getVideos", err);
    res.status(500).json({ message: "Failed to load videos" });
  }
}

async function getVideoById(req, res) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid video id" });

    const video = await Video.findById(id).lean();
    if (!video) return res.status(404).json({ message: "Video not found" });

    res.json({ video });
  } catch (err) {
    console.error("getVideoById", err);
    res.status(500).json({ message: "Failed to load video" });
  }
}

async function likeVideo(req, res) {
  try {
    const { videoId, user } = req.body;
    if (!videoId || !isValidId(videoId)) {
      return res.status(400).json({ message: "A valid videoId is required" });
    }

    const voter = (user && String(user).trim()) || req.ip || "anonymous";

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const alreadyLiked = video.likedBy.includes(voter);

    if (alreadyLiked) {
      video.likedBy = video.likedBy.filter((v) => v !== voter);
      video.likeCount = Math.max(0, video.likeCount - 1);
    } else {
      video.likedBy.push(voter);
      video.likeCount += 1;
    }

    await video.save();

    res.json({
      videoId: video._id,
      liked: !alreadyLiked,
      likeCount: video.likeCount,
    });
  } catch (err) {
    console.error("likeVideo", err);
    res.status(500).json({ message: "Failed to update like" });
  }
}

async function shareVideo(req, res) {
  try {
    const { videoId, platform, user } = req.body;
    if (!videoId || !isValidId(videoId)) {
      return res.status(400).json({ message: "A valid videoId is required" });
    }
    if (!platform) {
      return res.status(400).json({ message: "platform is required" });
    }

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    video.shares.push({ platform, user: user || "anonymous", ip: req.ip });
    video.shareCount += 1;
    await video.save();

    res.json({ videoId: video._id, shareCount: video.shareCount });
  } catch (err) {
    console.error("shareVideo", err);
    res.status(500).json({ message: "Failed to record share" });
  }
}

async function getComments(req, res) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid video id" });

    const video = await Video.findById(id).select("comments").lean();
    if (!video) return res.status(404).json({ message: "Video not found" });

    res.json({ comments: video.comments });
  } catch (err) {
    console.error("getComments", err);
    res.status(500).json({ message: "Failed to load comments" });
  }
}

async function addComment(req, res) {
  try {
    const { videoId, user, text } = req.body;
    if (!videoId || !isValidId(videoId)) {
      return res.status(400).json({ message: "A valid videoId is required" });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    video.comments.push({ user: (user || "Guest").trim(), text: text.trim() });
    await video.save();

    const newComment = video.comments[video.comments.length - 1];
    res.status(201).json({ comment: newComment, commentCount: video.comments.length });
  } catch (err) {
    console.error("addComment", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
}

module.exports = {
  getVideos,
  getVideoById,
  likeVideo,
  shareVideo,
  getComments,
  addComment,
};
